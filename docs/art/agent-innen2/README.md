# Mutterhaus, Labor und Dunscarer Zirkelräume

Erzeugt mit `python3 tools/art/innen2/assets.py`. Palette: `manifest-dunscar1.json`, identisch mit `manifest-briarholt1.json`. Einbau: `src/data/innen2.js`.
Bilder: `python3 tools/art/vergleich_orte.py docs/art/agent-innen2 <ref> <karten…>`. Test: `tests/innen2.test.js`.

## Prüfung, welche Räume leer wirken (Möbel je 100 Bodenfelder)

| Raum | vorher | Befund |
|---|---|---|
| bh_mutterhaus | 2,8 | leer, gemeinsam mit dem Aktenraum am leersten in Briarholt |
| bh_labor | 3,2 | leer |
| treffen_kalkofen (Kalter Ofen) | 5,0 | nicht leer, aber Möbel der Kettlegater Rußbrüder |
| treffen_stellwerk (Stummes Stellwerk) | 5,2 | nicht leer, aber Möbel des Kreidezirkels |
| treffen_schichtbund | – | Möbel des Waage-Zirkels |
| treffen_salzds | – | Möbel des Wexmoorer Salzzirkels |

Zum Vergleich liegen Bügelraum und Lohnbüro bei 4–5.

## Die zehn Stücke

| Stück | Raum | statt |
|---|---|---|
| Reißbrett mit Lampe | Mutterhaus | neu |
| Fundamentmodell (Pumpenhaus über Wurzeln, unter Glas) | Mutterhaus | neu |
| Destillierkolonne | Labor | neu |
| Mikroskoppult | Labor | neu |
| Kalter Kalkofen | Kalter Ofen | Russ-Theke |
| Glasbläserbank | Kalter Ofen | Kohlenwaage |
| Hebelbank (drei Hebel stillgelegt) | Stummes Stellwerk | Kreidetisch |
| Telegrafenpult | Stummes Stellwerk | Kreide-Lesepult |
| Stempeluhr (2×) | Schichtbund | Waage-Schränke |
| Siedepfanne | Salzbund Dunscar | Salztisch |

Mutterhaus und Labor steigen damit von 2,8/3,2 auf rund 3,6/4,0. Getauschte Stücke behalten Feld und Kollision.
Neue Stücke stehen auf freiem Boden ohne Objekt daneben und sind fest nur bei voller Erreichbarkeit. Neue Spieltexte: keine.

## Sichtprüfung

- Kalter Kalkofen: Der Reif war zu dicht und sah verschneit aus → ausgedünnt.
- Der Vergleichs-Renderer zeigte die Leihmöbel der Zirkel nicht, weil Manifeste fehlten → allgemeine Manifest-Auflösung, Bilder neu erzeugt.

## Noch offen

In den Zirkelräumen bleiben Hocker, Stühle, Kerzen, Käfig, Teleskop und die Raumkacheln (`o_russ`, `o_kreide`, `o_waage`, `s_salz`) aus den anderen Zirkeln.
