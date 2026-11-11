"""Hand-pixel toolkit for briarholt1 tilesets v2: every cell is drawn explicitly on a 16x16 index grid."""
import numpy as np, json, sys
import os; sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
from lib import PAL_HEX, save_png
PAL=np.array([[int(h[i:i+2],16) for i in (1,3,5)] for h in PAL_HEX],np.uint8)
# palette aliases
OL,N1,N2,N3,S4,S5,G6,G7,BK,B9,B10,B11,B12,B13,B14,M15,M16,M17,BONE,T19,T20,T21,T22,TQ,BR24,BR25,AM26,AM27,VL28,VI29,VI30,WN=range(32)
T=-1  # transparent / keep
def blank(c=N3): return np.full((16,16),c,np.int16)
def rect(a,x,y,w,h,c): a[y:y+h,x:x+w]=c; return a
def hl(a,x0,x1,y,c): a[y,x0:x1+1]=c
def vl(a,x,y0,y1,c): a[y0:y1+1,x]=c
def px(a,pts,c):
    for x,y in pts: a[y%16,x%16]=c
def sprite(a,rows,legend,ox=0,oy=0):
    """paint ASCII rows; '.' or ' ' = keep"""
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch in '. ': continue
            v=legend[ch]
            if v is None: continue
            yy,xx=oy+y,ox+x
            if 0<=yy<a.shape[0] and 0<=xx<a.shape[1]: a[yy,xx]=v
    return a
def outline(a,mask,c=OL):
    """1px outline outside mask (4-neighbour), inside the cell only"""
    m=mask.astype(bool); o=np.zeros_like(m)
    o[1:,:]|=m[:-1,:]; o[:-1,:]|=m[1:,:]; o[:,1:]|=m[:,:-1]; o[:,:-1]|=m[:,1:]
    a[o&~m]=c; return a
def rng(seed): return np.random.default_rng(seed)
def speckle(a,cols,n,seed,where=None,wrap=True):
    r=rng(seed); H,W=a.shape
    for i in range(n):
        x,y=int(r.integers(W)),int(r.integers(H))
        if where is not None and not where[y,x]: continue
        a[y,x]=cols[int(r.integers(len(cols)))]
def replace(a,src,dst):
    b=a.copy(); b[a==src]=dst; return b
def mirror(a): return a[:,::-1].copy()
def to_rgb(a):
    return PAL[np.clip(a,0,31)]
def sheet(cells,cols=8):
    rows=(len(cells)+cols-1)//cols
    s=np.zeros((rows*16,cols*16),np.int16)
    for i,c in enumerate(cells):
        assert c.shape==(16,16),i
        r,k=divmod(i,cols); s[r*16:r*16+16,k*16:k*16+16]=c
    return s
def save(a,path):
    rgb=to_rgb(a); rgba=np.dstack([rgb,np.full(a.shape,255,np.uint8)]); save_png(rgba,path)
def up(a,f=8):
    from PIL import Image
    return Image.fromarray(to_rgb(a)).resize((a.shape[1]*f,a.shape[0]*f),Image.NEAREST)
def tile3(a): return np.tile(a,(3,3))
def obj(a,rows,legend,ox=0,oy=0,ol=True):
    """paint ASCII sprite and give it a 1px #1a1c2c outline (props on terrain)"""
    m=np.zeros(a.shape,bool)
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch in '. ': continue
            yy,xx=oy+y,ox+x
            if 0<=yy<a.shape[0] and 0<=xx<a.shape[1]: m[yy,xx]=True
    if ol: outline(a,m)
    sprite(a,rows,legend,ox,oy)
    return a
