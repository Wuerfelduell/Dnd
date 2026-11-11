# briarholt1 (Codex-Paket CI)

- `check.py` – Prüfskript (Pillow): `python tools/art/briarholt1/check.py [--write]`.
- `export/` – die lokale Nachbearbeitungs-Pipeline, mit der die PNGs entstanden sind
  (Palette-Majority-Downscale, Magenta-Key, binäres Alpha, Outline, abgeleitete Frames,
  prozedurale Effekte/Overlays). Die rohen Generatorbilder liegen nicht im Repo; ihre
  SHA-256 stehen in `docs/art/batch-briarholt1-generation.json`. `fx.py` und der
  Nebel/Leitungsplan-Teil von `images.py` sind vollständig prozedural.
- `export/prompts_specific.json` – die motivspezifischen Prompt-Teile (der Style-Block wird jeweils vorangestellt).
