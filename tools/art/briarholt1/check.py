#!/usr/bin/env python3
"""Prüfskript für Batch briarholt1 (Codex-Paket CI). Benötigt Pillow.

Prüft je Datei: Existenz, Maße, Raster füllt das Blatt, binäres Alpha,
gemeinsame Palette (max. 32 sichtbare Farben), transparente Pixel mit RGB 0,
Transparenz-Metadaten, Regionen/Zellen innerhalb und nicht leer, Animations-
Frames gültig und unterschiedlich. Zusätzlich: kalt und warm je Tileset haben
gleiche Maße und dieselben belegten Zellen, Szenen/Karten/Kampf-Hintergründe
sind opak, Overlays haben gleiche Größe wie die Stadtkarte, Herkunfts-Hashes.

Aufruf:  python tools/art/briarholt1/check.py [--write]
--write schreibt den Bericht nach docs/art/batch-briarholt1-validation.json.
"""
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SPRITES = ROOT / 'public/sprites'
MANIFEST = SPRITES / 'manifest-briarholt1.json'
PROVENANCE = ROOT / 'docs/art/batch-briarholt1-generation.json'
REPORT = ROOT / 'docs/art/batch-briarholt1-validation.json'

REQUIRED = [
    *[f'tilesets/bh_{t}_{v}.png' for t in ('promenade', 'kessel', 'glas', 'stille', 'klinik', 'wurzel') for v in ('kalt', 'warm')],
    *[f'props/bh_{p}.png' for p in ('kutschenhof', 'kesselgrund', 'promenade', 'glasgaerten', 'stillenhaeuser', 'wurzelkranz')],
    'fx/bh_waerme.png',
    'ui/scenes/bh_ankunft.png', 'ui/scenes/bh_trockenraum.png', 'ui/scenes/bh_pfirsich.png',
    'ui/scenes/bh_ende_wahl.png', 'ui/scenes/bh_ende_winter.png', 'ui/scenes/bh_ende_verwahrt.png',
    'ui/scenes/bh_ende_schmerzlos.png', 'ui/scenes/bh_ende_schmerzlos_lichtmeister.png',
    *[f'battle/bg_bh_{b}.png' for b in ('kutschenhof', 'kesselgrund_kalt', 'kesselgrund_warm', 'promenade', 'glasgaerten_kalt',
                                        'glasgaerten_warm', 'stillenhaeuser', 'wurzelkranz', 'verteilanlage')],
    'ui/bh_karte.png', 'ui/bh_karte_nebel.png', 'ui/bh_karte_leitungen.png', 'ui/bh_marker.png',
    'ui/scenes/kapitel5_karte.png',
]
SIZES = {
    'ui/scenes/bh_ankunft.png': (480, 270), 'ui/scenes/kapitel5_karte.png': (480, 270),
    'ui/bh_karte.png': (480, 270), 'ui/bh_karte_nebel.png': (480, 270), 'ui/bh_karte_leitungen.png': (480, 270),
}
MAP_IDS = ['bh_kutschenhof', 'bh_kesselgrund', 'bh_winterpromenade', 'bh_glasgaerten', 'bh_stillenhaeuser', 'bh_wurzelkranz',
           'bh_buegelraum', 'bh_kutschenhalle', 'bh_pavillon', 'bh_verkaufshalle', 'bh_speisesaal', 'bh_aktenraum',
           'bh_labor', 'bh_mutterhaus', 'bh_verteilanlage', 'bh_kaltes_palmhaus', 'bh_verlassene_waescherei', 'bh_wurzelkammer']


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    errors, results = [], []

    def require(cond, msg):
        if not cond:
            errors.append(msg)
        return cond

    manifest = json.loads(MANIFEST.read_text())
    assets = manifest['assets']
    by_file = {a['file']: a for a in assets}
    require(len({a['id'] for a in assets}) == len(assets), 'doppelte Asset-IDs')
    palette = {tuple(bytes.fromhex(c.lstrip('#'))) for c in manifest['palette']}
    require(len(palette) <= 32, 'Palette hat mehr als 32 Farben')
    require(palette and (0x1a, 0x1c, 0x2c) in palette, 'Outline #1a1c2c fehlt in der Palette')
    for f in REQUIRED:
        require(f in by_file, f'Pflichtdatei fehlt im Manifest: {f}')
    all_visible = set()
    images = {}
    for a in assets:
        path = SPRITES / a['file']
        if not require(path.is_file(), f"{a['file']}: Datei fehlt"):
            continue
        raw = Image.open(path)
        im = raw.convert('RGBA')
        images[a['file']] = im
        w, h = im.size
        require((w, h) == (a['width'], a['height']), f"{a['file']}: Maße {im.size} != Manifest")
        require((w, h) == (a['columns'] * a['frameWidth'], a['rows'] * a['frameHeight']), f"{a['file']}: Raster füllt Blatt nicht")
        if a['file'] in SIZES:
            require((w, h) == SIZES[a['file']], f"{a['file']}: Zielgröße {SIZES[a['file']]}")
        if a['file'].startswith('ui/scenes/') and a['file'] not in SIZES:
            require((w, h) == (240, 135), f"{a['file']}: Szenenbild muss 240x135 sein")
        if a['file'].startswith('battle/'):
            require((w, h) == (480, 270), f"{a['file']}: Kampf-Hintergrund muss 480x270 sein")
        if a['kind'] == 'tiles' or a['frameWidth'] == 16:
            require(w % 16 == 0 and h % 16 == 0, f"{a['file']}: nicht im 16er-Raster")
        px = list(im.get_flattened_data()) if hasattr(im, "get_flattened_data") else list(im.getdata())
        alphas = {p[3] for p in px}
        require(alphas <= {0, 255}, f"{a['file']}: Alpha nicht binär")
        visible = {p[:3] for p in px if p[3]}
        all_visible |= visible
        require(len(visible) <= 32, f"{a['file']}: {len(visible)} Farben > 32")
        require(visible <= palette, f"{a['file']}: Farben außerhalb der Palette: {len(visible - palette)}")
        require(all(p[:3] == (0, 0, 0) for p in px if not p[3]), f"{a['file']}: transparente Pixel nicht RGB 0")
        require(bool(a['transparent']) == (0 in alphas), f"{a['file']}: Transparenz-Metadaten")
        require(sha(path) == a['sha256'], f"{a['file']}: SHA-256 weicht vom Manifest ab")
        if a['kind'] in ('background', 'still', 'map', 'tiles'):
            require(alphas == {255}, f"{a['file']}: muss opak sein")
        regions = dict(a.get('regions', {}))
        regions.update(a.get('cells', {}))
        for name, box in regions.items():
            x, y, bw, bh = box['x'], box['y'], box['width'], box['height']
            if require(x >= 0 and y >= 0 and x + bw <= w and y + bh <= h, f"{a['file']}/{name}: Region außerhalb"):
                require(im.crop((x, y, x + bw, y + bh)).getchannel('A').getbbox() is not None, f"{a['file']}/{name}: Region leer")
        for anim, spec in a.get('animations', {}).items():
            fr = spec['frames']
            n = a['columns'] * a['rows']
            require(fr and all(0 <= i < n for i in fr) and spec['frameRate'] > 0, f"{a['file']}/{anim}: Frames ungültig")
            crops = [im.crop((i % a['columns'] * a['frameWidth'], i // a['columns'] * a['frameHeight'],
                              i % a['columns'] * a['frameWidth'] + a['frameWidth'], i // a['columns'] * a['frameHeight'] + a['frameHeight'])).tobytes() for i in fr]
            require(len(set(crops)) == len(crops), f"{a['file']}/{anim}: doppelte Animationsphasen")
        for anim, spec in a.get('regionAnimations', {}).items():
            fr = spec['frames']
            if require(all(f in a['regions'] for f in fr), f"{a['file']}/{anim}: Frame-Region fehlt"):
                sizes = {(a['regions'][f]['width'], a['regions'][f]['height']) for f in fr}
                require(len(sizes) == 1, f"{a['file']}/{anim}: Frames unterschiedlich groß")
                crops = [im.crop((a['regions'][f]['x'], a['regions'][f]['y'], a['regions'][f]['x'] + a['regions'][f]['width'],
                                  a['regions'][f]['y'] + a['regions'][f]['height'])).tobytes() for f in fr]
                require(len(set(crops)) == len(crops), f"{a['file']}/{anim}: doppelte Animationsphasen")
        results.append({'file': a['file'], 'size': [w, h], 'visibleColors': len(visible), 'sha256': a['sha256']})
    # kalt / warm Paare
    pairs = 0
    for a in assets:
        if a['kind'] == 'tiles' and a.get('variant') == 'kalt':
            warm = by_file.get(a['variants']['warm'])
            if not require(warm is not None, f"{a['file']}: warm-Variante fehlt"):
                continue
            k, wm = images.get(a['file']), images.get(warm['file'])
            if k is None or wm is None:
                continue
            pairs += 1
            require(k.size == wm.size, f"{a['theme']}: kalt/warm Maße verschieden")
            require(a['tileNames'] == warm['tileNames'], f"{a['theme']}: Zellenbelegung (Namen) verschieden")
            for i in range(a['columns'] * a['rows']):
                box = (i % 8 * 16, i // 8 * 16, i % 8 * 16 + 16, i // 8 * 16 + 16)
                ok = (k.crop(box).getchannel('A').getbbox() is None) == (wm.crop(box).getchannel('A').getbbox() is None)
                require(ok, f"{a['theme']}: Zelle {i} nur in einer Variante belegt")
            require(k.tobytes() != wm.tobytes(), f"{a['theme']}: kalt und warm identisch")
            # keine doppelten Zellen innerhalb eines Blatts
            for img, nm in ((k, 'kalt'), (wm, 'warm')):
                seen = {}
                for i in range(a['columns'] * a['rows']):
                    box = (i % 8 * 16, i // 8 * 16, i % 8 * 16 + 16, i // 8 * 16 + 16)
                    key = img.crop(box).tobytes()
                    require(key not in seen, f"{a['theme']}_{nm}: Zelle {i} doppelt (wie {seen.get(key)})")
                    seen.setdefault(key, i)
            # warm ist eine eigene Zeichnung, kein reines Umfärben: pro Zelle keine 1:1-Farbabbildung kalt->warm
            recol = 0
            for i in range(a['columns'] * a['rows']):
                box = (i % 8 * 16, i // 8 * 16, i % 8 * 16 + 16, i // 8 * 16 + 16)
                kp = k.crop(box).convert('RGB').tobytes(); wp = wm.crop(box).convert('RGB').tobytes()
                mp = {}
                same = True
                for j in range(0, len(kp), 3):
                    if mp.setdefault(kp[j:j + 3], wp[j:j + 3]) != wp[j:j + 3]:
                        same = False
                        break
                recol += same
            require(recol == 0, f"{a['theme']}: {recol} Zellen sind nur umgefärbt")
    # Overlays / Karte / Marker
    karte = by_file.get('ui/bh_karte.png')
    for f in ('ui/bh_karte_nebel.png', 'ui/bh_karte_leitungen.png'):
        if f in images:
            require(images[f].getchannel('A').getextrema() == (0, 255), f'{f}: Overlay braucht Transparenz')
    if 'ui/bh_karte_leitungen.png' in images:
        lim = images["ui/bh_karte_leitungen.png"]
        cols = {p[:3] for p in (lim.get_flattened_data() if hasattr(lim, "get_flattened_data") else lim.getdata()) if p[3]}
        for c in ('#e8b860', '#71858b', '#8c7295'):
            require(tuple(bytes.fromhex(c[1:])) in cols, f'Leitungsplan: Farbe {c} fehlt')
    marker = by_file.get('ui/bh_marker.png')
    if marker:
        require(set(MAP_IDS) <= set(marker['regions']), 'Marker: nicht alle Karten-IDs aus den Eckdaten')
    if karte:
        require('pins' in karte, 'Stadtkarte: Pins fehlen')
    # Herkunft
    prov = json.loads(PROVENANCE.read_text())
    outs = {o for j in prov['jobs'] for o in j['outputs']}
    require(outs == set(by_file), 'Prompt-Protokoll deckt nicht genau alle Dateien ab')
    for j in prov['jobs']:
        if j.get('prompt'):
            require(j['prompt'].startswith('STYLE GUIDE (apply to every asset):'), f"{j['id']}: Style-Block fehlt am Prompt-Anfang")
        for o, hsh in j['outputSha256'].items():
            require((SPRITES / o).is_file() and sha(SPRITES / o) == hsh, f"{j['id']}: Ausgabe-Hash {o} weicht ab")
    report = {'batch': 'briarholt1', 'codex': 'CI', 'passed': not errors, 'pngCount': len(results),
              'kaltWarmPairs': pairs, 'sharedVisibleColors': len(all_visible), 'errors': errors,
              'checks': ['Pflichtdateien', 'Maße', 'Raster', 'binäres Alpha', 'Palette <=32', 'transparente Pixel RGB 0',
                         'Transparenz-Metadaten', 'opake Szenen/Karten/Hintergründe', 'Regionen/Zellen nicht leer',
                         'Animationsphasen verschieden', 'kalt/warm gleiche belegte Zellen', 'keine doppelten Tileset-Zellen', 'warm nicht nur umgefärbt', 'Overlays', 'Marker-IDs',
                         'Style-Block in jedem Prompt', 'SHA-256'],
              'assets': results}
    if '--write' in sys.argv:
        REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    if errors:
        print('FEHLER:\n  ' + '\n  '.join(errors))
        sys.exit(1)
    print(f'OK: {len(results)} PNGs, {pairs} kalt/warm-Paare, gemeinsame Palette ({len(all_visible)} sichtbare Farben), '
          'binäres Alpha, Raster, Regionen, Animationen, Herkunft.')


if __name__ == '__main__':
    main()
