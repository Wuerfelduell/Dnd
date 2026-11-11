# Codex-Paket CQ: Fasserin-Aufträge als Grafik (Bestellen, Warten, Abholen, Misserfolg)

**Batch-Name:** `fasserin2` (Manifest: `public/sprites/manifest-fasserin2.json`)

Die Fasserin baut künftig aus **einem** starken Beutestück gegen Geld ein Artefakt, das erst beim nächsten Treffen desselben Zirkels fertig ist, mit Erfolgschance. Dafür fehlen Oberfläche und Bilder: Auftragszettel, Zustände, Erfolg und Scherben, Odas Posen, die Werkbank in vier Zuständen und 20 Artefakt-Icons. Oda selbst (Lauf-Sheet, Sitzbild, Portrait, Kopf) und ihre Werkbank gibt es schon (Batch `fasserin`); mach nichts davon doppelt. **Dieses Paket liefert nur Grafik** (etwa 35 PNG), Texte macht Paket CR.

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

## Gemeinsame Eckdaten „Fasserin-Aufträge“ (gilt für die Pakete CQ und CR)

Die Fasserin **Oda Kessel** sitzt mit 30 % Chance bei einem geheimen Treffen am Tisch (Paket BO, `public/sprites/manifest-fasserin.json`, `src/data/packs/fasserin/`, nur lesen). Bisher tauscht sie sofort mehrere Beutestücke plus Lohn gegen ein Artefakt. **Neu:** Sie nimmt **ein einzelnes starkes Beutestück** plus Fasserlohn als **Auftrag** an. Das Artefakt ist erst beim **nächsten Treffen desselben Zirkels** fertig (im Kreidezirkel bestellt heißt: beim nächsten Kreidezirkel-Treffen abholen). Der Gastgeber händigt es aus, auch wenn Oda an dem Tag fehlt. **Erfolgschance 40 bis 80 %**, stärkere Artefakte haben die geringere Chance; sie steht vorher dabei. Bei Misserfolg ist das Beutestück hin, die Hälfte des Lohns kommt zurück. Der Würfel fällt beim Abholen und ist fest.

Zirkel mit festen IDs: `waage` (Die Stille Waage, Kettlegate), `kreide` (Der Kreidezirkel, Kettlegate), `russ` (Die Rußgesellschaft, Kettlegate), `lichtlose` (Die Lichtlosen, Wexmoor), `salz` (Die Salzbrüder, Wexmoor), `schichtbund` (Der Schichtbund, Dunscar).

Zustände eines Auftrags (feste IDs): `bestellt` (Stück und Lohn abgegeben), `in_arbeit` (zwischen den Treffen), `fertig` (liegt beim nächsten Treffen bereit), `misslungen` (Stück verloren, halber Lohn zurück), `abgeholt`.

Starke Beutestücke, die als Einzelstück zu einem Artefakt werden (feste IDs, Artefakt-ID `fa_<stueck>`), mit Chance:

| Beutestück | Herkunft | Artefakt (`fa_*`) | Chance |
|---|---|---|---|
| `rattenkrone` | Rattenkönig, Katakomben | `fa_rattenkrone` Krone des Rattenkönigs: Stadtgegner weichen | 70 % |
| `sternhirschgeweih` | Sternhirsch, Kraterwald | `fa_sternhirschgeweih` Sternhirsch-Reif: Geistsicht kostet weniger Unruhe | 55 % |
| `geweihreif` | Moorkönigin | `fa_geweihreif` Moorkrone: Gift und Schlick prallen ab | 50 % |
| `geisterkern` | Geister in Kettlegate | `fa_geisterkern` Kernphiole: einmal je Kampf einen Treffer schlucken | 60 % |
| `glasfeder` | Glasmöwen, Bojenhafen | `fa_glasfeder` Glaskiel: Erstschlag im Kampf | 75 % |
| `wachsherz` | Wachsfiguren, Fall 6 | `fa_wachsherz` Schlagendes Herz: Nerven erholen sich im Kampf | 65 % |
| `moorperle` | Torfbrüche | `fa_moorperle` Moorauge: Fallen auf Reisen werden sichtbar | 80 % |
| `schlickperle` | Floßfriedhof | `fa_schlickperle` Schlicktropfen: Wasserwege ohne Kahnkosten | 80 % |
| `brutschale` | Brut im Schlachthof | `fa_brutschale` Brutschale: ein Begleitgeist im nächsten Kampf | 60 % |
| `moewenglas` | Salzbrüder-Beute | `fa_moewenglas` Möwenglas: Händlerpreise 10 % besser | 75 % |
| `irrlichtfunke` | Grubenlichter | `fa_irrlichtfunke` Funkenlaterne: Dunkle Karten sind hell | 70 % |
| `schaedelsplitter` | Katakomben-Elite | `fa_schaedelsplitter` Splitteramulett: Untote zögern | 65 % |
| `ratssiegel` | Fall 9 | `fa_ratssiegel` Ratssiegel: Türen der Oberstadt offen | 45 % |
| `medaille_polizei` | Revier-Belohnung | `fa_medaille_polizei` Ehrenmedaille: Ansehen fällt langsamer | 55 % |
| `fernrohr_messing` | Sternwarte | `fa_fernrohr_messing` Sternsucher-Okular: Hinweise aus der Ferne lesbar | 50 % |
| `bronzeglocke_klein` | Glockenstube, Fall 5 | `fa_bronzeglocke_klein` Stimmglöckchen: Chor-Gegner schweigen eine Runde | 60 % |
| `spinnfaden_lila` | Weberin | `fa_spinnfaden_lila` Nervenspule: Nervenfaden-Fähigkeiten billiger | 40 % |
| `linsenscherbe` | Leuchtturm | `fa_linsenscherbe` Leuchtturm-Monokel: Lügen im Verhör markiert | 45 % |
| `madenwachs` | Pestgassen | `fa_madenwachs` Wachssiegel: Krankheit haftet nicht | 70 % |
| `russklumpen` | Rußgesellschaft | `fa_russklumpen` Rußzeichen: Sekten erkennen den Spieler nicht | 65 % |

Die Wirkungen sind Vorschläge für den Einbau; die Namen und IDs sind fest. Die alten Mehrteil-Rezepte (`krone_der_sieben` usw.) bleiben als Grafik im Spiel, werden aber nicht mehr angeboten.

## 1. Auftragszettel und Zustände (Ordner `ui/`)
| Datei | Maße | Inhalt |
|---|---|---|
| `CQ_auftrag.png` | 5 Zellen 16x16 (80x16) | Zustände in der Reihenfolge `bestellt` (Zettel mit Wachssiegel), `in_arbeit` (Zettel mit Zange), `fertig` (Zettel mit türkisem Funken), `misslungen` (zerrissener Zettel, Scherben), `abgeholt` (Zettel mit Haken ohne Schrift) |
| `CQ_auftrag_32.png` | 5 Zellen 32x32 (160x32) | dieselben fünf groß, für die Auftragsliste |
| `CQ_chance.png` | 5 Zellen 16x16 (80x16) | Erfolgschance als Würfel-Marke: 40, 50, 60, 70, 80 % (fünf Füllstände eines kleinen Messingrahmens, keine Ziffern) |
| `CQ_zirkel_marke.png` | 6 Zellen 16x16 (96x16) | kleine Marke, bei welchem Zirkel der Auftrag liegt, in der Reihenfolge waage, kreide, russ, lichtlose, salz, schichtbund (Embleme aus `factions/` als Vorlage, hier als Wachssiegel) |
| `CQ_hud.png` | 4 Zellen 16x16 (64x16) | HUD: offener Auftrag, Auftrag beim nächsten Treffen fertig, Einladung mit Abholung, Oda heute anwesend |
| `CQ_einladung.png` | 96x48, opak | Einladungskarte (Zettel) mit Odas Zangenzeichen in der Ecke, wird im Einladungstext als Bild gezeigt, keine Schrift |
| `CQ_rahmen_auftrag.png` | 48x48 9-Slice (16er Raster) | Rahmen der Auftragskarte in der Treffen-Oberfläche: dunkles Holz, Messingecken |

## 2. Oda bei der Arbeit (Ordner `characters/`)
Sheet `fasserin_posen.png`, 16x32 je Frame, 5 Reihen x 6 Frames = 96x160, Blick nach unten, Grundlinie y=30, Farben wie `fasserin_walk.png`:
- Reihe 0 `pruefen`: nimmt das Beutestück, hält es gegen das Licht, nickt
- Reihe 1 `haemmern`: Zange und Hammer an der Werkbank (Schleife)
- Reihe 2 `uebergabe`: hebt ein kleines Bündel, reicht es, Hand zurück
- Reihe 3 `kopfschuetteln`: Misserfolg: schaut in die Hand, schüttelt den Kopf, wischt Scherben weg
- Reihe 4 `abwesend`: leerer Platz, nur die Zange liegt da (für Treffen ohne Oda; 6 Frames mit einem flackernden Licht)

Portrait-Ergänzung: `portraits/fasserin_emotions2.png`, 256x64, vier Stimmungen: zufrieden (Übergabe), bedauernd (Misserfolg), prüfend (Auftrag), müde (zwischen den Treffen).

## 3. Werkbank und Effekte (Ordner `props/` und `fx/`)
| Datei | Maße | Inhalt |
|---|---|---|
| `props/fasserin_werkbank_zustaende.png` | 4 Zellen 32x32 (128x32) | Werkbank leer, mit eingespanntem Beutestück, mit fertigem Artefakt unter Glasglocke, mit Scherben und Asche |
| `props/fasserin_auftragsbrett.png` | 32x48 | kleines Brett neben der Werkbank mit Haken für Zettel (bis zu vier Zettel-Positionen als Regionen im Manifest) |
| `fx/CQ_fassung_erfolg.png` | 8 Frames 32x32 (256x32) | das Artefakt wird gefasst: Metall klickt, türkiser Glanz, kurzer Lichtkranz |
| `fx/CQ_fassung_misslungen.png` | 8 Frames 32x32 (256x32) | Riss im Stück, dunkler Rauch, Scherben fallen, nichts Rotes |
| `fx/CQ_wuerfel.png` | 6 Frames 32x32 (192x32) | der Würfel fällt beim Abholen: Messingwürfel ohne Augen rollt, bleibt liegen, leuchtet türkis (Erfolg) oder matt (die letzte Zelle in zwei Varianten: Frame 4 Erfolg, Frame 5 Misserfolg) |

## 4. Artefakt-Icons (Ordner `items/` und `items/32/`)
Die 20 Artefakte aus der Tabelle oben als **16x16 unter `items/fa_<stueck>.png`** und **32x32 unter `items/32/fa_<stueck>.png`**. Jedes Icon zeigt das Beutestück in Fassung: Messing- oder Eisenrahmen, Lederband oder Kette, türkiser Funke nur bei okkulten Stücken (`geisterkern`, `irrlichtfunke`, `spinnfaden_lila`, `brutschale`). Die Vorlagen der rohen Beutestücke liegen unter `public/sprites/items/<stueck>.png` (nur lesen); das Artefakt muss daneben als veredelt erkennbar sein.

Prompt-Beispiel:
```
[STYLE BLOCK]
Single inventory icon, 32x32 pixels, transparent background. A small crown of rat bones and tarnished brass, now mounted in a thin iron ring on a dark leather band, a faint turquoise glint on one tooth. Clear silhouette, 1px dark outline, reads at 16x16 when downscaled.
```

## 5. Abgabe
`public/sprites/manifest-fasserin2.json`, `docs/art/batch-fasserin2-generation.json`, `docs/art/batch-fasserin2-preview.png`, `tools/art/fasserin2/check.py`, `docs/art/batch-fasserin2-validation.json`, Übergabe `docs/art/fasserin2-uebergabe.md` (wo in `src/world/assets.js` einhängen: `UI_SHEETS` für Zettel und HUD, `ANIM_SHEETS` für Posen und Effekte, `ITEM_ICONS` für `fa_*`). Pull Request mit Prüf-Ausgabe.
