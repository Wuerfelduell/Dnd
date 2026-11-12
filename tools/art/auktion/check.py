#!/usr/bin/env python3
"""Validate the DE export against its independent delivery contract (Pillow only)."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[3]
SPRITES = ROOT / 'public/sprites'
manifest = json.loads((SPRITES / 'manifest-auktion.json').read_text())
palette = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
errors, results = [], []

def require(ok, message):
    if not ok:
        errors.append(message)

humans = ['fa2_vance', 'fa2_traeger', 'fa2_bieter_reeder', 'fa2_bieter_witwe', 'fa2_bieter_zirkel']
people = humans + ['fa2_hund']
expected = {f'characters/{id}.png': (16, 32, 4, 4) for id in humans}
expected['characters/fa2_hund.png'] = (32, 32, 4, 4)
for id in people:
    expected[f'portraits/{id}.png'] = (64, 64, 1, 1)
    expected[f'ui/heads/{id}.png'] = (24, 24, 1, 1)
expected['portraits/fa2_vance_emotions.png'] = (64, 64, 4, 2)
for id in humans[2:]:
    expected[f'portraits/{id}_emotions.png'] = (64, 64, 2, 2)
for id, n in [('fa2_vance_hammer', 4), ('fa2_vance_zeigen', 3), ('fa2_traeger_los', 3)]:
    expected[f'characters/{id}.png'] = (16, 32, n, 1)
expected['characters/fa2_hund_bellen.png'] = (32, 32, 2, 1)
expected.update({
    'props/fa2_wagen.png': (96, 64, 2, 2),
    'props/fa2_lose.png': (16, 16, 10, 1),
    'props/fa2_lose_32.png': (32, 32, 10, 1),
    'props/fa2_hammer.png': (16, 16, 4, 1),
    'props/fa2_tafel.png': (48, 32, 1, 1),
    'ui/fa2_auktion.png': (240, 135, 1, 1),
    'ui/fa2_symbole.png': (16, 16, 7, 1),
    'fx/fa2_zuschlag.png': (32, 32, 6, 1),
    'fx/fa2_glocke.png': (16, 16, 4, 1),
})
slugs = ['fingerhut', 'kamm', 'flakon', 'tuch', 'spule', 'medaillon', 'leisten', 'faecher', 'handwaermer', 'kiesel']
for slug in slugs:
    expected[f'items/fa2_los_{slug}.png'] = (16, 16, 1, 1)
    expected[f'items/32/fa2_los_{slug}.png'] = (32, 32, 1, 1)

require(manifest['batch'] == 'auktion', 'Wrong batch')
require(len(palette) == 32, 'Shared palette must contain 32 colors')
require(manifest['palette'] == json.loads((SPRITES / 'manifest-fasserin.json').read_text())['palette'], 'Palette differs from reference')
require(len({a['id'] for a in manifest['assets']}) == len(manifest['assets']), 'Duplicate asset ID')
require(len({a['file'] for a in manifest['assets']}) == len(manifest['assets']), 'Duplicate file')
require(set(expected) == {a['file'] for a in manifest['assets']}, 'Missing or extra manifest assets')
actual = {str(p.relative_to(SPRITES)) for p in SPRITES.rglob('fa2_*.png')}
require(actual == set(expected), 'Unlisted or missing fa2 PNG')

images = {}
for asset in manifest['assets']:
    file = asset['file']
    before = len(errors)
    try:
        im = Image.open(SPRITES / file).convert('RGBA')
    except Exception as error:
        errors.append(f'{file}: {error}')
        continue
    images[file] = im
    fw, fh, cols, rows = expected.get(file, (0, 0, 0, 0))
    require(im.size == (fw * cols, fh * rows), f'{file}: incorrect image dimensions')
    require(tuple(asset[k] for k in ['frameWidth', 'frameHeight', 'columns', 'rows']) == (fw, fh, cols, rows), f'{file}: incorrect frame grid')
    require(im.size == (asset['width'], asset['height']), f'{file}: manifest dimensions')
    pixels = set(im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata())
    alphas = {p[3] for p in pixels}
    colors = {p[:3] for p in pixels if p[3]}
    require(alphas == {0, 255}, f'{file}: alpha must be binary with empty space')
    require(len(colors) <= 32 and colors <= palette, f'{file}: palette violation')
    require(all(p == (0, 0, 0, 0) for p in pixels if p[3] == 0), f'{file}: hidden RGB fringe')
    require((0, 0, 0) not in colors and (255, 255, 255) not in colors, f'{file}: black/white fringe')
    frames = []
    for row in range(rows):
        for col in range(cols):
            frame = im.crop((col*fw, row*fh, (col+1)*fw, (row+1)*fh))
            frames.append(frame)
            require(frame.getbbox() is not None, f'{file}: empty required frame {len(frames)-1}')
            if asset.get('kind') in ['overworld', 'pose']:
                require(frame.getchannel('A').crop((0, 31, fw, 32)).getbbox() is None, f'{file}: baseline overflow')
                require(frame.getchannel('A').crop((0, 30, fw, 31)).getbbox() is not None, f'{file}: baseline y30 missing')
                require(asset.get('baseline') == 30, f'{file}: missing baseline metadata')
    for name, animation in asset['animations'].items():
        require(animation['frames'] and all(isinstance(n, int) and 0 <= n < len(frames) for n in animation['frames']), f'{file}/{name}: frame outside grid')
        require(animation['frameRate'] > 0, f'{file}/{name}: invalid speed')
        if len(animation['frames']) > 1:
            require(len({frames[n].tobytes() for n in animation['frames']}) > 1, f'{file}/{name}: static duplicate animation')
    if asset.get('kind') == 'overworld':
        require(list(asset['animations']) == ['down', 'left', 'right', 'up'], f'{file}: direction order')
    def region_check(regions):
        for name, r in regions.items():
            require(all(isinstance(r[k], int) for k in ['x', 'y', 'width', 'height']), f'{file}/{name}: noninteger region')
            require(r['x'] >= 0 and r['y'] >= 0 and r['width'] > 0 and r['height'] > 0 and r['x'] + r['width'] <= im.width and r['y'] + r['height'] <= im.height, f'{file}/{name}: region outside image')
            if 'slice' in r:
                s = r['slice']
                require(s['left'] + s['right'] < r['width'] and s['top'] + s['bottom'] < r['height'], f'{file}/{name}: invalid slices')
            region_check(r.get('parts', {}))
    region_check(asset.get('regions', {}))
    results.append({'file': file, 'size': list(im.size), 'visibleColors': len(colors), 'frames': len(frames), 'sha256': hashlib.sha256((SPRITES/file).read_bytes()).hexdigest(), 'ok': len(errors) == before})

for i, slug in enumerate(slugs):
    for size, atlas, folder in [(16, 'props/fa2_lose.png', 'items'), (32, 'props/fa2_lose_32.png', 'items/32')]:
        piece = images[atlas].crop((i*size, 0, (i+1)*size, size))
        require(piece.tobytes() == images[f'{folder}/fa2_los_{slug}.png'].tobytes(), f'{slug}: atlas/item mismatch {size}')
wagon = images['props/fa2_wagen.png']
for y in [0, 64]:
    first = wagon.crop((0, y, 96, y+64))
    second = wagon.crop((96, y, 192, y+64))
    diff = ImageChops.difference(first, second).convert('RGB').getbbox()
    require(diff is not None and diff[0] >= 6 and diff[1] >= 23 and diff[2] <= 13 and diff[3] <= 32, 'Wagon geometry changes outside lantern')
ui = next(a for a in manifest['assets'] if a['id'] == 'fa2_auktion')
parts = ui['regions']['panel']['parts']
require(len(parts) == 9, 'Outer UI needs nine explicit slice samples')
r = parts['center']
require(images['ui/fa2_auktion.png'].crop((r['x'], r['y'], r['x']+r['width'], r['y']+r['height'])).getbbox() is None, 'UI centre sample must be transparent')
generation = json.loads((ROOT/'docs/art/batch-auktion-generation.json').read_text())
require(len(generation['assets']) == 24, 'Expected 24 independent generation prompts')
require(all(a['prompt'].startswith('STYLE GUIDE (apply to every asset):') for a in generation['assets']), 'Missing style block')
report = {'batch': 'auktion', 'ok': not errors, 'assetCount': len(results), 'frameCount': sum(x['frames'] for x in results), 'sharedPaletteColors': len(palette), 'checks': ['independent scope', 'dimensions and grids', 'occupied cells', 'baseline', 'animation bounds and variation', 'palette membership', 'binary alpha and hidden RGB', 'regions and slices', 'item/atlas identity', 'lantern-only changes', 'prompt completeness'], 'limits': 'Style and direction semantics also require visual review; no runtime integration tested.', 'assets': results, 'errors': errors}
(ROOT/'docs/art/batch-auktion-validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(f"auktion: {len(results)} PNGs, {report['frameCount']} frames, {len(palette)} shared colors; {'PASS' if not errors else 'FAIL'}")
for error in errors:
    print(error)
raise SystemExit(bool(errors))
