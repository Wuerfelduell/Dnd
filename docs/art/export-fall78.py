"""Technical export only: generated art -> palette PNGs; no procedural art.
Usage: python docs/art/export-fall78.py SOURCE_DIRECTORY [REPO_ROOT]
"""
from pathlib import Path
from PIL import Image
import numpy as np
import json,sys,hashlib,math
ROOT=Path(sys.argv[2]) if len(sys.argv)>2 else Path('.')
SOURCE=Path(sys.argv[1])
SPEC=ROOT/'docs/art/batch-fall78-generation.json'
spec=json.loads(SPEC.read_text()); assets=[]
colors=spec['palette']; rgb=np.array([tuple(bytes.fromhex(c.lstrip('#'))) for c in colors],dtype=np.int32)
def pal(im,transparent):
 im=im.convert('RGBA');a=np.array(im);flat=a[:,:,:3].reshape(-1,3).astype(np.int32)
 indices=np.empty(len(flat),dtype=np.uint8)
 for k in range(0,len(flat),16384):indices[k:k+16384]=1+((flat[k:k+16384,None]-rgb[None])**2).sum(2).argmin(1)
 indices=indices.reshape(a.shape[:2]);indices[a[:,:,3]<128]=0 if transparent else 1
 out=Image.fromarray(indices,'P');p=[0,0,0]+rgb.flatten().tolist();out.putpalette(p+[0]*(768-len(p)))
 if transparent:out.info['transparency']=0
 return out
def save(im,path,id,transparent=True,**kw):
 p=ROOT/'public/sprites'/path;p.parent.mkdir(parents=True,exist_ok=True)
 out=pal(im,transparent);out.save(p,optimize=True)
 a=dict(id=id,file=path,width=im.width,height=im.height,transparent=transparent,**kw);assets.append(a);return a
def cutgrid(im,cols,rows):
 return [im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows))) for r in range(rows) for c in range(cols)]
def box(im):
 a=im.getchannel('A').point(lambda x:255 if x>=128 else 0);return a.getbbox()
def fit(im,size,baseline=None,scale=None):
 b=box(im)
 if not b:return Image.new('RGBA',size)
 crop=im.crop(b);w,h=size
 s=scale or min((w-2)/crop.width,(h-2)/crop.height)
 dims=(max(1,min(w-2,round(crop.width*s))),max(1,min(h-2,round(crop.height*s))))
 crop=crop.resize(dims,Image.Resampling.NEAREST);out=Image.new('RGBA',size)
 out.alpha_composite(crop,((w-crop.width)//2,(baseline-crop.height) if baseline else (h-crop.height)//2));return out
for j in spec['jobs']:
 src=SOURCE/Path(j['source']).name
 if hashlib.sha256(src.read_bytes()).hexdigest()!=j['sha256']:raise ValueError('Source hash mismatch: '+j['id'])
 im=Image.open(src).convert('RGBA');kind=j['kind'];sz=tuple(j['size']);meta={}
 if j.get('removeWhiteMatte'):
  ar=np.array(im);white=(ar[:,:,:3].min(2)>210)&(np.ptp(ar[:,:,:3].astype(int),axis=2)<24)
  ar[:,:,3][white]=0;im=Image.fromarray(ar)
 if kind in ['battle','walk','strip','icons','portraits']:
  cols=j['columns'];counts=j['counts'];rows=len(counts);cw,ch=j['cell'];cells=cutgrid(im,cols,rows)
  out=Image.new('RGBA',(cols*cw,rows*ch));scale=None
  if kind in ['battle','walk']:
   used=[cells[r*cols+c] for r,n in enumerate(counts) for c in range(n)]
   bounds=[box(c) for c in used];bounds=[b for b in bounds if b]
   scale=min((cw-2)/max(b[2]-b[0] for b in bounds),(ch-3)/max(b[3]-b[1] for b in bounds))
  frames=[]
  for r,n in enumerate(counts):
   row=[]
   for c in range(n):
    cell=cells[r*cols+c]
    if kind=='portraits':cell=cell.resize((cw,ch),Image.Resampling.NEAREST)
    else:cell=fit(cell,(cw,ch),ch-2 if kind in ['battle','walk'] else None,scale)
    if kind=='battle' and r in [1,2] and c==1:cell=row[0].copy()
    row.append(cell);out.alpha_composite(cell,(c*cw,r*ch))
   frames.extend(row)
  meta=dict(frameWidth=cw,frameHeight=ch,columns=cols,rows=rows)
  if kind in ['battle','walk','strip']:
   meta['animations']={name:dict(frames=list(range(r*cols,r*cols+counts[r])),frameRate=(5 if kind=='walk' else 6 if name=='idle' else 10),repeat=(-1 if kind=='walk' or name=='idle' or j['id'].startswith('fx_status') else 0)) for r,name in enumerate(j['names'])}
  else:meta['frameNames']=j['names']
  if kind in ['battle','walk']:meta['baseline']=ch-2
  if kind=='battle':meta.update(facing='left',windupHoldFrames=2)
 elif kind=='props':
  cols=j['columns'];rows=j['rows'];cells=cutgrid(im,cols,rows);out=Image.new('RGBA',sz);regions={}
  for i,(name,w,h) in enumerate(j['regions']):
   x=(i%4)*64;y=(i//4)*48;cell=fit(cells[i],(w,h),h-1)
   out.alpha_composite(cell,(x,y));regions[name]=[x,y,w,h]
  meta=dict(regions=regions,grid=16,regionAnimations={})
  for prefix,fps in [('wet_coat',5),('range',5),('loom',6),('wheel',6),('hanging_threads',4)]:
   keys=[k for k in regions if k.startswith(prefix+'_')]
   if len(keys)>1:meta['regionAnimations'][prefix]=dict(regions=keys,frameRate=fps,repeat=-1)
 elif kind=='items':
  cells=cutgrid(im,8,1);out=Image.new('RGBA',sz);regions={}
  for i,id in enumerate(j['items']):
   large=fit(cells[i],(32,32));old=ROOT/'public/sprites/items'/(id+'.png')
   small=Image.open(old).convert('RGBA') if old.exists() else fit(cells[i],(16,16))
   out.alpha_composite(small,(i*16,0));out.alpha_composite(large,(i*32,16))
   regions[id+'_16']=[i*16,0,16,16];regions[id+'_32']=[i*32,16,32,32]
   if old.exists():assets.append(dict(id=id,file='items/'+id+'.png',width=small.width,height=small.height,transparent=True,sharedExisting=True))
   else:save(small,'items/'+id+'.png',id)
   save(large,'items/32/'+id+'.png',id+'_32')
  meta['regions']=regions
 elif kind=='tiles':
  if j.get('sourceCrop'):im=im.crop(tuple(j['sourceCrop']))
  cells=cutgrid(im,8,6);out=Image.new('RGBA',sz)
  for i,cell in enumerate(cells):
   inset=3;cell=cell.crop((inset,inset,cell.width-inset,cell.height-inset)).resize((16,16),Image.Resampling.NEAREST)
   out.alpha_composite(cell,((i%8)*16,(i//8)*16))
  meta.update(frameWidth=16,frameHeight=16,columns=8,rows=6)
  if j['id']=='M_traumkeller_tiles':
   meta['animations']={f'thread_shimmer_{i}':dict(frames=[4+i,34+i],frameRate=3,repeat=-1) for i in range(4)}
   meta['allowStaticFrames']=True
 else:
  out=im.resize(sz,Image.Resampling.NEAREST)
  if j['id'].startswith('bg_'):meta['groundStrip']=[0,200,480,70]
 a=save(out,j['path'],j['id'],j['transparent'],**meta)
manifest=dict(version=1,batch='fall78',status='exported; runtime integration pending',paletteMaxVisibleColors=len(colors),palette=colors,assets=assets)
(ROOT/'public/sprites/manifest-fall78.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Exported',len(assets),'assets')
