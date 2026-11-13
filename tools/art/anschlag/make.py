"""Anschlagbrett Dunscar (PR #462/#463): Grafiken aus vorhandenen Blättern umgefärbt, bis eigene Grafik kommt.
python3 tools/art/anschlag/make.py  (aus dem Repo-Wurzelverzeichnis)
- Ezra Pell: Lauf-Sheet aus ds_einwohner_5, Porträt + Kopf aus future200_136 (Archivar mit Tintenflecken).
- Benannte Ziele: Kampf- und Kartenblatt des Grundgegners, Farbton gedreht/entsättigt, damit sie sich vom Grundgegner abheben.
"""
import colorsys
from PIL import Image

S = 'public/sprites/'

def shift(src, dst, hue=0.0, sat=1.0, val=1.0, pale=0.0):
    im = Image.open(S + src).convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            h = (h + hue) % 1
            s = min(1, s * sat)
            v = min(1, v * val)
            r2, g2, b2 = colorsys.hsv_to_rgb(h, s, v)
            # pale: Richtung Kalkweiß ziehen (Starlings Bote, Hüter)
            r2, g2, b2 = (c + (0.92 - c) * pale for c in (r2, g2, b2))
            px[x, y] = (round(r2 * 255), round(g2 * 255), round(b2 * 255), a)
    im.save(S + dst, optimize=True)

# Ezra Pell
shift('characters/ds_einwohner_5.png', 'characters/dan_anschlagschreiber_walk.png', hue=0.08, sat=0.6, val=1.05)
p = Image.open(S + 'future200/portraits/future200_136_old_male_archivist_with_ink_stains.png').convert('RGBA')
sheet = Image.new('RGBA', (256, 64))
for i in range(4):
    sheet.paste(p, (i * 64, 0))
sheet.save(S + 'portraits/dan_anschlagschreiber_emotions.png', optimize=True)
p.resize((24, 24), Image.LANCZOS).save(S + 'portraits/heads/dan_anschlagschreiber.png', optimize=True)

# Benannte Ziele: id -> (Grundblatt, Kartenfigur, Farbwerte)
ZIELE = {
    'weisse_kraehe': ('signalkraehe', 'F_ow_signalkraehe', dict(sat=0.2, val=1.25, pale=0.35)),
    'staubkoenig': ('kalkstaubgeist', 'F_ow_kalkstaubgeist', dict(hue=0.12, sat=1.3, val=1.1)),
    'falsches_signal': ('nachhall', 'F_ow_nachhall', dict(hue=0.55, sat=1.3)),
    'lohnfresserin': ('lohnlistenmotte', 'F_ow_lohnlistenmotte', dict(hue=0.3, sat=1.2)),
    'vorarbeiterin': ('geruestklang', 'F_ow_geruestklang', dict(hue=0.75, sat=1.2)),
    'schichtbaron': ('schichtgaenger', 'F_ow_schichtgaenger', dict(hue=0.97, sat=1.3, val=0.85)),
    'aschenmutter': ('lohnlistenmotte', 'F_ow_lohnlistenmotte', dict(hue=0.85, sat=0.5, val=0.8)),
    'eiserner_kessel': ('geruestklang', 'F_ow_geruestklang', dict(hue=0.05, sat=0.4, val=0.75)),
    'bote': ('schichtgaenger', 'F_ow_schichtgaenger', dict(sat=0.15, val=1.1, pale=0.45)),
    'hueter': ('bn_der_zweite_vorhauer', 'bn_der_zweite_vorhauer', dict(hue=0.02, sat=0.5, val=0.85, pale=0.25)),
}
for zid, (base, ow, kw) in ZIELE.items():
    shift(f'battle/enemy_{base}.png', f'battle/enemy_dan_{zid}.png', **kw)
    shift(f'characters/{ow}.png', f'characters/F_ow_dan_{zid}.png', **kw)
print('ok')

# Manifest: Animationen der Grundblätter übernehmen (manifest-anschlag.json)
import glob, json
basis = {}
for f in glob.glob(S + 'manifest-*.json'):
    if f.endswith('manifest-anschlag.json'):
        continue
    try:
        for a in json.load(open(f)).get('assets', []):
            if a.get('animations') and a.get('file', '').startswith('battle/'):
                basis.setdefault(a['file'], a)
    except Exception:
        pass
assets = []
for zid, (base, _, _) in ZIELE.items():
    a = dict(basis[f'battle/enemy_{base}.png'])
    a.update(id=f'enemy_dan_{zid}', file=f'battle/enemy_dan_{zid}.png', gameId=f'dan_{zid}')
    assets.append(a)
json.dump({'version': 1, 'batch': 'anschlag', 'status': 'umgefärbt', 'assets': assets}, open(S + 'manifest-anschlag.json', 'w'), ensure_ascii=False, indent=1)
print('manifest', len(assets))
