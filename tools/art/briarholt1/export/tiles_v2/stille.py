from tk import *
from ground import *
def cells(v):
    K=v=='kalt'; C={}
    def fl(seed=0):
        a=tiles_floor(G7 if not K else G6, G6 if not K else S5, S5 if not K else S4, 4)
        if K: 
            for (x,y) in [(1,0),(9,4),(5,8),(13,12)]: a[y,x]=BONE
        return a
    def planks_(seed=3):
        if K: a=planks(base=B10,hi=B11,sh=B9,gap=B9,seed=seed)
        else: a=planks(base=B11,hi=B12,sh=B10,gap=B9,seed=seed)
        if K: speckle(a,[G6],6,seed+9,where=(a==B9))
        return a
    C['fliesen']=fl()
    a=fl(); obj(a,["XXXX","XNNX","XNNX","XXXX"],{'X':S4,'N':N3},6,6,ol=False); px(a,[(7,7),(8,8)],N2)
    if K: px(a,[(7,8)],G7)
    C['fliesen_abfluss']=a
    C['dielen']=planks_(3); C['dielen_2']=planks_(8)
    a=blank(M16 if not K else M15)
    for y in range(0,16,8): hl(a,0,15,y,M17 if not K else M16)
    px(a,[(3,3),(11,11),(6,13)],M15 if not K else N2)
    if K: speckle(a,[G6],5,51); px(a,[(2,9),(3,9),(12,4)],G7)
    else: px(a,[(5,10),(6,10),(7,11),(10,4),(11,4)],M15)   # scuffs from chair legs
    C['linoleum']=a
    a=planks_(4); b=fl(); a[0:7,:]=b[0:7,:]; hl(a,0,15,7,S4); hl(a,0,15,8,B9)
    C['fliesen_dielen_kante']=a
    a=planks_(5); rect(a,0,6,16,4,B12 if not K else B11); hl(a,0,15,6,B13 if not K else B12); hl(a,0,15,9,B9)
    C['schwelle']=a
    a=planks_(6)
    if K: sprite(a,["..GGGG....",".GHHHHGG..","GHHWHHHHG.",".GGHHHHG..","...GGGG..."],{'G':G6,'H':G7,'W':BONE},3,5)
    else:  # worn rag rug by the beds
        sprite(a,["XXXXXXXXXXXX","XRRRRRRRRRRX","XRYRYRYRYRRX","XRRRRRRRRRRX","XXXXXXXXXXXX"],{'X':B9,'R':WN,'Y':B13},2,5)
    C['dielen_fleck']=a
    # walls: cream plaster over tiled dado
    def wall(seed=0):
        a=blank(B13 if not K else G6)
        hl(a,0,15,0,B14 if not K else G7)
        rect(a,0,9,16,7,G7 if not K else S5); hl(a,0,15,9,S4); hl(a,0,15,8,B12 if not K else S5)
        for x in range(0,16,4): vl(a,x,10,15,G6 if not K else S4)
        hl(a,0,15,13,G6 if not K else S4); hl(a,0,15,15,N3)
        if K:  # damp cold: frost creeping at skirting
            px(a,[(1,14),(2,14),(5,14),(9,14),(10,14),(14,14)],G7); px(a,[(2,7),(3,6),(12,5)],G7)
        return a
    a=wall(); rect(a,0,0,16,4,B12 if not K else S4); hl(a,0,15,3,B11 if not K else N3); hl(a,0,15,4,B14 if not K else G7)
    C['wand_oben']=a
    C['wand']=wall()
    a=wall(); vl(a,0,0,15,B11 if not K else S4); vl(a,1,0,15,B14 if not K else G7)
    C['wand_ecke_links']=a
    a=wall(); vl(a,15,0,15,B11 if not K else S4); vl(a,14,0,15,B12 if not K else S5)
    C['wand_ecke_rechts']=a
    def window(side,f=0):
        a=wall()
        x0=2 if side=='l' else 0; x1=15 if side=='l' else 13
        rect(a,x0,1,x1-x0+1,11,B10)
        gx0=x0+1 if side=='l' else 0; gx1=x1 if side=='l' else x1-1
        if K:  # frost flowers grow from the corners over dark glass
            rect(a,gx0,2,gx1-gx0+1,8,N2)
            fern=["W.W....","WWW.W..",".WWWW.W","..WWWWW","W..WWW.","WW..WW.","WWW..W."]
            if side=='l': sprite(a,fern[::-1],{'W':G7},gx0,3)
            else: sprite(a,[r[::-1] for r in fern[::-1]],{'W':G7},gx1-6,3)
            px(a,[(gx0+1,2),(gx1-1,2)],BONE)
        else:  # fogged, warm room light, drops run down
            rect(a,gx0,2,gx1-gx0+1,8,G6); rect(a,gx0,2,gx1-gx0+1,2,G7)
            for k,x in enumerate(range(gx0+1,gx1,3)):
                yy=4+(k*2+f*2)%5
                for t in range(4,yy): a[t,x]=S5
                a[yy,x]=BONE
            px(a,[(gx0+2,8),(gx1-3,7)],AM27)
        hl(a,x0,x1,6,B10); 
        if side=='l': vl(a,x1,1,11,B10)
        hl(a,x0,x1,10,B9); hl(a,x0-1 if side=='l' else 0,x1 if side=='l' else x1+1,11,B12); hl(a,x0,x1,12,B9)
        if not K and side=='r': px(a,[(4,11),(5,11)],S5)
        if K and side=='l': px(a,[(5,11),(9,11),(12,11)],G7)
        return a
    C['fenster_links']=window('l'); C['fenster_rechts']=window('r')
    def door(top):
        a=wall()
        rows=["..XXXXXXXXXX....",
              "..XBBBBBBBBX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBBBBBBBBX....",
              "..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....",
              "..XBBBBBBBBX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX...."]
        if not top: rows=["..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBBBBBBBBX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBCCCBCCCX....","..XBBBBBBBBX....","..XXXXXXXXXX....","SSSSSSSSSSSSSSSS","SSSSSSSSSSSSSSSS","TTTTTTTTTTTTTTTT","TTTTTTTTTTTTTTTT"]
        sprite(a,rows,{'X':OL,'B':B9,'C':B10,'S':B11,'T':B10},1,0)
        if top:
            if K: px(a,[(5,3),(6,3),(9,3)],G7); 
            else: rect(a,5,2,6,2,AM26)  # lit glazing above the door
        else:
            a[5,10]=BR25
            if not K: hl(a,3,12,12,AM26)  # light spills under the door
            else: px(a,[(4,12),(7,13),(11,12),(13,14)],G7)
        return a
    C['tuer_oben']=door(True); C['tuer_unten']=door(False)
    # beds with board
    def bed(part):
        a=fl() if part else planks_(9)
        if part==0:  # head end: iron frame, pillow, board hung above
            obj(a,["XXXXXXXXXXXX","XNSSSSSSSSNX","XNPPPPPPPPNX","XNPPWWWWPPNX","XNPPPPPPPPNX","XNBBBBBBBBNX","XNBBBBBBBBNX","XNBDBBBBDBNX","XNBBBBBBBBNX"],{'X':OL,'N':N3,'S':S5,'P':BONE if not K else G7,'W':B14 if not K else G6,'B':(WN if not K else S4),'D':(B13 if not K else S5)},2,7)
            obj(a,["XXXXXXXX","XGGGGGGX","XGWWGWGX","XGWWWGGX","XGGEEEGX","XXXXXXXX"],{'X':B9,'G':N2,'W':G7,'E':S4},4,0)
            if K: px(a,[(4,9),(9,9),(11,8)],BONE)
            else: px(a,[(10,11),(11,12)],B13); px(a,[(6,10),(7,10)],B13)  # dented pillow, turned-down blanket
        else:
            obj(a,["XNBBBBBBBBNX","XNBDBBBBDBNX","XNBBBBBBBBNX","XNBBBBBBBBNX","XNBDBBBBDBNX","XNBBBBBBBBNX","XNNNNNNNNNNX","XXXXXXXXXXXX","X.X......X.X"],{'X':OL,'N':N3,'B':(WN if not K else S4),'D':(B13 if not K else S5)},2,0)
            if K: rect(a,3,1,10,1,G6); px(a,[(5,3),(9,4),(7,2)],G7)  # rimed, untouched folded blanket
            else: sprite(a,["BBBB","BBBBB"," BBB"],{'B':WN},8,4); px(a,[(9,4),(10,5)],B13)
        return a
    C['bett_kopf']=bed(0); C['bett_fuss']=bed(1)
    a=wall()
    obj(a,["XXXXXXXXXXXXXX","XGGGGGGGGGGGGX","XGWWWGWWGWWWGX","XGWWGWWWWGWWGX","XGWWWWGWWWGGGX","XGEEEEEEEGGGGX","XGGGGGGGGGGGGX","XXXXXXXXXXXXXX"],{'X':B9,'G':N2 if not K else N3,'W':G7 if not K else G6,'E':S4},1,1)
    if K: px(a,[(2,2),(13,6),(12,2)],G6)
    else: px(a,[(11,6)],BONE)
    C['tafel_radiert']=a
    a=planks_(10)
    obj(a,["XXXXXXXX","XBBBBBBX","XCCCCCCX","XCCOOCCX","XCCCCCCX","XCCCCCCX","XXXXXXXX"],{'X':OL,'B':B11,'C':B10,'O':BR25},4,6)
    if K: px(a,[(6,7),(9,7)],G7)
    else: obj(a,["XX","WW"],{'X':OL,'W':BONE},6,4); px(a,[(9,5)],AM26)  # cup of tea and a candle stub
    C['nachttisch']=a
    a=planks_(11)
    obj(a,["...XXXXXX...","...XBBBBX...","...XCCCCX...","...XXXXXX...","..XBBBBBBX..","..XCCCCCCX..","..XXXXXXXX..","..X......X..","..X......X.."],{'X':OL,'B':B11,'C':B10},1,5)
    if K: px(a,[(5,9),(8,9),(6,6)],G7)
    else: px(a,[(5,9),(6,9),(7,9)],WN)  # cushion
    C['stuhl']=a
    def table(side):
        a=planks_(12+side)
        rows=["XXXXXXXXXXXXXXXX","WWWWWWWWWWWWWWWW","WWWWWWWWWWWWWWWW","WWWWWWWWWWWWWWWW","WWWWWWWWWWWWWWWW","WWWWWWWWWWWWWWWW","XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","XXXXXXXXXXXXXXXX"]
        sprite(a,rows,{'X':OL,'W':BONE if not K else G6,'B':B10},0,4)
        if side==0: vl(a,0,4,12,OL); vl(a,1,13,15,OL); vl(a,2,13,15,OL)
        else: vl(a,15,4,12,OL); vl(a,14,13,15,OL); vl(a,13,13,15,OL)
        if K:
            px(a,[(4,6),(10,7),(7,8)],G7)
            obj(a,["XX","SS"],{'X':OL,'S':S5},6+side*2,5)  # upturned empty cup
        else:
            obj(a,["XXX","WWW"],{'X':OL,'W':B14},4+side*4,5); a[5,5+side*4]=B10
            obj(a,["XX","WW"],{'X':OL,'W':B14},10-side*6,7); px(a,[(10-side*6,4)],G7)
        return a
    C['speisetisch_links']=table(0); C['speisetisch_rechts']=table(1)
    a=planks_(14)
    sprite(a,["XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","CCCCCCCCCCCCCCCC","XXXXXXXXXXXXXXXX","..X..........X..","..X..........X.."],{'X':OL,'B':B11,'C':B10},0,6)
    if K: px(a,[(3,7),(8,7),(12,7)],G7)
    C['bank']=a
    # tea kitchen
    def stove_top(f=0):
        a=fl()
        obj(a,["XXXXXXXXXXXXXX","XNNNNNNNNNNNNX","XKKKKKKKKKKKKX","XKOOOKKKKOOOKX","XKOKOKKKKOKOKX","XKOOOKKKKOOOKX","XKKKKKKKKKKKKX","XKKKKKKKKKKKKX","XNNNNNNNNNNNNX"],{'X':OL,'K':BK,'O':N2,'N':N3},1,7)
        if K:  # cold: rimed hob, kettle pushed aside, no steam
            px(a,[(3,11),(11,12),(7,10)],G7)
            obj(a,["XXXX","XSSX","XSSX","XXXX"],{'X':OL,'S':S4},2,5); px(a,[(3,6)],G7)
        else:  # warm: kettle on the hot plate, glowing ring, steam
            px(a,[(3,10),(4,11),(5,10),(4,12),(3,12),(5,12)],AM26)
            obj(a,["..XXXX..",".XSSSSX.","XXSGGSXX","..XSSX..","..XXXX.."],{'X':OL,'S':S5,'G':G6},8,5)
            st=[["..GG","GHHG",".GG.","..G."],[".GG.","GHHG","GHG.","G..."]][f]
            sprite(a,st,{'G':G6,'H':G7},10,0)
        return a
    def stove_bot(f=0):
        a=fl()
        obj(a,["XNNNNNNNNNNNNX","XKKKKKKKKKKKKX","XKXXXXXXXXXXKX","XKXOOOOOOOOXKX","XKXOOOOOOOOXKX","XKXXXXXXXXXXKX","XKKKKKKKKKKKKX","XXXXXXXXXXXXXX"],{'X':OL,'K':BK,'N':N3,'O':N1},1,0)
        if K: px(a,[(4,4),(5,4),(8,4),(10,3)],S4); px(a,[(6,4)],G6)  # grey ash
        else:
            fire=[["A.AB.A..","BABBABA.","ABBABBAB"],[".AB.A.A.","ABABBAB.","BABBABBA"]][f]
            sprite(a,fire,{'A':AM27,'B':AM26},4,2) if False else sprite(a,[r[:8] for r in fire],{'A':AM27,'B':AM26},4,2)
            px(a,[(4,4),(11,4)],WN)
        a[0:0]=a[0:0]
        hl(a,1,14,8,N3) if False else None
        return a
    C['herd_oben']=stove_top(0); C['herd_unten']=stove_bot(0)
    a=wall()
    obj(a,["XXXXXXXXXXXX","XBBBBBBBBBBX","XCWCCWCCWCCX","XBBBBBBBBBBX","XCCWCCWCCWCX","XBBBBBBBBBBX","XXXXXXXXXXXX","XDDDDXDDDDDX","XDDODXDODDDX","XDDDDXDDDDDX","XXXXXXXXXXXX"],{'X':OL,'B':B11,'C':B9,'W':(B14 if not K else G6),'D':B10,'O':BR25},2,4)
    C['teeschrank']=a
    a=fl()
    obj(a,["XXXXXXXXXXXX","XSSSSSSSSSSX","XSNNNNNNNNSX","XSNWWWWWWNSX","XSNWWWWWWNSX","XSNNNNNNNNSX","XSSSSSSSSSSX","XXXXXXXXXXXX"],{'X':OL,'S':G7,'N':S5,'W':(G6 if K else T20)},2,6)
    vl(a,7,3,5,OL); vl(a,8,3,5,BR24)
    if K: px(a,[(6,9),(9,10)],BONE); px(a,[(7,9),(8,9),(9,9)],G7)  # ice in the basin
    else: px(a,[(6,9),(10,10)],T21); sprite(a,["G.G",".G."],{'G':G7},11,1)
    C['spuele']=a
    def desk(side):
        a=planks_(15+side)
        rows=["XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","BBBBBBBBBBBBBBBB","BBBBBBBBBBBBBBBB","XXXXXXXXXXXXXXXX","CCCCCCCCCCCCCCCC","CDDCCDDCCDDCCDDC","CCCCCCCCCCCCCCCC","XXXXXXXXXXXXXXXX"]
        sprite(a,rows,{'X':OL,'B':B11,'C':B10,'D':B9},0,6)
        if side==0:
            vl(a,0,6,14,OL)
            obj(a,["XXXXXX","XWWWWX","XWEEWX","XXXXXX"],{'X':OL,'W':BONE if not K else G6,'E':S4},4,4)  # ledger (Ennas Heft lies elsewhere)
        else:
            vl(a,15,6,14,OL)
            obj(a,["..XX..",".XAAX.","XAAAAX",".XXXX.","..XX..","XXXXXX"],{'X':OL,'A':(AM27 if not K else S5)},6,1)
            if not K: px(a,[(5,3),(12,3),(4,5),(13,5)],AM26)
        if K: px(a,[(2,7),(9,8),(13,7)],G7)
        return a
    C['stationstresen_links']=desk(0); C['stationstresen_rechts']=desk(1)
    a=wall()
    obj(a,["XXXXXXXXXXXXXX","XAABACBAABCAAX","XAABACBAABCAAX","XXXXXXXXXXXXXX","XBAACAABACAABX","XBAACAABACAABX","XXXXXXXXXXXXXX"],{'X':B9,'A':B13 if not K else G6,'B':B12 if not K else S5,'C':WN if not K else S4},1,2)
    C['aktenregal']=a
    a=wall()
    obj(a,["XXXXXXXXXXXX","XSXSXSXSXSXX","XSXSXSXSXSXX","XSXSXSXSXSXX","XSXSXSXSXSXX","XXXXXXXXXXXX"],{'X':OL,'S':(G6 if K else B12)},2,8)
    if K: px(a,[(3,9),(7,9),(9,11)],BONE); vl(a,5,14,15,G7)
    else: sprite(a,["XXXXXX","WWWWWW","WBWWBW"],{'X':OL,'W':B14,'B':WN},4,5); px(a,[(3,4),(10,3),(6,2)],G7)  # cloth drying, warm air
    C['heizkoerper']=a
    C['herd_oben_f2']=stove_top(1) if not K else stove_top(0)
    C['herd_unten_f2']=stove_bot(1) if not K else stove_bot(0)
    C['fenster_links_f2']=window('l',1) if not K else window('l')
    C['fenster_rechts_f2']=window('r',1) if not K else window('r')
    a=wall()
    obj(a,["XXXXXXXXXXXXXX","XCCCCXXXXCCCCX","XCDCCX..XCCDCX","XCDCCX..XCCDCX","XCDCCX..XCCDCX","XCDCX....XCDCX","XCDCX....XCDCX","XXXX......XXXX"],{'X':OL,'C':(WN if not K else S4),'D':(VI29 if not K else N3)},1,1)
    if K: px(a,[(3,8),(12,7)],G7)
    C['vorhang']=a
    a=wall()
    hl(a,1,14,2,B9); hl(a,1,14,3,B10)
    for x in (3,8,12): a[4,x]=BR24
    if K: px(a,[(3,5),(8,5),(12,5)],G7)
    else:
        obj(a,["XXX","CCC","CCC","CCC","CXC"],{'X':OL,'C':N3},2,5); obj(a,["XXX","DDD","DDD","DDD","DXD"],{'X':OL,'D':B9},7,5)
    C['garderobe']=a
    a=wall()
    obj(a,["..XXXX..",".XWWWWX.","XWWWWWWX","XWWOWWWX","XWWWOWWX","XWWWWWWX",".XWWWWX.","..XXXX.."],{'X':BR24,'W':B14 if not K else G6,'O':OL},4,1)
    if K: px(a,[(5,3),(6,2)],G7)
    C['wanduhr']=a
    a=planks_(16)
    rect(a,1,1,14,14,WN if not K else S4); outline(a,np.pad(np.ones((12,12),bool),2),B9)
    for x in range(3,13,3): vl(a,x,3,12,B11 if not K else S5)
    if K: speckle(a,[G6],8,77,where=(a==S4))
    C['dielen_teppich']=a
    order=['fliesen','fliesen_abfluss','dielen','dielen_2','linoleum','fliesen_dielen_kante','schwelle','dielen_fleck',
           'wand_oben','wand','wand_ecke_links','wand_ecke_rechts','fenster_links','fenster_rechts','tuer_oben','tuer_unten',
           'bett_kopf','bett_fuss','tafel_radiert','nachttisch','stuhl','speisetisch_links','speisetisch_rechts','bank',
           'herd_oben','herd_unten','teeschrank','spuele','stationstresen_links','stationstresen_rechts','aktenregal','heizkoerper',
           'herd_oben_f2','herd_unten_f2','fenster_links_f2','fenster_rechts_f2','vorhang','garderobe','wanduhr','dielen_teppich']
    return order,[C[k] for k in order]
ANIMS_WARM={'teekessel_dampf':{'frames':[24,32],'frameRate':3,'repeat':-1},'herdfeuer':{'frames':[25,33],'frameRate':5,'repeat':-1},
            'fenster_links_tropfen':{'frames':[12,34],'frameRate':2,'repeat':-1},'fenster_rechts_tropfen':{'frames':[13,35],'frameRate':2,'repeat':-1}}
