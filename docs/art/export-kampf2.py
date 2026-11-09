#!/usr/bin/env python3
"""Export image_gen originals to Batch F assets. Requires Pillow and numpy.
Usage: python docs/art/export-kampf2.py SOURCE_DIR [REPO_ROOT]
"""
import json,sys
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
ROOT=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else HERE.parents[1]
SOURCES=Path(sys.argv[1]);spec=json.loads((HERE/'batch-kampf2-generation.json').read_text())
PALETTE=spec['palette'];RGB=np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE],dtype=np.int32)
NN=Image.Resampling.NEAREST

def clean(im,threshold=128):
 a=np.array(im.convert('RGBA'));a[:,:,3]=np.where(a[:,:,3]>=threshold,255,0);a[a[:,:,3]==0,:3]=0
 return Image.fromarray(a)

def tight(im):
 box=im.getchannel('A').getbbox()
 return im.crop(box) if box else Image.new('RGBA',(1,1))

def cell(im,c,r,cols,rows):
 return im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)))

def fit(im,size,trim=True):
 if trim:im=tight(im)
 w,h=size;scale=min(w/im.width,h/im.height)
 im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN)
 out=Image.new('RGBA',size);out.paste(im,((w-im.width)//2,(h-im.height)//2));return out

def indexed(im,transparent=True):
 a=np.array(im.convert('RGBA'));pixels=a[:,:,:3].reshape(-1,3).astype(np.int32);ids=np.zeros(len(pixels),dtype=np.uint8)
 for start in range(0,len(pixels),8192):
  ids[start:start+8192]=((pixels[start:start+8192,None,:]-RGB[None,:,:])**2).sum(2).argmin(1)+1
 if transparent:ids[a[:,:,3].reshape(-1)<128]=0
 out=Image.fromarray(ids.reshape(a.shape[:2]),'P');pal=[0,0,0]+RGB.astype('uint8').flatten().tolist();out.putpalette(pal+[0]*(768-len(pal)))
 if transparent:out.info['transparency']=0
 return out

def save(im,path,transparent):
 p=ROOT/'public/sprites'/path;p.parent.mkdir(parents=True,exist_ok=True);indexed(im,transparent).save(p,optimize=True)

def animations(names,counts,cols):
 return {name:{'frames':list(range(r*cols,r*cols+n)),'frameRate':4 if name in ['idle','phase2_idle'] else 8,'repeat':-1 if name in ['idle','phase2_idle','down','left','right','up','noticed','searching','occult'] else 0} for r,(name,n) in enumerate(zip(names,counts))}

assets=[]
for j in spec['jobs']:
 im=Image.open(SOURCES/j['source']).convert('RGBA');im=clean(im,j.get('alphaThreshold',128))
 w,h=j['size'];out=Image.new('RGBA',(w,h));kind=j['kind']
 a={'id':j['id'],'file':j['path'],'width':w,'height':h,'transparent':j['transparent']}
 if j.get('gameId'):a['gameId']=j['gameId']
 if kind in ['background','card']:
  out=im.resize((w,h),NN);a.update(frameWidth=w,frameHeight=h,columns=1,rows=1,animations={})
  if kind=='background':a['groundStrip']={'x':0,'y':200,'width':480,'height':70}
 elif kind in ['battle','walk']:
  cols=j['columns'];rows=j['rows'];fw=j.get('frameWidth',j.get('cell'));fh=j.get('frameHeight',j.get('cell'));counts=j['counts']
  frames={};maxw=maxh=1
  for r,n in enumerate(counts):
   for c in range(n):
    f=tight(cell(im,c,r,cols,rows));frames[r,c]=f;maxw=max(maxw,f.width);maxh=max(maxh,f.height)
  margin=2 if kind=='battle' else 1;scale=min((fw-margin*2)/maxw,(fh-margin*2)/maxh)
  for (r,c),f in frames.items():
   if r in j.get('heldRows',[]) and c==1:f=frames[r,0]
   f=tight(f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),NN))
   out.paste(f,(c*fw+(fw-f.width)//2,r*fh+fh-margin-f.height))
  a.update(frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,baseline=fh-margin,animations=animations(j['names'],counts,cols),occupiedCounts=counts,heldRows=j.get('heldRows',[]))
  if kind=='battle':a['facing']='left'
 elif kind=='effect':
  fw=j['cell'];n=j['columns'];sc=j['sourceColumns'];sr=j['sourceRows']
  for i in range(n):
   f=cell(im,i%sc,i//sc,sc,sr).resize((fw-2,fw-2),NN);out.paste(f,(i*fw+1,1))
  a.update(frameWidth=fw,frameHeight=fw,columns=n,rows=1,animations={'play':{'frames':list(range(n)),'frameRate':10,'repeat':0}})
 elif kind=='cells':
  fw,fh,cols,rows=[j[k] for k in ['frameWidth','frameHeight','columns','rows']]
  for r in range(rows):
   # Keep source-cell positions, so the vertical bob survives export.
   for c in range(cols):out.paste(cell(im,c,r,cols,rows).resize((fw,fh),NN),(c*fw,r*fh))
  a.update(frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,animations=animations(j['names'],j['counts'],cols))
 elif kind=='turn_icons':
  for i in range(19):
   f=fit(cell(im,i%5,i//5,5,4),(16,16));out.paste(f,(i*16,0))
  a.update(frameWidth=16,frameHeight=16,columns=19,rows=1,frameNames=j['frameNames'],animations={})
 elif kind=='equipment':
  regions={}
  for i,item in enumerate(j['items']):
   large=fit(cell(im,i%4,i//4,4,2),(30,30));padded=Image.new('RGBA',(32,32));padded.paste(large,(1,1));large=padded
   small=large.resize((16,16),NN);out.paste(small,(i*16,0));out.paste(large,(i*32,16))
   for resolution,icon,x,y in [(16,small,i*16,0),(32,large,i*32,16)]:
    path=('items/' if resolution==16 else 'items/32/')+item['id']+'.png';save(icon,path,True)
    assets.append({'id':item['id']+('_32' if resolution==32 else ''),'gameId':item['id'],'file':path,'width':resolution,'height':resolution,'frameWidth':resolution,'frameHeight':resolution,'columns':1,'rows':1,'transparent':True,'animations':{},'atlas':j['path'],'atlasRegion':item['id']+'_'+str(resolution)})
    regions[item['id']+'_'+str(resolution)]={'x':x,'y':y,'width':resolution,'height':resolution}
  a.update(frameWidth=16,frameHeight=16,columns=16,rows=3,regions=regions,animations={})
 elif kind=='equipment_ui':
  regions={}
  for r in j['regions']:
   x,y,rw,rh=r['rect'];f=im.crop(tuple(r['sourceRect']));f=f.resize((rw,rh),NN) if r.get('resizeOnly') else fit(f,(rw,rh));out.paste(f,(x,y));regions[r['name']]={'x':x,'y':y,'width':rw,'height':rh}
  if j.get('panelSlots'):
   empty=next(r for r in j['regions'] if r['name']=='slot_empty')
   slot=fit(im.crop(tuple(empty['sourceRect'])),(20,20))
   for r in j['panelSlots'].values():
    x,y=r['x'],r['y'];out.paste(Image.new('RGBA',(22,22)),(x-1,y-1));out.paste(slot,(x,y))
   a['panelSlots']=j['panelSlots']
  a.update(frameWidth=16,frameHeight=16,columns=w//16,rows=h//16,regions=regions,animations={})
 elif kind=='boss_band':
  # One imagegen master is translated at integer positions for a consistent slide.
  band=tight(im).resize((480,90),NN);master=Image.new('RGBA',(480,270));master.paste(band,(0,90))
  offsets=[-480,-384,-288,-192,-96,0]
  for i,offset in enumerate(offsets):
   frame=Image.new('RGBA',(480,270));frame.paste(master,(offset,0));out.paste(frame,(i*480,0))
  a.update(frameWidth=480,frameHeight=270,columns=6,rows=1,animations={'enter':{'frames':list(range(6)),'frameRate':12,'repeat':0}},slideOffsets=offsets,bandRegion={'x':0,'y':90,'width':480,'height':90})
 elif kind=='bust':
  f=fit(im,(156,156));out.paste(f,(2,2));a.update(frameWidth=160,frameHeight=160,columns=1,rows=1,animations={})
 else:raise ValueError(kind)
 save(out,j['path'],j['transparent']);assets.append(a)
manifest={'version':1,'batch':'kampf2','status':'exported; runtime integration pending','paletteMaxVisibleColors':len(PALETTE),'assets':assets}
(ROOT/'public/sprites/manifest-kampf2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(assets)} PNGs from {len(spec["jobs"])} source images.')
