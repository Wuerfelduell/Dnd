import sys,importlib,numpy as np
from tk import *
from PIL import Image, ImageDraw
m=importlib.import_module(sys.argv[1])
ok,kc=m.cells('kalt'); _,wc=m.cells('warm')
k=sheet(kc); w=sheet(wc)
gap=np.full((k.shape[0],2),WN)
img=up(np.hstack([k,gap,w]),6); img.save(f'/tmp/{sys.argv[1]}_kw.png')
# seamless test for first ground cells
idx=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 else [0,1]
row=[]
for v in (kc,wc):
    row.append(np.hstack([np.pad(tile3(v[i]),((2,2),(2,2)),constant_values=WN) for i in idx]))
up(np.vstack(row),4).save(f'/tmp/{sys.argv[1]}_tile.png')
