#!/usr/bin/env python3
"""Export Batch H. Usage: python docs/art/export-journal.py SOURCE_DIR [REPO_ROOT].
Requires Pillow and numpy. Source filenames and prompts: batch-journal-generation.json.
"""
from pathlib import Path
import sys,json,hashlib
from PIL import Image,ImageDraw
import numpy as np

ROOT=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parents[2]
SRC=Path(sys.argv[1]); OUT=ROOT/'public/sprites'
spec=json.loads((ROOT/'docs/art/batch-journal-generation.json').read_text())
PAL=[tuple(bytes.fromhex(h.lstrip('#'))) for h in spec['palette']]
palette_image=Image.new('P',(1,1));palette_image.putpalette(sum((list(c) for c in PAL),[])+[0]*(768-len(PAL)*3))
sources={g['id']:g for g in spec['generations']}
assets=[];NN=Image.Resampling.NEAREST

def source(name):
    return Image.open(SRC/sources[name]['source']).convert('RGBA')

def binary(im,threshold=128):
    im=im.copy();im.putalpha(im.getchannel('A').point(lambda a:255 if a>=threshold else 0));return im

def cell(im,c,r,cols,rows):
    w,h=im.size
    return im.crop((round(c*w/cols),round(r*h/rows),round((c+1)*w/cols),round((r+1)*h/rows)))

def fit(im,size,pad=1,bottom=False):
    im=binary(im);box=im.getbbox();target=Image.new('RGBA',size)
    if not box:return target
    im=im.crop(box);w,h=size
    scale=min((w-pad*2)/im.width,(h-pad*2)/im.height)
    im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN)
    target.alpha_composite(im,((w-im.width)//2,h-pad-im.height if bottom else (h-im.height)//2))
    return target

def save(file,im,id=None,transparent=True,**meta):
    im=binary(im)
    if not transparent: im.putalpha(255)
    rgb=im.convert('RGB').quantize(palette=palette_image,dither=Image.Dither.NONE)
    indices=np.array(rgb);alpha=np.array(im.getchannel('A'))
    # Index zero belongs exclusively to transparency; visible colors start at one.
    indices[(alpha>0)&(indices==0)]=1
    indices[alpha==0]=0
    out=Image.fromarray(indices.astype('uint8'),'P');out.putpalette(palette_image.getpalette())
    p=OUT/file;p.parent.mkdir(parents=True,exist_ok=True)
    out.info['transparency']=0
    out.save(p,transparency=0,optimize=False)
    assets.append(dict(id=id or Path(file).stem,file=file,width=im.width,height=im.height,transparent=transparent,**meta))
    return out.convert('RGBA')

groups=[
['marlowe','holt','pimm','rook','price','barnaby','fenwick','kit'],
['elias','greta','halloway','ivy','hester','anselm','moll','agnes'],
['pip','tobias','maud','silas','ned','quill','ambrose','wick'],
['grimes','nell','kittering','gorse','sabeth','brock','diva','souffleur'],
['maskenmacher','uhrmacherin','turmwaechter','schlachtermeister','lehrling','gaswerker','astronom','miriam'],
['player','cultist','nate','unknown_man','unknown_woman','anonymous','crowd','spirit']]
for n,ids in enumerate(groups,1):
    raw=source('heads'+str(n));sheet=Image.new('RGBA',(192,24))
    for i,id in enumerate(ids):
        im=cell(raw,i%4,i//4,4,2)
        if id=='player':im=cell(source('heads6_corrected'),0,0,4,2)
        icon=fit(im,(24,24),1,True)
        icon=save('ui/heads/'+id+'.png',icon,'head_'+id,frameWidth=24,frameHeight=24,columns=1,rows=1)
        sheet.alpha_composite(icon,(i*24,0))
    save(f'ui/H_koepfe_{n}.png',sheet,frameWidth=24,frameHeight=24,columns=8,rows=1,frameNames=ids)

ids=['brief','buch','tagebuch','foto','archivakte','belauscht','inschrift','kreide','beleg','karte']
raw=source('sources');sheet=Image.new('RGBA',(240,40));regions={}
for i,id in enumerate(ids):
    base=cell(raw,i%5,i//5,5,2)
    for sz,y in [(16,0),(24,16)]:
        icon=save('ui/sources/'+('24/' if sz==24 else '')+id+'.png',fit(base,(sz,sz)),f'source_{id}_{sz}',frameWidth=sz,frameHeight=sz,columns=1,rows=1)
        sheet.alpha_composite(icon,(i*sz,y));regions[f'{id}_{sz}']=[i*sz,y,sz,sz]
save('ui/H_quellen.png',sheet,regions=regions)

raw=source('frames');w,h=raw.size;sheet=Image.new('RGBA',(128,64));regions={}
names=['photo','photo_unreliable','document','string_straight','string_corner','string_pin','same_source','contradicts']
rects=[(0,0,32,36),(32,0,32,36),(64,0,32,32),(96,0,16,16),(112,0,16,16),(96,16,16,16),(112,16,16,16),(96,32,16,16)]
for i,(name,rect) in enumerate(zip(names,rects)):
    x,y,sw,sh=rect
    # Working atlas first row is taller, with five smaller markers below/right.
    bounds=(round(i%4*w/4),0 if i<4 else round(h*.66),round((i%4+1)*w/4),round(h*.66) if i<4 else h)
    im=fit(raw.crop(bounds),(sw,sh),0)
    if i<3:
        # Required, deterministic 24px head/document apertures.
        a=im.getchannel('A');ImageDraw.Draw(a).rectangle((4,6 if i<2 else 4,27,29 if i<2 else 27),fill=0);im.putalpha(a)
    sheet.alpha_composite(im,(x,y));regions[name]=list(rect)
save('ui/H_journal_rahmen.png',sheet,regions=regions,apertures={'photo':[4,6,24,24],'photo_unreliable':[36,6,24,24],'document':[68,4,24,24]})

raw=source('items')
for i,id in enumerate(['verlorenes_gesangbuch','spiegelscherbe']):
    for sz in [16,32]:
        save('items/'+('32/' if sz==32 else '')+id+'.png',fit(cell(raw,i,0,2,1),(sz,sz)),f'item_{id}_{sz}',frameWidth=sz,frameHeight=sz,columns=1,rows=1)

for id in ['verlorenes_gesangbuch','spiegelscherbe','glocke','stimmphiole','sternsplitter','taschenuhr']:
    for suffix in ['','_fluch']:
        name=id+suffix
        save('ui/inspect/'+name+'.png',source('inspect_'+name).resize((160,120),NN),'inspect_'+name,False,frameWidth=160,frameHeight=120,columns=1,rows=1)

raw=source('effects');sheet=Image.new('RGBA',(2880,1080))
for r,count in enumerate([6,6,4,6]):
    for c in range(count):
        im=cell(raw,c,r,6,4).resize((480,270),NN)
        # Low-opacity generator haze is discarded; sparse bonus rays use a lower cutoff.
        im=binary(im,32 if r==3 else 128)
        if r<2:
            a=im.getchannel('A');ImageDraw.Draw(a).rectangle((96,54,383,215),fill=0);im.putalpha(a)
        sheet.alpha_composite(im,(c*480,r*270))
animations={name:dict(frames=list(range(r*6,r*6+n)),frameRate=fps,repeat=repeat) for r,(name,n,fps,repeat) in enumerate([('unrest',6,6,-1),('curse',6,10,0),('ambush',4,14,0),('bonus_clue',6,8,0)])}
save('fx/H_06_risiko.png',sheet,frameWidth=480,frameHeight=270,columns=6,rows=4,animations=animations,clearCenter=[96,54,288,162],paddingFrames=[16,17])

raw=source('risk_icons');sheet=Image.new('RGBA',(80,24));regions={}
for i,id in enumerate(['unrest','curse','ambush','bonus_clue','safe','risk_low','risk_medium','risk_high']):
    sz=16 if i<5 else 8;x=i*16 if i<5 else (i-5)*8;y=0 if i<5 else 16
    im=fit(cell(raw,i%4,i//4,4,2),(sz,sz),1)
    sheet.alpha_composite(im,(x,y));regions[id]=[x,y,sz,sz]
save('ui/H_06_risiko_icons.png',sheet,regions=regions)

raw=source('player');sheet=Image.new('RGBA',(96,128))
for r,count in enumerate([6,4,4,4]):
    for c in range(count):
        im=fit(cell(raw,c,r,6,4),(16,32),1,True)
        sheet.alpha_composite(im,(c*16,r*32))
animations={name:dict(frames=list(range(r*6,r*6+n)),frameRate=fps,repeat=0) for r,(name,n,fps) in enumerate([('read',6,6),('flinch',4,10),('clutch_head',4,7),('note',4,6)])}
save('characters/H_player_untersuchen.png',sheet,frameWidth=16,frameHeight=32,columns=6,rows=4,facing='down',baselineY=30,animations=animations,paddingFrames=[10,11,16,17,22,23])

raw=source('props');w,h=raw.size;sheet=Image.new('RGBA',(96,32));regions={}
names=['counter','shelves','evidence_bag','cursed_box','receipt_book','returned_tag']
rects=[(0,0,32,32),(32,0,32,32),(64,0,16,16),(80,0,16,16),(64,16,16,16),(80,16,16,16)]
for i,(name,rect) in enumerate(zip(names,rects)):
    x,y,sw,sh=rect
    # Hand-checked split below the counter and shelves.
    bounds=[(35,15,535,570),(560,20,1055,565),(1100,195,1430,550),(100,655,475,1000),(595,655,925,1000),(1055,680,1450,975)][i]
    sheet.alpha_composite(fit(raw.crop(bounds),(sw,sh),1,True),(x,y));regions[name]=list(rect)
save('props/H_07_fundbuero.png',sheet,regions=regions)

manifest=dict(version=1,batch='journal',status='exported; runtime integration pending',paletteMaxVisibleColors=31,palette=spec['palette'][1:],assets=assets)
(OUT/'manifest-journal.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(assets)} PNGs')
