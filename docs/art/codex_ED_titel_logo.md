# Codex-Paket ED: Logo „Nebelakten“ für das Hauptmenü

**Batch-Name:** `titel` (Manifest: `public/sprites/manifest-titel.json`) · **7 PNGs** · Priorität 4 (klein, schnell)

Das Hauptmenü hat schon bewegte Hintergründe je Stadt (`public/sprites/ui/AE_titel/`, `ui/titel_k1_*.png` bis `titel_k6_*.png`), aber **kein Logo**: der Spielname steht nur als HTML-Schrift da. Gewünscht ist eine **Pixel-Wortmarke** plus ein kleines Emblem.

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

## 1. Stil-Referenz
`public/sprites/ui/07_06_title.png` (480x270, Kettlegate bei Nacht: Gaslaternen in Amber, Nebel, Schieferblau) und die Ebenen in `ui/AE_titel/`. Das Logo liegt **über** diesem Bild, oben mittig, und muss auf dunklem wie auf hellerem Nebel lesbar sein (dunkler Umriss + Schlagschatten 1 px nach rechts unten).

## 2. Dateien
| Datei | Maße | Inhalt |
|---|---|---|
| `ui/titel/logo_de.png` | 320x80, transparent | Wortmarke **„NEBELAKTEN“** in eigener Pixel-Versalschrift (keine bestehende Schrift kopieren), Buchstaben ca. 20–24 px hoch, Messing/Bein-Weiß mit dunklem Umriss `#1a1c2c`; darunter klein (ca. 8 px) „EIN MYSTERY IN KETTLEGATE“ |
| `ui/titel/logo_en.png` | 320x80, transparent | gleiche Wortmarke **„NEBELAKTEN“** (der Name bleibt auch auf Englisch), nur die Unterzeile lautet „A KETTLEGATE MYSTERY“ |
| `ui/titel/logo_de_2x.png` | 640x160 | genau `logo_de.png` 2-fach Nearest (kein Neuzeichnen) |
| `ui/titel/logo_en_2x.png` | 640x160 | genau `logo_en.png` 2-fach Nearest |
| `ui/titel/logo_glimmen.png` | 1280x80, transparent, 4 Frames à 320x80 | Animations-Overlay: ein schwacher Amber-Schimmer wandert von links nach rechts über die Buchstaben (nur die Glanzpixel, Rest transparent) |
| `ui/titel/emblem.png` | 64x64, transparent | Emblem: eine Aktenmappe mit Wachssiegel, aus der Nebel quillt, eine kleine Laterne davor |
| `ui/titel/favicon.png` | 32x32, transparent | vereinfachtes Emblem, auch in 16x16 noch erkennbar |

**Hier ist Text ausdrücklich erlaubt**, aber nur die oben genannten Wörter, korrekt geschrieben (prüfen!). Keine Verläufe; Metall mit 3 Tonstufen.

## 3. Bild-Prompt
```
[STYLE BLOCK]
Pixel-art game logo wordmark, transparent background, 320x80 pixels: the word "NEBELAKTEN" in bold custom pixel capitals with a brass and bone-white fill, 1px dark blue-grey outline and a 1px drop shadow; a thin wisp of fog curls through the letters; a tiny gas-lamp flame dots the letter A. Below it, small pixel capitals "EIN MYSTERY IN KETTLEGATE". Victorian occult detective mood. Exact spelling, no other text.
```
Rechtschreibung nach dem Generieren Buchstabe für Buchstabe prüfen und falls nötig von Hand im Pixelraster korrigieren.

## 4. Abnahme
☐ 7 Dateien · ☐ Rechtschreibung exakt · ☐ Alpha binär, kein Kasten um das Logo · ☐ lesbar auf `07_06_title.png` (Vorschau zeigt Logo über dem Titelbild) · ☐ 2x-Fassungen pixelgleich vergrößert · ☐ check.txt

**Einbau (macht nicht Codex):** Titel-`<h1>` durch `logo_<sprache>.png` ersetzen, Emblem als Favicon.
