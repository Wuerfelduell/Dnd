# Codex-Paket DS: Klang der neuen Rituale (Seq 4, Seq 5, Seq 6) und vier Musikstücke

**Schreibt nach:** `public/audio/sfx/`, `public/audio/manifest-sfx4.json`, `public/audio/musik/` (Dateien `s4r_*.json`) und `docs/story/sfx4/README.md`

Die Rituale der Sequenzen 6, 5 und 4 sind neu (Eckdaten unten) und klingen bisher nach nichts oder nach geliehenen Klängen. Dieses Paket liefert die fehlenden Soundeffekte und vier Notendaten-Stücke. Grafik machen DN, DO, DP, DQ; Texte DR. Parallel startbar.

## 0. Regeln
Diese Datei ist in sich vollständig. Keinen Spielcode ändern; die Zuordnung zu Ereignissen steht im README, der Einbau trägt sie in `src/core/sounds.js` ein.

**Soundeffekte** wie Paket DB (`docs/art/codex_DB_soundeffekte3.md`, nur lesen) und `public/audio/manifest-sfx3.json` (Felder `group`, `volume`, `duration`, `note`; Formate ogg und mp3; jede Datei unter 4 Sekunden, Ambiente-Schleifen bis 8 Sekunden nahtlos). Klänge synthetisch oder aus freien, eigenen Aufnahmen; keine Dateien mit fremden Rechten. IDs klein, mit Präfix der Gruppe. Lautstärken zwischen 0,2 und 0,7 (Ambiente 0,15 bis 0,35). Klangbild: trocken, nah, wenig Hall. Nichts Blutiges, keine Schreie.

**Musik** gibt es nur als Notendaten im Format `nebel-musik-1` (siehe `public/audio/musik/ritual.json`, `hg_grenzwaechter.json`, `instrumente.json`, nur lesen; nur Instrumente, die dort vorkommen). Prüfen mit dem vorhandenen Prüfskript unter `tools/` oder eigenem `docs/story/sfx4/pruefen_musik.mjs`.

**Schon vorhanden, nicht neu machen:** `ritual_start`, `ritual_erfolg`, `ritual_fehlschlag`, `ritual_kerze`, `laterne_an`, `licht_angriff`, `trank_brauen`, `ausweichen`, `gift`, `hg_ritual_beginn`, `hg_ritual_siegel`, `hg_schwellenwaechter_kalk`, `hg_schwellenwaechter_schlag`, `hg_schwellenwaechter_zerfall`, `hg_kreatur_stimme_1..3`. Musik `ritual.json`, `hg_grenzwaechter.json`. Benutze sie im README, wo sie passen.

## Eckdaten „Seq-4-Rituale“ (gleich in DN, DO, DP, DR, DS)

Vor dem Trank der **Sequenz 4** (Halbgott, siehe Paket CO/CP) legt jeder Pfad ein eigenes, schweres Ritual ab. Die Regeln hat Seb festgelegt; die Spiellogik baut ein eigener Code-Thread parallel. Diese Pakete liefern nur Grafik, Texte und Klang. Für alle zehn Rituale gilt:

- **Ort frei:** kein festes Ritualfeld, keine Bindung an Fälle oder Städte (es gibt keine Rückreise in frühere Städte).
- **Immer solo:** im Koop macht nur der Spieler mit, der aufsteigt; der andere schaut zu und greift nicht ein. Darum braucht jede Spielerfigur (Spieler 1 `player`, Koop `p2a`, `p2b`) die Ritualbilder, die den Körper zeigen.
- **Schwellenwächter als Abschlussprüfung:** Jedes Ritual endet mit dem Schwellenwächter. Er existiert schon als Kampfsprite aus Paket CO (`public/sprites/battle/hg_schwellenwaechter.png`, 128x96, mit den zehn Pfadsiegeln `battle/hg_siegel.png`, Kulisse `battle/bg_hg_schwelle.png`). **Nicht neu zeichnen**, nur die unten verlangten Zusätze.
- **Fehlschlag** kostet Verdauung (−20 bis −25 %), das Ritual darf wiederholt werden. Gelingt es, folgt der Seq-4-Trank (Trink-Bilder und Aufstieg gibt es schon aus CO).

| `pfad` | Seq 4 | Ritual (Arbeitstitel) | Kern der Prüfung | Präfix |
|---|---|---|---|---|
| `laterne` | Dochtgezeichneter | Die Nacht der Laternen | Echtzeit im Monstergebiet **ohne Kampfbildschirm**: 5–6 Laternen gegen ≥15 Monster halten, Nachfüllen durch Halten einer Taste (1–2 s), Monster sterben nur an Licht, der Spieler strahlt schwach; Wächter am Ende nur durch „Sonnenaufgang“ zwischen drei brennenden Laternen | `s4la_` |
| `faden` | Nahtträger | Das Netz der fünf Träume | 5 verschiedene Kreaturen aus 5 Gebieten mit Schicksalsfäden markieren, schlafen gehen, Traumkampf gegen alle 5 gleichzeitig, keine Heilung im Traum | `s4fa_` |
| `maske` | Gesichtsvermieter | Das Gesicht ohne Gabe | Als gewöhnlicher Zivilist einen Beyonder (Seq 5 oder höher) herausfordern und ohne jede Fähigkeit besiegen, ihn verschonen; er zweifelt danach dauerhaft an seinen Kräften | `s4ma_` |
| `echo` | Stilleverwahrer | Die Welt ohne Klang | Völlige Taubheit: 3 Gegner + Wächter ohne Angriffskreise und ohne Warnklänge; Ausweichen/Parieren ohne Hinweise | `s4ec_` |
| `kessel` | Rückstandsbrauer | Die fünffache Essenz | 5 neue Ritual-Tränke brauen und nacheinander trinken; Wächter nur mit Trankwirkungen besiegen (Gift, Säure, Explosion, Würfe) | `s4ke_` |
| `eisen` | Lastnieter | Die Last des Halbgottes | ≥5 Artefakte + Traglast ≥200 %, ohne Rüstung/Helm/Amulett; Wächter erscheint am Standort; Ausweichen verboten; Runde 1–5 überstehen, Wächter stirbt erst ab Runde 6 | `s4ei_` |
| `schluessel` | Schwellenlücke | Der Schatten ohne Körper | **Neue Mechanik Schattensteuerung:** Schatten vom Körper trennen, der Körper bleibt regungslos stehen; Spieler steuert den Schatten (40 % Leben, keine Ausrüstung, keine Heilung, kein Parieren); Standardangriff „Schattenattacke“ + jede Runde eine zufällige eigene Fähigkeit; 2 Gegner, dann Wächter | `s4sc_` |
| `sq_waage` | Pfandkörper | Der Preis der Macht | Gesamten Besitz ablegen, mit selbst gewähltem Kapital einen geheimen Zirkel betreten, **alle** Waren kaufen; Wächter nur mit dort Gekauftem besiegen | `s4wa_` |
| `sq_moor` | Schichtträger | Das Relikt des Verfalls | 5 okkulte/seltene Gegenstände nur mit Moor-Fähigkeiten zersetzen, aus den Resten ein neues Ritual-Artefakt formen (zufällige Eigenschaften), Wächter damit besiegen, jede Runde eine Flasche Moorwasser trinken | `s4mo_` |
| `sq_uhr` | Zwischentakter | Der perfekte Augenblick | 3 Monster, jedes greift mindestens einmal an, **nur perfekte Ausweichmanöver** (0 Fehler); danach Wächter mit höchstens 3 verfehlten Ausweichmanövern; Parieren verboten | `s4uh_` |

Die Arbeitstitel von Laterne, Faden und Maske sind Vorschläge (Seb hat sie nicht benannt); die übrigen sieben Namen sind Sebs und verbindlich. Gemeinsames Präfix für alles, was alle Rituale teilen: `s4r_`. Flag-Vorschläge für den Einbau: `s4r_<pfad>_aktiv`, `s4r_<pfad>_done`, `s4r_<pfad>_fehlschlag` (Spieler 2 mit `p2_`-Präfix).

## 1. Gruppe `s4r` – Seq-4-Rituale (ca. 40)
- Gemeinsam: `s4r_regel_gebrochen` (trockener Riss, dann Stille), `s4r_waechter_erscheint_welt` (Kalk rieselt, schwere Tür, für das Erscheinen auf der Karte), `s4r_waechter_immun` (dumpfes Abprallen), `s4r_bedingung_erfuellt` (leiser Siegelklang, kurz).
- Laterne: `s4la_laterne_aufstellen` (Eisenpfahl in Erde), `s4la_nachfuellen_loop` (Öl gluckert, 2 s nahtlos, läuft beim Halten), `s4la_nachfuellen_voll` (Flamme springt auf), `s4la_nachfuellen_abbruch`, `s4la_laterne_angegriffen` (Glas klirrt, 2 Varianten), `s4la_laterne_aus` (Flamme erstickt), `s4la_monster_zischt` (Licht frisst Schatten, 3 Varianten), `s4la_monster_zerfall`, `s4la_rueckstoss` (Treffer, Spieler rutscht), `s4la_amb_nacht` (Ambiente: Wind, fernes Scharren, Flammen, 8 s Schleife), `s4la_unruhe_puls` (tiefer Puls, wird mit der Dauer eingeblendet), `s4la_sonnenaufgang` (4 s: drei Töne finden zueinander, warmer Akkord, Vogel ganz fern).
- Faden: `s4fa_markieren` (Faden spannt sich, hoher Ton), `s4fa_einschlafen` (Atem, Fäden ziehen sich zu), `s4fa_traum_amb` (Ambiente, gedämpft, rückwärts klingende Glocke, 8 s), `s4fa_erwachen`, `s4fa_heilung_versagt` (Faden reißt leise).
- Maske: `s4ma_verwandeln` (Porzellan legt sich ab, Stoff raschelt), `s4ma_handschuh` (Lederhandschuh fällt auf Stein), `s4ma_faust` (bloßer Schlag, 3 Varianten, ohne Effektklang), `s4ma_gabe_verboten` (Maske springt), `s4ma_verschonen` (Atem, Schritte weg), `s4ma_zweifel` (Ton, der abbricht).
- Echo: `s4ec_taub_an` (alles wird in 1,5 s zu Watte, dann gar nichts mehr), `s4ec_taub_aus` (Welt kommt zurück, Tinnitus-frei, kurz). **Während der Taubheit spielt das Spiel keine Klänge**; im README festhalten, dass auch Musik und Treffer stumm bleiben.
- Kessel: `s4ke_rezept_frei` (Kessel klingt wie eine Glocke), `s4ke_ritualtrank_gebraut`, `s4ke_trinken_reihe` (5 Varianten, je Trank ein anderes Schlucken/Zischen), `s4ke_wurf_explosion`, `s4ke_wurf_frost` (Eis knackt), `s4ke_wurf_glut` (Zischen, Brutzeln weich), `s4ke_angriff_verboten`.
- Eisen: `s4ei_last_aechzt` (Metall knarrt unter Gewicht, 2 Varianten), `s4ei_runde_ueberstanden` (Niet schlägt ein), `s4ei_waechter_frei` (Nietring springt, Runde 6), `s4ei_ausweichen_verboten`.
- Schlüssel: siehe Gruppe `schatten`.
- Waage: `s4wa_besitz_versiegeln` (Plombe, Schnur, Blei), `s4wa_kauf` (Münzen auf Waagschale, 3 Varianten), `s4wa_kapital_knapp` (leerer Beutel), `s4wa_alles_gekauft` (Waage pendelt ein).
- Moor: `s4mo_zersetzen` (Schmatzen, Blasen, 3 Varianten), `s4mo_relikt_formen` (Torf wird gepresst, Knochen knackt, 3 s), `s4mo_moorwasser_trinken` (2 Varianten), `s4mo_moorwasser_leer` (leere Flasche).
- Uhr: `s4uh_perfekt` (Zeit hält an: Tick aussetzen, heller Schlag), `s4uh_fehler` (Zahnrad bricht), `s4uh_monster_angriff_gezaehlt` (kurzer Tick).

## 2. Gruppe `schatten` – Schattensteuerung des Schlüssels (10)
`schatten_trennen` (Stoff, der sich vom Boden löst, Unterdruck), `schatten_rueckkehr`, `schatten_verloren` (Rauch verweht), `schatten_schritt` (fast lautlos, 2 Varianten), `schatten_attacke` (Luft wird zerschnitten, dunkel, 3 Varianten), `schatten_treffer`, `schatten_auslosen` (Würfelklang aus Schatten, für die zufällige Fähigkeit), `schatten_heilung_versagt`, `schatten_amb` (Ambiente der Schattenseite, Druck auf den Ohren, 8 s).

## 3. Gruppe `rituale56` – Seq 5 und Seq 6 (ca. 30)
- Braukessel: `sud_zutat` (3 Varianten: Pulver, Kraut, Flüssigkeit), `sud_brodeln_loop` (4 s), `sud_gelungen` (heller Dampfstoß), `sud_pfusch` (dumpfes Blubbern, Asche), `sud_abfuellen`, `sud_wirkung_endet` (leises Ausatmen).
- Seq 5: `s5_laternenbestie_ruf`, `s5_laternenbestie_fall` (Glas klingt aus), `s5_kokon_wickeln`, `s5_kokon_platzt`, `s5_gesicht_nehmen` (Porzellan), `s5_misstrauen` (Raunen), `s5_diebstahl` (Münzen klingeln in die Tasche, 2 Varianten), `s5_erinnerung_ziehen` (Atemhauch in Glas), `s5_erinnerung_verweigert`, `s5_uhr_warten_tick` (Taschenuhr, laut, 1 s, für die 20-Sekunden-Pause), `s5_pruefung_gescheitert`.
- Seq-6-Proben: `probe_start`, `probe_bestanden`, `probe_fehlversuch`, `probe_faden_verbinden`, `probe_echo_stimme` (Nebelstimme ohne Worte, 3 Varianten), `probe_echo_nachhall`, `probe_moor_name_weg`, `probe_uhr_puls` (zwei Schläge, dann Stille).
- Waage-Betrug: `waage_anprangern` (Faust auf Tisch), `waage_betrug_aufgedeckt` (Wachsstempel, Raunen), `waage_falsch_beschuldigt` (Stuhl rückt, Stille).
- Schlösser: `schloss_dietrich` (3 Varianten), `schloss_auf`, `schloss_brecheisen`, `schloss_misslungen`.

## 4. Musik (4 Stücke, Notendaten)
- `s4r_laternennacht`: Echtzeit-Ritual der Laterne, Loop, gespannt, zählt sich mit langsamen Pauke-Schlägen voran, die Melodie wird mit jeder erloschenen Laterne dünner (Spuren `voll`, `halb`, `rest`, die der Einbau ausblendet; im README zuordnen).
- `s4r_traum`: Traumkampf des Fadens, Loop, verzerrte Fassung von `ritual.json` (gleiche Töne, andere Lage, langsamer).
- `s4r_schattenseite`: Schattensteuerung, Loop, fast nur Kontrabass und Celesta, Pausen.
- `s4r_waechter`: Kampf gegen den Schwellenwächter in allen Seq-4-Ritualen außer Echo (dort Stille), Variante von `hg_grenzwaechter.json`, kürzer und härter; eine Fassung für alle Pfade.

## 5. Abgabe
Dateien, `manifest-sfx4.json`, Musikstücke, `docs/story/sfx4/README.md` mit Zuordnung Ereignis → ID (auch für die vorhandenen Klänge, die wiederverwendet werden), Prüfskript (Node ohne Pakete: jede ID hat ogg und mp3, Dauer unter der Grenze, keine Stille-Dateien; Musik im Format gültig), Pull Request mit Prüf-Ausgabe.
