# BQ – Sekten in drei Städten

Der Aschenbund verbrennt Namen, die Flutkinder machen Rettungsseile zu Druckmitteln, der Stumme Chor missbraucht vertraute Stimmen. Jeder Kult wirkt in Kettlegate, Wexmoor und Dunscar. Dieses Paket enthält Daten und Texte; es ist **nicht eingebunden** und ändert keinen Spielcode.

## Umfang

| Inhalt | Anzahl |
|---|---:|
| Kulte | 3 |
| Ereignisse | 36, je Kult 12 |
| Einsatzkarten je Kult | 9, davon 3 in jeder Stadt |
| Verfügbare Karten bei Stufe 0 / 1 / 2 / 3 | 3 / 6 / 8 / 9 je Kult |
| Gegner | 12, davon 3 Haupt-Eliten mit je 2 beschriebenen Phasen |
| Neue Figuren | 9, je 8 Dialogknoten = 72 |
| Ketten | 3 mit je 5 Schritten durch alle drei Städte |
| Kleine Aufträge | 6 mit je 1 Schritt |
| Neue Ermittlungslesestellen | 12, höchstens eine pro Karte |
| Bestehende Dialoge ergänzt | 10 |
| Zeitung / Gerede | 36 Meldungen / 72 Zeilen |
| HUD / Notizbuch / Wegweiser | jeweils 12 |
| Koop-Geplauder | 12, zusätzlich 36 Ereigniszeilen |
| Gegenstände | 6 Beutestücke, 3 Gegenmaßnahmen, 3 Artefakte |
| Grafikbriefe | 33 Pflichtbriefe plus 6 für Gegenmaßnahmen und Artefakte |

Die drei Ketten benötigen geschätzt je 25–35 Minuten, kleine Aufträge je 4–8 Minuten. Ereignisse dauern meist 1–4 Minuten aktive Spielzeit; Wartefristen kommen separat hinzu. Insgesamt etwa 2–3 Stunden bei gezielter Auswahl, ohne Reise- und Wartezeiten. Alle Texte sind Deutsch; Bedienlabels maximal 140, Dialog- und Ereigniszeilen maximal 220 Zeichen.

## Dateien und Formate

- `kulte.json`: drei Kultdefinitionen, numerische Zustandsnamen und kumulative Ereignisfreigaben je Stufe. Die Vereinigung der Karten aller freigegebenen Ereignisse bestimmt die Reichweite.
- `ereignisse.json`: 36 redaktionelle Ereignisdefinitionen samt Dauer, Rückkehr, lokaler Wirkung, Gegenmaßnahme und Dialogverweisen. Diese Datei ist ein Vertrag für den späteren Ereignisplaner.
- `gegner.json`: `encounters` im tatsächlichen Kampfformat mit `attacks`, `loot` und `flees_after`; `items` im vorhandenen Itemformat. `profile` enthält getrennt Tier, Referenzangriff und die gewünschten `skills`-Phasen als Einbauvorgabe.
- `figuren.json`: `npcs` und `dialogues` sind bestehende Pack-Formate. `einsatz` ist ein Platzierungsvorschlag mit BR-Sheet-ID, `zeit`, `visible_if` und zusätzlichen Interaktionsrouten; Koordinaten werden erst beim Einbau bestimmt.
- `auftraege.json`: `quests` nutzt echte `steps[].done.requires_flags`, `target` und `reward`. `lesestellen` beschreibt zwölf einmalige Kartenobjekte. Die Rückkehr erfolgt am ersten Objekt, das nach Schritt 4 den Abschlussdialog öffnet. `artifacts.list` folgt dem bestehenden Segen-/Fluchschema, Quelle `sekten`.
- `dialog_zusaetze.json`: nur `choices_add` und `nodes_add`, keyed nach tatsächlichen Dialog-IDs. Pfiff heißt hier `k3a_pfiff`, Hedda `k3p_hedda`, Ruth `k3n_secondhaendler`.
- `texte.json`: zwölf Stufenblöcke, Koop-Geplauder, Ereignis- und Auftragsdialoge, Rezepte, Flag-Verzeichnis und überprüfbarer Einbauvertrag. Zeitungsmeldungen verwenden unveränderte Zeitungsfelder; die numerische Stufe wird dafür in genau ein Anzeigeflag gespiegelt.
- `grafik_briefe.md`: alle Figuren-, Gegner-, Zeichen-, Schrein- und Item-IDs für BR. Keine Grafikdatei erzeugt.

## Ablauf beim späteren Einbau

1. Alle drei Städte und sichere Rückreisen müssen zugänglich sein. Erst nach implementierten Schutzregeln `sk_freigegeben` setzen. Die Kulte öffnen selbst keine Kapitelroute.
2. Bei einem echten Kartenbesuch gegen `ereignisrate` würfeln, dann aus zulässigen Treffern höchstens ein Ereignis wählen. Keine Wiederholung beim Laden. Jede Ereignis-ID ist pro Spielstand einmalig; bereits erledigte Ereignisse sind ausgeschlossen.
3. `sk_asche_stufe`, `sk_flut_stufe`, `sk_chor_stufe` als Zahlen 0–3 separat speichern, niemals in das boolesche Flag-Set schreiben. `folge_stufe` genau einmal beim Start anwenden. Ein erfolgreicher Schreinabbau senkt zusätzlich genau einmal um 1; beide Änderungen werden auf 0–3 begrenzt.
4. Karten-, Zeit- und Figurenvoraussetzungen prüfen. Abwerbungen nie stapeln; betroffene Personen nach aktiver Rückholung, Frist, Hauptinteraktion oder Kapitelwechsel zurückbringen. Dabei originale Sichtbarkeit und Tagespläne wiederherstellen. Die zwei Abwerbungen eines Kults sind unabhängig; ein alter Questabschluss darf keine spätere Abwerbung automatisch erledigen.
5. Sabotage wirkt nur lokal, dauert 12 oder 18 Spielminuten und besitzt immer einen kostenlosen Lösungsdialog. Heiltränke: Faktor 0,5, mindestens ein Leben; öffentliche Hauptreisen bleiben frei. Reiseaufschlag höchstens 5 Schilling, bei Geldmangel 0. Keine globalen Nachtflags setzen.
6. Vor Verbrauch die Wahlbedingungen erneut prüfen. Nur bewusstes Herstellen/Einsetzen verbraucht neue Gegenmaßnahmen oder ihre Zutaten. Mitgehen kostet einmal 5 Nerven der ansprechenden Figur. Alle Kämpfe bieten einen freien Rückweg; Schreinwachen lassen sich auch ablenken. Keine Inventar- oder Geldstrafe bei Niederlage.
7. Auftragsgeld und Artefakte ausschließlich über `reward`/`complete_quests` vergeben. `GameState.finishQuest` schützt vor erneuter Auszahlung. Zeitablauf kehrt Personen zurück, beendet aber keinen Belohnungsauftrag. Der kleine Rückholauftrag wird durch die erste aktiv begleitete Rückkehr des Kults erfüllt; weitere Rettungen bleiben möglich, zahlen jedoch nicht erneut.
8. Ein Schrein enthält 2–3 nacheinander bekämpfbare Wachen. Erst sein vollständiger Abbau gibt einmal die Ereignisbeute, nie zusätzlich Gegnerbeute pro Wache. Bei Überfällen gilt einmalige Gegnerbeute. Die Haupt-Phase wechselt bei halben Leben ohne Heilung, zweiten Gegner oder weitere Belohnung.

Die genauen Regeln stehen maschinenlesbar in `texte.einbau`. Die bestehenden Hauptfälle, Geheimgesellschaften und Fraktionen bleiben unabhängig. Die neuen Sprecher sind keine bestehenden gleichnamigen Figuren. Der Stumme Chor ersetzt keine vorhandenen Chor-Gegner der Hauptgeschichte.

## Prüfung

`node docs/story/sekten/pruefen.mjs` vom Repo-Stamm oder über den absoluten Dateipfad. Lädt `tests/helpers.js → loadContent()`, überprüft alle Referenzen, Zählungen, Karten-/Stadtabdeckung, Stufenwachstum, Textlängen und BR-IDs. In einer isolierten Kopie werden die vorhandenen Pack-Merge- und GameState-Methoden benutzt: Begrüßungen, Rezeptverbrauch, Ketten in Reihenfolge, Auszahlung genau einmal, Rückholung und kostenlose Sabotagehilfe.

Die Prüfung simuliert keine bereits eingebaute Umtriebe-Verwaltung: Timer, lokale Heilungs-/Reise-/Lichtwirkung, Phasenwechsel, Gruppenkämpfe, NPC-Rückkehr und echte Kachelplatzierung sind ausdrücklich noch Einbauarbeit. Die Validierung prüft deren Datenvertrag, nicht eine nichtexistierende Laufzeitimplementierung.
