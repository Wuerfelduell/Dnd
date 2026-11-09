"""Technical export: python docs/art/export-reise.py SOURCE_DIR. Requires Pillow, numpy, scipy."""
import json,sys,hashlib
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import binary_propagation
root=Path(__file__).resolve().parents[2]; doc=root/'docs/art';spec=json.loads((doc/'batch-reise-generation.json').read_text());src=Path(sys.argv[1]);assets=[]
shared_ids=['ankerhaken','porzellanmaske','rostanker','rostwasser','schleierdolch','schleierpuder']
shared_files={('items/'+i+'.png'):(root/'public/sprites/items'/ (i+'.png')).read_bytes() for i in shared_ids if (root/'public/sprites/items'/(i+'.png')).exists()}
palette=spec['palette'];rgb=np.array([tuple(bytes.fromhex(c[1:])) for c in palette],dtype=np.int32);N=Image.Resampling.NEAREST

def clean(im):
 a=np.array(im.convert('RGBA'));mask=a[:,:,3]>=128
 # Remove generator matte only if pale background reaches canvas edges.
 pale=a[:,:,:3].min(2)>215; seed=np.zeros(pale.shape,bool);seed[[0,-1],:]=pale[[0,-1],:];seed[:,[0,-1]]=pale[:,[0,-1]]
 if seed.sum()>20:mask &= ~binary_propagation(seed,mask=pale)
 a[:,:,3]=mask.astype('uint8')*255
 return Image.fromarray(a)
def tight(im):
 b=im.getchannel('A').getbbox();return im.crop(b) if b else Image.new('RGBA',(1,1))
def fit(im,size):
 im=tight(im);w,h=size;s=min(w/im.width,h/im.height);return im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),N)
def cell(im,c,r,cols,rows):return im.crop((round(c*im.width/cols),round(r*im.height/rows),round((c+1)*im.width/cols),round((r+1)*im.height/rows)))
def save(im,path,opaque):
 a=np.array(im.convert('RGBA'));p=a[:,:,:3].reshape(-1,3).astype(np.int32);ids=((p[:,None]-rgb[None])**2).sum(2).argmin(1).astype('uint8')+1
 if not opaque:ids[a[:,:,3].reshape(-1)<128]=0
 out=Image.fromarray(ids.reshape(a.shape[:2]),'P');pal=[0,0,0]+rgb.flatten().tolist();out.putpalette(pal+[0]*(768-len(pal)))
 if not opaque:out.info['transparency']=0
 f=root/'public/sprites'/path;f.parent.mkdir(parents=True,exist_ok=True);out.save(f)
def anim(frames,rate=8,repeat=0):return dict(frames=frames,frameRate=rate,repeat=repeat)
for j in spec['jobs']:
 im=Image.open(src/j['source']).convert('RGBA'); im=clean(im) if j['transparent'] else im
 w,h=j['size'];out=Image.new('RGBA',(w,h));cols=j['columns'];rows=j['rows'];kind=j['kind'];e=dict(id=j['id'],file=j['path'],width=w,height=h,transparent=j['transparent'])
 if kind in ['battle','walk','cells']:
  fw=w//cols;fh=h//rows;e.update(frameWidth=fw,frameHeight=fh,columns=cols,rows=rows);counts=([4,6,6,3,4]+([6] if rows==6 else [])) if kind=='battle' else [cols]*rows
  cells={(r,c):tight(cell(im,c,r,cols,rows)) for r in range(rows) for c in range(counts[r])}
  scale=min((fw-2)/max(x.width for x in cells.values()),(fh-2)/max(x.height for x in cells.values()))
  for (r,c),img in cells.items():
   img=tight(img.resize((max(1,round(img.width*scale)),max(1,round(img.height*scale))),N));out.paste(img,(c*fw+(fw-img.width)//2,r*fh+fh-1-img.height))
  if kind=='battle':
   for r in [1,2]:out.paste(out.crop((0,r*fh,fw,(r+1)*fh)),(fw,r*fh))
   e.update(facing='left',baseline=fh-1,animations={n:anim(list(range(r*cols,r*cols+counts[r])),6 if r==0 else 8,-1 if r==0 else 0) for r,n in enumerate(['idle','attack','special','hurt','defeated']+(['phase2'] if rows==6 else []))})
  elif kind=='walk':e.update(baseline=31,animations={n:anim(list(range(r*4,r*4+4)),8,-1) for r,n in enumerate(['down','left','right','up'])})
  elif j['id']=='I_reise_marker':
   for c,dy in enumerate([0,-1,-2,-1]):
    tile=out.crop((c*16,0,c*16+16,16));out.paste((0,0,0,0),(c*16,0,c*16+16,16));out.paste(tile,(c*16,dy))
   e['animations']={'idle':anim(list(range(4)),5,-1)}
  elif 'names'in j:e['icons']={n:i for i,n in enumerate(j['names'])}
 elif kind=='portrait':
  for c in range(4):out.paste(cell(im,c,0,4,1).resize((64,64),N),(c*64,0))
  e.update(frameWidth=64,frameHeight=64,columns=4,rows=1,expressions={n:i for i,n in enumerate(['neutral','suspicious','angry','arrogant'] if any(x in j['id'] for x in ['rost_vater','schleier_mutter']) else ['neutral','suspicious','shocked','smiling'])})
 elif kind=='emblem':
  e['regions']={}
  for c,(x,s) in enumerate([(0,16),(16,32),(48,64)]):
   img=fit(cell(im,c,0,3,1),(s,s));out.paste(img,(x+(s-img.width)//2,(s-img.height)//2));e['regions'][str(s)]=dict(x=x,y=0,width=s,height=s)
 elif kind=='items':
  e['regions']={}
  for r,s in enumerate([16,32]):
   for c,id in enumerate(j['itemIds']):
    img=fit(cell(im,c,r,8,2),(s-2,s-2));tile=Image.new('RGBA',(s,s));tile.paste(img,((s-img.width)//2,(s-img.height)//2));path='items/'+('32/' if s==32 else '')+id+'.png';save(tile,path,False);assets.append(dict(id=id+('_32' if s==32 else ''),file=path,width=s,height=s,transparent=True));x=c*s;y=0 if r==0 else 16;out.paste(tile,(x,y));e['regions'][id+str(s)]=dict(x=x,y=y,width=s,height=s)
 elif kind=='props':
  e['regions']={};names=['anchor_monument','chains','noticeboard','bollard','writing_desk','mourning_portrait','cleaning_trolley','grandfather_clock'];sizes=[(32,32),(16,16),(16,32),(16,16),(32,32),(16,32),(16,16),(16,48)]
  for i,(n,sz) in enumerate(zip(names,sizes)):
   img=fit(cell(im,i%4,i//4,4,2),sz);x=i%4*32;y=i//4*48;out.paste(img,(x+(sz[0]-img.width)//2,y+sz[1]-img.height));e['regions'][n]=dict(x=x,y=y,width=sz[0],height=sz[1])
 elif j['id']=='I_fraktionen':
  # Measured rectangles in 1440x1080 source; pack into contractual logical positions.
  for c in range(2):
   for r in range(6):
    box=(16+c*400,96+r*84,404+c*400,185+r*84)
    out.paste(im.crop(box).resize((64,8),N),(c*64,r*8))
  for i in range(5):out.paste(im.crop((17+i*148,659,160+i*148,800)).resize((16,16),N),(i*16,64))
  for i in range(4):out.paste(im.crop((17+i*148,858,160+i*148,1001)).resize((16,16),N),(i*16,96))
  out.paste(im.crop((831,90,1420,886)).resize((96,128),N),(144,0))
 elif kind=='tiles':
  # Left terrain block and right isolated props have separate source scales.
  tilebox=(25,34,710,628) if 'rostbrueder' in j['id'] else (16,16,740,620)
  out.paste(im.crop(tilebox).resize((128,96),N),(0,0))
  for r in range(6):
   for c in range(4):
    x0=720+c*182;y0=r*180
    img=fit(im.crop((x0,y0,min(im.width,x0+182),min(im.height,y0+180))),(30,30))
    out.paste(img,(128+c*32+(32-img.width)//2,r*32+31-img.height))
 elif j['id']=='I_reise_routen':
  for i in range(8):
   img=fit(im.crop((i*im.width/8,0,(i+1)*im.width/8,im.height*.29)),(8,8));out.paste(img,(i*8,(8-img.height)//2))
  for i in range(2):
   img=fit(im.crop((i*im.width/8,im.height*.5,(i+1)*im.width/8,im.height)),(8,16));out.paste(img,(i*8,16))
 else:out=im.resize((w,h),N)
 if kind=='scene' and j['id'].startswith('bg_'):e['groundRegion']=dict(x=0,y=200,width=480,height=70)
 if kind=='tiles':
  e['tileRegion']=dict(x=0,y=0,width=128,height=96,tileWidth=16,tileHeight=16,columns=8,rows=6)
  names=(['forge_0','forge_1','forge_2','forge_3','anvil','hanging_chains','rope_coil','rustwater_barrels','anchor_altar','banner_large','banner_small','hook_rack','rope_workbench','tool_workbench','spools','rope_reel','water_casks','sacks','crate','coal_trough','door_closed','door_open','mirror','occult_mirror'] if 'rostbrueder' in j['id'] else ['hearth_0','hearth_1','hearth_2','hearth_3','counter','hat_stand_1','hat_stand_2','hat_boxes','veiled_head_1','veiled_head_2','ribbon_rack','lace_box','dressing_table','mask_table','hanging_veils','mirror','cracked_mirror_1','cracked_mirror_2','hidden_door_closed','hidden_door_open','hat','storage_boxes','bottles','ornate_box'])
  e['regions']={n:dict(x=128+i%4*32,y=i//4*32,width=32,height=32) for i,n in enumerate(names)}
  e['regionAnimations']={'forge' if 'rostbrueder' in j['id'] else 'hearth':dict(regions=names[:4],frameRate=6,repeat=-1)}
 if j['id']=='I_reise_routen':
  e['regions']={f'{n}_{p}':dict(x=(a*4+b)*8,y=0,width=8,height=8) for a,n in enumerate(['sicher','schnell']) for b,p in enumerate(['straight','corner','end','junction'])};e['regions'].update({f'destination_{i}':dict(x=i*8,y=16,width=8,height=16) for i in range(2)})
 if j['id']=='I_fraktionen':
  e['regions']={f'{n}_{k}':dict(x=i*64,y=k*8,width=64,height=8) for i,n in enumerate(['rostbrueder','schleierschwestern']) for k in range(6)};e['regions'].update({n:dict(x=i*16,y=64,width=16,height=16) for i,n in enumerate(['hostile','suspicious','unknown','tolerated','infiltrated'])});e['regions']['dossier']=dict(x=144,y=0,width=96,height=128);e['regions'].update({f'spotted_{i}':dict(x=i*16,y=96,width=16,height=16) for i in range(4)})
 save(out,j['path'],not j['transparent']);assets.append(e)
for path,data in shared_files.items():
 (root/'public/sprites'/path).write_bytes(data)
 im=Image.open(root/'public/sprites'/path)
 for a in assets:
  if a['file']==path:a.update(width=im.width,height=im.height,sharedExisting=True)
(root/'public/sprites/manifest-reise.json').write_text(json.dumps(dict(version=1,batch='reise',status='exported; runtime integration pending',paletteMaxVisibleColors=31,assets=assets),indent=2)+'\n')
print(len(assets),'assets exported')
