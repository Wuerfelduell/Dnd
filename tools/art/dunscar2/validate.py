"""Validate the complete AW delivery; generate review contact sheets."""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/sprites'
DOC=ROOT/'docs/art'
FIGURES=['pfiff','gallowmere','willa','oren','mabel','pelham','nellie','huxford','esther','adaine','weichenstellerin']

def main():
    manifest=json.loads((OUT/'manifest-dunscar2.json').read_text())
    expected={}
    for f in FIGURES:
        expected.update({f'characters/k3_{f}_walk.png':(64,128),
            f'characters/k3_{f}_extra.png':(64,32),
            f'portraits/k3_{f}_emotions.png':(256,64),
            f'portraits/AK_k3_{f}_emotions2.png':(256,64),
            f'ui/heads/k3_{f}.png':(24,24)})
    expected['characters/k3_gallowmere_schalter.png']=(64,32)
    for family,count in [('schichtgaenger',4),('einwohner',6)]:
        expected.update({f'characters/ds_{family}_{i}.png':(64,128) for i in range(1,count+1)})
    expected.update({f'ui/scenes/ds_szene_{name}.png':(480,270) for name in ['walze','lohnliste','feierabend']})
    assets=manifest['assets']
    assert len(assets)==69
    assert len({a['id'] for a in assets})==69
    assert {a['file'] for a in assets}==set(expected)
    colors=set(); frame_count=0; results=[]
    for a in assets:
        p=OUT/a['file']; raw=Image.open(p); im=raw.convert('RGBA')
        assert raw.mode=='P',p
        assert im.size==expected[a['file']]==(a['width'],a['height']),p
        assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'],p
        alphas=set(im.getchannel('A').getdata())
        assert alphas<={0,255},p
        assert (alphas=={255}) if not a['transparent'] else (0 in alphas and 255 in alphas),p
        colors.update(pixel[:3] for pixel in im.getdata() if pixel[3])
        fw,fh,c,r=(a[k] for k in ['frameWidth','frameHeight','columns','rows'])
        assert im.size==(fw*c,fh*r),p
        signatures=[]
        for y in range(r):
            for x in range(c):
                cell=im.crop((x*fw,y*fh,(x+1)*fw,(y+1)*fh))
                bbox=cell.getbbox(); assert bbox,p
                if a['transparent']:
                    assert bbox[0]>=1 and bbox[2]<=fw-1 and bbox[1]>=1 and bbox[3]<=fh-1,(p,bbox)
                    if 'baseline' in a:
                        assert bbox[3]==a['baseline'],(p,bbox,'baseline')
                signatures.append(hashlib.sha256(cell.tobytes()).hexdigest())
                frame_count+=1
        for name,clip in a.get('animations',{}).items():
            assert clip['frames'] and all(0<=i<c*r for i in clip['frames']),(p,name)
            if len(clip['frames'])>1:
                assert len({signatures[i] for i in clip['frames']})>=3,(p,name,'insufficient distinct animation poses')
        if a['file'].startswith('portraits/'):
            assert len(set(signatures))==4,(p,'duplicate expressions')
        results.append(dict(file=a['file'],size=list(im.size),frames=c*r,passed=True))
    assert len(colors)<=31,len(colors)
    preview=Image.new('RGB',(850,11*150),(40,44,54)); d=ImageDraw.Draw(preview)
    for i,f in enumerate(FIGURES):
        y=i*150;d.text((8,y+5),f,fill=(222,216,200))
        for file,pos in [(f'characters/k3_{f}_walk.png',(8,y+20)),(f'characters/k3_{f}_extra.png',(82,y+92)),(f'portraits/k3_{f}_emotions.png',(160,y+22)),(f'portraits/AK_k3_{f}_emotions2.png',(430,y+22)),(f'ui/heads/k3_{f}.png',(720,y+30))]:
            im=Image.open(OUT/file).convert('RGBA');preview.paste(im,pos,im)
    preview.resize((1700,3300),Image.Resampling.NEAREST).save(DOC/'preview-dunscar2-figuren.png')
    crowd=Image.new('RGB',(820,180),(40,44,54));d=ImageDraw.Draw(crowd)
    for i,(family,n) in enumerate([(f,n) for f,c in [('schichtgaenger',4),('einwohner',6)] for n in range(1,c+1)]):
        d.text((i*82+3,5),f'{family[:3]} {n}',fill=(222,216,200))
        im=Image.open(OUT/f'characters/ds_{family}_{n}.png').convert('RGBA');crowd.paste(im,(i*82+3,25),im)
    crowd.resize((1640,360),Image.Resampling.NEAREST).save(DOC/'preview-dunscar2-einwohner.png')
    scenes=Image.new('RGB',(480,810))
    for i,n in enumerate(['walze','lohnliste','feierabend']):
        scenes.paste(Image.open(OUT/f'ui/scenes/ds_szene_{n}.png').convert('RGB'),(0,i*270))
    scenes.save(DOC/'preview-dunscar2-szenen.png')
    report=dict(batch='dunscar2',passed=True,assets=len(assets),frames=frame_count,visibleColors=len(colors),checks=['complete AW path inventory','indexed PNG','target dimensions','shared palette','binary alpha','opaque scenes','cell padding','distinct walk/activity frames','distinct portrait frames','animation indices','SHA-256'],results=results)
    (DOC/'batch-dunscar2-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))

if __name__=='__main__':
    main()
