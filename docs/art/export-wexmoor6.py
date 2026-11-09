"""Export only Batch AN artwork from documented imagegen originals.

Usage: python docs/art/export-wexmoor6.py SOURCE_DIRECTORY
Dependencies: Pillow, numpy. No generation or runtime-code changes.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / 'public/sprites'
DOC = Path(__file__).resolve().parent
NN = Image.Resampling.NEAREST
SPEC = json.loads((DOC / 'batch-wexmoor6-generation.json').read_text())
PALETTE = np.array(SPEC['paletteRGB'], dtype=np.int32)


def indexed(im, opaque=False):
    rgba = np.array(im.convert('RGBA'))
    rgb = rgba[:, :, :3].astype(np.int32)
    indices = ((rgb[:, :, None, :] - PALETTE[None, None, :, :]) ** 2).sum(3).argmin(2).astype('uint8') + 1
    if not opaque:
        indices[rgba[:, :, 3] < 200] = 0
    out = Image.fromarray(indices, 'P')
    colors = [0, 0, 0] + PALETTE.flatten().tolist()
    out.putpalette(colors + [0] * (768 - len(colors)))
    if not opaque:
        out.info['transparency'] = 0
    return out


def cut(im, col, row, cols, rows):
    return im.crop((round(col * im.width / cols), round(row * im.height / rows),
                    round((col + 1) * im.width / cols), round((row + 1) * im.height / rows)))


def solid(im):
    im = im.copy()
    im.putalpha(im.getchannel('A').point(lambda a: 255 if a >= 200 else 0))
    return im


def fit(im, width, height, scale=None, baseline=None):
    im = solid(im)
    bbox = im.getchannel('A').getbbox()
    assert bbox, 'Empty source cell'
    im = im.crop(bbox)
    scale = scale or min((width - 2) / im.width, (height - 2) / im.height)
    size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
    small = im.resize(size, NN)
    out = Image.new('RGBA', (width, height))
    x = (width - size[0]) // 2
    y = (height - size[1]) // 2 if baseline is None else baseline + 1 - size[1]
    assert x >= 1 and y >= 0, (size, width, height)
    out.paste(small, (x, y))
    return out


def anim(frames, fps=8, repeat=0):
    return {'frames': frames, 'frameRate': fps, 'repeat': repeat}


def save(im, entry):
    target = SPRITES / entry['file']
    target.parent.mkdir(parents=True, exist_ok=True)
    out = indexed(im, not entry['transparent'])
    out.save(target, optimize=True)
    entry.update(width=out.width, height=out.height)
    return entry


def export(source_dir):
    assets = []
    for job in SPEC['jobs']:
        source = source_dir / job['sourceFile']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == job['sourceSHA256'], source
        im = Image.open(source).convert('RGBA')
        kind = job['kind']
        entry = {'id': job['id'], 'file': job['file'], 'kind': kind, 'transparent': not job.get('opaque', False)}
        if 'gameId' in job:
            entry['gameId'] = job['gameId']
        if kind == 'tiles':
            # Every generated cell is a full terrain tile. Resample cells independently.
            out = Image.new('RGBA', (128, 128))
            for row in range(8):
                for col in range(8):
                    tile = cut(im, col, row, 8, 8)
                    inset = max(1, round(min(tile.size) * .012))
                    tile = tile.crop((inset, inset, tile.width-inset, tile.height-inset)).resize((16, 16), NN)
                    tile.putalpha(255)
                    out.paste(tile, (col*16, row*16))
            entry.update(frameWidth=16, frameHeight=16, columns=8, rows=8,
                         transparent=False, tileNames=job['tileNames'], animations=job.get('animations', {}),
                         gameId=job['location'])
            if job.get('regions'):
                entry['regions'] = job['regions']
        elif kind == 'props':
            cell_h = 48 if job['id'] == 'props_floss' else 32
            out = Image.new('RGBA', (256, job['rows']*cell_h))
            regions = {}
            for n, (name, width, height) in enumerate(job['regions']):
                col, row = n % 4, n // 4
                cell = cut(im, col, row, 4, job['rows'])
                obj = fit(cell, width, height, baseline=height-2)
                x, y = col*64, row*cell_h
                out.paste(obj, (x, y))
                regions[name] = {'x': x, 'y': y, 'width': width, 'height': height}
            entry.update(regions=regions, regionAnimations=job['regionAnimations'], gameId=job['location'])
        elif kind in ('battle', 'walk', 'markers'):
            fw, fh = job.get('frame', job.get('frameWidth')), job.get('frame', job.get('frameHeight'))
            cols, rows = job['cols'], job['rows']
            counts = job.get('counts', [cols] * rows)
            cells = [(c, r, solid(cut(im, c, r, cols, rows))) for r in range(rows) for c in range(counts[r])]
            boxes = [cell.getchannel('A').getbbox() for _, _, cell in cells]
            assert all(boxes), job['id']
            scale = min((fw-4)/max(b[2]-b[0] for b in boxes), (fh-4)/max(b[3]-b[1] for b in boxes))
            out = Image.new('RGBA', (fw*cols, fh*rows))
            for c, r, cell in cells:
                # Shared scale across the sheet preserves collapse and attack proportions.
                frame = fit(cell, fw, fh, scale=scale, baseline=fh-2)
                out.paste(frame, (c*fw, r*fh))
            animations = {}
            if kind == 'battle':
                for row in (1, 2):
                    out.paste(out.crop((0, row*fh, fw, (row+1)*fh)), (fw, row*fh))
                names = ['idle', 'attack_a', 'attack_b', 'hurt', 'defeated', 'phase2']
                for row in range(rows):
                    animations[names[row]] = anim(list(range(row*cols, row*cols+counts[row])), 5 if row == 0 else 8, -1 if row == 0 else 0)
                entry.update(facing='left', heldRows=[1, 2], windupRows=[1, 2])
                if rows == 6:
                    entry['phase2'] = {'transition': 'phase2', 'idleFrames': [34, 35], 'frameRate': 4}
            elif kind == 'walk':
                animations['move'] = anim([0, 1, 2, 3], 6, -1)
                entry['facing'] = 'down-left'
            else:
                entry['regions'] = {name: {'x': i*fw, 'y': 0, 'width': fw, 'height': fh} for i, name in enumerate(['wx_flossfriedhof', 'wx_lichtamt', 'wx_torfbrueche'])}
            entry.update(frameWidth=fw, frameHeight=fh, columns=cols, rows=rows,
                         baseline=fh-2, occupiedCounts=counts, animations=animations)
        elif kind == 'item':
            for size in (16, 32):
                e = dict(entry, id=job['id']+('_32' if size == 32 else ''), gameId=job['id'])
                e['file'] = 'items/' + ('32/' if size == 32 else '') + job['id'] + '.png'
                e.update(frameWidth=size, frameHeight=size, columns=1, rows=1)
                assets.append(save(fit(im, size, size), e))
            continue
        elif kind == 'boss':
            out = fit(im, job['w'], job['h'])
            entry.update(frameWidth=job['w'], frameHeight=job['h'], columns=1, rows=1)
        else:
            out = im.resize((job['w'], job['h']), NN)
            out.putalpha(255)
            entry.update(frameWidth=job['w'], frameHeight=job['h'], columns=1, rows=1)
            if kind == 'background':
                entry['groundStrip'] = {'x': 0, 'y': 200, 'width': 480, 'height': 70}
        assets.append(save(out, entry))
    manifest = {'version': 1, 'batch': 'wexmoor6', 'status': 'exported; game integration separate',
                'paletteMaxVisibleColors': 32, 'paletteSource': 'tilesets/R_wexmoor_tiles.png',
                'assets': assets}
    (SPRITES / 'manifest-wexmoor6.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False)+'\n')
    print(f'Exported {len(assets)} PNGs')


if __name__ == '__main__':
    export(Path(sys.argv[1]))
