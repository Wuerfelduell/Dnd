# Codex-Prompts für „Nebelakten“ – Übersicht

Jede Datei ist **eigenständig** (Regeln, Formate, Ablage stehen drin). Codex braucht immer nur **eine** Datei. Alle Pakete schreiben in getrennte Ordner und können **gleichzeitig** laufen. Jedes Paket endet mit einem eigenen Pull Request.

## Runde 5 (2026-11-10): Lücken in Kapitel 3, Koop, Platzhalter, parallel startbar
Alle teilen dieselben Eckdaten mit festen IDs. BN liegt hinter BM, weil AZ das Beziehungs-Paket aus einem anderen Thread ist.

| Datei | Art | Inhalt | schreibt nach |
|---|---|---|---|
| `codex_BN_k3_ruf.md` | Gerüst + Daten | Rufextras: Linienprojektion, Hörreichweite, private Bindung, Klang-Zuordnung der 16 AY-Rufe, 6 Stationen, Tests | `src/core/SignalRoutes.js`, `src/data/packs/k3_ruf/`, `docs/story/k3_ruf/` |
| `codex_BA_ruf_leben_grafik.md` | Grafik | Ruf-Oberfläche (Linien, Nischen, Hörkreis, Bindung, Schleuse), Dunscar-Tiere und -Wetter, 10 Stände, Ruth Bellwick | Batch `dunscar4` |
| `codex_BB_icons2.md` | Grafik | alle 40 geliehenen Item-Icons, Tränke/Formeln der neuen Pfade 9 bis 5 und aller Pfade 4 bis 1 (150 Icons 16, 55 Icons 32) | Batch `icons2` |
| `codex_BC_k3_handel.md` | Daten | 3 Händler, Zirkel „Schichtbund“ mit Auktion, 5 Einzelgänger mit Bindung, 7 kleine Aufträge | `docs/story/k3_handel/` |
| `codex_BD_k3_leben.md` | Daten | 8 Einwohner mit Tag/Nacht, 80 Gerede-Zeilen, Kopfgeld-Brett mit 6 Stadtgegnern, Bahnaufsicht, 20 Zeitungsmeldungen, Tier-/Wetter-Zuordnung | `docs/story/k3_leben/` |
| `codex_BE_dunscar_figuren2.md` | Grafik | Figuren aus BC und BD (3 Händler, 4 Zirkel, 5 Einzelgänger, 8 Einwohner, 2 Aufseher), 11 Gegner-Sheets, Steckbriefe | Batch `dunscar5` |
| `codex_BF_koop_k3.md` | Texte | Koop in Dunscar: 40 Geplauder, 3 Kampf-Anlässe, Rufen zu zweit, Reaktionen der 11 Figuren, 2 Aufträge zu zweit | `docs/story/koop_k3/` |
| `codex_BG_koop_beute.md` | Gerüst + Daten | getrennte Beute im Koop: Ansprüche je Spieler, Ersatz verlorener Tränke, Hedda/Pfiff/Kittering-Dialoge, Tests | `src/core/Claims.js`, `src/data/packs/koop_beute/`, `docs/story/koop_beute/` |

## Vorrat für spätere Kapitel (2026-11-10), parallel startbar
Grundlage: die aufgehobenen Geschichten 1 (Calderwick) und 2 (Briarholt) aus `docs/story/kapitel3/` plus allgemeiner Reise-Vorrat. Nichts davon wird jetzt eingebaut; es liegt fertig im Repo.

| Datei | Art | Inhalt | schreibt nach |
|---|---|---|---|
| `codex_BH_vorrat_gegner.md` | Daten | 24 Gegner, 8 Bosse (Werte Seq 4 bis 3, Phasen, Bestiarium, Verhalten, Trophäen, 7 Zonen-Skizzen) | `docs/story/vorrat_gegner/` |
| `codex_BI_vorrat_gegner_grafik.md` | Grafik | Kampf-Sheets, Kartenfiguren, Bestiarium, Boss-Bänder, 7 Hintergründe, 6 Effekte | Batch `vorrat1` |
| `codex_BJ_vorrat_figuren.md` | Daten | 20 Figuren der beiden Geschichten + 8 Reisefiguren: Steckbriefe, Dialogbäume, 28 Auftragskeime, Reaktionen | `docs/story/vorrat_figuren/` |
| `codex_BK_vorrat_figuren_grafik.md` | Grafik | 28 Lauf-Sheets, 8 Stimmungen, Köpfe, Sonderposen, 2 Gegenspieler-Kampf-Sheets | Batch `vorrat2` |
| `codex_BL_vorrat_items.md` | Daten | 72 Gegenstände (12 Ausrüstung, 6 Waffen, 16 Verbrauch, 8 Artefakte, 18 Waren, 12 Schlüsselstücke) mit Werten und Texten | `docs/story/vorrat_items/` |
| `codex_BM_vorrat_items_grafik.md` | Grafik | 72 Item-Icons + 34 Trophäen (16), 38 davon auch 32 | Batch `vorrat3` |

## Neu: Musik ohne Audiodateien (ersetzt Z), parallel startbar
Z ist zweimal gescheitert, weil Codex die vielen OGG/MP3-Dateien nicht hochladen konnte. Jetzt wird Musik als JSON-Notendaten geliefert („Nebel-Musik v1“) und im Spiel per WebAudio gespielt. Keine Audiodateien mehr.

| Datei | Art | Inhalt | schreibt nach |
|---|---|---|---|
| `codex_Z1_musik_synth.md` | Grundgerüst | `src/core/MusicSynth.js` (eigenständig), 30 Instrumente, Prüfer, Vorschau-Seite, 3 Beispielstücke | `src/core/`, `public/audio/musik/`, `tools/audio/musik/` |
| `codex_Z2_musik_kettlegate.md` | Ton | 13 Stücke Kapitel 1 + Zuordnung aller Kettlegate-Karten | `public/audio/musik/` |
| `codex_Z3_musik_wexmoor.md` | Ton | 10 Stücke Kapitel 2 + Abspann + Zuordnung aller Wexmoor-Karten | `public/audio/musik/` |
| `codex_AY_dunscar_musik.md` | Ton | neu als Notendaten: 17 Dunscar-Stücke, 16 Rufmuster mit Nachhall, Zug- und Boss-Klänge | `public/audio/musik/` (Präfix `ds_`) |
| `codex_AZ_beziehungen.md` | Texte | Beziehungssystem füllen: Begrüßungen je Stimmung, Geschenk-Vorlieben, Knoten-Wirkungen, Wiedergutmachungs-Zweige (Gerüst ist im Spiel) | `docs/story/beziehungen/` |

## Runde 4: Kapitel 3 „Der letzte Zug nach Dunscar“, parallel startbar
Vorlage ist Geschichte 3 aus `docs/story/kapitel3/geschichte_3.md` (Geschichten 1 und 2 bleiben für später). Alle acht teilen dieselben Eckdaten mit festen IDs.

| Datei | Art | Inhalt | schreibt nach |
|---|---|---|---|
| `codex_AR_k3_akte.md` | Story | Hauptstory: Anreise je Wexmoor-Ende, 5 Akte x 4 Fährten, Verhöre, Rufmuster, Horchstellen, 4 Enden, Epiloge | `docs/story/k3_akte/` |
| `codex_AS_k3_orte.md` | Karten/Gegner | alle Karten (6 Viertel, 5 Innenräume, Zug, 3 Gefahrengebiete, Finale, Superboss-Gebiet), Gegner- und Bosswerte, Beute, Reise, Rufmechanik-Spezifikation + Grundgerüst | `docs/story/k3_orte/` |
| `codex_AT_k3_nebenquests.md` | Quests | 12 Nebenaufträge, Gerede, Lesestücke, Zeitung, Bestiarium | `docs/story/k3_nebenquests/` |
| `codex_AU_k3_pruefungen.md` | Pfade | 10 Sequenz-Prüfungen (Seq 4), Herkunft aller Kernzutaten Seq 5 bis 1, Rituale Seq 4 bis 1 | `docs/story/k3_pruefungen/` |
| `codex_AV_dunscar_orte_grafik.md` | Grafik | Tilesets, Props, Innenräume, Nachtzug, Kampf-Hintergründe, Stadtkarte, Kapitelkarte | Batch `dunscar1` |
| `codex_AW_dunscar_figuren.md` | Grafik | 11 Figuren, Gallowmere als Nachhall, Schichtgänger, Einwohner, Szenenbilder | Batch `dunscar2` |
| `codex_AX_dunscar_gegner.md` | Grafik | 6 Gegner, 5 Bosse, 10 Prüfungsbosse, Rufmuster-Symbole | Batch `dunscar3` |
| `codex_AY_dunscar_musik.md` | Ton | neu geschrieben, siehe oben | |


## Runde 3: Kapitel 2 ausbauen
Alle sechs teilen dieselben Eckdaten (neue Figuren, Orte, Zirkel mit festen IDs) und passen deshalb zusammen.

| Datei | Art | Inhalt | schreibt nach |
|---|---|---|---|
| `codex_AL_k2_akten.md` | Fälle | 4 Wexmoorer Akten: richtige Fälle wie in Kapitel 1, je 30 bis 45 Minuten | `docs/story/k2_akten/` |
| `codex_AM_k2_orte.md` | Karten/Quests | 3 neue Orte als Karten (Floßfriedhof, Lichtamt, Gefahrengebiet Torfbrüche), Monster-Werte, Beute, Auftragskette „Das Grab ohne Namen“ | `docs/story/k2_orte/` |
| `codex_AN_k2_orte_grafik.md` | Grafik | Kacheln und Props für die 3 Orte, 4 Monster, Boss Moorbraut, Kampf-Hintergründe, Beute-Icons | Batch `wexmoor6` |
| `codex_AO_k2_figuren.md` | Grafik | 11 neue Figuren (Lauf-Sheet, 8 Stimmungen, Kopf, Sonderposen), Maler als Gegner | Batch `wexmoor7` |
| `codex_AP_k2_akte.md` | Story | 10 optionale Fährten (2 pro Akt), Akt V verlängert, Epiloge für alle 4 Enden, Schlickjunge „Krabbe“ | `docs/story/k2_akte/` |
| `codex_AQ_k2_gilde.md` | Zirkel/Quests | dritter Wexmoor-Zirkel „Täfelchengilde“ mit Auktion, Aufnahme-Auftrag, 3 Mitglieder-Aufträgen | `docs/story/k2_gilde/` |


## Runde 2
| Datei | Art | Inhalt | schreibt nach |
|---|---|---|---|
| `codex_AG_sequenzen_grafik.md` | Grafik | alles aus der AF-Wunschliste: 55 Kampf-Effekte, 55 Zutaten-Icons, 6 Artefakt-Icons, Embleme/Karten/Rituale/Auren für Waage, Moor, Uhr, Spieler-Kampfposen für die neuen Pfade | Batch `sequenzen3` |
| `codex_AH_spieler2_figur.md` | Grafik | eigene Figur für Spieler 2 in zwei Varianten: Karte, Verkleidungen, Kampf (alle 10 Pfade), Portraits, Koop-Oberfläche | Batch `spieler2` |
| `codex_AI_koop_texte.md` | Texte/Quests | Spieler 2: Hintergrund, 80 Gespräche unterwegs, Kampfsprüche, Reaktionen von 12 Figuren, 3 Aufträge nur zu zweit | `docs/story/koop/` |
| `codex_AJ_nebenquests_grafik.md` | Grafik | alles aus den Wunschlisten von AA und AB: neue Figuren, Gegner, Items, Torfkahn-Ausbauten | Batch `nebenquests` |
| `codex_AK_emotionen.md` | Grafik | 4 neue Stimmungen (wütend, traurig, nachdenklich, entschlossen) für 32 Hauptfiguren | Batch `emotionen2` |

## Runde 1
| Datei | Stand 2026-11-09 17:00 |
|---|---|
| `codex_W_altstadt_nebengeschichten.md` | geliefert (PR #109), Einbau offen |
| `codex_X_artefakte_platzhalter.md` | geliefert (PR #114), Einbau offen |
| `codex_Y_soundeffekte.md` | geliefert (PR #120), Einbau offen |
| `codex_Z_musik.md` | zweimal gescheitert (Audio-Upload), ersetzt durch Z1 bis Z3 |
| `codex_AA_nebenquests_kettlegate.md` | geliefert, Entwurf in `docs/story/kg_nebenquests/` |
| `codex_AB_nebenquests_wexmoor.md` | geliefert, Entwurf in `docs/story/wx_nebenquests/` |
| `codex_AC_kapitel3_story.md` | noch nicht geliefert (3 Geschichten zur Auswahl) |
| `codex_AD_lesetexte_lore.md` | geliefert, Entwurf in `docs/story/lore/` |
| `codex_AE_oberflaeche_wexmoor_leben.md` | noch nicht geliefert |
| `codex_AF_sequenzen.md` | geliefert, Entwurf in `docs/story/sequenzen/` |

Die erledigten Dateien (A bis V) liegen in `erledigt/`, alle älteren Prompts in `prompts_komplett.md`.
