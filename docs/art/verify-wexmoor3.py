"""Validate Paket S export contracts. Requires Pillow and numpy."""
import json, pathlib
import numpy as np
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[2]
base = root / 'public/sprites'
manifest = json.loads((base / 'manifest-wexmoor3.json').read_text())
jobs = json.loads((root / 'docs/art/batch-wexmoor3-generation.json').read_text())['jobs']
assets = manifest['assets']
assert len(assets) == 111
assert len({a['id'] for a in assets}) == 111
assert len({a['file'] for a in assets}) == 111
expected = {j['path'] for j in jobs}
for j in jobs:
    if j.get('head'): expected.add('ui/heads/' + j['head'] + '.png')
    for item in j.get('items', []):
        expected.update(['items/' + item + '.png', 'items/32/' + item + '.png'])
assert {a['file'] for a in assets} == expected
colors_all = set()
report = []
for a in assets:
    im = Image.open(base / a['file'])
    ar = np.array(im.convert('RGBA')); alpha = ar[:, :, 3]
    assert im.mode == 'P', a['id']
    assert im.size == (a['width'], a['height']), a['id']
    assert set(np.unique(alpha)) <= {0, 255}, a['id']
    if not a['transparent']: assert (alpha == 255).all(), a['id']
    colors = {tuple(p[:3]) for p in ar.reshape(-1, 4) if p[3]}
    colors_all |= colors
    fw, fh, cols, rows = (a[k] for k in ['frameWidth', 'frameHeight', 'columns', 'rows'])
    assert im.size == (fw * cols, fh * rows), a['id']
    frames = []
    for y in range(rows):
        for x in range(cols): frames.append(ar[y*fh:(y+1)*fh, x*fw:(x+1)*fw])
    used = set()
    for name, anim in a.get('animations', {}).items():
        ff = anim['frames']; used.update(ff)
        assert all(0 <= f < cols*rows and frames[f][:,:,3].any() for f in ff), (a['id'], name)
        if len(ff) > 1: assert len({frames[f].tobytes() for f in ff}) > 1, (a['id'], name)
    if 'baseline' in a:
        for i in used:
            aa = frames[i][:,:,3]
            assert not aa[:,0].any() and not aa[:,-1].any(), (a['id'], i, 'edge')
            if a['baseline'] is not None:
                bottom = np.where(aa)[0].max()
                assert a['baseline'] - 2 <= bottom < a['baseline'], (a['id'], i, bottom)
        for i in set(range(cols*rows)) - used: assert not frames[i][:,:,3].any(), (a['id'], 'padding')
    for row in a.get('windupRows', []):
        assert np.array_equal(frames[row*cols], frames[row*cols+1]), (a['id'], 'windup')
    region_mask = np.zeros_like(alpha, dtype=bool)
    for name, (x,y,w,h) in a.get('regions', {}).items():
        assert min(x,y) >= 0 and x+w <= im.width and y+h <= im.height, (a['id'], name)
        assert not region_mask[y:y+h,x:x+w].any(), (a['id'], name, 'overlap')
        region_mask[y:y+h,x:x+w] = True
        assert alpha[y:y+h,x:x+w].any(), (a['id'], name, 'empty')
    for name, anim in a.get('regionAnimations', {}).items():
        ff=[]
        for region in anim['regions']:
            x,y,w,h=a['regions'][region];ff.append(ar[y:y+h,x:x+w].tobytes())
        assert len(set(ff)) > 1, (a['id'], name)
    if a.get('regions'): assert not alpha[~region_mask].any(), (a['id'], 'outside regions')
    if a.get('sourcePortrait'):
        portrait=Image.open(base/a['sourcePortrait']).convert('RGBA')
        assert np.array_equal(ar, np.array(portrait.crop((8,0,56,48)).resize((24,24), Image.Resampling.NEAREST)))
    report.append({'file': a['file'], 'size': list(im.size), 'colors': len(colors), 'passed': True})
assert len(colors_all) <= 32
for j in jobs:
    if j['kind'] == 'items':
        atlas = Image.open(base/j['path']).convert('RGBA')
        for i, item in enumerate(j['items']):
            for size, rect, sub in [(16,(i*16,0,i*16+16,16),''),(32,(i*32,16,i*32+32,48),'32/')]:
                icon=Image.open(base/('items/'+sub+item+'.png')).convert('RGBA')
                assert icon.size == (size,size) and icon.tobytes() == atlas.crop(rect).tobytes()
    if j.get('small'):
        ar=np.array(Image.open(base/j['path']).convert('RGBA'))
        for y in range(4):
            for x in range(4):
                a=ar[y*32:(y+1)*32,x*32:(x+1)*32,3];yy,xx=np.where(a)
                assert xx.min()>=8 and xx.max()<24 and yy.min()>=8 and yy.max()<24
result={'passed':True,'files':len(assets),'visibleColors':len(colors_all),'checks':report}
(root/'docs/art/validation-wexmoor3.json').write_text(json.dumps(result,indent=2)+'\n')
print(f"PASS: {len(assets)} PNGs; palette, sizes, alpha, animation frames, padding, windup, baselines, regions, atlas copies, portrait crops")
