"""Reproduce CA assets from the checked-in image_gen masters (requires Pillow)."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[3]
PALETTE = ['#1a1c2c','#252b38','#425360','#71858b', '#886332','#e8b860','#78578f','#c8b0e8','#884b60','#e07a8a','#36817a','#6fe0d0','#4f713f','#9ad06a','#64788f','#a8b4c0','#987038','#d0a050','#8b7335','#c9a84c','#6b4a2e','#5f7a4a','#794e30','#b8783c','#7d7f8a','#e6dcc3','#503b68','#6a4a8a','#413433','#92745a','#b3946e']
PATHS = ['laterne','faden','maske','echo','kessel','eisen','schluessel','waage','moor','uhr']
NAMES = {
'laterne':['Dochtgericht','Aschenlesung','Horizontschnitt','Offene Beleuchtung'],
'faden':['Nahtbefund','Bruchvermerk','Saumzug','Offener Knoten'],
'maske':['Fremde Miene','Rollenwechsel','Leeres Parkett','Eigener Auftritt'],
'echo':['Restton','Nachrufzug','Uferlaut','Ausgehört'],
'kessel':['Rückstandslauge','Rücklauf','Abwärmesud','Letzte Fraktion'],
'eisen':['Lastschlag','Widerlager','Tragwerkstoß','Standhalten'],
'schluessel':['Schwellenschnitt','Leerriegel','Randsprung','Offene Schwelle'],
'waage':['Pfandabruf','Saldenstoß','Gegenbuchung','Letzte Quittung'],
'moor':['Schichtdruck','Sedimentgriff','Uferschlick','Fehlstellenruf'],
'uhr':['Taktlücke','Friststoß','Wiederkehrschlag','Minutenfreigabe']}
NEW_NAMES={'waage':['Pfanddruck','Gegengewicht','Fristpfand','Ausgleichshieb','Pfandsaldo'],'moor':['Schlickgriff','Namenslast','Torfdruck','Uferhand','Schichtschluss'],'uhr':['Taktschlag','Vortritt','Pendelkehr','Gangausgleich','Fristkehr']}
RGB=[tuple(bytes.fromhex(c[1:])) for c in PALETTE]

def indexed(im):
    out=Image.new('P',im.size,0)
    out.putpalette([0,0,0]+[v for c in RGB for v in c]+[0]*(768-96))
    out.putdata([0 if a<128 else 1+min(range(len(RGB)),key=lambda i:sum((x-y)**2 for x,y in zip((r,g,b),RGB[i]))) for r,g,b,a in im.convert('RGBA').getdata()])
    out.info['transparency']=0
    return out

def run():
    assets=[]
    preview=Image.new('RGB',(2320,780),'#202735')
    d=ImageDraw.Draw(preview)
    fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    font=ImageFont.truetype(fontpath,12)
    titlefont=ImageFont.truetype(fontpath,19)
    d.text((22,12),'CA · Hauptfertigkeiten · 16×16 / Vorschau 4×',font=titlefont,fill='#e6dcc3')
    for key,paths,seqs,suffix,names,top in [('hoch',PATHS,[4,3,2,1],'hoch',NAMES,75),('neu',PATHS[7:],[9,8,7,6,5],'stufe',NEW_NAMES,430)]:
        src=Image.open(ROOT/f'docs/art/skill-icons-hoch-sources/{key}.png').convert('RGBA')
        cols,rows=len(paths),len(seqs)
        atlas=Image.new('RGBA',(cols*16,rows*16))
        ids=[]
        for row,seq in enumerate(seqs):
            ids.append([])
            for col,path in enumerate(paths):
                ident=f'{path}_{suffix}_{seq}'
                ids[-1].append(ident)
                box=(round(col*src.width/cols),round(row*src.height/rows),round((col+1)*src.width/cols),round((row+1)*src.height/rows))
                icon=src.crop(box).resize((16,16),Image.Resampling.NEAREST)
                # Canonical 14px medallion silhouette eliminates generation fringe.
                mask=Image.new('1',(16,16)); md=ImageDraw.Draw(mask); md.ellipse((1,1,14,14),fill=1)
                p=icon.load()
                for y in range(16):
                    for x in range(16):
                        if not mask.getpixel((x,y)): p[x,y]=(0,0,0,0)
                        elif any(not mask.getpixel((xx,yy)) for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]): p[x,y]=(*RGB[0],255)
                        elif p[x,y][3]<128: p[x,y]=(*RGB[1],255)
                # One-pixel highlights and rank accents survive exact 16px export.
                p[4,3]=(*RGB[3],255)
                if key=='hoch' and seq<=3: p[12,4]=(*RGB[11],255)
                if key=='hoch' and seq==1: p[8,8]=(*RGB[25],255)
                icon=indexed(icon)
                icon.save(ROOT/f'public/sprites/ui/skills_hoch/{ident}.png',optimize=True)
                atlas.paste(icon.convert('RGBA'),(col*16,row*16))
                if key=='hoch': x,y=40+col*228,top+row*85
                else: x,y=40+row*452,top+col*105
                preview.paste(icon.convert('RGBA').resize((64,64),Image.Resampling.NEAREST),(x,y),icon.convert('RGBA').resize((64,64),Image.Resampling.NEAREST))
                if key=='hoch':
                    d.text((x,y-17),f'{path.capitalize()} · S{seq}',font=font,fill='#a8b4c0')
                    d.text((x+68,y+18),names[path][row].replace(' ','\n',1),font=font,fill='#e6dcc3')
                else:
                    d.text((x,y-17),f'{path.capitalize()} · S{seq}',font=font,fill='#a8b4c0')
                    d.text((x+76,y+23),names[path][row],font=font,fill='#e6dcc3')
        filename=f'ui/skill_icons_{key}.png'
        indexed(atlas).save(ROOT/'public/sprites'/filename,optimize=True)
        assets.append(dict(id=f'skill_icons_{key}',file=filename,width=cols*16,height=rows*16,transparent=True,frameWidth=16,frameHeight=16,columns=cols,rows=rows,pathwayOrder=paths,sequenceOrder=seqs,skillIds=ids))
    manifest=dict(version=1,batch='skill_icons_hoch',status='exported; runtime integration pending',paletteMaxVisibleColors=32,palette=PALETTE,assets=assets,individualIconDirectory='ui/skills_hoch',preview='docs/art/preview-skill-icons-hoch.png',generation='docs/art/batch-skill-icons-hoch-generation.json')
    (ROOT/'public/sprites/manifest-skill-icons-hoch.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    preview.save(ROOT/'docs/art/preview-skill-icons-hoch.png')

if __name__=='__main__': run()
