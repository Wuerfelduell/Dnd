#!/usr/bin/env python3
"""CM: original seeded synthesis, using Y's oscillator/noise primitives only.
Requires numpy/scipy (requirements.txt) and ffmpeg. Never writes Y files.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from generate import synth, e, SR
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/audio/sfx'
SOUNDS={}

def add(id,group,duration,note,layers,variants=1,loop=False,volume=.45,pitches=None,echo=0):
    assert id not in SOUNDS
    SOUNDS[id]=dict(group=group,duration=duration,note=note,layers=layers,variants=variants,loop=loop,volume=volume,pitches=pitches,echo=echo)

def pulses(kind,times,length,freq,amp=1):
    return [e(kind,t,length,freq,amp) for t in times]

# 1: Dunscar. Tonal variants are deliberate intervals, not random pitch drift.
g='dunscar'
add('ds_zug_fern',g,3,'Tiefes fernes Rollen und ein Messingpfiff.',[e('wind',length=2.9,freq=150,amp=.7),e('whistle',.7,1.5,294,.3)])
add('ds_zug_einfahrt',g,3.95,'Bremsen, Rollen, Dampf; 3,95 s erfüllt die globale Grenze unter 4 s.',[e('wind',length=3.8,freq=200),e('creak',.4,2.2,650,.5,end=220),e('hiss',1.8,2.1,2800,.6)])
add('ds_zug_innen',g,4,'Gedämpftes Wagenrattern mit Holzknarren, nahtlos.',[e('wind',length=4,freq=170,amp=.2),e('creak',.6,.8,170,.18)]+pulses('wood',np.arange(0,4,.25),.12,115,.6),loop=True,volume=.2)
add('ds_ruf_senden',g,.85,'Drei klar unterscheidbare Messing-Signalpfiffe: D, Fis, A.',[e('whistle',.03,.65,294),e('hiss',.03,.65,1800,.08)],3,pitches=[1,1.259921,1.498307])
add('ds_nachhall',g,2.4,'Antwort des D-Pfiffs mit genau 1,5 s maximaler Echo-Verzögerung.',[e('whistle',.02,.7,294,.8),e('glass',.05,.75,588,.2)],echo=1.5,volume=.32)
add('ds_ruf_falsch',g,.85,'Verstimmte absinkende Rufantwort.',[e('whistle',.02,.65,294,.7,end=241),e('tone',.08,.65,306,.4,end=250)])
add('ds_horchstelle_an',g,1,'Drei gläserne Trichterpulse.',pulses('glass',[.02,.28,.57],.35,740,.7))
add('ds_drehscheibe',g,3,'Langsames Zahnrad und Holzknarren, nahtlos.',pulses('metal',np.arange(0,3,.375),.2,170,.5)+[e('creak',.7,1.3,95,.3)],loop=True,volume=.23)
add('ds_kalk_rieseln',g,.75,'Trockener feiner Kalkstaub rieselt.',[e('grit',.02,.65,4200,.6)],2,volume=.25)
add('ds_lohntuete',g,.8,'Papierumschlag und wenige Münzen.',[e('paper',.02,.38,2400),e('metal',.29,.35,1350,.35),e('metal',.43,.27,1700,.23)])
add('ds_schichtglocke',g,1.35,'Ein trockener eiserner Schichtglockenschlag.',[e('bell',.01,1.25,310),e('metal',.01,.2,175,.25)])
add('ds_schichtgaenger_fall',g,.95,'Stoff sinkt weich zusammen; kein Schlag und keine Stimme.',[e('cloth',.02,.85,380),e('breath',.3,.55,160,.45)],volume=.32)
add('ds_schallschleuse',g,.45,'Filztür schließt mit gedämpftem Luftpolster.',[e('breath',.01,.32,180),e('cloth',.07,.32,350,.5)])
add('ds_wachswalze',g,4,'Leises periodisches Walzenkratzen und Knistern.',[e('scrape',length=4,freq=1700,amp=.4),e('fire',length=4,freq=3500,amp=.16)],loop=True,volume=.13)
add('schritt_kalk',g,.28,'Knirschender trockener Kalktritt.',[e('thud',.01,.12,130,.7),e('grit',.02,.22,3700)],3,volume=.3)
add('atmo_hochebene',g,6,'Wind über offener Kalkhochebene, nahtlos.',[e('wind',length=6,freq=420),e('wind',length=6,freq=1800,amp=.13)],loop=True,volume=.18)

# 2: Sekten. Choir is additive oscillation, never a recorded human voice.
g='sekten'
add('sk_asche_kreis',g,1.4,'Asche knistert über einem tiefen Fundton.',[e('fire',.02,.9,2300,.55),e('tone',.12,1.1,82,.6)])
add('sk_asche_werbung',g,.9,'Zunder reibt, eine kleine Flamme fängt.',[e('grit',.02,.2,2800,.4),e('fire',.2,.65,1400)])
add('sk_flut_knoten',g,.85,'Nasses Seil spannt und knarrt.',[e('creak',.02,.7,125,.5),e('bubble',.12,.55,210,.4),e('cloth',.1,.65,600)])
add('sk_flut_taufe',g,1.5,'Untertauchen und Blubbern, ohne Schrei.',[e('splash',.02,.75,1400),e('bubble',.35,1,160,.8)])
add('sk_chor_summen',g,4,'Wortloser synthetischer Mehrklang in drei Tonlagen: C, Es, G.',[e('choir',length=4,freq=130.81),e('drone',length=4,freq=65.4,amp=.22)],3,True,.18,pitches=[1,1.189207,1.498307])
add('sk_kreidemund',g,.42,'Kurzer trockener Kreidestrich.',[e('scrape',.01,.33,3800),e('creak',.08,.14,2100,.18)])
add('sk_schrein_abbau',g,1.5,'Holz bricht; kleine Glocke fällt danach.',[e('crack',.01,.35,850),e('wood',.14,.3,140),e('bell',.45,.9,680,.55)])
add('sk_stufe_hoch',g,1.7,'Drei dumpfe Schläge, dahinter eine ferne Pfeife.',pulses('thud',[.02,.37,.72],.3,85)+[e('whistle',.8,.8,730,.25)])
add('sk_stufe_runter',g,1.2,'Absteigende weiche Spannungslösung.',[e('tone',.02,1.05,330,.8,end=165),e('breath',.15,.8,600,.3)])
add('sk_sabotage_brunnen',g,1.6,'Wasser kippt mit tiefem bitterem Gurgeln.',[e('water',.02,1.1,750,.5),e('bubble',.25,1.25,95)])
add('sk_laternen_aus',g,.8,'Gas zischt aus und fällt in Stille.',[e('hiss',.01,.55,2400),e('wood',.05,.1,400,.1)])
add('sk_ueberfall',g,1.35,'Y-Kampfstart-Motiv aus neuer Synthese: Rückwärtsglas, Schlag, synthetischer Chor-Stich.',[e('glass',.01,.7,590,.7,reverse=True),e('thud',.65,.5,65),e('choir',.62,.65,155,.5)])
add('sk_abgewoben',g,1.2,'Stoff zieht weg, entfernter Türschluss.',[e('cloth',.02,.65,800),e('wood',.7,.35,115,.3)])

# 3: Feste/Jahreszeiten. Murmur/laughter are noise and resonators, no phonemes.
g='feste'
add('fest_laterne_an',g,.65,'Papier raschelt, kleiner Docht zündet.',[e('paper',.01,.25,1900,.5),e('fire',.16,.43,1300)],2)
add('fest_kerzenboot',g,.95,'Kleines Holzboot wird auf Wasser gesetzt.',[e('wood',.01,.15,350,.2),e('splash',.2,.6,1000,.6),e('drop',.48,.3,600,.25)])
add('fest_menge',g,6,'Wortloses Festgemurmel aus moduliertem Bandrauschen, ohne Stimmen.',[e('murmur',length=6,freq=1100),e('cloth',length=6,freq=500,amp=.25)],loop=True,volume=.16)
add('fest_lachen',g,4,'Abstraktes fernes Lach-Rhythmusmotiv aus Luftstößen und Holzresonatoren, dazu Gläser; keine menschlichen Stimmen.',pulses('breath',[.15,.39,.68,2.2,2.45],.18,650,.45)+pulses('wood',[.16,.4,.69],.13,370,.12)+[e('glass',1.2,.5,1300,.18),e('glass',3.1,.55,1600,.15)],loop=True,volume=.16)
add('fest_drehorgel_start',g,2,'Kurzes original komponiertes Drehorgel-Anheben.',[e('tone',.04,.75,261.63,.6),e('tone',.42,.75,329.63,.5),e('tone',.8,1.05,392,.5),e('creak',.01,1.8,80,.1)])
add('fest_boxring_gong',g,1.6,'Ein trockener kleiner Boxringgong.',[e('gong',.01,1.5,240)])
add('fest_boxring_treffer',g,.35,'Gepolsterter Stofftreffer.',[e('thud',.01,.23,90,.7),e('cloth',.01,.27,400)],3)
add('fest_feuerwerk_start',g,1.25,'Gedämpft aufsteigendes Zischen.',[e('hiss',.01,1.1,2800,.65),e('tone',.01,1.1,340,.12,end=900)])
add('fest_feuerwerk_knall',g,1.15,'Weicher ferner Feuerwerksknall, ohne harte Spitze.',[e('thud',.02,.55,60),e('crack',.03,.85,1700,.5)],3,volume=.32)
add('fest_kahn_horn',g,1.5,'Tiefes Bojenhorn für die Prozession.',[e('tone',.02,1.3,146.83),e('tone',.04,1.25,220,.35)])
add('fest_salzkranz',g,.65,'Salzkranz knirscht fein und trocken.',[e('grit',.01,.55,3200),e('cloth',.1,.4,700,.25)])
add('saison_wechsel',g,2,'Windzug und einzelner saisonaler Glockenton.',[e('wind',.01,1.85,800,.55),e('bell',.6,1.25,660,.4)])
add('saison_regen',g,6,'Regen auf Pflaster, nahtlos.',[e('rain',length=6,freq=2800),e('water',length=6,freq=550,amp=.2)],loop=True,volume=.17)
add('saison_schnee',g,6,'Gedämpftes Schneetreiben mit feinen Körnern.',[e('wind',length=6,freq=650),e('grit',length=6,freq=2300,amp=.12)],loop=True,volume=.13)
add('saison_hitze',g,6,'Fliegen und leises Luftflimmern, nahtlos.',[e('insects',length=6,freq=180,amp=.45),e('wind',length=6,freq=240,amp=.35)],loop=True,volume=.1)
add('saison_laub',g,.65,'Blätter rascheln im Vorbeigehen.',[e('paper',.01,.55,2500),e('grit',.08,.45,1400,.35)],3,volume=.25)
add('schritt_schnee',g,.3,'Kompakter knirschender Schneetritt.',[e('thud',.01,.13,80,.6),e('grit',.02,.24,1900)],3,volume=.3)
add('schritt_laub',g,.32,'Tritt in trockenes Laub.',[e('thud',.01,.12,120,.45),e('paper',.01,.28,3200),e('crack',.06,.16,2300,.3)],3,volume=.3)

# 4: Okkultes. Eight Starling stars have fixed, ordered distinct pitches.
g='okkult2'
add('fasserin_werkbank',g,3,'Kleine Hämmer und Feile im ruhigen Arbeitsrhythmus.',pulses('metal',[.05,.55,1.1],.22,750,.4)+[e('scrape',1.55,1.2,1800,.5)],loop=True,volume=.2)
add('fasserin_fassung',g,1.2,'Fassung klickt zu und glänzt gläsern.',[e('metal',.01,.25,800,.6),e('glass',.2,.9,1046.5,.7)])
add('kontrolle_tentakel',g,2,'Tiefes nasses Dehnen beim Wachstum.',[e('creak',.01,1.8,85,.6,end=130),e('bubble',.02,1.8,110,.8)])
add('kontrolle_zurueck',g,1.6,'Nasses Dehnen zieht rückwärts zusammen.',[e('creak',.01,1.4,85,.6,end=130,reverse=True),e('bubble',.01,1.4,110,.8,reverse=True)])
add('kontrolle_laeutersalz',g,1.2,'Läutersalz zischt und löst sich gläsern.',[e('hiss',.01,.7,2800,.7),e('glass',.35,.75,740,.45)])
add('korruption_tick',g,.65,'Ein Herzschlag mit kleinem gläsernem Splitter.',[e('heart',.01,.4,62),e('glass',.18,.38,880,.25)],volume=.3)
add('starling_verwandlung',g,3,'Glas zieht nach innen; synthetischer Sternenchor steigt auf.',[e('glass',.01,1.1,780,.6,reverse=True),e('crack',.55,.8,3500,.5,reverse=True),e('choir',1,1.85,196,.7),e('gong',1.1,1.7,98,.4)])
add('starling_stern',g,.9,'Acht Fall-Sterne, aufsteigend D4 E4 Fis4 G4 A4 H4 Cis5 D5.',[e('glass',.01,.8,293.66)],8,pitches=[2**(s/12) for s in [0,2,4,5,7,9,11,12]])
add('starling_ende',g,2.4,'Synthetischer Atem-Luftstrom und sich setzende Glasstücke; nicht tödlich.',[e('breath',.01,1.7,550,.6),e('glass',.9,.8,500,.3),e('glass',1.35,.8,350,.2)])
add('geheimtreffen_glocke',g,1.1,'Ein leiser dunkler Glockenschlag eröffnet das Treffen.',[e('bell',.01,1,392)],volume=.3)
add('auktion_hammer',g,.3,'Trockener Holzhammer auf Holzplatte.',[e('wood',.01,.23,180),e('thud',.01,.14,100,.4)],2)
add('auktion_gebot',g,.6,'Papier und hölzerner Räusper-Ersatz; keine Stimme.',[e('paper',.01,.4,2100),e('wood',.24,.13,230,.25),e('wood',.36,.1,190,.2)])

# 5: Sozial/Koop/Ausrüstung.
g='sozial'
add('beziehung_hoch',g,.9,'Warmer kurzer Durakkord.',[e('chord',.01,.8,261.63)])
add('beziehung_runter',g,.85,'Kühler abfallender Zweiklang.',[e('tone',.01,.7,392,.7,end=293.66),e('tone',.06,.7,415.3,.35,end=311.13)])
add('geschenk_geben',g,.7,'Geschenkpapier und gezogene Stoffschleife.',[e('paper',.01,.4,1800),e('cloth',.27,.35,900,.6)])
add('geschenk_falsch',g,.45,'Höfliches Räuspern ausschließlich als trockener Holz-Doppelton.',[e('wood',.01,.14,260),e('wood',.2,.15,220,.65)])
add('koop_anspruch',g,.25,'Kleiner Beutestempel.',[e('wood',.01,.18,330),e('paper',.01,.2,1200,.2)])
add('koop_anspruch_streit',g,.5,'Schräger Doppelstempel zweier Ansprüche.',[e('wood',.01,.2,330),e('wood',.17,.24,349.23)])
add('koop_beitritt',g,1,'Zwei Glas-Töne finden im Unisono zusammen.',[e('tone',.01,.8,330,.5,end=392),e('tone',.13,.8,440,.5,end=392)])
add('koop_rufen_zu_zweit',g,1.4,'Zwei Messing-Signalpfiffe mit deutlichem zeitlichem Abstand.',[e('whistle',.01,.5,294),e('whistle',.72,.5,440,.8)])
add('ausruestung_hut',g,.35,'Filzhut mit weichem Stoffzug.',[e('cloth',.01,.27,650)])
add('ausruestung_mantel',g,.7,'Mantelstoff und zwei Knöpfe.',[e('cloth',.01,.6,850),e('wood',.35,.08,510,.25),e('wood',.5,.08,600,.2)])
add('ausruestung_waffe',g,.65,'Holzgriff und Metall werden aus dem Gürtel gezogen.',[e('cloth',.01,.3,550,.5),e('scrape',.12,.35,1800,.35),e('metal',.3,.3,700,.5)])
add('ausruestung_amulett',g,.4,'Feine Kette mit kleinem Verschlussklick.',[e('metal',.01,.25,1700,.6),e('wood',.22,.1,900,.4)])
add('tragkraft_voll',g,.65,'Überfüllte Tasche ächzt aus Leder und Holzresonanz.',[e('creak',.01,.55,130),e('cloth',.01,.5,400,.5)])
add('notizbuch_wegweiser',g,.7,'Bleistift und aufgefaltetes Kartenpapier.',[e('paper',.01,.4,1700,.5),e('scrape',.3,.3,2600,.8)])
add('scroll_tick',g,.06,'Sehr leise Einzelraste des Scrollbalkens.',[e('wood',.004,.045,650)],volume=.07)

# 6: Calderwick.
g='calderwick'
add('cw_presse',g,3,'Walzen, Papier und Druckplatten im mechanischen Dreiertakt.',[e('drone',length=3,freq=55,amp=.15)]+pulses('thud',[.05,1.05,2.05],.3,95,.6)+pulses('paper',[.3,1.3,2.3],.5,1500,.35)+pulses('metal',[.75,1.75,2.75],.23,370,.25),loop=True,volume=.22)
add('cw_rohrpost_senden',g,1,'Klappe klickt, Kapsel zischt davon.',[e('metal',.01,.15,700,.4),e('hiss',.12,.75,2600),e('tone',.15,.65,270,.12,end=110)])
add('cw_rohrpost_ankunft',g,.8,'Kapsel plumpst ins Fach, Klappe schlägt nach.',[e('hiss',.01,.25,2200,.3),e('thud',.22,.25,120),e('metal',.47,.25,560,.5)])
add('cw_schraegaufzug',g,4,'Standseilbahn mit tiefer Seilspannung und Rollen.',[e('drone',length=4,freq=70,amp=.25),e('creak',.2,1.6,170,.3),e('creak',2.2,1.6,190,.3)]+pulses('metal',np.arange(0,4,.5),.25,260,.2),loop=True,volume=.2)
add('cw_aufzug_halt',g,.85,'Kabine setzt sich, schwere Sperrklinke rastet ein.',[e('creak',.01,.4,130,.4,end=80),e('thud',.3,.3,70),e('metal',.4,.35,280,.5)])
add('cw_stempel',g,.25,'Trockener schwerer Amtsstempel.',[e('wood',.01,.19,220),e('paper',.01,.18,1800,.3)],3)
add('cw_letter_fall',g,.55,'Eine Bleiletter fällt und kippt kurz nach.',[e('metal',.01,.3,950,.8),e('wood',.17,.15,430,.3),e('metal',.3,.2,1250,.25)],3,volume=.3)
add('cw_abgleich_start',g,1.8,'Rückwärts reißendes Papier über tiefem Abgleichton.',[e('paper',.01,1.1,2700,.7,reverse=True),e('tone',.6,1.1,73,.65)])
add('cw_abgleich_rueckweg',g,1.6,'Verblassender Straßen-Rauschzug.',[e('wind',.01,1.4,750,.6,reverse=True),e('glass',.15,1.1,460,.2,reverse=True)])
add('cw_anker_setzen',g,.8,'Nadel sitzt, Bürgenfaden spannt sich.',[e('metal',.01,.18,1500,.3),e('pluck',.2,.5,330,.7),e('cloth',.1,.4,900,.3)])
add('cw_anker_verbunden',g,1.3,'Drei Fäden halten: drei helle, originale aufsteigende Töne.',[e('glass',.01,.65,523.25),e('glass',.28,.65,659.25,.8),e('glass',.56,.65,784,.7)])
add('cw_tuerschild_leer',g,.85,'Metallisches Schild klingt kurz und verschwindet in Stille.',[e('metal',.01,.4,610),e('breath',.1,.35,500,.2)])
add('atmo_rohrpost',g,6,'Periodisches leises Zischen in den Wänden.',[e('wind',length=6,freq=1300,amp=.5),e('hiss',.7,1.2,2500,.3),e('hiss',3.5,1.7,1900,.35)],loop=True,volume=.15)
add('schritt_terrasse',g,.38,'Trockener Kalkpflastertritt mit kurzem Rückwurf.',[e('thud',.01,.13,145),e('grit',.01,.2,3000,.6),e('thud',.1,.13,145,.2)],3,volume=.3)

# 7: Briarholt.
g='briarholt'
add('bh_ventil_drehen',g,2,'Ventilrad dreht mit rostigen Rasten.',[e('creak',.05,.8,320,.3),e('creak',1.05,.8,300,.3)]+pulses('metal',np.arange(0,2,.25),.12,450,.4),loop=True,volume=.25)
add('bh_ventil_rast',g,.55,'Drei feste Zustände: 1 zu (tief), 2 kalt (mittel), 3 warm (hoch).',[e('metal',.01,.25,260,.7),e('glass',.08,.4,520,.35)],3,pitches=[1,1.33484,1.681793])
add('bh_dampf_austritt',g,1.1,'Kurzer trockener Dampfaustritt.',[e('hiss',.01,.95,3200),e('wind',.01,.9,350,.3)],2,volume=.35)
add('bh_dampf_entladung',g,3,'Große kontrollierte Dampfentladung.',[e('hiss',.01,2.8,3500),e('wind',.01,2.8,220,.55),e('metal',.02,.5,120,.2)],volume=.4)
add('bh_kondensat',g,4,'Einzelne Kondensattropfen auf Glas.',[e('drop',t,.25,f,.6) for t,f in [(.15,900),(.73,1250),(1.61,1050),(2.84,1500),(3.5,1100)]],loop=True,volume=.15)
add('bh_scheibe_beschlag',g,.85,'Finger fährt langsam über feuchtes Glas.',[e('scrape',.01,.7,1100),e('creak',.2,.45,1500,.12)])
add('bh_reif',g,1.2,'Feines Knistern und sich bildender Frost.',[e('fire',.01,1.05,4400,.55),e('glass',.15,.9,1568,.18)])
add('bh_pflanze_oeffnet',g,1.4,'Nasses Entfalten einer Blüte, gläserner türkis gedachter Kern.',[e('cloth',.01,.9,700,.6),e('bubble',.1,.7,240,.4),e('glass',.5,.8,880,.45)])
add('bh_pflanze_spricht',g,3,'Wortloser Pflanzen-Luftstrom aus Bandrauschen; keine Stimme.',[e('whisper',length=3,freq=1200,amp=.7),e('wind',length=3,freq=500,amp=.3)],loop=True,volume=.13)
add('bh_kapsel',g,.4,'Pflanzenkapsel klickt in einen Halter.',[e('wood',.01,.14,480),e('metal',.11,.23,900,.4)])
add('bh_ruecklauf',g,1.8,'Tiefer belasteter Rücklauf, violett gedachtes Gurgeln.',[e('bubble',.01,1.65,85),e('water',.01,1.65,430,.5),e('tone',.15,1.3,116,.12)])
add('bh_sperrklappe',g,.9,'Schwerer Riegel und eiserne Sperrklappe.',[e('metal',.01,.3,320,.6),e('thud',.27,.4,58),e('metal',.3,.5,150,.4)])
add('bh_kurglocke',g,1.6,'Zwei helle trockene Kurglockenschläge.',[e('bell',.01,.85,880),e('bell',.65,.85,880,.8)])
add('bh_postkarte',g,.9,'Feder schreibt über Karton.',[e('scrape',.01,.3,2300),e('scrape',.36,.4,1900,.7),e('paper',.2,.6,1100,.2)])
add('atmo_glashaus',g,6,'Glasdach-Tropfen und ferne Pumpe.',[e('drone',length=6,freq=48,amp=.25)]+[e('drop',t,.35,f,.4) for t,f in [(.2,720),(1.1,1100),(2.8,940),(4.2,1350),(5.45,800)]],loop=True,volume=.16)
add('atmo_frost',g,6,'Kalter tiefer Wind im Talkessel.',[e('wind',length=6,freq=300),e('wind',length=6,freq=1800,amp=.2),e('tone',length=6,freq=110,amp=.04)],loop=True,volume=.15)
add('schritt_glas',g,.35,'Schuh auf Metallgitter im Glashaus, kein zerbrechendes Glas.',[e('thud',.01,.14,120,.65),e('metal',.01,.27,530,.6)],3,volume=.3)

# 8: Landstraße. Horse-like snort is filtered air, not an animal recording.
g='reise2'
add('ls_kutsche_halt',g,1.8,'Räder stoppen; synthetisches Luft-Schnauben ohne Aufnahme.',[e('creak',.01,.9,230,.5,end=80),e('grit',.01,.8,850,.5),e('breath',.8,.7,700,.7)])
add('ls_zoll_schranke',g,.95,'Holzschranke hebt sich mit Klinke.',[e('metal',.01,.2,460,.3),e('creak',.15,.65,200),e('wood',.72,.18,180,.5)])
add('ls_grenzstein',g,1.1,'Stein summt leise okkult.',[e('drone',.01,.95,98,.6),e('glass',.1,.8,392,.2)],volume=.2)
add('ls_peitsche',g,.35,'Kurze trockene Kutschpeitsche.',[e('breath',.01,.15,2400,.5),e('crack',.15,.14,4400,.7)],volume=.32)
add('ls_schlafkutsche',g,4,'Spieluhrartige Radresonanzen zwischen Holzknarren.',[e('creak',.2,1.2,120,.25),e('creak',2.2,1.2,135,.25)]+[e('pluck',t,.65,f,.35) for t,f in [(0,392),(1,493.88),(2,440),(3,329.63)]],loop=True,volume=.18)
add('ls_landvermesser_tick',g,.3,'Messkette und kleiner Metallanschlag.',[e('metal',.01,.22,1150),e('wood',.09,.13,500,.3)],3,volume=.25)

# 9: UI-Ergänzungen.
g='ui2'
add('ui_kapitel',g,2,'Papier entrollt sich, ferne Glocke.',[e('paper',.01,.85,1700,.8),e('bell',.6,1.25,440,.35)])
add('ui_epilog',g,1.8,'Feder setzt an; kurzer warmer gläserner Nachklang.',[e('scrape',.01,.55,2100,.7),e('glass',.4,1.15,523.25,.3)],echo=.4)
add('ui_ende_hell',g,2.2,'Originaler warmer Dreiklang mit heller Glocke.',[e('chord',.01,2,261.63,.65),e('bell',.2,1.5,523.25,.4)])
add('ui_ende_dunkel',g,1.5,'Ein tiefer Schlag verklingt in Stille.',[e('thud',.01,.6,49),e('gong',.01,.9,73,.25)])
add('ui_bestiarium_neu',g,.8,'Federstrich und abstraktes tierisches Rascheln.',[e('scrape',.01,.35,2300,.6),e('grit',.3,.4,950,.45)])
add('ui_personen_karte',g,.95,'Kartenpapier und drei Nadeln.',[e('paper',.01,.5,1600,.6)]+pulses('metal',[.3,.5,.7],.18,1300,.25))
add('ui_zeitung',g,.7,'Zeitung wird breit aufgeschlagen.',[e('paper',.01,.3,2100),e('paper',.22,.4,2800,.7)])
add('ui_fest_banner',g,1.3,'Kurzer eigener Drehorgeltusch.',[e('tone',.01,.55,392,.6),e('tone',.24,.55,493.88,.5),e('chord',.55,.65,261.63,.5)])
add('ui_saison_banner',g,1.25,'Leichter Windzug mit Glöckchen.',[e('wind',.01,1.1,1200,.5),e('bell',.35,.8,1046.5,.4)])


def render(id,spec,variant):
    seed=int.from_bytes(hashlib.sha256(f'CM-v1:{id}:{variant}'.encode()).digest()[:8],'little')
    rng=np.random.default_rng(seed)
    n=round(spec['duration']*SR); x=np.zeros(n)
    pitch=spec['pitches'][variant-1] if spec['pitches'] else (rng.uniform(.94,1.06) if spec['variants']>1 else 1)
    for layer in spec['layers']:
        part=synth(layer,rng,pitch,spec['loop'] and layer['length']==spec['duration'])
        start=round(layer['start']*SR)
        if spec['loop']: np.add.at(x,(np.arange(len(part))+start)%n,part)
        else:
            count=min(len(part),n-start)
            x[start:start+count]+=part[:count]
    if spec['echo']:
        dry=x.copy()
        for delay in np.arange(.15,spec['echo']+.001,.15):
            shift=round(delay*SR)
            if shift<n: x[shift:]+=dry[:-shift]*(.48**(delay/.3))
    # Periodic spectral lowpass avoids filter-state jumps. No artificial reverb by default.
    bins=np.fft.rfftfreq(n,1/SR)
    x=np.fft.irfft(np.fft.rfft(x)/(1+(bins/6500)**8),n)
    x-=x.mean()
    width=round(.008*SR)
    if spec['loop']:
        seam=(x[0]+x[-1])/2
        x[:width]+=(seam-x[0])*np.linspace(1,0,width)**2
        x[-width:]+=(seam-x[-1])*np.linspace(0,1,width)**2
    else:
        x[:width]*=np.linspace(0,1,width)
        x[-width:]*=np.linspace(1,0,width)
    assert np.isfinite(x).all() and np.max(np.abs(x))>0
    return x*(10**(-3.1/20)/np.max(np.abs(x)))


def decode(path):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-acodec','pcm_f32le','-ac','1','-ar',str(SR),'-']),dtype='<f4')


def encode(name,x,ext):
    path=OUT/f'{name}.{ext}'
    options=['-c:a','libvorbis','-q:a','4'] if ext=='ogg' else ['-c:a','libmp3lame','-b:a','96k','-write_xing','1']
    # Measure AFTER lossy encoding; converge below -3 dBFS with 0.6 dB codec tolerance.
    gain=1.
    for attempt in range(40):
        subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','pipe:0','-map_metadata','-1',*options,str(path)],input=(x*gain).astype('<f4').tobytes(),check=True)
        pcm=decode(path); peak=float(np.max(np.abs(pcm))); db=20*np.log10(peak)
        if -3.6<=db<=-3.0: break
        gain*=(10**(-3.3/20)/peak)**.35
    assert -3.6<=db<=-3.0,(name,ext,db)
    return dict(file=path.name,bytes=path.stat().st_size,peakDbFS=round(float(db),4),rmsDbFS=round(float(20*np.log10(np.sqrt(np.mean(pcm*pcm)))),4),decodedSamples=len(pcm),sha256=hashlib.sha256(path.read_bytes()).hexdigest())


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('ids',nargs='*');args=parser.parse_args()
    assert not set(args.ids)-SOUNDS.keys(), 'Unknown IDs'
    old=json.loads((OUT.parent/'manifest-sfx.json').read_text())['sounds']
    assert SOUNDS.keys() & old.keys() == {'auktion_hammer'}, 'Unexpected Y ID collision'
    # CM adds _1/_2 variants; Y's unnumbered hammer and its manifest remain untouched.
    old_files={f"{id}_{v}" if s.get('variants',1)>1 else id for id,s in old.items() for v in range(1,s.get('variants',1)+1)}
    new_files={f"{id}_{v}" if s['variants']>1 else id for id,s in SOUNDS.items() for v in range(1,s['variants']+1)}
    assert not old_files & new_files, 'Would overwrite a Y file'
    OUT.mkdir(parents=True,exist_ok=True)
    jobs=[(id,spec,v) for id,spec in SOUNDS.items() if not args.ids or id in args.ids for v in range(1,spec['variants']+1)]
    def job(task):
        id,spec,v=task;name=id if spec['variants']==1 else f'{id}_{v}'
        x=render(id,spec,v)
        return [encode(name,x,ext) for ext in ['ogg','mp3']]
    with ThreadPoolExecutor(max_workers=4) as pool:
        reports=[r for batch in pool.map(job,jobs) for r in batch]
    manifest=dict(batch='sfx2',base='audio/sfx/',formats=['ogg','mp3'],sounds={})
    for id,s in SOUNDS.items():
        entry={k:s[k] for k in ['group','volume','duration','note']}
        if s['variants']>1:entry['variants']=s['variants']
        if s['loop']:entry['loop']=True
        manifest['sounds'][id]=entry
    (OUT.parent/'manifest-sfx2.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    if not args.ids:
        (ROOT/'tools/audio/sfx/validation-sfx2.json').write_text(json.dumps(dict(generator='CM-v1; original oscillators and filtered noise; no samples',files=reports,totalBytes=sum(r['bytes'] for r in reports)),indent=2)+'\n')
    print(f'{len(SOUNDS)} IDs; {len(jobs)} renders; {len(reports)} files; {sum(r["bytes"] for r in reports)} bytes')

if __name__=='__main__':main()
