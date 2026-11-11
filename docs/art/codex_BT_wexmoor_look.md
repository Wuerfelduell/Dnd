# Codex-Paket BT: Wexmoor sieht endlich nach Wexmoor aus (Tilesets, Fassaden, Props, Wetter)

**Batch-Name:** `wexmoor8` (Manifest: `public/sprites/manifest-wexmoor8.json`)

Wexmoor (Kapitel 2, „Die Moorstadt“) nutzt heute größtenteils Kettlegate-Ziegel, Kettlegate-Pflaster und Kettlegate-Gaslaternen; die Karten sehen aus wie ein weiterer Stadtteil. Wexmoor soll **sofort erkennbar anders** sein: eine Stadt **auf Pfählen und Torf**, halb versunken, salzverkrustet, aus geteertem Holz, Flechtwerk und Kalkstein, mit Bojenlaternen statt Gaslaternen, Planken statt Pflaster, schwarzem Moorwasser zwischen den Häusern, Schilf, Nebelbänken und einem weiß getünchten Leuchtturm am Horizont. Du lieferst **Austausch-Tilesets im gleichen Zellenraster** plus neue Fassaden, Props, Wetter und Stadtkarten-Hintergrund. Kettlegate bleibt unangetastet.

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
- Manifest `public/sprites/manifest-wexmoor8.json` wie `manifest-14b.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-wexmoor8-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/preview-wexmoor8.png`.
- Prüfskript (Pillow) unter `tools/art/wexmoor8/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites.

### 0.4 Zellenraster (wichtig, sonst passt nichts)
Die Karten in `src/data/wexmoor.json` benennen Tiles über Themen (`r_wexmoor`, `r_oberstadt`, `r_salzmarkt`, `r_torf`, `c_bahnhof`, `r_akademie`, `r_lucent`, `r_wachhaus`, `r_leuchtturm`, `r_zelle`, `s_salzwatt`, `v_glocke`, `w_altstadt`, `r_vergessmoor`, `q_kajuete`). Welche Zelle welches Tile ist, steht in `src/world/assets.js` (`TILE_CELLS`, `THEME_TILE_LIST`, `FACADES`, `PROP_CELLS`) und den Manifesten `manifest-wexmoor*.json`. **Lies diese Tabellen und liefere neue Sheets mit identischen Maßen und identischer Zellbedeutung** (gleiche Datei-Namen mit Suffix `_v2`, z. B. `tilesets/R_wexmoor_tiles_v2.png`). Der Einbau tauscht dann nur den Pfad. Wo ein Thema heute auf ein Kettlegate-Sheet zeigt, legst du ein neues Sheet mit derselben Zellbelegung an und notierst im Manifest, welches Thema es ersetzt.

## 1. Tilesets (Pflicht): Boden und Wände

| Datei | Ersetzt | Look |
|---|---|---|
| `tilesets/R_wexmoor_tiles_v2.png` | `r_wexmoor` (Bojenhafen, Pfahldorf) | geteerte Planken mit Salzrand, Pfahlköpfe, schwarzes Wasser mit Ölschimmer, Schilfufer, Treibholzstege, Flechtwerkwände, Teerfässer-Mauern. Keine Ziegel. |
| `tilesets/R_oberstadt_tiles_v2.png` | `r_oberstadt` | Kalkstein-Platten mit Moosfugen, weiß getünchte Mauern mit Salzausblühung, schmiedeeiserne Geländer über dem Wasser, Entwässerungsrinnen, Treppen nach oben. Der einzige „steinerne“ Teil, aber hell und feucht, nicht Kettlegate-braun. |
| `tilesets/R_salzmarkt_tiles_v2.png` | `r_salzmarkt` | Salzkruste auf Holz, Marktbohlen, Salzhaufen als Boden, Sackkarren-Spuren, Planen-Schatten, Fischschuppen-Glitzer. |
| `tilesets/R_torf_tiles_v2.png` | `r_torf` | Torfstich: schwarze Erdstufen, Torfsoden gestapelt, Bohlenwege, Moorwasserlöcher, Wollgras, Loren-Schienen aus Holz. |
| `tilesets/C_bahnhof_wexmoor_v2.png` | `c_bahnhof` nur in Wexmoor | Güterbahnhof auf Pfählen: Holzrampen, nasse Kohle, Schleusentore, Schienen auf Dämmen. |
| `tilesets/R_innen_wexmoor_v2.png` | `r_innen`, `r_akademie`, `r_lucent`, `r_wachhaus`, `r_zelle`, `q_kajuete` | Innenräume aus Schiffsholz: geteerte Dielen, Bullaugen, Kalkwände, Tauwerk, Salzlampen; Akademie mit Messing und Sternkarten; Zelle mit nassem Stein. Gleiche Zellen, anderes Material. |
| `tilesets/R_leuchtturm_tiles_v2.png` | `r_leuchtturm` | weiß getünchte Rundmauern, Wendeltreppenstücke, Gischt, schwarze Felsen. |
| `tilesets/R_vergessmoor_tiles_v2.png` | `r_vergessmoor`, `s_salzwatt` | Nebelmoor und Watt: Wasserspiegel mit Himmel, Pricken, Muschelbänke, versunkene Pfähle, Irrlicht-Stellen (türkis, sparsam). |

Alle Übergangstiles (Wasser↔Planke, Torf↔Bohle, Salz↔Holz) im gleichen Schema wie bisher. Wasser und Nebel mit 4-Frame-Animation dort, wo das alte Sheet animiert war.

## 2. Fassaden und Gebäude (Pflicht)
`facades/wexmoor_v2_*.png`, gleiche Maße wie die bisherigen Wexmoor-Fassaden in `FACADES`: Pfahlhäuser mit geteerten Bretterwänden und Reetdach, Fensterläden, Bojenlaterne am Giebel; Kalkstein-Oberstadt-Häuser mit Salzflecken; Salzspeicher mit Kranbalken; Wachhaus mit Laternenturm; Akademie-Kuppel aus Kupfergrün; Lucents Haus mit Glasveranda; die Ertrunkene Glocke als halb versunkener Kirchturm; Altstadt-Ruinen mit Wasserlinie an den Wänden. Mindestens **18 Fassaden**, davon 6 mit beleuchteter Nachtvariante (Fenster warm, zweite Datei `_nacht`).

## 3. Props und Straßenmöbel (Pflicht)
`props/wexmoor_v2_props.png` (16x16-Raster, 48 Zellen) und `props/wexmoor_v2_gross.png` (32x32, 16 Zellen): Bojenlaternen (an, aus), Pfahlpoller, Taurollen, Salzfässer, Torfkarren, Netze, Reusen, Fischkisten, Planken-Geländer, Gangways, Pricken, Nebelhorn, Kahn (groß), Torfstapel (groß), Kran (groß), Schleusenrad (groß). 6 davon animiert (Laternenflackern, Netz im Wind, Wasser im Reusenkorb) als `props/wexmoor_v2_anim.png` 16x16 x 4 Frames.

## 4. Wetter, Nebel, Tiere (Pflicht)
- `fx/wexmoor_v2_wetter.png` 64x64, 4 Reihen x 6 Frames: Nebelbank (kriecht), Nieselregen, Seewind (Gischtfetzen), Irrlicht (sparsam türkis). Ersetzt die Kettlegate-Nebelkacheln auf Wexmoor-Karten.
- `fx/wexmoor_v2_tiere.png` 16x16, 6 Tiere x 4 Frames: Möwe, Reiher, Moorfrosch, Wasserratte, Nebelkrähe, Aal im Wasser (nur Rücken).
- `ui/wexmoor_v2_stadtkarte.png` 480x270, deckend: neue Stadtkarte von Wexmoor als Seekarte auf Pergament mit Wasserlinien, Pfahlfeldern, Bojen, Leuchtturm; Viertelgrenzen wie die heutige Karte (gleiche Pin-Positionen, siehe `src/data/wexmoor.json` → Pins). Dazu `ui/wexmoor_v2_nebel.png` 480x270 als Nebelüberlagerung für unentdeckte Viertel.

## 5. Optional, wenn Zeit bleibt
- Tageszeit-Varianten der Wasser-Tiles (Abendlicht), 4 Sequenzbilder 240x135 (Ankunft am Güterbahnhof, Salzmarkt im Nebel, Leuchtturm bei Sturm, versunkene Altstadt).
- Ein Prüfbild: `docs/art/preview-wexmoor8.png` mit jeder Karte einmal im alten und neuen Look (Codex darf dafür die Karten lokal rendern, aber nichts committen außer dem Bild).

## 6. Prüfung
`tools/art/wexmoor8/check.py` vergleicht jedes `_v2`-Sheet mit dem ersetzten Original: gleiche Maße, gleiche Anzahl Zellen, transparente Zellen an denselben Stellen; Palette max. 32 Farben, keine Kettlegate-Ziegelfarbe (`#5a3a2a`-Familie) auf Wexmoor-Bodentiles.
