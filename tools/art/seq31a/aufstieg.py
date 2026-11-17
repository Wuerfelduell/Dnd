"""Aufstiegs-Vollbilder (Codex DC1 Abschnitt 2): je 8 Frames 240x135, opak, eine Reihe (1920x135).
Seq 3 = wie HG_aufstieg_4 (Leuchtellipse, Türkiskranz), kürzer und OHNE Furcht-Welle (keine Bein-Weiß-Risse).
Seq 1 = Blick des Spielers in einen Zollregister-Raum, der hell wird; Zeugen am Rand; endet leer und hell."""
import math
import numpy as np
import base
from base import RAW, idx, scene, load_rgb, nearest_idx, VIOLET, TQ

W, H = 240, 135
BG = idx('#1a1c2c')

# ------------------------------------------------------------------ Seq 3 (prozedural im Stil der Vorlage)
# Bänder von außen nach innen: (normierter Abstand, Farbe). Übergänge 0.07 breit im Schachbrett gerastert wie die Vorlage.
C = {k: idx(v) for k, v in dict(d1='#252b38', d2='#303b49', g1='#334d47', g2='#496b64', s1='#425360', s2='#586c78',
                                 s3='#71858b', s4='#95a5a5', tq='#6fe0d0').items()}
SEQ3 = [  # (rx, ry, Bänder)  – Höhepunkt schon in Frame 2/3, dann rasch abklingend ("kürzer")
    (80, 43, [(1.0, 'd1')]),
    (98, 54, [(1.0, 'd1'), (0.82, 'd2'), (0.68, 'g1'), (0.5, 'g2')]),
    (105, 57, [(1.0, 'd1'), (0.86, 'g1'), (0.72, 'g2'), (0.5, 's3'), (0.32, 'tq')]),
    (111, 63, [(1.0, 'd1'), (0.9, 'g1'), (0.78, 'g2'), (0.62, 's2'), (0.5, 'tq')]),
    (107, 60, [(1.0, 'd1'), (0.86, 'd2'), (0.74, 'g1'), (0.56, 'g2'), (0.32, 's3')]),
    (98, 55, [(1.0, 'd1'), (0.8, 'g1'), (0.6, 'g2'), (0.3, 's2')]),
    (86, 48, [(1.0, 'd1'), (0.76, 'd2'), (0.5, 'g1')]),
    (79, 43, [(1.0, 'd1'), (0.6, 'd2')]),
]
SEQ3_TXT = ['Glimmen: dunkle Ellipse', 'Leuchten wächst', 'Kern wird hell, Türkiskranz erscheint',
            'Höhepunkt: Türkiskranz voll, ohne Risse (keine Furcht-Welle)', 'Kranz klingt ab', 'Leuchten sinkt',
            'nur noch Schimmer', 'Nachglühen']

def seq3():
    frames = []
    yy, xx = np.mgrid[0:H, 0:W]
    for i, (rx, ry, bands) in enumerate(SEQ3):
        f = np.full((H, W), BG, np.int32)
        d = np.sqrt(((xx - (W - 1) / 2) / rx) ** 2 + ((yy - (H - 1) / 2) / ry) ** 2)
        chk = (xx + yy + i) % 2 == 0
        for k, (t, col) in enumerate(bands):
            inner = d < t - 0.07
            edge = (d >= t - 0.07) & (d < t)
            f[inner] = C[col]
            prev = BG if k == 0 else C[bands[k - 1][1]]
            f[edge & chk] = C[col]
            f[edge & ~chk] = prev if k else BG
        frames.append(f)
    return frames, SEQ3_TXT

# ------------------------------------------------------------------ Seq 1 (aus drei Szenen-Konzepten)
GAIN = {'a': (2.2, 1.1), 'b': (1.0, 1.0), 'c': (1.0, 1.0)}   # Konzept A ist sehr dunkel -> aufgehellt
ALLOWED = [i for i in range(len(base.PAL)) if i != TQ and i not in VIOLET]
SEQ1 = [('a', None, 0.75, 'Zollregister-Raum im Dämmer: nasser Stein, Registerregale, Wasserlinie, Zeugen am Rand'),
        ('a', None, 1.00, 'der Raum, wie der Spieler ihn sieht'),
        ('a', 'b', 1.00, 'es wird hell (Überblendung)'),
        ('b', None, 1.00, 'hell; Zeugen stehen am Rand'),
        ('b', None, 1.10, 'noch heller, kein Effektfeuerwerk'),
        ('b', 'c', 1.05, 'Zeugen verblassen (Überblendung)'),
        ('c', None, 1.00, 'leerer, heller Raum'),
        ('c', None, 0.95, 'leerer, heller Raum, ruhig nachklingend')]

def seq1():
    rgb = {k: load_rgb(RAW / f'aufstieg1_{k}.jpg', GAIN[k]).astype(np.float32) for k in 'abc'}
    frames, txt = [], []
    for a, b, g, t in SEQ1:
        img = rgb[a] if b is None else 0.5 * rgb[a] + 0.5 * rgb[b]
        img = np.clip(img * g, 0, 255).astype(np.uint8)
        f, fac = scene(None, W, H, allowed=ALLOWED, rgb=img)
        frames.append(f); txt.append(t)
    return frames, txt, fac
