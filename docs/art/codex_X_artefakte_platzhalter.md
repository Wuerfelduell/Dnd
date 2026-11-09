# Codex-Batch X: Treffen-Artefakte und restliche Platzhalter

**Batch-Name:** `platzhalter` (Manifest: `public/sprites/manifest-platzhalter.json`)

Diese Datei räumt alle Stellen auf, an denen das Spiel noch Platzhalter zeigt. Das sind vor allem: die 12 neuen seltenen Artefakte der geheimen Treffen, Gegenstände, die sich ein Icon mit einem anderen Gegenstand teilen, die Kämpfe aus Fall 9 „Der Sternsammler“ (Starling, Dr. Pratt, Chor der Seiten, Gefallenes Sternlicht) samt Fallakte und Enden, Zug-Portraits und Bestiarium für Sekten und Gefahrengebiete, Boss-Intros der vier Gebietsbosse und die Kartenmarker der Wexmoor-Zirkel.

**Schon fertig oder anderswo, nicht neu machen:** alles aus den Batches A bis V, die Zirkelmitglieder (Batch T) und alles aus **Batch W** (`codex_W_altstadt_nebengeschichten.md`: Versunkene Altstadt, Pfahlbohrer, Ratsherr, Kellerkrebs, Namensmade, Bürgermeister, die Items pfahlholz, ratssiegel, krebspanzer, madenwachs, moortee, salzbrot, amtskette, veys_stimmgabel, schreintaefelchen).

Reihenfolge innerhalb der Datei ist egal, Abschnitt 1 hat Vorrang (die Treffen laufen schon mit diesen Artefakten).

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
- Item-Icons: `public/sprites/items/<id>.png` (16x16) und `public/sprites/items/32/<id>.png` (32x32). Die 16er-Dateien **ersetzen** die Platzhalter-Kopien mit gleichem Namen, die schon im Repo liegen.
- Ein Manifest `public/sprites/manifest-platzhalter.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-platzhalter-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat.

### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."

---

## 1. Seltene Artefakte der geheimen Treffen (16x16 und 32x32)

Auf den Treffen werden diese 12 Artefakte für 300 bis 500 Schilling versteigert. Im Spiel nutzen sie bisher Kopien anderer Icons. Artefakte sind okkult: höchstens ein kleiner Akzent in Türkis #6fe0d0 oder tiefem Violett, sonst gedeckte Farben. Stil-Referenz: vorhandene Artefakt-Icons wie `items/zahnkette.png`, `items/uhr_ertrunkener.png`, `items/bleiamulett.png`.

Vorlage (einmal mit `[SIZE]` = `16x16`, einmal mit `32x32`, gleiche Form, beim 32er mehr Detail):
```
[STYLE BLOCK]
Single inventory item icon, [SIZE] px, centered, transparent background, readable silhouette at small size, occult artifact: [BESCHREIBUNG].
```

| ID | Name im Spiel | `[BESCHREIBUNG]` |
|---|---|---|
| `nachtauge_brosche` | Brosche der Nachtwache | a small brass brooch shaped like a half-closed eye, a dull turquoise iris, a faint glow under the lid |
| `bleierne_waage` | Bleierne Taschenwaage | a tiny pocket balance scale made of dull grey lead, two shallow pans on thin chains, one pan slightly lower |
| `kreidestummel` | Ewiger Kreidestummel | a short stub of white chalk wrapped in a strip of faded red cloth, a thin chalk circle drawn around it |
| `russfingerhut` | Rußiger Fingerhut | a heavy iron thimble blackened with soot, a wisp of dark smoke curling out of its opening, small rust spots |
| `salzrosenkranz` | Salzrosenkranz | a short loop of rough white-grey salt crystal beads on a frayed cord, a small knotted fish-hook charm at the end |
| `schwarzer_docht` | Schwarzer Docht | a short candle wick burning with a black flame that swallows light, a faint violet outline around the flame, no candle body |
| `doppelter_trauring` | Doppelter Trauring | two old gold wedding rings fused together into one, a thin dark crack along the seam, slightly tarnished |
| `glaesernes_ohr` | Gläsernes Ohr | a human ear made of thin pale-turquoise glass, translucent with light highlights, a tiny crack at the lobe |
| `pfandmarke_alt` | Pfandmarke ohne Pfandhaus | a worn brass pawn token with a punched hole, an empty stamped emblem (no letters), a short string through the hole |
| `kleine_moorlaterne` | Kleine Moorlaterne | a thumb-sized iron lantern with greenish glass, a tiny pale will-o'-the-wisp light trapped inside |
| `eiserne_zunge` | Eiserne Zunge | the iron clapper of a church bell, heavy and pear-shaped, rusty, with a dark leather loop at the top |
| `spiegelmuenze` | Spiegelmünze | a silver coin polished like a mirror on both sides, showing only a blurred reflection, a thin bright rim |

Wichtig: Jedes Icon muss sich klar vom Gegenstand unterscheiden, dessen Kopie es bisher ist (`amulett_auge`, `taschenuhr`, `papierfeder`, `russklumpen`, `salzkristall`, `wachsdocht`, `ehering`, `glasfeder`, `falschgeld`, `irrlichtfunke`, `glockenzunge`, `spiegelscherbe`).

---

## 2. Gegenstände, die sich ein Icon teilen

Diese Gegenstände zeigen im Spiel dasselbe Bild wie ein anderer Gegenstand. Vorlage wie in Abschnitt 1, aber ohne „occult artifact“ (nur Waffen und okkulte Dinge bekommen einen kleinen Türkis-/Violett-Akzent, wo es passt):
```
[STYLE BLOCK]
Single inventory item icon, [SIZE] px, centered, transparent background, readable silhouette at small size: [BESCHREIBUNG].
```

### 2.1 Nur 16x16 neu (ein eigenes 32er gibt es schon)
Das vorhandene `public/sprites/items/32/<id>.png` als Vorlage mitgeben und daraus ein sauberes 16er ableiten (gleiche Form und Farben, vereinfacht, nicht einfach verkleinern). Das 32er nicht verändern.

| ID | Name im Spiel | teilt sich bisher das Bild mit | `[BESCHREIBUNG]` |
|---|---|---|---|
| `ankerhaken` | Ankerhaken | schlagstock | a heavy rusty boat hook with a short piece of anchor chain at the grip |
| `schleierdolch` | Schleierdolch | stockdegen | a slim dagger with a white porcelain grip and a thin grey blade |
| `silberschere` | Silberschere | stockdegen | a pair of long elegant silver scissors, a faint lilac thread caught between the blades |
| `rostwasser` | Rostwasser | tonikum | a small corked glass bottle of cloudy rust-red water with iron filings at the bottom |
| `schlaftee` | Dose Schlaftee | tonikum | a small round tin of tea, lid ajar, dried poppy flowers and a silvery cobweb-like strand peeking out |
| `schleierpuder` | Schleierpuder | riechsalz | a small round porcelain powder box, lid tilted, grey powder dusting out |
| `wasserprobe` | Wasserprobe aus dem Kontor | stimmphiole | a stoppered glass jar of murky water with green threads floating inside, a paper label without text |
| `kinder_murmel` | Grüne Murmel | sternschlacke | a single green glass marble with a scratched mark (a simple line, no letter) |
| `porzellanmaske` | Porzellanmaske | puppenglas | a thin eggshell-white porcelain half mask with a faint crack |
| `schuldbuch` | Schuldbuch des Eintreibers | verlorenes_gesangbuch | a thick black ledger bound with a chain and a small padlock, red ribbon bookmark |
| `pfaendungsbrief` | Pfändungsbrief | testament | a folded official letter with a red wax seal and a black border (eviction notice), no readable text |
| `traumspule` | Traumspule | spieldose_klein | a wooden spool with a faintly glowing pale lilac thread wound around it |

### 2.2 16x16 und 32x32 neu

| ID | Name im Spiel | teilt sich bisher das Bild mit | `[BESCHREIBUNG]` |
|---|---|---|---|
| `fahrkarte_wexmoor` | Fahrkarte nach Wexmoor | fahrkarte | a third-class railway ticket, greenish card stock with a punched hole and a small printed locomotive silhouette, no readable text (must look different from the plain city ticket) |
| `wundertonikum` | Dr. Pratts Wundertonikum | tonikum | a tall greenish medicine bottle with a gaudy label covered in fake gold medals (shapes only, no text), a cork with a red ribbon |
| `pells_maske` | Weiße Halbmaske | puppenglas | a white theatre half mask with a dark velvet lining visible at the edge, a black ribbon tie |
| `egelhaken` | Egelhaken | schlagstock | a mossy boat hook from the marsh with small pale teeth stuck in the wood, a green slimy sheen |
| `ossuarklinge` | Ossuarklinge | stockdegen | an old straight sword whose crossguard and grip are made of bone, a faint turquoise glint on the blade |
| `sternsplitter` | Starlings Sternglas | sternschlacke | three small shards of dark star-glass wrapped in a scrap of oilcloth, each holding a tiny pale light |
| `empfehlungsschreiben` | Marlowes Empfehlungsschreiben | erpresserbrief | a sealed cream envelope with a dark blue police wax seal and a neat ribbon, no readable text |

---

## 3. Fall 9 „Der Sternsammler“: Kämpfe

Fall 9 ist das Finale von Kapitel 1 in der Sternwarte und im Kraterwald. Die vier Gegner laufen bisher mit geliehenen Sheets anderer Gegner.

### 3.1 Gegner (Kampf-Sheet)
Vorlage:
```
[STYLE BLOCK]
Side-view battle sprite sheet, [GRÖSSE] px per frame, facing left, 6 columns, transparent background, consistent baseline: [BESCHREIBUNG]. Rows: 1) idle, 4 frames; 2) attack A, wind-up held 2 frames, 6 frames; 3) attack B or skill, wind-up held 2 frames, 6 frames; 4) hurt, 3 frames; 5) defeated, 6 frames. Sheet [BREITE]x[HÖHE].
```
| Datei (`public/sprites/battle/`) | Größe | Sheet | `[BESCHREIBUNG]` | Angriff A / B |
|---|---|---|---|---|
| `enemy_pratt.png` | 48x48 | 288x240 | Dr. Horatio Pratt, a slick quack doctor in a loud checked suit and top hat, gold tooth, a gentleman's cane that hides a thin sword (as in his existing walk sheet `characters/E_schwindler_walk.png`) | A „Degenstich“: draws the cane sword and lunges; B „Flasche ins Gesicht“: throws a green tonic bottle that bursts into a cloud |
| `enemy_gesangbuchgeist.png` | 64x64 | 384x320 | „Chor der Seiten“: a floating old hymnal whose pages flutter open by themselves, fog rising from the musical notes and forming several pale singing mouths, loose pages orbiting it; occult turquoise glow | A „Falscher Ton“: a jarring sound wave from the mouths; B „Kanon“: pages swirl around the target in a circle |
| `enemy_sternlicht.png` | 64x64 | 384x320 | „Gefallenes Sternlicht“: a tall shifting figure of dripping white-blue starlight that has fallen from a telescope eyepiece, many faint faces flicker inside it, none of them its own, light pools at its feet | A „Lichtpeitsche“: a whip of light; B „Gleißen“: a blinding flash burst |

Ablage wie in der Tabelle. In den Daten heißen die Begegnungen `pratt_fight`, `gesangbuchgeist`, `sternlicht`.

### 3.2 Boss: Professor Lucius Starling (96x96, eine Phase)
Er ist der Astronom aus Batch C (`characters/C_astronom_walk.png`, `portraits/C_astronom_emotions.png`): wilde weiße Haare, Schal mit Sternmuster, viele Linsen an Ketten um den Hals, Tinte auf der Nase. Im Kampf trägt er die gestohlenen Lichter der Opfer in Gläsern.
```
[STYLE BLOCK]
Side-view boss battle sprite sheet, 96x96 px per frame, facing left, 6 columns, transparent background, consistent baseline: Professor Lucius Starling, an eccentric old astronomer with wild white hair, a dark blue coat and a star-patterned scarf, many brass lenses on chains around his neck, ink on his nose, a large brass burning glass in one hand; small glass jars with captured pale lights hang from his belt; behind him a faint violet halo like a dim star; friendly smile that is slightly wrong. Rows:
1) idle, polishing a lens and smiling, the jar lights pulsing, 4 frames;
2) attack "Brennglas": raises the burning glass, a thin burning beam, wind-up held 2 frames, 6 frames;
3) attack "Sternregen": throws his arms up and small star shards rain down, wind-up held 2 frames, 6 frames;
4) skill "Gestohlene Stimme": opens a jar and a pale light with a face shrieks at the party, 6 frames;
5) skill "Geliehener Schatten": his shadow peels off the floor and stands up beside him, 6 frames;
6) hurt, lenses rattle, 3 frames;
7) special "Fallender Stern" and defeat: he calls down a large burning star (frames 1-3), then the jars crack and the lights fly away upward while he sinks to his knees, grey and small (frames 4-6), 6 frames.
Sheet 576x672.
```
Ablage: `public/sprites/battle/enemy_starling.png`. Begegnung: `starling_fight`.

Boss-Intro (Büste vor dem Kampf, wie `ui/M_08_boss_wren.png`):
```
[STYLE BLOCK]
Boss introduction bust portrait, 160x160 px, transparent background: Professor Lucius Starling seen from the chest up, wild white hair, lenses on chains, star-patterned scarf, holding a glass jar with a captured glowing face in front of his smiling face, a dim violet star behind his head. Dramatic light from below.
```
Ablage: `public/sprites/ui/X_08_boss_starling.png`.

### 3.3 Zugleiste und Bestiarium für Fall 9
Zug-Portraits (rund, 16x16, in einer Reihe):
```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: quack doctor in a top hat, floating hymnal with mouths, figure of dripping starlight, old astronomer with wild white hair and lenses.
```
Reihenfolge/IDs: `pratt_fight, gesangbuchgeist, sternlicht, starling_fight`. Ablage: `public/sprites/ui/X_zug_portraits_fall9.png` (64x16).

Bestiarium-Karten:
```
[STYLE BLOCK]
Bestiary card, 96x128 px, not transparent: an aged notebook page with a hand-drawn ink-and-wash pixel sketch of [GEGNER] in the upper two thirds, a pinned specimen label shape and a few scribbled notes as abstract lines (no readable text) in the lower third, a coffee stain in a corner.
```
Karten für `pratt_fight`, `gesangbuchgeist`, `sternlicht`, `starling_fight`. Ablage: `public/sprites/ui/bestiary/X_<id>.png`.

---

## 4. Fall 9: Fallakte und Enden

Fallakte (wie `ui/cases/M_akte_fall8.png`):
```
[STYLE BLOCK]
Case file cover illustration, 128x96 px, not transparent: a small framed pixel-art vignette on a manila case folder background for the case The Star Collector: a brass telescope on an observatory dome at night, a single violet star unnaturally close above it, small lights rising from the city towards it. A paperclip and a wax seal in the corner. No text.
```
Ablage: `public/sprites/ui/cases/X_akte_fall9.png`.

Enden (wie `ui/endings/c8_good.png`):
```
[STYLE BLOCK]
Ending illustration in pixel art, 480x270 px, not transparent, cinematic composition: [SZENE]. Muted palette, strong mood lighting, no text.
```
| Datei (`public/sprites/ui/endings/`) | Titel im Spiel | `[SZENE]` |
|---|---|---|
| `c9_perfect.png` | Der Stern sieht sich selbst | inside the observatory dome at night, a large mirror turned towards the violet star in the open roof, dozens of small pale lights flying out of the star and away over the rooftops of the city towards home, the star fading, Starling small and grey in a corner |
| `c9_good.png` | Scherben am Himmel | a shattered mirror on the observatory floor, shards of light raining down from the sky over the dark crater forest, some lights flying home, others going out as they fall, police lanterns climbing the hill in the distance, Starling gone |
| `c9_early.png` | Eine leere Kuppel | the observatory dome in harsh midday light, completely empty, the telescope dismantled, only a dark dried circle on the wooden floor, a constable standing helplessly in the doorway |
| `c9_vey.png` | Die falsche Frau | foggy city street at night full of police lanterns and wanted posters of a woman's face, people searching the alleys, nobody looking up at the large violet star sinking towards the crater forest on the horizon |

---

## 5. Zugleiste und Bestiarium für Sekten, Gefahrengebiete und Price

Diese Gegner haben Kampf-Sheets, aber in der Zugleiste nur ein leeres Feld. Vorlage für die Zug-Portraits:
```
[STYLE BLOCK]
Round mini portraits for a battle turn-order bar, 16x16 each, in a row, transparent background, brass rim, 1px dark outline, simple readable faces/shapes: [LISTE].
```

### 5.1 Sekten (Rostbrüder, Schleierschwestern)
`[LISTE]` in dieser Reihenfolge: burly man in a rust-red hood with a chain; second rust-red hooded brother with a cap (patrol); lean man in a rust-red smock with a boat hook; huge soot-black smith with tongs; old man with iron-grey beard and chain-link collar; young maid with a white cap and hairpins; woman in a small grey veiled hat; second grey veiled woman, face hidden; veiled woman with a hand mirror; regal woman with a porcelain half mask and veils.

IDs: `rost_schlaeger, rost_streife, rost_werfer, rost_schmied, rost_vater, schleier_novizin, schleier_messerin, schleier_schatten, schleier_seherin, schleier_mutter`. Ablage: `public/sprites/ui/X_zug_portraits_sekten.png` (160x16). Vorlage für die Figuren sind die Kampf-Sheets `battle/enemy_<id>.png` aus Batch I.

Bestiarium-Karten (Vorlage aus 3.3) für `rost_schlaeger`, `rost_werfer`, `rost_schmied`, `rost_vater`, `schleier_novizin`, `schleier_messerin`, `schleier_seherin`, `schleier_mutter`. Ablage: `public/sprites/ui/bestiary/X_<id>.png`.

### 5.2 Gefahrengebiete (Batch G)
`[LISTE]` in dieser Reihenfolge: bog walker of reeds with two pale lights for eyes; pale green will-o'-the-wisp with a tiny face; black-green leech mouth; bog queen with an antler-and-reed crown; beaked plague mask with round glass eyes; grey dust wraith with a cracked porcelain face; red-eyed rat with a paper ear tag; rat king knot wearing a cutlery crown; worm of vertebrae; eyeless pale candle eater; floating skull; bone knight with a lantern in its ribcage; crow of dark glass; black glass egg creature; faceless star-glass shard figure; stag with star-glass antlers.

IDs: `moorleiche, irrlicht, schlammegel, moorkoenigin, schnabelmaske, hustender, pestratte, rattenkoenig, knochenwurm, kerzenfresser, schaedelschwarm, ossuarwaechter, glaskraehe, kraterbrut, splitterling, sternhirsch`. Ablage: `public/sprites/ui/X_zug_portraits_gebiete.png` (256x16). Vorlage sind die Sheets `battle/enemy_<id>.png` aus Batch G.

### 5.3 Price als Gegner (Kapitel 2)
Ein einzelnes Zug-Portrait 16x16: Inspector Price, the stern police officer from the existing sprites, in a travelling coat. Vorlage `battle/enemy_price.png` aus Batch V. Begegnung `price_wx_fight`. Ablage: `public/sprites/ui/X_zug_portrait_price.png`.

---

## 6. Boss-Intros der vier Gebietsbosse

Die Bosse der Gefahrengebiete springen ohne Intro-Büste in den Kampf. Vorlage (wie `ui/M_08_boss_wren.png`):
```
[STYLE BLOCK]
Boss introduction bust portrait, 160x160 px, transparent background: [BESCHREIBUNG]. Dramatic light from below, seen from the chest up, facing slightly left.
```
| Datei (`public/sprites/ui/`) | Begegnung | `[BESCHREIBUNG]` |
|---|---|---|
| `X_08_boss_moorkoenigin.png` | `moorkoenigin` | the bog queen: a regal figure of roots, peat and drowned lace, a crown of antlers and reeds, will-o'-the-wisps orbiting her head |
| `X_08_boss_rattenkoenig.png` | `rattenkoenig` | the rat king: a knot of dozens of rats with tangled tails, a crown of bent cutlery and bottle caps, a ragged cloak, glowing turquoise eyes in the middle |
| `X_08_boss_ossuarwaechter.png` | `ossuarwaechter` | the ossuary guardian: a huge knight built from bones, a church door as a shield, a lantern with a turquoise flame inside its ribcage |
| `X_08_boss_sternhirsch.png` | `sternhirsch` | the star stag: a corrupted stag whose antlers are branching star-glass crystals, half flesh and half dark glass, a glowing star-shaped wound on its chest |

Vorlage für die Figuren sind die Kampf-Sheets `battle/enemy_<id>.png` aus Batch G.

---

## 7. Portraits für Sektenmitglieder ohne Gesicht

Fünf Sektenmitglieder sprechen im Spiel, haben aber kein Portrait. Emotions-Sheet 256x64 wie alle Portraits (neutral, misstrauisch, erschrocken, leichtes Lächeln):
```
[STYLE BLOCK]
Character portrait emotion sheet, 4 portraits of 64x64 px side by side (256x64), transparent background, same character in every frame, head and shoulders, facing slightly right: [BESCHREIBUNG]. Expressions left to right: neutral, suspicious, shocked, faint smile.
```
| Datei (`public/sprites/portraits/`) | Figur | `[BESCHREIBUNG]` |
|---|---|---|
| `X_rost_schlaeger_emotions.png` | Rostbruder (Kettenträger) | a burly dock brother in a rust-red hooded smock, heavy chain around his shoulder, patches of grey iron-like skin on his neck and cheek |
| `X_rost_werfer_emotions.png` | Rostbruder (Hakenwerfer) | a lean wiry dock brother in a rust-red smock with leather bracers, a boat hook over his shoulder, narrow suspicious eyes |
| `X_rost_schmied_emotions.png` | Rostschmied Bellamy | a massive smith with soot-blackened arms and face, a scorched leather apron over a rust-red smock, a bald head with a burn scar |
| `X_schleier_messerin_emotions.png` | Fräulein Grau | an elegant milliner's shop assistant in a grey dress and a small grey veiled hat, the veil half over her eyes, a thin blade at her collar |
| `X_schleier_seherin_emotions.png` | Schleierseherin | a veiled woman in layered grey silk, her face hidden behind a grey veil except for one pale eye, a hand mirror raised to her chin |

Vorlage für Kleidung und Farben sind die Kampf-Sheets `battle/enemy_<id>.png` aus Batch I.

---

## 8. Kartenmarker der Wexmoor-Zirkel

Die Treffpunkte der Lichtlosen und der Salzbrüder zeigen auf der Stadtkarte noch fremde Marker. Bitte im **gleichen Raster wie `ui/O_map_markers.png`** (16x16 pro Zelle, 4 Reihen: normal, hervorgehoben, Puls 1, Puls 2), zwei Spalten:
```
[STYLE BLOCK]
City map location markers, 16x16 each, 2 columns x 4 rows (rows: normal, highlighted with a brass rim, pulse frame 1, pulse frame 2 with a soft glow), transparent background, same style as the existing secret gathering markers: column 1 "the Lightless": a shuttered black lantern with a thin violet glow leaking out; column 2 "the Salt Brothers": a small heap of white salt with a fish hook stuck in it.
```
Spalten-Reihenfolge: `treffen_lichtlose, treffen_salz`. Ablage: `public/sprites/ui/X_map_markers_zirkel.png` (32x64). Embleme der beiden Zirkel liegen schon in `ui/S_zirkel.png` und dienen als Vorlage.

---

## 9. Kontrolle vor dem Abgeben
- Jedes Icon aus Abschnitt 1 und 2 sieht anders aus als der Gegenstand, mit dem es sich bisher das Bild geteilt hat (nebeneinanderlegen und prüfen). Keine zwei Item-Dateien dürfen danach byte-gleich sein.
- Alle Kampf-Sheets haben 6 Spalten und die angegebene Sheet-Größe. Starling passt in Gesicht und Kleidung zu `C_astronom_walk.png` und `C_astronom_emotions.png`.
- Zug-Portrait-Streifen haben genau die angegebene Breite (16 px pro ID) in der angegebenen Reihenfolge.
- Enden und Fallakte sind deckend, Büsten, Icons, Portraits und Marker transparent.
- Manifest `manifest-platzhalter.json`, Prompts in `docs/art/batch-platzhalter-generation.json`, Kurzeintrag in `docs/art/README.md`.
- Kein Spielcode geändert.
