#!/usr/bin/env python3
"""Prüfskript Batch heilige (Teil 5: Heilige der Höfe, Kampfblätter enemy_hs_heiliger_<pfad>).
Prüft: Maße, Raster/Animationen/Halteframes exakt wie battle/hg_battle_<pfad>.png (manifest-halbgott.json), Modus P, binäres Alpha,
Farben ⊆ Batch-Palette und ≤ 32 je Blatt (Manifest-Palette je Blatt = Farben im PNG), Umriss #1a1c2c, Türkis ≤ 0,3 %, kein reines/kaltes Weiß,
Fußlinie 93, 2px Rand, Haltepaare pixelgleich, keine doppelten Frames sonst, keine Zelle pixelgleich mit der Vorlage,
nur neue public/-Dateien, nichts unter src/ tests/, README nur am Ende angehängt, Style-Block vor jedem Prompt, Rohbilder vorhanden,
und HART die verschärfte FIGUR-85%-Regel:

  Je Frame Kern-Box = Alpha-Maske -> binäres Öffnen 3x3 -> größte zusammenhängende Komponente (Figur ohne dünne Effekte);
  identisch für Vorlage und neu. Breite UND Höhe der neuen Kern-Box müssen ≥ 85 % der Vorlagen-Kern-Box im selben Frame sein,
  sonst FEHLER. Füllmittel (Bodenschein, Lichtbögen, prozedurale Formen) gibt es nicht; dünne Effekte fallen durch das Öffnen ohnehin weg.
  Informativ zusätzlich die bbox aller deckenden Pixel.

Bericht: docs/art/batch-heilige-validation.json. Aufruf: python3 tools/art/heilige/check.py [--write] [--base=<ref>]"""
import hashlib, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'; HERE = Path(__file__).parent
PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr']
POSES = ['idle', 'attack1', 'strike', 'attack2', 'special', 'hurt', 'defeated']
FILL = 0.85; FOOT = 93; MARGIN = 2; TQ_MAX = 0.003
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

man = json.loads((SPR / 'manifest-heilige.json').read_text())
hman = json.loads((SPR / 'manifest-halbgott.json').read_text())
halb = {a['id']: a for a in hman['assets']}
check(man['palette'][:len(hman['palette'])] == hman['palette'], 'Batch-Palette beginnt nicht mit der Halbgott-Palette')
palette = {tuple(bytes.fromhex(c[1:])) for c in man['palette']}
by = {a['id']: a for a in man['assets']}
want = [f'enemy_hs_heiliger_{p}' for p in PATHS]
check(sorted(by) == sorted(want) and len(man['assets']) == 10, f'Manifest-Einträge {sorted(set(by) ^ set(want))}')
OUTL = (0x1a, 0x1c, 0x2c); TQ = (0x6f, 0xe0, 0xd0)
KEYS = ('width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows', 'animations', 'anticipationHoldFrames', 'kind', 'transparent')

def cells(a, n=6, s=96): return [a[r*s:(r+1)*s, c*s:(c+1)*s] for r in range(n) for c in range(n)]
def bb(m):
    ys, xs = np.nonzero(m)
    return None if not len(xs) else (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
def wh(b): return [b[2] - b[0], b[3] - b[1]]
def core(m):
    from scipy import ndimage
    o = ndimage.binary_opening(m, np.ones((3, 3)))
    lab, n = ndimage.label(o)
    if n == 0: return np.zeros_like(m)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return lab == (int(np.argmax(sizes)) + 1)
def base_has(rel):
    return subprocess.run(['git', 'cat-file', '-e', f'{BASE}:public/sprites/{rel}'], cwd=ROOT, capture_output=True).returncode == 0

for p in PATHS:
    fid = f'enemy_hs_heiliger_{p}'; e = by.get(fid); t = halb[f'hg_battle_{p}']
    if not check(e is not None, f'{fid} fehlt im Manifest'): continue
    rel = e['file']; path = SPR / rel
    check(rel == f'battle/enemy_hs_heiliger_{p}.png', f'{fid}: Dateiname')
    if not check(path.exists(), f'{rel} fehlt'): continue
    for k in KEYS: check(e.get(k) == t.get(k), f'{rel}: {k} weicht von der Vorlage {t["file"]} ab')
    check(e.get('template') == t['file'], f'{rel}: Vorlage im Manifest falsch')
    check(e.get('gameId') == f'hs_heiliger_{p}' and e.get('facing') == 'left' and e.get('baseline') == FOOT, f'{rel}: gameId/facing/baseline')
    src = Image.open(path); a = np.array(src.convert('RGBA')); ta = np.array(Image.open(SPR / t['file']).convert('RGBA'))
    check(src.mode == 'P', f'{rel}: nicht indiziert ({src.mode})')
    check(a.shape == ta.shape == (576, 576, 4), f'{rel}: Maße {a.shape[1]}x{a.shape[0]} / Vorlage {ta.shape[1]}x{ta.shape[0]}')
    check(set(np.unique(a[..., 3]).tolist()) <= {0, 255}, f'{rel}: Alpha nicht binär')
    px = a.reshape(-1, 4); px = px[px[:, 3] > 0]
    vis = {tuple(int(v) for v in c[:3]) for c in np.unique(px, axis=0)}
    check(vis <= palette, f'{rel}: Farben außerhalb der Batch-Palette {sorted(vis - palette)[:5]}')
    check(len(vis) <= 32, f'{rel}: {len(vis)} Farben > 32')
    check(vis == {tuple(bytes.fromhex(c[1:])) for c in e.get('palette', [])}, f'{rel}: Manifest-Palette ≠ Farben im PNG')
    check(OUTL in vis, f'{rel}: kein Umriss #1a1c2c')
    check(not any(min(c) >= 245 for c in vis), f'{rel}: reines Weiß')
    check(not any(c[2] > c[0] + 10 and min(c) > 200 for c in vis), f'{rel}: kaltes Weiß')
    tq = int(((px[:, :3] == TQ).all(1)).sum()); tqr = tq / max(1, len(px))
    check(tqr <= TQ_MAX, f'{rel}: Türkis {tqr:.2%} > {TQ_MAX:.1%}')
    op = a[..., 3] > 0; top = ta[..., 3] > 0
    cs, tcs, om, tom = cells(a), cells(ta), cells(op), cells(top)
    tset = {c.tobytes() for c in tcs}; seen = {}
    hold = [set(v) for v in t['anticipationHoldFrames'].values()]
    for i, (c, m, tm) in enumerate(zip(cs, om, tom)):
        b = bb(m)
        if not check(b is not None, f'{rel}: Zelle {i} leer'): continue
        check(b[0] >= MARGIN and b[1] >= MARGIN and b[2] <= 96 - MARGIN, f'{rel}: Zelle {i} hält {MARGIN}px Rand nicht {b}')
        check(b[3] - 1 == FOOT, f'{rel}: Zelle {i} Fußlinie {b[3]-1} != {FOOT}')
        check(c.tobytes() not in tset, f'{rel}: Zelle {i} pixelgleich mit einem Vorlagen-Frame')
        k = c.tobytes()
        if k in seen and {seen[k], i} not in hold: errors.append(f'{rel}: Zelle {i} doppelt mit {seen[k]}')
        seen.setdefault(k, i)
        nc, tc = bb(core(m)), bb(core(tm)); tb = bb(tm)
        rw = (nc[2] - nc[0]) / (tc[2] - tc[0]); rh = (nc[3] - nc[1]) / (tc[3] - tc[1])
        rec = dict(file=rel, frame=i, coreNew=wh(nc), coreTemplate=wh(tc), coreRatioW=round(rw, 3), coreRatioH=round(rh, 3),
                   ok=rw >= FILL and rh >= FILL, bboxNew=wh(b), bboxTemplate=wh(tb),
                   bboxRatioW=round((b[2] - b[0]) / (tb[2] - tb[0]), 3), bboxRatioH=round((b[3] - b[1]) / (tb[3] - tb[1]), 3))
        check(rec['ok'], f'{rel}: Frame {i} FIGUR (Kern-Box) zu klein: B {rw:.3f}, H {rh:.3f} < {FILL}')
        fill.append(rec)
    for name, (x, y) in t['anticipationHoldFrames'].items():
        check(cs[x].tobytes() == cs[y].tobytes(), f'{rel}: Haltepaar {name} {x}/{y} nicht pixelgleich')
    check(not base_has(rel), f'{rel}: existiert schon in {BASE[:10]}')
    mine = [r for r in fill if r['file'] == rel]
    results.append(dict(file='public/sprites/' + rel, template='public/sprites/' + t['file'], visibleColors=len(vis), uniqueFrames=len(seen),
                        turquoisePixels=tq, turquoiseShare=round(tqr, 5),
                        minCoreRatioW=min(r['coreRatioW'] for r in mine), minCoreRatioH=min(r['coreRatioH'] for r in mine),
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
check(not base_has('manifest-heilige.json'), 'manifest-heilige.json existiert schon')

# ---- Repo-Regeln
r = subprocess.run(['git', 'diff', '--name-status', BASE, '--'], cwd=ROOT, capture_output=True, text=True).stdout.splitlines()
r += [f'A\t{x}' for x in subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], cwd=ROOT, capture_output=True, text=True).stdout.split()]
for line in r:
    st, f = line.split('\t', 1)
    check(not f.startswith(('src/', 'tests/')), f'Änderung unter src/ oder tests/: {f}')
    if f.startswith('public/'): check(st == 'A', f'bestehende public/-Datei geändert: {f}')
    if f == 'docs/art/README.md' and st == 'M':
        old = subprocess.run(['git', 'show', f'{BASE}:docs/art/README.md'], cwd=ROOT, capture_output=True).stdout
        check((ROOT / f).read_bytes().startswith(old), 'README: nicht nur am Ende angehängt')
    if f.startswith('docs/') and f != 'docs/art/README.md' and st != 'A': errors.append(f'bestehende docs-Datei geändert: {f}')

# ---- Vorschauen, Prompts, Rohbilder
for f in ['batch-heilige-preview.png', 'batch-heilige-vorlage-neu.png', 'batch-heilige-generation.json']:
    check((ART / f).exists(), f'docs/art/{f} fehlt')
check(Image.open(ART / 'batch-heilige-preview.png').size[0] >= 576 * 3 * 3, 'Vorschau nicht in 3x')
prom = json.loads((HERE / 'prompts.json').read_text())
co = (ART / 'codex_CO_halbgott_grafik.md').read_text()
check(prom['style'] in co, 'Style-Block nicht wörtlich aus codex_CO_halbgott_grafik.md')
rawdir = ART / 'heilige-raw'
for name, c in list(prom['final'].items()) + list(prom['rejected'].items()):
    check((rawdir / name).exists(), f'Rohbild {name} fehlt')
    check(c['prompt'].startswith(prom['style']), f'Style-Block steht nicht vor dem Prompt für {name}')
for p in PATHS:
    for q in POSES: check(f'{p}_kampf_{q}.jpg' in prom['final'], f'Konzeptbild {p} {q} fehlt')
raw = sorted(rawdir.glob('*')); rawsize = sum(x.stat().st_size for x in raw)
if rawsize > 15_000_000: warnings.append(f'Rohbilder {rawsize/1e6:.1f} MB')
warnings.append('Einbau ausstehend: manifest-heilige.json wird noch nicht geladen, Sheets nicht in assets.js registriert, aufstieg.js tönt noch hg_battle gelb (siehe PROPOSAL-einbau.md)')
warnings.append('facing: Vorlagen hg_battle_* schauen nach rechts; Heilige zellweise gespiegelt nach links wie alle Gegnerblätter (manifest-kampf, manifest-engel: facing left)')

summary = dict(rule='HART: Kern-Box (binäres Öffnen 3x3, größte Komponente) Breite UND Höhe ≥ 85 % derselben Vorlagen-Kern-Box; keine Füllmittel',
               frames=len(fill), failed=sum(1 for x in fill if not x['ok']),
               minCoreRatioW=min(x['coreRatioW'] for x in fill), minCoreRatioH=min(x['coreRatioH'] for x in fill),
               minCoreW_at=min(fill, key=lambda x: x['coreRatioW'])['file'] + f" #{min(fill, key=lambda x: x['coreRatioW'])['frame']}",
               minCoreH_at=min(fill, key=lambda x: x['coreRatioH'])['file'] + f" #{min(fill, key=lambda x: x['coreRatioH'])['frame']}",
               infoMinBboxRatioW=min(x['bboxRatioW'] for x in fill), infoMinBboxRatioH=min(x['bboxRatioH'] for x in fill))
report = dict(batch='heilige', comparedAgainst=BASE, ok=not errors, errors=errors, warnings=warnings, figureRule=summary, files=results,
              frames=fill, raw=dict(files=len(raw), bytes=rawsize))
if '--write' in sys.argv:
    (ART / 'batch-heilige-validation.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(dict(ok=report['ok'], errors=errors[:40], nErrors=len(errors), warnings=warnings, figureRule=summary, files=len(results)), indent=2, ensure_ascii=False))
sys.exit(0 if not errors else 1)
