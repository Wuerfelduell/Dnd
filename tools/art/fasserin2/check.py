#!/usr/bin/env python3
"""CQ contract checks. Requires Pillow; run from any working directory."""
from pathlib import Path
from PIL import Image
import hashlib,json,sys
ROOT=Path(__file__).resolve().parents[3]; SPR=ROOT/'public/sprites'
ITEMS='rattenkrone sternhirschgeweih geweihreif geisterkern glasfeder wachsherz moorperle schlickperle brutschale moewenglas irrlichtfunke schaedelsplitter ratssiegel medaille_polizei fernrohr_messing bronzeglocke_klein spinnfaden_lila linsenscherbe madenwachs russklumpen'.split()
EXPECTED={
 'ui/CQ_auftrag.png':(80,16,16,16),'ui/CQ_auftrag_32.png':(160,32,32,32),
 'ui/CQ_chance.png':(80,16,16,16),'ui/CQ_zirkel_marke.png':(96,16,16,16),
 'ui/CQ_hud.png':(64,16,16,16),'ui/CQ_einladung.png':(96,48,96,48),
 'ui/CQ_rahmen_auftrag.png':(48,48,16,16),'characters/fasserin_posen.png':(96,160,16,32),
 'portraits/fasserin_emotions2.png':(256,64,64,64),'props/fasserin_werkbank_zustaende.png':(128,32,32,32),
 'props/fasserin_auftragsbrett.png':(32,48,32,48),'fx/CQ_fassung_erfolg.png':(256,32,32,32),
 'fx/CQ_fassung_misslungen.png':(256,32,32,32),'fx/CQ_wuerfel.png':(192,32,32,32)}
for item in ITEMS:
 for prefix,size in [('items',16),('items/32',32)]:EXPECTED[f'{prefix}/fa_{item}.png']=(size,size,size,size)
errors=[];results=[]
def check(ok,msg):
 if not ok:errors.append(msg)
def pixels(im):
 return im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata()
def frames(im,a):
 return [im.crop((x*a['frameWidth'],y*a['frameHeight'],(x+1)*a['frameWidth'],(y+1)*a['frameHeight'])) for y in range(a['rows']) for x in range(a['columns'])]
m=json.loads((SPR/'manifest-fasserin2.json').read_text());assets={a['file']:a for a in m['assets']};palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']}
check(set(assets)==set(EXPECTED),'Exact54file coverage');check(len(m['assets'])==54,'Duplicate or missing asset');check(m['palette']==json.loads((SPR/'manifest-fasserin.json').read_text())['palette'],'BO palette match')
images={}
for file,expected in EXPECTED.items():
 if file not in assets or not (SPR/file).exists():check(False,'Missing '+file);continue
 a=assets[file];im=Image.open(SPR/file).convert('RGBA');images[file]=im
 check(im.size==expected[:2],file+': dimensions');check((a['width'],a['height'],a['frameWidth'],a['frameHeight'])==expected,file+': manifest dimensions')
 check(a['columns']*a['frameWidth']==im.width and a['rows']*a['frameHeight']==im.height,file+': cell grid')
 colors={p[:3] for p in pixels(im) if p[3]};alpha=set(pixels(im.getchannel('A')));check(colors<=palette and len(colors)<=32,file+': palette');check(alpha<={0,255},file+': binary alpha');check(all(p[:3]==(0,0,0) for p in pixels(im) if not p[3]),file+': transparent RGB')
 check(alpha=={255} if file=='ui/CQ_einladung.png' else alpha=={0,255},file+': alpha contract')
 fs=frames(im,a)
 for i,f in enumerate(fs):check(bool(f.getbbox())==(i not in a.get('emptyFrames',[])),file+': occupancy '+str(i))
 for name,an in a['animations'].items():
  check(an['frames'] and all(type(i)==int and 0<=i<len(fs) for i in an['frames']),file+': animation '+name)
  check(an['frameRate']>0 and an['repeat'] in [-1,0],file+': timing')
  check(len({fs[i].tobytes() for i in an['frames']})>=2,file+': static animation '+name)
 for name,r in a['regions'].items():check(all(type(r[k])==int for k in ['x','y','width','height']) and r['x']>=0 and r['y']>=0 and r['width']>0 and r['height']>0 and r['x']+r['width']<=im.width and r['y']+r['height']<=im.height,file+': region '+name)
 if file.startswith('items/'):
  item=Path(file).stem[3:];check((SPR/'items'/f'{item}.png').exists(),file+': raw reference')
  if item not in ['geisterkern','irrlichtfunke','spinnfaden_lila','brutschale']:check((111,224,208) not in colors,file+': restricted turquoise')
 results.append(dict(file=file,width=im.width,height=im.height,colors=len(colors),alpha=sorted(alpha),frames=len(fs),sha256=hashlib.sha256((SPR/file).read_bytes()).hexdigest()))
for item in ITEMS:
 small=images.get(f'items/fa_{item}.png');big=images.get(f'items/32/fa_{item}.png')
 if small and big:check(small.tobytes()==big.resize((16,16),Image.Resampling.NEAREST).tobytes(),item+': paired sizes')
states=['bestellt','in_arbeit','fertig','misslungen','abgeholt']
for file in ['ui/CQ_auftrag.png','ui/CQ_auftrag_32.png']:check(list(assets[file]['regions'])==states,'State order '+file)
check(list(assets['ui/CQ_zirkel_marke.png']['regions'])==['waage','kreide','russ','lichtlose','salz','schichtbund'],'Circle order')
check(list(assets['portraits/fasserin_emotions2.png']['regions'])==['zufrieden','bedauernd','pruefend','muede'],'Portrait order')
check(len(assets['props/fasserin_auftragsbrett.png']['regions'])==4,'Board hooks')
chance=images['ui/CQ_chance.png']
for i,k in enumerate(range(4,9)):
 fill=sum(chance.getpixel((x+i*16,y))[:3]==(224,201,161) for y in range(3,13) for x in range(4,12));check(fill==8*k,'Exact chance fill '+str(k*10))
p=assets['characters/fasserin_posen.png'];fs=frames(images[p['file']],p)
for i,name in enumerate(['pruefen','haemmern','uebergabe','kopfschuetteln','abwesend']):
 check(p['animations'][name]['frames']==list(range(i*6,i*6+6)),'Pose row '+name)
 for j in range(i*6,i*6+6):check(fs[j].getbbox()[3]==31,'Baseline frame '+str(j))
w=assets['fx/CQ_wuerfel.png'];check(w['animations']['erfolg']['frames']==[0,1,2,3,4] and w['animations']['misslungen']['frames']==[0,1,2,3,5],'Exclusive die outcomes')
g=json.loads((ROOT/'docs/art/batch-fasserin2-generation.json').read_text());check(len(g['generations'])==37,'37 recorded generations');check(all(r['prompt'].startswith('STYLE GUIDE (apply to every asset):') for r in g['generations']),'Full style prompt prefix')
report=dict(batch='fasserin2',passed=not errors,assetCount=len(results),frameCount=sum(r['frames'] for r in results),paletteColors=len(palette),checks=['exact file set and dimensions','32-color shared palette','binary alpha and zero transparent RGB','integer frame grid and occupancy','animation indices, timing and variation','regions and fixed state ordering','baseline30','paired icon sizes','restricted occult accent','exact40-80percent fill','exclusive die outcomes','prompt provenance'],visualReview='Contact sheet inspected separately; semantic art quality is not proven by pixel checks.',errors=errors,assets=results)
(ROOT/'docs/art/batch-fasserin2-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(f"CQ fasserin2: {'PASS' if not errors else 'FAIL'} | {len(results)}/54 PNG | {report['frameCount']} frames | palette <=32 | errors={len(errors)}")
for e in errors:print('ERROR:',e)
sys.exit(bool(errors))
