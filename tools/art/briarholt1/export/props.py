from lib import *
import numpy as np, json, os
from PIL import Image
from scipy import ndimage
C = lambda h: np.array([int(h[i:i+2],16) for i in (1,3,5)],np.uint8)
OUT = C('#1a1c2c')
def keymask(arr):
    a=arr.astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
    bg = (r>120)&(b>50)&(r-g>70)&(b-g>20)
    return ~bg
def extract(raw, cols, rows, idx):
    im = Image.open(f'raw/p_{raw}.jpg').convert('RGB'); W,H=im.size
    r,c = divmod(idx, cols)
    box=(round(c*W/cols),round(r*H/rows),round((c+1)*W/cols),round((r+1)*H/rows))
    a=np.array(im.crop(box)); m=keymask(a)
    m=ndimage.binary_opening(m,iterations=2)
    lab,n=ndimage.label(m)
    if n>1:
        sizes=ndimage.sum(m,lab,range(1,n+1)); keep=[i+1 for i,s in enumerate(sizes) if s>0.02*sizes.max()]
        m=np.isin(lab,keep)
    ys,xs=np.nonzero(m); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    return a[y0:y1,x0:x1], m[y0:y1,x0:x1]
def fit(src, w, h):
    a,m = src; bh,bw = m.shape; s=min(w/bw,h/bh)
    tw,th=max(1,round(bw*s)),max(1,round(bh*s))
    rgb = mode_down(Image.fromarray(a),(tw,th),blur=1)
    mm = np.array(Image.fromarray((m*255).astype(np.uint8)).resize((tw,th),Image.BOX))>=128
    out=np.zeros((h,w,4),np.uint8); ox=(w-tw)//2; oy=h-th
    out[oy:oy+th,ox:ox+tw,:3]=rgb; out[oy:oy+th,ox:ox+tw,3]=mm*255
    out[out[...,3]==0,:3]=0
    return outline(out)
def outline(o):
    al=o[...,3]>0; p=np.pad(al,1)
    edge = al & ~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])
    o=o.copy(); o[edge,:3]=OUT; return o
def recolor(o, frm, to, box=None):
    o=o.copy(); h,w=o.shape[:2]; y0,y1,x0,x1 = (0,h,0,w) if box is None else (int(box[1]*h),int(box[3]*h),int(box[0]*w),int(box[2]*w))
    sub=o[y0:y1,x0:x1]
    for f,t in zip(frm,to):
        mk=(sub[...,:3]==C(f)).all(-1)&(sub[...,3]>0); sub[mk,:3]=C(t)
    return o
def cycle(o, ring, box=None):
    return recolor(o, ring, ring[1:]+ring[:1], box)
def shift_part(o, x0f, dy=0, dx=0, y0f=0.0):
    o2=o.copy(); h,w=o.shape[:2]; x0=int(w*x0f); y0=int(h*y0f)
    part=o[y0:,x0:].copy(); o2[y0:,x0:]=0
    part=np.roll(np.roll(part,dy,0),dx,1)
    m=part[...,3]>0; reg=o2[y0:,x0:]; reg[m]=part[m]; return o2
def dissolve(o, keep):
    o=o.copy(); h,w=o.shape[:2]; yy,xx=np.mgrid[0:h,0:w]
    bayer=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16
    kill=bayer[yy%4,xx%4]>=keep; o[kill]=0; return o
def scaled(src,w,h,f):
    small=fit(src,max(4,int(w*f)),max(4,int(h*f))); out=np.zeros((h,w,4),np.uint8)
    sh,sw=small.shape[:2]; out[h-sh-(h-sh)//2:h-(h-sh)//2, (w-sw)//2:(w-sw)//2+sw]=small; return out
def rotate_wheel(o, ang):
    im=Image.fromarray(o,'RGBA'); h,w=o.shape[:2]
    top=im.crop((0,0,w,int(h*0.72))).rotate(ang,resample=Image.NEAREST,center=(w*0.42,h*0.34))
    base=np.array(im); base[:int(h*0.72)]=0; t=np.array(top); m=t[...,3]>0
    base[:int(h*0.72)][m]=t[m]; base[...,3]=np.where(base[...,3]>0,255,0); base[base[...,3]==0,:3]=0
    b2=base.copy(); b2[...,:3]=quantize_rgb(base[...,:3]); b2[b2[...,3]==0,:3]=0; return b2
def peg(color):
    o=np.zeros((16,16,4),np.uint8); yy,xx=np.mgrid[0:16,0:16]; d=(xx-7.5)**2+(yy-7.5)**2
    o[d<=12]=[*C(color),255]; o[(d<=12)&(d>6)]=[*OUT,255]; o[(d<=3)&(xx<8)&(yy<8)]=[*C('#eee2c5'),255]; return o
FIRE=['#886332','#d0a050','#e8b860','#f0ce80']
S={}
E=lambda raw,c,r,i: extract(raw,c,r,i)
# --- kutschenhof
coach=E('kutschenhof',3,3,0); st=E('kutschenhof',3,3,4)
c0=fit(coach,64,32)
S['bh_kutschenhof']=[('postkutsche_0',c0),('postkutsche_1',shift_part(c0,0.62,dy=-1)),
  ('gepaeckkarren_blumenerde',fit(E('kutschenhof',3,3,1),32,32)),('patientenstuhl',fit(E('kutschenhof',3,3,2),16,32)),
  ('hinweistafel_pfirsich',fit(E('kutschenhof',3,3,3),32,32)),('wartebank_frost',fit(E('kutschenhof',3,3,5),32,32))]+\
  [(f'dampfentladung_{i}', f) for i,f in enumerate([scaled(st,48,48,0.35),scaled(st,48,48,0.6),scaled(st,48,48,0.85),fit(st,48,48),dissolve(fit(st,48,48),0.55),dissolve(fit(st,48,48),0.25)])]
RA={'bh_kutschenhof':{'pferde':(['postkutsche_0','postkutsche_1'],3,-1),'dampfentladung':([f'dampfentladung_{i}' for i in range(6)],10,0)}}
# --- kesselgrund incl. buegelraum
vz=fit(E('kesselgrund',4,3,0),16,32)
fire0=fit(E('kesselgrund',4,3,10),32,32)
bunker=fit(E('kesselgrund',4,3,5),32,32)
leer=bunker.copy(); hh,ww=leer.shape[:2]
sub=leer[int(hh*0.32):int(hh*0.86), int(ww*0.22):int(ww*0.78)]
mk=(sub[...,3]>0)&~((sub[...,:3]==OUT).all(-1)); sub[mk,:3]=C('#252b38')
sub[-2:][mk[-2:]]=[*C('#2d2629'),255]
S['bh_kesselgrund']=[('ventil_zu',vz),('ventil_kalt',fit(E('kesselgrund',4,3,1),16,32)),('ventil_warm',fit(E('kesselgrund',4,3,2),16,32))]+\
  [(f'ventil_drehen_{i}',f) for i,f in enumerate([vz,shift_part(vz,0.0,dx=1,y0f=0.0)*0+np.ascontiguousarray(np.concatenate([vz[:10,::-1],vz[10:]],0)),shift_part(np.concatenate([vz[:10],vz[10:]],0),0,0),np.concatenate([vz[:10,::-1],vz[10:]],0)])]+\
  [('wartungsschrank',fit(E('kesselgrund',4,3,3),32,32)),('kohlenbunker_leer',leer),('kohlenbunker_voll',bunker),
   ('druckanzeige_niedrig',fit(E('kesselgrund',4,3,6),16,16)),('druckanzeige_hoch',fit(E('kesselgrund',4,3,7),16,16)),
   ('buegelbrett',fit(E('kesselgrund',4,3,8),32,32)),('waeschemangel',fit(E('kesselgrund',4,3,9),32,32)),
   ('feuerstelle_0',fire0),('feuerstelle_1',cycle(fire0,FIRE)),('fallwand',fit(E('buegelraum',3,2,2),32,32)),
   ('kiste',fit(E('kesselgrund',4,3,11),16,16)),('bett',fit(E('buegelraum',3,2,0),32,32)),('lager',fit(E('buegelraum',3,2,1),32,32)),
   ('ventiltafel',fit(E('buegelraum',3,2,3),32,32)),('steckmarke_zu',peg('#893e4e')),('steckmarke_kalt',peg('#71858b')),('steckmarke_warm',peg('#e8b860'))]
# make turning frames distinct: 0 orig, 1 wheel mirrored, 2 wheel shifted, 3 mirrored+shifted
v1=np.concatenate([vz[:10,::-1],vz[10:]],0); v2=vz.copy(); v2[:10]=np.roll(vz[:10],1,1); v3=v1.copy(); v3[:10]=np.roll(v1[:10],-1,1)
S['bh_kesselgrund'][3:7]=[('ventil_drehen_0',vz),('ventil_drehen_1',v2),('ventil_drehen_2',v1),('ventil_drehen_3',v3)]
RA['bh_kesselgrund']={'ventil_drehen':([f'ventil_drehen_{i}' for i in range(4)],8,0),'feuerstelle':(['feuerstelle_0','feuerstelle_1'],4,-1)}
# --- promenade
S['bh_promenade']=[('musikpavillon',fit(E('promenade',3,2,0),64,48)),('schreibpult_postkarten',fit(E('promenade',3,2,1),32,32)),
  ('palme_kalt',fit(E('promenade',3,2,2),32,48)),('palme_warm',fit(E('promenade',3,2,3),32,48)),('gaslaterne',fit(E('promenade',3,2,4),16,48)),
  ('kurgaeste_bank',fit(E('kutschenhof',3,3,5),32,32)),('kurkiosk',fit(E('promenade',3,2,5),32,48))]
# make the promenade bench frost-free (warm promenade bench) by recolouring frost highlights
S['bh_promenade'][5]=('kurgaeste_bank',recolor(S['bh_promenade'][5][1],['#eee2c5','#a8b4c0'],['#92745a','#715648'],box=(0,0,1,0.6)))
RA['bh_promenade']={}
# --- glasgaerten
bed=fit(E('glasgaerten',4,2,0),32,32); bed2=fit(E('glasgaerten',4,2,1),32,32)
bed2=recolor(bed2,['#b3946e','#92745a','#cfb18a'],['#58433c','#58433c','#715648'],box=(0.3,0.45,0.75,0.85))
bud=fit(E('glasgaerten',4,2,6),16,32); bloom=fit(E('glasgaerten',4,2,7),16,32)
def mixd(a,b,keep):
    o=a.copy(); h,w=a.shape[:2]; yy,xx=np.mgrid[0:h,0:w]; bay=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16
    t=bay[yy%4,xx%4]<keep; o[t]=b[t]; return outline(o)
S['bh_glasgaerten']=[('beet_schild',bed),('beet_schild_umgedreht',bed2),('saatbuch_pult',fit(E('glasgaerten',4,2,2),32,32)),
  ('veredelungsschere_gross',fit(E('glasgaerten',4,2,3),32,32)),('kapselhalter_leer',fit(E('glasgaerten',4,2,4),16,32)),('kapselhalter_kapsel',fit(E('glasgaerten',4,2,5),16,32))]+\
  [(f'sprechende_pflanze_{i}',f) for i,f in enumerate([bud,mixd(bud,bloom,0.35),mixd(bud,bloom,0.7),bloom])]
RA['bh_glasgaerten']={'sprechende_pflanze':([f'sprechende_pflanze_{i}' for i in range(4)],4,0)}
# --- stillenhaeuser
S['bh_stillenhaeuser']=[('bett_tafel_radiert',fit(E('stillenhaeuser',3,2,0),32,32)),('teewagen',fit(E('stillenhaeuser',3,2,1),32,32)),
  ('ennas_heft',fit(E('stillenhaeuser',3,2,2),16,16)),('speisesaal_tisch',fit(E('stillenhaeuser',3,2,3),48,32)),
  ('speisesaal_stuehle',fit(E('stillenhaeuser',3,2,4),32,32)),('kinderzeichnung',fit(E('stillenhaeuser',3,2,5),32,32))]
RA['bh_stillenhaeuser']={}
# --- wurzelkranz
wh=fit(E('wurzelkranz',3,2,0),32,32); vat=fit(E('wurzelkranz',3,2,1),32,48)
dist=fit(E('wurzelkranz',3,2,3),64,48)
LIQ=['#58433c','#715648','#92745a']
def vat_bubble(v):
    o=cycle(v,['#173d40','#245b59','#36817a','#4eafa2','#6fe0d0'],box=(0,0,1,0.5))
    h,w=o.shape[:2]
    for (x,y) in [(w//2-3,h//5+2),(w//2+2,h//5+1),(w//2,h//5+3)]:
        if o[y,x,3]: o[y,x,:3]=C('#6fe0d0')
    return o
def wframes(w):
    k=int(w.shape[0]*0.7); a=w.copy(); b=w.copy(); b[:k]=np.roll(w[:k],1,0); c=w.copy(); c[:k]=w[:k,::-1]; d=c.copy(); d[:k]=np.roll(c[:k],1,0)
    return [w,b,c,d]
S['bh_wurzelkranz']=[(f'pumpenrad_{i}',f) for i,f in enumerate(wframes(wh))]+\
  [('sudkessel_0',vat),('sudkessel_1',vat_bubble(vat)),('zeichentisch_fundamentplan',fit(E('wurzelkranz',3,2,2),32,32)),
   ('verteilanlage_zu',dist),('verteilanlage_offen',recolor(dist,LIQ,['#245b59','#36817a','#4eafa2'],box=(0,0.1,0.75,0.65))),
   ('verteilanlage_ruecklauf',recolor(dist,LIQ,['#5c426a','#8c7295','#c8b0e8'],box=(0,0.1,0.75,0.65))),
   ('ruecklauf_versiegelt',fit(E('wurzelkranz',3,2,4),32,32)),('ruecklauf_offen',fit(E('wurzelkranz',3,2,5),32,32))]
RA['bh_wurzelkranz']={'pumpenrad':([f'pumpenrad_{i}' for i in range(4)],6,-1),'sudkessel':(['sudkessel_0','sudkessel_1'],3,-1)}
# --- pack
def pack(items, W=256):
    x=y=0; rowh=0; pos={}
    for n,a in items:
        h,w=a.shape[:2]
        if x+w>W: x=0; y+=rowh; rowh=0
        pos[n]=(x,y,w,h); x+=w; rowh=max(rowh,h)
    H=y+rowh; H=(H+15)//16*16
    sheet=np.zeros((H,W,4),np.uint8)
    for n,a in items:
        x,y,w,h=pos[n]; sheet[y:y+h,x:x+w]=a
    return sheet,pos
os.makedirs('out/props',exist_ok=True); meta={}
for name,items in S.items():
    # final palette snap for derived pixels
    items=[(n,np.dstack([quantize_rgb(a[...,:3]),a[...,3]])) for n,a in items]
    for n,a in items: a[a[...,3]==0,:3]=0
    sheet,pos=pack(items)
    save_png(sheet,f'out/props/{name}.png')
    meta[name]={'regions':{n:dict(zip(['x','y','width','height'],map(int,p))) for n,p in pos.items()},
                'regionAnimations':{k:{'frames':v[0],'frameRate':v[1],'repeat':v[2]} for k,v in RA[name].items()},
                'width':sheet.shape[1],'height':sheet.shape[0]}
json.dump(meta,open('out/props_meta.json','w'),indent=1)
# preview
ims=[Image.open(f'out/props/{n}.png').convert('RGBA') for n in S]
H=sum(i.height+8 for i in ims); P=Image.new('RGBA',(256,H),(60,64,80,255)); y=0
for i in ims: P.alpha_composite(i,(0,y)); y+=i.height+8
P.resize((P.width*3,P.height*3),Image.NEAREST).save('raw/props_preview.png'); print({n:(m['width'],m['height']) for n,m in meta.items()})
