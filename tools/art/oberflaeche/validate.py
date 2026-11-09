#!/usr/bin/env python3
"""Validate exported AE assets, without source images. Requires Pillow, NumPy."""
import hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
SPRITES=ROOT/'public/sprites'
manifest=json.loads((SPRITES/'manifest-oberflaeche.json').read_text())
expected={
 'ui/AE_einstellungen.png':(128,32),'ui/AE_regler.png':(160,16),
 'ui/AE_touch.png':(320,64),'ui/AE_stick.png':(112,64),
 'ui/AE_titel/ebene_0_himmel.png':(480,270),
 'ui/AE_titel/ebene_1_mond.png':(960,270),
 'ui/AE_titel/ebene_2_ferne.png':(480,270),
 'ui/AE_titel/ebene_3_nebel.png':(480,270),
 'ui/AE_titel/ebene_4_stadt.png':(480,270),
 'ui/AE_titel/ebene_4_fenster.png':(1920,270),
 'ui/AE_titel/ebene_5_vorne.png':(480,270),
 'ui/AE_titel/ebene_5_laterne.png':(64,16),
 'ui/AE_titel/ebene_6_regen.png':(1920,270),
 'ui/scenes/kapitel1_karte.png':(480,270),
 'ui/scenes/kapitel2_karte.png':(480,270),
 'ui/scenes/kapitel_ende.png':(480,270),
 'ui/AE_zeitung.png':(320,160),'props/AE_zeitung.png':(64,32),
 'fx/AE_wexmoor_tiere.png':(128,272),'fx/AE_wexmoor_wetter.png':(1920,350),
}
assert {a['file'] for a in manifest['assets']}==set(expected)
all_colors=set(); report=[]; frame_count=0; clip_count=0
def tile_check(a,axes,label):
    if 'x' in axes: assert np.array_equal(a[:,0],a[:,-1]),label+' x seam'
    if 'y' in axes: assert np.array_equal(a[0],a[-1]),label+' y seam'
for asset in manifest['assets']:
    file=asset['file']; path=SPRITES/file; source=Image.open(path)
    assert source.mode=='P',file+' must be indexed PNG'
    assert source.size==expected[file]==(asset['width'],asset['height'])
    a=np.array(source.convert('RGBA')); alpha=set(np.unique(a[:,:,3]))
    assert alpha <= {0,255},file+' fractional alpha'
    assert 255 in alpha,file+' is empty'
    assert (0 in alpha)==asset['transparent'],file+' opacity mismatch'
    colors=set(map(tuple,a[a[:,:,3]>0,:3])); assert len(colors)<=31
    all_colors|=colors
    if 'frameWidth' in asset:
        assert asset['frameWidth']*asset['columns']==source.width
        assert asset['frameHeight']*asset['rows']==source.height
    regions=asset.get('regions',{})
    for name,r in regions.items():
        x,y,w,h=(r[k] for k in ('x','y','width','height'))
        assert x>=0 and y>=0 and w>0 and h>0 and x+w<=source.width and y+h<=source.height,(file,name)
        assert a[y:y+h,x:x+w,3].any(),(file,name,'empty region')
        if 'nineSlice' in r:
            n=r['nineSlice']; assert n['left']+n['right']<w and n['top']+n['bottom']<h
        if 'tileable' in r:
            fw=r['frameWidth']; fh=r['frameHeight']
            for c in range(r['columns']): tile_check(a[y:y+fh,x+c*fw:x+(c+1)*fw],r['tileable'],file+'/'+name)
    region_list=list(regions.items())
    for i,(n,r) in enumerate(region_list):
        for nn,s in region_list[i+1:]:
            assert not (r['x']<s['x']+s['width'] and s['x']<r['x']+r['width'] and r['y']<s['y']+s['height'] and s['y']<r['y']+r['height']),(file,n,nn,'overlap')
    for name,clip in asset.get('animations',{}).items():
        clip_count+=1
        region=regions[clip['region']] if 'region' in clip else dict(x=0,y=0,width=source.width,height=source.height)
        fw=clip.get('frameWidth',asset.get('frameWidth')); fh=clip.get('frameHeight',asset.get('frameHeight'))
        cols=clip.get('columns',asset.get('columns')); rows=clip.get('rows',asset.get('rows'))
        hashes=[]
        for i in clip['frames']:
            assert 0<=i<cols*rows,(file,name,i)
            x=region['x']+i%cols*fw; y=region['y']+i//cols*fh
            f=a[y:y+fh,x:x+fw]; assert f[:,:,3].any(),(file,name,i,'empty frame')
            if 'tileable' in asset: tile_check(f,asset['tileable'],file+'/'+name)
            hashes.append(hashlib.sha256(f.tobytes()).hexdigest()); frame_count+=1
        assert len(set(hashes))>1,(file,name,'static animation')
    if 'tileable' in asset and not asset.get('animations'): tile_check(a,asset['tileable'],file)
    report.append(dict(file=file,size=list(source.size),visibleColors=len(colors),sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
assert len(all_colors)<=31, 'shared palette limit'
by_file={a['file']:a for a in manifest['assets']}
animals=by_file['fx/AE_wexmoor_tiere.png']['animations']
assert [len(c['frames']) for c in animals.values()]==[2,4,4,2,4,4,6,4,4,2,2,2,4,4]
assert len(by_file['ui/AE_einstellungen.png']['regions'])==16
assert len(by_file['ui/AE_touch.png']['regions'])==20
# Regions leave truly blank space between the small creature rows and 128px atlas edge.
animal=np.array(Image.open(SPRITES/'fx/AE_wexmoor_tiere.png').convert('RGBA'))
for r in by_file['fx/AE_wexmoor_tiere.png']['regions'].values():
    y,h=r['y'],r['height']; assert not animal[y:y+h,r['width']:,3].any()
    assert not animal[y,:,3].any() and not animal[y+h-1,:,3].any()
# Extracted window light must only land on the intended dark panes.
city=np.array(Image.open(SPRITES/'ui/AE_titel/ebene_4_stadt.png').convert('RGBA'))
windows=np.array(Image.open(SPRITES/'ui/AE_titel/ebene_4_fenster.png').convert('RGBA'))
for c in range(4):
    mask=windows[:,c*480:(c+1)*480,3]>0
    assert np.all(city[mask,:3]==(37,43,59)), 'window registration'
result=dict(batch='oberflaeche',status='passed',pngCount=len(report),sharedVisibleColors=len(all_colors),animationCount=clip_count,checkedAnimationFrames=frame_count,checks=['required files and dimensions','indexed shared palette','binary alpha and opaque backgrounds','named regions within bounds and non-overlapping','animation frame bounds, content and variation','tile seams per frame and axis','blank unused creature cells and row margins','window overlay registration'],assets=report)
(ROOT/'docs/art/batch-oberflaeche-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ('assets','checks')},indent=2))
