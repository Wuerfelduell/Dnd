# Codex-Paket CK: Jahreszeiten und Feste als Spielinhalt (Daten + Texte)

**Paket-Name:** `feste_leben` · **Ordner:** `docs/story/feste_leben/` · **ID-Präfix:** `fs_` · **Grafik dazu:** Paket BV (Batch `feste`, schon geliefert: Saison-Overlays, Partikel, Fest-Props, Gäste, Banner, Sequenzbilder)

Die Grafik der vier Jahreszeiten und drei Stadtfeste liegt im Repo (`public/sprites/manifest-feste.json`), aber nichts davon ist Spielinhalt: kein Kalender, keine Wirkung, keine Buden, keine Aufträge, kein Gerede. Du lieferst die Daten und alle Texte, damit die Welt sich über die Spielzeit verändert und drei Feste wirklich stattfinden. Der Einbau (Kalender aus `src/core/Clock.js`, Overlays, Wirkungen) folgt separat; bleib beim vorhandenen Format.

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

### Vorhandene Zeitrechnung (bitte im Repo nachlesen, nicht erfinden)
`src/core/Clock.js`: Tag und Nacht wechseln alle 15 Minuten Spielzeit (`DAY_NIGHT_SECONDS`), Nachtflag `k3h_nacht`. Ein **Spieltag** sind also 30 Minuten. Es gibt noch keinen Tageszähler und keine Jahreszeit: schlag in `kalender.json` vor, wie beides aus der Spielzeit abgeleitet wird (Vorschlag: Jahreszeit wechselt alle 6 Spieltage, Reihenfolge Herbst → Winter → Frühling → Sommer, Start im Herbst; jedes Fest liegt am 4. Tag seiner Jahreszeit und dauert einen Spieltag; zusätzlich Flag `fs_fest_<name>_aktiv`, damit Tests und Dialoge ohne Uhr funktionieren).

## 1. Kalender und Wirkungen (`kalender.json`, `wirkungen.json`)
- `kalender.json`: vier Jahreszeiten `fs_herbst`, `fs_winter`, `fs_fruehling`, `fs_sommer` mit `name`, `beschreibung` (2 Sätze), `overlay` (Sheet-Namen aus `manifest-feste.json`), `partikel`, `fassaden_zusatz` je Stadt; drei Feste `fs_laternennacht` (Kettlegate, Herbst), `fs_salzsegen` (Wexmoor, Frühling), `fs_schichtwechsel` (Dunscar, Sommer) mit `stadt`, `karten` (vorhandene Karten-Ids, auf denen Props stehen), `jahreszeit`, `dauer_tage: 1`, `banner`, `sequenzbild`, `ankuendigung` (Zeitungsmeldung 2 Tage vorher), `musik_wunsch` (Paket CL liefert `fest_<name>`). Winter hat kein Fest, dafür den „Stillen Abend“ (`fs_stiller_abend`): alle Läden zu, Nerven +5 beim Ausruhen, ein Lesestück je Unterschlupf.
- `wirkungen.json`: je Jahreszeit 4 bis 6 spürbare, kleine Wirkungen als Spezifikation mit vorhandenen Feldern, wo möglich (z. B. Winter: Reise kostet +1 Schilling, `nerves: -2` beim Betreten von Außenkarten nachts, Heiltränke heilen +10 % im Warmen; Sommer: Hitzeflimmern-Overlay, Kanalgeruch, Marktpreise für Wasser steigen; Herbst: Pilze und Kastanien als Sammelgut auf Außenkarten; Frühling: Regen, Tiere, Markt billiger). Nie härter als ±15 %, nie blockierend, Koop gleich. Was ein neues Feld braucht, kommt mit Begründung in `offene_punkte.md`.

## 2. Die drei Feste (je ein Ordnerabschnitt in `feste.json` + Dialoge)
Je Fest:
- **4 Buden** als Händler (`shop` mit 6 bis 8 Waren, Format `src/data/market.json`): nur an diesem Tag, Festwaren mit Präfix `fs_` (Papierlaterne, Kerzenboot, Glühwein, Räucherfisch, Salzkranz, Lohntüten-Los, Bierkrug, Kandis), je ein Satz `desc`, Gewicht, Preis, Wirkung in vorhandenen Feldern (Nerven, HP, einmaliger Bonus).
- **Festbesucher**: 6 Dialoge (die vier generischen Gast-Sheets aus BV plus zwei bekannte Figuren der Stadt), je 4 bis 6 Knoten, mit den 6 Gerede-Symbolen aus BV als Stimmung (`mood`-Feld wie in `src/data/moods.js`, wenn passend).
- **Ein Fest-Auftrag** (Kette, 4 bis 5 Schritte, 30 Minuten): Laternennacht „Das Boot ohne Kerze“ (ein Kerzenboot treibt gegen den Strom; Spur zur Resonanzkammer, kein Kampf nötig), Salzsegen „Die Salzkönigin fehlt“ (der Thron aus Fässern ist leer; Sedge, Brack und die Täfelchengilde haben alle ein Motiv), Schichtwechsel „Die Lohntüte zu viel“ (eine Tüte trägt den Namen eines Schichtgängers; Esther und Pfiff reagieren je nach `k3a_end_*`). Belohnung je 60 bis 120 Schilling plus ein Fest-Andenken (Artefakt mit kleinem Segen, Quelle `fest`, Format `pathways.json` → `artifacts.list`).
- **Ein Fest-Spiel als Dialog** (bis der Code da ist): Kerzenboot setzen (3 Entscheidungen, Nerven +), Kahnprozession (Reihenfolge der Kähne erraten aus Hinweisen), Boxring aus Seilen (Kampf gegen `fs_boxer_<n>`, Format `stadtgegner.json`, nicht tödlich, Preisgeld).
- **Koop**: 6 Geplauder je Fest, ein Zweig im Fest-Auftrag nur zu zweit.
- **Zeitung**: je Fest 3 Meldungen (Ankündigung, Festtag, Nachlese), Format `src/data/packs/k3_leben/zeitung.json`, in der jeweiligen Stadtzeitung.
- Feste finden auch statt, wenn der Spieler nicht in der Stadt ist (Nachlese erwähnt, was er verpasst hat; keine Strafe).

## 3. Saison-Texte (`texte.json`)
Je Jahreszeit: 10 Gerede-Zeilen je Stadt (30 je Jahreszeit, Format `gerede.json`), 3 Lesestücke (Wetterbericht in der Zeitung, Aushang, Kinderreim), 2 HUD-Hinweise beim Wechsel (140 Zeichen), eine Zeile je Unterschlupf-Verbündeten (Zunder, Pfiff, Klammer, Frost) zur neuen Jahreszeit, Händler-Spruch je Markt. Dazu 4 Koop-Geplauder je Jahreszeit.

## 4. Spielregeln
- Keine Jahreszeit und kein Fest blockiert Hauptgeschichte, Fälle oder Kapitelenden; alle Festkarten bleiben normal begehbar.
- Festtage sind **sichere Tage**: keine Stadtgegner auf den Festkarten (wie Nachtmarkt), Fahndung pausiert dort nicht, aber Grauspäher feiern mit (`visible_if` auf Festflag, eigene Gerede-Zeile).
- Nerven-Gewinne höchstens +10 je Festaktion, keine permanenten Boni außer dem Andenken.

## 5. Lieferung
`docs/story/feste_leben/`: `kalender.json`, `wirkungen.json`, `feste.json`, `dialogues.json`, `dialog_zusaetze.json`, `quests.json`, `items.json`, `encounters.json`, `platzierung.json` (Props und Buden aus BV je Festkarte mit `visible_if`), `texte.json`, `zeitung.json`, `geplauder.json`, `README.md` (Kalendervorschlag, Zählung, Einbauhinweise), `offene_punkte.md`, `pruefen.mjs` (prüft Karten-Ids gegen `loadContent()` aus `tests/helpers.js`, Sheet-Namen gegen `manifest-feste.json`, Textlängen, eindeutige Ids). Eine Zeile in `docs/story/README.md`. Dann ein eigener Pull Request.

