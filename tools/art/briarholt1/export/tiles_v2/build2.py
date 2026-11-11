import sys, json, os, shutil, hashlib, importlib, numpy as np
sys.path.insert(0,'/workspace/ci/t2'); sys.path.insert(0,'/workspace/ci')
from tk import *
import desc, fx2
REPO='/workspace/Dnd'; SP=REPO+'/public/sprites'
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
MODS=[('bh_promenade','promenade'),('bh_kessel','kessel'),('bh_glas','glas'),('bh_stille','stille'),('bh_klinik','klinik'),('bh_wurzel','wurzel')]
GROUND={'bh_promenade':['pflaster_1','pflaster_2','pavillon_boden','kurhaus_wand','glasgang_boden'],
        'bh_kessel':['werkstatt_boden','kopfstein','kopfstein_2','werkstatt_boden_2','waescherei_wand','rohr_h','rohr_v'],
        'bh_glas':['kiesweg','kiesweg_2','erde','glaswand','glasdach','rinne_h','rinne_v'],
        'bh_stille':['fliesen','dielen','dielen_2','wand'],
        'bh_klinik':['pumpen_boden','pumpen_boden_adern','labor_fliesen','parkett','parkett_2','stollen_boden','gusswand','tapete','stollen_wand','fliesenwand'],
        'bh_wurzel':['boden','boden_2','boden_3','wand','wand_2']}
def glint(cell,k):
    c=cell.copy()
    cand=[(y,x) for y in range(16) for x in range(16) if c[y,x] in (G7,G6)]
    if len(cand)<4: cand=[(y,x) for y in range(16) for x in range(16) if c[y,x] in (S5,S4)]
    y,x=cand[(k*len(cand))//4 + 1]; c[y,x]=BONE
    if x+1<16 and c[y,x+1]!=OL: c[y,x+1]=G7
    return c
man=json.load(open(f'{SP}/manifest-briarholt1.json'))
gen=json.load(open(f'{REPO}/docs/art/batch-briarholt1-generation.json'))
by={a['file']:a for a in man['assets']}
tiles_meta={}
for t,mod in MODS:
    m=importlib.import_module(mod)
    names,kc=m.cells('kalt'); n2,wc=m.cells('warm'); assert names==n2 and len(names)==40
    anim_w=m.ANIMS_WARM; anim_k={}
    for an,spec in anim_w.items():
        fr=spec['frames']; base=kc[fr[0]]
        for j,i in enumerate(fr[1:],start=1):
            assert (kc[i]==base).all(), (t,an)
            kc[i]=glint(base,j)
        anim_k['reif_'+an]={'frames':fr,'frameRate':1,'repeat':-1}
    for v,cs in (('kalt',kc),('warm',wc)):
        rel=f'tilesets/{t}_{v}.png'; save(sheet(cs),f'{SP}/{rel}')
        a=by[rel]
        a['tileNames']=names
        a['cells']={nm:{'index':i,'x':i%8*16,'y':i//8*16,'width':16,'height':16} for i,nm in enumerate(names)}
        a['animations']=anim_w if v=='warm' else anim_k
        a['groundCells']=GROUND[t]
        a['drawing']='hand-pixelled cell by cell on the 16x16 grid (v2), shared palette'
        a['sha256']=sha(f'{SP}/{rel}')
    tiles_meta[t]={'names':names}
    # dump preview data
    np.save(f'/workspace/ci/t2/sheet_{t}_kalt.npy',sheet(kc)); np.save(f'/workspace/ci/t2/sheet_{t}_warm.npy',sheet(wc))
# fx + fog
fx2.save_fx(fx2.build(),f'{SP}/fx/bh_waerme.png'); by['fx/bh_waerme.png']['sha256']=sha(f'{SP}/fx/bh_waerme.png')
by['fx/bh_waerme.png']['drawing']='frames drawn by hand as pixel maps (v2)'
shutil.copy('/workspace/ci/t2/out_bh_karte_nebel.png',f'{SP}/ui/bh_karte_nebel.png'); by['ui/bh_karte_nebel.png']['sha256']=sha(f'{SP}/ui/bh_karte_nebel.png')
by['ui/bh_karte_nebel.png']['style']='flat cloud banks like ui/ds_karte_nebel.png, clearings over the six quarters and the Wurzelkammer'
json.dump(man,open(f'{SP}/manifest-briarholt1.json','w'),indent=2,ensure_ascii=False); open(f'{SP}/manifest-briarholt1.json','a').write('\n')
# raw generator images into the repo
RAWDIR=f'{REPO}/docs/art/briarholt1-raw'; os.makedirs(RAWDIR,exist_ok=True)
for f in sorted(os.listdir('/workspace/ci/raw')):
    if f.endswith('.jpg'): shutil.copy(f'/workspace/ci/raw/{f}',f'{RAWDIR}/{f}')
rawsha={sha(f'{RAWDIR}/{f}'):f'docs/art/briarholt1-raw/{f}' for f in os.listdir(RAWDIR)}
# generation log
jobs=[]
for j in gen['jobs']:
    tiles=[o for o in j['outputs'] if o.startswith('tilesets/')]
    if tiles:
        th=j['id'].replace('_warm','')
        rej={'superseded':'v1 AI sheet (whole tileset as one generated image, downsampled) - rejected: mushy, ground not seamless, cells wrongly assigned, warm partly recoloured',
             'prompt':j.get('prompt'),'rawSha256':j.get('rawSha256'),'rawFile':rawsha.get(j.get('rawSha256'))}
        prevs=[x for x in jobs if x['id']==th]
        if prevs: prevs[0]['rejectedAttempts'].append(rej); continue
        names=tiles_meta[th]['names']
        jobs.append({'id':th,'outputs':[f'tilesets/{th}_kalt.png',f'tilesets/{th}_warm.png'],'kind':'tiles','mode':'handpixel',
            'references':['tilesets/ds_stadt.png','tilesets/ds_innen.png','tilesets/C_06_bahnhof_tiles.png'],
            'tool':f'tools/art/briarholt1/export/tiles_v2/{dict(MODS)[th]}.py',
            'cellDescriptions':{nm:{'kalt':desc.D[th][nm][0],'warm':desc.D[th][nm][1]} for nm in names},
            'steps':['each 16x16 cell drawn individually on the palette index grid (ASCII pixel maps and seamless pattern routines), no generator downscale',
                     'ground cells built periodic in 16 px and checked in 3x3 tiling',
                     'props on terrain get the 1px #1a1c2c outline, terrain none',
                     'warm cells are second drawings (thaw, open blossoms, steam, light, plants behind glass, lived-in rooms, plump roots), not palette swaps',
                     'kalt animation slots: same cell with a moving frost glint (kalt animations reif_*), so no cell is duplicated',
                     'every cell checked at 6x-8x zoom'],
            'rejectedAttempts':[rej]})
        continue
    if j['id']=='bh_waerme':
        j={'id':'bh_waerme','outputs':['fx/bh_waerme.png'],'kind':'effect','mode':'handpixel','references':['fx/ds_nachhall_weg.png'],'tool':'tools/art/briarholt1/export/tiles_v2/fx2.py',
           'cellDescriptions':{'dampf_rohr':'pipe stub, puff leaves the mouth, grows, splits, dissolves (4f)',
                               'kondensat_schrift':'fogged patch; two lines of cursive-like strokes (no letters) are wiped in stroke by stroke, last frame drips run and one turquoise glint (6f)',
                               'reif_uebergang':'frost ferns grow in from two corners until the cell is rimed (4f)',
                               'ruecklauf_puls':'faint violet glow travels through a pipe (overlay, 4f)',
                               'kondensat_sperre':'32x32 water wall: spray bar with nozzles, sheets of condensate falling, highlights run down, splash pool (4f)',
                               'leitung_*':'pipe-plan overlay lines h/v/corner/tee in warm amber, kalt slate, belastet violet'},
           'rejectedAttempts':[{'superseded':'v1 procedural fx (noise/threshold driven), rejected by the user'}]}
    if j['id']=='bh_karte_nebel':
        j={'id':'bh_karte_nebel','outputs':['ui/bh_karte_nebel.png'],'kind':'overlay','mode':'procedural','references':['ui/ds_karte_nebel.png'],'tool':'tools/art/briarholt1/export/tiles_v2/fog2.py',
           'steps':['solid cloud banks (binary alpha) like ds_karte_nebel: three fog tones plus bone/beige light streaks stretched horizontally, 1px checker only between bands',
                    'clearings = lumpy blobs around the pins of the six quarters and the Wurzelkammer, 2-3 px checker fringe at the clearing edge, darker rim',
                    'coverage ~42 % (ds: 39 %)'],
           'rejectedAttempts':[{'superseded':'v1 ordered-dither noise with elliptic holes, rejected by the user'}]}
    if j.get('rawSha256') and rawsha.get(j['rawSha256']): j['rawFile']=rawsha[j['rawSha256']]
    for r in j.get('rejectedAttempts',[]):
        if r.get('rawSha256') and rawsha.get(r['rawSha256']): r['rawFile']=rawsha[r['rawSha256']]
    jobs.append(j)
for j in jobs: j['outputSha256']={o:sha(f'{SP}/{o}') for o in j['outputs']}
gen['jobs']=jobs
gen['rawImages']='docs/art/briarholt1-raw/ (all generator outputs of this batch, incl. rejected ones and the superseded v1 tileset sheets)'
gen['postprocessing']=gen['postprocessing']+'; tilesets v2, fx v2: hand-pixelled on the palette grid, no downscale'
json.dump(gen,open(f'{REPO}/docs/art/batch-briarholt1-generation.json','w'),indent=2,ensure_ascii=False); open(f'{REPO}/docs/art/batch-briarholt1-generation.json','a').write('\n')
print('ok',len(jobs),'jobs')
