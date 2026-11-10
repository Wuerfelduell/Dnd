"""Export imagegen masters, shared palette, binary alpha, and contact sheets.

Requires Pillow. --import-records accepts a local list of {id,prompt,raw,...}.
Without it, rebuilds from the committed 128px masters and generation manifest.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse, hashlib, json, math
ROOT=Path(__file__).resolve().parents[3]
CAT=json.loads((ROOT/'tools/art/vorrat3/catalog.json').read_text())
GEN=ROOT/'docs/art/batch-vorrat3-generation.json'
PAL=['#1a1c2c','#252b38','#425360','#586c78','#71858b','#95a5a5','#413433','#715648','#92745a','#b3946e','#b4a079','#e0c9a1','#eee2c5','#7d927e','#686850','#e8f0ff','#245b59','#36817a','#6fe0d0','#886332','#e8b860','#d0a050','#78578f','#c8b0e8','#884b60','#e07a8a','#4f713f','#9ad06a','#64788f','#a8b4c0','#92a6b2','#6a4a8a']
RGB=[tuple(bytes.fromhex(c[1:])) for c in PAL]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()

def import_records(records,existing):
    lookup={r['id']:r for r in existing}
    for r in records:
        raw=Path(r['raw']);im=Image.open(raw).convert('RGBA')
        if r.get('rawCrop'): im=im.crop(tuple(r['rawCrop']))
        mask=im.getchannel('A').point(lambda a:255 if a>=128 else 0)
        bounds=mask.getbbox()
        if not bounds:raise ValueError(f"Empty source: {r['id']}")
        im.putalpha(mask);crop=im.crop(bounds)
        scale=112/max(crop.size);size=tuple(max(1,round(v*scale)) for v in crop.size)
        master=Image.new('RGBA',(128,128));master.paste(crop.resize(size,Image.Resampling.NEAREST),((128-size[0])//2,(128-size[1])//2))
        path=ROOT/f"docs/art/vorrat3-sources/{r['id']}.png";path.parent.mkdir(parents=True,exist_ok=True);master.save(path,optimize=True)
        lookup[r['id']]={k:v for k,v in r.items() if k!='raw'}|{'source':str(path.relative_to(ROOT)),'sourceSha256':sha(path),'originalSha256':sha(raw),'originalSize':list(Image.open(raw).size),'alphaCrop':list(bounds),'normalization':'alpha >=128; tight crop; nearest fit 112x112 centered in 128x128'}
    return [lookup[r['id']] for r in CAT if r['id'] in lookup]

def icon(master,size):
    im=master.resize((size,size),Image.Resampling.NEAREST)
    out=Image.new('RGBA',im.size)
    pixels=[]
    for r,g,b,a in im.getdata():
        if a<128:pixels.append((0,0,0,0));continue
        color=min(RGB,key=lambda c:(r-c[0])**2+(g-c[1])**2+(b-c[2])**2)
        pixels.append((*color,255))
    out.putdata(pixels);return out

def preview(records):
    font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',11)
    groups=[('items',[r for r in records if r['kind']!='trophy']),('trophies',[r for r in records if r['kind']=='trophy'])]
    for label,rows in groups:
        if not rows:continue
        w,h,cols=260,126,4;sheet=Image.new('RGB',(w*cols,50+h*math.ceil(len(rows)/cols)),(29,34,44));d=ImageDraw.Draw(sheet)
        d.text((16,15),f'BM / vorrat3 / {label} / 16px x4 | 32px x2',font=font,fill='#eee2c5')
        for i,r in enumerate(rows):
            x,y=(i%cols)*w,(i//cols)*h+50
            for xx in range(x+6,x+w-6,8):
                for yy in range(y+4,y+80,8):d.rectangle((xx,yy,xx+7,yy+7),fill=(55,62,73) if ((xx-x)//8+(yy-y)//8)%2 else (44,50,61))
            a=Image.open(ROOT/f"public/sprites/items/{r['id']}.png").convert('RGBA').resize((64,64),Image.Resampling.NEAREST);sheet.paste(a,(x+20,y+10),a)
            if r['large']:
                b=Image.open(ROOT/f"public/sprites/items/32/{r['id']}.png").convert('RGBA').resize((64,64),Image.Resampling.NEAREST);sheet.paste(b,(x+110,y+10),b)
            name=r['id'];parts=[name[j:j+34] for j in range(0,len(name),34)]
            for j,line in enumerate(parts):d.text((x+8,y+86+14*j),line,font=font,fill='#eee2c5')
        sheet.save(ROOT/f'docs/art/preview-vorrat3-{label}.png',optimize=True)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--import-records');a=parser.parse_args()
    gen=json.loads(GEN.read_text()) if GEN.exists() else {'batch':'vorrat3','generator':'image_gen','palette':PAL,'references':['public/sprites/items/k3o_stillring.png','public/sprites/items/32/mantel_frack.png','public/sprites/items/sq_fristpendel.png'],'assets':[]}
    if a.import_records:
        records=json.loads(Path(a.import_records).read_text());records=records.get('assets',[]) if isinstance(records,dict) else records
        gen['assets']=import_records(records,gen['assets'])
    gen['status']='exported; reserve only; no runtime integration' if len(gen['assets'])==104 else 'in progress'
    GEN.write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n')
    assets=[]
    for r in gen['assets']:
        source=Image.open(ROOT/r['source']).convert('RGBA')
        for size in ([16,32] if r['large'] else [16]):
            rel=f"items/{'32/' if size==32 else ''}{r['id']}.png";path=ROOT/'public/sprites'/rel;path.parent.mkdir(parents=True,exist_ok=True)
            icon(source,size).save(path,optimize=True)
            assets.append({'id':r['id']+("_32" if size==32 else ''),'itemId':r['id'],'file':rel,'width':size,'height':size,'frameWidth':size,'frameHeight':size,'columns':1,'rows':1,'transparent':True,'animations':{'still':{'frames':[0],'frameRate':0,'repeat':0}},'sha256':sha(path)})
    manifest={'version':1,'batch':'vorrat3','status':gen['status'],'paletteMaxVisibleColors':32,'expectedItems':72,'expectedTrophies':32,'expectedLarge':38,'trophyCountNote':'The task says 34, but explicitly defines 24 ordinary enemies + 8 bosses = 32 IDs. No invented IDs.','equipmentOverlay':'Not required: F_EQUIPMENT uses standalone icons, not paper-doll overlays.','assets':assets}
    (ROOT/'public/sprites/manifest-vorrat3.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    preview(gen['assets']);print(f"Exported {len(gen['assets'])}/104 motifs; {len(assets)}/142 icons")
if __name__=='__main__':main()
