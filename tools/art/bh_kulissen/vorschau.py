"""Vergleichsbilder der Briarholt-Kulissen (python3 tools/art/bh_kulissen/vorschau.py).
gesamt: zehn neue Assets neben den alten future200-Dachtexturen, den CI-Requisiten (Briarholt) und Kettlegate-Kulissen.
orte: je Ort vorher (Stand vor dieser Runde, git worktree) und nachher, gerendert wie im Spiel (dump.mjs + karte.py)."""
import json, os, shutil, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageDraw
import karte

ROOT = karte.ROOT
SPR = karte.SPR
OUT = os.path.join(ROOT, 'docs', 'art', 'agent-runde2-briarholt')
BG = (40, 42, 54, 255)
TXT = (232, 216, 168, 255)
ORTE = ['bh_kutschenhof', 'bh_kesselgrund__warm', 'bh_stillenhaeuser', 'bh_wurzelkammer', 'bh_labor', 'bh_mutterhaus', 'bh_aktenraum', 'bh_kutschenhalle']
FRAMES = ['innen_a', 'innen_b', 'innen_detail', 'oben', 'unten', 'links', 'rechts', 'oben_links', 'oben_rechts', 'unten_links', 'unten_rechts']


def dachblock(name, warm, w=6, h=4):
    s = Image.open(os.path.join(SPR, 'props', name + '.png')).convert('RGBA')
    blk = Image.new('RGBA', (w * 16, h * 16))
    for y in range(h):
        for x in range(w):
            o, u, l, r = y == 0, y == h - 1, x == 0, x == w - 1
            n = ('oben' if o else 'unten' if u else '') + ('_' if (o or u) and (l or r) else '') + ('links' if l else 'rechts' if r else '')
            n = n or ('innen_detail' if (x, y) == (w // 2, 1) else 'innen_b' if (x + y) % 3 == 0 else 'innen_a')
            i = FRAMES.index(n)
            blk.alpha_composite(s.crop((i * 16, warm * 16, i * 16 + 16, warm * 16 + 16)), (x * 16, y * 16))
    return blk


def texblock(path, w=6, h=4):
    t = Image.open(os.path.join(SPR, path)).convert('RGBA').crop((0, 0, 16, 16))
    blk = Image.new('RGBA', (w * 16, h * 16))
    for y in range(h):
        for x in range(w):
            blk.alpha_composite(t, (x * 16, y * 16))
    return blk


def reihe(bilder, bg_tile=None, abstand=6):
    h = max(b.height for b in bilder) + 8
    w = sum(b.width for b in bilder) + abstand * (len(bilder) + 1)
    im = Image.new('RGBA', (w, h), BG)
    if bg_tile:
        t = Image.open(os.path.join(SPR, bg_tile[0])).convert('RGBA').crop(bg_tile[1])
        for y in range(0, h, 16):
            for x in range(0, w, 16):
                im.alpha_composite(t, (x, y))
    x = abstand
    for b in bilder:
        im.alpha_composite(b, (x, h - b.height - 4))
        x += b.width + abstand
    return im


def frames(name, fw):
    s = Image.open(os.path.join(SPR, 'props', name + '.png')).convert('RGBA')
    return [s.crop((i * fw, 0, i * fw + fw, s.height)) for i in range(s.width // fw)]


def gesamt(scale=3):
    mats = ['kupfer', 'schiefer', 'ziegel', 'basalt']
    alt = {'kupfer': 196, 'schiefer': 187, 'ziegel': 188, 'basalt': 191}
    altn = {196: 'copper_patina_roofing', 187: 'slate_roof_shingles', 188: 'weathered_clay_roof_tiles', 191: 'dark_basalt_blocks'}
    neu_d = [dachblock(f'bhk_dach_{m}', w) for m in mats for w in (0, 1)]
    alt_d = [texblock(f'future200/tiles/future200_{alt[m]}_{altn[alt[m]]}.png') for m in mats]
    props = frames('bhk_labortisch', 48) + frames('bhk_laborregal', 32) + frames('bhk_planschrank', 48) + frames('bhk_rollenstaender', 16) + \
        frames('bhk_aktenschrank', 32) + frames('bhk_gepaeckstapel', 32)
    ci = []
    m = json.load(open(os.path.join(SPR, 'manifest-briarholt1.json'), encoding='utf-8'))
    for aid, reg in [('bh_stillenhaeuser', 'bett_tafel_radiert'), ('bh_stillenhaeuser', 'teewagen'), ('bh_stillenhaeuser', 'speisesaal_tisch'),
                     ('bh_wurzelkranz', 'sudkessel_0'), ('bh_wurzelkranz', 'zeichentisch_fundamentplan'), ('bh_kesselgrund', 'wartungsschrank'),
                     ('bh_kesselgrund', 'buegelbrett'), ('bh_kesselgrund', 'kiste'), ('bh_kesselgrund', 'lager'), ('bh_promenade', 'palme_kalt'),
                     ('bh_promenade', 'gaslaterne'), ('bh_kutschenhof', 'wartebank_frost')]:
        a = next(x for x in m['assets'] if x['id'] == aid)
        regs = a['regions'] if isinstance(a['regions'], dict) else {r['name']: r for r in a['regions']}
        r = regs[reg]
        x, y, w, h = (r['x'], r['y'], r.get('width', r.get('w')), r.get('height', r.get('h')))
        ci.append(Image.open(os.path.join(SPR, a['file'])).convert('RGBA').crop((x, y, x + w, y + h)))
    kg = []
    for f, r in [('props/D_05_nordtor_props.png', (0, 0, 48, 32)), ('props/D_05_nordtor_props.png', (48, 0, 16, 32)), ('props/D_05_nordtor_props.png', (144, 0, 32, 32)),
                 ('props/D_07_strassenmoebel.png', (48, 0, 16, 32)), ('props/D_07_strassenmoebel.png', (96, 0, 16, 32)), ('props/D_07_strassenmoebel.png', (0, 192, 48, 32)),
                 ('props/D_05_elend_props.png', (0, 0, 16, 32)), ('props/D_05_elend_props.png', (48, 48, 32, 16))]:
        kg.append(Image.open(os.path.join(SPR, f)).convert('RGBA').crop((r[0], r[1], r[0] + r[2], r[1] + r[3])))
    boden = ('tilesets/bh_stille_kalt.png', (0, 0, 16, 16))
    zeilen = [('NEU: Briarholt-Daecher (je kalt mit Reif | warm): Kupfer, Schiefer, Ziegel, Basalt', reihe(neu_d)),
              ('VORHER: future200-Vorratstexturen an derselben Stelle (Kupfer, Schiefer, Ziegel, Basalt)', reihe(alt_d)),
              ('NEU: Innenraum-Stuecke (Labortisch, Laborregal, Planschrank, Rollenstaender, Aktenschrank zu/offen, Gepaeckstapel)', reihe(props, boden)),
              ('Vorlagen Briarholt (CI, manifest-briarholt1)', reihe(ci, boden)),
              ('Kettlegate-Kulissen (Paket D)', reihe(kg))]
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


def vorher_dump(ref):
    wt = '/tmp/bh_vorher_wt'
    if os.path.exists(wt):
        subprocess.run(['git', 'worktree', 'remove', '--force', wt], cwd=ROOT, capture_output=True)
    subprocess.run(['git', 'worktree', 'add', '--detach', wt, ref], cwd=ROOT, check=True, capture_output=True)
    try:
        os.symlink(os.path.join(ROOT, 'node_modules'), os.path.join(wt, 'node_modules'))
        shutil.copytree(os.path.dirname(os.path.abspath(__file__)), os.path.join(wt, 'tools', 'art', 'bh_kulissen'), dirs_exist_ok=True)
        r = subprocess.run(['node', '--import', './tools/art/bh_kulissen/stub/register.mjs', 'tools/art/bh_kulissen/dump.mjs', *ORTE], cwd=wt, capture_output=True, text=True, check=True)
        return json.loads(r.stdout)
    finally:
        subprocess.run(['git', 'worktree', 'remove', '--force', wt], cwd=ROOT, capture_output=True)


def orte(ref, scale=1):
    a, b = vorher_dump(ref), karte.dump(*ORTE)
    erg = {}
    for mid in ORTE:
        ia, ib = karte.render(a[mid]), karte.render(b[mid])
        s = 2 if ia.width < 500 else 1
        ia, ib = ia.resize((ia.width * s, ia.height * s), Image.NEAREST), ib.resize((ib.width * s, ib.height * s), Image.NEAREST)
        out = Image.new('RGBA', (ia.width * 2 + 36, ia.height + 40), BG)
        d = ImageDraw.Draw(out)
        d.text((12, 8), f'{mid}: vorher ({ref}, Stand vor dieser Runde)', fill=TXT)
        d.text((ia.width + 24, 8), f'{mid}: nachher (Briarholt-Kulissen)', fill=TXT)
        out.alpha_composite(ia, (12, 28)); out.alpha_composite(ib, (ia.width + 24, 28))
        erg[mid] = out
    return erg


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    gesamt().save(os.path.join(OUT, 'gesamt_neben_vorlagen.png'))
    print('gesamt_neben_vorlagen.png')
    ref = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
    for mid, im in orte(ref).items():
        im.save(os.path.join(OUT, f'vorher_nachher_{mid}.png'))
        print(f'vorher_nachher_{mid}.png')
