# Codex-Prompts für „Nebelakten“ – Übersicht

Jede Datei ist **eigenständig** (Regeln, Formate, Ablage stehen drin). Codex braucht immer nur **eine** Datei. Alle Pakete schreiben in getrennte Ordner und können **gleichzeitig** laufen. Jedes Paket endet mit einem eigenen Pull Request.

## Läuft gerade
| Datei | Inhalt |
|---|---|
| `codex_X_artefakte_platzhalter.md` | Grafik: Treffen-Artefakte, restliche Platzhalter, Fall 9 |
| `codex_W_altstadt_nebengeschichten.md` | Grafik: Versunkene Altstadt (Kapitel 2) |

## Neu, parallel startbar
| Datei | Art | Inhalt | schreibt nach |
|---|---|---|---|
| `codex_Y_soundeffekte.md` | Ton | ca. 110 Soundeffekte (Oberfläche, Schritte, Welt, Polizei, Kampf, Okkultes, Atmo-Schleifen), selbst synthetisiert, + Audio-Grundgerüst | `public/audio/sfx/`, `tools/audio/sfx/`, `src/core/Audio.js` (nicht eingebunden) |
| `codex_Z_musik.md` | Ton | 26 Musikstücke mit Leitmotiven für Kettlegate und Wexmoor, im Skript komponiert | `public/audio/musik/`, `tools/audio/musik/` |
| `codex_AA_nebenquests_kettlegate.md` | Quests | 11 Nebenaufträge für die Auftragsfiguren + 3 Steckbriefe | `docs/story/kg_nebenquests/` |
| `codex_AB_nebenquests_wexmoor.md` | Quests | 10 Nebenaufträge in Wexmoor + 6 Ausbauten für den Torfkahn | `docs/story/wx_nebenquests/` |
| `codex_AC_kapitel3_story.md` | Story | Kapitel 3: zwei Pitches, Story-Bibel, Akt I als Daten (Entwurf zur Auswahl) | `docs/story/kapitel3/` |
| `codex_AD_lesetexte_lore.md` | Texte | Zeitungen nach jedem Fall/Akt, 40 Lesestücke, Passanten-Gerede, Item-Texte, Bestiarium | `docs/story/lore/` |
| `codex_AE_oberflaeche_wexmoor_leben.md` | Grafik | Einstellungs-Symbole, Touch-Knöpfe, Titelbild in Ebenen, Kapitelkarten, Zeitungs-UI, Tiere und Wetter für Wexmoor | `public/sprites/…`, Batch `oberflaeche` |
| `codex_AF_sequenzen.md` | Pfade | Sequenz 4 bis 1 für alle 7 Pfade, 3 neue Pfade (9 bis 1), Zutaten, Rituale, Balancing | `docs/story/sequenzen/` |

Größte Brocken: Z (Musik), AF (Sequenzen), AC (Kapitel 3), Y (Sounds). Die Text-Pakete liefern fertige Spieldaten als Entwurf; das Einbauen ins Spiel macht Claude danach.

Die erledigten Dateien (A bis V) liegen in `erledigt/`, alle älteren Prompts in `prompts_komplett.md`.
