# Codex-Paket AQ: Die Täfelchengilde, ein dritter Zirkel in Wexmoor

**Paket-Name:** `k2_gilde` · **Ordner:** `docs/story/k2_gilde/` · **ID-Präfix:** `k2g_`

In Wexmoor gibt es zwei geheime Zirkel mit Auktionen: die Lichtlosen und die Salzbrüder. Der dritte ist die **Täfelchengilde** (`namensgilde`): alte Moorleute, die den Brauch hüten, dem Moor Namen auf Täfelchen zu schenken, statt sich auf den Leuchtturm zu verlassen. Sie handeln mit Namen, Erinnerungen und Dingen, die das Moor zurückgegeben hat.

## Gemeinsame Eckdaten „Kapitel-2-Ausbau“ (gilt für die Pakete AL bis AQ)

Kapitel 2 (Wexmoor) spielt sich in etwa 4 Stunden, Kapitel 1 in 8 bis 9. Sechs Pakete bauen Kapitel 2 gleichzeitig aus. Damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so, erfinde für diese Dinge keine anderen IDs, und lege nichts an, was einem anderen Paket gehört.

**Neue Figuren** (Grafik macht Paket AO; jedes Paket darf sie benutzen):
| ID | Name | Rolle, Aussehen | Ort | gehört zu |
|---|---|---|---|---|
| `wxn_bestatterin` | Agathe Mulch | Floßbestatterin, groß, hager, schwarzer Ölmantel, Stake in der Hand | `wx_flossfriedhof` | AM |
| `wxn_lichtschreiber` | Corvin Tallow | Schreiber im Lichtamt, jung, blass, Ärmelschoner, Tintenflecken, nervös | `wx_lichtamt` | AM |
| `wxn_torfgraeber` | Jonas Peck | alter Torfgräber, krumm, Pfeife, Grubenlampe am Gürtel | `wx_torfstich` / `wx_torfbrueche` | AM |
| `wxn_apothekerin` | Minna Sorrel | Apothekerin am Salzmarkt, rundlich, Brille an Kette, Schürze voller Fläschchen | `wx_salzmarkt` | AL |
| `wxn_telegrafist` | Eustace Rimmel | Telegrafist am Güterbahnhof, Schirmmütze, Kopfhörer um den Hals, hört mehr als er sollte | `wx_bahnhof` | AL |
| `wxn_hafenmeisterin` | Dora Kell | Hafenmeisterin, wettergegerbt, Seemannsmantel, Fernrohr | `wx_bojenhafen` | AL |
| `wxn_krabbe` | „Krabbe“ | Schlickjunge, 11, barfuß, Sack voller Fundstücke aus dem Watt | `wx_bojenhafen` / `wx_salzwatt` | AP |
| `wxn_maler` | Lionel Vane | Porträtmaler der Oberstadt, Samtjacke, Farbe am Kinn, malt nur Tote | `wx_oberstadt` | AL |
| `tm_esse` | Wanda Esse | Schmiedin, Mitglied der Täfelchengilde | Treffpunkt der Gilde | AQ |
| `tm_kerbe` | Abel Kerbe | Schnitzer von Namenstäfelchen, Mitglied der Gilde | Treffpunkt der Gilde | AQ |
| `tm_mulde` | Hanne Mulde | Moorhebamme, gibt Kindern Namen, Mitglied der Gilde | Treffpunkt der Gilde | AQ |

**Neue Orte** (Daten macht Paket AM, Grafik Paket AN):
- `wx_flossfriedhof` „Der Floßfriedhof“: Gräber auf vertäuten Flößen vor Pfahldorf, Stadtkarte, ohne Kämpfe, mit Grauspäher-Streife.
- `wx_lichtamt` „Das Lichtamt“: Brandts Amtsgebäude in der Oberstadt, Innenraum (Halle, Archiv, Kartenraum), gut bewacht.
- `wx_torfbrueche` „Die Torfbrüche“: eingestürzte Torfstollen unter dem Moorrand, Gefahrengebiet (tier 3). Monster `torfleiche`, `grubenlicht`, `torfwurm`, `schlickhund`, Boss `moorbraut` (die Moorbraut: eine Moorleiche im Hochzeitskleid, seit 200 Jahren unverwest).

**Neuer Zirkel** (Paket AQ): `namensgilde` „Die Täfelchengilde“, Bewahrer der alten Namensbräuche, Treffpunkt-Karte `treffen_namensgilde`.

**Präfixe für neue IDs:** AL `k2a_`, AM `k2o_`, AP `k2v_`, AQ `k2g_` (Figuren-IDs oben bleiben wie sie sind). Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

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

### Lieferformat (zusätzlich zu 0.2)
Das Spiel lädt Inhalts-Pakete aus `src/data/packs/<name>/` über `applyQuestPack` in `src/data/questPacks.js`. Schau dir `src/data/packs/wx_nebenquests/` als Vorlage an und liefere **genau diese Dateien im selben Format** in deinen Ordner `docs/story/<paket>/`: `quests.json`, `dialogues.json`, `dialog_zusaetze.json`, `npcs.json`, `case.json`, `items.json`, `encounters.json`, `platzierung.json`. Dazu, was das Paket sonst braucht (steht unten). Eingebaut wird es danach von Claude, nicht von dir.

### Erst lesen (Pflicht)
Kapitel 2 komplett: `src/data/wexmoor.json` (alle Akte `k2_akt1` bis `k2_akt5`, Nebenaufträge `k2_s_*`, Fakten, Deduktionen, Enden, Dialoge, Karten mit Lesetexten, Zonen, Einzelgänger `loners`, Polizei `police`), `src/data/packs/wx_nebenquests/` (die 10 Nebenaufträge `k2n_*` und Kahn-Ausbauten, gerade eingebaut), `src/data/packs/lore/` (Zeitungen „Wexmoorer Bote“, Gerede), `src/data/treffen.json` (Zirkel `lichtlose` und `salz`). **Nichts davon doppeln**, sondern daran anknüpfen.

---

## 1. Vorlage
Lies `src/data/treffen.json` komplett: `rules` (vor allem `orders.wexmoor`), `circles.lichtlose` und `circles.salz` (Mitglieder mit `offers` und `wants`, Preise, Chancen, `once`, `requires_pathway`), `pins`, `travel`, `placements`, `npcs`, `dialogues`, `maps` (Treffpunkt-Karten), und `src/core/Gatherings.js` / `src/core/Auction.js` (nur lesen), damit du verstehst, wie Treffen und Auktionen ablaufen. Lies auch `src/data/wexmoor.json` → Dialog `sedge` und die Lesetexte über Täfelchen.

## 2. Was du lieferst (`treffen_namensgilde.json`)
Einen Ausschnitt im Format von `treffen.json`, der sich hineinmischen lässt:
- `circles.namensgilde`: Name, `member_flag` (`treffen_namensgilde`), `map` (`treffen_namensgilde`), `short`, `invite` (Einladungstext), Mitglieder `tm_esse`, `tm_kerbe`, `tm_mulde` mit je 6 bis 9 Angeboten (vorhandene Zutaten, Formeln, Artefakte und 6 neue Gilden-Waren mit Präfix `k2g_`) und 1 bis 2 Wünschen. Preise an `lichtlose`/`salz` ausrichten.
- Die neuen Waren als `items.json` (Zutaten, Verbrauchsgüter, 2 Artefakte mit Vor- und Nachteil im Format `src/data/pathways.json` → `artifacts.list`).
- `npcs`, `dialogues`, `placements`, `pins`, `travel` für die Gilde.
- `maps.treffen_namensgilde`: der Treffpunkt, eine Karte im Format der vorhandenen Treffpunkt-Karten (z. B. ein trockengefallener Schrein unter Pfahldorf, ca. 20x12), vorhandenes Tileset.

## 3. Wie man hineinkommt
Ein Aufnahme-Auftrag (`k2g_aufnahme`, 3 bis 5 Schritte, ab `k2_akt2_done`): Mutter Sedge bürgt für dich, wenn du drei Namen zurückbringst, die das Moor genommen hat (Hinweise in Torfstich, Pfahldorf, Salzwatt). Danach erscheint der Treffpunkt auf der Stadtkarte.

## 4. Gilden-Geschichte
- Jedes Mitglied hat einen eigenen Gesprächsbaum (6 bis 10 Knoten): wer es ist, was es vom Lichtamt hält, ein persönliches Geheimnis.
- Ein Gilden-Auftrag pro Mitglied (`k2g_esse_*`, `k2g_kerbe_*`, `k2g_mulde_*`), je 3 bis 4 Schritte, Belohnung: Rabatt bei der Gilde (als Flag; wie der Rabatt wirkt, in `offene_punkte.md`), eine seltene Ware oder eine Formel.
- Die Gilde nimmt eine Haltung zu den vier Enden von Kapitel 2 ein; schreib je eine kurze Reaktion (`dialog_zusaetze.json` auf die eigenen Gilden-Dialoge mit `requires_flags` des Endes).

## 5. Lieferumfang
Standard-Dateien plus `treffen_namensgilde.json`, `README.md`, `grafikwuensche.md` (Treffpunkt-Kacheln/Props und Item-Icons; die drei Figuren zeichnet schon Paket AO), `offene_punkte.md`, `pruefen.mjs` (zusätzlich: jedes angebotene Item existiert in `src/data/` oder in deinen `items.json`).
