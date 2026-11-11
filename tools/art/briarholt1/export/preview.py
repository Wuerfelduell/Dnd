from PIL import Image, ImageDraw
import glob, os
BG=(37,43,56,255)
def up(p,s): im=Image.open(p).convert('RGBA'); return im.resize((im.width*s,im.height*s),Image.NEAREST)
blocks=[]
# tilesets pairs at 2x
names=['bh_promenade','bh_kessel','bh_glas','bh_stille','bh_klinik','bh_wurzel']
row=[]
for n in names:
    a=up(f'out/tilesets/{n}_kalt.png',2); b=up(f'out/tilesets/{n}_warm.png',2)
    t=Image.new('RGBA',(a.width*2+8,a.height),BG); t.paste(a,(0,0)); t.paste(b,(a.width+8,0)); row.append(t)
blocks.append(row)
blocks.append([up(p,2) for p in sorted(glob.glob('out/props/*.png'))]+[up('out/fx/bh_waerme.png',2),up('out/ui/bh_marker.png',3)])
blocks.append([up(p,1) for p in ['out/ui/scenes/bh_ankunft.png','out/ui/scenes/kapitel5_karte.png']]+[up(f'out/ui/scenes/{n}.png',1) for n in ['bh_trockenraum','bh_pfirsich','bh_ende_wahl','bh_ende_winter','bh_ende_verwahrt','bh_ende_schmerzlos','bh_ende_schmerzlos_lichtmeister']])
blocks.append([up(p,1) for p in sorted(glob.glob('out/battle/*.png'))])
m=Image.open('out/ui/bh_karte.png').convert('RGBA'); l=m.copy(); l.alpha_composite(Image.open('out/ui/bh_karte_leitungen.png').convert('RGBA')); f=m.copy(); f.alpha_composite(Image.open('out/ui/bh_karte_nebel.png').convert('RGBA'))
blocks.append([m,l,f])
W=1600; pad=8
def layout(items):
    x=y=0; rh=0; pos=[]
    for it in items:
        if x+it.width>W: x=0; y+=rh+pad; rh=0
        pos.append((x,y)); x+=it.width+pad; rh=max(rh,it.height)
    return pos, y+rh
H=0; plans=[]
for b in blocks:
    pos,h=layout(b); plans.append((b,pos,H)); H+=h+24
P=Image.new('RGBA',(W,H),BG)
for b,pos,y0 in plans:
    for it,(x,y) in zip(b,pos): P.alpha_composite(it,(x,y0+y))
os.makedirs('out/docs',exist_ok=True)
P.convert('RGB').save('/workspace/batch-briarholt1-preview.png'); P.convert('RGB').save('out/docs/batch-briarholt1-preview.png')
print(P.size)
