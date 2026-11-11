# BX · Konzentrations-Artefakte

16 eigenständige Icons ersetzen die bisherigen Kopien unter `public/sprites/items/`. Das Sheet `BX_konzentration_icons.png` enthält dieselben Pixel in einem 4×4-Raster (64×64, Zellen 16×16), zeilenweise in der Reihenfolge des Auftrags. Transparente RGBA-PNGs, harte Pixelkanten, Outline `#1a1c2c`, gemeinsame Palette mit 25 Farben und drei Materialstufen. Keine optionalen 32er-Fassungen.

| Reihe | Spalte 1 | Spalte 2 | Spalte 3 | Spalte 4 |
|---|---|---|---|---|
| 1 | siebter_fingerring | metronom_ohne_feder | schlagzaehler | hohle_krone |
| 2 | tickender_zahn | nadel_der_naeherin | gedankenkaefig | stummer_chor |
| 3 | zweites_herz | rangierlinse | kreidezirkel | sanduhr_voll_asche |
| 4 | uhrwerkherz | knoechelrosenkranz | kerzenkrone | aschestundenglas |

## Herstellung und Einbau

Der vollständige Bildgenerierungs-Prompt einschließlich BP-Style-Block und Artefaktkontext steht in `batch-konzentration-generation.json`. Das generierte Raster wurde mit `tools/art/konzentration/export.py` per Nearest Neighbor auf native Größe gebracht, auf eine gemeinsame Palette reduziert und mit binärer Transparenz und Außenkontur exportiert. Bei 16 Pixeln sind Binnenmerkmale wie die zwölf Figuren oder Knöchel als Gruppen abstrahiert; sie sind nicht einzeln abzählbar. Das Manifest `public/sprites/manifest-konzentration.json` dokumentiert Rasterpositionen, Palette und SHA-256-Prüfsummen.

Die beiden überlappenden BY-Motive `zweites_herz` und `nadel_der_naeherin` sind hier bereits enthalten. Ihre bisherigen Einträge in `NERVEN_ARTEFAKT_ICONS` wurden entfernt, damit der Loader die neuen Dateien tatsächlich nutzt. BY kann diese beiden Motive auslassen. Das zweite Herz folgt dem BX-Motiv aus Torf und Draht, die Nadel dem roten Faden. Die übrigen Verweise und ICON32 bleiben unverändert.

## Prüfung

- Sichtprüfung des vollständigen Sheets in pixelgenauer Vergrößerung.
- Alle 16 Dateien sind voneinander verschieden und ersetzen die jeweiligen alten Platzhalter.
- RGBA, 16×16 bzw. 64×64, Alpha ausschließlich 0/255, höchstens 25 sichtbare Farben; Sheet-Zellen stimmen pixelgenau mit Einzeldateien überein, Manifest-Prüfsummen stimmen.
- `npm test`: 505 Tests bestanden, 0 Fehler.
