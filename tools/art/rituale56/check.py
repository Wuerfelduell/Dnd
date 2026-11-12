#!/usr/bin/env python3
"""Validate DQ exports. Run from any directory; requires Pillow only."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
m=json.loads((ROOT/'public/sprites/manifest-rituale56.json').read_text())
pal={tuple(bytes.fromhex(c[1:])) for c in m['palette']}
errors=[];results=[];seen=set()
def require(ok,message):
 if not ok:errors.append(message)
require(len(m['assets'])==51,'Expected 51 explicit PNG exports')
for a in m['assets']:
 name=a['id'];require(name not in seen,'Duplicate ID '+name);seen.add(name)
 im=Image.open(ROOT/'public/sprites'/a['file']).convert('RGBA');w,h=im.size;fw,fh=a['frameWidth'],a['frameHeight'];c,r=a['columns'],a['rows'];pixels=list(im.getdata());visible={p[:3] for p in pixels if p[3]}
 require((w,h)==(a['width'],a['height'])==(fw*c,fh*r),name+': dimensions/grid')
 require(len(visible)<=32 and visible<=pal,name+': palette')
 require({p[3] for p in pixels}<={0,255},name+': nonbinary alpha')
 require(all(p==(0,0,0,0) for p in pixels if not p[3]),name+': hidden RGB')
 frames=[im.crop((i%c*fw,i//c*fh,(i%c+1)*fw,(i//c+1)*fh)) for i in range(c*r)]
 empty=[i for i,f in enumerate(frames) if not f.getbbox()]
 require(empty==a.get('emptyFrames',[]),name+': unexpected empty frames '+str(empty))
 for anim in a['animations'].values():require(all(type(i)==int and 0<=i<c*r for i in anim['frames']),name+': frame index')
 if 'derivedFrom'in a:
  source=Image.open(ROOT/'public/sprites'/a['derivedFrom']).convert('RGBA').resize(im.size,Image.Resampling.NEAREST);require(source.tobytes()==im.tobytes(),name+': NN derivative')
 if name=='enemy_laternenbestie':
  for start in (6,12):require(frames[start].tobytes()==frames[start+1].tobytes(),name+': anticipation hold')
 if 'overlayRegion' in a:
  for f in frames:require(not f.crop((0,0,16,10)).getbbox() and not f.crop((0,24,16,32)).getbbox(),name+': torso overlay bounds')
 if name=='probe_faden_verbinden':
  for f in frames:require(f.crop((0,0,1,fh)).tobytes()==f.crop((fw-1,0,fw,fh)).tobytes(),name+': tiling seam')
 if 'nineSlice'in a:
  n=a['nineSlice'];require(n['left']+n['right']<fw and n['top']+n['bottom']<fh,name+': slice insets')
 for region in a.get('regions',{}).values():require(region['x']>=0 and region['y']>=0 and region['x']+region['width']<=w and region['y']+region['height']<=h,name+': region bounds')
 results.append({'file':a['file'],'size':[w,h],'frames':c*r,'visibleColors':len(visible),'binaryAlpha':True,'emptyFrames':empty})
report={'batch':'rituale56','passed':not errors,'pngCount':len(results),'frameCount':sum(x['frames']for x in results),'checks':['dimensions','shared palette <=32','binary alpha','transparent RGB','cell grid','frame indices','empty cells','nearest-neighbor derivatives','attack anticipation holds','overlay torso bounds','thread tiling seam','nine-slice insets','region bounds'],'errors':errors,'assets':results}
(ROOT/'docs/art/batch-rituale56-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(('PASS' if not errors else 'FAIL')+f": {len(results)} PNGs, {report['frameCount']} frames, {len(errors)} errors")
for e in errors:print(e)
raise SystemExit(bool(errors))
