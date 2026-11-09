"""Validate Batch T deliverables without the original generation files."""
from pathlib import Path
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/sprites'
members='halloran rusk oddny ferro sallow corve ashdown pemberley dot brann cobb sorrel docht mareike fenn gischt lake tam'.split()
expected={'ui/T_auktion.png':(128,64)}
for n in members:
 expected.update({f'characters/T_tm_{n}_walk.png':(64,128),f'portraits/T_tm_{n}_emotions.png':(256,64),f'ui/heads/tm_{n}.png':(24,24)})
m=json.loads((OUT/'manifest-zirkel.json').read_text());assets=m['assets']
assert len(assets)==55 and len({a['id'] for a in assets})==55
assert {a['file'] for a in assets}==set(expected)
palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']};visible=set()
for a in assets:
 p=a['file'];im=Image.open(OUT/p);assert im.mode=='P',p
 im=im.convert('RGBA');assert im.size==expected[p]==(a['width'],a['height']),p
 pixels={rgba for count,rgba in im.getcolors(im.width*im.height)};assert {v[3] for v in pixels}<={0,255},p
 colors={v[:3] for v in pixels if v[3]};assert colors<=palette,p;visible|=colors
 if a['transparent']:assert 0 in {v[3] for v in pixels},p
 else:assert im.getchannel('A').getextrema()==(255,255),p
 assert a['columns']*a['frameWidth']==im.width and a['rows']*a['frameHeight']==im.height
 if p.startswith('characters/'):
  assert (a['frameWidth'],a['frameHeight'],a['columns'],a['rows'])==(16,32,4,4)
  for r,d in enumerate(['down','left','right','up']):
   assert a['animations'][d]==dict(frames=list(range(r*4,r*4+4)),frameRate=8,repeat=-1)
   frames=[]
   for c in range(4):
    fr=im.crop((c*16,r*32,c*16+16,r*32+32));bb=fr.getbbox()
    assert bb and bb[0]>=1 and bb[2]<=15 and bb[1]>=1 and bb[3]<=31,(p,r,c,bb)
    assert bb[3]>=30,(p,'floating baseline',r,c,bb)
    frames.append(fr.tobytes())
   assert len(set(frames))>=3,(p,d,'missing walk variation')
 elif p.startswith('portraits/'):
  assert a['states']==['neutral','suspicious','shocked','bidding']
  assert len({im.crop((i*64,0,i*64+64,64)).tobytes() for i in range(4)})==4,p
 elif 'sourcePortrait' in a:
  src=Image.open(OUT/a['sourcePortrait']).convert('RGBA');x,y,w,h=a['sourceRect']
  assert src.crop((x,y,x+w,y+h)).resize((24,24),Image.Resampling.NEAREST).tobytes()==im.tobytes(),p
 if 'regions' in a:
  occupied=set()
  for n,(x,y,w,h) in a['regions'].items():
   assert x>=0 and y>=0 and x+w<=im.width and y+h<=im.height
   points={(xx,yy) for xx in range(x,x+w) for yy in range(y,y+h)}
   assert not points&occupied,n;occupied|=points
   assert im.crop((x,y,x+w,y+h)).getbbox(),n
  assert len(a['regions'])==12
  for an in a['regionAnimations'].values():assert all(n in a['regions'] for n in an['frames'])
assert len(visible)<=32
s=json.loads((ROOT/'docs/art/batch-zirkel-generation.json').read_text())
assert {o for j in s['jobs'] for o in j['outputs']}==set(expected)
assert all(j.get('prompt') and len(j.get('sourceSha256',''))==64 for j in s['jobs'])
assert {n['id'] for n in s['members']}=={'tm_'+n for n in members}
print(f'PASS: {len(assets)} PNGs, 18 members, 288 walk frames, 72 portrait states, 18 derived heads, 12 UI regions, {len(visible)} shared colors; binary alpha and manifest checked.')
