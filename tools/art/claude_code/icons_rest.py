"""Beyonder-Rest in drei Stufen je Pfad, 16 und 32 (ersetzt das eine Rest-Icon je Pfad aus icons_seq1.py).
Stufe k = Seq 9–7 (kleiner, matter Brocken), m = Seq 6–4 (Adern leuchten), g = Seq 3–1 (großer Splitter, glühender Riss).
Aufruf: python3 icons_rest.py <items-ordner>
"""
import sys, os
from formen import Teile
from pix import ramp

FARBE = {'laterne': '#e8b860', 'faden': '#b898e0', 'maske': '#e07a8a', 'echo': '#6fe0d0', 'kessel': '#9ad06a',
         'eisen': '#a8b4c0', 'schluessel': '#d0a050', 'sq_waage': '#ffe080', 'sq_moor': '#80a060', 'sq_uhr': '#c8c8f0'}
STEIN = [(30, 28, 38), (44, 42, 54), (62, 58, 72), (88, 82, 96), (118, 110, 120)]
BROCKEN = [(-9, 4), (-7, -2), (-3, -6), (2, -7), (7, -4), (10, 1), (8, 6), (1, 8), (-6, 7)]
SPITZEN = [(-5, -5), (-2, -13), (1, -6), (4, -11), (6, -4)]
SKALA = {'k': 0.75, 'm': 1.0, 'g': 1.3}


def P(c, pts, s, dx=0, dy=0):
    return [(c[0] + x * s + dx, c[1] + y * s + dy) for x, y in pts]


def motiv(t, pid, r, c, s):
    """Kleines Pfadmotiv auf dem Brocken (32er-Koordinaten relativ zur Mitte)."""
    x, y = c
    if pid == 'laterne':
        t.poly(r, [(x - 1, y - 9 * s), (x + 2, y - 5 * s), (x, y - 3 * s), (x - 2, y - 5 * s)], level=4, flat=True)
    elif pid == 'faden':
        t.line(r, [(x - 10 * s, y - 1), (x - 2, y + 3), (x + 4, y - 2), (x + 11 * s, y + 2)], 1, level=4, flat=True)
    elif pid == 'maske':
        t.ell([(150, 150, 160), (190, 190, 196), (220, 214, 210), (236, 232, 226), (250, 248, 244)], [(x - 4, y - 5), (x + 4, y + 1)])
        t.px(r, [(x - 2, y - 3), (x + 1, y - 3)], level=0)
    elif pid == 'echo':
        for k in (3, 6):
            t.line(r, [(x + k * s, y - 4 * s), (x + (k + 2) * s, y), (x + k * s, y + 4 * s)], 1, level=4, flat=True)
    elif pid == 'kessel':
        t.ell(r, [(x + 4 * s, y + 5 * s), (x + 4 * s + 3, y + 5 * s + 4)], level=3)
    elif pid == 'eisen':
        for dx, dy in ((-4, -2), (3, -2), (-4, 3), (3, 3)):
            t.px('eisen', [(x + dx * s, y + dy * s)], level=4)
    elif pid == 'schluessel':
        t.line('messing', [(x + 2, y - 2), (x + 9 * s, y - 9 * s)], 2)
        t.ell('messing', [(x + 7 * s, y - 13 * s), (x + 11 * s + 1, y - 9 * s + 1)])
    elif pid == 'sq_waage':
        t.ell('gold', [(x - 3, y - 4), (x + 3, y + 2)])
        t.px('gold', [(x - 1, y - 2)], level=4)
    elif pid == 'sq_moor':
        for dx in (-5, -2, 1):
            t.line(r, [(x + dx * s, y - 4 * s), (x + dx * s + 1, y - 9 * s)], 1, level=3)
    elif pid == 'sq_uhr':
        t.ell('messing', [(x - 4, y - 4), (x + 4, y + 4)])
        t.ell('messing', [(x - 2, y - 2), (x + 2, y + 2)], level=0, flat=True)


def rest(t, pid, stufe):
    r = ramp(FARBE[pid])
    s = SKALA[stufe]
    c = (16, 20 if stufe != 'g' else 19)
    if stufe == 'g':
        t.poly(STEIN, P(c, SPITZEN, s))
    t.poly(STEIN, P(c, BROCKEN, s))
    # Adern
    lv = {'k': 1, 'm': 3, 'g': 4}[stufe]
    t.line(r, P(c, [(-6, 1), (-2, -1), (1, 2), (6, 0)], s), 1, level=lv - 1 if stufe != 'k' else 1, flat=True)
    t.line(r, P(c, [(-2, -1), (0, -5)], s), 1, level=lv - 1 if stufe != 'k' else 1, flat=True)
    if stufe != 'k':
        t.line(r, P(c, [(1, 2), (3, 6)], s), 1, level=lv - 2, flat=True)
    if stufe == 'g':  # glühender Riss
        t.line(r, P(c, [(-1, -11), (0, -6), (-1, -2)], s), 1, level=4, flat=True)
        t.px(r, P(c, [(-3, 3), (5, -2)], s), level=4)
    motiv(t, pid, r, (c[0], c[1]), s)


def bauen(pid, stufe, size):
    t = Teile(size)
    rest(t, pid, stufe)
    return t.render()


if __name__ == '__main__':
    od = sys.argv[1]
    os.makedirs(os.path.join(od, '32'), exist_ok=True)
    for pid in FARBE:
        for st in 'kmg':
            name = f'rest_{pid}' if st == 'm' else f'rest_{pid}_{st}'
            bauen(pid, st, 16).save(os.path.join(od, name + '.png'))
            bauen(pid, st, 32).save(os.path.join(od, '32', name + '.png'))
