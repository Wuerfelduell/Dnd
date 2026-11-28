"""Gesamtbild: neue Stücke neben Vorlagen (python3 tools/art/gesamtbild.py <ausgabe.png> <manifest> <vorlage:datei:x,y,w,h> ...)."""
import json, os, sys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SPR = os.path.join(ROOT, 'public', 'sprites')
BG, TXT = (40, 42, 54, 255), (232, 216, 168, 255)


def main(out, manifest, refs, titel_neu='NEU', titel_ref='Vorlagen', boden=None):
    man = json.load(open(os.path.join(SPR, manifest), encoding='utf-8'))
    neu = [Image.open(os.path.join(SPR, a['file'])).convert('RGBA') for a in man['assets']]
    vor = []
    for r in refs:
        f, box = r.rsplit(':', 1)
        x, y, w, h = map(int, box.split(','))
        vor.append(Image.open(os.path.join(SPR, f)).convert('RGBA').crop((x, y, x + w, y + h)))
    zeilen = [(titel_neu, neu), (titel_ref, vor)]
    W = max(sum(i.width + 6 for i in z) for _, z in zeilen) + 10
    H = sum(max(i.height for i in z) + 26 for _, z in zeilen) + 6
    g = Image.new('RGBA', (W, H), BG)
    fl = Image.open(os.path.join(SPR, boden[0])).convert('RGBA').crop(tuple(boden[1])) if boden else None
    y = 4
    for _, z in zeilen:
        h = max(i.height for i in z)
        if fl:
            for yy in range(y + 14, y + 14 + h + 4, 16):
                for xx in range(0, W, 16):
                    g.alpha_composite(fl, (xx, yy))
        x = 4
        for im in z:
            g.alpha_composite(im, (x, y + 16 + h - im.height)); x += im.width + 6
        y += h + 26
    g = g.resize((g.width * 3, g.height * 3), Image.NEAREST)
    d = ImageDraw.Draw(g)
    y = 4
    for t, z in zeilen:
        d.text((12, y * 3), t, fill=TXT)
        y += max(i.height for i in z) + 26
    g.save(out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3:])
