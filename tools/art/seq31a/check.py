#!/usr/bin/env python3
"""Prüfskript Batch seq31a (Codex DC1 Abschnitte 2 und 3).
Prüft: Maße, Modus P, Palette (Teilmenge manifest-halbgott, ≤32), binäres Alpha bzw. opak, Umriss #1a1c2c, Raster/Animationen/
Haltepaare exakt wie die Vorlage, Fuß-/Grundlinie, 2px Rand, kein Türkis in den Endgestalten, kein Türkis/Violett in Seq 1,
keine doppelten Frames (außer Haltepaaren), keine Zelle pixelgleich mit der Vorlage, nur neue public/-Dateien, nichts unter src/ tests/,
Vorschauen/Rohbilder/Prompts (Style-Block vor jedem Prompt) und die PFLICHTREGEL 85 %:

  Füllregel (Figurenblätter): je Frame bbox aller deckenden Pixel (Figur + Effekte) neu vs. derselbe Frame der Vorlage (dort
  ebenfalls Figur + Effekte); Breite UND Höhe müssen ≥ 85 % sein -> Fehler sonst. Zusätzlich informativ die Kern-bbox
  (binäres Öffnen mit 3x3, größte Komponente = Figur ohne dünne Effekte) für beide Seiten.
  Füllregel (Vollbilder ohne Raster): Motiv = alle Pixel ≠ häufigste Farbe des Frames; bbox neu vs. derselbe Frame von
  fx/HG_aufstieg_4.png, Breite UND Höhe ≥ 85 %.

Bericht: docs/art/batch-seq31a-validation.json. Aufruf: python3 tools/art/seq31a/check.py [--write] [--base=<ref>]"""
import hashlib, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'; HERE = Path(__file__).parent
PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr']
FILL = 0.85
errors, warnings, results, fill = [], [], [], []
def check(ok, msg):
    if not ok: errors.append(msg)
    return ok

def base_ref():
    for a in sys.argv:
        if a.startswith('--base='): return a.split('=', 1)[1]
    r = subprocess.run(['git', 'merge-base', 'HEAD', 'origin/main'], cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 and r.stdout.strip() else 'HEAD'
BASE = base_ref()

man = json.loads((SPR / 'manifest-seq31a.json').read_text())
halb = {a['id']: a for a in json.loads((SPR / 'manifest-halbgott.json').read_text())['assets']}
hpal = json.loads((SPR / 'manifest-halbgott.json').read_text())['palette']
check(man['palette'] == hpal, 'Manifest-Palette weicht von manifest-halbgott ab')
check(len(man['palette']) <= 32, 'Palette > 32')
palette = {tuple(bytes.fromhex(c[1:])) for c in man['palette']}
by = {a['id']: a for a in man['assets']}
OUTL = (0x1a, 0x1c, 0x2c); TQ = (0x6f, 0xe0, 0xd0); VIOLET = {(0x49, 0x3d, 0x59), (0x66, 0x55, 0x72), (0x87, 0x75, 0x95)}
want = [f'hg_form_{p}_still' for p in PATHS] + [f'hg_form_{p}_still_battle' for p in PATHS] + ['HG_aufstieg_3', 'HG_aufstieg_1']
check(sorted(by) == sorted(want) and len(man['assets']) == 22, f'Manifest-Einträge {sorted(set(by) ^ set(want))}')
check(sorted(man.get('paths', {})) == sorted(PATHS), 'Manifest: Zuordnung Pfad -> Sheets unvollständig')

def cells(a, fw, fh, cols, rows):
    return [a[r*fh:(r+1)*fh, c*fw:(c+1)*fw] for r in range(rows) for c in range(cols)]

def bb(m):
    ys, xs = np.nonzero(m)
    if not len(xs): return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

def core(m):
    from scipy import ndimage
    o = ndimage.binary_opening(m, np.ones((3, 3)))
    lab, n = ndimage.label(o)
    if n == 0: return m
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return lab == (int(np.argmax(sizes)) + 1)

def load(path):
    src = Image.open(path); return src, np.array(src.convert('RGBA'))

def colors(a, opaque_only=True):
    px = a.reshape(-1, 4); px = px[px[:, 3] > 0] if opaque_only else px
    return {tuple(int(v) for v in c[:3]) for c in np.unique(px, axis=0)}, px

def common(rel, a, src, transparent):
    check(src.mode == 'P', f'{rel}: nicht indiziert ({src.mode})')
    al = set(np.unique(a[..., 3]).tolist())
    if transparent: check(al <= {0, 255}, f'{rel}: Alpha nicht binär {sorted(al)}')
    else: check(al == {255}, f'{rel}: nicht opak')
    vis, px = colors(a)
    check(vis <= palette, f'{rel}: Farben außerhalb der Palette {sorted(vis - palette)[:5]}')
    check(len(vis) <= 32, f'{rel}: {len(vis)} Farben > 32')
    return vis, px

def base_has(rel):
    return subprocess.run(['git', 'cat-file', '-e', f'{BASE}:public/sprites/{rel}'], cwd=ROOT, capture_output=True).returncode == 0

def fill_rule(rel, i, new, tpl, kind):
    nb, tb = bb(new), bb(tpl)
    rw = (nb[2] - nb[0]) / (tb[2] - tb[0]); rh = (nb[3] - nb[1]) / (tb[3] - tb[1])
    rec = dict(file=rel, frame=i, kind=kind, new=[nb[2] - nb[0], nb[3] - nb[1]], template=[tb[2] - tb[0], tb[3] - tb[1]],
               ratioW=round(rw, 3), ratioH=round(rh, 3), ok=rw >= FILL and rh >= FILL)
    if kind == 'figure':
        nc, tc = bb(core(new)), bb(core(tpl))
        rec['coreNew'] = [nc[2] - nc[0], nc[3] - nc[1]]; rec['coreTemplate'] = [tc[2] - tc[0], tc[3] - tc[1]]
        rec['coreRatioW'] = round((nc[2] - nc[0]) / (tc[2] - tc[0]), 3); rec['coreRatioH'] = round((nc[3] - nc[1]) / (tc[3] - tc[1]), 3)
    check(rec['ok'], f'{rel}: Frame {i} füllt die Zelle nicht wie die Vorlage (B {rw:.2f}, H {rh:.2f} < {FILL})')
    fill.append(rec)

KEYS_MAP = ('width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows', 'baseline', 'animations', 'kind', 'transparent')
KEYS_BAT = ('width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows', 'animations', 'anticipationHoldFrames', 'kind', 'transparent')

def sheet(fid, tid, keys, fw, fh, cols, rows, foot, hold):
    e = by.get(fid); t = halb[tid]
    if not check(e is not None, f'{fid} fehlt'): return
    rel = e['file']; path = SPR / rel
    if not check(path.exists(), f'{rel} fehlt'): return
    for k in keys: check(e.get(k) == t.get(k), f'{rel}: {k} weicht von der Vorlage {t["file"]} ab')
    check(e.get('template') == t['file'], f'{rel}: Vorlage im Manifest falsch')
    src, a = load(path); _, ta = load(SPR / t['file'])
    check(a.shape == ta.shape, f'{rel}: Maße {a.shape[1]}x{a.shape[0]} != Vorlage {ta.shape[1]}x{ta.shape[0]}')
    vis, px = common(rel, a, src, True)
    check(OUTL in vis, f'{rel}: kein Umriss #1a1c2c')
    tq = int(((px[:, :3] == TQ).all(1)).sum()); check(tq == 0, f'{rel}: Türkis in der stillen Endgestalt ({tq} px)')
    op = a[..., 3] > 0; top = ta[..., 3] > 0
    cs = cells(a, fw, fh, cols, rows); tcs = cells(ta, fw, fh, cols, rows)
    om = cells(op, fw, fh, cols, rows); tom = cells(top, fw, fh, cols, rows)
    tset = {c.tobytes() for c in tcs}; seen = {}
    for i, (c, m, tm) in enumerate(zip(cs, om, tom)):
        b = bb(m)
        if not check(b is not None, f'{rel}: Zelle {i} leer'): continue
        check(b[0] >= 2 and b[1] >= 2 and b[2] <= fw - 2, f'{rel}: Zelle {i} hält 2px Rand nicht {b}')
        check(b[3] - 1 == foot, f'{rel}: Zelle {i} Fußlinie {b[3]-1} != {foot}')
        check(c.tobytes() not in tset, f'{rel}: Zelle {i} pixelgleich mit einem Vorlagen-Frame')
        k = c.tobytes()
        if k in seen and not ({seen[k], i} in [set(v) for v in hold.values()]): errors.append(f'{rel}: Zelle {i} doppelt mit {seen[k]}')
        seen.setdefault(k, i)
        fill_rule(rel, i, m, tm, 'figure')
    for name, (x, y) in hold.items():
        check(cs[x].tobytes() == cs[y].tobytes(), f'{rel}: Haltepaar {name} {x}/{y} nicht gehalten')
    for name, an in e['animations'].items():
        check(len({cs[i].tobytes() for i in an['frames']}) == len(an['frames']) - sum(1 for v in hold.values() if set(v) <= set(an['frames'])),
              f'{rel}: Animation {name} hat doppelte Frames')
    check(not base_has(rel), f'{rel}: existiert schon in {BASE[:10]} (bestehende public/-Datei darf nicht geändert werden)')
    results.append(dict(file='public/sprites/' + rel, template='public/sprites/' + t['file'], size=[a.shape[1], a.shape[0]], frame=[fw, fh],
                        grid=[cols, rows], visibleColors=len(vis), uniqueFrames=len(seen), turquoisePixels=tq,
                        minFillW=min(r['ratioW'] for r in fill if r['file'] == rel), minFillH=min(r['ratioH'] for r in fill if r['file'] == rel),
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest()))

for p in PATHS:
    sheet(f'hg_form_{p}_still', f'hg_form_{p}', KEYS_MAP, 32, 48, 4, 4, 46, {})
    sheet(f'hg_form_{p}_still_battle', f'hg_battle_{p}', KEYS_BAT, 96, 96, 6, 6, 93, halb[f'hg_battle_{p}']['anticipationHoldFrames'])
    check(by.get(f'hg_form_{p}_still_battle', {}).get('file') == f'battle/hg_form_{p}_still.png', f'{p}: Kampf-Dateiname nicht wie Codex')
    check(by.get(f'hg_form_{p}_still', {}).get('file') == f'characters/hg_form_{p}_still.png', f'{p}: Karten-Dateiname nicht wie Codex')

# ---- Vollbilder
tA = halb['HG_aufstieg_4']; _, tfa = load(SPR / tA['file'])
for seq in (3, 1):
    e = by[f'HG_aufstieg_{seq}']; rel = e['file']; path = SPR / rel
    if not check(path.exists(), f'{rel} fehlt'): continue
    for k in ('width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows', 'kind', 'transparent'):
        check(e.get(k) == tA[k], f'{rel}: {k} weicht von HG_aufstieg_4 ab')
    check(e['animations']['ascend']['frames'] == list(range(8)), f'{rel}: Frame-Liste')
    src, a = load(path)
    check(a.shape == (135, 1920, 4), f'{rel}: Maße {a.shape}')
    vis, px = common(rel, a, src, False)
    if seq == 1:
        check(TQ not in vis and not (vis & VIOLET), f'{rel}: Türkis/Violett im stillen Seq-1-Bild')
    else:
        check((0xee, 0xe2, 0xc5) not in vis and (0xe0, 0xc9, 0xa1) not in vis, f'{rel}: Bein-Weiß-Risse (Furcht-Welle) vorhanden')
    rgb = a[..., :3].astype(np.int32); key = (rgb[..., 0] << 16) | (rgb[..., 1] << 8) | rgb[..., 2]
    tkey = (tfa[..., 0].astype(np.int32) << 16) | (tfa[..., 1].astype(np.int32) << 8) | tfa[..., 2]
    fr = [key[:, i*240:(i+1)*240] for i in range(8)]; tfr = [tkey[:, i*240:(i+1)*240] for i in range(8)]
    check(len({f.tobytes() for f in fr}) == 8, f'{rel}: doppelte Frames')
    for i, (f, tf) in enumerate(zip(fr, tfr)):
        check(f.tobytes() != tf.tobytes(), f'{rel}: Frame {i} pixelgleich mit Vorlage')
        v, c = np.unique(f, return_counts=True); m = f != v[c.argmax()]
        v, c = np.unique(tf, return_counts=True); tm = tf != v[c.argmax()]
        fill_rule(rel, i, m, tm, 'fullscreen')
    check(not base_has(rel), f'{rel}: existiert schon in {BASE[:10]}')
    results.append(dict(file='public/sprites/' + rel, template='public/sprites/' + tA['file'], size=[1920, 135], frame=[240, 135],
                        visibleColors=len(vis), minFillW=min(r['ratioW'] for r in fill if r['file'] == rel),
                        minFillH=min(r['ratioH'] for r in fill if r['file'] == rel), sha256=hashlib.sha256(path.read_bytes()).hexdigest()))

# ---- Repo-Regeln: nur neue Dateien, nichts unter src/ tests/
r = subprocess.run(['git', 'diff', '--name-status', BASE, '--'], cwd=ROOT, capture_output=True, text=True).stdout.splitlines()
r += [f'A\t{x}' for x in subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], cwd=ROOT, capture_output=True, text=True).stdout.split()]
for line in r:
    st, f = line.split('\t', 1)
    check(not f.startswith(('src/', 'tests/')), f'Änderung unter src/ oder tests/: {f}')
    if f.startswith('public/'): check(st == 'A', f'bestehende public/-Datei geändert: {f}')
    if f == 'docs/art/README.md' and st == 'M':
        old = subprocess.run(['git', 'show', f'{BASE}:docs/art/README.md'], cwd=ROOT, capture_output=True).stdout
        check((ROOT / f).read_bytes().startswith(old), 'README: nicht nur am Ende angehängt')

for f in ['batch-seq31a-preview.png', 'batch-seq31a-vorlage-neu.png', 'batch-seq31a-generation.json']:
    check((ART / f).exists(), f'docs/art/{f} fehlt')
pv = Image.open(ART / 'batch-seq31a-preview.png'); check(pv.size[0] >= 1920 * 3, 'Vorschau nicht in 3x')
gen = json.loads((ART / 'batch-seq31a-generation.json').read_text())
prom = gen['prompts']; raws = []
for fig in prom['figures'].values():
    for c in fig['concepts'].values():
        raws.append(c['raw']); check((ART / 'seq31a-raw' / c['raw']).exists(), f'Rohbild {c["raw"]} fehlt')
        check(c['prompt'].startswith(prom['style']), f'Style-Block steht nicht vor dem Prompt für {c["raw"]}')
for p in PATHS:
    for pose in ('idle', 'attack1', 'attack2'): check(f'{p}_kampf_{pose}.jpg' in raws, f'Konzeptbild {p} {pose} fehlt')
    check(f'{p}_karte_ansichten.jpg' in raws, f'Konzeptbild {p} Karte fehlt')
raw = sorted((ART / 'seq31a-raw').glob('*'))
rawsize = sum(x.stat().st_size for x in raw)
if rawsize > 6_000_000: warnings.append(f'Rohbilder {rawsize/1e6:.1f} MB')
warnings.append('Einbau ausstehend: manifest-seq31a.json wird noch nicht geladen, Sheets nicht in assets.js registriert (siehe PROPOSAL-einbau.md)')
warnings.append('Raster bewusst wie Vorlage statt Codex: Kampf 6x6 (576x576) statt 6x4 (576x384), Karte 4 statt 2 Frames je Richtung')
fig_fill = [x for x in fill if x['kind'] == 'figure']
summary = dict(rule='Breite UND Höhe der bbox (deckende Pixel inkl. Effekte) ≥ 85 % derselben Vorlagen-Frame-bbox; Vollbilder: Motiv = Pixel ≠ häufigste Farbe',
               frames=len(fill), failed=sum(1 for x in fill if not x['ok']),
               minRatioW=min(x['ratioW'] for x in fill), minRatioH=min(x['ratioH'] for x in fill),
               figureMinCoreRatioW=min(x['coreRatioW'] for x in fig_fill), figureMinCoreRatioH=min(x['coreRatioH'] for x in fig_fill),
               figureFramesCoreBelow85=sum(1 for x in fig_fill if x['coreRatioW'] < FILL or x['coreRatioH'] < FILL))
report = dict(batch='seq31a', comparedAgainst=BASE, ok=not errors, errors=errors, warnings=warnings, fillRule=summary, files=results,
              fillFrames=fill, raw=dict(files=len(raw), bytes=rawsize))
if '--write' in sys.argv:
    (ART / 'batch-seq31a-validation.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(dict(ok=report['ok'], errors=errors[:40], nErrors=len(errors), warnings=warnings, fillRule=summary, files=len(results)), indent=2, ensure_ascii=False))
sys.exit(0 if not errors else 1)
