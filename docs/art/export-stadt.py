"""Export image_gen artwork using reviewed crops, nearest-neighbor, common palette and binary alpha.
Run from repo root: python docs/art/export-stadt.py /path/to/source-map.json
Sources map job IDs to original PNG paths. No synthetic replacement artwork is drawn.
Autotile topology is normalized by compositing the generated A/B textures with edge masks.
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage
import json,sys,hashlib,re
ROOT=Path(__file__).resolve().parents[2];SP=ROOT/'docs/art/batch-stadt-generation.json'
spec=json.loads(SP.read_text());sources=json.loads(Path(sys.argv[1]).read_text());NN=Image.Resampling.NEAREST
palette=np.array([list(bytes.fromhex(c[1:])) for c in spec['palette']],dtype=np.int32)
assets=[]
def blank(w,h):return Image.new('RGBA',(w,h))
def cell(im,i,cols,rows,inset=0):
 w,h=im.size;x=i%cols*w/cols;y=i//cols*h/rows;dx=w/cols*inset;dy=h/rows*inset
 return im.crop((round(x+dx),round(y+dy),round(x+w/cols-dx),round(y+h/rows-dy)))
def clean(im,opaque=False):
 a=np.array(im.convert('RGBA'));al=np.full(a.shape[:2],255,np.uint8) if opaque else np.where(a[:,:,3]>=200,255,0).astype(np.uint8)
 ix=((a[:,:,:3,None].transpose(0,1,3,2).astype(np.int32)-palette)**2).sum(3).argmin(2).astype(np.uint8)+1;ix[al==0]=0
 out=Image.fromarray(ix,'P');p=[0,0,0]+palette.flatten().tolist();out.putpalette(p+[0]*(768-len(p)))
 if not opaque:out.info['transparency']=0
 return out

def fit(im,w,h):
 a=np.array(im);alpha=a[:,:,3]>=200
 labels,n=ndimage.label(alpha)
 if n:
  counts=np.bincount(labels.ravel());counts[0]=0;largest=counts.max();valid=np.where(counts>=max(16,largest*.008))[0];valid=valid[valid!=0];m=np.isin(labels,valid);ys,xs=np.where(m);bb=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
 else:return blank(w,h)
 im=im.crop(bb);s=min((w-2)/im.width,(h-2)/im.height);im=im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),NN);out=blank(w,h);out.paste(im,((w-im.width)//2,h-1-im.height));return out

def tileable(im):
 a=np.array(im);a[:,-1]=a[:,0];a[-1,:]=a[0,:];return Image.fromarray(a)

def autotiles(im):
 # Generated full materials become repeatable textures. Quarter masks fix generator layout errors.
 A=np.array(tileable(cell(im,15,4,4,.035).resize((16,16),NN)));B=np.array(tileable(cell(im,0,4,4,.035).resize((16,16),NN)))
 y,x=np.mgrid[:16,:16];profile=np.array([8,8,7,8,9,8,7,7,8,9,8,7,8,8,9,8]);top=y<profile[x];left=x<profile[y];bottom=~top;right=~left
 jag=np.array([0,0,1,-1,0,1,0,-1,1,0,-1,0,1,-1,0,0]);masks=[np.ones((16,16),bool),bottom,top,right,left,bottom&right,bottom&left,top&right,top&left,~(top&left),~(top&right),~(bottom&left),~(bottom&right),y>=x+jag[x],y>=15-x+jag[x],np.zeros((16,16),bool)]
 out=blank(64,64)
 for i,m in enumerate(masks):out.paste(Image.fromarray(np.where(m[:,:,None],B,A).astype(np.uint8)),(i%4*16,i//4*16))
 return out,masks
names=['full_B','edge_top','edge_bottom','edge_left','edge_right','outer_top_left','outer_top_right','outer_bottom_left','outer_bottom_right','inner_top_left','inner_top_right','inner_bottom_left','inner_bottom_right','diagonal_down','diagonal_up','full_A']
for job in spec['jobs']:
 if job['id'] not in sources:continue
 src=Path(sources[job['id']]);raw=Image.open(src).convert('RGBA');job.update(source=src.name,sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest(),sourceSize=list(raw.size))
 w,h=job['width'],job['height'];kind=job['kind'];regions=[];animations={};opaque=kind in ('map','autotile','ground')
 if job['id']=='D_03_fassade_fabrik':
  job['reviewedSourceCrop']=[round(raw.width*.033),round(raw.height*.044),round(raw.width*.968),round(raw.height*.956)];raw=raw.crop(job['reviewedSourceCrop'])
  job['reviewedRowBounds']=[0,.172,.347,.519,.651,.827,1]
 if kind=='autotile':out,masks=autotiles(raw)
 elif kind=='ground':
  out=blank(w,h)
  for i in range(24):
   tile=cell(raw,i,4,6,.035).resize((16,16),NN)
   if i<10 or i>=22:
    tile=tileable(tile)
    if i==0:ground_edge=np.array(tile)
    else:
     q=np.array(tile);q[0]=ground_edge[0];q[-1]=ground_edge[-1];q[:,0]=ground_edge[:,0];q[:,-1]=ground_edge[:,-1];tile=Image.fromarray(q)
   out.paste(tile,(i%4*16,i//4*16))
 elif job['id'].startswith('D_03_'):
  # Reviewed generator row boundaries; remove presentation gutters per tile.
  bounds={'putz':[0,.193,.379,.551,.691,.830,1], 'holz':[0,.171,.368,.542,.675,.829,1], 'stein':[0,.170,.345,.516,.670,.832,1], 'slum':[0,.193,.367,.533,.677,.832,1]}
  ys=job.get('reviewedRowBounds',bounds.get(job['id'].split('_')[-1],[i/6 for i in range(7)]));job['reviewedRowBounds']=ys;out=blank(w,h)
  for row in range(6):
   for col in range(8):
    left=(col+.025)*raw.width/8;right=(col+.975)*raw.width/8;top=ys[row]*raw.height+4;bottom=ys[row+1]*raw.height-4
    tile=raw.crop((round(left),round(top),round(right),round(bottom))).resize((16,16),NN);out.paste(tile,(col*16,row*16))
 elif job.get('reviewedAtlas'):
  layout=job['reviewedAtlas'];out=blank(w,h);occupied=np.zeros((h//16,w//16),bool);regions=job.get('regions',[])
  rx,ry=layout.get('referenceSize',[1450,1086]);sx=raw.width/rx;sy=raw.height/ry
  for reg in regions:
   bb=layout['regions'][reg['name']];part=raw.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(bb)))
   out.paste(part.resize((reg['width'],reg['height']),NN),(reg['x'],reg['y']));occupied[reg['y']//16:(reg['y']+reg['height'])//16,reg['x']//16:(reg['x']+reg['width'])//16]=True
  bb=layout['tileArea'];area=raw.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(bb)));n=0
  for row in range(h//16):
   for col in range(w//16):
    if not occupied[row,col]:
     part=cell(area,n%(layout['tileColumns']*layout['tileRows']),layout['tileColumns'],layout['tileRows'],.03).resize((16,16),NN);out.paste(part,(col*16,row*16));n+=1
 elif kind=='single':out=fit(raw,w,h)
 elif kind=='props':
  c=job['sourceColumns'];r=job['sourceRows'];out=blank(w,h)
  parts=[]
  for i,it in enumerate(job['items']):
   if job.get('reviewedCellBounds'):
    rx,ry=job['boundsReferenceSize'];bb=job['reviewedCellBounds'][i];part=raw.crop(tuple(round(v*(raw.width/rx if k%2==0 else raw.height/ry)) for k,v in enumerate(bb)))
   else:part=cell(raw,i,c,r,.01)
   parts.append(part)
  # A common animation crop preserves scale and baseline instead of fitting each pose separately.
  anim_groups={}
  for i,it in enumerate(job['items']):
   mt=re.match(r'(.+)_([0-3])$',it['name'])
   if mt:anim_groups.setdefault(mt[1],[]).append(i)
  animation_parts={}
  for group,indices in anim_groups.items():
   refsize=(max(parts[i].width for i in indices),max(parts[i].height for i in indices));normal=[parts[i].resize(refsize,NN) for i in indices]
   boxes=[q.getchannel('A').point(lambda a:255 if a>=200 else 0).getbbox() for q in normal];boxes=[bb for bb in boxes if bb]
   if not boxes:continue
   common=(min(bb[0] for bb in boxes),min(bb[1] for bb in boxes),max(bb[2] for bb in boxes),max(bb[3] for bb in boxes))
   tw=job['items'][indices[0]]['width'];th=job['items'][indices[0]]['height'];scale=min((tw-2)/(common[2]-common[0]),(th-2)/(common[3]-common[1]));sz=(max(1,round((common[2]-common[0])*scale)),max(1,round((common[3]-common[1])*scale)))
   for i,q in zip(indices,normal):
    fr=blank(tw,th);fr.paste(q.crop(common).resize(sz,NN),((tw-sz[0])//2,th-1-sz[1]))
    bb=fr.getchannel('A').point(lambda a:255 if a>=200 else 0).getbbox()
    if bb and bb[3]!=th-1:
     aligned=blank(tw,th);aligned.paste(fr,(0,th-1-bb[3]));fr=aligned
    animation_parts[i]=fr
  for i,it in enumerate(job['items']):
   part=parts[i];x=i%c*48;y=i//c*48;tw=it['width'];th=it['height']
   out.paste(animation_parts[i] if i in animation_parts else fit(part,tw,th),(x,y));regions.append(dict(name=it['name'],x=x,y=y,width=tw,height=th))
  for it in regions:
   m=re.match(r'(.+)_([0-3])$',it['name'])
   if m:
    name=m[1];animations.setdefault(name,dict(frameWidth=it['width'],frameHeight=it['height'],frames=[],frameRate=5,repeat=-1))['frames'].append({k:it[k] for k in ('x','y','width','height')})
 elif job['id']=='D_08_wohnung_tiles':
  out=blank(w,h)
  for i in range(64):out.paste(cell(raw,i,8,8,.02).resize((16,16),NN),(i%8*16,i//8*16))
 else:out=raw.resize((w,h),NN);regions=job.get('regions',[])
 if job['id']=='D_05_theater':animations={'marquee':dict(frames=[32,40],frameWidth=48,frameHeight=16,frameRate=3,repeat=-1)}
 if job['id']=='D_05_gaswerk':animations={'furnace':dict(frames=[20,21],frameWidth=16,frameHeight=16,frameRate=4,repeat=-1)}
 if job['id']=='D_05_sternwarte':animations={'star_glass':dict(frames=[27,28],frameWidth=16,frameHeight=16,frameRate=3,repeat=-1)}
 if job['id']=='D_05_elend':animations={'oil_drum_fire':dict(frames=[24,25,26,27],frameWidth=16,frameHeight=32,frameRate=7,repeat=-1)}
 out=clean(out,opaque);dest=ROOT/'public/sprites'/job['file'];dest.parent.mkdir(parents=True,exist_ok=True);out.save(dest,optimize=True)
 tilegrid=kind in ('atlas','ground','autotile','props');fw=16 if tilegrid else w;fh=16 if tilegrid else h
 a=dict(id=job['id'],file=job['file'],width=w,height=h,frameWidth=fw,frameHeight=fh,columns=w//fw,rows=h//fh,transparent=not opaque,animations=animations)
 if regions:a['regions']=regions
 if kind=='autotile':a.update(tileOrder=names,materialA=job['materialA'],materialB=job['materialB'],edgeConvention='Names describe the boundary of B: outer top-left has B extending down/right; edge top has A above B. Inner corners have an A notch in B.',fullFillIndices={'A':15,'B':0})
 if kind=='autotile':
  a['edgeSignatures']=[{key:''.join('B' if v else 'A' for v in values) for key,values in [('top',mask[0]),('bottom',mask[-1]),('left',mask[:,0]),('right',mask[:,-1])]} for mask in masks]
 assets.append(a)
manifest=dict(version=1,batch='stadt',status='exported; runtime integration pending',paletteMaxVisibleColors=len(palette),assets=assets)
(ROOT/'public/sprites/manifest-stadt.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');SP.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n');print(f'Exported {len(assets)} PNGs')
