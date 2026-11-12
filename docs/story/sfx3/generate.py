"""Original deterministic DSP; no recordings or external samples.
Python NumPy/SciPy plus FFmpeg. Existing output files are never overwritten.
"""
import json,hashlib,subprocess,argparse
from pathlib import Path
import numpy as np
from scipy.signal import butter,sosfilt
R=Path(__file__).resolve().parents[3];out=R/'public/audio/sfx';sr=24000
sounds=json.loads((R/'docs/story/sfx3/catalog.json').read_text())['sounds']

def synth(id,d,v,loop):
 seed=int.from_bytes(hashlib.sha256((id+str(v)).encode()).digest()[:4],'little'); rng=np.random.default_rng(seed)
 n=int(d*sr); t=np.arange(n)/sr; noise=rng.normal(size=n)
 def filt(c):return sosfilt(butter(2,c,fs=sr,output='sos'),noise)
 low=filt(500); air=noise-filt(2300); x=np.zeros(n); pitch=120+seed%90
 def tone(f,start=0,dec=.2,amp=1):
  u=t-start; return amp*np.sin(2*np.pi*f*u)*np.exp(-np.maximum(u,0)/dec)*(u>=0)*np.minimum(np.maximum(u,0)*500,1)
 if loop:
  # Integer FFT bins and circular envelopes keep every bed periodic at six seconds.
  f=np.fft.rfftfreq(n,1/sr)
  def bed(c):
   spec=np.fft.rfft(noise)/(1+(f/c)**2);spec[0]=0
   y=np.fft.irfft(spec,n);return y/(np.std(y)+1e-9)
  def bell(freq,start,dec=.35,amp=.15):
   u=(t-start)%d;env=np.minimum(u/.012,1)*np.exp(-u/dec)
   return amp*(np.sin(2*np.pi*freq*u)+.25*np.sin(2*np.pi*freq*2.71*u))*env
  def creak(start,amp=.2):
   u=(t-start)%d;env=np.minimum(u/.03,1)*np.exp(-u/.4)
   return amp*np.sin(2*np.pi*(105*u+22*u*u))*(.4+.6*np.sin(2*np.pi*17*u)**8)*env
  def bird(start,amp=.04):
   u=(t-start)%d;env=np.sin(np.pi*np.clip(u/.65,0,1))**2
   return amp*np.sin(2*np.pi*(710*u+210*u*u))*env
  wave=.55+.25*np.sin(2*np.pi*t/d)+.12*np.sin(4*np.pi*t/d)
  if id.endswith('hafen_ebbe'):
   x=.12*bed(850)*wave+bell(140,.6,.09,.12)+bell(160,3.3,.1,.08)+bird(4.2)
  elif id.endswith('hafen_flut'):
   x=.22*bed(1350)*wave+creak(1.8,.15)
  elif id.endswith('stege'):
   x=.06*bed(1600)+creak(4.1,.16)
   for k in [0.5,2.2,3.1]:x+=bell(175,k,.07,.22)
  elif id.endswith('schlick'):
   x=.08*bed(400)*wave+bird(4.5,.025)
   for k in range(6):x+=bell(220+80*(k%3),.35+k*.8,.035,.17)
  elif id.endswith('oberstrasse'):
   x=.045*bed(1900)
   for k in [1.2,1.65,3.8,4.25]:x+=bell(95,k,.045,.09)
   x+=bell(950,5.2,.022,.04)
  elif id.endswith('wrackfeld'):
   x=.025*bed(450)+creak(.6,.3)+creak(3.3,.19)
   for k in [2.1,4.6,5.3]:x+=bell(820,k,.025,.09)
  elif id.endswith('leuchtbank'):
   x=.10*bed(2100)*wave+bell(330,1.3,.65,.035)+bell(330,4.1,.65,.025)
  elif id.endswith('registerkeller'):
   x=.025*bed(750)
   for k in [.4,2.2,4.8]:x+=bell(970,k,.035,.12)
   u=(t-3.2)%d;x+=.075*(noise-sosfilt(butter(2,2300,fs=sr,output='sos'),noise))*np.exp(-u/.13)*np.minimum(u/.01,1)
   x+=.12*np.roll(x,int(.23*sr))+.05*np.roll(x,int(.39*sr))
  else:
   x=.06*bed(280)*wave+creak(1.0,.14)+creak(4.0,.12)+bell(630,3.1,.035,.06)
 elif any(w in id for w in ['glocke','schlag','hammer','stempel','tick','haken']):
  for s in ([.05,.85,1.65] if id=='vm_pegelglocke' else [.03]):
   for ratio,a in [(1,1),(2.71,.35),(4.13,.15)]: x+=tone(pitch*ratio,s,.35 if 'glocke' in id else .08,a)
   x+=air*np.exp(-np.maximum(t-s,0)*80)*(t>=s)*.2
 elif any(w in id for w in ['wasser','schlick','schwall','flut','ebbe','ruder','trank']):
  x=low*(.5+.3*np.sin(2*np.pi*3*t))
  for k in range(9): x+=tone(150+rng.random()*600,rng.random()*d,.035,.2)
  x*=t/d if 'kommt' in id else np.exp(-t/(d*.5))
 elif any(w in id for w in ['moewen','kraehe','stimme','tier_ruf','ruf','horn']):
  freq=(180 if 'stimme' in id or 'horn' in id else 700)+(seed%100003)/2000-25+(140+v*17)*np.sin(2*np.pi*t/d)
  phase=2*np.pi*np.cumsum(freq)/sr
  x=(np.sin(phase)+.25*np.sin(phase*2))*(np.sin(np.pi*t/d)**2)*(.6+.4*np.sin(2*np.pi*4*t)**2)
 elif any(w in id for w in ['seite','papier','eintragen','wischt','brief','kalk','bruch','zerfall','zerspringt','misslungen']):
  x=air*np.exp(-t*3)*(np.sin(2*np.pi*(7+v)*t)**8)
  if any(w in id for w in ['bruch','zerspringt','misslungen']):
   for k in range(7):x+=tone(1300+rng.random()*3000,k*.09,.09,.2)
 elif any(w in id for w in ['schritt','hit','fall','ohnmacht','anlegen','tuer','wuerfel']):
  x=low*np.exp(-t*13)+tone(65+v*10,.02,.07,1.4)
  if 'steg' in id or 'tuer' in id: x+=tone(290,.08,.15,.4)
 elif any(w in id for w in ['knarren','spannt','oeffnen','schranke','peitsche','fessel','dreh']):
  x=np.sin(2*np.pi*(pitch*t+20*t*t))*(np.sin(2*np.pi*19*t)**12)*np.exp(-t*1.5)+low*.15
 elif 'furcht' in id or 'nebel' in id:
  x=air*np.sin(np.pi*np.minimum(t/.6,1))**2*np.exp(-t*5)
 else:
  for k,r in enumerate([1,1.5,2]):x+=tone((260+(seed%100003)/277)*r,.05+k*.17,.4,.6)
  if any(w in id for w in ['aufstieg','phase2','beginn']):x=x[::-1]+low*(t/d)*.3
 if not loop:x*=np.minimum(t/.012,1)*np.minimum((d-t)/.07,1)
 x-=x.mean();x*=.62/max(abs(x)); return (x*32767).astype('<i2').tobytes()

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--ambience-only',action='store_true');args=parser.parse_args()
 selected={k:s for k,s in sounds.items() if not args.ambience_only or s.get('loop')}
 outputs=[out/(id+(f'_{v}' if s.get('variants') else '')+'.'+ext) for id,s in selected.items() for v in range(1,s.get('variants',1)+1) for ext in ['ogg','mp3']]
 collisions=[str(p) for p in outputs if p.exists()]
 if collisions:raise RuntimeError('Existing output files: '+', '.join(collisions))
 out.mkdir(parents=True,exist_ok=True)
 for id,s in selected.items():
  for v in range(1,s.get('variants',1)+1):
   name=id+(f'_{v}' if s.get('variants') else '')
   pcm=synth(id,s['duration'],v,s.get('loop',False))
   for ext,codec in [('ogg','libvorbis'),('mp3','libmp3lame')]:
    subprocess.run(['ffmpeg','-v','error','-f','s16le','-ar',str(sr),'-ac','1','-i','pipe:0','-c:a',codec,'-q:a','4',str(out/f'{name}.{ext}')],input=pcm,check=True)
 (R/'public/audio/manifest-sfx3.json').write_text(json.dumps(dict(batch='sfx3',base='audio/sfx/',formats=['ogg','mp3'],sounds=sounds),ensure_ascii=False,indent=2)+'\n')
 hashes={}
 for id,s in sounds.items():
  for v in range(1,s.get('variants',1)+1):
   for ext in ['ogg','mp3']:
    name=id+(f'_{v}' if s.get('variants') else '')+'.'+ext
    hashes['audio/sfx/'+name]=hashlib.sha256((out/name).read_bytes()).hexdigest()
 (R/'docs/story/sfx3/checksums.json').write_text(json.dumps(hashes,indent=2)+'\n')
 print(len(selected),'IDs rendered')
if __name__=='__main__':main()
