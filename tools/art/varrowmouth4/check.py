#!/usr/bin/env python3
"""CZ delivery validation, using Pillow only (no generator/network dependencies)."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites'
manifest=json.loads((SPR/'manifest-varrowmouth4.json').read_text())
spec=json.loads(Path(__file__).with_name('spec.json').read_text())
expected={}
for i,(gid,w,h,_,rows) in enumerate(spec['characters']):
    expected[f'battle/enemy_{gid}.png']=(w*6,h*len(rows))
    if i<7:
        expected[f'characters/{gid}.png']=(128 if gid=='vme_hafenkraehe' else 64,128)
        expected[f'portraits/heads/{gid}.png']=(24,24)
        expected[f'ui/bestiar/{gid}.png']=(48,48)
for gid,w,h,n,_ in spec['effects']:expected[('props/' if gid=='vm_wrackmutter_wrack' else 'fx/')+gid+'.png']=(w*n,h)
palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
errors=[];results=[];checks=0
def check(ok,msg):
    global checks
    checks+=1
    if not ok:errors.append(msg)
assets=manifest['assets'];files=[a['file'] for a in assets]
check(len(files)==len(set(files)),'Duplicate asset file');check(set(files)==set(expected),'Required asset set differs')
check(len(assets)==41,'Expected 41 PNGs');check(len({a['id'] for a in assets})==len(assets),'Duplicate manifest ID')
for a in assets:
    f=a['file'];p=SPR/f
    check(p.exists(),f+' missing')
    if not p.exists():continue
    source=Image.open(p);im=source.convert('RGBA');w,h=im.size;fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows']
    check(source.mode=='P',f+' must be indexed');check(im.size==expected[f],f+' wrong dimensions');check(im.size==(a['width'],a['height']),f+' manifest size');check(w==fw*cols and h==fh*rows,f+' raster')
    colors=im.getcolors(w*h);visible={c[:3] for n,c in colors if c[3]}
    alpha={c[3] for n,c in colors};check(alpha=={0,255},f+' binary alpha and transparency');check(len(visible)<=32,f+' color count');check(visible<=palette,f+' shared palette')
    check(all(c[:3]==(0,0,0) for n,c in colors if c[3]==0),f+' hidden RGB fringe')
    cells=[]
    for y in range(rows):
        for x in range(cols):
            c=im.crop((x*fw,y*fh,(x+1)*fw,(y+1)*fh));cells.append(c);bb=c.getbbox()
            occupied=x<a['occupiedCounts'][y]
            check(bool(bb)==occupied,f+f' frame {y*cols+x} occupancy')
            if bb:
                check(bb[0]>0 and bb[1]>=0 and bb[2]<fw and bb[3]<fh,f+f' frame {y*cols+x} cell boundary')
                if 'baseline' in a:check(bb[3]==a['baseline'],f+f' frame {y*cols+x} baseline')
    for name,animation in a['animations'].items():
        check(len(animation['frames'])>0 and all(0<=i<len(cells) for i in animation['frames']),f+' frame indices '+name)
        check(animation['frameRate']>0 and animation['repeat'] in [-1,0],f+' timing '+name)
        if len(animation['frames'])>1:check(len({cells[i].tobytes() for i in animation['frames']})>=2,f+' static animation '+name)
    for row in a.get('heldRows',[]):check(cells[row*cols].tobytes()==cells[row*cols+1].tobytes(),f+' held windup '+str(row))
    for name,r in a['regions'].items():check(r['x']>=0 and r['y']>=0 and r['x']+r['width']<=w and r['y']+r['height']<=h,f+' region '+name)
    results.append(dict(file=f,width=w,height=h,visibleColors=len(visible),frames=len(cells),sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
generation=json.loads((ROOT/'docs/art/batch-varrowmouth4-generation.json').read_text())
check(len(generation['sources'])==27,'Expected 27 independent generated source sheets')
check(all(s['prompt'].startswith('STYLE GUIDE') and s['sourceSha256'] for s in generation['sources']),'Prompt provenance')
for p in ['docs/art/batch-varrowmouth4-preview.png','docs/story/k6_gegner/encounters.json','docs/story/k6_gegner/bosses.json']:
    check((ROOT/p).exists(),p+' missing')
report=dict(batch='varrowmouth4',status='passed' if not errors else 'failed',checks=checks,assetCount=len(assets),sourceCount=len(generation['sources']),errors=errors,assets=results,scope='Raster, palette, alpha, bounds, baselines, animation changes, held frames, manifest completeness. Semantic art direction reviewed visually; no runtime integration claim.')
(ROOT/'docs/art/batch-varrowmouth4-validation.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(f'varrowmouth4: {len(assets)} PNGs, {checks} checks, {len(errors)} errors.')
for e in errors:print('ERROR: '+e)
sys.exit(bool(errors))
