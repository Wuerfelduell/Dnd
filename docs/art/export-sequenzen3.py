"""Export image_gen originals for AG. Usage: python docs/art/export-sequenzen3.py JOB_LOG.json

Only technical postprocessing: cell crops, nearest-neighbor sizing, shared
palette, binary alpha. Requires Pillow and numpy. No generated replacement art.
"""
from pathlib import Path
import json, sys, re, hashlib
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/sprites'
DOC = ROOT / 'docs/art'
COLORS = ['#1a1c2c','#252b38','#425360','#586c78','#71858b','#95a5a5',
          '#413433','#715648','#92745a','#b3946e','#b4a079','#e0c9a1',
          '#eee2c5','#7d927e','#686850','#e8f0ff','#245b59','#36817a',
          '#6fe0d0','#886332','#e8b860','#d0a050','#78578f','#c8b0e8',
          '#884b60','#e07a8a','#4f713f','#9ad06a','#64788f','#a8b4c0',
          '#92a6b2','#6a4a8a']
PAL = np.array([tuple(bytes.fromhex(c[1:])) for c in COLORS], dtype=np.int32)
NN = Image.Resampling.NEAREST

def binary(im):
    im = im.convert('RGBA')
    im.putalpha(im.getchannel('A').point(lambda a: 255 if a >= 200 else 0))
    return im

def indexed(im):
    a = np.asarray(im.convert('RGBA'))
    rgb = a[:,:,:3].astype(np.int32)
    ix = ((rgb[:,:,None,:]-PAL[None,None,:,:])**2).sum(3).argmin(2).astype('uint8')+1
    ix[a[:,:,3] < 200] = 0
    out = Image.fromarray(ix, 'P')
    p = [0,0,0] + PAL.flatten().tolist()
    out.putpalette(p+[0]*(768-len(p)))
    out.info['transparency'] = 0
    return out

def fit(im, w, h, pad=1):
    im = binary(im)
    bb = im.getbbox()
    assert bb, 'empty source'
    im = im.crop(bb)
    scale = min((w-2*pad)/im.width, (h-2*pad)/im.height)
    im = im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))), NN)
    out = Image.new('RGBA',(w,h))
    out.paste(im,((w-im.width)//2,(h-im.height)//2))
    return out

def main(log_path):
    data = json.loads(Path(log_path).read_text())
    jobs = data['jobs'] if isinstance(data, dict) else data
    if isinstance(data, dict):
        assert len(sys.argv) > 2, 'Supply directory containing the original generated PNG files'
        for j in jobs:
            j['source'] = str(Path(sys.argv[2]) / j['sourceFile'])
    assets = []
    for j in jobs:
        source = Path(j['source'])
        raw = Image.open(source).convert('RGBA')
        j['sourceFile'] = source.name
        j['sourceSha256'] = hashlib.sha256(source.read_bytes()).hexdigest()
        j['sourceSize'] = list(raw.size)
        j['outputFiles'] = []
        def emit(id, file, im, fw=None, fh=None, animations=None, **extra):
            target = OUT/file
            target.parent.mkdir(parents=True,exist_ok=True)
            im = indexed(im)
            im.save(target,optimize=True)
            fw,fh = fw or im.width,fh or im.height
            has_alpha = im.convert('RGBA').getchannel('A').getextrema()[0] == 0
            a = dict(id=id,file=file,width=im.width,height=im.height,transparent=has_alpha,
                     frameWidth=fw,frameHeight=fh,columns=im.width//fw,rows=im.height//fh)
            if animations: a['animations'] = animations
            a.update(extra)
            assets.append(a)
            j['outputFiles'].append(file)
        id,kind = j['id'],j['kind']
        if kind.startswith(('Kampf','Aura')):
            count = int(re.search(r'(\d+) Frames',kind)[1])
            fw,fh = (48,64) if kind.startswith('Aura') else (48,48)
            boxes = [[round(i*raw.width/count),0,round((i+1)*raw.width/count),raw.height] for i in range(count)]
            parts = [binary(raw.crop(b)) for b in boxes]
            bbs = [p.getbbox() for p in parts]
            assert all(bbs), id
            bb = (min(b[0] for b in bbs),min(b[1] for b in bbs),max(b[2] for b in bbs),max(b[3] for b in bbs))
            level = int(re.search(r'Intensitätsstufe (\d+)',j['description'])[1]) if kind.startswith('Kampf') else None
            limit = 19+3*level if level else 46
            scale = min(limit/(bb[2]-bb[0]),(limit if level else 24)/(bb[3]-bb[1]))
            wh = (max(1,round((bb[2]-bb[0])*scale)),max(1,round((bb[3]-bb[1])*scale)))
            sheet = Image.new('RGBA',(fw*count,fh))
            for i,p in enumerate(parts):
                sheet.paste(p.crop(bb).resize(wh,NN),(i*fw+(fw-wh[0])//2,(fh-wh[1])//2 if level else fh-2-wh[1]))
            j['sourceCropBoxes'],j['sharedSourceFrameRect'] = boxes,list(bb)
            rate = 8 if level is None else 12
            emit(id,'fx/'+('sq_' if level else '')+id+'.png',sheet,fw,fh,
                 {'loop' if level is None else 'cast':dict(frames=list(range(count)),frameRate=rate,repeat=-1 if level is None else 0)},
                 **({'intensityLevel':level} if level else {}))
        elif kind.startswith('Pfad'):
            # The clock source contains three size previews. Select the largest.
            if id == 'sq_uhr':
                j['iconCropBox'] = [1300,0,raw.width,raw.height]
                raw = raw.crop(j['iconCropBox'])
            for size in (16,32,64):
                emit(id+'_'+str(size),f'pathways/emblem_{id}_{size}.png',fit(raw,size,size))
        elif kind == 'card' or kind == 'ritual':
            # Preserve the existing card's exact blank parchment/frame as requested.
            template = Image.open(OUT/'pathways/card_laterne.png').convert('RGBA')
            scene = raw.crop(j.get('sceneBox',[0,0,raw.width,raw.height])).resize((88,56),NN)
            scene.putalpha(255)
            template.paste(scene,(4,7))
            emit(id,'pathways/'+id+'.png',template)
        elif kind == 'player':
            boxes = [[round(c*raw.width/6),round(r*raw.height/3),round((c+1)*raw.width/6),round((r+1)*raw.height/3)] for r in range(3) for c in range(6)]
            parts = [binary(raw.crop(b)) for b in boxes]
            bbs = [p.getbbox() for p in parts]
            assert all(bbs),id
            scale = min(44/max(b[2]-b[0] for b in bbs),43/max(b[3]-b[1] for b in bbs))
            sheet = Image.new('RGBA',(288,144))
            for i,(p,bb) in enumerate(zip(parts,bbs)):
                p=p.crop(bb);p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),NN)
                sheet.paste(p,((i%6)*48+(48-p.width)//2,(i//6)*48+45-p.height))
            j['sourceCropBoxes']=boxes
            emit(id,'battle/'+id+'.png',sheet,48,48,
                 {pid:dict(frames=list(range(i*6,i*6+6)),frameRate=10,repeat=0) for i,pid in enumerate(['sq_waage','sq_moor','sq_uhr'])},
                 facing='right',baselineExclusive=45)
        else:
            for size in (16,32):
                emit(id+('_32' if size==32 else ''),'items/'+('32/' if size==32 else '')+id+'.png',fit(raw,size,size))
    manifest=dict(version=1,batch='sequenzen3',status='art export; runtime integration separate',paletteMaxVisibleColors=32,palette=COLORS,assets=assets)
    (OUT/'manifest-sequenzen3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    for j in jobs:
        j.pop('source',None)
        j['references']=[p.split('/dnd/')[-1] if '/dnd/' in p else Path(p).name for p in j['references']]
    (DOC/'batch-sequenzen3-generation.json').write_text(json.dumps(dict(batch='sequenzen3',generator='image_gen',alphaThreshold=200,palette=COLORS,jobs=jobs),ensure_ascii=False,indent=2)+'\n')
    print(f'Exported {len(assets)} PNGs from {len(jobs)} originals.')

if __name__ == '__main__': main(sys.argv[1])
