# BC · Anschlüsse und bewusste Abweichungen von der Kurzvorlage

## Einbindung (nicht Teil dieses Datenpakets)

- Acht Standarddateien unter `src/data/packs/k3_handel/` registrieren, dann mit `applyQuestPack` einbinden. `haendler.json.merchants` und `.sell_prices` additiv in den Markt übernehmen. Mabels vorhandene Figur bleibt bestehen; nur `k3a_mabel` bekommt eine zusätzliche Gesprächsoption.
- `treffen_schichtbund.json.maps` **vor** den Platzierungen registrieren. `circles.schichtbund`, `travel` und `pins` additiv ergänzen. `rules.orders.dunscar` tief ergänzen, niemals `rules.orders` flach ersetzen: Kettlegate- und Wexmoor-Reihenfolgen müssen erhalten bleiben. Intervall und Öffnung bleiben geerbt: 20 beziehungsweise 6 Spielminuten.
- Pin auch nach `travelRules.cities.dunscar.pins.treffen_schichtbund` übernehmen; ein Eintrag nur in den globalen Pins erscheint nicht zuverlässig auf Dunscars Karte. Freigaben für Schnellreise und Depot-Tür sind identisch (Mitgliedschaft + geöffnetes Treffen). Der Ausgang ist immer offen. Agathe steht vor der Aufnahme im Depot, danach nur im Treffpunkt; Dora vor der Aufnahme am Markt, danach nur im Treffpunkt.
- `einzelgaenger.json.loners.list` mit den vorhandenen Einzelgängern zusammenführen, nicht ersetzen. Grenzen bleiben −3/+3. Die Figuren müssen auch bei Feindschaft und nach einer Niederlage ansprechbar bleiben; nur die Kampfoption wird durch `_besiegt` gesperrt. So bleibt Idas Mantelauftrag auch bei einem verfeindeten Holm lösbar.
- `artifacts.json.list` zum Artefaktregister addieren, `items.json` enthält die passenden Inventareinträge. Beide müssen eingebunden sein, sonst kann eine Gabe besessen werden, ohne ausrüstbar zu sein.

## BD · Nachtzeiten

Im aktuellen Code existieren weder eine allgemeine Dialogbedingung `zeit` noch ein Nachtflag. Das bestehende Musiksystem wechselt alle 900 Spielsekunden Tag/Nacht. BC erfindet deshalb kein unbemerkt ignoriertes `zeit`-Feld.

Vertrag: Ein gemeinsamer Zeitadapter setzt **und löscht** `k3h_nacht` anhand der von BD festgelegten Nachtphase (empfohlen dieselbe Phase wie `MusicDirector`). Betroffene Bedingungen:

| Stelle | Wirkung |
|---|---|
| `zirkel_schichtbund.start` → `aufnahme` | Aufnahme nur nachts, mit Kerbholz und Journalbeleg |
| `k3h_nachtwalze_fund2` am Arbeiterbogen | Trichtervergleich nur nachts; einmalige Lesestelle |

Flag nicht dauerhaft im Spielstand festschreiben: bei Laden und Tageswechsel neu ableiten. Der Prüfer simuliert Tag und Nacht explizit. **Ohne Adapter sind Aufnahme und Nachtauftrag absichtlich gesperrt.** Keine selbst erteilte Nacht durch eine Dialogwahl. Bei Einführung eines echten `zeit`-Feldes diese beiden Stellen migrieren, bevor `k3h_nacht` entfällt.

## BN · Muster und Verrat

Die Rufmusterliste in `docs/story/k3_akte/rufmuster.json` enthält `k3a_ruf_weg`, aber der aktuelle `loadContent()`-Stand erzeugt dafür kein Journalflag und kennt kein `requires_pattern`. Ein erfundenes `requires_flags: ["k3a_ruf_weg"]` würde die Aufnahme unlösbar machen. BC benutzt stattdessen den **wirklich vorhandenen Journalbeleg `requires_clues: ["k3a_14_c2"]`**, genau die Herkunft des Wartungsweg-Musters. Sobald BN Musterbedingungen anbietet, kann diese Bedingung auf `requires_pattern` migrieren. BC setzt keine fremden Hauptgeschichtenflags.

Verratsverträge (je einmal beim feindlichen Gespräch, Bedingung Bindung ≤ −3):

| BC-Flag | Zuständige Horchstelle / Zielkarte |
|---|---|
| `ez_ds_rangierer_alarm` | Drehscheiben-Horchstelle am `ds_schwellenring` |
| `ez_ds_kalkbrennerin_alarm` | Bruchzugang am `ds_bruchstufen` |
| `ez_ds_streckenlaeufer_alarm` | Bahnsteig-Horchstelle am `ds_signalhang` |
| `ez_ds_walzenstimme_alarm` | Platz-Horchstelle am `ds_arbeiterbogen` |
| `ez_ds_schrankenkind_alarm` | Schranken-Horchstelle am `ds_endbahnhof` |

BN ordnet diese Verträge seinen endgültigen Stations-IDs zu. Beim nächsten aktiven Ruf dort einmaligen Alarm auslösen und das Flag löschen; BCs Gespräch darf ihn nicht erneut setzen. Der bereits gesetzte dauerhafte Marker `<id>_verraten` sperrt die erneute Dialogauslösung, auch nachdem BN `<id>_alarm` gelöscht hat. Bis zum Anschluss ist das Flag nur ein sichtbarer Vertragszustand, kein funktionierender Alarm. Keine Rufladung für bloßes Lesen/Reden abziehen, kein Wissen löschen, sichere Fußwege offenlassen. Das Täfelchen neutralisiert diesen Alarm nicht.

## Auktion · bekannte Engine-Grenze

`Auction.memberLot()` verwendet aktuell nur `chance`, `item` und `price`; `once`, `requires_pathway` und `locked_text` werden dort im Gegensatz zum normalen Laden nicht ausgewertet. Die sechs Formelangebote liefern die verlangten Metadaten vollständig. Vor einer verbindlichen Pfad-/Einmalkauf-Sperre im Schichtbund muss die gemeinsame Auktionslogik diese Metadaten berücksichtigen oder die bisherige zirkelweite Regel „fremde Formeln dürfen weiterversteigert werden“ ausdrücklich übernommen werden. BC ändert diese globale Regel nicht. Die Prüfung bestätigt Angebotspreise und das Starten einer Runde, **keine bereits wirksame Formel-Kaufsperre**.

## Tatsächliche Engine-Formate

Die Kurzvorlage nennt teilweise abstrakte Felder. Verwendet werden die vorhandenen funktionierenden Gegenstücke:

- Effekte auf **Dialogknoten**, nicht auf `choices[].effects` (die UI wertet Choice-Effekte nicht aus). `start_quests`, `complete_quests`, `gives_money`, `takes_money`; kein wirkungsloses `quest_start`/`money`.
- Aufträge als nach ID indiziertes Objekt, Schritte mit `done: { requires_flags: [...] }`, Auszahlung über Abschlussknoten. `reward.gives_money: 0` unterbindet eine zusätzliche Standardauszahlung.
- `requires_items` prüft nur Anwesenheit, keine Anzahl. Deshalb drei getrennte Klemmen-Abgaben mit eigenen Sperrflags und je `takes_items: { k3o_leitungsklemme: 1 }`.
- Kämpfe im direkten Encounter-Format: `hp`, `armor`, `attacks`, `on_win`, `lose_to`; keine ignorierten `power`/`defense`/`speed`. Kleine Trophäen über `on_win.gives_items`, nicht über ein hier unregistriertes Beutefeld. Keine Kernzutaten.
- Mitgliedergespräche nutzen `relation` für ihre eigene Stimmung und `bond` für den jeweils betroffenen Einzelgänger (Wim → Holm, Dora → Wenna, Rufus → Jory). `Bonds.js` ignoriert Bindungswerte für beliebige Zirkelfiguren; es werden daher keine falschen Einzelgänger-Einträge für Mitglieder angelegt.
- Eindeutige Wexmoor-Endflags sind `k2_end_rein`, `k2_end_moor`, `k2_end_lichtmeister`, `k2_end_meer`, nicht die namensähnlichen End-IDs.

## Darstellung und Abnahme

BE liefert Figuren/Kämpfe und die in `grafikwuensche.md` aufgeführten Gegenstände/Props. Bis dahin benutzen NPCs Paletten und Kämpfe das vorhandene `enemy_ez_spinnerin`-Sheet. Das ist visuell vorläufig; keine Spielgrafik wird hier als fertig ausgegeben. Wenna bleibt beim Kampf unverletzt, setzt sich bei Niederlage hin; Jory setzt den Trichter ab. Keine tödliche Darstellung.

Die Platzierung ist gegen den geladenen Hauptzweig geprüft. BD kann gleichzeitig Einwohner auf dieselben Flächen stellen; beim Zusammenführen erneut auf Überschneidungen und Erreichbarkeit prüfen. Der Prüfer prüft Kacheln und vorhandene NPC-/Objektpositionen, keine finalen grafischen Prop-Kollisionskörper. Im Browser noch Nachtwechsel, Wiederladen vor Aufnahme, Stadtpin, Treffende bei geöffnetem Dialog, die neuen Sheets und die endgültige Gefechtsbalance abnehmen.
