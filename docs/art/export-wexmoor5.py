"""Export Paket W from the accepted image_gen originals (Pillow, numpy, scipy).

Usage: python docs/art/export-wexmoor5.py SOURCE_DIR
SOURCE_DIR contains the source basenames recorded in batch-wexmoor5-generation.json.
Only documented crops, nearest-neighbour scaling, palette/alpha cleanup and
frame alignment are performed here. No procedural replacement illustrations.
"""
import hashlib
import json
import pathlib
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import label

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/sprites'
LOG = ROOT / 'docs/art/batch-wexmoor5-generation.json'
NN = Image.Resampling.NEAREST
PAL = ['#1a1c2c', '#6b333c', '#303b49', '#425360', '#586c78', '#71858b',
       '#95a5a5', '#2d2629', '#413433', '#58433c', '#715648', '#92745a',
       '#b3946e', '#cfb18a', '#e0c9a1', '#494b3a', '#686850', '#8b8870',
       '#b4ac91', '#dbd2b3', '#eee2c5', '#173d40', '#36817a', '#8058aa',
       '#e8f0ff', '#9ad06a', '#e8b860', '#c8b0e8', '#e07a8a', '#6fe0d0',
       '#a8b4c0', '#d0a050']
PALETTE = np.array([tuple(bytes.fromhex(c[1:])) for c in PAL], dtype=np.int32)


def quantize(im):
    ar = np.array(im.convert('RGBA'))
    rgb = ar[:, :, :3].astype(np.int32)
    ix = ((rgb[:, :, None, :] - PALETTE) ** 2).sum(3).argmin(2).astype('uint8') + 1
    ix[ar[:, :, 3] < 128] = 0
    out = Image.fromarray(ix, 'P')
    out.putpalette([0, 0, 0] + PALETTE.flatten().tolist() + [0] * (768 - 99))
    out.info['transparency'] = 0
    return out


def cleanup(im, threshold=200, white_matte=False):
    ar = np.array(im.convert('RGBA'))
    mask = ar[:, :, 3] >= threshold
    if white_matte:
        rgb = ar[:, :, :3].astype(int)
        mask &= ~((rgb.min(2) > 215) & (rgb.max(2) - rgb.min(2) < 20))
    labs, _ = label(mask)
    sizes = np.bincount(labs.ravel())
    keep = np.where(sizes >= max(12, mask.sum() * .0003))[0]
    mask = np.isin(labs, keep[keep != 0])
    ar[:, :, 3] = mask * 255
    ar[~mask, :3] = 0
    return Image.fromarray(ar)


def trim(im):
    box = im.getchannel('A').getbbox()
    if box is None:
        raise ValueError('Unexpected empty active source frame')
    return im.crop(box), list(box)


def fit(im, w, h):
    scale = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), NN)


def animation(frames, fps=8, repeat=0):
    return dict(frames=frames, frameRate=fps, repeat=repeat)


def main(source_dir):
    log = json.loads(LOG.read_text())
    assets = []
    exported = {}

    def save(im, asset_id, path, transparent, **meta):
        target = OUT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        result = quantize(im)
        result.save(target)
        assets.append(dict(id=asset_id, file=path, width=im.width, height=im.height,
                           transparent=transparent, **meta))
        exported[asset_id] = result.convert('RGBA')

    for job in log['jobs']:
        ident, kind = job['id'], job['kind']
        source = source_dir / job['source']
        raw = source.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if 'sha256' in job and digest != job['sha256']:
            raise ValueError(f'Source checksum mismatch: {source.name}')
        job['sha256'] = digest
        im = Image.open(source).convert('RGBA')
        cols, rows = job.get('cols', 1), job.get('rows', 1)
        if job['transparent']:
            im = cleanup(im, job['alphaThreshold'], job.get('removeWhiteMatte', False))
        else:
            im.putalpha(255)
        rects = job.get('sourceRects') or [
            [round(x * im.width / cols), round(y * im.height / rows),
             round((x + 1) * im.width / cols), round((y + 1) * im.height / rows)]
            for y in range(rows) for x in range(cols)]
        job['sourceRects'] = rects
        cells = [im.crop(rect) for rect in rects]
        meta = dict(frameWidth=16, frameHeight=16, columns=1, rows=1)
        if kind in ('battle', 'walk'):
            fw, fh = job['frame']
            canvas = Image.new('RGBA', (fw * cols, fh * rows))
            active = {y * cols + x: trim(cells[y * cols + x])
                      for y, count in enumerate(job['counts']) for x in range(count)}
            scale = min(min((fw - (4 if kind == 'battle' else 2)) / c.width,
                            (fh - 3) / c.height) for c, _ in active.values())
            baseline = fh - (2 if kind == 'battle' else 1)
            for y, count in enumerate(job['counts']):
                for x in range(count):
                    index = y * cols + (0 if kind == 'battle' and y in (1, 2) and x == 1 else x)
                    c = active[index][0]
                    c = c.resize((max(1, round(c.width * scale)), max(1, round(c.height * scale))), NN)
                    c, _ = trim(c)  # NN can skip the source's final occupied pixel row.
                    canvas.paste(c, (x * fw + (fw - c.width) // 2, y * fh + baseline - c.height))
            job['contentRects'] = {str(i): box for i, (_, box) in active.items()}
            job['uniformScale'] = scale
            meta = dict(frameWidth=fw, frameHeight=fh, columns=cols, rows=rows,
                        baseline=baseline, baselineConvention='exclusive pixel row',
                        animations={name: animation(list(range(y * cols, y * cols + job['counts'][y])),
                                                    7 if kind == 'walk' else (6 if y == 0 else 9),
                                                    -1 if kind == 'walk' or y == 0 else 0)
                                    for y, name in enumerate(job['names'])})
            if kind == 'battle':
                meta.update(windupRows=[1, 2], facing='left')
        elif kind in ('card', 'bg'):
            canvas = im.resize(job['size'], NN)
            meta = dict(frameWidth=canvas.width, frameHeight=canvas.height, columns=1, rows=1)
            if ident == 'bg_altstadt':
                meta['groundStrip'] = [0, 200, 480, 70]
        elif kind == 'tiles':
            canvas = Image.new('RGBA', (128, 64))
            for i, c in enumerate(cells):
                canvas.paste(c.resize((16, 16), NN), (i % 8 * 16, i // 8 * 16))
            # Matching outer pixels make cobbles and every water phase tileable.
            for group in (list(range(4)), list(range(4, 12))):
                x, y = group[0] % 8 * 16, group[0] // 8 * 16
                base = canvas.crop((x, y, x + 16, y + 16))
                base.paste(base.crop((0, 0, 16, 1)), (0, 15))
                base.paste(base.crop((0, 0, 1, 16)), (15, 0))
                for index in group:
                    tx, ty = index % 8 * 16, index // 8 * 16
                    for box, offset in [((0, 0, 16, 1), (0, 0)), ((0, 15, 16, 16), (0, 15)),
                                        ((0, 0, 1, 16), (0, 0)), ((15, 0, 16, 16), (15, 0))]:
                        canvas.paste(base.crop(box), (tx + offset[0], ty + offset[1]))
            # Join the two supplied horizontal and vertical stilt pieces.
            canvas.paste(canvas.crop((15, 48, 16, 64)), (16, 48))
            canvas.paste(canvas.crop((32, 63, 48, 64)), (48, 48))
            meta = dict(frameWidth=16, frameHeight=16, columns=8, rows=4,
                        tileIds={name: i for i, name in enumerate(job['tileNames'])},
                        tileGroups={'muddy_cobbles': [0, 1, 2, 3], 'flood': list(range(4, 12))},
                        tileObjects={'stilt_horizontal': [[24, 25]], 'stilt_vertical': [[26], [27]]},
                        animations={f'flood_{i}': animation([4 + 2 * i, 5 + 2 * i], 3, -1)
                                    for i in range(4)})
        elif kind == 'props':
            canvas = Image.new('RGBA', (320, 128))
            regions = {}
            content = [trim(c)[0] for c in cells]
            job['contentRects'] = [trim(c)[1] for c in cells]
            for i, (name, w, h) in enumerate(job['regions']):
                c = content[i]
                peers = [2, 3] if i in (2, 3) else [8, 9] if i in (8, 9) else [i]
                scale = min(min((w - 2) / content[k].width, (h - 2) / content[k].height) for k in peers)
                c = c.resize((max(1, round(c.width * scale)), max(1, round(c.height * scale))), NN)
                x, y = i % 5 * 64, i // 5 * 64
                canvas.paste(c, (x + (w - c.width) // 2, y + h - 1 - c.height))
                regions[name] = [x, y, w, h]
            meta = dict(frameWidth=16, frameHeight=16, columns=20, rows=8, regions=regions,
                        states={'sluice': ['sluice_open', 'sluice_closed']},
                        regionAnimations={'window': dict(regions=['window_0', 'window_1'], frameRate=3, repeat=-1)})
        elif kind == 'fx':
            fw, fh = job['frame']
            canvas = Image.new('RGBA', (fw * cols, fh))
            boxes = [trim(c)[1] for c in cells]
            # One union rectangle for the whole row preserves effect origin and size.
            union = [min(b[0] for b in boxes), min(b[1] for b in boxes),
                     max(b[2] for b in boxes), max(b[3] for b in boxes)]
            scale = min((fw - 4) / (union[2] - union[0]), (fh - 4) / (union[3] - union[1]))
            size = (max(1, round((union[2] - union[0]) * scale)),
                    max(1, round((union[3] - union[1]) * scale)))
            for i, c in enumerate(cells):
                c = c.crop(union).resize(size, NN)
                canvas.paste(c, (i * fw + (fw - size[0]) // 2, (fh - size[1]) // 2))
            job['sharedContentRect'] = union
            meta = dict(frameWidth=fw, frameHeight=fh, columns=cols, rows=1,
                        animations={'play': animation(list(range(cols)), 10)})
        elif kind == 'items':
            job['contentRects'] = []
            for cell, item in zip(cells, job['items']):
                c, box = trim(cell)
                job['contentRects'].append(box)
                c = fit(c, 30, 30)
                big = Image.new('RGBA', (32, 32))
                big.paste(c, ((32 - c.width) // 2, (32 - c.height) // 2))
                for size in (16, 32):
                    path = f'items/{"32/" if size == 32 else ""}{item["id"]}.png'
                    save(big.resize((size, size), NN), item['id'] + ('_32' if size == 32 else ''), path, True,
                         frameWidth=size, frameHeight=size, columns=1, rows=1,
                         sourceJob=ident, derivedFrom='32px source crop; nearest-neighbour 16px variant')
            continue
        else:
            raise ValueError(f'Unknown export kind: {kind}')
        save(canvas, ident, job['path'], job['transparent'], sourceJob=ident, **meta)

    # Head/upper-body crops from each corresponding first idle frame.
    turn_ids = ['pfahlbohrer', 'ratsherr', 'kellerkrebs', 'namensmade', 'buergermeister']
    head_boxes = [[2, 29, 33, 56], [20, 1, 42, 26], [2, 24, 62, 62],
                  [2, 38, 26, 61], [32, 32, 60, 62]]
    portraits = Image.new('RGBA', (80, 16))
    sources = []
    for i, (ident, box) in enumerate(zip(turn_ids, head_boxes)):
        c = exported['battle_' + ident].crop(box)
        c, _ = trim(c)
        c = fit(c, 16, 16)
        portraits.paste(c, (i * 16 + (16 - c.width) // 2, (16 - c.height) // 2))
        sources.append(dict(file=f'battle/enemy_{ident}.png', sourceRect=box,
                            rectConvention='left, top, right-exclusive, bottom-exclusive'))
    save(portraits, 'turn_portraits', 'ui/W_zug_portraits.png', True,
         frameWidth=16, frameHeight=16, columns=5, rows=1, ids=turn_ids, sources=sources)
    manifest = dict(version=1, batch='wexmoor5', status='exported; runtime integration pending',
                    paletteMaxVisibleColors=32, palette=PAL, assets=assets)
    (OUT / 'manifest-wexmoor5.json').write_text(json.dumps(manifest, indent=2) + '\n')
    log['palette'] = PAL
    log['postprocessing'] = ['Documented source/cell crops and component speck cleanup',
                             'Nearest-neighbour only, common combat scale and baseline',
                             'Attack wind-up frame duplicated exactly',
                             'Shared effect origin; binary alpha; fixed 32-color palette',
                             'Cobbles/water and paired stilts: matching edge pixels',
                             'Turn portraits from first idle; 16px items from 32px icons']
    LOG.write_text(json.dumps(log, indent=2, ensure_ascii=False) + '\n')
    print(f'{len(assets)} PNG files exported from {len(log["jobs"])} accepted source images')


if __name__ == '__main__':
    main(pathlib.Path(sys.argv[1]))
