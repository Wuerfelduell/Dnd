"""Calderwick-Requisiten für die Platzhalter-Klötze (python3 tools/art/cw_kulissen/assets.py).
-> public/sprites/props/cwk_*.png, public/sprites/manifest-cw-kulissen.json. Palette: manifest-calderwick2.json (die CE1-Palette plus Siegelrot #893e4e), Farben über Hexwerte."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import pinsel
from pinsel import Bild, h3, streifen, ROOT

PAL = pinsel.palette_aus('manifest-calderwick2.json')
HEX = ['#%02x%02x%02x' % c for c in PAL]
def C(h):
    return HEX.index(h)
OUT = C('#1a1c2c')
GRAU = [C(h) for h in ('#252b38', '#303b49', '#425360', '#586c78', '#71858b', '#95a5a5', '#a8b4c0')]
HOLZ = [C(h) for h in ('#2d2629', '#58433c', '#715648', '#92745a', '#b3946e')]
HOLZ_HELL = [C(h) for h in ('#58433c', '#715648', '#92745a', '#b3946e', '#cfb18a')]
PAPIER = [C(h) for h in ('#b3946e', '#cfb18a', '#e0c9a1', '#eee2c5')]
MESSING = [C(h) for h in ('#886332', '#d0a050', '#e8b860', '#f0ce80')]
OLIV = [C(h) for h in ('#494b3a', '#686850', '#8b8870')]
TEAL = [C(h) for h in ('#173d40', '#245b59', '#36817a', '#4eafa2')]
TUERKIS = C('#6fe0d0')
ROT = C('#893e4e')
LILA = [C(h) for h in ('#5c426a', '#8c7295', '#c8b0e8')]
CREME = C('#eee2c5')
EISEN = [C(h) for h in ('#1a1c2c', '#252b38', '#303b49', '#425360', '#586c78')]


def kasten(b, x0, y0, w, top, front, rt=HOLZ_HELL, rf=HOLZ, s=0):
    b.rechteck(x0, y0, x0 + w - 1, y0 + top - 1, rt, 0.6, 0.25, licht=0.6, s=s)
    b.rechteck(x0, y0 + top, x0 + w - 1, y0 + top + front - 1, rf, 0.5, 0.25, licht=0.5, s=s + 1)
    for x in range(x0, x0 + w):
        b.set(x, y0 + top, rf[0])


def beine(b, xs, y0, y1, ramp=HOLZ):
    for x in xs:
        b.rechteck(x, y0, x + 1, y1, ramp, 0.35, 0.15)


def zettel(b, x, y, w=3, h=2, s=0):
    b.rechteck(x, y, x + w - 1, y + h - 1, PAPIER, 0.75, 0.25, s=s)


# 1 Quittungsstand (Pfandhaus) -------------------------------------------------------------------------------------------------------
def quittungsstand():
    b = Bild(48, 32, seed=201)
    kasten(b, 1, 12, 46, 7, 13, s=1)
    for x in range(2, 46, 11):  # Füllungen in der Front
        b.rechteck(x + 1, 21, x + 8, 29, HOLZ, 0.35, 0.2, licht=0.4, s=x)
        for xx in range(x + 1, x + 9):
            b.set(xx, 21, HOLZ[0])
    for x in range(1, 47):
        b.ton(x, 19, MESSING, 0.6, 0.2, 3)  # Messingleiste
    # aufgeschlagenes Quittungsbuch, Quittungsspieß, Klingel, Stempel
    b.rechteck(6, 12, 19, 17, PAPIER, 0.7, 0.2, licht=0.4)
    for y in (13, 15):
        for x in range(7, 18):
            if x != 12 and h3(x, y, 1) < 0.75:
                b.set(x, y, GRAU[2])
    b.set(12, 12, HOLZ[1]); b.set(12, 13, HOLZ[1]); b.set(12, 14, HOLZ[1]); b.set(12, 15, HOLZ[1]); b.set(12, 16, HOLZ[1])
    for y in range(4, 16):
        b.set(27, y, GRAU[4] if y > 5 else GRAU[6])
    for i, y in enumerate((8, 10, 12, 14)):
        b.rechteck(25, y, 29, y + 1, PAPIER, 0.85 - 0.1 * i, 0.15)
        b.set(27, y, GRAU[4])
    b.rechteck(25, 16, 29, 16, HOLZ, 0.3, 0)
    b.ellipse(36, 15, 2.5, 2.0, MESSING)               # Klingel
    b.set(36, 12, MESSING[3]); b.set(36, 13, MESSING[1])
    b.rechteck(41, 12, 44, 15, HOLZ, 0.5, 0.2)          # Stempel
    b.rechteck(40, 16, 45, 17, [ROT, ROT], 0.5, 0)
    b.umriss(OUT)
    return b


# 2 Heftlade (Buchbinderei) -------------------------------------------------------------------------------------------------------------
def heftlade():
    b = Bild(48, 32, seed=202)
    kasten(b, 2, 20, 30, 4, 6, s=1)                      # Bett der Heftlade
    beine(b, (3, 29), 30, 31)
    for x in (5, 27):                                    # Pfosten und Querholz
        b.rechteck(x, 4, x + 1, 21, HOLZ_HELL, 0.55, 0.2, licht=0.5)
    b.rechteck(4, 3, 29, 5, HOLZ_HELL, 0.65, 0.2, licht=0.5)
    for x in range(9, 25, 3):                            # Heftbänder
        for y in range(6, 20):
            b.set(x, y, CREME if y % 3 else PAPIER[1])
    b.rechteck(9, 15, 24, 20, PAPIER, 0.6, 0.25, licht=0.5, s=4)   # Buchblock in Arbeit
    for y in range(16, 20, 2):
        for x in range(9, 25):
            b.set(x, y, PAPIER[0])
    # Stapel gefalzter Bogen und Leimtopf daneben
    for i in range(5):
        b.rechteck(34, 25 - i * 2, 45, 26 - i * 2, PAPIER, 0.8 - 0.06 * i, 0.15)
        b.set(45, 26 - i * 2, PAPIER[0])
    b.ellipse(41, 13, 3, 2.5, HOLZ)
    b.rechteck(38, 13, 44, 16, [HOLZ[1], HOLZ[2], HOLZ[3]], 0.5, 0.2, licht=0.6)
    b.set(42, 9, HOLZ[4]); b.set(42, 10, HOLZ[3]); b.set(43, 11, HOLZ[3])
    b.umriss(OUT)
    return b


# 3 Aktenturm mit Archivleiter (Archivsaal, Villa, Nullfundament) -------------------------------------------------------------------------
def aktenturm():
    b = Bild(48, 48, seed=203)
    kasten(b, 3, 2, 30, 5, 40, s=1)
    for r in range(8):
        y = 8 + r * 5
        for x in range(4, 32):
            b.set(x, y, HOLZ[0])
        for c in range(4):
            x0 = 5 + c * 7
            b.rechteck(x0 + 2, y + 2, x0 + 4, y + 3, MESSING, 0.7, 0.15)
            b.set(x0 + 3, y + 3, PAPIER[2])
            if (r * 3 + c) % 7 == 2:  # herausgezogene Karte
                b.rechteck(x0 + 1, y, x0 + 4, y + 1, PAPIER, 0.85, 0.1)
    for x in (4, 18, 31):
        for y in range(8, 47):
            b.set(x, y, HOLZ[0])
    for i, (x, w) in enumerate(((6, 9), (17, 7), (25, 6))):  # Akten oben
        for k in range(2 + i % 2):
            b.rechteck(x, 4 - k, x + w, 5 - k, PAPIER, 0.75 - 0.1 * k, 0.2)
            b.set(x + w // 2, 4 - k, ROT)
    # Archivleiter mit Haken an der Leiste
    for t in range(44):
        x = 36 + t // 5
        b.set(x, 3 + t, HOLZ_HELL[3]); b.set(x + 1, 3 + t, HOLZ_HELL[1])
        b.set(x + 7, 3 + t, HOLZ_HELL[3]); b.set(x + 8, 3 + t, HOLZ_HELL[1])
        if t % 6 == 3:
            for xx in range(x + 1, x + 8):
                b.set(xx, 3 + t, HOLZ_HELL[2])
    b.set(36, 2, MESSING[1]); b.set(43, 2, MESSING[1])
    b.umriss(OUT)
    return b


# 4 Siegelpresse (Druckkammer) ------------------------------------------------------------------------------------------------------------
def siegelpresse():
    b = Bild(48, 32, seed=204)
    kasten(b, 1, 16, 46, 6, 8, s=1)
    beine(b, (2, 44), 30, 31)
    # gusseiserner Bügel, Spindel, Querhebel mit Kugeln
    for y in range(5, 18):
        b.set(14, y, EISEN[3]); b.set(15, y, EISEN[2]); b.set(25, y, EISEN[2]); b.set(26, y, EISEN[1])
    b.rechteck(14, 4, 26, 6, EISEN, 0.6, 0.15, licht=0.6)
    b.rechteck(19, 1, 21, 12, GRAU, 0.6, 0.1, licht=0.6)
    for x in range(8, 33):
        b.set(x, 2, EISEN[3] if x % 2 else EISEN[2])
    b.ellipse(7, 2, 2, 2, GRAU); b.ellipse(33, 2, 2, 2, GRAU)
    b.rechteck(17, 12, 23, 14, MESSING, 0.7, 0.15)         # Stempelkopf
    b.rechteck(16, 16, 24, 17, PAPIER, 0.8, 0.1)           # Urkunde unter der Presse
    b.set(20, 17, ROT); b.set(19, 17, ROT)
    # Siegellackstangen und versiegelte Briefe
    for i in range(3):
        b.rechteck(31 + i * 2, 17, 31 + i * 2, 21, [ROT, ROT], 0.5, 0)
        b.set(31 + i * 2, 17, PAPIER[2])
    for i, x in enumerate((38, 41)):
        b.rechteck(x, 17 + i, x + 5, 20 + i, PAPIER, 0.75, 0.15)
        b.set(x + 2, 18 + i, ROT); b.set(x + 3, 18 + i, ROT)
    b.ellipse(7, 18, 3, 1.5, HOLZ)                         # Lackschale
    b.set(7, 18, ROT)
    b.umriss(OUT)
    return b


# 5 Brieffach-Sortiertisch (Sortierhalle, Gepäckhalle, Sortiergrube) -----------------------------------------------------------------------
def sortiertisch():
    b = Bild(48, 40, seed=205)
    b.rechteck(3, 1, 44, 21, HOLZ, 0.4, 0.2, s=1)          # Fächerwand
    for r in range(4):
        for c in range(7):
            x0, y0 = 5 + c * 6, 3 + r * 5
            b.rechteck(x0, y0, x0 + 4, y0 + 3, [HOLZ[0], HOLZ[0], HOLZ[1]], 0.3, 0.1)
            if h3(c, r, 9) < 0.55:
                hoch = 1 + int(h3(c, r, 10) * 2)
                b.rechteck(x0, y0 + 3 - hoch, x0 + 4, y0 + 3, PAPIER, 0.8, 0.2, s=c + r)
                if h3(c, r, 11) < 0.25:
                    b.set(x0 + 2, y0 + 3 - hoch, ROT)
            b.set(x0 + 2, y0 + 4, MESSING[2])  # Messingschildchen
    kasten(b, 1, 22, 46, 6, 9, s=3)
    beine(b, (2, 44), 37, 39)
    b.ellipse(10, 24, 5, 2.5, [HOLZ[1], HOLZ[2], HOLZ[3]])  # Korb mit Briefen
    for i in range(5):
        zettel(b, 7 + i * 2 - (i % 2), 22 - i % 2, 3, 2, s=i)
    zettel(b, 26, 23, 5, 3); zettel(b, 33, 24, 4, 2); b.set(28, 24, ROT)
    b.umriss(OUT)
    return b


# 6 Küchenanrichte (Küche) ---------------------------------------------------------------------------------------------------------------
def anrichte():
    b = Bild(48, 32, seed=206)
    kasten(b, 1, 14, 46, 6, 12, rt=GRAU[2:], s=1)         # Steinplatte, Holzfront
    for x0 in (3, 17, 31):
        b.rechteck(x0, 22, x0 + 12, 30, HOLZ, 0.45, 0.2, licht=0.4)
        b.set(x0 + 11, 26, MESSING[2])
    for x in range(1, 47):
        b.set(x, 21, HOLZ[0])
    # Brotlaibe, Topf, Becher, Messer
    for (cx, cy) in ((7, 12), (13, 13)):
        b.ellipse(cx, cy, 4, 2.6, [HOLZ[2], HOLZ[3], HOLZ[4], PAPIER[1]])
        b.set(cx - 1, cy - 1, HOLZ[1]); b.set(cx + 1, cy - 1, HOLZ[1])
    b.rechteck(22, 8, 30, 15, GRAU, 0.55, 0.15, licht=0.7)   # Topf
    b.rechteck(21, 7, 31, 8, GRAU, 0.7, 0.1)
    b.set(26, 6, GRAU[5]); b.set(20, 10, GRAU[3]); b.set(32, 10, GRAU[3])
    for x in (35, 39):                                        # Becher
        b.rechteck(x, 12, x + 2, 15, [TEAL[1], TEAL[2], TEAL[3]], 0.6, 0.1)
    for x in range(42, 47):
        b.set(x, 16, GRAU[6] if x > 43 else HOLZ[1])
    b.umriss(OUT)
    return b


# 7 Satzregal (Alte Setzerei, 3x3) -------------------------------------------------------------------------------------------------------
def satzregal():
    b = Bild(48, 48, seed=207)
    kasten(b, 2, 2, 44, 4, 42, s=1)
    for r in range(4):
        y = 8 + r * 9
        for x in range(3, 45):
            b.set(x, y + 8, HOLZ[0])
        for c in range(3):
            x0 = 4 + c * 14
            b.rechteck(x0, y, x0 + 11, y + 6, EISEN, 0.55, 0.15, licht=0.5)  # Setzschiff
            for yy in range(y + 1, y + 6):
                for xx in range(x0 + 1, x0 + 11):
                    if (xx + yy) % 2 == 0 and h3(xx, yy, r) < 0.8:
                        b.set(xx, yy, GRAU[5] if h3(xx, yy, 3) < 0.5 else GRAU[4])
            if h3(c, r, 4) < 0.35:
                b.rechteck(x0 + 1, y + 1, x0 + 10, y + 2, PAPIER, 0.8, 0.1)  # Fahnenabzug obenauf
    for x in (3, 16, 30, 44):
        for y in range(6, 46):
            b.set(x, y, HOLZ[0])
    b.rechteck(5, 43, 14, 45, GRAU, 0.5, 0.1); b.rechteck(30, 43, 38, 45, GRAU, 0.4, 0.1)  # Bleibarren
    b.umriss(OUT)
    return b


# 8 Setzertisch (Alte Setzerei, 3x1) -----------------------------------------------------------------------------------------------------
def setzertisch():
    b = Bild(48, 32, seed=208)
    kasten(b, 1, 13, 46, 8, 11, rt=[C('#71858b'), C('#95a5a5'), C('#a8b4c0'), C('#eee2c5')], s=1)   # Schließplatte aus Stein
    beine(b, (2, 44), 30, 31)
    b.rechteck(10, 13, 28, 19, EISEN, 0.4, 0.1)               # Schließrahmen mit Satz
    for yy in range(14, 19):
        for xx in range(11, 28):
            b.set(xx, yy, GRAU[5] if (xx * 3 + yy) % 4 else GRAU[3])
    b.rechteck(14, 15, 24, 15, [C('#586c78')], 0.5, 0)
    b.rechteck(32, 15, 40, 16, GRAU, 0.6, 0.1)                 # Winkelhaken
    b.set(32, 14, GRAU[5]); b.set(40, 14, GRAU[5])
    b.rechteck(36, 9, 38, 14, HOLZ, 0.6, 0.1); b.rechteck(34, 7, 40, 9, HOLZ_HELL, 0.6, 0.1)  # Klopfholz
    zettel(b, 3, 14, 5, 3)
    b.umriss(OUT)
    return b


# 9 Briefsortier-Trommel (Sortiergrube, 3x3) ---------------------------------------------------------------------------------------------
def trommel():
    b = Bild(48, 48, seed=209)
    for x in (6, 40):                                          # gusseiserne Böcke
        for y in range(20, 40):
            b.rechteck(x - (y - 20) // 7, y, x + 2 + (y - 20) // 7, y, EISEN, 0.5, 0.15)
    for y in range(8, 30):                                     # liegende Trommel
        for x in range(8, 40):
            dy = (y - 19) / 11
            b.ton(x, y, TEAL, 0.85 - 0.75 * abs(dy) - 0.25 * (dy > 0), 0.2, 3)
    for x in (8, 16, 24, 32, 39):
        for y in range(8, 30):
            b.set(x, y, MESSING[1] if y % 3 else MESSING[2])
    for y in range(12, 27, 4):                                 # Einwurfschlitze
        for x in range(11, 37, 8):
            b.rechteck(x, y, x + 3, y, [TEAL[0]], 0.5, 0)
    b.ellipse(43, 19, 3, 6, EISEN)                             # Kurbelrad
    b.set(43, 19, MESSING[3]); b.set(46, 14, HOLZ_HELL[3]); b.set(46, 15, HOLZ_HELL[2])
    for y in range(0, 8):                                      # Rohrpost von oben
        b.rechteck(21, y, 26, y, [MESSING[0], MESSING[1], MESSING[2]], 0.6, 0.1)
    b.rechteck(20, 0, 27, 1, MESSING, 0.8, 0.1)
    for i, x in enumerate((12, 22, 32)):                       # Auffangkästen mit Briefen
        b.rechteck(x, 38, x + 8, 46, HOLZ, 0.45, 0.2, licht=0.5)
        for k in range(2):
            zettel(b, x + 1 + k * 3, 36 + k, 4, 2, s=i + k)
    zettel(b, 18, 31, 3, 2); zettel(b, 28, 33, 3, 2)          # fallende Briefe
    b.umriss(OUT)
    return b


# 10 Fundamentpfeiler (Nullfundament, 3x3) -----------------------------------------------------------------------------------------------
def fundamentpfeiler():
    b = Bild(48, 48, seed=210)
    b.rechteck(4, 38, 43, 46, GRAU, 0.4, 0.3, licht=0.5, s=1)           # Sockel
    b.rechteck(8, 4, 39, 38, GRAU, 0.55, 0.3, licht=0.6, s=2)           # Pfeiler
    b.rechteck(6, 2, 41, 6, GRAU, 0.7, 0.25, licht=0.6, s=3)            # Kapitell
    for y in range(9, 37, 7):                                            # Fugen
        for x in range(8, 40):
            b.set(x, y, GRAU[1])
    for i, y in enumerate((12, 21, 30)):                                 # Registerplatten aus Bronze
        b.rechteck(13, y, 34, y + 4, MESSING, 0.45, 0.2, licht=0.6)
        for x in range(15, 33, 2):
            if h3(x, y, i) < 0.7:
                b.set(x, y + 2, MESSING[0])
    # die leere Nullzeile: türkis glimmender Ring, Risse
    for t in range(0, 360, 20):
        a = math.radians(t)
        b.set(int(24 + math.cos(a) * 3.5), int(27 + math.sin(a) * 2), TUERKIS)
    for (x, y) in ((10, 15), (11, 16), (11, 17), (12, 18), (36, 24), (35, 25), (36, 26), (37, 27)):
        b.set(x, y, GRAU[0])
    b.streu(lambda x, y: y > 36, TUERKIS, 0.01, s=11)
    b.umriss(OUT)
    return b


ALLE = {
    'cwk_quittungsstand': (quittungsstand, (48, 32), 'Quittungsstand mit Quittungsbuch, Quittungsspieß, Klingel und Stempel', 'cw_pfandhaus'),
    'cwk_heftlade': (heftlade, (48, 32), 'Heftlade mit Heftbändern und Buchblock, gefalzte Bogen, Leimtopf', 'cw_buchbinderei'),
    'cwk_aktenturm': (aktenturm, (48, 48), 'Aktenturm aus Karteischüben mit angelehnter Archivleiter', 'cw_archivsaal, cw_villa, cw_nullfundament (3x1)'),
    'cwk_siegelpresse': (siegelpresse, (48, 32), 'gusseiserne Siegelpresse auf dem Tisch, Siegellack, versiegelte Briefe', 'cw_druckkammer'),
    'cwk_sortiertisch': (sortiertisch, (48, 40), 'Sortiertisch mit Brieffächern, Briefkorb', 'cw_sortierhalle, cw_gepaeckhalle, cw_sortiergrube (3x1)'),
    'cwk_anrichte': (anrichte, (48, 32), 'Küchenanrichte mit Steinplatte, Brot, Topf, Bechern', 'cw_kueche'),
    'cwk_satzregal': (satzregal, (48, 48), 'Regal mit Setzschiffen voller Bleisatz, Bleibarren', 'cw_alte_setzerei (3x3)'),
    'cwk_setzertisch': (setzertisch, (48, 32), 'Schließplatte aus Stein mit Satz im Rahmen, Winkelhaken, Klopfholz', 'cw_alte_setzerei (3x1)'),
    'cwk_sortiertrommel': (trommel, (48, 48), 'liegende Briefsortier-Trommel mit Kurbel, Rohrpost-Zulauf, Auffangkästen', 'cw_sortiergrube (3x3)'),
    'cwk_fundamentpfeiler': (fundamentpfeiler, (48, 48), 'Fundamentpfeiler mit Registerplatten und türkis glimmender Nullzeile', 'cw_nullfundament (3x3)'),
}


if __name__ == '__main__':
    od = os.path.join(ROOT, 'public', 'sprites', 'props')
    pal = set(PAL)
    assets = []
    for name, (fn, (w, h), zweck, orte) in ALLE.items():
        im = fn().image()
        data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
        assert im.size == (w, h) and all(px[3] in (0, 255) and (px[3] == 0 or px[:3] in pal) for px in data), name
        p = os.path.join(od, name + '.png')
        im.save(p)
        assets.append({'id': name, 'file': f'props/{name}.png', 'width': w, 'height': h, 'zweck': zweck, 'orte': orte, 'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()})
        print(name)
    json.dump({'version': 1, 'batch': 'cw-kulissen', 'city': 'calderwick', 'palette': 'manifest-calderwick2.json', 'erzeugt': 'python3 tools/art/cw_kulissen/assets.py',
               'origin': 'unten mittig auf dem Platzhalter-Klotz', 'assets': assets},
              open(os.path.join(ROOT, 'public', 'sprites', 'manifest-cw-kulissen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
