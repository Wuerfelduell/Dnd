# Codex-Paket AT: Kapitel 3, Nebenaufträge und Stadtleben in Dunscar

**Paket-Name:** `k3_nebenquests` · **Ordner:** `docs/story/k3_nebenquests/` · **ID-Präfix:** `k3n_`

Neben der Jagd auf den Nachtzug soll Dunscar sich bewohnt anfühlen wie Kettlegate: **12 Nebenaufträge**, Gerede auf den Straßen, Lesestücke und kleine Wiederbegegnungen. Die Hauptstory schreibt Paket AR, die Sequenz-Prüfungen Paket AU.

## Gemeinsame Eckdaten „Kapitel 3: Der letzte Zug nach Dunscar“ (gilt für die Pakete AR bis AY)

Seb hat für Kapitel 3 **Geschichte 3** aus Paket AC gewählt. Sie steht vollständig in **`docs/story/kapitel3/geschichte_3.md`**: lies sie zuerst ganz, sie ist die verbindliche Vorlage (Prämisse, Anschluss an die vier Wexmoor-Enden, sechs Viertel, zehn Figuren, Gegenspieler Gallowmere, Kernmechanik „Rufen, horchen, schweigen“, 5 Akte x 4 Fährten, Wendepunkte, vier Enden). Die Geschichten 1 und 2 im selben Ordner werden **nicht** benutzt, sie bleiben für später.

Acht Pakete bauen Kapitel 3 gleichzeitig. Damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so und lege nichts an, was einem anderen Paket gehört.

**Stadt:** `dunscar` (Feld `city` auf allen Karten). Ende Kapitel 2 setzt `kapitel2_done`; Kapitel 3 startet mit Flag `k3_arrived`, Ende Kapitel 3 setzt `kapitel3_done`.

**Karten** (Daten: AS, Grafik: AV)
| ID | Was |
|---|---|
| `ds_endbahnhof` | Viertel: Endbahnhof mit Wartesaal und Fahrkartenschalter (Ankunft) |
| `ds_schwellenring` | Viertel: Werkstätten, Runddepot, überwachsene Drehscheibe |
| `ds_arbeiterbogen` | Viertel: Reihenhäuser um einen windstillen Platz |
| `ds_kalkmarkt` | Viertel: Steinmetze, Trödel, Teesaal |
| `ds_bruchstufen` | Viertel: breite Treppen hinab in die Steinbrüche, Gerüste |
| `ds_signalhang` | Viertel: Schaltbuden, Prüfhaus, überdeckter Bahnsteig über der Schlucht |
| `ds_speisewagen` | Innenraum: Pfiffs Speisewagen, **Unterschlupf** (Koje, Lager, Fallwand, Kohlenofen, Schallschleuse) |
| `ds_runddepot` | Innenraum: Lokschuppen mit dem Nachtzug in der Wartung |
| `ds_pruefhaus` | Innenraum: Willas Klangprüfhaus mit Walzen und Trichtern |
| `ds_teesaal` | Innenraum: Mabels Wirtshaus „Zur letzten Schicht“ am Arbeiterbogen |
| `ds_lohnbuero` | Innenraum: altes Lohnbüro am Signalhang, Esthers Archiv |
| `ds_nachtzug_wagen` / `ds_nachtzug_lok` | Innenräume des Nachtzugs (Personenwagen voller Schichtgänger, Führerstand) |
| `ds_rangierwueste` | Gefahrengebiet tier 4, Boss `schwellenhund` |
| `ds_klopfbruch` | Gefahrengebiet tier 4, Boss `vorhauer` |
| `ds_rufschlucht` | Gefahrengebiet tier 5, Boss `vielrufer` |
| `ds_letzter_bahnsteig` | Finale: verlassener Bruchbahnsteig, Endkampf/-gespräch mit `gallowmere` |
| `ds_unterschicht` | nach dem Kapitel: Gefahrengebiet unter der Schlucht, Superboss `unterschicht` |

**Figuren** (Geschichte: AR/AT/AU, Grafik: AW)
`k3_pfiff` (Ansel „Pfiff“ Cedrow, Verbündeter), `k3_gallowmere` (Perrin Gallowmere, Fahrmeister, Gegenspieler), `k3_willa` (Willa Trentfold), `k3_oren` (Oren Fallowby), `k3_mabel` (Mabel Caskett), `k3_pelham` (Jonas Pelham), `k3_nellie` (Nellie Swarth), `k3_huxford` (Dr. Corin Huxford), `k3_esther` (Esther Brindle), `k3_adaine` (Adaine Quarrell), dazu neu **`k3_weichenstellerin`** (Hedda Quist, alte Weichenstellerin am Schwellenring, kennt die Pfade und nimmt die Sequenz-Prüfungen ab, Paket AU).

**Gegner** (Werte: AS bzw. AU, Grafik: AX)
- Normale Gegner: `schichtgaenger` (verzauberter lebender Arbeiter, wird nur bewusstlos), `kalkstaubgeist`, `signalkraehe`, `lohnlistenmotte`, `geruestklang`, `nachhall`.
- Bosse: `schwellenhund` (Akt II), `vorhauer` (Akt III), `vielrufer` (Akt V), `gallowmere` (Finale), `unterschicht` (Superboss nach dem Kapitel).
- Sequenz-Prüfungen (Paket AU, je ein Boss pro Pfad, Namen aus Paket AF): `k3p_lampengutachter` (laterne), `k3p_gegenzeugenknuepfer` (faden), `k3p_garderobenpfaender` (maske), `k3p_pausenfischer` (echo), `k3p_chargenpruefer` (kessel), `k3p_brueckenpresser` (eisen), `k3p_zollriegel` (schluessel), `k3p_fristpfaender` (sq_waage), `k3p_schichtsammler` (sq_moor), `k3p_gangaufseher` (sq_uhr).

**Kernzutaten der hohen Sequenzen** (Paket AF, liegen jetzt in `src/data/packs/sequenzen/zutaten.json`; Herkunft legt Paket AU fest):
- Seq 5 der neuen Pfade (`sq_zutat_<pfad>_5`): Beute von `schwellenhund`.
- Seq 4 aller Pfade (`sq_zutat_<pfad>_4`): Beute der eigenen Sequenz-Prüfung.
- Seq 3: Beute von `vorhauer`. Seq 2: Beute von `vielrufer`. Seq 1: Beute von `unterschicht`.
Bosse geben nur die Zutat des Pfads, dem der Spieler folgt; eine friedliche Lösung gibt dieselbe Zutat.

**Präfixe für neue IDs:** AR `k3a_`, AS `k3o_`, AT `k3n_`, AU `k3p_`. Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

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
Das Spiel lädt Inhalts-Pakete aus `src/data/packs/<name>/` über `applyQuestPack` in `src/data/questPacks.js`. Schau dir `src/data/packs/wx_nebenquests/` als Vorlage an und liefere **genau diese Dateien im selben Format** in deinen Ordner `docs/story/<paket>/`: `quests.json`, `dialogues.json`, `dialog_zusaetze.json`, `npcs.json`, `case.json`, `items.json`, `encounters.json`, `platzierung.json`, dazu, was unten steht. Eingebaut wird es danach von Claude, nicht von dir.

### Erst lesen (Pflicht)
`docs/story/kapitel3/geschichte_3.md` (die Vorlage), `docs/story/kapitel3/story_bisher.md` (Kapitel 1 und 2 kurz), `src/data/wexmoor.json` (wie Kapitel 2 gebaut ist: Akte, Fakten, Deduktionen, Enden, Karten, Zonen), `src/data/packs/sequenzen/` (Pfade und Zutaten). Ton und Detailtiefe wie in Kapitel 2.

---

## 1. Die 12 Nebenaufträge (Vorgaben, Details erfindest du)
Jeder Auftrag: Quest, Dialoge, Hinweise (gern eine Deduktion), Belohnung, mindestens eine Entscheidung mit Folge. 3 bis 6 Schritte, 20 bis 40 Minuten. Verteilt über alle sechs Viertel und alle fünf Akte (Startbedingungen `k3a_akt<n>_done`, Flag-Namen von Paket AR; bis dahin so benennen und in `offene_punkte.md` vermerken).
1. **`k3n_tischgedeck`** (Mabel, Arbeiterbogen): eine Familie deckt seit 70 Jahren einen Platz; diese Nacht hat jemand davon gegessen.
2. **`k3n_grabstein_ohne_namen`** (Pelham, Kalkmarkt): ein bestellter Grabstein, Auftraggeber unbekannt, Name: deiner.
3. **`k3n_falsche_zeit`** (Nellie, Endbahnhof): Nellie will einen Schichtgänger mit gefälschten Telegrammen retten; du hilfst beim Fälschen oder hältst sie auf.
4. **`k3n_attest`** (Dr. Huxford): Er will seine falschen Atteste beichten, aber nur, wenn du ihm einen Zeugen besorgst, der nicht im Zug war.
5. **`k3n_vermessung`** (Adaine, Bruchstufen): Vermessungspunkte in den Brüchen verschieben sich nachts; Kampf mit `geruestklang` möglich.
6. **`k3n_schichtmarke`** (Mabel + Teesaal): Ein Gast zahlt mit einer Schichtmarke von heute; wer prägt sie?
7. **`k3n_secondhand`** (Kalkmarkt, neuer Händler, Lauf-Sheet-Wunsch in `grafikwuensche.md`): Erinnerungsplatten, die die falschen Kunden begrüßen.
8. **`k3n_drehscheibe`** (Oren, Schwellenring): die Drehscheibe wieder gangbar machen, Belohnung: Abkürzung zwischen zwei Vierteln (Flag; Wirkung in `offene_punkte.md`).
9. **`k3n_brief_aus_wexmoor`**: Zunder schickt ein Paket nach Dunscar (Inhalt hängt vom Wexmoor-Ende ab, `k2_end_*`), ein kleiner Botengang mit Wiedersehen per Brief.
10. **`k3n_kettlegate`**: ein Telegramm aus Kettlegate (Marlowe, Kohlen-Jem oder Pimm, je nach Kapitel-1-Flags) mit einem alten Fall, der eine Spur nach Dunscar hat.
11. **`k3n_kalkkinder`**: Kinder spielen „Schicht“ und rufen dabei echte Haltestellennamen; harmlos oder nicht?
12. **`k3n_letzte_lohnliste`** (Esther, nach Akt IV): die Lohnlisten der Verschollenen an die Familien verteilen; jede Familie reagiert anders (4 kurze Szenen).
Ein Auftrag darf einen Kampf mit den normalen Gegnern aus den Eckdaten haben (Werte liefert AS; nenne nur die ID).

## 2. Stadtleben
- `gerede.json`: 60 Sätze für Passanten in Dunscar, nach Viertel und Akt gestaffelt (Format `src/data/packs/lore/gerede.json`).
- `lesestuecke.json`: 25 Lesestücke (Format `src/data/packs/lore/lesestuecke.json`): Fahrpläne, Gewerkschaftszettel, Kinderreime, Kalkbruch-Vorschriften, Briefe von Schichtgängern.
- `zeitung.json`: 8 Kurzmeldungen im „Dunscarer Kalkblatt“ zu deinen Aufträgen.
- `bestiarium.json`: Einträge für die normalen Gegner aus den Eckdaten (Format `src/data/packs/lore/bestiarium.json`).

## 3. Koop
Wenn Spieler 2 dabei ist (Flag `koop_aktiv`), bekommen 4 deiner Aufträge je einen zusätzlichen Gesprächszweig, in dem Spieler 2 etwas Eigenes beiträgt (Stimmen `p2a`/`p2b`: siehe `docs/story/koop/` bzw. `src/data/packs/koop/`, falls schon vorhanden; sonst nach der Beschreibung in `docs/art/codex_AI_koop_texte.md`).

## 4. Lieferung
Standard-Dateien plus `gerede.json`, `lesestuecke.json`, `zeitung.json`, `bestiarium.json`, `README.md`, `grafikwuensche.md`, `offene_punkte.md`, `pruefen.mjs`.
