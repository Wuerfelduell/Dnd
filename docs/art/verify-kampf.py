"""Validate exported combat artwork and its animation/atlas contract."""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from importlib.util import spec_from_file_location, module_from_spec

ROOT=Path(__file__).resolve().parents[2]
s=spec_from_file_location('export_kampf',ROOT/'docs/art/export-kampf.py'); exp=module_from_spec(s);s.loader.exec_module(exp)
manifest=json.loads((ROOT/'public/sprites/manifest-kampf.json').read_text())
spec=json.loads((ROOT/'docs/art/batch-kampf-generation.json').read_text())
jobs={j['id']:j for j in spec['jobs']}
errors=[]
def check(condition,message):
    if not condition:errors.append(message)
check(len(manifest['assets'])==53,'Expected 53 assets')
check(len(jobs)==53,'Expected 53 generation jobs')
visible=set(); frames=0
for a in manifest['assets']:
    path=ROOT/'public/sprites'/a['file'];name=a['id'];j=jobs[name]
    check(path.is_file(),name+': missing PNG')
    if not path.is_file():continue
    im=Image.open(path);check(im.size==(a['width'],a['height']),name+': incorrect dimensions')
    check(im.mode=='P',name+': expected indexed PNG')
    rgba=np.array(im.convert('RGBA'));alpha=rgba[:,:,3]
    check(set(np.unique(alpha))<={0,255},name+': fractional alpha')
    colors={tuple(c) for c in rgba[alpha>0,:3]};visible |= colors
    check(len(colors)<=32,name+': palette >32 colors')
    check(colors<=set(map(tuple,exp.RGB)),name+': palette mismatch')
    if not a['transparent']:check(bool((alpha==255).all()),name+': background not opaque')
    if j.get('counts'):
        cell=j['cell'];cols=j['columns']
        for r,count in enumerate(j['counts']):
            for c in range(cols):
                mask=alpha[r*cell:(r+1)*cell,c*cell:(c+1)*cell]
                if c<count:
                    check(bool(mask.any()),f'{name}: blank frame {r*cols+c}')
                    frames+=1
                    if j['kind'] in ['enemy','player']:
                        check(not mask[0].any() and not mask[-1].any() and not mask[:,0].any() and not mask[:,-1].any(),f'{name}: frame boundary {r*cols+c}')
                        if mask.any():check(int(np.where(mask)[0].max())==cell-4,f'{name}: baseline {r*cols+c}')
                else:check(not mask.any(),f'{name}: padding frame {r*cols+c} not empty')
    if j['kind']=='enemy':
        cell=j['cell']
        for r in (1,2):check(np.array_equal(rgba[r*cell:(r+1)*cell,:cell],rgba[r*cell:(r+1)*cell,cell:2*cell]),f'{name}: windup not held')
    for n,animation in a.get('animations',{}).items():
        limit=a['columns']*a['rows']
        check(all(0<=i<limit for i in animation['frames']),f'{name}/{n}: invalid frame index')
    for n,r in a.get('regions',{}).items():
        x,y,w,h=[r[k] for k in ['x','y','width','height']]
        check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,f'{name}/{n}: region outside atlas')
        check(bool(alpha[y:y+h,x:x+w].any()),f'{name}/{n}: empty region')
    if name.startswith('transition_'):
        final=alpha[:,5*480:6*480]
        check(bool((final==(255 if name=='transition_in' else 0)).all()),name+': incorrect final coverage')
check(len(visible)<=32,'Batch palette exceeds 32 visible colors')
skills=json.loads((ROOT/'src/data/pathways.json').read_text())
def ids(value):
    found=set()
    if isinstance(value,dict):
        if isinstance(value.get('id'),str):found.add(value['id'])
        for v in value.values():found |= ids(v)
    elif isinstance(value,list):
        for v in value:found |= ids(v)
    return found
skill_ids={j['gameId'] for j in jobs.values() if j['kind']=='effect'}
check(len(skill_ids)==21,'Expected 21 unique skill effects')
check(skill_ids<=ids(skills),'Skill ID absent from pathways.json')
icons=next(a for a in manifest['assets'] if a['id']=='skill_icons')['icons']
check(set(icons)==skill_ids,'Skill icons/effects mismatch')
if errors:raise SystemExit('\n'.join(errors))
print(f"PASS: 53 assets, 21 skill IDs, {frames} declared occupied frames, 32-color palette, binary alpha, padding, baselines, windups and atlas bounds")
