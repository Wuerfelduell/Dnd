# Codex-Paket AF: Höhere Sequenzen (4 bis 1) und neue Pfade

**Paket-Name:** `sequenzen` · **Ordner:** `docs/story/sequenzen/` · **ID-Präfix:** `sq_` (nur für neue Items, Flags, Rituale; Skill-IDs ohne Präfix, aber eindeutig)

Der Spieler folgt einem von 7 Pfaden und steigt von Sequenz 9 bis Sequenz 5 auf (`SEQ_MAX = 5`). Für Kapitel 3 und danach soll es weitergehen: **Sequenz 4 bis 1 für alle 7 Pfade** und **3 neue Pfade** komplett von 9 bis 1. Du lieferst alles als fertige Daten im Format von `src/data/pathways.json`, dazu Lore, Rituale, Zutaten und Balancing-Vorschläge. Eingebaut wird separat.

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

### 0.3 IDs (für dieses Paket gilt zusätzlich der Kopf oben)
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

## 1. Erst lesen (Pflicht)
- `src/data/pathways.json`: `pathways` (7 Pfade: laterne, faden, maske, echo, kessel, eisen, schluessel; je `name`, `short`, `color`, `lore`, `principle`, `digest_hint`, `digest`, `growth`, `seqs` 9 bis 5), `items` (Trank-Zutaten), `artifacts`, `ritual_rules`.
- `src/core/Pathways.js`: Konstanten `SEQ_MAX`, `DIGEST_RATE`, `SEQ_GROWTH_STEPS`, `DIGEST_LABELS` (was zur Verdauung zählt), `MULT_KEYS` (welche Passiv-Werte multiplizieren statt addieren).
- `src/core/Combat.js`: wie Fertigkeiten wirken. Vorhandene Skill-Felder: `cost`, `hits`, `flat`, `mult`, `holy`, `burn` [Schaden, Runden], `stun`, `weak`, `pierce`, `shield`, `heal`, `drain`, `evade`, `confuse`, `sure`, `composure` (kostet Nerven).
- Vorhandene Passiv-Schlüssel: `max_hp`, `max_nerves`, `atk`, `ap_start`, `dmg_mult`, `occult_mult`, `damage_taken`, `dodge_window`, `parry_ap`, `heal_bonus`, `vision_cost`, `composure_regen`, `skill_composure`, `calm_decay`, `use_calm`, `unruhe_tick`, `digest_mult`, `price`, `sell`, `money_bonus`, `honor_loss`, `conclusion_honor`, `link_hints`, `lock_bonus`, `carry`, `always_flee`.
- Gegner zum Vergleichen: `src/data/encounters.json`, `src/data/wexmoor.json` → `encounters` (Kapitel-2-Bosse), `tests/combat.test.js` und `tests/scaling.test.js` (wie Balance getestet wird).

**Nur vorhandene Skill-Felder und Passiv-Schlüssel benutzen.** Wenn eine Idee ein neues Feld braucht (z. B. Beschwörung, Rundenzähler, Flächenschaden), beschreibe es in `neue_mechaniken.md` mit Regel, Werten und Beispiel, und gib in den Daten trotzdem eine Version, die mit vorhandenen Feldern funktioniert.

## 2. Grundidee der höheren Sequenzen
- **Sequenz 4** ist ein Bruch: Ab hier ist man kein Mensch mit Gaben mehr, sondern halb etwas anderes. Jede Seq-4-Stufe bringt eine **sichtbare Veränderung** (Text in `desc`, z. B. kein Spiegelbild, Schatten bewegt sich falsch) und einen **Preis** als Nachteil-Passiv (z. B. `unruhe_tick` höher, `price` teurer, weil Händler Angst haben, `honor_loss`).
- **Sequenz 3 bis 1** sind Endgame. Rituale werden große Ereignisse mit Bedingungen über mehrere Kapitel (Flags aus Kapitel 1 und 2 dürfen vorkommen, z. B. `kapitel2_done`, Boss-Siege `won_<id>`). Sequenz 1 ist fast ein Mythos: Ritual und Zutaten so, dass sie eine eigene Questreihe bräuchten (in `offene_punkte.md` skizzieren).
- Jede Stufe passt zum `principle` und zur Verdauung des Pfads. Die Namen steigern das Bild der unteren Stufen (Laterne: Laternenträger → … → Flammenzeuge → ?).
- Ton: geheimnisvoll, nicht episch-kitschig. Keine Namen oder Begriffe aus fremden Werken; besonders keine Sequenz- oder Pfadnamen, die es in bekannten Büchern oder Spielen schon gibt.

## 3. Was du lieferst
### 3.1 `seq_4_bis_1.json`
Für jeden der 7 Pfade `{ "<pfad-id>": { "seqs": { "4": {...}, "3": {...}, "2": {...}, "1": {...} } } }`, jede Stufe genau im Format der vorhandenen Stufen: `name`, `desc`, `ingredients`, `skill` (id, name, cost, hits, flat, Effekte, desc), `passives` [{key, value, text}], `ritual` {name, map, vision, consumes, requires, desc}. Zusätzlich pro Stufe:
- `honor`: nötiges Ansehen für die Formel (Seq 6: 50, Seq 5: 70 als Vergleich).
- `growth_steps`: Vorschlag, wie stark Leben/Nerven wachsen (Seq 7 und 6 zählen doppelt).
- `digest_rate`: Vorschlag (Seq 5 ist 0.25).
- `veraenderung`: ein Satz, was sich am Körper/der Wahrnehmung des Spielers ändert.
- Die `map` des Rituals darf eine vorhandene Karte aus Kapitel 1 oder 2 sein, oder `"neu:<beschreibung>"` für einen Ort in Kapitel 3.

### 3.2 `neue_pfade.json`
3 neue Pfade, jeder komplett von 9 bis 1 im gleichen Format inkl. `name`, `short`, `color` (Hex, passend zur gedämpften Palette), `lore`, `principle`, `digest_hint`, `digest` (nur Schlüssel aus `DIGEST_LABELS`), `growth`. Vorschläge für Themen (du darfst eigene nehmen, wenn sie besser sind):
- **Pfad der Waage**: Händler, Schuld und Ausgleich. Lebt vom Handeln, Pfänden, Verträgen. Passt zu den geheimen Auktionen.
- **Pfad des Moores**: Vergessen und Bewahren. Nimmt Namen, gibt Namen. Verbunden mit Wexmoor und dem, was unter dem Moor liegt.
- **Pfad der Uhr**: Takt, Vorahnung, Wiederholung. Ausweichen und Parieren, Konzentration.
Jeder neue Pfad muss sich im Kampf und beim Ermitteln **anders spielen** als die 7 vorhandenen. Erkläre in `README.md` in einer Tabelle, was jeden der 10 Pfade ausmacht.

### 3.3 `zutaten.json`
Alle neuen Trank-Zutaten im Format von `pathways.json` → `items` (Name, kind, desc, weight, Preis, wo man sie findet: Händler, Gegner-Beute, Gefahrengebiet, Auktion). Höhere Sequenzen brauchen **Boss-Zutaten** (wie `nebelherz` für Seq 5): pro Stufe mindestens eine seltene, mit Vorschlag, welcher vorhandene oder künftige Boss sie fallen lässt.

### 3.4 `balancing.md`
- Tabelle aller Skills (alt und neu): Pfad, Seq, Kosten, Schaden pro Einsatz (gegen normal/okkult), Nervenkosten. Ziel: Seq-4-Skills ca. 1,5 x so stark wie Seq 5, jede weitere Stufe ca. 1,3 x. Rechne nach und zeig die Zahlen.
- Vorschlag für Leben/Nerven eines Spielers auf Seq 4 bis 1 (Basis 100 Nerven, Wachstum aus `growth`).
- Vorschlag, wie stark Gegner in Kapitel 3 sein müssen (Leben, Schaden), damit Seq 4 nicht alles wegfegt. Vergleiche mit den Kapitel-2-Bossen.
- Wenn du ein kleines Rechen-Skript brauchst: `docs/story/sequenzen/balancing.mjs` (liest `pathways.json` + deine Dateien, druckt die Tabelle). Kein Spielcode.

### 3.5 Weitere Dateien
- `artefakte.json`: 6 neue Artefakte für hohe Sequenzen im Format von `pathways.json` → `artifacts.list` (Vorteile und Flüche als Passive).
- `neue_mechaniken.md`: alles, was neue Felder oder Code braucht.
- `grafikwuensche.md`: pro neuer Fertigkeit ein Effekt-Wunsch (Kampf-Effekt 48x48, Frames, Farbe), pro neuem Pfad ein Pfad-Symbol 16x16 + 32x32 und eine Aura, pro neuer Zutat ein Icon 16x16 (Format siehe 0.6).
- `pruefen.mjs`: JSON gültig, jede Stufe hat alle Pflichtfelder, alle Zutaten existieren in `pathways.json` oder `zutaten.json`, alle Passiv-Schlüssel und Skill-Felder sind aus den Listen oben, Ritual-Karten existieren oder beginnen mit `neu:`.
