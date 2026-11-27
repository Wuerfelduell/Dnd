"""Vorschau Runde 9: je Zeile eine Vorlage (links) und ihre neuen Fassungen, Frame wählbar (Spalte, Zeile)."""
import sys, os, json
from PIL import Image, ImageDraw
from themen_varianten import T, neu_id
bdir, sheets, ziel = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3]
sp, ze = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (0, 0)
gr = {}
for eid, v in T.items():
    gr.setdefault(v[0], []).append(eid)
C = 200
reihen = list(gr.items())
img = Image.new('RGBA', (5 * C, len(reihen) * (C + 14)), (52, 54, 68, 255))
d = ImageDraw.Draw(img)
for r, (basis, ids) in enumerate(reihen):
    src, fw, fh = sheets[f'enemy_{basis}']
    for i, (titel, pfad) in enumerate([('Vorlage ' + basis, os.path.join(bdir, '..', src))] + [(e, os.path.join(bdir, neu_id(e) + '.png')) for e in ids]):
        im = Image.open(pfad).convert('RGBA').crop((sp * fw, ze * fh, (sp + 1) * fw, (ze + 1) * fh))
        z = max(1, min(C // fw, C // fh))
        im = im.resize((fw * z, fh * z), Image.NEAREST)
        x, y = i * C, r * (C + 14)
        img.alpha_composite(im, (x + (C - im.width) // 2, y + 14 + (C - im.height) // 2))
        d.text((x + 3, y + 2), titel[:30], fill=(220, 220, 230, 255))
img.save(ziel)
