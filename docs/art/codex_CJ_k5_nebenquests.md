# Codex-Paket CJ: Kapitel 5, Nebenaufträge und Kurleben in Briarholt

**Paket-Name:** `k5_nebenquests` · **Ordner:** `docs/story/k5_nebenquests/` · **ID-Präfix:** `bhn_`

Zwölf Nebenaufträge quer durch Briarholt, dazu Kurgäste, Gerede, Lesestücke, Zeitung und Koop. Die Figuren und ihre Auftragskeime liegen im Vorrat (BJ `auftragskeime.json`, `bj_keim_bh_*`): daraus baust du fertige Quests.

## Gemeinsame Eckdaten „Kapitel 5: Der Garten der fehlenden Tage“ (gilt für die Pakete CG bis CJ)

Kapitel 5 spielt im Kurort **Briarholt**. Verbindliche Vorlage ist **Geschichte 2** aus Paket AC: **`docs/story/kapitel3/geschichte_2.md`** (Prämisse, sechs Viertel, zehn Figuren, Gegenspielerin Dr. Meriel Greavesend, Kernmechanik „Wärme und Rücklauf“, 5 Akte x 4 Fährten, drei Wendepunkte, vier Enden). Lies sie zuerst ganz. Der dort beschriebene Anschluss an Wexmoor wird **nicht** übernommen: Kapitel 5 schließt an die vier **Calderwick-Enden** von Kapitel 4 an (`cwa_end_widerspruch`, `cwa_end_amtsinhaber`, `cwa_end_buecher`, `cwa_end_ordnung`, Pakete CC bis CF). Falls Kapitel 4 übersprungen wird, gibt es zusätzlich eine Anreise direkt aus Dunscar (`kapitel3_done`).

Vieles ist schon da. Der **Vorrat** aus den Paketen BH bis BM liegt im Repo und ist verbindlich; erfinde nichts doppelt:
- Figuren: `docs/story/vorrat_figuren/` (BJ): `npcs.json`, `dialogues.json`, `steckbriefe.md`, `auftragskeime.json` (`bj_keim_bh_*`), `reaktionen.json`. Grafik: Batch `vorrat2` (BK), Lauf-Sheet-Id = Figur-Id.
- Gegner und Bosse: `docs/story/vorrat_gegner/` (BH): `encounters.json`, `bosses.json`, `phasen.json`, `bestiarium.json`, `dialogues.json`, `zonen_vorschlag.json`, `verhalten.md`. Grafik: Batch `vorrat1` (BI).
- Gegenstände: `docs/story/vorrat_items/` (BL): `items.json` (`vi_*`), `artifacts.json`, `fundstuecke.json`, `handel.json`. Grafik: Batch `vorrat3` (BM).
Vorrats-Ids werden **benutzt, nicht kopiert**.

Vier Pakete bauen Kapitel 5 gleichzeitig. Diese IDs sind **fest vergeben**.

**Stadt:** `briarholt`. Kapitel 5 startet mit Flag `k5_arrived`, Ende Kapitel 5 setzt `kapitel5_done` und eines von `bha_end_wahl`, `bha_end_winter`, `bha_end_verwahrt`, `bha_end_schmerzlos`.

**Karten** (Daten: CH, Grafik: CI). Jede Außenkarte und jeder Innenraum hat einen **kalten** und einen **warmen** Zustand (Tileset `bh_<thema>_kalt` / `bh_<thema>_warm`, gleiche Zellenbelegung; Wechsel über die Mechanik, nicht über die Tageszeit).
| ID | Was |
|---|---|
| `bh_kutschenhof` | Viertel: Ankunft, Gepäck, Patienten und Blumenerde unter einem niedrigen Dach, Frost im Backstein |
| `bh_kesselgrund` | Viertel: Werkstätten, Kohlenrutschen, Rohrbrücken, stillgelegte Wäscherei |
| `bh_winterpromenade` | Viertel: Musikpavillon, Gaslaternen, Palmen in Kübeln, Postkartenpult |
| `bh_glasgaerten` | Viertel: beschlagene Anzuchthäuser als Straßenzüge, verschlossene Beete |
| `bh_stillenhaeuser` | Viertel: Patientenzimmer um gemeinsame Speisesäle, Tafeln mit radierter letzter Zeile |
| `bh_wurzelkranz` | Viertel: alte Pumpstation, Labor, Mutterhaus der Klinik, Stolleneingang |
| `bh_buegelraum` | Innenraum: Frosts Bügelraum, **Unterschlupf** (Bett, eigene Feuerstelle, Lager, Fallwand, Ventiltafel) |
| `bh_kutschenhalle` | Innenraum: Gepäckhalle, Felix' Schichtbuch, unbenutzte Gepäckscheine |
| `bh_pavillon` | Innenraum: Musikpavillon mit Schreibpult und Postkartenständer |
| `bh_verkaufshalle` | Innenraum: ehemalige Verkaufshalle mit verschlossenen Beeten, Adelines Saatbuch |
| `bh_speisesaal` | Innenraum: Speisesaal der Stillenhäuser, Ennas Stationszimmer, Teeküche |
| `bh_aktenraum` | Innenraum: Einwilligungen und Widerrufe, Patientenakten |
| `bh_labor` | Innenraum: Greavesends Labor, verworfene Anleitungen, Sudkessel |
| `bh_mutterhaus` | Innenraum: Dipples Zeichenstube, Fundamentplan |
| `bh_verteilanlage` | Finale: Verteilanlage im Wurzelkranz, Behälter, Sperrklappe, Endgespräch mit Greavesend |
| `bh_kaltes_palmhaus` | Gefahrengebiet tier 5, Boss `vg_bh_boss_glasgaertner`, Vorschlag `vg_zone_bh_palmhaus` |
| `bh_verlassene_waescherei` | Gefahrengebiet tier 5, Boss `vg_bh_boss_waescherei` (Atemkessel), Vorschlag `vg_zone_bh_waescherei` |
| `bh_wurzelkammer` | Gefahrengebiet tier 6, Boss `vg_bh_boss_mutterwurzel` (Blütenmund, drei Abschnitte), Vorschlag `vg_zone_bh_wurzelkammer` |

**Figuren** (BJ-Ids, Grafik BK): `bh_bellweather` (Ruben „Frost“, Verbündeter, Heizer), `bh_orla_fencrest` (geflohene Patientin), `bh_felix_fencrest` (Bruder, Gepäckträger), `bh_greavesend` (Klinikleiterin, Gegenspielerin, Kessel Seq 5), `bh_vellish` (Adeline, Gärtnerin), `bh_malkin` (Jasper, Rohrwart), `bh_rookwell` (Schwester Enna), `bh_henshall` (Beatrice, entlassene Patientin), `bh_crowther` (Silvan, Lieferant), `bh_dipple` (Amos, botanischer Zeichner). Reisefiguren `vn_*`. Gastauftritte nur per Brief: `cw_crayford` (nach Kapitel 4), `k3_pfiff`, `marlowe`; Elsbeths Brief nur bei `k2_rowe_frei`.

**Gegner** (BH-Ids): normal `vg_bh_dampfschwester`, `vg_bh_wurzelgaenger`, `vg_bh_glasmotte`, `vg_bh_bluetenkopf`, `vg_bh_rohrwurm`, `vg_bh_postkartenschreiber`, `vg_bh_waeschegeist`, `vg_bh_sudtraeger`; Bosse `vg_bh_boss_glasgaertner` (Akt II), `vg_bh_boss_waescherei` (Akt III), `vg_bh_boss_mutterwurzel` (Akt V). Greavesend ist **kein** Kampfboss: das Finale ist ein Verhör mit optionaler Verteidigung gegen `bha_aussaat_schwarm` (CG Texte, CH Werte).

**Gegenstände** (BL-Ids): Schlüsselstücke `vi_k_bh_postkarte_verworfen`, `vi_k_bh_pflanzenkapsel`, `vi_k_bh_einweisung`, `vi_k_bh_beetschild`, `vi_k_bh_namensheft`, `vi_k_bh_wurzelzeichnung`; Ausrüstung `vi_hut_kurhaube`, `vi_mantel_dampfmantel`, `vi_amulett_pfirsichkern`, `vi_waffe_veredelungsschere`, `vi_waffe_dampfrohr`; Verbrauch `vi_v_pfirsichsud`, `vi_v_wurzelpastille`, `vi_v_dampfkompresse`, `vi_v_kurkarte`; Artefakte `vi_art_die_warme_postkarte`, `vi_art_die_gaertnerschnur`, `vi_art_die_kurglocke`.

**Sequenzen:** Keine neuen Pfade, Rituale oder Formeln. Die Bosse geben wie in Calderwick Ersatzquellen (Glasgärtner → `sq_zutat_<pfad>_3`, Atemkessel → `_2`, Blütenmund → `_1`, nur eigener Pfad, nur wenn noch nicht vorhanden). Fährte IV.3 der Geschichte liefert einen Lesetext zur Rückführung, keine Rezeptdaten.

**Kernmechanik „Wärme und Rücklauf“** (Spezifikation und Grundgerüst: CH; Daten: CG): Ventile `bha_ventil_<kreis>` (Flags `offen`/`zu`), höchstens drei gleichzeitig warme Kreise, Rücklauf in Behälter / Klinik / leeres Gebäude. Zustandswechsel nur durch bestätigte Aktionen. Bis der Code da ist, muss jede Schaltung als Dialog spielbar sein; Wohnräume bleiben immer grundversorgt.

**Präfixe für neue IDs:** CG `bha_`, CH `bho_`, CI Batch `briarholt1` (Dateien `bh_*`), CJ `bhn_`. Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

**Erst lesen (Pflicht):** `docs/story/kapitel3/geschichte_2.md`, `docs/story/kapitel3/story_bisher.md`, `src/data/packs/k3_akte/`, `src/data/packs/k3_orte/`, die drei Vorrats-Ordner, dazu die Calderwick-Pakete `docs/art/codex_CC_k4_akte.md` (nur die Eckdaten, für die Enden-Flags).

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

## 1. Die 12 Nebenaufträge (Vorgaben, Details erfindest du)
Jeder Auftrag: Quest, Dialoge (als `dialog_zusaetze.json` an die BJ-Dialoge), Hinweise (gern eine Deduktion), Belohnung, mindestens eine Entscheidung mit Folge. 3 bis 6 Schritte, 20 bis 40 Minuten. Verteilt über alle sechs Viertel und fünf Akte (`bha_akt<n>_done`). Acht aus BJ-Keimen (Keim im `summary` nennen), vier neu:
1. **`bhn_gepaeckschein`** (Felix, Kutschenhalle, aus `bj_keim_bh_felix_fencrest`): unabgeholte Koffer; einer gehört jemandem, der laut Klinik nie eingewiesen wurde.
2. **`bhn_postkarten`** (Beatrice, Pavillon, aus `bj_keim_bh_henshall`): Beatrice schreibt jede Woche dieselbe Karte an ein Kind, dessen Namen sie nicht kennt; du findest die Adresse.
3. **`bhn_umgedrehte_schilder`** (Adeline, Glasgärten, aus `bj_keim_bh_vellish`): Beete mit Patientenstimmen vor einer Inspektion verstecken oder melden.
4. **`bhn_waermeschwarz`** (Malkin, Kesselgrund, aus `bj_keim_bh_malkin`): heimliche Umleitungen; die Armenwärme hängt daran. Kampf mit `vg_bh_rohrwurm` möglich.
5. **`bhn_namensheft`** (Enna, Speisesaal, aus `bj_keim_bh_rookwell`): Ennas Heft wird gesucht; du versteckst es oder legst es offen (Folge in Akt V).
6. **`bhn_frachtbelege`** (Crowther, Labor-Vorplatz, aus `bj_keim_bh_crowther`): alte Rückstände aus Wexmoor; Crowther will aussteigen, aber mit Gewinn.
7. **`bhn_wurzelzeichnungen`** (Dipple, Mutterhaus, aus `bj_keim_bh_dipple`): die alten Zeichnungen vor der Rente retten; Dipple zögert.
8. **`bhn_schraubenschluessel`** (Frost, Bügelraum, aus `bj_keim_bh_bellweather`): der gute Schraubenschlüssel des Bruders; ein stiller Auftrag ohne Erinnerungszwang (Bindung).
9. **`bhn_kurkonzert`** (Pavillon, neuer Kapellmeister, Lauf-Sheet-Wunsch): die Kurkapelle spielt jeden Abend dasselbe Stück, und die Gäste summen eine Zeile, die nicht darin vorkommt.
10. **`bhn_brief_aus_calderwick`**: Klammer schickt ein Paket (Inhalt je `cwa_end_*`; ohne Kapitel 4: Pfiff aus Dunscar).
11. **`bhn_elsbeth`** (nur bei `k2_rowe_frei`, sonst örtliche Patientin `bhn_e_patientin`): ein Brief über das Wiederfinden eines Namens, den die Klinik als Werbung nutzen will.
12. **`bhn_wintervorrat`** (nach Akt IV): die Reservewärme für Stillenhäuser prüfen, vier Haushalte, jeder reagiert anders; zahlt in den Reserveplan von Akt V ein (Flag `bhn_reserve_geprueft`, CG prüft es als Bonus, nicht als Pflicht).
Ein Auftrag darf einen Kampf mit `vg_bh_*` haben (Werte aus BH; nur die Id nennen).

## 2. Kurleben
- `einwohner.json` + `platzierung.json`: 8 Kurgäste und Angestellte `bhn_e_*` mit Tag/Nacht-Plätzen (Format `src/data/packs/k3_leben/einwohner.json`), je 6 Dialogknoten, Grafikwünsche. Zwei davon sind Patienten für CG `patienten.json` (nenne die Ids in `offene_punkte.md`).
- `gerede.json`: 60 Sätze nach Viertel, Akt und **Wärmezustand** (Feld `zustand: kalt | warm`, wenn das Format es nicht kennt, zwei Einträge mit Flag-Bedingung).
- `lesestuecke.json`: 25 Lesestücke: Kurpläne, Postkarten mit gleichen Sätzen, Ventilschilder, Saatbuch-Seiten, Entlassungsbriefe ohne Anrede, Werbung der Klinik.
- `zeitung.json`: 8 Kurzmeldungen im „Briarholter Kurblatt“.
- `leben.json`: Tiere und Wetter je Karte: Frostnebel, Dampfschwaden, Schneefall draußen; Kurkatzen, Wintervögel, Nachtfalter in den Glasgärten (warm), Grafikwünsche.
- Kurkiosk am Pavillon mit Waren aus BL `handel.json` (Rolle „Kiosk“), ohne BL zu ändern.

## 3. Koop
Mit `koop_aktiv`: 4 Aufträge mit Zusatzzweig für Spieler 2 (Stimmen `p2a`/`p2b`, Format `src/data/packs/koop_k3/geplauder.json`), 24 Geplauder-Zeilen für Briarholt. Ventile zu zweit: Spieler 2 kann ein zweites Ventil gleichzeitig halten (ein Satz in `offene_punkte.md` für CH).

## 4. Lieferung
Standard-Dateien plus `einwohner.json`, `gerede.json`, `lesestuecke.json`, `zeitung.json`, `leben.json`, `geplauder.json`, `README.md`, `grafikwuensche.md`, `offene_punkte.md`, `pruefen.mjs`.

