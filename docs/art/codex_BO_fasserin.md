# Codex-Paket BO: Die Fasserin auf geheimen Treffen (Grafik + Texte)

**Batch-Name:** `fasserin` (Manifest: `public/sprites/manifest-fasserin.json`) · **Texte nach:** `docs/story/fasserin/`

Seit PR „Artisan im geheimen Zirkel“ sitzt mit **30 % Chance** eine **Fasserin** bei jedem geheimen Treffen (alle Zirkel in Kettlegate, Wexmoor und später Dunscar) mit am Tisch: **Oda Kessel** (`fasserin`), Lederschürze, Lupe auf der Stirn, Zangen, Draht, ein Fläschchen Quecksilber. Sie **fasst ungewöhnliche, seltene und okkulte Beutestücke zu Artefakten**: Jedes Rezept verbraucht die Beute und kostet einen festen Fasserlohn (90 bis 160 Schilling). Pro Treffen liegen 4 von 10 Rezepten auf dem Tisch. Daten: `src/data/treffen.json` → `artisan`, Artefakte: `src/data/pathways.json` → `artifacts.list` (Quelle `artisan`), Logik: `src/core/Artisan.js`.

Heute ist alles Platzhalter: Oda Kessel hat ein Paletten-Sprite ohne Portrait, die 10 Artefakte zeigen das Bild ihres Hauptbeutestücks (`src/world/assets.js` → `ARTISAN_ICONS`). Du lieferst **Grafik (Teil 1)** und **Texte (Teil 2)**. Beides kann getrennt laufen.

## 0. Gemeinsame Regeln für diese Datei (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.

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
| Figur auf der Karte | 16x32 pro Frame; Lauf-Sheet 4 Reihen (unten, links, rechts, oben) x 4 Frames = 64x128 |
| Portrait | 64x64; Emotions-Sheet 4 nebeneinander = 256x64 (neutral, misstrauisch, erschrocken, leichtes Lächeln) |
| Kopf (Sitzleiste der Runde) | 24x24, wie `portraits/heads/*.png` |
| Item-Icon | 16x16 **und** 32x32 |
| Prop | 32x32 (Werkbank), 16x16 (Zangen) |

### 0.3 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Namen = IDs aus den Daten, genau so übernehmen.
- Manifest `public/sprites/manifest-fasserin.json` wie `manifest-14b.json` (Framegröße, Spalten/Reihen, Animationen).
- Verwendete Prompts in `docs/art/batch-fasserin-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- Nachbearbeitung wie immer: Nearest Neighbor aufs Zielraster, Palette (max. 32 Farben) indizieren, Alpha binarisieren, Raster prüfen, vorhandene Sprites als Stilreferenz mitgeben (Figuren: `characters/tm_*` bzw. `k3_*_walk.png`; Portraits: `portraits/k3_*_emotions.png`; Artefakt-Icons: `items/nachtauge_brosche.png` und `items/32/nachtauge_brosche.png`).

## 1. Grafik

### 1.1 Oda Kessel (`fasserin`)
| Datei | Inhalt |
|---|---|
| `characters/fasserin_walk.png` | Lauf-Sheet 64x128. Frau um die fünfzig, drahtig, graue Haarsträhnen unter einem Tuch, **Lederschürze mit Werkzeugschlaufen** (Zange, Feile), dunkelviolette Bluse, Lupe auf der Stirn hochgeklappt, kleine Tasche mit Quecksilberfläschchen am Gürtel. |
| `characters/fasserin_sit.png` | 16x32, 2 Frames nebeneinander: sitzt an einer niedrigen Werkbank, Lupe heruntergeklappt, beugt sich über Draht (Frame 2: Hand hebt eine Zange). Für den Platz abseits der Runde. |
| `portraits/fasserin_emotions.png` | 256x64, 4 Stimmungen: neutral (prüfender Blick durch die Lupe), misstrauisch (Lupe hoch, ein Auge zusammengekniffen), erschrocken (Quecksilber kippt), leichtes Lächeln (hält ein fertiges Stück ins Kerzenlicht). |
| `portraits/heads/fasserin.png` | 24x24 Kopf für die Sitzleiste. |

Prompt-Kern (englisch, nach dem Style-Block): „a wiry middle-aged woman artisan, jeweller's loupe flipped up on her forehead, leather apron with tool loops holding pliers and a file, dark violet blouse, grey hair strands under a headscarf, small vial of quicksilver at her belt, calm appraising expression“.

### 1.2 Werkbank-Props
| Datei | Inhalt |
|---|---|
| `props/fasserin_werkbank.png` | 32x32: niedriger Klapptisch mit Lederunterlage, darauf Zangen, Drahtrolle, Kerzenstummel, Quecksilberfläschchen, ein halbfertiger Reif mit türkisem Schimmer. |
| `props/fasserin_zangen.png` | 16x16: gekreuzte Zangen auf Leder (Icon für Einladung/HUD „Fasserin dabei“). |

### 1.3 Die 10 Artefakt-Icons (je 16x16 nach `items/<id>.png` und 32x32 nach `items/32/<id>.png`)
Türkis #6fe0d0 oder Violett nur als kleiner Schimmer; Metall matt; 1px Outline.
| ID | Name | Bild |
|---|---|---|
| `krone_der_sieben` | Krone der Sieben Schwänze | Reif aus Zinn, zehn verknotete Rattenschwänze ringsum, einer zuckt (türkiser Punkt) |
| `sternlicht_gespinst` | Gespinst aus Sternlicht | gebogene Perlmuttschale, darin ein Geweih aus hellen Lichtfäden, feine Sternpunkte |
| `glaskielfeder` | Gläserner Federkiel | Schreibkiel aus klarem Glas, zwei schwarze Federn an der Wurzel, Spitze schimmert |
| `herzkerze` | Herzkerze | herzförmiges graues Wachs mit Docht, kein Flämmchen, dafür ein warmer Schimmer innen |
| `perlenpaar` | Perlenpaar der Ertrunkenen | zwei Perlen auf gebogenem Draht, eine schwarz, eine grau, Wassertropfen |
| `geisterspindel` | Geisterspindel | Holzspindel, lila Faden gespult, oben ein kalter weißer Kern |
| `leuchtturmmonokel` | Leuchtturm-Monokel | Monokel aus Messing, Glas mit Riffelung (Leuchtturmlinse), Kette |
| `namenssiegel` | Siegel der Namenlosen | weißes Wachssiegel mit eingedrücktem Knochensplitter, winzige Ritzung |
| `gluehglocke` | Glühende Glocke | kleine Bronzeglocke, Klöppel glüht orange, dünner Rauchfaden |
| `doppelsiegel` | Siegel mit zwei Wappen | grünes Wachssiegel, darin eine Polizeimedaille verschmolzen, zwei Wappenhälften |

## 2. Texte (nach `docs/story/fasserin/`, als JSON wie `src/data/treffen.json` → `artisan.recipes` plus Markdown-Lesefassung)

**Regeln:** Deutsch, knapp, viktorianisch-okkulter Ton wie im Spiel, keine Anglizismen. Nur **vorhandene Beutestücke** (`kind: trophy`) verwenden: Kettlegate `src/data/wilds.json` und `src/data/stadtgegner.json`, Wexmoor `src/data/wexmoor.json` → `items`. Jedes Rezept braucht **mindestens ein ungewöhnliches, seltenes oder okkultes** Beutestück und 2 bis 3 verschiedene Beutestücke. Erlaubte Wirkungsschlüssel (`boons`/`curses`): `atk`, `max_hp`, `max_nerves`, `parry_ap`, `lock_bonus`, `conclusion_honor`, `carry`, `unruhe_tick` (addiert) und `vision_cost`, `composure_regen`, `heal_bonus`, `price`, `sell`, `honor_loss`, `occult_mult`, `money_bonus`, `skill_composure`, `calm_decay`, `dodge_window`, `damage_taken`, `digest_mult`, `dmg_mult` (Faktor). Jedes Artefakt hat 1 bis 2 Vorteile **und** 1 bis 2 spürbare Nachteile (Artefakte wirken, sobald sie im Rucksack sind; keine Gratis-Boni).

| Datei | Inhalt |
|---|---|
| `rezepte_vorrat.json` | **10 weitere Rezepte** im Format `{ "id", "needs": { "<item>": n }, "fee", "line" }` plus zugehörige Artefakte im Format von `pathways.json` → `artifacts.list` (`name`, `source: "artisan"`, `price` 120 bis 200, `icon` = ID des Hauptbeutestücks, `desc`, `boons`, `curses`). Mindestens 4 davon aus Wexmoorer Beute (Torfasche, Fremdlicht, Salzkristall, Möwenglas, Laternenöl, Pfahlholz, Krebspanzer, Madenwachs ...), 2 aus den Fundstücken der Stadtgegner (Spieldose, Wachszylinder, Landkarte, Fuchsfell ...). `line` = ein Satz, den Oda beim Fassen sagt. |
| `oda_kessel.md` | Steckbrief (Herkunft: Fasserin aus einer Goldschmiedefamilie, die wegen „unruhiger Ware“ aus der Zunft flog; warum sie die Zirkel duldet, warum sie nie mitbietet), **12 Begrüßungen** (je 2 pro Zirkel: Waage, Kreide, Ruß, Lichtlose, Salz, Täfelchengilde), **6 Sprüche**, wenn Beute fehlt, **6 Sprüche**, wenn das Geld fehlt, **4 Abschiede**. |
| `gerede.json` | 8 Gerede-Zeilen von Zirkelmitgliedern über die Fasserin (Format wie `docs/story/k3_leben/`), 2 Zeitungsnotizen („Zunft warnt vor Hinterhof-Fasserin“). |
| `offene_punkte.md` | was du vom Spiel bräuchtest und nicht selbst anlegen darfst. |

**Nicht anlegen:** neue Zirkel, neue Karten, neue Beutestücke, neue Wirkungsschlüssel.
