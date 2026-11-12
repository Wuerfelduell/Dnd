"""Pillow validation for the DJ export. Does not modify sprites."""
from pathlib import Path
from PIL import Image
import json,sys,hashlib
R=Path(__file__).resolve().parents[3];S=R/'public/sprites';A=R/'docs/art'
m=json.loads((S/'manifest-benannte.json').read_text());errors=[];report=[];allowed={tuple(bytes.fromhex(c[1:])) for c in m['palette']};files=set();ids=set()
for a in m['assets']:
 p=S/a['file'];issues=[]
 if a['file'] in files:issues.append('duplicate file')
 if a['id'] in ids:issues.append('duplicate asset id')
 ids.add(a['id'])
 files.add(a['file'])
 if not p.exists():errors.append(str(p));continue
 im=Image.open(p).convert('RGBA');fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows']
 if im.size!=(fw*cols,fh*rows) or im.size!=(a['width'],a['height']):issues.append('dimensions/grid')
 pixels=list(im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata());alpha={v[3] for v in pixels};colors={v[:3] for v in pixels if v[3]}
 if not alpha<={0,255}:issues.append('nonbinary alpha')
 if len(colors)>32 or not colors<=allowed:issues.append('palette')
 if 0 not in alpha or 255 not in alpha:issues.append('missing transparency/content')
 cells=[]
 for k in range(cols*rows):
  f=im.crop(((k%cols)*fw,(k//cols)*fh,(k%cols+1)*fw,(k//cols+1)*fh));cells.append(f)
  if not f.getbbox():issues.append(f'empty cell {k}')
  if a['kind']=='walk':
   box=f.getbbox()
   if box and box[3]-1!=30:issues.append(f'baseline {k}')
 for name,an in a.get('animations',{}).items():
  if not an['frames'] or any(not isinstance(i,int) or not 0<=i<len(cells) for i in an['frames']):issues.append('animation '+name)
  if an['frameRate']<=0:issues.append('speed '+name)
 if a['kind']=='battle':
  if (cols,rows)!=(6,5):issues.append('battle layout')
  for r in [1,2]:
   if cells[r*6].tobytes()!=cells[r*6+1].tobytes():issues.append('windup hold')
  for r in range(5):
   if len({c.tobytes() for c in cells[r*6:r*6+6]})<3:issues.append(f'insufficient animation variety row {r}')
 if a['kind']=='walk':
  for r in range(4):
   if len({c.tobytes() for c in cells[r*4:r*4+4]})<2:issues.append(f'no walking movement direction {r}')
  if len({cells[r*4].tobytes() for r in range(4)})<3:issues.append('missing directions')
 for reg in a.get('regions',{}).values():
  if reg['x']<0 or reg['y']<0 or reg['x']+reg['width']>im.width or reg['y']+reg['height']>im.height:issues.append('region bounds')
 if issues:errors.extend(a['file']+': '+x for x in issues)
 report.append({'file':a['file'],'size':list(im.size),'colors':len(colors),'alpha':sorted(alpha),'cells':len(cells),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'issues':issues})
expected={'battle':24,'walk':24,'head':24,'bestiary':24,'item':32,'fx':1,'ui':1}
for kind,n in expected.items():
 count=sum(a['kind']==kind for a in m['assets'])
 if count!=n:errors.append(f'{kind}: {count} expected {n}')
result={'batch':'benannte','pass':not errors,'assetCount':len(report),'checks':['dimensions','integer pixel grid','shared palette <=32','binary alpha','nonempty cells','walking baseline30','animation indices and speed','held windup frames','frame variety','region bounds','complete inventory'],'limitations':['Automated tests do not prove anatomy or artistic quality.','Zollgeist face is a runtime portrait overlay, neutral in exported sheets.'],'errors':errors,'assets':report}
(A/'batch-benannte-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f'{"PASS" if not errors else "FAIL"}: {len(report)} PNGs; '+', '.join(result['checks']))
for e in errors:print(e)
sys.exit(bool(errors))
