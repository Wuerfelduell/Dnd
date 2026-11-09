# Codex-Paket AD: Lesetexte, Zeitungen, Gerüchte und Bestiarium

**Paket-Name:** `lore` · **Ordner:** `docs/story/lore/` · **ID-Präfix:** `lore_`

Die Welt soll mehr erzählen, ohne dass es neue Aufträge braucht: Zeitungen, die auf die gelösten Fälle reagieren, Bücher und Briefe zum Finden, kurze Sätze von Passanten, bessere Gegenstandsbeschreibungen und Bestiariums-Einträge. Alles reine Texte als Daten.

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

## 1. Erst lesen
- Fälle Kapitel 1: `src/data/case_01.json` bis `case_09.json` (Titel, Täter, **Enden** mit ihren Flags) und `src/data/campaign.json`.
- Kapitel 2: `src/data/wexmoor.json` (`quests` Akte, `case.endings`, Viertel in `maps`).
- Gegenstände: `src/data/items.json`, `src/data/wexmoor.json` → `items`, `src/data/wilds.json` → `items`.
- Gegner: `src/data/encounters.json`, `src/data/stadtgegner.json`, `src/data/wilds.json`, `src/data/wexmoor.json` → `encounters`.
- Vorhandene Lesetexte als Ton-Vorlage: Interactables mit `kind: "read"` in `src/data/maps/*.json` und `wexmoor.json`, Fundstücke in `src/data/dialogues/fundstuecke.json`.

## 2. Zeitungen (`zeitungen.json`)
- **„Kettlegater Kurier“** (Kapitel 1): eine Ausgabe nach **jedem Ende jedes Falls** (Fall 1 bis 9, alle Enden-Flags). Pro Ausgabe: Schlagzeile, Haupttext (60 bis 120 Wörter, aus Sicht eines Reporters, der nicht alles weiß und manchmal falsch liegt), 2 bis 3 Kurzmeldungen (Stadtleben, Wetter, Anzeigen, ein seltsames Gerücht als Vorahnung auf den nächsten Fall).
- **„Wexmoorer Bote“** (Kapitel 2): eine Ausgabe nach jedem Akt (`k2_akt1_done` … `k2_akt4_done`) und eine nach jedem der vier Enden. Der Bote ist vom Lichtamt zensiert: Der Spieler ist darin ein gesuchter Verbrecher, je nach Fahndung mehr oder weniger.
- Format: `[{ "id": "lore_kurier_c1_<ende>", "zeitung": "kurier", "requires_flags": [...], "hide_if_flags": [...], "title": "...", "text": "...", "kurz": ["...", "..."] }]`

## 3. Bücher, Briefe, Aushänge (`lesestuecke.json`)
40 Lesestücke, je höchstens 120 Wörter, im Format eines Interactables mit `kind: "read"`, plus Vorschlag für Karte und Kachel:
`[{ "map": "<karten-id>", "tile": [x,y], "interactable": { "id": "lore_...", "kind": "read", "sprite": "paper", "prompt": "...", "title": "...", "text": "...", "footer": "...", "visible_if": {...} } }]`
- 20 in Kettlegate (Revier-Bibliothek, Kapellen, Theater, Sternwarte, Nachtmarkt, Hafen …): Stadtgeschichte, Pfade und Sequenzen aus Sicht von Gelehrten, die nur halb Bescheid wissen, alte Fälle der Polizei, Werbezettel für Wunderwaren, Liebesbriefe ohne Empfänger.
- 20 in Wexmoor: Geschichte des Versinkens, die Täfelchen-Bräuche, das Lichtamt, Fischerlieder (gereimt, kurz), Tagebuchseiten von Torfstechern, Akademie-Notizen über das Moor. Keine neuen Auftrags-Flags, nur Lesen (höchstens `gives_clues` auf **vorhandene** Hinweise, wenn es wirklich passt).
- Lies die `rows` der Karte und wähle begehbare Kacheln neben Wänden oder Möbeln.

## 4. Gerüchte und Passanten-Sätze (`gerede.json`)
Kurze Sätze (höchstens 14 Wörter), die Figuren sagen, wenn man an ihnen vorbeigeht. Pro Stadt 60 Sätze, gruppiert nach Viertel/Karte und mit Bedingungen, damit die Stadt auf den Fortschritt reagiert:
`{ "kettlegate": { "altmarkt": [ { "text": "...", "requires_flags": ["case_02_closed"] } ] }, "wexmoor": { ... } }`
Ein Drittel davon soll auf gelöste Fälle bzw. Akte reagieren, einige auf hohe Fahndung in Wexmoor (`max_...` gibt es nicht; nutze Flags, die es gibt, und schreib Wünsche in `offene_punkte.md`).

## 5. Bessere Gegenstandsbeschreibungen (`item_texte.json`)
Geh alle Items durch. Wo `desc` fehlt, kürzer als 8 Wörter ist oder nur die Werte nennt, schreib eine neue Beschreibung: ein bis zwei Sätze Stimmung, danach die Werte so, wie sie schon drinstehen (Werte nicht ändern!). Format `{ "<item-id>": { "alt": "...", "neu": "..." } }`. Mindestens 40 Items.

## 6. Bestiarium (`bestiarium.json`)
Für jeden Gegner (normale und Bosse beider Kapitel) ein Eintrag: `{ "<encounter-id>": { "titel": "...", "text": "2 bis 4 Sätze: was ist das, wo lebt es, was erzählen sich die Leute", "hinweis": "1 Satz Kampftipp, passend zu den Angriffen in den Daten" } }`. Den Kampftipp aus den echten `attacks` ableiten (z. B. lange Ausholzeit, Nerven-Angriffe).

## 7. Sonst
- `README.md`: was drin ist, Zahlen, wie die Bedingungen gemeint sind.
- `offene_punkte.md`: wo eine Anzeige im Spiel fehlt (z. B. Zeitungsständer, Gerede-Blasen) und was sie bräuchte.
- `pruefen.mjs` (siehe 0.5; zusätzlich: jede `map` und `<item-id>`/`<encounter-id>` existiert in `src/data/`).
