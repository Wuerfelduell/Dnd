#!/usr/bin/env python3
"""Validate the BV contract, PNGs, atlas regions and source provenance (Pillow)."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
SPRITES=ROOT/'public/sprites'

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def required():
    result={}
    def add(path,fw,fh,c,r):result[path]=(fw,fh,c,r)
    for season in ('herbst','winter','fruehling','sommer'):
        add(f'fx/saison_{season}.png',16,16,4,3)
        add(f'fx/saison_{season}_partikel.png',64,64,3,2)
        add(f'props/saison_{season}_fassaden.png',32,32,4,3)
    add('fx/saison_winter_atem.png',8,8,4,1)
    add('fx/saison_sommer_hitzeflimmern.png',480,270,1,2)
    for fest in ('laternennacht','salzsegen','schichtwechsel'):
        add(f'props/fest_{fest}.png',16,16,4,4)
        add(f'props/fest_{fest}_gross.png',32,32,3,2)
        add(f'sequences/fest_{fest}.png',240,135,1,1)
        add(f'ui/fest_{fest}_gerede.png',16,16,3,2)
        add(f'ui/fest_{fest}_banner.png',192,32,1,1)
        for guest in range(1,5):add(f'characters/fest_{fest}_gast_{guest}_walk.png',16,32,4,4)
    return result

def main():
    manifest=json.loads((SPRITES/'manifest-feste.json').read_text())
    generation=json.loads((ROOT/'docs/art/batch-feste-generation.json').read_text())
    assets=manifest['assets']; expected=required(); errors=[]; report=[]; union=set()
    def check(ok,msg):
        if not ok:errors.append(msg)
    check(manifest['batch']=='feste','Batch name')
    check(len(assets)==41,'Expected 41 mandatory sheets')
    check(len({a['id'] for a in assets})==len(assets),'Duplicate IDs')
    check(len({a['file'] for a in assets})==len(assets),'Duplicate files')
    check({a['file'] for a in assets}==set(expected),'Missing or unexpected assets')
    allowed={tuple(bytes.fromhex(c[1:])) for c in generation['palette']}
    for a in assets:
        file=a['file'];path=SPRITES/file
        check(path.is_file(),f'{file}: missing PNG')
        if not path.exists() or file not in expected:continue
        fw,fh,c,r=expected[file]
        image=Image.open(path)
        check(image.format=='PNG' and image.mode=='P',f'{file}: not indexed PNG')
        check(image.size==(fw*c,fh*r),f'{file}: wrong dimensions')
        check((a['frameWidth'],a['frameHeight'],a['columns'],a['rows'])==(fw,fh,c,r),f'{file}: frame grid mismatch')
        check((a['width'],a['height'])==image.size,f'{file}: manifest size mismatch')
        rgba=image.convert('RGBA');pixels=list(rgba.getdata())
        alpha={p[3] for p in pixels};visible={p[:3] for p in pixels if p[3]}
        union.update(visible)
        check(alpha <= {0,255},f'{file}: nonbinary alpha')
        check(0 < len(visible) <= 31,f'{file}: palette limit')
        check(visible<=allowed,f'{file}: noncommon palette color')
        check((0,0,0) not in visible and (255,255,255) not in visible,f'{file}: black/white matte')
        check(len(set(pixels))<=32,f'{file}: total colors including alpha >32')
        check((0 in alpha) if a['transparent'] else alpha=={255},f'{file}: transparency contract')
        check(sha(path)==a['sha256'],f'{file}: hash mismatch')
        frames=[];coverage=[]
        for index in range(c*r):
            x,y=(index%c)*fw,(index//c)*fh
            cell=rgba.crop((x,y,x+fw,y+fh));mask=cell.getchannel('A');bbox=mask.getbbox()
            check(bbox is not None,f'{file}: empty frame {index}')
            frames.append(cell.tobytes());coverage.append(sum(v>0 for v in mask.getdata())/(fw*fh))
            if a['transparent']:
                check(not any(mask.crop((0,0,fw,1)).getdata()),f'{file}: top gutter frame {index}')
                check(not any(mask.crop((0,fh-1,fw,fh)).getdata()),f'{file}: bottom gutter frame {index}')
                check(not any(mask.crop((0,0,1,fh)).getdata()),f'{file}: left gutter frame {index}')
                check(not any(mask.crop((fw-1,0,fw,fh)).getdata()),f'{file}: right gutter frame {index}')
            if file.startswith('characters/') and bbox:
                check(bbox[3]==30,f'{file}: baseline frame {index} = {bbox[3]}')
        if '_partikel' in file:
            check(max(coverage)<0.15,f'{file}: particles too opaque')
            check(len(set(frames))==6,f'{file}: duplicate particle frames')
        if 'hitzeflimmern' in file:
            check(max(coverage)<0.03,f'{file}: heat overlay too opaque')
            check(len(set(frames))==2,f'{file}: duplicate heat frames')
        if 'atem' in file:check(len(set(frames))==4,f'{file}: duplicate breath frames')
        covered=set()
        for name,anim in a['animations'].items():
            indices=anim['frames']
            check(bool(indices) and all(type(i)==int and 0<=i<c*r for i in indices),f'{file}: bad indices {name}')
            check(anim['frameRate']>=0 and anim['repeat'] in (0,-1),f'{file}: timing {name}')
            covered.update(indices)
            if file.startswith('characters/'):
                check(len(indices)==4 and anim['frameRate']>0,f'{file}: walking contract')
                check(len({frames[i] for i in indices})>=3,f'{file}: insufficient walk poses {name}')
        check(covered==set(range(c*r)),f'{file}: uncovered frames')
        for name,reg in a['regions'].items():
            i=reg['frame']
            check((reg['x'],reg['y'],reg['width'],reg['height'])==((i%c)*fw,(i//c)*fh,fw,fh),f'{file}: bad region {name}')
        if file.startswith(('props/','ui/')) and 'banner' not in file:
            check(len(a['regions'])==c*r,f'{file}: missing named regions')
        report.append({'file':file,'size':list(image.size),'visibleColors':len(visible),'frames':c*r,'maxCoverage':round(max(coverage),4)})
    check(len(union)<=31,'Global palette exceeds 31 visible colors')
    check(len(generation['records'])==41,'Source record count')
    for record in generation['records']:
        source=ROOT/record['source']
        check(source.exists() and sha(source)==record['sourceSha256'],record['id']+': source provenance')
        check(record['prompt'].startswith('STYLE GUIDE'),record['id']+': style block missing')
    check((ROOT/'docs/art/preview-feste.png').exists(),'Missing preview')
    result={'batch':'feste','passed':not errors,'sheets':len(assets),'frames':sum(a['columns']*a['rows'] for a in assets),
            'globalVisibleColors':len(union),'checks':report,'errors':errors}
    (ROOT/'docs/art/batch-feste-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    if errors:raise SystemExit('\n'.join(errors))
    print(f"PASS: {len(assets)} sheets, {result['frames']} frames, {len(union)} shared visible colors + transparency")

if __name__=='__main__':main()
