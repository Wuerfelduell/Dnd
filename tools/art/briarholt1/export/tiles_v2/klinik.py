from tk import *
from ground import *
# root-vein path across a floor cell (seamless: enters/leaves at matching edges)
VEIN=[(0,9),(1,9),(2,8),(3,8),(4,8),(5,7),(6,7),(7,7),(8,8),(9,8),(10,9),(11,9),(12,9),(13,8),(14,8),(15,9),
      (7,6),(7,5),(8,4),(8,3),(9,2),(9,1),(9,0),(8,15),(8,14),(9,13),(10,12),(10,11),(11,10)]
BR2=[(4,9),(4,10),(3,11),(3,12),(12,8),(13,7),(13,6)]
def veins(a,K,f=0,strength=1):
    path=VEIN+BR2
    for i,(x,y) in enumerate(path):
        if K: a[y,x]=B9 if i%3 else N2   # dry dead root crack
        else:
            a[y,x]=T20
            if (i-f*4)%16 in (0,1) and strength: a[y,x]=T22
            if (i-f*4)%16==0 and strength>1: a[y,x]=TQ
    return a
def cells(v):
    K=v=='kalt'; C={}
    def iron(seed=0):
        a=blank(N3 if not K else S4)
        for y in range(0,16,4):
            for x in range(0,16,4):
                o=2 if (y//4)%2 else 0
                a[y+1,(x+o)%16]=S4 if not K else S5; a[y+1,(x+o+1)%16]=S5 if not K else G6
        for y in range(0,16,8): hl(a,0,15,y,N2)
        for x in range(0,16,8): vl(a,x,0,15,N2)
        if K: speckle(a,[G7],6,seed+5)
        return a
    def labt(seed=0):
        a=tiles_floor(G7 if not K else G6, G6 if not K else S5, S5 if not K else S4, 4, checker=False)
        for (x,y) in [(4,4),(12,12)]: rect(a,x,y,3,3,T21 if not K else S4)
        if K: px(a,[(1,0),(9,8)],BONE)
        else: px(a,[(6,9),(7,9),(13,2)],G6)
        return a
    def parkett(seed=0):
        a=blank(B11 if not K else B10)
        for y in range(16):
            for x in range(16):
                q=((x//4)+(y//4))%2
                if q==0: 
                    if x%4==3: a[y,x]=B9
                    elif x%4==0: a[y,x]=B12 if not K else B11
                else:
                    if y%4==3: a[y,x]=B9
                    elif y%4==0: a[y,x]=B12 if not K else B11
        if K: speckle(a,[G6],6,seed+8,where=(a==B9))
        else:
            r=rng(seed+3); x,y=int(r.integers(2,12)),int(r.integers(2,12))
            rect(a,x,y,3,2,B12); a[y,x]=B13   # worn light patch where people walk
            if seed: px(a,[(x+5,(y+6)%16),(x+6,(y+6)%16)],B10)
        return a
    def earth(seed=0):
        a=blank(B9 if not K else B10)
        speckle(a,[B10 if not K else B11],10,seed+1); speckle(a,[BK if not K else B9],8,seed+2)
        if K: speckle(a,[G6],5,seed+3); px(a,[(3,3),(4,3),(11,10)],G7)
        else: px(a,[(5,6),(6,6),(5,7),(12,12),(13,12)],BK); px(a,[(9,2),(10,3)],T19)
        return a
    C['pumpen_boden']=iron(1)
    C['pumpen_boden_adern']=veins(iron(2),K,0,2)
    C['labor_fliesen']=labt(); C['labor_fliesen_adern']=veins(labt(),K,1,1)
    C['parkett']=parkett(); C['parkett_2']=parkett(3)
    C['stollen_boden']=earth(4); C['stollen_boden_adern']=veins(earth(5),K,2,1)
    # pump station
    def pump(top):
        a=iron(10)
        if top:
            obj(a,["....XXXXXXXX....","...XNNNNNNNNX...","..XNSSSSSSSSNX..","..XNSXXXXXXSNX..","..XNSXWWWWXSNX..","..XNSXWWWWXSNX..","..XNSXXXXXXSNX..","..XNSSSSSSSSNX..",".XXNNNNNNNNNNXX.","XNNNNBNNNNBNNNNX","XNSSSSSSSSSSSSNX","XNSSSSSSSSSSSSNX","XNSBSSSSSSSSBSNX","XNSSSSSSSSSSSSNX","XNSSSSSSSSSSSSNX","XNSSSSSSSSSSSSNX"],{'X':OL,'N':N2,'S':N3,'W':(B14 if not K else G6),'B':BR24},0,0)
            if K: px(a,[(6,5),(7,5)],OL); px(a,[(4,2),(11,2),(3,10),(12,11)],G7)   # needle at rest
            else: px(a,[(8,4),(9,4)],OL); px(a,[(7,5)],OL); sprite(a,["G.G",".G."],{'G':G7},13,0); px(a,[(5,10),(6,10)],B10)
        else:
            obj(a,["XNSSSSSSSSSSSSNX","XNSSSSSSSSSSSSNX","XNSBSSSSSSSSBSNX","XNSSSSSSSSSSSSNX","XNSSOOOOOOOOSSNX","XNSSOAAAAAAOSSNX","XNSSOOOOOOOOSSNX","XNSSSSSSSSSSSSNX","XNNNNNNNNNNNNNNX","XXXXXXXXXXXXXXXX"],{'X':OL,'N':N2,'S':N3,'B':BR24,'O':OL,'A':(AM26 if not K else N2)},0,0)
            if K: px(a,[(3,12),(6,12),(12,12)],G7); hl(a,2,13,11,G7)
            else: px(a,[(4,11),(5,12)],N2); px(a,[(6,5),(9,5)],AM27)
        return a
    C['pumpe_oben']=pump(True); C['pumpe_unten']=pump(False)
    def gwall(top=False):
        a=blank(N3 if not K else S4)
        for y in range(0,16,8): hl(a,0,15,y+7,N2); hl(a,0,15,y,S4 if not K else S5)
        for x in range(0,16,8): vl(a,x,0,15,N2)
        for y in (2,5,10,13):
            for x in (2,5,10,13): a[y,x]=BR24 if not K else N2
        if top: rect(a,0,0,16,4,N2); hl(a,0,15,3,OL); hl(a,0,15,4,S4)
        if K:
            for x in (3,9,14): vl(a,x,4 if top else 0,6 if top else 2,G7)
            px(a,[(6,12),(11,9)],G7)
        else:
            px(a,[(4,9),(4,10),(12,3)],N2)  # condensate runs
        return a
    a=gwall()
    obj(a,["..XXXXXX..",".XWWWWWWX.","XWWWWWWWWX","XWWWOWWWWX","XWWOWWWWWX","XWWWWWWWWX",".XWWWWWWX.","..XXXXXX..","....XX....","....XX...."],{'X':BR24,'W':(B14 if not K else G6),'O':OL},3,2)
    if K: px(a,[(6,6),(5,7)],OL); px(a,[(7,5),(8,6)],(B14 if not K else G6)); px(a,[(5,3),(9,4)],G7)   # needle down
    else: px(a,[(9,4),(10,5)],OL); px(a,[(7,7),(8,6)],OL); px(a,[(6,7)],WN)   # needle up
    C['manometer']=a
    C['gusswand_oben']=gwall(True); C['gusswand']=gwall()
    a=iron(11)
    for y in range(16):
        for o in range(-4,4): a[y,8+o]=pipe_shade(o,(OL,G6,S5,S4,N3) if not K else (OL,G7,G6,S5,S4))
    for y in (3,11): hl(a,4,11,y,OL); a[y-1,5]=BR24; a[y-1,10]=BR24
    if K: px(a,[(5,6),(5,7),(5,14)],BONE)
    else: px(a,[(12,6),(12,7)],S5)
    C['rohr_gross_v']=a
    a=gwall()
    rect(a,1,8,14,6,N2); hl(a,1,14,8,S4); hl(a,1,14,13,OL)
    for i,x in enumerate((3,7,11)):
        up=(not K) and i!=1
        if up: vl(a,x,3,8,OL); vl(a,x+1,3,8,S5); obj(a,["XX","WW"],{'X':OL,'W':WN},x,2)
        else: vl(a,x,8,11,OL); vl(a,x+1,8,11,S5); obj(a,["XX","WW"],{'X':OL,'W':S4 if K else WN},x,11)
    C['hebelbank']=a
    a=blank(N1)
    for y in range(0,16,2): hl(a,0,15,y,N3 if not K else S4)
    for x in (0,15): vl(a,x,0,15,N2)
    vl(a,1,0,15,S4); vl(a,14,0,15,N2)
    if K: speckle(a,[G7],8,40,where=(a!=N1))
    else: px(a,[(4,4),(10,9)],T20)
    C['laufsteg']=a
    # laboratory
    def found(side):
        a=labt()
        rows=["......XXXXXX","....XXSSSSSS","...XSSNNNNNN","..XSNNNNNNNN",".XSNNNNNNNNN",".XSNNKKKKKKK","XSNNKOOOOOOO","XSNNKOOOOOOO","XSNNKOOOOOOO","XSNNKKKKKKKK",".XSNNNNNNNNN",".XSSNNNNNNNN","..XXSSSSSSSS","....XXXXXXXX"]
        sprite(a,rows,{'X':OL,'S':S5,'N':S4,'K':OL,'O':(AM26 if not K else N2)},0,1)
        if not K: px(a,[(6,8),(8,7),(10,9),(11,7)],AM27); px(a,[(7,9),(9,8)],WN)
        else: px(a,[(6,8),(9,9)],S4); px(a,[(3,4),(5,2),(8,13)],G7)
        if side: a=mirror(a)
        return a
    C['sudkessel_fundament_links']=found(0); C['sudkessel_fundament_rechts']=found(1)
    def ltable(side):
        a=labt()
        sprite(a,["XXXXXXXXXXXXXXXX","WWWWWWWWWWWWWWWW","WWWWWWWWWWWWWWWW","XXXXXXXXXXXXXXXX","NNNNNNNNNNNNNNNN","XXXXXXXXXXXXXXXX"],{'X':OL,'W':G7 if not K else G6,'N':S4},0,7)
        if side==0: vl(a,0,7,12,OL)
        else: vl(a,15,7,12,OL)
        if side==0:
            obj(a,["..X..","..X..",".XLX.","XLLLX","XXXXX"],{'X':OL,'L':(TQ if not K else G7)},3,3)
            obj(a,["XX","LL","LL"],{'X':OL,'L':(T21 if not K else S5)},10,5)
            if not K: px(a,[(5,2),(4,1)],G7)
        else:
            obj(a,["XXXXX","XPPPX","XXXXX"],{'X':OL,'P':B14},3,5)
            obj(a,["X.","XX","LX"],{'X':OL,'L':(VI30 if not K else S5)},10,4)
        return a
    C['labortisch_links']=ltable(0); C['labortisch_rechts']=ltable(1)
    def tilewall(top=False):
        a=tiles_floor(G7 if not K else G6, G7 if not K else G6, G6 if not K else S5, 4, checker=False)
        hl(a,0,15,11,T21 if not K else S4)
        if top: rect(a,0,0,16,4,S4); hl(a,0,15,3,N3); hl(a,0,15,4,G7 if not K else G6)
        if K: px(a,[(2,13),(3,14),(9,13),(13,14)],BONE)
        else: px(a,[(6,5),(6,6),(6,7)],G6)
        return a
    a=tilewall()
    obj(a,["XXXXXXXXXXXX","XNNNNNNNNNNX","XNOOOOOOOONX","XNOOOOOOOONX","XNNNNNNNNNNX","X.X......X.X"],{'X':OL,'N':S5,'O':(N2 if K else G6)},2,1)
    if not K: sprite(a,["G.G","GG.",".G."],{'G':G7},6,2)
    C['abzug']=a
    C['fliesenwand_oben']=tilewall(True); C['fliesenwand']=tilewall()
    a=labt()
    obj(a,["XXXXXXXX","XNONONOX","XONONONX","XNONONOX","XXXXXXXX"],{'X':OL,'N':S4,'O':N1},4,5)
    if not K: px(a,[(5,7),(9,7)],T21); px(a,[(6,4),(9,4)],S5)
    else: px(a,[(5,6),(8,7)],G7)
    C['ausguss']=a
    # mother house (drawing room)
    def chest(top):
        a=parkett(20)
        if top:
            obj(a,["XXXXXXXXXXXXXX","XBBBBBBBBBBBBX","XCCCCCCCCCCCCX","XCCCCCOOCCCCCX","XDDDDDDDDDDDDX","XCCCCCOOCCCCCX","XDDDDDDDDDDDDX","XCCCCCOOCCCCCX","XDDDDDDDDDDDDX"],{'X':OL,'B':B11,'C':B10,'D':B9,'O':BR25},1,7)
            if K: px(a,[(3,8),(9,8),(12,8)],G7)
            else:  # top drawer pulled out, plan sheet on it
                obj(a,["XXXXXXXXXXXXXXXX","XPPPPPPPPPPPPPPX","XPQQPQPPQQQPQPPX","XXXXXXXXXXXXXXXX"],{'X':OL,'P':B14,'Q':S5},0,3)
        else:
            obj(a,["XCCCCCOOCCCCCX","XDDDDDDDDDDDDX","XCCCCCOOCCCCCX","XDDDDDDDDDDDDX","XCCCCCOOCCCCCX","XDDDDDDDDDDDDX","XXXXXXXXXXXXXX","XX..........XX"],{'X':OL,'C':B10,'D':B9,'O':BR25},1,0)
            if K: px(a,[(4,5),(10,1)],G7)
        return a
    C['zeichenschrank_oben']=chest(True); C['zeichenschrank_unten']=chest(False)
    a=parkett(21)
    obj(a,["XXXXXXXXXXXXXXXX","XPPPPPPPPPPPPPPX","XPQQQPPQPPQQPPPX","XPQPPPQQQPPPQPPX","XPPPPPPPPPPPPPPX","XXXXXXXXXXXXXXXX","XBBBBBBBBBBBBBBX","XXXXXXXXXXXXXXXX","..X..........X..","..X..........X.."],{'X':OL,'P':(B14 if not K else G6),'Q':(S4 if not K else S5),'B':B10},0,5)
    if not K: obj(a,["XXX",".X.",".X."],{'X':OL},11,1); px(a,[(11,0),(12,0),(13,0)],AM27); px(a,[(10,6),(14,6)],AM26)
    else: px(a,[(3,7),(9,8)],G7)
    C['zeichenpult']=a
    def paper(top=False):
        a=blank(M16 if not K else S4)
        for x in range(1,16,4): vl(a,x,0,15,M15 if not K else N3)
        for x in range(3,16,4):
            for y in range(1,16,4): a[y,x]=M17 if not K else S5
        rect(a,0,11,16,5,B10); hl(a,0,15,11,B12); hl(a,0,15,15,B9)
        if top: rect(a,0,0,16,3,B9); hl(a,0,15,3,B11)
        if K: px(a,[(2,12),(6,13),(11,12),(14,13)],G7); px(a,[(5,6),(12,3)],G6)
        return a
    C['tapete_oben']=paper(True); C['tapete']=paper()
    a=paper()
    obj(a,["XXXXXXXXXXXXXX","XSSSSSSSSSSSSX","XSXXXXXXXXXXSX","XSXKKKKKKKKXSX","XSXKKKKKKKKXSX","XSXKKKKKKKKXSX","XSXKKKKKKKKXSX","XSXXXXXXXXXXSX","XSSSSSSSSSSSSX","XXXXXXXXXXXXXX"],{'X':OL,'S':(S5 if K else B13),'K':BK},1,5)
    if not K: sprite(a,[".A..A..",".AB.AB.","ABBABBA","BBBBBBB"],{'A':AM27,'B':AM26},4,8)
    else: px(a,[(5,11),(6,11),(8,11)],S4); px(a,[(9,11)],G6); px(a,[(2,6),(12,6)],G7)
    C['kamin']=a
    def tunnel(top):
        a=earth(30)
        if top:
            obj(a,["..XXXXXXXXXXXX..",".XBBBBBBBBBBBBX.","XBXXXXXXXXXXXXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX"],{'X':OL,'B':B10,'K':(N1 if K else BK)},0,0)
            if K:
                for x in (4,6,9,12): vl(a,x,3,3+(x%3)+1,G7); 
            else: px(a,[(5,9),(6,10),(9,8),(10,9),(11,10)],T20); px(a,[(6,9),(10,10)],T22)
        else:
            obj(a,["XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXKKKKKKKKKKXBX","XBXEEEEEEEEEEXBX","XBXEEEEEEEEEEXBX","XXXXXXXXXXXXXXXX"],{'X':OL,'B':B10,'K':(N1 if K else BK),'E':(B9 if K else B9)},0,0)
            if K: px(a,[(4,8),(8,9),(11,8)],G7)
            else:  # warm breath of the tunnel: roots and a faint glow on the threshold
                px(a,[(4,4),(5,5),(5,6),(6,7),(10,5),(11,6),(11,7)],T20); px(a,[(5,6),(11,6)],T22); hl(a,3,12,9,T19)
        return a
    C['stollen_eingang_oben']=tunnel(True); C['stollen_eingang_unten']=tunnel(False)
    C['pumpen_boden_adern_f1']=veins(iron(2),K,1,2); C['pumpen_boden_adern_f2']=veins(iron(2),K,2,2); C['pumpen_boden_adern_f3']=veins(iron(2),K,3,2)
    C['parkett_adern']=veins(parkett(22),K,0,0)
    a=bricks(v,base=B10,hi=B11,sh=BK,mortar=B9,seed=31,bw=8,bh=4) if not K else bricks(v,base=S4,hi=S5,sh=N3,mortar=N2,seed=31,bw=8,bh=4)
    if K: px(a,[(2,2),(9,7),(12,12)],G7)
    else: px(a,[(5,4),(6,5),(12,9)],T20)
    C['stollen_wand']=a
    a=earth(32)
    obj(a,["XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","CCCCCCCCCCCCCCCC","XXXXXXXXXXXXXXXX"],{'X':OL,'B':B11,'C':B10},0,0)
    for x0 in (1,11):
        obj(a,["XXXX","XBCX","XBCX","XBCX","XBCX","XBCX","XBCX","XBCX","XBCX","XBCX","XBCX","XXXX"],{'X':OL,'B':B11,'C':B10},x0,4)
    if K: px(a,[(3,1),(7,1),(13,1),(2,8)],G7)
    else: px(a,[(5,6),(6,7),(7,7),(8,8),(9,8)],T20)
    C['stollen_stuetze']=a
    a=gwall()
    obj(a,["...XXXX...","..XAAAAX..","..XABBAX..","..XAAAAX..","...XXXX...","....XX....","XXXXXX....","XNNNNX...."],{'X':OL,'A':(AM27 if not K else G6),'B':(AM26 if not K else S5),'N':BR24},3,2)
    if not K: px(a,[(2,3),(11,3),(2,5),(11,5),(7,0)],AM26)
    else: px(a,[(6,3)],G7)
    C['wandlampe']=a
    a=earth(33)
    for x in range(1,16,3): vl(a,x,0,13,OL); vl(a,x+1,0,13,S4 if not K else S5)
    hl(a,0,15,1,OL); hl(a,0,15,2,S4); hl(a,0,15,12,OL); hl(a,0,15,13,S4)
    if K: obj(a,["XXX","XBX","XXX"],{'X':OL,'B':BR24},7,6); px(a,[(2,2),(8,2),(14,2),(5,13)],G7)
    else:  # gate swung open: bars pushed to the side
        rect(a,4,0,9,14,BK); px(a,[(6,6),(7,7),(9,9),(10,8)],T20); px(a,[(7,7)],T22)
    C['gittertor']=a
    order=['pumpen_boden','pumpen_boden_adern','labor_fliesen','labor_fliesen_adern','parkett','parkett_2','stollen_boden','stollen_boden_adern',
           'pumpe_oben','pumpe_unten','manometer','gusswand_oben','gusswand','rohr_gross_v','hebelbank','laufsteg',
           'sudkessel_fundament_links','sudkessel_fundament_rechts','labortisch_links','labortisch_rechts','abzug','fliesenwand_oben','fliesenwand','ausguss',
           'zeichenschrank_oben','zeichenschrank_unten','zeichenpult','tapete_oben','tapete','kamin','stollen_eingang_oben','stollen_eingang_unten',
           'pumpen_boden_adern_f1','pumpen_boden_adern_f2','pumpen_boden_adern_f3','parkett_adern','stollen_wand','stollen_stuetze','wandlampe','gittertor']
    return order,[C[k] for k in order]
ANIMS_WARM={'wurzeladern':{'frames':[1,32,33,34],'frameRate':4,'repeat':-1}}
