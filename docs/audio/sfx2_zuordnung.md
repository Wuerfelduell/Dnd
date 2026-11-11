# CM – Soundeffekte: Zuordnung und Einbauvertrag

120 Basis-IDs, 159 Klangvarianten, jeweils OGG Vorbis Qualität 4 und MP3 96 kbit/s. Alle Klänge sind eigene Synthesen aus Oszillatoren und gefiltertem Rauschen. Keine Sprach-, Tier- oder sonstigen Fremdaufnahmen. „Lachen“, „Räuspern“, „Chor“, „Atem“ und „Flüstern“ sind ausdrücklich abstrakte Rhythmus-/Luft-/Resonanzmotive ohne Phoneme. Das Paket enthält keinen Laufzeit-Einbau.

## Quellen und Status

`src/core/sounds.js` kennt derzeit nur die Ereignisse `clue`, `conclusion`, `quest`, `money`, `item`, `ascend`, `ritual`, `artifact`, `digested`, `lostcontrol`, `vision`, `wanted`. Für neue Effekte darf nicht so getan werden, als existierten bereits entsprechende Fälle. Die unten mit **E** markierten Hooks gehören zu dieser Liste; **N** sind bereits emittierte Ereignisse anderer Core-Module, die `SOUND_EVENTS` noch nicht abonniert; **D** sind direkte UI-/Interaktionsaufrufe ohne eigenes Sound-Ereignis; **A** sind Karten-/Bereichsschleifen für `ambienceFor` oder einen separaten räumlichen Loop; **P** sind geplante Hooks für noch nicht eingebaute Kapitel/Festaktionen. Namen in Beschreibungen sind fachliche Auslöser, keine behaupteten Bus-Ereignisnamen.

Vorhandene Karten stammen aus `src/data/maps/*.json`, `src/data/wexmoor.json` und `src/data/packs/k3_orte/maps.json`. Sekten: `src/data/packs/sekten/daten.json`; Feste und Jahreszeiten: `src/core/Clock.js`, `src/data/packs/feste/zeitung.json`. `cw_*`, `bh_*` und `reise_landstrasse` existieren zum Stand dieses Pakets **noch nicht in `src/data`**: die entsprechenden Kartenangaben sind verbindliche Plan-IDs aus `docs/art/codex_CD_k4_orte.md` beziehungsweise `codex_CH_k5_orte.md`, nicht produktive Karten. Sie bleiben P-Zuordnungen, bis die Kartenpakete eingebaut sind. Keine Ersatzkarte erfinden.

Vorhandene neue Bus-Ereignisse: `signal_route`/`signal_binding` aus `SignalRoutes.js`, `sekten` aus `Sekten.js`, `season` aus `Clock.js`, `relation` aus `Relations.js`, `corrupted`/`cleansed` aus `Corruption.js`, `claim` aus `Claims.js`, `party` aus `Party.js`, `gathering` aus `Gatherings.js`, `newspaper` aus `Newspapers.js`. Bei generischem `changed` keine Effekte auslösen; erfolgreich bestätigte Interaktion verwenden.

## Dateinamen, Mischung und Konflikte

Manifestformat wie Y: `sounds[id]` mit `group`, `volume`, `duration`, `note`, gegebenenfalls `variants` und `loop`. Eine Variante: `<id>.ogg/.mp3`; mehrere Varianten: ausschließlich `<id>_1` bis `<id>_N`, entsprechend `Audio.js`. `duration` enthält den kompletten Ausklang. `ds_zug_einfahrt` ist 3,95 s lang: das erfüllt die globale Vorgabe „unter 4 s“, trotz der gerundeten 4-s-Angabe in der Motivtabelle.

Einziger ID-Konflikt mit Y: **`auktion_hammer`**. Y behält seine unnummerierte Datei und den bisherigen Manifest-Eintrag unverändert. CM liefert neue `_1`/`_2`-Dateien. Beim späteren Zusammenführen der Manifeste für diese ID ausdrücklich den CM-Eintrag mit `variants: 2` auswählen; kein doppeltes Abspielen und keine stille zufällige Überschreibung der Metadaten.

Alle Dateien haben nach verlustbehaftetem Encoding gemessene Spitzen zwischen −3,6 und −3,0 dBFS. Die unterschiedliche wahrgenommene Lautstärke regeln die Manifestwerte; insbesondere `scroll_tick` nur 0,07 und Ambiente 0,10–0,23. Maximaler zusätzlicher Echoabstand 1,5 s bei `ds_nachhall`, 0,4 s bei `ui_epilog`, sonst kein künstlicher Raumhall. Kurze Resonanz-Ausklänge sind Teil der Motive.

Schleifen bei Eintritt starten, bei Verlassen oder Ende der Aktion stoppen; nie durch jedes `changed` neu starten. Saison/Festschleifen ersetzen oder mischen die Kartenatmo mit geringer Lautstärke; nur eine Wetterlage gleichzeitig. Der spätere Einbau braucht für fest zugeordnete Varianten einen **deterministischen Variantenaufruf**: `Audio.js` wählt derzeit zufällig. Das betrifft insbesondere `starling_stern_1…8`, `bh_ventil_rast_1…3`, Ruf-Tonlagen und Chor-Tonlagen. Die Bus-Ereignisse allein ersetzen diese Auswahl nicht.

## 1. Dunscar

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `ds_zug_fern` | D: fernes Zugereignis, sparsam | `ds_signalhang`, `ds_letzter_bahnsteig`; einmal |
| `ds_zug_einfahrt` | D: bestätigte Nachtzug-Ankunft | `ds_endbahnhof`; einmal |
| `ds_zug_innen` | A: Wagenfahrt aktiv | `ds_nachtzug_wagen`; Loop während Fahrt |
| `ds_ruf_senden` | N: `signal_route` mit `ok`; Tonlage anhand Rufmuster fest wählen | `ds_signalhang`, `ds_rufschlucht`; einmal |
| `ds_nachhall` | N: erfolgreiche Antwort nach `signal_route`, getrennt vom Senden | `ds_rufschlucht`; einmal, D-Grundpfiff |
| `ds_ruf_falsch` | N: `signal_route.kind` gleich `alarm` oder `fallback` | jeweilige Rufstation; einmal |
| `ds_horchstelle_an` | D: `listen(stationId)` liefert `ok` | `ds_signalhang`, `ds_rufschlucht`; einmal |
| `ds_drehscheibe` | A/D: Drehscheibenbewegung tatsächlich aktiv | `ds_runddepot`; bewegungsgebundener Loop |
| `ds_kalk_rieseln` | D: Kalkspur oder bröckelnde Wand untersuchen | `ds_klopfbruch`, `ds_bruchstufen`; zufällige Variante |
| `ds_lohntuete` | E: `money`, positiver Betrag nur bei bestätigter Lohntüten-Interaktion; nicht jeder Geldgewinn | `ds_lohnbuero`; einmal |
| `ds_schichtglocke` | D: Beginn einer lokalen Arbeitsschicht | `ds_arbeiterbogen`; einmal |
| `ds_schichtgaenger_fall` | D: nicht tödliche Niederlage eines Schichtgängers | `ds_rangierwueste`; einmal |
| `ds_schallschleuse` | D: Passage der Filztür | `ds_speisewagen`; einmal |
| `ds_wachswalze` | A/D: Walze am Phonograph läuft | `ds_speisewagen`; Loop bis Stopp/Verlassen |
| `schritt_kalk` | D: Erweiterung von `footstepSound`, nur kalkiger trockener Boden | `ds_kalkmarkt`, `ds_bruchstufen`, `ds_klopfbruch`; 3 Varianten |
| `atmo_hochebene` | A: `ambienceFor` für offene Kalkflächen | `ds_signalhang`, `ds_bruchstufen`, `ds_rangierwueste`; Loop |

## 2. Sekten

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `sk_asche_kreis` | N: `sekten.kind=start`, Aschenbund-Kreis sichtbar entdeckt | tatsächliches `data.map` des Sektenereignisses; einmal |
| `sk_asche_werbung` | D: sichtbare Aschenbund-Anwerbung/Zunderaktion | aktive Sektenkarte; einmal |
| `sk_flut_knoten` | D: Flutkinder-Knotenseil untersuchen oder lösen | aktive Sektenkarte; einmal |
| `sk_flut_taufe` | D: sichtbare Flutkinder-Untertauchaktion | aktive Sektenkarte mit Wasser; einmal |
| `sk_chor_summen` | A: aktiver Schrein/Umtrieb des Stummen Chors | tatsächliche Sektenkarte; 3 Tonlagen, Loop lokal begrenzen |
| `sk_kreidemund` | D: Kreidemund-Zeichen erscheint | aktive Sektenkarte; einmal |
| `sk_schrein_abbau` | N: `sekten.kind=ende` nur nach bestätigtem Schreinabbau | `data.map`; einmal |
| `sk_stufe_hoch` | N: `sekten.kind=stufe` und `stufe>prev` | global; einmal pro Stufenänderung |
| `sk_stufe_runter` | N: `sekten.kind=stufe` und `stufe<prev` | global; einmal pro Stufenänderung |
| `sk_sabotage_brunnen` | D: sichtbare Brunnen-Sabotage der Flutkinder | Ereigniskarte; einmal |
| `sk_laternen_aus` | D: Sektenaktion löscht sichtbare Gaslaternen | Ereigniskarte; einmal |
| `sk_ueberfall` | D: Sektenkampf beginnt; ersetzt Y-`kampf_start` für diesen Kampf | Ereigniskarte; einmal |
| `sk_abgewoben` | D: Abwerbung/Abgang einer Figur sichtbar abgeschlossen | Ereigniskarte; einmal |

## 3. Feste und Jahreszeiten

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `fest_laterne_an` | P: Papierlaterne der Laternennacht entzündet | `altmarkt`, `docks`; 2 Varianten |
| `fest_kerzenboot` | P: Kerzenboot ins Wasser setzen | `docks`; einmal |
| `fest_menge` | A: `festAktiv(city)` aktiv und belebter Festplatz | `altmarkt`, `wx_bojenhafen`, `ds_kalkmarkt`; Loop |
| `fest_lachen` | A: lokaler geselliger Festbereich; synthetische Lach-Anmutung | `tavern`, `wx_glocke`, `ds_teesaal`; Loop |
| `fest_drehorgel_start` | P: Drehorgel startet bei Festinteraktion | `altmarkt`; einmal |
| `fest_boxring_gong` | P: Boxring-Runde beginnt/endet | `ds_kalkmarkt`; einmal |
| `fest_boxring_treffer` | P: bestätigter Treffer im Fest-Boxring | `ds_kalkmarkt`; 3 Varianten |
| `fest_feuerwerk_start` | P: sichtbare Rakete startet | `altmarkt`, `ds_runddepot`; einmal |
| `fest_feuerwerk_knall` | P: zugehörige Rakete explodiert | Festkarte; 3 Varianten |
| `fest_kahn_horn` | P: Salzsegen-Prozession beginnt | `wx_bojenhafen`; einmal |
| `fest_salzkranz` | P: Salzkranz wird gereicht/abgelegt | `wx_bojenhafen`; einmal |
| `saison_wechsel` | N: `season`; nur wenn Jahreszeit gegenüber letzter Anzeige wirklich geändert | global; einmal, nicht zusätzlich bei bloßem Festflag-Wechsel |
| `saison_regen` | A: Regen-Wetterzustand draußen aktiv | etwa `altmarkt`, `docks`; 6-s-Loop, innen aus |
| `saison_schnee` | A: Schneetreiben draußen aktiv | etwa `altmarkt`, `ds_kalkmarkt`; 6-s-Loop, innen aus |
| `saison_hitze` | A: Hitze-Wetterzustand draußen aktiv | etwa `ds_kalkmarkt`; 6-s-Loop, innen aus |
| `saison_laub` | D: Bewegung durch sichtbares Herbstlaub | Außenkarten, etwa `ashgrove`; 3 Varianten |
| `schritt_schnee` | D: `footstepSound` mit Schneebedeckung überschreiben; kein Schneetritt auf Wasser | Außenkarten mit Schnee; 3 Varianten |
| `schritt_laub` | D: `footstepSound` mit Laubauflage überschreiben | Außenkarten mit Laub; 3 Varianten |

## 4. Okkultes

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `fasserin_werkbank` | D/A: `openArtisan()` erfolgreich, Fasserin arbeitet | aktiver Treffpunkt aus `src/data/treffen.json`; Loop bis `leaveArtisan` |
| `fasserin_fassung` | D: `orderArtifact(recipeId)` erfolgreich (Auftrag angenommen); nicht pauschal `item` | aktiver Fasserin-Treffpunkt; einmal |
| `kontrolle_tentakel` | E: `lostcontrol`, nur bei sichtbarem Tentakelwachstum | aktuelle Kampfkarte; einmal statt doppeltem Y-Klang |
| `kontrolle_zurueck` | D: sichtbare Tentakel-Rückbildung abgeschlossen | aktuelle Karte; einmal |
| `kontrolle_laeutersalz` | N: `cleansed`, nur wenn Läutersalz tatsächlich verbraucht wurde | aktuelle Karte; einmal |
| `korruption_tick` | N: `corrupted`, nur bei neuem Korruptionszuwachs | global; ein Klang pro Transaktion, nicht pro Renderframe |
| `starling_verwandlung` | P: tatsächlicher Übergang zu Starling Phase 2 | `sternwarte`; einmal |
| `starling_stern` | P: Fall-Stern leuchtet; Index 1–8 fest zuordnen | `sternwarte`; D4/E4/Fis4/G4/A4/H4/Cis5/D5 |
| `starling_ende` | P: nicht tödlicher Abschluss der zweiten Phase | `sternwarte`; einmal |
| `geheimtreffen_glocke` | N: `gathering.open=true`; nur sichtbare Ankündigung | Treffpunkt aus `src/data/treffen.json`; einmal |
| `auktion_hammer` | D: erfolgreicher Zuschlag in `Auction.js`, nicht jedes Gebot | aktiver Treffpunkt; 2 neue Varianten; Y-Konflikt siehe oben |
| `auktion_gebot` | D: `bid()` bestätigt ein Gebot | aktiver Treffpunkt; einmal |

## 5. Sozial, Koop und Ausrüstung

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `beziehung_hoch` | N: `relation.delta>0` und `changed=true` | Figur der Beziehung; einmal pro Stimmungswechsel |
| `beziehung_runter` | N: `relation.delta<0` und `changed=true` | Figur der Beziehung; einmal pro Stimmungswechsel |
| `geschenk_geben` | D: `giveGift` erfolgreich angenommen | aktuelle Figur; einmal |
| `geschenk_falsch` | D: `giveGift` zeigt ungeeignetes Geschenk | aktuelle Figur; einmal, keine parallele Erfolgsfanfare |
| `koop_anspruch` | N: bestätigtes `claim` | aktueller Beuteort; einmal |
| `koop_anspruch_streit` | D: UI meldet konkurrierende Ansprüche auf dasselbe Stück | Beuteansicht; einmal, kein behauptetes neues Bus-Ereignis |
| `koop_beitritt` | N: `party.active=true`, nur Übergang in aktiv, nicht andere Party-Updates | global; einmal |
| `koop_rufen_zu_zweit` | N: `signal_binding` erfolgreich als Zwei-Spieler-Antwort | jeweilige Rufstation; einmal |
| `ausruestung_hut` | D: `wear(id)` erfolgreich und Slot `hut` | Inventar; einmal |
| `ausruestung_mantel` | D: `wear(id)` erfolgreich und Slot `mantel` | Inventar; einmal |
| `ausruestung_waffe` | D: `equip(id)` erfolgreich | Inventar; einmal |
| `ausruestung_amulett` | D: `wear(id)` erfolgreich und Slot `amulett` | Inventar; einmal |
| `tragkraft_voll` | D: Aufnahme wegen Kapazität abgelehnt | Inventar/Beute; gedrosselt, nicht bei jedem `changed` |
| `notizbuch_wegweiser` | D: Person anklicken und Wegweiser anzeigen | Notizbuch; einmal |
| `scroll_tick` | D: diskrete Scrollraste tatsächlich gewechselt | UI; max. 10/s, Pegel 0,07 |

## 6. Calderwick – geplante Karten aus CD

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `cw_presse` | P/A: Druckerpresse läuft | `cw_setzergasse`, `cw_druckkammer`; Loop |
| `cw_rohrpost_senden` | P: Kapsel erfolgreich abgesendet | `cw_roehrenhof`, `cw_villa`; einmal |
| `cw_rohrpost_ankunft` | P: Kapsel im Ausgabefach angekommen | `cw_roehrenhof`, `cw_sortierhalle`; einmal |
| `cw_schraegaufzug` | P/A: Kabine bewegt sich | `cw_gleisfuss`; Loop nur während Fahrt |
| `cw_aufzug_halt` | P: Kabine rastet nach Fahrt ein | `cw_gleisfuss`; einmal, Fahrtloop stoppen |
| `cw_stempel` | P: Amtshandlung stempelt ein Dokument | `cw_archivsaal`; 3 Varianten |
| `cw_letter_fall` | P: Bleiletter fällt sichtbar | `cw_alte_setzerei`, `cw_setzergasse`; 3 Varianten |
| `cw_abgleich_start` | P: Abgleichphase beginnt | `cw_druckkammer`; einmal |
| `cw_abgleich_rueckweg` | P: Rückweg wird beim Abgleich ausgelöscht | aktuelle Calderwick-Straße; einmal |
| `cw_anker_setzen` | P: Marke erfolgreich in Bürgenbrett gesetzt | `cw_buchbinderei`; einmal |
| `cw_anker_verbunden` | P: dritter erforderlicher Anker verbunden | `cw_buchbinderei`; einmal |
| `cw_tuerschild_leer` | P: sichtbares Türschild verliert Beschriftung | `cw_witwenterrasse`; einmal |
| `atmo_rohrpost` | P/A: Rohrpostviertel betreten | `cw_roehrenhof`, `cw_sortierhalle`; Loop |
| `schritt_terrasse` | P/D: `footstepSound` für trockene Calderwick-Terrassen | `cw_gleisfuss`, `cw_setzergasse`, `cw_quittungsmarkt`, `cw_witwenterrasse`; 3 Varianten |

## 7. Briarholt – geplante Karten aus CH

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `bh_ventil_drehen` | P/A: Spieler dreht Ventilrad | `bh_kesselgrund`, `bh_verteilanlage`; Loop nur während Drehen |
| `bh_ventil_rast` | P: Ventilzustand erfolgreich geändert | Ventiltafel; Variante 1=zu, 2=kalt, 3=warm fest wählen |
| `bh_dampf_austritt` | P: kleiner sichtbarer Dampfaustritt | `bh_kesselgrund`, `bh_labor`; 2 Varianten |
| `bh_dampf_entladung` | P: große Druckentladung | `bh_verteilanlage`; einmal |
| `bh_kondensat` | P/A: Kondensat tropft auf Glas | `bh_glasgaerten`; lokaler Loop |
| `bh_scheibe_beschlag` | P: Schrift im Beschlag untersuchen/sichtbar machen | `bh_glasgaerten`, `bh_kaltes_palmhaus`; einmal |
| `bh_reif` | P: sichtbarer Bereich wechselt in kalt | aktuelle Briarholt-Karte; einmal |
| `bh_pflanze_oeffnet` | P: Blüte entfaltet sich | `bh_verkaufshalle`, `bh_wurzelkammer`; einmal |
| `bh_pflanze_spricht` | P/A: Pflanzen-Luftstrom aktiv | `bh_wurzelkammer`; Loop ohne Worte |
| `bh_kapsel` | P: Pflanzenkapsel erfolgreich eingesetzt | `bh_labor`, `bh_verteilanlage`; einmal |
| `bh_ruecklauf` | P: belasteter Rücklauf geöffnet | `bh_verteilanlage`; einmal |
| `bh_sperrklappe` | P: schwere Klappe fällt zu | `bh_verteilanlage`; einmal |
| `bh_kurglocke` | P: Kurplan-Runde beginnt | `bh_stillenhaeuser`, `bh_speisesaal`; zwei Schläge |
| `bh_postkarte` | P: Postkarte fertig geschrieben | `bh_pavillon`; einmal |
| `atmo_glashaus` | P/A: warmes oder feuchtes Glashaus betreten | `bh_glasgaerten`, `bh_verkaufshalle`; Loop |
| `atmo_frost` | P/A: kalter Talkessel im Freien | `bh_winterpromenade`, `bh_kutschenhof`; Loop |
| `schritt_glas` | P/D: `footstepSound` auf Metallgitter | `bh_glasgaerten`, `bh_kaltes_palmhaus`; 3 Varianten |

## 8. Landstraße – geplante Reise aus CD

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `ls_kutsche_halt` | P: Kutsche erreicht Reiseereignis/Endpunkt | `reise_landstrasse`; einmal |
| `ls_zoll_schranke` | P: Zoll bezahlt und Schranke öffnet | `reise_landstrasse`; einmal |
| `ls_grenzstein` | P: okkulten Grenzstein untersuchen | `reise_landstrasse`; einmal |
| `ls_peitsche` | P: Kutsche fährt wieder an | `reise_landstrasse`; einmal |
| `ls_schlafkutsche` | P/A: Reiseereignis Schlafkutsche aktiv | `reise_landstrasse`; Loop bis Ereignisende |
| `ls_landvermesser_tick` | P: Landvermesser setzt Messkette | `reise_landstrasse`; 3 Varianten |

## 9. Oberfläche

| ID | Hook / Auswahlbedingung | Karte / Lebensdauer |
|---|---|---|
| `ui_kapitel` | D: Kapitelkarte erstmals eingeblendet | global; einmal |
| `ui_epilog` | D: neuer Epilog-Abschnitt eingeblendet | global; einmal pro Abschnitt |
| `ui_ende_hell` | D: positives Ende bestätigt | Endansicht; einmal |
| `ui_ende_dunkel` | D: dunkles Ende bestätigt | Endansicht; einmal |
| `ui_bestiarium_neu` | D: bislang unbekannter Bestiarium-Eintrag freigeschaltet | Notizbuch; einmal |
| `ui_personen_karte` | D: Aufenthaltsorte einer Figur auf Karte anzeigen | Personenansicht; einmal; bei gleichem Klick nicht zusätzlich Wegweiserklang |
| `ui_zeitung` | D: Zeitung aufschlagen; `newspaper` meldet nur Verfügbarkeit, nicht Öffnen | Zeitungsansicht; einmal |
| `ui_fest_banner` | N: `season` führt zu neu aktivem Fest; nach Vergleich mit vorherigem Fest | Festbanner; einmal, nicht jede Uhr-Aktualisierung |
| `ui_saison_banner` | N: `season` und tatsächlicher Jahreszeitwechsel | Saisonbanner; alternativ zu `saison_wechsel`, nicht beide auf demselben Banner |

## Reproduzieren und prüfen

```sh
python -m pip install -r tools/audio/sfx/requirements.txt
python tools/audio/sfx/generate_sfx2.py
node tools/audio/sfx/pruefen_sfx2.mjs
node tools/audio/sfx/pruefen_sfx2.mjs --decode
```

Der Generator benötigt FFmpeg mit libvorbis/libmp3lame sowie NumPy/SciPy, nutzt nur die Oszillatorfunktionen von Paket Y und überschreibt keine Y-Datei. ID und Variante bestimmen den Zufallsseed. `pruefen_sfx2.mjs` nutzt ausschließlich Node-Standardmodule; ohne `--decode` prüft er Vorbis-Header, 44,1-kHz-Mono, OGG-CRC, tatsächliche Dauer aus Granule-Positionen, IDs/Varianten/Loops unabhängig gegen das Aufgabenblatt, Hashes, Dateigrößen und Vollständigkeit. `--decode` benötigt zusätzlich das Systemprogramm FFmpeg und prüft beide Formate auf Spitzen, Stille, DC, Dauer, doppelte Audiodaten und Loop-Randsprünge. MP3 trägt Xing/LAME-Metadaten für gapless Wiedergabe; Endpunkte müssen beim Einbau vom Decoder respektiert werden. Das Hörverzeichnis `sfx2_vorschau.html` lässt jede Variante einzeln und Schleifen wiederholt abspielen (über lokalen HTTP-Server öffnen).
