#!/usr/bin/env python3
"""Validate Batch H and rebuild review sheets. Requires Pillow and numpy."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[2];SPR=ROOT/'public/sprites';DOC=ROOT/'docs/art'
m=json.loads((SPR/'manifest-journal.json').read_text());assets=m['assets'];checks=0
def check(value,message):
    global checks
    assert value,message
    checks+=1
def rgba(p):return Image.open(SPR/p).convert('RGBA')
check(len(assets)==96,'96 requested PNG exports')
check(len({a['file'] for a in assets})==96,'unique paths')
check(len({a['id'] for a in assets})==96,'unique manifest ids')
allowed={tuple(bytes.fromhex(h[1:])) for h in m['palette']};union=set();hashes={}
for a in assets:
    p=SPR/a['file'];im=Image.open(p);v=np.array(im.convert('RGBA'));h,w=v.shape[:2]
    check(im.mode=='P',a['file']+' indexed')
    check((w,h)==(a['width'],a['height']),a['file']+' size')
    check(set(np.unique(v[:,:,3]))<={0,255},a['file']+' binary alpha')
    if not a['transparent']:check(bool((v[:,:,3]==255).all()),a['file']+' opaque')
    colors={tuple(c) for c in v[v[:,:,3]>0,:3]};union|=colors
    check(colors<=allowed,a['file']+' shared palette')
    check(bool(colors),a['file']+' nonempty')
    hashes[a['file']]=hashlib.sha256(p.read_bytes()).hexdigest()
    if 'columns' in a:
        fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows']
        check((w,h)==(fw*cols,fh*rows),a['file']+' grid')
        for idx in a.get('paddingFrames',[]):
            frame=v[(idx//cols)*fh:(idx//cols+1)*fh,(idx%cols)*fw:(idx%cols+1)*fw]
            check(not frame[:,:,3].any(),a['file']+' padding '+str(idx))
        for name,anim in a.get('animations',{}).items():
            frames=[]
            for idx in anim['frames']:
                check(0<=idx<cols*rows,a['file']+' frame range')
                f=v[(idx//cols)*fh:(idx//cols+1)*fh,(idx%cols)*fw:(idx%cols+1)*fw]
                check(bool(f[:,:,3].any()),a['file']+' occupied '+str(idx))
                if 'baselineY' in a:
                    check(np.where(f[:,:,3]>0)[0].max()==a['baselineY'],'player baseline '+str(idx))
                frames.append(hashlib.sha256(f.tobytes()).hexdigest())
            check(len(set(frames))>1,a['file']+' animation variation '+name)
            check(anim['frameRate']>0,a['file']+' frame rate')
    rectangles=[]
    for name,(x,y,rw,rh) in a.get('regions',{}).items():
        check(x>=0 and y>=0 and x+rw<=w and y+rh<=h,a['file']+' region '+name)
        check(bool(v[y:y+rh,x:x+rw,3].any()),a['file']+' occupied region '+name)
        for ox,oy,ow,oh in rectangles:check(x+rw<=ox or ox+ow<=x or y+rh<=oy or oy+oh<=y,a['file']+' region separation')
        rectangles.append((x,y,rw,rh))
    for name,(x,y,rw,rh) in a.get('apertures',{}).items():check(not v[y:y+rh,x:x+rw,3].any(),'clear aperture '+name)
    if 'frameNames' in a:
        for i,id in enumerate(a['frameNames']):check(np.array_equal(v[:,i*24:(i+1)*24],np.array(rgba('ui/heads/'+id+'.png'))),'head atlas '+id)
check(len(union)<=31,'31 visible palette colors')
src=np.array(rgba('ui/H_quellen.png'))
for name,(x,y,w,h) in next(a for a in assets if a['file']=='ui/H_quellen.png')['regions'].items():
    id,sz=name.rsplit('_',1)
    check(np.array_equal(src[y:y+h,x:x+w],np.array(rgba('ui/sources/'+('24/' if sz=='24' else '')+id+'.png'))),'source atlas '+name)
fx=rgba('fx/H_06_risiko.png')
for r in range(2):
    for c in range(6):check(fx.crop((c*480+96,r*270+54,c*480+384,r*270+216)).getchannel('A').getbbox() is None,'clear overlay center')
ids=['verlorenes_gesangbuch','spiegelscherbe','glocke','stimmphiole','sternsplitter','taschenuhr']
for id in ids:check(hashes[f'ui/inspect/{id}.png']!=hashes[f'ui/inspect/{id}_fluch.png'],'different curse variant '+id)

# Review sheets use neutral backdrops, preserving native hard-edged pixels.
NN=Image.Resampling.NEAREST
def paste_scaled(target,path,x,y,scale):
    im=rgba(path);im=im.resize((im.width*scale,im.height*scale),NN);target.paste(im,(x,y),im)
im=Image.new('RGB',(1080,1100),'#303b49');d=ImageDraw.Draw(im)
for n in range(1,7):
    paste_scaled(im,f'ui/H_koepfe_{n}.png',12,(n-1)*120+22,4);d.text((12,(n-1)*120+5),f'Gruppe {n}',fill='#eee2c5')
paste_scaled(im,'characters/H_player_untersuchen.png',820,28,2)
paste_scaled(im,'ui/H_quellen.png',12,750,3)
paste_scaled(im,'ui/H_journal_rahmen.png',12,900,2)
paste_scaled(im,'ui/H_06_risiko_icons.png',300,900,3)
paste_scaled(im,'props/H_07_fundbuero.png',580,900,4)
paste_scaled(im,'items/32/verlorenes_gesangbuch.png',800,550,3)
paste_scaled(im,'items/32/spiegelscherbe.png',920,550,3)
im.save(DOC/'journal-preview.png')
im=Image.new('RGB',(640,1440),'#303b49')
for i,id in enumerate(ids):
    for k,suf in enumerate(['','_fluch']):paste_scaled(im,f'ui/inspect/{id}{suf}.png',k*320,i*240,2)
im.save(DOC/'journal-inspect-preview.png')
im=Image.new('RGB',(960,540),'#b4ac91')
for i in range(4):
    p=fx.crop((2*480,i*270,3*480,(i+1)*270));im.paste(p,((i%2)*480,(i//2)*270),p)
im.save(DOC/'journal-fx-preview.png')
result={'batch':'journal','passed':True,'checks':checks,'pngCount':len(assets),'visibleColors':len(union),'sha256':hashes,'runtimeTested':False}
(DOC/'journal-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='sha256'}))
