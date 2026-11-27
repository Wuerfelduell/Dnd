# Codex-Paket EA: Mythische Gestalt auf Sequenz 2 (alle 10 Pfade)

**Batch-Name:** `gestalt2` (Manifest: `public/sprites/manifest-gestalt2.json`) · **30 PNGs** · Priorität 2 (direkt nach DZ)

Fortsetzung von Paket DZ: die mythische Gestalt auf **Sequenz 2 („Engel“)**. Reihe der Stufen: Seq 4 roh (`hg_form_<p>`), Seq 3 gefestigt (`_s3`, Paket DZ), **Seq 2 engelhaft (dieses Paket)**, Seq 1 still (`_still`, vorhanden). Ist DZ noch nicht geliefert, trotzdem arbeiten: dann gilt die Seq-4-Vorlage plus die Beschreibung unten.

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
Wie Paket DZ: `characters/hg_form_<p>.png`, `battle/hg_battle_<p>.png`, `ui/hg_zug_<p>.png`, falls vorhanden die `_s3`-Fassungen aus DZ, dazu zum Vergleich `characters/hg_form_<p>_still.png` und `battle/hg_form_<p>_still.png`.
Engel-Bildsprache der Feinde (nur Stimmung, nicht kopieren): `battle/enemy_hs_engel_1.png` bis `_3.png`: Flügel aus **Lichtbahnen**, nicht aus Federn.

**Regel:** Weiterhin dieselbe Kreatur (Hauptfarbe, Kopf, Grundform bleiben), jetzt **schwebend**, mit **Flügeln oder Lichtbahnen, die aus dem Pfadmotiv gebaut sind**, und einem hellen Kern. Füllt die Zelle fast ganz: Karte ca. 30x46 px, Kampf ca. 80x92 px. Würdevoll, unheimlich, nicht niedlich. Weiß nur als Bein-Weiß `#ebcd8d`/`#bbae95`, Licht in Amber, Türkis sparsam.

## 2. Dateien (je Pfad 3, insgesamt 30)
| Datei | Maße / Raster |
|---|---|
| `characters/hg_form_<p>_s2.png` | 128x192, Zellen 32x48, 4x4 (unten/links/rechts/oben), Fußlinie y=46 (Schwebeschatten auf y=46, Körper 2–3 px darüber) |
| `battle/hg_battle_<p>_s2.png` | 576x576, 96x96, 6x6, Reihen idle/attack1/attack2/special/hurt/defeated, Blick rechts, Ausholpose je 2 gleiche Frames |
| `ui/hg_zug_<p>_s2.png` | 32x32 |

## 3. Aussehen je Pfad (Seq 2)
| Pfad | Seq 2: Engelsform |
|---|---|
| laterne | Sechs Lichtbahnen wie Flügel, jede endet in einer kleinen Laternenflamme; der Laternenkörper ist offen, im Inneren eine reine Amberflamme statt Gesicht. |
| faden | Flügel aus gespannten Fäden wie Harfensaiten zwischen langen Nadeln; die Gestalt hängt an Fäden, die nach oben aus dem Bild laufen (in der Zelle abgeschnitten). |
| maske | Ein Fächer aus Masken bildet zwei Flügel, alle Masken mit geschlossenen Augen; das Gesicht in der Mitte ist ein heller Spiegel. |
| echo | Konzentrische Schallringe als Flügel, die Glocke ist zur offenen Krone geworden; leichte Doppelkontur (Echo) an den Kanten, 1 px versetzt, dunkler. |
| kessel | Flügel aus Dampf, der in festen Pixelwolken steht; der Kessel glüht innen amber, die Deckelkrone schwebt als Heiligenschein über dem Kopf. |
| eisen | Flügel aus aufgefächerten Eisenplatten wie Klingen, verbunden mit Nieten; ein schwerer Schmiedering schwebt hinter dem Rücken, glühende Fugen. |
| schluessel | Zwei Türrahmen als Flügel, durch die man helles Licht sieht; Schlüssel kreisen wie ein Ring um die Hüfte; Gestalt schmal und hoch. |
| sq_waage | Die Waagschalen sind zu großen Flügelscheiben geworden, ausbalanciert; ein Waagbalken liegt über den Schultern wie ein Joch; Augen verbunden. |
| sq_moor | Flügel aus Schilf und Wollgras, in denen Wasser steht; der Körper ist durchscheinend dunkel wie Moorwasser mit einem bleichen Licht in der Brust. |
| sq_uhr | Zwei riesige Uhrzeiger als Flügel, ein Ring aus Zahnrädern als Heiligenschein; das Pendel ist zur Lichtsäule unter dem Körper geworden. |

**Kampfbewegungen:** idle langsames Schweben (Körper 1–2 px auf und ab, Schatten bleibt); attack1 Flügelschlag mit dem Pfadmotiv; attack2 Lichtbahn/Pfadmotiv schießt nach rechts; special volle Entfaltung, Flügel ganz offen, heller Kern; hurt Flügel zucken zusammen; defeated Flügel lösen sich in Pfadmaterial auf.

## 4. Bild-Prompt (je Frame, Beispiel Uhr)
```
[STYLE BLOCK]
Single pixel-art sprite frame, transparent background. Angelic stage of the "Clock" path creature: the same being as the reference image, now floating, with two enormous clock hands spread like wings and a halo made of brass gear wheels; its pendulum has become a column of amber light beneath the body. Solemn and eerie, not cute. Pose: <POSE>. Facing right, 3/4 top-down view. Fits a 96x96 cell, figure about 80 px wide and 92 px tall.
```

## 5. Abnahme
☐ 30 Dateien, Namen exakt · ☐ Raster wie Vorlage · ☐ Alpha binär · ☐ ≤ 32 Farben · ☐ Reihe Seq 4 → Seq 3 → Seq 2 → Seq 1 nebeneinander in der Vorschau, als Entwicklung lesbar · ☐ Flügel bleiben in der Zelle · ☐ Vorschau + check.txt

**Einbau (macht nicht Codex):** bei `pathway.seq === 2` die `_s2`-Fassung wählen.
