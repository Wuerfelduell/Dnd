"""Vergleichsbilder für die eigenen Kampffiguren (python3 tools/art/kampf_eigen/vergleich.py <ausgabeordner>):
vorher_nachher.png  bisheriges Leihbild (Ruhe, Angriff) neben der neuen Figur (Ruhe, Angriff)
gesamt_neben_vorlagen.png  alle zehn in Ruhe neben Codex-Kampffiguren derselben Palette
blaetter.png  alle zehn Blätter vollständig (idle, attack, special, hurt, defeated)"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SPR = os.path.join(ROOT, 'public', 'sprites')
BG, TXT = (40, 42, 54, 255), (232, 216, 168, 255)
ASCII = str.maketrans({'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ß': 'ss'})  # Standardschrift ohne Umlaute
VORLAGEN = ['enemy_schlachtergehilfe', 'enemy_rost_schlaeger', 'enemy_schleier_messerin', 'enemy_ez_ds_rangierer', 'enemy_ez_ds_kalkbrennerin',
            'enemy_vme_zollgeist', 'enemy_lohnlistenmotte', 'enemy_k3k_staubschmuggler']


def sheets(keys):
    js = "import('" + ROOT + "/src/world/assets.js').then(A=>console.log(JSON.stringify(Object.fromEntries(" + json.dumps(keys) + ".map(k=>[k,A.BATTLE_SHEETS[k]])))))"
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT).stdout)


def zelle(key, info, frame):
    path, w = info[0], info[1]
    h = info[2] if len(info) > 2 else w
    im = Image.open(os.path.join(SPR, path)).convert('RGBA')
    cols = im.width // w
    return im.crop(((frame % cols) * w, (frame // cols) * h, (frame % cols) * w + w, (frame // cols) * h + h))


def main(out):
    os.makedirs(out, exist_ok=True)
    man = json.load(open(os.path.join(SPR, 'manifest-kampf-eigen.json'), encoding='utf-8'))
    S = 3
    alt = sheets([a['bisher'] for a in man['assets']] + VORLAGEN)
    # vorher / nachher
    zeilen = []
    for a in man['assets']:
        ai = alt[a['bisher']]
        neu = [a['file'], 48, 48]
        zeilen.append((a, [zelle(a['bisher'], ai, 0), zelle(a['bisher'], ai, 9)], [zelle(a['id'], neu, 0), zelle(a['id'], neu, 9)]))
    wz = [sum(c.width + 4 for c in l) + 24 + 2 * 52 for _, l, _ in zeilen]
    hz = [max(max(c.height for c in l), 48) for _, l, _ in zeilen]
    W = max(max(wz) * S + 12, 900)
    H = sum(h + 16 for h in hz) * S + 30
    g = Image.new('RGBA', (W, H), BG)
    y = 10
    lab = []
    for (a, l, r), h in zip(zeilen, hz):
        x = 6
        for c in l:
            g.alpha_composite(c.resize((c.width * S, c.height * S), Image.NEAREST), (x, y + 14 * S + (h - c.height) * S)); x += c.width * S + 4 * S
        xr = x + 20 * S
        for c in r:
            g.alpha_composite(c.resize((c.width * S, c.height * S), Image.NEAREST), (xr, y + 14 * S + (h - c.height) * S)); xr += c.width * S + 4 * S
        lab.append((y, a, x + 20 * S))
        y += (h + 16) * S
    d = ImageDraw.Draw(g)
    for y, a, xr in lab:
        d.text((8, y + 4), ('vorher: ' + a['bisher'] + ' (wie ' + a['bisher_mit'] + ')').translate(ASCII), fill=TXT)
        d.text((8, y + 18), ('nachher: ' + a['id'] + '  <- ' + ', '.join(a['begegnungen'])).translate(ASCII), fill=(160, 210, 190, 255))
    g.save(os.path.join(out, 'vorher_nachher.png'))
    # gesamt neben Vorlagen
    neu = [zelle(a['id'], [a['file'], 48, 48], 0) for a in man['assets']]
    vor = [zelle(k, alt[k], 0) for k in VORLAGEN]
    W = max(len(neu), len(vor)) * (48 + 6) * S + 20
    g = Image.new('RGBA', (W, 2 * (48 + 18) * S + 10), BG)
    for j, (titel, reihe) in enumerate((('NEU: zehn eigene Kampffiguren (Ruhe, Bild 0)', neu), ('Vorlagen: Codex-Kampffiguren derselben Palette', vor))):
        for i, c in enumerate(reihe):
            g.alpha_composite(c.resize((c.width * S, c.height * S), Image.NEAREST), (10 + i * (48 + 6) * S, 14 * S + j * (48 + 18) * S))
        ImageDraw.Draw(g).text((10, 4 + j * (48 + 18) * S), titel, fill=TXT)
    g.save(os.path.join(out, 'gesamt_neben_vorlagen.png'))
    # alle Blätter
    S2 = 2
    g = Image.new('RGBA', (2 * (288 * S2 + 16), 5 * (240 * S2 + 22)), BG)
    d = ImageDraw.Draw(g)
    for i, a in enumerate(man['assets']):
        im = Image.open(os.path.join(SPR, a['file'])).convert('RGBA')
        x, y = (i % 2) * (288 * S2 + 16), (i // 2) * (240 * S2 + 22)
        g.alpha_composite(im.resize((288 * S2, 240 * S2), Image.NEAREST), (x, y + 18))
        d.text((x + 4, y + 4), a['id'] + ': idle, attack, special, hurt, defeated', fill=TXT)
    g.save(os.path.join(out, 'blaetter.png'))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs', 'art', 'agent-kampf-eigen'))
