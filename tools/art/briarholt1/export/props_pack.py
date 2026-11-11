import numpy as np
def pack(items, W=256):
    x=y=0; rowh=0; pos={}
    for n,a in items:
        h,w=a.shape[:2]
        if x+w>W: x=0; y+=rowh; rowh=0
        pos[n]=(x,y,w,h); x+=w; rowh=max(rowh,h)
    H=y+rowh; H=(H+15)//16*16
    sheet=np.zeros((H,W,4),np.uint8)
    for n,a in items:
        x,y,w,h=pos[n]; sheet[y:y+h,x:x+w]=a
    return sheet,pos
