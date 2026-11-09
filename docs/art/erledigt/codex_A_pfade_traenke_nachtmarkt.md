# Codex-Batch A: Pfade, Tränke, Zutaten, Nachtmarkt und Händler

**Batch-Name:** `pfade` (Manifest: `public/sprites/manifest-pfade.json`)

Im Spiel gibt es seit PR #8 sieben **Pfade** (übernatürliche Laufbahnen) mit je drei Stufen (**Sequenz 9, 8, 7**). Man kauft **Formeln**, sammelt **Zutaten**, braut am **Braukessel** einen **Trank** und trinkt ihn. Gehandelt wird mit **Schilling** auf dem **Nachtmarkt unter der Krähenbrücke**. Für all das fehlt bisher jede Grafik.

**Reihenfolge:** 1 → 2 → 3 → 4 (Icons, sofort nutzbar) → 6 bis 8 (Nachtmarkt) → 9 (Händler) → 10 bis 12 (UI und Effekte).

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

## 1. Die sieben Pfade (Embleme)

Jeder Pfad hat eine eigene Farbe. Diese Farbe ist der Akzent in Emblem, Trank, Formel-Siegel und Fähigkeits-Effekt.

| ID | Name | Farbe | Grundsatz | Motiv fürs Emblem |
|---|---|---|---|---|
| `laterne` | Pfad der Laterne | #e8b860 (Bernstein) | Bring Licht ins Verborgene. | a small gas lantern with a flame shaped like an open eye |
| `faden` | Pfad des Fadens | #c8b0e8 (Flieder) | Verknüpfe, was getrennt scheint. | three threads crossing into a knot over a needle |
| `maske` | Pfad der Maske | #e07a8a (Altrosa) | Spiele jede Rolle, aber verliere dich nicht. | a half theatre mask, one side smiling, the other blank |
| `echo` | Pfad des Echos | #6fe0d0 (Türkis) | Höre, was nicht mehr spricht. | an ear-shaped spiral made of sound rings over a gravestone |
| `kessel` | Pfad des Kessels | #9ad06a (Giftgrün) | Nichts vergeht, alles verwandelt sich. | a small round cauldron with a rising drop-shaped vapor |
| `eisen` | Pfad des Eisens | #a8b4c0 (Stahlgrau) | Stehe, wo andere fallen. | a ship anchor crossed with a clenched iron gauntlet |
| `schluessel` | Pfad des Schlüssels | #d0a050 (Messing) | Nimm, was man dir verwehrt. | an ornate old key with a crow feather tied to it |

### 1.1 Embleme in drei Größen
Für jeden Pfad einzeln (7 Prompts), `[MOTIV]` und `[FARBE]` aus der Tabelle:
```
[STYLE BLOCK]
Emblem for an alchemical pathway in a Victorian occult game: [MOTIV], set inside a round tarnished brass medallion with a thin inner ring. The pathway color [FARBE] is the dominant accent (glow, inlay or flame), everything else muted brass and slate. Provide three sizes side by side on a transparent background: 16x16 (simplified silhouette), 32x32 (clear details), 64x64 (fully detailed). Same design in all three, crisp pixels, 1px dark outline, no text.
```
Ablage: `public/sprites/pathways/emblem_<id>_16.png`, `_32.png`, `_64.png` (z. B. `emblem_laterne_32.png`).

### 1.2 Pfad-Karten (Auswahlbildschirm)
Für jeden Pfad einzeln:
```
[STYLE BLOCK]
Vertical pathway card, 96x128 px, not transparent: an aged parchment card with a dark slate border and brass corner fittings. Upper half: a small pixel-art vignette scene for the pathway "[NAME]": [SZENE]. Lower half left empty (plain parchment) for game text. The pathway color [FARBE] is the main accent in the scene. No text.
```
| ID | `[SZENE]` |
|---|---|
| `laterne` | a lamplighter silhouette raising a glowing pole into thick fog, light cutting through it and revealing a hidden footprint trail |
| `faden` | an investigator's hand pulling a glowing lilac thread between pinned photographs on a wall |
| `maske` | a figure in a theatre doorway holding a mask in front of its face, its shadow on the wall wearing a different face |
| `echo` | a figure kneeling at a grave with turquoise sound rings rising from the soil, a faint ghostly hand reaching up |
| `kessel` | a cramped apothecary back room with a bubbling cauldron giving off green vapor, jars on shelves |
| `eisen` | a dock worker standing firm on a pier while waves and crates crash around him, rust-red glow in his fists |
| `schluessel` | a shadowy figure kneeling at a locked door, picking the lock, a crow watching from above |

Ablage: `public/sprites/pathways/card_<id>.png`.

### 1.3 Sequenz-Leiter
```
[STYLE BLOCK]
UI element for a pathway progression ladder, transparent background: a vertical brass pipe 16x112 px with three round sockets (24x24) at top, middle and bottom for sequence 7, 8 and 9 (9 at the bottom). Provide socket states as separate 24x24 sprites in a row: empty dark glass, glowing (unlocked, uses a neutral white-gold glow that the game can tint), cracked (lost control), locked with a small padlock. No numbers.
```
Ablage: `public/sprites/pathways/ladder.png`, `ladder_sockets.png`.

## 2. Tränke (21 Stück)

Dateiname im Spiel: `trank_<pfad>_<sequenz>`. Pro Pfad **ein Prompt** für alle drei Stufen. Sequenz 9 ist schlicht, 8 aufwendiger, 7 kostbar und leicht unheimlich.

```
[STYLE BLOCK]
Three potion bottle icons for the alchemical pathway "[NAME]", side by side, each 16x16 px, plus the same three again at 32x32 px in a second row, transparent background, 1px dark outline, 1px light rim. The liquid color is [FARBE].
1) Sequence 9: a small plain glass vial with a cork, liquid [FARBE], [DETAIL9].
2) Sequence 8: a faceted glass flask with a wax seal and a brass collar, liquid [FARBE] glowing faintly, [DETAIL8].
3) Sequence 7: an ornate crystal phial in a brass cage with tiny engravings, liquid [FARBE] glowing strongly with a small swirl inside, [DETAIL7].
The three must clearly read as one family and increase in value from left to right.
```
| ID | `[DETAIL9]` | `[DETAIL8]` | `[DETAIL7]` |
|---|---|---|---|
| `laterne` | a tiny floating spark | a lantern-shaped stopper | a miniature flame burning inside the liquid |
| `faden` | a single lilac thread tied around the neck | threads wrapped around the flask | glowing threads floating inside, forming a knot |
| `maske` | a paper label with a blank face | a small mask hanging from the neck on a ribbon | the liquid surface shows a faint face |
| `echo` | a pinch of grave moss on the cork | sound-ring engraving on the glass | a ghostly wisp trapped inside |
| `kessel` | bubbles rising | a skull-free poison-green drip on the side | liquid bubbling over the brass cage |
| `eisen` | a rusty nail as stopper | an iron band around the flask | heavy iron-plated phial, liquid like molten metal |
| `schluessel` | a crow feather on the cork | a tiny key hanging from the neck | a keyhole-shaped window in the brass cage |

Ablage: `public/sprites/items/trank_<id>_9.png`, `_8.png`, `_7.png` (16x16) und `public/sprites/items/32/trank_<id>_<seq>.png` (32x32).

## 3. Formeln (21 Stück)

Dateiname im Spiel: `formel_<pfad>_<sequenz>`. Alle Formeln teilen sich eine Grundform, unterschieden durch Siegelfarbe und Stufe.

```
[STYLE BLOCK]
Item icon sheet of alchemical formula scrolls, 16x16 px each, 7 columns x 3 rows, transparent background, 1px dark outline. Every icon is the same rolled yellowed parchment scroll tied with string and closed by a wax seal. Columns = pathway seal colors: amber #e8b860, lilac #c8b0e8, rose #e07a8a, turquoise #6fe0d0, poison green #9ad06a, steel grey #a8b4c0, brass #d0a050. Rows = rank: row 1 (sequence 9) plain scroll, one seal; row 2 (sequence 8) scroll with a ribbon and two seals; row 3 (sequence 7) scroll with golden end caps, three seals and a faint glow in the seal color. No text.
```
Reihenfolge der Spalten: `laterne, faden, maske, echo, kessel, eisen, schluessel`. Ablage: Atlas `public/sprites/items/formeln.png` und Einzeldateien `public/sprites/items/formel_<id>_<seq>.png`.

## 4. Zutaten und weitere Gegenstände

Alle 16x16, Einzeldateien `public/sprites/items/<id>.png`, dazu je ein Atlas pro Gruppe. Gruppen einzeln erzeugen (max. 8 Icons pro Prompt).

Vorlage:
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, [N] icons in a row, transparent background, 1px dark outline, 1px light rim, each centered and readable at small size: [LISTE]
```

**Gruppe 4.1 Grundzutaten** (Atlas `zutaten_1.png`):
1. `nebeltau` – a shallow glass dish with pale blue-grey condensed fog droplets
2. `silberstaub` – a small paper twist spilling fine silver powder
3. `gluehwurmasche` – a pinch of grey ash in a tiny glass jar, faint amber embers inside
4. `spinnenseide` – a small spool of silvery spider silk with a tiny clock-gear charm
5. `wachsbluete` – a waxy white flower whose petals take on a faint rainbow sheen
6. `grabmoos` – a clump of dark green moss with a bit of grey stone attached
7. `bitterwurz` – a gnarled brown root tied with string
8. `eisenkraut` – a bundle of tough rust-colored stems

**Gruppe 4.2 Zutaten Stufe 2** (Atlas `zutaten_2.png`):
1. `kraehenfeder` – a glossy black crow feather with a tiny ring caught on it
2. `leuchtmoos` – moss glowing pale yellow in a small glass jar
3. `eulenfeder` – a soft grey-brown owl feather with an eye-like pattern
4. `mondmohn` – a pale silver-blue poppy flower
5. `glockenstaub` – a small brass dish with dark metallic dust and a tiny bell shape
6. `kroetenschleim` – a stoppered vial of murky green slime with a toad silhouette label (no text)
7. `ochsenblut` – a dark red dried block wrapped in waxed paper
8. `schattenpilz` – a black mushroom with a faint violet underside

**Gruppe 4.3 Seltene Zutaten** (Atlas `zutaten_3.png`):
1. `sternglas` – a jagged shard of dark glass holding a tiny star of light
2. `spiegelquecksilber` – a small glass ball of liquid mirror-silver
3. `puppenglas` – two glass doll eyes in a small velvet box
4. `seufzerstein` – a smooth pale grey stone with a faint mist rising off it
5. `schwarzbernstein` – a piece of black amber with something tiny trapped inside
6. `sternschlacke` – a lump of glassy dark slag with blue specks
7. `nachtfalterstaub` – a tiny pouch spilling grey-violet moth dust, a small moth wing beside it
8. `geisteressenz` – a small corked vial of swirling turquoise #6fe0d0 mist

**Gruppe 4.4 Sonstiges** (Atlas `sonstiges.png`):
1. `ruhetee` – a small tin of linden tea with a dried flower on the lid
2. `gewuerzwein` – a steaming clay mug of mulled wine with a cinnamon stick (Maud's tavern)
3. `lampenoel` – a small tin can of lamp oil with a spout
4. `taschenuhr` – an engraved silver pocket watch, lid open
5. `glocke` – a small soot-blackened church hand bell with a cracked rim and a faint eye-in-a-circle mark

## 5. Schilling (Währung)
```
[STYLE BLOCK]
Currency icons, transparent background, 1px dark outline: 1) a single worn silver shilling coin with an abstract crow-and-bridge relief (no text, no real coin design), 16x16; 2) a small stack of three coins, 16x16; 3) a leather coin purse, 16x16; 4) a large pile of coins, 16x16; 5) a coin flip animation strip, 8x8 per frame, 6 frames.
```
Ablage: `public/sprites/items/schilling.png`, `schilling_stapel.png`, `geldbeutel.png`, `schilling_haufen.png`, `public/sprites/ui/coin_spin.png`.

## 6. Braukessel

```
[STYLE BLOCK]
Prop: a large communal brewing cauldron for a night market, top-down 3/4 view, 32x32 px: soot-blackened iron cauldron on three short legs over a small fire of glowing coals, ladle hooked on the rim, a few dented tin cups hanging off it. Provide: 1) idle, 2) a 6-frame bubbling animation strip (32x32 each) with neutral pale vapor, 3) a 6-frame "brew success" strip where a column of light-colored vapor rises and forms a small swirl (neutral white-gold so the game can tint it with the pathway color), 4) a 6-frame "brew failed" strip with a puff of dirty brown smoke and a few sparks. Transparent background.
```
Ablage: `public/sprites/props/cauldron.png`, `cauldron_bubble.png`, `cauldron_success.png`, `cauldron_fail.png`.

## 7. Nachtmarkt unter der Krähenbrücke (Tileset)

Ein Schwarzmarkt in den Gewölben unter einer großen Steinbrücke am Kanal: Tränke, Formeln, Pfandware, eine Kampfgrube.

```
[STYLE BLOCK]
Tileset of 16x16 tiles for a black market under a huge stone bridge at night, top-down 3/4 view: damp cobblestone ground (3 variations) with puddles, mossy brick bridge piers (front face, corners, base), the dark underside of the bridge arch seen as a top edge band with dripping water and hanging roots, canal edge with stone steps and an iron railing, wet planks laid over mud, a stone wall with chalk scribbles (no letters, only symbols and tally marks), crow nests and droppings on ledges. Arranged 8x8, seamless.
```
Ablage: `public/sprites/tilesets/A_07_nachtmarkt_tiles.png`.

## 8. Nachtmarkt-Props
```
[STYLE BLOCK]
Prop sheet for a night market under a bridge, 16px grid, transparent background, objects separated by empty space: a makeshift herb stall with dried bundles hanging from a pole and baskets (48x32), a formula dealer's narrow booth with a velvet curtain and a locked display box of scrolls (32x32), a pawnbroker's table covered with odd trinkets, clocks and jewellery (48x32), a fortune-teller-like corner with a low table, cushions and a chalk circle (32x32), strings of mismatched paper lanterns (48x16, amber glow, 2-frame flicker), a crate used as a seat (16x16), a hand-painted crow sign hanging from chains (32x16, no text), a notice board pinned to the bridge wall (16x32), a brazier with glowing coals (16x32, 4-frame animation), sleeping crows on a beam (32x16).
```
```
[STYLE BLOCK]
Props for an underground fighting pit at a night market, 16px grid, transparent background: a square sawdust pit floor tile set (center, edges, corners), low rope fence posts with sagging rope (horizontal, vertical, corner), a betting board with chalk tally marks (16x32, no numbers), a barrel with a coin bucket on top (16x32), a bench for spectators (32x16), a bloodless sawdust patch with a dropped cap (16x16).
```
Ablage: `public/sprites/props/A_08_nachtmarkt_props.png`, `A_08_kampfgrube.png`.

## 9. Händler und Leute am Nachtmarkt

Für jede Figur: **Lauf-Sheet** (64x128) und **Emotions-Portrait** (256x64).

Lauf-Sheet:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, grid-aligned, 1px dark outline, same proportions as the existing 16x32 characters.
```
Portrait:
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious (narrowed eyes), shocked (wide eyes), smiling faintly. Bust shot facing slightly right, simple dark slate vignette background (not transparent), identical framing and palette. Character: [BESCHREIBUNG].
```
| ID | Name | `[BESCHREIBUNG]` |
|---|---|---|
| `nell` | Nell Rauhfuß, Kräuterhändlerin | a weathered herb seller woman in a moss-green patched coat and a dark green headscarf, rust-red braided hair, muddy boots, bundles of dried herbs and a sickle at her belt, sly grin |
| `kittering` | Cornelius Kittering, Formelhändler | a thin elegant elderly dealer in a plum-violet frock coat and a tall black hat, white hair, gloved hands, a slim leather scroll case under his arm, secretive half-smile |
| `gorse` | Gorse, Pfandleiher | a heavyset pawnbroker in a brown leather apron over a waistcoat, dark bushy hair and beard, a jeweller's loupe on his forehead, many rings on his fingers |
| `sabeth` | Sabeth Orr, Wegkundige | a calm older woman in a long dark blue-black travelling coat, short white hair, chalk-dusted fingers, a pendant with seven small colored beads, piercing pale eyes |
| `brock` | Brock, Wirt der Kampfgrube | a burly pit boss with a bald head and black beard, rust-red vest over a striped shirt, rolled sleeves, a towel over his shoulder, broken nose |

Ablage: `public/sprites/characters/A_<id>_walk.png`, `public/sprites/portraits/A_<id>_emotions.png`.

## 10. Laden-Oberfläche
```
[STYLE BLOCK]
UI sheet for a merchant shop window, transparent background: 1) a 9-slice frame 48x48 from 16x16 pieces, dark wood with a brass trim and a small crow ornament on the top-center piece; 2) an item slot 20x20 (empty, highlighted amber, selected, sold out with a diagonal chalk line, locked with a padlock); 3) a small paper price tag 16x8 (blank); 4) icons 16x16: buy (open hand with coin), sell (coin into hand), locked pathway requirement (padlock with a small medallion), locked rank requirement (padlock with a police badge), "only once" (single star seal).
```
Ablage: `public/sprites/ui/A_10_shop.png`.

## 11. Pfad-Oberfläche und Trank-Effekte
```
[STYLE BLOCK]
UI sheet for potion digestion and control, transparent background: 1) a horizontal digestion meter 64x10 px shaped like a glass tube with brass ends, liquid fill in neutral white-gold (game tints it), 6 fill states stacked; 2) a "loss of control" warning frame overlay 480x270 with dark violet cracks creeping in from the screen corners, the center fully transparent, 4 frames of growing cracks; 3) a 16x16 icon of a cracked potion bottle (warning), 4) a 16x16 icon of a fully digested potion (bottle with a check-like brass seal, no letters).
```
```
[STYLE BLOCK]
Overworld sprite sheet for the player investigator (long dark grey coat, flat cap, scarf, satchel) drinking a potion, facing down, 16x32 px per frame, one row of 8 frames: uncork, drink, shudder, a burst of light around the body (neutral white-gold, game tints it), kneel, stand up again. Transparent background. Same proportions as public/sprites/characters/03_01_investigator_walk.png.
```
```
[STYLE BLOCK]
Effect strip, 32x32 px per frame, 8 frames in a row, transparent background: a spiraling column of light particles rising from the ground around a standing figure's silhouette area (figure not drawn), neutral white-gold so the game can tint it with the pathway color. Used when a potion is drunk or fully digested.
```
Ablage: `public/sprites/ui/A_11_digestion.png`, `A_11_control_cracks.png`, `public/sprites/characters/A_player_drink.png`, `public/sprites/fx/potion_ascend.png`.

## 12. Pfad-Auren auf der Karte
```
[STYLE BLOCK]
Seven small aura overlays for an overworld character, each 24x36 px (slightly larger than a 16x32 character so it surrounds it), 4-frame subtle loop per aura, one row per pathway, transparent background, dithered edges, no character drawn: 1) laterne: warm amber motes floating up, 2) faden: thin lilac threads drifting, 3) maske: rose-colored shimmering afterimage outline, 4) echo: turquoise sound rings at the feet, 5) kessel: green vapor wisps, 6) eisen: steel-grey sparks at the hands, 7) schluessel: brass glints and a faint crow-shadow.
```
Ablage: `public/sprites/fx/aura_pfade.png` (Reihen in der Reihenfolge der Pfad-Tabelle).
