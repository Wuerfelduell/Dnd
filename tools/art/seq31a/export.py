#!/usr/bin/env python3
"""Export Batch seq31a (Codex DC1, nur Abschnitte 2 und 3):
- fx/HG_aufstieg_3.png, fx/HG_aufstieg_1.png: je 8 Frames 240x135, opak, eine Reihe (1920x135), Raster wie fx/HG_aufstieg_4.png
- characters/hg_form_<pfad>_still.png: 128x192, 32x48, 4x4 (Raster exakt wie characters/hg_form_<pfad>.png, Grundlinie 46)
- battle/hg_form_<pfad>_still.png: 576x576, 96x96, 6x6 (Raster exakt wie battle/hg_battle_<pfad>.png, Fußlinie 93)
Ein Konzeptbild je Pose und Figur (docs/art/seq31a-raw/), jede Pose einzeln per Skript gesetzt (figures.py, aufstieg.py),
ganzzahlig NN, Palette indiziert (manifest-halbgott, 32), binäres Alpha, 1px Umriss #1a1c2c.
Aufruf: python3 tools/art/seq31a/export.py   (Pillow, numpy, scipy)"""
import json, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).parent))
import base, figures, aufstieg

ROOT = base.ROOT; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'; HERE = Path(__file__).parent
P = figures.PATHS
FORM = {'laterne': 'Leuchtgestalt', 'faden': 'Nahtgespinst', 'maske': 'Hundertmiene', 'echo': 'Hohlklang', 'kessel': 'Siedeleib',
        'eisen': 'Nietkoloss', 'schluessel': 'Türhüter', 'sq_waage': 'Gewichtsträger', 'sq_moor': 'Torfleib', 'sq_uhr': 'Pendelgestalt'}
CALM = {'laterne': 'Flamme ohne Flackern, Glas klar', 'faden': 'offene, gelöste Fäden', 'maske': 'ein einziges, eigenes Gesicht vorn',
        'echo': 'Kehlen still, die Luft steht', 'kessel': 'Flüssigkeiten klar, kein Dampf', 'eisen': 'trägt eine Brücke statt sie zu sein',
        'schluessel': 'Tür in der Brust weit offen, warmes Licht', 'sq_waage': 'Waagarme im Gleichgewicht, Ketten locker',
        'sq_moor': 'Namen in den Schichten hell', 'sq_uhr': 'beide Umrisse decken sich'}

def save_indexed(a, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray((a + 1).astype(np.uint8), 'P')
    pal = [0, 0, 0] + [int(v) for v in base.PAL.flatten()]
    im.putpalette(pal + [0] * (768 - len(pal))); im.info['transparency'] = 0
    im.save(path, transparency=0, optimize=True)

def save_opaque(a, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray(a.astype(np.uint8), 'P')
    pal = [int(v) for v in base.PAL.flatten()]
    im.putpalette(pal + [0] * (768 - len(pal)))
    im.save(path, optimize=True)

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
    im = im.convert('RGB')
    q = im.quantize(256, method=Image.Quantize.FASTOCTREE) if len(im.getcolors(1 << 16) or []) == 0 else im.convert('P', palette=Image.Palette.ADAPTIVE, colors=256)
    q.save(path, optimize=True)

def build(p):
    tb = figures.load_template(SPR / f'battle/hg_battle_{p}.png')
    tm = figures.load_template(SPR / f'characters/hg_form_{p}.png')
    bs, bd, bfx = figures.battle_sheet(p, tb)
    ms, md, mfx, mf = figures.map_sheet(p, tm)
    return p, bs, bd, bfx, ms, md, mfx, mf

def main():
    with ProcessPoolExecutor(5) as ex:
        res = list(ex.map(build, P))
    f3, t3 = aufstieg.seq3(); f1, t1, fac1 = aufstieg.seq1()
    man_h = {a['id']: a for a in json.loads((SPR / 'manifest-halbgott.json').read_text())['assets']}
    man = dict(version=1, batch='seq31a', codex='docs/art/codex_DC1_seq31_gestalten.md (nur Abschnitte 2 und 3)',
               status='exported; Einbau ausstehend (siehe PROPOSAL-einbau.md)', paletteMaxVisibleColors=32, palette=base.PAL_HEX,
               paletteNote='Palette unverändert aus manifest-halbgott.json; Endgestalten ohne Türkis #6fe0d0 (Codex: kein Türkis-Gewitter), Licht in Amber/Bein-Weiß',
               gridNote='Raster exakt wie die Vorlagen (Auftrag „Raster der Vorlage exakt“): Kampf 6x6 wie hg_battle_<pfad> statt 6x4 (Codex), Karte 4 Frames je Richtung wie hg_form_<pfad> statt 2 (Codex)',
               paths={}, assets=[])
    gen = dict(batch='seq31a', method=(
        'Ein Konzeptbild je Pose und Figur (Magenta-Grund, Style-Block aus Codex DC1 0.1 vorangestellt, Identitätsreferenz = CO-Vorlage). '
        'Umsetzung: Median 5, Magenta-Key, ganzzahliger Blockfaktor (Kern-Mehrheit, Phasensuche), Lab-Palettenabbildung, Aufräumen, Inseln weg, '
        'Außenumriss #1a1c2c. Jeder Frame einzeln gesetzt (Atem durch Löschen/Doppeln einer Hüftzeile, 1px Neigung, Lichtpuls durch Umfärben, '
        'Stauchen des Unterkörpers) mit eigenen ruhigen Lichteffekten. Vollbilder: Szenen-Konzept -> ganzzahlige 5er-Blöcke (Mittelausschnitt 1200x675), '
        'Mehrheitsfarbe je Block, Überblendungen in RGB vor dem Indizieren; Seq 3 prozedural.'),
        prompts=json.loads((HERE / 'prompts.json').read_text()), fillRule=dict(threshold=0.85, designTarget=figures.FILL), sheets={})
    for p, bs, bd, bfx, ms, md, mfx, mf in res:
        save_indexed(ms, SPR / f'characters/hg_form_{p}_still.png')
        save_indexed(bs, SPR / f'battle/hg_form_{p}_still.png')
        tmap = man_h[f'hg_form_{p}']; tbat = man_h[f'hg_battle_{p}']
        e_map = dict(id=f'hg_form_{p}_still', file=f'characters/hg_form_{p}_still.png', path=p, form=FORM[p], template=tmap['file'])
        for k in ('width', 'height', 'kind', 'transparent', 'frameWidth', 'frameHeight', 'columns', 'rows', 'baseline', 'animations'): e_map[k] = tmap[k]
        e_map['directions'] = ['down', 'left', 'right', 'up']; e_map['rightIsMirrorOfLeft'] = True
        e_bat = dict(id=f'hg_form_{p}_still_battle', file=f'battle/hg_form_{p}_still.png', path=p, form=FORM[p], template=tbat['file'])
        for k in ('width', 'height', 'kind', 'transparent', 'frameWidth', 'frameHeight', 'columns', 'rows', 'animations', 'anticipationHoldFrames'): e_bat[k] = tbat[k]
        e_bat.update(baseline=figures.BFOOT, facing='right', occupiedCounts=[6] * 6,
                     rowMeaning=dict(idle='ruhiger Stand', attack1='abwehrende offene Hand (ruhige Geste)', attack2='Darreichen, Handflächen nach oben',
                                     special='„Schließen“: Frames 20/21 schlichter Mensch, danach wieder die Gestalt',
                                     hurt='idle mit kleinerer Haltung (nicht verletzt)', defeated='idle, Haltung sinkt (kein Tod)'),
                     codexRows=dict(idle=[0, 1, 2, 3, 4, 5], special=[18, 19, 20, 21, 22, 23], hurt=[24, 25, 26, 27, 28, 29], defeated=[30, 31, 32, 33, 34, 35]))
        man['assets'] += [e_map, e_bat]
        man['paths'][p] = dict(form=FORM[p], calm=CALM[p], map=e_map['id'], battle=e_bat['id'],
                               formTemplates=dict(map=f'characters/hg_form_{p}.png', battle=f'battle/hg_battle_{p}.png'))
        gen['sheets'][p] = dict(
            map=dict(file=f'public/sprites/characters/hg_form_{p}_still.png', factor=mf, raw=f'{p}_karte_ansichten.jpg',
                     frames=[dict(index=r * 4 + c, row=r, col=c, pose=d, effects=mfx[(r, c)]) for (r, c), d in sorted(md.items())]),
            battle=dict(file=f'public/sprites/battle/hg_form_{p}_still.png', factor=figures.BF[p], humanFactor=figures.HUMAN_F,
                        raw=[f'{p}_kampf_idle.jpg', f'{p}_kampf_attack1.jpg', f'{p}_kampf_attack2.jpg', 'mensch_kampf_schliessen.jpg'],
                        frames=[dict(index=r * 6 + c, row=r, col=c, pose=d, effects=bfx[(r, c)]) for (r, c), d in sorted(bd.items())]))
    ta = man_h['HG_aufstieg_4']
    for seq, fr, txt, rate in ((3, f3, t3, 8), (1, f1, t1, 6)):
        sheet = np.concatenate(fr, 1); save_opaque(sheet, SPR / f'fx/HG_aufstieg_{seq}.png')
        e = dict(id=f'HG_aufstieg_{seq}', file=f'fx/HG_aufstieg_{seq}.png', template=ta['file'])
        for k in ('width', 'height', 'kind', 'transparent', 'frameWidth', 'frameHeight', 'columns', 'rows'): e[k] = ta[k]
        e['animations'] = dict(ascend=dict(frames=list(range(8)), frameRate=rate, repeat=0))
        e['note'] = ('wie HG_aufstieg_4, kürzer (frameRate 8 statt 6, Höhepunkt schon in Frame 2/3), ohne Furcht-Welle (keine Risse)' if seq == 3 else
                     'Blick des Spielers: Zollregister-Raum wird hell, Zeugen am Rand, endet leer und hell; kein Effekt-Feuerwerk, kein Türkis')
        man['assets'].append(e)
        gen['sheets'][f'aufstieg_{seq}'] = dict(file=f'public/sprites/fx/HG_aufstieg_{seq}.png',
                                                source='prozedural' if seq == 3 else ['aufstieg1_a.jpg', 'aufstieg1_b.jpg', 'aufstieg1_c.jpg'],
                                                blockFactor=None if seq == 3 else fac1, frames=[dict(index=i, content=t) for i, t in enumerate(txt)])
    (SPR / 'manifest-seq31a.json').write_text(json.dumps(man, indent=2, ensure_ascii=False) + '\n')
    (ART / 'batch-seq31a-generation.json').write_text(json.dumps(gen, indent=2, ensure_ascii=False) + '\n')
    previews(res, f3, f1)
    print('ok', {p: (figures.BF[p], mf) for p, *_, mf in res})

def label(d, xy, t): d.text(xy, t, fill=(235, 225, 200))

def previews(res, f3, f1):
    S = 3
    # ---- alle Frames 3x
    asc = [(f'fx/HG_aufstieg_3.png (1920x135, 8x 240x135, opak) 3x', grid(rgba(np.concatenate(f3, 1)).convert('RGBA'), 240, 135, 1).resize((5760, 405), Image.NEAREST)),
           (f'fx/HG_aufstieg_1.png (1920x135, 8x 240x135, opak) 3x', rgba(np.concatenate(f1, 1)).resize((5760, 405), Image.NEAREST))]
    bt = [(f'battle/hg_form_{p}_still.png – 576x576, 96x96 x 6x6 (idle / attack1 / attack2 / special=Schließen / hurt / defeated) 3x',
           grid(on_bg(rgba(bs)).resize((576 * S, 576 * S), Image.NEAREST), 96, 96, S)) for p, bs, *_ in res]
    mp = [(f'characters/hg_form_{p}_still.png 3x', grid(on_bg(rgba(r[4])).resize((128 * S, 192 * S), Image.NEAREST), 32, 48, S)) for p, *_ in [(x[0],) for x in res] for r in [next(y for y in res if y[0] == p)]]
    W = 5760 + 40; colw = 576 * S + 24
    H = 2 * (405 + 40) + 4 * (576 * S + 40) + (192 * S + 40) + 40
    pv = Image.new('RGBA', (W, H), (40, 38, 52, 255)); d = ImageDraw.Draw(pv); y = 10
    for t, im in asc: label(d, (20, y), t); pv.alpha_composite(im.convert('RGBA'), (20, y + 22)); y += 405 + 40
    for i, (t, im) in enumerate(bt):
        x = 20 + (i % 3) * colw
        if i and i % 3 == 0: y += 576 * S + 40
        label(d, (x, y), t); pv.alpha_composite(im, (x, y + 22))
    y += 576 * S + 40
    for i, (t, im) in enumerate(mp):
        x = 20 + i * (128 * S + 12); label(d, (x, y + (i % 2) * 11), t); pv.alpha_composite(im, (x, y + 24))
    save_small(pv, ART / 'batch-seq31a-preview.png')
    # ---- Vorlage | neu (2x)
    S2 = 1
    rows = []
    ta = Image.open(SPR / 'fx/HG_aufstieg_4.png').convert('RGBA')
    rows.append(('Aufstieg: Vorlage fx/HG_aufstieg_4.png | neu HG_aufstieg_3 | neu HG_aufstieg_1', [ta, rgba(np.concatenate(f3, 1)), rgba(np.concatenate(f1, 1))], 'v'))
    for p, bs, bd, bfx, ms, *_ in res:
        rows.append((f'{p} ({FORM[p]}): Vorlage battle/hg_battle_{p}.png | neu battle/hg_form_{p}_still.png | Vorlage characters/hg_form_{p}.png | neu characters/hg_form_{p}_still.png',
                     [on_bg(Image.open(SPR / f'battle/hg_battle_{p}.png')), on_bg(rgba(bs)), on_bg(Image.open(SPR / f'characters/hg_form_{p}.png')), on_bg(rgba(ms))], 'h'))
    W = max(1920, 576 * 2 + 128 * 2 + 3 * 16) + 32
    H = 30 + 3 * 145 + 10 + sum(576 + 40 for _ in res) + 20
    vn = Image.new('RGBA', (W, H), (40, 38, 52, 255)); d = ImageDraw.Draw(vn); y = 10
    for t, ims, mode in rows:
        label(d, (16, y), t); y += 20
        if mode == 'v':
            for im in ims: vn.alpha_composite(im.convert('RGBA'), (16, y)); y += 145
            y += 10
        else:
            x = 16
            for im in ims: vn.alpha_composite(im.convert('RGBA'), (x, y)); x += im.size[0] + 16
            y += 576 + 20
    save_small(vn, ART / 'batch-seq31a-vorlage-neu.png')

if __name__ == '__main__':
    main()
