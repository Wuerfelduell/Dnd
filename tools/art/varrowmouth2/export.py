"""Export imagegen masters (external records JSON) with nearest-neighbor and shared palette.
Usage: python tools/art/varrowmouth2/export.py /path/to/records-all.json
"""
import json, sys, hashlib, math
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/sprites'
records=json.loads(Path(sys.argv[1]).read_text())
latest={r['file']:r for r in records}
palette=json.loads((OUT/'manifest-calderwick2.json').read_text())['palette']
rgb=[tuple(bytes.fromhex(c[1:])) for c in palette]
pal=Image.new('P',(1,1));pal.putpalette([v for c in rgb for v in c]+list(rgb[0])*(256-len(rgb)))
assets=[]
def quant(im,alpha):
 im=im.convert('RGBA'); a=im.getchannel('A').point(lambda v:255 if v>=128 else 0) if alpha else Image.new('L',im.size,255)
 q=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');q.putalpha(a)
 # Canonical invisible RGB avoids halos in downstream texture packers.
 q.paste((0,0,0,0),(0,0),ImageOps.invert(a))
 return q

def save(file,im,fw=None,fh=None,cols=1,rows=1,alpha=False,kind=None,**extra):
 im=quant(im,alpha);p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True);im.save(p,optimize=True)
 w,h=im.size
 a=dict(id=Path(file).stem+('_32' if '/32/' in file else ''),file=file,kind=kind or ('item' if file.startswith('items/') else 'battle-background' if file.startswith('battle/') else 'scene' if file.startswith('sequences/') else 'ui'),width=w,height=h,frameWidth=fw or w//cols,frameHeight=fh or h//rows,columns=cols,rows=rows,transparent=alpha,animations={},sha256=hashlib.sha256(p.read_bytes()).hexdigest(),**extra)
 assets.append(a);return im

def fit(im,w,h,pad=0):
 b=im.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox()
 if b:im=im.crop(b)
 im=ImageOps.contain(im,(w-2*pad,h-2*pad),Image.Resampling.NEAREST)
 canvas=Image.new('RGBA',(w,h));canvas.paste(im,((w-im.width)//2,(h-im.height)//2));return canvas

symbol_crops=[]
for file,r in latest.items():
 im=Image.open(r['source']).convert('RGBA');w,h=r['w'],r['h'];cols=r.get('cols',1);rows=r.get('rows',1)
 if file=='ui/vm_hud.png':
  result=Image.new('RGBA',(128,64))
  for box,xy,size in [((15,10,722,865),(0,0),(48,48)),((720,10,1774,435),(48,0),(80,24)),((712,468,1010,775),(48,32),(16,16)),((1010,462,1325,780),(64,32),(16,16))]:
   part=im.crop(box);result.paste(fit(part,*size),xy)
  im=result
 elif r.get('sourceCols'):
  sc,sr=r['sourceCols'],r['sourceRows'];result=Image.new('RGBA',(w,h))
  order=[0,2,1,3] if '10_pegelherrin' in file else range(4)
  for dest,i in enumerate(order):
   x,y=i%sc,i//sc;b=(round(x*im.width/sc),round(y*im.height/sr),round((x+1)*im.width/sc),round((y+1)*im.height/sr))
   result.paste(im.crop(b).resize((240,135),Image.Resampling.NEAREST),(dest*240,0))
  im=result
 elif file in ['ui/vm_pins.png','ui/vm_symbole.png','fx/vm_warnung.png','ui/vm_zeiger.png']:
  result=Image.new('RGBA',(w,h));fw=w//cols
  for i in range(cols):
   part=im.crop((round(i*im.width/cols),0,round((i+1)*im.width/cols),im.height))
   if file=='ui/vm_symbole.png':symbol_crops.append(part.copy())
   result.paste(fit(part,fw,h,1),(i*fw,0))
  im=result
  if file=='ui/vm_zeiger.png':
   # Use generated first needle; rotate the same master around a fixed pivot.
   src=Image.open(r['source']).convert('RGBA').crop((0,0,181,724));b=src.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox();src=src.crop(b).resize((3,8),Image.Resampling.NEAREST)
   needle=Image.new('RGBA',(17,17));needle.paste(src,(7,1));im=Image.new('RGBA',(192,16))
   for i in range(12):im.paste(needle.rotate(-i*30,Image.Resampling.NEAREST,center=(8,8)).crop((0,0,16,16)),(i*16,0))
 elif file.startswith('items/'):
  im=fit(im,w,h,2)
 elif file=='fx/vm_gezeiten.png':
  result=Image.new('RGBA',(w,h))
  for i in range(12):
   x,y=i%6,i//6
   frame=im.crop((round(x*im.width/6)+2,round(y*im.height/2)+2,round((x+1)*im.width/6)-2,round((y+1)*im.height/2)-2))
   result.paste(frame.resize((480,270),Image.Resampling.NEAREST),(x*480,y*270))
  im=result
 else:im=im.resize((w,h),Image.Resampling.NEAREST)
 save(file,im,cols=cols,rows=rows,alpha=r.get('alpha',False))
 if file.startswith('items/32/'):
  save(file.replace('items/32/','items/'),im.resize((16,16),Image.Resampling.NEAREST),alpha=True)

# Six remaining CU objects derive from the generated symbol master.
for name,index in [('zollsiegel',4),('registerseite',5),('lotsenmarke',9),('leuchtbank_linse',8),('namenlos_ring',10),('schlicksohlen',11)]:
 for size in (16,32):save(f"items/{'32/' if size==32 else ''}vmi_{name}.png",fit(symbol_crops[index],size,size,1 if size==16 else 2),alpha=True)
# Last six UI symbols also have large regions: Unverzeichnete uses the nameless ring,
# council the customs seal, lighthouse the lens, border the pilot credential.
regions={'pegeluhr':{'x':0,'y':0,'width':48,'height':48},'countdown':{'x':48,'y':0,'width':80,'height':24},'zollsiegel':{'x':48,'y':32,'width':16,'height':16},'register':{'x':64,'y':32,'width':16,'height':16}}
pins=dict(zip(['vm_zollhafen','vm_stegviertel','vm_schlickgassen','vm_oberstrasse','vm_wrackfeld','vm_leuchtbank','vm_registerkeller','vm_grenzzaun'],[{'x':x,'y':y} for x,y in [(172,131),(273,129),(247,202),(116,68),(395,216),(417,83),(65,163),(239,44)]]))
symbol_names=['ebbe','flut','wechsel','boot','zollsiegel','registerseite','unverzeichnete','pegelrat','leuchtfeuer','grenzzaun','namenlos_ring','schlicksohlen']
for a in assets:
 f=a['file'];n=a['columns']
 if f=='ui/vm_hud.png':a.update(regions=regions,emptyRegions=[{'x':0,'y':48,'width':128,'height':16},{'x':80,'y':24,'width':48,'height':24}],needle={'file':'ui/vm_zeiger.png','destination':{'x':16,'y':16,'width':16,'height':16},'pivot':[8,8],'angles':list(range(0,360,30))},countdownTextRect={'x':54,'y':7,'width':68,'height':10})
 if 'vm_stadtkarte' in f:a.update(kind='map',pins=pins,pinAreaSize=[16,16],gezeit='flut' if 'flut' in f else 'ebbe')
 if f=='ui/vm_pins.png':a['regions']={name:{'x':i*16,'y':0,'width':16,'height':16} for i,name in enumerate(list(pins)+['boot','zirkel_wrack'])}
 if f=='ui/vm_symbole.png':a['regions']={name:{'x':i*16,'y':0,'width':16,'height':16} for i,name in enumerate(symbol_names)}
 if f=='ui/vm_nebel.png':a.update(kind='overlay',alignsWith=['ui/vm_stadtkarte_ebbe.png','ui/vm_stadtkarte_flut.png'],reveal='Runtime clips fog by visited district; alpha binary.')
 if f.startswith('sequences/') and n==4:a['animations']={'play':{'frames':[0,1,2,3],'frameRate':3,'repeat':0}}
 if f=='fx/vm_gezeiten.png':a['animations']={'ebbe_flut':{'frames':list(range(6)),'frameRate':6,'repeat':0},'flut_ebbe':{'frames':list(range(6,12)),'frameRate':6,'repeat':0}}
 if f=='fx/vm_warnung.png':a['animations']={'warnung':{'frames':list(range(8)),'frameRate':8,'repeat':-1}}
 if f=='ui/vm_zeiger.png':a['animations']={'gezeitenzyklus':{'frames':list(range(12)),'frameRate':1/60,'repeat':-1}};a['note']='12 steps across complete 12-minute cycle; select frame from game timer, not wall clock.'
 if 'abspann' in f:a['scroll']={'viewport':[480,270],'fromY':0,'toY':270,'speedPixelsPerSecond':4}
manifest=dict(version=1,batch='varrowmouth2',codex='CW',city='varrowmouth',status='exported; game integration separate',paletteMaxVisibleColors=32,palette=palette,assets=sorted(assets,key=lambda a:a['file']),itemIdStatus='CU items.json not present at base; IDs derived from CU brief, reconcile on integration.',symbolItemAliases={'unverzeichnete':'vmi_namenlos_ring','pegelrat':'vmi_zollsiegel','leuchtfeuer':'vmi_leuchtbank_linse','grenzzaun':'vmi_lotsenmarke','namenlos_ring':'vmi_namenlos_ring','schlicksohlen':'vmi_schlicksohlen'})
(OUT/'manifest-varrowmouth2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
generation=dict(batch='varrowmouth2',tool='image_gen.imagegen',postprocess='Nearest-neighbor export; shared palette without dithering; alpha threshold 128; atlas crops and packing; fixed-pivot needle rotations.',attempts=[{k:v for k,v in r.items() if k not in ('source','refs')}|{'sourceFile':Path(r['source']).name,'selected':r is latest[r['file']]} for r in records],derivedItems=manifest['symbolItemAliases'])
(ROOT/'docs/art/batch-varrowmouth2-generation.json').write_text(json.dumps(generation,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(assets)} assets')
