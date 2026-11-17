#!/usr/bin/env python3
"""Prüfskript Batch pfadbeyonder (Codex DY, nur ez_torfmutter / ez_schleusenuhr): Maße, Palette, Alpha, Raster,
Fußlinie, Belegung, Ausholpose, keine doppelten Frames, nicht pixelgleich mit Vorlage/bisherigem Platzhalter.
Laufblätter liegen als Ersatz unter docs/art/pfadbeyonder-ersatz/ (bestehende public-Dateien bleiben unangetastet).
Bericht: docs/art/batch-pfadbeyonder-validation.json. Aufruf: python3 tools/art/pfadbeyonder/check.py [--write] [--base=<ref>]"""
import hashlib, json, subprocess, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'
FIGS = {'torfmutter': 'kalkbrennerin', 'schleusenuhr': 'rangierer'}
errors, warnings, results = [], [], []
def check(ok, msg):
    if not ok: errors.append(msg)
    return ok

man = json.loads((SPR / 'manifest-pfadbeyonder.json').read_text())
tman = {a['id']: a for a in json.loads((SPR / 'manifest-dunscar5.json').read_text())['assets']}
palette = {tuple(bytes.fromhex(c[1:])) for c in man['palette']}
check(len(man['palette']) <= 32, 'Manifest-Palette > 32')
byfile = {a['file']: a for a in man['assets']}
check(len(byfile) == len(man['assets']) == 6, f'Manifest: {len(man["assets"])} Einträge statt 6 / doppelte Dateien')
check(len({a['id'] for a in man['assets']}) == len(man['assets']), 'doppelte Asset-IDs')
check(not any('pfandleiherin' in a['file'] for a in man['assets']), 'Maud Keel darf nicht Teil des Batches sein')

def base_ref():
    for a in sys.argv:
        if a.startswith('--base='): return a.split('=', 1)[1]
    r = subprocess.run(['git', 'merge-base', 'HEAD', 'origin/main'], cwd=ROOT, capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 and r.stdout.strip() else 'HEAD'
BASE = base_ref()
def base_bytes(rel):
    r = subprocess.run(['git', 'show', f'{BASE}:public/sprites/{rel}'], cwd=ROOT, capture_output=True)
    return r.stdout if r.returncode == 0 else None

def cells_of(im, fw, fh, cols, rows):
    return [im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh)) for r in range(rows) for c in range(cols)]

def basic(path, name, size):
    src = Image.open(path); im = src.convert('RGBA')
    check(src.mode == 'P', f'{name}: nicht indiziert ({src.mode})')
    check(im.size == size, f'{name}: Maße {im.size} != {size}')
    px = set(im.get_flattened_data()); vis = {p[:3] for p in px if p[3]}
    check({p[3] for p in px} <= {0, 255}, f'{name}: Alpha nicht binär')
    check(vis <= palette, f'{name}: Farben außerhalb der Palette: {sorted(vis - palette)[:5]}')
    check(len(vis) <= 32, f'{name}: {len(vis)} Farben > 32')
    check((0x1a, 0x1c, 0x2c) in vis, f'{name}: kein Umriss #1a1c2c')
    return im, len(vis)

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

for name, tname in FIGS.items():
    gid = f'ez_{name}'
    # --- Kampfblatt
    rel = f'battle/enemy_{gid}.png'; a = byfile.get(rel); path = SPR / rel
    if check(a is not None and path.exists(), f'{rel} fehlt (Datei oder Manifest)'):
        tpl = tman[f'enemy_ez_ds_{tname}']
        for k in ('width', 'height', 'frameWidth', 'frameHeight', 'columns', 'rows', 'baseline', 'occupiedCounts', 'heldRows', 'facing', 'windupFrames'):
            check(a.get(k) == tpl[k], f'{rel}: {k}={a.get(k)} weicht von Vorlage ({tpl[k]}) ab')
        check(a.get('animations') == tpl['animations'], f'{rel}: Animationen/Reihenfolge weichen von der Vorlage ab')
        check(len(a.get('attackNames', [])) == 2, f'{rel}: attackNames fehlen')
        im, ncol = basic(path, rel, (a['width'], a['height']))
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
                    check(bb[0] > 0 and bb[1] > 0 and bb[2] < fw and bb[3] == a['baseline'] + 1, f'{rel}: Rand/Fußlinie Reihe {row} Spalte {col}: {bb}')
                    check(c.tobytes() not in tcells, f'{rel}: Frame {row}/{col} pixelgleich mit Vorlagen-Frame')
                    used.append((row, col, c.tobytes()))
                else:
                    check(c.getextrema()[3] == (0, 0), f'{rel}: leere Zelle {row}/{col} nicht voll transparent')
            check(len({c.tobytes() for c in cells[row * cols:row * cols + n]}) >= 2, f'{rel}: Reihe {row} statisch')
        for row in a['heldRows']:
            check(cells[row * cols + 1].tobytes() == cells[row * cols + 2].tobytes(), f'{rel}: Ausholpose Reihe {row} nicht gehalten (Spalte 1/2)')
        seen = {}
        for row, col, b in used:
            if b in seen and not (row == seen[b][0] and row in a['heldRows'] and {seen[b][1], col} == {1, 2}):
                errors.append(f'{rel}: Frame {row}/{col} doppelt mit {seen[b]}')
            seen.setdefault(b, (row, col))
        old = base_bytes(rel)
        if old is not None: check(old != path.read_bytes(), f'{rel}: identisch mit bisheriger Datei in {BASE[:10]}')
        results.append(dict(file='public/sprites/' + rel, template='public/sprites/' + tpl['file'], size=list(im.size), visibleColors=ncol,
                            frames=len(used), uniqueFrames=len(seen), newInBase=old is None, sha256=sha(path)))
    # --- Laufblatt (Ersatz)
    rel = f'characters/ph_{gid}_walk.png'; a = byfile.get(rel); path = ART / 'pfadbeyonder-ersatz' / rel
    if check(a is not None and path.exists(), f'{rel} fehlt (Ersatzdatei oder Manifest)'):
        im, ncol = basic(path, rel, (64, 128))
        cells = cells_of(im, 16, 32, 4, 4)
        for i, c in enumerate(cells):
            bb = c.getbbox()
            if check(bool(bb), f'{rel}: Zelle {i} leer'):
                check(bb[0] > 0 and bb[1] > 0 and bb[2] < 16 and bb[3] == a['baselineY'] + 1, f'{rel}: Rand/Fußlinie Zelle {i}: {bb}')
        for r in range(4):
            check(len({c.tobytes() for c in cells[r * 4:r * 4 + 4]}) >= 2, f'{rel}: Richtung {r} statisch')
        check(cells[4].transpose(Image.FLIP_LEFT_RIGHT).tobytes() == cells[8].tobytes(), f'{rel}: rechts ist nicht Spiegel von links')
        ph = SPR / rel
        check(ph.exists() and Image.open(ph).convert('RGBA').tobytes() != im.tobytes(), f'{rel}: pixelgleich mit bisherigem Platzhalter')
        old = base_bytes(rel)
        check(old is not None, f'{rel}: Platzhalter in {BASE[:10]} nicht gefunden')
        if old is not None: check(old != path.read_bytes(), f'{rel}: identisch mit Platzhalter in {BASE[:10]}')
        results.append(dict(file=str(path.relative_to(ROOT)), installsTo='public/sprites/' + rel, template='public/sprites/' + a['template'],
                            size=list(im.size), visibleColors=ncol, sha256=sha(path)))
    # --- Kopf
    rel = f'portraits/heads/{gid}.png'; a = byfile.get(rel); path = SPR / rel
    if check(a is not None and path.exists(), f'{rel} fehlt (Datei oder Manifest)'):
        im, ncol = basic(path, rel, (24, 24))
        bb = im.getbbox(); check(bb and bb[0] > 0 and bb[1] > 0 and bb[2] < 24, f'{rel}: Motiv berührt den Rand {bb}')
        old = base_bytes(rel)
        if old is not None: check(old != path.read_bytes(), f'{rel}: identisch mit bisheriger Datei')
        results.append(dict(file='public/sprites/' + rel, template='public/sprites/' + a['template'], size=list(im.size), visibleColors=ncol,
                            bbox=list(bb), newInBase=old is None, sha256=sha(path)))

for f in ['batch-pfadbeyonder-preview.png', 'batch-pfadbeyonder-vorlage-neu.png', 'batch-pfadbeyonder-generation.json']:
    check((ART / f).exists(), f'docs/art/{f} fehlt')
raw = sorted((ART / 'pfadbeyonder-raw').glob('*'))
check(len(raw) >= 10, f'Rohbilder fehlen ({len(raw)}/10)')
rawsize = sum(p.stat().st_size for p in raw)
if rawsize > 5_000_000: warnings.append(f'Rohbilder {rawsize/1e6:.1f} MB > 5 MB')
warnings.append('Laufblätter nur als Ersatz unter docs/art/pfadbeyonder-ersatz/ – public/sprites/characters/ph_ez_*_walk.png bleibt bis zum Einbau der Platzhalter')
warnings.append('assets.js ENCOUNTER_SHEETS zeigt für ez_torfmutter/ez_schleusenuhr noch auf die Dunscar-Blätter (Code nicht geändert)')

report = dict(batch='pfadbeyonder', comparedAgainst=BASE, ok=not errors, errors=errors, warnings=warnings, files=results,
              raw=[dict(file=str(p.relative_to(ROOT)), bytes=p.stat().st_size) for p in raw])
if '--write' in sys.argv:
    (ART / 'batch-pfadbeyonder-validation.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(dict(ok=report['ok'], errors=errors[:40], warnings=warnings, files=len(results)), indent=2, ensure_ascii=False))
sys.exit(0 if not errors else 1)
