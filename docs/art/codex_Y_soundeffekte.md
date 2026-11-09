# Codex-Paket Y: Soundeffekte

**Paket-Name:** `sfx` · **Deine Ordner:** `public/audio/sfx/`, `tools/audio/sfx/`, `docs/audio/README-sfx.md`, Manifest `public/audio/manifest-sfx.json`, Gerüst `src/core/Audio.js`

Das Spiel bekommt seine ersten Geräusche: Oberfläche, Schritte, Kampf, Okkultes, Polizei, Reisen. Die Musik macht ein anderes Paket (Z), hier nur kurze Effekte und ein paar kurze Geräusch-Schleifen.

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

### 0.5 Format für dieses Paket
- Mono, 44,1 kHz, OGG Qualität 3 bis 4, MP3 96 kbit/s. Die meisten Effekte unter 1,5 Sekunden.
- Gesamtgröße aller SFX zusammen (ogg + mp3) möglichst unter 6 MB.
- Wo „3 Varianten“ steht: drei leicht verschiedene Dateien `<id>_1`, `<id>_2`, `<id>_3` (das Spiel wählt zufällig, damit Schritte und Treffer nicht mechanisch klingen).

---

## 1. Oberfläche (Gruppe `ui`)
| ID | Beschreibung |
|---|---|
| `ui_klick` | kurzer, weicher Holzklick, wie ein Messingknopf |
| `ui_hover` | ganz leises Tick, kaum hörbar |
| `ui_oeffnen` | Ledermappe wird aufgeschlagen |
| `ui_schliessen` | Mappe zu, dumpfer |
| `ui_seite` | Papierseite umblättern (3 Varianten) |
| `ui_tab` | Registerkarte wechseln, Papier-Rascheln kurz |
| `ui_fehler` | gedämpftes, tiefes Doppel-Tock (Aktion nicht möglich) |
| `ui_bestaetigen` | zwei aufsteigende weiche Glockentöne |
| `ui_schreiben` | Bleistift kratzt kurz auf Papier (Notiz ins Notizbuch) |
| `ui_hinweis_neu` | Bleistift + leiser heller Glockenton (neuer Hinweis) |
| `ui_schlussfolgerung` | zwei Notizen werden verbunden: Fadenzupfen + tiefer warmer Akkord |
| `ui_quest_neu` | Stempel aufs Papier + kurzer Akkord |
| `ui_quest_fertig` | Stempel + aufsteigender Dreiklang, warm, nicht triumphal |
| `ui_geld` | Münzen klimpern (3 Varianten) |
| `ui_geld_viel` | Beutel mit Münzen wird abgestellt |
| `ui_item` | Gegenstand aufheben, Stoff-Rascheln + kleines Klicken |
| `ui_item_selten` | wie `ui_item`, mit gläsernem Schimmer danach |
| `ui_speichern` | Uhrwerk tickt zweimal |
| `ui_stufe` | Aufstieg einer Sequenz: tiefer Gong, darüber gläsernes Flirren (ca. 2,5 s) |
| `ui_dialog_tick` | Textausgabe Buchstabe für Buchstabe: sehr kurzer, leiser Schreibmaschinen-Tick (3 Varianten, tonal leicht verschieden) |
| `ui_karte` | Stadtkarte entfalten |
| `ui_tuer_gesperrt` | Klinke rüttelt an verschlossener Tür |

## 2. Schritte (Gruppe `schritte`, je 3 Varianten, je 120 bis 250 ms)
`schritt_pflaster`, `schritt_holz` (Bohlen, Stege), `schritt_schlick` (nasser Moorboden, schmatzend), `schritt_wasser` (flaches Wasser), `schritt_gras`, `schritt_teppich` (innen, gedämpft), `schritt_metall` (Gitter, Treppe), `schritt_kies`.

## 3. Welt (Gruppe `welt`)
| ID | Beschreibung |
|---|---|
| `tuer_auf` / `tuer_zu` | schwere Holztür mit Eisenbeschlag |
| `tuer_metall` | Gittertür (Zelle, Tor), quietscht kurz |
| `truhe_auf` | Holzkiste öffnen |
| `schublade` | Schublade aufziehen |
| `laterne_an` | Gaslaterne zündet: Zischen + weiches Puffen |
| `untersuchen` | kurzes Rascheln + ein leises „hm“-artiger tiefer Ton (ohne Stimme), Hinweis entdeckt |
| `ruhe_schlaf` | Ausruhen in der Koje: langes Ausatmen-artiges Rauschen, Uhr tickt, 3 s |
| `glocke_fern` | Kirchenglocke weit weg, ein Schlag mit langem Nachhall |
| `moewe` | Möwenschrei, synthetisch, nicht zu realistisch (2 Varianten) |
| `frosch` | Moorfrosch, zweimal quaken (2 Varianten) |
| `kraehe` | Krähe (2 Varianten) |
| `ratte` | Ratte huscht und fiept leise |
| `wasser_platsch` | etwas fällt ins Wasser |
| `zug_pfeife` | Dampfpfeife, lang, Ankunft in Wexmoor |
| `zug_fahrt` | **Schleife**, Rattern auf Schienen, 4 s |
| `ruder` | **Schleife**, Ruderschläge im Wasser, 3 s |
| `kutsche` | **Schleife**, Hufe auf Pflaster + Räder, 3 s |
| `leuchtfeuer` | tiefes Brummen + Knistern, das Licht des Leuchtturms, **Schleife** 4 s |

## 4. Polizei und Flucht (Gruppe `polizei`)
| ID | Beschreibung |
|---|---|
| `polizei_entdeckt` | das „!“ über dem Grauspäher: scharfer Akzent, Streicher-Stich synthetisch + Metallklang |
| `polizei_verdacht` | „?“: zwei fragende, tiefer werdende Töne |
| `polizei_pfeife` | Trillerpfeife, zweimal |
| `polizei_verloren` | Spannung löst sich: absteigender, leiser Ton |
| `fahndung_hoch` | Fahndungsstufe steigt: Trommelschlag + Pfeife fern |
| `zelle_zu` | Zellentür fällt ins Schloss, Schlüssel dreht, langer Hall |
| `verkleidung` | Kleidung wechseln: Stoffrascheln, Knöpfe |

## 5. Kampf (Gruppe `kampf`)
| ID | Beschreibung |
|---|---|
| `kampf_start` | Übergang in den Kampf: Glas zerspringt rückwärts + tiefer Schlag (ca. 1,2 s) |
| `treffer` | Treffer (3 Varianten), dumpf |
| `treffer_krit` | kritischer Treffer, mit hellem Klirren |
| `treffer_spieler` | Spieler wird getroffen, tiefer, kurz |
| `block` | Abwehr mit Stock/Arm, Holz auf Metall |
| `parade` | perfekte Parade: helles Metall-„Ting“ + Glanz |
| `ausweichen` | Luftzug (Whoosh) |
| `verfehlt` | Whoosh ins Leere, leiser |
| `ausholen` | **Warnsignal**, wenn ein Gegner zum Angriff ausholt: kurzer, gut hörbarer gläserner Ton. Muss sich von allem anderen abheben, weil Spieler darauf reagieren sollen |
| `heilen` | weicher aufsteigender Glockenschimmer |
| `trank` | Korken + Schlucken (ohne Stimme: Gluckern) |
| `verband` | Stoff wird gewickelt |
| `buff` | Kraft steigt: aufsteigendes Rauschen + Akkord |
| `debuff` | Schwäche: absteigender, verstimmter Ton |
| `nerven` | Nerven sinken: Herzschlag zweimal, dumpf |
| `gift` | Blubbern, kurz |
| `feuer` | Flammenstoß |
| `eis_salz` | Salz/Kristall knistert und splittert |
| `geist_angriff` | übernatürlicher Angriff: verzerrtes Flüstern ohne Worte + Hall |
| `glocke_angriff` | Glockenschlag als Waffe, dröhnend |
| `licht_angriff` | Lichtstrahl: hoher Ton, der anschwillt und abreißt |
| `gegner_tod` | Gegner fällt: Zusammensacken + verhallender Ton |
| `geist_tod` | übernatürlicher Gegner löst sich auf: Glas, aufsteigend, verweht |
| `boss_auftritt` | Boss erscheint: tiefer Drone + Glocke, 2,5 s |
| `sieg` | kurzer Sieg-Stich, 2 s, warm, nicht fanfarig |
| `niederlage` | absteigend, dunkel, 2,5 s |
| `flucht` | schnelle Schritte + Tür |

## 6. Okkultes (Gruppe `okkult`)
| ID | Beschreibung |
|---|---|
| `geistsicht_an` | Geistsicht einschalten: Welt kippt, Ton wird gläsern, Einatmen-Rauschen rückwärts |
| `geistsicht_aus` | umgekehrt, Rückkehr |
| `geistsicht_schleife` | **Schleife**, leises Schweben/Chor ohne Worte, 6 s, sehr leise |
| `ritual_kerze` | Kerze anzünden, kleines Puffen |
| `ritual_start` | tiefer Drone setzt ein, Glocken |
| `ritual_erfolg` | aufsteigender heller Akkord, gläsern |
| `ritual_fehlschlag` | Verzerrung, ein Riss, Stille danach |
| `artefakt_aufnehmen` | Flüstern ohne Worte + kurzes Kältegefühl (hoher Ton) |
| `artefakt_unruhe` | Unruhe steigt: tiefes Pochen, verstimmte Spieluhr kurz |
| `trank_brauen` | Brodeln + Glasklirren |
| `trank_verdauen` | Verdauung eines Pfad-Tranks: Herzschlag wird ruhiger, Akkord |
| `kontrolle_verlust` | Kontrollverlust: Riss, Flüstern schwillt an (2 s) |
| `auktion_hammer` | Hammer bei den geheimen Treffen, Holz auf Holz, Hall |

## 7. Kurze Atmo-Schleifen (Gruppe `atmo`, je 8 bis 12 s, nahtlos, sehr leise mischbar)
`atmo_regen`, `atmo_wind_nebel`, `atmo_kanal` (Wasser schwappt an Mauern), `atmo_moor` (Glucksen, Frösche fern, Insekten), `atmo_hafen` (Wellen, Holz knarrt, Tau), `atmo_taverne` (gedämpftes Murmeln ohne Wörter, Gläser), `atmo_fabrik` (Dampf, ferne Hämmer), `atmo_kirche` (großer Raum, Tropfen, Hall), `atmo_feuer` (Ofen im Torfkahn knistert).

---

## 8. Manifest `public/audio/manifest-sfx.json`
```json
{
  "batch": "sfx",
  "base": "audio/sfx/",
  "formats": ["ogg", "mp3"],
  "sounds": {
    "ui_klick": { "group": "ui", "volume": 0.6 },
    "schritt_pflaster": { "group": "schritte", "variants": 3, "volume": 0.35 },
    "zug_fahrt": { "group": "welt", "loop": true, "volume": 0.5 }
  }
}
```
Pro Sound: `group`, `volume` (0 bis 1, Vorschlag für die Mischung), optional `variants`, `loop`, `duration` (Sekunden), `note` (wofür im Spiel, 1 Satz).

## 9. Gerüst `src/core/Audio.js` (einzige Code-Datei, nicht einbinden)
Eine kleine Klasse als Grundgerüst, die **noch nirgends importiert wird**:
- `preload(scene)`: lädt alle Einträge aus `manifest-sfx.json` und, falls vorhanden, `manifest-musik.json` (gleiches Format mit `tracks`, siehe Paket Z) über `scene.load.audio(id, [ogg, mp3])`.
- `play(id, opts)`: spielt einen Effekt, wählt bei `variants` zufällig `_1.._n`, leichte Tonhöhen-Zufälligkeit ±3 %.
- `loop(id)` / `stopLoop(id, fadeMs)`.
- `music(id, fadeMs)`: Musik wechseln mit Überblendung, gleiche Musik nicht neu starten.
- Lautstärken `master`, `musik`, `effekte` (0 bis 1), gespeichert in `localStorage` unter `nebelakten_audio` (in try/catch).
- Erst nach der ersten Nutzer-Eingabe Ton starten (Browser-Autoplay-Regel), stumm schalten wenn das Fenster verborgen ist.
- Kurzer Kommentar oben, wie man es später in `WorldScene`/`CombatScene` einhängt. Keine anderen Dateien ändern.

## 10. Zusätzlich
- `tools/audio/sfx/generate.py`: das Generator-Skript, ein Eintrag pro Sound, Aufruf ohne Argumente erzeugt alles neu.
- `tools/audio/sfx/vorschau.html`: einfache Seite mit allen Sounds zum Durchklicken, nach Gruppen.
- `docs/audio/README-sfx.md`: wie man neu erzeugt, wie man einzelne Sounds ändert.
