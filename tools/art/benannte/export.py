"""Export generated DJ source atlases. Usage: python export.py /path/to/art-results.jsonl.
Raw generation is outside git; prompts, source hashes and export geometry are recorded.
Only NN resampling, palette quantization, binary alpha and held-frame duplication.
"""
from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,hashlib
import numpy as np
from collections import deque
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites';ART=ROOT/'docs/art'
palette=json.loads((SPR/'manifest-fasserin.json').read_text())['palette']
rgb=[tuple(bytes.fromhex(h[1:])) for h in palette]
palim=Image.new('P',(1,1));palim.putpalette([x for c in rgb for x in c]+list(rgb[0])*(256-len(rgb)))
gen=json.loads((ART/'batch-benannte-generation.json').read_text());jobs=gen['jobs'];results={x['id']:Path(x['path']) for x in map(json.loads,Path(sys.argv[1]).read_text().splitlines())}
assets=[];sources=[]
def normalize(im):
 im=im.convert('RGBA')
 # Some generated sources have a uniform matte. Remove only connected edge matte,
 # never interior colors or the sprite silhouette; alpha remains binary.
 arr=np.array(im);h,w=arr.shape[:2];edge=np.concatenate([arr[0],arr[-1],arr[:,0],arr[:,-1]])
 if (edge[:,3]>=160).mean()>.8:
  color=np.median(edge[:,:3],axis=0);dist=np.max(np.abs(arr[:,:,:3].astype(float)-color),axis=2);mask=dist<28
  seen=np.zeros((h,w),bool);todo=deque([(0,x) for x in range(w)]+[(h-1,x) for x in range(w)]+[(y,0) for y in range(h)]+[(y,w-1) for y in range(h)])
  while todo:
   y,x=todo.popleft()
   if seen[y,x] or not mask[y,x]:continue
   seen[y,x]=True
   for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
    yy,xx=y+dy,x+dx
    if 0<=yy<h and 0<=xx<w and not seen[yy,xx]:todo.append((yy,xx))
  arr[seen,3]=0
  if (color>220).all():arr[mask,3]=0
  im=Image.fromarray(arr)
 alpha=im.getchannel('A').point(lambda x:255 if x>=160 else 0);q=im.convert('RGB').quantize(palette=palim,dither=Image.Dither.NONE).convert('RGBA');q.putalpha(alpha);return q

def region(im,x,y,w,h,cols=6,rows=7):
 return im.crop((round(x*im.width/cols),round(y*im.height/rows),round((x+w)*im.width/cols),round((y+h)*im.height/rows)))

def cuts(im,count,total=None):
 # Find actual clear gutters near nominal row boundaries, avoiding cut-off heads.
 a=np.array(im.getchannel('A'));profile=(a>=160).sum(axis=1);step=im.height/(total or count)
 result=[0]
 for r in range(1,count):
  target=step*r;lo=max(result[-1]+1,round(target-step*.48));hi=min(im.height-1,round(target+step*.48))
  gaps=[];start=None
  for y in range(lo,hi+1):
   if profile[y]<=4 and start is None:start=y
   if (profile[y]>4 or y==hi) and start is not None:
    end=y;gaps.append((start,end));start=None
  gaps=[g for g in gaps if g[1]-g[0]>=3]
  result.append(round(sum(min(gaps,key=lambda g:abs((g[0]+g[1])/2-target)))/2) if gaps else round(target))
 result.append(im.height);return result

def fitted(im,w,h,pad=2,baseline=None,scale=None):
 im=normalize(im);box=im.getbbox();out=Image.new('RGBA',(w,h))
 if not box:return out
 im=im.crop(box);s=scale if scale else min((w-pad*2)/im.width,(h-pad*2)/im.height)
 tw=max(1,min(w-pad*2,round(im.width*s)));th=max(1,min(h-pad*2,round(im.height*s)));im=im.resize((tw,th),Image.Resampling.NEAREST)
 box=im.getbbox()
 if box:im=im.crop(box);tw,th=im.size
 out.alpha_composite(im,((w-tw)//2,(baseline-th+1) if baseline is not None else (h-th)//2));return out

def record(file,im,fw,fh,cols,rows,kind,animations=None,**kw):
 p=SPR/file;p.parent.mkdir(parents=True,exist_ok=True)
 indexed=im.convert('RGB').quantize(palette=palim,dither=Image.Dither.NONE);ix=np.array(indexed);ix[np.array(im.getchannel('A'))==0]=32;indexed=Image.fromarray(ix).convert('P');indexed.putpalette([v for c in rgb for v in c]+[0]*(768-len(rgb)*3));indexed.save(p,transparency=32,optimize=True)
 a=dict(id=("head_" if kind=="head" else "bestiar_" if kind=="bestiary" else "")+p.stem+("_32" if file.startswith("items/32/") else ""),file=file,width=im.width,height=im.height,frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,kind=kind,transparent=True,regions={'full':{'x':0,'y':0,'width':im.width,'height':im.height}},**kw)
 if animations:a['animations']=animations
 assets.append(a)

def anim(frames,fps=8,loop=False):return dict(frames=frames,frameRate=fps,repeat=-1 if loop else 0)
for j in jobs:
 id=j['id']
 if id not in results:continue
 p=results[id];im=Image.open(p).convert('RGBA');n=j['cell'];sources.append({'id':id,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sourceSize':list(im.size),'layout':[6,7]})
 yc=cuts(im.crop((0,0,round(im.width/3),im.height)),6,total=7)
 if id=='bn_die_witwe_auf_stelzen':yc=[round(y*im.height/1354) for y in [0,175,350,525,700,865,1354]]
 sources[-1]['rowCuts']=yc
 def battlecell(c,r):return im.crop((round(c*im.width/6),yc[r],round((c+1)*im.width/6),yc[r+1]))
 frames=[normalize(battlecell(c,r)) for r in range(5) for c in range(6)]
 boxes=[f.getbbox() for f in frames];sizes=[(b[2]-b[0],b[3]-b[1]) for b in boxes if b];scale=min((n-6)/max(x[0] for x in sizes),(n-6)/max(x[1] for x in sizes))
 sheet=Image.new('RGBA',(n*6,n*5))
 rendered=[fitted(f,n,n,pad=2,baseline=n-3,scale=scale) for f in frames]
 for row in [1,2]:rendered[row*6+1]=rendered[row*6].copy()
 for k,f in enumerate(rendered):sheet.alpha_composite(f,((k%6)*n,(k//6)*n))
 record('battle/enemy_'+id+'.png',sheet,n,n,6,5,'battle',{name:anim(list(range(r*6,r*6+6)),8,name=='idle') for r,name in enumerate(['idle','attack1','attack2','hurt','defeated'])},gameId=id,baseline=n-3,heldRows=[1,2])
 record('ui/bestiar/'+id+'.png',fitted(battlecell(0,5),64,64),64,64,1,1,'bestiary',gameId=id)
 record('portraits/heads/'+id+'.png',fitted(battlecell(1,5),24,24,pad=1),24,24,1,1,'head',gameId=id)
 walk=im.crop((round(im.width*4/6),yc[5],im.width,im.height));wy=cuts(walk,4)
 if id=='bn_die_witwe_auf_stelzen':wy=[round(y*walk.height/489) for y in [0,115,225,345,489]]
 sources[-1]['walkRowCuts']=wy
 sheet=Image.new('RGBA',(64,128))
 for r in range(4):
  for c in range(4):sheet.alpha_composite(fitted(walk.crop((round(c*walk.width/4),wy[r],round((c+1)*walk.width/4),wy[r+1])),16,32,pad=1,baseline=30),(c*16,r*32))
 record('characters/'+id+'.png',sheet,16,32,4,4,'walk',{name:anim(list(range(r*4,r*4+4)),6,True) for r,name in enumerate(['down','left','right','up'])},gameId=id,baseline=30)
for id,p in results.items():
 if not id.startswith('item_'):continue
 im=Image.open(p).convert('RGBA')
 if id=='item_zollkrone':
  arr=np.array(im);arr[(arr[:,:,:3]>210).all(axis=2),3]=0;im=Image.fromarray(arr)
 key=id[5:];sources.append({'id':id,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sourceSize':list(im.size),'layout':[2,1]})
 for col,prefix in enumerate(['bnl_','fa_bnl_']):
  for size,folder in [(16,'items/'),(32,'items/32/')]:record(folder+prefix+key+'.png',fitted(region(im,col,0,1,1,2,1),size,size,pad=1 if size==16 else 2),size,size,1,1,'item')
if 'fx_bn_auftritt' in results:
 p=results['fx_bn_auftritt'];im=Image.open(p).convert('RGBA');arr=np.array(im);arr[(arr[:,:,:3]>210).all(axis=2),3]=0;im=Image.fromarray(arr);sheet=Image.new('RGBA',(768,96))
 for k in range(8):sheet.alpha_composite(normalize(region(im,k%4,k//4,1,1,4,2).resize((96,96),Image.Resampling.NEAREST)),(96*k,0))
 record('fx/bn_auftritt.png',sheet,96,96,8,1,'fx',{'appear':anim(list(range(8)),10)})
 sources.append({'id':'fx_bn_auftritt','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sourceSize':list(im.size),'layout':[4,2]})
if 'ui_bn_symbole' in results:
 p=results['ui_bn_symbole'];im=Image.open(p).convert('RGBA');sheet=Image.new('RGBA',(80,16))
 for k in range(5):sheet.alpha_composite(fitted(region(im,k,0,1,1,5,1),16,16,pad=1),(k*16,0))
 record('ui/bn_symbole.png',sheet,16,16,5,1,'ui',symbols=['gesichtet','besiegt','beute','bestiarium_neu','fasserin_tauglich'])
 sources.append({'id':'ui_bn_symbole','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sourceSize':list(im.size),'layout':[5,1]})
manifest=dict(version=1,batch='benannte',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=palette,assets=assets)
(SPR/'manifest-benannte.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
gen['generatedSources']=sources;extra=Path(sys.argv[1]).parent/'extra-jobs.json'
if extra.exists():gen['extraJobs']=json.loads(extra.read_text())
(ART/'batch-benannte-generation.json').write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n')
preview=Image.new('RGB',(960,7*160),(35,40,49));draw=ImageDraw.Draw(preview)
for i,j in enumerate(jobs):
 p=SPR/('ui/bestiar/'+j['id']+'.png')
 if not p.exists():continue
 x=i%6*160;y=i//6*160;im=Image.open(p).convert('RGBA').resize((128,128),Image.Resampling.NEAREST);preview.paste(im,(x+16,y),im);draw.text((x+4,y+130),j['id'][3:24],fill=(220,214,191))
for i,a in enumerate([a for a in assets if a['kind']=='item' and a['frameWidth']==32]):
 im=Image.open(SPR/a['file']).convert('RGBA').resize((64,64),Image.Resampling.NEAREST);x=i%8*120+28;y=660+i//8*120;preview.paste(im,(x,y),im);draw.text((x-18,y+70),a['id'][:18],fill=(220,214,191))
for a in assets:
 if a['kind'] in ['fx','ui']:
  im=Image.open(SPR/a['file']).convert('RGBA');preview.paste(im,(20,920 if a['kind']=='fx' else 1030),im)
preview.quantize(colors=64,dither=Image.Dither.NONE).save(ART/'batch-benannte-preview.png',optimize=True)
print(f'Export: {len(assets)}/130 PNGs, {len(sources)}/34 generation sources.')
