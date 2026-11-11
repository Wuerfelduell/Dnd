# BZ – zweite Fähigkeiten

Nur Grafikexport. Die 180 IDs werden aus `src/data/packs/sequenzen/faehigkeiten2.json` übernommen. Beide Atlanten haben 10 Spalten (Laterne bis Uhr) und 9 Zeilen (Sequenz 9 bis 1); der Index ist `Zeile * 10 + Spalte`. Die drei neuen Pfade heißen in den Daten `sq_waage`, `sq_moor` und `sq_uhr`.

## Dateien

- `public/sprites/ui/skill_icons_3.png`: zweite Kampffertigkeiten.
- `public/sprites/ui/talent_icons.png`: Welt-Fähigkeiten mit hellem Innenring.
- Je 90 Einzelbilder unter `ui/skills3/` und `ui/talents/`.
- `public/sprites/manifest-faehigkeiten2.json`: beide Assets mit `skillIds` im 9×10-Raster.
- `docs/art/preview-faehigkeiten2.png`: beide Atlanten exakt vierfach vergrößert; alle Beschriftungen liegen außerhalb der Zellen.
- `docs/art/batch-faehigkeiten2-generation.json`: tatsächlich verwendete Prompts, Referenzen, Quellenprüfsummen und Zuschnitte.

## Export und Prüfung

`python tools/art/faehigkeiten2/export.py SOURCE_DIRECTORY`

Die Bildgenerierung erstellt je Pfad und Fähigkeitstyp einen Bogen aus neun Motiven. Die Produktionsbögen verwenden ein 3×3-Raster, damit die neun Motive ohne extrem schmales Panorama generiert werden; ihr Inhalt wird anschließend einzeln in die geforderte Atlas-Spalte gesetzt. Die Reihenfolge innerhalb jedes Quellbogens ist zeilenweise Sequenz 9 bis 1.

Pillow entfernt äußeren Quellbild-Leerraum anhand der dunklen Medaillons, verkleinert jede Zelle mit Nearest Neighbor, vereinheitlicht Kreisrand, Welt-Innenring und oberen Glanzpunkt und indiziert auf eine gemeinsame Palette mit 32 sichtbaren Farben plus transparentem Index. Die kleinen Okkultmarkierungen der Sequenzen 3 bis 1 bleiben auch nach dem Verkleinern sichtbar. Originaldateinamen und SHA-256 stehen in der Generierungsdatei; Originalbilder werden nicht zur Laufzeit benötigt.

`python tools/art/faehigkeiten2/check.py`

Prüft Maße, 180 eindeutige nichtleere Zellen, exakte Daten-IDs und Atlasreihenfolge, Einzelbildgleichheit, gemeinsame Palette, binäres Alpha und den Welt-Innenring. Bestehende Spieltests: `node --test tests/sprites.test.js`.

Die Einbindung in `src/world/assets.js`, `skillIconOf`, `Ui.talentRowHtml` und `tests/sprites.test.js` bleibt dem Integrationspaket vorbehalten. Hauptfertigkeiten und vorhandene Atlanten werden nicht geändert.
