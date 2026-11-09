# Codex-Batch AO: Neue Figuren für Wexmoor

**Batch-Name:** `wexmoor7` (Manifest: `public/sprites/manifest-wexmoor7.json`)

Kapitel 2 bekommt 11 neue Figuren (8 Einwohner, 3 Mitglieder eines neuen Zirkels). Ihre Geschichten schreiben gleichzeitig die Pakete AL, AM, AP und AQ. Du zeichnest sie.

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
- Ein Manifest `public/sprites/manifest-wexmoor7.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json` bzw. `manifest-wexmoor2.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-wexmoor7-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



**Schon fertig, nicht neu machen:** alle vorhandenen Wexmoor-Figuren (Zunder, Druce, Hesper, Brack, Pedell, Sedge, Wyle, Hale, Brandt, Elsbeth, die Einzelgänger `ez_*`, die Zirkelmitglieder `tm_*` aus Batch T). Stil-Referenz: `characters/R_*_walk.png` und `portraits/R_*_emotions.png`.

---

## 1. Pro Figur (alle 11 aus der Tabelle oben)
- `characters/<id>_walk.png`: Lauf-Sheet 64x128 (4 Richtungen x 4 Frames).
- `portraits/<id>_emotions.png`: 256x64, neutral, misstrauisch, erschrocken, leichtes Lächeln.
- `portraits/AK_<id>_emotions2.png`: 256x64, wütend, traurig, nachdenklich, entschlossen (gleiche Figur, gleicher Ausschnitt).
- `ui/heads/<id>.png`: Kopf in der Größe der vorhandenen Dateien in `ui/heads/`.
Jede Figur eigene Silhouette und Hauptfarbe; Aussehen steht in der Tabelle. Die drei Gilden-Mitglieder (`tm_esse`, `tm_kerbe`, `tm_mulde`) tragen alle ein kleines hölzernes Namenstäfelchen an einer Schnur um den Hals.

## 2. Besondere Posen (je ein kleines Sheet 16x32, Frames nebeneinander, Datei `characters/<id>_extra.png`)
- `wxn_bestatterin`: stakt einen Kahn (4 Frames).
- `wxn_lichtschreiber`: schreibt hastig am Pult (4), versteckt etwas hinter dem Rücken (2).
- `wxn_torfgraeber`: sticht Torf (4), zündet Pfeife an (3).
- `wxn_apothekerin`: mischt im Mörser (4).
- `wxn_telegrafist`: morst (4), Hand am Kopfhörer, lauscht (2).
- `wxn_hafenmeisterin`: schaut durchs Fernrohr (3).
- `wxn_krabbe`: hockt und wühlt im Schlick (4), rennt weg (4).
- `wxn_maler`: malt an der Staffelei (4); dazu Prop `props/AO_staffelei.png` 32x32 mit leerer Leinwand und eine zweite mit einem dunklen Porträt einer Frau in altmodischem Kleid.
- `tm_kerbe`: schnitzt ein Täfelchen (4).

## 3. Kampf (nur wer kämpfen kann)
`wxn_maler` wird in einer Akte zum Gegner, wenn der Spieler falsch entscheidet: `battle/enemy_wxn_maler.png`, Mensch 48x48, Layout wie die vorhandenen `enemy_*.png` (z. B. `enemy_price.png`): idle, Pinselhieb, Farbe werfen (Ausholpose 2 Frames), getroffen, besiegt. Dazu eine okkulte Phase: die gemalte Frau tritt aus dem Bild, 64x64, `battle/enemy_gemalte_frau.png`.
