from pathlib import Path
from PIL import Image
import json,sys
ROOT=Path(__file__).resolve().parents[3]
manifest=json.loads((ROOT/'public/sprites/manifest-ritualicons.json').read_text())
EXPECTED_IDS = {'sud_kraehenauge', 'sud_sternfunke', 's4ke_nachtschierling', 's4mo_relikt', 's4wa_plombe', 's4mo_relikt_faden', 's4ke_frostlauge', 's4mo_relikt_stein', 'uhr_taschen', 's4ke_knallsud', 's4wa_kapital', 's4fa_schicksalsfaden', 'sud_kroetenbitter', 's4la_ritual_laterne', 's4ma_handschuh', 'sud_dreikraut', 's4mo_relikt_glut', 'sud_schattenhauch', 's4ke_aetzwasser', 'sud_gluehtrunk', 'sud_eisensud', 'sud_pfusch', 'sud_kesselzorn', 'sud_grabruhe', 's4ke_glutschleim', 'sud_moosleuchte', 'sud_silberklar', 's4mo_reste', 'gefaess_erinnerung', 's4mo_relikt_salz', 's4mo_relikt_schatten', 'sud_mohnschlaf', 'sud_seidenschritt', 'sud_glockenruf', 's4sc_schattenband', 's4ma_zivilkleid', 'sud_nebelsud', 'sud_wachsglanz', 'leeres_gefaess'}
issues=[]; checked=0
shared_colors=set()
if set(manifest["items"]) != EXPECTED_IDS: issues.append("Expected exactly the 39 DP IDs")
if len(manifest.get("assets", [])) != 78: issues.append("Expected 78 asset descriptors")
if sum(bool(e.get("ersetztLeihbild")) for e in manifest["items"].values()) != 20: issues.append("Expected 20 section-1 alias replacements")
for item,entry in manifest['items'].items():
 for key,size in [('file',16),('file32',32)]:
  path=ROOT/'public/sprites'/entry[key]
  if not path.exists():issues.append(f'{item}: missing {path}');continue
  im=Image.open(path).convert('RGBA');checked+=1
  if im.size!=(size,size):issues.append(f'{item}: dimensions {im.size}')
  shared_colors.update(p for p in im.getdata() if p[3])
  if not im.getbbox():issues.append(f'{item}: empty icon')
  if len(set(im.getdata()))>32:issues.append(f'{item}: palette >32')
  if not set(im.getchannel('A').getdata()).issubset({0,255}):issues.append(f'{item}: non-binary alpha')
  if size==32:
   small=Image.open(ROOT/'public/sprites'/entry['file']).convert('RGBA')
   if im.tobytes()!=small.resize((32,32),Image.Resampling.NEAREST).tobytes():issues.append(f'{item}: off-grid upscale')
if len(shared_colors)>32: issues.append('Shared palette exceeds 32 colors')
if checked != 78: issues.append('Expected 78 PNGs')
report={'shared_visible_colors':len(shared_colors),'batch':'ritualicons','item_count':len(manifest['items']),'png_count':checked,'passed':not issues,'issues':issues}
(ROOT/'docs/art/batch-ritualicons-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2));sys.exit(bool(issues))
