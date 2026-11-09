#!/usr/bin/env python3
"""Reproduce Batch C from imagegen originals: python export-welt.py SOURCE_DIR REPO_ROOT.
Requires Pillow and numpy. All resampling is nearest-neighbour, without dithering.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

HERE=Path(__file__).parent
spec=json.loads((HERE/'batch-welt-generation.json').read_text())
sources=Path(sys.argv[1]); root=Path(sys.argv[2])
palette=spec['palette']
rgb=np.array([tuple(bytes.fromhex(c[1:])) for c in palette],dtype=np.int32)
NEAREST=Image.Resampling.NEAREST

def clean(im,white=False):
    a=np.array(im.convert('RGBA'))
    mask=a[:,:,3]>=128
    if white: mask &= a[:,:,:3].mean(2)<218
    a[:,:,3]=mask.astype('uint8')*255
    a[~mask,:3]=0
    return Image.fromarray(a)

def tight(im):
    b=im.getchannel('A').getbbox()
    return im.crop(b) if b else Image.new('RGBA',(1,1))

def fit(im,size,bottom=False,trim=True):
    if trim: im=tight(im)
    w,h=size; scale=min(w/im.width,h/im.height)
    dims=(max(1,round(im.width*scale)),max(1,round(im.height*scale)))
    im=im.resize(dims,NEAREST)
    out=Image.new('RGBA',size)
    out.paste(im,((w-im.width)//2,h-im.height if bottom else (h-im.height)//2))
    return out

def indexed(im,opaque=False):
    a=np.array(im.convert('RGBA')); shape=a.shape[:2]
    p=a[:,:,:3].reshape(-1,3).astype(np.int32)
    ids=((p[:,None,:]-rgb[None,:,:])**2).sum(2).argmin(1).astype('uint8')+1
    if not opaque: ids[a[:,:,3].reshape(-1)<128]=0
    out=Image.fromarray(ids.reshape(shape),'P')
    pal=[0,0,0]+rgb.astype('uint8').flatten().tolist()
    out.putpalette(pal+[0]*(768-len(pal)))
    if not opaque:out.info['transparency']=0
    return out

assets=[]
for j in spec['assets']:
    im=Image.open(sources/j['source']).convert('RGBA')
    im=clean(im,j.get('removeWhite',False))
    w,h=j['size']; out=Image.new('RGBA',(w,h))
    entry={k:j[k] for k in ['id','frameWidth','frameHeight','columns','rows','animations'] if k in j}
    entry.update(file=j['path'],width=w,height=h,transparent=j['transparent'])
    mode=j['exportMode']
    if mode=='characters':
        cols=4;rows=h//32; cells=[]
        for r in range(rows):
            for c in range(cols):
                cell=im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)))
                cells.append(tight(cell))
        # Same scale across the whole character sheet; feet end at y=30.
        scale=min(14/max(x.width for x in cells),30/max(x.height for x in cells))
        for i,cell in enumerate(cells):
            cell=cell.resize((max(1,round(cell.width*scale)),max(1,round(cell.height*scale))),NEAREST)
            cell=tight(cell)
            out.paste(cell,((i%4)*16+(16-cell.width)//2,(i//4)*32+31-cell.height))
        entry['baseline']=31
        if j['id']=='player_extras':
            for name,a in entry['animations'].items():a['repeat']=-1 if name=='shiver' else 0
    elif mode=='portraits':
        for c in range(4):
            x0=round(c*im.width/4);x1=round((c+1)*im.width/4)
            side=x1-x0;y0=max(0,round(im.height*0.025))
            cell=im.crop((x0,y0,x1,min(im.height,y0+side))).resize((64,64),NEAREST)
            out.paste(cell,(c*64,0))
        entry['expressions']={name:i for i,name in enumerate(j['expressions'])}
    elif mode=='regions':
        entry['regions']={}
        for region in j['regions']:
            name=region['name']; box=region['sourceRect'];x,y,rw,rh=region['rect']
            cell=im.crop(tuple(box))
            if region.get('opaque'):cell.putalpha(255)
            if region.get('stretch'):cell=cell.resize((rw,rh),NEAREST)
            else:cell=fit(cell,(rw,rh),trim=not region.get('opaque',False))
            out.paste(cell,(x,y))
            entry['regions'][name]={'x':x,'y':y,'width':rw,'height':rh}
        entry['regionAnimations']=j.get('regionAnimations',{})
    elif mode=='cells':
        cols=j['columns'];rows=j['rows'];fw=j['frameWidth'];fh=j['frameHeight']
        crop=j.get('sourceRect',[0,0,im.width,im.height]);im=im.crop(tuple(crop))
        for r in range(rows):
            for c in range(cols):
                if j['id']=='C_08_weather' and c>=4 and r!=4:continue
                cell=im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)))
                if j['id']=='C_08_weather':
                    cell=fit(cell,(16,16)) if r==5 else cell.resize((fw,fh),NEAREST)
                    out.paste(cell,(c*fw+(fw-cell.width)//2,r*fh+(fh-cell.height)//2))
                else:out.paste(fit(cell,(fw,fh)),(c*fw,r*fh))
    else:raise ValueError(mode)
    # Tile variants within a terrain family share their perimeter pixels.
    # Interiors remain distinct; assembled floors have matching tile boundaries.
    for family in j.get('seamFamilies',[]):
        first=entry['regions'][family[0]];x,y=first['x'],first['y']
        tile=np.array(out.crop((x,y,x+16,y+16)))
        top=tile[0].copy();left=tile[:,0].copy()
        corner=tile[0,0].copy();top[0]=top[-1]=corner;left[0]=left[-1]=corner
        for name in family:
            reg=entry['regions'][name];x,y=reg['x'],reg['y']
            cell=np.array(out.crop((x,y,x+16,y+16)))
            cell[0]=cell[-1]=top;cell[:,0]=cell[:,-1]=left
            out.paste(Image.fromarray(cell),(x,y))
    if j.get('seamFamilies'):entry['seamFamilies']=j['seamFamilies']
    if j.get('frameNames'):entry['frameNames']=j['frameNames']
    dest=root/'public/sprites'/j['path'];dest.parent.mkdir(parents=True,exist_ok=True)
    indexed(out,not j['transparent']).save(dest,optimize=True)
    assets.append(entry)
manifest={'version':1,'batch':'welt','status':'exported; runtime integration pending','paletteMaxVisibleColors':len(palette),'assets':assets}
(root/'public/sprites/manifest-welt.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(assets)} PNG sheets.')
