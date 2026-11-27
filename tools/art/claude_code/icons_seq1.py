"""Charakteristik Seq 1 (char_seq1_<pfad>) und Beyonder-Rest (rest_<pfad>) als 16x16-Icons, gezeichnet per Skript.

Charakteristik = etwas Ganzes: glatte Kugel in Pfadfarbe in einer Messingfassung, Pfadzeichen im Kern.
Rest = Übriggebliebenes: rauer dunkler Brocken mit Adern in Pfadfarbe und einem kleinen Pfadmotiv.
Aufruf: python3 icons_seq1.py <ausgabeordner>
"""
import sys, os
from pix import Canvas, ramp, sphere, hexc, mix, OUT, HI, BONE

PFADE = {  # Grundfarbe, Motiv (5x5, x = Zeichen)
    'laterne':    ('#e8b860', ['..x..', '.xx..', '.xxx.', 'xx.xx', '.xxx.']),
    'faden':      ('#b898e0', ['x...x', '.x.x.', '..x..', '.x.x.', 'x..xx']),
    'maske':      ('#e07a8a', ['xxxxx', 'x.x.x', 'xxxxx', '.x.x.', '..x..']),
    'echo':       ('#6fe0d0', ['x.x..', '.x.x.', '.x.x.', '.x.x.', 'x.x..']),
    'kessel':     ('#9ad06a', ['..x..', '..x..', '.xxx.', 'xxxxx', '.xxx.']),
    'eisen':      ('#a8b4c0', ['xxxxx', '.xxx.', '..x..', '.xxx.', 'xxxxx']),
    'schluessel': ('#d0a050', ['.xxx.', 'xx.xx', '.xxx.', '..x..', '.xx..']),
    'sq_waage':   ('#ffe080', ['..x..', 'xxxxx', 'x.x.x', '..x..', '.xxx.']),
    'sq_moor':    ('#80a060', ['x.x.x', 'x.x.x', '.xxx.', '..x..', '.xxx.']),
    'sq_uhr':     ('#c8c8f0', ['.xxx.', 'x.x.x', 'x.xxx', 'x...x', '.xxx.']),
}

MESSING = [(66, 50, 32), (122, 92, 48), (178, 138, 80), (213, 173, 104), (240, 214, 150)]
STEIN = [(36, 34, 44), (52, 50, 62), (74, 70, 82), (104, 98, 108), (140, 132, 136)]


def charakteristik(pid):
    base, motiv = PFADE[pid]
    r = ramp(base)
    cv = Canvas(16, 16)
    # Fassung: Sockel + drei Krallen
    for x in range(5, 11):
        cv.set(x, 13, MESSING[1])
        cv.set(x, 14, MESSING[0])
    for x in range(6, 10):
        cv.set(x, 12, MESSING[2])
    cv.set(5, 13, MESSING[2]); cv.set(6, 13, MESSING[3]); cv.set(7, 12, MESSING[3])
    tief = [mix(r[0], OUT[:3], 0.35), r[0], r[1], r[2], r[3]]
    sphere(cv, 7, 6, 5, tief, dither=False)
    # Rücklicht unten rechts
    for x, y in [(10, 9), (11, 8), (11, 7), (9, 10)]:
        cv.set(x, y, r[1])
    # Krallen über die Kugel
    for (x, y), c in {(3, 9): 2, (3, 10): 1, (4, 11): 1, (12, 9): 1, (12, 10): 0, (11, 11): 0, (7, 12): 3, (8, 12): 2}.items():
        cv.set(x, y, MESSING[c])
    cv.set(3, 8, MESSING[3]); cv.set(12, 8, MESSING[2])
    # Kern-Zeichen
    glow = mix(hexc(base), HI, 0.55)
    for dy, row in enumerate(motiv):
        for dx, ch in enumerate(row):
            if ch == 'x':
                cv.set(5 + dx, 4 + dy, glow)
    # Glanz oben links, Funken oben rechts
    cv.set(4, 3, HI); cv.set(5, 2, HI); cv.set(4, 2, r[4]); cv.set(3, 4, r[4])
    cv.outline()
    return cv.image()


REST_FORM = [  # rauer Brocken 12x9, a=Stein hell..d=dunkel
    '....aab.....',
    '..aabbbcb...',
    '.abbbcbccc..',
    'abbcbcccccd.',
    'bbcccccdcdd.',
    '.cccdcddddd.',
    '.ccdddddddd.',
    '..dddddddd..',
    '....ddd.....',
]
ADERN = [(3, 3), (4, 4), (5, 4), (6, 5), (7, 5), (8, 6), (5, 2), (6, 3), (9, 4)]

REST_MOTIV = {  # kleines Motiv auf/aus dem Brocken (Zeichen: o = Pfad hell, p = Pfad, q = Pfad dunkel, w = Bein, m = Messing)
    'laterne':    ((7, 0), ['.o.', 'opo', 'opo', '.p.']),
    'faden':      ((1, 4), ['p.......', '.pp..p..', '...pp.pp', '.......p']),
    'maske':      ((6, 2), ['wwww', 'wqwq', '.ww.']),
    'echo':       ((4, 1), ['.ooo.', 'o...o', '..p..', '.o.o.']),
    'kessel':     ((8, 6), ['po', 'po', '.p', '.o']),
    'eisen':      ((4, 5), ['m.m', '...', 'm.m']),
    'schluessel': ((9, 1), ['mmm', 'm.m', 'mmm', '.m.', '.mm', '.m.']),
    'sq_waage':   ((7, 1), ['.mm.', 'mwwm', 'mmmm', '.mm.']),
    'sq_moor':    ((2, 1), ['p.o.', 'op.p', '.pp.', '..p.']),
    'sq_uhr':     ((8, 2), ['.m.m', 'mmmm', 'm.wm', 'mmmm', '.m.m']),
}


def rest(pid):
    base, _ = PFADE[pid]
    r = ramp(base)
    cv = Canvas(16, 16)
    ox, oy = 2, 5
    cmap = {'a': STEIN[4], 'b': STEIN[3], 'c': STEIN[2], 'd': STEIN[1]}
    cv.stamp(REST_FORM, ox, oy, cmap)
    for x, y in ADERN:
        if cv.get(ox + x, oy + y) is not None:
            cv.set(ox + x, oy + y, r[2] if (x + y) % 2 else r[3])
    cv.set(ox + 4, oy + 3, r[4])
    (mx, my), m = REST_MOTIV[pid]
    pal = {'o': r[4], 'p': r[2], 'q': r[0], 'w': (220, 212, 196), 'm': (178, 138, 80)}
    cv.stamp(m, ox + mx, oy + my - 2 if pid in ('laterne', 'schluessel', 'sq_waage', 'sq_moor') else oy + my, pal)
    cv.outline()
    return cv.image()


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    for pid in PFADE:
        charakteristik(pid).save(os.path.join(out, f'char_seq1_{pid}.png'))
        rest(pid).save(os.path.join(out, f'rest_{pid}.png'))
