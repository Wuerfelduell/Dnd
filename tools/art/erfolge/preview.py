"""Compose the documentation preview from exported assets, no new game art."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
R=Path(__file__).resolve().parents[3];A=json.loads((R/'docs/story/erfolge/erfolge.json').read_text())
canvas=Image.new('RGB',(1320,1120),'#202734');d=ImageDraw.Draw(canvas)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f=lambda n:ImageFont.truetype(font,n)
def text(x,y,t,n=16,c='#e0c9a1'):d.text((x,y),t,font=f(n),fill=c)
def paste(im,xy):canvas.paste(im,xy,im)
def asset(p):return Image.open(R/'public/sprites'/p).convert('RGBA')
text(32,24,'NEBELAKTEN / DL',16,'#95a5a5');text(32,52,'Akte des Ermittlers',32)
text(32,100,'80 Vermerke · feste Atlas-Reihenfolge · 16px / 32px · keine Punkte',16)
text(32,146,'ERFÜLLT',18);text(680,146,'OFFEN / PRÄGUNG',18)
for side,p in [(32,'ui/erfolge_icons.png'),(680,'ui/erfolge_icons_offen.png')]:
 atlas=asset(p)
 for i in range(80):
  x=side+i%10*60;y=184+i//10*63
  d.rounded_rectangle((x,y,x+52,y+54),radius=3,fill='#303b49')
  tile=atlas.crop((i%10*16,i//10*16,i%10*16+16,i//10*16+16)).resize((32,32),Image.Resampling.NEAREST)
  paste(tile,(x+10,y+3));text(x+18,y+36,f'{i:02}',11,'#95a5a5')
text(32,704,'SEITENSTUDIE',16,'#95a5a5');text(708,704,'OBERFLÄCHEN-ASSETS',16,'#95a5a5')
# 9-slice example with repeatable top band and undistorted center stamp.
s=asset('ui/erfolge_rahmen.png');panel=Image.new('RGBA',(316,164));xs=[0,4,44,48];ys=[0,8,44,48];dx=[0,4,312,316];dy=[0,8,160,164]
for iy in range(3):
 for ix in range(3):
  if ix==1 and iy==1:continue
  part=s.crop((xs[ix],ys[iy],xs[ix+1],ys[iy+1]))
  if ix==1 and iy==0:part=s.crop((8,0,16,8))
  width,height=dx[ix+1]-dx[ix],dy[iy+1]-dy[iy]
  tiled=Image.new('RGBA',(width,height))
  for yy in range(0,height,part.height):
   for xx in range(0,width,part.width):tiled.alpha_composite(part,(xx,yy))
  panel.alpha_composite(tiled,(dx[ix],dy[iy]))
panel.alpha_composite(s.crop((20,0,28,8)),(154,0));paste(panel.resize((632,328),Image.Resampling.NEAREST),(32,738))
text(56,762,'Akte des Ermittlers',23);text(56,798,'Fälle und Kapitel',14,'#95a5a5')
for j,i in enumerate([0,14,15]):
 y=834+j*68;tile=asset('ui/erfolge_icons.png').crop((i%10*16,i//10*16,i%10*16+16,i//10*16+16)).resize((32,32),Image.Resampling.NEAREST);paste(tile,(56,y+4));text(104,y,A[i]['name'],17)
 # fit full aktenvermerk in the sample with word wrapping
 words=A[i]['text'].split();lines=['']
 for word in words:
  if d.textlength(lines[-1]+' '+word,font=f(12))>520:lines.append(word)
  else:lines[-1]+=(' ' if lines[-1] else '')+word
 for k,line in enumerate(lines):text(104,y+24+k*16,line,12,'#a8b4c0')
 d.line((56,y+59,636,y+59),fill='#586c78')
paste(asset('ui/erfolge_symbole.png').resize((576,64),Image.Resampling.NEAREST),(708,752))
text(708,826,'Fälle / Sequenzen / Zirkel / Welt / Kampf / Koop / Kurios / verborgen / neu',11,'#95a5a5')
paste(asset('ui/erfolge_stempel.png').resize((576,96),Image.Resampling.NEAREST),(708,854));text(708,957,'Stempel: 6 × 32px · 10 fps · einmalig',13,'#95a5a5')
paste(asset('fx/erfolg_meldung.png').resize((384,96),Image.Resampling.NEAREST),(708,993));text(1110,1012,'96 × 24px',13,'#95a5a5')
text(32,1090,'Layoutstudie, kein Runtime-Screenshot. Einzeldateien behalten binäres Alpha und die gemeinsame 32-Farben-Palette.',12,'#95a5a5')
canvas.save(R/'docs/art/batch-erfolge-preview.png')
