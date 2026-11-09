"""Validate the art delivery contract; does not run or modify game code."""
from pathlib import Path
from PIL import Image
import numpy as np
import json,re
ROOT=Path(__file__).resolve().parents[2];base=ROOT/'public/sprites'
spec=json.loads((ROOT/'docs/art/batch-stadt-generation.json').read_text());m=json.loads((base/'manifest-stadt.json').read_text());assets=m['assets'];expected={j['file'] for j in spec['jobs']};actual={a['file'] for a in assets}
assert len(expected)==45 and actual==expected,(len(actual),expected-actual)
colors=set();anim_count=0;region_count=0
for a in assets:
 im=Image.open(base/a['file']);assert im.mode=='P',a['file'];assert im.size==(a['width'],a['height']);p=np.array(im.convert('RGBA'));alpha=p[:,:,3];assert set(np.unique(alpha))<={0,255}
 if not a['transparent']:assert np.all(alpha==255)
 assert np.any(alpha),a['file'];cs=set(map(tuple,p[alpha>0,:3]));assert len(cs)<=31;colors|=cs
 assert a['columns']*a['frameWidth']==im.width and a['rows']*a['frameHeight']==im.height
 for r in a.get('regions',[]):
  x,y,w,h=[r[k] for k in ('x','y','width','height')];assert x%16==y%16==w%16==h%16==0;assert 0<=x<x+w<=im.width and 0<=y<y+h<=im.height;assert alpha[y:y+h,x:x+w].any(),(a['id'],r['name']);region_count+=1
 for name,an in a['animations'].items():
  assert an['frameRate']>0 and len(an['frames'])>=2;frames=[]
  for f in an['frames']:
   if isinstance(f,int):x=f%a['columns']*16;y=f//a['columns']*16;w=an['frameWidth'];h=an['frameHeight']
   else:x,y,w,h=[f[k] for k in ('x','y','width','height')]
   assert x+w<=im.width and y+h<=im.height;frames.append(p[y:y+h,x:x+w].tobytes())
  if isinstance(an['frames'][0],dict):
   bottoms=[]
   for f in an['frames']:
    cut=Image.fromarray(p[f['y']:f['y']+f['height'],f['x']:f['x']+f['width']]);bottoms.append(cut.getbbox()[3])
   assert len(set(bottoms))==1,(a['id'],name,'baseline')
  assert len(set(frames))>1,(a['id'],name,'duplicate frames');anim_count+=1
 if 'tileOrder' in a:
  assert im.size==(64,64) and len(a['tileOrder'])==16
  tiles=[p[i//4*16:i//4*16+16,i%4*16:i%4*16+16] for i in range(16)]
  for i,e in enumerate(a['edgeSignatures']):
   for j,f in enumerate(a['edgeSignatures']):
    if e['right']==f['left']:assert np.array_equal(tiles[i][:,-1],tiles[j][:,0]),(a['id'],i,j,'horizontal seam')
    if e['bottom']==f['top']:assert np.array_equal(tiles[i][-1],tiles[j][0]),(a['id'],i,j,'vertical seam')
  for i in (0,15):
   q=p[i//4*16:i//4*16+16,i%4*16:i%4*16+16];assert np.array_equal(q[0],q[-1]) and np.array_equal(q[:,0],q[:,-1]),(a['id'],'fill seam')
assert len(colors)<=31,len(colors)
assert all(a['id'].startswith('D_') for a in assets)
report={'batch':'stadt','status':'passed','assetCount':len(assets),'sharedVisibleColors':len(colors),'populatedRegions':region_count,'animations':anim_count,'checks':['exact filenames','dimensions','indexed PNG','binary alpha','shared palette','grid','region bounds and occupancy','animation variation','animation baselines','compatible autotile edges','repeatable autotile fills'],'runtimeTested':False}
(ROOT/'docs/art/validation-stadt.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'PASS: {len(assets)} exact filenames; indexed PNGs; {len(colors)} shared visible colors; binary alpha; dimensions/grid; {region_count} populated regions; {anim_count} distinct-frame animations; repeatable autotile fills.')
