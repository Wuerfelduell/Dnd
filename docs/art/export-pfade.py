"""Technical export of image_gen artwork. Requires Python 3, Pillow, numpy and scipy.
Usage from repository root: python docs/art/export-pfade.py <source-map.json>
The map contains generation job IDs mapped to local original PNG paths.
No artwork is drawn here: only crops, NN resizing, palette remapping and alpha thresholding.
"""
from pathlib import Path
from PIL import Image
import json,sys,hashlib
import numpy as np
from scipy import ndimage
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/sprites'
SPEC=ROOT/'docs/art/batch-pfade-generation.json'
spec=json.loads(SPEC.read_text());sources=json.loads(Path(sys.argv[1]).read_text())
colors=['#1a1c2c','#252b38','#425360','#586c78','#71858b','#95a5a5','#413433','#715648','#92745a','#b3946e','#cfb18a','#e0c9a1','#eee2c5','#494b3a','#686850','#8b8870','#245b59','#36817a','#6fe0d0','#886332','#e8b860','#d0a050','#78578f','#c8b0e8','#884b60','#e07a8a','#4f713f','#9ad06a','#64788f','#a8b4c0','#503b68']
palette=np.array([tuple(bytes.fromhex(c[1:])) for c in colors],dtype=np.int32)
assets=[]
NN=Image.Resampling.NEAREST

def clean(im,transparent=True):
 a=np.asarray(im.convert('RGBA')).copy()
 # A high threshold removes generator glow halos and keeps opaque sprite interiors.
 alpha=(a[:,:,3]>=200).astype('uint8')*255 if transparent else np.full(a.shape[:2],255,dtype='uint8')
 rgb=a[:,:,:3].astype(np.int32)
 idx=((rgb[:,:,None,:]-palette[None,None,:,:])**2).sum(3).argmin(2).astype('uint8')+1
 idx[alpha==0]=0
 out=Image.fromarray(idx,'P');flat=[0,0,0]+palette.flatten().tolist();out.putpalette(flat+[0]*(768-len(flat)))
 if transparent:out.info['transparency']=0
 return out

def rgba(im):return im.convert('RGBA')
def blank(w,h):return Image.new('RGBA',(w,h))
def cell(im,c,r,cols,rows):
 w,h=im.size;return im.crop((round(c*w/cols),round(r*h/rows),round((c+1)*w/cols),round((r+1)*h/rows)))
def fit(im,w,h,pad=1,baseline=False):
 im=rgba(im);im.putalpha(im.getchannel('A').point(lambda a:255 if a>=200 else 0));mask=np.asarray(im.getchannel('A'))>0
 labels,n=ndimage.label(mask)
 if n:
  sizes=np.bincount(labels.ravel());sizes[0]=0;main=sizes.argmax();ys,xs=np.where(labels==main);bb=(int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1))
 else:bb=None
 out=blank(w,h)
 if not bb:return out
 im=im.crop(bb);scale=min((w-pad*2)/im.width,(h-pad*2)/im.height)
 im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN)
 out.paste(im,((w-im.width)//2,h-pad-im.height if baseline else (h-im.height)//2))
 return out

def emit(id,file,im,transparent=True,frame=None,animations=None,**extra):
 im=clean(im,transparent);p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True);im.save(p,optimize=True)
 a=dict(id=id,file=file,width=im.width,height=im.height,transparent=transparent)
 if frame:a.update(frameWidth=frame[0],frameHeight=frame[1],columns=im.width//frame[0],rows=im.height//frame[1])
 else:a.update(frameWidth=im.width,frameHeight=im.height,columns=1,rows=1)
 if animations:a['animations']=animations
 a.update(extra);assets.append(a)
 return im

def anim(name,n,rate=8,loop=True):return {name:dict(frames=list(range(n)),frameRate=rate,repeat=-1 if loop else 0)}
def strip(im,cols,rows,fw,fh,fitcells=False,alignbottom=False):
 out=blank(cols*rows*fw,fh)
 for i in range(cols*rows):
  part=cell(im,i%cols,i//cols,cols,rows)
  part=fit(part,fw,fh,1,baseline=True) if fitcells else part.resize((fw,fh),NN)
  if alignbottom:
   mask=part.getchannel('A').point(lambda a:255 if a>=200 else 0);bb=mask.getbbox()
   if bb:
    shifted=blank(fw,fh);shifted.paste(part,(0,fh-1-bb[3]));part=shifted
  out.paste(part,(i*fw,0))
 return out
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel']
for job in spec['jobs']:
 id=job['id']
 if id not in sources:continue
 p=Path(sources[id]);job['source']=p.name;job['sourceSha256']=hashlib.sha256(p.read_bytes()).hexdigest()
 raw=Image.open(p).convert('RGBA');start=len(assets)
 if id.startswith('emblem_'):
  for i,n in enumerate([16,32,64]):emit(id+'_'+str(n),'pathways/'+id+'_'+str(n)+'.png',fit(cell(raw,i,0,3,1),n,n,0))
 elif id.startswith('card_'):emit(id,'pathways/'+id+'.png',raw.resize((96,128),NN),False,textArea=[8,68,80,50])
 elif id.startswith('trank_'):
  for row,n in enumerate([16,32]):
   for col,seq in enumerate([9,8,7]):emit(id+'_'+str(seq)+('_32' if row else ''),'items/'+('32/' if row else '')+id+'_'+str(seq)+'.png',fit(cell(raw,col,row,3,2),n,n,1))
 elif id=='ladder':
  im=raw.resize((128,128),NN)
  emit('ladder','pathways/ladder.png',fit(raw.crop((0,0,raw.width*.35,raw.height)),16,112,0),socketCenters=[[8,12],[8,56],[8,100]],socketSize=[24,24],socketOverflowX=4)
  out=blank(96,24)
  for i in range(4):out.paste(fit(cell(raw.crop((raw.width*.4,0,raw.width,raw.height)),0,i,1,4),24,24,1),(i*24,0))
  emit('ladder_sockets','pathways/ladder_sockets.png',out,frame=(24,24),states=['empty','unlocked','cracked','locked'])
 elif id=='formeln':
  out=blank(112,48)
  for row,seq in enumerate([9,8,7]):
   for col,path in enumerate(paths):
    part=fit(cell(raw,col,row,7,3),16,16)
    emit('formel_'+path+'_'+str(seq),'items/formel_'+path+'_'+str(seq)+'.png',part)
    out.paste(part,(col*16,row*16))
  emit(id,'items/formeln.png',out,frame=(16,16),pathwayOrder=paths,sequenceOrder=[9,8,7])
 elif 'itemIds' in job:
  cols=4 if len(job['itemIds'])==8 else 3;out=blank(len(job['itemIds'])*16,16)
  for i,itemid in enumerate(job['itemIds']):
   part=fit(cell(raw,i%cols,i//cols,cols,2),16,16);out.paste(part,(i*16,0));emit(itemid,'items/'+itemid+'.png',part)
  emit(id,'items/'+id+'.png',out,frame=(16,16),itemIds=job['itemIds'])
 elif id=='schilling':
  for i,name in enumerate(['schilling','schilling_stapel','geldbeutel','schilling_haufen']):
   part=raw.crop((i*raw.width/4,0,(i+1)*raw.width/4,raw.height*.5));emit(name,'items/'+name+'.png',fit(part,16,16))
  im=raw.crop((raw.width*.105,raw.height*.60,raw.width*.90,raw.height*.92));out=blank(48,8)
  for i in range(6):out.paste(fit(cell(im,i,0,6,1),8,8,0),(i*8,0))
  emit('coin_spin','ui/coin_spin.png',out,frame=(8,8),animations=anim('spin',6,10))
 elif id.startswith('cauldron_'):
  if id.endswith('idle'):emit('cauldron','props/cauldron.png',fit(raw,32,32))
  else:emit(id,'props/'+id+'.png',strip(raw,3,2,32,32,alignbottom=True),frame=(32,32),animations=anim(id.split('_')[1],6,8,id.endswith('bubble')))
 elif id=='nachtmarkt_tiles':
  tiles=blank(128,128)
  for r in range(8):
   for c in range(8):
    part=cell(raw,c,r,8,8);inset=max(1,round(part.width*.035));part=part.crop((inset,inset,part.width-inset,part.height-inset)).resize((16,16),NN)
    tiles.paste(part,(c*16,r*16))
  # Remove generator atlas separators. Shared edge texels make ground variants tileable.
  edge=tiles.crop((0,0,16,16));edge.paste(edge.crop((0,0,16,1)),(0,15));edge.paste(edge.crop((0,0,1,16)),(15,0))
  for c in range(8):
   tiles.paste(edge.crop((0,0,16,1)),(c*16,0));tiles.paste(edge.crop((0,15,16,16)),(c*16,15));tiles.paste(edge.crop((0,0,1,16)),(c*16,0));tiles.paste(edge.crop((15,0,16,16)),(c*16+15,0))
  emit('A_07_nachtmarkt_tiles','tilesets/A_07_nachtmarkt_tiles.png',tiles,False,frame=(16,16),tileRows=['cobblestone','bridge_piers','arch_band','canal_steps','railings_planks','chalk_wall','crow_ledges','transitions'])
 elif id in ['nachtmarkt_props','kampfgrube','shop','digestion']:
  targetFile={'nachtmarkt_props':'props/A_08_nachtmarkt_props','kampfgrube':'props/A_08_kampfgrube','shop':'ui/A_10_shop','digestion':'ui/A_11_digestion'}[id]
  im=raw.resize(tuple(job['size']),NN)
  regions={
   'nachtmarkt_props':{'herb_stall':[0,0,48,32],'formula_booth':[64,0,32,32],'pawn_table':[112,0,48,32],'fortune_corner':[0,48,32,32],'lanterns_0':[48,48,48,16],'lanterns_1':[112,48,48,16],'crate':[48,80,16,16],'crow_sign':[80,80,32,16],'noticeboard':[128,80,16,32],'brazier_0':[0,96,16,32],'brazier_1':[16,96,16,32],'brazier_2':[32,96,16,32],'brazier_3':[48,96,16,32],'sleeping_crows':[160,80,32,16]},
   'kampfgrube':{'floor_9slice':[0,0,48,48],'fence_horizontal':[64,0,16,16],'fence_vertical':[80,0,16,16],'fence_corner':[96,0,16,16],'betting_board':[64,32,16,32],'coin_barrel':[96,32,16,32],'bench':[0,64,32,16],'cap_patch':[48,64,16,16]},
   'shop':{'frame':[0,0,48,48],'price_tag':[64,0,16,8],**{n:[64+i*16,24,16,16] for i,n in enumerate(['buy','sell','locked_pathway','locked_rank','only_once'])},**{n:[i*24,64,20,20] for i,n in enumerate(['slot_empty','slot_highlighted','slot_selected','slot_sold_out','slot_locked'])}},
   'digestion':{**{'fill_'+str(i*20):[0,i*10,64,10] for i in range(6)},'warning':[72,0,16,16],'digested':[72,24,16,16]}}[id]
  # Visually reviewed source bounds are normalized to each working canvas.
  # Repack into the exact requested atlas rectangles, rather than trusting generator coordinates.
  bounds={
   'nachtmarkt_props':{'herb_stall':[0,0,62,46],'formula_booth':[70,0,114,46],'pawn_table':[120,0,192,46],'fortune_corner':[0,48,48,91],'lanterns_0':[54,50,113,72],'lanterns_1':[120,50,180,72],'crate':[54,81,74,101],'crow_sign':[80,80,115,102],'noticeboard':[123,79,146,114],'brazier_0':[0,101,16,128],'brazier_1':[16,101,32,128],'brazier_2':[32,101,48,128],'brazier_3':[48,101,64,128],'sleeping_crows':[152,79,192,104]},
   'kampfgrube':{'floor_9slice':[4,5,60,64],'fence_horizontal':[66,5,86,24],'fence_vertical':[91,5,100,24],'fence_corner':[105,5,124,24],'betting_board':[66,27,91,66],'coin_barrel':[97,28,120,66],'bench':[3,72,41,89],'cap_patch':[45,73,68,89]},
   'shop':{'frame':[0,0,55,59],'price_tag':[59,4,86,20],**{n:[56+i*20,26,77+i*20,54] for i,n in enumerate(['buy','sell','locked_pathway','locked_rank','only_once'])},**{n:[i*28,59,i*28+28,92] for i,n in enumerate(['slot_empty','slot_highlighted','slot_selected','slot_sold_out','slot_locked'])}},
   'digestion':{**{'fill_'+str(i*20):[0,i*64/6,67,(i+1)*64/6] for i in range(6)},'warning':[72,0,88,17],'digested':[72,23,88,42]}}[id]
  packed=blank(*job['size'])
  for name,(x,y,w,h) in regions.items():
   b=bounds[name];sx=raw.width/job['size'][0];sy=raw.height/job['size'][1];part=raw.crop((round(b[0]*sx),round(b[1]*sy),round(b[2]*sx),round(b[3]*sy)))
   if name=='floor_9slice':part=part.resize((w,h),NN)
   else:part=fit(part,w,h,0)
   packed.paste(part,(x,y))
  im=packed
  job['reviewedSourceBounds']=bounds
  kw=dict(regions=regions)
  if id=='shop':kw['nineSlice']={'region':'frame','left':16,'right':16,'top':16,'bottom':16}
  if id=='nachtmarkt_props':kw['regionAnimations']={'lanterns':{'frames':['lanterns_0','lanterns_1'],'frameRate':4,'repeat':-1},'brazier':{'frames':['brazier_0','brazier_1','brazier_2','brazier_3'],'frameRate':6,'repeat':-1}}
  emit('A_'+{'nachtmarkt_props':'08_nachtmarkt_props','kampfgrube':'08_kampfgrube','shop':'10_shop','digestion':'11_digestion'}[id],targetFile+'.png',im,**kw)
 elif id.endswith('_walk'):
  # One shared scale across all frames, fixed baseline, no independent frame stretching.
  parts=[]
  for r in range(4):
   for c in range(4):
    part=cell(raw,c,r,4,4);part.putalpha(part.getchannel('A').point(lambda a:255 if a>=200 else 0));bb=part.getbbox();parts.append(part.crop(bb) if bb else blank(1,1))
  scale=min(14/max(x.width for x in parts),30/max(x.height for x in parts));out=blank(64,128)
  for i,part in enumerate(parts):
   part=part.resize((max(1,round(part.width*scale)),max(1,round(part.height*scale))),NN);out.paste(part,(i%4*16+(16-part.width)//2,i//4*32+31-part.height))
  emit('A_'+id,'characters/A_'+id+'.png',out,frame=(16,32),animations={d:dict(frames=list(range(r*4,r*4+4)),frameRate=7,repeat=-1) for r,d in enumerate(['down','left','right','up'])},baseline=31)
 elif id.endswith('_emotions'):
  emit('A_'+id,'portraits/A_'+id+'.png',strip(raw,4,1,64,64) if raw.width/raw.height>2 else strip(raw,2,2,64,64),False,frame=(64,64),states=['neutral','suspicious','shocked','smiling'])
 elif id=='control_cracks':
  out=strip(raw,2,2,480,270)
  for i in range(4):out.paste((0,0,0,0),(i*480+96,54,i*480+384,216))
  emit('A_11_control_cracks','ui/A_11_control_cracks.png',out,frame=(480,270),animations=anim('grow',4,3,False),transparentCenter=[96,54,288,162])
 elif id=='player_drink':emit('A_player_drink','characters/A_player_drink.png',strip(raw,4,2,16,32,True),frame=(16,32),animations=anim('drink',8,7,False))
 elif id=='potion_ascend':emit(id,'fx/potion_ascend.png',strip(raw,4,2,32,32),frame=(32,32),animations=anim('ascend',8,10,False))
 elif id=='aura_pfade':emit(id,'fx/aura_pfade.png',raw.resize((96,252),NN),frame=(24,36),animations={p:dict(frames=list(range(r*4,r*4+4)),frameRate=6,repeat=-1) for r,p in enumerate(paths)},anchor=[.5,1])
 job['outputs']=[a['file'] for a in assets[start:]]
manifest=dict(version=1,batch='pfade',status='exported; runtime integration pending',paletteMaxVisibleColors=31,palette=colors,assets=assets)
(OUT/'manifest-pfade.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
SPEC.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
print('Exported',len(assets),'assets from',len(sources),'sources')
