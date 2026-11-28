"""Pfadviertel-Gegner (o3_<pfad>_g*/siegel*/tiefe): je Pfad eine eigene Fassung der geliehenen Stadtmonster.

Jeder Pfad hat ein Kennzeichen, das zum Namen passt (Lichtloser, Verknoteter, Gesichtsloser …), dazu Farbzug in die
Pfadfarbe und der Gegenlicht-Saum in Pfadfarbe wie bei den Seq-1-Beyondern. Muster hängen am Umriss jedes Frames
(Bounding-Box), damit sie mit der Figur mitgehen. Das Oberhaupt (tiefe) bekommt die stärkere Fassung.
Aufruf: python3 o3_varianten.py <battle-ordner> [liste.json]
"""
import sys, os, json, colorsys
from PIL import Image

OUTL = (26, 28, 44)
HERE = os.path.dirname(os.path.abspath(__file__))

# Basis-Sheet -> Frame (w, h), aus BATTLE_SHEETS
PAARE = [  # (pfad, rolle, basis, fw, fh)
    ('laterne', 'n', 'enemy_vg_bh_glasmotte', 48, 48), ('laterne', 'n', 'enemy_vg_bh_bluetenkopf', 48, 48), ('laterne', 't', 'enemy_vg_bh_boss_glasgaertner', 96, 96),
    ('faden', 'n', 'enemy_vg_cw_rohrpostwespe', 48, 48), ('faden', 'n', 'enemy_vg_cw_durchschlag', 48, 48), ('faden', 'n', 'enemy_vg_cw_leerfracht', 64, 64),
    ('faden', 't', 'enemy_vg_cw_boss_blinder_zusteller', 96, 96),
    ('maske', 'n', 'enemy_vg_cw_letternlaeufer', 64, 64), ('maske', 'n', 'enemy_vg_cw_stempelhand', 48, 48), ('maske', 'n', 'enemy_vg_cw_registerratte', 48, 48),
    ('maske', 't', 'enemy_vg_cw_boss_bleisammler', 96, 96),
    ('echo', 'n', 'enemy_signalkraehe', 48, 48), ('echo', 'n', 'enemy_geruestklang', 64, 64), ('echo', 't', 'enemy_vielrufer', 96, 96),
    ('kessel', 'n', 'enemy_vg_bh_rohrwurm', 64, 64), ('kessel', 'n', 'enemy_vg_bh_waeschegeist', 64, 64), ('kessel', 't', 'enemy_vg_bh_boss_waescherei', 96, 96),
    ('eisen', 'n', 'enemy_vg_cw_seilbahnwaechter', 64, 64), ('eisen', 'n', 'enemy_vg_cw_tintenschatten', 64, 64), ('eisen', 't', 'enemy_vg_cw_boss_nullfundament', 128, 96),
    ('schluessel', 'n', 'enemy_knochenwurm', 64, 64), ('schluessel', 'n', 'enemy_kerzenfresser', 64, 64), ('schluessel', 'n', 'enemy_schaedelschwarm', 64, 64),
    ('schluessel', 't', 'enemy_ossuarwaechter', 96, 96),
    ('sq_waage', 'n', 'enemy_lohnlistenmotte', 48, 48), ('sq_waage', 'n', 'enemy_kalkstaubgeist', 64, 64), ('sq_waage', 'n', 'enemy_nachhall', 64, 64),
    ('sq_waage', 't', 'enemy_nachhall', 64, 64),
    ('sq_moor', 'n', 'enemy_vg_bh_wurzelgaenger', 64, 64), ('sq_moor', 'n', 'enemy_vg_bh_sudtraeger', 64, 64), ('sq_moor', 't', 'enemy_vg_bh_boss_mutterwurzel', 128, 96),
    ('sq_uhr', 'n', 'enemy_schichtgaenger', 48, 48), ('sq_uhr', 't', 'enemy_vorhauer', 96, 96),
]

FARBE = {'laterne': (232, 184, 96), 'faden': (184, 152, 224), 'maske': (224, 122, 138), 'echo': (111, 224, 208), 'kessel': (154, 208, 106),
         'eisen': (168, 180, 192), 'schluessel': (112, 128, 255), 'sq_waage': (255, 224, 128), 'sq_moor': (128, 160, 96), 'sq_uhr': (200, 200, 240)}


def neu_id(pid, rolle, basis):
    return f"{basis}__o3{'t' if rolle == 't' else ''}_{pid}"


def hsv(c):
    return colorsys.rgb_to_hsv(c[0] / 255, c[1] / 255, c[2] / 255)


def rgb(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h % 1, max(0, min(1, s)), max(0, min(1, v)))
    return (round(r * 255), round(g * 255), round(b * 255))


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def lum(c):
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255


def outline(c):
    return lum(c) < 0.13


def hsh(x, y, k=0):
    v = (x * 73856093) ^ (y * 19349663) ^ (k * 83492791)
    return ((v * 2654435761) & 0xffffffff) / 0xffffffff


class Frame:
    def __init__(self, im, x0, y0, w, h):
        self.im, self.x0, self.y0, self.w, self.h = im, x0, y0, w, h
        px = im.load()
        pts = [(x, y) for y in range(y0, y0 + h) for x in range(x0, x0 + w) if px[x, y][3]]
        self.ok = bool(pts)
        if pts:
            self.bx0, self.by0 = min(p[0] for p in pts), min(p[1] for p in pts)
            self.bx1, self.by1 = max(p[0] for p in pts), max(p[1] for p in pts)

    def inside(self, x, y):
        return self.x0 <= x < self.x0 + self.w and self.y0 <= y < self.y0 + self.h and self.im.getpixel((x, y))[3] > 0


def zug(c, pid, t):
    """Farbzug: Farbton Richtung Pfadfarbe, Helligkeit bleibt."""
    h, s, v = hsv(c)
    th, ts, tv = hsv(FARBE[pid])
    ziel = rgb(th, max(s, ts * 0.55), v)   # gleicher Helligkeitswert, Pfadton (Mischung in RGB, kein Umweg über andere Farbtöne)
    return mix(c, ziel, min(1, t * 1.15))


def effekt(pid, c, x, y, f, stark):
    """Pixelweise Wirkung je Pfad. c = RGB, Rückgabe RGB."""
    if outline(c):
        return c
    h, s, v = hsv(c)
    k = 1.25 if stark else 1.0
    if pid == 'laterne':      # Lichtloser: Licht weggenommen, Lichter werden zu kaltem Dunkel, Amber nur als Glut im Kern
        if v > 0.72:
            return mix(c, (58, 52, 70), 0.75)
        return rgb(h, s * 0.55, v * (0.72 if stark else 0.8))
    if pid == 'faden':        # Verknoteter: violetter Zug + straffe Fäden quer über den Körper
        c2 = zug(c, pid, 0.45 * k)
        fx, fy = x - f.bx0, y - f.by0
        bh = max(1, f.by1 - f.by0)
        for a in (0.3, 0.62) + ((0.85,) if stark else ()):
            ly = int(bh * a + (fx * 0.35)) % (bh + 1)
            if fy == ly:
                return (232, 214, 252)
            if fy == ly + 1:
                return (70, 48, 96)       # Schatten unter dem Faden
        return c2
    if pid == 'maske':        # Gesichtsloser: porzellanblass, Farbe flieht, rosiger Schimmer in den Schatten
        if v > 0.55:
            return mix(c, (226, 214, 214), 0.55 * k)
        return mix(zug(c, pid, 0.35), (60, 40, 50), 0.2)
    if pid == 'echo':         # Stummer: blaugrau entsättigt, Schallringe türkis
        c2 = rgb(h + (0.55 - h) * 0.5, s * 0.6, v)
        cx, cy = (f.bx0 + f.bx1) / 2, (f.by0 + f.by1) / 2
        d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        if int(d) in (int((f.bx1 - f.bx0) * 0.22), int((f.bx1 - f.bx0) * 0.4)) and hsh(x, y) < (0.65 if stark else 0.45):
            return mix(c2, (111, 224, 208), 0.6)
        return c2
    if pid == 'kessel':       # Kochender: grüner Sud, Blasen an der Oberseite
        c2 = zug(c, pid, 0.55 * k)
        if not f.inside(x, y - 1) and hsh(x, y, 1) < 0.5:
            return (190, 236, 140)
        if hsh(x, y, 2) < 0.04 * k:
            return (170, 220, 120)
        return c2
    if pid == 'eisen':        # Genieteter: kaltes Eisen, Nieten im Raster
        c2 = rgb(0.6, s * 0.25, v * 0.95)
        fx, fy = x - f.bx0, y - f.by0
        g = 6 if stark else 7
        if fx % g == 3 and fy % g == 3:
            return (200, 208, 214)
        if fx % g == 4 and fy % g == 4:
            return (40, 46, 60)
        return c2
    if pid == 'schluessel':   # Verschlossener: blau-violetter Zug, Messingbänder quer
        c2 = zug(c, pid, 0.5 * k)
        fy = y - f.by0
        bh = max(1, f.by1 - f.by0)
        if fy in (int(bh * 0.38), int(bh * 0.66)):
            return (196, 156, 84) if hsh(x, 0) > 0.15 else (122, 92, 48)
        return c2
    if pid == 'sq_waage':     # Gewogener: Gold zieht ein, unten schwerer und dunkler
        t = (y - f.by0) / max(1, f.by1 - f.by0)
        c2 = zug(c, pid, 0.5 * k)
        return mix(c2, (60, 44, 24), 0.38 * t * k)
    if pid == 'sq_moor':      # Fauliger: braungrün, Moos an Unterkanten, Schlick-Flecken
        c2 = mix(zug(c, pid, 0.4 * k), (52, 46, 30), 0.2)
        if not f.inside(x, y + 1) and hsh(x, y, 3) < 0.7:
            return (94, 106, 62)
        if hsh(x, y, 4) < 0.05 * k:
            return (62, 54, 34)
        return c2
    if pid == 'sq_uhr':       # Stehengebliebener: fast farblos, Raureif-Lila an Oberkanten
        c2 = rgb(0.68, s * 0.18, v)
        if not f.inside(x, y - 1) or not f.inside(x - 1, y):
            return mix(c2, (214, 214, 246), 0.6)
        return c2
    return c


def saum(out, f, pid):
    g = FARBE[pid]
    rim = mix(OUTL, g, 0.5)
    src = out.copy()
    op = lambda x, y: f.x0 <= x < f.x0 + f.w and f.y0 <= y < f.y0 + f.h and src.getpixel((x, y))[3]
    for y in range(f.y0, f.y0 + f.h):
        for x in range(f.x0, f.x0 + f.w):
            p = src.getpixel((x, y))
            if p[3] and outline(p[:3]) and op(x - 1, y) and not op(x + 1, y):
                out.putpixel((x, y), rim + (255,))
            elif p[3] and outline(p[:3]) and op(x, y - 1) and not op(x, y + 1) and not op(x + 1, y + 1):
                out.putpixel((x, y), rim + (255,))


def bauen(pid, rolle, basis, fw, fh, bdir):
    return bauen_datei(pid, rolle, os.path.join(bdir, basis + '.png'), fw, fh)


def bauen_datei(pid, rolle, pfad, fw, fh):
    im = Image.open(pfad).convert('RGBA')
    out = im.copy()
    stark = rolle == 't'
    for y0 in range(0, im.height - fh + 1, fh):
        for x0 in range(0, im.width - fw + 1, fw):
            f = Frame(im, x0, y0, fw, fh)
            if not f.ok:
                continue
            if pid in ('faden', 'eisen', 'schluessel', 'echo'):
                # Muster am Frame verankern (nicht an der Figur), damit sie zwischen den Frames nicht springen
                f.bx0, f.bx1 = x0 + fw // 8, x0 + fw - fw // 8
                f.by0, f.by1 = y0 + fh // 5, y0 + fh - 2
            for y in range(y0, y0 + fh):
                for x in range(x0, x0 + fw):
                    p = im.getpixel((x, y))
                    if p[3]:
                        out.putpixel((x, y), effekt(pid, p[:3], x, y, f, stark) + (255,))
            saum(out, f, pid)
    return out


def kartengegner(cdir, ow_json):
    """Kartenfiguren (OVERWORLD_SHEETS) derselben Gegner: gleiche Wirkung je Frame. ow_json: id -> [datei, w, h]."""
    ow = json.load(open(ow_json))
    n = 0
    for pid, rolle, basis, _, _ in PAARE:
        e = ow.get(basis.replace('enemy_', ''))
        if not e:
            continue
        datei, w, h = e
        src = os.path.join(cdir, os.path.basename(datei))
        ziel = src.replace('.png', f"__o3{'t' if rolle == 't' else ''}_{pid}.png")
        bauen_datei(pid, rolle, src, w, h).save(ziel)
        n += 1
    return n


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == '--karte':
    print(kartengegner(sys.argv[2], sys.argv[3]))
    sys.exit(0)

if __name__ == '__main__':
    bdir = sys.argv[1]
    liste = {}
    for pid, rolle, basis, fw, fh in PAARE:
        nid = neu_id(pid, rolle, basis)
        bauen(pid, rolle, basis, fw, fh, bdir).save(os.path.join(bdir if len(sys.argv) < 4 else sys.argv[3], nid + '.png'))
        liste[nid] = basis
    if len(sys.argv) > 2:
        json.dump(liste, open(sys.argv[2], 'w'), indent=1)
    print(len(liste))
