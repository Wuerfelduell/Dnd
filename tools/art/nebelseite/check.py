#!/usr/bin/env python3
"""Validate DH exports; requires Pillow. Run from any working directory."""
import hashlib,json,pathlib,sys
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[3]
SPR=ROOT/'public/sprites'
manifest=json.loads((SPR/'manifest-nebelseite.json').read_text())
palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
expected={'tilesets/ns_welt.png':(256,256),'tilesets/ns_anim.png':(256,32),'props/ns_props.png':(256,128),'characters/nsw_still.png':(128,192),'characters/nsw_namenlose_kutsche.png':(256,96),'characters/ns_spieler_overlay.png':(64,32),'battle/nsw_spiegel_overlay.png':(192,48),'fx/ns_wechsel.png':(3840,270),'fx/ns_unruhe.png':(64,16),'ui/ns_symbole.png':(112,16)}
for n in ['umrissgaenger','lampenfresser','rueckwaertsgeher']:
 expected['characters/nsw_'+n+'.png']=(64,128);expected['battle/nsw_'+n+'.png']=(384,320)
expected['battle/nsw_namenlose_kutsche.png']=(576,320)
for c in ['kettlegate','wexmoor','dunscar','calderwick','briarholt','varrowmouth']:expected['battle/bg_ns_'+c+'.png']=(480,270)
for n in ['still','umrissgaenger','lampenfresser','rueckwaertsgeher','namenlose_kutsche','spiegelspieler']:
 expected['ui/heads/nsw_'+n+'.png']=(24,24);expected['bestiary/nsw_'+n+'.png']=(48,48)
errors=[];checks=[];seen=set()
def require(ok,message):
 if not ok:errors.append(message)
for a in manifest['assets']:
 f=a['file'];require(f not in seen,'duplicate file '+f);seen.add(f)
 p=SPR/f
 if not p.exists():errors.append('missing '+f);continue
 im=Image.open(p).convert('RGBA');pixels=list(im.getdata());colors={rgb[:3] for rgb in pixels if rgb[3]};alpha={rgb[3] for rgb in pixels}
 require(im.size==expected.get(f),'unexpected dimensions '+f)
 require(im.size==(a['width'],a['height']),'manifest dimensions '+f)
 require(len(colors)<=32,'palette count '+f);require(colors<=palette,'outside shared palette '+f)
 require(alpha<={0,255},'nonbinary alpha '+f)
 require(0 in alpha if a['transparent'] else alpha=={255},'alpha mode '+f)
 fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows']
 require(fw*cols==im.width and fh*rows==im.height,'frame raster '+f)
 def frame(i):return im.crop(((i%cols)*fw,(i//cols)*fh,(i%cols+1)*fw,(i//cols+1)*fh))
 for name,an in a.get('animations',{}).items():
  require(an['frameRate']>0,'frame rate '+f)
  for i in an['frames']:
   require(isinstance(i,int) and 0<=i<cols*rows,'frame index '+f)
   require(frame(i).getbbox() is not None,'empty animation '+f+':'+str(i))
  if name in ['down','left','right','up','idle','fog','pulse','overlay']:
   require(len({frame(i).tobytes() for i in an['frames']})>=2,'static animation '+f+':'+name)
 for i,j in a.get('anticipationPairs',[]):require(frame(i).tobytes()==frame(j).tobytes(),'anticipation mismatch '+f)
 for name,r in a.get('regions',{}).items():
  x,y,w,h=(r[k] for k in ['x','y','width','height']);require(all(isinstance(v,int) for v in [x,y,w,h]),'region not integer '+f)
  require(0<=x<x+w<=im.width and 0<=y<y+h<=im.height,'region bounds '+f+':'+name)
  require(all(v%16==0 for v in [x,y,w,h]),'region off 16px grid '+f+':'+name)
  require(im.crop((x,y,x+w,y+h)).getbbox() is not None,'empty region '+f+':'+name)
 for r in a.get('unusedRegions',[]):require(im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).getbbox() is None,'unused region not empty '+f)
 if 'usedCells' in a:
  for i in range(a['usedCells'],cols*rows):require(frame(i).getbbox() is None,'unused tile not empty '+f)
 if a.get('baseline')==30:
  for i in range(cols*rows):require(frame(i).crop((0,30,fw,fh)).getbbox() is None,'baseline overflow '+f)
 checks.append({'file':f,'size':list(im.size),'visibleColors':len(colors),'alphaValues':sorted(alpha),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
require(seen==set(expected),'manifest inventory differs from 35 required exports')
report={'ok':not errors,'batch':'nebelseite','assetCount':len(checks),'errors':errors,'checks':checks,'scope':'Dimensions, shared palette, binary alpha, frame and region raster, nonempty animations, anticipation holds, empty cells, baselines. Not a gameplay or collision test.'}
(ROOT/'docs/art/batch-nebelseite-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'ok':not errors,'assets':len(checks),'errors':errors},ensure_ascii=False,indent=2))
sys.exit(bool(errors))
