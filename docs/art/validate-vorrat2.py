"""BK validation and contact sheets. Run: python docs/art/validate-vorrat2.py"""
from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib
ROOT=Path(__file__).resolve().parents[2];SPR=ROOT/'public/sprites';ART=ROOT/'docs/art'
m=json.loads((SPR/'manifest-vorrat2.json').read_text());chars=json.loads((ROOT/'tools/art/vorrat2/characters.json').read_text());ids=[c['id']for c in chars]
assert len(ids)==len(set(ids))==28
expected={}
for cid in ids:
 expected.update({f'characters/{cid}_walk.png':(64,128),f'characters/{cid}_extra.png':(64,32),f'portraits/{cid}_emotions.png':(256,64),f'portraits/AK_{cid}_emotions2.png':(256,64)})
expected.update({'portraits/BK_koepfe.png':(168,96),'battle/enemy_cw_wetherby.png':(384,512),'battle/enemy_bh_greavesend.png':(384,512)})
assert len(m['assets'])==len(expected)==115
assert len({a['id']for a in m['assets']})==115
assert {a['file']for a in m['assets']}==set(expected)
pal={tuple(bytes.fromhex(c[1:]))for c in m['palette']};assert len(pal)<=31
report=[];total=0
for a in m['assets']:
 path=SPR/a['file'];src=Image.open(path);assert src.mode=='P',(path,'not indexed')
 im=src.convert('RGBA');assert im.size==expected[a['file']]==(a['width'],a['height'])
 px=list(im.get_flattened_data());assert {p[3]for p in px}=={0,255},(path,'alpha')
 assert {p[:3]for p in px if p[3]}<=pal,(path,'palette')
 assert hashlib.sha256(path.read_bytes()).hexdigest()==a['sha256']
 fw,fh,cols,rows=(a[k]for k in ['frameWidth','frameHeight','columns','rows']);assert im.size==(fw*cols,fh*rows)
 frames=[im.crop((x*fw,y*fh,(x+1)*fw,(y+1)*fh))for y in range(rows)for x in range(cols)]
 counts=a.get('occupiedCounts',[cols]*rows)
 for i,f in enumerate(frames):
  box=f.getbbox()
  if i%cols>=counts[i//cols]:assert box is None;continue
  total+=1;assert box,(path,i,'empty')
  assert box[0]>=1 and box[1]>=1 and box[2]<=fw-1 and box[3]<=fh-1,(path,i,'edge bleed',box)
  if 'baseline'in a:assert box[3]-1==a['baseline'],(path,i,'baseline')
 for name,anim in a.get('animations',{}).items():
  assert anim['frameRate']>0 and anim['repeat']in[-1,0]
  assert all(0<=i<len(frames)and frames[i].getbbox()for i in anim['frames'])
 if a['kind']=='portraits':assert len({f.tobytes()for f in frames})==4,(path,'duplicate expression')
 if a['kind']=='walk':
  assert list(a['animations'])==['down','left','right','up']
  for row in range(4):assert len({f.tobytes()for f in frames[row*4:row*4+4]})>=3,(path,row,'walking cycle')
 if a['kind']=='extra':assert len({f.tobytes()for f in frames})>=3,(path,'action progression')
 if a['kind']=='battle':
  assert a['facing']=='left' and a['phases']==2
  for row in [1,5]:assert frames[row*6].tobytes()==frames[row*6+1].tobytes(),(path,'windup hold')
 if a['kind']=='heads':assert set(a['regions'])==set(ids)
 report.append(dict(file=a['file'],size=list(im.size),occupied=sum(counts),sha256=a['sha256']))
# Five compact contact sheets; labels are preview-only, not game sprites.
for group,subset in [('calderwick',ids[:10]),('briarholt',ids[10:20]),('reise',ids[20:])]:
 sheet=Image.new('RGB',(1120,160*len(subset)),(46,49,58));draw=ImageDraw.Draw(sheet)
 for i,cid in enumerate(subset):
  y=i*160;draw.text((8,y+6),cid,fill=(225,218,201))
  for j,file in enumerate([f'portraits/{cid}_emotions.png',f'portraits/AK_{cid}_emotions2.png']):
   im=Image.open(SPR/file).convert('RGBA');sheet.paste(im,(8,y+28+j*64),im)
  im=Image.open(SPR/f'characters/{cid}_walk.png').convert('RGBA');sheet.paste(im.resize((128,256),Image.Resampling.NEAREST).resize((64,128),Image.Resampling.NEAREST),(280,y+28),im)
  im=Image.open(SPR/f'characters/{cid}_extra.png').convert('RGBA').resize((256,128),Image.Resampling.NEAREST);sheet.paste(im,(368,y+28),im)
  # enlarged four facing frames
  walk=Image.open(SPR/f'characters/{cid}_walk.png').convert('RGBA')
  for r in range(4):
   im=walk.crop((0,r*32,16,(r+1)*32)).resize((64,128),Image.Resampling.NEAREST);sheet.paste(im,(656+r*100,y+28),im)
 sheet.save(ART/f'batch-vorrat2-preview-{group}.png')
heads=Image.open(SPR/'portraits/BK_koepfe.png').resize((672,384),Image.Resampling.NEAREST);heads.save(ART/'batch-vorrat2-preview-heads.png')
boss=Image.new('RGBA',(800,544),(46,49,58,255));draw=ImageDraw.Draw(boss)
for i,cid in enumerate(['cw_wetherby','bh_greavesend']):
 draw.text((i*400+8,8),cid,fill='white');boss.alpha_composite(Image.open(SPR/f'battle/enemy_{cid}.png').convert('RGBA'),(i*400+8,28))
boss.convert('RGB').save(ART/'batch-vorrat2-preview-bosses.png')
result=dict(batch='vorrat2',status='passed',assets=115,characters=28,occupiedFrames=total,paletteVisibleColors=len(pal),alpha='binary',checks=['expected files','indexed palette','dimensions','alpha','cell margins','baseline','animation indices','expression uniqueness','walk/action diversity','two-frame boss anticipation','sha256'],files=report)
(ART/'batch-vorrat2-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'BK OK: 28 figures, 115 sheets, {total} occupied frames; indexed palette <=31 visible colors, binary alpha, margins, baselines and animations validated.')
print('BK OK: 5 preview PNGs generated. Visual identity, expression and action review remains a separate human-visible check.')
