"""Technical export of image_gen artwork; never draws substitute artwork.

Usage: python tools/art/sekten/export.py docs/art/batch-sekten-generation.json /path/to/generated_images
"""
import json
import sys
import hashlib
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/sprites'
COLORS = ['1a1c2c','252b38','303b49','425360','586c78','71858b','95a5a5',
          '2d2629','413433','58433c','715648','92745a','b3946e','cfb18a','e0c9a1',
          '494b3a','686850','8b8870','b4ac91','dbd2b3','eee2c5',
          '245b59','36817a','6fe0d0','886332','ba8942','743d42','ae6050',
          '493653','745482','a48baa']
PAL = Image.new('P',(1,1))
RGB = [tuple(bytes.fromhex(c)) for c in COLORS]
PAL.putpalette([v for c in RGB for v in c] + list(RGB[-1])*(256-len(RGB)))

def indexed(im):
    im = im.convert('RGBA')
    alpha = im.getchannel('A').point(lambda a: 255 if a >= 128 else 0)
    q = im.convert('RGB').quantize(palette=PAL, dither=Image.Dither.NONE)
    # Keep index zero exclusively transparent; visible colors use 1..31.
    pixels = bytes((p+1 if a else 0) for p,a in zip(q.tobytes(),alpha.tobytes()))
    out = Image.frombytes('P', im.size, pixels)
    out.putpalette([0,0,0] + [v for c in RGB for v in c] + [0]*(768-96))
    out.info['transparency'] = 0
    return out

def save(im, file):
    path = OUT/file
    path.parent.mkdir(parents=True,exist_ok=True)
    image=indexed(im)
    # The Stumme Chor's supernatural accent is violet throughout the batch.
    if 'chor' in file or 'stimmwachs' in file:
        table=list(range(256))
        table[22],table[23],table[24]=29,30,31
        image=image.point(table)
    image.save(path, optimize=False, transparency=0)

def anim(frames, fps=8, loop=False):
    return {'frames':list(frames),'frameRate':fps,'repeat':-1 if loop else 0}

def export(spec_path, source_dir=None):
    spec = json.loads(Path(spec_path).read_text())
    jobs = spec['jobs'] if isinstance(spec,dict) else spec
    if source_dir:
        for j in jobs: j['source']=str(Path(source_dir)/Path(j['source']).name)
    assert all(j.get('source') for j in jobs), 'Missing generated source'
    assets=[]
    for j in jobs:
        src=Image.open(j['source']).convert('RGBA')
        im=src.resize((j['width'],j['height']),Image.Resampling.NEAREST)
        fw,fh,cols,rows=j['frameWidth'],j['frameHeight'],j['columns'],j['rows']
        kind=j['kind']
        if kind=='shrine_fx':
            continue
        if kind=='walk':
            # Normalize source cell framing without stretching character proportions.
            cells=[src.crop((round(c*src.width/4),round(r*src.height/4),round((c+1)*src.width/4),round((r+1)*src.height/4))) for r in range(4) for c in range(4)]
            boxes=[cell.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox() for cell in cells]
            box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
            ratio=min(14/(box[2]-box[0]),30/(box[3]-box[1]))
            size=(max(1,round((box[2]-box[0])*ratio)),max(1,round((box[3]-box[1])*ratio)))
            im=Image.new('RGBA',(64,128))
            for i,cell in enumerate(cells):
                frame=cell.crop(box).resize(size,Image.Resampling.NEAREST)
                im.paste(frame,(i%4*16+(16-size[0])//2,i//4*32+31-size[1]))
        if kind=='item':
            bbox=src.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
            assert bbox, j['id']+' has empty source'
            cropped=src.crop(bbox)
            ratio=min(14/cropped.width,14/cropped.height)
            cropped=cropped.resize((max(1,round(cropped.width*ratio)),max(1,round(cropped.height*ratio))),Image.Resampling.NEAREST)
            im=Image.new('RGBA',(16,16));im.paste(cropped,((16-cropped.width)//2,(16-cropped.height)//2))
        a={k:j[k] for k in ['id','file','width','height','frameWidth','frameHeight','columns','rows']}
        a.update(transparent=True,kind=kind,animations={})
        if kind=='walk':
            a['animations']={name:anim(range(r*4,r*4+4),8,True) for r,name in enumerate(['down','left','right','up'])}
        elif kind=='battle':
            counts=[4,6,3,4]+([6] if rows==5 else [])
            for r,count in enumerate(counts):
                im.paste((0,0,0,0),(count*fw,r*fh,cols*fw,(r+1)*fh))
            im.paste(im.crop((0,fh,fw,fh*2)),(fw,fh))
            names=['idle','attack','hit','end']+(['phase2'] if rows==5 else [])
            a['animations']={name:anim(range(r*6,r*6+counts[r]),6 if name=='idle' else 9,name=='idle') for r,name in enumerate(names)}
            a.update(facing='left',nonlethal=True,emptyFrames=[r*6+c for r,n in enumerate(counts) for c in range(n,6)],identicalFrames=[[6,7]])
        elif kind=='aura':
            a['animations']={'loop':anim(range(4),7,True)}
            a['characterAnchor']={'x':8,'y':8,'width':16,'height':32}
        elif kind=='portrait':
            a['animations']={n:anim([i],1) for i,n in enumerate(['neutral','misstrauisch','erschrocken','leichtes_laecheln'])}
        elif kind=='events':
            a['animations']={n:anim(range(r*6,r*6+6),10) for r,n in enumerate(['asche','flut','chor'])}
        elif kind=='hud':
            a['regions']={cult:{stage:[c*16,r*16,16,16] for c,stage in enumerate(['0','1','2','3','niedergeschlagen'])} for r,cult in enumerate(['asche','flut','chor'])}
        elif kind=='pins':
            a['regions']={cult:{state:[c*12,r*12,12,12] for r,state in enumerate(['normal','aktiv'])} for c,cult in enumerate(['asche','flut','chor'])}
        elif kind=='tiles':
            if j['id']=='sk_zeichen':
                names=['asche_kreis','asche_tuerrahmen','asche_russhand','asche_entfernt','flut_knoten','flut_fussspur','flut_bojenmarke','flut_entfernt','chor_kreidemund','chor_notenlinie','chor_lippen','chor_entfernt']
            else:
                names=['brunnen','laterne','faehre','bahnhebel','briefkasten','boje','chorplatz','haus']
            a['regions']={n:[i%cols*fw,i//cols*fh,fw,fh] for i,n in enumerate(names)}
        elif kind=='shrine':
            fxj=next(x for x in jobs if x['id']==j['id']+'_fx')
            fx=Image.open(fxj['source']).convert('RGBA').resize((64,16),Image.Resampling.NEAREST)
            sheet=Image.new('RGBA',(64,64)); sheet.paste(im,(0,0)); sheet.paste(fx,(0,48)); im=sheet
            a.update(width=64,height=64,frameWidth=16,frameHeight=16,columns=4,rows=4)
            a['regions']={'base':[0,0,48,48],'effect':[0,48,64,16]}
            a['animations']={'loop':anim(range(12,16),7,True)}
            a['effectAnchor']={'x':16,'y':16}
        save(im,j['file']); assets.append(a)
        if kind=='item':
            file=j['file'].replace('items/','items/32/')
            save(im.resize((32,32),Image.Resampling.NEAREST),file)
            assets.append(dict(a,id=j['id']+'_32',file=file,width=32,height=32,frameWidth=32,frameHeight=32,derivedFrom=j['file']))
        if kind=='portrait':
            file='portraits/heads/'+j['id'].removesuffix('_emotions')+'.png'
            head=im.crop((8,0,56,48)).resize((24,24),Image.Resampling.NEAREST)
            save(head,file)
            assets.append(dict(id=j['id'].removesuffix('_emotions')+'_head',file=file,width=24,height=24,frameWidth=24,frameHeight=24,columns=1,rows=1,transparent=True,kind='head',derivedFrom=j['file'],animations={}))
    manifest={'version':1,'batch':'sekten','status':'exported; runtime integration pending','paletteMaxVisibleColors':31,'palette':['#'+c for c in COLORS],'assets':assets}
    (OUT/'manifest-sekten.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    provenance={'generator':'Built-in image_gen','date':'2026-11-11','brief':'docs/story/sekten/grafik_briefe.md','postprocessing':'Nearest Neighbor; walk cells share alpha bounds and fit 14x30 without aspect distortion; item alpha bounding boxes fit within 14x14 pixels; Chor turquoise accents remapped to violet; shared 31-color palette; binary alpha threshold 128; transparent padding; duplicate attack anticipation frame; 32px icons are 2x exports; heads derive from neutral portraits; shrine regions packed without rescaling base.','jobs':[]}
    for j in jobs:
        entry=dict(j); entry['source']=Path(j['source']).name;entry['sourceSha256']=hashlib.sha256(Path(j['source']).read_bytes()).hexdigest(); provenance['jobs'].append(entry)
    (ROOT/'docs/art/batch-sekten-generation.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
    # Contact sheet: one representative frame of every delivered asset.
    cellw,cellh=192,184; ncols=6
    preview=Image.new('RGB',(cellw*ncols,((len(assets)+ncols-1)//ncols)*cellh),'#303b49'); draw=ImageDraw.Draw(preview)
    for i,a in enumerate(assets):
        im=Image.open(OUT/a['file']).convert('RGBA')
        if a['kind']=='shrine': im=im.crop((0,0,48,48))
        else: im=im.crop((0,0,a['frameWidth'],a['frameHeight']))
        scale=max(1,min(4,160//im.width,148//im.height))
        im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST)
        x=i%ncols*cellw;y=i//ncols*cellh
        preview.paste(im,(x+(cellw-im.width)//2,y+5),im)
        label=a['id'];draw.text((x+5,y+155),label[:27],fill='#eee2c5');draw.text((x+5,y+168),label[27:],fill='#eee2c5')
    preview.save(ROOT/'docs/art/preview-sekten.png')
    print(f'Exported {len(assets)} assets from {len(jobs)} image_gen sources')

if __name__=='__main__': export(sys.argv[1],sys.argv[2] if len(sys.argv)>2 else None)
