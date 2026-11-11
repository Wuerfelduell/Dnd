# Codex-Paket DM: Oberfläche 3 (Titel je Kapitel, Ladebilder, Abspann, Spielstand-Karten, Umschläge, Barrierefreiheit)

**Batch-Name:** `oberflaeche3` (Manifest: `public/sprites/manifest-oberflaeche3.json`)

Dritte Oberflächen-Runde nach AE (Titel-Ebenen, Kapitelkarten, Touch-Icons) und den HUD-Teilen der späteren Pakete. Du lieferst **Titelbilder je Kapitel**, Ladebild-Illustrationen, Spielstand-Karten, den Abspann-Rahmen, Umschlag-Icons für die Post (Paket DI), Titel-Varianten nach dem Nachspiel (DK) und die Grafik für größere Schrift und Farbenblind-Modus. Nur Grafik; Texte liegen in den genannten Paketen. Muster: `public/sprites/manifest-oberflaeche.json`, `ui/` (nur lesen).

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
- Manifest `public/sprites/manifest-<batch>.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-<batch>-preview.png`.
- Prüfskript (Pillow) unter `tools/art/<batch>/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-<batch>-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

## 1. Titelbilder je Kapitel (`ui/titel_k<n>_<ebene>.png`, 480x270)
Das Titelbild besteht aus Ebenen (Himmel, Stadt, Vordergrund, Nebel; siehe AE). Je Kapitel 1 bis 6 ein Satz aus vier Ebenen, der die aktuelle Stadt zeigt: Kettlegate (Gaslaternen, Uhrturm), Wexmoor (Torf, Salzmarkt, Floßfriedhof), Dunscar (Endbahnhof, Kalk), Calderwick (Terrassen, Schrägaufzug), Briarholt (Kurhaus, Dampf, kalt und warm als zwei Vordergrund-Ebenen), Varrowmouth (Pegeluhr, Nebelmeer, Ebbe und Flut als zwei Himmel-Ebenen). Kapitel 6 aus Paket CW ersetzt dein K6 nicht: dort ist ein Einzelbild, hier die Ebenen. Dazu `ui/titel_nachspiel_<n>.png` (6 Vordergrund-Varianten für das Nachspiel: die Stadt bei Morgenlicht, je nach Zustand aus DK) und `ui/titel_verzicht.png`.

## 2. Ladebilder (`ui/laden_<n>.png`, 240x135 opak, 24 Bilder)
Kleine Illustrationen für Ladebildschirme und Reisen: je Stadt 3 (eine Straßenecke, ein Innenraum, ein Gegenstand), je Reiseart 1 (Nachtzug, Torfkahn, Küstenbahn, Fähre, Landstraße, Boot). Ohne Figuren oder mit Rückenfiguren. Zusammen mit `ui/laden_rahmen.png` (9-Slice) und `ui/laden_punkte.png` (16x16 x 4, Lade-Anzeige als wandernde Laterne).

## 3. Spielstand-Karten (`ui/spielstand_<city>.png`, 96x54, 6 Stück; `ui/spielstand_rahmen.png`, 9-Slice; `ui/spielstand_marken.png`, 16x16)
Je Stadt ein Mini-Bild für die Spielstand-Übersicht, Marken: Kapitel 1 bis 6, Koop, Pfad-Emblem-Platz, Sequenz-Zahl-Platz (ohne Zahl), Nachspiel, Verzicht, Seq 1.

## 4. Abspann (`ui/abspann_rahmen.png`, 480x270 mit Alpha-Fenster für den scrollenden Text; `ui/abspann_trenner.png`, 128x16 x 6 Ornamente; `ui/abspann_schluss.png`, 480x270: eine Laterne, die ausgeht, 8 Frames)
Der Hintergrund für Kapitel 6 liegt in Paket CW; hier Rahmen, Trenner und das letzte Bild. Dazu `ui/abspann_dank.png` (240x135: leere Tafel für Dankestexte).

## 5. Post und kleine Symbole (`ui/post_symbole.png`, 16x16 + 32x32)
Umschlag geschlossen, geöffnet, mit Siegel je Stadt (6 Siegel), Paket, Antwort gesendet, Brief ohne Absender (schwarz-türkis), Foto-Rahmen; dazu `items/post_foto_1.png` bis `_6.png` (16+32: sechs kleine Fotografien, bräunlich, unterschiedliche Rahmen, zeigen Silhouetten).

## 6. Barrierefreiheit
- `ui/schrift_gross.png`: die Spielschrift (siehe `ui/`-Font-Sheet, nur lesen) in doppelter Höhe neu gezeichnet (nicht skaliert), gleicher Zeichenvorrat inkl. Umlaute und ß.
- `ui/farben_symbole.png` (16x16): Symbole, die im Farbenblind-Modus Farben ersetzen: Leben, Nerven, Unruhe, Verdauung, Gift, Brand, gefesselt, geblendet, verzeichnet, Gezeit Ebbe/Flut, Beziehung drei Stimmungen, Zirkel-Marken (6), Pfad-Marken (10) als Formen statt Farben.
- `ui/cursor_gross.png` (32x32 x 4) und `ui/touch_icons_gross.png` (doppelte Größe der Touch-Icons aus AE).

## 7. Abgabe
PNGs, Manifest (Ebenen-Reihenfolge je Kapitel mit Parallax-Faktor-Vorschlag, Regionen, Atlas-Index), `tools/art/oberflaeche3/check.py`, Validation, Preview, README-Ergänzung, Pull Request.
