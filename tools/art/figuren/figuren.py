"""Eigene Laufblätter (16x32, 4 Richtungen x 4 Schritte wie die NPC-Blätter) für zehn Figuren mit Leihbild.
python3 tools/art/figuren/figuren.py -> public/sprites/characters/fig_<id>_walk.png, public/sprites/manifest-figuren-eigen.json
Aufbau: handgezeichnete Silhouetten-Schablonen je Richtung (Stand, Schritt), Buchstaben = Körperteile; Kleidung, Haar, Hut und
Beigaben verändern die Schablone; Farben aus manifest-figuren_nachzuegler.json (32 Farben der späten Stadtfiguren), Licht von links."""
import hashlib, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import pinsel
from pinsel import Bild, h3, ROOT
from PIL import Image

PAL = pinsel.palette_aus('manifest-figuren_nachzuegler.json')
OUT = 29
DIRS = ['down', 'left', 'right', 'up']

# --- Schablonen (rechts = Blick nach rechts; links wird gespiegelt) ------------------------------------------------------------
# h Haar, H Haut, e Auge, n Hals, T Oberteil, A Arm, a Hand, B Gürtel, L Bein (nah), l Bein (fern), S Schuh
KOPF_V = ["................", "................", "......hhhh......", ".....hhhhhh.....", "....hhhhhhhh....", "....hHHHHHHh....",
          "....hHHHHHHh....", "....hHeHHeHh....", "....hHHHHHHh....", ".....HHHHHH.....", "......HHHH......", "......nnnn......"]
KOPF_H = ["................", "................", "......hhhh......", ".....hhhhhh.....", "....hhhhhhhh....", "....hhhhhhhh....",
          "....hhhhhhhh....", "....hhhhhhhh....", "....hhhhhhhh....", ".....hhhhhh.....", "......HHHH......", "......nnnn......"]
KOPF_S = ["................", "................", "......hhhh......", ".....hhhhhh.....", "....hhhhhhhh....", "....hhhHHHHH....",
          "....hhhHHHHH....", "....hhhHHHeH....", "....hhHHHHHHH...", ".....hHHHHHH....", "......HHHHH.....", ".......nnn......"]
RUMPF_V = [".....TTTTTT.....", "....ATTTTTTA....", "...AATTTTTTAA...", "...AATTTTTTAA...", "...AATTTTTTAA...", "...AATTTTTTAA...",
           "...AATTTTTTAA...", "...AATTTTTTAA...", "...aaTTTTTTaa...", "...aaBBBBBBaa..."]
RUMPF_V_S = [".....TTTTTT.....", "....ATTTTTTA....", "...AATTTTTTAA...", "...AATTTTTTAA...", "...AATTTTTTAA...", "...AATTTTTTAA...",
             "...AATTTTTTAA...", "...AATTTTTTaa...", "...AATTTTTTaa...", "...aaBBBBBB....."]
BEINE_V = [".....LLLLLL.....", ".....LL..ll.....", ".....LL..ll.....", ".....LL..ll.....", ".....LL..ll.....", ".....LL..ll.....",
           ".....LL..ll.....", "....SSS..SSS...."]
BEINE_V_S = ["...aaLLLLLL.....", ".....LL..ll.....", ".....LL..ll.....", ".....LL..ll.....", ".....LL..ll.....", ".....LL..ll.....",
             ".....LL..SSS....", "....SSS........."]
RUMPF_S = ["......TTTTT.....", ".....TTTTTTT....", ".....TTAATTT....", ".....TTAATTT....", ".....TTAATTT....", ".....TTAATTT....",
           ".....TTAATTT....", ".....TTAATTT....", ".....TTaaTTT....", "......BBBBB....."]
BEINE_S = ["......LLLLL.....", ".......LLL......", ".......LLL......", ".......LLL......", ".......LLL......", ".......LLL......",
           ".......LLL......", ".......SSSS....."]
RUMPF_S1 = ["......TTTTT.....", ".....TTTTTTT....", ".....TTAATTT....", ".....TTAATTT....", ".....TAATTTT....", ".....TAATTTT....",
            ".....AATTTTT....", "....AATTTTTT....", "....aaTTTTTT....", "....aaBBBBB....."]
BEINE_S1 = ["......LLLLL.....", "......llLLLL....", ".....ll...LL....", ".....ll...LLL...", "....ll.....LL...", "....ll.....LL...",
            "...ll.......LL..", "...SS.......SSS."]
RUMPF_S2 = ["......TTTTT.....", ".....TTTTTTT....", ".....TTTAATT....", ".....TTTAATT....", ".....TTTTAAT....", ".....TTTTAAT....",
            ".....TTTTTAA....", ".....TTTTTTAA...", ".....TTTTTTaa...", "......BBBBBaa..."]
BEINE_S2 = ["......LLLLL.....", "......LLllll....", ".....LL...ll....", ".....LL...lll...", "....LL.....ll...", "....LL.....ll...",
            "...LL.......ll..", "...SS.......SSS."]


def schablone(d, pose):
    """pose 0 Stand, 1 Schritt A, 2 Schritt B"""
    if d == 'down' or d == 'up':
        kopf = KOPF_V if d == 'down' else KOPF_H
        rumpf, beine = (RUMPF_V, BEINE_V) if pose == 0 else (RUMPF_V_S, BEINE_V_S)
        g = kopf + rumpf + beine + ["................", "................"]
        if pose == 2:
            g = [r[::-1] for r in g]
            g = [r.replace('L', '§').replace('l', 'L').replace('§', 'l') for r in g]
    else:
        rumpf, beine = [(RUMPF_S, BEINE_S), (RUMPF_S1, BEINE_S1), (RUMPF_S2, BEINE_S2)][pose]
        g = KOPF_S + rumpf + beine + ["................", "................"]
    g = [list(r) for r in g]
    assert len(g) == 32 and all(len(r) == 16 for r in g), (d, pose, len(g))
    return g


HAUT = [30, 18, 2, 7]
HAAR = {'schwarz': [29, 20, 17], 'braun': [20, 19, 12], 'rot': [20, 27, 12], 'grau': [16, 3, 4], 'blond': [9, 30, 23]}
STOFF = {'navy': [22, 5, 25, 14], 'schiefer': [25, 26, 14, 3], 'gruen': [8, 28, 0, 14], 'braun': [20, 19, 12, 9], 'lila': [20, 21, 14, 3],
         'grau': [10, 16, 3, 4], 'oliv': [8, 15, 24, 4], 'creme': [24, 4, 31], 'beige': [9, 23, 4], 'leder': [20, 19, 12, 30],
         'dunkel': [29, 17, 13, 10], 'rotbraun': [20, 27, 12, 9], 'gruenhut': [8, 28, 0]}


class Figur:
    def __init__(self, oben, unten, art='hose', haar='braun', frisur='kurz', hut=None, schuhe='dunkel', extras=(), schuerze=None, haende=None, breit=False):
        self.f = {'T': STOFF[oben], 'A': STOFF[oben], 'B': STOFF['dunkel'] if oben != 'dunkel' else STOFF['leder'], 'L': STOFF[unten], 'l': STOFF[unten],
                  'K': STOFF[unten], 'k': STOFF[unten], 'h': HAAR[haar], 'H': HAUT, 'n': HAUT, 'a': STOFF[haende] if haende else HAUT,
                  'S': STOFF[schuhe], 'e': [OUT], 'P': STOFF[schuerze] if schuerze else None, 'C': STOFF[oben]}
        self.f['d'] = HAAR[haar]
        self.f['D'] = [HAAR[haar][0], HAAR[haar][0]]
        self.art, self.frisur, self.hut, self.extras, self.breit = art, frisur, hut, extras, breit
        self.hutfarbe = {'muetze': ([10, 16, 3], [29, 10, 16])}.get(hut)
        self.schuerze = schuerze


def setz(g, x, y, c):
    if 0 <= x < 16 and 0 <= y < 32:
        g[y][x] = c


def unterteil(g, fig, d, pose):
    """Rock oder Mantel statt Hose"""
    if fig.art == 'rock':
        for y in range(21, 30):
            for x in range(16):
                if g[y][x] in 'LlSB' or (g[y][x] == 'a' and y >= 22):
                    g[y][x] = '.'
        for y in range(21, 29):
            t = (y - 21) / 7
            if d in ('down', 'up'):
                x0, x1 = round(5 - t * 1.5), round(10 + t * 1.5)
            else:
                sw = [0, 1, -1][pose] if y > 25 else 0
                x0, x1 = round(6 - t * 1.4) + sw, round(10 + t * 1.5) + sw
            for x in range(x0, x1 + 1):
                if g[y][x] not in 'a':
                    g[y][x] = 'K'
        if d in ('down', 'up'):
            ls = [(5, 6), (9, 10)]
            for i, (a_, b_) in enumerate(ls):
                lift = 1 if (pose == 1 and i == 1) or (pose == 2 and i == 0) else 0
                for x in (a_, b_):
                    setz(g, x, 29 - lift, 'S')
        else:
            for (x0, lift) in ([(7, 0), (9, 0)] if pose == 0 else [(5, 0), (10, 0)]):
                setz(g, x0, 29, 'S'); setz(g, x0 + 1, 29, 'S')
    elif fig.art == 'mantel':
        for y in range(21, 27):
            for x in range(16):
                if g[y][x] in 'LlB':
                    g[y][x] = '.'
            if d in ('down', 'up'):
                x0, x1 = 4, 11
            else:
                sw = [0, -1, 1][pose] if y > 23 else 0
                x0, x1 = 5 + sw, 11 + sw
            for x in range(x0, x1 + 1):
                if g[y][x] != 'a':
                    g[y][x] = 'T'
        if d == 'down':
            for y in range(16, 27):
                g[y][7 if y > 21 else 8] = 't'


def frisur(g, fig, d):
    fr = fig.frisur
    if fr == 'dutt':
        if d in ('down', 'up'):
            for x in range(6, 10):
                setz(g, x, 0, 'd')
                setz(g, x, 1, 'd')
            setz(g, 6, 0, '.'); setz(g, 9, 0, '.')
            for x in range(6, 10):
                setz(g, x, 2, 'D')  # Haarband/Schatten unter dem Knoten
        else:
            for y in range(2, 6):
                setz(g, 2, y, 'd'); setz(g, 3, y, 'd')
            setz(g, 2, 2, '.'); setz(g, 2, 5, '.')
            for y in range(3, 6):
                setz(g, 4, y, 'D')
    elif fr == 'lang':
        for y in range(8, 15):
            if d in ('down', 'up'):
                for x in (3, 4, 11, 12):
                    if g[y][x] in '.A' and not (x in (3, 12) and y > 12):
                        setz(g, x, y, 'h')
            else:
                for x in (3, 4, 5):
                    if g[y][x] in '.TA' and y < 14:
                        setz(g, x, y, 'h')
    elif fr == 'glatze':
        for y in range(2, 5):
            for x in range(16):
                if g[y][x] == 'h':
                    g[y][x] = 'H'
        if d == 'up':
            for y in range(5, 8):
                for x in range(16):
                    if g[y][x] == 'h':
                        g[y][x] = 'H'
    elif fr == 'kapuze':
        for y in range(1, 13):
            for x in range(16):
                gesicht = g[y][x] in 'He' and 5 <= y <= 10
                if d == 'up' and g[y][x] in 'hHn':
                    g[y][x] = 'C'
                elif g[y][x] == 'h' or (not gesicht and g[y][x] in 'Hn' and y < 11):
                    g[y][x] = 'C'
        for (x, y) in ([(4, 2), (11, 2), (3, 5), (12, 5), (3, 8), (12, 8), (4, 10), (11, 10), (5, 11), (10, 11)] if d in ('down', 'up')
                       else [(4, 2), (3, 5), (3, 8), (4, 10), (5, 11), (11, 3), (12, 4)]):
            setz(g, x, y, 'C')
        if d != 'up':
            for x in range(16):
                if g[5][x] == 'H':
                    g[5][x] = 'n'  # Schatten der Kapuze


def hut(g, fig, d):
    h = fig.hut
    if not h:
        return
    seite = d in ('left', 'right')
    rows = {
        'melone': {False: ["......mmmm......", ".....mmmmmm.....", "...MMMMMMMMMM..."], True: ["......mmmm......", ".....mmmmmm.....", "...MMMMMMMMMM..."]},
        'muetze': {False: ["......mmmm......", ".....mmmmmm.....", "....MMMMMMMM...."], True: ["......mmmm......", ".....mmmmmmm....", "....hmmmmmMMMM.."]},
        'papier': {False: [".......pp.......", "......pppp......", ".....pppppp.....", "....PPPPPPPP...."], True: ["......pp........", ".....pppp.......", "....pppppp......", "....PPPPPPPP...."]},
        'feder': {False: ["......ffff...w..", ".....ffffff.w...", "...FFFFFFFFFF..."], True: ["......ffff......", "w....ffffff.....", ".w.FFFFFFFFFF..."]},
        'schirm': {False: [None, None, None, "....gggggggg....", "....GGGGGGGG...."], True: [None, None, None, "....gggggggg....", "....hhhGGGGGG..."]},
    }[h][seite]
    start = {'melone': 1, 'muetze': 2, 'papier': 0, 'feder': 1, 'schirm': 1}[h]
    if h == 'muetze' and d == 'up':
        rows = ["......mmmm......", ".....mmmmmm.....", "....mmmmmmmm...."]
    if h == 'schirm' and d == 'up':
        rows = [None, None, None, "....gggggggg...."]
    if h == 'feder' and d == 'up':
        rows = ["......ffff......", ".....ffffff.....", "...FFFFFFFFFF..."]
    for i, row in enumerate(rows):
        if row is None:
            continue
        r = row[::-1] if d == 'left' else row
        for x, c in enumerate(r):
            if c != '.':
                setz(g, x, start + i, c)


FARBE_HUT = {'m': [29, 17, 13], 'M': [29, 29, 17], 'p': [24, 4, 31], 'P': [9, 24, 4], 'f': [20, 21, 14], 'F': [20, 20, 21], 'w': [4, 31, 31],
             'g': [8, 28, 0], 'G': [8, 8, 28], 't': [29, 29, 17]}


def schuerze(g, fig, d):
    if not fig.schuerze or d == 'up':
        return
    x0, x1 = (6, 9) if d == 'down' else ((9, 10) if d == 'right' else (6, 7))
    for y in range(15, 28):
        for x in range(x0, x1 + 1):
            if g[y][x] in 'TKLlB':
                g[y][x] = 'P'


def faerben(g, fig, d, f):
    b = Bild(16, 32, seed=11 + f)
    farbe = dict(fig.f)
    farbe.update(FARBE_HUT)
    if fig.hutfarbe:
        farbe['m'], farbe['M'] = fig.hutfarbe
    farbe['t'] = [fig.f['T'][0]]
    for y in range(32):
        x = 0
        while x < 16:
            c = g[y][x]
            if c == '.':
                x += 1
                continue
            x1 = x
            while x1 + 1 < 16 and g[y][x1 + 1] == c:
                x1 += 1
            ramp = farbe.get(c) or [OUT]
            for xx in range(x, x1 + 1):
                ff = (xx - x) / max(1, x1 - x)
                v = (0.78 - 0.62 * ff) if c in 'Hn' else (0.66 - 0.58 * ff) if c in 'hdD' else (0.74 - 0.72 * ff)
                if c in 'l':
                    v -= 0.35
                if c == 'A' and d == 'down' and xx > 8:
                    v -= 0.3
                if c == 'A' and d == 'up' and xx < 8:
                    v -= 0.3
                if c in 'Kk' and y > 25:
                    v -= 0.12
                if c in 'TKP' and (xx + y * 3) % 9 == 0 and y > 14:
                    v -= 0.3  # Falten
                b.ton(xx, y, ramp, max(0, min(1, v)), 0.3, 3)
            x = x1 + 1
    # Trennlinien: Kinn gegen Hals, Arm gegen Rumpf
    for x in range(16):
        if g[11][x] == 'n':
            b.set(x, 11, fig.f['H'][0])
    for y in range(13, 22):
        for x in range(1, 15):
            if g[y][x] == 'T' and (g[y][x - 1] == 'A' or g[y][x + 1] == 'A'):
                b.set(x, y, fig.f['T'][0])
    return b


def frame(fig, d, f):
    pose = [0, 1, 0, 2][f]
    g = schablone('right' if d == 'left' else d, pose)
    if fig.breit and d in ('down', 'up'):
        for y in range(13, 22):
            for x in (4, 11):
                if g[y][x] == 'A':
                    g[y][x] = 'T'
            for x, q in ((2, 3), (13, 12)):
                if g[y][q] in 'Aa':
                    g[y][x] = g[y][q]
    unterteil(g, fig, 'right' if d == 'left' else d, pose)
    frisur(g, fig, 'right' if d == 'left' else d)
    hut(g, fig, 'right' if d == 'left' else d)
    schuerze(g, fig, 'right' if d == 'left' else d)
    b = faerben(g, fig, d, f)
    a = [0, 1, 0, -1][f]
    for ex in fig.extras:
        ex(b, 'right' if d == 'left' else d, f, a, g)
    b.umriss(OUT)
    if d == 'left':
        b = b.gespiegelt()
    return b


def blatt(fig):
    im = Image.new('RGBA', (64, 128), (0, 0, 0, 0))
    for r, d in enumerate(DIRS):
        for f in range(4):
            im.alpha_composite(frame(fig, d, f).image(), (f * 16, r * 32))
    return im


# --- Beigaben (gezeichnet für Blick nach unten, rechts und oben; links wird gespiegelt) ------------------------------------------
def fl(b, x0, y0, x1, y1, ramp):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            b.ton(x, y, ramp, 0.85 - 0.7 * (x - x0) / max(1, x1 - x0), 0.15, 5)


def massband(b, d, f, a, g):
    if d == 'up':
        return
    pts = [(6, 12), (6, 13), (6, 14), (6, 15), (9, 12), (9, 13), (9, 14), (9, 15), (9, 16)] if d == 'down' else [(8, 12), (8, 13), (8, 14), (8, 15), (8, 16)]
    for i, (x, y) in enumerate(pts):
        b.set(x, y, 23 if i % 2 else 31)


def nadelkissen(b, d, f, a, g):
    if d == 'down':
        y = 19 if a >= 0 else 18
        b.set(11, y, 21); b.set(12, y, 27)


def schere(b, d, f, a, g):
    if d == 'down':
        b.set(10, 21, 4); b.set(9, 22, 3); b.set(11, 22, 3)
    elif d == 'right':
        b.set(9, 21, 4); b.set(9, 22, 3)


def brille(b, d, f, a, g):
    if d == 'down':
        for x in (5, 7, 8, 10):
            b.set(x, 7, 3)
        b.set(6, 6, 16); b.set(9, 6, 16)
    elif d == 'right':
        b.set(9, 7, 3); b.set(11, 7, 3); b.set(10, 6, 3)


def lupe(b, d, f, a, g):
    if d == 'down':
        b.set(9, 7, 31); b.set(8, 6, 30); b.set(10, 6, 30); b.set(8, 8, 30); b.set(10, 8, 30); b.set(11, 6, 23); b.set(11, 5, 23)
    elif d == 'right':
        b.set(10, 7, 31); b.set(11, 6, 30); b.set(11, 8, 30); b.set(12, 7, 30)


def uhrkette(b, d, f, a, g):
    if d == 'down':
        for x, y in ((5, 17), (6, 18), (7, 18), (8, 18), (9, 17)):
            b.set(x, y, 23)
        b.set(10, 16, 31)


def kassette(b, d, f, a, g):
    if d == 'down':
        fl(b, 11, 15, 14, 18, STOFF['leder']); b.set(12, 16, 23); b.set(13, 16, 23)
    elif d == 'right':
        fl(b, 8, 15, 11, 18, STOFF['leder']); b.set(9, 16, 23); b.set(10, 16, 23)


def _behaelter(b, d, f, a, ramp, rand):
    if d == 'up':
        return
    if d == 'down':
        x0, y0 = 11, 22 + (0 if a >= 0 else -1)
    else:
        x0, y0 = {0: 7, 1: 4, -1: 10}[a], 21
    for y in range(y0, y0 + 4):
        for x in range(x0, x0 + 4):
            if y == y0 + 3 and x in (x0, x0 + 3):
                continue
            b.ton(x, y, ramp, 0.8 - 0.18 * (x - x0), 0.12, 30)
    for x in range(x0, x0 + 4):
        b.set(x, y0, rand(x))
    b.set(x0 + 1, y0 - 1, 10); b.set(x0 + 2, y0 - 1, 10)


def kessel(b, d, f, a, g):
    _behaelter(b, d, f, a, [13, 16, 26, 14], lambda x: 16)


def eimer(b, d, f, a, g):
    _behaelter(b, d, f, a, [17, 13, 10], lambda x: 3 if x % 2 else 4)


def laterne(b, d, f, a, g):
    if d == 'up':
        return
    x0, y0 = (11, 21 + (0 if a >= 0 else -1)) if d == 'down' else ({0: 7, 1: 4, -1: 10}[a], 21)
    b.set(x0 + 1, y0 - 1, 10)
    for y in range(y0, y0 + 4):
        for x in range(x0, x0 + 3):
            b.set(x, y, 10 if x in (x0, x0 + 2) and y in (y0, y0 + 3) else (31 if x == x0 + 1 else 4))


def russ(b, d, f, a, g):
    if d != 'up':
        for x, y in ((6, 9), (9, 8), (5, 6), (7, 15), (9, 18), (6, 20)):
            if g[y][x] not in '.' and h3(x, y, f) < 0.85:
                b.set(x, y, 20)


def schal(b, d, f, a, g):
    for x in range(4, 12):
        if g[11][x] != '.' or g[12][x] != '.':
            b.set(x, 11 if g[11][x] != '.' else 12, 27)
    if d == 'down':
        b.set(9, 13, 27); b.set(9, 14, 27); b.set(10, 15, 20)


def tinte(b, d, f, a, g):
    if d != 'up':
        for x, y in ((6, 18), (9, 21), (7, 24), (10, 16), (8, 26)):
            if g[y][x] == 'P':
                b.set(x, y, 22)


def mappe(b, d, f, a, g):
    if d == 'down':
        fl(b, 11, 15, 14, 19, STOFF['creme']); b.set(12, 17, 26); b.set(13, 17, 26)
    elif d == 'right':
        fl(b, 8, 14, 11, 18, STOFF['creme']); b.set(9, 16, 26); b.set(10, 16, 26)


def kiepe(b, d, f, a, g):
    korb = [20, 19, 12]
    if d == 'down':
        b.set(5, 12, 19); b.set(10, 12, 19); b.set(5, 13, 19); b.set(10, 13, 19)
    elif d == 'up':
        for y in range(9, 21):
            for x in range(4, 12):
                b.ton(x, y, korb, 0.75 - 0.07 * (x - 4) - (0.3 if (x + y) % 3 == 0 else 0), 0.12, 32)
        for x in range(4, 12):
            b.set(x, 9, 12)
    else:
        for y in range(9, 20):
            for x in range(1, 5):
                b.ton(x, y, korb, 0.75 - 0.15 * (x - 1) - (0.3 if (x + y) % 3 == 0 else 0), 0.12, 32)


def kragen(b, d, f, a, g):
    if d == 'down':
        for x in range(6, 10):
            b.set(x, 12, 31)


FIGUREN = {
    'wx_schneiderin': ('Schneiderin Ottilie Fenn', 'Wexmoor', 'Haarknoten, grünes Kleid, cremefarbene Schürze, Maßband um den Hals, Nadelkissen am Handgelenk',
                       Figur('gruen', 'gruen', 'rock', haar='rot', frisur='dutt', schuerze='creme', extras=(massband, nadelkissen))),
    'cwz_pfandmeister': ('Pfandmeister Ambros Kerb', 'Calderwick', 'kräftig, Halbglatze, braune Weste mit Uhrkette, Brille',
                         Figur('braun', 'navy', 'hose', haar='grau', frisur='glatze', breit=True, extras=(uhrkette, brille))),
    'cwz_schneiderin': ('Schneiderin Vera Saum', 'Calderwick', 'langes schwarzes Haar, violettes Kleid mit weißem Kragen, Schere am Gürtel, Maßband',
                        Figur('lila', 'lila', 'rock', haar='schwarz', frisur='lang', extras=(kragen, schere, massband))),
    'cwz_kassenwart': ('Kassenwart Emil Groschen', 'Calderwick', 'dunkler Anzug, grüner Augenschirm, Geldkassette unter dem Arm',
                       Figur('navy', 'navy', 'hose', haar='braun', hut='schirm', extras=(kassette,))),
    'cwz_kesselflicker': ('Kesselflicker Bruno Ruß', 'Calderwick', 'Schiebermütze, Lederschürze, Ruß im Gesicht, Kessel in der Hand',
                          Figur('schiefer', 'braun', 'hose', haar='schwarz', hut='muetze', schuerze='leder', breit=True, extras=(russ, kessel))),
    'cwz_aschehaendler': ('Aschehändler Ferdinand Glut', 'Calderwick', 'langer grauer Mantel, Melone, roter Schal, Ascheeimer',
                          Figur('grau', 'dunkel', 'mantel', haar='grau', hut='melone', extras=(schal, eimer))),
    'cwz_bleisetzer': ('Obersetzer Konrad Blei', 'Calderwick', 'gefalteter Papierhut der Setzer, graue Schürze mit Tintenflecken',
                       Figur('schiefer', 'dunkel', 'hose', haar='braun', hut='papier', schuerze='grau', extras=(tinte,))),
    'cwz_schaetzerin': ('Schätzerin Liesl Lupe', 'Calderwick', 'graues Haar im Knoten, olivfarbenes Kleid, Einschlaglupe vor dem Auge',
                        Figur('oliv', 'oliv', 'rock', haar='grau', frisur='dutt', extras=(lupe,))),
    'haus_maklerin': ('Frau Leda Voss', 'Wexmoor/Dunscar', 'Maklerin: Federhut, rotbrauner Mantel, dunkle Handschuhe, Mappe mit Grundrissen',
                      Figur('rotbraun', 'dunkel', 'mantel', haar='blond', hut='feder', haende='dunkel', extras=(mappe,))),
    'nebel_kraemerin': ('Ysolde Grau', 'Nebelseite', 'grauer Kapuzenumhang, Tragkorb auf dem Rücken, blasse Laterne',
                        Figur('grau', 'grau', 'rock', haar='grau', frisur='kapuze', extras=(kiepe, laterne))),
}


def pruefe(name, im):
    pal = set(PAL)
    data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
    for px in data:
        assert px[3] in (0, 255), name
        if px[3]:
            assert px[:3] in pal, (name, px)
    for r in range(4):
        for f in range(4):
            bb = im.crop((f * 16, r * 32, f * 16 + 16, r * 32 + 32)).getbbox()
            assert bb and 30 <= bb[3] <= 31 and bb[1] >= 0, (name, r, f, bb)


if __name__ == '__main__':
    od = os.path.join(ROOT, 'public', 'sprites', 'characters')
    assets = []
    for nid, (name, stadt, look, fig) in FIGUREN.items():
        im = blatt(fig)
        pruefe(nid, im)
        p = os.path.join(od, f'fig_{nid}_walk.png')
        im.save(p)
        assets.append({'id': f'fig_{nid}', 'npc': nid, 'name': name, 'stadt': stadt, 'aussehen': look, 'file': f'characters/fig_{nid}_walk.png',
                       'width': 64, 'height': 128, 'frameWidth': 16, 'frameHeight': 32, 'rows': DIRS, 'framesPerRow': 4,
                       'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()})
        print(nid)
    json.dump({'version': 1, 'batch': 'figuren-eigen', 'palette': 'manifest-figuren_nachzuegler.json', 'erzeugt': 'python3 tools/art/figuren/figuren.py',
               'layout': '64x128, Reihen unten/links/rechts/oben, je 4 Schritte (Stand, Schritt, Stand, Schritt), Fußlinie y=30', 'assets': assets},
              open(os.path.join(ROOT, 'public', 'sprites', 'manifest-figuren-eigen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
