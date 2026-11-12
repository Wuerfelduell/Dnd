# Codex-Paket DQ: Seq-5- und Seq-6-Rituale als Grafik (Braukessel, Prüfungen, Proben, Betrug, Schlösser)

**Batch-Name:** `rituale56` (Manifest: `public/sprites/manifest-rituale56.json`)

Die Rituale der Sequenzen 6 und 5 sind neu gebaut und laufen im Spiel, aber nur mit Text und geliehenen Bildern. Dieses Paket liefert die fehlenden Effekte und Oberflächen. Die Item-Icons (Gefäß, Sude, Taschenuhr) macht **DP**, nicht dieses Paket. Parallel zu DN, DO, DP startbar.

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

## Eckdaten „Seq 6 und Seq 5“ (Stand im Spiel, IDs fest)
- **Seq 6** (`src/core/Proben.js`, nur lesen): Vier Pfade legen eine zufällige **Probe** in einem eigenen Fenster ab: `faden` (vier Spuren ihrem Schluss zuordnen), `echo` (drei Stimmen im Nebel, eine hallt nach), `moor` (sieben Namen merken, dann fehlt einer und einer ist neu), `uhr` (eine Frist ohne Uhr abzählen). Die **Waage** deckt auf einem geheimen Treffen einen **überteuerten Preis** auf (bei jedem Los stehen Schätzwert und Ausruf nebeneinander, Knopf „Betrug anprangern“). Der **Schlüssel** knackt Schlösser (Truhen, Türen, Schließfach, Zellenschloss) mit Pfadkraft, Brecheisen oder Haarnadel.
- **Seq 5** (`src/core/Seq5.js`, nur lesen): `laterne` zehn Laternen im Monstergebiet, dann die **Laternenbestie** (so stark wie der Spieler, Todesstoß mit Licht); `faden` zehn lila Spinnfäden, **Kokon** (man läuft wie überladen), unter 20 % Leben und Nerven erscheint die Kokonspinne; `maske` einem besiegten Beyonder das **Gesicht nehmen**, dann zwei andere überzeugen (Fehler: dauerhaftes **Misstrauen**); `echo` Beyonder unter 10 % verschonen und **„Stimme rauben“**; `kessel` **freies Brauen** am Braukessel (bis zu drei Zutaten + leeres Gefäß); `eisen` fünf Siege in zwölf Runden unter 40 % Leben ohne Heilung; `schluessel` im Kampf 50 Schilling **stehlen**; `waage` drei Lose kaufen und drei Dinge verkaufen auf einer Runde; `moor` einem Bürger eine **Erinnerung** ins Gefäß nehmen; `uhr` zwei Gegner in je höchstens drei Runden mit **20 Sekunden Warten** dazwischen.

**Schon vorhanden, nicht neu zeichnen:** `fx/E_01_stimme_raub.png` (Stimme rauben), `fx/fx_namensraub.png`, `fx/fx_fadennetz.png`, `fx/fx_schicksalsfaden.png`, `fx/fx_spiegelbild.png`, `fx/fx_taschenspiel.png`, `fx/fx_zersetzung.png`, `fx/ritual_<pfad>.png`, `ui/A_11_digestion.png`, Spinne `battle/enemy_fadenspinne.png`, Braukessel-Grafik in `props/` (suche `braukessel`/`kessel` in den Manifesten), DN liefert die Ritual-Laterne `props/s4la_ritual_laterne.png` (die Seq-5-Laternen benutzen dieselbe; nicht doppelt zeichnen).

## 1. Braukessel: freies Brauen (Seq 5 Kessel)
- `ui/sud_kessel_fenster.png`: Fensterbild 160x96: Kupferkessel von schräg oben, drei runde Zutatenplätze 20x20 am Rand, ein Platz für das leere Gefäß rechts, Holzrahmen; Plätze leer gezeichnet (der Einbau legt die Icons darauf).
- `ui/sud_kessel_blubbern.png`: Kesselinhalt als Animation 64x32, 3 Reihen x 6 Frames: `ruhig`, `brodelt` (nach jeder Zutat), `gelungen` (klarer Dampfring, leichter Glanz) = 384x96; dazu `ui/sud_kessel_pfusch.png` grauer, flockiger Qualm, 64x32, 6 Frames.
- `fx/sud_abfuellen.png`: Sud läuft vom Schöpflöffel ins Gefäß, 32x32, 8 Frames.
- `fx/sud_wirkung.png`: kleine Dauer-Anzeige „eigener Sud wirkt“ über dem Spieler, 16x16, 4 Frames; `ui/sud_timer.png` Sanduhr-Ring 16x16, 8 Frames von voll bis leer.
- `ui/sud_rezeptbuch.png`: Seite „Erfundene Sude“ (9-Slice-Rahmen 48x48 mit Kesselzeichen in der Ecke).

## 2. Seq-5-Prüfungen
- `battle/enemy_laternenbestie.png`: eigene Grafik für die Laternenbestie (bisher geliehener Hund): Leib aus Glas und Flamme, vierbeinig, Kopf eine Laterne, 64x64-Zellen, 6 Spalten, Reihen idle, attack1 (Lichtbiss), attack2 (Blendsprung), special (Funkenregen), hurt, defeated (zerfällt zu Licht) = 384x384.
- `fx/s5_laternen_kreis.png`: alle zehn Laternen brennen, Licht verdichtet sich (Vorspann der Bestie), 96x96, 8 Frames.
- `characters/s5_kokon_player.png`, `s5_kokon_p2a.png`, `s5_kokon_p2b.png`: Überlagerung „eingewickelt“ für das Lauf-Sheet (64x128, gleiche Frames wie `03_01_investigator_walk.png`/`p2a_walk.png`/`p2b_walk.png`): violettes Garn um Arme und Rumpf, nur die Fäden, Rest transparent.
- `fx/s5_kokon_platzt.png`: Kokon reißt, Spinne kriecht heraus, 48x48, 8 Frames.
- `fx/s5_gesicht_nehmen.png`: das Gesicht eines besiegten Beyonders löst sich als Porzellanmaske und legt sich über den Spieler, 48x48, 10 Frames.
- `ui/s5_gesicht_marke.png`: kleine Marke „trägt fremdes Gesicht“ (halbe Maske), 16x16 und 32x32.
- `ui/s5_misstrauen.png`: Dauermarke neben Figuren mit Misstrauen (zusammengekniffenes Auge, Rost-Rot), 16x16, 2 Frames.
- `ui/s5_stimme_rauben_knopf.png`: Symbol im Kampfmenü „Stimme rauben“ 16x16 und 32x32 (Mund mit Faden in ein Fläschchen gezogen), Zustände aktiv/gesperrt (64x32 Streifen).
- `fx/s5_diebstahl.png`: Schillinge springen vom Gegner zum Spieler, 48x32, 8 Frames; `ui/s5_diebstahl_zaehler.png` Münzstapel in 5 Stufen bis 50, 16x16 je Stufe (80x16).
- `fx/s5_erinnerung_ziehen.png`: ein heller Nebelfaden löst sich von der Stirn eines Bürgers und zieht ins Gefäß, 48x48, 10 Frames; `fx/s5_erinnerung_verweigert.png` (Herkunfts-Erinnerung: Faden reißt zurück), 48x48, 6 Frames.
- `ui/s5_uhr_warten.png`: 20-Sekunden-Warten: Taschenuhr mit laufendem Zeiger, 32x32, 12 Frames; `ui/s5_runden_uhr.png` drei Viertel-Marken „höchstens 3 Runden“, 16x16 je Zustand (offen/verbraucht), 32x16.
- `ui/s5_eisen_hud.png`: Kampfprüfung Eisen: fünf Siegmarken (offen/errungen) 16x16 = 160x16, Rundenbalken 12 Kerben (9-Slice 96x8), Lebens-Grenzlinie „40 %“ als kleine rote Nadel 8x16.
- `ui/s5_handel_hud.png`: Waage-Handel: drei Kauf- und drei Verkaufsmarken (offen/erledigt), je 16x16 = 192x16.
- `fx/s5_pruefung_gescheitert.png`: allgemeiner Fehlschlag einer Seq-5-Prüfung (Verdauungsbalken zuckt zurück, Riss), 64x32, 8 Frames.

## 3. Seq-6-Proben (Fenster `probe`)
- `ui/probe_rahmen.png`: Fensterrahmen der Proben, 9-Slice 48x48, mit vier austauschbaren Ecksymbolen 16x16 (Faden, Echo, Moor, Uhr) als Streifen `ui/probe_symbole.png` (64x16).
- `ui/probe_faden_karte.png`: Spur- und Schlusskarte (Papierzettel mit Nadel), 64x24, Zustände normal, gewählt, richtig, falsch (64x96 Streifen senkrecht); `fx/probe_faden_verbinden.png` violetter Faden zwischen zwei Karten, kachelbar 16x4, 4 Frames.
- `ui/probe_echo_stimme.png`: Nebelkopf einer Stimme (gesichtslos, Mund angedeutet), 32x32, Zustände still, spricht (3 Frames), hallt nach (4 Frames, Türkis-Ring) = 256x32.
- `ui/probe_moor_tafel.png`: Namenstäfelchen aus Torf, 48x16, Zustände normal, verschwindet (4 Frames), neu (Moos frisch, 2 Frames) = 336x16.
- `ui/probe_uhr.png`: Zifferblatt ohne Zeiger, 48x48, dazu `ui/probe_uhr_puls.png` ein Pulsring, der nur am Anfang zwei Schläge zeigt und dann verschwindet, 48x48, 6 Frames; Ergebnis-Marken „zu früh/genau/zu spät“ 16x16 (48x16).
- `fx/probe_bestanden.png` und `fx/probe_fehlversuch.png`: je 64x32, 8 Frames (Siegel schließt sich / Siegel bricht).

## 4. Seq 6 Waage: überteuerter Preis auf dem Treffen
- `ui/waage_schaetzwert.png`: kleine Marken neben dem Los: „Schätzwert“ (Waagschale, Messing) und „Ausruf“ (Hammer, Rost) je 16x16 (32x16).
- `ui/waage_anprangern.png`: Knopf-Symbol „Betrug anprangern“ (zeigender Finger über einer schiefen Waage), 16x16 und 32x32, Zustände aktiv/gesperrt.
- `fx/waage_betrug_aufgedeckt.png`: Stempel „gewogen und zu leicht befunden“ als Bild ohne Schrift: schiefe Waage, roter Wachsstempel schlägt auf, 64x64, 8 Frames; `fx/waage_falsch_beschuldigt.png` Waage kippt gegen den Spieler, 64x64, 6 Frames.

## 5. Seq 6 Schlüssel: Schlösser knacken
- `ui/schloss_zustaende.png`: Schlosssymbol über knackbaren Kisten/Türen, 16x16: verschlossen, knackbar mit Pfad (leichter Türkis-Rand), geknackt, misslungen (64x16).
- `fx/schloss_knacken.png`: Dietrich im Schloss, Riegel springt, 32x32, 8 Frames; Varianten derselben Zellen mit Brecheisen (`fx/schloss_brecheisen.png`, 32x32, 6 Frames) und Haarnadel (`fx/schloss_haarnadel.png`, 32x32, 6 Frames).
- `ui/schloss_zaehler.png`: Zähler „Schlösser geknackt“ für das Ritual (Schlüsselbund in 4 Stufen), 16x16 je Stufe.

## 6. Abgabe
Etwa 55 PNGs; Manifest `manifest-rituale56.json` mit Zuordnung Pfad/Prüfung → Dateien; `tools/art/rituale56/check.py`; `docs/art/batch-rituale56-validation.json`; `docs/art/batch-rituale56-preview.png`; README-Ergänzung; Pull Request nur mit deinen Dateien. Wenn der Upload scheitert: Abschnitte 1–2 zuerst, 3–5 als zweiten PR.
