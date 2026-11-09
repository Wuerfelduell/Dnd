# Codex-Paket AS: Kapitel 3, Karten, Gefahrengebiete und Gegner von Dunscar

**Paket-Name:** `k3_orte` · **Ordner:** `docs/story/k3_orte/` · **ID-Präfix:** `k3o_`

Dieses Paket baut Dunscar als Karten: sechs Viertel, fünf Innenräume, zwei Zugwagen, drei Gefahrengebiete, das Finale und das Gebiet für den Superboss. Dazu die Werte aller normalen Gegner und der Story-Bosse, Beute, Reiseverbindungen, Lesetexte und eine genaue Beschreibung der Kernmechanik für den späteren Code. Die Grafik macht gleichzeitig Paket AV; bis sie da ist, nutzen die Karten vorhandene Tilesets.

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

## 1. Karten (`maps.json`)
Lies, wie Karten aufgebaut sind: `src/data/wexmoor.json` → `maps[]` und `THEME_TILES` in `src/world/assets.js` (nur lesen). Liefere **alle Karten aus den Eckdaten** im selben Format, mit `city: "dunscar"`, `spawns`, Ausgängen, Türen zu den Innenräumen, `lights`, `ambient`, Figuren-Plätzen (Figuren aus den Eckdaten mit `visible_if` nach Akt) und je 6 bis 12 Lesetexten/Untersuchungs-Objekten (Fahrpläne, Lohnlisten, Grabsteine, Messprotokolle, Wachswalzen). Größen: Viertel ca. 40x20 bis 48x24, Innenräume 16x10 bis 24x14, Gefahrengebiete ca. 48x30.
- Tileset vorerst: Bahnhof-Thema aus Wexmoor (`c_bahnhof`) für Endbahnhof/Schwellenring/Signalhang, ein Stadt-Thema für Arbeiterbogen/Kalkmarkt, `g_katakomben` bzw. `g_kraterwald` für Brüche und Schlucht. Schreib in jede Karte zusätzlich `tiles_wunsch` (das künftige Thema `ds_<name>` aus Paket AV).
- Der Speisewagen ist der Unterschlupf: Koje (`kind: rest`), Kiste (`kind: storage`), Fallwand (`kind: casewall`), wie `wx_kahn`.
- In `pruefen.mjs`: alle Zeilen gleich lang, Spawns und Objekte begehbar, jeder Ausgang erreichbar.

## 2. Reise (`travel.json`)
Stadtkarte von Dunscar: Einträge im Format von `wexmoor.json` → `travel`, Freischaltung der Viertel über Akt-Flags (`k3a_akt<n>_done` aus Paket AR) und die „Fußgängerroute“ aus der Geschichte. Kartenmarker-Wünsche an AV.

## 3. Gefahrengebiete (`zones.json`)
`ds_rangierwueste` (tier 4), `ds_klopfbruch` (tier 4), `ds_rufschlucht` (tier 5), `ds_unterschicht` (tier 6, erst nach `kapitel3_done`), Format wie `wexmoor.json` → `zones.wx_salzwatt`: `travel`, `lose_to` (Speisewagen), Texte, `encounters` mit den normalen Gegnern aus den Eckdaten (2 bis 4 pro Gebiet, mit `roam`, `elite`), dem Boss des Gebiets, `loot`, `elite_drops`. Gegner in Dunscar sind gegen einen Spieler auf **Sequenz 5 bis 4** ausgelegt; richte die Werte an den Kapitel-2-Bossen und an `docs/story/sequenzen/balancing.md` (Abschnitt „Zielkorridore für Kapitel 3 und später“) aus. `schichtgaenger` ist ein lebender Mensch: Er wird nur bewusstlos, `win_text` entsprechend.

## 4. Story-Bosse (`bosses.json`, Format `encounters`)
`schwellenhund`, `vorhauer`, `vielrufer`, `gallowmere` (zwei Phasen), `unterschicht` (Superboss, drei Phasen, deutlich stärker als alles andere). Pro Boss: Angriffe mit Ausholzeiten, Schwäche passend zur Geschichte (Abschnitt 3: falscher Anfahrpfiff, originale Schlagfolge, Ruf und Antwort trennen), `intro`, `on_win`. Die Beute mit Kernzutaten trägst du als `drops` ein: `schwellenhund` → `sq_zutat_<pfad>_5` der drei neuen Pfade, `vorhauer` → `sq_zutat_<pfad>_3`, `vielrufer` → `sq_zutat_<pfad>_2`, `unterschicht` → `sq_zutat_<pfad>_1`, jeweils für alle 10 Pfade mit einem Feld `requires_pathway`, damit nur die Zutat des eigenen Pfads fällt (wenn das Feld in Beute-Tabellen nicht existiert, Vorschlag in `offene_punkte.md`). Story-Texte für die Bosse schreibt Paket AR, halte dich mit Texten kurz.

## 5. Beute und Gegenstände (`items.json`)
10 bis 15 neue Beute-Items (Trophäen, Zutaten für die unteren Sequenzen, Verbrauchsgüter wie „Kalkpastille“) mit Präfix `k3o_`, 2 Artefakte mit Vor- und Nachteil (Format `artifacts.list`), dazu Bilder in `grafikwuensche.md`.

## 6. Kernmechanik „Rufen, horchen, schweigen“ (`rufmechanik.md` + Grundgerüst)
- Eine genaue Spezifikation für den Code: Zustände (Rufladungen 3, Nachfüllen bei Pfiff, Ersatzladungen), wie eine Horchstelle definiert ist (Datenfelder), wie Nachhallwege auf der Karte sichtbar werden (Kacheln/Linien), wer das Signal hört (Gegner mit `hearing`-Radius), Rücksetzung beim Fehlschlag, Barrierefreiheit (Untertitel, Linien, Vibration), alles mit Beispielen aus deinen Karten.
- Ein **Grundgerüst** als Datei `docs/story/k3_orte/Signals.skeleton.js` (nicht unter `src/`!): eine Klasse mit Methoden-Signaturen und Kommentaren, wie sie in `GameState` und `WorldScene` eingehängt würde, ohne Logik-Details. Kein Spielcode wird geändert.

## 7. Lieferung
`maps.json`, `travel.json`, `zones.json`, `bosses.json`, Standard-Dateien (soweit nötig), `rufmechanik.md`, `Signals.skeleton.js`, `README.md`, `grafikwuensche.md` (nur, was AV/AX nicht schon machen), `offene_punkte.md`, `pruefen.mjs`.
