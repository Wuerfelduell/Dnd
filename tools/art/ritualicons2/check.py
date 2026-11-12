"""Validate DT exports against the DP palette and original alias images."""
from pathlib import Path
from PIL import Image
import hashlib,json,sys
ROOT=Path(__file__).resolve().parents[3]
SP=ROOT/'public/sprites'
ALIASES={'wurf_saeure':'giftflasche','wurf_gift':'giftflasche','wurf_spreng':'blutsalz_phiole','wxf_salzglas':'salzkristall','wxf_moorbernstein':'torfbernstein','wxf_schlickperle':'schlickperle','wxf_gezeitenzahn':'schlickzahn','wxf_schwarzlot':'schwarzbernstein','wxf_torfkompass':'ski_art_flutkompass','wxf_silberalge':'vi_m_grenzsteinmoos','wxf_nebelquarz':'seufzerstein','wxf_ankerfossil':'vt_all_grenzstein','wxf_wattspiegel':'taschenspiegel'}
m=json.loads((SP/'manifest-ritualicons2.json').read_text())
dp=json.loads((SP/'manifest-ritualicons.json').read_text())
colors={tuple(bytes.fromhex(c[1:])) for c in dp['palette']}
issues=[]; checks=[];seen={};allcolors=set();silhouettes=set()
if set(m['items'])!=set(ALIASES):issues.append('Expected exactly 13 fixed IDs')
if m['palette']!=dp['palette']:issues.append('DP palette mismatch')
if len(m['assets'])!=26:issues.append('Expected 26 asset descriptors')
for id,alias in ALIASES.items():
 e=m['items'].get(id,{})
 if e.get('replacesAlias')!=alias:issues.append(id+': alias mismatch')
 for size,key in [(16,'file'),(32,'file32')]:
  rel=f'items/{"32/" if size==32 else ""}{id}.png'; path=SP/rel
  if e.get(key)!=rel:issues.append(id+': wrong file mapping')
  if not path.exists():issues.append(rel+': missing');continue
  im=Image.open(path).convert('RGBA'); px=list(im.get_flattened_data() if hasattr(im,"get_flattened_data") else im.getdata()); visible={p[:3] for p in px if p[3]};allcolors.update(visible)
  if im.size!=(size,size):issues.append(rel+': wrong size/grid')
  if not im.getbbox():issues.append(rel+': empty')
  if not {p[3] for p in px} <= {0,255}:issues.append(rel+': fractional alpha')
  if len(visible)>32 or not visible<=colors:issues.append(rel+': palette violation')
  if any(p[:3]!=(0,0,0) for p in px if p[3]==0):issues.append(rel+': hidden RGB')
  digest=hashlib.sha256(im.tobytes()).hexdigest()
  if digest in seen:issues.append(rel+': duplicate '+seen[digest])
  seen[digest]=rel
  original=SP/f'items/{alias}.png'
  if not original.exists():issues.append(rel+': missing alias reference')
  else:
   old=Image.open(original).convert('RGBA').resize((size,size),Image.Resampling.NEAREST)
   if im.tobytes()==old.tobytes():issues.append(rel+': identical to alias')
  old32=SP/f'items/32/{alias}.png'
  if size==32 and old32.exists() and im.tobytes()==Image.open(old32).convert('RGBA').tobytes():issues.append(rel+': identical to 32px alias')
  if size==16:
   silhouettes.add(im.getchannel('A').tobytes())
   for ref in ['s4ke_knallsud','s4ke_aetzwasser','s4ke_nachtschierling']:
    if im.getchannel('A').tobytes()==Image.open(SP/f'items/{ref}.png').convert('RGBA').getchannel('A').tobytes():issues.append(rel+': DP silhouette duplicate')
  assets=[a for a in m['assets'] if a['file']==rel]
  if len(assets)!=1:issues.append(rel+': asset mapping')
  else:
   a=assets[0]
   if [a.get(k) for k in ['width','height','frameWidth','frameHeight']]!=[size]*4 or a['columns']!=1 or a['rows']!=1:issues.append(rel+': frame grid')
   if a['regions']['icon']!={'x':0,'y':0,'width':size,'height':size}:issues.append(rel+': region')
  checks.append({'file':rel,'visible_colors':len(visible),'sha256':digest,'replaces':alias})
g=json.loads((ROOT/'docs/art/batch-ritualicons2-generation.json').read_text())
if {r['id'] for r in g['prompts']}!=set(ALIASES):issues.append('Prompt coverage')
if len(checks)!=26:issues.append('Expected 26 PNGs')
if len(allcolors)>32:issues.append('Combined palette exceeds 32')
report={'batch':'ritualicons2','item_count':13,'png_count':len(checks),'shared_visible_colors':len(allcolors),'distinct_16px_silhouettes':len(silhouettes),'grid':'integer pixel coordinates; independent nearest-neighbor reductions to 16/32','passed':not issues,'issues':issues,'files':checks}
(ROOT/'docs/art/batch-ritualicons2-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='files'},indent=2));sys.exit(bool(issues))
