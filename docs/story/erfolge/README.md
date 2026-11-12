# DL — Akte des Ermittlers

80 stille Erfolge, ohne Punkte, Rangliste, Geld, Erfahrung oder Kampfboni. Dieses Paket liefert Daten, Grafiken und den Einbauvertrag; keine Laufzeitänderung. Gelesener Quellstand: `6ccced920b21ee296edba27f20d5215e68b62695`.

## Inhalt und Reihenfolge

`erfolge.json` ist die verbindliche Reihenfolge, identisch mit dem Atlas: zeilenweise links nach rechts, oben nach unten, nullbasierte Zellen. `bedingungen.json` ergänzt ausschließlich Herkunft, Messregeln, Gruppierung und Motiv. `meldungen.json` enthält 6 Einblendungen, 4 Seitenzustände und 4 Koop-Zeilen.

| Gruppe | Anzahl | Atlas-Indizes |
|---|---:|---|
| Fälle und Kapitel | 16 | 0–15 |
| Sequenzen | 12 | 16–27 |
| Zirkel und Beziehungen | 12 | 28–39 |
| Welt | 16 | 40–55 |
| Kampf | 12 | 56–67 |
| Koop | 8 | 68–75 |
| Kuriositäten | 4 | 76–79 |

Die Stichwortliste und Gruppenzahlen sind nicht überall deckungsgleich. Die minimale Auslegung hält alle Themen und genau 80 Plätze: sechs einzelne Zirkel; Erfolg **und** Fehlschlag bei der Fasserin bilden einen gemeinsamen Bilanz-Erfolg. Im Koop werden verschiedene Pfade **und** verschiedene Tiere in einem Eintrag kombiniert, damit Duo-Kämpfe für **alle sechs Kapitel** plus das geteilte Register Platz finden. „Boss ohne Treffer“ erhält sechs Kapitel-Einträge. Welt ergänzt zur Stadtlektüre das Gesamtarchiv aller sechs Städte. Keine weiteren Varianten.

## Seite „Akte des Ermittlers“

Notizbuch-Seite mit Gruppensymbol und Gruppenüberschrift; darunter feste Listenreihen in obiger Reihenfolge. Jede Reihe zeigt Icon links, immer sichtbaren Namen und darunter einen einzigen Aktenvermerk. Offene Erfolge verwenden die graue Prägung. Bei `versteckt: true` bleibt der Name sichtbar; der Text wird bis zur Erfüllung durch „Vermerk noch versiegelt.“ ersetzt. Einblendungen erst beim Übergang offen → erfüllt. Das Neu-Symbol verschwindet nach dem bewussten Öffnen der entsprechenden Reihe. Nicht allein Farbe verwenden: erfüllte Reihen tragen das kleine Stempelmotiv, offene Reihen das Prägungsbild; verdeckte Texte zusätzlich das Versteckt-Symbol.

16px Icons für Standarddarstellung, 32px Icons für große Darstellung; 32px sind exakte 2x-Vergrößerungen. Rendern mit Nearest Neighbor. Rahmen: 9-Slice 4/8/4/4; obere Kante aus `header_repeat` kacheln und `stamp_area` einmal mittig unverzerrt überlagern. Reihen-Trenner aus benannter Region kacheln. Keine Icons aus dem Atlas nach Freischaltzustand umsortieren. Seitentext: leer bei 0, halb ab 40 bis 79, voll bei 80; „alles versteckt“ als ergänzende Zeile sobald alle sechs versteckten Einträge erfüllt sind. Alle 80 Einträge sind vorhanden, auch wenn noch nichts erreicht wurde.

Einblendung unten rechts: 96x24 Rahmen, 16x16 Icon im linken Slot, 32x32 Stempelanimation über dem Icon, sechs Frames bei 10 fps, einmalig. Lange Namen mit UI-Schrift auf zwei Zeilen umbrechen bzw. vorhandene Textskalierung verwenden; kein Text in die PNGs backen. Meldungen nacheinander statt überlagert abspielen. Bei Save-Migration still eintragen, keine 80 Popups. Die Vorschau ist eine Layoutstudie, keine implementierte Spielseite.

## Bedingungen und Speicherung

`requires_flags` bedeutet logisches UND aller genannten Flags. Die **21 Flagbedingungen** sind im Quellstand belegt; das Prüfskript liest ihre angegebenen Dateien. Die **59 Zählerbedingungen** sind ausdrücklich Vorschläge, **keine Behauptung vorhandener Runtime-Zähler**. Ein Zähler mit `min: 1` darf ein historischer Bool-Latch sein. Bereits messbare Zustände (Mitgliedschaft, Beziehung, Sequenz, Verdauung) werden beim Einbau in diese Adapter gespiegelt. Neue Systeme DE–DI, DJ, CT/CX, DD und CR müssen ihre tatsächlichen Ereignisse liefern; hier werden keine fremden Pack-IDs erfunden.

Erfolge pro Spielerprofil dauerhaft speichern; normalerweise Bedingungen innerhalb eines Durchlaufs/pro Spieler messen. Nur `dl_enden_eines_kapitels` und `dl_pfade_profil` vereinigen bewusst mehrere Spielstände. Ein Save darf einen anderen nicht zufällig bei Briefe, Feste, Beziehungen oder Kampfserien ergänzen. Profilunion bewahrt bereits freigeschaltete Erfolgs-IDs. Host bestätigt Ereignisse; beide Koop-Spieler speichern eigene eindeutige Ereignis-IDs, Reconnect darf nicht doppelt zählen. `koop: false` bedeutet auch solo erreichbar, nicht „im Koop gesperrt“; persönliche Treffer, Tränke, Schritte und Beziehungen bleiben spielerbezogen. `koop: true` erfordert die dokumentierten zwei aktiven Menschen.

Kampf-Instanzen, gelesene Briefe, Fest-IDs, Gegner-IDs und Haus-IDs deduplizieren. Zähler nicht aus Einblendungen erhöhen. Unvollständige Historie nicht als null Kontrollverluste oder null Kämpfe interpretieren; bei alten Saves nur belegbare Erfolge nachtragen. Für 50%-Verdauung und friedliche Stadt ist eine vollständige Ereignishistorie nötig. Bei allen Sammelbedingungen eine versionierte, **nicht leere** Sollmenge verwenden; fehlende Pack-Daten dürfen keinen Erfolg auslösen. Lesestücke über Karten-Stadtzuordnung klassifizieren, Bestiarium über Encounter-/Map-Katalog; bei mehreren Orten eine feste Stadtzuordnung im Einbau festlegen. Keiner dieser vollständigen Stadtkataloge wird hier als bereits eingebaut ausgegeben.

`zaehler_kaempfe`, `zaehler_schritte_schlick`, `zaehler_briefe` sind die geforderten Vorschlagsnamen. Weitere benötigte Adapter heißen `dl_*`. Exakte Regeln stehen pro Eintrag unten und maschinenlesbar in `bedingungen.json`. „Kein Kampf in einer ganzen Stadt“ bleibt bis zum Nachweis eines kampffreien Abschlusswegs ein Einbauhindernis; bloßer Stadtwechsel zählt nicht. Boss-ohne-Treffer zählt feindliche Kontakte auch bei vollständiger Absorption; selbst bezahlte Lebenspunkte sind kein Treffer. Keine Behauptung, dass alle Erfolge im aktuellen Spiel erreichbar sind.

## Kosmetische Freischaltungen

| Erfolg | Vorgeschlagenes Ziel | Einbauvertrag |
|---|---|---|
| Vier Ausfertigungen | `haus_register_seite_gerahmt` | Gerahmte Register-Seite aus DG; kanonische Stück-ID beim Einbau abgleichen. |
| Sechs volle Register | `haus_lesepult` | Lesepult aus DG; vorhandene Herkunft nicht ersetzen, zusätzlicher kosmetischer Freischaltweg. |
| Zehn Handschriften | `titel_6` | Alias für DM-Titel-Variante zu Kapitel 6; kanonischen Variantenschlüssel beim Einbau bestätigen. |

Diese drei Referenzen sind **reservierte Vorschläge**, keine nachgewiesenen IDs in bereits gelieferten DG/DM-Daten. Sie verleihen selbst keine Boni. Keine DG/DM-Dateien ändern und keine zusätzlichen Möbel/Bilder erzeugen. Freischaltungen idempotent, bei fehlendem Ziel als ausstehende kosmetische Freischaltung speichern.

## Vollständige Bedingungstabelle

| Index / ID | Name | Bedingung | Status / Quelle | Präzise Messregel |
|---|---|---|---|---|
| 0 / `erf_fall_1` | Erste Ablage | `case_01_closed` | vorhandene Flags: src/data/case_01.json | Fall 1 wurde geschlossen. |
| 1 / `erf_fall_2` | Zweite Ablage | `case_02_closed` | vorhandene Flags: src/data/case_02.json | Fall 2 wurde geschlossen. |
| 2 / `erf_fall_3` | Dritte Ablage | `case_03_closed` | vorhandene Flags: src/data/case_03.json | Fall 3 wurde geschlossen. |
| 3 / `erf_fall_4` | Vierte Ablage | `case_04_closed` | vorhandene Flags: src/data/case_04.json | Fall 4 wurde geschlossen. |
| 4 / `erf_fall_5` | Fünfte Ablage | `case_05_closed` | vorhandene Flags: src/data/case_05.json | Fall 5 wurde geschlossen. |
| 5 / `erf_fall_6` | Sechste Ablage | `case_06_closed` | vorhandene Flags: src/data/case_06.json | Fall 6 wurde geschlossen. |
| 6 / `erf_fall_7` | Siebte Ablage | `case_07_closed` | vorhandene Flags: src/data/case_07.json | Fall 7 wurde geschlossen. |
| 7 / `erf_fall_8` | Achte Ablage | `case_08_closed` | vorhandene Flags: src/data/case_08.json | Fall 8 wurde geschlossen. |
| 8 / `erf_fall_9` | Neunte Ablage | `case_09_closed` | vorhandene Flags: src/data/case_09.json | Fall 9 wurde geschlossen. |
| 9 / `erf_kapitel_2` | Akte Wexmoor | `kapitel2_done` | vorhandene Flags: src/data/wexmoor.json | Nach verbindlichem Kapitelabschluss einmal setzen; Kapitel 6 benötigt Paket CT. |
| 10 / `erf_kapitel_3` | Akte Dunscar | `kapitel3_done` | vorhandene Flags: src/data/packs/k3_akte/case.json | Nach verbindlichem Kapitelabschluss einmal setzen; Kapitel 6 benötigt Paket CT. |
| 11 / `erf_kapitel_4` | Akte Calderwick | `kapitel4_done` | vorhandene Flags: src/data/packs/k4_akte/case.json | Nach verbindlichem Kapitelabschluss einmal setzen; Kapitel 6 benötigt Paket CT. |
| 12 / `erf_kapitel_5` | Akte Briarholt | `kapitel5_done` | vorhandene Flags: src/data/packs/k5_akte/case.json | Nach verbindlichem Kapitelabschluss einmal setzen; Kapitel 6 benötigt Paket CT. |
| 13 / `erf_kapitel_6` | Akte Varrowmouth | `dl_kapitel_6 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Nach verbindlichem Kapitelabschluss einmal setzen; Kapitel 6 benötigt Paket CT. |
| 14 / `erf_vier_enden` | Vier Ausfertigungen | `dl_enden_eines_kapitels ≥ 4` | Zähler-Vorschlag: src/data/wexmoor.json; src/data/packs/k3_akte/case.json; src/data/packs/k4_akte/case.json; src/data/packs/k5_akte/case.json | Profilweit: maximale Anzahl verschiedener kanonischer Ending-IDs eines einzelnen Kapitels, nicht vier Kapitel zusammen; Save-Import und Reload idempotent. |
| 15 / `erf_irrtum_berichtigt` | Berichtigter Vermerk | `c7_wrong UND case_08_closed UND wren_arrested` | vorhandene Flags: src/data/case_07.json; src/data/case_08.json | UND aller drei Flags; wren_arrested schließt c8_piper als alleinigen Abschluss aus. |
| 16 / `erf_sequenz_8` | Stufe 8 vermerkt | `dl_sequenz_8 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 8; Migration pathway.seq <= 8. |
| 17 / `erf_sequenz_7` | Stufe 7 vermerkt | `dl_sequenz_7 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 7; Migration pathway.seq <= 7. |
| 18 / `erf_sequenz_6` | Stufe 6 vermerkt | `dl_sequenz_6 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 6; Migration pathway.seq <= 6. |
| 19 / `erf_sequenz_5` | Stufe 5 vermerkt | `dl_sequenz_5 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 5; Migration pathway.seq <= 5. |
| 20 / `erf_sequenz_4` | Stufe 4 vermerkt | `dl_sequenz_4 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 4; Migration pathway.seq <= 4. |
| 21 / `erf_sequenz_3` | Stufe 3 vermerkt | `dl_sequenz_3 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 3; Migration pathway.seq <= 3. |
| 22 / `erf_sequenz_2` | Stufe 2 vermerkt | `dl_sequenz_2 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 2; Migration pathway.seq <= 2. |
| 23 / `erf_sequenz_1` | Stufe 1 vermerkt | `dl_sequenz_1 ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.seq); src/data/packs/sequenzen/seq_4_bis_1.json | Pro Spieler historischer Bool-Zähler: bei tatsächlich vollzogenem Trinken von Sequenz 1; Migration pathway.seq <= 1. |
| 24 / `erf_kreaturform` | Abweichende Gestalt | `dl_kreaturform ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js | Erste tatsächlich aktivierte Kreaturform, nicht bloße Freischaltung. |
| 25 / `erf_halb_verdaut` | Ruhiger Befund | `dl_halb_verdaut ≥ 1` | Zähler-Vorschlag: src/core/Pathways.js (pathway.digestion) | Pro Spieler und getrunkenem Trank: digestion >= 50 bei null Kontrollverlusten seit dessen Einnahme; danach dauerhaft merken. |
| 26 / `erf_verzicht` | Unbenutztes Glas | `dl_verzicht ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Nur bestätigtes Verzicht-Ende aus DD; kein Menüabbruch. |
| 27 / `erf_zehn_pfade` | Zehn Handschriften | `dl_pfade_profil ≥ 10` | Zähler-Vorschlag: src/data/pathways.json; src/data/packs/sequenzen/neue_pfade.json | Profilweite Menge der zehn kanonischen Pfad-IDs nach erstem Trank; zählt verschiedene IDs, nicht Save-Dateien. |
| 28 / `erf_zirkel_waage` | Stille Aufnahme | `treffen_waage` | vorhandene Flags: src/data/treffen.json | Die Mitgliedschaft wurde in das betreffende Zirkelbuch eingetragen. |
| 29 / `erf_zirkel_kreide` | Geschlossener Kreidekreis | `treffen_kreide` | vorhandene Flags: src/data/treffen.json | Die Mitgliedschaft wurde in das betreffende Zirkelbuch eingetragen. |
| 30 / `erf_zirkel_russ` | Ruß am Ärmel | `treffen_russ` | vorhandene Flags: src/data/treffen.json | Die Mitgliedschaft wurde in das betreffende Zirkelbuch eingetragen. |
| 31 / `erf_zirkel_lichtlose` | Lichtlose Gesellschaft | `treffen_lichtlose` | vorhandene Flags: src/data/treffen.json | Die Mitgliedschaft wurde in das betreffende Zirkelbuch eingetragen. |
| 32 / `erf_zirkel_salz` | Salz im Register | `treffen_salz` | vorhandene Flags: src/data/treffen.json | Die Mitgliedschaft wurde in das betreffende Zirkelbuch eingetragen. |
| 33 / `erf_zirkel_schichtbund` | Eingetragene Schicht | `treffen_schichtbund` | vorhandene Flags: src/data/packs/k3_handel/treffen_schichtbund.json | Die Mitgliedschaft wurde in das betreffende Zirkelbuch eingetragen. |
| 34 / `erf_zwei_zirkel` | Doppelte Zugehörigkeit | `dl_zwei_zirkel ≥ 2` | Zähler-Vorschlag: src/data/treffen.json; src/data/packs/k3_handel/treffen_schichtbund.json | Maximum gleichzeitig aktiver Mitgliedschaften; Menge der sechs member_flag aus den Zirkeldefinitionen. |
| 35 / `erf_fuenf_freunde` | Fünf gute Aussagen | `dl_fuenf_freunde ≥ 5` | Zähler-Vorschlag: src/data/beziehungen.json; src/core/Relations.js | Maximum verschiedener Figuren gleichzeitig mit Beziehung >= +5; keine Summierung wiederholter Begegnungen. |
| 36 / `erf_drei_feinde` | Drei Vorbehalte | `dl_drei_feinde ≥ 3` | Zähler-Vorschlag: src/data/beziehungen.json; src/core/Relations.js | Maximum verschiedener Figuren mit Relation <= feindselig_ab (aktuell -2), gleichzeitig. |
| 37 / `erf_geschenk_abgelehnt` | Annahme verweigert | `dl_geschenk_abgelehnt ≥ 1` | Zähler-Vorschlag: src/core/Relations.js | Nur tatsächliche Ablehnung nach Angebot; Vorschau und eigener Abbruch zählen nicht. |
| 38 / `erf_fasserin_bilanz` | Gemischte Auftragslage | `dl_fasserin_bilanz ≥ 2` | Zähler-Vorschlag: docs/art/codex_CR_fasserin_auftrag_texte.md | Menge unterschiedlicher terminaler Auftragsergebnisse {erfolgreich, misslungen} aus CR; Abbruch nur wenn CR ihn als misslungen wertet. |
| 39 / `erf_buerge` | Zweite Unterschrift | `dl_buerge ≥ 1` | Zähler-Vorschlag: src/data/packs/k4_akte/dialog_zusaetze.json | Einmal bei cwa_wetherby_buerge ODER cwa_kuechenbuerge; nicht bloß Bekanntschaft. |
| 40 / `erf_lesestuecke_stadt` | Vollständige Stadtlektüre | `dl_lesestuecke_stadt ≥ 1` | Zähler-Vorschlag: src/data/packs/lore/lesestuecke.json | Mindestens eine Stadt mit vollständig gelesener, nicht leerer Liste kanonischer Lesestück-IDs; Lesen statt Besitz. |
| 41 / `erf_lesestuecke_alle` | Sechs volle Register | `dl_lesestuecke_alle ≥ 6` | Zähler-Vorschlag: src/data/packs/lore/lesestuecke.json | Menge vollständig gelesener Stadtarchive nach demselben Katalog wie lesestuecke_stadt; sechs feste Stadt-IDs. |
| 42 / `erf_bestiarium_kettlegate` | Bestandsbuch Kettlegate | `dl_bestiarium_kettlegate ≥ 1` | Zähler-Vorschlag: src/data/packs/lore/bestiarium.json; spätere Stadtkataloge ergänzen | Alle kanonischen Einträge der nicht leeren Stadtliste kettlegate freigeschaltet; Varianten nur nach Katalog, keine bloße Kill-Zahl. |
| 43 / `erf_bestiarium_wexmoor` | Bestandsbuch Wexmoor | `dl_bestiarium_wexmoor ≥ 1` | Zähler-Vorschlag: src/data/packs/lore/bestiarium.json; spätere Stadtkataloge ergänzen | Alle kanonischen Einträge der nicht leeren Stadtliste wexmoor freigeschaltet; Varianten nur nach Katalog, keine bloße Kill-Zahl. |
| 44 / `erf_bestiarium_dunscar` | Bestandsbuch Dunscar | `dl_bestiarium_dunscar ≥ 1` | Zähler-Vorschlag: src/data/packs/lore/bestiarium.json; spätere Stadtkataloge ergänzen | Alle kanonischen Einträge der nicht leeren Stadtliste dunscar freigeschaltet; Varianten nur nach Katalog, keine bloße Kill-Zahl. |
| 45 / `erf_bestiarium_calderwick` | Bestandsbuch Calderwick | `dl_bestiarium_calderwick ≥ 1` | Zähler-Vorschlag: src/data/packs/lore/bestiarium.json; spätere Stadtkataloge ergänzen | Alle kanonischen Einträge der nicht leeren Stadtliste calderwick freigeschaltet; Varianten nur nach Katalog, keine bloße Kill-Zahl. |
| 46 / `erf_bestiarium_briarholt` | Bestandsbuch Briarholt | `dl_bestiarium_briarholt ≥ 1` | Zähler-Vorschlag: src/data/packs/lore/bestiarium.json; spätere Stadtkataloge ergänzen | Alle kanonischen Einträge der nicht leeren Stadtliste briarholt freigeschaltet; Varianten nur nach Katalog, keine bloße Kill-Zahl. |
| 47 / `erf_bestiarium_varrowmouth` | Bestandsbuch Varrowmouth | `dl_bestiarium_varrowmouth ≥ 1` | Zähler-Vorschlag: src/data/packs/lore/bestiarium.json; spätere Stadtkataloge ergänzen | Alle kanonischen Einträge der nicht leeren Stadtliste varrowmouth freigeschaltet; Varianten nur nach Katalog, keine bloße Kill-Zahl. |
| 48 / `erf_benannte_gegner` | Zehn bekannte Namen | `dl_benannte_gegner ≥ 10` | Zähler-Vorschlag: Paket DJ | Zehn verschiedene benannte Gegner-IDs aus DJ; Respawns nicht erneut zählen. |
| 49 / `erf_auktion` | Eigener Zuschlag | `dl_auktion ≥ 1` | Zähler-Vorschlag: Paket DE | Abgeschlossener, bezahlter Kauf aus DE; Salzmarkt- und Zirkelauktion ausgeschlossen. |
| 50 / `erf_tier` | Vertraute Schritte | `dl_tier ≥ 3` | Zähler-Vorschlag: Paket DF | Höchste erreichte Gefährtenstufe eines eigenen Tiers. |
| 51 / `erf_haus` | Kein freier Platz | `dl_haus ≥ 1` | Zähler-Vorschlag: Paket DG | Alle Pflichtslots in vier Räumen laut DG gleichzeitig belegt; keine optionalen Erweiterungen zählen. |
| 52 / `erf_nebelseiten` | Sechs andere Straßen | `dl_nebelseiten ≥ 6` | Zähler-Vorschlag: Paket DH | Menge verschiedener Stadt-IDs mit tatsächlich betretenem Nebelseitengebiet. |
| 53 / `erf_briefe` | Fünfzig Sendungen | `zaehler_briefe ≥ 50` | Zähler-Vorschlag: Paket DI | Verschiedene Brief-IDs nach Öffnen der Leseansicht; Duplikate und Reloads zählen nicht. |
| 54 / `erf_fest` | Anwesenheit vermerkt | `dl_feste ≥ 1` | Zähler-Vorschlag: src/data/packs/feste | Verschiedene Fest-IDs nach Teilnahme vor Ort bei aktivem Fest, nicht Kalenderansicht. |
| 55 / `erf_drei_feste` | Dreimal anwesend | `dl_feste ≥ 3` | Zähler-Vorschlag: src/data/packs/feste | Derselbe Zähler wie fest; verschiedene kanonische Fest-IDs. |
| 56 / `erf_boss_unberuehrt_1` | Unversehrte Akte 1 | `dl_boss_unberuehrt_1 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Sieg über einen als Boss katalogisierten Gegner in Kapitel 1; null bestätigte feindliche Treffer auf eigene Figur, auch bei Absorption, über sämtliche Phasen. Ausweichen zählt nicht als Treffer; eigene HP-Kosten zählen nicht. Kein Sieg durch Flucht. |
| 57 / `erf_boss_unberuehrt_2` | Unversehrte Akte 2 | `dl_boss_unberuehrt_2 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Sieg über einen als Boss katalogisierten Gegner in Kapitel 2; null bestätigte feindliche Treffer auf eigene Figur, auch bei Absorption, über sämtliche Phasen. Ausweichen zählt nicht als Treffer; eigene HP-Kosten zählen nicht. Kein Sieg durch Flucht. |
| 58 / `erf_boss_unberuehrt_3` | Unversehrte Akte 3 | `dl_boss_unberuehrt_3 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Sieg über einen als Boss katalogisierten Gegner in Kapitel 3; null bestätigte feindliche Treffer auf eigene Figur, auch bei Absorption, über sämtliche Phasen. Ausweichen zählt nicht als Treffer; eigene HP-Kosten zählen nicht. Kein Sieg durch Flucht. |
| 59 / `erf_boss_unberuehrt_4` | Unversehrte Akte 4 | `dl_boss_unberuehrt_4 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Sieg über einen als Boss katalogisierten Gegner in Kapitel 4; null bestätigte feindliche Treffer auf eigene Figur, auch bei Absorption, über sämtliche Phasen. Ausweichen zählt nicht als Treffer; eigene HP-Kosten zählen nicht. Kein Sieg durch Flucht. |
| 60 / `erf_boss_unberuehrt_5` | Unversehrte Akte 5 | `dl_boss_unberuehrt_5 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Sieg über einen als Boss katalogisierten Gegner in Kapitel 5; null bestätigte feindliche Treffer auf eigene Figur, auch bei Absorption, über sämtliche Phasen. Ausweichen zählt nicht als Treffer; eigene HP-Kosten zählen nicht. Kein Sieg durch Flucht. |
| 61 / `erf_boss_unberuehrt_6` | Unversehrte Akte 6 | `dl_boss_unberuehrt_6 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Sieg über einen als Boss katalogisierten Gegner in Kapitel 6; null bestätigte feindliche Treffer auf eigene Figur, auch bei Absorption, über sämtliche Phasen. Ausweichen zählt nicht als Treffer; eigene HP-Kosten zählen nicht. Kein Sieg durch Flucht. |
| 62 / `erf_nur_nerven` | Nerven zu Protokoll | `dl_nur_nerven ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Sieg mit mindestens einer aktiven Aktion; alle eigenen aktiven Aktionen als Nerven-Fähigkeit katalogisiert, keine Angriffe, Gegenstände, Flucht oder Begleiterangriffe; passive Effekte erlaubt. |
| 63 / `erf_grauspaeher_flucht` | Nicht mehr anwesend | `dl_grauspaeher_flucht ≥ 1` | Zähler-Vorschlag: src/data/wexmoor.json (wx_grauspaeher_fight) | Bestätigter erfolgreicher Fluchtausgang aus wx_grauspaeher_fight, nicht Dialogvermeidung. |
| 64 / `erf_grauspaeher_sieg` | Grauer Abschluss | `k2_grauspaeher_besiegt` | vorhandene Flags: src/data/wexmoor.json | Der Grauspäher wurde besiegt. |
| 65 / `erf_hundert_kaempfe` | Hundert Gefechtsakten | `zaehler_kaempfe ≥ 100` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Terminale reguläre Kämpfe (Sieg/Niederlage/erfolgreiche Flucht), eindeutige Kampf-Instanz; keine Trainingskämpfe, Abbrüche oder Reload-Duplikate. |
| 66 / `erf_friedliche_stadt` | Unbeschriebenes Gefechtsblatt | `dl_friedliche_stadt ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Stadtkapitel tatsächlich beendet bei null Kampfeintritten seit erstmaliger Ankunft; Zähler-Latch erst am Abschluss, nie bei Ankunft. Nur Städte mit gültigem kampffreiem Hauptweg aktivieren; bis Einbauprüfung nicht erreichbar markieren. |
| 67 / `erf_starling_fuenf` | Kurzer Nachtrag | `dl_starling_fuenf ≥ 1` | Zähler-Vorschlag: docs/art/codex_BS_starling_phase2_grafik.md; src/data/case_09.json | Sieg zweite Phase BS bei Phasen-Rundenzahl <= 5; Eintritt startet Runde 1, ganze Initiativerunde zählt, keine Aktionszählung. |
| 68 / `erf_koop_pfade` | Zwei Wege mit Begleitung | `dl_koop_pfade ≥ 1` | Zähler-Vorschlag: src/data/packs/koop; Paket DF | Einmal setzen, wenn zwei aktive menschliche Spieler zugleich unterschiedliche nicht leere Pfad-IDs UND unterschiedliche eigene Tier-IDs haben; NPCs zählen nicht. |
| 69 / `erf_koop_kapitel_1` | Gemeinsame Akte 1 | `dl_koop_kapitel_1 ≥ 1` | Zähler-Vorschlag: src/data/packs/koop | Regulärer Kampf in Kapitel 1 mit zwei aktiven menschlichen Teilnehmern gewonnen; keiner während dieses Kampfes besiegt/außer Gefecht, auch nicht nach Wiederbelebung. Beide erhalten den Eintrag. |
| 70 / `erf_koop_kapitel_2` | Gemeinsame Akte 2 | `dl_koop_kapitel_2 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Regulärer Kampf in Kapitel 2 mit zwei aktiven menschlichen Teilnehmern gewonnen; keiner während dieses Kampfes besiegt/außer Gefecht, auch nicht nach Wiederbelebung. Beide erhalten den Eintrag. |
| 71 / `erf_koop_kapitel_3` | Gemeinsame Akte 3 | `dl_koop_kapitel_3 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Regulärer Kampf in Kapitel 3 mit zwei aktiven menschlichen Teilnehmern gewonnen; keiner während dieses Kampfes besiegt/außer Gefecht, auch nicht nach Wiederbelebung. Beide erhalten den Eintrag. |
| 72 / `erf_koop_kapitel_4` | Gemeinsame Akte 4 | `dl_koop_kapitel_4 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Regulärer Kampf in Kapitel 4 mit zwei aktiven menschlichen Teilnehmern gewonnen; keiner während dieses Kampfes besiegt/außer Gefecht, auch nicht nach Wiederbelebung. Beide erhalten den Eintrag. |
| 73 / `erf_koop_kapitel_5` | Gemeinsame Akte 5 | `dl_koop_kapitel_5 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Regulärer Kampf in Kapitel 5 mit zwei aktiven menschlichen Teilnehmern gewonnen; keiner während dieses Kampfes besiegt/außer Gefecht, auch nicht nach Wiederbelebung. Beide erhalten den Eintrag. |
| 74 / `erf_koop_kapitel_6` | Gemeinsame Akte 6 | `dl_koop_kapitel_6 ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Regulärer Kampf in Kapitel 6 mit zwei aktiven menschlichen Teilnehmern gewonnen; keiner während dieses Kampfes besiegt/außer Gefecht, auch nicht nach Wiederbelebung. Beide erhalten den Eintrag. |
| 75 / `erf_register_geteilt` | Gemeinsame Niederschrift | `dl_register_geteilt ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Finaleentscheidung Register teilen nach Bestätigung beider Spieler (CT/DD); bloßes Öffnen des Registers zählt nicht. |
| 76 / `erf_alle_betten` | Überall zu Gast | `dl_alle_betten ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Set der Häuser-IDs mit abgeschlossener Schlafaktion gegen versionierte vollständige Wohnhausliste aller sechs Städte prüfen; Gasthäuser nur wenn als Wohnhaus katalogisiert, keine unbetretbaren Kulissen. |
| 77 / `erf_schlick` | Tausend nasse Schritte | `zaehler_schritte_schlick ≥ 1000` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Je tatsächlich betretenem Schlick-Tile ein Schritt; kein Stillstand, Teleport oder blockierter Bewegungsversuch; spielerbezogen. |
| 78 / `erf_nell` | Namen abgewischt | `dl_nell ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Nur abgeschlossenes gemeinsames Namenswischen mit Nell aus Kapitel 6; konkretes Event im Einbau an CX/CT binden. |
| 79 / `erf_letztes_glas` | Glas stehen gelassen | `dl_letztes_glas ≥ 1` | Zähler-Vorschlag: Noch nicht im gelesenen Quellstand vorhanden; Einbauvertrag DL. | Finalen abgeschlossenen Ausgang ohne letzten Trank erfassen; weder Save-Ende noch Dialogabbruch. Falls DD-Verzicht identischer Ausgang: beide Erfolge bewusst gemeinsam auslösen. |

## Prüfung

```sh
node docs/story/erfolge/pruefen.mjs
python tools/art/erfolge/check.py
```

Textprüfung: 80 IDs, Gruppenstärken, Namenslänge, Ein-Satz-Texte, Schema, belegte Flagquellen, alle vorgeschlagenen Zähler mit Regel, Meldungszahlen und Atlasindex. Pillow-Prüfung: exakt 8 PNGs, Maße, gemeinsame Palette ≤32 sichtbare Farben, binäres Alpha, saubere transparente Pixel, 80 belegte und unterschiedliche Zellen, freie Zellränder, identische Silhouetten offen/erfüllt, 1px-Lichtkante, exakte 2x-Skalierung, Animationsframes und Regionen innerhalb der Bildgrenzen. Rasterprüfung beweist Integer-Zellen und NN-Skalierung, nicht die semantische Richtigkeit eines Motivs; diese wurde anhand der Vorschau visuell geprüft.

Die Prompts und Quellbild-Hashes stehen in `docs/art/batch-erfolge-generation.json`. `export.py` beschreibt die Nachbearbeitung; dessen lokale Generator-Eingaben werden nicht als Spielassets ausgeliefert. Generator: eingebautes image_gen, keine API-CLI. Export braucht Pillow, NumPy und SciPy; die unabhängige Abnahme braucht nur Pillow und Node. Ergebnisse stehen in `docs/art/batch-erfolge-validation.json` und `docs/art/batch-erfolge-validation-text.txt`.
