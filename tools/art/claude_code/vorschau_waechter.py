"""Vorschau Runde 7: je Wächterkörper eine Zeile Basis, dann je Pfad Fassung w und wt (Frame aus Spalte/Zeile wählbar)."""
import sys, os
from PIL import Image, ImageDraw
from waechter_varianten import BASEN, PFADE, neu_id

bdir, ziel = sys.argv[1], sys.argv[2]
spalte, zeile = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (0, 0)
Z = 2
reihen = []
for basis, fw, fh in BASEN:
    namen = [basis] + [neu_id(basis, p, h) for h in (False, True) for p in PFADE]
    reihen.append((namen, fw, fh))
W = max(11 * fw for _, fw, _ in reihen) * Z
H = sum((fh * 2) * Z + 20 for _, _, fh in reihen)
img = Image.new('RGBA', (W, H), (52, 54, 68, 255))
d = ImageDraw.Draw(img)
y = 0
for namen, fw, fh in reihen:
    for i, n in enumerate(namen):
        im = Image.open(os.path.join(bdir, n + '.png')).convert('RGBA').crop((spalte * fw, zeile * fh, (spalte + 1) * fw, (zeile + 1) * fh))
        im = im.resize((fw * Z, fh * Z), Image.NEAREST)
        if i == 0:
            cx, cy = 0, y + fh * Z // 2
        else:
            k = (i - 1) % 10
            cx, cy = (k + 1) * fw * Z, y + (0 if i <= 10 else fh * Z)
        img.alpha_composite(im, (cx, cy))
        d.text((cx + 3, cy + 2), n.split('__')[-1] if '__' in n else 'Basis', fill=(220, 220, 230, 255))
    y += fh * 2 * Z + 20
img.save(ziel)
