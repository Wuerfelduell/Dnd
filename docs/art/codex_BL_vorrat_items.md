# Codex-Paket BL: Vorrat an Gegenständen (72 Items mit Werten und Texten)

**Paket-Name:** `vorrat_items` · **Deine Dateien:** `docs/story/vorrat_items/` (`items.json`, `artifacts.json`, `gear.json`, `handel.json`, `fundstuecke.json` (Untersuchen-Dialoge), README, offene_punkte, grafikwuensche, pruefen.mjs)

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

## Gemeinsame Gegenstandstabelle (BL und BM identisch)

| ID | Art | Beschreibung (Bild und Wirkung in einem Satz) |
|---|---|---|
| `vi_hut_setzerkappe` | hut | Schwarze Setzerkappe mit Bleiglanz; Schutz vor Nervenverlust durch Lesen. |
| `vi_hut_kurhaube` | hut | Weiße Pflegehaube mit grünem Band; Leben +, Nerven-Höchstwert -. |
| `vi_hut_zylinder_vermesser` | hut | Zylinder mit Messband als Hutband; Reise-Ereignisse günstiger. |
| `vi_hut_fuhrmannshut` | hut | Breiter Filzhut mit Regenrand; Schutz vor Wetter-Malus. |
| `vi_mantel_druckerschurz` | mantel | Lederschurz voller Tintenflecken; Rüstung gegen Schnitt. |
| `vi_mantel_dampfmantel` | mantel | Gewachster Mantel mit Kupferösen; Rüstung gegen Hitze und Dampf. |
| `vi_mantel_reisepelerine` | mantel | Graue Pelerine mit vielen Taschen; Tragkraft +. |
| `vi_mantel_archivrobe` | mantel | Dunkelblaue Robe mit Siegelschnur; Ansehen bei Ämtern. |
| `vi_amulett_bleiletter` | amulett | Eine einzelne Bleiletter ohne Zeichen an Schnur; Geistsicht länger. |
| `vi_amulett_pfirsichkern` | amulett | Geschnitzter Pfirsichkern; Unruhe sinkt langsamer, Leben regeneriert. |
| `vi_amulett_grenzsteinsplitter` | amulett | Splitter mit halbem Wappen; Flucht gelingt öfter. |
| `vi_amulett_rohrpostkapsel` | amulett | Winzige Messingkapsel, innen ein Zettel; einmal pro Kampf ein Treffer abgewehrt. |
| `vi_waffe_setzhaken` | waffe | Stahlhaken der Setzer; schnell, geringer Schaden. |
| `vi_waffe_bleihammer` | waffe | Schwerer Hammer mit Bleikopf; langsam, hoher Schaden. |
| `vi_waffe_veredelungsschere` | waffe | Gärtnerschere mit zwei Klingen; zwei Treffer. |
| `vi_waffe_dampfrohr` | waffe | Abgesägtes Heizrohr, noch warm; Hitze-Schaden. |
| `vi_waffe_kutschpeitsche` | waffe | Lange Peitsche mit Bleiknoten; Reichweite, trifft zuerst. |
| `vi_waffe_richterstab` | waffe | Schwarzer Stab mit Silberknauf; Schutz beim Parieren. |
| `vi_v_setzerbrot` | verbrauch | Brot mit eingebackener Letter; Leben +. |
| `vi_v_terrassentee` | verbrauch | Rußiger schwarzer Tee; Nerven +. |
| `vi_v_durchschlagpapier` | verbrauch | Blatt Kohlepapier; kopiert einmal einen Hinweis. |
| `vi_v_rohrpostmarke` | verbrauch | Marke für die Rohrpost; einmal Schnellreise umsonst. |
| `vi_v_pfirsichsud` | verbrauch | Klarer warmer Sud; Leben stark +, danach kurz Unruhe. |
| `vi_v_wurzelpastille` | verbrauch | Bittere braune Pastille; Unruhe sinkt. |
| `vi_v_dampfkompresse` | verbrauch | Heiße Kompresse; hebt Betäubung auf. |
| `vi_v_kurkarte` | verbrauch | Blaue Kurkarte; einmal freier Eintritt. |
| `vi_v_wegzehrung` | verbrauch | Speck, Brot, Zwiebel im Tuch; Leben + auf Reisen. |
| `vi_v_laternenoel_klar` | verbrauch | Klares Öl; Geistsicht länger. |
| `vi_v_zollsiegel` | verbrauch | Rotes Siegel; einmal Streife umgehen. |
| `vi_v_riechsalz_stark` | verbrauch | Starkes Riechsalz; hebt K.o. auf (Koop). |
| `vi_v_nebelkerze` | verbrauch | Kurze Kerze, blauer Rauch; Gegner übersehen dich einen Raum lang. |
| `vi_v_schlafpulver` | verbrauch | Pulver in Papier; Gegner setzt eine Runde aus. |
| `vi_v_schreibfeder_eisen` | verbrauch | Feder aus Eisen; Verhör-Bonus einmal. |
| `vi_v_bitterwasser` | verbrauch | Trübes Wasser aus der Terrasse; heilt Vergiftung. |
| `vi_art_das_leere_tuerschild` | artefakt | Messingschild ohne Namen; Gegner vergessen dich nach der Flucht, dafür verblasst eine Beziehung pro Tag. |
| `vi_art_der_erste_durchschlag` | artefakt | Durchschlag mit fremder Unterschrift; einmal pro Kampf ein Treffer doppelt, Nerven-Höchstwert -10. |
| `vi_art_die_warme_postkarte` | artefakt | Postkarte, die nie kalt wird; Nerven regenerieren im Kampf, aber Unruhe steigt beim Lesen. |
| `vi_art_der_falsche_fahrplan` | artefakt | Fahrplan mit Personen als Fracht; Schnellreise ohne Ereignis, Beute -20 %. |
| `vi_art_die_gaertnerschnur` | artefakt | Grüne Schnur mit Knoten; Heilung +50 %, Rüstung -2. |
| `vi_art_der_stille_stempel` | artefakt | Stempel ohne Zeichen; Verhöre leichter, Ehre pro Fall -5. |
| `vi_art_das_bremserseil` | artefakt | Seil der Standseilbahn; Flucht immer möglich, erster Treffer trifft immer dich. |
| `vi_art_die_kurglocke` | artefakt | Kleine Glocke der Stillenhäuser; Gegner beginnen schlafend, wachen aber bei Schaden doppelt zornig auf. |
| `vi_m_bleiletter` | material | Ein Beutel ausgesonderter Lettern. |
| `vi_m_tintenkuchen` | material | Getrocknete Druckerschwärze. |
| `vi_m_rohrpostkapsel_leer` | material | Leere Messingkapsel. |
| `vi_m_registerband` | material | Rotes Band aus einem Register. |
| `vi_m_terrassenruss` | material | Fetter schwarzer Ruß von den Regenrinnen. |
| `vi_m_seilbahnfett` | material | Dose Schmierfett. |
| `vi_m_pfirsichholz` | material | Helles Holz aus den Glasgärten. |
| `vi_m_glasscherbe_beschlagen` | material | Scherbe mit innenliegendem Beschlag. |
| `vi_m_wurzelfaser` | material | Zähe helle Faser, warm. |
| `vi_m_kupferrohrstueck` | material | Kurzes Rohr mit Kalkrand. |
| `vi_m_kurwaesche` | material | Gefaltetes weißes Laken mit Nummer-Stickerei ohne Ziffern. |
| `vi_m_sudflasche` | material | Dunkle Flasche mit Rest. |
| `vi_m_wegzoll_marke` | material | Blechmarke eines Zolls. |
| `vi_m_kutschenlaterne` | material | Kleine Kutschenlaterne, Glas gesprungen. |
| `vi_m_landkarte_rest` | material | Kartenstück ohne Namen. |
| `vi_m_pferdehaar` | material | Strähne Pferdehaar. |
| `vi_m_grenzsteinmoos` | material | Moos von einem Grenzstein. |
| `vi_m_predigerzettel` | material | Zettel mit Andeutung von Schrift. |
| `vi_k_cw_randkorrektur` | schluessel | Idas handschriftliche Randkorrektur an einem Druckbogen. |
| `vi_k_cw_ungestempelter_durchschlag` | schluessel | Veras Durchschlag ohne Stempel. |
| `vi_k_cw_falsche_quittung` | schluessel | Hesks Quittung mit falschem Zielort. |
| `vi_k_cw_pfandzettel` | schluessel | Lotties Pfandzettel unter falschem Namen. |
| `vi_k_cw_heizungsrohr_skizze` | schluessel | Bexleys Skizze, wer hinter welchem Rohr wohnt. |
| `vi_k_cw_streiktopf_auszug` | schluessel | Pritchs Auszugsblatt. |
| `vi_k_bh_postkarte_verworfen` | schluessel | Orlas verworfene Postkarte. |
| `vi_k_bh_pflanzenkapsel` | schluessel | Die versiegelte Pflanzenkapsel. |
| `vi_k_bh_einweisung` | schluessel | Felix’ unterschriebene Einweisung. |
| `vi_k_bh_beetschild` | schluessel | Umgedrehtes Beetschild aus den Glasgärten. |
| `vi_k_bh_namensheft` | schluessel | Schwester Ennas Heft der verlorenen Namen. |
| `vi_k_bh_wurzelzeichnung` | schluessel | Dipples Zeichnung der Wurzeln vor dem Bau. |

## 1. Werte und Formate
- Ausrüstung (`gear.json`): `kind: gear`, `slot`, `boons` im Artefakt-Format, Gewicht, Preis; Werte eine Stufe über `k3o_stillring`/den Prüfungsbelohnungen (`src/data/items.json` → `kind: gear`, `src/core/Gear.js`). Je Slot ein Stück für Kampf, Ermittlung, Reise, Soziales.
- Waffen: Format `schlagstock`/`stockdegen` in `src/data/items.json` (Schaden, Tempo, Treffer, Besonderheit). Keine Waffe stärker als die beste Dunscar-Waffe mal 1,25.
- Verbrauch: Effekte nur aus dem vorhandenen Katalog (`heal`, `nerves`, `unruhe`, `cure`, `revive` für Koop, `stealth`-artige Wirkungen als Flag mit Dauer in `offene_punkte.md` beschreiben, nicht erfinden).
- Artefakte (`artifacts.json`): Format `src/data/packs/k3_orte/artifacts.json` (Vorteil und Nachteil, `passive`-Schlüssel aus `src/core/Artifacts.js`; fehlt ein Schlüssel, in `offene_punkte.md`). Jedes Artefakt hat eine Fundgeschichte (3 Sätze) und einen Untersuchen-Dialog in `fundstuecke.json` (Feld `inspect`, Format `src/data/dialogues/fundstuecke.json`).
- Handelswaren: Einkaufs-/Verkaufspreise, wer sie ankauft (Rolle), wofür sie taugen (Verweis auf Auftragskeime aus BJ nur per Text).
- Schlüsselstücke: `kind: key`, Beschreibung, Untersuchen-Dialog mit 2 bis 3 Erkenntnissen, aber keine Fall-Hinweise (keine `clues`), weil es die Fälle noch nicht gibt.

## 2. Abgabe
`pruefen.mjs` (72 IDs genau wie in der Tabelle, jedes Item hat Name, Beschreibung, Gewicht, Preis; Artefakte je einen Vor- und Nachteil), README mit Preis- und Gewichtstabelle, `grafikwuensche.md` leer bis auf Abweichungen (BM hat dieselbe Tabelle).
