# Nebelakten – Paket Y / Geräuscharchiv

105 Basis-IDs ergeben 132 Klangvarianten, jeweils als OGG und MP3 (264 Dateien). Alle Klänge entstehen aus eigenen Oszillatoren, gefiltertem Rauschen, Hüllkurven und synthetischem Raumhall. Keine Samples, Soundfonts, Sprachaufnahmen, Netzdownloads oder fremden Melodien werden verwendet. Die Liste in `docs/art/codex_Y_soundeffekte.md` ist vollständig abgedeckt.

## Neu erzeugen

Voraussetzungen: Python 3, NumPy, SciPy sowie `ffmpeg` und `ffprobe` im PATH. FFmpeg benötigt die Encoder `libvorbis` und `libmp3lame`.

```sh
python -m pip install -r tools/audio/sfx/requirements.txt
python tools/audio/sfx/generate.py
python tools/audio/sfx/validate.py
node --test tools/audio/sfx/audio.test.mjs
```

Ohne Argumente rendert `generate.py` das ganze Paket. Einzelne Basis-IDs sind ebenfalls möglich; bei Varianten werden alle zugehörigen Varianten neu erzeugt:

```sh
python tools/audio/sfx/generate.py schritt_holz ausholen atmo_moor
```

Die Pfade werden vom Skriptstandort aus aufgelöst. Das Skript schreibt ausschließlich die SFX-Dateien und `public/audio/manifest-sfx.json`. Das Manifest wird auch beim Einzelrendern vollständig aktualisiert; es setzt voraus, dass die übrigen ausgelieferten Dateien vorhanden sind. Keine globalen Zufallszustände: ID und Variantennummer bestimmen einen SHA-256-basierten Seed. Dieselben Parameter ergeben dieselben PCM-Samples. OGG-Container-Seriennummern und Encoder-Versionen können die komprimierten Dateibytes ändern.

## Einen Klang ändern

Jede Basis-ID hat im oberen Teil von `tools/audio/sfx/generate.py` einen eigenen `add(...)`-Eintrag. Die acht Schrittmaterialien stehen einzeln in einer Tabelle. Parameter:

- `duration`: Gesamtdauer einschließlich Hall; `variants`: Zahl der Dateien.
- `layers`: überlagerte `e(kind, start, length, freq, amp, end, reverse)`-Ereignisse; Zeit in Sekunden, Frequenz in Hz.
- `room`: Anteil des warm gefilterten Mehrfach-Echos.
- `volume`: Mischvorschlag im Manifest; verändert die Datei nicht.
- `loop`: periodische Synthese, zyklisch eingefaltete Ereignisse und Hallschwänze.

`wood`, `metal`, `bell`, `glass`, `gong`, `pluck` und `drop` verwenden unterschiedlich gestimmte, abklingende Teiltöne. `thud`/`heart` nutzen tiefe Tonhöhenabfälle. Papier, Stoff, Kies und Flammen besitzen eigene Rauschhüllkurven; Vögel, Frösche und Pfeifen sind modulierte Oszillatoren. Wortloses Flüstern und Tavernenmurmel bestehen ausschließlich aus gefiltertem Rauschen. Die Atmosphären kombinieren diese Bausteine mit unterschiedlich rhythmisierten Ereignissen.

Der Warnklang `ausholen` verwendet ein kurzes hohes Doppelglas-Signal mit wenig Hall und höherem Mischpegel. Er bleibt dadurch gegenüber den dumpfen Treffern und den weicheren Heilungsglocken deutlich erkennbar. UI-Hover und Dialogticks sind absichtlich leiser als die übrige UI.

## Ausgabe und Pegel

Mono, 44.100 Hz, OGG Vorbis Qualität 3, MP3 96 kbit/s mit Xing/LAME-Metadaten zur Entfernung des Encoder-Paddings. Einzelklänge haben 3–4 ms Randblenden. Schleifen haben keine eingefügte Stille: periodisches Rauschen, passende Oszillatorperioden, über den Rand gewickelte Ereignisse und Hall; ein kurzer Randabgleich beseitigt Restdifferenzen.

Die Synthese gleicht den RMS-Pegel pro Gruppe an und begrenzt Spitzen vor dem Encoding auf 0,70 (−3,10 dBFS). Das lässt Reserve für verlustbehaftete Codecs; der Validator überprüft nochmals beide **decodierten** Formate gegen −1 dBFS. Atmosphären und Okkultes haben niedrigere Grundpegel. Die tatsächliche Mischung erfolgt zusätzlich mit den Manifestwerten.

`validate.py` vergleicht IDs und Varianten mit dem unabhängigen Aufgabenblatt, prüft die Dateimenge, Codec, Kanäle, Samplerate, MP3-Bitrate, Dauer, Nicht-Stille, DC-Versatz, Spitzen und Randdifferenzen. Er erkennt identische decodierte Dateien und schreibt Messwerte, Bytegrößen und SHA-256-Prüfsummen nach `tools/audio/sfx/validation.json`. Kurze Vorbis-Einzelklänge können im FFmpeg-Rawdecoder bis zu einen zusätzlichen Codecblock zeigen; ihre Containerdauer wird separat geprüft. Für Schleifen gilt eine strengere Dauertoleranz von 1 ms.

## Anhören

Vom Repository-Hauptordner:

```sh
python -m http.server 8000
```

Dann `http://localhost:8000/tools/audio/sfx/vorschau.html` öffnen. Die Seite zeigt alle Gruppen, jede Variante und einen Formatumschalter. „Übergang testen“ startet eine Schleife 750 ms vor dem Ende; „Alles stoppen“ beendet die Wiedergabe. Der Regler multipliziert den Mischvorschlag. Versteckt man das Fenster, stoppt die Vorschau. Sie verwendet Web Audio zum Decodieren und Schleifen, nicht das mitunter lückenhafte HTML-Audio-Looping.

Die Vorschau braucht HTTP statt `file://`. Sie ist ein Entwicklungswerkzeug und wird nicht in den Spiel-Build eingebunden.

## Audio-Grundgerüst für spätere Integration

`src/core/Audio.js` wird bewusst noch nirgends importiert. Die folgenden Aufrufe sind Integrationsbeispiele, keine bereits eingebauten Spieländerungen:

```js
// Eine Instanz am Phaser-Spiel behalten und beim Szenenwechsel wiederverwenden.
const audio = new Audio();
// In preload() von WorldScene oder CombatScene:
audio.preload(this);
// Nach dem Laden:
audio.play('ui_klick');
audio.play('schritt_holz', { volume: 0.8 });
audio.loop('atmo_moor');
audio.stopLoop('atmo_moor', 500);
audio.music('wexmoor_nacht', 1200);
audio.music(null, 500); // Musik ausblenden
audio.setVolumes({ master: 0.8, musik: 0.6, effekte: 0.7 });
```

- Phaser lädt die JSON-Manifeste innerhalb seines Preload-Zyklus und reiht anschließend Audio ein. `manifest-musik.json` ist optional; ein fehlendes Musikmanifest wird in `diagnostics` vermerkt und kann im Browser eine harmlose 404 erzeugen. SFX laden trotzdem.
- Lade-IDs sind `sfx:<id>` beziehungsweise `musik:<id>`, damit beispielsweise beide `sieg`-Dateien existieren können. Die öffentliche API verwendet die ursprünglichen IDs.
- Varianten werden zufällig gewählt. Einzelne Effekte erhalten eine Abspielrate zwischen 0,97 und 1,03; Musik und Schleifen behalten Rate 1.
- Alle Lautstärken werden auf 0–1 begrenzt und unter `nebelakten_audio` gespeichert. Speicherzugriffe sind abgesichert. Änderungen wirken auch während Überblendungen auf bereits laufende Klänge.
- Vor dem ersten Nutzerereignis werden keine Klänge gestartet. Veraltete Einzelklänge werden verworfen; die letzte Musikwahl und gewünschte Schleifen können nach Freigabe starten. Phaser-Audiosperre und fehlgeschlagene `AudioContext.resume()`-Aufrufe werden berücksichtigt.
- Bei verborgenem Fenster werden nur die von dieser Klasse verwalteten Klänge stummgeschaltet. Es wird nicht der globale Phaser-Mixer überschrieben. Neue Einzelklänge werden dann verworfen.
- Gleiche Musik oder derselbe Loop wird nicht neu gestartet. Überblendungen laufen am Game-Step und überleben Szenenwechsel. Alte ausblendende Loops können einen neu gestarteten Loop derselben ID nicht löschen.
- Musik mit `loopStart`/`loopEnd` nutzt Phaser-Marker. Ein optionales Intro wechselt über `complete` zum Loop-Marker; dieser einmalige Introübergang ist framegenau, nicht samplegenau. Innerhalb des Markers übernimmt Phaser das Web-Audio-Looping. HTML5-Audio-Fallbacks können systembedingt weniger präzise schleifen.
- `destroy()` entfernt Klänge und alle Listener. Beim Zerstören des Phaser-Spiels wird es automatisch aufgerufen. Beim bloßen Szenenwechsel nicht zerstören, wenn die Musik weiterlaufen soll.

## Prüfung dieses Pakets

Die gezielten Node-Tests decken Preload, optional fehlende Musik, Varianten, getrennte Namen, Nutzerfreigabe, Lautstärken, Speicherfehler, Hintergrund-Stummschaltung, Überblendungen, schnelle Wechsel, Loop-Neustarts und Aufräumen ab. Sie verwenden Phaser-Testdoubles. Zusätzlich wurden die bestehenden 266 Projekttests und der Produktionsbuild ausgeführt.

Ein echter Browser-Smoke-Test konnte in der Arbeitsumgebung nicht gestartet werden (Chromium-Prozessstart durch die Umgebung blockiert). Eine abschließende Hörprobe auf den Zielgeräten und die spätere Integration in WorldScene/CombatScene bleiben deshalb sinnvoll. Die Datei- und Codecprüfungen ersetzen keine subjektive Hörabnahme.

Messwerte der ausgelieferten Dateien: **4.259.764 Byte** (4,26 MB), maximaler decodierter Spitzenpegel **−2,64 dBFS**, größte Sample-Randdifferenz einer decodierten Schleife **0,012583**. Alle 264 Dateien bestehen die Prüfung.
