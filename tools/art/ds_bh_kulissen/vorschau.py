"""Vergleichsbilder Dunscar/Briarholt-Requisiten (python3 tools/art/ds_bh_kulissen/vorschau.py [ref])."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'cw_kulissen'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'bh_kulissen'))
import vorschau as cwv
from PIL import Image, ImageDraw
import karte
cwv.OUT = os.path.join(karte.ROOT, 'docs', 'art', 'agent-dunscar-briarholt')
cwv.ORTE = ['ds_klopfbruch', 'ds_endbahnhof', 'ds_rufschlucht', 'ds_schlackengrube', 'bh_glasgaerten', 'bh_kesselgrund__warm', 'bh_stillenhaeuser',
            'bh_wurzelkammer', 'bh_winterpromenade', 'bh_kutschenhof']
SPR = karte.SPR


def gesamt():
    man = json.load(open(os.path.join(SPR, 'manifest-ds-bh-kulissen.json'), encoding='utf-8'))
    neu = [Image.open(os.path.join(SPR, a['file'])).convert('RGBA') for a in man['assets']]
    m1 = json.load(open(os.path.join(SPR, 'manifest-dunscar1.json'), encoding='utf-8'))
    ds = []
    for aid in ('ds_schwellenring', 'ds_endbahnhof'):
        a = next(t for t in m1['assets'] if t['id'] == aid)
        src = Image.open(os.path.join(SPR, a['file'])).convert('RGBA')
        for n, r in list(a['regions'].items()):
            if r['width'] <= 64 and r['height'] <= 64 and len(ds) < 8:
                ds.append(src.crop((r['x'], r['y'], r['x'] + r['width'], r['y'] + r['height'])))
    bp = Image.open(os.path.join(SPR, 'props', 'bh_promenade.png')).convert('RGBA')
    bk = Image.open(os.path.join(SPR, 'props', 'bh_kesselgrund.png')).convert('RGBA')
    bh = [bp.crop((96 + 32 * i, 0, 128 + 32 * i, 48)) for i in range(3)] + [bk.crop((112, 0, 144, 32)), bk.crop((0, 32, 32, 64))]
    fl = Image.open(os.path.join(SPR, 'tilesets', 'ds_bruch.png')).convert('RGBA').crop((0, 0, 16, 16))
    zeilen = [('NEU: fuenf Dunscar- und fuenf Briarholt-Requisiten', neu), ('Vorlagen Dunscar (dunscar1)', ds), ('Vorlagen Briarholt (CI)', bh)]
    W = max(sum(i.width + 6 for i in z) for _, z in zeilen) + 10
    H = sum(max(i.height for i in z) + 26 for _, z in zeilen) + 6
    g = Image.new('RGBA', (W, H), cwv.BG)
    y = 4
    for _, z in zeilen:
        h = max(i.height for i in z)
        for yy in range(y + 14, y + 14 + h + 4, 16):
            for xx in range(0, W, 16):
                g.alpha_composite(fl, (xx, yy))
        x = 4
        for im in z:
            g.alpha_composite(im, (x, y + 16 + h - im.height)); x += im.width + 6
        y += h + 26
    g = g.resize((g.width * 3, g.height * 3), Image.NEAREST)
    d = ImageDraw.Draw(g)
    y = 4
    for t, z in zeilen:
        d.text((12, y * 3), t, fill=cwv.TXT)
        y += max(i.height for i in z) + 26
    g.save(os.path.join(cwv.OUT, 'gesamt_neben_vorlagen.png'))


def orte(ref):
    os.makedirs(cwv.OUT, exist_ok=True)
    a, b = cwv.vorher_dump(ref), karte.dump(*cwv.ORTE)
    for mid in cwv.ORTE:
        ia, ib = karte.render(a[mid]), karte.render(b[mid])
        s = 2 if ia.width < 500 else 1
        ia, ib = ia.resize((ia.width * s, ia.height * s), Image.NEAREST), ib.resize((ib.width * s, ib.height * s), Image.NEAREST)
        out = Image.new('RGBA', (ia.width * 2 + 36, ia.height + 40), cwv.BG)
        d = ImageDraw.Draw(out)
        d.text((12, 8), f'{mid}: vorher', fill=cwv.TXT)
        d.text((ia.width + 24, 8), f'{mid}: nachher', fill=cwv.TXT)
        out.alpha_composite(ia, (12, 28)); out.alpha_composite(ib, (ia.width + 24, 28))
        out.save(os.path.join(cwv.OUT, f'vorher_nachher_{mid}.png'))


if __name__ == '__main__':
    orte(sys.argv[1] if len(sys.argv) > 1 else 'HEAD')
    gesamt()
    print('ok')
