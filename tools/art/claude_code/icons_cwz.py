"""Calderwick-Zirkelstücke (data/calderwickZirkel.js, CWZ_*): eigene Icons in 16 und 32 statt Leihbildern.
Aufruf: python3 icons_cwz.py <items-ordner>   (schreibt <id>.png und 32/<id>.png)
"""
import sys, os
from formen import Teile, M


def setzerbeil(t):
    t.line('holz', [(4, 28), (20, 12)], 3, pts16=[(2, 13), (10, 5)], w16=2)
    t.line('leder', [(4, 28), (9, 23)], 3, pts16=[(2, 13), (4, 11)], w16=2)
    t.line('messing', [(10, 22), (11, 21)], 3, pts16=[(5, 10), (5, 10)], w16=2, level=3)
    t.poly('eisen', [(14, 12), (18, 7), (23, 12), (19, 16)], pts16=[(7, 6), (9, 3), (11, 6), (9, 8)])
    # Bartaxt: Schneide zieht nach unten-rechts, lang und dünn
    t.poly('stahl', [(19, 7), (21, 4), (26, 3), (30, 6), (31, 13), (29, 20), (25, 22), (24, 16), (22, 11)],
           pts16=[(9, 3), (11, 1), (14, 1), (15, 5), (14, 10), (12, 10), (11, 6)])
    t.line('tinte', [(26, 3), (30, 6), (31, 13), (29, 20), (25, 22)], 2, pts16=[(14, 1), (15, 5), (14, 10)], w16=1, level=1, flat=True)
    t.px('stahl', [(23, 7), (24, 9), (25, 12)], pts16=[(12, 3)], level=4)


def quittungsdegen(t):
    t.line('stahl', [(12, 20), (28, 4)], 2, pts16=[(6, 9), (14, 1)], w16=1)
    t.line('stahl', [(13, 20), (28, 5)], 1, pts16=[(7, 9), (14, 2)], w16=1, level=1, flat=True)
    for k in range(3):  # eingeritzte Quittungszeilen
        t.px('tinte', [(17 + k * 3, 15 - k * 3)], pts16=[(9 + k * 2, 6 - k * 2)], level=2)
    t.ell('messing', [(8, 17), (16, 25)], box16=[(4, 8), (8, 12)])
    t.ell('tinte', [(10, 19), (14, 23)], box16=[(5, 9), (7, 11)], level=1, flat=True)
    t.line('leder', [(4, 28), (10, 22)], 3, pts16=[(1, 14), (4, 11)], w16=2)
    t.ell('messing', [(2, 26), (6, 30)], box16=[(0, 13), (2, 15)], level=3)
    t.poly('papier', [(15, 22), (21, 20), (23, 27), (17, 29)], pts16=[(8, 11), (11, 10), (12, 13), (9, 14)])
    t.line('papier', [(17, 23), (21, 22)], 1, pts16=[(9, 12), (10, 11)], level=1, flat=True)
    t.line('papier', [(18, 26), (21, 25)], 1, pts16=[(10, 13), (10, 13)], level=1, flat=True)


def archivlanze(t):
    t.line('holz', [(3, 29), (22, 10)], 3, pts16=[(1, 14), (11, 5)], w16=1)
    for k in range(4):  # gedrechselte Ringe vom Regal
        x = 6 + k * 4
        t.line('holz', [(x, 29 - (x - 3) - 1), (x + 1, 29 - (x - 3) - 2)], 3, pts16=[(2 + k * 2, 13 - k * 2), (2 + k * 2, 13 - k * 2)], w16=1, level=4, flat=True)
    t.poly('stahl', [(20, 9), (26, 3), (30, 1), (28, 6), (23, 12)], pts16=[(10, 4), (13, 1), (15, 0), (14, 3), (11, 6)])
    t.line('stahl', [(22, 10), (29, 2)], 1, pts16=[(11, 5), (14, 1)], level=4, flat=True)
    t.poly('messing', [(18, 10), (21, 13), (23, 11), (20, 8)], pts16=[(9, 5), (10, 6), (11, 5), (10, 4)])
    t.poly('wachs', [(17, 13), (14, 20), (17, 19), (19, 15)], pts16=[(8, 6), (7, 10), (9, 8)])
    t.ell('wachs', [(16, 11), (20, 15)], box16=[(8, 5), (10, 7)], level=3)


def gleishammer(t):
    t.line('holz', [(4, 28), (20, 12)], 3, pts16=[(2, 14), (10, 6)], w16=2)
    t.line('leder', [(4, 28), (9, 23)], 3, pts16=[(2, 14), (4, 12)], w16=2)
    # Kopf quer zum Stiel, wie ein Stück Schiene: Kopfplatte, Steg, Fuß
    t.poly('eisen', [(11, 9), (17, 3), (30, 16), (24, 22)], pts16=[(5, 5), (8, 2), (15, 9), (12, 12)])
    t.poly('eisen', [(16, 3), (18, 1), (31, 14), (30, 16)], pts16=[(8, 2), (9, 1), (15, 7), (15, 9)], level=3)
    t.poly('eisen', [(10, 10), (11, 9), (24, 22), (23, 23)], pts16=[(5, 6), (12, 13), (12, 12), (5, 5)], level=1)
    t.px('glut', [(18, 10), (22, 15), (15, 9), (25, 17)], pts16=[(9, 6), (12, 9)], level=1)  # Rost
    t.px('eisen', [(19, 6), (24, 11), (28, 15)], pts16=[(10, 4)], level=4)


def verbranntes_zepter(t):
    t.line('gold', [(5, 28), (20, 13)], 3, pts16=[(2, 14), (10, 6)], w16=2)
    t.px('russ', [(8, 24), (10, 23), (12, 20), (14, 19), (16, 16), (7, 26)], pts16=[(4, 11), (6, 10), (8, 8)], level=1)
    t.ell('gold', [(3, 26), (8, 31)], box16=[(1, 13), (3, 15)])
    t.poly('gold', [(16, 14), (17, 9), (20, 11), (22, 8), (24, 11), (27, 10), (25, 16), (19, 18)], pts16=[(8, 7), (8, 4), (10, 5), (11, 3), (12, 5), (14, 4), (13, 8), (10, 9)])
    t.ell('glut', [(18, 2), (27, 11)], box16=[(9, 0), (14, 5)])
    t.px('glut', [(20, 4), (21, 4), (20, 5)], pts16=[(10, 1)], level=4)
    t.px('russ', [(25, 9), (24, 10), (17, 16)], pts16=[(13, 4)], level=1)


def aschemantel(t):
    t.poly('asche', [(7, 7), (3, 10), (1, 25), (5, 26), (8, 13)], pts16=[(3, 3), (1, 5), (0, 12), (2, 13), (4, 6)])
    t.poly('asche', [(25, 7), (29, 10), (31, 25), (27, 26), (24, 13)], pts16=[(12, 3), (14, 5), (15, 12), (13, 13), (12, 6)])
    t.poly('asche', [(10, 3), (22, 3), (26, 8), (28, 29), (4, 29), (6, 8)], pts16=[(5, 1), (11, 1), (13, 4), (14, 14), (2, 14), (3, 4)])
    t.poly('asche', [(10, 3), (16, 12), (22, 3), (19, 2), (16, 6), (13, 2)], pts16=[(5, 1), (8, 6), (11, 1), (8, 3)], level=1)
    t.line('asche', [(16, 12), (16, 29)], 1, pts16=[(8, 6), (8, 14)], level=0, flat=True)
    t.line('asche', [(8, 12), (7, 28)], 1, pts16=[(4, 7), (4, 13)], level=1, flat=True)
    t.line('asche', [(24, 12), (25, 28)], 1, pts16=[(12, 7), (12, 13)], level=1, flat=True)
    t.poly('russ', [(4, 26), (8, 28), (11, 25), (14, 28), (18, 26), (22, 29), (25, 26), (28, 28), (28, 30), (4, 30)], pts16=[(2, 13), (5, 14), (8, 13), (11, 14), (14, 13), (14, 15), (2, 15)])
    t.px('glut', [(9, 26), (19, 27), (26, 27), (13, 28)], pts16=[(5, 13), (11, 14)], level=3)
    t.px('glut', [(10, 27), (20, 28)], pts16=[(12, 14)], level=2)
    t.px('messing', [(17, 15), (17, 19), (17, 23)], pts16=[(9, 8), (9, 11)], level=3)


def quittungsrobe(t):
    t.poly('robe', [(7, 7), (3, 10), (1, 25), (5, 26), (8, 13)], pts16=[(3, 3), (1, 5), (0, 12), (2, 13), (4, 6)])
    t.poly('robe', [(25, 7), (29, 10), (31, 25), (27, 26), (24, 13)], pts16=[(12, 3), (14, 5), (15, 12), (13, 13), (12, 6)])
    t.poly('robe', [(11, 2), (21, 2), (25, 7), (28, 30), (4, 30), (7, 7)], pts16=[(5, 1), (10, 1), (12, 3), (14, 15), (2, 15), (3, 3)])
    t.poly('robe', [(11, 2), (16, 10), (21, 2)], pts16=[(5, 1), (8, 5), (10, 1)], level=0)
    t.line('robe', [(16, 10), (16, 30)], 1, pts16=[(8, 5), (8, 15)], level=0, flat=True)
    for (x, y) in [(8, 13), (19, 12), (10, 21), (21, 20), (13, 26), (22, 26)]:
        t.poly('papier', [(x, y), (x + 4, y - 1), (x + 5, y + 3), (x + 1, y + 4)], pts16=[(x // 2, y // 2), (x // 2 + 2, y // 2), (x // 2 + 2, y // 2 + 1), (x // 2, y // 2 + 1)])
        t.px('tinte', [(x + 2, y + 1)], pts16=[(x // 2 + 1, y // 2)], level=3)
    t.line('messing', [(7, 9), (25, 9)], 1, pts16=[(4, 4), (11, 4)], level=2, flat=True)


def fallhut(t):
    t.ell('blei', [(2, 17), (30, 27)], box16=[(1, 8), (15, 13)])
    t.poly('filz', [(9, 8), (12, 5), (20, 5), (23, 8), (24, 21), (8, 21)], pts16=[(4, 4), (6, 2), (10, 2), (12, 4), (12, 10), (4, 10)])
    t.line('leder', [(8, 18), (24, 18)], 2, pts16=[(4, 9), (12, 9)], w16=1)
    t.px('blei', [(5, 21), (26, 23), (12, 25)], pts16=[(3, 11), (13, 11)], level=4)  # Nieten im Blech
    t.line('tinte', [(19, 23), (22, 25), (20, 26)], 1, pts16=[(10, 12), (11, 12)], level=2, flat=True)  # Delle


def setzerzylinder(t):
    t.ell('filz', [(3, 22), (29, 29)], box16=[(1, 11), (15, 14)])
    t.poly('filz', [(9, 3), (23, 3), (24, 24), (8, 24)], pts16=[(4, 1), (11, 1), (12, 12), (4, 12)])
    t.ell('filz', [(9, 1), (23, 5)], box16=[(4, 0), (11, 2)], level=3)
    t.line('blei', [(8, 19), (24, 19)], 4, pts16=[(4, 10), (12, 10)], w16=2)
    for k in range(5):
        t.px('blei', [(10 + k * 3, 18), (10 + k * 3, 20)], pts16=[(5 + k * 1 + k // 2, 9)], level=4)


def kassenamulett(t):
    t.line('kette', [(7, 3), (11, 12), (16, 15), (21, 12), (25, 3)], 1, pts16=[(4, 1), (6, 6), (8, 7), (10, 6), (12, 1)])
    t.ell('gold', [(8, 13), (24, 29)], box16=[(4, 6), (12, 14)])
    t.ell('gold', [(11, 16), (21, 26)], box16=[(6, 8), (10, 12)], level=1)
    t.line('gold', [(16, 18), (16, 24)], 2, pts16=[(8, 9), (8, 11)], w16=1, level=4, flat=True)
    t.line('gold', [(14, 19), (18, 19)], 1, pts16=[(7, 9), (9, 9)], level=4, flat=True)
    t.px('gold', [(11, 15), (10, 17)], pts16=[(5, 7)], level=4)


def glutsiegel(t):
    t.line('kette', [(8, 2), (12, 10), (16, 12), (20, 10), (24, 2)], 1, pts16=[(4, 1), (6, 5), (8, 6), (10, 5), (12, 1)])
    t.ell('messing', [(7, 11), (25, 29)], box16=[(3, 5), (12, 14)])
    t.ell('glut', [(10, 14), (22, 26)], box16=[(5, 7), (10, 12)])
    t.poly('glut', [(16, 15), (19, 20), (16, 25), (13, 20)], pts16=[(8, 8), (9, 10), (8, 11), (7, 10)], level=4, flat=True)
    t.px('glut', [(12, 17), (20, 23)], pts16=[(6, 9)], level=1)


def kronsplitter(t):
    t.poly('gold', [(5, 26), (9, 12), (12, 18), (16, 4), (20, 17), (24, 10), (27, 24), (16, 30)], pts16=[(2, 13), (4, 6), (6, 9), (8, 2), (10, 8), (12, 5), (13, 12), (8, 15)])
    t.line('gold', [(6, 24), (26, 22)], 2, pts16=[(3, 12), (13, 11)], w16=1, level=1)
    t.ell('wachs', [(14, 13), (18, 17)], box16=[(7, 6), (9, 8)], level=3)
    t.px('gold', [(16, 6), (9, 14), (24, 12)], pts16=[(8, 3), (12, 6)], level=4)
    t.line('fleisch', [(16, 30), (21, 27)], 1, pts16=[(8, 15), (10, 14)], level=2, flat=True)  # Bruchkante, schneidet


def aschequittung(t):
    t.poly('papier', [(7, 3), (25, 5), (24, 28), (6, 27)], pts16=[(3, 1), (12, 2), (12, 14), (3, 13)])
    for k in range(5):
        y = 8 + k * 3
        t.line('tinte', [(10, y), (21 - (k % 2) * 3, y + 1)], 1, pts16=[(5, 4 + k * 2 if k < 3 else 4 + k * 2), (10 - (k % 2), 4 + k * 2)] if k < 4 else [(5, 12), (5, 12)], level=2, flat=True)
    t.poly('russ', [(6, 22), (10, 24), (14, 22), (18, 25), (24, 22), (24, 28), (6, 28)], pts16=[(3, 11), (6, 12), (9, 11), (12, 12), (12, 14), (3, 14)])
    t.px('glut', [(10, 24), (18, 25), (22, 24)], pts16=[(6, 12), (10, 12)], level=3)
    t.ell('wachs', [(18, 14), (24, 20)], box16=[(9, 7), (12, 10)])


def fallfeder(t):
    t.line('papier', [(5, 29), (24, 6)], 1, pts16=[(2, 14), (12, 3)], level=2)
    t.poly('feder', [(8, 22), (14, 11), (21, 4), (27, 2), (26, 8), (20, 16), (12, 24)], pts16=[(4, 11), (7, 5), (11, 2), (14, 1), (13, 4), (10, 8), (6, 12)])
    t.line('feder', [(9, 25), (25, 5)], 1, pts16=[(4, 12), (12, 3)], level=4, flat=True)
    t.poly('russ', [(8, 22), (11, 18), (14, 20), (12, 24)], pts16=[(4, 11), (5, 9), (7, 10), (6, 12)])
    t.px('glut', [(11, 21), (13, 19)], pts16=[(5, 10)], level=3)
    t.px('feder', [(17, 13), (22, 9), (14, 17)], pts16=[(9, 7)], level=1)


def kassenbuch(t):
    t.poly('leder', [(5, 6), (25, 3), (28, 26), (8, 29)], pts16=[(2, 3), (12, 1), (14, 13), (4, 14)])
    t.poly('papier', [(8, 29), (28, 26), (28, 28), (9, 31)], pts16=[(4, 14), (14, 13), (14, 14), (4, 15)], level=3)
    for (a, b) in [((5, 6), (9, 10)), ((25, 3), (21, 7)), ((28, 26), (24, 22)), ((8, 29), (12, 25))]:
        t.poly('messing', [a, (b[0], a[1]), b, (a[0], b[1])], pts16=[(a[0] // 2, a[1] // 2), (b[0] // 2, b[1] // 2), (a[0] // 2, b[1] // 2)])
    t.ell('gold', [(13, 12), (21, 20)], box16=[(6, 6), (10, 10)])
    t.px('gold', [(17, 14), (17, 16), (16, 15), (18, 15)], pts16=[(8, 8)], level=4)


def zweiter_fahrschein(t):
    t.poly('gruen', [(3, 10), (28, 6), (30, 20), (5, 25)], pts16=[(1, 5), (14, 3), (15, 10), (2, 12)])
    t.poly('papier', [(6, 12), (25, 9), (26, 16), (7, 19)], pts16=[(3, 6), (12, 5), (13, 8), (4, 9)])
    t.line('tinte', [(9, 14), (19, 12)], 1, pts16=[(4, 7), (9, 6)], level=2, flat=True)
    t.line('tinte', [(9, 17), (15, 16)], 1, pts16=[(5, 8), (8, 8)], level=2, flat=True)
    t.ell('gruen', [(22, 17), (26, 21)], box16=[(11, 9), (13, 11)], level=0, flat=True)  # ungelochtes Feld
    t.px('gold', [(27, 9), (28, 13)], pts16=[(13, 4)], level=4)
    t.line('gruen', [(5, 22), (29, 18)], 1, pts16=[(2, 11), (14, 9)], level=1, flat=True)


def sturzherz(t):
    t.poly('fleisch', [(16, 29), (5, 17), (4, 10), (8, 5), (13, 5), (16, 9), (19, 5), (24, 5), (28, 10), (27, 17)],
           pts16=[(8, 15), (2, 8), (2, 5), (4, 2), (6, 2), (8, 4), (10, 2), (12, 2), (14, 5), (13, 9)])
    # Goldadern: wie Sprünge, von oben nach unten auslaufend
    t.line('gold', [(13, 6), (12, 11), (14, 14), (13, 18)], 1, pts16=[(6, 3), (6, 6), (7, 8)], level=3, flat=True)
    t.line('gold', [(22, 6), (21, 10), (23, 13)], 1, pts16=[(11, 3), (11, 6)], level=3, flat=True)
    t.line('gold', [(8, 13), (10, 16)], 1, pts16=[(4, 7), (4, 7)], level=2, flat=True)
    t.ell('glut', [(14, 15), (21, 22)], box16=[(7, 8), (10, 11)])
    t.px('glut', [(16, 17)], pts16=[(8, 9)], level=4)
    t.px('fleisch', [(7, 8), (8, 7), (20, 7)], pts16=[(3, 4), (10, 3)], level=4)
    t.line('gold', [(16, 9), (16, 4)], 2, pts16=[(8, 4), (8, 1)], w16=1, level=2)  # abgerissene Ader nach oben


ICONS = {
    'cwz_setzerbeil': setzerbeil, 'cwz_quittungsdegen': quittungsdegen, 'cwz_archivlanze': archivlanze, 'cwz_gleishammer': gleishammer,
    'cwz_verbranntes_zepter': verbranntes_zepter, 'cwz_aschemantel': aschemantel, 'cwz_quittungsrobe': quittungsrobe, 'cwz_fallhut': fallhut,
    'cwz_setzerzylinder': setzerzylinder, 'cwz_kassenamulett': kassenamulett, 'cwz_glutsiegel': glutsiegel, 'cwz_kronsplitter': kronsplitter,
    'cwz_aschequittung': aschequittung, 'cwz_fallfeder': fallfeder, 'cwz_kassenbuch': kassenbuch, 'cwz_zweiter_fahrschein': zweiter_fahrschein,
    'cwz_sturzherz': sturzherz,
}


def bauen(fid, size):
    t = Teile(size)
    ICONS[fid](t)
    return t.render()


if __name__ == '__main__':
    od = sys.argv[1]
    os.makedirs(os.path.join(od, '32'), exist_ok=True)
    for fid in ICONS:
        bauen(fid, 16).save(os.path.join(od, f'{fid}.png'))
        bauen(fid, 32).save(os.path.join(od, '32', f'{fid}.png'))
