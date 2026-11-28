"""Zehn eigene Icons (16 und 32) für Fundstücke der Nebelseite, die bisher paarweise dasselbe fremde Bild trugen
(Briefumschlag, Laterne, Schuh, Koffer, Schirm, Bildnis, Spiegel, Torbogen, Nebelhaufen – nichts davon passte zum Text).
python3 tools/art/nsi_icons/icons.py  ->  public/sprites/items/<id>.png (16x16) und items/32/<id>.png (32x32), manifest-nsi-icons.json
Palette manifest-halbgott.json (Codex-Palette), binäres Alpha, Umriss #1a1c2c, Licht oben links.
Jedes Stück trägt unten einen kleinen Nebelhauch (Kennzeichen der Nebelseite). 16er werden eigens gesetzt, nicht verkleinert."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'kampf_eigen'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import figuren as F
from figuren import px_kapsel, px_ellipse, px_poly, teil, R, OUT
from pinsel import Bild, h3, ROOT
import pinsel

MESSING = [9, 3, 4, 14]
PAPIER = [12, 13, 17, 22]
EISEN = [1, 2, 16, 19, 20, 18]
GLAS = [16, 19, 20, 21, 18, 22]
SILBER = [2, 16, 19, 20, 21, 18]
TORF = [6, 8, 5, 15, 13, 17]
SEIL = [6, 8, 5, 12, 13, 17]
ROTLACK = [7, 23, 30, 31]


def nebel(b, n, x0=None, y0=None, breit=None):
    """Nebelhauch unten: gerasterte helle Fahne, ohne Umriss"""
    s = n / 32
    x0 = int((x0 if x0 is not None else 6) * s); y0 = int((y0 if y0 is not None else 28) * s)
    w = int((breit or 20) * s)
    for x in range(x0, x0 + w):
        for dy in range(0, 2 if n == 32 else 1):
            y = y0 + dy + (1 if (x // max(1, int(5 * s))) % 2 else 0)
            if 0 <= x < n and 0 <= y < n and b.get(x, y) is None and (x + 2 * dy) % 3 == 0:
                b.set(x, y, 21 if dy == 0 else 19)


def S(n, *v):
    s = n / 32
    return [a * s for a in v]


# --- die zehn Stücke ---------------------------------------------------------------------------------------------------------------
def marktgewicht(n):
    """Eisernes Marktgewicht (Trapez mit Griffloch), die vertiefte Zahlenfläche ist leer; schwebt über seinem Schatten"""
    b = Bild(n, n, 11)
    G = [1, 2, 16, 19, 20]
    if n == 32:
        koerper = px_poly([(10, 6), (22, 6), (27, 25), (5, 25)])
        for (x, y) in px_ellipse(16, 10.5, 3.6, 2.4):                # Griffloch
            koerper.pop((x, y), None)
        teil(b, koerper, G, 0.2, 1, dv=0.1)
        for y in range(7, 25):
            b.set(int(10 - (y - 6) * 0.26), y, 20 if y % 3 else 19)   # Kante links hell
        for x in range(6, 27):
            b.set(x, 24, 1)
        for y in range(16, 22):                                       # vertiefte, leere Zahlenfläche
            for x in range(12, 21):
                b.set(x, y, 2 if (y in (16, 21) or x in (12, 20)) else 16)
        for x in range(13, 20):
            b.set(x, 17, 1)
    else:
        koerper = px_poly([(5, 3), (11, 3), (14, 13), (2, 13)])
        for (x, y) in ((7, 5), (8, 5), (7, 6), (8, 6)):
            koerper.pop((x, y), None)
        teil(b, koerper, G, 0.15, 1, kante=False, dv=0.1)
        for y in range(4, 13):
            b.set(int(5 - (y - 3) * 0.33), y, 20)
        for x in range(6, 10):
            b.set(x, 9, 2); b.set(x, 10, 16)
    b.umriss(OUT)
    if n == 32:
        for x in range(7, 26):
            if x % 2 == 0:
                b.set(x, 28, 2)
    else:
        for x in range(4, 13, 2):
            b.set(x, 15, 2)
    nebel(b, n, 7, 29, 18) if n == 32 else None
    return b


def quittung(n):
    """Quittungszettel, leicht gerollt: Zeilen, roter Stempel, leere Unterschriftszeile"""
    b = Bild(n, n, 12)
    if n == 32:
        teil(b, px_poly([(6, 5), (24, 4), (26, 26), (8, 28)]), PAPIER, 0.15, 1)
        teil(b, px_kapsel((24, 4), (26, 26), 1.6), PAPIER, 0.1, 2, dv=-0.15)   # eingerollte Kante
        for y, (a, e) in ((9, (9, 21)), (12, (9, 18)), (15, (10, 22)), (18, (10, 16))):
            for x in range(a, e):
                if x % 4 != 3:
                    b.set(x, y + (x - 6) // 12, 2)
        for t in range(0, 12):                                       # Unterschriftszeile mit Lücke
            if t < 3 or t > 8:
                b.set(11 + t, 24, 1)
        teil(b, px_ellipse(19.5, 20.5, 3.2, 3.0), ROTLACK, 0.1, 3, kante=False)
        b.set(19, 20, 31); b.set(20, 21, 7)
    else:
        teil(b, px_poly([(3, 2), (12, 2), (13, 13), (4, 14)]), PAPIER, 0.1, 1, kante=False)
        for y in (5, 7, 9):
            for x in range(5, 11):
                if x % 3:
                    b.set(x, y, 2)
        b.set(5, 12, 1); b.set(6, 12, 1); b.set(10, 12, 1)
        b.set(10, 10, 23); b.set(11, 10, 30); b.set(10, 11, 30)
    b.umriss(OUT)
    nebel(b, n, 4, 29, 22)
    return b


def torfkern(n):
    """Bohrkern aus hellem Torf, aufrecht: Schichten unterschiedlich dick, Oberseite mit hellem Kern, grauer Staub"""
    b = Bild(n, n, 13)
    if n == 32:
        teil(b, px_poly([(10, 7), (22, 7), (22, 25), (10, 25)]), TORF, 0.25, 1, dv=0.05)
        teil(b, px_ellipse(16, 25, 6, 2.2), TORF, 0.2, 2, kante=False, dv=-0.1)
        lagen = [(10, 8), (11, 6), (14, 8), (15, 6), (18, 8), (20, 6), (21, 8), (23, 6)]
        for y, c in lagen:                                           # Schichten, leicht gewellt
            for x in range(10, 23):
                yy = y + (1 if (x // 4) % 2 and y % 2 else 0)
                if b.get(x, yy) not in (None, OUT):
                    b.set(x, yy, c)
        for y in range(8, 25):
            b.set(10, y, 17) if y % 4 else None
        teil(b, px_ellipse(16, 7, 6, 2.2), [5, 15, 13, 17], 0.15, 3, kante=False, dv=0.1)
        b.set(15, 7, 21); b.set(16, 7, 22); b.set(17, 7, 21)
        for (x, y) in ((7, 27), (24, 26), (8, 25), (25, 28)):
            b.set(x, y, 19)
    else:
        teil(b, px_poly([(5, 4), (11, 4), (11, 13), (5, 13)]), TORF, 0.2, 1, kante=False, dv=0.05)
        for y, c in ((6, 8), (8, 6), (10, 8), (11, 6)):
            for x in range(5, 12):
                b.set(x, y, c)
        for x in range(6, 11):
            b.set(x, 3, 13)
        b.set(8, 3, 22); b.set(5, 5, 17); b.set(5, 9, 17)
    b.umriss(OUT)
    nebel(b, n, 6, 29, 20)
    return b


def glaskeil(n):
    """Keil aus kaltem Glas: dickes Ende rechts, Schneide links unten, Oberseite hell, ein stehender Lichtpunkt"""
    b = Bild(n, n, 14)
    if n == 32:
        teil(b, px_poly([(4, 26), (23, 7), (28, 11), (25, 24)]), GLAS, 0.12, 1, dv=0.0)
        teil(b, px_poly([(4, 26), (23, 7), (25, 9), (8, 25)]), GLAS[2:], 0.08, 2, kante=False, dv=0.15)   # Oberseite
        for t in range(0, 19):
            b.set(5 + t, 25 - t, 22 if t % 4 else 18)               # Schneide hell
        for y in range(12, 24):
            b.set(26, y, 19)
        for (x, y) in ((21, 12), (12, 21), (24, 16)):                # Reif
            b.set(x, y, 22)
    else:
        teil(b, px_poly([(2, 13), (11, 3), (14, 6), (12, 12)]), GLAS, 0.1, 1, kante=False)
        for t in range(0, 10):
            b.set(2 + t, 12 - t, 22 if t % 3 else 18)
        for y in range(6, 12):
            b.set(13, y, 19)
    b.umriss(OUT)
    if n == 32:
        F.glow(b, 18.5, 17.5, 2.6, [14, 22], 1.0)
        b.set(18, 17, 22)
    else:
        b.set(9, 8, 22); b.set(10, 8, 14)
    nebel(b, n, 12, 29, 16)
    return b


def fingerhut(n):
    """Silberner Fingerhut, Öffnung oben, runder Boden, Grübchen, Randwulst; Sternenstaub fällt nach oben heraus"""
    b = Bild(n, n, 15)
    if n == 32:
        koerper = px_poly([(10, 15), (22, 15), (22, 21), (10, 21)])
        koerper.update(px_ellipse(16, 21, 6, 5.5))
        teil(b, koerper, SILBER, 0.12, 1, dv=0.18)
        teil(b, px_ellipse(16, 15, 6.6, 2.2), SILBER, 0.1, 2, kante=False, dv=0.25)    # Randwulst
        teil(b, px_ellipse(16, 15, 4.8, 1.3), [1, 2], 0.1, 3, kante=False)            # Öffnung
        for y in range(18, 26, 2):
            for x in range(12 + (y % 4 == 0), 21, 2):
                if b.get(x, y) not in (None, OUT) and math.hypot(x + 0.5 - 16, max(0, y + 0.5 - 21) * 1.1) < 5:
                    b.set(x, y, 16)
        for y in range(16, 24):
            b.set(11, y, 18) if y % 2 else None
        b.umriss(OUT)
        for i in range(12):                                           # Staub steigt in einer Säule
            x = int(16 + (h3(i, 1, 5) - 0.5) * (4 + i)); y = int(12 - i * 0.9)
            b.set(x, y, 14 if i % 3 else 22)
    else:
        koerper = px_poly([(5, 8), (11, 8), (11, 10), (5, 10)])
        koerper.update(px_ellipse(8, 10.5, 3, 2.8))
        teil(b, koerper, SILBER, 0.1, 1, kante=False, dv=0.18)
        for x in range(5, 12):
            b.set(x, 8, 20)
        b.set(7, 8, 2); b.set(8, 8, 2); b.set(9, 8, 2)
        b.set(7, 11, 16); b.set(9, 11, 16); b.set(8, 10, 16)
        b.umriss(OUT)
        for (x, y, c) in ((8, 5, 14), (7, 3, 22), (9, 2, 14), (8, 1, 4)):
            b.set(x, y, c)
    return b


def glockenzunge(n):
    """Klöppel einer Glocke, schräg: Öse, dünne Stange, runde Kugel; die Kugel blank, wo sie nie anschlug"""
    b = Bild(n, n, 16)
    if n == 32:
        ring = {k: v for k, v in px_ellipse(8, 7, 3.4, 3.4).items() if math.hypot(k[0] + 0.5 - 8, k[1] + 0.5 - 7) > 1.7}
        teil(b, ring, EISEN, 0.1, 2, kante=False)
        teil(b, px_kapsel((10, 9.5), (18.5, 18.5), 1.1), EISEN, 0.12, 1)
        teil(b, px_ellipse(21.5, 21.5, 5.0, 5.0), EISEN, 0.2, 3)
        for (x, y) in px_ellipse(19.3, 19.3, 1.8, 1.8):              # blanke Stelle
            b.set(x, y, 22 if (x + y) % 3 else 18)
    else:
        for (x, y) in ((3, 2), (4, 2), (2, 3), (5, 3), (3, 4), (4, 4)):
            b.set(x, y, 19)
        teil(b, px_kapsel((5, 5), (9, 9), 0.6), EISEN, 0.1, 1, kante=False)
        teil(b, px_ellipse(11, 11, 2.7, 2.7), EISEN, 0.15, 3, kante=False)
        b.set(10, 10, 22)
    b.umriss(OUT)
    nebel(b, n, 4, 29, 14)
    return b


def nagel(n):
    """Geschmiedeter Nagel; der Kopf sitzt seitlich versetzt auf dem Schaft, ohne sich zu lösen (Nebelnaht)"""
    b = Bild(n, n, 17)
    if n == 32:
        teil(b, px_kapsel((14, 9), (14, 28), 1.9, 0.5), EISEN, 0.15, 1)
        teil(b, px_ellipse(19.5, 7.5, 5.4, 2.0), EISEN, 0.12, 2)
        teil(b, px_ellipse(19.0, 6.8, 3.4, 0.9), EISEN[2:], 0.1, 3, kante=False)
        for y in range(12, 27, 3):
            b.set(14, y, 2)
    else:
        teil(b, px_kapsel((7, 5), (7, 14), 1.0, 0.4), EISEN, 0.1, 1, kante=False)
        teil(b, px_ellipse(10, 3.8, 3, 1.1), EISEN, 0.1, 2, kante=False)
        b.set(9, 3, 20); b.set(10, 3, 20)
    b.umriss(OUT)
    if n == 32:
        for (x, y) in ((13, 9), (14, 10), (15, 9)):                  # Nebelnaht zwischen Kopf und Schaft
            b.set(x, y, 21)
        for (x, y) in ((10, 6), (9, 7), (10, 8)):                    # wo der Kopf sitzen müsste
            if b.get(x, y) is None:
                b.set(x, y, 21)
    else:
        b.set(7, 5, 21)
    nebel(b, n, 8, 29, 14)
    return b


def signalscheibe(n):
    """Signalkelle: runde Scheibe am Stiel, eine Hälfte hell, die andere dunkel"""
    b = Bild(n, n, 18)
    if n == 32:
        teil(b, px_kapsel((18, 19), (25, 28), 1.5), R['holz'], 0.15, 1)
        scheibe = px_ellipse(14, 13, 8.5, 8.5)
        teil(b, scheibe, [22], 0.0, 2)
        for (x, y) in scheibe:
            if x + 0.5 > 14 + (y + 0.5 - 13) * 0.3:
                b.ton(x, y, [7, 23, 30], 0.6 - 0.05 * (x - 14), 0.15, 3)
            else:
                b.ton(x, y, [17, 22, 22], 0.8, 0.1, 4)
        for (x, y) in scheibe:                                        # Rand
            if any((x + a, y + c) not in scheibe for a, c in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                b.set(x, y, 16)
        teil(b, px_ellipse(14, 13, 1.4, 1.4), MESSING, 0.1, 5, kante=False)
    else:
        teil(b, px_kapsel((9, 9.5), (12.5, 14), 0.8), R['holz'], 0.1, 1, kante=False)
        scheibe = px_ellipse(7, 6.5, 4.5, 4.5)
        for (x, y) in scheibe:
            b.set(x, y, 23 if x + 0.5 > 7 + (y + 0.5 - 6.5) * 0.3 else 22)
        for (x, y) in scheibe:
            if any((x + a, y + c) not in scheibe for a, c in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                b.set(x, y, 16)
        b.set(7, 6, 3)
    b.umriss(OUT)
    nebel(b, n, 3, 28, 14)
    return b


def waagschale(n):
    """Leere Waagschale an drei Ketten mit Ring, liegt waagrecht"""
    b = Bild(n, n, 19)
    if n == 32:
        for (ax, ay) in ((6, 21), (16, 22), (26, 21)):                # Ketten
            for t in range(0, 13):
                x = int(round(16 + (ax - 16) * t / 13)); y = int(round(6 + (ay - 6) * t / 13))
                b.set(x, y, 20 if t % 2 else 16)
        teil(b, px_ellipse(16, 4.5, 2.2, 2.2), MESSING, 0.1, 1, kante=False)
        b.set(16, 4, None)
        teil(b, px_poly([(4, 21), (28, 21), (25, 26), (7, 26)]), MESSING, 0.15, 2)
        teil(b, px_ellipse(16, 21, 12, 2.2), [9, 3, 4], 0.1, 3, kante=False, dv=-0.1)
        for x in range(6, 26):
            b.set(x, 21, 9 if x % 5 else 3)
        for x in range(8, 13):
            b.set(x, 23, 14)
    else:
        for (ax, ay) in ((3, 10), (8, 11), (13, 10)):
            for t in range(0, 7):
                x = int(round(8 + (ax - 8) * t / 7)); y = int(round(3 + (ay - 3) * t / 7))
                b.set(x, y, 20 if t % 2 else 16)
        b.set(8, 2, 3)
        teil(b, px_poly([(2, 10), (14, 10), (12, 13), (4, 13)]), MESSING, 0.1, 2, kante=False)
        for x in range(3, 13):
            b.set(x, 10, 9)
        b.set(5, 11, 14); b.set(6, 11, 14)
    b.umriss(OUT)
    nebel(b, n, 6, 29, 20)
    return b


def seilknoten(n):
    """Endloser Seilknoten (Ring aus geflochtenem Tau), trocken, ohne Enden"""
    b = Bild(n, n, 20)
    r_aus, r_in = (11.5, 7.0) if n == 32 else (6.0, 3.6)
    c = n / 2
    ring = {}
    for (x, y), v in px_ellipse(c, c - (1 if n == 32 else 0.5), r_aus, r_aus * 0.92).items():
        d = math.hypot((x + 0.5 - c) / r_aus, (y + 0.5 - c + (1 if n == 32 else 0.5)) / (r_aus * 0.92))
        if d * r_aus >= r_in:
            ring[(x, y)] = v
    teil(b, ring, SEIL, 0.15, 1)
    for (x, y) in ring:                                               # Litzen: schräge dunkle Striche
        if (x + 2 * y) % (4 if n == 32 else 3) == 0 and b.get(x, y) != SEIL[0]:
            b.set(x, y, 8)
    if n == 32:                                                       # Kreuzung (Knoten oben)
        teil(b, px_kapsel((12, 5), (20, 9), 2.4), SEIL, 0.1, 2)
        teil(b, px_kapsel((20, 5), (12, 9), 2.4), SEIL, 0.1, 3)
        b.set(14, 6, 6); b.set(18, 8, 6)
    else:
        b.set(6, 2, 13); b.set(7, 3, 8); b.set(9, 2, 13); b.set(8, 3, 6)
    b.umriss(OUT)
    nebel(b, n, 8, 29, 16)
    return b


ICONS = {
    'nsi_altmarkt_1': (marktgewicht, 'Marktgewicht ohne Zahl', 'nsi_flossfriedhof_2 (Briefumschlag)'),
    'nsi_altmarkt_2': (quittung, 'Unbezahlte Quittung', 'nsi_torfbrueche_1 (Laterne)'),
    'nsi_torfbrueche_1': (torfkern, 'Heller Torfkern', 'nsi_altmarkt_2 (Laterne)'),
    'nsi_sternwarte_1': (glaskeil, 'Kalter Glaskeil', 'nsi_torfbrueche_2 (Schuh)'),
    'nsi_sternwarte_2': (fingerhut, 'Sternenstaub im Fingerhut', 'nsi_bahnhof_1 (Koffer)'),
    'nsi_katakomben_1': (glockenzunge, 'Ungeschlagene Glockenzunge', 'nsi_bahnhof_2 (Schirm)'),
    'nsi_schwellenring_1': (nagel, 'Versetzter Nagel', 'nsi_katakomben_2 (Bildnis)'),
    'nsi_schwellenring_2': (signalscheibe, 'Stumme Signalscheibe', 'nsi_salzmarkt_1 (Spiegel)'),
    'nsi_salzmarkt_2': (waagschale, 'Leere Waagschale', 'nsi_speisewagen_1 (Torbogen)'),
    'nsi_flossfriedhof_1': (seilknoten, 'Trockener Seilknoten', 'nsi_speisewagen_2 (Nebelhaufen)'),
}

if __name__ == '__main__':
    od = os.path.join(ROOT, 'public', 'sprites', 'items')
    os.makedirs(os.path.join(od, '32'), exist_ok=True)
    pal = set(pinsel.PAL)
    assets = []
    for key, (fn, name, vorher) in ICONS.items():
        eintrag = {'id': key, 'name': name, 'bisher_wie': vorher}
        for n, sub in ((16, ''), (32, '32/')):
            im = fn(n).image()
            data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
            assert all(px[3] in (0, 255) and (px[3] == 0 or px[:3] in pal) for px in data), key
            p = os.path.join(od, sub + key + '.png')
            im.save(p)
            eintrag['file%d' % n] = 'items/' + sub + key + '.png'
            eintrag['sha256_%d' % n] = hashlib.sha256(open(p, 'rb').read()).hexdigest()
        assets.append(eintrag)
        print(key)
    json.dump({'version': 1, 'batch': 'nsi-icons', 'palette': 'manifest-halbgott.json', 'erzeugt': 'python3 tools/art/nsi_icons/icons.py', 'assets': assets},
              open(os.path.join(ROOT, 'public', 'sprites', 'manifest-nsi-icons.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
