#!/usr/bin/env python3
"""Export Batch K from ImageGen sources. Usage: export-fall6.py SOURCE_DIR [REPO_ROOT].
Requires Pillow and numpy. Actual prompts, sources and layout overrides are recorded in
batch-fall6-generation.json. Runtime integration is deliberately separate.
"""
from pathlib import Path
import json,sys,hashlib,math
import numpy as np
from PIL import Image
ROOT=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parents[2]
SRC=Path(sys.argv[1]);OUT=ROOT/'public/sprites';NN=Image.Resampling.NEAREST
spec=json.loads((ROOT/'docs/art/batch-fall6-generation.json').read_text())
PAL=[tuple(bytes.fromhex(h[1:])) for h in spec['palette']]
pal=Image.new('P',(1,1));pal.putpalette(sum((list(c) for c in PAL),[])+[0]*(768-len(PAL)*3))
assets=[]
def binary(im):
 im=im.convert('RGBA');im.putalpha(im.getchannel('A').point(lambda x:255 if x>=128 else 0));return im

def cell(im,c,r,grid,trim=0):
 w,h=im.size;nx,ny=grid;x0=round(c*w/nx);x1=round((c+1)*w/nx);y0=round(r*h/ny);y1=round((r+1)*h/ny)
 return im.crop((x0+trim,y0+trim,x1-trim,y1-trim))

def fit(im,size,pad=1,bottom=False,scale=None):
 im=binary(im);box=im.getbbox();out=Image.new('RGBA',size)
 if not box:return out
 im=im.crop(box);w,h=size
 s=scale or min((w-pad*2)/im.width,(h-pad*2)/im.height)
 sx,sy=s if isinstance(s,tuple) else (s,s)
 im=im.resize((max(1,min(w-pad*2,round(im.width*sx))),max(1,min(h-pad*2,round(im.height*sy)))),NN)
 if im.getbbox():im=im.crop(im.getbbox())
 out.alpha_composite(im,((w-im.width)//2,h-pad-im.height if bottom else (h-im.height)//2));return out

def save(file,im,id,transparent=True,**meta):
 im=binary(im)
 if not transparent:im.putalpha(255)
 a=np.asarray(im.getchannel('A'));q=np.asarray(im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE)).copy()
 q[(a>0)&(q==0)]=1;q[a==0]=0
 out=Image.fromarray(q.astype('uint8'),'P');out.putpalette(pal.getpalette());out.info['transparency']=0
 p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True);out.save(p,transparency=0,optimize=False)
 assets.append(dict(id=id,file=file,width=im.width,height=im.height,transparent=transparent,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),**meta))
 return out.convert('RGBA')

def anim(frames,fps=8,loop=False):return dict(frames=frames,frameRate=fps,repeat=-1 if loop else 0)
for j in spec['jobs']:
 id=j['id'];g=spec['sources'][id];im=Image.open(SRC/g['source']).convert('RGBA');mode=j['mode'];grid=g.get('grid',j.get('grid'));meta={}
 transparent=not(j.get('opaque') or mode in ['tiles','portrait','background','inspection'])
 def part(i):
  if 'crops' in g:return im.crop(g['crops'][i])
  return cell(im,i%grid[0],i//grid[0],grid)
 if mode in ['battle','walk']:
  fw,fh=j['frame'];nc,nr=j['grid'];counts=j.get('counts',[nc]*nr);out=Image.new('RGBA',(fw*nc,fh*nr));crops={}
  for r,n in enumerate(counts):
   for c in range(n):crops[r,c]=binary(part(r*nc+c))
  boxes=[x.getbbox() for x in crops.values() if x.getbbox()];scale=min((fw-2)/max(b[2]-b[0] for b in boxes),(fh-2)/max(b[3]-b[1] for b in boxes))
  if mode=='walk':scale=((fw-2)/max(b[2]-b[0] for b in boxes),(fh-2)/max(b[3]-b[1] for b in boxes))
  frames={key:fit(x,(fw,fh),1,True,scale) for key,x in crops.items()}
  holds=[1,2]+([3] if id=='boss' else []) if mode=='battle' else []
  for r in holds:frames[r,1]=frames[r,0].copy()
  for (r,c),frame in frames.items():out.alpha_composite(frame,(c*fw,r*fh))
  names=j.get('animations',['down','left','right','up']);animations={name:anim(list(range(r*nc,r*nc+counts[r])),6 if name=='idle' else 8,mode=='walk' or name=='idle') for r,name in enumerate(names)}
  meta=dict(frameWidth=fw,frameHeight=fh,columns=nc,rows=nr,baselineY=fh-2,animations=animations,paddingFrames=[r*nc+c for r,n in enumerate(counts) for c in range(n,nc)],heldAnticipationRows=holds)
  if mode=='battle':meta['facing']='left'
 elif mode in ['fx','portrait','icons']:
  fw,fh=j['frame'];n=j.get('count',len(j.get('expressions',j.get('names',[]))));out=Image.new('RGBA',(fw*n,fh))
  # Effects retain size progression; a single scale is used across their strip.
  crops=[binary(part(i)) for i in range(n)];boxes=[x.getbbox() for x in crops if x.getbbox()]
  scale=min((fw-2)/max(b[2]-b[0] for b in boxes),(fh-2)/max(b[3]-b[1] for b in boxes)) if mode=='fx' else None
  for i,crop in enumerate(crops):
   frame=crop.resize((fw,fh),NN) if mode=='portrait' else fit(crop,(fw,fh),1,False,scale)
   out.alpha_composite(frame,(i*fw,0))
  meta=dict(frameWidth=fw,frameHeight=fh,columns=n,rows=1)
  if mode=='fx':meta['animations']={'play':anim(list(range(n)),10,'status_' in id)}
  if mode=='portrait':meta['frameNames']=j['expressions']
  if mode=='icons':meta['frameNames']=j['names']
 elif mode=='props':
  # Named variable-sized regions packed on a native 16px atlas grid.
  width=256;rects=[];x=y=rowh=0
  for name,w,h,desc in j['parts']:
   if x+w>width:x=0;y+=rowh;rowh=0
   rects.append((x,y,w,h));x+=w;rowh=max(rowh,math.ceil(h/16)*16)
  out=Image.new('RGBA',(width,y+rowh));regions={}
  for i,((name,w,h,desc),(x,y,_,_)) in enumerate(zip(j['parts'],rects)):
   rawpart=Image.open(SRC/g['partSources'][name]).convert('RGBA') if name in g.get('partSources',{}) else part(i)
   out.alpha_composite(fit(rawpart,(w,h),1,True),(x,y));regions[name]=[x,y,w,h]
  meta={'regions':regions,'regionDescriptions':{p[0]:p[3] for p in j['parts']},'grid':16,'regionAnimations':{}}
  families={'props_atelier':{'camera':['camera_down','camera_lifted'],'flash':['flash_idle','flash_burst'],'safelight':['safelight_0','safelight_1'],'cabinet':['cabinet_closed','cabinet_open'],'develop':['plate_'+str(i) for i in range(4)]},'props_ballsaal':{'chandelier':['chandelier_'+str(i) for i in range(3)]},'props_spiegelkabinett':{'lamp':['lamp_0','lamp_1'],'guest_mirror':['guest_mirror_'+str(i) for i in range(4)],'tank':['tank_'+str(i) for i in range(4)]},'props_jahrmarkt_aussen':{'carousel':['carousel_'+str(i) for i in range(4)]},'shadows':{'detach':['detach_'+str(i) for i in range(4)]}}
  for key,names in families.get(id,{}).items():
   names=[n for n in names if n in regions]
   if names:meta['regionAnimations'][key]=dict(regions=names,frameRate=4,repeat=-1 if key in ['safelight','chandelier','lamp','tank','carousel'] else 0)
 elif mode=='items':
  n=len(j['parts']);out=Image.new('RGBA',(n*32,48));regions={}
  for i,(name,desc) in enumerate(j['parts']):
   for sz,y in [(16,0),(32,16)]:
    icon=save('items/'+('32/' if sz==32 else '')+name+'.png',fit(part(i),(sz,sz)),name+'_'+str(sz),frameWidth=sz,frameHeight=sz,columns=1,rows=1)
    out.alpha_composite(icon,(i*sz,y));regions[name+'_'+str(sz)]=[i*sz,y,sz,sz]
  meta={'regions':regions}
 elif mode=='tiles':
  out=Image.new('RGBA',(128,128))
  for r in range(8):
   for c in range(8):out.paste(cell(im,c,r,(8,8),trim=max(2,round(im.width/8*.025))).resize((16,16),NN),(c*16,r*16))
  # Match the 1px outer border of the four interchangeable base floor tiles.
  base=out.crop((0,0,16,16));base.paste(base.crop((0,0,1,16)),(15,0));base.paste(base.crop((0,0,16,1)),(0,15))
  for c in range(4):
   for box,xy in [((0,0,1,16),(c*16,0)),((15,0,16,16),(c*16+15,0)),((0,0,16,1),(c*16,0)),((0,15,16,16),(c*16,15))]:out.paste(base.crop(box),xy)
  meta=dict(frameWidth=16,frameHeight=16,columns=8,rows=8,tileFamilies=j['families'],tileNames=g.get('tileNames',[]),tileRegions=g.get('tileRegions',{}),seamlessFloorFrames=[0,1,2,3])
 else:
  out=im.resize(tuple(j['size']),NN) if not transparent else fit(im,tuple(j['size']),1)
  meta=dict(frameWidth=j['size'][0],frameHeight=j['size'][1],columns=1,rows=1)
  if mode=='background':meta.update(mapId=j['mapId'],groundStrip=[0,200,480,70])
 if mode in ['walk','battle']:meta['entityId']='dreizehnter_gast' if id in ['boss','ow_dreizehnter_gast'] else id.removeprefix('ow_').removesuffix('_walk')
 save(j['out'],out,id,transparent,**meta)
manifest=dict(version=1,batch='fall6',caseId='case_06',status='exported; runtime integration pending',paletteMaxVisibleColors=31,palette=spec['palette'][1:],assets=assets)
(OUT/'manifest-fall6.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Exported',len(assets),'PNGs')
