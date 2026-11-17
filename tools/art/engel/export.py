#!/usr/bin/env python3
"""Export Batch engel: vier Kampfblätter 768x768 (Raster exakt wie battle/hg_grenzwaechter.png, 128x128, 6x6) für
hs_engel_1..3 (Himmelsstadt, Seq 2) und k4s_wetherby (Kap. 4, gefallener Engel).
Ein Konzeptbild je Pose (docs/art/engel-raw/), jede Pose einzeln per Skript gesetzt (figures.py, rig.py), ganzzahlig NN,
Palette indiziert (32), binäres Alpha, 1px Umriss #1a1c2c. Aufruf: python3 tools/art/engel/export.py (Pillow, numpy, scipy)"""
import json, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).parent))
import base, figures

ROOT = base.ROOT; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'
FIGS = {
    'engel_1': dict(id='enemy_hs_engel_1', gameId='hs_engel_1', name='Engel des Grats', factor=10, tint='#fff8e0',
                    attackNames=['Flügelschlag aus Licht', 'Chor der Zerstörung (Lichtkette)', 'Das Wort (Lichtring)']),
    'engel_2': dict(id='enemy_hs_engel_2', gameId='hs_engel_2', name='Engel der Schwelle', factor=10, tint='#fff8e0',
                    attackNames=['Flügelschlag aus Licht', 'Chor der Zerstörung (Lichtkette)', 'Das Wort (Tür aus Licht)']),
    'engel_3': dict(id='enemy_hs_engel_3', gameId='hs_engel_3', name='Engel des Thrones', factor=9, tint='#fff8e0',
                    attackNames=['Flügelschlag aus Licht', 'Chor der Zerstörung (Lichtkette)', 'Das Wort (Lichtsäule)']),
    'wetherby': dict(id='enemy_k4s_wetherby', gameId='k4s_wetherby', name='Oswin Wetherby, gefallener Engel', factor=11, tint='#e8dcc0',
                     attackNames=['Flügelschlag (gebrochene Lichtflügel)', 'Chor / Lichtkette', 'Aktensturm'], identity='battle/enemy_cw_wetherby.png'),
}
POSES = ['idle', 'attack1', 'strike', 'attack2', 'special']
GAIN = (1.0, 1.1)
TEMPLATE = 'hg_grenzwaechter'

def _motif(a):
    fig, pose = a
    m = base.motif(base.RAW / f'{fig}_kampf_{pose}.jpg', FIGS[fig]['factor'], None, GAIN, eyes=fig != 'wetherby')
    eyes = [tuple(map(int, e)) for e in base.EYES]
    if fig == 'engel_3': m = figures.crown_spikes(figures.ash_crown(m, eyes), eyes)
    return fig, pose, m, eyes

def save_indexed(a, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray((a + 1).astype(np.uint8), 'P')
    pal = [0, 0, 0] + [int(v) for v in base.PAL.flatten()]
    im.putpalette(pal + [0] * (768 - len(pal))); im.info['transparency'] = 0
    im.save(path, transparency=0, optimize=True)

def rgba(a):
    P = np.vstack([base.PAL, [[0, 0, 0]]]).astype(np.uint8)
    return Image.fromarray(np.dstack([P[a], (a >= 0) * 255]).astype(np.uint8), 'RGBA')

def on_bg(im, col=(70, 64, 90)):
    bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im); return bg

def tinted(im, hexcol):
    """Wie Phaser setTint: RGB multiplizieren (so lief die Figur bisher im Spiel)."""
    t = np.array([int(hexcol[i:i+2], 16) for i in (1, 3, 5)]) / 255.0
    a = np.array(im.convert('RGBA')).astype(float); a[..., :3] *= t
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')

def main():
    man_h = {a['id']: a for a in json.loads((SPR / 'manifest-halbgott.json').read_text())['assets']}
    tpl = man_h[TEMPLATE]
    with ProcessPoolExecutor(8) as ex:
        res = list(ex.map(_motif, [(f, p) for f in FIGS for p in POSES]))
    M = {}; E = {}
    for f, p, m, e in res: M.setdefault(f, {})[p] = m; E[(f, p)] = e
    man = dict(version=1, batch='engel', codex=None, styleSource='docs/art/codex_CO_halbgott_grafik.md (0.1 Style-Block)',
               status='exported; Einbau ausstehend (siehe PROPOSAL-einbau.md: Sheets laufen bisher als getönter hg_grenzwaechter)',
               paletteMaxVisibleColors=32, palette=base.PAL_HEX,
               paletteNote='manifest-halbgott.json (Vorlage hg_grenzwaechter, enemy_cw_wetherby) mit #eee2c5->#ebcd8d und #a8b4c0->#bbae95: Weiß nur als warmes Bein-Weiß; Licht in Amber (#f0ce80/#e8b860/#d0a050); Türkis #6fe0d0 nur als einzelne Funken',
               assets=[])
    gen = dict(batch='engel', method='Ein Konzeptbild je Pose und Figur (Magenta-Grund, Style-Block aus codex_CO vorangestellt), '
               'Pose einzeln ins Raster gesetzt: Median 5, Magenta-Key, ganzzahliger Blockfaktor (Kern-Mehrheit, Phasensuche), Lab-Palettenabbildung, '
               'Aufräumen, Außenumriss #1a1c2c; Augenlicht aus den Leuchtflecken des Konzeptbilds übernommen; Effekte pro Frame gezeichnet.',
               prompts=json.loads((Path(__file__).parent / 'prompts.json').read_text()), figures={})
    sheets = {}
    for f, cfg in FIGS.items():
        sheet, desc = figures.battle_sheet(f, M[f], E)
        rel = f'battle/{cfg["id"]}.png'; save_indexed(sheet, SPR / rel); sheets[f] = sheet
        entry = dict(id=cfg['id'], file=rel, gameId=cfg['gameId'], name=cfg['name'], template=tpl['file'],
                     attackNames=cfg['attackNames'])
        for k in ('width', 'height', 'kind', 'transparent', 'frameWidth', 'frameHeight', 'columns', 'rows', 'animations', 'anticipationHoldFrames'):
            entry[k] = tpl[k]
        entry.update(baseline=figures.FOOT, occupiedCounts=[6] * 6, facing='left',
                     hover=figures.HOVER[f], replacesTint=cfg['tint'])
        if 'identity' in cfg: entry['identityReference'] = cfg['identity']
        man['assets'].append(entry)
        gen['figures'][f] = dict(file=f'public/sprites/{rel}', factor=cfg['factor'], gain=list(GAIN),
                                 motifSizes={p: list(M[f][p].shape) for p in POSES},
                                 eyeLight={p: E[(f, p)] for p in POSES} if f != 'wetherby' else None,
                                 frames=[dict(row=r, col=c, index=r * 6 + c, pose=d) for (r, c), d in sorted(desc.items())])
    (SPR / 'manifest-engel.json').write_text(json.dumps(man, indent=2, ensure_ascii=False) + '\n')
    (ART / 'batch-engel-generation.json').write_text(json.dumps(gen, indent=2, ensure_ascii=False) + '\n')
    # Vorschau: alle Frames 3x, 2x2 Blätter mit Beschriftung
    S = 3; tiles = []
    for f, cfg in FIGS.items():
        im = on_bg(rgba(sheets[f])).resize((768 * S, 768 * S), Image.NEAREST)
        d = ImageDraw.Draw(im)
        for i in range(1, 6):
            d.line([(i * 128 * S, 0), (i * 128 * S, 768 * S)], fill=(95, 88, 120)); d.line([(0, i * 128 * S), (768 * S, i * 128 * S)], fill=(95, 88, 120))
        tiles.append((f'{cfg["id"]}  ({cfg["name"]}) – 768x768, 128x128 x 6x6, Reihen idle(p1-p3) / attack1 / attack2 / special / hurt / defeated, 3x', im))
    W = 2 * 768 * S + 30; H = 2 * (768 * S + 40) + 10
    pv = Image.new('RGBA', (W, H), (40, 38, 52, 255)); d = ImageDraw.Draw(pv)
    for i, (t, im) in enumerate(tiles):
        x = (i % 2) * (768 * S + 30); y = (i // 2) * (768 * S + 40) + 10
        d.text((x + 4, y), t, fill=(235, 225, 200)); pv.alpha_composite(im, (x, y + 30))
    pv.convert('RGB').save(ART / 'batch-engel-preview.png', optimize=True)
    # Vorlage | neu (1x): getönter Grenzwächter wie bisher im Spiel | neues Blatt; Wetherby zusätzlich das Menschen-Blatt
    tplim = Image.open(SPR / tpl['file']).convert('RGBA')
    hum = Image.open(SPR / 'battle/enemy_cw_wetherby.png').convert('RGBA')
    rows = []
    for f, cfg in FIGS.items():
        parts = [('Vorlage: hg_grenzwaechter, bisher getönt ' + cfg['tint'], on_bg(tinted(tplim, cfg['tint']))),
                 ('neu: ' + cfg['id'], on_bg(rgba(sheets[f])))]
        if f == 'wetherby': parts.append(('Identität: enemy_cw_wetherby (Mensch, 64x64)', on_bg(hum)))
        rows.append((cfg['name'], parts))
    W = max(sum(p[1].size[0] + 16 for p in parts) for _, parts in rows) + 16
    H = sum(max(p[1].size[1] for p in parts) + 40 for _, parts in rows) + 10
    vn = Image.new('RGBA', (W, H), (40, 38, 52, 255)); d = ImageDraw.Draw(vn); y = 10
    for name, parts in rows:
        x = 16
        for t, im in parts:
            d.text((x, y), f'{name} | {t}', fill=(235, 225, 200)); vn.alpha_composite(im, (x, y + 20)); x += im.size[0] + 16
        y += max(p[1].size[1] for p in parts) + 40
    vn.convert('RGB').save(ART / 'batch-engel-vorlage-neu.png', optimize=True)
    print('ok', {f: [list(M[f][p].shape) for p in POSES] for f in FIGS})

if __name__ == '__main__':
    main()
