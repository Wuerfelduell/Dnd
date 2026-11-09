# AR · Der letzte Zug nach Dunscar

Inhaltslieferung nach `docs/art/codex_AR_k3_akte.md` und der verbindlichen Geschichte 3. Basis: `1fe89c56d45f76843bbc4d96b3731259b377ae51`. Kein Spielcode und keine Integration in `src/`. Geschichten 1 und 2 bleiben unberührt.

## Umfang und Ablauf

5 Hauptquests mit je 4 Fährten und Abschluss, 80 Hinweise, 40 Fakten, 20 Deduktionen, 264 Dialogknoten, 5 Verhöre, 12 visuell beschriebene Rufmuster, 9 Horchstellen, 4 Enden, 16 Epilogszenen und 9 Zeitungsausgaben. Jede Fährte hat vier Quellen und eine Kombination aus zwei Fakten. Die Fährten 11 bis 54 entsprechen genau der Reihenfolge der Vorlage.

| Abschnitt | Spielbarer Ablauf | Abschluss |
|---|---|---|
| Anreise | Originalflags `k2_end_rein`, `k2_end_moor`, `k2_end_lichtmeister`, `k2_end_meer`; Brief lesen, Reise ausdrücklich wählen, am Endbahnhof umsehen | `k3_arrived`, Start `k3a_akt1` |
| I | Billett, Lokpfiff, lebende Schichtgänger, Wandantwort | Signalgerät, sicherer Speisewagen |
| II | Grabsteine, Orens Bremse, Nellies falsche Zeit, Schichtwalze hinter dem Schwellenhund | Depotmarke; Nellies Kanal bewahren oder öffentlich warnen |
| III | Familienaufnahme, gekaufte Stimmreste, Vorhauer, Fahrmeister als Nachhall | +2 Bindung zu Pfiff |
| IV | Verschlussbefehl und Lagerabschrift, Hohlräume, eigener Ruf, sechs Halte | Leitungsprüfer, vorhandener Ausrüstungsplatz `amulett` |
| V | Familienaussagen, Vielrufer, Gallowmeres eigene Schuld, Rückmeldungen der Evakuierten | Urteil: freie Bahnkarte, Werkzeuge oder Aufsichtsmarke |

Fährten sind innerhalb ihres Akts frei untersuchbar und danach weiterhin zugänglich. Die vier deduzierten Befunde werden an ihrer Station festgehalten. Pfiff bestätigt jeden Aktwechsel einzeln. Im fünften Akt führt seine Bilanz zum vollständigen Feierabend-Ende; Stilllegung und Zwangsaufruf erlauben die in der Vorlage vorgesehenen früheren Entscheidungen. Keine Uhr, keine Sequenzfähigkeit und keine alte Nebenquest sperrt die Hauptakte.

`k3a_11_dialog` bis `k3a_54_dialog` sind Ortsgespräche/Untersuchungen; die Personen sprechen dort in der betreffenden Szene. Die festen NPCs besitzen eigene Basisdialoge. Verhörknoten gehören jeweils zum Ortsgespräch, damit ein Beleg nicht aus der Ferne untersucht wird. Esthers externe Lagerabschrift liegt tatsächlich am Schwellenring.

## Dateien und Verwendung

Die acht Standarddateien folgen `wx_nebenquests` und `applyQuestPack`. `dialog_zusaetze.json` und `encounters.json` sind leer: Kapitel 3 hat noch keine bestehenden Basisdialoge, Kampfwerte gehören AS. Die zehn festen NPC-IDs sind die ausdrückliche Ausnahme vom Präfix, ebenso die vier fest vergebenen Ende-IDs sowie die gemeinsamen Flags `k3_arrived` und `kapitel3_done`.

`anreise.json` ist eine **Ansicht der bereits in platzierung.json enthaltenen** Reisebriefe und Ankunft. Nicht zusätzlich einspielen. `boss_texte.json` liefert ausschließlich nach Vorlage geformte Textfelder für AS-Kämpfe, keinen eigenständig ladbaren Kampf. Rufmuster und Horchstellen sind die im Auftrag verlangten Metadaten; jede Horchstelle besitzt eine vorhandene Dialogalternative. `epiloge.json` folgt AP, `zeitung.json` der Lore-Vorlage. Enden müssen separat registriert werden, siehe [offene_punkte.md](offene_punkte.md).

## Prüfen und Spielzeit

`node docs/story/k3_akte/pruefen.mjs` prüft Struktur, Verweise, Präfixe, Flag-Setzer, Dialoggraphen und 64 vollständige Datenpfade mit positiven und negativen Endbedingungen. `--strict-external` schlägt zusätzlich fehl, solange zugesagte AS-Karten/Kämpfe nicht unter `src/data/` registriert sind. Diese offenen Verweise werden im normalen Liefercheck ausdrücklich ausgegeben, nicht als existierende Inhalte ausgegeben.

Die angestrebten 7–9 Stunden beziehen sich auf Erkundung, Gespräche, Kämpfe und Wege zusammen mit AS/AT/AU: ca. 15–20 Minuten Anreise, je 65–85 Minuten für I–IV, 75–95 Minuten für V und 15–25 Minuten Epilog/Nachbereitung. Das ist ein Planungsbudget, keine gemessene Spielzeit; die reine Textlektüre ist deutlich kürzer. Ein späterer Spieltest muss es bestätigen.

## Eingebaut (Kapitel 3 Teil 1)

Spieldaten liegen jetzt in `src/data/packs/<paket>/` und werden über `src/data/index.js` geladen. Hier bleiben Doku und noch nicht eingebaute Zusatzdateien (Beutevorschlag, Anreisen, Epiloge, Rufmuster, Horchstellen). `pruefen.mjs` liest beide Orte. Abweichungen beim Einbau: alle Kapitel-3-Kämpfe tragen `chapter: 3`, Gegner nutzen die AX-Sheets (`enemy_<id>`), Kernzutaten sind Trophäen, einzelne Platzierungen wurden auf freie Felder verschoben, Dunscar ist eine eigene Stadtkarte (`city.json`). Offen für Teil 2: Ruf-Ladungen, nahtlose Bossphasen, pfadgefilterte Beute, Epiloge, AV-Tilesets.
