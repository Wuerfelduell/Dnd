# Codex-Paket DP: Gegenstands-Icons der neuen Rituale (Seq 5, freies Brauen, Seq 4)

**Batch-Name:** `ritualicons` (Manifest: `public/sprites/manifest-ritualicons.json`)

Die Seq-5-Rituale und das freie Brauen am Kessel sind eingebaut, laufen aber mit **Leihbildern** (andere Icons stehen in `src/world/assets.js` unter `ITEM_ICON_ALIASES`, nur lesen). Die Seq-4-Rituale brauchen neue Gegenstände. Dieses Paket liefert **nur Item-Icons**, jeweils 16x16 unter `items/<id>.png` **und** 32x32 unter `items/32/<id>.png`. Effekte, Oberflächen und Figuren machen DN, DO und DQ. Parallel startbar.

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

**Stil-Referenz für Fläschchen und Tränke:** `items/trank_kessel_5.png`, `items/32/trank_kessel_5.png`, `items/stimmphiole.png`, `items/fremdlicht_phiole.png`, `items/moorwasser.png`, `items/taschenuhr.png`, `items/fa2_los_flakon.png`. Jedes Icon muss in 16x16 auf einen Blick von seinen Nachbarn unterscheidbar sein: Form des Gefäßes **und** Farbe wechseln, nicht nur die Farbe.

## 1. Seq 5 und freies Brauen (20 IDs, ersetzen Leihbilder; IDs sind fest, Code existiert)
| ID | Name im Spiel | Bild |
|---|---|---|
| `leeres_gefaess` | Leeres Gefäß | schlichtes, klares Glasfläschchen mit Korken, leer, leichter Glanz |
| `gefaess_erinnerung` | Gefäß mit einer fremden Erinnerung | dasselbe Fläschchen, innen beschlagen, ein heller, verschwommener Umriss (Gesicht oder Haus) im Nebel, Moorgrün-Türkis |
| `uhr_taschen` | Einfache Taschenuhr | Messing, offener Deckel, schlichtes Zifferblatt ohne Ziffern (nur Striche), Kette; einfacher als `taschenuhr.png` |
| `sud_pfusch` | Trüber Sud | Gefäß mit grauem, flockigem Inhalt, Ascheschlieren |
| `sud_nebelsud` | Nebelsud | graublauer Inhalt, Nebel über dem Korken |
| `sud_silberklar` | Silberklar | klares Wasser, ein silberner Faden darin |
| `sud_mohnschlaf` | Mohnschlaf | milchig-weiß mit rosa Hauch, Mohnkapsel am Hals gebunden |
| `sud_gluehtrunk` | Glühtrunk | dunkles Glas, innen glimmende Amber-Punkte |
| `sud_eisensud` | Eisensud | dicker, rostroter Inhalt, kleiner Eisennagel als Verschluss |
| `sud_kroetenbitter` | Krötenbitter | Wurfflasche, bauchig, giftgrün, warzige Glasoberfläche |
| `sud_wachsglanz` | Wachsglanz | honiggelb, Wachstropfen am Korken |
| `sud_grabruhe` | Grabruhe | erdbraun, Moos auf dem Korken |
| `sud_kraehenauge` | Krähenauge | schwarz mit silbernem Ring im Glas, Feder am Hals |
| `sud_moosleuchte` | Moosleuchte | blassgelb leuchtend (kein Türkis), Moosfaser darin |
| `sud_seidenschritt` | Seidenschritt | schlanke, hohe Flasche, perlweißer Inhalt, Spinnenseide um den Hals |
| `sud_schattenhauch` | Schattenhauch | schwarz, kalt, Raureif am Glas |
| `sud_glockenruf` | Glockenruf | glockenförmiges Fläschchen, messinggelb |
| `sud_dreikraut` | Dreikraut | drei Schichten grün/braun/grau im Glas |
| `sud_sternfunke` | Sternfunke | dunkelblau mit kleinen hellen Funken (Bein-Weiß, nicht reinweiß) |
| `sud_kesselzorn` | Kesselzorn | rotbraun, brodelnde Blasen, Korken halb herausgedrückt |

## 2. Seq 4: Kessel „Die fünffache Essenz“ (5 Ritual-Tränke, IDs als Vorschlag)
Fünf neue Rezepte, die erst nach voller Verdauung von Seq 5 **und** mit der Seq-4-Formel braubar werden. Jeder zeigt deutlich seine Kampfwirkung (Gift, Säure, Explosion, Frost, Brand), denn der Wächter darf nur durch Trankwirkungen fallen. Größer und kunstvoller als die Sude: Laborglas mit Siegelband.
| ID | Name (Vorschlag) | Bild |
|---|---|---|
| `s4ke_nachtschierling` | Nachtschierling | lange Phiole, tiefgrün-schwarz, Schierlingsblatt im Siegel |
| `s4ke_aetzwasser` | Ätzwasser | dickwandiger Kolben, gelbgrün, Glas angefressen |
| `s4ke_knallsud` | Knallsud | runde Wurfkugel aus Glas, Amber-Inhalt, Zündschnur am Korken |
| `s4ke_frostlauge` | Frostlauge | eisblau, Raureifkristalle außen |
| `s4ke_glutschleim` | Glutschleim | zähe rost-orange Masse, Blase am Rand, Korken angekohlt |

## 3. Seq 4: Moor „Das Relikt des Verfalls“ (6 IDs)
Aus den Resten von fünf zersetzten Gegenständen entsteht ein Ritual-Artefakt mit zufälligen Eigenschaften. Grundform: ein knotiges Stück aus Torf, Knochen und Metallresten, zusammengehalten von Moorfasern. Fünf Varianten nach der stärksten Eigenschaft, damit man sieht, welches man bekommen hat:
`s4mo_relikt` (neutral, grau-braun), `s4mo_relikt_glut` (Amber-Glimmen in den Ritzen), `s4mo_relikt_faden` (violette Fasern), `s4mo_relikt_stein` (schwer, Rost und Eisen), `s4mo_relikt_schatten` (schwarzblau, kalt), `s4mo_relikt_salz` (Salzkruste, Türkis-Punkte). Dazu `s4mo_reste` (Häufchen Zersetzungsreste, schwarzgrün, ein Knopf und ein Splitter darin).

## 4. Seq 4: weitere Ritual-Gegenstände (7 IDs, Vorschlag)
| ID | Wofür | Bild |
|---|---|---|
| `s4la_ritual_laterne` | Laterne, Laterne aufstellen | kleine Eisenlaterne mit Pfahlspitze, Amber |
| `s4fa_schicksalsfaden` | Faden, Markierung | Spule mit violettem Faden, loses Ende glimmt |
| `s4ma_zivilkleid` | Maske, Verkleidung | gefalteter Wollmantel mit Schiebermütze obenauf |
| `s4ma_handschuh` | Maske, Herausforderung | einzelner Lederhandschuh |
| `s4wa_plombe` | Waage, abgelegter Besitz | Bleiplombe mit Schnur und Waagenzeichen (Besitz versiegelt im Lager) |
| `s4wa_kapital` | Waage, Ritualkapital | prall gefüllter Lederbeutel mit Messingschnalle und Wägemarke |
| `s4sc_schattenband` | Schlüssel, Andenken nach dem Ritual | schwarzblaues Band, zu einem Schlüssel geknotet |

## 5. Abgabe
39 IDs x 2 Größen = 78 PNGs; Manifest mit ID → Datei und einer Spalte „ersetzt Leihbild“ für Abschnitt 1; `tools/art/ritualicons/check.py` (16er und 32er vorhanden, binäres Alpha, Palette); `docs/art/batch-ritualicons-validation.json`; `docs/art/batch-ritualicons-preview.png` (alle Icons als Raster, 16er dreifach vergrößert, mit ID darunter nur in der Vorschau); README-Ergänzung; Pull Request nur mit deinen Dateien.
