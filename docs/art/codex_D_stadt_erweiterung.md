# Codex-Batch D: Stadt-Erweiterung – Viertel, Außenbereiche, Übergänge

**Batch-Name:** `stadt` (Manifest: `public/sprites/manifest-stadt.json`)

Die Karte wird größer: Ashgrove ist schon doppelt so breit, dazu kommen neue Viertel um Theater, Uhrturm, Nordtor/Schlachthof, Gaswerk und Sternwarte. Von diesen Orten gibt es bisher nur die **Innenräume** (Batch C). Diese Datei liefert die **Straßen und Außenbereiche**, mehr Abwechslung für große Karten und saubere Übergänge zwischen Bodenarten.

Schon fertig und nicht neu machen: alle Tilesets unter `public/sprites/tilesets/` (Pflaster, Gehweg, Fassaden, Dächer, Kanal, Friedhof, Innenräume, Revier, Ebba, Krypta, Hafen, Auktionshaus, Sanatorium, Nachtmarkt, Lagerhaus, Altmarkt, Taverne, Bahnhof, Theater/Uhrturm/Schlachthof/Gaskanäle/Sternwarte innen).

**Reihenfolge:** 1 (Bodenfix Nachtmarkt) → 2 (Übergänge) → 3 und 4 (Häuser und Läden) → 5 (Viertel) → 6 bis 9.

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

## 1. Nachtmarkt: neues Pflaster (Fix)

Das Pflaster aus `A_07_nachtmarkt_tiles.png` Zeile 0 liest sich im Spiel wie Mauerwerk, deshalb läuft der Nachtmarkt noch auf normalem Pflaster. Gebraucht wird ein **klar als Boden erkennbares** Pflaster.
```
[STYLE BLOCK]
Ground tileset, 16x16 tiles, for the floor of a black market under a stone bridge, seen from top-down: small irregular rounded cobblestones with wide dark mud-filled gaps so it clearly reads as walkable ground and never as a wall (no horizontal brick courses, no vertical mortar lines). Include: 4 plain variations, 2 with shallow puddles reflecting faint amber light, 1 with scattered straw, 1 with sawdust, 1 with chalk scribbles on the stones, 1 with a drain grate, and edge tiles where the cobbles meet the bridge pier base (top, bottom, left, right, inner and outer corners). Slightly darker and wetter than the street cobblestones in 02_01_cobblestone.png but the same stone size. Seamless.
```
Ablage: `public/sprites/tilesets/D_01_nachtmarkt_boden.png`.

## 2. Bodenübergänge (Autotiles)

Für große Karten braucht es Übergänge, die sich automatisch zusammensetzen lassen. Pro Paar ein **16er-Satz** im Standard-Layout (4x4: Innen, 4 Kanten, 4 Außenecken, 4 Innenecken, 2 Diagonalen, 1 Füller).
```
[STYLE BLOCK]
Autotile transition set, 16x16 tiles in a 4x4 grid (64x64): [A] blending into [B]. Layout row by row: full [B] fill; edges top, bottom, left, right; outer corners top-left, top-right, bottom-left, bottom-right; inner corners top-left, top-right, bottom-left, bottom-right; two diagonal pieces; one full [A] fill. The border is irregular and natural, never a straight line through the tile. Seamless with itself.
```
| Datei | `[A]` | `[B]` |
|---|---|---|
| `D_02_pflaster_gras.png` | street cobblestones | dead yellow-green grass |
| `D_02_pflaster_matsch.png` | street cobblestones | wet brown mud |
| `D_02_gras_matsch.png` | dead grass | wet mud with puddles |
| `D_02_pflaster_schnee.png` | street cobblestones | trodden grey snow |
| `D_02_gehweg_pflaster.png` | pale flagstone sidewalk | street cobblestones (a curb edge) |
| `D_02_kies_gras.png` | gravel path | dead grass |
| `D_02_pflaster_wasser.png` | cobblestones | shallow standing water (flooded street) |
| `D_02_planken_wasser.png` | wooden pier planks | dark canal water |

Ablage: `public/sprites/tilesets/<Datei>`.

## 3. Wohnhäuser (modulare Fassaden)

Die vorhandenen Fassaden (`02_03_facades.png`) sind alle aus rotbraunem Ziegel. Für große Straßenzüge braucht es mehr Varianten, die mit demselben Raster zusammenpassen.
```
[STYLE BLOCK]
Modular building facade tileset, 16x16 tiles, top-down 3/4 view, [MATERIAL]. Include: wall tiles (plain, cracked, with drainpipe, with ivy), wall base tiles, ground-floor windows (lit amber, dark, curtained, boarded), upper-floor windows (lit, dark, with flower box of dead plants, with laundry line), a front door with steps, a basement window at street level, roof front edge and corners in [DACH], a chimney. Arranged 8x6. Pieces snap together to build 2-3 storey terraced houses and match the existing facades in public/sprites/tilesets/02_03_facades.png.
```
| Datei | `[MATERIAL]` | `[DACH]` |
|---|---|---|
| `D_03_fassade_putz.png` | cracked grey-white plaster over brick, stained by soot and rain | dark slate |
| `D_03_fassade_holz.png` | old timber-framed houses with dark beams and yellowed infill, leaning slightly | mossy brown tiles |
| `D_03_fassade_stein.png` | pale cut sandstone with carved window frames, wealthy townhouses | blue-grey slate with copper gutters |
| `D_03_fassade_slum.png` | patched rotten planks, corrugated iron sheets and mismatched bricks, slum shacks | tarpaper and loose boards |
| `D_03_fassade_fabrik.png` | blackened industrial brick with tall arched windows and iron shutters | flat roof with skylights and a tall smokestack piece |

## 4. Läden und Schilder

```
[STYLE BLOCK]
Shopfront set, top-down 3/4 view, each shopfront 48x48 px built from 16x16 tiles so it can replace a ground floor of a terraced house, transparent background around it: [LADEN]. Large display window with goods visible, a door with a bell, a hanging sign bracket with a symbol-only sign (no letters), a small awning. Warm amber light behind the window.
```
Für jeden Laden einzeln, `[LADEN]`:
1. `D_04_apotheke` – an apothecary with jars, scales and hanging herbs, green glass bottles in the window
2. `D_04_baeckerei` – a bakery with loaves and pastries, a pretzel-shaped sign
3. `D_04_schneider` – a tailor with a dressmaker's dummy and fabric bolts, a scissors sign
4. `D_04_buchladen` – a cramped second-hand bookshop with stacked books and a reading lamp, an open-book sign
5. `D_04_uhrmacher` – a watchmaker with many clocks in the window, a pocket-watch sign
6. `D_04_pfandhaus` – a pawnshop with barred windows and odd trinkets, three-balls-like abstract sign (three circles)
7. `D_04_kneipe` – a corner pub with frosted windows, a mug sign
8. `D_04_bestatter` – an undertaker with a black-draped window and a single coffin on display, a lily sign
9. `D_04_zeitung` – a newspaper office with stacks of papers and a printing press visible inside, a quill sign
10. `D_04_fotograf` – a photographer's studio with framed portraits and a camera on a tripod, a lens sign

Ablage: `public/sprites/tilesets/<Name>.png`.

## 5. Neue Viertel (Außenbereiche)

Jedes Viertel bekommt ein Außen-Tileset (8x6 Tiles, 16x16) und ein Prop-Sheet. Die Innenräume aus Batch C (`C_09_*.png`) sind fertig; die Außenbereiche müssen dazu passen.

### 5.1 Theaterviertel
```
[STYLE BLOCK]
Exterior tileset for a theatre district at night, 16x16 tiles: the grand facade of the Lumen Theatre (a columned portico with steps, built from 16x16 pieces, about 80x64 total), a marquee canopy with a row of amber bulbs (2-frame flicker), a box office kiosk, poster columns with torn colorful posters (only shapes, no text), a stage door in a side alley with a single lamp, cobbled square with a statue-less plinth, carriage stand.
```
```
[STYLE BLOCK]
Prop sheet, 16px grid, transparent background: a horse-drawn carriage (48x32) and the horse (32x32, 4-frame idle), a ticket booth (16x32), poster column (16x32), a flower seller's basket of roses (16x16), discarded programmes on the ground (16x16), a stage-door bench (32x16), costume trunk left outside (32x16), a broken stage spotlight (16x16).
```

### 5.2 Uhrturm-Platz
```
[STYLE BLOCK]
Exterior tileset for a square around a tall clock tower, 16x16 tiles: the base of the tower in dark stone with a heavy wooden door, the tower shaft (repeatable 16x16 pieces) and the clock face section (48x48, clock face without numbers, hands stopped at three thirty-three), a low wall with iron railings around the tower, worn stone square tiles with a compass-rose pattern, a public water pump, benches, pigeons' droppings.
```
```
[STYLE BLOCK]
Prop sheet, 16px grid, transparent background: a large fallen brass gear half sunk in the ground (32x32), coils of thick rope and a pulley (16x16), a ladder leaning against a wall (16x48), a tool cart (32x16), a notice of the tower's closing pinned to the door (16x16, no text), a crow perched on a lamp (16x32, 4-frame idle).
```

### 5.3 Nordtor und Schlachthof
```
[STYLE BLOCK]
Exterior tileset for the old north gate of the city and the slaughterhouse yard beside it, 16x16 tiles: a massive stone city gate arch with a portcullis (raised and lowered), city wall segments with a walkway, muddy cart tracks in cobblestones, the slaughterhouse front in blackened brick with a large sliding door, wooden livestock pens (empty), a loading ramp, hay bales, a water trough, gutters with dirty water. No blood or gore.
```
```
[STYLE BLOCK]
Prop sheet, 16px grid, transparent background: an empty livestock cart (48x32), salt barrels (16x32), a hand cart with waxed-paper bundles (32x16), a gatehouse guard booth (32x32), a toll barrier pole (48x16), a stray cat on a barrel (16x32), steaming drain grate (16x16, 4 frames).
```

### 5.4 Gaswerk
```
[STYLE BLOCK]
Exterior tileset for a Victorian gasworks yard at night, 16x16 tiles: the lower part of a huge round gasometer with an iron lattice frame (repeatable pieces, plus a 64x64 top view section), coal heaps, rail tracks for coal carts, brick retort house walls with glowing furnace openings (amber, 2-frame flicker), tall smokestack base, pipe bridges overhead, puddles with an oily rainbow sheen, a manhole leading down into the gas tunnels.
```
```
[STYLE BLOCK]
Prop sheet, 16px grid, transparent background: a coal cart on rails (32x16), shovels in a coal heap (16x16), a pressure gauge on a pipe (16x16), a valve wheel (16x16), a warning bell on a post (16x32), a leaking pipe with a pale yellow gas cloud (16x32, 4 frames), stacked gas canisters (16x32).
```

### 5.5 Sternwarten-Hügel und Krater
```
[STYLE BLOCK]
Exterior tileset for a windswept hill outside the city with a small observatory and a meteorite crater, 16x16 tiles: rough heath grass and heather, exposed dark rock, a winding gravel path uphill, the observatory exterior (round stone building with a copper dome, dome slit open and closed, about 48x48), a crater rim with glassy black stones, the crater floor with faintly glowing star-glass shards (2-frame twinkle), a low dry-stone wall, a lone bent tree.
```
```
[STYLE BLOCK]
Prop sheet, 16px grid, transparent background: a brass telescope on a tripod outdoors (16x32), a weather vane (16x32), a fallen meteorite fragment (32x32, faint inner glow), survey stakes with ribbons (16x16), a supply crate (16x16), a sleeping sheep (16x16) and a standing sheep (16x16).
```

### 5.6 Villenhügel (wohlhabend)
```
[STYLE BLOCK]
Exterior tileset for a wealthy hillside district, 16x16 tiles: wide clean flagstone streets, tall wrought-iron fences with spiked tops and an ornate gate (closed and open), trimmed but wintry hedges, a gravel driveway, the front of a grand villa (pale stone, columns, many windows, about 96x64 built from pieces), a fountain with a stone fish, gas lamps with ornate double heads.
```

### 5.7 Elendsviertel am Fluss
```
[STYLE BLOCK]
Exterior tileset for a riverside slum, 16x16 tiles: muddy ground with planks laid over it, shacks from the slum facade set, narrow alleys with laundry lines strung overhead (16x16 overlay pieces), a communal water pump, a burning oil drum for warmth (16x32, 4-frame fire), rickety wooden walkways on stilts over the river edge, rats' holes, piles of junk.
```

Ablage für 5.x: `public/sprites/tilesets/D_05_<viertel>.png` und `public/sprites/props/D_05_<viertel>_props.png` mit `<viertel>` = `theater`, `uhrturm`, `nordtor`, `gaswerk`, `sternwarte`, `villen`, `elend`.

## 6. Brücken, Kanäle und Wege
```
[STYLE BLOCK]
Tileset of 16x16 tiles for canal infrastructure seen top-down: a wide stone bridge deck crossing a canal (horizontal and vertical, with parapet walls and lamp posts), a narrow iron footbridge, a canal lock with two wooden lock gates (closed and open) and a winch, stone steps down to the water, a culvert opening in a wall with dripping water, a moored rowing boat (32x16), a narrowboat (64x16 in pieces), floating ice sheets (2 variations).
```
```
[STYLE BLOCK]
The Crow Bridge seen from above for the city map and overworld: a massive old stone bridge with three arches over the canal, crows perched along the parapet, the night market's lantern glow visible beneath the arches at the edges, 96x48 px, transparent background around it.
```
Ablage: `public/sprites/tilesets/D_06_bruecken.png`, `public/sprites/props/D_06_kraehenbruecke.png`.

## 7. Straßenmöbel und Kleinkram
```
[STYLE BLOCK]
Street furniture prop sheet, 16px grid, transparent background, objects separated by empty space: a horse trough (32x16), a public drinking fountain (16x32), a police call box on a post (16x32), a wooden handcart (32x16), stacked milk churns (16x16), a coal hole cover (16x16), a sandwich-board sign (16x16, no text), a street vendor's roasting-chestnut stove (16x32, 4-frame smoke), a bicycle-free penny-farthing leaning on a wall (16x32), a broken umbrella (16x16), a pile of snow (16x16), an iron bollard (16x16), a hitching post (16x16), a rag-and-bone cart (48x32).
```
Ablage: `public/sprites/props/D_07_strassenmoebel.png`.

## 8. Allgemeine Innenräume für Aufträge

Viele Aufträge führen in Wohnungen und kleine Läden. Ein Baukasten, der überall passt:
```
[STYLE BLOCK]
Interior prop sheet for modest Victorian homes, top-down 3/4 view, 16px grid, transparent background: a narrow iron bed (16x32), a washstand with basin and jug (16x32), a small cooking range with a kettle (32x32), a kitchen table with two chairs (32x32), a dresser with plates (32x32), a rocking chair (16x32), a cradle (16x16), a worn rug (32x32), a tin bathtub (32x16), a sewing machine table (32x16), a birdcage with a canary (16x32), a framed family photo on a wall (16x16, faces only as shapes), a coal scuttle (16x16), a chamber pot (16x16), a locked strongbox under a bed (16x16).
```
```
[STYLE BLOCK]
Interior tileset, 16x16 tiles: four floor types (bare boards, cracked linoleum, worn red carpet, stone kitchen flags) and four wall types (peeling floral wallpaper, plain whitewash with damp stains, dark wood paneling, bare brick) with their top edges and corners, plus a door frame and a window with thin curtains for each wall type. Arranged 8x8.
```
Ablage: `public/sprites/props/D_08_wohnung_props.png`, `public/sprites/tilesets/D_08_wohnung_tiles.png`.

## 9. Stadtkarte: Erweiterung
```
[STYLE BLOCK]
Pixel art city map screen, 480x270 px, not transparent, in the same hand-drawn ink-on-yellowed-paper style as public/sprites/ui/13_05_city_map.png but showing the whole city: the river and canals, the old town, the docks, the cathedral quarter with the cemetery, the market square, the theatre district, the clock tower, the north gate with the slaughterhouse, the gasworks with its gasometer, the wealthy hill with villas, the riverside slums, and a hill with an observatory and a crater outside the walls. Small tiny-building clusters suggest each district, empty circular markers where locations go, patches of fog covering unexplored areas (provide the fog as a separate transparent 480x270 overlay). No text, no labels.
```
Ablage: `public/sprites/ui/D_09_stadtkarte_gross.png`, `D_09_stadtkarte_nebel.png`.
