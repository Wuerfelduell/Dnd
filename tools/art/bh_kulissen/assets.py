"""Briarholt-Kulissen (Runde 2 der Skript-Kulissen): vier Dachsätze statt der future200-Vorratstexturen und sechs Innenraum-Requisiten.
python3 tools/art/bh_kulissen/assets.py  -> public/sprites/props/bhk_*.png, public/sprites/manifest-bh-kulissen.json
Palette: manifest-briarholt1.json (32 Farben). Pinsel: tools/art/vm_kulissen/pinsel.py."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import pinsel
from pinsel import Bild, h3, streifen, ROOT, OUT

PAL = pinsel.palette_aus('manifest-briarholt1.json')
OUTDIR = os.path.join(ROOT, 'public', 'sprites', 'props')

# Rampen (Indizes in der Briarholt-Palette)
GRAU = [1, 2, 3, 4, 5, 6, 7]
HOLZ = [8, 9, 10, 11, 12]
HOLZ_HELL = [9, 10, 11, 12, 13]
OLIV = [15, 16, 17]
CREME = 18
PATINA = [19, 20, 21, 22]
MESSING = [24, 25, 26, 27]
LILA = [29, 30, 28]
ZIEGEL = [8, 9, 31, 10, 11]
PAPIER = [12, 13, 14, 18]
REIF = 7

# ---------------------------------------------------------------------------------------------------------------------
# Dächer: 11 Kacheln je Fassung (Zeile 0 kalt mit Reif, Zeile 1 warm)
FRAMES = ['innen_a', 'innen_b', 'innen_detail', 'oben', 'unten', 'links', 'rechts', 'oben_links', 'oben_rechts', 'unten_links', 'unten_rechts']


def innen_kupfer(b, kalt, var):
    for y in range(16):
        for x in range(16):
            px = x % 8
            if px == 0:
                b.ton(x, y, PATINA, 0.95, 0.15, 1)
            elif px == 7:
                b.ton(x, y, [19, 20], 0.2, 0.15, 2)
            else:
                v = 0.62 - 0.05 * px - 0.1 * (y / 16) + (0.1 if var and h3(x // 8, 3, 9) < 0.5 else 0)
                b.ton(x, y, PATINA, v, 0.32, 3 + var)
                if h3(x, y // 3, 11 + var) < 0.05:  # Kupfer schimmert durch
                    b.set(x, y, 24 if h3(x, y, 3) < 0.6 else 10)
    for x in range(16):
        if x % 8 not in (0, 7):
            b.set(x, 15, 20)  # Querfalz
    if kalt:  # Reif auf den Falzen, oben mehr
        for y in range(16):
            for x in range(16):
                if x % 8 == 0 and h3(x, y, 21) < 0.3 - 0.012 * y:
                    b.set(x, y, REIF if h3(x, y, 22) < 0.7 else CREME)
                elif x % 8 not in (0, 7) and y == 14 and h3(x, y, 23) < 0.35:
                    b.set(x, y, REIF)


def innen_schiefer(b, kalt, var):
    """Schuppenschiefer: 4x4-Platten mit runder Unterkante, reihenweise um 2 versetzt"""
    for y in range(16):
        reihe = y // 4
        off = 2 if reihe % 2 else 0
        ry = y % 4
        for x in range(16):
            sx = (x + off) % 4
            platte = ((x + off) // 4, reihe)
            ton = 0.14 + 0.24 * h3(platte[0] + var * 5, platte[1], 31)
            if ry == 3 and sx in (1, 2):
                b.set(x, y, 0)        # runde Unterkante (Schatten auf der Platte darunter)
            elif ry == 3:
                b.ton(x, y, [0, 1, 2, 3, 4], ton - 0.1, 0.2, 32)
            elif sx == 3:
                b.set(x, y, 1)
            else:
                b.ton(x, y, [0, 1, 2, 3, 4], ton + (0.3 if ry == 0 and sx == 0 else 0.12 if ry == 0 else 0) - 0.05 * sx, 0.2, 32)
            if kalt and ry == 0 and sx in (0, 1) and h3(platte[0], platte[1], 33 + var) < 0.3:
                b.set(x, y, REIF)


def innen_ziegel(b, kalt, var):
    """Hohlpfannen: 8 px breite Pfannen (Welle hell-dunkel), Reihen alle 4 px mit Schattenkante"""
    for y in range(16):
        ry = y % 4
        for x in range(16):
            col = x % 8
            welle = [0.75, 0.68, 0.55, 0.42, 0.32, 0.38, 0.5, 0.62][col]
            pfanne = (x // 8, y // 4)
            v = welle + 0.12 * (h3(pfanne[0] + var * 3, pfanne[1], 41) - 0.5)
            if ry == 3:
                b.set(x, y, 8 if col in (3, 4, 5) else 9)
            else:
                b.ton(x, y, ZIEGEL, v + (0.1 if ry == 0 else 0), 0.22, 42)
            if kalt and ry == 0 and col in (0, 1, 7) and h3(pfanne[0], pfanne[1], 43 + var) < 0.45:
                b.set(x, y, REIF)


def innen_basalt(b, kalt, var):
    # Sechseck-Säulenköpfe: verschobenes Raster, Kanten dunkel, Licht oben links
    for y in range(16):
        for x in range(16):
            r = y // 8
            xx = (x + (4 if r % 2 else 0)) % 8
            yy = y % 8
            rand = yy == 7 or xx == 7 or (yy == 0 and xx in (0, 6)) or (xx == 0 and yy in (0, 6))
            if rand:
                b.set(x, y, 0 if yy == 7 or xx == 7 else 1)
            else:
                b.ton(x, y, [1, 2, 3, 4], 0.62 - 0.05 * xx - 0.05 * yy + 0.1 * h3((x + 4 * r) // 8 + var, r, 51), 0.25, 52)
    if var:  # nur Variante B trägt einen Wurzelstrang
        for x in range(16):
            y = int(8 + 3 * math.sin(x / 2.6 + 1.3))
            b.set(x, y, 10); b.set(x, y + 1, 9)
            if not kalt and h3(x, 0, 53) < 0.15:
                b.set(x, y, 30)
    if kalt:
        b.streu(lambda x, y: True, REIF, 0.02, s=54)


MATERIAL = {'kupfer': innen_kupfer, 'schiefer': innen_schiefer, 'ziegel': innen_ziegel, 'basalt': innen_basalt}
KANTE = {  # [Kappe hell, Kappe dunkel] der Kanten
    'kupfer': ([26, 25], 24), 'schiefer': ([6, 5], 2), 'ziegel': ([11, 10], 9), 'basalt': ([4, 3], 2),
}


def detail(b, mat, kalt):
    if mat == 'kupfer':  # Messing-Lüfter mit Kappe
        b.rechteck(6, 5, 9, 12, MESSING, 0.5, 0.2, licht=0.8)
        b.rechteck(5, 3, 10, 5, MESSING, 0.75, 0.2, licht=0.8)
        for y in range(3, 13):
            b.set(4 if y < 6 else 5, y, OUT); b.set(11 if y < 6 else 10, y, OUT)
        for x in range(4, 12):
            b.set(x, 2, OUT)
        for x in range(5, 11):
            b.set(x, 13, OUT)
        if kalt:
            for x in range(5, 11):
                b.set(x, 3, CREME)
    elif mat == 'schiefer':  # Ziegelschornstein mit Ruß
        b.rechteck(5, 2, 10, 12, ZIEGEL, 0.5, 0.25, licht=0.7)
        for y in range(4, 12, 3):
            for x in range(5, 11):
                b.set(x, y, 8)
        b.rechteck(4, 1, 11, 2, GRAU, 0.3, 0.2)
        b.rechteck(6, 2, 9, 3, [0, 1], 0.2, 0)
        for y in range(1, 13):
            b.set(3 if y < 3 else 4, y, OUT); b.set(12 if y < 3 else 11, y, OUT)
        for x in range(3, 13):
            b.set(x, 0, OUT)
        for x in range(4, 12):
            b.set(x, 13, OUT)
        if kalt:
            for x in range(4, 12):
                b.set(x, 1, REIF)
    elif mat == 'ziegel':  # Dachfenster
        b.rechteck(4, 4, 11, 12, HOLZ, 0.6, 0.2, licht=0.6)
        b.rechteck(5, 5, 10, 10, [19, 20, 3] if kalt else [24, 25, 26], 0.5 if kalt else 0.7, 0.2)
        b.set(7, 5, 10); b.set(7, 6, 10); b.set(7, 7, 10); b.set(7, 8, 10); b.set(7, 9, 10); b.set(7, 10, 10)
        for x in range(5, 11):
            b.set(x, 7, 10)
        for x in range(3, 13):
            b.set(x, 3, OUT); b.set(x, 13, OUT)
        for y in range(3, 14):
            b.set(3, y, OUT); b.set(12, y, OUT)
        if kalt:
            for x in range(4, 12):
                b.set(x, 4, CREME)
    else:  # Wurzelknoten, warm mit violettem Puls
        for y in range(4, 13):
            for x in range(4, 12):
                if (x - 7.5) ** 2 / 14 + (y - 8.5) ** 2 / 18 <= 1:
                    b.ton(x, y, HOLZ, 0.55 - 0.05 * (x - 4), 0.3, 55)
        b.set(7, 8, 29 if kalt else 28); b.set(8, 9, 29 if kalt else 30); b.set(7, 9, 30 if not kalt else 29)


def dachkachel(mat, frame, kalt):
    b = Bild(16, 16, seed=60 + FRAMES.index(frame) + (0 if kalt else 20))
    var = 1 if frame == 'innen_b' else 0
    MATERIAL[mat](b, kalt, var)
    if frame == 'innen_detail':
        detail(b, mat, kalt)
    hell, dunkel = KANTE[mat]
    oben = 'oben' in frame
    unten = 'unten' in frame
    links = frame.endswith('links') or frame == 'links'
    rechts = frame.endswith('rechts') or frame == 'rechts'
    if oben:  # First/Dachkante
        for x in range(16):
            b.set(x, 0, OUT); b.ton(x, 1, hell, 0.7, 0.3, 61); b.set(x, 2, dunkel)
            if kalt and h3(x, 1, 62) < 0.75:
                b.set(x, 1, CREME)
    if unten:  # Traufe mit Rinne
        for x in range(16):
            b.set(x, 12, dunkel); b.ton(x, 13, hell, 0.75, 0.25, 63); b.ton(x, 14, hell, 0.3, 0.25, 64); b.set(x, 15, OUT)
            if kalt and x % 5 == 2:  # Eiszapfen-Ansatz
                b.set(x, 14, REIF)
    if links:
        for y in range(16):
            b.set(0, y, OUT); b.ton(1, y, hell, 0.7, 0.3, 65)
    if rechts:
        for y in range(16):
            b.set(15, y, OUT); b.set(14, y, dunkel)
    if oben and links:
        b.set(1, 1, OUT)
    if oben and rechts:
        b.set(14, 1, OUT)
    return b


def dach(mat):
    return [dachkachel(mat, f, True) for f in FRAMES] + [dachkachel(mat, f, False) for f in FRAMES]


def dach_bild(frames):
    from PIL import Image
    im = Image.new('RGBA', (16 * 11, 32), (0, 0, 0, 0))
    for i, b in enumerate(frames):
        im.alpha_composite(b.image(), ((i % 11) * 16, (i // 11) * 16))
    return im


# ---------------------------------------------------------------------------------------------------------------------
# Innenraum-Requisiten (3/4-Ansicht, Licht oben links, Umriss)
def kasten(b, x0, y0, w, top, front, ramp_top=HOLZ_HELL, ramp_front=HOLZ, s=0):
    """Möbelkörper: Deckfläche (top px hoch) über Front (front px hoch)"""
    b.rechteck(x0, y0, x0 + w - 1, y0 + top - 1, ramp_top, 0.6, 0.25, licht=0.6, s=s)
    b.rechteck(x0, y0 + top, x0 + w - 1, y0 + top + front - 1, ramp_front, 0.5, 0.25, licht=0.5, s=s + 1)
    for x in range(x0, x0 + w):
        b.set(x, y0 + top, ramp_front[0] if ramp_front[0] != OUT else 8)


def glas(b, cx, yb, h, breit, fluessig, s=0, hals=2):
    """Glaskolben: Bauch unten, Hals oben, Flüssigkeit in der unteren Hälfte"""
    for y in range(yb - h, yb + 1):
        f = (yb - y) / max(1, h)
        r = breit / 2 if f < 0.55 else max(0.6, hals / 2)
        for x in range(int(cx - r + 0.5), int(cx + r + 0.5)):
            if f < 0.4:
                b.ton(x, y, fluessig, 0.65 - 0.25 * (x - cx + r) / max(1, 2 * r), 0.15, s)
            else:
                b.set(x, y, 6 if x < cx else 5)
    b.set(int(cx - breit / 2 + 1), yb - int(h * 0.25), 18)  # Glanz


def labortisch():
    b = Bild(48, 40, seed=101)
    kasten(b, 1, 24, 46, 6, 8, s=1)
    for lx in (2, 44):  # Beine
        b.rechteck(lx, 38, lx + 1, 39, HOLZ, 0.3, 0.1)
    # Dreifuß mit Brennerflamme, darauf ein großer Rundkolben mit türkisem Sud
    for (x0, x1) in ((6, 9), (16, 13)):
        for i in range(8):
            b.set(x0 + (x1 - x0) * i // 7, 18 + i, 2)
    b.rechteck(7, 17, 15, 17, [2, 3], 0.6, 0)
    b.set(11, 22, 26); b.set(11, 21, 27); b.set(10, 22, 25); b.set(12, 22, 25); b.set(11, 23, 24)
    for y in range(6, 17):
        for x in range(4, 19):
            d = (x + 0.5 - 11) ** 2 + (y + 0.5 - 11) ** 2
            if d <= 30:
                if y >= 11:
                    b.ton(x, y, PATINA, 0.85 - 0.06 * (x - 4), 0.2, 2)
                else:
                    b.set(x, y, 6 if x < 11 else 5)
    b.set(8, 8, 18); b.set(9, 8, 18); b.set(8, 9, 18)
    b.rechteck(10, 2, 12, 6, [5, 6], 0.5, 0)               # Hals
    # Glasrohr zum Kühler, Kühler schräg, Vorlage
    for i in range(14):
        b.set(13 + i, 2 + i // 4, 6); b.set(13 + i, 3 + i // 4, 4)
    for i in range(12):
        for d in range(3):
            b.set(26 + i, 5 + i + d, [4, 5, 6][d])
    glas(b, 38, 25, 7, 6, [29, 30, 28], s=3)
    glas(b, 44, 25, 6, 3, [24, 25, 26], s=4, hals=1)
    # verworfene Anleitungen
    for (px, py) in ((18, 25), (23, 27), (29, 25)):
        b.rechteck(px, py, px + 3, py + 2, PAPIER, 0.6, 0.35)
        b.set(px + 1, py + 1, 12)
    b.umriss()
    return b


def laborregal():
    b = Bild(32, 48, seed=111)
    b.rechteck(1, 1, 30, 46, [8, 9], 0.4, 0.25, s=1)              # Rückwand dunkel
    for y in (1, 15, 29, 43):                                       # Böden
        b.rechteck(1, y, 30, y + 2, HOLZ_HELL, 0.55, 0.2, licht=0.5, s=y)
    for x in (1, 2, 29, 30):
        for y in range(1, 47):
            b.ton(x, y, HOLZ, 0.55 if x in (1, 29) else 0.3, 0.2, 3)
    fl = [PATINA[1:], [29, 30, 28], [24, 25, 26], [15, 16, 17], [19, 20, 21]]
    for i, yb in enumerate((14, 28, 42)):
        x = 5
        k = 0
        while x < 27:
            w = 3 + int(3 * h3(x, i, 7))
            hh = 5 + int(6 * h3(x, i, 8))
            glas(b, x + w / 2, yb, hh, w, fl[int(h3(x, i, 9) * len(fl))], s=10 + k, hals=1 if w < 5 else 2)
            if h3(x, i, 10) < 0.5:  # Etikett
                b.set(int(x + w / 2), yb - 1, 18)
            x += w + 2
            k += 1
    b.umriss()
    return b


def planschrank():
    b = Bild(48, 32, seed=121)
    kasten(b, 1, 8, 46, 8, 22, s=1)
    for i in range(5):  # flache Schübe mit Messinggriffen
        y = 17 + i * 4
        for x in range(2, 46):
            b.set(x, y, 8)
        for gx in (12, 35):
            b.set(gx, y + 2, 26); b.set(gx + 1, y + 2, 25)
    # Papierrollen und Winkel oben
    for (rx, ry, ln) in ((4, 9, 18), (8, 12, 22), (27, 10, 14)):
        for x in range(rx, rx + ln):
            b.ton(x, ry, PAPIER, 0.8, 0.2, 2); b.ton(x, ry + 1, PAPIER, 0.5, 0.2, 2)
        b.set(rx + ln // 2, ry, 31); b.set(rx + ln // 2, ry + 1, 31)
    for i in range(9):
        b.set(36 + i, 14 - i // 2, 25)
    for i in range(6):
        b.set(36, 14 - i, 25)
    b.umriss()
    return b


def rollenstaender():
    b = Bild(16, 32, seed=131)
    # Rollen schräg aus dem Korb
    for i, (x0, lean, top) in enumerate(((5, -1, 3), (8, 0, 1), (10, 1, 5), (6, 1, 7), (9, -1, 9))):
        for y in range(top, 22):
            x = x0 + int(lean * (22 - y) / 8)
            b.ton(x, y, PAPIER, 0.8, 0.2, i); b.ton(x + 1, y, PAPIER, 0.45, 0.2, i)
        b.set(x0 + int(lean * (22 - top) / 8), top, 12)
        b.set(x0 + int(lean * (22 - top - 4) / 8), top + 4, 31)
    # Korb aus Messingdraht/Holz
    for y in range(18, 31):
        for x in range(3, 13):
            b.ton(x, y, HOLZ, 0.55 - 0.04 * (x - 3), 0.25, 9)
            if (x + y) % 4 == 0:
                b.set(x, y, 24)
    for x in range(3, 13):
        b.set(x, 18, 25); b.set(x, 30, 9)
    b.umriss()
    return b


def aktenschrank(offen):
    b = Bild(32, 48, seed=141)
    kasten(b, 2, 2, 28, 6, 39, ramp_top=HOLZ_HELL, ramp_front=HOLZ, s=1)
    for i in range(4):  # vier Schübe mit Messingrahmen
        y = 9 + i * 10
        for x in range(3, 29):
            b.set(x, y, 8)
        b.rechteck(13, y + 3, 18, y + 5, MESSING, 0.6, 0.2)
        b.rechteck(14, y + 4, 17, y + 4, [18], 0.5, 0)
        b.set(15, y + 7, 25); b.set(16, y + 7, 24)
    b.rechteck(2, 46, 4, 47, [8], 0.5, 0); b.rechteck(27, 46, 29, 47, [8], 0.5, 0)
    if offen:  # zweiter Schub heraus, Formulare sichtbar
        y = 19
        b.rechteck(3, y + 1, 28, y + 9, HOLZ_HELL, 0.55, 0.2, licht=0.5, s=5)
        for fx in range(5, 27, 2):
            b.ton(fx, y + 1, PAPIER, 0.85, 0.2, 6); b.ton(fx, y + 2, PAPIER, 0.6, 0.2, 6)
            if h3(fx, 0, 7) < 0.3:
                b.set(fx, y, 31)  # rote Widerrufs-Lasche
        b.rechteck(3, y + 10, 28, y + 10, [8], 0.5, 0)
        b.rechteck(13, y + 6, 18, y + 8, MESSING, 0.6, 0.2)
    # ein Blatt oben auf dem Schrank
    b.rechteck(8, 3, 14, 6, PAPIER, 0.7, 0.2)
    b.umriss()
    return b


def gepaeckstapel():
    b = Bild(32, 32, seed=151)
    kasten(b, 2, 18, 26, 4, 9, ramp_top=HOLZ_HELL, ramp_front=HOLZ, s=1)        # Überseekoffer
    for x in (6, 22):
        for y in range(22, 31):
            b.set(x, y, 24)
    b.rechteck(13, 24, 16, 26, MESSING, 0.6, 0.2)                                # Schloss
    kasten(b, 5, 10, 18, 3, 6, ramp_top=[15, 16, 17], ramp_front=[8, 15, 16], s=3)   # Reisetasche/Koffer
    b.rechteck(12, 8, 15, 9, HOLZ, 0.4, 0.1)                                     # Griff
    for y in range(6, 15):                                                       # Hutschachtel
        for x in range(21, 30):
            if (x - 25.5) ** 2 / 20 + (y - 10.5) ** 2 / 20 <= 1:
                b.ton(x, y, [29, 30, 28], 0.65 - 0.04 * (x - 21) - 0.03 * (y - 6), 0.2, 4)
    for x in range(21, 30):
        b.set(x, 10, 18)
    # Gepäckscheine
    for (tx, ty) in ((24, 21), (9, 12), (27, 9)):
        b.rechteck(tx, ty, tx + 2, ty + 3, PAPIER, 0.85, 0.15)
        b.set(tx + 1, ty + 1, 31)
    b.umriss()
    return b


def alle():
    return {
        'bhk_dach_kupfer': (dach('kupfer'), (16, 16), 'dach'),
        'bhk_dach_schiefer': (dach('schiefer'), (16, 16), 'dach'),
        'bhk_dach_ziegel': (dach('ziegel'), (16, 16), 'dach'),
        'bhk_dach_basalt': (dach('basalt'), (16, 16), 'dach'),
        'bhk_labortisch': ([labortisch()], (48, 40), 'prop'),
        'bhk_laborregal': ([laborregal()], (32, 48), 'prop'),
        'bhk_planschrank': ([planschrank()], (48, 32), 'prop'),
        'bhk_rollenstaender': ([rollenstaender()], (16, 32), 'prop'),
        'bhk_aktenschrank': ([aktenschrank(False), aktenschrank(True)], (32, 48), 'prop'),
        'bhk_gepaeckstapel': ([gepaeckstapel()], (32, 32), 'prop'),
    }


ZWECK = {
    'bhk_dach_kupfer': ('Kupferdach mit Stehfalz und Patina; 11 Kacheln (innen a/b/Lüfter, Kanten, Ecken, Traufe), Zeile 0 kalt mit Reif, Zeile 1 warm', 'Promenade, Kutschenhof (statt future200_196)'),
    'bhk_dach_schiefer': ('Schuppenschiefer mit Ziegelschornstein; Raster wie Kupfer', 'Kesselgrund, Wurzelkranz, Wäscherei (statt future200_187)'),
    'bhk_dach_ziegel': ('Hohlpfannen mit Dachfenster; Raster wie Kupfer', 'Stillenhäuser (statt future200_188)'),
    'bhk_dach_basalt': ('Basalt-Säulenköpfe mit Wurzelsträngen; Raster wie Kupfer', 'Wurzelkammer (statt future200_191)'),
    'bhk_labortisch': ('Labortisch mit Brenner, Retorte, Kolben und verworfenen Anleitungen', 'bh_labor'),
    'bhk_laborregal': ('Regal mit Glaskolben', 'bh_labor'),
    'bhk_planschrank': ('Planschrank mit flachen Schüben, Planrollen und Winkel', 'bh_mutterhaus (Dipples Zeichenstube)'),
    'bhk_rollenstaender': ('Korb mit gerollten Plänen', 'bh_mutterhaus'),
    'bhk_aktenschrank': ('Aktenschrank; Frame 0 zu, Frame 1 Schub offen mit Formularen (rote Widerrufs-Laschen)', 'bh_aktenraum'),
    'bhk_gepaeckstapel': ('Überseekoffer, Reisekoffer und Hutschachtel mit Gepäckscheinen', 'bh_kutschenhalle'),
}


def pruefe(name, im, fw, fh, umriss=True):
    pal = set(PAL)
    assert im.width % fw == 0 and im.height % fh == 0, name
    farben = set()
    data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
    for px in data:
        assert px[3] in (0, 255), f'{name}: Alpha {px[3]}'
        if px[3]:
            assert px[:3] in pal, f'{name}: Farbe {px[:3]}'
            farben.add(px[:3])
    if umriss:
        assert PAL[OUT] in farben, f'{name}: kein Umriss'
    return len(farben)


if __name__ == '__main__':
    os.makedirs(OUTDIR, exist_ok=True)
    assets = []
    for name, (frames, (fw, fh), art) in alle().items():
        im = dach_bild(frames) if art == 'dach' else streifen(frames)
        path = os.path.join(OUTDIR, name + '.png')
        im.save(path)
        n = pruefe(name, im, fw, fh)
        assets.append({'id': name, 'file': f'props/{name}.png', 'kind': 'roof-tiles' if art == 'dach' else 'prop', 'width': im.width, 'height': im.height,
                       'frameWidth': fw, 'frameHeight': fh, 'frames': len(frames), **({'frameNames': FRAMES, 'rows': ['kalt', 'warm']} if art == 'dach' else {}),
                       'colors': n, 'zweck': ZWECK[name][0], 'karten': ZWECK[name][1], 'sha256': hashlib.sha256(open(path, 'rb').read()).hexdigest()})
        print(name, len(frames), f'{n} Farben')
    man = {'version': 1, 'batch': 'bh-kulissen', 'city': 'briarholt', 'status': 'eingebaut (src/data/briarholtKulisse2.js)',
           'erzeugt': 'python3 tools/art/bh_kulissen/assets.py (Pillow, pixelweise, deterministisch)', 'palette': 'manifest-briarholt1.json (32 Farben)',
           'alpha': 'binär', 'origin': 'Requisiten unten mittig; Dächer als 16er-Kacheln', 'assets': assets}
    with open(os.path.join(ROOT, 'public', 'sprites', 'manifest-bh-kulissen.json'), 'w', encoding='utf-8') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
