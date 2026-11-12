#!/usr/bin/env python3
"""Export imagegen source sheets. Usage: python export.py /path/to/inputs.json.
Inputs contain records {key,path,prompt} and propnames. Raw originals are external;
SHA256 and full prompts are recorded in generation.json. No runtime dependencies.
"""
import json,sys,hashlib
from pathlib import Path
from PIL import Image,ImageChops
R=Path(__file__).resolve().parents[3]; S=R/'public/sprites'; D=R/'docs/art'
inputs=json.load(open(sys.argv[1])); rec={v['key']:v for v in inputs['records']}
palette=json.load(open(S/'manifest-wexmoor8.json'))['palette']
P=Image.new('P',(1,1)); P.putpalette([v for c in palette for v in bytes.fromhex(c[1:])]+list(bytes.fromhex(palette[0][1:]))*(256-32))
NN=Image.Resampling.NEAREST

def norm(im):
 a=im.getchannel('A').point(lambda v:255 if v>=128 else 0)
 q=im.convert('RGB').quantize(palette=P,dither=Image.Dither.NONE).convert('RGBA');q.putalpha(a)
 q.paste((0,0,0,0),(0,0),ImageChops.invert(a));return q

def source(k):return Image.open(rec[k]['path']).convert('RGBA')
def cell(im,n):return im.crop((n%16*16,n//16*16,n%16*16+16,n//16*16+16))
def put(im,t,n):im.paste(t,(n%16*16,n//16*16))
def opaque(im):
 bg=Image.new('RGBA',im.size,'#494b4d');bg.alpha_composite(im);return bg

def fit(im,size):
 a=im.getchannel('A').point(lambda v:255 if v>=128 else 0);im.putalpha(a)
 box=im.getbbox()
 if box:im=im.crop(box)
 w,h=size; scale=min((w-2)/im.width,(h-2)/im.height)
 im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN)
 out=Image.new('RGBA',size);out.paste(im,((w-im.width)//2,h-im.height-1));return clean(norm(out))

def clean(im):
 # Remove isolated alpha specks introduced at source-sheet crop boundaries.
 seen=set();parts=[]
 for y in range(im.height):
  for x in range(im.width):
   if (x,y) in seen or not im.getpixel((x,y))[3]:continue
   todo=[(x,y)];part=[];seen.add((x,y))
   while todo:
    p=todo.pop();part.append(p)
    for dx,dy in [(0,1),(0,-1),(1,0),(-1,0),(1,1),(-1,-1),(1,-1),(-1,1)]:
     q=(p[0]+dx,p[1]+dy)
     if 0<=q[0]<im.width and 0<=q[1]<im.height and q not in seen and im.getpixel(q)[3]:seen.add(q);todo.append(q)
   parts.append(part)
 if parts:
  limit=max(3,max(map(len,parts))*.02)
  for part in parts:
   if len(part)<limit:
    for p in part:im.putpixel(p,(0,0,0,0))
 return im

def calm(im):
 # Preserve at most two horizontal highlight runs from generated water pixels.
 # Two-color cleanup removes stochastic source detail after nearest sampling.
 base=(45,57,70,255);light=(74,96,107,255)
 out=Image.new('RGBA',im.size,base);runs=[]
 for y in range(2,14):
  start=None
  for x in range(2,15):
   p=im.getpixel((min(x,15),y));bright=sum(p[:3])>200
   if bright and start is None:start=x
   if (not bright or x==14) and start is not None:
    end=x if not bright else x+1
    if end-start>=2:runs.append((end-start,start,y))
    start=None
 used=[]
 for length,x,y in sorted(runs,reverse=True):
  if any(abs(y-v)<3 for v in used):continue
  for xx in range(x,min(x+length,x+4,14)):out.putpixel((xx,y),light)
  used.append(y)
  if len(used)==2:break
 return out

assets=[]
def save(im,path,kind,**extra):
 p=S/path;p.parent.mkdir(exist_ok=True,parents=True);im=norm(im);im.save(p,optimize=True)
 a=dict(id=p.stem,file=path,kind=kind,width=im.width,height=im.height,frameWidth=16,frameHeight=16,columns=im.width//16,rows=im.height//16,transparent=0 in im.getchannel('A').getdata(),animations={},sha256=hashlib.sha256(p.read_bytes()).hexdigest(),**extra)
 assets.append(a);return a

bounds={'hafen':[0,124,248,378,509],'stege':[0,124,248,375,502],'schlick':[6,131,256,380,504],'oberstrasse':[0,127,258,390,527],'wrack':[0,125,250,383,516],'leuchtbank':[0,124,249,376,502],'innen':[0,122,245,369,495]}
# Remove generator gutters cell-by-cell rather than scaling the entire sheet.
def tiles(k):
 im=source(k);t=k.replace('_flut','');ys=bounds[t];out=Image.new('RGBA',(256,256))
 for row in range(4):
  for col in range(16):
   crop=im.crop((round(col*im.width/16)+3,ys[row]+3,round((col+1)*im.width/16)-3,ys[row+1]-3))
   out.paste(norm(crop.resize((16,16),NN)),(col*16,row*16))
 return out

# Seam contract: all floor variants share exemplar edge pixels. Water masks use
# bilinear corner-Wang topology (NW=1 NE=2 SE=4 SW=8); cardinal and diagonal shores.
def edgefix(t,base):
 for x in range(16):
  t.putpixel((x,0),base.getpixel((x,0)));t.putpixel((x,15),base.getpixel((x,15)))
 for y in range(16):
  t.putpixel((0,y),base.getpixel((0,y)));t.putpixel((15,y),base.getpixel((15,y)))
 return t

themes={};tile_names=[f'floor_{i}' for i in range(8)]+[f'low_floor_{i}' for i in range(8)]+[f'water_corner_mask_{i}' for i in range(16)]+['waterline_wall','waterline_corner','stairs_down','stairs_up','bridge_horizontal','bridge_vertical','dock_n','dock_e','dock_s','dock_w','wall_plain','wall_window','wall_door','wall_corner','wall_windows','wall_arch']+['roof_0','roof_1','roof_2','roof_3','rail_0','rail_1','rail_2','quay_cap']+[f'theme_detail_{i}' for i in range(8)]
for theme in bounds:
 low=tiles(theme);high=tiles(theme+'_flut')
 # Retain generated architecture byte-identically outside the inundation cells.
 changed=list(range(8,16))+list(range(32,36))+list(range(38,42))
 for n in set(range(64))-set(changed):put(high,cell(low,n),n)
 # Correct ground material selection to theme. Reuse generated timber/sand/mud.
 if theme in ('stege','wrack'):
  plank=cell(low,37).crop((3,0,13,16)).resize((16,16),NN)
  for n in range(8):put(low,ImageChops.offset(plank,0,n*2),n)
 elif theme in ('schlick','leuchtbank'):
  for n in range(8):put(low,cell(low,8+n),n)
 base=opaque(cell(low,0));basecol=base.getpixel((0,0))
 # Common opposite edges prevent seams under repetition and between variants.
 for p in range(16):
  for xy in [(p,0),(p,15),(0,p),(15,p)]:base.putpixel(xy,basecol)
 for n in range(8):
  t=edgefix(opaque(cell(low,n)),base);put(low,t,n);put(high,t,n)
 mud=opaque(cell(low,8));water=calm(opaque(cell(high,8)))
 landcol=mud.getpixel((7,7));watercol=water.getpixel((7,7))
 for tex,col in [(mud,landcol),(water,watercol)]:
  for p in range(16):
   for xy in [(p,0),(p,15),(0,p),(15,p)]:tex.putpixel(xy,col)
 for n in range(8,16):
  put(low,edgefix(opaque(cell(low,n)),mud),n);put(high,edgefix(calm(opaque(cell(high,n))),water),n)
 for mask in range(16):
  shore=Image.new('RGBA',(16,16));v=[bool(mask & b) for b in [1,2,4,8]]
  for y in range(16):
   for x in range(16):
    u=x/15;w=y/15;f=v[0]*(1-u)*(1-w)+v[1]*u*(1-w)+v[2]*u*w+v[3]*(1-u)*w
    shore.putpixel((x,y),(water if f>=.5 else mud).getpixel((x,y)))
  put(low,shore,16+mask);put(high,shore,16+mask)
 # All terrain/architecture cells opaque; unused rows stay alpha zero.
 for im in (low,high):
  for n in range(64):put(im,opaque(cell(im,n)),n)
 for tide,im in [('ebbe',low),('flut',high)]:save(im,f'tilesets/vm_{theme}_{tide}.png','tiles',tileNames=tile_names,occupiedFrames=list(range(64)),emptyFrames=list(range(64,256)))
 themes['vm_'+theme]={'ebbe':f'vm_{theme}_ebbe','flut':f'vm_{theme}_flut','cellBindings':{'floor':list(range(8)),'lowFloor':list(range(8,16)),'water':list(range(16,32)),'wallWaterline':[32,33],'stairs':[34,35],'bridge':[36,37],'dockEdges':[38,39,40,41],'wall':list(range(42,48)),'roof':list(range(48,52)),'railing':[52,53,54],'details':list(range(55,64))},'tideChangedFrames':changed,'autotile':{'type':'corner-wang-16','baseFrame':16,'bits':{'NW':1,'NE':2,'SE':4,'SW':8},'bitMeaning':'water','selection':'Sum bits for water corner vertices. Shared vertices must agree across neighbouring cells. Mask 5/10 uses connected water saddle.'}}

anim=Image.new('RGBA',(256,64));raw=source('wasser_anim')
for row,count in enumerate([4,4,6,6]):
 for i in range(count):
  t=norm(raw.crop((i*256+2,row*256+2,(i+1)*256-2,(row+1)*256-2)).resize((16,16),NN));anim.paste(opaque(t),(i*16,row*16))
anims={name:{'asset':'vm_wasser_anim','frames':list(range(row*16,row*16+count)),'frameRate':rate,'repeat':repeat} for row,(name,count,rate,repeat) in enumerate([('flutwasser',4,4,-1),('ebbe_priel',4,5,-1),('wasserlinie_steigend',6,3,0),('wasserlinie_fallend',6,3,0)])}
a=save(anim,'tilesets/vm_wasser_anim.png','tileAnimations',anims=anims);a['animations']=anims

props=Image.new('RGBA',(512,256));raw=source('props');regions={};names=inputs['propnames']
ys=[0,173,365,535,703,839,971]
xs=[list(range(0,1620,162))+[1619] for _ in range(6)]
xs[1]=[0,162,320,500,674,817,974,1120,1300,1450,1619]
sizes={n:(32,32) for n in names}
for n in ['boot_flut','boot_ebbe']:sizes[n]=(48,32)
for n in ['pegeluhr_ebbe','pegeluhr_flut','pegeluhr_wechsel']:sizes[n]=(32,64)
sizes['leuchtbank_glocke']=(32,48)
for n in ['pfahlleiter_lang','laterne_pfahl']:sizes[n]=(16,48)
for n in ['zollschranke','fischstand','lotsenkoje','kielraum_tisch']:sizes[n]=(48,32)
sizes['moewenschwarm']=(32,16)
# Tall-first shelf packing, all origins and rectangles on the 16px grid.
x=y=rowh=0
for n in sorted(names,key=lambda n:-sizes[n][1]):
 w,h=sizes[n]
 if x+w>512:x=0;y+=rowh;rowh=0
 i=names.index(n);row,col=divmod(i,10)
 crop=raw.crop((xs[row][col],ys[row],xs[row][col+1],ys[row+1]))
 if n in ('moewenschwarm','zollgeist_stempel'):
  fix=source('propfix');half=fix.width//2;off=0 if n=='moewenschwarm' else half;crop=fix.crop((off,0,off+half,fix.height))
 t=fit(crop,(w,h))
 if n=='zollgeist_stempel':
  # Palette map the two generated stamp inks to reserved supernatural turquoise.
  t.putdata([(111,224,208,255) if p[3] else (0,0,0,0) for p in t.getdata()])
 props.paste(t,(x,y));regions[n]={'x':x,'y':y,'width':w,'height':h};x+=w;rowh=max(rowh,h)
assert y+rowh<=256
pa=save(props,'props/vm_props.png','props',regions=regions)
pa['regionAnimations']={'leuchtfeuer_drehlicht':{'frames':[f'leuchtfeuer_{i}' for i in range(4)],'frameRate':4,'repeat':-1}}

fac=Image.new('RGBA',(512,128));raw=source('fassaden');fregions={};facades={}
xb=[0,411,702,986,1280,1655,1774];yn=[0,442,887];widths=[80,64,64,80,96,32];fnames=['zollhaus','reederhaus','pfahlbau','kielraum_wrack','ratsgebaeude','leuchtfeuer_turm']
for j,name in enumerate(fnames):
 for row,state in enumerate(['tag','nacht']):
  w=widths[j];h=96 if j==5 else 64;x=(416+32*row) if j==5 else sum(widths[:j]);y=0 if j==5 else row*64
  crop=raw.crop((xb[j],yn[row],xb[j+1],yn[row+1]));t=fit(crop,(w,h));fac.paste(t,(x,y));fregions[name+'_'+state]={'x':x,'y':y,'width':w,'height':h}
 facades['vm_'+name]={'asset':'vm_fassaden','dayRegion':name+'_tag','nightRegion':name+'_nacht','grid':[widths[j]//16,6 if j==5 else 4],'integration':'Region-based facade piece; register material ID with buildingFacades during separate integration.'}
fa=save(fac,'facades/vm_fassaden.png','facadeAtlas',regions=fregions)
manifest=dict(version=1,batch='varrowmouth1',codex='CV',city='varrowmouth',status='exported; integration separate',paletteMaxVisibleColors=32,palette=palette,themes=themes,anims=anims,regions={'vm_props':regions,'vm_fassaden':fregions},facades=facades,compatibilityNotes=['512x128 facade atlas: five buildings in day/night rows; 32x96 lighthouse day/night at x416/x448 side by side because two 96px rows cannot fit 128px height.','64 populated tiles per theme; remaining 192 cells transparent. Identical cell semantics in both tides.','16 corner-Wang water tiles provide cardinal and diagonal boundaries; use shared corner vertices, not NESW edge masks.','Facade pieces require region registration in a later integration; no runtime bindings changed.'],assets=assets)
(S/'manifest-varrowmouth1.json').write_text(json.dumps(manifest,indent=2)+'\n')
provenance={'batch':'varrowmouth1','tool':'built-in image_gen','sources':[dict(key=k,sourceFilename=Path(v['path']).name,sourceSha256=hashlib.sha256(Path(v['path']).read_bytes()).hexdigest(),prompt=v['prompt']) for k,v in rec.items()],'postprocessing':['Cellwise gutter removal and nearest neighbour resize','Wexmoor shared 32-color palette, binary alpha and zero transparent RGB','Material selection from generated tiles; canonical shared floor edges; 16 corner-Wang shore masks composed from generated land and water textures','Flut retains Ebbe architecture except listed inundated cells','Props packed on 16px grid; resting gull and seal impression corrected with image_gen'],'outputs':{a['file']:a['sha256'] for a in assets}}
(D/'batch-varrowmouth1-generation.json').write_text(json.dumps(provenance,indent=2,ensure_ascii=False)+'\n')
print(f'Exported {len(assets)} PNGs, {len(regions)} prop regions, {len(fregions)} facade regions')
