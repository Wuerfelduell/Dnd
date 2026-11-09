# Codex-Batch X: Neue Artefakte für die geheimen Treffen

**Batch-Name:** `treffenartefakte` (Manifest: `public/sprites/manifest-treffenartefakte.json`)

Auf den geheimen Treffen werden jetzt seltene Artefakte für 300 bis 500 Schilling versteigert. Dafür gibt es 12 neue Artefakte, die im Spiel bisher Kopien vorhandener Icons nutzen. Diese Datei liefert für jedes ein Item-Icon in 16x16 und in 32x32.

**Schon fertig, nicht neu machen:** alle vorhandenen Artefakte aus Batch N und Q, die Zirkelmitglieder (Batch T).

## 0. Gemeinsame Regeln für diese Datei (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**: Style-Block, Maße, Ablage und Nachbearbeitung stehen hier, du brauchst keine andere Prompt-Datei.

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


### 0.5 Besonderheiten dieser Datei (gehen 0.2 bis 0.4 vor)

**Maße:** Item-Icon 16x16, zusätzlich 32x32 (gleiche Form, mehr Detail). Transparenter Hintergrund, 1 px Kontur in #1a1c2c. Artefakte sind okkult: höchstens ein kleiner Akzent in Türkis #6fe0d0 oder tiefem Violett, sonst gedeckte Farben.

**Ablage:**
- `public/sprites/items/<id>.png` (16x16) **ersetzt** die Platzhalter-Kopie mit gleichem Namen.
- `public/sprites/items/32/<id>.png` (32x32).
- Manifest `public/sprites/manifest-treffenartefakte.json` mit allen IDs und beiden Dateien.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-treffenartefakte-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen (32er-Liste in `src/world/assets.js`) passiert separat.

**Nachbearbeitung:**
1. Mit Nearest Neighbor exakt auf 16x16 bzw. 32x32 bringen.
2. Auf die gemeinsame Palette (max. 32 Farben) indizieren.
3. Alpha binarisieren, kein halbtransparenter Rand.
4. Vorhandene Artefakt-Icons aus `public/sprites/items/` (z. B. `zahnkette.png`, `amtskette.png`, `uhr_ertrunkener.png`) als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density and light direction."

---

## 1. Vorlage
```
[STYLE BLOCK]
Single inventory item icon, [SIZE] px, centered, transparent background, readable silhouette at small size, occult artifact: [BESCHREIBUNG].
```
`[SIZE]` einmal `16x16`, einmal `32x32`.

## 2. Die 12 Artefakte
| ID | Name im Spiel | `[BESCHREIBUNG]` |
|---|---|---|
| `nachtauge_brosche` | Brosche der Nachtwache | a small brass brooch shaped like a half-closed eye, a dull turquoise iris, a faint glow under the lid |
| `bleierne_waage` | Bleierne Taschenwaage | a tiny pocket balance scale made of dull grey lead, two shallow pans on thin chains, one pan slightly lower |
| `kreidestummel` | Ewiger Kreidestummel | a short stub of white chalk wrapped in a strip of faded red cloth, a thin chalk circle drawn around it |
| `russfingerhut` | Rußiger Fingerhut | a heavy iron thimble blackened with soot, a wisp of dark smoke curling out of its opening, small rust spots |
| `salzrosenkranz` | Salzrosenkranz | a short loop of rough white-grey salt crystal beads on a frayed cord, a small knotted fish-hook charm at the end |
| `schwarzer_docht` | Schwarzer Docht | a short candle wick burning with a black flame that swallows light, a faint violet outline around the flame, no candle body |
| `doppelter_trauring` | Doppelter Trauring | two old gold wedding rings fused together into one, a thin dark crack along the seam, slightly tarnished |
| `glaesernes_ohr` | Gläsernes Ohr | a human ear made of thin pale-turquoise glass, translucent with light highlights, a tiny crack at the lobe |
| `pfandmarke_alt` | Pfandmarke ohne Pfandhaus | a worn brass pawn token with a punched hole, an empty unreadable stamped emblem (no letters), a short string through the hole |
| `kleine_moorlaterne` | Kleine Moorlaterne | a thumb-sized iron lantern with greenish glass, a tiny pale will-o'-the-wisp light trapped inside |
| `eiserne_zunge` | Eiserne Zunge | the iron clapper of a church bell, heavy and pear-shaped, rusty with a dark leather loop at the top |
| `spiegelmuenze` | Spiegelmünze | a silver coin polished like a mirror on both sides, showing only a blurred reflection, a thin bright rim |
