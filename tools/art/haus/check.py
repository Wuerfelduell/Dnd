#!/usr/bin/env python3
"""Validate DG export. Run from any directory; Pillow is required."""
from pathlib import Path
from PIL import Image
import json, hashlib
R=Path(__file__).resolve().parents[3]
m=json.loads((R/'public/sprites/manifest-haus.json').read_text())
palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']}
expected={'tilesets/haus_innen.png':(256,256),'props/haus_stuecke.png':(512,256),'props/haus_trophaeen.png':(512,128),'ui/haus_symbole.png':(160,16),'ui/haus_rahmen.png':(48,48),'fx/haus_umzug.png':(1440,135),'fx/haus_staub.png':(64,16),'props/haus_tueren.png':(96,32)}
errors=[];checks=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check({a['file'] for a in m['assets']}==set(expected),'asset inventory')
for a in m['assets']:
 p=R/'public/sprites'/a['file']; im=Image.open(p).convert('RGBA'); pixels=list(im.get_flattened_data() if hasattr(im,"get_flattened_data") else im.getdata()); colors={q[:3] for q in pixels if q[3]}; alpha={q[3] for q in pixels}
 check(im.size==expected[a['file']]==(a['width'],a['height']),a['id']+': size')
 check(len(colors)<=32 and colors<=palette,a['id']+': shared palette')
 check(alpha<={0,255},a['id']+': binary alpha')
 check(not any(q[:3]!=(0,0,0) for q in pixels if q[3]==0),a['id']+': hidden RGB halo')
 check(a['frameWidth']*a['columns']==im.width and a['frameHeight']*a['rows']==im.height,a['id']+': frame grid')
 if not a['transparent']:check(alpha=={255},a['id']+': opaque')
 for name,r in a['regions'].items():
  x,y,w,h=(r[k] for k in ['x','y','width','height']);check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,name+': region bounds')
  check(all(v%16==0 for v in [x,y,w,h]),name+': 16px grid')
  check(im.crop((x,y,x+w,y+h)).getchannel('A').getbbox() is not None,name+': empty region')
 for name,v in a['animations'].items():
  check(v['frameRate']>0 and len(v['frames'])>1,name+': timing')
  check(all(0<=i<a['columns']*a['rows'] for i in v['frames']),name+': frame range')
  hashes=[]
  for i in v['frames']:
   x=i%a['columns']*a['frameWidth'];y=i//a['columns']*a['frameHeight'];f=im.crop((x,y,x+a['frameWidth'],y+a['frameHeight']));check(f.getchannel('A').getbbox() is not None,name+': empty frame');hashes.append(hashlib.sha256(f.tobytes()).hexdigest())
  check(len(set(hashes))>1,name+': duplicate-only animation')
 if 'unused_after_frame' in a:
  for i in range(a['unused_after_frame']+1,a['columns']*a['rows']):
   x=i%a['columns']*a['frameWidth'];y=i//a['columns']*a['frameHeight'];check(im.crop((x,y,x+a['frameWidth'],y+a['frameHeight'])).getchannel('A').getbbox() is None,a['id']+': unused cell '+str(i))
 for row in a.get('reserved_empty_rows',[]):check(im.crop((0,row*a['frameHeight'],im.width,(row+1)*a['frameHeight'])).getchannel('A').getbbox() is None,a['id']+': reserved row')
 checks.append({'file':a['file'],'size':list(im.size),'visible_colors':len(colors),'alpha':sorted(alpha),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
report={'batch':'haus','passed':not errors,'files':checks,'errors':errors,'visual_review':'Eight exports reviewed in nearest-neighbor contact sheet; readable furnishings and trophies, transparent mirror, stove and wilt variants, six wall materials. Pixel grid validation checks integer aligned cells, not artistic quality.'}
(R/'docs/art/batch-haus-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'DG Grafik: {len(checks)} PNGs, Palette/Alpha/Raster/Regionen/Animationen geprüft; {len(errors)} Fehler.')
for e in errors: print(e)
raise SystemExit(bool(errors))
