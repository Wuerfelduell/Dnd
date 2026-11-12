#!/usr/bin/env python3
"""Nearest-neighbour export of ImageGen sheets. Input JSON: [{key,path,prompt}]."""
from PIL import Image,ImageChops
from pathlib import Path
import json,sys,hashlib
ROOT=Path(__file__).resolve().parents[3];S=ROOT/'public/sprites';D=ROOT/'docs/art'
records=json.load(open(sys.argv[1]));src={r['key']:r for r in records};NN=Image.Resampling.NEAREST
palette=json.load(open(S/'manifest-fasserin.json'))['palette'];pal=Image.new('P',(1,1));pal.putpalette([v for c in palette for v in bytes.fromhex(c[1:])]+list(bytes.fromhex(palette[0][1:]))*224)
def pixels(im):return list(im.get_flattened_data()) if hasattr(im,'get_flattened_data') else list(im.getdata())
def norm(im):
 a=im.getchannel('A').point(lambda v:255 if v>=220 else 0);q=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');q.putalpha(a);q.paste((0,0,0,0),(0,0),ImageChops.invert(a));return q

def chunks(key,cols,rows):
 im=Image.open(src[key]['path']).convert('RGBA');out=[]
 if key=='marker':
  # Remove generated glow: retain only saturated turquoise source glyphs.
  im.putdata([(r,g,b,a) if a>=220 and g-r>40 and g>105 and r<130 else (0,0,0,0) for r,g,b,a in pixels(im)])
 if key=='plaetze':
  # Alpha threshold removes semi-transparent floor haze, not the opaque props.
  im.putalpha(im.getchannel('A').point(lambda v:255 if v>=250 else 0))
 for y in range(rows):
  for x in range(cols):
   t=im.crop((round(x*im.width/cols),round(y*im.height/rows),round((x+1)*im.width/cols),round((y+1)*im.height/rows)))
   t=norm(t);box=t.getbbox();out.append(t.crop(box) if box else Image.new('RGBA',(1,1)))
 return out

def pack(parts,cols,rows,cell,active=None,maxsize=None,baseline=None,moving=False):
 active=set(range(len(parts))) if active is None else set(active)
 maxsize=maxsize or (cell-2,cell-2)
 scale=min(maxsize[0]/max(parts[n].width for n in active),maxsize[1]/max(parts[n].height for n in active))
 sheet=Image.new('RGBA',(cols*cell,rows*cell));bounds=[]
 for n,t in enumerate(parts):
  if n not in active:continue
  t=t.resize((max(1,round(t.width*scale)),max(1,round(t.height*scale))),NN)
  # Clean isolated fringe pixels in the sampled alpha, retain main silhouettes.
  t=norm(t)
  if t.getbbox():t=t.crop(t.getbbox())
  x=(cell-t.width)//2 if not moving else [1,4,8,8,12,17][n]
  y=(cell-1 if baseline is None else baseline)-t.height
  assert x+t.width<=cell and y>=0
  sheet.paste(t,(n%cols*cell+x,n//cols*cell+y));bounds.append(t.getbbox())
 return sheet
assets=[]
def save(im,path,cell,kind,animations={},**extra):
 im=norm(im);p=S/path;p.parent.mkdir(parents=True,exist_ok=True);im.save(p,optimize=True)
 a={'id':p.stem,'file':path,'kind':kind,'width':im.width,'height':im.height,'frameWidth':cell,'frameHeight':cell,'columns':im.width//cell,'rows':im.height//cell,'transparent':True,'animations':animations,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),**extra};assets.append(a);return a

def anim(frames,rate=6,repeat=-1):return {'frames':frames,'frameRate':rate,'repeat':repeat}
for animal in ['rabe','kater','hund','ratte']:
 key='tier_'+animal;rows=5 if animal=='rabe' else 4
 parts=chunks(animal+'_walk',4,rows);im=pack(parts,4,rows,16,baseline=15)
 animations={d:anim(list(range(i*4,i*4+4)),7) for i,d in enumerate(['down','left','right','up'])}
 if rows==5:animations['fly']=anim([16,17,18,19],9)
 save(im,f'characters/{key}.png',16,'character',animations,baselineExclusive=15)
 active=[0,1,4,5,6,7,8,9,10];parts=chunks(animal+'_poses',4,3)
 save(pack(parts,4,3,16,active=active,baseline=15),f'characters/{key}_posen.png',16,'poses',{'rest':anim([0,1],2),'gift':anim([4,5,6,7],6,0),'feed':anim([8,9,10],5,0)},emptyFrames=[2,3,11],baselineExclusive=15)
 parts=chunks(animal+'_portrait',3,1)
 save(pack(parts,3,1,32),f'portraits/tiere/{key}.png',32,'portraits',{},states={'neutral':0,'aufmerksam':1,'zufrieden':2})
 parts=chunks(animal+'_battle',6,1)
 save(pack(parts,6,1,48,maxsize=(30,34),baseline=44,moving=True),f'battle/{key}_eingriff.png',48,'battle',{'intervention':anim(list(range(6)),10,0)},effectFrame=3,anchor=[24,44])
parts=chunks('symbole_fix',11,1)
# Replace first four UI heads with the generated identity-matched portrait heads.
for i,a in enumerate(['rabe','kater','hund','ratte']):parts[i]=chunks(a+'_portrait',3,1)[0]
# Independent icon scale: tiny ready paw remains as legible as broad desk icon.
im=Image.new('RGBA',(176,16))
for n,t in enumerate(parts):im.paste(pack([t],1,1,16),(n*16,0))
save(im,'ui/tiere_symbole.png',16,'icons',{},states={name:i for i,name in enumerate(['tier_rabe','tier_kater','tier_hund','tier_ratte','fuettern','gabe_bereit','gabe_verbraucht','buero','stufe_1','stufe_2','stufe_3'])})
for k in ['marker','zufrieden']:
 parts=chunks(k,4,1);save(pack(parts,4,1,16),f'fx/tier_{k}.png',16,'effect',{'play':anim([0,1,2,3],7,0)})
parts=chunks('plaetze',4,2);im=Image.new('RGBA',(64,32))
for col in range(4):
 pair=pack([parts[col],parts[col+4]],1,2,16);im.paste(pair,(col*16,0))
save(im,'props/tiere_plaetze.png',16,'props',{},regions={animal+'_'+state:{'x':i*16,'y':j*16,'width':16,'height':16} for i,animal in enumerate(['rabe','kater','hund','ratte']) for j,state in enumerate(['leer','besetzt'])})
m={'version':1,'batch':'tiere','codex':'DF','status':'exported; integration separate','paletteMaxVisibleColors':32,'palette':palette,'paletteReference':'manifest-fasserin.json','notes':['Kartenfiguren ausdrücklich 16x16 (Ausnahme zum allgemeinen Figurenformat).','Zusatzposen separat in 64x48-Atlanten: Ruhe 0/1, Gabe 4–7, Füttern 8–10; Rest transparent.','Kampfeingriff einmalige Cut-in-Animation, kein targetable actor.','Effekt tier_zufrieden ist Staub/Dampf, kein Herz.'],'assets':assets}
(S/'manifest-tiere.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
p={'batch':'tiere','tool':'built-in image_gen','sources':[{'key':r['key'],'file':Path(r['path']).name,'sha256':hashlib.sha256(Path(r['path']).read_bytes()).hexdigest(),'prompt':r['prompt']} for r in records],'postprocessing':['Cellwise crop, shared scale within sheets and feet baseline alignment','Nearest neighbor, existing fasserin 32-color palette, binary alpha, zero transparent RGB','Marker saturated-glyph alpha selection removes generated glow; prop alpha threshold removes haze','UI identity portraits replace mismatching first generator heads; corrected badges have one/two/three holes','Battle frames move from left to right without cropping animals'],'outputs':{a['file']:a['sha256'] for a in assets}}
(D/'batch-tiere-generation.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
print('DF export:',len(assets),'PNGs')
