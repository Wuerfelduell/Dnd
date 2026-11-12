# Codex-Paket DU: Dunscar-Wertstücke und Zirkelstücke (17 Item-Icons)

**Batch-Name:** `dunscarwert` (Manifest: `public/sprites/manifest-dunscarwert.json`)

Seit PR #386/#379 laufen drei Dunscar-Beutestücke und 14 neue Zirkelstücke (`dsz_*`) mit **Leihbildern** (`src/world/assets.js` → `ITEM_ICON_ALIASES` bzw. Bilder aus dem Vorrat `nebel200`; Daten in `src/data/buildContent.js` `DS_BEUTE_ITEMS` und `src/data/dunscarZirkel.js` `DS_ARTEFAKTE`/`DS_ITEMS`, nur lesen). Dieses Paket liefert **nur diese 17 Icons**, jeweils 16x16 unter `items/<id>.png` **und** 32x32 unter `items/32/<id>.png` (die vorhandenen `dsz_*`-Dateien werden überschrieben).

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
- Manifest `public/sprites/manifest-dunscarwert.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-dunscarwert-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-dunscarwert-preview.png`.
- Prüfskript (Pillow) unter `tools/art/dunscarwert/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-dunscarwert-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

**Stil-Referenz:** `items/ratssiegel.png`, `items/silberstaub.png`, `items/salzkristall.png` (die bisherigen Leihbilder: neue Icons müssen sich in 16x16 durch **Form** davon unterscheiden) und die DP-Lieferung `manifest-ritualicons.json`. Dunscar-Look: Kalk, Ruß, Messing, Bahn-Eisen, rotes Signallicht.

## 1. Beute-Wertstücke (3 IDs, Code existiert)
Steigender Wert sichtbar: Messing matt → Silber hell → Gold mit Glanzpunkt. Keine Münzen-Stapel, keine Rahmen.
| ID | Name | Bild |
|---|---|---|
| `ds_beute_messingmarke` | Messing-Schichtmarke | runde Messingmarke mit Loch oben, eingestanzte Schichtnummer als Kerben (keine Ziffern), abgegriffene Kante |
| `ds_beute_signalsilber` | Signalsilber | aufgewickelte Spule aus hellem Silberdraht, ein loses Drahtende, kleines rotes Isolierstück |
| `ds_beute_schichtgold` | Schichtgold | unregelmäßiger Goldklumpen mit Kalk- und Gesteinsresten, ein Amber-Glanzpunkt |

## 2. Zirkelstücke Dunscar (14 IDs, Code existiert)
Artefakte dürfen einen einzigen Türkis- oder Violettpunkt tragen; die vier „unmöglichen“ (Sanduhr, Spiegel, Herzwalze, Tresorscheibe) zusätzlich einen feinen violetten Schimmer am Rand. Waffen schräg von links unten nach rechts oben.
| ID | Name | Bild |
|---|---|---|
| `dsz_kalkherz` | Kalkherz | Uhrwerkherz aus Messing, Fugen mit weißem Kalk verschmiert |
| `dsz_weichenuhr` | Stehengebliebene Weichenuhr | Bahnhofstaschenuhr, Zeiger fest auf kurz nach vier, Sprung im Glas |
| `dsz_signallinse` | Rote Signallinse | dicke runde rote Glaslinse in Eisenring, innen ein heller Lichtpunkt |
| `dsz_lohnbuch` | Lohnbuch der Toten Schicht | schmales schwarzes Kassenbuch, Kalkstaub, ein rotes Lesebändchen |
| `dsz_rohrpost` | Rohrpostkapsel ohne Absender | Messingzylinder mit Lederkappen, leeres Adressfeld, Delle |
| `dsz_glasschluessel` | Okkulter Glasschlüssel | Schlüssel aus klarem Glas, türkiser Kern im Bart |
| `dsz_augenamulett` | Auge des Stellwerks | Amulett mit starrem Glasauge in Eisenfassung, Kette |
| `dsz_sanduhr` | Sanduhr, die rückwärts läuft | Sanduhr, Sand fließt sichtbar nach oben, violetter Rand |
| `dsz_spiegel` | Spiegel ohne Gestern | kleiner Handspiegel, Spiegelfläche zeigt nur einen hellen Schlitz, violetter Rand |
| `dsz_herzwalze` | Walze, die dein Herz spielt | Spieluhrwalze mit Stiften, die eine Herzkurve bilden, violetter Rand |
| `dsz_tresorscheibe` | Tresorscheibe der Dunscar-Bank | schwere runde Zahlenscheibe (nur Striche), Riss, violetter Rand |
| `dsz_schienennagel` | Geweihter Schienennagel (Waffe) | langer Hakennagel aus Bahn-Eisen, eingeritzte Linien, türkiser Punkt an der Spitze |
| `dsz_ofenhammer` | Hammer der Ofenmutter (Waffe) | kurzer, sehr klobiger Hammer, Kopf rußgeschwärzt mit Kalkkruste |
| `dsz_geisterlaterne` | Geisterlaterne (Verbrauch) | kleine Bahnlaterne, Flamme kalt türkis statt amber |

Ergebnis: 34 PNGs. Manifest mit ID → Dateien und Spalte „ersetzt Leihbild“.

## Prüfskript und Abgabe
- `tools/art/dunscarwert/check.py` (Pillow): alle unten genannten Dateien vorhanden, Maße exakt, binäres Alpha, höchstens 32 Farben, keine Datei pixelgleich mit dem bisherigen Platzhalter (vorher per `git show HEAD:<pfad>` vergleichen, wo eine Datei ersetzt wird). Bericht `docs/art/batch-dunscarwert-validation.json`.
- `docs/art/batch-dunscarwert-preview.png`, `docs/art/batch-dunscarwert-generation.json`, kurze README-Ergänzung.
- Pull Request nur mit deinen Dateien und der Ausgabe des Prüfskripts. Keinen Spielcode ändern.
