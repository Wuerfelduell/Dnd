"""Erzeugt src/data/ritualArt.js aus den Manifesten der Codex-Pakete DN (seq4rit1), DO (schatten) und DQ (rituale56).

Texture-Key = Dateiname ohne .png; Kampfblätter, die denselben Namen wie ein Kartenblatt tragen, bekommen `_battle`,
die 32er-Fassung des Schattenattacke-Symbols `_32`. Aufruf: python3 tools/art/ritual_art_table.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACKS = ['seq4rit1', 'schatten', 'rituale56']


def key_of(file, seen):
    base = file.rsplit('/', 1)[-1][:-4]
    if file.startswith('battle/') and base in seen:
        return base + '_battle'
    if '/32/' in file:
        return base + '_32'
    return base


entries = {}
for pack in PACKS:
    m = json.loads((ROOT / 'public/sprites' / f'manifest-{pack}.json').read_text(encoding='utf-8'))
    files = [a['file'] for a in m['assets']]
    bases = {f.rsplit('/', 1)[-1][:-4] for f in files if not f.startswith('battle/')}
    for a in m['assets']:
        k = key_of(a['file'], bases)
        assert k not in entries, k
        anims = {n: [d['frames'], d.get('frameRate', 8), d.get('repeat', 0)] for n, d in (a.get('animations') or {}).items()}
        regions = {n: [r['x'], r['y'], r['width'], r['height']] for n, r in (a.get('regions') or {}).items() if isinstance(r, dict) and 'x' in r}
        e = {'file': a['file'], 'w': a['frameWidth'], 'h': a['frameHeight'], 'sw': a['width'], 'sh': a['height'], 'pack': pack, 'anims': anims}
        if regions:
            e['regions'] = regions
        entries[k] = e

lines = ['// Erzeugt von tools/art/ritual_art_table.py aus manifest-seq4rit1/-schatten/-rituale56.json (Codex DN, DO, DQ). Nicht von Hand ändern.',
         '/* eslint-disable */', 'export const RITUAL_ART = {']
for k, e in entries.items():
    lines.append(f'  {k}: {json.dumps(e, separators=(",", ":"), ensure_ascii=False)},')
lines.append('};')
(ROOT / 'src/data/ritualArt.js').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(len(entries), 'Einträge')
