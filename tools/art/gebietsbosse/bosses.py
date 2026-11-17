"""Pose-Definitionen je Boss. Jede Pose ist ein eigenes Motiv: Teil-Versatz, Neigung, Stauchung + Effekte + Beschreibung."""
import numpy as np
import random
from rig import *

def paint_maw_weichenfresser(a):
    """Handgezeichnet: Rachen im Rostmaul dunkel öffnen, Glut/Funken im Schlund, Weichenzungen-Rippen aufhellen."""
    a = a.copy()
    for y in range(24, 32):
        for x in range(12, 19):
            if a[y, x] >= 0: a[y, x] = 1 if (x + y) % 3 else OUT
    for (x, y, v) in [(14,27,16),(15,28,17),(16,26,16),(13,29,16),(16,29,17),(15,25,16),(17,28,16)]:
        a[y, x] = v
    # Weichenzungen als Rippen: helle, gebogene Stahlkanten über der Flanke
    for x0 in (34, 41, 48, 55, 62):
        for i in range(9):
            x = x0 + (i // 3); y = 26 + i
            if 0 <= y < a.shape[0] and a[y, x] >= 0 and a[y, x] != OUT:
                a[y, x] = 6 if i < 4 else 5
    return a

def spray(c, x, y, n, seed, rise=0):
    """Funkenregen: Bögen nach oben-links aus dem Rostmaul."""
    r = random.Random(seed)
    for i in range(n):
        t = r.uniform(0.25, 1.0); vx = r.uniform(-10, 7); vy = -r.uniform(6, 24)
        px = round(x + vx * t); py = round(y - rise + vy * t + 10 * t * t)
        put(c, px, py, AMBER); 
        if r.random() < 0.5: put(c, px + 1, py + 1, AMBER2)

def weichenfresser(base):
    base = paint_maw_weichenfresser(base)
    rig = Rig(base, [
        ('head', lambda y, x: (x < 24) & (y < 40)),
    ])
    CW, CH, X0, FOOT = 96, 96, 5, 93
    F = lambda **k: rig.frame(CW, CH, X0, FOOT, **k)
    frames, desc = {}, {}
    def maw(c, n, seed, dx=0, dy=0, reach=4):
        sparks(c, X0 + 12 + dx, 94 - 52 + 27 + dy, n, seed, spread=3, reach=reach)
    # idle: schweres Atmen, Kopf hängt, Glut im Rachen flackert
    for i, (b, h) in enumerate([(0, 0), (1, 1), (1, 2), (0, 1)]):
        c = F(off={'body': (0, b), 'head': (0, h)}, lean_from=40, smear=('head',))
        maw(c, 3 + i % 2, 10 + i); frames[('idle', i)] = c
        desc[('idle', i)] = f'idle {i+1}/4: steht schwer auf vier Eisenbeinen, Rumpf {b}px gesenkt, Kopf {h}px hängend, Glutfunken flackern im Rostmaul'
    # attack: Ausholen (2 gleiche Frames), Vorstoß, Biss mit Funkenregen, Nachglühen, zurück
    wind = F(off={'body': (2, -1), 'head': (3, -3)}, lean=3, lean_from=40, smear=('head',))
    maw(wind, 4, 31)
    frames[('attack', 0)] = wind; frames[('attack', 1)] = wind.copy()
    desc[('attack', 0)] = desc[('attack', 1)] = 'attack 1-2/6 (Ausholpose gehalten): weicht nach hinten, Kopf hochgerissen, Rachen glüht auf'
    c = F(off={'body': (-2, 0), 'head': (-4, 1)}, lean=-2, lean_from=40, smear=('head',)); maw(c, 6, 32, -4, 1, 6)
    frames[('attack', 2)] = c; desc[('attack', 2)] = 'attack 3/6: Vorstoß nach links, Maul vorgeschoben'
    c = F(off={'body': (-3, 1), 'head': (-5, 3)}, lean=-3, lean_from=40, smear=('head',)); spray(c, X0 + 6, 64, 18, 33)
    frames[('attack', 3)] = c; desc[('attack', 3)] = 'attack 4/6: Biss, Kopf tief, Funkenregen aus dem Schlund'
    c = F(off={'body': (-2, 1), 'head': (-3, 2)}, lean=-1, lean_from=40, smear=('head',)); spray(c, X0 + 6, 62, 9, 34, rise=6)
    frames[('attack', 4)] = c; desc[('attack', 4)] = 'attack 5/6: Funken verglühen, Rumpf noch vorn'
    c = F(off={'body': (-1, 0), 'head': (-1, 1)}, lean_from=40, smear=('head',)); maw(c, 2, 35)
    frames[('attack', 5)] = c; desc[('attack', 5)] = 'attack 6/6: zurück in den Stand'
    # hurt
    for i, (dx, l) in enumerate([(3, 3), (2, 2), (1, 1)]):
        c = F(off={'body': (dx, 0), 'head': (dx + 1, -1 + i)}, lean=l, lean_from=40)
        if i == 0: stars(c, X0 + 16, 54, 51)
        if i == 1: stars(c, X0 + 14, 56, 52)
        frames[('hurt', i)] = c; desc[('hurt', i)] = f'hurt {i+1}/3: zurückgeworfen {dx}px, Kopf zuckt' + (', Rostsplitter am Kopf' if i < 2 else '')
    # defeated: Beine knicken, Rumpf sinkt auf die Schienenrippen, letzte Glut erlischt
    for i, (sq, h) in enumerate([(0.8, 1), (0.5, 2), (0.28, 3), (0.12, 4)]):
        c = F(off={'head': (0, h)}, squash=sq, squash_from=36, lean=1 if i else 0, lean_from=36, smear=('head',))
        if i < 3: sparks(c, X0 + 12, 93 - 4 - i, 2 - i // 2, 60 + i, spread=1, reach=2)
        dust(c, X0 + 4, X0 + 84, 93, 70 + i, 4 + 3 * i)
        frames[('defeated', i)] = c; desc[('defeated', i)] = f'defeated {i+1}/4: Beine knicken ein (Beinhöhe {int(sq*100)}%), Rumpf sinkt auf den Boden, Kopf liegt auf, Glut ' + ('glimmt' if i < 3 else 'erloschen') + ', Rost staubt'
    return frames, desc

def bruchmeister(base):
    rig = Rig(base, [
        ('upper', lambda y, x: (y < 62)),
        ('hammer_low', lambda y, x: (x >= 30) & (y >= 46) & (y < 72)),
        ('hammer_top', lambda y, x: (y < 16) & (x >= 26)),
    ])
    CW, CH, X0, FOOT = 96, 96, 18, 93
    F = lambda **k: rig.frame(CW, CH, X0, FOOT, **k)
    frames, desc = {}, {}
    orbit = [[(10, 40), (74, 30), (14, 70), (76, 62)], [(9, 37), (75, 33), (12, 66), (78, 58)],
             [(11, 34), (73, 36), (14, 63), (77, 55)], [(12, 37), (72, 33), (16, 66), (75, 59)]]
    for i, b in enumerate([0, 1, 1, 0]):
        c = F(off={'upper': (0, b), 'hammer_low': (0, b), 'hammer_top': (0, b)}, lean_from=62)
        for j, (x, y) in enumerate(orbit[i]): chip(c, x, y, big=(j == 0))
        frames[('idle', i)] = c; desc[('idle', i)] = f'idle {i+1}/4: steht gebückt mit zwei uralten Hämmern, Atem hebt die Schultern ({b}px), Kalksplitter kreisen langsam'
    wind = F(off={'upper': (2, -2), 'hammer_top': (4, -5), 'hammer_low': (2, -3)}, lean=7, lean_from=62)
    for x, y in [(8, 30), (80, 26), (12, 60)]: chip(wind, x, y)
    frames[('attack', 0)] = wind; frames[('attack', 1)] = wind.copy()
    desc[('attack', 0)] = desc[('attack', 1)] = 'attack 1-2/6 (Ausholpose gehalten): richtet sich auf, lehnt zurück, Schulterhammer hoch über den Kopf'
    c = F(off={'upper': (-2, 1), 'hammer_top': (-5, 3), 'hammer_low': (-2, 0)}, lean=-6, lean_from=62)
    frames[('attack', 2)] = c; desc[('attack', 2)] = 'attack 3/6: erster Takt, schwingt nach vorn'
    c = F(off={'upper': (-3, 4), 'hammer_top': (-8, 9), 'hammer_low': (-3, 2)}, lean=-10, lean_from=62)
    for k, (x, y) in enumerate([(4, 84), (9, 79), (14, 86), (2, 76), (20, 82), (7, 88)]): chip(c, x, y, big=k < 2)
    dust(c, 2, 30, 93, 81, 10)
    frames[('attack', 3)] = c; desc[('attack', 3)] = 'attack 4/6: Schlag, Oberkörper tief, Kalk spritzt am Boden'
    c = F(off={'upper': (-2, 2), 'hammer_top': (-3, 3), 'hammer_low': (-4, 0)}, lean=-3, lean_from=62)
    for x, y in [(3, 70), (10, 64), (6, 80), (18, 72)]: chip(c, x, y)
    frames[('attack', 4)] = c; desc[('attack', 4)] = 'attack 5/6: zweiter Takt mit dem unteren Hammer, Splitter fliegen hoch'
    c = F(off={'upper': (-1, 1), 'hammer_low': (-1, 0)}, lean=-1, lean_from=62)
    for x, y in [(6, 58), (12, 50)]: chip(c, x, y)
    frames[('attack', 5)] = c; desc[('attack', 5)] = 'attack 6/6: richtet sich wieder auf'
    for i, (dx, l) in enumerate([(3, 4), (2, 2), (1, 1)]):
        c = F(off={'upper': (dx, 0), 'hammer_top': (dx + 1, -1), 'hammer_low': (dx, 0)}, lean=l, lean_from=62)
        if i < 2: stars(c, X0 + 18, 18 + 2 * i, 90 + i); chip(c, X0 + 6 - i, 24 + 3 * i)
        frames[('hurt', i)] = c; desc[('hurt', i)] = f'hurt {i+1}/3: Treffer, Kopfblock splittert, {dx}px zurück'
    for i, (sq, l) in enumerate([(0.85, 2), (0.6, 5), (0.4, 9), (0.3, 13)]):
        c = F(off={'hammer_top': (-2 * i, 3 * i), 'hammer_low': (-i, 0)}, squash=sq, squash_from=56, lean=-l, lean_from=56)
        dust(c, 8, 88, 93, 100 + i, 4 + 4 * i)
        for k in range(i): chip(c, 10 + 22 * k, 90 - k)
        frames[('defeated', i)] = c; desc[('defeated', i)] = f'defeated {i+1}/4: sinkt vornüber auf die Knie ({int(sq*100)}%), Hämmer gleiten zu Boden, Kalk bröckelt'
    return frames, desc

def schluchtrufer(base):
    rig = Rig(base, [
        ('horns', lambda y, x: (y < 28) & (x >= 22)),
        ('jaw_up', lambda y, x: (x < 24) & (y >= 16) & (y < 42)),
        ('jaw_low', lambda y, x: (x < 24) & (y >= 42) & (y < 62)),
        ('plinth', lambda y, x: (y >= 80)),
    ])
    CW, CH, X0, FOOT = 96, 96, 22, 93
    F = lambda **k: rig.frame(CW, CH, X0, FOOT, **k)
    MX, MY = X0 + 8, 94 - 85 + 42  # Schlundmitte im Zellraster
    frames, desc = {}, {}
    pulse = [{30: 29}, {}, {29: 30}, {}]
    for i, (b, j) in enumerate([(0, 0), (1, 1), (1, 2), (0, 1)]):
        c = F(off={'horns': (0, b - (i % 2)), 'jaw_up': (0, b), 'jaw_low': (0, b + j), 'body': (0, b)}, lean_from=80, smear=('jaw_low',))
        c = recolor(c, pulse[i])
        if i in (1, 2): ring(c, MX - 4, MY, 4 + i, col=TQ2, arc=(140, 220))
        frames[('idle', i)] = c; desc[('idle', i)] = f'idle {i+1}/4: der eine große Schlund atmet ({j}px offen), Hörner wippen, leises Summen als schwacher Ring'
    wind = F(off={'horns': (2, -2), 'jaw_up': (2, -3), 'jaw_low': (2, 3), 'body': (1, 0)}, lean=2, lean_from=80, smear=('jaw_up', 'jaw_low'))
    frames[('attack', 0)] = wind; frames[('attack', 1)] = wind.copy()
    desc[('attack', 0)] = desc[('attack', 1)] = 'attack 1-2/6 (Ausholpose gehalten): reißt den Schlund weit auf, holt Luft'
    for k, (r, ox) in enumerate([(5, -2), (9, -3), (13, -3), (17, -1)]):
        c = F(off={'horns': (ox + 1, 1), 'jaw_up': (ox, -2), 'jaw_low': (ox, 3), 'body': (ox // 2, 0)}, lean=-2, lean_from=80, smear=('jaw_up', 'jaw_low'))
        for rr in range(r, 3, -6): ring(c, MX - 2 + ox, MY, rr, col=TQ if rr == r else TQ2, arc=(120, 240), thick=2 if rr == r else 1)
        frames[('attack', 2 + k)] = c
        desc[('attack', 2 + k)] = f'attack {3+k}/6: Ruf, Schallring {k+1} läuft nach links (Radius {r})'
    for i, (dx, l) in enumerate([(3, 3), (2, 2), (1, 1)]):
        c = F(off={'horns': (dx + 1, -1), 'jaw_up': (dx, -1), 'jaw_low': (dx, 2 - i), 'body': (dx, 0)}, lean=l, lean_from=80, smear=('jaw_low',))
        if i < 2: stars(c, X0 + 20, 20, 120 + i)
        frames[('hurt', i)] = c; desc[('hurt', i)] = f'hurt {i+1}/3: zuckt zurück, Kiefer schnappt, Hörner verbiegen'
    for i, (sq, l) in enumerate([(0.92, 1), (0.78, 2), (0.62, 3), (0.48, 4)]):
        c = F(off={'jaw_low': (0, -i), 'horns': (2 * i, i)}, squash=sq * 0.9 if i else sq, squash_from=58, lean=l, lean_from=58)
        dust(c, X0, X0 + 66, 93, 140 + i, 3 + 3 * i)
        if i == 0: ring(c, MX, MY + 8, 4, col=TQ2, arc=(150, 210))
        frames[('defeated', i)] = c; desc[('defeated', i)] = f'defeated {i+1}/4: Kabel sacken zusammen ({int(sq*100)}%), Schlund schließt sich, ' + ('letzter Laut' if i == 0 else 'Stille')
    # phase2 / special: Schallringe
    wind = F(off={'horns': (1, -3), 'jaw_up': (2, -4), 'jaw_low': (2, 4), 'body': (1, -1)}, lean=3, lean_from=80, smear=('jaw_up', 'jaw_low'))
    wind = recolor(wind, {29: 30, 28: 29})
    frames[('phase2', 0)] = wind; frames[('phase2', 1)] = wind.copy()
    desc[('phase2', 0)] = desc[('phase2', 1)] = 'special 1-2/6 (gehalten): Schlund maximal offen, Türkis-Glut steigt im Rachen, Hörner richten sich auf'
    for k in range(4):
        c = F(off={'horns': (-1, 1 - (k % 2)), 'jaw_up': (-2, -3), 'jaw_low': (-2, 4), 'body': (-1, 0)}, lean=-2, lean_from=80, smear=('jaw_up', 'jaw_low'))
        c = recolor(c, {29: 30, 28: 29})
        for n in range(k + 1):
            r = 6 + 9 * (k - n) + 4
            ring(c, MX - 2, MY, r, col=TQ if n == k else TQ2, arc=(100, 260), thick=2 if n == k else 1)
        for hx, hy in [(X0 + 32, 12), (X0 + 52, 20)]:
            if k % 2 == 0: ring(c, hx, hy, 3 + k, col=TQ2, arc=(60, 160))
        frames[('phase2', 2 + k)] = c
        desc[('phase2', 2 + k)] = f'special {3+k}/6: Schallringe, {k+1} konzentrische Ringe laufen aus dem Schlund über das Feld'
    return frames, desc

def tiefenvorarbeiter(base):
    rig = Rig(base, [
        ('arm_l', lambda y, x: (x < 24) & (y >= 30)),
        ('arm_r', lambda y, x: (x >= 72) & (y >= 26)),
        ('head', lambda y, x: (y < 24) & (x >= 20) & (x < 62)),
    ])
    CW, CH, X0, FOOT = 128, 96, 18, 93
    F = lambda **k: rig.frame(CW, CH, X0, FOOT, **k)
    LX, LY = X0 + 26, 94 - 90 + 15  # Grubenlampe
    frames, desc = {}, {}
    flick = [{}, {17: 16}, {}, {16: 17}]
    seam = [{}, {30: 29}, {29: 30, 30: 31}, {30: 29}]
    def legs_static(i): return None
    for i, b in enumerate([0, 1, 1, 0]):
        c = F(off={'body': (0, b), 'head': (0, b), 'arm_l': (0, b), 'arm_r': (0, 0)}, lean_from=70)
        c = recolor(c, flick[i]); smoke(c, X0 + 12, 94 - 90 + 20, i)
        frames[('idle', i)] = c; desc[('idle', i)] = f'idle {i+1}/4: gebückter Fels-Vorarbeiter, Grubenlampe flackert, Pfeife qualmt, Atem {b}px'
    wind = F(off={'body': (2, -1), 'head': (2, -2), 'arm_l': (3, -5), 'arm_r': (1, -1)}, lean=3, lean_from=70, smear=('arm_l',))
    frames[('attack', 0)] = wind; frames[('attack', 1)] = wind.copy()
    desc[('attack', 0)] = desc[('attack', 1)] = 'attack 1-2/6 (Ausholpose gehalten): hebt den linken Felsarm, lehnt zurück'
    for k, (ox, ay, l) in enumerate([(-2, 2, -2), (-4, 5, -4), (-3, 3, -2), (-1, 1, 0)]):
        c = F(off={'body': (ox // 2, 0), 'head': (ox, 1), 'arm_l': (ox * 2, ay), 'arm_r': (ox // 2, 0)}, lean=l, lean_from=70, smear=('arm_l',))
        if k == 1:
            for j, (x, y) in enumerate([(4, 86), (8, 80), (2, 78), (12, 88), (6, 72)]): chip(c, x, y, big=j < 2, cols=(9, 10))
            dust(c, 0, 30, 93, 200, 12)
        if k == 2: dust(c, 0, 26, 93, 201, 6)
        frames[('attack', 2 + k)] = c
        desc[('attack', 2 + k)] = ['attack 3/6: Arm fährt herab', 'attack 4/6: Schlag auf den Boden, Gestein springt', 'attack 5/6: Staub legt sich', 'attack 6/6: zurück an die Arbeit'][k]
    for i, (dx, l) in enumerate([(3, 3), (2, 2), (1, 1)]):
        c = F(off={'body': (dx, 0), 'head': (dx + 1, -1), 'arm_l': (dx, 0), 'arm_r': (dx, 0)}, lean=l, lean_from=70)
        c = recolor(c, {17: 16} if i == 0 else {})
        if i < 2: stars(c, LX + 2, LY - 4 + i, 220 + i); chip(c, LX + 30, LY + 4 + 3 * i, cols=(9, 10))
        frames[('hurt', i)] = c; desc[('hurt', i)] = f'hurt {i+1}/3: Treffer am Helm, Lampe flackert, Gestein platzt ab'
    for i, sq in enumerate([0.93, 0.8, 0.64, 0.48]):
        c = F(off={'head': (0, i), 'arm_l': (-i, 0), 'arm_r': (i, 0)}, squash=sq, squash_from=56, lean=-i, lean_from=56)
        c = recolor(c, {17: 16, 30: 29} if i < 3 else {17: 15, 16: 15, 30: 28, 29: 28})
        dust(c, X0, X0 + 95, 93, 240 + i, 5 + 4 * i)
        frames[('defeated', i)] = c; desc[('defeated', i)] = f'defeated {i+1}/4: setzt sich schwer ab ({int(sq*100)}%), Lampe wird schwächer' + (', erlischt' if i == 3 else '')
    # phase1: Schichtbeginn – Lichtkegel der Grubenlampe
    w = F(off={'head': (1, -2), 'body': (0, -1), 'arm_l': (0, -1)}, lean=1, lean_from=70)
    w = recolor(w, {16: 17}); cone(w, LX - 1, LY + 1, 5, 2, 300, slope=0.3)
    frames[('phase1', 0)] = w; frames[('phase1', 1)] = w.copy()
    desc[('phase1', 0)] = desc[('phase1', 1)] = 'phase1 1-2/6 (gehalten): hebt den Kopf, die Grubenlampe glüht auf'
    for k, (L, hh) in enumerate([(12, 4), (20, 7), (26, 9), (18, 6)]):
        c = F(off={'head': (-1, -1), 'body': (0, 0)}, lean=-1, lean_from=70)
        c = recolor(c, {16: 17}); cone(c, LX - 2, LY, L, hh, 301 + k, slope=[0.2, 0.4, 0.6, 0.3][k])
        frames[('phase1', 2 + k)] = c; desc[('phase1', 2 + k)] = f'phase1 {3+k}/6: Lampenkegel schwenkt über das Feld (Länge {L}) – die Schicht beginnt'
    # phase2: Kette mit Schichtmarken
    w = F(off={'arm_r': (2, -3), 'body': (1, 0), 'head': (1, -1)}, lean=2, lean_from=70)
    frames[('phase2', 0)] = w; frames[('phase2', 1)] = w.copy()
    desc[('phase2', 0)] = desc[('phase2', 1)] = 'phase2 1-2/6 (gehalten): greift an die Kette mit den Schichtmarken'
    for k in range(4):
        c = F(off={'arm_r': (-k, 1), 'body': (-1, 0), 'head': (-1, 0)}, lean=-2, lean_from=70)
        c = recolor(c, seam[k])
        cx, cy = X0 + 14, 94 - 90 + 44
        pts = []
        for t in range(10 + 6 * k):
            x = cx - t; y = cy + round(4 * math.sin(t / 3 + k)) + t // 4
            put(c, x, y + 1, OUT); put(c, x, y, BRASS if t % 2 else 14); put(c, x, y - 1, OUT if t % 2 else 13)
            if t % 6 == 5: pts.append((x, y))
        for x, y in pts:  # Schichtmarken: kleine Messingscheiben
            for dx, dy, v in ((-1,1,OUT),(0,1,BRASS),(1,1,OUT),(-1,2,BRASS),(0,2,AMBER),(1,2,AMBER2),(-1,3,OUT),(0,3,BRASS),(1,3,OUT),(0,4,OUT)):
                put(c, x+dx, y+dy, v)
        frames[('phase2', 2 + k)] = c; desc[('phase2', 2 + k)] = f'phase2 {3+k}/6: schleudert die Kette, Schichtmarken klirren nach links ({10+6*k}px), Adern glimmen'
    # phase3: hört nie auf – Gestein hebt sich, Türkisadern brennen
    w = F(off={'body': (0, -1), 'head': (0, -2), 'arm_l': (0, -1), 'arm_r': (0, -1)}, lean_from=70)
    w = recolor(w, {29: 30, 28: 29})
    frames[('phase3', 0)] = w; frames[('phase3', 1)] = w.copy()
    desc[('phase3', 0)] = desc[('phase3', 1)] = 'phase3 1-2/6 (gehalten): richtet sich auf, Adern im Fels leuchten türkis'
    for k in range(4):
        c = F(off={'body': (0, -1 + (k % 2)), 'head': (0, -2 + (k % 2)), 'arm_l': (-1, k % 2), 'arm_r': (1, k % 2)}, lean_from=70)
        c = recolor(c, {29: 30, 28: 29, 30: 31} if k % 2 else {29: 30, 28: 29})
        for j, (x, y) in enumerate([(6, 60), (116, 52), (10, 40), (120, 74), (4, 80), (112, 34)]):
            chip(c, x, y - 4 * k - (j % 3), big=j % 2 == 0, cols=(9, 10))
        for j in range(4): put(c, X0 + 10 + 20 * j, 92 - k * 2 - j % 2, TQ2)
        frames[('phase3', 2 + k)] = c; desc[('phase3', 2 + k)] = f'phase3 {3+k}/6: Gestein hebt sich ringsum, Adern pulsieren – er hört nie auf'
    return frames, desc

BOSSES = {
    'weichenfresser': dict(fn=weichenfresser, template='enemy_schwellenhund', base='schwellenhund', fw=96, fh=96, rows=['idle', 'attack', 'hurt', 'defeated']),
    'bruchmeister': dict(fn=bruchmeister, template='enemy_vorhauer', base='vorhauer', fw=96, fh=96, rows=['idle', 'attack', 'hurt', 'defeated']),
    'schluchtrufer': dict(fn=schluchtrufer, template='enemy_vielrufer', base='vielrufer', fw=96, fh=96, rows=['idle', 'attack', 'hurt', 'defeated', 'phase2']),
    'tiefenvorarbeiter': dict(fn=tiefenvorarbeiter, template='enemy_unterschicht', base='unterschicht', fw=128, fh=96, rows=['idle', 'attack', 'hurt', 'defeated', 'phase1', 'phase2', 'phase3']),
}
