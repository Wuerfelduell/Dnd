# Codex-Paket CL: Musik für Calderwick, Briarholt, Landstraße, Feste und Jahreszeiten (Notendaten)

**Schreibt nach:** `public/audio/musik/` (Präfixe `cw_`, `bh_`, `ls_`, `fest_`, `saison_`) und `public/audio/manifest-musik-k4k5.json`, `public/audio/manifest-musik-feste.json`

Musik wird im Spiel als JSON-Notendaten („Nebel-Musik v1“) per WebAudio gespielt, nie als Audiodatei. Kettlegate (Z1/Z2), Wexmoor (Z3) und Dunscar (AY) sind fertig. Jetzt fehlen die Städte der Kapitel 4 und 5, die Landstraße dazwischen, die drei Feste und vier Jahreszeiten-Zwischenspiele. **Keinen Spielcode ändern.**


## 0. Format und Werkzeug (Pflicht, zuerst lesen)
- `src/core/MusicSynth.js` (nur lesen) spielt das Format; `public/audio/musik/instrumente.json` enthält die 30 Instrumente: drehorgel, harmonium, klavier, celesta, glocke, spieluhr, pad_glas, streicher, streicher_tief, pizzicato, kontrabass, zither, hackbrett, akkordeon, fidel, floete, chor_oo, chor_ah, nebelhorn, drone, dampfpfeife, saege, pauke, rahmentrommel, holzblock, amboss, schlagzeug, wind, wasser, knistern. Keine neuen Instrumente.
- Vorlagen: `public/audio/musik/ds_stadt_tag.json` (Schleife mit Intro und Abschnitten), `ds_feierabend.json` (Ende, `loop: false`), `manifest-musik-dunscar.json` (Zuordnung). Prüfer: `node tools/audio/musik/pruefen.mjs <datei>`; Vorschau-Seite in `tools/audio/musik/`.
- Jedes Schleifen-Stück: einmaliges Intro, mindestens 3 verschiedene Abschnitte, Melodie mit Antwort. Leitmotive: das Ermittler-Motiv und das Okkult-Motiv aus Z1 wiederverwenden (zitieren, nicht kopieren), dazu je Stadt ein eigenes Motiv.

## 1. Calderwick (Präfix `cw_`, Kapitel 4: Druckerstadt, Rohrpost, Verwaltung, trockener Amtswitz)
| ID | Wofür | Takt, Tempo | Besetzung, Stimmung |
|---|---|---|---|
| `cw_ankunft` | Ankunft am Gleisfuß, einmal, ca. 40 s, `loop: false` | 4/4, 80 | Holzblock wie eine Setzmaschine, Klavier, Streicher tief; das Calderwick-Motiv (fallende Terz, als fehlte ein Ton) |
| `cw_terrassen_tag` | Terrassen tags, ca. 120 s | 4/4, 96 | Klavier, Holzblock, Pizzicato, Akkordeon leise; geschäftig, trocken, Rhythmus wie Pressen |
| `cw_terrassen_nacht` | Terrassen nachts, ca. 120 s | 4/4, 66 | Celesta, pad_glas, wind; Rohrpost-Zischen als `saege`-Tupfer |
| `cw_werkstatt` | Buchbinderei (Unterschlupf), ca. 90 s | 3/4, 84 | Spieluhr, Zither, Kontrabass; warm, kleine Werkstatt |
| `cw_amt` | Röhrenhof, Archiv, Villa, ca. 100 s | 4/4, 72 | Harmonium, holzblock als Stempel, Streicher; kühl, gestapelt |
| `cw_abgleich` | Abgleich läuft (Spannung ohne Kampf), ca. 60 s | 4/4, 100 | Pizzicato, Pauke leise, pad_glas; Motiv verliert pro Abschnitt einen Ton |
| `cw_kampf` | Kämpfe in Calderwick, ca. 90 s | 4/4, 136 | Schlagzeug, Amboss, Streicher, chor_oo; metallisch wie Lettern |
| `cw_boss` | Bleisammler, Blinder Zusteller, Nullfundament, ca. 120 s | 4/4, 116 | Pauke, Harmonium, chor_ah, Okkult-Motiv im Bass; drei Abschnitte steigern sich |
| `cw_wetherby` | Verhör in der Druckkammer, ca. 90 s | 4/4, 60 | nur Klavier und Streicher tief, lange Pausen; Titel ohne Namen |
| `cw_ende_widerspruch` / `cw_ende_amtsinhaber` / `cw_ende_buecher` / `cw_ende_ordnung` | vier Enden, je ca. 40 s, `loop: false` | 4/4, 60 bis 72 | Widerspruch: viele kleine Stimmen (Pizzicato, Zither, Spieluhr) finden zusammen; Amtsinhaber: Harmonium allein; Bücher: Zug-Rhythmus leise, Hoffnung; Ordnung: ein einziger Akkord, sehr sauber, unheimlich |

## 2. Briarholt (Präfix `bh_`, Kapitel 5: Kurort unter Glas, kalt draußen, warm drinnen, stiller Schrecken)
| ID | Wofür | Takt, Tempo | Besetzung, Stimmung |
|---|---|---|---|
| `bh_ankunft` | Kutschenhof, einmal, ca. 40 s, `loop: false` | 3/4, 72 | Celesta, Streicher, wind; das Briarholt-Motiv (eine Walzerfigur, der der dritte Schlag fehlt) |
| `bh_kalt` | Außenkarten kalt, ca. 120 s | 3/4, 70 | Streicher tief, wind, knistern, Glocke fern; dünn, frostig |
| `bh_warm` | Außenkarten warm, Glasübergänge, ca. 120 s | 3/4, 92 | dasselbe Motiv als Kurwalzer: Akkordeon, Fidel, Celesta, Kontrabass; freundlich, zu freundlich |
| `bh_promenade` | Winterpromenade, Pavillon (Kurkapelle), ca. 90 s | 3/4, 100 | Drehorgel, Akkordeon, Holzblock; Salonwalzer mit einer schiefen Note |
| `bh_buegelraum` | Frosts Bügelraum (Unterschlupf), ca. 90 s | 4/4, 76 | Zither, Hackbrett, knistern vom Ofen; praktisch, warm, wortkarg |
| `bh_stille` | Stillenhäuser, Speisesäle, ca. 100 s | 4/4, 60 | pad_glas, chor_oo, Spieluhr; sauber, leer |
| `bh_leitungen` | Ventil-Entscheidungen, Rücklauf (Spannung ohne Kampf), ca. 60 s | 4/4, 88 | wasser, saege, Pizzicato, Pauke; steigt mit jedem Abschnitt in der Temperatur (transponieren) |
| `bh_kampf` | Kämpfe in Briarholt, ca. 90 s | 6/8, 132 | Schlagzeug, Streicher, Flöte schrill, chor_ah; pflanzlich, windend |
| `bh_boss` | Glasgärtner, Atemkessel, Blütenmund, ca. 120 s | 6/8, 112 | Pauke, Harmonium, chor_ah, nebelhorn; Okkult-Motiv als Blüte, die sich öffnet |
| `bh_greavesend` | Verhör in der Verteilanlage, ca. 90 s | 3/4, 56 | Klavier allein, dann Streicher; der Walzer ohne Mitgefühl |
| `bh_ende_wahl` / `bh_ende_winter` / `bh_ende_verwahrt` / `bh_ende_schmerzlos` | vier Enden, je ca. 40 s, `loop: false` | 3/4 und 4/4, 60 bis 72 | Wahl: Motiv vollständig mit drittem Schlag; Winter: wind und Zither, klein und ehrlich; Verwahrt: Spieluhr, die stehen bleibt; Schmerzlos: der Kurwalzer perfekt und leer |

## 3. Landstraße (Präfix `ls_`, Reise zwischen Dunscar, Calderwick, Briarholt)
`ls_fahrt_tag` (Kutsche, Hufe als holzblock, Fidel, ca. 90 s, 2/4, 104), `ls_fahrt_nacht` (wind, streicher_tief, Laterne als celesta, ca. 90 s), `ls_ereignis` (Zoll, Händler, Richter: Akkordeon, Pizzicato, kurz, ca. 45 s), `ls_ueberfall` (Kampf unterwegs, 4/4, 140, ca. 60 s), `ls_schlafkutsche` (Boss Schlafkutsche: Spieluhr, chor_oo, drone, 3/4, 50, ca. 90 s), `ls_landvermesser` (Boss Landvermesser: Holzblock-Metrum, Amboss, 4/4, 108, ca. 90 s).

## 4. Feste und Jahreszeiten (Präfixe `fest_`, `saison_`, Manifest `manifest-musik-feste.json`)
- `fest_laternennacht` (Kettlegate, 3/4, 96, ca. 120 s): Kettlegate-Motiv aus Z1 als Laternenwalzer, Akkordeon, Celesta, Glocke; zweiter Abschnitt mit Chor wie Gesang vom Kanal.
- `fest_salzsegen` (Wexmoor, 6/8, 88, ca. 120 s): Wexmoor-Motiv aus Z3 als Prozession, Fidel, Rahmentrommel, nebelhorn fern, Hackbrett.
- `fest_schichtwechsel` (Dunscar, 2/4, 112, ca. 120 s): Dunscar-Motiv aus AY als Blechblas-Marsch, Harmonium als Tuba, Amboss, Drehorgel; Boxring-Abschnitt schneller.
- `fest_feuerwerk` (ca. 20 s, `loop: false`): nur Pauke, Glocke, pad_glas.
- Vier Jahreszeiten-Zwischenspiele `saison_herbst`, `saison_winter`, `saison_fruehling`, `saison_sommer` (je ca. 25 s, `loop: false`), gespielt beim Wechsel der Jahreszeit: Herbst Zither und wind; Winter Celesta und knistern; Frühling Flöte und wasser; Sommer Streicher und Drone warm. Dazu je Jahreszeit eine **Variante** der Stadt-Tag-Stücke als eigenes Stück nur dort, wo es billig ist: `kettlegate_tag_winter` (Z1-Stück mit Celesta statt Klavier und halbem Schlagwerk); die übrigen Varianten als Vorschlag in der PR-Beschreibung, nicht als Datei.

## 5. Manifeste
`manifest-musik-k4k5.json`: Format aus `manifest-musik-dunscar.json`, alle Stücke aus 1 bis 3, `zuordnung.maps` für **jede** Karte aus den Eckdaten der Pakete CD und CH (Ids `cw_*`, `bh_*`, `reise_landstrasse`; Briarholt-Karten mit `{ "kalt": "bh_kalt", "warm": "bh_warm" }`, wenn das Feld unbekannt ist, `tag`/`nacht` und Vorschlag in der PR-Beschreibung), `zuordnung.kampf` (`calderwick`, `briarholt`, `landstrasse`, Bosse), `zuordnung.ereignisse` (Abgleich, Leitungen, Verhöre, Enden, Ankunft). `manifest-musik-feste.json`: Stücke aus 4 mit `zuordnung.ereignisse` (`fest_<name>`, `saison_<name>`, `feuerwerk`).

## 6. Abgabe
Prüfe jedes Stück mit `node tools/audio/musik/pruefen.mjs`. Pull Request nur mit deinen Dateien, in die Beschreibung die Prüf-Ausgabe und pro Stück Takt, Tempo, Länge. Wenn der PR zu groß wird, zwei PRs: Städte (1 bis 3) und Feste (4).

