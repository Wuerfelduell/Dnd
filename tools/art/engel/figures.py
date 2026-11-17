"""Figurenspezifische Nachbearbeitung der Motive (nach base.motif) und Aufbau der Kampfblätter 768x768
(Raster exakt wie hg_grenzwaechter: 128x128, 6x6; Reihen idle(p1,p2,p3), attack1, attack2, special, hurt, defeated)."""
import numpy as np
import base
from base import idx, OUT, PAL

ASH = [idx(h) for h in ('#bbae95', '#95a5a5', '#71858b', '#586c78')]
EMBER = idx('#d0a050')
_LUM = (PAL @ np.array([0.3, 0.59, 0.11]))

def ash_crown(m, eyes):
    """Engel des Thrones: die Krone über dem Kopf aus Asche statt Gold; Spitzen glimmen (Glut #d0a050)."""
    if not eyes: return m
    ey, ex = eyes[0][0], (eyes[0][1] + eyes[1][1]) // 2
    m = m.copy(); top = max(0, ey - 6)
    for y in range(0, top):
        for x in range(max(0, ex - 9), min(m.shape[1], ex + 10)):
            v = m[y, x]
            if v < 0 or v == OUT: continue
            L = _LUM[v]
            m[y, x] = ASH[0] if L > 190 else ASH[1] if L > 150 else ASH[2] if L > 110 else ASH[3]
    # Spitzen: oberstes farbiges Pixel je Spalte glimmt, wenn es über seinen Nachbarn liegt
    tops = {}
    for x in range(max(0, ex - 9), min(m.shape[1], ex + 10)):
        ys = [y for y in range(top) if m[y, x] >= 0 and m[y, x] != OUT]
        if ys: tops[x] = ys[0]
    for x, y in tops.items():
        if y <= min(tops.get(x - 1, 99), tops.get(x + 1, 99)) - 1: m[y, x] = EMBER
    return m

def crown_spikes(m, eyes):
    """Zacken der Aschekrone verstärken: drei kurze Aschezacken mit Glutspitze auf dem Kronenreif."""
    if not eyes: return m
    m = m.copy(); ey = eyes[0][0]; ex = (eyes[0][1] + eyes[1][1]) // 2
    top = max(0, ey - 6)
    ring = [(y, x) for y in range(top) for x in range(max(0, ex - 9), min(m.shape[1], ex + 10)) if m[y, x] >= 0]
    if not ring: return m
    ry = min(y for y, _ in ring); xs = [x for y, x in ring if y <= ry + 1]
    x0, x1 = min(xs), max(xs)
    for x in (x0 + 2, (x0 + x1) // 2, x1 - 2):
        for k, v in ((1, ASH[1]), (2, ASH[1]), (3, EMBER)):
            if ry - k >= 0: m[ry - k, x] = v
        if ry - 4 >= 0: m[ry - 4, x] = OUT
        for k in (1, 2, 3):
            for dx in (-1, 1):
                if ry - k >= 0 and 0 <= x + dx < m.shape[1] and m[ry - k, x + dx] < 0: m[ry - k, x + dx] = OUT
    return m

# ---------------------------------------------------------------- Kampfblatt
import rig
from rig import (place, pool, motes, ray, arc, chain, column, door, paper, recolor, squash, checker_out,
                 DIM1, DIM2, FLASH, A1, A2, A3, A4, TQ, FOOT, CW, M, blank)

HOVER = {'engel_1': 7, 'engel_2': 7, 'engel_3': 8, 'wetherby': 0}
POOLW = {'engel_1': 22, 'engel_2': 22, 'engel_3': 28, 'wetherby': 0}

def light_mask(m): return np.isin(m, [A1, A2, A3])

def orbit(c, body, cx, cy, rx, ry, angles, tilt_from=0):
    """Aktenblätter auf einer Ellipse um Wetherby; hinter dem Körper (sin<0) werden Körperpixel nicht übermalt."""
    for i, a in enumerate(angles):
        x = round(cx + rx * math.cos(a)) - 2; y = round(cy + ry * math.sin(a)) - 2
        paper(c, x, y, tilt=(i + tilt_from) % 2, behind=body if math.sin(a) < 0 else None)

import math

def battle_sheet(fig, P, EYES):
    """P: Posen-Motive idle/attack1/strike/attack2/special. Rückgabe: Blatt (768x768, Indizes) und Frame-Beschreibung."""
    F, D = {}, {}
    hv = HOVER[fig]; angel = fig != 'wetherby'; pw = POOLW[fig]
    def put_pose(m, lift=0, ax=66):
        c, (x0, y0) = place(m, ax=ax, lift=(hv + lift) if angel else 0)
        body = c >= 0
        if angel: pool(c, ax, pw)
        return c, body, (x0, y0, m.shape[1], m.shape[0])
    def papers(c, body, box, angles, rx=None, ry=None, cyf=0.45):
        x0, y0, w, h = box
        orbit(c, body, x0 + w // 2, y0 + int(h * cyf), rx or (w // 2 + 4), ry or 6, angles)
    idle = P['idle']
    # ---- Reihe 0: idle_p1 (0,1), idle_p2 (2,3), idle_p3 (4,5)
    for i in range(6):
        ph = i // 2; bob = (0, 2)[i % 2]
        m = idle if ph < 2 else recolor(idle, {A3: A2})
        c, body, box = put_pose(m, lift=bob)
        if angel:
            if ph >= 1:
                motes(c, [(box[0] - 2 + (i * 7) % 9, box[1] + 30 - 6 * (i % 2)), (box[0] + box[2] + 1, box[1] + 22 + 4 * (i % 2)),
                          (box[0] + box[2] // 2 + 6, box[1] - 3 + (i % 2))], A2)
            if ph == 2:
                motes(c, [(box[0] + 3, box[1] + 12 + 3 * (i % 2)), (box[0] + box[2] - 4, box[1] + 8 - 2 * (i % 2))], A1)
                motes(c, [(box[0] + box[2] + 2, box[1] + 40 - 3 * (i % 2))], TQ)
        else:
            base_a = [0.0, 2.1, 4.2] + ([1.0] if ph >= 1 else []) + ([3.1, 5.2] if ph == 2 else [])
            papers(c, body, box, [a + 0.5 * (i % 2) + 0.3 * i for a in base_a])
            if ph == 2: motes(c, [(box[0] + 4, box[1] + 20), (box[0] + box[2] - 6, box[1] + 30)], A2)
        F[(0, i)] = c
        D[(0, i)] = (f'idle_p{ph+1} {i%2+1}/2: ruhiges Schweben, {bob}px höher' + (' – mehr Licht (Funken)' if ph else '') + (', ein türkiser Funke' if ph == 2 else '')) if angel else \
                    f'idle_p{ph+1} {i%2+1}/2: steht müde, {len(base_a)} Aktenblätter kreisen um ihn' + (', Glutfunken' if ph == 2 else '')
    # ---- Reihe 1: attack1 Flügelschlag (Haltepose 7/8)
    c, body, box = put_pose(idle, lift=1); 
    m0 = recolor(idle, {A3: A2, A2: A1}); c, body, box = put_pose(m0, lift=1)
    if not angel: papers(c, body, box, [0.4, 2.5, 4.6])
    F[(1, 0)] = c; D[(1, 0)] = 'attack1 1/6: Ansatz, Licht in den Flügeln schwillt an'
    w, body, box = put_pose(P['attack1'], lift=2)
    if not angel: papers(w, body, box, [0.9, 3.0, 5.1], rx=box[2] // 2 + 8)
    F[(1, 1)] = w; F[(1, 2)] = w.copy(); D[(1, 1)] = D[(1, 2)] = 'attack1 2-3/6 (Ausholpose gehalten): Flügel hoch und weit zurück'
    s, body, box = put_pose(P['strike'], lift=0, ax=70)
    if not angel: papers(s, body, box, [1.6, 3.7, 5.8], rx=box[2] // 2 + 6)
    F[(1, 3)] = s; D[(1, 3)] = 'attack1 4/6: Flügelschlag nach vorn links'
    s2, body, box = put_pose(P['strike'], lift=0, ax=69)
    x0, y0, ww, hh = box
    for k, (yy, r) in enumerate([(0.35, 18), (0.5, 22), (0.62, 16)]):
        arc(s2, x0 + 10, y0 + int(hh * yy), r, math.pi * 0.62, math.pi * 1.25, col=A1 if k == 1 else A2, dither=k != 1)
    if not angel: papers(s2, body, box, [2.0, 4.1, 0.2], rx=box[2] // 2 + 6)
    F[(1, 4)] = s2; D[(1, 4)] = 'attack1 5/6: Lichtbögen der Schwinge fegen nach links'
    c, body, box = put_pose(idle, lift=0, ax=65)
    if angel: motes(c, [(box[0] - 3, box[1] + 40), (box[0] - 6, box[1] + 52)], A3)
    else: papers(c, body, box, [2.6, 4.7, 0.6])
    F[(1, 5)] = c; D[(1, 5)] = 'attack1 6/6: zurück ins Schweben, Restfunken'
    # ---- Reihe 2: attack2 Chor/Lichtkette (Haltepose 13/14)
    a2 = P['attack2']
    c, body, box = put_pose(idle, lift=-1 if angel else 0, ax=72)
    if not angel: papers(c, body, box, [0.2, 2.3, 4.4])
    F[(2, 0)] = c; D[(2, 0)] = 'attack2 1/6: sinkt kurz, sammelt Stimme'
    w, body, box = put_pose(a2, lift=1, ax=78)
    if not angel: papers(w, body, box, [0.7, 2.8, 4.9])
    F[(2, 1)] = w; F[(2, 2)] = w.copy(); D[(2, 1)] = D[(2, 2)] = 'attack2 2-3/6 (gehalten): Hände vor der Brust, stummer Chor'
    # Handhöhe: linkeste Figurenzeile im oberen Drittel
    x0, y0, ww, hh = box
    ys, xs = np.where(w[y0:y0 + hh * 2 // 3, :] >= 0); i = xs.argmin(); hx, hy = xs[i], ys[i] + y0
    for k in range(3):
        c, body, box = put_pose(a2, lift=1 + (k == 1), ax=78)
        L = [hx - 16, hx - 34, M + 1][k]
        chain(c, hx - 2, hy + (k == 1), max(M + 1, L), phase=k)
        for j in range(k + 1):   # Chor-Ringe: Schallbögen vor dem Kopf
            arc(c, hx - 2, hy - 12, 9 + 7 * j, math.pi * 0.7, math.pi * 1.3, col=A1 if j == k else A2, dither=j < k); arc(c, hx - 2, hy - 12, 10 + 7 * j, math.pi * 0.72, math.pi * 1.28, col=A3, dither=True)
        if k == 2: motes(c, [(M + 2, hy - 4), (M + 5, hy + 5), (hx - 30, hy - 8)], A1); motes(c, [(hx - 22, hy + 6)], TQ)
        if not angel: papers(c, body, box, [1.2 + 0.6 * k, 3.3 + 0.6 * k, 5.4 + 0.6 * k])
        F[(2, 3 + k)] = c
        D[(2, 3 + k)] = ['attack2 4/6: erste Glieder der Lichtkette lösen sich von den Händen, ein Chor-Bogen',
                         'attack2 5/6: Kette schnellt nach links, zwei Chor-Bögen',
                         'attack2 6/6: Kette bis zum Rand, drei Bögen, Funken (einer türkis)'][k]
    # ---- Reihe 3: special
    sp = P['special']
    for k in range(6):
        m = sp if k else recolor(sp, DIM1)
        c, body, box = put_pose(m, lift=1 if k in (1, 2) else 0, ax=80 if fig in ('engel_2', 'engel_3') else 66)
        x0, y0, ww, hh = box; cx = x0 + ww // 2
        if fig == 'engel_3':   # das Wort als Lichtsäule vor ihm (links)
            px = max(M + 8, x0 - 4)
            if k == 1: motes(c, [(cx - 2, y0 + 14), (cx + 1, y0 + 12)], A1)
            px = max(M + 12, x0 - 12)
            if k == 2: column(c, px, 5, y0 + 30)
            if k == 3: column(c, px, 13, M)
            if k == 4: column(c, px, 19, M); arc(c, px, FOOT, 16, math.pi, math.pi * 2, col=A2); arc(c, px, FOOT, 20, math.pi, math.pi * 2, col=A3, dither=True)
            if k == 5: column(c, px, 13, M, dither=True); motes(c, [(px + 10, 60), (px - 9, 80)], TQ)
            D[(3, k)] = ['special 1/6: Arme auf, Licht noch gedämpft', 'special 2/6: das Wort sammelt sich vor dem Mund',
                         'special 3/6: schmale Lichtsäule fällt', 'special 4/6: das Wort – volle Lichtsäule bis zum Boden',
                         'special 5/6: Säule am breitesten, Lichtring am Boden', 'special 6/6: Säule zerfällt (gerastert), zwei türkise Funken'][k]
        elif fig == 'engel_1':  # das Wort als Lichtring um den Engel
            r = [0, 6, 14, 24, 34, 42][k]
            if k == 1: motes(c, [(cx - 2, y0 + 12), (cx + 1, y0 + 12)], A1)
            if k >= 2: arc(c, cx, y0 + hh // 2, r, 0, math.pi * 2, col=A1 if k < 5 else A3, dither=k == 5)
            if k >= 3: arc(c, cx, y0 + hh // 2, r - 6, 0, math.pi * 2, col=A3, dither=True)
            if k == 4: motes(c, [(cx + r - 4, y0 + 10)], TQ)
            D[(3, k)] = f'special {k+1}/6: das Wort – Lichtring um den Engel (Radius {r}px)' if k >= 2 else ['special 1/6: Arme auf, Licht gedämpft', 'special 2/6: das Wort sammelt sich'][k]
        elif fig == 'engel_2':  # das Wort öffnet eine Tür aus Licht vor ihm
            hgt = [0, 0, 24, 48, 70, 70][k]
            if k == 1: motes(c, [(cx - 2, y0 + 12), (cx + 1, y0 + 12)], A1)
            if k >= 2:
                dw = hgt // 3 + 6; dx = max(M + 1, x0 - dw // 2 - 4)
                door(c, dx, FOOT - 1 - hgt, dw, hgt, col=A1 if k < 5 else A2)
                if k >= 4:   # Licht fällt durch die offene Tür: senkrechte Streifen
                    for sx in range(dx + 2, dx + dw - 2, 3):
                        ray(c, sx, FOOT - hgt + 3 + (sx % 4), sx, FOOT - 2, col=A2 if k == 4 else A3, edge=A3, width=0)
                if k == 5: motes(c, [(dx + dw // 2, FOOT - hgt - 4)], TQ)
            D[(3, k)] = ['special 1/6: Arme auf, Licht gedämpft', 'special 2/6: das Wort sammelt sich',
                         'special 3/6: eine Schwelle aus Licht erscheint vor ihm', 'special 4/6: der Türrahmen wächst',
                         'special 5/6: die Tür steht offen, Licht fällt hindurch', 'special 6/6: Tür flackert (einzelner türkiser Funke)'][k]
        else:  # Wetherby: Aktensturm
            n = [3, 5, 7, 9, 10, 6][k]; rot = 0.55 * k
            angs = [rot + 2 * math.pi * j / n for j in range(n)]
            papers(c, body, box, angs, rx=ww // 2 + 6 + 2 * k, ry=10 + 2 * k, cyf=0.5 - 0.03 * k)
            if k >= 3:
                papers(c, body, box, [rot * 1.7 + 2 * math.pi * j / 4 for j in range(4)], rx=ww // 2 - 4, ry=22, cyf=0.3)
            D[(3, k)] = f'special {k+1}/6: Aktensturm – {n} Blätter kreisen' + (' + innerer Wirbel' if k >= 3 else '')
        F[(3, k)] = c
    # ---- Reihe 4: hurt
    for k in range(6):
        dx = [3, 5, 4, 2, 1, 0][k]
        m = idle
        if k in (0, 2): m = recolor(idle, FLASH)
        if k == 1: m = recolor(idle, DIM1)
        if k == 3: m = recolor(idle, DIM1) if angel else idle
        c, body, box = put_pose(m, lift=[0, -1, 0, 1, 1, 1][k], ax=66 + dx + (k == 5))
        x0, y0, ww, hh = box
        if k in (0, 1, 2):
            for j in range(4 + k):
                a = 2 * math.pi * j / (4 + k) + k
                motes(c, [(x0 + ww // 2 + round((ww // 2 + 3) * math.cos(a)), y0 + 20 + round(10 * math.sin(a)))], A1 if j % 2 else A2)
        if not angel: papers(c, body, box, [0.3 + k, 2.4 + k] + ([4.5 + k] if k > 2 else []), rx=ww // 2 + 5 + (3 - k if k < 3 else 0))
        if k == 4 and angel: motes(c, [(x0 - 2, y0 + 44)], A3)
        F[(4, k)] = c
        D[(4, k)] = ['hurt 1/6: getroffen, Lichtblitz, weicht 3px zurück', 'hurt 2/6: weiter zurück, Flügellicht gedämpft',
                     'hurt 3/6: zweiter Blitz, Funken', 'hurt 4/6: fängt sich', 'hurt 5/6: richtet sich auf', 'hurt 6/6: wieder im Schweben' if angel else 'hurt 6/6: steht wieder'][k]
    # ---- Reihe 5: defeated
    for k in range(6):
        f = [1.0, 0.95, 0.88, 0.8, 0.72, 0.66][k]
        m = recolor(idle, DIM1 if k < 2 else DIM2)
        if k >= 3: m = checker_out(m, light_mask(m) | np.isin(m, [A4]), phase=k)
        if k >= 1: m = squash(m, f)
        lift = [hv - 2, hv // 2, 0, 0, 0, 0][k] if angel else 0
        c, (x0, y0) = place(m, ax=66, lift=lift)
        body = c >= 0
        if angel and k < 2: pool(c, 66, pw - 4 * k)
        if angel and k >= 3:
            motes(c, [(x0 + (7 * j + 3 * k) % max(1, m.shape[1]), y0 - 3 - (j * 5 + k) % 9) for j in range(3)], rig.ASHG[k % 3])
        if not angel:
            n = 3; papers(c, body, (x0, y0, m.shape[1], m.shape[0]),
                          [0.4 + 0.2 * k, 2.5 + 0.2 * k, 4.6 + 0.2 * k], rx=m.shape[1] // 2 + 4, ry=4, cyf=min(0.9, 0.45 + 0.1 * k))
        F[(5, k)] = c
        D[(5, k)] = ['defeated 1/6: Licht erlischt, sinkt', 'defeated 2/6: berührt fast den Boden', 'defeated 3/6: sinkt zusammen, Flügel dunkel',
                     'defeated 4/6: Lichtbahnen zerfallen', 'defeated 5/6: kniet, Gewand liegt am Boden', 'defeated 6/6: zusammengesunken, Asche steigt auf'][k] if angel else \
                    ['defeated 1/6: Flügel erlöschen', 'defeated 2/6: knickt ein', 'defeated 3/6: sinkt zusammen, Blätter fallen',
                     'defeated 4/6: Lichtreste zerfallen', 'defeated 5/6: kniet', 'defeated 6/6: zusammengesunken, die Akten liegen am Boden'][k]
    sheet = np.full((768, 768), -1, np.int32)
    for (r, cc), c in F.items(): sheet[r * 128:(r + 1) * 128, cc * 128:(cc + 1) * 128] = c
    return sheet, D
