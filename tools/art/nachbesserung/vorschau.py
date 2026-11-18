"""Vorschauen 'Vorlage | alt | neu' (3x, nearest) für alle geänderten Blätter der Nachbesserungsrunde.
Je Blatt eine Zeile mit drei Feldern; je Feld bis zu vier repräsentative Frames (erster, Angriff/Mitte, vorletzte Reihe, letzter belegter).
Vollbilder (fx/HG_aufstieg_*): Vorlage = HG_aufstieg_1 auf origin/main, je Feld Frames 0, 2, 5 (die korrigierten Frames 2 und 5).
Ausgabe: docs/art/<PREFIX>-preview-{aufstieg,bosse,heilige}.png (PREFIX = 1. Argument, Standard nachbesserung)"""
import sys, io, json, glob, subprocess
import numpy as np
from PIL import Image, ImageDraw
ROOT = subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode().strip()
BASE = 'origin/main'; S = 3; BG = (58, 60, 78, 255); SEP = 12
def git(*a): return subprocess.check_output(['git', '-C', ROOT, *a])
def load(p, rev=None):
    d = git('show', f'{rev}:{p}') if rev else open(f'{ROOT}/{p}', 'rb').read()
    return Image.open(io.BytesIO(d)).convert('RGBA')
idx = {}
for mf in glob.glob(f'{ROOT}/public/sprites/manifest-*.json'):
    try: d = json.load(open(mf))
    except Exception: continue
    for a in d.get('assets', []):
        if isinstance(a, dict) and 'file' in a and a.get('frameWidth'): idx.setdefault(a['file'], a)
def cells(img, a, pick):
    fw, fh = a['frameWidth'], a['frameHeight']
    out = []
    for r, c in pick:
        if (r+1)*fh <= img.height and (c+1)*fw <= img.width: out.append(img.crop((c*fw, r*fh, (c+1)*fw, (r+1)*fh)))
    return out
def picks(img, a):
    fw, fh, cols, rows = a['frameWidth'], a['frameHeight'], a['columns'], a['rows']
    al = np.array(img)[..., 3] > 0
    occ = [(r, c) for r in range(rows) for c in range(cols) if al[r*fh:(r+1)*fh, c*fw:(c+1)*fw].any()]
    if not occ: return []
    sel = [occ[0], occ[len(occ)//3], occ[(2*len(occ))//3], occ[-1]]
    return list(dict.fromkeys(sel))
def strip(frames, scale):
    if not frames: return Image.new('RGBA', (8, 8), BG)
    w = sum(f.width for f in frames) * scale + 4 * (len(frames)-1); h = max(f.height for f in frames) * scale
    im = Image.new('RGBA', (w, h), BG); x = 0
    for f in frames:
        g = f.resize((f.width*scale, f.height*scale), Image.NEAREST); im.alpha_composite(g, (x, 0)); x += g.width + 4
    return im
def row(rel, scale=S):
    a = idx[rel]; new = load(f'public/sprites/{rel}'); old = load(f'public/sprites/{rel}', BASE)
    tpl_rel = a.get('template') or ('fx/HG_aufstieg_1.png' if rel.startswith('fx/') else None)
    if rel.startswith('fx/'):
        pk = [(0, 0), (0, 2), (0, 5)]; ta = idx.get(tpl_rel, a)
        tpl = load(f'public/sprites/{tpl_rel}', BASE)
    else:
        pk = [(0, 0), (1, 3), (5, 3), (5, 5)] if 'heiliger' in rel and PREFIX != 'nachbesserung' else picks(new, a); tpl = load(f'public/sprites/{tpl_rel}') if tpl_rel else None; ta = idx.get(tpl_rel, a)
    parts = [strip(cells(tpl, ta, pk), scale) if tpl is not None else strip([], scale), strip(cells(old, a, pk), scale), strip(cells(new, a, pk), scale)]
    W = sum(p.width for p in parts) + 2*SEP*2; H = max(p.height for p in parts) + 16
    im = Image.new('RGBA', (W, H), (30, 30, 40, 255)); d = ImageDraw.Draw(im); x = 0
    for lab, p in zip(['Vorlage ' + (tpl_rel or '-'), 'alt (origin/main)', 'neu'], parts):
        d.text((x + 2, 2), lab, fill=(230, 230, 230, 255)); im.alpha_composite(p, (x, 16)); x += p.width + 2*SEP
    d.text((W - 6*len(rel) - 4, 2), rel, fill=(240, 206, 128, 255))
    return im
def sheet(rels, out, scale=S):
    if not rels: return
    out = out.replace('nachbesserung-', PREFIX + '-')
    rows = [row(r, scale) for r in rels]
    W = max(r.width for r in rows); H = sum(r.height for r in rows) + SEP*len(rows)
    im = Image.new('RGBA', (W, H), (20, 20, 28, 255)); y = 0
    for r in rows: im.alpha_composite(r, (0, y)); y += r.height + SEP
    im.convert('RGB').save(f'{ROOT}/docs/art/{out}', optimize=True); print(out, im.size)
PREFIX = sys.argv[1] if len(sys.argv) > 1 else 'nachbesserung'  # z. B. nachbesserung2
changed = [f[len('public/sprites/'):] for f in git('diff', '--name-only', BASE).decode().split() if f.startswith('public/sprites/') and f.endswith('.png')]
sheet([r for r in changed if r.startswith('fx/')], 'nachbesserung-preview-aufstieg.png')
sheet([r for r in changed if not r.startswith('fx/') and 'heiliger' not in r], 'nachbesserung-preview-bosse.png')
sheet([r for r in changed if 'heiliger' in r], 'nachbesserung-preview-heilige.png')
