"""Vergleichsbilder Calderwick-Requisiten (python3 tools/art/cw_kulissen/vorschau.py [ref]).
Vorher = Stand ref (git worktree), nachher = Arbeitsstand; gerendert wie im Spiel (tools/art/bh_kulissen/dump.mjs + karte.py)."""
import json, os, shutil, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'bh_kulissen'))
from PIL import Image, ImageDraw
import karte
ROOT, SPR = karte.ROOT, karte.SPR
OUT = os.path.join(ROOT, 'docs', 'art', 'agent-calderwick')
BG, TXT = (40, 42, 54, 255), (232, 216, 168, 255)
ORTE = ['cw_pfandhaus', 'cw_buchbinderei', 'cw_archivsaal', 'cw_villa', 'cw_druckkammer', 'cw_sortierhalle', 'cw_gepaeckhalle', 'cw_kueche',
        'cw_alte_setzerei', 'cw_sortiergrube', 'cw_nullfundament']


def vorher_dump(ref):
    wt = '/tmp/cw_vorher_wt'
    subprocess.run(['git', 'worktree', 'remove', '--force', wt], cwd=ROOT, capture_output=True)
    subprocess.run(['git', 'worktree', 'add', '--detach', wt, ref], cwd=ROOT, check=True, capture_output=True)
    try:
        os.symlink(os.path.join(ROOT, 'node_modules'), os.path.join(wt, 'node_modules'))
        shutil.copytree(os.path.join(ROOT, 'tools', 'art', 'bh_kulissen'), os.path.join(wt, 'tools', 'art', 'bh_kulissen'), dirs_exist_ok=True)
        r = subprocess.run(['node', '--import', './tools/art/bh_kulissen/stub/register.mjs', 'tools/art/bh_kulissen/dump.mjs', *ORTE], cwd=wt, capture_output=True, text=True, check=True)
        return json.loads(r.stdout)
    finally:
        subprocess.run(['git', 'worktree', 'remove', '--force', wt], cwd=ROOT, capture_output=True)


def main(ref):
    os.makedirs(OUT, exist_ok=True)
    a, b = vorher_dump(ref), karte.dump(*ORTE)
    for mid in ORTE:
        ia, ib = karte.render(a[mid]), karte.render(b[mid])
        s = 2 if ia.width < 500 else 1
        ia, ib = ia.resize((ia.width * s, ia.height * s), Image.NEAREST), ib.resize((ib.width * s, ib.height * s), Image.NEAREST)
        out = Image.new('RGBA', (ia.width * 2 + 36, ia.height + 40), BG)
        d = ImageDraw.Draw(out)
        d.text((12, 8), f'{mid}: vorher (Platzhalter-Kloetze)', fill=TXT)
        d.text((ia.width + 24, 8), f'{mid}: nachher (Calderwick-Requisiten)', fill=TXT)
        out.alpha_composite(ia, (12, 28)); out.alpha_composite(ib, (ia.width + 24, 28))
        out.save(os.path.join(OUT, f'vorher_nachher_{mid}.png'))
    # Gesamtbild neben den CE1-Requisiten und Kettlegate-Kulissen
    man = json.load(open(os.path.join(SPR, 'manifest-cw-kulissen.json'), encoding='utf-8'))
    neu = [Image.open(os.path.join(SPR, x['file'])).convert('RGBA') for x in man['assets']]
    m1 = json.load(open(os.path.join(SPR, 'manifest-calderwick1.json'), encoding='utf-8'))
    ce1 = []
    for aid, reg in (('cw_setzergasse', 'druckerpresse_1'), ('cw_setzergasse', 'setzkasten'), ('cw_roehrenhof', 'rohrpost_1'), ('cw_quittungsmarkt', 'marktstand_buecher'),
                     ('cw_quittungsmarkt', 'waage'), ('cw_buchbinderei', 'buchpresse'), ('cw_buchbinderei', 'ofen_1'), ('cw_kronenarchiv', 'hauptpresse_1')):
        x = next(t for t in m1['assets'] if t['id'] == aid)
        r = x['regions'][reg]
        ce1.append(Image.open(os.path.join(SPR, x['file'])).convert('RGBA').crop((r['x'], r['y'], r['x'] + r['width'], r['y'] + r['height'])))
    kg = []
    for f, r in (('props/D_05_nordtor_props.png', (0, 0, 48, 32)), ('props/D_05_nordtor_props.png', (144, 0, 32, 32)), ('props/D_07_strassenmoebel.png', (96, 0, 16, 32)),
                 ('props/D_07_strassenmoebel.png', (0, 192, 48, 32)), ('props/D_05_elend_props.png', (0, 0, 16, 32))):
        kg.append(Image.open(os.path.join(SPR, f)).convert('RGBA').crop((r[0], r[1], r[0] + r[2], r[1] + r[3])))
    fl = Image.open(os.path.join(SPR, 'tilesets', 'cw_druckerei.png')).convert('RGBA').crop((0, 0, 16, 16))
    zeilen = [('NEU: zehn Calderwick-Requisiten', neu), ('Vorlagen Calderwick (CE1)', ce1), ('Kettlegate-Kulissen (Paket D)', kg)]
    W = max(sum(i.width + 6 for i in z) for _, z in zeilen) + 10
    H = sum(max(i.height for i in z) + 26 for _, z in zeilen) + 6
    g = Image.new('RGBA', (W, H), BG)
    y = 4
    for titel, z in zeilen:
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
    for titel, z in zeilen:
        d.text((12, y * 3), titel, fill=TXT)
        y += max(i.height for i in z) + 26
    g.save(os.path.join(OUT, 'gesamt_neben_vorlagen.png'))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'HEAD')
    print('ok')
