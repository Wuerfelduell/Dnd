# Einbau und geprüfte Abweichungen

## Stand und Grenzen

Quellenstand: `bf3088505e19b1c94a991ed791ae0852c10e382e` auf `main`, gelesen am 9. November 2026. Der Ordner ist ein Datenentwurf. Er wird noch nicht geladen und verändert keine Dateien unter `src/`, `public/` oder `tests/`. `pruefen.mjs` baut ausschließlich eine Inhaltskopie im Speicher zusammen.

Gelesene Vorlagen: `src/data/wexmoor.json` (Sedge, Moortee, Price, Lesestellen und Deduktionen), `src/data/dialogues/kopfgeld.json`, `src/data/quests.json`, `campaign.json`, Fälle 1 bis 9, `dialogues/fall5.json`, `fall6.json`, `fall78.json`, `fall9.json`, `encounters.json`, `stadtgegner.json`, die verwendeten Karten sowie `GameState.js`, `Travel.js`, `Combat.js`, `WorldScene.js` und `buildContent.js`.

## Daten übernehmen

1. `quests`, `items`, `encounters`, `dialogues` an die jeweiligen Inhaltsregister anhängen. Alle neuen IDs beginnen mit `kg_`. `case.json` liefert Fakten und Hinweise für den vorhandenen Notizbuchbereich `side` sowie zwei Deduktionen. Es ist keine neue Hauptfall-Akte und enthält keine Hauptfall-Enden.
2. `npcs.json` enthält bei vorhandenen Figuren nur die unveränderte Zuordnung von Name, Rolle und Dialog. Bestehende Paletten und Grafiken beim Zusammenführen erhalten. Drei neue Einträge sind die Gesuchten; ihre eigenen Paletten erlauben bereits die vorhandene prozedurale Darstellung. Ihre Beschreibungsdialoge sind vollständig, die Begegnung selbst läuft über das Kampfobjekt.
3. In `dialog_zusaetze.json` gehören `choices_add` bei jedem Dialog in `nodes.start.choices`, unmittelbar vor die bestehende Schlussoption. `nodes_add` werden an denselben Dialog angehängt. Bestehende `start`-Selektoren und Fallzweige bleiben erhalten. Kein `next` springt in einen anderen Dialog.
4. `platzierung.json` ist das im Auftrag verlangte Transportformat, kein neues Engineformat. Für `npc: "id"` einen Eintrag `{id, tile, visible_if}` in `map.npcs` erzeugen. Bei `interactable` dessen Objekt mit den äußeren `tile` und `visible_if` in `map.interactables` übernehmen. Die äußeren Felder nicht als Eigenschaften einer Enginekarte ablegen. Die 42 Einträge sind auf begehbaren, von einem Spawn erreichbaren Kacheln und nicht unmittelbar an einer Tür oder einem Ausgang geprüft.
5. Für Auftragsfiguren gilt die folgende kleine Sichtbarkeitskorrektur beim späteren Einbau. Sie ist erforderlich, weil vorhandene Quellen teilweise verhaftete Figuren weiter auf ihren alten Karten anzeigen. Der Prüfer wendet genau diese Ergänzungen im Speicher an, damit die Haftwege nicht durch ungewollte freie Doppelgänger umgangen werden.

| Vorhandene Platzierung | Zusätzliches `hide_if_flags` | Ersatzkontakt |
|---|---|---|
| `erbe` im Kontor | `edmund_arrested` | `kg_edmund_besuch` im Revier |
| `gouvernante` im Waisenhaus | `wren_arrested` | `kg_wren_besuch` im Revier |
| `rattenfaenger` in Ashgrove | `piper_arrested` | `kg_jasper_besuch` im Revier |

Martha, Ben, Tam und Emil erhalten am bisherigen Standort jeweils eine zusätzliche, zum alten aktiven Fallzustand ausschließende Platzierung nach Fall 5. Edmund wird nur nach geschlossenen Fällen 7 und 8 zusätzlich im Kontor sichtbar, sofern er frei ist. Orsolya und Abel ziehen nach Fall 6 an den Nachtmarkt beziehungsweise ans Nordtor. Owen steht danach am Nordtor. Seine alte Nachtmarkt-Platzierung während `wundertonikum` kann als zeitlich abstrahierter Zweitkontakt weiterbestehen; für den neuen Auftrag ist der Nordtor-Kontakt eindeutig im Journal genannt. Keine neue Platzierung steht auf derselben Kachel wie ein anderer gleichzeitig sichtbarer Kontakt.

## Figurenkontinuität und alternative Enden

- **Pratt:** `pratt_resolved` und `pratt_gone` können bereits gesetzt sein. Sein zusätzlicher persönlicher Einstieg ist dann gesperrt. Der immer nach Fall 6 verfügbare Brief beim Standvermieter bietet dieselben Entscheidungen, ohne Pratt zurück in die Stadt zu versetzen. Briefe und persönliche Gespräche teilen Quest- und Auszahlungsflags. Das Wundertonikum wird nicht erneut abgewickelt.
- **Orsolya:** Bei `seer_arrested` bleibt sie in Haft. Besuchstisch im Revier und ein bereits am Nachtmarkt verwahrtes Kartenbrett machen den Auftrag ohne Zugang zum gefährlichen Spiegelkabinett lösbar. Eine öffentliche Erklärung wird aus der Haft übermittelt; kein Ende hebt die Festnahme auf.
- **Edmund:** `edmund_arrested` bleibt selbst dann erhalten, wenn spätere Hauptfalltexte seine Entlastung nahelegen. Der Entwurf setzt keine Freilassung voraus. Der beaufsichtigte Besuch ermöglicht Auftrag und Abrechnung; der Nachlassverwalter wickelt die Auszahlung ab. Das Testament betrifft einen neuen, kleinen Brenngeldfonds, nicht die bereits behandelte Räumung oder einen neuen Vorwurf zum Tod des Onkels.
- **Wren:** Bei `wren_arrested` erfolgt ihre Aussage im Revier. Ist sie frei, bleibt ihr vorhandener Gesprächszweig im Waisenhaus; nur im Sonderzustand `case_78_showdown` ohne Haftflag liefert die Platzierungsliste einen Ersatz. Ihre neuen Aussagen beanspruchen ein Verfügungsrecht, beweisen aber keine Unschuld im alten Fall. Im gewählten Fondsende erhält sie keine persönliche Auszahlung und keine Begnadigung.
- **Jasper:** Bei `piper_arrested` organisiert er den Auftrag vom Besuchstisch aus. Die Schlussdialoge beschreiben die Übergabe von Rechnung und Draht durch den Besucher, keine freie Bewegung Jaspers. Die Hauptfall-Falschverurteilung bleibt bestehen.
- **Nan, Owen und Clara:** Die Flugblattfälschung betrifft eine kostenlose Abendsprechstunde und einen lokalen Zimmervermittler. Sie erklärt weder den Stern noch die Briefe gegen den Spieler. Nans Erinnerung an die Kinder bleibt bestehen, ohne bei `benji_lost` eine Rettung zu behaupten.

Besuchstische sind `kind: "dialogue"`-Objekte, keine zusätzlichen Zellen und keine neuen dauerhaft aufgestellten Doppel-NPCs. Sie erzählen beaufsichtigte Kontakte im selben Raum. Die bestehenden Besuchsobjekte sowie freie Auftraggeber verwenden ausschließlich lokale Dialogkanten. Die vier Korrespondenz-/Besuchsvarianten haben eigene `kg_`-Dialog-IDs mit vollständigen Knotenmengen.

## Reise und Zeitpunkt

Die Annahme im Prompt, das Finale schicke den Spieler sofort und endgültig nach Wexmoor, trifft auf diesen Quellenstand nicht zu:

- `src/data/case_09.json` setzt `kapitel1_done` und vergibt `fahrkarte_wexmoor`, löst aber keinen sofortigen `travel`-Effekt aus. Der Kapitel-Footer sagt ausdrücklich, dass Kettlegate offen bleibt.
- `src/core/Travel.js` filtert Reiseziele nach Stadt und erfüllten Bedingungen. `src/data/travel.json` enthält die allgemeinen Reiseregeln, aber nicht allein die Verbindungen zwischen den Kapiteln.
- `src/data/wexmoor.json → travel` liefert den ersten Zug nach Wexmoor, den späteren Nachtzug dorthin und den **Nachtzug nach Kettlegate**, Ziel `docks`, sobald `k2_hideout` gesetzt ist. Rückreise ist also möglich.

Trotzdem verlangt kein neuer Auftrag eine Rückreise, Kapitel-2-Fortschritt oder den Abschluss von Fall 9. Alle neuen Annahmen enden mit `kapitel1_done`; `kg_flugblatt` verlangt beim Einstieg zusätzlich einen **aktiven** `case_09`. Nach Annahme bleiben Fortsetzung, Fundstellen und Abrechnung verfügbar, damit ein versehentlicher Kapitelwechsel keinen Questzustand unlösbar macht. Der letzte Schritt des Flugblatts kann daher auch später nachgeholt werden, obwohl sein erzählerischer Zielzeitpunkt vor der Abreise liegt.

Die verwendeten Reiseziele sind bis zur jeweiligen Phase bereits erreichbar. Der Ankerhof braucht `travel_docks` und `case_03_closed`, die Gießerei `travel_giesserei`; beide sind im normalen Hauptfallverlauf vorher verfügbar. Adas Retuschrechnung liegt bewusst in der bereits geöffneten Villa Ashcombe und nicht im bis Fall 7 gesperrten Kontor. Es werden keine neuen Karten, Freischaltflags oder Abkürzungen benötigt. Innenraumtüren werden mit ihren echten Sichtbarkeits- und Schlossbedingungen geprüft.

## Tatsächliche Enginefelder

- Im Prompt heißt ein Dialog-Kampfeffekt `encounter`. Die aktuelle Engine liest in `GameState.applyEffects` und `Ui` jedoch **`combat`**; bestehende Fall-Dialoge verwenden es ebenfalls. Deshalb benutzen die zwei neuen Kampfdialoge `combat`. Nur `kind: "combat"`-Kartenobjekte verwenden `encounter`. Kein erfundenes Feld und keine Engineänderung sind nötig.
- Quests besitzen bereits `reward`. Hier setzt `reward.gives_money: 0` den automatischen Nebenquestlohn von 12 Schilling außer Kraft. Die tatsächlich gewählte Auszahlung steht am Abschlussknoten. Die genannten Summen sind Basiswerte vor eventuellen Pfad- oder Ausrüstungsboni.
- Beide Deduktionen setzen `honor: 0`, damit ihre unvermeidbare Lösung keinen versteckten Ehrebonus zusätzlich zu den ausgeschriebenen Enden erzeugt. Es reicht `requires_conclusions`; `requires_certain` wäre bei einer einzigen Quelle zum letzten Willen unpassend.
- Kampfgewinn setzt `won_<kampf-id>` automatisch. Die drei Nicht-Kopfgeld-Begegnungen setzen zusätzlich `kg_`-Fortschrittsflags. Niederlage und Flucht setzen keine Lösungsflags und verbrauchen keine Questgegenstände.
- Jedes Belohnungsende ist nur über einen aktiven Auftrag erreichbar. Rückblicke enthalten ausschließlich Text und geben weder Geld noch Items. Die Kopfgeld-Belege bleiben als Lesestellen zugänglich; die Begegnung verschwindet nach dem ersten Sieg.
- Die neue Kopfgeldabwicklung verwendet nicht das alte textuelle `wanted`-Feld der Steckbriefe: Die aktuelle Zustandslogik versteht `wanted` als numerische Wexmoor-Fahndungsstufe. Ein bebildertes Steckbrief-Popup benötigt gegebenenfalls später eine getrennte Zuordnung. Brettdialog, Quest, Fundbeleg, Kampf und Auszahlung sind ohne diese optionale Präsentation vollständig.

## Kampf- und Belohnungsrahmen

| Begegnung | Basis | HP | Schadensrahmen pro Treffer | Einordnung |
|---|---|---:|---:|---|
| `kg_schlotgeist` | `stadtgegner.russgeist` | 32 | 3–11 | Identischer Gegnertyp, Ritualalternative |
| `kg_kanalrettung` | `encounters.gasgeist` | 40 | 3–11 | Gleicher Gasgeist-Typ, eigene Rettungsflags, keine alten Fallbelohnungen |
| `kg_rattenschwarm` | `travel.encounters.reise_ratten` | 38 | 3–7 | Bestehender Rattentyp, HP von 26 angehoben, friedlicher Ausweg |
| `kg_kopfgeld_siegelbrecher` | Kopfgelder um 38–40 HP | 44 | 5–12 | Nach Fall 6, neue Gesuchte |
| `kg_kopfgeld_schichtdieb` | Pfandeintreiber 44 HP | 48 | 5–12 | Nach Fall 7, neuer Gesuchter |
| `kg_kopfgeld_pfandvogt` | Späte Begegnungen 56–72 HP | 54 | 5–12 | Nach Fall 8, neue Gesuchte |

Die Nebenaufträge enthalten jeweils höchstens einen Kampf; nur drei Gegneridentitäten sind neu. Keine Begegnung kopiert die `on_win`-Belohnungen oder Flags ihres Vorbilds. Die drei Kopfgelder bezahlen 42, 52 und 64 Schilling am Brett, nicht zusätzlich beim Sieg. Timing und Animation bleiben bei der späteren visuellen Integration zu prüfen; die Logiksimulation prüft keine Spielerreaktionen.

## Noch zu tun beim Einbau

- Den Ordner laden und die oben beschriebenen reinen Datenzusätze anwenden. Die drei Sichtbarkeitskorrekturen sind ausdrücklich Teil dieses Integrationsschritts.
- Für die drei neuen Gesuchten sowie zwei Gegenstände die Bilder aus `grafikwuensche.md` erstellen und im vorhandenen Grafikregister zuordnen. Es gibt keine neuen Assetdateien in diesem Textpaket.
- Die derzeit statischen Journalziele können bei Haft auf den normalen Standort zeigen. Die Schritttexte nennen den Besuchsort ausdrücklich; ein dynamischer `target`-Selektor ist in der Engine nicht vorhanden und wird deshalb nicht als erfundenes Datenfeld angelegt. Optional später dynamische Ziele implementieren.
- Abschließend Sichtprüfung im Spiel: Dialogoptionen, Besuche, Ratten- und Schlotinteraktion, Figurenplatzierung, neue Kampfporträts und mobile Lesbarkeit. Dieser PR behauptet keine bereits durchgeführte Browser- oder Grafikprüfung.
