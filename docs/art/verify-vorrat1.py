#!/usr/bin/env python3
"""Validate BI reserve art. Requires Pillow; no game integration."""
import json
import hashlib
from collections import Counter
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[2];S=R/'public/sprites'
GROUPS={'cw':'letternlaeufer rohrpostwespe stempelhand durchschlag registerratte seilbahnwaechter tintenschatten leerfracht boss_bleisammler boss_blinder_zusteller boss_nullfundament','bh':'dampfschwester wurzelgaenger glasmotte bluetenkopf rohrwurm postkartenschreiber waeschegeist sudtraeger boss_glasgaertner boss_waescherei boss_mutterwurzel','all':'wegelagerer kutschengeist zollhund nebelkraehe marktschreier grenzstein fuhrmannsschatten brueckenzoll boss_landvermesser boss_schlafkutsche'}
IDS={f'vg_{g}_{n}' for g,names in GROUPS.items() for n in names.split()}
BOSSES={id for id in IDS if '_boss_' in id}
NONLETHAL={'vg_cw_durchschlag','vg_bh_postkartenschreiber','vg_all_marktschreier','vg_bh_wurzelgaenger'}
BACKGROUNDS={'alte_setzerei','sortiergrube','nullfundament','kaltes_palmhaus','verlassene_waescherei','wurzelkammer','landstrasse'}
def verify():
 m=json.loads((S/'manifest-vorrat1.json').read_text());g=json.loads((R/'docs/art/batch-vorrat1-generation.json').read_text());assets=m['assets']
 expected={f'{folder}/{prefix}{id}.png' for id in IDS for folder,prefix in [('battle','enemy_'),('characters','F_ow_'),('ui/bestiary','F_')]}
 expected|={f'ui/BI_boss_{id}.png' for id in BOSSES}|{f'battle/bg_vorrat_{b}.png' for b in BACKGROUNDS}|{'fx/BI_vorrat_fx.png'}
 assert len(expected)==112 and len(assets)==112
 assert len({a['id'] for a in assets})==112
 assert {a['file'] for a in assets}==expected
 assert Counter(a['kind'] for a in assets)=={'battle':32,'walk':32,'bestiary':32,'bossBand':8,'background':7,'fx':1}
 palette={tuple(bytes.fromhex(c[1:])) for c in m['palette']};assert len(palette)<=32
 used=set();hashes=set()
 for a in assets:
  with Image.open(S/a['file']) as image:
   assert image.format=='PNG' and image.mode in ['P','RGBA'],a['id']
   im=image.convert('RGBA');fw,fh,cols,rows=[a[k] for k in ['frameWidth','frameHeight','columns','rows']]
   assert im.size==(a['width'],a['height'])==(fw*cols,fh*rows),a['id']
   pixels=list(im.getdata());alpha={p[3] for p in pixels};assert alpha==({0,255} if a['transparent'] else {255}),a['id']
   colors={p[:3] for p in pixels if p[3]};assert colors<=palette,a['id'];used|=colors
   digest=hashlib.sha256(im.tobytes()).hexdigest();assert digest not in hashes,a['id'];hashes.add(digest)
   kind=a['kind']
   if kind=='battle':
    assert cols==6 and rows==(7 if a['gameId'].endswith(('boss_nullfundament','boss_mutterwurzel')) else 4)
    if a['gameId'] in BOSSES:assert (fw,fh)==((128,96) if rows==7 else (96,96))
    else:assert fw==fh and fw in [48,64]
    assert a['occupiedCounts']==[4,6,3,4]+[6]*(rows-4)
    assert a['heldRows']==[1]+list(range(4,rows))
    for row in a['heldRows']:assert im.crop((0,row*fh,fw,(row+1)*fh)).tobytes()==im.crop((fw,row*fh,fw*2,(row+1)*fh)).tobytes(),a['id']
    if a['gameId'] in NONLETHAL:assert any(t in a['defeatMeaning'] for t in ['alive','paper']),a['id']
   if kind=='walk':assert (fw,fh,cols,rows)==(16,32,4,4)
   if kind=='bestiary':assert im.size==(96,128)
   if kind=='bossBand':assert im.size==(160,160)
   if kind=='background':assert im.size==(480,270)
   if kind=='fx':assert (fw,fh,cols,rows)==(48,48,6,1)
   if 'occupiedCounts' in a:
    for row,n in enumerate(a['occupiedCounts']):
     occupied=[]
     for col in range(cols):
      cell=im.crop((col*fw,row*fh,(col+1)*fw,(row+1)*fh));box=cell.getbbox()
      if col>=n:assert box is None,(a['id'],row,col)
      else:
       assert box and box[0]>0 and box[1]>0 and box[2]<fw and box[3]<fh,(a['id'],row,col,box)
       assert box[3]==a['baseline'],(a['id'],row,col,'baseline')
       occupied.append(hashlib.sha256(cell.tobytes()).hexdigest())
     if kind in ['battle','walk']:assert len(set(occupied))>=min(3,n),(a['id'],row,'static row')
   for animation in a['animations'].values():assert animation['frames'] and all(0<=i<cols*rows for i in animation['frames'])
 assert len(used)<=32
 assert len(g['jobs'])==112 and {j['file'] for j in g['jobs']}==expected
 for j in g['jobs']:assert j['prompt'] and j['references'] and len(j['sourceSha256'])==64
 for kind in ['battle','walk','bestiary','bossBand','background','fx']:assert (R/f'docs/art/preview-vorrat1-{kind}.png').is_file()
 print(f'PASS: 32 enemies/bosses, 112 PNGs, {len(used)} shared colors, frame bounds, held anticipation, nonlethal metadata, unique art and provenance.')
if __name__=='__main__':verify()
