# Codex-Batch B: Rundenkampf – Gegner, Fähigkeits-Effekte, Kampf-Oberfläche

**Batch-Name:** `kampf` (Manifest: `public/sprites/manifest-kampf.json`)

Schon fertig (Batch 14b, nicht neu machen): `battle_player.png` (Grundbewegungen mit Stock), `enemy_holt`, `enemy_nebelhund`, `enemy_aschewaechter`, `bg_revier`, `bg_ashgrove`, `bg_krypta`.

Der Kampf läuft in Seitenansicht: Spieler links, Gegner rechts. Der Spieler hat **Leben**, **Nerven** und **Konzentration** (Punkte für Fähigkeiten). Jeder der sieben Pfade bringt drei Fähigkeiten mit, also **21 Fähigkeiten**, und jede braucht einen eigenen Effekt. Angriffe im Takt und Ausweichen/Parieren zeichnet das Spiel selbst im Code, dafür sind keine Grafiken nötig.

**Reihenfolge:** 1 (Gegner) → 2 (Hintergründe) → 4 (Fähigkeits-Effekte) → 3 (Spieler-Posen) → 5 bis 8.

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

## 1. Gegner-Sprites

### 1.1 Vorlage Mensch (48x48)
```
[STYLE BLOCK]
Side-view battle sprite sheet for an enemy: [BESCHREIBUNG], facing left, 48x48 px per frame, 6 columns, transparent background, consistent baseline. Rows:
1) idle stance, 4 frames;
2) attack A with a clear wind-up held for 2 frames before the hit, 6 frames;
3) attack B (a different, slower and heavier move), 6 frames;
4) hurt recoil, 3 frames;
5) defeated, 4 frames (last frame stays).
Sheet 288x240.
```
### 1.2 Vorlage übernatürlich (64x64)
```
[STYLE BLOCK]
Side-view battle sprite sheet for a supernatural enemy: [BESCHREIBUNG], facing left, 64x64 px per frame, 6 columns, transparent background. Rows:
1) idle floating/breathing loop, 4 frames;
2) attack with a clearly telegraphed wind-up held for 2 frames, 6 frames;
3) special attack, 6 frames;
4) hurt, 3 frames;
5) dissolving defeat, 6 frames.
Fake transparency with checker dithering, no blur. Turquoise #6fe0d0 is the only bright color. Sheet 384x320.
```

### 1.3 Gegnerliste
| Datei (`public/sprites/battle/`) | Kampf-ID im Spiel | Vorlage | `[BESCHREIBUNG]` |
|---|---|---|---|
| `enemy_chorfanatiker.png` | `choir_zealots` | Mensch | a cult fanatic in a long grey hooded choir robe, gaunt face in shadow, a small eye-in-a-circle pendant; attack A swings a heavy brass censer on a chain leaving grey smoke, attack B is a shrieking hymn that throws a turquoise sound ring |
| `enemy_rook.png` | `rook_fight` | Mensch | a young blond constable in a navy uniform and tall helmet, cold determined face, a small violet eye-in-a-circle pin on his collar; attack A quick truncheon jab, attack B overhead truncheon smash with turquoise light in his eyes |
| `enemy_silas.png` | `silas_fight` | Mensch | an elegant card sharp in a dark green waistcoat and long coat, wine-red silk neckerchief, slicked black hair, thin moustache; attack A flicks razor-edged playing cards (cards blank, no symbols), attack B a fast lunge with a hidden thin knife from his sleeve |
| `enemy_schattenpuppe.png` | `schattenpuppe` | Mensch | a practice dummy made of living shadow and chalk dust, a featureless human outline drawn with white chalk lines over black, slightly wobbly edges; attack A a long shadow slap, attack B its arm stretches unnaturally long |
| `enemy_grubenkaempfer.png` | `grubenkampf` | Mensch | a broad dock worker brawler with bare forearms, knit cap, sawdust on his trousers, taped knuckles; attack A a looping haymaker, attack B a headbutt after a two-step charge |
| `enemy_aktenfresser.png` | `archive_rats` | übernatürlich | a writhing swarm of rats tangled into one mass with shredded paper files and ink-stained scraps; one larger rat at the front has an eye-in-a-circle sigil burned into its forehead glowing turquoise; attack: surge forward; special: spit a storm of paper shreds |
| `enemy_spiegelschatten.png` | `mirror_shade` | übernatürlich | a shade that climbs out of a gold-framed mirror: a dark mirror-image of a human with a cracked-glass surface for skin and turquoise light in the cracks; attack: shard claws; special: splits into two mirrored copies for a moment |

### 1.4 Bonus-Gegner für spätere Fälle (gleiche Vorlagen)
| Datei | Vorlage | `[BESCHREIBUNG]` |
|---|---|---|
| `enemy_kanalkroete.png` | übernatürlich | a huge pale canal toad with turquoise warts that glow, a cult sigil scratched into its back; special: spits a poison cloud |
| `enemy_uhrwerkwaechter.png` | übernatürlich | a clockwork guardian built from a church clock: brass gears, a clock face as head with hands spinning, pendulum arms |
| `enemy_maskenspieler.png` | Mensch | a theatre actor in a white porcelain mask and a tattered stage costume, moves like a dancer, attack with a stage rapier |
| `enemy_schlachtergehilfe.png` | Mensch | a hulking slaughterhouse worker in a stained leather apron and rubber boots, swinging a meat hook (no blood, only rust and grime) |
| `enemy_gasgeist.png` | übernatürlich | a ghost made of leaking yellow gas from the old gas pipes, glowing pale yellow, flickers like a faulty lamp |

## 2. Kampf-Hintergründe (480x270, deckend)
```
[STYLE BLOCK]
Side-view battle background, 480x270 px, not transparent, for a turn-based battle: [ORT]. Layered depth (far silhouettes, mid layer, near ground), the bottom 70 px is a flat readable ground strip where fighters stand, nothing important in the central area. Fog layers, muted palette, amber lamp glow where it fits. No characters, no text.
```
| Datei (`public/sprites/battle/`) | `[ORT]` |
|---|---|
| `bg_hafen.png` | the canal docks at night: stacked crates, a crane silhouette with a hanging hook, moored barges, dark water, a warehouse wall with a large number-less door |
| `bg_lagerhaus.png` | inside an abandoned warehouse used by a cult: wooden floor, grey hooded robes on nails, a crate altar with black candles, a turquoise chalk circle glowing on the floor in the background |
| `bg_altmarkt.png` | an old market square: a stone fountain, closed market stalls with striped awnings, a grey chapel facade with a rose window, frosted gas lamps |
| `bg_taverne.png` | a smoky tavern room: bar counter with bottles, overturned stools, barrels, a fireplace glow, a moon-and-waves sign on the wall (no text) |
| `bg_grube.png` | a sawdust fighting pit under a stone bridge: rope fence, a crowd of dark silhouettes with raised fists and caps, strings of paper lanterns, bridge arch above |
| `bg_ebba.png` | the cemetery of St. Ebba: leaning gravestones, dead trees, the burned chapel ruin with an empty gothic window frame, ash drifting |
| `bg_archiv.png` | a basement records archive: tall shelves of files, a green-shaded reading lamp, paper scattered on the floor, gnawed boxes |
| `bg_nachtmarkt.png` | a black market under a bridge: closed stalls, a communal cauldron steaming, crows on a beam, canal steps |
| `bg_spiegel.png` | a surreal mirror-world version of the old market: everything reversed and tinted cold blue, cracks in the air like broken glass with turquoise light behind them |

## 3. Spieler: Fähigkeits-Posen und Waffen

### 3.1 Pfad-Posen (48x48, Blick nach rechts)
```
[STYLE BLOCK]
Side-view battle sprite sheet for the player investigator (long dark grey coat, flat cap, scarf, satchel, pale face, short dark hair), facing right, 48x48 px per frame, 6 columns x 7 rows, transparent background, same proportions as public/sprites/battle/battle_player.png. One casting animation per row, 6 frames each; any glow is neutral white-gold so the game can tint it:
1) lantern: raises an open palm, a ball of light forms and is thrown;
2) thread: pulls an invisible thread between two fingers, then yanks it;
3) mask: holds a hand in front of the face, body flickers and shifts sideways;
4) echo: tilts head, hand to ear, then opens the mouth in a silent scream;
5) cauldron: uncorks a vial and throws it in an arc;
6) iron: plants feet, tenses arms, body darkens like metal, then a heavy punch;
7) key: crouches low, dashes forward and slips back into a shadow.
Sheet 288x336.
```
Ablage: `public/sprites/battle/battle_player_skills.png`.

### 3.2 Waffen-Varianten
```
[STYLE BLOCK]
Side-view battle sprite sheet for the same player investigator, facing right, 48x48 px per frame, 6 columns x 3 rows, transparent background: row 1 strike with a black police service truncheon (6 frames), row 2 thrust and slash with a silver-plated cane sword with a faint shine (6 frames), row 3 victory pose tipping the cap (4 frames).
```
Ablage: `public/sprites/battle/battle_player_weapons.png`.

## 4. Fähigkeits-Effekte (21 Stück)

Effekt-Datei heißt wie die Fähigkeit im Spiel: `public/sprites/fx/fx_<skill-id>.png`. Grundvorlage:
```
[STYLE BLOCK]
Battle effect animation strip for a skill called "[NAME]": [EFFEKT]. Frame size [GRÖSSE], [N] frames in one row, transparent background, crisp pixels, no blur, main color [FARBE] with white highlights and dark outline accents. The effect must read clearly over a dark background.
```

| Skill-ID | Name | Pfad / Farbe | Größe, Frames | `[EFFEKT]` |
|---|---|---|---|---|
| `lichtstoss` | Lichtstoß | Laterne #e8b860 | 48x48, 6 | a bolt of focused lamplight shooting horizontally and bursting into a bright star on impact |
| `funkenregen` | Funkenregen | Laterne #e8b860 | 48x48, 8 | three sprays of amber sparks raining down in rhythm, small flames remain on the ground |
| `leuchtfeuer` | Gleißendes Feuer | Laterne #e8b860 | 64x64, 8 | a blinding white-amber flash expanding from a center point, rays everywhere, fading to embers |
| `schwachstelle` | Schwachstelle lesen | Faden #c8b0e8 | 48x48, 6 | thin lilac threads converge on one point and form a glowing crosshair knot that stays and pulses |
| `vorahnung` | Vorahnung | Faden #c8b0e8 | 48x48, 6 | a ghostly lilac afterimage of an incoming strike plays out and shatters before it lands |
| `schicksalsfaden` | Schicksalsfaden | Faden #c8b0e8 | 64x64, 8 | two glowing threads whip across in an X, cutting, then snap tight |
| `trugbild` | Trugbild | Maske #e07a8a | 48x48, 6 | a rose-tinted shimmering duplicate silhouette steps out of the caster and stays as a shield-like decoy |
| `verwirrung` | Verwirrung | Maske #e07a8a | 48x48, 6 | a spinning theatre mask appears over the target's head, then dissolves into swirling rose petals of light |
| `spiegelschritt` | Spiegelschritt | Maske #e07a8a | 48x48, 8 | two mirrored rose slashes from left and right, then a broken-mirror flash where the caster vanishes |
| `klagelaut` | Klagelaut | Echo #6fe0d0 | 48x48, 6 | turquoise sound rings pulsing outward with faint wailing ghost faces in them |
| `grabesstimme` | Grabesstimme | Echo #6fe0d0 | 64x64, 8 | skeletal ghost hands rise from below and grip the target, frost forms, the target freezes |
| `seelenzug` | Seelenzug | Echo #6fe0d0 | 64x64, 8 | a wisp of light is torn out of the target and flows back in a stream toward the caster |
| `wundsalbe` | Wundsalbe | Kessel #9ad06a | 32x32, 6 | a dab of green salve glows and spreads, small healing crosses float upward |
| `giftphiole` | Giftphiole | Kessel #9ad06a | 48x48, 8 | a vial flies in an arc, shatters, and a bubbling green puddle with rising poison bubbles remains |
| `aetzwolke` | Ätzende Wolke | Kessel #9ad06a | 64x64, 8 | a thick acidic green cloud billows over the target, metal pieces corrode and drip |
| `wuchtschlag` | Wuchtschlag | Eisen #a8b4c0 | 48x48, 6 | a heavy steel-grey impact shockwave with flying rivets and dust |
| `eisenhaut` | Eiserne Haut | Eisen #a8b4c0 | 48x48, 6 | iron plates form over a body-shaped area with a metallic gleam, a ring of sparks |
| `klingenwirbel` | Klingenwirbel | Eisen #a8b4c0 | 64x64, 8 | three fast steel blade arcs in a spinning whirl |
| `hinterhalt` | Hinterhalt | Schlüssel #d0a050 | 48x48, 6 | a short brass-colored stab streak from behind with a small crow-shadow flicker |
| `fallstrick` | Fallstrick | Schlüssel #d0a050 | 48x48, 6 | a wire snare snaps tight around ankles, a brass glint, the target trips |
| `schattenschritt` | Schattenschritt | Schlüssel #d0a050 | 48x48, 8 | two dark slashes out of a pool of shadow, then the shadow pool closes |

Zusätzlich 21 **Fähigkeits-Icons** fürs Kampfmenü:
```
[STYLE BLOCK]
Skill icon sheet, 16x16 px per icon, 7 columns x 3 rows, transparent background, 1px dark outline, round brass-rimmed badge per icon. Columns = pathways (lantern amber, thread lilac, mask rose, echo turquoise, cauldron green, iron steel grey, key brass). Rows = sequence 9, 8, 7. Icons: [lantern: light bolt, spark rain, blinding flash] [thread: crosshair knot, ghost afterimage, crossed threads] [mask: twin silhouette, spinning mask, mirrored slashes] [echo: sound rings, ghost hand, soul wisp] [cauldron: salve jar, flying vial, acid cloud] [iron: fist impact, iron plate, blade whirl] [key: dagger from behind, wire snare, shadow pool].
```
Ablage: `public/sprites/ui/skill_icons.png` (Spalten: laterne, faden, maske, echo, kessel, eisen, schluessel; Reihen: Sequenz 9, 8, 7).

## 5. Status-Effekte
```
[STYLE BLOCK]
Status effect icon sheet, 16x16 px each, in a row, transparent background, 1px dark outline, small round badges: burning (amber flame), poisoned (green bubbles), stunned / skips turn (circling sparks), frozen in fear (turquoise frost), weak spot marked (lilac crosshair), foresight (lilac eye), decoy shield (rose twin silhouette), confused (spinning rose mask), iron skin (steel plate), armor corroded (green dripping plate), hidden in shadow (brass crow shadow), bleeding (dark red drop).
```
Ablage: `public/sprites/ui/status_icons.png`. Reihenfolge: `brennen, gift, betaeubt, starre, schwachstelle, vorahnung, trugbild, verwirrt, eisenhaut, zerfressen, schatten, blutung`.

## 6. Allgemeine Treffer-Effekte und Zahlen
```
[STYLE BLOCK]
Battle hit effect animation strips, each frame 32x32 px, frames in a row, transparent background, crisp pixels:
1) blunt impact (cane/truncheon), white-amber burst, 5 frames;
2) blade slash, thin curved white streak, 4 frames;
3) parry clash, gold-white star spark, 4 frames;
4) perfect dodge, grey dithered afterimage streak, 4 frames;
5) critical hit, large white-gold starburst at 48x48, 5 frames;
6) heal, soft red plus symbols floating up, 5 frames;
7) nerves damage, turquoise static pixels, 5 frames;
8) item use, small white puff with a sparkle, 4 frames;
9) miss, small grey dust puff, 3 frames.
```
```
[STYLE BLOCK]
Pixel font sheet for floating battle numbers, transparent background: digits 0-9 plus "+" and "-", each glyph 8x10 px, chunky with a 1px dark outline, 4 color rows: white (damage), amber (critical), red (damage to player), turquoise (nerves); a fifth row green (healing).
```
Ablage: `public/sprites/fx/hits.png`, `public/sprites/ui/damage_font.png`.

## 7. Kampf-Oberfläche
```
[STYLE BLOCK]
Battle HUD sheet, transparent background: compact HP bar 64x8 (brass frame, deep red fill, 6 states), nerves bar 64x8 (turquoise fill, 6 states), concentration points as 8x8 brass pips (empty, full amber, glowing), enemy HP bar 64x6 in dark red with a thin iron frame (6 states), an "occult enemy" marker 16x16 (turquoise eye in a circle), a target bracket cursor 24x24 (4-frame amber pulse), a turn banner 160x24 for "your turn" / "enemy turn" (blank brass plaque, no text, plus a dark iron variant).
```
```
[STYLE BLOCK]
Battle command menu UI, transparent background: a 9-slice panel 48x48 from 16x16 pieces in dark parchment with brass frame; command icons 16x16: attack (cane), skill (glowing hand), item (satchel), defend (raised forearm), flee (running boot); an amber pointer arrow 8x8 with 2 frames; a disabled/greyed variant of each command icon.
```
```
[STYLE BLOCK]
Battle result UI, transparent background: victory plaque 192x40 (polished brass with laurel ends, blank center), defeat plaque 192x40 (cracked dark iron with a faint red tint, blank center), a loot panel 9-slice 48x48 (dark velvet with brass rim), and a 16x16 "loot" icon of an open satchel with a coin.
```
Ablage: `public/sprites/ui/battle_hud.png`, `battle_menu.png`, `battle_result.png`.

## 8. Übergänge
```
[STYLE BLOCK]
Battle start transition, 480x270 px per frame, 6 frames in a row: dark fog and ink tendrils close in from the edges until the screen is black; on frame 5 a faint turquoise eye shape is briefly visible in the center. Transparent where not covered.
```
```
[STYLE BLOCK]
Battle end transition, 480x270 px per frame, 6 frames: the black screen breaks apart into drifting ash flakes revealing transparency underneath.
```
Ablage: `public/sprites/fx/transition_in.png`, `transition_out.png`.
