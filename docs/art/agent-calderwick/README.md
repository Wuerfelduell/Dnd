# Calderwick-Requisiten statt Platzhalter-Klötzen

Erzeugt mit `python3 tools/art/cw_kulissen/assets.py` (Pillow, pixelweise). Palette: `manifest-calderwick2.json` (die CE1-Palette plus Siegelrot).
Eingebaut über `src/data/calderwickKlotze.js`, das zwischen `applyCalderwickStadtplan` und `applyCalderwickKulisse` läuft.
Bilder: `python3 tools/art/cw_kulissen/vorschau.py <ref>`. Test: `tests/calderwick_klotze.test.js`.

## Befund

- Alle acht kleinen Innenräume haben in der Raummitte denselben Mauerklotz 3x1. Die Kulisse belegte ihn mit Wand- und Dachzellen,
  Pfandhaus und Buchbinderei sahen dadurch identisch aus.
- Alte Setzerei, Sortiergrube und Nullfundament haben je acht Klötze 3x3 und vier 3x1 im Raster, ebenfalls mit Wand- und Fensterzellen belegt.
- **Rohrpost-Station, Druckerpresse, Buchpresse, Setzkasten, Marktstände und eine Waage gibt es schon** (CE1, `cwp_*`, teils animiert).
  Sie wurden nicht neu gezeichnet. Aus den Vorschlägen neu sind Aktenturm, Archivleiter (beide in einem Stück), Siegelpresse und Quittungsstand.

## Die zehn Requisiten (`public/sprites/props/cwk_*.png`, `manifest-cw-kulissen.json`)

| Requisit | Größe | Orte |
|---|---|---|
| Quittungsstand | 48x32 | Pfandhaus |
| Heftlade | 48x32 | Buchbinderei |
| Aktenturm mit Archivleiter | 48x48 | Archivsaal, Villa, Nullfundament (3x1) |
| Siegelpresse | 48x32 | Druckkammer |
| Brieffach-Sortiertisch | 48x40 | Sortierhalle, Gepäckhalle, Sortiergrube (3x1) |
| Küchenanrichte | 48x32 | Küche |
| Satzregal mit Setzschiffen | 48x48 | Alte Setzerei (3x3) |
| Setzertisch (Schließplatte) | 48x32 | Alte Setzerei (3x1) |
| Briefsortier-Trommel | 48x48 | Sortiergrube (3x3) |
| Fundamentpfeiler mit Registerplatten | 48x48 | Nullfundament (3x3) |

## Wege

Die Klötze werden zu `Y` (fest, Bodenoptik über die Themengruppe `kulisse`) und liegen genau dort, wo vorher `I` war.
Die Begehbarkeit ist daher unverändert, die Requisiten selbst sind nicht zusätzlich fest. Neue Spieltexte: keine.

## Offen

- Die Kulisse stellt in Innenräumen weiter die Kettlegate-Öllampe `oil_lamp` auf (ein Leihbild).
- Die Pfadviertel `o3_*` haben dieselben Klotz-Raster und sind nicht Teil dieser Runde.
