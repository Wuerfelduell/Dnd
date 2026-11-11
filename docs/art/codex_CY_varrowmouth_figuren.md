# Codex-Paket CY: Varrowmouth-Figuren als Grafik (23 Figuren, Pegelherrin, Posen)

**Batch-Name:** `varrowmouth3` (Manifest: `public/sprites/manifest-varrowmouth3.json`)

Du zeichnest die **Menschen von Varrowmouth**: die vier festen Figuren, sieben Zollherren und zwölf Einwohner aus Paket CX (lies `docs/story/k6_figuren/figuren.md`, wenn vorhanden; sonst gelten die Kurzbeschreibungen unten). Muster für Umfang und Manifest: `public/sprites/manifest-wexmoor7.json` (elf Figuren mit Lauf-Sheets, Emotionen, Köpfen, Sonderposen) und `docs/art/README.md`, Abschnitt „Batch AO“ (nur lesen). Keine Platzhalter-Kästen: Jede Figur bekommt ein echtes Lauf-Sheet.

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

## 1. Pflichtumfang je Figur
- Lauf-Sheet `characters/<id>.png` (64x128, 4 Richtungen x 4 Frames, Grundlinie y=30). Nell Quarrie ist kleiner (Kind, wie Krabbe in AO).
- Portrait `portraits/<id>.png` (64x64, neutral) und Emotions-Sheet `portraits/<id>_emotions.png` (256x64, acht Stimmungen in zwei Reihen: neutral, misstrauisch, erschrocken, lächelnd / wütend, traurig, nachdenklich, entschlossen) für die vier festen Figuren und die sieben Zollherren; die zwölf Einwohner bekommen Portrait plus vier Stimmungen (128x64, Reihe 1).
- Kopf `portraits/heads/<id>.png` (24x24) für alle.

IDs: `vmn_tam_verrin`, `vmn_osric_dale`, `vmn_nell_quarrie`, `vmn_pegelherrin`, `vmn_rat_1` bis `vmn_rat_7`, `vmn_zollschreiber`, `vmn_fischerin`, `vmn_kantinenwirt`, `vmn_apothekerin`, `vmn_faehrmann`, `vmn_kielraum_wirtin`, `vmn_schlickmutter`, `vmn_uhrmechaniker`, `vmn_zollknecht`, `vmn_taucherin`, `vmn_zeuge_kettlegate`, `vmn_kurgast_briarholt`.

Kurzbeschreibungen, falls `figuren.md` fehlt: Tam Verrin Lotsin, Ölzeug dunkelgrün, Südwester, Trossen-Narbe über der Braue; Osric Dale über 70, Leuchtfeuer-Uniform ausgeblichen, Tinte an den Fingern, Brille; Nell Quarrie Kind, 11, zu große Zollmütze ohne Kokarde, nackte Füße voller Schlick; Ismay Harrow graues Amtskleid mit dunkler Wasserlinie auf Brusthöhe, Haar wie nasses Seegras, Gesicht fein liniert (keine Monsterzüge auf der Karte, das kommt im Kampf); Zollherren je ein Amt (Zoll, Pegel, Register, Hafen, Zunft, Kirche, Armenhaus), schwarze Amtsröcke mit verschiedenen Kragen, Alter 40 bis 80, zwei davon mit einem kaum sichtbaren türkisen Rand am Umriss (sie sind keine Menschen mehr); Einwohner nach Beruf, Salz- und Teerfarben, keine zwei gleichen Silhouetten.

## 2. Sonderposen (`characters/<id>_posen.png`, 16x32 je Frame in einer Reihe)
- Tam: rudern (4), Tau werfen (3), auf dem Poller sitzen (2).
- Osric: schreiben am Pult (4), Glocke läuten (4), zusammensinken (3).
- Nell: hocken und im Schlick schreiben (4), Name „wegwischen“ mit türkisem Funken (4), auf der Mauer sitzen (2).
- Pegelherrin: sitzen am Ratstisch (2), erheben (4), Wasserlinie steigt am Kleid (6, nur Farbwechsel).
- Zollschreiber: stempeln (4), Zettel reichen (2). Fischerin: Fisch ausnehmen (4). Fährmann: staken (4). Taucherin: auftauchen (4). Uhrmechaniker: an der Pegeluhr schrauben (4).

## 3. Kampfgegner aus den Figuren (`battle/`)
- `enemy_pegelherrin.png` (128x96-Zellen, 6 Spalten, Reihen idle, attack1, attack2, special, hurt, defeated): Phase 1 als Amtsfrau mit Wasserlinie, die bei jedem Treffer steigt.
- `enemy_pegelherrin_register.png` (128x128-Zellen, gleiche Reihen): Phase 2, ihr Körper aus Registerzeilen (helle horizontale Linien, türkis), Gesicht leer, hinter ihr schwebende Namenslinien. Dazu `fx/vm_namenslinien.png` (64x64 x 8) als Treffer-Effekt.
- `enemy_vmn_zollknecht.png` optional nicht nötig: die Pegelknechte macht Paket CZ.
- Boss-Einführungsbilder in CW; hier nur Kampf-Sheets.

## 4. Abgabe
Alle PNGs, Manifest mit Figuren-IDs, Frame-Listen, Tempo, Leerfeldern; `tools/art/varrowmouth3/check.py` (Pflichtumfang, Maße, Palette, Grundlinien, unterschiedliche Ausdrücke und Laufschritte, doppelte Ausholframes), Validation, Preview, README-Ergänzung, Pull Request.
