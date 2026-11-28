"""Varrowmouth-Kulissen Runde 1: zehn Requisiten pixelweise (python3 tools/art/vm_kulissen/assets.py).
Schreibt public/sprites/props/vmk_*.png. Palette und Pinsel: pinsel.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from pinsel import *

OUTDIR = os.path.join(ROOT, 'public', 'sprites', 'props')
HOLZ_GRAU = [10, 25, 12, 13, 14]
EISEN = [1, 10, 11, 12, 13]


# 1 -- Pegelzaun: Zaunfeld aus Pegelstangen (16x32, vier Varianten, kachelt waagerecht) ---------------------------------
def pegelstange(b, x0, y0, y1, breit=4, s=0, alge=8, band=6):
    """verwitterte Holzstange mit abblätternder Pegelfarbe (helle Felder, dunkle E-Striche); unten Algen und Salzrand"""
    x1 = x0 + breit - 1
    b.zylinder(x0, x1, y0, y1, HOLZ_GRAU, korn=0.35, s=s, hell=0.7)
    for y in range(y0 + 1, y1 - alge + 1):
        for x in range(x0, x1 + 1):
            f = (x - x0) / max(1, breit - 1)
            if h3(x, y, s + 40) < 0.16:
                continue  # Farbe abgeblättert
            v = 0.72 - 0.55 * f
            b.ton(x, y, [4, 5, 6, 7], v, 0.35, s + 41)
        k = (y - y0 - 1) % band
        if k in (0, 1):
            lang = max(2, breit // 2) if (y - y0 - 1) // band % 2 else breit - 1
            for x in range(x0, x0 + lang):
                b.set(x, y, 2 if x == x0 else 3)
    for y in range(y1 - alge + 1, y1 + 1):
        for x in range(x0, x1 + 1):
            b.ton(x, y, [16, 17, 18, 19], 0.65 - 0.5 * (x - x0) / max(1, breit - 1) - 0.25 * (y - (y1 - alge)) / alge, 0.4, s + 3)
    for x in range(x0, x1 + 1):  # Salzrand an der Wasserlinie
        if h3(x, y1 - alge, s) < 0.75:
            b.set(x, y1 - alge, 8 if h3(x, 1, s) < 0.5 else 7)
    b.rechteck(x0 - 1, y0 - 2, x1 + 1, y0, EISEN, 0.55, 0.3, licht=0.6, s=s + 5)


def planke(b, x0, x1, y, dick=3, s=0, ramp=HOLZ_GRAU):
    for yy in range(y, y + dick):
        for x in range(x0, x1 + 1):
            v = 0.78 - 0.3 * (yy - y) - (0.2 if h3(x // 3, yy, s) < 0.22 else 0)
            b.ton(x, yy, ramp, max(0, min(1, v)), 0.35, s)
    for x in range(x0, x1 + 1):  # Fugen und Astlöcher
        if h3(x, y, s + 9) < 0.07:
            b.set(x, y + 1, 10)


def pegelzaun():
    frames = []
    for var in range(4):
        b = Bild(16, 32, seed=11 + var)
        if var == 2:  # obere Planke gebrochen, hängt schräg
            planke(b, 0, 4, 11, s=var)
            for i in range(8):
                for d in range(3):
                    b.ton(10 + i // 2, 12 + i + d, HOLZ_GRAU, 0.75 - 0.3 * d, 0.3, 4)
            planke(b, 12, 15, 11, s=var + 3)
        else:
            planke(b, 0, 15, 11, s=var)
        planke(b, 0, 15, 20, s=var + 7)
        pegelstange(b, 6, 4, 31, s=var * 3 + 1)
        if var == 1:  # Tau um die Stange
            for y in (17, 18, 19, 24, 25):
                for x in range(5, 11):
                    b.ton(x, y, SAND[:4], 0.7 - 0.12 * (x - 5) + (0.15 if (x + y) % 2 else -0.1), 0.2, 2)
        if var == 3:  # Zollmarke aus Messing
            b.rechteck(5, 13, 10, 17, MESSING, 0.5, 0.25, licht=0.8, s=6)
            b.set(7, 15, 25); b.set(8, 15, 25); b.set(7, 14, 26)
        b.umriss()
        b.streu(lambda x, y: y > 22, 8, 0.05)  # Salzkörner
        frames.append(b)
    return frames


# 2 -- Zolltor: zwei dicke Pegelpfosten, Querbalken, blindes Zollschild, zwei Laternen (96x48) ---------------------------
def zolltor():
    import math
    b = Bild(96, 48, seed=21)
    for px in (2, 82):
        b.rechteck(px - 1, 39, px + 12, 47, STEIN, 0.5, 0.35, licht=0.7, s=px)       # Steinfuß
        for x in range(px - 1, px + 13):
            b.set(x, 43, 11 if h3(x, 43, 2) < 0.6 else 12)
        pegelstange(b, px, 7, 38, breit=12, s=px, alge=7, band=5)
        for y in range(14, 30, 5):  # eiserne Bänder
            pass
    # Querbalken mit Eisenbändern
    for y in range(3, 11):
        for x in range(0, 96):
            v = 0.8 - 0.1 * (y - 3) - (0.18 if h3(x // 4, y, 5) < 0.2 else 0)
            b.ton(x, y, HOLZ, max(0, min(1, v)), 0.32, 1)
    for x in range(0, 96):
        if h3(x, 6, 12) < 0.1:
            b.set(x, 6, 10)
    for bx in (5, 19, 76, 90):
        for y in range(3, 11):
            b.ton(bx, y, EISEN, 0.75 - 0.08 * (y - 3), 0.15, 2)
            b.ton(bx + 1, y, EISEN, 0.45 - 0.08 * (y - 3), 0.15, 2)
        b.set(bx, 6, 13)
    # Schild an zwei Ketten
    for cx in (38, 57):
        for y in range(11, 15):
            b.set(cx, y, 11 if y % 2 else 13)
    b.rechteck(34, 15, 61, 28, HOLZ_NASS, 0.6, 0.3, licht=0.7, s=8)
    b.rechteck(36, 17, 59, 26, [21, 22, 23, 24], 0.35, 0.35, licht=0.4, s=9)
    for x in range(38, 58):  # Wellenlinie und Pegelstrich in Messing, kein Text
        y = 22 + round(1.4 * math.sin((x - 38) / 3.0))
        b.set(x, y, 29 if h3(x, y, 1) < 0.7 else 28)
    for y in range(18, 26):
        b.set(48, y, 30 if y < 21 else 28)
        if y % 2 == 0:
            b.set(49, y, 27)
    for x, y in ((34, 15), (61, 15), (34, 28), (61, 28)):
        b.leer(x, y)
    # Laternen unter dem Balken
    for lx in (22, 70):
        b.set(lx + 2, 11, 11); b.set(lx + 2, 12, 12)
        b.rechteck(lx - 1, 13, lx + 5, 13, EISEN, 0.5, 0.2)
        b.rechteck(lx, 14, lx + 4, 19, MESSING, 0.8, 0.25, s=lx)
        b.set(lx + 2, 15, 30); b.set(lx + 2, 16, 30); b.set(lx + 1, 16, 29); b.set(lx + 3, 17, 29)
        b.rechteck(lx - 1, 20, lx + 5, 20, EISEN, 0.5, 0.2)
        b.set(lx + 2, 21, 11)
        for y in range(14, 20):
            b.set(lx, y, 11); b.set(lx + 4, y, 10)
    b.umriss()
    b.streu(lambda x, y: 28 < y < 39, 8, 0.04)
    return b


# Hilfen für Felsen ------------------------------------------------------------------------------------------------------
NASSSTEIN = [1, 10, 11, 12, 13, 14]


def fels(b, cx, cy, rx, ry, seed, ramp=NASSSTEIN, alge=0.3, salz=0.012):
    """ein Felsbrocken mit eigenem Umriss, Licht oben links, Algen unten"""
    t = Bild(b.w, b.h, seed=seed)
    def v(x, y):
        dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry
        return 0.55 - 0.4 * dx - 0.45 * dy
    # unregelmäßige Kontur: Radius schwankt mit dem Winkel
    import math
    for y in range(int(cy - ry) - 2, int(cy + ry) + 3):
        for x in range(int(cx - rx) - 2, int(cx + rx) + 3):
            dx, dy = (x + 0.5 - cx), (y + 0.5 - cy)
            a = math.atan2(dy, dx)
            r = 1 + 0.12 * math.sin(3 * a + seed) + 0.07 * math.sin(7 * a + seed * 2)
            if (dx / rx) ** 2 + (dy / ry) ** 2 <= r * r:
                t.ton(x, y, ramp, max(0, min(1, v(x, y))), 0.38, seed)
                if dy > ry * 0.25 and h3(x, y, seed + 5) < alge * (dy / ry):
                    t.ton(x, y, ALGE[:4], 0.5 - 0.3 * dy / ry, 0.3, seed + 6)
    t.streu(lambda x, y: y < cy - ry * 0.3, 7, salz, s=seed + 9)
    # Riss
    rx0 = int(cx + rx * 0.1)
    for i in range(int(ry * 0.8)):
        x = rx0 + (1 if h3(i, 0, seed) < 0.3 else 0) - i // 4
        if t.get(x, int(cy - ry * 0.3) + i) is not None:
            t.set(x, int(cy - ry * 0.3) + i, 10)
    t.umriss()
    b.einfuegen(t, 0, 0)


# 3 -- Leuchtturmfuß: Felsnase mit gemauertem Rundsockel, Treppe und Geländer (96x80), Turm aus CV steht darauf ----------
def leuchtturm_fuss():
    b = Bild(96, 80, seed=31)
    # hintere Felsen
    for (cx, cy, rx, ry, sd) in [(18, 30, 18, 14, 1), (78, 28, 18, 15, 2), (48, 22, 26, 12, 3), (10, 52, 11, 14, 4), (86, 54, 11, 14, 5)]:
        fels(b, cx, cy, rx, ry, sd)
    # Rundsockel: Deckfläche und Mauerband
    t = Bild(96, 80, seed=32)
    cx, top, rx, ry = 48, 34, 28, 9
    for y in range(top - ry, top + ry + 1):
        for x in range(cx - rx - 1, cx + rx + 2):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - top) / ry
            if dx * dx + dy * dy <= 1:
                t.ton(x, y, STEIN, 0.78 - 0.25 * dx - 0.2 * dy, 0.3, 2)
    for y in range(top, top + 12):
        for x in range(cx - rx, cx + rx + 1):
            dx = (x + 0.5 - cx) / rx
            if abs(dx) <= 1 and y >= top + ry * (1 - dx * dx) ** 0.5 - 1 or (abs(dx) <= 1 and y > top):
                yy = y - top
                lower = ry * (1 - dx * dx) ** 0.5 + 11
                if yy <= lower:
                    t.ton(x, y, STEIN, 0.5 - 0.35 * dx - 0.02 * yy, 0.3, 3)
    # Fugen im Mauerband (Läuferverband)
    for y in range(top + 2, top + 22):
        for x in range(cx - rx, cx + rx + 1):
            q = t.get(x, y)
            if q is None:
                continue
            dx = (x + 0.5 - cx) / rx
            surf = top + ry * (1 - min(1, dx * dx)) ** 0.5
            if y <= surf:
                continue
            rel = int(y - surf)
            if rel % 4 == 0 or ((x + (rel // 4) * 3) % 7 == 0):
                t.set(x, y, 10)
    # Fugen auf der Deckfläche: Ring
    for y in range(top - ry, top + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            dx, dy = (x + 0.5 - cx) / rx, (y + 0.5 - top) / ry
            d = dx * dx + dy * dy
            if t.get(x, y) is not None and 0.55 < d < 0.68:
                t.set(x, y, 12)
    t.umriss()
    b.einfuegen(t, 0, 0)
    # vordere Felsen links und rechts der Treppe
    for (cx2, cy2, rx2, ry2, sd) in [(20, 64, 17, 13, 6), (76, 65, 17, 12, 7), (6, 72, 7, 7, 8), (90, 73, 6, 6, 9)]:
        fels(b, cx2, cy2, rx2, ry2, sd, alge=0.5)
    # Treppe vom Sockel hinab
    t = Bild(96, 80, seed=33)
    sx0, sx1 = 40, 56
    stufen = [(50, 54), (55, 59), (60, 64), (65, 69), (70, 74), (75, 79)]
    for i, (y0, y1) in enumerate(stufen):
        w = i // 2
        for y in range(y0, y1 + 1):
            for x in range(sx0 - w, sx1 + w + 1):
                if y - y0 < 2:
                    t.ton(x, y, STEIN, 0.8 - 0.2 * (x - sx0) / 16, 0.25, 4 + i)
                else:
                    t.ton(x, y, STEIN, 0.38 - 0.15 * (x - sx0) / 16, 0.3, 4 + i)
                    if h3(x, y, i) < 0.12 * (i + 1) / 3:
                        t.ton(x, y, ALGE[:3], 0.4, 0.3, 7)
    t.umriss()
    b.einfuegen(t, 0, 0)
    # Geländer rechts der Treppe
    for i in range(4):
        px, py = 58 + (i * 3) // 3, 47 + i * 9
        for y in range(py - 6, py + 1):
            b.set(px, y, OUT); b.set(px + 1, y, 12 if y % 3 else 13)
    for i in range(30):
        x, y = 58 + (i * 3) // 30, 41 + i
        b.set(x, y, OUT); b.set(x + 1, y, 13 if i % 3 else 12); b.set(x + 2, y, OUT)
    # Salz und Muscheln am Fuß
    b.streu(lambda x, y: y > 66, 7, 0.015, s=21)
    b.streu(lambda x, y: y > 70, 15, 0.02, s=22)
    return b


# 4/5/6 -- Wrackrümpfe in 3/4-Aufsicht: gekrängter Bootskörper, Innenraum offen, helle Spantbögen, Bordwand mit Algen ---
def _profil(u, heck_offen=False):
    """halbe Breite 0..1 entlang des Rumpfs (u=0 Heck, u=1 Bug)"""
    import math
    if u > 0.45:
        return max(0.0, 1 - ((u - 0.45) / 0.55) ** 2) ** 0.55
    return 1 - 0.28 * ((0.45 - u) / 0.45) ** 2


def rumpf(w, h, seed, R=13, F=11, bruch=(0.35, 0.65), u0=0.0, u1=1.0, spiegel=False, mast=False, ruder=False, schlick=0.12, links=2, step=5, rw=2, seam=3):
    """w x h; der Rumpf liegt mit der Unterkante der Bordwand bei h-2. u0..u1: gezeigter Abschnitt (Bruchstück)"""
    import math
    b = Bild(w, h, seed=seed)
    L = w - 2 - links
    cy = h - 3 - F - int(R * 0.8)
    def geo(x):
        u = u0 + (u1 - u0) * (x - links) / max(1, L - 1)
        p = _profil(u)
        yF = cy - R * p
        yN = cy + R * p * 0.8
        yB = yN + F * (0.35 + 0.65 * p)
        return u, p, yF, yN, min(yB, h - 2)
    gebrochen_rechts = u1 < 0.99
    gebrochen_links = u0 > 0.01
    # 1. Bordwand (vorne, unter dem nahen Schandeck)
    for x in range(links, links + L):
        u, p, yF, yN, yB = geo(x)
        if p <= 0.02:
            continue
        for y in range(int(math.ceil(yN)), int(yB) + 1):
            rel = (y - yN) / max(1, yB - yN)
            v = 0.62 - 0.55 * rel - (0.1 if int((y - yN) / seam + x / 17) % 4 == 0 else 0)
            b.ton(x, y, HOLZ_NASS, max(0, min(1, v)), 0.3, seed + 1)
            if int(y - yN) % seam == seam - 1:
                b.set(x, y, 10 if h3(x, y, seed) < 0.8 else 25)
            if rel > 0.45 and h3(x, y, seed + 2) < (rel - 0.3) * 1.3:
                b.ton(x, y, [16, 17, 18, 19], 0.6 - 0.45 * rel, 0.35, seed + 3)
            if rel > 1 - schlick:
                b.ton(x, y, [10, 16, 25], 0.4, 0.35, seed + 4)
    # 2. Innenraum: dunkel, unten Wasser; im Bruch fehlt die ferne Wand, dort sieht man den Schlick dahinter
    offen = lambda u: bruch[0] + 0.05 <= u <= bruch[1] - 0.05
    for x in range(links, links + L):
        u, p, yF, yN, yB = geo(x)
        for y in range(int(math.ceil(yF)), int(yN) + 1):
            rel = (y - yF) / max(1, yN - yF)
            if offen(u) and rel < 0.42 + 0.12 * math.sin(x * 0.55 + seed):
                continue
            if rel > 0.62 + 0.08 * math.sin(x * 0.4):
                b.ton(x, y, [21, 22, 23], 0.25 + 0.3 * (1 - rel), 0.35, seed + 5)
            else:
                b.ton(x, y, [1, 2, 3], 0.45 - 0.4 * rel, 0.35, seed + 6)
    # 3. Innenbeplankung an Heck und Bug (noch heil)
    for x in range(links, links + L):
        u, p, yF, yN, yB = geo(x)
        if bruch[0] <= u <= bruch[1]:
            continue
        for y in range(int(math.ceil(yF)), int(yN) + 1):
            rel = (y - yF) / max(1, yN - yF)
            if rel > 0.82:
                continue
            v = 0.52 - 0.4 * rel
            b.ton(x, y, HOLZ, max(0, min(1, v)), 0.3, seed + 7)
            if int(y - yF) % seam == 0:
                b.set(x, y, 25 if h3(x, y, seed) < 0.7 else 10)
    # 4. Spantbögen über den ganzen Innenraum
    spanten, x0 = [], links + 3
    while x0 < links + L - 2:
        spanten.append(x0)
        x0 += step + int(3 * h3(x0, 4, seed))
    for i, x0 in enumerate(spanten):
        u, p, yF, yN, yB = geo(x0)
        if p < 0.15 or (bruch[0] <= u <= bruch[1] and h3(i, 8, seed) < 0.2):
            continue
        kurz = bruch[0] <= u <= bruch[1] and h3(i, 9, seed) < 0.45
        for y in range(int(math.ceil(yF)) - (3 if bruch[0] <= u <= bruch[1] and not kurz else 0), int(yN) + 1):
            rel = (y - yF) / max(1, yN - yF)
            if kurz and rel < 0.45:
                continue
            xo = x0 + round(1.6 * math.sin(math.pi * max(0, min(1, rel))))
            for d in range(rw):
                b.ton(xo + d, y, HOLZ, 0.74 - 0.5 * rel - 0.3 * d / max(1, rw - 1), 0.3, seed + 8)
            b.set(xo + rw, y, 1)
    # 5. Schandecks (fern und nah), im Bruchbereich fehlt das ferne Stück
    for x in range(links, links + L):
        u, p, yF, yN, yB = geo(x)
        if p <= 0.02:
            continue
        fern_fehlt = offen(u)
        if not fern_fehlt:
            b.ton(x, int(yF), [25, 26, 27, 28], 0.8, 0.25, seed + 9)
            b.ton(x, int(yF) + 1, [10, 25, 26, 27], 0.45, 0.2, seed + 9)
        b.ton(x, int(yN), [25, 26, 27, 28, 29], 0.7, 0.25, seed + 10)
        b.ton(x, int(yN) + 1, [25, 26, 27, 28], 0.55, 0.2, seed + 10)
    # 6. Heckspiegel / Bruchkanten
    if not gebrochen_links:
        u, p, yF, yN, yB = geo(links)
        for y in range(int(yF), int(yB) + 1):
            b.ton(links, y, HOLZ, 0.7, 0.2, seed + 11)
            b.ton(links + 1, y, HOLZ, 0.45, 0.2, seed + 11)
    for (xa, seite) in ([(links + L - 1, -1)] if gebrochen_rechts else []) + ([(links, 1)] if gebrochen_links else []):
        u, p, yF, yN, yB = geo(xa)
        for y in range(int(yF) - 2, int(yB) + 1):  # ausgefranste Plankenenden
            zack = int(4 * h3(y // 2, 3, seed))
            for d in range(zack):
                xx = xa - seite * d
                if b.get(xx, y) is not None:
                    b.leer(xx, y)
    # 7. Vorsteven am Bug
    if not gebrochen_rechts:
        u, p, yF, yN, yB = geo(links + L - 1)
        sx = links + L - 2
        for y in range(int(cy) - 7, int(yB)):
            b.ton(sx, y, HOLZ, 0.75, 0.2, seed + 12)
            b.ton(sx + 1, y, HOLZ, 0.45, 0.2, seed + 12)
    if mast:  # umgestürzter Mast quer über dem Rumpf
        for i in range(int(L * 0.55)):
            x = int(links + L * 0.2) + i
            y = int(cy - R * 0.9) - 4 + i // 5
            for d in range(3):
                b.ton(x, y + d, HOLZ, 0.85 - 0.3 * d, 0.2, seed + 13)
    if ruder:  # Ruderblatt am Heckspiegel: oben schmal (Schaft), unten breit
        u, p, yF, yN, yB = geo(links)
        y0, y1 = int(yF) - 5, int(yB) - 1
        for y in range(y0, y1 + 1):
            f = (y - y0) / max(1, y1 - y0)
            breit = 2 if f < 0.35 else 2 + int((f - 0.35) * 9)
            for x in range(links - breit, links):
                b.ton(x, y, HOLZ, 0.85 - 0.45 * f - 0.1 * (links - x), 0.3, seed + 14)
            if f > 0.7:
                for x in range(links - breit, links):
                    if h3(x, y, seed) < 0.5:
                        b.ton(x, y, [16, 17, 18], 0.4, 0.3, seed + 15)
        for y in (y0 + 8, y0 + 16):  # Ruderbeschläge
            b.set(links - 1, y, 12); b.set(links - 2, y, 11)
    b.umriss()
    b.streu(lambda x, y: y > h - 8, 7, 0.04, s=seed + 15)
    return b


def wrackrumpf():
    return rumpf(80, 64, seed=41, R=19, F=12, bruch=(0.3, 0.62))


def wrackrumpf_lang():
    return rumpf(112, 64, seed=43, R=19, F=12, bruch=(0.22, 0.58), mast=True).gespiegelt()


def wrackheck():
    """Heckteil (4x3): hinten abgebrochen, mit Ruder, halb im Schlick"""
    return rumpf(64, 64, seed=47, R=19, F=12, bruch=(0.3, 1.0), u0=0.0, u1=0.62, ruder=True, schlick=0.35, links=8)


# 7 -- Rumpf der Wrackmutter: das größte Wrack, Maststumpf mit Netzen, Leck zum Kielraum auf der Südseite (128x128) ------
def wrackmutter_rumpf():
    import math
    b = rumpf(128, 128, seed=61, R=30, F=34, bruch=(0.26, 0.62), step=7, rw=3, seam=4)
    # Plankenstöße in der Bordwand (versetzte senkrechte Fugen)
    for y in range(60, 126):
        for x in range(4, 124):
            q = b.get(x, y)
            if q in (None, OUT, 0):
                continue
            reihe = y // 4
            if (x + reihe * 11) % 23 == 0:
                b.set(x, y, 10)
    # Leck in der Bordwand: gezackt, Plankenenden stehen hinein, innen Schwärze und ein Wasserschimmer
    x0, x1, yt, yb = 58, 84, 92, 121
    for x in range(x0, x1 + 1):
        f = (x - x0) / (x1 - x0)
        oben = yt + 6 * (1 - math.sin(math.pi * f)) + 3 * h3(x // 3, 1, 9)
        unten = yb - 2 * h3(x // 2, 2, 9)
        for y in range(int(oben), int(unten)):
            if b.get(x, y) not in (None, OUT):
                b.set(x, y, 0 if (y - oben) < 3 or f < 0.08 or f > 0.92 else 1)
        if x % 4 == 1:  # Plankenende ragt hinein
            ln = 2 + int(4 * h3(x, 3, 9))
            for d in range(ln):
                b.set(x, int(oben) + d, 26 if d < ln - 1 else 25)
                b.set(x + 1, int(oben) + d, 25)
    for x in range(x0 + 6, x1 - 5):
        if h3(x, 4, 9) < 0.5:
            b.set(x, yb - 4, 22)
    # Maststumpf aus dem Innenraum, oben gesplittert
    mx = 46
    for y in range(8, 86):
        for d in range(6):
            b.ton(mx + d, y, HOLZ, 0.85 - 0.12 * d - 0.15 * (y - 8) / 78, 0.25, 62)
        b.set(mx - 1, y, OUT); b.set(mx + 6, y, OUT)
    for d, top in enumerate((5, 9, 4, 11, 7, 6)):
        for y in range(top, 8):
            b.set(mx + d, y, 26 if d < 3 else 25)
        b.set(mx + d, top - 1, OUT)
    for y in (26, 27, 52, 53):  # Mastbänder
        for d in range(6):
            b.set(mx + d, y, 11 if d < 4 else 10)
    # Rah, schräg herabgefallen
    for i in range(50):
        x, y = 52 + i, 22 + i // 2
        for d in range(3):
            b.ton(x, y + d, HOLZ, 0.8 - 0.3 * d, 0.2, 63)
        b.set(x, y - 1, OUT); b.set(x, y + 3, OUT)
    # Netze: vom Mast und der Rah über das nahe Schandeck gehängt, Rautenmuster
    def netz(x0, y0, x1, y1, tief):
        for i in range(x1 - x0 + 1):
            x = x0 + i
            ya = y0 + (y1 - y0) * i / max(1, x1 - x0)
            yz = ya + tief * math.sin(math.pi * i / max(1, x1 - x0)) + 5
            for y in range(int(ya), int(yz)):
                if (x + y) % 4 == 0 or (x - y) % 4 == 0:
                    b.ton(x, y, [25, 26, 27, 28], 0.7 - 0.3 * (y - ya) / max(1, yz - ya), 0.25, 64)
            if h3(x, 0, 65) < 0.5:  # Schwimmer am unteren Rand
                b.set(x, int(yz), 29 if h3(x, 1, 65) < 0.4 else 27)
    netz(14, 60, 45, 80, 10)
    netz(60, 36, 104, 80, 14)
    for i in range(44):  # Tau vom Mast
        b.set(53 + (i * 2) // 3, 12 + i, 27 if i % 2 else 26)
    b.umriss()
    b.streu(lambda x, y: y > 116, 7, 0.04, s=66)
    return b


# 8 -- Registerregal: Regalblock des Registerkellers (80x96), Frame 0 Wasserlinie unten, Frame 1 nass bis zur Mitte -----
PAPIER = [14, 15, 9, 8]
RUECKEN = [[26, 27, 28], [13, 14, 15], [25, 26, 27], [12, 13, 14], [27, 28, 29], [11, 12, 13]]


def buendel(b, x0, y0, w, h, s):
    """Aktenbündel von oben: Papierkante, Schnur"""
    b.rechteck(x0, y0, x0 + w - 1, y0 + h - 1, PAPIER, 0.42, 0.3, licht=0.6, s=s)
    for y in range(y0, y0 + h):
        if (y - y0) % 2 == 1:
            b.set(x0 + w - 1, y, 14)
    sx = x0 + w // 2
    for y in range(y0, y0 + h):
        b.set(sx, y, 27)
    for x in range(x0, x0 + w):
        b.set(x, y0 + h // 2, 27 if h3(x, y0, s) < 0.8 else 26)


NASS = {30: 28, 29: 27, 28: 26, 27: 25, 26: 25, 25: 10, 15: 13, 14: 12, 13: 11, 12: 10, 11: 10, 9: 7, 8: 6, 7: 5, 6: 4, 5: 4, 20: 18, 19: 17, 18: 17}


def nass_machen(b, y0, y1, seed, alge=0.06):
    """einheitlich abdunkeln (Farbzuordnung), Kalkrand oben, vereinzelt Algen, Tropfspuren"""
    for y in range(y0, y1 + 1):
        for x in range(b.w):
            q = b.get(x, y)
            if q is None or q == OUT:
                continue
            b.set(x, y, NASS.get(q, q))
            if h3(x, y, seed) < alge:
                b.set(x, y, 17 if h3(x, y, seed + 1) < 0.6 else 22)
    for x in range(b.w):
        if b.get(x, y0) not in (None, OUT) and h3(x, y0, seed + 2) < 0.75:
            b.set(x, y0, 7 if h3(x, 0, seed) < 0.5 else 6)
    for x in range(3, b.w - 3, 6):
        ln = 1 + int(4 * h3(x, 1, seed + 3))
        for d in range(ln):
            if b.get(x, y0 - 1 - d) not in (None, OUT):
                b.set(x, y0 - 1 - d, 22 if d < ln - 1 else 23)


def regalreihe(b, y0, seed, nass_ab=None):
    """eine Regalreihe: schmale Oberkante (8px) mit Bündeln, Front 40px mit drei Böden und Aktenrücken"""
    top0, front0, front1 = y0, y0 + 8, y0 + 47
    b.rechteck(0, top0, 79, front0 - 1, HOLZ, 0.55, 0.3, licht=0.5, s=seed)
    for x in range(80):
        b.set(x, front0 - 1, 25)
    for i, (x0, w) in enumerate([(3, 11), (17, 8), (31, 12), (49, 9), (62, 13)]):
        if h3(i, 0, seed) < 0.8:
            buendel(b, x0, top0 + 1, w, 5, seed + 10 + i)
    b.rechteck(0, front0, 79, front1, [1, 10, 25], 0.35, 0.3, s=seed + 2)
    boeden = [front0, front0 + 13, front0 + 26, front1]
    for yb in boeden:
        for x in range(80):
            b.ton(x, yb, HOLZ, 0.8, 0.2, seed + 3)
            if yb + 1 <= front1:
                b.ton(x, yb + 1, HOLZ, 0.45, 0.2, seed + 3)
    for i in range(3):
        ya, yz = boeden[i] + 2, boeden[i + 1] - 1
        x, k = 3, 0
        while x < 76:
            w = 2 + int(2 * h3(x, i, seed))
            ramp = RUECKEN[int(h3(x, i + 5, seed) * len(RUECKEN))]
            top = ya + int(3 * h3(x, i + 9, seed))
            if h3(x, i + 13, seed) < 0.08:
                x += w + 1
                continue
            schraeg = h3(x, i + 17, seed) < 0.06  # umgekipptes Buch
            for xx in range(x, min(76, x + w)):
                for y in range(top + (xx - x if schraeg else 0), yz + 1):
                    b.ton(xx, y, ramp, 0.64 - 0.5 * (xx - x) / max(1, w), 0.25, seed + 20 + k)
            if yz - top > 6 and h3(x, 4, seed) < 0.5:
                b.set(x, top + 3, 8 if h3(x, 3, seed) < 0.5 else 15)
            k += 1
            x += w + (1 if h3(x, 2, seed) < 0.3 else 0)
    for x in (0, 1, 2, 38, 39, 40, 41, 77, 78, 79):
        for y in range(front0, front1 + 1):
            b.ton(x, y, HOLZ, 0.7 if x in (0, 38, 77) else 0.35, 0.2, seed + 4)
    for yy in (boeden[0] + 4, boeden[1] + 4, boeden[2] + 4):
        b.rechteck(38, yy, 41, yy + 2, MESSING, 0.7, 0.2)
        b.set(39, yy + 1, 25)
    if nass_ab is not None:
        nass_machen(b, front0 + nass_ab, front1, seed + 50)


def registerregal_frame(nass, seed):
    b = Bild(80, 96, seed=seed)
    regalreihe(b, 0, seed, nass_ab=34 if not nass else 22)          # hintere Reihe
    for x in range(80):                                              # Gangfuge zwischen den Reihen
        b.set(x, 48, 0)
    regalreihe(b, 49 - 1, seed + 100, nass_ab=36 if not nass else 18)  # vordere Reihe (endet bei 95)
    for x in range(80):  # der Block füllt die Zelle: Umriss als Rand
        b.set(x, 0, OUT); b.set(x, 95, OUT)
    for y in range(96):
        b.set(0, y, OUT); b.set(79, y, OUT)
    return b


def registerregal():
    return [registerregal_frame(False, 71), registerregal_frame(True, 72)]


# 9 -- Registerschrank: Karteischrank mit vielen Schüben, ein Schub offen, Register-Buch oben (64x80) -------------------
def registerschrank():
    b = Bild(64, 80, seed=81)
    # Deckplatte von oben mit Buch und Tintenfass
    b.rechteck(0, 0, 63, 21, HOLZ, 0.5, 0.3, licht=0.6, s=1)
    for y in range(0, 22, 6):
        for x in range(64):
            if h3(x, y, 2) < 0.8:
                b.set(x, y, 25)
    b.rechteck(14, 4, 45, 16, [21, 22, 23], 0.4, 0.25, licht=0.5, s=3)       # Einband
    b.rechteck(16, 5, 29, 15, PAPIER, 0.7, 0.25, licht=0.4, s=4)             # linke Seite
    b.rechteck(31, 5, 43, 15, PAPIER, 0.6, 0.25, licht=0.4, s=5)             # rechte Seite
    for x in range(16, 44):
        b.set(30, x - 11 if 5 <= x - 11 <= 15 else 5, 22)
    for y in range(6, 15, 2):  # Zeilen (keine Schrift, nur Striche)
        for x in range(17, 29):
            if h3(x, y, 6) < 0.7:
                b.set(x, y, 12)
        for x in range(32, 43):
            if h3(x, y, 7) < 0.6:
                b.set(x, y, 12)
    b.set(36, 12, TUERKIS); b.set(37, 12, TUERKIS)                          # die eine Zeile, die leuchtet
    b.rechteck(50, 7, 54, 11, [1, 2, 3], 0.4, 0.2)                           # Tintenfass
    b.set(51, 8, 5)
    for i in range(6):
        b.set(55 + i // 2, 6 - i // 2, 9)                                    # Feder
    # Front mit 4x7 Schüben
    b.rechteck(0, 22, 63, 79, [1, 10, 25, 26], 0.45, 0.25, s=8)
    for x in range(64):
        b.ton(x, 22, HOLZ, 0.85, 0.15, 9)
        b.ton(x, 23, HOLZ, 0.5, 0.15, 9)
    cols, rows = 4, 7
    for c in range(cols):
        for r in range(rows):
            x0, y0 = 2 + c * 15, 25 + r * 7
            offen = (c, r) == (2, 3)
            b.rechteck(x0, y0, x0 + 13, y0 + 5, HOLZ, 0.54 - 0.03 * r, 0.25, licht=0.4, s=10 + c * 7 + r)
            for x in range(x0, x0 + 14):
                b.set(x, y0 + 5, 10)
            b.set(x0 + 13, y0 + 2, 10)
            b.rechteck(x0 + 5, y0 + 1, x0 + 8, y0 + 2, MESSING, 0.75, 0.15)   # Etikettrahmen
            b.set(x0 + 6, y0 + 2, 9); b.set(x0 + 7, y0 + 2, 9)
            b.set(x0 + 6, y0 + 4, 12); b.set(x0 + 7, y0 + 4, 13)              # Griff
            if offen:
                b.rechteck(x0 - 1, y0 + 4, x0 + 14, y0 + 8, HOLZ, 0.7, 0.2, s=99)
                for x in range(x0 + 1, x0 + 13, 2):
                    b.set(x, y0 + 3, 9); b.set(x, y0 + 2, 8)
                b.set(x0 + 7, y0 + 1, TUERKIS)
    nass_machen(b, 73, 79, 40)
    # eiserne Eckbeschläge
    for (x, y) in ((0, 22), (60, 22), (0, 76), (60, 76)):
        b.rechteck(x, y, x + 3, y + 3, EISEN, 0.55, 0.2)
    for x in range(64):  # der Schrank füllt die Zelle: Umriss als Rand
        b.set(x, 0, OUT); b.set(x, 79, OUT)
    for y in range(80):
        b.set(0, y, OUT); b.set(63, y, OUT)
    return b


# 10 -- Nebelschwaden: drei Schwaden aus gerastertem Nebel (64x32), ohne Umriss, im Spiel halbtransparent ----------------
def nebelschwaden():
    import math
    frames = []
    for var in range(3):
        b = Bild(64, 32, seed=91 + var)
        blobs = [(18 + var * 4, 18, 16, 6), (36, 14 - var, 18, 7), (50 - var * 3, 19, 12, 5), (28, 22, 20, 4)]
        for y in range(32):
            for x in range(64):
                d = 0
                for (cx, cy, rx, ry) in blobs:
                    dx, dy = (x - cx) / rx, (y - cy) / ry
                    d = max(d, 1 - (dx * dx + dy * dy))
                d += 0.12 * math.sin(x * 0.35 + var) * math.sin(y * 0.7)
                if d <= 0:
                    continue
                # Raster: dichter Kern, lockerer Rand (Bayer 4x4)
                bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]][y % 4][x % 4] / 16
                if d * 1.6 > bayer + 0.05:
                    b.set(x, y, 8 if d > 0.55 else 7 if d > 0.3 else 6)
        frames.append(b)
    return frames


def alle():
    return {
        'vmk_pegelzaun': (pegelzaun(), (16, 32)),
        'vmk_zolltor': ([zolltor()], (96, 48)),
        'vmk_leuchtturm_fuss': ([leuchtturm_fuss()], (96, 80)),
        'vmk_wrackrumpf': ([wrackrumpf()], (80, 64)),
        'vmk_wrackrumpf_lang': ([wrackrumpf_lang()], (112, 64)),
        'vmk_wrackheck': ([wrackheck()], (64, 64)),
        'vmk_wrackmutter_rumpf': ([wrackmutter_rumpf()], (128, 128)),
        'vmk_registerregal': (registerregal(), (80, 96)),
        'vmk_registerschrank': ([registerschrank()], (64, 80)),
        'vmk_nebelschwaden': (nebelschwaden(), (64, 32)),
    }


ZWECK = {
    'vmk_pegelzaun': ('Zaunfeld aus Pegelstangen, kachelt waagerecht; Frames: normal, Tau, gebrochen, Zollmarke', 'vm_grenzzaun'),
    'vmk_zolltor': ('Grenztor mit Pegelpfosten, blindem Zollschild und zwei Laternen', 'vm_grenzzaun'),
    'vmk_leuchtturm_fuss': ('Felsnase mit Rundsockel und Treppe; der CV-Turm vm_fassaden/leuchtfeuer_turm_tag steht darauf', 'vm_leuchtbank'),
    'vmk_wrackrumpf': ('offener Wrackrumpf 5x3 Felder, Spanten frei', 'vm_wrackfeld'),
    'vmk_wrackrumpf_lang': ('langer Wrackrumpf 7x3 Felder mit umgestürztem Mast', 'vm_wrackfeld'),
    'vmk_wrackheck': ('abgebrochenes Heck mit Ruder, halb im Schlick, 4x3 Felder', 'vm_wrackfeld'),
    'vmk_wrackmutter_rumpf': ('Rumpf der Wrackmutter mit Maststumpf, Netzen und Leck zum Kielraum, 8x7 Felder', 'vm_wrackfeld'),
    'vmk_registerregal': ('zwei Regalreihen mit Akten 5x6 Felder; Frame 0 Wasserlinie unten, Frame 1 nass bis zur Mitte', 'vm_registerkeller'),
    'vmk_registerschrank': ('Karteischrank des Registers mit offenem Schub und Registerbuch, 4x5 Felder', 'vm_registerkeller'),
    'vmk_nebelschwaden': ('drei gerasterte Nebelschwaden ohne Umriss, im Spiel mit alpha 0.3-0.35', 'vm_grenzzaun, vm_leuchtbank, vm_wrackfeld'),
}


def pruefe(name, im, fw, fh):
    """Palette, binäres Alpha, Rastergröße, belegte Frames, Umriss vorhanden (außer Nebel)"""
    pal = set(PAL)
    assert im.width % fw == 0 and im.height == fh, name
    farben = set()
    px_all = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
    for px in px_all:
        assert px[3] in (0, 255), f'{name}: Alpha {px[3]}'
        if px[3]:
            assert px[:3] in pal, f'{name}: Farbe {px[:3]}'
            farben.add(px[:3])
    for f in range(im.width // fw):
        assert im.crop((f * fw, 0, f * fw + fw, fh)).getbbox(), f'{name}: leerer Frame {f}'
    if name != 'vmk_nebelschwaden':
        assert PAL[OUT] in farben, f'{name}: kein Umriss'
    return len(farben)


if __name__ == '__main__':
    import hashlib
    os.makedirs(OUTDIR, exist_ok=True)
    assets = []
    for name, (frames, (fw, fh)) in alle().items():
        im = streifen(frames)
        path = os.path.join(OUTDIR, name + '.png')
        im.save(path)
        n = pruefe(name, im, fw, fh)
        assets.append({'id': name, 'file': f'props/{name}.png', 'kind': 'prop', 'width': im.width, 'height': im.height, 'frameWidth': fw, 'frameHeight': fh,
                       'frames': len(frames), 'colors': n, 'zweck': ZWECK[name][0], 'karten': ZWECK[name][1],
                       'sha256': hashlib.sha256(open(path, 'rb').read()).hexdigest()})
        print(name, len(frames), f'{n} Farben')
    man = {'version': 1, 'batch': 'vm-kulissen-runde1', 'city': 'varrowmouth', 'status': 'eingebaut (src/data/varrowmouthKulisse.js)',
           'erzeugt': 'python3 tools/art/vm_kulissen/assets.py (Pillow, pixelweise, deterministisch)',
           'palette': 'manifest-varrowmouth1.json (32 Farben; docs/art/palette.hex gibt es nicht)', 'alpha': 'binär', 'origin': 'unten mittig',
           'assets': assets}
    with open(os.path.join(ROOT, 'public', 'sprites', 'manifest-vm-kulissen.json'), 'w', encoding='utf-8') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
