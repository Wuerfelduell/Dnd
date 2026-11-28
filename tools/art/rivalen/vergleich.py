"""Vergleich Rivalen/Kopfgeldjäger: vorher (Leihkörper) | Rivale neu | Jäger-Fassung; dazu neben bestehenden Gegnern (python3 tools/art/rivalen/vergleich.py)."""
import json, os
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
B = os.path.join(ROOT, 'public', 'sprites', 'battle')
OUT = os.path.join(ROOT, 'docs', 'art', 'agent-rivalen')
BG, TXT = (40, 42, 54, 255), (232, 216, 168, 255)
NAMEN = {'laterne': 'Laterne - Corvin Ashby', 'schluessel': 'Schluessel - Nell Quist', 'echo': 'Echo - Petra Sandor', 'maske': 'Maske - Silas Morrel',
         'faden': 'Faden - Mirela Stroud', 'sq_uhr': 'Uhr - Tobias Merrin', 'sq_waage': 'Waage - Ottoline Brack', 'eisen': 'Eisen - Garrick Holm',
         'kessel': 'Kessel - Bram Sutter', 'sq_moor': 'Moor - Fenna Caddow'}


def zelle(f, r, c):
    return Image.open(os.path.join(B, f)).convert('RGBA').crop((c * 48, r * 48, c * 48 + 48, r * 48 + 48))


def main(scale=2):
    os.makedirs(OUT, exist_ok=True)
    pf = list(NAMEN)
    alt = [('enemy_wxk_gleispluenderer.png', 'Seq 9-7'), ('enemy_wxk_moorhehler.png', 'Seq 6'), ('enemy_k3k_staubschmuggler.png', 'Seq 5')]
    W = 12 + 3 * 50 + 30 + 4 * 50 + 30 + 2 * 50
    out = Image.new('RGBA', (W * scale + 260, (len(pf) * 52 + 70) * scale), BG)
    d = ImageDraw.Draw(out)
    d.text((12, 6), 'Rivalen Seq 9-5: vorher alle Pfade in denselben drei Leihkoerpern | NEU Ruhe, Angriff (Ausholen, Stoss, Wirkung) | Kopfgeldjaeger-Fassung', fill=TXT)
    for i, (f, t) in enumerate(alt):
        d.text(((12 + i * 50) * scale, 24 * scale - 10), t, fill=TXT)
    for row, p in enumerate(pf):
        y = (40 + row * 52) * scale
        teile = [zelle(f, 0, 0) for f, _ in alt] + [None] + [zelle(f'enemy_rv_{p}.png', 0, 0), zelle(f'enemy_rv_{p}.png', 1, 2), zelle(f'enemy_rv_{p}.png', 1, 3), zelle(f'enemy_rv_{p}.png', 1, 4), None,
                                                       zelle(f'enemy_kgj_{p}.png', 0, 0), zelle(f'enemy_kgj_{p}.png', 1, 4)]
        x = 12
        for tpart in teile:
            if tpart is None:
                x += 30
                continue
            out.alpha_composite(tpart.resize((48 * scale, 48 * scale), Image.NEAREST), (x * scale, y))
            x += 50
        d.text((x * scale + 10, y + 40), NAMEN[p], fill=TXT)
    out.save(os.path.join(OUT, 'vorher_nachher_rivalen.png'))
    # neben bestehenden Gegnern gleicher Größe
    refs = ['enemy_k3k_staubschmuggler.png', 'enemy_k3k_kupferdieb.png', 'enemy_k3k_walzenhehler.png', 'enemy_k3k_lohnfaelscher.png', 'enemy_wxk_moorhehler.png']
    teile = [zelle(f'enemy_rv_{p}.png', 1, 3) for p in pf] + [zelle(r, 1, 3) for r in refs]
    b = Image.new('RGBA', (len(teile) * 50 + 20, 70), BG)
    for i, t in enumerate(teile):
        b.alpha_composite(t, (6 + i * 50 + (10 if i >= len(pf) else 0), 18))
    b = b.resize((b.width * 3, b.height * 3), Image.NEAREST)
    ImageDraw.Draw(b).text((12, 8), 'NEU: zehn Rivalen im Angriff                                                                                    | bestehende Gegner gleicher Groesse (k3k, wxk)', fill=TXT)
    b.save(os.path.join(OUT, 'neben_vorlagen.png'))


if __name__ == '__main__':
    main()
    print('ok')
