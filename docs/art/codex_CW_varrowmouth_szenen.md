# Codex-Paket CW: Varrowmouth-Szenen, Kampf-Hintergründe, Karten und Pegeluhr-HUD

**Batch-Name:** `varrowmouth2` (Manifest: `public/sprites/manifest-varrowmouth2.json`)

Zu den Tilesets aus Paket CV lieferst du die **großen Bilder**: Kapitelkarte, Stadtkarte mit Gezeitenzuständen, Kampf-Hintergründe, Szenenbilder der Hauptakte, Schlussbilder der vier Enden, Effekte des Gezeitenwechsels und die Pegeluhr im HUD. Muster: `public/sprites/manifest-briarholt1.json` (Szenen, Schlussbilder, Stadtkarte mit Nebel) und `manifest-calderwick2.json` (nur lesen).

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat. Halte das Paket klein: keine optionalen Extras, keine Varianten, die nicht unten stehen.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial world with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, genau mit den Namen unten.
- Manifest `public/sprites/manifest-<batch>.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-<batch>-preview.png`.
- Prüfskript (Pillow) unter `tools/art/<batch>/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-<batch>-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

## Gemeinsame Eckdaten „Kapitel 6: Varrowmouth“ (gilt für die Pakete CT bis DA)

Nach Briarholt (Kapitel 5) führt der letzte Weg ans Meer: **Varrowmouth**, die alte Zoll- und Hafenhauptstadt an einer Flussmündung, in der die Gezeiten die Stadt zweimal am Tag umbauen. Bei Ebbe liegen Schlickgassen, Wrackfelder und die unteren Zollkeller frei, bei Flut sind sie Wasser und nur die Stege, Brücken und Oberstraßen begehbar. Die Stadt wird vom **Pegelrat** regiert, sieben Zollherren, die ihre Macht aus einer Sache beziehen, die sie „das Register“ nennen: ein Verzeichnis aller Namen, die je durch den Hafen kamen. Wer im Register steht, kann die Stadt nicht verlassen, ohne dass der Rat es weiß. Der Spieler kommt mit einem Namen an, der schon drinsteht, obwohl er nie hier war. Kapitel 6 ist das **Finale des Spiels**: hier liegt der Grenzbezirk für das Seq-2-Ritual (Karte `hg_grenzbezirk`, siehe Pakete CO/CP, im Norden der Stadt hinter dem Zollzaun) und hier stehen die **Letzten Register**, die Ritualorte für Sequenz 1 (je Pfad eine Karte `vm_register_<pfad>`, siehe Paket DD). Kapitel 6 endet mit dem Aufstieg auf Sequenz 1 oder dem bewussten Verzicht darauf.

Feste IDs:
- Stadt `varrowmouth`, Präfixe: Karten `vm_`, Einwohner und Sprecher `vmn_`, Gegner `vme_`, Gegenstände `vmi_`, Musik `vm_`, Soundgruppe `varrowmouth`, Flags `k6_*`. Ankunfts-Flag `k6_arrived`, Abschluss `k6_done`.
- Stadtteile und Außenkarten (Paket CU legt sie an): `vm_zollhafen` (Ankunft, Zollhaus, Pegelturm), `vm_stegviertel` (Pfahlbauten, Markt auf Stegen), `vm_schlickgassen` (nur bei Ebbe), `vm_oberstrasse` (Reederhäuser, Pegelrat), `vm_wrackfeld` (Gefahrengebiet, Ebbe), `vm_leuchtbank` (Sandbank mit dem alten Leuchtfeuer, Gefahrengebiet), `vm_registerkeller` (Finale), `vm_grenzzaun` (Übergang zu `hg_grenzbezirk`).
- Gezeiten: feste Zustände `ebbe` und `flut`, Wechsel alle 6 Spielminuten (Vorschlag), Flag `gezeit` als flüchtiges Flag `gezeit_ebbe`/`gezeit_flut`; je Karte steht, was sich ändert. Die Pegeluhr am Zollhafen zeigt den Stand.
- Der Pegelrat (sieben Zollherren, Sprecher-IDs `vmn_rat_1` bis `vmn_rat_7`, Namen vergibt Paket CX), seine Vorsitzende **Ismay Harrow, die Pegelherrin** (`vmn_pegelherrin`, Endgegnerin, Boss-ID `pegelherrin`, ein Wesen auf Stufe eines Engels mit einem fremden Pfad „Register“, der nicht spielbar ist).
- Verbündete: **Tam Verrin** (`vmn_tam_verrin`), Lotsin ohne Eintrag, die den Spieler in die Stadt schmuggelt; **Pater Osric Dale** (`vmn_osric_dale`), Leuchtfeuerwärter und letzter Schreiber des alten Registers; **Nell Quarrie** (`vmn_nell_quarrie`), Kind aus den Schlickgassen, das Namen aus dem Register „vergessen“ kann.
- Gegner (Paket CZ beschreibt sie): `vme_zollgeist` (Beamter ohne Gesicht mit Stempel), `vme_gezeitenlaeufer` (Wasserleib auf Stelzen), `vme_salzkruste` (verkrusteter Ertrunkener), `vme_tauwerk` (lebendes Seil), `vme_hafenkraehe` (Schwarm), `vme_pegelknecht` (Wächter des Rats, Elite), Bosse `wrackmutter` (Wrackfeld), `leuchtfeuerwaechter` (Leuchtbank), `pegelherrin` (Finale, zwei Phasen).
- Zirkel in Varrowmouth: **Die Unverzeichneten** (`unverzeichnete`), geheimer Zirkel der Namenlosen, Treffpunkt im Kielraum eines Wracks; Zugang über Tam Verrin ab Beziehung +3.
- Anreise: aus den vier Briarholt-Enden (Paket CG, `docs/story/k5_akte/epiloge.json`, nur lesen) per Küstenbahn und Fähre; keine Rückreise in frühere Städte (feste Regel des Spiels).
- Sequenzen: Der Spieler kommt mit Sequenz 4 oder 3 an. Seq 2 (Engel) wird im Grenzbezirk möglich, Seq 1 erst nach dem Fall der Pegelherrin. Koop: beide Spieler stehen im Register, nur einer kann am Ende das Register schließen; wer es tut, ist eine Entscheidung mit zwei Epilogen.

## 1. Kapitelkarte und Titelbild
- `sequences/K6_karte.png` (240x135, opak): Kapitel-6-Karte wie die Kapitelkarten 1 bis 5 (`sequences/K*_karte.png`, nur lesen): Varrowmouth von oben, Flussmündung, Zollhafen, Stege, Leuchtbank, Nordzaun; Titel-Fläche frei, kein Text.
- `ui/titel_k6.png` (480x270, opak): Titelbild-Ebene für Kapitel 6 (Pegeluhr vor Nebelmeer), zum Austausch der Titel-Ebenen aus Paket AE.

## 2. Stadtkarte (`ui/vm_stadtkarte_ebbe.png`, `ui/vm_stadtkarte_flut.png`, je 480x270, opak)
Zwei Zustände derselben Karte: bei Ebbe liegen Schlickgassen, Wrackfeld und Kellerzugänge frei und sind begehbar gezeichnet, bei Flut sind sie Wasser mit Stegen darüber. Acht Pin-Flächen (ohne Pins) an den Orten der Eckdaten. Dazu `ui/vm_pins.png` (16x16-Streifen, 10 Marker: 8 Orte, Boot, Zirkel-Wrack) und `ui/vm_nebel.png` (480x270 Overlay mit Alpha, Nebel über den noch nicht besuchten Teilen, wie Briarholt).

## 3. Kampf-Hintergründe (`battle/bg_vm_<ort>_<gezeit>.png`, 480x270, opak)
Zehn Bilder: `zollhafen_flut`, `zollhafen_ebbe`, `stege_flut`, `schlick_ebbe`, `oberstrasse` (eine Fassung), `wrackfeld_ebbe`, `leuchtbank_flut`, `leuchtbank_ebbe`, `registerkeller_ebbe`, `grenzzaun` (Nebel, Zollzaun, Grenzsteine; Übergang zum Grenzbezirk aus Paket CO). Nachtvarianten nicht nötig, der Motor dunkelt ab.

## 4. Szenenbilder (`sequences/K6_<n>_<name>.png`, 240x135, opak, je 1 Bild; wo angegeben, 4 Frames in einer Reihe)
1. `ankunft`: Fähre im Nebel, Pegeluhr als erstes Licht (4 Frames: Licht wandert).
2. `zollkontrolle`: der Spieler vor dem Register-Pult, der Zollschreiber, der eigene Name sichtbar als leere Zeile (kein Text).
3. `schmuggel`: Tam Verrins Boot unter dem Steg bei Nacht.
4. `schlickgassen`: Nell auf einer Hauswand, Namen im Schlick als helle Linien.
5. `wrackmutter`: Boss-Einführung, Wrack öffnet sich (4 Frames).
6. `pegelrat`: sieben Stühle am Halbrund, einer leer, Wasserlinie an der Wand.
7. `leuchtfeuer`: Osric am Schreibpult, Glocke, Sturm draußen.
8. `leuchtfeuerwaechter`: Boss-Einführung.
9. `registerkeller`: Treppe hinunter, Wasser weicht zurück (4 Frames).
10. `pegelherrin`: Boss-Einführung, Ismay Harrow erhebt sich, hinter ihr die Namen als Wasserlinien (4 Frames).
11. `pegelherrin_phase2`: ihr Umriss aus Registerzeilen.
Schlussbilder je Ende, 480x270 opak: `sequences/K6_ende_schliessen.png`, `K6_ende_verbrennen.png`, `K6_ende_uebergeben.png`, `K6_ende_teilen.png` (zwei Figuren). Dazu `sequences/K6_abspann_hintergrund.png` (480x540, langsam scrollendes Meer bei Morgenlicht, opak).

## 5. Gezeitenwechsel-Effekte (`fx/vm_gezeiten.png`, 480x270-Zellen, 2 Reihen x 6 Frames; `fx/vm_warnung.png`, 32x32 x 8)
Vollbild-Übergang Ebbe → Flut (Wasser kommt von unten mit Nebelsaum) und Flut → Ebbe (Wasser zieht sich zurück, Schlick glänzt); Warnglocken-Symbol-Puls fürs HUD.

## 6. Pegeluhr-HUD und Oberfläche (`ui/vm_hud.png`, 128x64; `ui/vm_symbole.png`, 16x16-Streifen)
Pegeluhr als 48x48-Zifferblatt mit Zeiger-Overlay (12 Stellungen, je 16x16 in einem Streifen), Rahmen für „Ebbe in …“/„Flut in …“ (ohne Text), Zollsiegel-Marke, Register-Marke (türkis), Symbole: Ebbe, Flut, Wechsel, Boot, Zollsiegel, Registerseite, Unverzeichnete, Pegelrat, Leuchtfeuer, Grenzzaun, Namenlos-Ring, Schlicksohlen (12 Symbole; die letzten sechs zusätzlich 32x32 unter `items/32/` als Item-Icons `vmi_*`, plus die übrigen `vmi_*` aus Paket CU: insgesamt 12 Item-Icons 16+32).

## 7. Abgabe
PNGs, Manifest (Regionen, Frame-Listen, Pin-Positionen als Koordinaten), `tools/art/varrowmouth2/check.py`, Validation, Preview, README-Ergänzung, Pull Request.
