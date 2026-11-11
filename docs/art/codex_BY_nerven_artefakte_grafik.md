# Codex-Paket BY: Nerven- und Konzentrations-Artefakte (Grafik)

**Batch-Name:** `nerven_artefakte` (Manifest: `public/sprites/manifest-nerven-artefakte.json`)

Mit dem Nervensystem-Umbau sind 14 neue Artefakte im Spiel, die an Konzentration und Nerven drehen (Konzentration pro Runde, zu Kampfbeginn, Höchstwert; Nerven pro Runde; Blutzoll, Unruhe, teureres Ausweichen). Sie nutzen bisher Platzhalter-Icons von Beutestücken (siehe `src/world/assets.js` → `NERVEN_ARTEFAKT_ICONS`). Du lieferst **14 eigene Item-Icons** in zwei Größen.


**Überschneidung mit Paket BX:** `zweites_herz` und `nadel_der_naeherin` stehen auch in `codex_BX_konzentration_artefakte.md`. Macht BX diese beiden schon, dann hier **auslassen** (dann sind es 12 Icons); sonst nach der Beschreibung unten zeichnen.

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
- Icons 16x16 unter `public/sprites/items/<id>.png`, 32x32-Fassung unter `public/sprites/items/32/<id>.png`, genau mit den Ids unten.
- Manifest `public/sprites/manifest-nerven-artefakte.json` wie `manifest-14b.json` (Liste der Ids, Größen).
- Verwendete Prompts in `docs/art/batch-nerven-artefakte-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/preview-nerven-artefakte.png`.
- Prüfskript (Pillow) unter `tools/art/nerven_artefakte/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha.

### 0.3 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Artefakt-Icons wie `uhr_ertrunkener.png`, `stille_glocke.png` als Referenz mitgeben).
3. Transparenz prüfen: kein weißer oder schwarzer Rand.

## 1. Die 14 Icons (Pflicht)

Alle Artefakte sind okkult (Seltenheit „okkult“): ein Hauch Türkis `#6fe0d0` oder Violett darf auf jedem Icon sitzen, aber sparsam (ein Glimmen, ein Faden, eine Ader). Konzentrations-Artefakte (Takt, Uhrwerk, Herz) eher Messing und Rost mit einem violetten Funken; Nerven-Artefakte (Perle, Salz, Faden, Nerv) eher Bone-White und Fog-Grey mit türkisem Glimmen.

| Id | Name | Motiv (16x16, 32x32) |
|---|---|---|
| `taktgeber_uhrturm` | Taktgeber aus dem Uhrturm | Messing-Pendelstück mit Linse, in Rost gefasst, ein violetter Funke im Pendelauge. |
| `kerze_der_nachtwache` | Kerze der Nachtwache | Dicke Talgkerze mit ausgefransten Wachsrändern, Flamme fahl-amber, darunter ein Messingteller mit Griff. |
| `zahnrad_schlafwandlerin` | Zahnrad der Schlafwandlerin | Kleines Zahnrad, auf dem ein geschlossenes Auge sitzt; die Zähne leicht ungleich, ein Zahn violett. |
| `zweites_herz` | Das zweite Herz | Faustgroßer Klumpen dunkles Kraterglas in Herzform, innen ein türkiser Puls, Haarrisse. |
| `atemperle` | Atemperle der Taucherin | Graue, matte Perle mit Tang-Fäden und einem Salzrand, eine Luftblase im Innern. |
| `fiebermuenze` | Fiebermünze | Münze mit verwischtem Gesicht (keine Buchstaben), Rand angeschmolzen, ein rötlicher Schimmer. |
| `blutsalz_phiole` | Blutsalz-Phiole | Kleine Glasphiole mit Korken, innen rotes, grobes Salz, eine Ader davon klettert außen am Glas. |
| `nadel_der_naeherin` | Nadel der Näherin | Lange Stopfnadel aus Bone-White-Knochen mit dunklem Faden, der zu einem Tropfen endet. |
| `knoechelring_preisboxer` | Knöchelring des Preisboxers | Schwerer Eisenring, blank geschlagen, mit Kerben und einem Rostfleck, kein Stein. |
| `metronom_komponist` | Metronom des Komponisten | Taschenmetronom aus Ebenholz mit Messingpendel, Deckel halb offen, Pendel violett nachgezogen. |
| `trommelfell_ausrufer` | Trommelfell des Ausrufers | Messingring mit gespanntem Pergament, Schallwellen als 2 feine Ringe in Fog-Grey. |
| `glasnerv` | Glasnerv | Verdrehter Strang aus Glasfedern, der an einem Ende ausfasert wie ein Nerv, türkiser Kern. |
| `nervenfaden_weberin` | Nervenfaden der Weberin | Spule aus dunklem Holz, darauf ein straffer Docht in Bone-White, der oben in einen Knoten reißt. |
| `moorzunder` | Moorzunder | Schwarzer Wachsklumpen mit eingeschlossenen Irrlichtfunken (3 bis 4 Punkte Türkis), oben leicht angesengt. |

## 2. Prompt-Vorlage (je Icon)

```
[STYLE BLOCK]
Single inventory item icon, 32x32 pixels on transparent background, centered, 1px deep blue-grey outline. Subject: <Motiv aus der Tabelle, auf Englisch>. Occult artifact: one small touch of turquoise #6fe0d0 or deep violet glow, otherwise brass, rust, bone white and fog grey. Readable at 16x16 when downscaled with nearest neighbor.
```

## 3. Optional
Ein 32x32-Status-Icon für die Kampfanzeige „Atem holen“ (Nerven kehren zurück): ein kleiner Atemhauch in Fog-Grey, `ui/status/atem.png`.
