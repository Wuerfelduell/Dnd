"""Create review contact sheets from final exported PNGs (Pillow only)."""
from pathlib import Path
import json,math
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[2];SPR=ROOT/'public/sprites';OUT=ROOT/'docs/art/previews'
OUT.mkdir(exist_ok=True)
spec=json.loads((ROOT/'docs/art/batch-fall5-generation.json').read_text())
groups={
 'characters':lambda j:j['kind'] in ('walk','portrait','card'),
 'locations':lambda j:j['kind'] in ('tiles','props') or j['id']=='J_giesserei_aussen',
 'story':lambda j:j['kind'] in ('background','illustration','inspection'),
 'effects-items':lambda j:j['kind'] in ('effect','icons','markers','items') or j['id']=='J_08_boss_miriam_glocke',
 'battle':lambda j:j['kind']=='battle',
}
for name,predicate in groups.items():
    jobs=[j for j in spec['jobs'] if predicate(j) and (SPR/j['file']).exists()]
    cols=2 if name=='battle' else 3;cw=600 if name=='battle' else 500
    rows=[]
    for start in range(0,len(jobs),cols):
        cells=[]
        for j in jobs[start:start+cols]:
            im=Image.open(SPR/j['file']).convert('RGBA')
            scale=min(2,(cw-20)/im.width,768/im.height)
            if scale>=1:scale=int(scale)
            im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST);cells.append((j,im))
        rows.append((max(im.height for j,im in cells)+42,cells))
    out=Image.new('RGB',(cols*cw,sum(h for h,c in rows)+20),'#535866');draw=ImageDraw.Draw(out);y=10
    for rh,cells in rows:
        for col,(j,im) in enumerate(cells):
            x=col*cw+10;draw.text((x,y),j['id']+'  '+str(j['size'][0])+'x'+str(j['size'][1]),fill='#eee2c5');out.paste(im,(x,y+22),im)
        y+=rh
    path=OUT/f'batch-fall5-{name}.png';out.save(path,optimize=True);print(path.relative_to(ROOT))
