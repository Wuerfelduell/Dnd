"""Endgestalten (Codex DC1 Abschnitt 3): Kampf-Standbogen 576x576 (6x6, Raster der Vorlage hg_battle_<p>) und
Karten-Standbogen 128x192 (4x4, Raster der Vorlage hg_form_<p>). Jede Pose ist ein eigenes, aus dem Konzeptbild
umgesetztes Motiv; jeder Frame wird einzeln gesetzt (ganzzahliges Verschieben, Zeilen löschen/doppeln, Umfärben)
und bekommt eigene, ruhige Lichteffekte (Bernstein/Bein-Weiß, nie Türkis)."""
import math, json, pickle, hashlib
import numpy as np
from PIL import Image
import base
from base import RAW, ROOT, OUT, idx, outline, crop, motif, split_views, fg_height

T = -1
PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr']
A1, A2, A3 = idx('#f0ce80'), idx('#e8b860'), idx('#d0a050')
BONE, BONE2 = idx('#eee2c5'), idx('#e0c9a1')
PULSE = {A3: A2, A2: A1, BONE2: BONE, idx('#b3946e'): idx('#cfb18a')}
FILL = 0.87          # Effekte werden auf 87 % der Vorlagen-bbox bemessen (Pflicht: 85 %)
CACHE = Path = None

# ------------------------------------------------------------------ Hilfen
def _cache(key, fn):
    import os
    p = f'/tmp/s31c/{hashlib.md5(key.encode()).hexdigest()}.pkl'
    if os.path.exists(p): return pickle.load(open(p, 'rb'))
    v = fn(); pickle.dump(v, open(p, 'wb')); return v

def mot(name, f, box=None):
    src = RAW / name
    key = f'{name}|{f}|{box}|{src.stat().st_size}'
    return _cache(key, lambda: motif(src, f, box))

def bbox(a):
    ys, xs = np.where(a >= 0)
    return xs.min(), ys.min(), xs.max(), ys.max()

def tmpl_bbox(sheet, cs_w, cs_h, r, c):
    m = sheet[r*cs_h:(r+1)*cs_h, c*cs_w:(c+1)*cs_w] >= 0
    ys, xs = np.nonzero(m)
    return xs.min(), ys.min(), xs.max(), ys.max()

def load_template(path):
    """Vorlage als Maske-Array (>=0 = deckend), nur für Maße."""
    a = np.array(Image.open(path).convert('RGBA'))[..., 3] > 0
    return np.where(a, 0, -1)

def recolor(m, table):
    out = m.copy()
    for a, b in table.items(): out[m == a] = b
    return out

def bob(m, k=1, at=0.55):
    """Atmen: k Zeilen in Hüfthöhe löschen (Oberkörper sinkt) bzw. bei k<0 doppeln (hebt sich)."""
    H = m.shape[0]; y = int(H * at)
    if k > 0: return np.concatenate([m[:y], m[y + k:]])
    if k < 0: return np.concatenate([m[:y], np.repeat(m[y:y+1], -k, 0), m[y:]])
    return m

def lean(m, d, upto=0.4):
    """Oberkörper (obere Zeilen) um d px seitlich; Rest bleibt."""
    if d == 0: return m
    H, W = m.shape; y = int(H * upto)
    out = np.full((H, W + abs(d)), T, np.int32)
    off = max(0, -d)
    out[:, off:off + W] = m
    top = np.full((y, W + abs(d)), T, np.int32); top[:, off + d:off + d + W] = m[:y]
    out[:y] = top
    return outline(crop(out))

def squash(m, f, keep=0.40):
    """Kleinere Haltung: der obere Teil bleibt, der untere wird gestaucht (Zeilen gleichmäßig weg)."""
    H = m.shape[0]; top = int(H * keep); low = H - top
    nl = max(1, round(H * f) - top)
    rows = [m[top + min(low - 1, int((r + 0.5) * low / nl))] for r in range(nl)]
    return outline(crop(np.concatenate([m[:top], np.array(rows)])))

def stamp(c, m, x0, y0, behind=False):
    H, W = m.shape; sub = c[y0:y0+H, x0:x0+W]; op = m >= 0
    if behind: op &= sub < 0
    sub[op] = m[op]

class Cell:
    def __init__(self, w, h, m_lo, m_hi_x, m_hi_y):
        self.w, self.h = w, h; self.lo = m_lo; self.hx = m_hi_x; self.hy = m_hi_y
        self.c = np.full((h, w), T, np.int32)
    def put(self, x, y, v, over=False):
        if self.lo <= x <= self.hx and self.lo <= y <= self.hy and (over or self.c[y, x] < 0): self.c[y, x] = v

# ------------------------------------------------------------------ ruhige Effekte (nur hinter/neben die Figur)
def ellipse(cl, cx, cy, rx, ry, col=BONE, col2=A1, dotted=2, phase=0, a0=0.0, a1=2*math.pi):
    n = int(2 * math.pi * max(rx, ry) * 1.6) + 8; seen = set(); k = 0
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
        x = round(cx + rx * math.cos(a)); y = round(cy + ry * math.sin(a))
        if (x, y) in seen: continue
        seen.add((x, y)); k += 1
        if dotted and (k + phase) % dotted: continue
        cl.put(x, y, col if (k // dotted if dotted else k) % 3 else col2)

def floor_glow(cl, x0, x1, y, phase=0):
    """Bodenschein: zwei Zeilen gerastertes Licht unter den Füßen (hinter der Figur)."""
    for x in range(x0, x1 + 1):
        cl.put(x, y, A3 if (x + phase) % 2 else A2)
        if (x + y + phase) % 2 == 0 and x0 + 2 <= x <= x1 - 2: cl.put(x, y - 1, A3)

def motes(cl, pts, col=A1):
    for x, y in pts: cl.put(x, y, col)

def base_glow(cl, foot, phase=0, pad=5):
    """Gleichbleibender Bodenschein unter den Füßen (gehört zur hellen, ruhigen Endgestalt)."""
    ys, xs = np.where(cl.c[foot - 2:foot + 1] >= 0)
    floor_glow(cl, max(cl.lo, xs.min() - pad), min(cl.hx, xs.max() + pad), foot, phase)

def ensure_fill(cl, tw, th, foot, phase=0, log=None):
    """Pflichtregel 85 %: reicht die bbox (Figur+Effekte) nicht an FILL x Vorlage heran, ergänzt ein ruhiger Bodenschein
    die Breite und ein Lichtbogen über dem Kopf die Höhe. Gibt zurück, was ergänzt wurde."""
    added = []
    x0, y0, x1, y1 = bbox(cl.c)
    need_w = math.ceil(FILL * tw); need_h = math.ceil(FILL * th)
    if x1 - x0 + 1 < need_w:
        cx = (x0 + x1) // 2; a = cx - need_w // 2; b = a + need_w - 1
        if a < cl.lo: b += cl.lo - a; a = cl.lo
        if b > cl.hx: a -= b - cl.hx; b = cl.hx
        floor_glow(cl, a, b, foot, phase); added.append('Bodenschein')
    x0, y0, x1, y1 = bbox(cl.c)
    if y1 - y0 + 1 < need_h:
        top = max(cl.lo, y1 - need_h + 1)
        ys, xs = np.where(cl.c[y0:y0 + 6] >= 0); hx = int(np.median(xs))
        ry = y0 - top + 2; rx = 7
        ellipse(cl, hx, top + ry, rx, ry, col=A2, col2=A1, dotted=2, phase=phase, a0=math.pi * 1.05, a1=math.pi * 1.95)
        cl.put(hx, top, A1)
        added.append('Lichtbogen über dem Kopf')
    return added

# ------------------------------------------------------------------ Kampf-Standbogen
BS = 96; BFOOT = 93; BM = 2
BF = {'laterne': 10, 'faden': 11, 'maske': 10, 'echo': 10, 'kessel': 10, 'eisen': 10, 'schluessel': 11,
      'sq_waage': 10, 'sq_moor': 11, 'sq_uhr': 10}
HUMAN_F = 11

def bcell(): return Cell(BS, BS, BM, BS - 1 - BM, BFOOT)

def bplace(cl, m, cx):
    H, W = m.shape
    x0 = cx - W // 2; x0 = min(max(x0, BM), BS - BM - W); y0 = BFOOT - H + 1
    if y0 < BM: raise ValueError(f'zu hoch: {H}')
    if W > BS - 2 * BM: raise ValueError(f'zu breit: {W}')
    stamp(cl.c, m, x0, y0)
    return x0, y0

def battle_sheet(p, tmpl):
    idle = mot(f'{p}_kampf_idle.jpg', BF[p]); a1 = mot(f'{p}_kampf_attack1.jpg', BF[p]); a2 = mot(f'{p}_kampf_attack2.jpg', BF[p])
    human = mot('mensch_kampf_schliessen.jpg', HUMAN_F)
    for nm, m in (('idle', idle), ('attack1', a1), ('attack2', a2)):
        if m.shape[0] > BFOOT - BM: raise ValueError(f'{p} {nm} zu hoch {m.shape}')
    tb = {(r, c): tmpl_bbox(tmpl, BS, BS, r, c) for r in range(6) for c in range(6)}
    tx0, _, tx1, _ = tb[(0, 0)]; cx = (tx0 + tx1 + 1) // 2
    F, D, FX = {}, {}, {}
    def done(r, c, cl, text, extra=()):
        x0, y0, x1, y1 = tb[(r, c)]
        ph = 1 if (r in (1, 2) and c == 2) else c          # Haltepaar 7/8 und 13/14: gleicher Bodenschein -> pixelgleich
        base_glow(cl, BFOOT, ph)
        if r in (1, 2) and c in (1, 2):
            # beide Haltframes auf dieselbe Ziel-bbox bemessen (die größere der beiden Vorlagen-Frames)
            b1, b2 = tb[(r, 1)], tb[(r, 2)]
            x0, y0, x1, y1 = (0, 0, max(b1[2] - b1[0], b2[2] - b2[0]), max(b1[3] - b1[1], b2[3] - b2[1]))
        add = list(extra) + ensure_fill(cl, x1 - x0 + 1, y1 - y0 + 1, BFOOT, phase=ph)
        F[(r, c)] = cl.c; D[(r, c)] = text; FX[(r, c)] = add
    # --- idle: Atem (Hüftzeile), Lichtpuls, 1px Neigung; alle 6 verschieden
    IDLE = [(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0), (0, 0, 1), (1, 0, 1)]
    TXT = {0: 'steht ruhig', 1: 'atmet aus (Oberkörper 1px tiefer)'}
    for c, (b, pu, le) in enumerate(IDLE):
        m = lean(bob(idle, b), le) if le else bob(idle, b)
        if pu: m = recolor(m, PULSE)
        cl = bcell(); bplace(cl, m, cx)
        done(0, c, cl, f'idle {c+1}/6: {TXT[b]}' + (', Licht hellt ruhig auf' if pu else '') + (', Kopf 1px vorgeneigt' if le else ''))
    # --- attack1 = abwehrende offene Hand (ruhige Geste, kein Angriff); Halteframes 7/8 identisch
    seq = [('idle', 0, None), ('a1', 0, None), ('a1', 0, None), ('a1', 0, 'shield'), ('a1', 1, 'fade'), ('idle', 1, None)]
    for c, (pose, b, fx) in enumerate(seq):
        m = bob(a1 if pose == 'a1' else idle, b)
        if pose == 'idle' and c == 0: m = bob(idle, -1)                       # holt Luft (1px höher)
        if pose == 'idle' and c == 5: m = recolor(bob(idle, -1), PULSE)       # zurück, Licht hell
        cl = bcell(); x0, y0 = bplace(cl, m, cx)
        ex = []
        if fx:
            # Lichtschild vor der offenen Hand: senkrechter Bogen rechts, bemessen auf die Vorlage
            X0, Y0, X1, Y1 = tb[(1, c)]; fx0, fy0, fx1, fy1 = bbox(cl.c)
            right = max(fx1 + 3, fx0 + math.ceil(FILL * (X1 - X0 + 1)) - 1); right = min(right, BS - 1 - BM)
            ry = max(10, (fy1 - fy0) // 3)
            ellipse(cl, right - 5, (fy0 + fy1) // 2 - 6, 5, ry, col=BONE if fx == 'shield' else A2, col2=A1,
                    dotted=1 if fx == 'shield' else 2, a0=-math.pi / 2, a1=math.pi / 2)
            ex.append('Lichtschild vor der Hand' + (' (verblasst, gerastert)' if fx == 'fade' else ''))
        txt = {0: 'Ruhe, holt Luft (1px höher)', 1: 'hebt die offene Hand (Halteframe)', 2: 'hält die offene Hand (Halteframe)',
               3: 'abwehrende Hand, ruhiger Lichtschild', 4: 'Schild verblasst', 5: 'zurück in die Ruhe, Licht hell'}[c]
        done(1, c, cl, f'attack1 {c+1}/6: {txt}', ex)
    # --- attack2 = Darreichen (beide Handflächen nach oben); Halteframes 13/14 identisch
    seq = [('idle', 1, 0), ('a2', 0, 0), ('a2', 0, 0), ('a2', 0, 1), ('a2', 1, 2), ('idle', 0, 3)]
    for c, (pose, b, st) in enumerate(seq):
        m = bob(a2 if pose == 'a2' else idle, b)
        if pose == 'idle' and c == 0: m = lean(bob(idle, -1), 1)
        if pose == 'idle' and c == 5: m = recolor(lean(idle, 1), PULSE)
        cl = bcell(); bplace(cl, m, cx); ex = []
        if st in (1, 2):
            fx0, fy0, fx1, fy1 = bbox(cl.c)
            hx = fx0 + int((fx1 - fx0) * 0.72); hy = fy0 + int((fy1 - fy0) * 0.45)
            rise = 6 * st
            motes(cl, [(hx, hy - 3 - rise), (hx + 3, hy - 6 - rise), (hx - 2, hy - 9 - rise), (hx + 1, hy - 12 - rise)],
                  col=A1 if st == 1 else A2)
            ex.append('Lichtfunken steigen aus den Handflächen')
        txt = {0: 'Ruhe, holt Luft, Kopf 1px vor', 1: 'öffnet beide Hände (Halteframe)', 2: 'hält die Hände offen (Halteframe)',
               3: 'bietet dar, Funken steigen', 4: 'Funken höher, Atem', 5: 'zurück, Licht hell'}[c]
        done(2, c, cl, f'attack2 {c+1}/6: {txt}', ex)
    # --- special „Schließen“: zwei Frames schlichter Mensch, dann wieder die Gestalt
    X0, Y0, X1, Y1 = max(tb[(3, c)] for c in range(6))
    sw = max(tb[(3, c)][2] - tb[(3, c)][0] + 1 for c in range(6)); sh = max(tb[(3, c)][3] - tb[(3, c)][1] + 1 for c in range(6))
    for c in range(6):
        cl = bcell()
        if c in (2, 3):
            hm = human if c == 2 else bob(human, 1)
            bplace(cl, hm, cx)
        else:
            m = idle if c != 4 else bob(idle, 1)
            if c == 5: m = recolor(m, PULSE)
            bplace(cl, m, cx)
        fx0, fy0, fx1, fy1 = bbox(cl.c)
        tw = tb[(3, c)][2] - tb[(3, c)][0] + 1; th = tb[(3, c)][3] - tb[(3, c)][1] + 1
        rx = max((fx1 - fx0) / 2 + 3, FILL * tw / 2 + 0.5); ry = max((BFOOT - BM) / 2, FILL * th / 2 + 0.5)
        ecx = (fx0 + fx1) / 2; ecy = BFOOT - ry
        ecx = min(max(ecx, BM + rx), BS - 1 - BM - rx)
        ex = []
        if c == 0:
            # Naht: senkrechte Lichtlinie durch die Gestalt + oberer Ringbogen
            mid = (fx0 + fx1) // 2
            for y in range(fy0 + 2, fy1 - 1):
                if cl.c[y, mid] >= 0 and cl.c[y, mid] != OUT: cl.c[y, mid] = A1 if y % 3 else BONE
            ellipse(cl, ecx, ecy, rx, ry, col=A2, dotted=2, a0=math.pi * 1.15, a1=math.pi * 1.85)
            ex += ['Naht aus Licht öffnet sich', 'oberer Ringbogen']
            txt = 'Schließen 1/6: Naht aus Licht läuft durch die Gestalt'
        elif c == 1:
            ellipse(cl, ecx, ecy, rx, ry, col=BONE, col2=A1, dotted=1); ex.append('geschlossener Lichtring')
            txt = 'Schließen 2/6: Ring schließt sich um die Gestalt'
        elif c in (2, 3):
            ellipse(cl, ecx, ecy, rx, ry, col=BONE, col2=BONE2, dotted=2, phase=c); ex.append('gepunkteter Ring (Bein-Weiß)')
            txt = f'Schließen {c+1}/6: schlichter Mensch im Ring' + (' (atmet)' if c == 3 else '')
        elif c == 4:
            ellipse(cl, ecx, ecy, max((fx1 - fx0) / 2 + 2, FILL * tw / 2 + 0.5), ry, col=A2, col2=A1, dotted=2, phase=1)
            ex.append('Ring zieht sich zusammen'); txt = 'Schließen 5/6: die Gestalt kehrt zurück'
        else:
            motes(cl, [(fx0 - 2, fy0 + 10), (fx1 + 2, fy0 + 20), (fx0 + 4, fy0 - 2), (fx1 - 3, fy0 + 4)], col=A2)
            ex.append('letzte Lichtfunken'); txt = 'Schließen 6/6: Gestalt, ruhig, Licht hell'
        done(3, c, cl, txt, ex)
    # --- hurt: Idle mit kleinerer Haltung + ruhige Wellenbögen
    HURT = [2, 5, 7, 5, 3, 1]          # Pixelzeilen kleiner als idle
    for c, dpx in enumerate(HURT):
        f = (idle.shape[0] - dpx) / idle.shape[0]
        m = squash(idle, f)
        if c in (1, 2): m = lean(m, -1)
        cl = bcell(); bplace(cl, m, cx); ex = []
        if c in (1, 2, 3):
            fx0, fy0, fx1, fy1 = bbox(cl.c); cy = (fy0 + fy1) // 2 - 8
            for k, r in enumerate((6, 11) if c != 3 else (9,)):
                ellipse(cl, fx1 - 2, cy, r, r * 2, col=A2 if k else BONE2, dotted=2, phase=c, a0=-math.pi / 3, a1=math.pi / 3)
            ex.append('Wellenbögen (ruhig, kein Sturm)')
        done(4, c, cl, f'hurt {c+1}/6: kleinere Haltung ({round(f*100)} % Höhe)' + (', weicht 1px zurück' if c in (1, 2) else ''), ex)
    # --- defeated: Idle sinkt zunehmend in sich (nicht kniender Mensch wie in der Vorlage, sondern ruhige Gestalt)
    DEF = [0.95, 0.91, 0.87, 0.83, 0.80, 0.78]
    for c, f in enumerate(DEF):
        m = squash(idle, f, keep=0.35)
        if c >= 3: m = recolor(m, {A1: A2, A2: A3, BONE: BONE2})
        cl = bcell(); bplace(cl, m, cx)
        done(5, c, cl, f'defeated {c+1}/6: Haltung sinkt ({round(f*100)} % Höhe)' + (', Licht gedämpft' if c >= 3 else ''))
    sheet = np.full((BS * 6, BS * 6), T, np.int32)
    for (r, c), cell in F.items(): sheet[r*BS:(r+1)*BS, c*BS:(c+1)*BS] = cell
    return sheet, D, FX

# ------------------------------------------------------------------ Karten-Standbogen
MW, MH, MFOOT, MM = 32, 48, 46, 2

def map_views(p):
    path = RAW / f'{p}_karte_ansichten.jpg'
    boxes = split_views(path, 3)
    hs = [fg_height(path, b)[0] for b in boxes]
    for f in range(max(6, int(max(hs) / 45)), 60):
        vs = [mot(f'{p}_karte_ansichten.jpg', f, b) for b in boxes]
        if max(v.shape[0] for v in vs) <= 44 and max(v.shape[1] for v in vs) <= MW - 2 * MM:
            return dict(zip(('down', 'left', 'up'), vs)), f
    raise ValueError(p)

def lift_leg(m, side, legs):
    """Ein Bein (linke oder rechte Hälfte des Beinbereichs) 1px anheben."""
    H, W = m.shape; out = m.copy(); mid = W // 2
    cols = slice(0, mid) if side == 0 else slice(mid, W)
    seg = m[legs:, cols]
    out[legs:, cols] = T
    tgt = out[legs - 1:H - 1, cols]; op = seg >= 0; tgt[op] = seg[op]
    return outline(out)

def map_sheet(p, tmpl):
    views, f = map_views(p)
    sheet = np.full((MH * 4, MW * 4), T, np.int32); D = {}; FX = {}
    for r, name in enumerate(('down', 'left', 'right', 'up')):
        m = views['left'][:, ::-1] if name == 'right' else views[name]
        H = m.shape[0]; legs = int(H * 0.78)
        side = name in ('left', 'right')
        fr = [m,
              lift_leg(bob(m, -1, 0.5), 0, legs + 1),
              bob(m, 1, 0.5),
              lift_leg(bob(m, -1, 0.5), 1, legs + 1)]
        if name == 'right': fr[1], fr[3] = fr[3], fr[1]
        tx0, _, tx1, _ = tmpl_bbox(tmpl, MW, MH, r, 0); cx = (tx0 + tx1 + 1) // 2
        txt = ['steht (Kontakt)', 'Schritt: ein Bein 1px gehoben, Körper 1px höher', 'Durchgang: Körper 1px tiefer',
               'Schritt: anderes Bein 1px gehoben, Körper 1px höher']
        cells = []
        for c, fm in enumerate(fr):
            D[(r, c)] = f'walk_{name} {c+1}/4: {txt[c]}' + (' (Spiegel der Seitenansicht)' if name == 'right' else '')
            if side and c in (1, 3): fm = lean(fm, 1 if name == 'right' else -1, upto=0.35)
            fm = crop(fm)
            cl = Cell(MW, MH, MM, MW - 1 - MM, MFOOT)
            Hh, Ww = fm.shape; x0 = min(max(cx - Ww // 2, MM), MW - MM - Ww); y0 = MFOOT - Hh + 1
            if y0 < MM: raise ValueError(f'{p} map zu hoch {fm.shape}')
            stamp(cl.c, fm, x0, y0)
            cells.append(cl)
        # Bodenschein nur, wenn die Breite sonst unter 85 % der Vorlage bliebe – dann aber in allen 4 Frames der Reihe gleich breit
        need = 0
        for c, cl in enumerate(cells):
            X0, Y0, X1, Y1 = tmpl_bbox(tmpl, MW, MH, r, c); a0, _, a1, _ = bbox(cl.c)
            if a1 - a0 + 1 < math.ceil(FILL * (X1 - X0 + 1)): need = max(need, math.ceil(FILL * (X1 - X0 + 1)))
        # Lichtbogen über dem Kopf ebenso: nur wenn die Höhe sonst nicht reicht, dann in allen 4 Frames bis zur selben Zeile
        top_abs = None
        for c, cl in enumerate(cells):
            X0, Y0, X1, Y1 = tmpl_bbox(tmpl, MW, MH, r, c); a0, b0, a1, b1 = bbox(cl.c)
            nh = math.ceil(FILL * (Y1 - Y0 + 1))
            if b1 - b0 + 1 < nh: top_abs = min(top_abs if top_abs is not None else 99, b1 - nh + 1)
        if top_abs is not None:
            top_abs = max(MM, top_abs)
            for c, cl in enumerate(cells):
                a0, b0, a1, b1 = bbox(cl.c)
                ys, xs = np.where(cl.c[b0:b0 + 4] >= 0); hx = int(np.median(xs))
                ry = b0 - top_abs + 1
                ellipse(cl, hx, top_abs + ry, 5, ry, col=A2, col2=A1, dotted=2, phase=c, a0=math.pi * 1.05, a1=math.pi * 1.95)
                cl.put(hx, top_abs, A1)
        for c, cl in enumerate(cells):
            X0, Y0, X1, Y1 = tmpl_bbox(tmpl, MW, MH, r, c)
            if need:
                a = cx - need // 2; b = a + need - 1
                if a < MM: b += MM - a; a = MM
                if b > MW - 1 - MM: a -= b - (MW - 1 - MM); b = MW - 1 - MM
                floor_glow(cl, a, b, MFOOT, c)
            FX[(r, c)] = (['Bodenschein (ganze Reihe)'] if need else []) + (['Lichtbogen über dem Kopf (ganze Reihe)'] if top_abs is not None else []) + ensure_fill(cl, X1 - X0 + 1, Y1 - Y0 + 1, MFOOT, phase=c)
            sheet[r*MH:(r+1)*MH, c*MW:(c+1)*MW] = cl.c
    return sheet, D, FX, f
