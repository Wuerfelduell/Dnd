"""Export Paket S from accepted imagegen originals. Requires Pillow, numpy, scipy.
Usage: python docs/art/export-wexmoor3.py SOURCE_DIRECTORY
"""
import pathlib,json,sys,hashlib,re
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_propagation
ROOT=pathlib.Path(__file__).resolve().parents[2];OUT=ROOT/'public/sprites';NN=Image.Resampling.NEAREST
SOURCE_DIR=pathlib.Path(sys.argv[1])
sources=json.loads((ROOT/'docs/art/batch-wexmoor3-generation.json').read_text())['jobs']
PAL=['#1a1c2c','#6b333c','#303b49','#425360','#586c78','#71858b','#95a5a5','#2d2629','#413433','#58433c','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1','#494b3a','#686850','#8b8870','#b4ac91','#dbd2b3','#eee2c5','#173d40','#36817a','#8058aa','#e8f0ff','#9ad06a','#e8b860','#c8b0e8','#e07a8a','#6fe0d0','#a8b4c0','#d0a050']
pal=np.array([tuple(bytes.fromhex(c[1:])) for c in PAL],dtype=np.int32);assets=[]
def quant(im):
 a=np.array(im.convert('RGBA'));rgb=a[:,:,:3].astype(np.int32);ix=((rgb[:,:,None,:]-pal)**2).sum(3).argmin(2).astype('uint8')+1;ix[a[:,:,3]<128]=0
 p=Image.fromarray(ix,'P');p.putpalette([0,0,0]+pal.flatten().tolist()+[0]*(768-3-3*len(pal)));p.info['transparency']=0;return p

def save(im,id,file,transparent=True,**meta):
 p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True);q=quant(im);q.save(p);assets.append(dict(id=id,file=file,width=im.width,height=im.height,transparent=transparent,**meta));return q.convert('RGBA')

def isolate(c):
 a=np.array(c);mask=a[:,:,3]>=128
 labs,n=label(mask);sizes=np.bincount(labs.ravel());keep=np.where(sizes>=max(4,mask.sum()*.001))[0];keep=keep[keep!=0];mask=np.isin(labs,keep);a[:,:,3]=mask*255;c=Image.fromarray(a);b=c.getchannel('A').getbbox();return c.crop(b) if b else c

def fit(c,w,h):
 sc=min(w/c.width,h/c.height);return c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),NN)

def cuts(im,grid,transparent,kind,id):
 if transparent:
  ar=np.array(im)
  if np.mean(ar[0,:,:3].min(1)>205)>.5:
   mask=(ar[:,:,:3].min(2)>205)&(ar[:,:,:3].max(2)-ar[:,:,:3].min(2)<25);seed=np.zeros_like(mask);seed[0]=mask[0];seed[-1]=mask[-1];seed[:,0]=mask[:,0];seed[:,-1]=mask[:,-1];bg=binary_propagation(seed,mask=mask);ar[:,:,3][bg]=0;im=Image.fromarray(ar)
 if grid is None:return [im]
 cols,rows=grid
 if kind=='portrait':
  a=np.array(im);v=a[:,:,:3].mean(2);mask=(v>10)&(v<215)
  yy=np.where(mask.mean(1)>.6)[0];xx=np.where(mask.mean(0)>.6)[0]
  if len(xx) and len(yy):im=im.crop((xx.min(),yy.min(),xx.max()+1,yy.max()+1))
 cs=[];rects=[]
 for y in range(rows):
  nc=cols
  for x in range(nc):
   rect=[round(x*im.width/nc),round(y*im.height/rows),round((x+1)*im.width/nc),round((y+1)*im.height/rows)]
   if kind=='tiles':rect=[rect[0]+3,rect[1]+3,rect[2]-3,rect[3]-3]
   c=im.crop(rect)
   if kind=='portrait':
    ar=np.array(c);v=ar[:,:,:3].mean(2);good=(v>10)&(v<215);xx=np.where(good.mean(0)>.6)[0];yy=np.where(good.mean(1)>.6)[0]
    if len(xx) and len(yy):c=c.crop((xx.min(),yy.min(),xx.max()+1,yy.max()+1))
   if kind=='tiles':
    a=np.array(c);m=a[:,:,:3].mean(2)<235;yy,xx=np.where(m)
    if len(xx):
     c=c.crop((xx.min(),yy.min(),xx.max()+1,yy.max()+1));dx=max(1,round(c.width*.08));dy=max(1,round(c.height*.08));c=c.crop((dx,dy,c.width-dx,c.height-dy))
   cs.append(isolate(c) if transparent else c);rects.append(rect)
  if nc<cols:cs.append(cs[-1].copy());rects.append(rects[-1])
 return cs

props={
'salzwatt_props':[('buoy_a',16,32),('buoy_b',16,32),('buoy_c_0',16,32),('buoy_c_1',16,32),('boat',32,16),('pier',48,32),('salt_pan',32,32),('hut',32,48),('cart',32,16),('crab_holes',16,16),('seaweed',16,16),('chain_h',16,16),('chain_v',16,16),('mist_a',32,32),('mist_b',32,32),('mist_c',32,32)],
'lichtlose_props':[('embers_0',32,32),('embers_1',32,32),('embers_2',32,32),('blindfolds',16,16),('covered_lantern',16,16),('table',32,16),('ash_shelves',32,32),('carving',32,32)],
'salz_props':[('salt_a',32,32),('salt_b',32,32),('sacks',16,16),('table',48,16),('fish_barrel',16,16),('lantern_0',16,16),('lantern_1',16,16),('ledger',16,32),('anchor',32,32),('banner',32,32)]}

def anim(frames,rate=6,repeat=-1):return dict(frames=frames,frameRate=rate,repeat=repeat)
for j in sources:
 id=j['id'];im=Image.open(SOURCE_DIR/j['source']).convert('RGBA');cs=cuts(im,j['grid'],j['transparent'],j['kind'],id);canvas=Image.new('RGBA',j['size']);meta={};kind=j['kind'];fw,fh=j.get('frame',[16,16]);cols,rows=j.get('grid') or [1,1]
 # Color distinction: reduce teal generator tint to cold silver for foreign-light creatures.
 if any(n in id for n in ['weisslicht','lichtbrut','glasmoewe','linsensplitter','leuchtfeuer','fx_glassplitter','fx_salzkruste','fx_nebelnetz']):
  for z,c in enumerate(cs):
   ar=np.array(c);r,g,b=[ar[:,:,k].astype(float) for k in range(3)];mask=(g>r*1.12)&(b>r*1.08);v=np.maximum(g,b);ar[:,:,0][mask]=(v[mask]*.94).astype('uint8');ar[:,:,1][mask]=(v[mask]*.97).astype('uint8');ar[:,:,2][mask]=v[mask].astype('uint8');cs[z]=Image.fromarray(ar)
 if kind in ['battle','walk']:
  counts=j['counts'];active=[cs[y*cols+x] for y,n in enumerate(counts) for x in range(n)]
  tw,th=(14,14) if j.get('small') else (fw-4 if kind=='battle' else fw-2,fh-3)
  sc=min(min(tw/c.width,th/c.height) for c in active)
  baseline=fh-2 if kind=='battle' else fh-1
  for y,n in enumerate(counts):
   for x in range(n):
    ci=y*cols+x
    if kind=='battle' and y in [1,2] and x==1:ci=y*cols
    c=cs[ci];c=c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),NN)
    yy=(fh-c.height)//2 if j.get('small') else baseline-c.height
    canvas.paste(c,(x*fw+(fw-c.width)//2,y*fh+yy))
  meta=dict(frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,baseline=None if j.get('small') else baseline,animations={n:anim(list(range(y*cols,y*cols+counts[y])),7 if kind=='walk' else (6 if y==0 else 9),-1 if kind=='walk' or y==0 else 0) for y,n in enumerate(j['names'])})
  if kind=='battle':meta['windupRows']=[1,2];meta['facing']='left'
  if j.get('small'):meta['contentRect']=[8,8,16,16]
 elif kind=='portrait':
  for i,c in enumerate(cs):
   if i==2 and id.startswith('portrait_ez_'):
    color={'reetkoenig':'9ad06a','brennerin':'e8b860','spinnerin':'c8b0e8','baender':'a8b4c0','maskenwirt':'e07a8a','glockenfischer':'6fe0d0','schleusendieb':'d0a050'}[id.removeprefix('portrait_ez_')]
    ar=np.array(c);r,g,b=[ar[:,:,k].astype(float) for k in range(3)];mask=(g>135)&(b>110)&(g>r*1.3)&(b>r*1.2);mask[int(c.height*.6):]=False;ar[:,:,:3][mask]=tuple(bytes.fromhex(color));c=Image.fromarray(ar)
   canvas.paste(c.resize((64,64),NN),(i*64,0))
  meta=dict(frameWidth=64,frameHeight=64,columns=4,rows=1,animations={n:anim([i],1,0) for i,n in enumerate(['neutral','friendly','hostile','shocked'])})
 elif kind in ['card','bg'] or id=='boss_bust':
  canvas=cs[0].resize(j['size'],NN)
  if kind=='bg':
   ar=np.array(canvas);r,g,b=[ar[:,:,k].astype(float) for k in range(3)];yy,xx=np.indices(r.shape);mask=(xx<180)&(yy<70)&(r>g*1.1)&(g>b*1.1)&(r>90);ar[:,:,:3][mask]=(232,240,255);canvas=Image.fromarray(ar)
  meta=dict(frameWidth=canvas.width,frameHeight=canvas.height,columns=1,rows=1)
  if kind=='bg':meta['groundStrip']=[0,200,480,70]
 elif kind=='tiles':
  for i,c in enumerate(cs):canvas.paste(c.resize((16,16),NN),(i%8*16,i//8*16))
  canvas.paste(canvas.crop((0,0,16,1)),(0,15));canvas.paste(canvas.crop((0,0,1,16)),(15,0))
  for i in range(1,4):
   for a,b in [((0,0,16,1),(i*16,0)),((0,15,16,16),(i*16,15)),((0,0,1,16),(i*16,0)),((15,0,16,16),(i*16+15,0))]:canvas.paste(canvas.crop(a),b)
  meta=dict(frameWidth=16,frameHeight=16,columns=8,rows=4,tileGroups={'floor_variants':[0,1,2,3],'details':list(range(4,32))})
  if id=='salzwatt_tiles':meta['animations']={'shimmer':anim([30,31],3)}
 elif kind=='props':
  regions={}
  for i,(name,w,h) in enumerate(props[id]):
   x=i%4*64;y=i//4*64;c=cs[i].resize((w-2,h-2),NN)
   if name.startswith('mist'):
    ar=np.array(c);yy,xx=np.indices(ar.shape[:2]);ar[:,:,3][(xx+yy)%2==0]=0;c=Image.fromarray(ar)
   canvas.paste(c,(x+1,y+1));regions[name]=[x,y,w,h]
  groups={'salzwatt_props':{'ringing':['buoy_c_0','buoy_c_1']},'lichtlose_props':{'embers':['embers_0','embers_1','embers_2']},'salz_props':{'lantern':['lantern_0','lantern_1']}}[id]
  meta=dict(frameWidth=16,frameHeight=16,columns=16,rows=16,regions=regions,regionAnimations={n:dict(regions=rr,frameRate=3,repeat=-1) for n,rr in groups.items()})
 elif kind=='fx':
  sc=min(min((fw-4)/c.width,(fh-4)/c.height) for c in cs)
  for i,c in enumerate(cs):
   c=c.resize((max(1,round(c.width*sc)),max(1,round(c.height*sc))),NN)
   x=round((fw-c.width-2)*i/5)+1 if id=='fx_namensraub' else (fw-c.width)//2
   y=(fh-c.height)//2 if id in ['fx_namensraub','fx_nebelnetz','fx_glassplitter'] else fh-2-c.height
   canvas.paste(c,(i*fw+x,y))
  meta=dict(frameWidth=fw,frameHeight=fh,columns=6,rows=1,animations={'play':anim(list(range(6)),10,0)})
 elif kind=='items':
  regions={}
  for i,item in enumerate(j['items']):
   c=fit(cs[i],30,30);big=Image.new('RGBA',(32,32));big.paste(c,((32-c.width)//2,(32-c.height)//2));small=big.resize((16,16),NN)
   canvas.paste(small,(i*16,0));canvas.paste(big,(i*32,16));regions[item+'_16']=[i*16,0,16,16];regions[item+'_32']=[i*32,16,32,32]
   save(small,item,'items/'+item+'.png',frameWidth=16,frameHeight=16,columns=1,rows=1)
   save(big,item+'_32','items/32/'+item+'.png',frameWidth=32,frameHeight=32,columns=1,rows=1)
  meta=dict(frameWidth=16,frameHeight=16,columns=canvas.width//16,rows=3,regions=regions)
 elif id=='turn_portraits':
  for i,c in enumerate(cs):
   c=fit(c,16,16);canvas.paste(c,(i*16+(16-c.width)//2,(16-c.height)//2))
  meta=dict(frameWidth=16,frameHeight=16,columns=20,rows=1,ids=j['ids'])
 elif id=='loner_ui':
  specs=[('bar',64,8),('enemy_fill',32,8),('friend_fill',32,8),('needle',4,10)]+[(n,16,16) for n in ['enemy','wary','neutral','friend','ally']]+[(n,8,8) for n in ['amber','lilac','rose','turquoise','green','steel','brass']]+[('pip_empty',6,6),('pip_filled',6,6)];regions={}
  coords=[(0,0),(64,0),(96,0),(0,16)]+[(16+i*16,16) for i in range(5)]+[(i*8,40) for i in range(7)]+[(64,40),(72,40)]
  for i,((name,w,h),(x,y)) in enumerate(zip(specs,coords)):
   c=cs[i]
   if name in ['enemy_fill','friend_fill']:
    left,right=(.10,.48) if name=='enemy_fill' else (.52,.90);c=c.crop((round(c.width*left),round(c.height*.30),round(c.width*right),round(c.height*.70)))
   c=c.resize((w,h),NN);canvas.paste(c,(x,y));regions[name]=[x,y,w,h]
  meta=dict(frameWidth=16,frameHeight=16,columns=8,rows=6,regions=regions)
 elif id=='circle_ui':
  specs=[('emblem_lichtlose',32,32),('emblem_salz',32,32),('invitation_lichtlose',16,16),('invitation_salz',16,16)]+[(f'{n}_{state}',16,16) for state in ['normal','highlight','active_0','active_1'] for n in ['lichtlose','salz']]
  coords=[(0,0),(32,0),(64,0),(80,0)]+[(i*16,32) for i in range(8)];regions={}
  for i,((name,w,h),(x,y)) in enumerate(zip(specs,coords)):
   c=fit(cs[i],w-2,h-2);canvas.paste(c,(x+(w-c.width)//2,y+(h-c.height)//2));regions[name]=[x,y,w,h]
  meta=dict(frameWidth=16,frameHeight=16,columns=8,rows=4,regions=regions,regionAnimations={n:dict(regions=[n+'_active_0',n+'_active_1'],frameRate=3,repeat=-1) for n in ['lichtlose','salz']})
 result=save(canvas,id,j['path'],j['transparent'],**meta)
 if j.get('head'):
  h=result.crop((8,0,56,48)).resize((24,24),NN);save(h,'head_'+j['head'],'ui/heads/'+j['head']+'.png',False,frameWidth=24,frameHeight=24,columns=1,rows=1,sourcePortrait=j['path'],sourceRect=[8,0,48,48])
 j['sha256']=hashlib.sha256((SOURCE_DIR/j['source']).read_bytes()).hexdigest()
(ROOT/'public/sprites/manifest-wexmoor3.json').write_text(json.dumps(dict(version=1,batch='wexmoor3',status='exported; runtime integration pending',paletteMaxVisibleColors=32,assets=assets),indent=2)+'\n')
(ROOT/'docs/art/batch-wexmoor3-generation.json').write_text(json.dumps(dict(tool='image_gen',palette=PAL,jobs=sources),indent=2)+'\n')
print(len(assets),'PNG files exported from',len(sources),'source sheets')
