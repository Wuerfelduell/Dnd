import importlib, numpy as np
MODS=[('bh_promenade','promenade'),('bh_kessel','kessel'),('bh_glas','glas'),('bh_stille','stille'),('bh_klinik','klinik'),('bh_wurzel','wurzel')]
def recolor(a,b):
    m={}
    for x,y in zip(a.ravel(),b.ravel()):
        if m.setdefault(int(x),int(y))!=int(y): return False
    return True
for t,mod in MODS:
    m=importlib.import_module(mod); names,k=m.cells('kalt'); _,w=m.cells('warm')
    anim_frames=set(i for s in m.ANIMS_WARM.values() for i in s['frames'])
    for v,cs in (('kalt',k),('warm',w)):
        seen={}
        for i,c in enumerate(cs):
            key=c.tobytes()
            if key in seen: print(t,v,'DUP',names[seen[key]],names[i])
            else: seen[key]=i
    same=[names[i] for i in range(40) if (k[i]==w[i]).all()]
    rec=[names[i] for i in range(40) if recolor(k[i],w[i]) and not (k[i]==w[i]).all()]
    print(t,'identical',same,'pure-recolor',len(rec),rec)
