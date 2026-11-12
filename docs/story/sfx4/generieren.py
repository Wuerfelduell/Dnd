#!/usr/bin/env python3
"""Original DS synthesis. Python 3 + numpy/scipy + FFmpeg; no recordings/samples.
Run from any directory. Catalog is the explicit delivery contract and event mapping.
"""
import hashlib,json,pathlib,subprocess
import numpy as np
from scipy import signal
ROOT=pathlib.Path(__file__).resolve().parents[3]
HERE=pathlib.Path(__file__).resolve().parent
SR=44100
# ID | variants | seconds | synthesis recipe | event / audible meaning
CATALOG='''s4r_regel_gebrochen|1|0.65|tear|Ritualregel gebrochen: trockener Riss, danach Stille
s4r_waechter_erscheint_welt|1|2.8|door|Wächter erscheint am Standort: Kalk rieselt, schwere Tür bewegt sich
s4r_waechter_immun|1|0.55|thud|Wächter noch immun: dumpfes Abprallen
s4r_bedingung_erfuellt|1|0.7|seal|Ritualbedingung erfüllt: kurzer leiser Siegelton
s4la_laterne_aufstellen|1|0.8|stake|Laterne aufgestellt: Eisenpfahl trifft Erde
s4la_nachfuellen_loop|1|2|pour_loop|Nachfülltaste gehalten: gleichmäßiges Ölgluckern
s4la_nachfuellen_voll|1|0.65|flare|Ölbehälter voll: Flamme springt auf
s4la_nachfuellen_abbruch|1|0.4|stop|Nachfülltaste losgelassen: Ölfluss bricht ab
s4la_laterne_angegriffen|2|0.65|glass|Monster trifft Laterne: kurzes Glasklirren
s4la_laterne_aus|1|0.7|smother|Laterne erlischt: Flamme erstickt
s4la_monster_zischt|3|0.7|hiss|Licht trifft Monster: Schatten zischt weich
s4la_monster_zerfall|1|1.2|dissolve|Licht besiegt Monster: trockener Schattenzerfall
s4la_rueckstoss|1|0.8|slide|Spieler zurückgestoßen: dumpfer Treffer und Sohlenrutschen
s4la_amb_nacht|1|8|night_loop|Ritualnacht aktiv: Wind, fernes Scharren, Flammen
s4la_unruhe_puls|1|2|pulse_loop|Ritual dauert an: tiefer langsam einblendbarer Puls
s4la_sonnenaufgang|1|3.9|sunrise|Drei Laternen ermöglichen Sonnenaufgang: drei Töne vereinigen sich, ferner Vogel
s4fa_markieren|1|0.8|thread|Neue Kreatur markiert: gespannter Faden, hoher weicher Ton
s4fa_einschlafen|1|2.4|sleep|Schlaf bestätigt: Atem und sich schließende Fäden
s4fa_traum_amb|1|8|dream_loop|Traum betreten: gedämpfte Atmosphäre, rückwärts anschwellende Glocke
s4fa_erwachen|1|1.4|wake|Traum verlassen: Atem und sich lösende Spannung
s4fa_heilung_versagt|1|0.5|thread_break|Heilversuch im Traum abgewiesen: leiser Fadenriss
s4ma_verwandeln|1|1.5|mask|Zivilgestalt angenommen: Porzellan abgelegt, Stoff raschelt
s4ma_handschuh|1|0.7|leather|Herausforderung ausgesprochen: Handschuh fällt auf Stein
s4ma_faust|3|0.45|fist|Ziviler Fausttreffer: bloßer dumpfer Schlag ohne Magie
s4ma_gabe_verboten|1|0.55|crack|Fähigkeitsversuch gesperrt: Maske bekommt einen Sprung
s4ma_verschonen|1|1.8|mercy|Besiegter verschont: Ausatmen und weggehende Schritte
s4ma_zweifel|1|0.7|doubt|Dauerhafter Zweifel gesetzt: stockender, abbrechender Ton
s4ec_taub_an|1|1.5|deaf_in|Taubheit beginnt: gefiltertes Rauschen verliert alle Höhen und verstummt
s4ec_taub_aus|1|0.9|deaf_out|Taubheit endet: sanft zurückkehrende Welt ohne Pfeifton
s4ke_rezept_frei|1|1.1|pot_bell|Ritualrezept freigeschaltet: Kessel klingt wie eine Glocke
s4ke_ritualtrank_gebraut|1|1.1|brew_done|Einer der fünf Ritualtränke fertig: Blase und heller Dampf
s4ke_trinken_reihe|5|0.85|drink|Ritualtrank 1–5 getrunken: jeweils eigenes Schlucken und Zischen
s4ke_wurf_explosion|1|1.2|explosion|Explosiver Ritualtrank trifft: kompakter trockener Druckstoß
s4ke_wurf_frost|1|0.9|ice|Frosttrank trifft: feines Eis knackt
s4ke_wurf_glut|1|1.2|embers|Gluttrank trifft: weiches Zischen und Brutzeln
s4ke_angriff_verboten|1|0.6|block|Normalangriff gesperrt: dumpfer Kesselrand statt Treffer
s4ei_last_aechzt|2|1.6|creak|Überlast bewegt sich: Metall knarrt unter Gewicht
s4ei_runde_ueberstanden|1|0.6|rivet|Eine der ersten fünf Runden überstanden: Niet schlägt ein
s4ei_waechter_frei|1|1.0|ring_break|Runde 6 beginnt: Nietring springt, Wächter verwundbar
s4ei_ausweichen_verboten|1|0.5|chain|Ausweichversuch gesperrt: kurze gespannte Lastkette
s4wa_besitz_versiegeln|1|1.2|seal_lead|Besitz abgelegt und versiegelt: Schnur und Bleiplombe
s4wa_kauf|3|0.85|coins|Zirkelware gekauft: Münzen auf Waagschale
s4wa_kapital_knapp|1|0.65|pouch|Kapital reicht nicht: leerer Beutel raschelt
s4wa_alles_gekauft|1|1.4|balance|Alle Waren gekauft: Waage pendelt ein
s4mo_zersetzen|3|1.5|mud|Moorfähigkeit zersetzt einen geeigneten Gegenstand: feuchte Blasen
s4mo_relikt_formen|1|3|relic|Fünf Überreste zum Relikt geformt: Torf pressen und trockenes Knochenknacken
s4mo_moorwasser_trinken|2|0.9|mud_drink|Pflichtflasche dieser Runde getrunken: dunkles Gluckern
s4mo_moorwasser_leer|1|0.65|empty_bottle|Moorwasser fehlt: leere Glasflasche wird gekippt
s4uh_perfekt|1|0.75|perfect|Perfektes Ausweichen: Tick setzt aus, heller Schlag
s4uh_fehler|1|0.6|gear_break|Ausweichfehler gezählt: Zahnrad bricht
s4uh_monster_angriff_gezaehlt|1|0.25|tick|Pflichtangriff eines Monsters gezählt: kurzer Tick
schatten_trennen|1|1.8|shadow_split|Schattensteuerung beginnt: Stoff löst sich vom Boden, Unterdruck
schatten_rueckkehr|1|1.4|shadow_return|Schatten kehrt in den Körper zurück
schatten_verloren|1|1.5|smoke|Schatten stirbt, Körper überlebt: Rauch verweht
schatten_schritt|2|0.45|shadow_step|Schatten bewegt sich: sehr leises Stoffstreifen
schatten_attacke|3|0.7|shadow_slash|Kostenlose Schattenattacke: dunkler Luftschnitt
schatten_treffer|1|0.7|shadow_hit|Schatten verliert Leben: gedämpfter Luftstoß
schatten_auslosen|1|0.9|shadow_dice|Rundenbeginn: genau eine eigene Fähigkeit ausgelost, dunkler Würfelklang
schatten_heilung_versagt|1|0.55|shadow_block|Heilversuch des Schattens gesperrt: kurzer matter Luftverschluss
schatten_amb|1|8|shadow_loop|Schattensteuerung aktiv: leiser tiefer Luftdruck, kein Infraschall
sud_zutat|3|0.9|ingredient|Zutat eingelegt: Variante 1 Pulver, 2 Kraut, 3 Flüssigkeit
sud_brodeln_loop|1|4|boil_loop|Freier Sud braut: gleichmäßiges Brodeln
sud_gelungen|1|1.1|steam|Sud gelungen: heller Dampfstoß
sud_pfusch|1|1.2|failed_brew|Sud misslungen: dumpfe Blasen und trockene Asche
sud_abfuellen|1|1.4|bottle|Sud abgefüllt: Flüssigkeit fließt in Glas
sud_wirkung_endet|1|0.8|exhale|Sudwirkung endet: leises Ausatmen
s5_laternenbestie_ruf|1|1.6|beast|Laternenbestie erscheint: tiefe Resonanz mit Glas, keine Stimme
s5_laternenbestie_fall|1|1.6|glass_fall|Laternenbestie besiegt: Glas klingt aus
s5_kokon_wickeln|1|1.7|wrap|Kokon entsteht: Fäden wickeln sich eng
s5_kokon_platzt|1|0.8|cocoon_break|Kokon öffnet sich: Fasern platzen trocken
s5_gesicht_nehmen|1|1.1|porcelain|Gesicht genommen: weiches Porzellanstreifen
s5_misstrauen|1|1.4|murmur|Misstrauen wächst: wortloses gedämpftes Raunen
s5_diebstahl|2|0.8|theft|Diebstahl gelungen: Münzen fallen in Stofftasche
s5_erinnerung_ziehen|1|1.4|memory|Erinnerung entnommen: Atemhauch im Glas
s5_erinnerung_verweigert|1|0.65|refuse|Erinnerung verweigert: Glas wird gedämpft
s5_uhr_warten_tick|1|1|watch|Wartepause: einzelner Taschenuhr-Tick, nicht automatisch wiederholen
s5_pruefung_gescheitert|1|0.8|failure|Seq-5-Prüfung gescheitert: gedämpfter absteigender Zweiton
probe_start|1|0.6|start|Seq-6-Probe startet: kurzer trockener Auftakt
probe_bestanden|1|0.8|success|Seq-6-Probe bestanden: warmer Zweiton
probe_fehlversuch|1|0.6|miss|Seq-6-Fehlversuch: kurzer matter Impuls
probe_faden_verbinden|1|0.85|thread_join|Fadenprobe: zwei Fäden verbinden sich
probe_echo_stimme|3|1.3|voice|Echoprobe: synthetische Nebelstimme ohne Worte
probe_echo_nachhall|1|1.6|echo|Echoprobe: kurze gedämpfte Antwort
probe_moor_name_weg|1|1.2|name_gone|Moorprobe: Namensspur löst sich auf
probe_uhr_puls|1|1.3|double_pulse|Uhrprobe: zwei Schläge, dann Stille
waage_anprangern|1|0.65|table|Betrug angeprangert: Faust auf Holztisch
waage_betrug_aufgedeckt|1|1.5|stamp|Betrug belegt: Wachsstempel und leises Raunen
waage_falsch_beschuldigt|1|1.1|chair|Falsch beschuldigt: Stuhl rückt, danach Stille
schloss_dietrich|3|0.8|lockpick|Dietrich angesetzt: unterschiedlich schnelle Metallstifte
schloss_auf|1|0.65|unlock|Schloss geöffnet: Stift und Riegel lösen sich
schloss_brecheisen|1|1.2|crowbar|Schloss aufgebrochen: Metall hebelt Holz auf
schloss_misslungen|1|0.7|lockfail|Schlossversuch misslungen: Stift springt zurück'''

def catalog():
 rows=[]
 for line in CATALOG.splitlines():
  base,count,duration,recipe,note=line.split('|'); count=int(count)
  for v in range(1,count+1):
   id=base+(f'_{v}' if count>1 else '')
   group='schatten' if id.startswith('schatten_') else 's4r' if id.startswith('s4') else 'rituale56'
   loop=recipe.endswith('_loop');ambient=recipe in ['night_loop','dream_loop','shadow_loop']
   volume=.24 if ambient else .28 if recipe in ['shadow_step','thread_break','exhale'] else .48
   rows.append(dict(id=id,base_id=base,variant=v,variants=count,group=group,duration=float(duration),recipe=recipe,volume=volume,loop=loop,note=note+(f' (Variante {v}/{count})' if count>1 else '')))
 return rows

def synth(row):
 seed=int.from_bytes(hashlib.sha256(row['id'].encode()).digest()[:8],'little');rng=np.random.default_rng(seed)
 d=row['duration'];n=round(d*SR);t=np.arange(n)/SR;y=np.zeros(n);v=row['variant'];k=row['recipe'];pitch=1+(v-1)*.075
 def add(at,arr,gain=1):
  start=round(at*SR)
  if start>=n:return
  count=min(len(arr),n-start);y[start:start+count]+=arr[:count]*gain
 def env(sec,attack=.005,decay=None):
  q=np.arange(round(sec*SR))/SR
  a=np.minimum(q/max(attack,.001),1)
  a*=np.exp(-q/(decay or max(sec/5,.015)))
  tail=min(len(q)//2,round(.012*SR));a[-tail:]*=np.linspace(1,0,tail)
  return q,a
 def tone(at,sec,f,g=.3,decay=None,ratios=(1,),attack=.004,slide=0):
  q,e=env(sec,attack,decay);z=sum(np.sin(2*np.pi*(f*pitch*r*q+slide*q*q/2))/(i+1)**1.7 for i,r in enumerate(ratios));add(at,z*e,g)
 def noise(at,sec,g=.3,lo=120,hi=3000,attack=.006,decay=None):
  q,e=env(sec,attack,decay);z=rng.normal(0,1,len(q));sos=signal.butter(2,[lo,hi],btype='bandpass',fs=SR,output='sos');z=signal.sosfilt(sos,z);add(at,z*e,g)
 def metal(at=0,f=560,g=.28,sec=.65):tone(at,sec,f,g,ratios=(1,2.71,4.13),decay=sec/5)
 def thud(at=0,f=92,g=.45,sec=.3):tone(at,sec,f,g,slide=-f*1.8,decay=.06);noise(at,.1,g*.4,70,700)
 def cloth(at=0,sec=.5,g=.2):noise(at,sec,g,250,2500,attack=.03,decay=sec/3)
 def bubbles(at=0,sec=.7,g=.3):
  for p in np.arange(0,sec,.09+(v*.008)):
   f=rng.uniform(190,650);tone(at+p,.12,f,g*rng.uniform(.4,1),slide=f*3,decay=.024)
 def snap(at=0,g=.3):noise(at,.08,g,800,6500,decay=.012);tone(at,.12,780,g*.4,decay=.02)
 def breath(at=0,sec=.9,g=.2):noise(at,sec,g,180,1600,attack=sec*.25,decay=sec*.4)
 def glass(at=0,g=.25):
  for j in range(4):metal(at+j*.035,720+j*231,g/(j+1),.5)
 def voice(at=0,sec=1,g=.2):
  q,e=env(sec,.16,sec*.45);z=signal.sawtooth(2*np.pi*(103*pitch*q+.12*np.sin(2*np.pi*3*q)))
  z=sum(signal.sosfilt(signal.butter(2,[f*.8,f*1.2],btype='bandpass',fs=SR,output='sos'),z)*gain for f,gain in [(320,1),(780,.7),(1400,.25)])
  add(at,z*e,g)
 if row['loop']:
  # Fully periodic spectral synthesis and circular overlap: no zero-gap fades.
  freq=np.fft.rfftfreq(n,1/SR);spec=rng.normal(size=len(freq))+1j*rng.normal(size=len(freq));spec*=np.exp(-(freq/1700)**2)/np.maximum(freq,70)**.6;spec[freq<65]=0
  z=np.fft.irfft(spec,n);z/=np.max(np.abs(z));y+=z*.12*(.8+.2*np.cos(2*np.pi*t/d*3))
  if k in ['pour_loop','boil_loop']:
   for p in np.arange(0,d,.13 if k=='boil_loop' else .23):bubbles(p,.12,.18)
  elif k=='night_loop':
   cloth(.9,.55,.12);cloth(4.1,.7,.1)
   for p in [1.8,2.7,5.3,6.8]:snap(p,.035)
  elif k=='dream_loop':
   q,e=env(2.4,.005,.7);z=np.sin(2*np.pi*392*q)*e;add(2,z[::-1],.14);tone(4.4,.9,392,.1)
  elif k=='shadow_loop':
   # Integer cycles fit the loop exactly, avoiding drift at the join.
   y+=.09*np.sin(2*np.pi*75*t)*(1+.18*np.cos(2*np.pi*t/d))+.025*np.sin(2*np.pi*112*t)
  elif k=='pulse_loop':
   y*=.2
   for p in [.18,1.18]:thud(p,65,.35,.5)
  # Cross-boundary waveform join: wrap a 60ms raised-cosine overlap, retain exact length.
  m=round(.06*SR);a=np.linspace(0,1,m);blend=(1-np.cos(np.pi*a))/2
  y[-m:]=y[-m:]*(1-blend)+y[:m]*blend
  y=np.roll(y,-m) # boundary now sits within stationary audio; enforce tiny seam correction
  delta=y[-1]-y[0];y[-m:]-=delta*blend
 elif k=='tear':snap(.02,.45);cloth(.08,.18,.3)
 elif k=='door':noise(0,1.1,.25,300,2800);tone(.45,1.7,73,.32,ratios=(1,1.41,2.7),attack=.15);thud(2.1,62,.6)
 elif k=='thud':thud(.02)
 elif k=='seal':metal(.02,660,.18,.55);tone(.08,.5,880,.09)
 elif k=='stake':metal(.02,380,.22,.35);thud(.09,86,.5);noise(.14,.4,.2,100,1400)
 elif k=='flare':noise(.02,.55,.4,200,4300,attack=.1,decay=.16)
 elif k=='stop':bubbles(.02,.16,.28);cloth(.2,.12,.1)
 elif k in ['glass','ice','glass_fall']:glass(.02,.25);noise(.18,min(d-.18,.7),.1,600,4000)
 elif k in ['smother','hiss','dissolve','smoke','embers']:
  noise(.02,d-.05,.4,120,3200,attack=.07,decay=d/4)
  if k in ['embers','dissolve']:
   for p in [.15,.32,.56]:snap(p,.065)
 elif k=='slide':thud(.02,105,.4);cloth(.18,.55,.3)
 elif k=='sunrise':
  for at,f in [(0,261.63),(.35,329.63),(.7,392)]:tone(at,3-at,f,.15,attack=.35,decay=1.3,ratios=(1,2))
  tone(3.05,.25,1760,.035,slide=900,attack=.04);tone(3.34,.22,1980,.025,slide=-500,attack=.03)
 elif k in ['thread','thread_join','wrap','cocoon_break','thread_break']:
  cloth(.02,min(d*.7,1),.24)
  if k in ['thread','thread_join']:tone(.08,d-.12,740,.22,slide=160,attack=.03)
  if k=='wrap':
   for p in [.15,.45,.8,1.1]:cloth(p,.35,.15)
  if k in ['cocoon_break','thread_break']:snap(.08,.2)
 elif k in ['sleep','wake']:breath(.02,d*.75,.25);tone(.1,d*.8,220 if k=='sleep' else 330,.1,attack=.25,slide=-45 if k=='sleep' else 35)
 elif k in ['mask','porcelain']:glass(.03,.11);cloth(.25,d-.3,.27)
 elif k in ['leather','fist','table']:thud(.02,120 if k=='table' else 100,.5);cloth(.01,.2,.2)
 elif k in ['crack','gear_break']:snap(.02,.4);metal(.09,430,.13,.35)
 elif k=='mercy':breath(.02,.7,.2);thud(.8,115,.18);thud(1.18,103,.1);thud(1.5,95,.06)
 elif k=='doubt':tone(.01,.28,350,.2,attack=.04);tone(.38,.1,338,.12)
 elif k in ['deaf_in','deaf_out']:
  z=rng.normal(size=n);z=signal.sosfilt(signal.butter(2,2600,fs=SR,output='sos'),z);low=signal.sosfilt(signal.butter(2,180,fs=SR,output='sos'),z);mix=np.linspace(0,1,n)
  if k=='deaf_out':mix=mix[::-1]
  y=.3*((1-mix)*z+mix*low)*(1-mix)**1.8
 elif k in ['pot_bell','block','brew_done']:metal(.02,260,.3,sec=d*.8);bubbles(.1,.4,.14) if k=='brew_done' else None
 elif k in ['drink','mud_drink']:bubbles(.03,.42,.35);breath(.4,.35,.15);noise(.55,.22,.09+v*.015,200,1600+v*300)
 elif k=='explosion':thud(.01,63,.7,.5);noise(.01,1.1,.65,60,2700,decay=.18)
 elif k=='creak':tone(.02,1.45,110,.25,ratios=(1,2.03,3.11),attack=.12,slide=30);cloth(.25,.8,.15)
 elif k=='rivet':metal(.02,430,.35,.4);thud(.02,130,.4)
 elif k=='ring_break':snap(.02,.3);metal(.07,520,.35,.8)
 elif k=='chain':metal(.02,380,.2,.35);metal(.12,510,.15,.25)
 elif k=='seal_lead':cloth(.02,.45,.22);thud(.45,140,.3);metal(.48,310,.12,.4)
 elif k in ['coins','theft']:
  for j in range(3):metal(.03+j*(.1+v*.018),1150+j*140,.19/(j+1),.35)
  if k=='theft':cloth(.12,.55,.22)
 elif k=='pouch':cloth(.02,.55,.35)
 elif k=='balance':
  for j in range(4):metal(.02+j*.25,480+j*22,.2/(j+1),.3)
 elif k in ['mud','relic','name_gone']:bubbles(.02,d*.7,.35);noise(.05,d-.1,.3,70,650,attack=.07,decay=d*.35);snap(2.25,.18) if k=='relic' else None
 elif k=='empty_bottle':metal(.02,890,.2,.5);metal(.21,1060,.08,.3)
 elif k=='perfect':metal(.25,1120,.22,.45)
 elif k in ['tick','watch']:metal(.02,1450,.22,.12);thud(.02,220,.18,.09)
 elif k in ['shadow_split','shadow_return','shadow_slash','shadow_hit','shadow_block','shadow_step']:
  g=.14 if k=='shadow_step' else .3;cloth(.02,d*.6,g);breath(.03,d*.8,g)
  if k!='shadow_step':tone(.03,d*.85,92,.2,attack=.09,slide=-25 if k!='shadow_return' else 35)
 elif k=='shadow_dice':
  for j in range(5):thud(.02+j*.1,180+j*15,.25/(1+j*.25),.12)
 elif k=='ingredient':
  if v==1:noise(.02,.65,.35,300,5000,attack=.04)
  elif v==2:cloth(.02,.65,.35);snap(.13,.08)
  else:bubbles(.02,.65,.3)
 elif k in ['steam','failed_brew','bottle','exhale']:
  if k!='exhale':bubbles(.03,d*.5,.25)
  if k=='steam':noise(.2,.8,.35,700,4200,attack=.1)
  elif k=='failed_brew':noise(.3,.7,.25,90,700)
  elif k=='bottle':metal(.02,800,.09,.4);noise(.1,1.1,.12,300,1800)
  else:breath(.02,.7,.25)
 elif k=='beast':tone(.02,1.45,118,.25,ratios=(1,1.5,2),attack=.18,slide=-18);metal(.2,610,.13,.8)
 elif k in ['murmur','voice','echo']:voice(.02,d-.1,.45);voice(.6,.8,.12) if k=='echo' else None
 elif k in ['memory','refuse']:breath(.02,d*.8,.25);metal(.12,840,.13,d*.7)
 elif k in ['failure','start','success','miss']:
  tone(.02,.3,245 if k=='miss' else 330,.22);tone(.3,.3,440 if k=='success' else 247,.16) if k in ['success','failure'] else None
 elif k=='double_pulse':thud(.02,90,.4);thud(.32,84,.3)
 elif k=='stamp':thud(.02,170,.4);cloth(.1,.25,.2);voice(.4,.8,.22)
 elif k=='chair':noise(.02,.55,.35,160,1500,attack=.04);thud(.45,95,.2)
 elif k=='lockpick':
  for j in range(3+v):metal(.02+j*.1,950+j*63,.16,.15)
 elif k=='unlock':metal(.02,950,.15,.15);thud(.18,190,.3);metal(.2,450,.16,.35)
 elif k=='crowbar':tone(.02,.65,150,.25,attack=.06,slide=90);snap(.6,.4);thud(.68,98,.4)
 elif k=='lockfail':metal(.02,1100,.2,.2);metal(.19,670,.18,.2);cloth(.3,.2,.15)
 else:raise ValueError(k)
 if not row['loop']:
  m=min(round(.012*SR),n//4);y[:m]*=np.linspace(0,1,m);y[-m:]*=np.linspace(1,0,m)
 y-=np.mean(y)
 peak=np.max(np.abs(y));assert peak>0.001,row['id']
 # Ceiling only: don't boost quiet steps and preserve designed relative dynamics.
 y*=min(1,.58/peak)
 return y.astype('<f4')

def main():
 rows=catalog();out=ROOT/'public/audio/sfx';out.mkdir(parents=True,exist_ok=True)
 manifest={'batch':'sfx4','base':'audio/sfx/','formats':['ogg','mp3'],'sounds':{}}
 for i,row in enumerate(rows):
  audio=synth(row)
  args=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','pipe:0','-map_metadata','-1']
  for ext,codec in [('ogg',['-c:a','libvorbis','-q:a','4']),('mp3',['-c:a','libmp3lame','-b:a','128k','-write_xing','1'])]:
   subprocess.run(args+codec+[str(out/(row['id']+'.'+ext))],input=audio.tobytes(),check=True)
  manifest['sounds'][row['base_id']]={k:row[k] for k in ['group','volume','duration','loop']}
  manifest['sounds'][row['base_id']]['note']=row['note'].split(' (Variante ')[0]
  if row['variants']>1:manifest['sounds'][row['base_id']]['variants']=row['variants']
  if (i+1)%20==0:print(f'{i+1}/{len(rows)} effects encoded',flush=True)
 (ROOT/'public/audio/manifest-sfx4.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 (HERE/'catalog.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
 print(f'Generated {len(rows)} original effects / {len(rows)*2} files.')
if __name__=='__main__':main()
