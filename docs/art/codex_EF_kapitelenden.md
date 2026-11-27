# Codex-Paket EF: Kapitelende-Bilder Dunscar und Varrowmouth

**Batch-Name:** `enden` (Manifest: `public/sprites/manifest-enden.json`) · **8 PNGs** · Priorität 4

Fast jedes Fall- und Kapitelende zeigt ein Abschlussbild (`public/sprites/ui/endings/`). **Ohne Bild** sind bisher die vier Enden von Kapitel 3 (Dunscar, „Der letzte Zug nach Dunscar“) und die vier Enden von Varrowmouth (Kapitel 7, Gezeitenstadt).

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

## 1. Format
- **Opak** (kein Alpha), 480x270, indiziert ≤ 32 Farben, wie `public/sprites/ui/endings/k2_rein.png` und `ui/endings/c9_vey.png` (beide ansehen, Bildaufbau übernehmen: eine klare Szene, kein Text, Figuren klein, Stimmung im Licht).
- Stilreferenz Dunscar: `public/sprites/ui/titel_k3_*.png` und Kampfkulissen `battle/bg_ds_*.png`; Varrowmouth: `ui/titel_k6_*.png` und `battle/bg_vm_*.png`.
- Die Figuren der Szene stehen in `public/sprites/portraits/` (Gallowmere `k3_gallowmere_emotions.png`, Nell Quarrie `vmn_nell_quarrie_emotions.png`, Ismay Harrow `vmn_pegelherrin_emotions.png`).

## 2. Dateien
| Datei | Titel im Spiel | Szene |
|---|---|---|
| `ui/endings/k3_feierabend.png` | Feierabend für die Toten | Die Grube von Dunscar bei Morgengrauen; die Toten der Schicht legen ihre Lampen nebeneinander auf den Rand der Hängebank und gehen als blasse Umrisse fort; Lebende stehen draußen am Zaun. |
| `ui/endings/k3_stilllegung.png` | Stilllegung | Der große Hauptschalter im Maschinenhaus, umgelegt; alle Grubenlampen erloschen, nur eine Handlaterne des Spielers; Staub senkt sich. |
| `ui/endings/k3_gegenstimme.png` | Eine freiwillige Gegenstimme | Eine einzelne Person steht am Signalpult und hält den Hebel, eine türkise Linie läuft von ihr in die Tiefe; die anderen schauen von hinten zu. |
| `ui/endings/k3_vollzaehlig.png` | Die Schicht ist vollzählig | Die Schicht steht vollzählig in Reihe vor dem Förderkorb, zu viele Gestalten, manche mit leeren Gesichtern; ein Rundruf-Trichter, Gallowmere klein im Hintergrund. Unheimlich, kein Siegesbild. |
| `ui/endings/k6_ende_schliessen.png` | Die Namen tragen | Der Spieler allein im Registerkeller, ein schweres Register geschlossen in den Armen; durch die Tür sieht man Einwohner zur Oberstraße hinausgehen; Ebbe. |
| `ui/endings/k6_ende_verbrennen.png` | Das Register vernichten | Brennende Registerseiten über dem Wasser, eine Flutwelle läuft auf leere, geräumte Stege; kein Sieg, eine Pflicht. |
| `ui/endings/k6_ende_uebergeben.png` | Nells Schreiber | Nell Quarrie (Kind) sitzt am Pegelpult, der Spieler steht als Schreiber mit Feder hinter ihr; Lampenlicht, ernste Stimmung. |
| `ui/endings/k6_ende_teilen.png` | Zwei Hände bleiben | Zwei Figuren (Spieler 1 und 2, wie `characters/03_01_investigator_walk.png` und `characters/p2a_walk.png`) halten gemeinsam ein offenes Register auf dem Pegelturm, Möwen, Morgenlicht über dem Watt. |

## 3. Abnahme
☐ 8 Dateien, 480x270, opak · ☐ ≤ 32 Farben · ☐ kein Text · ☐ passt in Licht und Palette zu `k2_rein.png` · ☐ Vorschau + check.txt

**Einbau (macht nicht Codex):** `ENDING_IMAGES` in `assets.js` um die acht Ids ergänzen.
