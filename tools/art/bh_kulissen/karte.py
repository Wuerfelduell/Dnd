"""Rendert Briarholt-Karten aus dump.mjs (Kacheln wie tileIndexFor, Deko wie WorldScene.buildObjects). Nur für Vorschauen."""
import json, os, subprocess
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SPR = os.path.join(ROOT, 'public', 'sprites')
T = 16
_img = {}


def img(f):
    if f not in _img:
        _img[f] = Image.open(os.path.join(SPR, f)).convert('RGBA')
    return _img[f]


def dump(*ids):
    r = subprocess.run(['node', '--import', './tools/art/bh_kulissen/stub/register.mjs', 'tools/art/bh_kulissen/dump.mjs', *ids],
                       cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def zelle(c):
    if not c or not c.get('file'):
        return Image.new('RGBA', (T, T), (26, 28, 44, 255))  # generische Füllkachel (im Spiel unter den Dächern)
    out = zelle(c['base']) if c.get('base') else Image.new('RGBA', (T, T))
    s = img(c['file'])
    if c.get('rectTile'):
        x, y = c['rectTile']
        out.alpha_composite(s.crop((x, y, x + T, y + T)))
        return out
    i = c['index']
    cols = s.width // T
    out.alpha_composite(s.crop(((i % cols) * T, (i // cols) * T, (i % cols) * T + T, (i // cols) * T + T)))
    return out


def deko_bild(src, frame=0):
    s = img(src['file'])
    if src.get('grid'):
        cols = s.width // src['w']
        f = src.get('frame', frame)
        return s.crop(((f % cols) * src['w'], (f // cols) * src['h'], (f % cols) * src['w'] + src['w'], (f // cols) * src['h'] + src['h']))
    if 'grid16' in src:
        cols = s.width // 16
        f = src['grid16']
        return s.crop(((f % cols) * 16, (f // cols) * 16, (f % cols) * 16 + src['w'], (f // cols) * 16 + src['h']))
    if src.get('rect'):
        x, y, w, h = src['rect']
        return s.crop((x, y, x + w, y + h))
    return s


def render(m, deko=True):
    rows = m['rows']
    im = Image.new('RGBA', (len(rows[0]) * T, len(rows) * T), (26, 28, 44, 255))
    cache = {}
    for y, row in enumerate(m['tiles']):
        for x, k in enumerate(row):
            if k not in cache:
                cache[k] = zelle(m['cells'].get(k))
            im.alpha_composite(cache[k], (x * T, y * T))
    if not deko:
        return im
    ops = []
    for d in m['decor']:
        if not d.get('src'):
            continue
        f = deko_bild(d['src'], d.get('frame', 0))
        if d.get('flip'):
            f = f.transpose(Image.FLIP_LEFT_RIGHT)
        ox, oy = d.get('offset', [0, 0])
        x = d['tile'][0] * T + 8 + ox
        y = d['tile'][1] * T + 8 + oy
        po = m['origins'].get(d['sprite'])
        orx, ory = d.get('origin') or ([0.5, po] if po is not None else [0.5, 0.5])
        depth = 100 + y + f.height * (1 - ory) if d.get('ysort') else d.get('depth', 50)
        a = d.get('alpha', 0.85)
        if a < 1:
            f = f.copy()
            f.putalpha(f.split()[3].point(lambda v, a=a: int(v * a)))
        ops.append((depth, len(ops), f, int(x - f.width * orx), int(y - f.height * ory)))
    for _, _, f, x, y in sorted(ops, key=lambda o: (o[0], o[1])):
        im.alpha_composite(f, (x, y))
    return im
