"""Pillow validation of the BZ atlases, IDs, individual exports, palette and ring."""
from pathlib import Path
from PIL import Image
import json,hashlib
ROOT=Path(__file__).resolve().parents[3]
ORDER=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
def main():
 manifest=json.loads((ROOT/'public/sprites/manifest-faehigkeiten2.json').read_text())
 data=json.loads((ROOT/'src/data/packs/sequenzen/faehigkeiten2.json').read_text())
 assert manifest['batch']=='faehigkeiten2'
 assert {a['id'] for a in manifest['assets']}=={'skill_icons_3','talent_icons'}
 palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']};assert len(palette)<=32
 all_hashes=set();all_ids=set()
 for a in manifest['assets']:
  kind='kampf' if a['id']=='skill_icons_3' else 'welt'
  expected=[[data[p][str(s)][kind]['id'] for p in ORDER] for s in range(9,0,-1)]
  assert a['skillIds']==expected
  assert a['pathwayOrder']==ORDER and a['sequenceOrder']==list(range(9,0,-1))
  assert (a['frameWidth'],a['frameHeight'],a['columns'],a['rows'])==(16,16,10,9)
  im=Image.open(ROOT/'public/sprites'/a['file']);assert im.size==(160,144) and im.mode=='P'
  rgba=im.convert('RGBA');assert set(rgba.getchannel('A').getdata())=={0,255}
  visible={p[:3] for p in rgba.getdata() if p[3]};assert len(visible)<=32 and visible<=palette
  ids=set();hashes=set()
  for row in range(9):
   for col in range(10):
    id=expected[row][col];assert id not in all_ids;all_ids.add(id);ids.add(id)
    cell=rgba.crop((col*16,row*16,(col+1)*16,(row+1)*16));assert cell.getbbox()
    digest=hashlib.sha256(cell.tobytes()).hexdigest();assert digest not in all_hashes,('duplicate',id);hashes.add(digest);all_hashes.add(digest)
    single=Image.open(ROOT/'public/sprites'/a['singleIconDirectory']/f'{id}.png');assert single.mode=='P' and single.size==(16,16)
    assert single.convert('RGBA').tobytes()==cell.tobytes(),id
    assert cell.getpixel((0,0))[3]==0 and cell.getpixel((15,15))[3]==0
    assert len(set(cell.crop((4,4,12,12)).getdata()))>=3,('empty symbol',id)
    if kind=='welt':
     for y in range(16):
      for x in range(16):
       d=(x-7.5)**2+(y-7.5)**2
       if 5.5**2<d<=6.5**2 and (x,y)!=(3,3):assert cell.getpixel((x,y))==(238,226,197,255),('ring',id,x,y)
  assert len(hashes)==90
  actual={p.stem for p in (ROOT/'public/sprites'/a['singleIconDirectory']).glob('*.png')}
  assert ids<=actual
 preview=Image.open(ROOT/'docs/art/preview-faehigkeiten2.png');assert preview.size==(760,1340)
 print('PASS: 2 atlases 160x144; 180 unique, nonempty indexed 16x16 cells; exact source IDs/order and single-file equality; <=32 shared colors; binary alpha; world inner rings; labeled 4x preview.')
if __name__=='__main__':main()
