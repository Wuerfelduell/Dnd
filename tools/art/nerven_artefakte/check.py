"""Validate BY coverage, PNG dimensions, shared palette and binary alpha."""
from pathlib import Path
from PIL import Image
import hashlib, json, re

ROOT = Path(__file__).resolve().parents[3]
task = (ROOT/'docs/art/codex_BY_nerven_artefakte_grafik.md').read_text()
ids = set(re.findall(r'\| `([^`]+)` \| [^|]+ \| [^|]+ \|',task))
assert len(ids)==14
gen = json.loads((ROOT/'docs/art/batch-nerven-artefakte-generation.json').read_text())
manifest = json.loads((ROOT/'public/sprites/manifest-nerven-artefakte.json').read_text())
assert {a['id'] for a in gen['assets']}==ids and len(gen['assets'])==14
expected = {f"items/{'32/' if size==32 else ''}{i}.png":size for i in ids for size in [16,32]}
assert len(manifest['assets'])==28
assert {a['file'] for a in manifest['assets']}==set(expected)
palette = {tuple(bytes.fromhex(c[1:])) for c in gen['palette']}
assert len(palette)<=32
all_colors, seen = set(), set()
for a in manifest['assets']:
    p = ROOT/'public/sprites'/a['file']
    im = Image.open(p)
    size = expected[a['file']]
    assert im.mode=='RGBA' and im.size==(size,size), p
    assert all(a[k]==size for k in ['width','height','frameWidth','frameHeight'])
    assert a['columns']==a['rows']==1
    assert a['animations']['still']['frames']==[0]
    px = list(im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata())
    assert {v[3] for v in px}=={0,255},p
    assert all(v==(0,0,0,0) for v in px if v[3]==0),p
    colors = {v[:3] for v in px if v[3]}
    assert colors<=palette and len(colors)<=32,p
    all_colors.update(colors)
    x0,y0,x1,y1 = im.getbbox()
    assert min(x0,y0)>=1 and max(x1,y1)<=size-1,p
    digest = hashlib.sha256(im.tobytes()).hexdigest()
    assert (size,digest) not in seen,p
    seen.add((size,digest))
    assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],p
assert len(all_colors)<=32
for a in gen['assets']:
    p = ROOT/a['source']
    assert Image.open(p).size==(128,128)
    assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sourceSha256']
    assert a['prompt'].startswith('STYLE GUIDE') and a['originalSha256']
preview = Image.open(ROOT/'docs/art/preview-nerven-artefakte.png')
assert preview.size==(960,750)
print(f'PASS: 14 motifs, 28 icons; exact IDs, dimensions, {len(all_colors)} shared colors, binary alpha, transparent margins, unique images and provenance hashes.')
