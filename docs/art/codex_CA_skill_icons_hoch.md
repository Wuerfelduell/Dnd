# Codex-Batch CA: Icons für die Hauptfertigkeiten der Sequenzen 4 bis 1 und der neuen Pfade

**Batch-Name:** `skill_icons_hoch` (Manifest: `public/sprites/manifest-skill-icons-hoch.json`)

Paket AG hat für die Sequenzen 4 bis 1 aller zehn Pfade und für Sequenz 9 bis 5 von Waage, Moor und Uhr die **Kampf-Effekte** geliefert (`fx/sq_<pfad>_hoch_<n>.png`, `fx/sq_<pfad>_stufe_<n>.png`), aber **keine Icons**. Im Fertigkeitenmenü zeigen diese **55 Hauptfertigkeiten** deshalb das Siegel-Platzhalterbild und vor dem Namen ein ✧ (`skillIconOf` in `src/world/assets.js` liefert null). Du lieferst zwei Icon-Atlanten à 16x16.

Schon fertig, **nicht neu machen:** `ui/skill_icons.png` (sieben Pfade, Seq 9 bis 7) und `ui/skill_icons_2.png` (Seq 6 und 5). Die zweiten Fähigkeiten und Welt-Fähigkeiten (`faehigkeiten2.json`) macht Paket **BZ**, nicht dieses.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.

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

### 0.2 Aufbau der Atlanten
| Datei | Raster | Inhalt |
|---|---|---|
| `public/sprites/ui/skill_icons_hoch.png` | 10 Spalten (Laterne, Faden, Maske, Echo, Kessel, Eisen, Schlüssel, Waage, Moor, Uhr) x 4 Zeilen (Seq 4 oben bis Seq 1 unten), 160x64 | 40 Icons, Tabelle 1 |
| `public/sprites/ui/skill_icons_neu.png` | 3 Spalten (Waage, Moor, Uhr) x 5 Zeilen (Seq 9 oben bis Seq 5 unten), 48x80 | 15 Icons, Tabelle 2 |

Zelle 16x16, kein Zwischenraum, Zellenindex = Zeile x Spalten + Spalte. Dazu jedes Icon einzeln unter `public/sprites/ui/skills_hoch/<id>.png`.

### 0.3 Bildsprache
- **Referenz:** `ui/skill_icons.png` und `ui/skill_icons_2.png`: dunkler runder Grund mit 1px-Rand, klares Symbol in 2 bis 3 Tönen der Pfad-Leitfarbe, Glanzpunkt oben links. Die 15 Icons der neuen Pfade (Seq 9 bis 5) sollen sich in Schlichtheit an die alten Seq-9-bis-5-Icons anlehnen; die 40 hohen Icons (Seq 4 bis 1) sollen sichtbar **kostbarer** wirken: ein zweites Element, ab Seq 3 ein türkiser (#6fe0d0) oder violetter Funke, Seq 1 darf einen 1px hellen Kern haben.
- **Leitfarbe je Pfad:** Laterne = amber #e8b860 (Lampenlicht, Docht, Glut); Faden = lilac #c8b0e8 (Garn, Knoten, Nähte); Maske = rose #e07a8a (Gesichter, Masken, Schminke); Echo = turquoise #6fe0d0 (Schall, Glocken, Münder); Kessel = poison green #9ad06a (Phiolen, Dampf, Sud); Eisen = steel grey #a8b4c0 (Nieten, Schilde, Fäuste); Schlüssel = brass #d0a050 (Schlüssel, Riegel, Taschen); Waage = dull gold #c9a84c mit Bleigrau #7d7f8a (Waagschalen, Gewichte, Pfandmarken, Quittungen); Moor = peat brown #6b4a2e mit Moosgrün #5f7a4a (Torf, Schichten, Namen im Boden, Ufer); Uhr = copper #b8783c mit Elfenbein #e6dcc3 (Zeiger, Pendel, Zifferringe ohne Zahlen, Takt).
- Motiv aus Name und Wirkung ableiten (Spalte „Was sie tut“). Keine Buchstaben, keine Zahlen.

### 0.4 Nachbearbeitung und Ablage
1. Nearest Neighbor exakt auf 16x16, in den Atlas setzen; auf die gemeinsame Palette indizieren (max. 32 Farben pro Atlas), binäres Alpha.
2. Prüfskript `tools/art/skill_icons_hoch/check.py` (Pillow): Maße, 55 belegte Zellen, keine zwei identischen Zellen, Palette, Alpha.
3. Vorschau `docs/art/preview-skill-icons-hoch.png` (4-fach, Beschriftung außerhalb der Zellen), Prompts in `docs/art/batch-skill-icons-hoch-generation.json`, Absatz in `docs/art/README.md`.
4. Manifest `public/sprites/manifest-skill-icons-hoch.json` wie `manifest-sequenzen2.json` (Assets `skill_icons_hoch` und `skill_icons_neu` mit `skillIds` als Zeilen in Atlasreihenfolge).

## 1. Sequenz 4 bis 1 aller zehn Pfade (`ui/skill_icons_hoch.png`, 40 Icons)

| Pfad | Seq | Id | Name | Sequenz heißt | Was sie tut |
|---|---|---|---|---|---|
| Laterne | 4 | `laterne_hoch_4` | Dochtgericht | Dochtgezeichneter | 1 Treffer mit je 45 Grundschaden. Grundschaden gegen Okkultes verdoppelt. Lässt nach einem Treffer… |
| Laterne | 3 | `laterne_hoch_3` | Aschenlesung | Aschenprotokollant | 1 Treffer mit je 59 Grundschaden. Grundschaden gegen Okkultes verdoppelt. Lässt nach einem Treffer… |
| Laterne | 2 | `laterne_hoch_2` | Horizontschnitt | Rußhorizont | 1 Treffer mit je 76 Grundschaden. Grundschaden gegen Okkultes verdoppelt. Lässt nach einem Treffer… |
| Laterne | 1 | `laterne_hoch_1` | Offene Beleuchtung | Das unbequeme Licht | 1 Treffer mit je 99 Grundschaden. Grundschaden gegen Okkultes verdoppelt. Lässt nach einem Treffer… |
| Faden | 4 | `faden_hoch_4` | Nahtbefund | Nahtträger | 4 Treffer mit je 135 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Deckt nach einem… |
| Faden | 3 | `faden_hoch_3` | Bruchvermerk | Bruchhefter | 4 Treffer mit je 175.5 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Deckt nach… |
| Faden | 2 | `faden_hoch_2` | Saumzug | Stadtversäumer | 4 Treffer mit je 228.2 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Deckt nach… |
| Faden | 1 | `faden_hoch_1` | Offener Knoten | Der offene Zusammenhang | 4 Treffer mit je 296.6 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Deckt nach… |
| Maske | 4 | `maske_hoch_4` | Fremde Miene | Gesichtsvermieter | 3 Treffer mit je 158 % Waffenschaden. Du weichst im nächsten Gegnerzug aus. Der nächste nicht… |
| Maske | 3 | `maske_hoch_3` | Rollenwechsel | Rollenverwahrer | 3 Treffer mit je 195 % Waffenschaden. Du weichst im nächsten Gegnerzug aus. Der nächste nicht… |
| Maske | 2 | `maske_hoch_2` | Leeres Parkett | Publikumsfremder | 3 Treffer mit je 253.5 % Waffenschaden. Du weichst im nächsten Gegnerzug aus. Der nächste nicht… |
| Maske | 1 | `maske_hoch_1` | Eigener Auftritt | Das unvermietete Gesicht | 3 Treffer mit je 329.6 % Waffenschaden. Du weichst im nächsten Gegnerzug aus. Der nächste nicht… |
| Echo | 4 | `echo_hoch_4` | Restton | Stilleverwahrer | 1 Treffer mit je 36 Grundschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen. Heilt… |
| Echo | 3 | `echo_hoch_3` | Nachrufzug | Nachrufgefäß | 1 Treffer mit je 47 Grundschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen. Heilt… |
| Echo | 2 | `echo_hoch_2` | Uferlaut | Schweigeufer | 1 Treffer mit je 61 Grundschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen. Heilt… |
| Echo | 1 | `echo_hoch_1` | Ausgehört | Die letzte Zuhörstelle | 1 Treffer mit je 79 Grundschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen. Heilt… |
| Kessel | 4 | `kessel_hoch_4` | Rückstandslauge | Rückstandsbrauer | 2 Treffer mit je 18 Grundschaden. Deckt nach einem Treffer die Schwachstelle für weitere Angriffe… |
| Kessel | 3 | `kessel_hoch_3` | Rücklauf | Kreislaufgefäß | 2 Treffer mit je 23 Grundschaden. Deckt nach einem Treffer die Schwachstelle für weitere Angriffe… |
| Kessel | 2 | `kessel_hoch_2` | Abwärmesud | Abwärmesammler | 2 Treffer mit je 30 Grundschaden. Deckt nach einem Treffer die Schwachstelle für weitere Angriffe… |
| Kessel | 1 | `kessel_hoch_1` | Letzte Fraktion | Der unverlorene Rest | 2 Treffer mit je 40 Grundschaden. Deckt nach einem Treffer die Schwachstelle für weitere Angriffe… |
| Eisen | 4 | `eisen_hoch_4` | Lastschlag | Lastnieter | 2 Treffer mit je 330 % Waffenschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen.… |
| Eisen | 3 | `eisen_hoch_3` | Widerlager | Gegenlast | 2 Treffer mit je 429 % Waffenschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen.… |
| Eisen | 2 | `eisen_hoch_2` | Tragwerkstoß | Stadtwiderlager | 2 Treffer mit je 557.7 % Waffenschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen.… |
| Eisen | 1 | `eisen_hoch_1` | Standhalten | Die bleibende Stütze | 2 Treffer mit je 725 % Waffenschaden. Lässt nach einem Treffer den nächsten Gegnerzug ausfallen.… |
| Schlüssel | 4 | `schluessel_hoch_4` | Schwellenschnitt | Schwellenlücke | 3 Treffer mit je 210 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |
| Schlüssel | 3 | `schluessel_hoch_3` | Leerriegel | Riegelabwesenheit | 3 Treffer mit je 273 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |
| Schlüssel | 2 | `schluessel_hoch_2` | Randsprung | Innenrand | 3 Treffer mit je 354.9 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |
| Schlüssel | 1 | `schluessel_hoch_1` | Offene Schwelle | Die unverwehrte Tür | 3 Treffer mit je 461.4 % Waffenschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |
| Waage | 4 | `waage_hoch_4` | Pfandabruf | Pfandkörper | 2 Treffer mit je 20 Grundschaden. Gewährt 18 Schutz. Kostet vor Passiven 18 Nerven. |
| Waage | 3 | `waage_hoch_3` | Saldenstoß | Saldenhüter | 2 Treffer mit je 25 Grundschaden. Gewährt 23 Schutz. Kostet vor Passiven 24 Nerven. |
| Waage | 2 | `waage_hoch_2` | Gegenbuchung | Schuldgegengewicht | 2 Treffer mit je 33 Grundschaden. Gewährt 30 Schutz. Kostet vor Passiven 32 Nerven. |
| Waage | 1 | `waage_hoch_1` | Letzte Quittung | Die quittierte Last | 2 Treffer mit je 43 Grundschaden. Gewährt 40 Schutz. Kostet vor Passiven 42 Nerven. |
| Moor | 4 | `moor_hoch_4` | Schichtdruck | Schichtträger | 2 Treffer mit je 18 Grundschaden. Heilt 21 Leben. Kostet vor Passiven 18 Nerven. |
| Moor | 3 | `moor_hoch_3` | Sedimentgriff | Namensediment | 2 Treffer mit je 23 Grundschaden. Heilt 27 Leben. Kostet vor Passiven 24 Nerven. |
| Moor | 2 | `moor_hoch_2` | Uferschlick | Vergessensufer | 2 Treffer mit je 30 Grundschaden. Heilt 35 Leben. Kostet vor Passiven 32 Nerven. |
| Moor | 1 | `moor_hoch_1` | Fehlstellenruf | Das erinnerte Fehlende | 2 Treffer mit je 40 Grundschaden. Heilt 46 Leben. Kostet vor Passiven 42 Nerven. |
| Uhr | 4 | `uhr_hoch_4` | Taktlücke | Zwischentakter | 2 Treffer mit je 20 Grundschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |
| Uhr | 3 | `uhr_hoch_3` | Friststoß | Fristlauscher | 2 Treffer mit je 25 Grundschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |
| Uhr | 2 | `uhr_hoch_2` | Wiederkehrschlag | Wiederkehrsaum | 2 Treffer mit je 33 Grundschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |
| Uhr | 1 | `uhr_hoch_1` | Minutenfreigabe | Die gewährte Minute | 2 Treffer mit je 43 Grundschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |

## 2. Sequenz 9 bis 5 der neuen Pfade (`ui/skill_icons_neu.png`, 15 Icons)

| Pfad | Seq | Id | Name | Sequenz heißt | Was sie tut |
|---|---|---|---|---|---|
| Waage | 9 | `waage_stufe_9` | Pfanddruck | Pfandleser | 1 Treffer mit je 7 Grundschaden. Gewährt 4 Schutz. |
| Waage | 8 | `waage_stufe_8` | Gegengewicht | Gewichtschreiber | 1 Treffer mit je 10 Grundschaden. Gewährt 6 Schutz. |
| Waage | 7 | `waage_stufe_7` | Fristpfand | Fristenhalter | 2 Treffer mit je 8 Grundschaden. Gewährt 8 Schutz. |
| Waage | 6 | `waage_stufe_6` | Ausgleichshieb | Ausgleichsführer | 2 Treffer mit je 10 Grundschaden. Gewährt 10 Schutz. |
| Waage | 5 | `waage_stufe_5` | Pfandsaldo | Schuldenverwahrer | 2 Treffer mit je 13 Grundschaden. Gewährt 12 Schutz. Kostet vor Passiven 10 Nerven. |
| Moor | 9 | `moor_stufe_9` | Schlickgriff | Torfleser | 1 Treffer mit je 6 Grundschaden. Heilt 4 Leben. |
| Moor | 8 | `moor_stufe_8` | Namenslast | Namenberger | 1 Treffer mit je 9 Grundschaden. Heilt 7 Leben. |
| Moor | 7 | `moor_stufe_7` | Torfdruck | Schichtzeuge | 2 Treffer mit je 7 Grundschaden. Heilt 9 Leben. |
| Moor | 6 | `moor_stufe_6` | Uferhand | Namensbank | 2 Treffer mit je 9 Grundschaden. Heilt 11 Leben. |
| Moor | 5 | `moor_stufe_5` | Schichtschluss | Torfgedächtnis | 2 Treffer mit je 12 Grundschaden. Heilt 14 Leben. Kostet vor Passiven 10 Nerven. |
| Uhr | 9 | `uhr_stufe_9` | Taktschlag | Ganghörer | 1 Treffer mit je 7 Grundschaden. Verfehlter Takt zählt als normaler Treffer. |
| Uhr | 8 | `uhr_stufe_8` | Vortritt | Taktmerker | 1 Treffer mit je 10 Grundschaden. Du weichst im nächsten Gegnerzug aus. |
| Uhr | 7 | `uhr_stufe_7` | Pendelkehr | Pendelprüfer | 2 Treffer mit je 8 Grundschaden. Verfehlter Takt zählt als normaler Treffer. |
| Uhr | 6 | `uhr_stufe_6` | Gangausgleich | Gangbewahrer | 2 Treffer mit je 10 Grundschaden. Du weichst im nächsten Gegnerzug aus. |
| Uhr | 5 | `uhr_stufe_5` | Fristkehr | Fristzeuge | 2 Treffer mit je 13 Grundschaden. Verfehlter Takt zählt als normaler Treffer. Du weichst im… |

## 3. Prompt-Vorlage (ein Pfad-Streifen)
```
[STYLE BLOCK]
Horizontal strip of <N> combat skill icons for the pathway "<Pfadname>", each 16x16 pixels, no gap, transparent background. Every icon: dark round base (near-black blue-grey, 1px outline) with a clear symbol in 2-3 shades of <Leitfarbe>, highlight top-left. Left to right, from weaker to strongest: 1) <Motiv> 2) <Motiv> … Icons for the two strongest abilities carry one tiny turquoise #6fe0d0 spark and a 1px bright core. Same family as the attached reference icons (skill_icons.png, skill_icons_2.png): same base, outline, pixel density and light. No letters, no numbers.
```

## 4. Einbau (macht ein anderer Thread, nur zur Info)
`SKILL_ICONS_HOCH` (10 Spalten) und `SKILL_ICONS_NEU` (3 Spalten) in `src/world/assets.js`, `skillIconOf` und `Ui.skillIcon` (Spaltenzahl pro Atlas) erweitern, Manifest in `tests/sprites.test.js`.
