#!/usr/bin/env python3
"""Export imagegen sheets. Usage: python tools/art/dunscar3/export.py RECEIPTS_DIR

Receipts contain id, kind (battle/walk), path and verbatim prompt. No API calls.
Only batch dunscar3 assets are written; no runtime integration.
"""
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
SPR = ROOT / 'public/sprites'
ART = ROOT / 'docs/art'
PALETTE = ['#1a1c2c','#252d38','#35424a','#49535b','#626b70',
 '#859091','#abb3ae','#d4d0bc','#e7dfc5','#c1ac84','#938365',
 '#635744','#443d34','#704e3b','#996849','#bc9260','#d0a050',
 '#e8b860','#b4a079','#a8b4c0','#92a6b2','#7d927e','#526953',
 '#9ad06a','#e07a8a','#89596d','#c8b0e8','#78618e','#29545a',
 '#418f91','#6fe0d0','#b1e7d5']
RGB = np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE], dtype=np.int32)
DEFS = json.loads((ART / 'dunscar3-source-spec.json').read_text())
ASSETS = []

def rgba_quantize(im):
    a = np.asarray(im.convert('RGBA')).copy()
    mask = a[:,:,3] >= 180
    # Resolve unique source colors once rather than allocating WxHx32 distances.
    cols, inverse = np.unique(a[:,:,:3].reshape(-1,3), axis=0, return_inverse=True)
    nearest = ((cols[:,None,:].astype(np.int32)-RGB[None,:,:])**2).sum(2).argmin(1)
    a[:,:,:3] = RGB[nearest[inverse]].reshape(a.shape[:2]+(3,))
    a[:,:,3] = mask.astype(np.uint8)*255
    a[~mask] = 0
    return Image.fromarray(a)

def save(im, file, **meta):
    im = rgba_quantize(im)
    p=SPR/file; p.parent.mkdir(parents=True,exist_ok=True)
    # Indexed PNG: slot zero transparent, slots 1..32 global visible palette.
    a=np.asarray(im); indices=np.zeros(a.shape[:2],dtype=np.uint8)
    for i,c in enumerate(RGB): indices[(a[:,:,:3]==c).all(2)&(a[:,:,3]>0)]=i+1
    out=Image.fromarray(indices).convert('P')
    pal=[0,0,0]+RGB.astype(np.uint8).flatten().tolist()
    out.putpalette(pal+[0]*(768-len(pal)));out.info['transparency']=0
    out.save(p,optimize=True)
    ASSETS.append(dict(id=Path(file).stem,file=file,width=im.width,height=im.height,
                       transparent=bool((a[:,:,3]==0).any()),**meta))

def frames(source, fw, fh, columns, counts, contour_only=False):
    raw=Image.open(source).convert('RGBA'); rows=len(counts)
    if contour_only:
        # Preserve only the generated turquoise strokes of the hollow echo;
        # discard pale interiors and neutral background/grid residue.
        pixels=np.asarray(raw).copy();rgb=pixels[:,:,:3].astype(np.int32)
        keep=(rgb[:,:,1]>rgb[:,:,0]*1.25)&(rgb[:,:,2]>rgb[:,:,0]*1.25)&(abs(rgb[:,:,1]-rgb[:,:,2])<65)
        keep &= pixels[:,:,3]>=70
        pixels[~keep]=0
        pixels[keep,3]=255
        # Contours must remain readable at 16x32; normalize surviving strokes
        # to the established turquoise highlight instead of dark semitransparency.
        pixels[keep,:3]=(111,224,208)
        raw=Image.fromarray(pixels)
    sheet=Image.new('RGBA',(fw*columns,fh*rows))
    cells=[]
    for row,n in enumerate(counts):
        for col in range(columns):
            frame=Image.new('RGBA',(fw,fh))
            if col<n:
                box=(round(col*raw.width/columns),round(row*raw.height/rows),
                     round((col+1)*raw.width/columns),round((row+1)*raw.height/rows))
                # Preserve pose proportions; never stretch a fallen pose to full height.
                cell=rgba_quantize(raw.crop(box).resize((fw-2,fh-4),Image.Resampling.NEAREST))
                bbox=cell.getbbox()
                if bbox:
                    content=cell.crop(bbox)
                    frame.alpha_composite(content,((fw-content.width)//2,fh-2-content.height))
                else:
                    raise ValueError(f'Empty required cell: {source}, row {row}, col {col}')
            cells.append(frame)
    return cells

def assemble(cells,fw,fh,cols):
    out=Image.new('RGBA',(fw*cols,fh*(len(cells)//cols)))
    for i,cell in enumerate(cells):out.alpha_composite(cell,((i%cols)*fw,(i//cols)*fh))
    return out

def fit_pose(frame,size,pad=8):
    out=Image.new('RGBA',size);bb=frame.getbbox()
    if bb:
        p=frame.crop(bb);scale=min((size[0]-2*pad)/p.width,(size[1]-2*pad)/p.height)
        # Integer enlargement retains the original pixel density.
        scale=max(1,int(scale)) if scale>=1 else scale
        p=p.resize((max(1,round(p.width*scale)),max(1,round(p.height*scale))),Image.Resampling.NEAREST)
        out.alpha_composite(p,((size[0]-p.width)//2,size[1]-pad-p.height))
    return out

def export_characters(receipts):
    provenance=[]
    for index,(gid,fw,fh,description,phase) in enumerate(DEFS):
        for kind in ['battle','walk']:
            r=receipts.get((gid,kind))
            if not r:raise ValueError(f'Missing source {gid}/{kind}')
            provenance.append(dict(id=gid,kind=kind,prompt=r['prompt'],generator='image_gen',
                sourceFile=Path(r['path']).name,sourceSha256=hashlib.sha256(Path(r['path']).read_bytes()).hexdigest()))
        counts=[4,6,3,4]+([6,6,6] if gid=='unterschicht' else [6] if phase else [])
        cells=frames(receipts[(gid,'battle')]['path'],fw,fh,6,counts,contour_only=gid=='nachhall')
        # Both physical frame slots contain the same windup, ensuring a two-frame hold.
        held=[1]+([4,5,6] if gid=='unterschicht' else [4] if phase else [])
        for row in held:cells[row*6+1]=cells[row*6].copy()
        names=['idle','attack','hurt','defeated']+(['phase1','phase2','phase3'] if gid=='unterschicht' else ['phase2'] if phase else [])
        anim={name:dict(frames=list(range(row*6,row*6+counts[row])),frameRate=6 if name=='idle' else 8,repeat=-1 if name=='idle' else 0) for row,name in enumerate(names)}
        save(assemble(cells,fw,fh,6),f'battle/enemy_{gid}.png',gameId=gid,kind='battle',frameWidth=fw,frameHeight=fh,columns=6,rows=len(counts),baseline=fh-2,occupiedCounts=counts,heldRows=held,facing='left',animations=anim,defeatMeaning='asleep; alive' if gid=='schichtgaenger' else 'defeated')
        walk=frames(receipts[(gid,'walk')]['path'],16,32,4,[4]*4,contour_only=gid=='nachhall')
        save(assemble(walk,16,32,4),f'characters/F_ow_{gid}.png',gameId=gid,kind='walk',frameWidth=16,frameHeight=32,columns=4,rows=4,baseline=30,occupiedCounts=[4]*4,animations={f'walk_{direction}':dict(frames=list(range(i*4,i*4+4)),frameRate=6,repeat=-1) for i,direction in enumerate(['down','left','right','up'])})
        save(fit_pose(cells[0],(96,128)),f'ui/bestiary/F_{gid}.png',gameId=gid,kind='bestiary',frameWidth=96,frameHeight=128,columns=1,rows=1,derivedFrom=f'battle/enemy_{gid}.png',sourceFrame=0)
        if index>=6:
            save(fit_pose(cells[0],(160,160)),f'ui/DS_boss_{gid}.png',gameId=gid,kind='bossBand',frameWidth=160,frameHeight=160,columns=1,rows=1,derivedFrom=f'battle/enemy_{gid}.png',sourceFrame=0)
    return provenance

def export_ui():
    # Exact native pixel UI: unique geometries, no musical knowledge required.
    bg=PALETTE[0];amber='#e8b860';dim='#635744'
    symbols=[]
    descriptions=['Punkt','Doppelpunkt waagrecht','Dreieckpunkte','Vierpunkte','kurzer Strich','Doppelstrich waagrecht','Senkrechtstrich','Doppelsenkrechte','Bogen oben','Bogen unten','Bogen links','Bogen rechts','Punkt ueber Strich','Strich ueber Punkt','zwei Boegen','Punkt im Bogen']
    for i in range(16):
        im=Image.new('RGBA',(16,16),bg);d=ImageDraw.Draw(im)
        def dot(x,y):d.rectangle((x,y,x+1,y+1),fill=amber)
        if i==0:dot(7,7)
        elif i==1:dot(4,7);dot(10,7)
        elif i==2:dot(7,4);dot(4,10);dot(10,10)
        elif i==3:
            for x in (4,10):
                for y in (4,10):dot(x,y)
        elif i==4:d.line((4,8,11,8),fill=amber,width=2)
        elif i==5:
            for y in (5,10):d.line((4,y,11,y),fill=amber,width=2)
        elif i==6:d.line((8,4,8,11),fill=amber,width=2)
        elif i==7:
            for x in (5,10):d.line((x,4,x,11),fill=amber,width=2)
        elif i in (8,9,10,11):
            angles={8:(180,360),9:(0,180),10:(90,270),11:(270,450)}
            d.arc((3,3,12,12),*angles[i],fill=amber,width=2)
        elif i==12:dot(7,4);d.line((4,10,11,10),fill=amber,width=2)
        elif i==13:d.line((4,4,11,4),fill=amber,width=2);dot(7,10)
        elif i==14:d.arc((2,2,13,13),180,360,fill=amber,width=2);d.arc((5,5,10,10),180,360,fill=amber,width=2)
        else:d.arc((3,3,12,12),180,360,fill=amber,width=2);dot(7,10)
        symbols.append(im)
    sheet=Image.new('RGBA',(256,16))
    for i,im in enumerate(symbols):sheet.paste(im,(16*i,0))
    save(sheet,'ui/ds_rufmuster.png',kind='symbols',frameWidth=16,frameHeight=16,columns=16,rows=1,symbols=[dict(frame=i,shape=s) for i,s in enumerate(descriptions)])
    save(sheet.resize((512,32),Image.Resampling.NEAREST),'ui/ds_rufmuster_32.png',kind='symbols',frameWidth=32,frameHeight=32,columns=16,rows=1)
    framesheet=Image.new('RGBA',(48,16))
    for i in range(3):
        tile=Image.new('RGBA',(16,16));d=ImageDraw.Draw(tile)
        d.rectangle((0,0,15,15),outline=amber)
        if i==0:
            for x,y in [(2,2),(12,2),(2,12),(12,12)]:d.rectangle((x,y,x+1,y+1),fill=amber)
        elif i==1:d.line([(9,12),(11,14),(14,10)],fill='#6fe0d0',width=1)
        else:d.line((10,10,14,14),fill='#e07a8a',width=1);d.line((14,10,10,14),fill='#e07a8a',width=1)
        framesheet.paste(tile,(i*16,0))
    save(framesheet,'ui/ds_rufmuster_rahmen.png',kind='frames',frameWidth=16,frameHeight=16,columns=3,rows=1,states=['bekannt','geprueft','falsch'])
    save(framesheet.resize((96,32),Image.Resampling.NEAREST),'ui/ds_rufmuster_rahmen_32.png',kind='frames',frameWidth=32,frameHeight=32,columns=3,rows=1,states=['bekannt','geprueft','falsch'])
    charge=Image.new('RGBA',(48,64),bg)
    for n in range(4):
        d=ImageDraw.Draw(charge)
        for c in range(3):
            x=c*16;y=n*16;d.rectangle((x+2,y+2,x+13,y+13),outline=amber)
            if c<n:d.rectangle((x+4,y+4,x+11,y+11),fill=amber)
            else:d.line((x+5,y+8,x+10,y+8),fill=dim)
    save(charge,'ui/ds_rufladungen.png',kind='charges',frameWidth=48,frameHeight=16,columns=1,rows=4,states=[0,1,2,3])
    ear=Image.new('RGBA',(16,16));d=ImageDraw.Draw(ear)
    d.arc((4,2,11,12),180,460,fill=amber,width=2);d.line([(5,8),(5,12),(7,14),(9,13)],fill=amber,width=1);d.arc((7,5,10,9),180,360,fill=amber,width=1);d.arc((0,3,5,11),110,250,fill=amber,width=1)
    save(ear,'ui/ds_horchen.png',kind='hud',frameWidth=16,frameHeight=16,columns=1,rows=1)

def main():
    receipts={}
    for p in Path(sys.argv[1]).glob('*.json'):
        r=json.loads(p.read_text());receipts[(r['id'],r['kind'])]=r
    provenance=export_characters(receipts);export_ui()
    manifest=dict(version=1,batch='dunscar3',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=PALETTE,assets=ASSETS)
    (SPR/'manifest-dunscar3.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    (ART/'batch-dunscar3-generation.json').write_text(json.dumps(dict(batch='dunscar3',method='image_gen built-in; deterministic pixel UI',sources=provenance,postprocess=['nearest-neighbor per cell','shared 32-color indexed palette','binary alpha threshold 180','fixed bottom baseline','two identical windup frames','transparent unused cells'],derivedArt='Bestiary 96x128 and boss bands 160x160 use first idle pose; source frame listed in manifest.'),indent=2,ensure_ascii=False)+'\n')
    print(f'Exported {len(ASSETS)} assets')

if __name__=='__main__':main()
