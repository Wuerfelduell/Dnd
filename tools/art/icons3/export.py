"""Re-export CB assets from independently sampled logical-size imagegen masters.

Requires Pillow. --import PATH is only needed to ingest original generator outputs;
ordinary exports use the small, checked-in RGBA masters and need no API.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
ART = ROOT / 'docs/art'
SOURCES = ART / 'icons3-sources'
SPRITES = ROOT / 'public/sprites'
GEN = ART / 'batch-icons3-generation.json'
REFS = ['items/32/mantel_leder.png', 'items/32/hut_schirmmuetze.png',
        'items/verband.png', 'items/riechsalz.png', 'items/32/stille_glocke.png',
        'items/zeitungsausschnitt.png']
# Existing reference colors, plus six explicit pathway/supernatural accents.
HEX = ['1a1c2c','715648','58433c','252b38','303b49','686850','494b3a',
       '92745a','e0c9a1','b3946e','2d2629','413433','eee2c5','cfb18a',
       '8b8870','dbd2b3','6a4a8a','b4ac91','425360','503b68','586c78',
       '95a5a5','886332','9e5449','e8b860','6fe0d0','c8b0e8','e07a8a',
       '9ad06a','b66c48','777f89']
COLORS = [tuple(bytes.fromhex(h)) for h in HEX]
OUTLINE = COLORS[0] + (255,)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fit_region(image, box, size):
    region = image.crop(box)
    mask = region.getchannel('A').point(lambda a: 255 if a >= 200 else 0)
    bbox = mask.getbbox()
    if not bbox:
        raise ValueError(f'Empty generated region: {box}')
    region.putalpha(mask)
    region = region.crop(bbox)
    scale = (size - 2) / max(region.size)
    wh = tuple(max(1, round(v * scale)) for v in region.size)
    region = region.resize(wh, Image.Resampling.NEAREST)
    out = Image.new('RGBA', (size, size))
    out.paste(region, ((size-wh[0])//2, (size-wh[1])//2))
    return out, [box[0]+bbox[0], box[1]+bbox[1], box[0]+bbox[2], box[1]+bbox[3]]


def import_sources(input_path):
    entries = json.loads(Path(input_path).read_text())
    SOURCES.mkdir(parents=True, exist_ok=True)
    for entry in entries:
        original = Path(entry.pop('sourcePath'))
        image = Image.open(original).convert('RGBA')
        w,h = image.size
        master = Image.new('RGBA', (48,32) if entry['maxSize'] == 32 else (16,16))
        crops = {}
        if entry['maxSize'] == 32:
            for size,box,pos in [(16,(0,0,w//3,h),(0,8)), (32,(w//3,0,w,h),(16,0))]:
                icon, crops[str(size)] = fit_region(image,box,size)
                master.paste(icon,pos)
        else:
            i = entry.get('stripCell')
            box = (round(i*w/9),0,round((i+1)*w/9),h) if i is not None else (0,0,w,h)
            icon, crops['16'] = fit_region(image,box,16)
            master.paste(icon,(0,0))
        source = SOURCES / (entry['id']+'.png')
        master.save(source)
        entry.update(source=str(source.relative_to(ROOT)), originalSha256=digest(original),
                     originalSize=[w,h], originalCropBoxes=crops, sourceSha256=digest(source),
                     logicalRegions={'16':[0,8,16,24], '32':[16,0,48,32]} if entry['maxSize']==32
                     else {'16':[0,0,16,16]})
    record = dict(batch='icons3', generator='built-in image_gen.imagegen',
                  method='26 individual item sheets plus one nine-cell newspaper strip; independently drawn small/large regions; nearest-neighbor sampling, binary alpha, shared palette, explicit pixel cleanup',
                  palette=['#'+h for h in HEX], referenceFiles=REFS,
                  referenceSha256={p:digest(SPRITES/p) for p in REFS}, assets=entries)
    GEN.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')


def indexed(image):
    # Explicit nearest palette lookup, no error-diffusion and no intermediate alpha.
    out = Image.new('P',image.size,0)
    palette = [0,0,0] + [v for c in COLORS for v in c]
    out.putpalette(palette+[0]*(768-len(palette)))
    cache = {}
    for y in range(image.height):
        for x in range(image.width):
            r,g,b,a = image.getpixel((x,y))
            if a < 200:
                continue
            key = (r,g,b)
            if key not in cache:
                cache[key] = 1+min(range(len(COLORS)), key=lambda i: sum((key[k]-COLORS[i][k])**2 for k in range(3)))
            out.putpixel((x,y),cache[key])
    out.info['transparency']=0
    return out


def newspaper(number, generated):
    """Common folded-paper silhouette, tiny independently repixelled cover pictures.

    The generated nine-panel strip is the visual source; simplified 8x5 motifs
    keep its covers recognizable on the final 16px grid. No lettering/digits.
    """
    im=Image.new('RGBA',(16,16)); d=ImageDraw.Draw(im)
    d.polygon([(2,1),(12,1),(14,3),(14,14),(3,14),(1,12),(1,2)],fill=OUTLINE)
    # Nine progressively paler mixtures, all within the common palette.
    for y in range(2,14):
        for x in range(2,14):
            phase=(x*3+y*5)%8
            light=COLORS[12] if phase < number-1 else COLORS[8]
            d.point((x,y),fill=light+(255,))
    d.line((13,4,13,13),fill=COLORS[17]+(255,))
    d.line((3,3,11,3),fill=COLORS[3]+(255,))
    d.rectangle((3,5,11,9),fill=COLORS[21]+(255,))
    ink=COLORS[4]+(255,); paper=COLORS[12]+(255,); brass=COLORS[14]+(255,)
    if number==1: # station, gable clock
        d.line([(3,7),(7,5),(11,7)],fill=ink); d.rectangle((4,7,10,9),fill=ink)
        d.point((7,6),fill=paper); d.point((7,8),fill=brass)
    elif number==2:
        d.line((6,5,6,9),fill=ink); d.line((5,6,10,6),fill=ink)
        d.point((9,6),fill=COLORS[29]+(255,))
    elif number==3:
        d.polygon([(4,9),(5,7),(6,6),(8,6),(9,9)],fill=ink)
        d.point((7,8),fill=COLORS[24]+(255,)); d.line((8,5,10,5),fill=COLORS[18]+(255,))
    elif number==4:
        d.rectangle((6,5,8,6),fill=ink); d.ellipse((4,6,10,9),fill=ink)
        d.point((7,7),fill=brass); d.line((4,9,10,9),fill=ink)
    elif number==5:
        d.line([(3,9),(5,9),(5,8),(7,8),(7,7),(9,7),(9,6),(11,6)],fill=ink)
    elif number==6:
        d.rectangle((4,8,8,9),fill=ink); d.line((8,8,8,6),fill=ink)
        d.polygon([(8,6),(10,5),(11,7)],fill=brass)
    elif number==7:
        d.line((4,7,11,7),fill=ink); d.line((4,7,4,9),fill=ink)
        for x in (5,8,11): d.point((x,7),fill=COLORS[29]+(255,))
    elif number==8:
        d.rectangle((5,5,10,9),outline=ink); d.line((7,5,7,9),fill=ink)
        d.point((9,7),fill=COLORS[24]+(255,)); d.point((9,8),fill=brass)
    else:
        d.line((3,5,11,5),fill=ink); d.line((5,6,5,8),fill=ink)
        d.line((3,9,11,9),fill=ink)
    d.line((3,11,6,11),fill=COLORS[14]+(255,)); d.line((8,11,11,11),fill=COLORS[14]+(255,))
    d.line((3,13,5,13),fill=COLORS[14]+(255,)); d.line((8,13,10,13),fill=COLORS[14]+(255,))
    d.point((12,2),fill=paper)
    return im


def cleanup(icon, entry, size):
    # Preserve single-pixel pathway seal and supernatural accent after sampling.
    accents={'k3h_hilfe_laterne':(24,(6,10)), 'k3h_hilfe_faden':(26,(9,10)),
             'k3h_hilfe_maske':(27,(10,7)), 'k3h_hilfe_echo':(25,(7,9)),
             'k3h_hilfe_kessel':(28,(8,9)), 'k3h_hilfe_eisen':(30,(8,10)),
             'k3h_hilfe_schluessel':(14,(7,10)), 'k3h_hilfe_sq_waage':(14,(9,8)),
             'k3h_hilfe_sq_moor':(2,(7,10)), 'k3h_hilfe_sq_uhr':(29,(8,8))}
    if entry['id'] in accents:
        color,(x,y)=accents[entry['id']]
        if icon.getpixel((x,y))[3]: icon.putpixel((x,y),COLORS[color]+(255,))
    d=ImageDraw.Draw(icon); item=entry['id']
    if item=='ez_ds_streckenlaeufer_gabe':
        # Both stopped hands coincide at twelve; crack has no numeral-like ticks.
        cx,cy,top=(6,9,6) if size==16 else (14,19,11)
        d.line((cx,cy,cx,top),fill=OUTLINE)
        d.point((cx,cy+1),fill=COLORS[25]+(255,))
    elif item=='ez_ds_kalkbrennerin_gabe':
        xy=(4,12) if size==16 else (8,25)
        d.point(xy,fill=COLORS[16]+(255,))
        if size==32: d.point((xy[0],xy[1]-1),fill=COLORS[26]+(255,))
    elif item=='ez_ds_rangierer_gabe':
        xy=(4,12) if size==16 else (7,26)
        d.point(xy,fill=COLORS[25]+(255,))
    elif item=='ez_ds_schrankenkind_gabe':
        # Weathered red paint and violet notch survive palette reduction.
        for y in range(size):
            for x in range(size):
                r,g,b,a=icon.getpixel((x,y))
                if a and r>g*1.3 and r>b*1.25: icon.putpixel((x,y),COLORS[23]+(255,))
        xy=(8,5) if size==16 else (15,10)
        d.point(xy,fill=COLORS[16]+(255,))
        if size==32: d.point((xy[0]+1,xy[1]),fill=COLORS[26]+(255,))
    elif item=='ez_ds_walzenstimme_gabe':
        if size==16:
            d.line((6,5,9,5),fill=COLORS[25]+(255,))
            d.line((6,7,9,7),fill=COLORS[25]+(255,))
        else:
            d.arc((7,8,24,19),190,345,fill=COLORS[25]+(255,))
            d.arc((9,10,22,17),190,345,fill=COLORS[25]+(255,))
    return icon


def export():
    record=json.loads(GEN.read_text()); assets=[]; icons={}
    record['palette']=['#'+h for h in HEX]
    record['pixelCleanup']='Pillow grid edits: common newspaper silhouette and 8x5 cover motifs, monotone yellowing via two-tone dithering; pathway seal dots; gift glow, rust-red paint, stopped watch hands and two sound rings.'
    GEN.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
    for e in record['assets']:
        master=Image.open(ROOT/e['source']).convert('RGBA')
        for size in ([16,32] if e['maxSize']==32 else [16]):
            icon=master.crop(e['logicalRegions'][str(size)])
            if 'stripCell' in e: icon=newspaper(e['stripCell']+1,icon)
            icon=cleanup(icon,e,size)
            icon=indexed(icon)
            name=f"items/{'32/' if size==32 else ''}{e['id']}.png"
            path=SPRITES/name; path.parent.mkdir(parents=True,exist_ok=True); icon.save(path,transparency=0,optimize=True)
            assets.append(dict(id=e['id'] if size==16 else e['id']+'_32',itemId=e['id'],file=name,width=size,height=size,transparent=True,sha256=digest(path)))
            icons[(e['id'],size)]=icon.convert('RGBA')
    strip=Image.new('RGBA',(144,16))
    for i in range(9): strip.paste(icons[(f'k3e_ausgabe_{i+1}',16)],(i*16,0))
    strip=indexed(strip); strip_path=SPRITES/'items/k3e_ausgaben_strip.png'; strip.save(strip_path,transparency=0,optimize=True)
    assets.append(dict(id='k3e_ausgaben_strip',file='items/k3e_ausgaben_strip.png',width=144,height=16,frameWidth=16,frameHeight=16,columns=9,transparent=True,sha256=digest(strip_path)))
    manifest=dict(version=1,batch='icons3',status='exported; runtime integration pending',paletteMaxVisibleColors=31,assets=assets)
    (SPRITES/'manifest-icons3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    # Review sheet uses native assets enlarged by NN, never smooth interpolation.
    canvas=Image.new('RGB',(1050,1190),'#d6d0bf'); draw=ImageDraw.Draw(canvas)
    font=ImageFont.load_default()
    draw.text((16,12),'CB / icons3 - 35 items | 16 large variants | native pixels x4 / x2',fill='#1a1c2c',font=font)
    for i,e in enumerate(record['assets']):
        x=16+(i%5)*207; y=44+(i//5)*162
        draw.rectangle((x,y,x+194,y+116),fill='#a9a89e')
        for yy in range(y,y+116,8):
            for xx in range(x,x+195,8):
                if ((xx-x)//8+(yy-y)//8)%2: draw.rectangle((xx,yy,min(xx+7,x+194),min(yy+7,y+116)),fill='#bcb9ad')
        canvas.paste(icons[(e['id'],16)].resize((64,64),Image.Resampling.NEAREST),(x+10,y+24),icons[(e['id'],16)].resize((64,64),Image.Resampling.NEAREST))
        if e['maxSize']==32:
            big=icons[(e['id'],32)].resize((64,64),Image.Resampling.NEAREST)
            canvas.paste(big,(x+109,y+24),big)
        label=e['id']; draw.text((x,y+121),label[:28],fill='#1a1c2c',font=font)
        if len(label)>28: draw.text((x,y+134),label[28:],fill='#1a1c2c',font=font)
    canvas.save(ART/'preview-icons3.png')
    print(f'Exported {len(icons)} individual PNGs plus newspaper strip.')


if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--import',dest='input_path')
    args=parser.parse_args()
    if args.input_path: import_sources(args.input_path)
    export()
