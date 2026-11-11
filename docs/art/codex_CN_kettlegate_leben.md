# Codex-Paket CN: Kettlegate lebt (Daten + Grafik)

**Paket-Name:** `kg_leben` · **Ordner:** `docs/story/kg_leben/` · **ID-Präfix:** `kgl_` · **Batch-Name:** `kettlegate_leben` (Manifest: `public/sprites/manifest-kettlegate-leben.json`)

Kettlegate ist mit 8 bis 9 Stunden die größte Stadt des Spiels, aber die stillste: Wexmoor (AE) und Dunscar (BD/BA) haben Einwohner mit Tagesplänen, Tiere, Wetter und Stände, Kettlegate hat nur seine Fälle, das Gerede aus AD und das Kopfgeld. Du lieferst beides in einem Paket: die Daten (wie BD) und die Grafik dazu (wie BA/BE), weil die Zeit knapp ist. Zwei Pull Requests sind erlaubt (Daten, Grafik), ein gemeinsamer auch.

## 0. Gemeinsame Regeln für Text-Pakete (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. Das Spiel heißt „Nebelakten“: ein originales 2D-Pixel-Mysteryspiel in Phaser 3 (Repo `Wuerfelduell/Dnd`). Kapitel 1 spielt in der Nebelstadt **Kettlegate** (Fälle 1 bis 9), Kapitel 2 in der versinkenden Moorstadt **Wexmoor** (Jagd auf Magistra Ilse Brandt, 5 Akte), Kapitel 3 in der Bergbaustadt **Dunscar** (der Nachtzug und Fahrmeister Gallowmere, 5 Akte, vier Enden). Die Welt ist eigenständig: keine Namen, Orte, Organisationen oder Begriffe aus fremden Büchern, Spielen oder Filmen.

### 0.1 Was du lieferst und was nicht
- Du schreibst **Inhalte als Daten und Texte**: Quests, Dialoge, Hinweise, Gegenstände, Kämpfe, Lesetexte. **Keinen Spielcode** unter `src/`, `public/` oder `tests/` ändern oder anlegen. Das Einbauen ins Spiel passiert separat.
- Alles kommt in **deinen eigenen Ordner** `docs/story/<paket>/` (Name steht oben in der Datei). Andere Pakete laufen gleichzeitig, fasse fremde Ordner nicht an. Eine Zeile in `docs/story/README.md` ergänzen.
- Erlaubt ist ein kleines **Prüfskript** in deinem Ordner (`pruefen.mjs`, nur Node ohne Abhängigkeiten), siehe 0.5.
- Am Ende ein Pull Request mit nur deinem Ordner.

### 0.2 Datenformat (genau wie im Spiel)
Lies vorher diese Vorlagen im Repo und halte dich exakt an ihre Felder:
- Quest: `src/data/packs/k3_akte/quests.json` (title, kind `main`/`side`, case, summary, steps[text, done{Bedingungen}, target{map,id,label}])
- Dialog: `src/data/packs/k3_akte/dialogues.json` und `src/data/dialogues/kopfgeld.json` (start als Knoten-Id oder Liste `[{node, Bedingungen}]`, nodes{text, Effekte, choices[text, next, Bedingungen]})
- NPC: `src/data/packs/k3_akte/npcs.json` (name, role, dialogue, palette, sheet)
- Gegenstand: `src/data/items.json` (kind, weight, desc, …), Ausrüstung mit `kind: gear` und `boons` wie in `docs/story/vorrat_items/items.json`
- Kampf: `src/data/packs/k3_orte/bosses.json` und `zones.json` (name, sheet, hp, atk, tier, skills, intro, attacks[name, damage, hits, windup], on_win, lose_to, lose_text, drops)
- Hinweise, Deduktionen, Enden: `src/data/packs/k3_akte/case.json` (`facts`, `clues`, `deductions` mit `pairs`, `endings`)
- Karten-Objekte zum Lesen/Untersuchen: `src/data/packs/k3_orte/maps.json` → `interactables` mit `kind: "read"` (title, text, footer, done_flag, effects, visible_if)
- Platzierung von Figuren und Objekten: `src/data/packs/k3_leben/platzierung.json` (`visible_if`, Tageszeit `zeit`)
- Epiloge: `src/data/packs/k3_akte/epiloge.json`; Zeitung: `src/data/packs/k3_akte/zeitung.json`; Gerede: `src/data/packs/k3_leben/gerede.json`; Lesestücke und Bestiarium: `src/data/packs/lore/`
- Koop-Geplauder: `src/data/packs/koop_k3/geplauder.json` (Stimmen `p2a`/`p2b`, Flag `koop_aktiv`)

**Bedingungen** (auf Choices, Startknoten, `done`, `visible_if`): `requires_flags`, `hide_if_flags`, `requires_items`, `hide_if_items`, `requires_clues`, `hide_if_clues`, `requires_any_clues`, `requires_conclusions`, `hide_if_conclusions`, `requires_quests_active`, `requires_quests_done`, `hide_if_quests`, `requires_money`, `requires_honor`, `requires_nerves`, `max_nerves`, `requires_bond`, `requires_pathway` (`[pfad, grenze]`).

**Effekte** (auf Dialogknoten oder `effects`): `sets_flags`, `clears_flags`, `gives_items` {id: Anzahl}, `takes_items`, `gives_money`, `takes_money`, `gives_clues`, `start_quests`, `complete_quests`, `honor`, `bond`, `wanted`, `encounter` (Kampf-Id), `travel` {map, spawn}, `nerves`, `unruhe`, `damage`, `heal`, `scene`, `shop`.

Wenn du ein Feld brauchst, das es nicht gibt, **erfinde kein neues Feld in den Daten**, sondern schreib es in `offene_punkte.md` (was du brauchst und warum).

### 0.3 IDs
- Alle **neuen** IDs (Quests, Flags, Hinweise, Items, Kämpfe, Dialoge, NPCs) beginnen mit dem Präfix deines Pakets (steht oben in der Datei). So gibt es keine Kollisionen mit den Paketen, die parallel laufen.
- Vorhandene Karten, NPCs, Items und Flags darfst du **benutzen** (nachschlagen in `src/data/` und im Vorrat `docs/story/vorrat_*/`), aber nicht umschreiben. Wenn eine vorhandene Figur einen neuen Gesprächszweig bekommt, liefere ihn als **Zusatz**: `dialog_zusaetze.json` mit `{ "<dialog-id>": { "choices_add": [...], "nodes_add": {...} } }`.
- Kampf-Gewinn setzt im Spiel automatisch das Flag `won_<kampf-id>`.

### 0.4 Ton und Sprache
- Deutsch, Spieler wird mit „du“ angesprochen. Wörtliche Rede in „deutschen Anführungszeichen“.
- Kurze Absätze (2 bis 5 Sätze pro Dialogknoten, Lesetexte höchstens ca. 120 Wörter, Oberflächentexte höchstens 140 Zeichen). Melancholisch, geheimnisvoll, trockener Humor, nie blutrünstig.
- Viktorianisch-industrielles Setting mit okkulten Untertönen: Gaslaternen, Ruß, Kanäle, Nebel, Rohrpost, Dampf, Glas.
- Keine Gedankenstriche als Satzverbinder, lieber Punkt oder Komma.
- Jede Quest braucht eine Belohnung (Geld, Gegenstand, Ehre oder Bindung) und mindestens eine echte Entscheidung oder einen Hinweis, den man finden muss.
- Koop: jede Zeile funktioniert mit einem oder zwei Spielern.

### 0.5 Prüfen vor dem PR
Schreib `pruefen.mjs` (Node, keine Pakete) und lass es laufen. Es soll mindestens prüfen:
1. Alle JSON-Dateien im Ordner sind gültig.
2. Jedes `next` zeigt auf einen existierenden Knoten im selben Dialog.
3. Jedes Flag, das irgendwo verlangt wird (`requires_flags`, `done`), wird irgendwo gesetzt (in deinem Ordner, im Vorrat oder schon in `src/data/`), außer `won_<kampf-id>`.
4. Jede referenzierte Karte, NPC-Id, Item-Id und Kampf-Id existiert in `src/data/`, im Vorrat `docs/story/vorrat_*/` oder in deinem Ordner (Karten aus `loadContent()` in `tests/helpers.js`).
5. Alle neuen IDs tragen das Paket-Präfix.
Die Ausgabe des Skripts kommt in die PR-Beschreibung.

### 0.6 Grafikwünsche
Wenn eine neue Figur, ein neues Item oder ein neuer Gegner ein Bild braucht, trag es in `grafikwuensche.md` ein: ID, Art (Lauf-Sheet 64x128, Portrait 64x64, Item-Icon 16x16, Kampf-Gegner 64x64 6 Spalten), ein Satz Beschreibung auf Deutsch und ein englischer Bild-Prompt (1 bis 3 Sätze, ohne Style-Block). Bis die Grafik da ist, nenne einen vorhandenen Platzhalter im Feld `platzhalter` der Grafikwunsch-Liste, nicht in den Spieldaten.

### Lieferformat (zusätzlich zu 0.2)
Das Spiel lädt Inhalts-Pakete aus `src/data/packs/<name>/` über `applyQuestPack` in `src/data/questPacks.js` und `buildContent` in `src/data/buildContent.js`. Liefere **genau diese Dateien im selben Format** in deinen Ordner `docs/story/<paket>/`: `quests.json`, `dialogues.json`, `dialog_zusaetze.json`, `npcs.json`, `case.json`, `items.json`, `encounters.json`, `platzierung.json`, dazu, was unten steht. Leere Standarddateien sind erlaubt. Eingebaut wird es danach von Claude, nicht von dir.

---

### Vorhandene Formate (bitte im Repo nachlesen, nicht erfinden)
- Einwohner und Plätze: `src/data/packs/k3_leben/einwohner.json`, `platzierung.json` (`visible_if`, Feld `zeit` tag/nacht), `leben.json` (Tiere/Wetter je Karte), `streifen.json`. Wexmoor-Vorbild: `src/world/WexmoorLife.js` (nur lesen).
- Gerede: `src/data/packs/lore/gerede.json` (Kettlegate, aus AD), Zeitung: `src/data/packs/lore/zeitungen.json`.
- Kettlegate-Karten: `src/data/maps/*.json` (Dateiname = Karten-Id; lies kurz jede Karte). Stadtgegner und Kopfgeld: `src/data/stadtgegner.json`, `src/data/dialogues/kopfgeld.json`.
- Fälle 1 bis 9 setzen Flags `case_<n>_done` bzw. die Enden in `src/data/case_*.json`; das Kapitel-1-Finale setzt `kapitel1_done` (prüfe die echten Namen).

## 1. Daten (`docs/story/kg_leben/`)
- **10 Einwohner `kgl_e_*`** mit Tagesplänen über 2 bis 3 Karten (tags Arbeit, nachts Taverne oder Heimweg): Laternenanzünder, Zeitungsjunge, Fischweib am Kanal, Schornsteinfegerin, Droschkenkutscher, Leichenwäscherin von St. Ebba, Lehrling des Uhrmachers, Bettler mit Hund am Nordtor, Wäscherin vom Altmarkt, Nachtwächter des Theaters. Je 6 bis 8 Dialogknoten, drei Ansehensbegrüßungen, eine Pfadreaktion, **Reaktionen auf den Fallstand** (nach Fall 3, 6, 9 je eine neue Zeile) und auf die Fahndung.
- **100 Gerede-Zeilen** nach Viertel, Tageszeit und Kapitel-1-Fortschritt (Format `gerede.json`), ergänzend zu AD, kein Duplikat.
- **Tiere und Wetter** je Kettlegate-Karte in `leben.json`: Nebelstufen (dünn, dicht, Rußschnee), Nieselregen, Kanalgeruch als Partikel; Tauben, Ratten, Katzen auf Mauern, Hunde, Möwen am Hafen, Fledermäuse an der Sternwarte, Pferde vor Droschken.
- **8 Stände und Straßenszenen** (`staende.json`, Format Händler aus `src/data/market.json`): Kastanienröster (Herbst/Winter), Zeitungsstand, Heißwasserverkäufer, Streichholzmädchen, Drehorgelspieler mit Affe (nur Geräusch, kein Handel), Scherenschleifer, Austernkarren am Hafen, Laternenöl-Händler; je 4 bis 8 Waren oder ein Dialog.
- **6 kleine Stadt-Ereignisse** (`ereignisse.json`, je ein Dialog, 5 bis 10 Minuten, Zufall pro Kartenbesuch 0,1): Droschkenunfall, Schornsteinbrand, Taschendieb (Verfolgung als drei Entscheidungen), Straßenprediger der Rostbrüder, Kinder mit Kreidekreis, ein Brief, der an die falsche Tür geliefert wurde. Belohnung Schilling 10 bis 40 oder Ansehen; keine Kämpfe nötig, ein optionaler mit vorhandenen Stadtgegnern.
- **Zeitung:** 12 Meldungen im „Kettlegater Nebelboten“ zu Einwohnern und Ereignissen.
- **Koop:** 20 Geplauder-Zeilen für Kettlegate-Karten (Format `src/data/packs/koop_k3/geplauder.json`).
- Standard-Dateien, `README.md` (Zählung, Einbauhinweise: wo `WexmoorLife.js` als Vorbild dient), `offene_punkte.md`, `pruefen.mjs` (Karten-Ids gegen `loadContent()` aus `tests/helpers.js`, Textlängen, eindeutige Ids).

## 2. Grafik (Batch `kettlegate_leben`)
Style-Block, Formate und Nachbearbeitung wie in jedem Grafikpaket (Style-Block aus `docs/art/codex_BV_feste_jahreszeiten.md` Abschnitt 0.1, Figuren 64x128, Köpfe 24x24, Palette max. 32 Farben, Manifest, Prüfskript, Vorschau, `docs/art/README.md`-Abschnitt).
- **10 Lauf-Sheets** `characters/kgl_e_<id>.png` + Köpfe `portraits/heads/kgl_e_<id>.png` + je eine Sonderpose 16x32 (Laterne anzünden, Zeitung schwenken, Fisch ausnehmen, Besen schultern, Peitsche, Tuch wringen, Lupe, Hund streicheln, Wäsche, Laterne heben).
- **Tiere** `fx/kgl_tiere.png` 16x16 bzw. 16x32, je 4 Frames: Taube (picken, auffliegen), Ratte (huschen), Katze (sitzen, Schwanz), Hund (liegen), Möwe (sitzen, Flügel), Fledermaus (flattern), Pferd vor Droschke (32x32, 2 Frames Kopf).
- **Wetter** `fx/kgl_wetter.png`: Nieselregen 64x64 x 6, Rußschnee 64x64 x 6, dichter Nebel-Schwaden 96x48 x 4, Kanalgeruch (feine grüne Schlieren) 32x32 x 4, Pfützen-Kacheln 16x16 x 4 (mit Regentropfen-Frames).
- **Stände und Szenen** `props/kgl_staende.png` 32x32 bzw. 48x32: Kastanienröster (Glut 2 Frames), Zeitungsstand, Heißwasserwagen (Dampf 2 Frames), Streichholzkiste, Drehorgel mit Affe (4 Frames), Scherenschleifer-Rad (4 Frames Funken), Austernkarren, Ölhändler-Karren, Droschke von der Seite 64x32 (2 Frames), umgestürzte Droschke, brennender Schornstein (fx 16x32 x 4), Kreidekreis.
- **Fassaden-Zusätze bei Nacht** `props/kgl_nacht.png`: erleuchtete Fenster-Overlays 16x16 (4 Varianten, 2 Frames Flackern), Laterne an/aus als Overlay, Rauch aus Schornsteinen 16x32 x 4.
- **Stadtkarte-Leben** `ui/kgl_karte_pins.png`: 10 kleine Köpfe 12x12 für die Aufenthaltsorte der Einwohner auf der Stadtkarte (Personen-Wegweiser).

## 3. Spielregeln
- Nichts blockiert Fälle oder das Finale; Einwohner stehen nie auf Tatort-Kacheln oder vor Türen, die Fälle brauchen (prüfe `interactables` der Karten).
- Nachtmarkt bleibt sichere Zone; Ereignisse dort nur ohne Gegner.
- Fahndung ab Stufe 2: Einwohner weichen aus (eigene Zeile), Stände schließen.

## 4. Lieferung
Daten in `docs/story/kg_leben/` wie oben, Grafik unter `public/sprites/` mit Manifest, `docs/art/batch-kettlegate-leben-generation.json`, Prüfskript `tools/art/kettlegate_leben/check.py`, Vorschau. Eine Zeile in `docs/story/README.md`, ein Abschnitt in `docs/art/README.md`. Dann Pull Request(s).

