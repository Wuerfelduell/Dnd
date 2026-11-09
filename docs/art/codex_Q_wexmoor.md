# Codex-Batch Q: Kapitel 2, Wexmoor (erster Teil)

**Batch-Name:** `wexmoor` (Manifest: `public/sprites/manifest-wexmoor.json`)

Kapitel 2 spielt in **Wexmoor**, einer Moorstadt auf Pfählen, eine Bahnfahrt von Kettlegate entfernt. Die Stadt besteht aus Torfstichen, Schleusen, einem Salzmarkt, einem Bojenhafen und einer wohlhabenden Oberstadt auf festem Grund. Draußen auf einer Moorinsel steht ein Leuchtturm. Statt der Polizei wacht dort die Stadtwache der **Grauspäher** in grauen Wachsmänteln und mit Sturmlaternen. Dieser erste Teil liefert die Figuren für Schritt 1, die Stadtkarte, die Wache und eine erste Innenkarte. Die Grafiken für die Polizei-Mechanik mit Sichtkegeln folgen in einem eigenen Batch.

**Stimmung:** gleiche Palette wie Kettlegate, aber nasser und flacher: Torfbraun, Schilfocker, Moorgrün, Holzgrau, Salzweiß, kaltes Wasser; Licht kommt fast nur von Öllampen und dem Leuchtturm.

**Schon fertig, nicht neu machen:** alle Kettlegate-Sheets. Die Moor-Kacheln aus Batch G (`marsch`) dürfen als Stilvorlage dienen.

**IDs (vom Kapitel-2-Thread):**
| Art | IDs |
|---|---|
| Figuren | `zunder`, `druce`, Wache `npc_grauspaeher` |
| Stadtkarte | Pins `wx_bahnhof`, `wx_torfstich`, `wx_salzmarkt`, `wx_bojenhafen`, `wx_oberstadt`, `wx_pfahldorf`, `wx_leuchtturm` |
| Innenraum | Torfkahn-Kajüte |

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

## 1. Figuren

Vorlagen:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, same proportions as the existing characters.
```
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious, shocked, smiling faintly. Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
| ID | Rolle | `[BESCHREIBUNG]` |
|---|---|---|
| `zunder` | Juna „Zunder“ Fenn, 19, Lampenöl-Schmugglerin, frech, schnell, loyal | a wiry young woman of nineteen with a shock of messy copper-red hair tied back with a rag, freckles, a short oilskin jacket over a patched wool sweater, rolled trousers and tall waders, soot-blackened hands and a smudge on her cheek, a dented tin oil canister on a strap over her shoulder, a quick crooked grin |
| `druce` | alter Schleusenwärter, schweigsam, kennt jeden Kanal | an old stooped lock keeper with a long white beard tucked into a heavy dark blue pea coat, a battered peaked cap, a huge ring of iron keys of every size hanging from his belt almost to his knees, a lantern on a hook, weathered red hands, watery pale eyes |

Ablage: `public/sprites/characters/Q_<id>_walk.png`, `public/sprites/portraits/Q_<id>_emotions.png`, Köpfe für das Notizbuch zusätzlich als `public/sprites/ui/heads/<id>.png` (24x24, Ausschnitt aus dem neutralen Portrait).

### 1.1 Stadtwache „Grauspäher“
Die Grauspäher patrouillieren mit Sturmlaternen über Stege und Brücken. Sie sollen auf den ersten Blick als Wache erkennbar sein, auch im Dunkeln.
```
[STYLE BLOCK]
Character sprite sheet for a town watchman NPC: a Wexmoor watchman of the "Grey Scouts", wearing a long stiff grey waxed coat with a short shoulder cape, a wide-brimmed grey oilskin hat, tall boots, a short wooden staff at the belt and a heavy brass storm lantern held out in front at chest height, face mostly hidden by the hat brim and a high collar. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (slow patrol walk, the lantern swinging slightly). Total 64x128 px, transparent background, same proportions as the existing characters. Extra row 5: standing still and raising the lantern to look around, 4 frames (sheet 64x160).
```
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious, alarmed, stern. Bust shot facing slightly right, dark slate vignette background, lit from below by an amber storm lantern. Character: a Wexmoor watchman in a grey waxed coat with a high collar and a wide grey oilskin hat, a lean weathered face with a short grey beard, narrowed eyes.
```
Ablage: `public/sprites/characters/npc_grauspaeher.png`, `public/sprites/portraits/Q_grauspaeher_emotions.png`.

### 1.2 Lichtkegel der Sturmlaterne
Ein Overlay, das das Spiel vor einen Grauspäher legt und in seine Blickrichtung dreht. Erst einmal ein einfacher Kegel; die genauen Maße für die Sichtkegel-Mechanik kommen später und werden dann nachgereicht.
```
[STYLE BLOCK]
Top-down lantern light cone overlay for a stealth game, transparent background, crisp pixels, warm amber light with 2-3 hard-edged brightness bands (no smooth gradient, use dithering at the edges): a cone pointing to the right, 96x48 px, origin at the left middle where the lantern is; provide 4 frames with a subtle flicker; plus a second version in a suspicious state where the edge band turns pale orange-red and the cone is slightly wider (96x56, 4 frames); plus a small round 32x32 lantern glow circle (2 frames) for when the watchman stands still.
```
Ablage: `public/sprites/fx/Q_lichtkegel.png` (Reihe 1 normal, Reihe 2 misstrauisch, Reihe 3 Kreis).

## 2. Stadtkarte Wexmoor (480x270)
Wie `ui/D_09_stadtkarte_gross.png`, bitte als Stilvorlage mitgeben: Tusche auf vergilbtem Papier, kleine Häusergruppen, leere runde Markerplätze, kein Text.
```
[STYLE BLOCK]
Pixel art town map screen, 480x270 px, not transparent, in the same hand-drawn ink-on-yellowed-paper style as the existing city map of Kettlegate, showing a marsh town built on stilts: a railway line arriving from the left edge to a small station; brown peat-cutting fields with stacked peat on the left; a wide slow river and canals through the town with several locks and lock gates; a market square on a wooden platform with salt barrels; a harbour with buoys and moored peat barges; an upper town of solid stone houses on a low hill at the top; a cluster of huts on stilts over the water at the bottom right (stilt village); out in the open marsh to the right an island with a tall lighthouse. Reeds, boardwalks and small bridges connect everything. Small tiny-building clusters suggest each district, empty circular markers where locations go, patches of fog over unexplored parts (provide the fog as a separate transparent 480x270 overlay). No text, no labels.
```
Markerplätze (ungefähre Lage, damit der Spiel-Thread die Pins setzen kann): `wx_bahnhof` links Mitte, `wx_torfstich` links unten, `wx_salzmarkt` Mitte, `wx_bojenhafen` Mitte unten, `wx_oberstadt` oben, `wx_pfahldorf` rechts unten, `wx_leuchtturm` rechts auf der Insel.

```
[STYLE BLOCK]
City map location markers, 16x16 each, 7 in a row, transparent background, 1px dark outline, same hand-drawn ink style as the existing map markers: a small steam engine (station), a peat spade with stacked peat (peat cutting), a salt barrel (salt market), a buoy (buoy harbour), a stone gable house (upper town), a hut on stilts (stilt village), a lighthouse (lighthouse). Second row: the same in an amber highlighted state.
```
Reihenfolge/IDs: `wx_bahnhof, wx_torfstich, wx_salzmarkt, wx_bojenhafen, wx_oberstadt, wx_pfahldorf, wx_leuchtturm`. Ablage: `public/sprites/ui/Q_wexmoor_karte.png`, `Q_wexmoor_nebel.png`, `Q_wexmoor_marker.png` (112x32).

## 3. Innenraum: Torfkahn-Kajüte
Die enge Kajüte auf Zunders Torfkahn, Versteck und Werkstatt zugleich. Klein (etwa 8x6 Tiles), alles ist schief, feucht und riecht nach Öl.
```
[STYLE BLOCK]
Interior tileset for the cramped cabin of a peat barge, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: worn tarred plank floor (4 variants), a floor hatch to the hold (closed and open), curved wooden hull wall faces with ribs and a round brass porthole showing dark water and reeds (top and front faces, corners), a low wall with a small door to the deck, a steep ladder up, damp patches.
```
```
[STYLE BLOCK]
Prop sheet for the cabin of a smuggler's peat barge, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a narrow bunk built into the hull with a rumpled blanket (16x32), a stove made from an old oil drum with a crooked chimney pipe, glowing (16x32, 3-frame flicker), stacked oil canisters, some dented (16x16, 3 variants), a small folding table with a chart and a candle (16x16), a hanging oil lamp swaying (16x16, 4 frames), a crate of peat bricks (16x16), a coil of rope (16x16), a wanted poster of a red-haired girl pinned to the wall, torn (16x16, no text), a hidden floor compartment with smuggled lamp oil bottles (16x16, closed and open), a kettle and tin mugs (16x16), fishing nets hung on hooks (32x16).
```
Ablage: `public/sprites/tilesets/Q_kajuete_tiles.png`, `public/sprites/props/Q_kajuete_props.png`.

## 4. Kontrolle vor dem Abgeben
- Wexmoor wirkt flacher, nasser und ärmer als Kettlegate, aber im selben Stil.
- Der Grauspäher ist auch klein und im Dunkeln an Hut, grauem Mantel und Laterne erkennbar.
- Der Lichtkegel hat harte Helligkeitsstufen, keinen weichen Verlauf.
- Manifest `manifest-wexmoor.json`, Prompts in `docs/art/batch-wexmoor-generation.json`, Kurzeintrag in `docs/art/README.md`.
