from PIL import Image
from pathlib import Path
import json
root=Path(__file__).resolve().parents[3]
m=json.loads((root/'public/sprites/manifest-fasserin.json').read_text())
assert len(m['assets'])==26
colors=set()
for a in m['assets']:
 im=Image.open(root/'public/sprites'/a['file']);assert im.mode=='P';assert im.size==(a['width'],a['height'])
 rgba=im.convert('RGBA');assert set(rgba.getchannel('A').getdata())=={0,255}
 visible={p[:3] for p in rgba.getdata() if p[3]};assert len(visible)<=32;colors.update(visible)
 w,h=a['frameWidth'],a['frameHeight'];assert im.width==w*a['columns'] and im.height==h*a['rows']
 for row in range(a['rows']):
  frames=[]
  for col in range(a['columns']):
   frame=rgba.crop((col*w,row*h,(col+1)*w,(row+1)*h));box=frame.getbbox();assert box
   assert box[0]>=1 and box[1]>=1 and box[2]<=w-1 and box[3]<=h-1,(a['file'],box)
   if a['file'].startswith('characters/'):assert box[3]==31
   frames.append(frame.tobytes())
  if a['columns']>1:assert len(set(frames))==len(frames),a['file']
 for ani in a['animations'].values():
  assert all(0<=f<a['columns']*a['rows'] for f in ani['frames']);assert ani['frameRate']>0
assert len(colors)<=32
print('BO: 26 indexed PNGs, exact dimensions, <=32 shared colors, binary alpha, frame margins, distinct poses and character baselines passed.')
