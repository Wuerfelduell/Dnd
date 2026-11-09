# Codex-Paket Z: Musik

**Paket-Name:** `musik` · **Deine Ordner:** `public/audio/musik/`, `tools/audio/musik/`, `docs/audio/README-musik.md`, Manifest `public/audio/manifest-musik.json`

Das Spiel bekommt Musik: Titel, Stadtthemen für Kettlegate und Wexmoor, Ermittlung, Kampf, Bosse, Enden. Alles wird **im Skript komponiert und synthetisiert**. Die Soundeffekte macht ein anderes Paket (Y) gleichzeitig, fasse `public/audio/sfx/` und `src/` nicht an.

## 0. Gemeinsame Regeln für Audio-Pakete (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. Das Spiel „Nebelakten“ ist ein originales 2D-Pixel-Mysteryspiel in Phaser 3 (Repo `Wuerfelduell/Dnd`, Auflösung 480x270, läuft im Browser und auf dem Handy). Es hat **bisher gar keinen Ton**. Kapitel 1 spielt in der Nebelstadt Kettlegate (Gaslaternen, Ruß, Kanäle, Glocken, Revier der Polizei, okkulte Zirkel), Kapitel 2 in der versinkenden Moorstadt Wexmoor (Torf, Reet, Salz, Schlick, Bojen, Leuchtturm, Polizei-Streifen „Grauspäher“ mit Sturmlaternen).

### 0.1 Klang-Stil
- Retro, aber nicht piepsig: wie ein 16-Bit-Spiel mit warmem Hall. Gedämpft, neblig, melancholisch, leicht unheimlich. Nie schrill, nie laut.
- Okkultes (Geistsicht, Rituale, Artefakte) klingt gläsern und schwebend (Glas, Glocken, rückwärts gespielte Töne, leises Flüstern ohne verständliche Wörter).
- Keine echten Wörter, keine Stimmen mit Sprache, keine erkennbaren Melodien aus fremden Werken.

### 0.2 Herkunft (wichtig)
- **Alles selbst erzeugen**: per Synthese im Skript (Oszillatoren, Rauschen, Hüllkurven, Filter, Hall). Keine heruntergeladenen Samples, keine Soundfonts, keine Loops aus dem Netz. So gibt es keine Lizenzfragen.
- Das Generator-Skript bleibt im Repo, damit man Sounds später neu erzeugen und anpassen kann (Ordner steht unten). Jeder Sound ist dort ein eigener Eintrag mit Parametern, damit man ihn einzeln ändern kann.
- Empfohlen: Python 3 mit `numpy` und `soundfile` (`pip install numpy soundfile`; `soundfile` schreibt OGG Vorbis und MP3 direkt). Wenn `ffmpeg` da ist, darfst du auch das nehmen.

### 0.3 Dateien
- Jeder Sound als **`.ogg` und `.mp3`** mit gleichem Namen (Phaser lädt `[ogg, mp3]`, Safari braucht MP3).
- Lautheit angleichen: Spitzenpegel höchstens -1 dBFS, gefühlt alle gleich laut innerhalb ihrer Gruppe. Kein Knacken am Anfang und Ende (2 bis 5 ms Ein- und Ausblenden).
- Schleifen (`loop: true`) müssen nahtlos sein: Ende und Anfang passen ohne Klick zusammen.
- Dateinamen = IDs, klein, mit Unterstrich, genau wie in der Liste.

### 0.4 Ablage und Abgrenzung
- **Keinen Spielcode ändern** (Ausnahme: die eine Gerüst-Datei, falls die Datei sie ausdrücklich nennt). Das Einbauen passiert separat.
- Ein zweites Audio-Paket läuft gleichzeitig. Fasse nur deine eigenen Ordner und Dateien an (stehen unten).
- Am Ende ein Pull Request nur mit deinen Dateien. In die PR-Beschreibung: Liste aller Sounds mit Länge und Dateigröße, Gesamtgröße.

### 0.5 Format und Machart für dieses Paket
- Stereo, 44,1 kHz, OGG Qualität 4, MP3 128 kbit/s. Gesamtgröße aller Stücke (ogg + mp3) möglichst unter 25 MB.
- Komponiere die Stücke als **Notendaten im Code** (z. B. eine Python-Datei pro Stück mit Tonart, Tempo, Spuren aus Noten-Listen) und rendere sie mit eigenen Synth-Instrumenten. Baue dir dafür eine kleine Instrumenten-Bibliothek in `tools/audio/musik/instrumente.py`, zum Beispiel:
  - **Drehorgel/Harmonium** (Rechteck + Pulsbreite, langsames Vibrato) für Kettlegate
  - **Glocken/Celesta** (FM-Synthese) für Okkultes und Uhrturm
  - **Streicher-Pad** (gestimmte Sägezähne, Tiefpass, langsamer Attack)
  - **Gezupfter Bass / Kontrabass pizzicato** (Karplus-Strong)
  - **Zither/Hackbrett** (Karplus-Strong, hell) für Wexmoor
  - **Akkordeon** (zwei leicht verstimmte Rechtecke) für Hafen und Taverne
  - **Pauke, Rahmentrommel, Holzblock** (Rauschen + Sinus-Pitch-Drop)
  - **Chor ohne Worte** (Formant-Filter auf Sägezahn, Vokal „oo“ und „ah“)
  - **Nebelhorn / tiefer Drone** für den Leuchtturm
- Etwas Hall (einfacher Schroeder- oder Faltungshall mit selbst erzeugter Impulsantwort) macht den Klang weich. Leichtes Band-Rauschen (sehr leise) ist erlaubt, damit es nicht steril klingt.
- **Schleifen**: Jedes Stück mit `loop: true` muss nahtlos laufen. Gib im Manifest `loopStart` und `loopEnd` in Sekunden an (Intro darf vor `loopStart` liegen). Den Hallschwanz am Loop-Ende in den Anfang falten, damit kein Loch entsteht.
- Melodien: einprägsam, aber ruhig. Jede Stadt hat ein eigenes **Leitmotiv** (4 bis 8 Töne), das in ihren Stücken wieder auftaucht. Kein Stück zitiert fremde Musik.
- Lautheit: alle Stücke etwa gleich laut (ca. -16 LUFS), Kampf etwas lauter (ca. -14 LUFS).

---

## 1. Leitmotive (zuerst festlegen, in `tools/audio/musik/motive.py`)
- **Kettlegate-Motiv:** in d-Moll, absteigend, wie eine Turmuhr, die eine Melodie spielt. Drehorgel, Glocken.
- **Wexmoor-Motiv:** dorisch auf E, wiegend im 6/8-Takt, wie ein altes Fischerlied. Zither, Akkordeon, Nebelhorn.
- **Okkult-Motiv:** drei Töne mit Tritonus, gläsern. Taucht in Geistsicht, Ritualen und bei Bossen auf.
- **Ermittler-Motiv:** vier Töne, fragend, endet offen. Für Notizbuch, Schlussfolgerung, Fallakte.
Schreib die Motive in `docs/audio/README-musik.md` als Notennamen auf, damit spätere Stücke sie wieder benutzen können.

## 2. Stücke
| ID | Wofür | Länge | Stimmung, Besetzung |
|---|---|---|---|
| `titel` | Titelbildschirm | 90 s Schleife | Kettlegate-Motiv langsam, Glocken, Streicher-Pad, Regen-Gefühl. Erinnert schon leise an das Okkult-Motiv |
| `kettlegate_tag` | Straßen Kettlegate am Tag | 120 s | Drehorgel, gezupfter Bass, leichtes Schunkeln, aber grau |
| `kettlegate_nacht` | Straßen Kettlegate nachts | 120 s | gleiches Motiv, langsamer, nur Celesta und Pad, viel Raum |
| `revier` | Polizeirevier, Büro | 90 s | ruhig, Uhrwerk-Rhythmus (Holzblock), Klavier-artiger Synth, Ermittler-Motiv |
| `nachtmarkt` | Nachtmarkt, Läden der Zirkel | 90 s | Akkordeon, schräg, verführerisch, Walzer 3/4 |
| `taverne` | Tavernen, Gasthaus „Glocke“ | 90 s | Akkordeon, Fidel-artiger Synth, warm, leicht beschwipst |
| `ermittlung` | Tatorte, Untersuchen, Spannung ohne Kampf | 120 s | sparsam, tiefe Pizzicati, Ermittler-Motiv, Pausen |
| `geistsicht` | Ebene unter der Wirklichkeit | 60 s | nur Pad, Chor ohne Worte, Okkult-Motiv, sehr leise, ohne Schlagwerk |
| `ritual` | Rituale, Trank-Aufstieg | 60 s | Drone, Glocken, Rahmentrommel langsam, steigt an |
| `treffen` | geheime Treffen, Auktionen | 90 s | Kammermusik-artig, Streicher-Pad + Celesta, verschwörerisch |
| `kampf` | normale Kämpfe | 90 s | treibend, 140 BPM, Pauke + Pizzicato-Ostinato + Drehorgel-Melodie |
| `kampf_okkult` | Kämpfe gegen Übernatürliches | 90 s | wie `kampf`, aber mit Chor und Glocken, Okkult-Motiv |
| `boss` | Bosskämpfe Kapitel 1 | 120 s | groß, langsamer Aufbau, Orgel-artig, Kettlegate-Motiv in Moll verzerrt |
| `wexmoor_tag` | Straßen Wexmoor | 120 s | Wexmoor-Motiv, Zither, Akkordeon, Nebelhorn fern |
| `wexmoor_nacht` | Wexmoor nachts | 120 s | Wexmoor-Motiv nur auf Zither, Wasser-Gefühl, sehr ruhig |
| `wexmoor_streife` | wenn Grauspäher in der Nähe sind (Schleichen) | 60 s | leises Ostinato, gedämpfte Pauke, Spannung, gut mischbar über `wexmoor_*` |
| `wexmoor_flucht` | entdeckt, Flucht vor der Polizei | 45 s | schnell, Rahmentrommel, Pfeifen-artiger Synth, Wexmoor-Motiv gehetzt |
| `unterschlupf` | Zunders Torfkahn | 90 s | warm, Ofen-Gefühl, Akkordeon leise, Wexmoor-Motiv als Wiegenlied |
| `moor` | Gefahrengebiete Vergessmoor, Salzwatt | 120 s | Drone, Glucksen als Rhythmus, Okkult-Motiv, unheimlich |
| `altstadt` | Versunkene Altstadt | 120 s | unter Wasser gedämpft (Tiefpass), Glocken aus der Tiefe, alter Choral |
| `leuchtturm` | Akt V, Leuchtturm-Insel | 120 s | Nebelhorn, Streicher, Wexmoor- und Okkult-Motiv kämpfen gegeneinander |
| `boss_wexmoor` | Bosskämpfe Kapitel 2 | 120 s | wie `boss`, aber mit Wexmoor-Motiv und Nebelhorn |
| `sieg` | nach gewonnenem Kampf | 6 s, keine Schleife | kurzer Abschluss, warm |
| `fall_geloest` | Fall abgeschlossen, Ende-Bildschirm | 30 s, keine Schleife | Ermittler-Motiv, das endlich aufgelöst wird |
| `ende_dunkel` | dunkle Enden | 40 s, keine Schleife | langsam, Moll, Glocke |
| `abspann` | Ende Kapitel 2 | 150 s, keine Schleife | beide Stadtmotive nacheinander und am Schluss zusammen |

## 3. Manifest `public/audio/manifest-musik.json`
```json
{
  "batch": "musik",
  "base": "audio/musik/",
  "formats": ["ogg", "mp3"],
  "tracks": {
    "titel": { "loop": true, "loopStart": 4.0, "loopEnd": 94.0, "bpm": 72, "volume": 0.7, "mood": "titel" },
    "sieg": { "loop": false, "volume": 0.8 }
  },
  "zuordnung": {
    "maps": { "revier": "revier", "nachtmarkt": "nachtmarkt", "wx_kahn": "unterschlupf" },
    "zonen": { "wx_vergessmoor": "moor" },
    "kampf": { "standard": "kampf", "boss_kapitel1": "boss", "boss_kapitel2": "boss_wexmoor" }
  }
}
```
Für `zuordnung.maps` lies die Karten-IDs aus `src/data/maps/*.json` (Kapitel 1) und `src/data/wexmoor.json` → `maps[].id` und `zones` (Kapitel 2) und ordne **jeder** Karte ein Stück zu (Vorschlag, wird beim Einbauen übernommen). Nacht-Varianten über `"<map>": {"tag": "...", "nacht": "..."}`.

## 4. Zusätzlich
- `tools/audio/musik/render.py`: rendert alle Stücke neu, oder eins mit `render.py <id>`.
- `tools/audio/musik/stuecke/<id>.py`: Notendaten pro Stück.
- `tools/audio/musik/vorschau.html`: alle Stücke zum Anhören, mit Anzeige von `loopStart`/`loopEnd` und einem Knopf „Schleife testen“ (springt 5 s vor `loopEnd`).
- `docs/audio/README-musik.md`: Motive, Instrumente, wie man ein Stück ändert und neu rendert.
