from lib import *
import json, os, shutil, hashlib
REPO='/workspace/Dnd'; SP=REPO+'/public/sprites'
STYLE=open('style.txt').read(); SPEC=json.load(open('prompts_specific.json'))
tm=json.load(open('out/tiles_meta.json')); pm=json.load(open('out/props_meta.json')); fm=json.load(open('out/fx_meta.json')); im=json.load(open('out/images_meta.json'))
def cp(src,rel):
    dst=f'{SP}/{rel}'; os.makedirs(os.path.dirname(dst),exist_ok=True)
    assert not os.path.exists(dst), f'would overwrite {rel}'
    shutil.copy(src,dst); return sha(dst)
assets=[]; jobs=[]
def rawsha(n): return sha(f'raw/{n}.jpg')
REFS={'tiles':['tilesets/C_06_bahnhof_tiles.png','tilesets/ds_stadt.png'],'tiles_in':['tilesets/C_06_bahnhof_tiles.png','tilesets/ds_innen.png'],
      'props':['props/ds_endbahnhof.png'],'props_in':['props/ds_speisewagen.png'],'battle':['battle/bg_ds_endbahnhof.png'],
      'scene':['ui/scenes/ds_nachtzug.png'],'map':['ui/ds_karte.png'],'marker':['ui/ds_marker.png'],'card':['ui/scenes/kapitel3_karte.png']}
TREF={'bh_promenade':'tiles','bh_kessel':'tiles','bh_glas':'tiles','bh_stille':'tiles_in','bh_klinik':'tiles_in','bh_wurzel':'tiles'}
# --- tilesets
for n,m in tm.items():
    ids={v:f'{n}_{v}' for v in ('kalt','warm')}
    for v in ('kalt','warm'):
        rel=f'tilesets/{n}_{v}.png'; h=cp(f'out/tilesets/{n}_{v}.png',rel)
        cells={nm:{'index':i,'x':i%8*16,'y':i//8*16,'width':16,'height':16} for i,nm in enumerate(m['names'])}
        a={'id':ids[v],'kind':'tiles','theme':n,'variant':v,'variants':{k:f'tilesets/{n}_{k}.png' for k in ('kalt','warm')},
           'transparent':False,'columns':8,'rows':5,'frameWidth':16,'frameHeight':16,'file':rel,'width':128,'height':80,
           'animations':m['anims'][v] if v in m['anims'] else {},'tileNames':m['names'],'cells':cells,
           'stateSwitch':'Wechsel kalt/warm über die Mechanik Wärme und Rücklauf, nicht über die Tageszeit','sha256':h}
        if v=='kalt': a['animations']={}
        assets.append(a)
    # provenance
    if n in ('bh_promenade','bh_kessel','bh_glas'):
        src={'kalt':'top 4 rows of generated 8x8 sheet','warm':'bottom 4 rows of the same generated sheet'}
        steps=['8x8 generator sheet, cells split on a uniform grid with 3% inset','per-cell mode downscale to 16x16 (quantize to shared palette, majority per pixel)','row 5 = animation frames derived from existing cells (feature roll / steam overlay); kalt row 5 holds static copies so both variants have identical occupied cells']
        jobs.append({'id':n,'outputs':[f'tilesets/{n}_kalt.png',f'tilesets/{n}_warm.png'],'kind':'tiles','mode':'generate','prompt':STYLE+'\n\n'+SPEC[n],
                     'references':REFS[TREF[n]],'aspectRatio':'1:1','rawSha256':rawsha(n),'variantSource':src,'steps':steps})
    elif n=='bh_stille':
        jobs.append({'id':n,'outputs':[f'tilesets/{n}_kalt.png'],'kind':'tiles','mode':'generate','prompt':STYLE+'\n\n'+SPEC[n],'references':REFS['tiles_in'],'aspectRatio':'1:1','rawSha256':rawsha(n),
                     'variantSource':{'kalt':'top 4 rows of generated 8x8 sheet','rejected':'bottom 4 rows (layout drifted)'},'steps':['uniform grid split, per-cell mode downscale to 16x16']})
        jobs.append({'id':n+'_warm','outputs':[f'tilesets/{n}_warm.png'],'kind':'tiles','mode':'edit','prompt':STYLE+'\n\n'+SPEC['bh_stille_warm_edit'],'references':['generated cold half of bh_stille (raw/bh_stille_coldhalf.png)'],'aspectRatio':'16:9','rawSha256':rawsha('bh_stille_warm'),'steps':['8x4 uniform grid split, per-cell mode downscale to 16x16']})
    elif n=='bh_klinik':
        jobs.append({'id':n,'outputs':[f'tilesets/{n}_kalt.png',f'tilesets/{n}_warm.png'],'kind':'tiles','mode':'generate','prompt':STYLE+'\n\n'+SPEC[n],'references':REFS['tiles_in'],'aspectRatio':'1:1','rawSha256':rawsha(n),
                     'variantSource':{'kalt':'top 4 rows of generated sheet','warm':'procedural from kalt: frost highlights neutralised, slight warm shift, faint turquoise (#245b59) in dark crack pixels of floor cells 1,3,8,9,16,17,25,26; row 5 = four turquoise pulse phases of cell 25'},
                     'rejectedAttempts':[{'note':'generated warm bottom half did not mirror the layout'},{'note':'warm edit (16:9) returned only 7 columns','rawSha256':sha('raw/bh_klinik_warm_rejected.jpg')}],
                     'steps':['uniform grid split, per-cell mode downscale','procedural warm derivation (see variantSource)']})
    elif n=='bh_wurzel':
        jobs.append({'id':n,'outputs':[f'tilesets/{n}_kalt.png',f'tilesets/{n}_warm.png'],'kind':'tiles','mode':'generate','prompt':STYLE+'\n\n'+SPEC[n],'references':REFS['tiles'],'aspectRatio':'1:1','rawSha256':rawsha(n),
                     'variantSource':{'kalt':'generated rows 1,2,7,8 (rows 7/8 carry the frost the prompt asked for in the cold state)','warm':'generated rows 5,6,3,4 (row 6 = pink-grey roots with turquoise pulse); row 5 = procedural pulse phases of cell 8 and drip frames'},
                     'rejectedAttempts':[{'note':'warm edit (16:9) cut off the 8th column','rawSha256':sha('raw/bh_wurzel_warm_rejected.jpg')}],'steps':['uniform grid split, per-cell mode downscale','row recombination so frost ends up in kalt','procedural animation row']})
# --- props
PREF={'bh_kutschenhof':'props','bh_promenade':'props','bh_glasgaerten':'props','bh_kesselgrund':'props_in','bh_stillenhaeuser':'props_in','bh_wurzelkranz':'props_in'}
PRAW={'bh_kutschenhof':['p_kutschenhof'],'bh_kesselgrund':['p_kesselgrund','p_buegelraum'],'bh_promenade':['p_promenade','p_kutschenhof'],'bh_glasgaerten':['p_glasgaerten'],'bh_stillenhaeuser':['p_stillenhaeuser'],'bh_wurzelkranz':['p_wurzelkranz']}
for n,m in pm.items():
    rel=f'props/{n}.png'; h=cp(f'out/props/{n}.png',rel)
    assets.append({'id':n,'kind':'props','transparent':True,'columns':m['width']//16,'rows':m['height']//16,'frameWidth':16,'frameHeight':16,'file':rel,
                   'width':m['width'],'height':m['height'],'animations':{},'regions':m['regions'],'regionAnimations':m['regionAnimations'],'anchor':'bottom-center of each region','sha256':h})
for r in sorted({x for v in PRAW.values() for x in v}):
    used=[k for k,v in PRAW.items() if r in v]
    jobs.append({'id':r,'outputs':[f'props/{k}.png' for k in used],'kind':'props','mode':'generate','prompt':STYLE+'\n\n'+SPEC[r],'references':REFS[PREF[used[0]]],'aspectRatio':'16:9' if r=='p_glasgaerten' else '4:3','rawSha256':rawsha(r),
                 'steps':['magenta chroma key (binary mask, opening 2px, small islands removed)','per-object crop on the requested object grid','fit into target region keeping aspect, mode downscale, bottom-centre anchor','1px #1a1c2c outline on alpha edge','derived frames: coach horses 1px bob; steam 6 frames by scale and ordered-dither dissolve; valve turning = wheel mirror/1px shift; fire and vat = palette cycle; plant bud->bloom = ordered-dither blend; pump wheel = mirror/1px shift; empty bunker = interior recolour; turned sign = sign recolour; distribution plant open/return = liquid recolour turquoise/violet; peg markers drawn procedurally']})
# --- fx
h=cp('out/fx/bh_waerme.png','fx/bh_waerme.png')
assets.append({'id':'bh_waerme','kind':'effect','transparent':True,'columns':fm['width']//16,'rows':fm['height']//16,'frameWidth':16,'frameHeight':16,'file':'fx/bh_waerme.png','width':fm['width'],'height':fm['height'],
               'animations':{},'regions':fm['regions'],'regionAnimations':fm['regionAnimations'],
               'pipeOverlayTiles':{'warm':'#e8b860','kalt':'#71858b','belastet':'#8c7295'},'sha256':h})
jobs.append({'id':'bh_waerme','outputs':['fx/bh_waerme.png'],'kind':'effect','mode':'procedural','prompt':None,'references':['fx/ds_nachhall_weg.png'],
             'steps':['drawn procedurally with the shared palette (tools/art/briarholt1/fx.py): steam from pipe 4f, condensate writing appears 6f (abstract strokes, no letters), frost transition 4f, faint violet return pulse 4f, 32x32 condensate barrier 4f, pipe-plan overlay tiles h/v/corner/tee x warm/kalt/belastet']})
# --- scenes / battle / map
for n,(rel,kind) in im['meta'].items():
    src='out/'+rel
    h=cp(src,rel); from PIL import Image; w,hh=Image.open(src).size
    a={'id':n if not n.startswith('bh_ankunft') else n,'kind':kind,'transparent':False,'columns':1,'rows':1,'frameWidth':w,'frameHeight':hh,'file':rel,'width':w,'height':hh,'animations':{},'sha256':h}
    if kind=='background':
        a['groundStrip']={'x':0,'y':200,'width':480,'height':70}
        if n.endswith('_kalt') or n.endswith('_warm'):
            base=n.rsplit('_',1)[0]; a['variant']=n.rsplit('_',1)[1]; a['variants']={'kalt':f'battle/{base}_kalt.png','warm':f'battle/{base}_warm.png'}
    if n=='bh_karte': a['pins']={k:{'x':v[0],'y':v[1]} for k,v in im['pins'].items()}
    if n=='bh_ende_schmerzlos_lichtmeister': a['condition']='k2_end_lichtmeister'
    if n.startswith('bh_ende_'): a['ending']={'bh_ende_wahl':'bha_end_wahl','bh_ende_winter':'bha_end_winter','bh_ende_verwahrt':'bha_end_verwahrt','bh_ende_schmerzlos':'bha_end_schmerzlos','bh_ende_schmerzlos_lichtmeister':'bha_end_schmerzlos'}[n]
    assets.append(a)
    key={'background':'b_','map':'m_'}.get(kind,'s_')+n
    ref={'background':'battle','map':'map'}.get(kind,'card' if n=='kapitel5_karte' else 'scene')
    refs=REFS[ref]
    if n=='bh_trockenraum': refs=['portraits/bh_orla_fencrest_emotions.png','portraits/bh_bellweather_emotions.png','characters/bh_orla_fencrest_walk.png','characters/bh_bellweather_walk.png']
    if n=='bh_ende_winter': refs=['portraits/bh_bellweather_emotions.png','characters/bh_bellweather_walk.png']
    if n=='bh_ende_verwahrt': refs=['portraits/bh_rookwell_emotions.png']
    if n=='bh_ende_schmerzlos_lichtmeister': refs=['generated bh_ende_schmerzlos raw (sha256 %s)'%rawsha('s_bh_ende_schmerzlos')]
    if n.endswith('_warm'): refs=['generated %s raw (sha256 %s)'%(n.replace('_warm','_kalt'),rawsha('b_'+n.replace('_warm','_kalt')))]
    j={'id':n,'outputs':[rel],'kind':kind,'mode':'edit' if n.endswith('_warm') else 'generate','prompt':STYLE+'\n\n'+SPEC[key],'references':refs,'aspectRatio':'16:9','rawSha256':rawsha(key),
       'steps':['mode downscale of the whole image to the exact target size (4x box pre-shrink, median 3, palette majority per pixel)','opaque, shared palette']}
    if n=='bh_ende_wahl': j['rejectedAttempts']=[{'note':'first result read like a prison yard (beds outdoors); regenerated with clarified prompt','rawSha256':rawsha('s_bh_ende_wahl_rejected')}]
    if n=='bh_trockenraum' or n in ('bh_ende_winter','bh_ende_verwahrt'): j['identityPreserve']=True
    jobs.append(j)
h=cp('out/ui/bh_marker.png','ui/bh_marker.png')
assets.append({'id':'bh_marker','kind':'markers','transparent':True,'columns':6,'rows':3,'frameWidth':16,'frameHeight':16,'file':'ui/bh_marker.png','width':96,'height':48,'animations':{},'baselineExclusive':15,
               'regions':{k:{'x':i%6*16,'y':i//6*16,'width':16,'height':16} for i,k in enumerate(im['markers'])},'sha256':h})
jobs.append({'id':'bh_marker','outputs':['ui/bh_marker.png'],'kind':'markers','mode':'generate','prompt':STYLE+'\n\n'+SPEC['m_bh_marker'],'references':REFS['marker'],'aspectRatio':'16:9','rawSha256':rawsha('m_bh_marker'),
             'steps':['magenta key, hole fill','fit each badge into 15x15 inside a 16x16 cell (baseline 15)','outline, palette']})
for rel,kind,desc in [('ui/bh_karte_nebel.png','overlay','procedural fog: smoothed noise, clear ellipses over the six quarters and the Wurzelkammer, 4x4 ordered dither, ~42% coverage like ds_karte_nebel'),
                      ('ui/bh_karte_leitungen.png','overlay','procedural pipe plan: orthogonal 3px pipes with 1px dark rim along the map main roads; amber = warm circuit, slate = kalt circuit, violet = belasteter Rücklauf; transparent elsewhere')]:
    h=cp('out/'+rel,rel); n=os.path.basename(rel)[:-4]
    a={'id':n,'kind':kind,'transparent':True,'columns':1,'rows':1,'frameWidth':480,'frameHeight':270,'file':rel,'width':480,'height':270,'animations':{},'sha256':h,'alignsWith':'ui/bh_karte.png'}
    if 'leitungen' in n: a['circuits']={'warm':'#e8b860','kalt':'#71858b','belastet':'#8c7295'}; a['segments']=im['pipeNetwork']
    assets.append(a)
    jobs.append({'id':n,'outputs':[rel],'kind':kind,'mode':'procedural','prompt':None,'references':['ui/ds_karte_nebel.png'] if 'nebel' in n else ['ui/bh_karte.png'],'steps':[desc]})
PAL_LIST=PAL_HEX
man={'version':1,'batch':'briarholt1','codex':'CI','city':'briarholt','status':'exported; game integration separate','paletteMaxVisibleColors':32,'palette':PAL_LIST,
     'notDuplicated':'Figuren (BK/vorrat2), Gegner und Zonen-Hintergründe Palmhaus/Wäscherei/Wurzelkammer (BI/vorrat1), Item-Icons (BM/vorrat3) werden nicht neu geliefert.',
     'assets':assets}
json.dump(man,open(f'{SP}/manifest-briarholt1.json','w'),indent=2,ensure_ascii=False)
for j in jobs:
    j['outputSha256']={o:sha(f'{SP}/{o}') for o in j['outputs']}
refsha={}
for j in jobs:
    for r in j['references']:
        if os.path.exists(f'{SP}/{r}'): refsha[r]=sha(f'{SP}/{r}')
import subprocess
base=subprocess.check_output(['git','-C',REPO,'rev-parse','origin/main']).decode().strip()
gen={'generator':'Built-in image_gen','batch':'briarholt1','codex':'docs/art/codex_CI_briarholt_grafik.md','date':'2026-11-11','baseCommit':base,'styleBlock':STYLE,
     'palette':PAL_LIST,'paletteSource':'Same shared 32-color palette as batch-dunscar1-generation.json / manifest-dunscar1.json',
     'referenceSha256':refsha,
     'postprocessing':'Nearest-neighbour target raster via palette-majority downscale (no anti-aliasing), indexing to the shared 32-colour palette, binary alpha (magenta key, alpha 0 or 255, transparent RGB 0), 1px #1a1c2c outline on cut-out sprites, animation frames derived as listed per job',
     'jobs':jobs}
json.dump(gen,open(f'{REPO}/docs/art/batch-briarholt1-generation.json','w'),indent=2,ensure_ascii=False)
shutil.copy('out/docs/batch-briarholt1-preview.png',f'{REPO}/docs/art/batch-briarholt1-preview.png')
print(len(assets),'assets',len(jobs),'jobs')
