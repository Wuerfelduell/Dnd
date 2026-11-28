#!/usr/bin/env python3
"""Strict EA2 contract checker; writes docs/art/batch-gestalt2b-validation.json."""
from __future__ import annotations
import hashlib,json,os,sys,tempfile
from pathlib import Path
from PIL import Image,ImageChops

ROOT=Path(__file__).resolve().parents[3];SPRITES=ROOT/'public/sprites';SRC=ROOT/'tools/art/gestalt2b/sources/seq3';BATCH='gestalt2b'
RAW=Path(os.environ.get('GESTALT2B_RAW_DIR',Path(tempfile.gettempdir())/'Dnd-gestalt2b-raw'))
PATHS=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
expected={}
for p in PATHS:
 expected[f'characters/hg_form_{p}_s2.png']=(32,48,4,4)
 expected[f'battle/hg_battle_{p}_s2.png']=(96,96,6,6)
 expected[f'ui/hg_zug_{p}_s2.png']=(32,32,1,1)
player=Image.open(SPRITES/'battle/battle_player.png').convert('RGBA')
player_colors={px[:3] for px in player.get_flattened_data() if px[3]}
manifest=json.loads((SPRITES/'manifest-gestalt2b.json').read_text(encoding='utf-8'))
assert manifest['batch']==BATCH and len(manifest['assets'])==30
assert {a['file'] for a in manifest['assets']}==set(expected)
assert len({a['id'] for a in manifest['assets']})==30
manifest_palette={tuple(bytes.fromhex(c.lstrip('#'))) for c in manifest['palette']}
assert manifest_palette==player_colors,'manifest palette must match reference player palette'
errors=[];reports=[];shared=set();total_frames=0

def data(im):return list(im.get_flattened_data())
def mask_diff(a,b):return sum(x[3]!=y[3] for x,y in zip(data(a),data(b)))
def validate_raw(raw):
 counts=raw.getcolors(maxcolors=1024)
 assert counts is not None,'raw frame has too many distinct RGBA colors'
 px=[v for _,v in counts];alpha={v[3] for v in px};colors={v[:3] for v in px if v[3]}
 assert alpha<={0,255},'raw frame has nonbinary alpha'
 assert all(v==(0,0,0,0) for v in px if v[3]==0),'raw transparent matte'
 assert colors<=player_colors and len(colors)<=32,'raw frame palette'
 assert not any(min(v[:3])>240 for v in px if v[3]),'raw frame near-white'
def has_edge_pixels(im):
 w,h=im.size;px=im.load()
 return any(px[x,0][3] or px[x,h-1][3] for x in range(w)) or any(px[0,y][3] or px[w-1,y][3] for y in range(h))
def path_id(rel):
 name=Path(rel).stem.removesuffix('_s2')
 for prefix in ('hg_form_','hg_battle_','hg_zug_'):
  if name.startswith(prefix):return name[len(prefix):]
 raise ValueError(f'unknown asset path {rel}')

for asset in manifest['assets']:
 rel=asset['file']
 try:
  fw,fh,cols,rows=expected[rel];path=SPRITES/rel;im=Image.open(path)
  assert im.mode=='RGBA','PNG must be RGBA'
  assert im.size==(fw*cols,fh*rows)==(asset['width'],asset['height']),'canvas size'
  assert (asset['frameWidth'],asset['frameHeight'],asset['columns'],asset['rows'])==(fw,fh,cols,rows),'frame grid'
  assert asset['transparent'] is True
  rgba=data(im);alphas={px[3] for px in rgba};assert alphas<=set((0,255)),'nonbinary alpha'
  assert all(px==(0,0,0,0) for px in rgba if px[3]==0),'transparent matte must be clear'
  colors={px[:3] for px in rgba if px[3]}
  assert 0<len(colors)<=32,f'color count {len(colors)}'
  assert colors<=player_colors,'color outside allowed Seq-4/player palette'
  assert not any(min(px[:3])>240 for px in rgba if px[3]),'near-white pixel (>240)'
  frames=[im.crop((i%cols*fw,i//cols*fh,(i%cols+1)*fw,(i//cols+1)*fh)) for i in range(cols*rows)]
  assert all(not has_edge_pixels(fr) for fr in frames),'pixel touches cell border'
  assert all(fr.getchannel('A').getbbox() for fr in frames),'empty required cell'
  rawdir=RAW/path_id(rel)
  if rel.startswith('characters/'):
   assert asset['baseline']==46
   assert all(fr.getchannel('A').getbbox()[3]-1==46 for fr in frames),'shadow baseline !=46'
   for fr in frames:
    assert not any(fr.getpixel((x,44))[3] for x in range(32)),'hover gap missing above shadow'
   assert set(asset['animations'])=={'down','left','right','up'}
   first=[frames[r*4] for r in range(4)]
   assert len({fr.tobytes() for fr in first})==4,'card facings are not four distinct directions'
   assert frames[12].getchannel('A').getbbox()[1]<24,'back-view head is not in upper half'
   for r in range(4):assert len({frames[r*4+i].tobytes() for i in range(4)})>1,'static card walk row'
   for i,fr in enumerate(frames):
    raw=Image.open(rawdir/f'card_{i:02d}.png').convert('RGBA')
    assert raw.size==(fw*4,fh*4)
    validate_raw(raw)
    assert raw.resize((fw,fh),Image.Resampling.NEAREST).tobytes()==fr.tobytes(),f'non-Nearest Neighbor card frame {i}'
  elif rel.startswith('battle/'):
   assert 16<=len(colors)<=32,f'battle palette has {len(colors)} colors'
   assert set(asset['animations'])=={'idle','attack1','attack2','special','hurt','defeated'}
   for name,anim in asset['animations'].items():
    assert anim['frameRate']>0 and anim['repeat'] in (-1,0)
    assert len(anim['frames'])==6 and all(0<=i<36 for i in anim['frames'])
   assert frames[8].tobytes()==frames[9].tobytes(),'attack1 frames 3 and 4 must match'
   base=frames[0]
   for row,name in enumerate(['idle','attack1','attack2','special','hurt','defeated']):
    diffs=[mask_diff(base,frames[row*6+i]) for i in range(6)]
    if name in ('attack1','attack2','special','defeated'):
     assert max(diffs)>=800,f'{name} changes only {max(diffs)} mask pixels'
   attack2=frames[12:18]
   assert max(max(x for x in range(96) if any(f.getpixel((x,y))[3] for y in range(96))) for f in attack2)>=93,'attack2 effect does not reach the right edge'
   shadow=[fr.crop((39,93,58,95)).tobytes() for fr in frames]
   assert len(set(shadow))==1,'combat shadow moves between frames'
   assert frames[35].getchannel('A').getbbox()[3]>=94,'defeated final remnant is not on the floor'
   for i,fr in enumerate(frames):
    raw=Image.open(rawdir/f'battle_{i:02d}.png').convert('RGBA')
    assert raw.size==(fw*4,fh*4)
    validate_raw(raw)
    assert raw.resize((fw,fh),Image.Resampling.NEAREST).tobytes()==fr.tobytes(),f'non-Nearest Neighbor battle frame {i}'
  else:
   assert asset['derivedFrom']==f"battle/hg_battle_{rel.split('_')[-1].removesuffix('_s2.png')}_s2.png" or asset.get('kind')=='icon'
   assert asset.get('derivedFrom','').startswith('battle/hg_battle_')
   assert asset['derivedFrom'] in {a['file'] for a in manifest['assets']}
   assert all(not has_edge_pixels(fr) for fr in frames)
   p=Path(rel).stem.removeprefix('hg_zug_').removesuffix('_s2')
   source=Image.open(SPRITES/f'battle/hg_battle_{p}_s2.png').convert('RGBA').crop((33,17,63,47))
   derived=Image.new('RGBA',(32,32),(0,0,0,0));derived.alpha_composite(source,(1,1))
   assert derived.tobytes()==im.tobytes(),'zug icon is not derived from new battle idle'
  # Every output must visibly differ from the old Seq-2 proposal and both body references.
  base_file=rel.replace('_s2.png','.png')
  if (SPRITES/base_file).exists():assert Image.open(SPRITES/base_file).convert('RGBA').tobytes()!=im.tobytes(),'identical to Seq-4'
  seq3=SRC/rel.split('/',1)[0]/Path(rel).name.replace('_s2.png','_s3.png')
  if seq3.exists():assert seq3.read_bytes()!=path.read_bytes(),'identical to Seq-3'
  shared|=colors;total_frames+=len(frames)
  reports.append({'file':rel,'size':list(im.size),'frames':len(frames),'colors':len(colors),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'ok':True})
 except Exception as exc:errors.append({'file':rel,'error':str(exc)})

raw_root=RAW
raw_count=sum(1 for _ in raw_root.rglob('*.png')) if raw_root.exists() else 0
assert raw_count==520,f'raw frame count {raw_count}, expected 520'
result={'batch':BATCH,'ok':not errors,'assets':len(reports),'frames':total_frames,'rawFrames':raw_count,'sharedColors':len(shared),'errors':errors,
 'checks':['30-file inventory and manifest','exact RGBA size and grid','colors from the game reference palette; combat 16-32','binary alpha; no white pixels >240','no empty cell or pixel on a cell edge','card directions and walk motion','hover gap and fixed shadow baseline y=46','battle fixed shadow and attack1 anticipation hold','attack1/attack2/special/defeated alpha-mask motion >=800','attack2 effect reaches right side','frame sources downsample exactly with Nearest Neighbor','icons cropped from new battle idle'], 'files':reports}
(ROOT/'docs/art/batch-gestalt2b-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if errors:print(json.dumps(errors,ensure_ascii=False,indent=2));sys.exit(1)
assert len(reports)==30 and total_frames==530
print(f"PASS: {len(reports)} PNGs, {total_frames} frames, {raw_count} raw sources; 16-32 combat colors, binary alpha, margins, directions, hover, shadows and movement checked.")
