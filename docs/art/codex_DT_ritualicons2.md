# Codex-Paket DT: Letzte Leihbilder der Rituale: 3 Wurfflaschen und 10 seltene Wexmoor-Funde

**Batch-Name:** `ritualicons2` (Manifest: `public/sprites/manifest-ritualicons2.json`)

Nach dem Einbau von Paket DP laufen nur noch 13 Gegenstände der Seq-4-Rituale mit **Leihbildern** (siehe `src/world/assets.js`, `ITEM_ICON_ALIASES`, Abschnitt „Seq-4-Rituale“, nur lesen): drei Wurfflaschen aus `src/data/seq4.js` und zehn seltene Funde aus Wexmoor, die Maud Keel ankauft (`src/data/packs/seq4_dr/wexmoor_einnahmen.json`, Abschnitt `seltene_funde`). Dieses Paket liefert **nur diese 13 Item-Icons**, jeweils 16x16 unter `items/<id>.png` **und** 32x32 unter `items/32/<id>.png`. Kleines Paket: nichts anderes zeichnen.

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

**Stil-Referenz:** die DP-Lieferung (`public/sprites/manifest-ritualicons.json`, besonders `items/s4ke_knallsud.png`, `items/s4ke_aetzwasser.png`, `items/s4ke_nachtschierling.png` und ihre 32er), dazu `items/giftflasche.png`, `items/blutsalz_phiole.png`, `items/salzkristall.png`, `items/torfbernstein.png`, `items/schlickperle.png`, `items/taschenspiegel.png`. Jedes neue Icon muss sich in 16x16 auf einen Blick von diesen Leihbildern **und** von den DP-Ritualtränken unterscheiden: andere Form, nicht nur andere Farbe.

## 1. Wurfflaschen (3 IDs, fest, Code existiert)
Kleine, handliche Wurfgefäße, dünner und einfacher als die DP-Ritualtränke (keine Siegelbänder), mit einem sichtbaren Griff- oder Zündmerkmal, damit man sie als Wurfwaffe erkennt.
| ID | Name im Spiel | Beschreibung im Spiel | Bild |
|---|---|---|---|
| `wurf_saeure` | Säurephiole | Dünnwandiges Glas voll grüner Säure, 22 Schaden, doppelt gegen Okkultes | schlanke Phiole, giftgrüner Inhalt, kleine Blasen, Glas an einer Stelle angefressen, Wachspfropfen |
| `wurf_gift` | Giftphiole | Ein Schwall gelben Dunstes, danach drei Runden Gift | bauchige kleine Flasche, schwefelgelber Dunst steht im Glas, ein Lappen um den Hals gebunden |
| `wurf_spreng` | Sprengflasche | Lampenöl, Pulver und ein Docht, 34 Schaden | dickwandige braune Flasche, Amber-Öl, Pulver als dunkle Schicht unten, Docht aus dem Korken, Funke an der Spitze |

## 2. Seltene Wexmoor-Funde (10 IDs, fest, Code existiert)
Naturfunde und Fundstücke aus Salzwatt, Vergessmoor, Altstadt und Leuchtturm. Keine Flaschen. Etwas Unheimliches an jedem Stück, aber zurückhaltend (höchstens ein Türkis- oder Violettpunkt, wo die Beschreibung etwas Unerklärliches nennt).
| ID | Name | Fundort | Bild (aus der Beschreibung im Spiel) |
|---|---|---|---|
| `wxf_salzglas` | Salzglas | Salzwatt | klare, kantige Scherbe mit weißen Salzadern, die sich kreuzen |
| `wxf_moorbernstein` | Moorbernstein | Vergessmoor | dunkles, tropfenförmiges Harz, darin ein vollkommen gerader heller Halm |
| `wxf_schlickperle` | Schlickperle | Salzwatt | matte, saubere Perle in einer schlickverkrusteten Metallfassung |
| `wxf_gezeitenzahn` | Gezeitenzahn | Salzwatt | alter Zahn, porzellanglatt, mit feinen Rillen quer |
| `wxf_schwarzlot` | Schwarzlot | Altstadt | dunkler Metallklumpen mit Abdrücken runder Leitungen, Rostkanten |
| `wxf_torfkompass` | Torfkompass | Vergessmoor | Messingkompass, unter dem Glas Torf, der sich zu einer feinen Linie zieht, Zeiger schief |
| `wxf_silberalge` | Silberalge | Salzwatt | getrocknete, verzweigte Alge zwischen zwei Glasplättchen, Silberadern |
| `wxf_nebelquarz` | Nebelquarz | Leuchtturm | Quarzspitze mit grauem, festem Nebel-Einschluss |
| `wxf_ankerfossil` | Ankerfossil | Vergessmoor | Steinplatte mit versteinerten Pflanzen in Form einer Ankeröse, rostfarbene Poren |
| `wxf_wattspiegel` | Wattspiegel | Leuchtturm | blinde Spiegelscherbe, auf der ein heller Horizontstreifen liegt, Ecke in schwarzes Papier geschlagen |

Seltenheit sichtbar machen ohne Rahmen: `gross`-Stücke (Nebelquarz, Ankerfossil, Wattspiegel) dürfen einen winzigen Glanzpunkt mehr haben, sonst gleiche Behandlung.

## 3. Prüfskript und Abgabe
- `tools/art/ritualicons2/check.py` (Pillow), Vorbild `tools/art/ritualicons/check.py`: für alle 13 IDs existieren `items/<id>.png` (16x16) und `items/32/<id>.png` (32x32), binäres Alpha, höchstens 32 Farben, Palette aus `manifest-ritualicons.json`, keine Datei ist pixelgleich mit ihrem bisherigen Leihbild (Liste der Leihbilder aus `ITEM_ICON_ALIASES` abschreiben). Bericht als `docs/art/batch-ritualicons2-validation.json`.
- Manifest `public/sprites/manifest-ritualicons2.json` mit ID → Dateien und Spalte „ersetzt Leihbild“.
- `docs/art/batch-ritualicons2-preview.png` (alle 13 als Raster, 16er dreifach vergrößert, ID darunter nur in der Vorschau), `docs/art/batch-ritualicons2-generation.json`, README-Ergänzung.
- 26 PNGs; Pull Request nur mit deinen Dateien, mit der Ausgabe des Prüfskripts.
