# Dunscar: Musik und Klänge (AY)

17 originale Musikpartituren und 53 Klänge als Nebel-Musik v1. Keine Audiodateien, Fremdmelodien oder neuen Instrumentbanken. Basis: `docs/story/kapitel3/geschichte_3.md` und die aktualisierte AY-Aufgabe.

## Leitmotiv und Dramaturgie

Unvollständiger Schichtpfiff: `e5:3 r:1 e5:3 r:1 c5:8 | r:16`. Ausschließlich `ds_feierabend` ergänzt `g5:16`. Gallowmere stellt ihm die offene Ermittlerfrage gegenüber. Die Stilllegung entfernt erst Pfiff, Bass und Puls, dann Antwort und Harmonie; nur Wind bleibt. Vollzählig endet in einem gleichförmigen Arbeitsbefehl. Horchen bleibt sehr leise, mit langen Pausen und gehaltenem Ton. Rufschlucht und Stimmenmurmeln verwenden rhythmisch versetzte wortlose Stimmen.

Alle Musikloops haben einmaliges Intro und drei verschiedene Folgeabschnitte. Längen zählen die notierte erste Wiedergabe inklusive Intro; Nachklang/Release ist nicht eingerechnet. Kurze Muster wiederholen sich innerhalb der absichtlich längeren Abschnitte. Das ist retrotypische Ostinato-Komposition, kein aufgezeichnetes Audio.

## Rufzeichen

Die Bedeutungen sind Vorschläge für die Story-/Code-Integration, keine neuen Journal- oder Flag-IDs. Ein Zeichen nennt Tonhöhe, kurzen/längeren Anschlag und Pausen; die exakte Dauer bleibt zusätzlich in den Noten sichtbar. Ein Ruf dauert jeweils 1 s. Sein Nachhall hat identische Noten und Zeichen, ist leiser und trägt 270–570 ms gefiltertes Echo. Kein Ruf enthält das vollständige Feierabendmotiv.

| ID | Zeichen | Noten | Gedacht für |
|---|---|---|---|
| ds_ruf_01 | e5 · Pause g5 — Pause | `e5:1 r:1 g5:2 r:4` | Drehscheibe suchen |
| ds_ruf_02 | g5 — e5 · Pause Pause | `g5:2 e5:1 r:1 r:4` | Depotseite prüfen |
| ds_ruf_03 | c5 · e5 · g5 · Pause | `c5:1 e5:1 g5:1 r:5` | Falscher Anfahrpfiff |
| ds_ruf_04 | b4 — Pause f#5 — Pause | `b4:3 r:1 f#5:2 r:2` | Ausfahrt prüfen |
| ds_ruf_05 | e4 · Pause b4 · Pause | `e4:1 r:2 b4:1 r:4` | Werkzeugspur vergleichen |
| ds_ruf_06 | g4 — Pause d5 · Pause | `g4:2 r:1 d5:1 r:4` | Rettungsfolge beginnen |
| ds_ruf_07 | a4 · c5 — Pause e5 · Pause | `a4:1 c5:2 r:1 e5:1 r:3` | Rettungsfolge beantworten |
| ds_ruf_08 | d5 — a4 · Pause | `d5:3 a4:1 r:4` | Bruchabschluss prüfen |
| ds_ruf_09 | g4 · Pause b4 · Pause d5 — Pause | `g4:1 r:1 b4:1 r:1 d5:2 r:2` | Einzelnen Halt testen |
| ds_ruf_10 | c5 — Pause g4 — Pause | `c5:2 r:2 g4:2 r:2` | Rundruf isolieren |
| ds_ruf_11 | f#4 · a4 · Pause c5 · Pause | `f#4:1 a4:1 r:2 c5:1 r:3` | Prüfwalze kalibrieren |
| ds_ruf_12 | b4 — e5 · Pause | `b4:4 e5:1 r:3` | Schalter bestätigen |
| ds_ruf_13 | e5 — Pause c5 — Pause | `e5:2 r:1 c5:2 r:3` | Nellies Kontrollzeichen |
| ds_ruf_14 | a4 · Pause e5 — Pause | `a4:1 r:1 e5:3 r:3` | Schallschleuse prüfen |
| ds_ruf_15 | d5 · f#5 · a5 — Pause | `d5:1 f#5:1 a5:2 r:4` | Leitungstrennung testen |
| ds_ruf_16 | b4 — Pause f5 · e5 · Pause | `b4:2 r:1 f5:1 e5:1 r:3` | Personenfreie Gegenantwort |

## Instrumente und Zuordnung

Nur die bestehende Bank `instrumente.json`: Dampfpfeife, Hackbrett, Säge, wortlose Chöre, Amboss und Wind prägen die Stadt; Harmonium und Knistern wärmen den Speisewagen. Holzblock markiert Schienenstöße, Glocke die Anzeigen, Kontrabass den Grund. Keine eigenen Instrumente erforderlich. Die Manifeste decken alle 18 festgelegten Karten und fünf Kampfzuordnungen ab. Horchen und die drei bestellten Endstücke sind als Ereignisse registriert.

## Prüfung und offene Integration

`node tools/audio/musik/pruefen_dunscar.mjs` prüft alle 70 Stücke mit dem echten `compileStueck`-Parser sowie Paketgrenzen, Rufpaare, Dauer, Motive, Karten und Manifest-Referenzen.

Die Vorschau-Liste enthält bereits beide Dunscar-Manifeste; deshalb ist dort keine Änderung nötig. **Offen bei Z1:** `pruefen.mjs` muss `art: sammlung` und `klaenge` verstehen. Aktuell scheitert dessen globale Prüfung erwartungsgemäß an der ersten Sammlung. `MusicSynth.ladeManifest` liest nur `tracks`, und `lade(id)` erwartet eine Einzeldatei. Für Klangwiedergabe muss Z1 `klaenge` registrieren und aus einer Sammlung `stuecke[id]` laden. Bis dahin kann eine Vorschau jedes enthaltene Stückobjekt direkt an `synth.lade(stueck)` übergeben und anschließend dessen ID spielen. Die 17 Musikstücke sind bereits direkt ladbar. Keine fremden Synth-/Integrationsdateien wurden verändert.

Das vierte Story-Ende „Eine freiwillige Gegenstimme“ hat in AY keinen eigenen bestellten Track. Die Integrationsverantwortlichen müssen dessen Musik auswählen; es wird hier nicht still auf Feierabend gelegt. Hörabnahme auf realen Geräten steht aus; Parserprüfung ersetzt keine Hörprobe. Lautstärken sind konservativ gesetzt, ohne eine gemessene Lautheit zu behaupten.

## Längen

Siehe folgende Prüfausgabe (Sekunden, ohne Hallfahnen):

```text
ds_ankunft: 120.00 s (intro 15.00 s, loop 105.00 s)
ds_boss: 120.00 s (intro 10.00 s, loop 110.00 s)
ds_brueche: 120.00 s (intro 15.00 s, loop 105.00 s)
ds_feierabend: 60.00 s
ds_gallowmere: 150.00 s (intro 15.00 s, loop 135.00 s)
ds_horchen: 60.00 s (intro 15.00 s, loop 45.00 s)
ds_kampf: 90.00 s (intro 8.57 s, loop 81.43 s)
ds_schwellenhund_bellen: 3.00 s
ds_vorhauer_schlag: 3.00 s
ds_vielrufer_chor: 3.00 s
ds_gallowmere_pfeife: 6.00 s
ds_unterschicht_atem: 6.00 s
ds_horch_an: 2.00 s
ds_horch_aus: 2.00 s
ds_ladung_leer: 2.00 s
ds_ladung_voll: 2.00 s
ds_falsches_muster: 2.00 s
ds_richtiges_muster: 2.00 s
ds_ruf_01: 1.00 s
ds_hall_01: 1.00 s
ds_ruf_02: 1.00 s
ds_hall_02: 1.00 s
ds_ruf_03: 1.00 s
ds_hall_03: 1.00 s
ds_ruf_04: 1.00 s
ds_hall_04: 1.00 s
ds_ruf_05: 1.00 s
ds_hall_05: 1.00 s
ds_ruf_06: 1.00 s
ds_hall_06: 1.00 s
ds_ruf_07: 1.00 s
ds_hall_07: 1.00 s
ds_ruf_08: 1.00 s
ds_hall_08: 1.00 s
ds_ruf_09: 1.00 s
ds_hall_09: 1.00 s
ds_ruf_10: 1.00 s
ds_hall_10: 1.00 s
ds_ruf_11: 1.00 s
ds_hall_11: 1.00 s
ds_ruf_12: 1.00 s
ds_hall_12: 1.00 s
ds_ruf_13: 1.00 s
ds_hall_13: 1.00 s
ds_ruf_14: 1.00 s
ds_hall_14: 1.00 s
ds_ruf_15: 1.00 s
ds_hall_15: 1.00 s
ds_ruf_16: 1.00 s
ds_hall_16: 1.00 s
ds_zug_pfiff_fern: 4.00 s
ds_zug_fahrt: 2.00 s (intro 0.00 s, loop 2.00 s)
ds_zug_bremse: 2.00 s
ds_schalter_klingel: 2.00 s
ds_phonograph: 2.00 s (intro 0.00 s, loop 2.00 s)
ds_walze_start: 2.00 s
ds_kalkstaub: 2.00 s
ds_geruest_wind: 2.00 s (intro 0.00 s, loop 2.00 s)
ds_klopfen_fern: 2.00 s
ds_stimmen_murmeln: 4.00 s (intro 0.00 s, loop 4.00 s)
ds_nachtzug: 90.00 s (intro 10.00 s, loop 80.00 s)
ds_pruefhaus: 90.00 s (intro 12.00 s, loop 78.00 s)
ds_pruefung: 90.00 s (intro 12.00 s, loop 78.00 s)
ds_rufschlucht: 120.00 s (intro 15.00 s, loop 105.00 s)
ds_speisewagen: 90.00 s (intro 15.00 s, loop 75.00 s)
ds_stadt_nacht: 120.00 s (intro 15.00 s, loop 105.00 s)
ds_stadt_tag: 120.00 s (intro 12.00 s, loop 108.00 s)
ds_stilllegung: 60.00 s
ds_unterschicht: 150.00 s (intro 20.00 s, loop 130.00 s)
ds_vollzaehlig: 60.00 s
PASS: 17 music pieces, 53 sounds, 16 exact call/echo pairs, 18 maps, 5 combat mappings; 25 files, each <= 60000 bytes.
```
