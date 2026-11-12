#!/usr/bin/env python3
"""Independent DC contract checks. Requires Pillow. Writes validation and preview."""
import json,hashlib,math,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites'
m=json.loads((SPR/'manifest-seq31.json').read_text());palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']}
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr'];expected={};errors=[];results=[];assets={}
def expect(f,w,h):expected[f]=(w,h)
def ck(ok,msg):
 if not ok:errors.append(msg)
def pixels(im):return im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata()
for p in ['A_player','p2a','p2b']:
 for s in [3,1]:expect(f'characters/{p}_drink_seq{s}.png',128,32)
for s in [3,1]:expect(f'fx/HG_aufstieg_{s}.png',1920,135)
for p in paths:
 expect(f'battle/bg_vm_register_{p}.png',480,270)
 expect(f'characters/hg_form_{p}_still.png',128,192)
 expect(f'battle/hg_form_{p}_still.png',576,384)
 for s,n in [(3,6),(1,4)]:
  expect(f'fx/aura_seq{s}_{p}.png',64*n,64);expect(f'ui/hg_seq{s}_{p}.png',240,135)
 expect(f'sequences/abspann_{p}.png',240,135)
expect('tilesets/vm_register.png',256,256);expect('props/vm_register_props.png',256,128);expect('ui/hg_hud_seq31.png',64,32);expect('sequences/abspann_verzicht.png',240,135)
ck(len(m['assets'])==92,'exactly92 assets')
ids=[]
for a in m['assets']:
 f=a['file'];ids.append(a['id']);ck(f not in assets,'duplicate file '+f);assets[f]=a;p=SPR/f
 if not p.exists():errors.append('missing '+f);continue
 im=Image.open(p).convert('RGBA');ps=list(pixels(im));colors={p[:3] for p in ps if p[3]};alpha={p[3] for p in ps}
 ck(im.size==expected.get(f),'contract dimensions '+f);ck(im.size==(a['width'],a['height']),'manifest dimensions '+f)
 ck(colors<=palette and len(colors)<=32,'shared palette '+f);ck(alpha<={0,255},'binary alpha '+f)
 ck(alpha=={0,255} if a['transparent'] else alpha=={255},'opacity '+f)
 ck(a['columns']*a['frameWidth']==im.width and a['rows']*a['frameHeight']==im.height,'frame grid '+f)
 ck(hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],'content hash '+f)
 fw,fh=a['frameWidth'],a['frameHeight'];frames=[im.crop((x*fw,y*fh,(x+1)*fw,(y+1)*fh)) for y in range(a['rows']) for x in range(a['columns'])]
 for i,frame in enumerate(frames):
  b=frame.getchannel('A').getbbox()
  if i in a.get('emptyFrames',[]):ck(b is None,'empty cell '+f+' '+str(i))
  else:
   ck(b is not None,'occupied cell '+f+' '+str(i))
   if b and 'baseline' in a:ck(b[3]==a['baseline']+1,'baseline '+f+' '+str(i))
 for name,anim in a['animations'].items():
  ck(anim['frames'] and anim['frameRate']>0,'animation timing '+f)
  ck(all(type(i)==int and 0<=i<len(frames) and i not in a.get('emptyFrames',[]) for i in anim['frames']),'animation references '+f+' '+name)
  if a['kind'] in ['drink','cinematic','aura']:ck(len({frames[i].tobytes() for i in anim['frames']})>=2,'animation varies '+f)
 if a['kind']=='walk':
  ck(a['animations']=={n:{'frames':[r*4,r*4+1],'frameRate':2,'repeat':-1} for r,n in enumerate(['down','left','right','up'])},'eight walk frames '+f)
 if a['kind']=='battle':
  ck(set(a['animations'])=={'idle','special','hurt','defeated'},'four nonviolent rows '+f)
  ck(frames[8].tobytes()==frames[9].tobytes(),'two ordinary-human holds '+f)
  for i in range(6):
   for k in [12,18]:ck(frames[k+i].getchannel('A').getbbox()[3]-frames[k+i].getchannel('A').getbbox()[1]<=frames[i].getchannel('A').getbbox()[3]-frames[i].getchannel('A').getbbox()[1],'reduced posture '+f)
 for name,r in a['regions'].items():ck(0<=r['x']<r['x']+r['width']<=im.width and 0<=r['y']<r['y']+r['height']<=im.height,'region bounds '+f+' '+name)
 results.append(dict(file=f,size=list(im.size),visibleColors=len(colors),alpha=sorted(alpha),cells=len(frames),emptyCells=len(a.get('emptyFrames',[])),sha256=a['sha256']))
ck(set(assets)==set(expected),'exact required file set');ck(len(ids)==len(set(ids)),'unique asset IDs')
reg=json.loads((ROOT/'docs/story/seq31/register_seq1.json').read_text());ck(set(m['pathRegisters'])==set(paths),'ten canonical paths')
for r in reg:
 p=r['pfad'];binding=m['pathRegisters'][p]
 ck(binding['map']==r['map'] and binding['seq1Name']==r['seq_name'],'DD identity '+p)
 ck(binding['background'] in assets and binding['epilogue']==r['abspann']['bild'] and binding['epilogue'] in assets,'DD images '+p)
 ck(len(binding['props'])==4 and all(k in assets['props/vm_register_props.png']['regions'] for k in binding['props']),'four props '+p)
report=dict(batch='seq31',passed=not errors,assetCount=len(results),errors=errors,checks=['independent92-file contract','exact dimensions','shared32-color palette','binary alpha and opacity','integer frame grid','occupied and empty cells','animation ranges and timing','sprite baselines','ordinary human two-frame hold','reduced hurt and defeated postures','regions','ten DD path/map/name/epilogue references','four props per path','SHA256'],limitations=['Visual art review is separate from structural validation.','No runtime integration or in-game tests in this graphics package.','Sheet dimensions take precedence over contradictory walk-frame arithmetic: two active and two empty cells per row.'],assets=results)
(ROOT/'docs/art/batch-seq31-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
# Contact sheet with all92 files; animated strips repacked for readable overview.
cw,ch=250,180;out=Image.new('RGB',(cw*4,ch*math.ceil(len(m['assets'])/4)),(26,28,44));d=ImageDraw.Draw(out)
for i,a in enumerate(m['assets']):
 im=Image.open(SPR/a['file']).convert('RGBA')
 if a['columns']>2 and a['rows']==1 and a['kind'] in ['cinematic','aura','drink']:
  fw,fh=a['frameWidth'],a['frameHeight'];cols=4 if a['columns']==8 else 3 if a['columns']==6 else 2;rows=math.ceil(a['columns']/cols);pack=Image.new('RGBA',(fw*cols,fh*rows))
  for n in range(a['columns']):pack.paste(im.crop((n*fw,0,(n+1)*fw,fh)),((n%cols)*fw,(n//cols)*fh))
  im=pack
 im=ImageOps.contain(im,(240,150),Image.Resampling.NEAREST);x=i%4*cw;y=i//4*ch;out.paste(im,(x+(cw-im.width)//2,y+(150-im.height)//2),im);d.text((x+3,y+152),a['file'].split('/')[0]+'/'+Path(a['file']).stem,fill=(238,226,197))
out.quantize(colors=32,dither=Image.Dither.NONE).save(ROOT/'docs/art/batch-seq31-preview.png',optimize=True)
print(json.dumps({'passed':not errors,'assets':len(results),'errors':errors}));sys.exit(bool(errors))
