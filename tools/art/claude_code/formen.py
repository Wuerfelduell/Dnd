"""Formen-Werkzeug für Icons in 16 und 32: Teile als Flächen (Polygon, Ellipse, Linie) mit Material-Label zeichnen,
dann automatisch schattieren (Licht oben links, Kantenlicht/-schatten, Fugen zwischen Teilen) und außen umranden.

Koordinaten werden immer im 32er-Raster angegeben; für 16 skaliert das Werkzeug sie (s = 0.5) und zeichnet neu,
statt zu verkleinern. Jedes Teil kann eigene 16er-Koordinaten bekommen, wo 0.5 nicht schön aufgeht.
"""
from PIL import Image, ImageDraw
from pix import OUT

M = {  # Materialrampen dunkel -> hell (Spielpalette)
    'eisen':   [(37, 43, 59), (52, 65, 84), (82, 96, 114), (122, 134, 148), (176, 186, 194)],
    'stahl':   [(44, 52, 68), (78, 92, 112), (128, 144, 160), (176, 190, 200), (222, 230, 234)],
    'blei':    [(40, 42, 52), (62, 64, 76), (88, 90, 102), (118, 120, 130), (150, 152, 160)],
    'messing': [(66, 50, 32), (122, 92, 48), (178, 138, 80), (213, 173, 104), (240, 214, 150)],
    'gold':    [(74, 52, 30), (138, 98, 40), (200, 156, 72), (232, 196, 110), (255, 236, 180)],
    'holz':    [(48, 34, 30), (82, 56, 44), (116, 80, 58), (148, 106, 74), (180, 136, 96)],
    'leder':   [(46, 32, 30), (74, 50, 42), (104, 71, 62), (134, 96, 76), (160, 122, 94)],
    'asche':   [(40, 38, 42), (62, 58, 62), (88, 84, 86), (118, 112, 110), (150, 144, 138)],
    'russ':    [(26, 28, 34), (38, 38, 44), (54, 52, 58), (72, 70, 74), (96, 92, 94)],
    'robe':    [(44, 26, 30), (70, 38, 40), (98, 54, 50), (126, 74, 62), (156, 100, 80)],
    'papier':  [(110, 98, 80), (150, 136, 112), (190, 176, 148), (222, 210, 182), (242, 234, 212)],
    'glut':    [(90, 30, 22), (156, 58, 34), (214, 102, 44), (244, 160, 74), (255, 220, 140)],
    'wachs':   [(64, 22, 24), (108, 34, 34), (150, 50, 44), (186, 76, 60), (214, 112, 88)],
    'tinte':   [(20, 20, 30), (28, 28, 40), (40, 40, 54), (56, 56, 70), (76, 76, 92)],
    'feder':   [(52, 54, 62), (84, 86, 94), (120, 122, 128), (160, 160, 162), (200, 198, 192)],
    'gruen':   [(38, 56, 46), (58, 84, 66), (86, 116, 90), (120, 148, 114), (160, 182, 146)],
    'filz':    [(30, 30, 38), (44, 42, 52), (60, 58, 68), (80, 76, 86), (104, 100, 108)],
    'fleisch': [(60, 24, 30), (96, 36, 42), (138, 54, 56), (174, 80, 72), (206, 116, 98)],
    'kette':   [(52, 50, 58), (90, 88, 96), (140, 138, 140), (186, 182, 176), (220, 216, 206)],
}


TEXTUR = {  # Anteil Pixel, die eine Stufe dunkler (Stoff/Holz) oder heller (Metallkratzer) werden – nur im 32er
    'asche': ('dunkel', 0.14), 'robe': ('dunkel', 0.12), 'filz': ('dunkel', 0.12), 'leder': ('dunkel', 0.14), 'holz': ('maser', 0.0),
    'eisen': ('kratzer', 0.06), 'stahl': ('kratzer', 0.05), 'blei': ('kratzer', 0.06), 'papier': ('dunkel', 0.06), 'gruen': ('dunkel', 0.08),
    'gold': ('kratzer', 0.04), 'messing': ('kratzer', 0.05), 'fleisch': ('dunkel', 0.1), 'feder': ('maser', 0.0),
}


def _h(x, y, i):
    v = (x * 73856093) ^ (y * 19349663) ^ (i * 83492791)
    return ((v * 2654435761) & 0xffffffff) / 0xffffffff


class Teile:
    def __init__(self, size):
        self.n = size
        self.s = size / 32
        self.lab = Image.new('L', (size, size), 0)
        self.d = ImageDraw.Draw(self.lab)
        self.mats = {0: None}
        self.fix = {}
        self.order = []

    def _id(self, mat, level=None, flat=False):
        i = len(self.mats)
        self.mats[i] = (mat, level, flat)
        return i

    def P(self, pts):
        s = self.s
        return [(round(x * s), round(y * s)) for x, y in pts]

    def poly(self, mat, pts, pts16=None, level=None, flat=False):
        i = self._id(mat, level, flat)
        p = pts16 if (pts16 is not None and self.n == 16) else self.P(pts)
        self.d.polygon(p, fill=i)
        return i

    def ell(self, mat, box, box16=None, level=None, flat=False):
        i = self._id(mat, level, flat)
        b = box16 if (box16 is not None and self.n == 16) else [(round(x * self.s), round(y * self.s)) for x, y in box]
        self.d.ellipse(b, fill=i)
        return i

    def line(self, mat, pts, w=1, pts16=None, w16=None, level=None, flat=False):
        i = self._id(mat, level, flat)
        p = pts16 if (pts16 is not None and self.n == 16) else self.P(pts)
        p = [tuple(q) for q in p]
        ww = w16 if (w16 is not None and self.n == 16) else max(1, round(w * self.s))
        self.d.line(p, fill=i, width=ww)
        return i

    def px(self, mat, pts32, pts16=None, level=None):
        """Einzelne Pixel (Glanz, Funken, Nieten) mit fester Stufe."""
        i = self._id(mat, level, True)
        pts = pts16 if (pts16 is not None and self.n == 16) else [(int(x * self.s), int(y * self.s)) for x, y in pts32]
        for p in pts:
            self.lab.putpixel(p, i)
        return i

    def render(self, outline=True, fugen=True):
        n = self.n
        L = self.lab.load()
        get = lambda x, y: L[x, y] if 0 <= x < n and 0 <= y < n else 0
        # Bounding je Label für den Verlauf
        bb = {}
        for y in range(n):
            for x in range(n):
                i = L[x, y]
                if i:
                    a = bb.setdefault(i, [x, y, x, y])
                    a[0], a[1], a[2], a[3] = min(a[0], x), min(a[1], y), max(a[2], x), max(a[3], y)
        im = Image.new('RGBA', (n, n), (0, 0, 0, 0))
        for y in range(n):
            for x in range(n):
                i = L[x, y]
                if not i:
                    continue
                mat, level, flat = self.mats[i]
                ramp = M[mat] if isinstance(mat, str) else mat
                if level is not None and flat:
                    im.putpixel((x, y), ramp[level] + (255,))
                    continue
                x0, y0, x1, y1 = bb[i]
                t = ((x - x0) + (y - y0)) / max(1, (x1 - x0) + (y1 - y0))  # 0 oben links .. 1 unten rechts
                v = 2.4 - 1.6 * t if level is None else level
                same = lambda dx, dy: get(x + dx, y + dy) == i
                if not same(-1, 0) or not same(0, -1):
                    v += 1.0          # Kantenlicht oben/links
                if not same(1, 0) or not same(0, 1):
                    v -= 1.0          # Kantenschatten unten/rechts
                if fugen and (get(x + 1, y) not in (0, i) or get(x, y + 1) not in (0, i)) and get(x + 1, y) != 0:
                    v -= 1.1          # Fuge zum Nachbarteil (dunkle Trennlinie wie bei Codex)
                if n >= 32 and isinstance(mat, str) and mat in TEXTUR and same(-1, 0) and same(1, 0) and same(0, -1) and same(0, 1):
                    art, p = TEXTUR[mat]
                    r = _h(x, y, i)
                    if art == 'dunkel' and r < p:
                        v -= 1
                    elif art == 'kratzer' and r < p:
                        v += 1
                    elif art == 'maser' and (x - y) % 4 == 0 and r < 0.55:
                        v -= 0.7      # Maserung entlang der Diagonale
                v = max(0, min(4, round(v)))
                im.putpixel((x, y), ramp[v] + (255,))
        if outline:
            src = im.copy()
            for y in range(n):
                for x in range(n):
                    if src.getpixel((x, y))[3]:
                        continue
                    if any(0 <= x + a < n and 0 <= y + b < n and src.getpixel((x + a, y + b))[3] for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                        im.putpixel((x, y), OUT)
        return im
