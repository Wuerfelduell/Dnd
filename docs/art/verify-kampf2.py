#!/usr/bin/env python3
"""Validate Batch F exports; run from any directory. Requires Pillow, numpy."""
import json, hashlib
from pathlib import Path
from collections import Counter
import numpy as np
from PIL import Image

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SPEC=json.loads((HERE/'batch-kampf2-generation.json').read_text())
MANIFEST=json.loads((ROOT/'public/sprites/manifest-kampf2.json').read_text())
errors=[]; checks=0; reports=[]
def check(ok,message):
 global checks
 checks+=1
 if not ok:errors.append(message)
assets=MANIFEST['assets'];lookup={a['file']:a for a in assets}
palette={tuple(bytes.fromhex(c[1:])) for c in SPEC['palette']}
expected={j['path']:tuple(j['size']) for j in SPEC['jobs']}
for j in SPEC['jobs']:
 if j['kind']=='equipment':
  for item in j['items']:
   for size,prefix in [(16,'items/'),(32,'items/32/')]:expected[prefix+item['id']+'.png']=(size,size)
check(len(SPEC['jobs'])==55,'Expected 55 source jobs')
check(len(assets)==119 and len(lookup)==119,'Expected 119 unique manifest PNGs')
check(set(lookup)==set(expected),'Manifest file set differs from brief/export specification')
check(Counter(j['kind'] for j in SPEC['jobs'])==Counter(background=10,battle=3,walk=10,effect=4,cells=1,turn_icons=1,card=18,equipment=4,equipment_ui=1,boss_band=1,bust=2),'Wrong category counts')
images={}
for a in assets:
 path=ROOT/'public/sprites'/a['file']
 check(path.is_file(),f'Missing {a["file"]}')
 if not path.is_file():continue
 im=Image.open(path);rgba=im.convert('RGBA');arr=np.array(rgba);images[a['file']]=rgba
 visible=arr[arr[:,:,3]>0,:3];colors={tuple(c) for c in visible}
 check(im.mode=='P',f'{a["file"]}: PNG must be palette indexed')
 check(im.size==expected[a['file']]==(a['width'],a['height']),f'{a["file"]}: size mismatch')
 check(colors<=palette and len(colors)<=32,f'{a["file"]}: palette mismatch')
 alpha=set(np.unique(arr[:,:,3]).tolist())
 check(alpha<={0,255},f'{a["file"]}: nonbinary alpha')
 check((0 in alpha) if a['transparent'] else alpha=={255},f'{a["file"]}: wrong transparency')
 check(len(visible)>0,f'{a["file"]}: empty asset')
 for name,region in a.get('regions',{}).items():
  x,y,w,h=(region[k] for k in ['x','y','width','height'])
  check(0<=x<x+w<=im.width and 0<=y<y+h<=im.height,f'{a["file"]}/{name}: invalid region')
  check(rgba.crop((x,y,x+w,y+h)).getbbox() is not None,f'{a["file"]}/{name}: empty region')
 if 'atlas' in a:
  atlas=Image.open(ROOT/'public/sprites'/a['atlas']).convert('RGBA');r=lookup[a['atlas']]['regions'][a['atlasRegion']]
  check(atlas.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).tobytes()==rgba.tobytes(),f'{a["file"]}: atlas mismatch')
 fw,fh,cols,rows=(a[k] for k in ['frameWidth','frameHeight','columns','rows'])
 check(fw*cols==im.width and fh*rows==im.height,f'{a["file"]}: grid mismatch')
 for name,anim in a['animations'].items():
  check(all(isinstance(f,int) and 0<=f<cols*rows for f in anim['frames']),f'{a["file"]}/{name}: invalid frames')
  check(anim['frameRate']>0,f'{a["file"]}/{name}: invalid frame rate')
 if 'occupiedCounts' in a:
  for r,n in enumerate(a['occupiedCounts']):
   framebytes=[]
   for c in range(cols):
    f=rgba.crop((c*fw,r*fh,(c+1)*fw,(r+1)*fh));box=f.getbbox()
    check(bool(box)==(c<n),f'{a["file"]}: row {r}, column {c} occupancy')
    if box:
     check(box[3]==a['baseline'] and box[0]>=1 and box[2]<=fw-1 and box[1]>=1,f'{a["file"]}: row {r}, column {c} baseline/margin')
     framebytes.append(f.tobytes())
   check(len(set(framebytes))>1,f'{a["file"]}: row {r} has no animation change')
   if r in a.get('heldRows',[]):check(framebytes[0]==framebytes[1],f'{a["file"]}: row {r} wind-up is not held')
 reports.append({'file':a['file'],'size':list(im.size),'visibleColors':len(colors),'alpha':sorted(alpha),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})

ids='player sparring fog_hound ash_warden archive_rats choir_zealots rook_fight silas_fight mirror_shade schattenpuppe grubenkampf kanalkroete gasgeist uhrwerkwaechter maskenspieler schlachtergehilfe felix_fight miriam chorschatten'.split()
check(lookup['ui/F_05_zug_portraits.png']['frameNames']==ids,'Turn portraits: wrong ID order')
check({j['path'] for j in SPEC['jobs'] if j['kind']=='card'}=={'ui/bestiary/F_'+i+'.png' for i in ids[1:]},'Bestiary IDs incomplete')
for j in SPEC['jobs']:
 if j['kind']=='equipment':
  check(images[j['path']].crop((128,0,256,16)).getbbox() is None,j['id']+': unused atlas cells must be transparent')
 if j['kind']=='walk':check(list(lookup[j['path']]['animations'])==['down','left','right','up'],j['id']+': direction order')
band=images['ui/F_08_boss_band.png'];final=band.crop((2400,0,2880,270));offsets=lookup['ui/F_08_boss_band.png']['slideOffsets']
check(final.crop((0,0,480,90)).getbbox() is None and final.crop((0,180,480,270)).getbbox() is None,'Boss band outside middle 90 px')
for i,offset in enumerate(offsets):
 frame=Image.new('RGBA',(480,270));frame.paste(final,(offset,0))
 check(frame.tobytes()==band.crop((i*480,0,(i+1)*480,270)).tobytes(),f'Boss band frame {i}: inconsistent slide')
ui=lookup['ui/F_07_ausruestung.png']
check(len(ui['panelSlots'])==4 and all((r['width'],r['height'])==(20,20) for r in ui['panelSlots'].values()),'Equipment panel slots must be 20x20')
result={'batch':'kampf2','passed':not errors,'checks':checks,'pngCount':len(reports),'errors':errors,'files':reports}
(HERE/'validation-kampf2.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='files'},ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
