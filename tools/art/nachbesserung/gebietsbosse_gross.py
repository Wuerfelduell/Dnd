"""Nachbesserung Bruchmeister: größer (und breiter als der Vorhauer) – gleiches Konzeptbild (gebietsbosse-raw/bruchmeister_konzept.jpg),
gleicher Rig und gleiche Posen, aber kleinerer ganzzahliger Blockfaktor (11 statt 12 -> Figur 1,09x). Teilgrenzen des Rigs
(Basis-Koordinaten) und lean_from/squash_from werden mit 12/11 mitskaliert. Raster/Reihen/Fußlinie unverändert."""
import sys
from pathlib import Path
import numpy as np
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'gebietsbosse'))
import export as E, bosses, rig as R

NEW_F = {'bruchmeister': 11}
OLD_F = dict(E.SHEET_FACTOR)

class ScaledRig(R.Rig):
    S = 1.0
    def __init__(self, base, parts):
        s = ScaledRig.S
        super().__init__(base, [(n, (lambda f: (lambda y, x: f(y / s, x / s)))(f)) for n, f in parts])
    def frame(self, cw, ch, x0, foot, **kw):
        s = ScaledRig.S
        for k in ('lean_from', 'squash_from'):
            if kw.get(k) is not None: kw[k] = int(round(kw[k] * s))
        # Basis ist breiter -> linke Kante so verschieben, dass die Mitte gleich bleibt
        x0 = int(round(x0 - (self.W - self.W / s) / 2))
        return super().frame(cw, ch, x0, foot, **kw)

def build(name):
    ScaledRig.S = OLD_F[name] / NEW_F[name]
    bosses.Rig = ScaledRig
    E.SHEET_FACTOR[name] = NEW_F[name]
    return E.build_sheet(name)

if __name__ == '__main__':
    for name in NEW_F:
        s, desc, shape = build(name)
        E.save_indexed(s, E.SPR / f'battle/enemy_ds_gb_{name}.png')
        print(name, 'Basis', shape)
