# briarholt1 (Codex-Paket CI)

- `check.py` – Prüfskript (Pillow): `python tools/art/briarholt1/check.py [--write]`.
- `export/` – die lokale Nachbearbeitungs-Pipeline für Props, Szenen, Kampf-Hintergründe,
  Karte und Marker (Palette-Majority-Downscale, Magenta-Key, binäres Alpha, Outline,
  abgeleitete Frames). Die rohen Generatorbilder liegen unter `docs/art/briarholt1-raw/`
  (SHA-256 und Zuordnung in `docs/art/batch-briarholt1-generation.json`).
- `export/tiles_v2/` – Tilesets v2, `fx/bh_waerme.png` v2 und Nebel-Overlay v2: jede 16x16-Zelle
  einzeln von Hand auf dem Palettenraster gezeichnet (ASCII-Pixelkarten und nahtlose
  Muster-Routinen, eine Datei pro Tileset; Zellbeschreibungen kalt/warm in `desc.py`).
  `view.py <modul> <zellen>` zeigt kalt/warm in 6x und einen 3x3-Kacheltest,
  `analyze.py` sucht doppelte Zellen und reine Umfärbungen. Die Skripte erwarten das Repo
  unter `/workspace/Dnd` (Pfade oben in `build2.py` anpassen).
- `export/prompts_specific.json` – die motivspezifischen Prompt-Teile (der Style-Block wird jeweils vorangestellt).
