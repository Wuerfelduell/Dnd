#!/usr/bin/env python3
"""Build the exact EA2 handoff ZIP after the strict validation passes."""
from pathlib import Path
import json,os,subprocess,sys,tempfile,zipfile

ROOT=Path(__file__).resolve().parents[3]
RAW=Path(os.environ.get('GESTALT2B_RAW_DIR',Path(tempfile.gettempdir())/'Dnd-gestalt2b-raw'))
manifest=ROOT/'public/sprites/manifest-gestalt2b.json'
preview=ROOT/'docs/art/batch-gestalt2b-preview.png'
archive=ROOT/'gestalt2b.zip'
check=subprocess.run([sys.executable,str(ROOT/'tools/art/gestalt2b/check.py')],capture_output=True,text=True)
if check.returncode:
 print(check.stdout,end='');print(check.stderr,end='',file=sys.stderr);sys.exit(check.returncode)
check_text=(check.stdout+check.stderr).strip()+'\n'
assets=json.loads(manifest.read_text(encoding='utf-8'))['assets']
entries=[manifest]+[ROOT/'public/sprites'/asset['file'] for asset in assets]
assert all(p.exists() for p in entries+[preview]),'missing target or preview file'
assert sum(1 for _ in RAW.rglob('*.png'))==520,'raw output must contain 520 individual 4x frames'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in entries:z.write(p,p.relative_to(ROOT).as_posix())
 for p in RAW.rglob('*.png'):z.write(p,(Path('raw')/p.relative_to(RAW)).as_posix())
 z.writestr('preview.png',preview.read_bytes())
 z.writestr('check.txt',check_text)
print(check_text.strip())
print(f'ZIP: {archive} ({archive.stat().st_size:,} bytes; 30 assets; 520 raw frames)')
