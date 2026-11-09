# Grafikpaket G – Wildnis, Monster und Loot

Erstellt am 9. November 2026. 73 mit dem integrierten Bildgenerator erzeugte
Vorlagen wurden in 121 Spiel-PNGs exportiert. Die tatsächlich verwendeten
Prompts und Quelldateinamen stehen in `batch-wildnis-generation.json`.

## Umfang

- Vier Gebiete: Schwarzwasser-Marsch, Pestgassen, Katakomben und Kraterwald;
  jeweils Tileset, Props und Kampf-Hintergrund.
- 16 Monster mit Kampf-Sheet, Overworld-Sheet und Bestiarium-Karte;
  vier Bosse besitzen zusätzlich Phase-2-Animationen.
- Monster-Effekte, Gefahrenanzeige und gemeinsames pulsierendes Gefahren-Overlay.
- Vier Loot-Behälter, Loot-Extras, Seltenheitsrahmen und Loot-Oberfläche.
- 16 Materialien und acht Ausrüstungsstücke, jeweils als Einzel-Icon in
  16×16 und 32×32 sowie in drei Atlanten.
- Lagerfeuer, Rastplatz und weitere sichere Lager-Props.

## Import und Animationen

Alle Pfade im Manifest `public/sprites/manifest-wildnis.json` sind relativ zu
`public/sprites/`. Gleichmäßige Sheets verwenden `frameWidth`, `frameHeight`,
`columns`, `rows` und nullbasierte Frame-Nummern. Gemischte Prop-, Effekt- und
UI-Atlanten verwenden benannte `regions` mit exakten Pixel-Rechtecken;
ihre Animationen referenzieren diese Namen. `frameRate` ist der Vorschlag
für Bilder pro Sekunde; `repeat: -1` bezeichnet eine Schleife.

Kampf-Sheets haben sechs Spalten, konstante Grundlinie, transparente Restfelder
und eine über zwei Frames gehaltene Ausholpose. Die vier Overworld-Reihen sind
unten, links, rechts, oben. Elite-Varianten verwenden dieselben Grafiken.

Die drei Item-Atlanten sind 256×48 Pixel groß: acht 16×16-Icons ab x=0, y=0;
darunter acht 32×32-Icons ab x=0, y=16. Der rechte Teil der ersten Reihe ist leer.
Die Einzeldateien tragen die vorgegebenen Item-IDs.

Das Gefahren-Sheet enthält eine gemeinsame vierteilige Vignettenanimation,
die im Manifest allen vier Gebieten zugeordnet ist. Der Loot-Fensterrahmen
ist für 9-slice mit einem Rand von 16 Pixeln markiert.

## Export und Prüfung

Gemeinsame Palette mit 31 sichtbaren Farben plus transparentem Index; binäres
Alpha, Nearest-Neighbor-Skalierung, deckende Hintergründe und Bestiarium-Karten.
Die technische Nachbearbeitung zeichnet keine neuen Motive.

Benötigt Python 3, Pillow und NumPy. Die hochauflösenden Generatororiginale
werden für den Spielimport nicht benötigt und sind nicht in dieser ZIP.
Für einen erneuten Export die protokollierten Originale bereitstellen:

```sh
python3 docs/art/export-wildnis.py --source-dir /pfad/zu/generatorbildern
python3 docs/art/verify-wildnis.py
```

`validation-wildnis.json` dokumentiert die erfolgreiche Prüfung von 121 Dateien,
31 gemeinsamen sichtbaren Farben und 805 Animations-Frame-Referenzen. Geprüft
werden unter anderem Maße, Alpha, Palette, Regionen, belegte Animationen,
leere Padding-Zellen und die gehaltene Ausholpose. Übersichten der exportierten
Monster, Gebiete, Karten und Extras wurden zusätzlich visuell kontrolliert.

## Einbaustand

Nur Assets und Dokumentation; kein Spielcode geändert. Import, Animationstiming
und Tile-Übergänge müssen beim separaten Einbau im Spiel geprüft werden.
Es wurde kein Laufzeittest des Spiels durchgeführt.

Beim Upload ersetzen die 15 bereits vorhandenen 16×16-Material-Icons die bisherigen Motive durch die neuen Batch-G-Versionen. Alle übrigen Spielassets bleiben erhalten.
