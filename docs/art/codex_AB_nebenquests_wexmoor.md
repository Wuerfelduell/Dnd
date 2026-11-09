# Codex-Paket AB: Neue Nebenaufträge in Wexmoor

**Paket-Name:** `wx_nebenquests` · **Ordner:** `docs/story/wx_nebenquests/` · **ID-Präfix:** `k2n_`

Kapitel 2 ist eine lange Jagd über 5 Akte. Zwischen den Akten soll es mehr zu tun geben: **10 neue Nebenaufträge** in den sechs Vierteln von Wexmoor, dazu kleine **Ausbauten für Zunders Torfkahn** als Belohnungen. Du lieferst alles als fertige Spieldaten, eingebaut wird separat.

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

## 1. Was es schon gibt (nicht doppeln)
Alles steht in `src/data/wexmoor.json`. Lies vor allem `quests`, `npcs`, `dialogues`, `maps`, `police`, `loners`, `case`.
- Hauptstory: Quests `k2_akt1` bis `k2_akt5`, Flags `k2_akt1_done` bis `k2_akt4_done`, Ende setzt `kapitel2_done`. Akt I: alle Viertel kennenlernen (`k2_known_bahnhof/torf/salz/hafen/ober/pfahl`). Akt IV: Zunder wird verhaftet (`k2_zunder_taken`, `k2_zunder_free`).
- Vorhandene Nebenaufträge: `k2_s_zimmer3` (Elsbeth Rowe), `k2_s_bojen` (Brack), `k2_s_kit`, `k2_s_fenn` (Zunders Mutter), `k2_s_druce`, `k2_s_sedge`, `k2_s_vey`, `k2_s_marlowe`, `k2_s_hale`, Zunders Tee (`k2_tee_1/2`). Dazu sieben Einzelgänger (`loners`, NPCs `ez_*`) und zwei Zirkel mit Auktionen (`src/data/treffen.json`).
- **Nicht anfassen:** Die Versunkene Altstadt (`wx_altstadt`) und ihre Monster bekommen gerade in einem anderen Paket Grafik. Du darfst sie erwähnen, aber keine neuen Aufträge dort ansiedeln.
- Karten: `wx_bahnhof`, `wx_torfstich`, `wx_kahn` (Unterschlupf), `wx_salzmarkt`, `wx_glocke` (Gasthaus), `wx_bojenhafen`, `wx_oberstadt`, `wx_akademie`, `wx_lucent`, `wx_wachhaus`, `wx_pfahldorf`; Gefahrengebiete `wx_vergessmoor`, `wx_salzwatt`, `wx_leuchtturm`.
- Figuren mit Grafik: `zunder`, `druce`, `hesper`, `brack`, `pedell`, `sedge`, `wyle`, `hale`, `elsbeth`, `price_wx`, `kit`, die `ez_*` und die Zirkelmitglieder `tm_*` (`treffen.json`). Bevorzuge diese. Neue NPCs höchstens 4.
- **Polizei:** In Wexmoor wird der Spieler gesucht. Grauspäher patrouillieren, es gibt Fahndungsstufe 0 bis 3 (Effekt `wanted`), Verkleidungen (`torfkittel`, `fischerjacke`, `akademierobe`, Flags `k2_wear_<id>`). Gegen Polizei wird **nicht gekämpft**. Nutze das: Aufträge, bei denen man sich verkleiden, ablenken, bestechen oder die Fahndung senken kann.

## 2. Die 10 Aufträge (Vorgaben, Details erfindest du)
Jeder Auftrag: Quest-Eintrag, Dialog(e), wo nötig Hinweise und eine kleine Deduktion, Gegenstände, höchstens ein Kampf (nie gegen Polizei). 3 bis 6 Schritte. Mindestens eine echte Entscheidung mit Folge. Verteile sie auf Akt I bis V (Startbedingungen über `k2_akt*_done` bzw. `requires_quests_active`).

1. **`k2n_reetdach`** (Torfstich, Akt I): Ein Reetdecker deckt jede Nacht dasselbe Dach neu, das morgens wieder kahl ist. Das Moor holt sich das Reet. Lösung über Mutter Sedges Täfelchen-Brauch.
2. **`k2n_salzwaage`** (Salzmarkt, Akt I/II): Die Eichmeisterin des Salzmarkts findet, dass ihre Gewichte jeden Tag leichter werden. Betrug oder Fluch? Echte kleine Ermittlung mit zwei Verdächtigen.
3. **`k2n_bojenlied`** (Bojenhafen, Akt II): Die Glockenbojen läuten in einem Muster. Ein alter Fischer sagt, es ist ein Lied. Hinweise an drei Bojen sammeln (per Ruderboot), am Ende ein Lesetext mit dem Lied.
4. **`k2n_falsches_gesicht`** (Oberstadt, Akt II): Ein Zeichner der Wache malt die Steckbriefe. Er hat dein Gesicht falsch gemalt, mit Absicht. Warum? Ergebnis kann die Fahndung senken (`wanted: -1`) oder dir einen Verbündeten bringen.
5. **`k2n_kuestengift`** (Akademie, Akt III): Ein Student der Akademie forscht über das Moorwasser und wird nachts verfolgt. Verkleidung als Akademiker nötig. Kampf gegen einen vorhandenen Moor-Gegner möglich.
6. **`k2n_pfandzettel`** (Gasthaus „Glocke“, Akt III): Im Gasthaus liegt ein Pfandzettel aus Kettlegate mit deinem alten Büro-Siegel. Ein Kapitel-1-Echo: Wer hat ihn hergebracht? Kurzer Auftritt einer Kettlegate-Figur nur per Brief oder Telegramm.
7. **`k2n_schleusenwaerter`** (Güterbahnhof/Schleusen, Akt III/IV): Der Schleusenwärter lässt nachts Boote ohne Licht durch. Schmuggel für die Lichtlosen? Entscheidung: melden, decken oder mitverdienen. Verknüpfung mit dem Zirkel `lichtlose` aus `treffen.json` über Flags, ohne die Zirkel-Daten zu ändern.
8. **`k2n_moorkind`** (Pfahldorf, Akt IV): Ein Kind im Pfahldorf weiß nicht mehr, wie es heißt. Ausflug ins Vergessmoor, um den Namen zurückzuholen. Kampf möglich, aber Lösung über Hinweise besser belohnt.
9. **`k2n_zunders_liste`** (Torfkahn, nach Zunders Befreiung `k2_zunder_free`): Zunder will die Leute bezahlen, die ihr während der Haft geholfen haben. Drei Botengänge durch die Stadt bei hoher Fahndung. Belohnung: Bindung zu Zunder (`bond`), ein Ausbau des Kahns.
10. **`k2n_letztes_licht`** (Leuchtturm-Umgebung, Akt V vor dem Finale): Ein alter Leuchtturmwärter, der vor Brandt den Turm hatte, lebt versteckt im Salzwatt. Er kennt einen zweiten Weg auf die Insel. Gibt ein Flag `k2n_zweiter_weg`, das du in `offene_punkte.md` als Vorschlag für das Finale beschreibst.

## 3. Ausbauten für den Torfkahn
Der Unterschlupf `wx_kahn` soll mit dem Spiel wachsen. Liefere **6 Ausbauten** als Daten-Vorschlag in `kahn_ausbau.json`:
```json
{ "k2n_kahn_ofen": { "name": "Ein richtiger Ofen", "flag": "k2n_kahn_ofen", "quelle": "k2n_zunders_liste", "wirkung": "Ausruhen heilt zusätzlich 10 Nerven", "deko": "beschreibt, was im Kahn neu zu sehen ist" } }
```
Jeder Ausbau kommt aus einem deiner Aufträge (oder wird mit Geld bei einer Figur gekauft) und hat eine kleine, spielmechanisch einfache Wirkung, die du in Worten beschreibst. Was davon Code braucht, kommt in `offene_punkte.md`. Die Bilder dafür in `grafikwuensche.md`.

## 4. Lieferumfang
```
docs/story/wx_nebenquests/
  README.md            Übersicht: jeder Auftrag in 3 Sätzen, Akt, Ort, Belohnung, Entscheidungen
  quests.json
  dialogues.json
  dialog_zusaetze.json Zusätze für vorhandene Dialoge (z. B. zunder, sedge, brack)
  npcs.json            nur neue NPCs
  platzierung.json     [{map, npc|interactable, tile:[x,y], visible_if}]
  case.json            { facts, clues, deductions } mit "case": "kapitel2"
  items.json
  encounters.json      (falls nötig, "chapter": 2)
  kahn_ausbau.json
  grafikwuensche.md
  offene_punkte.md
  pruefen.mjs
```
Für `platzierung.json`: Lies die `rows` der Karte in `wexmoor.json` und wähle begehbare Kacheln. Auf Karten mit `police: true` keine Figur mitten auf eine Streifenroute (`patrols[].route`) stellen.
