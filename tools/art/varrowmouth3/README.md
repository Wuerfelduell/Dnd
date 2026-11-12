# CY – Varrowmouth-Figuren

Reproduzierbarer Export aus 58 normalisierten RGBA-Generator-Sheets in `sources/`. Die vollständigen Prompts, Quell-Hashes und Crop-Regionen stehen in `docs/art/batch-varrowmouth3-generation.json`. Neutralportrait und Kopf werden aus dem jeweiligen Emotions-Sheet abgeleitet.

Voraussetzung: Python 3 und Pillow. Vom Repository-Stamm:

```sh
python tools/art/varrowmouth3/export.py
python tools/art/varrowmouth3/check.py
```

Der Export nutzt Nearest Neighbor, die gemeinsame 32-Farben-Palette und binäres Alpha. Er richtet Lauf-Grundlinien aus, erhält Posen-Proportionen, dupliziert die zwei Ausholframes je Angriff und erzeugt die sechs geforderten reinen Farbzustände der Wasserlinie. Sonstige Figuren und Posen stammen aus Bildgenerierung.

Die Prüfung schreibt den JSON-Bericht und den Kontaktbogen unter `docs/art/`. Bildvergleiche prüfen technische Unterschiede, ersetzen aber keine Sichtprüfung. Es gibt keine Spielcode-Änderungen oder Laufzeitintegration.

Die optionale einmalige Erstübernahme `--prepare` benötigt die ursprünglichen Generator-Dateien und eine lokale `tasks.json`; diese temporären Pfade gehören nicht zum Paket. Für normale Exporte reichen die eingecheckten Master.
