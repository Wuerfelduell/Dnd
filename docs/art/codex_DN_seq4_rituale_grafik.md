# Codex-Paket DN: Seq-4-Rituale als Grafik, Teil 1: Laternen-Nacht, Fäden, Maske, Taubheit, Last, perfekter Augenblick, Wächter-Zusätze

**Batch-Name:** `seq4rit1` (Manifest: `public/sprites/manifest-seq4rit1.json`)

Die zehn Seq-4-Rituale (Eckdaten unten) brauchen Bilder, die es im Spiel noch nicht gibt. **Dieses Paket** liefert die Welt- und Kampfeffekte für sieben Rituale und die Zusätze zum Schwellenwächter. Die Schattensteuerung des Schlüssels macht das eigene Paket **DO**, alle Gegenstands-Icons (Kessel-Tränke, Moor-Relikt, Waage, Seq 5) macht **DP**. Alle drei dürfen parallel laufen. Halte das Paket klein: keine Varianten, die nicht unten stehen.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat. Halte das Paket klein: keine optionalen Extras, keine Varianten, die nicht unten stehen.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial world with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, genau mit den Namen unten.
- Manifest `public/sprites/manifest-<batch>.json` wie `manifest-fasserin.json` oder `manifest-dunscar3.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-<batch>-preview.png`.
- Prüfskript (Pillow) unter `tools/art/<batch>/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-<batch>-validation.json`.

### 0.3 Formate
- Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Animations-Sheets einer Figur (Trinken, Posen) 16x32 je Frame in einer Reihe, wie `characters/A_player_drink.png` (8 Frames = 128x32). Portraits 64x64, Köpfe 24x24.
- Kampf: Spieler-Sheets 48x48 je Zelle wie `battle/battle_player.png`. Gegner 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames. Bosse 96x96 oder 128x96, Reihen idle, attack1, attack2, special, hurt, defeated.
- Effekte als Sheets mit quadratischen Zellen (32x32, 64x64) oder Vollbild 480x270 opak; Sequenz-/Zwischenbilder 240x135 opak.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`. Oberflächen-Symbole 16x16 in Streifen.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/characters/A_player_drink.png`, `battle/battle_player.png`, `public/sprites/manifest-fasserin.json` → `palette`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

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

**Schon vorhanden, nicht neu zeichnen** (als Stil-Referenz benutzen): `fx/fx_schicksalsfaden.png`, `fx/fx_status_stumm.png`, `fx/fx_aetzwolke.png`, `fx/fx_giftphiole.png`, `fx/fx_lichtstoss.png`, `fx/fx_lichtbann.png`, `fx/Q_lichtkegel.png`, `fx/fx_traeume_frei.png`, `fx/fx_eisenhaut.png`, `fx/fx_unbeugsam.png`, `fx/ritual_<pfad>.png`, `fx/HG_*` aus CO, `battle/hg_schwellenwaechter.png`, `battle/hg_siegel.png`, Spielerfiguren `characters/03_01_investigator_walk.png`, `characters/p2a_walk.png`, `characters/p2b_walk.png`, `battle/battle_player.png`.

## 1. Laterne: Die Nacht der Laternen (Echtzeit auf der Karte, kein Kampfbildschirm)
- `props/s4la_ritual_laterne.png`: Ritual-Laterne auf einem Eisenpfahl, 16x32 je Frame, Reihen = Zustände: `voll` (4 Frames ruhige Flamme), `halb` (4, kleinere Flamme), `schwach` (4, flackernd, Glas rußig), `angegriffen` (2, Glas zittert, Funken), `erloschen` (1), `nachfuellen` (4, Öl läuft, Flamme wächst). 6 Reihen x 4 Spalten = 64x192, leere Zellen transparent.
- `fx/s4la_lichtkreis.png`: Lichtkreis um eine brennende Laterne, 64x64, 4 Frames (256x64), halbtransparent über Checker-Dithering (binäres Alpha), Amber.
- `fx/s4la_spielerlicht.png`: schwaches Eigenleuchten des Spielers, 48x48, 4 Frames Puls (192x48), blasser als der Laternenkreis.
- `fx/s4la_monster_licht.png`: Monster nimmt Lichtschaden: zischender Rauch, weiße Funken, 32x32, 6 Frames (192x32); dazu `fx/s4la_monster_zerfall.png` Monster zerfällt zu Asche, 32x32, 6 Frames.
- `fx/s4la_rueckstoss.png`: Treffer am Spieler mit Rückstoß (Staubring + Schlagstern), 32x32, 4 Frames.
- `ui/s4la_halten.png`: Fortschrittsring „Taste halten“ zum Nachfüllen, 16x16, 8 Frames (128x16) von leer bis voll, dazu Frame 9 „unterbrochen“ (Ring gesprungen, rot-rost) = 144x16.
- `ui/s4la_hud.png`: Laternen-Leiste: ein Symbol je Laterne 12x16 in den Zuständen voll, halb, schwach, erloschen nebeneinander (48x16); Rahmen für 6 Symbole 96x20.
- `fx/s4la_sonnenaufgang.png`: der Todesstoß gegen den Wächter: drei Laternen bilden ein Dreieck, Strahlen verbinden sich, ein heller Morgen bricht in der Mitte auf. 96x96, 8 Frames (768x96), Amber zu Bein-Weiß, nicht reinweiß.
- `fx/s4la_unruhe.png`: Bildschirmrand-Überlagerung „Unruhe steigt mit der Dauer“, 480x270, 4 Frames (1920x270), nur der Rand (Rußschlieren, violette Adern), Mitte transparent.

## 2. Faden: Das Netz der fünf Träume
- `fx/s4fa_markieren.png`: Schicksalsfaden schlingt sich um eine Kreatur, 48x48, 6 Frames (288x48); Stil wie `fx_schicksalsfaden.png`, Violett.
- `fx/s4fa_mark_welt.png`: kleine Dauermarke über einer markierten Kreatur auf der Karte (Knoten mit losem Faden), 16x16, 4 Frames (64x16).
- `ui/s4fa_hud.png`: fünf Fadenknoten 16x16 je in zwei Zuständen (offen grau, markiert violett) = 160x16, plus Rahmen 96x20.
- `fx/s4fa_einschlafen.png`: Übergang Schlaf → Traum, Vollbild 480x270, 6 Frames (2880x270), opak: Zimmer kippt, Fäden ziehen die Ränder zu.
- `battle/bg_s4fa_traum.png`: Kampf-Hintergrund des Traums, 480x270 opak: das Netz als Boden, fünf Fadenspuren laufen zur Mitte, entfärbte Stadt im Hintergrund, kein Himmel.
- `fx/s4fa_traumschleier.png`: Überlagerung für die fünf Traumgegner (macht sie „verträumt“: Fäden hängen an Gliedern, Konturen doppeln leicht), 64x64, 4 Frames, wird über jede Gegnergrafik gelegt.
- `fx/s4fa_heilung_gesperrt.png`: kleines Symbol „Heilung gesperrt im Traum“ (zerschnittener Faden über einem Herzfläschchen), 16x16, 2 Frames.

## 3. Maske: Das Gesicht ohne Gabe
- Zivilisten-Verkleidung als Lauf-Sheet (64x128 wie `03_01_investigator_walk.png`): `characters/s4ma_zivil_player.png`, `characters/s4ma_zivil_p2a.png`, `characters/s4ma_zivil_p2b.png`: dieselbe Körperform, aber einfacher Wollmantel, Schiebermütze, keine Pfadabzeichen, kein Leuchten.
- Kampf-Sheets der Verkleidung (genau der Aufbau von `battle/battle_player.png`: 6x9 Zellen à 48x48, gleiche Reihen und Frame-Belegung laut `manifest-14b.json`; Koop-Vorlage `manifest-spieler2.json`): `battle/s4ma_zivil_player.png`, `battle/s4ma_zivil_p2a.png`, `battle/s4ma_zivil_p2b.png`. Angriff mit bloßen Fäusten oder Knüppel, keine Effektspur.
- `fx/s4ma_verwandeln.png`: Maske fällt, Gesicht wird gewöhnlich, 32x48, 8 Frames (256x48).
- `fx/s4ma_herausforderung.png`: Handschuh wirft sich vor dem Gegner auf den Boden, 32x32, 6 Frames.
- `fx/s4ma_gabe_verboten.png`: Warnung „eigene Fähigkeit benutzt = Scheitern“: zerbrechende Maske, 32x32, 6 Frames.
- `fx/s4ma_zweifel.png`: der verschonte Beyonder zweifelt: seine Pfadaura bekommt Risse und flackert aus, 48x48, 6 Frames; dazu `fx/s4ma_zweifel_welt.png` Dauermarke über ihm auf der Karte (Riss-Symbol, 16x16, 2 Frames).

## 4. Echo: Die Welt ohne Klang
- `fx/s4ec_taubheit_an.png`: Vollbild-Übergang, 480x270, 6 Frames, halbtransparent am Rand (Mitte transparent): Schallwellen, die erstarren und zu Staub fallen.
- `fx/s4ec_taub_rand.png`: Dauer-Vignette während der Taubheit, 480x270, 1 Frame, nur Rand, entsättigt-blau.
- `ui/s4ec_taub_hud.png`: Symbol „taub“ (Ohr mit stehender, gerader Linie statt Welle), 16x16 und 32x32 nebeneinander (48x32).
- `fx/s4ec_stille_treffer.png`: lautloser Treffer am Gegner: nur ein Staubring, keine Schlaglinien, 32x32, 4 Frames (ersetzt im Ritual die normalen Treffer-Funken, damit nichts „klingt“).

## 5. Kessel: Würfe (die Tränke selbst sind Icons in DP)
- `fx/s4ke_wurf_explosion.png`: geworfene Knallflasche explodiert, 64x64, 8 Frames (Glas, Feuerball in Amber und Rost, Rauch).
- `fx/s4ke_wurf_frost.png`: Frostlauge zerspringt, Raureif breitet sich aus, 64x64, 6 Frames.
- `fx/s4ke_wurf_glut.png`: Glutschleim klebt und brennt nach, 48x48, 6 Frames.
- `fx/s4ke_trinken_reihe.png`: Bild über dem Spieler beim Trinken der fünf Ritual-Tränke, 32x32, 5 Frames: je Trank ein anderer Farbhauch (Türkis, Grün, Amber, Eisblau, Rost).
- `ui/s4ke_hud.png`: fünf Trankplätze 16x16 (leer, getrunken) = 160x16 und Rahmen 96x20; Symbol „Angriff verboten“ (gekreuzte Faust, 16x16).

## 6. Eisen: Die Last des Halbgottes
- `fx/s4ei_ueberlast_welt.png`: Spieler unter der Last auf der Karte: Boden reißt um die Füße, Staub, 32x32, 4 Frames.
- `fx/s4ei_ueberlast_kampf.png`: dasselbe im Kampf unter der Spielerfigur, 64x32, 4 Frames.
- `ui/s4ei_hud.png`: Rundenzähler „1–5 überstehen“: fünf Nieten 16x16 (offen, geschlagen) = 160x16, Rahmen 96x20; Symbol „Ausweichen verboten“ (Fußspur durchgestrichen, 16x16); Symbol „Bedingung gebrochen“ (gesprungener Träger, 16x16).
- `fx/s4ei_waechter_unsterblich.png`: Schutzschimmer über dem Wächter in Runde 1–5 (Nietring), 128x96, 4 Frames, halbtransparent; `fx/s4ei_waechter_frei.png` Ring springt in Runde 6, 128x96, 6 Frames.

## 7. Uhr: Der perfekte Augenblick
- `fx/s4uh_perfekt.png`: perfektes Ausweichen: kurzer Zeitstillstand, Zifferblatt-Ring, Nachbild des Spielers, 64x64, 8 Frames.
- `fx/s4uh_fehler.png`: verfehltes oder nur normales Ausweichen: Ring springt, Zeiger brechen, 64x64, 6 Frames.
- `ui/s4uh_hud.png`: Fehleranzeige: drei Zahnräder 16x16 (heil, gebrochen) = 96x16; Rahmen für die Monsterphase „0 Fehler“ (ein einzelnes Zahnrad, 16x16, rot-rost umrandet); Haken je Monster „hat angegriffen“ (16x16, zwei Zustände).

## 8. Schwellenwächter: Zusätze (Sprite selbst aus CO)
- `characters/s4r_waechter_welt.png`: der Wächter **auf der Karte** (Laternen-Ritual hat keinen Kampfbildschirm, beim Eisen erscheint er am Standort): 48x64 je Frame, 4 Richtungen x 4 Frames = 192x256, Grundlinie y=62, gleiche Gestalt und Palette wie `battle/hg_schwellenwaechter.png`.
- `fx/s4r_waechter_erscheint.png`: Erscheinen am Standort: Kalkstaub sammelt sich zu einer Schwelle, der Wächter tritt heraus, 96x96, 10 Frames.
- `fx/s4r_waechter_immun.png`: Treffer prallt ab (Laterne allein, verbotene Angriffsart), 64x64, 4 Frames.
- `fx/s4r_ritual_gescheitert.png`: Ritual misslingt: Siegel des Pfads zerspringt, 64x64, 8 Frames (die zehn Siegel aus `hg_siegel.png` als Vorlage, hier ein neutrales Siegel; der Einbau färbt es).
- `ui/s4r_regelkarte.png`: Rahmen für die Regel-Anzeige eines Rituals (Pergament mit Siegelplatz links, Platz für 3 Regelzeilen; der Text kommt aus dem Spiel), 9-Slice auf 16er-Raster, 48x48.

## 9. Abgabe
Etwa 70 PNGs in den Ordnern `props/`, `fx/`, `ui/`, `characters/`, `battle/`; Manifest `manifest-seq4rit1.json` mit Frames, Reihen, Geschwindigkeit und der Zuordnung Ritual → Dateien; `tools/art/seq4rit1/check.py`; `docs/art/batch-seq4rit1-validation.json`; `docs/art/batch-seq4rit1-preview.png`; README-Ergänzung; Pull Request nur mit deinen Dateien. Wenn der Upload scheitert: Abschnitte 1–4 zuerst, 5–8 als zweiten PR.
