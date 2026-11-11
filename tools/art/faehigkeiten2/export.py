"""Rebuild BZ from recorded ImageGen sources: python tools/art/faehigkeiten2/export.py SOURCE_DIR."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json,sys,hashlib
ROOT=Path(__file__).resolve().parents[3]
META=ROOT/'docs/art/batch-faehigkeiten2-generation.json'
ORDER=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
LABELS=['Laterne','Faden','Maske','Echo','Kessel','Eisen','Schlüssel','Waage','Moor','Uhr']
# One common palette, transparent index 0 in addition to 32 visible colors.
PALETTE=['#1a1c2c','#252b38','#425360','#7d7f8a','#e6dcc3','#eee2c5',
'#e8b860','#c8b0e8','#e07a8a','#6fe0d0','#9ad06a','#a8b4c0','#d0a050','#c9a84c','#6b4a2e','#b8783c',
'#886332','#78578f','#894858','#36817a','#537a39','#586c78','#927039','#87722f','#443426','#784a30',
'#5f7a4a','#493d59','#f0ce80','#e0c9a1','#95a5a5','#877595']
RGB=[tuple(bytes.fromhex(c[1:])) for c in PALETTE]
def save(im,path):
 out=Image.new('P',im.size);pal=[0,0,0]+[v for c in RGB for v in c];out.putpalette(pal+[0]*(768-len(pal)))
 cache={};pixels=[]
 for r,g,b,a in im.convert('RGBA').getdata():
  if a<180:pixels.append(0);continue
  c=(r,g,b)
  if c not in cache:cache[c]=min(range(32),key=lambda i:sum((c[k]-RGB[i][k])**2 for k in range(3)))+1
  pixels.append(cache[c])
 out.putdata(pixels);out.info['transparency']=0;path.parent.mkdir(parents=True,exist_ok=True);out.save(path,transparency=0,optimize=True)
 return out.convert('RGBA')
def crop_sheet(im):
 # Remove accidental canvas padding using the dark medallions, not white matte pixels.
 rgb=im.convert('RGB');a=im.getchannel('A');mask=Image.new('L',im.size)
 mask.putdata([255 if alpha>180 and max(p)<145 else 0 for p,alpha in zip(rgb.getdata(),a.getdata())])
 box=mask.getbbox();assert box
 return im.crop(box),box

def cell_icon(cell,kind,seq):
 cell=cell.convert('RGBA');cell=cell.resize((16,16),Image.Resampling.NEAREST)
 # Normalize the circular boundary and world-only one-pixel inner ring.
 for y in range(16):
  for x in range(16):
   d=(x-7.5)**2+(y-7.5)**2
   if d>7.5**2:cell.putpixel((x,y),(0,0,0,0))
   elif d>6.5**2:cell.putpixel((x,y),(*RGB[0],255))
   elif kind=='welt' and d>5.5**2:cell.putpixel((x,y),(*RGB[5],255))
   elif cell.getpixel((x,y))[3]<180:cell.putpixel((x,y),(*RGB[1],255))
 # A shared small highlight on the upper-left rim; occult mark belongs only to seq3..1.
 cell.putpixel((3,3),(*RGB[4],255))
 if seq<=3:cell.putpixel((11,11),(*RGB[9 if kind=='kampf' else 17],255))
 return cell

def main():
 meta=json.loads(META.read_text());data=json.loads((ROOT/'src/data/packs/sequenzen/faehigkeiten2.json').read_text())
 atlases={k:Image.new('RGBA',(160,144)) for k in ['kampf','welt']};sources=[]
 for job in meta['generations']:
  path=Path(sys.argv[1])/job['sourceFile'];assert hashlib.sha256(path.read_bytes()).hexdigest()==job['sha256']
  im,box=crop_sheet(Image.open(path).convert('RGBA'));job['cropBox']=list(box)
  for n,c in enumerate(job['cells']):
   row,col=divmod(n,3);cell=im.crop((round(col*im.width/3),round(row*im.height/3),round((col+1)*im.width/3),round((row+1)*im.height/3)))
   icon=cell_icon(cell,job['kind'],c['seq']);folder='skills3' if job['kind']=='kampf' else 'talents'
   icon=save(icon,ROOT/f'public/sprites/ui/{folder}/{c["id"]}.png')
   atlases[job['kind']].paste(icon,(ORDER.index(job['path'])*16,(9-c['seq'])*16))
 assets=[]
 for kind,id in [('kampf','skill_icons_3'),('welt','talent_icons')]:
  save(atlases[kind],ROOT/f'public/sprites/ui/{id}.png')
  ids=[[data[p][str(s)][kind]['id'] for p in ORDER] for s in range(9,0,-1)]
  assets.append(dict(id=id,file=f'ui/{id}.png',width=160,height=144,transparent=True,frameWidth=16,frameHeight=16,columns=10,rows=9,pathwayOrder=ORDER,sequenceOrder=list(range(9,0,-1)),skillIds=ids,singleIconDirectory='ui/skills3' if kind=='kampf' else 'ui/talents'))
 manifest=dict(version=1,batch='faehigkeiten2',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=PALETTE,assets=assets)
 (ROOT/'public/sprites/manifest-faehigkeiten2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 META.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
 # Exact 4x nearest-neighbor enlargement, labels outside the atlas cells.
 preview=Image.new('RGB',(760,1340),'#343b46');draw=ImageDraw.Draw(preview)
 try:font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11);title=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
 except OSError:font=title=ImageFont.load_default()
 for k,(kind,label) in enumerate([('kampf','Zweite Kampffertigkeiten'),('welt','Welt-Fähigkeiten · heller Innenring')]):
  top=60+k*660;draw.text((80,top-52),label,font=title,fill='#eee2c5')
  for n,name in enumerate(LABELS):draw.text((80+n*64+32,top-20),name,font=font,anchor='mm',fill='#eee2c5')
  for n,s in enumerate(range(9,0,-1)):draw.text((12,top+n*64+26),f'Seq {s}',font=font,fill='#eee2c5')
  atlas=atlases[kind].resize((640,576),Image.Resampling.NEAREST);preview.paste(atlas,(80,top),atlas)
 preview.save(ROOT/'docs/art/preview-faehigkeiten2.png')
 print('Exported 180 icons, 2 atlases and labeled 4x preview')
if __name__=='__main__':main()
