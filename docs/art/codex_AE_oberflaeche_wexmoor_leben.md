# Codex-Batch AE: Einstellungen, Touch-Knöpfe, Titelbild, Zeitungen, Leben in Wexmoor

**Batch-Name:** `oberflaeche` (Manifest: `public/sprites/manifest-oberflaeche.json`)

Das Spiel bekommt bald Ton, läuft jetzt auch auf dem Handy und soll Zeitungen und Passanten-Gerede zeigen. Dafür fehlen Grafiken: Symbole fürs Einstellungsmenü, gezeichnete Touch-Knöpfe, ein animiertes Titelbild in Ebenen, Kapitel-Titelkarten, Zeitungsrahmen und Sprechblasen, und mehr Tierleben und Wetter für Wexmoor.

**Schon fertig oder anderswo, nicht neu machen:** alles aus den Batches A bis V, **Batch W** (Versunkene Altstadt) und **Batch X** (Treffen-Artefakte, Platzhalter, Fall 9), die laufen gerade parallel. Vor Abschnitt 5 und 6 bitte `public/sprites/fx/C_08_creatures.png` und `C_08_weather.png` ansehen: Was es dort schon gibt (Kettlegate-Tiere, Regen), nicht noch einmal machen.

**Hinweis Setting:** Wo der Style-Block „Kettlegate“ sagt, gilt für die Wexmoor-Teile (Abschnitt 4 Kapitel 2, 5, 6) die versinkende Moorstadt Wexmoor: Torf, Reet, Schlick, Salz, Bojen, Nebel, ein Leuchtturm weit draußen im Moor.

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
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Ordner und Dateinamen stehen bei jedem Asset.
- Ein Manifest `public/sprites/manifest-oberflaeche.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`. Für Knöpfe und Symbole: Name jeder Zelle (`regions`).
- Die tatsächlich verwendeten Prompts in `docs/art/batch-oberflaeche-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat.

### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



---

## 1. Einstellungen und Ton (`public/sprites/ui/AE_einstellungen.png`)
Ein Sheet mit 16x16-Symbolen, 8 Spalten, Reihenfolge = Namen:
`lautstaerke`, `stumm`, `musik`, `effekte`, `vollbild`, `fenster`, `steuerung`, `speichern`, `laden`, `zurueck`, `zahnrad`, `info`, `beenden`, `pause`, `weiter`, `handy`.
```
[STYLE BLOCK]
UI icon sheet, 16x16 px per icon, 8 columns x 2 rows, transparent background, each icon centered with 1px padding: brass speaker with sound waves, brass speaker crossed out, music note on a small brass plate, a small bell with a spark (sound effects), four corner brackets pointing outward (fullscreen), four corner brackets pointing inward (window), a gamepad-like brass control box with two knobs, a wax-sealed envelope (save), an opened envelope (load), a curved arrow pointing left, a brass cogwheel, a small round lens with an i-shaped dot made of two pixels (no letter), a door with an arrow leaving (quit), two vertical bars on a brass button (pause), a triangle on a brass button (continue), a small handheld slate with buttons (mobile). Victorian brass and paper look, 1px dark outline.
```
Dazu Schieberegler (`public/sprites/ui/AE_regler.png`): Schiene als 9-slice 48x16 (Messing-Rille) + gefüllter Teil 48x16 (Bernstein-Glimmen) + Knopf 16x16 in normal und gedrückt, und eine Ankreuz-Box 16x16 leer/angekreuzt (Häkchen als Tintenstrich).

## 2. Touch-Knöpfe fürs Handy (`public/sprites/ui/AE_touch.png`)
Runde Messingknöpfe 32x32, jeder in zwei Zuständen (normal, gedrückt = 1px tiefer, dunkler, leichter Bernstein-Rand). Reihe 1 normal, Reihe 2 gedrückt, 10 Spalten:
`aktion` (Hand), `geistsicht` (Auge mit türkisem Iris), `notizbuch`, `inventar` (Ledertasche), `karte`, `angriff` (Spazierstock), `ausweichen` (Pfeil zur Seite mit Bewegungslinien), `parieren` (gekreuzte Stöcke), `faehigkeit` (Funken in Violett), `gegenstand` (Fläschchen).
```
[STYLE BLOCK]
Round touch-screen buttons for a mobile version, 32x32 px each, 10 columns x 2 rows. Each button: a round brass disc with a dark inset center and a simple pictogram inside: open hand, eye with turquoise iris, small notebook, leather satchel, folded map, walking cane, sidestep arrow with motion lines, two crossed canes, violet sparks, small potion flask. Row 1 normal state; row 2 the same buttons pressed: shifted 1px down, slightly darker, thin warm amber rim. Readable at small size, strong silhouette, transparent background.
```
Dazu ein **Steuerkreuz** für die linke Seite: Grundplatte 64x64 (Messingring mit vier angedeuteten Richtungen) und Daumen-Knopf 24x24 (normal + gedrückt), als `AE_stick.png` (64x64 + 2x 24x24 rechts daneben, Rest transparent).

## 3. Titelbild in Ebenen (`public/sprites/ui/AE_titel/`)
Das vorhandene Titelbild `ui/07_06_title.png` ansehen und denselben Blick auf Kettlegate in **getrennten Ebenen** für Parallax und Animation bauen, jede 480x270 (Himmel deckend, alle anderen transparent):
- `ebene_0_himmel.png`: Nachthimmel mit Wolkenbändern, deckend.
- `ebene_1_mond.png`: verschleierter Mond, 2 Frames sehr leichtes Pulsieren (Sheet 960x270).
- `ebene_2_ferne.png`: ferne Dächer, Schornsteine, Uhrturm als Silhouette.
- `ebene_3_nebel.png`: Nebelband, **horizontal kachelbar** (linker und rechter Rand passen).
- `ebene_4_stadt.png`: nähere Häuser mit Fenstern; dazu `ebene_4_fenster.png`: nur die erleuchteten Fenster, 4 Frames, in denen einzelne Fenster an- und ausgehen (Sheet 1920x270).
- `ebene_5_vorne.png`: Geländer, Gaslaterne links vorne; `ebene_5_laterne.png` Flammen-Flackern 4 Frames 16x16.
- `ebene_6_regen.png`: Regen-Overlay, kachelbar, 4 Frames (Sheet 1920x270), sehr dünne Striche.
```
[STYLE BLOCK]
Title screen of the game split into separate parallax layers, each 480x270 px, same composition as the attached existing title image: night sky with cloud bands (opaque), veiled moon, distant rooftops with chimneys and a clock tower silhouette, a horizontally tileable fog band, nearer houses with lit windows, foreground iron railing with a gas lamp on the left, thin rain overlay. Layers must align exactly when stacked. No text, no logo.
```

## 4. Kapitel-Titelkarten (`public/sprites/ui/scenes/`)
Je ein Bild 480x270, deckend, **ohne Text** (Titel setzt das Spiel darüber), unteres Drittel ruhig und dunkel für die Schrift:
- `kapitel1_karte.png`: Kettlegate im Morgennebel vom Kanal aus, ein Polizeirevier mit Laterne, Uhrturm im Hintergrund.
- `kapitel2_karte.png`: Ankunft in Wexmoor: Bretterbahnsteig auf Pfählen, Moor bis zum Horizont, weit draußen das kreisende Licht des Leuchtturms.
- `kapitel_ende.png`: ein geschlossenes Notizbuch mit Siegel auf einem Schreibtisch, Kerze fast heruntergebrannt (für Kapitel-Ende und Abspann).

## 5. Zeitungen und Gerede (`public/sprites/ui/AE_zeitung.png` und Deko)
- Zeitungsseite als **9-slice** 48x48 (vergilbtes Papier, gedruckte Linien-Ränder, Knick in der Mitte), dazu zwei **Kopfzeilen-Ornamente** 160x24 ohne Buchstaben: Kettlegate (Uhrturm-Wappen mit Ranken) und Wexmoor (Leuchtturm im Kreis, Wellenlinien). Die Schrift setzt das Spiel.
- Ein Platzhalter-Foto-Rahmen 64x48 (Raster-Druck, Sepia), 4 Varianten: Polizeiwache, Menschenmenge, Hafen, Leuchtturm.
- **Sprechblase** für Passanten-Gerede: 9-slice 24x24 (Papierweiß mit Outline) + Zipfel 8x8 nach unten, dazu eine „Gedanken“-Variante mit Wölkchen-Rand.
- Deko-Sprites 16x32 (`public/sprites/props/AE_zeitung.png`, 4 Spalten): Zeitungsständer Kettlegate, Zeitungsjunge-Kiste mit Stapel, Wexmoor-Anschlagpfahl mit nassem Zeitungsblatt, Zeitungsfetzen am Boden (16x16 unten in der Zelle).

## 6. Leben in Wexmoor (`public/sprites/fx/AE_wexmoor_tiere.png` und `AE_wexmoor_wetter.png`)
Tiere, je eine Animation pro Reihe, Frames nebeneinander:
| Tier | Größe | Animationen |
|---|---|---|
| Moorfrosch | 16x16 | sitzen (2 Frames, Kehle bläht sich), hüpfen (4) |
| Graureiher | 32x32 | stehen (2), schreiten (4), auffliegen (4) |
| Möwe | 16x16 | fliegen (4), sitzen auf Pfahl (2) |
| Aal im Wasser | 16x16 | Schatten unter Wasser schlängelt (4), taucht kurz auf (4) |
| Irrlicht | 16x16 | schweben und flackern (6), türkisgrün, für Moor-Gebiete |
| Schlickkrabbe | 16x16 | seitwärts laufen (4) |
| Motten an Laterne | 16x16 | kreisen (4) |
| Krähe auf Reetdach | 16x16 | sitzen (2), krächzen (2) |
```
[STYLE BLOCK]
Small ambient animals for a drowned coastal moor town, sprite sheet with one animation per row and frames left to right: moor frog 16x16 (idle throat puff, hop), grey heron 32x32 (standing, wading, taking off), seagull 16x16 (flying, perched on a post), eel shadow under shallow water 16x16 (swimming, briefly surfacing), will-o'-the-wisp 16x16 (floating flicker, pale turquoise-green glow), mud crab 16x16 (sidestep), moths around a lamp 16x16 (circling), crow on a reed roof 16x16 (idle, cawing). Muted colors, clear silhouettes, transparent background.
```
Wetter (`AE_wexmoor_wetter.png`):
- Gischt/Salzsprüh-Partikel 8x8, 4 Frames.
- Nieselregen-Overlay 240x135, kachelbar, 4 Frames, schräg vom Meer her.
- Nebelbank, die über den Boden kriecht: 2 Ebenen je 240x135, **kachelbar in beide Richtungen**, sanftes Checker-Dithering für Durchsichtigkeit (keine Halbtransparenz, siehe 0.4).
- Wasserkringel auf Pfützen 16x16, 4 Frames.
- Leuchtturm-Lichtstrahl, der über den Himmel streicht: 240x64, 8 Frames (für Wexmoor-Außenkarten am oberen Rand).
