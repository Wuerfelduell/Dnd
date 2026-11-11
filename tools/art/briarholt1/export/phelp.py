from lib import *
import numpy as np, json, os
from PIL import Image
from scipy import ndimage
C = lambda h: np.array([int(h[i:i+2],16) for i in (1,3,5)],np.uint8)
OUT = C('#1a1c2c')
def keymask(arr):
    a=arr.astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
    bg = (r>120)&(b>50)&(r-g>70)&(b-g>20)
    return ~bg
def extract(raw, cols, rows, idx):
    im = Image.open(f'raw/p_{raw}.jpg').convert('RGB'); W,H=im.size
    r,c = divmod(idx, cols)
    box=(round(c*W/cols),round(r*H/rows),round((c+1)*W/cols),round((r+1)*H/rows))
    a=np.array(im.crop(box)); m=keymask(a)
    m=ndimage.binary_opening(m,iterations=2)
    lab,n=ndimage.label(m)
    if n>1:
        sizes=ndimage.sum(m,lab,range(1,n+1)); keep=[i+1 for i,s in enumerate(sizes) if s>0.02*sizes.max()]
        m=np.isin(lab,keep)
    ys,xs=np.nonzero(m); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    return a[y0:y1,x0:x1], m[y0:y1,x0:x1]
def fit(src, w, h):
    a,m = src; bh,bw = m.shape; s=min(w/bw,h/bh)
    tw,th=max(1,round(bw*s)),max(1,round(bh*s))
    rgb = mode_down(Image.fromarray(a),(tw,th),blur=1)
    mm = np.array(Image.fromarray((m*255).astype(np.uint8)).resize((tw,th),Image.BOX))>=128
    out=np.zeros((h,w,4),np.uint8); ox=(w-tw)//2; oy=h-th
    out[oy:oy+th,ox:ox+tw,:3]=rgb; out[oy:oy+th,ox:ox+tw,3]=mm*255
    out[out[...,3]==0,:3]=0
    return outline(out)
def outline(o):
    al=o[...,3]>0; p=np.pad(al,1)
    edge = al & ~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])
    o=o.copy(); o[edge,:3]=OUT; return o
def recolor(o, frm, to, box=None):
    o=o.copy(); h,w=o.shape[:2]; y0,y1,x0,x1 = (0,h,0,w) if box is None else (int(box[1]*h),int(box[3]*h),int(box[0]*w),int(box[2]*w))
    sub=o[y0:y1,x0:x1]
    for f,t in zip(frm,to):
        mk=(sub[...,:3]==C(f)).all(-1)&(sub[...,3]>0); sub[mk,:3]=C(t)
    return o
def cycle(o, ring, box=None):
    return recolor(o, ring, ring[1:]+ring[:1], box)
def shift_part(o, x0f, dy=0, dx=0, y0f=0.0):
    o2=o.copy(); h,w=o.shape[:2]; x0=int(w*x0f); y0=int(h*y0f)
    part=o[y0:,x0:].copy(); o2[y0:,x0:]=0
    part=np.roll(np.roll(part,dy,0),dx,1)
    m=part[...,3]>0; reg=o2[y0:,x0:]; reg[m]=part[m]; return o2
def dissolve(o, keep):
    o=o.copy(); h,w=o.shape[:2]; yy,xx=np.mgrid[0:h,0:w]
    bayer=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16
    kill=bayer[yy%4,xx%4]>=keep; o[kill]=0; return o
def scaled(src,w,h,f):
    small=fit(src,max(4,int(w*f)),max(4,int(h*f))); out=np.zeros((h,w,4),np.uint8)
    sh,sw=small.shape[:2]; out[h-sh-(h-sh)//2:h-(h-sh)//2, (w-sw)//2:(w-sw)//2+sw]=small; return out
def rotate_wheel(o, ang):
    im=Image.fromarray(o,'RGBA'); h,w=o.shape[:2]
    top=im.crop((0,0,w,int(h*0.72))).rotate(ang,resample=Image.NEAREST,center=(w*0.42,h*0.34))
    base=np.array(im); base[:int(h*0.72)]=0; t=np.array(top); m=t[...,3]>0
    base[:int(h*0.72)][m]=t[m]; base[...,3]=np.where(base[...,3]>0,255,0); base[base[...,3]==0,:3]=0
    b2=base.copy(); b2[...,:3]=quantize_rgb(base[...,:3]); b2[b2[...,3]==0,:3]=0; return b2
def peg(color):
    o=np.zeros((16,16,4),np.uint8); yy,xx=np.mgrid[0:16,0:16]; d=(xx-7.5)**2+(yy-7.5)**2
    o[d<=12]=[*C(color),255]; o[(d<=12)&(d>6)]=[*OUT,255]; o[(d<=3)&(xx<8)&(yy<8)]=[*C('#eee2c5'),255]; return o
