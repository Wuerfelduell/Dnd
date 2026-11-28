#!/usr/bin/env python3
"""Compare Seq 4 | Seq 3 | new Seq 2 | Seq 1, at exact 3x nearest scale."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[3];SPRITES=ROOT/'public/sprites';SRC=ROOT/'tools/art/gestalt2b/sources/seq3'
PATHS=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
BG='#2a2a33';SCALE=3;PAD=16;STAGE_W=400;STAGE_H=330;PANEL_PAD=16;GAP_X=24;GAP_Y=20
font=ImageFont.load_default(size=18);small=ImageFont.load_default(size=15)

def stage_images(p,stage):
    if stage=='Seq 4':base=SPRITES
    elif stage=='Seq 3':base=SRC
    elif stage=='Seq 2':base=SPRITES
    else:base=SPRITES
    if stage=='Seq 4':
        card=Image.open(base/f'characters/hg_form_{p}.png').convert('RGBA').crop((0,0,32,48))
        battle=Image.open(base/f'battle/hg_battle_{p}.png').convert('RGBA').crop((0,0,96,96))
        icon=Image.open(base/f'ui/hg_zug_{p}.png').convert('RGBA')
    elif stage=='Seq 3':
        card=Image.open(base/f'characters/hg_form_{p}_s3.png').convert('RGBA').crop((0,0,32,48))
        battle=Image.open(base/f'battle/hg_battle_{p}_s3.png').convert('RGBA').crop((0,0,96,96))
        icon=Image.open(base/f'ui/hg_zug_{p}_s3.png').convert('RGBA')
    elif stage=='Seq 2':
        card=Image.open(base/f'characters/hg_form_{p}_s2.png').convert('RGBA').crop((0,0,32,48))
        battle=Image.open(base/f'battle/hg_battle_{p}_s2.png').convert('RGBA').crop((0,0,96,96))
        icon=Image.open(base/f'ui/hg_zug_{p}_s2.png').convert('RGBA')
    else:
        card=Image.open(base/f'characters/hg_form_{p}_still.png').convert('RGBA').crop((0,0,32,48))
        battle=Image.open(base/f'battle/hg_form_{p}_still.png').convert('RGBA').crop((0,0,96,96))
        icon=None
    images=[card.resize((96,144),Image.Resampling.NEAREST),battle.resize((288,288),Image.Resampling.NEAREST)]
    if icon is not None:images.append(icon.resize((96,96),Image.Resampling.NEAREST))
    return images

panel_w=4*STAGE_W+5*PANEL_PAD
panel_h=STAGE_H
canvas=Image.new('RGB',(2*panel_w+3*GAP_X,5*panel_h+6*GAP_Y),BG)
draw=ImageDraw.Draw(canvas)
for pi,p in enumerate(PATHS):
    col=pi%2;row=pi//2;x0=GAP_X+col*(panel_w+GAP_X);y0=GAP_Y+row*(panel_h+GAP_Y)
    draw.text((x0,y0),p,fill='#e0c9a1',font=font)
    for si,stage in enumerate(['Seq 4','Seq 3','Seq 2','Seq 1']):
        x=x0+PANEL_PAD+si*STAGE_W;y=y0+26
        draw.text((x,y),stage,fill='#dbac5d' if stage=='Seq 2' else '#b4ac91',font=font)
        card,battle,*rest=stage_images(p,stage)
        canvas.paste(card,(x,y+24),card)
        canvas.paste(battle,(x+104,y+24),battle)
        if rest:canvas.paste(rest[0],(x,y+24+144+8),rest[0])
        caption='Karte / Kampf / Zugbild' if stage in ('Seq 4','Seq 3','Seq 2') else 'Karte / Kampf'
        draw.text((x,y+24+144+8+98),caption,fill='#b4ac91',font=small)
canvas.save(ROOT/'docs/art/batch-gestalt2b-preview.png',optimize=True)
