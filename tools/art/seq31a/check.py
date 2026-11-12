"""Validate DC1 deliverables independently of the image export tool (Pillow only)."""
import hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
M=json.loads((ROOT/'public/sprites/manifest-seq31a.json').read_text())
P={tuple(bytes.fromhex(c[1:])) for c in M['palette']}
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
expected={}
for p in paths:
 expected[f'characters/hg_form_{p}_still.png']=(128,192,32,48,4,4)
 expected[f'battle/hg_form_{p}_still.png']=(576,384,96,96,6,4)
 for seq,n in [(3,6),(1,4)]:expected[f'fx/aura_seq{seq}_{p}.png']=(n*64,64,64,64,n,1)
for who in ['A_player','p2a','p2b']:
 for seq in [3,1]:expected[f'characters/{who}_drink_seq{seq}.png']=(128,32,16,32,8,1)
for seq in [3,1]:expected[f'fx/HG_aufstieg_{seq}.png']=(1920,135,240,135,8,1)
expected['ui/hg_hud_seq31.png']=(64,32,32,32,2,1)
errors=[];records=[]
def require(condition,message):
 if not condition:errors.append(message)
require(len(M['assets'])==49,'asset count must be 49')
require(set(a['file'] for a in M['assets'])==set(expected),'exact required file set')
require(len({a['id'] for a in M['assets']})==len(M['assets']),'duplicate IDs')
for a in M['assets']:
 f=a['file'];file=ROOT/'public/sprites'/f
 try:
  im=Image.open(file).convert('RGBA');pixels=list(im.get_flattened_data()) if hasattr(im,"get_flattened_data") else list(im.getdata());colors={p[:3] for p in pixels if p[3]};alpha={p[3] for p in pixels}
  require(tuple(a[k] for k in ['width','height','frameWidth','frameHeight','columns','rows'])==expected[f],f+': manifest geometry')
  require(im.size==(a['width'],a['height']),f+': image size')
  require(len(colors)<=32 and colors<=P,f+': shared palette')
  require(alpha<={0,255},f+': binary alpha')
  require(alpha=={255} if not a['transparent'] else 0 in alpha,f+': transparency mode')
  fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows'];cells=[im.crop((x*fw,y*fh,(x+1)*fw,(y+1)*fh)) for y in range(rows) for x in range(cols)]
  empty=set(a.get('emptyFrames',[]))
  for n,c in enumerate(cells):
   bbox=c.getbbox();require((bbox is None)==(n in empty),f+f': occupied cell {n}')
   if bbox and a.get('baseline') is not None:require(bbox[3]-1==a['baseline'],f+f': baseline {n}')
  for name,an in a.get('animations',{}).items():
   require(all(isinstance(n,int) and 0<=n<len(cells) and n not in empty for n in an['frames']),f+': animation bounds '+name)
   require(an['frameRate']>0,f+': frame rate')
   require(len({cells[n].tobytes() for n in an['frames']})>1,f+': static animation '+name)
  if a['kind']=='map':require(a['emptyFrames']==[2,3,6,7,10,11,14,15],f+': unused cells')
  if a['kind']=='battle':
   require(cells[8].tobytes()==cells[9].tobytes(),f+': human hold')
   require(cells[8].tobytes()!=cells[0].tobytes(),f+': human distinct')
   for n in range(6):
    require(cells[n].getbbox()[1]<cells[n+12].getbbox()[1]<cells[n+18].getbbox()[1],f+': calm lowered posture')
  if f.startswith('fx/aura_seq1_'):
   require((111,224,208) not in colors,f+': forbidden turquoise')
   require(colors<={(168,180,192),(149,165,165)},f+': pale rim palette')
  records.append(dict(file=f,size=list(im.size),visibleColors=len(colors),frames=len(cells),emptyFrames=len(empty),sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
 except Exception as e:errors.append(f+': '+str(e))
for p,mapping in M['paths'].items():
 require(p in paths and all(mapping[k] in expected for k in ['map','battle','aura3','aura1']),'path mapping '+p)
report=dict(batch='seq31a',ok=not errors,assetCount=len(records),frameCells=sum(x['frames'] for x in records),occupiedFrames=sum(x['frames']-x['emptyFrames'] for x in records),paletteMax=32,checks=['exact file set and dimensions','fixed CO palette','binary alpha and opaque scenes','frame grid and empty cells','map/drink baselines','animation references and nonstatic frames','human holds and lowered postures','seq1 neutral aura colors'],errors=errors,assets=records)
(ROOT/'docs/art/batch-seq31a-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print(f"OK: 49 PNGs, {report['frameCells']} cells, {report['occupiedFrames']} occupied frames; palette, alpha, dimensions, grid, baselines, animations and path mappings valid.")
