"""Nachbesserung Endgestalten (seq31a): Laterne größer/breiter (neue, breitere Konzepte: glockig ausgestellter Mantel, breite Schultern),
Eisen-Kartenbogen größer (neues Kartenkonzept, Gestalt höher als breit, Brückenbogen aufrecht statt seitlich), Echo-Kampfbogen ohne die
grauen Schallschwaden (losgelöste Inseln neben der Figur werden aus jedem Posenmotiv entfernt). Baut mit tools/art/seq31a unverändert;
nur die Rohbild-Quelle wird für die neuen Konzepte auf docs/art/nachbesserung-raw umgelenkt."""
import sys, os
from pathlib import Path
import numpy as np
from scipy import ndimage
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'seq31a'))
import base, figures, export as E

ROOT = base.ROOT; NB = ROOT / 'docs/art/nachbesserung-raw'
NEW = ['laterne_kampf_idle.jpg', 'laterne_kampf_attack1.jpg', 'laterne_kampf_attack2.jpg', 'laterne_karte_ansichten.jpg', 'eisen_karte_ansichten.jpg']
MERGED = Path('/workspace/nb/raw_merged'); MERGED.mkdir(parents=True, exist_ok=True)
for f in base.RAW.iterdir():
    t = MERGED / f.name
    if t.is_symlink() or t.exists(): t.unlink()
    t.symlink_to(NB / f.name if f.name in NEW else f)
figures.RAW = MERGED
os.makedirs('/tmp/s31c', exist_ok=True)
_mot = figures.mot

def dewisp(m):
    lab, n = ndimage.label(m >= 0, structure=np.ones((3, 3)))
    if n <= 1: return m
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = 1 + int(np.argmax(sizes))
    out = m.copy(); out[(lab != keep) & (lab > 0)] = -1
    return base.crop(out) if hasattr(base, 'crop') else out

def mot(name, f, box=None):
    m = _mot(name, f, box)
    return dewisp(m) if name.startswith('echo_kampf') else m
figures.mot = mot

def map_views(p):
    """wie seq31a.figures.map_views, aber Kartenrand 1 px statt 2 (Höhe bis 45, Breite bis 30), damit Laterne/Eisen größer werden."""
    path = figures.RAW / f'{p}_karte_ansichten.jpg'
    boxes = base.split_views(path, 3)
    for f in range(6, 60):
        vs = [figures.mot(f'{p}_karte_ansichten.jpg', f, b) for b in boxes]
        if max(v.shape[0] for v in vs) <= 45 and max(v.shape[1] for v in vs) <= figures.MW - 2:
            V = dict(zip(('down', 'left', 'up'), vs))
            if p == 'eisen':   # Seitenansicht ist schmal (18 px): eine Stufe größer (Faktor f-1), damit sie die Vorlagenhöhe (39) trifft
                V['left'] = figures.mot(f'{p}_karte_ansichten.jpg', f - 1, boxes[1])
            return V, f
    raise ValueError(p)
figures.map_views = map_views

if __name__ == '__main__':
    SPR = E.SPR
    for p, what in [('laterne', 'both'), ('eisen', 'map'), ('echo', 'battle')]:
        tb = figures.load_template(SPR / f'battle/hg_battle_{p}.png'); tm = figures.load_template(SPR / f'characters/hg_form_{p}.png')
        figures.BM = 1 if p == 'laterne' else 2   # Laterne-Idle ist 92 px hoch: 1 px oberer Zellrand statt 2 (Fußlinie 93 bleibt)
        if what in ('both', 'battle'):
            bs, *_ = figures.battle_sheet(p, tb); E.save_indexed(bs, SPR / f'battle/hg_form_{p}_still.png')
        figures.MM = 1
        if what in ('both', 'map'):
            ms, _, _, mf = figures.map_sheet(p, tm); figures.MM = 2; E.save_indexed(ms, SPR / f'characters/hg_form_{p}_still.png'); print(p, 'map factor', mf)
        print('ok', p, what)
