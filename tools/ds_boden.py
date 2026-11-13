"""Zeichnet ruhige Dunscar-Bodenkacheln (Pflaster, Gehweg) per Skript in ds_stadt.png.
Ersetzt nur Bodenzellen 0-7 und Gehwegzellen 24-31; Wände, Fenster, Türen bleiben.
Aufruf: python3 tools/ds_boden.py  (Original wird beim ersten Lauf als tools/ds_stadt_alt.png gesichert)"""
import os, random
from PIL import Image

T = 16
BASE = os.path.join(os.path.dirname(__file__), '..', 'public', 'sprites', 'tilesets')
SRC = os.path.join(BASE, 'ds_stadt.png')
ALT = os.path.join(os.path.dirname(__file__), 'ds_stadt_alt.png')

def hx(c): return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
FUGE, DUNKEL, STEIN, HELL, LICHT = map(hx, ['#252b38', '#303b49', '#425360', '#586c78', '#71858b'])
MOOS1, MOOS2 = hx('#494b3a'), hx('#686850')
OCKER = list(map(hx, ['#58433c', '#715648', '#92745a']))
PLATTE = list(map(hx, ['#425360', '#586c78', '#71858b', '#95a5a5']))
KANTE = list(map(hx, ['#71858b', '#95a5a5', '#a8b4c0', '#303b49']))

def pflaster(seed, farben=(DUNKEL, STEIN, HELL), fuge=FUGE):
    farben = tuple(farben)
    """Reihen aus Pflastersteinen, 4 px hoch, versetzt, nahtlos kachelbar."""
    r = random.Random(seed)
    px = [[fuge] * T for _ in range(T)]
    for row in range(4):
        y0 = row * 4
        x = (row % 2) * 3 + r.randint(0, 1)
        breiten = []
        rest = T
        while rest > 0:
            b = min(rest, r.choice([4, 5, 5, 6]))
            if 0 < rest - b < 3: b = rest
            breiten.append(b); rest -= b
        for b in breiten:
            ton = 1 if r.random() < 0.85 else 0
            schatten, mitte, licht = farben[max(0, ton - 1)], farben[ton], farben[min(len(farben) - 1, ton + 1)]
            for dx in range(b - 1):
                for dy in range(3):
                    xx, yy = (x + dx) % T, y0 + dy
                    c = mitte
                    if dy == 0 and 1 <= dx <= 2: c = licht      # kleiner Glanzpunkt oben links
                    if dy == 2 and dx >= 1: c = schatten
                    if dx == b - 2 and dy == 2: c = fuge         # runde Ecke
                    if dx == 0 and dy == 2: c = schatten
                    px[yy][xx] = c
            x += b
    return px

def risse(px, seed, n=1):
    r = random.Random(seed)
    for _ in range(n):
        x, y = r.randint(2, 13), r.randint(2, 13)
        for _ in range(r.randint(4, 7)):
            px[y % T][x % T] = FUGE
            x += r.choice([-1, 0, 1]); y += r.choice([0, 1])
    return px

def moos(px, seed):
    r = random.Random(seed)
    for y in range(T):
        for x in range(T):
            if px[y][x] == FUGE and r.random() < 0.22:
                px[y][x] = MOOS2 if r.random() < 0.35 else MOOS1
    return px

def platten(seed, kanten=''):
    """Gehweg: große 8x8-Platten, Bordstein (3 px) an den genannten Seiten (N/S/W/E)."""
    r = random.Random(seed)
    px = [[FUGE] * T for _ in range(T)]
    for by in (0, 8):
        for bx in (0, 8):
            ton = r.choice([1, 1, 2])
            for dy in range(7):
                for dx in range(7):
                    c = PLATTE[ton]
                    if dy == 0 or dx == 0: c = PLATTE[ton + 1]
                    if dy == 6 or dx == 6: c = PLATTE[ton - 1]
                    px[by + dy][bx + dx] = c
            if r.random() < 0.3:
                px[by + r.randint(2, 4)][bx + r.randint(2, 4)] = PLATTE[ton - 1]
    def kante(x, y, d):
        # d: 0 = Außenseite (dunkle Schattenkante), 1/2 = Steinoberseite
        px[y][x] = [KANTE[3], KANTE[2], KANTE[1]][d]
    for i in range(T):
        for d in range(3):
            if 'N' in kanten: kante(i, d, [1, 2, 0][d])
            if 'S' in kanten: kante(i, T - 1 - d, [0, 1, 2][d])
            if 'W' in kanten: kante(d, i, [1, 2, 0][d])
            if 'E' in kanten: kante(T - 1 - d, i, [0, 2, 1][d])
    return px

def setze(im, zelle, px):
    cx, cy = (zelle % 8) * T, (zelle // 8) * T
    for y in range(T):
        for x in range(T):
            im.putpixel((cx + x, cy + y), px[y][x])

def main():
    if not os.path.exists(ALT):
        Image.open(SRC).save(ALT)
    im = Image.open(ALT).convert('RGBA')
    for z, seed in ((0, 11), (1, 12), (2, 13)):
        setze(im, z, pflaster(seed))
    setze(im, 3, platten(14))                                # Straßenkreuzung: Platten ohne Kante
    setze(im, 4, platten(21))                                # Kalkplatz: helle Platten
    setze(im, 5, risse(pflaster(15), 5, 2))                  # gesprungen
    setze(im, 6, moos(pflaster(16), 6))                      # Moos in den Fugen
    setze(im, 7, pflaster(17, tuple(OCKER), hx('#2d2629')))  # Ocker/Lehm
    for z, k in zip(range(24, 32), ['N', 'S', 'W', 'E', 'NW', 'NE', 'SW', 'SE']):
        setze(im, z, platten(30 + z, k))
    im.save(SRC)

if __name__ == '__main__':
    main()
