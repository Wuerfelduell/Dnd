"""BA export: python tools/art/dunscar4/export.py sources.json.
Sources map portrait/walk/stalls/animals/props/weather to generator PNGs.
Requires Pillow/numpy. Only raster reduction, palette/alpha normalization and
exact geometric UI glyph construction; no runtime integration.
"""
import json, math, hashlib, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/sprites'
PALETTE=json.loads((OUT/'manifest-dunscar3.json').read_text())['palette']
PALETTE[20]='#71858b'  # AH/spieler2 cool slate accent, replaces one AX shade.
COLORS=[tuple(bytes.fromhex(c[1:])) for c in PALETTE]
DARK,SLATE,GRAY,BONE,BRASS,TURQ,RUST,BLUE=PALETTE[0],PALETTE[3],PALETTE[6],PALETTE[8],PALETTE[17],PALETTE[30],PALETTE[14],PALETTE[20]
ASSETS=[]

def indexed(im):
 a=np.array(im.convert('RGBA')); rgb=a[:,:,:3].astype(np.int32)
 pal=np.array(COLORS,dtype=np.int32); out=np.zeros(a.shape[:2],dtype=np.uint8)
 for y in range(a.shape[0]): out[y]=((rgb[y,:,None,:]-pal[None,:,:])**2).sum(2).argmin(1)
 rgba=np.array(COLORS,dtype=np.uint8)[out]; alpha=np.where(a[:,:,3]>=128,255,0).astype(np.uint8)
 return Image.fromarray(np.dstack((rgba,alpha)),'RGBA')

def save(file,im,**meta):
 im=indexed(im); p=OUT/file; p.parent.mkdir(parents=True,exist_ok=True); im.save(p,optimize=True)
 item=dict(id=Path(file).stem,file=file,width=im.width,height=im.height,transparent=True,**meta)
 ASSETS.append(item); return item

def cut(im,cols,rows,counts=None,bands=None):
 # Snap generated row divisions to local alpha valleys to tolerate generator spacing.
 a=np.array(im.getchannel('A')); weights=(a>=128).sum(axis=1)
 ys=[0]
 for r in range(1,rows):
  mid=round(r*im.height/rows); spread=max(1,round(im.height/rows*.18))
  lo=max(ys[-1]+1,mid-spread); hi=min(im.height,mid+spread)
  vals=weights[lo:hi]; minimum=vals.min(); candidates=np.flatnonzero(vals==minimum)+lo
  ys.append(int(min(candidates,key=lambda n:abs(n-mid))))
 ys.append(im.height)
 if bands is not None: ys=bands
 result=[]
 for row in range(rows):
  rr=[]
  for col in range(counts[row] if counts else cols):
   box=(round(col*im.width/cols),ys[row],round((col+1)*im.width/cols),ys[row+1])
   cell=im.crop(box); alpha=cell.getchannel('A').point(lambda x:255 if x>=128 else 0); cell.putalpha(alpha)
   bbox=cell.getbbox()
   if not bbox: raise ValueError(f'Empty cell {row}/{col}')
   rr.append(cell.crop(bbox))
  result.append(rr)
 return result

def fit_frames(frames,w,h,margin=1):
 scale=min((w-2*margin)/max(f.width for f in frames),(h-2*margin)/max(f.height for f in frames))
 result=[]
 for f in frames:
  f=f.resize((max(1,round(f.width*scale)),max(1,round(f.height*scale))),Image.Resampling.NEAREST)
  tile=Image.new('RGBA',(w,h)); tile.alpha_composite(f,((w-f.width)//2,h-margin-f.height)); result.append(tile)
 return result

def anim(n,fps=6,repeat=-1): return dict(frames=list(range(n)),frameRate=fps,repeat=repeat)

def region(name,frames,x,y,fps=6,**extra):
 w,h=frames[0].size
 return dict(id=name,x=x,y=y,width=w,height=h,frameWidth=w,frameHeight=h,columns=len(frames),rows=1,frames=list(range(len(frames))),fps=fps,animations={name:anim(len(frames),fps)},**extra)

def atlas(file,groups,width=None):
 width=width or max(len(fr)*fr[0].width for _,fr,_,_ in groups)
 height=sum(math.ceil(fr[0].height/16)*16 for _,fr,_,_ in groups)
 im=Image.new('RGBA',(width,height)); regions=[]; y=0
 for name,frames,fps,extra in groups:
  r=region(name,frames,0,y,fps,**extra)
  if 'states' in extra: r['animations']={s:dict(frames=[i],frameRate=1,repeat=0) for s,i in extra['states'].items()}
  if 'repeat' in extra:r['animations'][name]['repeat']=extra['repeat']
  regions.append(r)
  for i,f in enumerate(frames): im.alpha_composite(f,(i*f.width,y))
  y+=math.ceil(frames[0].height/16)*16
 return save(file,im,regions=regions)

def glyph(name,k):
 im=Image.new('RGBA',(16,16)); d=ImageDraw.Draw(im)
 c=TURQ if 'aktiv' in name or name=='bindung' else BRASS
 if 'fehl' in name or name=='alarm': c=RUST
 if name=='bindung_p2': c=BLUE
 if name.startswith('linie_'):
  if name=='linie_vorschau':
   for x in range(16):
    if (x-k)%8<4: d.line((x,7,x,8),fill=c)
  elif name=='linie_aktiv':
   d.line((0,8,15,8),fill=c,width=1+k%2)
   d.point((k*4,6),fill=PALETTE[31])
  elif name=='linie_echo':
   for x in range(16):
    if (x+2*k)%6==0:d.rectangle((x,7,min(15,x+1),8),fill=TURQ)
  else:
   d.line([(0,8),(3,5),(6,10),(9,6),(11,8)],fill=c,width=1)
   d.line((13,5+k%2,15,3+k%2),fill=c)
 elif name.startswith('ecke_'):
  points=[(x,8) for x in range(9)]+[(8,y) for y in range(8)]
  for j,(x,y) in enumerate(points):
   if 'aktiv' in name or (j+k)%4<2:d.point((x,y),fill=c)
  if 'aktiv' in name and k:d.line((0,9,9,9),fill=c);d.line((9,0,9,9),fill=c)
  if 'fehl' in name:d.line((5,4,11,10),fill=c); d.line((5,10,11,4),fill=c)
 elif name.startswith('ende_'):
  d.line((0,8,7,8),fill=c)
  if 'vorschau' in name:d.ellipse((7,4,13,10),outline=c); d.point((10,5+k),fill=c)
  else:d.polygon([(8,4),(14,8),(8,12)],outline=c); d.point((9+k,8),fill=BONE)
 elif name=='nische':
  d.arc((2,2,13,13),180,360,fill=SLATE,width=2); d.line((2,8,2,13),fill=SLATE);d.line((13,8,13,13),fill=SLATE)
  d.line((5,12,10,12),fill=GRAY if k==0 else BONE)
 elif name=='alarm':
  for y in range(2,14):
   for x in range(2,14):
    if (x+y+k)%4==0:d.point((x,y),fill=RUST)
  d.polygon([(8,2),(14,13),(2,13)],outline=RUST)
  d.line((8,6,8,9),fill=BONE); d.point((8,11),fill=BONE)
 elif name.startswith('bindung'):
  d.polygon([(3,2),(12,2),(9,8),(8,12),(6,12),(6,8)],fill=SLATE,outline=c)
  d.rectangle((2,7,13,10),fill=DARK,outline=c)
  d.line((3,8,5,8),fill=BONE);d.point((9+k%3,8),fill=BONE)
  if name.endswith('p2'):d.point((3,12),fill=c);d.point((5,12),fill=c)
  else:d.point((4,12),fill=c)
 elif name=='notladung':
  d.rounded_rectangle((3,2,12,14),radius=2,fill=DARK,outline=BRASS);d.rectangle((6,0,9,2),fill=BRASS)
  if k==0:d.rectangle((5,5,10,11),fill=BRASS);d.line((6,6,6,10),fill=BONE)
  else:d.line((5,11,10,6),fill=GRAY)
 elif name=='richtungspfeil':
  d.polygon([(3,3),(11,8),(3,13)],outline=BRASS,fill=SLATE if k%2 else DARK);d.point((13,8),fill=BONE)
  if k>1:d.line((1,5,1,11),fill=BRASS)
 elif name.startswith('sprecher_'):
  d.polygon([(2,4),(8,4),(8,7),(13,7),(13,10),(8,10),(6,13),(2,11)],fill=BRASS,outline=DARK)
  d.line((4,5,4,8),fill=BONE)
  if name.endswith('2'):d.line((6,5,6,8),fill=BONE)
 elif name=='trichter':
  d.polygon([(2,3),(13,3),(9,9),(9,13),(6,13),(6,9)],fill=BRASS,outline=DARK);d.line((4,4,11,4),fill=BONE)
 return im

def main():
 sources=json.loads(Path(sys.argv[1]).read_text()); src={k:Image.open(v).convert('RGBA') for k,v in sources.items()}
 # Ruth: shared reduction scale across all walking poses, uniform foot baseline.
 cells=cut(src['walk'],4,4); frames=fit_frames(sum(cells,[]),16,32)
 im=Image.new('RGBA',(64,128))
 for i,f in enumerate(frames):im.alpha_composite(f,((i%4)*16,(i//4)*32))
 save('characters/k3n_secondhaendler_walk.png',im,frameWidth=16,frameHeight=32,columns=4,rows=4,baseline=30,animations={n:dict(frames=list(range(i*4,i*4+4)),frameRate=7,repeat=-1) for i,n in enumerate(['down','left','right','up'])})
 portraits=fit_frames(sum(cut(src['portrait'],4,2),[]),64,64,0)
 for row,(file,names) in enumerate([('k3n_secondhaendler_emotions',['neutral','misstrauisch','erschrocken','laecheln']),('AK_k3n_secondhaendler_emotions2',['wuetend','traurig','nachdenklich','entschlossen'])]):
  im=Image.new('RGBA',(256,64))
  for i in range(4):im.alpha_composite(portraits[row*4+i],(i*64,0))
  save('portraits/'+file+'.png',im,frameWidth=64,frameHeight=64,columns=4,rows=1,animations={n:dict(frames=[i],frameRate=1,repeat=0) for i,n in enumerate(names)})
 head=portraits[0].crop((8,0,54,46)).resize((24,24),Image.Resampling.NEAREST)
 save('ui/heads/k3n_secondhaendler.png',head,frameWidth=24,frameHeight=24,columns=1,rows=1,animations={'neutral':anim(1,1,0)})
 stalls=cut(src['stalls'],2,10,bands=[0,179,350,525,686,843,1002,1153,1292,1437,1586]); groups=[]
 for i,name in enumerate(['kreide','kalkpastillen','troedel','stein','tee','werkzeug','kartoffeln','zeitungen','kerzen','flickzeug']):
  groups.append(('stand_'+name,fit_frames(stalls[i],32,32),1,dict(states={'offen':0,'geschlossen':1},city='dunscar',map='ds_kalkmarkt' if i<6 else 'ds_arbeiterbogen')))
 atlas('props/BA_staende.png',groups)
 names=['ds_kraehe_sitzen','ds_kraehe_auffliegen','ds_kraehe_fliegen','ds_kalkziege_stehen','ds_kalkziege_laufen','ds_kalkziege_klettern','ds_staubteufel','ds_motte_kreisen','ds_eidechse_sitzen','ds_eidechse_huschen','ds_schwalbe_fliegen','ds_schwalbe_sitzen']; counts=[2,4,4,2,4,2,6,4,2,4,4,1]
 cells=cut(src['animals'],6,12,counts); groups=[]
 for i,name in enumerate(names):
  h=32 if i in (5,6) else 16
  groups.append((name,fit_frames(cells[i],16,h),4 if 'sitzen' in name or 'stehen' in name else 8,{}))
 atlas('fx/BA_dunscar_tiere.png',groups)
 # Weather stays spatially fixed; no bbox fitting. 240x135 logical cells have 9px row padding.
 weather=[]
 for row in range(3):
  for col in range(2):
   f=src['weather'].crop((round(col*src['weather'].width/2),round(row*src['weather'].height/3),round((col+1)*src['weather'].width/2),round((row+1)*src['weather'].height/3))).resize((240,135),Image.Resampling.NEAREST)
   a=np.array(f); yy,xx=np.indices(a.shape[:2]); mask=(a[:,:,3]>=96)
   if row==2: mask &= (xx+yy)%2==0
   a[:,:,3]=np.where(mask,255,0); f=Image.fromarray(a)
   # Transparent edge prevents seams in the 2x2 overlay tiling.
   d=ImageDraw.Draw(f);d.rectangle((0,0,239,134),outline=(0,0,0,0)); weather.append(f)
 grass=[]
 for k in range(4):
  f=Image.new('RGBA',(16,16));d=ImageDraw.Draw(f)
  for x,h in [(3,6),(5,10),(8,12),(11,8),(13,5)]:d.line([(8,14),(x+k%3-1,14-h)],fill=PALETTE[22] if x%2 else PALETTE[21])
  grass.append(f)
 atlas('fx/BA_dunscar_wetter.png',[('kalkstaub',weather[:4],5,{'tileWidth':240,'tileHeight':135}),('nachtnebel_1',[weather[4]],1,{'tileWidth':240,'tileHeight':135}),('nachtnebel_2',[weather[5]],1,{'tileWidth':240,'tileHeight':135}),('wind_grasbueschel',grass,5,{})])
 # Exact geometry is constructed at target resolution, so connections remain tileable.
 specs=[('linie_vorschau',4),('linie_aktiv',4),('linie_echo',6),('linie_fehl',4),('ecke_vorschau',2),('ecke_aktiv',2),('ecke_fehl',2),('ende_vorschau',3),('ende_aktiv',3),('nische',2)]
 groups=[(n,[glyph(n,k) for k in range(count)],6,{'connection':[0,8]}) for n,count in specs]
 rings=[]
 for k in range(3):
  f=Image.new('RGBA',(48,48));d=ImageDraw.Draw(f)
  for deg in range(0,360,12):
   rad=math.radians(deg);x=round(24+22*math.cos(rad));y=round(24+22*math.sin(rad));d.point((x,y),fill=RUST if k==2 else GRAY)
  if k==2:
   for x,y in [(24,1),(24,46),(1,24),(46,24)]:d.line((x,y,24+(x-24)*.8,24+(y-24)*.8),fill=RUST,width=2)
  else:d.point((24+k,2),fill=BONE)
  rings.append(f)
 groups.append(('hoerkreis',rings,3,{'center':[24,24],'radius':22}))
 for n,count in [('alarm',4),('bindung',4),('bindung_p2',4),('notladung',2)]:groups.append((n,[glyph(n,k) for k in range(count)],4,{'states':{'voll':0,'leer':1}} if n=='notladung' else {}))
 props=cut(src['props'],4,3,[3,3,4])
 # Keep identical scaling for all six door poses.
 doors=fit_frames(props[0]+props[1],32,48)
 groups.extend([('schleuse_zu',doors[:3],4,{}),('schleuse_auf',doors[3:],6,{'repeat':0}),('horchtrichter',fit_frames(props[2],32,32),5,{})])
 for n,count in [('richtungspfeil',4),('sprecher_1',1),('sprecher_2',1)]:groups.append((n,[glyph(n,k) for k in range(count)],4,{}))
 atlas('ui/ds_ruflinien.png',groups,192)
 # Journal exceptions 20x20 and 160x24 are padded to 16-aligned row origins.
 frame=Image.new('RGBA',(48,48));d=ImageDraw.Draw(frame);d.rectangle((0,0,47,47),fill=DARK,outline=BRASS,width=2);d.rectangle((4,4,43,43),outline=SLATE);d.rectangle((15,15,32,32),fill=DARK)
 for x,y in [(7,7),(40,7),(7,40),(40,40)]:d.rectangle((x-1,y-1,x+1,y+1),fill=BRASS)
 groups=[('rahmen',[frame],1,{'nineSlice':{'left':16,'right':16,'top':16,'bottom':16}})]
 for name,c in [('bekannt',BRASS),('geprueft',TURQ),('falsch',RUST)]:
  f=Image.new('RGBA',(20,20));d=ImageDraw.Draw(f);d.rectangle((0,0,19,19),outline=c);d.rectangle((1,1,18,18),outline=DARK)
  if name=='bekannt':d.line((7,0,12,0),fill=BONE)
  elif name=='geprueft':d.line([(13,17),(15,19),(19,14)],fill=c,width=2)
  else:d.line((15,15,19,19),fill=c);d.line((15,19,19,15),fill=c)
  groups.append(('muster_'+name,[f],1,{'contentRect':[2,2,16,16]}))
 groups.append(('tab_icon',[glyph('trichter',0)],1,{}))
 f=Image.new('RGBA',(160,24),DARK);d=ImageDraw.Draw(f);d.line((0,23,159,23),fill=SLATE);d.line((0,0,159,0),fill=GRAY)
 groups.append(('zeilenhintergrund',[f],1,{}));atlas('ui/ds_rufjournal.png',groups,160)
 manifest=dict(version=1,batch='dunscar4',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=PALETTE,alpha='binary 0/255',regionConvention='x/y is first frame; horizontal frame stride=frameWidth; all regions independent',assets=ASSETS)
 (OUT/'manifest-dunscar4.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 # Review board: every row at nearest-neighbor scale, labels outside assets.
 width=1200; boards=[]
 for asset in ASSETS:
  im=Image.open(OUT/asset['file']).convert('RGBA'); scale=min(4,max(1,1100//im.width)); show=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST)
  board=Image.new('RGB',(width,show.height+42),'#303640');d=ImageDraw.Draw(board);d.text((12,10),asset['file'],fill='#e7dfc5');board.paste(show,(12,32),show);boards.append(board)
 preview=Image.new('RGB',(width,sum(b.height for b in boards)))
 y=0
 for b in boards:preview.paste(b,(0,y));y+=b.height
 preview.save(ROOT/'docs/art/batch-dunscar4-preview.png')
 print(f'Exported {len(ASSETS)} PNGs; {sum(len(a.get("regions",[])) for a in ASSETS)} named regions')
if __name__=='__main__':main()
