"""Export imagegen originals supplied as --sources JSON; no generation or drawing."""
import argparse,json,hashlib
from pathlib import Path
from collections import Counter
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[3]
P=ROOT/'public/sprites'
NN=Image.Resampling.NEAREST
names=['kamin_klein','kamin_mittel','kamin_gross','kerze','leuchter','petroleumlampe','pendeluhr','kanarienkaefig','schreibmaschine','kessel','wasserhahn','lampenfliegen','katze','hund','schaukelstuhl','zugvorhang','ventilator','grammophon','fernschreiber']
sets=['buero','revier','laden','akademie','speisewagen','lohnbuero']
scenes=['brief','kassenbuch','zeitung','wandanschlag','kalkbrett','telegramm','sternkarte','lohnzettel','kinderzeichnung','tagebuch']
ref=Image.open(P/'props/05_03_furniture.png').convert('RGBA')
colors=[x for x,n in Counter(px[:3] for px in ref.getdata() if px[3]>127).most_common()]+[(111,224,208),(87,62,112),(196,157,114)]
colors=colors[:31]
pal=Image.new('P',(1,1));flat=[0,0,0]+[v for c in colors for v in c];pal.putpalette(flat+[0]*(768-len(flat)))
def binary(im):
 im=im.convert('RGBA');im.putalpha(im.getchannel('A').point(lambda a:255 if a>=192 else 0));return im

def indexed(im,opaque=False):
 im=im.convert('RGBA');mask=im.getchannel('A').point(lambda a:255 if opaque or a>=192 else 0)
 # Explicit nearest colour avoids quantizer selecting reserved transparent black.
 cache={};out=[]
 for rgba,a in zip(im.getdata(),mask.getdata()):
  if not a:out.append(0);continue
  rgb=rgba[:3]
  if rgb not in cache:cache[rgb]=min(range(len(colors)),key=lambda j:sum((rgb[k]-colors[j][k])**2 for k in range(3)))+1
  out.append(cache[rgb])
 p=Image.new('P',im.size);p.putpalette(pal.getpalette());p.putdata(out);p.info['transparency']=0;return p

def put(im,file):
 f=P/file;f.parent.mkdir(parents=True,exist_ok=True);im.save(f,optimize=True)

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--sources',required=True);args=ap.parse_args()
 jobs=json.loads(Path(args.sources).read_text());assets=[];logs=[]
 for job in jobs:
  id=job['id'];raw=Image.open(job['source']).convert('RGBA');w,h=raw.size
  logs.append({'id':id,'prompt':job['prompt'],'sourceFile':Path(job['source']).name,'sourceSha256':hashlib.sha256(Path(job['source']).read_bytes()).hexdigest(),'sourceSize':[w,h]})
  if job.get('discardedAttempt'):
   prior=job['discardedAttempt'];logs[-1]['discardedAttempt']={'prompt':prior['prompt'],'sourceFile':Path(prior['source']).name,'reason':prior['reason']}
  if id=='anim':
   # Imagegen supplied uneven row heights; transparent horizontal gutters delimit subjects.
   a=binary(raw);counts=[sum(a.getpixel((x,y))[3]>0 for x in range(w)) for y in range(h)]
   spans=[];start=None
   for y,n in enumerate(counts+[0]):
    if n>=5 and start is None:start=y
    if n<5 and start is not None:spans.append([start,y]);start=None
   # Ignore tiny disconnected antialias flecks, combine nearby segments within the same object.
   groups=[]
   for lo,hi in spans:
    if groups and lo-groups[-1][1]<4:groups[-1][1]=hi
    else:groups.append([lo,hi])
   groups=[g for g in groups if g[1]-g[0]>12]
   assert len(groups)==20,groups
   atlas=Image.new('RGBA',(128,32*len(names)))
   anim={};regions={}
   for row,(name,(lo,hi)) in enumerate(zip(names,groups)):
    crops=[]
    for col in range(4):
     tile=a.crop((round(w*col/4),lo,round(w*(col+1)/4),hi));box=tile.getbbox();assert box
     crops.append(tile.crop(box))
    # Same scale for all four poses, shared groundline; do not normalize frames independently.
    extent=14 if name in ['kamin_klein','kerze','petroleumlampe','wasserhahn'] else 23 if name=='kamin_mittel' else 28
    scale=min(extent/max(t.width for t in crops),extent/max(t.height for t in crops))
    for col,t in enumerate(crops):
     t=t.resize((max(1,round(t.width*scale)),max(1,round(t.height*scale))),NN)
     atlas.alpha_composite(t,(col*32+(32-t.width)//2,row*32+30-t.height))
    fps=3 if name in ['katze','hund','pendeluhr'] else 6
    anim[name]={'frames':list(range(row*4,row*4+4)),'frameRate':fps,'repeat':-1}
    regions[name]={'x':0,'y':row*32,'width':128,'height':32,'frameWidth':32,'frameHeight':32,'columns':4,'rows':1,'anchor':[16,30]}
   put(indexed(atlas),'props/innen2_anim.png')
   assets.append({'id':'innen2_anim','file':'props/innen2_anim.png','width':128,'height':608,'transparent':True,'frameWidth':32,'frameHeight':32,'columns':4,'rows':19,'animations':anim,'regions':regions})
  elif id in sets:
   out=binary(raw).resize((128,64),NN)
   if id=='buero':
    # Preserve the generated coat rack as one tall prop instead of leaving cell 17 empty.
    rack=binary(raw.crop((0,h//2,w//8,3*h//4))).resize((16,32),NN)
    stool=out.crop((0,48,16,64));out.paste(rack,(0,32));out.paste(stool,(16,32))
   for k in range(4):
    # Inset in each generated swatch removes transparent margins and produces edge-to-edge wall tile.
    box=(int(w*(4+k)/8+w/8*.12),int(h*.75+h/4*.12),int(w*(5+k)/8-w/8*.12),int(h-h/4*.12))
    tile=raw.crop(box).convert('RGB').resize((16,16),NN).convert('RGBA');out.paste(tile,((4+k)*16,48))
   # Empty generator cells become useful repeatable cabinet/shelf edge tiles from this same sheet.
   for j in range(28):
    box=(j%8*16,j//8*16,j%8*16+16,j//8*16+16)
    if out.crop(box).getbbox() is None:
     source=2+(j%2)
     out.paste(out.crop((source*16,16,source*16+16,32)),(box[0],box[1]))
   file=f'props/innen2_moebel_{id}.png';put(indexed(out),file)
   reg={f'zelle_{i:02}':{'x':i%8*16,'y':i//8*16,'width':16,'height':16} for i in range(32)}
   objects={'buero':[('aktenregal',0,0,48,32),('pinnwand',48,0,32,32),('schreibtisch',80,0,48,32),('garderobe',0,32,16,32),('waschtisch',32,32,32,16)],'revier':[('zelle',0,0,32,32),('pult',32,0,32,32),('asservaten',64,0,32,32),('wartebank',96,0,32,32)],'laden':[('theke',0,0,32,32),('warenregal',32,0,32,32),('glasregal',64,0,32,32),('vitrine',96,0,32,32),('kasse',0,32,32,32),('waage',32,32,32,32)],'akademie':[('sternglobus',0,0,32,32),('fernrohr',32,0,32,32),('karten',64,0,32,32),('lesepult',96,0,32,32)],'speisewagen':[('polsterbank',0,0,32,32),('klapptisch',32,0,32,32),('samowar',64,0,32,32),('gepaecknetz',96,0,32,32)],'lohnbuero':[('schalter',0,0,32,32),('lohnbrett',32,0,32,32),('stempeluhr',64,0,32,32),('kalkbrett',96,0,32,32)]}
   for n,x,y,rw,rh in objects[id]:reg[n]={'x':x,'y':y,'width':rw,'height':rh}
   for k,n in enumerate(['tapete','taefelung','kalk','blech']):reg[n]={'x':(4+k)*16,'y':48,'width':16,'height':16}
   assets.append({'id':'innen2_moebel_'+id,'file':file,'width':128,'height':64,'transparent':True,'frameWidth':16,'frameHeight':16,'columns':8,'rows':4,'regions':reg,'animations':{}})
  else:
   file='ui/scenes/lese_'+id+'.png';out=indexed(raw.resize((240,135),NN),True);put(out,file)
   assets.append({'id':'lese_'+id,'file':file,'width':240,'height':135,'transparent':False,'frameWidth':240,'frameHeight':135,'columns':1,'rows':1,'regions':{'scene':{'x':0,'y':0,'width':240,'height':135}},'animations':{}})
 manifest={'version':1,'batch':'innen2','status':'exported; runtime integration pending','paletteMaxVisibleColors':31,'palette':['#%02x%02x%02x'%c for c in colors],'assets':assets}
 (P/'manifest-innen2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 doc=ROOT/'docs/art';doc.mkdir(exist_ok=True)
 (doc/'batch-innen2-generation.json').write_text(json.dumps({'batch':'innen2','generator':'built-in image_gen','reference':'public/sprites/props/05_03_furniture.png','processing':'Pillow: source gutter segmentation; shared animation scale and baseline; nearest-neighbor resize; common 31-colour palette plus transparent index 0; alpha threshold 192; wall swatches cropped to opaque interiors; unused furniture cells filled with modular shelf fragments from the same generated sheet. No procedural replacement art. Extra generated ember row excluded.','jobs':logs},ensure_ascii=False,indent=2)+'\n')
 # Contact preview with labels outside the deliverable images.
 preview=Image.new('RGB',(1000,1300),(37,43,59));draw=ImageDraw.Draw(preview)
 draw.text((16,8),'BW / innen2 - animation, furniture and reading scenes',fill=(222,216,200))
 anim=Image.open(P/'props/innen2_anim.png').convert('RGBA')
 for r,name in enumerate(names):
  x=16+(r%7)*140;y=38+(r//7)*90
  t=anim.crop((0,r*32,32,r*32+32)).resize((64,64),NN);preview.paste(t,(x,y),t);draw.text((x,y+64),name,fill=(222,216,200))
 for k,id in enumerate(sets):
  f=P/f'props/innen2_moebel_{id}.png'
  if not f.exists():continue
  t=Image.open(f).convert('RGBA').resize((256,128),NN);x=16+(k%3)*328;y=330+(k//3)*165;preview.paste(t,(x,y),t);draw.text((x,y+132),id,fill=(222,216,200))
 for k,id in enumerate(scenes):
  f=P/f'ui/scenes/lese_{id}.png'
  if not f.exists():continue
  t=Image.open(f).convert('RGB');x=10+(k%4)*247;y=680+(k//4)*170;preview.paste(t,(x,y));draw.text((x,y+140),id,fill=(222,216,200))
 preview.save(doc/'preview-innen2.png')
 print('Exported',len(assets),'assets')
if __name__=='__main__':main()
