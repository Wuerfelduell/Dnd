import json,pathlib
import numpy as np
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[2];m=json.loads((root/'public/sprites/manifest-treffen.json').read_text());allcolors=set();report=[]
assert len(m['assets'])==20
for a in m['assets']:
 im=Image.open(root/'public/sprites'/a['file']);assert im.mode=='P'; ar=np.array(im.convert('RGBA'));alpha=ar[:,:,3]
 assert im.size==(a['width'],a['height']);assert set(np.unique(alpha))<={0,255}
 colors={tuple(p[:3]) for p in ar.reshape(-1,4) if p[3]};allcolors|=colors
 if not a['transparent']:assert (alpha==255).all()
 fw,fh=a['frameWidth'],a['frameHeight'];assert im.width==fw*a['columns'] and im.height==fh*a['rows']
 for name,anim in a.get('animations',{}).items():
  for i in anim['frames']:
   assert 0<=i<a['columns']*a['rows'];x=i%a['columns']*fw;y=i//a['columns']*fh
   assert alpha[y:y+fh,x:x+fw].any()
 mask=np.zeros_like(alpha,dtype=bool)
 for name,(x,y,w,h) in a.get('regions',{}).items():
  assert min(x,y)>=0 and x+w<=im.width and y+h<=im.height
  assert not mask[y:y+h,x:x+w].any();mask[y:y+h,x:x+w]=True
  assert alpha[y:y+h,x:x+w].any() or (a['id']=='zirkel' and name=='timer_7')
 for name,anim in a.get('regionAnimations',{}).items():
  frames=[]
  for n in anim['regions']:
   x,y,w,h=a['regions'][n];frames.append(ar[y:y+h,x:x+w].tobytes())
  assert len(set(frames))>1,(a['id'],name)
 if a['id'].endswith('_walk'):
  for y in range(4):
   fs=[]
   for x in range(4):
    aa=alpha[y*32:(y+1)*32,x*16:(x+1)*16];assert np.where(aa)[0].max()==30;assert not aa[:,0].any() and not aa[:,-1].any();fs.append(ar[y*32:(y+1)*32,x*16:(x+1)*16].tobytes())
   assert len(set(fs))>1
 report.append(dict(file=a['file'],size=list(im.size),colors=len(colors),passed=True))
assert len(allcolors)<=31
out=dict(passed=True,files=len(report),visibleColors=len(allcolors),checks=report)
(root/'docs/art/validation-treffen.json').write_text(json.dumps(out,indent=2)+'\n');print(f"PASS: {len(report)} PNGs, {len(allcolors)} shared colors; dimensions, alpha, frames, regions, animation variation, walk baseline")
