"""Export image_gen source artwork to the Batch E runtime atlases.

Run: python docs/art/export-faelle.py SOURCE_DIRECTORY
Requires Pillow and numpy. Only cropping, resampling, palette/alpha normalization
and atlas packing; no generated artwork is replaced with procedural drawings.
"""
import json,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
PALETTE=['#1a1c2c','#252b38','#303b49','#425360','#586c78','#71858b','#95a5a5','#a8b4c0','#2d2629','#58433c','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1','#494b3a','#686850','#8b8870','#eee2c5','#173d40','#245b59','#36817a','#4eafa2','#6fe0d0','#886332','#d0a050','#e8b860','#f0ce80','#c8b0e8','#e07a8a','#8c7295','#893e4e']
RGB=np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE],dtype=np.int32)
def cell(im,i,cols,rows):
 c,r=i%cols,i//cols
 return im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)))
def alpha(im):
 im=im.convert('RGBA');im.putalpha(im.getchannel('A').point(lambda x:255 if x>=128 else 0));return im
def fit(im,size,tight=True):
 im=alpha(im)
 if tight:
  box=im.getchannel('A').getbbox()
  if box:im=im.crop(box)
 return ImageOps.contain(im,size,Image.Resampling.NEAREST)
def save(im,path,transparent=True):
 a=np.array(im.convert('RGBA'));flat=a[:,:,:3].reshape(-1,3).astype(np.int32);idx=np.zeros(len(flat),dtype=np.uint8)
 for s in range(0,len(flat),8192):
  idx[s:s+8192]=((flat[s:s+8192,None,:]-RGB[None,:,:])**2).sum(2).argmin(1)+1
 idx=idx.reshape(a.shape[:2]);idx[a[:,:,3]<128]=0 if transparent else 1
 out=Image.fromarray(idx,'P');out.putpalette(([0,0,0]+RGB.astype('uint8').ravel().tolist()+[0]*768)[:768]);p=ROOT/'public/sprites'/path;p.parent.mkdir(parents=True,exist_ok=True)
 out.save(p,**({'transparency':0} if transparent else {}),optimize=True)
 return Image.open(p).convert('RGBA')
def export(j,im):
 w,h=j['size'];kind=j['kind'];out=Image.new('RGBA',(w,h));sc=j.get('sourceColumns',1);sr=j.get('sourceRows',1)
 if kind=='still':return im.resize((w,h),Image.Resampling.NEAREST)
 if kind=='atlas':
  for i,reg in enumerate(j['regions'].values()):
   f=fit(cell(im,i,sc,sr),(reg['width']-2,reg['height']-2))
   out.paste(f,(reg['x']+(reg['width']-f.width)//2,reg['y']+reg['height']-1-f.height))
  return out
 fw,fh=j['frameWidth'],j['frameHeight'];cols,rows=j['columns'],j['rows']
 if kind=='walk':
  # Identical scale across all frames; translate vertically to the shared baseline.
  frames=[alpha(cell(im,i,sc,sr)) for i in range(16)]
  boxes=[f.getchannel('A').getbbox() for f in frames];maxw=max(b[2]-b[0] for b in boxes if b);maxh=max(b[3]-b[1] for b in boxes if b)
  scale=min(14/maxw,29/maxh)
  for i,(f,b) in enumerate(zip(frames,boxes)):
   if not b:continue
   f=f.crop(b);f=f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),Image.Resampling.NEAREST)
   out.paste(f,((i%4)*16+(16-f.width)//2,(i//4)*32+31-f.height))
  return out
 for i in range(cols*rows):
  f=cell(im,i,sc,sr)
  if kind=='portraits':f=f.resize((fw,fh),Image.Resampling.NEAREST)
  elif kind=='icons':f=fit(f,(fw-2,fh-2))
  else:f=fit(f,(fw-2,fh-2),tight=False)
  out.paste(f,((i%cols)*fw+(fw-f.width)//2,(i//cols)*fh+(fh-f.height)//2))
 return out

def main(directory):
 spec=json.loads((ROOT/'docs/art/batch-faelle-generation.json').read_text());done={};sources={}
 for j in spec['jobs']:
  source=Path(directory)/Path(j['source']).name;im=Image.open(source).convert('RGBA');sources[j['id']]=im
  if j['kind']=='ui_source':continue
  out=export(j,im);done[j['id']]=save(out,j['path'],j['transparent'])
  if j['id'].startswith('items_'):
   for i,name in enumerate(j['names']):save(out.crop((i*16,0,i*16+16,16)),'items/'+name+'.png')
 # Phial icon 16 is an exact copy of the clue region; 32 uses original source.
 save(done['fall4_hinweise'].crop((0,0,16,16)),'items/stimmphiole.png')
 phial=fit(cell(sources['fall4_hinweise'],0,4,3),(30,30));out=Image.new('RGBA',(32,32));out.paste(phial,((32-phial.width)//2,(32-phial.height)//2));save(out,'items/32/stimmphiole.png')
 # Mixed quest UI with integer regions; markers occupy top64x64.
 ui=Image.new('RGBA',(160,176));src=sources['quest_markers']
 marker_job=next(j for j in spec['jobs'] if j['id']=='quest_markers')
 for r in range(4):
  fs=[alpha(src.crop(marker_job['sourceRects'][r*4+c])) for c in range(4)]
  # Isolate each generated seal; documented bob offsets provide predictable motion.
  for c,f in enumerate(fs):
   f=fit(f,(14,14));dy=[0,-1,0,1][c];ui.paste(f,(c*16+(16-f.width)//2,r*16+(16-f.height)//2+dy))
 for i in range(2):
  f=fit(cell(sources['quest_banners'],i,1,2),(158,30));ui.paste(f,((160-f.width)//2,64+i*32+(32-f.height)//2))
 for i in range(3):
  f=fit(cell(sources['quest_parts'],i,2,2),(8,8));ui.paste(f,(64+i*16+(8-f.width)//2,144+(8-f.height)//2))
 f=fit(cell(sources['quest_parts'],3,2,2),(48,48));ui.paste(f,((48-f.width)//2,128+(48-f.height)//2));save(ui,'ui/E_04_quest_ui.png')
 print('Exported 102 PNGs')
if __name__=='__main__':main(sys.argv[1])
