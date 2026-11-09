# Codex-Paket Z3: Musik für Wexmoor (Kapitel 2) und Abspann

**Paket-Name:** `musik_wexmoor` · **Deine Dateien:** neue Stücke in `public/audio/musik/` (genau die IDs unten), `public/audio/manifest-musik-wexmoor.json`

Du schreibst die Musik für Kapitel 2 als **JSON-Notendaten** im Format „Nebel-Musik v1“. Gleichzeitig baut Paket Z1 den Synth, der sie abspielt (`src/core/MusicSynth.js`, `instrumente.json`, `tools/audio/musik/pruefen.mjs`, Beispielstücke `titel`, `kettlegate_tag`, `kampf`). Z2 schreibt Kettlegate, AY Dunscar. Fasse keine Datei an, die nicht unten steht.

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
Wexmoor ist eine versinkende Moorstadt: Torf, Reet, Salz, Bojen, Leuchtturm, Polizeistreifen („Grauspäher“) mit Sturmlaternen, man versteckt sich auf Zunders Torfkahn. Lies für die Stimmung kurz `src/data/wexmoor.json` (Karten, Zonen) und die Ordner `docs/story/k2_*` (Kapitel 2).
| ID | Wofür | Takt, Tempo | Besetzung, Stimmung |
|---|---|---|---|
| `wexmoor_tag` | Straßen Wexmoor, ca. 120 s | 6/8, 92 | Wexmoor-Motiv, Zither, Akkordeon, Nebelhorn fern, Wasser leise |
| `wexmoor_nacht` | Wexmoor nachts, ca. 120 s | 6/8, 72 | Wexmoor-Motiv nur auf Zither, Wasser, sehr ruhig |
| `wexmoor_streife` | Grauspäher in der Nähe (Schleichen), ca. 60 s | 4/4, 96 | leises Ostinato, gedämpfte Pauke, Spannung, dünn genug, um über `wexmoor_*` zu liegen |
| `wexmoor_flucht` | entdeckt, Flucht, ca. 45 s | 6/8, 150 | Rahmentrommel, Flöte, Wexmoor-Motiv gehetzt |
| `unterschlupf` | Zunders Torfkahn, ca. 90 s | 6/8, 66 | warm, Akkordeon leise, Knistern (Ofen), Wexmoor-Motiv als Wiegenlied |
| `moor` | Vergessmoor, Salzwatt, ca. 120 s | frei, 60 | Drone, Wasser als Rhythmus, Okkult-Motiv, unheimlich |
| `altstadt` | Versunkene Altstadt, ca. 120 s | 4/4, 56 | `filter.tiefpass` ca. 900 (unter Wasser), Glocke aus der Tiefe, alter Choral auf `chor_oo` |
| `leuchtturm` | Akt V, Leuchtturm-Insel, ca. 120 s | 6/8, 84 | Nebelhorn, Streicher, Wexmoor- und Okkult-Motiv kämpfen gegeneinander |
| `boss_wexmoor` | Bosskämpfe Kapitel 2, ca. 120 s | 6/8, 132 | groß, Pauke, Nebelhorn, Wexmoor-Motiv in Moll |
| `abspann` | Ende Kapitel 2, ca. 150 s, `loop: false` | wechselt | erst Kettlegate-Motiv, dann Wexmoor-Motiv, am Schluss beide übereinander, Glocke |
Jedes Schleifen-Stück: einmaliges Intro, mindestens 3 verschiedene Abschnitte, Melodie mit Antwort. Im 6/8-Takt hat ein Takt 12 Sechzehntel; das Wexmoor-Motiv ist genau 2 Takte lang.

## 2. Manifest `public/audio/manifest-musik-wexmoor.json`
Format aus 0.2, mit allen 10 Stücken. `zuordnung.maps`: **jede** Karte aus `src/data/wexmoor.json` → `maps[].id` bekommt ein Stück (Straßen `{ "tag": "wexmoor_tag", "nacht": "wexmoor_nacht" }`, `wx_kahn` → `unterschlupf`, Innenräume passend). `zuordnung.zonen`: jede Zone aus `wexmoor.json` → `zones` (Gefahrengebiete → `moor`, Altstadt → `altstadt`, Leuchtturm → `leuchtturm`). `zuordnung.kampf`: `"boss_kapitel2": "boss_wexmoor"`. Dazu `"ereignisse": { "streife": "wexmoor_streife", "flucht": "wexmoor_flucht", "abspann_k2": "abspann" }`.

## 3. Abgabe
Prüfe mit `node tools/audio/musik/pruefen.mjs` (wenn Z1 noch fehlt: ein eigenes kleines Prüfskript `tools/audio/musik/pruefen_wexmoor.mjs` mit den Prüfungen aus 0.2). Pull Request nur mit deinen Dateien, in die Beschreibung die Prüf-Ausgabe und pro Stück Takt, Tempo, Länge.
