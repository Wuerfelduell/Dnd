"""Pillow validation for CB, independently checking the supplied brief's ID tables."""
import hashlib
import json
import re
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
SPRITES=ROOT/'public/sprites'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_image(image, size, allowed):
    assert image.size==size, f'size {image.size}, expected {size}'
    assert image.mode=='P', f'expected indexed PNG, got {image.mode}'
    rgba=image.convert('RGBA')
    pixels=list(rgba.get_flattened_data() if hasattr(rgba,'get_flattened_data') else rgba.getdata())
    alpha={p[3] for p in pixels}
    assert alpha=={0,255}, f'alpha is not binary with transparent margin: {alpha}'
    visible={p[:3] for p in pixels if p[3]}
    assert len(visible)<=31, f'{len(visible)} visible colors exceeds shared palette'
    assert visible<=allowed, f'colors outside common palette: {visible-allowed}'
    assert len(set(pixels))<=32, 'more than 32 RGBA colors including transparency'
    w,h=size
    assert all(not rgba.getpixel((x,y))[3] for x in range(w) for y in (0,h-1)), 'top/bottom margin clipped'
    assert all(not rgba.getpixel((x,y))[3] for x in (0,w-1) for y in range(h)), 'left/right margin clipped'
    assert sum(p[3]>0 for p in pixels)>=20, 'empty or unreadable icon'
    return visible,rgba.tobytes()


def main():
    brief=(ROOT/'docs/art/codex_CB_dunscar_icons.md').read_text()
    tables=brief.split('## 1.')[1].split('## 6.')[0]
    ids=re.findall(r'^\| `([^`]+)` \|',tables,re.M)
    assert len(ids)==35 and len(set(ids))==35, 'brief must define exactly 35 unique IDs'
    # Sections 1, 3 and 4 require large variants; 2 and 5 explicitly do not.
    large=set()
    for section in (1,3,4):
        text=brief.split(f'## {section}.')[1].split('## ')[0]
        large.update(re.findall(r'^\| `([^`]+)` \|',text,re.M))
    assert len(large)==16
    manifest=json.loads((SPRITES/'manifest-icons3.json').read_text())
    generation=json.loads((ROOT/'docs/art/batch-icons3-generation.json').read_text())
    assert manifest['batch']=='icons3' and manifest['version']==1
    assert {a['id'] for a in generation['assets']}==set(ids)
    assert len(generation['assets'])==35
    palette={tuple(bytes.fromhex(h.removeprefix('#'))) for h in generation['palette']}
    assert len(palette)==31
    expected={f'items/{id}.png':(16,16) for id in ids}
    expected.update({f'items/32/{id}.png':(32,32) for id in large})
    expected['items/k3e_ausgaben_strip.png']=(144,16)
    assets=manifest['assets']; assert len(assets)==52
    assert len({a['id'] for a in assets})==52
    assert {a['file'] for a in assets}==set(expected), 'manifest file set differs from brief'
    combined=set(); fingerprints=set(); icons={}
    for a in assets:
        path=SPRITES/a['file']; assert path.is_file(), f'missing {path}'
        assert a['sha256']==sha(path), f'checksum mismatch: {path}'
        assert (a['width'],a['height'])==expected[a['file']]
        assert a['transparent'] is True
        with Image.open(path) as im:
            colors,raw=validate_image(im,expected[a['file']],palette)
            combined.update(colors)
            assert raw not in fingerprints, f'duplicate pixels: {path}'
            fingerprints.add(raw); icons[a['file']]=im.convert('RGBA')
    assert len(combined)<=31
    strip=icons['items/k3e_ausgaben_strip.png']
    paper_light=[]
    masks=[]
    for i in range(9):
        icon=icons[f'items/k3e_ausgabe_{i+1}.png']
        assert strip.crop((i*16,0,(i+1)*16,16)).tobytes()==icon.tobytes(), 'strip/single mismatch'
        masks.append(icon.getchannel('A').tobytes())
        # Main paper field excludes masthead, cover box, text stubs and fold.
        paper_light.append(sum(sum(icon.getpixel((x,y))[:3]) for x in range(3,12) for y in (2,4,10,12)))
    assert len(set(masks))==1, 'newspaper silhouette differs by issue'
    assert all(a<b for a,b in zip(paper_light,paper_light[1:])), 'paper must become paler with every issue'
    for e in generation['assets']:
        path=ROOT/e['source']; assert sha(path)==e['sourceSha256'], f'master checksum mismatch: {path}'
        with Image.open(path) as source:
            assert source.size==((48,32) if e['id'] in large else (16,16))
        assert bool(e['maxSize']==32)==bool(e['id'] in large)
        if e['id'] in large:
            small=icons[f"items/{e['id']}.png"]
            big=icons[f"items/32/{e['id']}.png"]
            assert small.tobytes()!=big.resize((16,16),Image.Resampling.NEAREST).tobytes(), '16px is downscaled 32px'
    for ref,checksum in generation['referenceSha256'].items():
        assert sha(SPRITES/ref)==checksum, f'reference was changed: {ref}'
    print(f'PASS icons3: 35 small + 16 large + 1 strip; {len(combined)} shared visible colors; indexed PNG, binary alpha, clear margins, unique images, hashes, independent sizes, newspaper continuity.')


if __name__=='__main__':
    main()
