"""Pillow-only validation of the complete BE delivery, independent of source images."""
from pathlib import Path
from collections import Counter
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / 'public/sprites'
manifest = json.loads((SPRITES / 'manifest-dunscar5.json').read_text())
people = ['k3h_troedlerin','k3h_steinmetz','k3h_lampenwart','zirkel_schichtbund',
          'tm_ds_lampe','tm_ds_kerbholz','tm_ds_stimme','ez_ds_rangierer','ez_ds_kalkbrennerin',
          'ez_ds_streckenlaeufer','ez_ds_walzenstimme','ez_ds_schrankenkind',
          'k3e_schichtwitwe','k3e_kalkjunge','k3e_wagenputzer','k3e_zeitungsfrau',
          'k3e_bahnbettler','k3e_steinmetzgeselle','k3e_teesaalgast','k3e_signalkind',
          'k3e_aufseher_a','k3e_aufseher_b']
enemies = ['k3k_kupferdieb','k3k_schienenlaeufer','k3k_lohnfaelscher',
           'k3k_staubschmuggler','k3k_walzenhehler','k3k_signalbrecher']
expected = {}
for id in people:
    expected[f'characters/{id}_walk.png']=(64,128)
for id in people[:12]:
    expected[f'portraits/{id}_emotions.png']=(256,64)
    expected[f'portraits/AK_{id}_emotions2.png']=(256,64)
for id in ['k3e_wagenputzer','k3e_steinmetzgeselle']:
    expected[f'characters/{id}_schicht.png']=(64,128)
for id in people[7:12]+enemies:
    size=64 if id=='k3k_signalbrecher' else 48
    expected[f'battle/enemy_{id}.png']=(size*6,size*5)
    expected[f'characters/F_ow_{id}.png']=(64,128)
    expected[f'ui/bestiary/F_{id}.png']=(96,128)
for id in enemies:
    expected[f'ui/BE_steckbrief_{id}.png']=(48,64)
    expected[f'items/{id}_trophaee.png']=(16,16)
expected.update({'portraits/BE_koepfe.png':(192,72),
                 'props/BE_troedelstand.png':(32,32),'props/BE_steinmetzwerkbank.png':(48,32),
                 'props/BE_schaltbuden_theke.png':(32,32),'props/BE_schichtbund.png':(256,128),
                 'props/BE_lichtkegel.png':(64,64),'battle/enemy_k3k_staubschmuggler_elite.png':(288,240)})
assets=manifest['assets']
assert len(expected)==len(assets)==100
assert {a['file'] for a in assets}==set(expected)
assert len({a['id'] for a in assets})==100
assert manifest['status']=='exported; runtime integration pending'
palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
assert len(palette)<=32
union=set();records=[];occupied=0
for a in assets:
    path=SPRITES/a['file']
    original=Image.open(path)
    assert original.mode=='P',(path,'indexed mode')
    im=original.convert('RGBA')
    assert im.size==expected[a['file']]==(a['width'],a['height'])
    pixels=list(im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata())
    assert {p[3] for p in pixels}=={0,255},(path,'binary alpha')
    colors={p[:3] for p in pixels if p[3]}
    assert colors<=palette,(path,'palette')
    union|=colors
    fw,fh,cols,rows=(a[k] for k in ['frameWidth','frameHeight','columns','rows'])
    assert im.size==(fw*cols,fh*rows)
    frames=[im.crop((c*fw,r*fh,(c+1)*fw,(r+1)*fh)) for r in range(rows) for c in range(cols)]
    counts=a.get('occupiedCounts',[cols]*rows)
    for n,f in enumerate(frames):
        box=f.getbbox()
        if n%cols>=counts[n//cols]:
            assert box is None,(path,n,'padding')
            continue
        assert box,(path,n,'empty required frame')
        occupied+=1
        assert box[0]>=1 and box[1]>=1 and box[2]<fw and box[3]<fh,(path,n,'cell margin')
        if 'baseline' in a:
            assert box[3]-1==a['baseline'],(path,n,'baseline',box)
    for name,anim in a.get('animations',{}).items():
        assert anim['frameRate']>0
        assert all(0<=n<len(frames) and frames[n].getbbox() for n in anim['frames']),(path,name)
    if a['kind'] in ['walk','overworld']:
        assert list(a['animations'])==['down','left','right','up']
        for row in range(4):
            assert len({f.tobytes() for f in frames[row*4:row*4+4]})>=3,(path,row,'walk variety')
    if a['kind']=='portraits':
        assert len({f.tobytes() for f in frames})==4,(path,'expressions')
    if a['kind']=='battle':
        assert a['facing']=='left'
        assert a['occupiedCounts']==[4,6,6,3,4]
        for pair in a['windupFrames'].values():
            assert len(pair)==2 and frames[pair[0]].tobytes()==frames[pair[1]].tobytes(),(path,'held windup')
        for name in ['attack','special']:
            assert len({frames[n].tobytes() for n in a['animations'][name]['frames']})>=4,(path,name,'pose variety')
    if 'regions' in a:
        for name,r in a['regions'].items():
            assert 0<=r['x']<im.width and 0<=r['y']<im.height
            assert r['x']+r['width']<=im.width and r['y']+r['height']<=im.height
            assert im.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])).getbbox(),(path,name)
    records.append(dict(file=a['file'],size=list(im.size),visibleColors=len(colors),sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
assert len(union)<=32
byfile={a['file']:a for a in assets}
assert set(byfile['portraits/BE_koepfe.png']['regions'])==set(people)
assert byfile['battle/enemy_k3k_signalbrecher.png']['phases']=={'pfiff':'attack','schichtgaenger_ruf':'special'}
for id in people[10:12]:assert byfile[f'battle/enemy_{id}.png']['nonlethalDefeat']
assert (SPRITES/'battle/enemy_k3k_staubschmuggler.png').read_bytes()!=(SPRITES/'battle/enemy_k3k_staubschmuggler_elite.png').read_bytes()
generation=json.loads((ROOT/'docs/art/batch-dunscar5-generation.json').read_text())
assert len(generation['sources'])==76
assert all(s['prompt'] and len(s['sourceSha256'])==64 for s in generation['sources'])
report=dict(batch='dunscar5',result='pass',assets=len(assets),occupiedFrames=occupied,visibleColors=len(union),
            byKind=dict(Counter(a['kind'] for a in assets)),checks=['independent required file inventory',
            'exact dimensions','indexed PNG','shared palette','binary alpha','cell margins','occupied cells and empty padding',
            'baselines','animation ranges','walk and expression variety','two identical windup frames',
            'both signal breaker phases','child nonlethal metadata','atlas regions','source provenance'],files=records)
(ROOT/'docs/art/validation-dunscar5.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='files'},indent=2))
