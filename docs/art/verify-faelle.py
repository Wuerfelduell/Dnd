"""Validate the delivered Batch E atlas contract and inventory correspondence."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
m=json.loads((ROOT/'public/sprites/manifest-faelle.json').read_text());allowed={tuple(bytes.fromhex(c[1:]))for c in m['palette']};errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
paths=set()
for a in m['assets']:
 name=a['file'];p=ROOT/'public/sprites'/name
 check(name not in paths,'Duplicate '+name);paths.add(name)
 if not p.exists():errors.append('Missing '+name);continue
 im=Image.open(p);check(im.mode=='P','Not indexed '+name);check(im.size==(a['width'],a['height']),'Size '+name)
 rgba=im.convert('RGBA');colors=rgba.getcolors(im.width*im.height);visible={v[:3]for n,v in colors if v[3]}
 check(visible<=allowed,'Palette '+name);check(len(visible)<=32,'Color count '+name)
 alphas={v[3]for n,v in colors};check(alphas<={0,255},'Nonbinary alpha '+name)
 check((0 in alphas and 255 in alphas)if a['transparent'] else alphas=={255},'Opacity '+name)
 if 'frameWidth'in a:
  fw,fh=a['frameWidth'],a['frameHeight'];n=a['columns']*a['rows'];check((fw*a['columns'],fh*a['rows'])==im.size,'Grid '+name)
  frames=[rgba.crop((i%a['columns']*fw,i//a['columns']*fh,(i%a['columns']+1)*fw,(i//a['columns']+1)*fh))for i in range(n)]
  check(all(f.getchannel('A').getbbox() for f in frames),'Empty frame '+name)
  if 'baseline'in a:
   check(all(f.getchannel('A').getbbox()[3]==31 for f in frames),'Baseline '+name)
   check(all(f.getchannel('A').crop((0,0,1,fh)).getbbox()is None and f.getchannel('A').crop((fw-1,0,fw,fh)).getbbox()is None for f in frames),'Horizontal guard '+name)
  for anim in a.get('animations',{}).values():
   check(all(0<=i<n for i in anim['frames']),'Frame bounds '+name)
   check(len({frames[i].tobytes()for i in anim['frames']})>=2,'Static animation '+name)
  if 'expressions'in a:check(len({f.tobytes()for f in frames})==4,'Duplicate portrait '+name)
  if 'atlas'in a:
   atlas=Image.open(ROOT/'public/sprites'/a['atlas']).convert('RGBA');i=a['atlasFrame'];check(rgba.tobytes()==atlas.crop((16*i,0,16*i+16,16)).tobytes(),'Item mismatch '+name)
 regs=a.get('regions',{})
 occupied=[]
 for key,r in regs.items():
  x,y,w,h=[r[k]for k in ['x','y','width','height']];check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,'Region bounds '+name+':'+key)
  check(rgba.crop((x,y,x+w,y+h)).getchannel('A').getbbox()is not None,'Empty region '+name+':'+key)
  for X,Y,W,H in occupied:check(x+w<=X or X+W<=x or y+h<=Y or Y+H<=y,'Overlap '+name)
  occupied.append((x,y,w,h))
 for an in a.get('regionAnimations',{}).values():
  check(all(k in regs for k in an['regions']),'Region animation '+name)
  boxes=[regs[k]for k in an['regions']];fs=[rgba.crop((b['x'],b['y'],b['x']+b['width'],b['y']+b['height'])).tobytes()for b in boxes];check(len(set(fs))>1,'Static region animation '+name)
check(len(paths)==102,'Expected102 PNGs')
report=dict(batch='faelle',pngCount=len(paths),passed=not errors,errors=errors)
(ROOT/'docs/art/faelle-validation.json').write_text(json.dumps(report,indent=2)+'\n')
if errors:raise SystemExit('\n'.join(errors))
print('PASS:102 PNGs; dimensions,32-color palette,binary alpha,frames,baselines,regions,animations,inventory correspondence')
