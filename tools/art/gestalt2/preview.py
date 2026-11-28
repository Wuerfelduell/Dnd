#!/usr/bin/env python3
"""Make one 3x nearest-neighbor preview for all 30 delivered sheets/icons."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[3]
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
BG='#2a2a33'; SCALE=3; PAD=24; LABEL=38; GAP=28
font=ImageFont.load_default(size=26)
panels=[]
for p in paths:
    items=[]
    for kind,rel in [('Karte',f'characters/hg_form_{p}_s2.png'),('Kampf',f'battle/hg_battle_{p}_s2.png'),('Zugbild',f'ui/hg_zug_{p}_s2.png')]:
        im=Image.open(ROOT/'public/sprites'/rel).convert('RGBA')
        im=im.resize((im.width*SCALE,im.height*SCALE),Image.Resampling.NEAREST)
        items.append((kind,rel,im))
    width=max(i.width for _,_,i in items)+PAD*2
    height=sum(i.height+LABEL+GAP for _,_,i in items)+PAD
    panel=Image.new('RGB',(width,height),BG); d=ImageDraw.Draw(panel); y=PAD
    d.text((PAD,y),p,fill='#e0c9a1',font=font); y+=LABEL
    for kind,rel,im in items:
        d.text((PAD,y),f'{kind}: {rel}',fill='#b4ac91',font=font); y+=LABEL
        panel.paste(im,(PAD,y),im);y+=im.height+GAP
    panels.append(panel)
colw=max(i.width for i in panels); rowh=max(i.height for i in panels)
out=Image.new('RGB',(2*colw+3*PAD,5*rowh+6*PAD),BG)
for i,panel in enumerate(panels): out.paste(panel,(PAD+(i%2)*(colw+PAD),PAD+(i//2)*(rowh+PAD)))
out.save(ROOT/'docs/art/batch-gestalt2-preview.png',optimize=True)
