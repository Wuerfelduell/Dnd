from lib import *
import numpy as np, json
from PIL import Image
C = lambda h: np.array([int(h[i:i+2],16) for i in (1,3,5)],np.uint8)
def cell(a,i): r,c=divmod(i,8); return a[r*16:(r+1)*16, c*16:(c+1)*16]
def setcell(a,i,v): r,c=divmod(i,8); a[r*16:(r+1)*16, c*16:(c+1)*16]=v
def lum(px): return px[...,0]*0.3+px[...,1]*0.59+px[...,2]*0.11
def roll_feature(c, pred, dy=0, dx=0):
    m = pred(c)
    base = c.copy()
    # fill feature pixels with the median non-feature colour of the row
    for y in range(16):
        row = c[y][~m[y]]
        fill = row[len(row)//2] if len(row) else c[y,0]
        base[y][m[y]] = fill
    mm = np.roll(np.roll(m,dy,0),dx,1); src = np.roll(np.roll(c,dy,0),dx,1)
    base[mm] = src[mm]; return base
STEAM = [C('#a8b4c0'), C('#95a5a5'), C('#eee2c5')]
def steam(c, phase):
    o = c.copy(); rng = np.random.RandomState(7)
    puffs = [(4,12),(9,10),(6,7),(10,4)]
    for k,(x,y) in enumerate(puffs):
        yy = y - phase*2 - (k%2)
        r = 1 + ((phase+k)%3==0)
        for dy in range(-r,r+1):
            for dx in range(-r-1,r+2):
                Y,X = (yy+dy)%16, x+dx
                if 0<=X<16 and abs(dx)+abs(dy)<=r+1 and Y<14:
                    o[Y,X] = STEAM[(dx+dy+phase)%3 if abs(dx)+abs(dy)<r else 1]
    return o
TQ = [C('#245b59'), C('#36817a'), C('#4eafa2'), C('#6fe0d0')]
def veins(c, phase=None, strength=0.55):
    """faint turquoise in dark crack pixels; pulse band per phase"""
    o = c.copy(); L = lum(c.astype(float))
    m = L < np.percentile(L, 22)
    ys,xs = np.nonzero(m)
    for y,x in zip(ys,xs):
        if (x*7+y*13)%100 > strength*100: continue
        if phase is None: o[y,x]=TQ[0]; continue
        band = ((x+y)//4)%4
        o[y,x] = TQ[3] if band==phase else (TQ[2] if band==(phase-1)%4 else TQ[1])
    return o
def warmify(c, k=1.0):
    f = c.astype(float)
    frost = (f[...,2] > f[...,0]+8) & (lum(f) > 140)
    f[frost] = f[frost]*0.72 + np.array([92,80,70])*0.28
    f[...,0]*=1.0+0.07*k; f[...,2]*=1.0-0.07*k
    return quantize_rgb(np.clip(f,0,255).astype(np.uint8))
def frostify(c):
    f=c.astype(float); L=lum(f)
    m = ((np.arange(16)[:,None]*3+np.arange(16)[None,:]*5)%11==0) & (L>60)
    f[m]=[168,180,192]; return quantize_rgb(f.astype(np.uint8))
def rootpink(c):
    f=c.astype(float); m=(f[...,0]-f[...,2]>12)
    o=c.copy(); L=lum(f)
    o[m & (L<70)] = C('#5c426a'); o[m&(L>=70)&(L<120)] = C('#8c7295'); o[m&(L>=120)] = C('#8c7295')
    return o
G = {n: np.load(f'raw/{n}_grid.npy') for n in ['bh_promenade','bh_kessel','bh_glas','bh_stille','bh_klinik','bh_wurzel']}
SHEETS = {}
def top(a): return a[:64].copy()
def bot(a): return a[64:].copy()
# compositions
SHEETS['bh_promenade'] = (top(G['bh_promenade']), bot(G['bh_promenade']))
SHEETS['bh_kessel'] = (top(G['bh_kessel']), bot(G['bh_kessel']))
SHEETS['bh_glas'] = (top(G['bh_glas']), bot(G['bh_glas']))
SHEETS['bh_stille'] = (top(G['bh_stille']), np.load('raw/bh_stille_warmedit_grid.npy'))
w = G['bh_wurzel']; SHEETS['bh_wurzel'] = (np.vstack([w[0:32], w[96:128]]), np.vstack([w[64:96], w[32:64]]))
k = top(G['bh_klinik']); kw = warmify(k)
for i in [8,9,16,17,25,26,1,3]: setcell(kw,i,veins(cell(kw,i)))
SHEETS['bh_klinik'] = (k, kw)
NAMES = {
 'bh_promenade': ['brick_paving_1','brick_paving_2','brick_paving_3','brick_paving_4','pavilion_floor_1','pavilion_floor_2','paving_edge_north_1','paving_edge_north_2',
   'palm_tub','brick_planter','gas_lamp_base','postcard_rack','glass_walkway_pane_a','glass_walkway_pane_b','glass_walkway_roof_left','glass_walkway_roof_right',
   'kurhaus_cornice_brass','kurhaus_wall_center','kurhaus_wall_left','kurhaus_wall_right','kurhaus_window_1','kurhaus_window_2','kurhaus_double_door','brass_cornice_band',
   'kurhaus_plinth','brass_railing_1','brass_railing_2','stone_steps','flowerbed_curb','drain_grate','bench_base','lamp_light_patch'],
 'bh_kessel': ['workshop_floor_1','workshop_floor_2','workshop_floor_3','coal_chute_top','coal_chute_bottom','coal_heap','laundry_facade_window','laundry_facade_wall',
   'pipe_bridge_horizontal','pipe_bridge_cross','pipe_bend_1','pipe_bend_2','valve_closed','valve_cold','valve_warm','pipe_flange_joint',
   'condensate_puddle_1','condensate_puddle_2','laundry_window','laundry_door','steam_vent_1','steam_vent_2','steam_vent_3','steam_vent_4',
   'brick_wall_1','brick_wall_2','brick_wall_3','brick_wall_4','chimney_base','floor_grate','iron_rail','cobble_edge'],
 'bh_glas': ['greenhouse_wall_1','greenhouse_wall_2','greenhouse_wall_3','greenhouse_wall_4','greenhouse_wall_5','greenhouse_wall_6','greenhouse_door','greenhouse_corner_post',
   'bed_closed_with_sign','bed_open_1','bed_open_2','bed_blossom','gravel_path_1','gravel_path_2','gravel_path_3','gravel_path_4',
   'gutter_horizontal','gutter_cross','gutter_horizontal_2','gutter_vertical','soil_1','soil_2','soil_3','stepping_stones_soil',
   'planting_table','potting_shelf','seed_tray','watering_can','brick_plinth','iron_grate','frost_moss_patch','stepping_stones_moss'],
 'bh_stille': ['hospital_tiles_1','hospital_tiles_2','dining_floorboards_1','dining_floorboards_2','floor_rug_pattern','hospital_tiles_3','floor_edge_north_1','floor_edge_north_2',
   'bed_1','bed_2','slate_board_last_line_erased','bedside_table','wall_left','wall_center','wall_right','wall_corner',
   'window_1','window_2','door','wainscot_wall','dining_table_left','dining_table_middle','dining_table_right','bench',
   'tea_counter','tea_kettle_stove','cupboard','sink','station_desk','filing_shelf','rug','radiator'],
 'bh_klinik': ['pump_floor_plate','riveted_iron_wall','pressure_gauge_blank','pipe_manifold','pump_housing','iron_grating','brick_pillar','iron_door',
   'lab_tiles','lab_tiles_cracked','vat_foundation','lab_drain','lab_counter','vial_shelf','lab_sink','lab_wall_tap',
   'parquet_1','parquet_2','drawing_cabinet_1','drawing_cabinet_2','mother_house_carpet','mother_house_bench','mother_house_window','mother_house_door',
   'pump_floor_plate_2','cracked_floor','pressure_gauge_blank_2','pipe_manifold_2','pump_housing_2','iron_grating_2','brick_pillar_2','iron_door_2'],
 'bh_wurzel': ['gallery_floor_1','gallery_floor_2','gallery_floor_3','gallery_floor_4','rock_wall_1','rock_wall_2','rock_wall_root','rock_wall_3',
   'root_wall_1','root_wall_2','root_wall_3','root_wall_4','rock_ledge','root_wall_5','root_wall_6','rock_ledge_low',
   'root_blank_tag','blank_tag_post','timber_prop','timber_beam','rubble_1','rail_horizontal','rail_vertical','rubble_2',
   'drip_1','drip_2','drip_3','pit_edge_1','pit_edge_2','root_floor_1','root_floor_2','dust_patch'],
}
EXTRA = {}  # anim row (cells 32..39): name -> (kalt_cell, warm_cell)
DEF = {}
def anim_row(name, specs):
    kalt, warm = SHEETS[name]
    rk = np.zeros((16,128,3),np.uint8); rw = np.zeros((16,128,3),np.uint8)
    names=[]; anims={}
    for j,(nm,kc,wc) in enumerate(specs):
        rk[:, j*16:(j+1)*16]=kc; rw[:, j*16:(j+1)*16]=wc; names.append(nm)
    # unused slots: copy first floor cell so sheets are fully opaque and identical in occupancy
    for j in range(len(specs),8):
        rk[:, j*16:(j+1)*16]=cell(kalt,0); rw[:, j*16:(j+1)*16]=cell(warm,0); names.append(f'filler_{j}')
    SHEETS[name]=(np.vstack([kalt,rk]), np.vstack([warm,rw])); NAMES[name]=NAMES[name]+names
isdrop = lambda c: lum(c.astype(float))>=np.percentile(lum(c.astype(float)),85)
iswater = lambda c: (c[...,2].astype(int)>c[...,0].astype(int)+10)&(lum(c.astype(float))>95)
K,W = SHEETS['bh_promenade']
anim_row('bh_promenade',[('glass_walkway_pane_drip_2', cell(K,12), roll_feature(cell(W,12),isdrop,dy=3)),
                         ('glass_walkway_pane_b_drip_2', cell(K,13), roll_feature(cell(W,13),isdrop,dy=3))])
DEF['bh_promenade']={'warm':{'glass_drip':{'frames':[12,32],'frameRate':2,'repeat':-1},'glass_drip_b':{'frames':[13,33],'frameRate':2,'repeat':-1}}}
K,W = SHEETS['bh_kessel']
anim_row('bh_kessel',[(f'steam_vent_anim_{p+1}', cell(K,20), steam(cell(W,20),p)) for p in range(4)])
DEF['bh_kessel']={'warm':{'steam':{'frames':[32,33,34,35],'frameRate':6,'repeat':-1}}}
K,W = SHEETS['bh_glas']
anim_row('bh_glas',[('bed_blossom_2', cell(K,11), roll_feature(cell(W,11), lambda c:(c[...,0].astype(int)>c[...,1].astype(int)+20), dy=-1)),
                    ('gutter_horizontal_flow_2', cell(K,16), roll_feature(cell(W,16),iswater,dx=4)),
                    ('gutter_vertical_flow_2', cell(K,19), roll_feature(cell(W,19),iswater,dy=4))])
DEF['bh_glas']={'warm':{'blossom':{'frames':[11,32],'frameRate':2,'repeat':-1},'gutter_flow_h':{'frames':[16,33],'frameRate':4,'repeat':-1},'gutter_flow_v':{'frames':[19,34],'frameRate':4,'repeat':-1}}}
K,W = SHEETS['bh_klinik']
anim_row('bh_klinik',[(f'root_vein_floor_{p+1}', cell(K,25), veins(cell(W,25)*0+cell(warmify(K),25),p,0.8)) for p in range(4)])
DEF['bh_klinik']={'warm':{'root_veins':{'frames':[32,33,34,35],'frameRate':4,'repeat':-1}}}
K,W = SHEETS['bh_wurzel']
anim_row('bh_wurzel',[(f'root_pulse_{p+1}', cell(K,8), veins(rootpink(cell(W,8)),p,0.9)) for p in range(4)]+
                     [(f'drip_anim_{p+1}', cell(K,24), roll_feature(cell(W,24),isdrop,dy=p*2) if p else cell(W,24)) for p in range(2)])
DEF['bh_wurzel']={'warm':{'root_pulse':{'frames':[32,33,34,35],'frameRate':4,'repeat':-1},'drip':{'frames':[36,37],'frameRate':3,'repeat':-1}}}
anim_row('bh_stille',[])
DEF['bh_stille']={'warm':{}}
import os; os.makedirs('out/tilesets',exist_ok=True)
meta={}
for n,(k,wm) in SHEETS.items():
    for var,a in (('kalt',k),('warm',wm)):
        q = quantize_rgb(a); rgba=np.dstack([q,np.full(q.shape[:2],255,np.uint8)])
        save_png(rgba, f'out/tilesets/{n}_{var}.png')
    meta[n]={'names':NAMES[n],'anims':DEF[n]}
json.dump(meta,open('out/tiles_meta.json','w'),indent=1)
prev=[]
for n in SHEETS:
    a=Image.open(f'out/tilesets/{n}_kalt.png').convert('RGB'); b=Image.open(f'out/tilesets/{n}_warm.png').convert('RGB')
    s=Image.new('RGB',(264,80),(26,28,44)); s.paste(a,(0,0)); s.paste(b,(136,0)); prev.append(s)
P=Image.new('RGB',(264,80*6+5*4),(26,28,44))
for i,s in enumerate(prev): P.paste(s,(0,i*84))
P.resize((P.width*4,P.height*4),Image.NEAREST).save('raw/tiles_preview.png')
print('ok', {n:len(NAMES[n]) for n in NAMES})
