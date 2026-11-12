# CP – Halbgott und Engel

Daten- und Textlieferung für zehn Pfade, Sequenzen 4, 3 und 2. Kein Spielcode geändert, keine automatische Registrierung. Grafik-Partner ist CO. Feste Form-, Ritual- und Wächter-IDs entsprechen dem Auftrag `docs/art/codex_CP_halbgott_texte.md`.

## Dateien

| Datei | Inhalt |
|---|---|
| `trinktexte.json` | 30 Einträge: Trinken, Ankunft, erste Nacht, Pfadkartensatz |
| `kreaturform.json` | 10 Formen mit Sperrmeldung, Wechsel, Warnung, Koop-Sicht |
| `furcht.json` | 9 Klassen, 8 Folgen, 12 geprüfte Figuren-Ausnahmen |
| `rituale.json` | 20 persönliche Prüfungen, Vorbereitung, Opferzutaten, friedlicher Weg |
| `encounters.json` | 2 Wächter mit je 3 Phasen und 1 leerer Umriss |
| `dialogues.json` | 2 Bäume mit je 15 Knoten, je 10 Pfadfrage-Sätze mit 3 Fragen und Antworten |
| `bestiarium.json` | 2 Wächtertexte und ihre Schwächen |
| `zeitung.json` | 12 Meldungen mit vorhandenen Zeitungsschlüsseln |
| `gerede.json` | 60 Zeilen insgesamt: je 12 für die 5 Städte, je 4 pro Entwicklungsstand |
| `lesestuecke.json` | 10 Stücke mit jeweils 120–200 Wörtern und Platzierungsvorschlag |
| `koop.json` | 20 Geplauder-, 6 Kampf- und 4 Tragezeilen, beide Spielerrichtungen |
| `pruefen.mjs` | Paketprüfung ohne externe Node-Pakete, inklusive Wortzahlen und Quellenabgleich |

Die missverständliche Mengenangabe „60 Zeilen je Stadt-Gruppe … je 12“ wird als **60 insgesamt, 5 × 12** umgesetzt.

## Ortsfreiheit und Vorbereitung

Die bereits gewünschte Ortsfreiheit der Aufstiegsrituale bleibt erhalten. `map` benennt die inszenierte Arena bzw. den Herkunftsschauplatz, `ort_bindend: false` ist verbindlich. Keine neue `currentMap === ritual.map`-Sperre einbauen. Der Start ist an jedem sicheren Ritualzugang möglich; nach der separaten Probe geht es zum gespeicherten Ausgangspunkt zurück. `ds_schwellenring` existiert, `hg_grenzbezirk` ist der im Auftrag erlaubte neue Schauplatz. `hg_rand` ist ein einzubauender Spawn am Arenarand, keine bestehende Kartenbehauptung.

Vorbereitungen dürfen auf der Reise erledigt und später abgerufen werden. Heddas Befragung kann als gespeicherte Antwort aus Dunscar verwendet werden. Wer sie verpasst hat, erhält dieselbe vorbereitende Frage als mitgeführte Abschrift am Ritualzugang; es wird keine Rückreise nach Dunscar erzwungen. Abend bzw. Morgengrauen darf über bewusstes Warten am sicheren Zugang erreicht werden. Das fremde Tagebuch ersetzt nicht die eigene Antwort. Nur Zutaten und bestätigte Vorbereitung zählen, nicht bloß der Besitz des Textes.

## Quellen und Format

Namen und Zutaten kommen aus `src/data/packs/sequenzen/seq_4_bis_1.json` und `neue_pfade.json`. `consumes` entspricht exakt den **Rezeptzutaten der Zielstufe**; es ersetzt nicht stillschweigend die bisherige, kleinere Ritual-Abgabe. Der Einbau muss den neuen Preis bewusst übernehmen. Ritualopfer und späteres Brauen sind zwei ausdrücklich getrennte Kosten. Der Prüfling sieht beide Kosten vor Bestätigung. Trinken wird erst nach persönlicher Ritualfreigabe angeboten. Keine bestehende Verdauungsrate oder Stufen-Passive ändern.

Grundfelder der Kämpfe (`name`, `hp`, `attacks`, `hits`, `lose_to`, `on_win`) orientieren sich an `k3_pruefungen/encounters.json`. Phasen, Siegel, Kopie und persönliche Effekte sind **neue, hier spezifizierte Anschlussfelder**, kein bereits unterstütztes Laufzeitformat. Insbesondere sind `min_seq`, `phases` und `koop_rules` nicht blind in bestehende Kämpfe zu laden. Kleinere Sequenzzahlen bedeuten höhere Stärke; die Ritualzulassung verlangt exakt die Vorstufe 5 bzw. 3.

Die Dialoge verwenden die im CP-Auftrag verlangten `options`, `effects`, `requires`; bestehende Laufzeitdialoge verwenden dagegen meist `choices` und flache Effekte. Beim Einbau müssen sie übersetzt werden. `je_pfad` und `antwort_je_pfad` werden vor Anzeige auf den handelnden Spieler aufgelöst. Die generische Knopfzeile dient nur als Rückfalltext, nicht als Ersatz für die persönliche Antwort. `requires` gilt vollständig und wird direkt vor den Effekten nochmals geprüft. Phase- und Ergebnisknoten sind nur durch passende Kampfereignisse erreichbar, nicht durch freie Dialogwahl.

Gerede folgt der vorhandenen Verschachtelung Stadt → Karten-ID → Zeilen mit `requires_flags`/`hide_if_flags`. Die Lesestücke sind eine Lieferung von Texten mit Kartenwunsch; ihre konkreten Interaktionspositionen und die neue Arena baut der Einbau ein. Bekannte Figuren-IDs sind aus den vorhandenen Daten geprüft, einschließlich Starling als `lichtmann`; nur bei lebender, tatsächlich anwesender Figur anzeigen. Die zwölf Ausnahmen ersetzen die Klassenreaktion. Bosse und Gegner ab Sequenz 4 bleiben immer furchtimmun.

## Persönlicher Fortschritt und Ereignisse

| Anschluss | Auslösung und Geltung |
|---|---|
| `seq4_erreicht` | Nach erfolgreich getrunkenem Seq-4-Trank; öffentliches Weltwissen, mindestens ein Spieler |
| `seq2_erreicht` | Entsprechend nach Seq 2; öffentliche Meldung, kein persönlicher Formnachweis |
| `kreaturform_an` | Abgeleitet: mindestens ein Spieler in Form; persönliche Aktivität separat speichern |
| `hg_ritual_<pfad>_<seq>_bereit` | Drei Vorbereitungen persönlich erledigt, beim Versuch verbraucht |
| `hg_ritual_<pfad>_<seq>` | Persönliche, dauerhafte Freigabe nach eigener bestandener Probe |
| `hg_<waechter>_bekannt` | Konkret `hg_schwellenwaechter_bekannt` / `hg_grenzwaechter_bekannt`, nach Sieg oder friedlichem Abschluss |
| `hg_form_oeffentlich` | Erste gezählte öffentliche Erscheinung |
| `kreaturform_gezeigt_3` | Dritte gezählte öffentliche Erscheinung; Zähler persistent |
| `hg_sekten_form_gesehen` | Kultzeugen bei einer öffentlichen Erscheinung |
| `hg_hilfe_moeglich` | Lokales, einmaliges Hilfsangebot nach Ohnmacht |
| `hg_in_<stadt>` | Abgeleitet aus aktueller Stadt; vorherige Stadt zurücksetzen |
| `form_annehmen` / `form_ablegen` | Akteur, Pfad, Form-ID, Position, eindeutige Ereignis-ID |
| `furcht` | Zeugenliste, Reaktionsklasse, lokale Folgen; pro Zeuge/Ereignis nur einmal |

Stadtwerte: `kettlegate`, `wexmoor`, `dunscar`, `calderwick`, `briarholt`. Öffentliche Flags dienen Meldungen; sie dürfen nie den persönlichen Aufstieg des Partners freigeben. Verdauung für die Form wird als dauerhaft erreichte Seq-4-Schwelle gespeichert: ein neuer Seq-3-Trank mit 0 Prozent sperrt eine bereits gelernte Form nicht wieder. Ein Spieltag Formverzicht sperrt sie dagegen bis zum gespeicherten Spielzeitpunkt. `erste_nacht` einmal je Spieler/Pfad/Stufe nach dem nächsten Schlaf anzeigen, auch über Laden hinweg.

### Versuchstransaktion

1. Persönliche Vorstufe, Verdauung, Vorbereitung, Opferzutaten und sichere Umgebung prüfen; Preis und Niederlage vor Bestätigung zeigen.
2. Eindeutige Versuch-ID anlegen, Rückkehrpunkt sichern, Zutaten genau einmal abbuchen und Vorbereitung verbrauchen. Vor dem bestätigten Versuch kostet Gehen nichts.
3. Kampf oder friedliche Antworten ausführen. Die Frageoptionen beziehen sich auf die persönliche Pfadantwort. Ohne Hilfe heißt: keine Antwort und kein Gegenstand des anderen Spielers ersetzt die eigene Prüfung.
4. Sieg: persönliches Siegel muss mindestens einmal gültig getroffen haben. Friedlich: eigene Bedingungen neu prüfen, denselben Zutatenpreis abbuchen und einen Spieltag Formverzicht setzen. Ergebnis mit Versuch-ID idempotent speichern; Dialog und Kampf dürfen es nicht doppelt vergeben.
5. Niederlage oder Flucht: keine Freigabe, keine Beute, keine Erstattung. Bei Ohnmacht mit 25 Prozent Leben und Nerven am Rand erwachen, danach sicher zum Ausgang zurück. Kein Game Over. Vorbereitung und Zutaten für Wiederholung neu beschaffen; bestehende dauerhafte Erfolge bleiben erhalten.

Friedlich ist kein Gratisweg: vollständig verdaute Vorstufe, alle Vorbereitungen, keine Tränke in **beiden** Rucksäcken, drei eigene Antworten ohne Unterstützung, gleiche Opferzutaten und ein ganzer Spieltag ohne Kreaturform. Tränke dürfen vorher sicher eingelagert werden. Bereits gebrauter Zieltrank muss vor der friedlichen Prüfung ebenfalls eingelagert werden. Im Kampf sind Vorräte und Unterstützung erlaubt. Der Verzicht ist zusätzlich, auch wenn die Form für einen Seq-5-Spieler noch nicht nutzbar ist; die Sperre läuft in Spielzeit weiter.

## Kampfvertrag und vorgeschlagene Balance

Schwellenwächter: 520 Leben, Vorstufe 5. Grenzwächter: 1400 Leben, Vorstufe 3. Umriss: 300 Leben. Das sind **Balancing-Vorschläge**, keine durch eine neue Kampfsimulation bestätigte Gewinnquote. K3-Prüfgegner mit 170–220 Leben dienen als Größenvergleich. Es werden keine vorhandenen Schadenssprünge ersetzt.

- Prüfung: genau ein angekündigter Gegenschlag pro direkt schadender Spieleraktion, nicht pro Treffer und nicht durch Folgeschaden. Heilung und Warten provozieren ihn nicht.
- Zorn ab höchstens 60 Prozent Leben: Welle und Einzelschlag abwechselnd. Welle trifft beide Spieler und senkt Nerven. `damage` gilt je Treffer in `hits`, `nerves_loss` einmal je Wellenaktion, Nerven mindestens null. Trefferzeiten sind Millisekunden.
- Schwelle ab höchstens 25 Prozent: Eintritt öffnet sofort ein Fenster. Jeder berechtigte Spieler hat einen eigenen Zug. Danach alle zwei Wächterzüge wieder öffnen. Nur ein gültiger Siegelschlag je Spieler/Fenster; Verlängerungen erlauben normale Folgeaktionen. Kein Gegenschlag während des Fensters.
- Ein gültiger Siegelschlag verursacht 8 Prozent maximales Wächterleben, umgeht die Grunddeckung und verhindert die Heilung **dieses** Fensters. Ohne Treffer heilt der Wächter 15 Prozent seiner maximalen Leben, höchstens bis zum Maximum. Phasen bleiben eingerastet; Heilung geht nicht zurück nach Zorn. Das vermeidet ein unerreichbares Wiederholungsfenster.
- Siegeleffekte sind in jedem Wächter enthalten, samt Einheit, Dauer und Stapelregel. `maske` vermindert die Grunddeckung von 25 Prozent um 25 Prozentpunkte für einen Treffer; kein negativer Wert. Heilungshemmende Siegel betreffen das nächste später verfehlte Fenster, weil das aktuelle bereits durch den Treffer geheilt-frei bleibt. Alle Modifikationen enden spätestens mit dem Versuch.
- Kontrollverlust wird auf höchstens einen aufeinanderfolgenden übersprungenen Wächterzug begrenzt; darauf folgt ein immuner Zug. Das verhindert endlose Betäubung durch beliebige Pfadkombinationen.
- Grenzwächter beschwört den Umriss genau einmal beim Eintritt in Phase 3. Die Kopie verwendet die letzte vollständig aufgelöste Kampffähigkeit des jeweiligen Akteurs, höchstens drei Treffer/36 Gesamtschaden und sechs Nervenverlust. Keine Ressourcen, Freigaben, Inventare, Beschwörungen oder Wiederbelebungen kopieren. Ohne geeignete Fähigkeit kommt der angekündigte Ersatzschlag. Beim Ende des Versuchs verschwindet der Umriss; sein eigener Tod gibt keine Ritualfreigabe.
- Koop: beide sind auf ihrer passenden Vorstufe; jeder opfert, antwortet und trifft mit dem eigenen Pfad. Wächterleben ×1,7, Schaden unverändert. Der Wächter prüft abwechselnd. Tragen eines gefallenen Partners beendet den Versuch ohne geteilten Erfolg. Es gibt keine Gegenstände, kein Geld und keine zusätzliche Farmbelohnung.

## Furcht und Folgen

Sekunden sind Spielzeit, Rundenmechanik bleibt getrennt. Mittelstarke Gegner verlieren genau ihren ersten Zug, nicht jeden Zug bei erneutem Anzeigen der Form. Schwache Gegner fliehen; Ohnmacht ist für Bürger/Polizei/Händler ausdrücklich nicht tödlich. Tiere fliehen. Ladenverschluss endet nach einem Spieltag und wird nicht durch erneutes Rendering verlängert.

Öffentliche Erscheinungen höchstens einmal pro Stadt und Spieltag zählen; wiederholtes Umschalten erzeugt keine Endlosschleife aus Ansehen und Zeitungen. Kult-Umtriebe höchstens einmal je Kult/Spieltag um eins erhöhen. Die Hilfe gibt einmal +1 Ansehen für denselben Vorfall zurück, niemals mehr als der zugehörige Polizeiverlust. Alle sichtbaren Betroffenen erhalten weiterhin ihre lokale Reaktion; die Begrenzung betrifft die wiederholbare globale Belohnung bzw. Strafe.

## Prüfung

Vom Repository-Stamm: `node docs/story/halbgott/pruefen.mjs`.
Die Ausgabe prüft Quellen, Mengen, IDs, Satz- und Wortgrenzen, Dialogziele, Phasen, Zutaten und Koop-Regeln. Reine Paketprüfung, kein Nachweis einer bereits eingebauten Spielfunktion. CO-Sheets werden über die festen IDs angeschlossen; konkrete Spritepfade nach dessen Manifest auflösen und nicht anhand dieser Daten erfinden.
