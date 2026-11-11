# Codex-Paket DE: Die Fahrende Auktion (wandernde Versteigerung in allen Städten, Grafik und Texte)

**Batch-Name:** `auktion` (Manifest: `public/sprites/manifest-auktion.json`) **und** Texte nach `docs/story/fahrende_auktion/`

Neu fürs ganze Spiel: eine **Fahrende Auktion**, die alle paar Tage in einer anderen Stadt haltmacht (Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt, Varrowmouth) und seltene Dinge versteigert, auch solche, die der Spieler sonst verpasst hat (Zutaten höherer Sequenzen, Artefakte aus nicht gewählten Fährten, Beutestücke für die Fasserin). Der Spieler kann bieten, eigene Stücke einliefern und gegen drei feste Mitbieter antreten. Es gibt schon eine Auktion in Kettlegate (Salzmarkt-Auktion, `docs/story/`-Pakete T und Screens `T_auktion_*`; Bieten als Dialog: siehe `src/data/packs/k2_gilde/`, nur lesen): Die Fahrende Auktion ist eine eigene, reisende Figur mit eigenem Wagen und darf diese Logik wiederverwenden.

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

## Eckdaten
- Auktionatorin **Perpetua Vance** (`vmn_` ist falsch: eigenes Präfix `fa2_`; ID `fa2_vance`), Ende 50, reist mit einem Wagen aus Messing und Glas (`fa2_wagen`), einem stummen Träger (`fa2_traeger`) und einem Glockenhund (`fa2_hund`, kein Kampf). Drei feste Mitbieter: `fa2_bieter_reeder` (zahlt viel, selten), `fa2_bieter_witwe` (bietet auf Erinnerungsstücke), `fa2_bieter_zirkel` (bietet auf alles Okkulte, Mitglied eines zufälligen Zirkels). Die Auktion steht 2 Tage (Spieluhr) in einer Stadt, dann 3 Tage Pause; Flag `fa2_stadt_<city>`, `fa2_tag`. Nur in Städten, die der Spieler erreicht hat, nie in gesperrten.
- Lose: 6 je Halt, aus Listen je Stadt (bestehende Item-IDs aus `src/data/items.json`, den Packs `vorrat_items`, `sequenzen/zutaten.json`, `k3_handel`; nur lesen) plus 10 neue Lose `fa2_los_*` (Kuriositäten mit kleiner Wirkung). Startpreise aus dem Wert, Mitbieter mit Charakter (die Witwe hört bei Erinnerungsstücken nie auf). Einliefern: der Spieler gibt ein Stück ab, bekommt beim nächsten Halt den Erlös minus 15 %.

## 1. Grafik
- `characters/fa2_vance.png` (64x128), `fa2_traeger.png`, `fa2_hund.png` (32x32-Zellen, 4 Richtungen x 4), Portraits 64x64 + acht Stimmungen für Vance, vier für die Mitbieter (`fa2_bieter_*.png`, Lauf-Sheets 64x128), Köpfe 24x24.
- `props/fa2_wagen.png` (96x64, zwei Zustände: geschlossen auf Reisen, aufgeklappt als Bühne mit Pult; je 2 Frames Laterne), `props/fa2_lose.png` (16x16-Streifen: 10 neue Los-Icons `fa2_los_*`, plus 32x32), `props/fa2_hammer.png` (16x16 x 4), `props/fa2_tafel.png` (48x32, Anschlagtafel am Wagen, leer).
- `ui/fa2_auktion.png` (Oberflächen-Rahmen 240x135 als 9-Slice-Teile: Pult, Gebotsleiste, drei Mitbieter-Plätze, Hammer-Marke), `ui/fa2_symbole.png` (16x16: Gebot, Zuschlag, überboten, eingeliefert, Erlös, Pause, Wagen auf der Stadtkarte als Pin).
- `fx/fa2_zuschlag.png` (32x32 x 6), `fx/fa2_glocke.png` (16x16 x 4).
- Posen: Vance hämmern (4), auf Gebot zeigen (3), Träger Los hochhalten (3), Hund bellen (2).

## 2. Texte (`docs/story/fahrende_auktion/`)
- `vance.json`: Begrüßung je Stadt (6 x 2), Los-Aufruf-Muster (8 Varianten, mit Platzhalter `{los}`), Gebot angenommen (6), überboten (6), Zuschlag an Spieler (6), Zuschlag an Mitbieter (je Mitbieter 3), Einliefern (annehmen 4, ablehnen 3: zu billig, zu gefährlich, gestohlen), Erlös auszahlen (4), Abschied (4), Koop (6: zwei Spieler bieten gegeneinander).
- `bieter.json`: je Mitbieter Charakter, 6 Gebotszeilen, 3 Aufgeben-Zeilen, Vorlieben als Item-Kategorien, Höchstgebot-Regel (Prozent des Werts).
- `lose.json`: Listen je Stadt (12 bis 20 Item-IDs mit Startpreis), 10 neue `fa2_los_*` mit Name, Beschreibung, Wirkung (Vorschlag), Gewicht, Startpreis; Regel, welche verpassten Fährten-Artefakte ab welchem Kapitel auftauchen (Flags aus den Akten als Bedingung).
- `fahrplan.json`: Reihenfolge der Städte, Dauer, Pause, Ausnahmen (nicht während eines Festes aus Paket CK; nicht in Varrowmouth bei Flut am Steg).
- `zeitung.json` (8 Meldungen), `gerede.json` (30 Zeilen), `lesestuecke.json` (3: Vances Hausordnung, ein Zuschlagsprotokoll, ein Brief der Witwe).
- Mechanik-Spezifikation im README: Gebotsrunden als Dialog (Spieler bietet +10/+25/+50 %, Mitbieter antworten nach Höchstgebot und Vorliebe, Zufall ±10 %), Einlieferung, Erlös, Pin auf der Stadtkarte, Notizbuch-Eintrag „Nächster Halt“.

## 3. Abgabe
Grafik mit Manifest, `tools/art/auktion/check.py`, Validation, Preview; Texte mit `README.md`, `pruefen.mjs`; Pull Request mit Prüf-Ausgaben.
