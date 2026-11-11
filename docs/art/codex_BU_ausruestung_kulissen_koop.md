# Codex-Paket BU: Sichtbare Ausrüstung, Kampfkulissen und Koop-Oberfläche (Grafik)

**Batch-Name:** `ausruestung2` (Manifest: `public/sprites/manifest-ausruestung2.json`)

Drei Lücken, die immer wieder auffallen: (1) Hüte, Mäntel und Waffen sind im Inventar, aber **nicht an der Figur** zu sehen; (2) Dunscar und mehrere Wexmoor-Zonen kämpfen vor Kettlegate-Kulissen; (3) der **Koop** zeigt Spieler 2 nur mit wenigen Symbolen. Du lieferst Grafik für alle drei.

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
- Manifest `public/sprites/manifest-ausruestung2.json` wie `manifest-14b.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-ausruestung2-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/preview-ausruestung2.png`.
- Prüfskript (Pillow) unter `tools/art/ausruestung2/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites.

## 1. Sichtbare Ausrüstung (Pflicht)
Die Spielerfiguren sind `characters/player*.png` (Ermittler), `p2a` (Schiebermütze) und `p2b` (Melone), 16x32, Lauf-Sheet 4x4. Ausrüstungs-Items stehen in `src/data/items.json` (`kind: "gear"` mit `slot` hat/coat/amulet, `kind: "weapon"`). Liefere **Overlay-Sheets im gleichen Raster** (64x128, Frame für Frame deckungsgleich, nur das Kleidungsstück, Rest transparent), je ein Sheet pro Figur und Stück:
- Hüte (alle `slot: "hat"`-Items, derzeit 8): `characters/gear/<figur>_hat_<itemid>.png`.
- Mäntel (`slot: "coat"`, derzeit 10): `characters/gear/<figur>_coat_<itemid>.png`.
- Waffen in der Hand (alle `kind: "weapon"`, derzeit 14): `characters/gear/<figur>_weapon_<itemid>.png`, Waffe in der rechten Hand, bei Blick nach oben hinter dem Körper verdeckt (Frame bleibt fast leer).
- Amulette als 2-Pixel-Glanz am Hals, ein Sheet je Figur: `characters/gear/<figur>_amulet.png`.
Drei Figuren x (8+10+14+1) = **99 Overlay-Sheets**. Dazu `characters/gear/korruption_overlay.png` 64x128: schwarzer Faden mit violettem Schimmer über Mantel/Waffe für korrumpierte Stücke (Paket BP). Manifest listet je Overlay die Item-ID und den Slot.

## 2. Kampfkulissen (Pflicht)
480x270, deckend, Komposition wie `battle/bg_*.png`: `bg_ds_schwellenring` (Drehscheibe im Kalkstaub), `bg_ds_rangierwueste` (Gleisfeld bei Nacht), `bg_ds_lohnbuero` (Büro mit Brett), `bg_ds_bruch` (Kalkbruch), `bg_ds_schlucht` (Schlucht mit Hängebrücke), `bg_ds_speisewagen` (innen), `bg_ds_unterschicht` (Tiefe, violettes Nachhall-Licht), `bg_wx_torfstich`, `bg_wx_pfahldorf`, `bg_wx_salzmarkt_nacht`, `bg_wx_altstadt_versunken`, `bg_wx_leuchtturm_sturm`. **12 Kulissen**, je eine Tagesvariante, 4 davon zusätzlich bei Nacht.

## 3. Koop-Oberfläche (Pflicht)
- `ui/koop2_rahmen.png` 48x48 9-slice in zwei Farben (Spieler 1 messing, Spieler 2 kühles Blau) für HUD und Notizbuch-Reiter.
- `ui/koop2_symbole.png` 16x16, 24 Zellen: Reihe 1 Spieler 1, Reihe 2 Spieler 2: „am Zug“, „wartet“, „gebunden“ (BN), „Anspruch offen“ (BG), „trinkt“, „liest“, „im Kampf“, „zurückgelassen“, „gibt weiter“, „Trennung“, „Wiedersehen“, „Koop-Geplauder“.
- `ui/koop2_portraits.png` 256x64 je Figur (`p2a`, `p2b`): Stimmungen neutral, misstrauisch, erschrocken, leichtes Lächeln, damit Spieler 2 in Dialogen ein Gesicht hat (Dateien `portraits/p2a_emotions.png`, `portraits/p2b_emotions.png`, Köpfe 24x24 unter `portraits/heads/`).
- `ui/koop2_trennung.png` 240x135, deckend: Zwischensequenz „die Wege trennen sich“ (ein Spieler bleibt im Speisewagen zurück).

## 4. Optional
- Verkleidungen auch als Overlay (Torfkittel, Fischerjacke, Akademierobe) statt eigener Sheets.
- Schatten-Sheet 16x8 unter Figuren für Tag/Nacht.
