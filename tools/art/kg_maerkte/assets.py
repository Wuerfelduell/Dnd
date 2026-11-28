"""Zehn Requisiten für Altmarkt und Nachtmarkt in Kettlegate (python3 tools/art/kg_maerkte/assets.py).
-> public/sprites/props/kgm_*.png, manifest-kg-maerkte.json. Palette: manifest-kettlegate-leben.json (31 Farben), Farben über Hexwerte."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import pinsel
from pinsel import Bild, h3, ROOT

PAL = pinsel.palette_aus('manifest-kettlegate-leben.json')
HEX = ['#%02x%02x%02x' % c for c in PAL]
C = lambda h: HEX.index(h)
R = lambda *hs: [C(h) for h in hs]
OUT = C('#1a1c2c')
BLAU = R('#292d3e', '#333b4a', '#445265', '#566877', '#71828a', '#93a2a5', '#bec6bd', '#ded8bf')
HOLZ = R('#493e36', '#66513e', '#846f52', '#a89776')
HOLZ_ROT = R('#493e36', '#72524e', '#965c46', '#b57d4d')
GOLD = R('#b57d4d', '#d5a45b', '#edc878', '#f1dfa5')
GRUEN = R('#3b453b', '#58634b', '#788164', '#9ca383')
LILA = R('#44414e', '#62576c', '#84768c')
GRAU = R('#53585b', '#71828a', '#93a2a5', '#b7b5a4')
CREME = C('#ded8bf')
HELL = C('#f1dfa5')
ROT = C('#965c46')
TAN = R('#9b7657', '#bc967b', '#d3b18c')


def glow(b, cx, cy, r, ramp, dichte=1.0):
    bay = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    for y in range(int(cy - r), int(cy + r + 1)):
        for x in range(int(cx - r), int(cx + r + 1)):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r
            if d <= 1 and (1 - d) * dichte * 1.4 > bay[y % 4][x % 4] / 16 and 0 <= x < b.w and 0 <= y < b.h:
                b.set(x, y, ramp[min(len(ramp) - 1, int((1 - d) * len(ramp)))])


def kasten(b, x0, y0, w, top, front, rt=None, rf=None, s=0):
    rt, rf = rt or [HOLZ[1], HOLZ[2], HOLZ[3], TAN[1]], rf or HOLZ
    b.rechteck(x0, y0, x0 + w - 1, y0 + top - 1, rt, 0.6, 0.25, licht=0.6, s=s)
    b.rechteck(x0, y0 + top, x0 + w - 1, y0 + top + front - 1, rf, 0.5, 0.25, licht=0.5, s=s + 1)
    for x in range(x0, x0 + w):
        b.set(x, y0 + top, rf[0])


def markise(b, x0, x1, y0, y1, farbe=ROT, s=0):
    """gestreiftes Sonnendach mit Wellenkante"""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            streif = ((x - x0) // 4) % 2 == 0
            v = 0.7 - 0.3 * (y - y0) / max(1, y1 - y0)
            b.set(x, y, (farbe if streif else CREME) if v > 0.5 else (HOLZ_ROT[1] if streif else BLAU[6]))
    for x in range(x0, x1 + 1):
        if (x - x0) % 4 in (1, 2):
            b.set(x, y1 + 1, farbe if ((x - x0) // 4) % 2 == 0 else CREME)


def pfosten(b, x, y0, y1):
    for y in range(y0, y1 + 1):
        b.set(x, y, HOLZ[2]); b.set(x + 1, y, HOLZ[0])


def raeder(b, xs, y, r=3):
    for x in xs:
        b.ellipse(x, y, r, r, R('#292d3e', '#333b4a', '#445265'))
        b.ellipse(x, y, max(1, r - 2), max(1, r - 2), HOLZ)
        b.set(x, y, GRAU[2])


# --- Altmarkt -------------------------------------------------------------------------------------------------------------------
def fisch(b, x0, y0, rampe, links=True):
    """7x3: Kopf mit Auge, Leib, Schwanzflosse gegabelt"""
    rueck, mitte, bauch = rampe
    pix = {(1, 0): rueck, (2, 0): rueck, (3, 0): rueck, (4, 0): rueck, (6, 0): rueck,
           (0, 1): mitte, (1, 1): OUT, (2, 1): bauch, (3, 1): bauch, (4, 1): bauch, (5, 1): mitte,
           (1, 2): mitte, (2, 2): mitte, (3, 2): mitte, (4, 2): mitte, (6, 2): rueck}
    for (dx, dy), c in pix.items():
        b.set(x0 + (dx if links else 6 - dx), y0 + dy, c)


def fischstand():
    b = Bild(32, 32, seed=501)
    pfosten(b, 2, 5, 29); pfosten(b, 28, 5, 29)
    markise(b, 1, 30, 1, 6, farbe=C('#445265'))
    kasten(b, 2, 18, 28, 4, 8, s=1)
    for x in range(3, 29):                                            # Eisbett, ruhig
        for y in range(15, 21):
            v = h3(x, y, 3)
            b.set(x, y, BLAU[7] if v < 0.8 else BLAU[6])
    for x in range(3, 29):
        b.set(x, 21, BLAU[5])
    silber = (BLAU[3], GRAU[1], GRAU[2])
    rot = (HOLZ_ROT[1], HOLZ_ROT[2], C('#b57d4d'))
    for (x, y, lk, r) in ((4, 15, True, silber), (12, 16, False, silber), (20, 15, True, rot), (6, 18, False, silber), (15, 18, True, silber), (22, 18, False, silber)):
        fisch(b, x, y, r, lk)
    for x in range(5, 22):                                            # Stange, Heringe am Schwanz aufgehängt
        b.set(x, 8, HOLZ[1])
    for x in (6, 11, 16):
        b.set(x + 1, 9, TAN[0])
        for dy, row in enumerate(('r.r', '.m.', 'mbm', 'mbm', 'mbm', 'mOm', '.m.')):
            for dx, ch in enumerate(row):
                if ch != '.':
                    b.set(x + dx, 10 + dy, {'m': GRAU[2], 'O': OUT, 'b': BLAU[7], 'r': GRAU[1]}[ch])
    b.rechteck(22, 9, 27, 13, R('#292d3e', '#333b4a'), 0.5, 0.1)        # Kreidetafel mit Preis
    for x in (23, 25, 26):
        b.set(x, 11, CREME)
    b.set(24, 10, CREME)
    b.umriss(OUT)
    return b


def blumenkarren():
    b = Bild(32, 24, seed=502)
    kasten(b, 3, 9, 22, 3, 6, s=1)
    raeder(b, (9, 20), 19)
    for t in range(6):
        b.set(25 + t // 2, 13 - t // 2, HOLZ[2])
    farben = [ROT, GOLD[2], LILA[2], CREME, C('#b57d4d'), LILA[1]]
    for i in range(12):                                               # Sträuße
        x = 5 + (i * 13) % 19
        y = 3 + (i * 7) % 5
        for t in range(3):
            b.set(x, y + 2 + t, GRUEN[1])
        b.ellipse(x, y + 1, 1.6, 1.4, [farben[i % 6], farben[i % 6]])
    for x in range(4, 25):
        b.set(x, 9, GRUEN[2] if x % 2 else GRUEN[1])
    b.umriss(OUT)
    return b


def kaesestand():
    b = Bild(32, 32, seed=503)
    pfosten(b, 27, 1, 15)
    for x in range(17, 29):                                           # Stange mit Würsten
        b.set(x, 2, HOLZ[1])
    for x in (18, 21, 24):
        b.set(x, 3, TAN[0])
        for y in range(4, 10):
            b.set(x, y, HOLZ_ROT[2] if y < 9 else HOLZ_ROT[1]); b.set(x + 1, y, HOLZ_ROT[1])
        b.set(x + 1, 4, HOLZ_ROT[0]); b.leer(x + 1, 9)
    kasten(b, 2, 15, 28, 5, 8, s=1)
    for x in (3, 27):
        b.rechteck(x, 28, x + 1, 31, HOLZ, 0.3, 0)

    def laib(cx, ytop, rx, hoehe, seite, oben):
        """Laib: Seite mit Rinde (Kante dunkel), Oberseite als flache Ellipse"""
        for x in range(cx - rx, cx + rx):
            for y in range(ytop + 1, ytop + 1 + hoehe):
                b.set(x, y, seite[0] if (y == ytop + hoehe or x in (cx - rx, cx + rx - 1)) else seite[1])
            b.set(x, ytop + 1, seite[2])
        for x in range(cx - rx + 1, cx + rx - 1):
            b.set(x, ytop, oben[1]); b.set(x, ytop - 1, oben[0] if x in (cx - rx + 1, cx + rx - 2) else oben[1])
        for x in range(cx - rx + 2, cx + rx - 2):
            b.set(x, ytop - 1, oben[2])

    gelb_s, gelb_o = [GOLD[0], GOLD[1], GOLD[2]], [GOLD[1], GOLD[2], GOLD[3]]
    rot_s, rot_o = [HOLZ_ROT[1], ROT, C('#b57d4d')], [ROT, C('#b57d4d'), GOLD[1]]
    laib(7, 15, 5, 3, gelb_s, gelb_o)
    laib(7, 11, 4, 3, gelb_s, gelb_o)
    laib(16, 15, 4, 3, rot_s, rot_o)
    for x in range(21, 28):                                           # Keil: Schnittfläche nach vorn, Löcher
        top = 16 - (x - 21) * 4 // 6
        for y in range(top, 19):
            b.set(x, y, HELL if (x * 3 + y) % 7 else GOLD[2])
        b.set(x, top, GOLD[0])
    b.rechteck(3, 20, 7, 21, [CREME, HELL], 0.6, 0)                   # Preiskärtchen
    b.umriss(OUT)
    return b


def gefluegel():
    b = Bild(32, 32, seed=504)
    for k, (x0, y0) in enumerate(((1, 18), (16, 18), (8, 6))):        # drei gestapelte Lattenkisten, vorn offen
        w, h = 15, 12
        b.rechteck(x0 + 1, y0 + 2, x0 + w - 2, y0 + h - 3, R('#292d3e', '#333b4a'), 0.4, 0.2, s=k)
        for x in range(x0 + 1, x0 + w - 1):                           # Stroh am Boden
            b.set(x, y0 + h - 3, GOLD[0] if h3(x, k, 4) < 0.5 else GOLD[1])
            if h3(x, k, 5) < 0.35:
                b.set(x, y0 + h - 4, GOLD[1])
        weiss = k != 1
        haut = [BLAU[6], CREME, HELL] if weiss else [HOLZ_ROT[1], HOLZ_ROT[2], HOLZ_ROT[3]]
        hx, hy = x0 + 8, y0 + 6                                       # Huhn im Profil, Kopf links
        b.ellipse(hx, hy + 0.5, 3.6, 2.4, haut, vfn=lambda x, y: 0.75 - 0.08 * (y - hy) - 0.03 * (x - hx), korn=0.05)
        for (dx, dy) in ((3, -2), (4, -3), (4, -2), (3, -1)):          # Schwanz hoch
            b.set(hx + dx, hy + dy, haut[0] if weiss else HOLZ_ROT[1])
        for (dx, dy) in ((-4, -2), (-3, -2), (-4, -1), (-3, -1)):      # Kopf
            b.set(hx + dx, hy + dy, haut[2])
        for (dx, dy) in ((0, 1), (1, 1), (2, 0)):                      # Flügel
            b.set(hx + dx, hy + dy, haut[0])
        b.set(hx - 4, hy - 3, ROT); b.set(hx - 3, hy - 3, C('#b57d4d'))   # Kamm
        b.set(hx - 5, hy - 1, GOLD[1])                                # Schnabel
        b.set(hx - 4, hy, ROT)                                        # Kehllappen
        b.set(hx - 3, hy - 2, OUT)                                    # Auge
        b.set(hx - 1, hy + 3, GOLD[1]); b.set(hx + 1, hy + 3, GOLD[1])    # Füße
        b.rechteck(x0, y0, x0 + w - 1, y0 + 1, HOLZ, 0.7, 0.15, s=k)  # Rahmen
        b.rechteck(x0, y0 + h - 2, x0 + w - 1, y0 + h - 1, HOLZ, 0.45, 0.15, s=k + 3)
        for y in range(y0, y0 + h):
            b.set(x0, y, HOLZ[2]); b.set(x0 + w - 1, y, HOLZ[1])
        for x in (x0 + 7, x0 + 11):                                   # zwei Latten vor dem Huhn, Kopf frei
            for y in range(y0 + 2, y0 + h - 2):
                b.set(x, y, HOLZ[2])
        for x in range(x0 + 1, x0 + w - 1):
            b.set(x, y0, HOLZ[3] if x % 3 else HOLZ[2])
    for (x, y) in ((5, 31), (21, 31), (13, 31)):                      # Federn
        b.set(x, y, CREME)
    b.umriss(OUT)
    return b


def gewuerzstand():
    b = Bild(32, 32, seed=505)
    pfosten(b, 2, 5, 29); pfosten(b, 28, 5, 29)
    markise(b, 1, 30, 1, 6, farbe=C('#62576c'))
    kasten(b, 2, 20, 28, 3, 7, s=1)
    farben = [R('#965c46', '#b57d4d', '#d5a45b'), R('#d5a45b', '#edc878', '#f1dfa5'), R('#58634b', '#788164', '#9ca383'), R('#72524e', '#965c46', '#b57d4d')]
    for i in range(4):                                                # offene Säcke mit Gewürzhaufen
        x0 = 4 + i * 6
        b.rechteck(x0, 15, x0 + 4, 21, TAN, 0.55, 0.2, licht=0.5, s=i)
        b.ellipse(x0 + 2, 15, 2.6, 1.6, farben[i])
    for x in (7, 13, 19, 25):                                         # Kräuterbündel unter dem Dach
        for y in range(8, 12):
            b.set(x, y, GRUEN[2] if y < 11 else GRUEN[1])
    b.umriss(OUT)
    return b


def zeitungsstaender():
    b = Bild(16, 32, seed=506)
    b.rechteck(2, 6, 13, 29, HOLZ_ROT, 0.55, 0.2, licht=0.6)
    for y in (12, 19, 26):                                            # Fächer mit Zeitungen
        b.rechteck(3, y - 4, 12, y, [BLAU[6], CREME, HELL], 0.65, 0.2)
        for x in range(4, 12):
            if h3(x, y, 1) < 0.5:
                b.set(x, y - 3, BLAU[2])
        b.set(5, y - 2, OUT); b.set(6, y - 2, OUT)
        for x in range(2, 14):
            b.set(x, y + 1, HOLZ_ROT[0])
    b.rechteck(1, 2, 14, 5, [HOLZ_ROT[1], ROT, CREME], 0.6, 0.1)       # Schild (ohne Schrift)
    for x in range(3, 13, 2):
        b.set(x, 3, HELL)
    b.umriss(OUT)
    return b


# --- Nachtmarkt -----------------------------------------------------------------------------------------------------------------
def amulettgestell():
    b = Bild(32, 48, seed=507)
    pfosten(b, 3, 4, 46); pfosten(b, 27, 4, 46)
    for x in range(2, 30):
        b.set(x, 4, HOLZ[2]); b.set(x, 5, HOLZ[0])
    for i in range(7):                                                # Schnüre mit Amuletten
        x = 6 + i * 3
        ln = 10 + (i * 5) % 14
        for y in range(6, 6 + ln):
            b.set(x, y, TAN[1] if y % 2 else HOLZ[3])
        kind = i % 3
        if kind == 0:
            b.ellipse(x, 7 + ln, 1.6, 1.6, GOLD)
        elif kind == 1:
            b.rechteck(x - 1, 6 + ln, x + 1, 8 + ln, LILA, 0.6, 0)
            b.set(x, 7 + ln, C('#bec6bd'))
        else:
            b.set(x, 6 + ln, CREME); b.set(x - 1, 7 + ln, CREME); b.set(x + 1, 7 + ln, CREME); b.set(x, 8 + ln, CREME)
    b.rechteck(6, 38, 25, 41, HOLZ_ROT, 0.5, 0.2)                     # Ablage mit Schädelchen und Kerze
    b.ellipse(10, 36, 2, 2, [BLAU[6], CREME])
    b.set(9, 36, OUT); b.set(11, 36, OUT)
    b.rechteck(20, 33, 21, 37, [CREME, HELL], 0.6, 0); b.set(20, 32, GOLD[3])
    b.umriss(OUT)
    glow(b, 20.5, 31, 5, R('#d5a45b', '#edc878', '#f1dfa5'), 0.35)
    return b


def maskenstaender():
    """Stecktafel mit Halbmasken (Augenlöcher, Bänder)"""
    b = Bild(24, 40, seed=508)
    b.rechteck(2, 2, 21, 30, HOLZ, 0.45, 0.2, licht=0.5)
    for y in range(4, 30, 3):                                         # Löcher der Stecktafel
        for x in range(4, 21, 3):
            b.set(x, y, HOLZ[0])
    pfosten(b, 5, 30, 38); pfosten(b, 17, 30, 38)
    farben = [[BLAU[6], CREME, HELL], [HOLZ_ROT[1], ROT, C('#b57d4d')], [LILA[0], LILA[1], LILA[2]], [GOLD[0], GOLD[1], GOLD[2]], [BLAU[2], BLAU[4], BLAU[6]], [GRUEN[1], GRUEN[2], GRUEN[3]]]
    for i in range(6):                                                # Halbmasken 7x4 mit zwei Augenlöchern
        x0, y0 = 4 + (i % 2) * 9, 5 + (i // 2) * 8
        b.rechteck(x0, y0, x0 + 6, y0 + 3, farben[i], 0.6, 0.1, licht=0.6)
        b.leer(x0, y0 + 3); b.leer(x0 + 6, y0 + 3); b.set(x0 + 3, y0 + 3, farben[i][0])
        b.set(x0 + 1, y0 + 1, OUT); b.set(x0 + 2, y0 + 1, OUT); b.set(x0 + 4, y0 + 1, OUT); b.set(x0 + 5, y0 + 1, OUT)
        b.set(x0 - 1, y0 + 1, farben[i][2]); b.set(x0 + 7, y0 + 1, farben[i][2])   # Bänder
    for t in range(6):                                                # Federschmuck oben
        b.set(18 + t // 3, 3 - t // 2, LILA[2] if t % 2 else CREME)
    b.umriss(OUT)
    return b


def schmugglerkarren():
    b = Bild(48, 32, seed=509)
    raeder(b, (11, 36), 26, 4)
    b.rechteck(3, 18, 44, 23, HOLZ, 0.5, 0.2, licht=0.5)             # Wagenkasten
    b.poly([(4, 18), (43, 18), (39, 6), (9, 6)], R('#3b453b', '#58634b', '#788164'), vfn=lambda x, y: 0.7 - 0.01 * x)   # Plane
    for x in range(10, 40, 7):                                        # Seile
        for y in range(7, 18):
            b.set(x + (y - 7) // 4, y, TAN[0])
    for (x, y) in ((14, 14), (26, 12), (33, 15)):                     # Umrisse darunter
        b.set(x, y, GRUEN[0]); b.set(x + 1, y, GRUEN[0])
    b.rechteck(36, 14, 42, 18, HOLZ_ROT, 0.55, 0.1)                   # Fass schaut heraus
    for y in (15, 17):
        for x in range(36, 43):
            b.set(x, y, GRAU[0])
    for t in range(6):
        b.set(1 + t // 2, 20 - t // 3, HOLZ[2])
    b.umriss(OUT)
    return b


def kerzenstand():
    b = Bild(32, 32, seed=510)
    kasten(b, 2, 16, 28, 5, 8, rt=[HOLZ_ROT[1], HOLZ_ROT[2], HOLZ_ROT[3], TAN[1]], rf=HOLZ_ROT, s=1)
    for x in (3, 27):
        b.rechteck(x, 29, x + 1, 31, HOLZ, 0.3, 0)
    for x in (6, 11, 17, 24):                                         # Wachsnasen an der Kante
        for y in range(21, 21 + 1 + (x % 3)):
            b.set(x, y, CREME)
    kerzen = [(4, 6, 0), (7, 10, 1), (10, 4, 2), (13, 12, 0), (16, 7, 1), (19, 5, 0), (22, 9, 2), (25, 6, 1)]
    wachs = [[BLAU[6], CREME, HELL], [TAN[0], TAN[1], TAN[2]], [LILA[0], LILA[1], LILA[2]]]
    flammen = []
    for x, hh, f in kerzen:                                           # Kerzen auf Messingtellern
        fuss = 18 + (x % 2)
        for xx in range(x - 1, x + 3):
            b.set(xx, fuss, GOLD[0] if xx in (x - 1, x + 2) else GOLD[1])
        for y in range(fuss - hh, fuss):
            b.set(x, y, wachs[f][2] if y > fuss - hh else wachs[f][2]); b.set(x + 1, y, wachs[f][0] if y > fuss - hh else wachs[f][1])
        b.set(x + (x % 2), fuss - hh + 1, wachs[f][1])
        flammen.append((x, fuss - hh))
    b.umriss(OUT)
    for x, top in flammen:                                            # Flammen ohne Umriss, Docht dunkel
        b.set(x, top - 1, HOLZ[0])
        b.set(x, top - 2, HELL); b.set(x, top - 3, GOLD[2]); b.set(x + (1 if x % 2 else 0), top - 4, GOLD[1])
        b.set(x + 1, top - 2, GOLD[2])
    return b


ALLE = {
    'kgm_fischstand': (fischstand, 'Fischstand mit Eis, Heringen und Preisschild', 'altmarkt'),
    'kgm_blumenkarren': (blumenkarren, 'Blumenkarren voller Sträuße', 'altmarkt'),
    'kgm_kaesestand': (kaesestand, 'Käsestand mit Laiben, Anschnitt und Würsten', 'altmarkt'),
    'kgm_gefluegel': (gefluegel, 'gestapelte Geflügelkäfige mit Hühnern', 'altmarkt'),
    'kgm_gewuerzstand': (gewuerzstand, 'Gewürzstand mit offenen Säcken und Kräuterbündeln', 'altmarkt'),
    'kgm_zeitungsstaender': (zeitungsstaender, 'Zeitungsständer mit Schild', 'altmarkt'),
    'kgm_amulettgestell': (amulettgestell, 'Gestell mit Amuletten an Schnüren, Kerze', 'nachtmarkt'),
    'kgm_maskenstaender': (maskenstaender, 'Stecktafel mit sechs Halbmasken', 'nachtmarkt'),
    'kgm_schmugglerkarren': (schmugglerkarren, 'Karren unter Plane, ein Fass schaut heraus', 'nachtmarkt'),
    'kgm_kerzenstand': (kerzenstand, 'Kerzenstand mit brennenden Kerzen', 'nachtmarkt'),
}

if __name__ == '__main__':
    od = os.path.join(ROOT, 'public', 'sprites', 'props')
    pal = set(PAL)
    assets = []
    for name, (fn, zweck, orte) in ALLE.items():
        im = fn().image()
        data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
        assert all(px[3] in (0, 255) and (px[3] == 0 or px[:3] in pal) for px in data), name
        p = os.path.join(od, name + '.png')
        im.save(p)
        assets.append({'id': name, 'file': f'props/{name}.png', 'width': im.width, 'height': im.height, 'zweck': zweck, 'orte': orte, 'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()})
        print(name, im.size)
    json.dump({'version': 1, 'batch': 'kg-maerkte', 'palette': 'manifest-kettlegate-leben.json', 'erzeugt': 'python3 tools/art/kg_maerkte/assets.py', 'origin': 'unten mittig',
               'assets': assets}, open(os.path.join(ROOT, 'public', 'sprites', 'manifest-kg-maerkte.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
