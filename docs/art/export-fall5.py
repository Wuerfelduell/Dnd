"""Export the reviewed imagegen sources for Batch J.

Usage: python docs/art/export-fall5.py /absolute/source-map.json
Only technical raster operations: grid crops, nearest-neighbor scaling, palette
mapping, binary alpha, timing holds and registration. No artwork is synthesized.
"""
from pathlib import Path
import json, sys, hashlib
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
SPEC=ROOT/'docs/art/batch-fall5-generation.json'
spec=json.loads(SPEC.read_text()); sources=json.loads(Path(sys.argv[1]).read_text())
NN=Image.Resampling.NEAREST
PAL=np.array([list(bytes.fromhex(c[1:])) for c in spec['palette']],dtype=np.int32)
assets=[]
def blank(w,h): return Image.new('RGBA',(w,h))
def cell(im,i,c,r,inset=0):
    x=i%c*im.width/c; y=i//c*im.height/r
    dx=im.width/c*inset;dy=im.height/r*inset
    return im.crop(tuple(round(v) for v in (x+dx,y+dy,x+im.width/c-dx,y+im.height/r-dy)))
def alpha(im):
    a=np.array(im.convert('RGBA'));a[:,:,3]=np.where(a[:,:,3]>=200,255,0);a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a)
def tight(im):
    b=im.getchannel('A').getbbox()
    return im.crop(b) if b else blank(1,1)
def fit(im,w,h,margin=1):
    im=tight(im);s=min((w-2*margin)/im.width,(h-2*margin)/im.height)
    im=tight(im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),NN))
    out=blank(w,h);out.paste(im,((w-im.width)//2,h-margin-im.height));return out
def indexed(im,transparent):
    a=np.array(im.convert('RGBA'));pixels=a[:,:,:3].reshape(-1,3).astype(np.int32);ids=np.zeros(len(pixels),np.uint8)
    for i in range(0,len(pixels),8192):ids[i:i+8192]=((pixels[i:i+8192,None,:]-PAL[None,:,:])**2).sum(2).argmin(1)+1
    if transparent:ids[a[:,:,3].ravel()<200]=0
    out=Image.fromarray(ids.reshape(a.shape[:2]),'P');p=[0,0,0]+PAL.flatten().tolist();out.putpalette(p+[0]*(768-len(p)))
    if transparent:out.info['transparency']=0
    return out
def save(im,path,transparent):
    dest=ROOT/'public/sprites'/path;dest.parent.mkdir(parents=True,exist_ok=True);indexed(im,transparent).save(dest,optimize=True)
def rect(x,y,w,h):return dict(x=x,y=y,width=w,height=h)
def registration(parts,w,h,margin=1,bottom=True):
    # Same source bounding window and scale across a sequence preserve movement.
    sw=max(p.width for p in parts);sh=max(p.height for p in parts)
    parts=[p.resize((sw,sh),NN) for p in parts];bb=[p.getbbox() for p in parts if p.getbbox()]
    if not bb:return [blank(w,h) for p in parts]
    b=(min(v[0] for v in bb),min(v[1] for v in bb),max(v[2] for v in bb),max(v[3] for v in bb))
    scale=min((w-2*margin)/(b[2]-b[0]),(h-2*margin)/(b[3]-b[1]));sz=(max(1,round((b[2]-b[0])*scale)),max(1,round((b[3]-b[1])*scale)))
    frames=[]
    for p in parts:
        f=blank(w,h);f.paste(p.crop(b).resize(sz,NN),((w-sz[0])//2,h-margin-sz[1] if bottom else (h-sz[1])//2));frames.append(f)
    return frames

for j in spec['jobs']:
    if j['id'] not in sources:continue
    src=Path(sources[j['id']]);raw=Image.open(src).convert('RGBA')
    j.update(source=src.name,sourceSize=list(raw.size),sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest())
    im=alpha(raw) if j['transparent'] else raw
    if j.get('sourceCrop'):im=im.crop(j['sourceCrop'])
    w,h=j['size'];kind=j['kind'];out=blank(w,h)
    a=dict(id=j['id'],file=j['file'],width=w,height=h,transparent=j['transparent'],frameWidth=w,frameHeight=h,columns=1,rows=1,animations={})
    for k in ['gameId','mapId']:
        if k in j:a[k]=j[k]
    if kind in ('battle','walk'):
        fw,fh,c,r=j['fw'],j['fh'],j['cols'],j['rows'];parts={}
        for row,n in enumerate(j['counts']):
            for col in range(n):parts[row,col]=tight(cell(im,row*c+col,c,r))
        margin=2 if kind=='battle' else 1
        maxw=max(p.width for p in parts.values());maxh=max(p.height for p in parts.values())
        scale=min((fw-2*margin)/maxw,(fh-2*margin-(7 if j.get('floating') else 0))/maxh)
        for (row,col),p in parts.items():
            if row in j.get('heldRows',[]) and col==1:p=parts[row,0]
            p=tight(p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),NN))
            bob=([0,-1,-2,-1][col]-4) if j.get('floating') else 0
            out.paste(p,(col*fw+(fw-p.width)//2,row*fh+fh-margin-p.height+bob))
        a.update(frameWidth=fw,frameHeight=fh,columns=c,rows=r,occupiedCounts=j['counts'],baseline=fh-margin,heldRows=j.get('heldRows',[]))
        a['animations']={name:dict(frames=list(range(row*c,row*c+n)),frameRate=4 if name in ('idle','calm') else 8,repeat=-1 if name in ('idle','calm','down','left','right','up') else 0) for row,(name,n) in enumerate(zip(j['names'],j['counts']))}
        if kind=='battle':a['facing']='left'
        if j.get('floating'):a['floating']=True;a['floatOffsets']=[-4,-5,-6,-5]
    elif kind=='effect':
        c,r=j.get('reviewedSourceGrid',[j['sourceCols'],j['sourceRows']]);fw,fh=j['fw'],j['fh'];n=j['frames']
        parts=[cell(im,i,c,r) for i in range(n)];frames=registration(parts,fw,fh,bottom=False)
        for i,f in enumerate(frames):out.paste(f,(i*fw,0))
        a.update(frameWidth=fw,frameHeight=fh,columns=n,rows=1,animations={'play':dict(frames=list(range(n)),frameRate=10,repeat=-1 if j['id']=='fx_status_stumm' else 0)})
    elif kind in ('portrait','icons','markers'):
        c,r=j.get('reviewedSourceGrid',[j['sourceCols'],j['sourceRows']]);fw,fh=j['fw'],j['fh'];names=j['frameNames'];n=len(names)
        for row in range(2 if kind=='markers' else 1):
            for i,name in enumerate(names):
                idx=row*n+i
                if kind=='markers' and c==7:idx=row*14+i
                part=cell(im,idx,c,r,j.get('cellInset',0))
                f=part.resize((fw,fh),NN) if kind=='portrait' else fit(part,fw,fh)
                out.paste(f,(i*fw,row*fh))
        a.update(frameWidth=fw,frameHeight=fh,columns=n,rows=2 if kind=='markers' else 1,frameNames=names)
        if kind=='markers':a['states']={'normal':list(range(n)),'highlighted':list(range(n,2*n))}
    elif kind=='items':
        n=len(j['items']);regions={};c,r=j.get('reviewedSourceGrid',[j['sourceCols'],j['sourceRows']])
        for i,item in enumerate(j['items']):
            for row,res in enumerate((16,32)):
                part=cell(im,row*n+i,c,r)
                if j.get('reviewedRowBounds'):
                    ys=j['reviewedRowBounds'];part=im.crop((round(i*im.width/c),ys[row],round((i+1)*im.width/c),ys[row+1]))
                if j.get('reviewedItemRects'):part=im.crop(j['reviewedItemRects'][row*n+i])
                f=fit(part,res,res);x=i*res;y=0 if res==16 else 16;out.paste(f,(x,y));name=item['id']+'_'+str(res);regions[name]=rect(x,y,res,res)
                path=('items/' if res==16 else 'items/32/')+item['id']+'.png';save(f,path,True)
                assets.append(dict(id=item['id']+('_32' if res==32 else ''),gameId=item['id'],file=path,width=res,height=res,frameWidth=res,frameHeight=res,columns=1,rows=1,transparent=True,animations={},atlas=j['file'],atlasRegion=name))
        a.update(frameWidth=16,frameHeight=16,columns=w//16,rows=3,regions=regions)
    elif kind=='props':
        c,r=j['sourceCols'],j['sourceRows'];parts=[cell(im,i,c,r) for i in range(len(j['items']))];frames={};regions={}
        if j.get('reviewedCellRects'):parts=[im.crop(bb) for bb in j['reviewedCellRects']]
        for i,it in enumerate(j['items']):
            if it['name'] in j.get('reviewedObjectCrops',{}):parts[i]=im.crop(j['reviewedObjectCrops'][it['name']])
        groups={}
        for i,it in enumerate(j['items']):
            for prefix in ('sample_shimmer','clapper_swing','candle_flicker','footstep_ring'):
                if it['name'].startswith(prefix+'_'):groups.setdefault(prefix,[]).append(i)
        for name,indices in groups.items():
            it=j['items'][indices[0]]
            for i,f in zip(indices,registration([parts[i] for i in indices],it['width'],it['height'],bottom=name!='footstep_ring')):frames[i]=f
        for i,it in enumerate(j['items']):
            x=i%c*48;y=i//c*48;tw,th=it['width'],it['height'];out.paste(frames[i] if i in frames else fit(parts[i],tw,th),(x,y));regions[it['name']]=rect(x,y,tw,th)
        for name,indices in groups.items():a['animations'][name]=dict(frames=[regions[j['items'][i]['name']] for i in indices],frameWidth=j['items'][indices[0]]['width'],frameHeight=j['items'][indices[0]]['height'],frameRate=6,repeat=0 if name=='footstep_ring' else -1)
        for name,states in {'hatch':['hatch_closed','hatch_open'],'mirror':['mirror_covered','mirror_uncovered'],'desk':['desk_closed','desk_open'],'pillar':['pillar_idle','pillar_humming']}.items():
            if all(s in regions for s in states):a.setdefault('states',{})[name]={s.split('_')[-1]:regions[s] for s in states}
        if 'footstep_ring_0' in regions:a['intentionalEmptyRegions']=['footstep_ring_0']
        if 'pillar_idle' in regions:a['placementNote']='Place twelve instances of pillar around the chamber; the two atlas regions are idle/humming states.'
        a.update(frameWidth=16,frameHeight=16,columns=w//16,rows=h//16,regions=regions)
    elif kind=='tiles':
        for i in range(64):out.paste(cell(im,i,8,8,.015).resize((16,16),NN),(i%8*16,i//8*16))
        a.update(frameWidth=16,frameHeight=16,columns=8,rows=8)
        if j['id']=='J_resonanzkammer_tiles':
            a['animations']={f'floor_pulse_{i}':dict(frames=[8+i,56+i],frameRate=3,repeat=-1) for i in range(4)}
    elif kind=='single':out=fit(im,w,h)
    else:
        out=im.resize((w,h),NN)
        if kind=='background':a['groundStrip']=rect(0,200,480,70)
        if kind=='inspection':a.update(pair=j['pair'],cursed=j['cursed'])
    save(out,j['file'],j['transparent']);assets.append(a)

manifest=dict(version=1,batch='fall5',caseId='case_05',status='exported; runtime integration pending',paletteMaxVisibleColors=len(PAL),assets=assets)
(ROOT/'public/sprites/manifest-fall5.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
SPEC.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(assets)} PNGs from {len(sources)} sources.')
