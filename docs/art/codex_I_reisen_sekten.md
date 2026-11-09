# Codex-Batch I: Reisen auf der Stadtkarte und Sektenfraktionen

**Batch-Name:** `reise` (Manifest: `public/sprites/manifest-reise.json`)

Zwei neue Systeme im Spiel:
1. **Reisen mit Regeln:** Auf der Stadtkarte wählt man zwischen zwei Reisearten: **sicher** (langsam, Kutsche und Hauptstraßen, man erholt Leben und Nerven und kann im Journal lesen) und **schnell** (durch Gassen, über Kanäle und Dächer, kostet Nerven, dafür Monster und Loot). Nur auf dem schnellen Weg passieren Begegnungen.
2. **Sektenfraktionen:** Die **Rostbrüder** (Pfad des Eisens, Hafen-Bruderschaft am Ankerhof, Versteck Rostkapelle) und die **Schleierschwestern** (Pfad der Maske, ersetzen Dienstmädchen in reichen Häusern, Versteck Putzmacherei Grau am Altmarkt). Menschliche Gegner mit Anführern, Verstecken und Erkennungszeichen.

Nicht doppeln: Die große Stadtkarte mit Nebel-Overlay steht in Batch D, die Kartensymbole sind fertig (`ui/C_08_map_markers.png`). Reise-Kämpfe nutzen vorhandene Gegner (Nebelhund, Chorfanatiker usw.).

**IDs:** Alle IDs (Reisearten, Reise-Events, Fraktionen, Gegner, Karten, Figuren, Items) sind mit den Spiel-Threads festgelegt. Dateinamen bitte genau so.

**Reihenfolge:** 4 (Sekten-Gegner) → 1 und 2 (Reisen) → 3, 5, 6, 8 → 7 zuletzt.

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

## 1. Reise-Oberfläche auf der Stadtkarte

### 1.1 Reisearten (2 Icons, 32x32)
```
[STYLE BLOCK]
Two travel mode icons side by side, each 32x32 px (64x32 total), transparent background, 1px dark outline, inside a round brass badge: 1) "safe": a black hansom cab with a calm horse on a lamp-lit main street, warm amber light; 2) "fast": a shadowy figure leaping between rooftops over a narrow alley and a canal, a faint red-brown danger tint.
```
IDs in Reihenfolge: `sicher, schnell`. Ablage: `public/sprites/ui/I_reise_modes.png`.

### 1.2 Spielermarker und Routen
```
[STYLE BLOCK]
City map travel sprites, transparent background, hand-drawn ink style matching public/sprites/ui/13_05_city_map.png: 1) the player marker, 16x16, a tiny figure in a long coat and flat cap on a small round brass base, 4-frame idle bob; 2) route line pieces 8x8: safe route (dotted dark ink) and fast route (dashed red-brown line with tiny claw marks), each with straight, corner, end and junction pieces; 3) a destination pin 8x16 (amber, 2-frame bob).
```
Ablage: `public/sprites/ui/I_reise_marker.png` (Spielermarker als eigene Datei, 64x16 mit 4 Frames) und `public/sprites/ui/I_reise_routen.png`.

## 2. Reise-Begegnungen (Ereignisbilder, nur auf dem schnellen Weg)
Ein Bild pro Begegnung, 240x135, deckend, ohne Text:
```
[STYLE BLOCK]
Travel event illustration in pixel art, 240x135 px, not transparent, cinematic framing, foggy Victorian city at night, seen during a dangerous shortcut through alleys, over canals or across rooftops: [SZENE]. Muted palette, no text.
```
| Datei (`public/sprites/ui/scenes/`) | Event-ID | `[SZENE]` |
|---|---|---|
| `I_reise_nebel.png` | `reise_nebel` | a narrow canal-side alley swallowed by fog, two glowing turquoise eyes of a fog hound low in the mist ahead |
| `I_reise_ratten.png` | `reise_ratten` | a flood of rats pouring out of a drain and over the cobbles of a dark back alley |
| `I_reise_irrlicht.png` | `reise_irrlicht` | a pale ghostly light floating above a canal, a translucent face inside it, beckoning |
| `I_reise_kultpatrouille.png` | `reise_kultpatrouille` | a line of grey-hooded choir fanatics with lanterns crossing a footbridge in silence |
| `I_reise_ueberfall.png` | `reise_ueberfall` | two highwaymen with cudgels and a knife stepping out from an alley mouth, blocking the way |
| `I_reise_fund.png` | `reise_fund` | something half hidden under a loose roof tile on a rooftop, a faint glint, the city spread out below |
| `I_reise_taschendieb.png` | `reise_taschendieb` | a street urchin's hand slipping into the investigator's coat pocket on a crowded alley corner |

## 3. Fraktions-Embleme
```
[STYLE BLOCK]
Faction emblem set for a secret society, three sizes side by side (16x16, 32x32, 64x64), transparent background, 1px dark outline, no text: [EMBLEM].
```
| Datei (`public/sprites/factions/`) | Fraktion | `[EMBLEM]` |
|---|---|---|
| `rostbrueder.png` | Die Rostbrüder | a ship's anchor inside a ring of heavy rusted chain, rust-red and iron grey |
| `schleierschwestern.png` | Die Schleierschwestern | half of a white porcelain face mask behind a draped grey veil, a faint rose accent |

## 4. Gegner der Sekten

Kampf (48x48, Blick nach links):
```
[STYLE BLOCK]
Side-view battle sprite sheet for a human cult enemy: [BESCHREIBUNG], facing left, 48x48 px per frame, 6 columns, transparent background, consistent baseline. Rows: 1) idle, 4 frames; 2) attack A with a wind-up held for 2 frames, 6 frames; 3) attack B (different and heavier), 6 frames; 4) hurt, 3 frames; 5) defeated (kneels or flees, no gore), 4 frames. Sheet 288x240.
```
Karte (16x32):
```
[STYLE BLOCK]
Overworld sprite sheet for the same cult enemy: [BESCHREIBUNG]. 16x32 per frame, 4 rows (down, left, right, up) x 4 frames, transparent background, matches the existing 16x32 characters.
```
Anführer bekommen zusätzlich ein **Emotions-Portrait** (256x64: neutral, misstrauisch, wütend, überheblich lächelnd) und ein **96x96-Boss-Sheet** mit zusätzlicher Reihe „Phase 2“ (6 Frames).

| ID | Fraktion | Rolle | `[BESCHREIBUNG]` |
|---|---|---|---|
| `rost_schlaeger` | rostbrueder | Kettenträger | a burly dock brother in a rust-red hooded smock, heavy chain wrapped around one fist, skin turning grey like cast iron where rust-water was drunk; attack A chain-fist punch, attack B swings the chain in a wide arc |
| `rost_werfer` | rostbrueder | Hakenwerfer | a lean dock brother in a rust-red smock and leather bracers, throwing boat hooks on chains; attack A hook throw and yank, attack B double hook throw |
| `rost_schmied` | rostbrueder | Elite: Rostschmied Bellamy | a massive smith in a scorched leather apron over a rust-red smock, soot-blackened arms, a sledgehammer and glowing tongs; attack A hammer smash, attack B glowing tongs grab with sparks |
| `rost_vater` | rostbrueder | Anführer: Vater Odo Harn | an old towering dock patriarch in a coat made of chain links over a rust-red robe, iron-grey beard, a small anchor on a long chain as weapon; attack A anchor swing, attack B anchor slam into the ground with a shockwave; phase 2 his skin turns fully to rusted iron |
| `schleier_novizin` | schleierschwestern | Novizin „Tilly“ | a young woman disguised as a housemaid in a black dress, white apron and cap, sweet smile, long hairpins as weapons; attack A hairpin stab, attack B blows powder into the face |
| `schleier_messerin` | schleierschwestern | „Fräulein Grau“ | an elegant milliner's shop assistant in a grey dress and a small veiled hat, two thin blades, one dripping with green poison; attack A quick double slash, attack B poisoned lunge |
| `schleier_seherin` | schleierschwestern | Spiegelzauberin | a veiled woman in layered grey silk holding a hand mirror, shards of mirror orbiting her; attack A flings mirror shards, attack B a mirror flash that blinds |
| `schleier_mutter` | schleierschwestern | Anführerin: Mutter Ysolde | a tall regal woman in flowing grey silk and many veils, her face shifting between different faces behind a porcelain half mask, ribbons of sharpened silk as weapons; attack A silk blade lash, attack B veils whirl around the target; phase 2 the mask cracks and several faces flicker at once |

Ablage: Kampf `public/sprites/battle/enemy_<id>.png`, Karte `public/sprites/characters/I_ow_<id>.png`, Portraits `public/sprites/portraits/I_<id>_emotions.png`.

## 5. Verstecke der Sekten
Pro Fraktion ein Tileset (8x6) und ein Prop-Sheet:
**Rostkapelle** (`rostbrueder`):
```
[STYLE BLOCK]
Interior tileset and props for a secret brotherhood in an old rope-makers' chapel turned into a forge, top-down 3/4 view, 16px grid: worn stone floor with rust stains, chapel walls with tall broken windows, an anvil and a glowing forge (32x32, 4-frame fire), chains hanging from ceiling beams, an altar made of a ship's anchor on a stone block, coils of rope, barrels of rusty water with a red-brown sheen, workbenches with hooks and tools, rust-red banners with an anchor-in-chain symbol (no text).
```
Kampf-Hintergrund `bg_rostbrueder.png`: `inside a rope-makers' chapel turned forge: glowing forge, chains hanging from beams, a ship's anchor altar, rust-red banners`.

**Schleierhaus** (`schleierschwestern`):
```
[STYLE BLOCK]
Interior tileset and props for a milliner's hat shop with a secret mirror room behind it, top-down 3/4 view, 16px grid: front shop with polished floorboards, a counter, hat stands and hat boxes, faceless display heads with veiled hats, ribbons and lace; back room with a black-and-white tiled floor, walls covered with mirrors of all sizes (some cracked), a dressing table with porcelain masks, grey veils hanging from the ceiling, a hidden door behind a tall mirror (closed and open).
```
Kampf-Hintergrund `bg_schleierschwestern.png`: `a secret mirror room: endless reflections in many mirrors, grey veils hanging from the ceiling, porcelain masks on a table`.

**Weitere neue Karten** (Props, die zu vorhandenen Tilesets passen):
```
[STYLE BLOCK]
Prop sheet, 16px grid, transparent background: for the outdoor quay "Ankerhof": a large rusted anchor monument on a plinth (32x32), stacked chains (16x16), a brotherhood notice board (16x32, no text), mooring bollards (16x16); for the Morrow townhouse: a widow's writing desk with black-edged letters (32x32), a portrait draped in black crepe (16x32), a maid's cleaning trolley (16x16), a grandfather clock (16x48).
```
Ablage: `public/sprites/props/I_ankerhof_haus_morrow.png`.

Ablage: `public/sprites/tilesets/I_<fraktion>_versteck.png` (Tiles und Props in einem Sheet), Kampf-Hintergrund `public/sprites/battle/bg_<fraktion>.png` (480x270, deckend, untere 70 px Bodenstreifen).

## 6. Erkennungszeichen und Beute (16x16)
Hinweise, an denen man Sektenmitglieder erkennt, und was sie fallen lassen.
```
[STYLE BLOCK]
Item and clue icon sheet, 16x16 px per icon, 8 icons in a row, plus 32x32 versions in a second row, transparent background, 1px dark outline, 1px light rim: [LISTE]
```
IDs in Reihenfolge, je Einzeldatei `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`:
1. `rostwasser` – a corked bottle of murky red-brown water with rust flakes
2. `schleierpuder` – a small round powder compact with a grey veil pattern, pale powder spilling
3. `ankerhaken` (Waffe) – a short iron boat hook with a chain wrapped around the handle
4. `schleierdolch` (Waffe) – a slim silver dagger with a grey silk ribbon on the hilt
5. `rostanker` (Amulett) – a small rusted anchor pendant on a chain
6. `porzellanmaske` – a white porcelain half mask with a hairline crack
7. `rost_zeichen` (Erkennungszeichen) – a scrap of rust-red cloth with an anchor-in-chain stitch
8. `schleier_zeichen` (Erkennungszeichen) – a grey veil hatpin with a tiny mask head

Die Erkennungszeichen 7 und 8 sind Vorschläge für Hinweise, die anderen sechs sind im Spiel festgelegt.

## 7. Fraktions-Oberfläche (für später)
Im Spiel noch nicht eingebaut, deshalb zuletzt erzeugen.
```
[STYLE BLOCK]
Faction UI sheet, transparent background: 1) a faction standing bar 64x8 per faction, iron frame, fill in the faction color, 6 states; 2) standing icons 16x16: hostile (crossed blades), suspicious (narrowed eye), unknown (blank mask), tolerated (open hand), infiltrated (a mask with a keyhole); 3) a faction dossier frame 96x128 like a pinned police file with a space for the emblem (no text); 4) a small "cult sign spotted" popup icon 16x16, 4-frame bob.
```
Ablage: `public/sprites/ui/I_fraktionen.png`.

## 8. Neue Figuren (Lauf-Sheet 64x128 und Portrait 256x64)
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. 4 rows (down, left, right, up) x 4 frames. Total 64x128 px, transparent background, same proportions as the existing characters.
```
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious, shocked, smiling faintly. Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
| ID | Name | `[BESCHREIBUNG]` |
|---|---|---|
| `jory` | Jory Flint, Hafenarbeiter | a young dock worker with a knit cap and a heavy jacket, one arm in a dirty sling and bandages, wary eyes |
| `lavinia` | Witwe Lavinia Morrow | a dignified elderly widow in black silk mourning dress with a jet brooch, grey hair under a small black hat, a silver-topped walking stick |
| `tilly` | Tilly Brooks, Hausmädchen | a timid young housemaid in a black dress, white apron and cap, freckles, red hands from scrubbing |

Ablage: `public/sprites/characters/I_<id>_walk.png`, `public/sprites/portraits/I_<id>_emotions.png`.

