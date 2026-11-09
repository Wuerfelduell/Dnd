"""Technical export of image_gen artwork. Run from repo root with source directory.

Requires Pillow and numpy. No artwork is procedurally substituted.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PALETTE = ['#1a1c2c','#252b38','#303b49','#425360','#586c78','#71858b',
 '#95a5a5','#a8b4c0','#2d2629','#58433c','#715648','#92745a','#b3946e',
 '#cfb18a','#e0c9a1','#494b3a','#686850','#8b8870','#eee2c5',
 '#173d40','#245b59','#36817a','#4eafa2','#6fe0d0',
 '#886332','#d0a050','#e8b860','#f0ce80','#c8b0e8','#e07a8a','#9ad06a','#893e4e']
RGB = np.array([tuple(bytes.fromhex(c[1:])) for c in PALETTE], dtype=np.int32)

def quantize(im, transparent):
    a = np.array(im.convert('RGBA'))
    flat = a[:,:,:3].reshape(-1,3).astype(np.int32)
    out = np.empty_like(flat,dtype=np.uint8)
    for start in range(0,len(flat),8192):
        chunk=flat[start:start+8192]
        out[start:start+8192]=RGB[((chunk[:,None,:]-RGB[None,:,:])**2).sum(2).argmin(1)]
    a[:,:,:3]=out.reshape(a.shape[0],a.shape[1],3)
    a[:,:,3]=np.where(a[:,:,3]>=128,255,0) if transparent else 255
    a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a)

def crop_cell(im,c,r,cols,rows):
    return im.crop((round(c*im.width/cols),round(r*im.height/rows),
                    round((c+1)*im.width/cols),round((r+1)*im.height/rows)))

def export(job, source):
    im=Image.open(source).convert('RGBA'); kind=job['kind']
    w,h=job['size']; cell=job.get('cell')
    cols=job.get('columns'); rows=job.get('rows')
    out=Image.new('RGBA',(w,h))
    if kind in ['enemy','player']:
        for r,n in enumerate(job['counts']):
            for c in range(n):
                sc=0 if kind=='enemy' and r in (1,2) and c==1 else c
                f=crop_cell(im,sc,r,cols,rows).resize((cell-4,cell-4),Image.Resampling.NEAREST)
                f=quantize(f,True)
                if job['id']=='enemy_spiegelschatten': f=f.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                bbox=f.getchannel('A').getbbox()
                dy=cell-3-bbox[3] if bbox else 2
                out.paste(f,(c*cell+2,r*cell+dy))
    elif kind=='effect' or job['id']=='status_icons':
        sc=job['sourceColumns']; sr=job['sourceRows']
        for i in range(cols):
            f=ImageOps.contain(crop_cell(im,i%sc,i//sc,sc,sr),(cell-2,cell-2),Image.Resampling.NEAREST)
            out.paste(f,(i*cell+(cell-f.width)//2,(cell-f.height)//2))
    elif job['id']=='damage_font':
        for r,row in enumerate(job['glyphSourceRects']):
            for c,box in enumerate(row):
                f=im.crop(box)
                size=(7,9) if c<10 else (7,7) if c==10 else (7,3)
                f=f.resize(size,Image.Resampling.NEAREST)
                out.paste(f,(c*8,r*10+(10-size[1])//2))
    elif job.get('sourceRegions'):
        manifest=json.loads((ROOT/'public/sprites/manifest-kampf.json').read_text())
        regions=next(a for a in manifest['assets'] if a['id']==job['id'])['regions']
        for name,box in job['sourceRegions'].items():
            reg=regions[name];f=im.crop(box).resize((reg['width'],reg['height']),Image.Resampling.NEAREST)
            out.paste(f,(reg['x'],reg['y']))
    elif kind=='transition':
        for i in range(6):
            f=crop_cell(im,i%2,i//2,2,3)
            # Remove one-pixel generator separators before fitting to the frame.
            f=f.crop((2,2,f.width-2,f.height-2)).resize((480,270),Image.Resampling.NEAREST)
            if i==0 and job['id']=='transition_out':f=Image.new('RGBA',(480,270),'#1a1c2c')
            if i==5: f=Image.new('RGBA',(480,270),'#1a1c2c' if job['id']=='transition_in' else (0,0,0,0))
            out.paste(f,(i*480,0))
    elif job['id']=='hits':
        for r,n in enumerate(job['counts']):
            size=48 if r==4 else 32
            for c in range(n):
                f=crop_cell(im,c,r,5,9).resize((size-4,size-4),Image.Resampling.NEAREST)
                inset=(48-size)//2+2
                out.paste(f,(c*48+inset,r*48+inset))
    else:
        out=im.resize((w,h),Image.Resampling.NEAREST)
    out=quantize(out,job['transparent'])
    a=np.array(out); indices=np.zeros((h,w),dtype=np.uint8)
    for i,rgb in enumerate(RGB): indices[(a[:,:,:3]==rgb).all(2)&(a[:,:,3]>0)]=i+1
    indexed=Image.fromarray(indices,mode='P')
    indexed.putpalette(([0,0,0]+RGB.astype('uint8').flatten().tolist()+[0]*768)[:768])
    target=ROOT/'public/sprites'/job['path']; target.parent.mkdir(parents=True,exist_ok=True)
    if job['transparent']: indexed.save(target,transparency=0,optimize=True)
    else: indexed.save(target,optimize=True)

if __name__=='__main__':
    spec=json.loads((ROOT/'docs/art/batch-kampf-generation.json').read_text())
    directory=Path(sys.argv[1]) if len(sys.argv)>1 else None
    for j in spec['jobs']:
        source=directory/Path(j['source']).name if directory else Path(j['source'])
        export(j,source)
    print(f"Exported {len(spec['jobs'])} assets")
