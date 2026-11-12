# Paket DS – Klang der Rituale

92 Ereignis-IDs, 117 synthetische Varianten, 234 Dateien (OGG/Vorbis und MP3), vier JSON-Partituren. Alle Klänge sind eigene prozedurale Synthesen: keine Samples, Aufnahmen, fremden Melodien oder Sprachdateien. Trockenes, nahes Klangbild ohne künstlichen Hall im SFX-Generator. Keine Änderungen an Spielcode oder bestehenden Assets.

## Einbau und Varianten

`public/audio/manifest-sfx4.json` folgt dem vorhandenen SFX-Manifestformat. Der Einbau lädt es zusätzlich und trägt die folgenden Ereignisse in `src/core/sounds.js` ein. Basis-IDs sind die Aufruf-IDs; `variants: n` verweist auf Dateien `<id>_1` bis `<id>_n`. Zufallsauswahl ist für Treffer/Schritte sinnvoll, aber **nicht** für Ritualtränke und Zutaten: `s4ke_trinken_reihe` explizit mit Variante 1–5 gemäß Trankposition; `sud_zutat` mit 1 = Pulver, 2 = Kraut, 3 = Flüssigkeit. Keine neuen Flags oder Spielregeln werden hier festgelegt.

## Stille, Schleifen und Priorität

- Echo: `s4ec_taub_an` beim Eintritt einmal spielen und gleichzeitig sämtliche übrigen Audiobusse in 1,5 s auf null blenden. Danach absolute Stille: Musik, Ambiente, Treffer, Schritte, Warnungen, UI und Wächter bleiben stumm. Keine Warnklänge als Ersatzhinweis. `s4ec_taub_aus` erst beim Verlassen einmal spielen; anschließend den gespeicherten Mix sanft wiederherstellen. Die Eintrittsdatei allein kann andere Busse nicht stummschalten. Visuelle Regelanzeigen bleiben Aufgabe des Code-Threads.
- Nachfüllen: `s4la_nachfuellen_loop` ausschließlich während gehaltenem Nachfüllen; beim Loslassen stoppen und Abbruch spielen, bei vollem Behälter stoppen und Voll-Klang spielen. Kurze Ein-/Ausblendung von 20–40 ms vermeidet Klicks beim beliebigen Stoppen.
- Nacht, Traum und Schatten: jeweils genau eine Ambiente-Instanz, bei Übergang/Fehlschlag/Spielerwechsel stoppen. `s4la_unruhe_puls` ist ein separater 2-s-Loop, dessen Lautstärke mit der Ritualdauer steigt; keine mehrfachen Instanzen stapeln. `sud_brodeln_loop` läuft nur während des Brauens.
- Die sechs Loops haben periodische Grundtexturen und geschlossene Nahtstellen. OGG und MP3 wurden nach Decodierung geprüft. MP3 benötigt gapless Decodierung mit Xing/LAME-Delay-Information; für Schleifen OGG bevorzugen. Schleifen-Dauer meint decodierte Nutzsamples, MP3-Container können Codec-Padding enthalten.
- `s5_uhr_warten_tick` dauert genau 1 s und ist kein Loop. Der Einbau löst ihn während der 20-s-Pause einmal pro Sekunde aus und stoppt den Zeitgeber beim Abbruch.
- Sonnenaufgang dauert 3,9 s: die Beschreibung „4 s“ wird knapp unterschritten, um die verbindliche Einzelklang-Grenze unter vier Sekunden einzuhalten.
- Alle Rituale sind solo: Nur die aktive Figur löst Klänge aus. Koop-Zuschauer dürfen dieselben Ereignisse nicht doppelt auslösen. Echo-Stille gilt für den Ritualmix; Split-Screen-/Mehrgeräte-Routing entscheidet der Einbau.

## Ereignis → neue Klang-ID

| Ereignis / Klang | ID | Varianten | Dauer (s) | Gruppe | Loop |
|---|---|---:|---:|---|---|
| Ritualregel gebrochen: trockener Riss, danach Stille | `s4r_regel_gebrochen` | 1 | 0.65 | s4r | nein |
| Wächter erscheint am Standort: Kalk rieselt, schwere Tür bewegt sich | `s4r_waechter_erscheint_welt` | 1 | 2.8 | s4r | nein |
| Wächter noch immun: dumpfes Abprallen | `s4r_waechter_immun` | 1 | 0.55 | s4r | nein |
| Ritualbedingung erfüllt: kurzer leiser Siegelton | `s4r_bedingung_erfuellt` | 1 | 0.7 | s4r | nein |
| Laterne aufgestellt: Eisenpfahl trifft Erde | `s4la_laterne_aufstellen` | 1 | 0.8 | s4r | nein |
| Nachfülltaste gehalten: gleichmäßiges Ölgluckern | `s4la_nachfuellen_loop` | 1 | 2 | s4r | ja |
| Ölbehälter voll: Flamme springt auf | `s4la_nachfuellen_voll` | 1 | 0.65 | s4r | nein |
| Nachfülltaste losgelassen: Ölfluss bricht ab | `s4la_nachfuellen_abbruch` | 1 | 0.4 | s4r | nein |
| Monster trifft Laterne: kurzes Glasklirren | `s4la_laterne_angegriffen` | 2 | 0.65 | s4r | nein |
| Laterne erlischt: Flamme erstickt | `s4la_laterne_aus` | 1 | 0.7 | s4r | nein |
| Licht trifft Monster: Schatten zischt weich | `s4la_monster_zischt` | 3 | 0.7 | s4r | nein |
| Licht besiegt Monster: trockener Schattenzerfall | `s4la_monster_zerfall` | 1 | 1.2 | s4r | nein |
| Spieler zurückgestoßen: dumpfer Treffer und Sohlenrutschen | `s4la_rueckstoss` | 1 | 0.8 | s4r | nein |
| Ritualnacht aktiv: Wind, fernes Scharren, Flammen | `s4la_amb_nacht` | 1 | 8 | s4r | ja |
| Ritual dauert an: tiefer langsam einblendbarer Puls | `s4la_unruhe_puls` | 1 | 2 | s4r | ja |
| Drei Laternen ermöglichen Sonnenaufgang: drei Töne vereinigen sich, ferner Vogel | `s4la_sonnenaufgang` | 1 | 3.9 | s4r | nein |
| Neue Kreatur markiert: gespannter Faden, hoher weicher Ton | `s4fa_markieren` | 1 | 0.8 | s4r | nein |
| Schlaf bestätigt: Atem und sich schließende Fäden | `s4fa_einschlafen` | 1 | 2.4 | s4r | nein |
| Traum betreten: gedämpfte Atmosphäre, rückwärts anschwellende Glocke | `s4fa_traum_amb` | 1 | 8 | s4r | ja |
| Traum verlassen: Atem und sich lösende Spannung | `s4fa_erwachen` | 1 | 1.4 | s4r | nein |
| Heilversuch im Traum abgewiesen: leiser Fadenriss | `s4fa_heilung_versagt` | 1 | 0.5 | s4r | nein |
| Zivilgestalt angenommen: Porzellan abgelegt, Stoff raschelt | `s4ma_verwandeln` | 1 | 1.5 | s4r | nein |
| Herausforderung ausgesprochen: Handschuh fällt auf Stein | `s4ma_handschuh` | 1 | 0.7 | s4r | nein |
| Ziviler Fausttreffer: bloßer dumpfer Schlag ohne Magie | `s4ma_faust` | 3 | 0.45 | s4r | nein |
| Fähigkeitsversuch gesperrt: Maske bekommt einen Sprung | `s4ma_gabe_verboten` | 1 | 0.55 | s4r | nein |
| Besiegter verschont: Ausatmen und weggehende Schritte | `s4ma_verschonen` | 1 | 1.8 | s4r | nein |
| Dauerhafter Zweifel gesetzt: stockender, abbrechender Ton | `s4ma_zweifel` | 1 | 0.7 | s4r | nein |
| Taubheit beginnt: gefiltertes Rauschen verliert alle Höhen und verstummt | `s4ec_taub_an` | 1 | 1.5 | s4r | nein |
| Taubheit endet: sanft zurückkehrende Welt ohne Pfeifton | `s4ec_taub_aus` | 1 | 0.9 | s4r | nein |
| Ritualrezept freigeschaltet: Kessel klingt wie eine Glocke | `s4ke_rezept_frei` | 1 | 1.1 | s4r | nein |
| Einer der fünf Ritualtränke fertig: Blase und heller Dampf | `s4ke_ritualtrank_gebraut` | 1 | 1.1 | s4r | nein |
| Ritualtrank 1–5 getrunken: jeweils eigenes Schlucken und Zischen | `s4ke_trinken_reihe` | 5 | 0.85 | s4r | nein |
| Explosiver Ritualtrank trifft: kompakter trockener Druckstoß | `s4ke_wurf_explosion` | 1 | 1.2 | s4r | nein |
| Frosttrank trifft: feines Eis knackt | `s4ke_wurf_frost` | 1 | 0.9 | s4r | nein |
| Gluttrank trifft: weiches Zischen und Brutzeln | `s4ke_wurf_glut` | 1 | 1.2 | s4r | nein |
| Normalangriff gesperrt: dumpfer Kesselrand statt Treffer | `s4ke_angriff_verboten` | 1 | 0.6 | s4r | nein |
| Überlast bewegt sich: Metall knarrt unter Gewicht | `s4ei_last_aechzt` | 2 | 1.6 | s4r | nein |
| Eine der ersten fünf Runden überstanden: Niet schlägt ein | `s4ei_runde_ueberstanden` | 1 | 0.6 | s4r | nein |
| Runde 6 beginnt: Nietring springt, Wächter verwundbar | `s4ei_waechter_frei` | 1 | 1 | s4r | nein |
| Ausweichversuch gesperrt: kurze gespannte Lastkette | `s4ei_ausweichen_verboten` | 1 | 0.5 | s4r | nein |
| Besitz abgelegt und versiegelt: Schnur und Bleiplombe | `s4wa_besitz_versiegeln` | 1 | 1.2 | s4r | nein |
| Zirkelware gekauft: Münzen auf Waagschale | `s4wa_kauf` | 3 | 0.85 | s4r | nein |
| Kapital reicht nicht: leerer Beutel raschelt | `s4wa_kapital_knapp` | 1 | 0.65 | s4r | nein |
| Alle Waren gekauft: Waage pendelt ein | `s4wa_alles_gekauft` | 1 | 1.4 | s4r | nein |
| Moorfähigkeit zersetzt einen geeigneten Gegenstand: feuchte Blasen | `s4mo_zersetzen` | 3 | 1.5 | s4r | nein |
| Fünf Überreste zum Relikt geformt: Torf pressen und trockenes Knochenknacken | `s4mo_relikt_formen` | 1 | 3 | s4r | nein |
| Pflichtflasche dieser Runde getrunken: dunkles Gluckern | `s4mo_moorwasser_trinken` | 2 | 0.9 | s4r | nein |
| Moorwasser fehlt: leere Glasflasche wird gekippt | `s4mo_moorwasser_leer` | 1 | 0.65 | s4r | nein |
| Perfektes Ausweichen: Tick setzt aus, heller Schlag | `s4uh_perfekt` | 1 | 0.75 | s4r | nein |
| Ausweichfehler gezählt: Zahnrad bricht | `s4uh_fehler` | 1 | 0.6 | s4r | nein |
| Pflichtangriff eines Monsters gezählt: kurzer Tick | `s4uh_monster_angriff_gezaehlt` | 1 | 0.25 | s4r | nein |
| Schattensteuerung beginnt: Stoff löst sich vom Boden, Unterdruck | `schatten_trennen` | 1 | 1.8 | schatten | nein |
| Schatten kehrt in den Körper zurück | `schatten_rueckkehr` | 1 | 1.4 | schatten | nein |
| Schatten stirbt, Körper überlebt: Rauch verweht | `schatten_verloren` | 1 | 1.5 | schatten | nein |
| Schatten bewegt sich: sehr leises Stoffstreifen | `schatten_schritt` | 2 | 0.45 | schatten | nein |
| Kostenlose Schattenattacke: dunkler Luftschnitt | `schatten_attacke` | 3 | 0.7 | schatten | nein |
| Schatten verliert Leben: gedämpfter Luftstoß | `schatten_treffer` | 1 | 0.7 | schatten | nein |
| Rundenbeginn: genau eine eigene Fähigkeit ausgelost, dunkler Würfelklang | `schatten_auslosen` | 1 | 0.9 | schatten | nein |
| Heilversuch des Schattens gesperrt: kurzer matter Luftverschluss | `schatten_heilung_versagt` | 1 | 0.55 | schatten | nein |
| Schattensteuerung aktiv: leiser tiefer Luftdruck, kein Infraschall | `schatten_amb` | 1 | 8 | schatten | ja |
| Zutat eingelegt: Variante 1 Pulver, 2 Kraut, 3 Flüssigkeit | `sud_zutat` | 3 | 0.9 | rituale56 | nein |
| Freier Sud braut: gleichmäßiges Brodeln | `sud_brodeln_loop` | 1 | 4 | rituale56 | ja |
| Sud gelungen: heller Dampfstoß | `sud_gelungen` | 1 | 1.1 | rituale56 | nein |
| Sud misslungen: dumpfe Blasen und trockene Asche | `sud_pfusch` | 1 | 1.2 | rituale56 | nein |
| Sud abgefüllt: Flüssigkeit fließt in Glas | `sud_abfuellen` | 1 | 1.4 | rituale56 | nein |
| Sudwirkung endet: leises Ausatmen | `sud_wirkung_endet` | 1 | 0.8 | rituale56 | nein |
| Laternenbestie erscheint: tiefe Resonanz mit Glas, keine Stimme | `s5_laternenbestie_ruf` | 1 | 1.6 | rituale56 | nein |
| Laternenbestie besiegt: Glas klingt aus | `s5_laternenbestie_fall` | 1 | 1.6 | rituale56 | nein |
| Kokon entsteht: Fäden wickeln sich eng | `s5_kokon_wickeln` | 1 | 1.7 | rituale56 | nein |
| Kokon öffnet sich: Fasern platzen trocken | `s5_kokon_platzt` | 1 | 0.8 | rituale56 | nein |
| Gesicht genommen: weiches Porzellanstreifen | `s5_gesicht_nehmen` | 1 | 1.1 | rituale56 | nein |
| Misstrauen wächst: wortloses gedämpftes Raunen | `s5_misstrauen` | 1 | 1.4 | rituale56 | nein |
| Diebstahl gelungen: Münzen fallen in Stofftasche | `s5_diebstahl` | 2 | 0.8 | rituale56 | nein |
| Erinnerung entnommen: Atemhauch im Glas | `s5_erinnerung_ziehen` | 1 | 1.4 | rituale56 | nein |
| Erinnerung verweigert: Glas wird gedämpft | `s5_erinnerung_verweigert` | 1 | 0.65 | rituale56 | nein |
| Wartepause: einzelner Taschenuhr-Tick, nicht automatisch wiederholen | `s5_uhr_warten_tick` | 1 | 1 | rituale56 | nein |
| Seq-5-Prüfung gescheitert: gedämpfter absteigender Zweiton | `s5_pruefung_gescheitert` | 1 | 0.8 | rituale56 | nein |
| Seq-6-Probe startet: kurzer trockener Auftakt | `probe_start` | 1 | 0.6 | rituale56 | nein |
| Seq-6-Probe bestanden: warmer Zweiton | `probe_bestanden` | 1 | 0.8 | rituale56 | nein |
| Seq-6-Fehlversuch: kurzer matter Impuls | `probe_fehlversuch` | 1 | 0.6 | rituale56 | nein |
| Fadenprobe: zwei Fäden verbinden sich | `probe_faden_verbinden` | 1 | 0.85 | rituale56 | nein |
| Echoprobe: synthetische Nebelstimme ohne Worte | `probe_echo_stimme` | 3 | 1.3 | rituale56 | nein |
| Echoprobe: kurze gedämpfte Antwort | `probe_echo_nachhall` | 1 | 1.6 | rituale56 | nein |
| Moorprobe: Namensspur löst sich auf | `probe_moor_name_weg` | 1 | 1.2 | rituale56 | nein |
| Uhrprobe: zwei Schläge, dann Stille | `probe_uhr_puls` | 1 | 1.3 | rituale56 | nein |
| Betrug angeprangert: Faust auf Holztisch | `waage_anprangern` | 1 | 0.65 | rituale56 | nein |
| Betrug belegt: Wachsstempel und leises Raunen | `waage_betrug_aufgedeckt` | 1 | 1.5 | rituale56 | nein |
| Falsch beschuldigt: Stuhl rückt, danach Stille | `waage_falsch_beschuldigt` | 1 | 1.1 | rituale56 | nein |
| Dietrich angesetzt: unterschiedlich schnelle Metallstifte | `schloss_dietrich` | 3 | 0.8 | rituale56 | nein |
| Schloss geöffnet: Stift und Riegel lösen sich | `schloss_auf` | 1 | 0.65 | rituale56 | nein |
| Schloss aufgebrochen: Metall hebelt Holz auf | `schloss_brecheisen` | 1 | 1.2 | rituale56 | nein |
| Schlossversuch misslungen: Stift springt zurück | `schloss_misslungen` | 1 | 0.7 | rituale56 | nein |

## Vorhandene Klänge wiederverwenden

| Ereignis | Vorhandene ID |
|---|---|
| Allgemeines Ritual beginnt / gelingt / scheitert | `ritual_start` / `ritual_erfolg` / `ritual_fehlschlag` |
| Kerze entzünden / gewöhnliche Laterne anschalten | `ritual_kerze` / `laterne_an` |
| Bereits vorhandener Lichtangriff | `licht_angriff` |
| Gewöhnlichen Trank brauen, außerhalb der neuen freien Sudschritte | `trank_brauen` |
| Normales Ausweichen außerhalb Echo | `ausweichen` |
| Gewöhnlicher Giftstatus | `gift` |
| Halbgott-Ritual eröffnen / Siegel setzen | `hg_ritual_beginn` / `hg_ritual_siegel` |
| Wächter-Kalk / Schlag / Zerfall im Kampf | `hg_schwellenwaechter_kalk` / `hg_schwellenwaechter_schlag` / `hg_schwellenwaechter_zerfall` |
| Bestehende Kreaturstimmen | `hg_kreatur_stimme` mit Variante 1–3 (Dateien `_1` bis `_3`) |

Spezialklang und allgemeiner Klang werden nicht automatisch gleichzeitig gespielt: z. B. `s4r_regel_gebrochen` für den Regelbruch, `ritual_fehlschlag` erst beim bestätigten Abbruch. Während Echo sind ausnahmslos auch diese Wiederverwendungen stumm.

## Musik und Zuordnung

Alle vier Dateien verwenden `nebel-musik-1` und ausschließlich vorhandene Instrumente aus `instrumente.json`. Einmaliges Intro, danach mindestens drei Abschnitte. Sie sind als Stückobjekt direkt mit `MusicSynth.lade(score)` nutzbar. Die Registrierung im zentralen Musikmanifest/Director und Ereignisrouting übernimmt der Einbau; fremde Manifeste bleiben unverändert. Der globale Musikprüfer verlangt zentrale Registrierung, deshalb wird die erlaubte lokale Prüfung verwendet.

| Ereignis | Stück | Erstlauf / Intro / Loop (s) |
|---|---|---|
| Laternenritual aktiv | `s4r_laternennacht` | 112 / 16 / 96 |
| Traumkampf des Fadens | `s4r_traum` | 90 / 10 / 80 |
| Schattensteuerung | `s4r_schattenseite` | 129,23 / 18,46 / 110,77 |
| Schwellenwächter aller Pfade außer Echo | `s4r_waechter` | 24,38 / 1,88 / 22,50 |
| Echo-Ritual einschließlich Wächter | kein Stück, vollständige Stille | – |
| Allgemeine Ritualvorbereitung | vorhandenes `ritual` | bestehend |
| Grenzwächter außerhalb dieser Seq-4-Prüfungen | vorhandenes `hg_grenzwaechter` | bestehend |

Laternen-Spuren: `voll` = Celesta-Oberstimme, `halb` = mittlere Streicherstimme, `rest` = tiefer Kontrabass, `puls` = langsame Pauke. Für N = 5 oder 6 Laternen und L brennende Laternen: `voll` mit Faktor L/N, `halb` mit (L/N)², `rest` mit L/N multiplizieren; `puls` unverändert. Dadurch wird die Melodie bei **jeder** erloschenen Laterne dünner. Auf die notierte Spurlautstärke anwenden, Änderungen über 250 ms blenden; nach Auffüllen wieder anheben. Die benannten Spuren allein implementieren noch keine Laufzeit-Regelung.

`s4r_traum` übernimmt Muster, Noten, Dauern, Abschnittsgraph und Transpositionen exakt aus `ritual.json`, aber bei 48 statt 66 BPM; Glocke und Drone eine Oktave tiefer, gedämpft. `s4r_waechter` übernimmt die ersten vier Takte jedes Grenzwächter-Abschnitts, bei 128 statt 112 BPM, mit dichterer Pauke und weniger Hall. Schattenseite enthält ausschließlich Kontrabass, Celesta und lange Pausen.

## Reproduktion und Prüfung

```sh
python docs/story/sfx4/generieren.py
node docs/story/sfx4/komponieren.mjs
node docs/story/sfx4/pruefen.mjs
```

Synthese benötigt Python 3, NumPy, SciPy und FFmpeg mit libvorbis/libmp3lame. Kurze Vorbis-Einzelklänge können beim Decodieren bis zu 30 ms Blocknachlauf haben; die strikte 4-s-Grenze wird dennoch geprüft. Loops werden auf ±4 ms Nutzlänge geprüft. Die Node-Prüfer benötigen **keine npm-Pakete**, aber FFmpeg/ffprobe zur echten Decodierung. `pruefen_musik.mjs` kann separat ohne FFmpeg ausgeführt werden. Der Hauptprüfer gleicht die 92 IDs gegen die DS-Aufgabendatei ab, prüft Varianten, beide Codecs, Laufzeiten, Pegel, Nicht-Stille, unterschiedliche Wellenformen, Loop-Nähte und die vier Partituren mit dem echten Synth-Parser. `validation.json` enthält Messwerte und SHA-256 für jede Datei.

Die Prüfung ist technisch; eine Hörabnahme auf Kopfhörern/Android und der fertige Spielmix sind nicht durchgeführt. Kein automatischer Test kann garantieren, dass jeder Klang im Kontext musikalisch oder dramaturgisch passend wirkt.

## Prüfausgabe

```text
PASS: 92 required IDs, 117 variants, 234 decoded OGG/MP3 files, 12 loop files; complete task coverage.
PASS: mono 44100 Hz; limits, manifest duration, variant counts, levels, non-silence, unique decoded audio, codec signatures.
PASS: RMS min 0.014335, peak max 0.592021, seam max 0.003831, DC max 0.000307; 3619528 bytes.
s4r_laternennacht: 60 BPM, total 112.00 s, intro 16.00 s, loop 96.00 s, 128 events
s4r_traum: 48 BPM, total 90.00 s, intro 10.00 s, loop 80.00 s, 68 events
s4r_schattenseite: 52 BPM, total 129.23 s, intro 18.46 s, loop 110.77 s, 28 events
s4r_waechter: 128 BPM, total 24.38 s, intro 1.88 s, loop 22.50 s, 99 events
PASS: 4 scores; parser, instruments, patterns, loops, stems, exact ritual derivation and shorter guardian variation.
```
