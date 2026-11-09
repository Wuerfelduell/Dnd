# Codex-Batch N: Sequenz 6 und 5, Artefakte, neue Fähigkeiten, Asservatenkammer

**Batch-Name:** `sequenzen2` (Manifest: `public/sprites/manifest-sequenzen2.json`)

Die sieben Pfade gehen jetzt bis Sequenz 5. Dafür fehlen Tränke, Formeln, Zutaten, die Effekte und Icons der 14 neuen Fähigkeiten, 12 verfluchte Artefakte aus der Asservatenkammer und den Wildgebieten und zwei Figuren im Revier. Im Spiel stehen bis dahin Platzhalter, die mit identischem Dateinamen überschrieben werden.

**Schon fertig, nicht neu machen:** Tränke und Formeln für Sequenz 9, 8, 7 (`trank_<pfad>_9/8/7`, `formel_<pfad>_9/8/7`, Atlas `formeln.png`), `ui/skill_icons.png` (Sequenz 9 bis 7), die 21 Fähigkeits-Effekte unter `fx/fx_<id>.png`, `status_icons`, alle Pfad-Karten unter `pathways/`.

**Wichtig:** Die Dateien `items/trank_<pfad>_6.png`, `_5.png`, `formel_<pfad>_6.png`, `_5.png`, die 15 Zutaten und die 12 Artefakt-Icons liegen im Repo schon als **Platzhalter** (Kopien anderer Icons). Bitte einfach überschreiben.

**Pfade und Farben** (Spaltenreihenfolge in allen Atlanten): `laterne` #e8b860 (Bernstein), `faden` #c8b0e8 (Flieder), `maske` #e07a8a (Rosé), `echo` #6fe0d0 (Türkis), `kessel` #9ad06a (Giftgrün), `eisen` #a8b4c0 (Stahlgrau), `schluessel` #d0a050 (Messing).

**Reihenfolge:** 1 (Tränke) → 2 (Formeln) → 4 (Fähigkeiten) → 5 (Artefakte) → 3 (Zutaten) → 6 (Figuren).

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

## 1. Tränke Sequenz 6 und 5 (14 Stück, 16x16 und 32x32)

Die Tränke 9 bis 7 werden von links nach rechts kostbarer: schlichtes Fläschchen, Flakon mit Wachssiegel, Kristallphiole im Messingkäfig. Sequenz 6 und 5 setzen diese Reihe fort und müssen daneben noch wertvoller und unheimlicher wirken. Bitte die vorhandenen `trank_<pfad>_7.png` als Stilvorlage mitgeben.
```
[STYLE BLOCK]
Two potion bottle icons for the alchemical pathway "[NAME]", side by side, each 16x16 px, plus the same two again at 32x32 px in a second row, transparent background, 1px dark outline, 1px light rim. The liquid color is [FARBE]. They continue an existing family of three bottles (plain vial, sealed flask, crystal phial in a brass cage) and must look even rarer:
1) Sequence 6: a tall dark-glass decanter with a silver filigree cage and a stopper shaped like [SYMBOL], liquid [FARBE] glowing strongly, [DETAIL6].
2) Sequence 5: a small reliquary-like vessel of black glass and old gold, liquid [FARBE] glowing so brightly it lights the rim of the vessel, faint occult runes as abstract scratches (no letters), [DETAIL5].
```
| ID | `[NAME]` | `[SYMBOL]` | `[DETAIL6]` | `[DETAIL5]` |
|---|---|---|---|---|
| `laterne` | Lantern | a tiny lantern | fog curling away from the glass | a flame burning white-hot at the center, tiny sparks escaping |
| `faden` | Thread | a spindle | fine threads stretched like a net inside the glass | a knot of light that slowly turns, loose ends drifting |
| `maske` | Mask | a half mask | the liquid reflects a second face that is not the viewer's | many tiny faces drifting in the liquid like bubbles |
| `echo` | Echo | a small bell | rings of sound frozen in the glass | a pale breath swirling inside, fogging the glass from within |
| `kessel` | Cauldron | a salamander | a living drop of liquid crawling up the outside | the liquid splits into a gold layer and a green layer |
| `eisen` | Iron | an anvil | the glass bound with riveted iron bands | a tiny glowing sword splinter suspended in the liquid |
| `schluessel` | Key | a keyhole | a shadow that does not match the bottle | the vessel sealed with a silver lock and a thread of black silk |

Ablage: `public/sprites/items/trank_<id>_6.png`, `trank_<id>_5.png` (16x16) und `public/sprites/items/32/trank_<id>_6.png`, `trank_<id>_5.png` (32x32).

## 2. Formeln Sequenz 6 und 5 (14 Stück)
```
[STYLE BLOCK]
Item icon sheet of alchemical formula scrolls, 16x16 px each, 7 columns x 2 rows, transparent background, 1px dark outline. They continue an existing set of rolled yellowed parchment scrolls with wax seals (sequence 9 plain, 8 with ribbon, 7 with golden end caps and three seals). Columns = pathway seal colors: amber #e8b860, lilac #c8b0e8, rose #e07a8a, turquoise #6fe0d0, poison green #9ad06a, steel grey #a8b4c0, brass #d0a050. Row 1 (sequence 6): dark vellum scroll with silver end caps, a large seal in the pathway color and a hanging tassel. Row 2 (sequence 5): a black leather scroll case with gold fittings, partly open, the parchment inside glowing faintly in the pathway color. No text.
```
Reihenfolge der Spalten: `laterne, faden, maske, echo, kessel, eisen, schluessel`. Ablage: Atlas `public/sprites/items/formeln_2.png` und Einzeldateien `public/sprites/items/formel_<id>_6.png`, `formel_<id>_5.png`.

## 3. Zutaten (15 Stück, 16x16 plus 32x32)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, [N] icons in a row, plus the same icons again at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim, each centered: [LISTE]
```
**Gruppe 3.1** (8 Icons, `N_zutaten_1`): `flammenkern` (a glowing ember core in a clay shell, cracks of orange light), `lichtperle` (a pearl glowing brighter in its dark oyster shell), `knotengarn` (a skein of grey yarn full of tiny knots), `spindelknochen` (a polished finger bone shaped like a spindle, lilac sheen), `spiegelwachs` (a lump of silvery wax with a reflective surface), `schminkasche` (a small theatre makeup tin full of grey ash with a rose smear), `glockenerz` (a chunk of greenish bronze ore with a tiny bell shape in it), `atemglas` (a corked little bottle with a pale wisp of breath inside).

**Gruppe 3.2** (7 Icons, `N_zutaten_2`): `salamanderoel` (a squat flask of oil with a small flame burning on the surface), `goldschimmel` (an old coin overgrown with fuzzy golden mould), `ambossstaub` (a pinch of dark grey metal dust on a scrap of leather), `schwertsplitter` (a jagged shard of an old blade), `dietrichsilber` (a little silver ingot with lockpick shapes pressed into it), `schattenseide` (a folded piece of black silk with a faint outline, half invisible), `nebelherz` (a cold grey-blue heart-shaped stone wrapped in fog, beating faintly; give it a 2-frame pulse as extra frames).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten `public/sprites/items/N_zutaten_1.png` und `N_zutaten_2.png`.

## 4. Neue Fähigkeiten: Icons und Effekte

### 4.1 Fähigkeits-Icons
Fortsetzung von `ui/skill_icons.png` (16x16, runde Messing-Plakette, Spalten = Pfade).
```
[STYLE BLOCK]
Skill icon sheet, 16x16 px per icon, 7 columns x 2 rows, transparent background, 1px dark outline, round brass-rimmed badge per icon, same style as the existing skill icon sheet but with a silver inner rim to show the higher rank. Columns = pathways (lantern amber, thread lilac, mask rose, echo turquoise, cauldron green, iron steel grey, key brass). Row 1 = sequence 6, row 2 = sequence 5. Icons: [lantern: two crossing light blades / a white-hot sun] [thread: a net / a thread snapping] [mask: a mirror with a second figure / three masks in a fan] [echo: three singing mouths / a breath being drawn out] [cauldron: a flask with a heart / two vials dissolving armor] [iron: a planted shield / a falling hammer] [key: a hand in a pocket / a crescent slash from the shadow].
```
Ablage: `public/sprites/ui/skill_icons_2.png` (112x32; Spalten wie oben, Reihen Sequenz 6, 5).

### 4.2 Fähigkeits-Effekte
Format wie die vorhandenen `fx/fx_<id>.png`: Frames in einer Reihe, **48x48 = 6 Frames**, **64x64 = 8 Frames**, **32x32 = 6 Frames**. „Selbst“ heißt: der Effekt erscheint am Spieler statt am Gegner.
```
[STYLE BLOCK]
Battle skill effect animation strip, [GRÖSSE] px per frame, [FRAMES] frames in a row, transparent background, crisp pixels, colors based on [FARBE] with a white core where it is brightest: [BESCHREIBUNG].
```
| Datei (`public/sprites/fx/`) | Größe | Ziel | `[FARBE]` | `[BESCHREIBUNG]` |
|---|---|---|---|---|
| `fx_lichtbann.png` | 48 | Gegner | amber | two crossing slashes of solid light, leaving a glowing X that marks a weak spot |
| `fx_weissglut.png` | 64 | Gegner | amber to white | a blinding white-hot burst that expands, then lingers as burning embers |
| `fx_fangnetz.png` | 48 | Gegner | lilac | invisible threads become visible and snap shut into a net around the target |
| `fx_zerreissen.png` | 64 | Gegner | lilac | four quick tearing lines along cracks, threads snapping apart |
| `fx_spiegelbild.png` | 48 | Selbst | rose | a translucent mirror double of a figure steps out sideways with a shimmer |
| `fx_maskenball.png` | 64 | Gegner | rose | three floating masks spin around the target and strike one after another |
| `fx_totenchor.png` | 48 | Gegner | turquoise | three ghostly singing mouths appear and send sound rings |
| `fx_stillgesang.png` | 64 | Gegner | turquoise | a pale breath is pulled out of the target in a spiral and flows to the left (toward the player) |
| `fx_lebenselixier.png` | 32 | Selbst | poison green | a small flask uncorks, green sparkles rise and a thin shield outline forms |
| `fx_zersetzung.png` | 48 | Gegner | poison green and gold | two vials shatter, gold-green liquid eats into an armor plate shape |
| `fx_unbeugsam.png` | 48 | Selbst | steel grey | a heavy iron shield silhouette slams into the ground in front, dust rises |
| `fx_hammerfall.png` | 64 | Gegner | steel grey | a giant translucent hammer falls from above twice, with a shockwave |
| `fx_taschenspiel.png` | 48 | Gegner | brass | two quick dagger glints and a hand shape snatching something away |
| `fx_kehlschnitt.png` | 48 | Gegner | brass and black | three crescent slashes from out of a shadow pool, then the shadow vanishes |

Hinweis für den Einbau (nicht für Codex): `SKILL_FX` in `src/world/assets.js` um die 14 IDs mit der Größe aus der Tabelle ergänzen, `spiegelbild`, `lebenselixier`, `unbeugsam` in `SELF_FX` aufnehmen und das Feld `fx` in `pathways.json` entfernen.

## 5. Artefakte (12 Stück, 16x16 plus 32x32)

Verfluchte Gegenstände mit Vorteil und Fluch. Sie sollen sich von normalen Items abheben: ein feiner violetter Rand (1px, #6a4a8a gedämpft) statt des hellen Rands, und jeweils ein kleines unheimliches Detail.
```
[STYLE BLOCK]
Cursed artifact icon sheet, 16x16 px per icon, 6 icons in a row, plus the same icons again at 32x32 in a second row, transparent background, 1px dark outline and a 1px muted violet rim instead of a light rim, each centered, each with one subtle uncanny detail: [LISTE]
```
**Gruppe 5.1 Asservatenkammer** (`N_artefakte_1`): `uhr_ertrunkener` (a silver pocket watch with water droplets inside the glass and a tiny bubble), `richterhammer` (a black oak judge's gavel with a hairline crack and a faint red stain on the head), `augenbinde_odile` (a strip of linen with two embroidered open eyes), `bleiamulett` (a dull grey lead amulet with a cell number scratched as abstract marks, a hollow center), `rahmenloser_spiegel` (a hand mirror with the frame broken off, the reflection slightly shifted), `zahnkette` (marsh teeth threaded on rusty wire).

**Gruppe 5.2 Wildgebiete** (`N_artefakte_2`): `hungriger_ring` (a signet ring that pinches inward like a mouth), `knochenwuerfel` (three small dice of finger bone, every visible face showing six pips), `stille_glocke` (a small brass handbell without a clapper, faint sound rings anyway), `kupferkrone` (a circlet of twisted copper wire with sparks of verdigris), `wachshand` (a pale wax hand with slightly bent fingers and a wick at the wrist), `schwarzes_herz` (a black heart-shaped stone with a faint red glow, give it a 2-frame beat as extra frames).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten `public/sprites/items/N_artefakte_1.png` und `N_artefakte_2.png`.

### 5.1 Artefakt-Oberfläche
```
[STYLE BLOCK]
Cursed artifact UI pieces, transparent background: 1) an artifact slot frame 20x20 with a violet-black iron rim and tiny chains in the corners, states empty, equipped (faint violet glow) and overloaded (cracked, red-violet glow); 2) a boon marker 8x8 (small amber up arrow seal) and a curse marker 8x8 (small violet crack seal); 3) an "unrest" meter 64x8: an empty iron tube, plus a fill strip in violet with a flickering end (4 frames).
```
Ablage: `public/sprites/ui/N_artefakt_ui.png`.

## 6. Figuren in der Asservatenkammer des Reviers

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
| `thale` | Sergeant Ambrose Thale, Asservatenwart, verwaltet die verfluchten Fundstücke | an elderly grey-haired police sergeant in a navy uniform with rolled sleeves and black sleeve protectors, a heavy ring of keys on his belt, half-moon spectacles, a ledger under his arm, calm watchful face, a thin white scar across one hand |
| `varga` | Dr. Ilse Varga, Gutachterin für Okkultes | a sharp-featured woman in her forties in a tailored dark wine-red coat and dress, dark hair in a low knot with one grey streak, a jeweller's loupe on a fine chain around her neck, black leather gloves, a slim case of instruments |

Ablage: `public/sprites/characters/N_<id>_walk.png`, `public/sprites/portraits/N_<id>_emotions.png`, Köpfe für das Notizbuch zusätzlich als `public/sprites/ui/heads/<id>.png` (24x24, Ausschnitt aus dem neutralen Portrait wie bei Batch H).

## 7. Kontrolle vor dem Abgeben
- Platzhalter-Dateien mit gleichem Namen wirklich überschrieben (Tränke, Formeln, Zutaten, Artefakte).
- Tränke 6 und 5 wirken neben 9 bis 7 als steigende Reihe; gleiche Flüssigkeitsfarbe pro Pfad.
- Effekt-Strips haben die Frame-Zahl aus der Tabelle (48 → 6, 64 → 8, 32 → 6).
- Manifest `manifest-sequenzen2.json`, Prompts in `docs/art/batch-sequenzen2-generation.json`, Kurzeintrag in `docs/art/README.md`.
