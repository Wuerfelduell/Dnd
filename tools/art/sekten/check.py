"""Validate the complete BR contract using Pillow; run from any directory."""
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
SPRITES=ROOT/'public/sprites'

def check():
    manifest=json.loads((SPRITES/'manifest-sekten.json').read_text())
    assets=manifest['assets']; errors=[]; checked_frames=0
    def require(ok,msg):
        if not ok: errors.append(msg)
    expected={}
    for cult in ['asche','flut','chor']:
        for rank,size in [('novize',48),('sprecher',64),('hand',64),('haupt',96)]:
            key=f'sk_{cult}_{rank}'
            expected[f'characters/{key}.png']=(64,128)
            expected[f'battle/enemy_{key}.png']=(size*6,size*(5 if rank=='haupt' else 4))
            expected[f'bestiary/enemy_{key}.png']=(96,128)
        expected[f'characters/sk_{cult}_haupt_aura.png']=(128,48)
        expected[f'props/sk_schrein_{cult}.png']=(64,64)
    for cult,people in [('asche',[('sprecher','ida'),('aussteiger','tobin'),('opfer','wenz')]),('flut',[('sprecher','maren'),('aussteiger','pell'),('opfer','lotte')]),('chor',[('sprecher','ansgar'),('aussteiger','rike'),('opfer','jost')])]:
        for role,name in people:
            key=f'sk_{cult}_{role}_{name}'
            expected[f'characters/{key}_walk.png']=(64,128)
            expected[f'portraits/{key}_emotions.png']=(256,64)
            expected[f'portraits/heads/{key}.png']=(24,24)
    for name in ['aschensiegel','glutkohle','flutknoten','bojenoel','chorkreide','stimmwachs','laeuterwasser','seilschnitt','stimmwachs_rein','art_aschenring','art_flutkompass','art_chorstimmgabel']:
        expected[f'items/ski_{name}.png']=(16,16)
        expected[f'items/32/ski_{name}.png']=(32,32)
    expected.update({'props/sk_zeichen.png':(64,48),'props/sk_sabotage.png':(64,32),'fx/sk_ereignis.png':(192,96),'ui/sk_umtriebe.png':(80,48),'ui/sk_karte_pins.png':(36,24)})
    require(set(expected)=={a['file'] for a in assets},'Manifest differs from mandatory 98-file contract')
    require(len({a['id'] for a in assets})==len(assets),'Duplicate asset IDs')
    allowed={tuple(bytes.fromhex(c.lstrip('#'))) for c in manifest['palette']}
    for a in assets:
        path=SPRITES/a['file']
        if not path.exists(): errors.append(f'Missing {path}');continue
        raw=Image.open(path);im=raw.convert('RGBA'); data=list(im.getdata())
        prefix=a['file']+': '
        require(raw.mode=='P',prefix+'not indexed PNG')
        require(im.size==expected.get(a['file']),prefix+'wrong contract dimensions')
        require(im.size==(a['width'],a['height']),prefix+'wrong manifest dimensions')
        require(set(p[3] for p in data)<={0,255},prefix+'nonbinary alpha')
        colors={p[:3] for p in data if p[3]}
        require(0<len(colors)<=32,prefix+'empty image or too many colors')
        require(colors<=allowed,prefix+'outside common palette')
        fw,fh=a['frameWidth'],a['frameHeight'];cols,rows=a['columns'],a['rows']
        require((fw*cols,fh*rows)==im.size,prefix+'invalid integer cell grid')
        def check_regions(regions):
            for name,value in regions.items():
                if isinstance(value,dict): check_regions(value)
                else:
                    require(len(value)==4 and all(isinstance(v,int) for v in value),prefix+'noninteger region '+name)
                    x,y,w,h=value
                    require(x>=0 and y>=0 and w>0 and h>0 and x+w<=im.width and y+h<=im.height,prefix+'region outside sheet '+name)
        check_regions(a.get('regions',{}))
        if a['kind']=='shrine':
            require(im.crop((48,0,64,48)).getchannel('A').getbbox() is None,prefix+'unused shrine region not transparent')
        def frame(i): return im.crop((i%cols*fw,i//cols*fh,(i%cols+1)*fw,(i//cols+1)*fh))
        for animation in a.get('animations',{}).values():
            require(animation['frameRate']>0,prefix+'invalid speed')
            for i in animation['frames']:
                require(isinstance(i,int) and 0<=i<cols*rows,prefix+'frame outside sheet')
                require(frame(i).getchannel('A').getbbox() is not None,prefix+f'empty animation frame {i}')
                checked_frames+=1
        for i in a.get('emptyFrames',[]):
            require(frame(i).getchannel('A').getbbox() is None,prefix+f'nonempty padding {i}')
        for left,right in a.get('identicalFrames',[]):
            require(frame(left).tobytes()==frame(right).tobytes(),prefix+'anticipation frames differ')
        if a['kind'] in ['walk','portrait','events','aura']:
            for name,animation in a['animations'].items():
                if len(animation['frames'])>1:
                    require(len({frame(i).tobytes() for i in animation['frames']})>1,prefix+f'static {name}')
        if a['kind']=='portrait':
            require(len({frame(i).tobytes() for i in range(4)})==4,prefix+'duplicate expression')
        if a['kind']=='item' and a['width']==32:
            small=Image.open(SPRITES/a['derivedFrom']).convert('RGBA')
            require(im.tobytes()==small.resize((32,32),Image.Resampling.NEAREST).tobytes(),prefix+'32px variant is not exact nearest-neighbor 2x')
    report={'batch':'sekten','assets':len(assets),'animationFrameReferences':checked_frames,'errors':errors,'passed':not errors}
    (ROOT/'docs/art/batch-sekten-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    raise SystemExit(bool(errors))

if __name__=='__main__':check()
