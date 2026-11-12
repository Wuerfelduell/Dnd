# DF / tiere

`python tools/art/tiere/check.py --write` validiert die 20 PNGs und erzeugt
Prüfbericht sowie die vollständige Vorschau. Benötigt Python und Pillow.
Die Prüfung läuft unabhängig vom Arbeitsverzeichnis.

Prüft feste Dateiliste, Maße/Frame-Raster, Palette je Datei und insgesamt,
binäres Alpha und transparente RGB-Werte, Grundlinien und Frame-Ränder,
belegte/leere Zellen, Richtungen, unterschiedliche Animationsphasen,
Portraitstimmungen, Stufenicons, Regionsgrenzen und Herkunfts-Hashes.

`export.py inputs.json` dokumentiert die lokale Nachbearbeitung der Generator-
Originale. Eingabe: Liste `{key,path,prompt}`; vier Tierkeys (`rabe`, `kater`,
`hund`, `ratte`) mit `_walk`, `_poses`, `_portrait`, `_battle` plus
`symbole`, `symbole_fix`, `marker`, `zufrieden`, `plaetze`.
Vollständige Prompts, Originaldateinamen und SHA-256 stehen in der Generation-
Datei; die großen Originale sind keine Laufzeitassets und nicht im Paket.
Prüfung und Vorschau benötigen nur die finalen Repo-Dateien.

Die Kartenfiguren sind absichtlich 16×16; die allgemeinen 16×32-Figurenmaße
gelten hier nicht. Zusatzposen haben das separate Blatt `<id>_posen.png`,
64×48, mit Ruhe 0/1, Gabe 4–7 und Freude 8–10. Restfelder bleiben transparent.
Die sechs Kampfframes verwenden 48×48, Effekt einmal auf Frame 3.
