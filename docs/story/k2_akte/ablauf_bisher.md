# Kapitel 2: bestehender Ablauf

Gelesener Stand: `1ecfc2df1facaacfd4e6e0caf7a554a08db20d41`, `src/data/wexmoor.json`. Abgleich gegen `e90e5b040f9c3b6ae66c0edd55bad3f7de29a867`: nur Bosswerte und Sequenz-Schranken geändert, keine Questschritte. Die 29 Schritte bleiben in Inhalt und Bedingungen erhalten. Die folgenden Nummern entsprechen der tatsächlichen Reihenfolge im Quest-Eintrag, nicht einer neuen Zugangssperre.

| Akt | Schritte, Orte und Abschluss |
|---|---|
| I · Ankunft im Moor (8) | 1 Bahnhof: Steckbrief `wx_steckbrief`. 2 Zunder kennenlernen: `k2_met_zunder`. 3 Kahn betreten: `k2_hideout`. 4 `dk2_erwartet` aus `wx_expected` + `wx_star_paper`. 5 Alle sechs Viertel: `k2_known_bahnhof/torf/salz/hafen/ober/pfahl`. 6 `dk2_turm` aus `wx_lights` + `wx_no_oil`. 7 Bahnhof/Glocke: `dk2_fremde` aus `wx_fremde_zug` + `wx_expected`. 8 Zunder: `k2_akt1_done`, Start Akt II. Ihr tatsächlicher Abschlusszweig verlangt die sechs Viertelflags, `dk2_turm` und `dk2_fremde`; `dk2_erwartet` bleibt separat im Journal. |
| II · Der Schüler (6) | 1 Akademie in angezogener Robe: `k2_in_akademie`. 2 Archiv, Studentenzimmer, Wyle: `dk2_schueler` aus `wx_starling_student` + `wx_letters_L`. 3 Lucents Existenz prüfen: `requires_likely: [wx_lucent]`. 4 `dk2_lucent` aus `wx_lucent` + `wx_lights`. 5 Wyle/Pegel am Hafen: `dk2_rechnung` aus `wx_sinking` + `wx_lights`. 6 Zunder: `k2_akt2_done`, Start Akt III. Abschluss verlangt die drei genannten Deduktionen. |
| III · Der Lichtmann (5) | 1 Lucents Haus: `wx_lucent_glas` oder `wx_lucent_zettel`. 2 Hafen/Haus: `dk2_jagd` aus `wx_halblicht` + `wx_moor_flight`. 3 Vergessmoor: `won_namenlose`. 4 Price am Hafen: `k2_price_done`, durch Überzeugen, Bestechung oder Kampf. 5 Starling im Vergessmoor: als Zeugen mitnehmen (`k2_starling_witness`) oder gehen lassen (`k2_starling_gone`); beide setzen `k2_akt3_done` und starten Akt IV. Der Starling-Dialog verlangt Price nicht zusätzlich; AP repariert diese bestehende Abweichung nicht. |
| IV · Wer die Wache führt (7) | 1 Zunder im Kahn: `k2_akt4_talk`. 2 Hale am Salzmarkt: `wx_hale_befehl`; setzt Zunders Haft. 3 Wachhaus: Schlüssel holen, `k2_zunder_free`. 4 `dk2_brandt` aus `wx_order_lichtamt` + `wx_letters_L`. 5 Sedge/Schrein: `dk2_warum` aus `wx_tower_strangers` + `wx_collector`. 6 Haftregister/Hale: `dk2_ausgeliefert` aus `wx_ausgeliefert` + `wx_fremde_zug`. 7 Zunder: `k2_akt4_done`, Start Akt V. Abschluss verlangt die drei Deduktionen und Zunders Befreiung. |
| V · Das Leuchtfeuer (3) | 1 Turmankunft: `k2_am_turm`. 2 Boss: `won_leuchtfeuer`. 3 Brandt: `kapitel2_done`. Kein neuer Pflichtschluss. Zugang zur Turmzone bisher mit `k2_akt4_done`; Brandt erscheint nach dem Boss. |

## Unveränderte Endbedingungen

`brandt.nodes.wofuer` enthält sechs Choices für vier Enden. `k2_rein`: Hale + Marlowe + Starling als Zeuge, oder Hale + Marlowe + Ratsbuch, jeweils `dk2_brandt` und `dk2_warum`; der Ratsbuchzweig versteckt sich bei vorhandenem Zeugen. `k2_moor` und `k2_lichtmeister`: keine zusätzlichen Bedingungen. `k2_meer`: `wx_kit_seen`, alternativ `k2_kit_boot` ohne diesen Hinweis. Keine AP-Fährte ersetzt diese Nachweise.

## Abgrenzung zu vorhandenen Geschichten

Die neun `k2_s_*`-Aufträge behandeln Elsbeth, Bojen, Kits Salz, Maren Fenn, das siebte Tor, Ratssiegel, Veys Lied, Ratsbuch und Hales Ablieferliste. Das eingebaute AB-Paket behandelt Hausnamen, Gewichte, Bojenlied, Nils’ falsches Gesicht, Jorins Proben, Pfandpost, Lichtlosen-Schmuggel, Lin, Zunders Schulden und Rinns Peilweg. AP ergänzt weder eine zweite Namensrettung für Lin noch eine zweite Inselpeilung. Krabbe erinnert sich an seine Schwester und an eine gemeinsame Handlung; deren Aufenthalt bleibt unbewiesen.

Zeitungen und Gerede sind Perspektiven, keine zusätzlichen Beweise. Die Lichtlosen handeln im Keller am Torfstich, die Salzbrüder im Hafenspeicher. Ihre Einladungen, Beziehungen, Auktionen sowie alle Einzelgänger und Polizeiregeln bleiben unverändert. Die neuen Quellen liegen auf bereits vorhandenen Karten.
