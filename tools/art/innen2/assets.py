"""Zehn Möbel/Requisiten: Mutterhaus und Labor (Briarholt) und eigene Stücke für die Dunscarer Zirkelräume.
python3 tools/art/innen2/assets.py -> public/sprites/props/bhk_*.png, dsk_*.png, manifest-innen2-kulissen.json. Palette: manifest-dunscar1.json (= briarholt1)."""
import hashlib, json, math, os, sys
import importlib.util
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'vm_kulissen'))
_spec = importlib.util.spec_from_file_location('dsbh_assets', os.path.join(os.path.dirname(__file__), '..', 'ds_bh_kulissen', 'assets.py'))
_dsbh = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_dsbh)
C, R, OUT, GRAU, EISEN, HOLZ, KALK, MESSING, TEAL, LILA, ROT, CREME, GLUT, glow, rad, PAL, ROOT = (_dsbh.C, _dsbh.R, _dsbh.OUT, _dsbh.GRAU, _dsbh.EISEN, _dsbh.HOLZ,
    _dsbh.KALK, _dsbh.MESSING, _dsbh.TEAL, _dsbh.LILA, _dsbh.ROT, _dsbh.CREME, _dsbh.GLUT, _dsbh.glow, _dsbh.rad, _dsbh.PAL, _dsbh.ROOT)
from pinsel import Bild, h3
HOLZ_HELL = R('#58433c', '#715648', '#92745a', '#b3946e', '#cfb18a')
PAPIER = R('#cfb18a', '#e0c9a1', '#eee2c5')


def kasten(b, x0, y0, w, top, front, rt=HOLZ_HELL, rf=HOLZ, s=0):
    b.rechteck(x0, y0, x0 + w - 1, y0 + top - 1, rt, 0.6, 0.25, licht=0.6, s=s)
    b.rechteck(x0, y0 + top, x0 + w - 1, y0 + top + front - 1, rf, 0.5, 0.25, licht=0.5, s=s + 1)
    for x in range(x0, x0 + w):
        b.set(x, y0 + top, rf[0])


def glas(b, cx, yb, h, w, fl, s=0):
    for y in range(yb - h, yb + 1):
        f = (yb - y) / max(1, h)
        r = w / 2 if f < 0.55 else 1
        for x in range(int(cx - r + 0.5), int(cx + r + 0.5)):
            b.set(x, y, fl[min(len(fl) - 1, int((x - cx + r) / max(1, 2 * r) * len(fl)))] if f < 0.4 else (GRAU[5] if x < cx else GRAU[4]))
    b.set(int(cx - w / 2 + 1), yb - int(h * 0.25), CREME)


# --- Briarholt: Mutterhaus (Dipples Zeichenstube) -------------------------------------------------------------------------
def reissbrett():
    b = Bild(32, 48, seed=401)
    for (x0, x1) in ((8, 5), (22, 26)):                              # Bock
        for t in range(24):
            b.set(int(x0 + (x1 - x0) * t / 23), 23 + t, HOLZ[2]); b.set(int(x0 + (x1 - x0) * t / 23) + 1, 23 + t, HOLZ[1])
    b.rechteck(8, 38, 23, 39, HOLZ, 0.4, 0.1)
    b.poly([(4, 8), (27, 6), (28, 26), (3, 28)], HOLZ_HELL, vfn=lambda x, y: 0.55 - 0.01 * x)   # schräges Brett
    b.poly([(6, 9), (25, 8), (26, 24), (5, 26)], PAPIER, vfn=lambda x, y: 0.75 - 0.01 * x)       # Bogen
    for i in range(5):                                                # Plan: Grundriss mit Wurzellinien
        y = 12 + i * 3
        for x in range(8, 24):
            if (x + i) % 5 != 0:
                b.set(x, y - x // 12, TEAL[1])
    for y in range(11, 24):
        b.set(15, y, TEAL[1])
    for t in range(10):
        b.set(10 + t, 20 + (t % 3), LILA[0])
    for x in range(3, 29):                                            # Lineal (Reißschiene)
        b.set(x, 27 - x // 14, HOLZ[4])
    for t in range(9):                                                # Lampenarm
        b.set(26 - t // 3, 6 - t // 2, EISEN[3])
    b.rechteck(19, 0, 24, 2, MESSING, 0.7, 0.1)
    b.umriss(OUT)
    glow(b, 21, 4, 6, R('#e8b860', '#f0ce80'), 0.3)
    return b


def fundamentmodell():
    b = Bild(48, 32, seed=402)
    kasten(b, 2, 16, 44, 6, 8, s=1)
    for x in (3, 44):
        b.rechteck(x, 30, x + 1, 31, HOLZ, 0.3, 0)
    # Querschnitt-Modell: Erdschichten mit Wurzeln, darüber das kleine Pumpenhaus
    b.rechteck(8, 9, 40, 18, R('#58433c', '#715648', '#92745a'), 0.5, 0.3, s=3)
    for x in range(8, 41):
        b.set(x, 13, R('#2d2629')[0] if x % 3 else HOLZ[1])
    for i in range(4):                                                 # Wurzeln
        x0 = 12 + i * 8
        for t in range(8):
            b.set(x0 + int(math.sin(t + i) * 1.5), 10 + t, LILA[1] if t > 4 else HOLZ[3])
    b.rechteck(18, 2, 30, 9, GRAU, 0.6, 0.2, licht=0.6)                # Pumpenhaus
    b.poly([(17, 3), (31, 3), (24, -2)], R('#303b49', '#425360', '#586c78'), vfn=lambda x, y: 0.5)
    b.rechteck(23, 5, 25, 9, HOLZ, 0.3, 0)
    b.rechteck(32, 4, 33, 9, MESSING, 0.6, 0)                          # Rohr
    for x in (9, 39):                                                  # Glaskante
        for y in range(1, 19):
            b.set(x, y, GRAU[6] if y % 4 else CREME)
    b.rechteck(36, 16, 41, 18, PAPIER, 0.8, 0.1); b.set(38, 17, TEAL[1])  # Etikett
    b.umriss(OUT)
    return b


# --- Briarholt: Labor (Greavesend) ------------------------------------------------------------------------------------------
def destille():
    b = Bild(32, 48, seed=403)
    kasten(b, 3, 32, 26, 5, 9, s=1)
    for x in (4, 26):
        b.rechteck(x, 46, x + 1, 47, HOLZ, 0.3, 0)
    for y in range(4, 33):                                             # Stativ
        b.set(8, y, EISEN[3]); b.set(9, y, EISEN[2])
    for (y, fl) in ((30, LILA), (19, TEAL), (9, R('#d0a050', '#e8b860'))):   # drei Kolben übereinander
        b.rechteck(9, y + 1, 12, y + 1, EISEN, 0.5, 0)
        glas(b, 15, y, 8, 7, fl, s=y)
    for y in range(4, 31):                                             # Verbindungsrohr
        if b.get(19, y) is None:
            b.set(19, y, GRAU[5])
    for t in range(18):                                                # Kühlschlange aus Kupfer
        b.set(22 + int(2.5 * math.sin(t / 1.6)), 12 + t, MESSING[1 if t % 2 else 2])
    glas(b, 24, 35, 4, 4, LILA, s=9)
    for y in (36, 39):                                                 # Tropfen
        b.set(24, y - 6, LILA[2])
    b.umriss(OUT)
    glow(b, 15, 26, 7, LILA, 0.25)
    return b


def mikroskoppult():
    b = Bild(32, 32, seed=404)
    kasten(b, 1, 14, 30, 6, 10, s=1)
    for x in (2, 28):
        b.rechteck(x, 30, x + 1, 31, HOLZ, 0.3, 0)
    b.rechteck(8, 13, 14, 14, MESSING, 0.5, 0.1)                       # Mikroskop: Fuß, Säule, Tubus
    for y in range(4, 13):
        b.set(13, y, MESSING[1]); b.set(14, y, MESSING[0])
    for t in range(7):
        b.set(8 + t // 2, 2 + t, MESSING[2]); b.set(9 + t // 2, 2 + t, MESSING[1])
    b.rechteck(7, 1, 9, 2, R('#252b38', '#303b49'), 0.4, 0)
    b.rechteck(9, 11, 13, 11, GRAU, 0.6, 0)                           # Objekttisch
    b.set(11, 10, LILA[2])
    for i, x in enumerate((17, 21)):                                   # Objektträger
        b.rechteck(x, 15 + i, x + 3, 15 + i, R('#a8b4c0', '#eee2c5'), 0.6, 0)
        b.set(x + 1, 15 + i, LILA[1])
    b.rechteck(22, 9, 28, 14, PAPIER, 0.75, 0.15)                      # Notizheft
    for y in (10, 12):
        for x in range(23, 28):
            b.set(x, y, GRAU[3])
    b.umriss(OUT)
    return b


# --- Dunscar: Zirkelräume ------------------------------------------------------------------------------------------------------
def kalterofen():
    b = Bild(48, 48, seed=405)
    for y in range(10, 44):                                            # gemauerter Ofenbauch
        w = 18 - int(((44 - y) / 34) ** 2 * 8)
        for x in range(24 - w, 24 + w):
            b.ton(x, y, R('#58433c', '#715648', '#92745a', '#b3946e'), 0.7 - 0.025 * (x - 24 + w) - 0.004 * y, 0.25, 3)
    for y in range(12, 44, 4):                                         # Fugen
        for x in range(6, 42):
            if b.get(x, y) is not None:
                b.set(x, y, HOLZ[0])
    for y in range(14, 44):
        for x in range(6, 42):
            if b.get(x, y) is not None and (x + (y // 4) * 4) % 8 == 0:
                b.set(x, y, HOLZ[0])
    b.rechteck(16, 4, 31, 11, GRAU, 0.5, 0.2, licht=0.6)               # Gicht/Schornsteinstumpf
    for x in range(16, 32):
        b.set(x, 4, GRAU[5])
    b.rechteck(17, 28, 30, 42, EISEN, 0.3, 0.1)                        # eiserne Ofentür, kalt
    for y in range(29, 42, 3):
        for x in range(18, 30):
            b.set(x, y, EISEN[1])
    b.rechteck(28, 34, 29, 35, MESSING, 0.5, 0)
    for x in range(6, 42):                                             # Kalkkruste und Reif statt Glut
        for y in range(10, 44):
            if b.get(x, y) is not None and h3(x, y, 8) < 0.025 + 0.02 * (y < 20):
                b.set(x, y, KALK[3] if h3(x, y, 9) < 0.6 else R('#a8b4c0')[0])
    for x in range(4, 44):                                             # Aschesaum am Boden
        if h3(x, 0, 10) < 0.7:
            b.set(x, 44 + (x % 2), GRAU[3])
    b.umriss(OUT)
    return b


def glasblaeserbank():
    b = Bild(32, 32, seed=406)
    kasten(b, 1, 16, 30, 5, 8, s=1)
    for x in (2, 28):
        b.rechteck(x, 29, x + 1, 31, HOLZ, 0.3, 0)
    b.rechteck(20, 6, 29, 16, R('#58433c', '#715648', '#92745a'), 0.55, 0.25, licht=0.6)  # kleiner Glasofen
    b.ellipse(24.5, 12, 2.5, 2, GLUT)
    for t in range(16):                                                # Glasmacherpfeife mit Kölbel
        b.set(3 + t, 14 - t // 4, EISEN[3])
    b.ellipse(19.5, 10, 2, 2, R('#4eafa2', '#6fe0d0', '#eee2c5'))
    for (x, fl) in ((5, TEAL), (10, LILA)):                            # fertige Gläser
        b.rechteck(x, 13, x + 2, 15, fl, 0.6, 0.1)
        b.set(x + 1, 12, fl[-1])
    b.umriss(OUT)
    glow(b, 24.5, 12, 6, GLUT, 0.35)
    return b


def hebelbank():
    b = Bild(48, 32, seed=407)
    b.rechteck(2, 22, 45, 29, EISEN, 0.45, 0.15, licht=0.5)            # Hebelrahmen
    for x in range(2, 46):
        b.set(x, 22, GRAU[4])
    farben = [ROT, CREME, ROT, R('#425360')[0], CREME, ROT, R('#425360')[0], CREME, ROT, CREME]
    for i in range(10):                                                # Hebel, einige festgebunden
        x = 5 + i * 4
        neig = (i % 3) - 1
        for t in range(16):
            b.set(x + (neig * t) // 6, 21 - t, farben[i]); b.set(x + 1 + (neig * t) // 6, 21 - t, EISEN[2])
        b.rechteck(x - 1 + neig * 2, 4, x + 2 + neig * 2, 5, GRAU, 0.7, 0)
        if i in (2, 5, 8):                                             # stumm: mit Tuch umwickelt
            b.rechteck(x - 1, 12, x + 2, 15, PAPIER, 0.55, 0.2)
        b.rechteck(x, 24, x + 1, 25, MESSING, 0.7, 0)                  # Nummernschild
    b.umriss(OUT)
    return b


def telegrafenpult():
    b = Bild(32, 32, seed=408)
    kasten(b, 1, 14, 30, 6, 10, s=1)
    for x in (2, 28):
        b.rechteck(x, 30, x + 1, 31, HOLZ, 0.3, 0)
    b.rechteck(5, 11, 13, 14, HOLZ, 0.4, 0.1)                          # Morsetaste
    b.rechteck(6, 10, 12, 10, MESSING, 0.7, 0)
    b.ellipse(12, 9, 1.5, 1.5, R('#252b38', '#303b49'))
    b.rechteck(16, 6, 24, 14, MESSING, 0.5, 0.15, licht=0.6)           # Klopfer
    b.ellipse(20, 8, 2, 2, EISEN)
    b.ellipse(27, 11, 3, 3, PAPIER)                                    # Papierstreifen-Rolle
    for x in range(14, 27):
        b.set(x, 15 + (x % 2), PAPIER[2])
        if x % 3 == 0:
            b.set(x, 15 + (x % 2), GRAU[2])
    b.umriss(OUT)
    return b


def stempeluhr():
    b = Bild(16, 32, seed=409)
    b.rechteck(2, 2, 13, 29, HOLZ, 0.5, 0.2, licht=0.6)
    b.ellipse(7.5, 7, 4, 4, PAPIER)                                    # Zifferblatt
    b.set(7, 7, OUT); b.set(7, 5, OUT); b.set(8, 7, OUT); b.set(9, 7, OUT)
    b.rechteck(4, 13, 11, 15, EISEN, 0.4, 0.1)                         # Stempelschlitz und Hebel
    b.rechteck(12, 13, 14, 14, MESSING, 0.7, 0)
    for r in range(3):                                                 # Kartenfächer mit Stempelkarten
        y = 18 + r * 4
        for x in range(3, 13):
            b.set(x, y + 3, HOLZ[0])
        for x in range(4, 12, 2):
            if h3(x, r, 1) < 0.7:
                b.rechteck(x, y, x, y + 2, PAPIER, 0.8, 0)
    b.umriss(OUT)
    return b


def siedepfanne():
    b = Bild(48, 32, seed=410)
    b.rechteck(3, 18, 44, 29, R('#58433c', '#715648', '#92745a'), 0.5, 0.25, licht=0.5)   # gemauerter Herd
    for x in range(8, 44, 9):
        b.rechteck(x, 24, x + 4, 28, R('#2d2629'), 0.5, 0)
        b.ellipse(x + 2, 27, 1.5, 1, GLUT)
    b.rechteck(2, 12, 45, 18, EISEN, 0.45, 0.15)                       # flache Eisenpfanne
    for x in range(4, 44):                                             # Sole und Salzkruste
        for y in range(10, 13):
            b.set(x, y, KALK[3] if h3(x, y, 3) < 0.55 else R('#a8b4c0', '#95a5a5')[int(h3(x, y, 4) * 2)])
    for t in range(16):                                                # Salzrechen
        b.set(30 + t // 2, 9 - t // 3, HOLZ[3]); b.set(31 + t // 2, 9 - t // 3, HOLZ[1])
    for x in range(27, 33):
        b.set(x, 10, HOLZ[2])
    b.umriss(OUT)
    glow(b, 24, 27, 10, GLUT, 0.25)
    for (x, y) in ((10, 5), (20, 3), (36, 4)):                         # Dampf
        b.set(x, y, R('#a8b4c0')[0]); b.set(x + 1, y - 1, R('#a8b4c0')[0])
    return b


ALLE = {
    'bhk_reissbrett': (reissbrett, 'Reißbrett auf Bock mit Fundamentplan, Reißschiene und Lampe', 'bh_mutterhaus'),
    'bhk_fundamentmodell': (fundamentmodell, 'Querschnittmodell: Pumpenhaus über Erdschichten mit Wurzeln, unter Glas', 'bh_mutterhaus'),
    'bhk_destille': (destille, 'Destillierkolonne: drei Kolben am Stativ, Kupfer-Kühlschlange', 'bh_labor'),
    'bhk_mikroskoppult': (mikroskoppult, 'Pult mit Messingmikroskop, Objektträgern und Notizheft', 'bh_labor'),
    'dsk_kalterofen': (kalterofen, 'kalter Kalkofen mit eiserner Tür, Kalkkruste und Reif', 'treffen_kalkofen (statt Russ-Theke)'),
    'dsk_glasblaeserbank': (glasblaeserbank, 'Glasbläserbank mit kleinem Glasofen, Pfeife und Gläsern', 'treffen_kalkofen (statt Kohlenwaage)'),
    'dsk_hebelbank': (hebelbank, 'Hebelbank eines Stellwerks, drei Hebel mit Tuch stillgelegt', 'treffen_stellwerk (statt Kreidetisch)'),
    'dsk_telegrafenpult': (telegrafenpult, 'Telegrafenpult mit Morsetaste, Klopfer und Papierstreifen', 'treffen_stellwerk (statt Lesepult)'),
    'dsk_stempeluhr': (stempeluhr, 'Stempeluhr mit Kartenfächern', 'treffen_schichtbund (statt Waage-Schränke)'),
    'dsk_siedepfanne': (siedepfanne, 'Salz-Siedepfanne auf gemauertem Herd, Rechen, Dampf', 'treffen_salzds (statt Salztisch)'),
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
    json.dump({'version': 1, 'batch': 'innen2-kulissen', 'palette': 'manifest-dunscar1.json (= manifest-briarholt1.json)', 'erzeugt': 'python3 tools/art/innen2/assets.py',
               'origin': 'unten mittig', 'assets': assets}, open(os.path.join(ROOT, 'public', 'sprites', 'manifest-innen2-kulissen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
