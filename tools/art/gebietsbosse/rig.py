"""Frame-Rig: jede Pose wird einzeln aus den Teilen des Basis-Sprites zusammengesetzt (ganzzahlige Verschiebungen,
zeilenweise Neigung, Stauchung) und bekommt eigene, pro Frame gezeichnete Effektpixel."""
import math, random
import numpy as np
from base import outline, exterior, OUT

T = -1
def blank(w, h): return np.full((h, w), T, np.int32)

class Rig:
    def __init__(self, base, parts):
        """parts: Liste (name, maskfunc(y,x)->bool) von hinten nach vorne; Rest = 'body' (ganz hinten)."""
        self.a = base; H, W = base.shape; self.H, self.W = H, W
        yy, xx = np.mgrid[0:H, 0:W]
        taken = np.zeros((H, W), bool); layers = []
        for name, f in parts:
            m = f(yy, xx) & (base >= 0) & ~taken; taken |= m; layers.append((name, m))
        self.layers = [('body', (base >= 0) & ~taken)] + layers
        self.order = [n for n, _ in self.layers]

    def pose(self, off=None, lean=0.0, lean_from=None, squash=1.0, smear=(), front=None, squash_from=None):
        """off: {teil: (dx,dy)}; lean: Pixel Versatz oben gegenüber Fußlinie (negativ = nach links);
        lean_from: Zeile, unterhalb der nicht geneigt wird (Beine bleiben stehen)."""
        off = off or {}; H, W = self.H, self.W; pad = 24
        out = blank(W + 2*pad, H + 2*pad)
        order = list(self.layers)
        if lean_from is not None:
            # Beine bleiben stehen: Körperpixel unterhalb lean_from bilden eine eigene, nur seitlich mitgehende Ebene
            yy = np.arange(H)[:, None]
            bm = self.layers[0][1]; bdx = off.get('body', (0, 0))[0]
            order = [('legs', bm & (yy >= lean_from)), ('body', bm & (yy < lean_from))] + order[1:]
            off = dict(off); off.setdefault('legs', (bdx, 0))
        if front:
            order = [l for l in order if l[0] not in front] + [l for l in order if l[0] in front]
        lf = H if lean_from is None else lean_from
        for name, m in order:
            dx, dy = off.get(name, (0, 0))
            steps = [(dx, dy)]
            if True:  # jedes bewegte Teil zieht seine Spur nach -> keine Lücken/Nähte
                n = max(abs(dx), abs(dy))
                steps = [(round(dx*i/n), round(dy*i/n)) for i in range(n+1)] if n else steps
            ys, xs = np.where(m)
            sh = np.array([round(lean * max(0, (lf - y)) / max(1, lf)) for y in range(H)])
            vals = self.a[ys, xs]
            for si, (sx, sy) in enumerate(steps):
                ty = ys + sy + pad; tx = xs + sx + pad + sh[ys]
                ok = (ty >= 0) & (ty < out.shape[0]) & (tx >= 0) & (tx < out.shape[1])
                if si < len(steps) - 1: ok &= vals != OUT  # Spur ohne Umrisspixel, sonst dunkle Keile
                out[ty[ok], tx[ok]] = self.a[ys[ok], xs[ok]]
        if squash != 1.0:
            ys = np.where((out >= 0).any(1))[0]; bot = ys.max()
            sq = blank(out.shape[1], out.shape[0])
            if squash_from is None:
                top = ys.min()
            else:
                top = squash_from + pad
            src_h = bot - top + 1; nh = max(1, round(src_h * squash))
            for r in range(nh):
                srow = top + min(src_h - 1, int((r + 0.5) * src_h / nh))
                sq[bot - nh + 1 + r] = out[srow]
            lift = src_h - nh
            if squash_from is not None:
                # Oberkörper sinkt als Ganzes um die gestauchte Höhe
                sq[ys.min() + lift: top + lift] = out[ys.min(): top]
            out = sq
        return out, pad

    def frame(self, cw, ch, x0, foot, **kw):
        """Setzt die Pose in eine Zelle: x0 = linke Kante des Basis-Sprites, foot = unterste Zeile (Fußlinie)."""
        spr, pad = self.pose(**kw)
        op = spr >= 0
        cell = blank(cw, ch)
        ys, xs = np.where(op)
        # Fußlinie: unterste belegte Zeile liegt immer auf foot (wie Vorlage, bbox unten = foot+1)
        dy = foot - ys.max(); dx = x0 - pad
        # seitlich in die Zelle einpassen (1px Rand), falls Vorstoß/Neigung über den Rand ginge
        lo, hi = xs.min() + dx, xs.max() + dx
        if lo < 1: dx += 1 - lo
        elif hi > cw - 2: dx -= hi - (cw - 2)
        if ys.min() + dy < 1: raise ValueError('Pose zu hoch für die Zelle')
        ty = ys + dy; tx = xs + dx
        ok = (ty >= 0) & (ty < ch) & (tx >= 0) & (tx < cw)
        cell[ty[ok], tx[ok]] = spr[ys[ok], xs[ok]]
        return fix_outline(cell)

def fix_outline(cell):
    """Nach dem Verschieben: Außenkante erneut als 1px #1a1c2c schließen."""
    return outline(cell)

# ---------- Effekte (direkt im Zellraster, Palettenindizes dunscar3) ----------
AMBER, AMBER2, BRASS, BONE, BONE2, LIME, GREY, GREY2 = 17, 16, 15, 8, 7, 6, 5, 4
TQ, TQ2, TQ3, TQD = 30, 29, 31, 28

def put(c, x, y, v):
    # Effekte halten 1px Abstand zum Zellrand (Prüfregel Ränder) und bleiben über der Fußlinie
    if 1 <= y < c.shape[0] - 2 and 1 <= x < c.shape[1] - 1: c[y, x] = v

def sparks(c, cx, cy, n, seed, spread=6, dirx=-1, reach=10):
    r = random.Random(seed)
    for i in range(n):
        d = r.uniform(0, reach); a = r.uniform(-0.9, 0.9)
        x = round(cx + dirx * d * math.cos(a)); y = round(cy + d * math.sin(a) * spread / max(1, reach))
        put(c, x, y, AMBER if r.random() < 0.6 else AMBER2)
        if r.random() < 0.25: put(c, x + dirx, y, AMBER2)

def chip(c, x, y, big=False, cols=(BONE, LIME)):
    for dx, dy, v in ((0,0,cols[0]),(1,0,cols[1]),(0,1,cols[1]),(1,1,OUT)):
        put(c, x+dx, y+dy, v)
    if big:
        put(c, x+2, y, cols[1]); put(c, x+2, y+1, OUT); put(c, x-1, y, cols[0])

def ring(c, cx, cy, r, col=TQ, inner=TQ2, arc=(110, 250), thick=1):
    """Schallring: Bogen nach links (Winkel in Grad, 180 = links)."""
    seen = set()
    for t in range(0, 720):
        ang = math.radians(arc[0] + (arc[1]-arc[0]) * t / 719)
        for k in range(thick):
            x = round(cx + (r - k) * math.cos(ang)); y = round(cy - (r - k) * math.sin(ang))
            if (x, y) in seen: continue
            seen.add((x, y)); put(c, x, y, col if k == 0 else inner)

def stars(c, x, y, seed):
    r = random.Random(seed)
    for i in range(3):
        sx, sy = x + r.randint(-4, 4), y + r.randint(-4, 3)
        put(c, sx, sy, AMBER2); put(c, sx+1, sy, BRASS)

def dust(c, x0, x1, y, seed, n=10):
    r = random.Random(seed)
    for i in range(n):
        x = r.randint(x0, x1); yy = y - r.randint(0, 3)
        put(c, x, yy, GREY if r.random() < .5 else LIME)

def smoke(c, x, y, phase, length=7):
    for i in range(length):
        sx = x + round(1.5 * math.sin((i + phase) * 0.9)); sy = y - i
        put(c, sx, sy, LIME if i % 3 else GREY)

def recolor(c, mapping):
    out = c.copy()
    for s, d in mapping.items(): out[c == s] = d
    return out

def cone(c, x, y, length, half, seed, dirx=-1, slope=0.0):
    """Lichtkegel der Grubenlampe: Kernstrahl + Schachbrett-Dither am Rand (Fake-Transparenz), leicht abwärts."""
    for d in range(1, length):
        h = round(half * d / length); yc = y + round(slope * d)
        for k in range(-h, h + 1):
            xx = x + dirx * d; yy = yc + k
            if not (1 <= yy < c.shape[0] - 2 and 1 <= xx < c.shape[1] - 1) or c[yy, xx] >= 0: continue
            core = abs(k) <= max(0, h // 3)
            if core and d < length - 2: c[yy, xx] = AMBER
            elif (xx + yy) % 2 == 0 and d < length - 1: c[yy, xx] = AMBER2
