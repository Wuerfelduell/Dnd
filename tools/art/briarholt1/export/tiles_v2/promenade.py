from tk import *
from ground import *
NAMES=[]
def pav(v,seed=1,alt=None):
    if v=='kalt': return bricks(v,seed=seed,frost=True,alt=(B9 if alt else None))
    return bricks(v,base=B9,hi=B10,sh=BK,mortar=N2,seed=seed,wet=True,alt=(B10 if alt else None))
def ashlar(v):
    a=bricks(v,base=B13,hi=B14,sh=B12,mortar=B11,seed=11,bw=8,bh=4)
    if v=='warm':  # condensate streaks run down the plaster
        for x in (3,12): 
            for y in range(1,9): a[y,x]=B12 if a[y,x]!=B11 else B11
    return a
def cells(v):
    K=v=='kalt'; C={}
    C['pflaster_1']=pav(v,1)
    C['pflaster_2']=pav(v,2,alt=True)
    a=pav(v,4)
    # brass inlay disc of the Kurmeile
    sprite(a,["..XXXX..",".XYYYYX.","XYZZZZYX","XYZYYZYX","XYZYYZYX","XYZZZZYX",".XYYYYX.","..XXXX.."],{'X':BR24,'Y':BR25,'Z':AM27 if not K else G7},4,4)
    C['pflaster_messing']=a
    a=pav(v,5)
    rect(a,0,6,16,1,S5); rect(a,0,7,16,2,N2 if not K else G6); rect(a,0,9,16,1,S4)
    if K: px(a,[(1,7),(2,7),(6,8),(7,8),(8,8),(12,7),(13,7)],G7); px(a,[(4,7),(10,8)],BONE)
    else: px(a,[(2,7),(3,7),(9,8),(10,8)],N3); px(a,[(6,7),(13,8)],S5)
    C['pflaster_rinne']=a
    a=pav(v,6)
    if K:
        sprite(a,["...GGGGGG...","..GHHHHHHGG.",".GHHWHHHHHHG","GHHHHHHHWHHG",".GGHHHHHHHG.","...GGGGGGG.."],{'G':G6,'H':G7,'W':BONE},2,5)
    else:
        sprite(a,["...SSSSSS...","..SNNNNNNSS.",".SNNHNNNNNNS","SNNNNNNGNNNS",".SSNNNNNNNS.","...SSSSSSS.."],{'S':S4,'N':N2,'H':G6,'G':S5},2,5)
    C['pflaster_pfuetze']=a
    a=planks(base=B11,hi=B12,sh=B10,gap=B9,seed=3,nail=BR24)
    if K: speckle(a,[G7],10,31,where=(a==B9)); px(a,[(2,1),(9,5),(14,9),(5,13)],G7)
    C['pavillon_boden']=a
    a=planks(base=B11,hi=B12,sh=B10,gap=B9,seed=3,nail=BR24)
    sprite(a,["....XXXXXX....","..XXYYYYYYXX..",".XYYZZZZZZYYX.",".XYZZQQQQZZYX.","XYZZQ....QZZYX","XYZQ......QZYX","XYZQ......QZYX","XYZZQ....QZZYX",".XYZZQQQQZZYX.",".XYYZZZZZZYYX.","..XXYYYYYYXX..","....XXXXXX...."],{'X':B9,'Y':BR24,'Z':BR25,'Q':B13},1,2)
    if K: px(a,[(5,6),(10,9),(7,4),(12,7)],G7)
    else: px(a,[(5,3),(9,3)],AM27)
    C['pavillon_rosette']=a
    a=planks(base=B11,hi=B12,sh=B10,gap=B9,seed=3,nail=BR24)
    rect(a,0,9,16,1,B9); rect(a,0,10,16,1,G7 if K else G6); rect(a,0,11,16,4,G6 if K else S5); rect(a,0,15,16,1,N3)
    for x in (3,11): vl(a,x,11,14,S5 if K else S4)
    if K: px(a,[(1,10),(2,10),(6,11),(13,10),(14,11),(8,12)],BONE); speckle(a,[G7],5,37,where=(a==B9))
    else: px(a,[(5,15),(6,15),(12,15)],N2)
    C['pavillon_stufe']=a
    # gas lamp socket (the lamp itself is a prop)
    a=pav(v,7)
    if not K:
        for (x,y) in [(2,9),(3,13),(12,10),(13,14),(1,12),(14,12),(5,15),(10,15)]: a[y,x]=AM26
    obj(a,["....XXXX....","....XYYX....","....XYYX....","...XXYYXX...","..XYYYYYYX..",".XYZZZZZZYX.",".XYZZZZZZYX.",".XXXXXXXXXX."],{'X':N2,'Y':N3,'Z':S4},2,5)
    if K: px(a,[(4,9),(5,9),(9,9),(10,9),(7,5)],G7); px(a,[(3,10),(12,10)],BONE)
    else: px(a,[(6,6),(6,7),(5,9)],AM26)
    C['laternensockel']=a
    # --- Kurhaus facade (light plaster, brass)
    a=ashlar(v); rect(a,0,0,16,3,N2); hl(a,0,15,3,N3); hl(a,0,15,4,BR25); hl(a,0,15,5,BR24)
    for x in range(0,16,2): rect(a,x,6,1,2,B14); 
    for x in range(1,16,2): rect(a,x,6,1,2,B12)
    if K:
        px(a,[(1,1),(2,1),(6,2),(11,1),(12,1)],G6)
        for x,l in [(1,3),(4,2),(7,4),(10,2),(13,3)]: vl(a,x,6,5+l,G7); a[5+l,x]=BONE
    else:
        for x,l in [(3,2),(9,3),(14,1)]: vl(a,x,6,5+l,S5)
        px(a,[(3,10),(9,12)],S5)
    C['kurhaus_gesims']=a
    C['kurhaus_wand']=ashlar(v)
    a=ashlar(v); rect(a,0,0,4,16,B14); vl(a,3,0,15,B12); vl(a,0,0,15,B13)
    for y in range(0,16,4): hl(a,0,3,y,B12)
    if K: px(a,[(1,2),(1,9),(2,13)],G7)
    C['kurhaus_ecke_links']=a
    a=ashlar(v); rect(a,12,0,4,16,B13); vl(a,12,0,15,B14); vl(a,15,0,15,B12)
    for y in range(0,16,4): hl(a,12,15,y,B12)
    if K: px(a,[(13,5),(14,11)],G7)
    C['kurhaus_ecke_rechts']=a
    a=ashlar(v)
    if K:
        win=["XXXXXXXXXX","XGGGGOGGGX","XGFGGOGGFX","XFFGGOGGFX","XGGGGOGGGX","XOOOOOOOOX","XGGGGOGGGX","XGGGGOGGGX","XFGGGOGGFX","XFFGGOGFFX","XFFFGOFFFX","XXXXXXXXXX","QPPPPPPPPQ"]
        L={'X':B9,'O':N2,'G':N1,'F':G7,'P':BR25,'Q':BR24}
    else:
        win=["XXXXXXXXXX","XAAABOAAAX","XABAAOABAX","XABAAOABAX","XAAAAOAABX","XOOOOOOOOX","XABAAOAAAX","XABAAOABAX","XAAAAOABAX","XAAABOAAAX","XCCCCOCCCX","XXXXXXXXXX","QPPPPPPPPQ"]
        L={'X':B9,'O':B10,'A':AM27,'B':AM26,'C':S5,'P':BR25,'Q':BR24}
    sprite(a,win,L,3,1)
    C['kurhaus_fenster']=a
    a=ashlar(v)
    top=["..XXXXXXXXXXXX..",".XYYYYYYYYYYYYX.","XYGGGGGGGGGGGGYX","XYGHGGHGGHGGHGYX","XYGHGGHGGHGGHGYX","XYYYYYYYYYYYYYYX","XYDDDDDOODDDDDYX","XYDEEEDOODEEEDYX","XYDEFEDOODEFEDYX","XYDEEEDOODEEEDYX","XYDEEEDOODEEEDYX","XYDEEEDOODEEEDYX","XYDEEEDOODEEEDYX","XYDEFEDOODEFEDYX","XYDEEEDOODEEEDYX","XYDDDDDOODDDDDYX"]
    if K: L={'X':B12,'Y':BR24,'G':N1,'H':G7,'D':B9,'E':B10,'F':B11,'O':BK}
    else: L={'X':B12,'Y':BR25,'G':AM26,'H':AM27,'D':B9,'E':B10,'F':B11,'O':BK}
    sprite(a,top,L)
    if K:
        for x,l in [(3,3),(6,2),(9,4),(12,2)]: vl(a,x,6,5+l,G7); a[5+l,x]=BONE   # icicles under the transom
    else:
        sprite(a,["XX","AA","XX"],{'X':OL,'A':AM27},0,7); sprite(a,["XX","AA","XX"],{'X':OL,'A':AM27},14,7)   # small lit door lamps
    C['kurhaus_tuer_oben']=a
    a=ashlar(v)
    bot=["XYDEEEDOODEEEDYX","XYDEEEDOODEEEDYX","XYDEEEDOODEEEDYX","XYDEEEDZZDEEEDYX","XYDEEEDOODEEEDYX","XYDEFEDOODEFEDYX","XYDEEEDOODEEEDYX","XYDEEEDOODEEEDYX","XYDDDDDOODDDDDYX","XYTTTTTTTTTTTTYX","SSSSSSSSSSSSSSSS","RRRRRRRRRRRRRRRR","SSSSSSSSSSSSSSSS","RRRRRRRRRRRRRRRR","NNNNNNNNNNNNNNNN","NNNNNNNNNNNNNNNN"]
    if K: L={'X':B12,'Y':BR24,'D':B9,'E':B10,'F':B11,'O':BK,'Z':BR25,'T':BK,'S':G7,'R':G6,'N':S5}
    else: L={'X':B12,'Y':BR25,'D':B9,'E':B10,'F':B11,'O':BK,'Z':AM27,'T':AM26,'S':G6,'R':S5,'N':S4}
    sprite(a,bot,L)
    if K: px(a,[(0,10),(1,10),(2,11),(13,10),(14,10),(15,11),(4,12),(10,12)],BONE)
    else: px(a,[(5,10),(6,10),(7,10),(8,10),(9,10),(10,10)],AM27); px(a,[(3,12),(11,13)],N3)
    C['kurhaus_tuer_unten']=a
    a=ashlar(v); rect(a,0,8,16,8,S5); hl(a,0,15,8,G6); hl(a,0,15,15,N3)
    for x in (0,8): vl(a,x,9,14,S4)
    hl(a,0,15,12,S4)
    if K: hl(a,0,15,14,G7); px(a,[(2,13),(5,13),(9,13),(13,13),(6,9),(11,9)],G7)
    else:
        rect(a,0,13,16,2,N3); px(a,[(3,9),(3,10),(3,11),(12,9),(12,10)],S4); px(a,[(5,15),(10,15)],N2)
    C['kurhaus_sockel']=a
    # --- glass walkway (Glasübergang)
    def pane(a,x0,y0,w,h,f):
        r=rng(40+x0+y0)
        if K:  # blind: frosted opaque glass, ice flowers in the corners
            rect(a,x0,y0,w,h,G7)
            for i in range(w*h//9):
                x,y=x0+int(r.integers(w)),y0+int(r.integers(h)); a[y,x]=G6
            for (cx,cy,sx,sy) in [(x0,y0+h-1,1,-1),(x0+w-1,y0+h-1,-1,-1)]:
                for t in range(4): a[cy+sy*t,cx]=BONE; a[cy,cx+sx*t]=BONE
                a[cy+sy,cx+sx]=BONE; a[cy+sy*2,cx+sx*2]=BONE; a[cy+sy*1,cx+sx*2]=BONE
        else:  # fogged: grey haze, lighter band of condensate, running drops
            rect(a,x0,y0,w,h,S5)
            rect(a,x0,y0,w,2,G6)
            for i in range(w*h//10):
                x,y=x0+int(r.integers(w)),y0+2+int(r.integers(h-2)); a[y,x]=G6
            for k,dx in enumerate(range(2,w-1,4)):
                x=x0+dx; yy=y0+2+((k*5+f*3)%(h-3))
                for t in range(y0+1,yy): a[t,x]=S4
                a[yy,x]=G7; a[min(yy+1,y0+h-1),x]=BONE if k%2 else G7
    def roof(f,side):
        a=blank(N2)
        pane(a,0,1,16,14,f)
        hl(a,0,15,0,OL); hl(a,0,15,15,OL); hl(a,0,15,8,N2)
        for x in (7,):
            vl(a,x,0,15,N2); vl(a,x+1,0,15,N3)
        if side=='l': vl(a,0,0,15,OL); vl(a,1,0,15,N3)
        if side=='r': vl(a,15,0,15,OL); vl(a,14,0,15,N2)
        px(a,[(7,8),(8,8)],BR25)
        return a
    C['glasgang_dach_links']=roof(0,'l'); C['glasgang_dach_mitte']=roof(0,'m'); C['glasgang_dach_rechts']=roof(0,'r')
    def side(f):
        a=blank(N2); hl(a,0,15,0,OL); hl(a,0,15,1,N3); pane(a,1,2,14,11,f)
        vl(a,0,0,15,N3); vl(a,15,0,15,N2); hl(a,0,15,13,N3); hl(a,0,15,14,S5 if K else S4); hl(a,0,15,15,OL)
        px(a,[(1,1),(14,1),(1,13),(14,13)],BR25)
        return a
    C['glasgang_scheibe']=side(0)
    a=side(0); rect(a,6,0,4,16,N2); vl(a,6,0,15,N3); vl(a,9,0,15,OL); px(a,[(7,4),(7,9)],BR25)
    C['glasgang_pfosten']=a
    a=tiles_floor(B13,S5,B11,4) if False else tiles_floor(G6,B12,S4,4)
    if K: px(a,[(1,1),(6,5),(9,9),(14,13),(2,10)],G7)
    else: px(a,[(5,2),(6,2),(10,11)],S5); px(a,[(2,6),(13,5)],N3)
    C['glasgang_boden']=a
    a=pav(v,8)
    for x in range(1,16,4): 
        vl(a,x,7,13,OL); vl(a,x+1,7,13,BR24)
    hl(a,0,15,5,OL); hl(a,0,15,6,BR25); hl(a,0,15,7,BR24); hl(a,0,15,8,OL)
    if K: px(a,[(1,6),(2,6),(5,6),(9,6),(10,6),(13,6)],G7)
    else: px(a,[(4,9),(11,10)],S5); px(a,[(7,6)],AM27)
    C['messinggelaender']=a
    a=blank(S5)
    for s in range(4):
        y=s*4; hl(a,0,15,y,G7 if K else G6); hl(a,0,15,y+1,G6 if K else S5); hl(a,0,15,y+2,S5 if K else S4); hl(a,0,15,y+3,N3)
    vl(a,0,0,15,S4); vl(a,15,0,15,N3)
    if K: px(a,[(2,0),(3,0),(4,1),(9,4),(10,4),(12,8),(13,9),(5,12),(6,12)],BONE)
    else: px(a,[(4,2),(11,6),(7,10),(8,10)],N3)
    C['steintreppe']=a
    # --- palm tub (2 cells), postcard rack (2 cells), bench (2 cells)
    a=pav(v,9)
    if K:  # stiff: fronds folded down like a closed umbrella, rimed tips
        palm=["......XXXX......","....XXMMMMXX....","...XMMLLLLMMX...","..XMLXMMMMXLMX..","..XMXMLXXLMXMX..",".XMLXMXCCXMXLMX.",".XMXMLXCCXLMXMX.",".XMXMXXCCXXMXMX.",".XWXMX.XCX.XMXWX","..X.XW.XCX.WX.X.","....X..XCX..X...",".......XCX......",".......XCX......",".......XCX......",".......XCX......",".......XCX......"]
        sprite(a,palm,{'X':OL,'M':M16,'L':M17,'C':B10,'W':G7})
        px(a,[(6,1),(9,1),(5,2)],G7)
    else:  # unfolded: fronds spread wide and arch outward
        palm=["XX....XXXX....XX","XLXX.XLMMLX.XXLX",".XMLXXMLLMXXLMX.","..XXMLMXXMLMXX..","XXXXXMLXXLMXXXXX","XLLLMMXCCXMMLLLX",".XXXXXMCCMXXXXX.","..XMLXXCCXXLMX..",".XMX.X.XCX.X.XMX","XMX....XCX....XM","XX.....XCX.....X",".......XCX......",".......XCX......",".......XCX......",".......XCX......",".......XCX......"]
        sprite(a,palm,{'X':OL,'M':T20,'L':T21,'C':B10})
        px(a,[(2,5),(13,5),(7,2)],M17)
    C['palme_krone']=a
    a=pav(v,10)
    tub=["......XBCX......","......XBCX......","..XXXXXXXXXXXX..",".XSSSSSSSSSSSSX.",".XEEEEEEEEEEEEX.",".XPQPPPQPPPQPPX.",".XRRRRRRRRRRRRX.",".XPQPPPQPPPQPPX.",".XPQPPPQPPPQPPX.",".XRRRRRRRRRRRRX.",".XPQPPPQPPPQPPX.","..XPQPPQPPPQPX..","..XXXXXXXXXXXX.."]
    L={'X':OL,'B':B9,'C':B10,'S':(G7 if K else BK),'E':(G6 if K else B9),'P':B11,'Q':B10,'R':BR25}
    obj(a,tub,L,0,1)
    if not K: px(a,[(4,3),(10,3)],M16); px(a,[(4,2)],T21)
    else: px(a,[(3,4),(12,4)],BONE)
    C['palme_kuebel']=a
    a=pav(v,12)
    rack=["...XXXXXXXXXX...","...XOOOOOOOOX...","...XCCXDDXEEX...","...XCCXDDXEEX...","...XCCXDDXEEX...","...XOOOOOOOOX...","...XFFXGGXHHX...","...XFFXGGXHHX...","...XFFXGGXHHX...","...XOOOOOOOOX...","...XCCXEEXDDX...","...XCCXEEXDDX...","...XCCXEEXDDX...","...XOOOOOOOOX...","......XOOX......","......XOOX......"]
    if K: L={'X':OL,'O':N3,'C':G6,'D':G7,'E':B13,'F':G7,'G':G6,'H':B12}
    else: L={'X':OL,'O':BR24,'C':BONE,'D':B14,'E':BONE,'F':B14,'G':BONE,'H':B14}
    obj(a,rack,L,0,0)
    if not K:  # tiny motifs on the cards: peach blossom, dome, palm
        px(a,[(4,3),(14,11)],VI30); px(a,[(7,3),(11,7)],T21); px(a,[(11,3),(5,7)],WN); px(a,[(8,7),(4,11),(8,11)],S5)
    else: px(a,[(4,2),(8,6),(12,10)],BONE)
    C['postkarten_oben']=a
    a=pav(v,13)
    obj(a,["......XOOX......","......XOOX......","......XOOX......","......XOOX......","......XOOX......","......XOOX......","......XOOX......","....XXXOOXXX....","...XOOOOOOOOX...","...XXXXXXXXXX..."],{'X':OL,'O':BR24 if not K else N3},0,4)
    if K: px(a,[(5,12),(9,12)],G7)
    C['postkarten_fuss']=a
    def bench(right):
        a=pav(v,14+right)
        rows=["XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","CCCCCCCCCCCCCCCC","XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","CCCCCCCCCCCCCCCC","XXXXXXXXXXXXXXXX","..X..........X..","XXXXXXXXXXXXXXXX","BBBBBBBBBBBBBBBB","CCCCCCCCCCCCCCCC","XXXXXXXXXXXXXXXX","..X..........X..","..X..........X.."]
        L={'X':OL,'B':B11,'C':B10}
        sprite(a,rows,L,0,1)
        if not right: vl(a,0,1,13,OL); vl(a,1,1,13,N2)
        else: vl(a,15,1,13,OL); vl(a,14,1,13,N2)
        if K:
            for y in (2,5,10): 
                for x in range(2,14,3): a[y,x+right]=G7
            px(a,[(4,10),(5,10),(6,10),(9,10),(10,10)],BONE)
        else:
            px(a,[(5,2),(11,5),(7,10)],B12); px(a,[(4,12),(10,13)],N3)
        return a
    C['bank_links']=bench(0); C['bank_rechts']=bench(1)
    a=blank(G6); rect(a,0,0,16,2,S5); rect(a,0,14,16,2,S5); hl(a,0,15,2,N3); hl(a,0,15,13,G7 if K else G6)
    if K:
        rect(a,0,3,16,10,B9); speckle(a,[G7,G6],22,61,where=(a==B9))
        for x in (3,8,12): vl(a,x,5,9,B10); a[4,x]=B11; a[5,x+1]=B11
    else:
        rect(a,0,3,16,10,BK); speckle(a,[B9],10,62,where=(a==BK))
        for x,c in [(2,VI30),(6,WN),(10,VI30),(13,AM27)]:
            vl(a,x,7,11,M16); a[6,x]=M17; a[5,x]=c; a[5,x+1]=c; a[4,x]=c
        px(a,[(4,10),(8,9),(12,10)],T21)
    C['beet']=a
    a=pav(v,16)
    obj(a,["...XXXXXXXX...","..XNSNSNSNSX..",".XSNSNSNSNSNX.",".XNSNSNSNSNSX.",".XSNSNSNSNSNX.",".XNSNSNSNSNSX.","..XNSNSNSNSX..","...XXXXXXXX..."],{'X':OL,'N':N2,'S':N3},1,6)
    if K: px(a,[(5,6),(6,6),(9,6),(3,8),(12,9)],G7)
    else:
        sprite(a,["...HH.....",".HHGGH..H.","HGG..GHHG.","..H...GG.."],{'H':G7,'G':G6},3,1)
        px(a,[(5,13),(6,13),(9,13)],N2)
    C['kanaldeckel']=a
    # row 4: animation frames + edges
    C['glasgang_scheibe_f2']=side(1) if not K else side(0)
    C['glasgang_dach_mitte_f2']=roof(1,'m') if not K else roof(0,'m')
    def edge(d):
        a=pav(v,20+d)
        b=blank(B9 if K else BK)
        if K: speckle(b,[G7,G6],14,70+d)
        else: speckle(b,[B9],8,80+d); px(b,[(3,1),(9,2),(13,1)],M16); px(b,[(3,0),(13,0)],T21)
        a[0:4,:]=b[0:4,:]; hl(a,0,15,4,G6 if K else S5); hl(a,0,15,5,S5 if K else S4); hl(a,0,15,6,N3)
        if K: px(a,[(2,4),(7,4),(11,4)],BONE)
        return np.rot90(a,-d).copy() if d else a
    C['pflaster_kante_n']=edge(0); C['pflaster_kante_o']=edge(1); C['pflaster_kante_s']=edge(2); C['pflaster_kante_w']=edge(3)
    a=planks(base=B11,hi=B12,sh=B10,gap=B9,seed=3,nail=BR24)
    obj(a,["...XXXXXXXX...","..XWWBBBBBBX..","..XWBBBBBBYX..","..XWBBBBBBYX..","..XWBBBBBBYX..","..XWBBBBBBYX..","..XWBBBBBBYX..","..XWBBBBBBYX..",".XXXXXXXXXXXX.","XQQQQQQQQQQQQX","XRRRRRRRRRRRRX","XXXXXXXXXXXXXX"],{'X':OL,'W':BONE,'B':B14,'Y':B12,'Q':BR25,'R':BR24},1,0)
    if K: px(a,[(4,1),(5,1),(10,1),(3,9),(8,9)],G7); px(a,[(1,13),(13,13)],G7)
    else: px(a,[(5,4),(5,5)],AM27); px(a,[(4,13),(12,14)],B10)
    C['pavillon_saeule']=a
    order=['pflaster_1','pflaster_2','pflaster_messing','pflaster_rinne','pflaster_pfuetze','pavillon_boden','pavillon_rosette','pavillon_stufe',
           'kurhaus_gesims','kurhaus_wand','kurhaus_ecke_links','kurhaus_ecke_rechts','kurhaus_fenster','kurhaus_tuer_oben','kurhaus_tuer_unten','kurhaus_sockel',
           'glasgang_dach_links','glasgang_dach_mitte','glasgang_dach_rechts','glasgang_scheibe','glasgang_pfosten','glasgang_boden','messinggelaender','steintreppe',
           'palme_krone','palme_kuebel','postkarten_oben','postkarten_fuss','bank_links','bank_rechts','beet','kanaldeckel',
           'glasgang_scheibe_f2','glasgang_dach_mitte_f2','pflaster_kante_n','pflaster_kante_o','pflaster_kante_s','pflaster_kante_w','laternensockel','pavillon_saeule']
    return order,[C[k] for k in order]
ANIMS_WARM={'glas_tropfen':{'frames':[19,32],'frameRate':2,'repeat':-1},'glasdach_tropfen':{'frames':[17,33],'frameRate':2,'repeat':-1}}
