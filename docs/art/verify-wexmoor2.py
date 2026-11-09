#!/usr/bin/env python3
"""Validate final Batch R assets; Pillow and numpy required."""
import json,hashlib,sys
from pathlib import Path
from collections import Counter
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];SPR=ROOT/'public/sprites';spec=json.loads((HERE/'batch-wexmoor2-generation.json').read_text());manifest=json.loads((SPR/'manifest-wexmoor2.json').read_text());errors=[];checks=0;report=[]
def check(ok,msg):
 global checks
 checks+=1
 if not ok:errors.append(msg)
assets=manifest['assets'];files={a['file'] for a in assets};expected=set()
for j in spec['jobs']:
 expected.add(j['path'])
 for k in ['headOutput','largeOutput']:
  if j.get(k):expected.add(j[k])
check(len(spec['jobs'])==63,'63 generation jobs');check(len(assets)==74 and len(files)==74,'74 distinct PNGs');check(files==expected,'manifest file inventory matches brief jobs')
check(Counter(j['kind'] for j in spec['jobs'])==Counter({'walk':11,'portraits':9,'item':3,'props':10,'tiles':4,'battle':2,'bust':2,'effect':6,'background':5,'still':11}),'complete category counts')
allowed={tuple(bytes.fromhex(c[1:])) for c in spec['palette']};byfile={a['file']:a for a in assets};images={}
for a in assets:
 path=SPR/a['file'];check(path.exists(),a['file']+' exists')
 if not path.exists():continue
 im=Image.open(path);rgba=im.convert('RGBA');images[a['file']]=rgba;arr=np.array(rgba);alpha=arr[:,:,3];visible=arr[:,:,:3][alpha>0];colors={tuple(c) for c in visible};label=a['file']
 check(im.mode=='P',label+' indexed');check(im.size==(a['width'],a['height']),label+' size');check(len(colors)<=32,label+' <=32 visible colors');check(colors<=allowed,label+' shared palette');check(set(np.unique(alpha))<={0,255},label+' binary alpha');check(bool(np.any(alpha)),label+' nonempty')
 check((np.any(alpha==0) if a['transparent'] else np.all(alpha==255)),label+' transparency contract')
 check(a['frameWidth']*a['columns']==im.width and a['frameHeight']*a['rows']==im.height,label+' grid dimensions')
 for name,an in a.get('animations',{}).items():
  check(an['frameRate']>0 and an['frames'] and all(0<=f<a['columns']*a['rows'] for f in an['frames']),label+' animation '+name)
 fw,fh=a['frameWidth'],a['frameHeight']
 if 'occupiedCounts' in a:
  for r,n in enumerate(a['occupiedCounts']):
   raw=[]
   for c in range(a['columns']):
    f=rgba.crop((c*fw,r*fh,(c+1)*fw,(r+1)*fh));b=f.getchannel('A').getbbox();check(bool(b)==(c<n),label+f' cell {r},{c} occupancy')
    if c<n:
     raw.append(f.tobytes())
     if a['kind'] in ['walk','battle'] and b:
      check(b[3]==a['baseline'],label+f' cell {r},{c} baseline');check(b[0]>=1 and b[1]>=1 and b[2]<=fw-1,label+f' cell {r},{c} safe margin')
   if a['kind'] in ['walk','battle']:check(len(set(raw))>1,label+f' row {r} animation variation')
   if r in a.get('heldRows',[]):check(raw[0]==raw[1],label+f' row {r} held windup')
 if a['kind']=='props':
  cover=np.zeros(alpha.shape,np.uint8)
  for name,r in a['regions'].items():
   x,y,w,h=[r[k] for k in ['x','y','width','height']];check(all(v%16==0 for v in [x,y,w,h]),label+' region '+name+' grid aligned');check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,label+' region '+name+' bounds');sub=alpha[y:y+h,x:x+w];check(bool(np.any(sub)),label+' region '+name+' nonempty');cover[y:y+h,x:x+w]+=1
  check(cover.max()==1,label+' regions do not overlap');check(not np.any(alpha[cover==0]),label+' unused atlas area blank')
  for name,an in a['regionAnimations'].items():
   pix=[]
   for ref in an['regions']:
    check(ref in a['regions'],label+' animation region '+ref);r=a['regions'][ref];pix.append(rgba.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).tobytes())
   check(len(set(pix))>1,label+' animated prop '+name+' variation')
 if a['kind']=='effect':
  frames=[rgba.crop((c*fw,0,(c+1)*fw,fh)) for c in range(a['columns'])];check(all(f.getchannel('A').getbbox() for f in frames),label+' populated effect frames');check(len({f.tobytes() for f in frames})>=3,label+' effect progression')
 if a['kind']=='portraits':
  frames=[rgba.crop((64*c,0,64*(c+1),64)) for c in range(4)];check(len({f.tobytes() for f in frames})==4,label+' four distinct expressions');check(a['frameNames']==['neutral','suspicious','shocked','smiling'],label+' expression order')
 if a['kind']=='background':check(a['groundStrip']=={'x':0,'y':200,'width':480,'height':70},label+' ground metadata')
 report.append({'file':label,'size':list(im.size),'visibleColors':len(colors),'alpha':list(map(int,np.unique(alpha))),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
for j in spec['jobs']:
 a=byfile.get(j['path']);check(a is not None,j['id']+' manifest entry')
 if not a:continue
 check(j['source'] and len(j['sourceSha256'])==64,j['id']+' source provenance')
 if j['kind']=='walk':check((a['width'],a['height'])==(64,128) and list(a['animations'])==['down','left','right','up'],j['id']+' walk contract')
 if j['kind']=='battle':check((a['width'],a['height'],a['columns'],a['rows'])==(576,672,6,7) and a['occupiedCounts']==[4,6,6,6,6,3,6],j['id']+' boss contract')
 if j['kind']=='props':
  check(len(a['regions'])==sum(p['frames'] for p in j['items']),j['id']+' all props/states present');check(len(j['sourceBoxes'])==len(a['regions']),j['id']+' source crop coverage')
  for p in j['items']:
   for f in range(p['frames']):
    name=p['name']+('_'+str(f) if p['frames']>1 else '');r=a['regions'][name];check((r['width'],r['height'])==(p['width'],p['height']),j['id']+' '+name+' requested size')
 if j.get('largeOutput'):
  small=images[j['largeOutput']].resize((16,16),Image.Resampling.NEAREST);check(small.tobytes()==images[j['path']].tobytes(),j['id']+' 16/32 same motif')
 if j.get('headOutput'):
  head=images[j['path']].crop((10,3,54,47)).resize((24,24),Image.Resampling.NEAREST);check(head.tobytes()==images[j['headOutput']].tobytes(),j['id']+' notebook head identity')
for name in ['battle/enemy_leuchtfeuer.png','fx/fx_leuchtstrahl.png','fx/fx_blendung.png','fx/fx_lichter_frei.png']:
 a=np.array(images[name]);check(np.any(np.all(a[:,:,:3]==[232,240,255],2)&(a[:,:,3]>0)),name+' pale white stolen light')
check(images['portraits/R_lichtmann_emotions.png'].tobytes()!=images['portraits/R_lichtmann_verblassend_emotions.png'].tobytes(),'Starling fading variant differs')
for file,indices in [('tilesets/R_wexmoor_tiles.png',[54,55]),('tilesets/R_vergessmoor_tiles.png',[38,39,40])]:
 for i in indices:
  alpha=np.array(images[file].crop((i%8*16,i//8*16,i%8*16+16,i//8*16+16)))[:,:,3]
  check(0<np.count_nonzero(alpha)<192,file+' sparse transparent overlay '+str(i))
water=np.array(images['fx/fx_moor_steigt.png'])[:,:,3]
check(np.count_nonzero(water[:,288:384])>96*48*.3,'marsh flood peak has substantial opaque water')
for r in spec['repairs']:check(len(r['sourceSha256'])==64 and bool(r['prompt']),r['id']+' correction provenance')
result={'batch':'wexmoor2','passed':not errors,'checks':checks,'pngCount':len(assets),'errors':errors,'assets':report}
(HERE/'validation-wexmoor2.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='assets'},indent=2));sys.exit(bool(errors))
