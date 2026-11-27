"""Lauf-Sheets der zehn Seq-1-Beyonder in Briarholt (s1b_<pfad>), aus Codex-Figuren umgefärbt in ihre Skript-Palette.

Je Figur: Basisblatt, Zeilengrenzen (Kopf | Körper | Beine je 32er-Frame) und welche Basisfarben in welche Rolle gehen.
Farben werden über Helligkeit auf die Zielfarbe gelegt (Schattierung der Vorlage bleibt). Dazu als Merkmal der ersten
Sequenz ein Gegenlicht-Saum in Pfadfarbe am Umriss unten rechts (die Figur leuchtet schwach von innen).
Aufruf: python3 s1b_figuren.py <ausgabeordner>
"""
import sys, os, colorsys
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'varianten'))
from vlib import face_colors

HERE = os.path.dirname(os.path.abspath(__file__))
CH = os.path.join(HERE, '..', '..', '..', 'public', 'sprites', 'characters')
OUTL = (26, 28, 44)


def hx(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hsv(c):
    return colorsys.rgb_to_hsv(*(v / 255 for v in c[:3]))


def onto(c, target, vref):
    """Farbe c auf Zielton legen; Helligkeit relativ zur Referenz der Gruppe."""
    h, s, v = hsv(c)
    th, ts, tv = hsv(target)
    nv = max(0.05, min(1, tv * (v / vref) ** 1.1))
    nv = 0.75 * nv + 0.25 * v          # Grundhelligkeit der Vorlage etwas halten
    ns = min(1, ts * SAT * (0.75 + 0.5 * min(1, s / 0.35)))
    r, g, b = colorsys.hsv_to_rgb(th, ns, nv)
    return (round(r * 255), round(g * 255), round(b * 255))


from s1b_daten import FIGUREN, AUGEN
SAT = 0.62  # Spielpalette ist gedämpft: Skript-Paletten entsättigen


def bauen(pid):
    f = FIGUREN[pid]
    im = Image.open(os.path.join(CH, f['basis'] + '.png')).convert('RGBA')
    pal = {k: hx(v) for k, v in f['palette'].items()}
    skin = set(face_colors(im)) | {hx(c) for c in f.get('haut', [])}
    skin -= {hx(c) for c in f.get('nicht_haut', [])}
    keep = {hx(c) for c in f.get('behalten', [])}
    kopf, bein = f['zeilen']
    regeln = [(set(hx(c) for c in cols), rolle) for cols, rolle in f.get('farben', [])]
    zaehl = {'T': {}, 'B': {}, 'L': {}}
    for y in range(im.height):
        for x in range(im.width):
            c = im.getpixel((x, y))
            if c[3] and c[:3] != OUTL and c[:3] not in skin and c[:3] not in keep:
                ry = y % 32
                reg = 'T' if ry < kopf else ('L' if ry >= bein else 'B')
                zaehl[reg][c[:3]] = zaehl[reg].get(c[:3], 0) + 1
    nk, nb, nl = f.get('anzahl', (2, 3, 2))
    top = lambda reg, n: set(sorted(zaehl[reg], key=lambda c: -zaehl[reg][c])[:n])
    top_koerper = top('B', nb)
    top_kopf = top('T', nk) - (top_koerper if f.get('kopf_eigen', True) else set())
    top_bein = top('L', nl)
    # Referenzhelligkeit je Rolle = Mittel der beteiligten Farben (gewichtet)
    def rolle_von(c, ry):
        for cols, rolle in regeln:
            if c in cols:
                if isinstance(rolle, dict):
                    for (a, b), r in rolle.items():
                        if a <= ry < b:
                            return r
                    return None
                return rolle
        if c in skin:
            return 'skin' if f.get('haut_faerben') else None
        if c in keep or c == OUTL:
            return None
        if ry < kopf:
            return f.get('kopf_rolle', 'hat') if c in top_kopf else None
        if ry >= bein:
            return 'legs' if c in top_bein else None
        return 'coat' if c in top_koerper else None
    acc = {}
    W, H = im.size
    for y in range(H):
        for x in range(W):
            c = im.getpixel((x, y))
            if not c[3]:
                continue
            r = rolle_von(c[:3], y % 32)
            if r and r in pal:
                acc.setdefault(r, []).append(hsv(c)[2])
    vref = {r: sorted(v)[len(v) // 2] for r, v in acc.items()}
    out = im.copy()
    for y in range(H):
        for x in range(W):
            c = im.getpixel((x, y))
            if not c[3]:
                continue
            r = rolle_von(c[:3], y % 32)
            if r and r in pal:
                out.putpixel((x, y), onto(c, pal[r], vref[r]) + (255,))
    if f.get('saum', True):
        saum(out, pid)
    return out


def lum(c):
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255


def saum(out, pid):
    """Gegenlicht: Umriss unten rechts in dunkler Pfadfarbe – die Figur leuchtet schwach von innen."""
    g = hx(AUGEN[pid])
    rim = tuple(round(OUTL[i] + (g[i] - OUTL[i]) * 0.45) for i in range(3))
    src = out.copy()
    op = lambda x, y: 0 <= x < 64 and 0 <= y < 128 and src.getpixel((x, y))[3]
    for y in range(128):
        for x in range(64):
            p = src.getpixel((x, y))
            if not p[3] or p[:3] != OUTL:
                continue
            fx = x % 16
            if (not op(x + 1, y) and fx < 15 and op(x - 1, y)) or (not op(x, y + 1) and y % 32 < 28 and op(x, y - 1) and not op(x + 1, y + 1)):
                out.putpixel((x, y), rim + (255,))


if __name__ == '__main__':
    od = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(od, exist_ok=True)
    for pid in FIGUREN:
        bauen(pid).save(os.path.join(od, f's1b_{pid}_walk.png'))
