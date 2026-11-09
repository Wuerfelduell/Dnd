# Codex-Paket AY: Musik und Klänge für Dunscar (Kapitel 3)

**Paket-Name:** `musik_dunscar` · **Deine Ordner:** `public/audio/musik/` (nur neue Dateien mit Präfix `ds_`), `public/audio/sfx/` (nur neue Dateien mit Präfix `ds_`), `tools/audio/dunscar/`, `docs/audio/README-dunscar.md`, Manifeste `public/audio/manifest-musik-dunscar.json` und `public/audio/manifest-sfx-dunscar.json`

Kapitel 3 spielt in Dunscar, einer stillgelegten Kalkbergbau-Stadt, durch die nachts ein Zug voller Stimmen fährt. Die Kernmechanik heißt „Rufen, horchen, schweigen“: Der Spieler sendet Rufmuster (Pfiffe, Klopffolgen) und hört auf den Nachhall. Ton ist hier also **Teil des Spiels**, muss aber immer zusätzlich sichtbar sein (das macht der Code).

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
- Andere Pakete laufen gleichzeitig. Fasse nur deine eigenen Ordner und Dateien an (stehen oben).
- Am Ende ein Pull Request nur mit deinen Dateien. In die PR-Beschreibung: Liste aller Sounds mit Länge und Dateigröße, Gesamtgröße.

### 0.5 Anschluss an die vorhandenen Ton-Pakete
- Soundeffekte (Paket Y) liegen schon in `public/audio/sfx/` mit `manifest-sfx.json` und dem Generator `tools/audio/sfx/`. Lies beides und **benutze denselben Generator-Stil** (eigene Einträge in `tools/audio/dunscar/sfx.py`, gleiche Lautheit).
- Musik (Paket Z) ist vielleicht schon im Repo (`public/audio/musik/`, `tools/audio/musik/`, Leitmotive in `docs/audio/README-musik.md`). Wenn ja: benutze dieselbe Instrumenten-Bibliothek und dieselben Motive (Kettlegate, Wexmoor, Okkult, Ermittler). Wenn nein: bau dir eine kleine eigene Bibliothek in `tools/audio/dunscar/` nach den Regeln oben (alles selbst synthetisiert) und lege die vier Grundmotive selbst fest; schreib sie in `docs/audio/README-dunscar.md`.
- Format Musik: Stereo, 44,1 kHz, OGG q4 + MP3 128 kbit/s, nahtlose Schleifen mit `loopStart`/`loopEnd`. Format SFX: Mono, OGG q3 + MP3 96 kbit/s.

---

## 1. Dunscar-Motiv
Ein neues Leitmotiv für Dunscar: ein **Schichtpfiff** aus drei Tönen, dem der letzte Ton fehlt (die „fehlende Note“ aus Akt I, Fährte 2). Erst im Ende „Feierabend für die Toten“ wird der fehlende Ton gespielt. Besetzung-Ideen: Dampfpfeife (synthetisch), Hackbrett, gestrichene Säge (Sinus mit Vibrato), Männerchor ohne Worte, Ambossschläge, Wind.

## 2. Stücke (`ds_<id>`)
| ID | Wofür | Länge |
|---|---|---|
| `ds_ankunft` | Ankunft, Endbahnhof bei Tag | 120 s |
| `ds_stadt_tag` | Viertel am Tag | 120 s |
| `ds_stadt_nacht` | Viertel nachts, der Zug ist unterwegs | 120 s |
| `ds_speisewagen` | Unterschlupf, warm, Kohlenofen, Phonograph-Knistern | 90 s |
| `ds_pruefhaus` | Willas Prüfhaus, konzentriert, Walzen | 90 s |
| `ds_horchen` | über allem, wenn eine Horchstelle aktiv ist: fast nur Stille, Wind, ein gehaltener Ton | 60 s |
| `ds_nachtzug` | im Zug, Rhythmus der Schienen als Takt | 90 s |
| `ds_brueche` | Gefahrengebiete Rangierwüste und Klopfbruch | 120 s |
| `ds_rufschlucht` | Rufschlucht, viele Stimmen ohne Worte, die nicht zusammenpassen | 120 s |
| `ds_kampf` | normale Kämpfe in Dunscar | 90 s |
| `ds_boss` | Story-Bosse | 120 s |
| `ds_gallowmere` | Finale mit Gallowmere, Dunscar-Motiv gegen Ermittler-Motiv | 150 s |
| `ds_unterschicht` | Superboss, tief, langsam, groß | 150 s |
| `ds_pruefung` | Sequenz-Prüfungen, ernst, rituell | 90 s |
| `ds_feierabend` | Ende „Feierabend“, der fehlende Ton kommt | 60 s, keine Schleife |
| `ds_stilllegung` | Ende „Stilllegung“, alles verstummt nacheinander | 60 s, keine Schleife |
| `ds_vollzaehlig` | Ende „Die Schicht ist vollzählig“, Pfiff wird zum Befehl | 60 s, keine Schleife |
Manifest `manifest-musik-dunscar.json` im Format von `manifest-musik.json` (Paket Z) bzw. wie in `docs/art/codex_Z_musik.md` beschrieben, mit `zuordnung` für alle Karten-IDs aus den Eckdaten.

## 3. Klänge (`ds_<id>`)
- **Rufmuster:** 16 kurze Signale (Pfiff-Folgen, Klopffolgen, Glockenzeichen), `ds_ruf_01` bis `ds_ruf_16`, je 0,5 bis 2 s, klar voneinander unterscheidbar. Dazu für jedes ein **Nachhall** (`ds_hall_01` …), wie es von einer Felswand zurückkommt (verzögert, gefiltert).
- `ds_horch_an`, `ds_horch_aus`, `ds_ladung_leer`, `ds_ladung_voll`, `ds_falsches_muster`, `ds_richtiges_muster`.
- `ds_zug_pfiff_fern`, `ds_zug_fahrt` (Schleife), `ds_zug_bremse`, `ds_schalter_klingel`, `ds_phonograph` (Schleife, Knistern), `ds_walze_start`, `ds_kalkstaub`, `ds_geruest_wind` (Schleife), `ds_klopfen_fern`, `ds_stimmen_murmeln` (Schleife, ohne Worte).
- Boss-Klänge: `ds_schwellenhund_bellen`, `ds_vorhauer_schlag`, `ds_vielrufer_chor`, `ds_gallowmere_pfeife`, `ds_unterschicht_atem`.
Manifest `manifest-sfx-dunscar.json` im Format von `manifest-sfx.json`.

## 4. Zusätzlich
`tools/audio/dunscar/render.py` (alles neu erzeugen), `tools/audio/dunscar/vorschau.html` (alle Stücke und Klänge, mit Schleifen-Test), `docs/audio/README-dunscar.md`.
