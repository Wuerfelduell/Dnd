#!/usr/bin/env python3
"""Validate DF art with Pillow. --write saves report and full contact sheet."""
import hashlib,json,sys
from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[3];S=R/'public/sprites';D=R/'docs/art'
def pixels(im):return list(im.get_flattened_data()) if hasattr(im,'get_flattened_data') else list(im.getdata())
def frame(im,a,n):
 w,h=a['frameWidth'],a['frameHeight'];x=n%a['columns']*w;y=n//a['columns']*h;return im.crop((x,y,x+w,y+h))
def main():
 m=json.loads((S/'manifest-tiere.json').read_text());prov=json.loads((D/'batch-tiere-generation.json').read_text());errors=[];results=[];union=set();images={};unique=0
 def need(v,msg):
  if not v:errors.append(msg)
 expected={}
 for a in ['rabe','kater','hund','ratte']:
  expected.update({f'characters/tier_{a}.png':(64,80 if a=='rabe' else 64,16),f'characters/tier_{a}_posen.png':(64,48,16),f'portraits/tiere/tier_{a}.png':(96,32,32),f'battle/tier_{a}_eingriff.png':(288,48,48)})
 expected.update({'ui/tiere_symbole.png':(176,16,16),'fx/tier_marker.png':(64,16,16),'fx/tier_zufrieden.png':(64,16,16),'props/tiere_plaetze.png':(64,32,16)})
 need({a['file'] for a in m['assets']}==set(expected),'required file set');palette={tuple(bytes.fromhex(v[1:])) for v in m['palette']}
 for a in m['assets']:
  f=a['file'];p=S/f
  if not p.exists():errors.append('missing '+f);continue
  im=Image.open(p).convert('RGBA');images[f]=im;px=pixels(im);colors={v[:3] for v in px if v[3]};union|=colors
  need((im.width,im.height,a['frameWidth'])==expected[f],f+' dimensions');need(a['frameWidth']==a['frameHeight'],f+' square grid')
  need(im.size==(a['columns']*a['frameWidth'],a['rows']*a['frameHeight']),f+' grid size');need(colors<=palette and len(colors)<=32,f+' palette');need({v[3] for v in px}<={0,255},f+' alpha');need(all(v[:3]==(0,0,0) for v in px if not v[3]),f+' dirty transparent RGB');need(0 in im.getchannel('A').getextrema(),f+' transparency')
  sha=hashlib.sha256(p.read_bytes()).hexdigest();need(sha==a['sha256']==prov['outputs'][f],f+' hash')
  empty=set(a.get('emptyFrames',[]));frames=[frame(im,a,n) for n in range(a['rows']*a['columns'])]
  for n,t in enumerate(frames):
   need(bool(t.getbbox())==(n not in empty),f+' cell occupancy '+str(n))
   if n not in empty:
    box=t.getbbox();need(box[0]>0 and box[1]>=0 and box[2]<t.width and box[3]<t.height,f+' touches frame edge '+str(n))
    if 'baselineExclusive' in a:need(box[3]==a['baselineExclusive'],f+' feet baseline '+str(n))
  for name,anim in a.get('animations',{}).items():
   ns=anim['frames'];need(all(isinstance(n,int) and 0<=n<len(frames) and n not in empty for n in ns),f+' animation bounds '+name);need(anim['frameRate']>0,f+' speed')
   count=len({frames[n].tobytes() for n in ns});need(count==len(ns),f+' duplicate animation phase '+name);unique+=count
  if a['kind']=='character':need(all(k in a['animations'] for k in ['down','left','right','up']),f+' directions')
  if a['kind']=='portraits':need(len({t.tobytes() for t in frames})==3,f+' moods')
  if a['kind']=='icons':need(len({t.tobytes() for t in frames[8:]})==3,'bond icons indistinct')
  for name,r in a.get('regions',{}).items():need(all(r[k]%16==0 for k in ['x','y','width','height']) and r['x']+r['width']<=im.width and r['y']+r['height']<=im.height,f+' region '+name)
  results.append({'file':f,'width':im.width,'height':im.height,'colors':len(colors),'sha256':sha})
 need(len(union)<=32,'global palette');need(not (S/'fx/tier_herz.png').exists(),'heart effect not requested')
 report={'batch':'tiere','passed':not errors,'assetCount':len(results),'visibleColors':len(union),'distinctAnimationFrames':unique,'errors':errors,'assets':results}
 if '--write' in sys.argv:
  (D/'batch-tiere-validation.json').write_text(json.dumps(report,indent=2)+'\n');preview(images)
 print(f"DF Grafik: {'PASS' if not errors else 'FAIL'} | {len(results)} PNGs | {len(union)} Farben | {unique} unterschiedliche Animationsframes | {len(errors)} Fehler")
 for e in errors:print(e)
 return bool(errors)
def preview(images):
 out=Image.new('RGB',(1024,2240),'#33404b');draw=ImageDraw.Draw(out)
 draw.text((16,12),'DF / TIERGEFAEHRTEN - walk, poses, portraits, battle intervention',fill='#eee2c5')
 for i,name in enumerate(['rabe','kater','hund','ratte']):
  top=44+i*480
  for file,x,y,scale in [(f'characters/tier_{name}.png',16,top,4),(f'characters/tier_{name}_posen.png',300,top,4),(f'portraits/tiere/tier_{name}.png',580,top,4),(f'battle/tier_{name}_eingriff.png',16,top+324,3)]:
   im=images[file];im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST);draw.text((x,y-12),file,fill='#eee2c5');out.paste(im,(x,y),im)
 for file,x,y in [('ui/tiere_symbole.png',16,1990),('fx/tier_marker.png',16,2070),('fx/tier_zufrieden.png',300,2070),('props/tiere_plaetze.png',580,2070)]:
  im=images[file];im=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST);draw.text((x,y-12),file,fill='#eee2c5');out.paste(im,(x,y),im)
 out.save(D/'batch-tiere-preview.png',optimize=True)
if __name__=='__main__':sys.exit(main())
