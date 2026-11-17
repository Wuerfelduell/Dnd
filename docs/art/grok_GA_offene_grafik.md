# Grok-Paket GA: offene Grafik, die nicht per Skript geht

Stand 2026-11-17. Alles, was sich aus vorhandenen Codex-Bildern umfärben oder neu kombinieren ließ, ist schon im Spiel
(Item-Varianten, Kasten-Figuren, menschliche Gegner, siehe `tools/art/varianten/`). Übrig sind **neue Kreaturen und
Gestalten**, die es so noch nicht gibt. Dieses Paket ist für Grok. Arbeite die Teile in der Reihenfolge ab, jeder Teil ist
einzeln abgebbar (eigener Pull Request oder eigenes Zip).

## 0. Regeln für Grok (zuerst lesen, gilt für alle Teile)

1. **Spezifikation:** Wo ein Teil auf eine Codex-Datei in `docs/art/` verweist, gilt diese Datei vollständig (Style-Block,
   Formate, Dateinamen, Manifest, Prüfskript). Dort steht „Codex“, gemeint bist jetzt du. **Keinen Spielcode ändern.**
2. **Frame für Frame, nicht als Gesamtbild.** Erzeuge jede Pose als eigenes Motiv und setze das Sheet per Skript zusammen.
   Kein ganzes Sheet als ein Bild generieren und dann herunterrechnen (Lektion aus Paket CI: matschige Zellen, falsche Inhalte).
3. **Zielraster scharf:** Wenn größer gerendert wird, nur ganzzahlig mit Nearest Neighbor verkleinern (ein Motivpixel = ein Block).
   Danach auf die Spielpalette indizieren (max. 32 Farben, Referenz `public/sprites/battle/battle_player.png` und die jeweilige Vorlage).
4. **Raster der Vorlage übernehmen:** gleiche Zellgröße, gleiche Spalten- und Reihenzahl, gleiche Reihenfolge der Animationen,
   gleiche Fußlinie wie die genannte Vorlage. Dann greift der Einbau ohne Codeänderung am Raster.
5. **Binäres Alpha**, kein heller oder dunkler Saum, leere Zellen ganz transparent, 1px Umriss `#1a1c2c`.
6. **Rohbilder beilegen** (`docs/art/<batch>-raw/` oder `raw/` im Zip), damit wir nachbessern können.
7. **Prüfen:** `tools/art/<batch>/check.py` (Pillow): Maße, Palette, Alpha, Raster, nicht pixelgleich mit der Vorlage.
   Dazu eine Vorschau `docs/art/batch-<batch>-preview.png` mit allen Frames in 3-facher Größe.

## Teil 1 (wichtigste): Vier Dunscar-Gebietsbosse, Batch `gebietsbosse`

Spezifikation: **`docs/art/codex_DX_dunscar_gebietsbosse.md`** (komplett).
8 PNGs: `battle/enemy_ds_gb_weichenfresser|bruchmeister|schluchtrufer|tiefenvorarbeiter.png` und je `ui/DS_boss_ds_gb_<name>.png` (160x160).
Sie sollen als Verwandte der Story-Bosse lesbar sein (Schwellenhund, Vorhauer, Vielrufer, Unterschicht), aber größer, beschädigter
und mit anderer Silhouette. Im Spiel laufen sie bisher mit dem Sheet des Story-Bosses.

## Teil 2: Wexmoor-Pfadbeyonder Torfmutter und Schleusenuhr, Batch `pfadbeyonder`

Spezifikation: **`docs/art/codex_DY_wexmoor_pfadbeyonder.md`**, aber nur für `ez_torfmutter` und `ez_schleusenuhr`
(Lauf-Sheet 64x128, Kopf 24x24, Kampfblatt 48x48). Maud Keel (`wx_pfandleiherin`) ist per Skript erledigt und **nicht** Teil davon.
Bisher kämpfen beide mit fremden Dunscar-Sheets (Kalkbrennerin, Rangierer).

## Teil 3: Engel und gefallener Engel, Batch `engel`

Neu, keine Codex-Vorlage. Vorlage für Raster und Größe: `battle/hg_grenzwaechter.png` mit seinem Eintrag in `manifest-halbgott.json`
(Zellgröße, Spalten, Reihen und Reihenfolge exakt übernehmen). Im Spiel laufen alle vier bisher als getönter Grenzwächter.

| Datei | Wer | Aussehen |
|---|---|---|
| `battle/enemy_hs_engel_1.png` | Engel des Grats (Seq 2, Himmelsstadt) | hoch und schmal, keine Augen, nur Licht, wo Augen wären; Flügel aus hellen Lichtbahnen, nicht aus Federn; Gewand wie verbranntes Papier |
| `battle/enemy_hs_engel_2.png` | Engel der Schwelle | wie 1, aber die Flügel sind Türrahmen und Schwellen aus Licht; hält einen Schlüsselring |
| `battle/enemy_hs_engel_3.png` | Engel des Thrones | größte Fassung, sechs Lichtbahnen, Krone aus Asche über dem Kopf; das „Wort“ (special) als Lichtsäule |
| `battle/enemy_k4s_wetherby.png` | Oswin Wetherby, gefallener Engel (Kapitel 4, Calderwick) | alter Verwaltungsbeamter im Gehrock, aus dem Rücken brechen zwei verkohlte, gebrochene Lichtflügel; Aktenblätter kreisen um ihn; Gesicht müde, nicht böse |

Palette: Weiß nur als warmes Bein-Weiß `#ebcd8d`/`#bbae95`, Licht in Amber; Okkultes türkis `#6fe0d0` nur sparsam.
Animationen: idle (ruhiges Schweben), attack1 (Flügelschlag), attack2 (Chor/Lichtkette), special (das Wort / Aktensturm), hurt, defeated.

## Teil 4: Seq-3/1-Endgestalten und Aufstiegsbilder, Batch `seq31a`

Spezifikation: **`docs/art/codex_DC1_seq31_gestalten.md`**, nur die Abschnitte **2 (Aufstiegs-Vollbilder)** und **3 (Endgestalten, 20 Sheets)**.
Trinken (Abschnitt 1) sowie Auren und HUD (Abschnitt 4) machen wir per Skript aus den Halbgott-Bildern, die bitte weglassen.

## Teil 5 (später, wenn Zeit bleibt): Heilige der Höfe, Batch `heilige`

Zehn Kampfblätter `battle/enemy_hs_heiliger_<pfad>.png` für `laterne, faden, maske, echo, kessel, eisen, schluessel, sq_waage, sq_moor, sq_uhr`.
Vorlage je Pfad: `battle/hg_battle_<pfad>.png` (Raster und Reihen exakt übernehmen). Die Halbgott-Gestalt eine Stufe weiter:
ruhiger, heller, mit einem Heiligenschein aus dem Pfadsymbol (Laterne, Faden, Maske …), Gewand in der Pfadfarbe.
Bisher laufen sie als gelb getönter Halbgott.

## Nicht in diesem Paket

- `docs/art/codex_DC2_seq31_orte.md` (Varrowmouth-Register, Abspann) und alle Varrowmouth-Pakete CT–DB: erst wenn Kapitel 6 gebaut wird.
- Gegner der zehn Pfadorte (`o3_*`): nutzen absichtlich Monster aus den Gebieten.
