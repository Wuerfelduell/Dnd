# Codex-Paket CS: Figuren ohne eigene Grafik (Maud Keel, Kapitel-2-Auftraggeber, Einwohner Calderwick und Briarholt)

**Batch-Name:** `figuren_nachzuegler` (Manifest: `public/sprites/manifest-figuren_nachzuegler.json`)

Im Spiel laufen 21 Figuren mit geliehener Grafik herum: eine Pfandleiherin in Wexmoor mit umgefärbtem Fremd-Sheet, drei Auftraggeber der Kapitel-2-Akten ohne Portrait und Kampfgegner, und 17 Einwohner in Calderwick und Briarholt, die das Spiel mangels Lauf-Sheet als dunklen Kasten mit beigem Gesicht zeichnet. **Dieses Paket liefert nur Grafik** (etwa 50 PNG): Lauf-Sheets, Köpfe, Portraits, drei Gegner-Sheets und einen Marktstand. Keine Texte, keine Daten, die Figuren existieren schon.

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
- Manifest `public/sprites/manifest-figuren_nachzuegler.json` wie `manifest-kettlegate_leben.json` oder `manifest-fasserin.json` (Framegröße, Spalten/Reihen, Frame-Listen je Richtung, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-figuren_nachzuegler-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-figuren_nachzuegler-preview.png`.
- Prüfskript (Pillow) unter `tools/art/figuren_nachzuegler/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-figuren_nachzuegler-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30, Reihenfolge und Lauftakt wie `characters/kgl_e_fischweib.png` (nur lesen).
- Köpfe 24x24 unter `portraits/heads/<id>.png` wie `portraits/heads/kgl_e_fischweib.png`.
- Portraits 64x64 je Stimmung in einer Reihe: `portraits/<id>_emotions.png` mit den vier Stimmungen neutral, freundlich, misstrauisch, erschrocken (256x64), wie `portraits/Q_druce_emotions.png`.
- Kampf-Gegner: 6 Spalten, Zellen 64x64, Reihen idle, attack1, attack2, hurt, defeated (384x320); Angriffe halten die Ausholpose in zwei identischen Frames, wie `battle/enemy_kanalschmuggler.png`.
- Props 32x32 oder 48x32 unter `props/`.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `characters/kgl_e_fischweib.png`, `characters/ds_einwohner_4.png`, `public/sprites/manifest-kettlegate_leben.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

### 0.5 Farbanker
Jede Figur hat in den Spieldaten eine Palette (`coat`, `hat`, `skin`, `hair`, `legs`), aus der heute der Platzhalter-Kasten gezeichnet wird. Nimm die Mantelfarbe als Hauptfarbe des Sheets, damit Spieler die Figur wiedererkennen. Die Werte stehen in den Tabellen unten.

## 1. Pfandleiherin Maud Keel (Wexmoor, Salzmarkt)

Feste ID `wx_pfandleiherin`. Heute: `characters/wx_pfandleiherin_walk.png` ist eine Umfärbung von `ds_einwohner_4` und wird **ersetzt**; ein Portrait fehlt ganz. Sie sitzt hinter einem Tisch aus zwei Salzfässern und einer alten Tür, Lupe am Band um den Hals, Finger voller Ringe, die sie nicht trägt, sondern verwahrt. Kauft Beute, Trophäen und Moorfunde, verkauft Grundvorräte, stellt keine Fragen.

| Datei | Maße | Inhalt | Palette |
|---|---|---|---|
| `characters/wx_pfandleiherin_walk.png` | 64x128 | Lauf-Sheet, 4 Richtungen x 4 Frames | coat `#4e7484`, hat `#2a3440`, skin `#d8b89a`, hair `#8a8e96`, legs `#2a3440`, scarf `#c9c2ad` |
| `portraits/wx_pfandleiherin_emotions.png` | 256x64 | neutral, freundlich (Geschäft), misstrauisch (schlechte Ware), erschrocken | wie oben |
| `portraits/heads/wx_pfandleiherin.png` | 24x24 | Kopf fürs Notizbuch | wie oben |
| `props/wx_pfandtisch.png` | 48x32 | ihr Tisch: zwei Salzfässer, Türblatt als Platte, Waage, Ringschale, Lupe; keine Figur im Prop | Holz grau-braun, Salz bone white |

```
[STYLE BLOCK]
Walking sprite sheet, 16x32 pixels per frame, 4 rows (down, left, right, up) x 4 frames, transparent background. A weathered pawnbroker woman in her fifties from a salt-marsh town: teal-grey wool coat with a pale knitted scarf, dark knit cap, grey hair pinned back, a jeweller's loupe on a cord around her neck, a small ring tray held against her hip. Shrewd, unhurried posture, slight stoop. Readable at 16x32, 1px dark outline, no text.
```

## 2. Auftraggeber der Kapitel-2-Akten (Wexmoor)

Feste IDs `k2a_senn`, `k2a_veit`, `k2a_noll` (Paket AL). Lauf-Sheets gibt es seit kurzem als Umfärbungen (`characters/k2a_<id>_walk.png`); die werden **ersetzt**. Portraits und die drei Kampfgegner fehlen ganz; das Spiel leiht sich dafür `enemy_kanalschmuggler` und `enemy_price`.

| Figur | ID | Beschreibung | Dateien |
|---|---|---|---|
| Ivo Senn, Frachtkopist | `k2a_senn` | schmal, abgewetzte braune Weste und kurzer Regenumhang, violett gefärbte Daumen, Drahtrolle, Durchschlag unter dem Mantel; wachsam, rechnend | `characters/k2a_senn_walk.png` 64x128, `portraits/k2a_senn_emotions.png` 256x64, `portraits/heads/k2a_senn.png` 24x24, `battle/enemy_k2a_senn.png` 384x320 |
| Dr. Oren Veit, Materialverwalter | `k2a_veit` | ordentlich, anthrazitfarbener Mantel, graue Ärmelschoner, rußige Brille, Probenbuch in der behandschuhten Hand, blasse Blattreste am Ärmel | `characters/k2a_veit_walk.png`, `portraits/k2a_veit_emotions.png`, `portraits/heads/k2a_veit.png`, `battle/enemy_k2a_veit.png` |
| Clem Noll, Hafenkassenschreiber | `k2a_noll` | selbstgefällig, zu guter dunkelgrüner Mantel, Messingstempel am Band, blanke Stiefel über schlickigen Sohlen, drückt einen trockenen Umschlag an die Brust | `characters/k2a_noll_walk.png`, `portraits/k2a_noll_emotions.png`, `portraits/heads/k2a_noll.png`, `battle/enemy_k2a_noll.png` |

Kampf-Sheets (6 Spalten 64x64, Reihen idle, attack1, attack2, hurt, defeated):
- `enemy_k2a_senn`: in einer engen, torfnassen Signalhütte; schwingt eine schwere Drahtrolle und schützt dabei einen tragbaren Telegrafen. Posen: Stand, Ausholen, Schlag, Taumeln, Niederlage.
- `enemy_k2a_veit`: zwischen Regalen eines fahrbaren Probenschranks; wirft Glasphiolen mit blassem Pulver, keine Flammen, kein Blut. Posen: Stand, Phiole heben, Wurf, Husten im Pulver, Niederlage.
- `enemy_k2a_noll`: auf einem vertäuten Bergungskahn; hält mit einem langen Bootshaken Abstand und ein versiegeltes Duplikat hinter sich. Posen: Stand, Haken heben, Stoß, Gleichgewicht verlieren, entwaffnete Aufgabe.

```
[STYLE BLOCK]
Enemy battle sprite sheet, 6 columns x 5 rows of 64x64 cells, transparent background. A complacent Victorian harbour insurance clerk in an expensive dark green coat with a brass registry stamp on a cord, balancing on a moored salvage punt and keeping an investigator away with a long boat hook. Rows: idle, hook wind-up (held two frames), thrust, losing balance, disarmed surrender. No gore, no text.
```

## 3. Einwohner von Calderwick (Kapitel 4)

Calderwick ist die Stadt der Quittungen und Abgleiche: sechs Terrassen mit Schrägaufzug, Setzereien, ein Kronenarchiv, Rohrpost, Witwenterrasse. Feste IDs `cwn_e_*` (Paket CF). Heute ohne Sheet, also Kasten-Figur. Alle 8 brauchen Lauf-Sheet `characters/cwn_e_<rolle>.png` (64x128) und Kopf `portraits/heads/cwn_e_<rolle>.png` (24x24); Portraits sind nicht nötig. Gemeinsame Palette: hat `#444450`, skin `#c4aa91`, hair `#6a5e55`, legs `#3d414a`; Mantel je Figur.

| ID | Name | Mantel | Aussehen und Tagesort |
|---|---|---|---|
| `cwn_e_griffmacherin` | Hanna Krell | `#756956` | Drechslerin für Stempel- und Werkzeuggriffe, Lederschürze, Späne im Haar, Griffbündel unterm Arm; Setzergasse |
| `cwn_e_waescherin` | Dora Nell | `#626c79` | Wäscherin der Witwenterrasse, hochgekrempelte Ärmel, rote Hände, Korb auf der Hüfte, Tuch über dem Kopf |
| `cwn_e_bote` | Oskar Venn | `#746255` | Quittungsbote, junger Mann mit Umhängetasche voller Zettel, Mütze mit Messingnummer, dünne Beine; am Gleisfuß |
| `cwn_e_marktfrau` | Selma Dorr | `#68725d` | Standfrau am Quittungsmarkt, Wollumhang, Münzschürze, Kreidetafel unter dem Arm, kräftig |
| `cwn_e_nachtsetzer` | Arvo Pell | `#756956` | Setzer der Nachtschicht, Druckerschwärze an Fingern und Wange, Schirmmütze, Augenschatten, Setzkasten klein unterm Arm; Setzergasse |
| `cwn_e_fensterputzerin` | Mira Cale | `#626c79` | putzt die Glasfronten der Terrassen, Eimer und Lederabzieher, Seilgurt um die Hüfte, sportlich; Röhrenhof |
| `cwn_e_laternenwart` | Enno Reed | `#746255` | pflegt die Laternen am Schrägaufzug, Ölkanne, kurze Leiter auf der Schulter, älterer Mann mit Bart; Gleisfuß |
| `cwn_e_archivdienerin` | Berta Voss | `#68725d` | Dienerin im Kronenarchiv, strenger grauer Kittel, Schlüsselbund, Aktenstapel vor der Brust, Zwicker; Kronenarchiv |

Dazu **ein Marktstand** als Figur und Prop: `cwo_marktstand` ist Mina Falz, die am Quittungsmarkt Reisebedarf verkauft (Palette coat `#566065`, hat `#363640`, skin `#c8ac8c`, hair `#655847`, legs `#34333a`). Liefere `characters/cwo_marktstand.png` (64x128, eine ruhige Frau mit Kontorschürze und Bleistift hinterm Ohr) und `props/cwo_marktstand_tisch.png` (48x32, Stand mit Plane, Konservendosen, Seilrollen, Laternenöl, Preisschildchen ohne Schrift).

```
[STYLE BLOCK]
Walking sprite sheet, 16x32 pixels per frame, 4 rows (down, left, right, up) x 4 frames, transparent background. A night-shift typesetter from a terraced Victorian hill town: dark olive-brown work coat, flat cap, ink-blackened fingers and a smudge on one cheek, tired shadows under the eyes, a small type case under his arm. Readable at 16x32, 1px dark outline, no text.
```

## 4. Einwohner von Briarholt (Kapitel 5)

Briarholt ist ein Kurort mit Heizleitungen: Glasgärten, Winterpromenade, Stillenhäuser, Pavillon, Speisesaal, Kutschenhof, Kesselgrund, Mutterhaus. Jede Karte gibt es kalt und warm; die Figuren brauchen **kein** Warm-Zwilling, nur ein Sheet. Feste IDs `bhn_e_*` (Paket CJ). Alle 8 brauchen Lauf-Sheet `characters/bhn_e_<rolle>.png` (64x128) und Kopf `portraits/heads/bhn_e_<rolle>.png` (24x24). Gemeinsame Palette: hat `#252b38`, skin `#cfb18a`, hair `#8b8870`, legs `#303b49`; Mantel je Figur.

| ID | Name | Mantel | Aussehen und Tagesort |
|---|---|---|---|
| `bhn_e_patientin` | Mara Sill | `#665572` | Kurpatientin, violetter Morgenmantel über Wollkleid, Decke um die Schultern, blass, geht langsam; Stillenhäuser |
| `bhn_e_kapellmeister` | Orenna Pike | `#586c78` | Kapellmeisterin der Kurkapelle, blaugrauer Frack, Taktstock, Notenrolle, Haar streng hochgesteckt; Pavillon |
| `bhn_e_kiosk` | Nell Rusk | `#715648` | Kioskfrau am Pavillon, brauner Mantel mit Bauchladen (Zeitungen, Hustenbonbons, Postkarten), Fäustlinge |
| `bhn_e_lehrer` | Tobin Yew | `#496b64` | Lehrer der Kurschule, grüner Mantel mit Schal, Lederbuch unterm Arm, Brille, freundlich-müde; Winterpromenade |
| `bhn_e_naeherin` | Iva Quill | `#665572` | Näherin für Decken und Verbände, Nadelkissen am Handgelenk, Stoffballen, Fingerhut; Kesselgrund |
| `bhn_e_koechin` | Ada Brindle | `#586c78` | Köchin des Speisesaals, Schürze über blaugrauem Kleid, Haube, Suppenkelle, rundlich und energisch |
| `bhn_e_bote` | Perrin Tuck | `#715648` | Kutschenhof-Bote, brauner Mantel, Umhängetasche, Wollmütze mit Bommel, läuft etwas schneller; Kutschenhof |
| `bhn_e_wart` | Edric Loam | `#496b64` | Wart der Glasgärten und Heizleitungen, grüne Ölhaut, Rohrzange am Gürtel, Dampfbrille auf der Stirn, Handschuhe; Glasgärten |

```
[STYLE BLOCK]
Walking sprite sheet, 16x32 pixels per frame, 4 rows (down, left, right, up) x 4 frames, transparent background. A caretaker of a Victorian spa town's glass gardens and heating pipes: dark green oilskin coat, heavy gloves, a pipe wrench on his belt, steam goggles pushed up on his forehead, mud on the boots. Readable at 16x32, 1px dark outline, no text.
```

## 5. Abgabe
`public/sprites/manifest-figuren_nachzuegler.json`, `docs/art/batch-figuren_nachzuegler-generation.json`, `docs/art/batch-figuren_nachzuegler-preview.png`, `tools/art/figuren_nachzuegler/check.py`, `docs/art/batch-figuren_nachzuegler-validation.json`, Übergabe `docs/art/figuren_nachzuegler-uebergabe.md` (wo in `src/world/assets.js` einhängen: `SHEETS` + `CHARACTER_SHEETS` nach dem Muster von `KGL_FIGURES`, `HEAD_FILES` für Köpfe, `PORTRAIT_EXTRA` für die vier Portraits, `ENCOUNTER_SHEETS` für `k2a_tinte_kampf` → `enemy_k2a_senn`, `k2a_bittere_mittel_kampf` → `enemy_k2a_veit`, `k2a_hafenrecht_kampf` → `enemy_k2a_noll`). Pull Request mit Prüf-Ausgabe.
