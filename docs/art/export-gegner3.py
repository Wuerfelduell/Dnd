#!/usr/bin/env python3
"""Export image_gen originals to Batch L assets. Requires Pillow and numpy.
Usage: python docs/art/export-gegner3.py SOURCE_DIR [REPO_ROOT]
"""
import json,sys
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
ROOT=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else HERE.parents[1]
SOURCES=Path(sys.argv[1]);spec=json.loads((HERE/'batch-gegner3-generation.json').read_text())
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
 im=clean(Image.open(SOURCES/j['source']),j.get('alphaThreshold',128))
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
  a.update(frameWidth=fw,frameHeight=fw,columns=n,rows=1,animations={'play':{'frames':list(range(n)),'frameRate':8 if fw==16 else 10,'repeat':-1 if fw==16 else 0}})
 elif kind in ['turn_icons','portraits','wanted']:
  n=len(j['frameNames']);fw,fh=(16,16) if kind=='turn_icons' else (64,64) if kind=='portraits' else (64,80)
  sc=j.get('sourceColumns',n);sr=j.get('sourceRows',1)
  for i in range(n):
   f=cell(im,i%sc,i//sc,sc,sr)
   f=fit(f,(fw,fh)) if kind in ['turn_icons','portraits'] else f.resize((fw,fh),NN)
   out.paste(f,(i*fw,0))
  a.update(frameWidth=fw,frameHeight=fh,columns=n,rows=1,frameNames=j['frameNames'],animations={})
 elif kind=='equipment':
  regions={};n=len(j['items']);sc=j['sourceColumns'];sr=j['sourceRows']
  for i,item in enumerate(j['items']):
   large=fit(cell(im,i%sc,i//sc,sc,sr),(30,30));padded=Image.new('RGBA',(32,32));padded.paste(large,(1,1));large=padded
   small=large.resize((16,16),NN);out.paste(small,(i*16,0));out.paste(large,(i*32,16))
   for resolution,icon,x,y in [(16,small,i*16,0),(32,large,i*32,16)]:
    path=('items/' if resolution==16 else 'items/32/')+item['id']+'.png';save(icon,path,True)
    assets.append({'id':item['id']+('_32' if resolution==32 else ''),'gameId':item['id'],'file':path,'width':resolution,'height':resolution,'frameWidth':resolution,'frameHeight':resolution,'columns':1,'rows':1,'transparent':True,'animations':{},'atlas':j['path'],'atlasRegion':item['id']+'_'+str(resolution)})
    regions[item['id']+'_'+str(resolution)]={'x':x,'y':y,'width':resolution,'height':resolution}
  a.update(frameWidth=16,frameHeight=16,columns=w//16,rows=3,regions=regions,animations={})
 elif kind=='markers':
  regions={};anim={}
  for r,name in enumerate(j['names']):
   fw=32 if r==3 else 16;fh=16;names=[]
   for c in range(4):
    # Translate one generated seal to create an exact one-pixel bob.
    if r<3:
     f=fit(cell(im,0,r,4,4),(14,12));out.paste(f,(c*fw+1,r*fh+[2,1,2,3][c]))
    else:
     f=cell(im,c,r,4,4).resize((30,14),NN);out.paste(f,(c*fw+1,r*fh+1))
    key=name+'_'+str(c);names.append(key)
    regions[key]={'x':c*fw,'y':r*fh,'width':fw,'height':fh}
   anim[name]={'regions':names,'frameRate':4,'repeat':-1}
  a.update(frameWidth=16,frameHeight=16,columns=8,rows=4,regions=regions,regionAnimations=anim,animations={},sealBobOffsets=[0,-1,0,1])
 elif kind=='bust':
  f=fit(im,(156,156));out.paste(f,(2,2));a.update(frameWidth=160,frameHeight=160,columns=1,rows=1,animations={})
 else:raise ValueError(kind)
 save(out,j['path'],j['transparent']);assets.append(a)
manifest={'version':1,'batch':'gegner3','status':'exported; planned IDs, runtime integration pending','paletteMaxVisibleColors':len(PALETTE),'assets':assets}
(ROOT/'public/sprites/manifest-gegner3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(assets)} PNGs from {len(spec["jobs"])} source images.')

