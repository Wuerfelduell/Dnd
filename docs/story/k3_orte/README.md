# AS: Dunscar, Karten und Gegner

Inhaltspaket für Kapitel 3 „Der letzte Zug nach Dunscar“. Verbindliche Vorlage ist ausschließlich Geschichte 3. Lieferung zur späteren Integration, keine Änderung am laufenden Spiel. Ausgangsstand: `1fe89c5`.

## Umfang und Dateien

| Datei | Inhalt / Import |
|---|---|
| maps.json | 18 Karten, 108 örtliche Lesetexte plus 4 Kernfachtafeln und 2 Artefaktfunde, 11 Figuren an 12 Plätzen |
| travel.json | 6 Viertelmarker und Speisewagen, gestaffelte Schnellreise |
| zones.json | 3 Kapitelgebiete und 1 Nachspielgebiet mit normalen Gegnern, Elitevorlagen, Boss und Beute |
| encounters.json | 6 direkte Normalgegner, ohne Elite-Vorlagenobjekt |
| bosses.json / phasen.json | 5 erste Bossabschnitte und 3 Folgeabschnitte; Summe je Boss siehe unten |
| items.json / artifacts.json | 12 Beute-/Verbrauchsgegenstände und 2 Artefakte mit Vor- und Nachteil |
| dialogues.json | 5 lokale Vorbereitungs-/Kampfstationen, friedliche Bewältigung und Abschnittsfortsetzung |
| beute_vorschlag.json | 4 zukünftige Auszahlungsdialoge mit 33 Pfadvarianten, **bis Pfadfilter implementiert ist nicht importieren** |
| quests.json / npcs.json / dialog_zusaetze.json | leere Standardcontainer; Hauptaufträge und Figuren gehören AR/AT/AU |
| case.json / platzierung.json | leere Standardcontainer; Objekte stehen direkt auf den neuen Karten |
| rufmechanik.md / Signals.skeleton.js | genaue Zustands-/Integrationsspezifikation und kommentierte Signaturen, keine Spiellogik |
| grafikwuensche.md | 14 zusätzliche Item-Icons, keine Doppelbestellungen zu AV/AX |
| offene_punkte.md | vollständige externen Bindungen, technische Freigabeblocker und Merge-Regeln |
| pruefen.mjs | Node-Prüfer ohne Pakete, einschließlich Fehlereinbringung |

## Ortsplan

Alle Koordinaten beginnen bei 0. Die Räume haben einen freien Randgang, mehrere Querverbindungen und sichtbare, feste Rückwege. Boden: `.` Pflaster/Bahnhof, `w` Innenraum, `s` Stein, `g` Schluchtboden; `I` feste Wand. Die verwendeten Zeichen sind an den vorhandenen Themen/Fallbacks ausgerichtet. Jede Karte besitzt zwei Lichter und eine eigene Ambient-Einstellung.

| Karte | Größe | Aufbau / Anschluss |
|---|---|---|
| ds_endbahnhof | 44×22 | Wartesaalnischen, Schaltertexte im Norden; Schwellenring und Signalhang bilden den öffentlichen Ring |
| ds_schwellenring | 44×22 | Werkstattreihen mit Quergassen; Türen zu Wagen, Depot und gated Rangierwüste |
| ds_arbeiterbogen | 44×22 | Hausblöcke um freie Laufwege; Mabels Teesaal und Huxfords Platz |
| ds_kalkmarkt | 44×22 | Zweigeteilte Marktfläche mit mittlerem Durchlass; Steinmetz und Lesesteine |
| ds_bruchstufen | 44×22 | Stufenwangen und Querverbindungen; Klopfbruch und früher Zugang zum letzten Bahnsteig |
| ds_signalhang | 44×22 | Schaltreihen; Prüfhaus, Lohnbüro, Rufschlucht, später Unterschicht |
| ds_speisewagen | 24×14 | Mittelgang, Koje (3,5), Lager (7,5), Fallwand (11,5), Pfiff (3,6); Doppelfilz und Ofen beschrieben |
| ds_runddepot | 24×14 | Wartungsseiten um einen Durchlass; Oren und Zugang zum Personenwagen |
| ds_pruefhaus | 24×14 | Getrennte Prüfstände; Willa, Protokolle und freiwilliger Prüflinsenfund |
| ds_teesaal | 24×14 | Tischreihen und Durchgang; Mabels Wirtshaus am Arbeiterbogen, kleiner Marktausschank nur Umwelttext |
| ds_lohnbuero | 24×14 | Schrankinseln mit umlaufendem Gang; Esther und lesbares Register |
| ds_nachtzug_wagen | 24×14 | Abteiltrennung mit Mittelöffnung; stationärer Weg zurück ins Depot |
| ds_nachtzug_lok | 24×14 | Bedienblöcke mit freien Seiten; Rückgang zum Wagen, keine automatische Fahrt |
| ds_rangierwueste | 48×30 | Abgestellte Reihen, Quergassen, blinde Schiene; 3 normale Roamer, Hundstation |
| ds_klopfbruch | 48×30 | Gerüst-/Felsinseln; 3 normale Roamer, Originalfolgestation und freier Rückweg |
| ds_rufschlucht | 48×30 | Trennwand mit zentraler Öffnung; 3 normale Roamer, Verteilerstation |
| ds_letzter_bahnsteig | 44×22 | Bahnsteigwangen mit Zugängen; frühes Gespräch, Kampf erst nach Akt IV |
| ds_unterschicht | 48×30 | gestaffelte Trennreihen; 3 normale Roamer, drei Kampfabschnitte und Stillringfund |

Der Fußgängerring Endbahnhof → Schwellenring → Arbeiterbogen → Kalkmarkt → Bruchstufen → Signalhang → Endbahnhof ist beidseitig **ohne Bedingungen** offen. Die sechs Viertel bleiben auch ohne Ladungen erreichbar. Schnellreise: die ersten drei bei Ankunft, Kalkmarkt/Bruchstufen nach Akt I, Signalhang nach Akt II. Wagen ab Ankunft. Gefahrenzugänge: Rangierwüste nach Akt I, Klopfbruch nach Akt II, Rufschlucht nach Akt IV, Unterschicht nur nach Kapitelabschluss. Keine Zeitfrist.

Geometrie ist ein begehbarer Datenentwurf mit vorhandenen Tiles; die endgültigen Bahnhofsbauten, Schienen, Maschinen und Fassaden kommen durch AV. `tiles_wunsch` zeigt auf den jeweiligen Kartenbezeichner und ist noch kein verfügbarer Atlas.

## Gegnerwerte und Schwächen

Basiswerte, **vor** Multiplikation durch Combat. Referenz: `../sequenzen/balancing.md`, „Zielkorridore für Kapitel 3 und später“. Normalgegner: Schichtgänger 180 HP als früher, nichttödlicher Einstieg; Signalkrähe 200, Lohnlistenmotte 210, Kalkstaubgeist 220, Gerüstklang 260, Nachhall 280. Je Panzer 2. Schaden 11–16 pro Ring, zwei Ringe bei der Grundattacke und ein angekündigter schwerer Treffer. Elitevorlage nutzt vorhandene 1,5× HP / 1,3× Schaden, danach die allgemeinen Kampfskalierungen.

| Boss | HP gesamt / Abschnitte | Grundangriff / schwer | Vorbereitung | friedliche Lösung |
|---|---:|---|---|---|
| Schwellenhund | 210 | 10×2 / 12×1 | falscher Anfahrpfiff, Suchlicht ablenken | stille Passage zum Walzenfach |
| Vorhauer | 410 | 15×2 / 17×1 | originale Rettungsfolge zurückgeben | Ausfahrtssignal vervollständigen |
| Vielrufer | 550 | 17×2 / 19×1 | Ruf und Antwort getrennt testen | Leitungen örtlich trennen |
| Gallowmere | 440, 220+220 | 16×2 / 18×1; dann 18×2 / 18×1 | Rollenruf von persönlicher Antwort trennen | AR führt Beweisgespräch und Ende aus |
| Unterschicht | 790, 260+260+270 | 21×2 / 23×1; dann 22×2 und 23×2 / 23×1 | leere Stellen begrenzen, keine Ersatznamen | örtliche Öffnung ohne Personeneinsatz schließen |

Bosse Panzer 3. Ausholen: erste Grundfolge 1400/2100 ms, schwer 2400 ms; Folgeabschnitte 1600/2300 ms und schwer 2800 ms. `weak_if` nutzt die entsprechenden AS-Vorbereitungsflags. Der erste Treffer ist nie ein unangekündigter Sofortschaden. Gallowmere und Unterschicht verwenden dasselbe Placeholder-Sheet über ihre Abschnitte; AX liefert die späteren Darstellungen.

Solo ergibt z. B. Vorhauer 574 HP und schwer rund 24 Schaden; Vielrufer 770 HP und rund 27 Schaden; Unterschicht in Summe 1106 HP und rund 32 Schaden. Der tatsächliche Koop-Multiplikator hängt im aktuellen `Combat` auch vom Kräfteverhältnis der Spieler ab. Nicht nochmals feste Multiplikatoren in Daten einrechnen. Die Unterschicht ist für spätere Sequenz 2 als Zutat-1-Hüter vorgesehen; ihre friedliche Lösung bleibt erreichbar. Der Hauptabschluss benötigt keine Seq-4-Fähigkeit.

Die Abschnittsfassung erlaubt Erholung zwischen Phasen. Sie ist daher ausdrücklich **kein Balancenachweis** für den künftigen nahtlosen Superboss. Werte orientieren sich an AF; Kontrollresistenz, Heilketten, alle zehn Pfade und Koop brauchen Spieltests nach Integration.

## Zuständigkeit und Sicherheit

AS setzt ausschließlich `k3o_`-Flags. Fest vereinbarte Karten/Gegner-IDs sind dokumentierte Präfixausnahmen. Neue Gegenstände, Objekte, Dialoge und Phasen tragen `k3o_`. Fremde Figuren werden nur platziert, nicht definiert. Umwelttexte lösen keine AR-Akten und setzen kein Kapitelende. Schichtgänger sind lebende Menschen, werden bewusstlos und versorgt.

Kampf und friedlicher Durchgang setzen dasselbe `k3o_<boss>_geloest`. Normale Gebietsdrops bleiben wiederholbar; Kernzutaten sind einmalig pro Boss/Person geplant. Die derzeit in einem allgemeinen Dialog ignorierte Pfadbedingung wird bewusst nicht in aktive Auszahlungsdaten übernommen. Die versiegelten Kernfächer und separat gelieferte Vorschlagsdatei machen diese Integrationsgrenze sichtbar.

## Prüfen

```sh
node docs/story/k3_orte/pruefen.mjs
node docs/story/k3_orte/pruefen.mjs --strict-external
node --check docs/story/k3_orte/Signals.skeleton.js
```

Der erste Befehl prüft Paketkonsistenz und meldet die exakt vertraglich benannten Fremdreferenzen gesondert. Ein unbekanntes zusätzliches Flag oder eine falsch geschriebene Figur ist ein Fehler. Der strikte Modus schlägt fehl, solange AR/AU ihre 16 verwendeten externen Definitionen nicht in `src/data` integriert haben. Dies ist bewusst keine stillschweigende Ausnahme mit falscher Gesamtfreigabe.

Acht Negativtests beschädigen Zeilen, Spawn, Itemreferenz, Dialogziel, Flagsetzer, Türspawn, Pfad-ID und aktive Pfadfilter. Jeder Defekt muss den Validator scheitern lassen. Strukturprüfung: 18 Karten, 114 Lesestellen, alle Rückwege, alle Objekt-/Roamerpositionen, Bedingungen, Präfixe, Phasenreferenzen, 33 Belohnungszuordnungen, Artefaktgleichheit und identische Gebietskopien.

## Eingebaut (Kapitel 3 Teil 1)

Spieldaten liegen jetzt in `src/data/packs/<paket>/` und werden über `src/data/index.js` geladen. Hier bleiben Doku und noch nicht eingebaute Zusatzdateien (Beutevorschlag, Anreisen, Epiloge, Rufmuster, Horchstellen). `pruefen.mjs` liest beide Orte. Abweichungen beim Einbau: alle Kapitel-3-Kämpfe tragen `chapter: 3`, Gegner nutzen die AX-Sheets (`enemy_<id>`), Kernzutaten sind Trophäen, einzelne Platzierungen wurden auf freie Felder verschoben, Dunscar ist eine eigene Stadtkarte (`city.json`). Offen für Teil 2: Ruf-Ladungen, nahtlose Bossphasen, pfadgefilterte Beute, Epiloge, AV-Tilesets.
