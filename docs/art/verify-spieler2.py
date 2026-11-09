#!/usr/bin/env python3
"""Validate AH deliverables; does not require generator originals."""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];SPRITES=ROOT/'public/sprites'
manifest=json.loads((SPRITES/'manifest-spieler2.json').read_text())
specs=json.loads((HERE/'spieler2-specs.json').read_text())
checks=[];errors=[]
def check(ok,label):
    checks.append(label)
    if not ok: errors.append(label)
check({a['file'] for a in manifest['assets']}=={a['file'] for a in specs},'all33 requested assets present')
palette=None;visible=set();images={}
for a in manifest['assets']:
    path=SPRITES/a['file'];check(path.exists(),a['id']+' file')
    if not path.exists():continue
    raw=Image.open(path);im=raw.convert('RGBA');images[a['id']]=im
    check(im.size==(a['width'],a['height']),a['id']+' dimensions')
    check(raw.mode=='P',a['id']+' indexed')
    if palette is None:palette=raw.getpalette()
    check(raw.getpalette()==palette,a['id']+' shared palette')
    ar=np.array(im);colors=set(map(tuple,ar[ar[:,:,3]>0,:3]));visible|=colors
    check(len(colors)<=32,a['id']+'32 colors')
    check(set(np.unique(ar[:,:,3])).issubset({0,255}),a['id']+' binary alpha')
    check((ar[:,:,3]==255).all() if not a['transparent'] else (ar[:,:,3]==0).any(),a['id']+' opacity')
    if a['kind']=='figure':
        fw,fh,cols=a['frameWidth'],a['frameHeight'],a['columns'];used=set()
        for name,anim in a['animations'].items():
            frames=anim['frames'];hashes=[]
            for index in frames:
                check(0<=index<cols*a['rows'],a['id']+' valid frame '+str(index));used.add(index)
                f=im.crop(((index%cols)*fw,(index//cols)*fh,(index%cols+1)*fw,(index//cols+1)*fh));box=f.getbbox()
                check(box is not None,a['id']+' occupied '+str(index))
                if box:
                    check(box[3]==a['baseline'],a['id']+' baseline '+str(index))
                    check(box[0]>=1 and box[2]<=fw-1 and box[1]>=a.get('topPadding',1),a['id']+' cell margin '+str(index))
                hashes.append(hashlib.sha256(f.tobytes()).hexdigest())
            check(len(set(hashes))>=2,a['id']+' '+name+' animation variation')
        for index in set(range(cols*a['rows']))-used:
            f=im.crop(((index%cols)*fw,(index//cols)*fh,(index%cols+1)*fw,(index//cols+1)*fh))
            check(f.getbbox() is None,a['id']+' empty padding '+str(index))
    if a['kind']=='portrait':
        hashes=[im.crop((i*64,0,(i+1)*64,64)).tobytes() for i in range(4)]
        check(len(set(hashes))==4,a['id']+' four distinct moods')
    for name,(x,y,w,h) in a.get('regions',{}).items():
        check(x>=0 and y>=0 and x+w<=im.width and y+h<=im.height,a['id']+' bounds '+name)
        check(im.crop((x,y,x+w,y+h)).getbbox() is not None,a['id']+' occupied region '+name)
check(len(visible)<=32,'global palette <=32')
ui=next(a for a in manifest['assets'] if a['id']=='AH_koop');uim=images['AH_koop']
for prefix in ['p1_flag','p2_flag']:
    parts=[]
    for i in range(2):
        x,y,w,h=ui['regions'][prefix+'_'+str(i)];parts.append(uim.crop((x,y,x+w,y+h)).tobytes())
    check(parts[0]!=parts[1],prefix+' waves at8x8')
fx=images['AH_kombi'];check(len({fx.crop((i*64,0,(i+1)*64,48)).tobytes() for i in range(8)})==8,'eight different combo phases')
for v in ['p2a','p2b']:
    a=next((a for a in manifest['assets'] if a['id']==v+'_skills'),None)
    check(a is not None and list(a['animations'])==['lantern','thread','mask','echo','cauldron','iron','key','sq_waage','sq_moor','sq_uhr'],v+' all10 paths ordered')
for suffix in ['walk','actions','extras','drink','untersuchen','torfkittel','fischerjacke','akademierobe','battle','skills','weapons','emotions','emotions2','head','zug']:
    a,b=images.get('p2a_'+suffix),images.get('p2b_'+suffix)
    check(a is not None and b is not None and a.tobytes()!=b.tobytes(),'different identities '+suffix)
report=dict(batch='spieler2',assets=len(images),checks=len(checks),passed=len(checks)-len(errors),errors=errors,visibleColors=len(visible))
(HERE/'validation-spieler2.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
if errors:raise SystemExit(1)

# Contact sheets use nearest-neighbor enlargement over a light neutral backdrop.
for group,ids,cols,scale in [
 ('figures',[v+'_'+s for s in ['walk','actions','extras','drink','untersuchen','torfkittel','fischerjacke','akademierobe'] for v in ['p2a','p2b']],4,3),
 ('portraits',[v+'_'+s for s in ['emotions','emotions2','head','zug'] for v in ['p2a','p2b']],2,2),
 ('ui',['AH_koop','AH_kombi','AH_wahl'],1,2),
 ('battle-a',['p2a_battle','p2a_skills','p2a_weapons'],3,2),
 ('battle-b',['p2b_battle','p2b_skills','p2b_weapons'],3,2)]:
    cw=max(images[k].width for k in ids)*scale+20;ch=max(images[k].height for k in ids)*scale+35
    out=Image.new('RGB',(cw*cols,ch*((len(ids)+cols-1)//cols)),'#b7bcb6');draw=ImageDraw.Draw(out)
    for i,key in enumerate(ids):
        x=(i%cols)*cw+10;y=(i//cols)*ch+24;im=images[key].resize((images[key].width*scale,images[key].height*scale),Image.Resampling.NEAREST)
        out.paste(im,(x,y),im);draw.text((x,y-17),key,fill='#1a1c2c')
    out.save(HERE/('preview-spieler2-'+group+'.png'))
