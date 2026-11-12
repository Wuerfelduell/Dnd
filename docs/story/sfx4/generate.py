#!/usr/bin/env python3
"""DS: eigene deterministische Synthese; Python + numpy/scipy + FFmpeg."""
from pathlib import Path
import json, hashlib, subprocess, tempfile
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io.wavfile import write
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/audio/sfx'
SR=24000
# ID | Varianten | Dauer | Klangrezept | fachlicher Auslöser / Klangbild
SPEC='''s4r_regel_gebrochen|1|0.55|rip|Ritualregel gebrochen: trockener Riss, danach Stille
s4r_waechter_erscheint_welt|1|2.6|door|Wächter erscheint auf der Karte: Kalk rieselt, schwere Tür
s4r_waechter_immun|1|0.45|thud|Unverwundbarer Wächter getroffen: dumpfes Abprallen
s4r_bedingung_erfuellt|1|0.7|seal|Teilbedingung erstmals erfüllt: leiser kurzer Siegelklang
s4la_laterne_aufstellen|1|0.7|stake|Laterne gesetzt: Eisenpfahl in Erde
s4la_nachfuellen_loop|1|2|oil|Nachfülltaste gehalten: Öl gluckert, nahtlose Schleife
s4la_nachfuellen_voll|1|0.8|flare|Nachfüllen abgeschlossen: Flamme springt auf
s4la_nachfuellen_abbruch|1|0.35|stopoil|Nachfüllen abgebrochen: Ölfluss stoppt
s4la_laterne_angegriffen|2|0.55|glasshit|Monster trifft Laterne: kurzes Glasklirren
s4la_laterne_aus|1|0.6|snuff|Laterne erlischt: erstickte Flamme
s4la_monster_zischt|3|0.8|sizzle|Monster erleidet Lichtschaden: Schatten zischt
s4la_monster_zerfall|1|1.2|ash|Monster stirbt am Licht: trockener Zerfall
s4la_rueckstoss|1|0.65|slide|Spieler zurückgestoßen: Treffer und Rutschen
s4la_amb_nacht|1|8|night|Nachtprüfung läuft: Wind, fernes Scharren, Flammen
s4la_unruhe_puls|1|1.5|pulse|Unruhe steigt: tiefer Puls, zeitabhängig einblenden
s4la_sonnenaufgang|1|3.9|sunrise|Wächter zwischen drei brennenden Laternen: drei Töne, warmer Akkord, ferner Vogel
s4fa_markieren|1|0.8|thread|Neue Kreatur markiert: Faden spannt sich, hoher Ton
s4fa_einschlafen|1|2.2|sleep|Fünf Markierungen vollständig, Schlaf beginnt: Atem und zuziehende Fäden
s4fa_traum_amb|1|8|dream|Traumkampf aktiv: gedämpftes Bett und rückwärts klingende Glocke
s4fa_erwachen|1|1.2|wake|Traum verlassen: Atem und sich lösender Faden
s4fa_heilung_versagt|1|0.4|snap|Heilversuch im Traum abgewiesen: Faden reißt leise
s4ma_verwandeln|1|1.5|mask|Zivilistengestalt angenommen: Porzellan abgelegt und Stoff
s4ma_handschuh|1|0.55|leather|Beyonder herausgefordert: Lederhandschuh fällt auf Stein
s4ma_faust|3|0.32|punch|Bloßer Faustschlag trifft: trockener Körperkontakt ohne Magie
s4ma_gabe_verboten|1|0.5|porcelain|Fähigkeit im Zivilistenritual abgewiesen: Maske springt
s4ma_verschonen|1|1.7|mercy|Gegner verschont: Atem, Schritte entfernen sich
s4ma_zweifel|1|0.65|doubt|Dauerhafter Zweifel gesetzt: Ton bricht ab
s4ec_taub_an|1|1.5|deaf|Taubheit beginnt: Rauschen wird tiefpassgefiltert und verschwindet
s4ec_taub_aus|1|0.8|hearing|Taubheit beendet: Welt kehrt weich zurück, kein Tinnitus
s4ke_rezept_frei|1|1|potbell|Ritualrezept freigeschaltet: Kessel klingt wie Glocke
s4ke_ritualtrank_gebraut|1|1.1|brew|Ritualtrank fertig: Blase und heller Dampf
s4ke_trinken_reihe|5|1.1|drink|Nächsten Ritualtrank getrunken: fünf feste Schluck-/Zischfarben
s4ke_wurf_explosion|1|1.2|blast|Explosiver Ritualtrank trifft: kurzer gedämpfter Druckstoß
s4ke_wurf_frost|1|0.9|ice|Frosttrank trifft: Eis knackt
s4ke_wurf_glut|1|1.1|glow|Gluttrank trifft: weiches Zischen und Brutzeln
s4ke_angriff_verboten|1|0.45|blocked|Direkter Angriff abgewiesen: Kesselrand dämpft Schlag
s4ei_last_aechzt|2|1.2|creak|Überlast bewegt sich: Metall knarrt unter Gewicht
s4ei_runde_ueberstanden|1|0.5|rivet|Runde eins bis fünf überstanden: Niet schlägt ein
s4ei_waechter_frei|1|1|ringbreak|Runde sechs beginnt: Nietring springt, Wächter verwundbar
s4ei_ausweichen_verboten|1|0.5|drag|Ausweichversuch abgewiesen: Gewicht schleift
s4wa_besitz_versiegeln|1|1.3|plomb|Besitz abgelegt und versiegelt: Schnur, Plombe, Blei
s4wa_kauf|3|0.8|coins|Zirkelware bezahlt: Münzen auf Waagschale
s4wa_kapital_knapp|1|0.6|pouch|Geld für nächsten Kauf fehlt: leerer Beutel
s4wa_alles_gekauft|1|1.4|balance|Letzte Ware gekauft: Waage pendelt ein
s4mo_zersetzen|3|1.4|mire|Geeigneter Gegenstand durch Moorfähigkeit zersetzt: feuchte Blasen
s4mo_relikt_formen|1|3|relic|Fünf Reste zum Relikt geformt: Torf pressen und trockener Knochenknacks
s4mo_moorwasser_trinken|2|1.1|muddrink|Moorwasser der aktuellen Runde getrunken: zäher Schluck
s4mo_moorwasser_leer|1|0.55|bottle|Moorwasser fehlt: leere Flasche
s4uh_perfekt|1|0.65|perfect|Perfektes Ausweichen bestätigt: Tick pausiert, heller Schlag
s4uh_fehler|1|0.55|gear|Ausweichen verfehlt: Zahnrad bricht
s4uh_monster_angriff_gezaehlt|1|0.2|tick|Erster tatsächlicher Monsterangriff gezählt: kurzer Tick
schatten_trennen|1|1.8|detach|Schatten gelöst: Stoff hebt sich vom Boden, Unterdruck
schatten_rueckkehr|1|1.5|return|Schatten kehrt zum Körper zurück: Druck löst sich
schatten_verloren|1|1.4|smoke|Schatten besiegt: Rauch verweht
schatten_schritt|2|0.3|softstep|Schatten setzt Schritt: fast lautloses Streifen
schatten_attacke|3|0.65|slash|Schattenattacke ausgeführt: dunkler Luftschnitt
schatten_treffer|1|0.45|shadowhit|Schatten getroffen: gedämpfter Luftstoß
schatten_auslosen|1|0.9|dice|Rundenfähigkeit festgelegt: dunkles Würfeln
schatten_heilung_versagt|1|0.45|empty|Schattenheilung abgewiesen: hohler abreißender Hauch
schatten_amb|1|8|shadowamb|Schattensteuerung aktiv: leiser tiefer Druck und Luft
sud_zutat|3|0.8|ingredient|Zutat hinzugefügt: Variante 1 Pulver, 2 Kraut, 3 Flüssigkeit
sud_brodeln_loop|1|4|boil|Freies Brauen aktiv: nahtloses Brodeln
sud_gelungen|1|1|steam|Sud gelungen: heller Dampfstoß
sud_pfusch|1|1.2|botch|Sud misslungen: dumpfe Blase und Asche
sud_abfuellen|1|1.1|pour|Sud abgefüllt: Fluss in Glas
sud_wirkung_endet|1|0.7|breath|Sudwirkung abgelaufen: leises Ausatmen
s5_laternenbestie_ruf|1|1.6|beast|Laternenbestie erscheint: tiefer wortloser Glasruf
s5_laternenbestie_fall|1|1.4|glassfall|Laternenbestie besiegt: Glas klingt aus
s5_kokon_wickeln|1|1.5|wrap|Kokon wird gewickelt: trockene Faserzüge
s5_kokon_platzt|1|0.8|cocoon|Kokon geöffnet: Fasern reißen
s5_gesicht_nehmen|1|1|face|Gesicht angenommen: leise Porzellankontakte
s5_misstrauen|1|1.2|murmur|Misstrauen ausgelöst: wortloses synthetisches Raunen
s5_diebstahl|2|0.65|steal|Diebstahl gelingt: Münzen verschwinden in Stoff
s5_erinnerung_ziehen|1|1.6|memory|Erinnerung entnommen: Atemhauch in Glas
s5_erinnerung_verweigert|1|0.55|refuse|Erinnerungsentnahme verweigert: Glaston verstummt
s5_uhr_warten_tick|1|1|watch|Warteprüfung: ein Taschenuhrtick pro bestätigter Sekunde
s5_pruefung_gescheitert|1|1|fail|Seq-5-Prüfung gescheitert: trockener absinkender Klang
probe_start|1|0.9|begin|Seq-6-Probe gestartet: kurzer gedämpfter Auftakt
probe_bestanden|1|1|success|Seq-6-Probe bestanden: zwei nahe helle Töne
probe_fehlversuch|1|0.6|miss|Seq-6-Fehlversuch gezählt: kurzer matter Schlag
probe_faden_verbinden|1|1.1|join|Probefäden verbunden: zwei gespannte Saiten vereinen sich
probe_echo_stimme|3|1.5|voice|Echo-Probe spricht: wortlose synthetische Nebelstimme
probe_echo_nachhall|1|1.8|echo|Antwort der Echo-Probe: abklingende ferne Resonanz
probe_moor_name_weg|1|1.2|erase|Name im Moor entfernt: feuchtes Wischen
probe_uhr_puls|1|1.3|doublepulse|Uhr-Probe: zwei Schläge, danach Stille
waage_anprangern|1|0.6|table|Betrugsverdacht vorgebracht: Faust auf Tisch
waage_betrug_aufgedeckt|1|1.3|expose|Betrug bestätigt: Wachsstempel und Raunen
waage_falsch_beschuldigt|1|1.1|chair|Beschuldigung falsch: Stuhl rückt, danach Stille
schloss_dietrich|3|0.65|pick|Dietrich bewegt: feine Metallstifte
schloss_auf|1|0.6|unlock|Schloss geöffnet: Stift und Riegel
schloss_brecheisen|1|1|crowbar|Schloss mit Brecheisen geöffnet: Hebeln und kurzer Bruch
schloss_misslungen|1|0.65|lockfail|Öffnungsversuch misslungen: Stift rutscht ab'''
LOOPS={'s4la_nachfuellen_loop','s4la_amb_nacht','s4fa_traum_amb','schatten_amb','sud_brodeln_loop'}
AMBIENT={'s4la_amb_nacht','s4fa_traum_amb','schatten_amb'}

def render(id,variant,dur,kind):
    rng=np.random.default_rng(int.from_bytes(hashlib.sha256(f'{id}/{variant}'.encode()).digest()[:8],'little'))
    n=round(dur*SR); y=np.zeros(n); pitch=1+(variant-1)*.071
    def add(a,at=0,gain=1):
        start=round(at*SR); end=min(n,start+len(a));
        if end>start:y[start:end]+=a[:end-start]*gain
    def tone(f,d,at=0,g=.25,decay=6,ratio=1):
        t=np.arange(round(d*SR))/SR
        env=np.minimum(t/.004,1)*np.exp(-t*decay)*np.minimum((d-t)/.02,1)
        a=(np.sin(2*np.pi*f*pitch*t)+.24*np.sin(2*np.pi*f*pitch*ratio*2.01*t))*env
        add(a,at,g)
    def noise(d,at=0,g=.2,lo=80,hi=3000,shape='fall'):
        t=np.arange(round(d*SR))/SR; a=rng.normal(size=len(t))
        a=sosfilt(butter(2,[lo,hi],btype='bandpass',fs=SR,output='sos'),a)
        env=np.sin(np.pi*np.minimum(t/d,1))**.7 if shape=='swell' else np.exp(-t/d*6)*np.minimum(t/.003,1)
        add(a*env,at,g)
    def hit(at=0,f=130,g=.3):tone(f,.25,at,g,18);noise(.13,at,g*.7,100,1700)
    def glass(at=0,g=.15,f=1200):
        for r in [1,1.47,2.09]:tone(f*r,.5,at,g/r,9)
    def bubbles(d,at=0,g=.23):
        for a in np.arange(at,at+d,.115):
            f=rng.uniform(150,550); t=np.arange(round(.09*SR))/SR
            add(np.sin(2*np.pi*(f*t+800*t*t))*np.sin(np.pi*t/.09)**2,a,g*rng.uniform(.3,1))
    def cloth(at=0,d=.5,g=.25):noise(d,at,g,350,3400,'swell')
    def metal(at=0,g=.15):
        for f in [310,831,1370]:tone(f,.6,at,g,8)
    def breath(at=0,d=.8,g=.22):noise(d,at,g,130,1200,'swell')
    def crack(at=0,g=.32):noise(.16,at,g,400,6000);tone(480,.12,at,g*.25,30)
    def coin(at=0,g=.16):glass(at,g,1800);tone(750,.25,at,g,15)
    if kind in ['oil','boil']:bubbles(dur,g=.19 if kind=='oil' else .24);noise(dur,0,.12,80,700,'swell')
    elif kind=='night':
        noise(dur,0,.3,60,850,'swell');noise(dur,0,.08,1200,5000,'swell')
        for at in [1.1,3.9,6.4]:cloth(at,.45,.08)
        for at in rng.uniform(0,dur-.1,35):noise(.07,at,.07,800,5000)
    elif kind=='dream':
        tone(98,dur,0,.12,.08);noise(dur,0,.14,50,650,'swell')
        for at in [1,4.5]:
            t=np.arange(SR*2)/SR;add((np.sin(2*np.pi*523.25*t)+.3*np.sin(2*np.pi*1471*t))*np.linspace(0,1,len(t))**3,at,.07)
    elif kind=='shadowamb':
        tone(48,dur,0,.12,.02);tone(72,dur,0,.05,.02);noise(dur,0,.18,40,450,'swell')
    elif kind=='sunrise':
        for at,f in [(0,261.63),(.55,329.63),(1.1,392)]:tone(f,2.7,at,.19,.65)
        for f in [261.63,329.63,392]:tone(f,1.75,2.1,.12,1.2)
        for at in [3.15,3.4]:tone(1700,.16,at,.025,12)
    elif kind=='door':noise(.7,0,.3,250,4200);tone(76,1.6,.45,.3,1.5);noise(1.6,.5,.25,50,700,'swell');hit(2.05,95)
    elif kind in ['rip','snap','cocoon','porcelain','gear']:
        crack(.02,.4 if kind=='rip' else .25)
        if kind in ['porcelain','gear']:glass(.04,.1,1900)
        if kind=='cocoon':cloth(.12,.5,.3)
    elif kind in ['thud','punch','table','miss','shadowhit','leather']:
        hit(.015,{'thud':85,'punch':115,'table':175,'miss':180,'shadowhit':65,'leather':130}[kind],.38)
        if kind=='leather':cloth(.02,.3,.2)
    elif kind in ['seal','potbell','success','begin']:
        tone({'seal':740,'potbell':220,'success':660,'begin':330}[kind],dur-.03,.01,.23,5)
        if kind=='potbell':metal(.01,.1)
        if kind=='success':tone(880,.65,.25,.2,5)
    elif kind in ['stake','rivet','ringbreak','crowbar','unlock','lockfail']:
        hit(.03,150,.32);metal(.03,.12)
        if kind=='stake':noise(.4,.15,.35,70,650)
        if kind in ['ringbreak','crowbar']:crack(.3);metal(.32)
        if kind in ['unlock','lockfail']:hit(.28,260,.17)
    elif kind in ['flare','snuff','sizzle','ash','steam','glow','blast','smoke']:
        noise(dur-.03,.01,.42,70 if kind=='blast' else 700,2300 if kind=='smoke' else 6500,'swell' if kind in ['flare','steam','glow'] else 'fall')
        if kind=='blast':hit(.02,55,.6)
        if kind=='glow':bubbles(.7,.1,.08)
        if kind=='ash':cloth(.2,.7,.25)
    elif kind in ['slide','drag','chair']:
        hit(.01,100,.25);noise(min(.65,dur-.12),.1,.35,90,1800,'swell')
    elif kind in ['pulse','doublepulse']:
        hit(.03,52,.4)
        if kind=='doublepulse':hit(.39,58,.3)
    elif kind in ['thread','join']:
        tone(740,.7,.02,.17,3);cloth(.02,.5,.12)
        if kind=='join':tone(370,.8,.22,.18,3)
    elif kind in ['sleep','wake','mercy','breath']:
        breath(.01,min(.9,dur-.02))
        if kind=='sleep':cloth(.7,1,.23);tone(280,1.2,.7,.09,2)
        if kind=='wake':cloth(.3,.7,.17)
        if kind=='mercy':hit(.8,125,.15);hit(1.25,135,.08)
    elif kind in ['mask','face']:
        glass(.03,.09,850);glass(.3,.06,1100);cloth(.25,min(.8,dur-.3),.25)
    elif kind in ['doubt','refuse','empty','blocked','fail']:
        tone({'doubt':430,'refuse':620,'empty':110,'blocked':180,'fail':170}[kind],dur*.65,.01,.25,2)
        if kind=='blocked':hit(.01,90,.2)
    elif kind in ['deaf','hearing']:
        # Moving low-pass and decreasing/increasing envelope, without a ringing pure tone.
        raw=rng.normal(size=n); low=sosfilt(butter(2,180,fs=SR,output='sos'),raw); hi=sosfilt(butter(2,3500,fs=SR,output='sos'),raw)
        u=np.linspace(0,1,n); u=u if kind=='hearing' else 1-u
        y=(low*(1-u)+hi*u)*u**1.4*.3
    elif kind in ['brew','botch','mire','relic','muddrink','drink','pour','stopoil','ingredient']:
        if kind=='ingredient' and variant<3:
            noise(.6,.01,.3,1500 if variant==1 else 250,6000 if variant==1 else 2800,'swell')
        else:bubbles(min(dur-.06,2.2),.02,.3)
        if kind in ['brew','drink']:noise(.5,.5,.16,600+variant*280,4500,'swell')
        if kind=='botch':noise(.5,.65,.25,70,1000)
        if kind=='relic':noise(2,.1,.3,50,600,'swell');crack(2.35,.3)
        if kind in ['pour','muddrink']:glass(.05,.04,800)
    elif kind in ['glasshit','glassfall','bottle','ice']:
        glass(.02,.15,950 if kind=='bottle' else 1500)
        if kind=='glasshit':hit(.01,140,.2)
        if kind=='ice':
            for at in [.04,.16,.34]:crack(at,.15)
        if kind=='glassfall':glass(.35,.08,1800);glass(.65,.04,2200)
    elif kind=='creak':
        t=np.arange(n)/SR;add(np.sin(2*np.pi*(105*t+4*np.sin(2*np.pi*3*t)))*np.sin(np.pi*t/dur)**2,0,.25);metal(.2,.06)
    elif kind in ['plomb','pouch','wrap','detach','return','softstep','slash']:
        cloth(.01,dur*.75,.17 if kind=='softstep' else .32)
        if kind=='plomb':metal(.65,.12);hit(.85,100,.2)
        if kind=='wrap':cloth(.5,.65,.2);cloth(.9,.5,.2)
        if kind in ['detach','return','slash']:noise(dur*.8,.01,.32,40,600,'swell');tone(65,dur*.8,.01,.12,2)
    elif kind in ['coins','steal','balance','dice','pick']:
        for i in range(3):
            at=.02+i*(.12 if kind!='balance' else .3)
            if kind in ['coins','steal']:coin(at,.1/(1+i*.3))
            elif kind=='balance':metal(at,.1/(1+i*.5))
            else:hit(at,250 if kind=='dice' else 900,.15/(1+i*.3))
        if kind=='steal':cloth(.25,.35,.22)
    elif kind in ['tick','watch','perfect']:
        hit(.015,1250,.12)
        if kind=='perfect':glass(.3,.12,1700)
    elif kind in ['beast','voice','murmur','echo','memory','expose']:
        t=np.arange(n)/SR;f=90 if kind=='beast' else 145+variant*22
        env=np.sin(np.pi*t/dur)**2
        a=sum(np.sin(2*np.pi*f*k*t+1.2*np.sin(2*np.pi*2*t))/k for k in [1,2,3,5,7])
        add(a*env,0,.12 if kind in ['murmur','expose'] else .2);breath(.01,min(1.2,dur-.02),.12)
        if kind=='memory':glass(.5,.05,700)
        if kind=='expose':hit(.03,240,.3)
    elif kind=='erase':noise(dur-.03,.01,.35,90,1200,'swell');bubbles(.5,.3,.08)
    else:raise ValueError(kind)
    if id in LOOPS:
        # Circular overlap-add: blend the end into the start without a silence gap.
        k=round(.12*SR); u=(1-np.cos(np.linspace(0,np.pi,k)))/2
        midpoint=(y[-1]+y[0])/2
        y[:k]=midpoint*(1-u)+y[:k]*u
        y[-k:]=y[-k:]*(1-u)+midpoint*u
    else:
        k=min(round(.012*SR),n//4);y[:k]*=np.linspace(0,1,k);y[-k:]*=np.linspace(1,0,k)
    peak=np.max(np.abs(y));y*= (.43 if id not in AMBIENT else .27)/max(peak,1e-9)
    if id=='schatten_schritt':y*=.25
    return y

def main():
    sounds={};events={};recipes={};hashes={};count=0
    for line in SPEC.splitlines():
        id,v,d,kind,event=line.split('|');v=int(v);d=float(d)
        group='schatten' if id.startswith('schatten_') else 's4r' if id.startswith('s4') else 'rituale56'
        s=dict(group=group,volume=.24 if id in AMBIENT else .2 if id=='schatten_schritt' else .42,duration=d,note=event)
        if v>1:s['variants']=v
        if id in LOOPS:s['loop']=True
        sounds[id]=s;events[id]=event;recipes[id]=kind
        for variant in range(1,v+1):
            stem=id+(f'_{variant}' if v>1 else '')
            y=render(id,variant,d,kind)
            with tempfile.TemporaryDirectory() as tmp:
                wav=Path(tmp)/'sound.wav';write(wav,SR,np.int16(np.clip(y,-1,1)*32767))
                for ext,codec in [('ogg','libvorbis'),('mp3','libmp3lame')]:
                    dest=OUT/f'{stem}.{ext}'
                    subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a',codec,'-q:a','4','-map_metadata','-1',str(dest)],check=True)
                    hashes[str(dest.relative_to(ROOT/'public'))]=hashlib.sha256(dest.read_bytes()).hexdigest();count+=1
    manifest=dict(batch='sfx4',base='audio/sfx/',formats=['ogg','mp3'],sounds=sounds)
    (ROOT/'public/audio/manifest-sfx4.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    here=Path(__file__).parent
    (here/'catalog.json').write_text(json.dumps(dict(events=events,recipes=recipes),ensure_ascii=False,indent=2)+'\n')
    (here/'checksums.json').write_text(json.dumps(hashes,indent=2)+'\n')
    print(f'Generated {len(sounds)} IDs, {count//2} variants, {count} audio files.')
if __name__=='__main__':main()
