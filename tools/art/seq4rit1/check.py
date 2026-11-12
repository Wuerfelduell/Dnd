"""Validate the DN deliverable without changing game files. Requires Pillow."""
import json,hashlib,sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
manifest=json.loads((ROOT/'public/sprites/manifest-seq4rit1.json').read_text())
spec=json.loads((Path(__file__).parent/'spec.json').read_text())
receipts=json.loads((ROOT/'docs/art/batch-seq4rit1-generation.json').read_text())['assets']
palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
errors=[];results=[]
def require(ok,msg):
 if not ok:errors.append(msg)
require({a['file'] for a in manifest['assets']}=={s['file'] for s in spec},'Asset set differs from DN specification')
require(len({a['id'] for a in manifest['assets']})==len(spec),'Duplicate IDs')
for a,s,rec in zip(manifest['assets'],spec,receipts):
 path=ROOT/'public/sprites'/a['file'];before=len(errors)
 if not path.exists():errors.append(f'Missing {a["file"]}');continue
 im=Image.open(path);rgba=im.convert('RGBA');colors={p[:3] for p in rgba.getdata() if p[3]};alphas=set(rgba.getchannel('A').getdata())
 require(im.size==(s['w']*s.get('cols',s['n']),s['h']*s.get('rows',1)),a['file']+': dimensions')
 require(im.size==(a['width'],a['height']),a['file']+': manifest dimensions')
 require(im.mode=='P',a['file']+': indexed PNG')
 require(len(colors)<=32 and colors<=palette,a['file']+': palette')
 require(alphas<={0,255},a['file']+': binary alpha')
 require(alphas=={255} if not a['transparent'] else 0 in alphas,a['file']+': transparency contract')
 fw,fh,cols,rows=a['frameWidth'],a['frameHeight'],a['columns'],a['rows'];frames=[];used=set()
 require(fw*cols==im.width and fh*rows==im.height,a['file']+': frame grid')
 for r in range(rows):
  for c in range(cols):
   f=rgba.crop((c*fw,r*fh,(c+1)*fw,(r+1)*fh));frames.append(f);b=f.getchannel('A').getbbox();active=c<a['occupiedCounts'][r]
   require(bool(b)==active,f'{a["file"]}: occupancy {r},{c}')
   if active:used.add(r*cols+c)
   if active and 'baseline' in a:require(b[3]==a['baseline'],f'{a["file"]}: baseline {r},{c}')
   if 'transparentCenter' in a:
    x,y,w,h=a['transparentCenter'];require(f.getchannel('A').crop((x,y,x+w,y+h)).getbbox() is None,a['file']+': clear center')
 for name,anim in a['animations'].items():
  require(set(anim['frames'])<=used,a['file']+': animation points at blank/outside cell')
  require(anim['frameRate']>0,a['file']+': frame rate')
  if len(anim['frames'])>1:require(len({frames[i].tobytes() for i in anim['frames']})>1,a['file']+': animation has no variation '+name)
 for r in a.get('heldRows',[]):require(frames[r*cols].tobytes()==frames[r*cols+1].tobytes(),a['file']+': held windup')
 if a['file'].startswith('battle/s4ma_'):
  expected=[[0,1,2,3],list(range(6,12)),list(range(12,17)),list(range(18,22)),list(range(24,28)),list(range(30,34)),list(range(36,39)),list(range(42,46)),list(range(48,54))]
  require([v['frames'] for v in a['animations'].values()]==expected,a['file']+': player animation compatibility')
 if a['file'].startswith('characters/'):
  require(len({frames[r*4].tobytes() for r in range(4)})==4,a['file']+': direction variation')
 if a.get('regions'):
  for region in a['regions'].values():require(region['x']+region['width']<=im.width and region['y']+region['height']<=im.height,a['file']+': region bounds')
 if a.get('nineSlice'):require(all(v==16 for v in a['nineSlice'].values()) and im.size==(48,48),a['file']+': 9slice grid')
 require(hashlib.sha256(path.read_bytes()).hexdigest()==rec['outputSha256'],a['file']+': generation receipt SHA')
 results.append({'file':a['file'],'size':list(im.size),'visibleColors':len(colors),'frames':len(used),'passed':len(errors)==before})
ids={a['id'] for a in manifest['assets']}
require({i for v in manifest['rituals'].values() for i in v}==ids,'Ritual mapping incomplete')
report={'batch':'seq4rit1','passed':not errors,'assetCount':len(results),'frameCount':sum(r['frames'] for r in results),'checks':['exact required file set','dimensions and integral frame grid','shared palette <=32 visible colors','indexed PNG','binary alpha / opaque scenes','empty cells','animation indices and variation','held melee windup','player 6x9 compatibility','world baselines and direction variation','transparent screen centers','atlas region bounds','16px nine-slice','generation SHA256','ritual mappings'],'scope':'Technical export validation; visual review performed separately. No gameplay/runtime integration tests.','errors':errors,'assets':results}
(ROOT/'docs/art/batch-seq4rit1-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['batch','passed','assetCount','frameCount','errors']},ensure_ascii=False,indent=2));sys.exit(bool(errors))
