# Codex-Batch S: Kapitel 2, Monster, Einzelgänger, Zirkel und Beute

**Batch-Name:** `wexmoor3` (Manifest: `public/sprites/manifest-wexmoor3.json`)

Neue Inhalte für Wexmoor:
- **Monster** für drei Gefahrengebiete: Vergessmoor, Leuchtturm und das neue Salzwatt.
- **Sieben Einzelgänger**: Beyonder mit eigener Sequenz, mit denen man sich anfreunden oder anlegen kann. Wer sich mit ihnen gutstellt, kann so in neue Zirkel kommen.
- **Zwei neue Zirkel** mit Treffpunkt und Gastgeber.
- **Beute und Artefakte**.

Die Bosse `namenlose` und `leuchtfeuer` stehen in Batch R, die Glockenmutter steht hier.

**Schon fertig, nicht neu machen:** Batch Q und R, die Monster aus Batch G (sie dienen nur als Stilvorlage), die Treffen-Räume aus Batch O (Format-Vorlage für die neuen Zirkel), alle Kettlegate-Sheets.

**IDs (mit dem Kapitel-2-Thread abgestimmt):**
| Art | IDs |
|---|---|
| Vergessmoor (`wx_vergessmoor`) | `torfgaenger`, `weisslicht`, `schlickaal`, `reetmann` |
| Leuchtturm (`wx_leuchtturm`) | `glasmoewe`, `lichtbrut`, `linsensplitter` |
| Salzwatt (`wx_salzwatt`, neu, Gefahr ☠☠☠) | `salzgeist`, `bojenglocke`, `nebelfischer`, Boss `glockenmutter` |
| Einzelgänger | `ez_reetkoenig`, `ez_brennerin`, `ez_spinnerin`, `ez_baender`, `ez_maskenwirt`, `ez_glockenfischer`, `ez_schleusendieb` |
| Zirkel | `lichtlose` (Karte `treffen_lichtlose`, Gastgeberin `zirkel_lichtlose`), `salz` (Karte `treffen_salz`, Gastgeber `zirkel_salzbruder`) |
| Beute | `torfasche`, `fremdlicht_phiole`, `schlickperle`, `reetfaser`, `moewenglas`, `linsenscherbe`, `laternenoel_alt`, `salzkristall` |
| Artefakte | `bojenglocke_klein`, `leuchtturmlinse`, `namenstaefelchen`, `torfmesser_alt` |

Kampf-Sheets heißen immer `enemy_<id>`, bei Einzelgängern also `enemy_ez_<name>`.

**Reihenfolge:** 1 (Monster) → 3 (Einzelgänger) → 2 (Salzwatt und Glockenmutter) → 4 (Zirkel) → 5 bis 7.

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

## 1. Monster (Kampf, 64x64)

Vorlage:
```
[STYLE BLOCK]
Side-view battle sprite sheet, 64x64 px per frame, facing left, 6 columns, transparent background, consistent baseline: [BESCHREIBUNG]. Rows: 1) idle, 4 frames; 2) attack A, wind-up held 2 frames, 6 frames; 3) attack B or skill, wind-up held 2 frames, 6 frames; 4) hurt, 3 frames; 5) defeated, 6 frames. Sheet 384x320.
```
**Farbregel:** Das „fremde Licht“ aus dem Leuchtturm ist kalt-weiß (#e8f0ff), die Irrlichter des Moors bleiben grünlich, Türkis nur für allgemein Okkultes.

| Datei (`public/sprites/battle/`) | Gebiet | `[BESCHREIBUNG]` | Angriff A / B |
|---|---|---|---|
| `enemy_torfgaenger.png` | Vergessmoor | a nameless peat cutter standing waist-deep in the marsh, a peat-stained smock and cap, a spade, and where his face should be only smooth wet peat with a faint carved line; reeds tangled around him | A: spade swing; B: grabs and pulls the target's name (a small pale light leaves the target) |
| `enemy_weisslicht.png` | Vergessmoor | a cold white light, not green like a will-o'-wisp, a glowing orb with a faint human face inside that hums a melody, trailing thin white strands | A: flare that burns; B: sings and lulls (soft white notes as shapes) |
| `enemy_schlickaal.png` | Vergessmoor | a huge eel of black marsh slime rising from the water in a curve, tiny white lights stuck in its body like swallowed stars, a round toothless mouth | A: whip of its tail; B: drags the target into the mud (mud splash) |
| `enemy_reetmann.png` | Vergessmoor | a tall thin figure woven of grey reeds and rope like a scarecrow, a straw hat, empty eyes with two tiny green marsh lights, reed stalks rustling | A: reed lash; B: sheds seeds that root the target (binding) |
| `enemy_glasmoewe.png` | Leuchtturm | a seagull made of clear glass with a trapped white light flickering inside, beating against invisible walls, sharp glass beak | A: dives with a glass beak; B: shatters a feather of glass shards |
| `enemy_lichtbrut.png` | Leuchtturm | a soft glowing white larva crawling out of a niche of name tablets, wearing several pale borrowed faces on its body like masks | A: lunges; B: shows a borrowed face that confuses |
| `enemy_linsensplitter.png` | Leuchtturm | a cluster of ground lens glass shards assembling into a jagged humanoid shape, every shard reflecting the investigator's face slightly wrong | A: shard storm; B: focuses light into a burning point |
| `enemy_salzgeist.png` | Salzwatt | a pale ghost crusted in white salt crystals, a drowned salt worker with empty eye sockets, salt flaking off as it moves | A: salt slash; B: salt crust that slows (white crystals grow on the target) |
| `enemy_bojenglocke.png` | Salzwatt | a rusty red bell buoy come alive, hopping on its weighted base, its bell ringing on its own, barnacles and seaweed, a single eye in the bell mouth | A: ram; B: toll that stuns (bronze sound rings) |
| `enemy_nebelfischer.png` | Salzwatt | a tall fisherman made of fog in a dripping oilskin coat, no face under the hood, casting a net of mist, a lantern that shines grey | A: hook throw; B: net of fog that blinds |

Dazu Effekte:
```
[STYLE BLOCK]
Battle effect strips, transparent background, crisp pixels, frames in one row: 1) "name theft" a small pale light pulled out of a target toward the right, 48x48, 6 frames; 2) "mud drag" black mud splashing up and pulling down, 48x48, 6 frames; 3) "reed seeds" seeds sprouting into binding reeds, 48x48, 6 frames; 4) "glass shards" flying clear shards, 48x48, 6 frames; 5) "salt crust" white crystals growing, 32x32, 6 frames; 6) "fog net" a grey net of mist closing, 48x48, 6 frames.
```
Ablage: `public/sprites/fx/fx_namensraub.png`, `fx_schlick.png`, `fx_reetsamen.png`, `fx_glassplitter.png`, `fx_salzkruste.png`, `fx_nebelnetz.png`.

## 2. Das Salzwatt (`wx_salzwatt`, neu) und die Glockenmutter

Ein Wattenmeer vor dem Bojenhafen. Bei Ebbe liegen Priele, Salzkrusten und versunkene Boote frei, überall stehen alte Bojen im Schlick. Bei Flut läuten sie.
```
[STYLE BLOCK]
Exterior tileset for tidal salt flats, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: wet grey-brown mud flats with ripple marks (4 variants), white salt crust patches (4 variants, edges), tidal channels of shallow water (edges, corners, curves, 2-frame shimmer), deeper sea water (2 variants), shell banks, a line of old wooden stakes (16x16), a stone causeway (horizontal, vertical, edges).
```
```
[STYLE BLOCK]
Prop sheet for haunted tidal salt flats, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: old bell buoys stuck tilted in the mud (16x32, 3 variants, one ringing 2 frames), a half-buried rowing boat (32x16), a rotting pier (48x32), salt pans with white crust (32x32), a salt worker's hut on stilts (32x48), a drowned cart (32x16), crab holes (16x16), seaweed heaps (16x16), a giant rusted chain leading out to sea (16x16 pieces), mist overlay (32x32, 3 variants).
```
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent: wide tidal salt flats at dusk, white salt crusts and silver channels, tilted bell buoys stuck in the mud, a giant red buoy far out in the mist, the lighthouse beam on the horizon. The bottom 70 px is a flat readable mud strip. No characters, no text.
```
Ablage: `public/sprites/tilesets/S_salzwatt_tiles.png`, `public/sprites/props/S_salzwatt_props.png`, `public/sprites/battle/bg_salzwatt.png`.

### 2.1 Boss: Die Glockenmutter (`glockenmutter`, 96x96)
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: The Bell Mother, a giant rusted red-and-black bell buoy rising from the tidal water, its iron cage forming the shape of a woman's upper body with a calm iron face; the great bell hangs inside her chest where a heart would be; chains trail into the sea; seaweed hair; small buoys bob around her like children. Rows:
1) idle, rocking in the tide, the bell swinging slowly, 4 frames;
2) attack "Flutläuten": the bell tolls and a wave rolls forward, wind-up held 2 frames, 6 frames;
3) attack "Ketten": chains lash out of the water, wind-up held 2 frames, 6 frames;
4) skill "Wiegenlied der Bojen": all small buoys ring together, the party sways (sleep/slow), 6 frames;
5) summon: two bell buoys pop up from the water, 6 frames;
6) hurt, 3 frames;
7) defeat: the bell cracks, she tilts and sinks slowly with a last deep toll, 6 frames.
Sheet 576x672.
```
```
[STYLE BLOCK]
Battle effect strips, transparent background, crisp pixels: 1) "tide toll" a wave with bronze sound rings, 96x48, 6 frames; 2) "chain lash" rusty chains whipping out of water, 64x48, 6 frames. Plus a dramatic boss bust portrait 160x160: a giant iron buoy woman with a calm iron face and a great bell in her chest, rising from mist.
```
Ablage: `public/sprites/battle/enemy_glockenmutter.png`, `public/sprites/fx/fx_flutlaeuten.png`, `fx_ketten.png`, `public/sprites/ui/S_08_boss_glockenmutter.png`.

## 3. Die sieben Einzelgänger

Einzelgänger sind Beyonder, die keinem Zirkel angehören. Jeder hat einen Pfad und eine Sequenz und lebt an einem festen Ort. Man kann sich mit ihnen anfreunden (Gefallen, Handel, Zugang zu Zirkeln) oder sie sich zum Feind machen (dann kämpfen sie). Deshalb braucht jeder ein Lauf-Sheet, ein Portrait-Sheet mit **freundlich** und **feindselig**, ein Kampf-Sheet mit einer Fähigkeit seines Pfads und ein Mini-Portrait.

Die Pfadfarbe soll an einem Detail sichtbar sein (Licht, Faden, Glanz), nicht an der ganzen Figur.

| ID | Name, Pfad, Ort | `[BESCHREIBUNG]` | Pfad-Fähigkeit im Kampf (Reihe 3) |
|---|---|---|---|
| `ez_reetkoenig` | Hagen Wisp „der Reetkönig“, Kessel Seq. 6, Torfstich | an old wiry marsh man with a crown woven of dry reeds on wild grey hair, a long coat of patched sacking, a dented copper cauldron on his back with a faint green glow and steam, bottles on a bandolier | throws a bubbling green brew (poison green #9ad06a) |
| `ez_brennerin` | Mara Docht „die Brennerin“, Laterne Seq. 7, Torfstich | a young woman with short singed dark hair, soot-black leather gloves, a scorched apron, a hand-built lantern of scrap tin and glass with an amber flame that burns too bright | releases a blinding amber light (amber #e8b860) |
| `ez_spinnerin` | Agathe Garn „die Spinnerin“, Faden Seq. 5, Oberstadt | an old widow in black lace and a high collar, silver hair in a net, carrying a small spinning wheel made of pale bone; fine lilac threads drift from her fingertips | binds the target in lilac threads (lilac #c8b0e8) |
| `ez_baender` | Tobin Krell „der Bänder“, Eisen Seq. 7, Bojenhafen | a huge dock worker with a shaved head, a sleeveless sweater, heavy iron chains wrapped around both forearms like bandages, a calm steady face | swings the chains like hammers, steel-grey sparks (#a8b4c0) |
| `ez_maskenwirt` | Ambrose Fell „der Maskenwirt“, Maske Seq. 6, Salzmarkt | an elegant innkeeper in a burgundy waistcoat and white shirt, slicked hair, a white porcelain half mask covering the right side of his face, a polishing cloth and a smile that changes when you look away | splits into a rose-tinted double (rose #e07a8a) |
| `ez_glockenfischer` | Ole Tamsen „der Glockenfischer“, Echo Seq. 7, Bojenhafen | an old fisherman in a heavy knit sweater and sou'wester, a brass ear trumpet hanging at his neck, a small bell buoy on a rope over his shoulder, half-deaf and listening to things others can't hear | rings the buoy bell, turquoise sound rings (#6fe0d0) |
| `ez_schleusendieb` | Fitz Hallow „der Schleusendieb“, Schlüssel Seq. 7, Güterbahnhof | a skinny young thief in a too-long dark coat with many pockets, a flat cap, a huge ring of lockpicks and keys of every size, quick restless hands, a crooked grin | steps into a shadow and stabs from behind, brass glint (#d0a050) |

Vorlagen:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, same proportions as the existing characters.
```
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, friendly (warm smile), hostile (threatening, pathway color glowing in the eyes), shocked. Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
```
[STYLE BLOCK]
Side-view battle sprite sheet, 48x48 px per frame, facing left, 6 columns, transparent background, consistent baseline: [BESCHREIBUNG]. Rows: 1) idle, 4 frames; 2) basic attack, wind-up held 2 frames, 6 frames; 3) pathway skill: [FÄHIGKEIT], wind-up held 2 frames, 6 frames; 4) hurt, 3 frames; 5) yields: kneels and raises a hand (used when the fight ends without killing), 6 frames. Sheet 288x240.
```
Ablage: `public/sprites/characters/S_<id>_walk.png`, `public/sprites/portraits/S_<id>_emotions.png`, `public/sprites/battle/enemy_<id>.png`, Köpfe `public/sprites/ui/heads/<id>.png` (24x24).

### 3.1 Beziehungs-Anzeige für Einzelgänger
```
[STYLE BLOCK]
Small UI pieces for a relationship system, transparent background, 1px dark outline: 1) a horizontal relationship bar 64x8: an empty brass frame, a left half fill in deep red (enemy) and a right half fill in warm green-gold (friend), and a small marker needle 4x10; 2) state badges 16x16: enemy (crossed daggers in red), wary (a half-closed eye in grey), neutral (an open hand in grey), friend (clasped hands in gold), ally (a handshake with a small star); 3) seven tiny pathway seals 8x8 in the pathway colors (amber, lilac, rose, turquoise, poison green, steel grey, brass) to mark a loner's pathway; 4) a "sequence" pip 6x6 (empty and filled) for showing their rank.
```
Ablage: `public/sprites/ui/S_einzelgaenger_ui.png`.

## 4. Neue Zirkel in Wexmoor

Wie die drei Zirkel aus Kettlegate (Batch O): ein kleiner, geheimer Innenraum, ein Gastgeber, ein Emblem, ein Kartenmarker.

### 4.1 Die Lichtlosen (`lichtlose`): Keller unter dem Torfstich (`treffen_lichtlose`)
Menschen, die dem Lichtamt ihr Licht nicht geben wollen. Sie treffen sich ohne jedes Licht, nur Glut aus Torf.
```
[STYLE BLOCK]
Interior tileset and prop sheet for a secret meeting cellar dug under peat fields, top-down 3/4 view, 16px grid, transparent background where needed: tileset (16x16, 8 per row): packed peat floor (4 variants), walls of cut peat bricks with roots (top and front faces, corners), a ladder up through a hatch; props (1px outline): a circle of low stools around a pit of glowing peat embers with no flame (32x32, 3-frame glow), blindfolds hanging on pegs (16x16), covered lanterns with black cloth (16x16), a table with traded goods wrapped in dark cloth (32x16), shelves of jars of peat ash (32x32), a wall carving of a lighthouse crossed out (32x32).
```
Gastgeberin `zirkel_lichtlose`: *a middle-aged woman with a dark blindfold pushed up onto her forehead, cropped grey hair, a peat-brown coat, ember-orange light on her face from below, a calm low voice.*

### 4.2 Die Salzbrüder (`salz`): Salzspeicher am Bojenhafen (`treffen_salz`)
Salzhändler, die mit allem handeln, was das Watt hergibt, und Schulden in Salz wiegen.
```
[STYLE BLOCK]
Interior tileset and prop sheet for a secret meeting in a salt warehouse, top-down 3/4 view, 16px grid, transparent background where needed: tileset (16x16, 8 per row): plank floor dusted with white salt (4 variants), walls of grey boards with salt crust (top and front faces, corners), a big loading door (closed and open); props (1px outline): mountains of coarse salt (32x32, 2 variants), stacked salt sacks (16x16), a long table with a salt scale and coin stacks (48x16), barrels of salted fish (16x16), a hanging ship's lantern (16x16, swing), a ledger chained to a post (16x32), a salt-crusted anchor (32x32), a brotherhood banner of crossed salt shovels on the wall (32x32, no text).
```
Gastgeber `zirkel_salzbruder`: *a heavy bald man with a salt-white beard, a leather apron over a blue sea coat, salt crystals on his eyebrows, a brass scale pendant, a merchant's sly smile.*

Für beide Gastgeber Lauf-Sheet und Portrait mit den Vorlagen aus Abschnitt 3 (Emotionen neutral, friendly, hostile, shocked).

```
[STYLE BLOCK]
Small UI pieces, transparent background, 1px dark outline: 1) two circle emblems 32x32 in wax-seal style: an extinguished lantern with a peat ember (The Lightless), two crossed salt shovels over a wave (The Salt Brothers); 2) two invitation icons 16x16: a smudge of peat ash on a palm, a pinch of salt in a folded paper; 3) two map markers 16x16 in the hand-drawn ink style of the Wexmoor map: a dark lantern, a salt sack; plus the same in an amber highlighted state and with a pulsing violet ring (2 frames) for a meeting in progress.
```
Ablage: `public/sprites/tilesets/S_lichtlose_tiles.png`, `public/sprites/props/S_lichtlose_props.png`, `public/sprites/tilesets/S_salz_tiles.png`, `public/sprites/props/S_salz_props.png`, `public/sprites/characters/S_zirkel_lichtlose_walk.png`, `S_zirkel_salzbruder_walk.png`, `public/sprites/portraits/S_zirkel_lichtlose_emotions.png`, `S_zirkel_salzbruder_emotions.png`, `public/sprites/ui/S_zirkel.png`.

## 5. Gegner auf der Karte
```
[STYLE BLOCK]
Overworld sprite sheet for a roaming enemy in a top-down 3/4 view: [BESCHREIBUNG]. Frame size [GRÖSSE]. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk/move cycle). Transparent background, grid-aligned, 1px dark outline, matches the scale of the existing 16x32 characters.
```
| Datei (`public/sprites/characters/`) | Größe | `[BESCHREIBUNG]` |
|---|---|---|
| `S_ow_torfgaenger.png` | 16x32 | a faceless peat cutter wading through mud with a spade |
| `S_ow_weisslicht.png` | 16x16 in a 32x32 cell | a cold white glowing orb drifting |
| `S_ow_schlickaal.png` | 32x32 | a black slime eel swimming in curves |
| `S_ow_reetmann.png` | 16x32 | a reed scarecrow figure walking stiffly |
| `S_ow_glasmoewe.png` | 32x32 | a glass seagull flapping, a light flickering inside |
| `S_ow_lichtbrut.png` | 32x32 | a glowing white larva crawling |
| `S_ow_linsensplitter.png` | 16x32 | a jagged figure of lens shards |
| `S_ow_salzgeist.png` | 16x32 | a salt-crusted ghost shuffling |
| `S_ow_bojenglocke.png` | 16x32 | a hopping rusty bell buoy |
| `S_ow_nebelfischer.png` | 16x32 | a faceless fog fisherman with a grey lantern |

## 6. Zugleiste und Bestiarium
```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: [LISTE]
```
Reihenfolge/IDs: `torfgaenger, weisslicht, schlickaal, reetmann, glasmoewe, lichtbrut, linsensplitter, salzgeist, bojenglocke, nebelfischer, glockenmutter, namenlose, leuchtfeuer, ez_reetkoenig, ez_brennerin, ez_spinnerin, ez_baender, ez_maskenwirt, ez_glockenfischer, ez_schleusendieb`. Ablage: `public/sprites/ui/S_zug_portraits.png`.
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [GEGNER] in the upper two thirds, a pinned specimen label shape and a few scribbled notes as abstract lines (no readable text) in the lower third, a coffee stain in a corner.
```
Karten für die 13 Monster und Bosse (ohne Einzelgänger). Ablage: `public/sprites/ui/bestiary/S_<id>.png`.

## 7. Beute und Artefakte (16x16 plus 32x32)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 8 icons in a row, plus the same 8 again at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim, each centered: [LISTE]
```
**Beute** (`S_beute`): `torfasche` (a small cloth pouch of grey-brown peat ash), `fremdlicht_phiole` (a stoppered phial with a tiny cold white light inside), `schlickperle` (a black pearl coated in mud with a pale glint), `reetfaser` (a bundle of grey reed fibres tied with string), `moewenglas` (a clear glass gull feather), `linsenscherbe` (a curved shard of ground lens glass), `laternenoel_alt` (an old dented tin of lamp oil with a cork), `salzkristall` (a large white salt crystal with a faint pink core).

```
[STYLE BLOCK]
Cursed artifact icon sheet, 16x16 px per icon, 4 icons in a row, plus the same icons again at 32x32 in a second row, transparent background, 1px dark outline and a 1px muted violet rim instead of a light rim, each centered, each with one subtle uncanny detail: [LISTE]
```
**Artefakte** (`S_artefakte`): `bojenglocke_klein` (a tiny rusted buoy bell that rings without being touched, faint rings), `leuchtturmlinse` (a small faceted lens with a trapped cold white light), `namenstaefelchen` (a small wooden name tablet whose carved name is half scratched out), `torfmesser_alt` (an old peat knife with a bog-oak handle, the blade dark and wet).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten `public/sprites/items/S_beute.png` und `S_artefakte.png`.

## 8. Kontrolle vor dem Abgeben
- Alle Kampf-Sheets haben 6 Spalten und die angegebene Sheet-Größe.
- Jeder Einzelgänger ist an Silhouette und einem Pfad-Detail erkennbar; das feindselige Portrait zeigt die Pfadfarbe in den Augen.
- Das fremde Licht ist kalt-weiß, die Irrlichter grünlich, Türkis nur für Echo und allgemein Okkultes.
- Manifest `manifest-wexmoor3.json`, Prompts in `docs/art/batch-wexmoor3-generation.json`, Kurzeintrag in `docs/art/README.md`.
