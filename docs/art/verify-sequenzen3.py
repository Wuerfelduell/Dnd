"""Independent delivery checks for AG. Usage: python docs/art/verify-sequenzen3.py"""
from pathlib import Path
import json,re,hashlib
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/sprites'; DOC=ROOT/'docs/art'
manifest=json.loads((OUT/'manifest-sequenzen3.json').read_text())
assets={a['file']:a for a in manifest['assets']}
expected={}; coverage={}; checks=[]; visible=set(); hashes={}
def check(ok, label):
    checks.append(dict(check=label,ok=bool(ok)))
def expect(id,path,size,frame=None,count=1):
    expected[path]=dict(id=id,size=size,frame=frame or size,count=count)
    coverage.setdefault(id,[]).append('public/sprites/'+path)
for line in (ROOT/'docs/story/sequenzen/grafikwuensche.md').read_text().splitlines():
    if not line.startswith('| ') or line.startswith('| ID'): continue
    id,kind,*_= [s.strip() for s in line.strip('|').split('|')]
    if kind.startswith(('Kampf','Aura')):
        count=int(re.search(r'(\d+) Frames',kind)[1]);fw,fh=(48,64) if kind.startswith('Aura') else (48,48)
        expect(id,'fx/'+('sq_' if kind.startswith('Kampf') else '')+id+'.png',(fw*count,fh),(fw,fh),count)
    elif kind.startswith('Pfad'):
        for n in (16,32,64):expect(id,f'pathways/emblem_{id}_{n}.png',(n,n))
    else:
        for n in (16,32):expect(id,'items/'+('32/' if n==32 else '')+id+'.png',(n,n))
for p in ('waage','moor','uhr'):
    for kind in ('card','ritual'):expect(kind+'_sq_'+p,f'pathways/{kind}_sq_{p}.png',(96,128))
expect('battle_player_skills2','battle/battle_player_skills2.png',(288,144),(48,48),18)
check(len(coverage)==129,'122 wishlist IDs plus six scene cards and player sheet')
check(len(expected)==196,'196 required PNG outputs')
check(set(expected)==set(assets),'exact manifest path coverage')
for path,e in expected.items():
    f=OUT/path;check(f.exists(),path+': exists')
    if not f.exists():continue
    im=Image.open(f);rgba=im.convert('RGBA');a=assets.get(path,{})
    check(im.size==e['size'],path+': dimensions')
    check(im.mode=='P',path+': indexed PNG')
    check(set(rgba.getchannel('A').getdata())<={0,255},path+': binary alpha')
    colors={rgb for rgb in rgba.getdata() if rgb[3]};visible.update(colors)
    check(len(colors)<=32,path+': palette limit')
    fw,fh=e['frame'];cols=im.width//fw
    check((a.get('frameWidth'),a.get('frameHeight'))==(fw,fh),path+': frame geometry')
    check(a.get('width')==im.width and a.get('height')==im.height,path+': manifest dimensions')
    check(a.get('columns')==cols and a.get('rows')==im.height//fh,path+': manifest grid')
    if path.startswith('fx/sq_aura_'):
        check(rgba.crop((0,0,im.width,38)).getbbox() is None,path+': upper body area clear')
    frames=[]
    for n in range(e['count']):
        cell=rgba.crop(((n%cols)*fw,(n//cols)*fh,(n%cols+1)*fw,(n//cols+1)*fh))
        bb=cell.getbbox();check(bb is not None,path+f': frame {n} has artwork')
        frames.append(hashlib.sha256(cell.tobytes()).hexdigest())
        if path.startswith('battle/') and bb:
            check(bb[3]==45,path+f': frame {n} baseline 45')
    if e['count']>1:
        refs=[n for an in a.get('animations',{}).values() for n in an['frames']]
        check(sorted(refs)==list(range(e['count'])),path+': complete animation references')
        check(len(set(frames))>=min(e['count'],4),path+': distinct animation phases')
        rate=10 if path.startswith('battle/') else 8 if path.startswith('fx/sq_aura_') else 12
        check(all(an['frameRate']==rate for an in a.get('animations',{}).values()),path+': requested animation speed')
    if path.startswith('items/'):
        digest=hashlib.sha256(rgba.tobytes()).hexdigest()
        check(digest not in hashes,path+': unique icon')
        hashes[digest]=path
check(len(visible)<=32,'shared palette across entire delivery')
report=dict(batch='sequenzen3',files=len(expected),wishlistIds=122,passed=sum(c['ok'] for c in checks),failed=[c['check'] for c in checks if not c['ok']],checks=checks)
(DOC/'validation-sequenzen3.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(DOC/'coverage-sequenzen3.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n')

# Human-review contact sheets, artwork shown at integer nearest-neighbor scale.
groups={'effects':[p for p in expected if p.startswith('fx/')],
        'items':[p for p in expected if p.startswith('items/32/')],
        'pathways':[p for p in expected if p.startswith('pathways/') or p.startswith('battle/')]}
for group,paths in groups.items():
    for page,start in enumerate(range(0,len(paths),20),1):
        subset=paths[start:start+20]
        columns=4 if group=='items' else 3 if group=='pathways' else 1
        width=240 if group=='items' else 320 if group=='pathways' else 900
        height=145 if group=='items' else 310 if group=='pathways' else 150
        preview=Image.new('RGB',(width*columns,height*((len(subset)+columns-1)//columns)),(45,49,61));draw=ImageDraw.Draw(preview)
        for i,path in enumerate(subset):
            x=(i%columns)*width;y=(i//columns)*height
            draw.text((x+4,y+2),Path(path).name,fill=(238,226,197))
            if not (OUT/path).exists():continue
            im=Image.open(OUT/path).convert('RGBA')
            scale=3 if group=='items' else 1 if path.startswith('battle/') else 2
            im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST)
            preview.paste(im,(x+4,y+20),im)
        preview.save(DOC/f'preview-sequenzen3-{group}-{page}.png')
print(json.dumps({k:report[k] for k in ('files','wishlistIds','passed','failed')},ensure_ascii=False))
raise SystemExit(1 if report['failed'] else 0)
