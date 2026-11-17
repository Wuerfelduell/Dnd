"""Nachbesserung Heilige der Höfe: je Pfad eine eigene Klinge (neues strike-Konzept: Flammenschwert / Nähnadel / Masken-Sichel /
Glocken-Zweihänder / Rührpaddel / Eisenträger / Schlüsselklinge / Waagen-Schwert / Rohrkolben-Speer / Uhrzeiger-Klinge),
echtes defeated (neues Konzept: zusammengesunken, halb liegend, auf einen Arm gestützt; Faden-Gesicht und Laternen-Nimbus sichtbar),
Echo: Klinge und Lichtkette mit beiden Händen gegriffen (neues strike + attack2), losgelöste Inseln (Schallschwaden) entfernt.
Baut mit tools/art/heilige unverändert (Kern-Box-Regel 85 %, keine Füllmittel); nur die Rohbild-Quelle der neuen Posen wird auf
docs/art/nachbesserung-raw/hs_<pfad>_kampf_<pose>.jpg umgelenkt. Manifest bleibt unverändert (Palette-Metadaten: siehe PROPOSAL)."""
import sys, os
from pathlib import Path
import numpy as np
from scipy import ndimage
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'heilige'))
import base, figures, export as E

NB = base.ROOT / 'docs/art/nachbesserung-raw'
MERGED = Path('/workspace/nb/raw_hs'); MERGED.mkdir(parents=True, exist_ok=True)
for f in base.RAW.iterdir():
    t = MERGED / f.name
    if t.is_symlink() or t.exists(): t.unlink()
    nb = NB / f'hs_{f.name}'
    t.symlink_to(nb if nb.exists() else f)
figures.RAW = MERGED
_motif = figures.motif

def dewisp(m):
    lab, n = ndimage.label(m >= 0, structure=np.ones((3, 3)))
    if n <= 1: return m
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = 1 + int(np.argmax(sizes))
    out = m.copy(); out[(lab != keep) & (lab > 0)] = -1
    return figures.crop(out)

def motif(src, f, *a, **k):
    m = _motif(src, f, *a, **k)
    return dewisp(m) if Path(src).name.startswith('echo_') else m
figures.motif = motif
os.makedirs('/tmp/hlc_nb', exist_ok=True)
_cache = figures._cache
figures._cache = lambda key, fn: _cache('nb|' + key + '|' + str(MERGED / key.split('|')[0]), fn)

# Faden: die liegende Pose ist 55 px hoch, die Vorlage kniet in den letzten drei defeated-Frames mit 68-69 px. Damit die liegende Pose dort
# die 85-%-Regel erfüllt, wird die Hüftzeile bis zu 4x gedoppelt (gleiche Technik wie die Atemzeile der Vorlage-Varianten, nur mehr Zeilen).
FADEN_DEF = [['hurt.pulse_down1', 'hurt.leanL2', 'hurt.up2'], ['hurt.leanR2', 'hurt.pulse_leanR'], ['hurt.pulse_leanL', 'hurt.down2'],
             ['defeated.up4'], ['defeated.up4_leanL'], ['defeated.pulse_up4']]

if __name__ == '__main__':
    paths = sys.argv[1:] or figures.PATHS
    ROWS0 = dict(figures.ROWS)
    for p in paths:
        figures.ROWS.clear(); figures.ROWS.update(ROWS0)
        if p == 'faden':
            figures.VARIANTS.update({'up4': lambda m: figures.bob(m, -4), 'up4_leanL': lambda m: figures.lean(figures.bob(m, -4), -1),
                                     'pulse_up4': lambda m: figures.recolor(figures.bob(m, -4), figures.PULSE)})
            figures.ROWS['defeated'] = FADEN_DEF
        p_, s, D, F, FAIL, tq, tqfix = E.build(p)
        if FAIL: print('FAIL', p, FAIL); continue
        used = E.sheet_palette(s)
        E.save_indexed(s, used, E.SPR / f'battle/enemy_hs_heiliger_{p}.png')
        print('ok', p, F, len(used), tq, tqfix, {k: v for k, v in D.items() if k[0] in (1, 5)})
