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

# ---------- Effekte (Palette wexmoor8, Indizes über Hexwerte) ----------
from base import idx, TQ, TQ2
TQD = idx('#496b64')
BRASS, BRASS2, BRASS3 = idx('#cfb18a'), idx('#b3946e'), idx('#8b8870')
PEAT, PEAT2, PEAT3 = idx('#655847'), idx('#715648'), idx('#3d414a')
MOSS, MOSS2 = idx('#68725d'), idx('#8b8870')
IRON, IRON2 = idx('#8a8e96'), idx('#c9c2ad')

def put(c, x, y, v):
    # Effekte halten 1px Abstand zum Zellrand und bleiben über der Fußlinie (unterste Zeile = Zellhöhe-2)
    if 1 <= y < c.shape[0] - 1 and 1 <= x < c.shape[1] - 1: c[y, x] = v

def clod(c, x, y, big=False):
    """Torfbrocken: 2x2 mit Umriss unten rechts."""
    for dx, dy, v in ((0, 0, PEAT2), (1, 0, PEAT), (0, 1, PEAT), (1, 1, OUT)):
        put(c, x+dx, y+dy, v)
    if big: put(c, x-1, y, PEAT2); put(c, x+2, y+1, OUT); put(c, x, y-1, MOSS)

def sparks(c, x, y, seed, n=5):
    r = random.Random(seed)
    for i in range(n):
        put(c, x + r.randint(-3, 3), y + r.randint(-3, 3), BRASS if r.random() < .6 else IRON2)

def stars(c, x, y, seed):
    r = random.Random(seed)
    for i in range(3):
        sx, sy = x + r.randint(-3, 3), y + r.randint(-3, 2)
        put(c, sx, sy, BRASS); put(c, sx + 1, sy, BRASS3)

def tendril(c, x, foot, height, sway, seed):
    """Torfranke: wächst aus dem Boden, Moos/Torf, türkise Spitze (okkult)."""
    r = random.Random(seed)
    for k in range(height):
        y = foot - k; xx = x + round(sway * math.sin(k / 2.5))
        put(c, xx - 1, y, OUT); put(c, xx, y, PEAT if k < height // 2 else MOSS); put(c, xx + 1, y, OUT)
    tx = x + round(sway * math.sin((height - 1) / 2.5))
    put(c, tx, foot - height, TQ); put(c, tx, foot - height - 1, OUT)
    if height > 4: put(c, tx - 1, foot - height + 1, TQ2)

def gear(c, cx, cy, r, phase, col=TQ, inner=TQD):
    """Zahnrad-Umriss (okkult türkis): Ring + Zähne."""
    for t in range(360):
        a = math.radians(t)
        put(c, round(cx + r * math.cos(a)), round(cy + r * math.sin(a)), col)
    for k in range(8):
        a = math.radians(k * 45 + phase)
        for d in (r + 1, r + 2):
            put(c, round(cx + d * math.cos(a)), round(cy + d * math.sin(a)), col)
    put(c, cx, cy, inner); put(c, cx + 1, cy, inner)

def ghost(c, spr, dx, dy=0):
    """„Bild kurz doppelt“: versetzte Kopie im Schachbrett-Dither, türkis getönt, hinter der Figur."""
    H, W = spr.shape
    for y in range(H):
        for x in range(W):
            if spr[y, x] < 0 or (x + y) % 2: continue
            tx, ty = x + dx, y + dy
            if 1 <= tx < W - 1 and 1 <= ty < H - 1 and c[ty, tx] < 0:
                c[ty, tx] = TQD if spr[y, x] != OUT else TQ2

def recolor(c, mapping):
    out = c.copy()
    for s, d in mapping.items(): out[c == s] = d
    return out
