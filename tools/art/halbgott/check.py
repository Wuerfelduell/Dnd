#!/usr/bin/env python3
"""Validate the exact CO deliverable independently of the generation receipts."""
from pathlib import Path
from PIL import Image
import json,hashlib
R=Path(__file__).resolve().parents[3];S=R/'public/sprites';m=json.loads((S/'manifest-halbgott.json').read_text())
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr'];expected={}
def expect(file,w,h,c,r,transparent=True):expected[file]=(w,h,c,r,transparent)
for who in ['A_player','p2a','p2b']:
 for rank in ['halbgott','engel']:expect(f'characters/{who}_drink_{rank}.png',16,32,12,1)
for name,w,h,n,alpha in [('HG_aufstieg_4',240,135,8,False),('HG_aufstieg_2',240,135,8,False),('HG_kreatur_wechsel',64,64,8,True),('HG_furcht',16,16,6,True),('HG_umfallen',16,32,4,True),('HG_aura_halbgott',24,36,4,True),('HG_aura_engel',24,36,4,True),('HG_zoegern',32,32,4,True)]:expect('fx/'+name+'.png',w,h,n,1,alpha)
for p in paths:
 expect(f'characters/hg_form_{p}.png',32,48,4,4)
 expect(f'battle/hg_battle_{p}.png',96,96,6,6)
 expect(f'ui/hg_zug_{p}.png',32,32,1,1)
 for seq in [4,2]:expect(f'ui/hg_seq{seq}_{p}.png',240,135,1,1,False)
expect('battle/hg_schwellenwaechter.png',128,96,6,6);expect('battle/hg_grenzwaechter.png',128,128,6,6)
expect('battle/hg_siegel.png',32,32,10,1)
for key in ['schwelle','grenze']:expect('battle/bg_hg_'+key+'.png',480,270,1,1,False)
for name in ['schwellenwaechter','grenzwaechter']:expect('characters/hg_'+name+'_karte.png',32,48,4,1)
expect('ui/HG_hud.png',16,16,10,1);expect('ui/HG_hud_32.png',32,32,10,1)
assert len(expected)==73
assert m['batch']=='halbgott' and len(m['palette'])<=32
assert set(expected)=={a['file'] for a in m['assets']},'missing/extra files'
assert len({a['id'] for a in m['assets']})==73,'duplicate IDs'
palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']};allcolors=set();framecount=0;report=[];errors=[]
def data(im):return list(im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata())
for a in m['assets']:
 try:
  file=a['file'];w,h,c,r,alpha=expected[file];im=Image.open(S/file)
  assert im.mode=='RGBA','mode'
  assert im.size==(w*c,h*r)==(a['width'],a['height']),'size'
  assert (a['frameWidth'],a['frameHeight'],a['columns'],a['rows'])==(w,h,c,r),'grid'
  assert a['transparent']==alpha
  px=data(im);alphas={v[3] for v in px};assert alphas.issubset({0,255}),'nonbinary alpha'
  assert alphas==({0,255} if alpha else {255}),'wrong transparency'
  colors={v[:3] for v in px if v[3]};assert colors<=palette,'foreign palette';assert len(colors)<=32;allcolors|=colors
  assert all(v==(0,0,0,0) for v in px if v[3]==0),'invisible matte'
  frames=[im.crop(((i%c)*w,(i//c)*h,(i%c+1)*w,(i//c+1)*h)) for i in range(c*r)]
  assert all(f.getbbox() for f in frames),'empty frame'
  for name,an in a.get('animations',{}).items():
   assert an['frameRate']>0 and an['repeat'] in [-1,0],name
   assert all(isinstance(i,int) and 0<=i<len(frames) for i in an['frames']),name
   if len(an['frames'])>1:assert len({frames[i].tobytes() for i in an['frames']})>1,'static '+name
  for reg in a.get('regions',{}).values():assert 0<=reg['x'] and 0<=reg['y'] and reg['x']+reg['width']<=im.width and reg['y']+reg['height']<=im.height,'region bounds'
  if 'drink_' in file:
   assert a['animations']['drink']=={'frames':list(range(12)),'frameRate':6,'repeat':0}
   for i,f in enumerate(frames):assert f.getbbox()[3]-1==(28 if '_engel' in file and i in [6,7,8] else 30),'drink baseline'
  if file.startswith('characters/hg_form_') or file.endswith('_karte.png'):
   assert all(f.getbbox()[3]-1==46 for f in frames),'map baseline'
  if r==6:
   assert frames[7].tobytes()==frames[8].tobytes(),'attack1 hold'
   assert frames[13].tobytes()==frames[14].tobytes(),'attack2 hold'
   assert set(['idle','attack1','attack2','special','hurt','defeated'])<=set(a['animations'])
  if 'waechter.png' in file:
   for i in range(3):assert a['animations'][f'idle_p{i+1}']['frames']==[i*2,i*2+1]
  if file=='fx/HG_kreatur_wechsel.png':assert a['animations']['revert']['frames']==list(range(7,-1,-1))
  framecount+=len(frames);report.append({'file':file,'size':list(im.size),'colors':len(colors),'frames':len(frames),'sha256':hashlib.sha256((S/file).read_bytes()).hexdigest(),'ok':True})
 except Exception as e:errors.append({'file':a['file'],'error':str(e)})
small=Image.open(S/'ui/HG_hud.png');big=Image.open(S/'ui/HG_hud_32.png');assert small.resize((320,32),Image.Resampling.NEAREST).tobytes()==big.tobytes(),'HUD2x'
result={'batch':'halbgott','ok':not errors,'assets':len(report),'frames':framecount,'sharedColors':len(allcolors),'errors':errors,'checks':['exact required inventory','dimensions and frame grid','shared existing palette <=32','binary alpha and opaque scenes','nonempty frames','animation indices and motion','attack anticipation duplicates','baseline 30/46 and angel lift','three boss idle phases','reverse transformation','HUD exact nearest-neighbor 2x'],'files':report}
(R/'docs/art/batch-halbgott-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
if errors:print(json.dumps(errors,ensure_ascii=False,indent=2));raise SystemExit(1)
assert framecount==780,framecount
print(f'OK: {len(report)} PNGs, {framecount} Frames, {len(allcolors)} gemeinsame Farben; Maße, Alpha, Raster, Baselines, Aushol-Holds, Phasen und HUD geprüft.')
