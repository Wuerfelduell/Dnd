"""Ritualwächter je Pfad (Runde 7): eigene Fassung der beiden geliehenen Wächterkörper für jeden der 10 Pfade.

hg_schwellenwaechter (128x96) -> __w_<pfad> (Schwellenwächter, Seq 4) und __wt_<pfad> (Heiligenwächter, Seq 3)
hg_grenzwaechter (128x128)    -> __w_<pfad> (Grenzwächter, Seq 2)    und __wt_<pfad> (Engelswächter, Seq 1)
Gleiche Pfad-Kennzeichen wie die Pfadviertel-Gegner (o3_varianten.effekt + Saum); die höheren Wächter (wt) bekommen die
starke Fassung und zusätzlich eine geweihte Innenkante: die Oberkante jedes Teils leuchtet hell in Pfadfarbe.
Aufruf: python3 waechter_varianten.py <battle-ordner> [liste.json]
"""
import sys, os, json
from PIL import Image
from o3_varianten import Frame, effekt, saum, outline, mix, lum, hsv, FARBE, OUTL

BASEN = [('hg_schwellenwaechter', 128, 96), ('hg_grenzwaechter', 128, 128)]
PFADE = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr']
ANKER = ('faden', 'eisen', 'schluessel', 'echo')


def rune(c):
    """Leuchtende Runen/Kernglühen der Vorlage (helles, gesättigtes Türkis)."""
    h, sat, v = hsv(c)
    return 0.4 < h < 0.56 and sat > 0.35 and v > 0.55


def glut(c, pid, hoch):
    """Runen leuchten in Pfadfarbe weiter statt mit dem Körper umgefärbt zu werden."""
    t = (lum(c) - 0.5) * 1.6
    g = FARBE[pid]
    if pid == 'laterne':
        g = (255, 214, 140)   # beim Lichtlosen bleibt nur die Glut im Kern
    return mix(g, (255, 252, 240), max(0, min(0.8, t + (0.15 if hoch else 0))))


def schatten(c):
    """Sehr dunkle Teile (Schattenfigur neben dem Grenzwächter, tiefe Fugen) bleiben unberührt."""
    return lum(c) < 0.24


def weihe(out, f, pid):
    """Geweihte Kante: nur die äußere Oberkante (Pixel unter dem Außenumriss) leuchtet hell in Pfadfarbe."""
    hell = mix((250, 246, 230), FARBE[pid], 0.35)
    src = out.copy()
    px = src.load()
    frei = lambda x, y: not (f.x0 <= x < f.x0 + f.w and f.y0 <= y < f.y0 + f.h) or not px[x, y][3]
    for y in range(f.y0 + 2, f.y0 + f.h):
        for x in range(f.x0 + 1, f.x0 + f.w):
            p = px[x, y]
            if not p[3] or outline(p[:3]) or schatten(p[:3]):
                continue
            o = px[x, y - 1]
            if o[3] and outline(o[:3]) and frei(x, y - 2):
                out.putpixel((x, y), mix(p[:3], hell, 0.6) + (255,))
                q = px[x, y + 1] if y + 1 < f.y0 + f.h else (0, 0, 0, 0)
                if q[3] and not outline(q[:3]) and not schatten(q[:3]):
                    out.putpixel((x, y + 1), mix(q[:3], hell, 0.22) + (255,))


def bauen(pid, hoch, pfad, fw, fh):
    im = Image.open(pfad).convert('RGBA')
    out = im.copy()
    for y0 in range(0, im.height - fh + 1, fh):
        for x0 in range(0, im.width - fw + 1, fw):
            f = Frame(im, x0, y0, fw, fh)
            if not f.ok:
                continue
            if pid in ANKER:
                f.bx0, f.bx1 = x0 + fw // 8, x0 + fw - fw // 8
                f.by0, f.by1 = y0 + fh // 5, y0 + fh - 2
            for y in range(y0, y0 + fh):
                for x in range(x0, x0 + fw):
                    p = im.getpixel((x, y))
                    if not p[3] or schatten(p[:3]):
                        continue
                    c = glut(p[:3], pid, hoch) if rune(p[:3]) else effekt(pid, p[:3], x, y, f, hoch)
                    out.putpixel((x, y), c + (255,))
            if hoch:
                weihe(out, f, pid)
            saum(out, f, pid)
    return out


def neu_id(basis, pid, hoch):
    return f"{basis}__w{'t' if hoch else ''}_{pid}"


if __name__ == '__main__':
    bdir = sys.argv[1]
    liste = {}
    for basis, fw, fh in BASEN:
        for pid in PFADE:
            for hoch in (False, True):
                nid = neu_id(basis, pid, hoch)
                bauen(pid, hoch, os.path.join(bdir, basis + '.png'), fw, fh).save(os.path.join(bdir, nid + '.png'))
                liste[nid] = basis
    if len(sys.argv) > 2:
        json.dump(liste, open(sys.argv[2], 'w'), indent=1)
    print(len(liste))
