"""Kleine Pixel-Bibliothek für skriptgezeichnete Assets im Spielstil (binäres Alpha, Umriss #1a1c2c, Licht oben links)."""
from PIL import Image
import math

OUT = (26, 28, 44, 255)       # Umriss
BONE = (235, 205, 141)        # Bein-Weiß warm
BONE2 = (187, 174, 149)
HI = (244, 236, 216)
OCC = (111, 224, 208)


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def ramp(base, n=5):
    """dunkel -> hell, aus einer Grundfarbe; Schatten kühl (zum Umriss), Licht warm (zum Bein-Weiß)."""
    b = hexc(base) if isinstance(base, str) else base
    return [mix(b, OUT[:3], 0.62), mix(b, OUT[:3], 0.38), b, mix(b, HI, 0.38), mix(b, HI, 0.72)][:n]


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.px = [[None] * w for _ in range(h)]

    def set(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = None if c is None else tuple(c[:3])

    def get(self, x, y):
        return self.px[y][x] if 0 <= x < self.w and 0 <= y < self.h else None

    def stamp(self, rows, x0, y0, cmap):
        for dy, row in enumerate(rows):
            for dx, ch in enumerate(row):
                if ch in cmap:
                    self.set(x0 + dx, y0 + dy, cmap[ch])

    def outline(self, color=OUT, diag=False):
        """1px Umriss außen um alle Pixel."""
        add = []
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x] is not None:
                    continue
                nb = [(1, 0), (-1, 0), (0, 1), (0, -1)] + ([(1, 1), (-1, 1), (1, -1), (-1, -1)] if diag else [])
                if any(self.get(x + a, y + b) is not None and self.get(x + a, y + b) != color[:3] for a, b in nb):
                    add.append((x, y))
        for x, y in add:
            self.set(x, y, color)

    def image(self):
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        for y in range(self.h):
            for x in range(self.w):
                c = self.px[y][x]
                if c is not None:
                    im.putpixel((x, y), c + (255,))
        return im


def sphere(cv, cx, cy, r, rmp, light=(-0.6, -0.7, 0.4), dither=True):
    """Kugel mit 5er-Rampe, Licht oben links, Schachbrett-Dither an Stufengrenzen."""
    lx, ly, lz = light
    n = math.sqrt(lx * lx + ly * ly + lz * lz)
    lx, ly, lz = lx / n, ly / n, lz / n
    for y in range(cy - r - 1, cy + r + 2):
        for x in range(cx - r - 1, cx + r + 2):
            dx, dy = (x + 0.5 - (cx + 0.5)) / (r + 0.5), (y + 0.5 - (cy + 0.5)) / (r + 0.5)
            d2 = dx * dx + dy * dy
            if d2 > 1:
                continue
            dz = math.sqrt(1 - d2)
            v = max(0, dx * lx + dy * ly + dz * lz)
            t = v * 4.2 - 0.4
            if dither:
                t += 0.35 if (x + y) % 2 else -0.0
            i = max(0, min(4, int(t)))
            cv.set(x, y, rmp[i])
