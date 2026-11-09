# Codex-Batch W: Kapitel 2, Versunkene Altstadt und Nebengeschichten

**Batch-Name:** `wexmoor5` (Manifest: `public/sprites/manifest-wexmoor5.json`)

Kapitel 2 hat ein neues Gefahrengebiet bekommen: die **Versunkene Altstadt** unter Pfahldorf. Das ist das alte Wexmoor, das vor dreihundert Jahren im Moor versank. Die Häuser stehen noch, die Straßen sind halb geflutet, und der ertrunkene Rat tagt weiter. Dazu kommen vier Monster, ein Boss, neue Beute, zwei Verbrauchsgüter und drei Artefakte. Im Spiel stehen bisher Platzhalter.

**Schon fertig, nicht neu machen:** alle Figuren (Vey, Marlowe, Hale, Druce, Mutter Sedge, Zunder), alle Monster aus Batch S, Batch V (Elsbeth, Gasthaus, Price).

**Hinweis Setting:** Wexmoor ist eine versinkende Moorstadt an der Küste: Torf, Reet, Schlick, Salz, Bojen, Nebel. Die Altstadt darunter ist älter und steinerner: Kopfsteinpflaster unter Schlick, gotische Giebel, grünes Kupfer, Algen, schwarze Eichenpfähle von oben. Wo der Style-Block „Kettlegate“ sagt, gilt für diese Datei Wexmoor mit derselben Stimmung.

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

## 1. Tileset und Kulisse der Versunkenen Altstadt (Karte `wx_altstadt`)
Tileset:
```
[STYLE BLOCK]
Tileset for a drowned old town under a stilt village, 16x16 px tiles in a grid, 8 columns: cobblestone street half covered in black mud (4 variants), shallow flood water over cobbles (4 variants, 2-frame shimmer), deep dark water, ruined house walls of grey stone with gothic gable windows (top, face, corners), a collapsed wall rubble pile, algae-covered steps, thick black oak stilts coming down from above with grey light falling between them (2x1 and 1x2 pieces), reed clumps growing through cobbles, a wooden boardwalk laid over the mud. No outline on terrain.
```
Props:
```
[STYLE BLOCK]
Props for the same drowned town, transparent background, 1px dark outline: a rusted street lamp with no glass (16x32), a flooded chapel doorway with a bronze plaque (32x48), a huge stuck sluice gate with a rusted wheel (48x48, 2 frames: open, closed), the steps and portal of an old town hall with a stone tower-over-waves crest (64x48), a lectern with a brass-locked ledger (16x32), a carved stone town gate arch with barnacles (48x48, no readable letters), a rope ladder going up into darkness (16x48), windows with a faint green light inside (16x16, 2 frames).
```
Kampf-Hintergrund:
```
[STYLE BLOCK]
Battle background 480x270, opaque: a drowned cobblestone square under a ceiling of black wooden stilts and planks, thin grey light falling through the gaps, gothic gables half sunk in mud, still flood water reflecting a green glow from a town hall portal, bottom 70 px flat muddy cobble ground strip.
```
Ablage: `public/sprites/tilesets/W_01_altstadt_tiles.png`, `public/sprites/props/W_altstadt_props.png`, `public/sprites/battle/bg_altstadt.png`.

## 2. Monster (Kampf-Sheet 64x64, 6 Spalten; Karten-Figur wie in Batch S)
Reihen für alle vier: 1) idle (4), 2) attack_a (6, Ausholpose 2 Frames halten), 3) attack_b (6, Ausholpose 2 Frames halten), 4) hit (2), 5) death (6).
```
[STYLE BLOCK]
Battle sprite sheet for an enemy, 64x64 px per frame, 6 columns, facing left: [BESCHREIBUNG]. Rows: idle (4), attack_a (6, hold wind-up 2 frames), attack_b (6, hold wind-up 2 frames), hit (2), death (6). Transparent background, same baseline in all frames.
```
| ID | Name | `[BESCHREIBUNG]` | Karten-Figur |
|---|---|---|---|
| `pfahlbohrer` | Pfahlbohrer | a huge grey shipworm as thick as a barrel bursting out of a black oak stilt, a head of overlapping horn plates with a round grinding mouth, wood splinters falling; attack_a: bores forward, attack_b: whips its body and splinters fly | 16x32, Wurm aus einem Pfahl |
| `ratsherr` | Ertrunkener Ratsherr | a drowned councillor in a robe of kelp over a faded green council gown, a chain of office tarnished green, sitting on a chair stuck in the mud and reading a dripping ledger, pale blue skin, empty polite face; attack_a: reads a sentence aloud (green glyph-less ripples), attack_b: slams down a wax seal | 16x32, sitzend auf Stuhl |
| `kellerkrebs` | Kellerkrebs | a crayfish the size of a dog, dark rust-brown shell encrusted with shards of old wine bottles, two oversized claws, long feelers; attack_a: claw pinch, attack_b: buries itself and bursts out | 32x32 |
| `namensmade` | Namensmade | a pale maggot as long as an arm, glistening waxy body with faint smeared letter-like marks that are not real letters, a small round mouth that sucks; occult turquoise glow inside; attack_a: lunges and sucks, attack_b: sweats wax drops that fly up | 32x32, kriecht |

Boss `buergermeister`, Der Ertrunkene Bürgermeister (96x96 pro Frame, 6 Spalten):
```
[STYLE BLOCK]
Boss battle sheet, 96x96 px per frame, 6 columns, facing left: the drowned mayor of a sunken town, a tall gaunt man in a rotten black-green mayoral coat and tricorn, a heavy gold chain of office tangled with seaweed, water running from his sleeves, behind him faint silhouettes of his drowned townsfolk standing in the mud. Rows: idle (4), chain_lash (6, hold wind-up 2 frames), council_bell (6, rings a small bronze bell, hold wind-up 2 frames), verdict (6, raises a hand, townsfolk silhouettes step forward), hit (2), phase2 (6, the town sinks behind him, green light rises), defeated (6, lays down the chain and walks backwards into the water). Transparent background.
```
Dazu ein Boss-Intro-Bild 480x270 wie `S_08_boss_glockenmutter` (deckend): der Bürgermeister auf den Rathausstufen, hinter ihm seine Stadt.

Ablage: `public/sprites/battle/enemy_<id>.png`, Karten-Figuren `public/sprites/characters/W_ow_<id>.png`, Bestiarium-Karten `public/sprites/ui/bestiary/W_<id>.png` (wie Batch S), Zug-Portraits in einer Reihe `public/sprites/ui/W_zug_portraits.png` (Reihenfolge: pfahlbohrer, ratsherr, kellerkrebs, namensmade, buergermeister), Boss-Intro `public/sprites/ui/W_boss_buergermeister.png`.

Effekte (Reihe, transparente Felder):
```
[STYLE BLOCK]
Battle effect sprites, frames in a row: 1) wood splinter burst 48x48 (6 frames), 2) green wax seal stamp impact 48x48 (5 frames), 3) wax drops flying up with a faint turquoise glow 48x48 (6 frames), 4) bronze bell toll ring wave 96x48 (6 frames).
```
Ablage: `public/sprites/fx/fx_splitter.png`, `fx_siegel.png`, `fx_madenwachs.png`, `fx_ratsglocke.png`.

## 3. Item-Icons (16x16, zusätzlich 32x32)
```
[STYLE BLOCK]
Item icons, transparent background, 1px dark outline, each 16x16 and a 32x32 version: [LISTE].
```
| ID | `[LISTE]`-Eintrag |
|---|---|
| `pfahlholz` | a piece of black wet oak riddled with round worm holes |
| `ratssiegel` | a soft green wax seal showing a tower over waves (no letters) |
| `krebspanzer` | a dark rust-brown crayfish back shell with glass shards stuck on it |
| `madenwachs` | a lump of pale white wax with a faint turquoise glimmer |
| `moortee` | a dented tin field flask with a cork, steam curling out, a sprig of mint tied to it |
| `salzbrot` | a round hard fisherman's bread with a crust of white salt crystals |
| `amtskette` | a heavy gold chain of office tangled with green seaweed, a tower medallion |
| `veys_stimmgabel` | a silver tuning fork with faint sound rings around the tines |
| `schreintaefelchen` | a small blank wooden name tablet with a hole for a nail, carved border |

Ablage: `public/sprites/items/<id>.png` (überschreibt die Platzhalter) und `public/sprites/items/32/<id>.png`, wie in Batch S.

## 4. Kontrolle vor dem Abgeben
- 1 Tileset, 1 Props-Sheet, 1 Kampf-Hintergrund für die Altstadt.
- 4 Monster-Sheets mit Karten-Figur, Bestiarium-Karte und Zug-Portrait, 1 Boss-Sheet mit Intro-Bild.
- 4 Effekte, 9 Item-Icons in beiden Größen.
- Manifest `manifest-wexmoor5.json`, Prompts in `docs/art/batch-wexmoor5-generation.json`, Kurzeintrag in `docs/art/README.md`.
