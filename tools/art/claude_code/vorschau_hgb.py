"""Vorschau Runde 8: je Pfad eine Spalte: Basis, Vorhof (vh), Stellvertretung (vz), Seq 1 (s1)."""
import sys, os
from PIL import Image, ImageDraw
from waechter_varianten import PFADE
bdir, ziel = sys.argv[1], sys.argv[2]
sp, ze = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (0, 0)
Z, F = 2, 96
img = Image.new('RGBA', (len(PFADE) * F * Z, 4 * F * Z + 4 * 14), (52, 54, 68, 255))
d = ImageDraw.Draw(img)
for i, p in enumerate(PFADE):
    for j, art in enumerate(['', '__vh', '__vz', '__s1']):
        im = Image.open(os.path.join(bdir, f'hg_battle_{p}{art}.png')).convert('RGBA').crop((sp * F, ze * F, (sp + 1) * F, (ze + 1) * F)).resize((F * Z, F * Z), Image.NEAREST)
        x, y = i * F * Z, j * (F * Z + 14) + 14
        img.alpha_composite(im, (x, y))
        d.text((x + 3, y - 12), f"{p} {art.strip('_') or 'Basis'}", fill=(220, 220, 230, 255))
img.save(ziel)
