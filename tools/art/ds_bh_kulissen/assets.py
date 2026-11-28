"""Je fünf Requisiten für Dunscar und Briarholt (python3 tools/art/ds_bh_kulissen/assets.py).
-> public/sprites/props/dsk_*.png, bhk_*.png, manifest-ds-bh-kulissen.json. Palette: manifest-dunscar1.json (= manifest-briarholt1.json), Farben über Hexwerte."""
import hashlib, json, math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
import pinsel
from pinsel import Bild, h3, ROOT

PAL = pinsel.palette_aus('manifest-dunscar1.json')
HEX = ['#%02x%02x%02x' % c for c in PAL]
C = lambda h: HEX.index(h)
R = lambda *hs: [C(h) for h in hs]
OUT = C('#1a1c2c')
GRAU = R('#252b38', '#303b49', '#425360', '#586c78', '#71858b', '#95a5a5', '#a8b4c0')
EISEN = R('#1a1c2c', '#252b38', '#303b49', '#425360', '#586c78')
HOLZ = R('#2d2629', '#58433c', '#715648', '#92745a', '#b3946e')
KALK = R('#b3946e', '#cfb18a', '#e0c9a1', '#eee2c5')
MESSING = R('#886332', '#d0a050', '#e8b860', '#f0ce80')
TEAL = R('#173d40', '#245b59', '#36817a', '#4eafa2')
LILA = R('#5c426a', '#8c7295', '#c8b0e8')
ROT = C('#893e4e')
CREME = C('#eee2c5')
GLUT = R('#893e4e', '#d0a050', '#e8b860', '#f0ce80')


def glow(b, cx, cy, r, ramp, dichte=1.0):
    bay = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
    for y in range(int(cy - r), int(cy + r + 1)):
        for x in range(int(cx - r), int(cx + r + 1)):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r
            if d <= 1 and (1 - d) * dichte * 1.4 > bay[y % 4][x % 4] / 16 and 0 <= x < b.w and 0 <= y < b.h:
                b.set(x, y, ramp[min(len(ramp) - 1, int((1 - d) * len(ramp)))])


def rad(b, cx, cy, r, s=0):
    b.ellipse(cx, cy, r, r, EISEN, korn=0.1, s=s)
    b.ellipse(cx, cy, max(1, r - 2), max(1, r - 2), GRAU[1:4], korn=0.1, s=s + 1)
    b.set(int(cx), int(cy), GRAU[5])


# --- Dunscar ----------------------------------------------------------------------------------------------------------------------
def kalkbrecher():
    b = Bild(48, 48, seed=301)
    b.rechteck(6, 18, 33, 38, EISEN, 0.55, 0.2, licht=0.6, s=1)                 # Brechergehäuse
    for x in range(8, 32, 4):                                                    # Nieten
        b.set(x, 20, GRAU[5]); b.set(x, 36, GRAU[5])
    b.poly([(4, 4), (36, 4), (28, 18), (12, 18)], EISEN, vfn=lambda x, y: 0.7 - 0.02 * (x - 4) - 0.01 * y)   # Trichter
    for x in range(6, 35):
        b.set(x, 5, GRAU[4])
    for x in range(8, 33):                                                       # Kalkbrocken im Trichter
        for y in range(1, 5):
            if h3(x, y, 5) < 0.55 + 0.1 * (y - 1):
                b.ton(x, y, KALK, 0.4 + 0.5 * h3(x, y, 6), 0.1, 7)
    for i in range(3):                                                           # Brechwalzen-Zähne im Sichtfenster
        cx = 13 + i * 7
        b.ellipse(cx, 26, 3, 3, GRAU[1:5])
        for t in range(0, 360, 60):
            a = math.radians(t + i * 20)
            b.set(int(cx + math.cos(a) * 3), int(26 + math.sin(a) * 3), GRAU[6])
    rad(b, 40, 22, 6, s=8)                                                       # Schwungrad mit Riemen
    for t in range(14):
        b.set(34 - t // 3, 18 + t, HOLZ[1]); b.set(40 - t // 6, 28 + t // 2, HOLZ[1])
    b.poly([(16, 38), (26, 38), (30, 44), (12, 44)], EISEN, vfn=lambda x, y: 0.5)   # Rutsche
    for x in range(4, 44):                                                       # Kalkhaufen
        top = 46 - int(6 * math.exp(-((x - 21) / 9) ** 2))
        for y in range(top, 48):
            b.ton(x, y, KALK, 0.8 - 0.4 * (y - top) / 6 - 0.15 * (x > 24), 0.25, 9)
    b.umriss(OUT)
    glow(b, 22, 42, 6, R('#e0c9a1', '#eee2c5'), 0.35)                            # Kalkstaub
    return b


def kalkkarren():
    b = Bild(48, 32, seed=302)
    b.poly([(5, 12), (41, 12), (37, 24), (9, 24)], HOLZ, vfn=lambda x, y: 0.7 - 0.012 * (x - 5) - 0.02 * (y - 12))
    for x in (12, 23, 34):
        for y in range(13, 24):
            b.set(x, y, EISEN[2])
    for x in range(6, 41):
        b.set(x, 12, HOLZ[4])
    for x in range(6, 41):                                                       # Kalkladung
        top = 12 - int(5 * math.exp(-((x - 23) / 11) ** 2) + 2 * h3(x, 1, 3))
        for y in range(top, 12):
            b.ton(x, y, KALK, 0.5 + 0.45 * h3(x, y, 4), 0.1, 5)
    for x in (12, 34):
        rad(b, x, 26, 4, s=6)
    for t in range(8):                                                           # Deichsel
        b.set(41 + t // 2, 18 - t // 3, HOLZ[2]); b.set(41 + t // 2, 19 - t // 3, HOLZ[1])
    b.rechteck(2, 30, 46, 31, EISEN, 0.5, 0.1)                                   # Schienenstück
    b.umriss(OUT)
    return b


def prellbock():
    b = Bild(32, 32, seed=303)
    b.rechteck(0, 28, 31, 31, HOLZ, 0.35, 0.2)                                   # Schwellen
    for x in (5, 26):
        b.rechteck(x, 26, x + 1, 31, EISEN, 0.6, 0.1)                             # Schienen
    for x0 in (4, 25):                                                           # schräge Stützen
        for t in range(14):
            b.set(x0 + (t // 3 if x0 < 16 else -t // 3), 26 - t, HOLZ[2]); b.set(x0 + 1 + (t // 3 if x0 < 16 else -t // 3), 26 - t, HOLZ[1])
    b.rechteck(3, 8, 28, 14, HOLZ, 0.65, 0.2, licht=0.6)                          # Querbalken
    for x in range(4, 28, 4):
        for y in range(9, 14):
            b.set(x + (y - 9) // 2, y, ROT if (x // 4) % 2 else CREME)            # Warnstreifen
    for cx in (9, 22):                                                            # Puffer
        b.ellipse(cx, 18, 3, 3, GRAU[1:6])
        b.rechteck(cx - 1, 14, cx + 1, 16, EISEN, 0.5, 0.1)
    b.streu(lambda x, y: y > 27, KALK[2], 0.08)
    b.umriss(OUT)
    return b


def laeutewerk():
    """Streckenläutewerk: Säule mit Glockengehäuse, Glocke, Schlaghammer, Schutzdach"""
    b = Bild(24, 48, seed=304)
    b.rechteck(7, 43, 16, 47, GRAU, 0.45, 0.2, licht=0.5)                         # Sockel
    for y in range(18, 44):                                                       # Säule
        b.ton(10, y, EISEN, 0.8, 0.1, 1); b.ton(11, y, EISEN, 0.6, 0.1, 1); b.ton(12, y, EISEN, 0.35, 0.1, 1); b.ton(13, y, EISEN, 0.2, 0.1, 1)
    for y in (24, 34):
        b.rechteck(9, y, 14, y, GRAU, 0.6, 0)
    b.rechteck(5, 8, 18, 18, EISEN, 0.4, 0.15, licht=0.5)                         # Gehäuse
    b.ellipse(11.5, 14, 4.5, 4, MESSING)                                          # Glocke
    for x in range(8, 16):
        b.set(x, 17, MESSING[0])
    b.set(10, 12, MESSING[3]); b.set(11, 11, MESSING[3])
    for t in range(6):                                                            # Schlaghammer
        b.set(17 - t // 2, 9 + t, GRAU[4])
    b.ellipse(14, 15, 1.2, 1.2, GRAU[2:6])
    b.poly([(3, 8), (20, 8), (11.5, 3)], EISEN, vfn=lambda x, y: 0.55)            # Schutzdach
    b.rechteck(16, 26, 18, 30, MESSING, 0.5, 0.1)                                 # Kurbelkasten
    b.set(19, 28, GRAU[5])
    b.umriss(OUT)
    for (x, y) in ((2, 12), (1, 14), (21, 12), (22, 14)):                         # Schall (türkis wie die Horchrohre)
        b.set(x, y, C('#4eafa2'))
    return b


def schlackenkuebel():
    b = Bild(48, 40, seed=305)
    b.rechteck(6, 28, 41, 32, EISEN, 0.45, 0.15)                                  # Fahrgestell
    for x in (12, 36):
        rad(b, x, 34, 5, s=x)
    for y in range(6, 28):                                                        # Kübel (Kugelsegment)
        w = 16 - int(((y - 6) / 22) ** 2 * 6)
        for x in range(24 - w, 24 + w):
            b.ton(x, y, EISEN, 0.6 - 0.025 * (x - 24 + w) - 0.01 * (y - 6), 0.2, 3)
    for x in range(8, 40):                                                        # Rand
        b.set(x, 6, GRAU[4]); b.set(x, 7, GRAU[2])
    for x in range(9, 39):                                                        # glühende Schlacke mit Kruste
        for y in range(3, 7):
            if y >= 6 - int(2 * math.exp(-((x - 24) / 8) ** 2)) - (1 if h3(x, 0, 6) < 0.3 else 0):
                b.set(x, y, GLUT[min(3, int(h3(x, y, 7) * 4))] if h3(x, y, 8) < 0.7 else EISEN[2])
    for (x0, y0) in ((6, 16), (41, 16)):                                          # Zapfen
        b.ellipse(x0, y0, 2, 2, GRAU[2:6])
    for y in range(12, 26, 4):                                                    # Glutrisse
        x = 18 + (y * 7) % 13
        b.set(x, y, GLUT[1]); b.set(x + 1, y + 1, GLUT[0])
    b.umriss(OUT)
    glow(b, 24, 4, 9, GLUT, 0.45)
    return b


# --- Briarholt -----------------------------------------------------------------------------------------------------------------------
def pfosten(b, x0, y0, y1, ramp):
    for y in range(y0, y1 + 1):
        b.ton(x0, y, ramp, 0.75, 0.1, 1); b.ton(x0 + 1, y, ramp, 0.35, 0.1, 1)


def glashauslaterne():
    b = Bild(16, 48, seed=311)
    b.rechteck(5, 44, 10, 47, EISEN, 0.5, 0.1)
    pfosten(b, 7, 14, 44, EISEN)
    for y in range(20, 40, 5):                                                    # Rankenwerk
        b.set(6, y, TEAL[2]); b.set(9, y + 2, TEAL[2]); b.set(5, y + 1, TEAL[1])
    b.poly([(3, 6), (12, 6), (11, 15), (4, 15)], TEAL, vfn=lambda x, y: 0.7 - 0.06 * (x - 3))  # Glashaus-Laterne
    for x in (4, 7, 8, 11):
        for y in range(6, 15):
            b.set(x, y, EISEN[2])
    for x in range(3, 13):
        b.set(x, 10, EISEN[2])
    b.set(6, 8, MESSING[3]); b.set(9, 8, MESSING[3]); b.set(6, 12, MESSING[2]); b.set(9, 12, MESSING[2])
    b.poly([(2, 6), (13, 6), (7.5, 1)], EISEN, vfn=lambda x, y: 0.6)              # Dach als Glashausgiebel
    b.set(7, 0, MESSING[1])
    b.umriss(OUT)
    glow(b, 7.5, 10.5, 6, R('#e8b860', '#f0ce80'), 0.35)
    return b


def rohrlaterne():
    b = Bild(16, 48, seed=312)
    b.rechteck(4, 44, 11, 47, EISEN, 0.5, 0.1)
    for y in range(14, 45):                                                       # Dampfrohr als Pfosten
        b.ton(6, y, MESSING, 0.7, 0.1, 2); b.ton(7, y, MESSING, 0.5, 0.1, 2); b.ton(8, y, MESSING, 0.3, 0.1, 2)
    for y in (20, 32):                                                            # Flansche
        b.rechteck(5, y, 9, y, EISEN, 0.6, 0)
    b.ellipse(11, 27, 2.5, 2.5, R('#e0c9a1', '#eee2c5'))                           # Manometer
    b.set(11, 27, OUT); b.set(12, 26, ROT); b.set(9, 27, MESSING[1])
    rad(b, 3, 37, 2, s=3)                                                         # Ventilrad
    b.rechteck(4, 4, 11, 13, EISEN, 0.35, 0.1)                                    # Käfiglampe
    for y in range(5, 13):
        for x in range(5, 11):
            b.set(x, y, EISEN[2] if x in (5, 8) or y in (5, 9) else (MESSING[3] if (x + y) % 3 else MESSING[2]))
    b.rechteck(3, 2, 12, 3, EISEN, 0.5, 0)
    b.umriss(OUT)
    glow(b, 8, 9, 6, R('#e8b860', '#f0ce80'), 0.35)
    for y in range(0, 3):                                                         # Dampffaden
        b.set(10 + y % 2, y, R('#a8b4c0')[0])
    return b


def stillenlaterne():
    b = Bild(16, 48, seed=313)
    b.rechteck(5, 44, 10, 47, GRAU, 0.6, 0.1)
    for y in range(16, 45):                                                       # weiß gestrichener Pfosten, abgeblättert
        b.ton(7, y, R('#95a5a5', '#a8b4c0', '#eee2c5'), 0.8 if h3(7, y, 1) > 0.15 else 0.1, 0.1, 1)
        b.ton(8, y, R('#71858b', '#95a5a5', '#a8b4c0'), 0.4, 0.1, 1)
    b.rechteck(6, 14, 9, 15, GRAU, 0.5, 0)
    b.ellipse(7.5, 9, 4.5, 5, R('#a8b4c0', '#e0c9a1', '#eee2c5'), korn=0.05)       # Milchglaskugel
    b.set(5, 7, CREME); b.set(6, 6, CREME)
    b.poly([(2, 4), (13, 4), (11, 1), (4, 1)], GRAU, vfn=lambda x, y: 0.5)        # Schirm
    b.umriss(OUT)
    glow(b, 7.5, 9, 7, R('#e0c9a1', '#eee2c5'), 0.3)
    return b


def probenkiste():
    b = Bild(32, 32, seed=314)
    b.rechteck(2, 14, 29, 18, HOLZ, 0.65, 0.2, licht=0.6)                         # Deckel offen hinten
    b.rechteck(2, 19, 29, 30, HOLZ, 0.45, 0.2, licht=0.5)
    for x in (2, 15, 29):
        for y in range(19, 31):
            b.set(x, y, HOLZ[0])
    b.rechteck(9, 23, 22, 26, R('#cfb18a', '#e0c9a1'), 0.6, 0.1)                   # Etikett
    for x in range(10, 22, 2):
        b.set(x, 24, HOLZ[1])
    for i, x in enumerate((5, 11, 17, 23)):                                       # Probengläser mit Wurzeln
        for y in range(8, 19):
            b.set(x, y, R('#71858b')[0]); b.set(x + 3, y, R('#425360')[0])
            for xx in (x + 1, x + 2):
                b.set(xx, y, R('#a8b4c0')[0] if y < 11 else LILA[0])
        for y in range(11, 18):
            b.set(x + 1 + (y + i) % 2, y, HOLZ[2])
        b.set(x + 1, 13, LILA[2]); b.rechteck(x, 6, x + 3, 7, HOLZ, 0.5, 0)
    b.umriss(OUT)
    glow(b, 16, 14, 8, LILA, 0.25)
    return b


def waermeschale():
    b = Bild(32, 32, seed=315)
    for (x0, x1) in ((8, 5), (24, 27), (16, 16)):                                 # Dreibein
        for t in range(12):
            b.set(int(x0 + (x1 - x0) * t / 11), 19 + t, EISEN[3]); b.set(int(x0 + (x1 - x0) * t / 11) + 1, 19 + t, EISEN[1])
    b.ellipse(16, 16, 12, 5, EISEN)                                               # Schale
    for x in range(5, 28):
        for y in range(11, 16):
            if ((x - 16) / 10.5) ** 2 + ((y - 14) / 3.2) ** 2 <= 1:
                b.set(x, y, GLUT[min(3, int(h3(x, y, 3) * 4.4))] if h3(x, y, 4) < 0.75 else EISEN[1])
    for x in range(4, 29):
        if b.get(x, 16) is not None:
            b.set(x, 18 if 6 < x < 26 else 17, MESSING[1])                        # Messingband
    for x in range(5, 28, 3):                                                     # Reif am Rand
        b.set(x, 21, R('#a8b4c0')[0])
    b.umriss(OUT)
    glow(b, 16, 10, 9, GLUT, 0.4)
    return b


ALLE = {
    'dsk_kalkbrecher': (kalkbrecher, 'Kalkbrecher mit Trichter, Brechwalzen, Schwungrad und Kalkhaufen', 'ds_klopfbruch (statt der 3x3-Klötze)'),
    'dsk_kalkkarren': (kalkkarren, 'Kipplore voll Kalkbrocken auf einem Schienenstück', 'ds_klopfbruch (statt der 3x2-Klötze)'),
    'dsk_prellbock': (prellbock, 'Prellbock mit Warnstreifen und Puffern', 'ds_endbahnhof, ds_letzter_bahnsteig, ds_runddepot'),
    'dsk_laeutewerk': (laeutewerk, 'Streckenläutewerk mit Glocke, Hammer und Schutzdach (Signalmast verworfen: Formsignale gibt es schon)', 'ds_rufschlucht, ds_rangierwueste'),
    'dsk_schlackenkuebel': (schlackenkuebel, 'Schlackenkübelwagen mit glühender Schlacke', 'ds_schlackengrube'),
    'bhk_glashauslaterne': (glashauslaterne, 'Laterne im Glashausstil mit Rankenwerk', 'bh_glasgaerten (statt Promenaden-Gaslaterne)'),
    'bhk_rohrlaterne': (rohrlaterne, 'Käfiglampe auf einem Dampfrohr mit Manometer und Ventil', 'bh_kesselgrund, bh_wurzelkranz (statt Promenaden-Gaslaterne)'),
    'bhk_stillenlaterne': (stillenlaterne, 'weiß gestrichener Pfosten mit Milchglaskugel', 'bh_stillenhaeuser (statt Promenaden-Gaslaterne)'),
    'bhk_probenkiste': (probenkiste, 'Probenkiste mit Wurzelproben in Gläsern, violett glimmend', 'bh_wurzelkranz, bh_wurzelkammer (statt Kohlenkisten)'),
    'bhk_waermeschale': (waermeschale, 'Wärmeschale auf Dreibein mit Glut, Reif am Rand', 'bh_winterpromenade'),
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
        assets.append({'id': name, 'file': f'props/{name}.png', 'width': im.width, 'height': im.height, 'zweck': zweck, 'orte': orte,
                       'sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest()})
        print(name, im.size)
    json.dump({'version': 1, 'batch': 'ds-bh-kulissen', 'palette': 'manifest-dunscar1.json (= manifest-briarholt1.json)', 'erzeugt': 'python3 tools/art/ds_bh_kulissen/assets.py',
               'origin': 'unten mittig', 'assets': assets}, open(os.path.join(ROOT, 'public', 'sprites', 'manifest-ds-bh-kulissen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
