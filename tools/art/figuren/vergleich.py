"""Vergleichsbild: altes Leihblatt | neues Blatt, dazu Vorlagen (python3 tools/art/figuren/vergleich.py)."""
import json, os, subprocess, sys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SPR = os.path.join(ROOT, 'public', 'sprites')
OUT = os.path.join(ROOT, 'docs', 'art', 'agent-figuren')
ALT = {'wx_schneiderin': 'characters/wx_schneiderin_walk.png', 'cwz_pfandmeister': 'characters/cwn_e_marktfrau.png', 'cwz_schneiderin': 'characters/cwn_e_fensterputzerin.png',
       'cwz_kassenwart': 'characters/cwn_e_bote.png', 'cwz_kesselflicker': 'characters/cwn_e_laternenwart.png', 'cwz_aschehaendler': 'characters/cwn_e_nachtsetzer.png',
       'cwz_bleisetzer': 'characters/cwn_e_nachtsetzer.png', 'cwz_schaetzerin': 'characters/cwn_e_archivdienerin.png', 'haus_maklerin': 'characters/E_marktfrau_walk.png',
       'nebel_kraemerin': 'characters/E_wahrsagerin_walk.png'}
TEIL = {'cwz_pfandmeister': 'Selma Dorr', 'cwz_schneiderin': 'Mira Cale', 'cwz_kassenwart': 'Oskar Venn', 'cwz_kesselflicker': 'Enno Reed',
        'cwz_aschehaendler': 'Arvo Pell, Konrad Blei', 'cwz_bleisetzer': 'Arvo Pell, Ferdinand Glut', 'cwz_schaetzerin': 'Berta Voss, Ilse Zeile',
        'haus_maklerin': 'Bess Hagan', 'nebel_kraemerin': 'Madame Orsolya', 'wx_schneiderin': 'umgefaerbte Naeherin (bhn_e/dsg)'}
BG, TXT = (40, 42, 54, 255), (232, 216, 168, 255)
ascii_ = lambda s: s.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss').replace('Ä', 'Ae')


def main(scale=2):
    man = json.load(open(os.path.join(SPR, 'manifest-figuren-eigen.json'), encoding='utf-8'))
    boden = Image.open(os.path.join(SPR, 'tilesets', 'cw_amt.png')).convert('RGBA').crop((0, 0, 16, 16))
    zeile_h = 128 * scale + 26
    W = (64 * 2 + 40) * scale + 360
    out = Image.new('RGBA', (W * 2, zeile_h * 5 + 40), BG)
    d = ImageDraw.Draw(out)
    d.text((12, 8), 'Eigene Laufblaetter: links das bisherige Leihblatt (geteilt mit ...), rechts das neue Blatt', fill=TXT)
    for i, a in enumerate(man['assets']):
        col, row = i % 2, i // 2
        x0, y0 = col * W + 12, 30 + row * zeile_h
        tafel = Image.new('RGBA', (64 * 2 + 24, 128))
        for y in range(0, 128, 16):
            for x in range(0, tafel.width, 16):
                tafel.alpha_composite(boden, (x, y))
        tafel.alpha_composite(Image.open(os.path.join(SPR, ALT[a['npc']])).convert('RGBA'), (0, 0))
        tafel.alpha_composite(Image.open(os.path.join(SPR, a['file'])).convert('RGBA'), (64 + 24, 0))
        out.alpha_composite(tafel.resize((tafel.width * scale, 256), Image.NEAREST), (x0, y0 + 16))
        d.text((x0, y0), ascii_(f"{a['name']} ({a['stadt']}) - vorher geteilt mit: {TEIL[a['npc']]}"), fill=TXT)
        d.text((x0 + tafel.width * scale + 10, y0 + 30), ascii_(a['aussehen'])[:52], fill=TXT)
        d.text((x0 + tafel.width * scale + 10, y0 + 44), ascii_(a['aussehen'])[52:104], fill=TXT)
    out.save(os.path.join(OUT, 'vorher_nachher_figuren.png'))
    # neben Vorlagen (Frontansicht und Seitenansicht)
    refs = ['cwn_e_bote.png', 'cwn_e_nachtsetzer.png', 'cwn_e_griffmacherin.png', 'dsg_wirtin_walk.png', 'wx_pfandleiherin_walk.png', 'fasserin_walk.png']
    teile = [Image.open(os.path.join(SPR, a['file'])).convert('RGBA') for a in man['assets']] + [Image.open(os.path.join(SPR, 'characters', r)).convert('RGBA') for r in refs]
    b = Image.new('RGBA', (len(teile) * 20 + 8, 2 * 34 + 24), BG)
    for y in range(20, b.height, 16):
        for x in range(0, b.width, 16):
            b.alpha_composite(boden, (x, y))
    for i, t in enumerate(teile):
        b.alpha_composite(t.crop((0, 0, 16, 32)), (4 + i * 20, 22)); b.alpha_composite(t.crop((16, 64, 32, 96)), (4 + i * 20, 22 + 34))
    b = b.resize((b.width * 4, b.height * 4), Image.NEAREST)
    ImageDraw.Draw(b).text((12, 8), 'NEU (10)                                                                                          | Vorlagen: Bote, Nachtsetzer, Griffmacherin (CS), Wirtin (Dunscar), Maud Keel, Oda Kessel', fill=TXT)
    b.save(os.path.join(OUT, 'neben_vorlagen.png'))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    main()
    print('ok')
