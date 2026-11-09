# Codex-Batch G: Gefährliche Monstergebiete, Monster und Loot

**Batch-Name:** `wildnis` (Manifest: `public/sprites/manifest-wildnis.json`)

Neu im Spiel: **Free-Roam-Gebiete** voller gefährlicher Monster, die man frei erkunden kann. Monster laufen sichtbar herum, greifen an, und nach dem Kampf liegt **Loot sichtbar auf dem Boden**. Jedes Gebiet hat drei normale Monster (mit Elite-Varianten, die das Spiel selbst einfärbt) und einen Gebiets-Boss.

Nicht doppeln: Overworld-Sprites für die schon vorhandenen Gegner (Nebelhund, Aktenfresser, Kanalkröte usw.) stehen in Batch F, Kampf-Hintergründe für Stadt-Orte ebenfalls in F. Hier geht es nur um die **neuen Gebiete und neuen Monster**.

**IDs:** Mit dem Spiel festgelegt (Gebiete, Encounter, Drops, Behälter, Seltenheiten). Dateinamen bitte genau so.

**Reihenfolge:** 1 (Gebiete) → 2 (Monster) → 3 (Loot) → 4 bis 6.

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

## 1. Die vier Gebiete

Pro Gebiet: ein **Tileset** (8x8, 16x16), ein **Prop-Sheet**, ein **Kampf-Hintergrund** (480x270) und ein **Gefahren-Overlay**. Die Gebiete sollen sich deutlich von der Stadt unterscheiden: wilder, dunkler, bedrohlicher.

### 1.1 Schwarzwasser-Marsch (`marsch`)
Sumpfland vor dem Südtor, Nebel, versunkene Hütten, Irrlichter.
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a haunted marsh outside the city at night, top-down: black-green bog water (4 frames of slow ripples), squelching mud, tussocks of dead reeds, half-sunk wooden boardwalk planks (straight, corner, broken), patches of pale grass, mud-to-water edges with inner and outer corners, floating duckweed, bubbling gas spots (4 frames), a stone causeway with moss. Arranged 8x8, seamless.
```
```
[STYLE BLOCK]
Prop sheet for a haunted marsh, 16px grid, transparent background: a dead twisted willow (32x48), cattail clumps (16x16), a half-sunk rowing boat (32x16), the ruin of a stilt hut (48x48), a crooked waymarker post with a rusted lantern (16x32), a pile of bones of a cow sunk in mud (32x16, no gore), a drowned cart wheel (16x16), an old eel trap (16x16), a rotten jetty end (32x16).
```
Kampf-Hintergrund `bg_marsch.png`: `a fog-drowned marsh at night: dead willows, black water reflecting pale lights, a ruined stilt hut, will-o'-the-wisps floating in the distance`.

### 1.2 Pestgassen (`pestgassen`)
Ein abgeriegeltes, verlassenes Quarantäneviertel. Bretter vor den Türen, Kreidekreuze, Ratten.
```
[STYLE BLOCK]
Tileset of 16x16 tiles for an abandoned quarantine quarter of the city: cracked overgrown cobblestones, gutters choked with rubbish, house walls with boarded-up doors and windows, faded chalk crosses on doors (no letters), collapsed walls with rubble, a quarantine barricade of planks and barbed wire (straight, corner, gate), a dry well, weeds growing through stones. Arranged 8x8.
```
```
[STYLE BLOCK]
Prop sheet for an abandoned quarantine quarter, 16px grid, transparent background: a handcart piled with old sacks (32x16, no bodies), stacked empty coffins (32x16), a quarantine notice board (16x32, no text), burning lime-pit brazier (16x32, 4 frames), a beaked mask lying on the ground (16x16), a rat nest of shredded paper (16x16), broken medicine bottles (16x16), a lonely rocking horse (16x16).
```
Kampf-Hintergrund `bg_pestgassen.png`: `a deserted quarantine street: boarded doors with chalk crosses, a barricade of planks and wire, smoke from a brazier, rats on window sills`.

### 1.3 Katakomben unter St. Ebba (`katakomben`)
Uralte Gänge mit Knochenwänden, Kerzen und eingestürzten Grabkammern.
```
[STYLE BLOCK]
Tileset of 16x16 tiles for ancient catacombs: worn stone floor, walls of neatly stacked skulls and bones (front face, corners, top edge), burial niches with shrouded shapes (no gore), arched passages, collapsed sections with rubble, narrow stairs, puddles, candle stubs in wall niches (2-frame flicker), a dark pit edge. Arranged 8x8. Eerie but not gory, bones only as ornament.
```
```
[STYLE BLOCK]
Prop sheet for catacombs, 16px grid, transparent background: a stone sarcophagus with a cracked lid (16x32), an ossuary pillar of skulls (16x32), a candelabra of wax-dripping candles (16x32, 4 frames), an iron gate (32x32, open and closed), a rusted chain hanging from the ceiling (16x32), a fallen stone angel head (16x16), an offering bowl with coins (16x16), cobweb corners (16x16).
```
Kampf-Hintergrund `bg_katakomben.png`: `a candle-lit catacomb chamber with walls of stacked skulls, burial niches and an arched passage into darkness`.

### 1.4 Toter Wald am Krater (`kraterwald`)
Der Wald um den Meteoritenkrater ist abgestorben, Bäume sind zu Glas geworden, Sternsplitter glimmen.
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a dead forest around a meteorite crater at night: grey ashy soil, dead brittle grass, black rocks with glassy veins, ground scattered with glowing star-glass shards (2-frame twinkle), cracked earth radiating from the crater, a dirt path with edges, frost-white lichen. Arranged 8x8, seamless.
```
```
[STYLE BLOCK]
Prop sheet for a dead crystalized forest, 16px grid, transparent background: dead trees partly turned into dark translucent glass (32x48, 2 variations), a fallen glass trunk (48x16), stumps (16x16), a glowing star-glass cluster growing from the ground (16x32, 4 frames), a hunter's abandoned camp with a cold fire pit and a torn tent (48x32), deer antlers on the ground (16x16), a broken survey theodolite (16x32).
```
Kampf-Hintergrund `bg_kraterwald.png`: `a dead forest of glass-like trees under a starry sky, the crater rim glowing faintly behind, shards glittering on the ground`.

### 1.5 Gefahren-Anzeige
```
[STYLE BLOCK]
UI sheet for dangerous zones, transparent background: 1) danger level icons 16x16 for levels 1 to 5, shown as a row of one to five small red-brown claw marks inside a round iron badge; 2) a zone entry banner 192x32 as a cracked iron plaque with a red-brown tint (no text); 3) a full-screen vignette overlay 480x270 with dark red-brown edges and a transparent center, 4 frames pulsing slowly (used while in a dangerous zone); 4) map zone icons 16x16 for marsh (reeds), quarantine (boarded door), catacombs (skull), crater forest (glass tree), normal and highlighted.
```
Ablage: Tilesets `public/sprites/tilesets/G_01_<gebiet>.png`, Props `public/sprites/props/G_01_<gebiet>_props.png`, Hintergründe `public/sprites/battle/bg_<gebiet>.png`, UI `public/sprites/ui/G_01_gefahr.png`.

## 2. Monster

### 2.1 Vorlagen
Kampf (übernatürlich, 64x64):
```
[STYLE BLOCK]
Side-view battle sprite sheet for a supernatural monster: [BESCHREIBUNG], facing left, 64x64 px per frame, 6 columns, transparent background. Rows: 1) idle loop, 4 frames; 2) attack with a clearly telegraphed wind-up held for 2 frames, 6 frames; 3) special attack, 6 frames; 4) hurt, 3 frames; 5) defeat dissolving or collapsing, 6 frames. Fake transparency with dithering, no blur, no gore. Sheet 384x320.
```
Karte (Overworld):
```
[STYLE BLOCK]
Overworld sprite sheet for a roaming monster, top-down 3/4 view: [BESCHREIBUNG]. Frame size [GRÖSSE]. 4 rows (down, left, right, up) x 4 frames (move cycle), transparent background, 1px dark outline, matches the scale of 16x32 human characters.
```
Elite-Varianten (`<id>_elite`) brauchen **kein eigenes Sheet**: Das Spiel tönt das normale Sprite rot und zeigt es größer.

### 2.2 Monsterliste
| ID | Gebiet | Kampf | Karte | `[BESCHREIBUNG]` |
|---|---|---|---|---|
| `moorleiche` | marsch | 64x64 | 16x32 | a shambling bog walker wrapped in reeds, peat and dripping weeds, a dark hollow face with two pale lights; attacks with long muddy arms, special: drags the target down in a splash of black water |
| `irrlicht` | marsch | 64x64 | 16x16 | a floating will-o'-the-wisp, a pale green-white flame with a tiny screaming face inside, trailing sparks; special: splits into three lights |
| `schlammegel` | marsch | 64x64 | 32x32 | a giant swollen leech of black-green mud with a round mouth of tiny teeth, rearing up; special: latches on and drains (no blood, only dark slime) |
| `moorkoenigin` (Boss) | marsch | 96x96 | 32x32 | a towering queen of the bog: a regal figure made of roots, peat and drowned lace, a crown of antlers and reeds, will-o'-the-wisps orbiting her; special: summons grasping roots from the water |
| `schnabelmaske` | pestgassen | 48x48 | 16x32 | a gaunt figure in a long waxed black coat and a beaked leather mask with round glass eyes, carrying a cane and a smoking censer; attack: cane strike, special: a cloud of choking herbal smoke |
| `hustender` | pestgassen | 64x64 | 16x32 | a thin wraith of grey dust and rags that coughs clouds of spores, a cracked porcelain face; special: a coughing burst that lowers nerves |
| `pestratte` | pestgassen | 64x64 | 32x32 | a dog-sized rat with patchy fur, red eyes and a chewed paper tag on its ear; special: calls a swarm of small rats |
| `rattenkoenig` (Boss) | pestgassen | 96x96 | 32x32 | a monstrous knot of dozens of rats whose tails are tangled together, wearing a crown of bent cutlery and bottle caps, a ragged cloak, glowing turquoise eyes in the middle; special: the swarm surges outward |
| `knochenwurm` | katakomben | 64x64 | 32x32 | a long segmented worm made of interlocked vertebrae and skull plates, burrowing out of a bone wall; special: bursts out of the ground beneath the target |
| `kerzenfresser` | katakomben | 64x64 | 16x32 | a hunched pale creature with a long neck that eats candle flames, wax dripping from its mouth, eyeless face, candle stubs stuck on its back; special: snuffs all light and strikes from darkness |
| `schaedelschwarm` | katakomben | 64x64 | 32x32 | a swarm of floating chattering skulls bound by faint turquoise threads; special: the skulls orbit and slam in sequence |
| `ossuarwaechter` (Boss) | katakomben | 96x96 | 32x32 | a huge guardian built from the bones of an ossuary in the shape of a knight, a shield made of a church door, a lantern in its ribcage with a turquoise flame; special: raises a wall of bones |
| `glaskraehe` | kraterwald | 64x64 | 16x16 | a crow whose feathers have turned into sharp dark glass that rings when it flies, star-light in its eyes; special: a dive that rains glass feathers |
| `kraterbrut` | kraterwald | 64x64 | 32x32 | a crawling creature hatched from a meteor egg, shell of black glass, soft glowing underside, six spindly legs; special: explodes in a burst of shards (survives as a husk) |
| `splitterling` | kraterwald | 48x48 | 16x32 | a humanoid made of jagged star-glass shards held together by light, faceless, joints glowing; special: shatters and reforms behind the target |
| `sternhirsch` (Boss) | kraterwald | 96x96 | 32x32 | a majestic corrupted stag whose antlers have become branching star-glass crystals, its body half flesh, half dark glass, a star-shaped wound glowing on its chest; special: a charge leaving a trail of shards, then a blinding star-flash |

Bosse: Vorlage wie 2.1, aber **96x96**, zusätzliche Reihe „Phase 2 Verwandlung“ (6 Frames) und „Phase 2 Idle“ (4 Frames), Sheet 576x672.

Ablage: Kampf `public/sprites/battle/enemy_<id>.png`, Karte `public/sprites/characters/G_ow_<id>.png`.

### 2.3 Monster-Ankündigung auf der Karte
```
[STYLE BLOCK]
Overworld effect strips, transparent background: 1) a monster spawning from the ground in a swirl of dark mist, 32x32, 6 frames; 2) a monster's aggro burst (red-brown ring and an exclamation-free spark), 32x32, 4 frames; 3) a patrol path footprint marker 8x8 (faint, 2 frames); 4) an elite aura around a monster, 32x32, 4-frame red-brown ember loop; 5) a boss lair marker on the ground, 48x48, a cracked circle with claw marks, 4-frame glow.
```
Ablage: `public/sprites/fx/G_02_monster_fx.png`.

## 3. Loot und Drops

### 3.1 Sichtbarer Loot auf dem Boden
Vier Behälter, je eine Datei mit **2 Frames nebeneinander (zu, offen)**, 16x16 pro Frame (32x16 gesamt):
```
[STYLE BLOCK]
Overworld loot container sprite, 2 frames side by side (closed, open), each 16x16 px, transparent background, 1px dark outline: [BEHÄLTER].
```
| Datei (`public/sprites/props/`) | `[BEHÄLTER]` |
|---|---|
| `G_loot_beutel.png` | a small dropped cloth pouch tied with string; open frame: the pouch opened with a glint of coins |
| `G_loot_kiste.png` | a battered wooden crate; open frame: lid pushed aside, straw inside |
| `G_loot_truhe.png` | an iron-bound wooden chest; open frame: lid up, a soft amber glow inside |
| `G_loot_okkulter_schrein.png` | a small black shrine box with a turquoise eye-in-a-circle sigil; open frame: doors open, turquoise light pouring out |

Zusätzlich:
```
[STYLE BLOCK]
Overworld loot extras, transparent background: 1) a scattered pile of coins 16x16, 2) a monster remains pile (ash and a few bones, no gore) 16x16, 3) a glowing material drop (a small shard with a light) 16x16, 4) a sparkle that marks loot on the ground 8x8 with 4 frames, 5) a chest opening animation for the iron-bound chest, 16x16, 4 frames.
```
Ablage Extras: `public/sprites/props/G_03_loot_extras.png`.

### 3.2 Seltenheit
```
[STYLE BLOCK]
UI sheet for loot rarity, transparent background: item frame borders 20x20 in four tiers: common (plain iron), uncommon (polished brass), rare (silver with small gems), occult (dark iron with a pulsing turquoise glow, 4 frames); matching small loot beams rising from the ground 16x48 in grey, brass, silver and turquoise (4 frames each); a rarity gem icon 8x8 per tier.
```
### 3.3 Aufheben und Loot-Fenster
```
[STYLE BLOCK]
Loot UI and effects, transparent background: 1) a pickup effect where an item flies up and shrinks with a sparkle, 16x32, 6 frames; 2) a loot window 9-slice 48x48 in dark leather with brass corners; 3) a "take all" icon 16x16 (open hand over a pile); 4) a full-inventory warning icon 16x16 (overstuffed satchel); 5) a coin gain popup 24x16 (coin with a small plus shape, no digits), 4 frames.
```
Ablage: `public/sprites/ui/G_03_seltenheit.png`, `G_03_loot_ui.png`.

### 3.4 Monster-Materialien (16x16 und 32x32)
In zwei Gruppen zu je 8 erzeugen.
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 8 icons in a row, plus the same 8 at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim: [LISTE]
```
**Gruppe 1:** `moorwasser` (a corked vial of black-green bog water with a floating reed), `irrlichtfunke` (a tiny pale flame trapped in a glass bead), `egelschleim` (a jar of dark glistening slime), `moorperle` (a dull black pearl with a faint green shimmer), `schnabelfeder` (a black waxed feather from a beaked mask), `hustenstaub` (a paper twist of grey spore dust), `rattenschwanz` (a long bald rat tail tied with string), `rattenkrone` (a tiny crown of bent cutlery and bottle caps).

**Gruppe 2:** `knochenmehl` (a pouch of fine white bone meal), `wachsherz` (a heart-shaped lump of pale wax with a wick), `schaedelsplitter` (a fragment of a skull with a carved symbol), `ossuarschluessel` (a large iron key with a bone handle), `glasfeder` (a feather of dark glass), `brutschale` (a piece of black glassy egg shell glowing on the inside), `sternhirschgeweih` (a branch of crystal antler), `geisterkern` (a fist-sized core of swirling turquoise light, the rarest drop).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten `public/sprites/items/G_material_1.png`, `G_material_2.png`.

## 4. Ausrüstung aus Monster-Material
Belohnungen, die man aus Drops herstellen oder bei Händlern tauschen kann. 16x16 plus 32x32.
```
[STYLE BLOCK]
Equipment icon sheet, 16x16 px per icon, 8 icons in a row, plus 32x32 versions in a second row, transparent background, 1px dark outline, 1px light rim: a marsh-wader's waxed coat with reed fringes, a beaked plague mask worn as a hat, an amulet with a black bog pearl, a bone-handled knife, a candle-wax charm that never melts, a glass-feather cloak clasp, a star-glass dagger glowing faintly, a crown of antler crystal worn as a circlet.
```
IDs: `mantel_moor, hut_schnabel, amulett_moorperle, knochenmesser, wachsamulett, glasfibel, sternglasdolch, geweihreif`. Ablage: `public/sprites/items/<id>.png`, `public/sprites/items/32/<id>.png`, Atlas `G_04_ausruestung.png`.

## 5. Bestiarium-Karten
Für jedes Monster aus 2.2 (16 Karten), Vorlage:
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [MONSTER] in the upper two thirds, a pinned specimen label shape and scribbled notes as abstract lines (no readable text) in the lower third, a small danger badge with claw marks in the top corner.
```
Ablage: `public/sprites/ui/bestiary/G_<id>.png`.

## 6. Lager und Rast in der Wildnis
```
[STYLE BLOCK]
Prop sheet for safe spots inside dangerous zones, 16px grid, transparent background: a small campfire (16x16, 6-frame fire), a bedroll (16x32), a lantern hung on a stick that marks a safe zone (16x32, warm glow), a hunter's lean-to shelter (48x32), a waystone with a carved protective sigil in amber (16x32, 4-frame glow), a supply cache crate with a chalk mark (16x16).
```
Ablage: `public/sprites/props/G_06_rast.png`.
