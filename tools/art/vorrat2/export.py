"""Export BK generated character atlases into the game's exact grids. Pillow only."""
from pathlib import Path
from PIL import Image
import json, hashlib
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
OUT=ROOT/'public/sprites'
CHARS=json.loads((HERE/'characters.json').read_text())
PALETTE=json.loads((OUT/'manifest-wexmoor7.json').read_text())['palette'][:31]
RGB=[tuple(bytes.fromhex(x[1:])) for x in PALETTE]
PAL=Image.new('P',(1,1));PAL.putpalette(sum(([0,0,0],*[list(c)for c in RGB]),[])+[0]*(768-96))
ASSETS=[];head_frames=[]
def clean(im):
 im=im.convert('RGBA')
 # Remove neutral near-white generation matte; warm ivory clothing is preserved.
 im.putdata([(r,g,b,255 if a>=128 and not (min(r,g,b)>180 and max(r,g,b)-min(r,g,b)<15) else 0) for r,g,b,a in im.get_flattened_data()])
 return im

def runs(values,minimum=3):
 out=[];start=None
 for i,v in enumerate(values+[0]):
  if v>=minimum and start is None:start=i
  elif v<minimum and start is not None:
   if i-start>=3:out.append((start,i))
   start=None
 return out

def bands(im,axis=1):
 a=im.getchannel('A');w,h=im.size
 vals=[sum(p>0 for p in a.crop((0,i,w,i+1) if axis else (i,0,i+1,h)).get_flattened_data())for i in range(h if axis else w)]
 return runs(vals)

def content(im):
 b=im.getbbox();assert b, 'Empty source cell';return im.crop(b)

def fit(im,size,baseline=None,maxheight=None):
 im=content(im);w,h=size;scale=min((w-2)/im.width,((maxheight or (h-2)))/im.height)
 im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.NEAREST)
 im=content(im)
 result=Image.new('RGBA',size);y=(baseline+1-im.height)if baseline is not None else(h-im.height)//2
 result.alpha_composite(im,((w-im.width)//2,y));return result

def indexed(im):
 a=im.getchannel('A');p=im.convert('RGB').quantize(palette=PAL,dither=Image.Dither.NONE)
 # index 0 is transparent only, map accidental nearest-black pixels to outline index.
 pixels=list(p.get_flattened_data());alpha=list(a.get_flattened_data())
 p.putdata([0 if not alpha[i] else (v or 1)for i,v in enumerate(pixels)]);p.info['transparency']=0;return p

def emit(id,file,frames,fw,fh,cols,rows,kind,animations=None,baseline=None,occupied=None,extra=None):
 assert len(frames)==cols*rows
 sheet=Image.new('RGBA',(fw*cols,fh*rows))
 for i,f in enumerate(frames):
  if f is not None:sheet.alpha_composite(f,((i%cols)*fw,(i//cols)*fh))
 p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True);indexed(sheet).save(p,optimize=True,transparency=0)
 asset=dict(id=id,file=file,width=sheet.width,height=sheet.height,frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,kind=kind,transparent=True)
 if animations:asset['animations']=animations
 if baseline is not None:asset['baseline']=baseline
 if occupied:asset['occupiedCounts']=occupied
 if extra:asset.update(extra)
 asset['sha256']=hashlib.sha256(p.read_bytes()).hexdigest();ASSETS.append(asset)
 return sheet

for ch in CHARS:
 cid=ch['id'];path=HERE/'sources'/f'{cid}.png'
 if not path.exists():continue
 src=clean(Image.open(path));w,h=src.size
 portraits=[]
 for row in range(2):
  for col in range(4):portraits.append(fit(src.crop((round(col*w/4),round(row*h/4),round((col+1)*w/4),round((row+1)*h/4))),(64,64)))
 for row in range(2):
  labels=['neutral','suspicious','startled','slight_smile'] if not row else ['angry','sad','thoughtful','determined']
  emit(cid+('_emotions'if not row else '_emotions2'),f'portraits/{cid}_emotions.png'if not row else f'portraits/AK_{cid}_emotions2.png',portraits[row*4:row*4+4],64,64,4,1,'portraits',{name:dict(frames=[i],frameRate=1,repeat=0)for i,name in enumerate(labels)})
 # Projection bands correct the slight variable spacing in generated atlases;
 # no synthetic expressions, mirrored views or painted replacement frames.
 split={'bh_greavesend':345,'bh_vellish':375,'bh_dipple':342,'vn_landarzt':375}.get(cid,w//4)
 walk_src=src.crop((0,h//2,split,h));ys=[(a,b) for a,b in bands(walk_src) if b-a>walk_src.height/10]
 assert len(ys)==4,(cid,'walking rows',ys)
 frames=[]
 for y1,y2 in ys:
  strip=walk_src.crop((0,y1,walk_src.width,y2));xs=bands(strip,0)
  # Separate sprites may have tiny isolated edge pixels; use fixed equal cells
  # only if the projection does not yield the expected four bodies.
  if len(xs)!=4:xs=[(round(i*strip.width/4),round((i+1)*strip.width/4))for i in range(4)]
  for x1,x2 in xs:frames.append(fit(strip.crop((x1,0,x2,strip.height)),(16,32),30,24 if cid=='vn_waisenjunge' else 29))
 emit(cid+'_walk',f'characters/{cid}_walk.png',frames,16,32,4,4,'walk',{d:dict(frames=list(range(i*4,i*4+4)),frameRate=7,repeat=-1)for i,d in enumerate(['down','left','right','up'])},30)
 tail=src.crop((split,h//2,w,h));ys=[(a,b) for a,b in bands(tail) if b-a>20];assert len(ys)>=2,(cid,'extras/head',ys)
 strip=tail.crop((0,ys[0][0],tail.width,ys[0][1]));strip=content(strip);xs=bands(strip,0)
 if len(xs)!=4:xs=[(round(i*strip.width/4),round((i+1)*strip.width/4))for i in range(4)]
 extra_frames=[fit(strip.crop((x1,0,x2,strip.height)),(16,32),30,24 if cid=='vn_waisenjunge' else 29)for x1,x2 in xs]
 emit(cid+'_extra',f'characters/{cid}_extra.png',extra_frames,16,32,4,1,'extra',{'action':dict(frames=[0,1,2,3],frameRate=5,repeat=0)},30,extra={'action':ch['action']})
 head=fit(tail.crop((0,ys[1][0],tail.width,ys[1][1])),(24,24));head_frames.append((cid,head))

if len(head_frames)==28:
 regions={cid:dict(x=(i%7)*24,y=(i//7)*24,width=24,height=24)for i,(cid,im)in enumerate(head_frames)}
 emit('BK_koepfe','portraits/BK_koepfe.png',[im for cid,im in head_frames],24,24,7,4,'heads',extra={'regions':regions})
for cid in ['cw_wetherby','bh_greavesend']:
 path=HERE/'sources'/f'{cid}_battle.png'
 if not path.exists():continue
 src=clean(Image.open(path));w,h=src.size;frames=[];counts=[4,6,3,4]*2
 for row in range(8):
  rowframes=[]
  for col in range(6):
   rowframes.append(fit(src.crop((round(col*w/6),round(row*h/8),round((col+1)*w/6),round((row+1)*h/8))),(64,64),62)if col<counts[row]else None)
  if row in [1,5]:rowframes[1]=rowframes[0].copy() # prescribed two-frame wind-up hold
  frames.extend(rowframes)
 anim={}
 for phase in range(2):
  for j,name in enumerate(['idle','attack','hurt','defeat']):
   row=phase*4+j;anim[f'phase{phase+1}_{name}']=dict(frames=list(range(row*6,row*6+counts[row])),frameRate=6 if name=='idle'else 10,repeat=-1 if name=='idle'else 0)
 emit('enemy_'+cid,f'battle/enemy_{cid}.png',frames,64,64,6,8,'battle',anim,62,counts,{'facing':'left','phases':2,'anticipationFrames':2})
manifest=dict(version=1,batch='vorrat2',status='exported; future chapter stock, no runtime integration',paletteMaxVisibleColors=31,palette=PALETTE,assets=ASSETS)
(OUT/'manifest-vorrat2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(ASSETS)} sheets from {len(head_frames)} character atlases.')
