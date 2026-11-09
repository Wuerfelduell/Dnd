# Codex-Batch P: Rituale für Sequenz 6 und 5

**Batch-Name:** `rituale` (Manifest: `public/sprites/manifest-rituale.json`)

Ab Sequenz 6 reicht ein Trank nicht mehr. Vor dem Aufstieg muss man an einem bestimmten Ort ein Ritual seines Pfads vollziehen. Im Spiel läuft das bisher nur als Text. Diese kleine Datei liefert einen leuchtenden Ritualkreis pro Pfad, der auf der Karte unter dem Spieler liegt, und eine Szenenkarte für die Ritual-Meldung. Optional: Das Spiel läuft auch ohne diese Grafiken.

**Schon fertig, nicht neu machen:** die Pfadkarten `pathways/card_<pfad>.png` (Vorlage für Format und Rahmen der Szenenkarten), alle Effekte unter `fx/`.

**Pfade und Farben** (Reihenfolge in allen Atlanten): `laterne` #e8b860, `faden` #c8b0e8, `maske` #e07a8a, `echo` #6fe0d0, `kessel` #9ad06a, `eisen` #a8b4c0, `schluessel` #d0a050.

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
- Pro Datei ein Manifest `public/sprites/manifest-<batch>.json` (Batch-Name steht oben in der Datei) mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat.

### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."


---

## 1. Ritualkreise (Overlay auf der Karte)

Draufsicht, flach auf dem Boden liegend, 64x64 pro Frame, **8 Frames** in einer Reihe (512x64): Der Kreis zeichnet sich in Frame 1 bis 3 auf, leuchtet in Frame 4 bis 6 voll und pulsiert in Frame 7 bis 8 zurück (Frame 4 bis 8 lassen sich als Schleife abspielen). Nur Linien, Symbole und Lichtpunkte, kein deckender Hintergrund, damit die Bodenkacheln durchscheinen.
```
[STYLE BLOCK]
Top-down ritual circle overlay lying flat on the ground, 64x64 px per frame, 8 frames in a row (512x64), transparent background, crisp pixels, thin glowing lines in [FARBE] with a brighter white core at the peak frames, no letters or real-world religious symbols: [MOTIV]. Frames 1-3 the circle draws itself line by line, frames 4-6 fully lit with small rising sparks, frames 7-8 the glow dims slightly (loopable from frame 4).
```
| Datei (`public/sprites/fx/`) | `[FARBE]` | `[MOTIV]` |
|---|---|---|
| `ritual_laterne.png` | amber | a ring of seven small lantern flames around a double circle, rays of light pointing inward to a bright center |
| `ritual_faden.png` | lilac | a circle woven from threads, knotted at seven points, lines crossing like a cat's cradle toward the center |
| `ritual_maske.png` | rose | a circle of small mask shapes facing inward, mirrored half-circles that do not quite line up |
| `ritual_echo.png` | turquoise | concentric sound rings with small bell shapes at the rim, faint ghostly wisps circling |
| `ritual_kessel.png` | poison green | a circle of bubbling drops and alchemical vessel outlines around a cauldron-shaped center, a faint spiral |
| `ritual_eisen.png` | steel grey | a heavy hammered iron ring with rivets and an anvil outline at the center, sparks like from a forge |
| `ritual_schluessel.png` | brass | a ring of keyholes and small key shapes, the center a dark shadow pool with a single bright keyhole |

## 2. Szenenkarten für die Ritual-Meldung (96x128)

Gleiches Format und gleicher Rahmen wie die vorhandenen Pfadkarten (`pathways/card_<pfad>.png`), bitte als Stilvorlage mitgeben. Jede Karte zeigt den Moment des Rituals.
```
[STYLE BLOCK]
Ritual scene card, 96x128 px, not transparent, same ornate frame style and proportions as the existing pathway cards, a small pixel-art scene inside the frame lit mostly by [FARBE] light: [SZENE]. The investigator is seen from behind or in silhouette (no detailed face). No text.
```
| Datei (`public/sprites/pathways/`) | `[FARBE]` | `[SZENE]` |
|---|---|---|
| `ritual_laterne.png` | amber | a figure standing in a foggy street raising a lantern, seven gas lamps lighting up one after another, the fog pulling back like a curtain |
| `ritual_faden.png` | lilac | a figure in a dark attic surrounded by glowing threads tied between beams, tying the last knot |
| `ritual_maske.png` | rose | a figure before a tall mirror in an empty theatre, holding a mask, the reflection already wearing a different face |
| `ritual_echo.png` | turquoise | a figure kneeling in a crypt among old bells, sound rings rising, faint ghostly faces listening |
| `ritual_kessel.png` | poison green | a figure stirring a bubbling cauldron in a cellar laboratory, green steam forming a spiral |
| `ritual_eisen.png` | steel grey | a figure striking a glowing blade on an anvil in a cold forge, sparks frozen in the air |
| `ritual_schluessel.png` | brass | a figure on a moonlit rooftop turning a key in a door that stands alone without a wall, shadow spilling out |

## 3. Kontrolle vor dem Abgeben
- Ritualkreise haben 8 Frames à 64x64 und sind ab Frame 4 nahtlos als Schleife abspielbar.
- Keine echten religiösen oder magischen Symbole (kein Pentagramm, keine Runenalphabete), nur eigene Formen.
- Manifest `manifest-rituale.json`, Prompts in `docs/art/batch-rituale-generation.json`, Kurzeintrag in `docs/art/README.md`.
