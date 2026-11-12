"""Export ImageGen sources: nearest-neighbor, fixed palette, binary alpha.
Usage: python tools/art/seq4rit1/export.py /path/to/source-receipts.json
The source receipts contain source paths, prompts and source grid dimensions.
"""
import json,re,sys,hashlib,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np
ROOT=Path(__file__).resolve().parents[3]
SOURCES=json.loads(Path(sys.argv[1]).read_text())
PAL=json.loads((ROOT/'public/sprites/manifest-dunscar3.json').read_text())['palette']
RGB=[tuple(bytes.fromhex(c[1:])) for c in PAL]
P=Image.new('P',(1,1)); P.putpalette(sum(([ *c] for c in RGB),[])+list(RGB[0])*224)
assets=[]; receipts=[]
for s in SOURCES:
 im=Image.open(s['source']).convert('RGBA')
 if s['file']=='characters/s4r_waechter_welt.png':im=im.crop((120,0,1320,im.height))
 sw=im.width/s['sourceCols']; sh=im.height/s['sourceRows']
 frames=[]; boxes=[]
 for i in range(s['sourceCols']*s['sourceRows']):
  x=i%s['sourceCols'];y=i//s['sourceCols']
  f=im.crop((round(x*sw),round(y*sh),round((x+1)*sw),round((y+1)*sh)))
  a=f.getchannel('A').point(lambda v:255 if v>=220 else 0); f.putalpha(a)
  frames.append(f); boxes.append(a.getbbox())
 if s['file']=='ui/s4la_halten.png':
  frames=[frames[i] for i in [0,1,2,3,4,5,6,8,9]];boxes=[f.getchannel('A').getbbox() for f in frames]
 w,h=s['w'],s['h'];cols=s.get('cols',s['n']);rows=s.get('rows',1);counts=s.get('counts',[cols]*rows)
 out=Image.new('RGBA',(w*cols,h*rows)); valid=[b for i,b in enumerate(boxes[:s['n']]) if b and (not s.get('cols') or i%cols<counts[i//cols])]
 union=(min(b[0] for b in valid),min(b[1] for b in valid),max(b[2] for b in valid),max(b[3] for b in valid)) if valid else (0,0,sw,sh)
 if s.get('opaque') or s.get('edge'):union=(0,0,round(sw),round(sh))
 elif s.get('full'): pass
 scale=min((w-2)/max(b[2]-b[0] for b in valid),(s.get('baseline',h)-2)/max(b[3]-b[1] for b in valid))
 for i in range(s['n']):
  c=i%cols;r=i//cols
  if c>=counts[r]:continue
  f=frames[i]
  if s.get('opaque') or s.get('edge'):
   f=f.resize((w,h),Image.Resampling.NEAREST)
  elif s.get('mixed'):
   # Explicit 16/32 atlas regions, separately resample the generated pair.
   f=Image.new('RGBA',(48,32)); src=frames[0]
   for box,size,xy in [((0,0,src.width//3,src.height),16,(0,0)),((src.width//3,0,src.width,src.height),32,(16,0))]:
    icon=src.crop(box);b=icon.getchannel('A').getbbox();icon=icon.crop(b).resize((size,size),Image.Resampling.NEAREST);f.paste(icon,xy)
  elif s.get('full'):
   f=f.crop(union).resize((w,h),Image.Resampling.NEAREST)
  else:
   b=f.getchannel('A').getbbox() or (0,0,1,1)
   f=f.crop(b).resize((max(1,round((b[2]-b[0])*scale)),max(1,round((b[3]-b[1])*scale))),Image.Resampling.NEAREST)
   cell=Image.new('RGBA',(w,h));y=(h-f.height)//2
   if s.get('baseline'):
    b=f.getchannel('A').getbbox();y=s['baseline']-(b[3] if b else f.height)
   cell.paste(f,((w-f.width)//2,y));f=cell
  arr=np.array(f)
  if s.get('opaque'):arr[:,:,3]=255
  if s.get('edge'):arr[54:216,96:384,3]=0
  if s['file'] in ['fx/s4la_lichtkreis.png','fx/s4la_spielerlicht.png']:
   yy,xx=np.indices((h,w)); mask=((xx-(w-1)/2)**2+(yy-(h-1)/2)**2)<((min(w,h)-4)/2)**2
   arr[:,:,3]=np.where(mask & ((xx+yy)%2==0) & (arr[:,:,3]>0),255,0)
  if s['file']=='fx/s4ei_waechter_unsterblich.png':
   yy,xx=np.indices((h,w));arr[:,:,3]=np.where((xx+yy)%2==0,arr[:,:,3],0)
  f=Image.fromarray(arr);out.paste(f,(c*w,r*h))
 for r in s.get('heldRows',[]):out.paste(out.crop((0,r*h,w,(r+1)*h)),(w,r*h))
 a=out.getchannel('A');q=out.convert('RGB').quantize(palette=P,dither=Image.Dither.NONE)
 # 32 visible palette entries plus one transparent index.
 ix=np.array(q);ix[np.array(a)==0]=32;q=Image.fromarray(ix,'P');q.putpalette(sum(([ *c] for c in RGB),[])+list(RGB[0])*224);q.info['transparency']=32
 target=ROOT/'public/sprites'/s['file'];target.parent.mkdir(parents=True,exist_ok=True);q.save(target,optimize=True)
 names=s.get('names',['play']);animations={}
 if s.get('names'):
  for r,name in enumerate(names):animations[name]={'frames':list(range(r*cols,r*cols+counts[r])),'frameRate':6 if name in ['idle','down','left','right','up','voll','halb','schwach'] else 10,'repeat':-1 if name in ['idle','down','left','right','up','voll','halb','schwach'] else 0}
 else:animations['play']={'frames':list(range(s['n'])),'frameRate':8,'repeat':-1 if any(k in s['file'] for k in ['lichtkreis','spielerlicht','mark_welt','traumschleier','ueberlast','unsterblich','taub_rand']) else 0}
 asset={'id':Path(s['file']).stem+('_battle' if s['file'].startswith('battle/s4ma_') else '_walk' if s['file'].startswith('characters/s4ma_') else ''),'file':s['file'],'width':w*cols,'height':h*rows,'frameWidth':w,'frameHeight':h,'columns':cols,'rows':rows,'transparent':not s.get('opaque',False),'occupiedCounts':counts,'animations':animations,'description':s['desc']}
 for key in ['baseline','heldRows']: 
  if key in s:asset[key]=s[key]
 if s.get('edge'):asset['transparentCenter']=[96,54,288,162]
 if s.get('slice'):asset['nineSlice']={'left':16,'right':16,'top':16,'bottom':16}
 if s.get('mixed'):asset['regions']={'small':{'x':0,'y':0,'width':16,'height':16},'large':{'x':16,'y':0,'width':32,'height':32}}
 if s.get('ref'):asset['reference']=s['ref']
 if s['file'].startswith('battle/s4ma_'):
  for name,rate in {'idle':6,'attack':10,'shoot':10,'dodge':12,'parry':10,'item':8,'hurt':10,'defeated':8,'occult':10}.items():asset['animations'][name]['frameRate']=rate
  asset['facing']='right';asset['occultMeaning']='Mundane failed ability gesture; no usable ability in the mask ritual.'
 states={'s4la_hud':['voll','halb','schwach','erloschen'],'s4fa_hud':['offen']*5+['markiert']*5,'s4ke_hud':['leer']*5+['getrunken']*5,'s4ei_hud':['offen']*5+['geschlagen']*5,'s4uh_hud':['heil']*3+['gebrochen']*3,'s4uh_hat_angegriffen':['offen','bestaetigt']}
 if asset['id'] in states:
  asset['regions']={f'{name}_{i}':{'x':i*w,'y':0,'width':w,'height':h} for i,name in enumerate(states[asset['id']])}
  asset['animations']={f'{name}_{i}':{'frames':[i],'frameRate':1,'repeat':0} for i,name in enumerate(states[asset['id']])}
 if asset['id']=='s4la_halten':asset['animations']={'fortschritt':{'frames':list(range(8)),'frameRate':8,'repeat':0},'unterbrochen':{'frames':[8],'frameRate':1,'repeat':0}}
 if asset['id']=='s4ke_trinken_reihe':asset['animations']={name:{'frames':[i],'frameRate':1,'repeat':0} for i,name in enumerate(['tuerkis','gruen','amber','eisblau','rost'])}
 if asset['id'].endswith('_hud_rahmen'):
  count=6 if asset['id'].startswith('s4la_') else 5
  asset['regions']={f'slot_{i}':{'x':(i*16 if count==6 else 8+i*16),'y':2,'width':16,'height':16} for i in range(count)}
 assets.append(asset)
 receipts.append({'file':s['file'],'prompt':s['prompt'],'sourceSha256':hashlib.sha256(Path(s['source']).read_bytes()).hexdigest(),'sourceGrid':[s['sourceCols'],s['sourceRows']],'sourceSize':list(im.size),'outputSha256':hashlib.sha256(target.read_bytes()).hexdigest()})
manifest={'version':1,'batch':'seq4rit1','status':'exported; runtime integration pending','paletteMaxVisibleColors':32,'palette':PAL,'assets':assets,'rituals':{k:[a['id'] for a in assets if a['id'].startswith(p)] for k,p in [('laterne','s4la_'),('faden','s4fa_'),('maske','s4ma_'),('echo','s4ec_'),('kessel','s4ke_'),('eisen','s4ei_'),('sq_uhr','s4uh_'),('shared','s4r_')]}}
# Background has bg_ prefix.
manifest['rituals']['faden'] += [a['id'] for a in assets if a['id']=='bg_s4fa_traum']
(ROOT/'public/sprites/manifest-seq4rit1.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/art/batch-seq4rit1-generation.json').write_text(json.dumps({'tool':'image_gen.imagegen','postprocessing':'Nearest neighbor; alpha threshold 220; shared dunscar3 palette; transparent unused cells; declared checker dithering and clear overlay center; held melee windup frames; 16/32 ear regions; guardian source horizontal crop [120,1320] to match generated grid.','assets':receipts},ensure_ascii=False,indent=2)+'\n')
# A readable contact sheet of all exported assets at native or integer scale.
W=1200;cw=300;ch=150;preview=Image.new('RGB',(W,math.ceil(len(assets)/4)*ch),(37,45,56));d=ImageDraw.Draw(preview)
for i,a in enumerate(assets):
 x=i%4*cw;y=i//4*ch; d.text((x+6,y+5),a['id'],fill=(231,223,197))
 img=Image.open(ROOT/'public/sprites'/a['file']).convert('RGBA'); fw=a['frameWidth'];fh=a['frameHeight']
 n=min(a['columns'],4);img=img.crop((0,0,fw*n,fh))
 if img.width>288 or img.height>112:img.thumbnail((288,112),Image.Resampling.NEAREST)
 elif img.height<=48 and img.width<=144:img=img.resize((img.width*2,img.height*2),Image.Resampling.NEAREST)
 preview.paste(img,(x+6,y+28),img)
preview.save(ROOT/'docs/art/batch-seq4rit1-preview.png')
print(f'Exported {len(assets)} assets')
