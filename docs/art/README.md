# Grafikpaket 14b – Kampf und erste Items

Erzeugt am 9. November 2026 mit dem integrierten Bildgenerator (`image_gen`).
Quelle der Aufgaben: `prompts.md`; die tatsächlich verwendeten Prompts stehen in
`batch-14b-generation.json`. Die dortigen Quelldateinamen bezeichnen die ursprünglichen
Generatorausgaben. Diese großen Arbeitsbilder werden nicht für das Spiel benötigt.

## Fertige PNGs

| Pfad unter `public/sprites/` | Größe | Inhalt |
|---|---|---|
| `battle/battle_player.png` | 288×432 | 6×9 Zellen, 48×48, 40 belegte Frames |
| `battle/enemy_holt.png` | 288×192 | 6×4 Zellen, 48×48, 17 belegte Frames |
| `battle/enemy_nebelhund.png` | 384×320 | 6×5 Zellen, 64×64, 25 belegte Frames |
| `battle/enemy_aschewaechter.png` | 384×320 | 6×5 Zellen, 64×64, 25 belegte Frames |
| `battle/bg_revier.png` | 480×270 | Trainingsraum |
| `battle/bg_ashgrove.png` | 480×270 | Kanalstraße |
| `battle/bg_krypta.png` | 480×270 | Krypta |
| `items/14b_items.png` | 64×32 | 4×2 Zellen; letzte Zelle leer |
| `items/<id>.png` | je 16×16 | Sieben einzelne Item-Icons |

Item-Reihenfolge im Atlas: `spazierstock`, `schlagstock`, `stockdegen`, `verband`,
`tonikum`, `riechsalz`, `bannsalz`, leer. Damit kleine Icons sauber getrennt bleiben,
ist der Arbeitsatlas als 4×2 statt als extrem breiter 7×1-Streifen angelegt.
Die sieben Einzeldateien entsprechen den vorhandenen IDs in `src/data/items.json`.

`public/sprites/manifest-14b.json` enthält exakte nullbasierte Frame-Listen,
Framegrößen, Blickrichtungen und vorgeschlagene Abspielgeschwindigkeiten.
Leere Restfelder sind transparent. Nur `idle` ist als Schleife vorgeschlagen;
Niederlagen bleiben auf dem letzten Frame stehen. Holts Niederlage ist ein
freundliches Aufgeben mit erhobener Hand.

## Export und Prüfung

`export-14b.mjs` normalisiert die Generatorbilder mit ImageMagick auf das Zielraster
(Nearest Neighbor), verwendet eine gemeinsame Palette mit 31 sichtbaren Farben
und erhält eine separat binarisierte Alpha-Maske. Hintergrundbilder sind opak.
Mit den ursprünglichen Generator-PNGs in einem Ordner:

```sh
node docs/art/export-14b.mjs /pfad/zu/den/generatorbildern
node docs/art/verify-14b.mjs
```

Die exportierten PNGs wurden visuell kontrolliert. Die Prüfung kontrolliert
Dateigrößen, Palette, Alpha, belegte Frames, leere Padding-Frames und Item-IDs.

## Einbaustand

Dieses Paket legt die Assets samt Metadaten ab. `CombatScene.js`, `assets.js`
und die Inventaroberfläche sind noch nicht auf diese neuen Dateien umgestellt.
Das Spiel verwendet dort weiterhin seine bisherigen Grafiken/Platzhalter.
Die bestehende Spielmechanik wurde nicht geändert.

Als Nächstes laut Aufgabenliste: Abschnitt 18 (Fall 3 / Lagerhaus 7), dann 19,
die Reste aus 12–14 und schließlich 15–17, ohne die hier erledigten Assets doppelt
zu erzeugen. Laufzeit-Animationen müssen beim Einbau noch im Spiel geprüft werden.

## Grafikpaket A – Pfade, Tränke und Nachtmarkt

Batch `pfade`, erzeugt am 9. November 2026 mit `image_gen` nach
`erledigt/codex_A_pfade_traenke_nachtmarkt.md`: **155 PNGs** unter `public/sprites/`.

| Gruppe | PNGs |
|---|---:|
| Sieben Embleme in drei Größen, sieben Karten, Leiter und Sockel | 30 |
| 21 Tränke jeweils in 16×16 und 32×32 | 42 |
| 21 Formeln und Atlas | 22 |
| 29 Zutaten/Gegenstände und vier Atlanten | 33 |
| Vier Schilling-Icons und Münzanimation | 5 |
| Braukessel mit drei Animationen | 4 |
| Nachtmarkt-Tileset, Marktstände und Kampfgrube | 3 |
| Fünf Händler: Lauf-Sheets und Emotionsporträts | 10 |
| Laden-UI, Verdauungsanzeige, Kontrollverlust, Trinken, Aufstieg und Auren | 6 |

`manifest-pfade.json` enthält die exakten Framegrößen, Spalten/Zeilen,
Animationslisten, Geschwindigkeiten sowie benannte Ausschnitte für gemischte
UI-/Prop-Atlanten. Die Leiter ist 16×112; ihre separat gelieferten 24×24-Sockel
ragen beim Zusammensetzen seitlich jeweils vier Pixel über. Händler-Laufanimationen
verwenden unten/links/rechts/oben; Porträts neutral/misstrauisch/erschrocken/lächelnd.

Die verwendeten Prompts, Quellbild-Prüfsummen, Referenzdateien und Exportziele
stehen in `batch-pfade-generation.json`. 51 Generatorbilder wurden zugeschnitten,
mit Nearest Neighbor auf das Zielraster gebracht und auf dieselben 31 sichtbaren
Farben plus einen transparenten Paletteneintrag indiziert. Die Palette übernimmt
Grundtöne von 14b und ergänzt die sieben vorgeschriebenen Pfadakzente. Alpha ist
binär. UI und Props wurden nach Sichtprüfung in die dokumentierten Regionen
gepackt; Bodenvarianten haben gemeinsame Randpixel. Der mittlere Bereich der
Kontrollverlust-Overlays bleibt vollständig transparent.

```sh
# source-map.json: {"emblem_laterne": "/pfad/original.png", ...}
# Export benötigt Pillow, numpy und scipy; Prüfung benötigt Pillow und numpy.
python docs/art/export-pfade.py /pfad/source-map.json
python docs/art/verify-pfade.py
```

Die Prüfung deckt Vollständigkeit, Größen, Palette, Alpha, Frame-/Regiongrenzen,
belegte Animationen, Grundlinien, Formel-Atlas-Korrespondenz und Bodenränder ab.
Die fertigen Exporte wurden visuell geprüft. Vorschau: `pfade-preview.png`.
Die Einbindung und Animationstests im laufenden Spiel erfolgen separat;
dieser Batch verändert keinen Spielcode.

## Batch `kampf` – vollständiges Kampf-Assetpaket

Am 9. November 2026 aus `erledigt/codex_B_kampf.md` mit dem integrierten Bildgenerator
erzeugt. **53 neue PNGs**: zwölf Gegner (einschließlich fünf Bonusgegnern), neun
Hintergründe, 21 Fähigkeitseffekte, zwei Spieler-Sheets, sieben UI-/Treffer-Sheets
und zwei Übergänge. Batch 14b bleibt unverändert. Der Spielcode wurde nicht geändert;
die Laufzeiteinbindung und das Timing im Spiel stehen noch aus.

`public/sprites/manifest-kampf.json` folgt dem Schema von 14b und ergänzt `rows`,
`gameId`, Grundlinien, Icon-Zuordnungen und benannte `regions` für die gemischten
HUD-Atlanten. Alle Frame-Indizes sind nullbasiert. Gegner haben sechs Spalten und
fünf Reihen: `idle`, `attack`, `special` (Angriff B), `hurt`, `defeated`. Beide
Angriffe beginnen mit zwei identischen Ausholframes. Niederlagen halten den letzten
Frame; nur `idle` ist als Schleife vorgeschlagen.

Die Effekte liegen als einreihige Streifen vor. `skill_icons.png` hat sieben
Pfadspalten und drei Sequenzreihen (9, 8, 7). `status_icons.png` enthält zwölf
Icons in der vorgegebenen Reihenfolge. `damage_font.png` hat zwölf 8×10-Zellen
pro Farbreihe, einschließlich `+` und `-`. `hits.png` verwendet 48×48-Trägerzellen;
`effectRegions` beschreibt die mittigen 32×32-Ausschnitte und den 48×48-Krit-Effekt.
Die Atlasrechtecke, 9-Slice-Ränder, Füllstände und Cursor-Animationen stehen im Manifest.

Alle PNGs sind indiziert mit einer gemeinsamen Palette aus 32 sichtbaren Farben
und einem transparenten Index. Die Palette übernimmt die Grundfarben aus 14b und
ergänzt die sieben vorgegebenen Pfadfarben sowie Rot. Hintergrundbilder sind opak.
Die verwendeten Prompts, Korrekturen, Quellbild-Hashes und gemessenen Ausschnitte
sind in `batch-kampf-generation.json` dokumentiert. Große Generator-Arbeitsbilder
werden vom Spiel nicht benötigt und sind nicht Teil des Repos.

Reproduzierbarer technischer Export mit Python, Pillow und NumPy:

```sh
python docs/art/export-kampf.py /pfad/zu/den/generatorbildern
python docs/art/verify-kampf.py
```

Die Prüfung kontrolliert alle 53 Dateien, Zielmaße, gemeinsame Palette, binäres
Alpha, Padding, Grundlinien, gehaltene Ausholposen, Atlasgrenzen, Übergangs-Endpunkte
und alle 21 Fähigkeits-IDs gegen `src/data/pathways.json`. Die exportierten Sheets
wurden zusätzlich visuell kontrolliert. Eine Übersicht liegt in `batch-kampf-preview.png`.


## Grafikpaket C – Figuren, Portraits und Orte

Batch `welt`, erzeugt am 9. November 2026 mit `image_gen` nach
`erledigt/codex_C_figuren_orte.md`: **85 PNG-Sheets** unter `public/sprites/`.

| Gruppe | Sheets | Raster |
|---|---:|---|
| 23 NPCs: Laufanimationen, einschließlich Nate und neun künftiger Figuren | 23 | 64×128, 4×4 Frames à 16×32 |
| Spieleraktionen | 1 | 64×192, sechs Reihen à vier Frames |
| 36 Figurenportraits und acht Zusatzsets | 44 | 256×64, vier Portraits à 64×64 |
| Lagerhaus, Altmarkt, Taverne und Bahnhof | 4 | 16er-Raster, benannte Regionen |
| Revier-, Lagerhaus- und Altmarkt-Props | 3 | 16er-Raster, benannte Regionen |
| Theater, Uhrturm, Schlachthof, Gaskanäle und Sternwarte | 5 | je 384×192, benannte Regionen |
| Journalmarker, Journalstreifen und Stadtmarker | 3 | 16×16 bzw. 160×24 pro Zelle |
| Tiere und Wetter | 2 | 16×16 bzw. 64×64 pro Zelle |

`public/sprites/manifest-welt.json` enthält Dateimaße, Framegrößen, Spalten/Zeilen,
nullbasierte Animationslisten, Geschwindigkeiten, Portraitausdrücke, UI-Namen und
benannte Atlasregionen. `regionAnimations` verweist auf diese Regionen, insbesondere
für Brunnen, Feuer, Rampenlicht, Zahnräder, Pendel, Gas und Moos. Diese Ausschnitte
können über den Atlas verteilt sein; ihre Namen und Rechtecke sind maßgeblich.

Laufrichtungen: unten, links, rechts, oben. Die Fußgrundlinie liegt nach der
Rasterung bei y=30 innerhalb jeder 16×32-Zelle (exklusive Unterkante 31).
Spieleraktionen sind einmalig, nur Schütteln ist als Schleife markiert.
Portraits verwenden vier benannte Zustände in der angegebenen Reihenfolge.
Wetter verwendet 6×6 Zellen: vier Regen-/Schnee-/Aschereihen mit je vier Frames,
sechs Nebelframes, vier Spritzwasserframes; Restfelder sind leer. Die Spritzer sind
16×16 groß und mittig in 64×64-Zellen abgelegt.

Die tatsächlichen Prompts, verwendeten Referenzen, Originaldateinamen,
Prüfsummen und Zuschnittrechtecke stehen in `batch-welt-generation.json`.
85 Generatorbilder wurden pro Frame bzw. Objekt zugeschnitten, mit Nearest
Neighbor gerastert und auf die 31 sichtbaren Farben von Batch 14b plus einen
transparenten Paletteneintrag indiziert. Alpha ist binär, Portraits sind deckend.
Bodenvarianten innerhalb der dokumentierten `seamFamilies` haben gemeinsame
Randpixel. Die großen Generatororiginale sind keine Laufzeitassets.

```sh
# Benötigt Pillow und numpy; SOURCE_DIR enthält die Original-PNGs.
python docs/art/export-welt.py SOURCE_DIR .
python docs/art/verify-welt.py
```

Die Prüfung kontrolliert alle 85 PNGs auf Vollständigkeit, Maße, Palettenfarben,
Alpha, Framebelegung, Grundlinien, Atlasgrenzen, Überlappungen, Animationsvariation,
Wetter-Padding und Bodenränder. Ergebnis: `welt-validation.json`.
Visuelle Übersicht: `welt-preview.png`.

Dieses Paket stellt die Grafiken und Metadaten bereit. Die Einbindung sowie
die Beurteilung von Timing, Lesbarkeit und Übergängen im laufenden Spiel erfolgen
separat. Es wird kein Spielcode geändert.

## Grafikpaket I – Reisen und Sekten

Batch `reise`, am 9. November 2026 nach `codex_I_reisen_sekten.md` mit
`image_gen` erzeugt: **61 PNGs**, ohne Änderungen am Spielcode.

- Acht Sektengegner: je ein 48×48-Kampf-Sheet (6×5 Zellen) und ein
  16×32-Lauf-Sheet (4×4 Zellen).
- Odo und Ysolde: zusätzlich je ein 96×96-Boss-Sheet (6×6 Zellen, Phase 2)
  unter `battle/boss_<id>.png` und vier Emotionsportraits.
- Reisearten, Spielermarker, Routenatlas und sieben Ereignisbilder (240×135).
- Zwei Fraktionsembleme mit 16-, 32- und 64-Pixel-Regionen.
- Zwei Versteckatlanten: je 8×6 Bodenkacheln à 16×16 links oben und
  24 benannte Props à 32×32 rechts; vier Feuerframes pro Atlas.
- Zwei Kampfhintergründe (480×270), Ankerhof-/Morrow-Props,
  acht Gegenstände jeweils in 16×16 und 32×32 sowie ein Itematlas.
- Jory, Lavinia und Tilly: je Lauf-Sheet und vier Portraits.
- Fraktions-UI für die spätere Einbindung.

`public/sprites/manifest-reise.json` folgt dem 14b-Schema und beschreibt
Framegrößen, Spalten, Zeilen, Animationslisten, Geschwindigkeiten und benannte
Atlasregionen. Kampfanimationen: idle / attack / special / hurt / defeated;
Boss-Sheets ergänzen phase2. Beide Angriffe beginnen mit zwei identischen
Ausholframes. Leere Restfelder sind transparent. Laufreihen: down / left /
right / up. Grundlinien sind als exklusive Unterkante angegeben.
Die Regionsnamen sind für die gemischten Atlanten maßgeblich; die Dossierregion
ist 96×128, Reise-Routen 8×8, Zielmarker 8×16.

Die tatsächlichen Prompts, Referenzen und SHA-256-Hashes der ausgewählten
Generatorbilder stehen in `batch-reise-generation.json`. Insgesamt 47
Generierungen einschließlich zweier Laufzyklus-Korrekturen. Export mit Nearest
Neighbor, gemeinsamer 31-Farben-Palette aus Batch C/14b, binärem Alpha,
zellexaktem Zuschnitt und gleicher Grundlinie. Die gemischten Atlanten wurden
nach Sichtkontrolle in die dokumentierten Zielregionen gepackt.

```sh
python docs/art/export-reise.py /pfad/zu/generatorbildern
python docs/art/verify-reise.py
```

Pillow, NumPy und SciPy werden für den Export benötigt. Die Prüfung kontrolliert
alle 61 Dateien, Maße, Palette, Alpha, Framebelegung, Grundlinien, Padding,
Ausholframes und Regionsgrenzen. Ergebnis: `reise-validation.json`.
Übersicht: `reise-preview.png`. Die Einbindung, das Animationstiming und
Tileset-Übergänge im laufenden Spiel müssen separat beurteilt werden.
