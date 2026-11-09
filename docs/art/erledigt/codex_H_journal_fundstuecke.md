# Codex-Batch H: Journal-Quellen und gefährliche Fundstücke

**Batch-Name:** `journal` (Manifest: `public/sprites/manifest-journal.json`)

Zwei neue Ideen aus dem Spiel:
1. **Quellen im Journal:** Bei jedem Hinweis zeigt das Notizbuch, woher er stammt: das Gesicht der Person, die ihn erzählt hat, oder ein Symbol für das, was man gelesen oder gesehen hat.
2. **Gefährliche Fundstücke:** Verschwundene Bücher und Gegenstände, die man zum Revier zurückbringt, kann man unterwegs untersuchen. Das kann Unruhe, einen Fluch oder einen Hinterhalt auslösen, bringt aber manchmal einen Bonus-Hinweis.

Schon vorhanden und nicht neu machen: alle 64x64-Portraits (`public/sprites/portraits/`), die Quellen-Symbole `ui/14_06_information_source_icons.png` (Polizeibericht, Zeuge, eigene Beobachtung, Dokument, Gerücht, Zeitung, Geistsicht) und die Log-Marker `ui/C_07_*`.

**Reihenfolge:** 1 (Mini-Köpfe) → 2 (Quellen-Symbole) → 3 (Journal-Rahmen) → 4 bis 7 (Fundstücke).

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

## 1. Mini-Köpfe für das Journal (24x24)

Kleine, sofort erkennbare Köpfe für jede Figur, die Hinweise gibt. Ein Sheet pro Gruppe, 8 Köpfe nebeneinander (192x24).
```
[STYLE BLOCK]
Sheet of tiny character head icons for a journal, 24x24 px each, 8 in a row (192x24), transparent background, 1px dark outline, head and shoulders only, facing slightly right, each instantly recognizable by hair, hat and one signature detail, matching the existing 64x64 portraits of the same characters: [LISTE]
```
**Gruppe 1 (Revier):** marlowe (grey hair pinned up, dark violet coat collar), holt (grey moustache, reading glasses on a cord), pimm (auburn bun, half-moon spectacles), rook (blond, tall constable helmet), price (ruddy cheeks, tall helmet, bullseye lantern glint), barnaby (ragged grey hair, stubble), fenwick (round spectacles, grey trimmed beard), kit (flat cap pulled low, dirty cheeks).

**Gruppe 2 (Ashgrove und Ebba):** elias (grey beard, patched cap), greta (headscarf, flower behind ear), halloway (pince-nez, slicked thin hair), ivy (strawberry-blonde braid), hester (loose strawberry-blonde hair, faint turquoise eyes), anselm (wild white hair, black cassock collar), moll (stubble, earth-brown collar), agnes (black lace cap, white hair).

**Gruppe 3 (Hafen und Altmarkt):** pip (grey newsboy cap, gap-toothed grin), tobias (dark knit cap), maud (curly red hair), silas (slicked black hair, thin moustache, wine-red neckerchief), ned (cloth over the eyes), quill (jeweller's loupe in one eye), ambrose (short grey hair, white collar), wick (dark blue cap, white stubble).

**Gruppe 4 (Nachtmarkt und Nordtor):** grimes (tall helmet, red cheeks), nell (green headscarf, rust-red braid), kittering (tall black hat, white hair), gorse (bushy dark beard, loupe on forehead), sabeth (short white hair, pale eyes), brock (bald, black beard, broken nose), diva (piled dark hair with grey streaks, dramatic makeup), souffleur (thick round glasses).

**Gruppe 5 (Nordtor und Sonstige):** maskenmacher (white half mask), uhrmacherin (goggles pushed up on grey hair), turmwaechter (cotton in ears, stooped), schlachtermeister (huge, bald, kind eyes), lehrling (too-big cap), gaswerker (breathing mask at the neck, dented helmet), astronom (wild white hair, lenses on chains), miriam (dark pinned hair, high grey collar, eye brooch).

**Gruppe 6 (Spieler und Unbekannte):** player (flat cap, scarf, pale face), cultist (grey hood, face in shadow), nate (wet hair over the face, translucent), unknown_man (a dark silhouette with a question-mark-shaped highlight, no letters), unknown_woman (same as a woman's silhouette), anonymous (a blank paper mask), crowd (three tiny overlapping silhouettes), spirit (a wisp with a faint face).

Reihenfolge in jedem Sheet wie aufgelistet. Ablage: `public/sprites/ui/H_koepfe_1.png` bis `H_koepfe_6.png`, zusätzlich Einzeldateien `public/sprites/ui/heads/<id>.png`.

## 2. Zusätzliche Quellen-Symbole (16x16 und 24x24)
Ergänzt die vorhandenen Symbole in `14_06_information_source_icons.png`, im selben Stil.
```
[STYLE BLOCK]
Information source icon sheet, 10 icons in a row at 16x16, plus the same 10 at 24x24 in a second row, transparent background, 1px dark outline, matching public/sprites/ui/14_06_information_source_icons.png: a sealed letter (letter), a closed leather book (book), a diary with a clasp (diary), a photograph with a bent corner (photo), an archive folder with a string tie (archive), an ear behind a door (overheard), a carved stone inscription (inscription), a chalk symbol on a wall (chalk), a ticket or receipt (receipt), a map with a pin (map).
```
IDs in Reihenfolge: `brief, buch, tagebuch, foto, archivakte, belauscht, inschrift, kreide, beleg, karte`. Ablage: `public/sprites/ui/H_quellen.png`, Einzeldateien `public/sprites/ui/sources/<id>.png` (16x16) und `public/sprites/ui/sources/24/<id>.png`.

## 3. Journal-Rahmen für Quellen
```
[STYLE BLOCK]
Journal UI sheet, transparent background: 1) a small instant-photo-style frame 32x36 with a white border, pinned by a brass tack, slightly tilted, center transparent for a 24x24 head icon; 2) the same frame torn at one corner (source turned out unreliable); 3) a paper-clip frame 32x32 for document icons; 4) a red string connector piece 16x16 (straight, corner, end with a pin) to link a source to an entry; 5) a "same source twice" stamp 16x16 (two overlapping pins); 6) a "contradicts" marker 16x16 (two crossed strings).
```
Ablage: `public/sprites/ui/H_journal_rahmen.png`.

## 4. Gefährliche Fundstücke (Icons)

Im Spiel jetzt eingebaut: zwei neue Fundstücke plus vier vorhandene Gegenstände, die untersuchbar werden. Nur die zwei neuen brauchen ein Icon.
```
[STYLE BLOCK]
Two item icons side by side at 16x16, plus the same two at 32x32 in a second row, transparent background, 1px dark outline, a faint unsettling glow: 1) a hymn book of a hospital choir bound in dark leather, a pale mist seeping out between the pages; 2) a jagged shard of mirror glass with a rim of frost, reflecting a faint face that is not yours.
```
IDs: `verlorenes_gesangbuch`, `spiegelscherbe`. Einzeldateien `public/sprites/items/<id>.png` und `public/sprites/items/32/<id>.png`.

**Reserve** (noch nicht im Spiel, erst später erzeugen):
| ID | Beschreibung |
|---|---|
| `sternatlas` | a large star atlas bound in midnight-blue leather, star-glass dust glittering on the cover |
| `fenwicks_sektionsbuch` | a doctor's dissection notebook with a stained cloth cover and a scalpel tucked in the binding |
| `kinderpuppe` | an old porcelain doll in a grey choir robe, one eye missing |
| `versiegelter_brief` | a letter sealed with black wax and the eye-in-a-circle sigil, slightly warm |
| `logbuch_kanal` | a water-damaged canal lock-keeper's logbook tied with tarred string |
| `chorpartitur` | a rolled choir score tied with a red ribbon, the notes seem to move |

## 5. Nahansichten beim Untersuchen (160x120)
Ein Bild pro untersuchbarem Gegenstand, das im Untersuchen-Fenster erscheint.
```
[STYLE BLOCK]
Close-up inspection illustration in pixel art, 160x120 px, not transparent: [NAHANSICHT], lying on a dark worn table under a single lamp, seen from above, rich detail, muted palette, no readable text (writing only as wavy lines and abstract symbols).
```
| Datei (`public/sprites/ui/inspect/`) | `[NAHANSICHT]` |
|---|---|
| `verlorenes_gesangbuch.png` | the hospital choir hymn book opened, pale mist rising from the pages, one page covered with a repeating eye symbol, a pressed white lily |
| `spiegelscherbe.png` | the jagged frost-rimmed mirror shard on velvet, reflecting a dark corridor and a figure in grey that is not in the room |
| `glocke.png` | the small soot-blackened St. Ebba hand bell on its side, the crack in the rim glowing faintly, an eye-in-a-circle mark scratched inside |
| `stimmphiole.png` | a star-glass phial with a captured voice swirling as soft light inside, tiny sound rings on the glass surface |
| `sternsplitter.png` | a jagged splinter of dark star-glass holding a pinpoint of starlight, frost forming around it on the table |
| `taschenuhr.png` | the engraved silver pocket watch open, hands stopped, a tiny folded paper hidden behind the inner lid |

Dazu für jede Nahansicht eine **„verfluchte“ Variante** (gleiche Szene, aber die Schatten wachsen, Ränder färben sich violett, das Objekt glüht stärker), Dateiname `<id>_fluch.png`.

## 6. Risiko- und Bonus-Effekte
```
[STYLE BLOCK]
Full-screen effect overlays, 480x270 px per frame, transparent background except for the effect, crisp pixels, no blur:
1) "unrest" (Unruhe): a slow pulsing violet vignette with faint whispering ink-lines creeping from the edges, 6 frames;
2) "curse" (Fluch): turquoise sigils flaring briefly in the corners and cracks of dark violet spreading, 6 frames;
3) "ambush" (Hinterhalt): the screen jolts with dark claw-shaped shadows sweeping in from one side, 4 frames;
4) "bonus clue" (Bonus-Hinweis): warm amber light rays spreading from the center with floating dust motes, 6 frames.
```
```
[STYLE BLOCK]
Small UI icons for inspection outcomes, 16x16 each, transparent background, 1px dark outline: unrest (a trembling hand), curse (a black seal cracking with turquoise light), ambush (a shadowy claw), bonus clue (a magnifying glass with an amber spark), safe (a closed book with a brass clasp), risk level pips (8x8: low grey, medium amber, high violet).
```
```
[STYLE BLOCK]
Overworld sprite sheet for the player investigator (long dark grey coat, flat cap, scarf, satchel) inspecting a found object, facing down, 16x32 px per frame, transparent background, matching 03_01_investigator_walk.png: row 1 opening a book and reading (6 frames), row 2 flinching back as something happens (4 frames), row 3 clutching the head with a faint violet aura (4 frames), row 4 smiling and making a note (4 frames).
```
Ablage: `public/sprites/fx/H_06_risiko.png` (vier Reihen), `public/sprites/ui/H_06_risiko_icons.png`, `public/sprites/characters/H_player_untersuchen.png`.

## 7. Rückgabe im Revier
```
[STYLE BLOCK]
Prop sheet for a police lost-and-found, 16px grid, transparent background: a lost-property counter with a hatch and a bell (32x32), shelves of labelled boxes and parcels (32x32, labels as blank tags), an evidence bag with a tag (16x16), a sealed cursed-object box with chains and a turquoise warning sigil (16x16), a receipt book (16x16), a returned-item tag on a string (16x16).
```
Ablage: `public/sprites/props/H_07_fundbuero.png`.
