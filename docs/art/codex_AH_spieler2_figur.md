# Codex-Batch AH: Eine eigene Figur für Spieler 2

**Batch-Name:** `spieler2` (Manifest: `public/sprites/manifest-spieler2.json`)

Das Spiel hat einen lokalen Koop-Modus: Ein zweiter Spieler kann über das Esc-Menü beitreten, hat ein eigenes Inventar, eigene Ausrüstung und einen eigenen Pfad, und kämpft mit. Bisher ist Spieler 2 nur die **eingefärbte Kopie** der Hauptfigur. Er bekommt jetzt eine eigene Figur, und zwar in **zwei Varianten zur Wahl**:
- **`p2a`**: eine Frau Ende zwanzig, kurzes dunkles Haar unter einer Schiebermütze, flaschengrüner kurzer Mantel mit Messingknöpfen, Halstuch in Senfgelb, Notizbuch am Gürtel. Wach, schnell, etwas frech.
- **`p2b`**: ein Mann Mitte dreißig, Melone, ockerbrauner langer Mantel, gestutzter Bart, Brille mit runden Gläsern, Lederhandschuhe. Ruhig, gründlich, ein bisschen pedantisch.
Beide müssen neben der Hauptfigur (Ermittler im dunklen Mantel) **sofort unterscheidbar** sein, auch klein auf der Karte: andere Silhouette (Mütze/Melone), andere Hauptfarbe.

**Strikte Referenz:** Für jedes Sheet gibt es ein Gegenstück der Hauptfigur. **Gleiches Format, gleiche Rasteraufteilung, gleiche Reihenfolge der Animationen, gleiche Grundlinie.** Öffne die Referenz-Datei und ihr Manifest-Eintrag, bevor du anfängst, und häng sie dem Generator als Referenz an.

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
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Ordner und Dateinamen stehen bei jedem Asset. Die Namen entsprechen den IDs im Spielcode bzw. in den Daten-Entwürfen, bitte genau so übernehmen.
- Ein Manifest `public/sprites/manifest-spieler2.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-spieler2-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
- Dateinamen: Variante steht vorne, z. B. `characters/p2a_walk.png`, `characters/p2b_walk.png`.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



---

## 1. Karte (Overworld), je Variante
| Datei | Referenz der Hauptfigur | Inhalt |
|---|---|---|
| `characters/<v>_walk.png` | `characters/03_01_investigator_walk.png` | Lauf-Sheet 16x32, 4 Richtungen x 4 Frames |
| `characters/<v>_actions.png` | `characters/03_02_investigator_actions.png` | gleiche Aktionen wie die Hauptfigur |
| `characters/<v>_extras.png` | `characters/C_player_extras.png` (Manifest `manifest-welt.json`) | gleiche Extras |
| `characters/<v>_drink.png` | `characters/A_player_drink.png` (`manifest-pfade.json`) | Trank trinken |
| `characters/<v>_untersuchen.png` | `characters/H_player_untersuchen.png` (`manifest-journal.json`) | Untersuchen |
| `characters/<v>_torfkittel.png`, `_fischerjacke.png`, `_akademierobe.png` | `characters/R_spieler_torfkittel.png` usw. (`manifest-wexmoor2.json`) | die drei Verkleidungen aus Wexmoor, Mütze/Melone bleibt erkennbar |

## 2. Kampf, je Variante (48x48, Blick nach rechts, 6 Spalten)
| Datei | Referenz |
|---|---|
| `battle/<v>_battle.png` | `battle/battle_player.png` (Animationen idle, attack, shoot, dodge, parry, item, hurt, defeated, occult) |
| `battle/<v>_skills.png` | `battle/battle_player_skills.png` (eine Reihe pro Pfad, gleiche Reihenfolge) **plus 3 Reihen** für die neuen Pfade `sq_waage`, `sq_moor`, `sq_uhr` (Beschreibung siehe `docs/story/sequenzen/neue_pfade.json`) |
| `battle/<v>_weapons.png` | `battle/battle_player_weapons.png` (Schlagstock, Stockdegen, Siegerpose) |
Im Koop-Kampf stehen beide Spieler links nebeneinander. Spieler 2 steht **etwas weiter hinten und 8 px höher**: Zeichne ihn deshalb nicht größer als die Hauptfigur, und lass oben 2 px Luft.

## 3. Portraits und Kopf, je Variante
- `portraits/<v>_emotions.png`: 256x64, 4 Stimmungen nebeneinander (neutral, misstrauisch, erschrocken, leichtes Lächeln), wie die anderen `*_emotions.png`.
- `portraits/<v>_emotions2.png`: 256x64, 4 weitere (wütend, traurig, nachdenklich, entschlossen).
- `ui/heads/<v>.png`: kleiner Kopf für HUD und Zugreihenfolge, Größe wie die Dateien in `ui/heads/` (ansehen).
- `ui/<v>_zug.png`: Zug-Portrait für die Kampf-Reihenfolge, Größe wie in `ui/F_05_zug_portraits.png`.

## 4. Koop-Oberfläche (`ui/AH_koop.png`)
- Marker über der Figur auf der Karte: kleines „P1“/„P2“ ist Text, also **ohne Buchstaben**: stattdessen 2 Wimpel-Symbole 8x8 in Bernstein (P1) und Grün (P2), je 2 Frames leichtes Wehen.
- HUD-Rahmen für Spieler 2: 9-slice 48x16 in Grün-Messing (Gegenstück zum vorhandenen HUD).
- Symbole 16x16: `beitreten` (zwei Hüte, einer mit Pluszeichen aus 2 Strichen), `verlassen` (Hut mit Pfeil weg), `tauschen` (zwei Pfeile im Kreis zwischen zwei Taschen), `wiederbeleben` (ausgestreckte Hand über liegender Figur), `zusammen` (zwei Hände, die einen Stock halten: Kombi-Angriff).
- Kombi-Angriff-Effekt `fx/AH_kombi.png`: 64x48, 8 Frames, beide Farben (Bernstein und Grün) laufen ineinander.

## 5. Auswahl-Bild
`ui/AH_wahl.png`: 240x135, deckend: beide Varianten nebeneinander unter einer Gaslaterne, für den Bildschirm „Wer spielt mit?“. Kein Text.
