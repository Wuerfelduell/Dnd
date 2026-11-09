# Codex-Batch O: Geheime Treffen der drei Zirkel

**Batch-Name:** `treffen` (Manifest: `public/sprites/manifest-treffen.json`)

Ab Fall 4 tagen reihum drei geheime Zirkel, auf denen man Zutaten, Formeln und Raritäten kaufen kann. Man wird mit einer unheimlichen Einladung gerufen (Silberstaub im Mantel, ein Kreidekreis auf der Handfläche, rußige Fingerabdrücke am Ärmel). Jedes Treffen ist nur ein paar Minuten offen. Im Spiel laufen die Treffen schon mit Platzhaltern: Krypta-, Tavernen- und Lagerhaus-Kacheln und geliehene Figuren.

| Zirkel | Map-ID | Ort | Händler | Ware |
|---|---|---|---|---|
| Die Stille Waage | `treffen_waage` | Gewölbe unter der Krähenbrücke | `tresswell` | Zutaten ab Sequenz 7 |
| Der Kreidezirkel | `treffen_kreide` | Hinterzimmer am Altmarkt | `vellacourt` | Formeln |
| Die Rußgesellschaft | `treffen_russ` | Kohlenschuppen hinter der Gießerei | `kohlenjem` | Raritäten aus den Gefahrengebieten |
| Bote aller Zirkel | — | taucht in der Stadt auf und überbringt Einladungen | `schleierbote` | — |

**Schon fertig, nicht neu machen:** alle Sheets aus den Batches D bis I, insbesondere `D_06_kraehenbruecke` und `D_04_*`.

**Reihenfolge:** 2 (Figuren) → 1 (Räume) → 3 bis 4.

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

## 1. Innenräume (Tilesets und Props)

Draufsicht 3/4 auf dem 16er-Raster. Tilesets als Atlas, 8 Tiles pro Reihe, ohne Outline. Die Räume sind klein (etwa 12x9 Tiles), dunkel und voller Kerzen. Es sollen Orte sein, an denen Leute flüstern.

### 1.1 Die Stille Waage: Gewölbe unter der Krähenbrücke (`treffen_waage`)
```
[STYLE BLOCK]
Interior tileset for a secret vaulted cellar beneath a canal bridge, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: old wet brick floor (4 variants), a floor area of worn stone slabs arranged in a circle (edges and curves), damp vaulted brick wall faces with moss and dripping water (top and front faces, corners), a wall with a small iron grate through which the canal water is visible, a narrow stone stair down from a hidden door, puddles reflecting candlelight.
```
```
[STYLE BLOCK]
Prop sheet for a secret merchants' gathering in a cellar, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a large brass balance scale on a stone plinth with two pans, one heavy with silver dust (32x32, 4-frame slow tilt), a long table covered with grey cloth, small glass jars, pouches and wrapped ingredients (48x16), a cabinet of tiny labelled drawers (32x32, no readable labels), silver weights in a row (16x16), many candles in clusters on the floor and on niches (16x16, 3 variants, flicker), hooded figures' benches (32x16), a silver-dusted invitation slip on the floor (16x16), a curtain of grey cloth hiding the entrance (16x32).
```
Ablage: `public/sprites/tilesets/O_waage_tiles.png`, `public/sprites/props/O_waage_props.png`.

### 1.2 Der Kreidezirkel: Hinterzimmer am Altmarkt (`treffen_kreide`)
```
[STYLE BLOCK]
Interior tileset for a secret back room behind an old market shop, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: dark wooden floorboards (4 variants), floorboards with large white chalk circles and sigils drawn on them (edge and curve pieces, 4 variants, abstract symbols only, no letters), wall top and front faces with faded ochre wallpaper and bookshelves built in (corners, edges), a wall almost fully covered by a huge blackboard with chalk diagrams (abstract lines and circles, no text), a hidden door disguised as a bookshelf (closed and open).
```
```
[STYLE BLOCK]
Prop sheet for a secret scholars' circle in a back room, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a round table with a chalk circle drawn on its top and rolled formula scrolls on it (32x32), mismatched armchairs (16x16, 3 variants), a lectern with an open heavy book (16x32), a rack of rolled scrolls with wax seals in many colors (32x32), a box of chalk sticks and a sponge (16x16), a brass telescope pointing at a painted ceiling (16x32), oil lamps with green shades (16x16, flicker), floating chalk dust in a beam of light (32x32 overlay, 4 frames), a palm with a chalk circle (16x16, invitation clue icon).
```
Ablage: `public/sprites/tilesets/O_kreide_tiles.png`, `public/sprites/props/O_kreide_props.png`.

### 1.3 Die Rußgesellschaft: Kohlenschuppen hinter der Gießerei (`treffen_russ`)
```
[STYLE BLOCK]
Interior tileset for a secret coal shed behind a foundry, top-down 3/4 view, 16x16 tiles, 8 per row, no outlines on terrain: black coal dust floor (4 variants), packed earth floor, heaps of coal along the walls (edges and corners), rough wooden plank wall faces blackened with soot, gaps of fog light between the planks (top and front faces, corners), a big sliding barn door (closed and open), an iron stove area tile with ash.
```
```
[STYLE BLOCK]
Prop sheet for a smugglers' market in a coal shed, top-down 3/4 view, 16px grid, transparent background, 1px dark outline: a pot-bellied iron stove glowing red-orange (16x32, flicker), crates and sacks pushed together as a counter with odd rarities on them: a glass jar with a glowing marsh light, a bundle of bones, a crater glass shard, a beak mask (48x16), a coal cart (32x16), a lantern hanging from a beam (16x16, swing), hooks with strange furs and dried creatures in silhouette (32x32), an iron cage with a covered shape inside (32x32, cover twitches 2 frames), a scale for coal (16x32), sooty fingerprint marks on a post (16x16, invitation clue icon), stools made from barrels (16x16).
```
Ablage: `public/sprites/tilesets/O_russ_tiles.png`, `public/sprites/props/O_russ_props.png`.

## 2. Figuren

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
| `schleierbote` | Bote aller drei Zirkel, spricht nie mehr als einen Satz | a slender messenger of unclear age in a long black coat, the face fully hidden behind a black veil hanging from a narrow-brimmed hat, black gloves, holding a sealed envelope; in the portrait only the outline of a chin and a faint glint of eyes behind the veil |
| `tresswell` | Waagemeister der Stillen Waage, Händler für Zutaten | a small elderly man with a round belly, a worn brown velvet waistcoat with silver dust on it, a jeweller's loupe pushed up on his forehead, tiny brass weights hanging from his watch chain, white mutton-chop whiskers, careful little hands |
| `vellacourt` | Dame des Kreidezirkels, Händlerin für Formeln | an elegant woman in her thirties in a pale ivory dress with a high collar and a long grey shawl, light brown hair pinned up loosely, white chalk dust on her fingertips and on one cheek, a cool clever look |
| `kohlenjem` | Hüne der Rußgesellschaft, Händler für Raritäten | a huge broad-shouldered man black with soot from head to toe, a leather coal-carrier's hood down his back, bare scarred forearms, a coal shovel, white teeth and light eyes shining out of the soot, a surprisingly gentle smile |

Ablage: `public/sprites/characters/O_<id>_walk.png`, `public/sprites/portraits/O_<id>_emotions.png`, Köpfe für das Notizbuch zusätzlich als `public/sprites/ui/heads/<id>.png` (24x24, Ausschnitt aus dem neutralen Portrait wie bei Batch H).

## 3. Kartenmarker und Einladungen

### 3.1 Stadtkarten-Marker
Wie `ui/C_08_map_markers.png` (Reihe 1 normal, Reihe 2 bernsteinfarben hervorgehoben). Zusätzlich eine dritte Reihe „Treffen läuft gerade“ mit sanftem Pulsieren.
```
[STYLE BLOCK]
City map location markers, 16x16 each, 3 in a row, transparent background, 1px dark outline, same hand-drawn ink style as the existing map markers: a small brass balance scale (secret cellar of the Silent Scale), a white chalk circle with a dot (back room of the Chalk Circle), a sooty handprint (coal shed of the Soot Society). Row 2: the same in an amber highlighted state. Rows 3 to 4: the same markers with a faint pulsing violet ring around them, 2 frames each (gathering in progress).
```
Reihenfolge/IDs: `treffen_waage, treffen_kreide, treffen_russ`. Ablage: `public/sprites/ui/O_map_markers.png` (48x64).

### 3.2 Einladungen und Zirkel-Zeichen
```
[STYLE BLOCK]
Small UI pieces, transparent background, 1px dark outline: 1) three circle emblems, 32x32 each, wax-seal style: a balance scale in silver on grey, a chalk circle with three dots in white on dark slate, a sooty handprint in black on rust; 2) three invitation icons, 16x16 each: a folded note sprinkled with silver dust, an open palm with a chalk circle, a coat sleeve with sooty fingerprints; 3) a "gathering open" timer ring 16x16 in violet that empties in 8 frames.
```
Ablage: `public/sprites/ui/O_zirkel.png`.

## 4. Kontrolle vor dem Abgeben
- Die drei Räume wirken klein, geheim und unterschiedlich: Silber und Kerzen, Kreide und Bücher, Ruß und Feuer.
- Der Schleierbote zeigt nie ein Gesicht.
- Manifest `manifest-treffen.json`, Prompts in `docs/art/batch-treffen-generation.json`, Kurzeintrag in `docs/art/README.md`.
