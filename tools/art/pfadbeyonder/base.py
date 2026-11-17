"""Konzeptbild -> Motiv im Zielraster: ganzzahliger Blockfaktor (ein Motivpixel = ein Block, Kern-Mehrheit),
Palette wexmoor8 (32 Farben), binäres Alpha, 1px Außenumriss #1a1c2c."""
import json
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / 'docs/art/pfadbeyonder-raw'
# Wexmoor-Figurenpalette (manifest-figuren_nachzuegler.json, u. a. Maud Keel), zwei fast doppelte Dunkeltöne
# gegen die Okkult-Töne getauscht: #2a2a40 -> #6fe0d0, #34333a -> #8eb5a7. Ergebnis: genau 32 Farben.
_SWAP = {'#2a2a40': '#6fe0d0', '#34333a': '#8eb5a7'}
PAL_HEX = [_SWAP.get(h, h) for h in json.loads((ROOT / 'public/sprites/manifest-figuren_nachzuegler.json').read_text())['palette']]
PAL = np.array([[int(h[i:i+2], 16) for i in (1, 3, 5)] for h in PAL_HEX], dtype=np.int32)
OUT = None  # gesetzt unten
def idx(h): return PAL_HEX.index(h)
OUT = idx('#1a1c2c')
TQ = idx('#6fe0d0')
# Türkis bleibt den okkulten Effekten vorbehalten, die Figur selbst wird ohne #6fe0d0 indiziert
TQ2 = idx('#8eb5a7')
FIGURE_COLORS = [i for i in range(len(PAL)) if i not in (TQ, TQ2, idx('#665572'))]  # Türkis/Violett nur für Okkultes

def is_bg(rgb):
    r, g, b = (rgb[..., k].astype(int) for k in range(3))
    return (r > 150) & (b > 150) & (g < 110) & (r - g > 90) & (b - g > 70)

def lab(rgb):
    c = rgb.astype(np.float64) / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)
PAL_LAB = lab(PAL)

def nearest_idx(rgb, allowed=FIGURE_COLORS):
    """Nächste Palettenfarbe im Lab-Raum (Farbton bleibt erhalten, z. B. Westenblau statt Grau); Buntheit leicht betont."""
    L = lab(rgb)
    d = ((L[..., None, :] - PAL_LAB[None, None, :, :]) ** 2 * np.array([1.0, 1.6, 1.6])).sum(-1)
    mask = np.ones(len(PAL), bool); mask[allowed] = False; d[..., mask] = 1 << 40
    return d.argmin(-1)

def load(path, box=None, gain=(1.0, 1.0)):
    from PIL import ImageEnhance
    src = Image.open(path).convert('RGB')
    if box: src = src.crop(box)
    keep = is_bg(np.array(src))
    adj = ImageEnhance.Contrast(ImageEnhance.Brightness(src).enhance(gain[0])).enhance(gain[1])
    arr = np.array(adj); arr[keep] = (255, 0, 255)
    return np.array(Image.fromarray(arr).filter(ImageFilter.MedianFilter(5)))

def convert(path, factor, box=None, gain=(1.0, 1.0)):
    im = load(path, box, gain); bg = is_bg(im)
    ys, xs = np.where(~bg); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    pad = np.pad(im, ((factor, factor), (factor, factor), (0, 0)), constant_values=0)
    pad[:factor, :] = pad[-factor:, :] = (255, 0, 255); pad[:, :factor] = pad[:, -factor:] = (255, 0, 255)
    y0 += factor; y1 += factor; x0 += factor; x1 += factor
    best = None
    for oy in range(0, factor, max(1, factor // 6)):
        for ox in range(0, factor, max(1, factor // 6)):
            sub = pad[y0 - factor + oy:y1 + factor, x0 - factor + ox:x1 + factor]
            h = (sub.shape[0] // factor) * factor; w = (sub.shape[1] // factor) * factor
            var = sub[:h, :w].reshape(h // factor, factor, w // factor, factor, 3).astype(np.int32).var(axis=(1, 3)).sum()
            if best is None or var < best[0]: best = (var, oy, ox)
    _, oy, ox = best
    sub = pad[y0 - factor + oy:y1 + factor, x0 - factor + ox:x1 + factor]
    h = (sub.shape[0] // factor) * factor; w = (sub.shape[1] // factor) * factor; sub = sub[:h, :w]
    ix = nearest_idx(sub); bgm = is_bg(sub)
    H, W = h // factor, w // factor; out = np.full((H, W), -1, np.int32)
    c0, c1 = factor // 4, factor - factor // 4
    for y in range(H):
        for x in range(W):
            bb = bgm[y*factor+c0:y*factor+c1, x*factor+c0:x*factor+c1]
            if bb.mean() > 0.5: continue
            vals = ix[y*factor+c0:y*factor+c1, x*factor+c0:x*factor+c1][~bb]
            out[y, x] = np.bincount(vals, minlength=len(PAL)).argmax()
    return out

def cleanup(a):
    a = a.copy(); H, W = a.shape; op = a >= 0
    for y in range(H):
        for x in range(W):
            if op[y, x] and not any(0 <= yy < H and 0 <= xx < W and op[yy, xx] for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1))):
                a[y, x] = -1
    return a

def fill_holes(a):
    a = a.copy(); H, W = a.shape; b = a.copy()
    for y in range(1, H-1):
        for x in range(1, W-1):
            if a[y, x] >= 0: continue
            op = [v for v in (a[y-1, x], a[y+1, x], a[y, x-1], a[y, x+1]) if v >= 0]
            if len(op) >= 3: b[y, x] = np.bincount(op).argmax()
    return b

def crop(a):
    ys, xs = np.where(a >= 0)
    return a[ys.min():ys.max()+1, xs.min():xs.max()+1]

def exterior(op):
    H, W = op.shape; ext = np.zeros_like(op, dtype=bool); q = deque()
    for y in range(H):
        for x in range(W):
            if (y in (0, H-1) or x in (0, W-1)) and not op[y, x]: ext[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for yy, xx in ((y-1, x), (y+1, x), (y, x-1), (y, x+1)):
            if 0 <= yy < H and 0 <= xx < W and not op[yy, xx] and not ext[yy, xx]:
                ext[yy, xx] = True; q.append((yy, xx))
    return ext

def outline(a):
    a = a.copy(); op = a >= 0
    e = exterior(np.pad(op, 1))
    nb = e[:-2, 1:-1] | e[2:, 1:-1] | e[1:-1, :-2] | e[1:-1, 2:]
    a[op & nb] = OUT
    return a

def motif(path, factor, box=None, gain=(1.0, 1.0)):
    a = convert(path, factor, box, gain)
    return outline(crop(cleanup(fill_holes(cleanup(a)))))

def split_views(path, n=3):
    """Ansichtsbogen (vorn/seitlich/hinten) in n einzelne Motive trennen: Spalten ohne Figur als Trenner."""
    im = np.array(Image.open(path).convert('RGB')); fg = ~is_bg(im)
    cols = fg.sum(0) > 2; runs = []; start = None
    for x, c in enumerate(cols):
        if c and start is None: start = x
        if not c and start is not None: runs.append((start, x)); start = None
    if start is not None: runs.append((start, len(cols)))
    runs = sorted(runs, key=lambda r: r[1] - r[0], reverse=True)
    # kleine Läufe (Streupixel) an den nächsten großen hängen
    big = sorted(runs[:n]); rest = runs[n:]
    for s, e in rest:
        k = min(range(n), key=lambda i: min(abs(s - big[i][1]), abs(e - big[i][0])))
        big[k] = (min(big[k][0], s), max(big[k][1], e))
    rows = fg.sum(1) > 2; ys = np.where(rows)[0]
    return [(max(0, s - 8), 0, min(im.shape[1], e + 8), im.shape[0]) for s, e in big]
