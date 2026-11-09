# Codex-Batch AX: Gegner und Bosse von Dunscar

**Batch-Name:** `dunscar3` (Manifest: `public/sprites/manifest-dunscar3.json`)

Kapitel 3 bringt 6 neue Gegner, 5 Story-Bosse und 10 Sequenz-Prüfungen (eine pro Pfad). Werte und Texte schreiben gleichzeitig die Pakete AS und AU; du machst die Grafik. Lies `docs/story/kapitel3/geschichte_3.md` Abschnitte 3 und 5 und für die Prüfungen die Pfade in `src/data/packs/sequenzen/` und `src/data/pathways.json` (Prinzip, Farbe, Fähigkeiten).

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

**Hinweis Setting:** Dunscar ist eine stillgelegte Kalkbergbau-Stadt auf einer weiten, baumarmen Kalkhochebene: heller Kalkstein, weißer Staub, rostige Schienen, Holzgerüste, Signalmasten, Wind. Gedämpftes Weiß, Ocker, Rostbraun, Schiefergrau; Türkis und Violett nur für Übernatürliches (Rufe, Nachhall). Wo der Style-Block „Kettlegate“ sagt, gilt Dunscar mit derselben melancholischen Stimmung.

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
- Ein Manifest `public/sprites/manifest-dunscar3.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-dunscar3-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."



Für jeden Gegner (normal, Boss, Prüfung): Kampf-Sheet `battle/enemy_<id>.png` (Layout wie die vorhandenen `battle/enemy_*.png`, Manifest dort ansehen; Ausholpose 2 Frames), Karten-Figur `characters/F_ow_<id>.png` (wie die vorhandenen `F_ow_*`), Bestiariums-Bild wie in `ui/bestiary/`. Bosse zusätzlich ein Boss-Band wie `ui/S_08_boss_glockenmutter.png`.

---

## 1. Normale Gegner
| ID | Größe | Beschreibung |
|---|---|---|
| `schichtgaenger` | 48x48 | lebender Arbeiter im Bann des Rufs, Lampe und Spitzhacke, Augen geschlossen; „besiegt“ = sinkt schlafend zusammen, kein Blut |
| `kalkstaubgeist` | 64x64 | Wirbel aus weißem Kalkstaub mit angedeutetem Arbeitergesicht |
| `signalkraehe` | 48x48 | Krähe mit einem kleinen Signallicht im Auge, kreischt Pfeiftöne |
| `lohnlistenmotte` | 48x48 | große Motte aus vergilbtem Papier, Flügel wie Lohnlisten-Seiten ohne Schrift |
| `geruestklang` | 64x64 | ein Holzgerüst, das sich zu einer Gestalt verbiegt und wie ein Glockenspiel klingt |
| `nachhall` | 64x64 | schwache Kopie eines Menschen aus türkisen Linien, wiederholt Bewegungen mit Verzögerung |

## 2. Story-Bosse
| ID | Größe | Beschreibung |
|---|---|---|
| `schwellenhund` | 96x96 | Hund aus Bahnschwellen, Schrauben und Ketten, ein suchendes Signallicht als Kopf |
| `vorhauer` | 96x96 | Steinleib mit Werkzeugspuren statt Gesicht, schlägt eine Klopffolge auf den Boden |
| `vielrufer` | 96x96 | Ansammlung vieler Münder und Trichter in einem Knäuel aus Signalkabeln; Phase 2: die Kabel lösen sich, einzelne Stimmen fliegen auseinander |
| `gallowmere` | 64x64 | der Fahrmeister im Kampf: Pfeife, Signalkelle, Kalkstaub; Phase 2: er wird durchsichtig und hinter ihm stehen die Umrisse der verschollenen Schicht |
| `unterschicht` | 128x96 | der Superboss: das, was unter der Schlucht Namen frisst. Keine klare Gestalt: Hohlräume in Fels, die sich wie ein Mund öffnen, Haltestellen-Kerben, türkisweißes Licht; 3 Phasen in je einer Reihe. Nie eklig, eher erhaben und still |

## 3. Die zehn Sequenz-Prüfungen
Jeder Prüfungsboss verkörpert das Prinzip seines Pfads und trägt dessen Leitfarbe (aus `pathways.json` bzw. `src/data/packs/sequenzen/neue_pfade.json`). Größe 64x64, Phase 2 als zusätzliche Reihe.
| ID | Pfad | Idee |
|---|---|---|
| `k3p_lampengutachter` | laterne | Gutachter mit einer Laterne statt Kopf, prüft, was du verbirgst |
| `k3p_gegenzeugenknuepfer` | faden | Gestalt aus Akten und Fäden, die Aussagen gegeneinander knüpft |
| `k3p_garderobenpfaender` | maske | Garderobier mit vielen Mänteln und Masken an Haken, nimmt dir deine Rolle ab |
| `k3p_pausenfischer` | echo | Angler, der Stille aus der Luft fischt, Haken aus Atem |
| `k3p_chargenpruefer` | kessel | Apotheker mit Glaskolben-Körper, Flüssigkeiten in Schichten |
| `k3p_brueckenpresser` | eisen | eiserne Brückenstrebe mit Nieten, drückt von oben |
| `k3p_zollriegel` | schluessel | blinder Zöllner aus Riegeln und Schlössern |
| `k3p_fristpfaender` | sq_waage | Pfandleiher mit einer Waage als Oberkörper |
| `k3p_schichtsammler` | sq_moor | Gestalt aus Torf- und Kalkschichten, sammelt Namenstäfelchen |
| `k3p_gangaufseher` | sq_uhr | Aufseher mit Uhrwerk-Brust und versetzten Pendeln |

## 4. Rufmuster-Symbole (`ui/ds_rufmuster.png`)
Die Kernmechanik zeigt Rufmuster als **Bildzeichen** (keine Buchstaben, keine Noten): 16 Symbole 16x16 und dieselben in 32x32 aus Strichen, Punkten und Bögen, gut unterscheidbar, Bernstein auf dunklem Grund; dazu Rahmen „bekannt“, „geprüft“, „falsch“. Dazu eine Rufladungs-Anzeige 48x16 (3 Kammern, leer/voll) und ein Horch-Symbol 16x16 für den HUD.
