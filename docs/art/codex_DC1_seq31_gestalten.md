# Codex-Paket DC1: Sequenz 3 und 1 als Grafik, Teil 1: Trinken, Aufstieg, Endgestalten, Auren

**Batch-Name:** `seq31a` (Manifest: `public/sprites/manifest-seq31a.json`) · **Ersetzt zusammen mit DC2 das zu große Paket DC.**

Paket CO deckt Sequenz 4 (Halbgott) und 2 (Engel) ab. Es fehlen die Bilder für **Sequenz 3** (die Steigerung dazwischen) und **Sequenz 1** (die letzte Stufe, Finale in Varrowmouth, Paket DD liefert die Texte). **Dieses Paket liefert nur die Spieler- und Gestaltbilder**: die Trink-Sheets, die zwei Aufstiegs-Vollbilder, die zehn stillen Endgestalten (Karte und Kampf), die zwanzig Auren und die HUD-Marken. Ritualorte „Letztes Register“, Sequenzbilder und Abspann-Karten macht das getrennte Paket DC2 (darf parallel laufen). Zehn Pfade, feste IDs und Formen aus der Tabelle unten (gleiche wie CO). Halte das Paket klein: keine Varianten, die nicht unten stehen.

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

## 1. Trinken (6 Sheets, je 8 Frames 16x32 = 128x32)
`characters/A_player_drink_seq3.png`, `characters/A_player_drink_seq1.png`, dazu dieselben zwei Sheets für die Koop-Figuren `p2a` und `p2b` (`characters/p2a_drink_seq3.png`, `p2a_drink_seq1.png`, `p2b_drink_seq3.png`, `p2b_drink_seq1.png`; Figuren-Referenz `characters/p2a_walk.png`, `characters/p2b_walk.png`).
Seq 3: wie das Seq-4-Trinken aus CO (`characters/A_player_drink_halbgott.png`, Koop: `p2a_drink_halbgott.png`, `p2b_drink_halbgott.png`), aber beherrscht, nur ein kurzes Flackern der Kreaturform im letzten Frame. Seq 1: der Spieler trinkt, setzt ab, die Flasche wird durchsichtig, das Licht kommt von innen (zwei letzte Frames fast weiß-grau, nicht reinweiß).

## 2. Aufstiegs-Vollbilder (`fx/HG_aufstieg_3.png`, `fx/HG_aufstieg_1.png`, je 8 Frames 240x135 opak, in einer Reihe = 1920x135)
Seq 3: wie `fx/HG_aufstieg_4.png` aus CO, kürzer, ohne Furcht-Welle. Seq 1: Bild aus der Sicht des Spielers: ein Zollregister-Raum (nasser Stein, Register-Regale, Wasserlinie; die genauen Räume macht DC2) wird hell, Zeugen stehen am Rand, kein Effekt-Feuerwerk, am Ende ein leerer, heller Raum.

## 3. Endgestalten (20 Sheets)
- Karte: `characters/hg_form_<pfad>_still.png`, 32x48 je Frame, 4 Richtungen (unten, links, rechts, oben) x 2 Frames = 128x192, Grundlinie y=46.
- Kampf: `battle/hg_form_<pfad>_still.png`, 96x96 je Zelle, 6 Spalten, Reihen idle, special, hurt, defeated (6 Spalten x 4 Reihen = 576x384).
Die Kreaturformen aus CO in ihrer fertigen, ruhigen Fassung (Tabelle). Special ist keine Attacke, sondern das „Schließen“: die Gestalt wird für zwei Frames ganz schlicht (ein Mensch), danach wieder die Gestalt. Hurt und defeated sind dieselben Frames wie idle mit kleinerer Haltung: Sequenz 1 wird nicht wirklich verletzt.

## 4. Auren und HUD (21 Sheets)
- `fx/aura_seq3_<pfad>.png`: 6 Frames 64x64 in einer Reihe (384x64), Pfadfarbe wie `fx/HG_aura_halbgott.png` und `fx/aura_pfade.png` aus CO, ruhiger Puls.
- `fx/aura_seq1_<pfad>.png`: 4 Frames 64x64 (256x64), fast unsichtbar: nur ein heller Rand, kein Türkis.
- `ui/hg_hud_seq31.png` (64x32): zwei Stufen-Marken 32x32 nebeneinander (links Seq 3, rechts Seq 1), Stil wie `ui/HG_hud.png` aus CO.

## 5. Abgabe
47 PNGs (6 Trinken, 2 Aufstieg, 20 Endgestalten, 20 Auren, 1 HUD), Manifest (Frame-Listen, Richtungen, Zuordnung Pfad → Sheets), `tools/art/seq31a/check.py`, `docs/art/batch-seq31a-validation.json`, `docs/art/batch-seq31a-preview.png`, README-Ergänzung, Pull Request nur mit deinen Dateien. Wenn der Upload scheitert: erst Abschnitt 1 bis 3, dann Abschnitt 4 als zweiten PR.
