# Codex-Batch C: Figuren, Portraits, Orte und kommende Fälle

**Batch-Name:** `welt` (Manifest: `public/sprites/manifest-welt.json`)

Im Spiel sind inzwischen 27 benannte Figuren und 9 Orte. Viele nutzen noch generische Sprites oder haben kein Portrait. Diese Datei schließt alle Lücken und legt einen Vorrat für die nächsten Fälle an.

**Reihenfolge:** 1 (Lauf-Sheets) → 2 (Portraits) → 3 bis 6 (Orte der vorhandenen Fälle) → 7 (UI-Reste) → 8 (Atmosphäre) → 9 (kommende Fälle).

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

## 1. Eigene Lauf-Sheets (16x32, 64x128)

Diese Figuren laufen im Spiel noch mit generischen Sheets herum.
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, grid-aligned, 1px dark outline, same proportions as the existing 16x32 characters in public/sprites/characters/12_*.png.
```
| ID | Name | `[BESCHREIBUNG]` |
|---|---|---|
| `pimm` | Miss Pimm | a thin records clerk woman with auburn red-brown hair in a bun, olive-grey dress and cardigan, half-moon spectacles, armful of files, dust on her sleeves |
| `fenwick` | Dr. Fenwick | a lean middle-aged police surgeon in a black frock coat with rolled-up white shirt sleeves, rubber apron, round spectacles, neatly trimmed grey beard, leather medical bag |
| `agnes` | Agnes Crane | a frail elderly widow in a faded black mourning dress and shawl, white hair under a black lace cap, once a choir singer, holding an old hymn book to her chest, sad watchful eyes |
| `pip` | Pip | a small cheeky newspaper boy with a grey newsboy cap, oversized patched jacket, a canvas bag of newspapers on his shoulder, freckles, gap-toothed grin |
| `tobias` | Tobias Lowe | a broad young dock worker with a dark knit cap, heavy brown wool jacket, rope coil over one shoulder, scarred hands, worried frown |
| `cultist` | Chorfanatiker | a cult fanatic in a long grey hooded choir robe, face half hidden, gaunt chin, a small eye-in-a-circle pendant, holding a hymn book |
| `maud` | Maud | a sturdy broad-shouldered tavern keeper woman with curly red hair tied back, rolled sleeves, stained white apron over a brown dress, strong arms, a rag over her shoulder |
| `silas` | Silas | an elegant card sharp in a fitted dark green waistcoat and long coat, a silk neckerchief in wine red, slicked black hair, thin moustache, a playing card between his fingers |
| `ned` | Der blinde Ned | an old blind beggar in layered grey rags, a cloth tied over his eyes, both hands wrapped in dirty bandages, leaning on a crooked stick |
| `quill` | Mr. Quill | a gaunt tall antique dealer with a jeweller's loupe screwed into one eye, threadbare velvet waistcoat, sleeve garters, long ink-stained fingers |
| `ambrose` | Pater Ambrose | a middle-aged priest in a black cassock covered with pale candle-wax drips, white collar, short grey hair, tired kind eyes, holding a candle |
| `wick` | Wick | an old lamplighter in a weathered dark blue coat and cap, white stubble, carrying a long brass lamplighter's pole with a small flame at the tip |
| `grimes` | Marktwart Grimes | a fat market constable in a tight navy uniform with brass buttons straining, tall helmet, red cheeks, a small notebook and pencil in hand |

Ablage: `public/sprites/characters/C_<id>_walk.png`.

### 1.1 Geist „Nate“ (nur in der Geistsicht sichtbar)
```
[STYLE BLOCK]
Overworld sprite sheet for a drowned ghost: a young man in soaked working clothes, wet hair plastered to his face, water dripping, pale blue-grey skin, sad empty eyes. Translucency simulated with a checker dither pattern (no real alpha blur), faint turquoise outline glow. 16x32 per frame, 4 rows (down, left, right, up) x 4 frames of slow floating. 64x128, transparent background.
```
Ablage: `public/sprites/characters/C_nate_walk.png`.

### 1.2 Spieler-Extras
```
[STYLE BLOCK]
Overworld sprite sheet for the player investigator (long dark grey coat, flat cap, scarf, satchel), 16x32 per frame, transparent background, same proportions as public/sprites/characters/03_01_investigator_walk.png. Rows of 4 frames: 1) opening a door (facing up), 2) picking up an item (facing down), 3) reading a note (facing down), 4) sitting down to rest (facing down), 5) holding up a police badge (facing right), 6) shivering in the cold (facing down).
```
Ablage: `public/sprites/characters/C_player_extras.png`.

## 2. Portraits (Emotions-Sheets 256x64)

Bisher haben nur Marlowe und die generischen Figuren Portraits.
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious (narrowed eyes), shocked (wide eyes, pale), smiling faintly. Bust shot facing slightly right, simple dark slate vignette background (not transparent), expressive but restrained face, identical framing, lighting and palette across all four. Character: [BESCHREIBUNG].
```
| ID | Name | `[BESCHREIBUNG]` |
|---|---|---|
| `holt` | Sergeant Holt | a heavyset desk sergeant in a police-blue uniform with rolled sleeves, ink-stained fingers, reading glasses on a cord, grey moustache |
| `pimm` | Miss Pimm | a thin records clerk woman with auburn red-brown hair in a bun, olive-grey dress and cardigan, half-moon spectacles, armful of files, dust on her sleeves |
| `rook` | Constable Rook | a young blond constable in a navy uniform and tall helmet, friendly open face, polite smile that does not reach his eyes; one small hidden detail: a tiny violet eye-in-a-circle pin under his collar (he is secretly a cultist, keep it subtle) |
| `barnaby` | Barnaby | a ragged grey-haired old prisoner in a torn shirt and braces, unshaven, hunched, wrists in iron cuffs, knowing grin |
| `elias` | Elias Thorne | an elderly grey-haired lamplighter in a patched grey-brown coat, grey beard, frightened expression, holding his hands close to his chest (variant for case 1: frost on shoulders and beard; after case 1 he hangs around the police station) |
| `greta` | Greta | a sharp-eyed flower seller woman in a patched shawl and long skirt, basket of wilted flowers, hair tied in a scarf |
| `halloway` | Mr. Halloway | a thin pawnbroker in a worn velvet waistcoat, sleeve garters, pince-nez, slicked-back thinning hair, nervous smile |
| `price` | Constable Price | a broad, weary night constable in a dark navy uniform with brass buttons and a tall helmet, ruddy cheeks, bullseye lantern at the belt |
| `kit` | Kit | a scrappy street kid in a far too large brown coat with rolled-up sleeves, flat cap pulled low, dirty cheeks, bright clever eyes, bare ankles and worn boots |
| `ivy` | Ivy Marsh | a determined teenage girl with strawberry-blonde hair in a loose braid, blue-grey wool coat, scuffed boots, worried but stubborn face |
| `anselm` | Küster Anselm | an old frail church sexton in a black cassock, wild white hair, hunched, holding a ring of keys and a candle |
| `moll` | Moll | a coarse broad gravedigger with an earth-brown coat, muddy boots, rough stubble, carrying a spade with a notch in the blade |
| `hester` | Hester Marsh | Ivy's older sister in a white nightgown, bare feet, long loose strawberry-blonde hair, blank entranced stare, eyes faintly glowing teal |
| `fenwick` | Dr. Fenwick | a lean middle-aged police surgeon in a black frock coat with rolled-up white shirt sleeves, rubber apron, round spectacles, neatly trimmed grey beard, leather medical bag |
| `agnes` | Agnes Crane | a frail elderly widow in a faded black mourning dress and shawl, white hair under a black lace cap, once a choir singer, holding an old hymn book to her chest, sad watchful eyes |
| `pip` | Pip | a small cheeky newspaper boy with a grey newsboy cap, oversized patched jacket, a canvas bag of newspapers on his shoulder, freckles, gap-toothed grin |
| `tobias` | Tobias Lowe | a broad young dock worker with a dark knit cap, heavy brown wool jacket, rope coil over one shoulder, scarred hands, worried frown |
| `cultist` | Chorfanatiker | a cult fanatic in a long grey hooded choir robe, face half hidden, gaunt chin, a small eye-in-a-circle pendant, holding a hymn book |
| `miriam` | Miriam Vey | an elegant choir director woman in a long grey coat with a high collar, dark hair tightly pinned, calm cold smile, holding a folder of sheet music; a small eye-in-a-circle brooch at her throat |
| `maud` | Maud | a sturdy broad-shouldered tavern keeper woman with curly red hair tied back, rolled sleeves, stained white apron over a brown dress, strong arms, a rag over her shoulder |
| `silas` | Silas | an elegant card sharp in a fitted dark green waistcoat and long coat, a silk neckerchief in wine red, slicked black hair, thin moustache, a playing card between his fingers |
| `ned` | Der blinde Ned | an old blind beggar in layered grey rags, a cloth tied over his eyes, both hands wrapped in dirty bandages, leaning on a crooked stick |
| `quill` | Mr. Quill | a gaunt tall antique dealer with a jeweller's loupe screwed into one eye, threadbare velvet waistcoat, sleeve garters, long ink-stained fingers |
| `ambrose` | Pater Ambrose | a middle-aged priest in a black cassock covered with pale candle-wax drips, white collar, short grey hair, tired kind eyes, holding a candle |
| `wick` | Wick | an old lamplighter in a weathered dark blue coat and cap, white stubble, carrying a long brass lamplighter's pole with a small flame at the tip |
| `grimes` | Marktwart Grimes | a fat market constable in a tight navy uniform with brass buttons straining, tall helmet, red cheeks, a small notebook and pencil in hand |
| `nate` | Nate (Geist) | a drowned young man's ghost with wet hair over his face, pale blue-grey skin, water drops, translucent dithered edges, faint turquoise glow, melancholic |

Ablage: `public/sprites/portraits/C_<id>_emotions.png`.

**Zusatz-Sets** (gleiche Vorlage, andere Emotionen):
- Polizei-Emotionen für `holt`, `pimm`, `rook`, `price`, `grimes`: `neutral, skeptical (one raised eyebrow), approving (slight nod), angry (furrowed brow)`, Ablage `C_<id>_police_emotions.png`. Zeigt dem Spieler, wie sein Ansehen steht.
- `miriam`: `serene, amused, cold contempt, eyes glowing faint turquoise`, Ablage `C_miriam_special.png`.
- `rook`: `friendly mask, slipping smile, cold stare, eyes glowing turquoise`, Ablage `C_rook_reveal.png` (für die Enthüllung als Kultist).
- `hester`: `entranced blank stare, waking up confused, crying with relief, faint smile`, Ablage `C_hester_states.png`.

## 3. Lagerhaus 7 (Fall 3)
```
[STYLE BLOCK]
Interior tileset, 16x16 tiles, for an abandoned canal-side warehouse used secretly by a cult, top-down 3/4 view: rough wide wooden floorboards with gaps and oil stains (3 variations), rotten broken floorboards, brick interior walls with peeling whitewash and wall edges/corners, a large closed loading door (32x32), high grimy windows with a faint moonbeam, wooden support pillars (16x32), cobwebs, scattered straw. Arranged 8x6, seamless.
```
```
[STYLE BLOCK]
Prop sheet for a cult hideout inside a warehouse, 16px grid, transparent background: improvised altar made of crates covered with a grey cloth (32x16), clusters of black and grey candles (16x16, 3 variations), a chalk circle with an eye-in-a-circle sigil drawn across 3x3 tiles (faint turquoise glow), stacks of broken crates (16x32), a pile of torn hymn sheets (16x16), a row of grey hooded robes hanging on nails (32x32), a rusty chain hoist hanging from the ceiling (16x48), an overturned chair (16x16).
```
Ablage: `public/sprites/tilesets/C_03_lagerhaus_tiles.png`, `public/sprites/props/C_03_lagerhaus_props.png`.

## 4. Altmarkt
```
[STYLE BLOCK]
Tileset of 16x16 tiles for an old market square in a foggy Victorian city at night: worn cobblestone square (3 variations) with a circular paving pattern around the center, a stone fountain with a weathered round basin and dark water (48x48 built from tiles, plus 4 frames of a small water-ripple animation), market stalls with striped canvas awnings in faded red, ochre and slate blue (32x32 each, 3 color variations, one closed with a tarp), crates and baskets of vegetables, a chapel facade segment in grey stone with a pointed arch door, a small rose window and soot streaks (48x48 built from tiles). Seamless ground tiles.
```
```
[STYLE BLOCK]
Prop sheet, transparent background, 16px grid: a tall standing mirror with an ornate tarnished gold frame and dark glass (16x32); the same mirror with a faint turquoise shimmer and a barely visible silhouette in the glass; the same mirror cracked; a frosted gas lamp covered in ice (16x48); a market notice board (16x32); a weighing scale on a post (16x32); a fruit cart (32x16).
```
Ablage: `public/sprites/tilesets/C_04_altmarkt_tiles.png`, `public/sprites/props/C_04_altmarkt_props.png`.

## 5. Taverne „Zum Ertrunkenen Mond“
```
[STYLE BLOCK]
Interior tileset and props for a smoky dockside tavern, top-down 3/4 view, 16px grid: dark wooden floorboards (3 variations), wood-paneled walls with hanging lanterns, wall edges and corners, a long bar counter with taps and bottles behind it (straight, corner and end pieces), round tables with stools (32x32), a corner booth (32x32), stacked barrels (16x32) and a barrel on its side (16x16), a fireplace (32x32, 4-frame fire), a sign showing a pale moon sinking into waves (32x16, no text), mugs and a dice cup on a table (16x16), a chalkboard (16x16, only scribbles), a narrow bed in a small room (16x32), a staircase going up (16x32). Warm amber light, muted browns.
```
Ablage: `public/sprites/tilesets/C_05_taverne.png`.

## 6. Revier-Ergänzungen und Bahnhof
```
[STYLE BLOCK]
Prop sheet, transparent background, 16px grid: a dented metal police locker with a small padlock (16x32), an empty wooden church bell frame with a broken rope and no bell (32x32), a boot rack with muddy constable boots (32x16), a cot in a cell (16x32), a small rest-room cot with a grey blanket (16x32), a tea kettle on a small stove (16x16).
```
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a soot-blackened Victorian railway station platform at night: stone platform edge, rail tracks with sleepers (horizontal, vertical, curve), iron pillars supporting a glass roof (16x48), wooden benches, a ticket booth (32x32), luggage trolleys with trunks, a large station clock on a post (16x48, clock face without numbers).
```
Ablage: `public/sprites/props/C_06_revier_extra.png`, `public/sprites/tilesets/C_06_bahnhof_tiles.png`.

## 7. Notizbuch: Vermutung und sehr wahrscheinlich
Eine Info ist im Spiel erst „sehr wahrscheinlich“, wenn sie aus zwei Quellen stammt, davor nur „Vermutung“; falsche Infos werden „widerlegt“.
```
[STYLE BLOCK]
UI marker sheet for clue certainty in an investigation journal, each 16x16 px, in a row, transparent background: 1) suspicion: faint pencil-drawn question mark with a dashed outline in grey graphite; 2) very likely: bold inked check mark inside a round rubber-stamp circle in deep navy ink; 3) refuted: red-brown ink cross over a torn paper corner; 4) unverified police information: small police badge with a question mark; 5) source counter pips: three versions with 0, 1 and 2 filled ink dots. Hand-made marks on old paper.
```
```
[STYLE BLOCK]
Two journal entry background strips, 160x24 px each, transparent background: 1) suspicion entry: thin pencil sketch lines, slightly faded wobbly edges, a paperclip; 2) very likely entry: crisp ruled paper slip pinned with a brass tack, a round stamp shape in the corner (no text).
```
Ablage: `public/sprites/ui/C_07_log_markers.png`, `C_07_log_strips.png`.

## 8. Atmosphäre und Leben in der Stadt
```
[STYLE BLOCK]
Ambient creature sprite sheet, transparent background, 16x16 per frame, one row per creature, 4 frames each: 1) a rat scurrying (side view), 2) a crow hopping, 3) a crow taking off, 4) a black cat walking, 5) a black cat sitting and blinking, 6) moths fluttering around a lamp, 7) a stray dog sniffing, 8) pigeons pecking.
```
```
[STYLE BLOCK]
Weather overlay tiles, each 64x64 px seamless and loopable, transparent background: 1) light rain streaks, 4 frames; 2) heavy rain, 4 frames; 3) falling snow, 4 frames; 4) drifting ash flakes, 4 frames; 5) ground-level fog wisps, 6 frames; 6) puddle splash rings, 16x16, 4 frames.
```
```
[STYLE BLOCK]
City map location markers, 16x16 each, transparent background, 1px dark outline, same hand-drawn ink style: police station (badge), canal lane (lamp), cemetery (gravestone), docks (anchor), old market (fountain), tavern (mug), night market (crow on a bridge), warehouse (crate), theatre (mask), clock tower (clock), slaughterhouse (hook), gasworks (pipe valve), observatory (telescope); each with a normal and an amber highlighted state.
```
Ablage: `public/sprites/fx/C_08_creatures.png`, `C_08_weather.png`, `public/sprites/ui/C_08_map_markers.png`.

## 9. Vorrat für kommende Fälle

Diese Orte und Figuren gibt es im Spiel noch nicht. Sie greifen Andeutungen aus dem Spiel auf (Theaterviertel aus dem Pfad der Maske, Spinnenseide aus den Uhrtürmen, Ochsenblut vom Schlachthof am Nordtor, Leuchtmoos aus den alten Gaskanälen, Sternglas aus dem Meteoritenkrater). So kann der nächste Fall sofort mit fertiger Grafik gebaut werden.

### 9.1 Theaterviertel: „Das Lumen-Theater“
```
[STYLE BLOCK]
Interior tileset and props for a decaying Victorian theatre, top-down 3/4 view, 16px grid: red carpet with worn edges, dark parquet, rows of velvet seats (16x16 pieces), a stage front edge with footlights (amber, 2-frame flicker), heavy red curtains (16x48 pieces, closed and open), backstage floor with taped marks, costume racks (32x32), a mirror table with bulbs around the mirror (32x32), prop masks on a wall (32x16), a trapdoor in the stage floor (closed and open), ropes and sandbags (16x32).
```
Figuren (Lauf-Sheet + Portrait): `diva` – a faded opera diva in a tattered burgundy gown and long gloves, dramatic makeup, grey streaks in piled-up dark hair; `souffleur` – a tiny nervous prompter with thick round glasses, a script clutched to his chest, ink-stained cuffs; `maskenmacher` – a silent mask maker in a leather apron, porcelain dust on his hands, his own face always half hidden by a plain white half mask.

### 9.2 Der Uhrturm von St. Ebbas Viertel
```
[STYLE BLOCK]
Interior tileset and props for the inside of a tall clock tower, top-down 3/4 view, 16px grid: wooden plank floor with gaps showing depth below, narrow spiral stair pieces, huge brass gears (32x32 and 48x48, 4-frame rotation), a swinging pendulum (16x48, 6 frames), the back of a giant clock face with light shining through (48x48, no numbers), thick spider webs with silvery silk (16x16 and 32x32), a maintenance workbench with tools (32x16), a trapdoor with a ladder (16x32).
```
Figuren: `uhrmacherin` – an elderly clockmaker woman with magnifying goggles pushed onto her grey hair, a leather tool roll, brass shavings on her shawl; `turmwaechter` – a gaunt bell-ringer with long arms, stooped back, cotton stuffed in his ears.

### 9.3 Schlachthof am Nordtor
```
[STYLE BLOCK]
Tileset and props for a grim Victorian slaughterhouse at the north gate, top-down 3/4 view, 16px grid, no blood or gore, only rust, grime and water: wet tiled floor with drains, brick walls with iron hooks on rails (empty hooks only), wooden pens, salt barrels, a scale, waxed paper bundles on a table, hanging oil lamps, a heavy sliding door, a cold-storage door with frost. Keep it unsettling through emptiness, not violence.
```
Figuren: `schlachtermeister` – a huge silent butcher in a stained leather apron (stains brown, not red), rubber boots, rolled sleeves, kind tired eyes; `lehrling` – a frightened teenage apprentice with a too-big cap and a bucket.

### 9.4 Die alten Gaskanäle
```
[STYLE BLOCK]
Tileset of 16x16 tiles for abandoned underground gas tunnels: curved brick tunnel walls, cracked brick floor, rusted gas pipes along the walls (straight, corner, valve, leaking pipe with a pale yellow gas cloud 4 frames), glowing pale-yellow moss patches (2-frame glow), iron maintenance doors, ladders up to manholes, standing water. Very dark except the moss and leaking gas.
```
Figuren: `gaswerker` – an old gasworks engineer with a breathing mask hanging at his neck, a dented helmet with a small lamp, oil-stained overalls.

### 9.5 Die Sternwarte am Krater
```
[STYLE BLOCK]
Interior tileset and props for a small private observatory near a meteorite crater, top-down 3/4 view, 16px grid: round wooden floor pieces, a brass telescope on a rotating base (32x48), star charts pinned to walls (no text), a desk with lenses and dark glass shards that hold tiny lights, an opening dome slit showing stars, a cabinet of rocks and meteorite fragments.
```
Figuren: `astronom` – an eccentric astronomer with wild white hair, a star-patterned scarf, many lenses on chains around his neck, ink on his nose.

Ablage für 9.x: Tilesets `public/sprites/tilesets/C_09_<ort>.png` (`theater`, `uhrturm`, `schlachthof`, `gaskanaele`, `sternwarte`), Figuren `public/sprites/characters/C_<id>_walk.png` und `public/sprites/portraits/C_<id>_emotions.png`.
