# BV — Jahreszeiten und Feste

41 Pflicht-Sheets, 408 belegte Zellen. Reines Grafikpaket ohne Registrierung im Spiel,
ohne Kartenänderungen und ohne Austausch vorhandener Tiles. Aufgabenquelle ist das
vom Auftraggeber bereitgestellte Paket BV „Jahreszeiten und Feste“.

| Gruppe | Dateien | Zelle | Raster pro Sheet |
|---|---:|---|---|
| Saisonale Boden-Deko | 4 | 16×16 | 4×3 |
| Saisonale Partikel | 4 | 64×64 | 3×2 |
| Saisonale Fassadenaufsätze | 4 | 32×32 | 4×3 |
| Winteratem | 1 | 8×8 | 4×1 |
| Sommer-Hitzeflimmern | 1 | 480×270 | 1×2 |
| Fest-Props | 3 | 16×16 | 4×4 |
| Große Fest-Props | 3 | 32×32 | 3×2 |
| Fest-Sequenzbilder | 3 | 240×135 | 1×1 |
| Festbesucher | 12 | 16×32 | 4×4 = 64×128 |
| Gerede-Symbole | 3 | 16×16 | 3×2 |
| Ankündigungsbanner | 3 | 192×32 | 1×1 |

Dateinamen und jede Einzelregion stehen in `public/sprites/manifest-feste.json`.
`tools/art/feste/catalog.json` ist die Exportliste. Die Pflichtdateien
`fx/saison_herbst.png`, `fx/saison_winter.png`, `fx/saison_fruehling.png` und
`fx/saison_sommer.png` verwenden genau die vorgegebenen Namen; die übrigen
Dateien sind eindeutig mit `saison_` bzw. `fest_` benannt.

## Einbauhinweise

- Alle Frameindizes sind nullbasiert und zeilenweise. `regions` nennt Position,
  Größe und zugehörigen Frame. Es gibt keine unbeschrifteten Restzellen.
- Fassaden: Zeilen Kettlegate, Wexmoor, Dunscar; Spalten Girlande, Haube,
  Blumenkasten, Sonnensegel. Die Winterhaube trägt Schnee, im Herbst frühen
  Reif, im Frühling tauende Reste; die Sommervariante ist eine helle Abdeckung
  derselben Aufsatzform. Kein zufälliger Schnee im Sommer.
- Die 16×16-Winteraufsätze enthalten Befestigungsteile zur visuellen Lesbarkeit;
  ihre Platzierung muss der spätere Einbau an vorhandenen Pollern/Laternen
  ausrichten. Sie sind weder neue Terrain-Tiles noch komplette Karten.
- Gäste: `down`, `left`, `right`, `up`, je vier Frames mit 7 fps. Fußgrundlinie
  liegt bei y=30 (exklusive Unterkante), alle Zellen haben transparenten Abstand.
- Partikel: sechs Frames mit 6 fps, Atem vier Frames mit 6 fps. Hitzeflimmern:
  zwei Frames mit 3 fps. Der Sommer-Partikelatlas enthält Fliegen mit Staub;
  der Frühling Pollen und Regen gemeinsam. Die Effekte sind farbige, dünne
  Überlagerungen. Eine echte Bildschirmverzerrung benötigt später einen Shader.
- Laternennacht: vier Laternenfarben, je zwei Frames mit 3 fps; die acht
  verbleibenden Props sind statisch. Zusätzliche Einzel-Frame-Animationen erlauben
  gezielte Auswahl jedes Props.
- Gerede: Musik, Trinken, Lachen, Streit, Kuss, Schlaf. Keine Buchstaben im
  Schlafsymbol. Die drei separat erzeugten Sheets nutzen dieselbe Semantik.
- Banner enthalten keine Schrift. `textSafeRect` reserviert die freie Mitte
  für den später gerenderten Ankündigungstext.
- Nur die Sequenzbilder sind vollflächig deckend. Alle anderen PNGs enthalten
  Transparenz. 31 gemeinsame sichtbare Farben plus ein transparenter Index;
  Alpha ist ausschließlich 0 oder 255. Quellenfarben stammen aus der vorhandenen
  Vorrat3-Palette, die Stilreferenz aus der Dunscar4-Vorschau.
- Optionale Feuerwerke, Schneemann und Eisbahn sind nicht Teil dieser Lieferung.

## Reproduktion und Prüfung

```sh
python tools/art/feste/export.py
python tools/art/feste/check.py
node --test tests/sprites.test.js
```

Pillow wird benötigt. Der Export baut aus den eingecheckten normalisierten
Generator-Sheets unter `docs/art/feste-sources/`; er ruft keinen Bilddienst auf.
Alle Skalierungen erfolgen per Nearest Neighbor. Ursprungsbild-Hashes,
verwendete Prompts, Referenzen, Zellzuschnitte und Quell-Hashes sind in
`batch-feste-generation.json` dokumentiert. Die großen Originalausgaben werden
nicht für den reproduzierbaren Export benötigt. Es wurden keine Bewegungsframes
programmgesteuert erfunden.

Der Prüfer kontrolliert den Pflichtumfang unabhängig von der Exportliste, Maße,
32-Farben-Grenze inklusive Transparenz, gemeinsame Palette, binäres Alpha,
Zellränder, belegte Frames, Grundlinien, Animationen, Regionen, dünne FX und
Datei-/Quell-Hashes. `batch-feste-validation.json` enthält den letzten Lauf.
`preview-feste.png` zeigt alle 41 Sheets mit Schachbrettuntergrund; beim großen
Hitzeflimmern zeigt die Übersicht aus Platzgründen den ersten Frame.
