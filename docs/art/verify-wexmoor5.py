"""Independent acceptance checks and pixel previews for Paket W.

Usage: python docs/art/verify-wexmoor5.py [--preview]
Requires Pillow and numpy. Does not need the large generator originals.
"""
import hashlib
import json
import pathlib
import sys

import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parents[2]
SPR = ROOT / 'public/sprites'
DOC = ROOT / 'docs/art'
MONSTERS = ['pfahlbohrer', 'ratsherr', 'kellerkrebs', 'namensmade']
ALL = MONSTERS + ['buergermeister']
ITEMS = ['pfahlholz', 'ratssiegel', 'krebspanzer', 'madenwachs', 'moortee',
         'salzbrot', 'amtskette', 'veys_stimmgabel', 'schreintaefelchen']
NN = Image.Resampling.NEAREST


def verify():
    manifest = json.loads((SPR / 'manifest-wexmoor5.json').read_text())
    jobs = json.loads((DOC / 'batch-wexmoor5-generation.json').read_text())
    expected = {'tilesets/W_01_altstadt_tiles.png': (128, 64),
                'props/W_altstadt_props.png': (320, 128), 'battle/bg_altstadt.png': (480, 270),
                'ui/W_boss_buergermeister.png': (480, 270), 'ui/W_zug_portraits.png': (80, 16),
                'battle/enemy_buergermeister.png': (576, 672),
                'fx/fx_splitter.png': (288, 48), 'fx/fx_siegel.png': (240, 48),
                'fx/fx_madenwachs.png': (288, 48), 'fx/fx_ratsglocke.png': (576, 48)}
    for ident in ALL:
        expected[f'ui/bestiary/W_{ident}.png'] = (96, 128)
    for i, ident in enumerate(MONSTERS):
        expected[f'battle/enemy_{ident}.png'] = (384, 320)
        expected[f'characters/W_ow_{ident}.png'] = (64 if i < 2 else 128, 128)
    for ident in ITEMS:
        for size in (16, 32):
            expected[f'items/{"32/" if size == 32 else ""}{ident}.png'] = (size, size)
    assets = {a['file']: a for a in manifest['assets']}
    assert len(assets) == len(manifest['assets']) == 41
    assert set(assets) == set(expected), 'Missing or unexpected output'
    assert manifest['batch'] == jobs['batch'] == 'wexmoor5'
    assert len(jobs['jobs']) == 23 and all(j['prompt'].startswith('STYLE GUIDE') for j in jobs['jobs'])
    assert all(len(j['sha256']) == 64 and j['references'] and j['sourceRects'] for j in jobs['jobs'])
    palette = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
    assert len(palette) == 32
    reports = []
    seen_colors = set()
    for path, size in expected.items():
        a = assets[path]
        im = Image.open(SPR / path)
        assert im.mode == 'P' and im.size == size == (a['width'], a['height']), path
        ar = np.array(im.convert('RGBA'))
        alpha = set(np.unique(ar[:, :, 3]).tolist())
        assert alpha <= {0, 255}, path
        assert alpha == ({0, 255} if a['transparent'] else {255}), path
        colors = {tuple(v) for v in ar[ar[:, :, 3] == 255, :3]}
        assert colors <= palette and len(colors) <= 32, path
        seen_colors |= colors
        fw, fh, cols, rows = (a[k] for k in ['frameWidth', 'frameHeight', 'columns', 'rows'])
        assert (fw * cols, fh * rows) == size, path

        def cell(index):
            return ar[(index // cols) * fh:(index // cols + 1) * fh,
                      (index % cols) * fw:(index % cols + 1) * fw]

        if 'baseline' in a:
            active = set()
            counts = [4, 6, 6, 6, 2, 6, 6] if 'buergermeister' in path else (
                [4, 6, 6, 2, 6] if path.startswith('battle/') else [4, 4, 4, 4])
            expected_names = (['idle', 'chain_lash', 'council_bell', 'verdict', 'hit', 'phase2', 'defeated']
                              if 'buergermeister' in path else
                              ['idle', 'attack_a', 'attack_b', 'hit', 'death'] if path.startswith('battle/')
                              else ['down', 'left', 'right', 'up'])
            assert list(a['animations']) == expected_names, path
            for row, (name, anim) in enumerate(a['animations'].items()):
                assert anim['frames'] == list(range(row * cols, row * cols + counts[row])), (path, name)
                frames = [cell(f) for f in anim['frames']]
                assert len({c.tobytes() for c in frames}) >= 2, (path, name, 'static animation')
                assert anim['frameRate'] > 0 and anim['repeat'] in (0, -1)
                for index, frame in zip(anim['frames'], frames):
                    yy, xx = np.where(frame[:, :, 3] > 0)
                    assert len(xx) > 0 and 0 < xx.min() and xx.max() < fw - 1, (path, index, 'horizontal clipping')
                    assert yy.min() > 0 and yy.max() + 1 == a['baseline'], (path, index, 'baseline')
                    active.add(index)
            for index in set(range(cols * rows)) - active:
                assert not cell(index)[:, :, 3].any(), (path, index, 'unused cell')
            if path.startswith('battle/'):
                assert a['windupRows'] == [1, 2] and a['facing'] == 'left'
                for row in [1, 2]:
                    assert np.array_equal(cell(row * cols), cell(row * cols + 1)), (path, row, 'wind-up')
        elif path.startswith('fx/'):
            assert a['animations']['play']['frames'] == list(range(cols))
            assert len({cell(i).tobytes() for i in range(cols)}) == cols
            for i in range(cols):
                c = cell(i)[:, :, 3]
                assert c.any() and not (c[0].any() or c[-1].any() or c[:, 0].any() or c[:, -1].any()), path
        if 'regions' in a:
            occupied = np.zeros((size[1], size[0]), dtype=bool)
            for name, (x, y, w, h) in a['regions'].items():
                assert 0 <= x < x + w <= size[0] and 0 <= y < y + h <= size[1], name
                assert not occupied[y:y + h, x:x + w].any(), name
                occupied[y:y + h, x:x + w] = True
                assert ar[y:y + h, x:x + w, 3].any(), name
            assert not ar[~occupied, 3].any(), (path, 'outside regions')
            for group in a.get('states', {}).values():
                assert set(group) <= a['regions'].keys()
            for anim in a.get('regionAnimations', {}).values():
                assert set(anim['regions']) <= a['regions'].keys()
            def region(name):
                x, y, w, h = a['regions'][name]
                return ar[y:y+h, x:x+w]
            assert not np.array_equal(region('window_0'), region('window_1'))
            assert not np.array_equal(region('sluice_open'), region('sluice_closed'))
        reports.append(dict(file=path, size=list(size), visibleColors=len(colors), alpha=sorted(alpha),
                            sha256=hashlib.sha256((SPR / path).read_bytes()).hexdigest()))
    assert len(seen_colors) <= 32
    for ident in ITEMS:
        small = Image.open(SPR / f'items/{ident}.png').convert('RGBA')
        big = Image.open(SPR / f'items/32/{ident}.png').convert('RGBA')
        assert np.array_equal(np.array(small), np.array(big.resize((16, 16), NN))), ident
    turn = assets['ui/W_zug_portraits.png']
    assert turn['ids'] == ALL and len(turn['sources']) == 5
    for i, source in enumerate(turn['sources']):
        assert source['file'] == f'battle/enemy_{ALL[i]}.png'
        im = Image.open(SPR / source['file']).convert('RGBA').crop(source['sourceRect'])
        im = im.crop(im.getchannel('A').getbbox())
        scale = min(16 / im.width, 16 / im.height)
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), NN)
        expected_head = Image.new('RGBA', (16, 16))
        expected_head.paste(im, ((16 - im.width) // 2, (16 - im.height) // 2))
        actual = Image.open(SPR / 'ui/W_zug_portraits.png').convert('RGBA').crop((i*16, 0, (i+1)*16, 16))
        assert np.array_equal(np.array(actual), np.array(expected_head)), ALL[i]
    tiles = np.array(Image.open(SPR / 'tilesets/W_01_altstadt_tiles.png'))
    def tile(index):
        x, y = index % 8 * 16, index // 8 * 16
        return tiles[y:y+16, x:x+16]
    for group in (range(4), range(4, 12)):
        for i in group:
            assert np.array_equal(tile(i)[0], tile(i)[-1])
            assert np.array_equal(tile(i)[:, 0], tile(i)[:, -1])
            assert np.array_equal(tile(i)[0], tile(group.start)[0])
            assert np.array_equal(tile(i)[:, 0], tile(group.start)[:, 0])
    assert np.array_equal(tile(24)[:, -1], tile(25)[:, 0])
    assert np.array_equal(tile(26)[-1], tile(27)[0])
    for i in range(4):
        assert not np.array_equal(tile(4+2*i), tile(5+2*i)), 'Static water'
    assert assets['battle/bg_altstadt.png']['groundStrip'] == [0, 200, 480, 70]
    report = dict(batch='wexmoor5', result='pass', pngCount=41, sourceCount=23,
                  globalVisibleColors=len(seen_colors), checks=[
                      'Exact independent file inventory, dimensions, indexed palette and binary alpha',
                      'Animation row order/counts, variation, empty cells and frame margins',
                      'Exact two-frame wind-up holds and common bottom baseline',
                      'FX origins and cell bounds, prop region bounds/states',
                      'Tile seams, water variation, item size equivalence and portrait provenance'], assets=reports)
    (DOC / 'validation-wexmoor5.json').write_text(json.dumps(report, indent=2) + '\n')
    print(f'PASS: 41 PNGs; 23 sources; {len(seen_colors)} shared visible colors; all raster checks passed')


def previews():
    for ident in ALL:
        im = Image.open(SPR / f'battle/enemy_{ident}.png').convert('RGBA')
        bg = Image.new('RGBA', im.size, '#74777d')
        bg.alpha_composite(im)
        bg.resize((im.width * 2, im.height * 2), NN).convert('RGB').save(DOC / f'preview-wexmoor5-battle-{ident}.png')
    canvas = Image.new('RGB', (1440, 1050), '#60656b')
    draw = ImageDraw.Draw(canvas)

    def paste(path, x, y, scale=1):
        im = Image.open(SPR / path).convert('RGBA')
        im = im.resize((round(im.width * scale), round(im.height * scale)), NN)
        canvas.paste(im, (x, y + 18), im)
        draw.text((x, y), pathlib.Path(path).name, fill='white')

    paste('battle/bg_altstadt.png', 0, 0)
    paste('ui/W_boss_buergermeister.png', 480, 0)
    paste('tilesets/W_01_altstadt_tiles.png', 970, 0, 3)
    paste('props/W_altstadt_props.png', 0, 300, 2)
    for i, ident in enumerate(ALL):
        paste(f'ui/bestiary/W_{ident}.png', 650 + i * 150, 300, 1.4)
    for i, ident in enumerate(MONSTERS):
        paste(f'characters/W_ow_{ident}.png', i * 220, 610, 1.7)
    paste('ui/W_zug_portraits.png', 950, 610, 4)
    for i, ident in enumerate(ITEMS):
        paste(f'items/32/{ident}.png', i * 150, 890, 3)
    canvas.save(DOC / 'preview-wexmoor5-overview.png')
    canvas = Image.new('RGB', (1200, 620), '#666a72')
    draw = ImageDraw.Draw(canvas)
    for i, ident in enumerate(['splitter', 'siegel', 'madenwachs', 'ratsglocke']):
        paste(f'fx/fx_{ident}.png', 0, i * 155, 2)
    canvas.save(DOC / 'preview-wexmoor5-effects.png')


if __name__ == '__main__':
    verify()
    if '--preview' in sys.argv:
        previews()
