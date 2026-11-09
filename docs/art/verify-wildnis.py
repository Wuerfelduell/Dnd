"""Validate deliverable contract, alpha, palette, regions and animation timing."""
from PIL import Image
import json,pathlib,numpy as np
R=pathlib.Path(__file__).resolve().parents[2]; S=R/'public/sprites';m=json.loads((S/'manifest-wildnis.json').read_text());spec=json.loads((R/'docs/art/batch-wildnis-generation.json').read_text());jobs={j['id']:j for j in spec['jobs']};errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check(not m['pending'],'Pending files remain');check(len(m['assets'])==121,'Expected 121 PNGs');check(len({a['file'] for a in m['assets']})==121,'Duplicate files');check(len({a['id'] for a in m['assets']})==121,'Duplicate IDs')
allowed={tuple(bytes.fromhex(c[1:])) for c in m['palette']}; union=set();frames=0
for a in m['assets']:
 p=S/a['file'];check(p.exists(),str(p)+' missing')
 if not p.exists():continue
 im=Image.open(p);check(im.mode=='P',a['id']+' is not palette indexed');im=im.convert('RGBA');data=np.array(im);alpha=data[:,:,3];cs={tuple(c) for c in data[alpha>0][:,:3]};union|=cs
 check(im.size==(a['width'],a['height']),a['id']+' wrong size');check(set(np.unique(alpha))<={0,255},a['id']+' soft alpha');check(cs<=allowed,a['id']+' unexpected colors');check(bool(cs),a['id']+' empty')
 if not a['transparent']:check(bool((alpha==255).all()),a['id']+' must be opaque')
 else:check(bool((alpha==0).any()),a['id']+' missing transparency')
 if a['id'] in jobs and 'parts' not in jobs[a['id']]:check(list(im.size)==jobs[a['id']]['size'],a['id']+' specification dimensions mismatch')
 for name,r in a.get('regions',{}).items():
  x,y,w,h=[r[k] for k in ['x','y','width','height']];check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,a['id']+'/'+name+' out of bounds');check(bool((alpha[y:y+h,x:x+w]>0).any()),a['id']+'/'+name+' empty')
 for name,an in a.get('animations',{}).items():
  check(an['frameRate']>0,a['id']+' invalid rate')
  for f in an['frames']:
   frames+=1
   if isinstance(f,str):check(f in a.get('regions',{}),a['id']+' unknown region '+f)
   else:
    check(0<=f<a['columns']*a['rows'],a['id']+' invalid frame');fw,fh=a['frameWidth'],a['frameHeight'];x=(f%a['columns'])*fw;y=(f//a['columns'])*fh;check(bool((alpha[y:y+fh,x:x+fw]>0).any()),a['id']+' empty animation frame '+str(f))
 if a['id'].startswith('enemy_'):
  fw=a['frameWidth'];check(im.crop((0,fw,fw,2*fw)).tobytes()==im.crop((fw,fw,2*fw,2*fw)).tobytes(),a['id']+' windup not held')
  counts=jobs[a['id']]['counts']
  for r,count in enumerate(counts):
   for c in range(6):
    mask=alpha[r*fw:(r+1)*fw,c*fw:(c+1)*fw]
    check((not mask.any()) if c>=count else bool(mask.any()),a['id']+f' padding/occupancy {r},{c}')
    if c<count:check(not(mask[0,:].any() or mask[-1,:].any() or mask[:,0].any() or mask[:,-1].any()),a['id']+f' cell-edge pixels {r},{c}')
check(len(union)<=31,'Shared palette exceeded')
report={'pngFiles':len(m['assets']),'sharedVisibleColors':len(union),'animationFrameReferences':frames,'errors':errors,'passed':not errors,'runtimeIntegrationTested':False}
(R/'docs/art/validation-wildnis.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));raise SystemExit(bool(errors))
