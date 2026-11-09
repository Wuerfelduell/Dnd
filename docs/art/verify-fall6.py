#!/usr/bin/env python3
"""Validate dimensions, palette, alpha, regions and animation contracts for Batch K."""
from pathlib import Path
import json,sys,hashlib
from PIL import Image
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
base=ROOT/'public/sprites';m=json.loads((base/'manifest-fall6.json').read_text());s=json.loads((ROOT/'docs/art/batch-fall6-generation.json').read_text());jobs={j['id']:j for j in s['jobs']};checks=0;files=set();union=set();expected=set()
def ck(test,msg):
 global checks
 checks+=1
 if not test:raise AssertionError(msg)
for j in s['jobs']:
 expected.add(j['out'])
 if j['mode']=='items':
  for name,_ in j['parts']:
   for prefix in ['items/','items/32/']:expected.add(prefix+name+'.png')
ck(len(s['jobs'])==63,'63 requested source jobs')
ck(len(m['assets'])==81,'81 requested PNG files')
for a in m['assets']:
 file=a['file'];ck(file not in files,'unique file '+file);files.add(file);p=base/file;im=Image.open(p);rgba=im.convert('RGBA');alpha=rgba.getchannel('A');colors=set(rgba.get_flattened_data() if hasattr(rgba,'get_flattened_data') else rgba.getdata());visible={c[:3] for c in colors if c[3]};union.update(visible)
 ck(im.mode=='P','indexed '+file);ck(im.size==(a['width'],a['height']),'size '+file);ck(len(visible)<=31,'palette '+file);ck(all(c[3] in (0,255) for c in colors),'binary alpha '+file);ck(hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],'hash '+file)
 ck(alpha.getextrema()[1]==255,'visible '+file)
 ck(alpha.getextrema()[0]==0 if a['transparent'] else alpha.getextrema()[0]==255,'opacity '+file)
 regions=a.get('regions',{});taken=[]
 for name,(x,y,w,h) in regions.items():
  ck(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,'region bounds '+file+name)
  ck(alpha.crop((x,y,x+w,y+h)).getbbox() is not None,'region content '+file+name)
  ck(not any(x<xx+ww and x+w>xx and y<yy+hh and y+h>yy for xx,yy,ww,hh in taken),'nonoverlap '+file+name);taken.append((x,y,w,h))
 for name,anim in a.get('regionAnimations',{}).items():ck(all(n in regions for n in anim['regions']),'region animation '+name)
 if 'frameWidth' in a:
  fw,fh,nc,nr=a['frameWidth'],a['frameHeight'],a['columns'],a['rows'];ck((fw*nc,fh*nr)==im.size,'grid '+file)
  def frame(n):return rgba.crop((n%nc*fw,n//nc*fh,(n%nc+1)*fw,(n//nc+1)*fh))
  for n in a.get('paddingFrames',[]):ck(frame(n).getbbox() is None,'padding '+file+str(n))
  for name,an in a.get('animations',{}).items():
   ck(an['frameRate']>0,'fps '+file)
   for n in an['frames']:
    ck(0<=n<nc*nr,'frame index '+file);f=frame(n);box=f.getbbox();ck(box is not None,'nonempty frame '+file+str(n))
    ck(box[0]>=1 and box[1]>=1 and box[2]<=fw-1 and box[3]<=fh-1,'cell padding '+file+str(n))
    if 'baselineY' in a:ck(box[3]-1==a['baselineY'],'baseline '+file+str(n))
  for r in a.get('heldAnticipationRows',[]):ck(frame(r*nc).tobytes()==frame(r*nc+1).tobytes(),'held anticipation '+file)
 if 'seamlessFloorFrames' in a:
  floors=[frame(n) for n in a['seamlessFloorFrames']]
  for left in floors:
   for right in floors:
    ck(left.crop((15,0,16,16)).tobytes()==right.crop((0,0,1,16)).tobytes(),'horizontal floor seam '+file)
    ck(left.crop((0,15,16,16)).tobytes()==right.crop((0,0,16,1)).tobytes(),'vertical floor seam '+file)
 j=jobs.get(a['id'])
 if j and j['mode']=='battle':ck(a['columns']==6,'six columns '+file)
 if j and j['mode']=='background':ck(im.size==(480,270) and a['groundStrip']==[0,200,480,70],'battle ground contract '+file)
ck(files==expected,'complete exact file set');ck(len(union)<=31,'shared total palette')
print(f'PASS: {len(files)} PNGs, {checks} checks, {len(union)} shared visible colors; binary alpha, dimensions, regions, baselines and animation padding verified.')

(ROOT/'docs/art/batch-fall6-validation.json').write_text(json.dumps(dict(status='passed',pngCount=len(files),checks=checks,visibleColors=len(union),runtimeIntegrationTested=False),indent=2)+'\n')
