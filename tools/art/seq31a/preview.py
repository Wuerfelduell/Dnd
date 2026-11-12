"""Render the review contact sheet from final PNGs."""
import json
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[3];S=R/'public/sprites';m=json.loads((S/'manifest-seq31a.json').read_text());assets={a['file']:a for a in m['assets']}
out=Image.new('RGB',(1280,1600),'#303b49');d=ImageDraw.Draw(out)
d.text((20,12),'DC1 / seq31a - ruhige Endgestalten, Trinken, Aufstieg, Auren',fill='#eee2c5')
def paste(file,box,pos,scale=1):
 if file not in assets:return
 im=Image.open(S/file).convert('RGBA').crop(box)
 if scale!=1:im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST)
 out.paste(im,pos,im)
for i,p in enumerate(m['paths']):
 x=20+(i%5)*250;y=45+(i//5)*330;d.text((x,y),p,fill='#eee2c5')
 paste(f'battle/hg_form_{p}_still.png',(0,0,96,96),(x,y+18),2)
 paste(f'characters/hg_form_{p}_still.png',(0,0,64,48),(x+10,y+214),1)
 paste(f'fx/aura_seq3_{p}.png',(0,0,64,64),(x+85,y+214))
 paste(f'fx/aura_seq1_{p}.png',(0,0,64,64),(x+155,y+214))
y=710
for who in ['A_player','p2a','p2b']:
 for seq in [3,1]:
  x=20 if seq==3 else 650;d.text((x,y),f'{who} / Seq {seq}',fill='#eee2c5');paste(f'characters/{who}_drink_seq{seq}.png',(0,0,128,32),(x,y+15),3)
 y+=120
for seq in [3,1]:
 f=f'fx/HG_aufstieg_{seq}.png';d.text((20,y),f'Aufstieg {seq}: Anfang / Mitte / Ende',fill='#eee2c5')
 for j,n in enumerate([0,3,7]):paste(f,(n*240,0,(n+1)*240,135),(20+j*400,y+20))
 y+=175
paste('ui/hg_hud_seq31.png',(0,0,64,32),(1030,1440),3)
out.save(R/'docs/art/batch-seq31a-preview.png',optimize=True)
