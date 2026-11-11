from tk import *
from ground import *
import math
def seg_dist(px_,py_,ax,ay,bx,by):
    dx,dy=bx-ax,by-ay; L=dx*dx+dy*dy
    t=0 if L==0 else max(0,min(1,((px_-ax)*dx+(py_-ay)*dy)/L))
    return math.hypot(px_-(ax+t*dx),py_-(ay+t*dy)),t
def tube(a,pts,r,K,pulse=None,seed=0,canvas_mask=None):
    """thick root along polyline; warm = plump pink-grey, kalt = thin grey and cracked"""
    H,W=a.shape; m=np.zeros((H,W),bool); along=np.zeros((H,W)); off=np.zeros((H,W))
    lens=[math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]) for i in range(len(pts)-1)]; tot=sum(lens)
    rr=(r+0.6) if not K else max(1,r-0.4)
    for y in range(H):
        for x in range(W):
            best=(1e9,0,0)
            acc=0
            for i in range(len(pts)-1):
                d,t=seg_dist(x+.5,y+.5,*pts[i],*pts[i+1])
                if d<best[0]:
                    # signed offset (left/top lighter)
                    ax,ay=pts[i]; bx,by=pts[i+1]
                    cross=(bx-ax)*(y+.5-ay)-(by-ay)*(x+.5-ax)
                    best=(d,(acc+t*lens[i])/tot, cross)
                acc+=lens[i]
            if best[0]<=rr:
                m[y,x]=True; along[y,x]=best[1]; off[y,x]=best[0]*(1 if best[2]>0 else -1)
    outline(a,m)
    for y,x in zip(*np.nonzero(m)):
        o=off[y,x]
        if K:
            c=S5 if o<-rr*0.3 else (S4 if o<rr*0.4 else N3)
            if (x*7+y*3+seed)%11==0: c=N2   # cracks
        else:
            c=B12 if o<-rr*0.45 else (VI30 if o<rr*0.35 else VI29)
            if abs(o)<0.8 and pulse is not None:
                d=(along[y,x]-pulse)%1.0
                if d<0.07: c=TQ
                elif d<0.16: c=T22
                elif d<0.26: c=T21
        a[y,x]=c
    return m
def cells(v):
    K=v=='kalt'; C={}
    def floor(seed=0):
        a=blank(B10 if K else B9)
        speckle(a,[B11 if K else B10],9,seed+1); speckle(a,[B9 if K else BK],7,seed+2)
        r=rng(seed+40)
        for i in range(3):
            x,y=int(r.integers(1,14)),int(r.integers(1,14))
            if K: a[y,x]=G7; a[y,x+1]=G6; a[y+1,x]=G6   # rime crystals
            else: a[y,x]=BK; a[y,x+1]=BK; a[y+1,x]=BK; a[y+1,x+1]=N2   # damp spots
        return a
    def rock(seed=0):
        a=cobble(base=N3,hi=S4,sh=N2,gap=N1,seed=seed,frost=True) if K else cobble(base=B9,hi=B10,sh=BK,gap=BK,seed=seed,wet=True)
        return a
    C['boden']=floor(1); C['boden_2']=floor(2)
    a=floor(3); speckle(a,[S4,S5] if K else [B10,B11],8,33)
    C['geroell']=a
    for nm,pts in [('boden_wurzel_h',[(-2,9),(5,7),(11,10),(18,8)]),('boden_wurzel_v',[(8,-2),(6,5),(9,11),(7,18)])]:
        a=floor(4); tube(a,pts,2,K,None,5); C[nm]=a
    a=floor(5)
    if K:  # dry: cracked mud where water once stood
        sprite(a,["..X....X..",".X.X..X...","X...XX..X.","..X..X.X..",".X....X..."],{'X':BK},3,5)
    else:
        sprite(a,["..SSSSSS..",".SNNNNNNS.","SNNGNNNNNS",".SNNNNGNS.","..SSSSSS.."],{'S':B9,'N':N2,'G':S5},3,5)
    C['boden_pfuetze']=a
    a=floor(6); rect(a,0,0,16,4,N2 if K else BK); hl(a,0,15,4,N3 if K else B9); hl(a,0,15,5,B9 if K else BK)
    C['boden_wandfuss']=a
    a=floor(7)
    for s in range(4):
        y=s*4; hl(a,0,15,y,B11 if K else B10); hl(a,0,15,y+3,B9 if K else BK)
        for x in (2,9): vl(a,x,y+1,y+3,OL)
    if K: px(a,[(4,0),(5,0),(12,4),(6,8),(13,12)],G7)    # rime on the tread edges
    else: px(a,[(5,2),(6,2),(12,6),(4,14)],N2)            # wet footprints
    C['stufen']=a
    # rock walls
    a=rock(10); rect(a,0,0,16,4,OL); hl(a,0,15,4,N2 if K else BK)
    if K:
        for x in (3,8,12): vl(a,x,5,6+(x%2),G7)
    C['wand_oben']=a
    C['wand']=rock(11)
    for nm,pts,r in [('wand_wurzel_a',[(-2,3),(6,6),(12,4),(18,7)],2),('wand_wurzel_b',[(3,-2),(5,6),(11,10),(13,18)],2)]:
        a=rock(12); tube(a,pts,r,K,None,7); C[nm]=a
    a=rock(13); tube(a,[(-2,4),(8,8),(18,5)],3,K); tube(a,[(8,8),(6,18)],2,K)
    C['wand_wurzelknoten']=a
    a=rock(14); tube(a,[(-2,5),(8,6),(18,4)],2,K)
    obj(a,[".X.","X.X","XXXX".ljust(4)[:3]],{'X':OL},7,6) if False else None
    vl(a,8,8,9,OL)
    obj(a,["XXXXXX","XWWWWX","XWWWWX","XWWWWX","XXXXXX"],{'X':OL,'W':(B14 if not K else G6)},6,10)
    if K: px(a,[(8,11)],G7)
    else: px(a,[(10,13)],S5)  # damp corner, but blank
    C['wand_wurzel_schild']=a
    def dripwall(f=0):
        a=rock(15)
        if K:  # icicles instead of drops
            for x,l in [(3,4),(7,2),(11,5),(13,3)]: vl(a,x,0,l,G7); a[l,x]=BONE
        else:
            for k,x in enumerate((3,8,12)):
                yy=(k*5+f*6)%14+1
                a[yy,x]=G7; a[yy-1,x]=S5
                a[0,x]=S5
            px(a,[(5,15),(6,15),(10,15)],S5)
        return a
    C['wand_tropfen']=dripwall(0)
    a=rock(16)
    obj(a,["XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","CCCCCCCCCCCCCCCC","XXXXXXXXXXXXXXXX"],{'X':OL,'B':B11,'C':B10},0,0)
    for x0 in (1,11): obj(a,["XXXX"]+["XBCX"]*11,{'X':OL,'B':B11,'C':B10},x0,4)
    if K: px(a,[(4,1),(9,1),(2,9)],G7)
    else: tube(a,[(5,5),(8,9),(10,16)],1,K)
    C['wand_stuetze']=a
    # 3x2 root wall slab drawn as one 48x32 picture and cut into cells
    def rootwall(pulse):
        big=np.zeros((32,48),np.int16)
        for cy in range(2):
            for cx in range(3): big[cy*16:cy*16+16,cx*16:cx*16+16]=rock(20+cy*3+cx)
        roots=[([(-3,6),(10,9),(22,5),(34,10),(51,7)],3),([(6,-3),(9,10),(16,20),(14,35)],3),([(30,-3),(28,8),(33,18),(40,26),(51,24)],3),([(-3,24),(8,26),(16,20)],2),([(22,5),(24,14),(33,18)],2)]
        for i,(pts,r) in enumerate(roots):
            tube(big,pts,r,K,(pulse+i*0.23)%1.0 if pulse is not None else None,i)
        return big
    rw=rootwall(None)
    if not K: rw[0:16,16:32]=rootwall(0.0)[0:16,16:32]
    names=['wurzelwand_ol','wurzelwand_om','wurzelwand_or','wurzelwand_ul','wurzelwand_um','wurzelwand_ur']
    for i,nm in enumerate(names):
        cy,cx=divmod(i,3); C[nm]=rw[cy*16:cy*16+16,cx*16:cx*16+16].copy()
    a=floor(8); tube(a,[(8,-3),(7,6),(9,11)],3,K)
    if not K: px(a,[(9,12),(10,13)],VI30); px(a,[(11,14)],T20)
    C['wurzel_spitze']=a
    a=rock(17); tube(a,[(-2,2),(8,3),(18,2)],2,K); vl(a,8,5,7,OL)
    obj(a,["XXXX","XWWX","XWWX","XXXX"],{'X':OL,'W':(B14 if not K else G6)},7,8)
    C['wurzel_schild_haengend']=a
    # ceiling roots, corners, entrance
    a=rock(18); rect(a,0,0,16,3,OL)
    for x,l in [(2,8),(6,5),(10,11),(13,6)]:
        tube(a,[(x,-2),(x+1,l)],1,K)
    C['decke_wurzeln']=a
    a=rock(19); rect(a,0,0,5,16,OL); vl(a,5,0,15,N2 if K else BK)
    C['stollen_ecke_links']=a
    a=rock(19); rect(a,11,0,5,16,OL); vl(a,10,0,15,N2 if K else BK)
    C['stollen_ecke_rechts']=a
    def entrance(top):
        a=rock(30)
        if top:
            obj(a,["...XXXXXXXXXX...","..XBBBBBBBBBBX..",".XBXXXXXXXXXXBX.",".XBXKKKKKKKKXBX."]+[".XBXKKKKKKKKXBX."]*12,{'X':OL,'B':B10,'K':(N1 if K else BK)},0,0)
            tube(a,[(3,-2),(5,6),(4,16)],1,K)
            if not K: px(a,[(8,9),(9,10),(10,12)],T20); px(a,[(9,10)],T22)
            else:
                for x in (6,9,11): vl(a,x,4,6,G7)
        else:
            obj(a,[".XBXKKKKKKKKXBX."]*9+[".XBXEEEEEEEEXBX.",".XXXXXXXXXXXXXX."],{'X':OL,'B':B10,'K':(N1 if K else BK),'E':B9},0,0)
            if not K: hl(a,4,11,9,T19); px(a,[(6,5),(10,7)],T20)
            else: px(a,[(5,9),(9,9)],G6)
        return a
    C['eingang_oben']=entrance(True); C['eingang_unten']=entrance(False)
    def dripfloor(f=0):
        a=floor(9)
        if K: sprite(a,["..GGG..",".GHHHG.","..GGG.."],{'G':G6,'H':G7},4,7)  # frozen drop spot
        else:
            sprite(a,[["..SSS..",".SNNNS.","..SSS.."],[".S...S.","S.SNS.S",".S...S."]][f],{'S':S5,'N':N2},4,7)
            a[3+f*2,7]=G7
        return a
    C['tropfstelle']=dripfloor(0)
    a=floor(10)
    obj(a,["XXXXXXXXXXXX","XBBBBBBBBBBX","XCXCCCCCCXCX","XCCXCCCCXCCX","XCCCXCCXCCCX","XCCCCXXCCCCX","XCCCXCCXCCCX","XXXXXXXXXXXX"],{'X':OL,'B':B11,'C':B10},2,6)
    if K: px(a,[(4,7),(9,7),(12,7)],G7)
    else: tube(a,[(1,15),(4,11),(3,6)],1,K)
    C['kiste']=a
    for i,p in enumerate((0.25,0.5,0.75)):
        rwp=rootwall(p if not K else None)
        C[f'wurzelwand_om_f{i+1}']=rwp[0:16,16:32].copy()
    C['wand_tropfen_f2']=dripwall(1) if not K else dripwall(0)
    C['tropfstelle_f2']=dripfloor(1) if not K else dripfloor(0)
    a=floor(11); speckle(a,[S5,S4] if K else [B11,B10],6,44); C['boden_3']=a
    order=['boden','boden_2','geroell','boden_wurzel_h','boden_wurzel_v','boden_pfuetze','boden_wandfuss','stufen',
           'wand_oben','wand','wand_wurzel_a','wand_wurzel_b','wand_wurzelknoten','wand_wurzel_schild','wand_tropfen','wand_stuetze',
           'wurzelwand_ol','wurzelwand_om','wurzelwand_or','wurzelwand_ul','wurzelwand_um','wurzelwand_ur','wurzel_spitze','wurzel_schild_haengend',
           'decke_wurzeln','stollen_ecke_links','stollen_ecke_rechts','eingang_oben','eingang_unten','tropfstelle','kiste','boden_3',
           'wurzelwand_om_f1','wurzelwand_om_f2','wurzelwand_om_f3','wand_tropfen_f2','tropfstelle_f2']
    # pad to 40 with seamless rock/floor variants that are distinct
    a=rock(40); C['wand_2']=a
    a=floor(12); tube(a,[(-2,12),(6,10),(10,13),(18,11)],1,K); C['boden_wurzel_duenn']=a
    a=rock(41); tube(a,[(-2,10),(18,9)],2,K); C['wand_wurzel_quer']=a
    order+=['wand_2','boden_wurzel_duenn','wand_wurzel_quer']
    return order,[C[k] for k in order]
ANIMS_WARM={'wurzelpuls':{'frames':[17,32,33,34],'frameRate':4,'repeat':-1},'wand_tropfen':{'frames':[14,35],'frameRate':2,'repeat':-1},'tropfstelle':{'frames':[29,36],'frameRate':2,'repeat':-1}}
