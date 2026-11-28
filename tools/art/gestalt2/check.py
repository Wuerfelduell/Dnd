#!/usr/bin/env python3
"""Validate the complete gestalt2 asset contract and write a JSON receipt."""
from __future__ import annotations
import hashlib, json, sys
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
SPRITES=ROOT/'public/sprites'
BATCH='gestalt2'
PATHS=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
expected={}
for p in PATHS:
    expected[f'characters/hg_form_{p}_s2.png']=(32,48,4,4,True)
    expected[f'battle/hg_battle_{p}_s2.png']=(96,96,6,6,True)
    expected[f'ui/hg_zug_{p}_s2.png']=(32,32,1,1,True)

m=json.loads((SPRITES/'manifest-gestalt2.json').read_text(encoding='utf-8'))
assert m['batch']==BATCH and len(m['palette'])<=32
assert len(m['assets'])==30 and {a['file'] for a in m['assets']}==set(expected)
assert len({a['id'] for a in m['assets']})==30
palette={tuple(bytes.fromhex(v.lstrip('#'))) for v in m['palette']}
errors=[]; reports=[]; all_colors=set(); total_frames=0

def pixels(im): return list(im.get_flattened_data())
for a in m['assets']:
    f=a['file']
    try:
        fw,fh,cols,rows,transparent=expected[f]
        im=Image.open(SPRITES/f).convert('RGBA')
        assert im.size==(fw*cols,fh*rows)==(a['width'],a['height']),f'dimensions {im.size}'
        assert (a['frameWidth'],a['frameHeight'],a['columns'],a['rows'])==(fw,fh,cols,rows),'grid mismatch'
        assert a['transparent'] is transparent
        px=pixels(im); alphas={v[3] for v in px}
        assert alphas.issubset({0,255}) and alphas=={0,255},'alpha must be binary with transparent pixels'
        assert all(v==(0,0,0,0) for v in px if v[3]==0),'transparent pixel matte'
        colors={v[:3] for v in px if v[3]}
        assert len(colors)<=32,f'{len(colors)} opaque colors'
        assert colors<=palette,'color outside declared game palette'
        assert not any(v[:3]==(255,255,255) for v in px if v[3]),'pure white pixel'
        # Check each outermost edge for stray opaque/white/partially transparent pixels.
        edges=[]
        edges.extend(pixels(im.crop((0,0,im.width,1)))); edges.extend(pixels(im.crop((0,im.height-1,im.width,im.height))))
        edges.extend(pixels(im.crop((0,0,1,im.height)))); edges.extend(pixels(im.crop((im.width-1,0,im.width,im.height))))
        assert all(v[3] in (0,255) and v[:3]!=(255,255,255) for v in edges),'invalid edge pixels'
        frames=[im.crop((i%cols*fw,i//cols*fh,(i%cols+1)*fw,(i//cols+1)*fh)) for i in range(cols*rows)]
        assert all(fr.getbbox() is not None for fr in frames),'empty required cell'
        if f.startswith('characters/'):
            assert a['baseline']==46
            assert all(fr.getbbox()[3]-1==46 for fr in frames),'card shadow baseline != 46'
            assert set(a['animations'])=={'down','left','right','up'}
        if f.startswith('battle/'):
            assert set(a['animations'])=={'idle','attack1','attack2','special','hurt','defeated'}
            for anim in a['animations'].values():
                assert anim['frameRate']>0 and anim['repeat'] in (-1,0)
                assert anim['frames'] and all(0<=n<len(frames) for n in anim['frames'])
            assert a['animations']['attack1']['frames']==list(range(6,12))
            assert a['animations']['attack2']['frames']==list(range(12,18))
            assert frames[7].tobytes()==frames[8].tobytes(),'attack1 hold frames differ'
            assert frames[13].tobytes()==frames[14].tobytes(),'attack2 hold frames differ'
            # Each pose row must contain motion, except the two intentional hold frames.
            assert len({fr.tobytes() for fr in frames[:6]})>1,'idle is static'
            assert len({fr.tobytes() for fr in frames[18:24]})>1,'special is static'
            assert len({fr.tobytes() for fr in frames[30:36]})>1,'defeated is static'
        ref=f.replace('_s2','')
        if f.startswith('characters/'): ref=ref.removesuffix('.png')+'.png'
        elif f.startswith('battle/'): ref=ref.removesuffix('.png')+'.png'
        else: ref=f.replace('_s2','').removesuffix('.png')+'.png'
        if (SPRITES/ref).exists():
            assert Image.open(SPRITES/ref).convert('RGBA').tobytes()!=im.tobytes(),'pixel-identical to Seq 4 template'
        all_colors|=colors; total_frames+=len(frames)
        reports.append({'file':f,'size':list(im.size),'cells':len(frames),'colors':len(colors),'sha256':hashlib.sha256((SPRITES/f).read_bytes()).hexdigest(),'ok':True})
    except Exception as exc:
        errors.append({'file':f,'error':str(exc)})

result={'batch':BATCH,'ok':not errors,'assets':len(reports),'frames':total_frames,'sharedColors':len(all_colors),'errors':errors,
        'checks':['30-file inventory and manifest','exact canvas and cell grid','declared game palette and <=32 colors per file','binary RGBA alpha and transparent matte','outer edge validity and no pure white','no empty required cells','card shadow baseline y=46','animation frame ranges and holds','nonstatic idle, special, defeated','not pixel-identical to Seq 4 templates'], 'files':reports}
(ROOT/'docs/art/batch-gestalt2-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if errors:
    print(json.dumps(errors,ensure_ascii=False,indent=2));sys.exit(1)
print(f"OK: {len(reports)} PNGs, {total_frames} cells, {len(all_colors)} shared colors; dimensions, alpha, palette, baselines and animation checks passed.")
