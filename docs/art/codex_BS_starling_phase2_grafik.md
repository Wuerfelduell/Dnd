# Codex-Paket BS: Starling, zweite Phase (Grafik für das Finale von Kapitel 1)

**Batch-Name:** `starling2` (Manifest: `public/sprites/manifest-starling2.json`)

Professor Lucius Starling ist der Endgegner von Fall 9 „Der Sternsammler“ (Kampf `starling_fight`, Sheet `battle/starling.png` 96x96, Animationen `brennglas`, `sternregen`, `gestohlene_stimme`, `geliehener_schatten`, `fallender_stern_defeat`; Boss-Büste `X_08_boss_starling` 160x160; Kulisse `bg_sternwarte`). Der Kampf bekommt eine **zweite Phase**: Bei halbem Leben zerbricht Starlings Brennglas, die gesammelten Sterne der acht Fälle fahren in ihn, und er wird zum **Sternsammler**: ein Körper aus Teleskopmessing, Glas und geliehenem Licht, der die Sternwarte selbst mitbewegt. Du lieferst alle Grafik der zweiten Phase; Zahlen und Fähigkeiten legt der Einbau fest. Alles Vorhandene bleibt, Phase 1 wird nicht ersetzt.

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
- Manifest `public/sprites/manifest-starling2.json` wie `manifest-14b.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-starling2-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/preview-starling2.png`.
- Prüfskript (Pillow) unter `tools/art/starling2/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites.

Stilreferenz unbedingt mitgeben: `battle/starling.png`, `battle/X_08_boss_starling.png`, `battle/bg_sternwarte.png`, Portraits `portraits/astronom_emotions.png` und das verblasste Set.

## 1. Der Sternsammler (Pflicht)

| Datei | Format | Inhalt |
|---|---|---|
| `battle/starling2.png` | 128x96 je Frame, 7 Reihen x 8 Spalten | Reihen: `idle` 4 (schwebt, Messingringe kreisen), `attack` 6 (**Sternlanze**: zieht ein Lichtbündel aus dem Brustglas, die ersten zwei Frames identische Ausholpose), `special` 6 (**Acht Ernten**: acht kleine Sterne der Fälle 1–8 steigen auf und stürzen), `cast` 6 (**Linsenwand**: Glasscheiben drehen sich vor ihn, Panzer), `hit` 3, `phase_in` 8 (Verwandlung: Brennglas zerbricht, Licht fährt in Brust und Augen, Körper streckt sich; wird einmal zwischen Phase 1 und 2 gespielt), `defeat` 6 (Licht entweicht als acht Sterne nach oben, zurück bleibt der alte Mann auf den Knien, **nicht tödlich**). Figur unten mittig, Überhang nach oben für Ringe und Sterne. |
| `battle/X_08_boss_starling2.png` | 160x160 | Büste der zweiten Phase: Starlings Gesicht halb Messing, ein Auge Linse, Sternlicht in den Falten, Kragen aus Teleskopsegmenten; melancholisch, nicht monströs. |
| `battle/bg_sternwarte2.png` | 480x270, deckend | Dieselbe Sternwarte wie `bg_sternwarte`, aber die Kuppel ist aufgerissen, die Sternkarte an der Wand leuchtet an acht Stellen, Papiere schweben, violettes und türkises Licht, Boden geneigt. |
| `fx/starling2_fx.png` | 48x48, 5 Reihen x 6 Frames | `stern_fall` (einzelner Stern schlägt ein), `linse` (Glasscheibe erscheint und splittert), `lanze_treffer`, `ernte_aufstieg` (kleiner Stern steigt), `glas_bruch` (Brennglas zerspringt, für den Übergang). |
| `fx/starling2_sterne.png` | 16x16, 8 Zellen + 4 Frames Funkeln | Die acht Sterne der Fälle 1–8 als eigene Symbole (Glocke, Glasauge, Theatermaske, Uhrzeiger, Nordtorschlüssel, Gaswerkflamme, Villa-Spiegel, Elend-Kerze), jedes in Sternform mit Innenzeichen; dazu 4 Frames Funkeln als Schleife. |
| `ui/starling2_hud.png` | 192x48 | HUD-Streifen für die zweite Phase: Rahmen für die Boss-Leiste mit acht Sternsockeln (leer/gefüllt, 2 Zeilen), Symbol „Linsenwand aktiv“, Symbol „Stern verbraucht“. |
| `portraits/starling2_emotions.png` | 256x64 | Vier Stimmungen des Sternsammlers (neutral, triumphierend, zweifelnd, erloschen) für die Zwischenrede bei halbem Leben und das Ende. |
| `ui/scenes/starling_phase2.png` | 240x135, deckend | Zwischensequenz: Starling im zerbrechenden Licht unter der offenen Kuppel, Komposition wie `E_szene_*.png`. |

Prompt-Kern (englisch, nach dem Style-Block): „an elderly astronomer transformed by stolen starlight: half his face and chest replaced by brass telescope segments and curved lenses, pale turquoise light inside the glass, floating brass rings orbiting him, violet shadows, torn observatory dome behind. Melancholic, unsettling, not gory.“

## 2. Optional, wenn Zeit bleibt
- `battle/starling2_boden.png` 480x64: Bodenstreifen mit geneigtem Parkett und gleitenden Papieren als zweite Ebene vor der Kulisse (Parallaxe).
- `fx/starling2_kuppel.png` 480x135, 6 Frames: Kuppelriss, der im Takt des Kampfes aufleuchtet.
- Koop: zwei 48x48-Symbole `ui/starling2_koop.png` für „Stern gefangen von Spieler 1/2“.

## 3. Manifest
`manifest-starling2.json` enthält für `starling2` die Reihennamen genau wie oben, `frameRate` 8 (idle 6, phase_in 6), `repeat` nur bei idle, Ankerpunkt (Bodenmitte), für `bg_sternwarte2` die beiden Lichtzonen als Regionen und für `starling2_sterne` die acht Zellen mit Fall-Nummer.
