"""Validate all BU exports using Pillow; run from any directory."""
from pathlib import Path
import json, hashlib
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
manifest=json.loads((ROOT/'public/sprites/manifest-ausruestung2.json').read_text())
items=json.loads((ROOT/'src/data/items.json').read_text())
errors=[]
def require(ok,msg):
 if not ok:errors.append(msg)
assets=manifest['assets'];require(len(assets)==144,'expected 144 assets for this source snapshot')
files=set();ids=set();hashes={};globalcolors=set()
for a in assets:
 f=ROOT/'public/sprites'/a['file'];label=a['id']
 require(label not in ids,f'duplicate id {label}');ids.add(label)
 require(a['file'] not in files,f'duplicate path {a["file"]}');files.add(a['file'])
 if not f.exists():errors.append(f'missing {a["file"]}');continue
 raw=Image.open(f);require(raw.mode=='P',f'{label}: PNG must be palette-indexed');require(len(raw.getpalette() or [])<=96,f'{label}: palette table exceeds32 entries');im=raw.convert('RGBA');require(im.size==(a['width'],a['height']),f'{label}: dimensions')
 pix=list(im.getdata());alpha={p[3] for p in pix};colors={p[:3] for p in pix if p[3]}
 require(len(set(pix))<=32,f'{label}: >32 RGBA colors including transparency');require(alpha <= {0,255},f'{label}: nonbinary alpha');require(len(colors)<=32,f'{label}: >32 colors');globalcolors|=colors
 require(bool(colors),f'{label}: empty image')
 require((0,0,0) not in colors and (255,255,255) not in colors,f'{label}: pure black/white matte')
 require(all(p==(0,0,0,0) for p in pix if not p[3]),f'{label}: hidden RGB')
 if a['transparent']:require(0 in alpha and 255 in alpha,f'{label}: missing cutout alpha')
 else:require(alpha=={255},f'{label}: background must be opaque')
 fw,fh=a.get('frameWidth',a['width']),a.get('frameHeight',a['height']);cols,rows=a.get('columns',1),a.get('rows',1)
 require(fw*cols==im.width and fh*rows==im.height,f'{label}: frame grid')
 for anim,spec in a.get('animations',{}).items():
  require(all(isinstance(i,int) and 0<=i<cols*rows for i in spec['frames']),f'{label}/{anim}: frame index')
  require(spec['frameRate']>0,f'{label}/{anim}: frame rate')
 for region,rect in a.get('regions',{}).items():
  require(all(isinstance(rect[k],int) for k in ['x','y','width','height']),f'{label}/{region}: integer region')
  require(rect['x']>=0 and rect['y']>=0 and rect['x']+rect['width']<=im.width and rect['y']+rect['height']<=im.height,f'{label}/{region}: region outside sheet')
 if not a['file'].startswith('characters/gear/'):
  for i in range(cols*rows):
   frame=im.crop((i%cols*fw,i//cols*fh,(i%cols+1)*fw,(i//cols+1)*fh))
   require(bool(frame.getbbox()),f'{label}/{i}: empty cell')
 if label=='koop2_rahmen':
  for x in [0,48]:require(not im.crop((x+8,8,x+40,40)).getchannel('A').getbbox(),f'{label}: nine-slice center not transparent')
 if a.get('itemId'):require(a['itemId'] in items,f'{label}: unknown item')
 if a.get('slot') in ['hat','coat','weapon','amulet']:
  require(im.size==(64,128),f'{label}: overlay size')
  for i in range(16):
   frame=im.crop(((i%4)*16,(i//4)*32,(i%4+1)*16,(i//4+1)*32));n=sum(v>0 for v in frame.getchannel('A').getdata())
   require(n<16*32*.55,f'{label}/{i}: likely full character or opaque plate')
   box=frame.getbbox()
   if box and a['slot']=='hat':require(box[3]<=16,f'{label}/{i}: pixels below head/veil region')
   if box and a['slot']=='coat':require(box[1]>=9,f'{label}/{i}: pixels above coat region')
   if box and a['slot']=='weapon':require(box[1]>=14,f'{label}/{i}: pixels above hand region')
   if a['slot']!='weapon' or i<12:require(n>0,f'{label}/{i}: empty overlay')
   if a['slot']=='weapon' and i>=12:
    require(n<=8,f'{label}/{i}: back-facing weapon not occluded')
    base=Image.open(ROOT/'public/sprites'/a['reference']).convert('RGBA').crop(((i%4)*16,(i//4)*32,(i%4+1)*16,(i//4+1)*32))
    require(not any(pa[3] and pb[3] for pa,pb in zip(frame.getdata(),base.getdata())),f'{label}/{i}: rear weapon draws over body')
   if a['slot']=='amulet':require(n==2,f'{label}/{i}: glint must contain exactly two pixels')
 if label=='korruption_overlay':
  require(colors<={(26,28,44),(71,48,91),(112,77,136)},'corruption: only black-violet threads')
  for i in range(16):
   frame=im.crop(((i%4)*16,(i//4)*32,(i%4+1)*16,(i//4+1)*32))
   n=sum(a>0 for a in frame.getchannel('A').getdata())
   require(1<=n<=80,f'corruption/{i}: too dense or empty')
   require(frame.getbbox()[1]>=12,f'corruption/{i}: thread above garment')
 digest=hashlib.sha256(im.tobytes()).hexdigest()
 require(digest not in hashes,f'{label}: identical export to {hashes.get(digest)}');hashes[digest]=label
for figure in ['player','p2a','p2b']:
 for kind,slot in [('hut','hat'),('mantel','coat')]:
  expected={id for id,it in items.items() if it.get('kind')=='gear' and it.get('slot')==kind}
  actual={a.get('itemId') for a in assets if a.get('figure')==figure and a.get('slot')==slot}
  require(actual==expected,f'{figure}/{slot}: coverage')
 expected={id for id,it in items.items() if it.get('kind')=='weapon'}
 require({a.get('itemId') for a in assets if a.get('figure')==figure and a.get('slot')=='weapon'}==expected,f'{figure}/weapons: coverage')
require(len(globalcolors)<=32,'shared palette exceeds32')
require(len([a for a in assets if a.get('variant')=='day'])==12,'12 daytime backgrounds')
require(len([a for a in assets if a.get('variant')=='night'])==4,'4 night backgrounds')
if errors:raise SystemExit('\n'.join(errors))
print(f'OK: {len(assets)} PNGs; dimensions, grids, binary alpha, common {len(globalcolors)}-color palette.')
print('OK: 120 item overlays + corruption; 12 day + 4 night backgrounds; 7 UI/portrait assets.')
print('OK: item coverage, animation frames, rear weapon occlusion, two-pixel amulet glints, no duplicate exports.')
