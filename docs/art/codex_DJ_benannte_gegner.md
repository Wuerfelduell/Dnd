# Codex-Paket DJ: Benannte Gegner (24 Elite-Varianten mit Namen, Geschichte, Grafik und Beute)

**Batch-Name:** `benannte` (Manifest: `public/sprites/manifest-benannte.json`) **und** Daten nach `docs/story/benannte_gegner/`

Neu: In jedem Gefahrengebiet des Spiels taucht ab Sequenz 6 selten ein **benannter Gegner** auf: eine Variante eines bekannten Gegners mit eigenem Namen, Geschichte, verändertem Aussehen, einer Eigenheit im Kampf und einem festen Beutestück (davon 8 als neue starke Beutestücke für die Fasserin-Aufträge aus Paket CR). Einmal besiegt, kommt er nie wieder; das Bestiarium bekommt eine eigene Seite. Muster für Varianten-Grafik: Umfärbungen plus ein neues Merkmal, wie die `_v2`-Blätter in Wexmoor (Paket BT, nur lesen).

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
24 benannte Gegner mit festen IDs `bn_<name>`, je 4 pro Stadt (Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt, Varrowmouth), Grundlage ist je ein bestehender Gegner (IDs aus `src/data/encounters.json`, `stadtgegner.json`, `wilds.json`, den `k*_orte`-Packs und `vorrat_gegner`; für Varrowmouth die `vme_*` aus Paket CZ). Beispiele für Namen und Eigenheiten, die du ausarbeitest und auf 24 bringst:
- Kettlegate: `bn_der_zehnte_rattenkoenig` (Rattenkönig mit Krone aus Zollmarken, ruft keine Ratten, dafür flieht er zweimal), `bn_schwester_glas` (Glasmöwe von Menschengröße, bleibt auf einer Stelle), `bn_der_leise_waechter` (Aschewächter ohne Flamme, nur Nerven-Schaden), `bn_holts_schatten`.
- Wexmoor: `bn_die_alte_torfleiche`, `bn_grubenlicht_mutter`, `bn_der_wurm_mit_namen`, `bn_schlickhund_koenig`.
- Dunscar: `bn_schaffner_ohne_zug`, `bn_schwellenhund_weiss`, `bn_der_zweite_vorhauer`, `bn_kalkbraut`.
- Calderwick, Briarholt, Varrowmouth: je 4 aus BH-Gegnern und `vme_*`, darunter `bn_der_zollgeist_mit_gesicht` (der einzige Zollgeist, der ein Gesicht hat, und es ist das des Spielers; Koop: Spieler 2).
Jeder hat: Fundort (Zone-ID), Erscheinungsregel (Flag, Sequenz ≥ 6, Nacht oder Gezeit, Zufall 10 %), eine Eigenheit (Mechanik in einem Satz), Leben und Schaden als Faktor zum Grundgegner (1,6 bis 2,5), Nerven-Schaden, eine Schwäche, festes Beutestück, Bestiarium-Text. 8 der Beutestücke sind neue starke Beutestücke `bnl_*` mit Fasserin-Artefakt `fa_bnl_*` (Name, Wirkung, Haken, Chance 40 bis 70 %; Format Paket CR).

## 1. Grafik
- Je benannter Gegner ein Kampf-Sheet `battle/enemy_bn_<name>.png` in der Zellengröße des Grundgegners (Reihen idle, attack1, attack2, hurt, defeated; 6 Spalten), abgeleitet aus dem Grundgegner mit neuer Palette und mindestens einem neuen Merkmal (Krone, Narbe, Kette, fehlender Teil, Licht), und ein Karten-Sheet `characters/bn_<name>.png` (wie der Grundgegner, 64x128 oder 32x48), wo der Grundgegner auf der Karte läuft.
- Kopf 24x24 und Bestiariums-Bild 64x64 (`ui/bestiar/bn_<name>.png`, größer als normal: eine Seite für sich).
- `fx/bn_auftritt.png` (96x96 x 8: Nebel teilt sich, ein Name-Schild ohne Text erscheint), `ui/bn_symbole.png` (16x16: benannt gesichtet, besiegt, Beute, Bestiariumsseite neu, Fasserin-tauglich), `items/bnl_<stueck>.png` (8, 16+32) und `items/fa_bnl_<stueck>.png` (8, 16+32).

## 2. Daten (`docs/story/benannte_gegner/`)
`gegner.json` (24 Einträge, Format `encounters.json` plus Felder `grundlage`, `erscheinen`, `eigenheit`, `schwaeche`, `beute_fest`, `einmalig: true`), `bestiarium.json` (je 3 bis 5 Sätze Geschichte: wer das war, bevor er das wurde), `auftritt.json` (je Gegner 2 Zeilen beim Erscheinen und 1 Zeile beim Fall, dazu 12 Gerede-Zeilen und 6 Zeitungsmeldungen über Sichtungen), `beute.json` (8 `bnl_*` mit Beschreibung, 8 `fa_bnl_*` nach Paket CR, Odas `pruefen`-Zeile je Stück), `README.md` (Erscheinungsregel-Spezifikation, Bestiarium-Seite, Koop: der benannte Gegner wählt den Spieler mit höherer Sequenz).

## 3. Abgabe
Grafik mit Manifest, `tools/art/benannte/check.py`, Validation, Preview; Daten mit `pruefen.mjs`; Pull Request mit Prüf-Ausgaben.
