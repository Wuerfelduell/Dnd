# Codex-Batch E: Fall 4 „Die gestohlenen Stimmen“, Aufträge und Fallakten

**Batch-Name:** `faelle` (Manifest: `public/sprites/manifest-faelle.json`)

Fall 4 **„Die gestohlenen Stimmen“** (`case_04`): Die Diva des Lumen-Theaters verliert ihre Stimme, und die Turmuhr bleibt auf 3:33 stehen. Die Polizei verdächtigt den stummen Maskenmacher (falsche Fährte). Der Täter ist der Souffleur **Felix Dunmore**, früher Chorknabe bei Miriam Vey: Er fängt Stimmen in Sternglas-Phiolen und schafft sie durch die Gaskanäle zum Uhrturm. Finale ist ein Kampf gegen Felix im Uhrturm; danach erklingt Veys Stimme aus der Glocke (Haken für Fall 5). Dazu kommen viele neue Nebenaufträge.

Schon fertig: Innen-Tilesets für Theater, Uhrturm, Schlachthof, Gaskanäle, Sternwarte (`C_09_*.png`) und Lauf-Sheets/Portraits von Diva, Souffleur, Maskenmacher, Uhrmacherin, Turmwächter, Schlachtermeister, Lehrling, Gaswerker und Astronom (`C_*`). Die Außenbereiche (Nordtor usw.) stehen in Batch D, die Kämpfe in Batch F.

**Reihenfolge:** 1 (Fall 4) → 2 (Auftragsfiguren) → 3 (Auftrags-Gegenstände) → 4 bis 7.

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

## 1. Fall 4: „Die gestohlenen Stimmen“

### 1.1 Theater: Bühne und Garderobe der Diva
```
[STYLE BLOCK]
Prop sheet for the Lumen Theatre stage and the diva's dressing room, top-down 3/4 view, 16px grid, transparent background: a grand stage set of a painted moonlit garden (flat painted backdrop pieces, 48x32), a prop throne (16x32), a prompter's box sunk into the stage front with a small hood (32x16), the diva's dressing table with a bulb-framed mirror, powder, perfume bottles and a vase of wilting white lilies (32x32), a velvet chaise longue (32x16), a wardrobe of stage gowns (32x32), a gramophone (16x32), a stack of fan letters tied with ribbon (16x16), an empty sternglass phial left behind on the dressing table (16x16, dark glass with a faint twinkle).
```
Ablage: `public/sprites/props/E_01_theater_buehne.png`.

### 1.2 Felix' Versteck im Uhrturm
```
[STYLE BLOCK]
Props for a secret workshop hidden inside a clock tower, 16px grid, transparent background: a shelf of dozens of small sternglass phials, each holding a tiny swirling light in a different soft color (32x32, plus a 4-frame shimmer), a workbench with funnels, tuning forks and a brass ear trumpet connected to glass tubes (32x32), a gas pipe coming up through the floor from the tunnels with a valve (16x32), a cot with a choirboy's old grey robe folded on it (16x32), a wall covered with pinned pages of sheet music and a faded photograph of a children's choir (32x32, faces as shapes only), the stopped clock mechanism with a large brass hand frozen in place (32x32).
```
```
[STYLE BLOCK]
Animation strips, transparent background: 1) a voice being drawn out of a singer's mouth as a thin ribbon of light into a phial, 32x32 per frame, 8 frames; 2) a sternglass phial shattering and the trapped voice escaping as a swirl of light and sound rings, 32x32, 8 frames; 3) the great bell in the tower humming with a faint turquoise shimmer and a ghostly woman's silhouette in the sound rings (Miriam's voice), 48x48, 8 frames.
```
Ablage: `public/sprites/props/E_01_felix_versteck.png`, `public/sprites/fx/E_01_stimme_raub.png`, `E_01_phiole_bricht.png`, `E_01_glocke_stimme.png`.

### 1.3 Die Turmuhr auf 3:33
```
[STYLE BLOCK]
The large clock face of a city clock tower seen from outside, 48x48 px, transparent background: a pale enamel face with abstract tick marks (no numerals), ornate black iron hands stopped at three thirty-three (hour hand just past three, minute hand at about thirty-three minutes), cracks of frost on the glass; plus a second version with faint turquoise light glowing from behind the face.
```
Ablage: `public/sprites/props/E_01_turmuhr.png`.

### 1.4 Hinweis-Objekte Fall 4 (16x16)
```
[STYLE BLOCK]
Clue object sheet, 16x16 each, in a row, transparent background, 1px light rim: a sternglass phial holding a captured voice (dark star-glass with a swirling soft light inside), a prompter's script with pencil marks and a pressed lily, a plain white porcelain half mask with a crack, a police report folder with a red string, a hand-drawn map of gas tunnels, an old photograph of a children's choir with one face circled, a brass tuning fork, a lump of soot from a gas pipe, a stage ticket stub, a clock key, a tuft of cotton wool, a tiny funnel of brass.
```
Reihenfolge/IDs: `stimmphiole, soufflierbuch, halbmaske, polizeibericht, tunnelkarte, chorfoto, stimmgabel, russ, eintrittskarte, uhrschluessel, watte, trichter`. Die `stimmphiole` gibt es zusätzlich als Item-Icon `public/sprites/items/stimmphiole.png` (16x16) und `public/sprites/items/32/stimmphiole.png` (32x32).

Ablage: `public/sprites/props/E_01_fall4_hinweise.png`.

### 1.5 Zusatz-Portraits für Fall 4
Mit der Portrait-Vorlage aus Abschnitt 2, aber mit diesen Emotionen:
- `diva` (Madame Odile Varenne): `trying to sing with no sound, hand at her throat in panic, tearful, radiant with her voice restored`, Ablage `E_diva_stimme.png`.
- `souffleur` (Felix Dunmore): `timid and helpful, caught off guard, feverish devotion with turquoise-lit eyes, broken and weeping like a child`, Ablage `E_souffleur_enthuellung.png`.
- `maskenmacher` (Jonas Pell): `mask on, mask lifted showing a scarred kind face, offended, grateful nod`, Ablage `E_maskenmacher_maske.png`.
- `turmwaechter` (Ezra): `pulling cotton from his ears, terrified by a sound, relieved, listening intently`, Ablage `E_turmwaechter_hoeren.png`.

### 1.6 Schlussbilder (Enden)
Standbilder, deckend, 480x270, ohne Text:
```
[STYLE BLOCK]
Ending illustration in pixel art, 480x270 px, not transparent, cinematic composition: [SZENE]. Muted palette, strong mood lighting, no text.
```
| Datei | `[SZENE]` |
|---|---|
| `E_ende_fall4_gut.png` | the Lumen Theatre stage at night, the diva singing again in a single amber spotlight, the empty prompter's box in front, the clock tower visible through a high window with its hands moving again |
| `E_ende_fall4_halb.png` | the clock tower workshop with shattered phials glowing faintly on the floor, Felix gone, an open trapdoor down into the gas tunnels |
| `E_ende_fall4_schlecht.png` | the theatre audience seated in silence with open mouths and no sound, turquoise light seeping from the clock tower over the rooftops |
| `E_ende_fall4_haken.png` | the great bell in the clock tower, a ghostly silhouette of a woman conductor forming in the turquoise sound rings around it (hook for the next case) |
| `E_ende_fall1.png` | the lamp at the canal bridge burning again, Elias wrapped in a blanket beside Constable Price |
| `E_ende_fall2.png` | Ivy holding her waking sister Hester among the graves of St. Ebba at dawn |
| `E_ende_fall3.png` | the warehouse door chained shut by constables, sheets of music blowing across the quay |

Ablage: `public/sprites/ui/endings/<Datei>`.

## 2. Figuren für neue Nebenaufträge

Vorlagen:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, same proportions as the existing characters.
```
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious, shocked, smiling faintly. Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
| ID | Idee für den Auftrag | `[BESCHREIBUNG]` |
|---|---|---|
| `waescherin` | Wäscherin, deren Kunden verschwinden | a red-armed laundress with rolled sleeves, a basket of linen on her hip, steam-reddened face, headscarf |
| `kaminkehrer` | Kaminkehrer, der etwas in einem Schornstein gefunden hat | a soot-covered chimney sweep with a top hat, brushes over his shoulder, white grin in a black face of soot |
| `kutscher` | Kutscher, der eine unheimliche Fahrt hatte | a hunched cab driver in a caped greatcoat and a battered bowler, a whip, red nose from the cold |
| `fotografin` | Fotografin, auf deren Bildern Geister erscheinen | a young photographer woman in a practical dark dress with a camera box on a strap, ink-stained fingers, curious eyes |
| `schwindler` | Wunderheiler mit falschen Tränken | a slick quack doctor in a loud checked suit and top hat, a case of fake potion bottles, gold tooth |
| `wahrsagerin` | Wahrsagerin vom Kanal | an old fortune teller in layered shawls with coins sewn in, rings on every finger, one milky eye |
| `matrose` | Matrose mit einer verfluchten Tätowierung | a weathered sailor in a pea coat and knit cap, a tattoo of an eye on his hand that seems to glow faintly |
| `gouvernante` | Gouvernante aus dem Villenviertel | a strict governess in a high-necked grey dress, hair in a tight bun, a small black notebook |
| `erbe` | junger Erbe, der sein Vermögen verspielt | a pale young heir in an expensive but rumpled suit, loosened cravat, dark circles under his eyes |
| `rattenfaenger` | Rattenfänger mit Terrier | a gaunt rat-catcher with a long coat full of pockets, a cage of rats, a small terrier at his feet (terrier included in each frame) |
| `marktfrau` | Fischverkäuferin am Hafen | a loud fishwife with a striped apron and a basket of fish on her head, strong arms, sly grin |
| `student` | Medizinstudent, der Leichen „besorgt“ | a nervous medical student with round glasses, a long scarf and a bag of books and instruments |
| `sufragette` | Frauenrechtlerin mit Flugblättern | a determined woman in a sash (no text) and a sensible hat, a stack of leaflets, upright posture |
| `nachtwaechter` | Nachtwächter des Gaswerks | an old night watchman with a bullseye lantern, a rattle and a thick muffler, half asleep |
| `kuenstler` | Maler, der Nebelbilder malt | a scruffy painter in a paint-stained smock and beret, a canvas under his arm |
| `kind_streuner` | Straßenkinder-Bande (Anführerin) | a tough street girl leader with a too-big military jacket, cropped hair, a slingshot, bare feet |

Ablage: `public/sprites/characters/E_<id>_walk.png`, `public/sprites/portraits/E_<id>_emotions.png`.

## 3. Auftrags-Gegenstände (16x16)

In Gruppen zu je 8 erzeugen, Atlas plus Einzeldateien `public/sprites/items/<id>.png`.
```
[STYLE BLOCK]
Item icon sheet, 16x16 px per icon, 8 icons in a row, transparent background, 1px dark outline, 1px light rim, each centered: [LISTE]
```
**Gruppe 3.1 Briefe und Papiere:** `liebesbrief` (a pink envelope with a red wax heart seal), `erpresserbrief` (a letter made of glued-on cut-out scraps, no readable letters), `testament` (a folded legal document with a ribbon and seal), `pfandschein` (a small numbered-looking ticket without digits), `zeitungsausschnitt` (a torn newspaper clipping with a photo shape), `landkarte_alt` (an old hand-drawn map with an X), `notenblatt_zerrissen` (a torn page of sheet music), `fahrkarte` (a train ticket).

**Gruppe 3.2 Fundstücke:** `ehering` (a gold wedding ring), `kinderschuh` (a small worn child's boot), `taschentuch` (a monogrammed handkerchief, monogram as a shape), `zigarrenstummel` (a cigar stub), `knopf_messing` (a brass uniform button), `haarnadel` (a decorative hairpin), `glasauge` (a glass eye), `zahnrad_klein` (a small brass gear).

**Gruppe 3.3 Beweisstücke:** `klappmesser` (a clean folding knife), `fussabdruck_gips` (a plaster cast of a footprint), `fingerabdruck_karte` (a card with an ink fingerprint), `giftflasche` (a small blue poison bottle with a cork), `fotoplatte` (a glass photographic plate with a ghostly figure), `wachszylinder` (a wax phonograph cylinder), `schluessel_rostig` (a rusty iron key), `siegelring` (a signet ring with an eye sigil).

**Gruppe 3.4 Belohnungen und Kurioses:** `medaille_polizei` (a bronze police commendation medal on a ribbon), `brosche_silber` (a silver brooch with a moonstone), `spieldose_klein` (a tiny music box), `taschenspiegel` (a hand mirror with a cracked glass), `kerze_schwarz` (a black candle), `amulett_auge` (a pendant with an eye-in-a-circle), `fuchsfell` (a fox stole), `flasche_gin` (a gin bottle).

## 4. Auftrags-Oberfläche
```
[STYLE BLOCK]
Quest UI sheet, transparent background: 1) floating markers above NPCs, 16x16, 4-frame bob each: amber exclamation seal (new quest), lilac question seal (quest turn-in), grey seal (quest in progress), turquoise eye seal (occult lead); 2) a quest accepted banner 160x32 and a quest completed banner 160x32 (blank parchment ribbons with wax seal, no text); 3) map pin icons 8x8 in amber, lilac and turquoise; 4) a reward panel 9-slice 48x48 in parchment with a brass corner clasp.
```
Ablage: `public/sprites/ui/E_04_quest_ui.png`.

## 5. Fallakten-Deckblätter
```
[STYLE BLOCK]
Case file cover illustration, 128x96 px, not transparent: a small framed pixel-art vignette on a manila case folder background for the case [FALL]: [MOTIV]. A paperclip and a wax seal in the corner. No text.
```
| Datei | `[FALL]` | `[MOTIV]` |
|---|---|---|
| `E_akte_fall1.png` | The Extinguished Lantern | a single dark gas lamp on a foggy canal bridge |
| `E_akte_fall2.png` | Ashes of St. Ebba | a burned chapel window frame with a red music box in front |
| `E_akte_fall3.png` | The Choir Sings Elsewhere | a warehouse door with sheets of music blowing out |
| `E_akte_fall4.png` | The Stolen Voices | a theatre stage with a single spotlight and a glowing star-glass phial, a clock face stopped at 3:33 in the background (no numerals) |
| `E_akte_altmarkt.png` | Old Market | a gold-framed mirror beside a frosted fountain |
| `E_akte_leer.png` | blank | an empty frame for future cases |

Ablage: `public/sprites/ui/cases/<Datei>`.

## 6. Zwischensequenz-Standbilder
Für Schlüsselmomente zwischen Dialogen, 240x135 (halbe Bildschirmgröße), deckend:
```
[STYLE BLOCK]
Cutscene still in pixel art, 240x135 px, not transparent, cinematic close framing: [SZENE]. No text.
```
1. `E_szene_turmuhr.png` – the clock tower at night with its hands frozen, fog curling around the clock face
2. `E_szene_brief.png` – a gloved hand sliding a sealed letter with an eye sigil under a door
3. `E_szene_rook.png` – Constable Rook in the shadows of the station corridor, his eyes glowing turquoise
4. `E_szene_chor.png` – rows of grey-robed singers in a dark room, mouths open, turquoise light on their faces
5. `E_szene_marlowe.png` – Inspector Marlowe at her desk at night, case files spread out, a single lamp
6. `E_szene_felix.png` – Felix in the prompter's box, his lips moving with the diva's song while a phial in his hand glows

Ablage: `public/sprites/ui/scenes/<Datei>`.

## 7. Zusätzliche Clue-Props für Orte
```
[STYLE BLOCK]
Investigation hotspot props, 16x16 each, in a row, transparent background, each with a subtle 1px light rim: scratch marks on a door frame, a smear of black wax on stone, a dropped glove, a trail of turquoise droplets, a chalk sigil half wiped away, a broken window latch, cigarette ash on a ledge, a torn piece of grey cloth caught on a nail, wheel tracks in mud, a hidden compartment in a floorboard (closed and open).
```
Ablage: `public/sprites/props/E_07_spuren.png`.
