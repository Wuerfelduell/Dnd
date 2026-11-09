# Codex-Batch AK: Mehr Gefühle in den Dialogen (Zusatz-Portraits)

**Batch-Name:** `emotionen2` (Manifest: `public/sprites/manifest-emotionen2.json`)

Jede Figur hat bisher 4 Stimmungen (neutral, misstrauisch, erschrocken, leichtes Lächeln). Wenn jemand im Dialog wütend oder traurig ist, zeigt das Spiel ein Lächeln, weil es nichts Besseres hat. Die 32 wichtigsten Figuren bekommen deshalb **4 weitere Stimmungen**: **wütend, traurig, nachdenklich, entschlossen**.

## 0. Gemeinsame Regeln für diese Datei (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**: Style-Block, Maße, Ablage und Nachbearbeitung stehen hier, du brauchst keine andere Prompt-Datei.

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
- PNGs unter `public/sprites/portraits/`, Dateinamen siehe Tabelle.
- Ein Manifest `public/sprites/manifest-emotionen2.json`: pro Datei die Figur-ID und die Reihenfolge der Stimmungen.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-emotionen2-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



---

## 1. Regeln
- Pro Figur eine Datei `portraits/AK_<id>_emotions2.png`, **256x64**, 4 Felder nebeneinander in dieser Reihenfolge: wütend, traurig, nachdenklich, entschlossen.
- **Gleiche Figur, gleicher Bildausschnitt, gleiche Kleidung, gleiche Farben** wie im vorhandenen Portrait. Häng die vorhandene Datei als strikte Referenz an: "Use the attached portrait sheet as strict reference: same person, same framing, same palette, same outline; only change the facial expression and small gestures."
- Ausdruck vor allem über Augenbrauen, Mund, Blickrichtung, Kopfneigung; Hände dürfen ins Bild kommen (Faust, Hand am Kinn), wenn Platz ist.
- traurig: nie weinend mit Tränenströmen, eher gesenkter Blick. wütend: zusammengezogene Brauen, angespannter Kiefer, kein Schreien.

## 2. Figuren (ID → vorhandenes Portrait in `public/sprites/portraits/`)
| ID | Referenz | Wer |
|---|---|---|
| `player` | `06_investigator_emotions.png` | die Hauptfigur |
| `marlowe` | `12_agatha_marlowe_police_emotions.png` | Inspektorin Marlowe |
| `holt` | `C_holt_emotions.png` | Sergeant Holt |
| `pimm` | `C_pimm_emotions.png` | Miss Pimm, Archiv |
| `greta` | `C_greta_emotions.png` | Greta, Blumenmädchen |
| `quill` | `C_quill_emotions.png` | Mr. Quill, Antiquar |
| `kit` | `C_kit_emotions.png` | Kit |
| `pip` | `C_pip_emotions.png` | Pip |
| `hester` | `C_hester_emotions.png` | Hester Marsh |
| `ivy` | `C_ivy_emotions.png` | Ivy Marsh |
| `rook` | `C_rook_emotions.png` | Constable Rook |
| `price` | `C_price_emotions.png` | Constable Price (auch in Wexmoor) |
| `barnaby` | `C_barnaby_emotions.png` | Barnaby |
| `miriam` | `C_miriam_emotions.png` | Miriam Vey |
| `oda_vey` | `J_oda_vey_emotions.png` | Oda Vey |
| `mews` | `K_mews_emotions.png` | Lucan Mews |
| `astronom` | `C_astronom_emotions.png` | Professor Starling |
| `lichtmann` | `R_lichtmann_emotions.png` | Starling in Wexmoor („Lichtmann“) |
| `maud` | `C_maud_emotions.png` | Wirtin Maud |
| `ned` | `C_ned_emotions.png` | der blinde Ned |
| `wick` | `C_wick_emotions.png` | Lampenanzünder Wick |
| `souffleur` | `C_souffleur_emotions.png` | Felix Dunmore |
| `zunder` | `Q_zunder_emotions.png` | Juna „Zunder“ Fenn |
| `druce` | `Q_druce_emotions.png` | Druce |
| `sedge` | `R_sedge_emotions.png` | Mutter Sedge |
| `hale` | `R_hale_emotions.png` | Hale |
| `brack` | `R_brack_emotions.png` | Brack |
| `hesper` | `R_hesper_emotions.png` | Hesper |
| `wyle` | `R_wyle_emotions.png` | Wyle |
| `pedell` | `R_pedell_emotions.png` | Ruprecht Lamm, Pedell |
| `brandt` | `R_brandt_emotions.png` | Magistra Ilse Brandt |
| `elsbeth` | `V_elsbeth_emotions.png` | Elsbeth Rowe |

Falls eine Referenzdatei anders heißt oder fehlt, such sie über `PORTRAITS` in `src/world/assets.js` (nur lesen) und schreib es in die PR-Beschreibung.

## 3. Kontrolle
Ein Vorschaubild `docs/art/AK_vorschau.png`: alle Figuren untereinander, links die 4 alten, rechts die 4 neuen Stimmungen. In der PR-Beschreibung verlinken.
