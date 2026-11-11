"""Rebuild BY icons from committed masters; requires Pillow.

Use --import-dir for local imagegen records containing id, prompt and raw path.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse, hashlib, json, re

ROOT = Path(__file__).resolve().parents[3]
GEN = ROOT / 'docs/art/batch-nerven-artefakte-generation.json'
MANIFEST = ROOT / 'public/sprites/manifest-nerven-artefakte.json'
SOURCE = ROOT / 'docs/art/nerven-artefakte-sources'
PAL = ['#1a1c2c','#252b38','#425360','#586c78','#71858b','#95a5a5','#413433','#715648','#92745a','#b3946e','#b4a079','#e0c9a1','#eee2c5','#7d927e','#686850','#e8f0ff','#245b59','#36817a','#6fe0d0','#886332','#e8b860','#d0a050','#78578f','#c8b0e8','#884b60','#e07a8a','#4f713f','#9ad06a','#64788f','#a8b4c0','#92a6b2','#6a4a8a']
RGB = [tuple(bytes.fromhex(c[1:])) for c in PAL]
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def pixels(im):
    return im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()

def catalog():
    task = (ROOT/'docs/art/codex_BY_nerven_artefakte_grafik.md').read_text()
    return re.findall(r'\| `([^`]+)` \| ([^|]+) \| ([^|]+) \|', task)

def import_sources(folder):
    SOURCE.mkdir(parents=True, exist_ok=True)
    records = {r['id']: r for p in Path(folder).glob('*.json') for r in [json.loads(p.read_text())]}
    result = []
    for ident, name, description in catalog():
        if ident not in records:
            continue
        r = records[ident]
        raw = Path(r['raw'])
        im = Image.open(raw).convert('RGBA')
        original_size = list(im.size)
        im.putalpha(im.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
        bounds = im.getbbox()
        assert bounds, ident
        crop = im.crop(bounds)
        scale = 112 / max(crop.size)
        size = tuple(max(1, round(v*scale)) for v in crop.size)
        master = Image.new('RGBA', (128,128))
        master.paste(crop.resize(size, Image.Resampling.NEAREST), ((128-size[0])//2,(128-size[1])//2))
        dest = SOURCE / (ident+'.png')
        master.save(dest, optimize=True)
        result.append({k:v for k,v in r.items() if k!='raw'} | {'source':str(dest.relative_to(ROOT)), 'sourceSha256':sha(dest), 'originalSha256':sha(raw), 'originalSize':original_size, 'alphaCrop':list(bounds)})
    return result

def icon(master, size):
    im = master.resize((size,size), Image.Resampling.NEAREST)
    out = Image.new('RGBA', im.size)
    out.putdata([(0,0,0,0) if a<128 else (*min(RGB,key=lambda c:(r-c[0])**2+(g-c[1])**2+(b-c[2])**2),255) for r,g,b,a in pixels(im)])
    return out

def preview(records):
    w, h, cols = 320, 140, 3
    sheet = Image.new('RGB',(w*cols,50+h*((len(records)+cols-1)//cols)), '#1d222c')
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype('DejaVuSansMono.ttf',12)
    except OSError:
        font = ImageFont.load_default()
    d.text((16,16),'BY / Nerven-Artefakte / 16px x4 | 32px x2',font=font,fill='#eee2c5')
    for i,r in enumerate(records):
        x,y = (i%cols)*w,(i//cols)*h+50
        for xx in range(x+8,x+w-8,8):
            for yy in range(y+4,y+84,8):
                d.rectangle((xx,yy,xx+7,yy+7),fill=(55,62,73) if ((xx-x)//8+(yy-y)//8)%2 else (44,50,61))
        for size,offset in [(16,40),(32,180)]:
            p = ROOT / f"public/sprites/items/{'32/' if size==32 else ''}{r['id']}.png"
            im = Image.open(p).resize((64,64),Image.Resampling.NEAREST)
            sheet.paste(im,(x+offset,y+12),im)
        d.text((x+10,y+96),r['id'],font=font,fill='#eee2c5')
    sheet.save(ROOT/'docs/art/preview-nerven-artefakte.png',optimize=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--import-dir')
    args = ap.parse_args()
    gen = json.loads(GEN.read_text()) if GEN.exists() else {'batch':'nerven_artefakte','generator':'image_gen','palette':PAL,'references':['public/sprites/items/32/uhr_ertrunkener.png','public/sprites/items/32/stille_glocke.png'],'normalization':'alpha >=128; tight crop; nearest fit 112x112 centered in 128x128; nearest 16/32; nearest palette color; binary alpha','bxOverlap':'No finished BX graphics or art PR existed at start; both shared IDs included.','assets':[]}
    if args.import_dir:
        gen['assets'] = import_sources(args.import_dir)
    GEN.write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n')
    entries = []
    for r in gen['assets']:
        master = Image.open(ROOT/r['source']).convert('RGBA')
        for size in [16,32]:
            rel = f"items/{'32/' if size==32 else ''}{r['id']}.png"
            path = ROOT/'public/sprites'/rel
            path.parent.mkdir(parents=True,exist_ok=True)
            icon(master,size).save(path,optimize=True)
            entries.append({'id':r['id']+('_32' if size==32 else ''),'itemId':r['id'],'file':rel,'width':size,'height':size,'frameWidth':size,'frameHeight':size,'columns':1,'rows':1,'transparent':True,'animations':{'still':{'frames':[0],'frameRate':0,'repeat':0}},'sha256':sha(path)})
    manifest = {'version':1,'batch':'nerven_artefakte','status':'exported; runtime integration pending' if len(gen['assets'])==14 else 'in progress','paletteMaxVisibleColors':32,'expectedMotifs':14,'expectedIcons':28,'bxOverlap':gen['bxOverlap'],'assets':entries}
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    preview(gen['assets'])
    print(f"Exported {len(gen['assets'])}/14 motifs; {len(entries)}/28 icons")

if __name__=='__main__':
    main()
