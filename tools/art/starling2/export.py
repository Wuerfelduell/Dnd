#!/usr/bin/env python3
"""Export BS from normalized image-generator atlases. Requires Pillow only."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
SPRITES = ROOT / 'public/sprites'
SOURCES = HERE / 'sources'
N = Image.Resampling.NEAREST

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def main():
    # Exact existing phase-one colors, not an unrelated generated palette.
    colors = set()
    for name in ['ui/X_08_boss_starling.png', 'battle/bg_sternwarte.png']:
        im = Image.open(SPRITES / name).convert('RGBA')
        colors.update(p[:3] for p in im.getdata() if p[3] == 255)
    palette = sorted(colors)
    assert len(palette) == 31
    palette_image = Image.new('P', (1, 1))
    rgb = [channel for color in palette for channel in color]
    palette_image.putpalette(rgb + list(palette[0]) * (256-len(palette)))
    assets = []

    def asset(name, folder, fw, fh, cols=1, rows=1, transparent=True):
        source = SOURCES / (name + '.png')
        im = Image.open(source).convert('RGBA')
        assert im.size == (fw*cols, fh*rows)
        alpha = im.getchannel('A').point(lambda v: 255 if v >= 160 else 0)
        indexed = im.convert('RGB').quantize(palette=palette_image, dither=Image.Dither.NONE)
        out = indexed.convert('RGBA')
        out.putalpha(alpha if transparent else Image.new('L', out.size, 255))
        # Canonical invisible pixels; prevents hidden matte RGB in exports.
        clean = Image.new('RGBA', out.size)
        clean.paste(out, (0, 0), out.getchannel('A'))
        path = SPRITES / folder / (name+'.png')
        path.parent.mkdir(parents=True, exist_ok=True)
        clean.save(path, optimize=True)
        item = dict(id=name, file=f'{folder}/{name}.png', width=out.width,
                    height=out.height, transparent=transparent, frameWidth=fw,
                    frameHeight=fh, columns=cols, rows=rows,
                    sha256=digest(path), source=f'tools/art/starling2/sources/{name}.png',
                    sourceSha256=digest(source))
        assets.append(item)
        return item

    def animations(item, names, counts, rate=8):
        item['animations'] = {}
        for row, (name, count) in enumerate(zip(names, counts)):
            item['animations'][name] = dict(
                frames=list(range(row*item['columns'], row*item['columns']+count)),
                frameRate=6 if name in ['idle', 'phase_in'] else rate,
                repeat=-1 if name == 'idle' else 0)

    boss = asset('starling2', 'battle', 128, 96, 8, 7)
    animations(boss, ['idle','attack','special','cast','hit','phase_in','defeat'], [4,6,6,6,3,8,6])
    boss.update(gameId='starling_fight', phase=2, facing='left',
                anchor={'x':64,'y':94,'space':'frame pixels'},
                origin={'x':0.5,'y':94/96},
                blankFrames=[i for i in range(56) if i not in {f for a in boss['animations'].values() for f in a['frames']}],
                nonlethalDefeat=True,
                notes='Phase 1 remains intact. Attack frames 8 and 9 are identical. The final defeat frame is a living kneeling man.')
    asset('X_08_boss_starling2', 'battle', 160, 160)
    bg = asset('bg_sternwarte2', 'battle', 480, 270, transparent=False)
    bg['regions'] = {
        'licht_sternkarte':dict(x=48,y=45,width=112,height=110,color='#6fe0d0',kind='lightZone'),
        'licht_kuppelriss':dict(x=250,y=0,width=210,height=100,color='#8c7295',kind='lightZone')}
    fx = asset('starling2_fx', 'fx', 48, 48, 6, 5)
    animations(fx,['stern_fall','linse','lanze_treffer','ernte_aufstieg','glas_bruch'],[6]*5)
    stars = asset('starling2_sterne', 'fx', 16, 16, 12)
    symbols = ['glocke','glasauge','theatermaske','uhrzeiger','nordtorschluessel','gaswerkflamme','villa_spiegel','elend_kerze']
    stars['regions'] = {name:dict(x=i*16,y=0,width=16,height=16,frame=i,caseNumber=i+1) for i,name in enumerate(symbols)}
    stars['animations'] = {'funkeln':dict(frames=[8,9,10,11],frameRate=8,repeat=-1)}
    hud = asset('starling2_hud','ui',192,48)
    hud['regions'] = {'leiste_leer':dict(x=0,y=0,width=192,height=16),
                      'leiste_gefuellt':dict(x=0,y=16,width=192,height=16),
                      'linsenwand_aktiv':dict(x=0,y=32,width=16,height=16),
                      'stern_verbraucht':dict(x=16,y=32,width=16,height=16)}
    for row, state in enumerate(['leer','gefuellt']):
        for i, cx in enumerate([31,51,70,89,108,126,145,164]):
            hud['regions'][f'sockel_{i+1}_{state}'] = dict(x=cx-6,y=row*16+4,width=12,height=9,caseNumber=i+1)
    portraits = asset('starling2_emotions','portraits',64,64,4)
    portraits['regions'] = {name:dict(x=i*64,y=0,width=64,height=64,frame=i) for i,name in enumerate(['neutral','triumphierend','zweifelnd','erloschen'])}
    asset('starling_phase2','ui/scenes',240,135,transparent=False)
    floor = asset('starling2_boden','battle',480,64)
    floor.update(optional=True, layer='foreground', origin={'x':0,'y':1})
    dome = asset('starling2_kuppel','fx',480,135,6)
    dome.update(optional=True, layer='dome overlay', animations={'puls':dict(frames=list(range(6)),frameRate=6,repeat=-1)})
    coop = asset('starling2_koop','ui',48,48,2)
    coop.update(optional=True, regions={
        'spieler1':dict(x=0,y=0,width=48,height=48,player=1,shape='round',color='turquoise'),
        'spieler2':dict(x=48,y=0,width=48,height=48,player=2,shape='diamond',color='violet')})
    manifest = dict(version=1,batch='starling2',status='exported; runtime integration pending',
                    paletteMaxVisibleColors=31,palette=['#%02x%02x%02x'%c for c in palette],
                    alpha='binary 0/255',grid='integer pixels; frame rectangles documented per asset',assets=assets)
    write_json(SPRITES/'manifest-starling2.json',manifest)
    preview(assets)
    print(f'Exported {len(assets)} atlases, common {len(palette)}-color palette')

def preview(assets):
    out = Image.new('RGB',(1080,1510),'#252b38')
    draw=ImageDraw.Draw(out)
    try:
        font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
    except OSError:
        font=ImageFont.load_default()
    def label(x,y,s):draw.text((x,y),s,font=font,fill='#eee2c5')
    def put(file,x,y,scale=1):
        im=Image.open(SPRITES/file).convert('RGBA')
        if scale!=1:im=im.resize((im.width*scale,im.height*scale),N)
        out.paste(im,(x,y),im)
    label(20,12,'BS / STARLING – ZWEITE PHASE | 11 Atlanten | 31 gemeinsame Farben')
    put('battle/bg_sternwarte2.png',20,40)
    put('ui/scenes/starling_phase2.png',520,40,2)
    label(20,320,'idle · attack · special · cast · hit · phase_in · defeat (jeweils von links)')
    put('battle/starling2.png',20,345)
    # Cell boundaries only in documentation, never in exported sprite sheets.
    for y in range(8):draw.line((20,345+y*96,1044,345+y*96),fill='#425360')
    for x in range(9):draw.line((20+x*128,345,20+x*128,1017),fill='#425360')
    put('battle/X_08_boss_starling2.png',20,1040)
    put('portraits/starling2_emotions.png',200,1040,2)
    put('ui/starling2_hud.png',200,1180,2)
    put('ui/starling2_koop.png',760,1040,2)
    put('fx/starling2_sterne.png',20,1300,3)
    put('fx/starling2_fx.png',750,1250)
    put('battle/starling2_boden.png',20,1380)
    dome=Image.open(SPRITES/'fx/starling2_kuppel.png').convert('RGBA').crop((1440,0,1920,135))
    dome=dome.resize((240,68),N);out.paste(dome,(510,1380),dome)
    label(20,1470,'Verwandlung einmalig; Niederlage nicht tödlich. Kein Spielcode geändert.')
    out.save(ROOT/'docs/art/preview-starling2.png',optimize=True)

if __name__=='__main__':main()
