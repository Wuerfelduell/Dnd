"""Allgemeine Icon-Vorschau: python3 vorschau_icons.py <modul> <ausgabe.png> [alt-json]
Zeigt je Icon das alte Leihbild (falls angegeben), neu 16 und neu 32, alles x4, beschriftet."""
import sys, os, json, importlib
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'public', 'sprites', 'items')
mod = importlib.import_module(sys.argv[1])
alt = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
except Exception:
    F = ImageFont.load_default()
ids = list(mod.ICONS)
cw, ch, cols = 210, 226, 8
out = Image.new('RGBA', (cw * cols + 10, ch * ((len(ids) + cols - 1) // cols) + 30), (42, 42, 51, 255))
d = ImageDraw.Draw(out)
d.text((8, 6), 'je Icon: alt (Leihbild, 16) · neu 16 · neu 32   (alles x4)' if alt else 'je Icon: neu 16 · neu 32 (x4)', fill=(235, 205, 141), font=F)
ld = lambda p: Image.open(os.path.join(R, p)).convert('RGBA')
sc = lambda im: im.resize((im.width * 4, im.height * 4), Image.NEAREST)
for i, fid in enumerate(ids):
    x, y = (i % cols) * cw + 8, (i // cols) * ch + 26
    d.text((x, y), fid, fill=(210, 210, 220), font=F)
    xx = x
    if fid in alt and os.path.exists(os.path.join(R, alt[fid] + '.png')):
        out.alpha_composite(sc(ld(alt[fid] + '.png').resize((16, 16), Image.BOX) if ld(alt[fid] + '.png').width > 16 else ld(alt[fid] + '.png')), (xx, y + 16)); xx += 70
    out.alpha_composite(sc(ld(fid + '.png')), (xx, y + 16)); xx += 70
    out.alpha_composite(sc(ld('32/' + fid + '.png')), (x, y + 84) if alt else (xx, y + 16))
out.save(sys.argv[2])
