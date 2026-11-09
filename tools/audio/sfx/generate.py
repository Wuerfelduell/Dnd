#!/usr/bin/env python3
"""Original, seeded Nebelakten synthesis. No samples, soundfonts or network access.
Python 3 + numpy + scipy + ffmpeg (libvorbis/libmp3lame). Run from any cwd.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import wave
import numpy as np
from scipy.signal import butter, sosfiltfilt

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/audio/sfx'
SR = 44100
SOUNDS = {}


def e(kind, start=0, length=.15, freq=220, amp=1, end=None, reverse=False):
    return dict(kind=kind, start=start, length=length, freq=freq, amp=amp, end=end, reverse=reverse)


def add(id, group, duration, note, layers, variants=1, loop=False, volume=None, room=.16):
    SOUNDS[id] = dict(group=group, duration=duration, note=note, layers=layers,
                      variants=variants, loop=loop, room=room,
                      volume=volume if volume is not None else dict(ui=.55, schritte=.35,
                          welt=.45, polizei=.6, kampf=.55, okkult=.42, atmo=.20)[group])

# Each ID has its own editable duration, layers, mix and seeded variants.
add('ui_klick','ui',.16,'Weicher Messingknopf.',[e('wood',freq=480),e('metal',length=.08,freq=910,amp=.12)])
add('ui_hover','ui',.08,'Leises Tick beim Überfahren.',[e('wood',length=.06,freq=620)],volume=.14)
add('ui_oeffnen','ui',.5,'Ledermappe aufschlagen.',[e('cloth',length=.32,freq=800),e('wood',.25,.18,150,.5)])
add('ui_schliessen','ui',.32,'Ledermappe schließen.',[e('cloth',length=.15,freq=500),e('thud',.1,.2,120)])
add('ui_seite','ui',.4,'Papierseite umblättern.',[e('paper',length=.33,freq=2600)],variants=3)
add('ui_tab','ui',.18,'Registerkarte wechseln.',[e('paper',length=.14,freq=1900),e('wood',.07,.07,420,.2)])
add('ui_fehler','ui',.42,'Aktion nicht möglich.',[e('wood',length=.13,freq=160),e('wood',.19,.15,130)])
add('ui_bestaetigen','ui',.75,'Auswahl bestätigen.',[e('bell',length=.5,freq=440),e('bell',.18,.53,554,.8)])
add('ui_schreiben','ui',.38,'Notiz mit Bleistift.',[e('scrape',length=.29,freq=1900)])
add('ui_hinweis_neu','ui',1,'Neuer Hinweis im Notizbuch.',[e('scrape',length=.27,freq=1900),e('bell',.23,.7,880,.5)])
add('ui_schlussfolgerung','ui',1.3,'Zwei Notizen mit Faden verbinden.',[e('pluck',length=.25,freq=330),e('chord',.2,1,196,.6)])
add('ui_quest_neu','ui',1,'Auftrag ins Notizbuch stempeln.',[e('thud',length=.18,freq=130),e('chord',.1,.85,220,.5)])
add('ui_quest_fertig','ui',1.4,'Auftrag abgeschlossen.',[e('thud',length=.18,freq=130),e('bell',.12,.7,330,.5),e('bell',.32,.7,415,.5),e('bell',.52,.8,494,.5)])
add('ui_geld','ui',.65,'Einzelne Münzen.',[e('metal',length=.4,freq=1400),e('metal',.09,.4,1770,.6),e('metal',.23,.32,1280,.5)],variants=3)
add('ui_geld_viel','ui',.85,'Münzbeutel abstellen.',[e('cloth',length=.25,freq=900),e('thud',.14,.25,95),e('metal',.2,.4,1250,.4),e('metal',.34,.4,1620,.3)])
add('ui_item','ui',.42,'Gegenstand aufnehmen.',[e('cloth',length=.23,freq=1100),e('wood',.18,.16,520,.5)])
add('ui_item_selten','ui',1.4,'Seltenen Gegenstand aufnehmen.',[e('cloth',length=.23,freq=1100),e('wood',.18,.16,520,.5),e('glass',.25,1,660,.4)])
add('ui_speichern','ui',.36,'Zwei Uhrwerkticks beim Speichern.',[e('wood',length=.07,freq=900),e('wood',.19,.07,720)])
add('ui_stufe','ui',2.5,'Neue Sequenz: Gong und Glas.',[e('gong',length=2.4,freq=98),e('glass',.35,2,784,.4)],room=.35)
add('ui_dialog_tick','ui',.055,'Leiser Schreibmaschinentick pro Buchstabe.',[e('wood',length=.04,freq=760)],variants=3,volume=.12,room=0)
add('ui_karte','ui',.8,'Stadtkarte entfalten.',[e('paper',length=.29,freq=1700),e('paper',.22,.4,2200,.8)])
add('ui_tuer_gesperrt','ui',.65,'Verschlossene Klinke rüttelt.',[e('metal',length=.17,freq=530),e('wood',.1,.12,210),e('metal',.26,.18,580),e('wood',.39,.16,180)])

for material, duration, note, layers in [
 ('pflaster',.18,'Harter Steintritt.',[e('thud',length=.13,freq=135),e('grit',length=.12,freq=1800,amp=.4)]),
 ('holz',.21,'Bohle unter dem Schuh.',[e('wood',length=.18,freq=210),e('creak',.03,.15,400,.2)]),
 ('schlick',.24,'Nasser Moorboden schmatzt.',[e('thud',length=.1,freq=85),e('bubble',.03,.18,160,.8),e('cloth',.05,.17,600,.5)]),
 ('wasser',.23,'Schritt in flaches Wasser.',[e('splash',length=.21,freq=2200),e('bubble',.08,.12,420,.4)]),
 ('gras',.18,'Gras unter dem Schuh.',[e('cloth',length=.15,freq=2100),e('thud',length=.1,freq=100,amp=.5)]),
 ('teppich',.15,'Gedämpfter Schritt innen.',[e('thud',length=.13,freq=80),e('cloth',length=.1,freq=700,amp=.3)]),
 ('metall',.22,'Tritt auf Gitter oder Treppe.',[e('metal',length=.19,freq=410),e('thud',length=.1,freq=170,amp=.7)]),
 ('kies',.23,'Kies knirscht.',[e('grit',length=.21,freq=2700),e('thud',length=.12,freq=130,amp=.5)])]:
    add('schritt_'+material,'schritte',duration,note,layers,variants=3,room=.05)

add('tuer_auf','welt',1,'Schwere Holztür öffnen.',[e('metal',length=.18,freq=380,amp=.5),e('creak',.1,.65,220),e('wood',.7,.2,130)])
add('tuer_zu','welt',.75,'Schwere Holztür schließen.',[e('creak',length=.3,freq=170,amp=.4),e('thud',.24,.3,78),e('metal',.31,.28,430,.35)])
add('tuer_metall','welt',1.2,'Gittertür quietscht.',[e('creak',length=.55,freq=920),e('metal',.45,.65,260,.8)])
add('truhe_auf','welt',.85,'Holzkiste öffnen.',[e('wood',length=.15,freq=350),e('creak',.1,.55,310,.65),e('wood',.58,.2,160)])
add('schublade','welt',.7,'Schublade aufziehen.',[e('scrape',length=.5,freq=620),e('wood',.47,.17,180)])
add('laterne_an','welt',.65,'Gaslaterne zündet.',[e('hiss',length=.28,freq=2400),e('thud',.18,.25,95,.7),e('fire',.2,.4,1200,.4)])
add('untersuchen','welt',.8,'Rascheln und tiefer Hinweiston ohne Stimme.',[e('paper',length=.28,freq=1400),e('tone',.23,.48,140,.5,end=180)])
add('ruhe_schlaf','welt',3,'Ausatmen und leises Uhrwerk.',[e('breath',length=2.5,freq=900),e('wood',1.6,.08,820,.18),e('wood',2.2,.08,710,.18)])
add('glocke_fern','welt',3.8,'Ferner Kirchenglockenschlag.',[e('gong',length=3.65,freq=196)],room=.55,volume=.35)
add('moewe','welt',.95,'Synthetische Möwe am Hafen.',[e('bird',length=.7,freq=860,end=560)],variants=2)
add('frosch','welt',.7,'Moorfrosch quakt zweimal.',[e('croak',length=.22,freq=130),e('croak',.31,.25,150)],variants=2)
add('kraehe','welt',.8,'Synthetische Krähe.',[e('croak',length=.27,freq=330),e('croak',.35,.3,295)],variants=2)
add('ratte','welt',.65,'Huschen und leises Fiepen.',[e('grit',length=.4,freq=1700,amp=.5),e('bird',.2,.18,1800,.35,end=1400)])
add('wasser_platsch','welt',.85,'Gegenstand fällt ins Wasser.',[e('splash',length=.6,freq=2100),e('bubble',.15,.5,270,.6)])
add('zug_pfeife','welt',2.8,'Dampfpfeife bei Ankunft.',[e('whistle',length=2.4,freq=392),e('hiss',length=2.5,freq=2200,amp=.25)],room=.4)
add('zug_fahrt','welt',4,'Rattern auf Schienen.',[e('hiss',length=4,freq=1100,amp=.3)]+[e('wood',i*.25,.16,110+(i%2)*40,.8) for i in range(16)],loop=True)
add('ruder','welt',3,'Ruder tauchen ins Wasser.',[e('splash',t,.6,950,.7) for t in (.15,1.65)]+[e('creak',t,.35,180,.2) for t in (.8,2.3)],loop=True)
add('kutsche','welt',3,'Hufe auf Pflaster und Räder.',[e('grit',length=3,freq=650,amp=.2)]+[e('wood',i*.25,.13,180+(i%3)*55,.7) for i in range(12)],loop=True)
add('leuchtfeuer','welt',4,'Brummen und Knistern des Leuchtfeuers.',[e('drone',length=4,freq=55),e('fire',length=4,freq=1400,amp=.18)],loop=True,volume=.3)

add('polizei_entdeckt','polizei',.9,'Entdeckung durch Grauspäher.',[e('sting',length=.55,freq=330),e('metal',.03,.7,990,.5)])
add('polizei_verdacht','polizei',.8,'Grauspäher schöpft Verdacht.',[e('bell',length=.4,freq=370),e('bell',.3,.45,311)])
add('polizei_pfeife','polizei',.85,'Zwei Trillerpfiffe.',[e('whistle',length=.28,freq=1350),e('whistle',.4,.32,1350)])
add('polizei_verloren','polizei',.85,'Verfolger verliert die Spur.',[e('tone',length=.75,freq=340,end=140)],volume=.35)
add('fahndung_hoch','polizei',1.2,'Fahndungsstufe steigt.',[e('thud',length=.4,freq=75),e('whistle',.2,.75,920,.45)],room=.35)
add('zelle_zu','polizei',1.8,'Zellentür schließt, Schlüssel dreht.',[e('metal',length=1.2,freq=170),e('thud',length=.25,freq=80),e('metal',.65,.25,720,.4),e('wood',.85,.1,450)],room=.5)
add('verkleidung','polizei',.8,'Kleidung wechseln und zuknöpfen.',[e('cloth',length=.6,freq=850),e('wood',.5,.08,500,.3),e('wood',.63,.08,650,.3)])

add('kampf_start','kampf',1.2,'Rückwärtsglas und Kampfschlag.',[e('glass',length=.7,freq=590,reverse=True),e('thud',.65,.5,65)],room=.25)
add('treffer','kampf',.32,'Dumpfer Treffer.',[e('thud',length=.24,freq=105),e('grit',length=.12,freq=900,amp=.4)],variants=3)
add('treffer_krit','kampf',.7,'Kritischer Treffer mit Klirren.',[e('thud',length=.3,freq=75),e('glass',.02,.6,830,.5)])
add('treffer_spieler','kampf',.32,'Spieler wird getroffen.',[e('thud',length=.27,freq=62),e('cloth',length=.13,freq=700,amp=.4)])
add('block','kampf',.4,'Holz trifft Metall bei Abwehr.',[e('wood',length=.19,freq=190),e('metal',length=.33,freq=620,amp=.5)])
add('parade','kampf',.9,'Perfekte Parade mit Metallschimmer.',[e('metal',length=.5,freq=1180),e('glass',.04,.8,880,.5)])
add('ausweichen','kampf',.4,'Schneller Luftzug beim Ausweichen.',[e('breath',length=.32,freq=1800)])
add('verfehlt','kampf',.4,'Angriff geht ins Leere.',[e('breath',length=.32,freq=1100)],volume=.32)
add('ausholen','kampf',.65,'Klares Doppelglas-Warnsignal vor Gegnerangriff.',[e('glass',length=.4,freq=1175),e('glass',.12,.45,1568,.7)],volume=.75,room=.08)
add('heilen','kampf',1.3,'Aufsteigender Heilungsschimmer.',[e('bell',i*.16,.7,f,.6) for i,f in enumerate((392,494,587,784))])
add('trank','kampf',.9,'Korken und Gluckern ohne Stimme.',[e('wood',length=.1,freq=680),e('bubble',.15,.6,300)])
add('verband','kampf',.7,'Stoffverband wickeln.',[e('cloth',length=.25,freq=1600),e('cloth',.2,.25,1100),e('cloth',.42,.22,1500)])
add('buff','kampf',1.1,'Kraft steigt mit Luft und Akkord.',[e('breath',length=.6,freq=1200,reverse=True),e('chord',.3,.75,262,.6)])
add('debuff','kampf',1,'Verstimmtes Absinken bei Schwäche.',[e('tone',length=.8,freq=310,end=100),e('tone',length=.8,freq=318,amp=.4,end=103)])
add('nerven','kampf',.9,'Zwei dumpfe Herzschläge.',[e('heart',length=.3,freq=65),e('heart',.45,.3,60)])
add('gift','kampf',.65,'Kurzes giftiges Blubbern.',[e('bubble',length=.55,freq=180)])
add('feuer','kampf',.85,'Flammenstoß.',[e('fire',length=.7,freq=2200),e('thud',length=.2,freq=70,amp=.6)])
add('eis_salz','kampf',.8,'Salzkristalle knistern und splittern.',[e('grit',length=.5,freq=3600),e('glass',.1,.6,1250,.5)])
add('geist_angriff','kampf',1.3,'Wortloses Flüstern mit Hall.',[e('whisper',length=1,freq=1100),e('glass',.15,1,466,.35)],room=.4)
add('glocke_angriff','kampf',1.5,'Dröhnender Glockenschlag.',[e('gong',length=1.4,freq=147)],room=.35)
add('licht_angriff','kampf',.95,'Lichtstrahl schwillt an und bricht ab.',[e('tone',length=.8,freq=740,end=1480,reverse=True),e('breath',length=.7,freq=2400,amp=.2)])
add('gegner_tod','kampf',1,'Zusammensacken mit verhallendem Ton.',[e('cloth',length=.45,freq=900),e('thud',.3,.35,60),e('tone',.3,.6,170,.4,end=70)])
add('geist_tod','kampf',1.5,'Geist löst sich in Glas und Luft auf.',[e('glass',length=1.3,freq=660),e('tone',length=1.2,freq=400,amp=.35,end=1500),e('breath',.2,1.2,1800,.4)])
add('boss_auftritt','kampf',2.5,'Tiefer Boss-Drone und Glocke.',[e('drone',length=2.4,freq=49),e('gong',.3,2,98,.8)],room=.4)
add('sieg','kampf',2,'Warmer kurzer Siegabschluss.',[e('chord',length=1.8,freq=196),e('bell',.18,1.2,587,.3)])
add('niederlage','kampf',2.5,'Dunkles absteigendes Ende.',[e('tone',i*.3,1.4,f,.7,end=f*.94) for i,f in enumerate((196,175,147,98))],room=.35)
add('flucht','kampf',1.1,'Schnelle Schritte und Tür.',[e('wood',i*.15,.15,180+i*15) for i in range(4)]+[e('thud',.7,.3,75)])

add('geistsicht_an','okkult',1.4,'Gläserner Übergang in Geistsicht.',[e('breath',length=1,freq=1200,reverse=True),e('glass',.35,1,622,.7)],room=.4)
add('geistsicht_aus','okkult',1.3,'Rückkehr aus Geistsicht.',[e('glass',length=.9,freq=622,reverse=True),e('breath',.3,.9,900)],room=.3)
add('geistsicht_schleife','okkult',6,'Leises wortloses Schweben.',[e('choir',length=6,freq=146.833),e('drone',length=6,freq=73.5,amp=.3)],loop=True,volume=.16,room=.4)
add('ritual_kerze','okkult',.4,'Kleine Ritualkerze anzünden.',[e('hiss',length=.1,freq=3000),e('thud',.06,.17,150,.5),e('fire',.12,.2,1100,.3)])
add('ritual_start','okkult',1.8,'Ritualdrone und Glocken.',[e('drone',length=1.7,freq=73.4),e('bell',.3,1.2,440,.4),e('bell',.6,1,622,.3)],room=.4)
add('ritual_erfolg','okkult',1.6,'Ritual gelingt gläsern.',[e('glass',i*.18,1,f,.6) for i,f in enumerate((440,554,660))],room=.35)
add('ritual_fehlschlag','okkult',1.4,'Verzerrung und Riss, danach Stille.',[e('sting',length=.6,freq=110),e('crack',.5,.2,1800)],room=0)
add('artefakt_aufnehmen','okkult',1.4,'Wortloses Flüstern und kaltes Glas.',[e('whisper',length=1,freq=1400),e('glass',.25,1,1175,.3)],room=.35)
add('artefakt_unruhe','okkult',1.4,'Pochen und verstimmte Spieluhr.',[e('heart',length=.3,freq=55),e('bell',.2,.7,523,.4),e('bell',.5,.7,548,.4)])
add('trank_brauen','okkult',1.4,'Brodeln im Glas.',[e('bubble',length=1.2,freq=170),e('metal',.35,.6,1500,.3)])
add('trank_verdauen','okkult',2,'Herzschlag beruhigt sich zum Akkord.',[e('heart',length=.2,freq=80),e('heart',.3,.25,70),e('heart',.85,.3,60),e('chord',.8,1.1,147,.5)])
add('kontrolle_verlust','okkult',2,'Riss und anschwellendes wortloses Flüstern.',[e('crack',length=.2,freq=2400),e('whisper',.1,1.8,1200,reverse=True),e('drone',length=1.9,freq=46,amp=.35)],room=.3)
add('auktion_hammer','okkult',.8,'Auktionshammer mit Raumhall.',[e('wood',length=.25,freq=260),e('wood',.02,.2,130,.6)],room=.45)

# Ambient beds are periodic noise and wrapped events, not faded snippets.
add('atmo_regen','atmo',10,'Regen auf Stein und Dach.',[e('rain',length=10,freq=2800)]+[e('drop',i*.71,.18,700+(i%5)*110,.13) for i in range(14)],loop=True)
add('atmo_wind_nebel','atmo',12,'Langsamer Nebelwind.',[e('wind',length=12,freq=700)],loop=True)
add('atmo_kanal','atmo',10,'Wasser schwappt an Kanalmauern.',[e('water',length=10,freq=700)]+[e('bubble',t,.7,260,.25) for t in (1.2,4.5,8.3)],loop=True,room=.3)
add('atmo_moor','atmo',12,'Moor mit fernen Fröschen und Insekten.',[e('wind',length=12,freq=450,amp=.4),e('insects',length=12,freq=2800,amp=.18),e('bubble',2,.7,160,.35),e('croak',5.7,.3,140,.2),e('croak',6.2,.3,155,.17),e('bubble',10,.8,220,.3)],loop=True)
add('atmo_hafen','atmo',12,'Wellen, knarrendes Holz und Tau.',[e('water',length=12,freq=950),e('creak',2,1,170,.25),e('scrape',5,.8,450,.2),e('creak',9,1.3,220,.2)],loop=True)
add('atmo_taverne','atmo',10,'Wortloses gedämpftes Murmeln und Gläser.',[e('murmur',length=10,freq=160),e('metal',2.1,.5,1300,.08),e('wood',4.3,.2,270,.1),e('metal',7.2,.5,1100,.1)],loop=True,room=.3)
add('atmo_fabrik','atmo',10,'Dampf und ferne Hämmer.',[e('hiss',length=10,freq=1700,amp=.4),e('drone',length=10,freq=60,amp=.2)]+[e('metal',t,.6,160,.22) for t in (1,2.7,4.4,6.1,7.8,9.5)],loop=True,room=.35)
add('atmo_kirche','atmo',12,'Großer Kirchenraum mit Tropfen.',[e('wind',length=12,freq=250,amp=.25)]+[e('drop',t,1.4,f,.35) for t,f in ((1,440),(4.3,520),(7.9,390),(11.4,470))],loop=True,room=.65)
add('atmo_feuer','atmo',10,'Ofen im Torfkahn.',[e('fire',length=10,freq=1100)],loop=True)


def lowpass(x, hz):
    return sosfiltfilt(butter(2, min(hz, 18000), fs=SR, output='sos'), x)


def synth(layer, rng, pitch=1, periodic=False):
    n = round(layer['length']*SR)
    t = np.arange(n)/SR
    d = n/SR
    f = layer['freq']*pitch
    end = (layer['end'] or layer['freq'])*pitch
    k = layer['kind']
    # FFT-filtered periodic noise has no filter-state transient at the loop seam.
    noise = rng.standard_normal(n)
    bins = np.fft.rfftfreq(n, 1/SR)
    noise = np.fft.irfft(np.fft.rfft(noise)/(1+(bins/max(f,100))**4), n)
    noise /= max(np.std(noise), 1e-9)
    if periodic:
        f = round(f*d)/d
    phase = 2*np.pi*(f*t+(end-f)*t*t/(2*d)) if not periodic else 2*np.pi*f*t
    env = np.exp(-6*t/d)
    if k in ('wood','metal','bell','glass','gong','pluck','drop'):
        ratios = {'wood':(1,2.13,3.67),'metal':(1,1.48,2.09,2.71),
                  'bell':(1,2,2.76,4.07),'glass':(1,2.71,4.13),
                  'gong':(1,1.41,1.73,2.37,3.16),'pluck':(1,2,3,4), 'drop':(1,2.05)}[k]
        decay = 9 if k=='wood' else 5
        x = sum(np.sin(phase*r + (.7*np.sin(phase*1.4)*env if k in ('bell','glass') else 0))*np.exp(-t/d*decay*(1+i*.3))/(1+i)**1.6 for i,r in enumerate(ratios))
        if k=='wood': x += noise*.12*env
    elif k in ('thud','heart'):
        x = np.sin(2*np.pi*(f*t + f*.02*(1-np.exp(-t*70))))*env+noise*.1*env
        if k=='heart': x += np.roll(x,round(.09*SR))*.5
    elif k in ('tone','whistle','bird','creak','croak','sting'):
        vibrato = dict(tone=2,whistle=24,bird=8,creak=37,croak=31,sting=6)[k]
        mod = .6*np.sin(2*np.pi*vibrato*t)
        x = np.sin(phase+mod)+.22*np.sin(phase*2+mod)
        if k in ('creak','croak','sting'): x += .25*np.sin(phase*3)+noise*.13
        x *= np.maximum(0, np.sin(np.pi*np.arange(n)/max(n-1,1)))**(.5 if k=='sting' else 1.3)
        if k=='croak': x *= (.6+.4*np.sin(2*np.pi*32*t))
    elif k in ('chord','drone','choir'):
        ratios = (1,1.25,1.5) if k=='chord' else (1,1.005,1.5,2.005)
        x = np.zeros(n)
        for i,r in enumerate(ratios):
            hz = round(f*r*d)/d if periodic else f*r
            x += np.sin(2*np.pi*hz*t+i*.7)/(i+1)
        if k=='choir': x = lowpass(x + noise*.15,1200)
        if not periodic: x *= np.maximum(0, np.sin(np.pi*np.arange(n)/max(n-1,1)))**.7
    elif k=='bubble':
        x = np.zeros(n)
        for start in np.arange(.01,d,.095):
            u = np.maximum(t-start,0)
            x += (t>=start)*np.sin(2*np.pi*(f*u+f*.045*(1-np.exp(-u*40))))*np.exp(-u*45)*rng.uniform(.3,.8)
    elif k in ('paper','cloth','scrape','grit','crack'):
        rate = {'paper':31,'cloth':12,'scrape':47,'grit':80,'crack':140}[k]
        x = noise*(.3+.7*np.sin(2*np.pi*rate*t)**8)
        x *= np.maximum(0, np.sin(np.pi*np.arange(n)/max(n-1,1)))**.7
        if k=='crack': x *= env
    elif k in ('fire','rain'):
        x = noise*.35
        # Short noise crackles with independently seeded locations.
        for _ in range(max(3,round(d*(18 if k=='fire' else 35)))):
            start = rng.integers(n)
            count = min(round(SR*rng.uniform(.002,.025)),n-start)
            x[start:start+count] += rng.uniform(.2,1)*noise[start:start+count]*np.exp(-np.arange(count)/(count/5))
        if not periodic: x *= np.maximum(0, np.sin(np.pi*np.arange(n)/max(n-1,1)))**.5
    elif k=='insects':
        hz=round(f*d)/d
        x=np.sin(2*np.pi*hz*t)*(.5+.5*np.sin(2*np.pi*round(d*17)/d*t))**8
    elif k in ('whisper','murmur'):
        # Formant-shaped noise only: no speech samples or intelligible phonemes.
        x = lowpass(noise,1800)-lowpass(noise,300)
        x *= .4+.3*np.sin(2*np.pi*round(3*d)/d*t)+.2*np.sin(2*np.pi*round(5*d)/d*t)
        if k=='murmur': x=lowpass(x,650)
        if not periodic: x*=np.maximum(0, np.sin(np.pi*np.arange(n)/max(n-1,1)))**.6
    else:  # Air, water and steam, with distinct envelopes and modulation.
        x = noise
        if k in ('wind','water'): x *= .6+.3*np.sin(2*np.pi*3*t/d)+.1*np.sin(2*np.pi*7*t/d)
        elif k=='splash': x *= np.exp(-4*t/d)*(.6+.4*np.sin(2*np.pi*22*t)**2)
        elif k=='breath': x *= np.maximum(0, np.sin(np.pi*np.arange(n)/max(n-1,1)))**1.6
        elif not periodic: x *= np.maximum(0, np.sin(np.pi*np.arange(n)/max(n-1,1)))**.5
    if layer['reverse']: x=x[::-1].copy()
    if not periodic:
        fade=min(round(.003*SR),n//2)
        x[:fade]*=np.linspace(0,1,fade)
        x[-fade:]*=np.linspace(1,0,fade)
    return x*layer['amp']


def render(id, spec, variant):
    seed=int.from_bytes(hashlib.sha256(f'{id}:{variant}:nebelakten-y-v1'.encode()).digest()[:8],'little')
    rng=np.random.default_rng(seed)
    n=round(spec['duration']*SR)
    x=np.zeros(n)
    pitch=rng.uniform(.965,1.035) if spec['variants']>1 else 1
    for layer in spec['layers']:
        continuous=spec['loop'] and layer['length']==spec['duration']
        part=synth(layer,rng,pitch,continuous)
        start=round(layer['start']*SR)
        if spec['loop']:
            np.add.at(x,(np.arange(len(part))+start)%n,part)
        else:
            count=min(len(part),n-start)
            x[start:start+count]+=part[:count]
    dry=x.copy()
    # Warm multitap room; loop tails wrap instead of being cut off.
    for delay,gain in ((.043,.35),(.079,.27),(.131,.2),(.211,.14),(.337,.1),(.503,.06)):
        shift=round(delay*SR)
        if spec['loop']: x+=np.roll(dry,shift)*gain*spec['room']
        elif shift<n: x[shift:]+=dry[:-shift]*gain*spec['room']
    # Periodic lowpass also keeps loop boundary derivatives coherent.
    bins=np.fft.rfftfreq(n,1/SR)
    x=np.fft.irfft(np.fft.rfft(x)/(1+(bins/5500)**6),n)
    x-=x.mean()
    if spec['loop']:
        # Remove any tiny event-edge mismatch over 4 ms, without a silence gap.
        width=round(.004*SR)
        seam=(x[0]+x[-1])/2
        x[:width]+=(seam-x[0])*np.linspace(1,0,width)**2
        x[-width:]+=(seam-x[-1])*np.linspace(0,1,width)**2
    else:
        width=round(.004*SR)
        x[:width]*=np.linspace(0,1,width)
        x[-width:]*=np.linspace(1,0,width)
    target={'ui':.10,'schritte':.105,'welt':.10,'polizei':.13,'kampf':.13,'okkult':.095,'atmo':.065}[spec['group']]
    if id in ('ui_hover','ui_dialog_tick'): target=.05
    x*=min(target/max(np.sqrt(np.mean(x*x)),1e-9),.70/max(np.max(np.abs(x)),1e-9))
    return x


def encode(path,x):
    if not np.isfinite(x).all() or np.max(np.abs(x)) == 0:
        raise ValueError(f'Invalid synthesized PCM: {path.name}')
    with tempfile.TemporaryDirectory() as temp:
        wav=Path(temp)/'source.wav'
        with wave.open(str(wav),'wb') as w:
            w.setparams((1,2,SR,len(x),'NONE','not compressed'))
            w.writeframes(np.round(x*32767).astype('<i2').tobytes())
        for ext, options in [('ogg',['-c:a','libvorbis','-q:a','3']),('mp3',['-c:a','libmp3lame','-b:a','96k','-write_xing','1'])]:
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-map_metadata','-1',*options,str(path.with_suffix('.'+ext))],check=True)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('ids',nargs='*',choices=None,help='Optional base IDs; no arguments renders everything.')
    args=parser.parse_args()
    unknown=set(args.ids)-SOUNDS.keys()
    if unknown: parser.error('Unknown IDs: '+', '.join(sorted(unknown)))
    OUT.mkdir(parents=True,exist_ok=True)
    for id in args.ids or SOUNDS:
        spec=SOUNDS[id]
        for variant in range(1,spec['variants']+1):
            name=id if spec['variants']==1 else f'{id}_{variant}'
            encode(OUT/name,render(id,spec,variant))
        print(id,flush=True)
    manifest={'batch':'sfx','base':'audio/sfx/','formats':['ogg','mp3'],'sounds':{}}
    for id,spec in SOUNDS.items():
        entry={k:spec[k] for k in ('group','volume','duration','note')}
        if spec['variants']>1: entry['variants']=spec['variants']
        if spec['loop']: entry['loop']=True
        manifest['sounds'][id]=entry
    (OUT.parent/'manifest-sfx.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(f'{len(SOUNDS)} IDs, {sum(s["variants"] for s in SOUNDS.values())} renders, 2 formats')

if __name__=='__main__': main()
