"""Export generated BE sheets; originals are located by generation-sources.json.

Run from any directory: python tools/art/dunscar5/export.py
Only raster operations: alpha cleanup, cell extraction, nearest-neighbor fitting,
palette indexing, assembly, and documented derivatives. No painted substitutes.
"""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw
from plan import ROOT, PEOPLE, ENEMIES

SPRITES = ROOT / 'public/sprites'
ART = ROOT / 'docs/art'
SPEC = json.loads((ART / 'dunscar5-source-spec.json').read_text())
SOURCES = json.loads((ROOT / 'tools/art/dunscar5/generation-sources.json').read_text())
SOURCE_MAP = {r['file']: r for r in SOURCES if r.get('source')}
PALETTE = json.loads((SPRITES / 'manifest-dunscar2.json').read_text())['palette']
PALETTE = [tuple(c) for c in PALETTE][:31]
PALETTE_IMAGE = Image.new('P', (1, 1))
PALETTE_IMAGE.putpalette(([0, 0, 0] + [v for c in PALETTE for v in c] + [0] * 768)[:768])
assets, provenance = [], []


def clean(im, component_fraction=.008):
    a = np.array(im.convert('RGBA'))
    mask = a[:, :, 3] >= 220
    labels, count = ndimage.label(mask)
    if count:
        sizes = np.bincount(labels.ravel())
        sizes[0] = 0
        keep = sizes >= max(8, sizes.max() * component_fraction)
        keep[0] = False
        mask = keep[labels]
    a[:, :, 3] = mask.astype('uint8') * 255
    a[~mask, :3] = 0
    out = Image.fromarray(a)
    box = out.getbbox()
    return out.crop(box) if box else Image.new('RGBA', (1, 1))


def fit(im, w, h, baseline=None, scale=None):
    out = Image.new('RGBA', (w, h))
    scale = scale if scale is not None else min((w - 2) / im.width, (h - 2) / im.height)
    sx, sy = scale if isinstance(scale, tuple) else (scale, scale)
    small = im.resize((max(1, round(im.width * sx)), max(1, round(im.height * sy))), Image.Resampling.NEAREST)
    if small.getbbox():
        small = small.crop(small.getbbox())
    y = (h - 1 if baseline is None else baseline + 1) - small.height
    out.alpha_composite(small, ((w - small.width) // 2, max(1, y)))
    return out


def indexed(im):
    a = np.array(im.convert('RGBA'))
    rgb = a[:, :, :3].astype('int32')
    palette = np.array(PALETTE, dtype='int32')
    distance = ((rgb[:, :, None, :] - palette[None, None, :, :]) ** 2).sum(axis=3)
    inds = distance.argmin(axis=2).astype('uint8') + 1
    inds[a[:, :, 3] < 128] = 0
    out = Image.fromarray(inds, 'P')
    out.putpalette(PALETTE_IMAGE.getpalette())
    out.info['transparency'] = 0
    return out


def save(file, im, kind, fw=None, fh=None, cols=1, rows=1, **metadata):
    dest = SPRITES / file
    dest.parent.mkdir(parents=True, exist_ok=True)
    indexed(im).save(dest, transparency=0, optimize=False)
    asset = dict(id=Path(file).stem, file=file,
                 width=im.width, height=im.height, transparent=True, kind=kind,
                 frameWidth=fw or im.width, frameHeight=fh or im.height,
                 columns=cols, rows=rows, **metadata)
    assets.append(asset)
    return asset


def anim(frames, fps=8, repeat=0):
    return dict(frames=frames, frameRate=fps, repeat=repeat)


for job in SPEC['jobs']:
    file = job['file']
    if file not in SOURCE_MAP:
        continue
    source = Path(SOURCE_MAP[file]['source'])
    raw = Image.open(source).convert('RGBA')
    fw, fh, cols, rows = (job[k] for k in ['frameWidth', 'frameHeight', 'columns', 'rows'])
    kind = job['kind']
    counts = [4, 6, 6, 3, 4] if kind == 'battle' else [cols] * rows
    if kind == 'atlas':
        counts = [4, 3]
    sheet = Image.new('RGBA', (fw * cols, fh * rows))
    frames = []
    cells = [clean(raw.crop((round(col * raw.width / cols), round(row * raw.height / rows),
                            round((col + 1) * raw.width / cols), round((row + 1) * raw.height / rows))),
                   .03 if job.get('gameId') == 'ez_ds_streckenlaeufer' and kind in ('walk', 'overworld') else .008)
             for row in range(rows) for col in range(cols)]
    occupied = [cell for n, cell in enumerate(cells) if n % cols < counts[n // cols]]
    common_scale = min((fw-2)/max(c.width for c in occupied), (fh-2)/max(c.height for c in occupied))
    if kind in ('walk', 'overworld'):
        target_height = 26 if job.get('gameId') in ['ez_ds_walzenstimme', 'ez_ds_schrankenkind', 'k3e_kalkjunge', 'k3e_signalkind'] else 30
        common_scale = ((fw-2)/max(c.width for c in occupied), target_height/max(c.height for c in occupied))
    for row in range(rows):
        for col in range(cols):
            frame = fit(cells[row*cols+col], fw, fh, fh - 2, common_scale)
            if file == 'battle/enemy_ez_ds_walzenstimme.png':
                # Normalize the generated pale matte fringe to the required dark pixel outline.
                pixels = np.array(frame)
                opaque = pixels[:, :, 3] > 0
                boundary = opaque & ~ndimage.binary_erosion(opaque)
                rgb = pixels[:, :, :3].astype('int32')
                pale_fringe = opaque & (ndimage.distance_transform_edt(opaque) <= 2) & (rgb.min(axis=2) > 145) & ((rgb.max(axis=2)-rgb.min(axis=2)) < 55)
                pixels[pale_fringe, :3] = PALETTE[0]
                pixels[boundary, :3] = PALETTE[0]
                frame = Image.fromarray(pixels)
            if file == 'props/BE_lichtkegel.png':
                # Make the generated two-tone light cone an actual binary-alpha overlay.
                pixels = np.array(frame)
                yy, xx = np.indices((fh, fw))
                pixels[(xx + yy) % 2 == 1, 3] = 0
                frame = Image.fromarray(pixels)
            if col >= counts[row]:
                frame = Image.new('RGBA', (fw, fh))
            if kind == 'battle' and row in (1, 2) and col == 2:
                frame = frames[-1].copy()
            # First generated Ida sheet has its left/right rows reversed.
            dest_row = {1: 2, 2: 1}.get(row, row) if file == 'characters/k3h_troedlerin_walk.png' else row
            sheet.alpha_composite(frame, (col * fw, dest_row * fh))
            frames.append(frame)
    metadata = {k: job[k] for k in ['gameId', 'expressions', 'attackNames'] if k in job}
    metadata['occupiedCounts'] = counts
    metadata['baseline'] = fh - 2
    if kind in ('walk', 'overworld'):
        metadata['animations'] = {name: anim(list(range(r * 4, r * 4 + 4)), 7, -1)
                                  for r, name in enumerate(['down', 'left', 'right', 'up'])}
    elif kind == 'battle':
        metadata.update(facing='left', heldRows=[1, 2], windupFrames={'attack': [7, 8], 'special': [13, 14]},
                        animations={'idle': anim([0, 1, 2, 3], 6, -1), 'attack': anim(list(range(6, 12))),
                                    'special': anim(list(range(12, 18))), 'hurt': anim([18, 19, 20]),
                                    'defeated': anim([24, 25, 26, 27], 6)})
        if job['gameId'] == 'k3k_signalbrecher':
            metadata['phases'] = {'pfiff': 'attack', 'schichtgaenger_ruf': 'special'}
        if job['gameId'] in ['ez_ds_schrankenkind', 'ez_ds_walzenstimme']:
            metadata['nonlethalDefeat'] = True
    elif kind == 'portraits':
        metadata['animations'] = {name: anim([n], 1) for n, name in enumerate(job['expressions'])}
    if kind == 'atlas':
        # Repack each source prop at its requested exact region dimensions.
        sheet = Image.new('RGBA', (256, 128))
        regions = {}
        for n, (name, w, h) in enumerate(job['regions']):
            region = fit(clean(frames[n]), w, h)
            x, y = n % 4 * 64, n // 4 * 64
            sheet.alpha_composite(region, (x, y))
            regions[name] = dict(x=x, y=y, width=w, height=h)
        metadata.pop('baseline')
        metadata['regions'] = regions
    asset = save(file, sheet, kind, fw, fh, cols, rows, **metadata)
    provenance.append(dict(file=file, source=source.name, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                           sourceSize=list(raw.size), prompt=SOURCE_MAP[file].get('prompt') or job['prompt'],
                           reference='docs/art/preview-dunscar2-figuren.png', operations=['equal-cell crop', 'alpha threshold 220',
                           'remove tiny isolated alpha components', 'nearest-neighbor fit with 1px margin', 'shared palette indexing'],
                           rowSwap=file == 'characters/k3h_troedlerin_walk.png',
                           scaleMode='shared x/y factors for 16x32 character grid' if kind in ('walk','overworld') else 'shared aspect-preserving factor',
                           normalizeDarkOutline=file == 'battle/enemy_ez_ds_walzenstimme.png',
                           checkerboardAlpha=file == 'props/BE_lichtkegel.png'))

# Derivatives preserve the generated artwork and use the same indexed palette.
for id, _ in PEOPLE[7:12]:
    path = SPRITES / f'characters/{id}_walk.png'
    if path.exists():
        save(f'characters/F_ow_{id}.png', Image.open(path).convert('RGBA'), 'overworld', 16, 32, 4, 4,
             gameId=id, baseline=30, occupiedCounts=[4]*4, derivedFrom=f'characters/{id}_walk.png',
             animations={name: anim(list(range(r*4,r*4+4)),7,-1) for r,name in enumerate(['down','left','right','up'])})

heads = Image.new('RGBA', (24 * 8, 24 * 3))
head_regions = {}
for n, (id, _) in enumerate(PEOPLE):
    path = SPRITES / f'portraits/{id}_emotions.png'
    if path.exists():
        face = clean(Image.open(path).convert('RGBA').crop((0, 0, 64, 42)))
    else:
        path = SPRITES / f'characters/{id}_walk.png'
        if not path.exists():
            continue
        face = clean(Image.open(path).convert('RGBA').crop((0, 0, 16, 17)))
    x, y = n % 8 * 24, n // 8 * 24
    heads.alpha_composite(fit(face,24,24), (x,y))
    head_regions[id] = dict(x=x,y=y,width=24,height=24)
save('portraits/BE_koepfe.png',heads,'heads',24,24,8,3,regions=head_regions,occupiedCounts=[8,8,6])

for id in [p[0] for p in PEOPLE[7:12]] + [e[0] for e in ENEMIES]:
    file = f'battle/enemy_{id}.png'
    path = SPRITES/file
    if not path.exists():
        continue
    sheet=Image.open(path).convert('RGBA')
    size=64 if id=='k3k_signalbrecher' else 48
    figure=clean(sheet.crop((0,0,size,size)))
    save(f'ui/bestiary/F_{id}.png',fit(figure,96,128),'bestiary',gameId=id,derivedFrom=file)
    if id.startswith('k3k_'):
        # Assemble a geometric parchment UI frame around the generated portrait.
        poster=Image.new('RGBA',(48,64))
        draw=ImageDraw.Draw(poster)
        draw.rectangle((2,2,45,61),fill=PALETTE[7],outline=PALETTE[4])
        face=clean(figure.crop((0,0,figure.width,max(1,round(figure.height*.5)))))
        portrait=fit(face,38,38)
        # Sepia palette mapping is a colour treatment of the generated portrait.
        aa=np.array(portrait)
        luminance=aa[:,:,:3].mean(axis=2)
        for low,high,color in [(0,85,PALETTE[2]),(85,150,PALETTE[5]),(150,256,PALETTE[8])]:
            aa[(luminance>=low)&(luminance<high),:3]=color
        poster.alpha_composite(Image.fromarray(aa),(5,6))
        # Railway seal: two rails and three sleepers, no letters or police insignia.
        draw=ImageDraw.Draw(poster)
        draw.ellipse((18,47,30,59),fill=PALETTE[4],outline=PALETTE[2])
        draw.line((22,50,22,56),fill=PALETTE[8]);draw.line((26,50,26,56),fill=PALETTE[8])
        for y in (51,53,55):draw.line((21,y,27,y),fill=PALETTE[8])
        save(f'ui/BE_steckbrief_{id}.png',poster,'wanted',gameId=id,derivedFrom=file)

file='battle/enemy_k3k_staubschmuggler.png'
if (SPRITES/file).exists():
    base=next(a for a in assets if a['file']==file)
    im=Image.open(SPRITES/file).convert('RGBA')
    a=np.array(im)
    for old,new in zip(PALETTE[3:9],PALETTE[11:17]):
        mask=(a[:,:,:3]==old).all(axis=2)&(a[:,:,3]>0)
        a[mask,:3]=new
    meta={k:v for k,v in base.items() if k not in ['id','file','width','height','transparent','kind','frameWidth','frameHeight','columns','rows']}
    save('battle/enemy_k3k_staubschmuggler_elite.png',Image.fromarray(a),'battle',48,48,6,5,
         **meta,variant='elite',derivedFrom=file)

complete=len(SOURCE_MAP)==len(SPEC['jobs'])
manifest=dict(version=1,batch='dunscar5',status='exported; runtime integration pending' if complete else 'in progress',
              paletteMaxVisibleColors=len(PALETTE),palette=['#%02x%02x%02x'%c for c in PALETTE],assets=assets)
(SPRITES/'manifest-dunscar5.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ART/'batch-dunscar5-generation.json').write_text(json.dumps(dict(batch='dunscar5',generator='built-in image_gen',
    sources=provenance,derivatives=[dict(file=a['file'],source=a['derivedFrom']) for a in assets if 'derivedFrom' in a]),ensure_ascii=False,indent=2)+'\n')

for name,kinds in [('figuren',{'walk','overworld'}),('portraits',{'portraits','heads'}),('kaempfe',{'battle'}),('props-ui',{'prop','atlas','icon','bestiary','wanted'})]:
    selected=[a for a in assets if a['kind'] in kinds]
    if not selected:continue
    scale=3 if name=='figuren' else 2
    width=max(1000,max(a['width']*scale+220 for a in selected))
    height=sum(max(48,a['height']*scale)+30 for a in selected)
    preview=Image.new('RGB',(width,height),(37,43,53));d=ImageDraw.Draw(preview)
    y=0
    for a in selected:
        d.text((8,y+8),a['file'],fill=(220,216,200))
        im=Image.open(SPRITES/a['file']).convert('RGBA')
        preview.paste(im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST),(210,y+4),
                      im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST))
        y+=max(48,a['height']*scale)+30
    preview.save(ART/f'preview-dunscar5-{name}.png')
print(json.dumps(dict(complete=complete,generated=len(SOURCE_MAP),assets=len(assets))))
