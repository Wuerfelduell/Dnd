from tk import *
from ground import *
def cells(v):
    K=v=='kalt'; C={}
    def kies(seed=1):
        if K:
            a=gravel(base=G6,cols=(S5,S5,G7),seed=seed,n=26)
        else:
            a=gravel(base=B11,cols=(B10,B12,B10),seed=seed,n=26)
        return a
    C['kiesweg']=kies(1); C['kiesweg_2']=kies(2)
    def soil(seed=5):
        if K:
            a=blank(B9); speckle(a,[B10],10,seed); speckle(a,[G6],6,seed+1); speckle(a,[G7],4,seed+2)
        else:
            a=blank(BK); speckle(a,[B9],12,seed); speckle(a,[B10],4,seed+1)
        return a
    def edge(d,top_fn):
        a=kies(10+d); b=top_fn(20+d)
        a[0:5,:]=b[0:5,:]; hl(a,0,15,5,B12 if not K else G7); hl(a,0,15,6,B10 if not K else S5)
        return np.rot90(a,-d).copy() if d else a
    C['kies_kante_n']=edge(0,soil); C['kies_kante_s']=edge(2,soil); C['kies_kante_w']=edge(3,soil); C['kies_kante_o']=edge(1,soil)
    C['erde']=soil(7)
    a=kies(8)
    for (x,y) in [(1,1),(9,9)]:
        rect(a,x,y,6,5,S4 if K else S5); hl(a,x,x+5,y,S5 if K else G6); hl(a,x,x+5,y+4,N3); vl(a,x+5,y,y+4,N3)
        if K: a[y,x+1]=G7; a[y,x+3]=BONE
        else: a[y+2,x+2]=S4
    C['trittplatten']=a
    # greenhouse wall: glass in iron
    def panefill(a,x0,y0,w,h,seed,writing=False):
        r=rng(seed)
        if K:
            rect(a,x0,y0,w,h,G7)
            for i in range(w*h//8):
                x,y=x0+int(r.integers(w)),y0+int(r.integers(h)); a[y,x]=G6
            for t in range(3): a[y0+h-1-t,x0]=BONE; a[y0+h-1,x0+t]=BONE
            a[y0+h-2,x0+1]=BONE
            if writing:  # faint scratches through the frost
                for (sx,sy,dx,dy,n) in [(x0+1,y0+2,1,0,4),(x0+2,y0+3,1,1,2),(x0+6,y0+2,0,1,3),(x0+8,y0+4,1,-1,3),(x0+2,y0+h-3,1,0,6)]:
                    for i in range(n):
                        xx,yy=sx+dx*i,sy+dy*i
                        if x0<=xx<x0+w and y0<=yy<y0+h: a[yy,xx]=S5
        else:
            rect(a,x0,y0,w,h,S5)
            # plants pressing against the fogged glass from inside
            for (cx,cy) in [(x0+2,y0+h-2),(x0+w-3,y0+h-3),(x0+w//2,y0+h-1)]:
                for dy in range(-2,1):
                    for dx in range(-2,3):
                        if abs(dx)+abs(dy)<=2 and y0<=cy+dy<y0+h and x0<=cx+dx<x0+w: a[cy+dy,cx+dx]=T20
                if y0<=cy-1<y0+h: a[cy-1,cx]=T21
            rect(a,x0,y0,w,1,G6)
            for i in range(w*h//9):
                x,y=x0+int(r.integers(w)),y0+int(r.integers(h)); 
                if a[y,x]==S5: a[y,x]=G6
            for k,dx in enumerate(range(1,w,4)):
                yy=y0+1+(k*3)%(h-2)
                for t in range(y0+1,yy): a[t,x0+dx]=S4
                a[yy,x0+dx]=G7
            if writing:  # fingertip strokes wiped into the condensate (no letters)
                for (sx,sy,dx,dy,n) in [(x0+1,y0+2,1,0,4),(x0+2,y0+3,1,1,2),(x0+6,y0+2,0,1,3),(x0+8,y0+4,1,-1,3),(x0+2,y0+h-4,1,0,6)]:
                    for i in range(n):
                        xx,yy=sx+dx*i,sy+dy*i
                        if x0<=xx<x0+w and y0<=yy<y0+h: a[yy,xx]=N3
                        if x0<=xx<x0+w and y0<=yy+1<y0+h and a[yy+1,xx]!=N3: a[yy+1,xx]=S4
    def gwall(seed,writing=False,top=False,base=False):
        a=blank(N2)
        panefill(a,1,0,14,16,seed,writing)
        vl(a,0,0,15,OL); vl(a,15,0,15,N2); vl(a,8,0,15,N2); vl(a,7,0,15,N3)
        hl(a,0,15,7,N2); hl(a,0,15,8,N3)
        if top:
            rect(a,0,0,16,3,N2); hl(a,0,15,0,OL); hl(a,0,15,1,N3); hl(a,0,15,3,OL)
            for x in range(2,16,4): a[2,x]=BR24
            if K:
                for x in (2,5,10,13): vl(a,x,4,4+(x%3),BONE)
            else:
                for x in (3,11): a[4,x]=G7; a[5,x]=S4
        if base:
            rect(a,0,11,16,5,B9); hl(a,0,15,10,OL); hl(a,0,15,11,B10); hl(a,0,15,13,BK)
            for x in (3,11): vl(a,x,11,12,BK)
            for x in (7,15): vl(a,x,14,15,BK)
            if K: hl(a,0,15,15,G7); px(a,[(2,11),(9,11),(13,12)],G7)
            else: px(a,[(5,15),(6,15),(12,14)],N2)
        return a
    C['glaswand_traufe']=gwall(31,top=True)
    C['glaswand']=gwall(32)
    C['glaswand_schrift']=gwall(33,writing=True)
    a=gwall(34); rect(a,0,0,4,16,N2); vl(a,0,0,15,OL); vl(a,1,0,15,S4); vl(a,3,0,15,OL)
    for y in (3,12): a[y,2]=BR25
    C['glaswand_pfosten_links']=a
    a=gwall(35); rect(a,12,0,4,16,N2); vl(a,12,0,15,OL); vl(a,13,0,15,S4); vl(a,15,0,15,OL)
    for y in (3,12): a[y,14]=BR25
    C['glaswand_pfosten_rechts']=a
    def door(top):
        a=gwall(36,top=top,base=False)
        rect(a,2,0 if not top else 4,12,16 if not top else 12,N2)
        panefill(a,3,1 if not top else 5,4,14 if not top else 11,37)
        panefill(a,9,1 if not top else 5,4,14 if not top else 11,38)
        vl(a,2,0,15,OL); vl(a,13,0,15,OL); vl(a,7,0,15,OL); vl(a,8,0,15,N3)
        if not top:
            hl(a,2,13,15,OL); a[8,6]=BR25; a[8,9]=BR25
            rect(a,0,13,2,3,B9); rect(a,14,13,2,3,B9)
        else:
            hl(a,2,13,4,OL)
        return a
    C['glastuer_oben']=door(True); C['glastuer_unten']=door(False)
    C['glaswand_sockel']=gwall(39,base=True)
    # beds
    def bedframe(seed):
        a=kies(40+seed)
        rect(a,1,2,14,13,B10); hl(a,1,14,2,B11); hl(a,1,14,14,B9); vl(a,1,2,14,B11); vl(a,14,2,14,B9)
        outline(a,np.pad(np.ones((13,14),bool),((2,1),(1,1))))
        return a
    def closed(sign=None):
        a=bedframe(1)
        for y in range(4,14,3): hl(a,2,13,y,B9); hl(a,2,13,y+1,B11 if not K else G6); 
        rect(a,2,3,12,1,B11)
        if K: speckle(a,[G7],10,44,where=(a==B10)); px(a,[(4,4),(9,7),(12,10)],BONE)
        else: px(a,[(5,6),(10,9)],S5)
        if sign is not None:
            obj(a,["XXXXXX","XWWWWX","XWYYWX","XWWWWX","XXXXXX","..XX.."],{'X':OL,'W':B14 if not K else G7,'Y':B12 if sign=='front' else B11},5,5)
            if sign=='back': px(a,[(7,7),(8,7)],B10); a[6,6]=B11
        return a
    C['beet_geschlossen']=closed()
    C['beet_geschlossen_schild']=closed('front')
    def openbed(stage):
        a=bedframe(2); rect(a,2,3,12,11,BK if not K else B9); speckle(a,[B9 if not K else G6],12,46,where=(a==(BK if not K else B9)))
        if stage==0: return a
        if K:  # dormant: stiff grey stalk, closed rimed bud
            vl(a,7,6,12,M16); vl(a,8,8,12,M15); px(a,[(6,9),(9,10)],M16); px(a,[(5,8),(10,9)],M17)
            sprite(a,["XX","GW","GG"],{'X':OL,'G':M17,'W':G7},7,4)
            if stage==2: px(a,[(6,4),(9,4)],G7)
        else:
            sprite(a,["....X.....","...XLX.X..",".X.XMXXLX.","XLXXMXLMX.",".XMLMMMX..","..XMMMX...","....M.....","....M....."],{'X':OL,'L':M17,'M':T21},3,5)
            if stage>=2:
                bl=[["..XXX..",".XPQPX.","XPQAQPX",".XPQPX.","..XXX.."],[".X...X.","XPX.XPX",".XQAQX.","XPXQXPX",".X.X.X."]][stage-2]
                sprite(a,bl,{'X':OL,'P':VI30,'Q':WN,'A':AM27},4,1)
        return a
    C['beet_offen']=openbed(0); C['beet_pflanze']=openbed(1); C['beet_bluete']=openbed(2)
    def bedrow(side):
        a=kies(60+side)
        if side in (0,1):
            y0=0 if side==0 else 9
            rect(a,0,y0,16,7,B10); hl(a,0,15,y0,B11); hl(a,0,15,y0+6,B9); hl(a,0,15,y0+7 if side==0 else y0-1,OL)
            for x in range(3,16,6): vl(a,x,y0+1,y0+5,B9)
            if K: speckle(a,[G7],6,70+side,where=(a==B10))
        else:
            rect(a,0,0,7,7,B10); hl(a,0,6,0,B11); hl(a,0,6,6,B9); vl(a,7,0,7,OL); hl(a,0,7,7,OL)
            if K: px(a,[(2,2),(4,4)],G7)
        return a
    C['beet_rand_n']=bedrow(0); C['beet_rand_s']=bedrow(1); C['beet_ecke']=bedrow(2)
    # irrigation channels: stone trough, dry or running
    def chan(kind,f=0):
        a=kies(80)
        def trough_h(a):
            rect(a,0,5,16,6,S4); hl(a,0,15,5,S5); hl(a,0,15,10,N3); rect(a,0,7,16,2,N2)
        def trough_v(a):
            rect(a,5,0,6,16,S4); vl(a,5,0,15,S5); vl(a,10,0,15,N3); rect(a,7,0,2,16,N2)
        if kind in ('h','x','end'): trough_h(a)
        if kind in ('v','x'): trough_v(a)
        if kind=='ecke':
            rect(a,5,5,11,6,S4); hl(a,5,15,5,S5); hl(a,5,15,10,N3); rect(a,5,5,6,11,S4); vl(a,5,5,15,S5); vl(a,10,10,15,N3)
            rect(a,7,7,9,2,N2); rect(a,7,7,2,9,N2)
        if kind=='end':
            rect(a,10,4,6,8,S4); hl(a,10,15,4,S5); hl(a,10,15,11,N3)
            obj(a,["XXX","XBX","XXX"],{'X':OL,'B':BR24},12,6)
        water=(a==N2)
        if K:  # dry: dust and rime in the groove
            ys,xs=np.nonzero(water)
            for i,(y,x) in enumerate(zip(ys,xs)):
                if (x*3+y*5)%7==0: a[y,x]=G6
                elif (x+y)%5==0: a[y,x]=B9
        else:
            ys,xs=np.nonzero(water)
            for (y,x) in zip(ys,xs):
                a[y,x]=T20
                ph=(x+y+f*2)%4
                if ph==0: a[y,x]=T21
                if ph==0 and (x*y)%3==0: a[y,x]=G6
        return a
    C['rinne_h']=chan('h'); C['rinne_v']=chan('v'); C['rinne_ecke']=chan('ecke'); C['rinne_kreuzung']=chan('x'); C['rinne_ende']=chan('end')
    a=chan('h'); obj(a,["XXXX","XNNX","XSSX","XSSX","XNNX","XXXX"],{'X':OL,'N':N3,'S':BR24},6,3)
    if not K: hl(a,0,5,7,T21)
    C['rinne_schieber']=a
    a=kies(90)
    obj(a,["...XXXX...","...XNSX...","...XNSX...","...XNSX...","...XNSX...","...XNSX...","...XNSX...","...XNSX...","...XNSX...","..XXNSXX..",".XNNNSSSX.",".XXXXXXXX."],{'X':OL,'N':N3,'S':S4},3,0)
    if K: px(a,[(5,2),(5,7),(4,10)],G7)
    else: px(a,[(6,4),(6,9)],S5); px(a,[(3,13),(11,14)],B10)
    C['eisensaeule']=a
    a=kies(91)
    obj(a,["XXXXXXXXXXXXXX","XBBBBBBBBBBBBX","XPPPPPPPPPPPPX","XXXXXXXXXXXXXX","X............X","XXXXXXXXXXXXXX","XBBBBBBBBBBBBX","XPPPPPPPPPPPPX","XXXXXXXXXXXXXX","X............X"],{'X':OL,'B':B11,'P':B9},1,3)
    for x in range(2,14,3):
        if K: a[4,x]=M16; a[3,x]=G7; a[9,x]=M16
        else: a[4,x]=T21; a[3,x]=M17; a[9,x]=T21; a[8,x]=M17
    C['anzucht_regal']=a
    C['beet_bluete_f2']=openbed(3) if not K else openbed(2)
    C['rinne_h_f2']=chan('h',1); C['rinne_v_f2']=chan('v',1); C['rinne_ecke_f2']=chan('ecke',1)
    a=kies(95)
    if K: px(a,[(3,3),(4,3),(11,8),(6,12)],B9); px(a,[(3,2),(11,7)],G7)
    else: px(a,[(3,3),(4,4),(11,8),(12,8),(6,12),(13,13)],VI30); px(a,[(4,3),(12,9)],WN)
    C['kies_laub']=a
    a=soil(96)
    for y in (3,8,13):
        hl(a,0,15,y,B10 if not K else G6)
        for x in range(1,16,3): a[y-1,x]=(T21 if not K else M15)
    C['erde_saatreihen']=a
    def roofpane(first):
        a=blank(N2); panefill(a,0,1,16,14,97)
        hl(a,0,15,0,OL); hl(a,0,15,15,OL); vl(a,7,0,15,N2); vl(a,8,0,15,N3)
        if first: rect(a,0,0,16,3,N2); hl(a,0,15,1,S4); hl(a,0,15,3,OL); px(a,[(3,1),(11,1)],BR25)
        return a
    C['glasdach']=roofpane(False); C['glasdach_first']=roofpane(True)
    order=['kiesweg','kiesweg_2','kies_kante_n','kies_kante_s','kies_kante_w','kies_kante_o','erde','trittplatten',
           'glaswand_traufe','glaswand','glaswand_schrift','glaswand_pfosten_links','glaswand_pfosten_rechts','glastuer_oben','glastuer_unten','glaswand_sockel',
           'beet_geschlossen','beet_geschlossen_schild','beet_offen','beet_pflanze','beet_bluete','beet_rand_n','beet_rand_s','beet_ecke',
           'rinne_h','rinne_v','rinne_ecke','rinne_kreuzung','rinne_ende','rinne_schieber','eisensaeule','anzucht_regal',
           'beet_bluete_f2','rinne_h_f2','rinne_v_f2','rinne_ecke_f2','kies_laub','erde_saatreihen','glasdach','glasdach_first']
    return order,[C[k] for k in order]
ANIMS_WARM={'bluete':{'frames':[20,32],'frameRate':2,'repeat':-1},'rinne_h':{'frames':[24,33],'frameRate':4,'repeat':-1},
            'rinne_v':{'frames':[25,34],'frameRate':4,'repeat':-1},'rinne_ecke':{'frames':[26,35],'frameRate':4,'repeat':-1}}
