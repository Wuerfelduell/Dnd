# Codex-Batch L: Neue Stadtgegner, Kopfgelder und Nachtvarianten

**Batch-Name:** `gegner3` (Manifest: `public/sprites/manifest-gegner3.json`)

Kettlegate bekommt Gegner, die frei in der Stadt unterwegs sind: Straßenpack, Schmuggler und kleine okkulte Kreaturen, die nachts aus Kanälen, Kaminen und Glockentürmen kommen. Dazu gehören Kopfgeld-Steckbriefe für Polizeiaufträge, Beute und je ein Kampf-Hintergrund für Dächer und Markthalle. Die Gegner werden in einem späteren Durchgang eingebaut. Bis dahin liegen sie als Vorrat bereit, die IDs unten sind die geplanten Spiel-IDs.

**Schon fertig, nicht neu machen:** alle Gegner aus B, F, I und die geplanten aus G, J und K (Wildgebiets-Monster, Sekten, Fall 5 und 6), `F_04_alarm`, `F_05_zug_portraits`, Bestiarium-Karten F_*, alle Kampf-Hintergründe unter `public/sprites/battle/bg_*.png`.

**Geplante IDs:**
| Art | IDs |
|---|---|
| Menschen (48x48) | `laternendieb`, `kanalschmuggler`, `nachtkraemer`, `falschgeldpraeger` |
| Kreaturen (64x64) | `russgeist`, `glockenhund`, `papierkraehe`, `wachsmann`, `fadenspinne`, `nebelaal` |
| Anführer (96x96) | `schmugglerkoenigin` (Kopfgeld-Boss) |
| Kampf-Hintergründe | `bg_daecher`, `bg_markthalle` |

**Reihenfolge:** 1 (Menschen) → 2 (Kreaturen) → 3 (Anführerin) → 4 (Karte) → 5 bis 8.

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

Vorlage für alle Gegner in Abschnitt 1 und 2:
```
[STYLE BLOCK]
Side-view battle sprite sheet, [GRÖSSE] px per frame, facing left, 6 columns, transparent background, consistent baseline: [BESCHREIBUNG]. Rows: 1) idle, 4 frames; 2) attack A, wind-up held 2 frames, 6 frames; 3) attack B or skill, wind-up held 2 frames, 6 frames; 4) hurt, 3 frames; 5) defeated, 6 frames. Sheet [BREITE]x[HÖHE].
```

## 1. Menschliche Gegner (48x48, Sheet 288x240)
| Datei (`public/sprites/battle/`) | `[BESCHREIBUNG]` | Angriff A / B |
|---|---|---|
| `enemy_laternendieb.png` | a wiry lamp thief in a dark patched coat and a soot-blackened scarf over his face, a stolen glowing gas mantle in a cage on his belt, a hooked pole | A: hooks and trips with the pole; B: smashes the gas mantle, a burst of light that blinds |
| `enemy_kanalschmuggler.png` | a stocky canal smuggler in oilskins and high waders, a boat hook and a lantern, a crate strapped to his back, water dripping | A: boat hook thrust; B: throws a net weighted with lead |
| `enemy_nachtkraemer.png` | a shady night pedlar in a long coat lined inside with dozens of small bottles and trinkets, a crooked top hat, a toothy smile | A: throws a cheap bottle that bursts into coloured smoke; B: sells himself a remedy and heals (holds up a glowing bottle) |
| `enemy_falschgeldpraeger.png` | a nervous counterfeiter in a leather apron and magnifying goggles, ink-stained fingers, a heavy coin press handle used as a club, fake coins spilling from his pockets | A: swings the press handle; B: throws a handful of hot fake coins |

## 2. Kreaturen der Nacht (64x64, Sheet 384x320)
| Datei (`public/sprites/battle/`) | `[BESCHREIBUNG]` | Angriff A / B |
|---|---|---|
| `enemy_russgeist.png` | a soot spirit from the chimneys: a billowing black cloud with two ember eyes and long smoky arms, small sparks inside | A: smothering grab; B: soot blast that lowers accuracy |
| `enemy_glockenhund.png` | a lean bronze-colored hound with a small cracked bell instead of a collar, its bark visible as turquoise rings, glowing eyes | A: bite; B: howl that rings like a bell and frightens |
| `enemy_papierkraehe.png` | a crow made of folded newspaper and torn letters, ink-black beak, paper wings rustling, scraps falling off | A: dives with paper-cut wings; B: calls a flurry of paper scraps that hides it |
| `enemy_wachsmann.png` | a slumped human figure made of melted grey candle wax, a burning wick on top of its head, its face slowly dripping | A: hot wax punch; B: melts and reforms, healing itself |
| `enemy_fadenspinne.png` | a large spider made of tangled lilac thread and brass pins, legs like knitting needles, a single glowing bead as an eye | A: needle leg stab; B: thread web that binds (shows a lilac net) |
| `enemy_nebelaal.png` | a long pale eel made of fog that swims through the air, faint turquoise glow along its spine, a round mouth | A: coiling bite; B: dissolves into fog and reappears behind |

Effekte dazu:
```
[STYLE BLOCK]
Battle effect strips, transparent background, crisp pixels, frames in one row: 1) "soot blast" black smoke with ember sparks, 48x48, 6 frames; 2) "bell howl" turquoise sound rings from a mouth, 48x48, 6 frames; 3) "paper flurry" swirling paper scraps, 48x48, 6 frames; 4) "hot wax" grey wax splash cooling, 32x32, 6 frames; 5) "thread web" a lilac net closing, 48x48, 6 frames; 6) "coloured smoke" a cheap pink-green smoke puff, 32x32, 6 frames; 7) status icon 16x16, 4 frames: "bound" (a lilac thread knot).
```
Ablage: `public/sprites/fx/fx_russ.png`, `fx_glockenheulen.png`, `fx_papierwirbel.png`, `fx_wachs.png`, `fx_fadennetz.png`, `fx_farbrauch.png`, `fx_status_gefesselt.png`.

## 3. Kopfgeld-Anführerin: die Schmugglerkönigin (96x96)
Anführerin der Kanalschmuggler, Ziel eines großen Polizei-Kopfgelds. Kämpft von einem kleinen Kahn aus, den ihre Leute ins Bild schieben.
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: the Smuggler Queen, a tall weathered woman in a long oilskin coat over a faded red brocade waistcoat, a captain's cap, a brass spyglass and a cutlass, standing on the bow of a small flat canal barge loaded with crates (the barge is part of the sprite, sitting on a strip of dark water), two lanterns on poles. Rows:
1) idle, the barge rocks gently, 4 frames;
2) attack: cutlass slash from the bow, wind-up held 2 frames, 6 frames;
3) attack: kicks a crate that bursts with stolen goods and glass, wind-up held 2 frames, 6 frames;
4) skill: whistles, two smugglers climb onto the barge, 6 frames;
5) skill: drinks from a hip flask and laughs (heals), 6 frames;
6) hurt, 3 frames;
7) defeated: drops her cutlass, raises her hands, the barge drifts slightly, 6 frames.
Sheet 576x672.
```
```
[STYLE BLOCK]
Dramatic boss bust portrait, 160x160 px, transparent background: the Smuggler Queen, a weathered woman with a captain's cap, a scar through one eyebrow, a cutlass over her shoulder, lantern light on her face.
```
Ablage: `public/sprites/battle/enemy_schmugglerkoenigin.png`, `public/sprites/ui/L_08_boss_schmugglerkoenigin.png`, dazu Portrait-Sheet `public/sprites/portraits/L_schmugglerkoenigin_emotions.png` (neutral, suspicious, angry, smiling faintly, 256x64, Vorlage wie bei den anderen Figuren) und Lauf-Sheet `public/sprites/characters/L_schmugglerkoenigin_walk.png` (16x32, ohne Kahn).

## 4. Gegner auf der Karte
```
[STYLE BLOCK]
Overworld sprite sheet for a roaming enemy in a top-down 3/4 view: [BESCHREIBUNG]. Frame size [GRÖSSE]. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk/move cycle). Transparent background, grid-aligned, 1px dark outline, matches the scale of the existing 16x32 characters.
```
| Datei (`public/sprites/characters/`) | Größe | `[BESCHREIBUNG]` |
|---|---|---|
| `L_ow_laternendieb.png` | 16x32 | a sneaking lamp thief with a scarf over his face and a hooked pole |
| `L_ow_kanalschmuggler.png` | 16x32 | a stocky smuggler in oilskins carrying a crate |
| `L_ow_nachtkraemer.png` | 16x32 | a night pedlar in a long coat full of bottles, crooked top hat |
| `L_ow_falschgeldpraeger.png` | 16x32 | a nervous man in goggles and leather apron clutching a bag of coins |
| `L_ow_russgeist.png` | 32x32 | a drifting black soot cloud with ember eyes |
| `L_ow_glockenhund.png` | 32x32 | a lean bronze hound with a bell collar |
| `L_ow_papierkraehe.png` | 32x32 | a hopping, fluttering crow of folded newspaper |
| `L_ow_wachsmann.png` | 16x32 | a slow shuffling figure of melted grey wax with a burning wick |
| `L_ow_fadenspinne.png` | 32x32 | a scuttling spider of lilac thread and brass pins |
| `L_ow_nebelaal.png` | 32x32 | a pale fog eel swimming through the air in waves |

## 5. Zugleiste und Bestiarium
```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: lamp thief with scarf, canal smuggler in oilskins, night pedlar with top hat, counterfeiter in goggles, soot spirit, bell hound, paper crow, wax man with wick, thread spider, fog eel, smuggler queen with captain's cap.
```
Reihenfolge/IDs: `laternendieb, kanalschmuggler, nachtkraemer, falschgeldpraeger, russgeist, glockenhund, papierkraehe, wachsmann, fadenspinne, nebelaal, schmugglerkoenigin`. Ablage: `public/sprites/ui/L_zug_portraits.png`.
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [GEGNER] in the upper two thirds, a pinned specimen label shape and a few scribbled notes as abstract lines (no readable text) in the lower third, a coffee stain in a corner.
```
Elf Karten für dieselben IDs. Ablage: `public/sprites/ui/bestiary/L_<id>.png`.

## 6. Kampf-Hintergründe (480x270, deckend)
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [ORT]. Layered depth (far silhouettes, mid layer, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the central area. Fog layers, muted palette. No characters, no text.
```
| Datei (`public/sprites/battle/`) | `[ORT]` |
|---|---|
| `bg_daecher.png` | the rooftops of Kettlegate at night: slate roofs and chimney stacks with smoke, a clock tower silhouette far away, laundry lines between roofs, the ground strip is a flat tar roof with a skylight |
| `bg_markthalle.png` | inside a closed iron-and-glass market hall at night: empty stalls under canvas, hanging scales, crates of cabbages, moonlight through the glass roof, wet stone floor |

## 7. Kopfgelder und Beute

### 7.1 Steckbriefe für das Polizei-Brett
```
[STYLE BLOCK]
Wanted poster, 64x80 px, not transparent: an aged paper poster with torn corners and a nail at the top, a sketched ink portrait of [PERSON] in the upper half, blank space below with abstract lines for text (no readable text), a red wax police seal in a corner. Second frame: the same poster with a big diagonal black "caught" stripe across it (no letters).
```
| Datei (`public/sprites/ui/wanted/`) | `[PERSON]` |
|---|---|
| `L_steckbrief_laternendieb.png` | a man with a scarf over his face and a flat cap |
| `L_steckbrief_falschgeldpraeger.png` | a nervous man with magnifying goggles |
| `L_steckbrief_nachtkraemer.png` | a grinning pedlar with a crooked top hat |
| `L_steckbrief_schmugglerkoenigin.png` | a woman with a captain's cap and a scarred eyebrow |
| `L_steckbrief_leer.png` | an empty silhouette with a question mark shape (no letter, just a hook and a dot drawn as a shape) |

### 7.2 Beute-Icons (16x16 plus 32x32)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 8 icons in a row, plus the same 8 again at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim, each centered: [LISTE]
```
**Beute** (`L_beute`): `gasgluehstrumpf` (a small glowing gas mantle in a wire cage), `schmuggelware` (a small wrapped package tied with tarred string), `falschgeld` (a little stack of dull, slightly wrong coins), `russklumpen` (a lump of soot with an ember glowing inside), `bronzeglocke_klein` (a tiny cracked bronze bell), `papierfeder` (a feather folded from newspaper), `wachsdocht` (a still-burning wick in a lump of grey wax), `spinnfaden_lila` (a spool of glowing lilac thread).

**Kopfgeld-Belohnungen** (`L_belohnungen`, 4 Icons): `entermesser` (a cutlass with a brass guard), `fernrohr_messing` (a brass spyglass), `mantel_oelzeug` (a dark oilskin coat), `polizeimarke_gold` (a golden police badge, honor reward).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten `public/sprites/items/L_beute.png` und `L_belohnungen.png`.

## 8. Nacht- und Elite-Markierung
Gegner bekommen im Spiel eine Elite-Tönung. Damit man sie auf der Karte erkennt, fehlen noch kleine Marker.
```
[STYLE BLOCK]
Small overworld markers, transparent background, 4-frame bob each: 1) elite crown seal in brass, 16x16; 2) bounty target seal: a small red wax seal with a crosshair shape, 16x16; 3) night-only creature: a crescent moon seal in turquoise, 16x16; 4) a ground ring 32x16 under an elite enemy, dashed amber outline, slowly rotating.
```
Ablage: `public/sprites/ui/L_marker.png`.

## 9. Kontrolle vor dem Abgeben
- Alle Kampf-Sheets haben 6 Spalten und die angegebene Sheet-Größe.
- Kreaturen bleiben gruselig, aber nicht eklig oder blutig.
- Manifest `manifest-gegner3.json`, Prompts in `docs/art/batch-gegner3-generation.json`, Kurzeintrag in `docs/art/README.md`.
