# Codex-Paket AA: Neue Nebenaufträge in Kettlegate

**Paket-Name:** `kg_nebenquests` · **Ordner:** `docs/story/kg_nebenquests/` · **ID-Präfix:** `kg_`

Kettlegate hat 9 Fälle und rund 25 Nebenaufträge. Die Stadt soll sich lebendiger anfühlen: **11 neue Nebenaufträge** mit vorhandenen Figuren und Orten, dazu 3 neue Steckbriefe fürs Kopfgeldbrett im Revier. Du lieferst alles als fertige Spieldaten, eingebaut wird separat.

## 0. Gemeinsame Regeln für Text-Pakete (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. Das Spiel heißt „Nebelakten“: ein originales 2D-Pixel-Mysteryspiel in Phaser 3 (Repo `Wuerfelduell/Dnd`). Kapitel 1 spielt in der Nebelstadt **Kettlegate** (Fälle 1 bis 9), Kapitel 2 in der versinkenden Moorstadt **Wexmoor** (eine lange Jagd auf Magistra Ilse Brandt, 5 Akte). Die Welt ist eigenständig: keine Namen, Orte, Organisationen oder Begriffe aus fremden Büchern, Spielen oder Filmen.

### 0.1 Was du lieferst und was nicht
- Du schreibst **Inhalte als Daten und Texte**: Quests, Dialoge, Hinweise, Gegenstände, Kämpfe, Lesetexte. **Keinen Spielcode** unter `src/`, `public/` oder `tests/` ändern oder anlegen. Das Einbauen ins Spiel passiert separat.
- Alles kommt in **deinen eigenen Ordner** `docs/story/<paket>/` (Name steht oben in der Datei). Andere Pakete laufen gleichzeitig, fasse fremde Ordner nicht an.
- Erlaubt ist ein kleines **Prüfskript** in deinem Ordner (`pruefen.mjs`, nur Node ohne Abhängigkeiten), siehe 0.5.
- Am Ende ein Pull Request mit nur deinem Ordner.

### 0.2 Datenformat (genau wie im Spiel)
Lies vorher diese Vorlagen im Repo und halte dich exakt an ihre Felder:
- Quest: `src/data/wexmoor.json` → `quests.k2_s_sedge` (title, kind `side`, case, summary, steps[text, done{Bedingungen}, target{map,id,label}])
- Dialog: `src/data/wexmoor.json` → `dialogues.sedge` und `src/data/dialogues/kopfgeld.json` (start als Knoten-Id oder Liste `[{node, Bedingungen}]`, nodes{text, Effekte, choices[text, next, Bedingungen]})
- NPC: `src/data/wexmoor.json` → `npcs.sedge` (name, role, dialogue, palette)
- Gegenstand: `src/data/wexmoor.json` → `items.moortee`, außerdem `src/data/items.json` (kind, weight, desc, …)
- Kampf: `src/data/wexmoor.json` → `encounters.price_wx_fight` (name, sprite/sheet, hp, intro, attacks[name, damage, hits], on_win, lose_to, lose_text)
- Hinweise: `src/data/wexmoor.json` → `case.facts`, `case.clues`, `case.deductions`
- Karten-Objekte zum Lesen/Untersuchen: in `src/data/wexmoor.json` → `maps[]` die `interactables` mit `kind: "read"` (title, text, footer, done_flag, effects, visible_if)

**Bedingungen** (auf Choices, Startknoten, `done`, `visible_if`): `requires_flags`, `hide_if_flags`, `requires_items`, `hide_if_items`, `requires_clues`, `hide_if_clues`, `requires_any_clues`, `requires_conclusions`, `hide_if_conclusions`, `requires_quests_active`, `requires_quests_done`, `hide_if_quests`, `requires_money`, `requires_honor`, `requires_nerves`, `max_nerves`, `requires_bond`, `requires_pathway`.

**Effekte** (auf Dialogknoten oder `effects`): `sets_flags`, `clears_flags`, `gives_items` {id: Anzahl}, `takes_items`, `gives_money`, `takes_money`, `gives_clues`, `start_quests`, `complete_quests`, `honor`, `bond`, `wanted`, `encounter` (Kampf-Id), `travel` {map, spawn}, `nerves`, `unruhe`, `damage`, `heal`, `scene`, `shop`.

Wenn du ein Feld brauchst, das es nicht gibt, **erfinde kein neues Feld in den Daten**, sondern schreib es in `offene_punkte.md` (was du brauchst und warum).

### 0.3 IDs
- Alle **neuen** IDs (Quests, Flags, Hinweise, Items, Kämpfe, Dialoge, NPCs) beginnen mit dem Präfix deines Pakets (steht oben in der Datei). So gibt es keine Kollisionen mit den Paketen, die parallel laufen.
- Vorhandene Karten, NPCs, Items und Flags darfst du **benutzen** (nachschlagen in `src/data/`), aber nicht umschreiben. Wenn eine vorhandene Figur einen neuen Gesprächszweig bekommt, liefere ihn als **Zusatz**: `dialog_zusaetze.json` mit `{ "<dialog-id>": { "choices_add": [...], "nodes_add": {...} } }`.
- Kampf-Gewinn setzt im Spiel automatisch das Flag `won_<kampf-id>`.

### 0.4 Ton und Sprache
- Deutsch, Spieler wird mit „du“ angesprochen. Wörtliche Rede in „deutschen Anführungszeichen“.
- Kurze Absätze (2 bis 5 Sätze pro Dialogknoten, Lesetexte höchstens ca. 120 Wörter). Melancholisch, geheimnisvoll, trockener Humor, nie blutrünstig.
- Viktorianisch-industrielles Setting mit okkulten Untertönen: Gaslaternen, Ruß, Kanäle, Nebel; in Wexmoor Torf, Reet, Salz, Schlick, Bojen, Pfähle.
- Keine Gedankenstriche als Satzverbinder, lieber Punkt oder Komma.
- Jede Quest braucht eine Belohnung (Geld, Gegenstand, Ehre oder Bindung) und mindestens eine echte Entscheidung oder einen Hinweis, den man finden muss.

### 0.5 Prüfen vor dem PR
Schreib `pruefen.mjs` (Node, keine Pakete) und lass es laufen. Es soll mindestens prüfen:
1. Alle JSON-Dateien im Ordner sind gültig.
2. Jedes `next` zeigt auf einen existierenden Knoten im selben Dialog.
3. Jedes Flag, das irgendwo verlangt wird (`requires_flags`, `done`), wird irgendwo gesetzt (in deinem Ordner oder schon in `src/data/`), außer `won_<kampf-id>`.
4. Jede referenzierte Karte, NPC-Id, Item-Id und Kampf-Id existiert in `src/data/` oder in deinem Ordner.
5. Alle neuen IDs tragen das Paket-Präfix.
Die Ausgabe des Skripts kommt in die PR-Beschreibung.

### 0.6 Grafikwünsche
Wenn eine neue Figur, ein neues Item oder ein neuer Gegner ein Bild braucht, trag es in `grafikwuensche.md` ein: ID, Art (Lauf-Sheet 64x128, Portrait 64x64, Item-Icon 16x16, Kampf-Gegner 64x64 6 Spalten), ein Satz Beschreibung auf Deutsch und ein englischer Bild-Prompt (1 bis 3 Sätze, ohne Style-Block). Bis die Grafik da ist, nenne in den Daten einen vorhandenen Platzhalter (z. B. ein ähnliches NPC-Sheet oder Item-Icon) im Feld `platzhalter` der Grafikwunsch-Liste, nicht in den Spieldaten.

---

## 1. Was es schon gibt (nicht doppeln)
- Vorhandene Nebenaufträge stehen in `src/data/quests.json` (z. B. pickpocket, lost_file, medallion, fog_hound, lost_watch, archive_rats, drowned, dice, lamp_round, quill_mirror, blind_ned, black_candles, greta_stall, toad, clockwork, masked_thief, empty_hooks, starglass, lost_hymnal, wundertonikum, die vier Kopfgelder). Lies sie, damit deine Ideen andere Themen haben.
- Fälle: `src/data/case_01.json` bis `case_09.json`. Fall-Flags der Form `case_0X_closed` eignen sich als Startbedingung.
- Karten Kapitel 1: `src/data/maps/*.json` (u. a. altmarkt, docks, nachtmarkt, revier, tavern, nordtor, theater, uhrturm, gaskanaele, schlachthof, sternwarte, ankerhof, ashgrove, waisenhaus, rostkapelle, schleierhaus, katakomben, pestgassen, marsch, kraterwald).
- Figuren mit fertigen Grafiken, die auf vielen Karten stehen: u. a. `greta`, `pimm`, `quill`, `ned`, `wick`, `pip`, `kit`, `holt`, `maud`, `molly`, `tilly`, `jory`, `uhrmacherin`, `turmwaechter`, `gaswerker`, `kittering`, `gorse`.
- Dazu 16 **Auftragsfiguren** mit Lauf-Sheet und Portrait, die bisher nur als Zeugen in einem Fall vorkommen: in Fall 5 (`src/data/dialogues/fall5.json`) `waescherin`, `kaminkehrer`, `nachtwaechter`, `kuenstler`, `kind_streuner`; in Fall 6 (`fall6.json`) `kutscher`, `fotografin`, `schwindler`, `wahrsagerin`, `marktfrau`, `student`; in Fall 7/8 (`fall78.json`) `matrose`, `gouvernante`, `erbe`, `rattenfaenger`, `sufragette`. Ihre Namen und Karten stehen in `src/data/campaign.json` und den Fall-Dialogen. **Lies, wie die Figur in ihrem Fall auftritt**, und knüpfe daran an: Name, Charakter und was sie erlebt hat bleiben gleich. Ihr Auftrag startet erst, wenn ihr Fall abgeschlossen ist.
- Alle Aufträge spielen in Kapitel 1. Das Ende von Fall 9 setzt `kapitel1_done` und schickt den Spieler nach Wexmoor. Prüfe in `src/core/Travel.js` und `src/data/travel.json`, ob man danach noch nach Kettlegate kommt; jeder Auftrag muss **vor der Abreise** abschließbar sein. Schreib dein Ergebnis dazu in `offene_punkte.md`.

## 2. Die 11 Aufträge (Vorgaben, Details erfindest du)
Jeder Auftrag: Quest-Eintrag, Dialog(e), wo nötig Hinweise (`facts`/`clues`, gern eine kleine `deduction`), Gegenstände, höchstens ein Kampf. 3 bis 6 Schritte. Mindestens eine Entscheidung mit spürbarer Folge (anderes Ende, andere Belohnung, Ehre ±, Flag, das später jemand erwähnt). Das Thema darf den Fall der Figur **nicht wiederholen**, sondern erzählt, wie es ihr danach geht.

1. **`kg_waschtag`** (Wäscherin, nach Fall 5): In der Wäsche eines Herrenhauses taucht jede Woche ein Hemd mit fremdem Blut und Ruß auf. Kleine Ermittlung, der Täter ist harmloser als gedacht.
2. **`kg_schornstein`** (Kaminkehrer, nach Fall 5): In einem Schornstein am Altmarkt sitzt etwas, das Namen ruft. Kurzer Kampf oder ein ritualartiger Ausweg mit Kerzen.
3. **`kg_nachtschicht`** (Nachtwächter + Künstler, nach Fall 5): Der Künstler malt jede Nacht dasselbe Fenster in der Gießerei, hinter dem kein Raum ist. Der Nachtwächter will nicht mehr allein Runde gehen.
4. **`kg_letzte_fahrt`** (Kutscher, nach Fall 6): Ein Fahrgast steigt jede Nacht am Nordtor ein und nie aus. Geistergeschichte mit Entscheidung, ob man ihn „ankommen lässt“.
5. **`kg_totenbild`** (Fotografin, nach Fall 6): Sie verdient ihr Geld jetzt mit Andenkenbildern von Verstorbenen. Auf einem Bild hat der Tote die Augen offen. Hinweise über drei Orte, eine Schlussfolgerung. Nicht wieder „Fremder auf der Platte“, das war Fall 6.
6. **`kg_gezinkt`** (Schwindler, nach Fall 6): Der Schwindler will, dass du ihm hilfst, einen noch größeren Schwindler zu betrügen. Ehre gegen Geld.
7. **`kg_kartenlegerin`** (Wahrsagerin, nach Fall 6): Ihre Karten sagen seit Tagen jedem dasselbe. Sie hat Angst. Verbindung zu einem okkulten Gegenstand (neues Item, kein Artefakt).
8. **`kg_landgang`** (Matrose, nach Fall 8): Er sucht seinen Kameraden, der in den Gaskanälen verschwunden ist. Kampf in den Gaskanälen mit vorhandenem Gegner-Typ.
9. **`kg_kodizill`** (Erbe + Gouvernante, nach Fall 8): Ein Nachtrag zu einem Testament mit einer seltsamen Bedingung taucht auf. Wer lügt? Mini-Fall mit zwei Verdächtigen und einer Deduktion.
10. **`kg_rattenkoenig`** (Rattenfänger, nach Fall 8): Ein „Rattenkönig“ unter dem Schlachthof. Kampf, aber man kann ihn auch verschonen.
11. **`kg_flugblatt`** (Streunerkind + Student + Sufragette, startet während Fall 9 läuft: `requires_quests_active: ["case_09"]`): Das Kind trägt Flugblätter aus, die jemand anders verteilt sehen will. Letzter Auftrag in Kettlegate, bittersüß, vor der Abreise nach Wexmoor.

Neue Gegner nur, wenn nötig (höchstens 3), Werte an vorhandenen Gegnern derselben Phase ausrichten (`src/data/encounters.json`, `src/data/stadtgegner.json`). Neue Items höchstens 10.

## 3. Drei neue Steckbriefe fürs Kopfgeldbrett
Vorlage: `src/data/dialogues/kopfgeld.json` und die Quests `kopfgeld_*` in `src/data/quests.json`. Je Steckbrief: Dialog-Zusatz zum Kopfgeldbrett (`dialog_zusaetze.json` → `kopfgeldbrett`), Quest, Kampf, Fundort auf einer vorhandenen Karte (als Interactable-Vorschlag), Belohnung. IDs `kg_kopfgeld_<name>`. Zeitpunkt: nach Fall 6, 7 und 8.

## 4. Lieferumfang
```
docs/story/kg_nebenquests/
  README.md            Übersicht: jeder Auftrag in 3 Sätzen, Startbedingung, Ort, Belohnung, Entscheidungen
  quests.json          { "<quest-id>": {...} }
  dialogues.json       { "<dialog-id>": {...} }
  dialog_zusaetze.json Zusätze für vorhandene Dialoge
  npcs.json            Rollen-/Dialog-Zuordnung für vorhandene Auftragsfiguren ({id: {name, role, dialogue}}) und neue NPCs
  platzierung.json     wo welche Figur/Interactable steht: [{map, npc|interactable, tile:[x,y], visible_if}]
  case.json            { facts, clues, deductions }
  items.json
  encounters.json
  grafikwuensche.md
  offene_punkte.md
  pruefen.mjs
```
Für `platzierung.json`: Lies die `rows` der Karte und wähle Kacheln, auf denen `.` oder ein anderes begehbares Zeichen steht, nicht direkt neben dem Ausgang.
