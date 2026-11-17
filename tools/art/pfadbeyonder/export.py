#!/usr/bin/env python3
"""Batch pfadbeyonder (Codex DY, nur ez_torfmutter und ez_schleusenuhr): Lauf-Sheet 64x128, Kopf 24x24, Kampfblatt 288x240.

Je Figur sieben Konzeptbilder (docs/art/pfadbeyonder-raw/, Style-Block vorangestellt): Kampf idle / attack1 (Ausholen) /
strike (Schlag) / attack2 (Pfad-Motiv) und ein Ansichtsbogen vorn|seitlich|hinten, der in drei Einzelmotive getrennt wird.
Jedes Motiv: Lab-Palettenabgleich, ganzzahliger Blockfaktor (ein Motivpixel = ein Block), binäres Alpha, 1px Umriss #1a1c2c,
kleine Handretusche (Augen, Lupenbrille). Frames werden einzeln per Skript gesetzt (figures.py).

Die Lauf-Sheets ersetzen laut Codex die vorhandenen Platzhalter characters/ph_<id>_walk.png. Weil in diesem Paket keine
bestehende Datei unter public/ geändert wird, liegen sie unter docs/art/pfadbeyonder-ersatz/characters/ und werden beim
Einbau über die Platzhalter kopiert.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).parent))
import base, figures

ROOT = base.ROOT; SPR = ROOT / 'public/sprites'; ART = ROOT / 'docs/art'; STAGE = ART / 'pfadbeyonder-ersatz'
FIGS = {'torfmutter': dict(id='ez_torfmutter', name='Wenna Kolk, Torfmutter (Moor)', template_battle='enemy_ez_ds_kalkbrennerin', walk_factor=23, head=(11, (70, 285))),
        'schleusenuhr': dict(id='ez_schleusenuhr', name='Corvin Hake, Schleusenuhrmacher (Uhr)', template_battle='enemy_ez_ds_rangierer', walk_factor=25, head=(9, (45, 245)))}
BATTLE_FACTOR = 22; GAIN_BATTLE = (1.3, 1.2); GAIN_WALK = (1.35, 1.2); GAIN_HEAD = (1.3, 1.15)

def save_indexed(a, path):
    img = Image.fromarray((a + 1).astype(np.uint8), 'P')
    pal = [0, 0, 0] + [int(v) for rgb in base.PAL for v in rgb]
    img.putpalette(pal + [0] * (768 - len(pal))); path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, transparency=0, optimize=True)

def rgba(a):
    H, W = a.shape; im = np.zeros((H, W, 4), np.uint8); m = a >= 0
    im[m, :3] = base.PAL[a[m]]; im[m, 3] = 255
    return Image.fromarray(im, 'RGBA')

def motif(key, file, factor, box, gain):
    m = base.motif(base.RAW / file, factor, box, gain)
    if key in figures.RETOUCH: m = figures.RETOUCH[key](m)
    return m

def build(fig):
    cfg = FIGS[fig]
    P = {p: motif(f'{fig}_{p}', f'{fig}_kampf_{p}.jpg', BATTLE_FACTOR, None, GAIN_BATTLE) for p in ('idle', 'attack1', 'strike', 'attack2')}
    views = base.split_views(base.RAW / f'{fig}_lauf_ansichten.jpg')
    V = {v: motif(f'{fig}_walk_{v}', f'{fig}_lauf_ansichten.jpg', cfg['walk_factor'], b, GAIN_WALK) for v, b in zip(('down', 'left', 'up'), views)}
    hf, (hy0, hy1) = cfg['head']; hb = views[0]
    Hm = motif(f'{fig}_head', f'{fig}_lauf_ansichten.jpg', hf, (hb[0], hy0, hb[2], hy1), GAIN_HEAD)
    walk, wdesc = figures.walk_sheet(V)
    head = figures.head(Hm)
    battle, bdesc = figures.battle_sheet(fig, P)
    return walk, wdesc, head, battle, bdesc, views

def main():
    prompts = json.loads((Path(__file__).parent / 'prompts.json').read_text())
    tman = {a['id']: a for a in json.loads((SPR / 'manifest-dunscar5.json').read_text())['assets']}
    man = dict(version=1, batch='pfadbeyonder', codex='docs/art/codex_DY_wexmoor_pfadbeyonder.md', scope='nur ez_torfmutter und ez_schleusenuhr (Maud Keel ausgenommen)',
               status='exported; Einbau ausstehend (assets.js: ENCOUNTER_SHEETS ez_torfmutter/ez_schleusenuhr zeigen noch auf Dunscar-Blätter)',
               paletteMaxVisibleColors=32, palette=base.PAL_HEX,
               paletteNote='manifest-figuren_nachzuegler.json (Wexmoor-Figuren, Maud Keel) mit #2a2a40->#6fe0d0 und #34333a->#8eb5a7 für Okkultes', assets=[])
    gen = dict(batch='pfadbeyonder', styleBlock=prompts['style'],
               method='Konzeptbild je Kampfpose und je Ansicht (Style-Block vorangestellt), dann jede Animationspose einzeln per Skript gesetzt; kein Gesamtsheet generiert',
               postprocess=['Median 5px, Magenta freistellen, Helligkeit/Kontrast leicht angehoben', 'Palettenabgleich im Lab-Raum, Türkis/Violett nur für Effekte',
                            f'ganzzahliger Blockfaktor: Kampf {BATTLE_FACTOR}, Lauf 23/25, Kopf 11/9 (Kern-Mehrheit je Block)', 'binäres Alpha, Einzelpixel entfernt, 1px Löcher gefüllt',
                            '1px Außenumriss #1a1c2c, nach jeder Pose neu geschlossen', 'Handretusche: Augen, Mund, Lupenbrille, Halme (figures.RETOUCH)',
                            'Fußlinie Lauf y=30, Kampf y=46 wie Vorlagen', 'Ausholpose attack/special je zwei identische Frames'], figures={})
    out = {}
    for fig, cfg in FIGS.items():
        gid = cfg['id']
        walk, wdesc, head, battle, bdesc, views = build(fig)
        wrel = f'characters/ph_{gid}_walk.png'; hrel = f'portraits/heads/{gid}.png'; brel = f'battle/enemy_{gid}.png'
        save_indexed(walk, STAGE / wrel); save_indexed(head, SPR / hrel); save_indexed(battle, SPR / brel)
        tpl = tman[cfg['template_battle']]
        man['assets'].append(dict(id=f'ph_{gid}_walk', file=wrel, stagedAt=f'docs/art/pfadbeyonder-ersatz/{wrel}', replaces=f'public/sprites/{wrel} (Platzhalter, Umfärbung)',
                                  kind='walk', width=64, height=128, frameWidth=16, frameHeight=32, columns=4, rows=4, transparent=True, baselineY=30, npc=gid,
                                  template='characters/wx_pfandleiherin_walk.png',
                                  animations={d: dict(frames=[r*4 + i for i in range(4)], frameRate=6, repeat=-1) for r, d in enumerate(['down', 'left', 'right', 'up'])}))
        man['assets'].append(dict(id=f'{gid}_head', file=hrel, kind='head', width=24, height=24, transparent=True, npc=gid,
                                  template='portraits/heads/wx_pfandleiherin.png', derivedFrom=f'{fig}_lauf_ansichten.jpg (Vorderansicht, Kopf/Schultern)'))
        e = {k: tpl[k] for k in ('width', 'height', 'transparent', 'kind', 'frameWidth', 'frameHeight', 'columns', 'rows', 'occupiedCounts', 'baseline', 'facing', 'heldRows', 'windupFrames', 'animations')}
        man['assets'].append(dict(id=f'enemy_{gid}', file=brel, gameId=gid, name=cfg['name'], template=f"battle/{cfg['template_battle']}.png",
                                  attackNames=prompts['figures'][fig]['attackNames'], **e))
        pr = prompts['figures'][fig]
        gen['figures'][gid] = dict(name=cfg['name'], concepts={k: dict(raw=f'docs/art/pfadbeyonder-raw/{v["raw"]}', reference=v['reference'], prompt=v['prompt'])
                                                             for k, v in pr['concepts'].items()},
                                   walkViewsCrop=[list(map(int, b)) for b in views],
                                   walkFrames=[dict(row=k[0], frame=k[1], pose=d) for k, d in wdesc.items()],
                                   battleFrames=[dict(row=k[0], frame=k[1], pose=d) for k, d in bdesc.items()],
                                   head=dict(file=hrel, source='Ansichtsbogen, Vorderansicht Kopf/Schultern, Blockfaktor %d' % cfg['head'][0]))
        out[fig] = (walk, head, battle, cfg)
    (SPR / 'manifest-pfadbeyonder.json').write_text(json.dumps(man, indent=2, ensure_ascii=False) + '\n')
    (ART / 'batch-pfadbeyonder-generation.json').write_text(json.dumps(gen, indent=2, ensure_ascii=False) + '\n')
    preview_all(out); preview_compare(out)

def on(im, col=(90, 76, 104, 255)):
    bg = Image.new('RGBA', im.size, col); bg.alpha_composite(im); return bg

def preview_all(out, s=3):
    """Alle Frames in 3-facher Größe: je Figur Kampfblatt, Lauf-Sheet, Kopf."""
    blocks = []
    for fig, (walk, head, battle, cfg) in out.items():
        b, w, h = rgba(battle), rgba(walk), rgba(head)
        W = b.width * s + 20 + w.width * s + 20 + h.width * s; H = max(b.height, w.height) * s + 30
        blk = Image.new('RGBA', (W, H), (58, 52, 70, 255)); d = ImageDraw.Draw(blk)
        d.text((6, 8), f'{cfg["id"]}: Kampfblatt 288x240 (idle, attack, special, hurt, defeated) | Lauf 64x128 (unten, links, rechts, oben) | Kopf 24x24', fill=(231, 223, 197, 255))
        blk.paste(on(b).resize((b.width * s, b.height * s), Image.NEAREST), (0, 30))
        blk.paste(on(w).resize((w.width * s, w.height * s), Image.NEAREST), (b.width * s + 20, 30))
        blk.paste(on(h).resize((h.width * s, h.height * s), Image.NEAREST), (b.width * s + 40 + w.width * s, 30))
        blocks.append(blk)
    W = max(x.width for x in blocks); H = sum(x.height + 10 for x in blocks)
    img = Image.new('RGBA', (W, H), (40, 38, 48, 255)); y = 0
    for x in blocks: img.paste(x, (0, y)); y += x.height + 10
    img.save(ART / 'batch-pfadbeyonder-preview.png', optimize=True)

def preview_compare(out, s=3):
    """Vorlage | neu: bisheriger Platzhalter (Kampf: Leih-Blatt, Lauf: Umfärbung, Kopf: Stil-Vorlage Maud Keel) neben der neuen Fassung."""
    rows = []
    for fig, (walk, head, battle, cfg) in out.items():
        gid = cfg['id']
        pairs = [(Image.open(SPR / f"battle/{cfg['template_battle']}.png").convert('RGBA'), rgba(battle), 'Kampf'),
                 (Image.open(SPR / f'characters/ph_{gid}_walk.png').convert('RGBA'), rgba(walk), 'Lauf'),
                 (Image.open(SPR / 'portraits/heads/wx_pfandleiherin.png').convert('RGBA'), rgba(head), 'Kopf')]
        W = sum((a.width + b.width) * s + 60 for a, b, _ in pairs); H = max(a.height for a, _, _ in pairs) * s + 34
        blk = Image.new('RGBA', (W, H), (58, 52, 70, 255)); d = ImageDraw.Draw(blk); x = 0
        for a, b, lab in pairs:
            d.text((x + 4, 8), f'{gid} {lab}: Vorlage/Platzhalter | neu', fill=(231, 223, 197, 255))
            blk.paste(on(a, (70, 64, 78, 255)).resize((a.width * s, a.height * s), Image.NEAREST), (x, 30)); x += a.width * s + 10
            blk.paste(on(b).resize((b.width * s, b.height * s), Image.NEAREST), (x, 30)); x += b.width * s + 50
        rows.append(blk)
    W = max(r.width for r in rows); H = sum(r.height + 10 for r in rows)
    img = Image.new('RGBA', (W, H), (40, 38, 48, 255)); y = 0
    for r in rows: img.paste(r, (0, y)); y += r.height + 10
    img.save(ART / 'batch-pfadbeyonder-vorlage-neu.png', optimize=True)

if __name__ == '__main__':
    main()
