#!/usr/bin/env python3
"""Export Batch heilige (Teil 5): zehn Kampfblätter public/sprites/battle/enemy_hs_heiliger_<pfad>.png
(576x576, 96x96, 6x6 – Raster, Reihen, Frameraten und Halteframes exakt wie battle/hg_battle_<pfad>.png / manifest-halbgott.json).
Ein Konzeptbild je Pose und Figur (docs/art/heilige-raw/), jeder Frame einzeln gesetzt (figures.py), ganzzahlig NN,
Palette indiziert (je Blatt <= 32 sichtbare Farben), binäres Alpha, 1px Umriss #1a1c2c. Keine Füllmittel.
Aufruf: python3 tools/art/heilige/export.py   (Pillow, numpy, scipy)"""
import json, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).parent))
import base, figures

ROOT = base.ROOT; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'; HERE = Path(__file__).parent
P = figures.PATHS
TITLE = {'laterne': 'Aschenprotokollant', 'faden': 'Bruchhefter', 'maske': 'Rollenverwahrer', 'echo': 'Nachrufgefäß', 'kessel': 'Kreislaufgefäß',
         'eisen': 'Gegenlast', 'schluessel': 'Riegelabwesenheit', 'sq_waage': 'Saldenhüter', 'sq_moor': 'Namensediment', 'sq_uhr': 'Fristlauscher'}
FORM = {'laterne': 'Leuchtgestalt', 'faden': 'Nahtgespinst', 'maske': 'Hundertmiene', 'echo': 'Hohlklang', 'kessel': 'Siedeleib',
        'eisen': 'Nietkoloss', 'schluessel': 'Türhüter', 'sq_waage': 'Gewichtsträger', 'sq_moor': 'Torfleib', 'sq_uhr': 'Pendelgestalt'}
HALO = {'laterne': 'Ring aus Gaslaternen', 'faden': 'Fadenring mit Nadel', 'maske': 'Maskenkranz', 'echo': 'Glockenkranz', 'kessel': 'Kesselring',
        'eisen': 'Nietenring/Eisenrad', 'schluessel': 'Schlüsselkranz um großen Schlüssel', 'sq_waage': 'Goldring mit Waage',
        'sq_moor': 'Ring aus Schilf und Torf', 'sq_uhr': 'Zifferblatt-Ring mit Pendel'}
TQ_MAX = 0.003        # Türkis sparsam: höchstens 0,3 % der Figurpixel

def tq_limit(s):
    fg = s >= 0; n = int(fg.sum()); t = s == base.TQ; k = int(t.sum()); lim = int(TQ_MAX * n)
    if k <= lim: return s, k, 0
    # Überschuss in Bein-/Seegrün-Ton umfärben (nächste Nicht-Türkis-Farbe), von unten nach oben – Lichtpunkte oben bleiben
    alt = base.nearest_idx(base.PAL[base.TQ][None, None, :], [c for c in base.FIGURE_COLORS if c != base.TQ])[0, 0]
    ys, xs = np.nonzero(t); order = np.argsort(-ys)
    drop = order[:k - lim]; s = s.copy(); s[ys[drop], xs[drop]] = alt
    return s, lim, k - lim

def build(p):
    base.set_path(p)
    s, D, F, FAIL = figures.battle_sheet(p)
    s, tq, tqfix = tq_limit(s)
    return p, s, D, F, FAIL, tq, tqfix

def sheet_palette(s):
    used = sorted(int(v) for v in np.unique(s) if v >= 0)
    assert len(used) <= 32, len(used)
    return used

def save_indexed(s, used, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    lut = np.zeros(len(base.PAL) + 1, np.uint8)
    for i, g in enumerate(used): lut[g + 1] = i + 1
    im = Image.fromarray(lut[s + 1], 'P')
    pal = [0, 0, 0] + [int(v) for g in used for v in base.PAL[g]]
    im.putpalette(pal + [0] * (768 - len(pal))); im.info['transparency'] = 0
    im.save(path, transparency=0, optimize=True)

def rgba(a):
    Pp = np.vstack([base.PAL, [[0, 0, 0]]]).astype(np.uint8)
    return Image.fromarray(np.dstack([Pp[a], (a >= 0) * 255]).astype(np.uint8), 'RGBA')

def on_bg(im, col=(70, 64, 90)):
    bg = Image.new('RGBA', im.size, col + (255,)); bg.alpha_composite(im.convert('RGBA')); return bg

def grid(im, cw, ch, S, col=(95, 88, 120)):
    d = ImageDraw.Draw(im); W, H = im.size
    for x in range(cw * S, W, cw * S): d.line([(x, 0), (x, H)], fill=col)
    for y in range(ch * S, H, ch * S): d.line([(0, y), (W, y)], fill=col)
    return im

def save_small(im, path):
    im.convert('RGB').convert('P', palette=Image.Palette.ADAPTIVE, colors=256).save(path, optimize=True)

def label(d, xy, t): d.text(xy, t, fill=(235, 225, 200))

def main():
    with ProcessPoolExecutor(5) as ex:
        res = list(ex.map(build, P))
    man_h = {a['id']: a for a in json.loads((SPR / 'manifest-halbgott.json').read_text())['assets']}
    man = dict(version=1, batch='heilige', codex='docs/art/codex_CO_halbgott_grafik.md (Style-Block 0.1 vollständig vor jedem Prompt)',
               status='exported; Einbau ausstehend (siehe PROPOSAL-einbau.md)', paletteMaxVisibleColors=32, palette=base.PAL_HEX,
               paletteNote=('Gesamtpalette = manifest-halbgott.json (32) + Gewandtöne in der Pfadfarbe; jedes Blatt nutzt höchstens 32 davon '
                            '(eigene indizierte PNG-Palette je Blatt, siehe assets[].palette). Warmes Bein-Weiß #eee2c5 statt Weiß, Türkis <= 0,3 %.'),
               facingNote=('Vorlagen hg_battle_* schauen nach rechts; die Heiligen sind zellweise gespiegelt und schauen nach links (zum Spieler), '
                           'wie Gegnerblätter enemy_*. Falls die Engine die Halbgott-Blätter selbst spiegelt: Einbau-Hinweis in PROPOSAL-einbau.md.'),
               assets=[])
    gen = dict(batch='heilige', method=(
        'Ein Konzeptbild je Pose und Figur (7 Posen: idle, attack1=Ausholen, strike=Lichtklinge, attack2=Lichtkette, special=brennender Segen, hurt, defeated; '
        'Magenta-Grund, Style-Block CO 0.1 vorangestellt, Identitätsreferenz = Vorlagen-Frame bzw. eigenes idle-Konzept + Pfadsymbol). '
        'Umsetzung: Median 5, Magenta-Key, ganzzahliger Blockfaktor (ein Faktor je Pfad für alle Posen), Lab-Palettenabbildung, Aufräumen, Inseln weg, '
        'Außenumriss #1a1c2c. Jeder Frame einzeln gesetzt: Pose + ganzzahlige Variante (Atemzeile löschen/doppeln, 1-2px Neigung, Lichtpuls durch Umfärben). '
        'Keine Füllmittel: weder Bodenschein noch Lichtbögen noch prozedurale Formen. Auswahl je Frame über die Kern-Box-Regel (siehe fillRule).'),
        prompts=json.loads((HERE / 'prompts.json').read_text()),
        fillRule=dict(threshold=figures.FILL, measure='Kern-Box: Alpha-Maske, binäres Öffnen 3x3, größte Komponente; Breite und Höhe; Vorlage und neu identisch behandelt'),
        sheets={})
    for p, s, D, F, FAIL, tq, tqfix in res:
        assert not FAIL, (p, FAIL)
        used = sheet_palette(s)
        save_indexed(s, used, SPR / f'battle/enemy_hs_heiliger_{p}.png')
        t = man_h[f'hg_battle_{p}']
        e = dict(id=f'enemy_hs_heiliger_{p}', file=f'battle/enemy_hs_heiliger_{p}.png', gameId=f'hs_heiliger_{p}', path=p,
                 name=f'Heiliger der Höfe – {TITLE[p]}', form=FORM[p], halo=HALO[p], template=t['file'])
        for k in ('width', 'height', 'kind', 'transparent', 'frameWidth', 'frameHeight', 'columns', 'rows', 'animations', 'anticipationHoldFrames'): e[k] = t[k]
        e.update(baseline=figures.FOOT, facing='left', occupiedCounts=[6] * 6, replacesTint='#fff0c0', palette=[base.PAL_HEX[g] for g in used])
        man['assets'].append(e)
        gen['sheets'][p] = dict(file=f'public/sprites/battle/enemy_hs_heiliger_{p}.png', factors=F, colors=len(used),
                                turquoisePixels=tq, turquoiseRecolored=tqfix,
                                raw=[f'{p}_kampf_{q}.jpg' for q in figures.POSES],
                                frames=[dict(index=r * 6 + c, row=r, col=c, pose=d) for (r, c), d in sorted(D.items())])
    (SPR / 'manifest-heilige.json').write_text(json.dumps(man, indent=2, ensure_ascii=False) + '\n')
    (ART / 'batch-heilige-generation.json').write_text(json.dumps(gen, indent=2, ensure_ascii=False) + '\n')
    previews(res)
    print('ok', {p: (len(sheet_palette(s)), tq, tqfix) for p, s, D, F, FAIL, tq, tqfix in res})

def previews(res):
    S = 3; colw = 576 * S + 24
    bt = [(f'battle/enemy_hs_heiliger_{p}.png – {TITLE[p]} – 576x576, 96x96 x 6x6 (idle / attack1 / attack2 / special / hurt / defeated) 3x',
           grid(on_bg(rgba(s)).resize((576 * S, 576 * S), Image.NEAREST), 96, 96, S)) for p, s, *_ in res]
    W = 20 + 3 * colw; H = 4 * (576 * S + 40) + 20
    pv = Image.new('RGBA', (W, H), (40, 38, 52, 255)); d = ImageDraw.Draw(pv)
    for i, (t, im) in enumerate(bt):
        x = 20 + (i % 3) * colw; y = 10 + (i // 3) * (576 * S + 40)
        label(d, (x, y), t); pv.alpha_composite(im, (x, y + 22))
    save_small(pv, ART / 'batch-heilige-preview.png')
    # Vorlage | neu (1x, zwei Blätter je Zeile)
    W = 2 * (576 * 2 + 16) + 48; H = 5 * (576 + 40) + 20
    vn = Image.new('RGBA', (W, H), (40, 38, 52, 255)); d = ImageDraw.Draw(vn)
    for i, (p, s, *_) in enumerate(res):
        x = 16 + (i % 2) * (576 * 2 + 32); y = 10 + (i // 2) * (576 + 40)
        label(d, (x, y), f'{p}: Vorlage battle/hg_battle_{p}.png | neu battle/enemy_hs_heiliger_{p}.png')
        vn.alpha_composite(on_bg(Image.open(SPR / f'battle/hg_battle_{p}.png')), (x, y + 18))
        vn.alpha_composite(on_bg(rgba(s)), (x + 576 + 16, y + 18))
    save_small(vn, ART / 'batch-heilige-vorlage-neu.png')

if __name__ == '__main__':
    main()
