# Codex-Paket CO: Halbgott und Engel als Grafik (Sequenz 4 und 2, Kreaturformen, Wächter)

**Batch-Name:** `halbgott` (Manifest: `public/sprites/manifest-halbgott.json`)

Sequenz 4 macht den Spieler zum Halbgott, Sequenz 2 zum Engel. Beides braucht ein eigenes Trink-Bild, einen Aufstiegs-Effekt, eine mythische Kreaturform je Pfad (zehn Pfade), die Angst-Reaktion der Umstehenden und zwei Ritualwächter. **Dieses Paket liefert nur Grafik** (etwa 70 PNG), die Texte und Kampfdaten macht Paket CP. Die Tränke, Embleme, Pfadkarten, Auren und Kampfposen der Pfade gibt es schon (Pakete A, AG, CA); mach nichts davon doppelt.

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

## Gemeinsame Eckdaten „Halbgott und Engel“ (gilt für die Pakete CO und CP)

Der Aufstieg läuft über Tränke: Sequenz 9 ist der Anfang, 1 die Spitze. Bis Sequenz 5 ist man ein starker Mensch. **Sequenz 4 macht einen zum Halbgott**, Sequenz 3 ist eine gute Steigerung, **Sequenz 2 ist die Engel-Stufe** (wieder ein brutaler Sprung wie 5 → 4), Sequenz 1 die letzte. Vor dem Trank für 4 und für 2 steht ein **richtig schweres Ritual**: eine Prüfung im Schwellenring von Dunscar (Karte `ds_schwellenring`, Kapitel 3) beziehungsweise im Grenzbezirk (Seq 2, neue Karte `hg_grenzbezirk`), bewacht von einem Wächter, der für jeden Pfad anders aussieht. Ab **50 % Verdauung** des Seq-4-Tranks kann der Spieler seine **mythische Kreaturform** annehmen: Gewöhnliche Menschen und schwache Wesen fallen bei ihrem Anblick um (Ohnmacht, kein Tod), stärkere Gegner zögern. Zu zweit (Koop) kann jeder Spieler seine eigene Form haben.

Zehn Pfade mit festen IDs (`pfad`), ihren Seq-4-, Seq-3- und Seq-2-Namen aus dem Spiel und der Kreaturform (ID `hg_form_<pfad>`; die Namen sind verbindlich):

| `pfad` | Pfad | Seq 4 (Halbgott) | Seq 3 | Seq 2 (Engel) | Kreaturform | Bild der Form |
|---|---|---|---|---|---|---|
| `laterne` | Pfad der Laterne | Dochtgezeichneter | Aschenprotokollant | Rußhorizont | **Leuchtgestalt** | mannshohe Gestalt aus Ruß und Docht, der Kopf eine ruhige Gaslampenflamme hinter Glas, Hände tropfen Licht |
| `faden` | Pfad des Fadens | Nahtträger | Bruchhefter | Stadtversäumer | **Nahtgespinst** | ein Leib aus gespannten Fäden und Nähten, zu viele dünne Arme, zwischen ihnen gespannte Netze |
| `maske` | Pfad der Maske | Gesichtsvermieter | Rollenverwahrer | Publikumsfremder | **Hundertmiene** | Körper aus übereinander gelegten Porzellanmasken, die Vorderseite wechselt das Gesicht, hinten leer |
| `echo` | Pfad des Echos | Stilleverwahrer | Nachrufgefäß | Schweigeufer | **Hohlklang** | glockenförmige, halbdurchsichtige Gestalt, im Inneren mehrere Kehlen, die Luft um sie zittert |
| `kessel` | Pfad des Kessels | Rückstandsbrauer | Kreislaufgefäß | Abwärmesammler | **Siedeleib** | Körper aus Kupferrohr und Glas, in dem farbige Flüssigkeiten kreisen, Dampf aus den Schultern |
| `eisen` | Pfad des Eisens | Lastnieter | Gegenlast | Stadtwiderlager | **Nietkoloss** | gedrungener Koloss aus genieteten Trägern, der Rücken ein Brückenbogen, Schritte drücken Steine ein |
| `schluessel` | Pfad des Schlüssels | Schwellenlücke | Riegelabwesenheit | Innenrand | **Türhüter** | hagere Gestalt voller Schlüssellöcher, in der Brust eine offene Tür, aus der schwaches Licht fällt |
| `sq_waage` | Pfad der Waage | Pfandkörper | Saldenhüter | Schuldgegengewicht | **Gewichtsträger** | Gestalt mit Waagarmen statt Schultern, an Ketten hängende Gewichte aus Messing, gesenkter Kopf |
| `sq_moor` | Pfad des Moores | Schichtträger | Namensediment | Vergessensufer | **Torfleib** | Riese aus geschichtetem Torf, in den Schichten alte Namen als helle Linien, Moos auf den Schultern |
| `sq_uhr` | Pfad der Uhr | Zwischentakter | Fristlauscher | Wiederkehrsaum | **Pendelgestalt** | schlanke Uhrwerkgestalt mit doppeltem Umriss, der zweite einen Takt hinterher, Pendel statt Herz |

Spielerfiguren: Spieler 1 nutzt die Sheets mit Präfix `A_player`/`battle_player`, Spieler 2 die Looks `p2a` (Mütze) und `p2b` (Melone). Farben wie in `public/sprites/characters/` und `battle/`.

Wächter der Rituale (feste IDs, Datenpaket CP beschreibt die Kämpfe, Grafikpaket CO die Sheets):
- `hg_schwellenwaechter`: Boss des Seq-4-Rituals im Schwellenring. Eine Gestalt aus Kalk und Bahnsignalen, gesichtslos, trägt das **Siegel des Pfades** des Spielers vor der Brust (zehn Siegel als Overlay). Drei Phasen: Prüfung (schlägt nur, wenn der Spieler angreift), Zorn, Schwelle (letzter Rest, er öffnet sich). Nicht tödlich: Er zerfällt zu Kalk und wird beim nächsten Besuch wieder stehen.
- `hg_grenzwaechter`: Boss des Seq-2-Rituals im Grenzbezirk. Größer, aus Nebel und Grenzsteinen, mit einem zweiten, leeren Umriss, der dem Spieler ähnelt. Drei Phasen wie oben, in der letzten kämpft der leere Umriss mit.

## 1. Trinken: Sequenz 4 und Sequenz 2 (Ordner `characters/`)
Bisher trinkt der Spieler mit `A_player_drink.png` (8 Frames, 16x32). Für die beiden großen Stufen gibt es längere Bilder, je **12 Frames in einer Reihe = 192x32**, Grundlinie y=30, Blick nach unten:

| Datei | Inhalt |
|---|---|
| `A_player_drink_halbgott.png` | Spieler 1: Phiole heben (2), trinken (2), Taumeln, Hand vor die Augen (2), Lichtriss durch den Körper in Pfadfarbe neutral türkis (3), aufrichten, Umriss einen Moment doppelt (2), ruhiges Stehen mit schwachem Leuchten (1) |
| `A_player_drink_engel.png` | Spieler 1: wie oben, aber beim Lichtriss hebt die Figur zwei Pixel vom Boden ab, hinter ihr erscheint ein stiller, dunkler Umriss (die Engel-Stufe), der sich in den Körper legt |
| `p2a_drink_halbgott.png`, `p2a_drink_engel.png`, `p2b_drink_halbgott.png`, `p2b_drink_engel.png` | dasselbe für die beiden Looks von Spieler 2 (Mütze, Melone) |

Im Manifest: Animation `drink` mit allen 12 Frames, `frameRate` 6, `repeat` 0.

Prompt-Beispiel:
```
[STYLE BLOCK]
Sprite sheet, 12 frames in one row, each 16x32 pixels, 192x32 total. A slim Victorian investigator in a long dark coat, facing the viewer, same character as the reference walk sheet. Sequence: raises a small glass vial, drinks, staggers, covers eyes with one hand, a thin crack of turquoise light runs through the body from head to feet, then the figure straightens and stands calm with a faint turquoise outline. Transparent background. Baseline at y=30.
```

## 2. Aufstiegs-Effekte (Ordner `fx/`)
| Datei | Maße | Inhalt |
|---|---|---|
| `HG_aufstieg_4.png` | 8 Frames 240x135 in einer Reihe (1920x135), opak | Vollbild hinter dem Trinken, Sequenz 4: Die Welt wird für einen Herzschlag zu hell und zu nah: dunkler Rahmen zieht sich zu, ein türkiser Lichtkranz öffnet sich in der Mitte, feine helle Linien laufen wie Risse nach außen und schließen sich wieder. Wird vom Spiel auf 480x270 vergrößert. |
| `HG_aufstieg_2.png` | 8 Frames 240x135 (1920x135), opak | Sequenz 2: dasselbe in Violett und Bonweiß, dazu senkt sich von oben ein zweiter, ruhiger Lichtsaum wie ein Flügelpaar ohne Federn, nur Umriss |
| `HG_kreatur_wechsel.png` | 8 Frames 64x64 (512x64) | Verwandlung in die Kreaturform auf der Karte: Nebel steigt vom Boden auf, türkise Fäden umschließen die Figur, Blitz aus hellen Pixeln, Nebel fällt wieder. Rückverwandlung spielt dieselben Frames rückwärts. |
| `HG_furcht.png` | 6 Zellen 16x16 (96x16) | Angstzeichen über Köpfen: Schreckstrich, Schweißtropfen, zitternde Doppellinie, Augen zu, Fragezeichen aus Nebel (ohne echte Schrift), Ohnmachtsspirale |
| `HG_umfallen.png` | 4 Frames 16x32 (64x32) | neutrale Ohnmacht für beliebige Figuren: steht, knickt ein, kniet, liegt. Dunkle Silhouette mit hellem Umriss, die das Spiel über jede Figur legt |
| `HG_aura_halbgott.png` | 4 Frames 24x36 (96x36) | ruhige Aura um die Spielerfigur ab Seq 4 (wie `aura_pfade.png`, aber heller, schmaler Rand, türkis) |
| `HG_aura_engel.png` | 4 Frames 24x36 (96x36) | Aura ab Seq 2: violett-bonweiß, mit zwei stillen Lichtsäumen hinter den Schultern |
| `HG_zoegern.png` | 4 Frames 32x32 (128x32) | Kampf-Effekt über stärkeren Gegnern, die zögern: Ausrufe-Form aus Nebel, flackernd |

## 3. Kreaturformen auf der Karte (Ordner `characters/`)
Je Pfad ein Lauf-Sheet **32x48 je Frame**, 4 Richtungen (unten, links, rechts, oben) x 4 Frames = **128x192**, Grundlinie y=46. Die Form ist deutlich größer als Menschen (die sind 16x32), bleibt aber lesbar und ruhig; keine Hörner-Klischees, keine Zähne.

| Datei | Form |
|---|---|
| `hg_form_laterne.png` | Leuchtgestalt |
| `hg_form_faden.png` | Nahtgespinst |
| `hg_form_maske.png` | Hundertmiene |
| `hg_form_echo.png` | Hohlklang |
| `hg_form_kessel.png` | Siedeleib |
| `hg_form_eisen.png` | Nietkoloss |
| `hg_form_schluessel.png` | Türhüter |
| `hg_form_sq_waage.png` | Gewichtsträger |
| `hg_form_sq_moor.png` | Torfleib |
| `hg_form_sq_uhr.png` | Pendelgestalt |

Prompt-Beispiel (Laterne):
```
[STYLE BLOCK]
Character walk sprite sheet, 4 rows (facing down, left, right, up) x 4 frames, each frame 32x48 pixels, 128x192 total. A tall supernatural figure made of soot and lamp wick, its head a calm gas flame behind a small glass housing, hands dripping drops of amber light, long coat remnants hanging from the shoulders. Turquoise #6fe0d0 used only for a thin inner glow. Reads clearly at small size, same proportions and outline style as the reference 16x32 characters but twice the size. Transparent background.
```

## 4. Kreaturformen im Kampf (Ordner `battle/`)
Je Pfad ein Kampf-Sheet **96x96 je Zelle, 6 Spalten, 6 Reihen = 576x576**: Reihen idle, attack1, attack2, special (die Form zeigt sich ganz: Umstehende fallen), hurt, defeated (zurück in Menschengestalt, kniend, nie tot). Dateien `hg_battle_<pfad>.png` für die zehn Pfade (`hg_battle_laterne.png` … `hg_battle_sq_uhr.png`). Der Spieler bleibt in der Form erkennbar: Mantelreste, Hutkrempe oder der Notizbuchriemen tauchen irgendwo auf.

Dazu **zehn Zug-Portraits** der Formen für die Kampfleiste: `ui/hg_zug_<pfad>.png`, je 32x32, Kopf oder Kern der Form.

## 5. Die beiden Wächter (Ordner `battle/`)
| Datei | Maße | Inhalt |
|---|---|---|
| `hg_schwellenwaechter.png` | 128x96 je Zelle, 6 Spalten, 6 Reihen (768x576) | Wächter des Seq-4-Rituals: Gestalt aus Kalkstein und Bahnsignal-Teilen, gesichtslos, ein leeres Rechteck vor der Brust (dort sitzt das Pfadsiegel). Reihen idle, attack1 (Signalarm schlägt), attack2 (Kalkstaub-Welle), special (Phase 3: die Brust öffnet sich, Licht), hurt, defeated (zerfällt zu Kalk, bleibt als Haufen). Die Phasen unterscheiden sich im Manifest über Frame-Listen `idle_p2`, `idle_p3` (mehr Risse, mehr Licht). |
| `hg_siegel.png` | 10 Zellen 32x32 (320x32) | das Pfadsiegel, das das Spiel dem Wächter vor die Brust legt, in Pfad-Reihenfolge laterne, faden, maske, echo, kessel, eisen, schluessel, sq_waage, sq_moor, sq_uhr. Zeichen aus `pathways/` als Vorlage, hier als eingeritzte, schwach leuchtende Marke |
| `hg_grenzwaechter.png` | 128x128 je Zelle, 6 Spalten, 6 Reihen (768x768) | Wächter des Seq-2-Rituals: Nebel um Grenzsteine, breiter als hoch, violettes Innenlicht, neben ihm ein leerer menschlicher Umriss, der in Reihe special und defeated selbst handelt (Phase 3: der Umriss tritt vor). Defeated: der Nebel sinkt, die Steine bleiben, der Umriss geht. |
| `bg_hg_schwelle.png` | 480x270 opak | Kampf-Hintergrund Schwellenring: Kalkebene bei Nacht, ein Ring aus alten Signalmasten, in der Ferne der Endbahnhof von Dunscar, Nebel am Boden |
| `bg_hg_grenze.png` | 480x270 opak | Kampf-Hintergrund Grenzbezirk: Grenzsteine in einer Reihe bis zum Horizont, Himmel ohne Sterne, violetter Saum über dem Boden |

Kartenfigur der Wächter (16x32 reicht nicht): `characters/hg_schwellenwaechter_karte.png` und `characters/hg_grenzwaechter_karte.png`, je 32x48, nur Blick nach unten, 4 Frames idle (128x48).

## 6. Sequenzbilder (Ordner `ui/`)
Je Pfad zwei Zwischenbilder **240x135 opak** für die Kapitel- und Pfadkarte: `hg_seq4_<pfad>.png` (der Spieler nach dem Seq-4-Trank, halb Mensch, halb Form, in einer Dunscar-Kulisse) und `hg_seq2_<pfad>.png` (die Engel-Stufe: der Spieler vor dem Grenzbezirk, hinter ihm der stille zweite Umriss). Zusammen 20 Bilder. Keine Schrift.

## 7. Oberfläche (Ordner `ui/`)
`HG_hud.png`, Streifen aus 16x16-Zellen (160x16), in dieser Reihenfolge: Halbgott-Rang, Engel-Rang, Kreaturform aus, Kreaturform an, Verdauung unter 50 % (gesperrt), Furcht-Wirkung aktiv, Wächter-Ritual offen, Wächter-Ritual bestanden, Rückverwandlung läuft, Koop: Mitspieler in Form. Dazu `HG_hud_32.png` dieselben zehn in 32x32 (320x32).

## 8. Abgabe
`public/sprites/manifest-halbgott.json` mit allen Sheets, Frame-Listen und Regionen, `docs/art/batch-halbgott-generation.json`, `docs/art/batch-halbgott-preview.png`, `tools/art/halbgott/check.py`, `docs/art/batch-halbgott-validation.json`, eine Übergabe `docs/art/halbgott-uebergabe.md` (welche Datei an welcher Stelle in `src/world/assets.js` eingehängt werden soll: `ANIM_SHEETS` für Trinken und Effekte, `BATTLE_SHEETS` für Formen und Wächter, `UI_SHEETS` für HUD). Pull Request mit Prüf-Ausgabe. Wenn der Upload zu groß wird, **zwei PRs**: Teil 1 Abschnitte 1, 2, 5, 7 und Teil 2 Abschnitte 3, 4, 6.
