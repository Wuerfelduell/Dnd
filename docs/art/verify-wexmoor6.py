"""Validate Batch AN PNGs/manifest; optionally render contact sheets."""
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / 'public/sprites'
DOC = Path(__file__).resolve().parent


def verify(preview=False):
    manifest = json.loads((SPRITES / 'manifest-wexmoor6.json').read_text())
    spec = json.loads((DOC / 'batch-wexmoor6-generation.json').read_text())
    palette = {tuple(c) for c in spec['paletteRGB']}
    assets = manifest['assets']
    assert len(assets) == 39
    assert len({a['file'] for a in assets}) == len(assets)
    assert len({a['id'] for a in assets}) == len(assets)
    results = []
    for a in assets:
        p = SPRITES / a['file']
        raw = Image.open(p)
        assert raw.mode == 'P', a['id']
        im = raw.convert('RGBA')
        assert im.size == (a['width'], a['height']), a['id']
        pixels = list(im.getdata())
        visible = {px[:3] for px in pixels if px[3]}
        assert 0 < len(visible) <= 32 and visible <= palette, a['id']
        alphas = {px[3] for px in pixels}
        assert alphas <= {0, 255}, a['id']
        assert alphas == ({0, 255} if a['transparent'] else {255}), a['id']
        regions = a.get('regions', {})
        for name, r in regions.items():
            x, y, w, h = [r[k] for k in ('x', 'y', 'width', 'height')]
            assert x % 16 == 0 and y % 16 == 0, (a['id'], name)
            assert 0 <= x < x+w <= im.width and 0 <= y < y+h <= im.height
            assert im.crop((x,y,x+w,y+h)).getchannel('A').getbbox(), (a['id'], name)
        for animation in a.get('regionAnimations', {}).values():
            assert all(r in regions for r in animation['regions'])
            assert animation['frameRate'] > 0
        if 'columns' in a:
            fw, fh, cols, rows = [a[k] for k in ('frameWidth','frameHeight','columns','rows')]
            assert im.size == (fw*cols, fh*rows), a['id']
            frame = lambda n: im.crop(((n%cols)*fw, (n//cols)*fh, (n%cols+1)*fw, (n//cols+1)*fh))
            for animation in a.get('animations', {}).values():
                assert animation['frameRate'] > 0
                for n in animation['frames']:
                    assert 0 <= n < cols*rows and frame(n).getchannel('A').getbbox()
            if 'occupiedCounts' in a:
                for row, count in enumerate(a['occupiedCounts']):
                    for col in range(cols):
                        bbox = frame(row*cols+col).getchannel('A').getbbox()
                        assert bool(bbox) == (col < count), (a['id'],row,col)
                        if bbox:
                            assert bbox[0] >= 1 and bbox[2] <= fw-1 and bbox[1] >= 0
                            assert bbox[3] == a['baseline']+1, (a['id'],row,col,bbox)
            if a['kind'] == 'battle':
                assert cols == 6
                for row in a['heldRows']:
                    assert frame(row*cols).tobytes() == frame(row*cols+1).tobytes()
                    assert frame(row*cols+2).tobytes() != frame(row*cols).tobytes()
                assert len({frame(i).tobytes() for i in a['animations']['defeated']['frames']}) >= 4
            if a['kind'] == 'tiles':
                assert fw == fh == 16 and cols == rows == 8
                assert len(a['tileNames']) == len(set(a['tileNames'])) == 64
        if a['kind'] == 'background':
            assert im.size == (480,270) and a['groundStrip']['height'] == 70
        results.append({'file':a['file'], 'size':list(im.size), 'visibleColors':len(visible),
                        'sha256':hashlib.sha256(p.read_bytes()).hexdigest(), 'status':'pass'})
    report = {'batch':'wexmoor6','status':'pass','pngCount':len(assets),
              'checks':['dimensions','indexed shared palette','binary alpha','opaque backgrounds',
                        'unique IDs and paths','region bounds and alignment','animation indices',
                        'occupied/empty frame cells','common baseline','two identical wind-up frames',
                        'distinct release and collapse frames','64 named tiles per tileset'],
              'files':results}
    (DOC/'validation-wexmoor6.json').write_text(json.dumps(report,indent=2)+'\n')
    if preview:
        groups = [a for a in assets if a['kind'] != 'battle' and not a['id'].endswith('_32')]
        cw, ch, cols = 490, 300, 3
        contact = Image.new('RGB',(cw*cols, ch*((len(groups)+cols-1)//cols)), '#303b49')
        draw = ImageDraw.Draw(contact)
        for i,a in enumerate(groups):
            x,y=(i%cols)*cw,(i//cols)*ch
            im=Image.open(SPRITES/a['file']).convert('RGBA')
            scale=max(1,min(4,(cw-12)//im.width,(ch-34)//im.height))
            im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST)
            contact.paste(im,(x+8,y+26),im)
            draw.text((x+8,y+8),a['file'],fill='#eee2c5')
        contact.save(DOC/'preview-wexmoor6-overview.png')
        for a in assets:
            if a['kind'] != 'battle':
                continue
            im=Image.open(SPRITES/a['file']).convert('RGBA')
            im=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST)
            sheet=Image.new('RGB',(im.width,im.height+24),'#303b49')
            sheet.paste(im,(0,24),im)
            ImageDraw.Draw(sheet).text((8,6),a['id']+' | idle / attack A / attack B / hurt / defeated'+(' / phase2' if a['rows']==6 else ''),fill='#eee2c5')
            sheet.save(DOC/('preview-wexmoor6-'+a['gameId']+'.png'))
    print('PASS: 39 PNGs, palette, alpha, regions, animation cells, baselines and wind-up holds')


if __name__ == '__main__':
    verify('--preview' in sys.argv)
