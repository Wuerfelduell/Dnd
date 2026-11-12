#!/usr/bin/env python3
"""Validate DO exports and manifest; Pillow only. Run from any directory."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SPR = ROOT / 'public/sprites'
manifest = json.loads((SPR / 'manifest-schatten.json').read_text())
palette = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
errors, reports = [], []

def require(condition, message):
    if not condition:
        errors.append(message)

def frame(im, a, i):
    x = i % a['columns'] * a['frameWidth']
    y = i // a['columns'] * a['frameHeight']
    return im.crop((x, y, x+a['frameWidth'], y+a['frameHeight']))

require(len(manifest['assets']) == 22, 'Expected exactly 22 PNGs including endcap')
require(len({a['file'] for a in manifest['assets']}) == 22, 'Duplicate asset path')
for a in manifest['assets']:
    path = a['file']
    im = Image.open(SPR / path).convert('RGBA')
    pixels = list(im.get_flattened_data()) if hasattr(im, 'get_flattened_data') else list(im.getdata())
    alpha = {p[3] for p in pixels}
    colors = {p[:3] for p in pixels if p[3]}
    require(im.size == (a['width'], a['height']), path + ': dimensions')
    require(len(colors) <= 32 and colors <= palette, path + ': shared palette')
    require(alpha <= {0,255}, path + ': nonbinary alpha')
    require(a['transparent'] or alpha == {255}, path + ': opaque background required')
    require(not a['transparent'] or 0 in alpha, path + ': missing cutout')
    require(a['columns']*a['frameWidth'] == im.width and a['rows']*a['frameHeight'] == im.height, path + ': atlas grid')
    for name, anim in a['animations'].items():
        require(anim['frameRate'] > 0, path + ': frame rate')
        for i in anim['frames']:
            require(0 <= i < a['columns']*a['rows'], path + ': frame index')
            require(frame(im,a,i).getbbox() is not None, path + ': empty active frame '+str(i))
    for i in a.get('emptyFrames', []):
        require(frame(im,a,i).getbbox() is None, path + ': unused frame '+str(i))
    for row in a.get('emptyRows', []):
        require(im.crop((0,row*a['frameHeight'],im.width,(row+1)*a['frameHeight'])).getbbox() is None, path + ': forbidden row')
    for first,second in a.get('identicalFramePairs', []):
        require(frame(im,a,first).tobytes() == frame(im,a,second).tobytes(), path + ': anticipation hold')
    if 'baseline' in a:
        for i in range(a['columns']*a['rows']):
            bb = frame(im,a,i).getbbox()
            require(bb is not None and bb[3] <= a['baseline']+1, path + ': baseline')
    if 'schatten_koerper_' in path:
        for i in [0,2,4,6]:
            first,second=frame(im,a,i),frame(im,a,i+1)
            difference=sum(first.getpixel((x,y))!=second.getpixel((x,y)) for y in range(32) for x in range(16))
            require(difference==1, path + ': breathing must change exactly one pixel')
    for name,r in a.get('regions', {}).items():
        require(0<=r['x'] and 0<=r['y'] and r['x']+r['width']<=im.width and r['y']+r['height']<=im.height, path + ': region '+name)
        require(im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).getbbox() is not None, path + ': empty region '+name)
    if path == 'fx/schatten_faehigkeit.png':
        for i in range(4):
            require(im.crop((64*i+12,12,64*i+52,52)).getbbox() is None, path + ': spell center must stay clear')
    if path == 'ui/schatten_wuerfelslot.png':
        for i in range(9):
            require(im.crop((24*i+6,6,24*i+18,18)).getbbox() is None, path + ': slot center must stay clear')
    if path == 'fx/schatten_band.png':
        for i in range(4):
            require(im.crop((i*16,0,i*16+1,8)).tobytes()==im.crop((i*16+15,0,i*16+16,8)).tobytes(), path + ': horizontal seam')
    reports.append(dict(file=path,width=im.width,height=im.height,visibleColors=len(colors),alphaValues=sorted(alpha),sha256=hashlib.sha256((SPR/path).read_bytes()).hexdigest()))

small=Image.open(SPR/'ui/skills3/schattenattacke.png').convert('RGBA')
large=Image.open(SPR/'ui/skills3/32/schattenattacke.png').convert('RGBA')
require(small.resize((32,32),Image.Resampling.NEAREST).tobytes()==large.tobytes(),'32px icon must be exact nearest-neighbor enlargement')
for actor, files in manifest['actors'].items():
    for role, path in files.items():
        require(any(a['file']==path for a in manifest['assets']),actor+': missing '+role)
result=dict(batch='schatten',status='PASS' if not errors else 'FAIL',pngCount=len(reports),checks=['dimensions','shared palette <=32','binary alpha','opaque background','atlas grid and animation indices','nonempty active frames','empty unused cells','empty parry/item rows','anticipation holds','baseline','region bounds','clear overlay centers','tether seam','2x icon','actor mappings'],limitations=['Automated checks do not establish artistic quality or in-game behavior. Preview reviewed separately; runtime integration pending.'],assets=reports,errors=errors)
(ROOT/'docs/art/batch-schatten-validation.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print(f"{result['status']}: {len(reports)} PNGs, {len(errors)} errors")
for error in errors:
    print(error)
raise SystemExit(bool(errors))
