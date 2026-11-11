"""Deterministic target-raster export of generated sources; no runtime changes."""
import json
from pathlib import Path
from collections import Counter
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent
JOBS=json.loads((HERE/'jobs.json').read_text())['jobs']
# Shared palette sampled from existing character/background art, with fixed outline/occult accents.
counts=Counter()
for file in ['characters/03_01_investigator_walk.png','characters/p2a_walk.png','characters/p2b_walk.png','battle/bg_ds_schwellenring.png']:
 for r,g,b,a in Image.open(ROOT/'public/sprites'/file).convert('RGBA').getdata():
  if a and (r,g,b) not in [(0,0,0),(255,255,255)]:counts[(r,g,b)]+=1
palette=[(26,28,44),(111,224,208),(71,48,91),(112,77,136)]
# Include character/material tones even though the large background dominates counts.
for target in [(43,46,52),(65,75,63),(87,99,77),(119,108,86),(153,130,87),(183,157,108),(61,83,103),(91,115,130),(155,171,175),(200,191,166)]:
 rgb=min(counts, key=lambda p:sum((p[i]-target[i])**2 for i in range(3)))
 if rgb not in palette:palette.append(rgb)
for rgb,_ in counts.most_common():
 if rgb not in palette:palette.append(rgb)
 if len(palette)==31:break

def export(job, source):
 raw=Image.open(source).convert('RGBA')
 im=raw.resize((job['width'],job['height']),Image.Resampling.NEAREST)
 if job['id']=='korruption_overlay':
  # Preserve subpixel-thin generated fibers as binary native pixels; RGB still uses nearest neighbor.
  coverage=raw.getchannel('A').resize(im.size,Image.Resampling.BOX).point(lambda a:255 if a>=24 else 0)
  im.putalpha(coverage)
  # Retain actual violet source glints that are smaller than a nearest-neighbor sample.
  glint=Image.new('L',raw.size)
  glint.putdata([255 if a>=128 and b>=75 and b-g>=25 and b>r else 0 for r,g,b,a in raw.getdata()])
  glint=glint.resize(im.size,Image.Resampling.BOX)
  for y in range(im.height):
   for x in range(im.width):
    if glint.getpixel((x,y))>=2 and coverage.getpixel((x,y)):im.putpixel((x,y),(112,77,136,255))
 # Register each generated piece to the corresponding reference frame. Models may center
 # a garment in its cell despite the reference; never accept that as a wearable overlay.
 slot=job.get('slot')
 if slot in ['hat','coat','weapon']:
  reference=Image.open(ROOT/'public/sprites'/job['reference']).convert('RGBA')
  registered=Image.new('RGBA',im.size)
  for row in range(4):
   for col in range(4):
    box=(col*16,row*32,col*16+16,row*32+32)
    part=im.crop(box);mask=part.getchannel('A').point(lambda a:255 if a>=128 else 0);bbox=mask.getbbox()
    if bbox is None:
     if slot=='weapon' and row==3:continue
     raise ValueError(job['id']+': empty source frame')
    part=part.crop(bbox);base=reference.crop(box)
    head=base.crop((0,0,16,12)).getchannel('A').getbbox()
    cx=(head[0]+head[2])/2 if head else 8;top=head[1] if head else 1
    if slot=='hat':
     item=job['itemId'];target=(12,7);bottom=top+7
     if item in ['hut_zylinder','hut_maskenball','hut_helm']:target=(12,10);bottom=top+8
     elif item in ['hut_kapuze','hut_chor','hut_witwenschleier']:target=(12,13);bottom=top+13
     elif item in ['hut_maske','hut_schnabel']:target=(12,8);bottom=top+12
     elif item=='geweihreif':target=(16,9);bottom=top+8
     scale=min(target[0]/part.width,target[1]/part.height)
     size=(max(1,round(part.width*scale)),max(1,round(part.height*scale)))
     part=part.resize(size,Image.Resampling.NEAREST)
     x=max(0,min(16-part.width,round(cx-part.width/2)));y=max(0,bottom-part.height)
    elif slot=='coat':
     # Torso footprint follows the reference's arm/gait extent, leaving face and boots visible.
     body=base.crop((0,12,16,28)).getchannel('A').getbbox()
     left,right=(body[0],body[2]) if body else (2,14)
     width=min(12,max(7,right-left));height=16
     part=part.resize((width,height),Image.Resampling.NEAREST)
     x=max(0,min(16-width,round((left+right-width)/2)));y=12
    else:
     if row==3:
      part=part.resize((min(2,part.width),min(2,part.height)),Image.Resampling.NEAREST);x,y=11,21
     else:
      hx,hy=[(3,21),(4,22),(11,22)][row]
      # Bright source skin pixels locate the visible right wrist within its expected region.
      candidates=[]
      for yy in range(hy-3,hy+3):
       for xx in range(max(0,hx-2),min(16,hx+3)):
        rr,gg,bb,aa=base.getpixel((xx,yy))
        if aa and rr>80 and gg>70 and rr>=bb:
         candidates.append(((rr+gg+bb)/3-12*(abs(xx-hx)+abs(yy-hy)),xx,yy))
      if candidates:_,hx,hy=max(candidates)
      scale=min(4/part.width,10/part.height)
      part=part.resize((max(1,round(part.width*scale)),max(1,round(part.height*scale))),Image.Resampling.NEAREST)
      x=max(0,min(16-part.width,hx-part.width//2));y=min(32-part.height,hy)
    registered.alpha_composite(part,(col*16+x,row*32+y))
    if slot=='weapon' and row==3:
     for yy in range(32):
      for xx in range(16):
       if base.getpixel((xx,yy))[3]>=128:registered.putpixel((col*16+xx,row*32+yy),(0,0,0,0))
  im=registered
 if job['id']=='korruption_overlay':
  aligned=Image.new('RGBA',im.size)
  for row in range(4):
   for col in range(4):
    part=im.crop((col*16,row*32,col*16+16,row*32+32))
    box=part.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    if not box:raise ValueError('missing corruption threads')
    part=part.crop(box);part.thumbnail((10,15),Image.Resampling.NEAREST)
    aligned.alpha_composite(part,(col*16+(16-part.width)//2,row*32+13))
  im=aligned
 alpha=im.getchannel('A').point(lambda a:255 if a>=128 else 0) if job['transparent'] else Image.new('L',im.size,255)
 allowed=palette
 if job.get('slot') in ['hat','coat','weapon'] and job.get('itemId') not in ['mantel_nebel','sternglasdolch','stimmgabel_gross','glockenzunge','kette_rauchfass']:
  allowed=[p for p in palette if p not in [(111,224,208),(71,48,91),(112,77,136)]]
 pal=Image.new('P',(1,1));pal.putpalette(sum((list(p) for p in allowed),[])+list(palette[0])*(256-len(allowed)))
 rgb=im.convert('RGB').quantize(palette=pal,dither=Image.Dither.NONE).convert('RGBA');rgb.putalpha(alpha)
 if job['id']=='korruption_overlay':
  thread_colors=[(26,28,44),(71,48,91),(112,77,136)]
  rgb.putdata([(*min(thread_colors,key=lambda c:sum((c[i]-p[i])**2 for i in range(3))),p[3]) if p[3] else (0,0,0,0) for p in rgb.getdata()])
 # Extract the requested tiny necklace highlight, discarding any reference-body pixels.
 if job.get('slot')=='amulet':
  glints=Image.new('RGBA',rgb.size)
  reference=Image.open(ROOT/'public/sprites'/job['reference']).convert('RGBA')
  for row in range(4):
   for col in range(4):
    points=[]
    for y in range(10,16):
     for x in range(4,12):
      pixel=rgb.getpixel((col*16+x,row*32+y))
      if pixel[3]:
       # Prefer bright warm source pixels at the neckline; never synthesize a color.
       r,g,b,a=pixel;score=(r+g+b)/3-5*abs(y-12)-3*abs(x-8)
       points.append((score,(col*16+x,row*32+y)))
    if len(points)<2:raise ValueError(job['id']+': missing source neckline highlights')
    points.sort(reverse=True);anchor=points[0][1]
    adjacent=[v for v in points[1:] if abs(v[1][0]-anchor[0])+abs(v[1][1]-anchor[1])==1]
    if not adjacent:raise ValueError(job['id']+': no adjacent source highlight pair')
    base=reference.crop((col*16,row*32,col*16+16,row*32+32))
    head=base.crop((0,0,16,12)).getchannel('A').getbbox()
    cx=round((head[0]+head[2])/2);neck=head[1]+11
    for target,source in zip([(col*16+cx-1,row*32+neck),(col*16+cx,row*32+neck)],[anchor,adjacent[0][1]]):glints.putpixel(target,rgb.getpixel(source))
  rgb=glints
 # Normalize transparent RGB to zero. No opaque matte is keyed out or fabricated.
 rgb.putdata([(r,g,b,a) if a else (0,0,0,0) for r,g,b,a in rgb.getdata()])
 out=ROOT/'public/sprites'/job['file'];out.parent.mkdir(parents=True,exist_ok=True)
 indexed=Image.new('P',rgb.size)
 indexed.putpalette([0,0,0]+sum((list(p) for p in palette),[]))
 lookup={color:i+1 for i,color in enumerate(palette)}
 indexed.putdata([lookup[(r,g,b)] if a else 0 for r,g,b,a in rgb.getdata()])
 indexed.save(out,optimize=True,transparency=0)
 return out

if __name__=='__main__':
 import argparse
 p=argparse.ArgumentParser();p.add_argument('sources',type=Path);a=p.parse_args()
 sources={s['id']:s['path'] for s in json.loads(a.sources.read_text()) if s.get('path')}
 for j in JOBS:
  if j['id'] in sources:print(export(j,sources[j['id']]).relative_to(ROOT))
 (HERE/'palette.json').write_text(json.dumps(palette)+'\n')
