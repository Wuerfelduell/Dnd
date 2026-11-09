# Pixel-Art-Prompts für das 2D-Mystery-Spiel (Phaser 3, Browser)

Stil: Top-down-Pixel-Art im Stil von Farm-/Life-Sims (gemütliche Lesbarkeit, klare Silhouetten), aber düster: gedeckte Farben, Nebel, Gaslaternen, viktorianisch-okkulte Großstadt. Eigene Welt, keine Figuren oder Namen aus bestehenden Werken.

**Stand:** Die Abschnitte 2 bis 8 (Tilesets, Spieler, 12 NPCs, Props, Portraits, UI, Lichtmasken) sind schon erzeugt und deshalb hier entfernt. Die vollständige Fassung liegt in `prompts_komplett.md`. Aus den Abschnitten 11 bis 14 ist das meiste ebenfalls fertig; übrig sind nur die Reste weiter unten. **Reihenfolge: zuerst 14b (Kampf und Items), dann 18 (Fall 3), dann 19 (Altmarkt, Taverne, neue Figuren), dann die Reste aus 12 bis 14, danach 15 bis 17.**

## So benutzt du die Datei

1. **Immer zuerst den Style-Block (Abschnitt 1) einfügen**, dann den Asset-Prompt darunter. So bleiben alle Bilder konsistent.
2. Die Prompts sind auf Englisch, weil Bildmodelle damit zuverlässiger arbeiten. Die Erklärungen sind auf Deutsch.
3. Platzhalter in `[eckigen Klammern]` ersetzt du nach Bedarf.
4. Generiere lieber **ein Asset bzw. ein kleines Sheet pro Prompt** statt alles auf einmal. Große Sheets werden von Bildmodellen oft unsauber (falsches Raster, verschwommene Pixel).
5. Nachbearbeitung fast immer nötig: siehe Abschnitt „Nachbearbeitung“ am Ende (Aseprite/LibreSprite, auf echtes Raster runterskalieren, Palette erzwingen).

## Technische Festlegungen (mit dem Prototyp abgestimmt)

| Was | Größe |
|---|---|
| Tile | 16x16 px |
| Figur (Spieler/NPC) | 16x32 px pro Frame (Kopf ragt ins Tile darüber) |
| Lauf-Sheet | 4 Richtungen (unten, links, rechts, oben) x 4 Frames = 64x128 px |
| Props | Vielfache von 16 (16x16, 16x32, 32x32, 32x48 …) |
| Portrait | 64x64 px (optional 96x96) |
| UI | 9-slice-Rahmen auf 16er-Raster, Icons 16x16 |
| Spielauflösung | 480x270 oder 640x360, Integer-Scaling, Texture-Filter "Nearest" |
| Perspektive | Top-down mit leichter Schrägsicht (Wände/Fassaden zeigen Vorderseite, ca. 3/4) |

Falls der Prototyp auf 32x32 umstellt: im Style-Block `16x16` durch `32x32` und `16x32` durch `32x64` ersetzen.

---

## 1. Style-Block (immer voranstellen)

```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial city with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies.
Grid: strict 16x16 pixel tiles. Characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients, no dithering noise except deliberate 2-tone checker dithering on large surfaces. 1px dark outline (not pure black, use deep blue-grey #1a1c2c-ish) on characters and props; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; a single sickly teal accent (around #6fe0d0) or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light source assumed top-left. Do not bake night darkness into the sprites (the engine adds lighting); keep assets readable at mid-brightness.
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no perspective distortion, no text, no watermark, no signature, no UI frame around the image.
Avoid: 3D render look, painterly style, high-res illustration, photorealism, chibi exaggeration, anime eyes, references to existing franchises or characters.
```

**Kurzversion** (wenn das Tool wenig Text erlaubt):

```
16x16 tile top-down 3/4 pixel art, crisp pixels, no anti-aliasing, limited muted 32-color palette (slate blue, fog grey, soot brown, rust, brass, amber lamp light, rare teal occult accent), foggy Victorian occult city, dark cozy farming-sim readability, transparent background, no text.
```

---


## Vorlagen für Figuren (werden ab Abschnitt 12 gebraucht)

Lauf-Sheet, nur die Beschreibung austauschen:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [DESCRIPTION]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, grid-aligned, 1px dark outline, same proportions as a standard 16x32 human character.
```

Portrait:
```
[STYLE BLOCK]
Dialogue portrait in pixel art, 64x64 px, bust shot facing slightly to the right, of [DESCRIPTION]. Same limited muted palette, crisp pixels, 1px dark outline, simple dark slate background vignette (not transparent), expressive but restrained face, no text.
```

Emotions-Set (für dieselbe Figur, als ein Sheet):
```
[STYLE BLOCK]
Portrait sheet of the same character, 64x64 px each, 4 in a row (256x64): neutral, suspicious (narrowed eyes), shocked (wide eyes, pale), smiling faintly. Character: [DESCRIPTION]. Identical framing, lighting and palette across all four.
```

# Erweiterung 3: Fall 3 und neue Nebenaufträge

## 18. Fall 3: Kanalhafen und Lagerhaus 7 (Priorität)

Der Kanalhafen nutzt schon das Docks-Tileset (13.1) und die Fassaden aus Ashgrove. Hier fehlt vor allem das Innere von Lagerhaus 7 und eigene Sheets für die neuen Figuren.

### 18.1 Lagerhaus 7 (Innen-Tileset)
```
[STYLE BLOCK]
Interior tileset, 16x16 tiles, for an abandoned canal-side warehouse used secretly by a cult, top-down 3/4 view: rough wide wooden floorboards with gaps and oil stains (3 variations), rotten broken floorboards, brick interior walls with peeling whitewash and wall edges/corners, a large closed loading door (32x32), high grimy windows with a faint moonbeam, wooden support pillars (16x32), cobwebs, scattered straw. Arranged 8x6, seamless.
```
```
[STYLE BLOCK]
Prop sheet for a cult hideout inside a warehouse, 16px grid, transparent background: improvised altar made of crates covered with a grey cloth (32x16), clusters of black and grey candles (16x16, 3 variations), a chalk circle with an eye-in-a-circle sigil drawn across 3x3 tiles (faint teal glow), stacks of broken crates (16x32), a pile of torn hymn sheets (16x16), a row of grey hooded robes hanging on nails (32x32), a rusty chain hoist hanging from the ceiling (16x48), an overturned chair (16x16).
```

### 18.2 Neue Figuren (Lauf-Sheet 16x32 + Portrait 64x64)
Mit den Figuren-Vorlagen oben:

| Figur | `[DESCRIPTION]` |
|---|---|
| Dr. Fenwick (Polizeiarzt) | a lean middle-aged police surgeon in a black frock coat with rolled-up white shirt sleeves, rubber apron, round spectacles, neatly trimmed grey beard, leather medical bag |
| Agnes Crane | a frail elderly widow in a faded black mourning dress and shawl, white hair under a black lace cap, once a choir singer, holding an old hymn book to her chest, sad watchful eyes |
| Pip (Zeitungsjunge) | a small cheeky newspaper boy with a grey newsboy cap, oversized patched jacket, a canvas bag of newspapers on his shoulder, freckles, gap-toothed grin |
| Tobias Lowe (Hafenarbeiter) | a broad young dock worker with a dark knit cap, heavy brown wool jacket, rope coil over one shoulder, scarred hands, worried frown |
| Chorfanatiker | a cult fanatic in a long grey hooded choir robe, face half hidden, gaunt chin, a small eye-in-a-circle pendant, holding a hymn book |

### 18.3 Geist „Nate“ (nur in der Geistsicht)
```
[STYLE BLOCK]
Overworld sprite sheet for a drowned ghost: a young man in soaked working clothes, wet hair plastered to his face, water dripping, pale blue-grey skin, sad empty eyes. Translucency simulated with a checker dither pattern (no real alpha blur), faint teal outline glow. Frame size 16x32, 4 rows (down, left, right, up) x 4 frames of a slow floating idle/walk. Total 64x128, transparent background.
```
Portrait dazu (64x64): `a drowned young man's ghost with wet hair over his face, pale blue-grey skin, water drops, translucent dithered edges, faint teal glow, melancholic expression`.

### 18.4 Kampf-Sprites
Mit der Vorlage aus 17.3 (menschlich, 48x48):
- **Chorfanatiker:** `a cult fanatic in a long grey hooded choir robe, gaunt face in shadow, attacks by swinging a heavy brass censer on a chain that leaves a trail of grey smoke`
- **Constable Rook:** `a young blond constable in a navy uniform and tall helmet, cold determined face, fighting stance with a truncheon, a small violet eye-in-a-circle pin visible on his collar; when hurt his eyes flicker teal`

Mit der Vorlage aus 17.3 (übernatürlich, 64x64):
- **Aktenfresser:** `a writhing swarm of rats tangled together into one mass with shredded paper files and ink-stained scraps stuck in it; one larger rat at the front has an eye-in-a-circle sigil burned into its forehead that glows teal; attacks by surging forward and spitting paper shreds`

### 18.5 Props (16px-Raster)
```
[STYLE BLOCK]
Prop sheet, transparent background, 16px grid: a dented metal police locker with a small padlock (16x32), an empty wooden church bell frame with a broken rope, the bell missing (32x32), a boot rack with several pairs of muddy constable boots (32x16).
```

### 18.6 Item-Icons (16x16)
```
[STYLE BLOCK]
Two 16x16 item icons in a row, transparent background, 1px dark outline, 1px light rim: 1) an engraved silver pocket watch, lid open, fine engraving on the lid; 2) a small soot-blackened church hand bell from St. Ebba with a cracked rim and a faint eye-in-a-circle mark.
```

---

# Erweiterung 4: Altmarkt und Taverne „Zum Ertrunkenen Mond“

## 19. Altmarkt, Taverne und neue Figuren

### 19.1 Altmarkt-Tileset
```
[STYLE BLOCK]
Tileset of 16x16 tiles for an old market square in a foggy Victorian city at night: worn cobblestone square (3 variations) with a circular paving pattern around the center, a stone fountain with a weathered round basin and dark water (48x48, built from tiles, plus 4 frames of a small water-ripple animation), market stalls with striped canvas awnings in faded red, ochre and slate blue (32x32 each, 3 color variations, one closed with a tarp), empty crates and baskets of vegetables, a chapel facade segment in grey stone with a pointed arch door, a small rose window and soot streaks (48x48, built from tiles). Arranged on a grid, seamless ground tiles.
```

### 19.2 Taverne „Zum Ertrunkenen Mond“ (Innen)
```
[STYLE BLOCK]
Interior tileset and props for a smoky dockside tavern, top-down 3/4 view, 16px grid: dark sticky wooden floorboards (3 variations), wood-paneled walls with a few hanging lanterns, wall edges and corners, a long bar counter with taps and bottles behind it (built from 16x16 pieces, straight, corner, end), round tables with stools (32x32), a corner booth with a bench (32x32), stacked barrels (16x32) and a single barrel on its side (16x16), a fireplace (32x32), a tavern sign shape on the wall showing a pale moon sinking into waves (32x16, no text), mugs and a dice cup on a table (16x16), a staircase going up (16x32). Warm amber light from lanterns and fire, muted browns.
```

### 19.3 Prop: Spiegel mit Goldrahmen
```
[STYLE BLOCK]
Prop sprite, transparent background: a tall standing mirror with an ornate tarnished gold frame, dark reflective glass with a faint cold sheen, 16x32 px. Second variant next to it: the same mirror with a faint teal shimmer and a barely visible silhouette in the glass (supernatural state).
```

### 19.4 Neue Figuren (Lauf-Sheets 64x128, plus Portraits 64x64)
Mit den Figuren-Vorlagen oben:

| Figur | `[DESCRIPTION]` |
|---|---|
| Maud (Wirtin) | a sturdy broad-shouldered tavern keeper woman with curly red hair tied back, rolled sleeves, stained white apron over a brown dress, strong arms, a rag over her shoulder |
| Silas (Falschspieler) | an elegant card sharp in a fitted dark green waistcoat and long coat, a silk neckerchief in wine red, slicked black hair, thin moustache, a playing card between his fingers |
| Der blinde Ned (Bettler) | an old blind beggar in layered grey rags, a cloth tied over his eyes, both hands wrapped in dirty bandages, leaning on a crooked stick |
| Mr. Quill (Antiquar) | a gaunt tall antique dealer with a jeweller's loupe screwed into one eye, threadbare velvet waistcoat, sleeve garters, long ink-stained fingers |
| Pater Ambrose (Priester) | a middle-aged priest in a black cassock covered with pale candle-wax drips, white collar, short grey hair, tired kind eyes, holding a candle |
| Wick (Lampenanzünder) | an old lamplighter in a weathered dark blue coat and cap, white stubble, carrying a long brass lamplighter's pole with a small flame at the tip |
| Marktwart Grimes | a fat market constable in a tight navy uniform with brass buttons straining, tall helmet, red cheeks, a small notebook and pencil in hand |

---

# Erweiterung: Reste aus den Abschnitten 11 bis 14

Fertig sind laut manifest.json: Revier, Archiv, alle Lauf-Sheets außer Miss Pimm, Marlowes Portraits, Friedhof, Krypta, Fall-2-Hinweise, Sigillen, Hafen, Auktionshaus, Sanatorium, Dampf, Stadtkarte und fast die ganze Ansehen-/Quest-UI. Hier steht nur noch, was fehlt.

## 12. Figuren: Miss Pimm und fehlende Portraits

### 12.1 Lauf-Sheet (16x32) für Miss Pimm
Mit der Lauf-Sheet-Vorlage oben:

| Figur | Beschreibung |
|---|---|
| Miss Pimm (Archivarin) | a thin records clerk woman with auburn red-brown hair in a bun, olive-grey dress and cardigan, half-moon spectacles, armful of files, dust on her sleeves |

### 12.2 Portraits (64x64, Emotions-Set)
Mit der Portrait- und Emotions-Vorlage oben, für jede dieser Figuren:

| Figur | Beschreibung |
|---|---|
| Miss Pimm (Archivarin) | a thin records clerk woman with auburn red-brown hair in a bun, olive-grey dress and cardigan, half-moon spectacles, armful of files, dust on her sleeves |
| Sergeant Holt (Wachhabender) | a heavyset desk sergeant in a police-blue uniform with rolled sleeves, ink-stained fingers, reading glasses on a cord, grey moustache |
| Constable Rook | a young blond constable in a navy uniform and tall helmet, friendly open face, polite smile that does not reach his eyes; one small hidden detail: a tiny violet eye-in-a-circle pin under his collar (he is secretly a cultist, keep it subtle) |
| Barnaby (Häftling) | a ragged grey-haired old prisoner in a torn shirt and braces, unshaven, hunched, wrists in iron cuffs, knowing grin |
| Kit (Straßenjunge, später Spitzel) | a scrappy street kid in a far too large brown coat with rolled-up sleeves, flat cap pulled low, dirty cheeks, bright clever eyes, bare ankles and worn boots |
| Constable Price | a broad, weary night constable in a dark navy uniform with brass buttons and a tall helmet, ruddy cheeks, bullseye lantern at the belt |
| Greta | a sharp-eyed flower seller woman in a patched shawl and long skirt, basket of wilted flowers, hair tied in a scarf |
| Mr. Halloway | a thin pawnbroker in a worn velvet waistcoat, sleeve garters, pince-nez, slicked-back thinning hair, nervous smile |
| Elias Thorne | an elderly grey-haired lamplighter in a patched grey-brown coat, grey beard, frightened expression, holding his hands close to his chest (variant for case 1: frost on shoulders and beard; after case 1 he hangs around the police station) |
| Ivy Marsh | a determined teenage girl with strawberry-blonde hair in a loose braid, blue-grey wool coat, scuffed boots, worried but stubborn face |
| Hester Marsh | Ivy's older sister in a white nightgown, bare feet, long loose strawberry-blonde hair, blank entranced stare, eyes faintly glowing teal; walk animation should look slow and sleepwalking |
| Küster Anselm (Sexton) | an old frail church sexton in a black cassock, wild white hair, hunched, holding a ring of keys and a candle |
| Moll (Totengräber) | a coarse broad gravedigger with an earth-brown coat, muddy boots, rough stubble, carrying a spade with a notch in the blade |
| Miriam Vey (Gegenspielerin) | an elegant choir director woman in a long grey coat with a high collar, dark hair tightly pinned, calm cold smile, holding a folder of sheet music; a small eye-in-a-circle brooch at her throat |

**Polizei-Emotionen** (zusätzlich, für Holt, Pimm, Rook und Price): `neutral, skeptical (one raised eyebrow), approving (slight nod and smile), angry (furrowed brow)`, zeigt dem Spieler, wie das Ansehen gerade steht.

**Miriam Vey** (zusätzliches Emotions-Set): `serene, amused, cold contempt, eyes glowing faint teal`.

## 13.4 Bahnhof (Dampf-Animation ist fertig)
```
[STYLE BLOCK]
Tileset of 16x16 tiles for a soot-blackened Victorian railway station platform at night: stone platform edge, rail tracks with sleepers (horizontal and vertical, curve), iron pillars supporting a glass roof (16x48), wooden benches, a ticket booth (32x32), luggage trolleys with trunks, a large station clock on a post (16x48).
```

## 14.4 Wahrscheinlichkeit im Log (Stempel-Animation ist fertig)
Eine Info ist erst "sehr wahrscheinlich", wenn sie aus mindestens zwei Quellen stammt; davor ist sie nur Vermutung.
```
[STYLE BLOCK]
UI marker sheet for clue certainty in an investigation journal, each 16x16 px, in a row, transparent background:
1) "suspicion": a faint pencil-drawn question mark with a dashed outline, grey graphite color,
2) "very likely": a bold inked check mark inside a round rubber-stamp circle, deep navy ink,
3) "contradicted / false": a red-brown ink cross over a torn paper corner,
4) "unverified police information": a small police badge with a question mark,
5) source counter pips: three versions showing 0, 1 and 2 filled ink dots (2 of 2 = confirmed).
Style like hand-made marks on old paper.
```
```
[STYLE BLOCK]
Two journal entry background strips for the clue log, 160x24 px each, transparent background: 1) "suspicion" entry: thin pencil sketch lines, slightly faded and wobbly edges, a paperclip; 2) "very likely" entry: crisp ruled paper slip pinned with a brass tack, with a red-ink "approved" stamp shape in the corner (no readable text).
```

---

# Erweiterung 2: Inventar, Leben und Rundenkampf

Prompts für Inventar, Lebensanzeige und ein kleines Rundenkampf-System mit Timing (Ausweichen, Parieren, Angriffe im Takt). Alles eigene Designs. Wie immer **Style-Block aus Abschnitt 1 voranstellen**.

**Kampf-Festlegungen (Annahme, mit dem Prototyp abgestimmt):**

| Was | Größe |
|---|---|
| Kampfansicht | Seitenansicht, Spieler links, Gegner rechts, Bildschirm 480x270 |
| Kampf-Figuren (Spieler, menschliche Gegner) | 48x48 px pro Frame (größer als auf der Karte, damit Animationen lesbar sind) |
| Große Gegner / Boss | 64x64 oder 96x96 px pro Frame |
| Effekte | 32x32 oder 48x48 px pro Frame, 4 bis 6 Frames |
| Item-Icons | 16x16 px (Inventar), optional 32x32 für Detailansicht |

Für die Sheets gilt: Frames in einer Reihe, gleich groß, Figur steht auf derselben Grundlinie, transparenter Hintergrund.

## 14b. Erste Version: das braucht der Prototyp zuerst

Diese Assets sind im Spiel schon als Platzhalter vorgesehen, also am besten zuerst erzeugen. Die Item-IDs stammen aus dem Code; die Dateinamen für Kampf-Figuren und Hintergründe sind Vorschläge.

**Kampf (Prompts in Abschnitt 17):**

| Dateiname (Vorschlag) | Was | Größe | Prompt |
|---|---|---|---|
| `battle_player` | Spieler im Kampf | 48x48 | 17.2 |
| `enemy_holt` | Sergeant Holt, Übungskampf im Revier | 48x48 | 17.3 menschlich, Beschreibung unten |
| `enemy_nebelhund` | Nebelhund am Kanal in Ashgrove | 64x64 | 17.3 übernatürlich, Tabelle |
| `enemy_aschewaechter` | Aschewächter in der Krypta | 64x64 | 17.3 übernatürlich, Tabelle |
| `bg_revier`, `bg_ashgrove`, `bg_krypta` | Kampf-Hintergründe | 480x270 | 17.1 |

Beschreibung für Sergeant Holt im Übungskampf: `a heavyset desk sergeant in a police-blue uniform with rolled sleeves and a grey moustache, sparring stance with a padded wooden practice truncheon, good-natured but serious; defeated pose is him laughing and raising a hand to yield, not collapsing`. Als Hintergrund für den Revier-Kampf bei 17.1 als `[LOCATION]`: `a police station training room with a worn wooden floor, a rack of truncheons, a punching bag and a barred window`.

**Gegenstände (16x16, ein Icon pro Datei):**
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 7 icons in a row (112x16), transparent background, 1px dark outline, each centered:
1) plain oak walking cane with a rounded brass knob,
2) black police service truncheon with a leather wrist strap,
3) silver-plated cane sword, blade partly drawn from the dark cane, faint shine,
4) rolled linen bandage,
5) small brown tonic bottle with a cork and a cream label (a pharmacist's tonic),
6) small round tin of smelling salts with the lid open and pale crystals,
7) small cloth pouch of white warding salt with a faint teal sparkle.
```
| Nr. | ID | Name im Spiel | Typ |
|---|---|---|---|
| 1 | `spazierstock` | Eichenstock | Waffe |
| 2 | `schlagstock` | Dienstschlagstock | Waffe |
| 3 | `stockdegen` | Versilberter Stockdegen | Waffe |
| 4 | `verband` | Verband | Verbrauch |
| 5 | `tonikum` | Fenwicks Tonikum | Verbrauch |
| 6 | `riechsalz` | Riechsalz | Verbrauch |
| 7 | `bannsalz` | Bannsalz | Verbrauch |

Ausrüstung: Vorerst gibt es nur einen Slot (Waffe). Mantel, Hut und Amulett in 15.4 sind für später.

## 15. Inventar und Gegenstände

### 15.1 Heil- und Verbrauchsgegenstände (16x16)
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 8x2 grid, transparent background, 1px dark outline, each icon centered: small brown tonic bottle with a red label (heals), large tonic bottle, rolled linen bandage, smelling salts tin (restores nerves), calming herbal tea tin, flask of lantern oil, matchbox, sugar cubes in paper, laudanum-style dark vial with a skull-free warning label shape (risky healing), blessed candle stub, small vial of glowing teal ward-water, salt pouch, iron nails bundle, silver coin, sandwich wrapped in paper, pocket flask.
```

### 15.2 Waffen und Ausrüstung (16x16)
```
[STYLE BLOCK]
Equipment icon sheet, 16x16 px per icon, 8x2 grid, transparent background, 1px dark outline: walking cane with a brass knob, cane sword partly drawn, police truncheon, small six-shot revolver, box of silver bullets, hunting knife, brass knuckles, iron crowbar, oil lantern, bullseye police lantern, long dark coat (armor), leather gloves, bowler hat, protective amulet with a teal stone, pocket mirror (reflects curses), rosary-like string of plain beads (no religious symbols).
```

### 15.3 Fall-Gegenstände und Schlüssel (16x16)
```
[STYLE BLOCK]
Key item icon sheet, 16x16 px per icon, in a row, transparent background, 1px light rim so they stand out: brass door key, iron crypt key, small music-box key, ring of keys, police badge, folded city map, sealed letter, train ticket, pocket watch, photograph, notebook, archive pass card.
```

### 15.4 Inventar-Oberfläche
```
[STYLE BLOCK]
Pixel art inventory screen background, 480x270 px, not transparent: an open worn leather satchel seen from above, left side a 6x4 grid of empty item slots (each 20x20 px, slightly recessed, dark leather with stitched borders), right side an empty parchment panel for item details, a strip at the bottom with 4 equipment slots (weapon, coat, hat, charm) shown as faint outlined silhouettes. Muted browns, brass rivets, no text.
```
```
[STYLE BLOCK]
UI sprite sheet for inventory slots, transparent background: an empty slot 20x20 px, the same slot highlighted with a warm amber border, selected with a brighter amber border and corner ticks, disabled/greyed slot, and a small item-count badge (8x8 dark circle) for stacks.
```
```
[STYLE BLOCK]
Tooltip frame for item descriptions, designed for 9-slice, 48x48 px from 16x16 pieces: dark parchment with a thin brass border and tiny corner rivets, transparent outside. No text.
```

## 16. Leben und Status

### 16.1 Lebens- und Nervenanzeige (Karte)
```
[STYLE BLOCK]
HUD sheet, transparent background: a health bar 64x8 px with a brass frame and deep red fill, plus 5 fill states stacked vertically; a nerves bar in the same frame style with teal (#6fe0d0) fill and 5 states; a small 16x16 heart icon in 3 states (full, half, empty) styled as an anatomical-looking stitched red heart; a 16x16 brain/eye icon for nerves. Muted colors, crisp pixels.
```
```
[STYLE BLOCK]
Small 16x16 popup icons for the overworld HUD, 4 frames each in a row for a short bob animation: red plus (healed), cracked red heart (damaged), teal swirl (nerves lost), teal sparkle (nerves restored). Transparent background.
```

### 16.2 Status-Effekte (16x16)
```
[STYLE BLOCK]
Status effect icon sheet, 16x16 px each, in a row, transparent background, 1px dark outline, round badge shape: bleeding (red drop), fear (wide eye with sweat drop), burning (amber flame), frozen/chill (pale blue frost), stunned (circling stars made of small sparks), poisoned (green bubble), marked (teal eye-in-circle target), shielded (brass shield), focused (amber crosshair), weakened (broken sword).
```

## 17. Rundenkampf

### 17.1 Kampf-Hintergründe (480x270)
Für jeden Ort einen. Unten etwa 70 px freie, flache Bodenfläche lassen, auf der die Figuren stehen.
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [LOCATION]. Layered for depth (far silhouettes, mid buildings, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the middle area. Fog layers, gas lamp glow, muted palette. No characters, no text.
```
Werte für `[LOCATION]`:
- `a foggy cobblestone street at night with gas lamps and a canal bridge (Ashgrove Lane)`
- `a cemetery at night with gravestones, dead trees and a burned chapel ruin (St. Ebba)`
- `an underground crypt with burial niches, many candles and a faintly glowing teal ritual circle on the floor`
- `a back alley behind the police station with crates, puddles and a barred window`
- `the docks at night with stacked crates, a crane and dark water`

### 17.2 Spieler im Kampf (48x48)
```
[STYLE BLOCK]
Side-view battle sprite sheet for the player investigator (long dark grey coat, flat cap, scarf, satchel, pale face, short dark hair), facing right, 48x48 px per frame, transparent background, consistent baseline. Rows:
1) idle stance with a walking cane, 4 frames;
2) cane strike attack, 6 frames (wind-up, swing, impact, recover);
3) revolver shot, 5 frames with a small muzzle flash;
4) dodge: quick backstep with a dithered afterimage, 4 frames;
5) parry: cane raised to block with a spark on contact, 4 frames;
6) using an item (drinking a tonic), 4 frames;
7) hurt recoil, 3 frames;
8) knocked down, 4 frames;
9) occult skill: hand raised, teal light swirling, 6 frames.
Sheet width 288 px (6 frames), rows padded with empty frames where shorter.
```

### 17.3 Gegner (eigene Designs)
Vorlage für menschliche Gegner (48x48):
```
[STYLE BLOCK]
Side-view battle sprite sheet for an enemy: [DESCRIPTION], facing left, 48x48 px per frame, transparent background, consistent baseline. Rows: idle (4 frames), attack with a clear readable wind-up pose before the hit (6 frames, the wind-up must be held for 2 frames so the player can time a dodge or parry), hurt (3 frames), defeated (4 frames). Sheet width 288 px.
```
| Gegner | `[DESCRIPTION]` |
|---|---|
| Kultist | a hooded cultist in a long charcoal robe with a faint violet eye-in-a-circle sigil, wielding a ritual dagger |
| Kult-Fanatiker | a gaunt fanatic in a torn grey choir robe, holding a burning hymn book that shoots small teal flames |
| Schläger | a burly street thug in a flat cap and rolled sleeves, swinging a short iron pipe |
| Besessener Constable | a constable in a navy uniform whose eyes glow teal, moving stiffly like a puppet, swinging a truncheon |
| Grabräuber | a hunched grave robber in muddy rags with a lantern and a shovel |

Vorlage für übernatürliche Gegner (64x64):
```
[STYLE BLOCK]
Side-view battle sprite sheet for a supernatural enemy: [DESCRIPTION], facing left, 64x64 px per frame, transparent background. Rows: idle floating or breathing loop (4 frames), attack with a clearly telegraphed wind-up (6 frames), special attack (6 frames), hurt (3 frames), dissolving defeat (6 frames). Use dithering for transparency, no blur. Teal is the only bright color.
```
| Gegner | `[DESCRIPTION]` |
|---|---|
| Nebelgeist | a wraith made of drifting fog with long thin arms and two teal points for eyes |
| Aschewächter (Krypta) | a tall figure made of grey ash wearing a scorched choir robe, embers glowing in its cracks; instead of a face a glowing teal eye inside a circle |
| Nebelhund (Ashgrove, Kanal) | a gaunt supernatural hound that rises out of the canal fog, body half made of drifting mist, dark wet fur at the core, two glowing teal (#6fe0d0) eyes like the eye-in-a-circle seal |
| Spieluhr-Puppe | a life-sized jointed wooden doll in a red lacquered dress with a wind-up key in its back, moving in jerky clockwork steps |
| Chorschatten | three faceless floating choir silhouettes in grey robes singing, sound waves drawn as teal rings |

**Boss (96x96):**
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, transparent background: a tall elegant choir director woman in a long grey high-collared coat, surrounded by floating sheets of music and an eye-in-a-circle halo of teal light; her shadow stretches into a large eye shape. Rows: idle (4 frames), conducting attack that sends sheets of music flying (6 frames), scream attack with teal sound rings (6 frames), phase-2 transformation where the halo grows and her eyes glow (6 frames), hurt (3 frames), defeat collapsing into falling paper (6 frames).
```

### 17.4 Kampf-Oberfläche
```
[STYLE BLOCK]
Battle command menu UI, transparent background: a vertical panel 96x80 px with dark parchment and brass frame, four empty rows for commands, plus 16x16 command icons in a row: attack (cane), shoot (revolver), occult skill (teal eye), item (satchel), defend (shield), flee (running boot). A small amber pointer arrow (8x8, 2 frames) for the selected row. No text.
```
```
[STYLE BLOCK]
Turn order timeline UI for the top of the battle screen, transparent background: a horizontal brass rail 200x20 px with 6 empty round portrait sockets (16x16 each), one socket highlighted in amber for the active turn, and a small down-pointing marker. Also 16x16 round mini portraits: player investigator, Sergeant Holt, fog hound, ash warden in a choir robe with an eye-in-circle face, cultist, wind-up doll.
```
```
[STYLE BLOCK]
Battle HUD sheet, transparent background: compact HP bar 48x6 with brass frame and red fill (5 states), nerves bar 48x6 with teal fill (5 states), action point pips (8x8: empty, full amber, full glowing), an enemy HP bar 48x4 in dark red with a skull-free simple frame, a target cursor (16x16, 4-frame pulsing amber bracket) to place over enemies.
```

### 17.5 Timing-Prompts (Ausweichen, Parieren, Angriffe im Takt)
Optional: Im Prototyp werden der schrumpfende Ring und die Angriffsleiste im Code gezeichnet. Diese Prompts nur nehmen, falls sie später durch Grafiken ersetzt werden sollen.
```
[STYLE BLOCK]
Timing input indicator sheet for a turn-based battle with real-time reactions, transparent background:
1) a shrinking ring prompt: 32x32 px, 8 frames of an amber ring closing in on a small center circle;
2) the same ring flashing white-gold on a perfect hit (3 frames);
3) a "parry" result icon: crossed cane and spark, 24x24, 4-frame burst;
4) a "dodge" result icon: boot with motion lines, 24x24, 4-frame burst;
5) a "miss" icon: cracked grey ring, 24x24, 3 frames;
6) key prompt buttons 16x16 in a parchment style for keyboard keys (blank keycap, so the game can draw the letter), normal and pressed.
No text.
```
```
[STYLE BLOCK]
Rhythm attack bar UI, transparent background: a horizontal track 160x16 px with brass ends, 3 to 5 beat markers (amber diamonds 8x8, normal and hit states), and a moving needle (4x16). Used for timed attack combos.
```

### 17.6 Treffer-Effekte
```
[STYLE BLOCK]
Battle hit effect animation strips, each frame 32x32 px, frames in a row, transparent background, crisp pixels, no blur:
1) cane strike impact: white-amber burst, 5 frames;
2) slash: thin curved white streak, 4 frames;
3) gunshot hit: small sparks and smoke puff, 5 frames;
4) parry clash: bright gold-white star spark, 4 frames;
5) occult blast: teal ring expanding with eye shape in the center, 6 frames;
6) fire: amber flames rising, 6 frames;
7) heal: soft red plus symbols floating up, 5 frames;
8) nerves damage: teal static/glitch pixels around the head area, 5 frames;
9) critical hit: large white-gold starburst, 48x48, 5 frames.
```
```
[STYLE BLOCK]
Pixel font sheet for floating battle numbers, transparent background: digits 0-9, plus and minus signs, each glyph 8x10 px, chunky outlined style, in 4 color variants as separate rows: white (normal damage), amber (critical), red (damage to player), teal (nerves). Every glyph aligned on an 8x10 grid.
```

### 17.7 Kampf-Übergänge
```
[STYLE BLOCK]
Battle start transition, 480x270 px per frame, 6 frames in a row: dark fog and ink tendrils closing in from the edges until the screen is black, with a faint teal eye shape briefly visible in the center on frame 5. Transparent where not covered.
```
```
[STYLE BLOCK]
Victory and defeat banners, transparent background: a victory banner 160x32 px as a brass plaque with laurel ends and empty center for text, and a defeat banner in cracked dark iron with a faint red tint, same size. No text.
```

---

## 9. Nachbearbeitung (wichtig)

Bildmodelle liefern meist **keine echte Pixel-Art**, sondern große Bilder, die nur so aussehen. So machst du sie spielfertig:

1. **Runterskalieren auf echte Größe**: in Aseprite/LibreSprite oder GIMP mit "Nearest Neighbor" auf das Zielraster (z. B. 1024 px Bild mit 8x8 Tiles → 128 px).
2. **Palette erzwingen**: eine feste Palette laden (z. B. eine 32-Farben-Palette, die du einmal festlegst) und das Bild darauf indizieren. So passen alle Assets zusammen.
3. **Raster prüfen**: Grid 16x16 einblenden, schiefe Pixel von Hand korrigieren, Hintergrund transparent machen.
4. **In Phaser 3**: im Game-Config `pixelArt: true` setzen (Nearest-Filter, kein Glätten), Sprite-Sheets mit `this.load.spritesheet(key, url, { frameWidth: 16, frameHeight: 32 })` laden, Tilesets mit 16x16 in Tiled bauen und als Tilemap-JSON laden.
5. **Konsistenz**: gute Ergebnisse als Referenzbild beim nächsten Prompt mitgeben ("match the style, palette and proportions of the attached reference").

## 10. Referenz-Trick für Konsistenz

Sobald du **einen** Spieler-Sprite und **ein** Straßen-Tileset hast, die dir gefallen, hänge sie bei allen weiteren Prompts als Referenz an und ergänze:

```
Use the attached image as the strict style reference: same palette, same outline color, same pixel density, same character proportions and same lighting direction.
```

---
