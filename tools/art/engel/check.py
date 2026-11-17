#!/usr/bin/env python3
"""Prüfskript Batch engel: Maße, Palette (≤32, indiziert), binäres Alpha, Raster/Animationen exakt wie hg_grenzwaechter,
Fußlinie, Rand, Belegung, gehaltene Ausholposen, keine doppelten Frames, nicht pixelgleich mit der Vorlage,
Türkis nur sparsam, Weiß nur als Bein-Weiß. Bericht: docs/art/batch-engel-validation.json.
Aufruf: python3 tools/art/engel/check.py [--write] [--base=<ref>]"""
import hashlib, json, subprocess, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'
IDS = ['enemy_hs_engel_1', 'enemy_hs_engel_2', 'enemy_hs_engel_3', 'enemy_k4s_wetherby']
errors, warnings, results = [], [], []
def check(ok, msg):
    if not ok: errors.append(msg)
    return ok

man = json.loads((SPR / 'manifest-engel.json').read_text())
tpl = {a['id']: a for a in json.loads((SPR / 'manifest-halbgott.json').read_text())['assets']}['hg_grenzwaechter']
palette = {tuple(bytes.fromhex(c[1:])) for c in man['palette']}
check(len(man['palette']) <= 32, 'Manifest-Palette > 32')
by = {a['id']: a for a in man['assets']}
check(sorted(by) == sorted(IDS) and len(man['assets']) == 4, f'Manifest-Einträge {sorted(by)}')
TQ = (0x6f, 0xe0, 0xd0); COLD_WHITE = {(0xee, 0xe2, 0xc5), (0xa8, 0xb4, 0xc0), (0xff, 0xff, 0xff)}

def base_ref():
    for a in sys.argv:
        if a.startswith('--base='): return a.split('=', 1)[1]
    r = subprocess.run(['git', 'merge-base', 'HEAD', 'origin/main'], cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 and r.stdout.strip() else 'HEAD'
BASE = base_ref()
def base_bytes(rel):
    r = subprocess.run(['git', 'show', f'{BASE}:public/sprites/{rel}'], cwd=ROOT, capture_output=True)
    return r.stdout if r.returncode == 0 else None

def cells(im, fw, fh, cols, rows):
    return [im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh)) for r in range(rows) for c in range(cols)]

timg = Image.open(SPR / tpl['file']).convert('RGBA')
tcells = {c.tobytes() for c in cells(timg, tpl['frameWidth'], tpl['frameHeight'], tpl['columns'], tpl['rows'])}
tbottom = {c.getbbox()[3] for c in cells(timg, 128, 128, 6, 6) if c.getbbox()}
tleft = min(c.getbbox()[0] for c in cells(timg, 128, 128, 6, 6) if c.getbbox())
held = {i for v in tpl['anticipationHoldFrames'].values() for i in v}
for fid in IDS:
    a = by.get(fid)
    if not check(a is not None, f'{fid} fehlt im Manifest'): continue
    rel = a['file']; path = SPR / rel
    if not check(path.exists(), f'{rel} fehlt'): continue
    for k in ('width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows', 'kind', 'animations', 'anticipationHoldFrames'):
        check(a.get(k) == tpl[k], f'{rel}: {k} weicht von der Vorlage hg_grenzwaechter ab')
    src = Image.open(path); im = src.convert('RGBA')
    check(src.mode == 'P', f'{rel}: nicht indiziert ({src.mode})')
    check(im.size == (tpl['width'], tpl['height']), f'{rel}: Maße {im.size}')
    px = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
    cnt = {}
    for p in px: cnt[p] = cnt.get(p, 0) + 1
    vis = {p[:3] for p in cnt if p[3]}
    check({p[3] for p in cnt} <= {0, 255}, f'{rel}: Alpha nicht binär')
    check(vis <= palette, f'{rel}: Farben außerhalb der Palette {sorted(vis - palette)[:5]}')
    check(len(vis) <= 32, f'{rel}: {len(vis)} Farben > 32')
    check((0x1a, 0x1c, 0x2c) in vis, f'{rel}: kein Umriss #1a1c2c')
    check(not (vis & COLD_WHITE), f'{rel}: kaltes/reines Weiß {sorted(vis & COLD_WHITE)}')
    opaque = sum(v for p, v in cnt.items() if p[3]); tq = sum(v for p, v in cnt.items() if p[3] and p[:3] == TQ)
    check(tq / max(1, opaque) < 0.003, f'{rel}: Türkis nicht sparsam ({tq} px, {100*tq/opaque:.2f} %)')
    check(im.tobytes() != timg.tobytes(), f'{rel}: pixelgleich mit Vorlage')
    cs = cells(im, 128, 128, 6, 6); seen = {}; bbs = []
    for i, c in enumerate(cs):
        bb = c.getbbox()
        if not check(bool(bb), f'{rel}: Zelle {i} leer'): continue
        bbs.append(bb)
        check(bb[0] >= 2 and bb[1] >= 2 and bb[2] <= 126, f'{rel}: Zelle {i} hält 2px Rand nicht: {bb}')
        check(bb[3] in tbottom, f'{rel}: Zelle {i} Fußlinie {bb[3]} != Vorlage {sorted(tbottom)}')
        b = c.tobytes()
        check(b not in tcells, f'{rel}: Zelle {i} pixelgleich mit einem Vorlagen-Frame')
        if b in seen and not ({seen[b], i} <= held and abs(seen[b] - i) == 1):
            errors.append(f'{rel}: Zelle {i} doppelt mit {seen[b]}')
        seen.setdefault(b, i)
    for name, (x, y) in tpl['anticipationHoldFrames'].items():
        check(cs[x].tobytes() == cs[y].tobytes(), f'{rel}: Ausholpose {name} {x}/{y} nicht gehalten')
    for name, an in tpl['animations'].items():
        fr = an['frames']
        check(len({cs[i].tobytes() for i in fr}) >= 2, f'{rel}: Animation {name} statisch')
    old = base_bytes(rel)
    if old is not None: check(old != path.read_bytes(), f'{rel}: identisch mit bisheriger Datei in {BASE[:10]}')
    r = dict(file='public/sprites/' + rel, template='public/sprites/' + tpl['file'], size=list(im.size), frame=[128, 128],
             visibleColors=len(vis), frames=len(bbs), uniqueFrames=len(seen), turquoisePixels=tq, opaquePixels=opaque,
             bboxUnion=[min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs)],
             newInBase=old is None, sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    if fid == 'enemy_k4s_wetherby':
        hum = Image.open(SPR / 'battle/enemy_cw_wetherby.png').convert('RGBA')
        hv = {p[:3] for p in set(hum.get_flattened_data() if hasattr(hum, 'get_flattened_data') else hum.getdata()) if p[3]}
        shared = vis & hv
        r['identityReference'] = 'public/sprites/battle/enemy_cw_wetherby.png'
        r['sharedColorsWithHuman'] = len(shared); r['humanColors'] = len(hv)
        check(len(shared) >= 0.6 * len(hv), f'{rel}: Farben zu weit vom Menschen-Blatt ({len(shared)}/{len(hv)})')
    results.append(r)

for f in ['batch-engel-preview.png', 'batch-engel-vorlage-neu.png', 'batch-engel-generation.json']:
    check((ART / f).exists(), f'docs/art/{f} fehlt')
raw = sorted((ART / 'engel-raw').glob('*'))
gen = json.loads((ART / 'batch-engel-generation.json').read_text())
need = [c['raw'] for f in gen['prompts']['figures'].values() for c in f['concepts'].values()]
for n in need: check((ART / 'engel-raw' / n).exists(), f'Rohbild {n} fehlt')
check(all(gen['prompts']['style'] in c['prompt'] for f in gen['prompts']['figures'].values() for c in f['concepts'].values()),
      'Style-Block steht nicht vor jedem Prompt')
rawsize = sum(p.stat().st_size for p in raw)
if rawsize > 6_000_000: warnings.append(f'Rohbilder {rawsize/1e6:.1f} MB')
warnings.append('Einbau ausstehend: aufstieg.js/calderwickStory.js nutzen noch sheet hg_grenzwaechter mit tint; manifest-engel.json wird noch nicht geladen (siehe PROPOSAL-einbau.md)')
report = dict(batch='engel', comparedAgainst=BASE, ok=not errors, errors=errors, warnings=warnings, files=results,
              raw=[dict(file=str(p.relative_to(ROOT)), bytes=p.stat().st_size) for p in raw])
if '--write' in sys.argv:
    (ART / 'batch-engel-validation.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(dict(ok=report['ok'], errors=errors[:40], warnings=warnings, files=len(results)), indent=2, ensure_ascii=False))
sys.exit(0 if not errors else 1)
