# Nebel-Musik v1

Originale Musik als kompakte JSON-Partituren, live mit Web Audio synthetisiert. Keine Audiodateien, Soundfonts, Samples, Sprachaufnahmen oder zusätzlichen Laufzeitpakete. `MusicSynth.js` ist ein eigenständiges ES-Modul und wird noch nicht vom Spiel importiert. Die Pakete basis (Z1), kettlegate (Z2), wexmoor (Z3) und später dunscar (AY) liefern getrennte Manifeste.

## Einstieg

```sh
node tools/audio/musik/pruefen.mjs
python -m http.server 8000
```

Vorschau: `http://localhost:8000/tools/audio/musik/vorschau.html`. Alternativ mit Vite die gleiche Seite unter `/tools/audio/musik/vorschau.html` öffnen. Die Vorschau erkennt beide Pfadvarianten (`audio/` unter Vite, `public/audio/` unter einem statischen Server), überspringt noch nicht vorhandene Pakete und startet erst nach einem Klick. Start, Stopp, Pause, Weiter, Lautstärke, aktueller Abschnitt und „Schleife testen“ sind enthalten. Der letzte Knopf beginnt drei Sekunden vor dem Loop-Ende.

## Stückdatei

Ablage: `public/audio/musik/<id>.json`, UTF-8, höchstens 60.000 Byte pro Datei. Pflichtfelder:

| Feld | Bedeutung |
|---|---|
| `format` | Genau `nebel-musik-1` |
| `id`, `titel` | Stabile ID aus Kleinbuchstaben/Ziffern/Unterstrichen, lesbarer Titel |
| `bpm` | Viertel pro Minute, auch im 6/8-Takt; 20 bis 300 |
| `takt` | `[Zähler, Nenner]`, Nenner 2, 4, 8 oder 16 |
| `loop` | Boolean; Einzelstücke enden mit ihrem natürlichen Ausklang |
| `spuren` | Benannte Stimmen mit Instrument und optionalen Mischparametern |
| `muster` | Notenfolgen mit `spur`, positiver ganzzahliger Anzahl `takte`, `noten` |
| `abschnitte` | Parallele Musterlisten oder transponierte Ableitungen anderer Abschnitte |
| `ablauf` | Nichtleere Reihenfolge von Abschnittsnamen |

Optionale Felder:

- `lautstaerke`: Stücklautstärke 0–1, Standard 0,7; `hall`: Hallanteil 0–1, Standard 0,25.
- `loop_ab`: Index in `ablauf`, Standard 0. Bei Schleifen wird der Teil davor einmal gespielt. Die letzte Note läuft aus, während der neue Durchlauf samplezeitgenau beginnt; Hall und Echo werden am Übergang nicht zurückgesetzt.
- `art`: `musik` (Standard) oder `klang` für kurze Signale und Geräuschschleifen. Klangschleifen benötigen kein Intro.
- `filter: { "tiefpass": 900 }`: gemeinsamer Tiefpass, z. B. unter Wasser.
- `echo: { "verzoegerung_ms": 380, "rueckkopplung": 0.35, "tiefpass": 1800, "nass": 0.5 }`: gefilterte Feedback-Delay-Linie. Rückkopplung 0–0,85, Verzögerung 1–5.000 ms.

Pro Spur:

```json
{ "instrument": "drehorgel", "lautstaerke": 0.7, "pan": -0.2,
  "oktave": 0, "filter": { "tiefpass": 2400 } }
```

`pan` reicht von −1 (links) bis +1 (rechts); `oktave` ist eine ganzzahlige Verschiebung in Oktaven. Ein Spurfilter ersetzt den Instrumentenfilter für diese Spur. Lautstärken von Synth-Bus, Manifest, Stück, Spur und Anschlag werden miteinander multipliziert.

## Notenschreibweise

Dauern sind **Sechzehntel**, keine Nenner: `d5:4` ist eine Viertelnote, `d5:8` eine Halbe, `d5:16` eine ganze Note. Tonnamen `c d e f g a b`, Vorzeichen `#` und `b`, wissenschaftliche Oktavzählung. `a4` = 440 Hz, `c4` = mittleres C; **b = deutsches H**, **bb = deutsches B**.

| Zeichenfolge | Bedeutung |
|---|---|
| `r:4` | Viertelpause |
| `[d4,f4,a4]:16` | Ganzer d-Moll-Akkord |
| `d5:4@0.5` | Anschlagstärke 0,5; Standard 0,8 |
| `d5:8~ d5:8` | Gebundene Note; eine einzige Hüllkurve über beide Längen |
| `x:4` | Standardschlag des Instrumentes |
| `kick:4 snare:4 hat:4 x:4` | Benannte Schläge, müssen im Instrument definiert sein |
| `\|` | Taktstrich; darf nur an einer echten Taktgrenze stehen |

Leerzeichen trennen Ereignisse, Akkorde enthalten keine Leerzeichen. Dauern sind positive ganze Zahlen. Taktlänge = `Zähler × 16 / Nenner`: 4/4 = 16, 3/4 und 6/8 = jeweils 12 Sechzehntel. Die Summe muss genau zu `takte` passen. Noten dürfen Taktgrenzen überspannen; ein Taktstrich mitten in einer laufenden Note ist nicht erlaubt. Alternativ die Note an der Grenze teilen und binden.

Bindungen werden nach dem Ausschreiben über Muster- und Abschnittsgrenzen zusammengeführt. Die nächste Note muss unmittelbar anschließen und dieselbe Tonhöhe bzw. denselben Akkord haben. Eine Bindung auf Pause/Schlag oder eine offene Bindung am Stückende ist ungültig. Am Loop-Ende daher eine ungebundene Note schreiben; ihr Release überlappt den nächsten Umlauf. Ein am Abschnittsende gekürztes wiederholtes Muster beendet dort auch seine Bindung.

## Abschnitte, Wiederholungen und Transposition

```json
{
  "intro": ["akk_a"],
  "A": ["motiv_a", "bass_a", "tick*2"],
  "B": ["antwort", "bass_b", "tick*2"],
  "B_hoch": { "basis": "B", "transponieren": 2 }
}
```

Die Einträge einer Liste spielen gleichzeitig. `*n` bedeutet n aufeinanderfolgende Wiederholungen und bestimmt die Mindestlänge dieses Eintrags. Ein Abschnitt dauert so lange wie sein längster Eintrag. Kürzere Muster wiederholen sich bis zu seinem Ende; der letzte Durchlauf wird bei Bedarf gekürzt. `B_hoch` übernimmt B und verschiebt alle **tonalen** Noten um zwei Halbtöne; Schlagwerk bleibt unverändert. Verschachtelte Ableitungen sind erlaubt, zyklische Verweise sind Fehler. `ablauf` könnte `['intro', 'A', 'B', 'B_hoch', 'A']` sein; mit `loop_ab: 1` läuft das Intro einmal.

Ein Stück besitzt ein globales Tempo und einen globalen Notations-Takt. Für freie Musik einen geeigneten Notations-Takt wählen; Pausen und lange Töne lösen den Puls auf. Der Abspann wechselt die rhythmische Gruppierung der Motive, ohne ein nicht definiertes Tempo-/Taktwechsel-Feld einzuführen.

## Verbindliche Leitmotive

Die folgenden Tonhöhen und Dauern sind die gemeinsame Referenz. Eigene Antwortphrasen und Transpositionen können dazukommen.

```text
Kettlegate, d-Moll, 4/4:
a4:4 f4:4 g4:4 c4:4 | c4:4 g4:4 a4:4 f4:4

Wexmoor, E-dorisch, 6/8:
e4:6 g4:2 a4:4 | b4:6 a4:2 g4:4 |
f#4:6 e4:2 d4:4 | e4:12

Okkult, Tritonus, 4/4:
c5:8 f#5:8 | b4:16

Ermittler, offene Frage, 4/4:
g4:2 a4:2 c5:4 b4:8

Dunscar, Schichtpfiff, 4/4:
e5:3 r:1 e5:3 r:1 c5:8 | r:16
Gutes Ende:
e5:3 r:1 e5:3 r:1 c5:8 | g5:16
```

**Korrektur der Aufgabenbeschreibung:** Die vorgegebene Wexmoor-Zeile enthält 48 Sechzehntel. Das sind vier 6/8-Takte, nicht zwei. Oben sind nur die Taktstriche korrigiert; alle Töne und Dauern bleiben erhalten. Wird das Motiv in einem anderen Takt notiert, werden die Taktstriche verschoben und übergebundene Noten an Grenzen geteilt. Dorische Begleitakkorde benutzen zusätzlich Cis.

## Instrumentenformat

`instrumente.json`:

```json
{
  "format": "nebel-instrumente-1",
  "instrumente": {
    "drehorgel": {
      "typ": "osc", "welle": "square", "pulsbreite": 0.3,
      "stimmen": 2, "detune": 6,
      "attack": 0.02, "decay": 0.1, "sustain": 0.8, "release": 0.15,
      "filter": { "tiefpass": 2400 }, "vibrato": { "rate": 5.5, "tiefe": 8 }
    }
  }
}
```

- `osc`: `welle` = sine/square/sawtooth/triangle. Optionale Pulsbreite über PeriodicWave, 1–4 Stimmen, `detune` in Cent pro Stimmenabstand. `vibrato.rate` in Hz und `vibrato.tiefe` in Cent.
- `fm`: sinusförmiger Träger und Modulator; `verhaeltnis` = Frequenzverhältnis, `index` = anfängliche Modulationstiefe. Die Modulation klingt aus.
- `pluck`: deterministischer Karplus-Strong-Puffer aus kurzem Rauschimpuls und gedämpfter Rückführung; `daempfung`, Standard 0,993. Keine externen Samples.
- `noise`: Weißrauschen oder `farbe: "rosa"` (tieffrequent geglättetes Rauschen), optional `modulation` in Hz, `impuls` als exponentielle Abklingzeit und `ton` als zusätzliche Sinusfrequenz mit Pitch-Drop. `filter.bandpass` und `filter.q` sind für Schlagwerk verfügbar.
- `formant`: Sägezahn durch mehrere Bandpässe, `formanten` als Frequenzliste; wortlose oo-/ah-Färbung.
- ADSR: `attack`, `decay`, `release` in Sekunden, `sustain` 0–1. Jede Note hat mindestens 4 ms Ein- und Ausblendung; kurze Noten verkürzen die Attack/Decay-Phase.
- `schlaege`: Objekt benannter Schläge. Jeder Schlag überschreibt die benötigten Parameter seines übergeordneten Instrumentes. `schlagzeug` liefert kick/snare/hat/x.

Die 30 Standardnamen: drehorgel, harmonium, klavier, celesta, glocke, spieluhr, streicher, streicher_tief, pizzicato, kontrabass, zither, hackbrett, akkordeon, fidel, floete, chor_oo, chor_ah, nebelhorn, dampfpfeife, saege, drone, pad_glas, pauke, rahmentrommel, holzblock, amboss, schlagzeug, wind, wasser, knistern.

Erweiterungen kommen in `instrumente_<paket>.json` mit demselben Format. Das Manifest benennt **alle** benötigten Bankdateien, z. B. `"instrumente": ["instrumente.json", "instrumente_dunscar.json"]`. Ohne dieses Feld wird `instrumente.json` geladen. Parameter anderer Pakete nicht still überschreiben.

## Manifest

```json
{
  "format": "nebel-musik-1", "base": "audio/musik/",
  "instrumente": ["instrumente.json"],
  "tracks": { "titel": { "file": "titel.json", "mood": "titel", "volume": 0.7 } },
  "zuordnung": { "maps": {}, "zonen": {}, "kampf": {}, "ereignisse": { "titel": "titel" } }
}
```

`base` ist relativ zur öffentlichen Wurzel, eine Ebene über dem Ordner `audio`, in dem das Manifest liegt. Dateinamen in `tracks` sind relativ zu `base`. Mehrere Manifeste werden zusammengeführt; Tag-/Nacht-Zuordnungen ergänzen sich rekursiv. Beispiel: `"altmarkt": {"tag":"kettlegate_tag","nacht":"kettlegate_nacht"}`. Die zugeordneten IDs können aus einem anderen geladenen Paket stammen.

## API und spätere Anbindung

```js
import MusicSynth from './src/core/MusicSynth.js';
const synth = new MusicSynth({ context: vorhandenerAudioContext, destination: musikBus, instrumente });
await synth.ladeManifest('/audio/manifest-musik-basis.json');
await synth.lade('titel');
// In einem echten Click-/Touch-Handler:
await synth.spiele('titel', { blende: 1.5 });
synth.lautstaerke = 0.65;
synth.pause();
await synth.weiter();
synth.stopp({ blende: 1 });
const buffer = await synth.renderOffline('titel', 12); // nur Arbeitsspeicher
synth.zerstoere();
```

`context` und `destination` sind optional. Ohne Context wird erst beim Start ein eigener AudioContext erstellt. `lade` akzeptiert auch ein Stückobjekt. `spiele` liefert ein Promise und akzeptiert zusätzlich `position` in Sekunden für die Vorschau. `status` enthält ID, Abschnitt, Position und Gesamtdauer. Pausieren speichert die Position, trennt die Wiedergabeschicht und setzt beim Fortsetzen auch angeschnittene gehaltene Töne wieder ein. Es suspendiert **keinen geteilten Context**, damit SFX weiterlaufen können. `zerstoere` schließt nur selbst erzeugte Contexts.

Scheduler: alle 25 ms, 120 ms Vorlauf, AudioContext-Zeit als Uhr. Nach einem verspäteten Tick werden verpasste Anschläge übersprungen statt gebündelt nachgeholt. Pro Instanz maximal 24 überlappende Notenstimmen, auch während Überblendungen; bei Bedarf wird die älteste mit kurzer Ausblendung freigegeben. Alle Knoten werden nach dem Ausklang getrennt. Pro Wiedergabeschicht ein gemeinsamer Faltungshall mit selbst erzeugter Stereo-Impulsantwort; optionaler Echo-Feedbackzweig und Tiefpass. Ein Kompressor schützt den Ausgang bei dichter Instrumentierung.

Die bestehende `Audio.js` hat `levels.master`, `levels.musik` und `music(id)`. Dort später denselben Context teilen, Musikbus auf das Produkt der beiden Pegel setzen und die neue Klasse für JSON-Musik verwenden. `main.js` steht weiterhin auf `kinds: ['sfx']`. Diese Lieferung ändert keine bestehende Integration.

## Neues Stück

1. Eine neue ID/JSON-Datei anlegen, Tempo/Takt und passende Instrumente wählen.
2. Motiv, Antwort, Begleitung und ruhigeres Intro als Muster ausnotieren; Musterlängen ausrechnen.
3. Mindestens drei unterschiedliche Abschnitte zusammenstellen und `ablauf`/`loop_ab` setzen.
4. Eigenes Paketmanifest ergänzen, bei neuem Paket dessen Namen zur Vorschau-Liste hinzufügen.
5. `node tools/audio/musik/pruefen.mjs` ausführen und die Schleife in beiden Richtungen des Stimmungswechsels anhören.

## Prüfung und Grenzen

Der Prüfer benötigt nur Node 18+, importiert denselben Parser wie die Wiedergabe und prüft sämtliche Musik-JSONs, Instrumentbanken, Musik-/Klang-Manifeste, Zuordnungen, Dateigrößen, Referenzen, Taktlängen, Schleifen und Abschnittszyklen. Er enthält 24 gezielte Selbsttests für Parserfehler, Bindungen, Transposition, Wiederholungen, Scheduler-Grenzen, Pause/Fortsetzen, Überblendung und abgebrochene Ladevorgänge. Ausgabe: pro Stück Tempo/Takt, Intro, Loop-/Stücklänge und Bytes. Fehler führen zu Exit-Code 1.

Zusätzliche Prüfung dieser Lieferung: alle 26 Stücke wurden für bis zu 18 Sekunden mit einer temporären Web-Audio-Emulation offline gerendert; Signale waren endlich, nicht stumm und unter Vollaussteuerung. Das ist kein Ersatz für reale Browser-/Gerätetests. Chromium konnte in der Arbeitsumgebung wegen einer Socket-Beschränkung nicht starten; eine reale Hörabnahme auf Safari/Android und Belastungsprüfung bleibt offen. Keine Emulations-Abhängigkeit ist Teil des Repos.

Bewusste Grenzen: keine Laufzeit-Anbindung an Phaser/Audio.js, keine Echtzeit-LUFS-Normalisierung, keine samplegenaue Rekonstruktion der Hüllkurven beim Fortsetzen mitten in einer Note (kurzes erneutes Anblenden), kein Tempo-/Taktwechsel innerhalb einer Datei, keine offenen Bindungen über die Schleifengrenze. Offline-Rendering ist auf 600 Sekunden begrenzt und sollte auf Mobilgeräten mit kurzen Ausschnitten genutzt werden. Der Streifen-Track hat gemäß Vorgabe ein anderes Tempo als die Stadtstücke; als sehr leises Overlay verwenden, nicht als phasengleichen Stem.
