from pathlib import Path
from PIL import Image
import json,sys,hashlib
ROOT=Path(__file__).resolve().parents[3]
manifest=json.loads((ROOT/'public/sprites/manifest-ritualicons.json').read_text())
EXPECTED_IDS = {'sud_kraehenauge', 'sud_sternfunke', 's4ke_nachtschierling', 's4mo_relikt', 's4wa_plombe', 's4mo_relikt_faden', 's4ke_frostlauge', 's4mo_relikt_stein', 'uhr_taschen', 's4ke_knallsud', 's4wa_kapital', 's4fa_schicksalsfaden', 'sud_kroetenbitter', 's4la_ritual_laterne', 's4ma_handschuh', 'sud_dreikraut', 's4mo_relikt_glut', 'sud_schattenhauch', 's4ke_aetzwasser', 'sud_gluehtrunk', 'sud_eisensud', 'sud_pfusch', 'sud_kesselzorn', 'sud_grabruhe', 's4ke_glutschleim', 'sud_moosleuchte', 'sud_silberklar', 's4mo_reste', 'gefaess_erinnerung', 's4mo_relikt_salz', 's4mo_relikt_schatten', 'sud_mohnschlaf', 'sud_seidenschritt', 'sud_glockenruf', 's4sc_schattenband', 's4ma_zivilkleid', 'sud_nebelsud', 'sud_wachsglanz', 'leeres_gefaess'}
issues=[]; checked=0
shared_colors=set()
hashes={}
silhouettes={}
reference={tuple(bytes.fromhex(x[1:])) for x in manifest["palette"]}
if set(manifest["items"]) != EXPECTED_IDS: issues.append("Expected exactly the 39 DP IDs")
if len(manifest.get("assets", [])) != 78: issues.append("Expected 78 asset descriptors")
if sum(bool(e.get("ersetztLeihbild")) for e in manifest["items"].values()) != 20: issues.append("Expected 20 section-1 alias replacements")
for item,entry in manifest['items'].items():
 for key,size in [('file',16),('file32',32)]:
  path=ROOT/'public/sprites'/entry[key]
  if not path.exists():issues.append(f'{item}: missing {path}');continue
  im=Image.open(path).convert('RGBA');checked+=1
  if im.size!=(size,size):issues.append(f'{item}: dimensions {im.size}')
  pixels=list(im.get_flattened_data() if hasattr(im,'get_flattened_data') else im.getdata())
  shared_colors.update(p[:3] for p in pixels if p[3])
  if not im.getbbox():issues.append(f'{item}: empty icon')
  if len({p[:3] for p in pixels if p[3]})>32:issues.append(f'{item}: palette >32')
  if not {p[3] for p in pixels}.issubset({0,255}):issues.append(f'{item}: non-binary alpha')
  if any(p[:3]!=(0,0,0) for p in pixels if not p[3]):issues.append(f'{item}: hidden RGB halo')
  if any(p[:3] not in reference for p in pixels if p[3]):issues.append(f'{item}: outside shared palette')
  if size==16:
   digest=hashlib.sha256(im.tobytes()).hexdigest()
   if digest in hashes:issues.append(f'{item}: duplicate of {hashes[digest]}')
   hashes[digest]=item
   silhouettes.setdefault(hashlib.sha256(im.getchannel('A').tobytes()).hexdigest(),[]).append(item)
   if sum(p[3]>0 for p in pixels)<30:issues.append(f'{item}: undersized silhouette')
asset_files=set()
for asset in manifest.get('assets', []):
 size=32 if '/32/' in asset['file'] else 16
 asset_files.add(asset['file'])
 if (asset['width'],asset['height'],asset['frameWidth'],asset['frameHeight'])!=(size,size,size,size):issues.append(asset['id']+': inconsistent manifest dimensions')
 if (asset['columns'],asset['rows'])!=(1,1):issues.append(asset['id']+': incorrect static grid')
 if asset['regions']['icon']!={'x':0,'y':0,'width':size,'height':size}:issues.append(asset['id']+': invalid region')
expected_files={e[k] for e in manifest['items'].values() for k in ['file','file32']}
if asset_files!=expected_files:issues.append('Asset and item file mappings differ')
generation=json.loads((ROOT/'docs/art/batch-ritualicons-generation.json').read_text())
if {p['id'] for p in generation['prompts']}!=EXPECTED_IDS:issues.append('Missing generation prompt')
if len(generation['prompts'])!=39:issues.append('Expected 39 selected source prompts')
if len(shared_colors)>32: issues.append('Shared palette exceeds 32 colors')
if checked != 78: issues.append('Expected 78 PNGs')
report={'shared_visible_colors':len(shared_colors),'batch':'ritualicons','item_count':len(manifest['items']),'png_count':checked,'distinct_16px_images':len(hashes),'distinct_16px_silhouettes':len(silhouettes),'sizes':'independent nearest-neighbor reductions from generated master','passed':not issues,'issues':issues}
(ROOT/'docs/art/batch-ritualicons-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2));sys.exit(bool(issues))
