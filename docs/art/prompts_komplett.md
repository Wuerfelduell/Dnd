# Pixel-Art-Prompts für das 2D-Mystery-Spiel (Phaser 3, Browser)

Stil: Top-down-Pixel-Art im Stil von Farm-/Life-Sims (gemütliche Lesbarkeit, klare Silhouetten), aber düster: gedeckte Farben, Nebel, Gaslaternen, viktorianisch-okkulte Großstadt. Eigene Welt, keine Figuren oder Namen aus bestehenden Werken.

## So benutzt du die Datei

1. **Immer zuerst den Style-Block (Abschnitt 1) einfügen**, dann den Asset-Prompt darunter. So bleiben alle Bilder konsistent.
2. Die Prompts sind auf Englisch, weil Bildmodelle damit zuverlässiger arbeiten. Die Erklärungen sind auf Deutsch.
3. Platzhalter in `[eckigen Klammern]` ersetzt du nach Bedarf.
4. Generiere lieber **ein Asset bzw. ein kleines Sheet pro Prompt** statt alles auf einmal. Große Sheets werden von Bildmodellen oft unsauber (falsches Raster, verschwommene Pixel).
5. Nachbearbeitung fast immer nötig: siehe Abschnitt 9 (Aseprite/LibreSprite, auf echtes Raster runterskalieren, Palette erzwingen).

## Technische Festlegungen (mit dem Prototyp abgestimmt)

| Was | Größe |
|---|---|
| Tile | 16x16 px |
| Figur (Spieler/NPC) | 16x32 px pro Frame (Kopf ragt ins Tile darüber) |
| Lauf-Sheet | 4 Richtungen (unten, links, rechts, oben) x 4 Frames = 64x128 px |
| Props | Vielfache von 16 (16x16, 16x32, 32x32, 32x48 …) |
| Portrait | 64x64 px (optional 96x96) |
| UI | 9-slice-Rahmen auf 16er-Raster, Icons 16x16 |
| Spielauflösung | 480x270 oder 640x360, Integer-Scaling, Texture-Filter "Nearest" |
| Perspektive | Top-down mit leichter Schrägsicht (Wände/Fassaden zeigen Vorderseite, ca. 3/4) |

Falls der Prototyp auf 32x32 umstellt: im Style-Block `16x16` durch `32x32` und `16x32` durch `32x64` ersetzen.

---

## 1. Style-Block (immer voranstellen)

```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial city with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies.
Grid: strict 16x16 pixel tiles. Characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, no dithering noise except deliberate 2-tone checker dithering on large surfaces. 1px dark outline (not pure black, use deep blue-grey #1a1c2c-ish) on characters and props; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; a single sickly teal accent (around #6fe0d0) or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light source assumed top-left. Do not bake night darkness into the sprites (the engine adds lighting); keep assets readable at mid-brightness.
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no perspective distortion, no text, no watermark, no signature, no UI frame around the image.
Avoid: 3D render look, painterly style, high-res illustration, photorealism, chibi exaggeration, anime eyes, references to existing franchises or characters.
```

**Kurzversion** (wenn das Tool wenig Text erlaubt):

```
16x16 tile top-down 3/4 pixel art, crisp pixels, no anti-aliasing, limited muted 32-color palette (slate blue, fog grey, soot brown, rust, brass, amber lamp light, rare teal occult accent), foggy Victorian occult city, dark cozy farming-sim readability, transparent background, no text.
```

---

## 2. Tilesets (16x16)

Tipp: Tilesets als Sheet mit sichtbarem Raster anfragen, später das Raster im Editor entfernen. Für Autotiling (z. B. in Tiled) ist ein **47er- oder 16er-Blob-Set** ideal; Bildmodelle schaffen das selten perfekt, also lieber die Grundtiles generieren und die Übergänge von Hand bauen.

### 2.1 Kopfsteinpflaster-Straße
```
[STYLE BLOCK]
A tileset sheet of 16x16 pixel tiles for wet cobblestone streets, arranged on a clean grid, 8 columns x 4 rows (128x64 px). Include: 4 variations of plain cobblestone, cobblestone with puddles, cracked stones, moss between stones, a drain grate, manhole cover, edge tiles where cobblestone meets a raised stone sidewalk (top, bottom, left, right, inner and outer corners). Seamless tiling. Muted grey-blue stones with subtle brown grime.
```

### 2.2 Gehweg & Bordstein
```
[STYLE BLOCK]
Tileset sheet of 16x16 tiles for a Victorian stone sidewalk with curb: plain flagstones (3 variations), curb edges in all 4 directions, inner and outer corners, flagstones with scattered leaves, a cellar hatch, a coal chute. 8x3 grid, seamless, worn pale grey stone.
```

### 2.3 Hausfassaden (Ziegel)
```
[STYLE BLOCK]
Modular building facade tileset, 16x16 tiles, for top-down 3/4 view: soot-stained red-brown brick wall tiles (plain, cracked, with drainpipe), wall base tiles, window tiles (lit warm amber, dark, boarded up, with iron bars), a wooden door (closed), shop door with small sign bracket, stone window sill, roof edge tiles in dark slate (front edge, corners, chimney). Arranged on a grid 8x6. Pieces must snap together to build 2-3 storey townhouses.
```

### 2.4 Dächer
```
[STYLE BLOCK]
Roof tileset for top-down 3/4 view, 16x16 tiles: dark slate shingle roof surfaces (seamless, 3 variations), ridge line, left/right/front edges, corners, brick chimney with soot, small attic window, rusted gutter. Wet blue-grey slate with green moss patches. 8x4 grid.
```

### 2.5 Kanal & Ufer
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a murky city canal: dark green-grey water (4 seamless frames for a subtle animation loop, laid out in a row), stone embankment edges in all directions with inner/outer corners, iron railing along the edge, mooring post, stone stairs leading down to the water, floating debris. 8x4 grid.
```

### 2.6 Park / Friedhof
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a neglected cemetery and park: dead yellow-green grass (4 variations), gravel path with edges and corners, wet mud, fallen leaves, grass-to-path transitions, low iron fence segments (horizontal, vertical, corners, gate). 8x4 grid, seamless, muted autumn colors.
```

### 2.7 Innenräume (Boden & Wände)
```
[STYLE BLOCK]
Interior tileset, 16x16 tiles, for Victorian rooms seen top-down 3/4: dark wooden floorboards (3 variations), worn patterned carpet (center + edges + corners), black-and-white checker tiles (faded), interior wall tiles with dark green damask wallpaper and wooden wainscoting, wall top edge, door frame, window with heavy curtains, fireplace (2x2 tiles). 8x6 grid.
```

### 2.8 Okkulter Keller / Untergrund
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a hidden occult basement: damp rough stone floor (3 variations), stone walls with dripping water, wall edges and corners, a chalk ritual circle drawn across 3x3 tiles (faint glowing teal lines), candle wax puddles, cracked floor with something faintly glowing underneath. 8x5 grid. The teal glow is the only bright color.
```

---

## 3. Spieler-Sprite-Sheets (16x32)

### 3.1 Spieler: Laufen
```
[STYLE BLOCK]
Character sprite sheet for the player character, a young investigator in a long dark grey coat, flat cap, scarf, and leather satchel, pale face, short dark hair. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle: idle-step, left foot, idle-step, right foot). Total sheet 64x128 px, transparent background, every frame aligned to the grid, consistent proportions (head ~6px tall), 1px dark outline.
```

### 3.2 Spieler: Idle & Aktionen
```
[STYLE BLOCK]
Additional sprite sheet for the same investigator character (long dark grey coat, flat cap, scarf, satchel). Frame size 16x32 px. Row 1: idle breathing loop facing down (4 frames). Row 2: kneeling to inspect the ground (4 frames). Row 3: holding up a lantern (4 frames). Row 4: writing in a small notebook (4 frames). Sheet 64x128 px, transparent background.
```

### 3.3 Spieler: Wahnsinn/Sanity-Effekt (optional)
```
[STYLE BLOCK]
Sprite sheet for the investigator character (long dark grey coat, flat cap, scarf) experiencing a supernatural episode: frame size 16x32, one row of 6 frames: clutching head, staggering, faint teal-green aura flickering around the silhouette, eyes glowing faintly. Sheet 96x32, transparent background.
```

---

## 4. NPC-Sprite-Sheets (16x32)

Vorlage, nur die Beschreibung austauschen:

```
[STYLE BLOCK]
Character sprite sheet for an NPC: [DESCRIPTION]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, grid-aligned, 1px dark outline, same proportions as a standard 16x32 human character.
```

Fertige Beschreibungen für `[DESCRIPTION]`:

| NPC | Beschreibung |
|---|---|
| Polizist | a city constable in a dark navy uniform with brass buttons, tall helmet, truncheon at the belt, thick moustache |
| Laternenanzünder | an elderly lamplighter with a long brass pole, patched brown coat, fingerless gloves, bent posture |
| Zeitungsjunge | a scrawny newspaper boy with an oversized cap, bundle of papers under one arm, braces and rolled sleeves |
| Wirtin | a stout tavern keeper woman with a stained apron, rolled sleeves, hair in a bun |
| Arzt | a gaunt doctor with a black frock coat, top hat, round spectacles and a leather medical bag |
| Kultist | a hooded figure in a long charcoal robe with a faint violet sigil embroidered on the chest, face hidden in shadow |
| Adlige | a wealthy widow in a black mourning dress with a veil and a closed parasol |
| Bettler | a beggar wrapped in layered rags and a torn blanket, carrying a tin cup |
| Pfarrer | a priest in a grey cassock with a white collar and a lantern, tired face |
| Hafenarbeiter | a broad dock worker with a knit cap, heavy jacket, rope coil over the shoulder |
| Antiquar | a hunched antique dealer with a magnifying monocle, velvet waistcoat, ink-stained fingers |
| Fremde | a mysterious woman in a dark green travelling cloak, silver-streaked hair, a sealed letter in hand |

### 4.1 Unheimliche Wesen (Mystery, kein Kampf-Fokus)
```
[STYLE BLOCK]
Sprite sheet for a supernatural apparition: a tall thin shadowy figure made of drifting fog, with faint teal-green eyes and no clear face, edges dissolving into mist. Frame size 16x32 (or 32x48 if taller). One row of 6 frames: idle floating loop with subtle flicker. Transparent background, semi-transparency simulated with dithering, not real alpha blur.
```

---

## 5. Props (auf 16er-Raster)

### 5.1 Straßen-Props
```
[STYLE BLOCK]
Prop sprite sheet for a foggy Victorian street, each object on a 16px grid, transparent background, objects separated by empty space: a cast-iron gas street lamp (16x48, lit with a warm amber glass head), the same lamp unlit, a wooden bench (32x16), a wooden barrel (16x16), stacked crates (16x32), a red-brown pillar postbox (16x32), a newspaper stand (32x32), a hand cart (32x16), a horse trough (32x16), a public notice board with pinned papers (32x32), a street sign post (16x32), trash heap with a rat (16x16).
```

### 5.2 Ermittlungs-Hinweise (Clue-Objekte, 16x16)
```
[STYLE BLOCK]
A sheet of small 16x16 clue objects for an investigation game, each centered in its own 16x16 cell, 8x2 grid, transparent background: torn letter, bloodless dagger with odd engravings, pocket watch stopped at midnight, muddy footprint, broken spectacles, a wax-sealed envelope with an unfamiliar sigil, a burned photograph, a strange coin with an eye symbol, a vial of glowing teal liquid, a key on a ribbon, a chalk symbol on the ground, a dropped glove, a train ticket, a candle stub with black wax, a page from a diary, a raven feather. Each object must stand out with a subtle 1px light rim so it is visible on dark ground.
```

### 5.3 Innenraum-Möbel
```
[STYLE BLOCK]
Furniture prop sheet for Victorian interiors, top-down 3/4 view, 16px grid, transparent background: writing desk with papers and an oil lamp (32x32), bookshelf full of old books (32x32), armchair (16x32), dining table with chairs (48x32), bed with heavy blanket (32x48), wardrobe (32x48), grandfather clock (16x48), side table with candelabra (16x32), chest/trunk (32x16), framed portrait on an easel (16x32), potted dead plant (16x32), globe on a stand (16x32).
```

### 5.4 Okkulte Objekte
```
[STYLE BLOCK]
Occult prop sheet, 16px grid, transparent background: stone altar with candles (32x32), brass astrolabe on a stand (16x32), cage with a strange glowing moth (16x16), stack of forbidden tomes with a chain lock (16x16), mirror with a cracked surface showing a faint teal glow (16x32), hanging herbs and bones (16x16), sealed reliquary box (16x16), tarot-like cards spread on a cloth (32x16, abstract symbols only, no real tarot designs). The teal/violet accent appears only on the supernatural parts.
```

### 5.5 Animierte Props
```
[STYLE BLOCK]
Animation strip of a gas lamp flame flickering, 16x16 per frame, 4 frames in a row (64x16), warm amber and yellow, transparent background.
```
```
[STYLE BLOCK]
Animation strip of a single candle flame, 16x16 per frame, 4 frames in a row, transparent background.
```
```
[STYLE BLOCK]
Animation strip of drifting fog wisps for overlay, 32x16 per frame, 6 frames, pale blue-grey with dithered edges, transparent background, loopable.
```

---

## 6. Portraits (64x64)

Vorlage:
```
[STYLE BLOCK]
Dialogue portrait in pixel art, 64x64 px, bust shot facing slightly to the right, of [DESCRIPTION]. Same limited muted palette, crisp pixels, 1px dark outline, simple dark slate background vignette (not transparent), expressive but restrained face, no text.
```

Emotions-Set (für dieselbe Figur, als ein Sheet):
```
[STYLE BLOCK]
Portrait sheet of the same character, 64x64 px each, 4 in a row (256x64): neutral, suspicious (narrowed eyes), shocked (wide eyes, pale), smiling faintly. Character: [DESCRIPTION]. Identical framing, lighting and palette across all four.
```

Passende `[DESCRIPTION]`s: dieselben wie bei den NPCs (Tabelle in Abschnitt 4), für den Spieler: *a young investigator with pale skin, short dark hair, flat cap, dark grey coat collar turned up, tired but sharp eyes*.

---

## 7. UI

### 7.1 Dialogbox (9-slice)
```
[STYLE BLOCK]
Pixel art UI dialogue box frame designed for 9-slice scaling, 48x48 px total built from 16x16 corner, edge and center pieces: dark aged parchment center, ornate wrought-iron border with small brass rivets in the corners. Transparent outside the frame. No text.
```

### 7.2 Notizbuch / Fallakte
```
[STYLE BLOCK]
Pixel art UI background for an investigation notebook screen, 480x270 px: an open leather-bound journal seen from above, two yellowed pages with faint ruled lines, a ribbon bookmark, small ink stains, a few pinned photographs and a strand of red string at the edges. Leave the pages mostly empty for text. Muted palette, no readable text.
```

### 7.3 Icons (16x16)
```
[STYLE BLOCK]
UI icon sheet, 16x16 px per icon, 8x2 grid, transparent background, 1px dark outline: notebook, magnifying glass, speech bubble, map, key, lantern, eye (sanity), heart, coin, gear (settings), clock, question mark, exclamation mark, footsteps, scroll, closed door.
```

### 7.4 Sanity-/Wahnsinns-Anzeige
```
[STYLE BLOCK]
UI element: a sanity meter as a vertical glass vial in a brass frame, 16x48 px, plus 5 fill states shown side by side (full murky teal to empty), and a cracked-glass variant. Transparent background.
```

### 7.5 Interaktions-Hinweis
```
[STYLE BLOCK]
Small 16x16 interaction prompt icons that float above objects, 4 frames each in a row for a gentle bob animation: magnifying glass (inspect), speech bubble (talk), hand (pick up). Transparent background, amber highlight.
```

### 7.6 Titelbild (optional)
```
[STYLE BLOCK]
Title screen background in pixel art, 480x270 px, not transparent: a foggy Victorian street at night seen from a low angle, a row of gas lamps fading into fog, a church spire silhouette, a lone figure in a long coat in the middle distance, faint teal light leaking from a cellar window. Leave the top third mostly sky/fog for a logo.
```

---

## 8. Licht-Texturen (Lichtkegel der Gaslaternen)

Diese Texturen nutzt die Engine für die Gaslaternen; deshalb hier explizit **keine** Pixelkanten nötig.

```
Radial light texture for a 2D game engine, 128x128 px, pure white center fading to fully transparent at the edges, soft circular falloff, slightly uneven edge to look like gaslight, PNG with alpha, nothing else in the image.
```
```
Cone-shaped flashlight/lantern light texture, 128x128 px, white fading to transparent, pointing to the right, PNG with alpha.
```

---

## 9. Nachbearbeitung (wichtig)

Bildmodelle liefern meist **keine echte Pixel-Art**, sondern große Bilder, die nur so aussehen. So machst du sie spielfertig:

1. **Runterskalieren auf echte Größe**: in Aseprite/LibreSprite oder GIMP mit "Nearest Neighbor" auf das Zielraster (z. B. 1024 px Bild mit 8x8 Tiles → 128 px).
2. **Palette erzwingen**: eine feste Palette laden (z. B. eine 32-Farben-Palette, die du einmal festlegst) und das Bild darauf indizieren. So passen alle Assets zusammen.
3. **Raster prüfen**: Grid 16x16 einblenden, schiefe Pixel von Hand korrigieren, Hintergrund transparent machen.
4. **In Phaser 3**: im Game-Config `pixelArt: true` setzen (Nearest-Filter, kein Glätten), Sprite-Sheets mit `this.load.spritesheet(key, url, { frameWidth: 16, frameHeight: 32 })` laden, Tilesets mit 16x16 in Tiled bauen und als Tilemap-JSON laden.
5. **Konsistenz**: gute Ergebnisse als Referenzbild beim nächsten Prompt mitgeben ("match the style, palette and proportions of the attached reference").

## 10. Referenz-Trick für Konsistenz

Sobald du **einen** Spieler-Sprite und **ein** Straßen-Tileset hast, die dir gefallen, hänge sie bei allen weiteren Prompts als Referenz an und ergänze:

```
Use the attached image as the strict style reference: same palette, same outline color, same pixel density, same character proportions and same lighting direction.
```

---

# Erweiterung: Polizei-Ansehen, mehr Fälle, Wahrscheinlichkeit im Log

Neue Prompts für die nächsten Features: Polizeirevier als Hub, Ansehen-Ränge, Aufgaben-Log, Hinweise als "Vermutung" oder "sehr wahrscheinlich", neue Orte und Figuren. Wie immer: **Style-Block aus Abschnitt 1 voranstellen.**

## 11. Polizeirevier (Hub)

### 11.1 Revier-Innenraum-Tileset
```
[STYLE BLOCK]
Interior tileset, 16x16 tiles, for a cramped Victorian city police station seen top-down 3/4: scuffed dark wooden floorboards (3 variations), worn green linoleum for the corridor, cold grey stone floor for the cells, interior walls with dull green paint on the upper half and dark wood paneling below, wall top edges and corners, frosted-glass office door with blank lettering area, iron cell bars wall segment (horizontal, vertical, corner, cell door closed and open), barred window, notice-board wall section. 8x6 grid, seamless.
```

### 11.2 Revier-Props
```
[STYLE BLOCK]
Prop sheet for a Victorian police station, 16px grid, transparent background, objects separated by empty space: long front reception desk with a brass bell and a ledger (48x32), inspector's cluttered desk with lamp, pipe and stacked case files (32x32), tall wooden filing cabinet (16x32), archive shelf packed with labelled file boxes (32x48), evidence board on an easel with pinned photos, notes and red string (32x32), wanted posters on a wall (32x16, faces only as simple shapes, no readable text), telegraph machine on a small table (16x32), typewriter (16x16), wooden bench for waiting witnesses (32x16), cell cot with a thin blanket (16x32), bucket (16x16), coat stand with a constable's helmet (16x32), wall clock (16x16), locked evidence cabinet with a padlock (16x32), stack of evidence boxes (16x32).
```

### 11.3 Archiv (gesperrter Bereich, erst ab höherem Ansehen)
```
[STYLE BLOCK]
Small prop and tile sheet for a dusty police records archive in a basement, 16px grid, transparent background: narrow aisle floor tile, tall shelves full of yellowed files (16x48, 2 variations), a reading desk with a green-shaded lamp (32x32), a rolling ladder (16x48), a locked iron gate with a brass badge-shaped lock (32x32, closed and open), a single open file with a photograph (16x16), cobwebs (16x16). Dim, cold, dusty.
```

## 12. Neue Figuren (16x32 Lauf-Sheets + 64x64 Portraits)

Verwende die NPC-Vorlage aus Abschnitt 4 und die Portrait-Vorlage aus Abschnitt 6 mit diesen Beschreibungen.

**Revier Kettlegate:**

| Figur | Beschreibung |
|---|---|
| Inspektorin Agatha Marlowe (Hub-Chefin) | a stern grey-haired police inspector woman in her fifties, long dark violet overcoat over a high-collared blouse, hair pinned up, sharp tired eyes, holding a case file |
| Sergeant Holt (Wachhabender) | a heavyset desk sergeant in a police-blue uniform with rolled sleeves, ink-stained fingers, reading glasses on a cord, grey moustache |
| Miss Pimm (Archivarin) | a thin records clerk woman with auburn red-brown hair in a bun, olive-grey dress and cardigan, half-moon spectacles, armful of files, dust on her sleeves |
| Constable Rook | a young blond constable in a navy uniform and tall helmet, friendly open face, polite smile that does not reach his eyes; one small hidden detail: a tiny violet eye-in-a-circle pin under his collar (he is secretly a cultist, keep it subtle) |
| Barnaby (Häftling) | a ragged grey-haired old prisoner in a torn shirt and braces, unshaven, hunched, wrists in iron cuffs, knowing grin |

**Ashgrove Lane:**

| Figur | Beschreibung |
|---|---|
| Kit (Straßenjunge, später Spitzel) | a scrappy street kid in a far too large brown coat with rolled-up sleeves, flat cap pulled low, dirty cheeks, bright clever eyes, bare ankles and worn boots |

**Figuren aus Fall 1 (Die erloschene Laterne), falls noch nicht erzeugt:**

| Figur | Beschreibung |
|---|---|
| Constable Price | a broad, weary night constable in a dark navy uniform with brass buttons and a tall helmet, ruddy cheeks, bullseye lantern at the belt |
| Greta | a sharp-eyed flower seller woman in a patched shawl and long skirt, basket of wilted flowers, hair tied in a scarf |
| Mr. Halloway | a thin pawnbroker in a worn velvet waistcoat, sleeve garters, pince-nez, slicked-back thinning hair, nervous smile |
| Elias Thorne | an elderly grey-haired lamplighter in a patched grey-brown coat, grey beard, frightened expression, holding his hands close to his chest (variant for case 1: frost on shoulders and beard; after case 1 he hangs around the police station) |

**Portrait-Emotionen für Polizei-Figuren** (zusätzlich zu Abschnitt 6): `neutral, skeptical (one raised eyebrow), approving (slight nod and smile), angry (furrowed brow)` – zeigt dem Spieler, wie das Ansehen gerade steht.

## 12b. Fall 2: „Asche von St. Ebba“

### Friedhof mit abgebrannter Kapelle
```
[STYLE BLOCK]
Tileset of 16x16 tiles for the cemetery of St. Ebba at night: dead grey-green grass (3 variations), muddy gravel paths with edges and corners, scorched earth and ash patches around a burned-down chapel, charred stone wall segments of the chapel ruin (straight, corner, broken top, empty gothic window frame), fallen burnt roof beams, low cemetery wall and wrought-iron fence with gate. 8x6 grid, seamless, ash grey and soot black with muted green.
```

### Friedhofs-Props
```
[STYLE BLOCK]
Prop sheet for a night cemetery, 16px grid, transparent background, objects separated by empty space: weathered gravestones (4 variations, 16x16 and 16x32, no readable text), a stone angel statue with a broken wing (16x32), an open grave with a mound of earth (16x32), a closed fresh grave (16x32), a rubble pile of burnt stone and timber (32x16), dead leafless trees (32x48, 2 variations), a gravedigger's spade with a notch in the blade stuck in the ground (16x32), a discarded torn jacket on the ground (16x16), a stone stairway leading down into a crypt entrance (32x32), a crooked wooden gravedigger's shed (48x48) with tools leaning on it, a hanging lantern on a post (16x32).
```

### Krypta
```
[STYLE BLOCK]
Tileset and props for an underground crypt, 16px grid: cold flagstone floor (3 variations), rough stone walls with burial niches, wall corners and edges, stair tiles coming down from above, many candles in clusters on the floor (16x16, plus a 4-frame flame animation), a chalk ritual circle across 3x3 tiles with an eye-in-a-circle symbol at its center glowing faint teal, a stone altar with black candles and a cloth (32x32), stone sarcophagus (16x32). Dark, only candle amber and the teal glow are bright.
```

### Hinweis-Objekte aus Fall 2 (16x16)
```
[STYLE BLOCK]
A sheet of 16x16 clue objects, each centered in its own cell, in a row, transparent background, each with a subtle 1px light rim: a small music box of red-lacquered wood with a brass crank (lid slightly open), a sheet of music with an eye-in-a-circle seal stamped on it (notes as simple marks, no readable text), a tarnished silver locket on a chain (closed), the same locket open showing a tiny portrait silhouette, a notched spade blade, a torn blue-grey coat button, a burnt hymn book.
```

### Figuren aus Fall 2

| Figur | Beschreibung |
|---|---|
| Ivy Marsh | a determined teenage girl with strawberry-blonde hair in a loose braid, blue-grey wool coat, scuffed boots, worried but stubborn face |
| Hester Marsh | Ivy's older sister in a white nightgown, bare feet, long loose strawberry-blonde hair, blank entranced stare, eyes faintly glowing teal; walk animation should look slow and sleepwalking |
| Küster Anselm (Sexton) | an old frail church sexton in a black cassock, wild white hair, hunched, holding a ring of keys and a candle |
| Moll (Totengräber) | a coarse broad gravedigger with an earth-brown coat, muddy boots, rough stubble, carrying a spade with a notch in the blade |
| Miriam Vey (Gegenspielerin) | an elegant choir director woman in a long grey coat with a high collar, dark hair tightly pinned, calm cold smile, holding a folder of sheet music; a small eye-in-a-circle brooch at her throat |

Zusätzlich für Miriam Vey (Portrait-Emotionen): `serene, amused, cold contempt, eyes glowing faint teal`.

### Symbol: Auge im Kreis
```
[STYLE BLOCK]
Occult symbol set, transparent background, 1px precise pixels: an eye inside a circle as a sigil, in 4 versions: 16x16 chalk drawing (white-grey), 16x16 wax seal (dark red wax), 16x16 glowing teal (#6fe0d0) on dark, 32x32 detailed carved-stone version. Original simple design, no existing religious or franchise symbols.
```

## 13. Neue Orte für weitere Fälle

Vorschläge für spätere Fälle; nimm die, die zur Story passen.

### 13.1 Hafen & Lagerhäuser
```
[STYLE BLOCK]
Tileset of 16x16 tiles for foggy night docks: weathered wooden pier planks (3 variations) with edges over dark water, stone quay edges with iron mooring rings, warehouse brick wall with large sliding wooden door, stacked cargo crates and sacks, rope coils, a crane hook hanging from a chain, oil puddles, fish baskets. 8x6 grid, seamless.
```

### 13.2 Auktionshaus / Antiquitätenladen (Innen)
```
[STYLE BLOCK]
Interior tileset and props, 16px grid, for a gloomy auction house: dark polished parquet floor, red velvet rope barriers, display pedestals with covered objects under cloth (16x32), glass display cases with small curios (32x32), an auctioneer's lectern with a gavel (16x32), rows of wooden chairs, oil paintings in heavy gilded frames (abstract dark landscapes, 32x32), a locked back-room door with a strange sigil faintly carved into it.
```

### 13.3 Sanatorium
```
[STYLE BLOCK]
Interior tileset and props, 16px grid, for a decaying Victorian sanatorium: pale cracked tile floor (white and grey, stained), long corridor walls with peeling cream paint, iron hospital beds with thin sheets (16x32), a wheelchair (16x16), a medicine cabinet with glass bottles (16x32), a doctor's desk with patient files (32x32), a padded door with a small barred window, flickering gas wall lamps. Cold and clinical, a faint teal glow leaking from under one door.
```

### 13.4 Bahnhof
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a soot-blackened Victorian railway station platform at night: stone platform edge, rail tracks with sleepers (horizontal and vertical, curve), iron pillars supporting a glass roof (16x48), wooden benches, a ticket booth (32x32), luggage trolleys with trunks, a large station clock on a post (16x48), steam/smoke wisps (4-frame animation, 32x16).
```

### 13.5 Stadtkarte (Ortswahl zwischen den Fällen)
```
[STYLE BLOCK]
Pixel art city map screen, 480x270 px, not transparent: a hand-drawn-looking map of a foggy original Victorian city on yellowed paper, river winding through it, districts suggested by tiny building clusters (docks, old town, cathedral quarter, slums, wealthy hill), small circular markers where locations can be placed, fog patches covering undiscovered areas, ink stains and a compass rose. No readable text, no labels.
```

## 14. UI für Ansehen, Aufgaben und Wahrscheinlichkeit

### 14.1 Ansehen-Ränge (Abzeichen)
```
[STYLE BLOCK]
UI sheet of 5 police reputation rank badges, each 16x16 px, in a row (80x16), transparent background, 1px dark outline, getting more ornate from left to right: 1) dull tin button "outsider", 2) plain copper shield, 3) silver shield with one star, 4) polished brass shield with laurel, 5) gold star badge with a faint teal gem in the center. Same shape language across all five so they read as one progression.
```
Dieselben 5 Abzeichen nochmal in groß fürs Notizbuch/Rang-Aufstieg:
```
[STYLE BLOCK]
The same 5 police rank badges as large 32x32 pixel art icons in a row (160x32), more detail, transparent background.
```

### 14.2 Ansehen-Leiste und Änderungs-Popups
```
[STYLE BLOCK]
UI element: a horizontal police reputation bar, 64x8 px, brass frame with rivets, navy blue fill, plus 5 fill states stacked vertically (empty to full). Also two 16x16 floating popup icons: a small upward brass arrow with a badge (reputation gained) and a small downward rusty-red arrow with a cracked badge (reputation lost). Transparent background.
```

### 14.3 Gesperrte Infos
```
[STYLE BLOCK]
Small 16x16 UI icons, transparent background, 1px dark outline: a padlock with a tiny police badge on it (information locked until higher rank), the same padlock opened, a dialogue speech bubble with a padlock (locked conversation option), a file folder with a padlock (locked archive record). Muted brass and navy colors.
```

### 14.4 Wahrscheinlichkeit im Log (Vermutung → sehr wahrscheinlich)
Diese Marker zeigen, wie sicher ein Hinweis ist. Eine Info wird erst "sehr wahrscheinlich", wenn sie aus mindestens zwei Quellen stammt; davor ist sie nur Vermutung.
```
[STYLE BLOCK]
UI marker sheet for clue certainty in an investigation journal, each 16x16 px, in a row, transparent background:
1) "suspicion": a faint pencil-drawn question mark with a dashed outline, grey graphite color,
2) "very likely": a bold inked check mark inside a round rubber-stamp circle, deep navy ink,
3) "contradicted / false": a red-brown ink cross over a torn paper corner,
4) "unverified police information": a small police badge with a question mark,
5) source counter pips: three versions showing 0, 1 and 2 filled ink dots (2 of 2 = confirmed).
Style like hand-made marks on old paper.
```
```
[STYLE BLOCK]
Two journal entry background strips for the clue log, 160x24 px each, transparent background: 1) "suspicion" entry: thin pencil sketch lines, slightly faded and wobbly edges, a paperclip; 2) "very likely" entry: crisp ruled paper slip pinned with a brass tack, with a red-ink "approved" stamp shape in the corner (no readable text).
```
```
[STYLE BLOCK]
A small 32x32 rubber stamp animation strip, 4 frames in a row (128x32): an ink stamp coming down onto paper and lifting off, leaving a round navy "confirmed" mark (no readable text). Transparent background. Used when a clue becomes "very likely".
```

### 14.5 Aufgaben-Log (Quests)
```
[STYLE BLOCK]
UI frame for a quest log page, designed for 9-slice, 48x48 px from 16x16 pieces: a police case-file folder look, manila paper center, darker card edge, a paperclip on the top-left corner piece. Transparent outside the frame. No text.
```
```
[STYLE BLOCK]
Quest status icons, 16x16 px each, in a row, transparent background, 1px dark outline: main case (wax-sealed red folder), side task (small notebook page), new task (folder with an amber exclamation mark), completed (folder with navy ink check stamp), failed (folder with a torn edge and red cross), police assignment (folder with a tiny badge), occult lead (folder with a teal eye sigil).
```

### 14.6 Quellen-Symbole (woher eine Info stammt)
```
[STYLE BLOCK]
Source icons for clue origins, 16x16 px each, in a row, transparent background, 1px dark outline: police report (badge on paper), witness (speech bubble with a face silhouette), own observation (magnifying glass), document (scroll), rumour (two small overlapping speech bubbles, faded), newspaper (folded paper), spirit vision (teal eye). Consistent style, muted colors, only the spirit vision uses teal.
```

---

# Erweiterung 2: Inventar, Leben und Rundenkampf

Prompts für Inventar, Lebensanzeige und ein kleines Rundenkampf-System mit Timing (Ausweichen, Parieren, Angriffe im Takt). Alles eigene Designs. Wie immer **Style-Block aus Abschnitt 1 voranstellen**.

**Kampf-Festlegungen (Annahme, mit dem Prototyp abgestimmt):**

| Was | Größe |
|---|---|
| Kampfansicht | Seitenansicht, Spieler links, Gegner rechts, Bildschirm 480x270 |
| Kampf-Figuren (Spieler, menschliche Gegner) | 48x48 px pro Frame (größer als auf der Karte, damit Animationen lesbar sind) |
| Große Gegner / Boss | 64x64 oder 96x96 px pro Frame |
| Effekte | 32x32 oder 48x48 px pro Frame, 4 bis 6 Frames |
| Item-Icons | 16x16 px (Inventar), optional 32x32 für Detailansicht |

Für die Sheets gilt: Frames in einer Reihe, gleich groß, Figur steht auf derselben Grundlinie, transparenter Hintergrund.

## 14b. Erste Version: das braucht der Prototyp zuerst

Diese Assets sind im Spiel schon als Platzhalter vorgesehen, also am besten zuerst erzeugen. Die Item-IDs stammen aus dem Code; die Dateinamen für Kampf-Figuren und Hintergründe sind Vorschläge.

**Kampf (Prompts in Abschnitt 17):**

| Dateiname (Vorschlag) | Was | Größe | Prompt |
|---|---|---|---|
| `battle_player` | Spieler im Kampf | 48x48 | 17.2 |
| `enemy_holt` | Sergeant Holt, Übungskampf im Revier | 48x48 | 17.3 menschlich, Beschreibung unten |
| `enemy_nebelhund` | Nebelhund am Kanal in Ashgrove | 64x64 | 17.3 übernatürlich, Tabelle |
| `enemy_aschewaechter` | Aschewächter in der Krypta | 64x64 | 17.3 übernatürlich, Tabelle |
| `bg_revier`, `bg_ashgrove`, `bg_krypta` | Kampf-Hintergründe | 480x270 | 17.1 |

Beschreibung für Sergeant Holt im Übungskampf: `a heavyset desk sergeant in a police-blue uniform with rolled sleeves and a grey moustache, sparring stance with a padded wooden practice truncheon, good-natured but serious; defeated pose is him laughing and raising a hand to yield, not collapsing`. Als Hintergrund für den Revier-Kampf bei 17.1 als `[LOCATION]`: `a police station training room with a worn wooden floor, a rack of truncheons, a punching bag and a barred window`.

**Gegenstände (16x16, ein Icon pro Datei):**
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 7 icons in a row (112x16), transparent background, 1px dark outline, each centered:
1) plain oak walking cane with a rounded brass knob,
2) black police service truncheon with a leather wrist strap,
3) silver-plated cane sword, blade partly drawn from the dark cane, faint shine,
4) rolled linen bandage,
5) small brown tonic bottle with a cork and a cream label (a pharmacist's tonic),
6) small round tin of smelling salts with the lid open and pale crystals,
7) small cloth pouch of white warding salt with a faint teal sparkle.
```
| Nr. | ID | Name im Spiel | Typ |
|---|---|---|---|
| 1 | `spazierstock` | Eichenstock | Waffe |
| 2 | `schlagstock` | Dienstschlagstock | Waffe |
| 3 | `stockdegen` | Versilberter Stockdegen | Waffe |
| 4 | `verband` | Verband | Verbrauch |
| 5 | `tonikum` | Fenwicks Tonikum | Verbrauch |
| 6 | `riechsalz` | Riechsalz | Verbrauch |
| 7 | `bannsalz` | Bannsalz | Verbrauch |

Ausrüstung: Vorerst gibt es nur einen Slot (Waffe). Mantel, Hut und Amulett in 15.4 sind für später.

## 15. Inventar und Gegenstände

### 15.1 Heil- und Verbrauchsgegenstände (16x16)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 8x2 grid, transparent background, 1px dark outline, each icon centered: small brown tonic bottle with a red label (heals), large tonic bottle, rolled linen bandage, smelling salts tin (restores nerves), calming herbal tea tin, flask of lantern oil, matchbox, sugar cubes in paper, laudanum-style dark vial with a skull-free warning label shape (risky healing), blessed candle stub, small vial of glowing teal ward-water, salt pouch, iron nails bundle, silver coin, sandwich wrapped in paper, pocket flask.
```

### 15.2 Waffen und Ausrüstung (16x16)
```
[STYLE BLOCK]
Equipment icon sheet, 16x16 px per icon, 8x2 grid, transparent background, 1px dark outline: walking cane with a brass knob, cane sword partly drawn, police truncheon, small six-shot revolver, box of silver bullets, hunting knife, brass knuckles, iron crowbar, oil lantern, bullseye police lantern, long dark coat (armor), leather gloves, bowler hat, protective amulet with a teal stone, pocket mirror (reflects curses), rosary-like string of plain beads (no religious symbols).
```

### 15.3 Fall-Gegenstände und Schlüssel (16x16)
```
[STYLE BLOCK]
Key item icon sheet, 16x16 px per icon, in a row, transparent background, 1px light rim so they stand out: brass door key, iron crypt key, small music-box key, ring of keys, police badge, folded city map, sealed letter, train ticket, pocket watch, photograph, notebook, archive pass card.
```

### 15.4 Inventar-Oberfläche
```
[STYLE BLOCK]
Pixel art inventory screen background, 480x270 px, not transparent: an open worn leather satchel seen from above, left side a 6x4 grid of empty item slots (each 20x20 px, slightly recessed, dark leather with stitched borders), right side an empty parchment panel for item details, a strip at the bottom with 4 equipment slots (weapon, coat, hat, charm) shown as faint outlined silhouettes. Muted browns, brass rivets, no text.
```
```
[STYLE BLOCK]
UI sprite sheet for inventory slots, transparent background: an empty slot 20x20 px, the same slot highlighted with a warm amber border, selected with a brighter amber border and corner ticks, disabled/greyed slot, and a small item-count badge (8x8 dark circle) for stacks.
```
```
[STYLE BLOCK]
Tooltip frame for item descriptions, designed for 9-slice, 48x48 px from 16x16 pieces: dark parchment with a thin brass border and tiny corner rivets, transparent outside. No text.
```

## 16. Leben und Status

### 16.1 Lebens- und Nervenanzeige (Karte)
```
[STYLE BLOCK]
HUD sheet, transparent background: a health bar 64x8 px with a brass frame and deep red fill, plus 5 fill states stacked vertically; a nerves bar in the same frame style with teal (#6fe0d0) fill and 5 states; a small 16x16 heart icon in 3 states (full, half, empty) styled as an anatomical-looking stitched red heart; a 16x16 brain/eye icon for nerves. Muted colors, crisp pixels.
```
```
[STYLE BLOCK]
Small 16x16 popup icons for the overworld HUD, 4 frames each in a row for a short bob animation: red plus (healed), cracked red heart (damaged), teal swirl (nerves lost), teal sparkle (nerves restored). Transparent background.
```

### 16.2 Status-Effekte (16x16)
```
[STYLE BLOCK]
Status effect icon sheet, 16x16 px each, in a row, transparent background, 1px dark outline, round badge shape: bleeding (red drop), fear (wide eye with sweat drop), burning (amber flame), frozen/chill (pale blue frost), stunned (circling stars made of small sparks), poisoned (green bubble), marked (teal eye-in-circle target), shielded (brass shield), focused (amber crosshair), weakened (broken sword).
```

## 17. Rundenkampf

### 17.1 Kampf-Hintergründe (480x270)
Für jeden Ort einen. Unten etwa 70 px freie, flache Bodenfläche lassen, auf der die Figuren stehen.
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [LOCATION]. Layered for depth (far silhouettes, mid buildings, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the middle area. Fog layers, gas lamp glow, muted palette. No characters, no text.
```
Werte für `[LOCATION]`:
- `a foggy cobblestone street at night with gas lamps and a canal bridge (Ashgrove Lane)`
- `a cemetery at night with gravestones, dead trees and a burned chapel ruin (St. Ebba)`
- `an underground crypt with burial niches, many candles and a faintly glowing teal ritual circle on the floor`
- `a back alley behind the police station with crates, puddles and a barred window`
- `the docks at night with stacked crates, a crane and dark water`

### 17.2 Spieler im Kampf (48x48)
```
[STYLE BLOCK]
Side-view battle sprite sheet for the player investigator (long dark grey coat, flat cap, scarf, satchel, pale face, short dark hair), facing right, 48x48 px per frame, transparent background, consistent baseline. Rows:
1) idle stance with a walking cane, 4 frames;
2) cane strike attack, 6 frames (wind-up, swing, impact, recover);
3) revolver shot, 5 frames with a small muzzle flash;
4) dodge: quick backstep with a dithered afterimage, 4 frames;
5) parry: cane raised to block with a spark on contact, 4 frames;
6) using an item (drinking a tonic), 4 frames;
7) hurt recoil, 3 frames;
8) knocked down, 4 frames;
9) occult skill: hand raised, teal light swirling, 6 frames.
Sheet width 288 px (6 frames), rows padded with empty frames where shorter.
```

### 17.3 Gegner (eigene Designs)
Vorlage für menschliche Gegner (48x48):
```
[STYLE BLOCK]
Side-view battle sprite sheet for an enemy: [DESCRIPTION], facing left, 48x48 px per frame, transparent background, consistent baseline. Rows: idle (4 frames), attack with a clear readable wind-up pose before the hit (6 frames, the wind-up must be held for 2 frames so the player can time a dodge or parry), hurt (3 frames), defeated (4 frames). Sheet width 288 px.
```
| Gegner | `[DESCRIPTION]` |
|---|---|
| Kultist | a hooded cultist in a long charcoal robe with a faint violet eye-in-a-circle sigil, wielding a ritual dagger |
| Kult-Fanatiker | a gaunt fanatic in a torn grey choir robe, holding a burning hymn book that shoots small teal flames |
| Schläger | a burly street thug in a flat cap and rolled sleeves, swinging a short iron pipe |
| Besessener Constable | a constable in a navy uniform whose eyes glow teal, moving stiffly like a puppet, swinging a truncheon |
| Grabräuber | a hunched grave robber in muddy rags with a lantern and a shovel |

Vorlage für übernatürliche Gegner (64x64):
```
[STYLE BLOCK]
Side-view battle sprite sheet for a supernatural enemy: [DESCRIPTION], facing left, 64x64 px per frame, transparent background. Rows: idle floating or breathing loop (4 frames), attack with a clearly telegraphed wind-up (6 frames), special attack (6 frames), hurt (3 frames), dissolving defeat (6 frames). Use dithering for transparency, no blur. Teal is the only bright color.
```
| Gegner | `[DESCRIPTION]` |
|---|---|
| Nebelgeist | a wraith made of drifting fog with long thin arms and two teal points for eyes |
| Aschewächter (Krypta) | a tall figure made of grey ash wearing a scorched choir robe, embers glowing in its cracks; instead of a face a glowing teal eye inside a circle |
| Nebelhund (Ashgrove, Kanal) | a gaunt supernatural hound that rises out of the canal fog, body half made of drifting mist, dark wet fur at the core, two glowing teal (#6fe0d0) eyes like the eye-in-a-circle seal |
| Spieluhr-Puppe | a life-sized jointed wooden doll in a red lacquered dress with a wind-up key in its back, moving in jerky clockwork steps |
| Chorschatten | three faceless floating choir silhouettes in grey robes singing, sound waves drawn as teal rings |

**Boss (96x96):**
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, transparent background: a tall elegant choir director woman in a long grey high-collared coat, surrounded by floating sheets of music and an eye-in-a-circle halo of teal light; her shadow stretches into a large eye shape. Rows: idle (4 frames), conducting attack that sends sheets of music flying (6 frames), scream attack with teal sound rings (6 frames), phase-2 transformation where the halo grows and her eyes glow (6 frames), hurt (3 frames), defeat collapsing into falling paper (6 frames).
```

### 17.4 Kampf-Oberfläche
```
[STYLE BLOCK]
Battle command menu UI, transparent background: a vertical panel 96x80 px with dark parchment and brass frame, four empty rows for commands, plus 16x16 command icons in a row: attack (cane), shoot (revolver), occult skill (teal eye), item (satchel), defend (shield), flee (running boot). A small amber pointer arrow (8x8, 2 frames) for the selected row. No text.
```
```
[STYLE BLOCK]
Turn order timeline UI for the top of the battle screen, transparent background: a horizontal brass rail 200x20 px with 6 empty round portrait sockets (16x16 each), one socket highlighted in amber for the active turn, and a small down-pointing marker. Also 16x16 round mini portraits: player investigator, Sergeant Holt, fog hound, ash warden in a choir robe with an eye-in-circle face, cultist, wind-up doll.
```
```
[STYLE BLOCK]
Battle HUD sheet, transparent background: compact HP bar 48x6 with brass frame and red fill (5 states), nerves bar 48x6 with teal fill (5 states), action point pips (8x8: empty, full amber, full glowing), an enemy HP bar 48x4 in dark red with a skull-free simple frame, a target cursor (16x16, 4-frame pulsing amber bracket) to place over enemies.
```

### 17.5 Timing-Prompts (Ausweichen, Parieren, Angriffe im Takt)
Optional: Im Prototyp werden der schrumpfende Ring und die Angriffsleiste im Code gezeichnet. Diese Prompts nur nehmen, falls sie später durch Grafiken ersetzt werden sollen.
```
[STYLE BLOCK]
Timing input indicator sheet for a turn-based battle with real-time reactions, transparent background:
1) a shrinking ring prompt: 32x32 px, 8 frames of an amber ring closing in on a small center circle;
2) the same ring flashing white-gold on a perfect hit (3 frames);
3) a "parry" result icon: crossed cane and spark, 24x24, 4-frame burst;
4) a "dodge" result icon: boot with motion lines, 24x24, 4-frame burst;
5) a "miss" icon: cracked grey ring, 24x24, 3 frames;
6) key prompt buttons 16x16 in a parchment style for keyboard keys (blank keycap, so the game can draw the letter), normal and pressed.
No text.
```
```
[STYLE BLOCK]
Rhythm attack bar UI, transparent background: a horizontal track 160x16 px with brass ends, 3 to 5 beat markers (amber diamonds 8x8, normal and hit states), and a moving needle (4x16). Used for timed attack combos.
```

### 17.6 Treffer-Effekte
```
[STYLE BLOCK]
Battle hit effect animation strips, each frame 32x32 px, frames in a row, transparent background, crisp pixels, no blur:
1) cane strike impact: white-amber burst, 5 frames;
2) slash: thin curved white streak, 4 frames;
3) gunshot hit: small sparks and smoke puff, 5 frames;
4) parry clash: bright gold-white star spark, 4 frames;
5) occult blast: teal ring expanding with eye shape in the center, 6 frames;
6) fire: amber flames rising, 6 frames;
7) heal: soft red plus symbols floating up, 5 frames;
8) nerves damage: teal static/glitch pixels around the head area, 5 frames;
9) critical hit: large white-gold starburst, 48x48, 5 frames.
```
```
[STYLE BLOCK]
Pixel font sheet for floating battle numbers, transparent background: digits 0-9, plus and minus signs, each glyph 8x10 px, chunky outlined style, in 4 color variants as separate rows: white (normal damage), amber (critical), red (damage to player), teal (nerves). Every glyph aligned on an 8x10 grid.
```

### 17.7 Kampf-Übergänge
```
[STYLE BLOCK]
Battle start transition, 480x270 px per frame, 6 frames in a row: dark fog and ink tendrils closing in from the edges until the screen is black, with a faint teal eye shape briefly visible in the center on frame 5. Transparent where not covered.
```
```
[STYLE BLOCK]
Victory and defeat banners, transparent background: a victory banner 160x32 px as a brass plaque with laurel ends and empty center for text, and a defeat banner in cracked dark iron with a faint red tint, same size. No text.
```

---

# Erweiterung 3: Fall 3 und neue Nebenaufträge

## 18. Fall 3: Kanalhafen und Lagerhaus 7 (Priorität)

Der Kanalhafen nutzt schon das Docks-Tileset (13.1) und die Fassaden aus Ashgrove. Hier fehlt vor allem das Innere von Lagerhaus 7 und eigene Sheets für die neuen Figuren.

### 18.1 Lagerhaus 7 (Innen-Tileset)
```
[STYLE BLOCK]
Interior tileset, 16x16 tiles, for an abandoned canal-side warehouse used secretly by a cult, top-down 3/4 view: rough wide wooden floorboards with gaps and oil stains (3 variations), rotten broken floorboards, brick interior walls with peeling whitewash and wall edges/corners, a large closed loading door (32x32), high grimy windows with a faint moonbeam, wooden support pillars (16x32), cobwebs, scattered straw. Arranged 8x6, seamless.
```
```
[STYLE BLOCK]
Prop sheet for a cult hideout inside a warehouse, 16px grid, transparent background: improvised altar made of crates covered with a grey cloth (32x16), clusters of black and grey candles (16x16, 3 variations), a chalk circle with an eye-in-a-circle sigil drawn across 3x3 tiles (faint teal glow), stacks of broken crates (16x32), a pile of torn hymn sheets (16x16), a row of grey hooded robes hanging on nails (32x32), a rusty chain hoist hanging from the ceiling (16x48), an overturned chair (16x16).
```

### 18.2 Neue Figuren (Lauf-Sheet 16x32 + Portrait 64x64)
Mit den Figuren-Vorlagen oben:

| Figur | `[DESCRIPTION]` |
|---|---|
| Dr. Fenwick (Polizeiarzt) | a lean middle-aged police surgeon in a black frock coat with rolled-up white shirt sleeves, rubber apron, round spectacles, neatly trimmed grey beard, leather medical bag |
| Agnes Crane | a frail elderly widow in a faded black mourning dress and shawl, white hair under a black lace cap, once a choir singer, holding an old hymn book to her chest, sad watchful eyes |
| Pip (Zeitungsjunge) | a small cheeky newspaper boy with a grey newsboy cap, oversized patched jacket, a canvas bag of newspapers on his shoulder, freckles, gap-toothed grin |
| Tobias Lowe (Hafenarbeiter) | a broad young dock worker with a dark knit cap, heavy brown wool jacket, rope coil over one shoulder, scarred hands, worried frown |
| Chorfanatiker | a cult fanatic in a long grey hooded choir robe, face half hidden, gaunt chin, a small eye-in-a-circle pendant, holding a hymn book |

### 18.3 Geist „Nate“ (nur in der Geistsicht)
```
[STYLE BLOCK]
Overworld sprite sheet for a drowned ghost: a young man in soaked working clothes, wet hair plastered to his face, water dripping, pale blue-grey skin, sad empty eyes. Translucency simulated with a checker dither pattern (no real alpha blur), faint teal outline glow. Frame size 16x32, 4 rows (down, left, right, up) x 4 frames of a slow floating idle/walk. Total 64x128, transparent background.
```
Portrait dazu (64x64): `a drowned young man's ghost with wet hair over his face, pale blue-grey skin, water drops, translucent dithered edges, faint teal glow, melancholic expression`.

### 18.4 Kampf-Sprites
Mit der Vorlage aus 17.3 (menschlich, 48x48):
- **Chorfanatiker:** `a cult fanatic in a long grey hooded choir robe, gaunt face in shadow, attacks by swinging a heavy brass censer on a chain that leaves a trail of grey smoke`
- **Constable Rook:** `a young blond constable in a navy uniform and tall helmet, cold determined face, fighting stance with a truncheon, a small violet eye-in-a-circle pin visible on his collar; when hurt his eyes flicker teal`

Mit der Vorlage aus 17.3 (übernatürlich, 64x64):
- **Aktenfresser:** `a writhing swarm of rats tangled together into one mass with shredded paper files and ink-stained scraps stuck in it; one larger rat at the front has an eye-in-a-circle sigil burned into its forehead that glows teal; attacks by surging forward and spitting paper shreds`

### 18.5 Props (16px-Raster)
```
[STYLE BLOCK]
Prop sheet, transparent background, 16px grid: a dented metal police locker with a small padlock (16x32), an empty wooden church bell frame with a broken rope, the bell missing (32x32), a boot rack with several pairs of muddy constable boots (32x16).
```

### 18.6 Item-Icons (16x16)
```
[STYLE BLOCK]
Two 16x16 item icons in a row, transparent background, 1px dark outline, 1px light rim: 1) an engraved silver pocket watch, lid open, fine engraving on the lid; 2) a small soot-blackened church hand bell from St. Ebba with a cracked rim and a faint eye-in-a-circle mark.
```

---

# Erweiterung 4: Altmarkt und Taverne „Zum Ertrunkenen Mond“

## 19. Altmarkt, Taverne und neue Figuren

### 19.1 Altmarkt-Tileset
```
[STYLE BLOCK]
Tileset of 16x16 tiles for an old market square in a foggy Victorian city at night: worn cobblestone square (3 variations) with a circular paving pattern around the center, a stone fountain with a weathered round basin and dark water (48x48, built from tiles, plus 4 frames of a small water-ripple animation), market stalls with striped canvas awnings in faded red, ochre and slate blue (32x32 each, 3 color variations, one closed with a tarp), empty crates and baskets of vegetables, a chapel facade segment in grey stone with a pointed arch door, a small rose window and soot streaks (48x48, built from tiles). Arranged on a grid, seamless ground tiles.
```

### 19.2 Taverne „Zum Ertrunkenen Mond“ (Innen)
```
[STYLE BLOCK]
Interior tileset and props for a smoky dockside tavern, top-down 3/4 view, 16px grid: dark sticky wooden floorboards (3 variations), wood-paneled walls with a few hanging lanterns, wall edges and corners, a long bar counter with taps and bottles behind it (built from 16x16 pieces, straight, corner, end), round tables with stools (32x32), a corner booth with a bench (32x32), stacked barrels (16x32) and a single barrel on its side (16x16), a fireplace (32x32), a tavern sign shape on the wall showing a pale moon sinking into waves (32x16, no text), mugs and a dice cup on a table (16x16), a staircase going up (16x32). Warm amber light from lanterns and fire, muted browns.
```

### 19.3 Prop: Spiegel mit Goldrahmen
```
[STYLE BLOCK]
Prop sprite, transparent background: a tall standing mirror with an ornate tarnished gold frame, dark reflective glass with a faint cold sheen, 16x32 px. Second variant next to it: the same mirror with a faint teal shimmer and a barely visible silhouette in the glass (supernatural state).
```

### 19.4 Neue Figuren (Lauf-Sheets 64x128, plus Portraits 64x64)
Mit den Figuren-Vorlagen oben:

| Figur | `[DESCRIPTION]` |
|---|---|
| Maud (Wirtin) | a sturdy broad-shouldered tavern keeper woman with curly red hair tied back, rolled sleeves, stained white apron over a brown dress, strong arms, a rag over her shoulder |
| Silas (Falschspieler) | an elegant card sharp in a fitted dark green waistcoat and long coat, a silk neckerchief in wine red, slicked black hair, thin moustache, a playing card between his fingers |
| Der blinde Ned (Bettler) | an old blind beggar in layered grey rags, a cloth tied over his eyes, both hands wrapped in dirty bandages, leaning on a crooked stick |
| Mr. Quill (Antiquar) | a gaunt tall antique dealer with a jeweller's loupe screwed into one eye, threadbare velvet waistcoat, sleeve garters, long ink-stained fingers |
| Pater Ambrose (Priester) | a middle-aged priest in a black cassock covered with pale candle-wax drips, white collar, short grey hair, tired kind eyes, holding a candle |
| Wick (Lampenanzünder) | an old lamplighter in a weathered dark blue coat and cap, white stubble, carrying a long brass lamplighter's pole with a small flame at the tip |
| Marktwart Grimes | a fat market constable in a tight navy uniform with brass buttons straining, tall helmet, red cheeks, a small notebook and pencil in hand |

