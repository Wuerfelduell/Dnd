# Codex-Paket DF: Tiergefährten (Rabe, Kater, Hund, Ratte: Grafik, Verhalten, Texte)

**Batch-Name:** `tiere` (Manifest: `public/sprites/manifest-tiere.json`) **und** Texte nach `docs/story/tiergefaehrten/`

Neu: Der Spieler kann **ein Tier** mitnehmen, das ihm auf der Karte folgt, kleine Dinge findet, vor Gefahr warnt und im Kampf einmal je Kampf eingreift. Vier Tiere, jedes kommt in einer anderen Stadt zu ihm und hat eine kleine eigene Geschichte. Kein Kampfbegleiter mit eigener Lebensleiste: Das Tier ist nie in Gefahr, es ist Hilfe und Gesellschaft. Koop: jeder Spieler kann ein eigenes Tier haben, nie dasselbe.

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

## Eckdaten (feste IDs)
| ID | Tier | Stadt, Herkunft | Gabe auf der Karte | Eingriff im Kampf (1x je Kampf) |
|---|---|---|---|---|
| `tier_rabe` | Rabe „Kessel“ | Kettlegate, sitzt auf der Sternwarte, folgt nach einem Fund | zeigt versteckte Hinweise in 3 Tiles Umkreis (Krächzen + Marker) | lenkt einen Gegner ab: ein Zug fällt aus |
| `tier_kater` | Kater „Rußfleck“ | Wexmoor, Salzmarkt, bei Maud Keel | findet Grundvorräte am Tagesanfang (1 Stück) | Nerven des Spielers um einen kleinen Wert zurück |
| `tier_hund` | Hündin „Pegel“ | Dunscar, Bahnhof, Hund eines verschwundenen Schaffners | warnt vor Hinterhalten auf Reisen (Reisefallen sichtbar) | ein Treffer auf den Spieler wird halbiert |
| `tier_ratte` | Ratte „Siebzehn“ | Calderwick, Terrassen, aus dem Rattenkönig-Erbe | öffnet eine verschlossene Kiste je Tag | stiehlt einem Gegner einen Gegenstand (Beute) |
Der Spieler hat höchstens ein Tier dabei; die anderen warten im Büro (Paket DG baut später das Haus). Wechsel nur dort. Beziehung zum Tier: Stufen 0 bis 3 über Füttern (bestehende Nahrungs-Items), je Stufe eine kleine Verbesserung. Flags `tier_<id>_gefunden`, `tier_aktiv`, `tier_<id>_stufe`.

## 1. Grafik
- Je Tier Karten-Sheet `characters/<id>.png` (16x16-Zellen, 4 Richtungen x 4 Frames = 64x64; Rabe zusätzlich 4 Frames Flug in einer fünften Reihe), Sitzen/Ruhen (2 Frames), Gabe-Pose (4 Frames: Rabe Krächzen, Kater schnuppern, Hund bellen, Ratte nagen), Freude beim Füttern (3).
- Kampf-Eingriff `battle/<id>_eingriff.png` (48x48-Zellen x 6 Frames): das Tier huscht ins Bild und wieder hinaus.
- Portraits 32x32 (`portraits/tiere/<id>.png`) mit drei Stimmungen (neutral, aufmerksam, zufrieden) = 96x32.
- `ui/tiere_symbole.png` (16x16-Streifen: 4 Tiere, Füttern, Gabe bereit, Gabe verbraucht, warten im Büro, Stufe 1 bis 3), `fx/tier_marker.png` (16x16 x 4, Hinweis-Marker des Raben, türkis gedämpft), `fx/tier_herz.png` (nein: kein Herz. Stattdessen `fx/tier_zufrieden.png`, 16x16 x 4, kleiner Dampf- oder Staubwirbel).
- Büro-Prop `props/tiere_plaetze.png` (64x32: Stange, Kissen, Decke, Kiste als Warteplätze, je leer und besetzt).

## 2. Texte (`docs/story/tiergefaehrten/`)
- `tiere.json`: je Tier Name, Beschreibung (3 Sätze), Fund-Szene (8 bis 12 Zeilen mit einem Entscheidungsknoten), Fütter-Reaktionen (je Stufe 2), Gabe-Meldungen (4), Kampf-Eingriff-Meldungen (4), Wechsel-Zeilen im Büro (3), Koop (je Tier 2 Zeilen, wenn beide Spieler ein Tier haben).
- `beziehung.json`: Stufen 0 bis 3, Futter-Items je Tier (bestehende IDs, 3 gern, 1 ungern), Verbesserungen je Stufe als Vorschlag (Umkreis +1, zweite Gabe, Eingriff zweimal).
- `reaktionen.json`: 30 Zeilen Stadtgerede über den Spieler mit Tier (je Stadt 5), 10 Zeilen von Figuren mit festen Meinungen (Maud Keel freut sich über den Kater, ein Zollgeist in Varrowmouth kann die Ratte nicht eintragen).
- `zeitung.json` (4), `lesestuecke.json` (4: je Tier eine Geschichte seines früheren Besitzers, 100 bis 150 Wörter).
- README: Verhalten auf der Karte (Folgen mit 1 Tile Abstand, Teleport bei Kartenwechsel, nie in Kämpfe gezogen, in Gefahrengebieten versteckt sich das Tier und die Gabe pausiert), Spezifikation der vier Gaben mit Werten, Eingriff im Kampf als Knopf neben den Fähigkeiten.

## 3. Abgabe
Grafik mit Manifest, `tools/art/tiere/check.py`, Validation, Preview; Texte mit `README.md`, `pruefen.mjs`; Pull Request mit Prüf-Ausgaben.
