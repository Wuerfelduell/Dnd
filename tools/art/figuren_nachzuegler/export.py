#!/usr/bin/env python3
"""CS: resize generated cell artwork, align feet, quantize and assemble required PNGs.
Input images must be actual image-generator outputs. No procedural substitute art.
Usage: python tools/art/figuren_nachzuegler/export.py --raw-dir PATH --jobs PATH
"""
import argparse,hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites'
P=['#4e7484','#2a3440','#d8b89a','#8a8e96','#c9c2ad','#2a2a40','#746255','#e0c0a0','#334d47','#756956','#444450','#c4aa91','#6a5e55','#3d414a','#626c79','#68725d','#566065','#363640','#c8ac8c','#655847','#34333a','#665572','#252b38','#cfb18a','#8b8870','#303b49','#586c78','#715648','#496b64','#1a1c2c','#b3946e','#eee2c5']
RGB=[tuple(bytes.fromhex(x[1:])) for x in P]
def clean(im):
 a=np.array(im.convert('RGBA'));a[:,:,3]=np.where(a[:,:,3]>=128,255,0);a[a[:,:,3]==0]=0;return Image.fromarray(a)
def quant(im,anchors):
 # Keep each figure's own coat as the only chromatic cloth midtone.
 base=['#1a1c2c','#252b38','#303b49','#3d414a','#8a8e96','#c9c2ad','#715648','#655847','#b3946e','#eee2c5']
 palette=list(dict.fromkeys(list(anchors.values())+base)) if anchors else P
 palette=[x for x in palette if x in P]
 arr=np.array(im.convert('RGBA'))
 # Preserve Noll's explicitly requested green cloth instead of collapsing its muted midtone into slate.
 if anchors and anchors.get('coat')=='#334d47':
  v=arr[:,:,:3].astype(np.int32);cloth=(v[:,:,1]>v[:,:,0]+3)&(v[:,:,1]>v[:,:,2]+1)&(v.max(2)>48)&(v.max(2)<105)&(arr[:,:,3]>0)
  arr[cloth,:3]=[51,77,71]
 flat=arr[:,:,:3].reshape(-1,3).astype(np.int32);rgb=np.array([tuple(bytes.fromhex(x[1:])) for x in palette],dtype=np.int32)
 # nearest palette colour, no error diffusion or subpixel filtering
 ids=((flat[:,None,:]-rgb[None,:,:])**2).sum(2).argmin(1);arr[:,:,:3]=rgb[ids].reshape(arr.shape[0],arr.shape[1],3);arr[arr[:,:,3]==0]=0
 return Image.fromarray(arr)
def crop_cells(im,cols,rows):
 cells=[]
 for y in range(rows):
  for x in range(cols):
   cells.append(clean(im.crop((round(x*im.width/cols),round(y*im.height/rows),round((x+1)*im.width/cols),round((y+1)*im.height/rows)))))
 return cells
def normalize(cells,w,h,kind):
 bounds=[c.getbbox() for c in cells]
 if not all(bounds):raise ValueError('empty source cell')
 maxw=max(b[2]-b[0] for b in bounds);maxh=max(b[3]-b[1] for b in bounds)
 scale=min((w-2)/maxw,(h-3)/maxh);out=[]
 for c,b in zip(cells,bounds):
  part=c.crop(b);sz=(max(1,round(part.width*scale)),max(1,round(part.height*scale)))
  part=part.resize(sz,Image.Resampling.NEAREST);cell=Image.new('RGBA',(w,h))
  # one common scale, feet at y=30 (walk) or safe cell bottom (other sheets)
  bottom=31 if kind=='walk' else h-1
  cell.paste(part,((w-part.width)//2,bottom-part.height));out.append(cell)
 return out

def save_png(im,p):
 a=np.array(im.convert('RGBA'));rgbmap={c:i+1 for i,c in enumerate(RGB)};ix=np.zeros(a.shape[:2],dtype=np.uint8)
 for y in range(a.shape[0]):
  for x in range(a.shape[1]):
   if a[y,x,3]:ix[y,x]=rgbmap[tuple(a[y,x,:3])]
 target=Image.fromarray(ix,'P');target.putpalette([0,0,0]+[v for c in RGB for v in c]+[0]*(768-99));target.info['transparency']=0;target.save(p,optimize=True)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--raw-dir',type=Path,required=True);ap.add_argument('--jobs',type=Path);ap.add_argument('--partial',action='store_true');args=ap.parse_args();jobs=json.loads(args.jobs.read_text()) if args.jobs else json.loads((ROOT/'docs/art/batch-figuren_nachzuegler-generation.json').read_text())['export_jobs'];assets=[];records=[]
 if not args.jobs:
  provenance=json.loads((ROOT/'docs/art/batch-figuren_nachzuegler-generation.json').read_text())
  prompts={s['asset']:s['prompt'] for s in provenance['sources']}
  for j in jobs:j['prompt']=prompts[j['key']]
 for j in jobs:
  raw=args.raw_dir/(j['key']+'.png')
  if not raw.exists():
   if args.partial:continue
   raise FileNotFoundError(raw)
  im=Image.open(raw).convert('RGBA');cols,rows=j['grid'];w,h=j['target'];fw,fh=w//cols,h//rows
  cells=normalize(crop_cells(im,cols,rows),fw,fh,j['kind']);cells=[quant(c,j['palette']) for c in cells]
  if j['kind']=='battle':
   # Required two-frame anticipation hold, followed by four generated action frames.
   cells[7]=cells[6].copy();cells[13]=cells[12].copy()
  sheet=Image.new('RGBA',(w,h))
  for i,c in enumerate(cells):sheet.paste(c,((i%cols)*fw,(i//cols)*fh))
  dest=SPR/j['file'];dest.parent.mkdir(parents=True,exist_ok=True);save_png(sheet,dest)
  animations={};rate=7 if j.get('npc')=='bhn_e_bote' else 6
  if j['kind']=='walk':animations={name:{'frames':list(range(i*4,i*4+4)),'frameRate':rate,'repeat':-1} for i,name in enumerate(['down','left','right','up'])}
  if j['kind']=='emotions':animations={name:{'frames':[i],'frameRate':1,'repeat':0} for i,name in enumerate(['neutral','freundlich','misstrauisch','erschrocken'])}
  if j['kind']=='battle':animations={name:{'frames':list(range(i*6,i*6+6)),'frameRate':6 if i==0 else 8,'repeat':-1 if i==0 else 0} for i,name in enumerate(['idle','attack1','attack2','hurt','defeated'])}
  a={'id':j['key'],'file':j['file'],'kind':j['kind'],'width':w,'height':h,'frameWidth':fw,'frameHeight':fh,'columns':cols,'rows':rows,'transparent':True,'animations':animations}
  if j.get('npc'):a['npc']=j['npc']
  if j['kind']=='walk':a['baselineY']=30;a['coatAnchor']=j['palette']['coat']
  if j['kind']=='prop':a['regions']={'body':{'x':0,'y':0,'width':w,'height':h}}
  assets.append(a);records.append({'asset':j['key'],'tool':'built_in_image_gen','prompt':j['prompt'],'source_file':raw.name,'source_sha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'source_size':list(im.size),'output':j['file'],'output_sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'processing':'equal-grid crop; alpha threshold 128; common per-sheet scale; nearest-neighbor; feet baseline; nearest shared palette with Noll green-cloth anchor normalization; two-frame battle anticipation hold'})
  if j['kind']=='walk' and j['npc']!='cwo_marktstand':
   # Head derived from this exact front-facing generated character, not an unrelated portrait.
   front=crop_cells(im,cols,rows)[0];b=front.getbbox();front=front.crop(b);head=front.crop((0,0,front.width,max(1,round(front.height*.40))));head=normalize([head],24,24,'head')[0];head=quant(head,j['palette'])
   hf='portraits/heads/'+j['npc']+'.png';hp=SPR/hf;hp.parent.mkdir(parents=True,exist_ok=True);save_png(head,hp)
   assets.append({'id':j['npc']+'_head','npc':j['npc'],'file':hf,'kind':'head','width':24,'height':24,'transparent':True,'derivedFrom':j['key']})
 if args.partial:return
 assert len(assets)==50,len(assets)
 manifest={'version':1,'batch':'figuren_nachzuegler','status':'exported; runtime integration pending','paletteMaxVisibleColors':32,'palette':P,'assets':assets}
 (SPR/'manifest-figuren_nachzuegler.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'docs/art/batch-figuren_nachzuegler-generation.json').write_text(json.dumps({'batch':'figuren_nachzuegler','mode':'built_in_image_gen','sources':records,'export_jobs':[{k:v for k,v in j.items() if k!='prompt'} for j in jobs],'head_derivation':'20 head cutouts from the corresponding first walk frame; Mina has no requested head','replacement_policy':'only four explicitly requested borrowed walk sheets replaced','notes':['K2 legacy palette uses one shared navy placeholder; Senn retains navy rain cape over specified brown vest, Veit anthracite, Noll uses explicitly requested dark green.','All explicit coat anchors and the shared muted palette are retained.']},ensure_ascii=False,indent=2)+'\n')
 preview(assets)
def preview(assets):
 # Contact sheet is presentation only; nearest-neighbor throughout.
 W=1440;im=Image.new('RGB',(W,1740),'#ded8bf');d=ImageDraw.Draw(im)
 walks=[a for a in assets if a['kind']=='walk'];d.text((16,10),'CS - 21 Figuren / 50 PNG - Laufrichtungen: unten, links, rechts, oben',fill='#1a1c2c')
 for i,a in enumerate(walks):
  x=16+(i%7)*203;y=40+(i//7)*294
  d.text((x,y),a['npc'],fill='#1a1c2c');pic=Image.open(SPR/a['file']).convert('RGBA').resize((128,256),Image.Resampling.NEAREST);im.paste(pic,(x+25,y+20),pic)
  hp=SPR/('portraits/heads/'+a['npc']+'.png')
  if hp.exists():
   head=Image.open(hp).convert('RGBA').resize((48,48),Image.Resampling.NEAREST);im.paste(head,(x+150,y+25),head)
 y=935
 for i,a in enumerate(x for x in assets if x['kind']=='emotions'):
  x=16+(i%2)*710;yy=y+(i//2)*150;d.text((x,yy),a['npc'],fill='#1a1c2c');pic=Image.open(SPR/a['file']).convert('RGBA').resize((512,128),Image.Resampling.NEAREST);im.paste(pic,(x,yy+15),pic)
 for i,a in enumerate(x for x in assets if x['kind']=='battle'):
  x=16+i*470;d.text((x,1250),a['id'],fill='#1a1c2c');pic=Image.open(SPR/a['file']).convert('RGBA');im.paste(pic,(x,1270),pic)
 for i,a in enumerate(x for x in assets if x['kind']=='prop'):
  x=16+i*400;pic=Image.open(SPR/a['file']).convert('RGBA').resize((144,96),Image.Resampling.NEAREST);im.paste(pic,(x,1630),pic);d.text((x+150,1640),a['id'],fill='#1a1c2c')
 im.quantize(colors=64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).save(ROOT/'docs/art/batch-figuren_nachzuegler-preview.png',optimize=True)
if __name__=='__main__':main()
