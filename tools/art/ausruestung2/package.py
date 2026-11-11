"""Build BU manifest, provenance and review sheets from completed exports."""
from pathlib import Path
import json,hashlib,math
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).resolve().parent
plan=json.loads((HERE/'jobs.json').read_text());assets=[];prompts=[]
for j in plan['jobs']:
 a={k:v for k,v in j.items() if k not in ['prompt']}
 if 'frameWidth' not in a:a.update(frameWidth=a['width'],frameHeight=a['height'],columns=1,rows=1)
 if a['file'].startswith('characters/gear/'):
  a['animations']={d:dict(frames=list(range(n*4,n*4+4)),frameRate=8,repeat=-1) for n,d in enumerate(['down','left','right','up'])}
  a['regions']={d:dict(x=0,y=n*32,width=64,height=32) for n,d in enumerate(['down','left','right','up'])}
  a['origin']=[.5,31/32];a['referenceFrameSize']=[16,32]
 elif j['id']=='koop2_rahmen':
  a['regions']={name:dict(x=x,y=0,width=48,height=48,nineSlice=dict(left=8,right=8,top=8,bottom=8)) for name,x in [('player1',0),('player2',48)]}
 elif j['id']=='koop2_symbole':
  a['regions']={f'p{p+1}_{state}':dict(x=c*16,y=p*16,width=16,height=16) for p in range(2) for c,state in enumerate(['am_zug','wartet','gebunden','anspruch_offen','trinkt','liest','im_kampf','zurueckgelassen','gibt_weiter','trennung','wiedersehen','geplauder'])}
 elif 'emotions' in j['id']:
  a['regions']={name:dict(x=i*64,y=0,width=64,height=64) for i,name in enumerate(['neutral','misstrauisch','erschrocken','laecheln'])}
 else:a['regions']={'full':dict(x=0,y=0,width=a['width'],height=a['height'])}
 a['sourceRevision']=(HERE/'source-revision.txt').read_text().strip()
 if a.get('reference'):a['referenceSha256']=hashlib.sha256((ROOT/'public/sprites'/a['reference']).read_bytes()).hexdigest()
 if a.get('slot')=='weapon':a['rearOcclusion']='baked against reference alpha; only exposed tip pixels survive'
 assets.append(a)
 prompts.append({'id':j['id'],'file':j['file'],'prompt':j['prompt'],'reference':j.get('reference'),'transparent_background':j['transparent'],'postprocess':'Nearest-neighbor to exact target; per-frame garment bounding boxes registered to original head/torso/right-wrist anchors, shared 32-color palette, threshold alpha at128, zero transparent RGB; amulets extract exactly two adjacent source highlight pixels at the neckline; corruption preserves thin source-alpha coverage and violet source glints, then quantizes to three thread colors.'})
m={'version':1,'batch':'ausruestung2','status':'exported; runtime integration pending','paletteMaxVisibleColors':32,'sourceItemSlots':{'hat':'hut','coat':'mantel','amulet':'amulett'},'assets':assets}
(ROOT/'public/sprites/manifest-ausruestung2.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/art/batch-ausruestung2-generation.json').write_text(json.dumps({'batch':'ausruestung2','generator':'built-in image generation','assets':prompts},ensure_ascii=False,indent=2)+'\n')
# Contact sheet: native exports and composited walking phases; labels only in documentation.
thumbs=[]
for a in assets:
 path=ROOT/'public/sprites'/a['file']
 if not path.exists():continue
 im=Image.open(path).convert('RGBA')
 if a.get('figure'):
  ref=Image.open(ROOT/'public/sprites'/a['reference']).convert('RGBA')
  pair=Image.new('RGBA',(144,128));pair.alpha_composite(im,(0,0));pair.alpha_composite(Image.alpha_composite(ref,im),(80,0));im=pair
 im.thumbnail((192,128),Image.Resampling.NEAREST)
 tile=Image.new('RGB',(210,158),(43,46,52));tile.paste(im,((210-im.width)//2,0),im)
 ImageDraw.Draw(tile).text((4,132),a['id'][:32],fill=(219,211,182));thumbs.append(tile)
 sheet=Image.new('RGB',(210*6,158*math.ceil(len(thumbs)/6)),(43,46,52))
for i,tile in enumerate(thumbs):sheet.paste(tile,(i%6*210,i//6*158))
sheet.quantize(colors=64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).save(ROOT/'docs/art/preview-ausruestung2.png',optimize=True)
print('Packaged',len(assets),'definitions;',len(thumbs),'rendered assets')
