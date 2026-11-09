#!/usr/bin/env python3
"""Export AK's image_gen originals. Usage: python docs/art/export-emotionen2.py SOURCE_DIR.
Requires Pillow and numpy. No creative drawing or expression synthesis is performed here.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def main():
    spec = json.loads((HERE / 'batch-emotionen2-generation.json').read_text())
    source_dir = Path(sys.argv[1])
    colors = np.array([tuple(bytes.fromhex(c[1:])) for c in spec['palette']], dtype=np.int32)
    palette = colors.flatten().tolist()
    assets = []
    for job in spec['jobs']:
        source = source_dir / job['source']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == job['sourceSha256'], source
        im = Image.open(source).convert('RGB')
        assert list(im.size) == job['sourceSize'], source
        sheet = Image.new('RGB', (256, 64))
        for i, box in enumerate(job['sourceBoxes']):
            sheet.paste(im.crop(box).resize((64, 64), Image.Resampling.NEAREST), (64 * i, 0))
        pixels = np.array(sheet).reshape(-1, 3).astype(np.int32)
        indices = ((pixels[:, None, :] - colors[None, :, :]) ** 2).sum(2).argmin(1).astype('uint8')
        out = Image.fromarray(indices.reshape(64, 256))
        out.putpalette(palette + [0] * (768 - len(palette)))
        path = ROOT / 'public/sprites' / job['output']
        out.save(path, optimize=True)
        assets.append({
            'id': 'AK_' + job['id'] + '_emotions2', 'characterId': job['id'],
            'file': job['output'], 'reference': job['reference'].removeprefix('public/sprites/'),
            'width': 256, 'height': 64, 'frameWidth': 64, 'frameHeight': 64,
            'columns': 4, 'rows': 1, 'transparent': False,
            'emotions': ['angry', 'sad', 'thoughtful', 'determined'],
            'emotionsDe': ['wütend', 'traurig', 'nachdenklich', 'entschlossen'],
            'frames': {key: i for i, key in enumerate(['angry', 'sad', 'thoughtful', 'determined'])}
        })
    manifest = {'version': 1, 'batch': 'emotionen2', 'status': 'exported; runtime integration pending',
                'paletteMaxVisibleColors': len(colors), 'palette': spec['palette'], 'assets': assets}
    (ROOT / 'public/sprites/manifest-emotionen2.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Exported {len(assets)} portrait sheets / {len(assets) * 4} expressions.')


if __name__ == '__main__':
    main()
