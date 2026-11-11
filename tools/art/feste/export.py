#!/usr/bin/env python3
"""BV: import imagegen sheets, then reproducibly export with Pillow only.

python tools/art/feste/export.py --import-records /path/to/records.json
python tools/art/feste/export.py  # rebuild from committed normalized sources
"""
from pathlib import Path
from collections import deque
import argparse
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
CATALOG = json.loads((ROOT / 'tools/art/feste/catalog.json').read_text())
GEN = ROOT / 'docs/art/batch-feste-generation.json'
# Shared with the existing vorrat3 sprites, excluding the saturated pink.
PALETTE = ['#1a1c2c','#252b38','#425360','#586c78','#71858b','#95a5a5',
 '#413433','#715648','#92745a','#b3946e','#b4a079','#e0c9a1','#eee2c5',
 '#7d927e','#686850','#e8f0ff','#245b59','#36817a','#6fe0d0','#886332',
 '#e8b860','#d0a050','#78578f','#c8b0e8','#884b60','#4f713f','#9ad06a',
 '#64788f','#a8b4c0','#92a6b2','#6a4a8a']
RGB = [tuple(bytes.fromhex(c[1:])) for c in PALETTE]
NEAREST = Image.Resampling.NEAREST

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def clean_alpha(im, threshold=240):
    """Drop soft halos; flood only connected neutral bright matte from edges.

    Enclosed pale snow, paper and skin highlights survive the matte flood.
    No painted replacement pixels or invented animation frames.
    """
    im = im.convert('RGBA')
    w, h = im.size
    pixels = list(im.getdata())
    candidate = [a < threshold or (min(r,g,b) > 205 and max(r,g,b)-min(r,g,b) < 16)
                 for r,g,b,a in pixels]
    seen = set()
    queue = deque()
    for y in range(h):
        for x in (0,w-1):
            i = y*w+x
            if candidate[i] and i not in seen: seen.add(i); queue.append(i)
    for x in range(w):
        for y in (0,h-1):
            i = y*w+x
            if candidate[i] and i not in seen: seen.add(i); queue.append(i)
    while queue:
        i = queue.popleft(); x,y = i%w,i//w
        for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            n = ny*w+nx
            if 0 <= nx < w and 0 <= ny < h and candidate[n] and n not in seen:
                seen.add(n); queue.append(n)
    im.putdata([(r,g,b,255) if a >= threshold and i not in seen else (0,0,0,0)
                for i,(r,g,b,a) in enumerate(pixels)])
    return im

def normalize(record, spec):
    source = Path(record['raw'])
    im = Image.open(source).convert('RGBA')
    fw,fh,cols,rows = (spec[k] for k in ('fw','fh','cols','rows'))
    scale = 4
    master = Image.new('RGBA',(fw*cols*scale,fh*rows*scale))
    bounds = []
    for y in range(rows):
        for x in range(cols):
            box = (round(x*im.width/cols), round(y*im.height/rows),
                   round((x+1)*im.width/cols), round((y+1)*im.height/rows))
            cell = im.crop(box)
            if spec['kind'] == 'scene':
                cell.putalpha(255)
                out = cell.resize((fw*scale,fh*scale), NEAREST)
                crop = None
            elif spec['kind'] == 'loop' and fw >= 64:
                out = clean_alpha(cell.resize((fw*scale,fh*scale), NEAREST),128)
                crop = None
            else:
                # Analyze at a compact resolution, retaining hard nearest samples.
                ratio = min(1, 320/max(cell.size))
                cell = clean_alpha(cell.resize(tuple(max(1,round(v*ratio)) for v in cell.size),NEAREST))
                crop = cell.getchannel('A').getbbox()
                if crop is None: raise ValueError('Empty source cell: '+spec['id'])
                cell = cell.crop(crop)
                out = Image.new('RGBA',(fw*scale,fh*scale))
                if spec['kind'] == 'banner':
                    size = ((fw-2)*scale,(fh-2)*scale)
                else:
                    max_height = fh-4 if spec['kind']=='walk' else fh-2
                    ratio = min((fw-2)*scale/cell.width,max_height*scale/cell.height)
                    size = (max(1,round(cell.width*ratio)),max(1,round(cell.height*ratio)))
                cell = cell.resize(size,NEAREST)
                dx = (out.width-cell.width)//2
                dy = (30*scale-cell.height) if spec['kind']=='walk' else (out.height-cell.height)//2
                out.paste(cell,(dx,dy))
            master.paste(out,(x*fw*scale,y*fh*scale))
            bounds.append({'sourceCell':box,'alphaCropAt320':crop})
    path = ROOT / f"docs/art/feste-sources/{spec['id']}.png"
    indexed(master).save(path,optimize=True)
    return {'id':spec['id'],'prompt':record['prompt'],
            'referenceFiles':[] if spec['id'].endswith('_gerede') else ['docs/art/batch-dunscar4-preview.png'],
            'source':str(path.relative_to(ROOT)), 'sourceSha256':sha(path),
            'originalFile':source.name,'originalSha256':sha(source),'originalSize':list(im.size),
            'normalization':bounds}

def indexed(im):
    """Palette index 0 is transparent; indices 1..31 are the common colors."""
    out = Image.new('P',im.size)
    out.putpalette([0,0,0]+[v for color in RGB for v in color]+[0]*((256-32)*3))
    cache = {}
    result = []
    for r,g,b,a in im.convert('RGBA').getdata():
        if a < 128: result.append(0); continue
        color = (r,g,b)
        if color not in cache:
            cache[color] = 1+min(range(len(RGB)),key=lambda i:sum((color[j]-RGB[i][j])**2 for j in range(3)))
        result.append(cache[color])
    out.putdata(result); out.info['transparency'] = 0
    return out

def asset(spec,path):
    fw,fh,cols,rows = (spec[k] for k in ('fw','fh','cols','rows'))
    animations = {}
    if spec['kind']=='walk':
        animations = {d:{'frames':list(range(i*4,i*4+4)),'frameRate':7,'repeat':-1}
                      for i,d in enumerate(('down','left','right','up'))}
    elif spec['kind']=='loop':
        animations = {'loop':{'frames':list(range(cols*rows)),'frameRate':6 if fw<480 else 3,'repeat':-1}}
    else:
        animations = {n:{'frames':[i],'frameRate':0,'repeat':0}
                      for i,n in enumerate(spec['names'] or ['still'])}
    if spec['id']=='laternennacht_props':
        for i,color in enumerate(('bein','rost','schiefer','moos')):
            animations['laterne_'+color]={'frames':[i*2,i*2+1],'frameRate':3,'repeat':-1}
    regions = {n:{'x':(i%cols)*fw,'y':(i//cols)*fh,'width':fw,'height':fh,'frame':i}
               for i,n in enumerate(spec['names'])}
    a = {'id':'feste_'+spec['id'],'file':spec['file'],'width':fw*cols,'height':fh*rows,
         'frameWidth':fw,'frameHeight':fh,'columns':cols,'rows':rows,
         'transparent':spec['kind']!='scene','animations':animations,'regions':regions,
         'sha256':sha(path)}
    if spec['kind']=='walk': a['baseline']=30
    if spec['kind']=='banner': a['textSafeRect']={'x':58,'y':8,'width':96,'height':16}
    if 'fassaden' in spec['id']:
        a['cityRows']={'kettlegate':0,'wexmoor':1,'dunscar':2}
    if spec['id']=='sommer_hitzeflimmern':
        a['usage']='Sparse color overlay only; actual screen refraction needs a future shader.'
    return a

def preview(assets):
    cols, cw, ch = 3, 520, 330
    canvas = Image.new('RGB',(cols*cw,50+((len(assets)+cols-1)//cols)*ch),'#252b38')
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',12)
    except OSError:
        font = ImageFont.load_default()
    draw.text((16,14),'BV / Jahreszeiten und Feste / 41 Sheets / NN vergroessert',font=font,fill='#eee2c5')
    for i,a in enumerate(assets):
        x,y = (i%cols)*cw,(i//cols)*ch+50
        draw.text((x+10,y+8),a['file'],font=font,fill='#eee2c5')
        for yy in range(y+32,y+ch-8,16):
            for xx in range(x+8,x+cw-8,16):
                draw.rectangle((xx,yy,xx+15,yy+15),fill='#586c78' if ((xx-x)//16+(yy-y)//16)%2 else '#425360')
        im = Image.open(ROOT/'public/sprites'/a['file']).convert('RGBA')
        zoom = max(1,min((cw-24)//im.width,(ch-48)//im.height,4))
        if im.width > cw-24 or im.height > ch-48:
            # Wide heat sheet: show first frame, preserving its complete 480x270 area.
            im = im.crop((0,0,a['frameWidth'],a['frameHeight']))
        im = im.resize((im.width*zoom,im.height*zoom),NEAREST)
        canvas.paste(im,(x+12,y+36),im)
    canvas.save(ROOT/'docs/art/preview-feste.png',optimize=True)

def main():
    p=argparse.ArgumentParser();p.add_argument('--import-records');args=p.parse_args()
    if args.import_records:
        records={r['id']:r for r in json.loads(Path(args.import_records).read_text())}
        gen={'batch':'feste','generator':'image_gen built-in','date':'2026-11-11',
             'palette':PALETTE,'paletteReference':'tools/art/vorrat3/export.py',
             'processing':'Per-cell nearest-neighbor sampling; alpha >=240 (sparse 64px+ FX >=128); boundary-connected bright neutral matte removal; fit with transparent gutter; walk baseline30 and max height28; common indexed palette31 + transparency. No painted animation frames.',
             'records':[normalize(records[s['id']],s) for s in CATALOG]}
        GEN.write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n')
    gen=json.loads(GEN.read_text());records={r['id']:r for r in gen['records']}
    assets=[]
    for s in CATALOG:
        r=records[s['id']];src=ROOT/r['source']
        if sha(src)!=r['sourceSha256']: raise ValueError('Source hash mismatch: '+s['id'])
        im=Image.open(src).convert('RGBA').resize((s['fw']*s['cols'],s['fh']*s['rows']),NEAREST)
        path=ROOT/'public/sprites'/s['file'];path.parent.mkdir(parents=True,exist_ok=True)
        indexed(im).save(path,optimize=True)
        assets.append(asset(s,path))
    manifest={'version':1,'batch':'feste','status':'exported; runtime integration pending',
              'paletteMaxVisibleColors':31,'paletteTotalIncludingTransparency':32,
              'optionalAssetsIncluded':False,'assets':assets}
    (ROOT/'public/sprites/manifest-feste.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    preview(assets)
    print(f'Exported {len(assets)} sheets; {sum(a["columns"]*a["rows"] for a in assets)} frames')

if __name__=='__main__':main()
