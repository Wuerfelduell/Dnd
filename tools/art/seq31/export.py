#!/usr/bin/env python3
"""DC imagegen master export. Pillow only. Usage: export.py /directory/of/records."""
import json,sys,hashlib,math
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[3]; SPR=ROOT/'public/sprites'
records=[json.loads(p.read_text()) for p in sorted(Path(sys.argv[1]).glob('*.json'))]
palette=json.loads((SPR/'manifest-fasserin.json').read_text())['palette']
rgb=[tuple(bytes.fromhex(c[1:])) for c in palette]
pal=Image.new('P',(1,1));pal.putpalette([v for c in rgb for v in c]+list(rgb[0])*(256-len(rgb)))
assets=[]
def threshold(im):
 im=im.convert('RGBA');im.putalpha(im.getchannel('A').point(lambda a:255 if a>=128 else 0));return im

def fit(im,size,baseline=None,pad=1,scale=1):
 im=threshold(im);box=im.getchannel('A').getbbox()
 out=Image.new('RGBA',size)
 if box:
  im=im.crop(box);avail=(max(1,round((size[0]-2*pad)*scale)),max(1,round(((baseline or size[1]-pad)+1-pad)*scale)))
  im=ImageOps.contain(im,avail,Image.Resampling.NEAREST)
  y=(baseline+1-im.height) if baseline is not None else (size[1]-im.height)//2
  out.paste(im,((size[0]-im.width)//2,y))
 return out

def cells(im,sc,sr):
 return [im.crop((round(x*im.width/sc),round(y*im.height/sr),round((x+1)*im.width/sc),round((y+1)*im.height/sr))) for y in range(sr) for x in range(sc)]

def save(j,im,extra):
 im=threshold(im);alpha=im.getchannel('A') if j['alpha'] else Image.new('L',im.size,255)
 q=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE)
 if j['alpha']:q.paste(255,(0,0),ImageOps.invert(alpha));q.info['transparency']=255
 p=SPR/j['file'];p.parent.mkdir(parents=True,exist_ok=True);q.save(p,optimize=True)
 col,row=j.get('cols',1),j.get('rows',1)
 a=dict(id=j['file'].removesuffix('.png').replace('/','_'),file=j['file'],kind=j['kind'],width=j['w'],height=j['h'],frameWidth=j['w']//col,frameHeight=j['h']//row,columns=col,rows=row,transparent=j['alpha'],animations={},regions={},sha256=hashlib.sha256(p.read_bytes()).hexdigest(),**extra)
 if 'path' in j:a['path']=j['path']
 assets.append(a);return a

def anim(frames,fps=4,repeat=-1):return dict(frames=frames,frameRate=fps,repeat=repeat)
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
reg=json.loads((ROOT/'docs/story/seq31/register_seq1.json').read_text())
for j in records:
 im=Image.open(j['source']).convert('RGBA');kind=j['kind'];col,row=j.get('cols',1),j.get('rows',1);fw,fh=j['w']//col,j['h']//row;extra={}
 if 'sc' in j:
  src=cells(im,j['sc'],j['sr']);out=Image.new('RGBA',(j['w'],j['h']))
  if kind=='walk':
   for r in range(4):
    for c in range(2):out.paste(fit(src[r*2+c],(32,48),46),(c*32,r*48))
   extra={'baseline':46,'emptyFrames':[r*4+c for r in range(4) for c in [2,3]],'gridNote':'Two active cells per direction in a 4x4 canvas; two trailing cells per row intentionally empty.'}
  elif kind=='battle':
   idle=[fit(p,(96,96),92,3) for p in src[:6]]
   special=[fit(p,(96,96),92,3) for p in src[6:12]];special[3]=special[2].copy()
   for i in [0,1,4,5]:special[i]=idle[i].copy()
   for i,p in enumerate(idle):out.paste(p,(i*96,0))
   for i,p in enumerate(special):out.paste(p,(i*96,96))
   for r,s in [(2,.92),(3,.86)]:
    for i,p in enumerate(idle):out.paste(fit(p,(96,96),92,3,s),(i*96,r*96))
   extra={'baseline':92,'humanHoldFrames':[8,9],'derivedPostures':{'hurt':{'source':'idle','scale':.92},'defeated':{'source':'idle','scale':.86}},'nonviolent':True}
  elif kind=='props':
   for i,p in enumerate(src):out.paste(fit(p,(16,16),None,1),((i%16)*16,(i//16)*16))
   extra={'emptyFrames':list(range(40,128))}
  else:
   for i,p in enumerate(src):
    p=fit(p,(fw,fh),j.get('baseline'),1) if j['alpha'] else p.resize((fw,fh),Image.Resampling.NEAREST)
    if kind=='drink' and '_seq1.png' in j['file'] and i>=6:
     # Requested near-white-grey inner-light stage; palette remap preserves alpha.
     grey=p.convert('L');bright=Image.new('RGBA',p.size)
     bright.putdata([(*rgb[18 if v<85 else 21 if v<150 else 22],a) for v,a in zip(grey.getdata(),p.getchannel('A').getdata())])
     p=bright
    out.paste(p,((i%col)*fw,(i//col)*fh))
   if 'baseline' in j:extra['baseline']=j['baseline']
  im=out
 else:
  if kind=='tileset':
   # Remove the generated presentation margin before aligning the 16x16 tile grid.
   im=im.crop((32,32,1222,1222))
   extra['sourceCrop']=[32,32,1222,1222]
  im=im.resize((j['w'],j['h']),Image.Resampling.NEAREST)
 a=save(j,im,extra)
 if kind=='walk':a['animations']={n:anim([r*4,r*4+1],2) for r,n in enumerate(['down','left','right','up'])}
 if kind=='battle':a['animations']={n:anim(list(range(r*6,r*6+6)),3, -1 if n=='idle' else 0) for r,n in enumerate(['idle','special','hurt','defeated'])}
 if kind=='drink':a['animations']={'drink':anim(list(range(8)),6,0)}
 if kind=='cinematic':a['animations']={'ascend':anim(list(range(8)),4,0)}
 if kind=='aura':a['animations']={'aura':anim(list(range(col)),4 if j['seq']==3 else 2)}
 if kind=='hud':a['regions']={n:dict(x=i*32,y=0,width=32,height=32) for i,n in enumerate(['seq3','seq1'])}
 if kind=='tileset':
  a['tileSize']=16;a['regions']={n:dict(x=0,y=i*64,width=256,height=64) for i,n in enumerate(['wet_stone_floor','walls_waterline','register_shelves','water_steps_thresholds'])}
 if kind=='props':
  a['tileSize']=16
  for p,r in enumerate(reg):
   for k,name in enumerate(r['raum']['props']):
    i=k*10+p;a['regions'][r['pfad']+'_'+str(k)]=dict(x=i%16*16,y=i//16*16,width=16,height=16,label=name)
manifest=dict(version=1,batch='seq31',codex='DC',status='exported; runtime integration separate',paletteMaxVisibleColors=32,palette=palette,assets=sorted(assets,key=lambda a:a['file']),pathRegisters={r['pfad']:dict(map='vm_register_'+r['pfad'],background='battle/bg_vm_register_'+r['pfad']+'.png',seq1Name=r['seq_name'],props=[r['pfad']+'_'+str(i) for i in range(4)],epilogue='sequences/abspann_'+r['pfad']+'.png') for r in reg},sourceReferences=['docs/art/codex_DC_seq31_grafik.md','public/sprites/manifest-halbgott.json','docs/story/seq31/register_seq1.json','src/data/packs/sequenzen/seq_4_bis_1.json','src/data/packs/sequenzen/neue_pfade.json'])
(SPR/'manifest-seq31.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
gen=dict(batch='seq31',tool='image_gen.imagegen',postprocessing=['Nearest Neighbor to exact target cells','Shared fasserin 32-color palette, no dithering introduced','binary alpha threshold128, transparent index255','sprite fitting to stable baseline','map two active frames and two transparent cells per direction','battle special ordinary-human frames2 and3 exact hold, surrounding frames taken from idle','hurt and defeated derived from idle with smaller posture','props40 occupied 16px cells, remainder transparent'],assets=[{k:v for k,v in r.items() if k!='source'}|dict(sourceFile=Path(r['source']).name,sourceSha256=hashlib.sha256(Path(r['source']).read_bytes()).hexdigest()) for r in records])
gen['rejectedAttempts']=[]
for p in (Path(sys.argv[1])/'rejected').glob('*.json'):
 r=json.loads(p.read_text())
 gen['rejectedAttempts'].append({k:v for k,v in r.items() if k!='source'} | {'reason':r.get('rejectionReason','Aura incorrectly included a figure; replaced with pure transparent ground-ring overlay.')})
gen['postprocessing'].append('Tileset presentation margin cropped at source rectangle [32,32,1222,1222] before nearest-neighbor export')
(ROOT/'docs/art/batch-seq31-generation.json').write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n')
print('Exported',len(assets),'PNGs')
