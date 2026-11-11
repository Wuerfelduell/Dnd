#!/usr/bin/env python3
"""Validate CE2 without changing assets; run from any working directory."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SPRITES = ROOT / 'public/sprites'
MANIFEST = SPRITES / 'manifest-calderwick2.json'
REPORT = ROOT / 'docs/art/batch-calderwick2-validation.json'
MAP_IDS = ['cw_gleisfuss', 'cw_setzergasse', 'cw_quittungsmarkt',
           'cw_roehrenhof', 'cw_witwenterrasse', 'cw_kronenarchiv',
           'cw_buchbinderei', 'cw_gepaeckhalle', 'cw_pfandhaus',
           'cw_sortierhalle', 'cw_kueche', 'cw_archivsaal', 'cw_villa',
           'cw_druckkammer', 'cw_alte_setzerei', 'cw_sortiergrube',
           'cw_nullfundament', 'reise_landstrasse']
EXPECTED = {'fx/cw_abgleich.png': (288, 128), 'ui/cw_karte.png': (480, 270),
            'ui/cw_karte_nebel.png': (480, 270), 'ui/cw_marker.png': (96, 48),
            'ui/scenes/kapitel4_karte.png': (480, 270),
            'ui/landstrasse_karte.png': (240, 135)}
for name in ['aufzug', 'zwei_teller', 'sortierkabine', 'ende_widerspruch',
             'ende_amtsinhaber', 'ende_buecher', 'ende_ordnung']:
    EXPECTED[f'ui/scenes/cw_{name}.png'] = (480, 270) if name in ['aufzug', 'zwei_teller'] else (240, 135)
for name in ['gleisfuss', 'setzergasse', 'quittungsmarkt', 'roehrenhof',
             'witwenterrasse', 'kronenarchiv', 'druckkammer',
             'landstrasse_tag', 'landstrasse_nacht']:
    EXPECTED[f'battle/bg_cw_{name}.png'] = (480, 270)
TRANSPARENT = {'fx/cw_abgleich.png', 'ui/cw_karte_nebel.png', 'ui/cw_marker.png'}
FX = {'strasse_gerade': (0, 16, 4), 'strasse_kurve': (16, 16, 4),
      'strasse_ende': (32, 16, 4), 'kontakt_gefaehrdet': (48, 16, 4),
      'verbindung_stabil': (64, 16, 2), 'nebel_rueckweg': (80, 48, 6)}


def main():
    manifest = json.loads(MANIFEST.read_text())
    errors = []
    def require(condition, message):
        if not condition:
            errors.append(message)
    assets = manifest['assets']
    require(manifest['batch'] == 'calderwick2', 'Incorrect batch')
    require(len(assets) == 22, 'Exactly 22 assets required')
    require({a['file'] for a in assets} == set(EXPECTED), 'Asset set differs from CE2 specification')
    require(len({a['id'] for a in assets}) == len(assets), 'Duplicate asset IDs')
    palette = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
    reference = json.loads((SPRITES / 'manifest-dunscar1.json').read_text())
    require(manifest['palette'] == reference['palette'], 'Shared palette differs from Dunscar')
    require(len(palette) <= 32, 'Palette exceeds 32 colors')
    results = []
    union = set()
    for asset in assets:
        file = asset['file']
        path = SPRITES / file
        start = len(errors)
        require(path.is_file(), f'{file}: missing')
        if not path.is_file():
            continue
        with Image.open(path) as src:
            require(src.format == 'PNG', f'{file}: not PNG')
            require(src.mode == 'P', f'{file}: not palette-indexed')
            image = src.convert('RGBA')
        require(image.size == EXPECTED[file], f'{file}: wrong pixel dimensions')
        require(image.size == (asset['width'], asset['height']), f'{file}: manifest size differs')
        pixels = [image.getpixel((x, y)) for y in range(image.height) for x in range(image.width)]
        alphas = {px[3] for px in pixels}
        colors = {px[:3] for px in pixels if px[3]}
        union.update(colors)
        require(alphas <= {0, 255}, f'{file}: nonbinary alpha')
        require(asset['transparent'] == (file in TRANSPARENT), f'{file}: wrong alpha declaration')
        require(alphas == ({0, 255} if file in TRANSPARENT else {255}), f'{file}: incorrect transparency')
        require(len(colors) <= 32 and colors <= palette, f'{file}: off-palette colors')
        require(all(px == (0, 0, 0, 0) for px in pixels if px[3] == 0), f'{file}: hidden RGB in transparent pixels')
        require(asset['columns'] * asset['frameWidth'] == image.width, f'{file}: column raster')
        require(asset['rows'] * asset['frameHeight'] == image.height, f'{file}: row raster')
        require(hashlib.sha256(path.read_bytes()).hexdigest() == asset['sha256'], f'{file}: checksum differs')
        frames = 1
        if file == 'ui/cw_marker.png':
            require(set(asset['regions']) == set(MAP_IDS), 'Marker IDs incomplete')
            frames = len(MAP_IDS)
            for i, map_id in enumerate(MAP_IDS):
                r = asset['regions'][map_id]
                require(r == dict(x=i % 6 * 16, y=i // 6 * 16, width=16, height=16), f'{map_id}: wrong cell')
                tile = image.crop((r['x'], r['y'], r['x'] + 16, r['y'] + 16))
                box = tile.getchannel('A').getbbox()
                require(box is not None and 0 < box[0] < box[2] < 16 and box[3] == 15, f'{map_id}: padding/baseline')
        elif file == 'fx/cw_abgleich.png':
            require(set(asset['regions']) == set(FX), 'FX region names incomplete')
            covered = Image.new('1', image.size)
            frames = 0
            for name, (y, size, count) in FX.items():
                r = asset['regions'][name]
                require((r['x'], r['y'], r['width'], r['height']) == (0, y, count * size, size), f'{name}: region raster')
                require((r['frameWidth'], r['frameHeight'], r['columns'], r['rows']) == (size, size, count, 1), f'{name}: frame raster')
                anim = r['animations'][name]
                require(anim['frames'] == list(range(count)), f'{name}: frame sequence')
                require(anim['frameRate'] == (8 if size == 48 else 4), f'{name}: frame rate')
                require(anim['repeat'] == (0 if size == 48 else -1), f'{name}: repeat mode')
                hashes = set()
                for i in range(count):
                    tile = image.crop((i * size, y, (i + 1) * size, y + size))
                    require(tile.getchannel('A').getbbox() is not None, f'{name}[{i}]: empty frame')
                    hashes.add(hashlib.sha256(tile.tobytes()).hexdigest())
                    covered.paste(1, (i * size, y, (i + 1) * size, y + size))
                    frames += 1
                require(len(hashes) == count, f'{name}: duplicate animation frames')
            require(all(not px[3] for px, used in zip(pixels, [covered.getpixel((x, y)) for y in range(covered.height) for x in range(covered.width)]) if not used), 'FX unused cells are not transparent')
        results.append(dict(file=file, width=image.width, height=image.height,
                            visibleColors=len(colors), alphaValues=sorted(alphas),
                            frames=frames, passed=len(errors) == start))
    require(len(union) <= 32, 'Combined batch exceeds shared 32-color palette')
    prompts = json.loads((ROOT / 'docs/art/batch-calderwick2-generation.json').read_text())['assets']
    require({p['file'] for p in prompts} == set(EXPECTED), 'Missing generation records')
    require(all(p['prompt'].startswith('STYLE GUIDE') for p in prompts), 'Missing prompt style block')
    report = dict(batch='calderwick2', passed=not errors, assetCount=len(assets),
                  sharedVisibleColors=len(union), errors=errors, assets=results,
                  rasterScope='Exact PNG dimensions and integer atlas cell boundaries; scene dimensions are explicitly 480x270 or 240x135, not multiples of 16.',
                  visualReview='Contact sheet and enlarged FX inspected; no game integration performed.')
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: report[k] for k in ['passed', 'assetCount', 'sharedVisibleColors', 'errors']}, ensure_ascii=False))
    return 0 if not errors else 1

if __name__ == '__main__':
    raise SystemExit(main())
