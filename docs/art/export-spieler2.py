#!/usr/bin/env python3
"""Export AH sources with nearest-neighbor sampling and a shared palette.
Usage: python docs/art/export-spieler2.py SOURCE_MAP.json [--partial]
SOURCE_MAP is the generation job list (absolute source paths), or {job_id:path}.
"""
import json, sys, hashlib, copy
from pathlib import Path
import numpy as np
from PIL import Image

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SPRITES=ROOT/'public/sprites'
NN=Image.Resampling.NEAREST
SPECS=json.loads((HERE/'spieler2-specs.json').read_text())
INPUT=json.loads(Path(sys.argv[1]).read_text())
JOBS=INPUT if isinstance(INPUT,list) else [dict(id=k,source=v) for k,v in INPUT.items()]
BY_ID={j['id']:j for j in JOBS}
PALETTE=['#1a1c2c','#252b38','#303b49','#425360','#586c78','#71858b','#95a5a5',
 '#2d2629','#413433','#58433c','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1',
 '#494b3a','#686850','#8b8870','#dbd2b3','#eee2c5','#173d40','#245b59','#36817a',
 '#6fe0d0','#5f4829','#886332','#ba8942','#dbac5d','#f0ce80','#294b3c','#466957','#665479']
RGB=np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE],dtype=np.int32)

def clean(im):
    a=np.array(im.convert('RGBA'));a[:,:,3]=np.where(a[:,:,3]>=128,255,0)
    a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a)
def tight(im):
    box=im.getchannel('A').getbbox()
    if not box: raise ValueError('Empty source cell')
    return im.crop(box)
def indexed(im,transparent):
    a=np.array(im.convert('RGBA'));px=a[:,:,:3].reshape(-1,3).astype(np.int32);ids=np.zeros(len(px),dtype=np.uint8)
    for start in range(0,len(px),8192):
        ids[start:start+8192]=((px[start:start+8192,None,:]-RGB[None,:,:])**2).sum(2).argmin(1)+1
    if transparent: ids[a[:,:,3].reshape(-1)<128]=0
    out=Image.fromarray(ids.reshape(a.shape[:2]),'P');pal=[0,0,0]+RGB.astype('uint8').flatten().tolist()
    out.putpalette(pal+[0]*(768-len(pal)))
    if transparent: out.info['transparency']=0
    return out
def cell_boxes(im,cols,rows):
    return [[round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)] for r in range(rows) for c in range(cols)]
def gutter_boxes(im,cols,rows):
    """Snap nominal row boundaries to transparent gutters, retaining whole feet."""
    occupied=np.array(im.getchannel('A'))>=128
    ycuts=[0]
    for r in range(1,rows):
        target=im.height*r/rows;radius=im.height/rows*.32
        candidates=[y for y in range(max(ycuts[-1]+1,int(target-radius)),min(im.height,int(target+radius))) if not occupied[y].any()]
        ycuts.append(min(candidates,key=lambda y:abs(y-target)) if candidates else round(target))
    ycuts.append(im.height);boxes=[]
    for r in range(rows):
        xcuts=[0];row=occupied[ycuts[r]:ycuts[r+1]]
        for c in range(1,cols):
            target=im.width*c/cols;radius=im.width/cols*.25
            candidates=[x for x in range(max(xcuts[-1]+1,int(target-radius)),min(im.width,int(target+radius))) if not row[:,x].any()]
            xcuts.append(min(candidates,key=lambda x:abs(x-target)) if candidates else round(target))
        xcuts.append(im.width)
        boxes.extend([[xcuts[c],ycuts[r],xcuts[c+1],ycuts[r+1]] for c in range(cols)])
    return boxes
def save(im,a):
    p=SPRITES/a['file'];p.parent.mkdir(parents=True,exist_ok=True)
    indexed(im,a['transparent']).save(p,optimize=True)
def fit(im,size,margin=1):
    im=tight(im);w,h=size;s=min((w-2*margin)/im.width,(h-2*margin)/im.height)
    im=tight(im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),NN))
    out=Image.new('RGBA',size);out.paste(im,((w-im.width)//2,(h-im.height)//2));return out

assets=[];records=[]
for spec in SPECS:
    a=copy.deepcopy(spec);kind=a['kind'];w,h=a['width'],a['height']
    if kind=='derived':
        p=SPRITES/a['derivedFrom']
        if not p.exists() and '--partial' in sys.argv: continue
        # Preserve the full hat and chin. Remove only the connected slate backdrop.
        im=Image.open(p).convert('RGBA').crop((0,0,64,54))
        ar=np.array(im);backgroundColors={tuple(c) for c in ar[0,:,:3]};seen=set();stack=[(0,0),(63,0)]
        while stack:
            x,y=stack.pop()
            if (x,y) in seen or not(0<=x<im.width and 0<=y<im.height):continue
            seen.add((x,y))
            if tuple(ar[y,x,:3]) not in backgroundColors: continue
            ar[y,x,3]=0;stack.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
        im=Image.fromarray(ar)
        out=fit(im,(w,h),1)
        a['sourceCrop']=[0,0,64,54];save(out,a);assets.append(a);continue
    if a['id'] not in BY_ID:
        if '--partial' in sys.argv: continue
        raise ValueError('Missing source: '+a['id'])
    j=copy.deepcopy(BY_ID[a['id']]);src=Path(j['source']);im=clean(Image.open(src))
    j['source']=src.name;j['sha256']=hashlib.sha256(src.read_bytes()).hexdigest();j['sourceSize']=list(im.size)
    if 'replaces' in j:
        previous=j['replaces'];pp=Path(previous['source'])
        previous.update(source=pp.name,sha256=hashlib.sha256(pp.read_bytes()).hexdigest(),accepted=False)
    out=Image.new('RGBA',(w,h))
    if kind in ['figure','portrait','fx']:
        cols,rows=a['columns'],a['rows'];fw,fh=a['frameWidth'],a['frameHeight']
        boxes=j.get('sourceBoxes') or (gutter_boxes(im,cols,rows) if kind=='figure' else cell_boxes(im,cols,rows));j['sourceBoxes']=boxes
        used=sorted(set(f for anim in a.get('animations',{}).values() for f in anim['frames'])) if kind=='figure' else list(range(cols*rows))
        frames={i:im.crop(boxes[i]) for i in used}
        if kind=='figure':
            frames={i:tight(f) for i,f in frames.items()}
            repair=BY_ID.get(a['id']+'_door_repair')
            if a['id']=='p2a_extras' and not repair and '--partial' not in sys.argv:
                raise ValueError('Source map must include p2a_extras_door_repair')
            if repair:
                repair=copy.deepcopy(repair);rp=Path(repair['source']);rim=clean(Image.open(rp))
                rboxes=cell_boxes(rim,4,1);rframes=[tight(rim.crop(b)) for b in rboxes]
                rs=frames[0].height/rframes[0].height
                for i,f in enumerate(rframes):
                    frames[i]=tight(f.resize((round(f.width*rs),round(f.height*rs)),NN))
                repair.update(source=rp.name,sha256=hashlib.sha256(rp.read_bytes()).hexdigest(),sourceSize=list(rim.size),sourceBoxes=rboxes,frames=[0,1,2,3],normalizationScale=rs)
                j['repairs']=[repair]
            baseline=a['baseline'];top=a.get('topPadding',1)
            scale=min((fw-2)/max(f.width for f in frames.values()),(baseline-top)/max(f.height for f in frames.values()))
            j['uniformScale']=scale
            for i,f in frames.items():
                f=tight(f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),NN))
                out.paste(f,((i%cols)*fw+(fw-f.width)//2,(i//cols)*fh+baseline-f.height))
            a['paddingFrames']=[i for i in range(cols*rows) if i not in used]
            a['origin']=[0.5,baseline/fh]
        elif kind=='fx':
            frames={i:tight(f) for i,f in frames.items()}
            scale=min((fw-2)/max(f.width for f in frames.values()),(fh-2)/max(f.height for f in frames.values()))
            j['uniformScale']=scale
            for i,f in frames.items():
                f=tight(f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),NN))
                out.paste(f,((i%cols)*fw+(fw-f.width)//2,(i//cols)*fh+(fh-f.height)//2))
        else:
            for i,f in frames.items():
                f=f.resize((fw,fh),NN)
                out.paste(f,((i%cols)*fw,(i//cols)*fh))
    elif kind=='scene': out=im.resize((w,h),NN)
    elif kind=='ui':
        # Source atlas: first row 4 flags, second row one HUD, third row5 icons.
        boxes=j.get('sourceBoxes') or [[300,0,570,290],[570,0,850,290],[850,0,1130,290],[1130,0,1430,290],[0,290,1717,560]]+[[round(i*1717/5),560,round((i+1)*1717/5),916] for i in range(5)]
        j['sourceBoxes']=boxes;j['regionOrder']=list(a['regions'])
        for (name,rect),box in zip(a['regions'].items(),boxes):
            x,y,rw,rh=rect
            f=tight(im.crop(box)).resize((rw,rh),NN) if name=='p2_hud' else fit(im.crop(box),(rw,rh),1)
            out.paste(f,(x,y))
    save(out,a);assets.append(a);records.append(j)

manifest=dict(version=1,batch='spieler2',status='exported; runtime integration pending',paletteMaxVisibleColors=32,assets=assets)
(SPRITES/'manifest-spieler2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
log=dict(batch='spieler2',generator='image_gen built-in',palette=PALETTE,postprocess=['nearest-neighbor','uniform scale per figure sheet','reference foot baseline','binary alpha threshold128','shared32-color palette'],jobs=records)
def portable(value):
    if isinstance(value,dict):return {k:portable(v) for k,v in value.items()}
    if isinstance(value,list):return [portable(v) for v in value]
    if isinstance(value,str) and value.startswith(str(ROOT)+'/'):return value[len(str(ROOT))+1:]
    if isinstance(value,str) and '/generated_images/' in value and value.startswith('/'):return 'generator-sources/'+Path(value).name
    return value
log=portable(log)
(HERE/'batch-spieler2-generation.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
print('Exported',len(assets),'assets')
