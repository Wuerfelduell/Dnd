# Codex-Batch M: Fall 7 und 8, die Gouvernante mit der Silberschere

**Batch-Name:** `fall78` (Manifest: `public/sprites/manifest-fall78.json`)

Zwei Fälle laufen parallel, und am Ende steckt dieselbe Täterin dahinter. In **Fall 7** treibt ein Bankkontor am Altmarkt Schulden mit Gewalt ein, und ein Schuldner ist im Kanal ertrunken, der jetzt als Geist umgeht. In **Fall 8** schlafen die Kinder im Waisenhaus St. Brigid nicht mehr richtig, sie wachen mit kohleschwarzen Füßen auf, als wären sie die ganze Nacht gelaufen. Hinter beidem steht Miss Imogen Wren, eine Gouvernante. Auf der Karte und im Dialog ist sie die fertige E-Figur `gouvernante` (Lauf-Sheet und Portrait vorhanden); neu sind nur ihre Kampf-Sheets. Bitte die Kampf-Sheets an `E_gouvernante_walk.png` und `E_gouvernante_emotions.png` anlehnen (graues hochgeschlossenes Kleid, strenger Knoten). Sie spinnt im Keller aus den Träumen der Kinder Fäden und webt daraus Schuldscheine, die niemand anfechten kann.

**Schon fertig, nicht neu machen:** die E-Figuren `erbe`, `gouvernante`, `rattenfaenger`, `matrose`, `sufragette` (Lauf-Sheet und Portraits), `pip` (Zeitungsjunge), das Item `pfandschein`, `D_04_pfandhaus`, alle Sheets aus D, E, F, H, I sowie die geplanten aus G, J, K und L.

**IDs im Spiel (vom Spiel-Thread):**
| Art | IDs |
|---|---|
| Maps | `kontor_thorne` (Bankkontor mit Kohlenkeller, Tür am Altmarkt), `waisenhaus` (St. Brigid in Ashgrove, mit Küche und Schlafsaal), `traumkeller` (Finale) |
| Figuren neu | `finch`, `molly`, `benji` (Bossin auf der Karte = fertige `gouvernante`) |
| Gegner | `ertrunkener`, `pfandeintreiber`, `traumfaden`, Bossin `miss_wren` → Phase 2 `miss_wren_netz` |
| Items | `wasserprobe`, `pfaendungsbrief`, `kinder_murmel`, `schlaftee`, `schuldbuch`, `traumspule`, `silberschere` (Waffe) |
| Enden | `c7_heir`, `c7_wren`, `c8_perfect`, `c8_good`, `c8_early`, `c8_piper` |

**Reihenfolge:** 4 (Gegner) → 5 (Bossin) → 1 (Orte) → 3 (Figuren) → 2 (Kampf-Hintergründe) → 6 bis 8.

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

## 1. Orte (Tilesets und Props)

Draufsicht 3/4 auf dem 16er-Raster wie die vorhandenen Innenräume. Tilesets als Atlas, 8 Tiles pro Reihe, ohne Outline.

### 1.1 Bankkontor Thorne & Söhne mit Kohlenkeller (`kontor_thorne`)
Oben ein enges, übertrieben ordentliches Kontor mit Schreibpulten und einem großen Tresor. Unten ein feuchter Kohlenkeller mit einer Luke zum Kanal, durch die Schuldner verschwinden.
```
[STYLE BLOCK]
Interior tileset for a cramped Victorian bank counting house with a coal cellar below, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: worn dark oak floorboards (4 variants), a green and brown patterned carpet runner (edges and corners), wall top and front faces with dark wood panelling and dull green wallpaper (corners, edges), a wall with a barred counter window, a narrow stair down; cellar: wet black flagstones (4 variants), heaps of coal on the floor (edges), damp brick wall faces with white salt stains, a trapdoor to the canal with dark water below (closed and open), shallow puddles.
```
```
[STYLE BLOCK]
Prop sheet for a Victorian bank counting house and its coal cellar, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: tall clerk's standing desks with ledgers and inkwells (16x32, 3 variants), a counter with a brass grille and a bell (48x16), a huge black iron safe with a dial (32x32, closed and open), shelves of thick ledgers (32x32), a wall clock (16x16), a coat stand with a bowler hat (16x32), a coal stove (16x32, glowing), a letter rack with sealed envelopes (16x16), a portrait of a stern old banker in a gilded frame (32x32, face as simple shapes); cellar: a coal chute (16x32), coal sacks (16x16), a chair with leather straps (16x16), a hook on the wall with a wet coat hanging (16x32, dripping 3 frames), a ledger left open on a crate (16x16), wet footprints leading out of the canal hatch (32x16).
```
Ablage: `public/sprites/tilesets/M_kontor_tiles.png`, `public/sprites/props/M_kontor_props.png`.

### 1.2 Waisenhaus St. Brigid (`waisenhaus`)
Ein kahles, sauber geschrubbtes Haus in Ashgrove. Unten Speisesaal und Küche, oben der lange Schlafsaal mit zwanzig eisernen Betten. Nachts stehen die Betten leer, obwohl alle Kinder schlafen.
```
[STYLE BLOCK]
Interior tileset for a bare Victorian orphanage, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: scrubbed pale wooden floor (4 variants), a kitchen floor of red-brown tiles (4 variants, muted), a dormitory floor with a long worn grey runner (edges and corners), wall top and front faces in whitewashed plaster with a dark green lower half (corners, edges), a wall with a small high window, a wall with children's coat hooks, a staircase, a back door to a small yard.
```
```
[STYLE BLOCK]
Prop sheet for a Victorian orphanage, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: narrow iron beds with thin grey blankets (16x32, made, slept-in, and empty-but-warm variants), a small chest at the foot of a bed (16x16), a long dining table with benches and tin bowls (64x32), a big kitchen range with a soup pot (32x32, steam 3 frames), a scullery sink with a pump (16x32), a shelf of tin cups (32x16), a matron's desk with a register and a cane (32x16), a cupboard of folded uniforms (16x32), a rag doll on the floor (16x16), a chalk hopscotch on the floor (32x16), a basket of mending (16x16), a jar of sleeping tea with a ribbon (16x16), small black footprints of children leading across the floor toward the cellar door (32x16), a cellar door with a heavy new padlock (16x32).
```
Ablage: `public/sprites/tilesets/M_waisenhaus_tiles.png`, `public/sprites/props/M_waisenhaus_props.png`.

### 1.3 Traumkeller (`traumkeller`, Finale)
Der Keller unter dem Waisenhaus ist größer, als das Haus sein dürfte. In der Mitte steht ein riesiger Webstuhl. Von den Betten oben hängen leuchtende Fäden durch die Decke herab, und die Kinder laufen schlafwandelnd im Kreis und treten das Rad.
```
[STYLE BLOCK]
Interior tileset for an occult dream cellar, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: old stone cellar floor (4 variants) covered in coal dust, a worn circular track in the floor where many small feet have walked (edges and curve pieces), rough stone wall faces with roots, floor tiles with glowing lilac threads running across them (4 variants, 2-frame shimmer), a stair going up, a dark area at the edge where the cellar fades into nothing (edge tiles dissolving into soft dark violet).
```
```
[STYLE BLOCK]
Prop sheet for an occult dream-thread weaving cellar, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a huge wooden loom strung with glowing lilac and pale turquoise threads, weaving a long cloth that turns into paper (64x48, 4-frame weaving), a treadmill wheel turned by walking (48x48, 4 frames), threads hanging from the ceiling like glowing rain (16x32, 3 variants, gentle sway), spools of shining dream thread on a rack (32x16), a governess's sewing table with silver scissors and a pincushion (32x16), a stack of finished woven debt papers with wax seals (16x16), a bell jar with a sleeping light inside (16x16), a child's slipper left behind (16x16), a mirror in which the loom is reflected but the children are not (16x32).
```
Ablage: `public/sprites/tilesets/M_traumkeller_tiles.png`, `public/sprites/props/M_traumkeller_props.png`.

### 1.4 Schlafwandelnde Kinder (Szene im Traumkeller)
```
[STYLE BLOCK]
Character sprite sheets for sleepwalking orphans, 16x32 per frame, 4 rows (facing down, left, right, up) x 4 columns (slow shuffling walk with arms slightly raised and eyes closed), transparent background: 1) a small boy in an oversized grey nightshirt; 2) a small girl in a grey nightgown with a braid; 3) a slightly older boy with a bandaged hand. All barefoot with coal-black soles, a faint lilac thread running from the back of each head upward. Three sheets of 64x128.
```
Ablage: `public/sprites/characters/M_schlafkind_1_walk.png` bis `M_schlafkind_3_walk.png`.

## 2. Kampf-Hintergründe (480x270, deckend)
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [ORT]. Layered depth (far silhouettes, mid layer, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the central area. Fog layers, muted palette. No characters, no text.
```
| Datei (`public/sprites/battle/`) | Map-ID | `[ORT]` |
|---|---|---|
| `bg_kontor.png` | `kontor_thorne` | a damp coal cellar under a bank: coal heaps, a wet coat on a hook, an open hatch with black canal water, a single lantern, ledgers on a crate |
| `bg_waisenhaus.png` | `waisenhaus` | a long orphanage dormitory at night: rows of iron beds, all empty but with blankets thrown back, moonlight from small high windows, faint lilac threads drifting down from the ceiling |
| `bg_traumkeller.png` | `traumkeller` | an endless cellar with a giant loom of glowing threads, a treadmill wheel, glowing threads hanging from above like rain, the walls fading into dark violet |
| `bg_traumkeller_2.png` | `traumkeller` (Phase 2) | the same cellar as a vast web: threads stretched in every direction like a spider's net, paper debt notes caught in it, a silver light at the center |

## 3. Figuren

Vorlagen:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, same proportions as the existing characters.
```
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): [EMOTIONEN]. Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
| ID | Rolle | `[EMOTIONEN]` | `[BESCHREIBUNG]` |
|---|---|---|---|
| `finch` | Mr. Ambrose Finch, Kontorist bei Thorne, ängstlich und genau, weiß zu viel | neutral, suspicious, shocked, smiling faintly | a thin balding clerk in his forties with black sleeve protectors over a white shirt, a grey waistcoat, a pen behind his ear, pince-nez, a nervous thin moustache, ink on his fingers |
| `molly` | Waisenmädchen, wach und mutig, Hauptzeugin in Fall 8 | neutral, suspicious, shocked, smiling | a small orphan girl of about nine with two bright copper-red braids, freckles, a grey orphanage pinafore dress with a patched knee, stubborn eyes, dark rings under them |
| `benji` | Benji, Waisenjunge, wacht morgens mit kohleschwarzen Füßen auf | neutral, frightened, sleepy and confused, smiling | a skinny orphan boy of about ten with a messy dark mop of hair, an oversized grey nightshirt or orphanage jacket, barefoot with soles and ankles black with coal dust, sleepy eyes |

Ablage: `public/sprites/characters/M_<id>_walk.png`, `public/sprites/portraits/M_<id>_emotions.png`.

## 4. Neue Gegner (Kampf)

Vorlage für alle Gegner dieses Abschnitts:
```
[STYLE BLOCK]
Side-view battle sprite sheet, [GRÖSSE] px per frame, facing left, 6 columns, transparent background, consistent baseline: [BESCHREIBUNG]. Rows: 1) idle, 4 frames; 2) attack A, wind-up held 2 frames, 6 frames; 3) attack B or skill, wind-up held 2 frames, 6 frames; 4) hurt, 3 frames; 5) defeated, 6 frames. Sheet [BREITE]x[HÖHE].
```
| Datei (`public/sprites/battle/`) | Größe | Sheet | `[BESCHREIBUNG]` | Angriff A / B |
|---|---|---|---|---|
| `enemy_ertrunkener.png` | 64x64 | 384x320 | the ghost of a drowned debtor: a bloated pale grey-green man in a soaked shabby suit, weeds in his hair, canal water constantly running from his sleeves and mouth, a stack of soggy papers clutched to his chest, translucent edges (sad, not gory) | A: grabs with cold wet hands; B: floods the floor with a wave of black canal water |
| `enemy_pfandeintreiber.png` | 48x48 | 288x240 | a debt collector thug in a tight black bowler hat and a too-small checked coat, a thick ledger chained to his wrist, brass knuckles, a heavy jaw | A: punch with brass knuckles; B: slams the debt ledger open and a page flies out that binds the target (debt seal) |
| `enemy_traumfaden.png` | 64x64 | 384x320 | a tall shifting figure woven from thousands of glowing lilac and pale turquoise threads, no face, only a hollow where threads cross, loose ends drifting like hair | A: thread whip; B: sews the target's shadow to the ground (sleep effect) |

Effekte dazu:
```
[STYLE BLOCK]
Battle effect strips, transparent background, crisp pixels, frames in one row: 1) "canal wave" a low black-green water wave with foam, 64x32, 6 frames; 2) "debt seal" a flying page that wraps around a target and seals with red wax, 48x48, 6 frames; 3) "thread whip" a lilac thread lash, 48x32, 6 frames; 4) "stitched shadow" stitches pinning a shadow to the ground, 48x32, 6 frames; 5) status icons 16x16, 4 frames each: "asleep" (a crescent and small z-shapes drawn as wavy lines, no letters), "in debt" (a red wax seal with a chain).
```
Ablage: `public/sprites/fx/fx_kanalwelle.png`, `fx_schuldsiegel.png`, `fx_fadenpeitsche.png`, `fx_schattennaht.png`, `fx_status_schlaf.png`, `fx_status_schuld.png`.

## 5. Bossin: Miss Wren (96x96, zwei Phasen)

Phase 1 kämpft sie als Gouvernante mit der Silberschere und Strafen. In Phase 2 zieht sie alle Traumfäden zu sich und wird zur Weberin im Netz.
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: Miss Wren, a tall immaculate governess in a severe high-necked dove-grey dress, a silver chatelaine at her waist, hair in a tight bun, holding a pair of long elegant silver scissors like a rapier, a ruler in her other hand, faint lilac threads trailing from her fingertips. Rows:
1) idle, upright and composed, scissors snipping slowly, 4 frames;
2) attack "Zurechtstutzen": lunges with the scissors and cuts, wind-up held 2 frames, 6 frames;
3) attack "Strafe": raps with the ruler, a sharp shock line, wind-up held 2 frames, 6 frames;
4) skill "Bettruhe": spreads her hand and lilac threads drift over the party (sleep), 6 frames;
5) summon: two thread figures step out of the shadows, 6 frames;
6) hurt, 3 frames;
7) phase transition: she cuts her own chatelaine, her dress unravels into threads that pull her up into the air, 6 frames.
Sheet 576x672.
```
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: Miss Wren in her second form as the weaver in the web: she hangs in the center of a huge web of glowing lilac dream threads, her lower body and dress have become a spool and a cascade of threads, six long thread-arms reach out like a spider's legs, each ending in silver scissors; paper debt notes are caught in the web; her face stays calm and cold. Rows:
1) idle, the web trembles, 4 frames;
2) attack "Schere": three thread-arms snap down with scissors, wind-up held 2 frames, 6 frames;
3) attack "Schuldnetz": throws a net of threads with paper notes, wind-up held 2 frames, 6 frames;
4) skill "Albtraum": the threads glow dark violet and pull at the party's minds (screen-filling threads), 6 frames;
5) weak point: when a thread is cut, she lurches and a child's dream light escapes, 4 frames;
6) hurt, 3 frames;
7) defeat: the web snaps thread by thread, many small lights fly back up through the ceiling, she falls as a plain woman tangled in grey yarn, 6 frames.
Sheet 576x672.
```
```
[STYLE BLOCK]
Battle effect strips for a boss, transparent background, crisp pixels, frames in one row: 1) "scissor snip" a silver crossing flash, 48x48, 6 frames; 2) "debt net" a lilac net with paper scraps flying out, 96x96, 8 frames; 3) "nightmare" dark violet threads crossing the whole frame, 96x96, 8 frames; 4) "dreams set free" small warm lights flying upward, 96x96, 8 frames.
```
```
[STYLE BLOCK]
Dramatic boss bust portrait, 160x160 px, transparent background: Miss Wren, a cold governess in dove grey holding long silver scissors before her face, lilac threads glowing behind her in a web shape.
```
Ablage: `public/sprites/battle/enemy_miss_wren.png`, `enemy_miss_wren_netz.png`, `public/sprites/fx/fx_scherenschnitt.png`, `fx_schuldnetz.png`, `fx_albtraum.png`, `fx_traeume_frei.png`, `public/sprites/ui/M_08_boss_wren.png`.

## 6. Gegner auf der Karte, Zugleiste und Bestiarium
```
[STYLE BLOCK]
Overworld sprite sheet for a roaming enemy in a top-down 3/4 view: [BESCHREIBUNG]. Frame size [GRÖSSE]. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk/move cycle). Transparent background, grid-aligned, 1px dark outline, matches the scale of the existing 16x32 characters.
```
| Datei (`public/sprites/characters/`) | Größe | `[BESCHREIBUNG]` |
|---|---|---|
| `M_ow_ertrunkener.png` | 16x32 | a dripping drowned ghost in a soaked suit, leaving a trail of water |
| `M_ow_pfandeintreiber.png` | 16x32 | a bowler-hatted thug with a ledger chained to his wrist |
| `M_ow_traumfaden.png` | 16x32 | a drifting figure of glowing lilac threads |

```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: drowned ghost, bowler-hatted debt collector, thread figure, governess with silver scissors, governess in a web.
```
Reihenfolge/IDs: `ertrunkener, pfandeintreiber, traumfaden, miss_wren, miss_wren_netz`. Ablage: `public/sprites/ui/M_zug_portraits.png`.
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [GEGNER] in the upper two thirds, a pinned specimen label shape and a few scribbled notes as abstract lines (no readable text) in the lower third, a coffee stain in a corner.
```
Karten für `ertrunkener`, `pfandeintreiber`, `traumfaden`, `miss_wren`. Ablage: `public/sprites/ui/bestiary/M_<id>.png`.

## 7. Gegenstände und Hinweise

### 7.1 Item-Icons (16x16 plus 32x32)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 7 icons in a row (pad the row to 8 with an empty cell), plus the same icons again at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim, each centered: [LISTE]
```
**Fall-7/8-Gegenstände** (`M_items`): `wasserprobe` (a small corked glass vial of murky canal water with a paper tag), `pfaendungsbrief` (a stern official letter with a red seal and a black border), `kinder_murmel` (a single glass marble with a lilac swirl), `schlaftee` (a paper twist of dried herbs tied with a lilac ribbon), `schuldbuch` (a thick black ledger with a brass clasp and a chain), `traumspule` (a wooden spool wound with glowing lilac thread), `silberschere` (long elegant silver scissors, usable as a weapon).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlas `public/sprites/items/M_items.png`.

### 7.2 Hinweis-Props
```
[STYLE BLOCK]
Investigation hotspot props, 16x16 each, in a row, transparent background, each with a subtle 1px light rim: a wet handprint on a ledger, a black coal footprint of a child, a loose lilac thread caught on a bed frame, a tea cup with dark dregs, a torn page from a debt ledger, a silver scissors scratch on a door, a marble under a bed, a puddle that never dries, a padlock key on a ribbon, a name scratched out of a register (abstract lines only).
```
Ablage: `public/sprites/props/M_hinweise.png`.

### 7.3 Nahansichten (normal und verflucht)
```
[STYLE BLOCK]
Close-up inspection illustration, 160x120 px, not transparent, item centered on a dark cloth or desk background with soft lamplight from top-left: [MOTIV]. Second version of the same image (same framing): [FLUCH].
```
| Datei (`public/sprites/ui/inspect/`) | `[MOTIV]` | `[FLUCH]` |
|---|---|---|
| `schuldbuch.png` / `schuldbuch_fluch.png` | the open black ledger, columns of tiny abstract figures, a few lines crossed out in red | the crossed-out lines are woven threads, not ink, and they slowly pull out of the paper toward the viewer |
| `traumspule.png` / `traumspule_fluch.png` | a wooden spool of softly glowing lilac thread on a velvet cloth | inside the glow, tiny scenes of a child's dream flicker: a seaside, a mother's hand, a bright kite |

### 7.4 Fallakten, Zwischensequenzen und Enden
```
[STYLE BLOCK]
Case file cover illustration, 128x96 px, not transparent: a small framed pixel-art vignette on a manila case folder background for the case [FALL]: [MOTIV]. A paperclip and a wax seal in the corner. No text.
```
| Datei (`public/sprites/ui/cases/`) | `[FALL]` | `[MOTIV]` |
|---|---|---|
| `M_akte_fall7.png` | The Drowned Debtor | a ledger floating on dark canal water, a bowler hat beside it |
| `M_akte_fall8.png` | The Children Who Walk at Night | a row of iron beds with small black footprints leading away |

```
[STYLE BLOCK]
Cutscene still in pixel art, 240x135 px, not transparent, cinematic close framing: [SZENE]. No text.
```
1. `M_szene_kanal.png` – a drowned man's hand rising from black canal water at night, still clutching a soggy ledger page
2. `M_szene_finch.png` – Mr. Finch at his standing desk late at night, nervously copying a ledger by candlelight, glancing over his shoulder
3. `M_szene_schlafsaal.png` – the orphanage dormitory, all children standing beside their beds with closed eyes, threads rising from their heads
4. `M_szene_molly.png` – Molly hiding under a bed, holding a marble, watching small bare black feet shuffle past
5. `M_szene_webstuhl.png` – Miss Wren at the giant loom, weaving glowing thread into paper, calm and smiling
6. `M_szene_morgen.png` – morning in the orphanage, children waking up rested, Molly and Benji looking at their clean feet

Ablage: `public/sprites/ui/scenes/<Datei>`.

```
[STYLE BLOCK]
Ending illustration in pixel art, 480x270 px, not transparent, cinematic composition: [SZENE]. Muted palette, strong mood lighting, no text.
```
| Datei | `[SZENE]` |
|---|---|
| `c7_heir.png` | the young heir in his rumpled suit being led out of the bank by constables, wrongly blamed, the counting house window lit behind him with a grey figure watching |
| `c7_wren.png` | the bank cellar at dawn, the canal hatch nailed shut, the drowned ghost fading peacefully into morning mist, a single lilac thread leading away up the stairs (link to the orphanage) |
| `c8_perfect.png` | the orphanage yard on a bright cold morning, children playing hopscotch, Molly and Benji waving, the burned-out loom being carried away, Miss Wren in irons in a police wagon |
| `c8_good.png` | Miss Wren led away in irons, the loom destroyed, but some children still sitting pale and tired on their beds |
| `c8_early.png` | the cellar door padlocked again, the dormitory empty at night, and in the dark below a faint loom still clacking |
| `c8_piper.png` | the rat-catcher wrongly arrested, his terrier whining outside the police station, while children's black footprints continue across the snowy street behind |

Ablage: `public/sprites/ui/endings/<Datei>`.

## 8. Kontrolle vor dem Abgeben
- Alle Kampf-Sheets haben 6 Spalten und die angegebene Sheet-Größe; `enemy_miss_wren` und `enemy_miss_wren_netz` haben dieselbe Grundlinie und Palette.
- Die Kinder wirken müde und verloren, nie verletzt; der Ertrunkene ist traurig, nicht eklig.
- Manifest `manifest-fall78.json`, Prompts in `docs/art/batch-fall78-generation.json`, Kurzeintrag in `docs/art/README.md`.
