"""Validate final Batch M exports; Pillow and numpy required."""
from pathlib import Path
from PIL import Image
import json,numpy as np,hashlib
root=Path(__file__).resolve().parents[2];m=json.loads((root/'public/sprites/manifest-fall78.json').read_text())
errors=[];allcolors=set();frame_count=0
def check(ok,msg):
 if not ok:errors.append(msg)
for a in m['assets']:
 p=root/'public/sprites'/a['file']
 check(p.exists(),a['file']+' missing')
 if not p.exists():continue
 im=Image.open(p);ar=np.array(im.convert('RGBA'));alpha=ar[:,:,3]
 check(im.size==(a['width'],a['height']),a['id']+' size')
 check(set(np.unique(alpha))<={0,255},a['id']+' binary alpha')
 if not a['transparent']:check(np.all(alpha==255),a['id']+' opaque')
 if not a.get('sharedExisting'):
  check(im.mode=='P',a['id']+' indexed palette')
  colors=set(map(tuple,ar[:,:,:3][alpha>0]));allcolors|=colors
  check(len(colors)<=32,a['id']+' color limit')
 if 'animations' in a:
  cw,ch,c=a['frameWidth'],a['frameHeight'],a['columns'];used=set()
  for name,anim in a['animations'].items():
   hashes=[]
   for i in anim['frames']:
    used.add(i);f=ar[(i//c)*ch:(i//c+1)*ch,(i%c)*cw:(i%c+1)*cw];frame_count+=1
    check(f.shape==(ch,cw,4),a['id']+' frame bounds');check(np.any(f[:,:,3]),a['id']+' empty '+str(i))
    hashes.append(hashlib.sha256(f.tobytes()).hexdigest())
    if 'baseline' in a and np.any(f[:,:,3]):
     y=np.nonzero(f[:,:,3])[0].max()+1
     check(y==a['baseline'],a['id']+' baseline '+str(i)+': '+str(y))
     check(not np.any(f[:,[0,-1],3]),a['id']+' horizontal margin '+str(i))
   check(len(set(hashes))>1,a['id']+' no animation variation '+name)
  for i in range(c*a['rows']):
   if i not in used and not a.get('allowStaticFrames'):check(not np.any(alpha[(i//c)*ch:(i//c+1)*ch,(i%c)*cw:(i%c+1)*cw]),a['id']+' padding')
  if a.get('windupHoldFrames'):
   for r in [1,2]:check(np.array_equal(ar[r*ch:(r+1)*ch,0:cw],ar[r*ch:(r+1)*ch,cw:2*cw]),a['id']+' windup')
 for name,(x,y,w,h) in a.get('regions',{}).items():
  check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,a['id']+' region bounds '+name)
  check(np.any(alpha[y:y+h,x:x+w]),a['id']+' empty region '+name)
check(len(allcolors)<=32,'shared output palette exceeds 32')
report=dict(batch='fall78',assetCount=len(m['assets']),newAssetCount=sum(not a.get('sharedExisting',False) for a in m['assets']),visibleColorsNewAssets=len(allcolors),animationFrameReferences=frame_count,errors=errors,passed=not errors)
(root/'docs/art/validation-fall78.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2));raise SystemExit(bool(errors))
