"""Export generated Batch T artwork; no procedural replacement artwork.
Usage: python docs/art/export-zirkel.py SOURCE_MAP.json
Requires Pillow, numpy and scipy. Source map: job ID -> original PNG path.
"""
from pathlib import Path
import json,sys,hashlib
import numpy as np
from scipy import ndimage
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/sprites'; DOC=ROOT/'docs/art'
SPEC=DOC/'batch-zirkel-generation.json'
spec=json.loads(SPEC.read_text()); sources=json.loads(Path(sys.argv[1]).read_text())
colors=['#1a1c2c','#252b38','#344454','#425360','#586c78','#95a5a5','#413433','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1','#eee2c5','#303d30','#4a5839','#6a7a50','#2a3a3a','#486260','#6b8980','#886332','#b29351','#d0a050','#3b3547','#554b61','#776a80','#5a2a3a','#7b4149','#583426','#8a4c2d','#b87545','#4b4c41','#8b8870']
pal=np.array([tuple(bytes.fromhex(c[1:])) for c in colors],dtype=np.int32)
NN=Image.Resampling.NEAREST
assets=[]
def blank(w,h):return Image.new('RGBA',(w,h))
def binary(im):
 im=im.convert('RGBA');im.putalpha(im.getchannel('A').point(lambda a:255 if a>=200 else 0));return im
def clean(im,transparent=True):
 a=np.asarray(im.convert('RGBA'));rgb=a[:,:,:3].astype(np.int32)
 idx=((rgb[:,:,None,:]-pal[None,None,:,:])**2).sum(3).argmin(2).astype('uint8')+1
 if transparent:idx[a[:,:,3]<200]=0
 out=Image.fromarray(idx,'P');p=[0,0,0]+pal.flatten().tolist();out.putpalette(p+[0]*(768-len(p)))
 if transparent:out.info['transparency']=0
 return out
def fit(im,w,h,pad=1):
 im=binary(im);bb=im.getbbox();out=blank(w,h)
 if not bb:return out
 im=im.crop(bb);k=min((w-2*pad)/im.width,(h-2*pad)/im.height)
 im=im.resize((max(1,round(im.width*k)),max(1,round(im.height*k))),NN)
 out.paste(im,((w-im.width)//2,(h-im.height)//2));return out
def emit(id,file,im,transparent=True,frame=None,animations=None,**kw):
 im=clean(im,transparent);p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True);im.save(p,optimize=True)
 fw,fh=frame or im.size
 a=dict(id=id,file=file,width=im.width,height=im.height,transparent=transparent,frameWidth=fw,frameHeight=fh,columns=im.width//fw,rows=im.height//fh)
 if animations:a['animations']=animations
 a.update(kw);assets.append(a);return im.convert('RGBA')
def anim(n,rate=10,repeat=0):return dict(frames=list(range(n)),frameRate=rate,repeat=repeat)
def split_rows(im,n):
 # Find actual transparent gutters, rather than assuming the generator obeyed row heights.
 if n==1:return [0,im.height]
 a=np.asarray(binary(im))[:,:,3]>0;active=a.sum(1)>max(2,im.width*.002)
 labels,count=ndimage.label(~active);gaps=[]
 for i in range(1,count+1):
  y=np.where(labels==i)[0]
  if y[0]>0 and y[-1]<im.height-1:gaps.append((len(y),int((y[0]+y[-1])/2)))
 if len(gaps)>=n-1:return [0]+sorted(y for _,y in sorted(gaps,reverse=True)[:n-1])+[im.height]
 return [round(i*im.height/n) for i in range(n+1)]
def cells(im,j):
 cols,rows=j['cols'],j['rows'];ys=split_rows(im,rows) if j['kind'] in ['potion','formula','skills','items','walk'] else [round(i*im.height/rows) for i in range(rows+1)]
 boxes=[]
 for r in range(rows):
  for c in range(cols):boxes.append([round(c*im.width/cols),ys[r],round((c+1)*im.width/cols),ys[r+1]])
 j['sourceCropBoxes']=boxes
 return [im.crop(b) for b in boxes]

def remove_light_matte(im):
 # Only border-connected near-neutral light matte; keep enclosed pale skin/hair.
 a=np.array(im.convert('RGBA'));rgb=a[:,:,:3].astype(int)
 mask=(rgb.min(2)>145)&((rgb.max(2)-rgb.min(2))<24)
 seed=np.zeros(mask.shape,bool);seed[[0,-1],:]=mask[[0,-1],:];seed[:,[0,-1]]=mask[:,[0,-1]]
 bg=ndimage.binary_propagation(seed,mask=mask);a[bg,3]=0
 return Image.fromarray(a)

for j in spec['jobs']:
 id=j['id'];p=Path(sources[id]);raw=Image.open(p).convert('RGBA')
 j['source']=p.name;j['sourceSha256']=hashlib.sha256(p.read_bytes()).hexdigest();j['sourceSize']=list(raw.size)
 start=len(assets);kind=j['kind']
 if kind=='walk':
  if raw.getchannel('A').getextrema()==(255,255):
   raw=remove_light_matte(raw);j['matteRemoval']='border-connected light neutral pixels'
  parts=[binary(x) for x in cells(raw,j)];bbs=[x.getbbox() for x in parts]
  maxw=max(b[2]-b[0] for b in bbs);maxh=max(b[3]-b[1] for b in bbs);k=min(14/maxw,30/maxh);sheet=blank(64,128)
  for i,(part,bb) in enumerate(zip(parts,bbs)):
   part=part.crop(bb);part=part.resize((max(1,round(part.width*k)),max(1,round(part.height*k))),NN)
   sheet.paste(part,((i%4)*16+(16-part.width)//2,(i//4)*32+31-part.height))
  emit('T_'+id,'characters/T_'+j['character']+'_walk.png',sheet,frame=(16,32),animations={d:dict(frames=list(range(r*4,r*4+4)),frameRate=8,repeat=-1) for r,d in enumerate(['down','left','right','up'])},baseline=31)
 elif kind=='portrait':
  # Remove only an observed outer white frame (Rusk source), before equal panel splitting.
  a=np.asarray(raw);dark=(a[:,:,:3].max(2)<180);ys,xs=np.where(dark)
  outer=(int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1))
  j['outerCrop']=list(outer);raw=raw.crop(outer);parts=cells(raw,j);sheet=blank(256,64)
  for i,part in enumerate(parts):
   side=min(part.size);top=max(0,round((part.height-side)*.35))
   part=part.crop((0,top,side,top+side)).resize((64,64),NN);sheet.paste(part,(64*i,0))
  states=['neutral','suspicious','shocked','bidding']
  exported=emit('T_'+id,'portraits/T_'+j['character']+'_emotions.png',sheet,False,frame=(64,64),states=states,animations={n:dict(frames=[i],frameRate=1,repeat=0) for i,n in enumerate(states)})
  rect=[0,4,64,56] if j['character']=='tm_cobb' else [4,0,56,52]
  head=exported.crop(rect).resize((24,24),NN)
  emit(j['character']+'_head','ui/heads/'+j['character']+'.png',head,False,sourcePortrait='portraits/T_'+j['character']+'_emotions.png',sourceRect=[rect[0],rect[1],rect[2]-rect[0],rect[3]-rect[1]])
 elif kind=='ui':
  if raw.getchannel('A').getextrema()==(255,255):raw=remove_light_matte(raw)
  parts=cells(raw,j);sheet=blank(128,64);regions={}
  for i in range(2):
   sheet.paste(fit(parts[i],16,16,0),(i*16,0));regions['bid_'+str(i)]=[i*16,0,16,16]
  names=['silent_scale','chalk_circle','soot_society','lightless','salt_brothers']
  for i,n in enumerate(names):
   sheet.paste(fit(parts[i+2],12,12,0),(40+i*16,0));regions[n]=[40+i*16,0,12,12]
  sheet.paste(fit(parts[7],24,24),(104,32));regions['sold']=[104,32,24,24]
  for i in range(4):
   sheet.paste(fit(parts[i+8],24,24),(i*24,32));regions['gavel_'+str(i)]=[i*24,32,24,24]
  emit(id,'ui/T_auktion.png',sheet,regions=regions,regionAnimations={'bid':dict(frames=['bid_0','bid_1'],frameRate=4,repeat=-1),'gavel':dict(frames=['gavel_'+str(i) for i in range(4)],frameRate=10,repeat=0)})
 j['outputs']=[a['file'] for a in assets[start:]]
manifest=dict(version=1,batch='zirkel',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=colors,assets=assets)
(OUT/'manifest-zirkel.json').write_text(json.dumps(manifest,indent=2)+'\n');SPEC.write_text(json.dumps(spec,indent=2)+'\n')
print(json.dumps({'assets':len(assets),'paletteVisibleColors':len(colors)}))
