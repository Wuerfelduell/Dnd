# Codex-Paket Z1: Musik-Synth (Grundgerüst) und Instrumente

**Paket-Name:** `musik_synth` · **Deine Dateien:** `src/core/MusicSynth.js` (neu), `public/audio/musik/instrumente.json`, `public/audio/musik/titel.json`, `public/audio/musik/kettlegate_tag.json`, `public/audio/musik/kampf.json`, `public/audio/manifest-musik-basis.json`, `tools/audio/musik/pruefen.mjs`, `tools/audio/musik/vorschau.html`, `docs/audio/musik-format.md`

Das Spiel bekommt Musik, aber **ohne Audiodateien**: Stücke sind kleine JSON-Notendaten, die der Browser mit WebAudio selbst spielt. Dieses Paket baut das Grundgerüst dafür (Synth, Instrumente, Prüfer, Vorschau) und drei Beispielstücke. Die eigentlichen Stücke schreiben gleichzeitig die Pakete Z2 (Kettlegate), Z3 (Wexmoor) und AY (Dunscar) im selben Format. Fasse deren Dateien nicht an.

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

## 1. `src/core/MusicSynth.js` (Grundgerüst, eigenständig)
Eine ES-Modul-Klasse ohne Abhängigkeiten (kein Phaser, keine npm-Pakete). **Nicht** in `src/main.js` oder andere Spieldateien einbauen; das Einbauen in `src/core/Audio.js` passiert später separat. Schreib oben in die Datei einen kurzen Kommentar, wie man sie später an `Audio.js` anschließt (die Klasse dort hat `levels.master`/`levels.musik` und die Methode `music(id)`; `main.js` erzeugt sie zurzeit mit `kinds: ['sfx']`).

Schnittstelle (mindestens):
```js
const synth = new MusicSynth({ context, destination, instrumente });  // context optional: eigener AudioContext
await synth.ladeManifest(url)          // liest manifest-musik-*.json, merkt sich tracks + zuordnung
await synth.lade(id | objekt)          // Stück-JSON laden und parsen (Ergebnis gecacht)
synth.spiele(id, { blende: 1.5 })      // startet, Überblendung vom laufenden Stück in Sekunden
synth.stopp({ blende: 1.0 })
synth.lautstaerke = 0.65               // Musik-Bus 0..1
synth.pause() / synth.weiter()         // z. B. bei visibilitychange
await synth.renderOffline(id, sekunden) // OfflineAudioContext -> AudioBuffer (für Vorschau/Tests)
synth.zerstoere()
```
Innen:
- **Parser** für die Noten-Schreibweise (Abschnitt 0.2), mit klaren Fehlermeldungen (Stück, Muster, Position). Teile ihn als eigene exportierte Funktion `parseNoten(text, sechzehntelProTakt)`, damit `pruefen.mjs` ihn wiederverwendet.
- **Lookahead-Scheduler** (setInterval ~25 ms, plant ~120 ms voraus, Zeiten über `context.currentTime`), damit es auf dem Handy nicht stottert. `ablauf` abspielen, bei `loop` zu `loop_ab` springen, Abschnittslänge = längstes Muster, kürzere wiederholen, `*n` auswerten, `transponieren` beachten.
- **Instrumente** aus `instrumente.json` (+ alle `instrumente_*.json`, die ein Manifest mitbringt): Typen `osc` (Welle, Pulsbreite, Detune mehrerer Stimmen), `fm` (Träger/Modulator-Verhältnis, Index, für Glocken/Celesta), `pluck` (Karplus-Strong per kurzem Rausch-Burst + Feedback-Delay, oder vorgerenderter Puffer), `noise` (weiß/rosa, Bandpass, für Schlagwerk, Wind, Wasser, Knistern), `formant` (Sägezahn durch 2 bis 3 Bandpässe, Vokale „oo“/„ah“). Jede Note bekommt eine ADSR-Hülle, optional Vibrato und Filter. Schlagwerk-Instrumente haben benannte Schläge (`kick`, `snare`, `hat`, `x`).
- **Hall:** ein gemeinsamer ConvolverNode mit selbst erzeugter Impulsantwort (abklingendes Rauschen), Anteil pro Stück über `hall`. Optional `echo` und `filter` laut 0.2.
- Stimmen begrenzen (z. B. höchstens 24 gleichzeitig), alte Knoten nach dem Ausklingen trennen.
- Auf dem Handy erst nach einer Geste starten (`context.resume()` beim ersten Tippen).

## 2. `public/audio/musik/instrumente.json`
Alle 30 Instrumente aus Abschnitt 0.2 mit Parametern. Format (und genau so in `docs/audio/musik-format.md` beschreiben):
```json
{ "format": "nebel-instrumente-1",
  "instrumente": {
    "drehorgel": { "typ": "osc", "welle": "square", "pulsbreite": 0.3, "stimmen": 2, "detune": 6,
                   "attack": 0.02, "decay": 0.1, "sustain": 0.8, "release": 0.15,
                   "filter": { "tiefpass": 2400 }, "vibrato": { "rate": 5.5, "tiefe": 8 } },
    "schlagzeug": { "typ": "noise", "schlaege": { "kick": { ... }, "snare": { ... }, "hat": { ... } } }
  } }
```
Klang-Ideen: Drehorgel/Harmonium = Rechteck mit Pulsbreite und langsamem Vibrato; Glocke/Celesta/Spieluhr = FM; Streicher = mehrere verstimmte Sägezähne, Tiefpass, langsamer Attack; Pizzicato/Kontrabass/Zither/Hackbrett = Pluck; Akkordeon = zwei verstimmte Rechtecke; Chor = Formant; Nebelhorn/Drone = tiefe Säge + Tiefpass; Säge = Sinus mit starkem Vibrato; Pauke/Rahmentrommel/Holzblock/Amboss = Rauschen + Sinus mit Tonhöhen-Abfall; Wind/Wasser/Knistern = gefiltertes Rauschen mit langsamer Modulation.

## 3. Drei Beispielstücke (zeigen den anderen Paketen, wie es geht)
| ID | Wofür | Takt, Tempo | Besetzung, Stimmung |
|---|---|---|---|
| `titel` | Titelbildschirm, Schleife ca. 90 s | 4/4, 72 BPM | Kettlegate-Motiv langsam, Glocke, Streicher, Wind. Am Ende des Durchlaufs leise das Okkult-Motiv auf `pad_glas` |
| `kettlegate_tag` | Straßen Kettlegate am Tag, ca. 120 s | 4/4, 96 BPM | Drehorgel spielt das Kettlegate-Motiv und eine Antwort darauf, Pizzicato-Bass, Holzblock-Takt, grau schunkelnd |
| `kampf` | normale Kämpfe, ca. 90 s | 4/4, 140 BPM | Pauke, Pizzicato-Ostinato in Sechzehnteln, Drehorgel-Melodie aus dem Kettlegate-Motiv, Abschnitt B mit `transponieren` |
Jedes Stück mit Intro (einmalig) und Schleife (`loop_ab`), mindestens 3 Abschnitte, nicht nur Wiederholung desselben Musters.
`manifest-musik-basis.json` (Format aus 0.2) mit diesen drei Stücken und `zuordnung`: `"kampf": { "standard": "kampf" }`, `"maps": { "altmarkt": { "tag": "kettlegate_tag" } }`, `"titel": "titel"`.

## 4. Werkzeuge und Doku
- `tools/audio/musik/pruefen.mjs`: Node 18+, ohne npm-Pakete. `node tools/audio/musik/pruefen.mjs` prüft **alle** `public/audio/musik/*.json` und alle `public/audio/manifest-musik-*.json` (Prüfungen aus 0.2, dazu: jede Manifest-Datei existiert, Datei unter 60 KB). Gibt pro Stück Länge in Sekunden (Intro + Schleife) aus. Exit-Code 1 bei Fehlern. Benutzt `parseNoten` aus `src/core/MusicSynth.js` (Import per relativem Pfad; die Klasse selbst darf in Node nicht abstürzen, wenn es kein `AudioContext` gibt).
- `tools/audio/musik/vorschau.html`: einfache Seite (lädt `../../../src/core/MusicSynth.js` als Modul, läuft mit `npx vite` oder jedem statischen Server). Liest alle `manifest-musik-*.json` aus einer Liste im Skript, zeigt alle Stücke mit Start/Stopp, Lautstärke, Anzeige des aktuellen Abschnitts und einem Knopf „Schleife testen“ (springt kurz vor den Loop-Punkt). Andere Pakete hängen ihr Manifest nur an diese Liste an.
- `docs/audio/musik-format.md`: das Format aus 0.2 vollständig (inkl. Instrumente-Format), die Leitmotive als Notenzeilen, und eine Kurzanleitung „neues Stück schreiben, prüfen, anhören“.

## 5. Abgabe
Pull Request nur mit deinen Dateien. In die Beschreibung: Ausgabe von `pruefen.mjs`, Dateigrößen, und kurz, was im Synth noch fehlt.
