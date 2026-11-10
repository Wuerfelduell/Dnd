"""Validate BM delivery against the task's explicit IDs (requires Pillow)."""
from pathlib import Path
from PIL import Image
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[3]
text=(ROOT/'docs/art/codex_BM_vorrat_items_grafik.md').read_text()
rows=re.findall(r'^\| `(vi_\w+)` \| (\w+) \|',text,re.M)
expected={f'items/{i}.png':(i,16) for i,k in rows}
for i,k in rows:
    if k in {'hut','mantel','amulett','waffe','artefakt','schluessel'}:expected[f'items/32/{i}.png']=(i,32)
enemies=set(re.findall(r'`(vg_(?:cw|bh|all)_\w+)`',text))
for i in enemies:expected[f'items/vt_{i[3:]}.png']=(f'vt_{i[3:]}',16)
assert len(rows)==72 and len(enemies)==32 and len(expected)==142
manifest=json.loads((ROOT/'public/sprites/manifest-vorrat3.json').read_text())
gen=json.loads((ROOT/'docs/art/batch-vorrat3-generation.json').read_text())
assets=manifest['assets'];sources=gen['assets']
assert len(assets)==len(expected) and {a['file'] for a in assets}==set(expected)
assert len(sources)==104 and {s['id'] for s in sources}=={i for i,n in expected.values()}
assert manifest['trophyCountNote'] and manifest['equipmentOverlay']
palette={tuple(bytes.fromhex(c[1:])) for c in gen['palette']};assert len(palette)==32
hashes=set();colors=set()
for a in assets:
    path=ROOT/'public/sprites'/a['file'];im=Image.open(path)
    i,n=expected[a['file']]
    assert im.mode=='RGBA' and im.size==(n,n),path
    assert (a['itemId'],a['width'],a['height'],a['frameWidth'],a['frameHeight'],a['columns'],a['rows'])==(i,n,n,n,n,1,1)
    assert a['animations']=={'still':{'frames':[0],'frameRate':0,'repeat':0}}
    pixels=list(im.getdata());alpha={p[3] for p in pixels}
    assert alpha=={0,255},path
    visible={p[:3] for p in pixels if p[3]};assert visible<=palette,path
    assert all(p==(0,0,0,0) for p in pixels if not p[3]),path
    colors|=visible
    l,t,r,b=im.getchannel('A').getbbox();assert min(l,t)>=1 and max(r,b)<n,path
    digest=hashlib.sha256(im.tobytes()).hexdigest();assert (n,digest) not in hashes,('duplicate',path)
    hashes.add((n,digest))
    assert hashlib.sha256(path.read_bytes()).hexdigest()==a['sha256'],path
for s in sources:
    path=ROOT/s['source'];im=Image.open(path)
    assert im.mode=='RGBA' and im.size==(128,128),path
    assert hashlib.sha256(path.read_bytes()).hexdigest()==s['sourceSha256']
    assert s['prompt'] and s['originalSha256'] and s['alphaCrop'] and s['originalSize']
for label in ('items','trophies'):
    im=Image.open(ROOT/f'docs/art/preview-vorrat3-{label}.png');assert im.width==1040
assert len(colors)<=32
print(f'PASS: 72 items + 32 explicit trophy IDs; 104 motifs, 142 RGBA icons, {len(colors)} shared colors; dimensions, margins, binary alpha, uniqueness, provenance and manifests valid.')
