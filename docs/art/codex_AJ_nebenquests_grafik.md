# Codex-Batch AJ: Grafik für die neuen Nebenaufträge (Kettlegate und Wexmoor)

**Batch-Name:** `nebenquests` (Manifest: `public/sprites/manifest-nebenquests.json`)

Die Pakete AA (11 Nebenaufträge in Kettlegate + 3 Steckbriefe) und AB (10 Nebenaufträge in Wexmoor + 6 Torfkahn-Ausbauten) sind als Daten-Entwurf fertig. Jetzt fehlen die Bilder. Die Auftragslisten liegen im Repo:
- **`docs/story/kg_nebenquests/grafikwuensche.md`** (Kettlegate)
- **`docs/story/wx_nebenquests/grafikwuensche.md`** (Wexmoor, inkl. Torfkahn-Ausbauten)
Jeder Eintrag hat ID, Art, Beschreibung und einen englischen Prompt. Lies dazu `README.md`, `npcs.json`, `items.json`, `encounters.json` und `kahn_ausbau.json` im jeweiligen Ordner, damit Figuren und Gegenstände zur Geschichte passen.

**Schon fertig, nicht neu machen:** alle Figuren, die es schon gibt (die Liste nennt sie als Platzhalter), alles aus den Batches A bis X.

**Hinweis Setting:** Für die Wexmoor-Einträge gilt statt „Kettlegate“ die versinkende Moorstadt Wexmoor: Torf, Reet, Schlick, Salz, Bojen, Nebel.

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
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Ordner und Dateinamen stehen bei jedem Asset. Die Namen entsprechen den IDs im Spielcode bzw. in den Daten-Entwürfen, bitte genau so übernehmen.
- Ein Manifest `public/sprites/manifest-nebenquests.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-nebenquests-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
- Figuren: `characters/<id>_walk.png` (64x128) und `portraits/<id>_emotions.png` (256x64, 4 Stimmungen; wo die Liste nur ein Portrait 64x64 verlangt, trotzdem alle 4 Stimmungen). Items: `items/<id>.png` 16x16 und `items/32/<id>.png` 32x32. Kampf-Gegner: `battle/enemy_<id>.png` (gleiches Layout wie die vorhandenen `battle/enemy_*.png`, Manifest-Einträge dort ansehen). Deko/Props: `props/<id>.png`.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



---

## 1. Auftrag
Arbeite **beide Listen vollständig** ab. Reihenfolge: zuerst alle Figuren (Lauf-Sheet + Portrait), dann Kampf-Gegner, dann Items, dann die Torfkahn-Ausbauten.

## 2. Figuren
- Lauf-Sheet: 4 Reihen (unten, links, rechts, oben) x 4 Frames, wie `characters/E_waescherin_walk.png`.
- Jede neue Figur braucht eine eigene, gut lesbare Silhouette und eine Hauptfarbe, die sich von den Figuren auf derselben Karte unterscheidet (welche das sind, steht in `platzierung.json`).

## 3. Kampf-Gegner
- Menschen 48x48, Übernatürliches 64x64 (siehe 0.2), Blick nach links. Angriffe halten die Ausholpose 2 Frames.
- Für jeden Gegner zusätzlich ein Bestiariums-Bild in derselben Größe wie die vorhandenen in `public/sprites/ui/bestiary/`.

## 4. Torfkahn-Ausbauten (aus `kahn_ausbau.json`)
Je Ausbau ein Prop im Stil der vorhandenen Kajüten-Props (`props/` mit Präfix `q_kajuete_props_`, ansehen), Dateiname `props/k2n_kahn_<name>.png`. Sie stehen später im Unterschlupf `wx_kahn` (16x9 Kacheln), also klein und gemütlich.

## 5. Kontrolle
In der PR-Beschreibung eine Tabelle: jede ID aus beiden Listen mit Dateipfad(en). Es darf keine fehlen.
