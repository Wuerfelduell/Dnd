# Codex-Paket DX: Vier Dunscar-Gebietsbosse (Kampf + Auftrittsbild)

**Batch-Name:** `gebietsbosse` (Manifest: `public/sprites/manifest-gebietsbosse.json`)

Die vier wiederkehrenden Gebietsbosse der Dunscar-Monstergebiete (PR #383/#389, `DS_GEBIETSBOSSE` in `src/data/buildContent.js`) sind bisher **Klone der Story-Bosse** und benutzen deren Kampf-Sheet und Auftrittsbild. Dieses Paket gibt jedem ein eigenes Aussehen. Sie sollen klar als Verwandte des Story-Bosses lesbar sein, aber in **Farbe und Silhouette** deutlich abweichen (größer, beschädigter, anderer Kopf).

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
- Manifest `public/sprites/manifest-gebietsbosse.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-gebietsbosse-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-gebietsbosse-preview.png`.
- Prüfskript (Pillow) unter `tools/art/gebietsbosse/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-gebietsbosse-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

**Stil-Referenz:** `battle/enemy_schwellenhund.png`, `battle/enemy_vorhauer.png`, `battle/enemy_vielrufer.png`, `battle/enemy_unterschicht.png` und `ui/DS_boss_<base>.png` (160x160) samt `manifest-dunscar3.json`.

## 1. Bosse (4 IDs, fest, Code existiert)
| ID | Name | Vorlage (Raster übernehmen) | Gebiet | Aussehen (aus dem Auftrittstext) |
|---|---|---|---|---|
| `ds_gb_weichenfresser` | Weichenfresser | `enemy_schwellenhund.png` (96er Zellen) | Rangierwüste | hundeartiges Ding, das zu lange Eisen gefressen hat; Weichenzungen als Rippen, Rostmaul, Funken im Rachen |
| `ds_gb_bruchmeister` | Bruchmeister | `enemy_vorhauer.png` (96er Zellen) | Klopfbruch | Riese mit zwei uralten Hämmern, Takt-Schläge, Kalksplitter um ihn |
| `ds_gb_schluchtrufer` | Schluchtrufer | `enemy_vielrufer.png` (96er Zellen) | Rufschlucht | hundert Münder werden zu einem großen, offener Schlund, Schallringe als special |
| `ds_gb_tiefenvorarbeiter` | Tiefenvorarbeiter | `enemy_unterschicht.png` (128x96) | Unterschicht | Vorarbeiter ganz unten, Grubenlampe, Pfeife, Kette mit Schichtmarken, hört nie auf |

Je Boss:
- `battle/enemy_<id>.png`: **gleiches Gesamtmaß, gleiche Zellgröße, gleiche Reihenreihenfolge** wie die Vorlage (6 Spalten; Reihen idle, attack1, attack2, special, hurt, defeated, wo die Vorlage mehr Reihen hat, alle übernehmen). Angriffe halten die Ausholpose zwei Frames.
- `ui/DS_boss_<id>.png`: Auftrittsbild 160x160 wie `ui/DS_boss_schwellenhund.png`.

Ergebnis: 8 PNGs. Im Manifest je ID: Datei, Zellgröße, Reihen, Vorlage.

## Prüfskript und Abgabe
- `tools/art/gebietsbosse/check.py` (Pillow): alle unten genannten Dateien vorhanden, Maße exakt, binäres Alpha, höchstens 32 Farben, keine Datei pixelgleich mit dem bisherigen Platzhalter (vorher per `git show HEAD:<pfad>` vergleichen, wo eine Datei ersetzt wird). Bericht `docs/art/batch-gebietsbosse-validation.json`.
- `docs/art/batch-gebietsbosse-preview.png`, `docs/art/batch-gebietsbosse-generation.json`, kurze README-Ergänzung.
- Pull Request nur mit deinen Dateien und der Ausgabe des Prüfskripts. Keinen Spielcode ändern.
