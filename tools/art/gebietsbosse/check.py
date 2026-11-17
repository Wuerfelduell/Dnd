#!/usr/bin/env python3
"""Prüfskript Batch gebietsbosse (Codex DX): Maße, Palette, Alpha, Raster, Fußlinie, Belegung, Ausholpose,
keine doppelten Frames, nicht pixelgleich mit Vorlage/bisherigem Platzhalter. Bericht: docs/art/batch-gebietsbosse-validation.json.
Aufruf: python3 tools/art/gebietsbosse/check.py [--write]"""
import hashlib, json, subprocess, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'
BOSSES = {'weichenfresser': 'schwellenhund', 'bruchmeister': 'vorhauer', 'schluchtrufer': 'vielrufer', 'tiefenvorarbeiter': 'unterschicht'}
errors, warnings, results = [], [], []
def check(ok, msg):
    if not ok: errors.append(msg)
    return ok

man = json.loads((SPR / 'manifest-gebietsbosse.json').read_text())
tman = {a['id']: a for a in json.loads((SPR / 'manifest-dunscar3.json').read_text())['assets']}
palette = {tuple(bytes.fromhex(c[1:])) for c in man['palette']}
check(len(man['palette']) <= 32, 'Manifest-Palette > 32')
byfile = {a['file']: a for a in man['assets']}
check(len(byfile) == len(man['assets']) == 8, f'Manifest: {len(man["assets"])} Einträge statt 8 / doppelte Dateien')
check(len({a['id'] for a in man['assets']}) == len(man['assets']), 'doppelte Asset-IDs')

def base_ref():
    """Vergleichsstand = bisheriger Platzhalter: merge-base mit origin/main (Fallback HEAD), überschreibbar mit --base=<ref>."""
    for a in sys.argv:
        if a.startswith('--base='): return a.split('=', 1)[1]
    r = subprocess.run(['git', 'merge-base', 'HEAD', 'origin/main'], cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 and r.stdout.strip() else 'HEAD'
BASE = base_ref()

def head_bytes(rel):
    r = subprocess.run(['git', 'show', f'{BASE}:public/sprites/{rel}'], cwd=ROOT, capture_output=True)
    return r.stdout if r.returncode == 0 else None

def cells_of(im, fw, fh, cols, rows):
    return [im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh)) for r in range(rows) for c in range(cols)]

def basic(path, a):
    src = Image.open(path); im = src.convert('RGBA')
    check(src.mode == 'P', f'{a["file"]}: nicht indiziert ({src.mode})')
    check(im.size == (a['width'], a['height']), f'{a["file"]}: Maße {im.size} != {(a["width"], a["height"])}')
    check(im.size == (a['columns'] * a['frameWidth'], a['rows'] * a['frameHeight']), f'{a["file"]}: Raster passt nicht')
    px = set(im.get_flattened_data()); vis = {p[:3] for p in px if p[3]}
    check({p[3] for p in px} <= {0, 255}, f'{a["file"]}: Alpha nicht binär')
    check(vis <= palette, f'{a["file"]}: Farben außerhalb der Palette: {sorted(vis - palette)[:5]}')
    check(len(vis) <= 32, f'{a["file"]}: {len(vis)} Farben > 32')
    check((0x1a, 0x1c, 0x2c) in vis, f'{a["file"]}: kein Umriss #1a1c2c')
    # kein heller/dunkler Saum: transparente Pixel haben RGB 0 und kein halbtransparenter Rand (binär geprüft)
    return im, len(vis)

for name, base in BOSSES.items():
    gid = f'ds_gb_{name}'
    # --- Kampfblatt
    rel = f'battle/enemy_{gid}.png'; a = byfile.get(rel)
    if not check(a is not None, f'{rel} fehlt im Manifest'): continue
    path = SPR / rel
    if not check(path.exists(), f'{rel} fehlt'): continue
    tpl = tman[f'enemy_{base}']
    for k in ('width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows', 'baseline', 'occupiedCounts', 'heldRows', 'facing'):
        check(a[k] == tpl[k], f'{rel}: {k}={a[k]} weicht von Vorlage enemy_{base} ({tpl[k]}) ab')
    check(a['animations'] == tpl['animations'], f'{rel}: Animationen/Reihenfolge weichen von der Vorlage ab')
    im, ncol = basic(path, a)
    fw, fh, cols = a['frameWidth'], a['frameHeight'], a['columns']
    cells = cells_of(im, fw, fh, cols, a['rows'])
    timg = Image.open(SPR / tpl['file']).convert('RGBA'); tcells = {c.tobytes() for c in cells_of(timg, fw, fh, cols, tpl['rows'])}
    check(im.tobytes() != timg.tobytes(), f'{rel}: pixelgleich mit Vorlage')
    used = []
    for row, n in enumerate(a['occupiedCounts']):
        for col in range(cols):
            c = cells[row * cols + col]; bb = c.getbbox()
            check(bool(bb) == (col < n), f'{rel}: Belegung Reihe {row} Spalte {col}')
            if bb:
                check(bb[0] > 0 and bb[1] > 0 and bb[2] < fw and bb[3] == a['baseline'], f'{rel}: Rand/Fußlinie Reihe {row} Spalte {col}: {bb}')
                check(c.tobytes() not in tcells, f'{rel}: Frame {row}/{col} pixelgleich mit einem Vorlagen-Frame')
                used.append((row, col, c.tobytes()))
            elif bb is None:
                check(c.getextrema()[3] == (0, 0), f'{rel}: leere Zelle {row}/{col} nicht voll transparent')
        seq = cells[row * cols:row * cols + n]
        check(len({c.tobytes() for c in seq}) >= 2, f'{rel}: Reihe {row} statisch')
    for row in a['heldRows']:
        check(cells[row * cols].tobytes() == cells[row * cols + 1].tobytes(), f'{rel}: Ausholpose Reihe {row} nicht gehalten')
    # doppelte Frames: nur die gehaltenen Paare (Spalte 0/1 in heldRows) dürfen gleich sein
    seen = {}
    for row, col, b in used:
        if b in seen and not (row == seen[b][0] and row in a['heldRows'] and {seen[b][1], col} == {0, 1}):
            errors.append(f'{rel}: Frame {row}/{col} doppelt mit {seen[b]}')
        seen.setdefault(b, (row, col))
    for nm, an in a['animations'].items():
        check(all(0 <= i < len(cells) and cells[i].getbbox() for i in an['frames']), f'{rel}: Animation {nm} zeigt auf leere Zelle')
    old = head_bytes(rel)
    if old is not None: check(old != path.read_bytes(), f'{rel}: identisch mit bisheriger Datei in {BASE[:10]}')
    results.append(dict(file=rel, template=tpl['file'], size=list(im.size), frame=[fw, fh], rows=a['rows'], visibleColors=ncol,
                        frames=len(used), uniqueFrames=len(seen), newInHead=old is None,
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
    # --- Auftrittsbild
    rel = f'ui/DS_boss_{gid}.png'; a = byfile.get(rel)
    if not check(a is not None, f'{rel} fehlt im Manifest'): continue
    path = SPR / rel
    if not check(path.exists(), f'{rel} fehlt'): continue
    im, ncol = basic(path, a)
    check(im.size == (160, 160), f'{rel}: nicht 160x160')
    ref = Image.open(SPR / f'ui/DS_boss_{base}.png').convert('RGBA')
    check(im.tobytes() != ref.tobytes(), f'{rel}: pixelgleich mit ui/DS_boss_{base}.png (bisheriger Platzhalter)')
    bb = im.getbbox(); check(bb and bb[0] > 0 and bb[1] > 0 and bb[2] < 160 and bb[3] <= 160 - 4, f'{rel}: Motiv berührt den Rand {bb}')
    old = head_bytes(rel)
    if old is not None: check(old != path.read_bytes(), f'{rel}: identisch mit bisheriger Datei in {BASE[:10]}')
    results.append(dict(file=rel, template=f'ui/DS_boss_{base}.png', size=list(im.size), visibleColors=ncol, bbox=list(bb), newInHead=old is None,
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest()))

for f in ['batch-gebietsbosse-preview.png', 'batch-gebietsbosse-generation.json']:
    check((ART / f).exists(), f'docs/art/{f} fehlt')
raw = sorted((ART / 'gebietsbosse-raw').glob('*'))
check(len(raw) >= 4, 'Rohbilder fehlen')
rawsize = sum(p.stat().st_size for p in raw)
if rawsize > 5_000_000: warnings.append(f'Rohbilder {rawsize/1e6:.1f} MB > 5 MB')

report = dict(batch='gebietsbosse', comparedAgainst=BASE, ok=not errors, errors=errors, warnings=warnings, files=results,
              raw=[dict(file=str(p.relative_to(ROOT)), bytes=p.stat().st_size) for p in raw])
if '--write' in sys.argv:
    (ART / 'batch-gebietsbosse-validation.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(dict(ok=report['ok'], errors=errors[:40], warnings=warnings, files=len(results)), indent=2, ensure_ascii=False))
sys.exit(0 if not errors else 1)
