# Codex-Batch BK: Vorrat an Figuren (Grafik)

**Batch-Name:** `vorrat2` (Manifest: `public/sprites/manifest-vorrat2.json`)

## Eckdaten „Vorrat“ (gilt für die Pakete BH bis BM, Stand 2026-11-10)

Diese Pakete bauen **Vorrat für spätere Kapitel**: Gegner, Figuren und Gegenstände, die fertig im Repo liegen, bevor ein Kapitel 4 geschrieben wird. Grundlage sind die beiden aufgehobenen Geschichten aus Paket AC: **`docs/story/kapitel3/geschichte_1.md`** („Die Stadt ohne Unterschrift“, Druckerstadt **Calderwick** auf sechs Kalkterrassen, Rohrpost, Register, Gegenspieler Oswin Wetherby) und **`docs/story/kapitel3/geschichte_2.md`** („Der Garten der fehlenden Tage“, Kurort **Briarholt** mit Glasgärten und Heizrohren, Gegenspielerin Dr. Meriel Greavesend). Lies beide ganz. Was dort steht, ist verbindlich; was fehlt, erfindest du im selben Ton. Dazu kommt ein **allgemeiner Vorrat** ohne Stadt (Landstraße, Reise, Wildnis), der in jedem Kapitel einsetzbar ist.

Sechs Pakete laufen gleichzeitig: Daten/Texte (BH Gegner, BJ Figuren, BL Gegenstände) und Grafik (BI, BK, BM). Damit sie zusammenpassen, gelten diese **festen IDs**. Benutze sie genau so.

| Paket | Name | Liefert | Schreibt nach |
|---|---|---|---|
| BH | `vorrat_gegner` | Werte, Bestiarium, Beute, Verhalten, Boss-Phasen für 24 Gegner und 8 Bosse | `docs/story/vorrat_gegner/` |
| BI | `vorrat1` | Grafik zu BH (Kampf-Sheets, Kartenfiguren, Bestiarium, Boss-Bänder, Kampf-Hintergründe) | Batch `vorrat1` |
| BJ | `vorrat_figuren` | 20 Figuren aus den beiden Geschichten + 8 Reisefiguren: Steckbrief, Stimme, Dialogbäume, Nebenauftrags-Keime | `docs/story/vorrat_figuren/` |
| BK | `vorrat2` | Grafik zu BJ (Lauf-Sheets, 8 Stimmungen, Köpfe, Sonderposen) | Batch `vorrat2` |
| BL | `vorrat_items` | 72 Gegenstände mit Werten und Texten (Ausrüstung, Waffen, Verbrauch, Artefakte, Handelswaren, Schlüsselstücke) | `docs/story/vorrat_items/` |
| BM | `vorrat3` | Icons zu BL und zu den Trophäen aus BH (16 und 32) | Batch `vorrat3` |

**Zielniveau:** Kapitel 4 spielt nach Dunscar, also Sequenz **4 bis 3**. Normale Gegner wie `src/data/packs/k3_orte/encounters.json` mal 1,3; Bosse wie `vorhauer`/`vielrufer` (`bosses.json`, `phasen.json`) mal 1,3. Ausrüstung eine Stufe über den Dunscar-Belohnungen. Keine Kernzutaten (die vergibt das Sequenz-System).

**Gegner (BH Werte, BI Grafik):**
- Calderwick, normal (Präfix `vg_cw_`): `vg_cw_letternlaeufer` (Haufen ausgesonderter Lettern auf Beinen), `vg_cw_rohrpostwespe` (Messingkapsel mit Flügeln), `vg_cw_stempelhand` (abgetrennter Ärmel mit Dienststempel), `vg_cw_durchschlag` (blasse Kopie eines Menschen aus Kohlepapier), `vg_cw_registerratte` (Ratte mit Aktenstreifen im Fell), `vg_cw_seilbahnwaechter` (Standseilbahn-Bremser ohne Gesicht), `vg_cw_tintenschatten`, `vg_cw_leerfracht` (Postsack, der sich bewegt).
- Calderwick, Bosse: `vg_cw_boss_bleisammler` (Alte Setzerei, aus Geschichte 1), `vg_cw_boss_blinder_zusteller` (Sortiergrube), `vg_cw_boss_nullfundament` (unter dem Archiv, drei Phasen).
- Briarholt, normal (Präfix `vg_bh_`): `vg_bh_dampfschwester` (Pflegerin aus Dampf, Haube), `vg_bh_wurzelgaenger` (Patient mit Wurzeln statt Händen), `vg_bh_glasmotte` (Motte aus beschlagenem Glas), `vg_bh_bluetenkopf` (Pfirsichblüte mit Gesicht, bewegungslos bis man nahe kommt), `vg_bh_rohrwurm` (Heizrohr-Segment, das kriecht), `vg_bh_postkartenschreiber` (Kurgast, der denselben Satz murmelt), `vg_bh_waeschegeist`, `vg_bh_sudtraeger` (Kessel mit Beinen, kocht).
- Briarholt, Bosse: `vg_bh_boss_glasgaertner` (Kaltes Palmhaus, aus Geschichte 2), `vg_bh_boss_waescherei` (Verlassene Wäscherei, der verdichtete Dampf), `vg_bh_boss_mutterwurzel` (Wurzelkammer, drei Phasen).
- Allgemein, Landstraße und Reise (Präfix `vg_all_`): `vg_all_wegelagerer`, `vg_all_kutschengeist`, `vg_all_zollhund`, `vg_all_nebelkraehe`, `vg_all_marktschreier` (Betrüger, Dialog vor dem Kampf), `vg_all_grenzstein` (Stein, der die Richtung ändert), `vg_all_fuhrmannsschatten`, `vg_all_brueckenzoll` (Zöllner ohne Brücke).
- Allgemein, Bosse: `vg_all_boss_landvermesser` (zählt Schritte, Reise-Boss), `vg_all_boss_schlafkutsche` (Kutsche voller schlafender Reisender).
- Trophäen (BH definiert, BM zeichnet): je Gegner und Boss ein Item `vt_<gegner ohne vg_>` (z. B. `vt_cw_letternlaeufer`), 34 Stück.

**Figuren (BJ Texte, BK Grafik):** die zehn Figuren aus Geschichte 1 als `cw_<nachname klein>` (`cw_crayford`, `cw_ida_bellcross`, `cw_noel_bellcross`, `cw_wetherby`, `cw_darnell`, `cw_hesk`, `cw_wicksend`, `cw_bexley`, `cw_malliver`, `cw_pritch`), die zehn aus Geschichte 2 als `bh_<nachname klein>` (`bh_bellweather`, `bh_orla_fencrest`, `bh_felix_fencrest`, `bh_greavesend`, `bh_vellish`, `bh_malkin`, `bh_rookwell`, `bh_henshall`, `bh_crowther`, `bh_dipple`). Dazu acht Reisefiguren ohne Stadt (Präfix `vn_`): `vn_kutscherin`, `vn_zoellner`, `vn_hausiererin`, `vn_landarzt`, `vn_wanderprediger`, `vn_kartenzeichnerin`, `vn_fahrender_richter`, `vn_waisenjunge`.

**Gegenstände (BL Werte, BM Icons, Präfix `vi_`):** 12 Ausrüstungsstücke (`vi_hut_*`, `vi_mantel_*`, `vi_amulett_*`, je 4), 6 Waffen (`vi_waffe_*`), 16 Verbrauchsgegenstände (`vi_v_*`), 8 Artefakte (`vi_art_*`), 18 Handelswaren und Materialien (`vi_m_*`), 12 Schlüssel- und Fundstücke für die beiden Geschichten (`vi_k_cw_*`, `vi_k_bh_*`, je 6). Die genauen Namen legt BL fest; BM zeichnet nach BLs Tabelle **oder**, wenn BL noch nicht da ist, nach der Beschreibungstabelle im eigenen Paket (beide Pakete enthalten dieselbe Tabelle; BM gewinnt bei Abweichungen in der Grafik, BL in den Werten).

**Was Vorrat heißt:** Nichts davon wird jetzt ins laufende Spiel eingebaut. Daten liegen in `docs/story/vorrat_*/` im Pack-Format (`src/data/packs/k3_orte/` als Vorlage), Grafik regulär unter `public/sprites/` mit Manifest, damit der spätere Einbau nur Dateien verschiebt. Keine Karten, keine Quests, keine Flags der Kapitel 1 bis 3.

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
- Ein Manifest `public/sprites/manifest-vorrat2.json` mit Framegröße, Spalten/Reihen, Frame-Listen pro Animation und vorgeschlagener Geschwindigkeit, wie in `manifest-14b.json`.
- Die tatsächlich verwendeten Prompts in `docs/art/batch-vorrat2-generation.json`, kurze Übersicht in `docs/art/README.md` ergänzen.
- **Keinen Spielcode ändern.** Das Einbauen ins Spiel passiert separat. Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an.
### 0.4 Nachbearbeitung (wie bei Batch 14b)
1. Generatorbild mit Nearest Neighbor exakt auf das Zielraster bringen.
2. Auf die gemeinsame Palette (max. 32 Farben, siehe vorhandene Sprites) indizieren.
3. Alpha binarisieren (kein halbtransparenter Rand), Hintergründe deckend lassen.
4. Raster prüfen: jede Zelle gleich groß, Figur auf gleicher Grundlinie, keine Pixel über Zellgrenzen.
5. Bereits fertige Sprites aus `public/sprites/` als Stil-Referenz mitgeben: "Use the attached sprites as strict style reference: same palette, outline color, pixel density, proportions and light direction."


Für jede der 28 Figuren aus den Eckdaten (Beschreibungen aus den Figurentabellen in Geschichte 1 und 2; Reisefiguren nach ihrer Rolle, viktorianisch, abgetragen, keine Uniform-Klischees): Lauf-Sheet `characters/<id>_walk.png` (64x128), Emotions-Sheet `portraits/<id>_emotions.png` (256x64: neutral, misstrauisch, erschrocken, leichtes Lächeln), zweite Reihe `portraits/AK_<id>_emotions2.png` (wütend, traurig, nachdenklich, entschlossen), Kopf 24x24 im Sammel-Sheet `portraits/BK_koepfe.png`, **eine** Sonderpose (16x32, 4 Frames) in `characters/<id>_extra.png`: Setzen von Lettern, Rohrpost öffnen, Gießen, Heizen, Peitsche, Zollschranke, Predigt, Karte zeichnen usw. Die beiden Gegenspieler (`cw_wetherby`, `bh_greavesend`) zusätzlich als Kampf-Sheet 64x64 mit zweiter Phase (Wetherby wird zur „Bürgerschaft“: viele Umrisse hinter ihm; Greavesend wurzelt ein).

Palettenregel: Calderwick-Figuren in Schwarz, Kalkweiß, Blei, Messing; Briarholt-Figuren in Weiß, Glasgrün, Kupfer; Reisefiguren in Straßenbraun, Nebelgrau. Kinder (`vn_waisenjunge`, `bh_orla_fencrest` ist erwachsen) kleiner, Grundlinie y=30.

Manifest, `docs/art/batch-vorrat2-generation.json`, Prüfskript (Pillow, wie `docs/art/validate-wexmoor7.py`), Vorschau-PNGs, README-Eintrag. Keinen Spielcode ändern.
