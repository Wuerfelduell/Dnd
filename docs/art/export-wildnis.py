"""Technical export of image_gen artwork: NN raster, shared palette, binary alpha.
Usage: python docs/art/export-wildnis.py [--partial]
No artwork is drawn by this script.
"""
from PIL import Image, ImageChops
import json,re,pathlib,sys,math
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[2]; OUT=ROOT/'public/sprites'
spec=json.loads((ROOT/'docs/art/batch-wildnis-generation.json').read_text())
colors=['#1a1c2c', '#252b38', '#303b49', '#425360', '#586c78', '#71858b', '#95a5a5', '#2d2629', '#413433', '#58433c', '#715648', '#92745a', '#b3946e', '#cfb18a', '#e0c9a1', '#494b3a', '#686850', '#8b8870', '#b4ac91', '#dbd2b3', '#eee2c5', '#173d40', '#245b59', '#36817a', '#4eafa2', '#6fe0d0', '#5f4829', '#886332', '#ba8942', '#dbac5d', '#f0ce80']
pal=Image.new('P',(1,1)); rgb=[tuple(bytes.fromhex(c[1:])) for c in colors]; pal.putpalette([v for c in rgb for v in c]+list(rgb[0])*(256-len(rgb)))
NN=Image.Resampling.NEAREST; assets=[]; pending=[]
def quant(im,alpha=True):
 im=im.convert('RGBA'); mask=im.getchannel('A').point(lambda x:255 if x>=128 else 0) if alpha else Image.new('L',im.size,255)
 im=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');im.putalpha(mask)
 # canonical transparent pixel color avoids irrelevant hidden-color counts
 clear=Image.new('RGBA',im.size);clear.paste(im,(0,0),mask);return clear

def boundaries(src,n,axis):
 a=np.array(src.getchannel('A')); scores=(a>=160).sum(axis=1 if axis=='y' else 0); length=len(scores); result=[0]
 for k in range(1,n):
  mid=length*k/n; radius=length/n*.19; lo=max(result[-1]+1,round(mid-radius));hi=min(length-1,round(mid+radius))
  band=scores[lo:hi+1].astype(float); best=band.min(); choices=np.flatnonzero(band<=best+max(1,best*.03))+lo
  result.append(int(min(choices,key=lambda x:abs(x-mid))))
 result.append(length);return result

def cell(src,col,row,cols,rows):
 ys=boundaries(src,rows,'y'); strip=src.crop((0,ys[row],src.width,ys[row+1]));xs=boundaries(strip,cols,'x')
 return strip.crop((xs[col],0,xs[col+1],strip.height))
def fit(im,size,margin=1):
 im=im.copy(); b=im.getchannel('A').getbbox()
 if not b:return Image.new('RGBA',size)
 im=im.crop(b);w,h=size; scale=min((w-margin*2)/im.width,(h-margin*2)/im.height);im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN)
 result=Image.new('RGBA',size);result.paste(im,((w-im.width)//2,h-margin-im.height));return result

def save(im,j):
 p=OUT/j['file'];p.parent.mkdir(parents=True,exist_ok=True); indexed=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE); indices=np.array(indexed);indices[np.array(im.getchannel('A'))==0]=31;indexed=Image.fromarray(indices,'P');indexed.putpalette(pal.getpalette());indexed.save(p,transparency=31);j.update(width=im.width,height=im.height);assets.append(j)
def anim(frames,fps=6,loop=True):return dict(frames=frames,frameRate=fps,repeat=-1 if loop else 0)
for job in spec['jobs']:
 if 'source' not in job:pending.append(job['id']);continue
 source=pathlib.Path(job['source']); source=(pathlib.Path(sys.argv[sys.argv.index('--source-dir')+1])/source.name) if '--source-dir' in sys.argv else source;src=Image.open(source).convert('RGBA')
 # Binary-alpha repair also handles generator sheets with near-white blank backgrounds.
 if job['transparent']:
  a=np.array(src); white=(a[:,:,:3].min(axis=2)>238)&((a[:,:,:3].max(axis=2)-a[:,:,:3].min(axis=2))<10)
  a[:,:,3][white]=0;a[:,:,3]=np.where(a[:,:,3]>=160,255,0);src=Image.fromarray(a)
 entry=dict(id=job['id'],file=job['path'],transparent=job['transparent'])
 if 'parts' in job:
  # Final mixed atlas: grid-aligned rects; animation groups have exact named frames.
  regions={};x=y=0;rowheight=0;packed=[];width=512 if job['id']=='danger' else 256
  source_parts=[cell(src,i%job['sourceColumns'],i//job['sourceColumns'],job['sourceColumns'],job['sourceRows']).resize((128,128),NN) for i,p in enumerate(job['parts'])]
  union={}
  for p,im in zip(job['parts'],source_parts):
   match=re.match(r'(.+)_(\d+)$',p['name']);box=im.getchannel('A').getbbox()
   if match and box:
    k=match[1];old=union.get(k,box);union[k]=(min(old[0],box[0]),min(old[1],box[1]),max(old[2],box[2]),max(old[3],box[3]))
  for i,p in enumerate(job['parts']):
   w,h=p['size'];sw=math.ceil(w/16)*16;sh=math.ceil(h/16)*16
   if x+sw>width:x=0;y+=rowheight;rowheight=0
   im=source_parts[i]
   if p['name'].startswith('vignette_') or p['name']=='entry_banner':im=im.resize((w,h),NN)
   else:
    match=re.match(r'(.+)_(\d+)$',p['name'])
    if match and match[1] in union:
     box=union[match[1]];im=im.crop(box);scale=min((w-2)/im.width,(h-2)/im.height);im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN);frame=Image.new('RGBA',(w,h));offset=h-1-im.height
     if match[1]=='pickup':offset=max(1,offset-int(match[2])*3)
     frame.paste(im,((w-im.width)//2,offset));im=frame
    else:im=fit(im,(w,h))
   packed.append((im,x,y));regions[p['name']]=dict(x=x,y=y,width=w,height=h);x+=sw;rowheight=max(rowheight,sh)
  out=Image.new('RGBA',(width,y+rowheight))
  for im,x,y in packed:out.paste(im,(x,y))
  entry['regions']=regions;entry['animations']={}
  groups={}
  for name in regions:
   m=re.match(r'(.+)_(\d+)$',name)
   if m:groups.setdefault(m[1],[]).append(name)
  for name,frames in groups.items():
   if len(frames)>1:entry['animations'][name]=anim(frames,6,name not in ['spawn','aggro','pickup','chest','coin_gain'])
  if job['id']=='loot_ui':entry['nineSlice']={'region':'window','left':16,'right':16,'top':16,'bottom':16}
  if job['id']=='danger':entry['zoneOverlays']={a:'vignette' for a in ['marsch','pestgassen','katakomben','kraterwald']}
 elif 'itemIds' in job:
  out=Image.new('RGBA',(256,48));entry['regions']={}
  for i,id in enumerate(job['itemIds']):
   for row,s in enumerate([16,32]):
    im=fit(cell(src,i,row,8,2),(s,s));im=quant(im);x=i*s;y=0 if s==16 else 16;out.paste(im,(x,y));entry['regions'][f'{id}_{s}']=dict(x=x,y=y,width=s,height=s)
    save(im,dict(id=id+('_32' if s==32 else ''),file=f'items/{"32/" if s==32 else ""}{id}.png',transparent=True))
 else:
  out=src.resize(tuple(job['size']),NN)
  if 'frameWidth' in job:
   fw,fh,cols,rows=(job[k] for k in ['frameWidth','frameHeight','columns','rows']);entry.update(frameWidth=fw,frameHeight=fh,columns=cols,rows=rows)
   if job['transparent']:
    # Crop per cell and fit with uniform sheet scale, consistent ground baseline.
    out=Image.new('RGBA',tuple(job['size']));counts=job.get('counts',[cols]*rows)
    cells=[]
    for r in range(rows):
     for c in range(counts[r]):
      frame=cell(src,c,r,cols,rows);b=frame.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
      if b:cells.append((r,c,frame.crop(b)))
    scale=min([min((fw-2)/im.width,(fh-2)/im.height) for r,c,im in cells],default=1)
    for r,c,im in cells:
     im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN);out.paste(im,(c*fw+(fw-im.width)//2,r*fh+fh-1-im.height))
    if job['id'].startswith('enemy_'):
     out.paste(out.crop((0,fh,fw,2*fh)),(fw,fh));names=['idle','attack','special','hurt','defeated','phase2_transform','phase2_idle'];entry['animations']={name:anim(list(range(r*6,r*6+counts[r])),6 if 'idle' in name else 8,'idle' in name) for r,name in enumerate(names[:rows])};entry['facing']='left';entry['windupFrames']=[6,7]
    elif job['id'].startswith('ow_'):entry['animations']={name:anim(list(range(r*4,r*4+4)),7) for r,name in enumerate(['down','left','right','up'])}
    elif job['id'].startswith('loot_'):entry['animations']={'closed':anim([0],1,False),'open':anim([1],1,False)}
   elif job['id']=='tiles_marsch':entry['animations']={'water':anim([0,1,2,3],3),'gas':anim([4,5,6,7],4)}
   elif job['id']=='tiles_katakomben':entry['animations']={'candle':anim([14,15],3)}
   elif job['id']=='tiles_kraterwald':entry['animations']={'star_glass':anim([8,9],3)}
 out=quant(out,job['transparent']);save(out,entry)
manifest=dict(version=1,batch='wildnis',status='partial' if pending else 'exported; runtime integration pending',paletteMaxVisibleColors=len(colors),palette=colors,assets=assets,pending=pending)
(OUT/'manifest-wildnis.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Exported {len(assets)} PNGs; {len(pending)} pending')
if pending and '--partial' not in sys.argv:raise SystemExit('Missing generator sources: '+', '.join(pending))
