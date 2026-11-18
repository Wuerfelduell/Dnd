"""GB1 per Skript statt Grok: Seq-3/1-Trinken, Auren je Pfad und HUD-Marken aus den CO-Halbgott/Engel-Bildern.

Aufruf aus dem Repo-Wurzelordner:  python3 tools/art/varianten/gb1.py [vorschau.png]
Schreibt (Raster wie die Vorlagen, damit die Animationen aus manifest-halbgott.json weiter passen):
  characters/<look>_drink_seq3.png, <look>_drink_seq1.png   (look = A_player, p2a, p2b; 12 Frames 16x32)
  fx/aura_seq3_<pfad>.png, fx/aura_seq1_<pfad>.png          (4 Frames 24x36, wie HG_aura_halbgott)
  ui/hg_hud_seq31.png (32x16) und ui/hg_hud_seq31_32.png (64x32): Marke Seq 3 | Marke Seq 1
"""
import sys, os, colorsys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
from vlib import load, sheet, lum, mix

SP = 'public/sprites'
PFADE = {'laterne': '#e8b860', 'faden': '#c8b0e8', 'maske': '#e07a8a', 'echo': '#6fe0d0', 'kessel': '#9ad06a', 'eisen': '#a8b4c0',
         'schluessel': '#d0a050', 'sq_waage': '#b4a079', 'sq_moor': '#7d927e', 'sq_uhr': '#92a6b2'}
PALE = (214, 218, 226)  # Seq 1: helles Grau, nie reinweiß


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def is_occ(c):
    """Türkises Okkult-Leuchten der Vorlagen (Kreaturform, Aura)."""
    h, s, v = colorsys.rgb_to_hsv(c[0] / 255, c[1] / 255, c[2] / 255)
    return c[3] and 0.40 < h < 0.56 and s > 0.25 and v > 0.35


def frames(im, fw):
    return [im.crop((i * fw, 0, (i + 1) * fw, im.height)) for i in range(im.width // fw)]


def join(fs):
    out = Image.new('RGBA', (sum(f.width for f in fs), fs[0].height))
    x = 0
    for f in fs:
        out.alpha_composite(f, (x, 0))
        x += f.width
    return out


def remap(im, fn):
    out = im.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            if px[x, y][3]:
                px[x, y] = fn(px[x, y], x, y)
    return out


def mute_occ(f, keep=0.0):
    """Kreaturflackern beherrscht: Türkis wird zu gedecktem Mantelgrau, nur `keep` bleibt."""
    return remap(f, lambda c, x, y: c if not is_occ(c) else mix(c[:3], (58, 64, 72), 1 - keep))


def drink_seq3(base):
    fs = frames(base, 16)
    # Frames 0-8 wie Seq 4, aber das Leuchten fast ganz gedämpft; 9-10 ruhig; Frame 11 = kurzes Flackern (Halo aus Frame 9, blass)
    out = [mute_occ(f, 0.25) for f in fs[:9]] + [mute_occ(fs[11]), mute_occ(fs[11])]
    out.append(remap(fs[9], lambda c, x, y: mix(c[:3], (150, 205, 198), 0.5) if is_occ(c) or lum(c) > 0.7 else c))
    return join(out)


def drink_seq1(base):
    fs = frames(base, 16)
    out = fs[:10]
    # Flasche/Figur wird durchsichtig, Licht von innen: die zwei letzten Frames fast weiß-grau
    for i, t in ((10, 0.4), (11, 0.6)):
        out.append(remap(fs[i], lambda c, x, y, t=t: mix(c[:3], PALE, t if lum(c) > 0.13 else t * 0.5)))
    return join(out)


def aura_seq3(base, col):
    fs = frames(base, 24)
    puls = [0.85, 1.0, 0.9, 0.75]  # ruhiger Puls
    out = []
    for f, v in zip(fs, puls):
        def fn(c, x, y, v=v):
            l = max(0.35, lum(c)) / 0.75
            return (*(min(255, round(ch * l * v)) for ch in col), 255)
        out.append(remap(f, fn))
    return join(out)


def aura_seq1(base, col):
    fs = frames(base, 24)
    tint = mix(PALE, col, 0.12)[:3]
    out = []
    for i, f in enumerate(fs):
        # fast unsichtbar: nur jeder zweite Randpunkt, kein Türkis
        def fn(c, x, y, i=i):
            return (*tint, 255) if (x + y + i) % 2 == 0 else (0, 0, 0, 0)
        out.append(remap(f, fn))
    return join(out)


def hud_marks(hud, size):
    marks = frames(hud, size)
    gold = rgb('#d5ad68')
    def seq3(c, x, y):
        if lum(c) < 0.13:
            return c
        return mix(c[:3], gold, 0.65 if is_occ(c) else 0.35)
    def seq1(c, x, y):
        if lum(c) < 0.13:
            return c
        return mix(c[:3], PALE, 0.7)
    return join([remap(marks[0], seq3), remap(marks[1], seq1)])


def main():
    made = []
    for look in ('A_player', 'p2a', 'p2b'):
        hg = load(f'{SP}/characters/{look}_drink_halbgott.png')
        en = load(f'{SP}/characters/{look}_drink_engel.png')
        for name, im in ((f'{look}_drink_seq3', drink_seq3(hg)), (f'{look}_drink_seq1', drink_seq1(en))):
            im.save(f'{SP}/characters/{name}.png')
            made.append(im)
    aura = load(f'{SP}/fx/HG_aura_halbgott.png')
    for p, h in PFADE.items():
        for name, im in ((f'aura_seq3_{p}', aura_seq3(aura, rgb(h))), (f'aura_seq1_{p}', aura_seq1(aura, rgb(h)))):
            im.save(f'{SP}/fx/{name}.png')
            made.append(im)
    hud16 = hud_marks(load(f'{SP}/ui/HG_hud.png'), 16)
    hud32 = hud_marks(load(f'{SP}/ui/HG_hud_32.png'), 32)
    hud16.save(f'{SP}/ui/hg_hud_seq31.png')
    hud32.save(f'{SP}/ui/hg_hud_seq31_32.png')
    made += [hud32]
    print(f'{len(made) + 1} Dateien geschrieben')
    if len(sys.argv) > 1:
        sheet(made, 1, scale=4).save(sys.argv[1])


if __name__ == '__main__':
    main()
