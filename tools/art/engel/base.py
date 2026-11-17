"""Konzeptbild -> Motiv im Zielraster: ganzzahliger Blockfaktor (ein Motivpixel = ein Block, Kern-Mehrheit),
Palette engel (32 Farben, Halbgott-Palette mit Bein-Weiß), binäres Alpha, 1px Außenumriss #1a1c2c."""
import json
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / 'docs/art/engel-raw'
# Halbgott-Palette (manifest-halbgott.json, Vorlage hg_grenzwaechter und enemy_cw_wetherby nutzen sie), Weiß nur als warmes Bein-Weiß:
# #eee2c5 -> #ebcd8d, #a8b4c0 (kaltes Hellgrau) -> #bbae95. Ergebnis: genau 32 Farben.
_SWAP = {'#eee2c5': '#ebcd8d', '#a8b4c0': '#bbae95'}
PAL_HEX = [_SWAP.get(h, h) for h in json.loads((ROOT / 'public/sprites/manifest-halbgott.json').read_text())['palette']]
PAL = np.array([[int(h[i:i+2], 16) for i in (1, 3, 5)] for h in PAL_HEX], dtype=np.int32)
def idx(h): return PAL_HEX.index(h)
OUT = idx('#1a1c2c')
TQ = idx('#6fe0d0')
VIOLET = [idx(h) for h in ('#493d59', '#665572', '#877595')]
EYE = idx('#f0ce80')
SOCKET = idx('#92745a')
AMBER = [idx(h) for h in ('#f0ce80', '#e8b860', '#d0a050')]
# Türkis bleibt sparsamen Effekt-Akzenten vorbehalten, Rot (#893e4e) kommt in den Figuren nicht vor
FIGURE_COLORS = [i for i in range(len(PAL)) if i not in (TQ, idx('#893e4e'))]

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
    global LAST_ORIGIN
    LAST_ORIGIN = (int(y0 - 2 * factor + oy), int(x0 - 2 * factor + ox))  # Rohbild-Koordinate der Blockzelle (0,0)
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

def glow_spots(path, top_frac=0.45):
    """Augenlicht: kleine orange-helle Flecken im oberen Teil der Figur, ringsum kein Hintergrund (Lichtbahnen und
    Kronenspitzen berühren den Hintergrund und fallen heraus). Genommen wird der oberste Fleck und ein zweiter
    direkt daneben (das andere Auge). Ergebnis: Pixelmaske im Rohbild."""
    from scipy import ndimage
    im = np.array(Image.open(path).convert('RGB')).astype(int); bg = is_bg(im.astype(np.uint8))
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    glow = (r > 215) & (g > 110) & (b < 140) & (r - b > 110)
    ys = np.where((~bg).any(1))[0]; ylim = ys.min() + int((ys.max() - ys.min()) * top_frac)
    glow[ylim:] = False
    lab, n = ndimage.label(glow); comps = []
    for i in range(1, n + 1):
        yy, xx = np.where(lab == i)
        if not (20 <= len(yy) <= 2500): continue
        y0, y1, x0, x1 = yy.min() - 12, yy.max() + 12, xx.min() - 12, xx.max() + 12
        if y0 < 0 or x0 < 0 or bg[y0:y1, x0:x1].any(): continue
        comps.append((yy.mean(), xx.mean(), i))
    mask = np.zeros_like(glow)
    if not comps: return mask
    comps.sort(); ty, tx, ti = comps[0]
    for cy, cx, i in comps:
        if abs(cy - ty) <= 25 and abs(cx - tx) <= 60: mask |= lab == i
    return mask

def motif(path, factor, box=None, gain=(1.0, 1.0), eyes=False):
    a = convert(path, factor, box, gain)
    a = fill_holes(cleanup(a))
    if eyes:
        oy, ox = LAST_ORIGIN
        g = glow_spots(path); yy, xx = np.where(g)
        cnt = {}
        for y, x in zip((yy - oy) // factor, (xx - ox) // factor): cnt[(y, x)] = cnt.get((y, x), 0) + 1
        best = sorted(cnt.items(), key=lambda kv: -kv[1])
        hits = [k for k, v in best if v >= factor * factor * 0.2] or [k for k, _ in best[:2]]
        EYES[:] = [(by, bx) for by, bx in hits[:3] if 0 <= by < a.shape[0] and 0 <= bx < a.shape[1] and a[by, bx] >= 0]
    a = cleanup(a)
    ys, xs = np.where(a >= 0); y0, x0 = ys.min(), xs.min()
    EYES[:] = [(y - y0, x - x0) for y, x in EYES] if eyes else []
    m = outline(crop(a))
    if EYES:
        # zwei Lichtpunkte statt eines Flecks: links/rechts der Fleckmitte, dazwischen bleibt der Nasenrücken
        ey = int(round(np.mean([e[0] for e in EYES]))); ex = int(round(np.mean([e[1] for e in EYES])))
        EYES[:] = [(ey, ex - 1), (ey, ex + 1)]
        # schmales dunkles Band, darin zwei Lichtpunkte: liest sich auch auf dem hellen Kopf
        for dx, col in ((-2, SOCKET), (-1, EYE), (0, SOCKET), (1, EYE), (2, SOCKET)):
            x = ex + dx
            if 0 <= x < m.shape[1] and m[ey, x] >= 0 and m[ey, x] != OUT: m[ey, x] = col
    return m
EYES = []

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
