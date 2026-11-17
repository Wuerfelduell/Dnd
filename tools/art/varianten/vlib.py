"""Variantenwerkzeug: neue Pixelgrafik aus vorhandenen Codex-Bildern (Umfärben, Material, Abnutzung, Okkult-Leuchten).

Alle Operationen arbeiten auf RGBA-Bildern und sind über `seed` reproduzierbar.
"""
from PIL import Image
import colorsys, random, hashlib

OCC = (111, 224, 208)      # türkises Okkult-Leuchten der Spielpalette (#6fe0d0)
OCC_D = (58, 143, 138)     # #3a8f8a
OUTLINE = (26, 28, 44)     # #1a1c2c

MATERIALS = {  # dunkel -> hell
    'gold':     [(74, 52, 30), (138, 98, 40), (213, 173, 104), (235, 205, 141), (255, 236, 180)],
    'messing':  [(66, 50, 32), (122, 92, 48), (178, 138, 80), (213, 173, 104), (240, 214, 150)],
    'kupfer':   [(60, 34, 30), (110, 58, 42), (170, 101, 70), (208, 140, 98), (236, 190, 150)],
    'silber':   [(43, 46, 58), (93, 111, 134), (150, 162, 176), (198, 206, 214), (238, 242, 246)],
    'eisen':    [(37, 43, 59), (52, 65, 84), (71, 85, 104), (110, 120, 134), (160, 168, 176)],
    'rost':     [(53, 47, 49), (104, 71, 62), (139, 93, 73), (170, 121, 86), (196, 150, 104)],
    'kalk':     [(94, 90, 84), (145, 133, 114), (187, 174, 149), (220, 212, 196), (244, 240, 230)],
    'porzellan': [(80, 86, 100), (150, 160, 176), (205, 212, 222), (232, 236, 242), (252, 252, 255)],
    'opal':     [(70, 80, 96), (130, 150, 170), (190, 210, 220), (225, 236, 240), (250, 250, 255)],
    'holz':     [(53, 40, 34), (104, 71, 62), (138, 106, 74), (170, 121, 86), (205, 165, 120)],
    'papier':   [(90, 80, 66), (145, 133, 114), (187, 174, 149), (225, 214, 186), (245, 236, 210)],
    'glut':     [(70, 26, 20), (140, 59, 40), (210, 100, 40), (240, 165, 74), (255, 217, 138)],
}


def rng(seed):
    return random.Random(int(hashlib.md5(str(seed).encode()).hexdigest()[:8], 16))


def load(path, size=None):
    im = Image.open(path).convert('RGBA')
    if size and im.size != size:
        im = im.resize(size, Image.NEAREST if im.size[0] < size[0] or im.size[0] % size[0] == 0 else Image.BOX)
    return im


def lum(c):
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255


def _map(im, fn):
    out = im.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            c = px[x, y]
            if c[3]:
                px[x, y] = fn(c, x, y)
    return out


def is_outline(c):
    return lum(c) < 0.13


def hue(im, deg, sat=1.0, val=1.0, min_sat=0.12):
    """Farbton drehen (nur farbige Pixel), Sättigung/Helligkeit skalieren."""
    def f(c, x, y):
        h, s, v = colorsys.rgb_to_hsv(c[0] / 255, c[1] / 255, c[2] / 255)
        if s >= min_sat:
            h = (h + deg / 360) % 1
            s = min(1, s * sat)
        v = min(1, v * val)
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        return (round(r * 255), round(g * 255), round(b * 255), c[3])
    return _map(im, f)


def tint_to(im, rgb_target, amount=0.6, min_sat=0.0):
    """Farbige Flächen zu einem Zielton ziehen (Flüssigkeit, Stoff); Umriss bleibt."""
    th, ts, tv = colorsys.rgb_to_hsv(*(v / 255 for v in rgb_target))
    def f(c, x, y):
        if is_outline(c):
            return c
        h, s, v = colorsys.rgb_to_hsv(c[0] / 255, c[1] / 255, c[2] / 255)
        if s < min_sat:
            return c
        nh = th
        ns = s + (ts - s) * amount
        r, g, b = colorsys.hsv_to_rgb(nh if amount >= 0.5 else h + (th - h) * amount, ns, v)
        return (round(r * 255), round(g * 255), round(b * 255), c[3])
    return _map(im, f)


def material(im, name, keep_outline=True, only=None):
    """Helligkeit auf eine Materialrampe legen (Gold, Messing, Silber …). `only(c)` begrenzt auf bestimmte Pixel."""
    ramp = MATERIALS[name]
    ls = sorted(lum(im.getpixel((x, y))) for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3])
    lo, hi = (ls[len(ls) // 10], ls[-1]) if ls else (0, 1)
    def f(c, x, y):
        if keep_outline and is_outline(c):
            return c
        if only and not only(c):
            return c
        t = 0 if hi <= lo else max(0, min(1, (lum(c) - lo) / (hi - lo)))
        i = min(len(ramp) - 1, int(t * len(ramp)))
        return ramp[i] + (c[3],)
    return _map(im, f)


def opaque(im, x, y):
    return 0 <= x < im.width and 0 <= y < im.height and im.getpixel((x, y))[3] > 0


def edge_pixels(im, side='top'):
    pts = []
    for y in range(im.height):
        for x in range(im.width):
            if not opaque(im, x, y):
                continue
            nx, ny = {'top': (x, y - 1), 'bottom': (x, y + 1), 'left': (x - 1, y), 'right': (x + 1, y)}[side]
            if not opaque(im, nx, ny):
                pts.append((x, y))
    return pts


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (a[3] if len(a) > 3 else 255,)


def frost(im, seed, amount=0.5):
    """Reif: obere Kanten weiß-blau, ein paar Eiskristalle."""
    out = im.copy()
    r = rng(seed)
    for x, y in edge_pixels(im, 'top'):
        if not is_outline(im.getpixel((x, y))) and r.random() < 0.9:
            out.putpixel((x, y), mix(im.getpixel((x, y)), (214, 238, 246), 0.75))
    inner = [(x, y) for y in range(im.height) for x in range(im.width) if opaque(im, x, y) and not is_outline(im.getpixel((x, y)))]
    for x, y in r.sample(inner, max(1, int(len(inner) * 0.08 * amount * 2))) if inner else []:
        out.putpixel((x, y), mix(im.getpixel((x, y)), (230, 246, 252), 0.6))
    return _map(out, lambda c, x, y: mix(c, (150, 190, 214), 0.18 * amount) if not is_outline(c) else c)


def soot(im, seed, amount=0.25):
    """Ruß: zufällige Pixel abdunkeln, untere Hälfte stärker."""
    r = rng(seed)
    def f(c, x, y):
        if is_outline(c):
            return c
        p = amount * (0.6 + 0.8 * y / max(1, im.height - 1))
        return mix(c, (30, 28, 30), 0.45) if r.random() < p else c
    return _map(im, f)


def moss(im, seed, amount=0.35):
    """Moos: untere Kanten und ein paar Flecken grün."""
    r = rng(seed)
    out = im.copy()
    greens = [(74, 81, 67), (94, 106, 82), (122, 140, 86)]
    for x, y in edge_pixels(im, 'bottom') + edge_pixels(im, 'left'):
        if r.random() < amount * 1.6 and not is_outline(im.getpixel((x, y))):
            out.putpixel((x, y), r.choice(greens) + (255,))
    return out


def puddle(im, seed):
    """Nässe: dunkler, kühler Glanz unten."""
    def f(c, x, y):
        if is_outline(c):
            return c
        t = 0.25 * y / max(1, im.height - 1)
        return mix(c, (52, 65, 84), t)
    return _map(im, f)


def damaged(im, seed, cracks=1, chips=2):
    """Beschädigt: gezackter Riss quer über die Form, abgeplatzte Randpixel."""
    r = rng(seed)
    out = im.copy()
    pts = [(x, y) for y in range(im.height) for x in range(im.width) if opaque(im, x, y) and not is_outline(im.getpixel((x, y)))]
    if not pts:
        return out
    for _ in range(cracks):
        x, y = r.choice(pts)
        dx = r.choice([-1, 1])
        for _ in range(max(3, im.width // 3)):
            if opaque(out, x, y):
                out.putpixel((x, y), OUTLINE + (255,))
                if opaque(out, x + 1, y) and r.random() < 0.4:
                    out.putpixel((x + 1, y), mix(out.getpixel((x + 1, y)), (255, 255, 255), 0.25))
            y += 1
            x += dx if r.random() < 0.6 else 0
            if r.random() < 0.25:
                dx = -dx
    edges = edge_pixels(im, 'top') + edge_pixels(im, 'right')
    for x, y in r.sample(edges, min(chips, len(edges))):
        out.putpixel((x, y), (0, 0, 0, 0))
    return out


def cursed(im, seed, strength=1.0):
    """Verflucht: türkiser Saum um die Form und zwei Funken."""
    r = rng(seed)
    out = im.copy()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            if opaque(im, x, y):
                continue
            n = sum(opaque(im, x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if n:
                out.putpixel((x, y), OCC_D + (int(120 * strength + 40 * min(n, 2)),))
    inner = [(x, y) for y in range(h) for x in range(w) if opaque(im, x, y) and not is_outline(im.getpixel((x, y)))]
    for x, y in r.sample(inner, min(2, len(inner))):
        out.putpixel((x, y), OCC + (255,))
    return out


def glow_core(im, rgb_glow, seed, n=3):
    """Leuchtkern: die hellsten Pixel in Glühfarbe."""
    pts = sorted(((lum(im.getpixel((x, y))), x, y) for y in range(im.height) for x in range(im.width) if opaque(im, x, y)), reverse=True)
    out = im.copy()
    for _, x, y in pts[:max(n, len(pts) // 8)]:
        out.putpixel((x, y), mix(im.getpixel((x, y)), rgb_glow, 0.8))
    return out


def seal(im, color=(194, 58, 42), pos='br'):
    """Wachssiegel 4x4 in eine Ecke setzen."""
    out = im.copy()
    w, h = im.size
    x0 = w - 5 if 'r' in pos else 1
    y0 = h - 5 if 'b' in pos else 1
    dark = tuple(max(0, v // 2 - 10) for v in color)
    light = mix(color + (255,), (255, 220, 190), 0.35)
    shape = ['.dd.', 'dccd', 'dcld', '.dd.']
    for j, row in enumerate(shape):
        for i, ch in enumerate(row):
            if ch == '.':
                continue
            out.putpixel((x0 + i, y0 + j), {'d': dark + (255,), 'c': color + (255,), 'l': light}[ch])
    return out


def speckle(im, seed, rgb_col, amount=0.12):
    r = rng(seed)
    return _map(im, lambda c, x, y: mix(c, rgb_col, 0.7) if not is_outline(c) and r.random() < amount else c)


def flip(im):
    return im.transpose(Image.FLIP_LEFT_RIGHT)


def apply(im, ops, seed):
    """ops: Liste aus Tupeln ('hue', 40), ('mat', 'gold'), ('frost',), ('soot', .3), ('damaged',), ('cursed',), ('seal', (r,g,b)), …"""
    for i, op in enumerate(ops):
        name, *args = op
        s = f'{seed}:{i}'
        if name == 'hue':
            im = hue(im, *args)
        elif name == 'tint':
            im = tint_to(im, *args)
        elif name == 'mat':
            im = material(im, *args)
        elif name == 'frost':
            im = frost(im, s, *args)
        elif name == 'soot':
            im = soot(im, s, *args)
        elif name == 'moss':
            im = moss(im, s, *args)
        elif name == 'wet':
            im = puddle(im, s)
        elif name == 'damaged':
            im = damaged(im, s, *args)
        elif name == 'cursed':
            im = cursed(im, s, *args)
        elif name == 'glow':
            im = glow_core(im, args[0], s, *args[1:])
        elif name == 'seal':
            im = seal(im, *args)
        elif name == 'speckle':
            im = speckle(im, s, *args)
        elif name == 'flip':
            im = flip(im)
        else:
            raise ValueError(name)
    return im


def sheet(images, cols, scale=3, bg=(40, 40, 48, 255), pad=2):
    w = max(i.width for i in images) + pad
    h = max(i.height for i in images) + pad
    rows = (len(images) + cols - 1) // cols
    out = Image.new('RGBA', (cols * w, rows * h), bg)
    for n, i in enumerate(images):
        out.alpha_composite(i, ((n % cols) * w + 1, (n // cols) * h + 1))
    return out.resize((out.width * scale, out.height * scale), Image.NEAREST)
