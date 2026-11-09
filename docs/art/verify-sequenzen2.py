"""Validate Batch N's deliverable and atlas/animation contracts. Pillow and numpy."""
from pathlib import Path
from PIL import Image
import json,hashlib
import numpy as np
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/sprites'
m=json.loads((OUT/'manifest-sequenzen2.json').read_text());assets=m['assets'];by={a['file']:a for a in assets}
errors=[];checks=0
def check(test,msg):
 global checks
 checks+=1
 if not test:errors.append(msg)
def rgba(path):return np.asarray(Image.open(OUT/path).convert('RGBA'))
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel']
expected={}
for p in paths:
 for seq in [6,5]:
  expected[f'items/trank_{p}_{seq}.png']=(16,16);expected[f'items/32/trank_{p}_{seq}.png']=(32,32);expected[f'items/formel_{p}_{seq}.png']=(16,16)
ingredients=['flammenkern','lichtperle','knotengarn','spindelknochen','spiegelwachs','schminkasche','glockenerz','atemglas','salamanderoel','goldschimmel','ambossstaub','schwertsplitter','dietrichsilber','schattenseide','nebelherz']
artifacts=['uhr_ertrunkener','richterhammer','augenbinde_odile','bleiamulett','rahmenloser_spiegel','zahnkette','hungriger_ring','knochenwuerfel','stille_glocke','kupferkrone','wachshand','schwarzes_herz']
for p in ingredients+artifacts:
 for folder,size in [('',16),('32/',32)]:expected[f'items/{folder}{p}.png']=(size,size)
sizes={'lichtbann':48,'weissglut':64,'fangnetz':48,'zerreissen':64,'spiegelbild':48,'maskenball':64,'totenchor':48,'stillgesang':64,'lebenselixier':32,'zersetzung':48,'unbeugsam':48,'hammerfall':64,'taschenspiel':48,'kehlschnitt':48}
for p,size in sizes.items():expected[f'fx/fx_{p}.png']=(size*(8 if size==64 else 6),size)
expected.update({'items/formeln_2.png':(112,32),'ui/skill_icons_2.png':(112,32),'items/N_zutaten_1.png':(256,48),'items/N_zutaten_2.png':(224,48),'items/N_artefakte_1.png':(192,48),'items/N_artefakte_2.png':(192,48),'ui/N_artefakt_ui.png':(128,64)})
for p in ['thale','varga']:
 expected[f'characters/N_{p}_walk.png']=(64,128);expected[f'portraits/N_{p}_emotions.png']=(256,64);expected[f'ui/heads/{p}.png']=(24,24)
for p in ['schwarzes_herz','nebelherz']:
 for folder,size in [('',16),('32/',32)]:expected[f'items/{folder}{p}_pulse.png']=(size*2,size)
check(set(expected)==set(by),'Manifest does not exactly cover required Batch N files')
check(len(by)==len(assets)==127,'Expected 127 distinct exported PNG files')
palette=None;visible=set();hashes={};frameRefs=0
for file,dim in expected.items():
 check((OUT/file).is_file(),'Missing '+file)
 if not (OUT/file).is_file():continue
 im=Image.open(OUT/file);a=by[file];arr=rgba(file);alpha=arr[:,:,3]
 check(im.size==dim,(file,'Wrong dimensions',im.size,dim));check(im.mode=='P',(file,'Not indexed'))
 if palette is None:palette=im.getpalette()
 check(im.getpalette()==palette,(file,'Palette differs'));check(set(np.unique(alpha))<={0,255},(file,'Nonbinary alpha'))
 if not a['transparent']:check((alpha==255).all(),(file,'Opaque asset contains transparency'))
 else:check((alpha==0).any(),(file,'Missing transparent background'))
 visible.update(map(tuple,arr[:,:,:3][alpha>0].tolist()));hashes[file]=hashlib.sha256((OUT/file).read_bytes()).hexdigest()
 fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows']
 check(fw*cols==im.width and fh*rows==im.height,(file,'Invalid frame grid'))
 for name,ani in a.get('animations',{}).items():
  check(ani['frameRate']>0,(file,name,'Invalid frame rate'));frames=[]
  for idx in ani['frames']:
   frameRefs+=1;check(isinstance(idx,int) and 0<=idx<cols*rows,(file,name,'Out-of-bounds frame'))
   y,x=divmod(idx,cols);part=arr[y*fh:(y+1)*fh,x*fw:(x+1)*fw];frames.append(part.tobytes());check((part[:,:,3]>0).any(),(file,name,idx,'Empty frame'))
   if file.startswith('characters/'):
    ys,xs=np.where(part[:,:,3]>0);check(ys.max()==30,(file,idx,'Wrong foot baseline'));check(xs.min()>=1 and xs.max()<=14,(file,idx,'Frame-edge bleed'))
  if len(frames)>1:check(len(set(frames))>1,(file,name,'Animation is static'))
 regions=a.get('regions',{});occupied=np.zeros((im.height,im.width),bool)
 for name,(x,y,w,h) in regions.items():
  check(x>=0 and y>=0 and w>0 and h>0 and x+w<=im.width and y+h<=im.height,(file,name,'Region bounds'))
  check(not occupied[y:y+h,x:x+w].any(),(file,name,'Overlapping regions'));occupied[y:y+h,x:x+w]=True
  if file.startswith('items/N_'):
   is32=name.endswith('_32');item=name[:-3] if is32 else name;single=rgba('items/'+('32/' if is32 else '')+item+'.png');check(np.array_equal(arr[y:y+h,x:x+w],single),(file,name,'Atlas/icon mismatch'))
 if regions:check(not (alpha[~occupied]>0).any(),(file,'Pixels outside named regions'))
 for name,ani in a.get('regionAnimations',{}).items():
  check(all(f in regions for f in ani['frames']),(file,name,'Unknown animated region'))
  samples=[]
  for f in ani['frames']:
   x,y,w,h=regions[f];samples.append(arr[y:y+h,x:x+w].tobytes())
  check(len(set(samples))>1,(file,name,'Static region animation'))
check(len(visible)<=32,('Too many shared visible colors',len(visible)))
formulas=rgba('items/formeln_2.png')
for r,seq in enumerate([6,5]):
 for c,p in enumerate(paths):check(np.array_equal(formulas[r*16:r*16+16,c*16:c*16+16],rgba(f'items/formel_{p}_{seq}.png')),(p,seq,'Formula atlas mismatch'))
ui=rgba('ui/N_artefakt_ui.png')
for x in [0,20,40]:check((ui[4:16,x+4:x+16,3]==0).all(),('Slot center must be transparent',x))
for p,size in sizes.items():
 a=by[f'fx/fx_{p}.png'];check(a['columns']==(8 if size==64 else 6) and a['rows']==1,(p,'Wrong effect frame count'))
 check(a['target']==('self' if p in ['spiegelbild','lebenselixier','unbeugsam'] else 'enemy'),(p,'Wrong effect target'))
for p in ['thale','varga']:
 a=by[f'ui/heads/{p}.png'];x,y,w,h=a['sourceRect'];src=Image.open(OUT/a['sourcePortrait']).convert('RGBA').crop((x,y,x+w,y+h)).resize((24,24),Image.Resampling.NEAREST)
 check(np.array_equal(np.asarray(src),rgba(a['file'])),(p,'Head differs from neutral portrait crop'))
report=dict(batch='sequenzen2',passed=not errors,files=len(expected),checks=checks,visibleColors=len(visible),animationFrameReferences=frameRefs,errors=errors,sha256=hashes)
(ROOT/'docs/art/validation-sequenzen2.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='sha256'},indent=2));sys_exit=bool(errors)
raise SystemExit(sys_exit)
