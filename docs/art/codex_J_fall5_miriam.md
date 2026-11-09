# Codex-Batch J: Fall 5 „Der Chor in der Glocke“ (Miriam Vey)

**Batch-Name:** `fall5` (Manifest: `public/sprites/manifest-fall5.json`)

Fall 5 schließt die Vey-Geschichte ab. Miriam Vey hat die Stimmen, die Felix in Fall 4 gestohlen hat, in die große Glocke des Uhrturms gegossen. Sie will mit diesem Chor ihre tote Tochter Lilian zurücksingen. Die Spur führt über eine alte Glockengießerei am Kanal und Veys verlassenes Haus bis in eine Kammer unter der Glocke. Dort kämpft man gegen Miriam, die in der zweiten Phase mit der Glocke verschmilzt.

**Schon fertig, nicht neu machen:** `enemy_miriam` (96x96, Phase 1), `enemy_chorschatten`, `enemy_chorfanatiker`, `F_ow_chorschatten`, `F_ow_chorfanatiker`, `F_08_boss_band`, `F_08_boss_miriam`, `bg_glockenstube`, `bg_uhrturm`, Miriams Lauf-Sheet und Portrait, `E_ende_fall4_haken`, alle Sheets aus D (Stadt, auch `D_05_uhrturm`), E, F, H und I.

**IDs im Spiel (mit dem Spiel-Thread abgestimmt):**
| Art | IDs |
|---|---|
| Fall | `case_05` |
| Maps | `giesserei`, `haus_vey`, `resonanzkammer` (Finale unter der Glocke) |
| Figuren | `brannock`, `oda_vey`, `lilian_echo` (neu); dazu die fertigen E-Figuren `nachtwaechter`, `waescherin`, `kaminkehrer`, `kind_streuner`, `kuenstler` |
| Begegnungen / Gegner | `chorwaechter`, `stimmenfresser`, `bronzeengel`, `glockenecho`; Boss `miriam` (Phase 1, fertig) → Phase 2 `miriam_glocke` |
| Items | `lilians_spieluhr`, `stimmgabel_silber`, `glockenzunge`, `veys_tagebuch`, `giessform`, `chorliste` |
| Enden | `c5_perfect`, `c5_good`, `c5_early`, `c5_rust` |
| Kartenmarker | `giesserei`, `ballsaal` (Reiseziele mit Pin) und Ersatz für Orte, die bisher geliehene Marker nutzen |

**Reihenfolge:** 4 (Gegner) → 5 (Boss Phase 2) → 1 (Orte) → 3 (Figuren) → 2 (Kampf-Hintergründe) → 6 bis 9.

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

Alle Innenräume auf dem 16er-Raster, Draufsicht 3/4 wie die vorhandenen Innenräume (`tavern`, `revier`, `uhrturm`). Tilesets als Atlas, 8 Tiles pro Reihe, ohne Outline.

### 1.1 Glockengießerei am Kanal (`giesserei`)
Eine stillgelegte Gießerei, in der vor zwanzig Jahren die große Glocke gegossen wurde. Brannock arbeitet dort noch allein. Unten liegt die Gießgrube, in der Miriam heimlich die Stimmen in Bronze gebunden hat.
```
[STYLE BLOCK]
Interior tileset for an old bell foundry, top-down 3/4 view, 16x16 tiles, 8 tiles per row, transparent where needed, no outlines on terrain: sooty brick floor (4 variants), packed black sand floor of the casting pit (4 variants, with faint footprints), cracked flagstones, an iron grate over a drain, brick wall top and front faces with soot streaks (corners, edges, inner corners), a wall section with a tall arched window showing fog outside, wooden plank walkway with rails, a ramp down into the casting pit, a stone pit rim (all edges and corners), puddles of cold grey slag.
```
```
[STYLE BLOCK]
Prop sheet for an old bell foundry, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a huge brick furnace with an iron door and dim orange embers (48x48), a hanging crane with chain and hook (32x48), a cracked clay bell mould split in two halves (32x32), a smaller finished bronze bell on a wooden stand (32x32), a workbench with hammers, files and a tuning fork (32x16), a rack of long iron ladles (16x32), sand sacks (16x16), a coal heap (32x16), a wooden crate of bronze ingots (16x16), a chalk sketch of a bell profile on a blackboard (32x32, no text), a hidden hatch in the pit floor (32x32, closed and open frames), and a strange object: a bronze sample bar with faint turquoise ripples on it as if sound were frozen inside (16x16, 4-frame shimmer).
```
```
[STYLE BLOCK]
Exterior building for a foggy canal district, top-down 3/4 view, 16px grid, transparent background: an old bell foundry hall of soot-black brick (96x80) with a tall square chimney, big double wooden doors with an iron bar, a broken skylight roof, a faded painted bell shape above the door (no text), a small loading quay with a crane at the canal edge, coal sacks and a rusted cart beside it.
```
Ablage: `public/sprites/tilesets/J_giesserei_tiles.png`, `public/sprites/props/J_giesserei_props.png`, `public/sprites/props/J_giesserei_aussen.png`.

### 1.2 Veys altes Haus (`haus_vey`)
Ein schmales Stadthaus, seit Lilians Tod verschlossen. Unten Staub und abgedeckte Möbel, oben Lilians Zimmer, das aussieht, als würde sie gleich zurückkommen. Im Musikzimmer stehen Notenpulte für einen Chor, der hier nachts probte.
```
[STYLE BLOCK]
Interior tileset for an abandoned narrow Victorian townhouse, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: dusty dark parquet floor (4 variants), a faded patterned runner carpet (edges and corners), a child's room floor with a pale rose rug (edges and corners), wall top and front faces with peeling sage green wallpaper and dark wainscoting (corners, edges), a wall with a dark rectangle where a picture used to hang, a narrow staircase going up and down, a doorway with a broken door, dust motes tile overlay (2 variants).
```
```
[STYLE BLOCK]
Prop sheet for an abandoned Victorian townhouse, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: furniture covered by grey dust sheets (sofa 32x16, armchair 16x16, piano 32x32), a grandfather clock stopped (16x32), a cold fireplace with a mantel and a framed photograph of a mother and small girl (32x32, faces as simple shapes), five music stands in a half circle (16x32 each, one fallen over), a child's bed neatly made with a rag doll on the pillow (32x32), a small wardrobe with a tiny coat on a hook (16x32), a rocking horse (16x16), a dollhouse that looks like this very house (32x32), a window seat with a music box on it (32x16), a mirror covered with black cloth (16x32, covered and uncovered frames), a wall with dozens of pinned sheets of music (32x32, no readable notes), a locked writing desk (32x16, closed and open frames).
```
Ablage: `public/sprites/tilesets/J_haus_vey_tiles.png`, `public/sprites/props/J_haus_vey_props.png`.

### 1.3 Resonanzkammer unter der Glocke (`resonanzkammer`)
Eine runde Kammer im Fundament des Uhrturms, direkt unter der Glocke. Die Wände sind mit Bronze ausgekleidet, durch die Decke hängt der Klöppel herab. Jeder Schritt hallt als sichtbarer Ring. Hier steht der Chor der gestohlenen Stimmen.
```
[STYLE BLOCK]
Interior tileset for a circular occult resonance chamber beneath a giant bell, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: worn bronze floor plates with engraved concentric rings (4 variants), the same plates with faint turquoise light in the grooves (4 variants, 2-frame pulse), dark stone floor, a circular bronze-lined wall (top and front faces, curved segments for a round room, corners), a stone stair spiralling upward, a dark shaft opening in the ceiling (shown as a black circle floor overlay with a rim), cracks in the floor glowing turquoise (2 variants).
```
```
[STYLE BLOCK]
Prop sheet for an occult resonance chamber, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: the huge bell clapper hanging from above through a shaft, swinging (32x48, 4 frames), a ring of twelve tall bronze tuning pillars (16x32 each, idle and humming frames with turquoise rings), a conductor's lectern with an open score (16x32), a child-sized empty chair in the center inside a chalk circle (16x16 chair plus 48x48 circle overlay), rows of grey choir robes standing empty like hollow people (16x32, 3 variants), a pile of empty sternglass phials (16x16), candles in bronze holders (16x16, 3-frame flicker), sound ring overlay that spreads from a footstep (32x32, 6 frames, turquoise outline only).
```
Ablage: `public/sprites/tilesets/J_resonanzkammer_tiles.png`, `public/sprites/props/J_resonanzkammer_props.png`.

## 2. Kampf-Hintergründe (480x270, deckend)
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [ORT]. Layered depth (far silhouettes, mid layer, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the central area. Fog layers, muted palette. No characters, no text.
```
| Datei (`public/sprites/battle/`) | Map-ID | `[ORT]` |
|---|---|---|
| `bg_giesserei.png` | `giesserei` | inside an old bell foundry: a cold brick furnace with faint embers, chains and a crane hook hanging, a split clay bell mould, black sand floor, fog through broken skylights |
| `bg_haus_vey.png` | `haus_vey` | the music room of an abandoned townhouse: dust-sheeted piano, music stands in a half circle, peeling green wallpaper, moonlight through tall windows, sheets of music frozen in the air |
| `bg_resonanzkammer.png` | `resonanzkammer` | a circular bronze-lined chamber under a giant bell: the clapper hanging from a shaft above, tall tuning pillars glowing turquoise, concentric rings on the floor, hollow choir robes standing in the dark |
| `bg_resonanzkammer_2.png` | `resonanzkammer` (Boss Phase 2) | the same chamber torn open: the giant bell has sunk down into the room and glows from within, cracks of turquoise light run up the walls, sheets of music swirl like snow |

## 3. Figuren für Fall 5

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
| `brannock` | alter Glockengießer, hat die große Glocke gegossen und ahnt, was Miriam damit gemacht hat | neutral, suspicious, shocked, smiling faintly | a massive old bell founder with a burn-scarred bald head, a thick grey beard singed at the edges, a heavy leather apron over a collarless shirt, huge hands, a small tuning fork behind one ear |
| `oda_vey` | Miriams ältere Schwester, Zeugin, will Miriam retten statt verhaften lassen | neutral, suspicious, shocked, smiling faintly | a tired woman in her fifties in a plain dark blue dress and knitted shawl, grey-streaked dark hair in a loose bun, the same sharp features as Miriam but softer, holding a bundle of old letters |
| `lilian_echo` | Echo von Lilian, erscheint nur in Haus und Resonanzkammer | neutral, sad, frightened, smiling | a translucent ghost of a seven-year-old girl in a pale nightdress, long dark hair, bare feet floating above the ground, outlined in soft turquoise light, eyes simple and kind (not scary) |
| `miriam_glocke` | Miriam im Finale, Dialog vor und nach dem Kampf | cold calm, pleading, furious, broken and grieving | Miriam Vey, an elegant choir director in a long grey high-collared coat, dark hair coming loose, cracks of turquoise light running across her cheek like fissures in bronze, an eye-in-a-circle brooch |

Sonderfälle:
- `lilian_echo` läuft nicht, sie schwebt: Lauf-Sheet trotzdem 4x4, aber die Füße berühren nie den Boden, Frames als leichtes Auf und Ab mit flackerndem Rand.
- `miriam_glocke` braucht kein Lauf-Sheet, nur das Portrait.

Ablage: `public/sprites/characters/J_<id>_walk.png`, `public/sprites/portraits/J_<id>_emotions.png`.

## 4. Neue Gegner in Fall 5 (Kampf)

Vorlage für alle Gegner dieses Abschnitts:
```
[STYLE BLOCK]
Side-view battle sprite sheet, [GRÖSSE] px per frame, facing left, 6 columns, transparent background, consistent baseline: [BESCHREIBUNG]. Rows: 1) idle, 4 frames; 2) attack A, wind-up held 2 frames, 6 frames; 3) attack B or skill, wind-up held 2 frames, 6 frames; 4) hurt, 3 frames; 5) defeated, 6 frames. Sheet [BREITE]x[HÖHE].
```
| Datei (`public/sprites/battle/`) | Größe | Sheet | `[BESCHREIBUNG]` | Angriff A / B |
|---|---|---|---|---|
| `enemy_chorwaechter.png` | 48x48 | 288x240 | a loyal choir guard of Miriam: a broad man in a grey choir robe with leather bracers over it, a bronze half mask shaped like an open singing mouth, wielding a heavy bronze handbell on a chain | A: swings the handbell like a flail; B: rings the bell and a turquoise shock ring stuns |
| `enemy_stimmenfresser.png` | 64x64 | 384x320 | a thin hunched creature of grey smoke and paper, with an enormous round mouth full of tiny glowing phials instead of teeth, long arms ending in funnel-shaped hands | A: lunges and bites; B: inhales, pulling a ribbon of light out of the target (silence effect) |
| `enemy_bronzeengel.png` | 64x64 | 384x320 | a foundry guardian statue: an angel figure cast in green-brown bronze with a bell-shaped skirt, wings made of overlapping bell plates, an empty face with a single slit, turquoise light leaking from the casting seams | A: heavy wing slam; B: rings its whole body, sending a deep bronze wave |
| `enemy_glockenecho.png` | 64x64 | 384x320 | a swarm of floating small bells and sound rings that forms a vague singing face in the middle, translucent turquoise, flickering | A: swarm rush of jingling bells; B: echo that repeats the last attack the player used (shown as a mirrored ghost shape) |

Effekte dazu:
```
[STYLE BLOCK]
Battle effect strips, transparent background, crisp pixels, frames in one row: 1) "bell strike" a bronze shock ring with dust, 48x48, 6 frames; 2) "voice drain" a ribbon of light pulled from left to right into a mouth, 64x32, 6 frames; 3) "bronze wave" a heavy low wave of greenish bronze light along the ground, 64x32, 6 frames; 4) "echo copy" a translucent turquoise afterimage flickering and fading, 48x48, 6 frames; 5) "silenced" status: a small crossed-out mouth seal hovering, 16x16, 4 frames.
```
Ablage: `public/sprites/fx/fx_glocke_schlag.png`, `fx_stimme_sog.png`, `fx_bronze_welle.png`, `fx_echo_kopie.png`, `fx_status_stumm.png`.

## 5. Boss Fall 5, Phase 2: Miriam in der Glocke (96x96)

Phase 1 ist `enemy_miriam` (fertig). Nach der Verwandlung sinkt die Glocke herab und Miriam steht in ihr, halb Mensch, halb Bronze. Lilians Echo schwebt hinter ihr und ist in der guten Lösung der Schlüssel (man spielt die Spieluhr statt anzugreifen).
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: Miriam Vey fused with a giant bronze bell. Her upper body rises from the mouth of a dark green-bronze bell that hovers just above the ground; her grey coat merges into the bronze, cracks of turquoise light run over her skin and the bell; her hair floats as if underwater; dozens of tiny glowing lights (the stolen voices) circle inside the bell's mouth; a translucent small girl's silhouette flickers behind her. Rows:
1) idle, the bell sways slowly and hums, voices circling, 4 frames;
2) attack "Grabgeläut": the bell swings forward and strikes the air, huge sound ring, wind-up held 2 frames, 6 frames;
3) attack "Chor der Stimmen": she spreads her arms and the voices shoot out as streaks of light, wind-up held 2 frames, 6 frames;
4) skill "Wiegenlied": she sings softly, the girl's silhouette brightens and the party slows down (soft lilac and turquoise notes), 6 frames;
5) summon: two choir shades and one bell echo rise from the floor, 6 frames;
6) hurt, the bronze cracks a little more, 3 frames;
7) calm moment: she stops, looks back at the girl's silhouette, hands lowered (used when the player plays the music box), 4 frames;
8) defeat: the bell cracks open, all voices fly free upward as lights, Miriam sinks to her knees on the floor as a normal woman, 6 frames.
Sheet 576x768.
```
```
[STYLE BLOCK]
Battle effect strips for a boss, transparent background, crisp pixels, frames in one row: 1) "funeral toll" giant concentric bronze and turquoise rings filling the frame, 96x96, 8 frames; 2) "chorus of voices" many thin light streaks flying from right to left, 96x48, 6 frames; 3) "lullaby" soft drifting lilac and turquoise notes (as abstract shapes, not real notation), 64x64, 8 frames; 4) "voices set free" dozens of small lights rising and fading, 96x96, 8 frames.
```
Ablage: `public/sprites/battle/enemy_miriam_glocke.png`, `public/sprites/fx/fx_grabgelaeut.png`, `fx_chor_stimmen.png`, `fx_wiegenlied.png`, `fx_stimmen_frei.png`.

Boss-Einblendung (Band ist schon da, nur das Bild fehlt):
```
[STYLE BLOCK]
Dramatic boss bust portrait, 160x160 px, transparent background: Miriam Vey rising from a giant cracked bronze bell, arms spread, hair floating, turquoise light pouring from the cracks, tiny lights of stolen voices circling her.
```
Ablage: `public/sprites/ui/J_08_boss_miriam_glocke.png`.

## 6. Gegner auf der Karte
```
[STYLE BLOCK]
Overworld sprite sheet for a roaming enemy in a top-down 3/4 view: [BESCHREIBUNG]. Frame size [GRÖSSE]. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk/move cycle). Transparent background, grid-aligned, 1px dark outline, matches the scale of the existing 16x32 characters.
```
| Datei (`public/sprites/characters/`) | Größe | `[BESCHREIBUNG]` |
|---|---|---|
| `J_ow_chorwaechter.png` | 16x32 | a broad choir guard in a grey robe with a bronze singing-mouth mask, swinging a handbell on a chain |
| `J_ow_stimmenfresser.png` | 16x32 | a hunched smoke-and-paper creature with a huge round glowing mouth, shuffling |
| `J_ow_bronzeengel.png` | 32x32 | a bronze angel statue with bell-plate wings, gliding stiffly a little above the ground |
| `J_ow_glockenecho.png` | 32x32 | a small cloud of floating tiny bells and turquoise rings |

## 7. Zugleiste und Bestiarium
```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: choir guard with bronze mouth mask, voice eater mouth, bronze angel, bell echo swarm, Miriam fused with the bell.
```
Reihenfolge/IDs: `chorwaechter, stimmenfresser, bronzeengel, glockenecho, miriam_glocke`. Ablage: `public/sprites/ui/J_zug_portraits.png`.
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [GEGNER] in the upper two thirds, a pinned specimen label shape and a few scribbled notes as abstract lines (no readable text) in the lower third, a coffee stain in a corner.
```
Fünf Karten für dieselben IDs. Ablage: `public/sprites/ui/bestiary/J_<id>.png`.

## 8. Gegenstände und Hinweise

### 8.1 Item-Icons (16x16 plus 32x32)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, [N] icons in a row, plus the same icons again at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim, each centered: [LISTE]
```
**Fall-5-Gegenstände** (`J_items`, 6 Icons): `lilians_spieluhr` (a small worn wooden music box with a tiny dancing girl figure on the lid), `stimmgabel_silber` (a silver tuning fork with a faint turquoise shimmer), `glockenzunge` (a heavy bronze clapper tongue of a small bell), `veys_tagebuch` (a grey cloth diary with a black ribbon and an eye-in-a-circle clasp), `giessform` (a broken piece of clay bell mould with a carved pattern), `chorliste` (a folded list of names with several crossed out, no readable text).

**Belohnungen** (`J_belohnungen`, 4 Icons; Vorschlag, der Spiel-Thread entscheidet, ob er sie vergibt): `amulett_wiegenlied` (a tiny silver music box pendant), `mantel_giesser` (a scorched heavy leather foundry coat), `taktstock_vey` (Miriam's dark slim conductor's baton with a bronze tip), `hut_chor` (a grey choir hood with a bronze clasp).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten unter `public/sprites/items/J_items.png` und `J_belohnungen.png`.

### 8.2 Hinweis-Props auf den Karten
```
[STYLE BLOCK]
Investigation hotspot props, 16x16 each, in a row, transparent background, each with a subtle 1px light rim: a bronze shaving curl on the floor, a child's chalk drawing of a bell on a wall, a burned page of sheet music, a dried white lily, a cracked sternglass phial with a faint glow left, grey choir robe threads caught on a nail, a small handprint in black casting sand, a candle stub melted into a ring shape, a smear of green bronze dust, a door with twelve tally marks scratched into the frame.
```
Ablage: `public/sprites/props/J_fall5_hinweise.png`.

### 8.3 Nahansichten (Untersuchen, normal und verflucht)
Wie die Nahansichten aus Batch H: großes Bild beim Untersuchen, die verfluchte Variante zeigt, was ein unvorsichtiger Blick auslöst.
```
[STYLE BLOCK]
Close-up inspection illustration, 160x120 px, not transparent, item centered on a dark cloth or desk background with soft lamplight from top-left: [MOTIV]. Second version of the same image (same framing): [FLUCH].
```
| Datei (`public/sprites/ui/inspect/`) | `[MOTIV]` | `[FLUCH]` |
|---|---|---|
| `lilians_spieluhr.png` / `lilians_spieluhr_fluch.png` | the open wooden music box, a tiny dancing girl figure, a folded note tucked into the lid | the dancing figure has turned to face the viewer, turquoise light spills out of the box and a small handprint appears on the glass |
| `veys_tagebuch.png` / `veys_tagebuch_fluch.png` | the open grey diary, neat handwriting as abstract lines, a pressed white lily between the pages | the lines of writing slide together into a drawing of a giant bell, ink running down the page like tears |
| `stimmgabel_silber.png` / `stimmgabel_silber_fluch.png` | a silver tuning fork on a velvet cloth, a tiny engraved eye on the handle | the fork vibrates on its own, faint rings of sound around it, the reflection in the metal shows a choir of open mouths |

### 8.4 Fallakte, Zwischensequenzen und Enden
```
[STYLE BLOCK]
Case file cover illustration, 128x96 px, not transparent: a small framed pixel-art vignette on a manila case folder background for the case The Choir in the Bell: a giant dark bell in a tower with turquoise light leaking from its mouth and a small music box in front. A paperclip and a wax seal in the corner. No text.
```
Ablage: `public/sprites/ui/cases/J_akte_fall5.png`.

```
[STYLE BLOCK]
Cutscene still in pixel art, 240x135 px, not transparent, cinematic close framing: [SZENE]. No text.
```
1. `J_szene_giessgrube.png` – Brannock with a lantern in the black sand casting pit, staring at a bronze bar glowing turquoise in his huge hands
2. `J_szene_kinderzimmer.png` – a child's room covered in dust, but the bed is freshly made and the rag doll sits upright on the pillow
3. `J_szene_oda.png` – Oda Vey at a kitchen table at night, an old photograph of two young sisters in front of her
4. `J_szene_lilian.png` – the translucent girl standing at the top of a dark staircase, holding out a hand
5. `J_szene_glocke_sinkt.png` – the giant bell sinking down through the shaft into the chamber, dust and light raining
6. `J_szene_stimmen_frei.png` – hundreds of small lights rising from the clock tower over the foggy rooftops at dawn

Ablage: `public/sprites/ui/scenes/<Datei>`.

```
[STYLE BLOCK]
Ending illustration in pixel art, 480x270 px, not transparent, cinematic composition: [SZENE]. Muted palette, strong mood lighting, no text.
```
| Datei | `[SZENE]` |
|---|---|
| `c5_perfect.png` | dawn over Kettlegate, the clock tower bell quiet, Miriam sitting on the chamber floor holding the music box, Lilian's light fading softly upward, Oda kneeling beside her sister |
| `c5_good.png` | Miriam led away in irons by constables through the fog, the bell cracked and silent behind them, the voices freed as small lights over the rooftops, but Lilian's light gone |
| `c5_early.png` | the investigator arriving too late in the resonance chamber: the bell has rung, the robes stand empty, faint turquoise light still pulsing in the floor, Miriam vanished |
| `c5_rust.png` | a wrongly arrested Rust Brother, a burly smith in a rust-red apron, being dragged into the police station, while in the background fog a grey-coated woman watches from a rooftop with a faint turquoise glow |

Ablage: `public/sprites/ui/endings/<Datei>`.

### 8.5 Kartenmarker für die große Stadtkarte
Wie `ui/C_08_map_markers.png` (13 Marker, Reihe 1 normal, Reihe 2 bernsteinfarben hervorgehoben). Die neuen Orte und alle Orte, die bisher einen geliehenen Marker benutzen, bekommen eigene.
```
[STYLE BLOCK]
City map location markers, 16x16 each, 13 in a row, second row the same markers in an amber highlighted state, transparent background, 1px dark outline, same hand-drawn ink style as the existing map markers: bell foundry (small bell with a hammer), villa ballroom (chandelier), north gate (gate arch), marsh (reeds and a will-o'-wisp), catacombs (skull in an arch), plague alleys (beaked mask), crater forest (glass shard tree), anchor yard (anchor with a rusty chain), Morrow house (veiled window), veil house (veil over a candle), rust chapel (rusted bell tower), photo studio (box camera), mirror cabinet (oval mirror).
```
Reihenfolge/IDs: `giesserei, ballsaal, nordtor, marsch, katakomben, pestgassen, kraterwald, ankerhof, haus_morrow, schleierhaus, rostkapelle, atelier, spiegelkabinett`. Ablage: `public/sprites/ui/J_map_markers.png` (208x32).

## 9. Kontrolle vor dem Abgeben
- Alle Kampf-Sheets haben 6 Spalten und die angegebene Sheet-Größe.
- `enemy_miriam_glocke` passt in Größe, Grundlinie und Farben zu `enemy_miriam`, damit der Phasenwechsel nicht springt.
- Lilians Echo ist freundlich und traurig, nie gruselig.
- Manifest `manifest-fall5.json`, Prompts in `docs/art/batch-fall5-generation.json`, Kurzeintrag in `docs/art/README.md`.
