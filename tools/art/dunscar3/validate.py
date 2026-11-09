#!/usr/bin/env python3
"""Validate the delivered PNGs and manifest; generate review contact sheets."""
import hashlib
import json
from pathlib import Path
from collections import Counter
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[3]
SPR=ROOT/'public/sprites'
ART=ROOT/'docs/art'
manifest=json.loads((SPR/'manifest-dunscar3.json').read_text())
defs=json.loads((ART/'dunscar3-source-spec.json').read_text())
errors=[];results=[]
def check(ok,message):
    if not ok:errors.append(message)

assets=manifest['assets'];byfile={a['file']:a for a in assets}
check(len(byfile)==len(assets),'duplicate file paths')
check(len({a['id'] for a in assets})==len(assets),'duplicate asset ids')
palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
for a in assets:
    path=SPR/a['file'];check(path.exists(),f'missing {path}')
    if not path.exists():continue
    source=Image.open(path);im=source.convert('RGBA')
    check(source.mode=='P',f'{path}: not indexed')
    check(im.size==(a['width'],a['height']),f'{path}: size mismatch')
    check(im.size==(a['columns']*a['frameWidth'],a['rows']*a['frameHeight']),f'{path}: grid mismatch')
    colors=set(im.get_flattened_data());visible={c[:3] for c in colors if c[3]}
    check({c[3] for c in colors}<={0,255},f'{path}: nonbinary alpha')
    check(visible<=palette,f'{path}: out-of-palette pixels')
    check(len(visible)<=32,f'{path}: too many colors')
    fw,fh=a['frameWidth'],a['frameHeight'];cols=a['columns'];cells=[]
    for i in range(cols*a['rows']):cells.append(im.crop(((i%cols)*fw,(i//cols)*fh,(i%cols+1)*fw,(i//cols+1)*fh)))
    if a['kind'] in ['battle','walk']:
        for row,n in enumerate(a['occupiedCounts']):
            for col in range(cols):
                cell=cells[row*cols+col];bb=cell.getbbox()
                check(bool(bb)==(col<n),f'{path}: occupancy {row}/{col}')
                if bb:
                    check(bb[0]>0 and bb[1]>0 and bb[2]<fw and bb[3]==a['baseline'],f'{path}: margins/baseline {row}/{col}: {bb}')
            seq=cells[row*cols:row*cols+n]
            check(len({c.tobytes() for c in seq})>=2,f'{path}: static animation row {row}')
        for row in a.get('heldRows',[]):check(cells[row*cols].tobytes()==cells[row*cols+1].tobytes(),f'{path}: windup not held')
        for name,anim in a['animations'].items():
            check(all(0<=i<len(cells) and cells[i].getbbox() for i in anim['frames']),f'{path}: bad animation {name}')
    results.append(dict(file=a['file'],size=list(im.size),visibleColors=len(visible),sha256=hashlib.sha256(path.read_bytes()).hexdigest()))

for idx,(gid,fw,fh,_,phase) in enumerate(defs):
    for path in [f'battle/enemy_{gid}.png',f'characters/F_ow_{gid}.png',f'ui/bestiary/F_{gid}.png']:
        check(path in byfile,f'missing family asset {path}')
    if idx>=6:check(f'ui/DS_boss_{gid}.png' in byfile,f'missing boss band {gid}')
    a=byfile[f'battle/enemy_{gid}.png']
    check((a['frameWidth'],a['frameHeight'])==(fw,fh),f'wrong battle frame size {gid}')
    if phase:check('phase2' in a['animations'],f'phase2 missing {gid}')
    if gid=='unterschicht':check(all(p in a['animations'] for p in ['phase1','phase2','phase3']),'three phases missing')

symbols=Image.open(SPR/'ui/ds_rufmuster.png').convert('RGBA')
small=[symbols.crop((i*16,0,(i+1)*16,16)).tobytes() for i in range(16)]
check(len(set(small))==16,'rufmuster symbols are not unique')
big=Image.open(SPR/'ui/ds_rufmuster_32.png').convert('RGBA')
check(big.tobytes()==symbols.resize((512,32),Image.Resampling.NEAREST).tobytes(),'32px symbols differ from 16px')
check(Counter(a['kind'] for a in assets)==dict(battle=21,walk=21,bestiary=21,bossBand=15,symbols=2,frames=2,charges=1,hud=1),'unexpected asset counts')

# One review card per opponent: idle, attack, defeat, phase2/3 and all four map views.
cardw,cardh=360,230
for group,start,end in [('normal',0,6),('story',6,11),('trials',11,21)]:
    count=end-start;canvas=Image.new('RGB',(cardw*3,cardh*((count+2)//3)),'#35424a');draw=ImageDraw.Draw(canvas)
    for offset,(gid,fw,fh,_,phase) in enumerate(defs[start:end]):
        x=(offset%3)*cardw;y=(offset//3)*cardh;draw.text((x+8,y+8),gid,fill='#e7dfc5')
        battle=Image.open(SPR/f'battle/enemy_{gid}.png').convert('RGBA')
        a=byfile[f'battle/enemy_{gid}.png'];indices=[0,9,21]+([27,39] if gid=='unterschicht' else [27] if phase else [])
        for j,index in enumerate(indices):
            im=battle.crop(((index%6)*fw,(index//6)*fh,(index%6+1)*fw,(index//6+1)*fh));im.thumbnail((68,90),Image.Resampling.NEAREST)
            canvas.paste(im,(x+6+j*70,y+35),im)
        walk=Image.open(SPR/f'characters/F_ow_{gid}.png').convert('RGBA')
        for r in range(4):
            im=walk.crop((0,r*32,16,(r+1)*32)).resize((32,64),Image.Resampling.NEAREST);canvas.paste(im,(x+15+r*50,y+140),im)
        draw.text((x+8,y+211),'unten    links    rechts   oben',fill='#d4d0bc')
    canvas.save(ART/f'batch-dunscar3-preview-{group}.png')
ui=Image.new('RGB',(560,180),'#35424a');draw=ImageDraw.Draw(ui)
ui.paste(big,(16,20),big)
for name,xy in [('ds_rufmuster_rahmen_32',(16,70)),('ds_rufladungen',(150,70)),('ds_horchen',(240,70))]:
    im=Image.open(SPR/f'ui/{name}.png').convert('RGBA');ui.paste(im,xy,im)
ui.save(ART/'batch-dunscar3-preview-ui.png')
report=dict(batch='dunscar3',passed=not errors,assetCount=len(assets),errors=errors,checks=['exact family coverage and dimensions','indexed global palette <=32 visible colors','binary alpha','occupied/empty frame cells','transparent cell borders and fixed baseline','two-frame held windups','nonstatic animation rows','animation indices','required phase rows','unique 16 symbols; exact 2x variants'],files=results)
(ART/'batch-dunscar3-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(dict(passed=not errors,assetCount=len(assets),errors=errors),indent=2))
raise SystemExit(bool(errors))
