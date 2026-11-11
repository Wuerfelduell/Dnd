from tk import *
def bricks(v, base=B10, hi=B11, sh=B9, mortar=N3, seed=1, bw=8, bh=4, frost=False, wet=False, alt=None):
    """seamless running-bond brick paving, bricks bw x bh incl. 1px mortar; calm: flat body,
    highlight on the upper-left corner run, one shadow pixel at the lower right"""
    a=blank(mortar); r=rng(seed)
    for row in range(16//bh):
        y0=row*bh; off=(bw//2)*(row%2)
        for k in range(16//bw+1):
            x0=k*bw+off
            col=base
            if alt is not None and r.random()<0.3: col=alt
            for x in range(x0,x0+bw-1):
                for y in range(y0,y0+bh-1):
                    a[y%16,x%16]=col
            for x in range(x0,x0+min(3,bw-2)): a[y0%16,x%16]=hi
            a[(y0+bh-2)%16,(x0+bw-2)%16]=sh
            a[(y0+bh-2)%16,(x0+bw-3)%16]=sh
            if wet and r.random()<0.4:
                xx=x0+int(r.integers(2,bw-3)); a[y0%16,xx%16]=S5
    if frost:  # rime: joints turn pale, some brick tops catch white frost
        a[a==mortar]=G6
        for y in range(16):
            for x in range(16):
                if a[y,x]==hi and ((x//bw)*3+(y//bh)*5+seed)%3==0: a[y,x]=G7
    return a
def planks(base=B10, hi=B11, sh=B9, gap=B9, seed=3, w=16, ph=4, nail=None, horizontal=True):
    """seamless planks: horizontal boards ph high, butt joints staggered"""
    a=blank(base); r=rng(seed)
    for row in range(16//ph):
        y0=row*ph
        hl(a,0,15,y0+ph-1,gap)
        hl(a,0,15,y0,hi)
        j=(row*5+3)%16
        vl(a,j,y0,y0+ph-2,gap)
        a[y0,(j+1)%16]=hi
        # grain
        for _ in range(2):
            x=int(r.integers(16)); a[y0+1+int(r.integers(ph-2)),x]=sh
        if nail is not None: a[y0+1,(j+2)%16]=nail; a[y0+1,(j-2)%16]=nail
    if not horizontal: a=a.T.copy()
    return a
def tiles_floor(c1=G6, c2=G7, grout=S5, size=4, seed=5, checker=True):
    a=blank(grout)
    for ty in range(16//size):
        for tx in range(16//size):
            col=c1 if (not checker or (tx+ty)%2==0) else c2
            rect(a,tx*size,ty*size,size-1,size-1,col)
    return a
def gravel(base=S4, cols=(S5,N3,G6), seed=7, n=34):
    a=blank(base); r=rng(seed)
    for i in range(n):
        x,y=int(r.integers(16)),int(r.integers(16)); c=cols[int(r.integers(len(cols)))]
        a[y,x]=c
        if r.random()<0.4: a[y,(x+1)%16]=c
    return a
def cobble(base=S4, hi=S5, sh=N3, gap=N2, seed=21, frost=False, wet=False, sw=5, shh=4):
    """seamless cobbles ~5x4, rounded corners, offset rows"""
    a=blank(gap); r=rng(seed)
    for row in range(4):
        y0=row*4; off=(row%2)*3
        x=off-8
        k=0
        widths=[5,6,5] if row%2==0 else [6,5,5]
        while x<24:
            w=widths[k%3]; k+=1
            col=base if r.random()>0.25 else (hi if r.random()<0.4 else sh)
            for yy in range(y0,y0+3):
                for xx in range(x,x+w-1):
                    corner=(yy in (y0,y0+2)) and (xx in (x,x+w-2))
                    if not corner: a[yy%16,xx%16]=col
            a[y0%16,(x+1)%16]=hi if col!=hi else G6
            a[(y0+2)%16,(x+w-3)%16]=sh if col!=sh else N2
            x+=w
    if frost:  # rime fills the joints, some stone tops whiten
        a[a==gap]=S5
        a[(a==S5)&False]=S5
        for y in range(16):
            for x in range(16):
                if a[y,x]==hi and (x*5+y*3+seed)%3==0: a[y,x]=G7
    if wet:
        a[a==gap]=N1
        t=np.argwhere(a==hi)
        for (y,x) in t[r.choice(len(t),size=len(t)//3,replace=False)]: a[y,x]=G6
    return a
def slabs(base=S4, hi=S5, sh=N3, joint=N2, seed=23, size=8, rivet=None):
    a=blank(base)
    for y in range(0,16,size): hl(a,0,15,y+size-1,joint)
    for x in range(0,16,size): vl(a,x+size-1,0,15,joint)
    for y in range(0,16,size):
        for x in range(0,16,size):
            hl(a,x,x+size-3,y,hi); vl(a,x,y,y+size-3,hi)
            hl(a,x+1,x+size-2,y+size-2,sh); vl(a,x+size-2,y+1,y+size-2,sh)
            if rivet is not None: a[y+1,x+1]=rivet; a[y+size-3,x+size-3]=rivet
    return a
def pipe_shade(off, pal):
    """off in [-4,3] across pipe thickness (top/left = -4). pal=(ol,hi2,hi,mid,sh)"""
    ol,hi2,hi,mid,sh=pal
    return {-4:ol,-3:hi2,-2:hi,-1:mid,0:mid,1:mid,2:sh,3:ol}[off]
