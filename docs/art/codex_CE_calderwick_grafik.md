# Codex-Paket CE: Calderwick als Grafik (Kapitel 4)

> **Ersetzt (2026-11-11):** zu groß für Codex. Bitte stattdessen die zwei Teilpakete nehmen: `codex_CE1_…` und `…2_…` (siehe prompts.md, Runde 8).

**Batch-Name:** `calderwick1` (Manifest: `public/sprites/manifest-calderwick1.json`)

Calderwick ist eine Druckerstadt auf sechs trockenen Kalkterrassen: Standseilbahnen ziehen Papier und Menschen bergauf, schwarze Regenrinnen führen den Ruß bergab, Rohrpost zischt durch die Fassaden, und an den Stationsschildern fehlen Buchstaben. Du lieferst Tilesets, Props, Innenräume, die Standseilbahn, Kampf-Hintergründe der Stadt, Stadtkarte und Kapitelkarte. Figuren (BK), Gegner mit sieben Zonen-Hintergründen (BI) und Item-Icons (BM) gibt es schon; mach nichts davon doppelt. Die Karten dazu macht gleichzeitig Paket CD.

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

## Gemeinsame Eckdaten „Kapitel 4: Die Stadt ohne Unterschrift“ (gilt für die Pakete CC bis CF)

Kapitel 4 spielt in der Druckerstadt **Calderwick**. Verbindliche Vorlage ist **Geschichte 1** aus Paket AC: **`docs/story/kapitel3/geschichte_1.md`** (Prämisse, Anschluss an die vier Wexmoor-Enden, sechs Terrassen, zehn Figuren, Gegenspieler Oswin Wetherby, Kernmechanik „Bürgen und Abgleich“, 5 Akte x 4 Fährten, drei Wendepunkte, vier Enden). Lies sie zuerst ganz. Der dort beschriebene Anschluss an Wexmoor wird **nicht** übernommen: Kapitel 4 schließt an die vier **Dunscar-Enden** von Kapitel 3 an (siehe unten). Geschichte 2 (Briarholt) wird Kapitel 5 und gehört den Paketen CG bis CJ.

Vieles ist schon da. Der **Vorrat** aus den Paketen BH bis BM liegt im Repo und ist verbindlich; erfinde nichts doppelt:
- Figuren: `docs/story/vorrat_figuren/` (BJ): `npcs.json`, `dialogues.json` (je 10 Knoten), `steckbriefe.md`, `auftragskeime.json` (`bj_keim_cw_*`), `reaktionen.json`. Grafik dazu: Batch `vorrat2` (BK), Lauf-Sheet-Id = Figur-Id.
- Gegner und Bosse: `docs/story/vorrat_gegner/` (BH): `encounters.json`, `bosses.json`, `phasen.json`, `bestiarium.json`, `dialogues.json` (Bossabläufe, friedliche Lösungen), `zonen_vorschlag.json`, `verhalten.md`. Grafik: Batch `vorrat1` (BI) mit sieben Kampf-Hintergründen für die Zonen.
- Gegenstände: `docs/story/vorrat_items/` (BL): `items.json` (72 Ids `vi_*`), `artifacts.json`, `fundstuecke.json`, `handel.json`. Grafik: Batch `vorrat3` (BM).
Vorrats-Ids werden **benutzt, nicht kopiert**: Beim Einbau wandern BH/BJ/BL als eigene Packs ins Spiel. Dein Paket verweist auf ihre Ids und ergänzt nur, was fehlt (mit deinem Präfix).

Vier Pakete bauen Kapitel 4 gleichzeitig. Damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so und lege nichts an, was einem anderen Paket gehört.

**Stadt:** `calderwick` (Feld `city` auf allen Karten). Ende Kapitel 3 setzt `kapitel3_done` und eines von `k3a_end_feierabend`, `k3a_end_stilllegung`, `k3a_end_gegenstimme`, `k3a_end_vollzaehlig`. Kapitel 4 startet mit Flag `k4_arrived`, Ende Kapitel 4 setzt `kapitel4_done` und eines von `cwa_end_widerspruch`, `cwa_end_amtsinhaber`, `cwa_end_buecher`, `cwa_end_ordnung`.

**Karten** (Daten: CD, Grafik: CE)
| ID | Was |
|---|---|
| `cw_gleisfuss` | Terrasse 1: Güterbahnhof, Schrägaufzug, Stationsschilder mit fehlenden Buchstaben (Ankunft) |
| `cw_setzergasse` | Terrasse 2: Druckereien, Pressen hinter beschlagenen Fenstern, stillgelegte Buchbinderei |
| `cw_quittungsmarkt` | Terrasse 3: Händler mit mündlichen Schulden, Pfandhaus, Streiktopf |
| `cw_roehrenhof` | Terrasse 4: Verwaltungsviertel, Rohrpost in den Fassaden, Warenbahn zur Sortierhalle |
| `cw_witwenterrasse` | Terrasse 5: schmale Wohnhäuser mit gemeinsamen Küchen, leere Türschilder |
| `cw_kronenarchiv` | Terrasse 6: Archiv, Direktorenvilla, vertrockneter Ziergarten |
| `cw_buchbinderei` | Innenraum: Klammers Werkstatt, **Unterschlupf** (Bett, Ofen, Lager, Fallwand, Bürgenbrett) |
| `cw_gepaeckhalle` | Innenraum: Gepäckhalle am Gleisfuß, Veras Schalter, leeres Fahrgastbuch |
| `cw_pfandhaus` | Innenraum: Lotties Pfandhaus, Regale mit Gegenständen fremder Herkunft |
| `cw_sortierhalle` | Innenraum: Sortierhalle der Warenbahn, Fahrplan mit Personen als Leerfracht, Sichtfenster der Kabine |
| `cw_kueche` | Innenraum: Gemeinschaftsküche der Witwenterrasse, Noels Herd, zwei gedeckte Teller |
| `cw_archivsaal` | Innenraum: Lesesaal und Gehaltslisten des Kronenarchivs, Wartungsgang |
| `cw_villa` | Innenraum: Wetherbys Villa, Rechenblatt, Rohrpostzentrale |
| `cw_druckkammer` | Finale: Hauptpresse unter dem Archiv, Austrittsliste, Endgespräch/-kampf mit Wetherby |
| `cw_alte_setzerei` | Gefahrengebiet tier 5, Boss `vg_cw_boss_bleisammler` (BH), Vorschlag `vg_zone_cw_setzerei` |
| `cw_sortiergrube` | Gefahrengebiet tier 5, Boss `vg_cw_boss_blinder_zusteller`, Vorschlag `vg_zone_cw_sortiergrube` |
| `cw_nullfundament` | Gefahrengebiet tier 6, Boss `vg_cw_boss_nullfundament`, Vorschlag `vg_zone_cw_nullfundament` |
| `reise_landstrasse` | Reisegebiet zwischen Dunscar, Calderwick und Briarholt, Vorschlag `vg_zone_all_landstrasse` (Daten: CD) |

**Figuren** (BJ-Ids, Grafik BK): `cw_crayford` (Tilda „Klammer“ Crayford, Verbündete, Buchbinderei), `cw_ida_bellcross` (verschleppte Setzerin), `cw_noel_bellcross` (Koch), `cw_wetherby` (Direktor, Gegenspieler, Faden Seq 5), `cw_darnell` (Vera, Stationsschreiberin), `cw_hesk` (Bramwell, Träger), `cw_wicksend` (Lottie, Pfandleiherin), `cw_bexley` (Gideon, Hauswart), `cw_malliver` (Ruth, Restauratorin), `cw_pritch` (Ewan, Druckergesellen). Reisefiguren `vn_*` (BJ) auf der Landstraße. Gastauftritte per Brief oder Telegramm: `k3_pfiff`, `marlowe`, `zunder`; niemand aus den alten Städten reist mit.

**Gegner** (BH-Ids, Grafik BI): normal `vg_cw_letternlaeufer`, `vg_cw_rohrpostwespe`, `vg_cw_stempelhand`, `vg_cw_durchschlag`, `vg_cw_registerratte`, `vg_cw_seilbahnwaechter`, `vg_cw_tintenschatten`, `vg_cw_leerfracht`; Landstraße `vg_all_*`; Bosse `vg_cw_boss_bleisammler` (Akt I), `vg_cw_boss_blinder_zusteller` (Akt II), `vg_cw_boss_nullfundament` (Akt V, drei Abschnitte aus `phasen.json`), dazu `vg_all_boss_landvermesser` / `vg_all_boss_schlafkutsche` als Reiseereignis. Wetherby selbst ist **kein** Kampfboss: das Finale ist ein Verhör mit optionalem Kampf gegen `cwa_registerleib_rest` (CC schreibt Texte, CD die Werte).

**Gegenstände** (BL-Ids, Grafik BM): Schlüsselstücke `vi_k_cw_randkorrektur`, `vi_k_cw_ungestempelter_durchschlag`, `vi_k_cw_falsche_quittung`, `vi_k_cw_pfandzettel`, `vi_k_cw_heizungsrohr_skizze`, `vi_k_cw_streiktopf_auszug`; Ausrüstung `vi_hut_setzerkappe`, `vi_mantel_druckerschurz`, `vi_mantel_archivrobe`, `vi_amulett_bleiletter`, `vi_amulett_rohrpostkapsel`, `vi_waffe_setzhaken`, `vi_waffe_bleihammer`; Verbrauch `vi_v_setzerbrot`, `vi_v_terrassentee`, `vi_v_durchschlagpapier`, `vi_v_rohrpostmarke`; Artefakte `vi_art_das_leere_tuerschild`, `vi_art_der_erste_durchschlag`, `vi_art_der_stille_stempel`, `vi_art_der_falsche_fahrplan`.

**Sequenzen:** Die Kernzutaten Seq 3 bis 1 fallen bereits in Dunscar (Vorhauer, Vielrufer, Unterschicht). Calderwicks Bosse geben **Ersatzquellen**: Bleisammler → `sq_zutat_<pfad>_3`, Blinder Zusteller → `sq_zutat_<pfad>_2`, Nullfundament → `sq_zutat_<pfad>_1`, jeweils nur für den eigenen Pfad (`requires_pathway`) und nur, wenn der Spieler die Zutat noch nicht hat (`hide_if_items`). Keine neuen Pfade, Rituale oder Formeln. Fährte IV.3 der Geschichte („Der vierte Satz“) liefert einen Lesetext zur Herkunft der Formeln, keine Rezeptdaten.

**Kernmechanik „Bürgen und Abgleich“** (Spezifikation und Grundgerüst: CD; Daten: CC): Namensanker `cwa_anker_<ort>_<quelle>` (Flags), bis zu drei markierte Verbindungen, Abgleiche nur durch beschriftete Hauptaktionen. Bis der Code da ist, muss jeder Abgleich als Dialog mit `requires_flags` spielbar sein, damit kein Akt blockiert.

**Präfixe für neue IDs:** CC `cwa_`, CD `cwo_`, CE Batch `calderwick1` (Dateien `cw_*`), CF `cwn_`. Flags anderer Pakete sind tabu; was du von einem anderen Paket brauchst, schreib in `offene_punkte.md`.

**Erst lesen (Pflicht):** `docs/story/kapitel3/geschichte_1.md`, `docs/story/kapitel3/story_bisher.md`, `src/data/packs/k3_akte/` (wie Kapitel 3 gebaut ist: Akte, Fakten, Deduktionen, Enden, Epiloge, Zeitung), `src/data/packs/k3_orte/` (Karten, Zonen, Bosse, Reise), die drei Vorrats-Ordner. Ton und Detailtiefe wie in Kapitel 3.


## 1. Tilesets (je `tilesets/cw_<name>.png`, 16x16, 8 Spalten, Zellenliste im Manifest)
| Thema | Inhalt |
|---|---|
| `cw_terrasse` | Kalkstein-Pflaster hell und trocken (4), rußige Regenrinnen (gerade, Ecke, Gully), Terrassenkanten mit Geländer (oben, unten, Treppe hinab), Stützmauern aus Kalk mit Rußfahnen, Fassaden aus gelblichem Kalkstein mit schwarzen Fensterrahmen (oben, Fläche, Ecken, Fenster dunkel/erleuchtet/beschlagen, Türen), Rohrpost-Rohre an Fassaden (gerade, Bogen, Abzweig, Klappe), leere Türschilder, vertrocknete Beete |
| `cw_gleis` | Güterbahnhof: Gleise, Prellbock, Laderampe, Schrägaufzug-Schienen (schräg, 4 Kacheln), Stationsschild-Kacheln mit herausgefallenen Buchstaben (als Lücken, nie lesbare Schrift), Gepäckkarren-Spuren |
| `cw_druckerei` | Innenräume Setzergasse: Holzdielen voller Lettern, Pressen-Fundamente, Setzkästen als Wand, Papierstapel, Buchbinderei (Werkbank, Pressen, Fallwand-Pinnwand) |
| `cw_amt` | Innenräume Röhrenhof/Archiv: Marmorboden kalt, Aktenwände, Rohrpostzentrale, Lesesaal-Teppich, Wartungsgang aus Blech, Gehaltslisten-Regale |
| `cw_kueche` | Witwenterrasse innen: Fliesen, langer Herd, Gemeinschaftstische, Geschirrregale, zwei gedeckte Teller als eigene Kachel |
| `cw_fundament` | Nullfundament: älteres Mauerwerk unter dem Archiv, Namensnischen (leer, mit verblassender Schrift als Kratzer, mit türkisem Schimmer 4 Frames), eingestürzte Register-Regale, Druckwalzen als Säulen |

## 2. Props (je `props/cw_<thema>.png`, Namen im Manifest als `regions`)
- **Gleisfuß:** Schrägaufzug-Kabine (32x32, 2 Frames Wackeln), Gegengewicht, Gepäckhalle-Schalter mit Gitter, leeres Fahrgastbuch auf Pult, Stationsschild-Ständer (3 Varianten), Güterwaggon offen/geschlossen (48x32).
- **Setzergasse:** Druckerpresse (32x32, 4 Frames Walze), Setzkasten, Brotdose mit Lettern, beschlagenes Schaufenster (2 Frames Tropfen), Papierballen, Streiktopf (Kessel mit Suppe, 2 Frames Dampf).
- **Quittungsmarkt:** Marktstände (3), Pfandhaus-Fassade mit drei Kugeln, Schuldscheine an Nagelbrett, Waage, Kiste „nachprüfbare Herkunft“ (ohne Schrift: Siegelband).
- **Röhrenhof:** Rohrpost-Station (16x32, 4 Frames Kapsel zischt), Warenbahn-Kabine (32x32, geschlossen, Fenster abgeklebt), Sortierhalle-Fahrplantafel ohne Schrift, Sichtfenster mit Messingrahmen, Stempelhand-Automat.
- **Witwenterrasse:** Hauseingänge mit leerem Türschild, Heizungsrohr mit Horchstelle, Wäscheleine, Picknicktisch, Klopfzeichen-Tür (2 Frames).
- **Kronenarchiv:** Archivportal, Direktorenvilla-Fassade (64x48), vertrockneter Ziergarten (Brunnen trocken, Statue ohne Gesicht), Hauptpresse (64x48, 4 Frames), Austrittsliste-Pult, Rechenblatt-Schreibtisch.
- **Unterschlupf (Buchbinderei):** Bett, Ofen (2 Frames Licht), Kiste, Fallwand, **Bürgenbrett** (32x32: Pinnwand mit drei Fäden zwischen Marken, 3 Zustände: leer, zwei Marken verbunden, drei verbunden), Buchpresse.
- **Abgleich-Effekte** `fx/cw_abgleich.png`: betroffene Straße als Kachel-Overlay (16x16, 4 Frames, graues Flimmern wie verblassende Tinte, gerade/Kurve/Ende), gefährdeter Kontakt als Symbol über der Figur (16x16, 4 Frames, Türschild, das sich leert), stabile Verbindung als dünne Linie (16x16, 2 Frames, bone white), Nebel-Rückweg (48x48, 6 Frames).

## 3. Standseilbahn und Stadtbild
- Schrägaufzug als Übergang zwischen Terrassen: Kabine von der Seite für die Stadtkarte und als Szenenbild `ui/scenes/cw_aufzug.png` 480x270 (Blick aus der Kabine über die Terrassen, Rußfahnen, Rohrpost).
- Szenenbild `ui/scenes/cw_zwei_teller.png` 480x270 (Noels Küche, zwei gedeckte Teller, ein leerer Stuhl) und `ui/scenes/cw_sortierkabine.png` 240x135 (Ida hinter Glas, leerer Messingrahmen unter dem Gesicht).
- Enden: vier Sequenzbilder 240x135 `ui/scenes/cw_ende_widerspruch.png` (Zeugennetz: Fäden zwischen Häusern), `cw_ende_amtsinhaber.png` (du im Direktorenstuhl, Titel auf der Tür, kein Name), `cw_ende_buecher.png` (Evakuierung über den Schrägaufzug, Bücher auf Karren), `cw_ende_ordnung.png` (saubere Stadt, alle Türschilder gleich).

## 4. Kampf-Hintergründe (`battle/bg_cw_<name>.png`, 480x270)
`gleisfuss`, `setzergasse`, `quittungsmarkt`, `roehrenhof`, `witwenterrasse`, `kronenarchiv`, `druckkammer`, `landstrasse_tag`, `landstrasse_nacht`. Die drei Zonen-Hintergründe (Setzerei, Sortiergrube, Nullfundament) liefert BI: **nicht** doppelt machen; prüfe `public/sprites/manifest-vorrat1.json`.

## 5. Stadtkarte und Titel
- Stadtkarte `ui/cw_karte.png` (Größe wie `ui/ds_karte.png`): sechs Terrassen übereinander, Schrägaufzüge als Striche, Nebel-Overlay `ui/cw_karte_nebel.png`, Marker `ui/cw_marker.png` für alle Karten aus den Eckdaten.
- Kapitelkarte `ui/scenes/kapitel4_karte.png` 480x270, ohne Text: der Gleisfuß bei Ankunft, ein Stationsschild mit Lücken, darüber die Terrassen im Rußregen.
- Reisekarte-Ausschnitt `ui/landstrasse_karte.png` 240x135: Dunscar, Calderwick, Briarholt als drei Punkte mit Landstraße, Zollhaus, Grenzstein.

## 6. Lieferung
Alle Dateien oben, Manifest, Prüfskript, Vorschau, `docs/art/README.md`-Abschnitt. Pull Request nur mit deinen Dateien.

