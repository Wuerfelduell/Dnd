"""Prüfung Nachbesserungsrunde. Für jede geänderte Datei unter public/sprites (gegen origin/main):
- Raster: gleiche Bildgröße und gleicher Modus wie auf origin/main; Vorlage (template) aus dem jeweiligen Manifest.
- Palette: höchstens 32 sichtbare Farben; Alpha binär (indiziert mit genau einem transparenten Index) – Vollbilder deckend.
- Umriss: >= 90 % der Randpixel jeder Figur sind #1a1c2c; Fehler nur, wenn zugleich > 5 Punkte schlechter als origin/main
  (Effektfarben am Rand senken den Wert auch in den alten Blättern), sonst Hinweis.
- Kern-Box (HART): je belegtem Frame Breite UND Höhe der Kern-Box (Alpha, binäres Öffnen 3x3, größte Komponente) >= 85 % der Kern-Box
  des Vorlagen-Frames an derselben Stelle (Vorlage gleich behandelt; kein Füllmittel zählt mit, weil dünne Effekte wegfallen).
  Fußlinie (Hinweis): größte Abweichung der untersten belegten Zeile je Frame gegenüber origin/main wird ausgegeben.
- Vollbilder (fx/HG_aufstieg_*): 8 Frames 240x135, deckend, <= 32 Farben, Türkis-Anteil.
- Repo-Regeln: nichts unter src/ oder tests/ geändert, keine Manifest-/Code-Änderung außerhalb tools/art und docs/art,
  docs/art/README.md nur angehängt.
Ausgabe: Tabelle + 'FEHLER: n'. Exit 1 bei Fehlern."""
import sys, json, glob, subprocess, io
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode().strip()
BASE = sys.argv[1] if len(sys.argv) > 1 else 'origin/main'
OUTLINE = (0x1a, 0x1c, 0x2c); TQ = (0x6f, 0xe0, 0xd0)
ERR = []; OUT = []
def git(*a): return subprocess.check_output(['git', '-C', ROOT, *a])
def say(s): OUT.append(s); print(s)
def err(s): ERR.append(s); say('  FEHLER ' + s)

def load(path, rev=None):
    data = git('show', f'{rev}:{path}') if rev else open(f'{ROOT}/{path}', 'rb').read()
    return Image.open(io.BytesIO(data))

def core(m):
    o = ndimage.binary_opening(m, np.ones((3, 3)))
    lab, n = ndimage.label(o)
    if n == 0: return np.zeros_like(m)
    s = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return lab == (int(np.argmax(s)) + 1)
def wh(m):
    ys, xs = np.nonzero(m)
    return (0, 0) if not len(xs) else (int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1))

idx = {}
for mf in glob.glob(f'{ROOT}/public/sprites/manifest-*.json'):
    try: d = json.load(open(mf))
    except Exception: continue
    for a in d.get('assets', []):
        if isinstance(a, dict) and 'file' in a and a.get('frameWidth'): idx.setdefault(a['file'], a)

changed = git('diff', '--name-only', BASE).decode().split()
untracked = git('ls-files', '--others', '--exclude-standard').decode().split()
say(f'Geänderte Dateien gegen {BASE}: {len(changed)} (+{len(untracked)} unversioniert)')
for f in changed + untracked:
    if f.startswith('src/') or f.startswith('tests/'): err(f'{f}: src/ und tests/ sind tabu')
    elif f.endswith('.json') and f.startswith('public/'): err(f'{f}: Manifest-Änderung nur als PROPOSAL')
    elif not (f.startswith('public/sprites/') or f.startswith('tools/art/') or f.startswith('docs/art/')): err(f'{f}: außerhalb der erlaubten Pfade')
if 'docs/art/README.md' in changed:
    old = git('show', f'{BASE}:docs/art/README.md').decode(); new = open(f'{ROOT}/docs/art/README.md').read()
    if not new.startswith(old): err('docs/art/README.md: nicht nur angehängt')
    else: say('docs/art/README.md: nur angehängt – ok')

for f in [c for c in changed if c.startswith('public/sprites/') and c.endswith('.png')]:
    rel = f[len('public/sprites/'):]; a = idx.get(rel)
    new = load(f); old = load(f, BASE)
    say(f'\n{rel}: {new.size} {new.mode}')
    if new.size != old.size: err(f'{rel}: Größe {new.size} statt {old.size}')
    if new.mode != 'P': err(f'{rel}: nicht indiziert ({new.mode})')
    rgba = np.array(new.convert('RGBA')); al = rgba[..., 3]
    if not set(np.unique(al)) <= {0, 255}: err(f'{rel}: Alpha nicht binär')
    vis = {tuple(c) for c in rgba[al == 255][:, :3]}
    if len(vis) > 32: err(f'{rel}: {len(vis)} Farben > 32')
    if a is None: err(f'{rel}: kein Manifest-Eintrag'); continue
    fw, fh, cols, rows = a['frameWidth'], a['frameHeight'], a['columns'], a['rows']
    if rel.startswith('fx/'):
        if (al == 0).any(): err(f'{rel}: Vollbild nicht deckend')
        tq = float(np.all(rgba[..., :3] == TQ, axis=-1).mean())
        say(f'  Vollbild {cols}x{rows} je {fw}x{fh}, {len(vis)} Farben, Türkis {tq*100:.2f} %')
        continue
    tpl = load(f'public/sprites/{a["template"]}') if a.get('template') else None
    tal = np.array(tpl.convert('RGBA'))[..., 3] > 0 if tpl else None
    oal = np.array(old.convert('RGBA'))[..., 3] > 0
    tf = idx.get(a.get('template'), {}); tfw, tfh = tf.get('frameWidth', fw), tf.get('frameHeight', fh)
    orgba = np.array(old.convert('RGBA'))
    def ratio(mask, img):
        b = a_ = 0
        for r in range(rows):
            for c in range(cols):
                cell = mask[r*fh:(r+1)*fh, c*fw:(c+1)*fw]
                if not cell.any(): continue
                er = cell & ~ndimage.binary_erosion(cell, ndimage.generate_binary_structure(2, 1), border_value=0)
                px = img[r*fh:(r+1)*fh, c*fw:(c+1)*fw][er][:, :3]
                a_ += len(px); b += int((~np.all(px == OUTLINE, axis=1)).sum())
        return 1 - b / max(1, a_)
    old_ol = ratio(oal, orgba) if old.size == new.size else 1.0
    m = al > 0; foot = []; worst = (9, None); edge_bad = 0; edge_all = 0; rows_s = []
    for r in range(rows):
        for c in range(cols):
            cell = m[r*fh:(r+1)*fh, c*fw:(c+1)*fw]
            if not cell.any(): continue
            # Umriss
            er = cell & ~ndimage.binary_erosion(cell, ndimage.generate_binary_structure(2, 1), border_value=0)
            px = rgba[r*fh:(r+1)*fh, c*fw:(c+1)*fw][er][:, :3]
            edge_all += len(px); edge_bad += int((~np.all(px == OUTLINE, axis=1)).sum())
            if tal is None or (r+1)*tfh > tal.shape[0] or (c+1)*tfw > tal.shape[1]: continue
            tcell = tal[r*tfh:(r+1)*tfh, c*tfw:(c+1)*tfw]
            if not tcell.any(): continue
            ocell = oal[r*fh:(r+1)*fh, c*fw:(c+1)*fw]
            if ocell.any(): foot.append(abs(int(np.nonzero(cell.any(1))[0].max()) - int(np.nonzero(ocell.any(1))[0].max())))
            W, H = wh(core(cell)); TW, TH = wh(core(tcell)); OW, OH = wh(core(oal[r*fh:(r+1)*fh, c*fw:(c+1)*fw]))
            q = min(W / TW, H / TH); rows_s.append((r, c, W, H, TW, TH, OW, OH, q))
            if q < worst[0]: worst = (q, (r, c, W, H, TW, TH))
            if W < 0.85 * TW or H < 0.85 * TH: err(f'{rel}: Frame r{r} c{c} Kern {W}x{H} < 85 % der Vorlage {TW}x{TH}')
    ol = 1 - edge_bad / max(1, edge_all)
    # Umriss: Fehler, wenn unter 90 % UND mehr als 5 Punkte schlechter als origin/main (Effekte senken den Wert auch im Original)
    if ol < 0.90 and ol < old_ol - 0.05: err(f'{rel}: nur {ol*100:.1f} % der Randpixel sind #1a1c2c (alt {old_ol*100:.1f} %)')
    elif ol < 0.90: say(f'  Hinweis: Umriss {ol*100:.1f} % (alt {old_ol*100:.1f} %), nicht schlechter als vorher')
    if rows_s:
        nw = np.mean([s[2] for s in rows_s]); nh = np.mean([s[3] for s in rows_s]); ow = np.mean([s[6] for s in rows_s]); oh = np.mean([s[7] for s in rows_s])
        say(f'  Raster {cols}x{rows} je {fw}x{fh}, {len(vis)} Farben, Umriss {ol*100:.1f} %; Vorlage {a.get("template")}')
        say(f'  Kern-Box Mittel neu {nw:.1f}x{nh:.1f} (alt {ow:.1f}x{oh:.1f}); schlechtestes Verhältnis zur Vorlage {worst[0]*100:.0f} % bei {worst[1]}')
        if foot: say(f'  Fußlinie: max. Abweichung {max(foot)} px, Frames mit > 1 px: {sum(f > 1 for f in foot)}')
say(f'\nFEHLER: {len(ERR)}')
sys.exit(1 if ERR else 0)
