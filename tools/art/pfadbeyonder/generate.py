"""Build the Pfadbeyonder pixel-art sheets with native integer Pillow drawing."""
from pathlib import Path
from PIL import Image, ImageDraw
import json

ROOT = Path(__file__).resolve().parents[3]
SPR = ROOT / 'public' / 'sprites'
OUT = ROOT / 'docs' / 'art'
INK = '#1a1c2c'
SKIN = '#c99c78'
SKIN_D = '#8e665b'
HAIR = '#383746'
HAIR_L = '#77716a'
MOSS = '#586b4d'
MOSS_L = '#87906a'
PEAT = '#57483c'
PEAT_L = '#80664b'
SLEEVE = '#435749'
METAL = '#a58b5b'
METAL_L = '#d0b878'
SLATE = '#4c586b'
SLATE_L = '#768396'
TURQ = '#6fe0d0'
VIOLET = '#72527f'
PALETTE = [INK, SKIN, SKIN_D, HAIR, HAIR_L, MOSS, MOSS_L, PEAT, PEAT_L,
           SLEEVE, METAL, METAL_L, SLATE, SLATE_L, TURQ, VIOLET, '#bbb09a', '#303344']

def canvas(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))

def rect(d, box, fill, outline=None):
    d.rectangle(box, fill=fill, outline=outline)

def poly(d, pts, fill, outline=INK):
    d.polygon(pts, fill=fill)
    if outline:
        d.line(pts + [pts[0]], fill=outline, width=1)

def walk_person(kind, direction, frame):
    im = canvas(16, 32); d = ImageDraw.Draw(im)
    # two-step gait, planted center on the first/third frames
    step = (-1, 0, 1, 0)[frame]
    if direction == 'down':
        # shoes and heavy layered coat / waistcoat
        rect(d, (4, 26, 7, 29), INK); rect(d, (9, 26, 12, 29), INK)
        rect(d, (5, 26+step, 7, 28+step), PEAT if kind == 'wenna' else SLATE)
        rect(d, (9, 26-step, 11, 28-step), PEAT if kind == 'wenna' else SLATE)
        poly(d, [(3,13),(5,11),(11,11),(13,14),(12,25),(10,27),(5,27),(3,25)],
             PEAT if kind == 'wenna' else SLATE)
        rect(d, (4,16,12,18), PEAT_L if kind == 'wenna' else SLATE_L)
        rect(d, (6,19,10,20), MOSS if kind == 'wenna' else METAL)
        # sleeves/hands
        rect(d, (2,15,4,22), MOSS if kind == 'wenna' else SLATE)
        rect(d, (12,15,14,22), MOSS if kind == 'wenna' else SLATE)
        rect(d, (3,22,4,23), SKIN); rect(d, (12,22,13,23), SKIN)
        rect(d, (5,5,11,12), SKIN, INK)
        rect(d, (4,4,12,7), HAIR if kind == 'wenna' else HAIR)
        rect(d, (4,7,5,11), HAIR); rect(d, (11,7,12,11), HAIR)
        rect(d, (6,9,6,9), INK); rect(d, (10,9,10,9), INK)
        rect(d, (7,10,9,10), SKIN_D)
        if kind == 'wenna':
            for x,y in [(5,3),(7,2),(9,3),(11,3),(4,5),(12,5)]: rect(d,(x,y,x,y),MOSS_L)
            # spade walking staff
            rect(d, (14,12,14,27), PEAT_L); poly(d, [(13,11),(14,9),(15,11),(14,13)], SLATE)
        else:
            rect(d,(7,17,8,18),METAL_L); rect(d,(6,18,7,18),METAL)
            rect(d,(12,17,13,17),METAL_L); rect(d,(13,18,14,18),METAL)
            rect(d,(5,5,5,5),METAL_L); rect(d,(10,5,10,5),METAL_L)
    elif direction in ('left','right'):
        flip = direction == 'left'
        rect(d,(4,26,7,29),INK); rect(d,(8,26,11,29),INK)
        rect(d,(5,26+step,7,28+step),PEAT if kind=='wenna' else SLATE)
        rect(d,(9,26-step,11,28-step),PEAT if kind=='wenna' else SLATE)
        poly(d,[(4,13),(6,11),(11,12),(12,15),(11,26),(5,26),(3,23)],PEAT if kind=='wenna' else SLATE)
        rect(d,(4,16,11,18),PEAT_L if kind=='wenna' else SLATE_L)
        rect(d,(3,15,5,22),MOSS if kind=='wenna' else SLATE); rect(d,(10,15,12,22),MOSS if kind=='wenna' else SLATE)
        rect(d,(4,22,5,23),SKIN)
        rect(d,(5,5,11,12),SKIN,INK); rect(d,(4,4,11,7),HAIR)
        rect(d,(4,7,5,11),HAIR); rect(d,(10,7,11,10),HAIR)
        if flip:
            im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT); d=ImageDraw.Draw(im)
        # side profile nose, eye, prop
        rect(d,(8 if not flip else 7,8,8 if not flip else 7,8),INK)
        if kind=='wenna':
            rect(d,(2 if not flip else 13,13,2 if not flip else 13,27),PEAT_L)
            poly(d,[(1 if not flip else 12,12),(2 if not flip else 13,10),(3 if not flip else 14,12),(2 if not flip else 13,14)],SLATE)
        else:
            rect(d,(4 if not flip else 11,17,4 if not flip else 11,19),METAL_L)
            rect(d,(3 if not flip else 12,18,5 if not flip else 14,18),METAL)
            rect(d,(5,5,6,5),METAL_L)
    else:  # back-facing, top-down three-quarter view
        rect(d,(4,26,7,29),INK); rect(d,(9,26,12,29),INK)
        rect(d,(5,26+step,7,28+step),PEAT if kind=='wenna' else SLATE)
        rect(d,(9,26-step,11,28-step),PEAT if kind=='wenna' else SLATE)
        poly(d,[(3,13),(5,11),(11,11),(13,14),(12,25),(10,27),(5,27),(3,25)],PEAT if kind=='wenna' else SLATE)
        rect(d,(4,15,12,17),PEAT_L if kind=='wenna' else SLATE_L)
        rect(d,(4,4,12,11),HAIR,INK); rect(d,(5,3,11,7),HAIR_L if kind=='wenna' else HAIR)
        if kind=='wenna':
            for x,y in [(5,2),(7,1),(9,2),(11,2),(4,4),(12,4)]: rect(d,(x,y,x,y),MOSS_L)
            rect(d,(14,12,14,27),PEAT_L); poly(d,[(13,11),(14,9),(15,11),(14,13)],SLATE)
        else:
            rect(d,(6,15,7,18),METAL); rect(d,(7,16,8,18),METAL_L); rect(d,(12,17,14,18),METAL)
    return im

def make_walk(kind, pid):
    im=canvas(64,128); dirs=['down','left','right','up']
    for row,direction in enumerate(dirs):
        for col in range(4): im.alpha_composite(walk_person(kind,direction,col),(col*16,row*32))
    im.save(SPR/'characters'/f'{pid}_walk.png')

def make_head(kind, filename):
    im=canvas(24,24); d=ImageDraw.Draw(im)
    # cropped head plus shoulders and distinctive silhouette
    rect(d,(4,16,19,23), PEAT if kind=='wenna' else SLATE, INK)
    rect(d,(6,7,17,18),SKIN,INK); rect(d,(5,5,18,10),HAIR,INK)
    rect(d,(5,9,7,15),HAIR); rect(d,(16,9,18,15),HAIR)
    rect(d,(8,12,8,12),INK); rect(d,(15,12,15,12),INK); rect(d,(10,14,13,14),SKIN_D)
    if kind=='wenna':
        for x,y in [(6,4),(8,2),(10,3),(13,2),(16,4),(5,6),(18,6)]: rect(d,(x,y,x,y),MOSS_L)
        rect(d,(8,18,15,19),PEAT_L)
    else:
        rect(d,(7,11,8,11),METAL_L); rect(d,(15,11,16,11),METAL_L)
        rect(d,(8,2,9,2),METAL_L); rect(d,(9,3,10,3),METAL)
        rect(d,(6,18,17,19),SLATE_L); rect(d,(9,18,9,20),METAL_L); rect(d,(14,18,14,20),METAL_L)
    im.save(SPR/'portraits'/'heads'/filename)

def battle_person(kind, row, col):
    im=canvas(48,48); d=ImageDraw.Draw(im)
    # frame movement varies by column, attacks shift posture and limbs
    dx=[-1,0,0,1,0,0][col]
    attack=row in (1,2)
    hurt=row==3; down=row==4
    if down:
        # fallen pose silhouette
        poly(d,[(8,28),(12,20),(23,19),(31,23),(39,27),(37,33),(26,35),(14,34)],
             PEAT if kind=='wenna' else (SLATE if kind=='corvin' else '#454b54'))
        rect(d,(18,23,27,30),SKIN,INK); rect(d,(16,21,29,24),HAIR,INK)
        if kind=='wenna': rect(d,(38,25,41,36),PEAT_L)
        return im
    # shadow and boots
    rect(d,(12,37,35,39),'#303344')
    if row==1 and col in (2,3): dx+=4
    if row==2 and col in (2,3): dx-=3
    x=24+dx
    coat=PEAT if kind=='wenna' else (SLATE if kind=='corvin' else '#454b54')
    coat_l=PEAT_L if kind=='wenna' else (SLATE_L if kind=='corvin' else '#777b80')
    skin=SKIN_D if hurt else SKIN
    # legs / coat body
    rect(d,(x-8,34,x-2,39),INK); rect(d,(x+3,34,x+9,39),INK)
    rect(d,(x-7,34,x-3,37),coat); rect(d,(x+4,34,x+8,37),coat)
    poly(d,[(x-10,17),(x-6,13),(x+7,13),(x+11,18),(x+9,35),(x-8,35),(x-11,23)],coat)
    rect(d,(x-8,20,x+8,23),coat_l)
    rect(d,(x-2,17,x+1,29),METAL if kind=='corvin' else MOSS if kind=='wenna' else '#777b80')
    rect(d,(x-1,21,x,22),METAL_L)
    # head and expression
    rect(d,(x-6,5,x+6,17),skin,INK); rect(d,(x-7,3,x+7,8),HAIR,INK)
    rect(d,(x-7,7,x-5,14),HAIR); rect(d,(x+5,7,x+7,14),HAIR)
    rect(d,(x-3,10,x-2,10),INK); rect(d,(x+3,10,x+4,10),INK); rect(d,(x-1,13,x+2,13),SKIN_D)
    if kind=='wenna':
        for ox,oy in [(-6,2),(-4,0),(-1,1),(2,0),(5,2),(-8,4),(8,4)]: rect(d,(x+ox,oy,x+ox,oy),MOSS_L)
    elif kind=='corvin':
        rect(d,(x-6,9,x-2,12),METAL_L); rect(d,(x+2,9,x+6,12),METAL_L); rect(d,(x-1,10,x+1,10),METAL)
        rect(d,(x-7,2,x+7,3),HAIR_L)
        rect(d,(x+8,20,x+10,20),METAL_L); rect(d,(x+10,21,x+12,22),METAL)
    else: # Maud's salt-market scales motif
        rect(d,(x-7,2,x+7,3),HAIR_L); rect(d,(x-6,4,x+6,4),METAL)
        rect(d,(x+8,20,x+10,29),METAL); rect(d,(x+6,21,x+12,21),METAL_L)
        rect(d,(x+7,22,x+8,25),METAL); rect(d,(x+10,22,x+11,25),METAL)
        rect(d,(x+6,25,x+12,26),METAL_L)
    # arms and weapons / shield poses
    arm_y=18 if not attack else (12 if row==1 else 17)
    rect(d,(x-13,arm_y,x-9,arm_y+9),coat,INK); rect(d,(x-13,arm_y+8,x-10,arm_y+10),skin,INK)
    rect(d,(x+9,arm_y,x+13,arm_y+9),coat,INK); rect(d,(x+10,arm_y+8,x+13,arm_y+10),skin,INK)
    if kind=='wenna':
        if row==2: # supernatural peat vines
            for vx in (5,39):
                poly(d,[(vx,38),(vx+2,31),(vx,26),(vx+4,21),(vx+3,17),(vx+7,15),(vx+8,16),(vx+5,19),(vx+6,24),(vx+3,28),(vx+5,33),(vx+3,38)],MOSS, None)
                rect(d,(vx+4,20,vx+7,21),MOSS_L)
            for ex,ey in [(8,28),(39,30)]: poly(d,[(ex,ey),(ex+4,ey-2),(ex+2,ey+2)],MOSS_L,None)
        else:
            rect(d,(x+14,11 if row==1 else 18,x+16,37),PEAT_L)
            poly(d,[(x+12,12),(x+15,8),(x+18,12),(x+15,16)],SLATE)
            if row==1: rect(d,(x+14,7,x+16,10),METAL)
    elif kind=='corvin':
        # broad key held across the attack; gear pulse on second attack
        ky=13 if row==1 else 20
        rect(d,(x+13,ky,x+15,ky+17),METAL_L); rect(d,(x+11,ky,x+17,ky+2),METAL)
        rect(d,(x+14,ky+13,x+19,ky+14),METAL); rect(d,(x+14,ky+16,x+17,ky+17),METAL)
        if row==2:
            for gx,gy in [(7,11),(36,13)]:
                rect(d,(gx,gy,gx+7,gy+7),METAL); rect(d,(gx+2,gy+2,gx+5,gy+5),INK)
                rect(d,(gx+3,gy-2,gx+4,gy-1),METAL_L); rect(d,(gx+3,gy+8,gx+4,gy+9),METAL_L)
            rect(d,(9,16,10,18),TURQ); rect(d,(37,22,38,24),VIOLET)
    else:
        # scale tray shield thrust, then throw a dark weight
        if row==1:
            rect(d,(x-20,17,x-13,28),METAL,INK); rect(d,(x-19,19,x-14,25),METAL_L)
            rect(d,(x-17,21,x-16,23),METAL)
        else:
            poly(d,[(x+14,19),(x+21,21),(x+22,28),(x+16,31),(x+13,27)],'#383746')
            rect(d,(x+16,21,x+19,23),SLATE_L)
    if hurt:
        rect(d,(5,8,7,9),SKIN_D); rect(d,(39,6,41,7),SKIN_D)
    return im

def make_battle(kind, name):
    im=canvas(288,240)
    for row in range(5):
        for col in range(6):
            # Hold the wind-up pose in two identical frames for both attacks.
            source_col = 0 if row in (1, 2) and col == 1 else col
            im.alpha_composite(battle_person(kind,row,source_col),(col*48,row*48))
    im.save(SPR/'battle'/name)

def make_preview():
    # Preview-only nearest-neighbor enlargement; production sprites stay native.
    bg = '#d9d5c8'
    im = Image.new('RGB', (1000, 590), bg)
    d = ImageDraw.Draw(im)
    d.text((20, 10), 'PFADBEYONDER — Lauf-Sheets (2x), Kopfporträts (4x)', fill=INK)
    for i, (pid, label) in enumerate([('ez_torfmutter', 'Wenna Kolk'), ('ez_schleusenuhr', 'Corvin Hake')]):
        x = 24 + i * 210
        d.text((x, 32), label, fill=INK)
        sheet = Image.open(SPR/'characters'/f'{pid}_walk.png').convert('RGBA').resize((128,256), Image.Resampling.NEAREST)
        im.paste(sheet, (x, 52), sheet)
        head = Image.open(SPR/'portraits'/'heads'/f'{pid}.png').convert('RGBA').resize((96,96), Image.Resampling.NEAREST)
        im.paste(head, (x+134, 52), head)
    d.text((20, 320), 'Kampfsheets (je 48x48 Frame; Zeilen: idle / attack1 / attack2 / hurt / defeated)', fill=INK)
    for i, (filename, label) in enumerate([
        ('enemy_ez_torfmutter.png','Wenna'),
        ('enemy_ez_schleusenuhr.png','Corvin'),
        ('enemy_wx_pfandleiherin.png','Maud'),
    ]):
        x = 20 + i * 325
        d.text((x, 342), label, fill=INK)
        sheet = Image.open(SPR/'battle'/filename).convert('RGBA').resize((288,240), Image.Resampling.NEAREST)
        im.paste(sheet, (x, 360), sheet)
    im.save(OUT/'batch-pfadbeyonder-preview.png')

def main():
    (SPR/'characters').mkdir(parents=True,exist_ok=True)
    (SPR/'portraits'/'heads').mkdir(parents=True,exist_ok=True)
    (SPR/'battle').mkdir(parents=True,exist_ok=True)
    make_walk('wenna','ez_torfmutter'); make_head('wenna','ez_torfmutter.png')
    make_walk('corvin','ez_schleusenuhr'); make_head('corvin','ez_schleusenuhr.png')
    make_battle('wenna','enemy_ez_torfmutter.png')
    make_battle('corvin','enemy_ez_schleusenuhr.png')
    make_battle('maud','enemy_wx_pfandleiherin.png')
    make_preview()

if __name__=='__main__': main()
