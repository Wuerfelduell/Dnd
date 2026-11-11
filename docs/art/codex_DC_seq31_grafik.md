# Codex-Paket DC: Sequenz 3 und Sequenz 1 als Grafik (Trinken, Letzte Register, Endgestalten, Abspannbilder)

**Batch-Name:** `seq31` (Manifest: `public/sprites/manifest-seq31.json`)

Paket CO deckt Sequenz 4 (Halbgott) und 2 (Engel) ab. Es fehlen die Bilder für **Sequenz 3** (die Steigerung dazwischen) und **Sequenz 1** (die letzte Stufe, Finale des Spiels in Varrowmouth, Paket DD liefert die Texte). Du zeichnest die Trink-Bilder, die zehn Ritualorte „Letztes Register“, die zehn Endgestalten (die Kreaturform aus CO in ihrer stillen, fertigen Fassung), Auren, Sequenzbilder und die Abspann-Karten je Pfad. Zehn Pfade, feste IDs und Formen aus der Tabelle unten (gleiche wie CO).

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

## Eckdaten Sequenz 3 und 1
| `pfad` | Seq 3 | Seq 1 | Endgestalt (aus Kreaturform `hg_form_<pfad>`) |
|---|---|---|---|
| `laterne` | Aschenprotokollant | Das unbequeme Licht | Leuchtgestalt, jetzt ruhig: Flamme ohne Flackern, Glas klar |
| `faden` | Bruchhefter | Der offene Zusammenhang | Nahtgespinst mit offenen, gelösten Fäden |
| `maske` | Rollenverwahrer | Das unvermietete Gesicht | Hundertmiene mit einem einzigen, eigenen Gesicht vorn |
| `echo` | Nachrufgefäß | Die letzte Zuhörstelle | Hohlklang, Kehlen still, die Luft steht |
| `kessel` | Kreislaufgefäß | (Name aus `src/data/packs/sequenzen/seq_4_bis_1.json`, Seq 1 kessel) | Siedeleib, Flüssigkeiten klar, kein Dampf |
| `eisen` | Gegenlast | (ebd., Seq 1 eisen) | Nietkoloss, der eine Brücke trägt statt sie zu sein |
| `schluessel` | Riegelabwesenheit | (ebd., Seq 1 schluessel) | Türhüter, die Tür in der Brust weit offen, warmes Licht |
| `sq_waage` | Saldenhüter | (ebd., Seq 1 sq_waage) | Gewichtsträger, Waagarme im Gleichgewicht, Ketten locker |
| `sq_moor` | Namensediment | (ebd., Seq 1 sq_moor) | Torfleib, Namen in den Schichten lesbar hell |
| `sq_uhr` | Fristlauscher | (ebd., Seq 1 sq_uhr) | Pendelgestalt, beide Umrisse decken sich |
Namen in Klammern: lies die Datei, erfinde nichts. Seq 1 ist **kein** weiterer Kampfsprung, sondern Abschluss: Die Bilder sind still, hell, aufgeräumt; kein Türkis-Gewitter.

## 1. Trinken (`characters/A_player_drink_seq3.png`, `_seq1.png`, p2a/p2b je ebenso; 8 Frames 16x32 = 128x32)
Seq 3: wie das Seq-4-Trinken aus CO, aber beherrscht, nur ein kurzes Flackern der Kreaturform im letzten Frame. Seq 1: der Spieler trinkt, setzt ab, die Flasche wird durchsichtig, das Licht kommt von innen (zwei letzte Frames fast weiß-grau, nicht reinweiß).

## 2. Aufstiegs-Vollbilder (`fx/HG_aufstieg_3.png`, `fx/HG_aufstieg_1.png`, 240x135 x 8 Frames)
Seq 3: wie CO, kürzer, ohne Furcht-Welle. Seq 1: Bild aus der Sicht des Spielers: der Ritualort „Letztes Register“ (Abschnitt 3) wird hell, Zeugen stehen am Rand, kein Effekt-Feuerwerk, am Ende ein leerer, heller Raum.

## 3. Zehn Ritualorte „Letztes Register“ (`battle/bg_vm_register_<pfad>.png`, 480x270 opak; `tilesets/vm_register.png`, 256x256; `props/vm_register_props.png`, 256x128)
Jeder Pfad hat im Finale einen eigenen kleinen Ritualort in Varrowmouth (Karten `vm_register_<pfad>`, 24x16 Tiles, Paket DD beschreibt sie): ein Zollregister-Raum, der sich dem Pfad angepasst hat. Laterne: Lampenkammer mit zehn Lampen; Faden: Netzboden über Wasser; Maske: Garderobe mit leeren Masken; Echo: Glockenraum ohne Klöppel; Kessel: Siedeküche mit klaren Kesseln; Eisen: Brückenlager unter der Straße; Schlüssel: Türenflur mit offenen Türen; Waage: Zollwaage-Halle; Moor: Torfkammer im Keller; Uhr: Pegeluhr-Werk. Ein gemeinsames Tileset (nasser Stein, Register-Regale, Wasserlinie) plus Props je Pfad (je 4 bis 6) und je Pfad ein Kampf-Hintergrund für die Probe.

## 4. Endgestalten (`characters/hg_form_<pfad>_still.png`, 32x48 je Frame, 4 Richtungen x 2 Frames = 128x192; `battle/hg_form_<pfad>_still.png`, 96x96, Reihen idle, special, hurt, defeated)
Die Kreaturformen aus CO in ihrer fertigen, ruhigen Fassung (Tabelle). Special ist keine Attacke, sondern das „Schließen“: die Gestalt wird für zwei Frames ganz schlicht (ein Mensch). Hurt und defeated sind dieselben Frames wie idle mit kleinerer Haltung: Sequenz 1 wird nicht wirklich verletzt.

## 5. Auren und Sequenzbilder
- `fx/aura_seq3_<pfad>.png` (64x64 x 6) und `fx/aura_seq1_<pfad>.png` (64x64 x 4, fast unsichtbar: ein heller Rand): 20 Sheets.
- `ui/hg_seq3_<pfad>.png`, `ui/hg_seq1_<pfad>.png` (240x135 opak): 20 Sequenzbilder wie `ui/hg_seq4_*` in CO (Pfadkarte, Stufe als Bild ohne Text).
- `ui/hg_hud_seq31.png` (64x32): zwei Stufen-Marken.

## 6. Abspann-Karten je Pfad (`sequences/abspann_<pfad>.png`, 240x135 opak, 10 Bilder) und Verzicht (`sequences/abspann_verzicht.png`)
Je Pfad ein Bild, was der Spieler als Sequenz 1 für die Welt tut (Laterne: eine Stadt, in der jedes Fenster ehrlich beleuchtet ist; Waage: eine Waage ohne Pfand; Uhr: eine Uhr, die weiter geht). Verzicht: der Spieler als Mensch auf dem Steg bei Ebbe, die Flasche im Wasser.

## 7. Abgabe
PNGs, Manifest (Frame-Listen, Regionen, Zuordnung Pfad → Ritualort-Hintergrund), `tools/art/seq31/check.py`, Validation, Preview, README-Ergänzung, Pull Request.
