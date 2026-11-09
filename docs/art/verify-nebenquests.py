"""Check AJ delivery independently against both wishlists; optionally render previews.

Usage: python docs/art/verify-nebenquests.py [--preview]
Requires Pillow. No generator sources required.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'docs/art'
SPRITES = ROOT / 'public/sprites'


def expected_files():
    expected = {}
    for region in ('kg', 'wx'):
        text = (ROOT / f'docs/story/{region}_nebenquests/grafikwuensche.md').read_text()
        for line in text.splitlines():
            match = re.match(r'\| `([^`]+)` \| ([^|]+) \|', line)
            if not match:
                continue
            identity, kind = match.groups()
            files = expected.setdefault(identity, set())
            if 'Lauf' in kind:
                files.add(f'characters/{identity}_walk.png')
            elif 'Portrait' in kind:
                files.add(f'portraits/{identity}_emotions.png')
            elif 'Kampf' in kind:
                files.update((f'battle/enemy_{identity}.png', f'ui/bestiary/{identity}.png'))
            elif 'Deko' in kind:
                files.add(f'props/{identity}.png')
            else:
                files.update((f'items/{identity}.png', f'items/32/{identity}.png'))
    return expected


def frame(image, index, asset):
    fw, fh, cols = asset['frameWidth'], asset['frameHeight'], asset['columns']
    x, y = (index % cols)*fw, (index // cols)*fh
    return image.crop((x, y, x+fw, y+fh))


def preview(assets):
    def board(name, width, height):
        image = Image.new('RGB', (width, height), '#343d48')
        return image, ImageDraw.Draw(image)
    def place(board, asset, xy, scale):
        image = Image.open(SPRITES/asset['file']).convert('RGBA')
        image = image.resize((image.width*scale, image.height*scale), Image.Resampling.NEAREST)
        board.paste(image, xy, image)
    canvas, draw = board('characters', 760, 7*286)
    for row, walk in enumerate(a for a in assets if a['kind'] == 'walk'):
        portrait = next(a for a in assets if a['contentId'] == walk['contentId'] and a['kind'] == 'portrait')
        y = row*286
        draw.text((12, y+4), walk['contentId'], fill='#eee2c5')
        place(canvas, walk, (12, y+24), 2)
        place(canvas, portrait, (170, y+70), 2)
    canvas.save(ART/'preview-nebenquests-characters.png')
    canvas, draw = board('battle', 840, 3*420)
    for row, battle in enumerate(a for a in assets if a['kind'] == 'battle'):
        card = next(a for a in assets if a['contentId'] == battle['contentId'] and a['kind'] == 'bestiary')
        y = row*420
        draw.text((12, y+4), battle['contentId'], fill='#eee2c5')
        place(canvas, battle, (12, y+24), 2)
        place(canvas, card, (620, y+50), 2)
    canvas.save(ART/'preview-nebenquests-battle.png')
    objects = [a for a in assets if a['kind'] in ('item', 'prop') and not a['file'].startswith('items/32/')]
    canvas, draw = board('objects', 960, 4*235)
    for index, asset in enumerate(objects):
        x, y = (index % 4)*240, (index // 4)*235
        draw.text((x+8, y+4), asset['contentId'], fill='#eee2c5')
        place(canvas, asset, (x+30, y+26), 6 if asset['kind'] == 'item' else 4)
    canvas.save(ART/'preview-nebenquests-objects.png')


def main():
    manifest = json.loads((SPRITES/'manifest-nebenquests.json').read_text())
    expected = expected_files()
    assets = manifest['assets']
    assert len(expected) == 20
    assert len(assets) == 40
    assert len({a['id'] for a in assets}) == 40
    assert {a['file'] for a in assets} == set().union(*expected.values())
    allowed = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
    union, report = set(), []
    for asset in assets:
        path = SPRITES/asset['file']
        source = Image.open(path)
        assert source.mode == 'P', path
        image = source.convert('RGBA')
        assert image.size == (asset['width'], asset['height']), path
        alpha = set(image.getchannel('A').getdata())
        assert alpha <= {0, 255}, path
        assert 255 in alpha, path
        assert (0 in alpha) == asset['transparent'], path
        colors = {p[:3] for p in image.getdata() if p[3]}
        assert colors <= allowed and len(colors) <= 32, path
        union.update(colors)
        if 'animations' in asset:
            total = asset['columns']*asset['rows']
            used = set()
            for animation in asset['animations'].values():
                assert animation['frameRate'] > 0
                assert animation['frames']
                for index in animation['frames']:
                    assert 0 <= index < total
                    used.add(index)
            for index in range(total):
                cell = frame(image, index, asset)
                bbox = cell.getchannel('A').getbbox()
                assert bool(bbox) == (index in used), (path, index)
                if bbox:
                    assert bbox[0] >= 1 and bbox[2] <= asset['frameWidth']-1, (path, index, bbox)
                    assert bbox[1] >= 1 and bbox[3] == asset['baseline'], (path, index, bbox)
            if asset['kind'] == 'battle':
                assert frame(image, 6, asset).tobytes() == frame(image, 7, asset).tobytes(), path
                assert frame(image, 7, asset).tobytes() != frame(image, 9, asset).tobytes(), path
            if asset['kind'] == 'portrait':
                assert len({frame(image, i, asset).tobytes() for i in range(4)}) == 4, path
            if asset['kind'] == 'walk':
                assert frame(image, 0, asset).tobytes() != frame(image, 12, asset).tobytes(), path
                for row in range(4):
                    assert len({frame(image, row*4+c, asset).tobytes() for c in range(4)}) >= 2, (path, row)
        if asset['kind'] == 'item' and asset['file'].startswith('items/32/'):
            small = Image.open(SPRITES/'items'/path.name).convert('RGBA')
            assert image.tobytes() == small.resize((32, 32), Image.Resampling.NEAREST).tobytes(), path
        report.append({'file': asset['file'], 'size': list(image.size), 'visibleColors': len(colors), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    assert len(union) <= 32
    items = [a for a in assets if a['kind'] == 'item' and a['width'] == 16]
    assert len({Image.open(SPRITES/a['file']).convert('RGBA').tobytes() for a in items}) == 7
    result = {'status': 'passed', 'ids': len(expected), 'pngs': len(assets), 'sharedVisibleColors': len(union),
              'checks': ['complete wishlists', 'indexed PNG', 'exact dimensions', 'shared palette', 'binary alpha', 'frame occupancy', 'cell margins and baselines', 'two held windup frames', 'distinct emotions and walking phases', 'distinct items', 'nearest-neighbor 32px variants'], 'files': report}
    (ART/'validation-nebenquests.json').write_text(json.dumps(result, indent=2)+'\n')
    if '--preview' in sys.argv:
        preview(assets)
    print(f'PASS: {len(expected)} IDs, {len(assets)} PNGs, {len(union)} shared visible colors')


if __name__ == '__main__':
    main()
