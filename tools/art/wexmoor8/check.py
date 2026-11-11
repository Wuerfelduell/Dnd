#!/usr/bin/env python3
"""Validate BT exports against the repository originals (requires Pillow).

Checks raster geometry, original alpha footprints, palette, animation frames,
regions, pin coordinates and complete delivery. Semantic/visual review remains
necessary; image statistics cannot establish that a tile depicts the right thing.
"""
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[3]
SPRITES = ROOT / 'public/sprites'


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def frame(image, asset, index):
    w, h, cols = asset['frameWidth'], asset['frameHeight'], asset['columns']
    x, y = index % cols * w, index // cols * h
    return image.crop((x, y, x + w, y + h))


def main():
    manifest = json.loads((SPRITES / 'manifest-wexmoor8.json').read_text())
    assets = manifest['assets']
    by_id = {a['id']: a for a in assets}
    require(len(by_id) == len(assets), 'Duplicate asset IDs')
    palette = {tuple(bytes.fromhex(c.lstrip('#'))) for c in manifest['palette']}
    require(len(palette) <= 32, 'Shared palette exceeds 32 colors')
    tiles = {
        'R_wexmoor_tiles_v2', 'R_oberstadt_tiles_v2', 'R_salzmarkt_tiles_v2',
        'R_torf_tiles_v2', 'C_bahnhof_wexmoor_v2', 'R_innen_wexmoor_v2',
        'R_leuchtturm_tiles_v2', 'R_vergessmoor_tiles_v2',
        'Q_kajuete_tiles_v2', 'S_salzwatt_tiles_v2',
    }
    require(tiles <= by_id.keys(), 'Missing required compatible replacement sheets')
    facades = [a for a in assets if a['file'].startswith('facades/')]
    require(len([a for a in facades if not a['id'].endswith('_nacht')]) >= 18,
            'Need 18 daytime facade sheets')
    require(len([a for a in facades if a['id'].endswith('_nacht')]) >= 6,
            'Need 6 illuminated facade variants')
    expected = {
        'wexmoor_v2_props': (16, 16, 8, 6),
        'wexmoor_v2_gross': (32, 32, 4, 4),
        'wexmoor_v2_anim': (16, 16, 4, 6),
        'wexmoor_v2_wetter': (64, 64, 6, 4),
        'wexmoor_v2_tiere': (16, 16, 4, 6),
        'wexmoor_v2_stadtkarte': (480, 270, 1, 1),
        'wexmoor_v2_nebel': (480, 270, 1, 1),
        'wexmoor_v2_tileanim': (16, 16, 4, 9),
    }
    for id, geometry in expected.items():
        require(id in by_id, f'Missing {id}')
        require(tuple(by_id[id][k] for k in ('frameWidth', 'frameHeight', 'columns', 'rows')) == geometry,
                f'{id}: incorrect frame geometry')
    images = {}
    for a in assets:
        name = a['file']
        path = SPRITES / name
        require(path.is_file(), f'Missing {name}')
        im = Image.open(path).convert('RGBA')
        images[a['id']] = im
        require(im.size == (a['width'], a['height']), f'{name}: dimensions')
        require(im.size == (a['columns'] * a['frameWidth'], a['rows'] * a['frameHeight']),
                f'{name}: grid does not fill sheet exactly')
        raw = im.tobytes()
        pixels = [tuple(raw[i:i + 4]) for i in range(0, len(raw), 4)]
        alpha_values = {p[3] for p in pixels}
        require(alpha_values <= {0, 255}, f'{name}: non-binary alpha')
        visible = {p[:3] for p in pixels if p[3]}
        require(len(visible) <= 32 and visible <= palette, f'{name}: palette')
        require(all(p[:3] == (0, 0, 0) for p in pixels if not p[3]),
                f'{name}: transparent matte RGB')
        require(bool(a['transparent']) == (0 in alpha_values), f'{name}: transparency metadata')
        if a['id'] in tiles or a['file'].startswith('facades/'):
            old_path = SPRITES / a['replacesFile']
            old = Image.open(old_path).convert('RGBA')
            require(im.size == old.size, f'{name}: original dimensions changed')
            require(hashlib.sha256(old_path.read_bytes()).hexdigest() == a['originalSha256'],
                    f'{name}: comparison original changed')
            old_alpha = old.getchannel('A').point(lambda p: 255 if p >= 128 else 0)
            require(ImageChops.difference(im.getchannel('A'), old_alpha).getbbox() is None,
                    f'{name}: original alpha footprint changed')
        if a['id'] in tiles:
            require(not any(55 <= r <= 130 and r - g >= 18 and g - b >= 8
                            for r, g, b in visible), f'{name}: Kettlegate brick-brown family')
            source = (ROOT / 'src/world/assets.js').read_text()
            for theme, bindings in a['themeCellBindings'].items():
                match = re.search(r'^\s*' + re.escape(theme) + r':\s*\{([^}]+)\}', source, re.M)
                require(match is not None, f'{theme}: source theme missing')
                actual = {k: json.loads(v) for k, v in re.findall(r'(\w+):\s*(\[[0-9, ]+\])', match.group(1))}
                require(bindings == actual, f'{theme}: tile groups or cell indices changed')
        for region, box in a.get('regions', {}).items():
            require(all(k in box for k in ('x', 'y', 'width', 'height')), f'{name}/{region}: region schema')
            x, y, w, h = (box[k] for k in ('x', 'y', 'width', 'height'))
            require(x >= 0 and y >= 0 and x + w <= im.width and y + h <= im.height,
                    f'{name}/{region}: region outside sheet')
            require(im.crop((x, y, x + w, y + h)).getchannel('A').getbbox(),
                    f'{name}/{region}: empty region')
        for animation, spec in a.get('animations', {}).items():
            indices = spec['frames']
            require(indices and all(isinstance(i, int) and 0 <= i < a['columns'] * a['rows'] for i in indices),
                    f'{name}/{animation}: invalid frame indices')
            require(spec['frameRate'] > 0, f'{name}/{animation}: invalid speed')
            require(all(frame(im, a, i).getchannel('A').getbbox() for i in indices),
                    f'{name}/{animation}: empty frame')
            if a['id'] in {'wexmoor_v2_anim', 'wexmoor_v2_tiere', 'wexmoor_v2_wetter', 'wexmoor_v2_tileanim'}:
                require(len({frame(im, a, i).tobytes() for i in indices}) == len(indices),
                        f'{name}/{animation}: duplicated animation phases')
        for target in a.get('animationOverrides', {}).values():
            require(target['asset'] in by_id, f'{name}: missing animation atlas')
            animation = by_id[target['asset']]['animations'][target['animation']]
            require(len(animation['frames']) == 4, f'{name}: expected four animation phases')
    for a in facades:
        if 'dayVariant' not in a:
            continue
        day, night = images[a['dayVariant']], images[a['id']]
        require(day.tobytes() != night.tobytes(), f"{a['id']}: night has no illumination change")
        for n in range(a['columns'] * a['rows']):
            if n not in a['changedCells']:
                require(frame(day, a, n).tobytes() == frame(night, a, n).tobytes(),
                        f"{a['id']}: geometry outside window cells changed")
    for id in expected:
        if id not in {'wexmoor_v2_stadtkarte', 'wexmoor_v2_tileanim'}:
            require(images[id].getchannel('A').getextrema() == (0, 255), f'{id}: needs transparent cutouts')
    require(images['wexmoor_v2_stadtkarte'].getchannel('A').getextrema() == (255, 255), 'Map must be opaque')
    pins = json.loads((ROOT / 'src/data/wexmoor.json').read_text())['city']['pins']
    require(by_id['wexmoor_v2_stadtkarte']['pins'] == pins, 'Pin coordinates changed')
    provenance = json.loads((ROOT / 'docs/art/batch-wexmoor8-generation.json').read_text())
    require({j['id'] for j in provenance['jobs']} == set(by_id), 'Prompt records incomplete')
    for job in provenance['jobs']:
        require(hashlib.sha256((SPRITES / job['output']).read_bytes()).hexdigest() == job['outputSha256'],
                f"{job['id']}: output hash differs from provenance")
    print(f'OK: {len(assets)} PNGs, shared {len(palette)}-color palette, original rasters/alpha, animations, regions and pins.')


if __name__ == '__main__':
    main()
