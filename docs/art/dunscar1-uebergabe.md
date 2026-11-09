# Dunscar: Grafikübergabe AV → AS

Batch `dunscar1`, Stadt `dunscar`, verbindliche Vorlage: `docs/story/kapitel3/geschichte_3.md`.
Die Assets sind für die separate Einbindung vorbereitet. Das Manifest ist die Quelle für Dateipfade, Zellindizes, Regionen und Animationen. Der Batch ändert keinen Spielcode und keine Storydaten.

| Karten-ID | Tilesets | Props | Kampfkulisse |
|---|---|---|---|
| `ds_endbahnhof` | ds_stadt, ds_bahn | ds_endbahnhof | bg_ds_endbahnhof |
| `ds_schwellenring` | ds_stadt, ds_bahn | ds_schwellenring | bg_ds_schwellenring |
| `ds_arbeiterbogen` | ds_stadt | ds_arbeiterbogen | bg_ds_arbeiterbogen |
| `ds_kalkmarkt` | ds_stadt | ds_kalkmarkt | — |
| `ds_bruchstufen` | ds_bruch | ds_bruchstufen_signalhang | bg_ds_bruchstufen |
| `ds_signalhang` | ds_bahn, ds_schlucht | ds_bruchstufen_signalhang | — |
| `ds_speisewagen` | ds_zug, ds_innen | ds_speisewagen | — |
| `ds_runddepot` | ds_bahn, ds_innen | ds_schwellenring, ds_nachtzug | — |
| `ds_pruefhaus` | ds_innen | ds_pruefhaus | — |
| `ds_teesaal` | ds_innen | ds_arbeiterbogen, ds_speisewagen | — |
| `ds_lohnbuero` | ds_innen | ds_lohnbuero | — |
| `ds_nachtzug_wagen` | ds_zug | — | bg_ds_nachtzug |
| `ds_nachtzug_lok` | ds_zug | — | bg_ds_nachtzug |
| `ds_rangierwueste` | ds_bahn | ds_schwellenring | bg_ds_rangierwueste |
| `ds_klopfbruch` | ds_bruch | ds_bruchstufen_signalhang | bg_ds_klopfbruch |
| `ds_rufschlucht` | ds_schlucht | ds_bruchstufen_signalhang | bg_ds_rufschlucht |
| `ds_letzter_bahnsteig` | ds_bahn, ds_schlucht | ds_endbahnhof | bg_ds_letzter_bahnsteig |
| `ds_unterschicht` | ds_schlucht | — | bg_ds_unterschicht |

Alle 18 Karten-IDs haben einen eigenen 16×16-Marker in `ui/ds_marker.png`.
Die Stadtkarte und ihr Nebel-Overlay sind je 480×270. Der Overlay ist eine Gesamtgrafik; Gebietsfreischaltungen benötigen in der späteren Einbindung passende Masken.

## Raster und Animationen

- Tilesets: 8 Spalten, 16×16 pro Zelle, `tileNames` in zeilenweiser Reihenfolge; zusätzlich benannte `cells` mit Rechtecken.
- Die Drehscheibe ist **ein 64×64-Verbund** im Bahnsheet: x=0, y=32, vier Spalten und vier Reihen. Nicht als vier voneinander unabhängige Animationen lesen.
- Props: 64×64-Zellen, 4 Spalten, transparente Randzone, benannte `regions`. Fassaden sind dekorative Gesamtobjekte; die Hauswände lassen sich alternativ aus dem Stadt-Tileset bauen.
- Nachtzug: fünf 208×32-Zeilen. Zeilen 0–3 sind aktive Phasen, Zeile 4 ist stillgelegt. Pro Zeile Lok 64×32 plus drei Wagen zu je 48×32. Einzelteile über `regions` und `regionAnimations`, vollständiger Zug über `animations`.
- `fx/ds_nachhall.png`: acht 48×48-Frames, 10 fps, einmal abspielen.
- `fx/ds_nachhall_weg.png`: 4 Spalten × 3 Reihen, 16×16. Gerade / Kurve / Ende mit je vier Pulsphasen. Rotationen für andere Richtungen in der späteren Einbindung.
- Horchstelle: Frames 5–8 im Sheet `ds_bruchstufen_signalhang`; Gerüst 0–1. Signal oben/unten: 5–6 in `ds_schwellenring`. Ofen: 1–2, Phonograph: 4–7 in `ds_speisewagen`.
- Schluchtöffnung: Zellen 24–27 in `ds_schlucht`. Vorbeiziehende Nacht: Zellen 12–15 in `ds_zug`.
- Kampfkulissen: 480×270, untere 70 Pixel für die Figuren freigehalten. Personen und Gegner kommen aus AW/AX.

## Reproduzieren und prüfen

Die tatsächlich verwendeten Prompts, Stilreferenzen, Quellnamen, Quellprüfsummen und gemessenen Zuschnitte stehen in `batch-dunscar1-generation.json`. Quellen wurden mit dem eingebauten Bildgenerator erstellt. Export: Nearest Neighbor, gemeinsame Palette aus dem vorhandenen Batch `nebenquests`, maximal 32 sichtbare Farben und binäres Alpha. Hochauflösende Generatorquellen sind keine Runtime-Dateien.

```sh
python docs/art/export-dunscar1.py SOURCE_RECORD_DIRECTORY
python docs/art/verify-dunscar1.py
node --test tests/sprites.test.js
```

Zum erneuten Export enthält das Quellverzeichnis pro ID eine JSON-Datei `{ "id": "…", "source": "/path/to/generated.png" }`. Der Prüfer benötigt ausschließlich die eingecheckte Lieferung.

Sichtübersichten: [Tiles](preview-dunscar1-tiles.png), [Props](preview-dunscar1-props.png), [Kampfkulissen](preview-dunscar1-backgrounds.png), [Karten und Szenen](preview-dunscar1-maps-scenes.png), [Zug und Effekte](preview-dunscar1-train-effects.png).
