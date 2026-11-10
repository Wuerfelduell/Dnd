# BD – Leben in Dunscar

Daten- und Textpaket auf Grundlage von `docs/story/kapitel3/geschichte_3.md` und `docs/art/codex_BD_k3_leben.md`. **Nicht in den Spielstart eingebunden.** Alle Platzierungen sind Vorschläge: nullbasierte Kacheln à 16 Pixel, geprüft gegen die zusammengeführten Karten einschließlich bereits eingebauter Pakete.

## Inhalt und Reihenfolge

1. Ab `k3_arrived`: acht Einwohner, sieben kleine Alltagshilfen plus Lottes Ausgabenverkauf; Kopfgeld-Brett bei Esther im Lohnbüro.
2. Akt I: Kupferdieb; Akt II: Schienenläufer und Lohnfälscher; Akt III: Staubschmuggler und Walzenhehler; Akt IV: Signalbrecher.
3. Akt IV/V: Wagenputzer und Steinmetzgeselle verschwinden nachts als Gesprächspartner und erscheinen als lebende Schichtgänger. Der Kapitelzustand verändert sich dadurch nicht.
4. Die vier Enden erhalten eigene Gespräche und Meldungen; nach Abschluss der Unterschicht gibt es acht zusätzliche Stimmen. Das schlechte Ende wird dadurch nicht rückgängig gemacht.

**Spielzeit:** ungefähr eine Stunde für alle sechs Kopfgeldketten; zusätzlich 15–25 Minuten für Dienste, Zeitung und beiläufige Gespräche, über mehrere Stadtbesuche verteilt.

| Datei | Inhalt |
|---|---|
| `quests.json` | Sechs Aufträge; Auszahlung ausdrücklich am Brett, keine zusätzliche Standard-Questprämie |
| `items.json` | Sechs unverkäufliche Übergabegegenstände, neun Ausgabe-Belege |
| `dialogues.json` | Brett, acht Einwohner, Lohnfälscher, zweiter Signalgeber; 240 Aktvarianten und 40 Nachgespräche |
| `npcs.json` | Acht Rollen, nur Lotte hat einen Vornamen |
| `encounters.json`, `case.json`, `dialog_zusaetze.json` | Leer; keine bestehenden Ermittlungen oder Figuren überschrieben |
| `platzierung.json` | Acht Tagespositionen, zehn Lesestände, Brett, zwei Ansprechstellen |
| `einwohner.json` | 24 bedingte Tagesplan-Einträge für acht Identitäten; genau eine Variante je Figur und Storyzustand |
| `stadtgegner_dunscar.json` | Sechs Gegner, Beute, Elitenregeln, sechs Ziel-Roamer und zwei nächtliche Schichtgänger |
| `phasen.json` | Zweiter Signalgeber; erst hier Siegflag und Trophäe |
| `streifen.json` | Zwei nächtliche Aufseher, einer je Karte, bestehendes `patrols`-/`route`-Format |
| `gerede.json` | Genau 80 kurze Einträge im vorhandenen Stadt/Karten-Format |
| `zeitung.json` | 20 Meldungen und sechs Anzeigen; bestehende Zeitung `dunscarer_kalkblatt` |
| `leben.json` | Wetter und Tierzahlen für alle 18 Dunscarer Karten |
| `grafikwuensche.md` | Einzelne Aufträge für BE und BA samt englischen Bildprompts |
| `offene_punkte.md` | Konkrete Einbindung und Grenzen der bestehenden Systeme |
| `pruefen.mjs` | Referenzen, begehbare freie Plätze, Zustandsmatrix, Dialoggraphen und Kopfgeldabläufe mit echter GameState-/Combat-Logik |

## Festgelegte Auslegung

Die Aufgabe verlangt zugleich sechs Gerede-Zeilen je Akt und insgesamt 80 Zeilen für acht Figuren × zehn Zustände. `gerede.json` liefert genau die 80 Zustandszeilen. Die erste Aktzeile steht zusätzlich im jeweiligen Dialog; dort folgen fünf weitere eigenständige Varianten. Das vorhandene Geredeformat besitzt kein Sprecherfeld: Einträge werden nach dem Tagesviertel gruppiert, Sprecherbindung erfolgt über den Einwohnerdialog. Reihenfolge innerhalb jedes Kartenblocks: Bewohner in der Reihenfolge von `npcs.json`, jeweils Akte I–V, vier Enden, Unterschicht.

Akt V bleibt bis zum tatsächlichen Kapitelende aktiv, auch wenn `k3a_akt5_done` bereits gesetzt wurde. Endbedingungen verwenden die tatsächlich gesetzten Flags `k3a_end_*`, nicht die Enden-IDs als vermeintliche Flags.

Die acht Standarddateien folgen den eingebauten Formaten: Knoteneffekte `start_quests`, `complete_quests`, `takes_money`, `gives_money`, `nerves`; Questschritte mit `done.requires_flags`. Die Kurzliste in der Aufgabenbeschreibung nennt teilweise andere Feldnamen. Hier entscheidet die vorhandene Implementierung.

## Prüfen

Vom Repository-Stamm: `node docs/story/k3_leben/pruefen.mjs`

Der Prüfer lädt zuerst `tests/helpers.js → loadContent()`, ergänzt das Paket ausschließlich im Speicher und testet die Daten. Das ersetzt keine spätere Prüfung von Tageswechsel, Sichtkontakt, Animationen und Kampf-Sonderregeln im Browser. Keine neuen Abhängigkeiten.
