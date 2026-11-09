"""Check Batch X runtime asset contracts. Run from any working directory."""
import hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
M=json.loads((ROOT/'public/sprites/manifest-platzhalter.json').read_text())
S=json.loads((ROOT/'docs/art/batch-platzhalter-generation.json').read_text())
assert len(M['assets'])==86
seen=set();palette=set();item_hashes=set();item_pixels=set()
for a in M['assets']:
 p=ROOT/'public/sprites'/a['file'];assert p.exists(),p
 assert a['file'] not in seen;seen.add(a['file'])
 indexed=Image.open(p);assert indexed.mode=='P',p
 im=indexed.convert('RGBA');assert im.size==(a['width'],a['height']),p
 alphas=set(im.getchannel('A').getdata());assert alphas<=({0,255} if a['transparent'] else {255}),p
 if a['transparent']:assert alphas=={0,255},p
 colors={rgb[:3] for rgb in im.getdata() if rgb[3]};assert len(colors)<=32,p;palette.update(colors)
 fw,fh,cols,rows=[a[k] for k in ['frameWidth','frameHeight','columns','rows']]
 assert im.size==(fw*cols,fh*rows),p
 def frame(i):return im.crop(((i%cols)*fw,(i//cols)*fh,(i%cols+1)*fw,(i//cols+1)*fh))
 padding=set(a.get('paddingFrames',[]))
 for i in range(cols*rows):
  f=frame(i);bbox=f.getchannel('A').getbbox()
  assert bool(bbox)==(i not in padding),(p,i,'occupancy')
  if bbox and a['transparent']:assert bbox[0]>=1 and bbox[1]>=1 and bbox[2]<=fw-1 and bbox[3]<=fh-1,(p,i,bbox,'cell margin')
  if bbox and 'baseline' in a:assert abs(bbox[3]-a['baseline'])<=1,(p,i,'baseline')
 for name,anim in a.get('animations',{}).items():
  assert anim['frames'] and anim['frameRate']>0
  assert all(0<=i<cols*rows and i not in padding for i in anim['frames']),(p,name)
  if len(anim['frames'])>2:assert len({frame(i).tobytes() for i in anim['frames']})>=2,(p,name,'no motion')
 for name in a.get('telegraph',{}).get('animations',[]):
  fs=a['animations'][name]['frames'];assert frame(fs[0]).tobytes()==frame(fs[1]).tobytes(),(p,name,'windup')
 if 'gameIds' in a and a['rows']==1:assert len(a['gameIds'])*16==a['width'],p
 if a['file'].startswith('items/'):
  sha=hashlib.sha256(p.read_bytes()).hexdigest();assert sha not in item_hashes,p;item_hashes.add(sha)
  px=(im.size,im.tobytes());assert px not in item_pixels,p;item_pixels.add(px)
assert len(palette)<=32,len(palette)
assert len(item_hashes)==50
for name,sha in S['preserved32'].items():assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==sha,name
assert len(S['preserved32'])==12
print(f'PASS: {len(seen)} PNGs, {len(palette)} shared visible colors, binary alpha/opaque stills, frame grids/padding/telegraphs, 50 unique item icons, 12 preserved 32px originals.')
