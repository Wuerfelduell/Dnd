from lib import *
import numpy as np, json
from PIL import Image
import phelp as P
from props_pack import pack
C=P.C
def blank(w=16,h=16): return np.zeros((h,w,4),np.uint8)
def put(o,x,y,col):
    if 0<=x<o.shape[1] and 0<=y<o.shape[0]: o[y,x]=[*C(col),255]
def disc(o,cx,cy,r,col):
    for y in range(o.shape[0]):
        for x in range(o.shape[1]):
            if (x-cx)**2+(y-cy)**2<=r*r: put(o,x,y,col)
frames={}
# Dampf aus Rohr: pipe mouth bottom-left, puffs rising right/up
for p in range(4):
    o=blank()
    for y in range(12,16):
        for x in range(0,5): put(o,x,y,'#425360' if y in (12,15) or x==4 else '#71858b')
    for k in range(3):
        t=(p+k*1.33)%4
        cx=5+t*2.2; cy=12-t*2.6; r=1+t*0.55
        disc(o,cx,cy,r,'#95a5a5'); disc(o,cx-0.5,cy-0.5,max(0.6,r-1),'#a8b4c0')
    frames[f'dampf_rohr_{p}']=o
# Kondensat-Schrift erscheint: fogged pane with abstract strokes appearing (no letters)
stroke=[(2,5),(3,4),(4,5),(5,6),(6,5),(7,4),(8,5),(9,6),(10,5),(11,4),(12,5),(13,6),(3,9),(4,10),(5,9),(6,9),(7,10),(8,11),(9,10),(10,9),(11,10)]
for p in range(6):
    o=blank()
    for y in range(16):
        for x in range(16):
            if (x+y)%2==0: put(o,x,y,'#a8b4c0')
    n=int(len(stroke)*p/5)
    for (x,y) in stroke[:n]: put(o,x,y,'#425360'); put(o,x,y+1,'#586c78')
    if p>=4:
        for x,y in [(4,12),(9,13),(12,12)]: put(o,x,y,'#6fe0d0' if p==5 else '#4eafa2')
    frames[f'kondensat_schrift_{p}']=o
# Reif-Uebergang: frost crystals spreading from corners
rng=np.random.RandomState(3); pts=[(int(x),int(y)) for x,y in rng.randint(0,16,(70,2))]
for p in range(4):
    o=blank(); lim=(p+1)*3.2
    for x,y in pts:
        d=min(np.hypot(x,y),np.hypot(15-x,15-y),np.hypot(15-x,y),np.hypot(x,15-y))
        if d<lim:
            put(o,x,y,'#eee2c5' if (x+y)%3==0 else '#a8b4c0')
            if (x*y)%4==0: put(o,x+1,y,'#95a5a5')
    frames[f'reif_uebergang_{p}']=o
# Ruecklauf-Puls: faint violet pulse travelling through a horizontal pipe
for p in range(4):
    o=blank()
    for x in range(16):
        for y in range(5,11):
            put(o,x,y,'#1a1c2c' if y in (5,10) else ('#586c78' if y==6 else '#425360'))
    for x in range(16):
        d=(x-p*4)%16
        if d<3:
            for y in (7,8,9): put(o,x,y,'#8c7295' if d==1 else '#5c426a')
            if d==1: put(o,x,8,'#c8b0e8')
    frames[f'ruecklauf_puls_{p}']=o
# Kondensat-Sperre 32x32: a shimmering wall of condensed water
for p in range(4):
    o=blank(32,32)
    for x in range(2,30):
        top=4+int(2*np.sin((x+p*3)/3.0))
        for y in range(top,30):
            c='#4eafa2' if (x+y+p*2)%7==0 else ('#a8b4c0' if (x*3+y+p)%5==0 else '#586c78')
            if (x+y)%2==0 or y>26: put(o,x,y,c)
            else: put(o,x,y,'#71858b' if (x+p)%4==0 else '#425360')
        put(o,x,top,'#a8b4c0')
    o=P.outline(o)
    frames[f'kondensat_sperre_{p}']=o
# Leitungsplan-Linien (map overlay tiles): straight h, straight v, corner, tee for warm/kalt/belastet
COLS={'warm':('#e8b860','#886332'),'kalt':('#71858b','#303b49'),'belastet':('#8c7295','#5c426a')}
def line(o,cells,c1,c2):
    for (x,y) in cells: put(o,x,y,c1)
    for (x,y) in cells:
        for dx,dy in ((0,1),(1,0),(0,-1),(-1,0)):
            X,Y=x+dx,y+dy
            if 0<=X<16 and 0<=Y<16 and o[Y,X,3]==0: put(o,X,Y,c2)
for k,(c1,c2) in COLS.items():
    h=[(x,y) for x in range(16) for y in (7,8)]; v=[(x,y) for y in range(16) for x in (7,8)]
    corner=[(x,y) for x in range(7,16) for y in (7,8)]+[(x,y) for y in range(7,16) for x in (7,8)]
    tee=h+[(x,y) for y in range(7,16) for x in (7,8)]
    for nm,cells in (('h',h),('v',v),('ecke',corner),('t',tee)):
        o=blank(); line(o,cells,c1,c2); frames[f'leitung_{k}_{nm}']=o
order=[k for k in frames if not k.startswith('kondensat_sperre')]+[k for k in frames if k.startswith('kondensat_sperre')]
items=[(k,frames[k]) for k in order]
items=[(n,np.dstack([quantize_rgb(a[...,:3]),a[...,3]])) for n,a in items]
for n,a in items: a[a[...,3]==0,:3]=0
sheet,pos=pack(items)
import os; os.makedirs('out/fx',exist_ok=True); save_png(sheet,'out/fx/bh_waerme.png')
RA={'dampf_rohr':([f'dampf_rohr_{i}' for i in range(4)],6,-1),'kondensat_schrift':([f'kondensat_schrift_{i}' for i in range(6)],6,0),
    'reif_uebergang':([f'reif_uebergang_{i}' for i in range(4)],6,0),'ruecklauf_puls':([f'ruecklauf_puls_{i}' for i in range(4)],5,-1),
    'kondensat_sperre':([f'kondensat_sperre_{i}' for i in range(4)],5,-1)}
json.dump({'regions':{n:dict(zip(['x','y','width','height'],map(int,p))) for n,p in pos.items()},
 'regionAnimations':{k:{'frames':v[0],'frameRate':v[1],'repeat':v[2]} for k,v in RA.items()},'width':sheet.shape[1],'height':sheet.shape[0]},open('out/fx_meta.json','w'),indent=1)
Image.open('out/fx/bh_waerme.png').convert('RGBA').resize((sheet.shape[1]*4,sheet.shape[0]*4),Image.NEAREST).save('raw/fx_preview.png')
print(sheet.shape)
