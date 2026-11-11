# Codex-Paket DH: Die Nebelseite (Geisterwelt-Ebene aller Städte: Tiles, Wesen, Texte)

**Batch-Name:** `nebelseite` (Manifest: `public/sprites/manifest-nebelseite.json`) **und** Texte nach `docs/story/nebelseite/`

Geistsicht zeigt bisher Spuren in der normalen Welt (Screens `screenshot-geistsicht.png`, `src/world/Lighting.js`, nur lesen). Neu ab Sequenz 5: Der Spieler kann an bestimmten Orten (Spiegel, stilles Wasser, Nebelbänke) **auf die Nebelseite** wechseln: dieselbe Karte, aber als Geisterwelt. Häuser stehen als Umrisse, Wege führen woanders hin, Türen, die diesseits verschlossen sind, stehen offen, dafür gehen Wesen um, die drüben zu Hause sind. Jede Stadt hat drei Nebelseiten-Karten (Spiegelbilder bestehender Karten), mit eigenen Fundstücken, einem stillen Wesen, das Fragen beantwortet, und einem Preis: Unruhe steigt, solange man drüben ist.

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

## Eckdaten (feste IDs)
- Nebelseiten-Karten `ns_<karte>` als Spiegel bestehender Karten: Kettlegate `ns_altmarkt`, `ns_sternwarte`, `ns_katakomben`; Wexmoor `ns_salzmarkt`, `ns_flossfriedhof`, `ns_torfbrueche`; Dunscar `ns_bahnhof`, `ns_schwellenring`, `ns_speisewagen`; Calderwick `ns_terrasse_3`, `ns_landstrasse`; Briarholt `ns_kurhaus`, `ns_leitungsplan`; Varrowmouth `ns_zollhafen`, `ns_registerkeller` (Original-IDs in `src/data/maps/` und den `k*_orte`-Packs nachschlagen; wenn eine fehlt, die nächstliegende nehmen und im README nennen). Übergänge: `ns_uebergang_<n>` (Spiegel, Wasser, Nebelbank) als Props auf den Originalkarten.
- Wesen der Nebelseite `nsw_*`: `nsw_still` (das stille Wesen, je Stadt eine Fassung, beantwortet 3 Fragen je Tag), `nsw_umrissgaenger` (Gegner: Umriss eines Passanten ohne Inneres), `nsw_lampenfresser` (Gegner: frisst Licht, nur Laterne-Pfad sieht ihn ganz), `nsw_rueckwaertsgeher` (Gegner: geht rückwärts, greift beim Vorbeigehen an), `nsw_namenlose_kutsche` (Elite, fährt durch Wände), `nsw_spiegelspieler` (Boss, einmalig: der Spieler selbst von drüben, Kampf mit den eigenen Fähigkeiten; Koop: beide Spiegel).
- Regeln: Unruhe +1 je 20 Sekunden drüben; Rückkehr nur am Übergang; Gegenstände von drüben sind diesseits grau (eigene Kategorie `nebelseite` im Inventar); drüben gefundene Hinweise zählen für die Fallakte. Flags `ns_betreten_<karte>`, `ns_still_<city>_fragen`, `ns_spiegelspieler_done`.

## 1. Grafik
- Tileset `tilesets/ns_welt.png` (256x256): Boden aus Nebel mit Schlieren (4 Varianten, animiert über `tilesets/ns_anim.png` 256x32, 4 Frames), Umriss-Wände (nur Kanten, Alpha), Umriss-Dächer, umgekehrte Treppen, Wasser als Spiegel (hell), Türen offen, Wege aus Licht, Register-Zeilen am Boden (Varrowmouth). Palette: fast nur Grau-Blau mit Türkis-Kanten; Amber kommt nur von den Lichtern diesseits durch (ein Tile „Lichtfleck“ mit Alpha).
- Props `props/ns_props.png` (256x128): Spiegel-Übergang (32x32, 2 Zustände), Wasser-Übergang, Nebelbank-Übergang, verlorene Dinge (Schirm, Koffer, Brief, Lampe, Schuh je 16x16), Stühle ohne Sitzende, Kutsche (64x48), Nebelbaum, Uhr ohne Zeiger, Grenzstein.
- Wesen: Karten-Sheets 64x128 (`nsw_still` 32x48-Zellen, schwebend; Umrissgänger, Rückwärtsgeher, Lampenfresser 16x32; Kutsche 64x48 x 4 Frames in 2 Richtungen), Kampf-Sheets (64x64; Kutsche 96x64; Spiegelspieler: kein eigenes Sheet, der Einbau nutzt `battle_player` gespiegelt mit Overlay `battle/nsw_spiegel_overlay.png`, 48x48 x 4 Frames, Alpha), Köpfe 24x24, Bestiariumsbilder 48x48.
- Spieler drüben: Overlay `characters/ns_spieler_overlay.png` (16x32 x 4, Alpha-Schleier) und `fx/ns_wechsel.png` (480x270 x 8, Übergangsbild: Welt wird zu Umriss), `fx/ns_unruhe.png` (16x16 x 4, HUD-Puls), `ui/ns_symbole.png` (16x16: Übergang, drüben, zurück, stilles Wesen, Frage übrig, Fund von drüben, Unruhe-Takt).
- Kampf-Hintergründe `battle/bg_ns_<city>.png` (6, 480x270).

## 2. Texte (`docs/story/nebelseite/`)
- `karten.json`: je Nebelseiten-Karte (15) Beschreibung (3 Sätze), was anders liegt (Wege, offene Türen, ein Fundort), Fundstücke (2 bis 3, neue IDs `nsi_*`, höchstens 30 insgesamt, mit Name, Beschreibung, Wirkung-Vorschlag), Gegner-Plätze, Unruhe-Hinweis.
- `stilles_wesen.json`: je Stadt Fassung (Aussehen in 2 Sätzen für den Zeichner, Stimme), 20 Fragen mit Antworten je Stadt (Fragen zu Fällen, Figuren, Sequenzen; Antworten wahr aber schief, 2 Sätze), 3 Verweigerungen, Koop (zwei Fragende: das Wesen antwortet nur dem Leiseren).
- `wesen.json`: Gegner mit Werten im Format `encounters.json` (Sequenz-Erwartung je Stadt), Bestiarium-Texte, der Spiegelspieler mit Regel (kopiert die drei zuletzt benutzten Fähigkeiten des Spielers; friedliche Lösung: nicht angreifen, drei Runden, dann Gespräch 8 Knoten).
- `uebergaenge.json`: 20 Übergänge mit Originalkarte, Position-Vorschlag, Art, Bedingung (Seq 5, Nacht, Geistsicht aktiv), erster Betretens-Text (3 Sätze).
- `zeitung.json` (6), `gerede.json` (30: Leute, die „jemanden im Spiegel“ gesehen haben), `lesestuecke.json` (6, je 120 bis 180 Wörter: Berichte früherer Grenzgänger), README mit Mechanik-Spezifikation (Übergang, Unruhe-Takt, Inventar-Kategorie, Fallakte-Anbindung, Koop: beide müssen am Übergang stehen).

## 3. Abgabe
Grafik mit Manifest, `tools/art/nebelseite/check.py`, Validation, Preview; Texte mit `README.md`, `pruefen.mjs`; Pull Request mit Prüf-Ausgaben.
