# Codex-Paket AI: Texte für den Koop-Modus (Spieler 2)

**Paket-Name:** `koop` · **Ordner:** `docs/story/koop/` · **ID-Präfix:** `koop_`

Im lokalen Koop spielt ein zweiter Mensch mit: eigene Figur, eigenes Inventar, eigener Pfad, gemeinsamer Kampf. Bisher sagt Spieler 2 nie etwas, und die Welt bemerkt ihn nicht. Das ändert dieses Paket: eine Hintergrundgeschichte, Sprüche zwischen den beiden, Reaktionen der wichtigsten Figuren und drei Aufträge, die man nur zu zweit lösen kann.

Ein Grafik-Paket (AH) zeichnet gleichzeitig zwei wählbare Figuren für Spieler 2:
- **`p2a`**: Frau Ende zwanzig, Schiebermütze, flaschengrüner Mantel, senfgelbes Halstuch. Wach, schnell, etwas frech.
- **`p2b`**: Mann Mitte dreißig, Melone, ockerbrauner Mantel, runde Brille. Ruhig, gründlich, ein bisschen pedantisch.
Schreib **beide Stimmen**: wo Spieler 2 spricht, gibt es je eine Fassung für `p2a` und `p2b` (gleicher Inhalt, andere Art zu reden).

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
- `src/core/Party.js` (wie Spieler 2 funktioniert: was geteilt ist, was persönlich ist), damit die Texte nichts versprechen, was das Spiel nicht kann.
- Kapitel 1: `src/data/campaign.json`, `src/data/case_01.json` bis `case_09.json`. Kapitel 2: `src/data/wexmoor.json`.
- Ton-Vorlagen: Dialoge von `zunder` und `marlowe_wexmoor` in `wexmoor.json`.

## 2. Wer ist Spieler 2? (`hintergrund.md`)
- Eine Hintergrundgeschichte, die für **beide** Varianten funktioniert und erklärt, warum diese Person dem Ermittler hilft. Sie muss jederzeit dazukommen und wieder gehen können (Spieler 2 tritt im Esc-Menü bei oder aus), also kein fester Platz in der Hauptstory: z. B. jemand aus dem Revier-Archiv in Kettlegate, der später heimlich nach Wexmoor nachkommt.
- Vorschlag für Namen: je Variante 3 Namen zur Auswahl (Vor- und Nachname, passend zur Welt) und ein Spitzname, den der Ermittler benutzt.
- **Beitritt und Abschied:** je ein kurzer Text (2 bis 4 Sätze) für Beitritt und Austritt, getrennt für Kapitel 1 und Kapitel 2 (in Wexmoor ist man gesucht, also kommt Spieler 2 heimlich).

## 3. Gespräche unterwegs (`geplauder.json`)
Kurze Wechsel zwischen den beiden (2 bis 4 Zeilen, Sprecher `p1` und `p2`), ausgelöst beim Betreten einer Karte. Insgesamt **80**: 40 in Kettlegate, 40 in Wexmoor, über alle Karten verteilt, viele mit Bedingungen auf Fall- bzw. Akt-Fortschritt.
```json
[{ "id": "koop_pl_altmarkt_1", "map": "altmarkt", "requires_flags": ["case_02_closed"],
   "zeilen": [ {"p": "p2", "a": "Text p2a", "b": "Text p2b"}, {"p": "p1", "text": "..."} ] }]
```
Der Ermittler (`p1`) bleibt knapp und trocken. Spieler 2 kommentiert, scherzt, fragt nach.

## 4. Kampfsprüche (`kampf.json`)
Ein bis sechs Wörter, je 10 Varianten (für `p2a` und `p2b` getrennt): Kampfbeginn, Bosskampf beginnt, Partner fällt (K.o.), Partner wird wieder aufgestellt, gelungene Parade, Kombi-Angriff, Sieg, knapper Sieg (wenig Leben), Flucht. Dazu je 5 Sprüche des Ermittlers für dieselben Anlässe.

## 5. Reaktionen der Welt (`dialog_zusaetze.json`)
Für die 12 wichtigsten Figuren (Kettlegate: `marlowe`, `holt`, `pimm`, `greta`, `quill`, `kit`; Wexmoor: `zunder`, `sedge`, `hale`, `brack`, `druce`, `elsbeth`) je ein neuer Gesprächszweig, der nur im Koop erscheint: Die Figur bemerkt Spieler 2 und sagt etwas Eigenes dazu. 2 bis 4 Knoten pro Figur. Als Bedingung nutze `"requires_flags": ["koop_aktiv"]` und schreib in `offene_punkte.md`, dass das Spiel dieses Flag setzen muss, solange Spieler 2 dabei ist.

## 6. Drei Koop-Aufträge (`quests.json`, `dialogues.json`, `case.json`, `items.json`, `encounters.json`, `platzierung.json`)
Aufträge, die sich **nur zu zweit** lösen lassen, weil beide Figuren gleichzeitig an verschiedenen Stellen stehen müssen. Wie das technisch erkannt wird, beschreibst du in `offene_punkte.md` (z. B. „beide Spieler stehen auf je einem Schalter“); in den Daten nutzt du dafür Interactables mit einem Flag pro Spieler (`koop_<auftrag>_p1`, `koop_<auftrag>_p2`).
1. **`koop_zwei_schluessel`** (Kettlegate, Revier-Archiv, nach Fall 4): Ein Schrank mit zwei Schlössern an verschiedenen Wänden. Beide müssen gleichzeitig drehen.
2. **`koop_ablenkung`** (Wexmoor, Salzmarkt, Akt II+): Einer lenkt den Grauspäher ab, der andere schleicht ins Kontor. Kein Kampf gegen die Polizei.
3. **`koop_spiegelbild`** (Kettlegate, Spiegelkabinett, nach Fall 6): Ein Spiegel zeigt nur dem jeweils anderen, wo der Ausgang ist. Rätsel über abwechselnde Hinweise.
Belohnung: je ein Gegenstand, den nur Spieler 2 benutzen kann (in `offene_punkte.md` erklären) oder Geld.

## 7. Lieferumfang
```
docs/story/koop/
  README.md  hintergrund.md  geplauder.json  kampf.json  dialog_zusaetze.json
  quests.json  dialogues.json  case.json  items.json  encounters.json  platzierung.json
  grafikwuensche.md  offene_punkte.md  pruefen.mjs
```
`pruefen.mjs` prüft zusätzlich (und lässt `koop_aktiv` als Ausnahme bei Regel 3 gelten): jede `map` in `geplauder.json` existiert, jede Zeile mit `"p": "p2"` hat `a` und `b`.
