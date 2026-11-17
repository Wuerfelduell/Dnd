"""Batch pfadbeyonder: Posen je Figur. Jede Pose ist ein eigenes Motiv (eigenes Konzeptbild je Kampfpose bzw. je Ansicht),
Animationsframes werden einzeln per Skript gesetzt (Teil-Versatz, Neigung, Stauchung, Effekte)."""
import numpy as np
import base
from base import idx, OUT
from rig import Rig, blank, put, clod, sparks, stars, tendril, gear, ghost, recolor, outline, TQ, TQ2, TQD, BRASS, BRASS2, IRON2

CODE = {chr(65 + i) if i < 26 else chr(97 + i - 26): i for i in range(len(base.PAL_HEX))}
def paint(a, rows, y0=0, x0=0):
    """Handretusche: Zeichenraster (Buchstabe = Palettenindex wie CODE, '.' = transparent, ' ' = unverändert)."""
    a = a.copy()
    for dy, row in enumerate(rows):
        for dx, ch in enumerate(row):
            y, x = y0 + dy, x0 + dx
            if ch == ' ' or not (0 <= y < a.shape[0] and 0 <= x < a.shape[1]): continue
            a[y, x] = -1 if ch == '.' else CODE[ch]
    return a
def dots(a, pts):
    a = a.copy()
    for x, y, h in pts:
        if 0 <= y < a.shape[0] and 0 <= x < a.shape[1] and a[y, x] >= 0: a[y, x] = idx(h)
    return a

EYE, MOUTH, BR, LENS = '#3d414a', '#715648', '#b3946e', '#4e7484'
RETOUCH = {
    'torfmutter_walk_down': lambda a: paint(a, ['             ', '....dEEEd    ', '...dDEEEDd   ', '...dDXXXDd   ', '...dXNXNXd   ', '...dDXXXDd   '], 0, 1),
    'torfmutter_walk_left': lambda a: paint(a, ['    ddd       ', '   dEEEEd     ', '  dXXDEEDd    ', '  dNXDEEd     ', '  dXXXDEd     '], 0, 2),
    'schleusenuhr_walk_down': lambda a: paint(a, ['..dbbd....', '.dbbbbd...', '.deAAed...', '.dXXXXd...', '..dXXd....'], 0, 0),
    'schleusenuhr_walk_left': lambda a: paint(a, ['.ddd..', 'dbbbd.', 'deXbd.', 'dXXbd.', '.dXXd.'], 0, 0),
    'torfmutter_head': lambda a: dots(a, [(9, 9, EYE), (12, 9, EYE), (9, 8, '#8a8e96'), (12, 8, '#8a8e96'), (10, 12, MOUTH), (11, 12, MOUTH),
                                          (7, 1, BR), (6, 0, BR), (15, 1, BR), (16, 0, BR)]),
    'schleusenuhr_head': lambda a: dots(a, [(1, 7, BR), (2, 7, BR), (3, 7, BR), (1, 9, BR), (2, 9, BR), (3, 9, BR), (1, 8, BR), (3, 8, BR), (2, 8, LENS),
                                            (6, 7, BR), (7, 7, BR), (8, 7, BR), (6, 9, BR), (7, 9, BR), (8, 9, BR), (6, 8, BR), (8, 8, BR), (7, 8, LENS),
                                            (4, 8, BR), (5, 8, BR), (4, 12, MOUTH), (5, 12, MOUTH)]),
    'torfmutter_idle': lambda a: dots(a, [(10, 7, EYE), (10, 10, MOUTH)]),
    'schleusenuhr_idle': lambda a: dots(a, [(3, 3, BR), (4, 3, LENS), (5, 3, BR)]),
}

# ---------------------------------------------------------------- Laufsheet 64x128
def walk_sheet(views):
    """views: {'down','left','up'} -> Motiv. Reihen unten, links, rechts (Spiegel von links), oben; je 4 Frames; Fußlinie y=30."""
    sheet = np.full((128, 64), -1, np.int32); desc = {}
    order = [('down', views['down'], False), ('left', views['left'], False), ('right', views['left'], True), ('up', views['up'], False)]
    for r, (name, m, mirror) in enumerate(order):
        if mirror: m = m[:, ::-1]
        H, W = m.shape; legs = H - 5; mid = W // 2
        side = name in ('left', 'right')
        rig = Rig(m, [('leg_a', lambda y, x: (y >= legs) & (x < mid)), ('leg_b', lambda y, x: (y >= legs) & (x >= mid)),
                      ('top', lambda y, x: y < legs)])
        x0 = (16 - W) // 2 + (1 if W % 2 and W < 15 else 0)
        poses = [dict(), dict(off={'top': (0, -1), 'leg_a': ((-1 if side else 0), -1)}),
                 dict(off={'top': (0, 0), 'leg_b': ((1 if side else 0), 0), 'leg_a': ((1 if side else 0), 0)}),
                 dict(off={'top': (0, -1), 'leg_b': ((1 if side else 0), -1)})]
        if name == 'right':
            poses[1], poses[3] = poses[3], poses[1]
        texts = ['steht (Kontakt)', 'Schritt, linkes Bein gehoben, Körper 1px hoch', 'Durchgang, Saum/Beine 1px versetzt', 'Schritt, rechtes Bein gehoben, Körper 1px hoch']
        for i, p in enumerate(poses):
            c = rig.frame(16, 32, x0, 30, **p)
            if (c[:, 0] >= 0).any() or (c[:, 15] >= 0).any():
                # zu breit für 1px Rand: Beinversatz nur vertikal (Seitenansicht der Torfmutter mit Röcken ist 13px breit)
                p = dict(off={k: (0, v[1]) for k, v in p.get('off', {}).items()})
                c = rig.frame(16, 32, x0, 30, **p)
                texts_i = texts[i] + ', Beine nur vertikal versetzt (Zellbreite)'
            else:
                texts_i = texts[i]
            sheet[r*32:(r+1)*32, i*16:(i+1)*16] = c
            desc[(name, i)] = f'walk_{name} {i+1}/4: {texts_i}' + (' (gespiegelte Seitenansicht)' if mirror else '')
    return sheet, desc

# ---------------------------------------------------------------- Kopf 24x24
def head(m):
    H, W = m.shape
    m = m[max(0, H - 22):, max(0, (W - 22) // 2):max(0, (W - 22) // 2) + 22]
    H, W = m.shape; cell = np.full((24, 24), -1, np.int32)
    cell[23 - H:23, (24 - W) // 2:(24 - W) // 2 + W] = m
    return cell

# ---------------------------------------------------------------- Kampfblatt 288x240
FOOT = 46
def place(m, cx=24, **kw):
    """Motiv so setzen, dass die Fußmitte (unterste 6 Zeilen) bei cx liegt."""
    rig = Rig(m, [('upper', lambda y, x: y < m.shape[0] - 14)])
    ys, xs = np.where(m[-6:] >= 0)
    x0 = cx - int(np.median(xs))
    return rig.frame(48, 48, x0, FOOT, lean_from=m.shape[0] - 14, **kw), rig

def leftmost(c, y0, y1):
    ys, xs = np.where(c[y0:y1] >= 0)
    if not len(xs): return None
    i = xs.argmin(); return xs[i], ys[i] + y0

def battle_sheet(fig, P):
    """P: Posen-Motive idle/attack1/strike/attack2. Raster wie enemy_ez_ds_kalkbrennerin: idle 4, attack 6, special 6, hurt 3, defeated 4."""
    F = {}; D = {}
    idle = P['idle']
    for i, b in enumerate([0, 1, 1, 0]):
        c, _ = place(idle, off={'upper': (0, b)}, **({'lean': 1} if i == 2 else {}))
        F[(0, i)] = c; D[(0, i)] = f'idle {i+1}/4: ruhiger Stand, Atem hebt/senkt den Oberkörper ({b}px)' + (', Kopf/Schultern 1px nach hinten geneigt' if i == 2 else '')
    # die beiden Ruhe-Frames 0/3 sollen sich unterscheiden: Frame 3 mit 1px Gewichtsverlagerung
    F[(0, 3)], _ = place(idle, off={'upper': (-1, 0)}); D[(0, 3)] = 'idle 4/4: Gewicht leicht nach vorn verlagert (1px)'
    # attack (attack1)
    F[(1, 0)], _ = place(idle, lean=2, off={'upper': (1, -1)}); D[(1, 0)] = 'attack1 1/6: Ansatz, lehnt sich zurück'
    w, _ = place(P['attack1']); F[(1, 1)] = w; F[(1, 2)] = w.copy()
    s3, _ = place(P['strike'], cx=27)
    s4, _ = place(P['strike'], cx=26, off={'upper': (-1, 1)})
    F[(1, 5)], _ = place(idle, lean=-1)
    if fig == 'torfmutter':
        D[(1, 1)] = D[(1, 2)] = 'attack1 2-3/6 (Ausholpose gehalten): Torfspaten hoch über der Schulter'
        D[(1, 3)] = 'attack1 4/6: Spatenhieb nach vorn unten'
        p = leftmost(s4, 30, 47)
        for k, (dx, dy) in enumerate([(-1, -4), (2, -7), (-2, -9), (4, -3), (1, -11)]):
            if p: clod(s4, p[0] + dx + 1, p[1] + dy, big=k < 2)
        D[(1, 4)] = 'attack1 5/6: Torfbrocken spritzen vom Spatenblatt'
    else:
        D[(1, 1)] = D[(1, 2)] = 'attack1 2-3/6 (Ausholpose gehalten): Schleusenschlüssel wie eine Keule über der Schulter'
        D[(1, 3)] = 'attack1 4/6: Schlüsselschlag nach vorn unten'
        p = leftmost(s4, 24, 47)
        if p: sparks(s4, p[0] + 1, p[1], 41, 7)
        D[(1, 4)] = 'attack1 5/6: Messingfunken am Schlüsselbart'
    F[(1, 3)] = s3; F[(1, 4)] = s4; D[(1, 5)] = 'attack1 6/6: zurück in den Stand'
    # special (attack2)
    a2 = P['attack2']
    F[(2, 0)], _ = place(a2, lean=1, off={'upper': (1, -1)})
    w, _ = place(a2); F[(2, 1)] = w; F[(2, 2)] = w.copy()
    if fig == 'torfmutter':
        D[(2, 0)] = 'attack2 1/6: rammt den Spaten in den Boden'
        D[(2, 1)] = D[(2, 2)] = 'attack2 2-3/6 (gehalten): Hand über dem Moor, ruft'
        for k, hs in enumerate([[3, 2, 0], [8, 6, 4], [13, 10, 8]]):
            c, _ = place(a2, off={'upper': (0, 1 if k == 1 else 0)})
            for j, (x, h) in enumerate(zip([4, 9, 14], hs)):
                if h: tendril(c, x, FOOT, h, 1.2 if j % 2 else -1.2, 60 + j)
            if k == 2:
                for x, y in [(6, 30), (12, 28)]: clod(c, x, y)
            F[(2, 3 + k)] = c
            D[(2, 3 + k)] = f'attack2 {4+k}/6: Torfranken greifen aus dem Boden (Höhe bis {max(hs)}px, türkise Spitzen)'
    else:
        D[(2, 0)] = 'attack2 1/6: hebt das Zahnrad'
        D[(2, 1)] = D[(2, 2)] = 'attack2 2-3/6 (gehalten): Zahnrad zwischen den Fingern, Blick durch die Lupe'
        base_c, _ = place(a2); p = leftmost(base_c, 4, 26)
        hx, hy = (p if p else (6, 14))
        c = base_c.copy(); gear(c, hx + 1, hy - 3, 2, 0); F[(2, 3)] = c
        D[(2, 3)] = 'attack2 4/6: türkiser Zahnradkreis löst sich von der Hand'
        c, _ = place(a2, off={'upper': (-1, 0)}); ghost(c, c.copy(), -4); gear(c, max(5, hx - 2), hy - 3, 4, 22); F[(2, 4)] = c
        D[(2, 4)] = 'attack2 5/6: Zeitstoß – Bild kurz doppelt (versetzte türkise Kopie), Zahnrad wächst'
        c, _ = place(a2); g = c.copy(); ghost(c, g, -2); ghost(c, g, 3); gear(c, max(6, hx - 4), hy - 4, 5, 45, col=TQ2, inner=TQD); F[(2, 5)] = c
        D[(2, 5)] = 'attack2 6/6: Nachbild zittert beidseitig, Zahnrad verblasst'
    # hurt
    for i, (dx, l) in enumerate([(2, 3), (1, 2), (0, 1)]):
        c, _ = place(idle, cx=24 + dx, lean=l, off={'upper': (1, 0)})
        if i < 2:
            ys, xs = np.where(c >= 0); stars(c, xs.min() + 3, ys.min() + 2, 80 + i)
        F[(3, i)] = c; D[(3, i)] = f'hurt {i+1}/3: getroffen, weicht {dx}px zurück' + (', Funken am Kopf' if i < 2 else '')
    # defeated
    for i, (sq, l) in enumerate([(0.85, 2), (0.6, 4), (0.4, 6), (0.25, 7)]):
        H = idle.shape[0]
        rig = Rig(idle, [('upper', lambda y, x: y < H - 14)])
        ys, xs = np.where(idle[-6:] >= 0); x0 = 24 - int(np.median(xs))
        c = rig.frame(48, 48, x0, FOOT, squash=sq, squash_from=H - 18, lean=-l, lean_from=H - 18)
        F[(4, i)] = c; D[(4, i)] = f'defeated {i+1}/4: sinkt erschöpft auf die Knie (Beinhöhe {int(sq*100)}%), vornübergebeugt'
    sheet = np.full((240, 288), -1, np.int32)
    for (r, i), c in F.items(): sheet[r*48:(r+1)*48, i*48:(i+1)*48] = c
    names = ['idle', 'attack', 'special', 'hurt', 'defeated']
    return sheet, {(names[r], i): d for (r, i), d in D.items()}
