"""Frame-Rig für die Engel: jede Pose ist ein eigenes Motiv; pro Frame wird es ganzzahlig verschoben, gestaucht oder
umgefärbt und bekommt eigene, pro Frame gezeichnete Effektpixel (Licht in Amber, Türkis nur als einzelne Akzente)."""
import math
import numpy as np
from base import idx, outline, crop, OUT, PAL

T = -1
CW = CH = 128
FOOT = 125          # Fußlinie wie hg_grenzwaechter (bbox unten = 126)
M = 2               # Mindestabstand zum Zellrand wie in der Vorlage
A1, A2, A3 = idx('#f0ce80'), idx('#e8b860'), idx('#d0a050')   # Licht, hell -> dunkel
A4 = idx('#886332')                                            # Glutbraun
BONE, BONE2 = idx('#ebcd8d'), idx('#bbae95')
TQ = idx('#6fe0d0')
ASHG = [idx(h) for h in ('#95a5a5', '#71858b', '#586c78')]
PAPER, PAPER2, LINE = idx('#ebcd8d'), idx('#bbae95'), idx('#8b8870')
LIGHT = {A1, A2, A3}
_LUM = PAL @ np.array([0.3, 0.59, 0.11])

def blank(): return np.full((CH, CW), T, np.int32)

def put(c, x, y, v):
    if M <= y <= FOOT and M <= x < CW - M: c[y, x] = v

def recolor(m, table):
    m = m.copy()
    for a, b in table.items(): m[m == a] = b
    return m

DIM1 = {A1: A2, A2: A3, A3: A4}
DIM2 = {A1: A3, A2: A4, A3: A4, BONE: BONE2}
FLASH = {idx('#cfb18a'): BONE, idx('#b3946e'): idx('#cfb18a'), idx('#92745a'): idx('#b3946e'), A3: A2, A2: A1}

def squash(m, f, keep=0.42):
    """Zusammensinken: der obere Teil (Kopf, Schultern) bleibt unverändert und sinkt als Ganzes,
    nur der untere Teil (Gewand/Beine) wird gestaucht. Unterste Zeile bleibt."""
    H = m.shape[0]; top = int(H * keep); low = H - top
    nl = max(1, round(H * f) - top); out = np.full((top + nl, m.shape[1]), T, np.int32)
    out[:top] = m[:top]
    for r in range(nl): out[top + r] = m[top + min(low - 1, int((r + 0.5) * low / nl))]
    return outline(crop(np.where(out == OUT, T, out)))

def checker_out(m, mask, phase=0):
    """Lichtpixel im Schachbrett ausdünnen (Licht erlischt), binär: weg oder da."""
    m = m.copy(); yy, xx = np.mgrid[0:m.shape[0], 0:m.shape[1]]
    m[mask & ((yy + xx + phase) % 2 == 0)] = T
    return crop(m)

def place(m, ax=66, lift=0, anchor_rows=6):
    """Motiv in die Zelle setzen: Mitte der untersten Zeilen bei ax, unterste Zeile auf FOOT-lift; seitlich in die Zelle einpassen."""
    H, W = m.shape
    ys, xs = np.where(m[-anchor_rows:] >= 0)
    x0 = ax - int(np.median(xs)); y0 = FOOT - lift - (H - 1)
    if y0 < M: raise ValueError(f'Pose zu hoch ({H}px, lift {lift})')
    if W > CW - 2 * M: raise ValueError(f'Pose zu breit ({W}px)')
    x0 = min(max(x0, M), CW - M - W)
    c = blank(); sub = c[y0:y0 + H, x0:x0 + W]; sub[m >= 0] = m[m >= 0]
    return c, (x0, y0)

# ---------- Effekte ----------
def pool(c, cx, w, strong=False):
    """Lichtlache unter dem schwebenden Engel (2 Zeilen, gerastert) – hält die Fußlinie wie die Vorlage."""
    for dy, ww in ((0, w), (-1, w - 4)):
        y = FOOT + dy
        for x in range(cx - ww // 2, cx + ww // 2 + 1):
            if (x + y) % 2 == 0 or strong: put(c, x, y, A3 if abs(x - cx) > ww // 3 else A2)

def motes(c, pts, col=A2):
    for x, y in pts: put(c, x, y, col)

def ray(c, x0, y0, x1, y1, col=A1, edge=A3, width=1):
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(n + 1):
        x = round(x0 + (x1 - x0) * i / n); y = round(y0 + (y1 - y0) * i / n)
        for k in range(-width, width + 1):
            if abs(x1 - x0) >= abs(y1 - y0): put(c, x, y + k, col if k == 0 else edge)
            else: put(c, x + k, y, col if k == 0 else edge)

def arc(c, cx, cy, r, a0, a1, col=A2, step=None, dither=False):
    step = step or max(0.02, 0.8 / max(r, 1))
    a = a0
    while a <= a1:
        x = round(cx + r * math.cos(a)); y = round(cy + r * math.sin(a))
        if not dither or (x + y) % 2 == 0: put(c, x, y, col)
        a += step

def chain(c, x0, y, x1, phase=0, col=A1, edge=A3):
    """Lichtkette nach links: liegende Glieder 7x5 (Ring) im Wechsel mit stehenden 3x5, je 5px Abstand, dunkler Lichtsaum."""
    x = x0; k = phase
    while x - 6 > x1:
        if k % 2 == 0:
            for dx in range(1, 6): put(c, x - dx, y - 2, col); put(c, x - dx, y + 2, col)
            for dy in (-1, 0, 1): put(c, x, y + dy, col); put(c, x - 6, y + dy, col)
            for dx in range(1, 6): put(c, x - dx, y - 3, edge); put(c, x - dx, y + 3, edge)
        else:
            for dy in (-2, -1, 0, 1, 2): put(c, x - 2, y + dy, col if abs(dy) < 2 else edge)
            put(c, x - 1, y, col); put(c, x - 3, y, col)
        x -= 5; k += 1

def column(c, cx, w, y_top, col=A1, edge=A2, dither=False):
    """Lichtsäule von y_top bis zur Fußlinie; Rand A2, Kern A1, außen gerasterter A3-Saum."""
    for y in range(max(M, y_top), FOOT + 1):
        for x in range(cx - w // 2 - 1, cx + w // 2 + 2):
            d = abs(x - cx)
            if d <= w // 2 - 1: v = col
            elif d <= w // 2: v = edge
            else:
                if (x + y) % 2: continue
                v = A3
            if dither and (x + y) % 2 == 0: continue
            put(c, x, y, v)

def door(c, x0, y0, w, h, col=A1, edge=A3):
    """Türrahmen aus Licht mit Schwelle."""
    for x in range(x0, x0 + w):
        put(c, x, y0, col); put(c, x, y0 + h, col); put(c, x, y0 + h + 1, edge)
    for y in range(y0, y0 + h + 1):
        put(c, x0, y, col); put(c, x0 + w - 1, y, col)

def paper(c, x, y, tilt=0, behind=None):
    """Aktenblatt mit Umriss: hoch 5x7 oder quer 7x5, Bein-Weiß mit Zeilenstrichen und einer Eselsohr-Ecke.
    behind: Maske, die nicht übermalt wird (Blatt hinter dem Körper)."""
    w, h = (5, 7) if tilt == 0 else (7, 5)
    for dy in range(-1, h + 1):
        for dx in range(-1, w + 1):
            xx, yy = x + dx, y + dy
            if behind is not None and 0 <= yy < CH and 0 <= xx < CW and behind[yy, xx]: continue
            if dx == w - 1 and dy == -1 or dx == w and dy in (-1, 0): continue      # Eselsohr
            edge = dx in (-1, w) or dy in (-1, h) or (dx == w - 1 and dy == 0)
            if edge: v = OUT
            elif dy == 0: v = PAPER
            elif dy % 2 == 0 and 0 < dx < w - 1: v = LINE
            else: v = PAPER2
            put(c, xx, yy, v)

def finish(c):
    """Figur (alles außer reinen Lichteffekten) bekommt den Außenumriss neu; Lichteffekte bleiben randlos."""
    return c
