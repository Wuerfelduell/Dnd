# Codex-Paket DG: Das eigene Haus (Einrichtung, Trophäenwand, Gäste, Grafik und Texte)

**Batch-Name:** `haus` (Manifest: `public/sprites/manifest-haus.json`) **und** Texte nach `docs/story/eigenes_haus/`

Der Spieler hat bisher ein Büro mit Lager (siehe `src/data/gebaeude.json`, Screens `buero_lager.png`, nur lesen). Neu: ein **eigenes Haus**, das er in Kettlegate erwirbt und das mit ihm „mitzieht“: In jeder späteren Stadt gibt es eine Unterkunft, die dieselbe Einrichtung zeigt (die Erklärung im Spiel: Der Hausrat reist mit, die Wände wechseln). Das Haus hat vier Räume, die der Spieler mit Möbeln, Trophäen und Fundstücken füllt; Figuren mit guter Beziehung kommen zu Besuch; das Tier aus Paket DF wartet hier. Keine Wirtschaftssimulation, kein Bauen: Einrichtung ist Erinnerung und kleine Boni.

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

## Eckdaten (feste IDs)
- Haus-Karte `haus_<city>` (Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt, Varrowmouth; Innen 32x20 Tiles, vier Räume: `stube`, `arbeitszimmer`, `kammer`, `keller`). Außen-Tür auf einer bestehenden Karte je Stadt (Vorschlag im README).
- Einrichtungs-Stücke `haus_<stueck>` (40): je Stück ein Prop, eine Herkunft (Kauf, Quest-Belohnung, Fund, Fasserin), ein Platz-Typ (Wand, Boden, Tisch, Regal), ein kleiner Bonus (Vorschlag: Schlaf stellt mehr Nerven her, Lesestücke geben Hinweise, ein Kräuterbrett lagert Zutaten ohne Gewicht) und ein Satz, den der Spieler beim Ansehen denkt.
- Trophäenwand: Je Boss des Spiels (alle Boss-IDs aus `src/data/encounters.json` und den Packs, nur lesen) eine Trophäe `troph_<boss>` (ca. 30), die nach dem Sieg erscheint.
- Gäste: Figuren mit Beziehung ≥ +4 (Paket AZ, `src/data/packs/beziehungen/`) kommen abends vorbei; 12 Gäste mit festen IDs (6 aus Kettlegate/Wexmoor, 2 Dunscar, 2 Calderwick, 1 Briarholt, 1 Varrowmouth: Tam Verrin), je ein Besuchsgespräch.
- Koop: zwei Betten, zwei Schreibtische, gemeinsame Trophäenwand, ein Gast-Gespräch zu dritt.

## 1. Grafik
- `tilesets/haus_innen.png` (256x256): Böden (Diele, Teppich, Stein), Wände in 6 Stadt-Fassungen (je 3 Wandstücke: Kettlegate Backstein, Wexmoor Torfholz, Dunscar Bahnhofsfliese, Calderwick Terrassenstein, Briarholt Kurhaus-Glas, Varrowmouth nasser Stein), Türen, Fenster (Tag/Nacht), Treppe zum Keller.
- `props/haus_stuecke.png` (512x256, Regionen): die 40 Einrichtungs-Stücke (Sessel, Lesepult, Kräuterbrett, Landkarte der fünf Städte, Pegelglocke, Grammophon ohne Trichter, Akten-Schrank, Waschzuber, Ofen mit 2 Frames, Vorhang, Spiegel mit Alpha-Fläche, Weinregal, Werkbank klein, Tier-Plätze gehören zu DF, Teekessel, Lampe 3 Arten, Bild-Rahmen leer, Schachbrett, Fernrohr am Fenster, Truhe, Reisekoffer, Stiefelbank, Nachttisch, Bett P1, Bett P2, Schreibtisch P1/P2, Bücherstapel, Globus, Uhr, Vitrine, Teppiche 3, Pflanzen 3 (eine welkt in Wexmoor), Moor-Lampe, Register-Seite gerahmt).
- `props/haus_trophaeen.png` (512x128, 32x32 je Trophäe, ca. 30, eine Reihe leer als Platzhalter-Schatten): ein kleines Stück jedes Bosses (Starlings Handschuh, die Glocke der Moorbraut, ein Kalkstück des Schwellenwächters, die Linse des Leuchtfeuerwächters usw.; Boss-Liste nachschlagen).
- `ui/haus_symbole.png` (16x16: Stellen, Aufheben, Drehen, Raum 1 bis 4, Gast, Bonus aktiv, Trophäe neu), `ui/haus_rahmen.png` (Einrichtungs-Menü 9-Slice).
- `fx/haus_umzug.png` (240x135 x 6: Umzugs-Überblende beim Stadtwechsel: Kisten, dann dieselbe Stube mit anderer Wand), `fx/haus_staub.png` (16x16 x 4, beim Stellen).
- Außen: `props/haus_tueren.png` (6 Türen 16x32 mit Schild ohne Text, je eine Stadt).

## 2. Texte (`docs/story/eigenes_haus/`)
- `haus.json`: Kauf-Szene in Kettlegate (Maklerin `haus_maklerin`, 10 bis 14 Zeilen, Preis-Vorschlag 600 Schilling, ab Fall 4), Umzugs-Texte je Stadt (6 x 3 Zeilen), Raum-Beschreibungen (4 x 3 Sätze je Stadt-Fassung = 72 kurze Texte), 40 Stücke mit Name, Herkunft, Platz-Typ, Bonus-Vorschlag, Ansehen-Satz, 30 Trophäen mit Satz.
- `gaeste.json`: 12 Gäste, je Besuchsgespräch (8 bis 12 Zeilen, ein Entscheidungsknoten: Tee, Geschichte, Frage nach dem Fall), Bedingung (Beziehung, Flag), ein mitgebrachtes Geschenk (bestehendes Item), Koop-Variante für 3 Gäste.
- `gedanken.json`: 40 Zeilen, die der Spieler beim Nachhausekommen denkt (je Stadt, Tageszeit, nach Bossen, nach Enden), 10 Koop-Zeilen.
- `zeitung.json` (4), `gerede.json` (20), README mit Mechanik-Spezifikation (Stellen als Raster 16x16, Platz-Typen, Boni als Flags `haus_bonus_<stueck>`, Gäste-Takt: höchstens ein Gast je Abend, Trophäen automatisch, Haus pro Stadt dieselbe Daten-Instanz).

## 3. Abgabe
Grafik mit Manifest, `tools/art/haus/check.py`, Validation, Preview; Texte mit `README.md`, `pruefen.mjs`; Pull Request mit Prüf-Ausgaben.
