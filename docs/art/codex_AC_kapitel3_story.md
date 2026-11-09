# Codex-Paket AC: Kapitel 3, drei Geschichten zur Auswahl

**Paket-Name:** `kapitel3` · **Ordner:** `docs/story/kapitel3/` · **ID-Präfix:** `k3_`

Kapitel 1 (Kettlegate, 9 Fälle) und Kapitel 2 (Wexmoor, eine lange Jagd in 5 Akten) sind fertig. Für Kapitel 3 gibt es nur einen offenen Haken: **das, was unter dem Moor liegt und Namen frisst.** Du schreibst **drei vollständige, voneinander verschiedene Geschichten** für Kapitel 3. Seb sucht danach eine aus; erst dann wird sie als Spieldaten gebaut. Du lieferst also **Texte, keine Spieldaten**.

## 0. Gemeinsame Regeln für Text-Pakete (bitte zuerst lesen)

**Für dieses Paket gelten nur 0.1 und 0.4.** 0.2 (Datenformat), 0.3, 0.5 und 0.6 brauchst du erst, wenn die gewählte Geschichte als Daten gebaut wird; lies 0.2 trotzdem, damit deine Ideen zu dem passen, was das Spiel kann.

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

## 1. Erst lesen (Pflicht, bevor du schreibst)
Die drei Geschichten müssen zur bisherigen Story passen. Lies deshalb zuerst gründlich:
- **Kapitel 1 (Kettlegate):** `src/data/campaign.json`, alle Fälle `src/data/case_01.json` bis `case_09.json` (Fakten, Hinweise, Deduktionen, **Enden**), die Fall-Dialoge in `src/data/dialogues/` (vor allem `fall5.json`, `fall6.json`, `fall78.json`, `fall9.json`) und die Lesetexte in `src/data/maps/*.json` (`interactables` mit `kind: "read"`).
- **Kapitel 2 (Wexmoor):** `src/data/wexmoor.json` komplett: `quests` (Akt I bis V, Nebenaufträge `k2_s_*`), `case` (Fakten, Deduktionen, die vier `endings`), `dialogues` (vor allem `zunder`, `sedge`, `brandt`, `lichtmann`, `hale`, `marlowe_wexmoor`, `vey_wexmoor`, `kit_wexmoor`, `elsbeth`), `loners`, die Lesetexte in `maps`.
- **Welt-Regeln:** `src/data/pathways.json` (Pfade, Sequenzen 9 bis 5, Rituale, Artefakte), `src/data/treffen.json` (geheime Zirkel), `src/data/factions.json`.
Schreib danach in `docs/story/kapitel3/story_bisher.md` eine Zusammenfassung von Kapitel 1 und 2 (höchstens 2 Seiten): Hauptfiguren, wer was weiß, offene Fäden, wichtige Flags. Jede deiner drei Geschichten muss mindestens **drei** dieser offenen Fäden aufgreifen.

## 2. Was schon feststeht
- Kapitel 2 hat vier Enden: `k2_rein` (vor Gericht), `k2_moor`, `k2_lichtmeister`, `k2_meer`. Alle setzen `kapitel2_done`. Kapitel 3 muss **mit jedem Ende** funktionieren und darf darauf Bezug nehmen (Flags `k2_end_*`).
- Magistra Ilse Brandt war die Drahtzieherin hinter Starling. Der Spieler war ihre „letzte Ernte“.
- Das Moor nimmt sich alles, was zu lange stillsteht, auch Namen. Früher bekam es Namen auf Täfelchen geschenkt; der Leuchtturm hat das ersetzt.
- Wichtige Figuren dürfen wiederkommen, aber selten: Zunder (Buddy aus Kapitel 2), Marlowe, Kit, Kohlen-Jem, Vey (nur wenn `vey_fled`).
- Seb mochte an Kapitel 2: eine große Jagd statt vieler Einzelfälle, eine neue Stadt komplett erkunden, eine eigene Kernmechanik (dort: Polizei mit Lichtkegeln, Fahndung, Verkleidung), ein früher Unterschlupf mit einem Verbündeten.

## 3. Was du lieferst
### 3.1 Drei Geschichten (`geschichte_1.md`, `geschichte_2.md`, `geschichte_3.md`)
Drei **deutlich verschiedene** Richtungen (anderer Schauplatz, anderer Gegenspieler, andere Kernmechanik, anderer Grundton). Jede Geschichte ist vollständig und gleich ausführlich (ca. 4 bis 6 Seiten), mit diesem Aufbau:
1. **Titel und Leitsatz** (ein Satz, der die Geschichte verkauft).
2. **Prämisse und Thema**: Worum geht es, welche Frage stellt das Kapitel?
3. **Anschluss**: wie die Geschichte nach jedem der vier Enden von Kapitel 2 beginnt (je 2 bis 3 Sätze), welche offenen Fäden sie aufgreift, welche alten Figuren auftauchen und warum.
4. **Schauplatz**: neue Stadt oder Gegend (nicht wieder Moor-Küste) mit 5 bis 7 Vierteln, je 2 bis 3 Sätze, dazu 3 Gefahrengebiete mit Boss.
5. **Figuren** (8 bis 12): Name, Rolle, Geheimnis, Pfad (falls übernatürlich). Ein Verbündeter wie Zunder in Kapitel 2, ein früher Unterschlupf.
6. **Gegenspieler**: wer, was will er, warum glaubt er, im Recht zu sein, wie hängt er mit dem zusammen, was unter dem Moor Namen frisst.
7. **Kernmechanik**: so prägend wie die Polizei in Wexmoor, aber anders. In Spielregeln beschrieben: was der Spieler tut, was passiert, wie man scheitert.
8. **Ablauf**: 5 Akte, je 4 Fährten. Pro Fährte 2 bis 4 Sätze: Ziel, Ort, ein Schlüssel-Hinweis, die Deduktion, die sie abschließt.
9. **Wendepunkte**: die 3 größten Überraschungen.
10. **Enden**: 3 bis 4 Enden mit Bedingungen.
11. **Kostprobe**: eine Schlüsselszene als Dialog (10 bis 20 Zeilen) im Ton des Spiels.
12. **Aufwand**: was neu gebaut werden müsste (Karten, Figuren, Gegner, neue Mechanik als Code), grob eingeschätzt als klein/mittel/groß.

### 3.2 Vergleich (`vergleich.md`)
Eine Tabelle der drei Geschichten (Schauplatz, Gegenspieler, Mechanik, Ton, aufgegriffene Fäden, Aufwand) und ein kurzer Absatz, welche du empfiehlst und warum. Die Entscheidung trifft Seb.

### 3.3 Sonst
- `README.md`: Übersicht mit Leitsatz jeder Geschichte.
- Keine Spieldaten, keine `pruefen.mjs` nötig. Die gewählte Geschichte wird später in einem eigenen Paket als Daten gebaut.
