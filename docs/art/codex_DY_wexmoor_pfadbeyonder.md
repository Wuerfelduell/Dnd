# Codex-Paket DY: Wexmoorer Pfad-Beyonder Wenna Kolk, Corvin Hake und Maud Keel im Kampf

**Batch-Name:** `pfadbeyonder` (Manifest: `public/sprites/manifest-pfadbeyonder.json`)

In Wexmoor handeln drei Pfad-Beyonder (PR #344, `src/data/pfadHandel.js`, nur lesen) noch mit Platzhaltern: Torfmutter **Wenna Kolk** (Moor-Pfad) und Schleusenuhrmacher **Corvin Hake** (Uhr-Pfad) laufen als Umfärbungen und kämpfen mit geliehenen Dunscar-Blättern; Pfandleiherin **Maud Keel** (Waage-Pfad, Salzmarkt) hat schon Lauf-Sheet und Kopf, kämpft aber mit dem Blatt der Walzenstimme.

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
- Manifest `public/sprites/manifest-pfadbeyonder.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-pfadbeyonder-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-pfadbeyonder-preview.png`.
- Prüfskript (Pillow) unter `tools/art/pfadbeyonder/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-pfadbeyonder-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

**Stil-Referenz:** Wexmoor-Look (Moor, Salz, Schlick, Torf, Schleusen): `characters/wx_pfandleiherin_walk.png`, `portraits/heads/wx_pfandleiherin.png`; Kampf wie `battle/enemy_ez_ds_kalkbrennerin.png` (288x240: 6 Spalten x 48, Reihen idle, attack1, attack2, hurt, defeated).

## 1. Figuren (2 IDs, fest, Code existiert)
`characters/ph_<id>_walk.png` (64x128, 4x4, Grundlinie y=30, überschreiben) **und** `portraits/heads/<id>.png` (24x24).
| ID | Name | Aussehen |
|---|---|---|
| `ez_torfmutter` | Wenna Kolk, Torfmutter (Moor) | breite alte Frau, torfbraune Schichten, Moosflecken, Torfspaten als Stock, Haar voller Halme |
| `ez_schleusenuhr` | Corvin Hake, Schleusenuhrmacher (Uhr) | dünn, Lupenbrille, Weste voller Zahnräder, großer Schleusenschlüssel am Gürtel |

## 2. Kampfblätter (3 Dateien)
288x240 wie Vorlage. Jede Figur kämpft mit ihrem Pfad-Motiv; okkulte Effekte nur türkis/violett.
| Datei | Figur | attack1 / attack2 |
|---|---|---|
| `battle/enemy_ez_torfmutter.png` | Wenna Kolk | Spatenhieb / Torfranken greifen aus dem Boden |
| `battle/enemy_ez_schleusenuhr.png` | Corvin Hake | Schlüsselschlag / Zahnrad-Zeitstoß (Bild kurz doppelt) |
| `battle/enemy_wx_pfandleiherin.png` | Maud Keel (Vorlage ihr Lauf-Sheet) | Waagschale als Schild-Stoß / Gewichtsstein wird geworfen |

Ergebnis: 7 PNGs.

## Prüfskript und Abgabe
- `tools/art/pfadbeyonder/check.py` (Pillow): alle unten genannten Dateien vorhanden, Maße exakt, binäres Alpha, höchstens 32 Farben, keine Datei pixelgleich mit dem bisherigen Platzhalter (vorher per `git show HEAD:<pfad>` vergleichen, wo eine Datei ersetzt wird). Bericht `docs/art/batch-pfadbeyonder-validation.json`.
- `docs/art/batch-pfadbeyonder-preview.png`, `docs/art/batch-pfadbeyonder-generation.json`, kurze README-Ergänzung.
- Pull Request nur mit deinen Dateien und der Ausgabe des Prüfskripts. Keinen Spielcode ändern.
