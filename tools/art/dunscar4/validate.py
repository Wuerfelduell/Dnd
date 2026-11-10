"""Validate BA contract, bounds, palette, alpha, cells and geometry."""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]; OUT=ROOT/'public/sprites'
m=json.loads((OUT/'manifest-dunscar4.json').read_text()); report=[]
assert m['batch']=='dunscar4' and len(m['assets'])==9
palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']}; all_regions={}
for asset in m['assets']:
 p=OUT/asset['file']; im=Image.open(p).convert('RGBA'); a=np.array(im)
 assert im.size==(asset['width'],asset['height']),p
 assert set(np.unique(a[:,:,3])) <= {0,255},p
 colors={tuple(c[:3]) for c in a.reshape(-1,4) if c[3]}
 assert colors<=palette and len(colors)<=32,p
 assert a[:,:,3].min()==0 and a[:,:,3].max()==255,p
 occupancy=np.zeros((im.height,im.width),bool); frames_checked=0
 for r in asset.get('regions',[]):
  assert r['id'] not in all_regions,r['id'];all_regions[r['id']]=r
  assert r['x']%16==0 and r['y']%16==0,r['id']
  x,y,w,h=r['x'],r['y'],r['frameWidth'],r['frameHeight']; n=len(r['frames'])
  assert x+n*w<=im.width and y+h<=im.height,r['id']
  assert not occupancy[y:y+h,x:x+n*w].any(),r['id'];occupancy[y:y+h,x:x+n*w]=True
  for f in r['frames']:
   assert im.crop((x+f*w,y,x+(f+1)*w,y+h)).getbbox(),(r['id'],f)
   frames_checked+=1
  for ani in r['animations'].values(): assert all(0<=f<n for f in ani['frames'])
 if 'frameWidth' in asset:
  w,h=asset['frameWidth'],asset['frameHeight'];n=asset['columns']*asset['rows']
  assert im.width==w*asset['columns'] and im.height==h*asset['rows']
  for i in range(n):
   box=(i%asset['columns']*w,i//asset['columns']*h,(i%asset['columns']+1)*w,(i//asset['columns']+1)*h)
   cell=im.crop(box); assert cell.getbbox(),(p,i);frames_checked+=1
   if p.name.endswith('_walk.png'):
    bbox=cell.getbbox(); assert 0<bbox[0] and bbox[2]<w and bbox[3]<=31,(i,bbox)
  for ani in asset['animations'].values():assert all(0<=f<n for f in ani['frames'])
 report.append(dict(file=asset['file'],size=list(im.size),visibleColors=len(colors),framesChecked=frames_checked,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
required={'linie_vorschau':(16,16,4),'linie_aktiv':(16,16,4),'linie_echo':(16,16,6),'linie_fehl':(16,16,4),'ecke_vorschau':(16,16,2),'ecke_aktiv':(16,16,2),'ecke_fehl':(16,16,2),'ende_vorschau':(16,16,3),'ende_aktiv':(16,16,3),'nische':(16,16,2),'hoerkreis':(48,48,3),'alarm':(16,16,4),'bindung':(16,16,4),'bindung_p2':(16,16,4),'notladung':(16,16,2),'schleuse_zu':(32,48,3),'schleuse_auf':(32,48,3),'horchtrichter':(32,32,4),'richtungspfeil':(16,16,4),'sprecher_1':(16,16,1),'sprecher_2':(16,16,1),'kalkstaub':(240,135,4),'nachtnebel_1':(240,135,1),'nachtnebel_2':(240,135,1),'wind_grasbueschel':(16,16,4),'rahmen':(48,48,1),'muster_bekannt':(20,20,1),'muster_geprueft':(20,20,1),'muster_falsch':(20,20,1),'tab_icon':(16,16,1),'zeilenhintergrund':(160,24,1)}
animals=['ds_kraehe_sitzen','ds_kraehe_auffliegen','ds_kraehe_fliegen','ds_kalkziege_stehen','ds_kalkziege_laufen','ds_kalkziege_klettern','ds_staubteufel','ds_motte_kreisen','ds_eidechse_sitzen','ds_eidechse_huschen','ds_schwalbe_fliegen','ds_schwalbe_sitzen']
for i,(name,n) in enumerate(zip(animals,[2,4,4,2,4,2,6,4,2,4,4,1])): required[name]=(16,32 if i in (5,6) else 16,n)
for name in ['kreide','kalkpastillen','troedel','stein','tee','werkzeug','kartoffeln','zeitungen','kerzen','flickzeug']:required['stand_'+name]=(32,32,2)
assert set(required)==set(all_regions)
for name,expected in required.items():
 r=all_regions[name];assert (r['width'],r['height'],len(r['frames']))==expected,name
# Check geometry distinguishes the four signal states even without colour.
im=Image.open(OUT/'ui/ds_ruflinien.png').convert('RGBA'); shapes=[]
for name in ['linie_vorschau','linie_aktiv','linie_echo','linie_fehl']:
 r=all_regions[name];shapes.append(im.crop((r['x'],r['y'],r['x']+16,r['y']+16)).getchannel('A').tobytes())
assert len(set(shapes))==4
for name in ['kalkstaub','nachtnebel_1','nachtnebel_2']:
 im=Image.open(OUT/'fx/BA_dunscar_wetter.png').convert('RGBA');r=all_regions[name]
 for i in r['frames']:
  a=np.array(im.crop((i*240,r['y'],(i+1)*240,r['y']+135)))[:,:,3]
  assert (a>0).mean()<.15 and not a[0].any() and not a[-1].any() and not a[:,0].any() and not a[:,-1].any(),name
result=dict(batch='dunscar4',passed=True,pngCount=len(report),regionCount=len(required),framesChecked=sum(r['framesChecked'] for r in report),checks=['contract completeness','frame sizes/counts','region alignment/bounds/overlap','nonempty frames','binary alpha','shared <=32 colour palette','walk cell safety','signal shape distinction','sparse seam-free weather edges'],assets=report)
(ROOT/'docs/art/batch-dunscar4-validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='assets'},indent=2))
