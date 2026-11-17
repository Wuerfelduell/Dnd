"""Nachbesserung Schleusenuhr (ez_schleusenuhr): kräftiger und breiter. Fünf neue Konzeptbilder (nachbesserung-raw/
schleusenuhr_kampf_{idle,attack1,strike,attack2}.jpg, schleusenuhr_lauf_ansichten.jpg): derselbe Corvin Hake, aber breitschultrig,
schwerer Ölmantel, breiter Stand, Schleusenschlüssel quer vor dem Körper. Aufbau über tools/art/pfadbeyonder (figures.battle_sheet,
figures.walk_sheet; Raster 288x240 / 64x128 unverändert). Die alten Pixel-Retuschen (feste Koordinaten am dünnen Motiv) entfallen.
defeated: sinkt aufrecht in sich zusammen (Stauchen ohne Vornüberknicken) statt einzuknicken. Kopfbild bleibt unverändert."""
import sys
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'pfadbeyonder'))
import base, figures, export as E
from rig import Rig

base.RAW = base.ROOT / 'docs/art/nachbesserung-raw'
for k in [k for k in figures.RETOUCH if k.startswith('schleusenuhr')]: del figures.RETOUCH[k]
BF = int(sys.argv[1]) if len(sys.argv) > 1 else 21
WF = int(sys.argv[2]) if len(sys.argv) > 2 else 16

def build():
    fig = 'schleusenuhr'
    P = {p: E.motif(f'{fig}_{p}', f'{fig}_kampf_{p}.jpg', BF, None, E.GAIN_BATTLE) for p in ('idle', 'attack1', 'strike', 'attack2')}
    views = base.split_views(base.RAW / f'{fig}_lauf_ansichten.jpg')
    V = {v: E.motif(f'{fig}_walk_{v}', f'{fig}_lauf_ansichten.jpg', WF, b, E.GAIN_WALK) for v, b in zip(('down', 'left', 'up'), views)}
    walk, _ = figures.walk_sheet(V)
    sheet, _ = figures.battle_sheet(fig, P)
    idle = P['idle']; H = idle.shape[0]
    rig = Rig(idle, [('upper', lambda y, x: y < H - 14)])
    ys, xs = np.where(idle[-6:] >= 0); x0 = 24 - int(np.median(xs))
    for i, sq in enumerate([0.8, 0.62, 0.48, 0.38]):     # sinkt aufrecht: Beine stauchen, Oberkörper bleibt gerade (lean 0)
        c = rig.frame(48, 48, x0, figures.FOOT, squash=sq, squash_from=H - 20)
        sheet[4*48:5*48, i*48:(i+1)*48] = c
    return sheet, walk, {k: v.shape for k, v in P.items()}, {k: v.shape for k, v in V.items()}

if __name__ == '__main__':
    sheet, walk, ps, vs = build()
    E.save_indexed(sheet, E.SPR / 'battle/enemy_ez_schleusenuhr.png')
    E.save_indexed(walk, E.SPR / 'characters/ph_ez_schleusenuhr_walk.png')
    print('ok', BF, WF, ps, vs)
