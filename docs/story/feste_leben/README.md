# CK: Jahreszeiten und Feste als Spielinhalt

Ein eigenständiger Daten- und Textvorrat für Kettlegate, Wexmoor und Dunscar. Kein Laufzeitcode wird geändert. Grafik kommt aus BV (`manifest-feste.json`), gewünschte Musik aus CL. Der aktuelle Kalender in `Clock.js` ist bereits eingebaut und weicht vom Aufgabenstand ab; die Migration ist in `offene_punkte.md` ausdrücklich beschrieben.

## Umfang

| Inhalt | Anzahl |
|---|---:|
| Jahreszeiten | 4, je 6 vorgeschlagene Spieltage |
| Feste | 3, je Saisontag 4 für 1 Spieltag |
| Stiller Abend | Wintertag 4 |
| Händlerbuden | 12 mit je 6 Warenplätzen, insgesamt 72 |
| Festwaren | 24, je Fest 8 unterschiedliche Waren |
| Andenken | 3 aktivierbare Artefakte |
| Besucher | 12 neue Gäste mit BV-Sheets, 6 bekannte Figuren mit Zusatzdialogen |
| Besucher-Gespräche | 18, je 4 bis 6 Knoten |
| Aufträge | 3 mit je 5 Schritten, 2 Spuren und 2 Ausgängen |
| Festspiele | Kerzenboot mit 3 Entscheidungen, Kahnreihenfolge, freiwilliger Übungskampf |
| Saisonwirkungen | 16 kleine Aktionen, je Saison 4 |
| Saison-Gerede | 120, je Saison 10 pro Stadt |
| Saison-Lesestücke | 12, zusätzlich 3 Stiller-Abend-Texte auf bestehenden Karten |
| Reserve-Lesestücke | 2 für Klammers Werkstatt und Frosts Bügelraum |
| Wechsel-HUD-Texte | 8 |
| Verbündetenzeilen | 16, für Zunder, Pfiff, Klammer, Frost |
| Markt-Sprüche | 12 |
| Koop-Geplauder | 34, davon 18 Fest- und 16 Saisonwechsel-Gespräche |
| Zeitungsmeldungen | 12: je Fest 3 Phasen und 1 alternative Nachlese |
| Eigene Dialoge | 33 mit 157 Knoten, dazu additive Zweige bekannter Dialoge |
| Platzierungen | 80, auf existierenden Karten und freien Bodenzellen |

## Kalender

Ein Tag dauert 1800 Sekunden, eine Saison 10800 Sekunden, ein Jahr 43200 Sekunden. Reihenfolge Herbst, Winter, Frühling, Sommer. Ankündigung am Saisontag 2, Fest am Tag 4, Nachlese ab Tag 5. Der Stille Abend ersetzt das Winterfest. Die `effects` in den Kalenderdateien beschreiben Payloads für den zukünftigen Zeitadapter, sie sind keine jetzt laufende Steuerung.

Wichtig: Der vorhandene Kalender wechselt bereits nach zwei Spieltagen. Diese Inhalte dürfen nicht stillschweigend auf dessen Tagesphasen gelegt werden. Die Übergangsregeln, Jahreswechsel-Resets, Testflags und Behandlung von Zeitsprüngen stehen in `offene_punkte.md`.

## Dateien und Einbau

Die acht Standarddateien `quests`, `dialogues`, `dialog_zusaetze`, `npcs`, `case`, `items`, `encounters`, `platzierung` entsprechen `applyQuestPack`. `case.json` erweitert nur das Nebenauftragsregister `side`, keine Hauptfälle. Der Prüfer lädt sie probeweise mit dem echten Merger.

`feste.json` bündelt die drei Festabschnitte, Händlerbestände, Besucher und Verweise auf Aufträge und Spiele. Die Händler benötigen eine einmalige Registrierung im Markt. `artefakte.json.list` ergänzt die Artefaktliste; Andenken wirken nur aktiviert. `kalender.json`, `kalender_uebergaenge.json`, `wirkungen.json` und `texte.json` sind dokumentierte Spezifikationscontainer und keine neuen Felder im Spielzustand. Zeitung und Koop folgen den vorhandenen Listenformaten.

Die Ruhekontakte und Saisonplätze benutzen vorhandene Dialogeffekte. Waren verwenden `composure` beziehungsweise `heal`. Beim Boxring wird das tatsächlich implementierte Feld `combat` verwendet, nicht das im Prompt erwähnte `encounter`. Der Kampf ist ein nichttödlicher `practice`-Kampf nach dem Holt-Vorbild.

## Aufträge

- **Das Boot ohne Kerze:** Zwei Spuren an den Docks und am Altmarkt erklären einen alten Zugmechanismus der Resonanzkammer. Du gibst das Versuchsstück diskret zurück oder erklärst es öffentlich. Kein Zugang zu einer gesperrten Hauptfallkarte nötig. 80 Schilling und „Licht ohne Docht“.
- **Die Salzkönigin fehlt:** Brot, Kranz und drei Anliegen zeigen eine selbstgewählte Pause. Du schützt die Ruhe oder überbringst eine freiwillige Einladung ohne Unterschriftspflicht. Sedge, Brack und die Täfelchengilde haben eigene Interessen, keine davon beweist eine Entführung. 90 Schilling und „Kranz der freien Pause“.
- **Die Lohntüte zu viel:** Spielgeld und ein durchgepauster Name erklären eine zusätzliche Tüte. Du gibst der Familie zuerst Zeit oder erklärst den Fehler ohne ihren Namen öffentlich zu nennen. Esther und Pfiff reagieren auf jedes der vier vorhandenen Kapitel-3-Enden. 100 Schilling und „Siegel der Pause“.

Zeitansatz etwa 20 bis 30 Minuten mit Gesprächen, Spuren und Rückweg; keine Wartezeitsperre. Jeder begonnene Auftrag ist auch nach Festende abschließbar. Das native Questfeld `reward.gives_money: 0` verhindert die zusätzliche automatische Nebenquest-Pauschale, weil die Auszahlung bereits im gesperrten Abschlussdialog stattfindet. Alle Andenken, Auftragseinkünfte und Spielpreise sind pro Spielstand einmalig.

## Prüfung

```sh
node docs/story/feste_leben/pruefen.mjs
```

Prüft JSON, IDs, lokale Dialogziele, Flag-Produzenten, Karten aus `loadContent()`, NPC-/Item-/Kampf-/Shopreferenzen, BV-Manifestnamen, Textlängen, Zählungen, freie Platzierungen und Questziele. Danach werden beide Ausgänge jedes Auftrags mit dem echten `GameState` durchlaufen, einschließlich Abschluss nach Festende und gesperrter Zweitauszahlung. Der Kalenderadapter, Händlerregistrierung, Prop-Renderer, Sicherheit und saisonale Preisregeln sind damit ausdrücklich nicht als bereits implementiert getestet.
