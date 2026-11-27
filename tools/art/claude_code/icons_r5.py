"""Runde 5: letzte Leihbild-Icons durch eigene ersetzen, je 16 und 32.
Dunscar-Vorräte (dsh_*), Post-Beilagen (post_*), Calderwicker Fundstücke von oben (cwf_*).
Aufruf: python3 icons_r5.py <items-ordner>
"""
import sys, os
from formen import Teile

GLAS = [(40, 52, 62), (66, 84, 96), (110, 132, 140), (170, 190, 192), (220, 232, 230)]
KORK = [(60, 42, 30), (98, 70, 46), (138, 102, 66), (170, 132, 90), (200, 166, 120)]
TON = [(60, 36, 28), (100, 58, 40), (142, 86, 56), (176, 116, 78), (206, 150, 106)]
HONIG = [(60, 30, 14), (104, 56, 20), (150, 92, 30), (196, 136, 48), (232, 184, 90)]
MILCH = [(120, 120, 116), (168, 166, 158), (206, 204, 194), (232, 230, 220), (248, 246, 238)]
TEE = [(40, 54, 34), (60, 80, 46), (86, 110, 60), (118, 140, 78), (150, 168, 100)]
BLAU = [(34, 34, 66), (52, 50, 98), (78, 74, 134), (110, 106, 168), (150, 146, 200)]
TUERKIS = [(30, 70, 70), (46, 110, 106), (74, 160, 150), (111, 224, 208), (190, 246, 236)]
AMBER = [(80, 30, 20), (130, 52, 28), (180, 84, 36), (218, 128, 52), (244, 180, 96)]
BROT = [(54, 34, 24), (86, 54, 34), (120, 78, 46), (152, 104, 62), (184, 138, 86)]
KAESE = [(120, 98, 50), (164, 136, 70), (204, 176, 100), (228, 206, 138), (246, 232, 176)]
EMAILLE = [(30, 38, 50), (44, 58, 74), (64, 84, 104), (94, 116, 134), (140, 160, 170)]
SAMT = [(40, 18, 34), (66, 28, 54), (96, 42, 78), (128, 62, 104), (160, 92, 132)]
ELFENBEIN = [(130, 116, 92), (172, 158, 130), (210, 198, 170), (232, 224, 200), (248, 244, 228)]
ONYX = [(20, 20, 26), (32, 30, 38), (46, 44, 52), (62, 60, 70), (84, 82, 92)]
PORZ = [(110, 116, 130), (160, 166, 178), (204, 208, 216), (230, 232, 236), (250, 250, 252)]
ROT = [(70, 20, 24), (116, 32, 36), (160, 50, 48), (196, 76, 64), (224, 116, 96)]


def flasche(t, fluessig, glas=GLAS, form='rund', kork=True, etikett=None, siegel=None):
    if form == 'rund':
        t.ell(glas, [(7, 11), (25, 29)])
        t.poly(glas, [(13, 4), (19, 4), (19, 13), (13, 13)])
        t.ell(fluessig, [(9, 16), (23, 28)])
    elif form == 'schmal':
        t.poly(glas, [(10, 10), (22, 10), (23, 29), (9, 29)])
        t.poly(glas, [(13, 3), (19, 3), (19, 11), (13, 11)])
        t.poly(fluessig, [(11, 15), (21, 15), (22, 28), (10, 28)])
    elif form == 'phiole':
        t.poly(glas, [(11, 7), (21, 7), (21, 27), (16, 30), (11, 27)])
        t.poly(fluessig, [(12, 15), (20, 15), (20, 26), (16, 29), (12, 26)])
    if kork:
        t.poly(KORK, [(12, 1), (20, 1), (20, 5), (12, 5)] if form != 'phiole' else [(12, 3), (20, 3), (20, 8), (12, 8)])
    if siegel:
        t.poly(siegel, [(11, 4), (21, 4), (22, 8), (10, 8)], level=None)
    if etikett:
        t.poly(etikett, [(10, 18), (22, 18), (22, 24), (10, 24)] if form != 'rund' else [(10, 19), (22, 19), (22, 24), (10, 24)])
    t.line(glas, [(10, 14), (10, 22)] if form == 'schmal' else [(10, 15), (10, 20)], 1, level=4, flat=True)  # Glanz


PROFIL = [(10, 10), (14, 6), (18, 6), (21, 9), (21, 12), (25, 15), (22, 16), (23, 17), (22, 18), (23, 19), (22, 21), (19, 22), (19, 26), (13, 27), (13, 22), (10, 18), (9, 14)]


# --- Dunscar-Vorräte -------------------------------------------------------------------------------------------
def verbandrolle(t):
    t.poly('papier', [(4, 12), (20, 6), (26, 22), (10, 28)])
    t.ell('papier', [(17, 4), (29, 24)], level=3)
    t.ell('papier', [(20, 8), (26, 20)], level=2)
    t.ell('papier', [(22, 11), (24, 17)], level=0, flat=True)
    t.poly('papier', [(6, 24), (11, 27), (7, 31), (2, 29)], level=2)
    for k in range(3):
        t.line('papier', [(8 + k * 4, 11 - k), (13 + k * 4, 26 - k)], 1, level=1, flat=True)


def schichttonikum(t):
    flasche(t, [(20, 16, 14), (34, 26, 22), (52, 40, 32), (70, 54, 42), (92, 72, 54)], glas=[(44, 34, 26), (74, 56, 40), (110, 84, 58), (150, 118, 82), (190, 160, 120)],
            form='schmal')
    t.poly('papier', [(11, 19), (21, 19), (21, 23), (11, 23)])
    t.line('tinte', [(13, 21), (19, 21)], 1, level=2, flat=True)


def kalkelixier(t):
    t.ell(GLAS, [(5, 11), (27, 31)])
    t.poly(GLAS, [(13, 1), (19, 1), (19, 13), (13, 13)])
    t.ell(MILCH, [(7, 16), (25, 30)])
    t.line(GLAS, [(9, 16), (9, 22)], 1, level=4, flat=True)
    t.px(MILCH, [(12, 19), (13, 18)], level=4)
    t.line('kette', [(13, 9), (19, 9)], 1, level=3, flat=True)


def honigtopf(t):
    t.ell(TON, [(5, 10), (27, 30)])
    t.poly(TON, [(9, 7), (23, 7), (24, 12), (8, 12)], level=3)
    t.poly('papier', [(7, 3), (25, 3), (27, 9), (5, 9)])  # Tuch als Deckel
    t.line('leder', [(6, 9), (26, 9)], 2, level=1)
    t.poly(HONIG, [(10, 12), (14, 12), (13, 20), (11, 21)])
    t.ell(HONIG, [(10, 19), (14, 23)])
    t.px(TON, [(19, 16), (20, 17)], level=4)


def bruchriechsalz(t):
    flasche(t, MILCH, form='phiole')
    t.px(MILCH, [(14, 18), (17, 21), (15, 24), (18, 17)], level=1)
    t.px('asche', [(13, 20), (18, 24)], level=2)


def wachtrank(t):
    flasche(t, AMBER, form='schmal', kork=False, siegel='wachs')
    t.px(AMBER, [(13, 18), (14, 17)], level=4)


def stellwerktee(t):
    t.poly('blei', [(7, 7), (25, 7), (25, 28), (7, 28)])
    t.ell('blei', [(7, 4), (25, 10)], level=3)
    t.poly(TEE, [(9, 15), (23, 15), (23, 21), (9, 21)])  # Banderole
    t.line('tinte', [(11, 18), (21, 18)], 1, level=1, flat=True)
    t.poly(TEE, [(23, 25), (30, 23), (31, 28), (24, 30)])  # verstreute Blätter
    t.px(TEE, [(28, 25), (26, 27)], level=4)


def stillschlaf(t):
    t.poly(BLAU, [(10, 13), (22, 13), (23, 29), (9, 29)])
    t.poly(BLAU, [(9, 18), (23, 18), (23, 26), (9, 26)], level=1)
    t.poly('filz', [(13, 9), (19, 9), (19, 14), (13, 14)])
    t.ell('leder', [(12, 1), (20, 9)])  # Pipettenball
    t.line(BLAU, [(11, 15), (11, 24)], 1, level=4, flat=True)
    t.px('papier', [(16, 30)], level=4)


def geisterblume(t):
    flasche(t, TUERKIS, form='rund')
    t.poly(PORZ, [(16, 17), (19, 20), (16, 25), (13, 20)])  # Blüte im Destillat
    t.px(PORZ, [(16, 20)], level=4)


def reisebrot(t):
    t.ell(BROT, [(3, 9), (29, 27)])
    for x in (9, 15, 21):
        t.line(BROT, [(x, 12), (x + 3, 22)], 1, level=4, flat=True)
    t.px(BROT, [(7, 12), (12, 11)], level=4)


def hartkaese(t):
    t.poly(KAESE, [(3, 22), (26, 8), (29, 13), (29, 25), (5, 27)])
    t.poly(KAESE, [(3, 22), (26, 8), (29, 13), (6, 26)], level=3)
    t.line(KAESE, [(29, 13), (29, 25)], 2, level=0)
    for p in [(12, 22), (19, 21), (24, 18)]:
        t.ell(KAESE, [(p[0] - 1, p[1] - 1), (p[0] + 1, p[1] + 1)], level=1, flat=True)


def kaffee(t):
    t.poly(EMAILLE, [(9, 9), (22, 9), (25, 29), (6, 29)])
    t.ell(EMAILLE, [(9, 5), (22, 11)], level=3)
    t.ell(EMAILLE, [(13, 2), (18, 6)], level=2)
    t.line(EMAILLE, [(24, 13), (29, 15), (28, 24), (24, 25)], 2)  # Henkel
    t.line(EMAILLE, [(7, 14), (2, 8)], 3)  # Tülle
    t.px('papier', [(10, 15), (9, 20), (14, 24)], level=4)  # abgeplatztes Email
    t.px('papier', [(3, 4), (5, 2)], level=3)  # Dampf


# --- Post-Beilagen ---------------------------------------------------------------------------------------------
def schluessel_ohne_schloss(t):
    t.ell('messing', [(3, 3), (15, 15)])
    t.ell('messing', [(6, 6), (12, 12)], level=None)
    t.ell(ONYX, [(7, 7), (11, 11)], level=0, flat=True)  # Leseblende
    t.line('messing', [(13, 13), (27, 27)], 3)
    t.line('messing', [(22, 26), (25, 29)], 3, level=3)
    t.line('messing', [(25, 23), (28, 26)], 3, level=3)


def leseblatt(t):
    t.poly('papier', [(6, 3), (26, 5), (25, 29), (5, 27)])
    for k in range(5):
        t.line('tinte', [(9, 8 + k * 4), (21, 9 + k * 4)], 1, level=3, flat=True)
    t.ell('gold', [(17, 21), (22, 26)], level=4, flat=True)


def fragen_vor_der_erklaerung(t):
    t.poly('papier', [(5, 6), (27, 4), (28, 27), (6, 29)])
    for k in range(3):
        y = 10 + k * 6
        t.ell('tinte', [(8, y - 1), (11, y + 2)], level=2, flat=True)
        t.line('tinte', [(13, y), (24, y - 1)], 1, level=3, flat=True)
    t.line('gold', [(9, 26), (24, 25)], 1, level=2, flat=True)


# --- Calderwicker Fundstücke ---------------------------------------------------------------------------------
def fallbuchseite(t):
    t.poly('papier', [(5, 3), (27, 4), (26, 28), (6, 29)])
    for k in range(3):
        t.line('tinte', [(9, 9 + k * 6), (22, 9 + k * 6)], 1, level=2, flat=True)
    for k in (1, 2):
        t.line(ROT, [(8, 10 + k * 6), (23, 8 + k * 6)], 1, level=2, flat=True)  # gestrichen
    t.poly('russ', [(5, 22), (9, 26), (13, 23), (17, 27), (22, 24), (26, 27), (26, 30), (6, 30)])
    t.poly('russ', [(26, 4), (27, 9), (23, 4)])
    t.px('glut', [(9, 26), (17, 27)], level=3)


def fahrkarte_oben(t):
    t.poly('papier', [(3, 9), (29, 6), (30, 21), (4, 24)])
    t.line('tinte', [(7, 12), (19, 11)], 1, level=2, flat=True)
    t.line('tinte', [(7, 16), (15, 15)], 1, level=2, flat=True)
    t.line(ROT, [(4, 20), (29, 17)], 1, level=2, flat=True)
    t.ell(ONYX, [(22, 11), (26, 15)], level=0, flat=True)  # gelocht
    t.line('gold', [(26, 6), (26, 4), (28, 3)], 1, level=3, flat=True)


def brille(t):
    t.ell('kette', [(2, 12), (14, 24)])
    t.ell('kette', [(18, 12), (30, 24)])
    t.ell(GLAS, [(4, 14), (12, 22)])
    t.ell(GLAS, [(20, 14), (28, 22)])
    t.line('kette', [(13, 16), (19, 16)], 1)
    t.line('kette', [(2, 17), (0, 10)], 1, pts16=[(1, 8), (0, 5)])
    t.line('tinte', [(21, 15), (24, 18), (23, 21), (27, 22)], 1, level=1, flat=True)  # Sprung
    t.px(GLAS, [(6, 16), (5, 17)], level=4)


def zinnsoldat(t):
    t.poly('blei', [(11, 26), (21, 26), (23, 30), (9, 30)], level=1)
    t.poly('blei', [(13, 14), (19, 14), (19, 26), (13, 26)])
    t.poly(ROT, [(12, 12), (20, 12), (20, 19), (12, 19)])  # Waffenrock
    t.ell('blei', [(13, 6), (19, 12)], level=3)
    t.poly('blei', [(13, 1), (19, 1), (19, 6), (13, 6)], level=1)  # Tschako
    t.line('blei', [(22, 4), (22, 22)], 1, level=3)  # Gewehr
    t.px('gold', [(16, 15), (16, 3)], level=4)


def haftbefehl(t):
    t.poly('papier', [(6, 6), (24, 4), (26, 26), (8, 28)])
    t.ell('papier', [(3, 3), (10, 31)], level=3)  # Rolle
    t.line(ROT, [(4, 16), (27, 14)], 2, level=2)
    t.ell('wachs', [(16, 12), (22, 18)])
    t.line('tinte', [(13, 8), (21, 7)], 1, level=2, flat=True)
    t.line('tinte', [(13, 21), (22, 20)], 1, level=2, flat=True)


def rabenkarte(t):
    t.poly(ONYX, [(8, 3), (25, 5), (23, 29), (6, 27)])
    t.poly('gold', [(9, 4), (24, 6), (24, 7), (9, 5)], level=3)
    t.poly('tinte', [(11, 18), (14, 13), (19, 11), (21, 13), (18, 15), (21, 20), (15, 20)], level=None)  # Rabe
    t.ell('tinte', [(17, 9), (21, 13)])
    t.px('gold', [(19, 11)], level=4)
    t.line('gold', [(8, 27), (23, 28)], 1, level=2, flat=True)


def manschettenknoepfe(t):
    t.ell('silber' if False else 'kette', [(3, 8), (15, 20)])
    t.ell('kette', [(17, 13), (29, 25)])
    t.ell('kette', [(6, 11), (12, 17)], level=1)
    t.ell('kette', [(20, 16), (26, 22)], level=1)
    t.px('kette', [(9, 14), (23, 19)], level=4)
    t.line('kette', [(9, 20), (9, 25)], 2, level=1)
    t.line('kette', [(23, 25), (23, 29)], 2, level=1)


def gildenbinde(t):
    t.poly(ROT, [(3, 12), (29, 8), (30, 20), (4, 24)])
    t.line('gold', [(3, 13), (29, 9)], 1, level=3, flat=True)
    t.line('gold', [(4, 23), (30, 19)], 1, level=2, flat=True)
    t.ell('gold', [(12, 11), (20, 19)])
    t.poly(ROT, [(15, 13), (17, 13), (18, 17), (14, 17)], level=1, flat=True)


def bleisiegel(t):
    t.line('papier', [(4, 2), (12, 12), (8, 30)], 1, level=2)  # Plombenschnur
    t.ell('blei', [(8, 9), (26, 27)])
    t.ell('blei', [(11, 12), (23, 24)], level=1)
    t.poly('blei', [(14, 15), (20, 15), (17, 21)], level=4, flat=True)  # Krone
    t.line('tinte', [(19, 20), (23, 24)], 2, level=2, flat=True)  # abgekratzte Nummer


def porzellanpuppe(t):
    t.poly(SAMT, [(10, 15), (22, 15), (26, 30), (6, 30)])
    t.ell(KORK, [(7, 1), (25, 15)], level=2)
    t.ell(PORZ, [(10, 3), (22, 16)])
    t.ell(KORK, [(5, 6), (10, 14)], level=1)
    t.ell(KORK, [(22, 6), (27, 14)], level=1)
    t.px('tinte', [(13, 9), (19, 9)], level=1)
    t.px(ROT, [(16, 13)], level=3)
    t.line('tinte', [(11, 6), (14, 10), (17, 9), (21, 14)], 1, level=2, flat=True)  # Sprung quer übers Gesicht
    t.poly('papier', [(13, 15), (19, 15), (16, 19)], level=4, flat=True)


def schnupftabakdose(t):
    t.poly('kette', [(3, 14), (25, 10), (29, 23), (7, 27)])
    t.poly('kette', [(3, 10), (25, 6), (26, 11), (4, 15)], level=3)   # Deckel
    t.line('kette', [(4, 15), (26, 11)], 1, level=0, flat=True)
    t.line('tinte', [(10, 20), (21, 18)], 1, level=2, flat=True)       # eingeritzter Name
    t.ell('kette', [(12, 7), (17, 11)], level=1)                       # Wappenschild
    t.px('kette', [(7, 10), (8, 9)], level=4)


def medaillon(t):
    t.line('gold', [(16, 1), (16, 5)], 1)
    t.ell('gold', [(2, 6), (16, 24)])
    t.ell('gold', [(16, 6), (30, 24)])
    t.ell(GRUEN := [(46, 70, 40), (70, 104, 54), (104, 140, 70), (150, 176, 96), (200, 210, 140)], [(19, 9), (27, 21)])  # Garten im Bild
    t.ell('gold', [(21, 10), (25, 14)], level=4, flat=True)  # Sonne
    t.ell('gold', [(5, 9), (13, 21)], level=1)
    t.px('gold', [(5, 9)], level=4)


def taschenuhr(t):
    t.line('gold', [(16, 0), (16, 4)], 2, level=2)
    t.ell('gold', [(4, 4), (28, 28)])
    t.ell(ELFENBEIN, [(7, 7), (25, 25)])
    t.line('tinte', [(16, 16), (16, 9)], 1, level=1, flat=True)
    t.line('tinte', [(16, 16), (21, 19)], 1, level=1, flat=True)
    t.line(GLAS, [(9, 10), (13, 14), (12, 19), (17, 23)], 1, level=1, flat=True)  # gesprungenes Glas
    t.px('gold', [(7, 8), (6, 10)], level=4)


def samtbeutel(t):
    t.poly(SAMT, [(8, 10), (24, 10), (28, 22), (24, 29), (8, 29), (4, 22)])
    t.poly(SAMT, [(11, 5), (21, 5), (23, 10), (9, 10)], level=3)
    t.line('gold', [(9, 10), (23, 10)], 1, level=3, flat=True)
    for (x, y) in [(22, 27), (27, 28), (25, 24)]:
        t.ell('gold', [(x - 2, y - 2), (x + 2, y + 2)])
    t.px(SAMT, [(10, 14), (11, 13)], level=4)


def trauerkamee(t):
    t.ell('gold', [(3, 2), (29, 30)])
    t.ell(ONYX, [(5, 4), (27, 28)])
    t.poly(ELFENBEIN, [(x - 1, y) for x, y in PROFIL])
    t.ell(ELFENBEIN, [(7, 8), (12, 13)], level=3)
    t.px('gold', [(7, 6), (6, 9)], level=4)


def spieluhr(t):
    t.poly('holz', [(4, 14), (28, 14), (28, 29), (4, 29)])
    t.poly('holz', [(4, 6), (28, 6), (28, 14), (4, 14)], level=3)  # Deckel offen
    t.poly('messing', [(8, 16), (24, 16), (24, 22), (8, 22)])  # Walze
    for x in range(10, 24, 3):
        t.px('messing', [(x, 18), (x + 1, 20)], level=4)
    t.line('messing', [(29, 20), (31, 20), (31, 24)], 2, level=2)  # Kurbel
    t.line('gold', [(5, 9), (27, 9)], 1, level=2, flat=True)


def siegelring(t):
    t.ell('gold', [(5, 12), (27, 30)])
    t.ell(ONYX, [(9, 16), (23, 26)], level=0, flat=True)
    t.ell('gold', [(9, 2), (23, 16)])
    t.ell(ROT, [(11, 4), (21, 14)])  # Wappenstein
    t.poly('gold', [(14, 7), (18, 7), (16, 11)], level=4, flat=True)


def gerichtsakte(t):
    t.poly('leder', [(4, 5), (26, 3), (28, 27), (6, 29)])
    t.poly('papier', [(7, 6), (26, 5), (27, 8), (8, 9)], level=3)
    t.line(ROT, [(5, 17), (27, 15)], 2, level=2)
    t.ell('wachs', [(13, 12), (21, 20)])
    t.px('wachs', [(16, 15)], level=4)


def fuellfeder(t):
    t.line(ONYX, [(5, 27), (21, 11)], 4)
    t.line('gold', [(9, 23), (10, 22)], 4, level=3)
    t.line('gold', [(19, 13), (20, 12)], 4, level=3)
    t.poly('gold', [(21, 9), (24, 6), (29, 3), (26, 8), (23, 11)])  # Feder
    t.px('tinte', [(25, 7)], level=0)
    t.px(ONYX, [(8, 23), (12, 19)], level=4)


def scherenschnitt(t):
    t.poly('papier', [(5, 3), (27, 3), (27, 29), (5, 29)])
    t.poly(ONYX, [(x - 1, y) for x, y in PROFIL], level=1, flat=True)
    t.ell(ONYX, [(6, 7), (12, 13)], level=1, flat=True)  # Haarknoten
    t.line('papier', [(5, 3), (27, 3)], 1, level=1, flat=True)


def opernglas(t):
    t.ell('gold', [(3, 10), (15, 26)])
    t.ell('gold', [(17, 10), (29, 26)])
    t.ell(GLAS, [(5, 13), (13, 23)])
    t.ell(GLAS, [(19, 13), (27, 23)])
    t.poly(ELFENBEIN, [(13, 12), (19, 12), (19, 18), (13, 18)])
    t.line(ELFENBEIN, [(16, 18), (24, 31)], 2)  # Stiel
    t.px(GLAS, [(7, 15), (21, 15)], level=4)


def orden(t):
    t.poly(ROT, [(10, 2), (22, 2), (21, 13), (11, 13)])
    t.line('gold', [(16, 2), (16, 13)], 1, level=2, flat=True)
    t.poly(ROT, [(22, 2), (26, 0), (25, 6)], level=1)  # gerissenes Band
    t.poly('gold', [(16, 12), (19, 17), (25, 17), (20, 21), (22, 28), (16, 24), (10, 28), (12, 21), (7, 17), (13, 17)])
    t.ell('kette', [(13, 16), (19, 22)])


def silberkelch(t):
    t.poly('kette', [(6, 4), (26, 4), (23, 14), (17, 18), (15, 18), (9, 14)])
    t.ell('kette', [(6, 2), (26, 7)], level=1)
    t.line('kette', [(16, 18), (16, 25)], 3)
    t.ell('kette', [(8, 24), (24, 30)])
    t.ell('gold', [(13, 8), (19, 13)])  # Wappen
    t.px('kette', [(9, 6), (10, 9)], level=4)


def glasvogel(t):
    v = [(60, 96, 110), (96, 140, 150), (150, 190, 196), (200, 228, 228), (240, 252, 250)]
    t.ell(v, [(6, 12), (24, 26)])
    t.ell(v, [(18, 6), (28, 16)])
    t.poly(v, [(27, 10), (31, 11), (27, 13)], level=3)  # Schnabel
    t.poly(v, [(6, 18), (1, 12), (2, 22)], level=2)  # Schwanz
    t.poly(v, [(10, 16), (20, 14), (14, 22)], level=4)  # Flügel-Glanz
    t.px('tinte', [(24, 10)], level=0)
    t.line(v, [(11, 26), (11, 30)], 1, level=1, flat=True)
    t.line(v, [(17, 26), (17, 30)], 1, level=1, flat=True)


def totenmaske(t):
    t.poly(PORZ, [(9, 3), (23, 3), (27, 10), (26, 21), (20, 29), (12, 29), (6, 21), (5, 10)])
    t.line(PORZ, [(9, 13), (14, 14)], 1, level=1, flat=True)   # geschlossene Lider
    t.line(PORZ, [(18, 14), (23, 13)], 1, level=1, flat=True)
    t.line(PORZ, [(16, 13), (17, 20), (15, 20)], 1, level=2, flat=True)
    t.line(PORZ, [(13, 24), (19, 24)], 1, level=1, flat=True)
    t.px(PORZ, [(11, 8), (20, 8), (10, 18)], level=4)
    t.px('gold', [(9, 5), (8, 7), (23, 5)], level=4)  # Goldschimmer: zu schön


ICONS = {
    'dsh_verbandrolle': verbandrolle,
    'dsh_schichttonikum': schichttonikum,
    'dsh_kalkelixier': kalkelixier,
    'dsh_honigtopf': honigtopf,
    'dsh_bruchriechsalz': bruchriechsalz,
    'dsh_wachtrank': wachtrank,
    'dsh_stellwerktee': stellwerktee,
    'dsh_stillschlaf': stillschlaf,
    'dsh_geisterblume': geisterblume,
    'dsh_reisebrot': reisebrot,
    'dsh_hartkaese': hartkaese,
    'dsh_kaffee': kaffee,
    'post_schluessel_ohne_schloss': schluessel_ohne_schloss,
    'post_leseblatt': leseblatt,
    'post_fragen_vor_der_erklaerung': fragen_vor_der_erklaerung,
    'cwf_fallbuchseite': fallbuchseite,
    'cwf_fahrkarte_oben': fahrkarte_oben,
    'cwf_brille': brille,
    'cwf_zinnsoldat': zinnsoldat,
    'cwf_haftbefehl': haftbefehl,
    'cwf_rabenkarte': rabenkarte,
    'cwf_manschettenknoepfe': manschettenknoepfe,
    'cwf_gildenbinde': gildenbinde,
    'cwf_bleisiegel': bleisiegel,
    'cwf_porzellanpuppe': porzellanpuppe,
    'cwf_schnupftabakdose': schnupftabakdose,
    'cwf_medaillon': medaillon,
    'cwf_taschenuhr': taschenuhr,
    'cwf_samtbeutel': samtbeutel,
    'cwf_trauerkamee': trauerkamee,
    'cwf_spieluhr': spieluhr,
    'cwf_siegelring': siegelring,
    'cwf_gerichtsakte': gerichtsakte,
    'cwf_fuellfeder': fuellfeder,
    'cwf_scherenschnitt': scherenschnitt,
    'cwf_opernglas': opernglas,
    'cwf_orden': orden,
    'cwf_silberkelch': silberkelch,
    'cwf_glasvogel': glasvogel,
    'cwf_totenmaske': totenmaske,
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
    print(len(ICONS))
