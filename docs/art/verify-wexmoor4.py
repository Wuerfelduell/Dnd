#!/usr/bin/env python3
"""Validate Batch V PNGs and manifest; requires Pillow and numpy."""
from pathlib import Path
from collections import Counter
import json,hashlib,sys
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];SPR=ROOT/'public/sprites';spec=json.loads((HERE/'batch-wexmoor4-generation.json').read_text());m=json.loads((SPR/'manifest-wexmoor4.json').read_text());checks=0;errors=[];reports=[]
def check(ok,msg):
 global checks
 checks+=1
 if not ok:errors.append(msg)
assets=m['assets'];byfile={a['file']:a for a in assets};images={};palette={tuple(bytes.fromhex(c[1:])) for c in spec['palette']}
expected={'characters/V_elsbeth_walk.png':(64,128),'portraits/V_elsbeth_emotions.png':(256,64),'ui/heads/elsbeth.png':(24,24),'tilesets/V_01_glocke_tiles.png':(128,48),'props/V_glocke_props.png':None,'battle/enemy_price.png':(288,288)}
check(set(byfile)==set(expected) and len(assets)==6,'exactly six requested PNGs');check(len(spec['jobs'])==5,'five generated originals');check(len(palette)==32,'32-color shared palette')
for a in assets:
 f=a['file'];p=SPR/f;check(p.exists(),f+' exists')
 if not p.exists():continue
 im=Image.open(p);rgba=im.convert('RGBA');images[f]=rgba;ar=np.array(rgba);alpha=ar[:,:,3];colors={tuple(c) for c in ar[:,:,:3][alpha>0]}
 check(im.mode=='P',f+' indexed');check(im.size==(a['width'],a['height']),f+' manifest size');check(len(colors)<=32 and colors<=palette,f+' limited shared palette');check(set(np.unique(alpha))<={0,255},f+' binary alpha');check(bool(np.any(alpha)),f+' nonempty')
 if expected[f]:check(im.size==expected[f],f+' requested dimensions')
 check(bool(np.any(alpha==0)) if a['transparent'] else bool(np.all(alpha==255)),f+' transparency contract')
 fw,fh,cols,rows=a['frameWidth'],a['frameHeight'],a['columns'],a['rows'];check((fw*cols,fh*rows)==im.size,f+' complete grid')
 for name,an in a['animations'].items():check(all(0<=i<cols*rows for i in an['frames']) and an['frameRate']>0,f+' animation '+name)
 if a['kind'] in ['walk','battle']:
  for r,n in enumerate(a['occupiedCounts']):
   frames=[]
   for c in range(cols):
    frame=rgba.crop((c*fw,r*fh,(c+1)*fw,(r+1)*fh));box=frame.getchannel('A').getbbox();check(bool(box)==(c<n),f+f' populated cell {r},{c}')
    if c<n and box:
     check(box[3]==a['baseline'] and box[0]>=1 and box[2]<=fw-1 and box[1]>=1,f+f' safe baseline {r},{c}');frames.append(frame.tobytes())
   check(len(set(frames))>1,f+f' row{r} variation')
   if r in a['heldRows']:check(frames[0]==frames[1],f+f' held windup row{r}')
 if a['kind']=='props':
  check(im.width==256 and im.height%16==0,f+' prop atlas grid');check(len(a['regions'])==15,f+' all fifteen prop states');used=np.zeros((im.height,im.width),bool)
  for name,r in a['regions'].items():
   x,y,w,h=r['x'],r['y'],r['width'],r['height'];check(all(v%16==0 for v in [x,y,w,h]),f+' aligned '+name);check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,f+' bounds '+name);check(not used[y:y+h,x:x+w].any(),f+' no overlap '+name);used[y:y+h,x:x+w]=True;check(bool(rgba.crop((x,y,x+w,y+h)).getchannel('A').getbbox()),f+' nonempty '+name)
  check(not np.any(alpha[~used]),f+' unused atlas empty')
  for name,an in a['regionAnimations'].items():
   px=[]
   for ref in an['regions']:
    r=a['regions'][ref];px.append(rgba.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).tobytes())
   check(len(set(px))>1,f+' animated '+name)
  check(set(a['regionAnimations'])=={'peat_stove','bucket'},f+' stove and bucket animations');check(a['states']['guest_book']==['guest_book_0','guest_book_1'],f+' guest book closed/open')
 if a['kind']=='tiles':
  check(len(a['tileNames'])==24 and a['composites']=={'stairs_up':[[14,15],[22,23]]},f+' terrain and stairs mapping');check(rgba.crop((32,32,48,48)).tobytes()!=rgba.crop((48,32,64,48)).tobytes(),f+' porthole variation')
 reports.append({'file':f,'size':list(im.size),'visibleColors':len(colors),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
portrait=images['portraits/V_elsbeth_emotions.png'];check(byfile['portraits/V_elsbeth_emotions.png']['frameNames']==['dazed','worried','shocked','relieved'],'four requested emotions');check(len({portrait.crop((i*64,0,(i+1)*64,64)).tobytes() for i in range(4)})==4,'four distinct portrait frames');check(portrait.crop((10,3,54,47)).resize((24,24),Image.Resampling.NEAREST).tobytes()==images['ui/heads/elsbeth.png'].tobytes(),'head derived from dazed portrait')
check(byfile['battle/enemy_price.png']['occupiedCounts']==[4,6,6,4,2,4] and byfile['battle/enemy_price.png']['facing']=='left','Price requested six animations');check(list(byfile['characters/V_elsbeth_walk.png']['animations'])==['down','left','right','up'],'Elsbeth four directions')
for j in spec['jobs']:
 check(len(j['sourceSha256'])==64 and bool(j['referencePaths']) and bool(j['prompt']),j['id']+' provenance')
 if j['kind']=='props':
  a=byfile[j['path']]
  for p in j['items']:
   for i in range(p['frames']):
    n=p['name']+('_'+str(i) if p['frames']>1 else '');r=a['regions'][n];check((r['width'],r['height'])==(p['width'],p['height']),n+' requested region size')
check(len(spec.get('repairs',[]))==1 and spec['repairs'][0]['indices']==[14,15,22,23] and len(spec['repairs'][0]['sourceSha256'])==64,'single staircase source and provenance')
result={'batch':'wexmoor4','passed':not errors,'checks':checks,'pngCount':6,'errors':errors,'assets':reports};(HERE/'validation-wexmoor4.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='assets'},indent=2));sys.exit(bool(errors))
