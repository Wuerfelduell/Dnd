# Codex-Paket DV: Figuren des Kalten Ofens und Flickerin Hanne Saum

**Batch-Name:** `kalterofen` (Manifest: `public/sprites/manifest-kalterofen.json`)

Die Mitglieder des neuen Dunscar-Zirkels **Der Kalte Ofen** (alter Kalkofen hinter dem Kalkmarkt, Alchemie und Halbgott-Formeln) und die Flickerin **Hanne Saum**, die bei allen drei Dunscar-Treffen korrumpierte Stücke flickt, laufen mit **umgefärbten Platzhaltern** (`src/data/dunscarZirkel.js`, nur lesen). Dieses Paket ersetzt deren Lauf-Sheets und liefert Köpfe.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat. Halte das Paket klein: keine optionalen Extras, keine Varianten, die nicht unten stehen.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial world with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
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
- Manifest `public/sprites/manifest-kalterofen.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-kalterofen-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-kalterofen-preview.png`.
- Prüfskript (Pillow) unter `tools/art/kalterofen/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-kalterofen-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

**Stil-Referenz:** `characters/ds_einwohner_1.png`, `characters/k3_*_walk.png` (Dunscar-Bewohner), Köpfe wie `portraits/heads/wx_pfandleiherin.png`. Dunscar-Look: Kalkstaub, Ruß, Arbeitskleidung der Bahn, Lichtfarbe dieses Zirkels warmes Glut-Orange (#ff9a5a) nur als Akzent.

## 1. Figuren (5 IDs, fest, Code existiert)
Je Figur: `characters/<id>_walk.png` (64x128, 4 Richtungen unten/links/rechts/oben x 4 Frames, Grundlinie y=30; vorhandene Datei überschreiben) **und** `portraits/heads/<id>.png` (24x24). Jede Figur muss in 16x32 an Silhouette erkennbar sein (Hut/Haar/Werkzeug), nicht nur an Farbe.
| ID | Name, Rolle | Mantelfarbe im Code | Aussehen |
|---|---|---|---|
| `dsz_ofenmutter` | Ofenmutter Selma Grau, Hüterin | #6a3a2a | ältere breite Frau, lederne Ofenschürze, Haar unter Kopftuch, Schürhaken am Gürtel |
| `dsz_brenner` | Jonas Brenn, Kalkbrenner | #5a4a3a | kräftig, Ruß im Gesicht, Ärmel hochgekrempelt, Hammer über der Schulter |
| `dsz_aschenleserin` | Ilse Aschgrund, Aschenleserin | #4a3a5a | hager, langer violettgrauer Umhang, Blech mit Asche in der Hand, graue Fingerkuppen |
| `dsz_loeschmeister` | Ruben Lösch, Löschmeister | #3a4a3a | alter Feuerwehrhelm mit Delle, Eimer voller Münzen in der Hand |
| `dsz_flickerin` | Hanne Saum, Flickerin | frei | Frau mit Kalkstaub im Haar, Flickenweste, lange Nadel im Mundwinkel, Nähtasche, sitzt oft auf einer Kiste |

Zusatz nur für die Flickerin: `characters/dsz_flickerin_sit.png` (16x32, 2 Frames = 32x32, sitzend auf Kiste, nähend). Ergebnis: 11 PNGs.

## Prüfskript und Abgabe
- `tools/art/kalterofen/check.py` (Pillow): alle unten genannten Dateien vorhanden, Maße exakt, binäres Alpha, höchstens 32 Farben, keine Datei pixelgleich mit dem bisherigen Platzhalter (vorher per `git show HEAD:<pfad>` vergleichen, wo eine Datei ersetzt wird). Bericht `docs/art/batch-kalterofen-validation.json`.
- `docs/art/batch-kalterofen-preview.png`, `docs/art/batch-kalterofen-generation.json`, kurze README-Ergänzung.
- Pull Request nur mit deinen Dateien und der Ausgabe des Prüfskripts. Keinen Spielcode ändern.
