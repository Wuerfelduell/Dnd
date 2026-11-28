"""Vergleichsbilder für die Nebelseiten-Icons (python3 tools/art/nsi_icons/vergleich.py <ausgabeordner> [git-ref]):
vorher_nachher.png  bisheriges Bild (aus git-ref, 16er; 32er gab es nicht) neben dem neuen 16er und 32er, mit Namen
gesamt_neben_vorlagen.png  die zehn neuen Icons neben vorhandenen Icons derselben Größe"""
import io, json, os, subprocess, sys
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SPR = os.path.join(ROOT, 'public', 'sprites')
BG, TXT = (40, 42, 54, 255), (232, 216, 168, 255)
ASCII = str.maketrans({'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ß': 'ss'})
VORLAGEN = ['wxf_salzglas', 'wxf_torfkompass', 'cwf_taschenuhr', 'cwf_bleisiegel', 'cwf_haftbefehl', 'salzrosenkranz', 'eiserne_zunge', 'uhr_taschen', 's4wa_plombe', 'leeres_gefaess']


def alt(ref, rel):
    data = subprocess.run(['git', 'show', ref + ':public/sprites/' + rel], capture_output=True, cwd=ROOT).stdout
    return Image.open(io.BytesIO(data)).convert('RGBA') if data else None


def main(out, ref):
    os.makedirs(out, exist_ok=True)
    man = json.load(open(os.path.join(SPR, 'manifest-nsi-icons.json'), encoding='utf-8'))
    n = len(man['assets'])
    g = Image.new('RGBA', (n * 132 + 10, 320), BG)
    d = ImageDraw.Draw(g)
    d.text((6, 4), 'vorher (16er, 32er fehlte: hochskaliert)', fill=TXT)
    d.text((6, 150), 'nachher: 16er (3-fach) und 32er (3-fach), darunter in Originalgroesse', fill=TXT)
    for i, a in enumerate(man['assets']):
        x = 8 + i * 132
        v = alt(ref, a['file16'])
        if v:
            g.alpha_composite(v.resize((48, 48), Image.NEAREST), (x, 34)); g.alpha_composite(v.resize((96, 96), Image.NEAREST), (x + 52, 34))
        n16 = Image.open(os.path.join(SPR, a['file16'])).convert('RGBA')
        n32 = Image.open(os.path.join(SPR, a['file32'])).convert('RGBA')
        g.alpha_composite(n16.resize((48, 48), Image.NEAREST), (x, 180))
        g.alpha_composite(n32.resize((96, 96), Image.NEAREST), (x + 52, 170))
        g.alpha_composite(n16, (x + 4, 282)); g.alpha_composite(n32, (x + 26, 276))
        d.text((x, 20), a['name'].translate(ASCII)[:22], fill=TXT)
        d.text((x, 136), ('wie ' + a['bisher_wie']).translate(ASCII)[:24], fill=(150, 160, 170, 255))
    g.save(os.path.join(out, 'vorher_nachher.png'))
    # neben Vorlagen
    neu = [(Image.open(os.path.join(SPR, a['file16'])).convert('RGBA'), Image.open(os.path.join(SPR, a['file32'])).convert('RGBA')) for a in man['assets']]
    vor = [(Image.open(os.path.join(SPR, 'items', k + '.png')).convert('RGBA'), Image.open(os.path.join(SPR, 'items', '32', k + '.png')).convert('RGBA')) for k in VORLAGEN]
    g = Image.new('RGBA', (max(len(neu), len(vor)) * 110 + 10, 2 * 170 + 10), BG)
    d = ImageDraw.Draw(g)
    for j, (titel, reihe) in enumerate((('NEU: zehn Nebelseiten-Fundstuecke (16 und 32)', neu), ('Vorlagen: vorhandene Icons (16 und 32)', vor))):
        y = 6 + j * 170
        d.text((6, y), titel, fill=TXT)
        for i, (a, b) in enumerate(reihe):
            x = 8 + i * 110
            g.alpha_composite(a.resize((48, 48), Image.NEAREST), (x, y + 16))
            g.alpha_composite(b.resize((96, 96), Image.NEAREST), (x, y + 68))
            g.alpha_composite(a, (x + 60, y + 20)); g.alpha_composite(b, (x + 60, y + 42))
    g.save(os.path.join(out, 'gesamt_neben_vorlagen.png'))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs', 'art', 'agent-nsi-icons'), sys.argv[2] if len(sys.argv) > 2 else 'HEAD')
