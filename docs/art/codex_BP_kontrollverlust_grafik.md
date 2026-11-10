# Codex-Batch BP: Grafik für den Kontrollverlust (Tentakel-Cutscene und Korruption)

**Batch-Name:** `kontrollverlust` (Manifest: `public/sprites/manifest-kontrollverlust.json`)

Seit PR „Kontrollverlust korrumpiert Ausrüstung“ wachsen beim Kontrollverlust (Unruhe 100 oder zu früher Trank) Tentakel aus der Spielfigur und korrumpieren Waffe, Kleidung und Artefakte am Leib (`src/core/Corruption.js`). Im Spiel laufen dafür **Platzhalter**: `WorldScene.playCorruption()` zeichnet die Tentakel selbst, und `public/sprites/ui/scenes/kontrollverlust.png` ist ein grob gepixeltes Bild. Dieses Paket ersetzt beide und liefert die Icons zur Korruption.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. Alles, was schon im Repo liegt, ist hier nicht enthalten.

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
Leitfarben der Korruption: Tentakel in tiefem Violett (#3a1850 Kern, #5a2a7a Rand), Saugnäpfe und Spitzen in Okkult-Türkis #6fe0d0, schwarzer „Faden“ in Items als #1a1c2c mit violettem Schimmer. Höchstens 2 zusätzliche Violett-Töne zur Palette.

### 0.2 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, genau mit den Namen unten.
- Manifest `public/sprites/manifest-kontrollverlust.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und Geschwindigkeit, wie `manifest-14b.json`.
- Verwendete Prompts in `docs/art/batch-kontrollverlust-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Der Einbau (ANIM_SHEETS-Eintrag `tentakel_fx`, Austausch des Platzhalterbilds) passiert separat. Andere Pakete laufen gleichzeitig: nur eigene Dateien anfassen.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben plus die 2 Violett-Töne) indizieren.
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites.

## 1. Tentakel-Animation auf der Karte (Pflicht)

**Datei:** `public/sprites/fx/BP_tentakel_kontrollverlust.png`, **64x64 pro Frame, 12 Frames in einer Reihe (768x64)**. Wird mittig über der 16x32-Figur gelegt (Anker: Figurmitte etwa 14 px über dem Boden, also Frame-Mitte). Die Figur selbst bleibt sichtbar (die Engine färbt sie violett), die Tentakel wachsen aus Schultern, Rücken und Handgelenken.

| Frames | Phase |
|---|---|
| 0–2 | Aufreißen: dunkle Risse auf dem Körper, erste Spitzen brechen hervor (klein, nass glänzend) |
| 3–6 | Wachsen: 6 bis 8 Tentakel entrollen sich nach oben und zu den Seiten, bis an den Rand des 64er-Feldes, Saugnäpfe türkis |
| 7–9 | Zugreifen: Tentakel krümmen sich zur Figur zurück, tasten über sie, ein kurzes türkises Pulsieren |
| 10–11 | Zurückziehen: Tentakel schrumpfen in den Körper, zurück bleiben zwei, drei violette Tropfen |

Manifest-Animation `grow`: Frames 0–11, frameRate 8, repeat 0.

```
[STYLE BLOCK]
Sprite sheet, 12 frames in one row, each frame 64x64 pixels, transparent background. Animation of wet dark violet tentacles bursting out of an unseen humanoid figure standing at the center bottom of each frame (leave the center 16x32 area mostly free so the game character shows through). Frames 1-3: cracks and small tips emerging at shoulder height. Frames 4-7: six to eight tentacles uncoil upward and sideways to the frame edges, with small turquoise (#6fe0d0) suckers. Frames 8-10: tentacles curl back toward the center, a brief turquoise pulse. Frames 11-12: tentacles retract, leaving a few violet drops. Deep violet (#3a1850 core, #5a2a7a edge), 1px dark outline, no blood, unsettling but not gory. Top-down 3/4 view.
```

## 2. Zwischensequenzbild (Pflicht)

**Datei:** `public/sprites/ui/scenes/kontrollverlust.png`, **240x135, deckend** (ersetzt den Platzhalter gleichen Namens). Nasses Pflaster bei Nacht, eine einzelne Gaslaterne links, Nebel. In der Mitte kniet die Ermittlerfigur (Mantel, Hut liegt daneben), aus Rücken und Schultern wachsen dunkle Tentakel in den Nebel, Spitzen türkis. Keine Gesichter im Detail, kein Blut. Komposition wie die vorhandenen `E_szene_*.png`.

```
[STYLE BLOCK]
Single illustration, exactly 240x135 pixels, opaque. Night, wet cobblestone street in a foggy Victorian industrial city, one gas lamp at the left casting warm amber light, drifting fog bands. In the center a cloaked investigator kneels on the stones, hat fallen beside them, hands pressed to the ground. From their back and shoulders, six to eight long wet dark violet tentacles rise and curl into the fog, with turquoise (#6fe0d0) suckers and glowing tips. Muted slate blues and soot browns, violet reserved for the tentacles. Melancholic and unsettling, no blood, no text.
```

## 3. Icons der Korruption (Pflicht)

| Datei | Größe | Inhalt |
|---|---|---|
| `public/sprites/items/laeutersalz.png` | 16x16 (+ `items32/laeutersalz.png` 32x32) | Wachspapierbeutel mit grobem grauem Salz, ein Zipfel offen, ein türkiser Funke darüber (ersetzt die Kopie von `bannsalz.png`) |
| `public/sprites/ui/BP_korruption.png` | 16x16, 6 Frames in einer Reihe (96x16) | Frame 0: schwarzer Faden-Knoten mit violettem Schimmer (Abzeichen „korrumpiert“). Frames 1–3: derselbe Knoten, pulsierend (für das Inventar). Frame 4: Faden gelöst, graue Fetzen (gereinigt). Frame 5: eingewickeltes Bündel (beiseitegelegtes Artefakt) |
| `public/sprites/ui/BP_korruption_rahmen.png` | 48x48 9-slice | violett angelaufener Inventarrahmen für korrumpierte Zeilen, 16er-Raster |

```
[STYLE BLOCK]
Icon sheet, 6 frames in one row, each 16x16 pixels, transparent. Frame 1: a knotted black thread with a faint violet glow, like a tiny parasite. Frames 2-4: the same knot pulsing slightly (one pixel of turquoise appearing and vanishing). Frame 5: the thread loosened into grey frayed fibers. Frame 6: a small bundle wrapped in dark cloth tied with string. 1px dark outline, crisp pixels.
```

## 4. Figur-Posen (optional, wenn Zeit bleibt)

`public/sprites/characters/BP_player_korruption.png`, 16x32 pro Frame, 4 Frames in einer Reihe: Ermittler krümmt sich, greift sich an die Schulter, sinkt auf die Knie, liegt. Dieselbe Palette wie `A_player_drink.png`. Dazu die Spieler-2-Figuren `p2a` (Schiebermütze) und `p2b` (Melone) in je einer eigenen Reihe (Sheet 64x96).
