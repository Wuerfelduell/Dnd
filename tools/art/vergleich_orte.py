"""Allgemeine Vorher/Nachher-Bilder je Ort (python3 tools/art/vergleich_orte.py <ausgabeordner> <ref> <karte> [<karte> ...]).
Vorher = Stand <ref> (git worktree), nachher = Arbeitsstand; gerendert wie im Spiel über tools/art/bh_kulissen/dump.mjs + karte.py."""
import json, os, shutil, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'bh_kulissen'))
from PIL import Image, ImageDraw
import karte
BG, TXT = (40, 42, 54, 255), (232, 216, 168, 255)


def vorher_dump(ref, orte):
    wt = '/tmp/vergleich_wt'
    subprocess.run(['git', 'worktree', 'remove', '--force', wt], cwd=karte.ROOT, capture_output=True)
    subprocess.run(['git', 'worktree', 'add', '--detach', wt, ref], cwd=karte.ROOT, check=True, capture_output=True)
    try:
        os.symlink(os.path.join(karte.ROOT, 'node_modules'), os.path.join(wt, 'node_modules'))
        shutil.copytree(os.path.join(karte.ROOT, 'tools', 'art', 'bh_kulissen'), os.path.join(wt, 'tools', 'art', 'bh_kulissen'), dirs_exist_ok=True)
        r = subprocess.run(['node', '--import', './tools/art/bh_kulissen/stub/register.mjs', 'tools/art/bh_kulissen/dump.mjs', *orte], cwd=wt, capture_output=True, text=True, check=True)
        return json.loads(r.stdout)
    finally:
        subprocess.run(['git', 'worktree', 'remove', '--force', wt], cwd=karte.ROOT, capture_output=True)


def main(out, ref, orte):
    os.makedirs(out, exist_ok=True)
    a, b = vorher_dump(ref, orte), karte.dump(*orte)
    for mid in orte:
        if mid not in a or mid not in b:
            continue
        ia, ib = karte.render(a[mid]), karte.render(b[mid])
        s = 2 if ia.width < 500 else 1
        ia, ib = ia.resize((ia.width * s, ia.height * s), Image.NEAREST), ib.resize((ib.width * s, ib.height * s), Image.NEAREST)
        o = Image.new('RGBA', (ia.width * 2 + 36, ia.height + 40), BG)
        d = ImageDraw.Draw(o)
        d.text((12, 8), f'{mid}: vorher', fill=TXT)
        d.text((ia.width + 24, 8), f'{mid}: nachher', fill=TXT)
        o.alpha_composite(ia, (12, 28)); o.alpha_composite(ib, (ia.width + 24, 28))
        o.save(os.path.join(out, f'vorher_nachher_{mid}.png'))
        print(mid)


if __name__ == '__main__':
    main(os.path.join(karte.ROOT, sys.argv[1]), sys.argv[2], sys.argv[3:])
