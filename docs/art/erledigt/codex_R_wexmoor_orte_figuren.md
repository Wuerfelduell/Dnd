# Codex-Batch R: Kapitel 2 „Die Moorstadt“, Orte, Figuren, Bosse

**Batch-Name:** `wexmoor2` (Manifest: `public/sprites/manifest-wexmoor2.json`)

Kapitel 2 ist im Spiel komplett spielbar (Akt I bis V, vier Enden), läuft aber fast nur mit geliehenen Kettlegate-Kacheln und Platzhalter-Figuren. Diese Datei liefert alles, was Wexmoor ein eigenes Gesicht gibt: Kacheln und Props für alle Karten, die Figuren, Verkleidungen des Spielers, Kampf-Hintergründe, die beiden Bosse, Szenen und Enden.

**Wexmoor in einem Satz:** eine arme Moorstadt auf Pfählen mit Torfstichen, Schleusen, einem Salzmarkt auf Holzplattformen, einem Bojenhafen, einer reichen Oberstadt aus Stein (Lichtamt, Akademie der Sternkunde, Wachhaus) und draußen im Vergessmoor einer Leuchtturminsel. Der Leuchtturm brennt seit dreihundert Jahren mit dem Licht von Fremden, Lichtmeisterin Ilse Brandt hält ihn am Brennen.

**Farben:** gleiche Palette wie Kettlegate, aber nasser und flacher: Torfbraun, Schilfocker, Moorgrün, Holzgrau, Salzweiß, kaltes Schwarzwasser. Licht fast nur von Öllampen und Sturmlaternen (Bernstein). Das Lichtamt und der Leuchtturm haben ein kaltes, fast weißes Licht mit einem Stich ins Blasse (#e8f0ff); das ist das „gestohlene Licht“, sparsam einsetzen.

**Schon fertig, nicht neu machen:** Batch Q (`zunder`, `druce`, `npc_grauspaeher`, Lichtkegel, Stadtkarte Wexmoor mit Markern, Kajüte `wx_kahn`), alle Kettlegate-Sheets, `kit`, `marlowe`, Miriam Vey, Monster aus Batch G (die Wexmoor-Monster bekommen eigene Sheets in Batch S).

**Reihenfolge:** 3 (Figuren) → 1 (Orte) → 5 (Bosse) → 2 (Kampf-BGs) → 4, 6.

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

Draufsicht 3/4 auf dem 16er-Raster. Tilesets als Atlas, 8 Tiles pro Reihe, ohne Outline; Props mit 1px Outline. Außenkarten sind breit (40 bis 56 Tiles), Innenräume klein.

### 1.1 Gemeinsame Wexmoor-Außenkacheln
Werden auf allen Außenkarten benutzt.
```
[STYLE BLOCK]
Exterior tileset for a marsh town built on stilts, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: wet wooden boardwalk planks (horizontal and vertical, 4 variants each), boardwalk edges over water with visible stilts (all edges and corners), black still marsh water (4 variants, 2-frame shimmer), water with floating reeds and duckweed, reed beds (edges and corners), peat mud ground (4 variants), mud with puddles, cobblestones only for the upper town (4 variants), a small plank bridge (horizontal and vertical), a rope railing overlay, salt crust on planks (2 variants), a stone quay edge (for the harbour).
```
```
[STYLE BLOCK]
Exterior facade set for a poor marsh town, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: narrow tarred timber houses on stilts with crooked roofs of reed thatch and tarpaper (3 variants, 48x64 each), a lean-to shed with stacked peat (32x32), a tall narrow warehouse of grey boards with a hoist beam (48x64), doors and windows as separate pieces (dark, lit amber, shuttered), stilts and ladders down to the water (16x32), hanging fish and nets on a rack (32x32), smoking stovepipe chimneys (16x16, 3-frame smoke).
```
Ablage: `public/sprites/tilesets/R_wexmoor_tiles.png`, `public/sprites/props/R_wexmoor_fassaden.png`.

### 1.2 Güterbahnhof und Schleusenviertel (`wx_bahnhof`)
```
[STYLE BLOCK]
Prop sheet for a small freight station and lock district in a marsh town, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a short railway track with sleepers (horizontal tiles 16x16, buffer stop 16x16), a small steam locomotive with coal tender seen from above-side (80x32, 2-frame steam), a goods wagon (48x32), a coal heap and a coal crane (32x48), a big wooden lock gate with a turning wheel (48x48, closed and open frames), a lock keeper's hut (32x32), a station building of soot-grey boards with a clock (no numerals) and a ticket window (64x48), a notice board with wanted posters (32x32, no text, one face shape), peat barges moored in the lock (64x16), sacks and crates (16x16).
```
Ablage: `public/sprites/props/R_bahnhof_props.png`.

### 1.3 Torfstich am Moorrand (`wx_torfstich`)
```
[STYLE BLOCK]
Prop sheet for peat cutting fields at the edge of a marsh, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: long straight peat trenches with dark wet walls (16x16 edge pieces), stacks of drying peat bricks (16x16, 3 variants), a peat cutter's spade stuck in the ground (16x32), a half-sunken wooden barge in the mud (64x32), a wheelbarrow of peat (16x16), a cutters' shelter with a canvas roof (48x32), a wooden marker post with a carved symbol (16x32), a bog oak root sticking out of the peat (32x32), a small shrine with name tablets (16x32), a lantern on a pole (16x32, flicker).
```
Ablage: `public/sprites/props/R_torfstich_props.png`.

### 1.4 Salzmarkt mit Wirtshaus „Zur Ertrunkenen Glocke“ (`wx_salzmarkt`)
```
[STYLE BLOCK]
Prop sheet for a salt market on wooden platforms, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: market stalls with canvas roofs selling salt, fish and peat (48x32, 3 variants), stacked salt barrels with white crust (16x16), a big brass scale for salt (32x32), a pawn shop front with three hanging balls and barred windows (48x48), the tavern "The Drowned Bell": a tall timber front with a green-bronze ship's bell hanging upside down as a sign, warm amber windows (64x64), tavern interior pieces: bar counter with taps (48x16), round tables with stools (32x32), a fireplace (32x32), the drowned bell hanging from the ceiling (32x32), a watch post with a grey flag (16x32).
```
Ablage: `public/sprites/props/R_salzmarkt_props.png`.

### 1.5 Bojenhafen (`wx_bojenhafen`)
```
[STYLE BLOCK]
Prop sheet for a buoy harbour in a marsh town, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: bell buoys floating on water, red-brown and green, each with a small bell (16x32, 4-frame bob, bell swinging), mooring posts (16x16), fishing boats (48x16, 2 variants) and a rowing boat (32x16), a buoy master's workshop shed with buoys stacked outside (48x32), nets drying on poles (32x32), lobster pots and crates (16x16), a crane for lifting buoys (32x48), a small harbour light on a post with a pale white glow (16x32), the distant lighthouse seen far away as a background piece (32x64, a thin white beam).
```
Ablage: `public/sprites/props/R_bojenhafen_props.png`.

### 1.6 Oberstadt (`wx_oberstadt`) mit Lichtamt, Akademie und Wachhaus
Die einzige Gegend aus Stein: reich, sauber, hell erleuchtet, voller Grauspäher.
```
[STYLE BLOCK]
Prop sheet for the stone upper town of a marsh town, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: the Light Office: a pale limestone building with columns and a big round window like a lens, glowing cold white inside (80x64); the Academy of Star Lore: a dark stone building with a small copper observatory dome and a gate with star ironwork (80x64); the watch house: a squat grey stone building with a grey flag and barred windows (64x48); townhouses of grey stone with white window frames (48x64, 2 variants), house number 9 with drawn curtains and empty oil barrels stacked by the door (48x64); tall street lamps with cold white light (16x32), a fountain with a lighthouse statue (32x32), clipped hedges in planters (16x16), a notice board of the Light Office (32x32, no text).
```
Ablage: `public/sprites/props/R_oberstadt_props.png`.

### 1.7 Altes Pfahldorf (`wx_pfahldorf`)
```
[STYLE BLOCK]
Prop sheet for an old stilt village of marsh people, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: round huts of reed and clay on tall stilts with ladders (48x48, 2 variants), walkways of lashed poles between them (16x16 pieces), a central shrine: a wooden frame full of hundreds of small hanging wooden name tablets, some freshly carved (48x48, tablets swaying 2 frames), a carving stool with knife and blank tablets (16x16), smoking fish over a fire (32x16, flicker), laundry lines with grey cloth (32x16), eel traps (16x16), a dugout canoe (32x16), reed bundles (16x16).
```
Ablage: `public/sprites/props/R_pfahldorf_props.png`.

### 1.8 Innenräume: Akademie, Haus Lucent, Wachhaus, Zelle
```
[STYLE BLOCK]
Interior tileset for buildings of a marsh town, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain, four themes with floor (4 variants each) and wall faces (top, front, corners): 1) academy library: dark oak parquet, walls of bookshelves and star charts; 2) wealthy townhouse: grey-blue patterned carpet, pale panelling; 3) watch house: scrubbed grey flagstones, whitewashed walls with damp stains and a grey stripe; 4) prison cell: wet stone floor with straw, rough stone wall, an iron bar door (closed and open).
```
```
[STYLE BLOCK]
Interior prop sheet, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: ACADEMY: a lecture desk (32x16), a brass orrery (32x32, slow 4-frame turn), a long reading table with green lamps (48x16), a telescope on a tripod (16x32), stacks of books (16x16, 3 variants), a polished lens on a stand (16x16, glint), an archive cabinet (32x32). LUCENT'S HOUSE: a tall mirror that reflects the room but no person (16x32), dozens of empty lamp oil barrels (16x16), a bed never slept in (32x32), a writing desk with a bundle of letters under a loose floorboard (32x16 plus 16x16 floorboard closed and open), a coat stand with a pale coat that seems to glow faintly (16x32). WATCH HOUSE: a sergeant's desk with a ledger and a red cord (32x16), a rack of storm lanterns (32x32), a file cabinet (16x32, closed and open), a gun rack with staffs (16x32), a bench for prisoners (32x16), a wall map of the town (32x32, no text). CELL: a plank bed (16x32), a bucket (16x16), a barred window high up (16x16), scratch marks counting days (16x16).
```
Ablage: `public/sprites/tilesets/R_innen_tiles.png`, `public/sprites/props/R_innen_props.png`.

### 1.9 Das Vergessmoor (`wx_vergessmoor`, Gefahrengebiet ☠☠)
Hier holt sich das Moor, was zu lange stillsteht. Wer seinen Namen vergisst, bleibt.
```
[STYLE BLOCK]
Exterior tileset for a haunted endless marsh, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: black mirror-still water (4 variants), water with pale white reflections of lights that are not there (2-frame shimmer), sinking boardwalk planks partly underwater (4 variants plus edges), grey reed beds (edges and corners), bog moss islands (edges and corners), mist overlay tiles (3 variants, semi-dithered).
```
```
[STYLE BLOCK]
Prop sheet for a haunted marsh, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: dead twisted trees (32x48, 2 variants), half-sunken name tablets sticking out of the water (16x16, 3 variants, no letters), an abandoned peat cutter's spade with a cap hung on it (16x32), a stolen rowing boat pulled into the reeds (32x16), small white lights hovering above the water (16x16, 4-frame drift), a stone marker with a carved eye (16x32), the lighthouse island shore with black rocks (64x32).
```
Ablage: `public/sprites/tilesets/R_vergessmoor_tiles.png`, `public/sprites/props/R_vergessmoor_props.png`.

### 1.10 Der Leuchtturm (`wx_leuchtturm`, Gefahrengebiet ☠☠☠☠, Finale)
Unten Gewölbe voller Namenstäfelchen, eine Wendeltreppe hinauf, oben die Linse und das Feuer aus gestohlenem Licht.
```
[STYLE BLOCK]
Interior tileset for an ancient lighthouse, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: worn round stone floor (4 variants), stone floor with cold white light seeping through cracks (2 variants, 2-frame pulse), curved thick stone walls (top and front faces, round room segments), walls with niches full of tiny wooden name tablets, a spiral stair (up and down pieces), the lantern room floor of brass grating with light shining up from below, salt-crusted stone near the entrance.
```
```
[STYLE BLOCK]
Prop sheet for an ancient lighthouse used to burn stolen light, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: the giant faceted lighthouse lens seen from above, glowing cold white (64x64, 4-frame rotation glint), the "fire": a pale white flame-shaped mass of many small lights inside the lens (32x48, 6-frame flicker), Brandt's white coat on a hook (16x32), a ledger desk of the Light Office (32x16), racks of glass jars with trapped small lights (32x32, flicker), name tablets piled on the floor (16x16), a brass mechanism with weights and chains (32x48), a round window with a view of the sea (32x32), a small cot and a tea set (Brandt lives here) (32x16).
```
Ablage: `public/sprites/tilesets/R_leuchtturm_tiles.png`, `public/sprites/props/R_leuchtturm_props.png`.

## 2. Kampf-Hintergründe (480x270, deckend)
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [ORT]. Layered depth (far silhouettes, mid layer, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the central area. Fog layers, muted palette. No characters, no text.
```
| Datei (`public/sprites/battle/`) | Map-ID | `[ORT]` |
|---|---|---|
| `bg_wx_stege.png` | Stadtkarten (Bahnhof, Salzmarkt, Bojenhafen, Pfahldorf) | wet boardwalks between stilt houses at night, black water below, a lock gate and a smoking chimney in the background, bell buoys glinting far away |
| `bg_wx_oberstadt.png` | `wx_oberstadt`, `wx_wachhaus` | a clean stone street of the upper town at night under cold white street lamps, the Light Office with its round lens window behind |
| `bg_vergessmoor.png` | `wx_vergessmoor` | an endless black marsh, sinking boardwalk, grey reeds, dead trees, white lights hovering, the lighthouse beam sweeping through the fog far away |
| `bg_leuchtturm.png` | `wx_leuchtturm` | the vaulted base of a lighthouse, walls with niches full of name tablets, a spiral stair, cold white light pouring down from above |
| `bg_leuchtturm_oben.png` | `wx_leuchtturm` (Boss) | the lantern room at the top: the giant lens, the sea and night sky through the windows, a mass of white stolen light in the center |

## 3. Figuren

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
| `hesper` | Hesper Quell, Wirtin der Ertrunkenen Glocke, grob und herzlich | a broad strong woman in her sixties with white hair in a thick knot, a dark red dress with rolled sleeves and a stained apron, big red hands, a cloth over her shoulder, a scowl that hides a soft heart |
| `brack` | Ottilie Brack, Bojenmeisterin, schweigsam, kennt das Wasser | a lean weathered woman in her forties in dark blue-green oilskins and a yellow sou'wester hat, dark hair in a short braid, a net needle in hand, calm watchful eyes |
| `pedell` | Ruprecht Lamm, Pedell der Akademie, umständlich, neugierig | a thin stooped man in a threadbare dark blue academy robe, grey hair combed over, a broom and a big ring of keys, a fussy nervous face |
| `sedge` | Mutter Sedge, Älteste im Pfahldorf, schnitzt Namenstäfelchen | a tiny very old marsh woman with white hair in braids, a moss-green shawl and layers of brown cloth, a small knife and a wooden tablet in her hands, deep wrinkles, dark sharp eyes |
| `wyle` | Magistra Edda Wyle, emeritierte Professorin der Sternkunde, freundlich, scharfsinnig | a very old small woman in a violet-black academic gown with a star-embroidered collar, snow-white hair under a velvet cap, round spectacles, polishing a lens with a cloth |
| `lichtmann` | Lucius Starling, „der Sternsammler“, halb aus Licht | a tall gaunt elderly professor in a pale grey-blue frock coat, white hair and beard, round lenses in a brass frame over his eyes; his hands and face are partly translucent with a soft white glow showing through, as if he were made half of light; an empty oil can at his side |
| `hale` | Wachtmeisterin Bryony Hale, Grauspäherin vom Salzmarkt, ehrlich, zweifelt | a tall Grey Scout watchwoman in the grey waxed coat and wide grey oilskin hat of the town watch, a red sergeant's cord on the shoulder, a storm lantern, dark hair under the hat, a hard but fair face |
| `brandt` | Lichtmeisterin Ilse Brandt, Herrin des Leuchtturms, freundlich, unerbittlich | a small white-haired elderly woman in a long white coat of the Light Office with gold trim, a gold signet ring with a lighthouse, a handkerchief for polishing lenses, a gentle grandmotherly face with very pale, very cold eyes |

Sonderfall `lichtmann`: Im Lauf-Sheet flackert er leicht (Frame 2 und 4 etwas durchscheinender). Zusätzlich ein Portrait-Sheet `R_lichtmann_verblassend_emotions.png` mit stärker durchsichtigem Gesicht (gleiche vier Emotionen) für Akt V.

Ablage: `public/sprites/characters/R_<id>_walk.png`, `public/sprites/portraits/R_<id>_emotions.png`, Köpfe für das Notizbuch zusätzlich `public/sprites/ui/heads/<id>.png` (24x24).

### 3.1 Verkleidungen des Spielers
Der Spieler wechselt am Kleiderhaken die Kleidung, damit die Grauspäher ihn nicht erkennen. Gleiche Figur und Proportionen wie das vorhandene Spieler-Lauf-Sheet, bitte als Vorlage mitgeben.
```
[STYLE BLOCK]
Player character sprite sheet, same body, face and proportions as the attached player walk sheet, 16x32 per frame, 4 rows (down, left, right, up) x 4 columns (walk), transparent background, wearing [KLEIDUNG].
```
| Datei (`public/sprites/characters/`) | `[KLEIDUNG]` |
|---|---|
| `R_spieler_torfkittel.png` | a brown peat-stained work smock with a rope belt, a flat cap and muddy boots |
| `R_spieler_fischerjacke.png` | a tarred dark fisherman's jacket, a knit cap and tall boots |
| `R_spieler_akademierobe.png` | a black academy robe with silver star embroidery on the collar and a square cap |

Dazu Icons 16x16 und 32x32 für die drei Verkleidungen (`torfkittel`, `fischerjacke`, `akademierobe`): `public/sprites/items/<id>.png`, `items/32/<id>.png`.

## 4. Szenen, Fallakte und Enden
```
[STYLE BLOCK]
Case file cover illustration, 128x96 px, not transparent: a small framed pixel-art vignette on a manila case folder background for the case The Marsh Town: a lighthouse on a black island beaming cold white light over a marsh town on stilts, a wanted poster nailed to a post in front. A paperclip and a wax seal in the corner. No text.
```
Ablage: `public/sprites/ui/cases/R_akte_kapitel2.png`.

```
[STYLE BLOCK]
Cutscene still in pixel art, 240x135 px, not transparent, cinematic close framing: [SZENE]. No text.
```
1. `R_szene_ankunft.png` – a night train arriving at a small marsh station in fog, a wanted poster with the investigator's face fluttering on a post
2. `R_szene_lichter.png` – small white lights drifting over the marsh from the sea toward a distant lighthouse
3. `R_szene_lucent.png` – a tall man in a pale coat in a dark room, glowing faintly, pouring lamp oil over his own hands
4. `R_szene_schrein.png` – old Mother Sedge carving a name tablet by candlelight in front of a shrine of hundreds of tablets
5. `R_szene_brandt.png` – a small white-haired woman polishing a giant lighthouse lens while countless lights swirl inside it
6. `R_szene_ueberfahrt.png` – a rowing boat crossing black water toward the lighthouse island, the beam passing over it

Ablage: `public/sprites/ui/scenes/<Datei>`.

```
[STYLE BLOCK]
Ending illustration in pixel art, 480x270 px, not transparent, cinematic composition: [SZENE]. Muted palette, strong mood lighting, no text.
```
| Datei | `[SZENE]` |
|---|---|
| `k2_rein.png` | the lighthouse lantern room: Grey Scout watchmen in grey coats and Inspector Marlowe with a warrant around the lens, small white-haired Brandt seated, a nearly transparent Starling standing in the doorway |
| `k2_moor.png` | the lighthouse fire extinguished, thousands of small lights flying out over the marsh town and the sea at dawn, Brandt sitting on the stairs |
| `k2_lichtmeister.png` | the investigator alone at the giant glowing lens, a gold signet ring with a lighthouse on their finger, cold white light on their face, the town small below |
| `k2_meer.png` | a coal barge escaping out to sea at night, a boy with a big cap at the rudder, a red-haired young woman jumping aboard, the lighthouse beam searching behind them |

Ablage: `public/sprites/ui/endings/<Datei>`.

## 5. Bosse von Kapitel 2 (96x96)

### 5.1 Die Namenlose (Boss im Vergessmoor, `namenlose`)
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: The Nameless, a peat cutter woman as tall as a house rising from black marsh water up to her hips, made of wet peat, roots and reeds, hundreds of small blank wooden name tablets stuck to her body like scales, a peat spade as long as a boat in her hand, no face, only a hollow where pale white lights flicker; water pours off her constantly. Rows:
1) idle, swaying in the water, tablets clattering, 4 frames;
2) attack: spade swing across the water, wind-up held 2 frames, 6 frames;
3) attack "Gib mir deinen Namen": reaches out and a tablet flies at the target, wind-up held 2 frames, 6 frames;
4) skill: sinks and pulls the ground into the marsh (water rises), 6 frames;
5) summon: two nameless peat cutters rise from the water, 6 frames;
6) hurt, 3 frames;
7) defeat: she sinks slowly, the tablets float up and each gets a faint carved mark, 6 frames.
Sheet 576x672.
```

### 5.2 Das Leuchtfeuer (Endboss im Leuchtturm, `leuchtfeuer`)
Keine Figur, sondern ein Wesen aus dreihundert Jahren gestohlenem Licht. In ihm sieht man undeutlich Gesichter derer, deren Licht geerntet wurde.
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: The Beacon, a towering being of cold white stolen light shaped vaguely like a hooded figure inside a rotating ring of faceted lens glass; inside the light many small faint faces drift; a sweeping beam shines from where its face would be; small lights orbit it like moths. Rows:
1) idle, the lens ring slowly rotating, lights orbiting, 4 frames;
2) attack "Leuchtstrahl": the beam sweeps across and burns, wind-up held 2 frames (the beam narrows), 6 frames;
3) attack "Ernte": small lights rush at the target and pull a faint glow out of them, wind-up held 2 frames, 6 frames;
4) skill "Blendung": the whole being flares white, screen-wide, 6 frames;
5) phase 2: the lens ring cracks, the faces inside press outward and call out, 6 frames;
6) hurt, 3 frames;
7) defeat: the light breaks apart into thousands of small lights that fly away in all directions, only an empty cracked lens ring remains, 6 frames.
Sheet 576x672.
```
```
[STYLE BLOCK]
Battle effect strips for bosses, transparent background, crisp pixels, frames in one row: 1) "name tablet" a spinning wooden tablet hitting and breaking, 32x32, 6 frames; 2) "marsh rise" black water rising from the bottom of the frame, 96x48, 6 frames; 3) "lighthouse beam" a sweeping cold white beam, 96x32, 6 frames; 4) "harvest" small lights pulling a glow out of a target toward the right, 64x64, 8 frames; 5) "blinding flare" a white burst filling the frame, 96x96, 8 frames; 6) "lights set free" thousands of tiny lights flying outward, 96x96, 8 frames.
```
```
[STYLE BLOCK]
Dramatic boss bust portrait, 160x160 px, transparent background: [BOSS].
```
- `R_08_boss_namenlose.png`: a house-sized faceless peat woman covered in blank wooden name tablets, rising from black water, pale lights in her hollow face
- `R_08_boss_leuchtfeuer.png`: a hooded figure of cold white light inside a cracked rotating lens ring, faint faces inside the light

Ablage: `public/sprites/battle/enemy_namenlose.png`, `enemy_leuchtfeuer.png`, `public/sprites/fx/fx_namenstafel.png`, `fx_moor_steigt.png`, `fx_leuchtstrahl.png`, `fx_ernte.png`, `fx_blendung.png`, `fx_lichter_frei.png`, `public/sprites/ui/R_08_boss_namenlose.png`, `R_08_boss_leuchtfeuer.png`.

## 6. Kontrolle vor dem Abgeben
- Wexmoor wirkt nass, flach und arm, die Oberstadt hell, kalt und reich.
- Das „gestohlene Licht“ ist kalt-weiß, nie Türkis (Türkis bleibt für das übrige Okkulte).
- Lucius Starling ist erkennbar dieselbe Person in allen Sheets, nur unterschiedlich durchsichtig.
- Manifest `manifest-wexmoor2.json`, Prompts in `docs/art/batch-wexmoor2-generation.json`, Kurzeintrag in `docs/art/README.md`.
