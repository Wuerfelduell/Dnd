# Codex-Batch AG: Grafik für die höheren Sequenzen und die drei neuen Pfade

**Batch-Name:** `sequenzen3` (Manifest: `public/sprites/manifest-sequenzen3.json`)

Paket AF hat Sequenz 4 bis 1 für alle 7 Pfade und drei neue Pfade (**Waage**, **Moor**, **Uhr**) als Daten-Entwurf geliefert. Die Wunschliste für die Grafik liegt im Repo: **`docs/story/sequenzen/grafikwuensche.md`** (123 Einträge mit ID, Art, Beschreibung, englischem Prompt). Diese Datei ist deine Auftragsliste. Lies außerdem `docs/story/sequenzen/neue_pfade.json` und `seq_4_bis_1.json`, damit Namen und Stimmung passen.

**Schon fertig, nicht neu machen:** alle Emblem-, Karten- und Ritualbilder der 7 alten Pfade (`public/sprites/pathways/`), die Spieler-Kampfposen der 7 alten Pfade (`battle/battle_player_skills.png`), alles aus den Batches A bis X.

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
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Ordner und Dateinamen stehen bei jedem Asset. Die Namen entsprechen den IDs im Spielcode bzw. in den Daten-Entwürfen, bitte genau so übernehmen.
- Ein Manifest `public/sprites/manifest-sequenzen3.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-sequenzen3-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
- Bei Wunsch-Einträgen nimmst du den englischen Prompt aus der Liste und setzt den Style-Block davor. Wo die Liste eine Farbe nennt, ist das die Leitfarbe des Effekts, sie darf die 32-Farben-Palette um höchstens 2 Töne pro Pfad erweitern.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



---

## 1. Kampf-Effekte (alle `*_stufe_*` und `*_hoch_*` aus der Liste, 55 Stück)
- Datei je Effekt: `public/sprites/fx/sq_<id>.png`, z. B. `fx/sq_laterne_hoch_4.png`, `fx/sq_waage_stufe_9.png`. Ein horizontaler Streifen 48x48 pro Frame, Frame-Anzahl und fps wie in der Liste.
- Die Stufen eines Pfads sollen sichtbar **steigern**: gleiche Bildsprache, aber mehr Fläche, mehr Teile, hellere Leitfarbe, ab Seq 2 ein kurzer weißer Kern. Seq 1 darf den ganzen 48x48-Rahmen ausfüllen.
- Vergleich: vorhandene Effekte in `public/sprites/fx/` (z. B. `fx_funkenregen.png`, `fx_fadennetz.png`) als Stil-Referenz anhängen.

## 2. Pfad-Bilder für Waage, Moor und Uhr
Genau wie bei den 7 alten Pfaden (ansehen: `public/sprites/pathways/`):
- Embleme `pathways/emblem_<pfad>_16.png`, `_32.png`, `_64.png` (Pfad-IDs in den Daten: `sq_waage`, `sq_moor`, `sq_uhr`, also z. B. `emblem_sq_waage_16.png`)
- Karte `pathways/card_sq_<pfad>.png` in derselben Größe wie `card_laterne.png`
- Ritualbild `pathways/ritual_sq_<pfad>.png` in derselben Größe wie `ritual_laterne.png` (Motiv aus dem Ritual von Seq 6 des Pfads in `neue_pfade.json`)
- Aura `fx/sq_aura_<pfad>.png` (wie in der Liste, z. B. `sq_aura_waage`) 48x64, 6 Frames (siehe Liste)

## 3. Spieler-Kampfposen für die neuen Pfade
`public/sprites/battle/battle_player_skills2.png`: **gleiches Layout** wie `battle/battle_player_skills.png` (48x48, 6 Spalten, Blick nach rechts, gleiche Grundlinie 45), **gleiche Spielfigur** (Ermittler aus `battle_player.png`), 3 Reihen: `sq_waage` (hält eine kleine Waage vor, Gewicht fällt), `sq_moor` (greift in den Boden, Torfschichten steigen), `sq_uhr` (Taschenuhr aufklappen, Zeiger-Nachbild). Anhang: `battle_player.png` und `battle_player_skills.png` als strikte Referenz.

## 4. Zutaten-Icons (alle `sq_zutat_*`, 55 Stück)
`public/sprites/items/<id>.png` (16x16) und `public/sprites/items/32/<id>.png` (32x32). Zutaten desselben Pfads teilen eine Grundform (steht im Prompt), sollen sich aber in Umriss und Farbe klar unterscheiden, damit man sie im Inventar auseinanderhält. Höhere Stufen wirken kostbarer (feinere Details, ein türkiser oder violetter Akzent ab Seq 3).

## 5. Die 6 neuen Artefakte
`sq_offene_blende`, `sq_gegenakte`, `sq_ruecklaufbecher`, `sq_stegbolzen`, `sq_fristpendel`, `sq_torfsiegel` (Beschreibung und Wirkung in `docs/story/sequenzen/artefakte.json`). Je `items/<id>.png` 16x16 und `items/32/<id>.png` 32x32, im Stil der vorhandenen Artefakt-Icons (z. B. `items/32/stille_glocke.png`, `items/32/leuchtturmlinse.png`): ein Gegenstand, ein sichtbarer Makel, ein schwacher okkulter Schimmer.

## 6. Kontrolle
Am Ende eine Tabelle in der PR-Beschreibung: jede ID aus `grafikwuensche.md` mit Dateipfad, oder Grund, warum sie fehlt. Es darf keine fehlen.
