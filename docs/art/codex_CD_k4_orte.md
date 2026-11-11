# Codex-Paket CD: Kapitel 4, Karten, Gefahrengebiete, Landstraße und Bürgenbrett (Calderwick)

**Paket-Name:** `k4_orte` · **Ordner:** `docs/story/k4_orte/` · **ID-Präfix:** `cwo_`

Dieses Paket baut Calderwick als Karten: sechs Terrassen, acht Innenräume, drei Gefahrengebiete, das Finale, dazu das Reisegebiet Landstraße zwischen Dunscar, Calderwick und Briarholt. Die Gegnerwerte liegen fertig im Vorrat (BH); du bindest sie an Karten und Zonen, ergänzt Reise, Beute, Lesetexte, Standseilbahn und schreibst die genaue Spezifikation der Kernmechanik „Bürgen und Abgleich“ für den späteren Code. Die Grafik macht gleichzeitig Paket CE; bis sie da ist, nutzen die Karten vorhandene Tilesets.

## Gemeinsame Eckdaten „Kapitel 4: Die Stadt ohne Unterschrift“ (gilt für die Pakete CC bis CF)

Kapitel 4 spielt in der Druckerstadt **Calderwick**. Verbindliche Vorlage ist **Geschichte 1** aus Paket AC: **`docs/story/kapitel3/geschichte_1.md`** (Prämisse, Anschluss an die vier Wexmoor-Enden, sechs Terrassen, zehn Figuren, Gegenspieler Oswin Wetherby, Kernmechanik „Bürgen und Abgleich“, 5 Akte x 4 Fährten, drei Wendepunkte, vier Enden). Lies sie zuerst ganz. Der dort beschriebene Anschluss an Wexmoor wird **nicht** übernommen: Kapitel 4 schließt an die vier **Dunscar-Enden** von Kapitel 3 an (siehe unten). Geschichte 2 (Briarholt) wird Kapitel 5 und gehört den Paketen CG bis CJ.

Vieles ist schon da. Der **Vorrat** aus den Paketen BH bis BM liegt im Repo und ist verbindlich; erfinde nichts doppelt:
- Figuren: `docs/story/vorrat_figuren/` (BJ): `npcs.json`, `dialogues.json` (je 10 Knoten), `steckbriefe.md`, `auftragskeime.json` (`bj_keim_cw_*`), `reaktionen.json`. Grafik dazu: Batch `vorrat2` (BK), Lauf-Sheet-Id = Figur-Id.
- Gegner und Bosse: `docs/story/vorrat_gegner/` (BH): `encounters.json`, `bosses.json`, `phasen.json`, `bestiarium.json`, `dialogues.json` (Bossabläufe, friedliche Lösungen), `zonen_vorschlag.json`, `verhalten.md`. Grafik: Batch `vorrat1` (BI) mit sieben Kampf-Hintergründen für die Zonen.
- Gegenstände: `docs/story/vorrat_items/` (BL): `items.json` (72 Ids `vi_*`), `artifacts.json`, `fundstuecke.json`, `handel.json`. Grafik: Batch `vorrat3` (BM).
Vorrats-Ids werden **benutzt, nicht kopiert**: Beim Einbau wandern BH/BJ/BL als eigene Packs ins Spiel. Dein Paket verweist auf ihre Ids und ergänzt nur, was fehlt (mit deinem Präfix).

Vier Pakete bauen Kapitel 4 gleichzeitig. Damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so und lege nichts an, was einem anderen Paket gehört.

**Stadt:** `calderwick` (Feld `city` auf allen Karten). Ende Kapitel 3 setzt `kapitel3_done` und eines von `k3a_end_feierabend`, `k3a_end_stilllegung`, `k3a_end_gegenstimme`, `k3a_end_vollzaehlig`. Kapitel 4 startet mit Flag `k4_arrived`, Ende Kapitel 4 setzt `kapitel4_done` und eines von `cwa_end_widerspruch`, `cwa_end_amtsinhaber`, `cwa_end_buecher`, `cwa_end_ordnung`.

**Karten** (Daten: CD, Grafik: CE)
| ID | Was |
|---|---|
| `cw_gleisfuss` | Terrasse 1: Güterbahnhof, Schrägaufzug, Stationsschilder mit fehlenden Buchstaben (Ankunft) |
| `cw_setzergasse` | Terrasse 2: Druckereien, Pressen hinter beschlagenen Fenstern, stillgelegte Buchbinderei |
| `cw_quittungsmarkt` | Terrasse 3: Händler mit mündlichen Schulden, Pfandhaus, Streiktopf |
| `cw_roehrenhof` | Terrasse 4: Verwaltungsviertel, Rohrpost in den Fassaden, Warenbahn zur Sortierhalle |
| `cw_witwenterrasse` | Terrasse 5: schmale Wohnhäuser mit gemeinsamen Küchen, leere Türschilder |
| `cw_kronenarchiv` | Terrasse 6: Archiv, Direktorenvilla, vertrockneter Ziergarten |
| `cw_buchbinderei` | Innenraum: Klammers Werkstatt, **Unterschlupf** (Bett, Ofen, Lager, Fallwand, Bürgenbrett) |
| `cw_gepaeckhalle` | Innenraum: Gepäckhalle am Gleisfuß, Veras Schalter, leeres Fahrgastbuch |
| `cw_pfandhaus` | Innenraum: Lotties Pfandhaus, Regale mit Gegenständen fremder Herkunft |
| `cw_sortierhalle` | Innenraum: Sortierhalle der Warenbahn, Fahrplan mit Personen als Leerfracht, Sichtfenster der Kabine |
| `cw_kueche` | Innenraum: Gemeinschaftsküche der Witwenterrasse, Noels Herd, zwei gedeckte Teller |
| `cw_archivsaal` | Innenraum: Lesesaal und Gehaltslisten des Kronenarchivs, Wartungsgang |
| `cw_villa` | Innenraum: Wetherbys Villa, Rechenblatt, Rohrpostzentrale |
| `cw_druckkammer` | Finale: Hauptpresse unter dem Archiv, Austrittsliste, Endgespräch/-kampf mit Wetherby |
| `cw_alte_setzerei` | Gefahrengebiet tier 5, Boss `vg_cw_boss_bleisammler` (BH), Vorschlag `vg_zone_cw_setzerei` |
| `cw_sortiergrube` | Gefahrengebiet tier 5, Boss `vg_cw_boss_blinder_zusteller`, Vorschlag `vg_zone_cw_sortiergrube` |
| `cw_nullfundament` | Gefahrengebiet tier 6, Boss `vg_cw_boss_nullfundament`, Vorschlag `vg_zone_cw_nullfundament` |
| `reise_landstrasse` | Reisegebiet zwischen Dunscar, Calderwick und Briarholt, Vorschlag `vg_zone_all_landstrasse` (Daten: CD) |

**Figuren** (BJ-Ids, Grafik BK): `cw_crayford` (Tilda „Klammer“ Crayford, Verbündete, Buchbinderei), `cw_ida_bellcross` (verschleppte Setzerin), `cw_noel_bellcross` (Koch), `cw_wetherby` (Direktor, Gegenspieler, Faden Seq 5), `cw_darnell` (Vera, Stationsschreiberin), `cw_hesk` (Bramwell, Träger), `cw_wicksend` (Lottie, Pfandleiherin), `cw_bexley` (Gideon, Hauswart), `cw_malliver` (Ruth, Restauratorin), `cw_pritch` (Ewan, Druckergesellen). Reisefiguren `vn_*` (BJ) auf der Landstraße. Gastauftritte per Brief oder Telegramm: `k3_pfiff`, `marlowe`, `zunder`; niemand aus den alten Städten reist mit.

**Gegner** (BH-Ids, Grafik BI): normal `vg_cw_letternlaeufer`, `vg_cw_rohrpostwespe`, `vg_cw_stempelhand`, `vg_cw_durchschlag`, `vg_cw_registerratte`, `vg_cw_seilbahnwaechter`, `vg_cw_tintenschatten`, `vg_cw_leerfracht`; Landstraße `vg_all_*`; Bosse `vg_cw_boss_bleisammler` (Akt I), `vg_cw_boss_blinder_zusteller` (Akt II), `vg_cw_boss_nullfundament` (Akt V, drei Abschnitte aus `phasen.json`), dazu `vg_all_boss_landvermesser` / `vg_all_boss_schlafkutsche` als Reiseereignis. Wetherby selbst ist **kein** Kampfboss: das Finale ist ein Verhör mit optionalem Kampf gegen `cwa_registerleib_rest` (CC schreibt Texte, CD die Werte).

**Gegenstände** (BL-Ids, Grafik BM): Schlüsselstücke `vi_k_cw_randkorrektur`, `vi_k_cw_ungestempelter_durchschlag`, `vi_k_cw_falsche_quittung`, `vi_k_cw_pfandzettel`, `vi_k_cw_heizungsrohr_skizze`, `vi_k_cw_streiktopf_auszug`; Ausrüstung `vi_hut_setzerkappe`, `vi_mantel_druckerschurz`, `vi_mantel_archivrobe`, `vi_amulett_bleiletter`, `vi_amulett_rohrpostkapsel`, `vi_waffe_setzhaken`, `vi_waffe_bleihammer`; Verbrauch `vi_v_setzerbrot`, `vi_v_terrassentee`, `vi_v_durchschlagpapier`, `vi_v_rohrpostmarke`; Artefakte `vi_art_das_leere_tuerschild`, `vi_art_der_erste_durchschlag`, `vi_art_der_stille_stempel`, `vi_art_der_falsche_fahrplan`.

**Sequenzen:** Die Kernzutaten Seq 3 bis 1 fallen bereits in Dunscar (Vorhauer, Vielrufer, Unterschicht). Calderwicks Bosse geben **Ersatzquellen**: Bleisammler → `sq_zutat_<pfad>_3`, Blinder Zusteller → `sq_zutat_<pfad>_2`, Nullfundament → `sq_zutat_<pfad>_1`, jeweils nur für den eigenen Pfad (`requires_pathway`) und nur, wenn der Spieler die Zutat noch nicht hat (`hide_if_items`). Keine neuen Pfade, Rituale oder Formeln. Fährte IV.3 der Geschichte („Der vierte Satz“) liefert einen Lesetext zur Herkunft der Formeln, keine Rezeptdaten.

**Kernmechanik „Bürgen und Abgleich“** (Spezifikation und Grundgerüst: CD; Daten: CC): Namensanker `cwa_anker_<ort>_<quelle>` (Flags), bis zu drei markierte Verbindungen, Abgleiche nur durch beschriftete Hauptaktionen. Bis der Code da ist, muss jeder Abgleich als Dialog mit `requires_flags` spielbar sein, damit kein Akt blockiert.

**Präfixe für neue IDs:** CC `cwa_`, CD `cwo_`, CE Batch `calderwick1` (Dateien `cw_*`), CF `cwn_`. Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

**Erst lesen (Pflicht):** `docs/story/kapitel3/geschichte_1.md`, `docs/story/kapitel3/story_bisher.md`, `src/data/packs/k3_akte/` (wie Kapitel 3 gebaut ist: Akte, Fakten, Deduktionen, Enden, Epiloge, Zeitung), `src/data/packs/k3_orte/` (Karten, Zonen, Bosse, Reise), die drei Vorrats-Ordner. Ton und Detailtiefe wie in Kapitel 3.

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

## 1. Karten (`maps.json`)
Lies, wie Karten aufgebaut sind: `src/data/packs/k3_orte/maps.json` und `THEME_TILES` in `src/world/assets.js` (nur lesen). Liefere **alle Karten aus den Eckdaten** im selben Format, mit `city: "calderwick"`, `spawns`, Ausgängen, Türen zu den Innenräumen, `lights`, `ambient`, Figuren-Plätzen (BJ-Figuren mit `visible_if` nach Akt-Flags `cwa_akt<n>_done` aus CC) und je 6 bis 12 Lesetexten/Untersuchungs-Objekten (Stationsschilder mit Lücken, Lohnbücher, Schuldscheine, Rohrpost-Zettel, Türschilder, Gehaltslisten, Speisekarten mit zwei Portionen). Größen: Terrassen ca. 40x20 bis 48x24, Innenräume 16x10 bis 24x14, Gefahrengebiete ca. 48x30.
- Die Terrassen liegen übereinander: jede Außenkarte hat oben einen **Schrägaufzug** (`kind: lift`, führt zur nächsten Terrasse, kostet 2 Schilling oder ist mit `cwa_werkstatt` frei) und unten eine Treppe zurück. Fußweg über alle Terrassen ist möglich, aber lang. Wenn `kind: lift` nicht existiert, als `travel`-Objekt bauen und in `offene_punkte.md` vermerken.
- Tileset vorerst: `C_06_bahnhof_tiles`/`c_bahnhof` für Gleisfuß, `D_03_fassade_stein`/Stadt-Thema für Setzergasse, Markt und Witwenterrasse, `M_kontor_tiles` für Röhrenhof-Innenräume, `g_katakomben` für Setzerei, Sortiergrube und Nullfundament. Schreib in jede Karte zusätzlich `tiles_wunsch` (`cw_<name>` aus Paket CE).
- Die Buchbinderei ist der Unterschlupf: Bett (`kind: rest`), Kiste (`kind: storage`), Fallwand (`kind: casewall`), **Bürgenbrett** (`kind: read` als Übergang, Wunsch `kind: vouchboard` in `offene_punkte.md`), wie `ds_speisewagen`.
- Rohrpost: 8 Rohrpost-Stationen auf Röhrenhof, Kronenarchiv und in Innenräumen (`kind: read`, `requires_items: cwa_rohrpostsiegel`), Texte von dir.
- In `pruefen.mjs`: alle Zeilen gleich lang, Spawns und Objekte begehbar, jeder Ausgang erreichbar.

## 2. Reise (`travel.json`, `landstrasse.json`)
- Stadtkarte von Calderwick: Einträge im Format von `src/data/packs/k3_orte/travel.json`, Freischaltung der Terrassen über Akt-Flags; die Fußgängerroute über die Treppen bleibt immer offen. Kartenmarker-Wünsche an CE.
- **Landstraße** (`reise_landstrasse`): das Reisegebiet zwischen `ds_endbahnhof`, `cw_gleisfuss` und später `bh_kutschenhof` (Kapitel 5), nach `docs/story/vorrat_gegner/zonen_vorschlag.json` → `vg_zone_all_landstrasse`. Liefere `landstrasse.json`: 10 bis 14 Reiseereignisse (Format `src/data/travel.json` → Ereignisse der Fahrt Kettlegate → Wexmoor), die die acht Reisefiguren `vn_*` (BJ) und die Gegner `vg_all_*` (BH) benutzen: Zoll, Kutschenpanne, Hausiererin, Landarzt, fahrender Richter, Waisenjunge, Überfall `vg_all_wegelagerer`, Grenzstein, als größeres Ereignis **entweder** `vg_all_boss_landvermesser` **oder** `vg_all_boss_schlafkutsche` (nie beide auf einer Fahrt). Jede Fahrt wählt 2 bis 3 Ereignisse; Hin- und Rückfahrt sind erlaubt (Dunscar bleibt erreichbar). Gewicht/Tragkraft: eine Fahrt kostet 4 Schilling oder ein `vi_m_wegzoll_marke`.

## 3. Gefahrengebiete (`zones.json`)
`cw_alte_setzerei` (tier 5), `cw_sortiergrube` (tier 5), `cw_nullfundament` (tier 6, erst ab `cwa_akt4_done`), Format wie `src/data/packs/k3_orte/zones.json`: `travel`, `lose_to` (Buchbinderei), Texte, `encounters` aus `vg_cw_*` (2 bis 4 pro Gebiet, mit `roam`, `elite` nach `verhalten.md`), der Boss des Gebiets aus `bosses.json`/`phasen.json`, `loot`, `elite_drops`. Die Vorratswerte sind für Sequenz 4 bis 3 ausgelegt; **Werte nicht ändern**, nur verknüpfen. Für den Spieler, der die Dunscar-Zutaten schon hat, ist Calderwick etwa gleich schwer wie Dunscars Rufschlucht; schreib die Erwartung in `README.md`.

## 4. Finale und Reste (`bosses.json`, Format `encounters`)
- `cwa_registerleib_rest`: optionaler Kampf in der Druckkammer (ein Abschnitt, Werte wie ein Nullfundament-Folgeabschnitt ×0,7), nur wenn der Spieler in V.3 den Kampf wählt. Texte schreibt CC.
- Ersatzquellen für Zutaten: trage an den drei Bossen `drops` mit `sq_zutat_<pfad>_3/_2/_1` für alle 10 Pfade ein, mit `requires_pathway` und `hide_if_items` (nur, wenn der Spieler die Zutat noch nicht hat). Wenn `hide_if_items` in Beute-Tabellen nicht existiert, Vorschlag in `offene_punkte.md`.

## 5. Beute und Gegenstände (`items.json`)
8 bis 12 neue Beute-Items mit Präfix `cwo_` (nur, was BL nicht hat: Standseilbahn-Marke, Aufzugsschlüssel, Lettern-Set als Trophäe, „Terrassen-Kaltbrot“), 1 Artefakt mit Vor- und Nachteil (Format `artifacts.list`), dazu Bilder in `grafikwuensche.md`. Händler: ordne die drei Händlerrollen aus `docs/story/vorrat_items/handel.json` Figuren zu (Lottie = Pfandhaus, Pritch = Streiktopf-Ausgabe, ein Marktstand am Quittungsmarkt), ohne BL zu ändern.

## 6. Kernmechanik „Bürgen und Abgleich“ (`buergenmechanik.md` + Grundgerüst)
- Spezifikation für den Code: Zustände (Anker gefunden / markiert / verbraucht, höchstens drei markierte Verbindungen, kostenloses Umsetzen im Unterschlupf), wie ein Abgleich definiert ist (Datenfelder aus CC `abgleiche.json`), was auf der Karte sichtbar wird (betroffene Straßen als Kachel-Overlay, gefährdete Kontakte als Symbol über der Figur, Vorschau vor dem Auslösen), Rücksetzung bei Fehlschlag (Rückweg zur letzten sicheren Kreuzung, Nervenverlust, Hinweise bleiben), öffentlich/vertraulich als Flag-Paar, Barrierefreiheit (Texte statt Farben, Journal-Begriffe bleiben stabil), alles mit Beispielen aus deinen Karten.
- **Grundgerüst** `docs/story/k4_orte/Vouch.skeleton.js` (nicht unter `src/`!): Klasse mit Methoden-Signaturen und Kommentaren (`mark(anker, ort)`, `unmark`, `preview(abgleich)`, `resolve(abgleich)`, `stableRoutes()`), wie sie in `GameState` und `WorldScene` eingehängt würde, ohne Logik-Details. Kein Spielcode wird geändert.

## 7. Lieferung
`maps.json`, `travel.json`, `landstrasse.json`, `zones.json`, `bosses.json`, `items.json`, Standard-Dateien (soweit nötig), `buergenmechanik.md`, `Vouch.skeleton.js`, `README.md`, `grafikwuensche.md` (nur, was CE/BI/BM nicht schon machen), `offene_punkte.md`, `pruefen.mjs`.

