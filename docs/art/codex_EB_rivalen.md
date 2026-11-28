# Codex-Paket EB: Die zehn Rivalen (Spieler 1)

**Batch-Name:** `rivalen` (Manifest: `public/sprites/manifest-rivalen.json`) · **30 PNGs** · Priorität 3

Ab Wexmoor hat jeder Spieler einen **Rivalen auf demselben Pfad** (`src/data/rivale.js`, nur lesen). Er taucht auf Straßen auf, kauft Zutaten weg, steht im Ritualkreis, kämpft, kann Verbündeter werden. Seit PR #657 kämpft er mit einem Skript-Kampfblatt je Pfad (`battle/enemy_rv_<pfad>.png`, erledigt, **nicht neu machen**). Es fehlen aber weiter **Kartenfigur, Kopf und Porträt**: der Rivale hat kein Gesicht. Dieses Paket gibt den zehn Rivalen von Spieler 1 eins.

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

## 1. Vorlagen
- Laufblatt: `public/sprites/characters/fasserin_walk.png` (64x128, Zellen 16x32, 4x4: unten/links/rechts/oben, Fußlinie y=30)
- Kopf: `public/sprites/portraits/heads/vmn_fischerin.png` (24x24)
- Porträt mit 4 Stimmungen: `public/sprites/portraits/fasserin_emotions.png` (256x64, vier 64x64-Bilder nebeneinander)
- Zum Abgleich der Farben: das vorhandene Kampfblatt `public/sprites/battle/enemy_rv_<pfad>.png` (Kleidung und Hauptfarbe passend halten)

## 2. Dateien je Rivale (3 je Rivale, insgesamt 30)
| Datei | Maße |
|---|---|
| `characters/rv_<p>_1_walk.png` | 64x128 (16x32, 4x4, Fußlinie y=30) |
| `portraits/heads/rv_<p>_1.png` | 24x24 |
| `portraits/rv_<p>_1_emotions.png` | 256x64, Reihenfolge: **neutral, spöttisch, wütend, respektvoll** |

## 3. Die Rivalen
Alle sind menschliche Beyonder in Alltagskleidung der Zeit (Mantel, Weste, Hut oder Tuch), mit **einem** klaren Erkennungszeichen ihres Pfades. Sie sollen auf der Karte zwischen Passanten auffallen, aber nicht wie Monster wirken. Wesen aus `RIVALE_ART`.
| ID | Name | Pfad | Wesen | Aussehen |
|---|---|---|---|---|
| `rv_laterne_1` | Corvin Ashby | Laterne | eitel und laut | Mann um 30, langer heller Mantel mit Messingknöpfen, gepflegter Schnurrbart, trägt eine kleine Taschenlaterne an der Brust, Kinn hoch |
| `rv_faden_1` | Mirela Stroud | Faden | geduldig, verschlagen | Frau um 40, schwarzes Spitzenkleid, Nadelkissen am Handgelenk, ein roter Faden um die Finger gewickelt, schmales Lächeln |
| `rv_maske_1` | Silas Morrel | Maske | charmant und falsch | Mann um 35, eleganter Gehrock, Halbmaske aus Porzellan am Gürtel, gewinnendes Gesicht, Hut schief |
| `rv_echo_1` | Petra Sandor | Echo | leise, hartnäckig | junge Frau, grauer Kapuzenmantel, Hörrohr aus Messing an einer Schnur, Blick nach unten |
| `rv_kessel_1` | Bram Sutter | Kessel | gastfreundlich, gefährlich | kräftiger Mann um 50, Schürze über der Weste, Flachmann und kleiner Kupferbecher, rote Wangen, breites Grinsen |
| `rv_eisen_1` | Garrick Holm | Eisen | direkt, stur | breiter Mann, kurz geschoren, Arbeiterjacke, Nietenhandschuh an einer Hand, Narbe über der Braue |
| `rv_schluessel_1` | Nell Quist | Schlüssel | flink, frech | junge Frau, Schiebermütze, Dietrichrolle am Gürtel, viele Taschen, verschmitzt |
| `rv_sq_waage_1` | Ottoline Brack | Waage | kühl, genau | Frau um 45, strenges Kostüm, Zwicker, Kontobuch unter dem Arm, kleine Goldwaage an der Uhrkette |
| `rv_sq_moor_1` | Fenna Caddow | Moor | langsam, unerbittlich | große Frau, Ölmantel, schlammige Stiefel, Wollgras im Haar, Torfspaten auf dem Rücken |
| `rv_sq_uhr_1` | Tobias Merrin | Uhr | ungeduldig, berechnend | hagerer Mann, Weste mit drei Taschenuhrketten, Lupe im Auge, tippt ungeduldig mit dem Fuß (Idle) |


## 4. Bild-Prompt (Beispiel Laufblatt-Frame)
```
[STYLE BLOCK]
Single 16x32 overworld character frame, transparent background: Corvin Ashby, a vain man around 30 in a long pale coat with brass buttons, groomed moustache, a small pocket lantern hanging on his chest, chin raised. Walking pose <N> of 4, facing <DIRECTION>. Feet on pixel row 30.
```

## 5. Abnahme
☐ 30 Dateien · ☐ Laufblätter exakt 64x128, Fußlinie y=30 · ☐ Porträts 4 Stimmungen in der Reihenfolge · ☐ Alpha binär, ≤ 32 Farben · ☐ jeder Rivale auf Anhieb vom anderen unterscheidbar · ☐ Vorschau + check.txt

**Einbau (macht nicht Codex):** Rivalen-Begegnung zeigt Figur + Porträt (Ui.openRivale), Figur steht auf der Karte.
