"""Validate exported travel/cult assets: python docs/art/verify-reise.py."""
import json
from pathlib import Path
from PIL import Image
import numpy as np
root=Path(__file__).resolve().parents[2];m=json.loads((root/'public/sprites/manifest-reise.json').read_text());errors=[];colors=set()
for e in m['assets']:
 im=Image.open(root/'public/sprites'/e['file']);a=np.array(im.convert('RGBA'));alpha=a[:,:,3];p=e['file']
 if im.size!=(e['width'],e['height']):errors.append(p+': dimensions')
 if not set(np.unique(alpha))<={0,255}:errors.append(p+': nonbinary alpha')
 if not e['transparent'] and not (alpha==255).all():errors.append(p+': not opaque')
 visible=set(map(tuple,a[alpha==255,:3]));colors |=visible
 if len(visible)>31:errors.append(p+': palette')
 if 'animations'in e:
  fw=e['frameWidth'];fh=e['frameHeight'];cols=e['columns'];used=set()
  for n,an in e['animations'].items():
   for f in an['frames']:
    used.add(f);c=f%cols;r=f//cols;tile=alpha[r*fh:(r+1)*fh,c*fw:(c+1)*fw]
    if not tile.any():errors.append(p+': empty '+str(f))
    if e.get('baseline') and np.where(tile)[0].max()!=e['baseline']-1:errors.append(p+': baseline '+str(f))
  for f in range(e['rows']*cols):
   if f not in used and alpha[f//cols*fh:(f//cols+1)*fh,f%cols*fw:(f%cols+1)*fw].any():errors.append(p+': padding '+str(f))
  if e.get('facing')=='left':
   for r in [1,2]:
    if not np.array_equal(a[r*fh:(r+1)*fh,:fw],a[r*fh:(r+1)*fh,fw:2*fw]):errors.append(p+': windup')
 for n,r in e.get('regions',{}).items():
  if r['x']<0 or r['y']<0 or r['x']+r['width']>im.width or r['y']+r['height']>im.height:errors.append(p+': region '+n)
report=dict(assets=len(m['assets']),visibleColors=len(colors),errors=errors);(root/'docs/art/reise-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));assert not errors
