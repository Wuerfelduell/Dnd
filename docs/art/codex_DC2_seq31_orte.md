# Codex-Paket DC2: Sequenz 3 und 1 als Grafik, Teil 2: Letzte Register, Sequenzbilder, Abspann-Karten

**Batch-Name:** `seq31b` (Manifest: `public/sprites/manifest-seq31b.json`) · **Ersetzt zusammen mit DC1 das zu große Paket DC.**

Paket CO deckt Sequenz 4 (Halbgott) und 2 (Engel) ab, DC1 liefert Trinken, Aufstieg, Endgestalten und Auren für Sequenz 3 und 1 (darf parallel laufen). **Dieses Paket liefert nur die Orte und Bilder**: die zehn Ritualorte „Letztes Register“ (Tileset, Props, Kampf-Hintergründe), die zwanzig Sequenzbilder und die elf Abspann-Karten. Texte und Karten-Daten kommen aus Paket DD. Zehn Pfade, feste IDs aus der Tabelle unten (gleiche wie CO). Halte das Paket klein: keine Varianten, die nicht unten stehen.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat. Halte das Paket klein: keine optionalen Extras, keine Varianten, die nicht unten stehen.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial world with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, genau mit den Namen unten.
- Manifest `public/sprites/manifest-<batch>.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-<batch>-preview.png`.
- Prüfskript (Pillow) unter `tools/art/<batch>/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-<batch>-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

## Eckdaten Sequenz 3 und 1 (gleich in DC1 und DC2)
| `pfad` | Seq 3 | Seq 1 | Endgestalt (aus Kreaturform `hg_form_<pfad>`, Paket CO) |
|---|---|---|---|
| `laterne` | Aschenprotokollant | Das unbequeme Licht | Leuchtgestalt, jetzt ruhig: Flamme ohne Flackern, Glas klar |
| `faden` | Bruchhefter | Der offene Zusammenhang | Nahtgespinst mit offenen, gelösten Fäden |
| `maske` | Rollenverwahrer | Das unvermietete Gesicht | Hundertmiene mit einem einzigen, eigenen Gesicht vorn |
| `echo` | Nachrufgefäß | Die letzte Zuhörstelle | Hohlklang, Kehlen still, die Luft steht |
| `kessel` | Kreislaufgefäß | Der unverlorene Rest | Siedeleib, Flüssigkeiten klar, kein Dampf |
| `eisen` | Gegenlast | Die bleibende Stütze | Nietkoloss, der eine Brücke trägt statt sie zu sein |
| `schluessel` | Riegelabwesenheit | Die unverwehrte Tür | Türhüter, die Tür in der Brust weit offen, warmes Licht |
| `sq_waage` | Saldenhüter | Die quittierte Last | Gewichtsträger, Waagarme im Gleichgewicht, Ketten locker |
| `sq_moor` | Namensediment | Das erinnerte Fehlende | Torfleib, Namen in den Schichten lesbar hell |
| `sq_uhr` | Fristlauscher | Die gewährte Minute | Pendelgestalt, beide Umrisse decken sich |

Die Namen stehen in `src/data/packs/sequenzen/seq_4_bis_1.json` und `neue_pfade.json`; erfinde nichts dazu. Seq 1 ist **kein** weiterer Kampfsprung, sondern Abschluss: Die Bilder sind still, hell, aufgeräumt; kein Türkis-Gewitter. Als Form-Referenz dienen die CO-Lieferungen `public/sprites/characters/hg_form_<pfad>.png` und `battle/hg_form_<pfad>.png` (Manifest `manifest-halbgott.json`): gleiche Silhouette, gleiche Palette, nur ruhiger.

## 1. Zehn Ritualorte „Letztes Register“
Jeder Pfad hat im Finale einen eigenen kleinen Ritualort in Varrowmouth (Karten `vm_register_<pfad>`, 24x16 Tiles, Paket DD beschreibt sie): ein Zollregister-Raum, der sich dem Pfad angepasst hat.
| `pfad` | Raum |
|---|---|
| `laterne` | Lampenkammer mit zehn Lampen |
| `faden` | Netzboden über Wasser |
| `maske` | Garderobe mit leeren Masken |
| `echo` | Glockenraum ohne Klöppel |
| `kessel` | Siedeküche mit klaren Kesseln |
| `eisen` | Brückenlager unter der Straße |
| `schluessel` | Türenflur mit offenen Türen |
| `sq_waage` | Zollwaage-Halle |
| `sq_moor` | Torfkammer im Keller |
| `sq_uhr` | Pegeluhr-Werk |

- Gemeinsames Tileset `tilesets/vm_register.png` (256x256, 16x16, 16 Spalten): nasser Stein (Boden, Wand, Sockel, Ecken), Register-Regale (leer, voll, Ende), Wasserlinie am Boden (2 Frames), Tür, Fensterschlitz, Treppe, Lichtfleck hell (für Seq 1, 2 Frames). Zellenliste im Manifest.
- Props `props/vm_register_props.png` (256x128, 16x16-Raster, Mehrzellen-Props erlaubt): je Pfad 4 bis 6 Props in einer eigenen Zeile (zehn Zeilen à 16 Zellen reichen nicht: nutze Zeilen zu je zwei Pfaden und benenne Regionen `vmr_<pfad>_<n>` im Manifest). Beispiele: Laterne Lampen auf Haken; Faden Netzpflöcke; Maske Masken an Bügeln; Echo Glocke ohne Klöppel; Kessel klare Glaskessel; Eisen Brückenstreben; Schlüssel offene Türblätter; Waage Zollwaage und Gewichte; Moor Torfballen mit hellen Linien; Uhr Pegelzeiger und Pendel.
- Kampf-Hintergründe `battle/bg_vm_register_<pfad>.png` (10 Stück, 480x270 opak): derselbe Raum als Kulisse für die Zeugen-Probe, hell und still, Zeugen nur als Schemen am Rand.

## 2. Sequenzbilder (20 Stück, `ui/hg_seq3_<pfad>.png`, `ui/hg_seq1_<pfad>.png`, 240x135 opak)
Wie `ui/hg_seq2_<pfad>.png` aus CO: Pfadkarte, die Stufe als Bild ohne Text. Seq 3: die Gestalt aus der Tabelle, noch mit Spannung (Pfadfarbe, ein Rest Türkis). Seq 1: dieselbe Gestalt still, hell, im Register-Raum aus Abschnitt 1.

## 3. Abspann-Karten (11 Stück, `sequences/abspann_<pfad>.png` und `sequences/abspann_verzicht.png`, 240x135 opak)
Je Pfad ein Bild, was der Spieler als Sequenz 1 für die Welt tut: Laterne eine Stadt, in der jedes Fenster ehrlich beleuchtet ist; Faden ein Netz, das Häuser verbindet statt fesselt; Maske ein Platz voller Gesichter, keines verdeckt; Echo ein stilles Zimmer, in dem jemand zuhört; Kessel ein klarer Kanal; Eisen eine Brücke, die steht; Schlüssel eine Stadt mit offenen Türen bei Tag; Waage eine Waage ohne Pfand; Moor ein Torffeld, in dem Namen hell liegen; Uhr eine Uhr, die weiter geht. Verzicht: der Spieler als Mensch auf dem Steg bei Ebbe, die Flasche im Wasser.

## 4. Abgabe
42 PNGs (1 Tileset, 1 Props, 10 Hintergründe, 20 Sequenzbilder, 11 Abspann), Manifest (Zellenliste, Regionen `vmr_<pfad>_<n>`, Zuordnung Pfad → Hintergrund, Sequenzbild, Abspann), `tools/art/seq31b/check.py`, `docs/art/batch-seq31b-validation.json`, `docs/art/batch-seq31b-preview.png`, README-Ergänzung, Pull Request nur mit deinen Dateien. Wenn der Upload scheitert: erst Abschnitt 1, dann Abschnitt 2 und 3 als zweiten PR.
