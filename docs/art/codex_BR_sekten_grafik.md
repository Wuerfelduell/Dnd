# Codex-Paket BR: Sekten-Grafik (Kultisten, Zeichen, Schreine, Ereignisse)

**Batch-Name:** `sekten` (Manifest: `public/sprites/manifest-sekten.json`) · **Daten dazu:** `codex_BQ_sekten.md` (läuft parallel; wenn `docs/story/sekten/grafik_briefe.md` schon im Repo liegt, danach richten, sonst nach dieser Datei)

Drei Kulte machen in allen drei Städten Ärger: **Der Aschenbund** (`sk_asche`, Feuer, Aschekreise, Heizer und Schornsteinfeger in rußgrauen Kutten mit Glutrot am Saum), **Die Flutkinder** (`sk_flut`, Wasser, Knotenseile, Ölzeug und nasse Bündel, Bojenlaternen, blasses Grüngrau) und **Der Stumme Chor** (`sk_chor`, gestohlene Stimmen, Kreidemund auf dem Tuch, Dunscarer Arbeiterkleidung mit kalkweißen Händen, violettes Summen). Du lieferst alle Grafik, die die Ereignisse brauchen.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial city called Kettlegate with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
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
- Manifest `public/sprites/manifest-sekten.json` wie `manifest-14b.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-sekten-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/preview-sekten.png`.
- Prüfskript (Pillow) unter `tools/art/sekten/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites.

## 1. Figuren (Pflicht)

### 1.1 Kultisten-Lauf-Sheets (`characters/`, 64x128, 4 Reihen unten/links/rechts/oben x 4 Frames)
Je Kult **4 Sheets**: `sk_<kult>_novize`, `sk_<kult>_sprecher`, `sk_<kult>_hand`, `sk_<kult>_haupt` (12 Sheets). Novizen sehen aus wie Bürger mit einem kleinen Zeichen (Aschefleck auf der Wange, Knoten am Handgelenk, Kreidestrich am Mund); Sprecher tragen Tarnberuf-Kleidung (Heizer, Fährmann, Vorarbeiter) mit Kultdetail; Hände tragen Kutte/Ölzeug/Chortuch; das Haupt ist 16x32, aber mit Überhang (Rauchfahne, Wasserschleppe, Schwarm aus Notenlinien) als zweites Sheet `sk_<kult>_haupt_aura.png` 32x48, 4 Frames Schleife.

### 1.2 Die 9 Figuren aus BQ (`characters/sk_*_walk.png`, `portraits/sk_*_emotions.png` 256x64, `portraits/heads/sk_*.png` 24x24)
IDs: `sk_asche_sprecher_ida`, `sk_asche_aussteiger_tobin`, `sk_asche_opfer_wenz`, `sk_flut_sprecher_maren`, `sk_flut_aussteiger_pell`, `sk_flut_opfer_lotte`, `sk_chor_sprecher_ansgar`, `sk_chor_aussteiger_rike`, `sk_chor_opfer_jost`. Stimmungen: neutral, misstrauisch, erschrocken, leichtes Lächeln. Aussteiger haben sichtbare Narben ihres Austritts (verbrannte Hand, Seilmale, ein Strich auf den Lippen).

### 1.3 Kampf-Sheets (`battle/enemy_sk_*.png`)
12 Gegner (4 je Kult): Novize 48x48, Hand 64x64, Sprecher 64x64, Haupt 96x96. Sechs Spalten: Idle 4, Angriff 6, Treffer 3, Ende 4, übrige Zellen transparent; die ersten zwei Angriffsframes sind identische Ausholposen. **Enden nicht tödlich**: Novize läuft weg, Hand wird von Nebel/Wasser/Stille verschluckt, Sprecher bricht zusammen und wird weggetragen, Haupt zerfällt zu Asche/Wasser/Noten. Je Haupt eine zweite Phasenreihe (`phase2`, 6 Frames). Dazu je Gegner ein Bestiariumsbild 96x128 (`bestiary/enemy_sk_*.png`).

## 2. Zeichen, Schreine, Sabotage auf der Karte (Pflicht)

| Datei | Format | Inhalt |
|---|---|---|
| `props/sk_zeichen.png` | 16x16, 12 Zellen (4 je Kult) | Erkennungszeichen als Lesestelle: Aschekreis auf Pflaster, verkohlter Türrahmen, Rußhand; Knotenseil am Poller, nasse Fußspur, Bojenmarke an der Wand; Kreidemund, Notenlinie auf Holz, Lippenabdruck in Kalk. Je Kult 1 Zelle „übermalt/entfernt“. |
| `props/sk_schrein_asche.png` | 48x48 + 4 Frames Glut 16x16 | Aschekreis mit Kohlebecken, verbrannte Akten, kleine Flammen (Schleife). |
| `props/sk_schrein_flut.png` | 48x48 + 4 Frames Tropfen | Bojenlaterne auf Kisten, Seile, Wasserlache, die atmet. |
| `props/sk_schrein_chor.png` | 48x48 + 4 Frames Puls | Kreis aus Kreidemündern, Stimmgabel, violettes Summen (Puls). |
| `props/sk_sabotage.png` | 16x16, 8 Zellen | vergifteter Brunnen (grüner Schaum), abgedrehte Laterne (dunkel), gesperrte Fähre (Kette), verklebter Bahnhebel, verbrannter Briefkasten, abgeschnittene Boje, leerer Chorplatz, markiertes Haus (Zeichen über der Tür). |
| `fx/sk_ereignis.png` | 32x32, 3 Reihen x 6 Frames | Rauchfahne (Asche), Wasserschwall (Flut), Notenschwarm (Chor), jeweils einmalig abgespielt, wenn ein Ereignis startet. |
| `ui/sk_umtriebe.png` | 16x16, 3 Reihen x 5 | HUD/Notizbuch: Kult-Symbol je Stufe 0–3 plus „niedergeschlagen“. |
| `ui/sk_karte_pins.png` | 12x12, 3 Zeichen + 3 Varianten „aktiv“ | Stadtkarten-Pins für betroffene Viertel. |

Prompt-Kern Zeichen: „small occult graffiti and tokens on cobblestone and wood, left by three cults: a circle of ash with a charred paper edge; a wet knotted rope and a buoy mark; a chalk mouth and a chalk stave line. Weathered, hand-made, unsettling, no letters“.

## 3. Items und Gegenmaßnahmen (Pflicht)
16x16 nach `items/<id>.png` und 32x32 nach `items/32/<id>.png`: `ski_aschensiegel`, `ski_glutkohle`, `ski_flutknoten`, `ski_bojenoel`, `ski_chorkreide`, `ski_stimmwachs` (Beute) sowie `ski_laeuterwasser`, `ski_seilschnitt`, `ski_stimmwachs_rein` (Gegenmaßnahmen) und 3 Artefakte `ski_art_aschenring`, `ski_art_flutkompass`, `ski_art_chorstimmgabel` (12 Icons in beiden Größen).

## 4. Optional, wenn Zeit bleibt
- Drei Zwischensequenzbilder 240x135, deckend (`ui/scenes/sk_asche.png`, `sk_flut.png`, `sk_chor.png`): Aufmarsch-Szene je Kult bei Stufe 3, Komposition wie `E_szene_*.png`.
- Zwei Kampfkulissen 480x270, deckend: Heizkeller mit Aschekreis, überflutete Kanalkammer.
