#!/usr/bin/env python3
"""Build EA2 from the detailed Seq-3 creatures, frame by frame at 4x."""
from __future__ import annotations
from collections import Counter
import json, os, tempfile
from pathlib import Path
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[3]
SPRITES=ROOT/'public/sprites'
SRC=ROOT/'tools/art/gestalt2b/sources/seq3'
RAW=Path(os.environ.get('GESTALT2B_RAW_DIR',Path(tempfile.gettempdir())/'Dnd-gestalt2b-raw'))
PATHS=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
S=4

def rgb(hex_value): return tuple(bytes.fromhex(hex_value.lstrip('#')))
def hx(c): return '#%02x%02x%02x'%c

def reference_palette():
    im=Image.open(SPRITES/'battle/battle_player.png').convert('RGBA')
    counts=Counter(px[:3] for px in im.get_flattened_data() if px[3])
    return [c for c,_ in counts.most_common()]

GAME_PALETTE=reference_palette()
OUT=rgb('#1a1c2c')

def nearest(color, choices=GAME_PALETTE):
    return min(choices,key=lambda c:sum((c[i]-color[i])**2 for i in range(3)))

def normalize(im):
    """Keep Seq-3 shading but map its few out-of-reference tones to game colors."""
    im=im.convert('RGBA')
    source_colors={px[:3] for px in im.get_flattened_data() if px[3]}
    mapping={c:nearest(c) for c in source_colors}
    data=[]
    for r,g,b,a in im.get_flattened_data():
        if not a: data.append((0,0,0,0))
        else: data.append((*mapping[(r,g,b)],255))
    out=Image.new('RGBA',im.size);out.putdata(data);return out

class Pixel:
    def __init__(self,w,h):
        self.w,self.h=w,h
        self.im=Image.new('RGBA',(w*S,h*S),(0,0,0,0));self.d=ImageDraw.Draw(self.im)
    def line(self,pts,color,width=1):
        q=[(round(x*S),round(y*S)) for x,y in pts]
        self.d.line(q,fill=color,width=max(1,width*S),joint='curve')
    def poly(self,pts,fill,outline=OUT,width=1):
        q=[(round(x*S),round(y*S)) for x,y in pts]
        self.d.polygon(q,fill=fill)
        if outline:self.d.line(q+[q[0]],fill=outline,width=max(1,width*S),joint='curve')
    def rect(self,box,fill,outline=OUT,width=1):
        x0,y0,x1,y1=box
        self.d.rectangle((round(min(x0,x1)*S),round(min(y0,y1)*S),round(max(x0,x1)*S),round(max(y0,y1)*S)),fill=fill,outline=outline,width=max(1,width*S))
    def ellipse(self,box,fill=None,outline=OUT,width=1):
        x0,y0,x1,y1=box
        self.d.ellipse((round(min(x0,x1)*S),round(min(y0,y1)*S),round(max(x0,x1)*S),round(max(y0,y1)*S)),fill=fill,outline=outline,width=max(1,width*S))
    def arc(self,box,start,end,color,width=1):
        x0,y0,x1,y1=box
        self.d.arc((round(x0*S),round(y0*S),round(x1*S),round(y1*S)),start,end,fill=color,width=max(1,width*S))
    def finish(self,raw_path,size):
        self.im.save(raw_path)
        return self.im.resize(size,Image.Resampling.NEAREST)

def colors_for(path):
    # These are colors present in the game's player palette; the detailed Seq-3 body stays intact.
    return {
      'ink':nearest(rgb('#1a1c2c')),'dark':nearest(rgb('#252b38')),'shade':nearest(rgb('#303b49')),
      'slate':nearest(rgb('#425360')),'steel':nearest(rgb('#586c78')),'pale':nearest(rgb('#b4ac91')),
      'bone':nearest(rgb('#e0c9a1')),'brown':nearest(rgb('#58433c')),'brass':nearest(rgb('#886332')),
      'gold':nearest(rgb('#dbac5d')),'amber':nearest(rgb('#f0ce80')),'moss':nearest(rgb('#686850')),
      'teal':nearest(rgb('#36817a')),'mint':nearest(rgb('#6fe0d0')),
    }

def draw_battle_wings(c,p,phase,tick,col):
    ink,dark,shade=col['ink'],col['dark'],col['shade']
    mid=col['brass'] if p in ('laterne','kessel','eisen','schluessel','sq_waage','sq_uhr') else col['slate']
    lit=col['mint'] if p in ('faden','echo','sq_moor') else col['amber']
    spread={'idle':0,'attack1':10,'attack2':13,'special':18,'hurt':-10,'defeated':-2}[phase]
    spread += (0,1,2,1,0,-1)[tick%6] if phase in ('idle','special') else 0
    cx,cy=48,47
    if phase=='defeated':
        for side in (-1,1):
            for i in range(4):
                x=cx+side*(15+i*7);y=cy+4+(i%2)*8+tick
                c.poly([(x,y-2),(x+3,y),(x+1,y+4),(x-2,y+2)],lit if i%2 else mid,ink)
        return
    if p=='laterne':
        for side in (-1,1):
            for j in range(3):
                sx,sy=cx+side*5,cy-9+j*9
                ex,ey=cx+side*min(42,28+j*6+spread),cy-30+j*22
                c.line([(sx,sy),(cx+side*17,sy+j*2),(ex,ey)],dark,4)
                c.line([(sx,sy),(cx+side*17,sy+j*2),(ex,ey)],mid,2)
                c.line([(sx,sy),(cx+side*17,sy+j*2),(ex,ey)],lit,1)
                c.poly([(ex-3,ey),(ex,ey-6),(ex+3,ey),(ex+2,ey+5),(ex-2,ey+5)],col['amber'],ink)
                c.rect((ex-1,ey-1,ex+1,ey+2),col['bone'],None)
    elif p=='faden':
        for side in (-1,1):
            top=(cx+side*8,2);tip=(cx+side*min(42,39+spread),cy+22)
            c.line([(cx+side*10,cy-10),tip],dark,4)
            c.line([(cx+side*10,cy-10),tip],col['steel'],2)
            c.poly([(tip[0]-2,tip[1]-2),(tip[0],tip[1]-7),(tip[0]+2,tip[1]-2),(tip[0],tip[1]+3)],col['bone'],ink)
            for j in range(5):
                x=cx+side*(5+j*6)
                c.line([(x,cy-12),(x-side*2,2)],dark,2)
                c.line([(x,cy-12),(x-side*2,2)],col['pale'],1)
            for j in range(6):
                t=(j+1)/7;x=cx+side*(8+31*t);y=cy-10+32*t
                c.line([(cx+side*8,cy-10),(x,y),(tip[0],tip[1])],col['pale'] if j%2 else lit,1)
    elif p=='maske':
        for side in (-1,1):
            for j in range(3):
                x=cx+side*min(40,20+j*8+spread);y=cy-20+j*20
                c.line([(cx+side*7,cy-4+j*4),(x,y)],dark,3)
                c.line([(cx+side*7,cy-4+j*4),(x,y)],mid,1)
                c.ellipse((x-5,y-7,x+5,y+7),col['bone'],ink,1)
                c.ellipse((x-3,y-5,x+3,y+5),col['pale'],None)
                c.line([(x-2,y),(x,y+1),(x+2,y)],ink,1)
                c.rect((x-1,y+4,x+1,y+4),col['amber'],None)
    elif p=='echo':
        for r in (22,32,42):
            for side in (-1,1):
                box=(cx-r,cy-r//2,cx+r,cy+r//2)
                c.arc(box,100 if side<0 else 260,260 if side<0 else 440,shade,3)
                c.arc((box[0]+1,box[1]+1,box[2]+1,box[3]+1),100 if side<0 else 260,260 if side<0 else 440,mid,1)
        # Bell crown opens above the creature, with a dark hollow and a teal glint.
        c.poly([(cx-13,cy-7),(cx-9,cy-18),(cx,cy-22),(cx+9,cy-18),(cx+13,cy-7),(cx+7,cy-4),(cx-7,cy-4)],col['steel'],ink,2)
        c.arc((cx-8,cy-17,cx+8,cy-7),190,350,lit,1)
    elif p=='kessel':
        # Stepped, shaded steam puffs; the top-left is pale and the underside sooty.
        for side in (-1,1):
            for j in range(4):
                x=cx+side*min(36,28+j*3+spread//3);y=cy-25+j*15
                c.poly([(x-5,y+2),(x-5,y-1),(x-3,y-1),(x-3,y-4),(x,y-6),(x+3,y-5),(x+3,y-3),(x+5,y-2),(x+5,y+2),(x+3,y+4),(x-3,y+4)],col['steel'] if j%2 else col['pale'],ink,1)
                c.poly([(x-3,y+1),(x-3,y-2),(x-1,y-4),(x+2,y-3),(x+2,y),(x+4,y+1),(x+3,y+3),(x-2,y+3)],col['slate'],None)
                c.line([(x-3,y-2),(x-1,y-4),(x+1,y-4)],lit,1)
                c.rect((x+1,y+1,x+2,y+2),col['pale'],None)
        c.ellipse((cx-18,cy-39,cx+18,cy-28),None,col['gold'],2)
        c.poly([(cx-12,cy-33),(cx,cy-39),(cx+12,cy-33),(cx+7,cy-29),(cx-7,cy-29)],col['brass'],ink)
        c.line([(cx-8,cy-33),(cx,cy-36),(cx+8,cy-33)],col['amber'],1)
    elif p=='eisen':
        c.ellipse((cx-37,cy-30,cx+37,cy+31),None,col['brass'],3)
        c.ellipse((cx-33,cy-26,cx+33,cy+27),None,col['gold'],1)
        for side in (-1,1):
            for j in range(3):
                x=cx+side*min(36,22+j*4+spread);y=cy-22+j*18
                c.poly([(cx+side*7,cy-8+j*4),(x-side*4,y-13),(x+5,y-8),(x+9,y+2),(x+4,y+12),(cx+side*10,cy+5+j*3)],col['steel'] if j%2 else col['slate'],ink,2)
                c.line([(cx+side*10,cy-6+j*4),(x+4,y+3)],col['pale'],1)
                c.ellipse((x+1,y-3,x+4,y),col['gold'],ink,1)
    elif p=='schluessel':
        for side in (-1,1):
            x=cx+side*min(37,31+spread)
            inner=cx+side*12;outer=cx+side*37
            # Four shaded frame pieces leave an open doorway for the light to pass through.
            c.rect((inner-side*2,cy-29,inner+side*2,cy+27),col['brass'],ink,1)
            c.rect((outer-side*2,cy-29,outer+side*2,cy+27),col['brass'],ink,1)
            c.rect((inner,cy-29,outer,cy-24),col['brass'],ink,1)
            c.rect((inner,cy+22,outer,cy+27),col['brass'],ink,1)
            c.line([(inner,cy-26),(outer,cy-26)],col['gold'],1)
            c.line([(inner+side*4,cy+15),(inner+side*4,cy-9)],col['amber'],2)
            c.line([(inner+side*7,cy+14),(inner+side*7,cy-13)],col['bone'],1)
            c.line([(inner+side*10,cy+12),(inner+side*10,cy-5)],col['gold'],1)
        for j in range(7):
            x=cx-14+j*4;y=cy+19+(j%2)*4
            c.ellipse((x-2,y-2,x+2,y+2),None,col['gold'],1)
            c.line([(x,y+2),(x+2,y+7),(x+5,y+7)],col['pale'],1)
    elif p=='sq_waage':
        c.line([(cx-40,cy-20),(cx+40,cy-20)],dark,5)
        c.line([(cx-40,cy-20),(cx+40,cy-20)],col['gold'],2)
        c.poly([(cx,cy-31),(cx-5,cy-20),(cx+5,cy-20)],col['brass'],ink)
        for side in (-1,1):
            x=cx+side*min(31,30+spread);y=cy+1
            c.line([(cx+side*10,cy-20),(x,y-5)],dark,3)
            c.line([(cx+side*10,cy-20),(x,y-5)],col['gold'],1)
            c.ellipse((x-13,y-14,x+13,y+12),col['brass'],ink,2)
            c.ellipse((x-9,y-10,x+9,y+8),col['bone'],col['slate'],1)
            c.arc((x-7,y-8,x+7,y+5),0,180,col['pale'],1)
    elif p=='sq_moor':
        for side in (-1,1):
            for j in range(4):
                x=cx+side*min(36,17+j*6+spread//2);y=cy-27+(j%2)*8
                c.line([(cx+side*8,cy+12-j*3),(x,y+42)],dark,3)
                c.line([(cx+side*8,cy+12-j*3),(x,y+42)],col['moss'],1)
                c.poly([(x,y),(x-5,y+10),(x,y+20),(x+5,y+11)],col['moss'],ink)
                c.line([(x,y+3),(x,y+15)],col['pale'],1)
                c.ellipse((x-3,y+12,x+3,y+19),col['teal'],ink,1)
                if j%2==0:c.ellipse((x-2,y-5,x+2,y+3),col['brown'],ink,1)
    else: # sq_uhr
        # A compact gear halo sits over the clock head, above both hand-blade wings.
        c.ellipse((cx-17,cy-42,cx+17,cy-10),None,col['brass'],3)
        c.ellipse((cx-13,cy-38,cx+13,cy-14),None,col['gold'],1)
        for j in range(12):
            import math
            a=math.pi*2*j/12
            x=cx+round(math.cos(a)*17);y=cy-26+round(math.sin(a)*17)
            c.rect((x-1,y-1,x+1,y+1),col['brass'],ink,1)
        for side in (-1,1):
            # Long, narrow clock hands: an edged shaft, brighter spine and distinct arrow tip.
            tip=min(43,36+spread)
            c.poly([(cx+side*4,cy+8),(cx+side*10,cy+7),(cx+side*34,cy-19),(cx+side*40,cy-29),(cx+side*tip,cy-38),(cx+side*(tip-5),cy-34),(cx+side*10,cy-3)],col['steel'],ink,1)
            c.line([(cx+side*6,cy+6),(cx+side*35,cy-24)],col['brass'],2)
            c.line([(cx+side*7,cy+4),(cx+side*34,cy-23)],col['pale'],1)
            c.poly([(cx+side*tip,cy-38),(cx+side*(tip-6),cy-34),(cx+side*(tip-3),cy-32)],col['amber'],ink,1)
        c.poly([(cx-4,cy+25),(cx+4,cy+25),(cx+6,cy+39),(cx,cy+43),(cx-6,cy+39)],col['amber'],ink)
        c.line([(cx,cy+28),(cx,cy+39)],col['bone'],1)
    if phase=='special':
        c.ellipse((9,3,87,91),None,ink,4)
        c.ellipse((11,5,85,89),None,lit,2)
        for x,y in [(12,16),(82,19),(9,70),(86,69)]:
            c.poly([(x,y-4),(x+2,y-1),(x+5,y),(x+2,y+2),(x,y+5),(x-2,y+2),(x-5,y),(x-2,y-1)],lit,ink,1)

def draw_card_wings(c,p,direction,tick,col):
    ink,dark=col['ink'],col['dark'];mid=col['brass'] if p not in ('faden','echo','sq_moor') else col['steel']
    lit=col['mint'] if p in ('faden','echo','sq_moor') else col['amber']
    spread=(0,1,2,1)[tick%4]
    if p=='laterne':
        for side in (-1,1):
            for j in range(3):
                ex=16+side*min(12,10+j+spread);ey=10+j*9
                c.line([(16+side*3,19+j*2),(ex,ey)],dark,2);c.line([(16+side*3,19+j*2),(ex,ey)],lit,1)
                c.poly([(ex-1,ey),(ex,ey-3),(ex+2,ey),(ex+1,ey+3)],col['amber'],ink)
    elif p=='faden':
        for side in (-1,1):
            c.line([(16+side*5,16),(16+side*13,7),(16+side*13,4)],dark,2)
            c.line([(16+side*5,16),(16+side*13,7),(16+side*13,4)],col['pale'],1)
            c.poly([(16+side*13,4),(16+side*12,1),(16+side*11,5)],col['bone'],ink)
            for x in range(3,14,3):c.line([(16+side*5,16),(16+side*x,2)],lit,1)
    elif p=='maske':
        for side in (-1,1):
            for j in range(2):
                x=16+side*min(11,10+j+spread);y=15+j*10
                c.ellipse((x-2,y-3,x+2,y+3),col['bone'],ink,1);c.line([(x-1,y),(x+1,y)],ink,1)
    elif p=='echo':
        for r in (7,10,12):
            c.arc((16-r,16-r//2,16+r,16+r//2),100,260,mid,1)
            c.arc((16-r,16-r//2,16+r,16+r//2),280,440,mid,1)
            c.arc((17-r,16-r//2+1,17+r,16+r//2+1),100,260,dark,1)
    elif p=='kessel':
        for side in (-1,1):
            for j in range(3):
                x=16+side*min(11,9+j+spread);y=11+j*9
                c.rect((x-2,y-2,x+2,y+2),col['pale'] if j%2 else col['steel'],ink,1)
                c.rect((x-1,y-3,x+1,y),mid,ink,1)
    elif p=='eisen':
        for side in (-1,1):
            for j in range(2):
                x=16+side*min(10,10+j+spread);y=14+j*10
                c.poly([(16+side*4,y+4),(x-2,y-4),(x+2,y-2),(x+3,y+4),(x,y+8)],col['steel'],ink)
                c.line([(16+side*5,y+4),(x,y)],col['pale'],1);c.rect((x-1,y+2,x,y+3),col['gold'],ink,1)
    elif p=='schluessel':
        for side in (-1,1):
            x=16+side*min(8,12+spread)
            c.rect((x-3,11,x+3,34),None,ink,2);c.line([(x,12),(x,33)],mid,1)
            c.line([(x-1,16),(x+1,14)],lit,1)
        for j in range(3):c.ellipse((12+j*4,31,14+j*4,33),None,col['gold'],1)
    elif p=='sq_waage':
        c.line([(4,16),(28,16)],dark,3);c.line([(4,16),(28,16)],col['gold'],1)
        for x in (6,26):
            c.line([(16+(x-16)//2,16),(x,22)],mid,1)
            c.ellipse((x-4,19,x+4,27),col['bone'],ink,1);c.arc((x-3,20,x+3,25),0,180,col['pale'],1)
    elif p=='sq_moor':
        for side in (-1,1):
            for j in range(3):
                x=16+side*min(11,9+j*2);y=9+(j%2)*4
                c.line([(16+side*5,29),(x,y+21)],dark,2)
                c.poly([(x,y),(x-2,y+7),(x,y+12),(x+2,y+7)],col['moss'],ink)
                c.rect((x-1,y+7,x+1,y+9),col['teal'],None)
    else:
        for side in (-1,1):
            x=16+side*min(11,11+spread)
            c.poly([(16+side*4,17),(x,5),(x+side*2,3),(x-side*2,23),(16+side*6,22)],col['steel'],ink)
            c.line([(16+side*4,17),(x,6)],col['pale'],1)
        c.ellipse((11,5,21,14),None,col['gold'],1)

def shift(frame,dx,dy,clip_bottom=None):
    out=Image.new('RGBA',frame.size,(0,0,0,0));out.alpha_composite(frame,(dx,dy))
    if clip_bottom is not None:
        pix=out.load()
        for y in range(clip_bottom,out.height):
            for x in range(out.width):pix[x,y]=(0,0,0,0)
    return out

def clear_cell_border(high,w,h):
    """Keep the outermost target pixel row/column transparent in each raw frame."""
    d=ImageDraw.Draw(high);z=(0,0,0,0);lastx=w*S-1;lasty=h*S-1
    d.rectangle((0,0,w*S-1,S-1),fill=z)
    d.rectangle((0,(h-1)*S,w*S-1,lasty),fill=z)
    d.rectangle((0,0,S-1,h*S-1),fill=z)
    d.rectangle(((w-1)*S,0,lastx,h*S-1),fill=z)

def card_frame(path,idx,col,raw_path):
    src=Image.open(SRC/f'characters/hg_form_{path}_s3.png').convert('RGBA')
    r,c=divmod(idx,4);base=normalize(src.crop((c*32,r*48,(c+1)*32,(r+1)*48)))
    # Keep the four real Seq-3 facings and poses. Bob by one pixel while trimming the old ground contact.
    bob=(0,-1,0,1)[c]
    base=shift(base,0,bob,clip_bottom=44)
    art=Pixel(32,48);draw_card_wings(art,path,['down','left','right','up'][r],c,col)
    high=art.im.copy();high.alpha_composite(base.resize((32*S,48*S),Image.Resampling.NEAREST))
    d=ImageDraw.Draw(high); shadow=col['dark']
    # Fixed pixel shadow on y=45-46; body pixels stop at y=43.
    d.rectangle((13*S,45*S,19*S+S-1,45*S+S-1),fill=shadow)
    d.rectangle((15*S,46*S,17*S+S-1,46*S+S-1),fill=shadow)
    # Path core in the existing torso; amber by default, pale bog light for Moor.
    core=col['mint'] if path=='sq_moor' else col['amber']
    d.rectangle((15*S,26*S,16*S,28*S),fill=core)
    clear_cell_border(high,32,48)
    raw=high;raw.save(raw_path)
    out=raw.resize((32,48),Image.Resampling.NEAREST)
    return normalize(out)

def defeated(base,local,col):
    out=base.copy();px=out.load()
    if local<5:
        # Progressive pixel breakup along the silhouette, keeping the original outline and shading.
        threshold=2+local*2
        for y in range(out.height):
            for x in range(out.width):
                if px[x,y][3] and ((x*7+y*11+local*5)%19)<threshold and y<88:
                    px[x,y]=(0,0,0,0)
    else:
        # Last pose is only the core and the fallen lower mantle on the floor.
        for y in range(out.height):
            for x in range(out.width):
                if px[x,y][3] and not (36<=x<=59 and 68<=y<=92):px[x,y]=(0,0,0,0)
    return out

def draw_attack_effect(art,path,phase,tick,col):
    if phase=='attack1':
        # A broad sweep follows the material of the creature's wings.
        color=col['mint'] if path in ('faden','echo','sq_moor') else col['gold']
        c=art
        x=62+tick*2
        c.poly([(x,39),(90,31),(92,37),(x+5,46),(x+1,53)],color,col['ink'],1)
        c.line([(x+4,42),(90,35)],col['amber'] if path not in ('faden','echo','sq_moor') else col['pale'],1)
    elif phase=='attack2':
        color=col['mint'] if path in ('faden','echo','sq_moor') else col['amber']
        c=art
        c.line([(56,52),(75,47),(91,39)],col['ink'],5)
        c.line([(56,52),(75,47),(91,39)],color,3)
        c.line([(57,51),(76,46),(91,39)],col['bone'],1)
        c.poly([(90,39),(87,33),(93,37),(93,42)],color,col['ink'],1)
        for j in range(3):c.rect((81+j*3,43-j*2,82+j*3,44-j*2),col['bone'] if j==1 else color,None)

def fight_frame(path,idx,col,raw_path):
    src=Image.open(SRC/f'battle/hg_battle_{path}_s3.png').convert('RGBA')
    row,local=divmod(idx,6);phase=['idle','attack1','attack2','special','hurt','defeated'][row]
    base=normalize(src.crop((local*96,row*96,(local+1)*96,(row+1)*96)))
    if phase=='hurt':dx=-2;dy=-2
    elif phase=='defeated':dx=0;dy=-3+min(local,3)
    else:
        bob=(0,-1,0,1,1,0)[local] if phase=='idle' else (0,1,2,1,0,-1)[local]
        dx=0;dy=-3+bob
    clip=93 if phase=='defeated' and local==5 else 91
    base=shift(base,dx,dy,clip_bottom=clip)
    if phase=='defeated':base=defeated(base,local,col)
    art=Pixel(96,96);draw_battle_wings(art,path,phase,local,col)
    high=art.im.copy();high.alpha_composite(base.resize((96*S,96*S),Image.Resampling.NEAREST))
    fx=Pixel(96,96);draw_attack_effect(fx,path,phase,local,col);high.alpha_composite(fx.im)
    d=ImageDraw.Draw(high)
    d.rectangle((42*S,93*S,54*S+S-1,93*S+S-1),fill=col['dark'])
    d.rectangle((45*S,94*S,51*S+S-1,94*S+S-1),fill=col['dark'])
    core=col['mint'] if path=='sq_moor' else col['amber']
    if phase!='defeated' or local<5:
        d.rectangle((47*S,49*S,50*S,53*S),fill=core)
    if phase=='defeated':
        for j in range(5-local if local<5 else 3):
            x=24+(j*13+local*3)%48;y=75+(j%3)*5
            d.rectangle((x*S,y*S,(x+2)*S,(y+1)*S),col['mint'] if path in ('faden','echo','sq_moor') else col['gold'])
    clear_cell_border(high,96,96)
    high.save(raw_path)
    return high.resize((96,96),Image.Resampling.NEAREST)

def main():
    assets=[]
    pal=[hx(c) for c in GAME_PALETTE]
    for p in PATHS:
        col=colors_for(p);frames=[];rawdir=RAW/p;rawdir.mkdir(parents=True,exist_ok=True)
        for i in range(16):frames.append(card_frame(p,i,col,rawdir/f'card_{i:02d}.png'))
        rel=f'characters/hg_form_{p}_s2.png';sheet=Image.new('RGBA',(128,192),(0,0,0,0))
        for i,im in enumerate(frames):sheet.alpha_composite(im,((i%4)*32,(i//4)*48))
        sheet.save(SPRITES/rel,optimize=True)
        assets.append({'id':f'hg_form_{p}_s2','file':rel,'width':128,'height':192,'kind':'spritesheet','transparent':True,'frameWidth':32,'frameHeight':48,'columns':4,'rows':4,'baseline':46,'animations':{d:{'frames':list(range(r*4,r*4+4)),'frameRate':8,'repeat':-1} for r,d in enumerate(['down','left','right','up'])}})
        fight=[]
        for i in range(36):fight.append(fight_frame(p,i,col,rawdir/f'battle_{i:02d}.png'))
        # Frames 3 and 4 (one-based) are the intentional anticipation hold.
        fight[8]=fight[9]=fight[8].copy()
        (rawdir/'battle_09.png').write_bytes((rawdir/'battle_08.png').read_bytes())
        rel=f'battle/hg_battle_{p}_s2.png';sheet=Image.new('RGBA',(576,576),(0,0,0,0))
        for i,im in enumerate(fight):sheet.alpha_composite(im,((i%6)*96,(i//6)*96))
        sheet.save(SPRITES/rel,optimize=True)
        anims={}
        for r,d in enumerate(['idle','attack1','attack2','special','hurt','defeated']):
            anims[d]={'frames':list(range(r*6,r*6+6)),'frameRate':6 if d=='idle' else 8,'repeat':-1 if d in ('idle','attack1','attack2') else 0}
        assets.append({'id':f'hg_battle_{p}_s2','file':rel,'width':576,'height':576,'kind':'spritesheet','transparent':True,'frameWidth':96,'frameHeight':96,'columns':6,'rows':6,'animations':anims})
        icon=Image.new('RGBA',(32,32),(0,0,0,0));icon.alpha_composite(fight[0].crop((33,17,63,47)),(1,1));rel=f'ui/hg_zug_{p}_s2.png';icon.save(SPRITES/rel,optimize=True)
        assets.append({'id':f'hg_zug_{p}_s2','file':rel,'width':32,'height':32,'kind':'icon','transparent':True,'frameWidth':32,'frameHeight':32,'columns':1,'rows':1,'derivedFrom':f'battle/hg_battle_{p}_s2.png'})
    (SPRITES/'manifest-gestalt2b.json').write_text(json.dumps({'batch':'gestalt2b','palette':pal,'assets':assets},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':main()
