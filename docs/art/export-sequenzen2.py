"""Export generated Batch N artwork; no procedural replacement artwork.
Usage: python docs/art/export-sequenzen2.py SOURCE_MAP.json
Requires Pillow, numpy and scipy. Source map: job ID -> original PNG path.
"""
from pathlib import Path
import json,sys,hashlib
import numpy as np
from scipy import ndimage
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/sprites'; DOC=ROOT/'docs/art'
SPEC=DOC/'batch-sequenzen2-generation.json'
spec=json.loads(SPEC.read_text()); sources=json.loads(Path(sys.argv[1]).read_text())
colors=['#1a1c2c','#252b38','#425360','#586c78','#71858b','#95a5a5','#413433','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1','#eee2c5','#494b3a','#686850','#8b8870','#245b59','#36817a','#6fe0d0','#886332','#e8b860','#d0a050','#78578f','#c8b0e8','#884b60','#e07a8a','#4f713f','#9ad06a','#64788f','#a8b4c0','#503b68','#6a4a8a']
pal=np.array([tuple(bytes.fromhex(c[1:])) for c in colors],dtype=np.int32)
NN=Image.Resampling.NEAREST
assets=[]; paths=['laterne','faden','maske','echo','kessel','eisen','schluessel']
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
for j in spec['jobs']:
 id=j['id'];p=Path(sources[id]);raw=Image.open(p).convert('RGBA');j['source']=p.name;j['sourceSha256']=hashlib.sha256(p.read_bytes()).hexdigest();j['sourceSize']=list(raw.size)
 start=len(assets);kind=j['kind'];parts=cells(raw,j)
 if kind=='potion':
  for r,n in enumerate([16,32]):
   for c,seq in enumerate([6,5]):
    name=f'trank_{j["pathway"]}_{seq}';emit(name+('_32' if r else ''),'items/'+('32/' if r else '')+name+'.png',fit(parts[r*2+c],n,n))
 elif kind in ['formula','skills']:
  sheet=blank(112,32)
  for i,part in enumerate(parts):
   icon=fit(part,16,16,pad=0 if kind=='skills' else 1);sheet.paste(icon,((i%7)*16,(i//7)*16))
   if kind=='formula':
    name=f'formel_{paths[i%7]}_{[6,5][i//7]}';emit(name,'items/'+name+'.png',icon)
  emit(id,('items/' if kind=='formula' else 'ui/')+id+'.png',sheet,frame=(16,16),pathwayOrder=paths,sequenceOrder=[6,5],**({'skillIds':[['lichtbann','fangnetz','spiegelbild','totenchor','lebenselixier','unbeugsam','taschenspiel'],['weissglut','zerreissen','maskenball','stillgesang','zersetzung','hammerfall','kehlschnitt']]} if kind=='skills' else {}))
 elif kind=='items':
  n=len(j['itemIds']);sheet=blank(n*32,48);regions={}
  for r,size in enumerate([16,32]):
   for c,name in enumerate(j['itemIds']):
    icon=fit(parts[r*n+c],size,size);icon=emit(name+('_32' if r else ''),'items/'+('32/' if r else '')+name+'.png',icon)
    x,y=c*size,r*16;sheet.paste(icon,(x,y));regions[name+('_32' if r else '')]=[x,y,size,size]
  emit(id,'items/'+id+'.png',sheet,regions=regions,itemOrder=j['itemIds'])
 elif kind=='pulse':
  # Shared frame scale preserves the generated heartbeat expansion.
  parts=[binary(x) for x in parts];bbs=[x.getbbox() for x in parts];maxw=max(b[2]-b[0] for b in bbs);maxh=max(b[3]-b[1] for b in bbs)
  for size in [16,32]:
   sheet=blank(size*2,size);k=min((size-2)/maxw,(size-2)/maxh)
   for i,(part,bb) in enumerate(zip(parts,bbs)):
    part=part.crop(bb);part=part.resize((max(1,round(part.width*k)),max(1,round(part.height*k))),NN);sheet.paste(part,(i*size+(size-part.width)//2,(size-part.height)//2))
   emit(id+('_32' if size==32 else ''),'items/'+('32/' if size==32 else '')+id+'.png',sheet,frame=(size,size),animations={'pulse':anim(2,3,-1)},baseItem=j['itemId'])
 elif kind=='fx':
  size=j['size'];n=j['count'];parts=[binary(x) for x in parts]
  # One shared source rectangle/scale for every frame preserves expansion and travel.
  bbs=[x.getbbox() for x in parts if x.getbbox()];bb=(min(b[0] for b in bbs),min(b[1] for b in bbs),max(b[2] for b in bbs),max(b[3] for b in bbs))
  k=min((size-4)/(bb[2]-bb[0]),(size-4)/(bb[3]-bb[1]));wh=(max(1,round((bb[2]-bb[0])*k)),max(1,round((bb[3]-bb[1])*k)))
  sheet=blank(size*n,size)
  for i,part in enumerate(parts):sheet.paste(part.crop(bb).resize(wh,NN),(size*i+(size-wh[0])//2,(size-wh[1])//2))
  j['sharedSourceFrameRect']=list(bb)
  emit(id,'fx/'+id+'.png',sheet,frame=(size,size),animations={'cast':anim(n,12)},target='self' if j['target']=='Selbst' else 'enemy')
 elif kind=='walk':
  parts=[binary(x) for x in parts];bbs=[x.getbbox() for x in parts]
  maxw=max(b[2]-b[0] for b in bbs);maxh=max(b[3]-b[1] for b in bbs);k=min(14/maxw,30/maxh);sheet=blank(64,128)
  for i,(part,bb) in enumerate(zip(parts,bbs)):
   part=part.crop(bb);part=part.resize((max(1,round(part.width*k)),max(1,round(part.height*k))),NN);sheet.paste(part,((i%4)*16+(16-part.width)//2,(i//4)*32+31-part.height))
  emit('N_'+id,'characters/N_'+j['character']+'_walk.png',sheet,frame=(16,32),animations={d:dict(frames=list(range(r*4,r*4+4)),frameRate=8,repeat=-1) for r,d in enumerate(['down','left','right','up'])},baseline=31)
 elif kind=='portrait':
  sheet=blank(256,64)
  for i,part in enumerate(parts):
   # Crop square busts without stretching facial proportions.
   part=part.crop((0,0,part.width,part.width)).resize((64,64),NN);sheet.paste(part,(64*i,0))
  exported=emit('N_'+id,'portraits/N_'+j['character']+'_emotions.png',sheet,False,frame=(64,64),states=['neutral','suspicious','shocked','faint_smile'],animations={name:dict(frames=[i],frameRate=1,repeat=0) for i,name in enumerate(['neutral','suspicious','shocked','faint_smile'])})
  rect=[12,0,52,40] if j['character']=='thale' else [8,5,52,49]
  head=exported.crop(rect).resize((24,24),NN);emit(j['character']+'_head','ui/heads/'+j['character']+'.png',head,False,sourcePortrait='portraits/N_'+j['character']+'_emotions.png',sourceRect=[rect[0],rect[1],rect[2]-rect[0],rect[3]-rect[1]])
 elif kind=='ui':
  # Measured regions of the selected 1536x1024 source, not assumed equal grid.
  boxes=[[165,90,445,370],[628,90,910,370],[1084,90,1365,370],[213,447,346,577],[701,447,835,577],[1017,466,1506,555],
         [78,687,397,719],[588,687,910,719],[1090,687,1405,719],[78,878,398,910]]
  j['sourceCropBoxes']=boxes;parts=[raw.crop(b) for b in boxes];sheet=blank(128,64);regions={}
  for i,state in enumerate(['empty','equipped','overloaded']):
   part=fit(parts[i],20,20,0);a=np.asarray(part).copy();a[4:16,4:16,3]=0;part=Image.fromarray(a);sheet.paste(part,(i*20,0));regions['slot_'+state]=[i*20,0,20,20]
  for i,name in enumerate(['boon','curse']):sheet.paste(fit(parts[3+i],8,8,0),(64+i*8,0));regions[name]=[64+i*8,0,8,8]
  sheet.paste(fit(parts[5],64,8,0),(0,24));regions['unrest_empty']=[0,24,64,8]
  for i in range(4):
   # Colored fill only; stretch crop to requested 64x8 strip; meter frame is separate.
   part=binary(parts[6+i]).resize((64,8),NN);x,y=(i%2)*64,40+(i//2)*8;sheet.paste(part,(x,y));regions['unrest_fill_'+str(i)]=[x,y,64,8]
  emit(id,'ui/'+id+'.png',sheet,regions=regions,regionAnimations={'unrest_fill':dict(frames=['unrest_fill_'+str(i) for i in range(4)],frameRate=8,repeat=-1)},slotAperture=[4,4,12,12])
 j['outputs']=[a['file'] for a in assets[start:]]
manifest=dict(version=1,batch='sequenzen2',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=colors,assets=assets)
(OUT/'manifest-sequenzen2.json').write_text(json.dumps(manifest,indent=2)+'\n');SPEC.write_text(json.dumps(spec,indent=2)+'\n')
print(json.dumps({'assets':len(assets),'paletteVisibleColors':len(colors)}))
