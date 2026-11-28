"""Zehn eigene Kampffiguren für Gegner, die bisher das Bild eines anderen Gegners nutzten.
python3 tools/art/kampf_eigen/figuren.py  ->  public/sprites/battle/enemy_ke_<id>.png (288x240, 48er-Zellen, 6x5), manifest-kampf-eigen.json
Reihen wie die Codex-Kampfblätter: idle 0-3, attack 6-11, special 12-17, hurt 18-20, defeated 24-27. Blick nach links.
Ruhe und Angriff sind eigens gezeichnet; Spezial (Angriff mit voller Wirkung), Treffer und Niederlage aus denselben Posen.
Palette manifest-halbgott.json (= Codex-Kampfpalette, gleich manifest-benannte.json). Binäres Alpha, Umriss #1a1c2c.
Anders als tools/art/rivalen: schlankere Codex-Proportionen (Kopf 8 px, Figur ~38 px), dunkle Innenkanten zwischen Teilen,
Licht von links oben, Korn in den Flächen."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import pinsel
from pinsel import Bild, h3, ROOT
from PIL import Image

PAL = pinsel.palette_aus('manifest-halbgott.json')
OUT = 0
HAUT = [8, 5, 12, 13, 17]
HAUT_D = [6, 8, 5, 12, 13]
R = {
    'navy': [1, 2, 16, 19, 20], 'graublau': [2, 16, 19, 20, 21, 18], 'schwarz': [7, 1, 2, 16], 'braun': [7, 6, 8, 5, 12],
    'leder': [7, 6, 8, 5], 'rost': [7, 30, 31, 12], 'wein': [7, 23, 30, 31], 'oliv': [7, 11, 10, 15], 'ocker': [6, 9, 3, 4, 14],
    'gold': [9, 3, 4, 14], 'oelzeug': [7, 6, 9, 3], 'creme': [12, 13, 17, 22], 'pelz': [5, 12, 13, 17, 22], 'pelz_grau': [16, 19, 20, 21, 18],
    'lila': [7, 27, 28, 29], 'teal': [26, 25, 24], 'eisen': [1, 2, 16, 19, 20, 18], 'asche': [7, 1, 2, 16, 19, 20, 21],
    'grau': [1, 2, 16, 19, 20, 21], 'haar_grau': [16, 19, 20, 21], 'haar_dunkel': [7, 6, 8], 'haar_rot': [7, 30, 31],
    'haar_blond': [9, 5, 12, 13], 'bart_grau': [6, 8, 15, 21], 'stiefel': [7, 7, 6, 8], 'stiefel_s': [0, 7, 1, 2], 'holz': [7, 6, 8, 5], 'messing': [9, 3, 4, 14],
    'papier': [12, 13, 17, 22], 'tinte': [0, 7, 1, 27], 'stein': [1, 2, 16, 19, 20], 'samen': [9, 3, 4, 14], 'schote': [8, 5, 12, 13, 17],
    'wurzel': [7, 6, 8, 5], 'blatt': [26, 25, 10, 15],
}


# --- Raster -----------------------------------------------------------------------------------------------------------------------
def P(p, dx, dy):
    return (p[0] + dx, p[1] + dy)


def px_kapsel(p0, p1, r0, r1=None):
    """Kapsel (auch spitz zulaufend r0->r1): {(x,y): v}, Licht von links oben"""
    r1 = r0 if r1 is None else r1
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy or 1
    rm = max(r0, r1)
    out = {}
    for y in range(int(min(y0, y1) - rm - 1), int(max(y0, y1) + rm + 2)):
        for x in range(int(min(x0, x1) - rm - 1), int(max(x0, x1) + rm + 2)):
            t = max(0, min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / L2))
            cx, cy = x0 + t * dx, y0 + t * dy
            r = r0 + (r1 - r0) * t
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            if d <= r:
                nx, ny = (x + 0.5 - cx) / max(0.5, r), (y + 0.5 - cy) / max(0.5, r)
                out[(x, y)] = 0.62 - 0.52 * nx - 0.2 * ny
    return out


def px_ellipse(cx, cy, rx, ry):
    out = {}
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            ddx, ddy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
            if ddx * ddx + ddy * ddy <= 1:
                out[(x, y)] = 0.68 - 0.4 * ddx - 0.3 * ddy
    return out


def px_poly(pts, licht=True):
    ys = [p[1] for p in pts]
    xs_all = [p[0] for p in pts]
    x0, x1, y0, y1 = min(xs_all), max(xs_all), min(ys), max(ys)
    out = {}
    for y in range(int(math.floor(y0)), int(math.ceil(y1)) + 1):
        xs = []
        for i in range(len(pts)):
            (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
            if (ay <= y + 0.5 < by) or (by <= y + 0.5 < ay):
                xs.append(ax + (y + 0.5 - ay) * (bx - ax) / (by - ay))
        xs.sort()
        for a, b in zip(xs[::2], xs[1::2]):
            for x in range(int(math.ceil(a - 0.5)), int(math.floor(b - 0.5)) + 1):
                fx = (x - x0) / max(1, x1 - x0)
                fy = (y - y0) / max(1, y1 - y0)
                out[(x, y)] = 0.88 - 0.72 * fx - 0.18 * fy if licht else 0.5
    return out


def teil(b, pix, ramp, korn=0.2, s=0, kante=True, dv=0.0, vfn=None):
    """Teil auf die Leinwand: Ränder zu dahinterliegenden Teilen in der dunkelsten Stufe (Innenkante wie die Codex-Figuren)"""
    keys = set(pix)
    for (x, y), v in pix.items():
        if not (0 <= x < b.w and 0 <= y < b.h):
            continue
        if vfn:
            v = vfn(x, y, v)
        if kante and len(keys) > 6:
            rand = False
            for ddx, ddy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = (x + ddx, y + ddy)
                if n not in keys and b.get(*n) is not None:
                    rand = True
                    break
            if rand:
                b.set(x, y, ramp[0])
                continue
        b.ton(x, y, ramp, max(0, min(1, v + dv)), korn, s)


def glow(b, cx, cy, r, ramp, dichte=1.0):
    bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    for y in range(int(cy - r), int(cy + r + 1)):
        for x in range(int(cx - r), int(cx + r + 1)):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy) / max(0.5, r)
            if d <= 1 and (1 - d) * dichte * 1.4 > bayer[y % 4][x % 4] / 16 and 0 <= x < b.w and 0 <= y < b.h:
                b.set(x, y, ramp[min(len(ramp) - 1, int((1 - d) * len(ramp)))])


def staub(b, cx, cy, r, farben, dichte, s):
    for y in range(int(cy - r), int(cy + r + 1)):
        for x in range(int(cx - r), int(cx + r + 1)):
            d = math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 1.4) / max(0.5, r)
            if d <= 1 and h3(x, y, s) < dichte * (1 - d * 0.7):
                b.set(x, y, farben[int(h3(x, y, s + 1) * len(farben))])


def blitz_hell(b):
    tab = {7: 2, 1: 16, 2: 19, 6: 8, 8: 5, 5: 12, 12: 13, 13: 17, 17: 22, 16: 19, 19: 20, 20: 21, 30: 31, 23: 31, 27: 28, 28: 29, 11: 10, 10: 15, 9: 3, 26: 25}
    for y in range(b.h):
        for x in range(b.w):
            c = b.get(x, y)
            if c not in (None, OUT):
                b.set(x, y, tab.get(c, c))


def verschiebe(b, dx, dy):
    n = Bild(b.w, b.h, b.seed)
    for y in range(b.h):
        for x in range(b.w):
            c = b.get(x, y)
            if c is not None:
                n.set(x + dx, y + dy, c)
    return n


# --- Menschen: Posen ---------------------------------------------------------------------------------------------------------------
GRUND = dict(kopf=(21, 12), hals=(22, 17), sv=(18, 19), sh=(27, 19), huefte=(22, 29), kv=(20, 37), kh=(26, 37), fv=(18, 44), fh=(28, 44),
             ev=(15, 25), hv=(14, 30), eh=(29, 25), hh=(30, 31))
OBEN = ('kopf', 'hals', 'sv', 'sh', 'ev', 'hv', 'eh', 'hh')


def pose(stil, art, f):
    q = dict(GRUND)
    q['wirk'] = 0
    q['schritt'] = 0

    def ober(dx, dy):
        for k in OBEN:
            q[k] = P(q[k], dx, dy)
        q['huefte'] = P(q['huefte'], dx * 0.5, dy)

    def arm(ev, hv):
        q['ev'], q['hv'] = P(q['sv'], *ev), P(q['sv'], *hv)

    def schritt(n):                          # vorderer Fuß tritt nach vorn
        q['kv'] = P(q['kv'], -n, 0); q['fv'] = P(q['fv'], -n - 1, 0); q['schritt'] = n

    if art == 'idle':
        ober(0, [0, 0, 1, 1][f])
        q['hv'] = P(q['hv'], 0, [0, 1, 1, 0][f])
        q['hh'] = P(q['hh'], 0, [0, 0, 1, 1][f])
        if stil == 'schuss':
            arm((-1, 7), (-4, 10)); q['eh'], q['hh'] = P(q['sh'], -1, 6), P(q['sh'], -5, 4 + [0, 0, 1, 1][f])
        elif stil == 'licht':
            arm((-3, 5), (-6, 8 + [0, 1, 1, 0][f]))
        elif stil == 'faust':
            arm((-3, 5), (-5, 7 + [0, 1, 1, 0][f]))
    elif art in ('attack', 'special'):
        if stil == 'hieb':
            seq = [None, ((2, 0), (4, -4), (7, -8), 0), ((3, -1), (5, -6), (9, -9), 0), ((-3, 1), (-5, -2), (-9, 3), 3),
                   ((-3, 2), (-5, 1), (-8, 7), 3), ((-1, 0), (-3, 5), (-4, 10), 1)]
        elif stil == 'stoss':
            seq = [None, ((2, 0), (4, 4), (7, 7), 0), ((3, 1), (5, 3), (8, 4), 0), ((-4, 1), (-5, 2), (-10, 2), 3),
                   ((-4, 1), (-6, 2), (-11, 1), 3), ((-1, 0), (-3, 5), (-5, 9), 1)]
        elif stil == 'faust':
            seq = [None, ((2, 0), (3, 5), (5, 6), 0), ((3, 1), (4, 4), (6, 3), 0), ((-4, 1), (-5, 1), (-10, 0), 3),
                   ((-4, 1), (-6, 1), (-11, 0), 3), ((-1, 0), (-3, 5), (-5, 7), 1)]
        elif stil == 'schuss':
            seq = [None, ((1, 0), (-2, 5), (-5, 6), 0), ((0, 0), (-3, 2), (-7, 2), 0), ((0, 0), (-3, 2), (-7, 2), 0),
                   ((2, 0), (-3, 2), (-6, 2), 0), ((1, 0), (-2, 5), (-5, 7), 0)]
        elif stil == 'licht':
            seq = [None, ((1, 0), (-3, 3), (-5, 4), 0), ((0, 0), (-4, 1), (-6, 0), 0), ((-1, 0), (-4, 1), (-7, -1), 2),
                   ((-1, 0), (-4, 1), (-7, -1), 2), ((0, 0), (-3, 4), (-5, 6), 0)]
        else:  # schwung
            seq = [None, ((2, 0), (3, -3), (5, -6), 0), ((2, -1), (1, -7), (-1, -11), 0), ((-3, 1), (-5, -2), (-9, 0), 3),
                   ((-3, 1), (-5, 0), (-9, 2), 3), ((-1, 0), (-2, 4), (-3, 8), 1)]
        if f:
            (odx, ody), ev, hv, st = seq[f]
            ober(odx, ody)
            arm(ev, hv)
            if st:
                schritt(st)
            if stil == 'schuss':
                q['eh'], q['hh'] = P(q['sh'], -2, 5), P(q['sh'], -5, 3) if f in (2, 3, 4) else P(q['sh'], -5, 5)
            q['wirk'] = {3: 1, 4: 2, 5: 3}.get(f, 0)
        elif stil in ('schuss', 'licht', 'faust'):
            return pose(stil, 'idle', 0)
    elif art == 'hurt':
        ober([3, 4, 2][f], [0, 1, 0][f])
        arm((2, -3), (-1, -7)); q['eh'], q['hh'] = P(q['sh'], 4, 2), P(q['sh'], 6, -2)
    elif art == 'defeated':
        tief = [2, 6, 10, 13][f]
        ober([3, 1, -1, -4][f], tief + (2 if f == 3 else 0))
        q['huefte'] = P(q['huefte'], 0, tief)
        q['kv'], q['kh'] = [((19, 39), (28, 39)), ((18, 41), (29, 41)), ((16, 43), (29, 44)), ((14, 44), (30, 45))][f]
        if f >= 2:
            q['fh'] = (35, 45)
        q['ev'], q['hv'] = [((16, 28), (14, 32)), ((15, 32), (13, 37)), ((14, 37), (12, 42)), ((11, 41), (9, 44))][f]
        q['eh'], q['hh'] = [((29, 28), (30, 33)), ((29, 32), (30, 37)), ((28, 37), (29, 42)), ((27, 41), (28, 44))][f]
    return q


# --- Menschen: Zeichnung -----------------------------------------------------------------------------------------------------------
class Mensch:
    def __init__(self, id, name, stil, mantel, hose, haar, mantel_art='mantel', hut=None, hutfarbe=None, waffe=None, hinten=None,
                 effekt=None, extras=(), gesicht='normal', bart=None, frau=False, stiefel='stiefel', kragen=None, cape=None, breit=0):
        self.id, self.name, self.stil = id, name, stil
        self.mantel, self.hose, self.haar = R[mantel], R[hose], R[haar]
        self.mantel_art, self.hut, self.hutfarbe = mantel_art, hut, R[hutfarbe] if hutfarbe else R[mantel]
        self.waffe, self.hinten, self.effekt, self.extras = waffe, hinten, effekt, extras
        self.gesicht, self.bart, self.frau = gesicht, R[bart] if bart else None, frau
        self.stiefel, self.kragen, self.cape, self.breit = R[stiefel], R[kragen] if kragen else None, R[cape] if cape else None, breit


def dunkler(ramp):
    return [ramp[0]] + ramp[:-1]


def rumpf(b, m, q, art):
    sv, sh, hu = q['sv'], q['sh'], q['huefte']
    w = m.breit
    M = m.mantel
    unten = art == 'defeated'
    if m.mantel_art in ('mantel', 'pelzmantel'):
        saum = (hu[1] + 8) if unten else max(hu[1] + 11, 40)
        pts = [P(sv, -1 - w, -1), P(sh, 1 + w, -1), P(hu, 5 + w, 0), (hu[0] + 9 + w, saum + 1), (hu[0] - 7 - w, saum), P(hu, -5 - w, 0)]
    elif m.mantel_art == 'kutte':
        saum = (hu[1] + 9) if unten else 42
        pts = [P(sv, -2 - w, -1), P(sh, 2 + w, -1), P(hu, 6 + w, 0), (hu[0] + 9 + w, saum), (hu[0] - 8 - w, saum), P(hu, -6 - w, 0)]
    elif m.mantel_art == 'kleid':
        saum = (hu[1] + 9) if unten else 45
        pts = [P(sv, -1, 0), P(sh, 1, 0), P(hu, 4, 0), (hu[0] + 10, saum), (hu[0] - 10 - q['schritt'], saum), P(hu, -4, 0)]
    else:  # anzug: Jacke bis knapp unter die Hüfte
        pts = [P(sv, -1 - w, -1), P(sh, 1 + w, -1), P(hu, 5 + w, 4), P(hu, -5 - w, 4)]
    pix = px_poly(pts)
    teil(b, pix, M, 0.22, 7)
    # Falten: zwei dunkle Linien im Schoß, Knopfleiste
    if m.mantel_art in ('mantel', 'pelzmantel', 'kutte', 'kleid') and not unten:
        for fx, l in ((hu[0] + 3, 8), (hu[0] - 3, 6)):
            for t in range(2, l):
                x, y = int(fx + t * 0.25), int(hu[1] + t)
                if (x, y) in pix:
                    b.set(x, y, M[1])
    if m.mantel_art in ('mantel', 'pelzmantel', 'anzug'):
        kx = int(sv[0] + 2)
        for y in range(int(sv[1]) + 1, int(hu[1]) + (4 if m.mantel_art == 'anzug' else 10)):
            x = kx + (y - sv[1]) // 6
            if (x, y) in pix:
                b.set(x, y, M[0])
                if (y - int(sv[1])) % 5 == 2 and (x - 1, y) in pix:
                    b.set(x - 1, y, 9 if m.mantel_art != 'anzug' else M[-1])
    if m.mantel_art == 'kutte' and not unten:                        # Flicken und ausgefranster Saum
        for (fx, fy) in ((hu[0] + 2, hu[1] + 5), (sv[0] + 3, sv[1] + 4)):
            for yy in range(int(fy), int(fy) + 3):
                for xx in range(int(fx), int(fx) + 3):
                    if (xx, yy) in pix:
                        b.set(xx, yy, 8 if (xx + yy) % 3 else 6)
        for x in range(int(hu[0]) - 8, int(hu[0]) + 9, 2):
            if (x, saum - 1) in pix and h3(x, 3, 9) < 0.6:
                b.set(x, saum - 1, None) if (x, saum) not in pix else None
    if m.mantel_art == 'kutte':                                      # Strick
        for x in range(int(hu[0]) - 6, int(hu[0]) + 7):
            if (x, int(hu[1])) in pix:
                b.set(x, int(hu[1]), 13 if x % 2 else 12)
        for y in range(int(hu[1]) + 1, int(hu[1]) + 6):
            b.set(int(hu[0]) - 4, y, 12 if y % 2 else 13)
    elif m.mantel_art != 'kleid':                                    # Gürtel
        for x in range(int(hu[0]) - 5 - w, int(hu[0]) + 6 + w):
            if (x, int(hu[1])) in pix:
                b.set(x, int(hu[1]), 7)
        if (int(hu[0]) - 2, int(hu[1])) in pix:
            b.set(int(hu[0]) - 2, int(hu[1]), 3)
    if m.mantel_art == 'pelzmantel' and m.kragen:                     # Pelzkragen
        pk = px_kapsel(P(sv, 0, 0), P(sh, -1, 0), 2.1)
        teil(b, pk, m.kragen[:4], 0.5, 8, kante=False)
        for (x, y) in pk:
            if h3(x, y, 77) < 0.18:
                b.set(x, y, m.kragen[-1])
    if m.mantel_art == 'kleid':
        sp = px_kapsel(P(sv, -1, 1), P(sh, 1, 1), 2.4)            # Schultertuch
        teil(b, sp, m.kragen or R['lila'], 0.25, 8)
    return pix


def kopf(b, m, q, art):
    kx, ky = q['kopf']
    teil(b, px_ellipse(kx, ky, 3.4, 3.9), HAUT, 0.12, 9, kante=False, dv=-0.12)
    ix, iy = int(kx), int(ky)
    b.set(ix + 1, iy + 1, HAUT[1])                                  # Ohr
    if m.gesicht == 'maske':                                        # fremdes Gesicht, schief aufgesetzt
        for y in range(iy - 2, iy + 4):
            for x in range(ix - 4, ix + 1):
                if b.get(x, y) is not None:
                    b.ton(x, y, [17, 22, 22], 0.75 - 0.1 * (x - ix + 4), 0.05, 10)
        b.set(ix - 4, iy, OUT); b.set(ix - 3, iy, OUT); b.set(ix - 1, iy, OUT)   # Augenlöcher, zu weit auseinander
        b.set(ix - 3, iy - 1, 5); b.set(ix - 1, iy - 2, 5)          # schiefe Brauen
        b.set(ix - 4, iy + 1, 12)                                   # Nase
        b.set(ix - 3, iy + 3, 8); b.set(ix - 2, iy + 3, 8)          # Mund
        for y in range(iy - 2, iy + 4):
            b.set(ix + 1, y, 12 if y % 2 else 17)                   # Rand mit Naht
        b.set(ix + 2, iy, 7); b.set(ix + 3, iy - 1, 7)              # Band zum Ohr
        return
    b.set(ix - 2, iy, OUT)                                          # Auge
    b.set(ix - 3, iy - 2, m.haar[0]); b.set(ix - 2, iy - 2, m.haar[0])
    b.set(ix - 4, iy + 1, HAUT[2])                                  # Nase
    b.set(ix - 3, iy + 1, HAUT[1])
    if m.bart and m.gesicht == 'vollbart':                          # Vollbart von den Ohren bis unters Kinn
        for y in range(iy + 1, iy + 6):
            for x in range(ix - 4, ix + 3):
                innen = b.get(x, y) is not None or (y == iy + 5 and ix - 3 <= x <= ix + 1)
                if innen and (y > iy + 1 or x >= ix) and not (y == iy + 1 and x < ix):
                    b.ton(x, y, m.bart, 0.62 - 0.12 * (x - ix + 3) - 0.05 * (y - iy), 0.35, 11)
        b.set(ix - 3, iy + 2, m.bart[0]); b.set(ix - 2, iy + 2, m.bart[0])          # Mund im Bart
    elif m.bart:                                                     # Bart an Kinn und Kiefer, Wange bleibt frei
        for y in range(iy + 2, iy + 5):
            for x in range(ix - 3, ix + 2):
                if b.get(x, y) is not None and (y > iy + 2 or x > ix - 1):
                    b.ton(x, y, m.bart, 0.55 - 0.1 * (x - ix + 3), 0.3, 11)
        b.set(ix - 3, iy + 3, m.bart[0])
    else:
        b.set(ix - 3, iy + 3, HAUT[0])                              # Mund
    if m.gesicht == 'schatten':                                     # unter der Kapuze: Haut und Bart eine Stufe dunkler
        dunk = {**{c: HAUT_D[i] for i, c in enumerate(HAUT)}, 21: 19, 20: 16, 19: 2, 16: 1}
        for y in range(iy - 3, iy + 5):
            for x in range(ix - 4, ix + 3):
                c = b.get(x, y)
                if c in dunk and c != OUT:
                    b.set(x, y, dunk[c])


def haar(b, m, q):
    kx, ky = q['kopf']
    for (x, y), v in px_ellipse(kx + 0.5, ky - 0.8, 3.7, 3.6).items():
        if y <= ky - 2 or x >= kx + 1:
            if not (x == int(kx) + 1 and y == int(ky) + 1):
                b.ton(x, y, m.haar, v - 0.1, 0.25, 12)
    if m.frau:                                                       # Knoten hinten
        teil(b, px_ellipse(kx + 3.8, ky - 1.5, 1.8, 1.8), m.haar, 0.2, 13, kante=False)


def hut(b, m, q):
    kx, ky = q['kopf']
    H = m.hutfarbe
    t = m.hut
    if t == 'zylinder':
        teil(b, px_kapsel((kx - 5, ky - 4), (kx + 5, ky - 4), 0.9), H, 0.1, 20, kante=False)
        pix = {(x, y): 0.75 - 0.09 * (x - kx + 3) for y in range(int(ky) - 11, int(ky) - 4) for x in range(int(kx) - 3, int(kx) + 4)}
        teil(b, pix, H, 0.12, 21, kante=False)
        for x in range(int(kx) - 3, int(kx) + 4):
            b.set(x, int(ky) - 6, 23)
    elif t == 'melone':
        pix = {k: v for k, v in px_ellipse(kx + 0.5, ky - 3.2, 4.0, 3.4).items() if k[1] <= ky - 3}
        teil(b, pix, H, 0.12, 22, kante=False)
        teil(b, px_kapsel((kx - 4.5, ky - 3), (kx + 5, ky - 3), 0.8), H, 0.1, 23, kante=False)
    elif t == 'krempe':
        teil(b, px_kapsel((kx - 7, ky - 4), (kx + 6, ky - 3.5), 1.0), H, 0.12, 24, kante=False)
        pix = {(x, y): 0.72 - 0.09 * (x - kx + 3) for y in range(int(ky) - 9, int(ky) - 4) for x in range(int(kx) - 3, int(kx) + 4)}
        pix.pop((int(kx) - 3, int(ky) - 9), None); pix.pop((int(kx) + 3, int(ky) - 9), None)
        teil(b, pix, H, 0.15, 25, kante=False)
        for x in range(int(kx) - 3, int(kx) + 4):
            b.set(x, int(ky) - 5, H[0])
    elif t == 'pelzmuetze':
        pix = {k: v for k, v in px_ellipse(kx + 0.5, ky - 4.0, 4.3, 4.2).items() if k[1] <= ky - 2}
        teil(b, pix, m.hutfarbe, 0.35, 26, kante=False, dv=-0.15)
        for (x, y) in pix:                                           # Fellstriche
            if h3(x, y, 26) < 0.22:
                b.set(x, y, m.hutfarbe[-2])
        band = px_kapsel((kx - 4, ky - 3.2), (kx + 4.5, ky - 3.2), 0.9)
        teil(b, band, [8, 5, 12, 13], 0.5, 27, kante=False)
        for y in range(int(ky) - 1, int(ky) + 3):                   # Ohrenklappe
            b.ton(int(kx) + 3, y, m.hutfarbe, 0.55, 0.3, 28); b.ton(int(kx) + 4, y, m.hutfarbe, 0.35, 0.3, 28)
    elif t == 'kapuze':
        for (x, y), v in px_ellipse(kx + 1.2, ky - 0.6, 5.0, 5.8).items():
            gesicht = x <= kx and y >= ky - 2.5 and y <= ky + 4
            if not gesicht:
                b.ton(x, y, H, v - 0.05, 0.22, 29)
        for y in range(int(ky) - 2, int(ky) + 5):                     # Kapuzenrand
            b.set(int(kx) + 1, y, H[0]) if b.get(int(kx) + 1, y) in HAUT else None
    elif t == 'schleierhut':
        teil(b, px_ellipse(kx + 1, ky - 4.6, 3.4, 2.0), H, 0.15, 30, kante=False)
        teil(b, px_kapsel((kx - 5, ky - 3), (kx + 6, ky - 2.5), 0.8), H, 0.1, 31, kante=False)
        for y in range(int(ky) - 2, int(ky) + 5):                     # Schleier vor dem Gesicht, gerastert
            for x in range(int(kx) - 5, int(kx) + 1):
                if (b.get(x, y) is not None or (x == int(kx) - 5 and y < ky + 3)) and (x + y) % 2 == 0:
                    b.set(x, y, 20 if y < ky + 3 else 19)
        b.set(int(kx) - 2, int(ky), 22); b.set(int(kx) - 3, int(ky) + 2, 22)   # Porzellan blitzt
        b.set(int(kx) + 3, int(ky) - 5, 23); b.set(int(kx) + 2, int(ky) - 6, 29)  # Stoffblume


def mensch(m, art, f, mit_umriss=True):
    b = Bild(48, 48, seed=31 + f + 7 * len(art))
    q = pose(m.stil, art, f)
    M, Hs = m.mantel, m.hose
    # hinten: Arm, Bein
    teil(b, px_kapsel(q['sh'], q['eh'], 2.0), dunkler(M), 0.2, 1)
    teil(b, px_kapsel(q['eh'], q['hh'], 1.8), dunkler(M), 0.2, 1)
    teil(b, px_ellipse(q['hh'][0], q['hh'][1] + 0.5, 1.6, 1.6), HAUT_D, 0.1, 2, kante=False)
    if m.hinten:
        m.hinten(b, q, art, f)
    if m.mantel_art not in ('kleid',):
        teil(b, px_kapsel(P(q['huefte'], 2.5, 0), q['kh'], 2.4), dunkler(Hs), 0.2, 3)
        teil(b, px_kapsel(q['kh'], q['fh'], 2.0), dunkler(Hs), 0.2, 3)
        teil(b, px_kapsel(P(q['fh'], -1, -1), P(q['fh'], 2, 0), 1.6), R['stiefel_s'], 0.1, 4)
        teil(b, px_kapsel(P(q['huefte'], -2.5, 0), q['kv'], 2.5), Hs, 0.2, 5)
        teil(b, px_kapsel(q['kv'], q['fv'], 2.1), Hs, 0.2, 5)
        teil(b, px_kapsel(P(q['fv'], -3, 0), P(q['fv'], 1, -1), 1.7), m.stiefel, 0.1, 6)
    else:
        teil(b, px_kapsel(P(q['fh'], -1, 0), P(q['fh'], 2, 0), 1.2), R['stiefel_s'], 0.1, 4)
        teil(b, px_kapsel(P(q['fv'], -3, 0), P(q['fv'], 0, 0), 1.3), m.stiefel, 0.1, 6)
    rumpf(b, m, q, art)
    if m.cape:
        sv, sh = q['sv'], q['sh']
        teil(b, px_poly([P(sv, -2, -2), P(sh, 2, -2), P(sh, 4, 9), P(sv, -3, 8)]), m.cape, 0.25, 14)
    haar(b, m, q)
    kopf(b, m, q, art)
    if m.hut:
        hut(b, m, q)
    for e in m.extras:
        e(b, q, art, f)
    # vorne: Arm (Ärmel, Hand) und Waffe
    teil(b, px_kapsel(q['sv'], q['ev'], 2.1), M, 0.2, 15)
    teil(b, px_kapsel(q['ev'], q['hv'], 1.9), M, 0.2, 15)
    if m.waffe:
        m.waffe(b, q, art, f)
    teil(b, px_ellipse(q['hv'][0], q['hv'][1] + 0.3, 1.6, 1.6), HAUT, 0.1, 16, kante=False)
    if getattr(m, 'nach_hand', None):
        m.nach_hand(b, q, art, f)
    if mit_umriss:
        b.umriss(OUT)
    return b, q



# --- Waffen und Gegenstände ---------------------------------------------------------------------------------------------------------
def richtung(q, a='ev', z='hv'):
    (ex, ey), (hx, hy) = q[a], q[z]
    w = math.atan2(hy - ey, hx - ex)
    return math.cos(w), math.sin(w)


def w_hammer(b, q, art, f):
    """Setzhammer: langer Stiel, schwerer Eisenkopf (ruht im Stand am Boden)"""
    hx, hy = q['hv']
    cx, cy = richtung(q)
    if art in ('attack', 'special') and f in (1, 2):                 # Ausholen: Kopf hängt hinter der Schulter
        cx, cy = (0.8, 0.6) if f == 1 else (0.95, 0.3)
    elif art == 'hurt':
        cx, cy = (0.6, -0.8)
    L = 11
    ende = (hx + cx * L, hy + cy * L)
    teil(b, px_kapsel((hx - cx * 2, hy - cy * 2), ende, 0.8), R['holz'], 0.1, 40, kante=False)
    px, py = -cy, cx
    kopfpix = px_kapsel((ende[0] + px * 3, ende[1] + py * 3), (ende[0] - px * 2.5, ende[1] - py * 2.5), 1.9)
    teil(b, kopfpix, R['eisen'], 0.15, 41)
    q['kopf_waffe'] = ende


def w_stilett(b, q, art, f, L=8):
    hx, hy = q['hv']
    cx, cy = richtung(q)
    for t in range(1, L):
        x, y = int(round(hx + cx * t)), int(round(hy + cy * t))
        b.set(x, y, 22 if t < L - 2 else 18)
        if t < L - 2:
            b.set(int(round(hx + cx * t - cy)), int(round(hy + cy * t + cx)), 18)
    px, py = -cy, cx
    for s in (-1.5, 0, 1.5):
        b.set(int(round(hx + cx + px * s)), int(round(hy + cy + py * s)), 3)
    q['spitze'] = (hx + cx * L, hy + cy * L)


def w_messer(b, q, art, f):
    w_stilett(b, q, art, f, L=6)


def w_laterne(b, q, art, f):
    """Blendlaterne: Gehäuse, Linse nach vorn, Bügel"""
    hx, hy = int(q['hv'][0]), int(q['hv'][1])
    x0, y0 = hx - 3, hy - 2
    pix = {(x, y): 0.75 - 0.1 * (x - x0) for y in range(y0, y0 + 6) for x in range(x0, x0 + 5)}
    teil(b, pix, R['messing'], 0.1, 42)
    for y in range(y0 + 1, y0 + 5):                                  # Linse
        b.set(x0, y, 22 if q['wirk'] else 14); b.set(x0 + 1, y, 14 if q['wirk'] else 4)
    b.set(x0, y0 + 1, 4); b.set(x0, y0 + 4, 3)
    for x in range(x0 + 1, x0 + 4):                                  # Kamin, Bügel
        b.set(x, y0 - 1, 7)
    b.set(x0 + 2, y0 - 2, 7)
    q['linse'] = (x0, y0 + 2.5)


def w_gewehr(b, q, art, f):
    """Gewehr: Kolben an der hinteren Hand, Lauf über die vordere Hand hinaus"""
    (bx, by), (hx, hy) = q['hh'], q['hv']
    dx, dy = hx - bx, hy - by
    L = math.hypot(dx, dy) or 1
    cx, cy = dx / L, dy / L
    kolben = (bx - cx * 4, by - cy * 4 + 1)
    teil(b, px_kapsel(kolben, (bx + cx * 3, by + cy * 3), 1.4, 1.0), R['holz'], 0.12, 43)
    teil(b, px_kapsel((bx + cx * 2, by + cy * 2), (hx + cx * 1, hy + cy * 1), 0.9), R['holz'], 0.12, 43, kante=False)
    for t in range(-2, 10):
        x, y = int(round(hx + cx * t)), int(round(hy + cy * t - 1))
        b.set(x, y, 16 if t % 3 else 19)
    q['muendung'] = (hx + cx * 10, hy + cy * 10 - 1)


def w_anker(b, q, art, f):
    """Enterhaken an der Kette: hängt im Stand, kreist und fliegt beim Angriff"""
    hx, hy = q['hv']
    if art in ('attack', 'special'):
        off = [(0, 9), (7, 3), (3, -8), (-14, 2), (-16, 6), (-6, 8)][f]
    elif art == 'defeated':
        off = (-3, 3)
    elif art == 'hurt':
        off = (3, 8)
    else:
        off = (0, 9 + [0, 0, 1, 1][f])
    gx, gy = hx + off[0], hy + off[1]
    n = int(max(abs(off[0]), abs(off[1])))
    for t in range(1, n):
        x, y = int(round(hx + off[0] * t / n)), int(round(hy + off[1] * t / n))
        b.set(x, y, 20 if t % 2 else 16)
    # Schaft und drei Zacken
    for t in range(0, 4):
        b.set(int(gx), int(gy) + t - 1, 19)
    for (dx, dy) in ((-2, 2), (-2, 1), (2, 2), (2, 1), (0, 3), (-1, 3), (1, 3)):
        b.set(int(gx) + dx, int(gy) + dy, 20 if dy < 3 else 16)
    b.set(int(gx) - 3, int(gy), 21); b.set(int(gx) + 3, int(gy), 21)
    q['haken'] = (gx, gy)


def h_kette(b, q, art, f):
    x, y = int(q['hh'][0]), int(q['hh'][1])
    for (dx, dy) in ((-1, -1), (1, -1), (-1, 1), (1, 1), (0, 2), (2, 0)):
        b.set(x + dx, y + dy, 20 if (dx + dy) % 2 else 16)


def h_korb(b, q, art, f):
    x, y = int(q['hh'][0]), int(q['hh'][1]) + 1
    pix = {(xx, yy): 0.7 - 0.08 * (xx - x + 3) for yy in range(y, y + 4) for xx in range(x - 3, x + 3)}
    teil(b, pix, R['ocker'], 0.3, 44)
    for xx in range(x - 3, x + 3):
        b.set(xx, y + 1, 9)
    for i, (dx, c) in enumerate(((-3, 23), (-2, 29), (-1, 22), (0, 4), (1, 23), (2, 29))):   # Blumen
        b.set(x + dx, y - 1 - (i % 2), c)
        b.set(x + dx, y - (i % 2), 25)
    b.set(x - 1, y - 3, 7); b.set(x, y - 4, 7); b.set(x + 1, y - 3, 7)  # Henkel


def h_messer_hinten(b, q, art, f):
    x, y = int(q['hh'][0]), int(q['hh'][1])
    for t in range(1, 6):
        b.set(x + 1, y + t, 22 if t < 4 else 18)
    b.set(x, y + 1, 3); b.set(x + 2, y + 1, 3)


def n_schlagring(b, q, art, f):
    x, y = int(q['hv'][0]), int(q['hv'][1])
    for dy in (-1, 0, 1):
        b.set(x - 2, y + dy, 4 if dy < 1 else 3)
    b.set(x - 1, y - 1, 3)


# --- Kleidungsdetails ----------------------------------------------------------------------------------------------------------------
def x_halstuch(b, q, art, f):
    x, y = int(q['hals'][0]), int(q['hals'][1])
    for (dx, dy, c) in ((-2, 0, 30), (-1, 0, 23), (0, 0, 23), (1, 0, 30), (-2, 1, 23), (-1, 1, 30), (0, 1, 23), (-1, 2, 23), (-2, 2, 7)):
        b.set(x + dx, y + dy, c)


def x_steckbrief(b, q, art, f):
    if art == 'defeated':
        return
    x, y = int(q['huefte'][0]) - 4, int(q['huefte'][1]) + 1
    for yy in range(y, y + 3):
        b.set(x, yy, 17); b.set(x + 1, yy, 13)
    b.set(x, y + 1, 6)


def x_patronen(b, q, art, f):
    (ax, ay), (ex, ey) = P(q['sh'], 0, 0), P(q['huefte'], -4, 0)
    n = int(max(abs(ex - ax), abs(ey - ay)))
    for t in range(n + 1):
        x, y = int(round(ax + (ex - ax) * t / n)), int(round(ay + (ey - ay) * t / n))
        b.set(x, y, 7)
        b.set(x + 1, y, 3 if t % 2 else 7)


def x_brustkette(b, q, art, f):
    (ax, ay), (ex, ey) = P(q['sv'], 1, 1), P(q['huefte'], 4, -1)
    n = int(max(abs(ex - ax), abs(ey - ay)))
    for t in range(n + 1):
        x, y = int(round(ax + (ex - ax) * t / n)), int(round(ay + (ey - ay) * t / n))
        b.set(x, y, 20 if t % 2 else 16)


def x_nadel(b, q, art, f):
    x, y = int(q['sv'][0]) + 2, int(q['sv'][1]) + 2
    b.set(x, y, 4); b.set(x, y + 1, 3)


def x_weste(b, q, art, f):
    """Hemdkragen, schwarze Krawatte und graue Weste im offenen Jackett"""
    sv, hu = q['sv'], q['huefte']
    x0, y0 = int(sv[0]) + 3, int(sv[1])
    b.set(x0, y0, 22); b.set(x0 + 1, y0, 17); b.set(x0 + 2, y0, 22)
    for y in range(y0 + 1, int(hu[1])):
        x = x0 + (y - y0) // 6
        b.set(x, y, 16 if y > y0 + 1 else 22)
        b.set(x + 1, y, 7 if y < y0 + 6 else 19)
        b.set(x + 2, y, 19 if y > y0 + 1 else 22)


# --- Wirkungen (ohne Umriss) ---------------------------------------------------------------------------------------------------------
def e_eisen(b, q, w, spezial):
    if 'kopf_waffe' not in q:
        return
    x, y = q['kopf_waffe']
    r = [0, 7, 9, 4][w] + (2 if spezial else 0)
    for i in range(10):
        a = math.pi * (0.9 + i * 0.13)
        for t in range(r // 2, r):
            xx, yy = int(x + math.cos(a) * t), int(y + math.sin(a) * t * 0.6)
            if t % 2 == 0 and 0 <= xx < 48 and 0 <= yy < 48:
                b.set(xx, yy, 14 if t < r - 2 else 21)
    if w >= 2:
        for xx in range(int(x) - r, int(x) + 3):
            if h3(xx, w, 5) < 0.6:
                b.set(xx, 45 + (xx % 2), 20)
    if spezial:
        glow(b, x, y, 4, [19, 20, 21, 18], 0.9)


def e_maske(b, q, w, spezial):
    if 'spitze' not in q:
        return
    x, y = q['spitze']
    for i in range(3 if spezial else 2):                             # Nachbilder des Gesichts
        gx, gy = int(x) - 3 - i * 5, int(y) - 7 + i
        for (dx, dy) in ((0, 0), (1, 0), (2, 0), (0, 1), (2, 1), (0, 2), (1, 2), (2, 2), (1, 3)):
            if (dx + dy + i) % 2 == 0 or i == 0:
                b.set(gx + dx, gy + dy, 22 if i == 0 else 29)
        b.set(gx, gy + 1, 0); b.set(gx + 2, gy + 1, 0)
    for t in range(4, 10):
        b.set(int(x) + t, int(y) + (t % 2), 29 if t % 3 else 28)


def e_licht(b, q, w, spezial):
    """schmaler Lichtkeil aus der Linse bis an den Bildrand, Kern weiß"""
    if 'linse' not in q:
        return
    x, y = q['linse']
    for t in range(1, int(x) + 1):
        breite = 0.6 + t * (0.28 if w < 3 else 0.12) + (0.15 * t if spezial else 0)
        for yy in range(int(math.floor(y - breite)), int(math.ceil(y + breite)) + 1):
            xx = int(x - t)
            d = abs(yy + 0.5 - y) / breite
            if 0 <= xx < 48 and 0 <= yy < 48 and d <= 1:
                if d < 0.35:
                    b.set(xx, yy, 22 if w < 3 else 14)
                elif d < 0.7 and (xx + yy) % 2 == 0 or (d >= 0.7 and (xx + 2 * yy) % 4 == 0):
                    b.set(xx, yy, 14 if d < 0.7 else 4)
    glow(b, x, y, 3 + (1 if spezial else 0), [4, 14, 22], 1.0)


def e_schuss(b, q, w, spezial):
    if 'muendung' not in q:
        return
    x, y = q['muendung']
    if w == 1:
        for (dx, dy, c) in ((-1, 0, 22), (-2, 0, 22), (-3, 0, 14), (-4, 0, 4), (-1, -1, 14), (-1, 1, 14), (-2, -2, 4), (-2, 2, 4), (0, 0, 14)):
            b.set(int(x) + dx, int(y) + dy, c)
        if spezial:
            for t in range(5, 16, 2):
                b.set(int(x) - t, int(y), 14)
    if w >= 2:
        staub(b, x - 2 + w, y - 1 - w, 2.5 + w * 0.6, [19, 20, 21], 0.55, 60 + w)


def e_kette(b, q, w, spezial):
    if 'haken' not in q or w > 2:
        return
    x, y = q['haken']
    for i in range(8):
        a = i * math.pi / 4 + 0.3
        for t in (3, 4) if w == 1 else (4, 5, 6):
            xx, yy = int(x + math.cos(a) * t), int(y + 1 + math.sin(a) * t)
            if 0 <= xx < 48 and 0 <= yy < 48 and (i + t) % 2 == 0:
                b.set(xx, yy, 14 if t < 5 else 31)
    if spezial or w == 2:
        staub(b, x + 3, y + 2, 4, [30, 31, 8], 0.4, 70 + w)


def e_faust(b, q, w, spezial):
    if w > 2:
        return
    x, y = q['hv'][0] - 3, q['hv'][1]
    r = 3 + w + (1 if spezial else 0)
    for i in range(8):
        a = i * math.pi / 4
        for t in range(r - 2, r + 1):
            xx, yy = int(x + math.cos(a) * t), int(y + math.sin(a) * t)
            if 0 <= xx < 48 and 0 <= yy < 48:
                b.set(xx, yy, 22 if t < r else 14)
    if spezial:
        glow(b, x, y, 3, [3, 4, 14], 1.0)


def e_schleier(b, q, w, spezial):
    if 'spitze' not in q or w > 2:
        return
    x, y = q['spitze']
    for i in range(7 + (4 if spezial else 0)):
        xx = int(x - 2 - h3(i, w, 81) * 10)
        yy = int(y - 4 + h3(i, w, 82) * 9)
        c = [22, 21, 23, 29][i % 4]
        b.set(xx, yy, c)
        if i % 4 < 2:
            b.set(xx + 1, yy, 18)
    for t in range(2, 9):
        b.set(int(x) + t // 2, int(y) - t, 18 if t % 2 else 22)


# --- Die sieben Menschen ------------------------------------------------------------------------------------------------------------
MENSCHEN = [
    Mensch('thorne', 'Aldo Thorne', 'hieb', 'oliv', 'navy', 'haar_grau', 'pelzmantel', hut='pelzmuetze', hutfarbe='leder', waffe=w_hammer,
           effekt=e_eisen, extras=(x_halstuch, x_steckbrief), bart='bart_grau', kragen='pelz', breit=1, gesicht='vollbart'),
    Mensch('dunmore', 'Feodor Dunmore', 'stoss', 'schwarz', 'schwarz', 'haar_dunkel', 'mantel', hut='zylinder', hutfarbe='schwarz',
           waffe=w_stilett, effekt=e_maske, extras=(x_halstuch, x_steckbrief), gesicht='maske'),
    Mensch('lerch', 'Merit Lerch', 'licht', 'braun', 'leder', 'haar_rot', 'mantel', hut='krempe', hutfarbe='oelzeug', waffe=w_laterne,
           hinten=h_messer_hinten, effekt=e_licht, extras=(x_halstuch, x_steckbrief), frau=True, cape='oelzeug'),
    Mensch('rotte', 'Kopfgeldrotte', 'schuss', 'braun', 'navy', 'haar_dunkel', 'mantel', hut='krempe', hutfarbe='leder', waffe=w_gewehr,
           effekt=e_schuss, extras=(x_halstuch, x_patronen), bart='haar_dunkel'),
    Mensch('rostbrueder', 'Rostbrüder', 'schwung', 'rost', 'leder', 'haar_grau', 'kutte', hut='kapuze', hutfarbe='rost', waffe=w_anker,
           hinten=h_kette, effekt=e_kette, extras=(x_brustkette,), gesicht='schatten', bart='haar_grau', breit=1),
    Mensch('gefolge', 'Gefolge', 'faust', 'schwarz', 'schwarz', 'haar_dunkel', 'anzug', hut='melone', hutfarbe='schwarz', effekt=e_faust,
           extras=(x_weste, x_nadel), breit=1),
    Mensch('schleier', 'Grauer Schleier', 'stoss', 'grau', 'grau', 'haar_dunkel', 'kleid', hut='schleierhut', hutfarbe='graublau',
           waffe=w_messer, hinten=h_korb, effekt=e_schleier, frau=True, kragen='lila', stiefel='stiefel_s'),
]
for _m in MENSCHEN:
    if _m.id == 'gefolge':
        _m.nach_hand = n_schlagring



# --- Kopfgeldrotte: zweiter Jäger dahinter (abgedunkelt) -----------------------------------------------------------------------------
DUNKEL = {1: 1, 2: 1, 3: 9, 4: 3, 5: 8, 6: 7, 7: 7, 8: 6, 9: 6, 10: 11, 11: 7, 12: 5, 13: 12, 14: 4, 15: 10, 16: 2, 17: 13, 18: 21, 19: 16,
          20: 19, 21: 20, 22: 17, 23: 7, 24: 25, 25: 26, 26: 1, 27: 7, 28: 27, 29: 28, 30: 6, 31: 30}
ROTTE_HINTEN = Mensch('rotte2', 'Jäger hinten', 'schuss', 'navy', 'navy', 'haar_dunkel', 'mantel', hut='melone', hutfarbe='schwarz', waffe=w_gewehr,
                      extras=(x_halstuch,), bart='haar_dunkel')


def rotte(art, f):
    vorn_m = next(m for m in MENSCHEN if m.id == 'rotte')
    hart = art if art in ('hurt', 'defeated') else 'idle'
    hf = f if art in ('hurt', 'defeated') else [0, 0, 1, 1, 0, 1][f % 6]
    hb, _ = mensch(ROTTE_HINTEN, hart, min(hf, 3) if hart != 'hurt' else min(f, 2))
    for y in range(48):
        for x in range(48):
            c = hb.get(x, y)
            if c not in (None, OUT):
                hb.set(x, y, DUNKEL[DUNKEL[c]])
    b = Bild(48, 48, 5)
    b.einfuegen(verschiebe(hb, 9, -2), 0, 0)
    vb, q = mensch(vorn_m, art, f)
    b.einfuegen(vb, -2, 0)
    q = {k: (P(v, -2, 0) if isinstance(v, tuple) else v) for k, v in q.items()}
    return b, q


# --- Aschenweberin: Motte aus Asche ------------------------------------------------------------------------------------------------
def motte(art, f):
    """Seitenansicht, Blick nach links: Flügel als V über dem Körper (hinteres Paar dunkler), Glutaugen auf den Vorderflügeln,
    Vorderbeine halten Schleier aus Asche (gerasterte Fäden bis zum Boden)."""
    b = Bild(48, 48, seed=90 + f)
    dx = dy = 0
    flug = 0
    if art == 'idle':
        flug = [2, 1, -1, 1][f]; dy = [0, 0, 1, 1][f]
    elif art in ('attack', 'special'):
        flug, dx, dy = [(2, 0, 0), (5, 2, -1), (6, 3, -2), (-4, -3, 1), (-4, -3, 1), (0, -1, 0)][f]
    elif art == 'hurt':
        flug, dx, dy = [(-1, 3, 0), (-2, 4, 1), (0, 2, 0)][f]
    elif art == 'defeated':
        flug, dx, dy = [(-2, 1, 4), (-4, 0, 8), (-6, -1, 12), (-7, -2, 15)][f]
    WF = [1, 2, 16, 19, 20, 21]
    def W(pts):
        return [(x + dx, y + dy - (flug if y < 20 else flug // 2)) for (x, y) in pts]
    ferne_o = W([(19, 25), (27, 9), (36, 3), (41, 8), (38, 18), (25, 27)])
    ferne_u = W([(22, 27), (35, 21), (41, 27), (37, 34), (26, 31)])
    nahe_o = W([(16, 25), (13, 11), (17, 3), (25, 5), (27, 16), (22, 27)])
    nahe_u = W([(19, 28), (25, 22), (31, 25), (29, 32), (22, 31)])
    # hintere Flügel
    for pts, s in ((ferne_u, 1), (ferne_o, 2)):
        pix = px_poly(pts)
        teil(b, pix, WF[:5], 0.3, s, dv=-0.25)
        band(b, pix, pts, s)
    # Körper: Hinterleib, Brust, Kopf
    hx, hy = 12 + dx, 26 + dy
    teil(b, px_kapsel((20 + dx, 27 + dy), (33 + dx, 30 + dy), 3.2, 1.8), [1, 2, 16, 19, 20], 0.3, 3)
    for t in (24, 27, 30):
        for d in (-2, -1, 0, 1, 2):
            x, y = t + dx, int(28 + dy + (t - 20) * 0.23) + d
            if b.get(x, y) is not None:
                b.set(x, y, 1)
    teil(b, px_ellipse(17 + dx, 26 + dy, 4.0, 3.6), [16, 19, 20, 21, 18], 0.5, 4)
    teil(b, px_ellipse(hx, hy, 2.6, 2.4), [1, 2, 16, 19], 0.3, 5)
    b.set(hx - 2, hy, OUT); b.set(hx - 1, hy, 31); b.set(hx - 1, hy - 1, 3)
    # Fühler, gefiedert
    for (ex, ey, c) in ((hx - 6, hy - 9, 20), (hx - 1, hy - 10, 21)):
        for t in range(1, 9):
            x = int(round(hx - 1 + (ex - hx + 1) * t / 9)); y = int(round(hy - 2 + (ey - hy + 2) * t / 9))
            b.set(x, y, c)
            if t % 2 == 0 and t > 1:
                b.set(x - 1, y + 1, 19); b.set(x + 1, y + 1, 19)
    # Beine; die vorderen halten Ascheschleier
    for i, (lx, ly) in enumerate(((15 + dx, 29 + dy), (18 + dx, 29 + dy), (21 + dx, 30 + dy))):
        fx, fy = lx - 3 + i, min(45, ly + 6)
        b.linie(lx, ly, fx, fy, 1)
        if i < 2 and art != 'defeated':
            for yy in range(fy + 1, 46):
                xx = fx - 1 - (yy - fy) // 4 + (1 if (yy // 3 + f + i) % 2 else 0)
                if (yy + i + xx) % 2 == 0:
                    b.set(xx, yy, 21 if yy < fy + 6 else 20)
                if i == 0 and (yy + f) % 3 == 0:
                    b.set(xx - 2, yy, 19)
    # vordere Flügel
    for pts, s, auge in ((nahe_u, 6, False), (nahe_o, 7, True)):
        pix = px_poly(pts)
        teil(b, pix, WF, 0.3, s)
        band(b, pix, pts, s)
        if auge:
            cx = sum(p[0] for p in pts) / len(pts) - 0.5
            cy = sum(p[1] for p in pts) / len(pts) - 2
            for (x, y) in pix:
                d = math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 0.9)
                if d < 1.3:
                    b.set(x, y, 4)
                elif d < 2.3:
                    b.set(x, y, 31)
                elif d < 3.2:
                    b.set(x, y, 30)
                elif d < 3.8:
                    b.set(x, y, 1)
    b.umriss(OUT)
    for i in range(6):                                                # Asche schwebt
        x, y = int(3 + h3(i, f, 91) * 42), int(3 + h3(i, f, 92) * 40)
        if b.get(x, y) is None:
            b.set(x, y, 20 if i % 2 else 19)
    w = {3: 1, 4: 2, 5: 3}.get(f, 0) if art in ('attack', 'special') else 0
    if w:                                                             # Aschewolke nach links
        staub(b, 8 - w + dx, 24 + dy, 5 + w * 2, [19, 20, 21, 16], 0.55 if w < 3 else 0.25, 95 + w)
        if art == 'special':
            staub(b, 7 - w, 24, 4 + w * 2, [30, 31, 3, 4], 0.2, 97 + w)
    if art == 'hurt' and f == 0:
        blitz_hell(b)
    if art == 'defeated' and f >= 2:                                  # Aschehäufchen
        for x in range(12, 38):
            if h3(x, f, 98) < 0.75:
                b.set(x, 46, 19 if x % 3 else 20)
                if f == 3 and h3(x, 1, 99) < 0.4:
                    b.set(x, 45, 20)
    return b, {}


def band(b, pix, pts, s):
    """Flügelzeichnung: dunkles Querband, helle Adern von der Wurzel, heller Fransenrand"""
    x0, y0 = pts[0]
    for (x, y) in pix:
        d = math.hypot(x - x0, y - y0)
        if 9.5 < d < 11.5 and h3(x, y, s) < 0.8:
            b.set(x, y, 2)
    for (ex, ey) in pts[2:-1]:
        for t in range(3, 14):
            x = int(round(x0 + (ex - x0) * t / 14)); y = int(round(y0 + (ey - y0) * t / 14))
            if (x, y) in pix:
                b.set(x, y, 20)
    for (x, y) in pix:
        rand = sum((x + a, y + c) not in pix for a, c in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        if rand and math.hypot(x - x0, y - y0) > 8 and h3(x, y, s + 1) < 0.6:
            b.set(x, y, 21)


# --- Aussaatschwarm: offene Samenschoten -------------------------------------------------------------------------------------------
def schote(b, cx, cy, rx, ry, auf, s, kipp=0):
    """Schote: spitz zulaufende Hülle, offen nach links (Lippe hell), darin goldene Samen; Ranke gekrümmt nach rechts unten"""
    huelle = {}
    inneres = {}
    for (x, y), v in px_ellipse(cx, cy, rx, ry).items():
        nx = (x + 0.5 - cx) / rx
        ny = (y + 0.5 - cy) / ry
        if abs(nx) > 1 - abs(ny) ** 2 * 0.9:                          # spitze Enden oben und unten
            continue
        if nx < -0.15 + kipp * 0.1 and abs(ny) < auf:
            inneres[(x, y)] = v
        else:
            huelle[(x, y)] = v
    teil(b, huelle, R['schote'], 0.25, s)
    for (x, y) in huelle:                                             # Adern
        if (x - int(cx)) % 3 == 0 and h3(x, y, s) < 0.6:
            b.set(x, y, 5)
    for (x, y) in huelle:                                             # Lippe an der Öffnung
        if (x - 1, y) in inneres or (x, y - 1) in inneres or (x, y + 1) in inneres:
            b.set(x, y, 22)
    teil(b, inneres, [6, 8], 0.2, s + 1, kante=False)
    for (x, y) in inneres:                                            # Samen
        if (x + 2 * y) % 3 == 0:
            b.set(x, y, 4 if h3(x, y, s + 2) < 0.5 else 3)
        elif (x + 2 * y) % 3 == 1 and h3(x, y, s + 3) < 0.3:
            b.set(x, y, 14)
    # Stiel und Ranke nach rechts unten
    sx, sy = cx + 1, cy + ry * 0.85
    for t in range(0, 12):
        x = int(round(sx + math.sin(t * 0.55 + s) * 2 + t * 0.35)); y = int(round(sy + t))
        b.set(x, y, 6 if t % 3 else 8)
        if t in (4, 8):
            b.set(x + 1, y, 6); b.set(x + 2, y + 1, 8)


def schwarm(art, f):
    b = Bild(48, 48, seed=120 + f)
    ph = [0, 1, 2, 1]
    auf = 0.55
    dx = dy = 0
    spr = 0
    if art == 'idle':
        offs = [(0, [0, 1, 1, 0][f]), (0, [1, 1, 0, 0][f]), (0, [1, 0, 0, 1][f])]
    elif art in ('attack', 'special'):
        dx, auf, spr = [(0, 0.55, 0), (2, 0.65, 0), (3, 0.8, 0), (-3, 0.9, 1), (-3, 0.85, 2), (-1, 0.65, 3)][f]
        offs = [(0, 0), (0, -1 if f in (1, 2) else 0), (0, 1 if f in (1, 2) else 0)]
    elif art == 'hurt':
        dx = [3, 4, 2][f]; offs = [(0, 0), (1, -1), (0, 1)]
    else:
        offs = [(0, d) for d in ([3, 6, 10, 14][f], [5, 9, 13, 17][f], [2, 4, 7, 9][f])]
        auf = [0.4, 0.3, 0.2, 0.15][f]
    teile = [(31, 13, 4.4, 6.0, 140), (34, 31, 4.0, 5.4, 150), (16, 22, 5.6, 7.4, 160)]
    for i, (cx, cy, rx, ry, s) in enumerate(teile):
        ox, oy = offs[i]
        schote(b, cx + dx + ox, min(cy + dy + oy, 46 - ry), rx, ry, auf, s)
    b.umriss(OUT)
    # Flaum treibt
    for i in range(7):
        x, y = int(6 + h3(i, f, 131) * 38), int(4 + h3(i, f, 132) * 40)
        if b.get(x, y) is None:
            b.set(x, y, 22 if i % 2 else 17)
            if i % 3 == 0:
                b.set(x + 1, y - 1, 17)
    if spr:                                                           # Samen spritzen nach links
        for (cx, cy, rx, ry, s) in teile:
            for k in range(10 + (6 if art == 'special' else 0)):
                t = 2 + h3(k, spr, s) * (8 + spr * 4)
                a = math.pi + (h3(k, spr, s + 1) - 0.5) * (0.6 + spr * 0.25)
                x, y = int(cx + dx - rx + math.cos(a) * t), int(cy + math.sin(a) * t)
                if 0 <= x < 48 and 0 <= y < 48:
                    b.set(x, y, 4 if k % 3 else 14)
        if art == 'special':
            glow(b, 14 + dx, 22, 5, [3, 4, 14], 0.8)
    if art == 'hurt' and f == 0:
        blitz_hell(b)
    return b, {}


# --- Registerleib: verbliebener Druck ------------------------------------------------------------------------------------------------
def blattlage(b, pts, s, hell=0.0):
    """unregelmäßige Lage aus Blättern: Fläche in Papiertönen, Zeilen grau, Ecken stehen ab"""
    pix = px_poly(pts)
    teil(b, pix, R['papier'], 0.3, s, dv=hell)
    for (x, y) in pix:
        if y % 2 == 0 and (x + s) % 5 != 0 and h3(x, y, s) < 0.55:
            b.set(x, y, 21 if h3(x, y, s + 1) < 0.5 else 12)
    return pix


def register(art, f):
    """Rest des Registerleibs: gebückter Leib aus Blattlagen und Bleilettern, Kopf als Blattkapuze mit Glutauge, Arm aus Karteikarten mit Stempel"""
    b = Bild(48, 48, seed=170 + f)
    dx = dy = 0
    arm = 0
    if art == 'idle':
        dy = [0, 0, 1, 1][f]
    elif art in ('attack', 'special'):
        dx, dy, arm = [(0, 0, 0), (2, 0, 7), (3, -1, 11), (-2, 1, -5), (-2, 1, -6), (0, 0, -1)][f]
    elif art == 'hurt':
        dx = [3, 4, 2][f]
    else:
        dy = [2, 5, 9, 13][f]
    # Papierhaufen und Steinbrocken am Boden
    blattlage(b, [(9, 46), (11, 41), (16, 38), (24, 39), (31, 37), (38, 40), (42, 46)], 1, -0.1)
    for (x, y) in ((14, 44), (15, 44), (35, 45), (36, 44)):                # Steinsplitter
        b.set(x, y, 16)
    if not (art == 'defeated' and f == 3):
        t = 12 + dy
        # hinterer Rücken (dunkler Stein mit Tinte)
        teil(b, px_poly([(24 + dx, t + 3), (34 + dx // 2, t + 6), (38, 38), (22, 39)]), R['stein'], 0.3, 3)
        for (x, y) in list(px_poly([(24 + dx, t + 3), (34 + dx // 2, t + 6), (38, 38), (22, 39)])):
            if h3(x, y, 31) < 0.12:
                b.set(x, y, 27)
        # Blattlagen von unten nach oben, versetzt
        lagen = [[(15, 39), (17, 33), (27, 31), (35, 34), (34, 39)], [(16 + dx // 3, 34), (18 + dx // 2, 27), (28 + dx // 2, 25), (33, 30), (30, 35)],
                 [(17 + dx // 2, 29), (19 + dx, 21 + dy), (29 + dx, 19 + dy), (31 + dx // 2, 25), (26, 30)]]
        for i, pts in enumerate(lagen):
            blattlage(b, pts, 4 + i, 0.05 * i)
        for (lx, ly) in ((25, 33), (29, 28), (22, 27)):               # Bleilettern
            X, Y = lx + dx // 2, ly + dy // 2
            for yy in range(Y, Y + 3):
                b.set(X, yy, 2); b.set(X + 1, yy, 16)
            b.set(X, Y, 20)
        # Kopf: Kapuze aus Blättern, Glutauge
        kx, ky = 19 + dx, t + 4
        blattlage(b, [(kx - 5, ky + 3), (kx - 4, ky - 3), (kx + 1, ky - 6), (kx + 6, ky - 3), (kx + 6, ky + 4)], 8, 0.1)
        teil(b, px_ellipse(kx - 1.5, ky + 0.5, 2.6, 2.2), R['tinte'], 0.2, 9, kante=False)
        b.set(kx - 2, ky, 4); b.set(kx - 1, ky, 14); b.set(kx - 2, ky + 1, 3)
        # Arm aus Karteikarten mit Stempel
        sx, sy = 20 + dx, t + 11
        hx, hy = sx - 10, sy + 6 - arm
        for k in range(0, 11):
            x = int(round(sx + (hx - sx) * k / 10)); y = int(round(sy + (hy - sy) * k / 10))
            for d in (-1, 0, 1):
                b.ton(x, y + d, R['papier'], 0.75 - 0.25 * d, 0.3, 10)
            if k % 3 == 0:
                b.set(x, y - 1, 21); b.set(x, y + 1, 12)
        stempel = {(x, y): 0.75 - 0.1 * (x - hx + 3) for y in range(int(hy) + 1, int(hy) + 5) for x in range(int(hx) - 3, int(hx) + 3)}
        teil(b, stempel, R['holz'], 0.15, 11)
        for x in range(int(hx) - 3, int(hx) + 3):
            b.set(x, int(hy) + 5, 27); b.set(x, int(hy) + 6, 0)
        b.set(int(hx) - 1, int(hy), 3); b.set(int(hx), int(hy), 4)
    b.umriss(OUT)
    for i in range(4):                                                # lose Blätter
        x = int(5 + h3(i, f if art == 'idle' else f + 7, 181) * 38)
        y = int(5 + h3(i, f if art == 'idle' else f + 7, 182) * 26)
        if b.get(x, y) is None and b.get(x + 1, y) is None:
            b.set(x, y, 22); b.set(x + 1, y, 17); b.set(x, y + 1, 13)
    w = {3: 1, 4: 2, 5: 3}.get(f, 0) if art in ('attack', 'special') else 0
    if w and w < 3:                                                   # Tinte spritzt beim Aufschlag
        cx, cy = 10 + dx, 12 + dy + 17 + 6 + 5
        for k in range(14 + (8 if art == 'special' else 0)):
            a = math.pi * (0.55 + h3(k, w, 183) * 0.95)
            tt = 2 + h3(k, w, 184) * (4 + w * 3)
            x, y = int(cx + math.cos(a) * tt), int(cy - abs(math.sin(a)) * tt * 0.8)
            if 0 <= x < 48 and 0 <= y < 48:
                b.set(x, y, 27 if k % 3 else 28)
        if art == 'special':
            for k in range(5):
                b.set(int(cx - 4 + k * 3), int(cy - 8 - (k % 2) * 2), 14)
    if art == 'hurt' and f == 0:
        blitz_hell(b)
    return b, {}



# --- Blätter ---------------------------------------------------------------------------------------------------------------------------
REIHEN = (('idle', 0, 4), ('attack', 6, 6), ('special', 12, 6), ('hurt', 18, 3), ('defeated', 24, 4))
ANIMS = {'idle': {'frames': [0, 1, 2, 3], 'frameRate': 6, 'repeat': -1}, 'attack': {'frames': [6, 7, 8, 9, 10, 11], 'frameRate': 8, 'repeat': 0},
         'special': {'frames': [12, 13, 14, 15, 16, 17], 'frameRate': 8, 'repeat': 0}, 'hurt': {'frames': [18, 19, 20], 'frameRate': 8, 'repeat': 0},
         'defeated': {'frames': [24, 25, 26, 27], 'frameRate': 6, 'repeat': 0}}


def mensch_frame(m, zeichne=None):
    def fn(art, f):
        b, q = (zeichne or (lambda a, g: mensch(m, a, g)))(art, f)
        if m.effekt and q.get('wirk'):
            m.effekt(b, q, q['wirk'], art == 'special')
        if art == 'hurt' and f == 0:
            blitz_hell(b)
        return b, q
    return fn


def blatt(fn):
    im = Image.new('RGBA', (288, 240), (0, 0, 0, 0))
    for art, start, n in REIHEN:
        for f in range(n):
            b, _ = fn(art, f)
            c = start + f
            im.alpha_composite(b.image(), ((c % 6) * 48, (c // 6) * 48))
    return im


FIGUREN = {   # Blatt-ID: (Zeichenfunktion, Figur, Begegnungen, bisher geteilt mit)
    'enemy_ke_thorne': (mensch_frame(MENSCHEN[0]), 'Aldo Thorne, Kopfgeldjäger (Eisen): Pelzmütze, Pelzkragen, Setzhammer', ['kgj_bh_thorne'], ('enemy_kgj_eisen', 'Mara Harrow')),
    'enemy_ke_dunmore': (mensch_frame(MENSCHEN[1]), 'Feodor Dunmore, Kopfgeldjäger (Maske): trägt dein Gesicht als Maske, Zylinder, Stilett', ['kgj_bh_dunmore'], ('enemy_kgj_maske', 'Silas Quill')),
    'enemy_ke_lerch': (mensch_frame(MENSCHEN[2]), 'Merit Lerch, Kopfgeldjägerin (Laterne): Ölzeug, Blendlaterne, Lichtkeil', ['kgj_bh_lerch'], ('enemy_kgj_laterne', 'Ilka Barlow')),
    'enemy_ke_kopfgeldrotte': (mensch_frame(MENSCHEN[3], rotte), 'Die Kopfgeldrotte: Jäger mit Gewehr, ein zweiter dahinter', ['hkr_dunscar_trupp'], ('enemy_kgj_eisen', 'Mara Harrow, Aldo Thorne')),
    'enemy_ke_rostbrueder': (mensch_frame(MENSCHEN[4]), 'Die letzten Rostbrüder: alter Rostbruder in Kutte, Enterhaken an der Kette', ['hkr_kettlegate_trupp'], ('enemy_schlachtergehilfe', 'Knox, der Schlachtergehilfe')),
    'enemy_ke_gefolge': (mensch_frame(MENSCHEN[5]), 'Gefolge des Rivalen: Leibwächter mit Melone und Schlagring', ['rivale_gefolge_1', 'rivale_gefolge_2', 'rivale_gefolge_3', 'rivale_gefolge_4'], ('hg_battle_kessel', 'Kessel-Halbgott der Rivalen, Gerold Aschmann')),
    'enemy_ke_grauer_schleier': (mensch_frame(MENSCHEN[6]), 'Grauer Schleier: Blumenverkäuferin der Schleierschwestern, Porzellan unter dem Schleier', ['schleier_schatten'], ('enemy_schleier_messerin', 'Fräulein Grau, Messerin')),
    'enemy_ke_aschenweberin': (motte, 'Aschenweberin: Motte aus Asche mit Glutaugen, hält Ascheschleier', ['sg_aschenweberin'], ('enemy_lohnlistenmotte', 'Lohnlistenmotte')),
    'enemy_ke_aussaatschwarm': (schwarm, 'Aussaatschwarm: drei offene Samenschoten der Mutterwurzel', ['bha_aussaat_schwarm'], ('enemy_vg_bh_boss_mutterwurzel', 'Blütenmund der Mutterwurzel (Boss)')),
    'enemy_ke_registerleib_rest': (register, 'Registerleib, verbliebener Druck: gebückter Rest aus Blattlagen, Stempelarm', ['cwa_registerleib_rest'], ('enemy_vg_cw_boss_nullfundament', 'Registerleib des Nullfundaments (Boss)')),
}


if __name__ == '__main__':
    od = os.path.join(ROOT, 'public', 'sprites', 'battle')
    pal = set(PAL)
    assets = []
    for key, (fn, figur, begegnungen, vorher) in FIGUREN.items():
        im = blatt(fn)
        data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
        assert all(px[3] in (0, 255) and (px[3] == 0 or px[:3] in pal) for px in data), key
        p = os.path.join(od, key + '.png')
        im.save(p)
        assets.append({'id': key, 'file': f'battle/{key}.png', 'figur': figur, 'begegnungen': begegnungen, 'bisher': vorher[0], 'bisher_mit': vorher[1], 'width': 288, 'height': 240,
                       'frameWidth': 48, 'frameHeight': 48, 'columns': 6, 'rows': 5, 'animations': ANIMS,
                       'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()})
        print(key)
    json.dump({'version': 1, 'batch': 'kampf-eigen', 'palette': 'manifest-halbgott.json', 'erzeugt': 'python3 tools/art/kampf_eigen/figuren.py',
               'hinweis': 'Ruhe und Angriff eigens gezeichnet; special/hurt/defeated aus denselben Posen abgeleitet', 'assets': assets},
              open(os.path.join(ROOT, 'public', 'sprites', 'manifest-kampf-eigen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
