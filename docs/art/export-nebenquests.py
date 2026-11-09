"""Export AJ imagegen sources: crop, nearest-neighbor, palette, binary alpha.

Usage: python docs/art/export-nebenquests.py SOURCE_DIRECTORY
Requires Pillow and numpy. Does not draw or invent replacement artwork.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'docs/art'
SPRITES = ROOT / 'public/sprites'
NEAREST = Image.Resampling.NEAREST


def binary(image):
    image = image.convert('RGBA')
    image.putalpha(image.getchannel('A').point(lambda a: 255 if a >= 200 else 0))
    return image


def trim(image):
    box = image.getchannel('A').getbbox()
    if box is None:
        raise ValueError('Empty source frame')
    return image.crop(box), list(box)


def indexed(image, palette, transparent):
    rgba = np.array(image.convert('RGBA'))
    colors = np.array([tuple(bytes.fromhex(c[1:])) for c in palette], dtype=np.int32)
    rgb = rgba[:, :, :3].reshape(-1, 3).astype(np.int32)
    indices = np.empty(len(rgb), dtype=np.uint8)
    for start in range(0, len(rgb), 8192):
        indices[start:start+8192] = ((rgb[start:start+8192, None] - colors[None])**2).sum(2).argmin(1) + 1
    indices = indices.reshape(rgba.shape[:2])
    if transparent:
        indices[rgba[:, :, 3] < 200] = 0
    result = Image.fromarray(indices, 'P')
    result.putpalette(([0, 0, 0] + colors.astype('uint8').ravel().tolist() + [0]*768)[:768])
    return result


def save(image, relative, palette, transparent=True):
    path = SPRITES / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    out = indexed(image, palette, transparent)
    out.save(path, optimize=True, **({'transparency': 0} if transparent else {}))


def export(job, image):
    kind = job['kind']
    w, h = job['size']
    if kind == 'bestiary':
        return image.convert('RGB').resize((w, h), NEAREST), {}
    image = binary(image)
    cols, rows = job.get('columns', 1), job.get('rows', 1)
    fw, fh = w//cols, h//rows
    counts = job.get('counts', [cols]*rows)
    frames, crops = {}, {}
    for row, count in enumerate(counts):
        for col in range(count):
            index = row*cols+col
            region = [round(col*image.width/cols), round(row*image.height/rows),
                      round((col+1)*image.width/cols), round((row+1)*image.height/rows)]
            frame, box = trim(image.crop(region))
            frames[index] = frame
            crops[str(index)] = [region[0]+box[0], region[1]+box[1], region[0]+box[2], region[1]+box[3]]
    margin = 2 if kind == 'battle' else 1
    scale = min((fw-2*margin)/max(f.width for f in frames.values()),
                (fh-2*margin)/max(f.height for f in frames.values()))
    result = Image.new('RGBA', (w, h))
    for index, frame in frames.items():
        frame = frame.resize((max(1, round(frame.width*scale)), max(1, round(frame.height*scale))), NEAREST)
        frame, _ = trim(frame)
        x = (index % cols)*fw + (fw-frame.width)//2
        y = (index // cols)*fh + (fh-margin-frame.height if kind in ('walk', 'portrait', 'battle') else (fh-frame.height)//2)
        result.paste(frame, (x, y))
    if kind == 'battle':
        # Exactly two held windup frames; no duplicate hurt poses.
        result.paste(result.crop((0, fh, fw, 2*fh)), (fw, fh))
    return result, {'sourceRects': crops, 'uniformScale': scale, 'alphaThreshold': 200}


def main(directory):
    spec_path = ART / 'batch-nebenquests-generation.json'
    spec = json.loads(spec_path.read_text())
    for job in spec['jobs']:
        source = Path(directory) / job['source']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == job['sourceSha256'], source
        image, details = export(job, Image.open(source))
        save(image, job['path'], spec['palette'], job['kind'] != 'bestiary')
        job['export'] = details
        if job['kind'] == 'item':
            # The supplied 32px version intentionally retains the exact 16px pixel grid.
            save(image.resize((32, 32), NEAREST), 'items/32/'+job['id']+'.png', spec['palette'])
    spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2)+'\n')
    print('Exported 40 PNGs from 33 source images.')


if __name__ == '__main__':
    main(sys.argv[1])
