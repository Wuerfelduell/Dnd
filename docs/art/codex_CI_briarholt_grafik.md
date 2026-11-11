# Codex-Paket CI: Briarholt als Grafik, kalt und warm (Kapitel 5)

**Batch-Name:** `briarholt1` (Manifest: `public/sprites/manifest-briarholt1.json`)

Briarholt ist eine Industriestadt, die sich als Garten ausgibt: ein kalter, trockener Talkessel, Frost im Backstein, und darüber Glaskuppeln, in denen im Winter Pfirsichbäume blühen. Heiße Rohre und gläserne Übergänge verbinden sechs Viertel. Du lieferst jedes Tileset **zweimal im gleichen Zellenraster**: `_kalt` (Reif, blinde Scheiben, stille Pflanzen) und `_warm` (Kondensat, Dampf, offene Blüten, Schrift im Beschlag). Dazu Props, Innenräume, Kampf-Hintergründe der Stadt, Stadtkarte mit Leitungsplan-Overlay, Kapitelkarte. Figuren (BK), Gegner mit Zonen-Hintergründen (BI) und Item-Icons (BM) gibt es schon; mach nichts davon doppelt. Die Karten dazu macht gleichzeitig Paket CH.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat.

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
- Manifest `public/sprites/manifest-<batch>.json` wie `manifest-dunscar1.json` (Framegröße, Spalten/Reihen, Frame-Listen je Animation, Geschwindigkeit, Regionen).
- Verwendete Prompts in `docs/art/batch-<batch>-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen, eine Vorschau-PNG unter `docs/art/batch-<batch>-preview.png`.
- Prüfskript (Pillow) unter `tools/art/<batch>/check.py`: Maße, Palette (max. 32 Farben), binäres Alpha, Raster. Bericht als `docs/art/batch-<batch>-validation.json`.

### 0.3 Formate
- Tilesets 16x16, 8 Spalten, Zellenliste im Manifest. Figuren auf der Karte 16x32, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = Sheet 64x128, Grundlinie y=30. Portraits 64x64, Stimmungs-Sheet 256x64 (neutral, misstrauisch, erschrocken, lächelnd) plus zweite Reihe (wütend, traurig, nachdenklich, entschlossen) = 256x128. Köpfe 24x24.
- Kampf-Gegner: 6 Spalten, Zellen 48x48 oder 64x64, Reihen idle, attack1, attack2, hurt, defeated; Angriffe halten die Ausholpose in zwei identischen Frames (Spieler reagieren darauf). Bosse 96x96 oder 128x96.
- Kampf-Hintergründe 480x270 opak. Szenenbilder 480x270 opak, Sequenz-/Zwischenbilder 240x135.
- Item-Icons 16x16 unter `items/<id>.png`, wo gefordert zusätzlich 32x32 unter `items/32/<id>.png`.

### 0.4 Nachbearbeitung
1. Generatorbild mit Nearest Neighbor exakt aufs Zielraster bringen.
2. Auf die gemeinsame Palette indizieren (vorhandene Sprites als Referenz mitgeben, z. B. `public/sprites/tilesets/C_06_bahnhof_tiles.png`, `characters/`).
3. Transparenz prüfen: kein weißer oder schwarzer Rand um freigestellte Sprites. Leere Restfelder vollständig transparent.

## Gemeinsame Eckdaten „Kapitel 5: Der Garten der fehlenden Tage“ (gilt für die Pakete CG bis CJ)

Kapitel 5 spielt im Kurort **Briarholt**. Verbindliche Vorlage ist **Geschichte 2** aus Paket AC: **`docs/story/kapitel3/geschichte_2.md`** (Prämisse, sechs Viertel, zehn Figuren, Gegenspielerin Dr. Meriel Greavesend, Kernmechanik „Wärme und Rücklauf“, 5 Akte x 4 Fährten, drei Wendepunkte, vier Enden). Lies sie zuerst ganz. Der dort beschriebene Anschluss an Wexmoor wird **nicht** übernommen: Kapitel 5 schließt an die vier **Calderwick-Enden** von Kapitel 4 an (`cwa_end_widerspruch`, `cwa_end_amtsinhaber`, `cwa_end_buecher`, `cwa_end_ordnung`, Pakete CC bis CF). Falls Kapitel 4 übersprungen wird, gibt es zusätzlich eine Anreise direkt aus Dunscar (`kapitel3_done`).

Vieles ist schon da. Der **Vorrat** aus den Paketen BH bis BM liegt im Repo und ist verbindlich; erfinde nichts doppelt:
- Figuren: `docs/story/vorrat_figuren/` (BJ): `npcs.json`, `dialogues.json`, `steckbriefe.md`, `auftragskeime.json` (`bj_keim_bh_*`), `reaktionen.json`. Grafik: Batch `vorrat2` (BK), Lauf-Sheet-Id = Figur-Id.
- Gegner und Bosse: `docs/story/vorrat_gegner/` (BH): `encounters.json`, `bosses.json`, `phasen.json`, `bestiarium.json`, `dialogues.json`, `zonen_vorschlag.json`, `verhalten.md`. Grafik: Batch `vorrat1` (BI).
- Gegenstände: `docs/story/vorrat_items/` (BL): `items.json` (`vi_*`), `artifacts.json`, `fundstuecke.json`, `handel.json`. Grafik: Batch `vorrat3` (BM).
Vorrats-Ids werden **benutzt, nicht kopiert**.

Vier Pakete bauen Kapitel 5 gleichzeitig. Diese IDs sind **fest vergeben**.

**Stadt:** `briarholt`. Kapitel 5 startet mit Flag `k5_arrived`, Ende Kapitel 5 setzt `kapitel5_done` und eines von `bha_end_wahl`, `bha_end_winter`, `bha_end_verwahrt`, `bha_end_schmerzlos`.

**Karten** (Daten: CH, Grafik: CI). Jede Außenkarte und jeder Innenraum hat einen **kalten** und einen **warmen** Zustand (Tileset `bh_<thema>_kalt` / `bh_<thema>_warm`, gleiche Zellenbelegung; Wechsel über die Mechanik, nicht über die Tageszeit).
| ID | Was |
|---|---|
| `bh_kutschenhof` | Viertel: Ankunft, Gepäck, Patienten und Blumenerde unter einem niedrigen Dach, Frost im Backstein |
| `bh_kesselgrund` | Viertel: Werkstätten, Kohlenrutschen, Rohrbrücken, stillgelegte Wäscherei |
| `bh_winterpromenade` | Viertel: Musikpavillon, Gaslaternen, Palmen in Kübeln, Postkartenpult |
| `bh_glasgaerten` | Viertel: beschlagene Anzuchthäuser als Straßenzüge, verschlossene Beete |
| `bh_stillenhaeuser` | Viertel: Patientenzimmer um gemeinsame Speisesäle, Tafeln mit radierter letzter Zeile |
| `bh_wurzelkranz` | Viertel: alte Pumpstation, Labor, Mutterhaus der Klinik, Stolleneingang |
| `bh_buegelraum` | Innenraum: Frosts Bügelraum, **Unterschlupf** (Bett, eigene Feuerstelle, Lager, Fallwand, Ventiltafel) |
| `bh_kutschenhalle` | Innenraum: Gepäckhalle, Felix' Schichtbuch, unbenutzte Gepäckscheine |
| `bh_pavillon` | Innenraum: Musikpavillon mit Schreibpult und Postkartenständer |
| `bh_verkaufshalle` | Innenraum: ehemalige Verkaufshalle mit verschlossenen Beeten, Adelines Saatbuch |
| `bh_speisesaal` | Innenraum: Speisesaal der Stillenhäuser, Ennas Stationszimmer, Teeküche |
| `bh_aktenraum` | Innenraum: Einwilligungen und Widerrufe, Patientenakten |
| `bh_labor` | Innenraum: Greavesends Labor, verworfene Anleitungen, Sudkessel |
| `bh_mutterhaus` | Innenraum: Dipples Zeichenstube, Fundamentplan |
| `bh_verteilanlage` | Finale: Verteilanlage im Wurzelkranz, Behälter, Sperrklappe, Endgespräch mit Greavesend |
| `bh_kaltes_palmhaus` | Gefahrengebiet tier 5, Boss `vg_bh_boss_glasgaertner`, Vorschlag `vg_zone_bh_palmhaus` |
| `bh_verlassene_waescherei` | Gefahrengebiet tier 5, Boss `vg_bh_boss_waescherei` (Atemkessel), Vorschlag `vg_zone_bh_waescherei` |
| `bh_wurzelkammer` | Gefahrengebiet tier 6, Boss `vg_bh_boss_mutterwurzel` (Blütenmund, drei Abschnitte), Vorschlag `vg_zone_bh_wurzelkammer` |

**Figuren** (BJ-Ids, Grafik BK): `bh_bellweather` (Ruben „Frost“, Verbündeter, Heizer), `bh_orla_fencrest` (geflohene Patientin), `bh_felix_fencrest` (Bruder, Gepäckträger), `bh_greavesend` (Klinikleiterin, Gegenspielerin, Kessel Seq 5), `bh_vellish` (Adeline, Gärtnerin), `bh_malkin` (Jasper, Rohrwart), `bh_rookwell` (Schwester Enna), `bh_henshall` (Beatrice, entlassene Patientin), `bh_crowther` (Silvan, Lieferant), `bh_dipple` (Amos, botanischer Zeichner). Reisefiguren `vn_*`. Gastauftritte nur per Brief: `cw_crayford` (nach Kapitel 4), `k3_pfiff`, `marlowe`; Elsbeths Brief nur bei `k2_rowe_frei`.

**Gegner** (BH-Ids): normal `vg_bh_dampfschwester`, `vg_bh_wurzelgaenger`, `vg_bh_glasmotte`, `vg_bh_bluetenkopf`, `vg_bh_rohrwurm`, `vg_bh_postkartenschreiber`, `vg_bh_waeschegeist`, `vg_bh_sudtraeger`; Bosse `vg_bh_boss_glasgaertner` (Akt II), `vg_bh_boss_waescherei` (Akt III), `vg_bh_boss_mutterwurzel` (Akt V). Greavesend ist **kein** Kampfboss: das Finale ist ein Verhör mit optionaler Verteidigung gegen `bha_aussaat_schwarm` (CG Texte, CH Werte).

**Gegenstände** (BL-Ids): Schlüsselstücke `vi_k_bh_postkarte_verworfen`, `vi_k_bh_pflanzenkapsel`, `vi_k_bh_einweisung`, `vi_k_bh_beetschild`, `vi_k_bh_namensheft`, `vi_k_bh_wurzelzeichnung`; Ausrüstung `vi_hut_kurhaube`, `vi_mantel_dampfmantel`, `vi_amulett_pfirsichkern`, `vi_waffe_veredelungsschere`, `vi_waffe_dampfrohr`; Verbrauch `vi_v_pfirsichsud`, `vi_v_wurzelpastille`, `vi_v_dampfkompresse`, `vi_v_kurkarte`; Artefakte `vi_art_die_warme_postkarte`, `vi_art_die_gaertnerschnur`, `vi_art_die_kurglocke`.

**Sequenzen:** Keine neuen Pfade, Rituale oder Formeln. Die Bosse geben wie in Calderwick Ersatzquellen (Glasgärtner → `sq_zutat_<pfad>_3`, Atemkessel → `_2`, Blütenmund → `_1`, nur eigener Pfad, nur wenn noch nicht vorhanden). Fährte IV.3 der Geschichte liefert einen Lesetext zur Rückführung, keine Rezeptdaten.

**Kernmechanik „Wärme und Rücklauf“** (Spezifikation und Grundgerüst: CH; Daten: CG): Ventile `bha_ventil_<kreis>` (Flags `offen`/`zu`), höchstens drei gleichzeitig warme Kreise, Rücklauf in Behälter / Klinik / leeres Gebäude. Zustandswechsel nur durch bestätigte Aktionen. Bis der Code da ist, muss jede Schaltung als Dialog spielbar sein; Wohnräume bleiben immer grundversorgt.

**Präfixe für neue IDs:** CG `bha_`, CH `bho_`, CI Batch `briarholt1` (Dateien `bh_*`), CJ `bhn_`. Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

**Erst lesen (Pflicht):** `docs/story/kapitel3/geschichte_2.md`, `docs/story/kapitel3/story_bisher.md`, `src/data/packs/k3_akte/`, `src/data/packs/k3_orte/`, die drei Vorrats-Ordner, dazu die Calderwick-Pakete `docs/art/codex_CC_k4_akte.md` (nur die Eckdaten, für die Enden-Flags).


## 1. Tilesets (je `tilesets/bh_<name>_kalt.png` und `bh_<name>_warm.png`, 16x16, 8 Spalten, identische Zellenbelegung, Zellenliste im Manifest)
| Thema | Inhalt |
|---|---|
| `bh_promenade` | Backstein-Pflaster mit Reif / mit Tauwasser, Palmenkübel (Blätter steif / entfaltet), Gaslaternen-Sockel, Pavillon-Boden, Glasübergänge (Scheiben blind / beschlagen mit Tropfen, 2 Frames), Fassaden Kurhaus hell mit Messing (Fenster dunkel / warm beschlagen), Postkartenständer |
| `bh_kessel` | Kesselgrund: Kohlenrutschen, Rohrbrücken dick (gerade, Bogen, Ventil-Kachel mit Rad, 3 Zustände zu/kalt/warm als eigene Zellen), Werkstattboden, Wäscherei-Fassade, Kondensat-Pfützen (kalt: Eis), Dampf-Austritt (warm, 4 Frames) |
| `bh_glas` | Glasgärten: Anzuchthaus-Wände aus Glas und Eisen (Scheiben blind / beschlagen mit Schriftspuren als Kratzer), Beete (geschlossen mit Schild / offen mit Pflanze, warm: Blüte 2 Frames), Kieswege, Bewässerungsrinnen (trocken / fließend 2 Frames) |
| `bh_stille` | Stillenhäuser innen: Krankenhausfliesen, Betten mit Tafel, Speisesaal-Dielen, Teeküche, Stationszimmer; warm: Fenster beschlagen, kalt: Reif an den Scheiben |
| `bh_klinik` | Wurzelkranz: Pumpstation (Gusseisen, Manometer ohne Zahlen), Labor (Fliesen, Sudkessel-Fundamente), Mutterhaus (Parkett, Zeichenschränke), Stolleneingang; warm: Boden mit Wurzeladern türkis schwach (4 Frames) |
| `bh_wurzel` | Wurzelkammer: trockener Stollen, warme Wurzeln als Wandkacheln (kalt: grau, warm: rosa-grau mit türkisem Puls 4 Frames), Beschriftungs-Schilder an Wurzeln (leer), Kondenswasser-Tropfen |

## 2. Props (je `props/bh_<thema>.png`, Namen im Manifest als `regions`)
- **Kutschenhof:** Postkutsche (64x32, 2 Frames Pferde), Gepäckkarren mit Blumenerde, Patientenstühle, Hinweistafel ohne Schrift mit Pfirsich-Emblem, Dampfentladung (48x48, 6 Frames).
- **Kesselgrund:** Ventil (16x32, 3 Zustände + Drehen 4 Frames), Wartungsschrank, Kohlenbunker leer/voll, Druckanzeige (2 Zustände), Bügelraum (Bügelbrett, Wäschemangel, eigene Feuerstelle 2 Frames, Fallwand, Kiste, Bett, **Ventiltafel** 32x32 mit drei Kreisen, Zustände zu/kalt/warm je Kreis als Steckmarken).
- **Promenade:** Musikpavillon (64x48), Schreibpult mit Postkarten, Palmen in Kübeln (kalt steif / warm), Gaslaterne, Kurgäste-Bank, Kurkiosk.
- **Glasgärten:** Beete mit Schild (Schild umgedreht als 2. Zustand), Saatbuch auf Pult, Veredelungsschere groß, Pflanzenkapsel-Halter (leer / mit Kapsel), sprechende Pflanze (16x32, 4 Frames, Blüte öffnet sich, türkis innen).
- **Stillenhäuser:** Bett mit Tafel (Zeile radiert), Teewagen, Ennas Heft, Speisesaal-Tische, Kinderzeichnung an der Wand.
- **Wurzelkranz:** Pumpstation-Rad (32x32, 4 Frames), Sudkessel (2 Frames), Zeichentisch mit Fundamentplan, Verteilanlage (64x48: Behälter, Hähne, Sperrklappe, 3 Zustände), Rücklaufbehälter (versiegelt / offen).
- **Wärme-Effekte** `fx/bh_waerme.png`: Dampf aus Rohr (16x16, 4 Frames), Kondensat-Schrift erscheint (16x16, 6 Frames), Reif-Übergang (16x16, 4 Frames), Rücklauf-Puls in Rohr (16x16, 4 Frames, violett schwach), Kondensat-Sperre (32x32, 4 Frames, Wasserwand), Leitungsplan-Linien für die Stadtkarte (Overlay 16x16: warm amber, kalt slate, belastet violett).

## 3. Szenenbilder
- `ui/scenes/bh_ankunft.png` 480x270: Kutschenhof im Frost, dahinter die leuchtenden Glaskuppeln.
- `ui/scenes/bh_trockenraum.png` 240x135: Orla mit der kalten Kapsel unter einer Decke, Frost vor dem Familienbild.
- `ui/scenes/bh_pfirsich.png` 240x135: ein Pfirsich mit schwach türkisem Kern.
- Enden: `ui/scenes/bh_ende_wahl.png` (gewöhnliche Heilanstalt, Garten ohne Leuchten), `bh_ende_winter.png` (Wärmestube im Schnee, Frost am Ofen), `bh_ende_verwahrt.png` (Ennas Register, versiegelte Kapseln in Reihen), `bh_ende_schmerzlos.png` (blühender Garten, Briefe ohne Anrede; Variante mit Turm und Garten nebeneinander für `k2_end_lichtmeister`), je 240x135.

## 4. Kampf-Hintergründe (`battle/bg_bh_<name>.png`, 480x270, je kalt und warm wo sinnvoll)
`kutschenhof`, `kesselgrund_kalt`, `kesselgrund_warm`, `promenade`, `glasgaerten_kalt`, `glasgaerten_warm`, `stillenhaeuser`, `wurzelkranz`, `verteilanlage`. Die drei Zonen-Hintergründe (Palmhaus, Wäscherei, Wurzelkammer) liefert BI: prüfe `public/sprites/manifest-vorrat1.json`, nicht doppelt machen.

## 5. Stadtkarte und Titel
- Stadtkarte `ui/bh_karte.png` (Größe wie `ui/ds_karte.png`): Talkessel, sechs Viertel, Glasübergänge; Nebel-Overlay `ui/bh_karte_nebel.png`; **Leitungsplan-Overlay** `ui/bh_karte_leitungen.png` (gleiche Größe, nur Rohre, drei Farben für warm/kalt/belastet, transparent); Marker `ui/bh_marker.png` für alle Karten aus den Eckdaten.
- Kapitelkarte `ui/scenes/kapitel5_karte.png` 480x270, ohne Text: Frost im Backstein, darüber Pfirsichblüten hinter Glas.

## 6. Lieferung
Alle Dateien oben, Manifest (mit `variants: {kalt, warm}` je Tileset), Prüfskript (prüft zusätzlich, dass kalt und warm dieselben belegten Zellen haben), Vorschau, `docs/art/README.md`-Abschnitt. Pull Request nur mit deinen Dateien.

