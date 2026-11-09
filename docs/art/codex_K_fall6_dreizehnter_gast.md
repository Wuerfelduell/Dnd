# Codex-Batch K: Fall 6 „Der dreizehnte Gast“

**Batch-Name:** `fall6` (Manifest: `public/sprites/manifest-fall6.json`)

Auf allen Fotos der Ateliers in Kettlegate erscheint ein Fremder, der beim Fotografieren nicht da war: ein schlanker Herr im Frack ohne Gesicht. Wer mit ihm auf einer Platte steht, verliert ein paar Tage später seinen Schatten und wird blass und vergesslich. Die Spur führt vom Fotoatelier über einen Maskenball in der Villa Ashcombe bis ins Spiegelkabinett des Jahrmarkts am Nordtor. Dahinter steckt Lucan Mews, der Assistent der Fotografin. Er hat mit einer alten Silberbad-Formel einen Schatten-Gast „entwickelt“, der sich von gestohlenen Schatten ernährt.

**Schon fertig, nicht neu machen:** die E-Figuren `fotografin`, `wahrsagerin`, `student`, `kutscher` (Lauf-Sheet und Portraits), das Item `fotoplatte`, `D_04_fotograf` (Laden von außen), `D_05_villen` mit Props, `D_05_nordtor` mit Props, `bg_villa`, `bg_nordtor`, `enemy_spiegelschatten`, alle Sheets aus D, E, F, H, I.

**IDs im Spiel (mit dem Spiel-Thread abgestimmt):**
| Art | IDs |
|---|---|
| Fall | `case_06` |
| Maps | `atelier` (mit Dunkelkammer, Tür vom Altmarkt), `ballsaal` (Villa Ashcombe, Reiseziel), `spiegelkabinett` (Jahrmarkt, Tür vom Nordtor) |
| Figuren | `ashcombe`, `mews` (neu); dazu fertig `fotografin`, `wahrsagerin`, `student`, `kutscher` |
| Begegnungen / Gegner | `schattenabzug`, `negativ_geist`, `silberbad_schleim`, Boss `dreizehnter_gast` |
| Items | `fotoplatte` (fertig), `belichtungsmesser`, `gaesteliste`, `silbernitrat`, `schattenrest`, `kamera_alt` |
| Enden | `c6_perfect`, `c6_good`, `c6_early`, `c6_seer` |

**Reihenfolge:** 4 (Gegner) → 5 (Boss) → 1 (Orte) → 3 (Figuren) → 2 (Kampf-Hintergründe) → 6 bis 9.

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

### 1.1 Fotoatelier mit Dunkelkammer (`atelier`)
Vorne ein heller Aufnahmeraum mit Glasdach und gemalten Kulissen, hinten die Dunkelkammer, nur von einer gedämpften roten Lampe beleuchtet. An einer Wand hängen Dutzende Abzüge, auf allen steht derselbe Fremde.
```
[STYLE BLOCK]
Interior tileset for a Victorian photography studio, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: polished light wooden floor (4 variants), a black and white checkered floor area for posing (edges and corners), dark darkroom floor boards (4 variants) with chemical stains, wall top and front faces in cream plaster with dark wood trim (corners, edges), a wall section with a large skylight window showing grey sky, a darkroom wall with a thick black curtain doorway, a floor grate, a light-tight double door.
```
```
[STYLE BLOCK]
Prop sheet for a Victorian photography studio and darkroom, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a large wooden box camera on a tripod with a black cloth hood (16x32, cloth down and lifted frames), a posing chair with a head brace stand (16x32), painted backdrops on rollers (a garden scene and a seaside scene, 48x32 each, muted), a flash powder lamp on a pole (16x32, idle and flash frames with a white burst), a reception desk with an appointment book and a bell (32x16), a shelf of glass plates in wooden racks (32x32), a wall of pinned photographs, each showing small grey figures and one tall black figure in the back (48x32, no faces needed), a darkroom sink with three trays of liquid (32x16), a dim red safelight lamp (16x16, 2-frame flicker, the red is muted brick red), drying lines with prints hanging on pegs (32x16), brown chemical bottles on a shelf (32x16), a locked cabinet with a silver label shape (16x32, closed and open), a single plate in a tray where a faceless figure slowly appears (16x16, 4 frames).
```
Ablage: `public/sprites/tilesets/K_atelier_tiles.png`, `public/sprites/props/K_atelier_props.png`.

### 1.2 Ballsaal der Villa Ashcombe (`ballsaal`)
Ein prächtiger, aber kalter Ballsaal. Lady Ashcombe gibt einen Maskenball, um dem Gerede über ihre schattenlosen Gäste zu trotzen. Dreizehn Stühle an der Tafel, obwohl nur zwölf Gäste geladen sind.
```
[STYLE BLOCK]
Interior tileset for a grand cold Victorian ballroom, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: polished dark marble floor in a diamond pattern (4 variants), a parquet dance floor with an inlaid star (edges, corners, center), a long burgundy carpet (edges and corners), wall top and front faces with pale blue-grey panelling and gilded trim (corners, edges), a wall section with tall mirrors, a wall with heavy drawn curtains, a sweeping staircase (top, middle, bottom), a balcony railing.
```
```
[STYLE BLOCK]
Prop sheet for a Victorian masked ball in a villa, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a large crystal chandelier seen from above with candle flames (48x48, 3-frame flicker), a long banquet table with thirteen place settings and candelabras (80x32), thirteen chairs (16x16, one of them pulled out and slightly frosted), a grand piano (32x32), a string quartet's empty music stands and chairs (32x32), potted palms (16x32), a punch bowl on a side table (16x16), a table with a stack of black invitation cards and masks (32x16), a full-length photograph of the party guests on an easel (16x32), a tall standing mirror with a gilded frame in which no reflection appears (16x32), a grandfather clock (16x32), a cloakroom rack full of coats and top hats (32x32).
```
```
[STYLE BLOCK]
Party guest NPC sprite sheets, 16x32 per frame, 4 rows (facing down, left, right, up) x 4 columns (walk cycle), transparent background, each guest wears an elegant Victorian evening outfit and a simple masquerade mask: 1) an older gentleman in a black tailcoat with a silver fox mask; 2) a lady in a deep green gown with a feather mask; 3) a young officer in a dark red dress uniform with a plain white mask; 4) a lady in a lilac gown with a lace veil mask. Four separate sheets of 64x128.
```
Ablage: `public/sprites/tilesets/K_ballsaal_tiles.png`, `public/sprites/props/K_ballsaal_props.png`, `public/sprites/characters/K_gast_1_walk.png` bis `K_gast_4_walk.png`.

### 1.3 Spiegelkabinett am Nordtor (`spiegelkabinett`)
Ein Jahrmarktszelt mit Spiegellabyrinth. Manche Spiegel zeigen den Spieler ohne Schatten, andere den Fremden direkt hinter ihm. Im Zentrum steht Mews' Kamera, mit der der Gast „entwickelt“ wurde.
```
[STYLE BLOCK]
Interior tileset for a fairground mirror maze inside a striped tent, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: worn wooden plank floor with sawdust (4 variants), a faded striped canvas tent wall in dull red and cream (top and front faces, corners), mirror wall segments seen from above as thin silver lines with gilded frames (straight, corner, T-junction, end piece), a mirror wall face showing a distorted reflection (3 variants: stretched, squashed, empty), a floor tile with a painted arrow shape, a dark center area with chalk marks.
```
```
[STYLE BLOCK]
Prop sheet for a fairground mirror maze and its secret center, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a ticket booth with a striped awning (32x32), a rope barrier with brass posts (32x16), an oil lamp on a hook (16x16, flicker), a broken mirror with shards on the floor (16x32), a mirror in which a faceless gentleman in a tailcoat stands (16x32, 4 frames, he slowly comes closer), a large old box camera with brass lens pointed at an empty chair, covered in silver dust and black wax (32x32), a developing tank bubbling with dark silver liquid (32x32, 4-frame bubble), coils of black photographic film spilling over the floor (32x16), a pile of collected shadows: flat dark shapes pinned to boards like butterflies (32x32, faint violet sheen).
```
```
[STYLE BLOCK]
Exterior fairground props at a city gate, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: the striped mirror maze tent entrance with a painted sign board (48x48, no text), a small carousel with wooden horses (48x48, 4-frame turn), a fortune teller's caravan (48x32), strings of paper lanterns (32x16, amber glow), a shooting gallery booth (32x32), a candy floss cart (16x16).
```
Ablage: `public/sprites/tilesets/K_spiegelkabinett_tiles.png`, `public/sprites/props/K_spiegelkabinett_props.png`, `public/sprites/props/K_jahrmarkt_aussen.png`.

### 1.4 Schatten-Overlays (Spielmechanik)
Abgelichtete Figuren verlieren ihren Schatten. Das Spiel legt den Schatten als eigenes Sprite unter Figuren und blendet ihn je nach Zustand.
```
[STYLE BLOCK]
Character shadow sprites for a top-down 3/4 game, transparent background, 16x8 px each, in a row: 1) normal soft oval shadow (dark blue-grey, dithered edge); 2) a thinner, paler shadow; 3) a broken shadow with gaps; 4) almost gone, only a faint outline; 5) a stolen shadow lying alone on the ground in the shape of a person (32x16, deep violet sheen); 6) a shadow detaching and slithering away (32x16, 4 frames).
```
Ablage: `public/sprites/fx/K_schatten.png`.

## 2. Kampf-Hintergründe (480x270, deckend)
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [ORT]. Layered depth (far silhouettes, mid layer, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the central area. Fog layers, muted palette. No characters, no text.
```
| Datei (`public/sprites/battle/`) | Map-ID | `[ORT]` |
|---|---|---|
| `bg_atelier.png` | `atelier` | a photography darkroom lit only by a dim brick-red safelight: trays of liquid, drying lines with prints, a big box camera on a tripod, black curtains |
| `bg_ballsaal.png` | `ballsaal` | a grand cold ballroom at night: crystal chandelier, tall mirrors without reflections, a long table with thirteen chairs, masks lying on the floor, candles guttering |
| `bg_spiegelkabinett.png` | `spiegelkabinett` | inside a fairground mirror maze: endless repeating mirrors with gilded frames, distorted reflections, an oil lamp, sawdust floor, a faceless figure faintly visible in the farthest mirror |
| `bg_spiegelkabinett_2.png` | `spiegelkabinett` (Boss) | the secret center of the mirror maze: a huge box camera with an open shutter like a dark eye, black film coiling everywhere, pinned stolen shadows on boards, mirrors cracking with violet light |

## 3. Figuren für Fall 6

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
| `ashcombe` | Lady Ashcombe, Gastgeberin des Maskenballs, stolz, hat selbst schon ihren Schatten verloren | neutral, suspicious, shocked, smiling faintly | a proud aristocratic widow in her sixties in a high-necked silver-grey silk gown, silver hair in an elaborate updo, a black lace fan, pearl choker, very pale skin and slightly faded colors as if she were fading |
| `mews` | Lucan Mews, Assistent der Fotografin und Täter, freundlich, unauffällig, besessen von Licht und Silber | neutral, suspicious, shocked, smiling faintly | a slight young man in his twenties with neatly parted dark hair, a brown waistcoat with rolled shirt sleeves, a stained rubber apron, silver-grey stains on his fingertips, round tinted spectacles, a polite eager smile |
| `mews_enthuellt` | Mews nach der Enthüllung (nur Portrait) | cold, triumphant, panicked, broken | the same young assistant without spectacles, eyes reflecting like silvered glass, a faint black silhouette of a tall faceless gentleman standing behind his shoulder |

Ablage: `public/sprites/characters/K_<id>_walk.png` (nicht für `mews_enthuellt`), `public/sprites/portraits/K_<id>_emotions.png`.

## 4. Neue Gegner in Fall 6 (Kampf)

Vorlage für alle Gegner dieses Abschnitts:
```
[STYLE BLOCK]
Side-view battle sprite sheet, [GRÖSSE] px per frame, facing left, 6 columns, transparent background, consistent baseline: [BESCHREIBUNG]. Rows: 1) idle, 4 frames; 2) attack A, wind-up held 2 frames, 6 frames; 3) attack B or skill, wind-up held 2 frames, 6 frames; 4) hurt, 3 frames; 5) defeated, 6 frames. Sheet [BREITE]x[HÖHE].
```
| Datei (`public/sprites/battle/`) | Größe | Sheet | `[BESCHREIBUNG]` | Angriff A / B |
|---|---|---|---|---|
| `enemy_schattenabzug.png` | 48x48 | 288x240 | a stolen shadow given shape: a flat dark violet-black human silhouette peeled off the floor, edges flapping like paper, two pale holes for eyes, the faint outline of the person it belonged to | A: slashes with flat sharp hands; B: sinks into the floor and strikes from below |
| `enemy_negativ_geist.png` | 64x64 | 384x320 | a ghost that looks like a photographic negative: inverted colors (pale where it should be dark), a Victorian lady in a ballgown with a black face and white eyes, edges crawling with film grain and scratches | A: flash of inverted light that blinds; B: freezes the target in a picture frame for a moment |
| `enemy_silberbad_schleim.png` | 64x64 | 384x320 | a heaving blob of dark silver developing liquid with half-developed faces surfacing and sinking in it, a few glass plates stuck in its body, a chemical sheen | A: splashes corrosive silver; B: swallows a reflection and spits out a copy (a small grey clone shape) |

Effekte dazu:
```
[STYLE BLOCK]
Battle effect strips, transparent background, crisp pixels, frames in one row: 1) "magnesium flash" a white-amber burst with smoke, 48x48, 6 frames; 2) "picture frame trap" a gilded frame snapping shut around a target, 48x48, 6 frames; 3) "silver splash" dark silver droplets, 32x32, 6 frames; 4) "shadow theft" a dark shape being pulled out from under a target, 48x32, 6 frames; 5) status icons 16x16, 4 frames each: "shadowless" (a figure with no shadow), "blinded" (eye with white starburst).
```
Ablage: `public/sprites/fx/fx_blitzlicht.png`, `fx_bilderrahmen.png`, `fx_silberspritzer.png`, `fx_schattenraub.png`, `fx_status_schattenlos.png`, `fx_status_geblendet.png`.

## 5. Boss Fall 6: Der dreizehnte Gast (96x96)

Ein hochgewachsener Herr im Frack, ohne Gesicht, nur eine glatte, leicht spiegelnde Fläche. Er besteht aus allen Schatten, die er gestohlen hat; in seinem Körper sieht man die Umrisse der Opfer.
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: the Thirteenth Guest, an unnaturally tall slender gentleman in an old-fashioned black tailcoat and top hat, white gloves, his face a smooth featureless oval like an unexposed photographic plate with a faint silver sheen; his coat is made of layered stolen shadows, and faint outlines of people are visible moving inside it; long black film strips trail from his coattails. Rows:
1) idle, bowing slightly and straightening, film strips drifting, 4 frames;
2) attack "Belichtung": raises one gloved hand, his face flashes blinding white, wind-up held 2 frames, 6 frames;
3) attack "Schattenschnitt": his shadow lunges across the ground like a blade, wind-up held 2 frames, 6 frames;
4) skill "Gruppenbild": pulls the party into a frozen photograph (a frame appears around him and them), 6 frames;
5) summon: two shadow cut-outs peel from his coat, 6 frames;
6) phase 2: his top hat falls, his face cracks and shows a dark camera lens inside, the coat opens wide with the trapped shadows, 6 frames;
7) hurt, 3 frames;
8) defeat: the stolen shadows burst out and fly away in all directions, he collapses into a pile of black film and an empty tailcoat, 6 frames.
Sheet 576x768.
```
```
[STYLE BLOCK]
Battle effect strips for a boss, transparent background, crisp pixels, frames in one row: 1) "exposure" a blinding white oval flash with silver grain, 96x96, 8 frames; 2) "group portrait" a large gilded frame forming and freezing in sepia tones, 96x96, 8 frames; 3) "shadows set free" many dark human shapes flying upward and dissolving into light, 96x96, 8 frames.
```
```
[STYLE BLOCK]
Dramatic boss bust portrait, 160x160 px, transparent background: the Thirteenth Guest, a tall faceless gentleman in a top hat and tailcoat, his blank silver face reflecting a tiny camera flash, ghostly outlines of people trapped in his coat.
```
Ablage: `public/sprites/battle/enemy_dreizehnter_gast.png`, `public/sprites/fx/fx_belichtung.png`, `fx_gruppenbild.png`, `fx_schatten_frei.png`, `public/sprites/ui/K_08_boss_gast.png`.

## 6. Gegner auf der Karte
```
[STYLE BLOCK]
Overworld sprite sheet for a roaming enemy in a top-down 3/4 view: [BESCHREIBUNG]. Frame size [GRÖSSE]. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk/move cycle). Transparent background, grid-aligned, 1px dark outline, matches the scale of the existing 16x32 characters.
```
| Datei (`public/sprites/characters/`) | Größe | `[BESCHREIBUNG]` |
|---|---|---|
| `K_ow_schattenabzug.png` | 16x32 | a flat violet-black human silhouette sliding over the floor, edges flapping |
| `K_ow_negativ_geist.png` | 16x32 | a negative-image ghost lady in a ballgown, inverted colors, flickering |
| `K_ow_silberbad_schleim.png` | 32x32 | a creeping blob of dark silver liquid with glass plates stuck in it |
| `K_ow_dreizehnter_gast.png` | 16x32 | a very tall faceless gentleman in a top hat and tailcoat, walking slowly and silently (appears in the background of maps before the boss fight) |

## 7. Zugleiste und Bestiarium
```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: flat shadow silhouette, negative-image ghost lady, silver slime blob, faceless gentleman in a top hat.
```
Reihenfolge/IDs: `schattenabzug, negativ_geist, silberbad_schleim, dreizehnter_gast`. Ablage: `public/sprites/ui/K_zug_portraits.png`.
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [GEGNER] in the upper two thirds, a pinned specimen label shape and a few scribbled notes as abstract lines (no readable text) in the lower third, a coffee stain in a corner.
```
Vier Karten für dieselben IDs. Ablage: `public/sprites/ui/bestiary/K_<id>.png`.

## 8. Gegenstände und Hinweise

### 8.1 Item-Icons (16x16 plus 32x32)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, [N] icons in a row, plus the same icons again at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim, each centered: [LISTE]
```
**Fall-6-Gegenstände** (`K_items`, 5 Icons, `fotoplatte` gibt es schon): `belichtungsmesser` (a small brass exposure meter with a dial and a needle), `gaesteliste` (a cream card list on a silver tray, thirteen lines as abstract strokes, the last one in black ink), `silbernitrat` (a brown glass bottle with a silver stopper and a faint shimmer), `schattenrest` (a small folded piece of dark violet shadow, like cloth that is not quite there), `kamera_alt` (a small old folding camera with bellows and a brass lens).

**Belohnungen** (`K_belohnungen`, 4 Icons; Vorschlag, der Spiel-Thread entscheidet): `amulett_schatten` (a black cameo locket with a tiny silhouette inside), `hut_maskenball` (a black top hat with a silver half mask tucked into the band), `mantel_frack` (a black tailcoat with silver buttons), `blitzpulver` (a paper twist of magnesium flash powder, usable in battle).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten unter `public/sprites/items/K_items.png` und `K_belohnungen.png`.

### 8.2 Hinweis-Props auf den Karten
```
[STYLE BLOCK]
Investigation hotspot props, 16x16 each, in a row, transparent background, each with a subtle 1px light rim: silver-grey fingerprints on a door handle, a spilled tray of developer liquid, a black invitation card on the floor, a white glove without a hand-shaped dent, a pale spot on the floor where a shadow should be, a strip of exposed film, a broken lens, footprints in sawdust that stop in front of a mirror, a smudge of black wax with a silver sheen, a thirteenth place card at a table.
```
Ablage: `public/sprites/props/K_fall6_hinweise.png`.

### 8.3 Nahansichten: die wandernde Fotoplatte
Die Fotoplatte zeigt den Fremden in jedem Untersuchen ein Stück näher. Vier Stufen für den Fortschritt im Fall, dazu die verfluchte Variante, wenn man zu lange hinschaut.
```
[STYLE BLOCK]
Close-up inspection illustration, 160x120 px, not transparent: an old glass photographic plate held against lamplight, showing a sepia group photograph of twelve party guests. [STUFE]. Same framing in every version.
```
| Datei (`public/sprites/ui/inspect/`) | `[STUFE]` |
|---|---|
| `fotoplatte_1.png` | a tiny faceless figure in a top hat stands far in the background behind the guests |
| `fotoplatte_2.png` | the faceless figure stands directly behind the last row of guests, one gloved hand on a shoulder |
| `fotoplatte_3.png` | the faceless figure stands in the front row; two guests next to him have no shadows on the floor |
| `fotoplatte_4.png` | the faceless figure fills the center of the plate, his blank face turned toward the viewer, all guests faded |
| `fotoplatte_fluch.png` | the plate is empty except for the faceless figure, and a gloved hand seems to press against the inside of the glass toward the viewer |

### 8.4 Fallakte, Zwischensequenzen und Enden
```
[STYLE BLOCK]
Case file cover illustration, 128x96 px, not transparent: a small framed pixel-art vignette on a manila case folder background for the case The Thirteenth Guest: a sepia group photograph with a tall faceless gentleman in a top hat standing in the back row. A paperclip and a wax seal in the corner. No text.
```
Ablage: `public/sprites/ui/cases/K_akte_fall6.png`.

```
[STYLE BLOCK]
Cutscene still in pixel art, 240x135 px, not transparent, cinematic close framing: [SZENE]. No text.
```
1. `K_szene_abzuege.png` – a wall of pinned photographs, the same faceless gentleman in every one, the photographer woman staring at them in horror
2. `K_szene_schattenlos.png` – a lady walking past a gas lamp on a wet street, casting no shadow at all
3. `K_szene_maskenball.png` – the masked ball in full swing, and at the far end of the hall a tall figure in a top hat stands motionless among dancers
4. `K_szene_dunkelkammer.png` – Mews in the darkroom under the red safelight, lifting a dripping print out of a tray, smiling
5. `K_szene_spiegel.png` – the investigator in the mirror maze, a hundred reflections, and in one of them the faceless gentleman directly behind
6. `K_szene_schatten_frei.png` – stolen shadows flowing back across the night city to their owners like dark ribbons

Ablage: `public/sprites/ui/scenes/<Datei>`.

```
[STYLE BLOCK]
Ending illustration in pixel art, 480x270 px, not transparent, cinematic composition: [SZENE]. Muted palette, strong mood lighting, no text.
```
| Datei | `[SZENE]` |
|---|---|
| `c6_perfect.png` | the villa ballroom at dawn, the guests standing in a beam of morning light and every one of them casting a shadow again, Lady Ashcombe looking down at her own shadow, the photographer taking a new group photo with no stranger in it |
| `c6_good.png` | Mews led out of the fairground in handcuffs by constables, the mirror tent collapsed behind him, a few shadows still drifting lost over the rooftops |
| `c6_early.png` | an empty photo studio, the camera gone, a single fresh print on the floor showing the investigator with a tall faceless figure standing behind them |
| `c6_seer.png` | the old fortune teller wrongly arrested, sitting in a police cell with her shawl and coins, while outside the window a faceless gentleman tips his top hat |

Ablage: `public/sprites/ui/endings/<Datei>`.

## 9. Kontrolle vor dem Abgeben
- Alle Kampf-Sheets haben 6 Spalten und die angegebene Sheet-Größe.
- Der dreizehnte Gast bleibt elegant und unheimlich, nie blutig; sein Gesicht ist immer leer.
- Das Rot der Dunkelkammer ist gedämpftes Ziegelrot, keine grelle Primärfarbe.
- Manifest `manifest-fall6.json`, Prompts in `docs/art/batch-fall6-generation.json`, Kurzeintrag in `docs/art/README.md`.
