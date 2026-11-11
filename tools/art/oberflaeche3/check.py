#!/usr/bin/env python3
"""Independent contract / PNG checks for DM. Requires Pillow and fontTools."""
import json,hashlib,sys,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites'
m=json.loads((SPR/'manifest-oberflaeche3.json').read_text());pal={tuple(bytes.fromhex(c[1:])) for c in m['palette']}
errors=[];out=[];by={};expected={}
def ck(ok,msg):
 if not ok:errors.append(msg)
def exp(f,w,h):expected[f]=(w,h)
for n in range(1,7):
 for layer in ('himmel','stadt','vordergrund','nebel'):exp(f'ui/titel_k{n}_{layer}.png',480,270)
 exp(f'ui/titel_nachspiel_{n}.png',480,270)
for f in ('titel_k5_vordergrund_warm','titel_k6_himmel_flut','titel_verzicht'):exp('ui/'+f+'.png',480,270)
for n in range(1,25):exp(f'ui/laden_{n}.png',240,135)
for c in ('kettlegate','wexmoor','dunscar','calderwick','briarholt','varrowmouth'):exp('ui/spielstand_'+c+'.png',96,54)
for f,w,h in [('laden_rahmen',48,48),('laden_punkte',64,16),('spielstand_rahmen',48,48),('spielstand_marken',192,16),('abspann_rahmen',480,270),('abspann_trenner',768,16),('abspann_schluss',3840,270),('abspann_dank',240,135),('post_symbole',192,16),('post_symbole_32',384,32),('farben_symbole',480,16),('cursor_gross',128,32),('touch_icons_gross',640,128)]:exp('ui/'+f+'.png',w,h)
for n in range(1,7):
 exp(f'items/post_foto_{n}.png',16,16);exp(f'items/32/post_foto_{n}.png',32,32)
chars=sorted(cp for cp in TTFont(ROOT/'tools/art/oberflaeche3/PixelifySans.ttf').getBestCmap() if cp>=32)
exp('ui/schrift_gross.png',384,math.ceil(len(chars)/16)*24)
ck(len(m['assets'])==89,'89 required PNGs')
for a in m['assets']:
 f=a['file'];ck(f not in by,'duplicate '+f);by[f]=a
 p=SPR/f
 if not p.exists():errors.append('missing '+f);continue
 im=Image.open(p).convert('RGBA');px=list(im.get_flattened_data()) if hasattr(im,'get_flattened_data') else list(im.getdata());colors={p[:3] for p in px if p[3]};alpha={p[3] for p in px}
 ck(im.size==expected.get(f),'contract dimensions '+f)
 ck(im.size==(a['width'],a['height']),'manifest dimensions '+f)
 ck(colors<=pal and len(colors)<=32,'palette '+f);ck(alpha<={0,255},'binary alpha '+f)
 ck((0 in alpha and 255 in alpha) if a['transparent'] else alpha=={255},'opacity '+f)
 ck(a['columns']*a['frameWidth']==im.width and a['rows']*a['frameHeight']==im.height,'grid '+f)
 ck(hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],'hash '+f)
 for name,r in a.get('regions',{}).items():
  ck(0<=r['x']<r['x']+r['width']<=im.width and 0<=r['y']<r['y']+r['height']<=im.height,'region '+f+' '+name)
 for name,anim in a['animations'].items():
  ck(anim['frameRate']>0 and anim['frames'],'timing '+f);frames=[]
  for i in anim['frames']:
   ck(type(i)==int and 0<=i<a['columns']*a['rows'],'frame index '+f)
   x=i%a['columns']*a['frameWidth'];y=i//a['columns']*a['frameHeight'];frames.append(im.crop((x,y,x+a['frameWidth'],y+a['frameHeight'])).tobytes())
  ck(len(set(frames))==len(frames),'distinct animation frames '+f)
 out.append({'file':f,'size':list(im.size),'colors':len(colors),'alpha':sorted(alpha),'sha256':a['sha256']})
ck(set(by)==set(expected),'complete exact file set')
for name,conf in m['titleLayers'].items():
 ck(len(conf['order'])==4,'four layers '+name)
 for l in conf['order']:ck(l['file'] in by and 0<=l['parallax']<=1,'layer reference '+name)
 r=conf['titleSafeRect']
 ck(0<=r['x']<r['x']+r['width']<=480 and 0<=r['y']<r['y']+r['height']<=270,'title safe rectangle bounds '+name)
# Exact shared touch source and region meanings after 2x NN and allowed palette map.
base=Image.open(SPR/'ui/AE_touch.png').convert('RGBA').resize((640,128),Image.Resampling.NEAREST)
large=Image.open(SPR/'ui/touch_icons_gross.png').convert('RGBA')
ck(base.getchannel('A').tobytes()==large.getchannel('A').tobytes(),'touch alpha exactly 2x')
ck(len(by['ui/touch_icons_gross.png']['regions'])==20,'touch twenty states')
ck(len(by['ui/farben_symbole.png']['regions'])==30,'thirty shape symbols')
cb=Image.open(SPR/'ui/farben_symbole.png').convert('RGBA');visible={p[:3] for p in cb.getdata() if p[3]};ck(len(visible)<=2,'accessibility shapes monochrome')
shapes=[cb.crop((i*16,0,i*16+16,16)).tobytes() for i in range(30)];ck(len(set(shapes))==30,'thirty distinct shape masks')
font=by['ui/schrift_gross.png'];ck(sorted(g['codepoint'] for g in font['glyphs'].values())==chars,'complete font cmap')
for c in 'ÄÖÜäöüß':ck(c in font['glyphs'] and not font['glyphs'][c]['empty'],'German glyph '+c)
ck(font['font']['rasterSizePixels']==2*font['font']['baseSizePixels'],'font double base size')
frame=Image.open(SPR/'ui/abspann_rahmen.png').convert('RGBA');ck(frame.crop((64,24,416,246)).getchannel('A').getbbox() is None,'transparent credits text window')
report=dict(batch='oberflaeche3',passed=not errors,assetCount=len(out),fontGlyphs=len(chars),errors=errors,checks=['independent 89-file contract','dimensions','palette <=32','binary alpha','frame grid','animation indices and distinct frames','atlas regions','title layer references','complete original Webfont cmap including umlauts/ß','monochrome distinct accessibility shapes','touch2x alpha','transparent credits window','sha256'],limitations=['Visual checks do not constitute in-game integration testing.','Postgame foregrounds do not replace state-specific city backgrounds.'],assets=out)
(ROOT/'docs/art/batch-oberflaeche3-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
# Contact sheet: composite title previews + every non-title PNG. Show all atlas cells.
previews=[]
for city,c in m['titleLayers'].items():
 im=Image.new('RGBA',(480,270))
 for layer in c['order']:im.alpha_composite(Image.open(SPR/layer['file']).convert('RGBA'))
 previews.append(('Titel '+city,im))
for a in m['assets']:
 if a['file'].startswith('ui/titel_k') and not ('warm' in a['file'] or 'flut' in a['file']):continue
 im=Image.open(SPR/a['file']).convert('RGBA')
 if a['file']=='ui/abspann_schluss.png':im=im.crop((0,0,480,270))
 previews.append((a['file'].split('/')[-1],im))
cw,ch=256,164;sheet=Image.new('RGB',(cw*4,ch*math.ceil(len(previews)/4)),(26,28,44));d=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(previews):
 im=ImageOps.contain(im,(240,135),Image.Resampling.NEAREST);x=(i%4)*cw+8;y=(i//4)*ch+5;sheet.paste(im,(x+(240-im.width)//2,y+(135-im.height)//2),im);d.text((x,y+139),name,fill=(222,214,188))
sheet.quantize(colors=32,dither=Image.Dither.NONE).save(ROOT/'docs/art/batch-oberflaeche3-preview.png',optimize=True)
print(json.dumps({'passed':not errors,'assets':len(out),'glyphs':len(chars),'errors':errors},ensure_ascii=False));sys.exit(bool(errors))
