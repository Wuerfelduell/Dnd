# Nebelakten – Future 200

200 eigenständige Pixelart-Motive für zukünftige Inhalte, jeweils als Spielraster-PNG und als 256×256-PNG (400 PNG-Dateien insgesamt). Kein Spielcode, keine bestehende Datei wird ersetzt.

## Inhalt
- 120 Inventar-Icons, 32×32 Pixel, transparent.
- 40 eigenständige NPC-Porträts, 64×64 Pixel, transparent. Statische Dialogporträts, keine Lauf- oder Kampfanimationen.
- 40 Umgebungstexturen, 16×16 Pixel, opak. Als Texturbausteine gedacht; keine vollständigen Autotile-Sets, Kantenübergänge oder Kollisionen enthalten. Wiederholungswirkung vor Einbau prüfen.
- preview.jpg: alle Spielraster-Motive mit Nummer und Kurzbezeichnung.
- preview-large.jpg: Übersicht der größeren Fassungen.
- preview-tiles.jpg: Wiederholungsansicht der 40 kleinen Texturen.
- manifest-future200.json: Dateipfade, IDs, Maße, Kategorien, Palette und Prüfsummen.
- generation-prompts.json: Einzelprompts der KI-Bildgenerierung.
- sources_256/: dieselben 200 Motive zusätzlich in 256×256 Pixeln, vor Reduktion auf Spielraster und gemeinsame Palette. Keine zusätzlichen Motive. Diese Fassungen können mehr Farben und abgestuftes Alpha enthalten.
- validation.json und check.py: technische Prüfung.

## Verwendung
Den Ordner public/sprites/future200 bei Bedarf ins Repo kopieren. IDs beginnen mit future200_; Einbau und Spielwerte bleiben offen. PNGs ohne Glättung darstellen (image-rendering: pixelated / nearest-neighbor). Die 200 Motive werden ohne Größenvarianten und Vorschauen gezählt.

## Herstellung
Jedes Motiv separat mit dem integrierten Bildgenerator erstellt. Anschließend auf das Zielraster mit Nearest Neighbor reduziert, auf eine gemeinsame Palette von 32 Farben indiziert und Alpha binär gesetzt. Neue freie NPC-Motive ohne Zuordnung zu bestehenden Storyfiguren. Keine fremden Bilddateien verwendet.
