# Codex-Batch U: Drei Figuren aus den betretbaren Gebäuden

**Batch-Name:** `gebaeude` (Manifest: `public/sprites/manifest-gebaeude.json`)

Drei Figuren in betretbaren Gebäuden stehen im Spiel noch als Platzhalter: Constable Dunn im Revierflügel, die Pfandleiherin Odile Crane und der Bestatter Ambrosius Quint. Diese kleine Datei liefert für jede ein Lauf-Sheet, ein Emotions-Portrait und einen Kopf fürs Notizbuch.

**Schon fertig, nicht neu machen:** alle Figuren aus den Batches A bis T, darunter die Zirkelmitglieder `tm_*` und `zirkel_*` (Batch T) und die Einzelgänger `ez_*` (Batch S). Das generische Constable-Sheet `04_constable_walk.png` bleibt; Dunn bekommt ein eigenes.

**Farben:** Die Paletten stehen in `src/data/gebaeude.json`, die Hauptfarben unten passen dazu.

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

## 1. Vorlagen
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, same proportions as the existing characters.
```
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious, shocked, smiling faintly. Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
Kopf: 24x24, Ausschnitt aus dem neutralen Portrait, wie bei Batch H.

## 2. Figuren
| ID | Name, Rolle, Ort | `[BESCHREIBUNG]` |
|---|---|---|
| `dunn` | Constable Dunn, Wachstube und Kantine im Revierflügel, kocht den Kaffee und weiß alles | a stout friendly constable in his thirties in a dark navy police uniform with brass buttons and a tall helmet, chestnut-brown hair and sideburns, rosy cheeks, a tin coffee pot in one hand and a mug in the other, sleeves slightly rolled, a cheerful gossip's grin; clearly different from the generic constable (rounder face, sideburns, coffee pot) |
| `crane` | Odile Crane, Pfandleiherin am Altmarkt, kühl, rechnet alles in Schilling | a slim woman in her fifties in a dusky plum high-necked dress with a mustard-brown shawl, silver-grey hair in a severe bun, a jeweller's loupe on a ribbon, a ring of small brass keys at her waist, a pawn ticket between two fingers, appraising eyes |
| `quint` | Ambrosius Quint, Bestatter, streut Salz um jeden Sarg | a tall thin undertaker in a black frock coat and a tall black hat with a crape band, a grey cravat, dark grey hair, a long pale solemn face, a small bowl of coarse grey salt in his hands, measuring tape around his neck |

Ablage: `public/sprites/characters/U_<id>_walk.png`, `public/sprites/portraits/U_<id>_emotions.png`, `public/sprites/ui/heads/<id>.png`.

## 3. Kontrolle vor dem Abgeben
- Drei Lauf-Sheets, drei Portrait-Sheets, drei Köpfe.
- Dunn ist neben dem generischen Constable sofort als eigene Figur erkennbar.
- Manifest `manifest-gebaeude.json`, Prompts in `docs/art/batch-gebaeude-generation.json`, Kurzeintrag in `docs/art/README.md`.
