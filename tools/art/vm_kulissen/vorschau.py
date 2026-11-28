"""Vergleichsbilder der Varrowmouth-Kulissen Runde 1 (python3 tools/art/vm_kulissen/vorschau.py).
gesamt: alle zehn neuen Assets neben den CV-Vorlagen (Varrowmouth) und Kettlegate-Kulissen.
orte: je Ort Vorher/Nachher (Kachelbild wie WorldScene.vmTheme plus Deko aus dem gebauten Content, docs/art/agent-runde1/)."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageDraw
import karte

ROOT = karte.ROOT
SPR = karte.SPR
OUT = os.path.join(ROOT, 'docs', 'art', 'agent-runde1')
BG = (40, 42, 54, 255)
TXT = (232, 216, 168, 255)

NEU = ['vmk_pegelzaun', 'vmk_zolltor', 'vmk_leuchtturm_fuss', 'vmk_wrackrumpf', 'vmk_wrackrumpf_lang', 'vmk_wrackheck',
       'vmk_wrackmutter_rumpf', 'vmk_registerregal', 'vmk_registerschrank', 'vmk_nebelschwaden']
CV = [('props/vm_props.png', r) for r in [(0, 0, 32, 64), (96, 0, 16, 48), (112, 0, 32, 48), (160, 0, 32, 32), (192, 0, 32, 32), (320, 0, 32, 32),
      (352, 0, 32, 32), (448, 0, 32, 32), (80, 64, 48, 32), (304, 64, 48, 32), (384, 64, 32, 32), (416, 64, 32, 32), (448, 64, 32, 32),
      (288, 96, 32, 32), (320, 96, 32, 32), (256, 96, 32, 32), (416, 96, 32, 32), (160, 128, 32, 32)]] + \
     [('facades/vm_fassaden.png', r) for r in [(416, 0, 32, 96), (208, 0, 80, 64), (144, 0, 64, 64)]]
KG = [('props/D_05_nordtor_props.png', r) for r in [(0, 0, 48, 32), (48, 0, 16, 32), (144, 0, 32, 32), (0, 48, 48, 16), (48, 48, 16, 32)]] + \
     [('props/D_07_strassenmoebel.png', r) for r in [(0, 0, 32, 16), (48, 0, 16, 32), (96, 0, 16, 32), (144, 96, 16, 32), (0, 192, 48, 32), (96, 144, 16, 16)]] + \
     [('props/D_05_elend_props.png', r) for r in [(0, 0, 16, 32), (48, 0, 16, 32), (48, 48, 32, 16)]] + \
     [('tilesets/D_06_bruecken.png', r) for r in [(0, 48, 32, 32), (32, 96, 64, 16), (0, 96, 32, 16)]]


def frames(name):
    im = Image.open(os.path.join(SPR, 'props', name + '.png')).convert('RGBA')
    fw = {'vmk_pegelzaun': 16, 'vmk_registerregal': 80, 'vmk_nebelschwaden': 64}.get(name, im.width)
    return [im.crop((i * fw, 0, i * fw + fw, im.height)) for i in range(im.width // fw)]


def reihe(bilder, boden_theme=None, boden_zelle=1, abstand=6, h=None):
    h = h or max(b.height for b in bilder) + 8
    w = sum(b.width for b in bilder) + abstand * (len(bilder) + 1)
    im = Image.new('RGBA', (w, h), BG)
    if boden_theme:
        for y in range(0, h, 16):
            for x in range(0, w, 16):
                im.alpha_composite(karte.tile(boden_theme, boden_zelle), (x, y))
    x = abstand
    for b in bilder:
        im.alpha_composite(b, (x, h - b.height - 4))
        x += b.width + abstand
    return im


def nebel(im, a=0.4):
    im = im.copy()
    im.putalpha(im.split()[3].point(lambda v: int(v * a)))
    return im


def gesamt(scale=3):
    neu = []
    for n in NEU:
        fs = frames(n)
        if n == 'vmk_pegelzaun':
            strip = Image.new('RGBA', (16 * 8, 32))
            for i in range(8):
                strip.alpha_composite(fs[i % 4], (i * 16, 0))
            neu.append(strip)
        elif n == 'vmk_nebelschwaden':
            neu.extend(nebel(f, 0.6) for f in fs)
        elif n == 'vmk_registerregal':
            neu.extend(fs)
        else:
            neu.append(fs[0])
    turm = Image.open(os.path.join(SPR, 'facades', 'vm_fassaden.png')).convert('RGBA').crop((416, 0, 448, 96))
    lt = Image.new('RGBA', (96, 126))
    lt.alpha_composite(neu[2], (0, 46)); lt.alpha_composite(turm, (32, 0))
    neu[2] = lt
    cut = lambda f, r: Image.open(os.path.join(SPR, f)).convert('RGBA').crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
    zeilen = [('NEU: Varrowmouth-Kulissen Runde 1 (Skript, tools/art/vm_kulissen)', reihe(neu[:7], 'vm_wrack', 8)),
              ('NEU (Forts.): Registerkeller und Nebel', reihe(neu[7:], 'vm_innen', 1)),
              ('Vorlagen Varrowmouth (CV, manifest-varrowmouth1)', reihe([cut(f, r) for f, r in CV], 'vm_hafen', 1)),
              ('Kettlegate-Kulissen (Paket D)', reihe([cut(f, r) for f, r in KG], None))]
    W = max(z.width for _, z in zeilen) * scale + 24
    H = sum(z.height * scale + 30 for _, z in zeilen) + 12
    out = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(out)
    y = 8
    for titel, z in zeilen:
        d.text((12, y), titel, fill=TXT)
        y += 18
        out.alpha_composite(z.resize((z.width * scale, z.height * scale), Image.NEAREST), (12, y))
        y += z.height * scale + 12
    return out


def content_decor():
    js = "import { loadContent } from './tests/helpers.js'; const c = loadContent(); const o = {};" \
         "for (const [id, m] of Object.entries(c.maps)) if (m.city === 'varrowmouth') o[id] = { rows: m.rows, tiles: m.tiles, decor: (m.decor ?? []).filter((d) => d.kulisse === 'vm1') };" \
         "console.log(JSON.stringify(o));"
    r = subprocess.run(['node', '--input-type=module', '-e', js], cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


_tex = {}
def textur(key):
    """Deko-Textur wie im Spiel: vmk_* aus props/, vmf_* aus vm_fassaden, vmp_* aus vm_props"""
    if key in _tex:
        return _tex[key]
    m = json.load(open(os.path.join(SPR, 'manifest-varrowmouth1.json'), encoding='utf-8'))
    for pre, aid, f in (('vmf_', 'vm_fassaden', 'facades/vm_fassaden.png'), ('vmp_', 'vm_props', 'props/vm_props.png')):
        if key.startswith(pre):
            reg = next(a for a in m['assets'] if a['id'] == aid)['regions'][key[len(pre):]]
            _tex[key] = [Image.open(os.path.join(SPR, f)).convert('RGBA').crop((reg['x'], reg['y'], reg['x'] + reg['width'], reg['y'] + reg['height']))]
            return _tex[key]
    _tex[key] = frames(key)
    return _tex[key]


def male_decor(im, decor):
    decor = [d for d in decor if not d.get('visible_if', {}).get('requires_flags')]  # Vorschau zeigt Ebbe (z. B. Pegeluhr ohne Flut-Bild)
    for d in sorted(decor, key=lambda d: (d.get('depth', 0) if not d.get('ysort') else 100 + d['tile'][1] * 16 + 16, d['tile'][1])):
        f = textur(d['sprite'])[d.get('frame', 0)]
        if d.get('flip'):
            f = f.transpose(Image.FLIP_LEFT_RIGHT)
        if d.get('alpha', 1) < 1:
            f = nebel(f, d['alpha'])
        ox, oy = d.get('offset', [0, 0])
        x = d['tile'][0] * 16 + 8 + ox
        y = d['tile'][1] * 16 + 8 + oy
        orx, ory = d.get('origin', [0.5, 0.5])
        im.alpha_composite(f, (int(x - f.width * orx), int(y - f.height * ory)))
    return im


def orte(scale=1):
    vorher = json.loads(subprocess.run(['git', 'show', 'origin/main:src/data/packs/k6_orte/vm_karten.json'], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
    nach = content_decor()
    erg = {}
    for mid, m in nach.items():
        if not m['decor']:
            continue
        a = karte.render_ground(vorher[mid]['rows'], m['tiles'])
        b = male_decor(karte.render_ground(m['rows'], m['tiles']), m['decor'])
        W, H = a.width * 2 + 36, a.height + 40
        out = Image.new('RGBA', (W, H), BG)
        d = ImageDraw.Draw(out)
        d.text((12, 8), f'{mid}: vorher (origin/main)', fill=TXT)
        d.text((a.width + 24, 8), f'{mid}: nachher (Runde 1)', fill=TXT)
        out.alpha_composite(a, (12, 28)); out.alpha_composite(b, (a.width + 24, 28))
        erg[mid] = out
    return erg


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    gesamt().save(os.path.join(OUT, 'gesamt_neben_vorlagen.png'))
    print('gesamt_neben_vorlagen.png')
    if '--orte' in sys.argv:
        for mid, im in orte().items():
            im.save(os.path.join(OUT, f'vorher_nachher_{mid}.png'))
            print(f'vorher_nachher_{mid}.png')
