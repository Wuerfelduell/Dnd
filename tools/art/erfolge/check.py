"""Independent Pillow acceptance checks; run from any directory."""
from pathlib import Path
from PIL import Image
import json,hashlib
R=Path(__file__).resolve().parents[3];M=json.loads((R/'public/sprites/manifest-erfolge.json').read_text());A=json.loads((R/'docs/story/erfolge/erfolge.json').read_text())
palette={tuple(bytes.fromhex(c[1:])) for c in M['palette']};report={'batch':'erfolge','passed':False,'assets':[]};images={}
def pixels(im): return im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata()
assert len(M['assets'])==8
for a in M['assets']:
 p=R/'public/sprites'/a['file'];im=Image.open(p).convert('RGBA');images[a['id']]=im
 assert im.size==(a['width'],a['height']),p
 visible={v[:3] for v in pixels(im) if v[3]};alpha=set(pixels(im.getchannel('A')))
 assert len(visible)<=32 and visible<=palette,p
 assert alpha<={0,255} and 0 in alpha,p
 assert all(v[:3]==(0,0,0) for v in pixels(im) if not v[3]),p
 assert a['columns']*a['frameWidth']==im.width and a['rows']*a['frameHeight']==im.height
 count=a['columns']*a['rows']
 for anim in a['animations'].values():assert all(isinstance(f,int) and 0<=f<count for f in anim['frames'])
 for region in a.get('regions',{}).values():
  x,y,w,h=region;assert all(isinstance(v,int) for v in region) and x>=0 and y>=0 and w>0 and h>0 and x+w<=im.width and y+h<=im.height
 report['assets'].append({'file':a['file'],'size':list(im.size),'visibleColors':len(visible),'binaryAlpha':True,'raster':True,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
filled=images['erfolge_icons'];opened=images['erfolge_icons_offen'];assert filled.getchannel('A').tobytes()==opened.getchannel('A').tobytes()
seen=set()
for i,e in enumerate(A):
 x,y=i%10*16,i//10*16;tile=filled.crop((x,y,x+16,y+16));bbox=tile.getbbox();assert bbox and bbox[0]>=1 and bbox[1]>=1 and bbox[2]<=15 and bbox[3]<=15,(i,bbox)
 sig=tile.tobytes();assert sig not in seen,('duplicate icon',i);seen.add(sig)
 assert M['achievementAtlas'][e['id']]['cell']==[i%10,i//10]
 assert M['achievementAtlas'][e['id']]['rect16']==[x,y,16,16]
 assert M['achievementAtlas'][e['id']]['rect32']==[2*x,2*y,32,32]
 assert M['achievementAtlas'][e['id']]['index']==i
assert len(seen)==80
highlight=tuple(bytes.fromhex(M['palette'][18][1:]))
for y in range(128):
 for x in range(160):
  if filled.getpixel((x,y))[3] and (x%16==0 or y%16==0 or not filled.getpixel((x-1,y))[3] or not filled.getpixel((x,y-1))[3]):assert opened.getpixel((x,y))[:3]==highlight
for small,big in [('erfolge_icons','erfolge_icons_32'),('erfolge_icons_offen','erfolge_icons_32_offen')]:assert images[small].resize((320,256),Image.Resampling.NEAREST).tobytes()==images[big].tobytes()
stamp=images['erfolge_stempel'];assert len({stamp.crop((i*32,0,(i+1)*32,32)).tobytes() for i in range(6)})==6
for i in range(9):assert images['erfolge_symbole'].crop((i*16,0,(i+1)*16,16)).getbbox()
assert images['erfolge_rahmen'].getpixel((24,24))[3]==0
report.update(passed=True,achievementCount=80,uniqueIcons=80,stateSilhouettesMatch=True,embossHighlightPixels=1,nearestNeighbour2x=True,animationFrames=6,symbols=9)
(R/'docs/art/batch-erfolge-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS: 8 PNGs; Maße, gemeinsame Palette <=32, binäres Alpha, Zellraster und Regionen gültig.')
print('PASS: 80 unterschiedliche Icons, freie Zellränder, gleiche Silhouetten, 1px-Prägung, exakte 2x-Skalierung; 6 Stempelframes und 9 Symbole.')
