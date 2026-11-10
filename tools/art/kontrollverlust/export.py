"""Export BP image-generator sources. Usage: python export.py sources.json.

Requires Pillow and NumPy. Sources are records with a local `source` PNG path.
Animation cells use one shared scale so small/large phases retain their size.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/sprites'
BASE = [(26,28,44),(37,43,56),(88,67,60),(48,59,73),(179,148,110),
        (73,75,58),(207,177,138),(66,83,96),(113,86,72),(113,133,139),
        (146,116,90),(88,108,120),(45,38,41),(240,206,128),(136,99,50),
        (208,160,80),(232,184,96),(104,104,80),(139,136,112),(224,201,161),
        (238,226,197),(137,62,78),(149,165,165),(54,129,122),(36,91,89),
        (78,175,162),(168,180,192),(65,52,51),(100,120,143),(111,224,208)]
PALETTE = BASE + [(58,24,80),(90,42,122)]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def index(im, opaque=False):
    a = np.array(im.convert('RGBA'))
    pal = np.asarray(PALETTE, dtype=np.int32)
    pixels = a[:,:,:3].astype(np.int32)
    out = np.zeros(a.shape[:2], dtype=np.uint8)
    for y in range(im.height):
        out[y] = ((pixels[y,:,None,:]-pal[None,:,:])**2).sum(2).argmin(1)+1
    if not opaque:
        out[a[:,:,3]<128] = 0
    result = Image.fromarray(out, 'P')
    result.putpalette(([0,0,0]+[c for p in PALETTE for c in p]+[0]*768)[:768])
    if not opaque:
        result.info['transparency'] = 0
    return result

def clip(frames, fps, repeat=0):
    return dict(frames=frames, frameRate=fps, repeat=repeat)

def main():
    records = json.loads(Path(sys.argv[1]).read_text())
    assets = []
    for record in records:
        r = dict(record)
        src = Path(r.pop('source'))
        im = Image.open(src).convert('RGBA')
        source_size = list(im.size)
        if r['id']=='salz':
            alpha=im.getchannel('A').point(lambda a:255 if a>=128 else 0)
            box=alpha.getbbox()
            if box is None:
                raise ValueError('Empty salt icon')
            r['sourceTrim']=list(box)
            tile=im.crop(box)
            side=max(tile.size)
            im=Image.new('RGBA',(round(side*1.15),round(side*1.15)))
            im.paste(tile,((im.width-tile.width)//2,(im.height-tile.height)//2))
        fw,fh,cols,rows,sc,sr = (r[k] for k in ['fw','fh','cols','rows','sourceCols','sourceRows'])
        result = Image.new('RGBA', (fw*cols,fh*rows))
        crops = []
        tiles = []
        for n in range(cols*rows):
            x,y = n%sc,n//sc
            box = (round(x*im.width/sc),round(y*im.height/sr),round((x+1)*im.width/sc),round((y+1)*im.height/sr))
            crops.append(box)
            tile = im.crop(box)
            if r['id'] in ['tentakel','player','icons']:
                arr=np.array(tile);arr[:,:,3]=np.where(arr[:,:,3]>=128,255,0)
                tile=Image.fromarray(arr)
                bbox=tile.getbbox()
                if bbox is None:
                    raise ValueError(f'Empty frame {r["id"]}/{n}')
                crops[-1]=[box[0]+bbox[0],box[1]+bbox[1],box[0]+bbox[2],box[1]+bbox[3]]
                tile=tile.crop(bbox)
            tiles.append(tile)
        margin=0 if r['id']=='tentakel' else 1
        shared_scale=min((fw-2*margin)/max(t.width for t in tiles),(fh-2*margin)/max(t.height for t in tiles))
        placements=[]
        for n,tile in enumerate(tiles):
            if r['id'] in ['tentakel','player','icons']:
                tile=tile.resize((max(1,round(tile.width*shared_scale)),max(1,round(tile.height*shared_scale))),Image.Resampling.NEAREST)
                tile=tile.crop(tile.getbbox())
                x=(fw-tile.width)//2
                y=fh-1-tile.height if r['id']=='player' else (fh-tile.height)//2
                if r['id']=='tentakel':
                    # Wrist-level registration; keep the central torso unobstructed.
                    y=min(fh-tile.height,y+1)
            else:
                tile=tile.resize((fw,fh),Image.Resampling.NEAREST);x=y=0
            result.paste(tile,((n%cols)*fw+x,(n//cols)*fh+y))
            placements.append([x,y,tile.width,tile.height])
        result = index(result, r.get('opaque',False))
        path = OUT/r['file'];path.parent.mkdir(parents=True,exist_ok=True)
        result.save(path,optimize=True)
        a = dict(id={'tentakel':'tentakel_fx','szene':'kontrollverlust','salz':'laeutersalz','icons':'BP_korruption','rahmen':'BP_korruption_rahmen','player':'BP_player_korruption'}[r['id']],file=r['file'],
                 width=result.width,height=result.height,frameWidth=fw,frameHeight=fh,
                 columns=cols,rows=rows,transparent=not r.get('opaque',False),sha256=digest(path))
        if r['id']=='tentakel':
            a.update(origin=[0.5,0.5],effectCenter=[32,33],characterRegion=[24,16,16,32],animations={'grow':clip(list(range(12)),8)})
        elif r['id']=='icons':
            a['animations']={'corrupted':clip([0],1),'pulse':clip([0,1,2,3],6,-1),'cleansed':clip([4],1),'set_aside':clip([5],1)}
        elif r['id']=='rahmen':
            a['nineSlice']={'left':16,'right':16,'top':16,'bottom':16}
        elif r['id']=='player':
            a['animations']={name:clip(list(range(i*4,i*4+4)),4) for i,name in enumerate(['player','p2a','p2b'])}
            a['poses']=['doubled_over','clutch_shoulder','kneeling','collapsed']
        assets.append(a)
        if r['id']=='salz':
            larger = result.resize((32,32),Image.Resampling.NEAREST)
            largepath = OUT/'items32/laeutersalz.png';largepath.parent.mkdir(parents=True,exist_ok=True)
            larger.save(largepath,optimize=True)
            assets.append(dict(id='laeutersalz_32',file='items32/laeutersalz.png',width=32,height=32,
                               frameWidth=32,frameHeight=32,columns=1,rows=1,transparent=True,
                               derivedFrom=r['file'],sha256=digest(largepath)))
        refs=r.pop('ref',None) or [x['file'] for x in r.get('styleReferences',[])]
        r.update(sourceFile=src.name,sourceSha256=digest(src),sourceSize=source_size,sourceCropBoxes=crops,exportPlacements=placements,
                 styleReferences=[dict(file=f,sha256=digest(OUT/f)) for f in refs])
        if r.get('supersedes'):
            old=src.parent/r['supersedes'];r['supersededSourceSha256']=digest(old);r['supersedes']=old.name
        record.clear();record.update(r)
    manifest=dict(version=1,batch='kontrollverlust',status='exported; runtime animation integration pending',
                  paletteMaxVisibleColors=32,palette=PALETTE,assets=assets)
    (OUT/'manifest-kontrollverlust.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    report=dict(batch='kontrollverlust',generator='built-in image_gen',
                postprocessing='Cell alpha bounds; one shared nearest-neighbor scale per animation sheet; centered effects/icons and bottom-aligned character poses; grid repacking; shared 30 base colours plus 2 violet colours; binary alpha; 32px salt is exact 2x nearest-neighbor.',records=records)
    (ROOT/'docs/art/batch-kontrollverlust-generation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(f'Exported {len(assets)} PNGs')

if __name__=='__main__':
    main()
