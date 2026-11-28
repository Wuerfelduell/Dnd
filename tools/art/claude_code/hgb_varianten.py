"""Runde 8: drei eigene Fassungen der Pfadgestalt-Kampfblätter hg_battle_<pfad> (96x96) für die Gegner, die sie bisher liehen.

__vh  Halbgott des Vorhofs (hs_/hs2_halbgott_<pfad>): uralt, "so alt wie eine Stadt": Farbe zu Elfenbein und Patina
      ausgeblichen, Schatten kühl, Saum in blassem Gold, geweihte Oberkante.
__vz  Stellvertretung des Pfadviertels (o3_<pfad>_vize): Kennzeichen des eigenen Viertels (o3_varianten.effekt), Pfad-Saum.
__s1  Seq-1-Beyonder (s1b_<pfad>): strahlend: Schatten tief in Pfadfarbe, Lichter fast weiß, heller Saum und Oberkante.
Aufruf: python3 hgb_varianten.py <battle-ordner> [liste.json]
"""
import sys, os, json
from PIL import Image
from o3_varianten import Frame, effekt, saum, outline, mix, lum, hsv, rgb, zug, FARBE, OUTL
from waechter_varianten import weihe, PFADE, ANKER

GOLD = (226, 200, 140)


def vorhof(c, pid):
    h, s, v = hsv(c)
    l = lum(c)
    grau = rgb(0.11, s * 0.28, v)                 # warmes Grau, Farbe fast weg
    if l > 0.55:
        return mix(grau, (238, 228, 204), 0.45)   # Lichter elfenbein
    if l < 0.3:
        return mix(grau, (52, 60, 78), 0.35)      # Schatten kühl
    return mix(grau, mix(FARBE[pid], (150, 150, 140), 0.6), 0.25)


def strahl(c, pid):
    """Strahlend: Pfadfarbe zieht ein, Kontrast steigt (Schatten tiefer, Lichter heller), die Zeichnung bleibt lesbar."""
    l = lum(c)
    g = FARBE[pid]
    if l < 0.42:
        ziel = mix(mix(g, (24, 20, 40), 0.6), g, (l / 0.42) ** 1.4)
    else:
        ziel = mix(g, (255, 250, 232), min(1, (l - 0.42) / 0.45) * 0.8)
    return mix(zug(c, pid, 0.5), ziel, 0.5)


def saum_farbe(out, f, farbe):
    """Saum wie o3_varianten.saum, aber mit eigener Farbe."""
    rim = mix(OUTL, farbe, 0.55)
    src = out.copy()
    op = lambda x, y: f.x0 <= x < f.x0 + f.w and f.y0 <= y < f.y0 + f.h and src.getpixel((x, y))[3]
    for y in range(f.y0, f.y0 + f.h):
        for x in range(f.x0, f.x0 + f.w):
            p = src.getpixel((x, y))
            if p[3] and outline(p[:3]) and op(x - 1, y) and not op(x + 1, y):
                out.putpixel((x, y), rim + (255,))
            elif p[3] and outline(p[:3]) and op(x, y - 1) and not op(x, y + 1) and not op(x + 1, y + 1):
                out.putpixel((x, y), rim + (255,))


def bauen(pid, art, pfad, fw=96, fh=96):
    im = Image.open(pfad).convert('RGBA')
    out = im.copy()
    for y0 in range(0, im.height - fh + 1, fh):
        for x0 in range(0, im.width - fw + 1, fw):
            f = Frame(im, x0, y0, fw, fh)
            if not f.ok:
                continue
            if art == 'vz' and pid in ANKER:
                f.bx0, f.bx1 = x0 + fw // 8, x0 + fw - fw // 8
                f.by0, f.by1 = y0 + fh // 5, y0 + fh - 2
            for y in range(y0, y0 + fh):
                for x in range(x0, x0 + fw):
                    p = im.getpixel((x, y))
                    if not p[3] or outline(p[:3]):
                        continue
                    c = p[:3]
                    c = vorhof(c, pid) if art == 'vh' else strahl(c, pid) if art == 's1' else effekt(pid, c, x, y, f, False)
                    out.putpixel((x, y), c + (p[3],))
            if art == 'vh':
                weihe(out, f, pid)
                saum_farbe(out, f, GOLD)
            elif art == 's1':
                weihe(out, f, pid)
                saum_farbe(out, f, mix(FARBE[pid], (255, 255, 255), 0.4))
            else:
                saum(out, f, pid)
    return out


if __name__ == '__main__':
    bdir = sys.argv[1]
    liste = {}
    for pid in PFADE:
        for art in ('vh', 'vz', 's1'):
            nid = f'hg_battle_{pid}__{art}'
            bauen(pid, art, os.path.join(bdir, f'hg_battle_{pid}.png')).save(os.path.join(bdir, nid + '.png'))
            liste[nid] = f'hg_battle_{pid}'
    if len(sys.argv) > 2:
        json.dump(liste, open(sys.argv[2], 'w'), indent=1)
    print(len(liste))
