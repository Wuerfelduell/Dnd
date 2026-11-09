"""Export Batch X imagegen source art without drawing replacement artwork.

Usage: python docs/art/export-platzhalter.py SOURCE_DIRECTORY
Requires Pillow and numpy. Operations: crop, nearest-neighbor resampling,
shared-palette indexing, binary alpha, and deterministic atlas packing.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[2]
PALETTE=['#1a1c2c','#252b38','#303b49','#425360','#586c78','#71858b','#95a5a5','#a8b4c0','#2d2629','#58433c','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1','#494b3a','#686850','#8b8870','#eee2c5','#173d40','#245b59','#36817a','#4eafa2','#6fe0d0','#886332','#d0a050','#e8b860','#f0ce80','#c8b0e8','#5c426a','#8c7295','#893e4e']
RGB=np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE],dtype=np.int32)
def cell(im,i,cols,rows):
 c,r=i%cols,i//cols
 return im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)))
def alpha(im):
 im=im.convert('RGBA');im.putalpha(im.getchannel('A').point(lambda x:255 if x>=128 else 0));return im

def fit(im,size):
 im=alpha(im);box=im.getchannel('A').getbbox()
 if box: im=im.crop(box)
 return ImageOps.contain(im,size,Image.Resampling.NEAREST)

def save(im,path,transparent=True):
 a=np.array(im.convert('RGBA'));flat=a[:,:,:3].reshape(-1,3).astype(np.int32);idx=np.zeros(len(flat),dtype=np.uint8)
 for s in range(0,len(flat),8192):
  idx[s:s+8192]=((flat[s:s+8192,None,:]-RGB[None,:,:])**2).sum(2).argmin(1)+1
 idx=idx.reshape(a.shape[:2]);idx[a[:,:,3]<128]=0 if transparent else 1
 out=Image.fromarray(idx,'P');out.putpalette(([0,0,0]+RGB.astype('uint8').ravel().tolist()+[0]*768)[:768]);p=ROOT/'public/sprites'/path;p.parent.mkdir(parents=True,exist_ok=True)
 out.save(p,**({'transparency':0} if transparent else {}),optimize=True)
 return Image.open(p).convert('RGBA')

def centered(im,size,margin=1):
 f=fit(im,(size[0]-margin*2,size[1]-margin*2));out=Image.new('RGBA',size);out.paste(f,((size[0]-f.width)//2,(size[1]-f.height)//2));return out

def export(j,im):
 kind=j['kind'];sc=j.get('sourceColumns',j.get('columns',1));sr=j.get('sourceRows',j.get('rows',1))
 if kind=='items':
  for r in range(sr):
   size=16 if r==0 else 32
   for i,name in enumerate(j['names']):
    f=cell(im,r*sc+i,sc,sr)
    save(centered(f,(size,size)),('items/' if r==0 else 'items/32/')+name+'.png')
  return
 if kind=='cards':
  for i,name in enumerate(j['names']):save(cell(im,i,sc,sr).resize((96,128),Image.Resampling.NEAREST),'ui/bestiary/X_'+name+'.png',False)
  return
 if kind=='still':out=im.resize(tuple(j['size']),Image.Resampling.NEAREST)
 elif kind=='bust':out=centered(im,tuple(j['size']),2)
 else:
  fw,fh,cols,rows=(j[k] for k in ['frameWidth','frameHeight','columns','rows']);out=Image.new('RGBA',(fw*cols,fh*rows))
  if kind=='battle':
   edges=j.get('sourceRowEdges',[round(im.height*r/rows) for r in range(rows+1)])
   frames={r*cols+c:alpha(im.crop((round(c*im.width/cols),edges[r],round((c+1)*im.width/cols),edges[r+1]))) for r,n in enumerate(j['counts']) for c in range(n)}
   boxes={i:f.getchannel('A').getbbox() for i,f in frames.items()}
   scale=min((fw-4)/max(b[2]-b[0] for b in boxes.values() if b),(fh-4)/max(b[3]-b[1] for b in boxes.values() if b))
   for i,f in frames.items():
    b=boxes[i]
    if not b:raise ValueError(f'Empty battle frame {j["id"]}:{i}')
    f=f.crop(b);f=f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),Image.Resampling.NEAREST)
    out.paste(f,((i%cols)*fw+(fw-f.width)//2,(i//cols)*fh+fh-2-f.height))
   for r in [1,2]:out.paste(out.crop((0,r*fh,fw,(r+1)*fh)),(fw,r*fh))
  elif kind=='portraits':
   frames=[alpha(cell(im,i,sc,sr)) for i in range(cols*rows)];boxes=[f.getchannel('A').getbbox() for f in frames]
   scale=min((fw-2)/max(b[2]-b[0] for b in boxes if b),(fh-2)/max(b[3]-b[1] for b in boxes if b))
   for i,(f,b) in enumerate(zip(frames,boxes)):
    if not b:raise ValueError('Empty portrait')
    f=f.crop(b);f=f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),Image.Resampling.NEAREST)
    out.paste(f,(i*fw+(fw-f.width)//2,fh-1-f.height))
  else:
   for i in range(cols*rows):
    f=im.crop(j['sourceRects'][i]) if 'sourceRects' in j else cell(im,i,sc,sr)
    out.paste(centered(f,(fw,fh)),((i%cols)*fw,(i//cols)*fh))
 save(out,j['path'],j['transparent'])

def main(directory):
 spec=json.loads((ROOT/'docs/art/batch-platzhalter-generation.json').read_text())
 count=0
 for j in spec['jobs']:
  if not j.get('source'):continue
  source=Path(directory)/Path(j['source']).name
  export(j,Image.open(source).convert('RGBA'));count+=1
 print(f'Exported {count} source sheets')
if __name__=='__main__':main(sys.argv[1])
