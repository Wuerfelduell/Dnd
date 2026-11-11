"""ui/bh_karte_nebel.png v2: flat cloud banks in the style of ui/ds_karte_nebel.png (solid fog, banded
shading, light streaks, narrow checker fringe), holes over the seven map areas."""
import numpy as np, json
from PIL import Image
from tk import PAL, save_png, G6,G7,BONE,B14,S5
W,H=480,270
rng=np.random.default_rng(55)
def smooth(cell,seed):
    r=np.random.default_rng(seed); g=r.random((H//cell+3,W//cell+3))
    im=Image.fromarray((g*255).astype(np.uint8)).resize(((W//cell+3)*cell,(H//cell+3)*cell),Image.BICUBIC)
    return np.array(im)[:H,:W]/255.0
m=json.load(open('/workspace/Dnd/public/sprites/manifest-briarholt1.json'))
pins=[a for a in m['assets'] if a['file']=='ui/bh_karte.png'][0]['pins']
SIZE={'bh_kutschenhof':(78,46),'bh_kesselgrund':(86,52),'bh_winterpromenade':(78,46),'bh_glasgaerten':(92,46),
      'bh_stillenhaeuser':(96,46),'bh_wurzelkranz':(96,42),'bh_wurzelkammer':(42,44)}
yy,xx=np.mgrid[0:H,0:W]
field=np.zeros((H,W))
for k,p in pins.items():
    rx,ry=SIZE[k]
    for j in range(5):  # lumpy: several overlapping blobs
        ox=rng.uniform(-0.35,0.35)*rx; oy=rng.uniform(-0.3,0.3)*ry; s=rng.uniform(0.7,1.0)
        d=((xx-p['x']-ox)/(rx*s))**2+((yy-p['y']-oy)/(ry*s))**2
        field=np.maximum(field,1-d)
edge=smooth(18,3)*0.35+smooth(7,4)*0.12
clear=field+edge-0.25>0.22
fog=~clear
# fringe: checker band 2px wide on the inside of the fog edge
from scipy.ndimage import binary_erosion
inner=binary_erosion(fog,iterations=3,border_value=1)
fringe=fog&~inner
alpha=np.zeros((H,W),bool)
alpha[inner]=True
alpha[fringe&(((xx+yy)%2)==0)]=True
# shading bands from smooth noise, stretched horizontally like drifting banks
n=smooth(40,7)*0.6+smooth(16,8)*0.3+smooth(6,9)*0.1
n2=np.array(Image.fromarray((n*255).astype(np.uint8)).resize((W*2,H),Image.BICUBIC).crop((0,0,W,H)))/255.0
idx=np.full((H,W),G7,np.int16)
idx[n2<0.42]=G6
idx[(n2>0.66)]=B14
idx[(n2>0.72)]=BONE
# 1px checker between bands to soften, sparse like the reference
b=np.zeros((H,W),bool)
for (lo,hi) in [(0.40,0.44),(0.64,0.68)]:
    b|=(n2>lo)&(n2<hi)
idx[b&(((xx+yy)%2)==0)]=np.where(n2[b&(((xx+yy)%2)==0)]<0.5,G7,G7)
# darker G6 rim along clearing edges
dil=binary_erosion(fog,iterations=6,border_value=1)
idx[alpha&~dil&(idx!=BONE)]=G6
rgb=PAL[idx]; a=np.where(alpha,255,0).astype(np.uint8)
rgba=np.dstack([rgb,a]).astype(np.uint8); rgba[a==0,:3]=0
save_png(rgba,'/workspace/ci/t2/out_bh_karte_nebel.png')
print('coverage',alpha.mean().round(3))
bg=Image.open('/workspace/Dnd/public/sprites/ui/bh_karte.png').convert('RGBA'); bg.alpha_composite(Image.open('/workspace/ci/t2/out_bh_karte_nebel.png').convert('RGBA'))
bg.resize((960,540),Image.NEAREST).save('/tmp/fog_on_map_b.png')
red=Image.new('RGBA',(W,H),(200,60,60,255)); red.alpha_composite(Image.open('/workspace/ci/t2/out_bh_karte_nebel.png').convert('RGBA')); red.resize((960,540),Image.NEAREST).save('/tmp/fog_red_b.png')
