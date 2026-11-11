# CJ: Nebenaufträge und Kurleben in Briarholt

Inhaltsvorrat für den getrennten Einbau. Keine Änderungen an Spielcode oder vorhandenen Vorratsfiguren. Maßgeblich sind Geschichte 2 und die Kapitel-5-Eckdaten; Briarholt folgt Calderwick, mit einer eigenen Dunscar-Ersatzroute.

12 Nebenaufträge mit je zwei auffindbaren Befunden, einer Deduktion, einer bestätigten Entscheidung, unterschiedlichen Folgen und einmaligem Lohn. Die acht BJ-Keime stehen im Quest-`summary`. 20 bis 40 Minuten je Auftrag sind ein Gestaltungsziel einschließlich Wege und Gespräche, keine gemessene Spielzeit.

| Auftrag | Titel | Schritte |
|---|---|---|
| `bhn_gepaeckschein` | Der Koffer ohne Einweisung | 5 |
| `bhn_postkarten` | Eine Adresse ohne fremden Namen | 5 |
| `bhn_umgedrehte_schilder` | Die Rückseite der Beete | 5 |
| `bhn_waermeschwarz` | Armenwärme im Nebenrohr | 5 |
| `bhn_namensheft` | Ein Heft in Reichweite | 5 |
| `bhn_frachtbelege` | Der Preis einer leeren Kiste | 5 |
| `bhn_wurzelzeichnungen` | Zwei Kanten, zwei Zeiten | 5 |
| `bhn_schraubenschluessel` | Der gute Schlüssel | 5 |
| `bhn_kurkonzert` | Die ungeschriebene Zeile | 5 |
| `bhn_brief_aus_calderwick` | Ein Paket ohne Vorladung | 5 |
| `bhn_elsbeth` | Keine Unterschrift für die Werbung | 5 |
| `bhn_wintervorrat` | Vier Türen vor dem Winter | 6 |

## Keime und Verteilung

Akt I: Gepäckschein, Schraubenschlüssel, Brief. Akt II: Postkarten, Schilder, Wärmeschwarz, Konzert. Akt III: Namensheft, Frachtbelege, Elsbeth. Akt IV: Wurzelzeichnungen. Akt V: Wintervorrat. Die jeweiligen Angebote verlangen das vorherige Akt-Ende; angenommene Aufträge bleiben offen.

BJ wird erweitert, nicht umgeschrieben: Frosts Türrolle führt zur Werkzeugkerbe seines Bruders, Beatrices Schattenplatz zur Postkarte, Adelines gewöhnlicher Steckling zum Vergleich mit beschrifteten Beeten. Ennas erreichbare Rufglocke liefert den Anlass für das Beobachtungsheft; Dipples Blattstudie führt zu älteren Fassungen und Crowthers doppelte Kistengebühr zu alten Frachtbelegen. Felix' Gepäckprüfung und Malkins Leitungskontrolle werden als Untersuchung fortgeführt.

Die Entscheidungen verändern Bindung, Ehre oder Auszahlung und setzen ausschließlich `bhn_`-Flags. Das Namensheft hat zwei Act-V-Nachgespräche bei Enna. Frost verlangt beim Werkzeug keine Erinnerung. Wintervorrat erfordert vier getrennte Haushaltsgespräche und zwei technische Befunde; `bhn_reserve_geprueft` ist nur ein optionaler Bonus für CG.

## Dateien und Laden

- Standarddateien: Quests, eigene Dialoge/NPCs, BJ-Dialogzusätze, 24 Fakten, 24 Hinweise und 12 Deduktionen. `items.json` und `encounters.json` bleiben leer: vorhandene BL-Gegenstände werden referenziert, Kämpfe sind nicht nötig.
- 8 Einwohner mit Tag/Nacht-Plätzen und jeweils 6 Grundknoten. Auftragsspezifische Knoten liegen zusätzlich in `dialog_zusaetze.json`.
- 60 Gerede-Einträge: sechs Viertel × fünf Akte × zwei Wärmezustände. 25 freie Lesestücke stehen zusätzlich zu den 24 Questfundstellen bereit.
- 8 Kurblatt-Meldungen, 24 Koop-Wechsel mit beiden Zweitspieler-Stimmen. Vier Wechsel werden erst nach dem optionalen Koop-Auftragszweig freigeschaltet (Gepäck, Wärme, Werkzeug, Wintervorrat). Alle nötigen Befunde bleiben allein erreichbar.
- Tiere/Wetter: 29 Kartenzustände, drei Tierarten und drei Wetterarten als Einbauvorschlag; Grafikwünsche und fehlende Renderer-Zuordnung separat dokumentiert.

Einbaureihenfolge: BL-Gegenstände und Handel, BJ-Figuren/Grunddialoge, CH-Karten, CG-Kapitelrahmen, dann CJ. Anschließend Lesestücke und Zusatzsysteme nach den vorhandenen Kapitel-3-Ladepfaden übernehmen. `lesestuecke.json` enthält Platzierungsdatensätze, genau einmal mit den Objektplatzierungen zusammenführen. `einwohner.json` steuert Tag/Nacht; die acht NPC-Einträge aus `platzierung.json` sind die Vorschau der Tagespositionen und müssen beim Laden mit Einwohnersteuerung ausgefiltert werden, wie bei k3_leben. Keine BJ-NPCs ein zweites Mal platzieren.

Kartenkoordinaten sind Vorschläge; begehbare Zellen und Laufwege kann erst CH bestätigen. Kalte/warm-Varianten müssen dieselben Objekt- und Einwohnerzustände tragen. Keine zweite Auszahlung nach Kartenwechsel. Ein gültiger Kapitel-5-Start hat entweder ein Calderwick-Ende oder `kapitel3_done` ohne Kapitel 4.

## Prüfung

68 Solo-/Koop- und Entscheidungsrouten laufen mit `GameState` durch, einschließlich der fünf Briefe, beider Elsbeth-Routen und der Auszahlungssperren. Dies sind Dialog- und Zustandsprüfungen ohne Kartennavigation.

`node docs/story/k5_nebenquests/pruefen.mjs` prüft JSON, Präfixe, Dialogziele, Fakten/Deduktionen, Referenzen, Umfang, Platzierungskollisionen und Auszahlungssperren. Fehlende vereinbarte Kapitel-Schnittstellen werden als OFFEN ausgegeben, unbekannte Referenzen sind Fehler. `--strict` liefert bei offenen Schnittstellen einen Fehlerstatus und dient der späteren Einbauabnahme. Ein positives Inhaltsresultat ersetzt keinen Spieltest, keine Kartenprüfung und keine bestätigte Laufzeit von 20 bis 40 Minuten.
