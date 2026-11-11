from lib import *
import numpy as np, json, os
from PIL import Image
import phelp as P
C=P.C
os.makedirs('out/ui/scenes',exist_ok=True); os.makedirs('out/battle',exist_ok=True)
def opaque(raw, size, out):
    im=Image.open(f'raw/{raw}.jpg').convert('RGB')
    rgb=mode_down(im,size,blur=1)
    save_png(np.dstack([rgb,np.full(rgb.shape[:2],255,np.uint8)]), out)
meta={}
for n in ['bh_ankunft','kapitel5_karte']:
    opaque('s_'+n,(480,270),f'out/ui/scenes/{n}.png'); meta[n]=('ui/scenes/%s.png'%n,'still')
for n in ['bh_trockenraum','bh_pfirsich','bh_ende_wahl','bh_ende_winter','bh_ende_verwahrt','bh_ende_schmerzlos','bh_ende_schmerzlos_lichtmeister']:
    opaque('s_'+n,(240,135),f'out/ui/scenes/{n}.png'); meta[n]=('ui/scenes/%s.png'%n,'still')
for n in ['bg_bh_kutschenhof','bg_bh_kesselgrund_kalt','bg_bh_kesselgrund_warm','bg_bh_promenade','bg_bh_glasgaerten_kalt','bg_bh_glasgaerten_warm','bg_bh_stillenhaeuser','bg_bh_wurzelkranz','bg_bh_verteilanlage']:
    opaque('b_'+n,(480,270),f'out/battle/{n}.png'); meta[n]=('battle/%s.png'%n,'background')
opaque('m_bh_karte',(480,270),'out/ui/bh_karte.png'); meta['bh_karte']=('ui/bh_karte.png','map')
# markers 6x3
MK=['bh_kutschenhof','bh_kesselgrund','bh_winterpromenade','bh_glasgaerten','bh_stillenhaeuser','bh_wurzelkranz',
    'bh_buegelraum','bh_kutschenhalle','bh_pavillon','bh_verkaufshalle','bh_speisesaal','bh_aktenraum',
    'bh_labor','bh_mutterhaus','bh_verteilanlage','bh_kaltes_palmhaus','bh_verlassene_waescherei','bh_wurzelkammer']
sheet=np.zeros((48,96,4),np.uint8)
for i,_ in enumerate(MK):
    src=P.extract('../raw/m_bh_marker'.replace('../raw/',''),6,3,i) if False else None
im=Image.open('raw/m_bh_marker.jpg').convert('RGB'); W,H=im.size
for i,_ in enumerate(MK):
    r,c=divmod(i,6); box=(round(c*W/6),round(r*H/3),round((c+1)*W/6),round((r+1)*H/3))
    a=np.array(im.crop(box)); m=P.keymask(a)
    from scipy import ndimage
    m=ndimage.binary_fill_holes(ndimage.binary_opening(m,iterations=2))
    ys,xs=np.nonzero(m); a=a[ys.min():ys.max()+1, xs.min():xs.max()+1]; m=m[ys.min():ys.max()+1, xs.min():xs.max()+1]
    o=P.fit((a,m),15,15); cell=np.zeros((16,16,4),np.uint8); cell[0:15,0:15]=o
    sheet[r*16:(r+1)*16,c*16:(c+1)*16]=cell
sheet[...,:3]=np.where(sheet[...,3:]>0, quantize_rgb(sheet[...,:3]),0)
save_png(sheet,'out/ui/bh_marker.png')
# pins (approximate quarter centres on the 480x270 map, measured on the generated map)
PINS={'bh_kutschenhof':(75,226),'bh_kesselgrund':(282,206),'bh_winterpromenade':(328,122),'bh_glasgaerten':(112,50),
      'bh_stillenhaeuser':(170,124),'bh_wurzelkranz':(305,48),'bh_wurzelkammer':(430,122)}
# fog overlay: dithered fog except clear holes over the six quarters
rng=np.random.RandomState(11); yy,xx=np.mgrid[0:270,0:480]
from scipy import ndimage
noise=ndimage.gaussian_filter(rng.rand(270,480),8); noise=(noise-noise.min())/(noise.max()-noise.min())
clear=np.zeros((270,480))
for k,(x,y) in PINS.items():
    rx,ry=(70,42) if k!='bh_wurzelkammer' else (40,34)
    clear=np.maximum(clear, 1-((xx-x)/rx)**2-((yy-y)/ry)**2)
dens=noise*0.9+0.18-np.clip(clear,0,1)*1.6
bay=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16
on=dens>bay[yy%4,xx%4]*0.6+0.25
fog=np.zeros((270,480,4),np.uint8)
col=np.where((dens>0.75)[...,None],C('#a8b4c0'),C('#95a5a5'))
warm=(noise>0.8)&(dens>0.75)&((xx+yy)%2==0); col[warm]=C('#e0c9a1')
fog[...,:3]=col; fog[...,3]=on*255; fog[~on,:3]=0
save_png(fog,'out/ui/bh_karte_nebel.png')
# pipe plan overlay: transparent, only pipes in three colours
lines=np.zeros((270,480,4),np.uint8)
COL={'warm':('#e8b860','#886332'),'kalt':('#71858b','#303b49'),'belastet':('#8c7295','#5c426a')}
def seg(p,q,kind):
    (x0,y0),(x1,y1)=p,q; c1,c2=COL[kind]
    pts=[(x,y0) for x in range(min(x0,x1),max(x0,x1)+1)]+[(x1,y) for y in range(min(y0,y1),max(y0,y1)+1)]
    for x,y in pts:
        for dx in (-2,-1,0,1,2):
            for dy in (-2,-1,0,1,2):
                X,Y=x+dx,y+dy
                if 0<=X<480 and 0<=Y<270:
                    inner = abs(dx)<=1 and abs(dy)<=1
                    if inner: lines[Y,X]=[*C(c1),255]
                    elif lines[Y,X,3]==0: lines[Y,X]=[*C(c2),255]
TRUNK_X=237; ROW1=89; ROW2=162
NET=[('warm',(282,206),(TRUNK_X,ROW2)),('warm',(TRUNK_X,ROW2),(TRUNK_X,ROW1)),('warm',(TRUNK_X,ROW2),(328,122)),('warm',(TRUNK_X,ROW2),(170,124)),
     ('kalt',(75,226),(TRUNK_X-8,ROW2+8)),('kalt',(TRUNK_X-8,ROW1),(112,50)),('kalt',(TRUNK_X-8,ROW2+8),(TRUNK_X-8,ROW1)),
     ('belastet',(TRUNK_X+8,ROW1-8),(305,48)),('belastet',(305,48),(430,122)),('belastet',(TRUNK_X+8,ROW2-6),(TRUNK_X+8,ROW1-8))]
for kind,p,q in NET: seg(p,q,kind)
save_png(lines,'out/ui/bh_karte_leitungen.png')
json.dump({'meta':meta,'markers':MK,'pins':PINS,'pipeNetwork':[{'circuit':k,'from':list(p),'to':list(q)} for k,p,q in NET]},open('out/images_meta.json','w'),indent=1)
# map preview with overlays
base=Image.open('out/ui/bh_karte.png').convert('RGBA'); f=Image.open('out/ui/bh_karte_nebel.png').convert('RGBA'); l=Image.open('out/ui/bh_karte_leitungen.png').convert('RGBA')
v=base.copy(); v.alpha_composite(l); v2=base.copy(); v2.alpha_composite(f)
pv=Image.new('RGBA',(960,270)); pv.paste(v,(0,0)); pv.paste(v2,(480,0)); pv.resize((1920,540),Image.NEAREST).save('raw/map_preview.png')
print('done')
