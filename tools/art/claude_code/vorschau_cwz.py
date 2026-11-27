"""Vergleichsbilder Runde 2: Calderwick-Zirkelstücke alt (Leihbild) gegen neu, in 16 und 32, und zwischen Codex-Icons."""
import sys, os, glob, random
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icons_cwz import ICONS

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'public', 'sprites', 'items')
OUT = sys.argv[1]
ALT = {'cwz_setzerbeil': 'vi_waffe_setzhaken', 'cwz_quittungsdegen': 'vi_waffe_veredelungsschere', 'cwz_archivlanze': 'vi_waffe_richterstab',
       'cwz_gleishammer': 'vi_waffe_bleihammer', 'cwz_verbranntes_zepter': 'vi_waffe_dampfrohr', 'cwz_aschemantel': 'vi_mantel_dampfmantel',
       'cwz_quittungsrobe': 'vi_mantel_archivrobe', 'cwz_fallhut': 'vi_hut_fuhrmannshut', 'cwz_setzerzylinder': 'vi_hut_zylinder_vermesser',
       'cwz_kassenamulett': 'vi_amulett_rohrpostkapsel', 'cwz_glutsiegel': 'vi_amulett_bleiletter', 'cwz_kronsplitter': 'dsz_signalzunge',
       'cwz_aschequittung': 'dsz_lohnbuch', 'cwz_fallfeder': 'dsz_rohrpost', 'cwz_kassenbuch': 'dsz_lohnbuch', 'cwz_zweiter_fahrschein': 'dsz_weichenuhr',
       'cwz_sturzherz': 'dsz_lohnherz'}
NAMEN = {'cwz_setzerbeil': 'Setzerbeil', 'cwz_quittungsdegen': 'Quittungsdegen', 'cwz_archivlanze': 'Archivlanze', 'cwz_gleishammer': 'Gleishammer',
         'cwz_verbranntes_zepter': 'Verbr. Zepter', 'cwz_aschemantel': 'Aschemantel', 'cwz_quittungsrobe': 'Quittungsrobe', 'cwz_fallhut': 'Fallhut',
         'cwz_setzerzylinder': 'Setzerzylinder', 'cwz_kassenamulett': 'Kassenamulett', 'cwz_glutsiegel': 'Glutsiegel', 'cwz_kronsplitter': 'Kronsplitter',
         'cwz_aschequittung': 'Aschequittung', 'cwz_fallfeder': 'Fallfeder', 'cwz_kassenbuch': 'Kassenbuch', 'cwz_zweiter_fahrschein': '2. Fahrschein',
         'cwz_sturzherz': 'Sturzherz'}
BG = (42, 42, 51, 255)
try:
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
except Exception:
    F = ImageFont.load_default()
ld = lambda p: Image.open(os.path.join(R, p)).convert('RGBA')
sc = lambda im, s: im.resize((im.width * s, im.height * s), Image.NEAREST)

ids = list(ICONS)
cw = 150
out = Image.new('RGBA', (cw * 9, 2 * 230 + 20), BG)
d = ImageDraw.Draw(out)
d.text((8, 4), 'je Stück: links altes Leihbild (16, x4)  ·  Mitte neu 16 (x4)  ·  unten neu 32 (x4)', fill=(235, 205, 141), font=F)
for i, fid in enumerate(ids):
    x, y = (i % 9) * cw + 8, (i // 9) * 230 + 24
    d.text((x, y), NAMEN[fid], fill=(210, 210, 220), font=F)
    out.alpha_composite(sc(ld(ALT[fid] + '.png'), 4), (x, y + 18))
    out.alpha_composite(sc(ld(fid + '.png'), 4), (x + 70, y + 18))
    out.alpha_composite(sc(ld('32/' + fid + '.png'), 4), (x + 4, y + 90))
out.save(os.path.join(OUT, '01_zirkelstuecke_alt_neu.png'))

random.seed(11)
pool = [f for f in sorted(glob.glob(os.path.join(R, '32', '*.png'))) if 'cwz_' not in f]
codex = [Image.open(f).convert('RGBA') for f in random.sample(pool, 19)]
neu = [ld('32/' + fid + '.png') for fid in ids]
mixed = [m for pair in zip(codex, neu) for m in pair] + codex[17:]
out = Image.new('RGBA', (6 * 36 + 4, 6 * 36 + 4), (34, 32, 40, 255))
for i, im in enumerate(mixed[:36]):
    x, y = 2 + (i % 6) * 36, 2 + (i // 6) * 36
    ImageDraw.Draw(out).rectangle((x, y, x + 33, y + 33), fill=(52, 50, 60, 255))
    out.alpha_composite(im, (x + 1, y + 1))
sc(out, 3).save(os.path.join(OUT, '02_zirkelstuecke_32_zwischen_codex.png'))
