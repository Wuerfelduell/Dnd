from tk import *
from ground import *
import math
def cells(v):
    K=v=='kalt'; C={}
    PP=(OL,G7,G6,S4,N3) if K else (OL,B13,B11,B10,B9)   # pipe colours: rimed slate / warm copper-rust
    def cob(seed=21): return cobble(seed=seed,frost=K,wet=not K)
    def pipe_h(a,y=8,flange=True):
        for x in range(16):
            for o in range(-4,4): a[y+o,x]=pipe_shade(o,PP)
        hl(a,0,15,y+4,N2); hl(a,0,15,y+5,N1 if not K else N2)  # cast shadow on the street
        if flange:
            for x in (6,9):
                vl(a,x,y-4,y+3,OL)
            vl(a,7,y-4,y+3,BR24); vl(a,8,y-4,y+3,BR25 if not K else S5)
            a[y-4,7]=OL; a[y-4,8]=OL; a[y+3,7]=OL; a[y+3,8]=OL
        frostify_h(a,y)
        return a
    def frostify_h(a,y):
        if K:
            for x in (2,4,11,13): a[y+4,x]=G7; 
            for x in (4,13): a[y+5,x]=G7; a[y+6,x]=BONE
            for x in range(0,16,3): a[y-3,x]=BONE
        else:
            for x in (3,12): a[y+5,x]=S5
    def pipe_v(a,x=8,flange=True):
        for y in range(16):
            for o in range(-4,4): a[y,x+o]=pipe_shade(o,PP)
        vl(a,x+4,0,15,N2)
        if flange:
            for y in (6,9): hl(a,x-4,x+3,y,OL)
            hl(a,x-3,x+2,7,BR25 if not K else S5); hl(a,x-3,x+2,8,BR24)
        if K:
            for y in (1,5,10,14): a[y,x-3]=BONE
            px(a,[(x+4,11),(x+4,3)],G7)
        return a
    def pipe_bend(a,cx,cy):
        for y in range(16):
            for x in range(16):
                d=math.hypot(x+0.5-cx,y+0.5-cy)
                o=int(math.floor(d-8))
                if -4<=o<=3:
                    # light from top-left: flip shading for bends that open to the top-left
                    oo=o if (cx>8)==(cy>8) else (-1-o)
                    if cx>8 and cy>8: oo=o
                    a[y,x]=pipe_shade(max(-4,min(3,oo)),PP) if o not in (-4,3) else OL
        if K:
            for (x,y) in [(5,8),(8,5),(10,10)]:
                if a[y,x] not in (OL,) and a[y,x]!=N2: pass
        return a
    C['werkstatt_boden']=slabs(rivet=N2) if K else slabs(base=N3,hi=S4,sh=N2,joint=N1,rivet=BR24)
    if K: speckle(C['werkstatt_boden'],[G7],7,101,where=(C['werkstatt_boden']==N2))
    else: px(C['werkstatt_boden'],[(3,4),(4,4),(11,12)],BK)
    C['kopfstein']=cob(21)
    a=cob(22)
    for (x,y) in [(2,2),(3,2),(9,6),(10,6),(10,7),(5,11),(13,13),(14,13),(6,12)]: a[y,x]=BK if not K else N2
    C['kopfstein_kohlenstaub']=a
    a=cob(23)
    if K: sprite(a,["..GGGGGGGG..",".GHHHHHHHHGG","GHHWHHHHHHHG","GHHHHHHGHHHG",".GHHHHHHHHG.","..GGGGGGGG.."],{'G':G6,'H':G7,'W':BONE},2,5); px(a,[(6,7),(7,8),(8,8),(9,9)],G6)
    else: sprite(a,["..SSSSSSSS..",".SNNNNNNNNSS","SNNGNNNNNNNS","SNNNNNNNGNNS",".SNNNNNNNNS.","..SSSSSSSS.."],{'S':S4,'N':N2,'G':S5},2,5); px(a,[(7,2),(8,1),(8,3),(9,2)],G6)
    C['kondensat_pfuetze']=a
    a=blank(N1)
    for y in range(0,16,3): hl(a,0,15,y,S4 if not K else S5)
    for x in range(0,16,4): vl(a,x,0,15,N3)
    if K: speckle(a,[G7],12,105,where=(a!=N1))
    else: px(a,[(5,4),(6,4),(9,10),(10,10)],N2)
    C['gitterrost']=a
    a=cob(24); rect(a,0,0,16,5,N2); hl(a,0,15,5,S5 if K else S4); hl(a,0,15,6,N3)
    for x in range(1,16,5): rect(a,x,0,3,4,N3); hl(a,x,x+2,0,S4)
    if K: px(a,[(2,5),(7,5),(12,5),(3,1),(9,2)],G7)
    C['bordstein_n']=a
    C['bordstein_s']=np.flipud(a).copy()
    # pipes
    C['rohr_h']=pipe_h(cob(25))
    C['rohr_v']=pipe_v(cob(26))
    C['rohr_bogen_so']=pipe_bend(cob(27),16,16)
    C['rohr_bogen_sw']=pipe_bend(cob(28),0,16)
    C['rohr_bogen_no']=pipe_bend(cob(29),16,0)
    C['rohr_bogen_nw']=pipe_bend(cob(30),0,0)
    a=pipe_h(cob(31),flange=False); 
    for y in range(12,16):
        for o in range(-4,4): a[y,8+o]=pipe_shade(o,PP)
    hl(a,4,11,12,OL)
    C['rohr_t']=a
    a=cob(32); rect(a,6,7,4,9,N2); vl(a,6,7,15,OL); vl(a,9,7,15,OL); vl(a,7,7,15,S4 if K else N3)
    rect(a,4,14,8,2,N2); hl(a,4,11,14,OL)
    pipe_h(a,4,flange=False)
    C['rohrbruecke_stuetze']=a
    # valves: three clearly different states as own cells
    def valve(state):
        a=cob(40)
        if state=='zu': P=(OL,S5,S4,N3,N2)
        elif state=='kalt': P=(OL,G7,G6,S4,N3)
        else: P=(OL,B13,B11,B10,B9)
        for x in range(16):
            for o in range(-4,4): a[9+o,x]=pipe_shade(o,P)
        hl(a,0,15,13,N2); hl(a,0,15,14,N1)
        # valve body
        obj(a,["XXXXXX","XBBBBX","XBCCBX","XBCCBX","XXXXXX"],{'X':OL,'B':BR24 if state!='zu' else N3,'C':BR25 if state=='warm' else (S5 if state=='kalt' else N2)},5,7)
        # spindle + wheel on top
        vl(a,7,3,6,OL); vl(a,8,3,6,OL)
        if state=='zu':   # wheel dark, chained shut with a rust-red lock tag
            obj(a,["XXXXXXXX","XNNNNNNX","XNXXXXNX","XNNNNNNX","XXXXXXXX"],{'X':OL,'N':N3},4,0)
            px(a,[(3,2),(12,2),(2,3),(13,3),(2,4)],WN); obj(a,["XX","WW"],{'X':OL,'W':WN},1,5)
            hl(a,1,14,9,OL)  # bar across the pipe = closed
        elif state=='kalt':  # wheel open, pipe and wheel rimed, icicles
            obj(a,["XXXXXXXX","XGGGGGGX","XGXGGXGX","XGGGGGGX","XXXXXXXX"],{'X':OL,'G':G6},4,0)
            px(a,[(5,1),(7,1),(9,1),(10,3)],BONE)
            for x in (2,11,14): vl(a,x,13,14+(x%2),G7); a[15,x]=BONE
            px(a,[(1,6),(4,6),(12,6)],BONE)
        else:  # warm: polished brass wheel, glowing seam, little steam
            obj(a,["XXXXXXXX","XAAAAAAX","XAXAAXAX","XAAAAAAX","XXXXXXXX"],{'X':OL,'A':BR25},4,0)
            px(a,[(5,1),(6,1)],AM27)
            hl(a,0,4,9,AM26); hl(a,11,15,9,AM26)
            sprite(a,["G.","GG",".H"],{'G':G7,'H':G6},13,1); sprite(a,[".G","GH"],{'G':G7,'H':G6},1,2)
        return a
    C['ventil_zu']=valve('zu'); C['ventil_kalt']=valve('kalt'); C['ventil_warm']=valve('warm')
    def vent(f):
        a=cob(41)
        obj(a,["XXXXXXXX","XNSSSSNX","XNOOOONX","XNOOOONX","XNSSSSNX","XXXXXXXX"],{'X':OL,'N':N3,'S':S4,'O':N1},4,9)
        if K:   # frozen shut: ice plug and icicles, no steam
            rect(a,6,11,4,2,G6); px(a,[(6,11),(8,12)],G7); px(a,[(4,15),(11,15)],G7); px(a,[(7,9),(8,9)],BONE)
            return a
        shapes=[["..........","..........","..........","....GG....","...GHHG...","..GHHHHG..","...GHHG...","....GG...."],
                ["..........","....GG....","...GHHG...","..GHHHHGG.","..GHHHHHHG","...GHHHHG.","....GHG...",".....G...."],
                ["...GG.....","..GHHG.GG.","..GHHHGHHG","...GHHHHG.","....GG.G..",".....G....","....G.....",".........."],
                ["..G...G...",".GHG.GHG..","..G...G...","....G.....","...G..G...","..........","....G.....",".........."]]
        sprite(a,shapes[f],{'G':G6,'H':G7},3,1)
        px(a,[(7,10),(8,10)],G7)
        return a
    C['dampfaustritt']=vent(0)
    a=cob(42)
    obj(a,["XXXXXXXXXXXX","XSSSSSSSSSSX","XNKKKKKKKKNX","XNKKCKKKKKNX","XNKKKKKCKKNX","XNKCKKKKKKNX","XNKKKKKKKKNX","XNKKKKCKKKNX","XNKKKKKKKKNX","XNKKCKKKKKNX","XNKKKKKKKCNX","XNKKKKKKKKNX","XNKKKCKKKKNX","XNKKKKKKKKNX","XNKKKKKKCKNX","XNKKKKKKKKNX"],{'X':OL,'S':S5,'N':N3,'K':BK,'C':(G7 if K else N2)},2,0)
    if not K: px(a,[(6,8),(9,13)],AM26)
    C['kohlenrutsche']=a
    a=cob(43)
    obj(a,["XNKKKKKKKKNX","XNKKCKKKKKNX","XNKKKKKKKKNX","XNNNNNNNNNNX","XXXXXXXXXXXX"],{'X':OL,'N':N3,'K':BK,'C':(G7 if K else N2)},2,0)
    obj(a,["....XXXXXX....","..XXKKKKKKXX..",".XKKCKKKKCKKX.","XKKKKKKKKKKKKX"],{'X':OL,'K':BK,'C':(G7 if K else N2)},1,6)
    rect(a,1,10,14,3,BK); hl(a,1,14,13,OL); vl(a,0,9,12,OL); vl(a,15,9,12,OL)
    if K: px(a,[(3,8),(4,10),(9,9),(12,11),(6,11)],G7)
    else: px(a,[(5,9),(10,11)],N2)
    C['kohlenhaufen']=a
    # pipe bridge over the lane: riveted girder seen from above
    a=cob(44); pipe_h(a,5,flange=False)
    rect(a,0,10,16,3,N3); hl(a,0,15,10,S4); hl(a,0,15,12,N2); hl(a,0,15,13,OL)
    for x in range(1,16,4): a[11,x]=BR24
    hl(a,0,15,14,N1); hl(a,0,15,15,N2)
    C['rohrbruecke_traeger']=a
    # laundry facade (sooty brick)
    def lbrick(seed=50): 
        a=bricks(v,base=B9,hi=B10,sh=BK,mortar=N2,seed=seed)
        if K: 
            for y in range(16):
                for x in range(16):
                    if a[y,x]==B10 and (x+y*3)%5==0: a[y,x]=G6
            px(a,[(2,3),(9,7),(13,11)],G7)
        else:
            for y in range(4,12): a[y,6]=BK if a[y,6]!=N2 else N2   # soot streak from the vent
            px(a,[(11,13),(12,13),(11,14)],N3)
        return a
    a=lbrick(); rect(a,0,0,16,4,N2); hl(a,0,15,4,N3); hl(a,0,15,5,OL)
    for x in range(0,16,2): a[2,x]=N3
    if K:
        for x,l in [(2,3),(6,2),(9,4),(13,2)]: vl(a,x,6,5+l,G7); a[5+l,x]=BONE
        hl(a,0,15,0,G6)
    else:
        for x in (4,11): vl(a,x,6,7,S5)
    C['waescherei_traufe']=a
    C['waescherei_wand']=lbrick(51)
    a=lbrick(52)
    if K: L={'X':OL,'F':N3,'G':S4,'H':G6,'W':G7,'O':N2}
    else: L={'X':OL,'F':N3,'G':AM26,'H':AM27,'W':G6,'O':N2}
    sprite(a,["XXXXXXXXXXXX","XFFFFFFFFFFX","XGGGOGGGOGGX" if K else "XWWWOWWWOWWX","XGHGOGGGOGGX" if K else "XGGGOHWGOGGX","XGGGOGHGOGWX" if K else "XHGGOGGGOWGX","XOOOOOOOOOOX","XGGGOGGHOGGX" if K else "XGGHOGWGOGGX","XWGGOGGGOGGX" if K else "XGGGOGGGOGHX","XWWGOGGGOGWX" if K else "XGGGOGGGOGGX","XXXXXXXXXXXX","FFFFFFFFFFFF"],L,2,2)
    C['waescherei_fenster']=a
    a=lbrick(53)
    sprite(a,["..XXXXXXXXXXXX..",".XNNNNNNNNNNNNX.","XNBBBBBBBBBBBBNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBBBBBBBBBBBBNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBBBBBBBBBBBBNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX"],{'X':OL,'N':N3,'B':(S4 if K else B10),'C':(N3 if K else B9)},0,0)
    if K: px(a,[(3,3),(7,7),(11,3),(4,12),(12,10)],G7)
    C['waescherei_tor_oben']=a
    a=lbrick(54)
    sprite(a,["XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBBBBBBBBBBBBNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNBBBBBBBBBBBBNX","XNBCBCBCBCBCBCNX","XNBCBCBCBCBCBCNX","XNNNNNNNNNNNNNNX","SSSSSSSSSSSSSSSS","RRRRRRRRRRRRRRRR","RRRRRRRRRRRRRRRR","SSSSSSSSSSSSSSSS","NNNNNNNNNNNNNNNN"],{'X':OL,'N':N3,'B':(S4 if K else B10),'C':(N3 if K else B9),'S':(G6 if K else S4),'R':(S5 if K else N3)},0,0)
    if K: px(a,[(1,11),(2,11),(13,11),(14,12),(7,12)],G7); px(a,[(0,10),(15,10)],BONE)
    else: hl(a,2,13,10,BK); px(a,[(3,12),(4,12),(10,13)],S4); sprite(a,[".G.G.","G.G.G"],{'G':G6},5,8)
    C['waescherei_tor_unten']=a
    a=lbrick(55)
    obj(a,["XXXXXXXXXX","XNNNNNNNNX","XOOOOOOOOX","XNNNNNNNNX","XOOOOOOOOX","XNNNNNNNNX","XOOOOOOOOX","XXXXXXXXXX"],{'X':OL,'N':N3,'O':N1},3,6)
    if K: px(a,[(5,13),(9,13),(11,13)],G7); vl(a,6,14,15,G7)
    else: sprite(a,["...GG...","..GHHG.G",".GHHHHG.","..GHHG..","...GG..."],{'G':G6,'H':G7},4,0)
    C['waescherei_lueftung']=a
    a=lbrick(56); rect(a,0,8,16,8,S4); hl(a,0,15,8,S5); hl(a,0,15,15,N2)
    for x in (0,5,11): vl(a,x,9,14,N3)
    hl(a,0,15,12,N3)
    if K: hl(a,0,15,14,G7); px(a,[(3,13),(8,13),(14,13)],G7)
    else: rect(a,0,13,16,2,N2); px(a,[(4,9),(4,10),(9,9)],N3)
    C['waescherei_sockel']=a
    a=lbrick(57)
    obj(a,["XXXXXXXXXXXX","XBBBBBBBBBBX","XBCCCCCCCCBX","XBCCCCCCCCBX","XBCCCCCCCCBX","XBBBBBBBBBBX","XXXXXXXXXXXX","..X......X..","..X......X.."],{'X':OL,'B':BR24,'C':(G6 if K else B13)},2,3)
    if K: px(a,[(4,5),(8,6),(11,7)],G7)
    else: px(a,[(5,6),(6,6),(10,7)],B12)
    C['waescherei_schild']=a
    C['dampfaustritt_f1']=vent(1); C['dampfaustritt_f2']=vent(2); C['dampfaustritt_f3']=vent(3)
    a=cob(60); rect(a,6,0,4,16,N2); vl(a,6,0,15,S4); vl(a,9,0,15,N3)
    if K: 
        rect(a,7,0,2,16,G6); px(a,[(7,2),(8,6),(7,11),(8,14)],G7); px(a,[(8,4),(7,9)],BONE)
    else: rect(a,7,0,2,16,N1); px(a,[(7,3),(8,8),(7,13)],S5); px(a,[(8,10)],G6)
    C['kondensat_rinne']=a
    a=pipe_h(cob(61),flange=False)
    for x in range(1,16,3): vl(a,x,5,10,B13 if not K else BONE)
    for x in range(2,16,3): vl(a,x,5,10,B12 if not K else G7)
    hl(a,0,15,4,OL); hl(a,0,15,11,OL)
    C['rohr_isoliert']=a
    a=pipe_v(cob(62)); 
    C['rohr_v_manometer']=a
    obj(a,["XXXX","XWWX","XWOX","XXXX"],{'X':OL,'W':(G7 if K else B14),'O':OL},10,5)
    a=cob(63)
    obj(a,["XXXXXXXXXXXX","XSBSBSBSBSBX","XBSBSBSBSBSX","XSBSBSBSBSBX","XBSBSBSBSBSX","XXXXXXXXXXXX"],{'X':OL,'S':N3,'B':N1},2,5)
    if K: px(a,[(4,6),(8,7),(10,8)],G7)
    else: sprite(a,["..G.","G.G.",".G.."],{'G':G6},6,2)
    C['abflussgitter']=a
    a=slabs(rivet=N2) if K else slabs(base=N3,hi=S4,sh=N2,joint=N1,rivet=BR24)
    obj(a,["XXXXXXXXXXXX","XBBBBBBBBBBX","XCCCCCCCCCCX","XXXXXXXXXXXX",".X........X.",".X........X.",".X........X."],{'X':OL,'B':B11,'C':B10},2,5)
    if K: px(a,[(4,6),(9,6)],G7)
    else: obj(a,["XX","XX"],{'X':BR25},5,4,ol=False); px(a,[(10,5)],S5)
    C['werkbank']=a
    order=['werkstatt_boden','kopfstein','kopfstein_kohlenstaub','kondensat_pfuetze','gitterrost','bordstein_n','bordstein_s','werkbank',
           'rohr_h','rohr_v','rohr_bogen_so','rohr_bogen_sw','rohr_bogen_no','rohr_bogen_nw','rohr_t','rohrbruecke_stuetze',
           'ventil_zu','ventil_kalt','ventil_warm','dampfaustritt','kohlenrutsche','kohlenhaufen','rohrbruecke_traeger','rohr_isoliert',
           'waescherei_traufe','waescherei_wand','waescherei_fenster','waescherei_tor_oben','waescherei_tor_unten','waescherei_lueftung','waescherei_sockel','waescherei_schild',
           'dampfaustritt_f1','dampfaustritt_f2','dampfaustritt_f3','kondensat_rinne','rohr_v_manometer','abflussgitter','kopfstein','kopfstein']
    order=order[:38]+['kopfstein_2','werkstatt_boden_2']
    C['kopfstein_2']=cob(70)
    b=C['werkstatt_boden'].copy(); px(b,[(10,2),(11,2),(11,3),(2,10)],BK if not K else G7); C['werkstatt_boden_2']=b
    return order,[C[k] for k in order]
ANIMS_WARM={'dampf':{'frames':[19,32,33,34],'frameRate':6,'repeat':-1}}
