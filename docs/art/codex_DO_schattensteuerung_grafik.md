# Codex-Paket DO: Schattensteuerung (Ritual des Schlüssels „Der Schatten ohne Körper“) als Grafik

**Batch-Name:** `schatten` (Manifest: `public/sprites/manifest-schatten.json`)

Das Seq-4-Ritual des Schlüssels bringt eine **ganz neue Spielmechanik**: Der Spieler trennt seinen Schatten vom Körper. Der Körper bleibt regungslos stehen, gesteuert wird nur noch der Schatten, auf der Karte und im Kampf. Der Schatten hat 40 % des Lebens, keine Ausrüstung, darf nicht heilen und nicht parieren, wohl aber ausweichen. Sein Standardangriff ist die neue Fähigkeit **„Schattenattacke“** (immer verfügbar, etwa 80 % Normalschaden, kostet keine Nerven, dunkle Schlaganimation); zusätzlich bekommt er zu Beginn jeder Runde **genau eine zufällige eigene Fähigkeit** des Spielers. Erst 2 Gegner, dann der Schwellenwächter. Stirbt der Schatten, scheitert das Ritual, der Spieler überlebt. Dieses Paket liefert alle Bilder dafür; Texte macht DR, Klänge DS. Parallel zu DN und DP startbar.

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

**Schon vorhanden, nicht neu zeichnen** (Stil-Referenz): `fx/K_schatten.png`, `fx/fx_schattenraub.png`, `fx/fx_schatten_frei.png`, `fx/fx_schattennaht.png`, `fx/fx_schattenschritt.png`, `fx/fx_status_schattenlos.png`, Kreaturform `battle/hg_battle_schluessel.png` (Türhüter, CO), Spielerfiguren `characters/03_01_investigator_walk.png`, `characters/p2a_walk.png`, `characters/p2b_walk.png`, `battle/battle_player.png` (6x9 Zellen à 48x48, Belegung in `manifest-14b.json`), `battle/battle_player_skills.png`.

**Aussehen des Schattens:** dieselbe Silhouette wie die jeweilige Spielerfigur, aber flach und schwarzblau (#1a1c2c bis Schiefer), ohne Gesicht, ohne Kleidungsdetails, Ränder leicht ausgefranst wie Rauch (2–3 Pixel, binäres Alpha, Checker-Dithering für Halbtransparenz), zwei schwache türkise Punkte, wo die Augen wären. Kein Leuchten sonst. Der Schatten wirft selbst keinen Schatten.

## 1. Der Schatten auf der Karte (3 Sheets)
`characters/schatten_player.png`, `characters/schatten_p2a.png`, `characters/schatten_p2b.png`: Lauf-Sheets 64x128 (4 Richtungen x 4 Frames), Grundlinie y=30, Silhouette passend zu den drei Spielerfiguren. Lauf etwas gleitend (Füße berühren kaum den Boden).

## 2. Der zurückgelassene Körper (3 Sheets)
`characters/schatten_koerper_player.png`, `_p2a.png`, `_p2b.png`: der regungslose Körper, 16x32 je Frame, 4 Richtungen x 2 Frames (64x64): steht starr, Augen geschlossen, Frame 2 nur ein winziges Atmen. Ohne eigenen Bodenschatten (der fehlt ja).

## 3. Trennen und Rückkehr
- `fx/schatten_trennen.png`: Schatten löst sich vom Boden unter dem Körper und richtet sich auf, 32x48, 10 Frames (320x48).
- `fx/schatten_rueckkehr.png`: Schatten gleitet zurück und legt sich wieder unter den Körper, 32x48, 8 Frames.
- `fx/schatten_verloren.png`: Schatten stirbt (Ritual gescheitert): zerfasert zu Rauch, der zum Körper zurückweht, 32x48, 8 Frames.
- `fx/schatten_band.png`: dünnes Band zwischen Körper und Schatten auf der Karte (zeigt, wohin man zurück muss), kachelbares Stück 16x8, 4 Frames (64x8), dazu Endstück 8x8.

## 4. Der Schatten im Kampf (3 Sheets)
`battle/schatten_player.png`, `battle/schatten_p2a.png`, `battle/schatten_p2b.png`: genau der Aufbau von `battle/battle_player.png` (6x9 Zellen à 48x48, gleiche Reihen), aber als Schatten. Die Parier-Reihe bleibt leer (Parieren ist verboten), die Heil-/Trink-Reihe ebenfalls. Ausweichen besonders flüssig (Schatten verzieht sich kurz zu einem Streifen).

## 5. Schattenattacke
- `battle/schatten_attacke.png`: Schlaganimation der Schattenattacke für alle drei Schatten gleich, 48x48, 8 Frames (384x48): der Arm zieht sich lang wie eine Klinge aus Dunkelheit, Schlag, Rückzug.
- `fx/schatten_attacke_treffer.png`: Treffer am Gegner, schwarzblaue Risslinien, kein Blut, 48x48, 6 Frames.
- Icon der neuen Fähigkeit: `ui/skills3/schattenattacke.png` (16x16) wie die vorhandenen Fähigkeits-Icons in `ui/skills3/` und `ui/skills_hoch/`, dazu eine 32x32-Fassung `ui/skills3/32/schattenattacke.png`.

## 6. Zufällige Fähigkeit pro Runde
- `ui/schatten_wuerfelslot.png`: Rahmen um die eine zufällige Fähigkeit der Runde, 24x24, 8 Frames „Auslosen“ (Rahmen dreht schattenhaft, 192x24) + 1 Frame „gesetzt“ = 216x24.
- `fx/schatten_faehigkeit.png`: Überlagerung, die jede gewirkte Fähigkeit schattig färbt (Rauchkante, kein Farbwechsel des Effekts selbst), 64x64, 4 Frames.
- `ui/schatten_hud.png`: Lebensleiste des Schattens (schmal, schwarzblau, 9-Slice 48x8), Symbole 16x16: „keine Heilung“ (Fläschchen mit Riss), „kein Parieren“ (Schild durchgestrichen), „keine Ausrüstung“ (leerer Haken), „Körper wartet“ (kleine Figur mit Band).

## 7. Kulisse
- `battle/bg_schattenseite.png`: Kampf-Hintergrund, 480x270 opak: dieselbe Gasse in Negativ-Stimmung, Lichter werfen Schatten in die falsche Richtung, Wände ohne Farbe, nur Blau-Grau und Türkis-Punkte.

## 8. Abgabe
19 PNGs plus 2 Icons (3 Lauf, 3 Körper, 4 Übergänge, 3 Kampf-Sheets, Attacke, Treffer, 2 Icon-Größen, Würfelslot, Fähigkeits-Überlagerung, HUD, Kulisse); Manifest `manifest-schatten.json` (Frames je Animation, Zuordnung Spielerfigur → Sheets, welche Reihen leer bleiben); `tools/art/schatten/check.py`; `docs/art/batch-schatten-validation.json`; `docs/art/batch-schatten-preview.png`; README-Ergänzung; Pull Request nur mit deinen Dateien.
