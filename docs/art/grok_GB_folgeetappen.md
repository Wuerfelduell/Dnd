# Grok-Paket GB: Folge-Etappen nach GA

Stand 2026-11-17. Erst anfangen, wenn die GA-Lieferung geprüft und abgenommen ist. Regeln aus `docs/art/grok_GA_offene_grafik.md`
Abschnitt 0 gelten weiter (Frame für Frame, Nearest Neighbor, Palette, binäres Alpha, Rohbilder, Prüfskript).

## Übergabe (verbindlich)
- **Eine Etappe = ein Zip** (`grok_GB_<etappe>.zip`): Dateien in Repo-Struktur (`public/sprites/...`), Manifest, `raw/`,
  Vorschau-PNG (3-fach, Vorlage | neu nebeneinander), Prüfbericht und eine `CHECK.md` mit abgehakten Prüfpunkten. Kein Push, kein PR.
- **Nach jeder Etappe anhalten.** Die Lieferung wird geprüft, danach kommt Feedback: „abgenommen, weiter mit der nächsten Etappe“
  oder eine Nachbesserungsliste für dieselbe Etappe. Nicht vorarbeiten.

## GB1: Seq-3/1-Trinken, Auren und HUD, Batch `seq31a2`
Spezifikation: **`docs/art/codex_DC1_seq31_gestalten.md`**, Abschnitte **1 (Trinken, 6 Sheets 128x32)** und **4 (Auren und HUD, 21 Sheets)**.
Vorlagen: `characters/A_player_drink_halbgott.png`, `fx/HG_aura_halbgott.png`, `ui/HG_hud.png`.
- ☐ 27 Dateien, Maße exakt laut Spezifikation
- ☐ Trinken je Spielerfigur (Spieler, P2a, P2b) mit derselben Fußlinie wie die Halbgott-Fassung
- ☐ Auren Seq 3 in Pfadfarbe, Seq 1 fast unsichtbar (nur heller Rand, kein Türkis)

## GB2: Köpfe und Sitzpose der Dunscar-Zirkel, Batch `zirkelkoepfe`
Die Figuren der Zirkel Kalter Ofen und Stummes Stellwerk laufen schon mit umgefärbten Lauf-Sheets (`characters/dsz_<id>_walk.png`).
Es fehlen Köpfe 24x24 `portraits/heads/dsz_<id>.png` für ofenmutter, brenner, aschenleserin, loeschmeister, flickerin, stellwerker,
telegrafistin, weichenwaerter, fundsammler, dazu `characters/dsz_flickerin_sit.png`.
Spezifikation: **`docs/art/codex_DV_kalter_ofen_figuren.md`** und **`docs/art/codex_DW_stellwerk_figuren.md`** (nur Köpfe und Sitzpose).
- ☐ 9 Köpfe + 1 Sitzpose, Stil wie `portraits/heads/wx_pfandleiherin.png`
- ☐ Haar, Hut und Kleidungsfarbe passen zum vorhandenen Lauf-Sheet derselben Figur

## Später (erst mit Kapitel 6)
`docs/art/codex_DC2_seq31_orte.md` und die Varrowmouth-Pakete CT–DB.
