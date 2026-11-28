"""Vergleich Runde 3: Pfadviertel-Gegner, je Paar links das geliehene Stadtmonster, rechts die Pfad-Fassung (erstes Idle-Frame)."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from o3_varianten import PAARE, neu_id
B = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'public', 'sprites', 'battle')
ADJ = {'laterne': 'Lichtloser', 'faden': 'Verknoteter', 'maske': 'Gesichtsloser', 'echo': 'Stummer', 'kessel': 'Kochender', 'eisen': 'Genieteter',
       'schluessel': 'Verschlossener', 'sq_waage': 'Gewogener', 'sq_moor': 'Fauliger', 'sq_uhr': 'Stehengebliebener'}
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception:
    F = ImageFont.load_default()
S = 160
cols = 4
rows = (len(PAARE) + cols - 1) // cols
out = Image.new('RGBA', (cols * (2 * S + 20), rows * (S + 26) + 30), (42, 42, 51, 255))
d = ImageDraw.Draw(out)
d.text((10, 6), 'je Paar: links das geliehene Stadtmonster (vorher), rechts die eigene Pfadviertel-Fassung (neu)', fill=(235, 205, 141), font=F)
for i, (pid, r, b, fw, fh) in enumerate(PAARE):
    x, y = (i % cols) * (2 * S + 20) + 10, (i // cols) * (S + 26) + 30
    d.text((x, y), f"{ADJ[pid]} ({pid}){' · Oberhaupt' if r == 't' else ''}", fill=(210, 210, 220), font=F)
    for k, path in enumerate((b, neu_id(pid, r, b))):
        im = Image.open(os.path.join(B, path + '.png')).convert('RGBA').crop((0, 0, fw, fh))
        sc = max(1, S // max(fw, fh))
        out.alpha_composite(im.resize((fw * sc, fh * sc), Image.NEAREST), (x + k * S, y + 18))
out.save(os.path.join(sys.argv[1], '01_pfadviertel_gegner_vorher_nachher.png'))
# ein ganzes Blatt als Beispiel für die Animation
im = Image.open(os.path.join(B, neu_id('faden', 'n', 'enemy_vg_cw_durchschlag') + '.png')).convert('RGBA')
bg = Image.new('RGBA', im.size, (42, 42, 51, 255)); bg.alpha_composite(im)
bg.resize((im.width * 3, im.height * 3), Image.NEAREST).save(os.path.join(sys.argv[1], '02_beispiel_ganzes_blatt_verknoteter_durchschlag.png'))
