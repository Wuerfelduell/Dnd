# Codex-Paket CV: Varrowmouth-Tilesets und Props (Hafen, Stege, Schlick, Oberstraße, Wrack, Leuchtbank, Innen)

**Batch-Name:** `varrowmouth1` (Manifest: `public/sprites/manifest-varrowmouth1.json`)

Die letzte Stadt des Spiels liegt am Meer und wird von den Gezeiten umgebaut. Du lieferst **sieben Tilesets je in zwei Gezeitenständen** (Ebbe und Flut), die Props dazu und die Gezeiten-Animationen. Szenen, Kampf-Hintergründe und Karten macht Paket CW, Figuren CY, Gegner CZ. Muster für Aufbau und Prüfung: `public/sprites/manifest-briarholt1.json` (Themen in zwei Zuständen kalt/warm) und `tools/art/briarholt1/` (nur lesen).

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

## 1. Tilesets (`tilesets/vm_<thema>_<gezeit>.png`, je 256x256, 16x16-Zellen)
Themen mit festen IDs: `vm_hafen` (Kai, Zollhaus-Pflaster, Poller, Kräne, Pegelturm-Sockel), `vm_stege` (Holzstege auf Pfählen, Pfahlbauten, Netze, Marktbretter), `vm_schlick` (nasser Schlick, Priele, Muschelbänke, halb versunkene Gassen mit Hauswänden bis Fensterhöhe), `vm_oberstrasse` (helle Reederhäuser, Granitstufen, Gaslaternen mit Salzkruste, Ratsgebäude-Fassade), `vm_wrack` (Wrackrümpfe, Spanten, Tauwerk, Algenteppiche), `vm_leuchtbank` (Sand, Treibholz, Leuchtfeuer-Fundament, Glocke), `vm_innen` (Zollhaus, Kielraum, Lotsenkammer, Registerkeller: nasse Steinwände, Aktenregale mit Wasserlinie, Gitterroste).

Je Thema zwei Dateien: `_ebbe` und `_flut`. Gleiche Zellenbelegung in beiden (dieselbe Zelle ist in beiden Dateien derselbe Ort), nur der Wasserstand ändert sich: Bei Flut sind Schlick, untere Treppen und Kellerböden Wasser (ruhige, dunkle Fläche mit sparsamen Lichtstreifen), bei Ebbe liegen sie frei mit Pfützen, Algen und Tang. Mindestbelegung je Datei: 8 Bodenvarianten, Wasser mit Rand nach 8 Richtungen (Blob-Set, 47er oder 16er, wie Briarholt), Wasserlinie an Wänden, 2 Treppen, 2 Brückenstücke, Stegkanten, 6 Wandstücke mit Fenstern und Türen, 4 Dächer, 3 Mauern/Geländer.

Palette: kühler als Briarholt, salziges Grau-Grün, Teer, gebleichtes Holz, Rost; Amber nur für Laternen und Fenster; Türkis nur am Register und an den Zollgeistern (nicht in den Tilesets).

Prompt-Muster: `[STYLE BLOCK] Tileset sheet 256x256 for a Victorian tidal harbour town at <low|high> tide, theme "<thema>": <Zellenliste>. Water drawn as flat dark slate-teal with sparse 1px highlight lines, mud as wet grey-green with small puddles. Seamless edges, blob autotile set, no characters.`

## 2. Gezeiten-Animationen (`tilesets/vm_wasser_anim.png`, 256x64)
Vier Reihen zu je 16 Zellen: Flutwasser (4 Frames Wellenbewegung), Ebbe-Priel (4 Frames rinnendes Wasser), Wasserlinie an Wand steigend (6 Frames), Wasserlinie fallend (6 Frames). Manifest-Feld `anims` mit Frame-Listen und Tempo wie `WX2_TILE_ANIMS` in Wexmoor (siehe `public/sprites/manifest-wexmoor8.json`).

## 3. Props (`props/vm_props.png`, 512x256, Regionen im Manifest)
Mindestens 60 Props: Poller, Taue, Kisten mit Zollstempel, Fässer, Netze, Reusen, Boote (klein, 48x32, mit Ebbe-Variante im Schlick liegend), Pegeluhr (32x64, mit Zeigerstellungen Ebbe/Flut/Wechsel als drei Regionen), Zollschranke, Laternen (3), Reeder-Schilder, Fischstand, Teekessel, Aktenregale (trocken, nass), Registerpult, Kielraum-Tisch, Lotsenkoje, Treibholz, Glocke der Leuchtbank (32x48), Leuchtfeuer-Laterne (32x32, 4 Frames Drehlicht), Wrackanker, Spanten, Muschelhaufen, Möwenschwarm-Prop (ruhend), Zollgeist-Stempelabdruck am Boden (türkis), Namenssteine der Unverzeichneten (4), Pfahlleitern.

## 4. Fassaden (`facades/vm_fassaden.png`, 512x128)
Sechs Häuserzeilen-Stücke für `buildingFacades()` (siehe `manifest-wexmoor8.json`, Feld `facades`, nur lesen): Zollhaus, Reederhaus, Pfahlbau, Kielraum-Wrack, Ratsgebäude, Leuchtfeuer-Turm (32 breit, 96 hoch). Je eine Nachtfassade (Fenster an) als zweite Reihe.

## 5. Abgabe
Alle PNGs, Manifest mit `themes` (je Thema beide Gezeiten), `anims`, `regions`, `facades`; `tools/art/varrowmouth1/check.py`, Validation, Preview (Kacheltest 8x8 je Thema und Gezeit), kurze README-Ergänzung. Pull Request mit Prüf-Ausgabe.
