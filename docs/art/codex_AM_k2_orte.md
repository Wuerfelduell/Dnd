# Codex-Paket AM: Drei neue Orte in Wexmoor (Floßfriedhof, Lichtamt, Torfbrüche)

**Paket-Name:** `k2_orte` · **Ordner:** `docs/story/k2_orte/` · **ID-Präfix:** `k2o_`

Wexmoor bekommt drei neue Orte: den **Floßfriedhof** vor Pfahldorf, das **Lichtamt** (Brandts Behörde) in der Oberstadt und die **Torfbrüche**, ein neues Gefahrengebiet. Du lieferst die Karten als fertige Spieldaten, die Monster, die Beute, die Lesetexte und eine Auftragskette, die durch alle drei Orte führt. Die Grafik dazu macht gleichzeitig Paket AN; bis sie da ist, nutzen die Karten vorhandene Tilesets.

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

## 1. Karten bauen (`maps.json`)
Lies, wie Karten aufgebaut sind: `src/data/wexmoor.json` → `maps[]` (z. B. `wx_pfahldorf`, `wx_wachhaus`, `wx_salzwatt`, `wx_altstadt`) und `THEME_TILES` in `src/world/assets.js` (nur lesen: welche Zeichen in `rows` welche Kachel bedeuten, je nach `tiles`-Thema). Liefere drei Karten im selben Format als Liste:
- **`wx_flossfriedhof`** (ca. 40x18): Holzstege zwischen Flößen, auf jedem Floß Gräber mit Namenstäfelchen, Wasser dazwischen, ein Leichenhaus-Floß. `police: true` mit 1 bis 2 Streifen (`patrols`), Deckung (`cover: true`) hinter Grabsteinen. Tileset vorerst `r_torf` oder das Pfahldorf-Thema (nachsehen), Deko aus vorhandenen Props.
- **`wx_lichtamt`** (Innenraum, 3 Räume über Türen oder eine große Karte ca. 32x20): Eingangshalle mit Pförtner, Archiv mit Regalen, Kartenraum mit großer Wexmoor-Karte und Brandts Schreibtisch. `police: true`, dichte Streifen. Zugang nur mit Verkleidung oder über einen Seiteneingang (Schlüssel aus deiner Auftragskette). Tileset vorerst ein vorhandenes Innenraum-Thema.
- **`wx_torfbrueche`** (Gefahrengebiet, ca. 48x30): Stollen, eingestürzte Decken, Torfwände, Grubenwasser, Gasnester, alte Grubenlampen. Tileset vorerst `g_katakomben` oder `g_marsch`.
Jede Karte: `spawns`, Ausgänge (`kind: travel` bzw. `door`), `lights`, `ambient`, 6 bis 10 Lesetexte/Untersuchungs-Objekte, Figuren aus den Eckdaten. Prüfe in `pruefen.mjs`, dass alle Zeilen gleich lang sind, alle Spawn- und Objekt-Kacheln begehbar sind und jeder Ausgang erreichbar ist.

## 2. Reise (`travel.json`)
Einträge für die Stadtkarte von Wexmoor im Format von `src/data/wexmoor.json` → `travel` bzw. `zones[].travel`, mit Freischaltung (Flag) und Kartenmarker-Wunsch.

## 3. Gefahrengebiet Torfbrüche (`zone.json`)
Im Format von `src/data/wexmoor.json` → `zones.wx_salzwatt`: `name`, `tier: 3`, `travel`, `lose_to`, `lose_text`, `flee_text`, `elite_drops`, `encounters` mit den 4 Monstern und dem Boss aus den Eckdaten (Sheets `enemy_<id>`), `loot`, `roam`, `elite`. Werte an `wx_salzwatt` und `wx_altstadt` ausrichten, Boss `moorbraut` etwas stärker als `glockenmutter`. Neue Beute mit **festen IDs** (Paket AN zeichnet genau diese Icons): `schlickzahn` (vom Schlickhund), `wurmseide` (Torfwurm), `grubenglas` (Grubenlicht), `torfbernstein` (selten, überall), `brautschleier` (Boss), `brautring` (Auftragsgegenstand). Dazu das Artefakt `brautkranz` (Kranz aus Moorblüten, Format `src/data/pathways.json` → `artifacts.list`, mit Vor- und Nachteil). Weitere Items nur, wenn nötig, dann mit Präfix `k2o_` und in `grafikwuensche.md`.

## 4. Auftragskette „Das Grab ohne Namen“ (`k2o_*`)
3 bis 4 zusammenhängende Aufträge, ab `k2_akt3_done`:
1. Jonas Peck (`wxn_torfgraeber`) hat in den Torfbrüchen eine Moorleiche im Brautkleid gesehen, die einen Ring mit dem Lichtamt-Siegel trägt.
2. Auf dem Floßfriedhof hat Agathe Mulch (`wxn_bestatterin`) ein Floß, dessen Grab leer ist und dessen Täfelchen abgekratzt wurde.
3. Im Lichtamt-Archiv steht, wer die Braut war und warum das Amt sie vergessen machen wollte (Einbruch mit Verkleidung; Corvin Tallow `wxn_lichtschreiber` hilft oder verrät dich, je nach Entscheidung).
4. Showdown mit der Moorbraut in den Torfbrüchen. Enden: ihr den Namen zurückgeben (Täfelchen auf dem Floßfriedhof), sie im Moor lassen, oder ihren Ring dem Lichtamt verkaufen.
Die Kette liefert einen Hinweis, der zur Hauptstory um Brandt passt (als neues `fact`, ohne vorhandene Deduktionen zu ändern; Vorschlag für eine Verknüpfung in `offene_punkte.md`).

## 5. Lieferumfang
Zu den Standard-Dateien kommen `maps.json`, `travel.json`, `zone.json`, `README.md`, `grafikwuensche.md` (nur, was nicht schon in AN steht: AN macht Kacheln, Props, Monster, Boss, Kampf-Hintergründe und Beute-Icons für diese drei Orte), `offene_punkte.md`, `pruefen.mjs`.
