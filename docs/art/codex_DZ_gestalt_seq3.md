# Codex-Paket DZ: Mythische Gestalt auf Sequenz 3 (alle 10 Pfade)

**Batch-Name:** `gestalt3` (Manifest: `public/sprites/manifest-gestalt3.json`) · **30 PNGs** · Priorität 1

Ab Sequenz 4 kann man die mythische Gestalt seines Pfades annehmen (Grafik aus Codex-Paket CO, `docs/art/codex_CO_halbgott_grafik.md`). Auf Sequenz 1 gibt es schon die „stille Endgestalt“ (`*_still.png`). **Dazwischen fehlt die Entwicklung:** auf Sequenz 3 und 2 sieht die Gestalt noch genauso aus wie auf Sequenz 4. Dieses Paket liefert die Stufe **Sequenz 3 („Heiliger“)**; Sequenz 2 folgt in Paket EA.

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

## 1. Vorlagen (zuerst ansehen)
Für jeden Pfad `<p>` aus `laterne, faden, maske, echo, kessel, eisen, schluessel, sq_waage, sq_moor, sq_uhr`:
- Karte Seq 4: `public/sprites/characters/hg_form_<p>.png` (128x192, Zellen 32x48, 4x4, Reihen unten/links/rechts/oben, Fußlinie y=46)
- Kampf Seq 4: `public/sprites/battle/hg_battle_<p>.png` (576x576, Zellen 96x96, 6x6, Reihen idle, attack1, attack2, special, hurt, defeated; Blick nach rechts)
- Zugbild Seq 4: `public/sprites/ui/hg_zug_<p>.png` (32x32, Kopf/Oberkörper-Ausschnitt der Kampfgestalt)
- Zum Vergleich Seq 1: `characters/hg_form_<p>_still.png`, `battle/hg_form_<p>_still.png`
- Feinde derselben Stufe (nicht kopieren, nur Abstand halten): `battle/enemy_hs_heiliger_<p>.png`

**Regel:** Die Gestalt muss **sofort als dieselbe Kreatur** wie auf Seq 4 erkennbar sein (gleiche Grundsilhouette, gleiche Hauptfarbe), aber **gewachsen und gefestigt**: mehr Masse, klarere Form, das Pfadmotiv mehrfach. Größer im Rahmen: Karte ca. 24x45 px statt 20x44, Kampf ca. 60x90 px statt 48x85. Der Spieler soll beim Aufstieg sagen: „Oh, sie ist gewachsen.“

## 2. Dateien (je Pfad 3, insgesamt 30)
| Datei | Maße / Raster | wie Vorlage |
|---|---|---|
| `characters/hg_form_<p>_s3.png` | 128x192, 32x48, 4x4, Fußlinie y=46 | `hg_form_<p>.png` |
| `battle/hg_battle_<p>_s3.png` | 576x576, 96x96, 6x6, Reihen idle/attack1/attack2/special/hurt/defeated, Blick rechts, Ausholpose in attack1/attack2 je 2 gleiche Frames (wie Vorlage Frames 7–8 und 13–14) | `hg_battle_<p>.png` |
| `ui/hg_zug_<p>_s3.png` | 32x32, 1 Bild | aus dem neuen Kampfblatt abgeleitet |

## 3. Aussehen je Pfad (Seq 3 = Seq-4-Gestalt + folgendes)
| Pfad | Seq-4-Name | Seq 3: was sich ändert |
|---|---|---|
| laterne | Leuchtgestalt | Der Körper ist jetzt ein Laternengehäuse aus dunklem Messing mit drei Glasfenstern, dahinter ruhiges Amberlicht; zwei kleinere Laternen schweben an Ketten um die Schultern. |
| faden | Nahtgespinst | Mehr Fäden, jetzt straff gespannt wie Saiten; aus dem Rücken wachsen vier dünne Spinnfinger, an jedem eine Nadel; die Nähte am Körper sind sauber, nicht mehr ausgefranst. |
| maske | Hundertmiene | Die Masken ordnen sich zu einem Kranz um den Kopf (fünf sichtbare Gesichter), das mittlere Gesicht ist glatt und leer; Mantel aus Theaterstoff mit Faltenwurf. |
| echo | Hohlklang | Der Rumpf ist ein offener Glockenkörper; um ihn kreisen drei Schallringe (helle Bögen in Bein-Weiß), der Mund ist ein dunkles Loch, aus dem schwach Türkis schimmert. |
| kessel | Siedeleib | Der Bauch ist ein Kupferkessel mit Deckelkrone, aus den Schultern steigen zwei Dampfsäulen; Arme mit Messingrohren umwickelt, Tropfen grünlich, nicht giftgrün. |
| eisen | Nietkoloss | Breiter, mit Plattenpanzer aus genieteten Eisenplatten; ein Arm endet in einem Hammerkopf, Rost an den Kanten, zwischen den Platten glüht es schwach rot-orange. |
| schluessel | Türhüter | Ein Türrahmen steht jetzt hinter der Gestalt wie ein Rückenschild; am Gürtel ein großer Schlüsselring (sieben Schlüssel), Hände länger, Finger wie Dietriche. |
| sq_waage | Gewichtsträger | Zwei Waagschalen schweben links und rechts auf Schulterhöhe, an der Brust ein Gegengewicht wie ein Pendelstein; Haltung aufrecht und streng. |
| sq_moor | Torfleib | Größer und schwerer, Moos und Wollgras wachsen über die Schultern, im Brustkorb ein dunkles Wasserauge; Schritte hinterlassen Schlick (nur in den Karten-Frames am Fuß angedeutet). |
| sq_uhr | Pendelgestalt | Im Rumpf ein sichtbares Uhrwerk mit zwei Zahnrädern, ein langes Pendel schwingt unter dem Körper; Kopf wie ein Zifferblatt ohne Ziffern. |

**Bewegungen im Kampf:** idle ruhiges Atmen/Schweben; attack1 Nahangriff mit dem Hauptmotiv; attack2 das Pfadmotiv greift aus (Licht, Fäden, Masken, Schallring, Dampf, Hammer, Tür, Waagschale, Torfranke, Pendel); special großer Pfadeffekt um die Figur (bleibt in der Zelle); hurt zurückzucken; defeated zerfällt in das Pfadmaterial.

## 4. Bild-Prompt (je Frame, Beispiel Laterne)
```
[STYLE BLOCK]
Single pixel-art sprite frame, transparent background. A mythical creature form of the "Lantern" path, stage two: a towering being whose torso is a dark brass lantern housing with three glass panes and calm amber light inside; two smaller lanterns float on chains around its shoulders. It is clearly the same creature as the reference image, but larger, more solid and more defined. Pose: <POSE>. Facing right, 3/4 top-down view. Fits a 96x96 cell, figure about 60 px wide and 90 px tall, feet on the bottom row.
```
`<POSE>` je Reihe/Frame ersetzen; die Seq-4-Vorlage als Bildreferenz mitgeben.

## 5. Abnahme (☐ vor Lieferung abhaken)
☐ 30 Dateien, Namen exakt · ☐ Maße und Raster wie Vorlage · ☐ Alpha binär, Hintergrund transparent · ☐ ≤ 32 Farben · ☐ jede Gestalt eindeutig als Weiterentwicklung der Seq-4-Form erkennbar · ☐ deutlich größer als Seq 4, aber nicht über den Zellrand · ☐ Kampf schaut nach rechts · ☐ Vorschau + check.txt beigelegt

**Einbau (macht nicht Codex):** `assets.js` registriert `hg_form_<p>_s3`/`hg_battle_<p>_s3`, `WorldScene`/`CombatScene` wählen bei `pathway.seq === 3` die `_s3`-Fassung (wie heute `_still` bei Seq 1).
