# Codex-Batch V: Kapitel 2, Ausbau der Akte

**Batch-Name:** `wexmoor4` (Manifest: `public/sprites/manifest-wexmoor4.json`)

Die fünf Akte von Kapitel 2 haben neue Spuren, Nebenaufträge und Begegnungen bekommen. Dafür fehlen noch drei Dinge: eine neue Figur (Elsbeth Rowe), das Innere des Gasthauses „Zur Ertrunkenen Glocke“ am Salzmarkt und ein Kampf-Sheet für Constable Price, der in Akt III mit einem Haftbefehl aus Kettlegate nach Wexmoor kommt.

**Schon fertig, nicht neu machen:** Price' Lauf-Sheet `12_constable_price_walk.png` und seine Portraits `C_price_emotions.png` / `C_price_police_emotions.png` (werden in Wexmoor wiederverwendet), alle Wexmoor-Orte aus Batch R, alle Monster und Einzelgänger aus Batch S, die Zirkelmitglieder aus Batch T.

**Hinweis Setting:** Wexmoor ist eine versinkende Moorstadt an der Küste: Torf, Reet, Schlick, Salz, Bojen, Nebel, schiefe Holzhäuser auf Pfählen. Wo der Style-Block „Kettlegate“ sagt, gilt für diese Datei die Moorstadt Wexmoor mit derselben Stimmung.

## 0. Gemeinsame Regeln für diese Datei (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**: Style-Block, Maße, Ablage und Nachbearbeitung stehen hier, du brauchst keine andere Prompt-Datei. Alles, was schon im Repo liegt, ist hier **nicht** mehr enthalten.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial city called Kettlegate with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Maße
| Was | Größe |
|---|---|
| Tile | 16x16 |
| Figur auf der Karte | 16x32 pro Frame; Lauf-Sheet 4 Reihen (unten, links, rechts, oben) x 4 Frames = 64x128 |
| Portrait | 64x64; Emotions-Sheet 4 nebeneinander = 256x64 (neutral, misstrauisch, erschrocken, leichtes Lächeln) |
| Kampf-Figur (Mensch) | 48x48 pro Frame, Blick nach links (Gegner) bzw. rechts (Spieler) |
| Kampf-Gegner (übernatürlich) | 64x64 pro Frame |
| Kampf-Hintergrund | 480x270, deckend, untere 70 px flacher Bodenstreifen |
| Effekte | 32x32 oder 48x48 pro Frame, Frames in einer Reihe |
| Item-Icon | 16x16 (zusätzlich 32x32, wo angegeben) |
| UI | 9-slice auf 16er-Raster, Icons 16x16 |

Kampf-Sheets: **6 Spalten**, eine Animation pro Reihe, kürzere Reihen mit transparenten Feldern auffüllen, gleiche Grundlinie in allen Frames. Gegner-Angriffe halten die Ausholpose **2 Frames** lang (Timing-Signal für Ausweichen/Parieren).

### 0.3 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Ordner und Dateinamen stehen bei jedem Asset. Die Namen entsprechen den IDs im Spielcode, bitte genau so übernehmen.
- Pro Datei ein Manifest `public/sprites/manifest-<batch>.json` (Batch-Name steht oben in der Datei) mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat.

### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."


---

## 1. Elsbeth Rowe (neue Figur)
Elsbeth Rowe ist die verschwundene Näherin aus Kettlegate, die in Zimmer 3 der Glocke wohnte. Der Spieler findet sie im Torfstich, bis zu den Knien im Schlamm, ihren eigenen Namen vergessen (Nebenauftrag „Zimmer 3“). Erst wenn er ihn ausspricht, löst sie sich. Palette im Spiel (`src/data/wexmoor.json` → `npcs.elsbeth`): Mantel #6a5a4a, Hut #3a3028, Haut #c8b8a8, Haar #8a6a4a, Schal #a08070.

`[BESCHREIBUNG]`: a dazed seamstress in her thirties in a worn umber-brown travelling coat over a dress greyed with peat dust, a dusty-rose wool scarf, a small dark brown hat with a pin, light brown hair coming loose from a low knot, a pincushion on her wrist, mud up to her knees, distant red-rimmed eyes

Lauf-Sheet:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, same proportions as the existing characters.
```
Portrait:
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): dazed and empty (staring, name forgotten), worried, shocked, crying with relief. Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
Kopf für das Notizbuch: 24x24, Ausschnitt aus dem neutralen Portrait.

Ablage: `public/sprites/characters/V_elsbeth_walk.png`, `public/sprites/portraits/V_elsbeth_emotions.png`, `public/sprites/ui/heads/elsbeth.png`.

## 2. Gasthaus „Zur Ertrunkenen Glocke“ (Innenraum, Karte `wx_glocke`)
Gaststube mit Tresen, Gästebuch und Treppe zu den Zimmern. Wirt Hesper führt hier ein Gästebuch, in dem die Fremden vom Nachtzug stehen. Raum ca. 20x10 Tiles.

Tileset:
```
[STYLE BLOCK]
Tileset for a damp coastal marsh-town inn interior, 16x16 px tiles in a grid, 8 columns: warped dark plank floor with salt stains (4 variants, one with a puddle), wet stone wall base and tarred plank wall (top, middle, bottom, corners), a low beamed ceiling edge with hanging fishing net, a small round porthole-style window with fog behind (2 frames), a doorway with a peat-brown curtain, stairs going up (2x2 tiles), worn rush mat. No outline on terrain.
```
Props:
```
[STYLE BLOCK]
Props for the same inn, transparent background, 1px dark outline: a long bar counter with tap and stacked mugs (64x32), a cracked bronze ship bell hanging from a beam above the counter, half green with verdigris (32x32), a heavy guest book on a lectern with an inkwell and quill (16x32, plus a second frame with the book opened), round tables with stools (32x32, 2 variants), a peat stove with a glowing ember (32x32, 3 frames), barrels of salted fish (16x32), a key board with numbered hooks, one hook empty (32x16, no readable numbers), a notice board with pinned papers (32x32), a dripping bucket under a leak (16x16, 3 frames).
```
Ablage: `public/sprites/tilesets/V_01_glocke_tiles.png`, `public/sprites/props/V_glocke_props.png`.

## 3. Constable Price, Kampf-Sheet (`price_wx_fight`)
Wer Price in Akt III nicht überzeugt, muss gegen ihn kämpfen. Im Spiel steht dafür bisher Sergeant Holts Sheet. Price soll zu seinem vorhandenen Lauf-Sheet passen: dunkelblauer Polizeimantel (#2c3550), Helm (#1f2538), braunes Haar, ein Haftbefehl in der Manteltasche.
```
[STYLE BLOCK]
Battle sprite sheet, 48x48 px per frame, 6 columns, facing left (enemy side): a young Victorian constable in a dark navy police greatcoat and helmet, brown hair, a folded warrant sticking out of his coat pocket, a wooden truncheon and a bull's-eye lantern, determined but uneasy face. Rows: 1) idle (4 frames, slight breathing), 2) truncheon strike (6 frames, wind-up held 2 frames), 3) lantern flash: raises the lantern and blinds (6 frames, wind-up held 2 frames), 4) whistle call (4 frames), 5) hit (2 frames), 6) defeated: kneels, drops the truncheon (4 frames). Transparent background, same baseline in all frames.
```
Ablage: `public/sprites/battle/enemy_price.png`.

## 4. Kontrolle vor dem Abgeben
- 1 Lauf-Sheet, 1 Portrait-Sheet und 1 Kopf für Elsbeth, Farben passend zur Palette oben.
- 1 Tileset und 1 Props-Sheet für die Glocke, Glocke über dem Tresen gut erkennbar.
- 1 Kampf-Sheet für Price, wiedererkennbar als derselbe Mann wie in `12_constable_price_walk.png`.
- Manifest `manifest-wexmoor4.json`, Prompts in `docs/art/batch-wexmoor4-generation.json`, Kurzeintrag in `docs/art/README.md`.
