#!/usr/bin/env python3
"""CN PNG contract checks; run from any working directory. Requires Pillow."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
SPR=ROOT/'public/sprites'
m=json.loads((SPR/'manifest-kettlegate-leben.json').read_text())
assert m['batch']=='kettlegate_leben'
assert len(m['assets'])==35
ids=set();files=set();frames=0;union=set()
for a in m['assets']:
 assert a['id'] not in ids, a['id'];ids.add(a['id'])
 assert a['file'] not in files;files.add(a['file'])
 im=Image.open(SPR/a['file']);assert im.mode=='RGBA',a['file']
 assert im.size==(a['width'],a['height']),a['file']
 px=list(im.getdata());alpha={v[3] for v in px};assert alpha=={0,255},(a['file'],alpha)
 colors={v[:3] for v in px if v[3]};assert len(colors)<=32,(a['file'],len(colors));union|=colors
 assert all(v==(0,0,0,0) for v in px if not v[3]),'invisible matte'
 def region(x,y,w,h,n,animations):
  global frames
  assert x>=0 and y>=0 and w>0 and h>0 and x+w*n<=im.width and y+h<=im.height,a['file']
  cells=[im.crop((x+i*w,y,x+(i+1)*w,y+h)) for i in range(n)]
  assert all(c.getbbox() for c in cells),(a['file'],x,y,'empty frame')
  for an in animations.values():
   assert an['frameRate']>0 and an['frames']
   assert all(isinstance(i,int) and 0<=i<n for i in an['frames'])
   if len(an['frames'])>1:assert len({cells[i].tobytes() for i in an['frames']})>=2,(a['file'],x,y,'static animation')
  frames+=n
 if 'frameWidth' in a:
  w,h=a['frameWidth'],a['frameHeight'];assert im.width==w*a['columns'] and im.height==h*a['rows']
  for y in range(a['rows']):region(0,y*h,w,h,a['columns'],{})
  for an in a.get('animations',{}).values():
   assert all(0<=i<a['columns']*a['rows'] for i in an['frames'])
   crops=[im.crop(((i%a['columns'])*w,(i//a['columns'])*h,(i%a['columns']+1)*w,(i//a['columns']+1)*h)).tobytes() for i in an['frames']]
   assert len(set(crops))>=2,'walk frames identical'
 else:
  occupied=set()
  for r in a['regions'].values():
   region(r['x'],r['y'],r['frameWidth'],r['frameHeight'],r['columns'],r['animations'])
   pixels={(x,y) for y in range(r['y'],r['y']+r['frameHeight']) for x in range(r['x'],r['x']+r['frameWidth']*r['columns'])}
   assert not occupied&pixels,'region overlap';occupied|=pixels
assert len(union)<=32
for n in json.loads((ROOT/'docs/story/kg_leben/npcs.json').read_text()).values():assert (SPR/n['sheet']).exists()
print(f'OK: {len(files)} PNGs; {frames} nichtleere Frames; {len(union)} gemeinsame Farben; binäres Alpha; Maße, Regionen, Animationen und NPC-Sheets geprüft.')
