#!/usr/bin/env python3
"""Normalize generated CO sources; sources.json is a local imagegen receipt list."""
import argparse,json,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[3];S=R/'public/sprites'
args=argparse.ArgumentParser();args.add_argument('sources',type=Path);opt=args.parse_args()
sources=json.loads(opt.sources.read_text());palette=json.loads((S/'manifest-fasserin.json').read_text())['palette']
pal=[tuple(bytes.fromhex(x.lstrip('#'))) for x in palette];p=Image.new('P',(1,1));p.putpalette([v for c in pal for v in c]+list(pal[0])*(256-len(pal)))
assets=[];receipts=[]
def pixels(im):return im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata()
def clean(im):
 im=im.convert('RGBA');px=list(pixels(im));matte=min(c[3] for c in px)>0
 im.putdata([(r,g,b,255 if a>=100 and not(matte and min(r,g,b)>222) else 0) for r,g,b,a in px]);return im

def quant(im,alpha):
 mask=im.getchannel('A').point(lambda x:255 if x>=128 else 0) if alpha else Image.new('L',im.size,255)
 out=im.convert('RGB').quantize(palette=p,dither=Image.Dither.NONE).convert('RGBA');out.putalpha(mask)
 out.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in pixels(out)]);return out

def save(file,im,**meta):
 im=quant(im,meta.get('transparent',True));f=S/file;f.parent.mkdir(parents=True,exist_ok=True);im.save(f,optimize=True)
 assets.append(dict(id=Path(file).stem,file=file,width=im.width,height=im.height,**meta));return im

def anim(n,fps=6,repeat=-1):return dict(frames=list(range(n)),frameRate=fps,repeat=repeat)
def frame(im,i,w,h,c):return im.crop(((i%c)*w,(i//c)*h,(i%c+1)*w,(i//c+1)*h))
for s in sources:
 if not s.get('source'):raise ValueError('Missing source '+s['id'])
 src=Image.open(s['source']).convert('RGBA');kind=s['kind'];w,h=s['w'],s['h'];cols,rows=s['cols'],s['rows'];n=cols*rows
 cells=[]
 for y in range(rows):
  for x in range(cols):
   box=(round(x*src.width/cols),round(y*src.height/rows),round((x+1)*src.width/cols),round((y+1)*src.height/rows))
   cell=src.crop(box)
   # Seq-2 source has a white contact-sheet gutter, excluded from every frame.
   if s['id']=='HG_aufstieg_2':
    inset=round(min(cell.size)*0.02);cell=cell.crop((inset,inset,cell.width-inset,cell.height-inset))
   if s['alpha']:cell=clean(cell)
   if s['id']=='HG_aura_engel':
    cell.putdata([(r,g,b,0 if min(r,g,b)>225 else a) for r,g,b,a in pixels(cell)])
   cells.append(cell)
 outcols=cols if kind in ['walk','battle','boss'] else n;outrows=rows if kind in ['walk','battle','boss'] else 1
 out=Image.new('RGBA',(outcols*w,outrows*h));meta=dict(kind=kind,transparent=s['alpha'],frameWidth=w,frameHeight=h,columns=outcols,rows=outrows)
 if kind in ['scene','background','ascension','fx']:
  for i,c in enumerate(cells):out.paste(c.resize((w,h),Image.Resampling.NEAREST),((i%outcols)*w,(i//outcols)*h))
 else:
  boxes=[c.getbbox() for c in cells];maxw=max(b[2]-b[0] for b in boxes if b);maxh=max(b[3]-b[1] for b in boxes if b)
  baseline=h-2 if kind in ['walk','drink','idle'] else h-3
  scale=min((w-4)/maxw,(baseline-1)/maxh)
  for i,(c,b) in enumerate(zip(cells,boxes)):
   if not b:continue
   if kind in ['icons','hud','fx']:ratio=min((w-2)/(b[2]-b[0]),(h-2)/(b[3]-b[1]))
   else:ratio=scale
   c=c.crop(b)
   sx,sy=((w-2)/maxw,(baseline-1)/maxh) if kind=='drink' else (ratio,ratio)
   c=c.resize((max(1,round(c.width*sx)),max(1,round(c.height*sy))),Image.Resampling.NEAREST)
   # Nearest-neighbor sampling can drop an extreme alpha pixel; anchor actual feet.
   if c.getbbox():c=c.crop(c.getbbox())
   top=baseline-c.height+1 if kind in ['walk','drink','idle','battle','boss'] else (h-c.height)//2
   if kind=='drink' and '_engel' in s['id'] and i in [6,7,8]:top-=2
   out.paste(c,((i%outcols)*w+(w-c.width)//2,(i//outcols)*h+max(0,top)))
 if kind=='walk':
  meta['baseline']=h-2;meta['animations']={d:{'frames':list(range(y*4,y*4+4)),'frameRate':6,'repeat':-1} for y,d in enumerate(['down','left','right','up'])}
 elif kind=='drink':meta.update(baseline=30,animations={'drink':anim(12,6,0)})
 elif kind in ['battle','boss']:
  for row in [1,2]:out.paste(frame(out,row*6+1,w,h,6),(2*w,row*h))
  meta['animations']={name:{'frames':list(range(y*6,y*6+6)),'frameRate':6 if name=='idle' else 8,'repeat':-1 if name=='idle' else 0} for y,name in enumerate(['idle','attack1','attack2','special','hurt','defeated'])}
  meta['anticipationHoldFrames']={'attack1':[7,8],'attack2':[13,14]}
  if kind=='boss':
   meta['animations']['idle']['frames']=[0,1]
   meta['animations'].update({f'idle_p{i+1}':{'frames':[i*2,i*2+1],'frameRate':4,'repeat':-1} for i in range(3)})
 elif kind=='idle':meta.update(baseline=46,animations={'idle':anim(4,4)})
 elif kind=='ascension':meta['animations']={'ascend':anim(8,6,0)}
 elif kind=='fx':
  if s['id']=='HG_furcht':meta['regions']={name:{'x':i*w,'y':0,'width':w,'height':h} for i,name in enumerate(['schreck','schweiss','zittern','augen_zu','nebel_frage','ohnmacht'])}
  elif s['id']=='HG_kreatur_wechsel':meta['animations']={'transform':anim(n,8,0),'revert':dict(frames=list(range(n-1,-1,-1)),frameRate=8,repeat=0)}
  else:meta['animations']={'loop':anim(n,6,0 if s['id']=='HG_umfallen' else -1)}
 elif kind in ['icons','hud']:
  names=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr'] if kind=='icons' else ['halbgott','engel','form_aus','form_an','verdauung_gesperrt','furcht','ritual_offen','ritual_bestanden','rueckverwandlung','koop_form']
  meta['regions']={name:{'x':i*w,'y':0,'width':w,'height':h} for i,name in enumerate(names)}
 final=save(s['file'],out,**meta)
 receipts.append(dict(id=s['id'],file=s['file'],prompt=s['prompt'],source_sha256=hashlib.sha256(Path(s['source']).read_bytes()).hexdigest(),sourceSize=list(src.size),sourceGrid=[cols,rows],cellInsetFraction=0.02 if s['id']=='HG_aufstieg_2' else 0,reference=s.get('ref') and Path(s['ref']).name))
 if kind=='battle':
  c=frame(final,0,w,h,6);b=c.getbbox();head=c.crop((b[0],b[1],b[2],b[1]+max(1,round((b[3]-b[1])*0.48))))
  head.thumbnail((30,30),Image.Resampling.NEAREST);icon=Image.new('RGBA',(32,32));icon.paste(head,((32-head.width)//2,(32-head.height)//2))
  save('ui/hg_zug_'+s['id'].removeprefix('hg_battle_')+'.png',icon,transparent=True,frameWidth=32,frameHeight=32,columns=1,rows=1,derivedFrom=s['file'])
 if kind=='hud':
  meta2={**meta,'frameWidth':32,'frameHeight':32,'regions':{name:{k:v*2 for k,v in reg.items()} for name,reg in meta['regions'].items()}}
  save('ui/HG_hud_32.png',final.resize((320,32),Image.Resampling.NEAREST),**meta2,derivedFrom=s['file'])
manifest=dict(version=1,batch='halbgott',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=palette,assets=sorted(assets,key=lambda a:a['file']))
(S/'manifest-halbgott.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
generation=dict(batch='halbgott',mode='built-in image_gen',postprocessing=['Exact grid crops and nearest-neighbor sizing','Existing manifest-fasserin palette, 32 colours','Binary alpha; matte removal only for sources without transparent pixels; remove white interior fill from angel aura; crop 2% white gutters from ascent2','Shared scale per character sheet; drink axes fitted separately to 16x32; fixed feet baselines','Attack anticipation frame 2 repeated as frame 3','Turn portraits cropped from idle core; HUD32 nearest-neighbor 2x'],sources=sorted(receipts,key=lambda a:a['file']))
(R/'docs/art/batch-halbgott-generation.json').write_text(json.dumps(generation,ensure_ascii=False,indent=2)+'\n')
# Review board shows all final assets, a selection of frames per large atlas.
W=1440;cw=240;ch=200;H=((len(assets)+5)//6)*ch
preview=Image.new('RGB',(W,H),'#303b49');draw=ImageDraw.Draw(preview)
for i,a in enumerate(sorted(assets,key=lambda a:a['file'])):
 x=(i%6)*cw;y=(i//6)*ch;draw.text((x+4,y+3),a['id'],fill='#eee2c5')
 im=Image.open(S/a['file']);fw,fh=a['frameWidth'],a['frameHeight'];c=a['columns'];r=a['rows']
 if r==6:
  strip=Image.new('RGBA',(fw*3,fh*2))
  for j,idx in enumerate([0,9,15,21,27,35]):strip.paste(frame(im,idx,fw,fh,c),((j%3)*fw,(j//3)*fh))
  im=strip
 elif r==4:
  strip=Image.new('RGBA',(fw*4,fh))
  for j in range(4):strip.paste(frame(im,j*4,fw,fh,c),(j*fw,0))
  im=strip
 elif c>4:
  strip=Image.new('RGBA',(fw*4,fh*2))
  for j,idx in enumerate(list(range(min(4,c)))+list(range(max(4,c-4),c))):strip.paste(frame(im,idx,fw,fh,c),((j%4)*fw,(j//4)*fh))
  im=strip
 scale=min(232/im.width,176/im.height);im=im.resize((max(1,int(im.width*scale)),max(1,int(im.height*scale))),Image.Resampling.NEAREST)
 preview.paste(im,(x+4,y+20),im)
preview.quantize(colors=32,dither=Image.Dither.NONE).save(R/'docs/art/batch-halbgott-preview.png',optimize=True)
print(f'Exported {len(assets)} assets from {len(sources)} sources.')
