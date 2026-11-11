from PIL import Image, ImageDraw, ImageFont
import json, glob
SP='/workspace/Dnd/public/sprites'; BG=(37,43,56,255); FG=(224,220,205,255); DIM=(150,160,170,255)
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',12)
Fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11)
Ft=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',18)
def up(p,s): im=Image.open(p).convert('RGBA'); return im.resize((im.width*s,im.height*s),Image.NEAREST)
man=json.load(open(f'{SP}/manifest-briarholt1.json')); by={a['file']:a for a in man['assets']}
TH=['bh_promenade','bh_kessel','bh_glas','bh_stille','bh_klinik','bh_wurzel']
S=4; CW=16*S
blocks=[]
for t in TH:
    k=up(f'{SP}/tilesets/{t}_kalt.png',S); w=up(f'{SP}/tilesets/{t}_warm.png',S)
    names=by[f'tilesets/{t}_kalt.png']['tileNames']; anim=by[f'tilesets/{t}_warm.png']['animations']
    listw=560
    B=Image.new('RGBA',(k.width*2+24+listw,k.height+34),BG); d=ImageDraw.Draw(B)
    d.text((0,4),f'{t}   kalt',font=Ft,fill=FG); d.text((k.width+24,4),'warm',font=Ft,fill=FG)
    for ox,im in ((0,k),(k.width+24,w)):
        B.paste(im,(ox,30))
        for i in range(40):
            x=ox+(i%8)*CW; y=30+(i//8)*CW
            d.rectangle([x,y,x+15,y+11],fill=(26,28,44,255)); d.text((x+1,y-1),str(i),font=Fs,fill=FG)
    lx=k.width*2+40
    for i,n in enumerate(names):
        col,row=divmod(i,20)
        d.text((lx+col*270,30+row*15),f'{i:2d} {n}',font=Fs,fill=FG)
    an=', '.join(f"{a}:{s['frames']}" for a,s in anim.items())
    d.text((lx,30+20*15+4),('anim warm: '+an)[:90],font=Fs,fill=DIM)
    blocks.append(B)
# fx + fog
fx=up(f'{SP}/fx/bh_waerme.png',4); fb=Image.new('RGBA',fx.size,(60,46,66,255)); fb.alpha_composite(fx)
B=Image.new('RGBA',(fb.width,fb.height+30),BG); ImageDraw.Draw(B).text((0,4),'fx/bh_waerme.png (4x, on dark violet)',font=Ft,fill=FG); B.paste(fb,(0,30)); blocks.append(B)
m=Image.open(f'{SP}/ui/bh_karte.png').convert('RGBA'); f=m.copy(); f.alpha_composite(Image.open(f'{SP}/ui/bh_karte_nebel.png').convert('RGBA'))
red=Image.new('RGBA',m.size,(110,50,60,255)); red.alpha_composite(Image.open(f'{SP}/ui/bh_karte_nebel.png').convert('RGBA'))
ds=Image.new('RGBA',m.size,(110,50,60,255)); ds.alpha_composite(Image.open(f'{SP}/ui/ds_karte_nebel.png').convert('RGBA'))
B=Image.new('RGBA',(m.width*2*2+16,m.height*2+30+m.height+30),BG); d=ImageDraw.Draw(B)
d.text((0,4),'ui/bh_karte_nebel.png on the map (2x)',font=Ft,fill=FG); B.paste(f.resize((m.width*2,m.height*2),Image.NEAREST),(0,30))
d.text((m.width*2+16,4),'bh_karte_nebel alone (2x)',font=Ft,fill=FG); B.paste(red.resize((m.width*2,m.height*2),Image.NEAREST),(m.width*2+16,30))
y=m.height*2+30; d.text((0,y+4),'reference ds_karte_nebel (1x)',font=Ft,fill=FG); B.paste(ds,(0,y+30))
blocks.append(B)
W=max(b.width for b in blocks); H=sum(b.height+20 for b in blocks)
P=Image.new('RGBA',(W,H),BG); y=0
for b in blocks: P.alpha_composite(b,(0,y)); y+=b.height+20
P.convert('RGB').save('/workspace/briarholt1-tilesets-preview.png'); print('tiles preview',P.size)
# full batch preview (same layout as v1), from the repo files
blocks=[]; row=[]
for n in TH:
    a=up(f'{SP}/tilesets/{n}_kalt.png',2); b=up(f'{SP}/tilesets/{n}_warm.png',2)
    t=Image.new('RGBA',(a.width*2+8,a.height),BG); t.paste(a,(0,0)); t.paste(b,(a.width+8,0)); row.append(t)
blocks.append(row)
blocks.append([up(p,2) for p in sorted(glob.glob(f'{SP}/props/bh_*.png'))]+[up(f'{SP}/fx/bh_waerme.png',2),up(f'{SP}/ui/bh_marker.png',3)])
sc=['bh_ankunft','kapitel5_karte','bh_trockenraum','bh_pfirsich','bh_ende_wahl','bh_ende_winter','bh_ende_verwahrt','bh_ende_schmerzlos','bh_ende_schmerzlos_lichtmeister']
blocks.append([up(f'{SP}/ui/scenes/{n}.png',1) for n in sc])
blocks.append([up(p,1) for p in sorted(glob.glob(f'{SP}/battle/bg_bh_*.png'))])
l=m.copy(); l.alpha_composite(Image.open(f'{SP}/ui/bh_karte_leitungen.png').convert('RGBA'))
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
P.convert('RGB').save('/workspace/batch-briarholt1-preview.png'); P.convert('RGB').save('/workspace/Dnd/docs/art/batch-briarholt1-preview.png'); print('batch preview',P.size)
