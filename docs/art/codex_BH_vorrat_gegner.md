# Codex-Paket BH: Vorrat an Gegnern und Bossen (Werte, Bestiarium, Beute, Verhalten)

**Paket-Name:** `vorrat_gegner` · **Deine Dateien:** `docs/story/vorrat_gegner/` (`encounters.json`, `bosses.json`, `phasen.json`, `items.json` (Trophäen), `bestiarium.json`, `verhalten.md`, `zonen_vorschlag.json`, `dialogues.json` (Gegner mit Gespräch vor dem Kampf), README, offene_punkte, grafikwuensche, pruefen.mjs)

## Eckdaten „Vorrat“ (gilt für die Pakete BH bis BM, Stand 2026-11-10)

Diese Pakete bauen **Vorrat für spätere Kapitel**: Gegner, Figuren und Gegenstände, die fertig im Repo liegen, bevor ein Kapitel 4 geschrieben wird. Grundlage sind die beiden aufgehobenen Geschichten aus Paket AC: **`docs/story/kapitel3/geschichte_1.md`** („Die Stadt ohne Unterschrift“, Druckerstadt **Calderwick** auf sechs Kalkterrassen, Rohrpost, Register, Gegenspieler Oswin Wetherby) und **`docs/story/kapitel3/geschichte_2.md`** („Der Garten der fehlenden Tage“, Kurort **Briarholt** mit Glasgärten und Heizrohren, Gegenspielerin Dr. Meriel Greavesend). Lies beide ganz. Was dort steht, ist verbindlich; was fehlt, erfindest du im selben Ton. Dazu kommt ein **allgemeiner Vorrat** ohne Stadt (Landstraße, Reise, Wildnis), der in jedem Kapitel einsetzbar ist.

Sechs Pakete laufen gleichzeitig: Daten/Texte (BH Gegner, BJ Figuren, BL Gegenstände) und Grafik (BI, BK, BM). Damit sie zusammenpassen, gelten diese **festen IDs**. Benutze sie genau so.

| Paket | Name | Liefert | Schreibt nach |
|---|---|---|---|
| BH | `vorrat_gegner` | Werte, Bestiarium, Beute, Verhalten, Boss-Phasen für 24 Gegner und 8 Bosse | `docs/story/vorrat_gegner/` |
| BI | `vorrat1` | Grafik zu BH (Kampf-Sheets, Kartenfiguren, Bestiarium, Boss-Bänder, Kampf-Hintergründe) | Batch `vorrat1` |
| BJ | `vorrat_figuren` | 20 Figuren aus den beiden Geschichten + 8 Reisefiguren: Steckbrief, Stimme, Dialogbäume, Nebenauftrags-Keime | `docs/story/vorrat_figuren/` |
| BK | `vorrat2` | Grafik zu BJ (Lauf-Sheets, 8 Stimmungen, Köpfe, Sonderposen) | Batch `vorrat2` |
| BL | `vorrat_items` | 72 Gegenstände mit Werten und Texten (Ausrüstung, Waffen, Verbrauch, Artefakte, Handelswaren, Schlüsselstücke) | `docs/story/vorrat_items/` |
| BM | `vorrat3` | Icons zu BL und zu den Trophäen aus BH (16 und 32) | Batch `vorrat3` |

**Zielniveau:** Kapitel 4 spielt nach Dunscar, also Sequenz **4 bis 3**. Normale Gegner wie `src/data/packs/k3_orte/encounters.json` mal 1,3; Bosse wie `vorhauer`/`vielrufer` (`bosses.json`, `phasen.json`) mal 1,3. Ausrüstung eine Stufe über den Dunscar-Belohnungen. Keine Kernzutaten (die vergibt das Sequenz-System).

**Gegner (BH Werte, BI Grafik):**
- Calderwick, normal (Präfix `vg_cw_`): `vg_cw_letternlaeufer` (Haufen ausgesonderter Lettern auf Beinen), `vg_cw_rohrpostwespe` (Messingkapsel mit Flügeln), `vg_cw_stempelhand` (abgetrennter Ärmel mit Dienststempel), `vg_cw_durchschlag` (blasse Kopie eines Menschen aus Kohlepapier), `vg_cw_registerratte` (Ratte mit Aktenstreifen im Fell), `vg_cw_seilbahnwaechter` (Standseilbahn-Bremser ohne Gesicht), `vg_cw_tintenschatten`, `vg_cw_leerfracht` (Postsack, der sich bewegt).
- Calderwick, Bosse: `vg_cw_boss_bleisammler` (Alte Setzerei, aus Geschichte 1), `vg_cw_boss_blinder_zusteller` (Sortiergrube), `vg_cw_boss_nullfundament` (unter dem Archiv, drei Phasen).
- Briarholt, normal (Präfix `vg_bh_`): `vg_bh_dampfschwester` (Pflegerin aus Dampf, Haube), `vg_bh_wurzelgaenger` (Patient mit Wurzeln statt Händen), `vg_bh_glasmotte` (Motte aus beschlagenem Glas), `vg_bh_bluetenkopf` (Pfirsichblüte mit Gesicht, bewegungslos bis man nahe kommt), `vg_bh_rohrwurm` (Heizrohr-Segment, das kriecht), `vg_bh_postkartenschreiber` (Kurgast, der denselben Satz murmelt), `vg_bh_waeschegeist`, `vg_bh_sudtraeger` (Kessel mit Beinen, kocht).
- Briarholt, Bosse: `vg_bh_boss_glasgaertner` (Kaltes Palmhaus, aus Geschichte 2), `vg_bh_boss_waescherei` (Verlassene Wäscherei, der verdichtete Dampf), `vg_bh_boss_mutterwurzel` (Wurzelkammer, drei Phasen).
- Allgemein, Landstraße und Reise (Präfix `vg_all_`): `vg_all_wegelagerer`, `vg_all_kutschengeist`, `vg_all_zollhund`, `vg_all_nebelkraehe`, `vg_all_marktschreier` (Betrüger, Dialog vor dem Kampf), `vg_all_grenzstein` (Stein, der die Richtung ändert), `vg_all_fuhrmannsschatten`, `vg_all_brueckenzoll` (Zöllner ohne Brücke).
- Allgemein, Bosse: `vg_all_boss_landvermesser` (zählt Schritte, Reise-Boss), `vg_all_boss_schlafkutsche` (Kutsche voller schlafender Reisender).
- Trophäen (BH definiert, BM zeichnet): je Gegner und Boss ein Item `vt_<gegner ohne vg_>` (z. B. `vt_cw_letternlaeufer`), 34 Stück.

**Figuren (BJ Texte, BK Grafik):** die zehn Figuren aus Geschichte 1 als `cw_<nachname klein>` (`cw_crayford`, `cw_ida_bellcross`, `cw_noel_bellcross`, `cw_wetherby`, `cw_darnell`, `cw_hesk`, `cw_wicksend`, `cw_bexley`, `cw_malliver`, `cw_pritch`), die zehn aus Geschichte 2 als `bh_<nachname klein>` (`bh_bellweather`, `bh_orla_fencrest`, `bh_felix_fencrest`, `bh_greavesend`, `bh_vellish`, `bh_malkin`, `bh_rookwell`, `bh_henshall`, `bh_crowther`, `bh_dipple`). Dazu acht Reisefiguren ohne Stadt (Präfix `vn_`): `vn_kutscherin`, `vn_zoellner`, `vn_hausiererin`, `vn_landarzt`, `vn_wanderprediger`, `vn_kartenzeichnerin`, `vn_fahrender_richter`, `vn_waisenjunge`.

**Gegenstände (BL Werte, BM Icons, Präfix `vi_`):** 12 Ausrüstungsstücke (`vi_hut_*`, `vi_mantel_*`, `vi_amulett_*`, je 4), 6 Waffen (`vi_waffe_*`), 16 Verbrauchsgegenstände (`vi_v_*`), 8 Artefakte (`vi_art_*`), 18 Handelswaren und Materialien (`vi_m_*`), 12 Schlüssel- und Fundstücke für die beiden Geschichten (`vi_k_cw_*`, `vi_k_bh_*`, je 6). Die genauen Namen legt BL fest; BM zeichnet nach BLs Tabelle **oder**, wenn BL noch nicht da ist, nach der Beschreibungstabelle im eigenen Paket (beide Pakete enthalten dieselbe Tabelle; BM gewinnt bei Abweichungen in der Grafik, BL in den Werten).

**Was Vorrat heißt:** Nichts davon wird jetzt ins laufende Spiel eingebaut. Daten liegen in `docs/story/vorrat_*/` im Pack-Format (`src/data/packs/k3_orte/` als Vorlage), Grafik regulär unter `public/sprites/` mit Manifest, damit der spätere Einbau nur Dateien verschiebt. Keine Karten, keine Quests, keine Flags der Kapitel 1 bis 3.

## 0. Regeln für Text- und Datenpakete (bitte zuerst lesen)

Diese Datei ist in sich vollständig. „Nebelakten“ ist ein originales 2D-Pixel-Mysteryspiel in Phaser 3 (Repo `Wuerfelduell/Dnd`, Browser, Sprache Deutsch). Kapitel 1 spielt in der Nebelstadt Kettlegate, Kapitel 2 in der Moorstadt Wexmoor, Kapitel 3 in der stillgelegten Kalkbergbau-Stadt Dunscar. Du lieferst **Daten und Texte**, keinen Spielcode (außer dort, wo ein Paket ausdrücklich ein Grundgerüst verlangt).

**Format:** Jedes Text-Paket liefert nach `docs/story/<paket>/` die acht Standarddateien im Format von `src/data/packs/k2_gilde/` bzw. `src/data/packs/k3_orte/`: `quests.json`, `items.json`, `encounters.json`, `dialogues.json`, `npcs.json`, `case.json`, `dialog_zusaetze.json` (nur `choices_add` und `nodes_add` an bestehende Figuren), `platzierung.json` (Objekte und NPC-Positionen auf **vorhandenen** Karten, Koordinaten nullbasiert in 16-Pixel-Kacheln, als Vorschlag markiert). Leere Dateien sind `[]` bzw. `{}`. Dazu `README.md` (Überblick, Spielzeit, Reihenfolge), `offene_punkte.md` (alles, was Code oder ein anderes Paket braucht), `grafikwuensche.md` (Tabelle: ID, Art, Maße, Beschreibung, bisheriger Platzhalter, englischer Bildprompt) und `pruefen.mjs` (Node ohne Pakete: lädt den Inhalt über `tests/helpers.js` → `loadContent()`, prüft, dass alle verwiesenen Karten, Items, Flags, Figuren und Dialogknoten existieren und dass jede Quest vom Start aus erreichbar ist; Ausgabe in die PR-Beschreibung).

**Vorhandene Felder benutzen, keine erfinden.** Dialoge: `nodes.<id>.text`, `choices[].{text, next, requires_flags, hide_if_flags, requires_items, requires_money, requires_pathway: [pfad, seq], requires_bond, requires_nerves, requires_signal_charge, effects: {sets_flags, gives_items, takes_items, money, honor, nerves, bond, unruhe, wanted, signal, combat, quest_start, quest_step, scene}}`. Quests: `id, title, summary, steps[].{text, done_flag, target}, rewards`. Begegnungen: wie `src/data/packs/k3_orte/encounters.json` (`hp, power, defense, speed, loot, chapter: 3, sheet`). Gegner, Karten oder Figuren, die du brauchst, aber nicht besitzt, stehen in `offene_punkte.md`. Kein `platzhalter`-Feld in Spieldaten, Platzhalter nur in `grafikwuensche.md`.

**Ton:** nüchtern, viktorianisch-industriell, melancholisch, trocken-humorvoll, nie albern, keine Anglizismen, keine Markennamen, keine Zitate aus fremden Werken. Figuren sprechen in kurzen Sätzen; Lesestücke höchstens 90 Wörter. Keine Buchstaben in Bildbeschreibungen.

**Abgabe:** ein Pull Request nur mit deinen Dateien, Beschreibung mit Prüf-Ausgabe, Inhaltsliste und Spielzeit-Schätzung. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Ordner an, ändere keine bestehenden Dateien außer `docs/story/README.md` (eine Zeile anhängen).

## 1. Werte (`encounters.json`, `bosses.json`, `phasen.json`)

Format exakt wie `src/data/packs/k3_orte/encounters.json`, `bosses.json`, `phasen.json` (Felder, Angriffsmuster, `tells` für Ausweichen/Parieren, `loot`, `chapter: 4`). 24 normale Gegner, Zielniveau Seq 4 bis 3 (Dunscar mal 1,3), je Stadt ein Mix aus schnell/zäh/fern/Betäubung/Nervenschaden; mindestens 4 Gegner, die **nicht** sterben (bewusstlos, fliehen, zerfallen zu Papier). 8 Bosse: Nullfundament und Mutterwurzel mit 3 Phasen, die übrigen mit 2; jede Phase mit Übergangstext und einer neuen Angriffsart. Friedliche Lösung für 3 Bosse vorsehen (`dialogues.json`, Flag `vg_<boss>_geloest`, keine Kernzutaten). Elite-Varianten über `elite_hp`/`elite_dmg` wie `src/data/stadtgegner.json`. Balance-Tabelle in README: erwartete Runden gegen einen Spieler mit Dunscar-Ausrüstung und Seq 4, Prüfung mit `tests/helpers.js` → `fight()` im `pruefen.mjs` (Sieg möglich, nicht unter 4 Runden).

## 2. Bestiarium (`bestiarium.json`) und Verhalten (`verhalten.md`)
Je Gegner: Name, Herkunft (ein Satz Lore, passend zur Geschichte), Schwäche, Beobachtung („Hält vor dem Sprung die Flügel still.“), 2 Gerede-Zeilen von Einwohnern, 1 Zeitungsnotiz. `verhalten.md`: Karten-Verhalten (Streuner, Wächter, Lauerer, Flüchter; Sicht/Hörweite in Kacheln; Tag/Nacht), Gruppen (wer mit wem), welche sich im Koop anders verhalten (greift den Schwächeren an / teilt sich).

## 3. Beute und Zonen
Jeder Gegner lässt seine Trophäe `vt_<id>` (in `items.json`, `kind: trophy`, Verkaufspreis, Beschreibung) und ein Material aus der BL-Liste (nur per ID, `vi_m_*`) fallen; Bosse zusätzlich ein Ausrüstungsstück oder Artefakt aus BL (Verweis, keine Definition). `zonen_vorschlag.json`: 7 Gefahrengebiete (3 Calderwick, 3 Briarholt, 1 Landstraße) im Format `src/data/packs/k3_orte/zones.json` mit `tier`, Gegnerliste, Elite-Chance, Boss, Behälterbeute, aber **ohne Karte** (Kartenentwurf in README als Textskizze 40x30).

## 4. Abgabe
`pruefen.mjs` (alle `vi_`-Verweise stehen in der gemeinsamen Tabelle, alle Trophäen definiert, Kämpfe gewinnbar), `grafikwuensche.md` (nur Abweichungen von den festen Beschreibungen, BI hat die Liste), `offene_punkte.md`.
