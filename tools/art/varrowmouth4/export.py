#!/usr/bin/env python3
"""Export built-in imagegen receipts with the CZ-specified pixel postprocessing.
Usage: python tools/art/varrowmouth4/export.py /path/to/receipts.json
No network calls. Raw source images are located by receipt path and SHA recorded.
"""
import hashlib, json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[3]
SPR=ROOT/'public/sprites'; ART=ROOT/'docs/art'
SPEC=json.loads(Path(__file__).with_name('spec.json').read_text())
PALETTE=json.loads((SPR/'manifest-dunscar3.json').read_text())['palette']
RGB=np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE],dtype=np.int32)
ASSETS=[]; SOURCES=[]
def quantize(im):
    a=np.array(im.convert('RGBA')); mask=a[:,:,3]>=180
    colors,inv=np.unique(a[:,:,:3].reshape(-1,3),axis=0,return_inverse=True)
    nearest=((colors[:,None,:].astype(np.int32)-RGB[None,:,:])**2).sum(2).argmin(1)
    a[:,:,:3]=RGB[nearest[inv]].reshape(a.shape[:2]+(3,));a[:,:,3]=mask*255;a[~mask]=0
    return Image.fromarray(a)
def save(im,file,**meta):
    im=quantize(im); a=np.asarray(im); ix=np.zeros(a.shape[:2],dtype=np.uint8)
    for i,c in enumerate(RGB):ix[(a[:,:,:3]==c).all(2)&(a[:,:,3]>0)]=i+1
    out=Image.fromarray(ix).convert('P'); pal=[0,0,0]+RGB.astype(np.uint8).flatten().tolist()
    out.putpalette(pal+[0]*(768-len(pal)));out.info['transparency']=0
    p=SPR/file;p.parent.mkdir(parents=True,exist_ok=True);out.save(p,optimize=True)
    ASSETS.append(dict(id=Path(file).stem+'_'+meta['kind'],file=file,width=im.width,height=im.height,transparent=True,**meta))
def source(receipt):
    p=Path(receipt['path']);im=Image.open(p).convert('RGBA')
    a=np.array(im);a[a[:,:,3]<180]=0;a[a[:,:,3]>=180,3]=255
    history=[dict(prompt=h['prompt'],sourceFile=Path(h['path']).name,sourceSha256=hashlib.sha256(Path(h['path']).read_bytes()).hexdigest()) for h in receipt.get('history',[])]
    SOURCES.append(dict(id=receipt['id'],kind=receipt['kind'],generator='image_gen built-in',prompt=receipt['prompt'],sourceFile=p.name,sourceSha256=hashlib.sha256(p.read_bytes()).hexdigest(),history=history,styleReference='public/sprites/battle/battle_player.png'))
    return Image.fromarray(a)
def cut(raw,fw,fh,cols,rows,kind):
    cells=[]
    # Single-row effects are generated on wider canvases with vertical padding.
    if rows==1:
        bb=raw.getbbox()
        if bb:raw=raw.crop((0,max(0,bb[1]-3),raw.width,min(raw.height,bb[3]+3)))
    for y in range(rows):
        for x in range(cols):
            cell=raw.crop((round(x*raw.width/cols),round(y*raw.height/rows),round((x+1)*raw.width/cols),round((y+1)*raw.height/rows)))
            # Scale entire cell; retain relative pose sizes across all frames.
            scale=min((fw-2)/cell.width,(fh-3)/cell.height)
            if kind in ['walk','battle']:
                cell=cell.resize((fw-2,fh-3),Image.Resampling.NEAREST)
            else:cell=cell.resize((max(1,round(cell.width*scale)),max(1,round(cell.height*scale))),Image.Resampling.NEAREST)
            cell=quantize(cell);bb=cell.getbbox();out=Image.new('RGBA',(fw,fh))
            if not bb:raise ValueError(f'Empty frame {x},{y}')
            p=cell.crop(bb)
            # Grounded animation rows retain a fixed bottom anchor.
            yy=fh-2-p.height if kind in ['walk','battle','prop'] else (fh-p.height)//2
            out.alpha_composite(p,((fw-p.width)//2,yy));cells.append(out)
    return cells
def assemble(cells,fw,fh,cols):
    out=Image.new('RGBA',(fw*cols,fh*((len(cells)+cols-1)//cols)))
    for i,c in enumerate(cells):out.alpha_composite(c,((i%cols)*fw,(i//cols)*fh))
    return out
def meta(fw,fh,cols,rows,names,kind,**kw):
    return dict(kind=kind,frameWidth=fw,frameHeight=fh,columns=cols,rows=rows,occupiedCounts=[cols]*rows,regions={name:{'x':0,'y':i*fh,'width':fw*cols,'height':fh} for i,name in enumerate(names)},animations={name:{'frames':list(range(i*cols,(i+1)*cols)),'frameRate':6 if name in ['idle','down','left','right','up'] else 8,'repeat':-1 if name in ['idle','down','left','right','up','loop'] else 0} for i,name in enumerate(names)},**kw)
def fit(im,size,head=False):
    bb=im.getbbox();im=im.crop(bb)
    if head:im=im.crop((0,0,im.width,max(1,round(im.height*.43))))
    s=min((size-2)/im.width,(size-2)/im.height);im=im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),Image.Resampling.NEAREST)
    out=Image.new('RGBA',(size,size));out.alpha_composite(im,((size-im.width)//2,(size-im.height)//2));return out
def main():
    receipts={(r['id'],r['kind']):r for r in json.loads(Path(sys.argv[1]).read_text())}
    for i,(gid,fw,fh,desc,names) in enumerate(SPEC['characters']):
        cells=cut(source(receipts[gid,'battle']),fw,fh,6,len(names),'battle')
        held=[j for j,n in enumerate(names) if n.startswith('attack') or n=='special']
        for row in held:cells[row*6+1]=cells[row*6].copy()
        save(assemble(cells,fw,fh,6),f'battle/enemy_{gid}.png',**meta(fw,fh,6,len(names),names,'battle',gameId=gid,baseline=fh-2,heldRows=held))
        if i<7:
            ww=32 if gid=='vme_hafenkraehe' else 16
            walk=cut(source(receipts[gid,'walk']),ww,32,4,4,'walk')
            save(assemble(walk,ww,32,4),f'characters/{gid}.png',**meta(ww,32,4,4,['down','left','right','up'],'walk',gameId=gid,baseline=30))
            for kind,size,file in [('head',24,f'portraits/heads/{gid}.png'),('bestiary',48,f'ui/bestiar/{gid}.png')]:
                save(fit(cells[0],size,head=kind=='head' and gid not in ['vme_hafenkraehe','vme_tauwerk']),file,**meta(size,size,1,1,['still'],kind,gameId=gid,derivedFrom=f'battle/enemy_{gid}.png',sourceFrame=0))
    for i,(gid,fw,fh,n,desc) in enumerate(SPEC['effects']):
        cols,rows=(2,2) if gid=='vm_lichtkegel' else (n,1)
        kind='prop' if gid=='vm_wrackmutter_wrack' else 'fx'
        cells=cut(source(receipts[gid,kind]),fw,fh,cols,rows,kind)
        # Light cone exported as 4x1 strip, each full-screen frame 480x270.
        m=meta(fw,fh,n,1,['loop' if gid in ['vm_fessel','vm_verzeichnet','vm_geblendet','vm_gefesselt'] else 'play'],kind)
        if kind=='prop':m['states']={'closed':0,'open':1};m['animations']={'closed':{'frames':[0],'frameRate':1,'repeat':0},'open':{'frames':[1],'frameRate':1,'repeat':0}}
        save(assemble(cells,fw,fh,n),('props/' if kind=='prop' else 'fx/')+gid+'.png',**m)
    manifest=dict(version=1,batch='varrowmouth4',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=PALETTE,assets=ASSETS,externalAssets=[{'file':'battle/enemy_pegelherrin.png','owner':'CY','frameWidth':128,'frameHeight':96},{'file':'battle/enemy_pegelherrin_register.png','owner':'CY','frameWidth':128,'frameHeight':128}],notes=['Six regular enemy forms include the summoned salt remnant; elite is separate.','Crow overworld cells 32x32, four directions x four frames.','Heads and bestiary images are documented crops of generated combat idle poses.'])
    (SPR/'manifest-varrowmouth4.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    (ART/'batch-varrowmouth4-generation.json').write_text(json.dumps({'batch':'varrowmouth4','method':'image_gen built-in; nearest-neighbor resize; fixed shared palette; alpha threshold 180; explicit duplicate windup frame','sources':SOURCES,'derivedAssets':[a for a in ASSETS if 'derivedFrom' in a]},indent=2,ensure_ascii=False)+'\n')
    preview=Image.new('RGB',(1000,((len(ASSETS)+4)//5)*150),'#252d38');d=ImageDraw.Draw(preview)
    for i,a in enumerate(ASSETS):
        im=Image.open(SPR/a['file']).convert('RGBA').crop((0,0,a['frameWidth'],a['frameHeight']));s=min(176/im.width,108/im.height);im=im.resize((int(im.width*s),int(im.height*s)),Image.Resampling.NEAREST)
        x=(i%5)*200;y=(i//5)*150;preview.paste(im,(x+(200-im.width)//2,y),im);d.text((x+4,y+112),Path(a['file']).stem[:27],fill='#d4d0bc');d.text((x+4,y+128),a['kind']+' '+str(a['width'])+'x'+str(a['height']),fill='#a8b4c0')
    preview.save(ART/'batch-varrowmouth4-preview.png')
    print(f'Exported {len(ASSETS)} assets from {len(SOURCES)} imagegen sources.')
if __name__=='__main__':main()
