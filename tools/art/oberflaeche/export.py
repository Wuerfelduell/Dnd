#!/usr/bin/env python3
"""Export reviewed imagegen sources. Usage: python export.py /path/to/sources.json.

Requires Pillow, NumPy and SciPy. Sources JSON maps generation ids to local PNGs.
Only nearest-neighbor sampling, palette mapping, atlas packing and alpha masks
are applied; source artwork is supplied by imagegen (see generation log).
"""
import json, sys, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/sprites'
SOURCES = json.loads(Path(sys.argv[1]).read_text())
NN = Image.Resampling.NEAREST
REF = Image.open(OUT / 'ui/07_06_title.png').convert('RGB')
COLORS = sorted(set(map(tuple,np.array(REF).reshape(-1,3))) - {(137,182,160),(130,137,106)}) + [(222,214,188),(111,224,208),(139,113,181),(91,68,119),(161,169,177),(191,195,188)]
assert len(COLORS) == 31
PAL = Image.new('P', (1,1))
PAL.putpalette(sum(([0,0,0],), []) + [v for c in COLORS for v in c] + [0]*672)
ASSETS = []
def blank(size): return Image.new('RGBA', size)
def source(key): return Image.open(SOURCES[key]).convert('RGBA')
def quant(im, opaque=False):
    im=im.convert('RGBA'); a=np.array(im)
    ix=np.array(im.convert('RGB').quantize(palette=PAL,dither=Image.Dither.NONE))
    ix[ix==0]=COLORS.index((26,28,44))+1
    if not opaque: ix[a[:,:,3]<128]=0
    out=Image.fromarray(ix,'P'); out.putpalette(PAL.getpalette())
    out.info['transparency']=0
    return out.convert('RGBA')
def save(im, file, **meta):
    im=quant(im,meta.get('transparent') is False)
    idx=np.array(im.convert('RGB').quantize(palette=PAL,dither=Image.Dither.NONE))
    idx[idx==0]=COLORS.index((26,28,44))+1
    idx[np.array(im)[:,:,3]==0]=0
    p=Image.fromarray(idx,'P'); p.putpalette(PAL.getpalette()); p.info['transparency']=0
    dest=OUT/file; dest.parent.mkdir(parents=True,exist_ok=True); p.save(dest,optimize=True)
    ASSETS.append(dict(id='ae_'+file.replace('.png','').replace('/','_'),file=file,width=im.width,height=im.height,transparent=True,**{k:v for k,v in meta.items() if k!='transparent'}))
    ASSETS[-1]['transparent']=meta.get('transparent',True)
    return im
def rect(x,y,w,h): return dict(x=x,y=y,width=w,height=h)
def cutgrid(key,cols,rows,c,r):
    im=source(key); w,h=im.size
    return im.crop((round(c*w/cols),round(r*h/rows),round((c+1)*w/cols),round((r+1)*h/rows)))
def fit(im,size,pad=1,bottom=False,crop=True):
    if crop:
        mask=im.getchannel('A').point(lambda a:255 if a>=128 else 0)
        box=mask.getbbox()
        if not box: return blank(size)
        im=im.crop(box)
    scale=min((size[0]-2*pad)/im.width,(size[1]-2*pad)/im.height)
    im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),NN)
    dst=blank(size); dst.paste(im,((size[0]-im.width)//2,size[1]-pad-im.height if bottom else (size[1]-im.height)//2))
    return dst
def animation(n,fps=6,repeat=-1): return dict(frames=list(range(n)),frameRate=fps,repeat=repeat)
def strip(frames):
    out=blank((sum(i.width for i in frames),max(i.height for i in frames))); x=0
    for f in frames: out.paste(f,(x,0)); x+=f.width
    return out
def edge_match(im,axes='xy'):
    a=np.array(im)
    if 'x' in axes:
        # Mirror a narrow boundary strip to retain texture density at the join.
        a[:,-3:]=a[:,:3][:,::-1]
    if 'y' in axes: a[-3:]=a[:3][::-1]
    return Image.fromarray(a)
def dither(im,rate=2):
    a=np.array(quant(im)); yy,xx=np.indices(a.shape[:2])
    keep=(xx+yy)%2==0 if rate==2 else ((xx%2==0)&(yy%2==0))
    a[~keep,3]=0
    a[:,:,:3]=(117,133,146)
    return Image.fromarray(a)

# Settings: fit each icon independently into its 16px cell.
names='lautstaerke stumm musik effekte vollbild fenster steuerung speichern laden zurueck zahnrad info beenden pause weiter handy'.split()
im=blank((128,32)); regions={}
for i,name in enumerate(names):
    x,y=i%8*16,i//8*16; im.paste(fit(cutgrid('einstellungen',8,2,i%8,i//8),(16,16)),(x,y)); regions[name]=rect(x,y,16,16)
save(im,'ui/AE_einstellungen.png',frameWidth=16,frameHeight=16,columns=8,rows=2,regions=regions)

# Slider source is a single strip with unequal item widths; crop the observed boxes.
src=source('regler'); boxes=[(20,268,658,469),(677,268,1340,469),(1343,268,1535,469),(1537,268,1728,469),(1730,266,1933,469),(1935,266,2145,469)]
sizes=[(48,16),(48,16)]+[(16,16)]*4
names=['schiene','fuellung','knopf_normal','knopf_gedrueckt','box_leer','box_angekreuzt']
parts=[fit(src.crop(b),s,pad=0) for b,s in zip(boxes,sizes)]
regions={}; x=0
for name,s in zip(names,sizes):
    regions[name]=rect(x,0,*s)
    if s[0]==48: regions[name]['nineSlice']={'left':16,'right':16,'top':4,'bottom':4}
    x+=s[0]
save(strip(parts),'ui/AE_regler.png',regions=regions)

# Touch buttons: one normal disc per action; derive the exact pressed offset.
names='aktion geistsicht notizbuch inventar karte angriff ausweichen parieren faehigkeit gegenstand'.split()
im=blank((320,64)); regions={}
for i,name in enumerate(names):
    normal=quant(fit(cutgrid('touch_v2',5,4,i%5,i//5),(32,32),pad=2))
    # Use generated pressed artwork at same scale, translated one logical pixel.
    pressed=quant(fit(cutgrid('touch_v2',5,4,i%5,i//5+2),(32,32),pad=2))
    shifted=blank((32,32)); shifted.paste(pressed,(0,1))
    im.paste(normal,(i*32,0)); im.paste(shifted,(i*32,32))
    for state,y in [('normal',0),('gedrueckt',32)]: regions[name+'_'+state]=rect(i*32,y,32,32)
save(im,'ui/AE_touch.png',frameWidth=32,frameHeight=32,columns=10,rows=2,regions=regions)
src=source('stick'); im=blank((112,64))
for box,size,pos in [((0,0,900,948),(64,64),(0,0)),((900,0,1245,390),(24,24),(64,0)),((1260,0,1659,390),(24,24),(88,0))]: im.paste(fit(src.crop(box),size),(pos))
save(im,'ui/AE_stick.png',regions={'grundplatte':rect(0,0,64,64),'knopf_normal':rect(64,0,24,24),'knopf_gedrueckt':rect(88,0,24,24)})

# Full-scene layers keep the exact same origin and viewport.
title='ui/AE_titel/'
for key,file,opaque in [('titel_himmel','ebene_0_himmel.png',True),('titel_ferne','ebene_2_ferne.png',False),('titel_vorne','ebene_5_vorne.png',False)]:
    save(source(key).resize((480,270),NN),title+file,transparent=not opaque,frameWidth=480,frameHeight=270,columns=1,rows=1,origin=[0,0])
moons=[]
for c in range(2):
    moon=fit(cutgrid('titel_mond',2,1,c,0),(68,42),pad=0)
    fr=blank((480,270)); fr.paste(moon,(171,21)); moons.append(fr)
save(strip(moons),title+'ebene_1_mond.png',frameWidth=480,frameHeight=270,columns=2,rows=1,animations={'pulsieren':animation(2,0.6)},origin=[0,0])
fog=dither(source('titel_nebel').resize((480,270),NN),4)
save(edge_match(fog,'x'),title+'ebene_3_nebel.png',frameWidth=480,frameHeight=270,columns=1,rows=1,tileable=['x'],origin=[0,0])

city=quant(source('titel_stadt').resize((480,270),NN)); a=np.array(city)
raw=np.array(source('titel_stadt').resize((480,270),NN)); y,x=np.indices(a.shape[:2])
# Restrict light extraction to the three observed window groups, not amber street reflections.
windows=(((x>=10)&(x<=42)&(y>=32)&(y<99))|((x>=443)&(x<=472)&(y>=113)&(y<=175))|((x>=429)&(x<=466)&(y>=218)&(y<=258)))
mask=windows&(raw[:,:,0]>raw[:,:,2]*1.6)&(raw[:,:,0]>raw[:,:,1]*1.12)&(raw[:,:,0]>135)&(a[:,:,3]>0)
light=np.zeros_like(a); light[mask]=a[mask]
a[mask,:3]=(37,43,59)
save(Image.fromarray(a),title+'ebene_4_stadt.png',frameWidth=480,frameHeight=270,columns=1,rows=1,origin=[0,0])
frames=[]
for i in range(4):
    b=light.copy()
    if i==1: b[(x>400)&(y<180),3]=0
    if i==2: b[(x<100)&(y>65),3]=0
    if i==3: b[(x>400)&(y>210),3]=0
    frames.append(Image.fromarray(b))
save(strip(frames),title+'ebene_4_fenster.png',frameWidth=480,frameHeight=270,columns=4,rows=1,animations={'fenster':animation(4,0.4)},origin=[0,0])
flames=[fit(cutgrid('kleine_effekte',4,4,c,0),(16,16),pad=3,bottom=True) for c in range(4)]
save(strip(flames),title+'ebene_5_laterne.png',frameWidth=16,frameHeight=16,columns=4,rows=1,animations={'flackern':animation(4,8)},placement={'x':64,'y':96,'coordinateSpace':[480,270]})

# Rain: use one generated frame and wrap its translation to maintain temporal coherence.
rain=quant(cutgrid('regen',2,2,0,0).resize((240,135),NN))
ra=np.array(rain); ra[:,:,:3]=(117,133,146)
# Thin the source's broad alpha remnants to one-pixel strokes.
from scipy.ndimage import label
labels,n=label(ra[:,:,3]>=180)
thin=np.zeros_like(ra)
for n0 in range(1,n+1):
    yy,xx=np.where(labels==n0)
    if len(xx)<2: continue
    cx,cy=int(np.median(xx)),int(np.median(yy))
    for dx,dy in [(0,0),(-1,1),(-1,2)]: thin[(cy+dy)%135,(cx+dx)%240]=(117,133,146,255)
rain=Image.fromarray(thin)
rains=[edge_match(ImageChops.offset(rain,-i*3,i*5)) for i in range(4)]
title_rains=[]
for r in rains:
    full=blank((480,270))
    for xx in (0,240):
        for yy in (0,135): full.paste(r,(xx,yy))
    title_rains.append(full)
save(strip(title_rains),title+'ebene_6_regen.png',frameWidth=480,frameHeight=270,columns=4,rows=1,animations={'regen':animation(4,10)},tileable=['x','y'],origin=[0,0])

for key,file in [('kapitel1','kapitel1_karte.png'),('kapitel2','kapitel2_karte.png'),('kapitel_ende','kapitel_ende.png')]:
    save(source(key).resize((480,270),NN),'ui/scenes/'+file,transparent=False,frameWidth=480,frameHeight=270,columns=1,rows=1,safeTextArea=rect(32,190,416,68))

# Newspaper atlas: all named regions have independent extraction bounds.
im=blank((320,160)); regions={}
page=fit(cutgrid('zeitung',3,1,0,0),(48,48),pad=0); im.paste(page,(0,0))
regions['seite']=dict(**rect(0,0,48,48),nineSlice={'left':16,'right':16,'top':16,'bottom':16})
for c,name in [(1,'sprechblase'),(2,'gedankenblase')]:
    pos=(48+(c-1)*24,0); im.paste(fit(cutgrid('zeitung',3,1,c,0),(24,24),pad=0),pos)
    regions[name]=dict(**rect(*pos,24,24),nineSlice={'left':8,'right':8,'top':8,'bottom':8})
for c,name in enumerate(['sprechzipfel','gedankenpunkte']):
    pos=(96+c*8,0); im.paste(fit(cutgrid('kleine_effekte',4,4,c,3),(8,8),pad=0),pos); regions[name]=rect(*pos,8,8)
for r,name in enumerate(['kopf_kettlegate','kopf_wexmoor']):
    pos=(r*160,48); im.paste(fit(cutgrid('ornamente',1,2,0,r),(160,24),pad=0),pos); regions[name]=rect(*pos,160,24)
for i,name in enumerate(['foto_polizeiwache','foto_menschenmenge','foto_hafen','foto_leuchtturm']):
    pos=(i*64,80); im.paste(cutgrid('fotorahmen',2,2,i%2,i//2).resize((64,48),NN),pos); regions[name]=rect(*pos,64,48)
save(im,'ui/AE_zeitung.png',regions=regions)
im=blank((64,32)); regions={}
for i,name in enumerate(['zeitungsstaender','zeitungsjunge_kiste','anschlagpfahl','zeitungsfetzen']):
    sz=(16,16) if i==3 else (16,32); fr=fit(cutgrid('zeitung_props',4,1,i,0),sz,pad=1,bottom=True)
    im.paste(fr,(i*16,16 if i==3 else 0)); regions[name]=rect(i*16,0,16,32)
save(im,'props/AE_zeitung.png',frameWidth=16,frameHeight=32,columns=4,rows=1,regions=regions)

# Mixed frame sizes: atlas regions, with one local animation row per clip.
im=blank((128,272)); regions={}; clips={}; y=0
small=[('moorfrosch_sitzen',2,3),('moorfrosch_huepfen',4,8),('moewe_fliegen',4,8),('moewe_sitzen',2,2),('aal_schwimmen',4,6),('aal_auftauchen',4,5),('irrlicht_schweben',6,7),('schlickkrabbe_laufen',4,7),('motten_kreisen',4,8),('kraehe_sitzen',2,2),('kraehe_kraechzen',2,4)]
row_edges=[0,155,310,470,645,780,905,1065,1190,1335,1494,1644]
small_source=source('tiere_klein')
for row,(name,n,fps) in enumerate(small):
    for c in range(n):
        # Common cell geometry retains relative pose height and hopping motion.
        fr=small_source.crop((round(c*small_source.width/6),row_edges[row],round((c+1)*small_source.width/6),row_edges[row+1])).resize((14,14),NN)
        if row==10: fr=cutgrid('kraehe',2,1,c,0).resize((14,14),NN)
        im.paste(fr,(c*16+1,y+1))
    regions[name]=rect(0,y,n*16,16)
    clips[name]=dict(**animation(n,fps),region=name,frameWidth=16,frameHeight=16,columns=n,rows=1,frameIndexSpace='region')
    y+=16
for row,(name,n,fps) in enumerate([('graureiher_stehen',2,2),('graureiher_schreiten',4,5),('graureiher_auffliegen',4,8)]):
    for c in range(n):
        fr=cutgrid('reiher',4,3,c,row).resize((30,30),NN); im.paste(fr,(c*32+1,y+1))
    regions[name]=rect(0,y,n*32,32)
    clips[name]=dict(**animation(n,fps,0 if row==2 else -1),region=name,frameWidth=32,frameHeight=32,columns=n,rows=1,frameIndexSpace='region')
    y+=32
save(im,'fx/AE_wexmoor_tiere.png',regions=regions,animations=clips,layout='mixed-size region atlas')

# Weather atlas, no overlap: small effects y0, rain y16, fog y151, beam y286.
im=blank((1920,350)); regions={}; clips={}
def weather(name,frames,pos,fps=None,repeat=-1,tile=None):
    piece=strip(frames); im.paste(piece,pos)
    regions[name]=dict(**rect(*pos,piece.width,piece.height),frameWidth=frames[0].width,frameHeight=frames[0].height,columns=len(frames),rows=1)
    if tile: regions[name]['tileable']=tile
    if fps: clips[name]=dict(**animation(len(frames),fps,repeat),region=name,frameWidth=frames[0].width,frameHeight=frames[0].height,columns=len(frames),rows=1,frameIndexSpace='region')
weather('gischt',[fit(cutgrid('kleine_effekte',4,4,c,1),(8,8),pad=1) for c in range(4)],(0,0),10)
weather('wasserkringel',[cutgrid('kleine_effekte',4,4,c,2).resize((16,16),NN) for c in range(4)],(32,0),8)
weather('nieselregen',rains,(0,16),10,tile=['x','y'])
for c in range(2):
    f=dither(cutgrid('nebel_wx',2,1,c,0).resize((240,135),NN),4)
    # The half-opacity is represented as checker holes, never fractional alpha.
    weather('nebelbank_'+str(c+1),[edge_match(f)],(c*240,151),tile=['x','y'])
# Isolate the narrow generated cone from its unwanted diffuse halo, then rotate
# that same texture in pixel space. Its narrow tip remains at [120,32].
cone=source('lichtstrahl').crop((0,62,543,195)).resize((116,30),NN)
ca=np.array(quant(cone)); yy,xx=np.indices(ca.shape[:2]); inside=abs(yy-14.5)<(115-xx)*0.13
ca[~inside,3]=0; ca[(xx+yy)%3!=0,3]=0; ca[:,:,:3]=(222,214,188)
base=blank((240,240)); base.paste(Image.fromarray(ca),(4,105))
beams=[]
for angle in range(0,360,45):
    rotated=base.rotate(-angle,resample=NN,center=(120,120))
    # Squeeze vertical reach into the specified 64px-high sky strip.
    beams.append(rotated.resize((240,64),NN))
weather('leuchtturm_lichtstrahl',beams,(0,286),6)
save(im,'fx/AE_wexmoor_wetter.png',regions=regions,animations=clips,layout='mixed-size region atlas')

manifest=dict(version=1,batch='oberflaeche',status='exported; runtime integration pending',paletteMaxVisibleColors=31,palette=['#%02x%02x%02x'%c for c in COLORS],alpha='binary; index 0 transparent',assets=ASSETS)
(OUT/'manifest-oberflaeche.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
genpath=ROOT/'docs/art/batch-oberflaeche-generation.json'; gen=json.loads(genpath.read_text())
gen['sources']={k:dict(filename=Path(v).name,sha256=hashlib.sha256(Path(v).read_bytes()).hexdigest()) for k,v in SOURCES.items()}
gen['export']='tools/art/oberflaeche/export.py; Pillow + NumPy + SciPy; nearest neighbor; shared reference palette; alpha threshold 128; per-region atlas packing'
gen['derivedAnimations']={'windows':'three pane masks extracted from city source, selected groups switched off per frame','rain':'one generated drizzle texture thinned and wrapped at four offsets; title uses 2x2 tiles without scaling strokes','beacon':'generated cone cropped, diffuse halo removed, fixed-tip nearest-neighbor rotation in eight phases','pressed':'generated pressed button row offset one logical pixel down'}
gen['rejectedSources']=['lichtstrahl_v2','touch']
genpath.write_text(json.dumps(gen,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(ASSETS)} PNGs with one shared 31-color palette.')
