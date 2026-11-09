"""Validate the AV delivery against the requested dimensions and manifest contracts."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT/'public/sprites'
ART = ROOT/'docs/art'
manifest = json.loads((SPRITES/'manifest-dunscar1.json').read_text())
config = json.loads((ART/'batch-dunscar1-generation.json').read_text())
expected = {j['id']: j for j in config['jobs']}
assert len(expected) == 32
assert len(manifest['assets']) == len(expected)
assert {a['id'] for a in manifest['assets']} == set(expected)
palette = {tuple(bytes.fromhex(c[1:])) for c in config['palette']}
all_colors = set()
results = []
for a in manifest['assets']:
    p = SPRITES/a['file']
    j = expected[a['id']]
    assert a['file'] == j['path']
    im = Image.open(p)
    assert im.format == 'PNG' and im.mode == 'P', a['id']
    assert list(im.size) == j['size'] == [a['width'],a['height']]
    assert im.width == a['frameWidth']*a['columns']
    assert im.height == a['frameHeight']*a['rows']
    rgba = im.convert('RGBA')
    colors = {c[:3] for c in rgba.getdata() if c[3]}
    alpha = set(rgba.getchannel('A').getdata())
    assert colors and colors <= palette and len(colors) <= 32, a['id']
    assert alpha <= {0,255} and 255 in alpha
    if not a['transparent']:
        assert alpha == {255}
    else:
        assert 0 in alpha
    all_colors.update(colors)
    n = a['columns']*a['rows']
    for name, anim in a['animations'].items():
        assert anim['frames'] and anim['frameRate']>0
        assert all(isinstance(f,int) and 0<=f<n for f in anim['frames'])
        if len(anim['frames'])>1:
            frames = []
            for f in anim['frames']:
                x,y = f%a['columns']*a['frameWidth'], f//a['columns']*a['frameHeight']
                frames.append(rgba.crop((x,y,x+a['frameWidth'],y+a['frameHeight'])).tobytes())
            assert len(set(frames))>1, (a['id'],name,'static animation')
    for name,r in a.get('regions',{}).items():
        x,y,w,h = (r[k] for k in ('x','y','width','height'))
        assert min(x,y)>=0 and w>0 and h>0 and x+w<=im.width and y+h<=im.height
        cell = rgba.crop((x,y,x+w,y+h))
        assert cell.getchannel('A').getbbox(), (a['id'],name)
        if a['kind'] in ('props','markers','train'):
            assert not cell.crop((0,0,w,1)).getchannel('A').getbbox()
            assert not cell.crop((0,h-1,w,h)).getchannel('A').getbbox()
            assert not cell.crop((0,0,1,h)).getchannel('A').getbbox()
            assert not cell.crop((w-1,0,w,h)).getchannel('A').getbbox()
    for anim in a.get('regionAnimations',{}).values():
        assert all(f in a['regions'] for f in anim['frames'])
    if a['kind']=='tiles':
        assert a['frameWidth']==a['frameHeight']==16 and a['columns']==8
        assert len(a['tileNames'])==n and len(a['cells'])==n
    if a['kind']=='background':
        assert im.size==(480,270)
        assert a['groundStrip']=={'x':0,'y':200,'width':480,'height':70}
    assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
    results.append({'id':a['id'],'size':list(im.size),'visibleColors':len(colors),'binaryAlpha':True,'sha256':a['sha256']})
path_im = Image.open(SPRITES/'fx/ds_nachhall_weg.png').convert('RGBA')
for phase in range(4):
    straight = path_im.crop((phase*16,0,phase*16+16,16))
    corner = path_im.crop((phase*16,16,phase*16+16,32))
    assert straight.getpixel((0,8))[3] and straight.getpixel((15,8))[3]
    assert corner.getpixel((0,8))[3] and corner.getpixel((8,15))[3]
assert len(all_colors)<=32
markers = next(a for a in manifest['assets'] if a['id']=='ds_marker')
map_ids = set('ds_endbahnhof ds_schwellenring ds_arbeiterbogen ds_kalkmarkt ds_bruchstufen ds_signalhang ds_speisewagen ds_runddepot ds_pruefhaus ds_teesaal ds_lohnbuero ds_nachtzug_wagen ds_nachtzug_lok ds_rangierwueste ds_klopfbruch ds_rufschlucht ds_letzter_bahnsteig ds_unterschicht'.split())
assert set(markers['regions'])==map_ids
train = next(a for a in manifest['assets'] if a['id']=='ds_nachtzug')
assert len(train['regions'])==20
assert train['regions']['lok_0']['width']==64
assert train['regions']['wagen_3_stillgelegt']['width']==48
assert next(a for a in manifest['assets'] if a['id']=='ds_bahn')['composites']['turntable']['width']==64

def preview(name, assets, cols, cellw, cellh, zoom=1):
    rows = (len(assets)+cols-1)//cols
    canvas=Image.new('RGB',(cols*cellw,rows*cellh),(44,48,57))
    draw=ImageDraw.Draw(canvas)
    for n,a in enumerate(assets):
        im=Image.open(SPRITES/a['file']).convert('RGBA')
        im=im.resize((im.width*zoom,im.height*zoom),Image.Resampling.NEAREST)
        x,y=n%cols*cellw,n//cols*cellh
        canvas.paste(im,(x,y+22),im)
        draw.text((x+4,y+4),a['id'],fill=(238,226,197))
    canvas.save(ART/name)

assets=manifest['assets']
preview('preview-dunscar1-tiles.png',[a for a in assets if a['kind']=='tiles'],2,390,310,3)
preview('preview-dunscar1-props.png',[a for a in assets if a['kind']=='props'],2,520,410,2)
preview('preview-dunscar1-backgrounds.png',[a for a in assets if a['kind']=='background'],2,480,296)
preview('preview-dunscar1-maps-scenes.png',[a for a in assets if a['kind'] in ('map','overlay','still')],2,480,296)
preview('preview-dunscar1-train-effects.png',[a for a in assets if a['kind'] in ('train','effect','markers')],1,800,350,2)
report={'batch':'dunscar1','passed':True,'assetCount':len(results),'sharedVisibleColors':len(all_colors),'mapMarkers':len(map_ids),'checks':['PNG indexed','exact dimensions','shared palette','binary alpha','bounded occupied regions','empty cell margins','animation indices and motion','18 fixed map IDs','train region widths and retired set','turntable 4x4','SHA-256'],'assets':results}
(ART/'validation-dunscar1.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'PASS: {len(results)} PNGs, {len(all_colors)} shared visible colors, 18 map markers')
