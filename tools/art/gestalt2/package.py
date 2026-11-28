#!/usr/bin/env python3
"""Package the approved sprites, raw frame sources, preview and check receipt."""
from pathlib import Path
import os, subprocess, sys, tempfile, zipfile

ROOT=Path(__file__).resolve().parents[3]
RAW=Path(os.environ.get('GESTALT2_RAW_DIR',Path(tempfile.gettempdir())/'Dnd-gestalt2-raw'))
ZIP=ROOT/'gestalt2.zip'
paths=['laterne','faden','maske','echo','kessel','eisen','schluessel','sq_waage','sq_moor','sq_uhr']
result=subprocess.run([sys.executable,str(ROOT/'tools/art/gestalt2/check.py')],capture_output=True,text=True)
if result.returncode:
    print(result.stdout,end='');print(result.stderr,end='',file=sys.stderr);sys.exit(result.returncode)
check=(result.stdout+result.stderr).strip()+'\n'
required=[ROOT/'docs/art/batch-gestalt2-preview.png',ROOT/'public/sprites/manifest-gestalt2.json']
for p in paths:
    required += [ROOT/f'public/sprites/characters/hg_form_{p}_s2.png',ROOT/f'public/sprites/battle/hg_battle_{p}_s2.png',ROOT/f'public/sprites/ui/hg_zug_{p}_s2.png']
assert all(p.exists() for p in required)
assert sum(1 for _ in RAW.rglob('*.png'))==520,'expected all 520 raw 4x frame sources'
with zipfile.ZipFile(ZIP,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for f in required:
        z.write(f,f.relative_to(ROOT).as_posix())
    for f in RAW.rglob('*.png'):
        z.write(f,Path('raw')/f.relative_to(RAW))
    z.writestr('preview.png',(ROOT/'docs/art/batch-gestalt2-preview.png').read_bytes())
    z.writestr('check.txt',check)
print(check.strip())
print(f'ZIP: {ZIP} ({ZIP.stat().st_size:,} bytes; 520 raw frames)')
