# Codex-Paket AY: Musik und Klänge für Dunscar (Kapitel 3), als Notendaten

**Paket-Name:** `musik_dunscar` · **Deine Dateien:** neue Dateien mit Präfix `ds_` in `public/audio/musik/`, optional `public/audio/musik/instrumente_dunscar.json`, Manifeste `public/audio/manifest-musik-dunscar.json` und `public/audio/manifest-klang-dunscar.json`, `docs/audio/README-dunscar.md`, notfalls `tools/audio/musik/pruefen_dunscar.mjs`

Kapitel 3 spielt in Dunscar, einer stillgelegten Kalkbergbau-Stadt, durch die nachts ein Zug voller Stimmen fährt. Die Kernmechanik heißt „Rufen, horchen, schweigen“: Der Spieler sendet Rufmuster (Pfiffe, Klopffolgen) und hört auf den Nachhall. Ton ist hier also **Teil des Spiels**, muss aber immer zusätzlich sichtbar sein (das macht der Code). **Diese Fassung ersetzt die alte AY-Datei:** alles, Musik **und** Klänge, wird als JSON-Notendaten geliefert und im Spiel per WebAudio gespielt. Paket Z1 baut gleichzeitig den Synth dafür (`src/core/MusicSynth.js`, `instrumente.json`, `tools/audio/musik/pruefen.mjs`).

## Gemeinsame Eckdaten „Kapitel 3: Der letzte Zug nach Dunscar“ (gilt für die Pakete AR bis AY)

Seb hat für Kapitel 3 **Geschichte 3** aus Paket AC gewählt. Sie steht vollständig in **`docs/story/kapitel3/geschichte_3.md`**: lies sie zuerst ganz, sie ist die verbindliche Vorlage (Prämisse, Anschluss an die vier Wexmoor-Enden, sechs Viertel, zehn Figuren, Gegenspieler Gallowmere, Kernmechanik „Rufen, horchen, schweigen“, 5 Akte x 4 Fährten, Wendepunkte, vier Enden). Die Geschichten 1 und 2 im selben Ordner werden **nicht** benutzt, sie bleiben für später.

Acht Pakete bauen Kapitel 3 gleichzeitig. Damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so und lege nichts an, was einem anderen Paket gehört.

**Stadt:** `dunscar` (Feld `city` auf allen Karten). Ende Kapitel 2 setzt `kapitel2_done`; Kapitel 3 startet mit Flag `k3_arrived`, Ende Kapitel 3 setzt `kapitel3_done`.

**Karten** (Daten: AS, Grafik: AV)
| ID | Was |
|---|---|
| `ds_endbahnhof` | Viertel: Endbahnhof mit Wartesaal und Fahrkartenschalter (Ankunft) |
| `ds_schwellenring` | Viertel: Werkstätten, Runddepot, überwachsene Drehscheibe |
| `ds_arbeiterbogen` | Viertel: Reihenhäuser um einen windstillen Platz |
| `ds_kalkmarkt` | Viertel: Steinmetze, Trödel, Teesaal |
| `ds_bruchstufen` | Viertel: breite Treppen hinab in die Steinbrüche, Gerüste |
| `ds_signalhang` | Viertel: Schaltbuden, Prüfhaus, überdeckter Bahnsteig über der Schlucht |
| `ds_speisewagen` | Innenraum: Pfiffs Speisewagen, **Unterschlupf** (Koje, Lager, Fallwand, Kohlenofen, Schallschleuse) |
| `ds_runddepot` | Innenraum: Lokschuppen mit dem Nachtzug in der Wartung |
| `ds_pruefhaus` | Innenraum: Willas Klangprüfhaus mit Walzen und Trichtern |
| `ds_teesaal` | Innenraum: Mabels Wirtshaus „Zur letzten Schicht“ am Arbeiterbogen |
| `ds_lohnbuero` | Innenraum: altes Lohnbüro am Signalhang, Esthers Archiv |
| `ds_nachtzug_wagen` / `ds_nachtzug_lok` | Innenräume des Nachtzugs (Personenwagen voller Schichtgänger, Führerstand) |
| `ds_rangierwueste` | Gefahrengebiet tier 4, Boss `schwellenhund` |
| `ds_klopfbruch` | Gefahrengebiet tier 4, Boss `vorhauer` |
| `ds_rufschlucht` | Gefahrengebiet tier 5, Boss `vielrufer` |
| `ds_letzter_bahnsteig` | Finale: verlassener Bruchbahnsteig, Endkampf/-gespräch mit `gallowmere` |
| `ds_unterschicht` | nach dem Kapitel: Gefahrengebiet unter der Schlucht, Superboss `unterschicht` |

**Figuren** (Geschichte: AR/AT/AU, Grafik: AW)
`k3_pfiff` (Ansel „Pfiff“ Cedrow, Verbündeter), `k3_gallowmere` (Perrin Gallowmere, Fahrmeister, Gegenspieler), `k3_willa` (Willa Trentfold), `k3_oren` (Oren Fallowby), `k3_mabel` (Mabel Caskett), `k3_pelham` (Jonas Pelham), `k3_nellie` (Nellie Swarth), `k3_huxford` (Dr. Corin Huxford), `k3_esther` (Esther Brindle), `k3_adaine` (Adaine Quarrell), dazu neu **`k3_weichenstellerin`** (Hedda Quist, alte Weichenstellerin am Schwellenring, kennt die Pfade und nimmt die Sequenz-Prüfungen ab, Paket AU).

**Gegner** (Werte: AS bzw. AU, Grafik: AX)
- Normale Gegner: `schichtgaenger` (verzauberter lebender Arbeiter, wird nur bewusstlos), `kalkstaubgeist`, `signalkraehe`, `lohnlistenmotte`, `geruestklang`, `nachhall`.
- Bosse: `schwellenhund` (Akt II), `vorhauer` (Akt III), `vielrufer` (Akt V), `gallowmere` (Finale), `unterschicht` (Superboss nach dem Kapitel).
- Sequenz-Prüfungen (Paket AU, je ein Boss pro Pfad, Namen aus Paket AF): `k3p_lampengutachter` (laterne), `k3p_gegenzeugenknuepfer` (faden), `k3p_garderobenpfaender` (maske), `k3p_pausenfischer` (echo), `k3p_chargenpruefer` (kessel), `k3p_brueckenpresser` (eisen), `k3p_zollriegel` (schluessel), `k3p_fristpfaender` (sq_waage), `k3p_schichtsammler` (sq_moor), `k3p_gangaufseher` (sq_uhr).

**Kernzutaten der hohen Sequenzen** (Paket AF, liegen jetzt in `src/data/packs/sequenzen/zutaten.json`; Herkunft legt Paket AU fest):
- Seq 5 der neuen Pfade (`sq_zutat_<pfad>_5`): Beute von `schwellenhund`.
- Seq 4 aller Pfade (`sq_zutat_<pfad>_4`): Beute der eigenen Sequenz-Prüfung.
- Seq 3: Beute von `vorhauer`. Seq 2: Beute von `vielrufer`. Seq 1: Beute von `unterschicht`.
Bosse geben nur die Zutat des Pfads, dem der Spieler folgt; eine friedliche Lösung gibt dieselbe Zutat.

**Präfixe für neue IDs:** AR `k3a_`, AS `k3o_`, AT `k3n_`, AU `k3p_`. Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

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

## 1. Dunscar-Motiv
Das Leitmotiv steht in 0.2: ein **Schichtpfiff**, dem der letzte Ton fehlt (die „fehlende Note“ aus Akt I, Fährte 2). Nur im Ende „Feierabend für die Toten“ (`ds_feierabend`) wird die vollständige Fassung gespielt. Besetzung: `dampfpfeife`, `hackbrett`, `saege`, `chor_oo` (Männerchor ohne Worte), `amboss`, `wind`. Wenn du einen eigenen Klang brauchst (z. B. Schienenstoß, Phonograph-Trichter), definiere ihn in `instrumente_dunscar.json` (Format siehe 0.2 bzw. `docs/audio/musik-format.md` von Z1).

## 2. Stücke (`art: "musik"`)
| ID | Wofür | Richtwert |
|---|---|---|
| `ds_ankunft` | Ankunft, Endbahnhof bei Tag | 120 s |
| `ds_stadt_tag` | Viertel am Tag | 120 s |
| `ds_stadt_nacht` | Viertel nachts, der Zug ist unterwegs | 120 s |
| `ds_speisewagen` | Unterschlupf, warm, Kohlenofen, Phonograph (`knistern`) | 90 s |
| `ds_pruefhaus` | Willas Prüfhaus, konzentriert, Walzen-Rhythmus | 90 s |
| `ds_horchen` | über allem, wenn eine Horchstelle aktiv ist: fast nur Stille, Wind, ein gehaltener Ton | 60 s |
| `ds_nachtzug` | im Zug, Schienenstöße als Takt (`holzblock`/`amboss`) | 90 s |
| `ds_brueche` | Gefahrengebiete Rangierwüste und Klopfbruch | 120 s |
| `ds_rufschlucht` | Rufschlucht, viele Stimmen ohne Worte, die nicht zusammenpassen (`chor_ah` in versetzten Mustern) | 120 s |
| `ds_kampf` | normale Kämpfe | 90 s |
| `ds_boss` | Story-Bosse | 120 s |
| `ds_gallowmere` | Finale, Dunscar-Motiv gegen Ermittler-Motiv | 150 s |
| `ds_unterschicht` | Superboss, tief, langsam, groß | 150 s |
| `ds_pruefung` | Sequenz-Prüfungen, ernst, rituell | 90 s |
| `ds_feierabend` | Ende „Feierabend“, der fehlende Ton kommt, `loop: false` | 60 s |
| `ds_stilllegung` | Ende „Stilllegung“, Spur für Spur verstummt, `loop: false` | 60 s |
| `ds_vollzaehlig` | Ende „Die Schicht ist vollzählig“, Pfiff wird zum Befehl, `loop: false` | 60 s |
Jedes Schleifen-Stück: einmaliges Intro, mindestens 3 verschiedene Abschnitte. Manifest `manifest-musik-dunscar.json` (Format 0.2) mit `zuordnung.maps` für **alle** Karten-IDs aus den Eckdaten und `zuordnung.kampf`: `"standard_kapitel3": "ds_kampf"`, `"boss_kapitel3": "ds_boss"`, `"gallowmere": "ds_gallowmere"`, `"unterschicht": "ds_unterschicht"`, `"pruefung": "ds_pruefung"`.

## 3. Klänge (`art: "klang"`, gleiches Format, kurze Stücke)
Auch die Klänge sind Notendaten, keine Audiodateien. Damit es nicht zu viele Dateien werden, fasse sie in **Sammeldateien** zusammen: Eine Datei `public/audio/musik/ds_klaenge_<gruppe>.json` darf statt eines Stücks ein Objekt `{ "format": "nebel-musik-1", "art": "sammlung", "stuecke": { "<id>": { ...Stück... } } }` enthalten. (Wenn Z1s Prüfer das noch nicht kennt: schreib in die PR, dass `pruefen.mjs` Sammlungen unterstützen muss, und prüfe sie bis dahin mit `tools/audio/musik/pruefen_dunscar.mjs`.)
- `ds_klaenge_rufe.json`: **16 Rufmuster** `ds_ruf_01` bis `ds_ruf_16`, je 0,5 bis 2 s (Pfiff-Folgen auf `dampfpfeife`/`floete`, Klopffolgen auf `holzblock`/`amboss`, Glockenzeichen auf `glocke`), klar voneinander unterscheidbar (verschiedene Rhythmen **und** Tonhöhen). Für jedes ein **Nachhall** `ds_hall_01` bis `ds_hall_16`: dieselben Noten, mit `echo` (Verzögerung 250 bis 600 ms, Tiefpass, leiser), wie von einer Felswand. Zu jedem Rufmuster ein Feld `"zeichen"` mit einer kurzen Text-Darstellung für die Anzeige (z. B. `"— · —"`), weil Ton immer auch sichtbar sein muss.
- `ds_klaenge_horchen.json`: `ds_horch_an`, `ds_horch_aus`, `ds_ladung_leer`, `ds_ladung_voll`, `ds_falsches_muster`, `ds_richtiges_muster`.
- `ds_klaenge_welt.json`: `ds_zug_pfiff_fern`, `ds_zug_fahrt` (Schleife), `ds_zug_bremse`, `ds_schalter_klingel`, `ds_phonograph` (Schleife, Knistern), `ds_walze_start`, `ds_kalkstaub`, `ds_geruest_wind` (Schleife), `ds_klopfen_fern`, `ds_stimmen_murmeln` (Schleife, `chor_oo` in zufällig wirkenden, versetzten Mustern, keine Worte).
- `ds_klaenge_bosse.json`: `ds_schwellenhund_bellen`, `ds_vorhauer_schlag`, `ds_vielrufer_chor`, `ds_gallowmere_pfeife` (Dunscar-Motiv auf `dampfpfeife`), `ds_unterschicht_atem`.
Manifest `manifest-klang-dunscar.json`: `{ "format": "nebel-musik-1", "base": "audio/musik/", "klaenge": { "ds_ruf_01": { "file": "ds_klaenge_rufe.json", "volume": 0.8, "loop": false, "zeichen": "— · —" }, ... } }`.

## 4. Doku und Abgabe
`docs/audio/README-dunscar.md`: das Dunscar-Motiv, die 16 Rufmuster als Tabelle (ID, Zeichen, Noten, wofür gedacht), eigene Instrumente. Hänge deine beiden Manifeste an die Liste in `tools/audio/musik/vorschau.html` an, falls die Datei schon da ist (nur diese eine Zeile ändern). Pull Request nur mit deinen Dateien, in die Beschreibung die Prüf-Ausgabe und eine Liste aller Stücke und Klänge mit Länge.
