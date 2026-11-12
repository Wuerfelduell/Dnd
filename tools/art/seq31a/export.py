"""Export the recorded image-generation atlases. Requires Pillow and numpy.
Usage: python tools/art/seq31a/export.py /path/to/seq31-work
Raw atlases remain external; prompts and their SHA256 are recorded in generation.json.
"""
import json,sys,re,hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[3]
WORK=Path(sys.argv[1]); JOBS=json.loads((WORK/'jobs.json').read_text())
PALETTE=json.loads((ROOT/'public/sprites/manifest-halbgott.json').read_text())['palette']
RGB=[tuple(bytes.fromhex(x[1:])) for x in PALETTE]
pal=Image.new('P',(1,1));pal.putpalette([c for rgb in RGB for c in rgb]+list(RGB[0])*(256-len(RGB)))
def clean(im):
 a=np.array(im.convert('RGBA'));a[:,:,3]=np.where(a[:,:,3]>=180,255,0)
 # Remove sub-threshold generator fringe; preserve real dark outlines.
 return Image.fromarray(a)
def quant(im,opaque=False):
 a=np.array(im.convert('RGBA'));q=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE);z=np.array(q)
 if not opaque:z[a[:,:,3]<128]=32
 out=Image.fromarray(z,'P');out.putpalette(pal.getpalette())
 if not opaque:out.info['transparency']=32
 return out

def fit(cell,fw,fh,baseline=None,kind=''):
 box=cell.getbbox()
 assert box,'empty source cell'
 cell=cell.crop(box)
 margin=2 if fw<64 else 6
 maxw=fw-margin*2;maxh=(baseline if baseline else fh-margin)-margin
 scale=min(maxw/cell.width,maxh/cell.height)
 if kind=='drink':
  # Keep body height stable when the last frame includes the brief form echo.
  scale=maxh/cell.height
  size=(min(fw-2,max(1,round(cell.width*scale))),maxh)
 else:size=(max(1,round(cell.width*scale)),max(1,round(cell.height*scale)))
 cell=cell.resize(size,Image.Resampling.NEAREST)
 box=cell.getbbox();assert box,'resampling emptied cell';cell=cell.crop(box)
 out=Image.new('RGBA',(fw,fh));out.alpha_composite(cell,((fw-cell.width)//2,(baseline+1-cell.height) if baseline is not None else (fh-cell.height)//2))
 return out
assets=[];gen=[]
def anim(frames,fps=4,repeat=-1):return dict(frames=frames,frameRate=fps,repeat=repeat)
for i,j in enumerate(JOBS):
 result=WORK/f'result-{i}.json'
 if not result.exists():continue
 hint=json.loads(result.read_text())['hint'];src=Path(re.search(r' as (/.+?\.png) by default',hint)[1])
 im=Image.open(src).convert('RGBA');k=j['kind'];fw=j['fw'];fh=j['fh'];cols=j['cols'];rows=j['rows'];cells=[]
 if k!='ascend':
  if i in [17,37]:
   # The Kessel and Uhr sources have an unwanted white matte, unlike the other sources.
   # Its pale glass stays below this neutral-white threshold.
   arr=np.array(im);rgb=arr[:,:,:3].astype(int)
   matte=(rgb.min(2)>210)|((rgb.min(2)>170)&(rgb.max(2)-rgb.min(2)<20))
   arr[matte,3]=0;im=Image.fromarray(arr)
  im=clean(im)
 for y in range(rows):
  for x in range(cols):
   c=im.crop((round(x*im.width/cols),round(y*im.height/rows),round((x+1)*im.width/cols),round((y+1)*im.height/rows)))
   if k=='ascend':c=c.convert('RGB').resize((fw,fh),Image.Resampling.NEAREST).convert('RGBA')
   else:c=fit(c,fw,fh,46 if k=='map' else 30 if k=='drink' else 89 if k=='battle' else None,k)
   if i in [17,37]:
    arr=np.array(c);mask=arr[:,:,3]>0
    interior=mask.copy()
    for axis in [0,1]:
     for shift in [-1,1]:interior &= np.roll(mask,shift,axis=axis)
    arr[mask & ~interior,:3]=RGB[0];c=Image.fromarray(arr)
   cells.append(c)
 a=dict(id=j['file'].replace('/','_')[:-4],file=j['file'],kind=k,transparent=k!='ascend',frameWidth=fw,frameHeight=fh)
 if k=='map':
  cols=4;rows=4;a['baseline']=46;a['directions']=['down','left','right','up'];a['emptyFrames']=[2,3,6,7,10,11,14,15]
  a['animations']={d:anim([r*4,r*4+1],3) for r,d in enumerate(a['directions'])}
  cells=[cells[r*2+c] if c<2 else Image.new('RGBA',(fw,fh)) for r in range(4) for c in range(4)]
 elif k=='battle':
  cols=6;rows=4
  # Identical human hold; hurt/defeated derive exactly from corresponding idle,
  # with compressed posture and preserved footpoint, never injury imagery.
  cells[9]=cells[8].copy()
  idle=cells[:6]
  for height in [90,84]:
   for c in idle:
    small=c.resize((96,height),Image.Resampling.NEAREST);out=Image.new('RGBA',(96,96));out.alpha_composite(small,(0,96-height));cells.append(out)
  a['animations']={n:anim(list(range(r*6,r*6+6)),4,-1 if r==0 else 0) for r,n in enumerate(['idle','special','hurt','defeated'])};a['humanHoldFrames']=[8,9]
 elif k=='ascend':cols=8;rows=1;a['animations']={'ascend':anim(list(range(8)),6,0)}
 elif k=='drink':a['baseline']=30;a['animations']={'drink':anim(list(range(8)),6,0)}
 elif k=='aura':a['animations']={'loop':anim(list(range(cols)),3)}
 else:a['regions']={'seq3':dict(x=0,y=0,width=32,height=32),'seq1':dict(x=32,y=0,width=32,height=32)}
 out=Image.new('RGBA',(cols*fw,rows*fh))
 for n,c in enumerate(cells):out.alpha_composite(c,((n%cols)*fw,(n//cols)*fh))
 # Seq1 aura uses only pale neutrals, guaranteeing absence of turquoise.
 if k=='aura' and 'seq1' in j['file']:
  arr=np.array(out);lum=arr[:,:,:3].mean(2);arr[:,:,:3]=np.where((lum>180)[:,:,None],np.array([168,180,192]),np.array([149,165,165]));out=Image.fromarray(arr)
 target=ROOT/'public/sprites'/j['file'];target.parent.mkdir(parents=True,exist_ok=True);quant(out,k=='ascend').save(target,optimize=True)
 a.update(width=out.width,height=out.height,columns=cols,rows=rows);assets.append(a)
 gen.append(dict(file=j['file'],prompt=j['prompt'],sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest(),sourceSize=list(im.size),sourceLayout=[j['cols'],j['rows']],references=[Path(p).name for p in j['refs']]))
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
m=dict(version=1,batch='seq31a',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=PALETTE,assets=assets,paths={p:dict(map=f'characters/hg_form_{p}_still.png',battle=f'battle/hg_form_{p}_still.png',aura3=f'fx/aura_seq3_{p}.png',aura1=f'fx/aura_seq1_{p}.png') for p in paths})
stages={}
for source in ['seq_4_bis_1.json','neue_pfade.json']:
 stages.update(json.loads((ROOT/'src/data/packs/sequenzen'/source).read_text()))
for p in paths:
 m['paths'][p]['stageNames']={s:stages[p]['seqs'][s]['name'] for s in ['3','1']}
(ROOT/'public/sprites/manifest-seq31a.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/art/batch-seq31a-generation.json').write_text(json.dumps(dict(tool='built-in image_gen',postprocess='nearest-neighbor per-cell export; CO fixed palette; binary alpha; transparent rest cells; human hold; compressed idle for hurt/defeated',assets=gen),ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(assets)}/49')
