"""Validate CE1 exports and refresh the contact sheet. Requires Pillow.
Run from any directory: python tools/art/calderwick1/check.py
"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
SPRITES = ROOT / 'public/sprites'
DOCS = ROOT / 'docs/art'
manifest = json.loads((SPRITES / 'manifest-calderwick1.json').read_text())
TILES = {'cw_terrasse': 32, 'cw_gleis': 23, 'cw_druckerei': 18,
         'cw_amt': 22, 'cw_kueche': 16, 'cw_fundament': 24}
PROPS = {'cw_gleisfuss': 10, 'cw_setzergasse': 11, 'cw_quittungsmarkt': 7,
         'cw_roehrenhof': 8, 'cw_witwenterrasse': 6,
         'cw_kronenarchiv': 10, 'cw_buchbinderei': 9}
ANIMATIONS = {
    'cw_fundament': {'namensnische': (4, 16, 16)},
    'cw_gleisfuss': {'aufzug': (2, 32, 32)},
    'cw_setzergasse': {'druckerpresse': (4, 32, 32), 'fenster': (2, 32, 32),
                     'streiktopf': (2, 32, 32)},
    'cw_roehrenhof': {'rohrpost': (4, 16, 32)},
    'cw_witwenterrasse': {'klopftuer': (2, 32, 32)},
    'cw_kronenarchiv': {'hauptpresse': (4, 64, 48)},
    'cw_buchbinderei': {'ofen': (2, 32, 32)},
}
errors, results = [], []

def require(condition, message):
    if not condition:
        errors.append(message)


def crop(im, region):
    x, y, w, h = (region[k] for k in ('x', 'y', 'width', 'height'))
    return im.crop((x, y, x + w, y + h))


assets = manifest['assets']
require(manifest['batch'] == 'calderwick1', 'batch name')
require(len(assets) == 13, 'exactly 13 assets required')
require({a['id'] for a in assets} == TILES.keys() | PROPS.keys(), 'CE1 asset IDs')
require(len(manifest['palette']) <= 31, 'palette plus transparent entry exceeds 32')
palette = {tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
for a in assets:
    key = a['id']
    path = SPRITES / a['file']
    require(a['file'] == ('tilesets/' if key in TILES else 'props/') + key + '.png', key + ': path')
    if not path.exists():
        errors.append(key + ': missing file')
        continue
    with Image.open(path) as raw:
        require(raw.mode == 'P', key + ': indexed PNG required')
        im = raw.convert('RGBA')
    require(im.size == (a['width'], a['height']), key + ': size')
    require(im.size == (a['columns'] * a['frameWidth'], a['rows'] * a['frameHeight']), key + ': storage grid')
    require(hashlib.sha256(path.read_bytes()).hexdigest() == a['sha256'], key + ': SHA-256')
    alpha = set(im.getchannel('A').tobytes())
    require(alpha <= {0, 255}, key + ': binary alpha')
    require((0 in alpha) if a['transparent'] else alpha == {255}, key + ': declared opacity')
    pixels = list(im.get_flattened_data()) if hasattr(im, 'get_flattened_data') else list(im.getdata())
    colors = {p[:3] for p in pixels if p[3]}
    require(colors <= palette and len(colors) <= 31, key + ': common palette')
    regions = a.get('cells', a.get('regions', {}))
    require(len(regions) == (TILES | PROPS)[key], key + ': region count')
    covered = set()
    for name, r in regions.items():
        x, y, w, h = (r[k] for k in ('x', 'y', 'width', 'height'))
        valid = x >= 0 and y >= 0 and w > 0 and h > 0 and x+w <= im.width and y+h <= im.height
        require(valid, key + '/' + name + ': bounds')
        require(all(v % 16 == 0 for v in (x, y, w, h)), key + '/' + name + ': 16px grid')
        pixels = {(xx, yy) for yy in range(y, y+h) for xx in range(x, x+w)}
        require(not covered & pixels, key + '/' + name + ': overlap')
        covered |= pixels
        require(crop(im, r).getchannel('A').getbbox() is not None, key + '/' + name + ': empty')
    require(all(not im.getpixel((x,y))[3] or (x,y) in covered
                for y in range(im.height) for x in range(im.width)), key + ': nontransparent remainder')
    if key in TILES:
        require((a['frameWidth'], a['frameHeight'], a['columns']) == (16, 16, 8), key + ': tile format')
        require(a['tileNames'] == list(regions), key + ': cell order')
        for i, r in enumerate(regions.values()):
            require((r['index'], r['x'], r['y'], r['width'], r['height']) == (i, i%8*16, i//8*16, 16, 16), key + ': tile index')
    expected = ANIMATIONS.get(key, {})
    require(set(a['animations']) == set(expected), key + ': animation inventory')
    for name, anim in a['animations'].items():
        n, w, h = expected[name]
        frames = anim['frames']
        require(len(frames) == n and len(set(frames)) == n, key + '/' + name + ': frame count')
        require(anim['frameRate'] > 0 and anim['repeat'] == -1, key + '/' + name + ': playback')
        if key in PROPS:
            names = anim['regions']
            require(len(names) == n and all(r in regions for r in names), key + '/' + name + ': frame regions')
            rs = [regions[r] for r in names]
            require((anim['frameWidth'], anim['frameHeight']) == (w,h), key + '/' + name + ': animation size')
        else:
            rs = [list(regions.values())[f] for f in frames]
        for frame, r in zip(frames, rs):
            require((r['width'], r['height']) == (w,h), key + '/' + name + ': crop size')
            require(frame == r['y']//a['frameHeight']*a['columns'] + r['x']//a['frameWidth'], key + '/' + name + ': slot index')
        require(len({crop(im,r).tobytes() for r in rs}) == n, key + '/' + name + ': duplicate frames')
    if key == 'cw_gleisfuss':
        for name in ('gueterwaggon_offen', 'gueterwaggon_zu'):
            require((regions[name]['width'], regions[name]['height']) == (48,32), name + ': 48x32')
    if key == 'cw_kronenarchiv':
        require((regions['direktorenvilla']['width'], regions['direktorenvilla']['height']) == (64,48), 'villa: 64x48')
    if key == 'cw_buchbinderei':
        states = a['states']['buergenbrett']
        require(set(states) == {'leer', 'zwei_verbunden', 'drei_verbunden'}, 'board: exactly three states')
        require(len({crop(im, regions[r]).tobytes() for r in states.values()}) == 3, 'board: distinct states')
        require(all((regions[r]['width'], regions[r]['height']) == (32,32) for r in states.values()), 'board: 32x32')
    results.append(dict(id=key, file=a['file'], size=list(im.size), visibleColors=len(colors),
                        alpha=sorted(alpha), regions=len(regions), animations=len(a['animations'])))

prompts = json.loads((DOCS / 'batch-calderwick1-generation.json').read_text())['prompts']
require({p['id'] for p in prompts} == {a['id'] for a in assets} and len(prompts) == 13, 'prompt coverage')
require(all(p['prompt'].startswith('STYLE GUIDE (apply to every asset):') for p in prompts), 'style block')
report = dict(batch='calderwick1', assets=len(results), tileCells=sum(TILES.values()),
              propRegions=sum(PROPS.values()), errors=errors, passed=not errors,
              checks=['exact CE1 scope', 'dimensions and 16px grid', 'common indexed palette <=32 including transparency',
                      'binary alpha', 'transparent remainder', 'region bounds and overlap',
                      'animation counts, crop sizes, slot indices and distinct frames', 'three manual board states',
                      'PNG SHA-256', 'prompt coverage'],
              visualReview='Contact sheet inspected for requested motifs. Numeric checks do not prove seamless tile joins; integration remains separate.',
              results=results)
(DOCS / 'batch-calderwick1-validation.json').write_text(json.dumps(report, indent=2)+'\n')
if not errors:
    # Labels only in the documentation preview, never in game assets.
    preview = Image.new('RGB', (1080, 7*410), '#252b38')
    draw = ImageDraw.Draw(preview)
    for i,a in enumerate(assets):
        im = Image.open(SPRITES / a['file']).convert('RGBA')
        scale = 4 if a['kind'] == 'tiles' else 2
        im = im.resize((im.width*scale, im.height*scale), Image.Resampling.NEAREST)
        x, y = i%2*540+14, i//2*410+28
        preview.paste(im, (x,y), im)
        draw.text((x,y-18), a['file'], fill='#eee2c5')
    preview.save(DOCS / 'batch-calderwick1-preview.png')
print(f"calderwick1: {len(results)} assets, {sum(TILES.values())} tiles, {sum(PROPS.values())} prop regions; {len(errors)} errors")
for error in errors:
    print(error)
sys.exit(bool(errors))
