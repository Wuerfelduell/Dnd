# Codex-Paket AL: Wexmoorer Akten (4 neue Fälle in Kapitel 2)

**Paket-Name:** `k2_akten` · **Ordner:** `docs/story/k2_akten/` · **ID-Präfix:** `k2a_`

Kapitel 2 ist eine einzige lange Jagd. Was fehlt, sind die kleinen, abgeschlossenen Fälle, die Kapitel 1 so lang und abwechslungsreich gemacht haben. Dieses Paket schreibt **4 Wexmoorer Akten**: richtige Kriminalfälle mit Tatort, Verdächtigen, Hinweisen, Deduktionen, Kampf und mehreren Enden. Sie hängen an Zunders Fallwand im Torfkahn und laufen neben der Hauptstory.

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

## 1. Vorlage für Fälle
Lies einen Fall aus Kapitel 1 genau: `src/data/case_05.json` mit `src/data/dialogues/fall5.json` und `src/data/case_07.json` mit `fall78.json`. So sollen deine Akten gebaut sein: Auftakt, 3 bis 4 Orte, 12 bis 18 Hinweise, 4 bis 6 Deduktionen, eine falsche Fährte, ein Verhör mit Lügen, die man widerlegen kann (`fact_refuted`), Showdown, 2 bis 3 Enden mit Ehre, Geld und Flags. Hinweise mit `"case": "k2a_<akte>"`.

## 2. Die vier Akten (Vorgaben, Details erfindest du)
1. **`k2a_tinte`, „Die Tinte des Telegrafisten“** (ab `k2_akt1_done`): Eustace Rimmel (`wxn_telegrafist`) bekommt nachts Telegramme von einer Station, die seit 30 Jahren im Moor versunken ist. Jemand nutzt die alte Leitung, um Grauspäher-Routen an Schmuggler zu verkaufen. Orte: Bahnhof, Schleusen, Salzmarkt, eine versunkene Bahnwärterhütte (als Lesetexte und Interactables auf vorhandenen Karten).
2. **`k2a_bittere_mittel`, „Bittere Mittel“** (ab `k2_akt2_done`): In Pfahldorf sterben Alte an einem Hustensaft von Minna Sorrel (`wxn_apothekerin`). Sie ist unschuldig; jemand aus der Akademie ersetzt ihre Moorminze durch etwas, das vergessen lässt. Verbindung zur Akademie und den Forschungen über das Moor.
3. **`k2a_hafenrecht`, „Hafenrecht“** (ab `k2_akt2_done`): Dora Kell (`wxn_hafenmeisterin`) findet ein Boot mit drei Toten, die alle denselben Namen auf dem Arm tätowiert haben. Fischerfehde, Versicherungsbetrug oder ein Ritual? Kampf auf dem Wasser oder im Salzwatt.
4. **`k2a_letztes_bild`, „Das letzte Bild“** (ab `k2_akt3_done`): Lionel Vane (`wxn_maler`) malt Totenbilder für die Oberstadt. Auf jedem neuen Bild steht im Hintergrund dieselbe Frau, die es seit 1790 nicht mehr gibt. Wer in Wexmoor einmal gemalt wurde, verschwindet eine Woche später. Okkulter Showdown: Bei einer falschen Entscheidung kämpft man gegen Vane (Sheet `enemy_wxn_maler`), immer aber gegen die gemalte Frau (Sheet `enemy_gemalte_frau`); beide zeichnet Paket AO.

Jede Akte: Startquest mit 4 bis 7 Schritten, mindestens eine Entscheidung, die eine andere Figur in Wexmoor später erwähnt (über `dialog_zusaetze.json`), und eine Szene, in der die Polizei (Fahndung) eine Rolle spielt. Jede Akte dauert beim Spielen etwa 30 bis 45 Minuten.

## 3. Fallwand
Die Akten erscheinen an Zunders Fallwand (Interactable `fallwand` in `wx_kahn`, kind `casewall`). Wie das Spiel offene Fälle zeigt, siehst du an den Kapitel-1-Fällen in `src/data/campaign.json`. Schreib in `faelle.json` je Akte den Eintrag, den die Fallwand bräuchte (Titel, Kurztext, Startbedingung, Abschluss-Flag), und in `offene_punkte.md`, was dafür im Code fehlt.

## 4. Zusätzlich
- `zeitung.json`: je Akte und Ende eine Meldung im „Wexmoorer Boten“ im Format von `src/data/packs/lore/zeitungen.json`.
- `README.md`, `grafikwuensche.md` (nur Dinge, die nicht in den Eckdaten oben stehen), `offene_punkte.md`, `pruefen.mjs` (siehe 0.5).
