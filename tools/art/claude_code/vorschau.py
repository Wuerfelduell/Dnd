"""Vergleichsbilder für Seb: neue Skript-Assets neben alten Leihbildern und echten Codex-Sprites (vergrößert)."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from s1b_daten import FIGUREN

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'public', 'sprites')
OUT = sys.argv[1]
BG = (42, 42, 51, 255)
P = list(FIGUREN)
NAMEN = {'laterne': 'Ysolde Wick', 'faden': 'Bram Ossery', 'maske': 'Frau ohne Mietvertrag', 'echo': 'Hesper Dunmore', 'kessel': 'Mutter Grisel',
         'eisen': 'Konrad Vass', 'schluessel': 'Niemand Thorne', 'sq_waage': 'Aldine Quarry', 'sq_moor': 'Der Torfvater', 'sq_uhr': 'Tobias Hale'}
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception:
    FONT = ImageFont.load_default()
ld = lambda p: Image.open(os.path.join(R, p)).convert('RGBA')


def scaled(im, s):
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def figuren():
    S = 4
    cw = 64 * S + 24
    head = 22
    out = Image.new('RGBA', (cw * 5 + 10, (head + 128 * S + 20) * 2), BG)
    d = ImageDraw.Draw(out)
    for i, p in enumerate(P):
        x, y = 10 + (i % 5) * cw, (i // 5) * (head + 128 * S + 20)
        d.text((x, y + 4), f'{NAMEN[p]}  ({p})', fill=(235, 205, 141), font=FONT)
        out.alpha_composite(scaled(ld(f'characters/s1b_{p}_walk.png'), S), (x, y + head))
    out.save(os.path.join(OUT, '01_seq1_beyonder_laufblaetter.png'))
    # vorher/nachher: Basis -> neu, je ein Frame vorn + seitlich, plus Briarholter Nachbarn zum Größenvergleich
    S = 5
    nb = ['bh_bellweather_walk', 'bh_crowther_walk', 'bhn_e_lehrer', 'bhn_e_naeherin']
    W = 16 * S * 2 + 30
    out = Image.new('RGBA', (W * 10 + 20, 32 * S * 2 + 120), BG)
    d = ImageDraw.Draw(out)
    d.text((10, 4), 'Oben: Codex-Vorlage (unverändert, andere Stadt)  ·  Unten: neuer Seq-1-Beyonder (umgefärbt + Gegenlicht in Pfadfarbe)', fill=(235, 205, 141), font=FONT)
    for i, p in enumerate(P):
        x = 10 + i * W
        b, n = ld(f"characters/{FIGUREN[p]['basis']}.png"), ld(f'characters/s1b_{p}_walk.png')
        for k, (fx, fy) in enumerate([(0, 0), (0, 64)]):
            out.alpha_composite(scaled(b.crop((fx, fy, fx + 16, fy + 32)), S), (x + k * 16 * S, 26))
            out.alpha_composite(scaled(n.crop((fx, fy, fx + 16, fy + 32)), S), (x + k * 16 * S, 36 + 32 * S))
        d.text((x, 44 + 64 * S), NAMEN[p], fill=(200, 200, 210), font=FONT)
    out.save(os.path.join(OUT, '02_seq1_beyonder_vorlage_vs_neu.png'))
    # Gruppenbild mit echten Briarholtern in Spielgröße x4
    S = 4
    figs = [ld(f'characters/{n}.png').crop((0, 0, 16, 32)) for n in nb[:2]] + [ld(f'characters/s1b_{p}_walk.png').crop((0, 0, 16, 32)) for p in P] + [ld(f'characters/{n}.png').crop((0, 0, 16, 32)) for n in nb[2:]]
    out = Image.new('RGBA', (len(figs) * 18 + 4, 50), (58, 60, 66, 255))
    for i, f in enumerate(figs):
        out.alpha_composite(f, (2 + i * 18, 10))
    out = scaled(out, S)
    d = ImageDraw.Draw(out)
    d.text((8, 4), 'Außen je zwei echte Briarholter (Codex), dazwischen die zehn neuen Figuren', fill=(235, 205, 141), font=FONT)
    out.save(os.path.join(OUT, '03_seq1_beyonder_neben_briarholtern.png'))


def icons():
    S = 6
    cell = 18 * S
    out = Image.new('RGBA', (cell * 10 + 220, cell * 4 + 40), BG)
    d = ImageDraw.Draw(out)
    rows = [('Charakteristik Seq 1 – vorher (Leihbild Seq-1-Trank)', lambda p: f'items/trank_{p}_1.png'),
            ('Charakteristik Seq 1 – neu', lambda p: f'items/char_seq1_{p}.png'),
            ('Beyonder-Rest – vorher (ein Leihbild für alle)', lambda p: 'items/schattenrest.png'),
            ('Beyonder-Rest – neu (je Pfad)', lambda p: f'items/rest_{p}.png')]
    for r, (label, fn) in enumerate(rows):
        y = 30 + r * cell
        d.text((6, y + cell // 2 - 8), label.replace(' – ', '\n'), fill=(235, 205, 141), font=FONT)
        for i, p in enumerate(P):
            out.alpha_composite(scaled(ld(fn(p)), S), (220 + i * cell, y + S))
    for i, p in enumerate(P):
        d.text((220 + i * cell, 8), p, fill=(200, 200, 210), font=FONT)
    out.save(os.path.join(OUT, '04_icons_vorher_nachher.png'))
    # neben echten Codex-Icons in Spielgröße x3 (Inventar-Gefühl)
    import random, glob
    random.seed(7)
    pool = [f for f in sorted(glob.glob(os.path.join(R, 'items', '*.png'))) if not os.path.basename(f).startswith(('char_seq1', 'rest_'))]
    codex = [Image.open(f).convert('RGBA') for f in random.sample(pool, 30)]
    neu = [ld(f'items/char_seq1_{p}.png') for p in P] + [ld(f'items/rest_{p}.png') for p in P]
    mixed = []
    for i in range(30):
        mixed.append(codex[i])
        if i < 20:
            mixed.append(neu[i])
    out = Image.new('RGBA', (10 * 20 + 4, 5 * 20 + 4), (34, 32, 40, 255))
    for i, im in enumerate(mixed):
        x, y = 2 + (i % 10) * 20, 2 + (i // 10) * 20
        ImageDraw.Draw(out).rectangle((x, y, x + 17, y + 17), fill=(52, 50, 60, 255))
        out.alpha_composite(im, (x + 1, y + 1))
    scaled(out, 4).save(os.path.join(OUT, '05_icons_gemischt_mit_codex.png'))


figuren()
icons()
