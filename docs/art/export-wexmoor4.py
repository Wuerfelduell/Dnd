#!/usr/bin/env python3
"""Technical raster export of image_gen sources. Requires Pillow and numpy.
Usage: python docs/art/export-wexmoor4.py SOURCE_DIR [REPO_ROOT] [--partial]
"""
import json,sys,math
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
ROOT=Path(sys.argv[2]).resolve() if len(sys.argv)>2 and not sys.argv[2].startswith('--') else HERE.parents[1]
SOURCES=Path(sys.argv[1]);SPEC=HERE/'batch-wexmoor4-generation.json';spec=json.loads(SPEC.read_text());NN=Image.Resampling.NEAREST
RGB=np.array([tuple(bytes.fromhex(c[1:])) for c in spec['palette']],dtype=np.int32)
def clean(im):
 a=np.array(im.convert('RGBA'));a[:,:,3]=np.where(a[:,:,3]>=128,255,0);a[a[:,:,3]==0,:3]=0;return Image.fromarray(a)
def tight(im):
 b=im.getchannel('A').getbbox();return im.crop(b) if b else Image.new('RGBA',(1,1))
def cell(im,c,r,cols,rows):return im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)))
def fit(im,size,margin=1):
 im=tight(im);w,h=size;s=min((w-2*margin)/im.width,(h-2*margin)/im.height);im=tight(im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),NN));out=Image.new('RGBA',size);out.paste(im,((w-im.width)//2,h-margin-im.height));return out
def indexed(im,transparent):
 a=np.array(im.convert('RGBA'));px=a[:,:,:3].reshape(-1,3).astype(np.int32);ids=np.zeros(len(px),dtype=np.uint8)
 for s in range(0,len(px),8192):ids[s:s+8192]=((px[s:s+8192,None,:]-RGB[None,:,:])**2).sum(2).argmin(1)+1
 if transparent:ids[a[:,:,3].reshape(-1)<128]=0
 out=Image.fromarray(ids.reshape(a.shape[:2]),'P');pal=[0,0,0]+RGB.astype('uint8').flatten().tolist();out.putpalette(pal+[0]*(768-len(pal)))
 if transparent:out.info['transparency']=0
 return out
def save(im,path,transparent):
 p=ROOT/'public/sprites'/path;p.parent.mkdir(parents=True,exist_ok=True);indexed(im,transparent).save(p,optimize=True)
def zero_runs(v):
 runs=[];start=None
 for i,z in enumerate(list(v)+[False]):
  if z and start is None:start=i
  elif not z and start is not None:runs.append((start,i));start=None
 return runs
def source_boxes(im,cols,rows,n):
 # Use transparent gutters to retain wide props that cross nominal source columns.
 a=np.array(im.getchannel('A'))>0;cuts=[0]
 for r in range(1,rows):
  target=im.height*r/rows;radius=im.height/rows*.27
  candidates=[(s+e)//2 for s,e in zero_runs(~a.any(1)) if abs((s+e)/2-target)<radius]
  cuts.append(min(candidates,key=lambda x:abs(x-target)) if candidates else round(target))
 cuts.append(im.height);boxes=[]
 for r in range(rows):
  count=min(cols,n-r*cols)
  if count<=0:break
  y0,y1=cuts[r:r+2];occupied=a[y0:y1].any(0);xs=np.flatnonzero(occupied)
  if not len(xs):raise ValueError('Empty prop source row')
  gaps=[(s,e) for s,e in zero_runs(~occupied) if s>xs[0] and e<xs[-1]]
  gaps=sorted(gaps,key=lambda se:se[1]-se[0],reverse=True)[:count-1]
  if len(gaps)==count-1:xcuts=[0]+sorted((s+e)//2 for s,e in gaps)+[im.width]
  else:xcuts=[round(i*im.width/cols) for i in range(count)]+[im.width]
  boxes.extend([[xcuts[c],y0,xcuts[c+1],y1] for c in range(count)])
 return boxes
assets=[]
for j in spec['jobs']:
 if not j.get('source'):
  if '--partial' in sys.argv:continue
  raise ValueError('Missing source '+j['id'])
 im=clean(Image.open(SOURCES/j['source']));kind=j['kind'];w,h=j['size'];out=Image.new('RGBA',(max(1,w),max(1,h)));a={'id':j['id'],'file':j['path'],'kind':kind,'transparent':j['transparent'],'animations':{}}
 if j.get('sourceCrop'):im=im.crop(j['sourceCrop'])
 if j.get('gameId'):a['gameId']=j['gameId']
 if kind in ['walk','battle']:
  fw,fh=j['frameWidth'],j['frameHeight'];cols,rows=j['columns'],j['rows'];counts=j['counts'];frames={}
  for r,n in enumerate(counts):
   for c in range(n):frames[r,c]=tight(cell(im,c,r,cols,rows))
  margin=2 if kind=='battle' else 1;scale=min((fw-margin*2)/max(f.width for f in frames.values()),(fh-margin*2)/max(f.height for f in frames.values()))
  for (r,c),f in frames.items():
   if r in j.get('heldRows',[]) and c==1:f=frames[r,0]
   f=tight(f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),NN))
   if j.get('flicker') and c in [1,3]:
    # Binary-alpha face/hand light flicker, no translucent output pixels.
    ar=np.array(f);yy,xx=np.indices(ar.shape[:2]);mask=((xx+yy)%4==0)&(yy<round(f.height*.65))&(ar[:,:,:3].mean(2)>120);ar[mask,3]=0;f=Image.fromarray(ar)
   out.paste(f,(c*fw+(fw-f.width)//2,r*fh+fh-margin-f.height))
  a.update(frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,occupiedCounts=counts,baseline=fh-margin,heldRows=j.get('heldRows',[]))
  a['animations']={name:{'frames':list(range(r*cols,r*cols+n)),'frameRate':4 if name=='idle' else 8,'repeat':-1 if kind=='walk' or name=='idle' else 0} for r,(name,n) in enumerate(zip(j['names'],counts))}
  if kind=='battle':a['facing']='left'
  if j.get('flicker'):a['flickerFrames']=[r*4+c for r in range(4) for c in [1,3]]
 elif kind=='portraits':
  for i in range(4):out.paste(cell(im,i%2,i//2,2,2).resize((64,64),NN),(i*64,0))
  a.update(frameWidth=64,frameHeight=64,columns=4,rows=1,frameNames=j['frameNames'])
  if j.get('headOutput'):
   # Neutral portrait head crop: fixed upper-middle framing, no generative redraw.
   head=out.crop((10,3,54,47)).resize((24,24),NN);save(head,j['headOutput'],False)
   assets.append({'id':j['gameId']+'_head','gameId':j['gameId'],'file':j['headOutput'],'kind':'head','width':24,'height':24,'frameWidth':24,'frameHeight':24,'columns':1,'rows':1,'transparent':False,'animations':{},'derivedFrom':j['path'],'sourceRegion':{'x':10,'y':3,'width':44,'height':44}})
 elif kind=='item':
  large=fit(im,(32,32));out=large.resize((16,16),NN);save(large,j['largeOutput'],True)
  assets.append({'id':j['id']+'_32','file':j['largeOutput'],'kind':'item','width':32,'height':32,'frameWidth':32,'frameHeight':32,'columns':1,'rows':1,'transparent':True,'animations':{}})
  a.update(frameWidth=16,frameHeight=16,columns=1,rows=1)
 elif kind=='props':
  n=sum(p['frames'] for p in j['items']);boxes=j.get('sourceBoxes') or source_boxes(im,j['sourceColumns'],j['sourceRows'],n);j['sourceBoxes']=boxes
  slots=[];x=y=rowh=0;index=0;regions={};anim={};states={}
  for p in j['items']:
   pw,ph=p['width'],p['height'];fs=[tight(im.crop(boxes[index+f])) for f in range(p['frames'])];index+=p['frames']
   for repair in spec.get('repairs',[]):
    if repair['target']==j['id'] and repair['kind']=='prop' and repair['name']==p['name']:fs=[tight(clean(Image.open(SOURCES/repair['source'])))]
   scale=min((pw-2)/max(f.width for f in fs),(ph-2)/max(f.height for f in fs));names=[]
   for fi,f in enumerate(fs):
    if x+pw>256:x=0;y+=rowh;rowh=0
    name=p['name']+('_'+str(fi) if p['frames']>1 else '');f=tight(f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),NN));slots.append((f,x+(pw-f.width)//2,y+ph-1-f.height));regions[name]={'x':x,'y':y,'width':pw,'height':ph};names.append(name);x+=pw;rowh=max(rowh,ph)
   if p['frames']>1:
    if 'variant' in p['description'] or 'closed' in p['description']:states[p['name']]=names
    else:anim[p['name']]={'regions':names,'frameRate':3 if p['frames']<3 else 6,'repeat':-1}
  w,h=256,y+rowh;out=Image.new('RGBA',(w,h))
  for f,x,y in slots:out.paste(f,(x,y))
  a.update(frameWidth=16,frameHeight=16,columns=w//16,rows=h//16,regions=regions,regionAnimations=anim,states=states)
  j['size']=[w,h]
 elif kind=='tiles':
  for i,name in enumerate(j['tileNames']):out.paste(cell(im,i%8,i//8,8,j['sourceRows']).resize((16,16),NN),(i%8*16,i//8*16))
  for repair in spec.get('repairs',[]):
   if repair['target']==j['id'] and repair['kind']=='tiles':
    rim=clean(Image.open(SOURCES/repair['source']))
    for ri,ti in enumerate(repair['indices']):
     f=cell(rim,ri%repair['sourceColumns'],ri//repair['sourceColumns'],repair['sourceColumns'],repair['sourceRows']);f=fit(f,(16,16)) if repair['id']=='repair_rope' else f.resize((16,16),NN);out.paste(f,(ti%8*16,ti//8*16))
  a.update(frameWidth=16,frameHeight=16,columns=8,rows=h//16,tileNames=j['tileNames'],occupiedCounts=[min(8,len(j['tileNames'])-r*8) for r in range(h//16)])
  a['animations']={n:{'frames':f,'frameRate':3,'repeat':-1} for n,f in j['tileAnimations'].items()}
  if j.get('composites'):a['composites']=j['composites']
 elif kind=='effect':
  fw,fh=j['frameWidth'],j['frameHeight']
  for i in range(j['columns']):
   f=cell(im,i%j['sourceColumns'],i//j['sourceColumns'],j['sourceColumns'],j['sourceRows'])
   if j.get('sourceInsetFraction'):
    dx=round(f.width*j['sourceInsetFraction']);dy=round(f.height*j['sourceInsetFraction']);f=f.crop((dx,dy,f.width-dx,f.height-dy))
   f=f.resize((fw-2,fh-2),NN);out.paste(f,(i*fw+1,1))
  a.update(frameWidth=fw,frameHeight=fh,columns=j['columns'],rows=1,animations={'play':{'frames':list(range(j['columns'])),'frameRate':10,'repeat':0}})
 elif kind=='bust':out=fit(im,(w,h),2);a.update(frameWidth=w,frameHeight=h,columns=1,rows=1)
 elif kind in ['background','still']:
  out=im.resize((w,h),NN);a.update(frameWidth=w,frameHeight=h,columns=1,rows=1)
  if kind=='background':a['groundStrip']={'x':0,'y':200,'width':480,'height':70}
 else:raise ValueError(kind)
 save(out,j['path'],j['transparent']);a.update(width=w,height=h);assets.append(a)
manifest={'version':1,'batch':'wexmoor4','status':'exported; game integration separate','paletteMaxVisibleColors':32,'assets':assets}
(ROOT/'public/sprites/manifest-wexmoor4.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
SPEC.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n');print(f'Exported {len(assets)} PNGs')
