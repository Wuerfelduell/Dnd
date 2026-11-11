"""Export the generated BX 4x4 atlas as native 16px, palette-limited sprites.
Usage: python tools/art/konzentration/export.py /path/to/generated-sheet.png
The source remains untouched. No new shapes are drawn; only raster/palette normalization.
"""
from pathlib import Path
from PIL import Image
import json, sys, hashlib

ROOT = Path(__file__).resolve().parents[3]
IDS = ['siebter_fingerring','metronom_ohne_feder','schlagzaehler','hohle_krone',
       'tickender_zahn','nadel_der_naeherin','gedankenkaefig','stummer_chor',
       'zweites_herz','rangierlinse','kreidezirkel','sanduhr_voll_asche',
       'uhrwerkherz','knoechelrosenkranz','kerzenkrone','aschestundenglas']
# Outline + three steps per material, with sparse supernatural accent colors.
PALETTE = ['#1a1c2c','#303746','#697b8a','#bcc7cf',
           '#392d32','#725044','#a5785b',
           '#554531','#a08047','#d3b571',
           '#817867','#beb19a','#e6dcc4',
           '#473c35','#64503d','#8a7153',
           '#314449','#728f92','#b9d0cf',
           '#612d39','#a44949','#cb6a58',
           '#5a2a7a','#6fe0d0','#d59b52']

def export(source):
    src = Image.open(source).convert('RGBA')
    rgb = [tuple(bytes.fromhex(x[1:])) for x in PALETTE]
    def nearest(pixel):
        return min(rgb, key=lambda p: sum((p[i]-pixel[i])**2 for i in range(3)))
    atlas = Image.new('RGBA',(64,64))
    folder = ROOT/'public/sprites/items'
    for i, name in enumerate(IDS):
        x,y=i%4,i//4
        cell=src.crop((round(x*src.width/4),round(y*src.height/4),round((x+1)*src.width/4),round((y+1)*src.height/4)))
        mask=cell.getchannel('A').point(lambda a: 255 if a>=160 else 0)
        cell.putalpha(mask)
        box=mask.getbbox()
        if not box: raise ValueError(f'Empty cell: {name}')
        cell=cell.crop(box)
        cell.thumbnail((14,14),Image.Resampling.NEAREST)
        icon=Image.new('RGBA',(16,16))
        icon.paste(cell,((16-cell.width)//2,(16-cell.height)//2))
        mask=icon.getchannel('A')
        for py in range(16):
            for px in range(16):
                if not mask.getpixel((px,py)):
                    edge=any(0<=px+dx<16 and 0<=py+dy<16 and mask.getpixel((px+dx,py+dy)) for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)])
                    icon.putpixel((px,py),(*rgb[0],255) if edge else (0,0,0,0))
                else:
                    icon.putpixel((px,py),(*nearest(icon.getpixel((px,py))),255))
        icon.save(folder/f'{name}.png',optimize=True)
        atlas.paste(icon,(x*16,y*16))
    atlas.save(folder/'BX_konzentration_icons.png',optimize=True)
    manifest={'version':1,'batch':'konzentration','paletteMaxVisibleColors':len(PALETTE),'palette':PALETTE,
      'assets':[{'id':'BX_konzentration_icons','file':'items/BX_konzentration_icons.png','width':64,'height':64,
       'frameWidth':16,'frameHeight':16,'columns':4,'rows':4,'transparent':True,
       'icons':{name:i for i,name in enumerate(IDS)}}]+[
       {'id':name,'file':f'items/{name}.png','width':16,'height':16,'frameWidth':16,'frameHeight':16,
        'columns':1,'rows':1,'transparent':True,'sheetFrame':i} for i,name in enumerate(IDS)]}
    for a in manifest['assets']:
        a['sha256']=hashlib.sha256((ROOT/'public/sprites'/a['file']).read_bytes()).hexdigest()
    (ROOT/'public/sprites/manifest-konzentration.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    atlas.resize((768,768),Image.Resampling.NEAREST).save('/tmp/bx-preview.png')
    print(f'Exported {len(IDS)} native icons + atlas; {len(PALETTE)}-color palette.')

if __name__=='__main__':export(Path(sys.argv[1]))
