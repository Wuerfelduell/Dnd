#!/usr/bin/env python3
"""Build review contact sheets and a boss animation GIF from exported native assets."""
from pathlib import Path
import json,sys,math
from PIL import Image,ImageDraw
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
m=json.loads((ROOT/'public/sprites/manifest-fall6.json').read_text());outdir=ROOT/'docs/art/previews';outdir.mkdir(parents=True,exist_ok=True);NN=Image.Resampling.NEAREST
sets={
'combat':[a for a in m['assets'] if a['file'].startswith(('battle/enemy_','fx/fx_')) or a['id']=='boss_bust'],
'locations':[a for a in m['assets'] if a['file'].startswith(('tilesets/','props/K_')) and a['id']!='clues'],
'characters':[a for a in m['assets'] if a['file'].startswith(('characters/','portraits/')) or a['id'] in ['shadows','turn_portraits']],
'backgrounds':[a for a in m['assets'] if a['id'].startswith('bg_')],
'items':[a for a in m['assets'] if a['id'].startswith('bestiary_') or a['id'] in ['items','belohnungen','clues','case_cover']],
'plates':[a for a in m['assets'] if a['id'].startswith('fotoplatte_')],
'story':[a for a in m['assets'] if a['id'].startswith(('scene_','ending_'))]}
for name,entries in sets.items():
 cellw=600;columns=2;rowhs=[];render=[]
 for a in entries:
  im=Image.open(ROOT/'public/sprites'/a['file']).convert('RGBA');scale=max(1,min(4,(cellw-16)//im.width))
  if im.width>cellw-16:scale=(cellw-16)/im.width
  im=im.resize((round(im.width*scale),round(im.height*scale)),NN);render.append((a,im))
 for i in range(0,len(render),2):rowhs.append(max(x[1].height for x in render[i:i+2])+44)
 out=Image.new('RGB',(columns*cellw,sum(rowhs)+40),'#333b46');d=ImageDraw.Draw(out);d.text((12,12),'BATCH K / '+name.upper(),fill='#eee2c5');y=40
 for row,h in enumerate(rowhs):
  for col,(a,im) in enumerate(render[row*2:row*2+2]):
   x=col*cellw+8;d.text((x,y),a['file']+'  '+str(a['width'])+'x'+str(a['height']),fill='#eee2c5');out.paste(im,(x,y+22),im)
  y+=h
 out.save(outdir/('batch-fall6-'+name+'.png'))
a=next(a for a in m['assets'] if a['id']=='boss');im=Image.open(ROOT/'public/sprites'/a['file']).convert('RGBA');frames=[];durations=[]
for name,an in a['animations'].items():
 for n in an['frames']:
  tile=im.crop((n%6*96,n//6*96,n%6*96+96,n//6*96+96)).resize((288,288),NN);can=Image.new('RGB',(320,326),'#535967');can.paste(tile,(16,30),tile);ImageDraw.Draw(can).text((12,10),name,fill='#eee2c5');frames.append(can);durations.append(200 if name=='idle' else 140)
 durations[-1]=600
frames[0].save(outdir/'batch-fall6-boss.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0,disposal=2)
print('Created',len(sets),'contact sheets and boss animation preview')
