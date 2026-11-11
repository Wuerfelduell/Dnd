import json, hashlib
from PIL import Image
import numpy as np
PAL_HEX = json.load(open('/workspace/Dnd/public/sprites/manifest-dunscar1.json'))['palette']
PAL = np.array([[int(h[i:i+2],16) for i in (1,3,5)] for h in PAL_HEX], dtype=np.float64)
OUTLINE = (0x1a,0x1c,0x2c)

def _lin(c):  # weighted RGB distance (redmean)
    return c
def quantize_rgb(arr, allowed=None):
    """arr HxWx3 uint8 -> HxWx3 uint8 snapped to palette (redmean distance)."""
    pal = PAL if allowed is None else PAL[allowed]
    a = arr.reshape(-1,1,3).astype(np.float64)
    p = pal.reshape(1,-1,3)
    rmean = (a[...,0]+p[...,0])/2
    d = (2+rmean/256)*(a[...,0]-p[...,0])**2 + 4*(a[...,1]-p[...,1])**2 + (2+(255-rmean)/256)*(a[...,2]-p[...,2])**2
    idx = d.argmin(1)
    return pal[idx].reshape(arr.shape).astype(np.uint8)

def to_rgba_indexed(rgb, alpha=None):
    q = quantize_rgb(rgb)
    if alpha is None: alpha = np.full(rgb.shape[:2],255,np.uint8)
    out = np.dstack([q, alpha]).astype(np.uint8)
    out[alpha==0,:3]=0
    return out

def save_png(rgba, path):
    """Save as indexed PNG (palette mode) with binary alpha via tRNS."""
    im = Image.fromarray(rgba,'RGBA')
    arr = rgba
    pal = [tuple(int(h[i:i+2],16) for i in (1,3,5)) for h in PAL_HEX]
    has_t = (arr[...,3]==0).any()
    idxmap = {c:i+ (1 if has_t else 0) for i,c in enumerate(pal)}
    flat = arr.reshape(-1,4)
    ind = np.zeros(len(flat),np.uint8)
    for i,(r,g,b,a) in enumerate(map(tuple,flat)):
        pass
    # vectorized
    keys = flat[:,0].astype(np.int64)<<16 | flat[:,1].astype(np.int64)<<8 | flat[:,2].astype(np.int64)
    lut = {}
    for c,i in idxmap.items(): lut[(c[0]<<16)|(c[1]<<8)|c[2]] = i
    ind = np.array([lut.get(int(k),0) for k in keys],np.uint8)
    if has_t: ind[flat[:,3]==0]=0
    p = Image.new('P', im.size)
    p.putdata(ind.tolist())
    plist = ([0,0,0] if has_t else []) + [v for c in pal for v in c]
    p.putpalette(plist + [0]*(768-len(plist)))
    if has_t: p.info['transparency']=0; p.save(path, transparency=0, optimize=True)
    else: p.save(path, optimize=True)

def down(im, size, inset=0.0):
    """box-average downscale of PIL image region to exact size, returns RGB array"""
    w,h = im.size
    if inset:
        dx,dy=int(w*inset),int(h*inset); im=im.crop((dx,dy,w-dx,h-dy))
    return np.array(im.convert('RGB').resize(size, Image.BOX))

def grid_cells(im, cols, rows, cell=16, inset=0.03, box=None):
    im = im.convert('RGB')
    if box: im = im.crop(box)
    W,H = im.size
    out = np.zeros((rows*cell, cols*cell,3),np.uint8)
    for r in range(rows):
        for c in range(cols):
            x0,x1 = round(c*W/cols), round((c+1)*W/cols)
            y0,y1 = round(r*H/rows), round((r+1)*H/rows)
            out[r*cell:(r+1)*cell, c*cell:(c+1)*cell] = down(im.crop((x0,y0,x1,y1)), (cell,cell), inset)
    return out

def sha(path): return hashlib.sha256(open(path,'rb').read()).hexdigest()

def quant_idx(arr):
    """HxWx3 -> HxW palette indices (redmean), chunked"""
    a = arr.reshape(-1,3).astype(np.float64)
    out = np.empty(len(a),np.int64)
    p = PAL.reshape(1,-1,3)
    for s in range(0,len(a),200000):
        x = a[s:s+200000].reshape(-1,1,3)
        rmean=(x[...,0]+p[...,0])/2
        d=(2+rmean/256)*(x[...,0]-p[...,0])**2+4*(x[...,1]-p[...,1])**2+(2+(255-rmean)/256)*(x[...,2]-p[...,2])**2
        out[s:s+200000]=d.argmin(1)
    return out.reshape(arr.shape[:2])

def mode_down(im, size, inset=0.0, blur=1):
    """quantize at (pre-shrunk) resolution then take the most frequent palette index per target pixel"""
    from PIL import ImageFilter
    w,h = im.size
    if inset:
        dx,dy=int(w*inset),int(h*inset); im=im.crop((dx,dy,w-dx,h-dy))
    tw,th = size
    f=4  # work at 4x target
    work = im.convert('RGB').resize((tw*f,th*f), Image.BOX)
    if blur: work = work.filter(ImageFilter.MedianFilter(3))
    idx = quant_idx(np.array(work))
    blocks = idx.reshape(th,f,tw,f).transpose(0,2,1,3).reshape(th,tw,f*f)
    res = np.zeros((th,tw),np.int64)
    for k in range(32):
        pass
    counts = np.stack([(blocks==k).sum(-1) for k in range(32)],-1)
    res = counts.argmax(-1)
    return PAL[res].astype(np.uint8)

def grid_cells_mode(im, cols, rows, cell=16, inset=0.03, box=None):
    im = im.convert('RGB')
    if box: im = im.crop(box)
    W,H = im.size
    out = np.zeros((rows*cell, cols*cell,3),np.uint8)
    for r in range(rows):
        for c in range(cols):
            x0,x1 = round(c*W/cols), round((c+1)*W/cols)
            y0,y1 = round(r*H/rows), round((r+1)*H/rows)
            out[r*cell:(r+1)*cell, c*cell:(c+1)*cell] = mode_down(im.crop((x0,y0,x1,y1)), (cell,cell), inset)
    return out
