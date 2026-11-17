#!/usr/bin/env python3
"""Batch gebietsbosse (Codex DX): vier Dunscar-Gebietsbosse, Kampfblatt + Auftrittsbild 160x160.

Ablauf je Boss:
1. Konzeptbild (docs/art/gebietsbosse-raw/<name>_konzept.jpg, image_gen, Style-Block vorangestellt) mit
   ganzzahligem Blockfaktor aufs Zielraster (ein Motivpixel = ein Block, Kern-Mehrheit), Palette dunscar3, binäres Alpha,
   1px Außenumriss #1a1c2c  ->  Basis-Sprite.
2. Jede Pose einzeln: Teil-Versatz (ganzzahlig), zeilenweise Neigung, Stauchung der Beine, plus pro Frame gezeichnete
   Effekte (Funken, Kalksplitter, Schallringe, Lampenkegel, Kette). Raster/Reihen/Fußlinie exakt wie die Vorlage.
3. Auftrittsbild: eigenes, feineres Motiv aus demselben Konzept (kleinerer ganzzahliger Faktor), unten 8px Rand.
Ausgabe: PNGs (indiziert, Index 0 transparent), manifest-gebietsbosse.json, generation.json, Vorschau.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).parent))
import base
from bosses import BOSSES

ROOT = base.ROOT; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'
SHEET_FACTOR = {'weichenfresser': 12, 'bruchmeister': 12, 'schluchtrufer': 11, 'tiefenvorarbeiter': 9}
PORTRAIT_FACTOR = {'weichenfresser': 8, 'bruchmeister': 7, 'schluchtrufer': 7, 'tiefenvorarbeiter': 6}
PORTRAIT_EXTRA = {'weichenfresser': [16, 17]}
COUNTS = {'idle': 4, 'attack': 6, 'hurt': 3, 'defeated': 4, 'phase1': 6, 'phase2': 6, 'phase3': 6}
NAMES = {'weichenfresser': 'Weichenfresser', 'bruchmeister': 'Bruchmeister', 'schluchtrufer': 'Schluchtrufer', 'tiefenvorarbeiter': 'Tiefenvorarbeiter'}

def save_indexed(a, path):
    """Index 0 = transparent, 1..32 = dunscar3-Palette (wie die Vorlagen: Modus P, transparency 0)."""
    img = Image.fromarray((a + 1).astype(np.uint8), 'P')
    pal = [0, 0, 0] + [int(v) for rgb in base.PAL for v in rgb]
    img.putpalette(pal + [0] * (768 - len(pal)))
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, transparency=0, optimize=True)

def rgba(a):
    H, W = a.shape; im = np.zeros((H, W, 4), np.uint8); m = a >= 0
    im[m, :3] = base.PAL[a[m]]; im[m, 3] = 255
    return Image.fromarray(im, 'RGBA')

def build_sheet(name):
    cfg = BOSSES[name]
    b = base.build_base(name, SHEET_FACTOR[name])
    frames, desc = cfg['fn'](b)
    fw, fh = cfg['fw'], cfg['fh']
    sheet = np.full((fh * len(cfg['rows']), fw * 6), -1, np.int32)
    for r, row in enumerate(cfg['rows']):
        for i in range(COUNTS[row]):
            sheet[r*fh:(r+1)*fh, i*fw:(i+1)*fw] = frames[(row, i)]
    return sheet, desc, b.shape

def build_portrait(name):
    base.SUBSETS[name] = base.SUBSETS[name] + PORTRAIT_EXTRA.get(name, [])
    a = base.build_base(name, PORTRAIT_FACTOR[name])
    H, W = a.shape; assert H <= 152 and W <= 158, (name, a.shape)
    cell = np.full((160, 160), -1, np.int32)
    cell[160 - 8 - H:160 - 8, (160 - W) // 2:(160 - W) // 2 + W] = a
    return cell

def template_entry(cfg):
    m = json.loads((SPR / 'manifest-dunscar3.json').read_text())
    return next(a for a in m['assets'] if a['id'] == cfg['template'])

def main():
    prompts = json.loads((Path(__file__).parent / 'prompts.json').read_text())
    manifest = dict(version=1, batch='gebietsbosse', codex='docs/art/codex_DX_dunscar_gebietsbosse.md',
                    status='exported; runtime integration pending (assets.js mappt ds_gb_* noch auf die Story-Boss-Sheets)',
                    paletteMaxVisibleColors=32, palette=json.loads((SPR / 'manifest-dunscar3.json').read_text())['palette'], assets=[])
    gen = dict(batch='gebietsbosse', method='image_gen Konzept je Boss (Style-Block vorangestellt) -> ganzzahliger Blockfaktor aufs Zielraster -> '
               'jede Pose einzeln per Skript aus Teilen + Effekten gezeichnet (kein Gesamtsheet generiert)',
               styleBlock=prompts['style'], postprocess=['Median 5px auf dem Konzept (JPEG-Rauschen), Magenta-Freistellung',
               'ganzzahliger Blockfaktor (Kern-Mehrheit je Block = ein Motivpixel), Phasenlage mit minimaler Blockvarianz',
               'Palette dunscar3 (32 Farben), je Boss Teilmenge', 'binäres Alpha, isolierte Pixel entfernt, 1px Löcher gefüllt',
               '1px Außenumriss #1a1c2c, nach jeder Pose neu geschlossen', 'Fußlinie y=93 (bbox unten 94) wie Vorlage',
               'Ausholpose = zwei identische Frames (heldRows)', 'leere Zellen voll transparent'], bosses={})
    previews = []
    for name, cfg in BOSSES.items():
        gid = f'ds_gb_{name}'; tpl = template_entry(cfg)
        sheet, desc, bshape = build_sheet(name)
        battle = f'battle/enemy_{gid}.png'; save_indexed(sheet, SPR / battle)
        portrait = build_portrait(name); ui = f'ui/DS_boss_{gid}.png'; save_indexed(portrait, SPR / ui)
        entry = {k: tpl[k] for k in ('width', 'height', 'transparent', 'kind', 'frameWidth', 'frameHeight', 'columns', 'rows', 'baseline',
                                     'occupiedCounts', 'heldRows', 'facing', 'animations')}
        manifest['assets'].append(dict(id=f'enemy_{gid}', file=battle, gameId=gid, name=NAMES[name], template=f"battle/{cfg['template']}.png",
                                       rowNames=cfg['rows'], **entry, defeatMeaning='defeated'))
        manifest['assets'].append(dict(id=f'DS_boss_{gid}', file=ui, width=160, height=160, transparent=True, gameId=gid, kind='bossBand',
                                       frameWidth=160, frameHeight=160, columns=1, rows=1, template=f"ui/DS_boss_{cfg['base']}.png",
                                       derivedFrom=prompts['concepts'][name]['raw'], note='eigenes Motiv aus dem Konzept, Blockfaktor %d' % PORTRAIT_FACTOR[name]))
        frames = []
        for r, row in enumerate(cfg['rows']):
            for i in range(COUNTS[row]):
                frames.append(dict(index=r * 6 + i, row=row, frame=i, pose=desc[(row, i)]))
        c = prompts['concepts'][name]
        gen['bosses'][gid] = dict(template=f"battle/{cfg['template']}.png", raw=c['raw'], reference=c['reference'], aspectRatio=c['aspect'],
                                  conceptPrompt=c['prompt'], sheetBlockFactor=SHEET_FACTOR[name], baseSpriteSize=[bshape[1], bshape[0]],
                                  portraitBlockFactor=PORTRAIT_FACTOR[name], frames=frames,
                                  portrait=dict(file=ui, prompt='identisch mit conceptPrompt (gleiches Rohbild), feinerer Blockfaktor'))
        previews.append((gid, sheet, portrait, cfg))
    (SPR / 'manifest-gebietsbosse.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    (ART / 'batch-gebietsbosse-generation.json').write_text(json.dumps(gen, indent=2, ensure_ascii=False) + '\n')
    make_preview(previews)

def make_preview(previews, s=3):
    """Alle Frames in 3-facher Größe, je Boss Vorlage-Zeile 0 links daneben zum Vergleich der Verwandtschaft, dazu Auftrittsbild."""
    blocks = []
    for gid, sheet, portrait, cfg in previews:
        im = rgba(sheet); tpl = Image.open(SPR / f"battle/{cfg['template']}.png").convert('RGBA')
        tpl0 = tpl.crop((0, 0, cfg['fw'], cfg['fh']))
        w = im.width * s + 20 + 160 * s; h = max(im.height * s, 160 * s + cfg['fh'] * s + 20) + 30
        blk = Image.new('RGBA', (w, h), (58, 52, 70, 255)); d = ImageDraw.Draw(blk)
        d.text((6, 6), f'{gid}  ({cfg["fw"]}x{cfg["fh"]}, Reihen: {", ".join(cfg["rows"])})   rechts unten: Vorlage {cfg["template"]} Frame 0', fill=(231, 223, 197, 255))
        bg = Image.new('RGBA', im.size, (90, 76, 104, 255))
        for y in range(0, im.height, cfg['fh']):
            for x in range(0, im.width, cfg['fw']):
                if ((x // cfg['fw']) + (y // cfg['fh'])) % 2: bg.paste((84, 70, 98, 255), (x, y, x + cfg['fw'], y + cfg['fh']))
        bg.alpha_composite(im); blk.paste(bg.resize((im.width * s, im.height * s), Image.NEAREST), (0, 30))
        pb = Image.new('RGBA', (160, 160), (90, 76, 104, 255)); pb.alpha_composite(rgba(portrait))
        blk.paste(pb.resize((160 * s, 160 * s), Image.NEAREST), (im.width * s + 20, 30))
        tb = Image.new('RGBA', tpl0.size, (70, 62, 80, 255)); tb.alpha_composite(tpl0)
        blk.paste(tb.resize((cfg['fw'] * s, cfg['fh'] * s), Image.NEAREST), (im.width * s + 20, 30 + 160 * s + 20))
        blocks.append(blk)
    W = max(b.width for b in blocks); H = sum(b.height + 10 for b in blocks)
    out = Image.new('RGBA', (W, H), (40, 38, 48, 255)); y = 0
    for b in blocks: out.paste(b, (0, y)); y += b.height + 10
    out.save(ART / 'batch-gebietsbosse-preview.png', optimize=True)

if __name__ == '__main__':
    main()
