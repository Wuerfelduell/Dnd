"""Export CY's imagegen masters; no procedural replacement artwork.

--prepare ingests original generator files recorded in tasks.json once.
Normal runs need only Pillow and the committed normalized RGBA masters.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
ART = ROOT / 'docs/art'
SPR = ROOT / 'public/sprites'
GEN = ART / 'batch-varrowmouth3-generation.json'
NN = Image.Resampling.NEAREST
EMOTIONS = ['neutral', 'suspicious', 'shocked', 'smiling', 'angry', 'sad', 'thoughtful', 'determined']

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def blank(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))

def geometry(t):
    kind = t['kind']
    if kind == 'walk': return 16, 32, 4, 4, 16
    if kind == 'emotions':
        n = 8 if t['id'] in FIXED else 4
        return 64, 64, 4, n // 4, n
    if kind == 'poses':
        n = sum(a[1] for a in t['animations'])
        return 16, 32, n, 1, n
    if kind == 'battle': return 128, t['frameHeight'], 6, 6, 36
    return 64, 64, 8, 1, 8

FIXED = ['vmn_tam_verrin', 'vmn_osric_dale', 'vmn_nell_quarrie', 'vmn_pegelherrin'] + [f'vmn_rat_{i}' for i in range(1, 8)]

def clean(im, threshold=128):
    im = im.convert('RGBA')
    a = im.getchannel('A').point(lambda p: 255 if p >= threshold else 0)
    im.putalpha(a)
    # Clear hidden RGB as well, preserving the generator's opaque pixels.
    out = blank(*im.size)
    out.paste(im, (0, 0), a)
    return out

def prepare():
    tasks = json.loads((HERE / 'tasks.json').read_text())
    palette = json.loads((SPR / 'manifest-wexmoor7.json').read_text())['palette']
    (HERE / 'sources').mkdir(exist_ok=True)
    for t in tasks:
        source = Path(t['source'])
        im = clean(Image.open(source))
        w, h, cols, rows, count = geometry(t)
        sc = t.get('sourceColumns', 4)
        sr = t.get('sourceRows', 4 if t['kind'] == 'walk' else rows)
        boxes = [tuple(round(v) for v in (c*im.width/sc, r*im.height/sr, (c+1)*im.width/sc, (r+1)*im.height/sr)) for r in range(sr) for c in range(sc)]
        # Tam's actual generated layout is four rowing cells then five action cells.
        if t['id'] == 'vmn_tam_verrin' and t['kind'] == 'poses':
            boxes = [(round(c*im.width/4),0,round((c+1)*im.width/4),round(im.height/3)) for c in range(4)]
            xs = [0, .19, .405, .62, .80, 1]
            boxes += [(round(xs[c]*im.width), round(im.height/3), round(xs[c+1]*im.width),round(im.height*2/3)) for c in range(5)]
        # Normalize the source onto the destination grid at 2x resolution.
        master = blank(w*cols*2, h*rows*2)
        pose_scales = {}
        if t['kind'] == 'poses':
            start = 0
            for _, length in t['animations']:
                bounds = [im.crop(b).getchannel('A').getbbox() for b in boxes[start:start+length]]
                maxw = max(b[2]-b[0] for b in bounds)
                maxh = max(b[3]-b[1] for b in bounds)
                scale = min(28/maxw, (44 if t['id']=='vmn_nell_quarrie' else 56)/maxh)
                for j in range(start,start+length): pose_scales[j]=scale
                start += length
        for n, box in enumerate(boxes[:count]):
            cell = im.crop(box)
            bb = cell.getchannel('A').getbbox()
            if not bb: raise ValueError(f'Empty generated frame: {t["id"]}/{t["kind"]}/{n}')
            if t['kind'] in ('walk', 'emotions'):
                cell = cell.crop(bb)
                maxw, maxh = (28, 56) if t['kind'] == 'walk' else (124, 124)
                if t['kind'] == 'walk' and t['id'] == 'vmn_nell_quarrie': maxw, maxh = 24, 44
                scale = min(maxw/cell.width, maxh/cell.height)
                cell = cell.resize((max(1,round(cell.width*scale)), max(1,round(cell.height*scale))), NN)
                x = (w*2-cell.width)//2
                y = 62-cell.height if t['kind'] == 'walk' else 126-cell.height
            elif t['kind'] == 'poses':
                # One uniform scale per animation preserves body proportions and
                # height changes (diver surfacing, Osric collapsing).
                cell = cell.crop(bb)
                scale = pose_scales[n]
                cell = cell.resize((max(1,round(cell.width*scale)), max(1,round(cell.height*scale))), NN)
                x, y = (32-cell.width)//2, 62-cell.height
            else:
                cell = cell.resize((w*2-8, h*2-8), NN)
                x, y = 4, 4
            master.paste(cell, ((n % cols)*w*2+x, (n//cols)*h*2+y))
        name = f'{t["id"]}_{t["kind"]}.png'
        dest = HERE / 'sources' / name
        master.save(dest)
        t['sourceFile'] = source.name
        t['sourceSha256'] = sha(source)
        t['sourceSize'] = list(im.size)
        t['sourceRegions'] = [list(b) for b in boxes[:count]]
        t['master'] = str(dest.relative_to(ROOT))
        t['masterSha256'] = sha(dest)
        t.pop('source', None)
        t.pop('editSource', None)
        for revision in t.get('revisions', []):
            p = Path(revision.pop('source'))
            revision.update(sourceFile=p.name, sourceSha256=sha(p))
    GEN.write_text(json.dumps({'batch':'varrowmouth3','generator':'built-in image_gen','palette':palette,
        'referenceFiles':['public/sprites/manifest-wexmoor7.json','public/sprites/characters/wxn_hafenmeisterin_walk.png'],
        'characterBrief':'CY fallback descriptions; docs/story/k6_figuren/figuren.md absent at start',
        'processing':['Nearest-neighbor normalization at 2x target resolution','Alpha threshold 128; clear hidden RGB','Nearest-neighbor target export','Map to shared Wexmoor 32-color palette','Attack anticipation duplicate; Pegelherrin waterline uses fixed silhouette and colour changes only'],
        'emotionFormatResolution':'64x64 cells take precedence: eight=256x128, four=256x64; brief total dimensions were inconsistent',
        'assets':tasks},ensure_ascii=False,indent=2)+'\n')

def export():
    gen = json.loads(GEN.read_text())
    pal = [tuple(bytes.fromhex(c[1:])) for c in gen['palette']]
    ref = Image.new('P',(1,1))
    ref.putpalette([x for c in pal for x in c] + list(pal[0])*(256-len(pal)))
    assets=[]
    def save(im, file, kind, game_id, fw, fh, columns, rows, animations=None, **extra):
        im = clean(im)
        idx = im.convert('RGB').quantize(palette=ref,dither=Image.Dither.NONE)
        # Transparency is an additional index, not a 33rd visible colour.
        data = bytearray(idx.tobytes())
        for i,a in enumerate(im.getchannel('A').tobytes()):
            if not a: data[i] = 32
        idx = Image.frombytes('P',im.size,bytes(data))
        idx.putpalette([x for c in pal for x in c] + [0,0,0]*(256-len(pal)))
        p=SPR/file; p.parent.mkdir(parents=True,exist_ok=True)
        idx.save(p,transparency=32,optimize=False)
        entry={'id':game_id+'_'+kind,'gameId':game_id,'file':file,'kind':kind,'width':im.width,'height':im.height,
               'frameWidth':fw,'frameHeight':fh,'columns':columns,'rows':rows,'transparent':True,'emptyFrames':[],
               'animations':animations or {},'sha256':sha(p),**extra}
        assets.append(entry)
    for t in gen['assets']:
        w,h,c,r,n=geometry(t)
        im=Image.open(ROOT/t['master']).convert('RGBA').resize((w*c,h*r),NN)
        k=t['kind']; id=t['id']
        if k=='walk':
            save(im,f'characters/{id}.png',k,id,w,h,c,r,
                 {d:{'frames':list(range(j*4,j*4+4)),'frameRate':8,'repeat':-1} for j,d in enumerate(['down','left','right','up'])},baseline=30)
        elif k=='emotions':
            save(im,f'portraits/{id}_emotions.png',k,id,w,h,c,r,frameNames=EMOTIONS[:n],
                 regions={name:{'x':j%4*64,'y':j//4*64,'width':64,'height':64} for j,name in enumerate(EMOTIONS[:n])})
            portrait=im.crop((0,0,64,64))
            save(portrait,f'portraits/{id}.png','portrait',id,64,64,1,1,derivedFrom=f'portraits/{id}_emotions.png',sourceRegion={'x':0,'y':0,'width':64,'height':64})
            head=blank(24,24); head.paste(portrait.crop((8,0,56,48)).resize((22,22),NN),(1,1))
            save(head,f'portraits/heads/{id}.png','head',id,24,24,1,1,derivedFrom=f'portraits/{id}.png',sourceRegion={'x':8,'y':0,'width':48,'height':48},inset=1)
        elif k=='poses':
            # The brief explicitly requires a stationary colour-only waterline.
            if id=='vmn_pegelherrin':
                base=im.crop((6*16,0,7*16,32))
                for j,level in enumerate([29,26,23,20,17,14]):
                    frame=base.copy()
                    for y in range(level,30):
                        for x in range(4,12):
                            rr,gg,bb,aa=frame.getpixel((x,y))
                            if aa and max(rr,gg,bb)-min(rr,gg,bb)<42:
                                frame.putpixel((x,y),(37,43,56,aa))
                    im.paste(frame,((6+j)*16,0))
            animations={};start=0
            for name,count in t['animations']:
                animations[name]={'frames':list(range(start,start+count)),'frameRate':6,'repeat':-1 if name in ['rudern','schreiben','glocke','stempeln','fisch_ausnehmen','staken','pegeluhr_schrauben'] else 0}
                start+=count
            save(im,f'characters/{id}_posen.png',k,id,w,h,c,r,animations,baseline=30)
        elif k=='battle':
            for row in [1,2]:
                im.paste(im.crop((0,row*h,w,(row+1)*h)),(w,row*h))
            save(im,f'battle/{id}.png',k,'pegelherrin' if t['phase']==1 else 'pegelherrin_register',w,h,c,r,
                 {name:{'frames':list(range(j*6,j*6+6)),'frameRate':6 if name=='idle' else 8,'repeat':-1 if name=='idle' else 0} for j,name in enumerate(['idle','attack1','attack2','special','hurt','defeated'])},phase=t['phase'],holdFramePairs=[[6,7],[12,13]],anchor={'x':64,'y':h-2})
        else:
            save(im,'fx/vm_namenslinien.png',k,id,w,h,c,r,{'hit':{'frames':list(range(8)),'frameRate':12,'repeat':0}})
    manifest={'version':1,'batch':'varrowmouth3','status':'exported; runtime integration pending','paletteMaxVisibleColors':32,'palette':gen['palette'],
              'emotionFormatResolution':gen['emotionFormatResolution'],'assets':assets}
    (SPR/'manifest-varrowmouth3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(f'Exported {len(assets)} runtime PNGs')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--prepare',action='store_true');args=parser.parse_args()
    if args.prepare:prepare()
    export()
