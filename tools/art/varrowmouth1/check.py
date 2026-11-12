#!/usr/bin/env python3
"""Pillow validator for CV. Run from any directory; --write saves report/preview."""
import hashlib,json,sys,random
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[3];SPR=ROOT/'public/sprites';DOC=ROOT/'docs/art'
M=json.loads((SPR/'manifest-varrowmouth1.json').read_text())

def pixels(im):return list(im.get_flattened_data()) if hasattr(im,'get_flattened_data') else list(im.getdata())
def tile(im,n):return im.crop((n%16*16,n//16*16,n%16*16+16,n//16*16+16))
def main():
 errors=[];results=[];images={};allcolors=set();seams=0
 def need(ok,msg):
  if not ok:errors.append(msg)
 palette={tuple(bytes.fromhex(c[1:])) for c in M['palette']}
 expected={f'tilesets/vm_{t}_{s}.png':(256,256) for t in ['hafen','stege','schlick','oberstrasse','wrack','leuchtbank','innen'] for s in ['ebbe','flut']}
 expected.update({'tilesets/vm_wasser_anim.png':(256,64),'props/vm_props.png':(512,256),'facades/vm_fassaden.png':(512,128)})
 need({a['file'] for a in M['assets']}==set(expected),'required asset set differs')
 provenance=json.loads((DOC/'batch-varrowmouth1-generation.json').read_text())
 for a in M['assets']:
  f=a['file'];path=SPR/f
  if not path.exists():errors.append(f+' missing');continue
  im=Image.open(path).convert('RGBA');images[a['id']]=im;px=pixels(im);colors={p[:3] for p in px if p[3]};allcolors|=colors
  need(im.size==expected[f],f+' dimensions')
  need(im.size==(a['frameWidth']*a['columns'],a['frameHeight']*a['rows']),f+' grid dimensions')
  need({p[3] for p in px}<={0,255},f+' nonbinary alpha');need(all(p[:3]==(0,0,0) for p in px if not p[3]),f+' dirty transparent RGB')
  need(colors<=palette and len(colors)<=32,f+' palette')
  need(a['transparent']==(0 in im.getchannel('A').getextrema()),f+' transparency metadata')
  sha=hashlib.sha256(path.read_bytes()).hexdigest();need(sha==a['sha256']==provenance['outputs'][f],f+' hash')
  if a['kind']=='tiles':
   need(im.crop((0,64,256,256)).getbbox() is None,f+' unused tiles not empty')
   need(im.crop((0,0,256,64)).getchannel('A').getextrema()==(255,255),f+' occupied terrain alpha')
   need((111,224,208) not in colors,f+' forbidden turquoise')
   need(len({tile(im,n).tobytes() for n in range(8)})==8,f+' floor variants not unique')
  regions=a.get('regions',{});mask=Image.new('1',im.size);draw=ImageDraw.Draw(mask)
  for name,r in regions.items():
   x,y,w,h=[r[k] for k in ['x','y','width','height']]
   need(all(v%16==0 for v in [x,y,w,h]),f+' '+name+' region grid');need(0<=x<x+w<=im.width and 0<=y<y+h<=im.height,f+' '+name+' bounds')
   box=(x,y,x+w,y+h);need(mask.crop(box).getbbox() is None,f+' overlapping region '+name);draw.rectangle((x,y,x+w-1,y+h-1),fill=1)
   need(im.crop(box).getbbox() is not None,f+' empty '+name)
  if regions:
   need(all(not p[3] or covered for p,covered in zip(px,pixels(mask))),f+' pixels outside regions')
  for name,an in a.get('animations',{}).items():
   frames=an['frames'];need(all(0<=n<a['columns']*a['rows'] for n in frames),f+' animation bounds '+name)
   need(len({tile(im,n).tobytes() for n in frames})==len(frames),f+' repeated frames '+name)
  for name,an in a.get('regionAnimations',{}).items():
   crops=[]
   for n in an['frames']:
    r=regions[n];crops.append(im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).tobytes())
   need(len(set(crops))==len(crops),f+' duplicate region animation '+name)
  results.append(dict(file=f,size=list(im.size),visibleColors=len(colors),sha256=sha))
 need(len(allcolors)<=32,'union palette >32')
 for name,t in M['themes'].items():
  lo=images[t['ebbe']];hi=images[t['flut']];changed=[]
  for n in range(256):
   l,h=tile(lo,n),tile(hi,n)
   need(bool(l.getbbox())==bool(h.getbbox()),name+' occupancy differs')
   if l.tobytes()!=h.tobytes():changed.append(n)
  need(changed==t['tideChangedFrames'],name+' tide changes differ from contract')
  for im in [lo,hi]:
   for aa in range(16):
    for bb in range(16):
     a,b=tile(im,16+aa),tile(im,16+bb)
     if bool(aa&2)==bool(bb&1) and bool(aa&4)==bool(bb&8):
      need(a.crop((15,0,16,16)).tobytes()==b.crop((0,0,1,16)).tobytes(),name+' water horizontal seam');seams+=1
     if bool(aa&8)==bool(bb&1) and bool(aa&4)==bool(bb&2):
      need(a.crop((0,15,16,16)).tobytes()==b.crop((0,0,16,1)).tobytes(),name+' water vertical seam');seams+=1
   for a in range(8):
    for b in range(8):
     aa,bb=tile(im,a),tile(im,b)
     need(aa.crop((15,0,16,16)).tobytes()==bb.crop((0,0,1,16)).tobytes(),name+' floor seam');seams+=1
 need(len(M['regions']['vm_props'])>=60,'fewer than 60 props');need(len(M['facades'])==6,'six facades required')
 for f in M['facades'].values():
  r1=M['regions']['vm_fassaden'][f['dayRegion']];r2=M['regions']['vm_fassaden'][f['nightRegion']]
  crop=lambda r:images['vm_fassaden'].crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']))
  need(crop(r1).size==crop(r2).size,'facade pair sizes');need(crop(r1).tobytes()!=crop(r2).tobytes(),'night facade unchanged')
 for k,n in [('pegeluhr_ebbe',(32,64)),('pegeluhr_flut',(32,64)),('pegeluhr_wechsel',(32,64)),('boot_ebbe',(48,32)),('boot_flut',(48,32)),('leuchtbank_glocke',(32,48))]:
  r=M['regions']['vm_props'][k];need((r['width'],r['height'])==n,k+' size')
 anim=images['vm_wasser_anim'];used={f for a in M['anims'].values() for f in a['frames']}
 for n in range(64):need(bool(tile(anim,n).getbbox())==(n in used),'animation occupied frame '+str(n))
 report=dict(batch='varrowmouth1',passed=not errors,assetCount=len(results),themeCount=len(M['themes']),propRegions=60,facadeRegions=12,visibleColors=len(allcolors),seamComparisons=seams,preview={'tileTest':[8,8],'themeTidePanels':14},errors=errors,assets=results)
 if '--write' in sys.argv:
  (DOC/'batch-varrowmouth1-validation.json').write_text(json.dumps(report,indent=2)+'\n');preview(images)
 print(f"varrowmouth1: {'PASS' if not errors else 'FAIL'} | {len(results)} PNGs | 7 tide pairs | 60 props | 12 facade regions | {len(allcolors)} colors | {seams} seam checks")
 for e in errors:print('ERROR:',e)
 return bool(errors)

def preview(images):
 out=Image.new('RGB',(1088,1510),'#232b38');d=ImageDraw.Draw(out)
 d.text((16,10),'CV / VARROWMOUTH - 8x8 tile tests - EBBE | FLUT',fill='#d4d9ca')
 for j,(name,t) in enumerate(M['themes'].items()):
  for s,tide in enumerate(['ebbe','flut']):
   im=images[t[tide]];test=Image.new('RGBA',(128,128))
   for y in range(8):
    for x in range(8):
     if y<3:n=(x+y*3)%8
     elif x<3:n=8+(x+y)%8
     else:
      # Shared vertex field: diagonal coast, creating all boundary orientations.
      v=lambda xx,yy: ((xx-5)**2+(yy-5)**2<7)
      mask=sum(bit for dx,dy,bit in [(0,0,1),(1,0,2),(1,1,4),(0,1,8)] if v(x+dx,y+dy));n=16+mask
     test.paste(tile(im,n),(x*16,y*16))
   # Place authored architecture, bridge and tide wall in same cells in each panel.
   for x,y,n in [(0,0,48),(1,0,49),(0,1,43),(1,1,44),(2,3,34),(2,4,32),(3,2,36),(4,2,36)]:test.paste(tile(im,n),(x*16,y*16))
   px=16+(j%2)*536+s*260;py=48+(j//2)*286
   d.text((px,py-14),name+' / '+tide,fill='#d4d9ca');out.paste(test.resize((256,256),Image.Resampling.NEAREST),(px,py),test.resize((256,256),Image.Resampling.NEAREST))
 props=images['vm_props'];fac=images['vm_fassaden'];out.paste(props,(16,1200),props);out.paste(fac,(552,1200),fac)
 d.text((16,1180),'60 PROP REGIONS',fill='#d4d9ca');d.text((552,1180),'DAY/NIGHT FACADES - TOWERS SIDE BY SIDE',fill='#d4d9ca')
 out.save(DOC/'batch-varrowmouth1-preview.png',optimize=True)
if __name__=='__main__':sys.exit(main())
