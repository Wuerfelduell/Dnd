# Codex-Batch BA: Ruf-Oberfläche und Leben in Dunscar (Grafik)

**Batch-Name:** `dunscar4` (Manifest: `public/sprites/manifest-dunscar4.json`)

Zwei Dinge fehlen Dunscar grafisch: die **sichtbare Seite der Rufmechanik** (Paket BN liefert die Logik; Linien, Nischen, Hörkreise und Bindung müssen auf der Karte gezeichnet werden, weil Ton nie die einzige Information sein darf) und das **Leben in der Stadt** (Paket BD legt fest, wo Krähen sitzen und wann Kalkstaub treibt; Vorbild ist Paket AE für Wexmoor: `public/sprites/fx/AE_wexmoor_tiere.png`, `AE_wexmoor_wetter.png`, `src/world/WexmoorLife.js`). Dazu die eine Figur aus Kapitel 3, die noch eine geliehene Grafik trägt: Ruth Bellwick (`k3n_secondhaendler`, bisher `npc:hesper`).

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

## Eckdaten Runde 5 (gilt für die Pakete BA bis BG und BN, Stand 2026-11-10)

Kapitel 3 ist spielbar (Pakete AR bis AY sind eingebaut, siehe `src/data/packs/k3_*`, `src/core/Signals.js`, `src/core/MusicDirector.js`). Runde 5 füllt die Lücken. Acht Pakete laufen **gleichzeitig**; damit sie zusammenpassen, sind diese IDs **fest vergeben**. Benutze sie genau so, lege nichts an, was einem anderen Paket gehört, und schreib alles, was du von einem anderen Paket brauchst, in deine `offene_punkte.md`.

| Paket | Name | Liefert | Schreibt nach |
|---|---|---|---|
| BN | `k3_ruf` | Rufextras: Linienprojektion, Hörreichweite, private Bindung, Klang-Zuordnung, Stationsdaten (Code-Gerüst + Daten) | `src/core/SignalRoutes.js`, `src/data/packs/k3_ruf/`, `tests/k3_ruf.test.js`, `docs/story/k3_ruf/` |
| BA | `dunscar4` | Grafik: Ruf-Oberfläche, Dunscar-Leben (Tiere, Wetter, Stände), Ruth Bellwick | Batch `dunscar4` |
| BB | `icons2` | Grafik: alle noch geliehenen Item-Icons (40), Tränke und Formeln der neuen Pfade 9 bis 5 und aller Pfade 4 bis 1 | Batch `icons2` |
| BC | `k3_handel` | Daten: 3 Händler, Zirkel „Schichtbund“ mit Auktion, 5 Einzelgänger mit Bindung | `docs/story/k3_handel/` |
| BD | `k3_leben` | Daten: Einwohner mit Tagesplänen, Gerede je Akt, Kopfgeld-Brett mit 6 Stadtgegnern, Zeitung „Dunscarer Kalkblatt“, Tier- und Wetterzuordnung | `docs/story/k3_leben/` |
| BE | `dunscar5` | Grafik: Figuren aus BC und BD (Händler, Zirkel, Einzelgänger, Einwohner), 11 Gegner-Sheets | Batch `dunscar5` |
| BF | `koop_k3` | Texte: Koop in Dunscar (Geplauder, Reaktionen, Rufen zu zweit, 2 Aufträge) | `docs/story/koop_k3/` |
| BG | `koop_beute` | Getrennte Beute im Koop: Ansprüche je Spieler, Ersatz verlorener Tränke (Code-Gerüst + Daten + Texte) | `src/core/Claims.js`, `src/data/packs/koop_beute/`, `tests/koop_beute.test.js`, `docs/story/koop_beute/` |

**Feste IDs dieser Runde** (Daten: BC/BD/BF, Grafik: BA/BE):
- Händler (BC): `k3h_troedlerin` (Ida Marrow, Trödel am Kalkmarkt), `k3h_steinmetz` (Bram Tolley, Steinmetzhof am Kalkmarkt), `k3h_lampenwart` (Cato Finch, Schaltbude am Signalhang). Mabel (`k3_mabel`) bekommt über `dialog_zusaetze` einen kleinen Ausschank, keine neue Figur.
- Zirkel (BC): `schichtbund` („Der Schichtbund“), Treffpunkt-Karte `treffen_schichtbund` (Innenraum unter dem Runddepot), Gastgeberin `zirkel_schichtbund` (Agathe Rooke, „die Stempelmeisterin“), Mitglieder `tm_ds_lampe` (Lampenputzer Wim), `tm_ds_kerbholz` (Kerbholzschreiberin Dora), `tm_ds_stimme` (Walzenhändler Rufus). Mitgliedsflag `treffen_schichtbund`, `city: "dunscar"`, Reihenfolge `rules.orders.dunscar: ["schichtbund"]`.
- Einzelgänger (BC, je ein Pfad, Bindung -3 bis 3 wie in `src/data/wexmoor.json` → `loners`): `ez_ds_rangierer` (eisen), `ez_ds_kalkbrennerin` (kessel), `ez_ds_streckenlaeufer` (sq_uhr), `ez_ds_walzenstimme` (echo), `ez_ds_schrankenkind` (sq_moor).
- Einwohner ohne Namen (BD, Roamer mit Tagesplan): `k3e_schichtwitwe`, `k3e_kalkjunge`, `k3e_wagenputzer`, `k3e_zeitungsfrau`, `k3e_bahnbettler`, `k3e_steinmetzgeselle`, `k3e_teesaalgast`, `k3e_signalkind`.
- Kopfgeld (BD, Brett im `ds_lohnbuero`): Gegner `k3k_kupferdieb`, `k3k_schienenlaeufer`, `k3k_lohnfaelscher`, `k3k_staubschmuggler`, `k3k_walzenhehler`, `k3k_signalbrecher`; Aufträge `kopfgeld_ds_<gegner>`.
- Tiere und Wetter (BD ordnet zu, BA zeichnet): Tiere `ds_kraehe`, `ds_kalkziege`, `ds_staubteufel`, `ds_motte`, `ds_eidechse`, `ds_schwalbe`; Wetter `kalkstaub`, `wind`, `nachtnebel`.
- Zeitung (BD): die vorhandene Dunscar-Zeitung `dunscarer_kalkblatt` (siehe `src/data/packs/k3_nebenquests/zeitung.json`), **keine** neue Zeitungs-ID.
- Ruf-Oberfläche (BN beschreibt, BA zeichnet): Sheet `ui/ds_ruflinien.png` mit Regionen `linie_vorschau`, `linie_aktiv`, `linie_echo`, `linie_fehl`, `ecke_*`, `nische`, `hoerkreis`, `bindung`, `notladung`, `schleuse_zu`, `schleuse_auf`, `horchtrichter`; Journal-Tab-Rahmen `ui/ds_rufjournal.png`.
- Koop Dunscar (BF): Geplauder `koop_pl_ds_01` bis `_40`, Aufträge `koop_ds_horchen`, `koop_ds_schleuse`, Rollenobjekte `koop_ds_<auftrag>_p1`/`_p2`.
- Koop-Beute (BG): Dialog-Bedingungen `requires_claim`, `requires_claim_missing`, Effekt `claim`; Flags `p2_` wie bisher.

**Präfixe für neue IDs:** BN `k3r_`, BC `k3h_` (Händler), `tm_ds_` (Mitglieder), `ez_ds_` (Einzelgänger), BD `k3e_` (Einwohner), `k3k_` (Kopfgeld), BF `koop_ds_`, BG `k3b_`. Flags anderer Pakete sind tabu.

**Was es schon gibt (nicht neu anlegen):** die 11 Figuren `k3_*`, 6 Gegner, 5 Bosse, 10 Prüfungen, 18 Karten `ds_*`, 12 Nebenaufträge `k3n_*`, Rufmuster `k3a_ruf_*` (`docs/story/k3_akte/rufmuster.json`), Horchstellen `k3o_horch_*` (`docs/story/k3_orte/rufmechanik.md`), Rufladungen (`src/core/Signals.js`), Dunscar-Musik und 16 Rufklänge `ds_ruf_01` bis `ds_ruf_16` mit Nachhall `ds_hall_*` (`public/audio/manifest-klang-dunscar.json`).

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
- Ein Manifest `public/sprites/manifest-dunscar4.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-dunscar4-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."


## 1. Ruf-Oberfläche (`ui/ds_ruflinien.png`, Regionen im Manifest)

Alles auf 16er-Raster, Bernstein für Vorschau, Türkis `#6fe0d0` für den bestätigten Nachhall, Rostrot für Fehler, dunkles Blaugrau für Nischen. Jede Form muss sich **ohne Farbe** unterscheiden (Strichmuster, Punkte, Keile), weil die Bedeutung auch für Farbenblinde lesbar sein muss.
| Region | Größe | Frames | Inhalt |
|---|---|---|---|
| `linie_vorschau` | 16x16 | 4 | gestrichelte Linie gerade (waagerecht; der Code dreht), wandernde Striche |
| `linie_aktiv` | 16x16 | 4 | durchgehende pulsierende Linie, Türkis |
| `linie_echo` | 16x16 | 6 | zurücklaufende Punkte (Antwort kommt zurück) |
| `linie_fehl` | 16x16 | 4 | gezackte abbrechende Linie, Rostrot |
| `ecke_vorschau`, `ecke_aktiv`, `ecke_fehl` | 16x16 | je 2 | Richtungswechsel 90° (eine Ecke; der Code spiegelt) |
| `ende_vorschau`, `ende_aktiv` | 16x16 | 3 | Linienende mit kleinem Antwortzeichen (Kreis, Keil) |
| `nische` | 16x16 | 2 | sichere Nische: Bodenmarkierung, halbrunder Schutzbogen, ruhig blinkend |
| `hoerkreis` | 48x48 | 3 | Hörreichweite eines Lauschers: feiner gepunkteter Ring (der Code skaliert in 16er-Schritten), Ausschlag beim Alarm |
| `alarm` | 16x16 | 4 | Alarmzone-Kachel (Flächen-Overlay, halbtransparent wirkend durch Dithering) |
| `bindung` | 16x16 | 4 | HUD-Symbol „gebunden“: Namensband um einen Trichter, Türkis, atmend |
| `bindung_p2` | 16x16 | 4 | dieselbe Form mit dem Spieler-2-Ton (kühles Blau aus `AH`) |
| `notladung` | 16x16 | 2 | Notladungs-Marker an einer Station: Messingkammer, voll/leer |
| `schleuse_zu`, `schleuse_auf` | 32x48 | je 3 | Schallschleuse (Doppeltür mit Filzdichtung), geschlossen pulsierend, Öffnen in 3 Frames |
| `horchtrichter` | 32x32 | 4 | Horchstellen-Prop: Messingtrichter auf Stativ mit Hörschlauch, leicht schwingend |
| `richtungspfeil` | 16x16 | 4 | wählbare Richtung (einer, der Code dreht): Keil mit Punkt, Auswahl-Zustand |
| `sprecher_1`, `sprecher_2` | 16x16 | je 1 | wer ruft (Pfeife-Symbol mit 1 bzw. 2 Kerben, keine Ziffern) |

Dazu `ui/ds_rufjournal.png`: 9-Slice-Rahmen (48x48, 16er-Ränder) für den Journal-Tab „Rufmuster“, drei Zustandsrahmen für ein Muster (bekannt, geprüft, falsch; 20x20, passend zu den 16x16-Symbolen aus `ui/ds_rufmuster.png` von AX), ein Tab-Icon 16x16 (Trichter), ein Zeilenhintergrund 160x24 für Form-Text.

## 2. Leben in Dunscar (`fx/BA_dunscar_tiere.png`, `fx/BA_dunscar_wetter.png`)

Tiere wie bei AE (benannte Regionen, Frames nebeneinander, 16x16 außer angegeben):
`ds_kraehe_sitzen` (2), `ds_kraehe_auffliegen` (4), `ds_kraehe_fliegen` (4), `ds_kalkziege_stehen` (2), `ds_kalkziege_laufen` (4), `ds_kalkziege_klettern` (2, 16x32), `ds_staubteufel` (6, 16x32, weißer Wirbel), `ds_motte_kreisen` (4), `ds_eidechse_sitzen` (2), `ds_eidechse_huschen` (4), `ds_schwalbe_fliegen` (4), `ds_schwalbe_sitzen` (1). Wetter als 240x135-Overlays (der Code kachelt 2x2): `kalkstaub` (4 Frames, treibende weiße Schlieren, dünn), `wind_grasbueschel` (ein 16x16-Prop, 4 Frames, der Code setzt es auf Graskacheln), `nachtnebel_1`, `nachtnebel_2` (je 1, dunkler als Wexmoor-Nebel, violetter Stich).

Zehn Marktstände als Props (`props/BA_staende.png`, 32x32 je Stand, Kalkmarkt: Kreide, Kalkpastillen, Trödel, Stein, Tee, Werkzeug; Arbeiterbogen: Kartoffeln, Zeitungen, Kerzen, Flickzeug), jeder mit einer Variante „nachts geschlossen“ (Plane darüber). Sprechblasen-Sheet wie `ui/AE_zeitung.png` wiederverwenden, keine neue.

## 3. Ruth Bellwick (`k3n_secondhaendler`)

Lauf-Sheet `characters/k3n_secondhaendler_walk.png` (64x128), Emotions-Sheet `portraits/k3n_secondhaendler_emotions.png` (256x64, neutral, misstrauisch, erschrocken, leichtes Lächeln), zweite Reihe wie AK als `portraits/AK_k3n_secondhaendler_emotions2.png` (wütend, traurig, nachdenklich, entschlossen), Kopf 24x24. Beschreibung aus `docs/story/k3_nebenquests/grafikwuensche.md`: ältere Händlerin, moosgrauer Mantel, dunkler Hut, schmale Plattenhülle unter dem Arm, Kalkstaub am Saum.

## 4. Abgabe

Manifest `manifest-dunscar4.json` mit allen Regionen (x, y, Breite, Höhe, Frames, fps), Prompts in `docs/art/batch-dunscar4-generation.json`, Vorschau-PNG, Eintrag in `docs/art/README.md`. Keinen Spielcode ändern.
