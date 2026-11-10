"""Export BO ImageGen sources. Usage: python export.py /path/to/source-directory.
Requires Pillow. Source filenames and hashes are recorded in generation JSON.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import json, sys, hashlib
ROOT=Path(__file__).resolve().parents[3]
META=ROOT/'docs/art/batch-fasserin-generation.json'
records=json.loads(META.read_text())
palette=records['palette']
colors=[tuple(bytes.fromhex(x[1:])) for x in palette]
assets=[]
def indexed(im):
    im=im.convert('RGBA'); out=Image.new('P',im.size,0)
    flat=[0,0,0]+[v for c in colors for v in c]
    out.putpalette(flat+[0]*(768-len(flat)))
    cache={}; data=[]
    for r,g,b,a in im.getdata():
        if a<200: data.append(0); continue
        c=(r,g,b)
        if c not in cache: cache[c]=1+min(range(len(colors)),key=lambda i:sum((c[j]-colors[i][j])**2 for j in range(3)))
        data.append(cache[c])
    out.putdata(data);out.info['transparency']=0
    return out

def fit(im,size,stretch=False):
    im=im.convert('RGBA'); im.putalpha(im.getchannel('A').point(lambda a:255 if a>=200 else 0))
    box=im.getbbox(); assert box,'empty source'
    im=im.crop(box)
    w,h=size
    if stretch: target=(w-2,h-2)
    else:
        scale=min((w-2)/im.width,(h-2)/im.height)
        target=(max(1,round(im.width*scale)),max(1,round(im.height*scale)))
    im=im.resize(target,Image.Resampling.NEAREST)
    out=Image.new('RGBA',size);out.paste(im,((w-im.width)//2,h-1-im.height))
    return out

def save(im,file,fw,fh,cols=1,rows=1,animations=None):
    dest=ROOT/'public/sprites'/file;dest.parent.mkdir(parents=True,exist_ok=True)
    indexed(im).save(dest,optimize=True,transparency=0)
    assets.append(dict(id=Path(file).stem,file=file,width=im.width,height=im.height,frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,transparent=True,animations=animations or {'idle':{'frames':[0],'frameRate':1,'repeat':-1}}))

for rec in records['generations']:
    source=Path(sys.argv[1])/rec['sourceFile']; assert hashlib.sha256(source.read_bytes()).hexdigest()==rec['sha256']
    im=Image.open(source); id=rec['id']
    if id in ['walk','portrait','sit']:
        cols,rows,fw,fh={'walk':(4,4,16,32),'portrait':(4,1,64,64),'sit':(2,1,16,32)}[id]
        sheet=Image.new('RGBA',(cols*fw,rows*fh))
        for row in range(rows):
            for col in range(cols):
                cell=im.crop((round(col*im.width/cols),round(row*im.height/rows),round((col+1)*im.width/cols),round((row+1)*im.height/rows)))
                frame=fit(cell,(fw,fh),stretch=id in ['walk','sit']);sheet.paste(frame,(col*fw,row*fh))
                if id=='portrait' and col==0:
                    head=fit(frame.crop((6,0,58,55)),(24,24))
                    save(head,'portraits/heads/fasserin.png',24,24)
        if id=='walk':
            anim={name:{'frames':list(range(r*4,r*4+4)),'frameRate':6,'repeat':-1} for r,name in enumerate(['down','left','right','up'])}
            file='characters/fasserin_walk.png'
        elif id=='sit': anim={'craft':{'frames':[0,1],'frameRate':2,'repeat':-1}};file='characters/fasserin_sit.png'
        else:
            anim={name:{'frames':[n],'frameRate':1,'repeat':0} for n,name in enumerate(['neutral','suspicious','startled','smile'])};file='portraits/fasserin_emotions.png'
        save(sheet,file,fw,fh,cols,rows,anim)
    elif id=='bench':save(fit(im,(32,32)),'props/fasserin_werkbank.png',32,32)
    elif id=='pliers':save(fit(im,(16,16)),'props/fasserin_zangen.png',16,16)
    else:
        for size,prefix in [(16,'items'),(32,'items/32')]:save(fit(im,(size,size)),f'{prefix}/{id}.png',size,size)
manifest={'version':1,'batch':'fasserin','status':'exported; runtime integration pending','paletteMaxVisibleColors':32,'palette':palette,'assets':assets}
(ROOT/'public/sprites/manifest-fasserin.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Exported',len(assets),'PNGs')
