# Codex-Paket AC: Kapitel 3, Story-Entwurf und Akt I als Daten

**Paket-Name:** `kapitel3` · **Ordner:** `docs/story/kapitel3/` · **ID-Präfix:** `k3_`

Kapitel 1 (Kettlegate, 9 Fälle) und Kapitel 2 (Wexmoor, eine lange Jagd in 5 Akten) sind fertig. Für Kapitel 3 gibt es nur einen offenen Haken: **das, was unter dem Moor liegt und Namen frisst.** Du schreibst einen vollständigen Story-Entwurf und Akt I davon als fertige Spieldaten. Das ist ein **Entwurf zur Auswahl**: Seb entscheidet danach, was davon ins Spiel kommt.

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
- `src/data/campaign.json`, `src/data/case_09.json` (Ende Kapitel 1, Flag `kapitel1_done`)
- `src/data/wexmoor.json`: `quests` (Akte), `case` (Fakten, Deduktionen, **`endings`**), `dialogues` von `zunder`, `sedge`, `brandt`, `lichtmann`, `marlowe_wexmoor`, `vey_wexmoor`, `kit_wexmoor`. Die Lesetexte (`interactables` mit `kind: "read"`) in den Karten erzählen viel über das Moor, die Namens-Täfelchen und den Leuchtturm.
- `src/data/pathways.json`: die Pfade (Fähigkeiten-Linien) und Sequenzen 9 bis 5 des Spielers. Kapitel 3 sollte den Weg zu Sequenz 4 öffnen.
- `src/data/treffen.json`: geheime Zirkel und Auktionen.

## 2. Was schon feststeht
- Kapitel 2 hat vier Enden: `k2_rein` (vor Gericht), `k2_moor`, `k2_lichtmeister`, `k2_meer`. Alle setzen `kapitel2_done`. Kapitel 3 muss **mit jedem Ende** funktionieren und darf darauf Bezug nehmen (Flags `k2_end_*`).
- Magistra Ilse Brandt war die Drahtzieherin hinter Starling. Der Spieler war ihre „letzte Ernte“.
- Das Moor nimmt sich alles, was zu lange stillsteht, auch Namen. Früher bekam es Namen auf Täfelchen geschenkt; der Leuchtturm hat das ersetzt.
- Wichtige Figuren dürfen wiederkommen, aber selten: Zunder (Buddy aus Kapitel 2), Marlowe, Kit, Kohlen-Jem, Vey (nur wenn `vey_fled`).
- Seb mochte an Kapitel 2: eine große Jagd statt vieler Einzelfälle, eine neue Stadt komplett erkunden, eine eigene Kernmechanik (dort: Polizei mit Lichtkegeln, Fahndung, Verkleidung), ein früher Unterschlupf mit einem Verbündeten.

## 3. Was du lieferst
### 3.1 Zwei kurze Pitches (`pitches.md`)
Zwei unterschiedliche Richtungen für Kapitel 3, je eine halbe Seite: Schauplatz (neue Stadt oder Ort mit 5 bis 7 Vierteln, eigener Stimmung, nicht wieder Moor-Küste), Gegenspieler, Kernmechanik (so prägend wie die Polizei in Wexmoor, aber anders), Verbündeter, Unterschlupf, wie die Namen-fressende Macht hineinspielt, wie es endet. Empfiehl einen davon und sag warum.

### 3.2 Story-Bibel zum empfohlenen Pitch (`bibel.md`)
- Prämisse, Thema, Ton.
- Schauplatz: jedes Viertel mit 3 bis 5 Sätzen, wichtigste Orte, Gefahrengebiete (mindestens 3, mit Boss).
- Figuren (8 bis 12): Name, Rolle, Geheimnis, wie man sie trifft, Pfad (aus `pathways.json`), falls übernatürlich. Namen originell, passend zur Welt (englisch-viktorianisch klingende Nachnamen, deutsche Spitznamen wie „Zunder“).
- Kernmechanik in Spielregeln beschrieben (was der Spieler tut, was passiert, wie man scheitert). Was davon neuen Code braucht, kommt in `offene_punkte.md`, nicht in die Daten.
- Struktur: 5 Akte x 4 Fährten wie in Kapitel 2. Pro Fährte: Ziel, Ort, Hinweise, Deduktion, die sie abschließt.
- Enden: 3 bis 4 Enden mit Bedingungen.
- Bezüge zu den vier Enden von Kapitel 2.

### 3.3 Akt I als fertige Spieldaten
Akt I komplett spielbar beschrieben, im Format von `src/data/wexmoor.json`:
```
docs/story/kapitel3/akt1/
  kapitel3.json   { city, case, quests, npcs, dialogues, items, encounters } genau wie wexmoor.json aufgebaut (Teilmenge)
  karten.md       jede neue Karte: Name, Größe in Kacheln, Beschreibung, wo Türen/Figuren/Objekte stehen, Tileset-Wunsch
  lesetexte.json  alle Interactables mit kind "read" pro Karte: [{map, id, title, text, footer, visible_if, effects}]
```
- Ankunft, Verbündeter, Unterschlupf, die ersten 4 Fährten mit Hinweisen und Deduktionen, Ende von Akt I (Flag `k3_akt1_done`).
- Ca. 40 bis 70 Dialogknoten, 15 bis 25 Hinweise, 4 bis 6 Deduktionen.
- Karten musst du **nicht** als `rows` bauen; eine gute Beschreibung in `karten.md` reicht.

### 3.4 Weiteres
- `grafikwuensche.md`: alle Figuren, Kacheln, Gegner und Items aus Akt I (Format siehe 0.6), dazu je ein englischer Prompt für Stadtkarte und Titelbild des Kapitels.
- `musikwuensche.md`: 4 bis 6 Stücke für Kapitel 3 (Name, Stimmung, Instrumente, wo im Spiel), passend zu den Musik-Regeln in `tools/audio/musik/` falls das Musik-Paket schon da ist, sonst frei.
- `offene_punkte.md`: alles, was Code braucht.
- `pruefen.mjs` für `akt1/kapitel3.json` und `akt1/lesetexte.json` (siehe 0.5).
