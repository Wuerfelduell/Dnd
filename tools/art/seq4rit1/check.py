#!/usr/bin/env python3
"""Validate DN's exported assets. Run from any working directory (requires Pillow)."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
MANIFEST = ROOT / 'public/sprites/manifest-seq4rit1.json'

def main():
    data = json.loads(MANIFEST.read_text())
    palette = {tuple(bytes.fromhex(c[1:])) for c in data['palette']}
    results = []
    errors = []
    ids = set()
    for asset in data['assets']:
        file = ROOT / 'public/sprites' / asset['file']
        problems = []
        if asset['id'] in ids:
            problems.append('duplicate id')
        ids.add(asset['id'])
        if not file.exists():
            errors.append(str(file) + ': missing'); continue
        im = Image.open(file).convert('RGBA')
        if im.size != (asset['width'], asset['height']):
            problems.append('dimensions')
        visible = {p[:3] for p in im.getdata() if p[3]}
        alpha = set(im.getchannel('A').getdata())
        if not visible or len(visible) > 32:
            problems.append('visible color count')
        if not visible <= palette:
            problems.append('outside shared palette')
        if not alpha <= {0, 255}:
            problems.append('non-binary alpha')
        if not asset['transparent'] and alpha != {255}:
            problems.append('opaque asset has holes')
        if asset['transparent'] and 0 not in alpha:
            problems.append('transparent asset lacks alpha')
        if any(p[:3] != (0,0,0) for p in im.getdata() if p[3] == 0):
            problems.append('hidden RGB fringe')
        if 'frameWidth' in asset:
            fw, fh = asset['frameWidth'], asset['frameHeight']
            cols, rows = asset['columns'], asset['rows']
            if im.size != (fw*cols, fh*rows):
                problems.append('frame raster')
            def frame(index):
                x, y = index % cols * fw, index // cols * fh
                return im.crop((x,y,x+fw,y+fh))
            empty = set(asset.get('emptyFrames', []))
            for i in range(cols*rows):
                bbox = frame(i).getchannel('A').getbbox()
                if i in empty and bbox:
                    problems.append(f'unused cell {i} not transparent')
                if i not in empty and not bbox:
                    problems.append(f'active cell {i} empty')
                if bbox and 'baseline' in asset and bbox[3]-1 != asset['baseline']:
                    problems.append(f'baseline frame {i}')
            for name, animation in asset.get('animations', {}).items():
                for i in animation['frames']:
                    if not isinstance(i,int) or i < 0 or i >= cols*rows or i in empty:
                        problems.append(f'invalid animation index {name}:{i}')
                if animation['frameRate'] <= 0:
                    problems.append('invalid speed')
            for a,b in asset.get('windupHoldPairs', []):
                if frame(a).tobytes() != frame(b).tobytes():
                    problems.append('windup not held')
            if 'transparentCenter' in asset:
                r=asset['transparentCenter']
                for i in range(cols*rows):
                    if frame(i).crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).getchannel('A').getbbox():
                        problems.append(f'center not transparent {i}')
        for name, r in asset.get('regions', {}).items():
            if not all(isinstance(r[k],int) for k in ['x','y','width','height']):
                problems.append('fractional region')
            if r['x']<0 or r['y']<0 or r['x']+r['width']>im.width or r['y']+r['height']>im.height:
                problems.append(f'region outside atlas {name}')
        results.append(dict(file=asset['file'],size=list(im.size),visibleColors=len(visible),alpha=sorted(alpha),sha256=hashlib.sha256(file.read_bytes()).hexdigest(),passed=not problems,errors=problems))
        errors.extend(asset['file']+': '+p for p in problems)
    if len(data['assets']) != 59:
        errors.append('Expected exactly 59 specified production PNGs')
    for ritual, references in data['rituals'].items():
        if not references or not set(references)<=ids:
            errors.append('Invalid ritual mapping: '+ritual)
    report=dict(batch='seq4rit1',passed=not errors,assetCount=len(results),checks=['dimensions','shared palette <=32','binary alpha','opaque coverage','transparent RGB cleanup','integer frame raster','active and empty cells','animation indices and speeds','walk baselines','identical windup frames','transparent screen centers','region bounds','ritual references'],limitations=['Technical validation does not replace visual review or runtime integration testing.'],errors=errors,assets=results)
    (ROOT/'docs/art/batch-seq4rit1-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'passed':not errors,'assets':len(results),'errors':errors},indent=2))
    raise SystemExit(0 if not errors else 1)

if __name__ == '__main__':
    main()
