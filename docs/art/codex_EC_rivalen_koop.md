# Codex-Paket EC: Die zehn Koop-Rivalen (Spieler 2)

**Batch-Name:** `rivalen2` (Manifest: `public/sprites/manifest-rivalen2.json`) · **40 PNGs** · Priorität 6 (nur wenn Zeit bleibt; erst nach EB)

Im Koop hat Spieler 2 einen **eigenen** Rivalen, auch wenn beide Spieler denselben Pfad gehen. Format und Regeln **genau wie Paket EB** (`docs/art/codex_EB_rivalen.md`, Abschnitte 1, 2, 4, 5), nur mit Endung `_2`. Die Koop-Rivalen sollen sich von den EB-Rivalen desselben Pfades klar unterscheiden (anderes Geschlecht, andere Hauptfarbe), aber dasselbe Pfadzeichen tragen.

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

## 1. Dateien je Rivale (4 je Rivale, insgesamt 40)
`characters/rv_<p>_2_walk.png` (64x128) · `portraits/heads/rv_<p>_2.png` (24x24) · `portraits/rv_<p>_2_emotions.png` (256x64: neutral, spöttisch, wütend, respektvoll) · `battle/enemy_rv_<p>_2.png` (288x240, Blick links). Vorlagen wie EB.

## 2. Die Rivalen
| ID | Name | Pfad | Aussehen |
|---|---|---|---|
| `rv_laterne_2` | Ada Vellacott | Laterne | Frau um 30, dunkelgrünes Reisekleid, Laterne an langem Stab, hochgestecktes Haar, stolzer Blick |
| `rv_faden_2` | Rupert Glass | Faden | älterer Schneider, Maßband um den Hals, Ärmelschoner, Brille auf der Nasenspitze, Fadenspulen am Gürtel |
| `rv_maske_2` | Liesl Varga | Maske | junge Schauspielerin, Federhut, Pelzkragen, hält eine Stabmaske vor das halbe Gesicht |
| `rv_echo_2` | Emmerich Dahl | Echo | Organist, langer schwarzer Mantel, Notenrolle unter dem Arm, wirres graues Haar |
| `rv_kessel_2` | Clara Penhallow | Kessel | Apothekerin, Lederschürze voller Fläschchen, hochgekrempelte Ärmel, freundlich-gefährliches Lächeln |
| `rv_eisen_2` | Hedda Krone | Eisen | Schmiedin, Lederweste, kräftige Arme, kurzer Zopf, Hammer am Gürtel |
| `rv_schluessel_2` | Elmer Seely | Schlüssel | schmaler Junge um 18, zu großer Mantel, Schlüsselbund klimpert, flinker Blick |
| `rv_sq_waage_2` | Julius Arkwright | Waage | Bankier, Zylinder, Nadelstreifen, Geldbörse an Kette, kühles Gesicht |
| `rv_sq_moor_2` | Oskar Mire | Moor | Torfstecher, Wathose, nasser Filzhut, Laterne mit grünem Glas |
| `rv_sq_uhr_2` | Wilma Tock | Uhr | Uhrmacherin, Lupenbrille auf der Stirn, Weste voller Zahnräder, Taschenuhr in der Hand |

## 3. Abnahme
☐ 40 Dateien · ☐ Maße wie EB · ☐ Alpha binär, ≤ 32 Farben · ☐ jeder Koop-Rivale klar anders als der EB-Rivale desselben Pfades · ☐ Vorschau + check.txt

**Einbau (macht nicht Codex):** `rivale2_<p>_<seq>` bekommt `sheet: enemy_rv_<p>_2`.
