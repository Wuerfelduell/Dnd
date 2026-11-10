"""Validate final BP assets and generate review images. Requires Pillow."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/sprites'
DOC=ROOT/'docs/art'
EXPECTED={'fx/BP_tentakel_kontrollverlust.png':(768,64),
          'ui/scenes/kontrollverlust.png':(240,135),'items/laeutersalz.png':(16,16),
          'items32/laeutersalz.png':(32,32),'ui/BP_korruption.png':(96,16),
          'ui/BP_korruption_rahmen.png':(48,48),'characters/BP_player_korruption.png':(64,96)}

def pixels(im):
    return list(im.get_flattened_data()) if hasattr(im,'get_flattened_data') else list(im.getdata())

def main():
    m=json.loads((OUT/'manifest-kontrollverlust.json').read_text())
    assert len(m['assets'])==7
    assert {a['file'] for a in m['assets']}==set(EXPECTED)
    colors=set();frames=0;by_id={};results=[]
    for a in m['assets']:
        p=OUT/a['file'];raw=Image.open(p);im=raw.convert('RGBA');by_id[a['id']]=im
        assert im.size==EXPECTED[a['file']]==(a['width'],a['height']),p
        assert raw.mode=='P',p
        assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],p
        rgba=pixels(im);alphas={c[3] for c in rgba}
        assert alphas==({0,255} if a['transparent'] else {255}),(p,alphas)
        colors.update(c[:3] for c in rgba if c[3])
        fw,fh,c,r=(a[k] for k in ['frameWidth','frameHeight','columns','rows'])
        assert im.size==(fw*c,fh*r),p
        signatures=[]
        for n in range(c*r):
            cell=im.crop((n%c*fw,n//c*fh,n%c*fw+fw,n//c*fh+fh))
            assert cell.getbbox(),(p,n)
            if a['id']=='BP_player_korruption':
                assert cell.getbbox()[3]==31,(p,n,'baseline')
            signatures.append(cell.tobytes());frames+=1
        for clip in a.get('animations',{}).values():
            assert all(0<=f<c*r for f in clip['frames']),p
            if len(clip['frames'])>1:
                assert len({signatures[f] for f in clip['frames']})>=3,p
        results.append({'file':a['file'],'frames':c*r,'passed':True})
    assert len(colors)<=32
    assert colors <= {tuple(c) for c in m['palette']}
    fx=by_id['tentakel_fx'];areas=[];coverage=[]
    for n in range(12):
        cell=fx.crop((n*64,0,n*64+64,64));areas.append(sum(p[3]>0 for p in pixels(cell)))
        coverage.append(sum(p[3]>0 for p in pixels(cell.crop((24,16,40,48))))/512)
    assert max(areas[3:7])>areas[0]*2,areas
    assert areas[-1]<max(areas)*0.5,areas
    assert max(coverage)<0.5,coverage
    effect=next(a for a in m['assets'] if a['id']=='tentakel_fx')
    assert effect['animations']['grow']=={'frames':list(range(12)),'frameRate':8,'repeat':0}
    border=by_id['BP_korruption_rahmen'];assert border.crop((16,16,32,32)).getbbox() is None
    icons=by_id['BP_korruption']
    turquoise=[pixels(icons.crop((i*16,0,i*16+16,16))).count((111,224,208,255)) for i in range(6)]
    assert turquoise==[0,1,1,0,0,0],turquoise
    salt=by_id['laeutersalz'];assert salt.resize((32,32),Image.Resampling.NEAREST).tobytes()==by_id['laeutersalz_32'].tobytes()
    assert (OUT/'items/laeutersalz.png').read_bytes()!=(OUT/'items/bannsalz.png').read_bytes()
    preview=Image.new('RGB',(768,740),(45,49,61));d=ImageDraw.Draw(preview)
    d.text((8,4),'BP / Kontrollverlust - finale Spielgrafiken',fill=(238,226,197))
    char=Image.open(OUT/'characters/A_player_drink.png').convert('RGBA').crop((0,0,16,32))
    gif=[]
    for n in range(12):
        tile=Image.new('RGBA',(64,64),(45,49,61,255));tile.alpha_composite(char,(24,16))
        tile.alpha_composite(fx.crop((n*64,0,n*64+64,64)))
        x=n%6*128;y=24+n//6*136
        preview.paste(tile.resize((128,128),Image.Resampling.NEAREST),(x,y));d.text((x+3,y+3),str(n),fill=(238,226,197))
        gif.append(tile.convert('RGB').resize((256,256),Image.Resampling.NEAREST))
    preview.paste(by_id['kontrollverlust'].resize((480,270),Image.Resampling.NEAREST),(0,308))
    for aid,x,y,scale in [('BP_korruption',0,610,4),('laeutersalz',416,610,4),('BP_korruption_rahmen',510,310,4),('BP_player_korruption',510,520,2)]:
        im=by_id[aid];im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST);preview.paste(im,(x,y),im)
    stretched=Image.new('RGBA',(384,48));sx=[0,16,32,48];dx=[0,16,368,384]
    for y in range(3):
        for x in range(3):
            tile=border.crop((sx[x],sx[y],sx[x+1],sx[y+1]))
            tile=tile.resize((dx[x+1]-dx[x],16),Image.Resampling.NEAREST)
            stretched.paste(tile,(dx[x],y*16))
    d.text((8,675),'9-slice: auf eine Inventarzeile gestreckt',fill=(238,226,197))
    preview.paste(stretched,(8,690),stretched)
    preview.save(DOC/'preview-kontrollverlust.png')
    gif[0].save(DOC/'preview-kontrollverlust-animation.gif',save_all=True,append_images=gif[1:],duration=125,loop=0,disposal=2)
    report=dict(batch='kontrollverlust',passed=True,assets=7,frames=frames,visibleColors=len(colors),
                effectPixelsPerFrame=areas,centralCharacterCoverage=coverage,
                checks=['complete paths and dimensions','indexed shared palette','binary alpha','opaque scene','nonempty frames','animation indices and distinct stages','growth/retraction','character region mostly clear','transparent nine-slice center','salt 2x nearest-neighbor','salt differs from placeholder','SHA-256'],results=results)
    (DOC/'batch-kontrollverlust-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))

if __name__=='__main__':
    main()
