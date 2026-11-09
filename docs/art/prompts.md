# Codex-Prompts für „Nebelakten“ – Übersicht

Jede Datei ist **eigenständig** (Regeln, Formate, Ablage stehen drin). Codex braucht immer nur **eine** Datei. Alle Pakete schreiben in getrennte Ordner und können **gleichzeitig** laufen. Jedes Paket endet mit einem eigenen Pull Request.

## Neu (Runde 3: Kapitel 2 ausbauen), parallel startbar
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
| `codex_Z_musik.md` | noch nicht geliefert |
| `codex_AA_nebenquests_kettlegate.md` | geliefert, Entwurf in `docs/story/kg_nebenquests/` |
| `codex_AB_nebenquests_wexmoor.md` | geliefert, Entwurf in `docs/story/wx_nebenquests/` |
| `codex_AC_kapitel3_story.md` | noch nicht geliefert (3 Geschichten zur Auswahl) |
| `codex_AD_lesetexte_lore.md` | geliefert, Entwurf in `docs/story/lore/` |
| `codex_AE_oberflaeche_wexmoor_leben.md` | noch nicht geliefert |
| `codex_AF_sequenzen.md` | geliefert, Entwurf in `docs/story/sequenzen/` |

Die erledigten Dateien (A bis V) liegen in `erledigt/`, alle älteren Prompts in `prompts_komplett.md`.
