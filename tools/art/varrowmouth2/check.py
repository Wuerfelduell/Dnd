#!/usr/bin/env python3
"""Validate the CW delivery; requires Pillow. Run from any directory."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites'
m=json.loads((SPR/'manifest-varrowmouth2.json').read_text());palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']}
errors=[];results=[];paths=set();ids=set()
def check(ok,message):
 if not ok:errors.append(message)
for a in m['assets']:
 f=a['file'];p=SPR/f
 check(f not in paths,f+' duplicate path');paths.add(f)
 check(a['id'] not in ids,f+' duplicate id');ids.add(a['id'])
 if not p.exists():errors.append(f+' missing');continue
 im=Image.open(p).convert('RGBA');pixels=list(im.get_flattened_data()) if hasattr(im,'get_flattened_data') else list(im.getdata());colors={v[:3] for v in pixels if v[3]};alpha={v[3] for v in pixels}
 check(im.size==(a['width'],a['height']),f+' dimensions')
 check(len(colors)<=32 and colors<=palette,f+' palette')
 check(alpha<={0,255},f+' non-binary alpha')
 check((0 in alpha and 255 in alpha) if a['transparent'] else alpha=={255},f+' opacity')
 check(a['frameWidth']*a['columns']==im.width and a['frameHeight']*a['rows']==im.height,f+' frame grid')
 check(hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],f+' sha256')
 for name,anim in a['animations'].items():
  check(anim['frames'] and all(type(i)==int and 0<=i<a['columns']*a['rows'] for i in anim['frames']),f+' animation indices '+name)
  check(anim['frameRate']>0,f+' frame rate '+name)
  frames=[im.crop(((i%a['columns'])*a['frameWidth'],(i//a['columns'])*a['frameHeight'],(i%a['columns']+1)*a['frameWidth'],(i//a['columns']+1)*a['frameHeight'])).tobytes() for i in anim['frames']]
  check(len(set(frames))==len(frames),f+' duplicate animation frames '+name)
 for name,r in a.get('regions',{}).items():check(0<=r['x']<r['x']+r['width']<=im.width and 0<=r['y']<r['y']+r['height']<=im.height,f+' region '+name)
 for r in a.get('emptyRegions',[]):check(im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).getchannel('A').getbbox() is None,f+' nonempty rest region')
 for name,pin in a.get('pins',{}).items():check(8<=pin['x']<=im.width-8 and 8<=pin['y']<=im.height-8,f+' pin '+name)
 results.append(dict(file=f,size=list(im.size),visibleColors=len(colors),alphaValues=sorted(alpha),grid=[a['columns'],a['rows']],sha256=a['sha256']))
check(len(paths)==61,'expected 61 PNG files')
check(len([f for f in paths if f.startswith('battle/')])==10,'ten battle backgrounds')
check(len([f for f in paths if f.startswith('items/32/')])==12,'twelve large item icons')
check(len([f for f in paths if f.startswith('items/') and '/32/' not in f])==12,'twelve small item icons')
by={a['file']:a for a in m['assets']}
check(by['ui/vm_stadtkarte_ebbe.png']['pins']==by['ui/vm_stadtkarte_flut.png']['pins'],'map pin alignment')
check(len(by['ui/vm_stadtkarte_ebbe.png']['pins'])==8,'eight map pins')
for name in ['1_ankunft','5_wrackmutter','9_registerkeller','10_pegelherrin']:check(by[f'sequences/K6_{name}.png']['width']==960,'four frames '+name)
report=dict(batch='varrowmouth2',passed=not errors,assetCount=len(results),checks=['required counts','dimensions','shared palette <=32','binary alpha / opacity','frame grid','animation indices, timing and distinct frames','regions / transparent remainder','eight aligned map pins','sha256'],limitations=['Raster check verifies integer pixel/frame geometry, not automatic semantic tile alignment or visual quality.','CU item IDs provisional until data package lands; symbol-to-item aliases documented in manifest.'],errors=errors,assets=results)
(ROOT/'docs/art/batch-varrowmouth2-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
# One review contact sheet includes every PNG; first frame for animations.
thumbw,thumbh=240,135;cw,ch=256,164
preview=Image.new('RGB',(cw*4,ch*((len(m['assets'])+3)//4)),(26,28,44));d=ImageDraw.Draw(preview)
for n,a in enumerate(m['assets']):
 im=Image.open(SPR/a['file']).convert('RGBA')
 if a['file'] not in ('ui/vm_pins.png','ui/vm_symbole.png','ui/vm_zeiger.png'):im=im.crop((0,0,a['frameWidth'],a['frameHeight']))
 im=ImageOps.contain(im,(thumbw,thumbh),Image.Resampling.NEAREST)
 x=(n%4)*cw+8;y=(n//4)*ch+5
 preview.paste(im,(x+(thumbw-im.width)//2,y+(thumbh-im.height)//2),im)
 d.text((x,y+138),a['file'].split('/')[-1],fill=(224,201,161))
preview.save(ROOT/'docs/art/batch-varrowmouth2-preview.png')
print(json.dumps({'passed':not errors,'assets':len(results),'errors':errors},ensure_ascii=False));sys.exit(bool(errors))
