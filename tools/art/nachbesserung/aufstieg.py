"""Nachbesserung Aufstiegs-Vollbilder (fx/HG_aufstieg_3.png neu, fx/HG_aufstieg_1.png Frames 2 und 5).
Raster unverändert: 8 Frames 240x135, opak, eine Reihe (1920x135), Palette manifest-halbgott (32), indiziert.
HG_aufstieg_3: echte Szene statt Ellipsen – Kreuzgang-Hof bei Nacht, aus dem Brunnen steigt warmes Bein-Weiß-Licht,
Höhepunkt früh (Frame 2/3), dann Abklingen in ruhiges Morgengrau. Fünf deckungsgleiche Konzeptbilder (a, b, c, c2, d),
je Frame genau EIN Konzept (keine Überblendung -> keine Doppelkonturen), nur Helligkeit je Frame. Türkis nur als Glanzpunkt.
HG_aufstieg_1: Frames 2 und 5 waren 50/50-Überblendungen zweier nicht deckungsgleicher Konzepte (Doppelkonturen). Ersetzt durch
eigene Zwischen-Konzepte (aufstieg1_ab: halbhell, gleiche Zeugen; aufstieg1_bc: nur noch zwei Zeugen). Übrige Frames unverändert."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'seq31a'))
import base   # seq31a: Palette manifest-halbgott, scene(), load_rgb()
from base import scene, load_rgb, VIOLET, TQ, idx

ROOT = base.ROOT; RAW = ROOT / 'docs/art/nachbesserung-raw'; SPR = ROOT / 'public/sprites'
W, H = 240, 135
ALLOW3 = [i for i in range(len(base.PAL)) if i not in VIOLET]            # Türkis erlaubt, aber nur wo das Konzept es hat
ALLOW1 = [i for i in range(len(base.PAL)) if i != TQ and i not in VIOLET]
SEQ3 = [('a', 0.62, 'Kreuzgang-Hof bei Nacht, dunkel, nur Gaslaternen'),
        ('b', 0.95, 'Licht steigt aus dem Brunnen, Laternen heller'),
        ('c', 1.12, 'Hof hell, Bögen leuchten (Höhepunkt beginnt)'),
        ('c2', 1.38, 'Höhepunkt: für einen Herzschlag zu hell und zu nah'),
        ('c', 1.0, 'Licht sinkt zurück'),
        ('b', 0.85, 'nur noch Glimmen im Brunnen'),
        ('d', 0.95, 'Nachklang: ruhiger, klarer Hof im Morgengrau'),
        ('d', 0.8, 'Ruhe')]

def seq3():
    frames, txt = [], []
    for k, g, t in SEQ3:
        rgb = np.clip(load_rgb(RAW / f'aufstieg3_{k}.jpg').astype(np.float32) * g, 0, 255).astype(np.uint8)
        f, fac = scene(None, W, H, allowed=ALLOW3, rgb=rgb)
        frames.append(f); txt.append(t)
    return frames, txt, fac

def seq1_fix():
    old = np.array(Image.open(SPR / 'fx/HG_aufstieg_1.png'))          # Indizes im Halbgott-Palettenraum
    frames = [old[:, i*W:(i+1)*W].astype(np.int32) for i in range(8)]
    for i, k in ((2, 'ab'), (5, 'bc')):
        frames[i], fac = scene(None, W, H, allowed=ALLOW1, rgb=load_rgb(RAW / f'aufstieg1_{k}.jpg'))
    return frames, fac

def save_opaque(a, path):
    im = Image.fromarray(a.astype(np.uint8), 'P')
    pal = [int(v) for v in base.PAL.flatten()]
    im.putpalette(pal + [0] * (768 - len(pal))); im.save(path, optimize=True)

if __name__ == '__main__':
    f3, t3, fac3 = seq3(); save_opaque(np.concatenate(f3, 1), SPR / 'fx/HG_aufstieg_3.png')
    f1, fac1 = seq1_fix(); save_opaque(np.concatenate(f1, 1), SPR / 'fx/HG_aufstieg_1.png')
    s3 = np.concatenate(f3, 1)
    print('ok', fac3, fac1, 'tq3', round(float((s3 == TQ).mean()), 4), 'colors3', len(np.unique(s3)))
