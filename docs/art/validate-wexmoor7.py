"""Validate exported AO PNGs: python docs/art/validate-wexmoor7.py."""
from pathlib import Path
from collections import Counter
from PIL import Image
import hashlib
import json

root = Path(__file__).resolve().parents[2]
sprites = root / 'public/sprites'
manifest = json.loads((sprites / 'manifest-wexmoor7.json').read_text())
ids = ['wxn_bestatterin', 'wxn_lichtschreiber', 'wxn_torfgraeber',
       'wxn_apothekerin', 'wxn_telegrafist', 'wxn_hafenmeisterin',
       'wxn_krabbe', 'wxn_maler', 'tm_esse', 'tm_kerbe', 'tm_mulde']
extras = dict(zip(ids[:8] + ['tm_kerbe'], [4, 6, 7, 4, 6, 3, 8, 4, 4]))
expected = {}
for id in ids:
    expected[f'characters/{id}_walk.png'] = (64, 128)
    expected[f'portraits/{id}_emotions.png'] = (256, 64)
    expected[f'portraits/AK_{id}_emotions2.png'] = (256, 64)
    expected[f'ui/heads/{id}.png'] = (24, 24)
for id, n in extras.items():
    expected[f'characters/{id}_extra.png'] = (n * 16, 32)
expected.update({'battle/enemy_wxn_maler.png': (288, 240),
                 'battle/enemy_gemalte_frau.png': (384, 320),
                 'props/AO_staffelei.png': (32, 32),
                 'props/AO_staffelei_portraet.png': (32, 32)})
assets = manifest['assets']
assert len(assets) == len(expected) == 57
assert len({a['id'] for a in assets}) == 57
assert {a['file'] for a in assets} == set(expected)
palette = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
assert len(palette) == 32
union = set()
records = []
occupied = 0
for asset in assets:
    path = sprites / asset['file']
    source = Image.open(path)
    assert source.mode == 'P', (path, 'not indexed')
    im = source.convert('RGBA')
    assert im.size == expected[asset['file']] == (asset['width'], asset['height'])
    pixels = list(im.get_flattened_data())
    assert {p[3] for p in pixels} == {0, 255}, (path, 'alpha')
    colors = {p[:3] for p in pixels if p[3]}
    assert colors <= palette
    union |= colors
    fw, fh, cols, rows = (asset[k] for k in ['frameWidth', 'frameHeight', 'columns', 'rows'])
    assert im.size == (fw * cols, fh * rows)
    frames = [im.crop((c*fw, r*fh, (c+1)*fw, (r+1)*fh)) for r in range(rows) for c in range(cols)]
    counts = asset.get('occupiedCounts', [cols] * rows)
    for n, frame in enumerate(frames):
        box = frame.getbbox()
        if n % cols >= counts[n // cols]:
            assert box is None, (path, n, 'padding not empty')
            continue
        assert box, (path, n, 'missing frame')
        occupied += 1
        assert box[0] >= 1 and box[1] >= 1 and box[2] < fw and box[3] < fh, (path, n, 'edge bleed')
        if 'baseline' in asset:
            assert box[3] - 1 == asset['baseline'], (path, n, 'baseline')
    if asset['kind'] == 'portraits':
        assert len({f.tobytes() for f in frames}) == 4, (path, 'duplicate expressions')
    if asset['kind'] == 'walk':
        assert list(asset['animations']) == ['down', 'left', 'right', 'up']
        for row in range(4):
            assert len({f.tobytes() for f in frames[row*4:row*4+4]}) >= 3
    for animation in asset['animations'].values():
        assert animation['frameRate'] > 0
        for n in animation['frames']:
            assert 0 <= n < len(frames) and frames[n].getbbox()
    for pair in asset.get('windupFrames', {}).values():
        assert len(pair) == 2 and frames[pair[0]].tobytes() == frames[pair[1]].tobytes()
    records.append(dict(file=asset['file'], size=list(im.size), colors=len(colors),
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
assert len(union) <= 32
report = dict(batch='wexmoor7', result='pass', assets=len(assets), occupiedFrames=occupied,
              visibleColors=len(union), byKind=dict(Counter(a['kind'] for a in assets)),
              checks=['exact required file set and dimensions', 'indexed PNG', 'binary alpha',
                      'shared 32-color palette', 'occupied frames and empty battle padding',
                      'one pixel transparent cell margin', 'uniform baselines',
                      'distinct portrait expressions', 'distinct walk steps in each direction',
                      'valid animation frame references', 'two identical attack windup frames'],
              visualReview='Contact sheets inspected: identities, directions, expressions, special poses, combat rows. Runtime integration remains separate.',
              files=records)
(root / 'docs/art/batch-wexmoor7-validation.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({k: report[k] for k in ['result', 'assets', 'occupiedFrames', 'visibleColors', 'byKind']}))
