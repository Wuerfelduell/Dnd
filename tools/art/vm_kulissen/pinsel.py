"""Pinsel für die Varrowmouth-Kulissen (Runde 1): zeichnet pixelweise mit Palettenindizes.
Nur die 32 Farben aus manifest-varrowmouth1.json, binäres Alpha, 1px-Umriss #1a1c2c, Licht oben links,
körnige Zwei-Stufen-Textur wie die CV-Vorlagen (Rauschen statt glatter Verläufe)."""
import json, math, os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
_M = json.load(open(os.path.join(ROOT, 'public', 'sprites', 'manifest-varrowmouth1.json'), encoding='utf-8'))
PAL = [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in _M['palette']]
assert len(PAL) == 32


def palette_aus(manifest):
    """Palette eines anderen Manifests verwenden (z. B. manifest-briarholt1.json); die Rampen-Konstanten oben gelten dann nicht."""
    global PAL
    m = json.load(open(os.path.join(ROOT, 'public', 'sprites', manifest), encoding='utf-8'))
    PAL = [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in m['palette']]
    return PAL

# Rampen (dunkel -> hell), Indizes in PAL
OUT = 0
BLAU = [1, 2, 3, 4, 5, 6, 7, 8, 9]
STEIN = [10, 11, 12, 13, 14, 15]
ALGE = [16, 17, 18, 19, 20]
SEE = [21, 22, 23, 24]
HOLZ = [10, 25, 26, 27, 28]
HOLZ_NASS = [1, 10, 25, 26, 27]
SAND = [25, 26, 27, 28, 29]
MESSING = [25, 27, 28, 29, 30]
SALZ = [6, 7, 8, 9]
TUERKIS = 31


def h3(x, y, s=0):
    """deterministisches Rauschen 0..1"""
    n = (x * 374761393 + y * 668265263 + s * 982451653) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFFFFFF) / 4294967295


class Bild:
    def __init__(self, w, h, seed=1):
        self.w, self.h, self.seed = w, h, seed
        self.p = [[None] * w for _ in range(h)]

    def set(self, x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[y][x] = c

    def get(self, x, y):
        return self.p[y][x] if 0 <= x < self.w and 0 <= y < self.h else None

    # -- Flächen mit Textur ---------------------------------------------------------------------------
    def ton(self, x, y, ramp, v, korn=0.22, s=0):
        """v 0..1 -> Rampenstufe, mit Korn zwischen zwei Nachbarstufen"""
        t = v * (len(ramp) - 1) + (h3(x, y, self.seed + s) - 0.5) * 2 * korn
        i = max(0, min(len(ramp) - 1, int(round(t))))
        self.set(x, y, ramp[i])

    def rechteck(self, x0, y0, x1, y1, ramp, v=0.5, korn=0.22, licht=0.0, s=0):
        """gefülltes Rechteck (inklusive), licht>0: links/oben heller"""
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                vv = v
                if licht:
                    fx = (x - x0) / max(1, x1 - x0)
                    fy = (y - y0) / max(1, y1 - y0)
                    vv = v + licht * (0.5 - 0.6 * fx - 0.4 * fy)
                self.ton(x, y, ramp, max(0, min(1, vv)), korn, s)

    def maske(self, fn, ramp, vfn, korn=0.22, s=0):
        """fn(x,y)->bool Fläche, vfn(x,y)->Helligkeit"""
        for y in range(self.h):
            for x in range(self.w):
                if fn(x, y):
                    self.ton(x, y, ramp, max(0, min(1, vfn(x, y))), korn, s)

    def zylinder(self, x0, x1, y0, y1, ramp, korn=0.18, s=0, hell=0.62):
        """senkrechter Pfahl: Licht links"""
        w = max(1, x1 - x0)
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                f = (x - x0) / w
                v = hell - 0.7 * (f - 0.3) ** 2 * 2.2 - (0.12 if f > 0.75 else 0)
                self.ton(x, y, ramp, max(0, min(1, v)), korn, s)

    def linie(self, x0, y0, x1, y1, c):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            self.set(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), c)

    def poly(self, pts, ramp, vfn=lambda x, y: 0.5, korn=0.22, s=0):
        ys = [p[1] for p in pts]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            xs = []
            for i in range(len(pts)):
                (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
                if (ay <= y + 0.5 < by) or (by <= y + 0.5 < ay):
                    xs.append(ax + (y + 0.5 - ay) * (bx - ax) / (by - ay))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(int(math.ceil(a - 0.5)), int(math.floor(b - 0.5)) + 1):
                    self.ton(x, y, ramp, max(0, min(1, vfn(x, y))), korn, s)

    def ellipse(self, cx, cy, rx, ry, ramp, vfn=None, korn=0.22, s=0):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
                if dx * dx + dy * dy <= 1:
                    v = vfn(x, y) if vfn else 0.55 - 0.35 * dx - 0.25 * dy
                    self.ton(x, y, ramp, max(0, min(1, v)), korn, s)

    def streu(self, fn, c, dichte, s=7):
        """einzelne Pixel (Salz, Algen, Muscheln) auf vorhandene Fläche"""
        for y in range(self.h):
            for x in range(self.w):
                if self.p[y][x] is not None and self.p[y][x] != OUT and fn(x, y) and h3(x, y, self.seed + s) < dichte:
                    self.p[y][x] = c

    # -- Umriss ---------------------------------------------------------------------------------------
    def umriss(self, c=OUT, rand=True):
        """1px außen; rand=False: an den Bildkanten links/rechts nicht schließen (Kachelfortsetzung)"""
        add = []
        for y in range(self.h):
            for x in range(self.w):
                if self.p[y][x] is not None:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    q = self.get(x + dx, y + dy)
                    if q is not None and q != c:
                        add.append((x, y))
                        break
        for x, y in add:
            self.p[y][x] = c

    def kante_innen(self, fn, c=OUT):
        """dunkle Trennlinie im Inneren, wo fn(x,y) wahr ist und Pixel belegt"""
        for y in range(self.h):
            for x in range(self.w):
                if self.p[y][x] is not None and fn(x, y):
                    self.p[y][x] = c

    def leer(self, x, y):
        self.set(x, y, None)

    def einfuegen(self, other, ox, oy):
        for y in range(other.h):
            for x in range(other.w):
                if other.p[y][x] is not None:
                    self.set(ox + x, oy + y, other.p[y][x])

    def gespiegelt(self):
        b = Bild(self.w, self.h, self.seed)
        b.p = [row[::-1] for row in self.p]
        return b

    def image(self):
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        px = im.load()
        for y in range(self.h):
            for x in range(self.w):
                c = self.p[y][x]
                if c is not None:
                    px[x, y] = PAL[c] + (255,)
        return im


def streifen(bilder):
    """Frames gleicher Größe nebeneinander"""
    w, h = bilder[0].w, bilder[0].h
    im = Image.new('RGBA', (w * len(bilder), h), (0, 0, 0, 0))
    for i, b in enumerate(bilder):
        im.alpha_composite(b.image(), (i * w, 0))
    return im
