NEBELAKTEN — RESERVE 200
200 unterschiedliche Inventar- und Quest-Icons für spätere Verwendung.

START: ZIP vollständig entpacken, danach VORSCHAU.html im Browser öffnen.
Die Vorschau funktioniert offline, mit Suche und Kategorienfilter.

INHALT: Genau 200 PNGs in icons/, zehn Kategorien mit je 20 Motiven.
Ermittlung, Fundstücke, Alchemie, Relikte, Ausrüstung, Hafen, Handwerk,
Versorgung, Schlüssel/Siegel und Kuriositäten.

FORMAT: 64 × 64 Pixel, RGBA, echter transparenter Hintergrund,
binäres Alpha, höchstens 31 sichtbare Farben je Icon, mindestens 4px Rand.
Für scharfe Anzeige ganzzahlig vergrößern und Nearest Neighbor verwenden.
CSS: image-rendering: pixelated. Canvas: imageSmoothingEnabled = false.

EINBAU: Gewünschte Dateien später nach public/sprites/items/reserve200/
kopieren und die IDs beim jeweiligen Gegenstand registrieren. manifest.json
enthält relative Pfade, Namen und Prüfsummen. Keine bestehenden Spiel-IDs,
Werte, Effekte oder Quests werden dadurch automatisch angelegt.
Dies ist ein eigenständiges Grafikpaket, kein bereits integriertes Update.
Kein PR, keine Änderung am Repository.

ENTSTEHUNG: Individuell mit dem integrierten OpenAI-Bildgenerator erzeugt,
anschließend auf das Zielformat exportiert. Die verwendeten Prompts stehen
in generation.json. Alle 200 Motive sind eigenständige Bilder; Größenkopien
oder Farbvarianten wurden nicht als zusätzliche Motive gezählt.
Stilreferenz: docs/art/README.md aus Wuerfelduell/Dnd, gelesen 11.11.2026.
Keine externen Stockbilder oder fremden Figuren wurden übernommen.

Die Gegenstände sind frei benannte Reserve-Motive und beanspruchen keine
kanonische Bedeutung für bestehende Fälle oder bereits vergebene Assets.
