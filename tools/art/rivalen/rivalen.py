"""Kampfblätter der Rivalen (Sequenz 9-5), je Pfad eine Figur, die ihren Pfad zeigt.
python3 tools/art/rivalen/rivalen.py -> public/sprites/battle/enemy_rv_<pfad>.png (288x240, Zellen 48x48, 6x5), manifest-rivalen.json
Reihen wie die Leihkörper (k3k/wxk): idle 0-3, attack 6-11, special 12-17, hurt 18-20, defeated 24-27. Blick nach links.
Ruhe und Angriff sind eigens gezeichnet; Spezial (Angriff mit voller Pfadwirkung), Treffer und Niederlage aus denselben Posen.
Palette: manifest-halbgott.json (wie die Halbgott-Blätter derselben Rivalen ab Sequenz 4)."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import pinsel
from pinsel import Bild, h3, ROOT
from PIL import Image

PAL = pinsel.palette_aus('manifest-halbgott.json')
OUT = 0
HAUT = [5, 12, 13, 17]
R = {'navy': [7, 1, 2, 16, 19], 'rost': [7, 30, 31, 12], 'grau': [2, 16, 19, 20, 21], 'schwarz': [7, 7, 1, 2, 16], 'lila': [7, 27, 28, 29],
     'braun': [7, 6, 8, 5, 12], 'wein': [7, 23, 30, 31], 'eisen': [1, 2, 16, 19, 20, 18], 'leder': [7, 6, 8, 5], 'oliv': [7, 11, 10, 15],
     'moos': [7, 26, 25, 10, 15], 'gold': [9, 3, 4, 14], 'creme': [12, 13, 22], 'tuerkis': [26, 25, 24], 'rot': [7, 23, 31],
     'hose': [7, 1, 2, 16], 'haar_dunkel': [7, 6, 8], 'haar_rot': [7, 30, 31], 'haar_grau': [16, 19, 20, 21], 'haar_blond': [9, 5, 12, 13]}


# --- Zeichenhilfen ------------------------------------------------------------------------------------------------------------------
def kapsel(b, p0, p1, r, ramp, s=0, korn=0.2):
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy or 1
    for y in range(int(min(y0, y1) - r - 1), int(max(y0, y1) + r + 2)):
        for x in range(int(min(x0, x1) - r - 1), int(max(x0, x1) + r + 2)):
            t = max(0, min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / L2))
            cx, cy = x0 + t * dx, y0 + t * dy
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            if d <= r:
                n = (x + 0.5 - cx) / max(0.5, r)          # Licht von links
                b.ton(x, y, ramp, 0.7 - 0.45 * n - 0.15 * (d / r), korn, s)


def kreis(b, cx, cy, r, ramp, s=0, korn=0.15):
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            ddx, ddy = (x + 0.5 - cx) / r, (y + 0.5 - cy) / r
            if ddx * ddx + ddy * ddy <= 1:
                b.ton(x, y, ramp, 0.72 - 0.4 * ddx - 0.3 * ddy, korn, s)


def poly(b, pts, ramp, s=0, korn=0.22, falten=True):
    xs = [p[0] for p in pts]
    x0, x1 = min(xs), max(xs)
    def v(x, y):
        f = (x - x0) / max(1, x1 - x0)
        w = 0.78 - 0.62 * f
        if falten and (int(x) + int(y) // 3) % 7 == 0 and y > min(p[1] for p in pts) + 6:
            w -= 0.25
        return w
    b.poly(pts, ramp, vfn=v, korn=korn, s=s)


def P(p, dx, dy):
    return (p[0] + dx, p[1] + dy)


# --- Figuren ------------------------------------------------------------------------------------------------------------------------
class Rivale:
    def __init__(self, pfad, name, mantel, hose, haar, hut=None, mantel_art='lang', extra=None, effekt=None, item=None, breit=0, kragen=None, maske=False, gesicht_hell=False):
        self.pfad, self.name = pfad, name
        self.mantel, self.hose, self.haar = R[mantel], R[hose], R[haar]
        self.hut, self.mantel_art, self.extra, self.effekt, self.item = hut, mantel_art, extra, effekt, item
        self.breit, self.kragen, self.maske = breit, kragen, maske


def pose(art, f):
    """Skelettpunkte je Animation und Frame (Blick nach links)."""
    q = dict(kopf=(21, 13), hals=(22, 18), sv=(18, 20), sh=(29, 20), huefte=(25, 31), kv=(18, 38), kh=(31, 38), fv=(14, 45), fh=(34, 45),
             ev=(15, 26), hv=(13, 30), eh=(32, 26), hh=(33, 31), wirk=0, glanz=f % 2)
    def ober(dx, dy):
        for k in ('kopf', 'hals', 'sv', 'sh', 'ev', 'hv', 'eh', 'hh'):
            q[k] = P(q[k], dx, dy)
        q['huefte'] = P(q['huefte'], dx // 2, dy)
    if art == 'idle':
        ober(0, [0, 0, 1, 1][f])
        q['hv'] = P(q['hv'], 0, [0, 1, 1, 0][f])
    elif art in ('attack', 'special'):
        if f == 1:
            ober(2, 0); q['ev'], q['hv'] = (23, 24), (27, 20)
        elif f == 2:
            ober(3, -1); q['ev'], q['hv'] = (25, 21), (29, 15)
        elif f in (3, 4):
            ober(-3, 1); q['ev'], q['hv'] = (14, 22), (10, 22); q['kv'] = (16, 38); q['fv'] = (12, 45)
            q['wirk'] = 1 if f == 3 else 2
        elif f == 5:
            ober(-1, 0); q['ev'], q['hv'] = (15, 24), (12, 26); q['wirk'] = 3
    elif art == 'hurt':
        ober([3, 4, 2][f], [0, 1, 0][f]); q['ev'], q['hv'] = (20, 16), (17, 12); q['eh'], q['hh'] = (33, 21), (35, 17)
    elif art == 'defeated':
        tief = [2, 6, 10, 13][f]
        ober([3, 1, -1, -4][f], tief + (2 if f == 3 else 0))
        q['huefte'] = P(q['huefte'], 0, tief)
        q['kv'], q['kh'] = [((18, 39), (31, 39)), ((17, 41), (32, 41)), ((15, 43), (32, 44)), ((13, 44), (32, 45))][f]
        q['fh'] = (36, 45) if f >= 2 else q['fh']
        q['ev'], q['hv'] = [((16, 28), (14, 32)), ((15, 32), (13, 37)), ((14, 37), (12, 42)), ((11, 41), (9, 44))][f]
        q['eh'], q['hh'] = [((32, 28), (33, 33)), ((32, 32), (33, 37)), ((31, 37), (32, 42)), ((30, 41), (31, 44))][f]
    return q


def figur(rv, art, f):
    b = Bild(48, 48, seed=17 + f)
    q = pose(art, f)
    M, Hs, Hr = rv.mantel, rv.hose, rv.haar
    dunkel = lambda ramp: [ramp[0]] + ramp[:-1]
    # hinterer Arm und hinteres Bein
    kapsel(b, q['sh'], q['eh'], 2.7, dunkel(M), 1)
    kapsel(b, q['eh'], q['hh'], 2.4, dunkel(M), 1)
    kreis(b, q['hh'][0], q['hh'][1] + 1, 2.2, dunkel(HAUT), 2)
    kapsel(b, P(q['huefte'], 3, 0), q['kh'], 3.0, dunkel(Hs), 3)
    kapsel(b, q['kh'], q['fh'], 2.6, dunkel(Hs), 3)
    kapsel(b, P(q['fh'], 0, 0), P(q['fh'], 3, 0), 1.7, [7, 7, 1], 4)
    # vorderes Bein
    kapsel(b, P(q['huefte'], -3, 0), q['kv'], 3.1, Hs, 5)
    kapsel(b, q['kv'], q['fv'], 2.7, Hs, 5)
    kapsel(b, P(q['fv'], -3, 0), P(q['fv'], 1, 0), 1.7, [7, 1, 2], 6)
    # Mantel / Rumpf
    sv, sh, hu = q['sv'], q['sh'], q['huefte']
    w = rv.breit
    if rv.mantel_art == 'lang':
        saum = max(hu[1] + 10, 40) if art != 'defeated' else hu[1] + 8
        pts = [P(sv, -2 - w, -2), P(sh, 2 + w, -2), P(hu, 8 + w, 0), (hu[0] + 11 + w, saum), (hu[0] - 12 - w, saum), P(hu, -8 - w, 0)]
    elif rv.mantel_art == 'rock':
        saum = hu[1] + 12 if art != 'defeated' else hu[1] + 9
        pts = [P(sv, -2, -2), P(sh, 2, -2), P(hu, 6, 0), (hu[0] + 12, saum), (hu[0] - 13, saum), P(hu, -7, 0)]
    else:  # kurz (Jacke)
        pts = [P(sv, -2 - w, -2), P(sh, 2 + w, -2), P(hu, 8 + w, 3), P(hu, -8 - w, 3)]
    poly(b, pts, M, 7)
    # Gürtel und Revers
    for x in range(hu[0] - 7 - w, hu[0] + 8 + w):
        if b.get(x, hu[1]) is not None:
            b.set(x, hu[1], M[0]); 
    if b.get(hu[0] - 1, hu[1]) is not None:
        b.set(hu[0] - 1, hu[1], 3)
    for t in range(0, 8):
        x, y = int(sv[0] + 2 + t * 0.4), sv[1] + 1 + t
        if b.get(x, y) is not None:
            b.set(x, y, M[min(len(M) - 1, 3)])
    if rv.kragen:
        kapsel(b, P(sv, 0, 0), P(sh, 0, 0), 1.4, R[rv.kragen], 8)
    # Kopf
    kx, ky = q['kopf']
    kreis(b, kx, ky, 5.6, HAUT, 9)
    if rv.maske:
        kreis(b, kx - 1, ky, 4.2, [21, 18, 22], 10, korn=0.05)
        b.set(kx - 3, ky - 1, 0); b.set(kx - 1, ky - 1, 0); b.set(kx - 2, ky + 2, 23)
    else:
        b.set(kx - 3, ky - 1, 0)  # Auge
        b.set(kx - 5, ky + 1, HAUT[1])  # Nase
        b.set(kx - 3, ky + 3, 6)
    # Haar (hinten und oben)
    for y in range(ky - 6, ky + 4):
        for x in range(kx - 3, kx + 7):
            d = math.hypot(x + 0.5 - kx, y + 0.5 - ky)
            if d <= 5.6 and (y < ky - 2 or x > kx + 1):
                b.ton(x, y, Hr, 0.7 - 0.08 * (x - kx + 3) - 0.04 * (y - ky + 6), 0.2, 11)
    hut(b, rv, kx, ky)
    # vorderer Arm
    kapsel(b, sv, q['ev'], 2.8, M, 12)
    kapsel(b, q['ev'], q['hv'], 2.5, M, 12)
    kreis(b, q['hv'][0], q['hv'][1], 2.3, HAUT, 13)
    for (a_, b_) in ((sv, q['ev']),):  # Glanzlicht auf dem Ärmel
        for t in range(2, 6):
            x, y = int(a_[0] + (b_[0] - a_[0]) * t / 7) - 1, int(a_[1] + (b_[1] - a_[1]) * t / 7)
            if b.get(x, y) is not None:
                b.set(x, y, M[-1])
    if rv.extra:
        rv.extra(b, q, art, f)
    if rv.item:
        rv.item(b, q, art, f)
    b.umriss(OUT)
    if rv.effekt and q['wirk']:
        rv.effekt(b, q, q['wirk'] + (1 if art == 'special' and q['wirk'] < 3 else 0), art == 'special')
    if art == 'hurt' and f == 0:  # Trefferblitz
        for y in range(48):
            for x in range(48):
                c = b.get(x, y)
                if c not in (None, OUT):
                    b.set(x, y, {7: 2, 1: 16, 2: 19, 6: 8, 8: 5, 5: 12, 12: 13, 13: 17, 17: 22}.get(c, c))
    return b


def hut(b, rv, kx, ky):
    if rv.hut == 'zylinder':
        kapsel(b, (kx - 6, ky - 5), (kx + 7, ky - 5), 1.0, [7, 1, 2], 20)
        for y in range(ky - 13, ky - 5):
            for x in range(kx - 3, kx + 5):
                b.ton(x, y, [7, 1, 2, 16], 0.7 - 0.1 * (x - kx + 3), 0.12, 21)
        for x in range(kx - 3, kx + 5):
            b.set(x, ky - 7, 23)
    elif rv.hut == 'krempe':
        kapsel(b, (kx - 8, ky - 4), (kx + 8, ky - 4), 1.1, [7, 2, 16, 19], 22)
        for y in range(ky - 9, ky - 4):
            for x in range(kx - 4, kx + 5):
                b.ton(x, y, [7, 2, 16, 19], 0.65 - 0.08 * (x - kx + 4), 0.12, 23)
    elif rv.hut == 'kapuze':
        for y in range(ky - 7, ky + 6):
            for x in range(kx - 4, kx + 8):
                d = math.hypot(x + 0.5 - kx - 1, y + 0.5 - ky)
                if 4.6 <= d <= 7.2 or (d <= 7.2 and x > kx + 1):
                    b.ton(x, y, rv.mantel, 0.65 - 0.06 * (x - kx + 4), 0.2, 24)
    elif rv.hut == 'kappe':
        for y in range(ky - 7, ky - 3):
            for x in range(kx - 4, kx + 6):
                if math.hypot(x + 0.5 - kx, y + 0.5 - ky) <= 6.5:
                    b.ton(x, y, R['leder'], 0.7 - 0.08 * (x - kx + 4), 0.15, 25)
        kapsel(b, (kx - 7, ky - 3), (kx - 3, ky - 3), 0.8, [7, 6], 26)
    elif rv.hut == 'tuch':
        for y in range(ky - 7, ky + 6):
            for x in range(kx - 3, kx + 8):
                d = math.hypot(x + 0.5 - kx - 1, y + 0.5 - ky)
                if d <= 6.8 and (y < ky - 2 or x > kx + 1):
                    b.ton(x, y, R['moos'], 0.6 - 0.06 * (x - kx + 3), 0.3, 27)


# --- Pfadgegenstände und Wirkungen ---------------------------------------------------------------------------------------------------
def glow(b, cx, cy, r, ramp, dichte=1.0, s=0):
    """gerastertes Leuchten ohne Umriss"""
    bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    for y in range(int(cy - r), int(cy + r + 1)):
        for x in range(int(cx - r), int(cx + r + 1)):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r
            if d <= 1 and (1 - d) * dichte * 1.4 > bayer[y % 4][x % 4] / 16:
                i = min(len(ramp) - 1, int((1 - d) * len(ramp)))
                if 0 <= x < 48 and 0 <= y < 48:
                    b.set(x, y, ramp[i])


def laterne(b, q, art, f):
    x, y = q['hv']
    b.set(x, y - 2, 7); b.set(x, y - 3, 7)
    for yy in range(y - 1, y + 6):
        for xx in range(x - 2, x + 3):
            rand = xx in (x - 2, x + 2) or yy in (y - 1, y + 5)
            b.set(xx, yy, 9 if rand else (14 if (yy - y + f) % 3 else 4))
def eff_laterne(b, q, w, spezial):
    x, y = q['hv']
    r = [0, 6, 9, 5, 11][w]
    glow(b, x - r * 0.4, y + 2, r, [3, 4, 14, 22], 1.0)
    if w >= 2:
        for i in range(6):
            a = math.pi + (i - 2.5) * 0.25
            for t in range(r // 2, r + 6):
                xx, yy = int(x + math.cos(a) * t), int(y + 2 + math.sin(a) * t)
                if 0 <= xx < 48 and 0 <= yy < 48 and t % 2 == 0:
                    b.set(xx, yy, 14 if t % 4 else 22)


def schluessel(b, q, art, f):
    x, y = q['hv']
    a = math.atan2(q['hv'][1] - q['ev'][1], q['hv'][0] - q['ev'][0])
    for t in range(0, 10):
        xx, yy = int(x + math.cos(a) * t), int(y + math.sin(a) * t)
        b.set(xx, yy, 3 if t % 3 else 4); b.set(xx, yy + 1, 9)
    ex, ey = int(x + math.cos(a) * 9), int(y + math.sin(a) * 9)
    b.set(ex, ey + 2, 3); b.set(ex - 1, ey + 2, 3); b.set(ex, ey + 3, 9)
    kreis(b, x - math.cos(a) * 2, y - math.sin(a) * 2, 2.0, [9, 3, 4], 30)
    b.set(int(x - math.cos(a) * 2), int(y - math.sin(a) * 2), 0)
def schluesselbund(b, q, art, f):
    x, y = q['huefte']
    for i, (dx, dy) in enumerate(((-2, 1), (0, 3), (2, 2))):
        b.set(x + dx, y + dy, 4 if i % 2 else 3); b.set(x + dx, y + dy + 1, 9)
def eff_schluessel(b, q, w, spezial):
    x, y = q['hv']
    cx = x - [0, 4, 6, 5, 7][w]
    r = [0, 3, 5, 4, 6][w]
    for t in range(0, 360, 12):
        a = math.radians(t)
        xx, yy = int(cx + math.cos(a) * r), int(y + math.sin(a) * r)
        if 0 <= xx < 48 and 0 <= yy < 48:
            b.set(xx, yy, 24)
    if w >= 2:  # Schlüsselloch in der Mitte
        for yy in range(y - 2, y + 4):
            b.set(int(cx), yy, 24 if yy > y else 22)
        b.set(int(cx) - 1, y - 1, 24); b.set(int(cx) + 1, y - 1, 24)


def echo(b, q, art, f):
    x, y = q['kopf']
    if f % 2 == 0 and art == 'idle':
        for i in range(2):
            b.set(x - 7 - i, y + 1 - i, 29)
def eff_echo(b, q, w, spezial):
    x, y = q['kopf']
    for k in range(1, w + 2):
        r = 4 + k * 4
        for t in range(-50, 51, 6):
            a = math.pi + math.radians(t)
            xx, yy = int(x - 3 + math.cos(a) * r), int(y + 2 + math.sin(a) * r)
            if 0 <= xx < 48 and 0 <= yy < 48:
                b.set(xx, yy, [29, 28, 22][k % 3])


def maske_hand(b, q, art, f):
    if art in ('attack', 'special') and q['wirk']:
        return
def eff_maske(b, q, w, spezial):
    x, y = q['hv']
    for k in range(min(w, 3)):
        cx, cy = x - 4 - k * 4, y - 3 + (k % 2) * 4
        kreis(b, cx, cy, 3.2 - k * 0.4, [18, 22, 22], 40 + k, korn=0.05)
        b.set(int(cx) - 1, int(cy) - 1, 0); b.set(int(cx) + 1, int(cy) - 1, 0); b.set(int(cx), int(cy) + 1, 23)


def faden_hand(b, q, art, f):
    x, y = q['hv']
    for i in range(3):
        for t in range(1, 6):
            b.set(x - t, y + i - 1 + (t * (i - 1)) // 3, 22 if t % 2 else 13)
def spule(b, q, art, f):
    x, y = q['huefte']
    for yy in range(y + 1, y + 5):
        b.set(x - 4, yy, 28); b.set(x - 3, yy, 22 if yy % 2 else 13); b.set(x - 2, yy, 28)
def eff_faden(b, q, w, spezial):
    x, y = q['hv']
    for i in range(4 + w):
        ln = [0, 10, 18, 16, 22][w]
        for t in range(ln):
            xx = x - t
            yy = int(y + math.sin(t / 3 + i) * (1 + i * 0.6) + (i - 2) * t / 8)
            if 0 <= xx < 48 and 0 <= yy < 48:
                b.set(xx, yy, 22 if (t + i) % 3 else 29)


def taschenuhr(b, q, art, f):
    x, y = q['hv']
    sw = [-1, 0, 1, 0][f % 4] if art == 'idle' else 0
    for t in range(1, 5):
        b.set(x + (sw * t) // 3, y + t, 3)
    kreis(b, x + sw, y + 7, 2.6, [9, 3, 4, 14], 50)
    b.set(x + sw, y + 7, 22); b.set(x + sw, y + 6, 0)
def uhrkette(b, q, art, f):
    x, y = q['huefte']
    for i, dx in enumerate(range(-4, 3)):
        b.set(x + dx, y - 4 + abs(dx + 1) // 2, 3 if i % 2 else 4)
def eff_uhr(b, q, w, spezial):
    x, y = q['hv']
    cx, r = x - [0, 4, 6, 5, 7][w], [0, 4, 6, 5, 7][w]
    for t in range(0, 360, 10):
        a = math.radians(t)
        xx, yy = int(cx + math.cos(a) * r), int(y + math.sin(a) * r)
        if 0 <= xx < 48 and 0 <= yy < 48:
            b.set(xx, yy, 14 if t % 30 else 22)
    for (a, ln, c) in ((-90 + w * 40, r - 2, 22), (-90 + w * 100, r - 4, 3)):
        for t in range(ln):
            xx, yy = int(cx + math.cos(math.radians(a)) * t), int(y + math.sin(math.radians(a)) * t)
            if 0 <= xx < 48 and 0 <= yy < 48:
                b.set(xx, yy, c)


def waage(b, q, art, f):
    x, y = q['hv']
    tilt = {'idle': [0, 1, 0, -1][f % 4]}.get(art, 2 if q['wirk'] else 0)
    for t in range(0, 5):
        b.set(x, y - t, 9)
    for t in range(-5, 6):
        b.set(x + t, y - 5 + (t * tilt) // 5, 3)
    for side in (-5, 5):
        px, py = x + side, y - 5 + (side * tilt) // 5
        b.set(px, py + 1, 9); b.set(px, py + 2, 9)
        for t in range(-2, 3):
            b.set(px + t, py + 3, 4 if t else 3)
def eff_waage(b, q, w, spezial):
    x, y = q['hv']
    for k in range(w + 1):
        cx, cy = x - 3 - k * 3, y - 5 + k * 4
        kreis(b, cx, cy, 2.2, [9, 3, 4, 14], 60 + k, korn=0.05)
        b.set(int(cx), int(cy), 14)
    if w >= 2:
        glow(b, x - 5, y, 4 + w, [3, 4, 14], 0.7)


def faust(b, q, art, f):
    x, y = q['hv']
    kreis(b, x, y, 3.0, R['eisen'], 70)
    for (dx, dy) in ((-2, -1), (-2, 1), (0, -2)):
        b.set(x + dx, y + dy, 1)
    ex, ey = q['ev']
    for t in range(0, 4):  # Kette am Unterarm
        b.set(int(ex + (x - ex) * t / 4), int(ey + (y - ey) * t / 4) + 2, 20 if t % 2 else 18)
def schulterplatte(b, q, art, f):
    kreis(b, q['sv'][0] + 1, q['sv'][1], 3.2, R['eisen'], 71)
def eff_eisen(b, q, w, spezial):
    x, y = q['hv']
    for i in range(6 + w * 3):
        a = math.pi + (h3(i, w, 72) - 0.5) * 2.2
        ln = 3 + int(h3(i, 1, 73) * (4 + w * 3))
        for t in range(2, ln):
            xx, yy = int(x - 2 + math.cos(a) * t), int(y + math.sin(a) * t)
            if 0 <= xx < 48 and 0 <= yy < 48:
                b.set(xx, yy, 22 if t < ln - 2 else 18)
    if w >= 2:
        kreis(b, x - 4, y, 3.5, [18, 22], 74, korn=0.05)


def phiole(b, q, art, f):
    if art in ('attack', 'special') and q['wirk'] >= 1:
        return
    x, y = q['hv']
    for yy in range(y - 4, y + 2):
        for xx in range(x - 1, x + 2):
            b.set(xx, yy, 24 if yy > y - 2 else (21 if xx == x - 1 else 18))
    b.set(x, y - 5, 6)
def bandelier(b, q, art, f):
    sv, hu = q['sv'], q['huefte']
    for t in range(0, 10):
        x, y = int(sv[0] + 2 + (hu[0] + 4 - sv[0]) * t / 10), int(sv[1] + 1 + (hu[1] - sv[1]) * t / 10)
        b.set(x, y, 6)
        if t % 3 == 1:
            b.set(x, y - 1, [24, 23, 29][t // 3 % 3])
def eff_kessel(b, q, w, spezial):
    x, y = q['hv']
    if w == 1:
        for yy in range(y - 6, y - 1):
            b.set(x - 5, yy, 24 if yy > y - 4 else 18)
    else:
        cx = x - [0, 0, 5, 4, 6][w]
        glow(b, cx, y + 2, [0, 0, 6, 5, 7][w], [26, 25, 24, 22], 1.1)
        for i in range(5 + w * 2):
            a = math.radians(200 + h3(i, w, 80) * 140)
            t = 4 + h3(i, 2, 81) * 6
            xx, yy = int(cx + math.cos(a) * t), int(y + 2 + math.sin(a) * t)
            if 0 <= xx < 48 and 0 <= yy < 48:
                b.set(xx, yy, 24)


def schilfstab(b, q, art, f):
    x, y = q['hv']
    for t in range(-14, 12):
        xx, yy = x + t // 8, y + t
        if 0 <= yy < 48:
            b.set(xx, yy, 8 if t % 4 else 6)
    for (dx, dy) in ((0, -15), (1, -16), (-1, -16), (0, -17)):
        b.set(x + dx - 2, y + dy, 10)
    b.set(x - 2, y - 18, 15)
def moosfransen(b, q, art, f):
    hu = q['huefte']
    for x in range(hu[0] - 9, hu[0] + 9, 2):
        y = hu[1] + 12 + (x % 3)
        if b.get(x, y - 1) is not None:
            b.set(x, y, 25); b.set(x, y + 1, 26)
def eff_moor(b, q, w, spezial):
    x, y = q['hv']
    for i in range(2 + w):
        bx = x - 4 - i * 4
        hoehe = 4 + w * 3 - i
        for t in range(hoehe):
            xx, yy = bx + int(math.sin(t / 2 + i) * 1.5), 45 - t
            if 0 <= xx < 48:
                b.set(xx, yy, 26 if t < hoehe - 2 else 25); b.set(xx + 1, yy, 11)
    for xx in range(max(0, x - 6 - w * 5), x - 2):
        b.set(xx, 46, 11); b.set(xx, 45, 26 if xx % 2 else 6)


def both(*fs):
    def g(b, q, art, f):
        for fn in fs:
            if fn:
                fn(b, q, art, f)
    return g


RIVALEN = {
    'laterne': Rivale('laterne', 'Corvin Ashby', 'navy', 'hose', 'haar_dunkel', hut='zylinder', item=laterne, effekt=eff_laterne, kragen='creme'),
    'schluessel': Rivale('schluessel', 'Nell Quist', 'rost', 'hose', 'haar_rot', hut='kappe', mantel_art='kurz', item=schluessel, extra=schluesselbund, effekt=eff_schluessel),
    'echo': Rivale('echo', 'Petra Sandor', 'grau', 'hose', 'haar_blond', hut='krempe', item=echo, effekt=eff_echo, kragen='lila'),
    'maske': Rivale('maske', 'Silas Morrel', 'schwarz', 'hose', 'haar_dunkel', hut='kapuze', maske=True, item=maske_hand, effekt=eff_maske, kragen='rot'),
    'faden': Rivale('faden', 'Mirela Stroud', 'lila', 'hose', 'haar_dunkel', mantel_art='rock', item=faden_hand, extra=spule, effekt=eff_faden, kragen='creme'),
    'sq_uhr': Rivale('sq_uhr', 'Tobias Merrin', 'braun', 'hose', 'haar_grau', hut='zylinder', mantel_art='kurz', item=taschenuhr, extra=uhrkette, effekt=eff_uhr, kragen='creme'),
    'sq_waage': Rivale('sq_waage', 'Ottoline Brack', 'wein', 'hose', 'haar_grau', mantel_art='lang', item=waage, effekt=eff_waage, kragen='gold'),
    'eisen': Rivale('eisen', 'Garrick Holm', 'eisen', 'hose', 'haar_dunkel', mantel_art='kurz', item=faust, extra=schulterplatte, effekt=eff_eisen, breit=1),
    'kessel': Rivale('kessel', 'Bram Sutter', 'leder', 'oliv', 'haar_rot', hut='kappe', mantel_art='kurz', item=phiole, extra=bandelier, effekt=eff_kessel),
    'sq_moor': Rivale('sq_moor', 'Fenna Caddow', 'moos', 'leder', 'haar_dunkel', hut='tuch', mantel_art='rock', item=schilfstab, extra=moosfransen, effekt=eff_moor),
}
def steckbrief(b, q, art, f):
    x, y = q['huefte']
    for yy in range(y + 1, y + 5):
        for xx in range(x + 3, x + 7):
            b.set(xx, yy, 22 if (xx + yy) % 3 else 13)
    b.set(x + 4, y + 2, 23); b.set(x + 5, y + 2, 7)


def jaeger(rv):
    """Kopfgeldjäger desselben Pfads: Staubmantel, breite Krempe, Steckbrief am Gürtel; Gegenstand und Wirkung bleiben."""
    import copy
    j = copy.copy(rv)
    j.mantel = R['leder'] if rv.mantel not in (R['leder'], R['braun']) else R['schwarz']
    j.hose = R['hose']
    j.mantel_art = 'lang'
    j.hut = rv.hut if rv.hut in ('kapuze', 'tuch') else 'krempe'
    j.kragen = 'rot'
    j.extra = both(rv.extra, steckbrief) if rv.extra else steckbrief
    return j


REIHEN = [('idle', 4), ('attack', 6), ('special', 6), ('hurt', 3), ('defeated', 4)]
ANIMS = {'idle': {'frames': [0, 1, 2, 3], 'frameRate': 6, 'repeat': -1}, 'attack': {'frames': [6, 7, 8, 9, 10, 11], 'frameRate': 8, 'repeat': 0},
         'special': {'frames': [12, 13, 14, 15, 16, 17], 'frameRate': 8, 'repeat': 0}, 'hurt': {'frames': [18, 19, 20], 'frameRate': 8, 'repeat': 0},
         'defeated': {'frames': [24, 25, 26, 27], 'frameRate': 6, 'repeat': 0}}


def blatt(rv):
    im = Image.new('RGBA', (288, 240), (0, 0, 0, 0))
    for r, (art, n) in enumerate(REIHEN):
        for f in range(n):
            im.alpha_composite(figur(rv, art, f).image(), (f * 48, r * 48))
    return im


def pruefe(name, im):
    pal = set(PAL)
    data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
    for px in data:
        assert px[3] in (0, 255), name
        if px[3]:
            assert px[:3] in pal, (name, px)
    for r, (art, n) in enumerate(REIHEN):
        for f in range(6):
            cell = im.crop((f * 48, r * 48, f * 48 + 48, r * 48 + 48))
            assert bool(cell.getbbox()) == (f < n), (name, art, f)


if __name__ == '__main__':
    od = os.path.join(ROOT, 'public', 'sprites', 'battle')
    assets = []
    for pid, rv in RIVALEN.items():
        for art, fig, wer in (('rv', rv, rv.name), ('kgj', jaeger(rv), 'Kopfgeldjäger-Fassung')):
            im = blatt(fig)
            pruefe(pid, im)
            p = os.path.join(od, f'enemy_{art}_{pid}.png')
            im.save(p)
            assets.append({'id': f'enemy_{art}_{pid}', 'file': f'battle/enemy_{art}_{pid}.png', 'pfad': pid, 'figur': wer, 'width': 288, 'height': 240,
                           'frameWidth': 48, 'frameHeight': 48, 'columns': 6, 'rows': 5, 'animations': ANIMS, 'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()})
        print(pid)
    json.dump({'version': 1, 'batch': 'rivalen-kampf', 'palette': 'manifest-halbgott.json', 'erzeugt': 'python3 tools/art/rivalen/rivalen.py',
               'hinweis': 'Ruhe und Angriff eigens gezeichnet; special/hurt/defeated aus denselben Posen abgeleitet', 'assets': assets},
              open(os.path.join(ROOT, 'public', 'sprites', 'manifest-rivalen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
