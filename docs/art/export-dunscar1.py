"""Export imagegen AV sources with nearest-neighbor, shared palette, binary alpha.

Usage: python docs/art/export-dunscar1.py SOURCE_RECORD_DIRECTORY
Records are ID.json objects with source pointing to the generated PNG.
Only crops, resizes, indexes and packs generated artwork; creates no substitute art.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'docs/art'
SPRITES = ROOT / 'public/sprites'
CONFIG = ART / 'batch-dunscar1-generation.json'
NEAREST = Image.Resampling.NEAREST


def slug(s):
    return re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')


def index_image(im, palette, transparent):
    rgba = np.array(im.convert('RGBA'))
    colors = np.array([tuple(bytes.fromhex(c[1:])) for c in palette], dtype=np.int32)
    rgb = rgba[:, :, :3].reshape(-1, 3).astype(np.int32)
    ids = np.empty(len(rgb), dtype=np.uint8)
    for start in range(0, len(rgb), 8192):
        ids[start:start+8192] = ((rgb[start:start+8192, None]-colors[None])**2).sum(2).argmin(1)+1
    ids = ids.reshape(rgba.shape[:2])
    if transparent:
        ids[rgba[:, :, 3] < 200] = 0
    out = Image.fromarray(ids, 'P')
    out.putpalette(([0, 0, 0]+colors.astype('uint8').ravel().tolist()+[0]*768)[:768])
    return out


def export(job, source):
    im = source.convert('RGBA')
    if job.get('sourceCrop'):
        im = im.crop(tuple(job['sourceCrop']))
    w, h = job['size']
    fw, fh = job['frameWidth'], job['frameHeight']
    if job['kind'] == 'train':
        out = Image.new('RGBA', (w, h))
        xs = job['sourceVehicleColumns']
        ys = job['sourceVehicleRows']
        target_x = [0,64,112,160]
        target_width = [64,48,48,48]
        crops = []
        for row, (y0,y1) in enumerate(ys):
            for col,(x0,x1) in enumerate(xs):
                cell = im.crop((x0,y0,x1,y1))
                cell.putalpha(cell.getchannel('A').point(lambda a:255 if a>=200 else 0))
                box = cell.getchannel('A').getbbox()
                assert box, (row,col)
                cell = cell.crop(box)
                tw = target_width[col]
                scale = min((tw-2)/cell.width,30/cell.height)
                cell = cell.resize((max(1,round(cell.width*scale)),max(1,round(cell.height*scale))),NEAREST)
                out.alpha_composite(cell,(target_x[col]+(tw-cell.width)//2,row*32+31-cell.height))
                crops.append({'row':row,'vehicle':col,'sourceCell':[x0,y0,x1,y1],'alphaBounds':list(box)})
        return out,crops
    if job['id'] == 'ds_nachhall_weg':
        out = Image.new('RGBA',(w,h))
        for row in range(3):
            for col in range(4):
                cw,ch = im.width/4,im.height/3
                rect = (round(col*cw+35),round(row*ch+(20 if row==1 else 0)),round(col*cw+327),round(row*ch+(345 if row==1 else ch)))
                out.paste(im.crop(rect).resize((16,16),NEAREST),(col*16,row*16))
        return out,[]
    if job['kind'] in ('props', 'markers'):
        out = Image.new('RGBA', (w, h))
        cols, rows = job['columns'], job['rows']
        crops = []
        for n, name in enumerate(job['names']):
            col, row = n % cols, n // cols
            rect = (round(col*im.width/cols), round(row*im.height/rows),
                    round((col+1)*im.width/cols), round((row+1)*im.height/rows))
            cell = im.crop(rect)
            inset = max(1, round(min(cell.size)*0.015))
            cell = cell.crop((inset, inset, cell.width-inset, cell.height-inset))
            cell.putalpha(cell.getchannel('A').point(lambda a: 255 if a >= 200 else 0))
            box = cell.getchannel('A').getbbox()
            if not box:
                raise ValueError(f'Empty cell {job["id"]}: {name}')
            groups = {'ds_schwellenring':[[5,6]], 'ds_speisewagen':[[1,2],[4,5,6,7]], 'ds_bruchstufen_signalhang':[[0,1],[5,6,7,8]]}
            group = next((g for g in groups.get(job['id'],[]) if n in g),None)
            if group:
                boxes = []
                for other in group:
                    cx,cy = other%cols,other//cols
                    other_im = im.crop((round(cx*im.width/cols),round(cy*im.height/rows),round((cx+1)*im.width/cols),round((cy+1)*im.height/rows)))
                    ins = max(1,round(min(other_im.size)*0.015))
                    other_im = other_im.crop((ins,ins,other_im.width-ins,other_im.height-ins))
                    b = other_im.getchannel('A').point(lambda a:255 if a>=200 else 0).getbbox()
                    if b: boxes.append(b)
                box = (min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
            cell = cell.crop(box)
            margin = 3 if job['kind'] == 'props' else 1
            scale = min((fw-margin*2)/cell.width, (fh-margin*2)/cell.height)
            cell = cell.resize((max(1, round(cell.width*scale)), max(1, round(cell.height*scale))), NEAREST)
            out.alpha_composite(cell, (col*fw+(fw-cell.width)//2, row*fh+fh-margin-cell.height))
            crops.append({'name': name, 'sourceCell': list(rect), 'alphaBounds': list(box)})
        return out, crops
    if job.get('sourceColumns'):
        out = Image.new('RGBA', (w, h))
        sc, sr = job['sourceColumns'], job['sourceRows']
        for n in range(sc*sr):
            x, y = n % sc, n // sc
            cell = im.crop((round(x*im.width/sc), round(y*im.height/sr),
                            round((x+1)*im.width/sc), round((y+1)*im.height/sr)))
            out.paste(cell.resize((fw, fh), NEAREST), ((n % job['columns'])*fw, (n//job['columns'])*fh))
        return out, []
    return im.resize((w, h), NEAREST), []


def animation(frames, fps=5, repeat=-1):
    return {'frames': frames, 'frameRate': fps, 'repeat': repeat}


def asset(job):
    a = {k: job[k] for k in ['id', 'kind', 'transparent', 'columns', 'rows', 'frameWidth', 'frameHeight']}
    a.update(file=job['path'], width=job['size'][0], height=job['size'][1], animations={})
    if job['kind'] == 'tiles':
        a['tileNames'] = job['tileNames']
        a['cells'] = {slug(s): {'index': n, 'x': n%8*16, 'y': n//8*16, 'width':16, 'height':16} for n,s in enumerate(job['tileNames'])}
    if job['kind'] in ('props','markers'):
        a['baselineExclusive'] = a['frameHeight']-(3 if job['kind']=='props' else 1)
    if job.get('names'):
        a['regions'] = {slug(s): {'x': n%a['columns']*a['frameWidth'], 'y': n//a['columns']*a['frameHeight'], 'width': a['frameWidth'], 'height': a['frameHeight']} for n,s in enumerate(job['names'])}
    if job['kind'] == 'background':
        a['groundStrip'] = {'x':0, 'y':200, 'width':480, 'height':70}
    animations = {
        'ds_schlucht': {'opening': animation([24,25,26,27],4)},
        'ds_zug': {'passing_night': animation([12,13,14,15],5)},
        'ds_schwellenring': {'signal': animation([5,6],2)},
        'ds_bruchstufen_signalhang': {'scaffold': animation([0,1],3), 'listening': animation([5,6,7,8],5)},
        'ds_speisewagen': {'stove': animation([1,2],4), 'phonograph': animation([4,5,6,7],6)},
        'ds_nachhall': {'call': animation(list(range(8)),10,0)},
        'ds_nachhall_weg': {'straight': animation([0,1,2,3],5), 'curve': animation([4,5,6,7],5), 'end': animation([8,9,10,11],5)},
    }
    a['animations'].update(animations.get(job['id'], {}))
    if job['id'] == 'ds_bahn':
        a['composites'] = {'turntable': {'x':0,'y':32,'width':64,'height':64,'tileColumns':4,'tileRows':4}}
    if job['id'] == 'ds_nachtzug':
        a['baselineExclusive'] = 31
        a['regions'] = {}
        a['regionAnimations'] = {}
        for vehicle, x, width in [('lok',0,64),('wagen_1',64,48),('wagen_2',112,48),('wagen_3',160,48)]:
            for phase in range(5):
                name = f'{vehicle}_{phase}' if phase<4 else f'{vehicle}_stillgelegt'
                a['regions'][name] = {'x':x,'y':phase*32,'width':width,'height':32}
            a['regionAnimations'][vehicle] = {'frames':[f'{vehicle}_{i}' for i in range(4)], 'frameRate':5, 'repeat':-1}
        a['animations'] = {'active_consist':animation([0,1,2,3],5), 'stillgelegt':animation([4],1,0)}
    return a


def main():
    config = json.loads(CONFIG.read_text())
    source_dir = Path(sys.argv[1])
    assets = []
    for job in config['jobs']:
        record = json.loads((source_dir/(job['id']+'.json')).read_text())
        source = Path(record['source'])
        im = Image.open(source)
        out, crops = export(job, im)
        out = index_image(out, config['palette'], job['transparent'])
        destination = SPRITES/job['path']
        destination.parent.mkdir(parents=True, exist_ok=True)
        out.save(destination, optimize=True, **({'transparency':0} if job['transparent'] else {}))
        if 'editPrompt' in record:
            job['editPrompt'] = record['editPrompt']
            original = Path(record['originalSource'])
            job['originalSourceFile'] = original.name
            job['originalSourceSha256'] = hashlib.sha256(original.read_bytes()).hexdigest()
        job.update(sourceFile=source.name, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), sourceSize=list(im.size), measuredCrops=crops)
        a = asset(job)
        a['sha256'] = hashlib.sha256(destination.read_bytes()).hexdigest()
        assets.append(a)
    manifest = {'version':1,'batch':'dunscar1','city':'dunscar','status':'exported; game integration separate','paletteMaxVisibleColors':32,'palette':config['palette'],'assets':assets}
    (SPRITES/'manifest-dunscar1.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    CONFIG.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
    print(f'Exported {len(assets)} assets')


if __name__ == '__main__':
    main()
