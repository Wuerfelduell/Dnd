"""Pillow-only, independent CY contract validation and contact-sheet preview."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[3]
SPR=ROOT/'public/sprites'
ART=ROOT/'docs/art'
IDS=['vmn_'+x for x in ['tam_verrin','osric_dale','nell_quarrie','pegelherrin']+[f'rat_{i}' for i in range(1,8)]+['zollschreiber','fischerin','kantinenwirt','apothekerin','faehrmann','kielraum_wirtin','schlickmutter','uhrmechaniker','zollknecht','taucherin','zeuge_kettlegate','kurgast_briarholt']]
POSES={'tam_verrin':[4,3,2],'osric_dale':[4,4,3],'nell_quarrie':[4,4,2],'pegelherrin':[2,4,6],'zollschreiber':[4,2],'fischerin':[4],'faehrmann':[4],'taucherin':[4],'uhrmechaniker':[4]}
errors=[]
def require(ok,message):
    if not ok:errors.append(message)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def frames(im,a):
    w,h=a['frameWidth'],a['frameHeight']
    return [im.crop((c*w,r*h,(c+1)*w,(r+1)*h)) for r in range(a['rows']) for c in range(a['columns'])]

def main():
    m=json.loads((SPR/'manifest-varrowmouth3.json').read_text())
    gen=json.loads((ART/'batch-varrowmouth3-generation.json').read_text())
    expected={}
    for i,id in enumerate(IDS):
        expected[f'characters/{id}.png']=(64,128)
        expected[f'portraits/{id}.png']=(64,64)
        expected[f'portraits/{id}_emotions.png']=(256,128 if i<11 else 64)
        expected[f'portraits/heads/{id}.png']=(24,24)
    for id,counts in POSES.items():expected[f'characters/vmn_{id}_posen.png']=(16*sum(counts),32)
    expected.update({'battle/enemy_pegelherrin.png':(768,576),'battle/enemy_pegelherrin_register.png':(768,768),'fx/vm_namenslinien.png':(512,64)})
    require(len(m['assets'])==104,'Exactly 104 runtime PNGs required')
    require({a['file'] for a in m['assets']}==set(expected),'Exact required file set')
    require(len({a['file'] for a in m['assets']})==len(m['assets']),'Unique file entries')
    palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']}
    require(len(palette)<=32,'Shared palette has at most 32 visible colours')
    all_colors=set();stats=[];walk_heights={};loaded={}
    for a in m['assets']:
        file=a['file'];p=SPR/file
        if not p.exists():require(False,f'Missing {file}');continue
        raw=Image.open(p);im=raw.convert('RGBA');loaded[file]=im
        require(raw.mode=='P',f'{file}: indexed PNG')
        require(im.size==expected[file],f'{file}: required dimensions')
        require(im.size==(a['width'],a['height']),f'{file}: declared dimensions')
        require(im.size==(a['frameWidth']*a['columns'],a['frameHeight']*a['rows']),f'{file}: integral frame grid')
        require(digest(p)==a['sha256'],f'{file}: SHA256')
        pixels=list(im.getdata());alphas={c[3] for c in pixels}
        require(alphas=={0,255},f'{file}: binary alpha and transparent background')
        colors={c[:3] for c in pixels if c[3]};all_colors|=colors
        require(len(colors)<=32 and colors<=palette,f'{file}: shared palette membership')
        fs=frames(im,a);empty=a['emptyFrames']
        for j,f in enumerate(fs):
            bb=f.getchannel('A').getbbox()
            require((bb is None)==(j in empty),f'{file}/{j}: occupied/empty frame')
            if bb:
                require(bb[0]>0 and bb[1]>0 and bb[2]<f.width and bb[3]<f.height,f'{file}/{j}: transparent frame border')
        for name,anim in a['animations'].items():
            seq=anim['frames']
            require(seq and all(isinstance(j,int) and 0<=j<len(fs) and j not in empty for j in seq),f'{file}/{name}: valid animation frames')
            require(anim['frameRate']>0 and anim['repeat'] in [-1,0],f'{file}/{name}: tempo/repeat')
        if a['kind']=='walk':
            require(list(a['animations'])==['down','left','right','up'],f'{file}: direction order')
            for j,f in enumerate(fs):
                bb=f.getchannel('A').getbbox();require(bb[3]==31,f'{file}/{j}: foot pixel y30')
            walk_heights[a['gameId']]=max(f.getchannel('A').getbbox()[3]-f.getchannel('A').getbbox()[1] for f in fs)
            for row in range(4):
                rowfs=fs[row*4:row*4+4]
                require(len({f.tobytes() for f in rowfs})>=3,f'{file}/{row}: at least three distinct walking poses')
                require(len({f.crop((0,22,16,31)).tobytes() for f in rowfs})>=2,f'{file}/{row}: legs change')
        if a['kind']=='emotions':
            require(len({f.tobytes() for f in fs})==len(fs),f'{file}: distinct expressions')
            require(len({f.crop((12,12,52,48)).tobytes() for f in fs})==len(fs),f'{file}: distinct facial regions')
            require(a['frameNames']==['neutral','suspicious','shocked','smiling','angry','sad','thoughtful','determined'][:len(fs)],f'{file}: mood order')
            neutral=Image.open(SPR/f'portraits/{a["gameId"]}.png').convert('RGBA')
            require(neutral.tobytes()==fs[0].tobytes(),f'{file}: neutral portrait matches')
        if a['kind']=='poses':
            require([len(x['frames']) for x in a['animations'].values()]==POSES[a['gameId'][4:]],f'{file}: pose counts')
            for name,anim in a['animations'].items():
                require(len({fs[j].tobytes() for j in anim['frames']})>=2,f'{file}/{name}: distinct action frames')
            if a['gameId']=='vmn_pegelherrin':
                line=fs[6:12]
                require(len({f.getchannel('A').tobytes() for f in line})==1,'Waterline: unchanged silhouette')
                require(len({f.crop((0,0,16,14)).tobytes() for f in line})==1,'Waterline: unchanged face and upper body')
                require(len({f.tobytes() for f in line})==6,'Waterline: six different colour states')
        if a['kind']=='battle':
            require(list(a['animations'])==['idle','attack1','attack2','special','hurt','defeated'],f'{file}: battle row contract')
            for j,k in [(6,7),(12,13)]:require(fs[j].tobytes()==fs[k].tobytes(),f'{file}: held anticipation {j}/{k}')
            for name,anim in a['animations'].items():require(len({fs[j].tobytes() for j in anim['frames']})>=3,f'{file}/{name}: actual motion')
        stats.append({'file':file,'size':list(im.size),'visibleColors':len(colors),'occupiedFrames':len(fs)-len(empty),'sha256':digest(p)})
    require(len(all_colors)<=32,'Batch-wide palette <=32')
    require(walk_heights['vmn_nell_quarrie']<min(v for k,v in walk_heights.items() if k!='vmn_nell_quarrie'),'Nell shorter than all adults')
    for t in gen['assets']:
        require((ROOT/t['master']).exists() and digest(ROOT/t['master'])==t['masterSha256'],f'{t["id"]}/{t["kind"]}: master provenance')
        require(t['prompt'].startswith('STYLE GUIDE'),f'{t["id"]}: full style block in prompt')
    report={'batch':'varrowmouth3','status':'passed' if not errors else 'failed','pngCount':len(stats),'visibleColors':len(all_colors),
            'occupiedFrames':sum(x['occupiedFrames'] for x in stats),'checks':['exact required files','dimensions and frame grid','indexed shared palette','binary alpha','transparent frame borders','walk baselines and leg changes','Nell size','expressions and neutral matching','pose counts and variation','stationary waterline colour states','battle held anticipation','animation lists and tempo','SHA256 and normalized masters'],
            'limits':'Pixel differences do not prove semantic correctness; contact sheets were separately inspected. No runtime integration/playtest in this art-only package.',
            'errors':errors,'files':stats}
    (ART/'batch-varrowmouth3-validation.json').write_text(json.dumps(report,indent=2)+'\n')
    preview(loaded)
    print(json.dumps({k:report[k] for k in ['status','pngCount','visibleColors','occupiedFrames','errors']},indent=2))
    raise SystemExit(bool(errors))

def preview(images):
    out=Image.new('RGB',(1200,3350),'#303b49');d=ImageDraw.Draw(out)
    try:font=ImageFont.truetype('DejaVuSans.ttf',13)
    except OSError:font=ImageFont.load_default()
    def put(file,x,y,scale=1):
        im=images[file]
        if scale!=1:im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
        out.paste(im,(x,y),im)
    for i,id in enumerate(IDS):
        x=i%3*400;y=i//3*300
        d.text((x+8,y+8),id,font=font,fill='#eee2c5')
        put(f'characters/{id}.png',x+4,y+30,2)
        put(f'portraits/{id}.png',x+150,y+32,1.5)
        put(f'portraits/heads/{id}.png',x+280,y+50,2)
        put(f'portraits/{id}_emotions.png',x+140,y+150)
    for i,id in enumerate(POSES):
        x=i%2*600;y=2420+i//2*95
        d.text((x+8,y),id+' – Sonderposen',font=font,fill='#eee2c5')
        put(f'characters/vmn_{id}_posen.png',x+8,y+20,2)
    d.text((8,2905),'Pegelherrin: Phase 1 / Registerform',font=font,fill='#eee2c5')
    put('battle/enemy_pegelherrin.png',8,2930,.5)
    put('battle/enemy_pegelherrin_register.png',410,2930,.5)
    # Show the hit effect as 4x2 for the preview; runtime remains 8x1.
    fx=images['fx/vm_namenslinien.png']
    for j in range(8):
        f=fx.crop((j*64,0,(j+1)*64,64));out.paste(f,(820+j%4*80,2960+j//4*100),f)
    out.save(ART/'batch-varrowmouth3-preview.png')

if __name__=='__main__':main()
