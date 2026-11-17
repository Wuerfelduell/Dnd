"""Nachbesserung Engel: breiter/größer. Engel 1 und 2: gleiche Konzepte, Blockfaktor 10 -> 9 (1,11x).
Engel 3: fünf neue Konzeptbilder (nachbesserung-raw/engel_3_kampf_*.jpg) mit genau SECHS breiten, zählbaren Lichtbahnen
(3 je Seite), Silhouette etwa so breit wie hoch; Blockfaktor so gewählt, dass Engel 3 deutlich größer als Engel 1 ist.
Aufbau der Blätter unverändert über tools/art/engel/figures.battle_sheet (Raster 128x128, 6x6, Reihen wie hg_grenzwaechter).
Wetherby bleibt unverändert."""
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'engel'))
import base, figures, export as E

NB = base.ROOT / 'docs/art/nachbesserung-raw'
FACT = {'engel_1': int(sys.argv[2]) if len(sys.argv) > 2 else 9, 'engel_2': 9, 'engel_3': int(sys.argv[1]) if len(sys.argv) > 1 else 7}
def raw(fig, pose):
    p = NB / f'{fig}_kampf_{pose}.jpg'
    return p if p.exists() else base.RAW / f'{fig}_kampf_{pose}.jpg'
def motif(a):
    fig, pose = a
    m = base.motif(raw(fig, pose), FACT[fig], None, E.GAIN, eyes=True)
    eyes = [tuple(map(int, e)) for e in base.EYES]
    if fig == 'engel_3': m = figures.crown_spikes(figures.ash_crown(m, eyes), eyes)
    return fig, pose, m, eyes
def build():
    with ProcessPoolExecutor(8) as ex:
        res = list(ex.map(motif, [(f, p) for f in FACT for p in E.POSES]))
    M, EY = {}, {}
    for f, p, m, e in res: M.setdefault(f, {})[p] = m; EY[(f, p)] = e
    return {f: figures.battle_sheet(f, M[f], EY)[0] for f in FACT}, {f: M[f]['idle'].shape for f in FACT}
if __name__ == '__main__':
    sheets, shapes = build()
    for f, s in sheets.items(): E.save_indexed(s, E.SPR / f'battle/{E.FIGS[f]["id"]}.png')
    print('ok', FACT, shapes)
