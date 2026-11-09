import json,re,hashlib,pathlib,sys
import numpy as np
from PIL import Image,ImageDraw
ROOT=pathlib.Path('.'); OUT=ROOT/'public/sprites'; NN=Image.Resampling.NEAREST
spec=json.loads((ROOT/'docs/art/batch-treffen-generation.json').read_text())
jobs=spec['jobs']
source_dir=pathlib.Path(sys.argv[1])
for j in jobs:j['source']=str(source_dir/j['source'])
colors=re.findall(r"'(#\w{6})'",(ROOT/'docs/art/export-14b.mjs').read_text())[:31];colors[-1]='#8058aa'
pal=np.array([tuple(bytes.fromhex(c[1:])) for c in colors],dtype=np.int32)
assets=[]
def quant(im):
 a=np.array(im.convert('RGBA')); rgb=a[:,:,:3].astype(np.int32); ix=((rgb[:,:,None,:]-pal)**2).sum(3).argmin(2).astype('uint8')+1;ix[a[:,:,3]<128]=0
 p=Image.fromarray(ix,'P');p.putpalette([0,0,0]+pal.flatten().tolist()+[0]*(768-3-3*len(pal)));p.info['transparency']=0;return p

def save(im,id,file,**meta):
 p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True);quant(im).save(p)
 assets.append(dict(id=id,file=file,width=im.width,height=im.height,transparent=meta.pop('transparent',True),**meta))
def cells(im,grid,id):
 c,r=grid;res=[]
 for y in range(r):
  for x in range(c):
   y0,y1=round(y*im.height/r),round((y+1)*im.height/r)
   if id=='kreide_props':y0,y1=[240,590,960,1330,1680][y:y+2]
   if id=='zirkel':y0,y1=[0,385,680,960,1247][y:y+2]
   if id=='map_markers':y0,y1=[60,390,720,1050,1400][y:y+2]
   box=[round(x*im.width/c),y0,round((x+1)*im.width/c),y1]
   if id.endswith('_tiles'):box=[box[0]+5,box[1]+5,box[2]-5,box[3]-5]
   cell=im.crop(box)
   if not id.endswith(('_tiles','_emotions')):
    a=cell.getchannel('A').point(lambda v:255 if v>=128 else 0);cell.putalpha(a);b=a.getbbox()
    if b:cell=cell.crop(b)
   res.append(cell)
 return res

def fit(im,w,h):
 sc=min(w/im.width,h/im.height);return im.resize((max(1,round(im.width*sc)),max(1,round(im.height*sc))),NN)
props={
'waage': [('scale_'+str(i),32,32) for i in range(4)]+[('table',48,16),('cabinet',32,32),('weights',16,16),('bench',32,16)]+[('candles_'+str(i),16,16) for i in range(6)]+[('invitation',16,16),('curtain',16,32)],
'kreide':[('table',32,32),('chair_a',16,16),('chair_b',16,16),('chair_c',16,16),('lectern',16,32),('scroll_rack',32,32),('chalk_box',16,16),('telescope',16,32),('lamp_0',16,16),('lamp_1',16,16),('invitation',16,16),None]+[('dust_'+str(i),32,32) for i in range(4)],
'russ':[('stove_0',16,32),('stove_1',16,32),('counter',48,16),('coal_cart',32,16),('lantern_0',16,16),('lantern_1',16,16),('hooks',32,32),('cage_0',32,32),('cage_1',32,32),('coal_scale',16,32),('invitation',16,16),('stool',16,16)]+[None]*4}
for j in jobs:
 im=Image.open(j['source']).convert('RGBA');cs=cells(im,j['grid'],j['id']);canvas=Image.new('RGBA',j['size']); meta={};id=j['id'];regions={};ra={}
 if id.endswith('_walk'):
  scale=min(min(14/c.width,29/c.height) for c in cs)
  for i,c in enumerate(cs):
   c=c.resize((max(1,round(c.width*scale)),max(1,round(c.height*scale))),NN);canvas.paste(c,(i%4*16+(16-c.width)//2,i//4*32+31-c.height))
  meta=dict(frameWidth=16,frameHeight=32,columns=4,rows=4,baseline=31,animations={n:dict(frames=list(range(i*4,i*4+4)),frameRate=7,repeat=-1) for i,n in enumerate(['down','left','right','up'])})
 elif id.endswith('_emotions'):
  for i,c in enumerate(cs):canvas.paste(c.resize((64,64),NN),(i*64,0))
  meta=dict(frameWidth=64,frameHeight=64,columns=4,rows=1,animations={n:dict(frames=[i],frameRate=1,repeat=0) for i,n in enumerate(['neutral','suspicious','shocked','smiling'])})
 elif id.endswith('_tiles'):
  for i,c in enumerate(cs):canvas.paste(c.resize((16,16),NN),(i%8*16,i//8*16))
  # Repeatable plain floors share exact edge pixels, without drawing new motifs.
  for i in range(1,4):
   for a,b in [((0,0,16,1),(i*16,0)),((0,15,16,16),(i*16,15)),((0,0,1,16),(i*16,0)),((15,0,16,16),(i*16+15,0))]:canvas.paste(canvas.crop(a),b)
  meta=dict(frameWidth=16,frameHeight=16,columns=8,rows=4,tileGroups=dict(floorVariants=[0,1,2,3],floorDetails=list(range(4,16)),walls=list(range(16,24)),entrancesAndDetails=list(range(24,32))))
 elif id.endswith('_props'):
  n=id.split('_')[0]
  for i,spec in enumerate(props[n]):
   if not spec:continue
   name,w,h=spec;x=i%4*48;y=i//4*48
   # Pack each requested logical rectangle in an independent 48px slot.
   c=cs[i].resize((w-2,h-2),NN)
   if name.startswith('dust_'):
    ar=np.array(c);yy,xx=np.indices(ar.shape[:2]);ar[:,:,3][(xx+yy)%2==0]=0;c=Image.fromarray(ar)
   canvas.paste(c,(x+1,y+1));regions[name]=[x,y,w,h]
  groups={'waage':{'scale':['scale_'+str(i) for i in range(4)],**{'candles_'+str(k):['candles_'+str(k*2),'candles_'+str(k*2+1)] for k in range(3)}},'kreide':{'lamp':['lamp_0','lamp_1'],'dust':['dust_'+str(i) for i in range(4)]},'russ':{'stove':['stove_0','stove_1'],'lantern':['lantern_0','lantern_1'],'cage':['cage_0','cage_1']}}[n]
  ra={k:dict(regions=v,frameRate=3 if k!='dust' else 5,repeat=-1) for k,v in groups.items()};meta=dict(frameWidth=16,frameHeight=16,columns=12,rows=12,regions=regions,regionAnimations=ra)
 elif id=='map_markers':
  for i,c in enumerate(cs):
   c=fit(c,14,14);canvas.paste(c,(i%3*16+(16-c.width)//2,i//3*16+(16-c.height)//2))
  meta=dict(frameWidth=16,frameHeight=16,columns=3,rows=4,animations={f'{n}_{state}':dict(frames=[i+row*3] if row<2 else [i+6,i+9],frameRate=3,repeat=-1 if row==2 else 0) for i,n in enumerate(['treffen_waage','treffen_kreide','treffen_russ']) for row,state in enumerate(['normal','highlight','active'])})
 elif id=='zirkel':
  for i,n in enumerate(['waage','kreide','russ']):
   c=fit(cs[i],30,30);canvas.paste(c,(i*32+(32-c.width)//2,(32-c.height)//2));regions['emblem_'+n]=[i*32,0,32,32]
   c=fit(cs[i+4],14,14);canvas.paste(c,(i*16+(16-c.width)//2,32+(16-c.height)//2));regions['invitation_'+n]=[i*16,32,16,16]
  for i in range(8):
   c=fit(cs[i+8],14,14)
   if i<7:canvas.paste(c,(i*16+(16-c.width)//2,48+(16-c.height)//2))
   regions['timer_'+str(i)]=[i*16,48,16,16]
  meta=dict(frameWidth=16,frameHeight=16,columns=8,rows=4,regions=regions,regionAnimations={'timer':dict(regions=['timer_'+str(i) for i in range(8)],frameRate=1,repeat=0)})
 save(canvas,id,j['path'],transparent=j['transparent'],**meta)
 if id.endswith('_emotions'):
  head=canvas.crop((10,2,54,46)).resize((24,24),NN);save(head,id.replace('_emotions','_head'),'ui/heads/'+id.replace('_emotions','')+'.png',transparent=False,frameWidth=24,frameHeight=24,columns=1,rows=1,sourcePortrait=j['path'],sourceRect=[10,2,44,44])
 j['sha256']=hashlib.sha256(pathlib.Path(j['source']).read_bytes()).hexdigest();j['source']=pathlib.Path(j['source']).name
(ROOT/'public/sprites/manifest-treffen.json').write_text(json.dumps(dict(version=1,batch='treffen',status='exported; runtime integration pending',paletteMaxVisibleColors=31,assets=assets),indent=2)+'\n')
(ROOT/'docs/art/batch-treffen-generation.json').write_text(json.dumps(dict(tool='image_gen',palette=colors,jobs=jobs,postprocess='Per-cell crop, nearest neighbor, shared palette, binary alpha; exact prop regions and walk baseline.'),indent=2)+'\n')
print(len(assets),'assets exported')
