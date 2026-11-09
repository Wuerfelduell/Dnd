#!/usr/bin/env python3
"""Validate the delivered codecs/PCM against the independent package brief."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
MANIFEST = ROOT/'public/audio/manifest-sfx.json'


def main():
    manifest=json.loads(MANIFEST.read_text())
    brief=(ROOT/'docs/art/codex_Y_soundeffekte.md').read_text()
    brief=brief[brief.index('## 1. Oberfläche'):brief.index('## 8. Manifest')]
    groups={'ui','schritte','welt','polizei','kampf','okkult','atmo'}
    required=set(re.findall(r'`([a-z_]+)`',brief))-groups
    assert set(manifest['sounds'])==required, (required-set(manifest['sounds']),set(manifest['sounds'])-required)
    assert manifest['formats']==['ogg','mp3'] and manifest['base']=='audio/sfx/'
    expected_variants={id:3 for id in required if id.startswith('schritt_')}
    for line in brief.splitlines():
        count=re.search(r'(\d) Varianten',line)
        ids=re.findall(r'`([a-z_]+)`',line)
        if count and ids: expected_variants[ids[0]]=int(count[1])
    rows=[]
    expected_files=set()
    digests=set()
    for id,entry in manifest['sounds'].items():
        assert entry['group'] in groups and 0<=entry['volume']<=1
        assert entry.get('variants',1)==expected_variants.get(id,1), id
        if id.startswith('schritt_'): assert .12<=entry['duration']<=.25
        if id.startswith('atmo_'): assert entry.get('loop') and 8<=entry['duration']<=12
        for variant in range(1,entry.get('variants',1)+1):
            name=f'{id}_{variant}' if entry.get('variants') else id
            row={'id':name,'group':entry['group'],'loop':entry.get('loop',False),'duration':entry['duration'],'formats':{}}
            for ext in ('ogg','mp3'):
                path=ROOT/'public/audio/sfx'/f'{name}.{ext}'
                expected_files.add(path.name)
                probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(path)]))['streams'][0]
                assert probe['sample_rate']=='44100' and probe['channels']==1, path
                assert probe['codec_name']==('vorbis' if ext=='ogg' else 'mp3'),path
                if ext=='mp3': assert int(probe['bit_rate'])==96000,path
                pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-acodec','pcm_f32le','-'])
                samples=np.frombuffer(pcm,dtype='<f4')
                duration=len(samples)/44100
                peak=float(np.max(np.abs(samples)))
                rms=float(np.sqrt(np.mean(samples*samples)))
                assert np.isfinite(samples).all() and rms>.002, path
                assert peak<=10**(-1/20), (path,peak)
                # Short Vorbis packets may expose up to one padded block in ffmpeg.
                # Container duration stays authoritative; loops must decode exactly.
                if ext=='ogg': assert abs(float(probe['duration'])-entry['duration'])<.0001,path
                tolerance=.001 if entry.get('loop') else .03
                assert abs(duration-entry['duration'])<tolerance, (path,duration)
                assert abs(float(samples.mean()))<.005,path
                # Codec output is checked, not just the pre-encode waveform.
                seam=abs(float(samples[-1]-samples[0]))
                if entry.get('loop'): assert seam<max(.025,rms*.8),(path,seam,rms)
                else: assert max(abs(float(samples[0])),abs(float(samples[-1])))<.04,path
                digest=hashlib.sha256(pcm).hexdigest()
                assert digest not in digests, f'Duplicate decoded asset: {path}'
                digests.add(digest)
                row['formats'][ext]={'bytes':path.stat().st_size,'decodedDuration':round(duration,6),'peakDbFS':round(20*np.log10(peak),2),'rmsDbFS':round(20*np.log10(rms),2),'seamDelta':round(seam,6),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
            rows.append(row)
    actual={p.name for p in (ROOT/'public/audio/sfx').iterdir()}
    assert actual==expected_files, (actual-expected_files,expected_files-actual)
    total=sum(f['bytes'] for r in rows for f in r['formats'].values())
    assert total<6_000_000, total
    report={'baseIds':len(required),'renders':len(rows),'files':len(expected_files),'totalBytes':total,'sampleRate':44100,'channels':1,'peakLimitDbFS':-1,'passed':True,'sounds':rows}
    (ROOT/'tools/audio/sfx/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(f"PASS: {len(required)} IDs / {len(rows)} variants / {len(expected_files)} files / {total:,} bytes")
    print('Worst encoded peak:',max(f['peakDbFS'] for r in rows for f in r['formats'].values()),'dBFS')
    print('Worst loop seam:',max(f['seamDelta'] for r in rows if r['loop'] for f in r['formats'].values()))

if __name__=='__main__': main()
