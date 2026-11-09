#!/usr/bin/env python3
"""Validate Batch L exports; run from any directory. Requires Pillow, numpy."""
import json, hashlib
from pathlib import Path
from collections import Counter
import numpy as np
from PIL import Image

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SPEC=json.loads((HERE/'batch-gegner3-generation.json').read_text())
MANIFEST=json.loads((ROOT/'public/sprites/manifest-gegner3.json').read_text())
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
check(len(SPEC['jobs'])==53,'Expected 53 source jobs')
check(len(assets)==77 and len(lookup)==77,'Expected 77 unique manifest PNGs')
check(set(lookup)==set(expected),'Manifest file set differs from brief/export specification')
check(Counter(j['kind'] for j in SPEC['jobs'])==Counter(background=2,battle=11,walk=11,effect=7,turn_icons=1,card=11,equipment=2,bust=1,portraits=1,wanted=5,markers=1),'Wrong category counts')
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

ids='laternendieb kanalschmuggler nachtkraemer falschgeldpraeger russgeist glockenhund papierkraehe wachsmann fadenspinne nebelaal schmugglerkoenigin'.split()
check(lookup['ui/L_zug_portraits.png']['frameNames']==ids,'Turn portrait ID order')
for i,id in enumerate(ids):
 p='battle/enemy_'+id+'.png';a=lookup[p];size=48 if i<4 else 64 if i<10 else 96
 check((a['frameWidth'],a['frameHeight'],a['columns'])==(size,size,6),id+': battle grid')
 check((a['width'],a['height'])==((576,672) if i==10 else (size*6,size*5)),id+': sheet size')
 check(a['heldRows']==[1,2],id+': wind-up row list')
 check(a['gameId']==id,id+': planned encounter ID')
check({j['path'] for j in SPEC['jobs'] if j['kind']=='card'}=={'ui/bestiary/L_'+i+'.png' for i in ids},'Bestiary ID set')
for j in SPEC['jobs']:
 a=lookup[j['path']];im=images[j['path']]
 if j['kind']=='equipment':
  n=len(j['items']);check(im.crop((n*16,0,n*32,16)).getbbox() is None,j['id']+': atlas padding')
 if j['kind']=='walk':check(list(a['animations'])==['down','left','right','up'],j['id']+': direction order')
 if j['kind']=='effect':
  fw=a['frameWidth'];frames=[im.crop((i*fw,0,(i+1)*fw,fw)) for i in range(a['columns'])]
  check(all(f.getbbox() for f in frames),j['id']+': empty effect frame')
  check(len({f.tobytes() for f in frames})>1,j['id']+': static effect')
 if j['kind']=='wanted':
  check(im.size==(128,80) and a['frameNames']==['wanted','caught'],j['id']+': poster layout')
  left,right=np.array(im.crop((0,0,64,80))),np.array(im.crop((64,0,128,80)))
  check(np.any(left!=right,axis=2).mean()>.05,j['id']+': caught poster must differ')
  check((right[:,:,:3].mean(2)<65).sum()>(left[:,:,:3].mean(2)<65).sum(),j['id']+': missing dark caught stripe')
 if j['kind']=='markers':
  check(im.size==(128,64),j['id']+': mixed atlas size')
  for r,name in enumerate(j['names']):
   regions=a['regionAnimations'][name]['regions'];frames=[]
   for key in regions:
    p=a['regions'][key];frames.append(im.crop((p['x'],p['y'],p['x']+p['width'],p['y']+p['height'])))
    check((p['width'],p['height'])==((32,16) if r==3 else (16,16)),key+': marker size')
   check(len({f.tobytes() for f in frames})>1,name+': static marker')
   if r<3:
    top=[f.getbbox()[1] for f in frames];check([y-top[0] for y in top]==[0,-1,0,1],name+': bob offsets')
    check(im.crop((64,r*16,128,r*16+16)).getbbox() is None,name+': marker padding')
result={'batch':'gegner3','passed':not errors,'checks':checks,'pngCount':len(reports),'errors':errors,'files':reports}
(HERE/'validation-gegner3.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='files'},ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))

