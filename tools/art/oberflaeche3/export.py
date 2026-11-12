"""Export selected imagegen masters and exact font/touch assets.
Usage: python tools/art/oberflaeche3/export.py /path/to/dm-records.json
The raw generator masters live outside the repo; prompts/hashes are archived.
"""
import json,sys,hashlib,math
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites';HERE=Path(__file__).resolve().parent
records=json.loads(Path(sys.argv[1]).read_text());latest={r['file']:r for r in records}
ref=json.loads((SPR/'manifest-oberflaeche.json').read_text());palette=ref['palette'];rgb=[tuple(bytes.fromhex(s[1:])) for s in palette]
pal=Image.new('P',(1,1));pal.putpalette([v for c in rgb for v in c]+list(rgb[0])*(256-len(rgb)))
assets=[]
def quant(im,alpha):
 im=im.convert('RGBA');a=im.getchannel('A').point(lambda v:255 if v>=128 else 0) if alpha else Image.new('L',im.size,255)
 q=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE);q.paste(31,(0,0),ImageOps.invert(a))
 if alpha:q.info['transparency']=31
 return q

def save(file,im,alpha=False,cols=1,rows=1,**extra):
 q=quant(im,alpha);p=SPR/file;p.parent.mkdir(parents=True,exist_ok=True);q.save(p,optimize=True)
 w,h=im.size;a=dict(id='dm_'+file.replace('/','_').removesuffix('.png'),file=file,width=w,height=h,frameWidth=w//cols,frameHeight=h//rows,columns=cols,rows=rows,transparent=alpha,animations={},sha256=hashlib.sha256(p.read_bytes()).hexdigest(),**extra);assets.append(a);return q.convert('RGBA')

def fit(im,w,h,pad=1):
 b=im.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox()
 if b:im=im.crop(b)
 im=ImageOps.contain(im,(w-pad*2,h-pad*2),Image.Resampling.NEAREST);o=Image.new('RGBA',(w,h));o.paste(im,((w-im.width)//2,(h-im.height)//2));return o
for file,r in latest.items():
 im=Image.open(r['source']).convert('RGBA');w,h=r['w'],r['h'];cols=r.get('cols',1);rows=1
 if r.get('sourceCols'):
  sc,sr=r['sourceCols'],r['sourceRows'];result=Image.new('RGBA',(w,h));fw=w//cols
  for i in range(cols):
   x,y=i%sc,i//sc;p=im.crop((round(x*im.width/sc),round(y*im.height/sr),round((x+1)*im.width/sc),round((y+1)*im.height/sr)))
   if file=='ui/farben_symbole.png':
    bx=[0,.201,.367,.522,.665,.816,1];by=[0,.2,.4,.6,.8,1]
    p=im.crop((round((bx[x]+.008)*im.width),round((by[y]+.012)*im.height),round((bx[x+1]-.008)*im.width),round((by[y+1]-.012)*im.height)))
   p=fit(p,fw,h) if r['alpha'] else p.resize((fw,h),Image.Resampling.NEAREST)
   result.paste(p,(i*fw,0))
  im=result
 elif file.startswith('items/'):
  im=fit(im,w,h,2)
 else:im=im.resize((w,h),Image.Resampling.NEAREST)
 # Explicit empty text window and nine-slice interiors: no illustration beneath text.
 if file=='ui/abspann_rahmen.png':im.paste((0,0,0,0),(64,24,416,246))
 if file in ('ui/laden_rahmen.png','ui/spielstand_rahmen.png'):
  im.paste((*rgb[1],255),(8,8,40,40))
 if file=='ui/farben_symbole.png':
  # Shapes remain unchanged. Monochrome conversion guarantees no color-only coding.
  mask=im.getchannel('A').point(lambda v:255 if v>=128 else 0);light=im.convert('L').point(lambda v:255 if v>=125 else 0);im=Image.composite(Image.new('RGBA',im.size,(*rgb[25],255)),Image.new('RGBA',im.size,(*rgb[0],255)),light);im.putalpha(mask)
 im=save(file,im,r['alpha'],cols)
 if r.get('derive16'):save(r['derive16'],im.resize((16,16),Image.Resampling.NEAREST),True)
 if r.get('derive32'):save(r['derive32'],im.resize((w*2,h*2),Image.Resampling.NEAREST),True,cols)
# Retain exact meanings, states and regions of AE touch atlas at double size.
touch=next(a for a in ref['assets'] if a['file']=='ui/AE_touch.png')
save('ui/touch_icons_gross.png',Image.open(SPR/touch['file']).convert('RGBA').resize((640,128),Image.Resampling.NEAREST),True,10,2,regions={k:{n:v*2 for n,v in r.items()} for k,r in touch['regions'].items()},source=touch['file'])
# Direct fresh rasterization at 16px from vector outlines; no resized 8px glyphs.
fontpath=HERE/'PixelifySans.ttf';tt=TTFont(fontpath);charset=sorted(cp for cp in tt.getBestCmap() if cp>=32)
font=ImageFont.truetype(str(fontpath),16);fw,fh=24,24;fc=16;fr=math.ceil(len(charset)/fc)
atlas=Image.new('RGBA',(fw*fc,fh*fr));glyphs={}
for i,cp in enumerate(charset):
 char=chr(cp);tile=Image.new('1',(fw,fh));d=ImageDraw.Draw(tile);d.text((3,18),char,font=font,fill=1,anchor='ls',stroke_width=0)
 paint=Image.new('RGBA',tile.size,(*rgb[25],255));paint.putalpha(tile.convert('L'));x=(i%fc)*fw;y=(i//fc)*fh;atlas.paste(paint,(x,y))
 glyphs[char]={'codepoint':cp,'frame':i,'x':x,'y':y,'width':fw,'height':fh,'advance':round(font.getlength(char),3),'baseline':18,'bearingX':3,'empty':tile.getbbox() is None}
save('ui/schrift_gross.png',atlas,True,fc,fr,glyphs=glyphs,font={'family':'Pixelify Sans','weight':400,'baseSizePixels':8,'rasterSizePixels':16,'lineHeight':20,'baseline':18,'cell':[24,24],'source':'https://github.com/google/fonts/tree/main/ofl/pixelifysans','license':'SIL Open Font License 1.1','method':'Direct monochrome rasterization from font outlines at 16px; never scaled from small bitmap.','sourceSha256':hashlib.sha256(fontpath.read_bytes()).hexdigest(),'charset':'Complete printable Unicode cmap of the actual UI Webfont, including German umlauts and ß.'})
cities=['kettlegate','wexmoor','dunscar','calderwick','briarholt','varrowmouth']
post=['geschlossen','geoeffnet']+['siegel_'+c for c in cities]+['paket','antwort_gesendet','ohne_absender','foto_rahmen']
markers=['kapitel_'+str(i) for i in range(1,7)]+['koop','pfad_platz','sequenz_platz','nachspiel','verzicht','seq1']
shapes=['leben','nerven','unruhe','verdauung','gift','brand','gefesselt','geblendet','verzeichnet','gezeit_ebbe','gezeit_flut','beziehung_gut','beziehung_neutral','beziehung_schlecht','zirkel_stille_waage','zirkel_kreide','zirkel_russ','zirkel_lichtlose','zirkel_salz','zirkel_schichtbund']+['pfad_'+p for p in ['laterne','faden','maske','echo','kessel','eisen','schluessel','waage','moor','uhr']]
for a in assets:
 f=a['file'];fw,fh=a['frameWidth'],a['frameHeight']
 names=post if 'post_symbole' in f else markers if 'spielstand_marken' in f else shapes if 'farben_symbole' in f else cities if 'abspann_trenner' in f else ['pfeil','hand','fadenkreuz','verboten'] if 'cursor_gross' in f else []
 if names:a['regions']={n:{'x':i*fw,'y':0,'width':fw,'height':fh} for i,n in enumerate(names)};a['atlasIndex']={n:i for i,n in enumerate(names)}
 if f in ['ui/laden_rahmen.png','ui/spielstand_rahmen.png']:a['nineSlice']={'left':8,'top':8,'right':8,'bottom':8};a['contentRect']={'x':8,'y':8,'width':32,'height':32}
 if f=='ui/laden_punkte.png':a['animations']={'laden':{'frames':[0,1,2,3],'frameRate':4,'repeat':-1}}
 if f=='ui/abspann_schluss.png':a['animations']={'ausgehen':{'frames':list(range(8)),'frameRate':2,'repeat':0}}
 if f=='ui/abspann_rahmen.png':a['textWindow']={'x':64,'y':24,'width':352,'height':222}
 if f=='ui/abspann_dank.png':a['textWindow']={'x':40,'y':30,'width':160,'height':75}
 if f=='ui/farben_symbole.png':a['colorIndependent']=True
layers={}
for n,c in enumerate(cities,1):
 layers[c]={'chapter':n,'order':[{'file':f'ui/titel_k{n}_{layer}.png','parallax':p} for layer,p in [('himmel',0),('stadt',.25),('vordergrund',1),('nebel',.55)]],'titleSafeRect':{'x':150,'y':30,'width':180,'height':70},'postgameForeground':f'ui/titel_nachspiel_{n}.png'}
 if n==5:layers[c]['foregroundStates']={'kalt':'ui/titel_k5_vordergrund.png','warm':'ui/titel_k5_vordergrund_warm.png'}
 if n==6:layers[c]['skyStates']={'ebbe':'ui/titel_k6_himmel.png','flut':'ui/titel_k6_himmel_flut.png'}
manifest=dict(version=1,batch='oberflaeche3',codex='DM',status='exported; game integration separate',paletteMaxVisibleColors=31,palette=palette,assets=sorted(assets,key=lambda a:a['file']),titleLayers=layers,postgame={'sourceCommit':'ffde9aa715695e64a707d6dc27b8eb6c5aaaf708','source':'docs/story/nachspiel/zustaende.json','policy':'Six neutral morning foregrounds, one per city. No reopened institutions or repopulation asserted. For evacuated Calderwick / burned Varrowmouth, use with state-appropriate city backdrop supplied by integration; foreground alone does not alter world state.'},loadingIndex={str(i+1):{'city':cities[i//3],'subject':['strasse','innenraum','gegenstand'][i%3]} for i in range(18)}|{str(19+i):{'travel':v} for i,v in enumerate(['nachtzug','torfkahn','kuestenbahn','faehre','landstrasse','boot'])})
(SPR/'manifest-oberflaeche3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
generation=dict(batch='oberflaeche3',tool='image_gen.imagegen',postprocess='Nearest Neighbor; existing AE palette; binary alpha threshold128; individual atlas cells cropped and repacked; monochrome accessibility shapes; direct vector-font rasterization; AE touch2x.',attempts=[{k:v for k,v in r.items() if k!='source'}|{'sourceFile':Path(r['source']).name,'sourceSha256':hashlib.sha256(Path(r['source']).read_bytes()).hexdigest(),'selected':r is latest[r['file']]} for r in records])
(ROOT/'docs/art/batch-oberflaeche3-generation.json').write_text(json.dumps(generation,ensure_ascii=False,indent=2)+'\n');print('Exported',len(assets),'PNGs;',len(charset),'font glyphs')
