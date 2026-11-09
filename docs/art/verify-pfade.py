"""Asset-contract validation; run from any directory. Requires Pillow and numpy."""
from pathlib import Path
from PIL import Image
import json,numpy as np
root=Path(__file__).resolve().parents[2]
m=json.loads((root/'public/sprites/manifest-pfade.json').read_text());a=m['assets'];errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check(len(a)==155,f'Expected 155 PNGs, got {len(a)}')
check(len({x['id'] for x in a})==len(a),'Duplicate asset IDs')
check(len({x['file'] for x in a})==len(a),'Duplicate paths')
visible=set()
for x in a:
 p=root/'public/sprites'/x['file'];check(p.is_file(),f'Missing {p}')
 if not p.is_file():continue
 im=Image.open(p);check(im.mode=='P',f'Not indexed: {x["id"]}');im=im.convert('RGBA');arr=np.array(im);alpha=arr[:,:,3];id=x['id']
 check(im.size==(x['width'],x['height']),f'Dimensions: {id}')
 check(set(np.unique(alpha))<=({0,255} if x['transparent'] else {255}),f'Alpha: {id}')
 check(np.any(alpha==255),f'Empty asset: {id}')
 if x['transparent']:check(np.any(alpha==0),f'No transparency: {id}')
 colors=set(map(tuple,arr[:,:,:3][alpha==255]));visible|=colors;check(len(colors)<=31,f'Palette: {id}')
 fw,fh=x['frameWidth'],x['frameHeight'];cols,rows=x['columns'],x['rows']
 check(fw*cols==im.width and fh*rows==im.height,f'Frame grid: {id}')
 for name,an in x.get('animations',{}).items():
  for i in an['frames']:
   check(0<=i<cols*rows,f'Frame index: {id}/{name}')
   cell=alpha[i//cols*fh:(i//cols+1)*fh,i%cols*fw:(i%cols+1)*fw]
   check(np.any(cell),f'Empty animation frame: {id}/{i}')
 for name,(xx,yy,w,h) in x.get('regions',{}).items():
  check(0<=xx<xx+w<=im.width and 0<=yy<yy+h<=im.height,f'Region outside atlas: {id}/{name}')
  check(np.any(alpha[yy:yy+h,xx:xx+w]),f'Empty region: {id}/{name}')
 if id.endswith('_walk'):
  for i in range(16):
   part=alpha[i//4*32:(i//4+1)*32,i%4*16:(i%4+1)*16];ys,xs=np.where(part>0)
   check(len(ys)>0 and ys.max()==30,f'Walk baseline: {id}/{i}')
   check(not np.any(part[:,[0,15]]),f'Walk cell edge: {id}/{i}')
 if id.startswith('cauldron_'):
  for i in range(6):
   ys,xs=np.where(alpha[:,i*32:(i+1)*32]>0);check(len(ys)>0 and ys.max()==30,f'Cauldron baseline: {id}/{i}')
 if id=='A_11_control_cracks':
  for i in range(4):check(not np.any(alpha[54:216,i*480+96:i*480+384]),f'Cracks obscure center: {i}')
check(len(visible)<=31,f'Global palette has {len(visible)} colors')
byfile={x['file']:x for x in a}
for f in ['props/A_08_nachtmarkt_props.png','props/A_08_kampfgrube.png','ui/A_10_shop.png','ui/A_11_digestion.png','ui/A_11_control_cracks.png','characters/A_player_drink.png','fx/potion_ascend.png','fx/aura_pfade.png','tilesets/A_07_nachtmarkt_tiles.png','pathways/ladder.png','pathways/ladder_sockets.png']:
 check(f in byfile,f'Missing required path: {f}')
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel']
for p in paths:
 for seq in [9,8,7]:
  for prefix in ['items/','items/32/']:check(prefix+f'trank_{p}_{seq}.png' in byfile,f'Missing potion {p}/{seq}/{prefix}')
  check(f'items/formel_{p}_{seq}.png' in byfile,f'Missing formula {p}/{seq}')
 for size in [16,32,64]:check(f'pathways/emblem_{p}_{size}.png' in byfile,f'Missing emblem {p}/{size}')
 check(f'pathways/card_{p}.png' in byfile,f'Missing card {p}')
# Individual formula files must match their atlas cells exactly.
atlas=Image.open(root/'public/sprites/items/formeln.png').convert('RGBA')
for r,seq in enumerate([9,8,7]):
 for c,p in enumerate(paths):
  single=Image.open(root/f'public/sprites/items/formel_{p}_{seq}.png').convert('RGBA')
  check(single.tobytes()==atlas.crop((c*16,r*16,c*16+16,r*16+16)).tobytes(),f'Formula atlas mismatch: {p}/{seq}')
# Ground variants have shared opposite edges, including across variants.
t=Image.open(root/'public/sprites/tilesets/A_07_nachtmarkt_tiles.png').convert('RGBA')
for c in range(8):
 part=np.array(t.crop((c*16,0,c*16+16,16)))
 check(np.array_equal(part[0],part[-1]) and np.array_equal(part[:,0],part[:,-1]),f'Ground seam {c}')
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print(f'PASS: {len(a)} PNGs; {len(visible)} shared visible colors; dimensions, alpha, frame/region bounds, populated animations, baselines, IDs, atlas correspondence and ground seams.')
