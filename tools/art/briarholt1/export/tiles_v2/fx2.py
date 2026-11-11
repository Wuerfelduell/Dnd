"""fx/bh_waerme.png v2 - frames drawn by hand as pixel maps (same regions as before)."""
from tk import *
L={'.':-1,'O':OL,'a':S4,'b':S5,'c':G6,'d':G7,'w':BONE,'t':T21,'q':TQ,'u':T22,'v':VI29,'p':VI30,'l':VL28,'n':N3,'m':N2,'k':N1,'r':BR24,'s':BR25}
def grid(rows,w=16,h=16):
    a=np.full((h,w),-1,np.int16)
    for y,r in enumerate(rows):
        for x,ch in enumerate(r): a[y,x]=L[ch]
    return a
PIPE=["OOOOOO","Onbbbn","Onaaan","OOOOOO"]
def steam(rows):
    g=grid(rows+["................"]*(12-len(rows)) if len(rows)<12 else rows[:12])
    for i,r in enumerate(PIPE):
        for x,ch in enumerate(r): g[12+i,x]=L[ch]
    return g
DAMPF=[
 ["................","................","................","................","................","................","................","........cc......","......ccddc.....","......cddc......","......cdc.......","......cc........"],
 ["................","................","................","................",".........cc.....","........cddc....",".......cdddcc...",".......cddddc...","........cddc....",".........cc.....",".......cc.......","......cd........"],
 ["................","..........cc....",".........cddc...","........cdddcc..","........cddddc..",".........cddc....".rstrip()[:16],"..........cc....","................","........c.......",".......cdc......","......cddc......","......cc........"],
 ["...........c....","..........c.c...",".........c...c..","..........c.....","...........c....","................","................","........cc......",".......cddc.....","......cdddc.....","......cddc......","......cc........"]]
FOG=["...cccccccccc...",
     ".ccccccdccccccc.",
     "cccdcccccccccdcc",
     "cccccccccccccccc",
     "cccccccccccccccc",
     "ccccccccccccccdc",
     "cdcccccccccccccc",
     "cccccccccccccccc",
     "cccccccccccccccc",
     "cccccccccccccccc",
     "ccccccccccccdccc",
     "cccccccccccccccc",
     "cccccccccccccccc",
     ".cccccccccccccc.",
     "..bcccbcccccbc..",
     "...b..b.....b..."]
STROKES=[(2,5),(3,4),(4,5),(4,6),(3,6),(2,6),(5,5),(6,4),(6,5),(7,6),(8,5),(8,4),(9,5),(10,6),(11,5),(12,4),(12,5),(12,6),(13,6),
         (2,10),(3,9),(4,9),(5,10),(6,11),(6,10),(7,9),(8,10),(9,11),(10,10),(10,9),(11,10),(12,11),(13,10)]
def schrift(p):
    g=grid(FOG)
    n=[0,7,15,22,33,33][p]
    for (x,y) in STROKES[:n]: g[y,x]=N2
    for (x,y) in STROKES[:n]:
        if g[y+1,x]==G6: g[y+1,x]=S5
    if p==5:
        for (x,y0) in [(4,7),(12,7),(6,12),(12,12)]:
            for y in range(y0,y0+2): g[y,x]=S4
        g[5,8]=TQ
    if p==4: g[5,8]=T22
    return g
FERN=["dd.c......c.dddd",
      "dwd.c....c.dwwdd",
      ".dwd.c..c.dwd.dd",
      "c.dwdd.c.dwd..c.",
      ".c.dwwddwd...c..",
      "..c.dwwwd...c...",
      "...ddwwd...c....",
      "..c.dwd.c.......",
      ".c.dwd...c......",
      "c.dwd.....c..c..",
      ".dwd.c.....c.dc.",
      "dwd...c...c.dwd.",
      "dwwd...c.c.dwd..",
      "dwwwd...c.dwd...",
      "wwwwdd.c.dwwd...",
      "wwwwwddcdwwwwd.."]
def reif(p):
    full=grid(FERN); g=np.full((16,16),-1,np.int16)
    lim=[5,9,14,99][p]
    for y in range(16):
        for x in range(16):
            d=min(np.hypot(x,15-y),np.hypot(15-x,y)*1.2)
            if d<lim: g[y,x]=full[y,x]
    return g
BLOB=[".pp..","plppv","pllpv",".pv.."]
def puls(p):
    g=np.full((16,16),-1,np.int16)
    for y,r in enumerate(BLOB):
        for x,ch in enumerate(r):
            if ch!='.': g[6+y,(x+p*4+1)%16]=L[ch]
    # faint trail
    for k in (1,2):
        x=(p*4+1-k*2)%16; g[8,x]=VI29
    return g
def sperre(p):
    g=np.full((32,32),-1,np.int16)
    # spray bar
    for x in range(1,31):
        g[2,x]=OL; g[3,x]=S5; g[4,x]=S4; g[5,x]=OL
    g[2:6,1]=OL; g[2:6,30]=OL
    for x in (3,28): g[3,x]=BR25; g[4,x]=BR24
    for x in range(5,28,5): g[6,x]=OL; g[6,x+1]=OL
    # water curtain: streams per column, highlights move down by 3px per frame
    base={0:S5,1:G6,2:S5,3:S4,4:S5}
    for x in range(3,29):
        if x%5==2:   # thin gap between sheets: only falling drops
            for y in range(7,27):
                if (y-p*3+x*3)%7==0: g[y,x]=G7
            continue
        for y in range(7,27): g[y,x]=base[x%5]
        off=(x*7)%12
        for y in range(7,27):
            ph=(y-7-p*3-off)%12
            if ph==0: g[y,x]=G7
            elif ph==1: g[y,x]=G6 if base[x%5]!=G6 else G7
            elif ph==6 and x%5==4: g[y,x]=T21
        g[7,x]=G7; g[8,x]=G6
    # edges of the sheet
    for y in range(7,27): 
        if g[y,3]!=-1: g[y,2]=S4
        g[y,29]=S4
    # splash pool
    pool=["....aaaaaaaaaaaaaaaaaaaa....","..aabbbbbbbbbbbbbbbbbbbbaa..",".abbbcbbbbbbcbbbbbcbbbbbba.","..aabbbbbbbbbbbbbbbbbbbbaa..","....aaaaaaaaaaaaaaaaaaaa...."]
    for y,r in enumerate(pool):
        for x,ch in enumerate(r):
            if ch!='.': g[26+y,2+x]=L[ch]
    spl=[[(5,25),(13,24),(21,25),(26,24)],[(8,24),(16,25),(24,24),(4,24)],[(6,24),(11,25),(19,24),(27,25)],[(9,25),(15,24),(22,24),(3,25)]][p]
    for (x,y) in spl: g[y,x]=BONE; g[y-1,x]=G7 if g[y-1,x]==-1 else g[y-1,x]
    return g
COLS={'warm':(AM26,BR24),'kalt':(S5,N2),'belastet':(VI30,VI29)}
def leit(kind,c1,c2):
    g=np.full((16,16),-1,np.int16)
    cells=[]
    if kind in ('h','t'): cells+=[(x,y) for x in range(16) for y in (7,8)]
    if kind=='v': cells+=[(x,y) for y in range(16) for x in (7,8)]
    if kind=='ecke': cells+=[(x,y) for x in range(7,16) for y in (7,8)]+[(x,y) for y in range(7,16) for x in (7,8)]
    if kind=='t': cells+=[(x,y) for y in range(7,16) for x in (7,8)]
    for (x,y) in cells: g[y,x]=c1
    for (x,y) in cells:
        for dx,dy in ((0,1),(1,0),(0,-1),(-1,0)):
            X,Y=x+dx,y+dy
            if 0<=X<16 and 0<=Y<16 and g[Y,X]==-1: g[Y,X]=c2
    return g
def build():
    import json
    m=json.load(open('/workspace/Dnd/public/sprites/manifest-briarholt1.json'))
    R=[a for a in m['assets'] if a['file']=='fx/bh_waerme.png'][0]['regions']
    fr={}
    for i,rows in enumerate(DAMPF): fr[f'dampf_rohr_{i}']=steam(rows)
    for p in range(6): fr[f'kondensat_schrift_{p}']=schrift(p)
    for p in range(4): fr[f'reif_uebergang_{p}']=reif(p); fr[f'ruecklauf_puls_{p}']=puls(p); fr[f'kondensat_sperre_{p}']=sperre(p)
    for k,(c1,c2) in COLS.items():
        for kind in ('h','v','ecke','t'): fr[f'leitung_{k}_{kind}']=leit(kind,c1,c2)
    sheet=np.full((80,256),-1,np.int16)
    for name,r in R.items():
        f=fr[name]; assert f.shape==(r['height'],r['width']),name
        sheet[r['y']:r['y']+r['height'],r['x']:r['x']+r['width']]=f
    assert set(R)==set(fr), set(R)^set(fr)
    return sheet
def save_fx(sheet,path):
    rgb=PAL[np.clip(sheet,0,31)]; al=np.where(sheet<0,0,255).astype(np.uint8)
    rgba=np.dstack([rgb,al]).astype(np.uint8); rgba[al==0,:3]=0
    save_png(rgba,path)
if __name__=='__main__':
    s=build(); save_fx(s,'/workspace/ci/t2/out_bh_waerme.png')
    from PIL import Image
    im=Image.open('/workspace/ci/t2/out_bh_waerme.png').convert('RGBA'); bg=Image.new('RGBA',im.size,(60,40,60,255)); bg.alpha_composite(im)
    bg.resize((im.width*5,im.height*5),Image.NEAREST).save('/tmp/fx_v2b.png'); bg.crop((0,0,256,16)).resize((256*6,96),Image.NEAREST).save('/tmp/fx_row0b.png')
