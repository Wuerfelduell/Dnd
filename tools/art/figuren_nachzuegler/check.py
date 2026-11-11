#!/usr/bin/env python3
"""Validate the exact CS deliverable. Pillow and Python standard library only."""
import hashlib,json,re
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites';errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
def pixels(im):return im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata()
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 m=json.loads((SPR/'manifest-figuren_nachzuegler.json').read_text());gen=json.loads((ROOT/'docs/art/batch-figuren_nachzuegler-generation.json').read_text())
 required={};walks=['wx_pfandleiherin','k2a_senn','k2a_veit','k2a_noll']
 for pack,prefix in [('k4_nebenquests','cwn_e_'),('k5_nebenquests','bhn_e_')]:
  walks.extend(k for k in json.loads((ROOT/f'src/data/packs/{pack}/npcs.json').read_text()) if k.startswith(prefix))
 walks.append('cwo_marktstand');check(len(walks)==21,'21 source figures')
 for n in walks:
  required['characters/'+n+('_walk' if n in walks[:4] else '')+'.png']=('walk',(64,128))
  if n!='cwo_marktstand':required['portraits/heads/'+n+'.png']=('head',(24,24))
 for n in walks[:4]:required['portraits/'+n+'_emotions.png']=('emotions',(256,64))
 for n in walks[1:4]:required['battle/enemy_'+n+'.png']=('battle',(384,320))
 for n in ['wx_pfandtisch','cwo_marktstand_tisch']:required['props/'+n+'.png']=('prop',(48,32))
 check(len(required)==50,'50 required PNGs');check(len(m['assets'])==50,'50 manifest assets')
 check({x['file']for x in m['assets']}==set(required),'Exact filenames')
 palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']};check(len(palette)<=32,'Shared palette <=32');union=set();ids=set();totalframes=0;report=[];allhashes=set()
 for a in m['assets']:
  f=SPR/a['file'];check(a['id']not in ids,'duplicate ID '+a['id']);ids.add(a['id']);check(re.fullmatch('[a-z0-9_]+',a['id'])is not None,'ID syntax')
  if not f.exists():errors.append('Missing '+a['file']);continue
  original=Image.open(f);im=original.convert('RGBA');check(original.mode=='P','Indexed PNG '+a['file']);check(im.size==required[a['file']][1],'Dimensions '+a['file']);check(a['kind']==required[a['file']][0],'Kind '+a['file'])
  colors={p[:3] for p in pixels(im) if p[3]};union|=colors;check(len(colors)<=32 and colors<=palette,'Palette '+a['file']);check(set(pixels(im.getchannel('A')))=={0,255},'Binary alpha '+a['file']);check(all(p==(0,0,0,0)for p in pixels(im) if p[3]==0),'Transparent matte '+a['file'])
  digest=h(f);check(digest not in allhashes,'Duplicate whole image '+a['file']);allhashes.add(digest)
  fw=a.get('frameWidth',im.width);fh=a.get('frameHeight',im.height);cols=a.get('columns',1);rows=a.get('rows',1);check(im.width==fw*cols and im.height==fh*rows,'Grid '+a['file']);cells=[im.crop((x*fw,y*fh,(x+1)*fw,(y+1)*fh))for y in range(rows)for x in range(cols)];totalframes+=len(cells)
  for i,c in enumerate(cells):
   b=c.getbbox();check(b is not None,'Empty cell '+a['file']+':'+str(i))
   if b:check(b[0]>=1 and b[2]<=fw-1 and b[1]>=1 and b[3]<=fh-1,'Cell gutter '+a['file']+':'+str(i))
   if a['kind']=='walk' and b:check(b[3]==31,'Baseline y=30 '+a['file']+':'+str(i))
  if a['kind']=='walk':
   expected={n:list(range(i*4,i*4+4))for i,n in enumerate(['down','left','right','up'])};check({k:v['frames']for k,v in a['animations'].items()}==expected,'Direction order '+a['file'])
   for y in range(4):check(len({c.tobytes()for c in cells[y*4:y*4+4]})>=3,'At least 3 different walk poses '+a['file']+' row '+str(y))
   coat=tuple(bytes.fromhex(a['coatAnchor'][1:]));check(coat in colors,'Main coat anchor absent '+a['file'])
  if a['kind']=='emotions':check(len({c.tobytes()for c in cells})==4,'Four emotions '+a['file']);check(list(a['animations'])==['neutral','freundlich','misstrauisch','erschrocken'],'Emotion order '+a['file'])
  if a['kind']=='battle':
   check(cells[6].tobytes()==cells[7].tobytes()and cells[12].tobytes()==cells[13].tobytes(),'Two held windup frames '+a['file'])
   check(cells[8].tobytes()!=cells[6].tobytes()and cells[14].tobytes()!=cells[12].tobytes(),'Attack releases '+a['file'])
   for y in range(5):check(len({c.tobytes()for c in cells[y*6:y*6+6]})>=3,'Distinct battle poses '+a['file']+' row '+str(y))
  for name,an in a.get('animations',{}).items():check(an['frameRate']>0 and an['frames'] and all(isinstance(i,int)and 0<=i<len(cells)for i in an['frames']),'Animation bounds '+a['file']+'/'+name)
  report.append({'file':a['file'],'size':list(im.size),'visible_colors':len(colors),'frames':len(cells),'sha256':digest})
 check(len(union)<=32,'Global union <=32');check(len(gen['sources'])==30,'30 generator jobs')
 for s in gen['sources']:
  check(s['tool']=='built_in_image_gen' and len(s['prompt'])>500,'Prompt provenance '+s['asset']);check(h(SPR/s['output'])==s['output_sha256'],'Output hash '+s['asset'])
 check((ROOT/'docs/art/batch-figuren_nachzuegler-preview.png').exists(),'Preview')
 check((ROOT/'docs/art/figuren_nachzuegler-uebergabe.md').exists(),'Integration handoff')
 result={'batch':'figuren_nachzuegler','ok':not errors,'png_count':len(required),'figures':21,'walk_sheets':21,'heads':20,'portrait_strips':4,'battle_sheets':3,'props':2,'frames':totalframes,'shared_visible_colors':len(union),'checks':['exact files','indexed palette','binary alpha','transparent matte','frame grid and gutters','feet baseline','walk pose variation','battle windup holds','emotion variation','animation bounds','prompt/output hashes'],'visual_review':'See handoff; anatomical and directional review is separate from structural checks.','assets':report,'errors':errors}
 (ROOT/'docs/art/batch-figuren_nachzuegler-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 for e in errors:print('FAIL:',e)
 print(('PASS'if not errors else'FAIL')+f': 50 PNG; 21 Figuren; 21 Lauf-Sheets, 20 Köpfe, 4 Portraitstreifen, 3 Kampf-Sheets, 2 Props; {totalframes} nichtleere Zellen; {len(union)} gemeinsame Farben.')
 raise SystemExit(1 if errors else 0)
if __name__=='__main__':main()
