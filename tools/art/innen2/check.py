"""Pillow-only technical acceptance checks; run from any working directory."""
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
P=ROOT/'public/sprites'
m=json.loads((P/'manifest-innen2.json').read_text())
assert m['batch']=='innen2'
expected={'innen2_anim'}|{'innen2_moebel_'+x for x in ['buero','revier','laden','akademie','speisewagen','lohnbuero']}|{'lese_'+x for x in ['brief','kassenbuch','zeitung','wandanschlag','kalkbrett','telegramm','sternkarte','lohnzettel','kinderzeichnung','tagebuch']}
assert {a['id'] for a in m['assets']}==expected
palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']};assert len(palette)<=32
allcolors=set();frames=0;walls=0
for a in m['assets']:
 f=P/a['file'];im=Image.open(f);assert im.mode=='P',(f,'not indexed');im=im.convert('RGBA')
 assert im.size==(a['width'],a['height']),f
 px=list(im.getdata());colors={p[:3] for p in px if p[3]};alpha={p[3] for p in px}
 assert len(colors)<=32 and colors<=palette,(f,'palette');allcolors|=colors
 assert alpha<={0,255},(f,'nonbinary alpha')
 assert not ({(255,255,255),(0,0,0)}&colors),(f,'white/black fringe')
 if not a['transparent']:assert alpha=={255} and im.size==(240,135)
 else:assert 0 in alpha and im.width%16==im.height%16==0
 fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows']
 assert im.size==(fw*cols,fh*rows),(f,'grid mismatch')
 for name,r in a['regions'].items():
  assert all(isinstance(r[k],int) for k in ['x','y','width','height'])
  assert 0<=r['x']<im.width and 0<=r['y']<im.height
  assert r['x']+r['width']<=im.width and r['y']+r['height']<=im.height
  if a['transparent']:assert all(r[k]%16==0 for k in ['x','y','width','height']),(f,name,'off tile grid')
 if a['id']=='innen2_anim':
  assert len(a['animations'])==19 and rows==19 and cols==4
  for name,an in a['animations'].items():
   assert len(an['frames'])==4 and an['frameRate']>0 and an['repeat']==-1
   variants=[]
   for idx in an['frames']:
    assert 0<=idx<cols*rows
    t=im.crop((idx%cols*fw,idx//cols*fh,(idx%cols+1)*fw,(idx//cols+1)*fh));b=t.getbbox()
    assert b and b[0]>=1 and b[1]>=1 and b[2]<=31 and b[3]<=30,(name,'frame clipped')
    variants.append(t.tobytes());frames+=1
   assert len(set(variants))>=2,(name,'static animation')
 elif a['id'].startswith('innen2_moebel'):
  assert im.size==(128,64) and cols*rows==32
  for j in range(32):assert im.crop((j%8*16,j//8*16,j%8*16+16,j//8*16+16)).getbbox(),(f,j,'empty tile')
  for n in ['tapete','taefelung','kalk','blech']:
   r=a['regions'][n];t=im.crop((r['x'],r['y'],r['x']+16,r['y']+16));assert t.getchannel('A').getextrema()==(255,255);walls+=1
assert len(allcolors)<=32
log=json.loads((ROOT/'docs/art/batch-innen2-generation.json').read_text());assert len(log['jobs'])==17
assert all(j['prompt'].startswith('STYLE GUIDE') and len(j['sourceSha256'])==64 for j in log['jobs'])
assert (ROOT/'docs/art/preview-innen2.png').exists()
print(f'PASS: 17 indexed PNGs; {len(allcolors)} shared visible colours; binary alpha; 10 opaque 240x135 scenes.')
print(f'PASS: {frames} animation frames / 19 variants; 6 x 32 furniture cells; {walls} opaque wall tiles.')
print('PASS: frame/region bounds, 16px tile grid (reading scenes exempt), empty cells, animation variation, prompt provenance.')
print('Visual review still required for subject identity, readability, motion quality and absence of readable lettering.')
