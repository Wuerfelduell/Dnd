# Codex-Batch AN: Grafik für Floßfriedhof, Lichtamt und Torfbrüche

**Batch-Name:** `wexmoor6` (Manifest: `public/sprites/manifest-wexmoor6.json`)

Kapitel 2 bekommt drei neue Orte. Die Daten schreibt gleichzeitig Paket AM, du machst die Grafik: Kacheln, Props, Monster, Boss, Kampf-Hintergründe und Beute-Icons. Die Figuren macht Paket AO.

## Gemeinsame Eckdaten „Kapitel-2-Ausbau“ (gilt für die Pakete AL bis AQ)

Kapitel 2 (Wexmoor) spielt sich in etwa 4 Stunden, Kapitel 1 in 8 bis 9. Sechs Pakete bauen Kapitel 2 gleichzeitig aus. Damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so, erfinde für diese Dinge keine anderen IDs, und lege nichts an, was einem anderen Paket gehört.

**Neue Figuren** (Grafik macht Paket AO; jedes Paket darf sie benutzen):
| ID | Name | Rolle, Aussehen | Ort | gehört zu |
|---|---|---|---|---|
| `wxn_bestatterin` | Agathe Mulch | Floßbestatterin, groß, hager, schwarzer Ölmantel, Stake in der Hand | `wx_flossfriedhof` | AM |
| `wxn_lichtschreiber` | Corvin Tallow | Schreiber im Lichtamt, jung, blass, Ärmelschoner, Tintenflecken, nervös | `wx_lichtamt` | AM |
| `wxn_torfgraeber` | Jonas Peck | alter Torfgräber, krumm, Pfeife, Grubenlampe am Gürtel | `wx_torfstich` / `wx_torfbrueche` | AM |
| `wxn_apothekerin` | Minna Sorrel | Apothekerin am Salzmarkt, rundlich, Brille an Kette, Schürze voller Fläschchen | `wx_salzmarkt` | AL |
| `wxn_telegrafist` | Eustace Rimmel | Telegrafist am Güterbahnhof, Schirmmütze, Kopfhörer um den Hals, hört mehr als er sollte | `wx_bahnhof` | AL |
| `wxn_hafenmeisterin` | Dora Kell | Hafenmeisterin, wettergegerbt, Seemannsmantel, Fernrohr | `wx_bojenhafen` | AL |
| `wxn_krabbe` | „Krabbe“ | Schlickjunge, 11, barfuß, Sack voller Fundstücke aus dem Watt | `wx_bojenhafen` / `wx_salzwatt` | AP |
| `wxn_maler` | Lionel Vane | Porträtmaler der Oberstadt, Samtjacke, Farbe am Kinn, malt nur Tote | `wx_oberstadt` | AL |
| `tm_esse` | Wanda Esse | Schmiedin, Mitglied der Täfelchengilde | Treffpunkt der Gilde | AQ |
| `tm_kerbe` | Abel Kerbe | Schnitzer von Namenstäfelchen, Mitglied der Gilde | Treffpunkt der Gilde | AQ |
| `tm_mulde` | Hanne Mulde | Moorhebamme, gibt Kindern Namen, Mitglied der Gilde | Treffpunkt der Gilde | AQ |

**Neue Orte** (Daten macht Paket AM, Grafik Paket AN):
- `wx_flossfriedhof` „Der Floßfriedhof“: Gräber auf vertäuten Flößen vor Pfahldorf, Stadtkarte, ohne Kämpfe, mit Grauspäher-Streife.
- `wx_lichtamt` „Das Lichtamt“: Brandts Amtsgebäude in der Oberstadt, Innenraum (Halle, Archiv, Kartenraum), gut bewacht.
- `wx_torfbrueche` „Die Torfbrüche“: eingestürzte Torfstollen unter dem Moorrand, Gefahrengebiet (tier 3). Monster `torfleiche`, `grubenlicht`, `torfwurm`, `schlickhund`, Boss `moorbraut` (die Moorbraut: eine Moorleiche im Hochzeitskleid, seit 200 Jahren unverwest).

**Neuer Zirkel** (Paket AQ): `namensgilde` „Die Täfelchengilde“, Bewahrer der alten Namensbräuche, Treffpunkt-Karte `treffen_namensgilde`.

**Präfixe für neue IDs:** AL `k2a_`, AM `k2o_`, AP `k2v_`, AQ `k2g_` (Figuren-IDs oben bleiben wie sie sind). Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

## 0. Gemeinsame Regeln für diese Datei (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**: Style-Block, Maße, Ablage und Nachbearbeitung stehen hier, du brauchst keine andere Prompt-Datei.

**Hinweis Setting:** Wexmoor ist eine versinkende Moorstadt an der Küste: Torf, Reet, Schlick, Salz, Bojen, Nebel, ein Leuchtturm weit draußen im Moor. Wo der Style-Block „Kettlegate“ sagt, gilt Wexmoor mit derselben Stimmung.

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

### 0.2 Maße
| Was | Größe |
|---|---|
| Tile | 16x16 |
| Figur auf der Karte | 16x32 pro Frame; Lauf-Sheet 4 Reihen (unten, links, rechts, oben) x 4 Frames = 64x128 |
| Portrait | 64x64; Emotions-Sheet 4 nebeneinander = 256x64 (neutral, misstrauisch, erschrocken, leichtes Lächeln) |
| Kampf-Figur (Mensch) | 48x48 pro Frame, Blick nach links (Gegner) bzw. rechts (Spieler) |
| Kampf-Gegner (übernatürlich) | 64x64 pro Frame |
| Kampf-Hintergrund | 480x270, deckend, untere 70 px flacher Bodenstreifen |
| Effekte | 32x32 oder 48x48 pro Frame, Frames in einer Reihe |
| Item-Icon | 16x16 (zusätzlich 32x32, wo angegeben) |
| UI | 9-slice auf 16er-Raster, Icons 16x16 |

Kampf-Sheets: **6 Spalten**, eine Animation pro Reihe, kürzere Reihen mit transparenten Feldern auffüllen, gleiche Grundlinie in allen Frames. Gegner-Angriffe halten die Ausholpose **2 Frames** lang (Timing-Signal für Ausweichen/Parieren).

### 0.3 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Ordner und Dateinamen stehen bei jedem Asset. Die Namen entsprechen den IDs in den Daten, bitte genau so übernehmen.
- Ein Manifest `public/sprites/manifest-wexmoor6.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json` bzw. `manifest-wexmoor2.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-wexmoor6-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



**Schon fertig, nicht neu machen:** alles aus den Batches A bis X und `wexmoor`…`wexmoor5` (Pfahldorf, Torfstich, Salzwatt, Versunkene Altstadt usw.). Als Stil-Referenz anhängen: `tilesets/` und `props/` mit Präfix `R_`/`r_` und `Q_`, und die Altstadt-Sheets aus Batch W.

---

## 1. Floßfriedhof (`wx_flossfriedhof`)
Tileset `tilesets/AN_flossfriedhof.png` (16x16, 8 Spalten):
```
[STYLE BLOCK]
Tileset for a floating cemetery on a peat moor, 16x16 px tiles, 8 columns: dark still water (4 variants, 2-frame ripple), raft planks of black tarred wood (horizontal and vertical, edges and corners), narrow plank walkways with rope rails, raft edge with mooring posts, reed clumps at the water line, a moss-covered raft surface, mist-covered water. No outline on terrain.
```
Props `props/AN_flossfriedhof.png` (Zellen 16x32 bzw. 32x32, Namen im Manifest als `regions`): Holzkreuze schief (3 Varianten), Grabstein aus Torfziegeln, Namenstäfelchen an Pfählen (Bündel), Leichenhaus-Floß mit Reetdach (64x48), Stakkahn mit Laterne, Grablicht in Glas (2 Frames Flackern), Kranz aus Moorblüten, leeres Grab mit abgekratztem Täfelchen, Bojenglocke an einer Kette, Krähe auf Kreuz (2 Frames).

## 2. Lichtamt (`wx_lichtamt`)
Tileset `tilesets/AN_lichtamt.png` (Innenraum): heller Steinboden mit Messing-Intarsien (Leuchtturm im Kreis als Muster, 2x2), Holzparkett im Archiv, Wände aus weiß getünchtem Stein mit Gaslampen-Halterungen (oben, Fläche, Ecken), hohe Fenster mit Nebel dahinter, Teppichläufer in Dunkelblau.
Props `props/AN_lichtamt.png`: Pförtnerloge, Aktenregale (3 Varianten, 32x32), Rollleiter, Kartentisch mit großer Wexmoor-Karte (64x32, ohne Schrift), Brandts Schreibtisch mit Linse und Siegel (48x32), Messing-Linsenmodell auf Sockel (2 Frames Glimmen), Siegelpresse, Rohrpost-Station, Wartebank, Uhr ohne Ziffern, Aktenstapel, Papierkorb, Wache-Garderobe mit Grauspäher-Mänteln.

## 3. Torfbrüche (`wx_torfbrueche`)
Tileset `tilesets/AN_torfbrueche.png` (Gefahrengebiet, 8x8 Raster wie `G_01_*`): Torfboden (4 Varianten), Torfwand (oben, Fläche, Ecken), Stützbalken, eingestürzte Decke (Schutt, 3 Varianten), Grubenwasser (2-Frame), Gasnest (grünlich, 4 Frames Blubbern), Schienen einer Lorenbahn, Wurzelgeflecht von oben, Torfschichten mit eingeschlossenen Dingen (Schuh, Löffel, Täfelchen).
Props `props/AN_torfbrueche.png`: Lore (umgekippt und stehend), Grubenlampe (2 Frames), Spitzhacke im Torf, Holzleiter, Seilwinde, Kreidezeichen-Tafel ohne Buchstaben, Brautschleier am Balken, Altar aus Torfziegeln mit Kerzen.
Kampf-Hintergrund `battle/bg_torfbrueche.png` 480x270 und Boss-Hintergrund `battle/bg_brautkammer.png` (unterirdische Kammer mit Hochzeitstafel aus Torf, Kerzen, Wurzeln).

## 4. Monster und Boss (`battle/enemy_<id>.png`, Layout wie die vorhandenen `enemy_*.png`, Manifest dort ansehen)
| ID | Größe | Beschreibung |
|---|---|---|
| `torfleiche` | 64x64 | eine im Torf konservierte Gestalt, ledrig braun, Haar rot vom Moor, bewegt sich ruckartig, nie eklig, eher traurig |
| `grubenlicht` | 64x64 | Gasflamme in einer zerbrochenen Grubenlampe, die von selbst schwebt; grünlich-gelb |
| `torfwurm` | 64x64 | langer Wurm aus Torf und Wurzeln, bricht aus der Wand |
| `schlickhund` | 48x48 | magerer Hund aus Schlick, tropft, Augen wie Wasserglanz |
| `moorbraut` | 96x96 (Boss) | Moorleiche im Hochzeitskleid, Schleier aus Moos, Brautstrauß aus Wollgras; zwei Phasen: Reihe für Phase 2, in der der Schleier sich hebt und kein Gesicht darunter ist, nur türkises Licht |
Je Gegner auch die Karten-Figur (16x32 bzw. 32x32, 4 Frames Bewegung) als `characters/F_ow_<id>.png` wie die vorhandenen `F_ow_*`, ein Bestiariums-Bild wie in `ui/bestiary/` und für den Boss ein Boss-Band wie `ui/S_08_boss_glockenmutter.png`.

## 5. Beute-Icons (`items/<id>.png` 16x16 und `items/32/<id>.png` 32x32)
`schlickzahn`, `wurmseide`, `grubenglas`, `torfbernstein`, `brautschleier`, `brautring`, Artefakt `brautkranz` (Kranz aus Moorblüten, leicht welk, türkiser Schimmer).

## 6. Stadtkarte
Drei Kartenmarker für die Wexmoor-Stadtkarte im Stil von `ui/Q_wexmoor_marker.png` (Floß mit Kreuz, Gebäude mit Linse, Stolleneingang), als `ui/AN_marker.png`.
