# Codex-Paket Z2: Musik für Kettlegate (Kapitel 1)

**Paket-Name:** `musik_kettlegate` · **Deine Dateien:** neue Stücke in `public/audio/musik/` (genau die IDs unten), `public/audio/manifest-musik-kettlegate.json`

Du schreibst die Musik für Kapitel 1 als **JSON-Notendaten** im Format „Nebel-Musik v1“. Gleichzeitig baut Paket Z1 den Synth, der sie abspielt (`src/core/MusicSynth.js`, `instrumente.json`, `tools/audio/musik/pruefen.mjs`, drei Beispielstücke `titel`, `kettlegate_tag`, `kampf`). Z3 schreibt Wexmoor, AY Dunscar. Fasse keine Datei an, die nicht unten steht.

## 0. Wichtig: keine Audiodateien

Zwei frühere Versuche sind gescheitert, weil Codex Dutzende OGG/MP3-Dateien nicht ins Repo hochladen konnte. Deshalb gilt für dieses Paket:
- **Lege keine einzige Audiodatei an** (kein .ogg, .mp3, .wav, keine Base64-Blobs).
- Musik wird als **kompakte Textdaten** geliefert (Noten, Instrumente, Tempo in JSON) und **im Spiel per WebAudio synthetisiert**, genau wie die Soundeffekte aus Paket Y selbst synthetisiert sind.
- Jede Datei höchstens 60 KB, insgesamt höchstens 30 Dateien. Wenn das Hochladen trotzdem hakt: in mehreren kleinen Commits liefern (je 3 bis 5 Dateien), nicht alles auf einmal.

## 0.1 Das Spiel und der Klang
„Nebelakten“ ist ein originales 2D-Pixel-Mysteryspiel in Phaser 3 (Repo `Wuerfelduell/Dnd`). Kapitel 1 spielt in der Nebelstadt Kettlegate (Gaslaternen, Ruß, Kanäle, Glocken, okkulte Zirkel), Kapitel 2 in der versinkenden Moorstadt Wexmoor (Torf, Reet, Salz, Bojen, Leuchtturm, Polizeistreifen), Kapitel 3 in der stillgelegten Kalkbergbau-Stadt Dunscar (Nachtzug voller Stimmen). Klang: retro wie ein 16-Bit-Spiel mit warmem Hall, gedämpft, neblig, melancholisch, leicht unheimlich, nie schrill. Okkultes klingt gläsern und schwebend. Keine Melodie darf fremde Musik zitieren.

## 0.2 Das Musikformat „Nebel-Musik v1“ (verbindlich für alle Musik-Pakete)
Ein Stück ist eine JSON-Datei `public/audio/musik/<id>.json`:
```json
{
  "format": "nebel-musik-1",
  "id": "kettlegate_tag",
  "titel": "Kettlegate am Tag",
  "bpm": 96,
  "takt": [4, 4],
  "loop": true,
  "lautstaerke": 0.8,
  "hall": 0.3,
  "spuren": {
    "melodie": { "instrument": "drehorgel", "lautstaerke": 0.7, "pan": -0.2 },
    "bass":    { "instrument": "pizzicato", "lautstaerke": 0.8 },
    "akkorde": { "instrument": "streicher", "lautstaerke": 0.4, "pan": 0.2 },
    "takt":    { "instrument": "holzblock", "lautstaerke": 0.5 }
  },
  "muster": {
    "motiv_a": { "spur": "melodie", "takte": 2, "noten": "d5:4 c5:2 a4:2 f4:4 r:4 | e4:4 f4:2 g4:2 a4:8" },
    "bass_a":  { "spur": "bass", "takte": 2, "noten": "d3:4 a2:4 d3:4 a2:4 | bb2:4 f2:4 a2:4 e2:4" },
    "akk_a":   { "spur": "akkorde", "takte": 2, "noten": "[d4,f4,a4]:16 | [bb3,d4,f4]:8 [a3,c#4,e4]:8" },
    "tick":    { "spur": "takt", "takte": 1, "noten": "x:4 x:4@0.5 x:4 x:4@0.5" }
  },
  "abschnitte": {
    "intro": ["akk_a"],
    "A": ["motiv_a", "bass_a", "akk_a", "tick*2"]
  },
  "ablauf": ["intro", "A", "A", "B", "A"],
  "loop_ab": 1
}
```
**Noten-Schreibweise** im Feld `noten` (Leerzeichen trennen Ereignisse, `|` ist nur eine Taktlinie zur Lesbarkeit und wird geprüft):
- `d5:4` = Ton d in Oktave 5, Dauer 4 Sechzehntel (also eine Viertel). Tonnamen `c d e f g a b`, Vorzeichen `#` und `b` (`c#4`, `bb2`). a4 = 440 Hz.
- `r:4` = Pause. `[d4,f4,a4]:16` = Akkord. `@0.5` am Ende = Anschlagstärke 0 bis 1 (Standard 0.8). `~` am Ende = an die nächste gleiche Note binden.
- Schlagwerk-Spuren benutzen `x` (ein Schlag des Instruments) oder benannte Schläge des Instruments (`kick`, `snare`, `hat`).
- Die Summe der Dauern eines Musters muss genau `takte` x Sechzehntel pro Takt ergeben.
- `"tick*2"` in einem Abschnitt = das Muster zweimal hintereinander. Ein Abschnitt ist so lang wie sein längstes Muster; kürzere Muster werden wiederholt, bis es passt.
- `ablauf` ist die Reihenfolge der Abschnitte. Bei `loop: true` springt das Stück nach dem Ende zurück zum Eintrag `loop_ab` (Index in `ablauf`, 0 = von vorn); davor liegt ein einmaliges Intro.
- Optional pro Abschnitt eine Tonart-Verschiebung: `"A_hoch": { "basis": "A", "transponieren": 2 }`.
- Optionale Felder auf oberster Ebene: `"art": "musik"` (Standard) oder `"art": "klang"` für kurze Signale und Geräusch-Schleifen; `"echo": { "verzoegerung_ms": 380, "rueckkopplung": 0.35, "tiefpass": 1800, "nass": 0.5 }` für Nachhall wie von einer Felswand; `"filter": { "tiefpass": 900 }` für alles gedämpft (z. B. unter Wasser). Pro Spur optional `"filter"` genauso und `"oktave": -1`.

**Instrumente:** Ein Stück benutzt nur Namen aus dieser Liste (die Klänge definiert Paket Z1 in `public/audio/musik/instrumente.json`):
`drehorgel`, `harmonium`, `klavier`, `celesta`, `glocke`, `spieluhr`, `streicher`, `streicher_tief`, `pizzicato`, `kontrabass`, `zither`, `hackbrett`, `akkordeon`, `fidel`, `floete`, `chor_oo`, `chor_ah`, `nebelhorn`, `dampfpfeife`, `saege`, `drone`, `pad_glas`, `pauke`, `rahmentrommel`, `holzblock`, `amboss`, `schlagzeug` (Schläge `kick`, `snare`, `hat`), `wind`, `wasser`, `knistern`.
Braucht ein Paket ein weiteres Instrument, definiert es dieses in einer eigenen Datei `public/audio/musik/instrumente_<paket>.json` im selben Format wie `instrumente.json` (Paket Z1 beschreibt das Format in `docs/audio/musik-format.md`; wenn Z1 noch nicht da ist: Felder `typ` (`osc`, `fm`, `pluck`, `noise`, `formant`), `welle`, `attack`, `decay`, `sustain`, `release`, `filter`, `vibrato`, `detune`).

**Manifest:** Jedes Paket schreibt sein eigenes Manifest `public/audio/manifest-musik-<paket>.json`:
```json
{ "format": "nebel-musik-1", "base": "audio/musik/",
  "tracks": { "kettlegate_tag": { "file": "kettlegate_tag.json", "mood": "stadt", "volume": 0.7 } },
  "zuordnung": { "maps": { "altmarkt": { "tag": "kettlegate_tag", "nacht": "kettlegate_nacht" } }, "zonen": {}, "kampf": {} } }
```
Für `zuordnung.maps` die Karten-IDs aus `src/data/maps/*.json`, `src/data/wexmoor.json` → `maps[].id`/`zones` bzw. die Dunscar-IDs nehmen.

**Leitmotive** (in allen Stücken wiederverwenden, Noten genau so):
- Kettlegate (d-Moll, wie eine Turmuhr): `a4:4 f4:4 g4:4 c4:4 | c4:4 g4:4 a4:4 f4:4`
- Wexmoor (E-dorisch, wiegend, 6/8): `e4:6 g4:2 a4:4 b4:6 a4:2 g4:4 | f#4:6 e4:2 d4:4 e4:12`
- Okkult (Tritonus, gläsern): `c5:8 f#5:8 | b4:16`
- Ermittler (fragend, endet offen): `g4:2 a4:2 c5:4 b4:8`
- Dunscar (Schichtpfiff, letzter Ton fehlt): `e5:3 r:1 e5:3 r:1 c5:8 r:16`; im guten Ende vollständig: `e5:3 r:1 e5:3 r:1 c5:8 g5:16`

**Prüfen:** `tools/audio/musik/pruefen.mjs` (Node, ohne Pakete; legt Paket Z1 an, die anderen Pakete benutzen es oder schreiben bis dahin ein eigenes kleines in ihren Tools-Ordner): JSON gültig, `format` stimmt, jede Note parsebar, jede Musterlänge passt zu `takte`, jedes benutzte Instrument existiert, jedes Muster in `abschnitte` existiert, `loop_ab` gültig. Die Ausgabe kommt in die PR-Beschreibung.

---

## 1. Stücke
Wenn Z1 schon im Repo ist: schau dir dessen drei Beispielstücke an und schreib im gleichen Stil. Längen sind Richtwerte für einen Schleifen-Durchlauf.
| ID | Wofür | Takt, Tempo | Besetzung, Stimmung |
|---|---|---|---|
| `kettlegate_nacht` | Straßen nachts, ca. 120 s | 4/4, 72 | Kettlegate-Motiv langsamer, nur Celesta, Streicher, Wind, viel Hall |
| `revier` | Polizeirevier, Büro, ca. 90 s | 4/4, 84 | Uhrwerk-Rhythmus auf Holzblock, Klavier, Ermittler-Motiv, ruhig |
| `nachtmarkt` | Nachtmarkt, Läden der Zirkel, ca. 90 s | 3/4, 108 | Walzer, Akkordeon, schräg und verführerisch, Okkult-Motiv versteckt im Bass |
| `taverne` | Tavernen, Gasthaus, ca. 90 s | 6/8, 100 | Akkordeon, Fidel, Kontrabass, warm, leicht beschwipst |
| `ermittlung` | Tatorte, Spannung ohne Kampf, ca. 120 s | 4/4, 76 | sparsam, tiefe Pizzicati, Ermittler-Motiv, viele Pausen |
| `geistsicht` | Ebene unter der Wirklichkeit, ca. 60 s | frei, 60 | nur `pad_glas`, `chor_oo`, Okkult-Motiv, sehr leise, kein Schlagwerk |
| `ritual` | Rituale, Trank-Aufstieg, ca. 60 s | 4/4, 66 | Drone, Glocke, Rahmentrommel langsam, steigt über `transponieren` an |
| `treffen` | geheime Treffen, Auktionen, ca. 90 s | 4/4, 90 | Kammermusik: Streicher, Celesta, Pizzicato, verschwörerisch |
| `kampf_okkult` | Kämpfe gegen Übernatürliches, ca. 90 s | 4/4, 140 | treibend wie ein Kampf, mit `chor_ah`, Glocke, Okkult-Motiv |
| `boss` | Bosskämpfe Kapitel 1, ca. 120 s | 4/4, 120 | groß, langsamer Aufbau, Harmonium wie Orgel, Pauke, Kettlegate-Motiv verzerrt |
| `sieg` | nach gewonnenem Kampf, ca. 6 s, `loop: false` | 4/4, 120 | kurzer warmer Abschluss, Ermittler-Motiv aufgelöst |
| `fall_geloest` | Fall abgeschlossen, ca. 30 s, `loop: false` | 4/4, 80 | Ermittler-Motiv, das endlich auf dem Grundton landet, Glocke am Schluss |
| `ende_dunkel` | dunkle Enden, ca. 40 s, `loop: false` | 4/4, 60 | langsam, Moll, Glocke, Streicher tief |
Jedes Schleifen-Stück: einmaliges Intro, mindestens 3 verschiedene Abschnitte, Melodie mit Antwort (nicht nur das Motiv im Kreis).

## 2. Manifest `public/audio/manifest-musik-kettlegate.json`
Format aus 0.2, mit allen 13 Stücken. In `zuordnung.maps` ordne **jeder** Karte aus `src/data/maps/*.json` ein Stück zu (Datei-Name ohne `.json` = Karten-ID; lies kurz jede Karte, um zu sehen, was sie ist). Straßen bekommen `{ "tag": "kettlegate_tag", "nacht": "kettlegate_nacht" }` (das Stück `kettlegate_tag` liefert Z1), Innenräume das passende Stück. `zuordnung.kampf`: `"okkult": "kampf_okkult"`, `"boss_kapitel1": "boss"`. Dazu `"ereignisse": { "sieg": "sieg", "fall_geloest": "fall_geloest", "ende_dunkel": "ende_dunkel", "geistsicht": "geistsicht", "ritual": "ritual", "treffen": "treffen" }`.

## 3. Abgabe
Prüfe mit `node tools/audio/musik/pruefen.mjs` (wenn Z1 noch fehlt: ein eigenes kleines Prüfskript `tools/audio/musik/pruefen_kettlegate.mjs` mit den Prüfungen aus 0.2). Pull Request nur mit deinen Dateien, in die Beschreibung die Prüf-Ausgabe und pro Stück Takt, Tempo, Länge.
