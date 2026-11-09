"""Export AW generator sources: python tools/art/dunscar2/export.py sources.json.

sources.json is the generation record list, with local `source` PNG paths.
Original images are not runtime assets. Requires Pillow and numpy.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/sprites'
PALETTE = [
    (26,28,44),(37,43,59),(53,47,49),(76,69,65),(74,56,53),
    (108,98,88),(145,133,114),(187,174,149),(222,216,200),
    (48,63,60),(185,194,194),(120,101,72),(89,75,62),
    (74,81,67),(130,137,106),(104,71,62),(161,138,91),
    (178,138,80),(139,93,73),(151,165,173),(170,121,86),
    (101,112,90),(213,173,104),(235,205,141),(71,85,104),
    (91,106,123),(111,224,208),(69,139,137),(69,48,94),
    (112,77,138),(205,184,158),
]

def indexed(im, opaque=False):
    rgba = np.asarray(im.convert('RGBA'))
    rgb = rgba[:,:,:3].astype(np.int32)
    colors = np.asarray(PALETTE, dtype=np.int32)
    # Fixed shared 31 visible colours plus one transparent index.
    out = np.zeros(rgb.shape[:2], dtype=np.uint8)
    for y in range(rgb.shape[0]):
        out[y] = ((rgb[y,:,None,:]-colors[None,:,:])**2).sum(2).argmin(1)+1
    if not opaque:
        out[rgba[:,:,3]<128] = 0
    result = Image.fromarray(out, 'P')
    result.putpalette(([0,0,0]+[c for p in PALETTE for c in p]+[0]*768)[:768])
    if not opaque:
        result.info['transparency'] = 0
    return result

def cells(im, columns, rows):
    result = []
    boxes = []
    for row in range(rows):
        for col in range(columns):
            box = (round(col*im.width/columns),round(row*im.height/rows),
                   round((col+1)*im.width/columns),round((row+1)*im.height/rows))
            cell = im.crop(box).convert('RGBA')
            a = np.array(cell)
            a[:,:,3] = np.where(a[:,:,3]>=128,255,0)
            cell = Image.fromarray(a)
            bbox = cell.getbbox()
            if bbox is None:
                raise ValueError(f'Empty source cell {row},{col}')
            result.append(cell.crop(bbox))
            boxes.append([box[0]+bbox[0],box[1]+bbox[1],box[0]+bbox[2],box[1]+bbox[3]])
    return result, boxes

def sheet(im, fw, fh, columns, rows, margin=1):
    frames, boxes = cells(im, columns, rows)
    scale = min((fw-2*margin)/max(f.width for f in frames),
                (fh-2*margin)/max(f.height for f in frames))
    out = Image.new('RGBA',(fw*columns,fh*rows))
    placements = []
    for i, frame in enumerate(frames):
        size = (max(1,round(frame.width*scale)),max(1,round(frame.height*scale)))
        tile = frame.resize(size,Image.Resampling.NEAREST)
        tile = tile.crop(tile.getbbox())
        x=(i%columns)*fw+(fw-tile.width)//2
        y=(i//columns)*fh+fh-margin-tile.height
        out.alpha_composite(tile,(x,y))
        placements.append([x,y,tile.width,tile.height])
    return indexed(out),boxes,placements

def anim(frames, fps=6, repeat=-1):
    return dict(frames=frames,frameRate=fps,repeat=repeat)

def main():
    records=json.loads(Path(sys.argv[1]).read_text())
    assets=[]
    for record in records:
        src=Path(record['source'])
        im=Image.open(src).convert('RGBA')
        kind=record['type']; aid=record['id']
        if kind!='scene':
            corners=[im.getpixel(p)[3] for p in [(0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)]]
            if sum(a>=128 for a in corners)>=2:
                raise ValueError(f'{aid}: opaque source background; regenerate with actual transparency')
        record['sourceSha256']=hashlib.sha256(src.read_bytes()).hexdigest()
        record['sourceFile']=src.name
        record['sourceSize']=list(im.size)
        record['transparentBackground']=kind!='scene'
        record['generationMode']='edit' if record.get('editReference') else 'generate'
        if record.get('supersedes'):
            old=src.parent/record['supersedes']
            record['supersededSourceSha256']=hashlib.sha256(old.read_bytes()).hexdigest()
            record['supersedes']=old.name
        if record.get('editReference'):
            record['editReference']=Path(record['editReference']).name
        if record.get('ref'):
            record['styleReferenceSha256']=hashlib.sha256((OUT/record['ref']).read_bytes()).hexdigest()
        record.pop('hint',None)
        record.pop('source',None)
        asset=dict(id=aid,transparent=kind!='scene')
        if kind=='scene':
            result=indexed(im.resize((480,270),Image.Resampling.NEAREST),True)
            filename=f'ui/scenes/{aid}.png'
            asset.update(frameWidth=480,frameHeight=270,columns=1,rows=1)
        else:
            fw,fh,cols,rows=(16,32,4,4) if kind=='walk' else (64,64,4,1) if kind=='portrait' else (16,32,4,1)
            result,boxes,placements=sheet(im,fw,fh,cols,rows)
            record.update(sourceCropBoxes=boxes,exportPlacements=placements)
            filename=f'{"portraits" if kind=="portrait" else "characters"}/{aid}.png'
            asset.update(frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,baseline=fh-1)
            if kind=='walk':
                asset['animations']={d:anim(list(range(i*4,i*4+4)),7) for i,d in enumerate(['down','left','right','up'])}
            elif kind=='portrait':
                names=['angry','sad','thoughtful','determined'] if aid.startswith('AK_') else ['neutral','suspicious','startled','slight_smile']
                asset['animations']={n:anim([i],1,0) for i,n in enumerate(names)}
            else:
                asset['animations']={'activity':anim([0,1,2,3],5,0)}
        asset.update(file=filename,width=result.width,height=result.height)
        target=OUT/filename; target.parent.mkdir(parents=True,exist_ok=True)
        result.save(target,optimize=True)
        asset['sha256']=hashlib.sha256(target.read_bytes()).hexdigest()
        assets.append(asset)
        if kind=='portrait' and not aid.startswith('AK_'):
            head_id=aid.removesuffix('_emotions')
            # UI heads are 24x24 in the existing game; derive the same identity.
            face=result.convert('RGBA').crop((0,0,64,44))
            bbox=face.getbbox(); face=face.crop(bbox)
            face.thumbnail((22,22),Image.Resampling.NEAREST)
            icon=Image.new('RGBA',(24,24)); icon.alpha_composite(face,((24-face.width)//2,23-face.height))
            icon=indexed(icon); name=f'ui/heads/{head_id}.png'
            p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);icon.save(p,optimize=True)
            assets.append(dict(id=head_id+'_head',file=name,width=24,height=24,frameWidth=24,frameHeight=24,columns=1,rows=1,transparent=True,derivedFrom=filename,sourceRegion=[0,0,64,44],sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    assets.sort(key=lambda a:a['file'])
    records.sort(key=lambda r:r['id'])
    manifest=dict(version=1,batch='dunscar2',status='exported; runtime integration pending',paletteMaxVisibleColors=31,palette=PALETTE,assets=assets)
    (OUT/'manifest-dunscar2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'docs/art/batch-dunscar2-generation.json').write_text(json.dumps(dict(batch='dunscar2',generator='built-in image_gen',postprocessing='Nearest Neighbor; 31 shared visible palette colours; binary alpha; per-cell crop and fixed baseline. Heads derived from neutral portraits.',records=records),ensure_ascii=False,indent=2)+'\n')
    print(f'Exported {len(assets)} PNG assets')

if __name__=='__main__':
    main()
