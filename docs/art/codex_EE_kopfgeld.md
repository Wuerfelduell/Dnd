# Codex-Paket EE: Die vier Kopfgeldziele von Calderwick

**Batch-Name:** `kopfgeld` (Manifest: `public/sprites/manifest-kopfgeld.json`) · **4 PNGs** · Priorität 5

Die Kopfgeldjäger haben seit PR #657 eigene Skript-Blätter (erledigt, **nicht neu machen**). Übrig sind die vier Kopfgeldziele aus Kapitel 4: sie kämpfen bisher **mit der mythischen Gestalt des Spielers** (`battle/hg_battle_<pfad>.png`), weil es kein eigenes Blatt gab. Das wirkt im Kampf, als kämpfe man gegen sich selbst. Gesucht: je ein eigenes Kampfblatt im **gleichen Raster wie `hg_battle_<pfad>`**, damit der Einbau nur den Blattnamen tauscht.

## 0. Gemeinsame Regeln (bitte zuerst lesen, gelten für jedes Bild)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** (`src/` nicht anfassen). Andere Pakete laufen gleichzeitig: fasse nur die Dateien dieses Pakets an. Der Einbau ins Spiel passiert separat. Keine Extras, keine Varianten, die nicht unten stehen.

### 0.1 Harte Vorgaben (daran sind frühere Lieferungen gescheitert)
1. **Echte Transparenz:** PNG mit Alphakanal (RGBA oder indiziert mit Transparenzindex). Hintergrund **vollständig transparent** (Alpha 0), **binäres Alpha** (nur 0 oder 255), **kein** weißer, grauer oder schwarzer Rand, **kein** Schachbrettmuster als „Transparenz“ ins Bild gemalt. Leere Zellen komplett transparent. Ausnahme nur, wo unten ausdrücklich „opak“ steht.
2. **Exakte Maße:** Bildgröße, Zellgröße, Spalten, Reihen genau wie angegeben. Ein Motivpixel = ein Bildpixel.
3. **Frame für Frame erzeugen, nicht als Gesamtbild:** Jede Pose als eigenes Motiv generieren (gern größer, z. B. 8-fach), dann **nur ganzzahlig mit Nearest Neighbor** aufs Zielraster verkleinern, dann per Skript zum Sheet zusammensetzen. Niemals ein ganzes Sheet als ein Bild generieren und herunterrechnen (matschige Zellen, falsche Inhalte).
4. **Palette:** auf die Spielpalette indizieren, **max. 32 Farben je Datei**, keine Halbtöne durch Skalierung. Referenzpalette: `public/sprites/battle/battle_player.png` plus die je Abschnitt genannte Vorlage.
5. **Umriss:** 1 px Umriss `#1a1c2c` um Figuren, Gegner, Requisiten, Icons (nicht reines Schwarz). Kein Anti-Aliasing, keine Weichzeichnung, keine Verläufe.
6. **Raster der Vorlage übernehmen:** gleiche Zellgröße, Spaltenzahl, Reihenfolge der Animationen und gleiche Fußlinie wie die genannte Vorlage. Dann greift der Einbau ohne Änderung am Raster.
7. **Kein Text** im Bild (keine Buchstaben, Zahlen, Signatur, Wasserzeichen), außer wo ausdrücklich verlangt (Logo).
8. **Blickrichtung:** Kampfblätter von Gegnern schauen nach **links**, Kampfblätter des Spielers (Gestalt) nach **rechts**, wie die Vorlagen.

### 0.2 Style-Block (vor jeden Bild-Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial world with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces. 1px dark outline in deep blue-grey (#1a1c2c, not pure black) on characters, creatures, props and icons.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white (#ebcd8d / #bbae95 instead of pure white); warm amber only for lamp light and holy light; turquoise #6fe0d0 or deep violet reserved for occult/supernatural effects, used sparingly.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites.
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: TRANSPARENT background (real alpha channel, no checkerboard, no white or black backdrop) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.3 Lieferung
- **Bevorzugt als Pull Request** ins Repo `Wuerfelduell/Dnd`: PNGs genau unter den Pfaden unten (`public/sprites/...`), bestehende Dateien nicht überschreiben, außer es steht da.
- **Zusätzlich oder falls kein PR geht: eine Zip** `<batch>.zip` mit genau dieser Struktur:
  ```
  <batch>.zip
  ├── public/sprites/...            (alle PNGs, Pfade wie unten)
  ├── public/sprites/manifest-<batch>.json
  ├── raw/                          (Rohbilder vor dem Verkleinern, je Frame)
  ├── preview.png                   (alle Bilder in 3-facher Größe auf dunkelgrauem Grund #2a2a33, beschriftet erlaubt)
  └── check.txt                     (Ausgabe des Prüfskripts)
  ```
- **Manifest** `public/sprites/manifest-<batch>.json` im Format von `public/sprites/manifest-halbgott.json` (je Eintrag `id`, `file`, `width`, `height`, `frameWidth`, `frameHeight`, `columns`, `rows`, `transparent`, `animations` mit Frame-Listen und `frameRate`, bei Laufblättern `baseline`).
- **Prüfskript** `tools/art/<batch>/check.py` (Pillow), prüft je Datei: Maße, Zellraster, Farbanzahl ≤ 32, Alpha nur 0/255, keine halbtransparenten oder weißen Randpixel, keine komplett leeren Pflichtzellen, nicht pixelgleich mit der Vorlage. Ausgabe nach `docs/art/batch-<batch>-validation.json` bzw. `check.txt`. **Erst liefern, wenn alles grün ist.**
- Prompts in `docs/art/batch-<batch>-generation.json`, Vorschau `docs/art/batch-<batch>-preview.png`, eine Zeile in `docs/art/README.md`.

## 1. Vorlage und Format
- Raster: `public/sprites/battle/hg_battle_kessel.png` (576x576, Zellen 96x96, 6 Spalten x 6 Reihen: idle, attack1, attack2, special, hurt, defeated). **Aber Blick nach links** (Gegner).
- Figurgröße: ein Mensch, ca. 40x80 px in der Zelle, Füße auf derselben Zeile wie die Vorlage. Kein Monster, keine Kreaturform: das sind Beyonder auf Seq 4–3 in Menschengestalt; ihre Kraft zeigt sich nur in den Effekten (attack2, special).
- Stilreferenz Menschen im Kampf: `battle/enemy_ez_torfmutter.png`, `battle/enemy_k3k_staubschmuggler.png` (dort 48er Zellen, hier doppelt so groß zeichnen, nicht hochskalieren).

## 2. Dateien
| Datei | Wer | Pfad | Aussehen / special |
|---|---|---|---|
| `battle/enemy_k4s_kg_aschmann.png` | Gerold Aschmann, der Rückfällige | Kessel | verwahrloster Alchemist, fleckiger Kittel, zitternde Hände, Phiolengurt / special: Sudwolke |
| `battle/enemy_k4s_kg_vell.png` | Ines Vell, die Stimme aus dem Schacht | Echo | hagere Frau in Bergmannsjacke, Grubenlampe, Mund offen / special: Schallring aus dem Boden |
| `battle/enemy_k4s_kg_dorn.png` | Kaspar Dorn, ohne Gesicht | Maske | Mann im Anzug, Gesicht glatt wie Wachs / special: Gesicht wechselt dreimal |
| `battle/enemy_k4s_kg_hollin.png` | Marthe Hollin, Wegezoll | Eisen | Zöllnerin, Reitmantel, Schlagbaum-Stange als Waffe / special: Eisenschranke fällt |

## 3. Abnahme
☐ 4 Dateien · ☐ 576x576, 96er Zellen, 6x6 · ☐ Blick links · ☐ Menschen, keine Kreaturen · ☐ Alpha binär, ≤ 32 Farben · ☐ Vorschau + check.txt

**Einbau (macht nicht Codex):** in `src/data/calderwickStory.js` den `sheet` auf `enemy_<id>` stellen, Blätter in `assets.js` registrieren.
