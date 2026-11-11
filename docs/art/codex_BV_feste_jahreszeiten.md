# Codex-Paket BV: Jahreszeiten und Feste (Grafik)

**Batch-Name:** `feste` (Manifest: `public/sprites/manifest-feste.json`)

Die Spielzeit läuft bereits (Tag/Nacht, Zeitung, geheime Treffen), aber die Welt sieht immer gleich aus. Du lieferst **vier saisonale Überlagerungen** und **drei Stadtfeste**, die der Einbau später nach Spielzeit über die vorhandenen Karten legt. Keine Tiles werden ersetzt; alles sind Zusatz-Props, Partikel und Oberflächenbilder.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat.

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

### 0.2 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, genau mit den Namen unten.
- Manifest `public/sprites/manifest-feste.json` wie `manifest-14b.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-feste-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/preview-feste.png`.
- Prüfskript (Pillow) unter `tools/art/feste/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites.


## 1. Jahreszeiten als Überlagerung (Pflicht)
Je Jahreszeit ein Sheet `fx/saison_<name>.png` 16x16 x 12 Zellen (Boden-Deko, die auf Pflaster/Planken/Kalk gelegt wird) und ein Partikel-Sheet 64x64 x 6 Frames:
- `herbst`: nasses Laub in Rinnsteinen, Kastanien, Pfützen mit Blattrand; Partikel fallende Blätter.
- `winter`: Reif auf Pollern, Schneematsch-Ränder, Eiszapfen an Laternen, zugefrorene Pfützen; Partikel Schneetreiben, Atemwolken 8x8 x 4 (eigene Datei).
- `fruehling`: Moosflecken, Löwenzahn in Fugen, Vogelnester, Tauwasser; Partikel Blütenstaub und Regen.
- `sommer`: Staub, trockene Grasbüschel, Hitzeflimmern als 2-Frame-Overlay 480x270, Fliegenschwärme.
Dazu je Jahreszeit 4 Fassaden-Zusätze 32x32 (Girlande, Schneehaube, Blütenkasten, Sonnensegel) für Kettlegate, Wexmoor und Dunscar (12 Zellen).

## 2. Drei Feste (Pflicht)
| Fest | Stadt | Props 16x16 (16 Zellen) | Groß 32x32 (6) | Sequenzbild 240x135 |
|---|---|---|---|---|
| Laternennacht | Kettlegate | Papierlaternen (4 Farben, 2 Frames), Buden, Girlanden, Kerzenboote im Kanal | Bühne, Glühweinkessel, Feuerkorb | Kanal voller Lichter unter Nebel |
| Salzsegen | Wexmoor | Salzkränze, Bojenketten, Netzgirlanden, Fischräucherstand | geschmückter Kahn, Salzkönigin-Thron aus Fässern | Prozession der Kähne vor dem Leuchtturm |
| Schichtwechsel | Dunscar | Kalkmarkierungen, Blechblasinstrumente, Lohntüten, Bierfässer | Drehorgel, Boxring aus Seilen, Kohlenfeuer | Arbeiter auf der Drehscheibe im Laternenlicht |
Je Fest: 4 Festbesucher-Lauf-Sheets 64x128 (generische Gäste mit Festdetail), 6 Gerede-Symbole 16x16 für Sprechblasen (Musik, Trinken, Lachen, Streit, Kuss, Schlaf), ein UI-Banner 192x32 für die Zeitungs-/HUD-Ankündigung.

## 3. Optional
Feuerwerk `fx/feuerwerk.png` 64x64 x 8 Frames in 3 Farben (nur Kettlegate); Schneemann und Eisbahn als 32x32-Props.
