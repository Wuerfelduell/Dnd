"""Zehn Requisiten für Wexmoor: Torfbrüche, Vergessmoor, Salzwatt, Floßfriedhof, Lichtamt (python3 tools/art/wx_kulissen/assets.py).
-> public/sprites/props/wxr_*.png, manifest-wx-kulissen.json. Palette und Pinsel: tools/art/vm_kulissen/pinsel.py (= manifest-wexmoor8.json,
dieselbe Palette wie die Wexmoor-Straßenmöbel wx2_*). Binäres Alpha, Umriss #1a1c2c, Licht oben links, körnige Flächen.
Keine Doppelungen: Pumpe, Salzberg, Torfstapel, Torfsode, Schubkarre, Glockenpfahl, Laternenregal und Aktenschränke gibt es schon."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
from pinsel import *
import pinsel

assert pinsel.PAL[31] == (0x6f, 0xe0, 0xd0) and pinsel.PAL[8] == (0xd4, 0xd9, 0xca)   # Wexmoor-/Varrowmouth-Palette
HOLZ_GRAU = [10, 25, 12, 13, 14]
EISEN = [1, 10, 11, 12, 13]
DUNKEL = [0, 1, 10]
TORF_R = [10, 25, 26, 27]
REISIG = [0, 10, 25, 26, 27]
STOFF = [13, 14, 15, 9]
GLUT = [28, 29, 30, 9]


def balken(b, x0, y0, x1, y1, ramp=HOLZ, s=0, licht=0.6):
    b.rechteck(x0, y0, x1, y1, ramp, 0.55, 0.3, licht=licht, s=s)


def pfosten(b, x, y0, y1, w=3, ramp=HOLZ, s=0):
    b.zylinder(x, x + w - 1, y0, y1, ramp, korn=0.3, s=s, hell=0.68)


def rad(b, cx, cy, r, s=0):
    b.ellipse(cx, cy, r, r, HOLZ_NASS, korn=0.2, s=s)
    b.ellipse(cx, cy, max(1, r - 2), max(1, r - 2), DUNKEL, korn=0.1, s=s + 1)
    for a in range(0, 360, 60):
        for t in range(0, r - 1):
            b.set(int(round(cx + math.cos(math.radians(a)) * t)), int(round(cy + math.sin(math.radians(a)) * t)), 26)
    b.set(int(cx), int(cy), 27)


def glimmen(b, cx, cy, r, ramp, dichte=1.0):
    bay = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    for y in range(int(cy - r), int(cy + r + 1)):
        for x in range(int(cx - r), int(cx + r + 1)):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r
            if d <= 1 and (1 - d) * dichte * 1.4 > bay[y % 4][x % 4] / 16 and 0 <= x < b.w and 0 <= y < b.h:
                b.set(x, y, ramp[min(len(ramp) - 1, int((1 - d) * len(ramp)))])


# --- Torfbrüche ----------------------------------------------------------------------------------------------------------------------
def stuetzjoch():
    """Türstock im Torfstollen: zwei Stempel, Kappe mit Keilen, Verzugbretter oben, dahinter Torfwand; Grus am Fuß"""
    b = Bild(32, 40, seed=701)
    b.rechteck(6, 6, 25, 38, [10, 25, 26, 27], 0.45, 0.45, licht=0.3, s=9)   # Torfwand hinter dem Ausbau (kein Durchgang)
    for (x, y) in ((9, 12), (18, 9), (14, 20), (21, 24), (10, 27), (16, 25), (22, 15)):   # Wurzelfasern, Grus
        b.set(x, y, 10); b.set(x + 1, y, 28)
    for x in range(7, 25, 3):                                         # Verzugbretter (senkrecht, oben)
        b.zylinder(x, x + 1, 7, 16 + (x * 7) % 5, HOLZ_NASS, korn=0.3, s=x, hell=0.6)
    pfosten(b, 3, 6, 38, 4, HOLZ, 1); pfosten(b, 25, 6, 38, 4, HOLZ, 2)
    balken(b, 1, 3, 30, 7, HOLZ, 3)
    for x in range(1, 31):
        if h3(x, 5, 4) < 0.35:
            b.set(x, 5, 25)
    for (x, y) in ((3, 8), (27, 8)):                                  # Keile unter der Kappe
        b.rechteck(x, y, x + 3, y + 1, [26, 27, 28], 0.6, 0.1)
    for x in range(1, 31):                                            # Grus am Fuß
        if h3(x, 39, 5) < 0.75:
            b.set(x, 39, 25 if x % 3 else 10)
        if 7 <= x <= 24 and h3(x, 38, 6) < 0.4:
            b.set(x, 38, 26)
    b.umriss(OUT)
    return b

def torfpresse():
    """Schraubenpresse für Torfbriketts: Rahmen, Spindel mit Handrad, Pressbett mit Torf, Brikettstapel"""
    b = Bild(32, 32, seed=702)
    pfosten(b, 3, 6, 28, 3, HOLZ, 1); pfosten(b, 19, 6, 28, 3, HOLZ, 2)
    balken(b, 2, 4, 22, 7, HOLZ, 3)
    balken(b, 2, 22, 22, 26, HOLZ_NASS, 4)
    b.rechteck(6, 18, 18, 22, TORF_R, 0.5, 0.35, licht=0.4, s=5)     # Torf im Pressbett
    b.rechteck(6, 15, 18, 17, EISEN, 0.6, 0.2, licht=0.5, s=6)       # Pressplatte
    b.zylinder(11, 13, 2, 15, EISEN, korn=0.15, s=7, hell=0.7)        # Spindel
    for y in range(3, 15, 2):
        b.set(11, y, 10)
    b.ellipse(12, 2.5, 6, 1.6, EISEN, korn=0.1, s=8)                 # Handrad
    b.ellipse(12, 2.5, 4, 0.8, DUNKEL, korn=0, s=8)
    for y in (21, 24, 27):                                            # Brikettstapel rechts
        for k in range(2):
            b.rechteck(23, y + k * 0, 30, y + 2, TORF_R, 0.55, 0.3, licht=0.5, s=9 + y)
        b.set(23, y + 2, 10)
    b.rechteck(23, 28, 30, 29, TORF_R, 0.5, 0.3, s=12)
    for x in range(2, 31):
        b.set(x, 30, 25 if h3(x, 30, 3) < 0.6 else 26)
    b.umriss(OUT)
    return b


# --- Vergessmoor ---------------------------------------------------------------------------------------------------------------------
def versunkener_karren():
    """Halb versunkener Handkarren: schräger Kasten, ein Rad über dem Schlamm, Wasserring, Schilfhalme"""
    b = Bild(32, 24, seed=703)
    b.ellipse(16, 19, 15, 4.5, [1, 21, 22, 23], korn=0.25, s=1)       # Moorwasser
    b.poly([(4, 11), (24, 6), (27, 15), (7, 20)], HOLZ_GRAU, vfn=lambda x, y: 0.7 - 0.015 * x - 0.01 * y, korn=0.35, s=2)
    for t in range(0, 4):                                             # Bretterfugen
        x0, y0 = 6 + t * 5, 11 - t
        for k in range(0, 8):
            b.set(x0 + k // 3, y0 + k, 10)
    for t in range(0, 20):                                            # Kastenrand oben
        b.set(4 + t, 11 - t // 4, 14)
    rad(b, 22, 15, 5, 3)
    for x in range(1, 31):                                            # Schlammlinie
        y = 18 + (1 if (x // 3) % 2 else 0)
        if b.get(x, y) is not None:
            b.set(x, y, 25 if h3(x, y, 4) < 0.6 else 10)
    for (x, h) in ((2, 6), (29, 7), (27, 5)):                         # Schilf
        for y in range(19 - h, 19):
            b.set(x, y, 18 if y > 19 - h + 1 else 20)
    for t in range(0, 7):                                             # Deichsel ragt heraus
        b.set(3 - t // 3 + 1, 12 - t, 26)
    b.umriss(OUT)
    return b


def faschinen():
    """Faschinen für den Bohlenweg: gebundene Reisigbündel gestapelt, Pflöcke daneben"""
    b = Bild(32, 24, seed=704)
    lagen = [(3, 15, 26), (6, 11, 23), (4, 7, 18)]
    for i, (x0, y0, x1) in enumerate(lagen):
        b.rechteck(x0, y0, x1, y0 + 5, REISIG, 0.5, 0.45, licht=0.5, s=10 + i)
        for x in range(x0, x1 + 1):                                   # Zweige als Striche
            for y in range(y0, y0 + 6):
                if (x * 3 + y * 7 + i) % 5 == 0:
                    b.set(x, y, 10)
                elif (x + y * 2) % 7 == 0:
                    b.set(x, y, 27)
        b.ellipse(x0, y0 + 2.5, 1.6, 2.8, [25, 26, 27], korn=0.2, s=20 + i)   # Schnittfläche
        for bx in (x0 + 5, x1 - 4):                                   # Bindung
            for y in range(y0, y0 + 6):
                b.set(bx, y, 15 if y % 2 else 14)
    for (x, top) in ((28, 9), (30, 11)):                              # Pflöcke
        for y in range(top, 22):
            b.set(x, y, 26 if y > top else 28)
            b.set(x + 1, y, 25)
    for x in range(1, 31):
        if h3(x, 22, 6) < 0.6:
            b.set(x, 22, 17 if x % 2 else 18)
    b.umriss(OUT)
    return b


# --- Salzwatt ------------------------------------------------------------------------------------------------------------------------
def gradierwerk():
    """Stück Gradierwerk: Holzgerüst mit Dornenreisig, Sole tropft, Salzkruste am Fuß, Rinne oben"""
    b = Bild(48, 40, seed=705)
    for x in (2, 15, 30, 43):
        pfosten(b, x, 4, 35, 3, HOLZ_GRAU, x)
    balken(b, 1, 3, 46, 6, HOLZ_GRAU, 1)
    b.rechteck(2, 1, 45, 3, [10, 21, 22, 23], 0.5, 0.2, s=2)        # Solerinne
    for x in range(3, 45):
        b.set(x, 2, 23 if x % 4 else 24)
    for y in range(7, 33):                                            # Dornenwand: dichte, schräge Reisigstriche
        for x in range(3, 45):
            if b.get(x, y) is not None:
                continue
            strich = (x + y * 2 + int(h3(x // 3, y // 5, 3) * 4)) % 4
            v = 0.62 - 0.01 * x - (0.25 if strich == 0 else 0) + (0.15 if strich == 2 else 0)
            b.ton(x, y, [10, 25, 26, 27, 13], max(0, min(1, v)), 0.25, 4)
            if y > 24 and h3(x, y, 8) < (y - 24) * 0.05:
                b.set(x, y, 7 if h3(x, y, 9) < 0.5 else 8)           # Salz setzt sich unten ab
    for x in (8, 21, 36):                                             # Tropfspuren
        for y in range(7, 33, 2):
            b.set(x + (y // 6) % 2, y, 7 if y % 4 else 8)
    b.rechteck(1, 33, 46, 37, SALZ, 0.6, 0.35, licht=0.5, s=5)      # Salzkruste und Becken
    for x in range(2, 46):
        b.set(x, 33, 9 if h3(x, 33, 6) < 0.5 else 8)
        if h3(x, 36, 7) < 0.3:
            b.set(x, 36, 23)
    b.umriss(OUT)
    return b


def solebrunnen():
    """Solebrunnen: Brunnenkasten, Haspel mit Kurbel unter kleinem Dach, Eimer, weiße Kruste"""
    b = Bild(32, 32, seed=706)
    pfosten(b, 5, 6, 22, 2, HOLZ_GRAU, 1); pfosten(b, 24, 6, 22, 2, HOLZ_GRAU, 2)
    b.poly([(2, 7), (16, 1), (30, 7), (27, 9), (16, 4), (5, 9)], HOLZ_NASS, vfn=lambda x, y: 0.6 - 0.012 * x, korn=0.3, s=3)   # Dach
    b.zylinder(7, 24, 12, 13, HOLZ, korn=0.2, s=4)                   # Haspelwelle (liegend)
    for x in range(7, 25):
        b.set(x, 12, 27); b.set(x, 13, 25)
    for y in range(12, 17):                                           # Kurbel rechts
        b.set(27, y, 11)
    b.set(26, 12, 11); b.set(28, 16, 12); b.set(29, 16, 12)
    for y in range(14, 19):                                           # Seil, Eimer
        b.set(15, y, 15)
    b.rechteck(13, 19, 17, 22, EISEN, 0.6, 0.2, licht=0.5, s=5)
    b.set(13, 19, 13); b.set(17, 19, 11)
    b.rechteck(3, 21, 28, 29, STEIN, 0.5, 0.35, licht=0.5, s=6)     # Brunnenkasten aus Stein
    for x in range(3, 29):                                            # Fugen und Kruste
        if x % 6 == 0:
            for y in range(22, 29):
                b.set(x, y, 11)
        b.set(x, 25, 11) if x % 2 else None
        b.set(x, 21, 9 if h3(x, 21, 7) < 0.6 else 8)
        if h3(x, 29, 8) < 0.5:
            b.set(x, 30, 8)
    b.rechteck(6, 21, 25, 22, [21, 22, 23, 24], 0.6, 0.2, s=9)        # Sole im Schacht
    b.umriss(OUT)
    return b


# --- Floßfriedhof --------------------------------------------------------------------------------------------------------------------
def totenfloss():
    """Kleines Totenfloß: Planken, Gestalt im Leinentuch, Schilfkranz, vier Kerzen"""
    b = Bild(32, 24, seed=707)
    for i, y in enumerate((14, 16, 18)):                              # Planken
        b.rechteck(1 + i, y, 30 - i, y + 1, HOLZ_NASS, 0.55, 0.35, licht=0.4, s=1 + i)
        b.set(1 + i, y + 1, 10)
    b.rechteck(2, 20, 29, 21, [1, 10, 25], 0.4, 0.2, s=4)             # Unterseite, nass
    b.ellipse(16, 12, 10, 3.6, STOFF, korn=0.25, s=5)               # Leinentuch
    b.ellipse(7.5, 11.5, 3, 2.6, STOFF, korn=0.2, s=6)              # Kopf unter dem Tuch
    for x in range(9, 25, 4):                                         # Falten
        b.set(x, 12, 13); b.set(x + 1, 13, 13)
    for x in range(4, 26):                                            # Schilfkranz am Rand
        if x % 2 == 0:
            b.set(x, 15, 18); b.set(x + 1, 15, 19)
    for (x, h) in ((3, 4), (27, 5), (21, 3), (12, 3)):                # Kerzen
        for y in range(15 - h, 15):
            b.set(x, y, 9 if y > 15 - h else 8)
            b.set(x + 1, y, 7)
    b.umriss(OUT)
    for (x, h) in ((3, 4), (27, 5), (21, 3), (12, 3)):                # Flammen ohne Umriss
        b.set(x, 14 - h, 30); b.set(x, 13 - h, 29)
    return b


def sargstapel():
    """Drei schlichte Särge gestapelt, einer mit Kreidezeichen, Seil um den unteren"""
    b = Bild(32, 32, seed=708)
    def sarg(x0, y0, x1, s, kreide=False):
        b.poly([(x0, y0 + 2), (x0 + 3, y0), (x1 - 2, y0), (x1, y0 + 2), (x1, y0 + 7), (x0, y0 + 7)], HOLZ_GRAU,
               vfn=lambda x, y: 0.72 - 0.012 * (x - x0) - 0.03 * (y - y0), korn=0.3, s=s)
        for x in range(x0 + 1, x1):                                   # Deckelkante
            b.set(x, y0 + 3, 10)
        for x in range(x0 + 2, x1 - 1):
            b.set(x, y0 + 1, 14 if h3(x, y0, s) < 0.6 else 13)
        if kreide:
            for (dx, dy) in ((5, 5), (6, 6), (7, 5), (6, 4), (6, 5)):
                b.set(x0 + dx, y0 + dy, 9)
    sarg(1, 23, 18, 1)
    sarg(14, 23, 31, 2)
    sarg(6, 15, 25, 3, kreide=True)
    for y in range(23, 31):                                           # Seil
        b.set(10, y, 15 if y % 2 else 14)
    for x in range(1, 32):
        b.set(x, 31, 25 if h3(x, 31, 4) < 0.6 else 10)
    b.umriss(OUT)
    return b


# --- Lichtamt ------------------------------------------------------------------------------------------------------------------------
def lichtmessbank():
    """Lichtmessbank (Photometer): Tisch mit Maßschiene, Prüflampe links, Normkerze rechts, Schirm auf dem Schlitten"""
    b = Bild(48, 32, seed=709)
    b.rechteck(2, 16, 45, 20, HOLZ, 0.55, 0.3, licht=0.6, s=1)      # Tischplatte
    for x in (3, 42):
        b.zylinder(x, x + 2, 21, 30, HOLZ, korn=0.2, s=2)
    b.rechteck(5, 26, 42, 27, HOLZ_NASS, 0.5, 0.2, s=3)              # Querstrebe
    b.rechteck(4, 14, 43, 15, MESSING, 0.6, 0.15, s=4)              # Maßschiene
    for x in range(5, 43, 3):
        b.set(x, 14, 25)
    b.rechteck(5, 6, 10, 13, EISEN, 0.6, 0.2, licht=0.5, s=5)        # Prüflampe im Gehäuse
    b.rechteck(6, 8, 9, 11, GLUT, 0.7, 0.2, s=6)
    b.rechteck(7, 3, 8, 5, EISEN, 0.5, 0.1, s=7)
    b.rechteck(22, 5, 25, 13, [6, 7, 8, 9], 0.75, 0.15, licht=0.4, s=8)   # Schirm auf Schlitten
    b.rechteck(21, 12, 26, 13, EISEN, 0.5, 0.1, s=9)
    b.set(23, 8, 30); b.set(24, 9, 29)                               # Fettfleck leuchtet
    for y in range(9, 14):                                            # Normkerze
        b.set(38, y, 9); b.set(39, y, 8)
    b.rechteck(36, 13, 41, 13, MESSING, 0.5, 0.1, s=10)
    b.rechteck(30, 9, 33, 12, [25, 27, 28], 0.6, 0.1, s=11)          # Ablesekarte
    b.set(31, 10, 10); b.set(32, 11, 10)
    b.umriss(OUT)
    b.set(38, 8, 30); b.set(38, 7, 29)                               # Kerzenflamme
    glimmen(b, 7.5, 9.5, 4, [28, 29, 30], 0.6)
    return b


def plombenpresse():
    """Plombenpresse: gusseiserner Hebel auf Bock, Matrize, Schale mit Bleiplomben und Draht"""
    b = Bild(32, 32, seed=710)
    b.rechteck(6, 20, 25, 23, HOLZ, 0.55, 0.3, licht=0.6, s=1)      # Bock
    for x in (7, 22):
        b.zylinder(x, x + 2, 24, 30, HOLZ, korn=0.2, s=2)
    b.rechteck(11, 11, 17, 19, EISEN, 0.6, 0.25, licht=0.6, s=3)     # Ständer
    b.rechteck(10, 17, 18, 19, EISEN, 0.5, 0.2, s=4)
    for t in range(0, 15):                                            # Hebel schräg nach rechts oben
        x, y = 15 + t, 11 - t // 2
        b.set(x, y, 12); b.set(x, y + 1, 11)
    b.ellipse(30, 3.5, 1.8, 1.8, EISEN, korn=0.1, s=5)               # Knauf
    b.ellipse(14, 10, 2.5, 2.5, EISEN, korn=0.1, s=6)                # Gelenk
    b.set(14, 10, 13)
    b.rechteck(12, 14, 16, 15, MESSING, 0.6, 0.1, s=7)               # Matrize
    b.ellipse(21.5, 19, 3.2, 1.4, STEIN, korn=0.2, s=8)              # Schale
    for (x, y) in ((20, 18), (22, 18), (21, 17), (23, 19)):          # Bleiplomben
        b.set(x, y, 13 if (x + y) % 2 else 14)
    for t in range(0, 7):                                             # Draht
        b.set(3 + t, 19 + (t % 2), 6)
    b.umriss(OUT)
    return b


ALLE = {
    'wxr_stuetzjoch': (stuetzjoch, 'Grubenholz: Stempel, Kappe, Streben', 'wx_torfbrueche'),
    'wxr_torfpresse': (torfpresse, 'Schraubenpresse für Torfbriketts', 'wx_torfbrueche'),
    'wxr_versunkener_karren': (versunkener_karren, 'halb versunkener Handkarren im Moorwasser', 'wx_vergessmoor'),
    'wxr_faschinen': (faschinen, 'Faschinen (Reisigbündel) für den Bohlenweg, Pflöcke', 'wx_vergessmoor'),
    'wxr_gradierwerk': (gradierwerk, 'Stück Gradierwerk mit Dornenreisig, Sole und Salzkruste', 'wx_salzwatt'),
    'wxr_solebrunnen': (solebrunnen, 'Solebrunnen mit Haspel, Eimer und Kruste', 'wx_salzwatt'),
    'wxr_totenfloss': (totenfloss, 'kleines Totenfloß mit Leinentuch, Schilfkranz, Kerzen', 'wx_flossfriedhof'),
    'wxr_sargstapel': (sargstapel, 'drei schlichte Särge gestapelt, Kreidezeichen', 'wx_flossfriedhof'),
    'wxr_lichtmessbank': (lichtmessbank, 'Lichtmessbank: Prüflampe, Schirm auf Schlitten, Normkerze', 'wx_lichtamt'),
    'wxr_plombenpresse': (plombenpresse, 'Plombenpresse mit Bleiplomben und Draht', 'wx_lichtamt'),
}

if __name__ == '__main__':
    od = os.path.join(ROOT, 'public', 'sprites', 'props')
    pal = set(pinsel.PAL)
    assets = []
    for name, (fn, zweck, ort) in ALLE.items():
        im = fn().image()
        data = im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()
        assert all(px[3] in (0, 255) and (px[3] == 0 or px[:3] in pal) for px in data), name
        p = os.path.join(od, name + '.png')
        im.save(p)
        assets.append({'id': name, 'file': f'props/{name}.png', 'width': im.width, 'height': im.height, 'zweck': zweck, 'ort': ort,
                       'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()})
        print(name, im.size)
    json.dump({'version': 1, 'batch': 'wx-kulissen', 'palette': 'manifest-wexmoor8.json', 'erzeugt': 'python3 tools/art/wx_kulissen/assets.py', 'origin': 'unten mittig',
               'assets': assets}, open(os.path.join(ROOT, 'public', 'sprites', 'manifest-wx-kulissen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
