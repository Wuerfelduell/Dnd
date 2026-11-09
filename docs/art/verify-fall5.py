"""Validate delivery contracts for Batch J. Run from any directory."""
from pathlib import Path
from PIL import Image
import json, hashlib

ROOT=Path(__file__).resolve().parents[2];SPR=ROOT/'public/sprites'
spec=json.loads((ROOT/'docs/art/batch-fall5-generation.json').read_text())
manifest=json.loads((SPR/'manifest-fall5.json').read_text());assets=manifest['assets']
errors=[];checks=0
def check(ok,msg):
    global checks
    checks+=1
    if not ok:errors.append(msg)
def crop(im,r):return im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']))
allowed={tuple(bytes.fromhex(c[1:])) for c in spec['palette']};allcolors=set()
expected={j['file']:j['size'] for j in spec['jobs']}
for j in spec['jobs']:
    if j['kind']=='items':
        for item in j['items']:
            for n,folder in [(16,'items'),(32,'items/32')]:expected[f'{folder}/{item["id"]}.png']=[n,n]
check(len(assets)==84,f'Expected 84 PNGs, got {len(assets)}')
check({a['file'] for a in assets}==set(expected),'Manifest paths differ from requested paths')
byfile={a['file']:a for a in assets};nonempty=0;animationcount=0
for a in assets:
    path=SPR/a['file'];check(path.exists(),f'Missing {path}')
    if not path.exists():continue
    im=Image.open(path).convert('RGBA');check(list(im.size)==expected[a['file']],f'{a["id"]}: wrong dimensions')
    colors=set(im.getdata());visible={p[:3] for p in colors if p[3]};allcolors|=visible
    check(visible<=allowed,f'{a["id"]}: colors outside shared palette')
    check({p[3] for p in colors}<={0,255},f'{a["id"]}: partial alpha')
    check(bool(im.getbbox()),f'{a["id"]}: empty image')
    if not a['transparent']:check(all(p[3]==255 for p in colors),f'{a["id"]}: background not opaque')
    fw,fh,c,r=[a[k] for k in ('frameWidth','frameHeight','columns','rows')]
    check((fw*c,fh*r)==im.size,f'{a["id"]}: grid does not cover image')
    if a.get('occupiedCounts'):
        for row,n in enumerate(a['occupiedCounts']):
            for col in range(c):
                f=im.crop((col*fw,row*fh,(col+1)*fw,(row+1)*fh));b=f.getbbox()
                check(bool(b)==(col<n),f'{a["id"]}: occupied/padding mismatch {row},{col}')
                if b:
                    nonempty+=1
                    check(b[0]>0 and b[1]>0 and b[2]<fw and b[3]<fh,f'{a["id"]}: frame touches border {row},{col}')
                    if a.get('floating'):check(b[3]<=fh-5,f'{a["id"]}: floating feet too low')
                    else:check(b[3]==a['baseline'],f'{a["id"]}: baseline mismatch {row},{col}')
            if row in a.get('heldRows',[]):
                f0=im.crop((0,row*fh,fw,(row+1)*fh));f1=im.crop((fw,row*fh,2*fw,(row+1)*fh));check(f0.tobytes()==f1.tobytes(),f'{a["id"]}: windup not held twice')
    for name,reg in a.get('regions',{}).items():
        check(reg['x']>=0 and reg['y']>=0 and reg['x']+reg['width']<=im.width and reg['y']+reg['height']<=im.height,f'{a["id"]}/{name}: region bounds')
        check(bool(crop(im,reg).getbbox()) or name in a.get('intentionalEmptyRegions',[]),f'{a["id"]}/{name}: empty region')
    for name,anim in a['animations'].items():
        animationcount+=1;frames=[]
        for f in anim['frames']:
            if isinstance(f,int):
                check(0<=f<c*r,f'{a["id"]}/{name}: frame index');f=rect={'x':f%c*fw,'y':f//c*fh,'width':fw,'height':fh}
            frames.append(crop(im,f))
        check(any(f.getbbox() for f in frames),f'{a["id"]}/{name}: empty animation')
        check(len({f.tobytes() for f in frames})>=2,f'{a["id"]}/{name}: no visible animation')
    if a.get('atlas'):
        atlas=byfile.get(a['atlas']);check(bool(atlas),f'{a["id"]}: missing atlas')
        if atlas:
            expectedicon=crop(Image.open(SPR/a['atlas']).convert('RGBA'),atlas['regions'][a['atlasRegion']]);check(im.tobytes()==expectedicon.tobytes(),f'{a["id"]}: standalone differs from atlas')
check(len(allcolors)<=31,'Batch exceeds 31 opaque + 1 transparent palette entries')
phase1=json.loads((SPR/'manifest-kampf2.json').read_text());p1=next(a for a in phase1['assets'] if a['id']=='enemy_miriam');p2=byfile.get('battle/enemy_miriam_glocke.png',{})
check(all(p1.get(k)==p2.get(k) for k in ['frameWidth','frameHeight','baseline','columns','rows']),'Miriam phase 2 registration differs from phase 1')
report=dict(batch='fall5',passed=not errors,pngs=len(assets),checks=checks,visibleColors=len(allcolors),registeredCharacterFrames=nonempty,animations=animationcount,errors=errors)
(ROOT/'docs/art/batch-fall5-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
