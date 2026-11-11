"""DL imagegen export. Usage: export.py inputs.json ({key: {path,prompt}})."""
from pathlib import Path
from PIL import Image
import json,sys,hashlib
import numpy as np
from scipy.ndimage import label
ROOT=Path(__file__).resolve().parents[3]
inputs=json.loads(Path(sys.argv[1]).read_text())
palette=json.loads((ROOT/'public/sprites/manifest-fasserin.json').read_text())['palette']
colors=[tuple(bytes.fromhex(c[1:])) for c in palette]
P=Image.new('P',(1,1));P.putpalette(sum((list(c) for c in colors),[])+list(colors[0])*(256-len(colors)))
def source(k):return Image.open(inputs[k]['path']).convert('RGBA')
def clean(im):
 a=im.getchannel('A').point(lambda x:255 if x>=200 else 0)
 rgb=im.convert('RGB').quantize(palette=P,dither=Image.Dither.NONE).convert('RGBA');rgb.putalpha(a)
 px=rgb.load()
 for y in range(rgb.height):
  for x in range(rgb.width):
   if px[x,y][3]==0:px[x,y]=(0,0,0,0)
 return rgb
def save(im,p):
 out=ROOT/'public/sprites'/p;out.parent.mkdir(parents=True,exist_ok=True);im.save(out)
def fitted(im,size=14):
 a=im.getchannel('A').point(lambda x:255 if x>=200 else 0)
 arr=np.array(a); labels,n=label(arr>0); counts=np.bincount(labels.ravel()); counts[0]=0
 if n: arr[(counts[labels] < counts.max()*0.04)]=0
 a=Image.fromarray(arr);im.putalpha(a)
 b=a.getbbox();im=im.crop(b) if b else im
 scale=min(size/im.width,size/im.height)
 return clean(im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.NEAREST))
base=source('atlas_fix');atlas=Image.new('RGBA',(160,128))
# Empty alpha scanlines between the generated rows; generator spacing is nonuniform.
row_bounds=[0,154,297,438,583,722,865,996,1122]
assert base.size==(1402,1122), 'Reinspect row bounds for a new source image'
for i in range(80):
 x,y=i%10,i//10
 cell=base.crop((round(x*base.width/10),row_bounds[y],round((x+1)*base.width/10),row_bounds[y+1]))
 tile=fitted(cell);atlas.alpha_composite(tile,(16*x+(16-tile.width)//2,16*y+(16-tile.height)//2))
save(atlas,'ui/erfolge_icons.png');save(atlas.resize((320,256),Image.Resampling.NEAREST),'ui/erfolge_icons_32.png')
opened=Image.new('RGBA',atlas.size);src=atlas.load();dst=opened.load()
for y in range(128):
 for x in range(160):
  if src[x,y][3]:
   light=y%16==0 or x%16==0 or not src[x,y-1][3] or not src[x-1,y][3]
   c=colors[18] if light else colors[1] if sum(src[x,y][:3])<230 else colors[16]
   dst[x,y]=(*c,255)
save(opened,'ui/erfolge_icons_offen.png');save(opened.resize((320,256),Image.Resampling.NEAREST),'ui/erfolge_icons_32_offen.png')
frame=clean(source('frame').resize((48,48),Image.Resampling.NEAREST));save(frame,'ui/erfolge_rahmen.png')
s=source('symbols');strip=Image.new('RGBA',(144,16))
for i in range(9):
 tile=fitted(s.crop((round(i*s.width/9),0,round((i+1)*s.width/9),s.height)),14)
 strip.alpha_composite(tile,(16*i+(16-tile.width)//2,(16-tile.height)//2))
save(strip,'ui/erfolge_symbole.png')
s=source('stamp');anim=Image.new('RGBA',(192,32))
for i in range(6):
 tile=s.crop((round(i*s.width/6),0,round((i+1)*s.width/6),s.height))
 tile=clean(tile.resize((16,32),Image.Resampling.NEAREST));anim.alpha_composite(tile,(32*i+8,0))
save(anim,'ui/erfolge_stempel.png')
s=source('toast');a=s.getchannel('A').point(lambda x:255 if x>=200 else 0);s=s.crop(a.getbbox());save(clean(s.resize((96,24),Image.Resampling.NEAREST)),'fx/erfolg_meldung.png')
entries=[]
for k,v in inputs.items():entries.append({'id':k,'generator':'image_gen.imagegen','prompt':v['prompt'],'sourceFile':Path(v['path']).name,'sourceSha256':hashlib.sha256(Path(v['path']).read_bytes()).hexdigest()})
(ROOT/'docs/art/batch-erfolge-generation.json').write_text(json.dumps({'batch':'erfolge','sources':entries,'paletteSource':'public/sprites/manifest-fasserin.json','postprocess':['Extract 10 columns; alpha-gap row boundaries [0,154,297,438,583,722,865,996,1122]; Nearest Neighbor per-cell fit with >=1px padding','Quantize to shared 32-color palette, no dithering','Alpha threshold 200; remove isolated source fragments below 4% of largest connected component before cell fitting; zero RGB under transparent pixels','Open state: preserved silhouette, 1 logical pixel top-left highlight','32px icons: exact nearest-neighbour 2x upscale'],'reproduce':'python tools/art/erfolge/export.py /path/to/inputs.json'},ensure_ascii=False,indent=2)+'\n')
print('Exported 8 PNG assets from 6 imagegen outputs.')
