#!/usr/bin/env python3
"""Build EA / Sequenz 2 sprites, one high-resolution source per frame."""
from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
SPRITES = ROOT / "public/sprites"
RAW = Path(os.environ.get("GESTALT2_RAW_DIR", Path(tempfile.gettempdir()) / "Dnd-gestalt2-raw"))
PATHS = ["laterne", "faden", "maske", "echo", "kessel", "eisen", "schluessel", "sq_waage", "sq_moor", "sq_uhr"]
S = 4
OUT, INK, SHADOW = "#1a1c2c", "#252b38", "#303b49"
SLATE, STEEL, IRON = "#425360", "#586c78", "#71858b"
BROWN, MIDBROWN, TAN = "#413433", "#58433c", "#715648"
BRASS, GOLD, LIGHT = "#886332", "#ba8942", "#dbac5d"
AMBER, BONE, PALE = "#f0ce80", "#cfb18a", "#e0c9a1"
MOSS, MOSS2, TEAL, AQUA = "#494b3a", "#686850", "#245b59", "#36817a"
MINT = "#6fe0d0"
PALETTE = [OUT, INK, SHADOW, SLATE, STEEL, IRON, BROWN, MIDBROWN, TAN, BRASS, GOLD, LIGHT, AMBER, BONE, PALE, MOSS, MOSS2, TEAL, AQUA, MINT]

COLORS = {
    "laterne": (BRASS, GOLD, AMBER), "faden": (SLATE, IRON, MINT),
    "maske": (MOSS, BONE, PALE), "echo": (SLATE, AQUA, MINT),
    "kessel": (MIDBROWN, BRASS, AMBER), "eisen": (SLATE, IRON, LIGHT),
    "schluessel": (MIDBROWN, BRASS, PALE), "sq_waage": (MOSS2, BRASS, BONE),
    "sq_moor": (MOSS, MOSS2, MINT), "sq_uhr": (MIDBROWN, BRASS, AMBER),
}


class Pixel:
    def __init__(self, w: int, h: int, yscale: float = 1.0):
        self.w, self.h, self.yscale = w, h, yscale
        self.im = Image.new("RGBA", (w*S, round(h*yscale*S)), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def box(self, xy, fill, outline=None, width=1):
        x0, y0, x1, y1 = xy
        coords = (round(min(x0,x1)*S), round(min(y0,y1)*self.yscale*S), round(max(x0,x1)*S), round(max(y0,y1)*self.yscale*S))
        self.d.rectangle(coords, fill=fill, outline=outline, width=max(1, round(width*S)))

    def ellipse(self, xy, fill, outline=None, width=1):
        x0, y0, x1, y1 = xy
        self.d.ellipse((round(min(x0,x1)*S), round(min(y0,y1)*self.yscale*S), round(max(x0,x1)*S), round(max(y0,y1)*self.yscale*S)), fill=fill, outline=outline, width=max(1, round(width*S)))

    def poly(self, pts, fill, outline=OUT, width=1):
        points = [(round(x*S), round(y*self.yscale*S)) for x, y in pts]
        self.d.polygon(points, fill=fill)
        if outline:
            self.d.line(points + [points[0]], fill=outline, width=max(1, round(width*S)), joint="curve")

    def line(self, pts, fill, width=1):
        points = [(round(x*S), round(y*self.yscale*S)) for x, y in pts]
        self.d.line(points, fill=fill, width=max(1, round(width*S)), joint="curve")

    def finish(self, size):
        # All source frames are rendered independently at 4x, then reduced with NN.
        return self.im.resize(size, Image.Resampling.NEAREST)


def wing(c: Pixel, path: str, phase: str, tick: int, cx: int, cy: int, spread: int = 0):
    metal, mid, glow = COLORS[path]
    broad = 0 if phase == "hurt" else spread
    if phase == "defeated":
        # A distinct, dissolving silhouette with path-material fragments.
        for side in (-1, 1):
            for j in range(4):
                x = cx + side * (17 + j * 11)
                y = cy + (j % 2) * 7 + (tick % 3) * 2
                col = (glow, mid, metal, SHADOW)[j]
                c.box((x, y, x+3, y+3), col, OUT)
        return
    if path == "laterne":
        # Six light-ribbon wings, each ending in a flame-shaped lantern.
        for side in (-1, 1):
            for j in range(3):
                sx, sy = cx + side*5, cy-7+j*7
                ex, ey = cx + side*(30 + j*5 + broad), cy-31+j*24
                c.line([(sx, sy), (cx+side*16, sy-2+j*4), (ex, ey)], BRASS, 3)
                c.line([(sx, sy), (cx+side*16, sy-2+j*4), (ex, ey)], AMBER if j == 1 else GOLD, 1)
                c.poly([(ex-3,ey-1),(ex,ey-6),(ex+3,ey-1),(ex+2,ey+4),(ex-2,ey+4)], AMBER, OUT)
                c.box((ex-1,ey,ex+1,ey+2), PALE, None)
    elif path == "faden":
        # Needle-boned harp wings and the overhead puppet strings.
        for side in (-1, 1):
            a, b = (cx+side*13, cy-27), (cx+side*(40+broad), cy+22)
            c.line([a,b], IRON, 3)
            c.poly([(a[0]-2,a[1]+3),(a[0],a[1]-5),(a[0]+2,a[1]+3)], BONE, OUT)
            for j in range(6):
                t = (j+1)/7
                x, y = a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t
                c.line([(x-3,y-4),(x+3,y+4)], MINT if j == 2 else PALE, 1)
        for x in (cx-5, cx, cx+5):
            c.line([(x,cy-12),(x-1,0)], BONE, 1)
            c.box((x-1,1,x+1,3), IRON)
    elif path == "maske":
        # Fans with five smooth masks per wing; every closed-eye mask is legible.
        for side in (-1,1):
            for j in range(3):
                x, y = cx+side*(22+j*9+broad), cy-20+j*19
                c.line([(cx+side*7,cy-2+j*3),(x,y)], BRASS, 2)
                c.ellipse((x-5,y-6,x+5,y+6), BONE if j%2==0 else PALE, OUT)
                c.line([(x-2,y),(x,y+1),(x+2,y)], INK, 1)
                c.box((x-1,y+4,x+1,y+4), TAN)
    elif path == "echo":
        # Concentric sound rings; the second outline trails by a pixel.
        for r in (19, 29, 39+broad):
            for side in (-1,1):
                x0,x1 = (cx-r,cx-5) if side < 0 else (cx+5,cx+r)
                c.ellipse((x0,cy-r//2,x1,cy+r//2), None, AQUA if r==29 else SLATE, 2)
                c.line([(x0+1,cy-r//2+1),(x1-1,cy-r//2+1)], MINT if r==29 else INK, 1)
        c.poly([(cx-13,cy-10),(cx+13,cy-10),(cx+9,cy+8),(cx+4,cy+15),(cx-4,cy+15),(cx-9,cy+8)], IRON, OUT)
        c.line([(cx-10,cy-6),(cx+10,cy-6)], BONE, 2)
    elif path == "kessel":
        # Pixel-cloud steam plumes and the detached lid halo.
        for side in (-1,1):
            x = cx+side*(29+broad)
            for j in range(5):
                y = cy-26+j*10
                c.box((x-5,y-3,x+5,y+3), STEEL if j%2 else PALE, OUT)
                c.box((x-side*4,y-5,x+side*4,y+5), IRON, OUT)
                c.box((x-1,y-2,x+1,y), MINT, None)
        c.ellipse((cx-17,cy-40,cx+17,cy-29), None, GOLD, 3)
        c.poly([(cx-12,cy-34),(cx,cy-38),(cx+12,cy-34),(cx+7,cy-31),(cx-7,cy-31)], BRASS, OUT)
    elif path == "eisen":
        # Riveted blade plates and a broad floating forge ring.
        c.ellipse((cx-39,cy-32,cx+39,cy+29), None, BRASS, 3)
        for side in (-1,1):
            for j in range(3):
                x,y = cx+side*(22+j*8+broad), cy-24+j*17
                c.poly([(cx+side*8,cy-5+j*3),(x-side*3,y-12),(x+7,y-4),(x+9,y+8),(x+2,y+13)], IRON if j%2 else SLATE, OUT, 2)
                c.line([(cx+side*9,cy-4+j*3),(x+5,y+4)], LIGHT, 1)
                c.ellipse((x+1,y-2,x+4,y+1), GOLD, OUT)
    elif path == "schluessel":
        # Open doorframes as wings with bright portals, small keys circle the waist.
        for side in (-1,1):
            x = cx+side*(32+broad)
            c.poly([(cx+side*9,cy-28),(x+side*7,cy-28),(x+side*7,cy+28),(cx+side*9,cy+28)], BRASS, OUT, 2)
            c.box((cx+side*13,cy-22,x-side*5,cy+23), AMBER, None)
            c.line([(cx+side*15,cy+17),(x-side*7,cy-17)], PALE, 2)
        for j in range(7):
            x,y = cx-14+j*4, cy+21+(j%2)*4
            c.line([(x,y),(x+2,y+6),(x+5,y+7)], GOLD, 2)
            c.box((x+3,y+5,x+6,y+8), BONE)
    elif path == "sq_waage":
        # Balanced scale disks; the crossbar is a yoke, not a feather wing.
        c.line([(cx-40,cy-22),(cx+40,cy-22)], BRASS, 3)
        c.poly([(cx,cy-32),(cx-5,cy-22),(cx+5,cy-22)], GOLD, OUT)
        for side in (-1,1):
            x = cx+side*(29+broad)
            c.line([(cx+side*8,cy-22),(x,cy-10)], GOLD, 2)
            c.ellipse((x-13,cy-17,x+13,cy+12), BONE, OUT, 2)
            c.ellipse((x-8,cy-12,x+8,cy+6), PALE, IRON)
            c.box((x-7,cy-2,x-2,cy-1), OUT)
            c.box((x+2,cy-2,x+7,cy-1), OUT)
    elif path == "sq_moor":
        # Reeds and bulrushes with pools held in their broad leaves.
        for side in (-1,1):
            for j in range(4):
                x = cx+side*(18+j*8+broad)
                y = cy-32+(j%2)*8
                c.line([(cx+side*8,cy+12-j*4),(x,y+48)], MOSS2, 2)
                c.poly([(x,y),(x-4,y+12),(x,y+20),(x+4,y+11)], MOSS, OUT)
                c.ellipse((x-3,y+12,x+3,y+19), TEAL, INK)
                if j%2==0:
                    c.ellipse((x-2,y-6,x+2,y+1), BROWN, OUT)
        c.ellipse((cx-8,cy-8,cx+8,cy+8), MINT, OUT)
    else:  # sq_uhr
        # Giant hand-blades and a gear halo; the lower pendulum becomes light.
        c.ellipse((cx-25,cy-38,cx+25,cy+12), None, GOLD, 3)
        for j in range(8):
            x,y = cx-22+j*6, cy-38
            c.box((x,y-2,x+3,y+2), BRASS, OUT)
        for side in (-1,1):
            angle = -1 if side < 0 else 1
            x = cx+side*(39+broad)
            c.poly([(cx+side*6,cy-8),(x,cy-38),(x+side*4,cy-43),(x-side*3,cy+2),(cx+side*11,cy+3)], IRON, OUT, 2)
            c.line([(cx+side*8,cy-7),(x,cy-34)], LIGHT, 1)
        c.poly([(cx-3,cy+18),(cx+3,cy+18),(cx+5,cy+29),(cx,cy+33),(cx-5,cy+29)], AMBER, OUT)


def body(c: Pixel, path: str, phase: str, tick: int, cx: int, cy: int, direction: str = "right"):
    metal, mid, glow = COLORS[path]
    if phase == "hurt": cx -= 3
    # Long hovering mantle with the familiar original hooded creature silhouette.
    coat = [ (cx,cy-27),(cx+10,cy-22),(cx+13,cy-11),(cx+19,cy+5),(cx+17,cy+24),(cx+12,cy+31),(cx-12,cy+31),(cx-17,cy+24),(cx-19,cy+5),(cx-13,cy-11),(cx-10,cy-22) ]
    if phase == "defeated":
        c.poly([(cx-13,cy+4),(cx+11,cy+1),(cx+18,cy+24),(cx-8,cy+32)], SHADOW, OUT, 2)
        c.ellipse((cx-7,cy-20,cx+7,cy-6), metal, OUT, 2)
        return
    c.poly(coat, SHADOW if path=="sq_moor" else metal, OUT, 2)
    c.poly([(cx-10,cy-18),(cx,cy-22),(cx+9,cy-16),(cx+7,cy+3),(cx+1,cy+21),(cx-5,cy+14)], mid, OUT)
    c.line([(cx-11,cy+2),(cx-17,cy+20)], OUT, 5)
    c.line([(cx+11,cy+2),(cx+17,cy+19)], OUT, 5)
    c.line([(cx-11,cy+2),(cx-17,cy+20)], metal, 3)
    c.line([(cx+11,cy+2),(cx+17,cy+19)], metal, 3)
    # Hooded face remains recognizable; the lantern replaces its face with flame.
    c.ellipse((cx-10,cy-37,cx+10,cy-17), OUT, OUT)
    c.ellipse((cx-8,cy-35,cx+8,cy-19), metal, OUT)
    if path == "laterne":
        c.box((cx-5,cy-31,cx+5,cy-21), AMBER, OUT)
        c.poly([(cx,cy-30),(cx+3,cy-26),(cx,cy-22),(cx-3,cy-26)], PALE, None)
    elif path == "sq_waage":
        c.box((cx-7,cy-27,cx+7,cy-25), BONE, OUT)
        c.box((cx-5,cy-28,cx+5,cy-27), INK, None)
    elif path == "maske":
        c.ellipse((cx-7,cy-31,cx+7,cy-21), PALE, OUT)
        c.box((cx-4,cy-27,cx+4,cy-26), BONE, None)
    elif path == "echo":
        c.ellipse((cx-4,cy-29,cx+4,cy-21), INK, MINT)
    elif path == "sq_moor":
        c.ellipse((cx-5,cy-29,cx+5,cy-21), MINT, OUT)
    else:
        eye_x = cx+3 if direction == "right" else cx-3
        c.box((eye_x-1,cy-28,eye_x+1,cy-26), AMBER if path in ("kessel","sq_uhr") else PALE, None)
        c.box((cx-2,cy-11,cx+2,cy+5), glow, None)
    if direction == "up":
        # Back-facing hood: no face, with a short seam at the crown.
        c.ellipse((cx-7,cy-34,cx+7,cy-20), metal, OUT)
        c.line([(cx,cy-32),(cx,cy-22)], IRON, 1)
    elif direction == "down" and path not in ("laterne", "maske", "sq_waage", "echo", "sq_moor"):
        c.box((cx-5,cy-28,cx-3,cy-26), PALE, None)
        c.box((cx+3,cy-28,cx+5,cy-26), PALE, None)
    # Path-specific signature in the torso.
    if path == "laterne":
        c.box((cx-8,cy-8,cx+8,cy+12), OUT, OUT)
        for x in (cx-6,cx,cx+6):
            c.box((x-2,cy-6,x+2,cy+9), BRASS, GOLD)
            c.box((x-1,cy-4,x+1,cy+6), AMBER, None)
    elif path == "faden":
        for j in range(5):
            x=cx-9+j*4
            c.line([(x,cy-8),(cx-10+(j*5)%20,cy+14)], MINT if j==2 else PALE, 1)
        c.box((cx-3,cy-7,cx+3,cy+7), SHADOW, OUT)
    elif path == "maske":
        for side in (-1,1):
            c.ellipse((cx+side*7-4,cy-5,cx+side*7+4,cy+6), BONE, OUT)
            c.line([(cx+side*7-2,cy),(cx+side*7+2,cy)], OUT, 1)
        c.ellipse((cx-4,cy-7,cx+4,cy+8), PALE, OUT)
    elif path == "echo":
        c.poly([(cx-13,cy-10),(cx+13,cy-10),(cx+10,cy+15),(cx-10,cy+15)], IRON, OUT)
        c.ellipse((cx-5,cy-1,cx+5,cy+9), INK, MINT)
        c.line([(cx-10,cy+1),(cx-5,cy+1)], BONE, 2)
    elif path == "kessel":
        c.ellipse((cx-14,cy-8,cx+14,cy+20), OUT, OUT)
        c.ellipse((cx-12,cy-7,cx+12,cy+17), BRASS, GOLD, 2)
        c.ellipse((cx-7,cy-3,cx+7,cy+10), AMBER, None)
        c.line([(cx-13,cy-9),(cx+13,cy-9)], BONE, 3)
    elif path == "eisen":
        for j in range(3):
            y=cy-9+j*10
            c.poly([(cx-12,y),(cx,y-4),(cx+12,y),(cx+9,y+7),(cx-9,y+7)], SLATE if j%2 else IRON, OUT)
            c.ellipse((cx-9,y+1,cx-6,y+4), LIGHT, OUT)
            c.ellipse((cx+6,y+1,cx+9,y+4), LIGHT, OUT)
    elif path == "schluessel":
        c.box((cx-8,cy-9,cx+8,cy+12), AMBER, OUT)
        c.ellipse((cx-5,cy-6,cx+5,cy+6), BONE, OUT)
        c.line([(cx,cy+5),(cx,cy+17),(cx+5,cy+17)], GOLD, 2)
    elif path == "sq_waage":
        c.ellipse((cx-9,cy-6,cx+9,cy+13), BRASS, OUT)
        c.ellipse((cx-5,cy-2,cx+5,cy+8), BONE, OUT)
        c.line([(cx,cy+8),(cx,cy+20)], GOLD, 2)
    elif path == "sq_moor":
        c.ellipse((cx-8,cy-6,cx+8,cy+12), OUT, MINT, 2)
        c.ellipse((cx-4,cy-3,cx+4,cy+7), TEAL, None)
        for side in (-1,1): c.line([(cx+side*9,cy-3),(cx+side*14,cy-15)], MOSS2, 2)
    else:
        for x,y,r in [(cx-6,cy-3,5),(cx+5,cy+5,7)]:
            c.ellipse((x-r,y-r,x+r,y+r), None, GOLD, 2)
            c.ellipse((x-1,y-1,x+1,y+1), AMBER, None)
        c.line([(cx,cy+14),(cx+2,cy+26)], BRASS, 2)
    # A hard-edged amber core ties each evolved form together.
    if phase != "hurt": c.box((cx-2,cy+1,cx+2,cy+5), AMBER, None)


def draw(path: str, phase: str, tick: int, direction="right", tall=False):
    h = 144 if tall else 96
    c = Pixel(96, 96, 1.5 if tall else 1.0)
    cx=48
    bob = (0, -2, -1, 1, 2, 0)[tick % 6] if phase == "idle" else (0,1,-1,2,0,1)[tick%6]
    if phase == "attack1": spread = (0,2,4,4,2,0)[tick%6]
    elif phase == "attack2": spread = (0,3,7,7,3,0)[tick%6]
    elif phase == "special": spread = 11
    elif phase == "hurt": spread = -5
    else: spread = 0
    # For combat, the shadow is fixed while the body floats above it.
    cy = 59+bob
    sy = 91 if tall else 92
    c.ellipse((cx-17,sy-1,cx+17,sy+2), SHADOW, None)
    if phase in ("attack2", "special"):
        end = 95 if phase == "attack2" else 89
        c.line([(cx+11,cy+4),(cx+32,cy+1),(end,cy-10)], GOLD, 3)
        c.line([(cx+12,cy+4),(cx+32,cy+1),(end,cy-10)], AMBER, 1)
    wing(c,path,phase,tick,cx,cy,spread)
    body(c,path,phase,tick,cx,cy,direction)
    if phase == "special":
        c.ellipse((cx-22,cy-44,cx+22,cy+35), None, AMBER, 2)
        c.box((cx-1,cy-46,cx+1,cy-40), PALE, None)
    return c


def main():
    assets=[]
    pose_labels=["idle","idle","idle","idle","idle","idle","attack1","attack1","attack1","attack1","attack1","attack1","attack2","attack2","attack2","attack2","attack2","attack2","special","special","special","special","special","special","hurt","hurt","hurt","hurt","hurt","hurt","defeated","defeated","defeated","defeated","defeated","defeated"]
    for path in PATHS:
        card_frames=[]; fight_frames=[]
        raw=RAW/path; raw.mkdir(parents=True,exist_ok=True)
        for i in range(16):
            # Four directional rows, four independently generated walk poses each.
            direction=["down","left","right","up"][i//4]
            ph="idle"
            art=draw(path,ph,i%4,direction,tall=True)
            im=art.finish((32,48))
            art.im.save(raw/f"card_{i:02d}.png")
            card_frames.append(im)
        for i,phase in enumerate(pose_labels):
            hold={8:7,14:13}.get(i)
            art=draw(path,phase,(hold if hold is not None else i)%6)
            if hold is not None:
                art.im=Image.open(raw/f"battle_{hold:02d}.png").convert("RGBA")
            art.im.save(raw/f"battle_{i:02d}.png")
            fight_frames.append(art.finish((96,96)))
        # Hold frames are intentional animation timing holds.
        for rel,frames,fw,fh,cols,rows in [
            (f"characters/hg_form_{path}_s2.png",card_frames,32,48,4,4),
            (f"battle/hg_battle_{path}_s2.png",fight_frames,96,96,6,6),
        ]:
            sheet=Image.new("RGBA",(fw*cols,fh*rows),(0,0,0,0))
            for i,frame in enumerate(frames): sheet.alpha_composite(frame,((i%cols)*fw,(i//cols)*fh))
            sheet.save(SPRITES/rel,optimize=True)
            stem=Path(rel).stem
            animations={}
            if rows==6:
                for n in range(6):
                    name=pose_labels[n*6]
                    animations[name]={"frames":list(range(n*6,n*6+6)),"frameRate":6 if name=="idle" else 8,"repeat":-1 if name in ("idle","attack1","attack2") else 0}
                animations["attack1"]["frames"]=[6,7,8,9,10,11]
                animations["attack2"]["frames"]=[12,13,14,15,16,17]
                animations["special"]["frames"]=list(range(18,24))
                animations["hurt"]["frames"]=list(range(24,30))
                animations["defeated"]["frames"]=list(range(30,36))
                animations["idle"]["frames"]=list(range(0,6))
            else:
                for j,direction in enumerate(["down","left","right","up"]):
                    animations[direction]={"frames":list(range(j*4,j*4+4)),"frameRate":8,"repeat":-1}
            asset={"id":stem,"file":rel,"width":fw*cols,"height":fh*rows,"transparent":True,"frameWidth":fw,"frameHeight":fh,"columns":cols,"rows":rows,"animations":animations}
            if rows==4: asset["baseline"]=46
            assets.append(asset)
        # Zug portrait is the upper-body crop of a newly created idle battle frame.
        portrait=fight_frames[0].crop((32,12,64,44))
        rel=f"ui/hg_zug_{path}_s2.png"; portrait.save(SPRITES/rel,optimize=True)
        assets.append({"id":Path(rel).stem,"file":rel,"width":32,"height":32,"transparent":True,"frameWidth":32,"frameHeight":32,"columns":1,"rows":1,"derivedFrom":f"battle/hg_battle_{path}_s2.png"})
    manifest={"batch":"gestalt2","palette":PALETTE,"assets":assets}
    (SPRITES/"manifest-gestalt2.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")


if __name__=="__main__": main()
