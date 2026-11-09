# Codex-Batch AV: Dunscar, Kacheln, Gebäude, Innenräume und der Nachtzug

**Batch-Name:** `dunscar1` (Manifest: `public/sprites/manifest-dunscar1.json`)

Kapitel 3 spielt in Dunscar. Die Karten baut gleichzeitig Paket AS, du machst die Grafik dafür. Figuren macht AW, Gegner AX.

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

## 0. Gemeinsame Regeln für diese Datei (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**: Style-Block, Maße, Ablage und Nachbearbeitung stehen hier, du brauchst keine andere Prompt-Datei.

**Hinweis Setting:** Dunscar ist eine stillgelegte Kalkbergbau-Stadt auf einer weiten, baumarmen Kalkhochebene: heller Kalkstein, weißer Staub, rostige Schienen, Holzgerüste, Signalmasten, Wind, leere Bahnsteige, Gaslicht nur noch spärlich. Gedämpftes Weiß, Ocker, Rostbraun, Schiefergrau; Türkis und Violett nur für Übernatürliches (Rufe, Nachhall). Wo der Style-Block „Kettlegate“ sagt, gilt Dunscar mit derselben melancholischen Stimmung.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial city called Kettlegate with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Maße
| Was | Größe |
|---|---|
| Tile | 16x16 |
| Figur auf der Karte | 16x32 pro Frame; Lauf-Sheet 4 Reihen (unten, links, rechts, oben) x 4 Frames = 64x128 |
| Portrait | 64x64; Emotions-Sheet 4 nebeneinander = 256x64 (neutral, misstrauisch, erschrocken, leichtes Lächeln) |
| Kampf-Figur (Mensch) | 48x48 pro Frame, Blick nach links (Gegner) bzw. rechts (Spieler) |
| Kampf-Gegner (übernatürlich) | 64x64 pro Frame |
| Kampf-Hintergrund | 480x270, deckend, untere 70 px flacher Bodenstreifen |
| Effekte | 32x32 oder 48x48 pro Frame, Frames in einer Reihe |
| Item-Icon | 16x16 (zusätzlich 32x32, wo angegeben) |
| UI | 9-slice auf 16er-Raster, Icons 16x16 |

Kampf-Sheets: **6 Spalten**, eine Animation pro Reihe, kürzere Reihen mit transparenten Feldern auffüllen, gleiche Grundlinie in allen Frames. Gegner-Angriffe halten die Ausholpose **2 Frames** lang (Timing-Signal für Ausweichen/Parieren).

### 0.3 Ablage im Repo
- PNGs unter `public/sprites/<ordner>/<dateiname>.png`, Ordner und Dateinamen stehen bei jedem Asset. Die Namen entsprechen den IDs in den Daten, bitte genau so übernehmen.
- Ein Manifest `public/sprites/manifest-dunscar1.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json` bzw. `manifest-wexmoor2.json`. Für Tilesets zusätzlich eine Liste, welche Zelle was ist (wie `THEME_TILES` in `src/world/assets.js`, nur lesen).
- Die tatsächlich verwendeten Prompts in `docs/art/batch-dunscar1-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



Lies vorher `docs/story/kapitel3/geschichte_3.md` Abschnitt 3 (Schauplatz). Stil-Referenz anhängen: vorhandene Bahnhofs-Sheets (`tilesets/` und `props/` mit `c_bahn`/`r_bahnhof`) und ein Wexmoor-Tileset.

---

## 1. Tilesets (je `tilesets/ds_<name>.png`, 16x16, 8 Spalten, Zellenliste im Manifest)
| Thema | Inhalt |
|---|---|
| `ds_stadt` | Kalkstein-Pflaster (4), Kalkstaub-Flecken, rissige Gehwegplatten, Reihenhaus-Wände aus hellem Kalkstein (oben, Fläche, Ecken, Fenster dunkel/erleuchtet, Türen), Ziegel-Schornsteine, niedrige Kalkmauern, Gras in Ritzen |
| `ds_bahn` | Gleise (gerade, Kurven, Weichen, Prellbock), Schotter, Bahnsteig-Kanten, überdachter Bahnsteig, Drehscheibe (rund, 4x4 Kacheln), Signalkabel-Kanäle |
| `ds_bruch` | Kalksteinbruch: Abbruchkanten, Stufen, Schutthalden, Holzgerüste, Leitern, Loren-Gleise, Wasserlachen milchig weiß |
| `ds_schlucht` | tiefe Schlucht: dunkle Felswand mit eingeritzten Haltestellennamen als **unlesbare Kerben**, Brücken aus Holz, Nebel aus Kalkstaub, Felsöffnung mit schwachem türkisem Leuchten (4 Frames) |
| `ds_innen` | Innenräume: Holzdielen, Fliesen (Prüfhaus), Teppich (Teesaal), Wände mit Tapete und Täfelung, Fenster mit Hochebene dahinter |
| `ds_zug` | Innenraum eines alten Personenwagens (Holzbänke, Gepäcknetze, Fenster mit vorbeiziehender Nacht, 4 Frames), Führerstand (Kessel, Regler, Manometer ohne Zahlen) |

## 2. Props (je `props/ds_<thema>.png`, Namen im Manifest als `regions`)
- **Endbahnhof:** Fahrkartenschalter mit Gitter, Wartesaal-Bänke, Bahnhofsuhr ohne Ziffern, Fahrplantafel ohne Schrift, Gepäckkarren, Telegrafen-Tisch, Laterne.
- **Schwellenring:** Runddepot-Tore, Werkbänke, Lokrad, Kohlenhaufen, Wasserkran, Signalmast (Arm oben/unten, 2 Frames).
- **Arbeiterbogen:** gedeckter Tisch vor einem Haus mit leerem Platz, Wäscheleine, Picknicktisch im Wind, Hauseingänge, Brunnen.
- **Kalkmarkt:** Steinmetz-Werkstatt, Grabsteine ohne Namen (4), Trödelstand mit Erinnerungsplatten, Teesaal-Fassade.
- **Bruchstufen/Signalhang:** Gerüste (2 Frames Wanken), Vermessungs-Theodolit, Schaltbude, Prüfhaus-Fassade, Horchstelle (ein Trichter auf einem Pfosten, 4 Frames türkises Pulsieren, wenn aktiv).
- **Speisewagen (Unterschlupf):** Koje, Kohlenofen (Licht, 2 Frames), Esstisch mit Suppe, Wachswalzen-Phonograph (4 Frames drehend), Kiste, Fallwand, Schallschleuse (Tür mit Filzpolster).
- **Prüfhaus:** Trichter, Walzenregale, Messinstrumente, Kopfhörer.
- **Lohnbüro:** Aktenschränke, Stehpult, Lohntüten-Regal.
- **Horchstellen-Effekt** `fx/ds_nachhall.png`: Linien, die sich vom Spieler aus ausbreiten (48x48, 8 Frames) und eine pulsierende Weg-Linie als Kachel-Overlay (16x16, 4 Frames, gerade/Kurve/Ende).

## 3. Der Nachtzug
- Lok und drei Wagen von der Seite für die Karte (`props/ds_nachtzug.png`): schwarz, matt, mit schwach türkis leuchtenden Fenstern; Lok 64x32, Wagen 48x32; 4 Frames Dampf und Fensterflackern. Dazu eine Variante „stillgelegt“ (dunkel, verrostet) für das Ende.
- Szenenbild `ui/scenes/ds_nachtzug.png` 480x270: der Zug fährt nachts über die Hochebene, Schichtgänger an den Fenstern.

## 4. Kampf-Hintergründe (`battle/bg_ds_<name>.png`, 480x270)
`endbahnhof`, `schwellenring`, `arbeiterbogen`, `bruchstufen`, `rangierwueste`, `klopfbruch`, `rufschlucht`, `letzter_bahnsteig`, `unterschicht` (unter der Schlucht: Hohlräume, die Haltestellen-Namen folgen, türkises Leuchten, Gefühl von etwas Großem, das zuhört), `nachtzug` (im Wagen).

## 5. Stadtkarte und Titel
- Stadtkarte `ui/ds_karte.png` (Größe wie `ui/Q_wexmoor_karte.png`), Nebel-Overlay `ui/ds_karte_nebel.png`, Marker `ui/ds_marker.png` für alle Karten aus den Eckdaten (wie `ui/Q_wexmoor_marker.png`).
- Kapitelkarte `ui/scenes/kapitel3_karte.png` 480x270, ohne Text: der Endbahnhof bei Ankunft, ein Fahrkartenschalter mit Licht, dahinter die weiße Hochebene.
