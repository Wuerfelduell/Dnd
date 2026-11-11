# Codex-Paket DL: Erfolge (80 Erfolge mit Icons, Texten und Fallakten-Seite)

**Batch-Name:** `erfolge` (Manifest: `public/sprites/manifest-erfolge.json`) **und** Texte nach `docs/story/erfolge/`

Neu: eine Seite im Notizbuch „Akte des Ermittlers“ mit **80 Erfolgen**: stille Marken für Dinge, die der Spieler getan hat (Fälle, Enden, Sequenzen, Zirkel, Sammlungen, Koop, Kuriositäten). Kein Punktesystem, keine Rangliste, keine Belohnung außer einem Satz und einem Icon; ein paar Erfolge schalten ein Haus-Stück (Paket DG) oder eine Titel-Variante (DM) frei. Du lieferst Icons und Texte sowie die Bedingungen als Flags oder Zähler, die es im Spiel schon gibt (Flags aus den Packs, `src/data/*.json`, nur lesen; wenn ein Zähler fehlt, nenne ihn als Vorschlag im README).

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

## 1. Die 80 Erfolge (`erfolge.json`)
Je Erfolg `{ "id": "erf_<name>", "name" (2 bis 4 Wörter), "text" (1 Satz, trocken, im Ton eines Aktenvermerks), "versteckt": bool (Name sichtbar, Text erst nach Erfüllung), "bedingung": { "requires_flags" oder "zaehler": { id, min } }, "freischaltung": optional haus_<stueck> oder titel_<n>, "koop": bool }`. Gruppen:
- Fälle und Kapitel (16): jeder Fall 1 bis 9 geschlossen, Kapitel 2 bis 6 beendet, alle vier Enden eines Kapitels gesehen (über Spielstände, als Zähler-Vorschlag), Fall 7 falsch beendet und Fall 8 trotzdem gelöst.
- Sequenzen (12): jede Stufe 8 bis 1 erreicht, Kreaturform zum ersten Mal, 50 % Verdauung ohne Kontrollverlust, Verzicht auf Seq 1, alle zehn Pfade in verschiedenen Spielständen gesehen (versteckt).
- Zirkel und Beziehungen (12): Mitglied in jedem Zirkel, zwei Zirkel zugleich, Beziehung +5 mit 5 Figuren, feindselig mit 3, ein Geschenk abgelehnt bekommen, Fasserin-Auftrag erfolgreich und misslungen, Bürge gefunden.
- Welt (16): alle Lesestücke einer Stadt, Bestiarium voll je Stadt, 10 benannte Gegner (DJ), erste Auktion gewonnen (DE), Tier Stufe 3 (DF), Haus voll (DG), Nebelseite jeder Stadt (DH), 50 Briefe gelesen (DI), Fest besucht, drei Feste.
- Kampf (12): Boss ohne Treffer, Kampf nur mit Nerven-Fähigkeiten, Flucht vor dem Grauspäher, Grauspäher besiegt, 100 Kämpfe, kein Kampf in einer ganzen Stadt (versteckt), Starling Phase 2 in 5 Runden.
- Koop (8): zwei Pfade, zwei Tiere, Duo-Kampf ohne Niederlage je Kapitel, das Register geteilt.
- Kuriositäten (4, versteckt): in jedem Haus geschlafen, 1000 Schritte im Schlick, mit Nell Namen gewischt, am Ende nicht getrunken.

## 2. Grafik
- `ui/erfolge_icons.png` (Atlas 16x16, 10 Spalten x 8 Reihen = 160x128) und `ui/erfolge_icons_32.png` (320x256): 80 Icons in zwei Zuständen (erfüllt farbig, offen als Prägung: zweite Datei `_offen` je Größe, grau mit 1px Lichtkante). Motive sind Aktenstempel, Siegel, kleine Gegenstände; keine Pokale, keine Sterne.
- `ui/erfolge_rahmen.png` (9-Slice 48x48 für die Akte-Seite, Kopfzeile mit Stempel-Fläche, Reihen-Trenner), `ui/erfolge_stempel.png` (32x32 x 6 Frames: Stempel fällt, beim Freischalten), `ui/erfolge_symbole.png` (16x16: Gruppe Fälle, Sequenzen, Zirkel, Welt, Kampf, Koop, Kuriositäten, versteckt, neu).
- `fx/erfolg_meldung.png` (96x24 Rahmen für die Einblendung unten rechts, ohne Text).

## 3. Texte
`meldungen.json`: 6 Einblendungs-Muster („Vermerk angelegt: {name}“), 4 Akte-Seiten-Zeilen (leer, halb, voll, alles versteckt gefunden), 4 Koop-Zeilen. `README.md`: Bedingungen als Tabelle mit Flag-Quelle (Pack, Datei), fehlende Zähler als Vorschlag (`zaehler_kaempfe`, `zaehler_schritte_schlick`, `zaehler_briefe`), Freischaltungen, Reihenfolge auf der Seite.

## 4. Abgabe
Grafik mit Manifest (Atlas-Index Erfolgs-ID → Zelle), `tools/art/erfolge/check.py`, Validation, Preview; Texte mit `pruefen.mjs` (80 IDs, keine doppelten, jede Bedingung nennt ein Flag oder einen Zähler); Pull Request mit Prüf-Ausgaben.
