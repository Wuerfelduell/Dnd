"""Validate CA independently of export.py. Run from any working directory."""
import hashlib
import json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[3]
PATHS = ['laterne','faden','maske','echo','kessel','eisen','schluessel','waage','moor','uhr']

def check():
    manifest=json.loads((ROOT/'public/sprites/manifest-skill-icons-hoch.json').read_text())
    assert manifest['batch']=='skill_icons_hoch'
    palette={tuple(bytes.fromhex(c[1:])) for c in manifest['palette']}
    assert len(palette)<=32
    assert len(manifest['assets'])==2
    seen={}; expected_files=set(); all_colors=set()
    for asset,(key,paths,seqs,suffix) in zip(manifest['assets'],[
        ('hoch',PATHS,[4,3,2,1],'hoch'),('neu',PATHS[7:],[9,8,7,6,5],'stufe')]):
        cols,rows=len(paths),len(seqs)
        assert asset['id']==f'skill_icons_{key}'
        assert asset['file']==f'ui/skill_icons_{key}.png'
        assert asset['pathwayOrder']==paths and asset['sequenceOrder']==seqs
        assert (asset['columns'],asset['rows'])==(cols,rows)
        assert (asset['frameWidth'],asset['frameHeight'])==(16,16)
        assert (asset['width'],asset['height'])==(cols*16,rows*16)
        expected=[[f'{p}_{suffix}_{s}' for p in paths] for s in seqs]
        assert asset['skillIds']==expected, 'Wrong ID order'
        src=Image.open(ROOT/'public/sprites'/asset['file'])
        assert src.mode=='P', 'PNG must be palette indexed'
        assert src.size==(cols*16,rows*16)
        im=src.convert('RGBA')
        colors=set(im.getdata())
        assert {c[3] for c in colors}=={0,255}, 'Alpha must be binary with transparency'
        visible={c[:3] for c in colors if c[3]}
        assert visible<=palette and len(colors)<=32
        all_colors |= visible
        for row,ids in enumerate(expected):
            for col,ident in enumerate(ids):
                cell=im.crop((col*16,row*16,(col+1)*16,(row+1)*16))
                alpha=cell.getchannel('A')
                assert alpha.getbbox() is not None, f'Empty: {ident}'
                assert sum(v==255 for v in alpha.getdata())>=100, f'Sparse: {ident}'
                assert len({p[:3] for p in cell.getdata() if p[3]})>=4, f'Blank medallion: {ident}'
                digest=hashlib.sha256(cell.tobytes()).hexdigest()
                assert digest not in seen, f'Duplicate: {ident} and {seen.get(digest)}'
                seen[digest]=ident
                file=ROOT/f'public/sprites/ui/skills_hoch/{ident}.png'
                expected_files.add(file.name)
                single=Image.open(file)
                assert single.mode=='P' and single.size==(16,16)
                assert single.convert('RGBA').tobytes()==cell.tobytes(), f'Atlas/single mismatch: {ident}'
                if key=='hoch' and seqs[row]<=3:
                    assert cell.getpixel((12,4))==(111,224,208,255), f'Missing spark: {ident}'
                if key=='hoch' and seqs[row]==1:
                    assert cell.getpixel((8,8))==(230,220,195,255), f'Missing core: {ident}'
    assert len(seen)==55 and len(all_colors)<=31
    assert {p.name for p in (ROOT/'public/sprites/ui/skills_hoch').glob('*.png')}==expected_files
    assert (ROOT/'docs/art/preview-skill-icons-hoch.png').is_file()
    generation=json.loads((ROOT/'docs/art/batch-skill-icons-hoch-generation.json').read_text())
    assert len(generation['prompts'])==2
    for entry in generation['prompts']:
        assert entry['prompt'].startswith('STYLE GUIDE')
        assert (ROOT/entry['source']).is_file()
    print(f'PASS: 2 indexed atlases, 55 occupied unique cells and matching singles; {len(all_colors)} shared visible colors; binary alpha; ID order; rank accents; sources and prompts.')

if __name__=='__main__': check()
