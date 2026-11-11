# Codex-Paket BW: Innenräume und Lesestellen mit Leben (Grafik)

**Batch-Name:** `innen2` (Manifest: `public/sprites/manifest-innen2.json`)

Viele Innenräume (Büro, Revier, Läden, Speisewagen, Akademie, Lohnbüro) sind karg: ein Tileset, wenige Props, keine Bewegung. Du lieferst **animierte Innen-Props, Lesestellen-Close-ups und Möbel-Sets**, die der Einbau über bestehende Räume legt.

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
- Manifest `public/sprites/manifest-innen2.json` wie `manifest-14b.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-innen2-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/preview-innen2.png`.
- Prüfskript (Pillow) unter `tools/art/innen2/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites.


## 1. Animierte Innen-Props (Pflicht)
`props/innen2_anim.png`, 16x16 bzw. 32x32, je 4 Frames: Kaminfeuer (3 Größen), Kerzen (einzeln, Leuchter), Petroleumlampe, Wanduhr mit Pendel, Vogelkäfig mit Kanarienvogel, Schreibmaschine (Taste), Kessel auf Herd, tropfender Hahn, Fliegen um Lampe, Katze schlafend (Ohr zuckt), Hund am Kamin, Schaukelstuhl, Vorhang im Zug, Ventilator, Grammophon mit drehender Platte, Fernschreiber (Papierstreifen). **16 Props**.

## 2. Möbel-Sets (Pflicht)
`props/innen2_moebel_<set>.png` 16x16-Raster, je 32 Zellen für: `buero` (Ermittlerbüro: Aktenregale, Pinnwand, Schreibtisch, Garderobe, Waschtisch), `revier` (Zellen, Pult, Asservatenschrank, Wartebank), `laden` (Theke, Regale mit Waren, Waage, Kasse, Vitrine), `akademie` (Sternglobus, Messingfernrohr, Karten, Lesepult), `speisewagen` (Polsterbänke, Klapptische, Gepäcknetz, Samowar), `lohnbuero` (Schalter, Lohnbrett, Stempeluhr, Kalkbrett). Jeder Satz mit 4 Wandstücken (Tapete, Täfelung, Kalk, Blech) für Übergänge.

## 3. Lesestellen-Close-ups (Pflicht)
240x135, deckend, für das Lesefenster (`ui/scenes/lese_*.png`): Brief auf Schreibtisch, aufgeschlagenes Kassenbuch, Zeitungsseite auf Theke, Wandanschlag mit Reißzwecken, Kalkbrett mit Kreide, Telegrammstreifen, Sternkarte unter Lupe, Lohnzettel im Kuvert, Kinderzeichnung an der Wand, Tagebuchseite mit Wasserfleck. **10 Bilder**, keine Buchstaben (Text ist Platzhalter-Gekritzel).

## 4. Optional
Lichtkegel-Overlays 64x64 für Fenster (Tag/Nacht), Staub im Lichtstrahl 32x64 x 6 Frames.
