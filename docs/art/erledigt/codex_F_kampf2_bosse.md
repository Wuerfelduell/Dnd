# Codex-Batch F: Bonusgegner-Kämpfe, Bosse und Gegner auf der Karte

**Batch-Name:** `kampf2` (Manifest: `public/sprites/manifest-kampf2.json`)

Die fünf Bonusgegner aus Batch B sind jetzt echten Orten und Aufträgen zugeordnet, Fall 4 endet mit einem Bosskampf gegen Felix Dunmore, und Fall 5 wird Miriam Vey als Boss bringen. Diese Datei liefert die fehlenden Kampf-Hintergründe, die Bosse, Gegner, die sichtbar auf der Karte herumlaufen, und Ausrüstung für die noch leeren Slots.

Schon fertig und nicht neu machen: alle Sheets unter `public/sprites/battle/` (Spieler mit Posen und Waffen, 15 Gegner inkl. `enemy_kanalkroete`, `enemy_gasgeist`, `enemy_uhrwerkwaechter`, `enemy_maskenspieler`, `enemy_schlachtergehilfe`, 12 Hintergründe), alle Effekte unter `public/sprites/fx/fx_*.png`, `battle_hud`, `battle_menu`, `battle_result`, `skill_icons`, `status_icons`.

**Begegnungen im Spiel (IDs):**
| Ort (Map-ID) | Begegnung | Gegner-Sprite |
|---|---|---|
| `gaskanaele` | `kanalkroete` (Auftrag „Die Kröte im Kanal“) | `enemy_kanalkroete` (fertig) |
| `gaskanaele` | `gasgeist` (Wächter in Fall 4) | `enemy_gasgeist` (fertig) |
| `uhrturm` | `uhrwerkwaechter` (Auftrag „Das Uhrwerk schweigt nicht“) | `enemy_uhrwerkwaechter` (fertig) |
| `uhrturm` | `felix_fight` (Boss Fall 4) | **neu: `enemy_felix`** |
| `theater` | `maskenspieler` (Auftrag „Der Maskenspieler“) | `enemy_maskenspieler` (fertig) |
| `schlachthof` | `schlachtergehilfe` (Auftrag „Leere Haken“) | `enemy_schlachtergehilfe` (fertig) |

**Reihenfolge:** 1 (Hintergründe) → 2 (Felix) → 3 (Miriam) → 4 (Gegner auf der Karte) → 5 bis 8.

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

## 1. Kampf-Hintergründe für die neuen Orte (480x270, deckend)
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [ORT]. Layered depth (far silhouettes, mid layer, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the central area. Fog layers, muted palette. No characters, no text.
```
| Datei (`public/sprites/battle/`) | Map-ID | `[ORT]` |
|---|---|---|
| `bg_gaskanaele.png` | `gaskanaele` | an abandoned underground gas tunnel: curved brick walls, rusted pipes leaking pale yellow gas, glowing yellow moss, standing water on the floor |
| `bg_uhrturm.png` | `uhrturm` | inside a clock tower: huge turning brass gears in the background, a swinging pendulum, light from the back of the giant clock face (no numerals), wooden plank floor |
| `bg_glockenstube.png` | `uhrturm` (Finale) | the bell chamber at the top of the clock tower: a huge dark bronze bell in a timber frame with a faint turquoise glow, louvred openings with fog outside, candles on the floor |
| `bg_theater.png` | `theater` | the stage of a decaying theatre seen from the side: red curtains, a painted moonlit backdrop, footlights glowing amber, empty velvet seats in darkness |
| `bg_schlachthof.png` | `schlachthof` | inside an empty slaughterhouse: wet tiled floor, empty iron hooks on rails, salt barrels, hanging oil lamps; unsettling through emptiness, no blood |
| `bg_nordtor.png` | `nordtor` | the old north gate at night: massive stone arch with a raised portcullis, city wall, muddy cart tracks, the slaughterhouse silhouette beside it |
| `bg_sternwarte.png` | `sternwarte` | a windswept hill at night: the copper-domed observatory with its slit open, a meteorite crater rim with faintly glowing glass shards, a huge starry sky |
| `bg_gaswerk.png` | — | a gasworks yard: the iron lattice of a giant gasometer, coal heaps, furnace glow from retort house openings |
| `bg_villa.png` | — | a wealthy villa's frozen garden: wrought-iron fence, a stone fish fountain, a dark mansion with one lit window |
| `bg_elend.png` | — | a riverside slum: shacks on stilts, laundry lines, burning oil drums, the river in fog |

## 2. Boss Fall 4: Felix Dunmore (48x48)

Felix ist der schmächtige Souffleur, früher Chorknabe bei Miriam Vey. Er kämpft nicht mit Kraft, sondern mit gestohlenen Stimmen.
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 48x48 px per frame, facing left, 6 columns, transparent background, consistent baseline: Felix Dunmore, a small thin nervous prompter in his late twenties with thick round glasses, ink-stained cuffs, a shabby brown jacket and a choirboy's grey stole around his neck, a bandolier of small sternglass phials across his chest (dark star-glass, each with a tiny swirling light). Rows:
1) idle, nervously fidgeting with a phial, 4 frames;
2) attack A: uncorks a phial and a stolen voice bursts out as a ring of sound, wind-up held 2 frames, 6 frames;
3) attack B: throws a phial that shatters into glass shards and light, wind-up held 2 frames, 6 frames;
4) special: conducts with both hands while several voices swirl around him as ribbons of light, eyes glowing turquoise, 6 frames;
5) phase 2 transition: drinks the light from a phial, his stole lifts as if in wind, 6 frames;
6) hurt, 3 frames;
7) defeated: drops to his knees, phials cracking and voices escaping upward, 6 frames.
Sheet 288x336.
```
```
[STYLE BLOCK]
Battle effect strips, transparent background, crisp pixels: 1) "stolen voice" sound ring in soft white with faint color streaks, 48x48, 6 frames; 2) "phial shatter" burst of star-glass shards and a swirl of light, 32x32, 6 frames; 3) "choir of voices": several translucent ribbons of light circling a center point, 64x64, 8 frames; 4) "voices released": many small lights flying upward, 64x64, 8 frames.
```
Ablage: `public/sprites/battle/enemy_felix.png`, `public/sprites/fx/fx_felix_stimme.png`, `fx_felix_phiole.png`, `fx_felix_chor.png`, `fx_felix_befreit.png`.

## 3. Boss Fall 5: Miriam Vey (96x96, Vorrat)
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background: Miriam Vey, a tall elegant choir director woman in a long grey high-collared coat, dark hair tightly pinned, an eye-in-a-circle brooch at her throat, holding a slim conductor's baton; floating sheets of music orbit her and a halo shaped like an eye inside a circle glows turquoise behind her head. Rows:
1) idle, baton raised, sheets drifting, 4 frames;
2) conducting attack: a sweep of the baton sends sheets of music flying like blades, wind-up held 2 frames, 6 frames;
3) scream attack: turquoise sound rings blast outward, wind-up held 2 frames, 6 frames;
4) summon: three faceless grey choir shades rise behind her, 6 frames;
5) phase 2 transformation: the halo widens, her shadow stretches into a giant eye shape on the ground, her eyes glow, 6 frames;
6) phase 2 idle, more intense glow, 4 frames;
7) hurt, 3 frames;
8) defeat: she collapses as the sheets of music fall like snow and the halo shatters, 6 frames.
Sheet 576x768.
```
```
[STYLE BLOCK]
Side-view battle sprite sheet for a summoned enemy, 48x48 per frame, 6 columns, facing left, transparent background: a faceless choir shade, a floating grey-robed silhouette with no face under the hood, singing turquoise sound rings. Rows: idle float 4, attack (sound ring, wind-up held 2 frames) 6, hurt 3, dissolve 6.
```
Ablage: `public/sprites/battle/enemy_miriam.png`, `enemy_chorschatten.png`.

## 4. Gegner auf der Karte (Overworld)

Gegner sollen vor dem Kampf sichtbar auf der Karte herumlaufen oder lauern. Format wie die Figuren: **16x32 pro Frame** (Tiere und kleine Wesen **32x32**), 4 Richtungen x 4 Frames.
```
[STYLE BLOCK]
Overworld sprite sheet for a roaming enemy in a top-down 3/4 view: [BESCHREIBUNG]. Frame size [GRÖSSE]. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk/move cycle). Transparent background, grid-aligned, 1px dark outline, matches the scale of the existing 16x32 characters.
```
| Datei (`public/sprites/characters/`) | Größe | `[BESCHREIBUNG]` |
|---|---|---|
| `F_ow_nebelhund.png` | 32x32 | a gaunt hound half made of drifting fog with two glowing turquoise eyes |
| `F_ow_aktenfresser.png` | 32x32 | a scurrying mass of rats tangled with paper scraps |
| `F_ow_kanalkroete.png` | 32x32 | a huge pale toad with glowing turquoise warts, hopping |
| `F_ow_gasgeist.png` | 16x32 | a flickering ghost of pale yellow gas, drifting |
| `F_ow_uhrwerkwaechter.png` | 16x32 | a clockwork guardian with a clock-face head and pendulum arms, stiff steps |
| `F_ow_maskenspieler.png` | 16x32 | a masked actor in a tattered stage costume with a stage rapier, dancing gait |
| `F_ow_schlachtergehilfe.png` | 16x32 | a hulking slaughterhouse worker in a leather apron carrying an empty meat hook |
| `F_ow_chorfanatiker.png` | 16x32 | a grey-robed choir fanatic swinging a smoking censer |
| `F_ow_spiegelschatten.png` | 16x32 | a dark mirror-image human with cracked glass skin and turquoise light in the cracks |
| `F_ow_chorschatten.png` | 16x32 | a faceless floating grey choir shade |

Dazu ein **Alarm-Symbol** über Gegnern:
```
[STYLE BLOCK]
Small overworld alert icons, 16x16, 4-frame bob each, transparent background: an amber exclamation seal (enemy noticed you), a grey question seal (enemy searching), a turquoise eye seal (occult enemy nearby).
```
Ablage: `public/sprites/ui/F_04_alarm.png`.

## 5. Mini-Portraits für die Zugleiste
```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: player investigator, Sergeant Holt, fog hound, ash warden, rat swarm, choir fanatic, Constable Rook, Silas, mirror shade, shadow puppet, pit fighter, canal toad, gas ghost, clockwork guardian, masked actor, slaughterhouse worker, Felix Dunmore, Miriam Vey, choir shade.
```
Reihenfolge/IDs: `player, sparring, fog_hound, ash_warden, archive_rats, choir_zealots, rook_fight, silas_fight, mirror_shade, schattenpuppe, grubenkampf, kanalkroete, gasgeist, uhrwerkwaechter, maskenspieler, schlachtergehilfe, felix_fight, miriam, chorschatten`. Ablage: `public/sprites/ui/F_05_zug_portraits.png`.

## 6. Bestiarium (Notizbuch-Seite pro Gegner)
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [GEGNER] in the upper two thirds, a pinned specimen label shape and a few scribbled notes as abstract lines (no readable text) in the lower third, a coffee stain in a corner.
```
Für jeden Gegner aus der Liste in Abschnitt 5 außer dem Spieler (18 Karten). Ablage: `public/sprites/ui/bestiary/F_<id>.png`.

## 7. Ausrüstung (Mantel, Hut, Amulett) und neue Waffen

Bisher gibt es nur den Waffen-Slot; Mantel, Hut und Amulett kommen als nächstes. Icons 16x16 plus 32x32.
```
[STYLE BLOCK]
Equipment icon sheet, 16x16 px per icon, 8 icons in a row, plus the same 8 again at 32x32 in a second row, transparent background, 1px dark outline, 1px light rim: [LISTE]
```
**Mäntel** (`F_07_maentel`): `mantel_wolle` (a plain grey wool greatcoat), `mantel_gewachst` (a waxed dark green oilskin coat), `mantel_polizei` (a navy police cape with brass clasp), `mantel_samt` (a plum velvet frock coat), `mantel_flicken` (a patched brown coat with many pockets), `mantel_leder` (a heavy black leather duster), `mantel_chor` (a grey choir robe with a hood), `mantel_nebel` (a coat woven with silvery threads that seems to dissolve into fog at the hem).

**Hüte** (`F_07_huete`): `hut_schirmmuetze` (a flat cap), `hut_melone` (a bowler), `hut_zylinder` (a top hat), `hut_helm` (a constable's tall helmet), `hut_kapuze` (a deep hood), `hut_schutzbrille` (a cap with brass goggles), `hut_witwenschleier` (a black hat with a veil), `hut_maske` (a white porcelain half mask on a ribbon).

**Amulette** (`F_07_amulette`): `amulett_laterne` (a tiny brass lantern pendant with an amber glow), `amulett_faden` (a knotted lilac thread bracelet), `amulett_maske` (a rose-colored cameo mask), `amulett_echo` (a turquoise shell on a cord), `amulett_kessel` (a tiny green glass vial on a chain), `amulett_eisen` (a rusted iron ring on a leather thong), `amulett_schluessel` (a brass key charm with a crow feather), `amulett_stimme` (a sternglass phial pendant with a soft trapped light).

**Waffen** (`F_07_waffen`): `revolver` (a six-shot revolver), `messingschlagring` (brass knuckles), `brecheisen` (an iron crowbar), `regenschirmdegen` (an umbrella with a hidden blade), `taktstock_silber` (a silver conductor's baton), `kette_rauchfass` (a censer on a chain), `laterne_kampf` (a heavy bullseye lantern used as a club), `stimmgabel_gross` (a large iron tuning fork).

Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`, Atlanten unter `public/sprites/items/<gruppe>.png`.

### 7.1 Ausrüstungs-Oberfläche
```
[STYLE BLOCK]
Equipment screen UI, transparent background: a paper-doll silhouette panel 96x128 of a standing investigator in outline only (no details), with four empty slot frames 20x20 placed at head, body, neck and hand; slot states empty, highlighted amber, filled; small 8x8 slot type glyphs (hat, coat, amulet, weapon).
```
Ablage: `public/sprites/ui/F_07_ausruestung.png`.

## 8. Boss-Einblendung
```
[STYLE BLOCK]
Boss intro splash, 480x270 px, transparent background except for a dark diagonal band across the middle (about 90 px high) with ink-splatter edges; on the band leave space for a name (no text); provide 6 frames of the band sliding in from the left and a separate 160x160 dramatic bust portrait for each boss: Felix Dunmore with phials glowing, Miriam Vey with baton raised and turquoise halo.
```
Ablage: `public/sprites/ui/F_08_boss_band.png`, `F_08_boss_felix.png`, `F_08_boss_miriam.png`.
