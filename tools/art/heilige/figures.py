"""Heilige der Höfe (Seq 3): Kampfblatt 576x576, 96x96, 6x6 – Raster/Reihen exakt wie battle/hg_battle_<pfad>.png.
Je Pfad sieben Konzeptbilder (idle, attack1 = Ausholen, strike = Lichtklinge, attack2 = Lichtkette, special = brennender Segen,
hurt, defeated), jedes einzeln ins Raster umgesetzt (base.motif: ganzzahliger Blockfaktor, Palette, Umriss). Jeder Frame wird
einzeln gesetzt: Pose + ganzzahlige Variante (Atemzeile löschen/doppeln, 1-2px Neigung, Lichtpuls durch Umfärben).
KEINE Füllmittel (kein Bodenschein, keine Lichtbögen, keine prozeduralen Muster): Breite/Höhe kommen nur aus der Figur.
Auswahl je Frame: erste Kandidat-Pose, deren Kern-Box (3x3-Öffnen, größte Komponente) >= 85 % der Vorlagen-Kern-Box
im selben Frame ist (Breite UND Höhe). Konzepte schauen nach rechts wie die Vorlage; das Blatt wird zellweise gespiegelt
(facing 'left', Gegner schauen zum Spieler)."""
import math, pickle, hashlib, os
import numpy as np
from PIL import Image
import base
from base import RAW, OUT, idx, outline, crop, motif, fg_height

T = -1
PATHS = ['laterne', 'faden', 'maske', 'echo', 'kessel', 'eisen', 'schluessel', 'sq_waage', 'sq_moor', 'sq_uhr']
POSES = ['idle', 'attack1', 'strike', 'attack2', 'special', 'hurt', 'defeated']
CW = CH = 96; FOOT = 93; M = 2; MAXW = CW - 2 * M; MAXH = FOOT - M + 1
FILL = 0.85
A1, A2, A3 = idx('#f0ce80'), idx('#e8b860'), idx('#d0a050')
BONE, BONE2 = idx('#eee2c5'), idx('#e0c9a1')
PULSE = {A3: A2, A2: A1, BONE2: BONE, idx('#b3946e'): idx('#cfb18a')}
os.makedirs('/tmp/hlc', exist_ok=True)

def core(m):
    """Kern = Figur ohne dünne Effekte: binäres Öffnen 3x3, größte Komponente (gleich für Vorlage und neu)."""
    from scipy import ndimage
    o = ndimage.binary_opening(m, np.ones((3, 3)))
    lab, n = ndimage.label(o)
    if n == 0: return m
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return lab == (int(np.argmax(sizes)) + 1)

def wh(m):
    ys, xs = np.nonzero(m)
    if not len(xs): return 0, 0
    return int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)

def template_cores(path):
    a = np.array(Image.open(path).convert('RGBA'))[..., 3] > 0
    return {(r, c): wh(core(a[r*CH:(r+1)*CH, c*CW:(c+1)*CW])) for r in range(6) for c in range(6)}

def _cache(key, fn):
    p = f'/tmp/hlc/{hashlib.md5(key.encode()).hexdigest()}.pkl'
    if os.path.exists(p): return pickle.load(open(p, 'rb'))
    v = fn(); pickle.dump(v, open(p, 'wb')); return v

def mot(p, pose, f):
    src = RAW / f'{p}_kampf_{pose}.jpg'
    return _cache(f'{p}|{pose}|{f}|{src.stat().st_size}', lambda: (base.set_path(p), motif(src, f))[1])

def fit(p, pose, fmin):
    """kleinster ganzzahliger Faktor >= fmin, bei dem das Motiv ins Feld passt (größtmögliche Figur)."""
    h, w = fg_height(RAW / f'{p}_kampf_{pose}.jpg')
    f = max(fmin, math.ceil(max(h, w) / (MAXW + 2)))
    while True:
        m = mot(p, pose, f)
        if m.shape[0] <= MAXH and m.shape[1] <= MAXW: return f, m
        f += 1

def recolor(m, table):
    out = m.copy()
    for a, b in table.items(): out[m == a] = b
    return out

def bob(m, k, at=0.55):
    H = m.shape[0]; y = int(H * at)
    if k > 0: return np.concatenate([m[:y], m[y + k:]])
    if k < 0: return np.concatenate([m[:y], np.repeat(m[y:y+1], -k, 0), m[y:]])
    return m

def lean(m, d, upto=0.4):
    if d == 0: return m
    H, W = m.shape; y = int(H * upto)
    out = np.full((H, W + abs(d)), T, np.int32); off = max(0, -d)
    out[:, off:off + W] = m
    top = np.full((y, W + abs(d)), T, np.int32); top[:, off + d:off + d + W] = m[:y]
    out[:y] = top
    return outline(crop(out))

VARIANTS = {
    'base': lambda m: m, 'up1': lambda m: bob(m, -1), 'up2': lambda m: bob(m, -2), 'down1': lambda m: bob(m, 1),
    'down2': lambda m: bob(m, 2), 'leanR': lambda m: lean(m, 1), 'leanL': lambda m: lean(m, -1),
    'leanR2': lambda m: lean(m, 2), 'leanL2': lambda m: lean(m, -2), 'pulse': lambda m: recolor(m, PULSE),
    'pulse_up1': lambda m: recolor(bob(m, -1), PULSE), 'pulse_leanR': lambda m: recolor(lean(m, 1), PULSE),
    'pulse_leanL': lambda m: recolor(lean(m, -1), PULSE), 'pulse_down1': lambda m: recolor(bob(m, 1), PULSE),
}
# Kandidaten je Frame (Pose.Variante), in Reihenfolge der Bevorzugung; Haltepaare (7/8, 13/14) teilen den Frame.
ROWS = {
    'idle':     [['idle.base'], ['idle.up1'], ['idle.pulse_up1', 'idle.up2'], ['idle.leanR'], ['idle.pulse', 'idle.leanR2'], ['idle.leanL']],
    'attack1':  [['attack1.leanL', 'attack1.down1'], ['attack1.base'], None, ['strike.base'], ['strike.pulse', 'strike.leanL', 'strike.up1'],
                 ['attack1.pulse', 'attack1.leanR', 'attack1.up1']],
    'attack2':  [['attack1.pulse_leanL', 'attack1.leanL2', 'attack2.leanL'], ['attack1.pulse_up1', 'attack1.up2', 'attack2.base'], None,
                 ['attack2.base', 'attack2.up1'], ['attack2.pulse', 'attack2.leanL', 'attack2.up2'], ['attack2.leanR', 'attack2.down1', 'attack2.pulse_leanR']],
    'special':  [['special.down1', 'idle.up2', 'special.leanR2'], ['special.leanL'], ['special.base'], ['special.pulse', 'special.up1'],
                 ['special.pulse_up1', 'special.up2'], ['special.leanR', 'special.pulse_leanR']],
    'hurt':     [['idle.down1', 'hurt.up1'], ['hurt.base'], ['hurt.leanL'], ['hurt.down1', 'hurt.pulse'], ['hurt.leanR', 'hurt.pulse_leanL'],
                 ['hurt.up1', 'hurt.down2', 'idle.down2']],
    'defeated': [['hurt.pulse_down1', 'hurt.leanL2', 'hurt.up2'], ['defeated.up2', 'hurt.leanR2', 'hurt.pulse_leanR'],
                 ['defeated.up1', 'hurt.pulse_leanL', 'hurt.down2'], ['defeated.base'], ['defeated.leanL'], ['defeated.down1', 'defeated.pulse', 'defeated.leanR']],
}
ROW_POSES = {'idle': ['idle'], 'attack1': ['attack1', 'strike'], 'attack2': ['attack2', 'attack1'], 'special': ['special'],
             'hurt': ['hurt', 'idle'], 'defeated': ['defeated', 'hurt', 'idle']}
ROWN = list(ROWS)

def place(m):
    """Motiv in eine 96er-Zelle: waagrecht mittig, Unterkante auf Fußlinie 93."""
    c = np.full((CH, CW), T, np.int32); H, W = m.shape
    x0 = max(M, min(CW - M - W, (CW - W) // 2)); y0 = FOOT - H + 1
    assert y0 >= M and x0 + W <= CW - M, (H, W)
    c[y0:y0+H, x0:x0+W] = m
    return c

def battle_sheet(p):
    tc = template_cores(base.ROOT / f'public/sprites/battle/hg_battle_{p}.png')
    F = {}; MOT = {}
    F['idle'], MOT['idle'] = fit(p, 'idle', 8)
    for pose in POSES[1:]:
        F[pose], MOT[pose] = fit(p, pose, F['idle'])
    sheet = np.full((6 * CH, 6 * CW), T, np.int32)
    used = set(); D = {}; FAIL = []
    def cand_cells(spec):
        pose, var = spec.split('.')
        m = VARIANTS[var](MOT[pose])
        if m.shape[0] > MAXH or m.shape[1] > MAXW: return None
        return place(m)
    for r, row in enumerate(ROWN):
        for c, specs in enumerate(ROWS[row]):
            if specs is None:                                  # Halteframe = identisch mit dem vorigen
                sheet[r*CH:(r+1)*CH, c*CW:(c+1)*CW] = sheet[r*CH:(r+1)*CH, (c-1)*CW:c*CW]; D[(r, c)] = D[(r, c-1)] + ' (Halten)'; continue
            tw, th = tc[(r, c)]
            allspecs = list(specs) + [f'{q}.{v}' for q in ROW_POSES[row] for v in VARIANTS]
            pick = None
            for s in allspecs:
                cell = cand_cells(s)
                if cell is None: continue
                h = hashlib.md5(cell.tobytes()).hexdigest()
                if h in used: continue
                w_, h_ = wh(core(cell >= 0))
                if w_ >= FILL * tw and h_ >= FILL * th: pick = (s, cell, h); break
            if pick is None:                                   # ehrlich melden, nichts auffüllen
                s = specs[0]; cell = cand_cells(s); h = hashlib.md5(cell.tobytes()).hexdigest(); FAIL.append((r, c, s)); pick = (s, cell, h)
            s, cell, h = pick; used.add(h)
            sheet[r*CH:(r+1)*CH, c*CW:(c+1)*CW] = cell; D[(r, c)] = s
    # zellweise spiegeln: Gegner schauen nach links
    for r in range(6):
        for c in range(6):
            sheet[r*CH:(r+1)*CH, c*CW:(c+1)*CW] = sheet[r*CH:(r+1)*CH, c*CW:(c+1)*CW][:, ::-1]
    return sheet, D, F, FAIL

if __name__ == '__main__':
    import sys
    for p in sys.argv[1:] or PATHS:
        s, D, F, FAIL = battle_sheet(p)
        print(p, F, 'FAIL', FAIL)
