#!/usr/bin/env python3
"""Validate exported Batch C without access to the original generator images."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
manifest=json.loads((ROOT/'public/sprites/manifest-welt.json').read_text())
spec=json.loads((ROOT/'docs/art/batch-welt-generation.json').read_text())
expected={j['path']:j for j in spec['assets']}
assert len(expected)==85
assert len(manifest['assets'])==85
assert {a['file'] for a in manifest['assets']}==set(expected)
palette={tuple(bytes.fromhex(c[1:])) for c in spec['palette']}
assert len(palette)<=32
report=[]
for a in manifest['assets']:
    p=ROOT/'public/sprites'/a['file'];im=Image.open(p)
    assert im.mode=='P',(p,'not indexed')
    assert im.size==(a['width'],a['height']),p
    rgba=np.array(im.convert('RGBA'));alpha=rgba[:,:,3]
    assert set(np.unique(alpha))<={0,255},p
    if not a['transparent']:assert np.all(alpha==255),p
    colors={tuple(c) for c in rgba[:,:,:3][alpha>0]}
    assert colors<=palette,(p,'unexpected colors')
    fw,fh,cols,rows=[a[k] for k in ['frameWidth','frameHeight','columns','rows']]
    assert (fw*cols,fh*rows)==im.size,(p,'grid')
    def frame(i):
        assert 0<=i<cols*rows,(p,i)
        x=(i%cols)*fw;y=(i//cols)*fh
        return rgba[y:y+fh,x:x+fw]
    for name,anim in a.get('animations',{}).items():
        assert anim['frameRate']>0
        samples=[]
        for i in anim['frames']:
            cell=frame(i);assert cell[:,:,3].any(),(p,name,i,'empty')
            samples.append(cell.tobytes())
        assert len(set(samples))>1,(p,name,'identical animation')
    for names in [a.get('expressions',{}),dict(enumerate(a.get('frameNames',[])))]:
        for i in range(len(names)):assert frame(i)[:,:,3].any(),(p,'empty static frame',i)
    if a['file'].startswith('characters/'):
        for i in range(cols*rows):
            cell=frame(i);ys,xs=np.where(cell[:,:,3]>0)
            assert len(ys)>0 and ys.max()==30,(p,i,'baseline')
            assert not cell[-1,:,3].any(),(p,i,'bottom boundary')
    regs=a.get('regions',{});occupied=set()
    for name,r in regs.items():
        x,y,w,h=[r[k] for k in ['x','y','width','height']]
        assert all(v%16==0 for v in [x,y,w,h]),(p,name,'unaligned')
        assert 0<=x and 0<=y and x+w<=im.width and y+h<=im.height,(p,name)
        pixels={(xx,yy) for yy in range(y,y+h,16) for xx in range(x,x+w,16)}
        assert not occupied&pixels,(p,name,'overlap');occupied|=pixels
        assert alpha[y:y+h,x:x+w].any(),(p,name,'empty region')
    for name,anim in a.get('regionAnimations',{}).items():
        sizes=set();samples=[]
        for n in anim['regions']:
            r=regs[n];x,y,w,h=[r[k] for k in ['x','y','width','height']]
            sizes.add((w,h));samples.append(rgba[y:y+h,x:x+w].tobytes())
        assert len(sizes)==1,(p,name,'inconsistent frame size')
        assert len(set(samples))>1,(p,name,'identical frames')
    for family in a.get('seamFamilies',[]):
        samples=[]
        for n in family:
            r=regs[n];x,y=r['x'],r['y'];cell=rgba[y:y+16,x:x+16]
            assert np.array_equal(cell[0],cell[-1]) and np.array_equal(cell[:,0],cell[:,-1]),(p,n,'opposite edges')
            samples.append(cell[0].tobytes()+cell[:,0].tobytes())
        assert len(set(samples))==1,(p,'terrain variant edges')
    if a['id']=='C_08_weather':
        for row in [0,1,2,3,5]:
            for col in [4,5]:assert not frame(row*6+col)[:,:,3].any(),(p,'padding')
        for col in range(4):
            cell=frame(30+col);ys,xs=np.where(cell[:,:,3]>0)
            assert xs.min()>=24 and xs.max()<40 and ys.min()>=24 and ys.max()<40,(p,'splash bounds')
    report.append({'file':a['file'],'size':list(im.size),'visibleColors':len(colors),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
result={'batch':'welt','sheets':len(report),'checks':'PASS','files':report}
(ROOT/'docs/art/welt-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print('PASS: 85 indexed PNG sheets; dimensions, palette, binary alpha, frames, baselines, regions, animation variation, weather padding and terrain edges.')
