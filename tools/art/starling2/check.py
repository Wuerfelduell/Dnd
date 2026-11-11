#!/usr/bin/env python3
"""Independent BS delivery checks. Run from any directory; Pillow required."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SPRITES = ROOT / 'public/sprites'
EXPECTED = {
    'battle/starling2.png': (128,96,8,7),
    'battle/X_08_boss_starling2.png': (160,160,1,1),
    'battle/bg_sternwarte2.png': (480,270,1,1),
    'fx/starling2_fx.png': (48,48,6,5),
    'fx/starling2_sterne.png': (16,16,12,1),
    'ui/starling2_hud.png': (192,48,1,1),
    'portraits/starling2_emotions.png': (64,64,4,1),
    'ui/scenes/starling_phase2.png': (240,135,1,1),
    'battle/starling2_boden.png': (480,64,1,1),
    'fx/starling2_kuppel.png': (480,135,6,1),
    'ui/starling2_koop.png': (48,48,2,1),
}
OPAQUE = {'battle/bg_sternwarte2.png','ui/scenes/starling_phase2.png'}

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def require(condition, message):
    if not condition:raise AssertionError(message)
def frame(im, index, fw, fh, cols):
    x,y=index%cols*fw,index//cols*fh
    return im.crop((x,y,x+fw,y+fh))

def main():
    manifest=json.loads((SPRITES/'manifest-starling2.json').read_text())
    assets={a['file']:a for a in manifest['assets']}
    require(set(assets)==set(EXPECTED),'Missing or unexpected BS asset')
    palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
    require(len(palette)==31,'Expected common 31 visible colors')
    all_colors=set()
    images={}
    for path,(fw,fh,cols,rows) in EXPECTED.items():
        item=assets[path];im=Image.open(SPRITES/path).convert('RGBA');images[path]=im
        require(im.size==(fw*cols,fh*rows),f'{path}: dimensions')
        require([item[k] for k in ['frameWidth','frameHeight','columns','rows']]==[fw,fh,cols,rows],f'{path}: manifest raster')
        pixels=set(im.getdata());alphas={p[3] for p in pixels}
        require(alphas==({255} if path in OPAQUE else {0,255}),f'{path}: binary alpha / coverage')
        visible={p[:3] for p in pixels if p[3]}
        require(len(visible)<=32 and visible<=palette,f'{path}: palette')
        require(all(p==(0,0,0,0) for p in pixels if not p[3]),f'{path}: hidden matte RGB')
        all_colors.update(visible)
        require(sha(SPRITES/path)==item['sha256'],f'{path}: export hash')
        require(sha(ROOT/item['source'])==item['sourceSha256'],f'{path}: normalized source hash')
        for name,region in item.get('regions',{}).items():
            x,y,w,h=(region[k] for k in ['x','y','width','height'])
            require(all(type(v)==int for v in [x,y,w,h]),f'{path}/{name}: integer region')
            require(x>=0 and y>=0 and w>0 and h>0 and x+w<=im.width and y+h<=im.height,f'{path}/{name}: region bounds')
        for name,anim in item.get('animations',{}).items():
            require(anim['frames'] and all(type(f)==int and 0<=f<cols*rows for f in anim['frames']),f'{path}/{name}: frame bounds')
            require(anim['frameRate']>0 and anim['repeat'] in [-1,0],f'{path}/{name}: playback')
        print(f'OK {path}: {im.width}x{im.height}, {len(visible)} colors')
    require(len(all_colors)<=31,'Palette is not shared')
    boss=assets['battle/starling2.png'];im=images['battle/starling2.png']
    names=['idle','attack','special','cast','hit','phase_in','defeat'];counts=[4,6,6,6,3,8,6]
    require(list(boss['animations'])==names,'Boss animation names/order')
    active=set()
    for row,(name,count) in enumerate(zip(names,counts)):
        anim=boss['animations'][name];indices=list(range(row*8,row*8+count))
        require(anim['frames']==indices,f'Boss {name}: exact frame range')
        require(anim['frameRate']==(6 if name in ['idle','phase_in'] else 8),f'Boss {name}: speed')
        require(anim['repeat']==(-1 if name=='idle' else 0),f'Boss {name}: repeat')
        active.update(indices)
        hashes=[]
        for index in indices:
            f=frame(im,index,128,96,8);box=f.getchannel('A').getbbox()
            require(box is not None,f'Boss {name}: empty active frame {index}')
            require(box[0]>0 and box[1]>0 and box[2]<128 and box[3]<96,f'Boss {name}: clipped frame {index}')
            hashes.append(hashlib.sha256(f.tobytes()).hexdigest())
        require(len(set(hashes))>=count-(1 if name=='attack' else 0),f'Boss {name}: duplicate poses')
    blanks=set(range(56))-active
    require(len(active)==39 and len(blanks)==17 and set(boss['blankFrames'])==blanks,'Boss active/padding counts')
    require(all(frame(im,i,128,96,8).getchannel('A').getbbox() is None for i in blanks),'Nonempty padded boss cells')
    require(frame(im,8,128,96,8).tobytes()==frame(im,9,128,96,8).tobytes(),'Attack wind-up frames differ')
    fx=assets['fx/starling2_fx.png'];require(list(fx['animations'])==['stern_fall','linse','lanze_treffer','ernte_aufstieg','glas_bruch'],'FX names')
    for row,anim in enumerate(fx['animations'].values()):require(anim['frames']==list(range(row*6,row*6+6)),'FX frame range')
    # The lens animation intentionally begins invisible, then appears.
    fx_im=images['fx/starling2_fx.png']
    for i in range(30):
        require((frame(fx_im,i,48,48,6).getchannel('A').getbbox() is None)==(i==6),f'Unexpected empty FX frame {i}')
    centers=[]
    for i in range(18,24):
        alpha=frame(fx_im,i,48,48,6).getchannel('A');ys=[y for y in range(48) for x in range(48) if alpha.getpixel((x,y))]
        centers.append(sum(ys)/len(ys))
    require(all(a>b for a,b in zip(centers,centers[1:])),'Ascending star does not rise')
    stars=assets['fx/starling2_sterne.png']
    require(sorted(r['caseNumber'] for r in stars['regions'].values())==list(range(1,9)),'Eight case IDs')
    require(stars['animations']['funkeln']==dict(frames=[8,9,10,11],frameRate=8,repeat=-1),'Sparkle loop')
    star_im=images['fx/starling2_sterne.png']
    require(len({frame(star_im,i,16,16,12).tobytes() for i in range(12)})==12,'Star/sparkle duplicate')
    require(len(assets['battle/bg_sternwarte2.png']['regions'])==2,'Two light zones required')
    for state in ['leer','gefuellt']:
        regions=assets['ui/starling2_hud.png']['regions']
        require(len([k for k in regions if k.startswith('sockel_') and k.endswith('_'+state)])==8,'Eight HUD sockets per state')
    provenance=json.loads((ROOT/'docs/art/batch-starling2-generation.json').read_text())
    for reference in provenance['references']:
        require(sha(ROOT/reference['file'])==reference['sha256'],f"Phase-one reference changed: {reference['file']}")
    require(Image.open(ROOT/'docs/art/preview-starling2.png').size==(1080,1510),'Preview missing or incorrect')
    print('PASS: 11 atlases; 39 boss poses + 17 empty cells; 30 FX frames; 8 case symbols; unchanged phase-one references.')

if __name__=='__main__':main()
