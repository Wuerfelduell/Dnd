# CV / varrowmouth1

`python tools/art/varrowmouth1/check.py --write` prüft die 17 finalen PNGs und
schreibt Validation und Preview. Benötigt nur Python und Pillow.

Prüfungen: feste Dateiliste und Maße, 16er-Raster, belegte/leere Zellen,
Palette je Datei und insgesamt, binäres Alpha, transparente RGB=0, Regionsgrenzen
und Überlappungen, Animationsframes und Unterschiede, exakte Ebbe-/Flut-Differenz-
Zellliste, 2.688 Boden-/Wasserkantenvergleiche, Pflichtgrößen und SHA-256.
Die Vorschau zeigt 14 Kacheltests (je 8×8) und die Props/Fassaden.

`export.py inputs.json` ist die dokumentierte Nachbearbeitung der ImageGen-Originale.
`inputs.json` enthält `records: [{key,path,prompt}, ...]` und `propnames` (60 Namen
in Reihenfolge der Generatorvorlage). Keys: sieben Themennamen und je `_flut`,
`props`, `fassaden`, `wasser_anim`, `propfix`. Die Originaldateinamen, ihre Hashes
und alle vollständigen Prompts stehen in der Generation-Datei. Die großen
Generatororiginale sind keine Laufzeitassets und werden nicht mitgeliefert.
Die Prüfung und Vorschau benötigen ausschließlich die finalen Repo-Dateien.

Das 16er-Wasserset ist ein Corner-Wang-Set: Ecken NW=1, NE=2, SE=4, SW=8;
Wasserecken addieren und Frame `16 + mask` verwenden. Nachbarn teilen dieselben
Eckwerte. Dieses Set darf nicht als NESW-Kantenmaske interpretiert werden.
Fassaden sind ganze Regionen; der Einbau registriert diese separat, statt sie
unverändert als Wexmoors 128×96-Modulblätter zu laden. Zwei 96px hohe Türme passen
nicht in zwei Reihen eines 128px hohen Atlas; daher stehen sie nebeneinander.
