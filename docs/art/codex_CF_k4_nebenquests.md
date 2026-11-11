# Codex-Paket CF: Kapitel 4, Nebenaufträge und Stadtleben in Calderwick

**Paket-Name:** `k4_nebenquests` · **Ordner:** `docs/story/k4_nebenquests/` · **ID-Präfix:** `cwn_`

Zwölf Nebenaufträge quer durch Calderwick, dazu Gerede, Lesestücke, Zeitung und Koop. Die Figuren und ihre Auftragskeime liegen im Vorrat (BJ `auftragskeime.json`, `bj_keim_cw_*`): daraus baust du fertige Quests, erfindest aber nicht alles neu.

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

## 1. Die 12 Nebenaufträge (Vorgaben, Details erfindest du)
Jeder Auftrag: Quest, Dialoge (als `dialog_zusaetze.json` an die BJ-Dialoge), Hinweise (gern eine Deduktion), Belohnung, mindestens eine Entscheidung mit Folge. 3 bis 6 Schritte, 20 bis 40 Minuten. Verteilt über alle sechs Terrassen und alle fünf Akte (Startbedingungen `cwa_akt<n>_done`). Acht Aufträge wachsen aus den BJ-Keimen (nenne den Keim im Feld `summary`), vier sind neu:
1. **`cwn_zwei_teller`** (Noel, Küche, aus `bj_keim_cw_noel_bellcross`): Noel kocht täglich zwei Portionen; der Lieferant streicht den zweiten Teller aus der Rechnung. Du beweist mit drei Nachbarn, dass Ida gegessen hat.
2. **`cwn_brotdose`** (Pritch, Setzergasse, aus `bj_keim_cw_pritch`): Arbeiter schmuggeln ausgefallene Lettern nach Hause; aus ihnen lässt sich ein gelöschter Name setzen. Wem gibst du ihn?
3. **`cwn_falscher_pfand`** (Lottie, Pfandhaus, aus `bj_keim_cw_wicksend`): drei Haushalte unter einem Namen; du ordnest die Gegenstände zurück oder lässt die Zusammenfassung stehen (bessere Preise).
4. **`cwn_klopfzeichen`** (Bexley, Witwenterrasse, aus `bj_keim_cw_bexley`): Mieter erkennen sich am Klopfen; eine Wohnung antwortet, die laut Hausbuch leer ist. Kampf mit `vg_cw_tintenschatten` möglich.
5. **`cwn_durchschlaege`** (Vera, Gepäckhalle, aus `bj_keim_cw_darnell`): ungestempelte Durchschläge an die richtigen Familien bringen, ohne dass Vera auffliegt.
6. **`cwn_falsche_adresse`** (Hesk, Röhrenhof, aus `bj_keim_cw_hesk`): eine Kiste mit dem Gewicht eines Menschen; Hesk bittet dich, nicht nachzusehen.
7. **`cwn_restaurierung`** (Malliver, Archivsaal, aus `bj_keim_cw_malliver`): eine beschädigte Akte retten, deren Inhalt Wetherby schadet; Malliver will Neutralität wahren.
8. **`cwn_warnbrief`** (Klammer, Buchbinderei, aus `bj_keim_cw_crayford`): Klammers Angst vor Akt III; ein kleiner Auftrag, der ihr Vertrauen aufbaut (Bindung).
9. **`cwn_seilbahn`** (Gleisfuß, neuer Aufzugswärter, Lauf-Sheet-Wunsch): der Schrägaufzug hält nachts auf einer Terrasse, die es nicht gibt. Belohnung: Abkürzung (Flag; Wirkung in `offene_punkte.md`).
10. **`cwn_brief_aus_dunscar`**: Pfiff schickt ein Paket (Inhalt je `k3a_end_*`), Botengang mit Wiedersehen per Brief.
11. **`cwn_telegramm_kettlegate`**: Marlowe meldet, dass verkaufte Revierakten in Calderwick aufgetaucht sind (Faden F4); Spur zum Lager am Quittungsmarkt.
12. **`cwn_letzte_terrasse`** (nach Akt IV): die Bewohner ohne amtliche Wohnung (Suppenküche) einzeln aufsuchen; vier kurze Szenen, jede Familie reagiert anders; zahlt in die Küchenbürgschaft von Akt V ein (Flag `cwn_kuechenliste`, CC prüft es als Bonus, nicht als Pflicht).
Ein Auftrag darf einen Kampf mit den normalen Gegnern `vg_cw_*` haben (Werte aus BH; nenne nur die Id).

## 2. Stadtleben
- `einwohner.json` + `platzierung.json`: 8 Einwohner `cwn_e_*` mit Tag/Nacht-Plätzen (Format `src/data/packs/k3_leben/einwohner.json`), je 6 Dialogknoten, Grafikwünsche (Lauf-Sheet, Kopf).
- `gerede.json`: 60 Sätze für Passanten in Calderwick, nach Terrasse und Akt gestaffelt (Format `src/data/packs/k3_leben/gerede.json`), trockener Amtswitz.
- `lesestuecke.json`: 25 Lesestücke (Format `src/data/packs/lore/lesestuecke.json`): Vorschriften an Wänden, Setzerwitze, Schuldscheine, Rohrpost-Zettel, Kinderreime über fehlende Buchstaben, Briefe mit leerer Anrede.
- `zeitung.json`: 8 Kurzmeldungen im „Calderwicker Anzeiger“ zu deinen Aufträgen.
- `leben.json`: Tiere und Wetter je Karte (Format `src/data/packs/k3_leben/leben.json`): Rußregen, Kalkstaub, Rohrpost-Zischen; Tauben, Ratten, eine Archivkatze (Grafikwünsche).
- Händlerstand am Quittungsmarkt mit saisonalen Waren aus BL `handel.json` (Rolle „Markt“), ohne BL zu ändern.

## 3. Koop
Wenn Spieler 2 dabei ist (`koop_aktiv`), bekommen 4 deiner Aufträge je einen zusätzlichen Gesprächszweig, in dem Spieler 2 etwas Eigenes beiträgt (Stimmen `p2a`/`p2b`, Format `src/data/packs/koop_k3/geplauder.json`). Dazu 24 Geplauder-Zeilen für Calderwick. Der Abgleich hat eine Koop-Regel: Spieler 2 kann als persönlicher Zeuge bürgen (ein Satz in `offene_punkte.md` für CD).

## 4. Lieferung
Standard-Dateien plus `einwohner.json`, `gerede.json`, `lesestuecke.json`, `zeitung.json`, `leben.json`, `geplauder.json`, `README.md`, `grafikwuensche.md`, `offene_punkte.md`, `pruefen.mjs`.

