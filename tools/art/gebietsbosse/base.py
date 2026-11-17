"""Konzeptbild -> Basis-Sprite im Zielraster (ganzzahliger Blockfaktor, Palette dunscar3, binäres Alpha, Umriss)."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / 'docs/art/gebietsbosse-raw'
PAL_HEX = json.load(open(ROOT / 'public/sprites/manifest-dunscar3.json'))['palette']
PAL = np.array([[int(h[i:i+2],16) for i in (1,3,5)] for h in PAL_HEX], dtype=np.int32)
OUT = 0  # index of #1a1c2c

def is_bg(rgb):
    r,g,b = rgb[...,0].astype(int), rgb[...,1].astype(int), rgb[...,2].astype(int)
    return (r > 150) & (b > 150) & (g < 110) & (r - g > 90) & (b - g > 70)

SUBSETS = {
    'weichenfresser': [0,1,2,3,4,5,6,9,10,11,12,13,14,15,18],
    'bruchmeister':   [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,19,20],
    'schluchtrufer':  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,28,29,30],
    'tiefenvorarbeiter': [0,1,2,3,4,5,9,10,11,12,13,14,15,16,17,18,28,29,30,31,7],
}
ALLOWED = None
NAME = None
GAIN = {'weichenfresser': (1.3, 1.15), 'schluchtrufer': (1.2, 1.15), 'bruchmeister': (1.0, 1.05), 'tiefenvorarbeiter': (1.0, 1.0)}
def nearest_idx(rgb):
    d = ((rgb[...,None,:].astype(np.int32) - PAL[None,None,:,:])**2)
    w = np.array([3,4,2])
    d = (d*w).sum(-1)
    if ALLOWED is not None:
        mask = np.ones(len(PAL), bool); mask[ALLOWED] = False
        d[..., mask] = 1<<40
    return d.argmin(-1)

def convert(path, factor, max_w=None):
    from PIL import ImageFilter
    from PIL import ImageEnhance
    src = Image.open(path).convert('RGB')
    keep = is_bg(np.array(src))
    g = GAIN.get(NAME, (1.0, 1.0))
    adj = ImageEnhance.Contrast(ImageEnhance.Brightness(src).enhance(g[0])).enhance(g[1])
    arr = np.array(adj); arr[keep] = (255, 0, 255)
    im = np.array(Image.fromarray(arr).filter(ImageFilter.MedianFilter(5)))
    bg = is_bg(im)
    ys, xs = np.where(~bg)
    # Bodenlinie/Streupixel ignorieren: robuste bbox
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    best = None
    for oy in range(factor):
        for ox in range(factor):
            sub = im[y0-factor+oy:, x0-factor+ox:]
            h = (sub.shape[0]//factor)*factor; w = (sub.shape[1]//factor)*factor
            blk = sub[:h,:w].reshape(h//factor, factor, w//factor, factor, 3).astype(np.int32)
            var = blk.var(axis=(1,3)).sum()
            if best is None or var < best[0]: best = (var, oy, ox)
    _, oy, ox = best
    sub = im[y0-factor+oy:y1+factor, x0-factor+ox:x1+factor]
    h = (sub.shape[0]//factor)*factor; w = (sub.shape[1]//factor)*factor
    sub = sub[:h,:w]
    idx = nearest_idx(sub)
    bgm = is_bg(sub)
    H, W = h//factor, w//factor
    out = np.full((H,W), -1, np.int32)
    for y in range(H):
        for x in range(W):
            # mittlerer Kern des Blocks (ein Motivpixel = ein Block)
            c0, c1 = factor//4, factor - factor//4
            bb = bgm[y*factor+c0:y*factor+c1, x*factor+c0:x*factor+c1]
            if bb.mean() > 0.5: continue
            vals = idx[y*factor+c0:y*factor+c1, x*factor+c0:x*factor+c1][~bb]
            out[y,x] = np.bincount(vals, minlength=len(PAL)).argmax()
    return out

def cleanup(a):
    a = a.copy(); H, W = a.shape
    op = a >= 0
    # isolierte Einzelpixel entfernen
    for y in range(H):
        for x in range(W):
            if op[y,x]:
                n = sum(op[yy,xx] for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)) if 0<=yy<H and 0<=xx<W)
                if n == 0: a[y,x] = -1
    return a

def crop(a):
    ys, xs = np.where(a >= 0)
    return a[ys.min():ys.max()+1, xs.min():xs.max()+1]

def despeckle(a, passes=2):
    a = a.copy(); H, W = a.shape
    for _ in range(passes):
        b = a.copy()
        for y in range(1, H-1):
            for x in range(1, W-1):
                c = a[y,x]
                if c < 0: continue
                n4 = [a[y-1,x], a[y+1,x], a[y,x-1], a[y,x+1]]
                if c in n4: continue
                n8 = [v for v in a[y-1:y+2, x-1:x+2].ravel() if v >= 0 and v != c]
                if len(n8) >= 5:
                    b[y,x] = np.bincount(n8).argmax()
        a = b
    return a

def fill_holes(a, passes=3):
    a = a.copy(); H, W = a.shape
    for _ in range(passes):
        b = a.copy()
        for y in range(1, H-1):
            for x in range(1, W-1):
                if a[y,x] >= 0: continue
                n4 = [a[y-1,x], a[y+1,x], a[y,x-1], a[y,x+1]]
                op = [v for v in n4 if v >= 0]
                if len(op) >= 3:
                    b[y,x] = np.bincount(op).argmax()
        a = b
    return a

def exterior(op):
    from collections import deque
    H, W = op.shape; ext = np.zeros_like(op); q = deque()
    for y in range(H):
        for x in (0, W-1):
            if not op[y,x] and not ext[y,x]: ext[y,x]=1; q.append((y,x))
    for x in range(W):
        for y in (0, H-1):
            if not op[y,x] and not ext[y,x]: ext[y,x]=1; q.append((y,x))
    while q:
        y,x = q.popleft()
        for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0<=yy<H and 0<=xx<W and not op[yy,xx] and not ext[yy,xx]:
                ext[yy,xx]=1; q.append((yy,xx))
    return ext.astype(bool)

def outline(a):
    """1px Umriss #1a1c2c: Randpixel der Silhouette zum Außenraum (innen gesetzt), Größe bleibt."""
    a = a.copy(); op = a >= 0
    ext = np.pad(exterior(np.pad(op,1)), 0)
    e = ext
    nb = e[:-2,1:-1] | e[2:,1:-1] | e[1:-1,:-2] | e[1:-1,2:]
    a[op & nb] = OUT
    return a

def build_base(name, factor):
    global ALLOWED, NAME; ALLOWED = SUBSETS[name]; NAME = name
    a = convert(RAW / f'{name}_konzept.jpg', factor)
    a = cleanup(a); a = fill_holes(a, 1); a = cleanup(a)
    a = outline(crop(a))
    return a
