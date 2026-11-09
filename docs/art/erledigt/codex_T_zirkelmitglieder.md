# Codex-Batch T: Zirkelmitglieder für die Treffen-Auktionen

**Batch-Name:** `zirkel` (Manifest: `public/sprites/manifest-zirkel.json`)

Die geheimen Treffen sind jetzt Auktionen. Um den Tisch sitzen feste Mitglieder, die mitbieten, tuscheln und sich an den Spieler erinnern. Im Spiel stehen sie bisher als einfache Palettenfiguren mit leeren Köpfen in der Sitzleiste. Diese Datei liefert für alle 18 Mitglieder ein Lauf-Sheet, ein Emotions-Portrait und einen Kopf für die Sitzleiste.

**Schon fertig, nicht neu machen:** die Gastgeber `tresswell`, `vellacourt`, `kohlenjem` (Batch O), `zirkel_lichtlose`, `zirkel_salzbruder` (Batch S), der `schleierbote`, alle Treffen-Räume.

**Farben:** Jede Figur hat im Spiel schon eine Palette (`src/data/treffen.json` → `npcs`). Die Hauptfarben in den Beschreibungen unten entsprechen ihr, bitte möglichst dabei bleiben, damit die Figuren nach dem Austausch wiedererkennbar sind.

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

## 1. Vorlagen

Lauf-Sheet:
```
[STYLE BLOCK]
Character sprite sheet for an NPC: [BESCHREIBUNG]. Frame size 16x32 px. Layout: 4 rows (facing down, left, right, up) x 4 columns (walk cycle). Total 64x128 px, transparent background, same proportions as the existing characters.
```
Portrait (die vierte Emotion ist für die Auktion: „bietet“, also eine Hand oder Bieterkarte erhoben):
```
[STYLE BLOCK]
Portrait sheet, 64x64 px each, 4 in a row (256x64): neutral, suspicious, shocked, bidding (raising a hand or a bid token with a sly or determined look). Bust shot facing slightly right, dark slate vignette background, identical framing and palette. Character: [BESCHREIBUNG].
```
Kopf für die Sitzleiste und das Notizbuch: 24x24, Ausschnitt aus dem neutralen Portrait, wie bei Batch H.

Ablage: `public/sprites/characters/T_<id>_walk.png`, `public/sprites/portraits/T_<id>_emotions.png`, `public/sprites/ui/heads/<id>.png`.

## 2. Die Stille Waage (Zutaten, Gewölbe unter der Krähenbrücke)
| ID | Name, Rolle | `[BESCHREIBUNG]` |
|---|---|---|
| `tm_halloran` | Witwe Halloran, Kräuterhändlerin aus Ashgrove | an old herbalist widow in a moss-green shawl over a dark green dress, white hair in a loose bun, bundles of dried herbs hanging from her belt, soil under her nails, a kind but calculating smile |
| `tm_rusk` | Doktor Pellam Rusk, Apotheker ohne Zulassung | a thin middle-aged man in a dark grey-blue frock coat, a grey cravat, slicked brown hair, small round tinted spectacles, a leather case of vials, nervous long fingers |
| `tm_oddny` | Mags Oddny, Kanalsammlerin | a stocky woman in a patched brown oilskin coat and waders, rust-red hair under a knit cap, a teal scarf, a long hooked pole and a sack of things fished out of the canals |
| `tm_ferro` | Der stumme Ferro, Leichenwäscher | a tall gaunt silent man in a dark grey coat and a rubber apron, black hair cut short, pale skin, a cloth over his mouth and nose, gentle sad eyes, hands always folded |

## 3. Der Kreidezirkel (Formeln, Hinterzimmer am Altmarkt)
| ID | Name, Rolle | `[BESCHREIBUNG]` |
|---|---|---|
| `tm_sallow` | Professor Edmund Sallow, entlassener Dozent | an elderly scholar in a worn brown tweed coat with a dark red scarf, grey-white hair and mutton chops, chalk dust on his sleeves, a stack of papers under one arm, a proud bitter look |
| `tm_corve` | Schwester Ines Corve, ehemalige Ordensfrau | a woman in her forties in a dark blue-grey dress with a white starched collar and a plain white coif, dark hair underneath, a rosary of plain wooden beads without a symbol, a steady cool gaze |
| `tm_ashdown` | Lord Tobiah Ashdown, Erbe mit Schulden | a young lord in his twenties in a wine-red velvet coat and a gold cravat, golden-blond curls, a signet ring, a slightly frayed cuff, a charming smile with worry behind it |
| `tm_pemberley` | Kit Pemberley, Schreiberin im Grundbuchamt | a young woman clerk in a slate-blue jacket and skirt, auburn hair in a practical knot, ink-stained fingers, a pencil behind her ear, a ledger clutched to her chest, sharp curious eyes |

## 4. Die Rußgesellschaft (Raritäten, Kohlenschuppen hinter der Gießerei)
| ID | Name, Rolle | `[BESCHREIBUNG]` |
|---|---|---|
| `tm_dot` | Rattenkönigin Dot, Kammerjägerin | a small wiry woman in a brown leather coat with many pockets, grey-brown hair in a messy braid, an ochre scarf, two rats on her shoulders and one peeking from a pocket, a toothy grin |
| `tm_brann` | Hakenhand Brann, Plünderer aus dem Krater | a scarred broad man in a dusty grey-brown coat, dark beard, a rust-brown scarf, an iron hook instead of his left hand, crater glass shards on a cord around his neck |
| `tm_cobb` | Die Cobb-Zwillinge, zwei Schmuggler in einem Mantel | two identical skinny young men with copper-red hair sharing one oversized dark teal greatcoat (one head out of the collar, one arm out of each sleeve belonging to a different twin), a mustard scarf wrapped around both, mischievous identical grins; in the walk sheet they move as one awkward wide figure |
| `tm_sorrel` | Old Sorrel, Knochenhändlerin | an ancient bent woman in a dark maroon shawl and layers of black cloth, wispy white hair, a necklace of small bones, a tray of bones and teeth on a strap, sharp black eyes |

## 5. Die Lichtlosen (Wexmoor, Keller unter dem Torfstich)
| ID | Name, Rolle | `[BESCHREIBUNG]` |
|---|---|---|
| `tm_docht` | Bruder Docht, Kerzenzieher | a hunched man in a soot-black smock and hood, wax drips on his sleeves, a bundle of unlit candles on his back, a burned thumb, a quiet watchful face lit only by a peat ember |
| `tm_mareike` | Die blinde Mareike, Seherin ohne Augen | a thin woman in a dark violet-grey dress and shawl, grey hair loose, a pale cloth tied over empty eye sockets, her head tilted as if listening, long fingers touching the air |
| `tm_fenn` | Fenn der Torfstecher, Moorarbeiter | a weathered marsh worker in a peat-brown smock and cap, a muddy beard, a short peat spade on his shoulder, heavy boots, a slow wary nod |

## 6. Die Salzbrüder (Wexmoor, Salzspeicher am Bojenhafen)
| ID | Name, Rolle | `[BESCHREIBUNG]` |
|---|---|---|
| `tm_gischt` | Bruder Gischt, Fischer | a broad fisherman in a navy sea jacket and a pale blue-grey scarf, brown hair and stubble, salt in his eyebrows, a coil of line over his shoulder, a loud laugh |
| `tm_lake` | Mutter Lake, Netzflickerin | an old woman in a grey knitted shawl over a grey-green dress, grey hair under a kerchief, a net draped over her lap and a net needle in hand, patient knowing eyes |
| `tm_tam` | Der Bootsjunge Tam, Laufbursche der Brüder | a cheeky boy of about twelve with ginger hair under a too-big cap, a brown jacket and a blue neckerchief, bare feet, a message tube on a string, always running |

Hinweis: `tm_tam` ist eine eigene Figur und nicht zu verwechseln mit dem Nachtwächter Tam Pruett aus Batch E.

## 7. Bieter-Symbole für die Auktion (klein, optional)
```
[STYLE BLOCK]
Small auction UI pieces, transparent background, 1px dark outline: 1) a raised-hand bid icon 16x16 (2 frames), 2) five circle bid tokens 12x12 in wax-seal style: silver scale (Silent Scale), white chalk circle (Chalk Circle), sooty handprint (Soot Society), dark lantern (The Lightless), crossed salt shovels (Salt Brothers), 3) a small gavel strike effect 24x24 (4 frames), 4) a "sold" seal 24x24 with a red wax stamp shape (no letters).
```
Ablage: `public/sprites/ui/T_auktion.png`.

## 8. Kontrolle vor dem Abgeben
- 18 Lauf-Sheets, 18 Portrait-Sheets, 18 Köpfe, Hauptfarben passend zu den Paletten in `treffen.json`.
- Die Cobb-Zwillinge lesen sich auch klein eindeutig als zwei Köpfe in einem Mantel.
- Manifest `manifest-zirkel.json`, Prompts in `docs/art/batch-zirkel-generation.json`, Kurzeintrag in `docs/art/README.md`.
