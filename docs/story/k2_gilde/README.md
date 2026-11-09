# AQ · Die Täfelchengilde

Inhaltspaket für den dritten Wexmoorer Zirkel `namensgilde`. Grundlage: `docs/art/codex_AQ_k2_gilde.md`, Repo-Stand `1ecfc2df1facaacfd4e6e0caf7a554a08db20d41`. Noch nicht im Spiel eingebaut. Alle Änderungen liegen in diesem Ordner.

Die Gilde bewahrt die alten Namensbräuche, ohne deren Wirksamkeit gegen das gesamte Moor zu beweisen. Sie bezeugt Namen, bewahrt Erinnerungen und versteigert Gegenstände, keine Menschen. Sedge bleibt eine widersprüchliche Bürgin: Ihre Rolle bei Elsbeth Rowe wird weder umgeschrieben noch durch die Aufnahme entschuldigt. Die Geschichte verrät vor Akt IV keine zusätzlichen Hauptfall-Beweise.

## Spielbarer Inhalt

| Auftrag | Start | Schritte | Entscheidung und Lohn |
|---|---|---:|---|
| `k2g_aufnahme` · Drei Namen, keine Schuld | Sedge ab `k2_akt2_done` | 4 | Drei Materialspuren sichern; offene Erinnerung am Schrein (+3 Ehre) oder geschützte Lade (+1 Ehre). Immer Mitgliedschaft und 24 Schilling. |
| `k2g_esse_stempel` · Der Stempel ohne Auftrag | Wanda Esse im Schrein | 3 | Alten Amtsstempel entwerten (+2 Ehre) oder versiegelt als Beleg bewahren (+3 Ehre). Immer 1 Moorharz und `k2g_gildenrabatt`. |
| `k2g_kerbe_hand` · Die ausgeliehene Handschrift | Abel Kerbe im Schrein | 3 | Fremde Urheberschaft öffentlich berichtigen (+3 Ehre) oder zunächst privat ausgleichen (+1 Ehre). Immer die Zeugenklammer. |
| `k2g_mulde_ruf` · Ein Ruf ist kein Besitz | Hanne Mulde im Schrein | 3 | Mit Zustimmung der Nachkommen Original bewahren oder dem Moor übergeben; in beiden Fällen Abschriften und beide Familiennamen erhalten. Immer `formel_echo_7` und +2 Ehre. |

Ehre sind Rohwerte des vorhandenen Effekts `honor`; die bestehende `HONOR_GAIN`-Skalierung gilt unverändert. Alle sechs Mitgliedsabschlüsse sind gleichwertig erreichbar. Keine Quest verlangt einen Kauf, einen speziellen Pfad, eine neue Grafik, Geld oder einen Kampfgewinn. Das Salzwatt bleibt ein vorhandenes Gefahrengebiet; die Aufnahmefundstelle liegt am zugänglichen Startsteg. Normale Reisen und vorhandene Gegner werden nicht entfernt.

Geschätzte zusätzliche Erkundung und Lektüre: 30 bis 45 Minuten ohne Wartezeit auf Treffen. Das ist eine redaktionelle Schätzung, kein gemessener Spieltest. Drei Dialogbäume haben je zehn Basisknoten; je vier Endreaktionen kommen als Zusätze hinzu. Neun Lesefundstellen liefern neun Hinweise. Die Fälle verlangen keine Deduktion aus einer einzigen Quelle: `case.json` hat bewusst keine neuen Deduktionen und Enden.

Keine Wiederholung von `k2_s_sedge` (Ratssiegel), `k2_s_zimmer3` (Elsbeth), `k2n_moorkind` (Lin), `k2n_reetdach` (Hausadresse) oder `k2n_bojenlied`. Die Aufnahme gilt drei früheren erwachsenen Bewohnern mit handwerklichen Alltagsspuren. Hannes Auftrag betrifft eine alte gemeinsame Werkstatt, kein weiteres verlorenes Kind.

## Dateien und Einbaufolge

Die acht Standarddateien entsprechen `applyQuestPack`: `quests.json`, `dialogues.json`, `dialog_zusaetze.json`, `npcs.json`, `case.json`, `items.json`, `encounters.json`, `platzierung.json`. `encounters.json` bleibt leer. Die anderen beiden JSON-Dateien sind separate Ausschnitte:

1. `treffen_namensgilde.json`: `circles`, `pins`, `travel`, `maps`, `placements` und `rules.orders.wexmoor` in den bestehenden Treffendatensatz einfügen. `maps` ist wie im echten `treffen.json` eine Liste, kein erfundenes Kartenobjekt. Die globale Reihenfolge, Zeitintervalle, Freischaltung und Auktionsregeln bleiben erhalten. `orders.wexmoor` lautet anschließend `lichtlose`, `salz`, `namensgilde`.
2. `artefakte.json` nach `pathways.artifacts.list` mischen, bevor `buildContent` die Artefaktgegenstände erzeugt. Die Einträge in `items.json` enthalten dieselben Vor- und Nachteile für die Pack-Sicht. Keine neuen Effektarten sind nötig.
3. Die neue Treffpunktkarte vor dem Standardpaket registrieren. Dann das Standardpaket **einmal** anwenden. `treffen_namensgilde.json.npcs` und `.dialogues` sind identische Spiegel der Standarddateien, damit der Treffen-Ausschnitt eigenständig lesbar ist. Bei diesem Einbauweg diese beiden Spiegel **nicht zusätzlich** vor dem Pack importieren: `applyQuestPack` verweigert zu Recht doppelte Dialoge. Alternativ die Treffen-Spiegel importieren und beim Pack `dialogues` weglassen. Das Prüfskript benutzt den ersten Weg.
4. `dialog_zusaetze.json` erst nach den drei Gildendialogen anwenden. Es erweitert `sedge` und die eigenen `k2g_*`-Dialoge, überschreibt keine existierenden Knoten und setzt keine Flags der Pakete AL, AM oder AP.
5. Den Pin `[364, 230]` zusätzlich in die **Wexmoorer** Stadtkarte übernehmen, siehe `offene_punkte.md`. Ein generisches Mischen in `travelRules.pins` allein reicht nicht.

`placements` im Treffen-Ausschnitt ist absichtlich leer: Alle drei Mitglieder stehen bereits in `maps[0].npcs`. Es gibt keinen zusätzlichen Gastgeber auf einer bestehenden Karte. `platzierung.json` enthält ausschließlich die neun Lesefundstellen. Der Schrein ist über die Stadtkarte erreichbar, ohne neue Tür oder Spawn in Pfahldorf.

Fest vergebene Präfix-Ausnahmen: `namensgilde`, `treffen_namensgilde`, `tm_esse`, `tm_kerbe`, `tm_mulde`. Das betrifft auch das vorgeschriebene Mitgliedschaftsflag. Alle sonstigen neuen globalen IDs beginnen mit `k2g_`. Der lokale Knoten `start` muss für den vorhandenen Zusatz-Importer so heißen; `default` ist der lokale Spawnname. Beides sind keine globalen Paket-IDs.

## Auktion und Belohnungen

Drei Mitglieder mit je sieben Angeboten und zwei Gesuchen, insgesamt 21 Angebote. Preise folgen den Nachbarzirkeln: bestehende Zutaten 120/200 Schilling, Formeln Sequenz 6/5 für 640/900, Artefakte 460 bis 510. Günstige Verbrauchswaren und zwei Materialproben ergänzen das Sortiment. Ein Angebot ist ein Los pro Treffen, kein dauerhaft gefüllter Laden. Wiederkehrende Waren dürfen erneut angeboten werden.

Sechs neue Waren: Kerbstaub, Moorharz, Rufpastille, Schreinbrühe, Zeugenklammer und Nachhallspule. Materialproben sind keine Questschlüssel. Ihre Verwendung in neuen Rezepten bleibt separat, bis dahin sind sie handelbar. Die Verbrauchswaren nutzen `heal` und `calm`; die Artefakte ausschließlich vorhandene `boons`/`curses`.

Nach der Aufnahme öffnet die Gilde im nächsten passenden 20-Minuten-Zyklus für sechs Spielminuten, entsprechend den bestehenden Regeln. Bei drei Wexmoor-Zirkeln kommt sie alle 60 Spielminuten dran. Nach der Auktion kann man auf der Karte weiterreden. Verlässt man sie, wird der nächste Eintritt erst in der nächsten Runde möglich. Keine Quest hängt davon ab, die Auktion überhaupt zu beginnen. Gesprächszeit hält die Spielzeit an.

## Prüfung

```sh
node docs/story/k2_gilde/pruefen.mjs
```

Keine Paketinstallation nötig. Das Skript nutzt Node und die vorhandenen Phaser-freien Spielmodule über den Content-Loader in `tests/helpers.js`, ohne diese zu verändern. Es kontrolliert JSON, Schemata, definierte IDs und Referenzen, alle Flags samt Setzern, Dialogziele und Erreichbarkeit, Angebote, Kartenplätze und die reale Montage mit `applyQuestPack`. Vier vollständige GameState-Durchläufe decken beide Aufnahmewege und alle sechs Mitgliedsabschlüsse ab, dazu vorzeitige Abgabe, Wiederholungssperren, Save/Load, zwölf Endreaktionen und die Auktion. Keine Browser- oder Grafikabnahme; nach Einbau ist ein visueller Rundgang erforderlich.
