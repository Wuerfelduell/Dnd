# Grafikpaket 14b – Kampf und erste Items


## Batch AO — Neue Wexmoor-Figuren (`wexmoor7`)

57 PNGs für die elf festgelegten Figuren aus `codex_AO_k2_figuren.md`: elf Lauf-Sheets (64×128), 22 Emotions-Sheets (256×64, acht Stimmungen je Figur), elf Köpfe (24×24), neun Sonderposen-Sheets (16×32 je Frame), zwei Kampf-Sheets und zwei Staffeleien (32×32). Die zweite Staffelei heißt `props/AO_staffelei_portraet.png`.

- Manifest: [`manifest-wexmoor7.json`](../../public/sprites/manifest-wexmoor7.json), mit Figuren-IDs, Frame-Listen, Tempo und Leerfeldern. Laufrichtungen: unten, links, rechts, oben; Portraits: neutral, misstrauisch, erschrocken, lächelnd; zweite Reihe: wütend, traurig, nachdenklich, entschlossen.
- Kampf: `enemy_wxn_maler.png` (288×240; idle, brush_slash, paint_throw, hurt, defeated) und `enemy_gemalte_frau.png` (384×320; idle, emerge, attack, hurt, defeated). Je sechs Spalten. Angriffe halten die erste Ausholpose in zwei identischen Frames. `emerge` vor der ersten Bereitschaftsanimation der gemalten Frau abspielen. Kürzere Reihen haben vollständig transparente Restfelder.
- Nachbearbeitung: gemeinsame Palette mit höchstens 32 sichtbaren Farben, indizierte PNGs, binäres Alpha, Nearest Neighbor, transparente Zellränder. Kartenfiguren haben Grundlinie y=30; Krabbe ist kleiner als die Erwachsenen. Portrait-Köpfe wurden aus dem neutralen Ausdruck abgeleitet. Die kleinen Arbeitsgeräte sind in den Sonderposen enthalten.
- Erzeugung: [`batch-wexmoor7-generation.json`](batch-wexmoor7-generation.json) enthält die tatsächlich verwendeten Bildprompts, Referenzen, Korrekturen, Quellbild-Dateinamen und SHA-256. Die hochauflösenden Originale gehören nicht zum Laufzeitpaket.
- Prüfung: `python docs/art/validate-wexmoor7.py` (Pillow); alle 57 Dateien und 371 belegten Frames bestehen die Prüfung von Pflichtumfang, Maßen, Palette, Alpha, Grundlinien, Zellrändern, Animationsverweisen, unterschiedlichen Ausdrücken/Laufschritten und doppelten Ausholframes. Bericht: [`batch-wexmoor7-validation.json`](batch-wexmoor7-validation.json). Sichtprüfung: [`batch-wexmoor7-preview.png`](batch-wexmoor7-preview.png).

Grafiklieferung; die Einbindung und Timing-Abstimmung im laufenden Spiel erfolgen separat.


Erzeugt am 9. November 2026 mit dem integrierten Bildgenerator (`image_gen`).
Quelle der Aufgaben: `prompts.md`; die tatsächlich verwendeten Prompts stehen in
`batch-14b-generation.json`. Die dortigen Quelldateinamen bezeichnen die ursprünglichen
Generatorausgaben. Diese großen Arbeitsbilder werden nicht für das Spiel benötigt.

## Fertige PNGs

| Pfad unter `public/sprites/` | Größe | Inhalt |
|---|---|---|
| `battle/battle_player.png` | 288×432 | 6×9 Zellen, 48×48, 40 belegte Frames |
| `battle/enemy_holt.png` | 288×192 | 6×4 Zellen, 48×48, 17 belegte Frames |
| `battle/enemy_nebelhund.png` | 384×320 | 6×5 Zellen, 64×64, 25 belegte Frames |
| `battle/enemy_aschewaechter.png` | 384×320 | 6×5 Zellen, 64×64, 25 belegte Frames |
| `battle/bg_revier.png` | 480×270 | Trainingsraum |
| `battle/bg_ashgrove.png` | 480×270 | Kanalstraße |
| `battle/bg_krypta.png` | 480×270 | Krypta |
| `items/14b_items.png` | 64×32 | 4×2 Zellen; letzte Zelle leer |
| `items/<id>.png` | je 16×16 | Sieben einzelne Item-Icons |

Item-Reihenfolge im Atlas: `spazierstock`, `schlagstock`, `stockdegen`, `verband`,
`tonikum`, `riechsalz`, `bannsalz`, leer. Damit kleine Icons sauber getrennt bleiben,
ist der Arbeitsatlas als 4×2 statt als extrem breiter 7×1-Streifen angelegt.
Die sieben Einzeldateien entsprechen den vorhandenen IDs in `src/data/items.json`.

`public/sprites/manifest-14b.json` enthält exakte nullbasierte Frame-Listen,
Framegrößen, Blickrichtungen und vorgeschlagene Abspielgeschwindigkeiten.
Leere Restfelder sind transparent. Nur `idle` ist als Schleife vorgeschlagen;
Niederlagen bleiben auf dem letzten Frame stehen. Holts Niederlage ist ein
freundliches Aufgeben mit erhobener Hand.

## Export und Prüfung

`export-14b.mjs` normalisiert die Generatorbilder mit ImageMagick auf das Zielraster
(Nearest Neighbor), verwendet eine gemeinsame Palette mit 31 sichtbaren Farben
und erhält eine separat binarisierte Alpha-Maske. Hintergrundbilder sind opak.
Mit den ursprünglichen Generator-PNGs in einem Ordner:

```sh
node docs/art/export-14b.mjs /pfad/zu/den/generatorbildern
node docs/art/verify-14b.mjs
```

Die exportierten PNGs wurden visuell kontrolliert. Die Prüfung kontrolliert
Dateigrößen, Palette, Alpha, belegte Frames, leere Padding-Frames und Item-IDs.

## Einbaustand

Dieses Paket legt die Assets samt Metadaten ab. `CombatScene.js`, `assets.js`
und die Inventaroberfläche sind noch nicht auf diese neuen Dateien umgestellt.
Das Spiel verwendet dort weiterhin seine bisherigen Grafiken/Platzhalter.
Die bestehende Spielmechanik wurde nicht geändert.

Als Nächstes laut Aufgabenliste: Abschnitt 18 (Fall 3 / Lagerhaus 7), dann 19,
die Reste aus 12–14 und schließlich 15–17, ohne die hier erledigten Assets doppelt
zu erzeugen. Laufzeit-Animationen müssen beim Einbau noch im Spiel geprüft werden.

## Grafikpaket A – Pfade, Tränke und Nachtmarkt

Batch `pfade`, erzeugt am 9. November 2026 mit `image_gen` nach
`erledigt/codex_A_pfade_traenke_nachtmarkt.md`: **155 PNGs** unter `public/sprites/`.

| Gruppe | PNGs |
|---|---:|
| Sieben Embleme in drei Größen, sieben Karten, Leiter und Sockel | 30 |
| 21 Tränke jeweils in 16×16 und 32×32 | 42 |
| 21 Formeln und Atlas | 22 |
| 29 Zutaten/Gegenstände und vier Atlanten | 33 |
| Vier Schilling-Icons und Münzanimation | 5 |
| Braukessel mit drei Animationen | 4 |
| Nachtmarkt-Tileset, Marktstände und Kampfgrube | 3 |
| Fünf Händler: Lauf-Sheets und Emotionsporträts | 10 |
| Laden-UI, Verdauungsanzeige, Kontrollverlust, Trinken, Aufstieg und Auren | 6 |

`manifest-pfade.json` enthält die exakten Framegrößen, Spalten/Zeilen,
Animationslisten, Geschwindigkeiten sowie benannte Ausschnitte für gemischte
UI-/Prop-Atlanten. Die Leiter ist 16×112; ihre separat gelieferten 24×24-Sockel
ragen beim Zusammensetzen seitlich jeweils vier Pixel über. Händler-Laufanimationen
verwenden unten/links/rechts/oben; Porträts neutral/misstrauisch/erschrocken/lächelnd.

Die verwendeten Prompts, Quellbild-Prüfsummen, Referenzdateien und Exportziele
stehen in `batch-pfade-generation.json`. 51 Generatorbilder wurden zugeschnitten,
mit Nearest Neighbor auf das Zielraster gebracht und auf dieselben 31 sichtbaren
Farben plus einen transparenten Paletteneintrag indiziert. Die Palette übernimmt
Grundtöne von 14b und ergänzt die sieben vorgeschriebenen Pfadakzente. Alpha ist
binär. UI und Props wurden nach Sichtprüfung in die dokumentierten Regionen
gepackt; Bodenvarianten haben gemeinsame Randpixel. Der mittlere Bereich der
Kontrollverlust-Overlays bleibt vollständig transparent.

```sh
# source-map.json: {"emblem_laterne": "/pfad/original.png", ...}
# Export benötigt Pillow, numpy und scipy; Prüfung benötigt Pillow und numpy.
python docs/art/export-pfade.py /pfad/source-map.json
python docs/art/verify-pfade.py
```

Die Prüfung deckt Vollständigkeit, Größen, Palette, Alpha, Frame-/Regiongrenzen,
belegte Animationen, Grundlinien, Formel-Atlas-Korrespondenz und Bodenränder ab.
Die fertigen Exporte wurden visuell geprüft. Vorschau: `pfade-preview.png`.
Die Einbindung und Animationstests im laufenden Spiel erfolgen separat;
dieser Batch verändert keinen Spielcode.

## Batch `kampf` – vollständiges Kampf-Assetpaket

Am 9. November 2026 aus `erledigt/codex_B_kampf.md` mit dem integrierten Bildgenerator
erzeugt. **53 neue PNGs**: zwölf Gegner (einschließlich fünf Bonusgegnern), neun
Hintergründe, 21 Fähigkeitseffekte, zwei Spieler-Sheets, sieben UI-/Treffer-Sheets
und zwei Übergänge. Batch 14b bleibt unverändert. Der Spielcode wurde nicht geändert;
die Laufzeiteinbindung und das Timing im Spiel stehen noch aus.

`public/sprites/manifest-kampf.json` folgt dem Schema von 14b und ergänzt `rows`,
`gameId`, Grundlinien, Icon-Zuordnungen und benannte `regions` für die gemischten
HUD-Atlanten. Alle Frame-Indizes sind nullbasiert. Gegner haben sechs Spalten und
fünf Reihen: `idle`, `attack`, `special` (Angriff B), `hurt`, `defeated`. Beide
Angriffe beginnen mit zwei identischen Ausholframes. Niederlagen halten den letzten
Frame; nur `idle` ist als Schleife vorgeschlagen.

Die Effekte liegen als einreihige Streifen vor. `skill_icons.png` hat sieben
Pfadspalten und drei Sequenzreihen (9, 8, 7). `status_icons.png` enthält zwölf
Icons in der vorgegebenen Reihenfolge. `damage_font.png` hat zwölf 8×10-Zellen
pro Farbreihe, einschließlich `+` und `-`. `hits.png` verwendet 48×48-Trägerzellen;
`effectRegions` beschreibt die mittigen 32×32-Ausschnitte und den 48×48-Krit-Effekt.
Die Atlasrechtecke, 9-Slice-Ränder, Füllstände und Cursor-Animationen stehen im Manifest.

Alle PNGs sind indiziert mit einer gemeinsamen Palette aus 32 sichtbaren Farben
und einem transparenten Index. Die Palette übernimmt die Grundfarben aus 14b und
ergänzt die sieben vorgegebenen Pfadfarben sowie Rot. Hintergrundbilder sind opak.
Die verwendeten Prompts, Korrekturen, Quellbild-Hashes und gemessenen Ausschnitte
sind in `batch-kampf-generation.json` dokumentiert. Große Generator-Arbeitsbilder
werden vom Spiel nicht benötigt und sind nicht Teil des Repos.

Reproduzierbarer technischer Export mit Python, Pillow und NumPy:

```sh
python docs/art/export-kampf.py /pfad/zu/den/generatorbildern
python docs/art/verify-kampf.py
```

Die Prüfung kontrolliert alle 53 Dateien, Zielmaße, gemeinsame Palette, binäres
Alpha, Padding, Grundlinien, gehaltene Ausholposen, Atlasgrenzen, Übergangs-Endpunkte
und alle 21 Fähigkeits-IDs gegen `src/data/pathways.json`. Die exportierten Sheets
wurden zusätzlich visuell kontrolliert. Eine Übersicht liegt in `batch-kampf-preview.png`.


## Grafikpaket C – Figuren, Portraits und Orte

Batch `welt`, erzeugt am 9. November 2026 mit `image_gen` nach
`erledigt/codex_C_figuren_orte.md`: **85 PNG-Sheets** unter `public/sprites/`.

| Gruppe | Sheets | Raster |
|---|---:|---|
| 23 NPCs: Laufanimationen, einschließlich Nate und neun künftiger Figuren | 23 | 64×128, 4×4 Frames à 16×32 |
| Spieleraktionen | 1 | 64×192, sechs Reihen à vier Frames |
| 36 Figurenportraits und acht Zusatzsets | 44 | 256×64, vier Portraits à 64×64 |
| Lagerhaus, Altmarkt, Taverne und Bahnhof | 4 | 16er-Raster, benannte Regionen |
| Revier-, Lagerhaus- und Altmarkt-Props | 3 | 16er-Raster, benannte Regionen |
| Theater, Uhrturm, Schlachthof, Gaskanäle und Sternwarte | 5 | je 384×192, benannte Regionen |
| Journalmarker, Journalstreifen und Stadtmarker | 3 | 16×16 bzw. 160×24 pro Zelle |
| Tiere und Wetter | 2 | 16×16 bzw. 64×64 pro Zelle |

`public/sprites/manifest-welt.json` enthält Dateimaße, Framegrößen, Spalten/Zeilen,
nullbasierte Animationslisten, Geschwindigkeiten, Portraitausdrücke, UI-Namen und
benannte Atlasregionen. `regionAnimations` verweist auf diese Regionen, insbesondere
für Brunnen, Feuer, Rampenlicht, Zahnräder, Pendel, Gas und Moos. Diese Ausschnitte
können über den Atlas verteilt sein; ihre Namen und Rechtecke sind maßgeblich.

Laufrichtungen: unten, links, rechts, oben. Die Fußgrundlinie liegt nach der
Rasterung bei y=30 innerhalb jeder 16×32-Zelle (exklusive Unterkante 31).
Spieleraktionen sind einmalig, nur Schütteln ist als Schleife markiert.
Portraits verwenden vier benannte Zustände in der angegebenen Reihenfolge.
Wetter verwendet 6×6 Zellen: vier Regen-/Schnee-/Aschereihen mit je vier Frames,
sechs Nebelframes, vier Spritzwasserframes; Restfelder sind leer. Die Spritzer sind
16×16 groß und mittig in 64×64-Zellen abgelegt.

Die tatsächlichen Prompts, verwendeten Referenzen, Originaldateinamen,
Prüfsummen und Zuschnittrechtecke stehen in `batch-welt-generation.json`.
85 Generatorbilder wurden pro Frame bzw. Objekt zugeschnitten, mit Nearest
Neighbor gerastert und auf die 31 sichtbaren Farben von Batch 14b plus einen
transparenten Paletteneintrag indiziert. Alpha ist binär, Portraits sind deckend.
Bodenvarianten innerhalb der dokumentierten `seamFamilies` haben gemeinsame
Randpixel. Die großen Generatororiginale sind keine Laufzeitassets.

```sh
# Benötigt Pillow und numpy; SOURCE_DIR enthält die Original-PNGs.
python docs/art/export-welt.py SOURCE_DIR .
python docs/art/verify-welt.py
```

Die Prüfung kontrolliert alle 85 PNGs auf Vollständigkeit, Maße, Palettenfarben,
Alpha, Framebelegung, Grundlinien, Atlasgrenzen, Überlappungen, Animationsvariation,
Wetter-Padding und Bodenränder. Ergebnis: `welt-validation.json`.
Visuelle Übersicht: `welt-preview.png`.

Dieses Paket stellt die Grafiken und Metadaten bereit. Die Einbindung sowie
die Beurteilung von Timing, Lesbarkeit und Übergängen im laufenden Spiel erfolgen
separat. Es wird kein Spielcode geändert.

## Grafikpaket E – Fall 4, Aufträge und Fallakten

Batch `faelle`, erstellt am 9. November 2026 nach `codex_E_fall4_auftraege.md`:
**102 PNG-Dateien** (101 neue Dateien und das erneuerte 16×16-Item `stimmphiole`).
Die vorhandenen C-Portraits dienen als Identitätsreferenz für die bekannten Figuren.

| Gruppe | PNGs | Raster |
|---|---:|---|
| Theater, Felix' Versteck, Turmuhr, Fall-4-Hinweise und Ortsspuren | 5 | Benannte Regionen bzw. 16×16/48×48-Zellen |
| Stimmenraub, brechende Phiole und Miriams Glockenstimme | 3 | 8 Frames, 32×32 bzw. 48×48 |
| Stimmenphiole als einzelnes Item | 2 | 16×16 und 32×32 |
| Zusätzliche Porträts für Diva, Felix, Jonas und Ezra | 4 | 256×64, vier Zustände |
| 16 Auftragsfiguren, jeweils Lauf-Sheet und Emotionsporträts | 32 | 64×128 und 256×64 |
| 32 Auftragsgegenstände, einzeln und in vier Atlanten | 36 | 16×16 und 128×16 |
| Auftragsmarker, Banner, Kartenpins und Belohnungsfenster | 1 | 160×176, benannte Regionen |
| Schlussbilder | 7 | 480×270, deckend |
| Fallakten einschließlich leerer Vorlage | 6 | 128×96, deckend |
| Zwischensequenzbilder | 6 | 240×135, deckend |

`public/sprites/manifest-faelle.json` dokumentiert Maße, Spalten/Zeilen,
nullbasierte Frame-Listen, Bildraten, Wiederholungen, Emotionen, Item-Zuordnungen
und Atlasrechtecke. Laufreihen sind unten/links/rechts/oben; die Fußgrundlinie liegt
bei y=30 innerhalb einer 16×32-Zelle. Der Terrier gehört zu jedem Rattenfänger-Frame.
Die ersten vier Regalregionen bilden den Phiolen-Schimmer. Die Turmuhr besitzt
unbeleuchtete und türkis beleuchtete Zustände, beide auf 3:33.

Die gemischten Prop-Atlanten verwenden 160×64. Auftragsmarker haben vier
16×16-Frames; Banner je 160×32, Kartenpins je 8×8 und das Belohnungsfenster
48×48 mit 16-Pixel-Rändern für 9-Slice. Die entsprechenden Rechtecke und
`regionAnimations` im Manifest sind für die Entnahme maßgeblich. Das Spuren-Sheet
hat elf Zellen, einschließlich geschlossenem und offenem Bodenfach.

70 Arbeitsbilder wurden mit `image_gen` erzeugt; drei davon wurden gezielt
korrigiert (Souffleurkasten, Alpha des Stimmenraubs und erloschene Laterne).
`batch-faelle-generation.json` enthält die tatsächlich verwendeten Prompts,
Referenzen, Originaldateinamen, SHA-256-Prüfsummen und gemessenen Zuschnitte.
Der technische Export verwendet Nearest Neighbor, eine gemeinsame Palette aus
32 sichtbaren Farben plus transparentem Index und binäres Alpha. Die Palette
übernimmt die Grundfarben der bestehenden Sprites und enthält einen gedeckten
Lilaton für die Auftragsmarker. Große Generatororiginale sind keine Laufzeitassets.

```sh
# SOURCE_DIRECTORY enthält die in batch-faelle-generation.json genannten Original-PNGs.
# Benötigt Python, Pillow und numpy.
python docs/art/export-faelle.py SOURCE_DIRECTORY
python docs/art/verify-faelle.py
```

Die Prüfung kontrolliert alle 102 Dateien auf Vollständigkeit, Maße, gemeinsame
Palette, Alpha, Framebelegung, Laufgrundlinien, transparente Seitenränder,
Animationsvariation, Atlasgrenzen, überlappungsfreie Regionen und die Übereinstimmung
von Einzel-Items mit ihren Atlanten. Ergebnis: `faelle-validation.json`.
Die Exporte wurden zusätzlich visuell geprüft; Übersicht: `faelle-preview.png`.

Es wird kein Spielcode geändert. Die Einbindung und die Beurteilung der Animationen
im laufenden Spiel erfolgen separat. Das schon vorhandene Item `stimmphiole.png`
wird unter derselben ID mit dem neuen Hinweis-Icon aktualisiert.

## Grafikpaket F – Bonusgegner, Bosse und Ausrüstung

Batch `kampf2`, erzeugt am 9. November 2026 mit `image_gen` nach
`codex_F_kampf2_bosse.md`: **119 PNG-Dateien aus 55 Generatorbildern**.

| Gruppe | Dateien | Format |
|---|---:|---|
| Zehn neue Kampfkulissen | 10 | 480×270, opak; Bodenstreifen y=200–269 |
| Felix, Miriam und Chorschatten | 3 | sechs Spalten; 48×48 bzw. Miriam 96×96 pro Frame |
| Stimmen- und Phioleneffekte | 4 | einreihig, 6 bzw. 8 Frames |
| Sichtbare Kartengegner | 10 | vier Richtungen × vier Frames, 16×32 oder 32×32 |
| Alarm und Zugportraits | 2 | 4×3 Zellen à 16×16; 19 Portraits in einer Reihe |
| Bestiarium | 18 | 96×128, opake Notizbuchseiten |
| Ausrüstung | 68 | vier gemischte Atlanten und 32 Items in je zwei Größen |
| Ausrüstungsoberfläche | 1 | 192×160 Atlas mit 96×128 Panel, 20×20 Slots und 8×8 Glyphen |
| Boss-Einblendung | 3 | sechs 480×270 Frames und zwei 160×160 Büsten |

`public/sprites/manifest-kampf2.json` beschreibt alle Dateien, nullbasierte
Frame-Listen, Geschwindigkeiten, Schleifen, Grundlinien und benannte Regionen.
Die Ausrüstungsatlanten sind 256×48: acht 16×16-Icons links in der oberen Reihe,
acht 32×32-Icons darunter. Die rechte Hälfte der oberen Reihe bleibt transparent.
Für die Entnahme sind die benannten `regions` maßgeblich; Einzeldateien enthalten
dieselben Pixel. `panelSlots` nennt die vier Positionen innerhalb des Papierpuppen-
Panels; separate Slotzustände und Typglyphen können darübergelegt werden.

Die Zugportraits entsprechen genau der Reihenfolge im Brief. Die Bestiariumkarten
verwenden dieselben Begegnungs-IDs, ohne den Spieler. Felix ist `felix_fight`,
Miriam ist `miriam`. Gegner laufen in der Reihenfolge unten, links, rechts, oben.
Alle Kampfgegner blicken nach links. Die zwei normalen Angriffe von Felix und Miriam
sowie der Angriff des Chorschattens halten ihre erste Ausholpose zwei Frames lang.
Kürzere Reihen haben transparente Restfelder. Die Grundlinie ist als exklusive
Unterkante angegeben (46, 94 bzw. 31 Pixel innerhalb der Zelle).

Die Bossblende verwendet ein einziges generiertes Tintenband, das in sechs Frames
mit ganzzahligen Versätzen von links einläuft; Frame 0 ist vollständig transparent.
Das endgültige Band liegt zwischen y=90 und y=179. Namen werden später vom Spiel
gesetzt, die Grafik enthält keinen Text.

Alle PNGs sind palettenindiziert mit denselben 32 sichtbaren Farben wie Batch B
und einem zusätzlichen transparenten Index. Alpha ist binär. Der technische
Export umfasst Nearest-Neighbor-Skalierung, Zellzuschnitt, gemeinsame Skalierung
und Grundlinienausrichtung pro Figuren-Sheet, Palettenzuordnung und Atlasmontage.
Das Papierpuppen-Panel verwendet ausgeschnittene, exakt auf 20×20 gerasterte Slots.
Es werden keine Illustrationen prozedural ersetzt. Der Chorschatten wurde nach
einer ersten Fassung korrigiert, um Weihrauchfass und Fanatiker-Verzierungen zu entfernen.

Die tatsächlichen Prompts, Referenzen, Korrekturen, Originaldateinamen und
SHA-256-Prüfsummen stehen in `batch-kampf2-generation.json`. Die großen
Generatororiginale sind keine Laufzeitassets und liegen nicht im Repository.

```sh
# Pillow und numpy werden benötigt; SOURCE_DIR enthält die Generatororiginale.
python docs/art/export-kampf2.py SOURCE_DIR .
python docs/art/verify-kampf2.py
```

Die Prüfung kontrolliert Vollständigkeit, Zielmaße, Palette, Alpha, Zellenbelegung,
Grundlinien, Ausholframes, Animationsvariation, Atlas-/Einzeldatei-Gleichheit,
Portrait-IDs und die konsistente Bossblende. Ergebnis: `validation-kampf2.json`.
Die exportierten Grafiken sind in `batch-kampf2-preview.png` zusammengefasst.
Die Einbindung und Timing-Abstimmung im Spiel erfolgen separat; dieses Paket
ändert ausschließlich Grafiken, Manifest und Grafikdokumentation.


## Grafikpaket H – Journal-Quellen und gefährliche Fundstücke

Batch `journal`, erstellt am 9. November 2026 mit dem integrierten Bildgenerator nach
`codex_H_journal_fundstuecke.md`: **96 PNGs** unter `public/sprites/`.

| Gruppe | PNGs | Maße |
|---|---:|---|
| 48 Mini-Köpfe und sechs Gruppenstreifen | 54 | 24×24; Streifen 192×24 |
| Zehn Quellen in zwei Größen und gemischter Atlas | 21 | 16×16, 24×24; Atlas 240×40 |
| Journal-Rahmen und Verbindungsmarker | 1 | 128×64, benannte Regionen |
| Gesangbuch und Spiegelscherbe in zwei Größen | 4 | 16×16, 32×32 |
| Sechs Nahansichten mit je einer Fluchvariante | 12 | 160×120, deckend |
| Risiko-Overlays, Risiko-Icons und Spieleraktionen | 3 | 2880×1080; 80×24; 96×128 |
| Fundbüro-Requisiten | 1 | 96×32 |

`manifest-journal.json` folgt dem 14b-Schema. Alle Frameindizes sind nullbasiert.
Gemischte Atlanten verwenden `regions` mit `[x,y,width,height]`; die erste Zeile
von `H_quellen.png` enthält zehn 16×16-Symbole, die zweite ab y=16 zehn 24×24-Symbole.
Die 24×24-Ausschnitte der Foto-/Dokumentenrahmen sind unter `apertures` angegeben.
Die Risiko-Overlays haben sechs Spalten und vier Zeilen: Unruhe (6), Fluch (6),
Hinterhalt (4), Bonus-Hinweis (6). Restfelder sind transparent. Unruhe läuft als
Schleife; die übrigen Effekte sind einmalig. Der zentrale Bereich der ersten
beiden Effektreihen bleibt frei. Spieleraktionen: Lesen (6), Zurückzucken (4),
Kopf halten (4), Notieren (4); Fußgrundlinie y=30, übrige Spalten leer.

Die 26 Generatorausgaben einschließlich einer Spielerkopf-Korrektur, vollständige
Prompts, Referenzen und SHA-256-Prüfsummen stehen in `batch-journal-generation.json`.
Der Export übernimmt die gemeinsame Palette von 14b und ersetzt drei Farbfelder
für die benötigten Violett- und gedeckten Rotakzente. Alle PNGs verwenden dieselben
31 sichtbaren Farben plus transparenten Index, Nearest Neighbor und binäres Alpha.
Die Fluchvarianten wurden aus den jeweiligen Grundansichten erzeugt.

```sh
python docs/art/export-journal.py /pfad/zu/generatorbildern
python docs/art/verify-journal.py
```

Benötigt Pillow und numpy. Die Prüfung kontrolliert 96 Dateien, Maße, gemeinsame
Palette, Alpha, Framebelegung und Padding, Grundlinien, Animationsvariation,
Atlas-/Einzeldatei-Korrespondenz, Regionsgrenzen und transparente Rahmenfenster.
Ergebnis: `journal-validation.json`; visuelle Übersichten: `journal-preview.png`,
`journal-inspect-preview.png`, `journal-fx-preview.png`.

Bestehende Porträts, Quellen-Symbole und C-Logmarker bleiben unverändert. Die sechs
Reserve-Gegenstände sind ausdrücklich nicht erzeugt. Die beiden bereits vorhandenen
16×16-Itembilder `items/verlorenes_gesangbuch.png` und `items/spiegelscherbe.png`
werden im Art-Branch durch die zur Aufgabenbeschreibung passenden Buch-/Scherben-
Motive ersetzt; insgesamt sind es 94 neue PNGs und zwei aktualisierte PNGs.
Dieses Paket ändert keinen
Spielcode. Laufzeiteinbindung, Animationstiming und die Lesbarkeit im konkreten
Journal-Layout müssen beim Einbau im Spiel geprüft werden.


## Grafikpaket D – Stadt-Erweiterung

Batch `stadt`, erstellt am 9. November 2026 nach `codex_D_stadt_erweiterung.md`:
**45 neue PNGs** mit den vorgegebenen `D_`-Dateinamen. Bestehende Tilesets bleiben erhalten.

| Gruppe | PNGs | Maße / Raster |
|---|---:|---|
| Nachtmarkt-Boden | 1 | 64×96, 24 Kacheln à 16×16 |
| Acht Bodenübergänge | 8 | 64×64, jeweils 16 Kacheln |
| Fünf Fassadenmaterialien | 5 | 128×96, 8×6 Kacheln |
| Zehn Läden | 10 | je 48×48, transparent |
| Sieben Viertel: Außenbereiche und Props | 14 | Außenbereiche 128×96; Props mit benannten Rechtecken |
| Kanalbaukasten und Krähenbrücke | 2 | 128×128 bzw. 96×48 |
| Straßenmöbel | 1 | 192×240, gemischte Objektgrößen |
| Wohnungen: Props und Tiles | 2 | 192×192 bzw. 128×128 |
| Große Stadtkarte und Nebel | 2 | je 480×270; Karte deckend, Nebel transparent |

`public/sprites/manifest-stadt.json` dokumentiert Maße, Raster, 155 benannte
Objektrechtecke und zehn Animationen. Bei gemischten Prop-Sheets sind `regions`
und die expliziten Animationsrechtecke maßgeblich; `frameWidth: 16` beschreibt
das zugrunde liegende Raster. Die Props sitzen in 48×48-Packslots, ihre tatsächlichen
Framegrößen bleiben z. B. 16×32 oder 32×16. Animationsgrundlinien sind vereinheitlicht.
Numerische Animationsindizes der Außen-Tilesets bezeichnen die linke obere
16×16-Kachel des jeweiligen Frames; größere Frames haben eigene Breite/Höhe.

Die acht Übergänge haben dieselbe nullbasierte Reihenfolge: B-Füller, obere/untere/
linke/rechte Kante, vier Außen-, vier Innenecken, zwei Diagonalen, A-Füller.
Die Namen bezeichnen den Rand von B (Außenecke oben links: B erstreckt sich nach
unten/rechts). `edgeSignatures` geben die A/B-Belegung jedes Randpixels an.
Nur kompatible Ränder werden verbunden; dies ist der angeforderte 16er-Satz,
kein vollständiger 47er-Blob-Autotiler. Die vom Generator erzeugten A/B-Texturen
wurden technisch mit gemeinsamen Randprofilen zusammengesetzt. Wiederholbare
Füllflächen und alle kompatiblen Anschlüsse werden pixelgenau geprüft.
Die zehn Nachtmarkt-Bodenvarianten und die beiden zusätzlichen Füller teilen Randpixel.

`batch-stadt-generation.json` enthält alle tatsächlich verwendeten Prompts,
Referenzen, Quellbild-Prüfsummen und geprüften Zuschnitte. Für Villen und Elend
verwenden die Prop-Sheets die bereits im Viertelprompt genannten Gegenstände.
Slum- und Fabrikfassade wurden für klarere Materialunterschiede nachgeneriert.
Die Rohbilder wurden mit Nearest Neighbor gerastert, auf 31 gemeinsame sichtbare
Farben plus Transparenzeintrag indiziert und mit binärem Alpha exportiert.
Die Palette entspricht dem Welt-Batch mit einer tiefvioletten Ergänzung anstelle
seines hellsten Ambertons. Große Baugruppen wurden separat zugeschnitten und
in die dokumentierten Atlasrechtecke gepackt.

```sh
# Python 3 mit Pillow, numpy und scipy.
# SOURCE_MAP.json: Objekt mit Job-ID -> Pfad des ursprünglichen Generator-PNGs.
python docs/art/export-stadt.py SOURCE_MAP.json
python docs/art/verify-stadt.py
```

Die Prüfung kontrolliert Vollständigkeit, Maße, Farben, Alpha, belegte Regionen,
Animationsvariation und Grundlinien sowie passende Autotile-Randpixel.
Ergebnis: `validation-stadt.json`. Sichtprüfungen der exportierten Bilder:
[Grundflächen](previews/stadt-ground.png), [Häuser und Läden](previews/stadt-buildings.png),
[Viertel](previews/stadt-districts.png), [Props](previews/stadt-props.png),
[Innenräume und Brücken](previews/stadt-interiors-bridges.png), [Karte mit/ohne Nebel](previews/stadt-map.png).

Die Einbindung und die Prüfung im laufenden Spiel erfolgen separat. Dieses Paket
ändert ausschließlich Grafikassets und ihre Dokumentation.


## Grafikpaket I – Reisen und Sekten

Batch `reise`, am 9. November 2026 nach `codex_I_reisen_sekten.md` mit
`image_gen` erzeugt: **61 PNGs**, ohne Änderungen am Spielcode.

- Acht Sektengegner: je ein 48×48-Kampf-Sheet (6×5 Zellen) und ein
  16×32-Lauf-Sheet (4×4 Zellen).
- Odo und Ysolde: zusätzlich je ein 96×96-Boss-Sheet (6×6 Zellen, Phase 2)
  unter `battle/boss_<id>.png` und vier Emotionsportraits.
- Reisearten, Spielermarker, Routenatlas und sieben Ereignisbilder (240×135).
- Zwei Fraktionsembleme mit 16-, 32- und 64-Pixel-Regionen.
- Zwei Versteckatlanten: je 8×6 Bodenkacheln à 16×16 links oben und
  24 benannte Props à 32×32 rechts; vier Feuerframes pro Atlas.
- Zwei Kampfhintergründe (480×270), Ankerhof-/Morrow-Props,
  acht Gegenstände jeweils in 16×16 und 32×32 sowie ein Itematlas.
- Jory, Lavinia und Tilly: je Lauf-Sheet und vier Portraits.
- Fraktions-UI für die spätere Einbindung.

`public/sprites/manifest-reise.json` folgt dem 14b-Schema und beschreibt
Framegrößen, Spalten, Zeilen, Animationslisten, Geschwindigkeiten und benannte
Atlasregionen. Kampfanimationen: idle / attack / special / hurt / defeated;
Boss-Sheets ergänzen phase2. Beide Angriffe beginnen mit zwei identischen
Ausholframes. Leere Restfelder sind transparent. Laufreihen: down / left /
right / up. Grundlinien sind als exklusive Unterkante angegeben.
Die Regionsnamen sind für die gemischten Atlanten maßgeblich; die Dossierregion
ist 96×128, Reise-Routen 8×8, Zielmarker 8×16.

Die tatsächlichen Prompts, Referenzen und SHA-256-Hashes der ausgewählten
Generatorbilder stehen in `batch-reise-generation.json`. Insgesamt 47
Generierungen einschließlich zweier Laufzyklus-Korrekturen. Export mit Nearest
Neighbor, gemeinsamer 31-Farben-Palette aus Batch C/14b, binärem Alpha,
zellexaktem Zuschnitt und gleicher Grundlinie. Die gemischten Atlanten wurden
nach Sichtkontrolle in die dokumentierten Zielregionen gepackt.

```sh
python docs/art/export-reise.py /pfad/zu/generatorbildern
python docs/art/verify-reise.py
```

Pillow, NumPy und SciPy werden für den Export benötigt. Die Prüfung kontrolliert
alle 61 Dateien, Maße, Palette, Alpha, Framebelegung, Grundlinien, Padding,
Ausholframes und Regionsgrenzen. Ergebnis: `reise-validation.json`.
Übersicht: `reise-preview.png`. Die Einbindung, das Animationstiming und
Tileset-Übergänge im laufenden Spiel müssen separat beurteilt werden.

Beim Abgleich mit main wurden sechs dort bereits ergänzte Itemdateien beibehalten: ankerhaken, porzellanmaske, rostanker, rostwasser, schleierdolch und schleierpuder. Die 32×32-Versionen und der Batch-I-Atlas bleiben als Varianten erhalten.

Die sechs gemeinsam verwendeten Dateien sind im Manifest als `sharedExisting` markiert; ihre tatsächlichen Maße bleiben erhalten (rostanker ist 32×32). Der Export bewahrt vorhandene gemeinsame Items. Die 55 neuen PNGs verwenden die 31-Farben-Palette; mit den gemeinsamen Icons umfasst das Paket 35 sichtbare Farben.


---

# Grafikpaket G – Wildnis, Monster und Loot

Erstellt am 9. November 2026. 73 mit dem integrierten Bildgenerator erzeugte
Vorlagen wurden in 121 Spiel-PNGs exportiert. Die tatsächlich verwendeten
Prompts und Quelldateinamen stehen in `batch-wildnis-generation.json`.

## Umfang

- Vier Gebiete: Schwarzwasser-Marsch, Pestgassen, Katakomben und Kraterwald;
  jeweils Tileset, Props und Kampf-Hintergrund.
- 16 Monster mit Kampf-Sheet, Overworld-Sheet und Bestiarium-Karte;
  vier Bosse besitzen zusätzlich Phase-2-Animationen.
- Monster-Effekte, Gefahrenanzeige und gemeinsames pulsierendes Gefahren-Overlay.
- Vier Loot-Behälter, Loot-Extras, Seltenheitsrahmen und Loot-Oberfläche.
- 16 Materialien und acht Ausrüstungsstücke, jeweils als Einzel-Icon in
  16×16 und 32×32 sowie in drei Atlanten.
- Lagerfeuer, Rastplatz und weitere sichere Lager-Props.

## Import und Animationen

Alle Pfade im Manifest `public/sprites/manifest-wildnis.json` sind relativ zu
`public/sprites/`. Gleichmäßige Sheets verwenden `frameWidth`, `frameHeight`,
`columns`, `rows` und nullbasierte Frame-Nummern. Gemischte Prop-, Effekt- und
UI-Atlanten verwenden benannte `regions` mit exakten Pixel-Rechtecken;
ihre Animationen referenzieren diese Namen. `frameRate` ist der Vorschlag
für Bilder pro Sekunde; `repeat: -1` bezeichnet eine Schleife.

Kampf-Sheets haben sechs Spalten, konstante Grundlinie, transparente Restfelder
und eine über zwei Frames gehaltene Ausholpose. Die vier Overworld-Reihen sind
unten, links, rechts, oben. Elite-Varianten verwenden dieselben Grafiken.

Die drei Item-Atlanten sind 256×48 Pixel groß: acht 16×16-Icons ab x=0, y=0;
darunter acht 32×32-Icons ab x=0, y=16. Der rechte Teil der ersten Reihe ist leer.
Die Einzeldateien tragen die vorgegebenen Item-IDs.

Das Gefahren-Sheet enthält eine gemeinsame vierteilige Vignettenanimation,
die im Manifest allen vier Gebieten zugeordnet ist. Der Loot-Fensterrahmen
ist für 9-slice mit einem Rand von 16 Pixeln markiert.

## Export und Prüfung

Gemeinsame Palette mit 31 sichtbaren Farben plus transparentem Index; binäres
Alpha, Nearest-Neighbor-Skalierung, deckende Hintergründe und Bestiarium-Karten.
Die technische Nachbearbeitung zeichnet keine neuen Motive.

Benötigt Python 3, Pillow und NumPy. Die hochauflösenden Generatororiginale
werden für den Spielimport nicht benötigt und sind nicht in dieser ZIP.
Für einen erneuten Export die protokollierten Originale bereitstellen:

```sh
python3 docs/art/export-wildnis.py --source-dir /pfad/zu/generatorbildern
python3 docs/art/verify-wildnis.py
```

`validation-wildnis.json` dokumentiert die erfolgreiche Prüfung von 121 Dateien,
31 gemeinsamen sichtbaren Farben und 805 Animations-Frame-Referenzen. Geprüft
werden unter anderem Maße, Alpha, Palette, Regionen, belegte Animationen,
leere Padding-Zellen und die gehaltene Ausholpose. Übersichten der exportierten
Monster, Gebiete, Karten und Extras wurden zusätzlich visuell kontrolliert.

## Einbaustand

Nur Assets und Dokumentation; kein Spielcode geändert. Import, Animationstiming
und Tile-Übergänge müssen beim separaten Einbau im Spiel geprüft werden.
Es wurde kein Laufzeittest des Spiels durchgeführt.

Beim Upload ersetzen die 15 bereits vorhandenen 16×16-Material-Icons die bisherigen Motive durch die neuen Batch-G-Versionen. Alle übrigen Spielassets bleiben erhalten.

## Grafikpaket L – Stadtgegner, Kopfgelder und Nachtmarker

Batch `gegner3`, erzeugt am 9. November 2026 mit `image_gen` nach
`codex_L_stadtgegner.md`: **77 PNG-Dateien aus 53 finalen Generatorbildern**.
Die Begegnungs-IDs sind geplant; die Grafiken liegen für die spätere Einbindung bereit.

| Gruppe | Dateien | Format |
|---|---:|---|
| Vier menschliche Gegner | 4 | 288×240, sechs Spalten, Frames 48×48 |
| Sechs Nachtkreaturen | 6 | 384×320, sechs Spalten, Frames 64×64 |
| Schmugglerkönigin im Kahn | 1 | 576×672, sechs Spalten, Frames 96×96 |
| Kampf-/Statuseffekte | 7 | einreihig, sechs Frames bzw. vier beim Status |
| Kartensprites inklusive Königin ohne Kahn | 11 | 4×4 Frames, 16×32 bzw. 32×32 |
| Bossbüste und vier Emotionsportraits | 2 | 160×160; 256×64 |
| Zugportraits und Bestiarium | 12 | elf 16×16-Icons; elf opake 96×128-Seiten |
| Dächer und Markthalle | 2 | 480×270, opak |
| Kopfgeld-Steckbriefe | 5 | 128×80, zwei Zustände à 64×80 |
| Beute und Belohnungen | 26 | zwei Atlanten und zwölf Items in je 16×16 und 32×32 |
| Elite-, Kopfgeld- und Nachtmarker | 1 | gemischter 128×64-Atlas |

`public/sprites/manifest-gegner3.json` enthält Dateimaße, Framegrößen,
nullbasierte Animationslisten, Geschwindigkeiten, Grundlinien und Zuordnungen.
Alle normalen Gegner haben die Reihen `idle`, `attack_a`, `attack_b`, `hurt`,
`defeated`. Die Königin ergänzt Verstärkung und Heilung und hat sieben Reihen.
Beide Angriffe beginnen mit zwei identischen Ausholframes. Kürzere Reihen werden
transparent aufgefüllt. Die Grundlinie bezeichnet die exklusive Unterkante des
Sprites innerhalb der Zelle: 46, 62 bzw. 94; bei Kartensprites 31.

Laufrichtungen sind unten, links, rechts, oben. Die Zugportraits und Bestiariumseiten
folgen den elf geplanten Gegner-IDs aus dem Brief. Die Portraitausdrücke der Königin
sind neutral, misstrauisch, wütend und leicht lächelnd. Steckbrief-Frame 0 zeigt den
gesuchten Gegner, Frame 1 die durchgestrichene Fassung; es gibt keinen lesbaren Text.

Die Item-Atlanten enthalten oben die 16×16-Versionen, darunter dieselben Motive in
32×32. Die rechte Hälfte der oberen Reihe bleibt leer. `regions` nennt die exakten
Ausschnitte; Einzeldateien und Atlanten enthalten identische Pixel. Die Marker
haben drei Reihen mit je vier 16×16-Siegeln links im Atlas und eine volle untere
Reihe mit vier 32×16-Bodenringen. `regionAnimations` verweist auf die unterschiedlich
großen Ausschnitte. Siegel bewegen sich um genau einen Pixel nach oben/unten;
der Bodenring verwendet vier generierte Phasen der umlaufenden Strichmarkierung.

Export: Nearest-Neighbor-Skalierung, Zellzuschnitt, einheitliche Skalierung pro
Figuren-Sheet, Ausrichtung an der Grundlinie, binäres Alpha und Indizierung auf die
gemeinsamen 32 sichtbaren Farben von Batch B/F plus transparenten Index. Der
Rußgeist und der Glockenheulen-Effekt wurden gezielt korrigiert. Prompts,
Referenzen, Korrekturen und Quellbild-Prüfsummen stehen in
`batch-gegner3-generation.json`. Große Generatororiginale sind keine Laufzeitassets.

```sh
# Benötigt Pillow und numpy; SOURCE_DIR enthält die dokumentierten Original-PNGs.
python docs/art/export-gegner3.py SOURCE_DIR .
python docs/art/verify-gegner3.py
```

Der Prüfer kontrolliert Vollständigkeit, Maße, Palette, Alpha, Zellbelegung,
Grundlinien, gehaltene Ausholposen, Animationsvariation, Atlasregionen,
Item-Gleichheit, Portrait-IDs, Markerbewegung und die Steckbriefzustände.
Prüfbericht: `validation-gegner3.json`. Visuelle Übersicht: `batch-gegner3-preview.png`.
Die Einbindung und Timing-Abstimmung im laufenden Spiel erfolgen separat.
Dieses Paket ändert ausschließlich Grafiken, Manifest und Grafikdokumentation.

## Batch J – Fall 5: Der Chor in der Glocke

84 PNGs für Gießerei, Vey-Haus und Resonanzkammer, vier Gegner, Miriams
Glockenphase, Brannock/Oda/Lilian, Effekte, Bestiarium, Gegenstände, Nahansichten,
sechs Zwischenszenen, vier Enden und 13 Kartenmarker. Die sechs vorhandenen
16×16-Fallgegenstände ersetzen die inzwischen auf main angelegten Platzhalter.

- Manifest: `public/sprites/manifest-fall5.json`
- Verwendete Prompts und Referenzen: `docs/art/batch-fall5-generation.json`
- Prüfung: `docs/art/batch-fall5-validation.json` (84 PNGs, 1.995 Prüfungen)
- Vorschauen: `docs/art/previews/batch-fall5-*.png`

31 gemeinsame sichtbare Farben plus Transparenz, binäres Alpha. Miriam Phase 2
verwendet 96×96-Frames und dieselbe Grundlinie 94 wie Phase 1. Angriffe halten
die Ausholpose zweimal; kurze Reihen bleiben transparent. Prop-Animationen
verwenden explizite Rechtecke, statische Varianten sind keine Animationen.
Der Schrittring beginnt bewusst mit einem transparenten Startframe. Für den
Ring aus zwölf Stimmsäulen werden zwölf Instanzen der beiden Säulenzustände
verwendet. Lilians Füße bleiben oberhalb der normalen Standlinie.

Die Item-Atlanten enthalten oben 16×16-Icons und ab y=16 dieselben Gegenstände
in 32×32. Einzeldateien und Atlas-Ausschnitte stimmen pixelgenau überein.
Die drei verfluchten Nahansichten wurden aus ihren normalen Bildern bearbeitet.

Erzeugt mit dem integrierten Bildgenerator; technische Nachbearbeitung mit
Nearest Neighbor, geprüften Zellzuschnitten und gemeinsamer Palette:

```sh
python docs/art/export-fall5.py /pfad/zu/source-map.json
python docs/art/verify-fall5.py
python docs/art/preview-fall5.py
```

Die Source-Map ordnet Job-IDs den protokollierten Generatororiginalen zu.
Nur Grafikdateien und Dokumentation; der Einbau und die Prüfung im laufenden
Spiel erfolgen separat.

## Grafikpaket M – Fall 7/8 und Miss Wren

Batch `fall78`, erstellt am 9. November 2026 aus `codex_M_fall7_8_wren.md`:
**70 neue PNGs**, dazu sieben bereits vorhandene 16×16-Itembilder im Manifest.
66 Generierungen mit dem integrierten Bildgenerator, einschließlich drei
verworfener Fassungen (Pfandeintreiber, Schuldsiegel, Ende `c7_wren`).

- Drei Gegner-Sheets und Miss Wren in zwei Phasen; sechs Spalten, fünf bzw.
  sieben Reihen. Wren verwendet 96×96-Frames und 576×672-Sheets.
- Zehn Effektstreifen, Bossbüste, fünf Zugporträts und vier Bestiariumkarten.
- Drei Innenraum-Tilesets mit je 48 Kacheln, drei Prop-Atlanten und vier
  Kampfkulissen mit freiem Bodenstreifen bei y=200–269.
- Finch, Molly und Benji mit Lauf-Sheets und vier Emotionen; drei Schlafwandler
  und drei Kartengegner mit vier Laufrichtungen.
- Sieben neue 32×32-Itembilder, gemischter Itematlas, zehn Hinweise,
  vier Nahansichten, zwei Fallakten, sechs Zwischensequenzen und sechs Enden.

`public/sprites/manifest-fall78.json` beschreibt alle 77 Dateien mit Zielmaßen,
Framegrößen, Spalten/Zeilen, nullbasierten Animationslisten und Geschwindigkeiten.
Laufreihen: unten/links/rechts/oben. Kampfgegner schauen nach links; die ersten
zwei Frames der beiden normalen Angriffe sind identische Ausholposen. Kürzere
Reihen haben transparente Restfelder. Die Grundlinie ist als exklusive
Unterkante angegeben: 30 bei Lauf-Sheets, 46/62/94 bei Kampf-Sheets.

Prop-Atlanten liegen in 64×48-Packfeldern; die benannten `regions` enthalten
die eigentlichen 16er-Raster-Rechtecke, etwa 16×32 oder 64×48.
`regionAnimations` beschreibt Manteltropfen, Herd, Webstuhl, Tretrad und
hängende Fäden. Vier Faden-Schimmerpaare stehen im Traumkeller-Tileset.
Der gemischte Itematlas ist 256×48: sieben 16×16-Icons ab y=0 und sieben
32×32-Icons ab y=16; übrige Felder transparent. Die vorhandenen 16×16-Dateien
sind als `sharedExisting` markiert und bleiben unverändert; ihre Darstellung
im Atlas wird auf die gemeinsame Palette normalisiert.

Alle neuen PNGs sind mit denselben 32 sichtbaren Farben plus transparentem
Index palettenindiziert. Export: Nearest Neighbor, Zellzuschnitt, Grundlinien-
ausrichtung, binäres Alpha und Bereinigung weißer Matten bei Waisenhaus-Props
und Albtraum-Effekt. Die Generator-Trennränder der Terrainzellen wurden entfernt.
Die Fluch-Nahansichten wurden aus den jeweiligen normalen Ansichten abgeleitet.
Die vorhandene Gouvernante dient als Identitätsreferenz; ihr Lauf-Sheet und
ihre Dialogporträts werden nicht ersetzt.

Tatsächliche Prompts, Referenzen, Originaldateinamen, SHA-256-Prüfsummen und
Exportoptionen stehen in `batch-fall78-generation.json`. Die großen
Generatororiginale werden zum Spielimport nicht benötigt.

```sh
# Pillow und numpy; SOURCE_DIRECTORY enthält die protokollierten Original-PNGs.
python docs/art/export-fall78.py SOURCE_DIRECTORY
python docs/art/verify-fall78.py
```

`validation-fall78.json` dokumentiert die Prüfung von Vollständigkeit, Maßen,
Palette, Alpha, belegten Animationsframes, leeren Restfeldern, Grundlinien,
Ausholframes und Atlasgrenzen. Sichtkontrollen: `fall78-combat-preview.png`,
`fall78-world-preview.png` und `fall78-story-preview.png`.

Nur Grafikassets und Grafikdokumentation; kein Spielcode geändert. Einbindung,
Tile-Zusammensetzung und Animationstiming im laufenden Spiel erfolgen separat.


## Batch K – Fall 6: Der dreizehnte Gast

81 PNGs für Atelier/Dunkelkammer, Ballsaal und Spiegelkabinett: drei Gegner und
Boss mit acht Animationsreihen, neun Effekte, vier Maskenballgäste,
Ashcombe/Mews, vier Kartengegner, vier Kampfkulissen, Bestiarium, Items,
Hinweise, fünf Fotoplatten-Zustände, sechs Zwischenszenen und vier Enden.
Die fünf vorhandenen 16×16-Fallgegenstände werden durch die passenden neuen
Icons ersetzt; die bestehenden E-Figuren, Fotoplatte-Icons und anderen Batches
werden weiterverwendet.

- Manifest: `public/sprites/manifest-fall6.json`
- Tatsächliche Prompts, Referenzen, Quell-Hashes und Zuschnitte: `batch-fall6-generation.json`
- Prüfbericht: `batch-fall6-validation.json` (81 PNGs, 2.519 Prüfungen)
- Sieben Übersichten und Boss-Animation: `previews/batch-fall6-*`

31 gemeinsame sichtbare Farben plus transparenter Index; binäres Alpha.
Kampf-Sheets haben sechs Spalten, transparente Restzellen und eine einheitliche
Grundlinie je Sheet. `baselineY` ist die inklusive letzte sichtbare Pixelzeile:
46/62/94 im Kampf, 30 bzw. 30 bei 16×32-/32×32-Kartensprites.
Angriffe halten die erste Ausholpose für zwei Frames. Laufrichtungen: unten,
links, rechts, oben. Effekte und Emotionsporträts liegen als horizontale Streifen vor.

Variable Prop-Atlanten verwenden benannte `regions` und `regionAnimations`.
Kamera, Schrank, Plattenentwicklung und Schattenablösung laufen einmal;
Lampen, Kronleuchter, Tank und Karussell wiederholen ihre Animation.
Die 13 Stühle sind separat benannt, die Tafel hat sechs plus sieben Gedecke.
Terrain hat 8×8 Tiles à 16 Pixel, benannte Tile-IDs und größere `tileRegions`;
die vier Basisboden-Varianten haben passende Randpixel für freie Kombination.
Die Item-Atlanten enthalten 16×16-Icons oben und 32×32-Icons ab y=16.

```sh
# Pillow und numpy; SOURCE_DIR enthält die protokollierten Generatororiginale.
python docs/art/export-fall6.py SOURCE_DIR .
python docs/art/verify-fall6.py .
python docs/art/preview-fall6.py .
```

Die Prüfung umfasst Vollständigkeit, Maße, gemeinsame Palette, Alpha,
Atlasregionen, Animationsindizes, Zellenränder, Grundlinien, Ausholposen und
Bodenübergänge. Bildkorrekturen betreffen unter anderem transparente Hintergründe,
Mews ohne Brille, eindeutige Fotoplatten-Stufen und die Fotografin im Schlussbild.
Grafikpaket und Dokumentation sind fertig; Einbau und Timing-Abgleich im laufenden
Spiel erfolgen separat. Kein Spielcode wurde geändert.

## Grafikpaket O – Geheime Treffen

Batch `treffen`: 20 neue PNGs nach `codex_O_geheime_treffen.md`, erzeugt mit
`image_gen`. Vier NPCs (Schleierbote, Tresswell, Vellacourt, Kohlenjem) erhalten
je ein 64×128-Laufsheet, vier 64×64-Emotionsportraits und einen 24×24-Journalkopf.
Dazu kommen je drei 128×64-Tileatlanten und 192×192-Prop-Sheets, die Stadtmarker
(48×64) und ein gemischter Zirkel-Atlas (128×64).

`manifest-treffen.json` dokumentiert Framegrößen, Spalten/Zeilen, nullbasierte
Animationen und die maßgeblichen Rechtecke für Props und Zirkel-Symbole.
Props liegen in 48×48-Packslots; ihre Entnahmerechtecke haben die im Brief
geforderten Maße (16×16 bis 48×16 bzw. 32×32). Laufreihen: down/left/right/up,
Grundlinie als exklusive Unterkante bei 31. Portraits: neutral/suspicious/
shocked/smiling. Der Schleierbote bleibt auch bei Emotionen vollständig verhüllt.
Die Köpfe werden aus dem neutralen Portrait ausgeschnitten.

Drei Kerzenvarianten, Waage, Lampen, Kreidestaub, Ofen, Laterne und Käfig haben
benannte Animationsregionen. Marker folgen waage/kreide/russ; Reihen sind normal,
bernsteinfarben, aktiv Phase 1 und aktiv Phase 2. Die acht Timerframes liegen
in der unteren Reihe des Zirkel-Atlas. Der letzte Timerframe ist vollständig leer und beendet den Countdown. Die Embleme liegen
oben, die drei Einladungen darunter. Keine lesbaren Beschriftungen.

16 Generatorbilder wurden zellweise zugeschnitten, per Nearest Neighbor skaliert
und auf 31 gemeinsame sichtbare Farben plus Transparenz indiziert. Palette aus
14b, mit tiefem Violett statt des hellsten Ambertons. Alpha ist binär; Kreidestaub
nutzt ein Checker-Muster für simulierte Transparenz. Plain-Floor-Varianten teilen
Randpixel. Tilegruppen sind im Manifest angegeben; die komplexen Wand-, Kreis-
und Türelemente sind keine vollständigen Autotile-Sätze und müssen beim Mapbau
passend kombiniert werden. Die großen Generatororiginale sind keine Spielassets.

Die tatsächlichen Prompts und Quellbild-Hashes stehen in
`batch-treffen-generation.json`; die genauen technischen Zuschnitte im Exporter.

```sh
python docs/art/export-treffen.py /pfad/zu/generatorbildern
python docs/art/verify-treffen.py
```

Pillow und NumPy erforderlich. Die Prüfung kontrolliert alle 20 Dateien, Maße,
Palette, binäres Alpha, Framebelegung, Regionsgrenzen/-überlappungen,
Animationsvariation, Laufränder und Grundlinien. Bericht: `validation-treffen.json`.
Die finalen Exporte wurden visuell geprüft. Kein Spielcode geändert;
Einbindung, Tileübergänge und Animationstiming im Spiel erfolgen separat.

## Grafikpaket N – Sequenz 6/5 und Asservatenkammer

Batch `sequenzen2`, erstellt am 9. November 2026 nach
`codex_N_sequenzen_artefakte.md` mit dem integrierten Bildgenerator: **127 PNGs**
aus 34 Generatorausgaben. 69 bestehende Platzhalter werden unter identischen
Dateinamen ersetzt; 58 PNGs kommen neu hinzu. Kein Spielcode wurde geändert.

- 14 Tränke für Sequenz 6 und 5, jeweils 16×16 und 32×32.
- 14 Formeln sowie der Atlas `items/formeln_2.png` (112×32).
- `ui/skill_icons_2.png` (112×32) und 14 einreihige Fähigkeitseffekte.
- Zwölf verfluchte Artefakte und 15 Zutaten in jeweils zwei Größen, vier Atlanten.
- Zwei zusätzliche Herz-Pulsstreifen in beiden Größen.
- Artefakt-UI: drei 20×20-Slots, zwei 8×8-Marker, leere 64×8-Unruheanzeige
  und vier separate 64×8-Füllstreifen.
- Thale und Varga: je 64×128-Lauf-Sheet, 256×64-Emotionsportrait und
  24×24-Notizbuchkopf aus dem neutralen Portrait.

`public/sprites/manifest-sequenzen2.json` enthält alle Maße, Framegrößen,
Spalten/Zeilen, nullbasierte Animationslisten, vorgeschlagene Geschwindigkeiten
und die Zielzuordnung der Effekte. 64×64-Effekte haben acht Frames;
48×48- und 32×32-Effekte haben sechs. `spiegelbild`, `lebenselixier` und
`unbeugsam` sind Selbst-Effekte. Laufreihen: down, left, right, up;
Fußgrundlinie: exklusive Unterkante 31. Portraits: neutral, suspicious,
shocked, faint_smile. Nur Laufzyklen, Herzpuls und Unruhefüllung sind Schleifen.

Die Pfadspalten sind laterne, faden, maske, echo, kessel, eisen, schluessel;
Sequenzreihen sind 6, 5. Gemischte Atlanten verwenden benannte `regions`
mit `[x,y,width,height]`. Itematlanten: kleine Icons ab y=0, große ab y=16;
der rechte Teil der kleinen Zeile bleibt transparent. Die Herzanimationen
liegen zusätzlich unter `<id>_pulse.png` und `32/<id>_pulse.png`, damit die
bestehenden statischen Itemdateien weiterhin genau 16×16 bzw. 32×32 bleiben.
Die UI-Füllanimation referenziert benannte Regionen; die Slotöffnung ist
`[4,4,12,12]`. Notizbuchköpfe behalten den deckenden Portrait-Hintergrund.

Die tatsächlich verwendeten Prompts, Referenzen, Quellbild-Dateinamen,
SHA-256-Hashes und Zuschnitte stehen in `batch-sequenzen2-generation.json`.
Technische Nachbearbeitung: individuelle Zellzuschnitte, Nearest Neighbor,
gemeinsame Palette mit 32 sichtbaren Farben plus transparentem Index,
binäres Alpha. Die Palette übernimmt Batch A und ergänzt den geforderten
Artefakt-Randton #6a4a8a. Animationen verwenden eine gemeinsame Skalierung
pro Sheet, damit Expansion und Bewegung erhalten bleiben. Große
Generatororiginale sind keine Laufzeitassets und nicht im Repo enthalten.

```sh
# SOURCE_MAP.json: {"trank_laterne": "/pfad/original.png", ...}
# Export: Pillow, numpy, scipy; Prüfung: Pillow, numpy.
python docs/art/export-sequenzen2.py SOURCE_MAP.json
python docs/art/verify-sequenzen2.py
```

Die Prüfung kontrolliert 127 Dateien, Zielmaße, gemeinsame Palette, Alpha,
142 Animations-Frame-Referenzen, Animationsvariation, Fußlinien, Regionsgrenzen,
transparente Restflächen, Atlas-/Einzeldatei-Gleichheit und Portrait-Kopfausschnitte.
Ergebnis: `validation-sequenzen2.json` (1536 Prüfungen erfolgreich).
Sichtkontrolle: [Items und UI](sequenzen2-items-preview.png),
[Effektstreifen](sequenzen2-fx-preview.png), [Figuren](sequenzen2-npc-preview.png).

Die Einbindung sowie die Prüfung von Timing und Lesbarkeit im laufenden Spiel
bleiben ein separater Arbeitsschritt. Vorhandene Sequenzen 9–7, Pfadkarten,
Statusicons und die bisherigen 21 Fähigkeitseffekte bleiben unverändert.

## Batch Q – Wexmoor

14 PNG-Dateien für Kapitel 2: Zunder und Druce (Laufen, vier Emotionen, Notizbuchkopf), Grauspäher (Laufen und Laterne heben, vier Emotionen), Stadtkarte mit sieben Pin-Koordinaten, separates Nebeloverlay, sieben Marker mit Highlight, Laternenlicht, Kajüten-Tiles und Props.

Manifest: `public/sprites/manifest-wexmoor.json`. Tatsächliche Prompts: `docs/art/batch-wexmoor-generation.json`. Exporte sind indizierte PNGs mit gemeinsamer Palette (31 sichtbare Farben plus Transparenz), binärem Alpha und Nearest-Neighbor-Skalierung. Eine Palette-Farbe wurde für die orange Verdachtskante ergänzt.

Laufen: 16×32, Reihen unten/links/rechts/oben, vier Frames; beim Grauspäher fünfte Reihe Laterne heben. Portraits: 64×64, vier nebeneinander. FX: 384×168, vier 96×56-Zellen pro Reihe; `frameRects` definieren Normal 96×48, Verdacht 96×56 und Standlicht 32×32. Props: 160×128, fünf 32×32-Zellen pro Reihe; `regions` enthalten die tatsächlichen 16×16-, 16×32- und 32×16-Ausschnitte. Terrain: 128×48, 24 Tiles à 16×16. Pin-Koordinaten beziehen sich auf 480×270.

Status: Grafikexport geprüft; Einbau und Animationstest im Spiel ausstehend. Keine Spielcodeänderungen. Beim Import in einen inzwischen geänderten Branch diesen Abschnitt an dessen README anhängen statt neuere Einträge zu überschreiben.



## Grafikpaket P – Rituale

7 Ritualkreise (512×64, acht Frames à 64×64) und 7 Szenenkarten (96×128). Reihenfolge: laterne, faden, maske, echo, kessel, eisen, schluessel.

Manifest: `public/sprites/manifest-rituale.json`. Animationsindizes sind nullbasiert: draw 0–2, danach loop 3–7 bei 8 fps. Binäre Transparenz, gemeinsame Palette aus der vorhandenen Laternen-Pfadkarte. Kartenrahmen und Pergament exakt übernommen. Keine Spielcodeänderungen.


Vorschau: `preview-rituale.png`. Technischer Prüfbericht: `validation-rituale.json`. Einbindung und Timing-Prüfung im laufenden Spiel erfolgen separat.

## Grafikpaket R – Wexmoor: Orte, Figuren und Kapitel-2-Finale

Batch `wexmoor2`, 9. November 2026: **74 PNGs aus 63 Hauptbildern und vier gezielten Korrekturbildern**,
nach `codex_R_wexmoor_orte_figuren.md`. Erzeugt mit `image_gen`; die Einbindung
in die Karten, Dialoge und Kämpfe erfolgt separat.

| Gruppe | PNGs | Inhalt |
|---|---:|---|
| Figuren | 25 | Acht Lauf-Sheets, acht Emotions-Sheets, acht Notizbuchköpfe, Starling-Verblassensportrait |
| Verkleidungen | 9 | Drei Spieler-Lauf-Sheets, drei Icons in je 16×16 und 32×32 |
| Orte | 14 | Vier Tilesets, zehn Prop-Atlanten mit benannten Ausschnitten |
| Kampf-Hintergründe | 5 | Stege, Oberstadt, Vergessmoor, Leuchtturmbasis und Laternenraum |
| Bosse | 10 | Namenlose und Leuchtfeuer: zwei Kampf-Sheets, zwei Büsten, sechs Effekte |
| Kapitelbilder | 11 | Fallakte, sechs Szenen, vier Enden |

Lauf-Sheets sind 64×128 mit 16×32-Zellen, Reihen unten/links/rechts/oben.
Portraits sind 256×64 mit vier 64×64-Emotionen: neutral, misstrauisch,
erschrocken, leicht lächelnd. Die 24×24-Notizbuchköpfe sind aus dem jeweiligen
Neutralportrait ausgeschnitten. Die drei neuen Verkleidungen verwenden das
vorhandene Ermittler-Sheet als Identitätsreferenz. Ihre bestehenden 16×16-Icons
`torfkittel`, `fischerjacke` und `akademierobe` werden an den ausdrücklich
vorgegebenen Pfaden erneuert und um passende 32×32-Versionen ergänzt.

Alle Terrainatlanten haben acht 16×16-Kacheln pro Reihe. Prop-Atlanten sind
256 Pixel breit und auf dem 16er-Raster gepackt. `regions` benennt jedes Motiv
und jeden Zustand in Originalmaßen; `regionAnimations` listet animierte
Glanz-, Rauch-, Flacker-, Bojen- und Rotationsphasen. Statische Varianten und
offen/geschlossen-Paare stehen unter `states`. Freie Atlasflächen bleiben leer.
Die im Generatorbild gemessenen Ausschnitte stehen als `sourceBoxes` in der
Generierungsdokumentation, damit breite Kähne und Lokomotiven ganz erhalten bleiben.

Beide Bosse haben 576×672 Pixel, sechs Spalten und sieben Reihen à 96×96.
Belegte Frames je Reihe: 4, 6, 6, 6, 6, 3, 6. Die ersten zwei Frames beider
Angriffe halten die Ausholpose. Die Grundlinie liegt exklusiv bei y=94,
bei Lauf-Sheets bei y=31. Hintergrundbilder und Enden sind opake 480×270;
Kampf-Hintergründe reservieren die unteren 70 Pixel als Bodenstreifen.
Szenen sind 240×135, die Fallakte 128×96.

Palette: 31 gemeinsame Farben der bisherigen Pakete plus `#e8f0ff` für das
kalte gestohlene Licht, insgesamt höchstens 32 sichtbare Farben. Das neue Weiß
ersetzt den hier nicht benötigten Rosaton. Alpha ist binär. Starlings Gesicht
und Hände flackern in den Lauf-Frames 2 und 4 mit transparentem Pixel-Dithering;
sein Akt-V-Portrait zeigt dieselbe Person stärker verblassend vor Schiefergrau.

`public/sprites/manifest-wexmoor2.json` dokumentiert Maße, Raster, Animationen,
Atlasregionen und Ableitungen. `batch-wexmoor2-generation.json` enthält die
tatsächlich verwendeten Prompts, Referenzen, Quellmaße und SHA-256-Prüfsummen.
Die Geländer- und Nebeloverlays, zwei Moosecken sowie die felsige Inselküste wurden mit vier
separaten Generatorbildern korrigiert; ihre Einfügung ist unter `repairs`
dokumentiert. Der vollständig belegte Leuchtturm-Terrainatlas ist deckend.
Die Generatororiginale sind keine Laufzeitassets. Technischer Export:
Nearest Neighbor, Rasterzuschnitt, gemeinsame Skalierung pro Animation,
Grundlinienausrichtung, Alpha-Schwelle 128 und Palette-Indizierung.

```sh
# Pillow und numpy; SOURCE_DIR enthält die dokumentierten Generatororiginale.
python docs/art/export-wexmoor2.py SOURCE_DIR .
python docs/art/verify-wexmoor2.py
```

Prüfbericht: `validation-wexmoor2.json`. Übersicht: `batch-wexmoor2-preview.png`.
Der Prüfer kontrolliert Vollständigkeit, Maße, Farben, Alpha, leere Rasterfelder,
Grundlinien, Ausholposen, Animationsvariation, Prop-Regionen und Varianten,
Portrait-/Item-Ableitungen sowie das kalte Weiß der Lichteffekte.


## Batch T – Zirkelmitglieder

55 PNGs für die Treffen-Auktionen: alle 18 Mitglieder mit Lauf-Sheet (64×128, 16×32 je Frame), Emotions-Sheet (256×64) und neutralem Sitzleistenkopf (24×24), dazu der optionale Auktionsatlas. Die Cobb-Zwillinge haben auch im Kopficon beide Köpfe in einem gemeinsamen Mantel.

Manifest: `public/sprites/manifest-zirkel.json`. Prompts, Referenzen, Quell-Hashes und Zuschnitte: `batch-zirkel-generation.json`. Vorschau: [alle Mitglieder](batch-zirkel-preview.png). Gemeinsame 32-Farben-Palette, indizierte PNGs, Nearest Neighbor, binäres Alpha; Portraits und daraus abgeleitete Köpfe haben deckenden Schieferhintergrund.

Laufreihen: down / left / right / up, jeweils vier Frames bei 8 fps. Portraitzustände: neutral / suspicious / shocked / bidding; die vierte Pose hebt Hand, Haken oder Bietermarke. `T_auktion.png` ist ein 128×64-Atlas mit benannten `regions`: zwei 16×16-Bietehände, fünf 12×12-Zirkelmarken, vier 24×24-Hammerschlagframes und ein 24×24-Wachssiegel ohne Schrift. `regionAnimations` beschreiben Bieten (4 fps) und Zuschlag (10 fps).

```sh
python docs/art/export-zirkel.py SOURCE_MAP.json
python docs/art/verify-zirkel.py
```

Die Source Map ordnet die 37 Job-IDs den ursprünglichen Generator-PNGs zu. Die Prüfung bestätigt 55 Dateien, 288 Laufbilder, 72 Portraitzustände, 18 identische Kopfableitungen, 12 Atlasregionen, Maße, Palette, Transparenz und Framegrenzen. Sichtprüfung erfolgte auch im Zielraster. Keine Spielcodeänderung; Einbindung und Prüfung der Darstellung im laufenden Spiel erfolgen separat. Vorhandene Gastgeber, weitere Zirkelpersonen und Treffen-Räume werden nicht ersetzt.

## Paket U – Gebäudefiguren (`gebaeude`)

Constable Dunn, Odile Crane und Ambrosius Quint erhalten jeweils ein Lauf-Sheet (64×128, 4×4 Frames à 16×32), ein Emotions-Sheet (256×64, vier 64×64-Portraits) und einen transparenten Notizbuchkopf (24×24).

Laufrichtungen: unten, links, rechts, oben; je 4 Phasen mit empfohlenen 7 fps. Emotionen: neutral, misstrauisch, erschrocken, leichtes Lächeln. Die Portrait-Hintergründe bleiben deckend. Laufbilder und Köpfe besitzen ausschließlich binäres Alpha. Alle neun PNGs verwenden dieselbe Palette mit 31 sichtbaren Farben plus transparentem Index.

Manifest: `public/sprites/manifest-gebaeude.json`. Tatsächlich verwendete Prompts und Exportparameter: `docs/art/batch-gebaeude-generation.json`. Prüfung: `docs/art/batch-gebaeude-validation.json`. Die Köpfe sind Ausschnitte der neutralen Portraits. Laufbilder stehen auf der lokalen Grundlinie y=30, mit transparentem Zellrand. Keine Laufzeitintegration und keine Änderungen am Spielcode.

## Batch S – Wexmoor: Monster, Einzelgänger, Zirkel und Beute

111 PNGs für `wexmoor3`: zehn Monster mit Kampf- und Kartenanimationen, sieben Einzelgänger mit Laufen/Emotionen/Kampf/Notizbuchkopf, Salzwatt mit Glockenmutter, zwei Zirkelräume samt Gastgebern, acht Effektstreifen, 13 Bestiariumkarten, Zugleiste und Beziehungs-UI sowie zwölf Items in 16×16 und 32×32 mit zwei Atlanten.

Manifest: `public/sprites/manifest-wexmoor3.json`. Prompts und Quellen-Hashes: `batch-wexmoor3-generation.json`. Alle Animationsindizes sind nullbasiert. Kampf-Sheets haben sechs Spalten, 64×64 für Monster, 48×48 für Einzelgänger und 96×96 für die Glockenmutter. Unbenutzte Frames sind transparent; die ersten beiden Frames beider Angriffe sind identisch. Einzelgänger beenden den Kampf mit `yields`. Die Glockenmutter hat sieben Reihen.

Portraitreihenfolge gemäß Abschnitt 3 des Briefings: **neutral, friendly, hostile, shocked**. Kartenfiguren: unten, links, rechts, oben. Das Weißlicht belegt höchstens 16×16 innerhalb einer 32×32-Zelle. Props und UI verwenden ausdrücklich benannte `regions` und `regionAnimations`; diese Ausschnitte beim Laden verwenden. Die Reihenfolge der 20 Zugportraits steht im Feld `ids`. Die ersten vier Bodenvarianten jedes Tilesets haben gemeinsam angeglichene Kanten.

Nachbearbeitung: Zellzuschnitte, Entfernung äußerer Generatorränder, gemeinsame Skalierung je Animationssheet, Nearest Neighbor, eine Palette mit maximal 32 sichtbaren Farben plus transparentem Index, binäres Alpha. Fremdlicht wird kalt-weiß indiziert; feindselige Augen erhalten die jeweilige Pfadfarbe. Kleine Köpfe und Itemgrößen sind aus den zugehörigen Generatorgrafiken abgeleitet. Die großen Generatororiginale sind nicht Teil der Laufzeitassets.

```sh
# Original-PNGs mit den Dateinamen aus dem Generierungsprotokoll:
python docs/art/export-wexmoor3.py /pfad/zu/originalen
python docs/art/verify-wexmoor3.py
```

Der Prüfbericht `validation-wexmoor3.json` kontrolliert Vollständigkeit, Maße, Palette, Alpha, Animationsreferenzen und Variation, Leerframes, Ausholpose, Grundlinie, Regionsgrenzen, Atlas-/Einzeldatei-Gleichheit und Portraitausschnitte. Grafikexport; Einbindung und Timing-Prüfung im laufenden Spiel erfolgen separat. Keine Spielcodeänderungen.

Vorschauen: [Kämpfe 1](preview-wexmoor3-battle-1.png), [Kämpfe 2](preview-wexmoor3-battle-2.png), [Kämpfe 3](preview-wexmoor3-battle-3.png), [Figuren](preview-wexmoor3-figures.png), [Bestiarium](preview-wexmoor3-cards.png), [Welt, UI und Effekte](preview-wexmoor3-world-ui.png).

## Grafikpaket V – Kapitel 2: Elsbeth, Gasthaus und Constable Price

Batch `wexmoor4`, 9. November 2026, nach `codex_V_kapitel2_ausbau.md`:
**sechs PNGs aus fünf mit image_gen erzeugten Hauptbildern und einer Treppenkorrektur**. Einbindung separat.

| Datei unter public/sprites/ | Maße | Inhalt |
|---|---:|---|
| `characters/V_elsbeth_walk.png` | 64×128 | 4×4 Laufbilder, 16×32, unten/links/rechts/oben |
| `portraits/V_elsbeth_emotions.png` | 256×64 | Benommen, besorgt, erschrocken, weinend erleichtert |
| `ui/heads/elsbeth.png` | 24×24 | Ausschnitt des ersten Portraits |
| `tilesets/V_01_glocke_tiles.png` | 128×48 | 24 Terrainkacheln à 16×16, acht pro Reihe |
| `props/V_glocke_props.png` | 256 Pixel breit | 15 benannte Motive/Zustände auf dem 16er-Raster |
| `battle/enemy_price.png` | 288×288 | Sechs Animationsreihen, 48×48 pro Zelle |

Elsbeths fünf vorgegebene Farben und Prices zwei Polizeifarben ergänzen 25
gemeinsame Wexmoor-Farben zu einer Palette von maximal 32 sichtbaren Farben.
Prices vorhandenes Lauf-Sheet und Polizeiportrait dienen als Identitätsreferenz;
die Elsbeth-Portraits verwenden ihr neues Lauf-Sheet. Bestehende Assets bleiben erhalten.

Price: `idle` 4, `truncheon` 6, `lantern_flash` 6, `whistle` 4, `hurt` 2,
`defeated` 4 Frames; kürzere Reihen haben transparente Restfelder. Bei beiden
Angriffen sind die ersten zwei Frames dieselbe Ausholpose. Grundlinie exklusiv
y=46, bei Elsbeth y=31. Vorschläge für Bildraten stehen im Manifest.

Das Gasthaus hat einen eigenen Tresen und eine separat darüber platzierbare
rissige Bronzeglocke, Gästebuch geschlossen/offen, zwei Tischvarianten, drei
Ofenphasen und drei Tropf-/Eimerphasen. Weitere Props: Fischfass, Schlüsselbrett
mit leerem Haken und Anschlagbrett. Benannte Ausschnitte stehen in `regions`,
Animationen in `regionAnimations`, statische Varianten in `states`.
Die Treppe besteht aus den Kacheln `[[14,15],[22,23]]` (nullbasiert), das
Bullaugenfenster animiert die Kacheln 18 und 19. Der Terrainatlas ist deckend. Die durchgehende Treppe stammt aus einem separat
erzeugten 32×32-Motiv, das in vier Kacheln aufgeteilt wird (`repairs`).

Manifest: `public/sprites/manifest-wexmoor4.json`; Prompts, Referenzen,
Quellmaße und Prüfsummen: `batch-wexmoor4-generation.json`; Sichtübersicht:
`batch-wexmoor4-preview.png`; technischer Prüfbericht: `validation-wexmoor4.json`.
Export: Nearest Neighbor, binäres Alpha, gemeinsame Skalierung pro Animation,
Grundlinienausrichtung, Palette-Indizierung und dokumentierte Prop-Ausschnitte.
Der Notizbuchkopf wird aus dem ersten Portrait abgeleitet.

```sh
# Pillow und numpy; SOURCE_DIR enthält die dokumentierten Generatororiginale.
python docs/art/export-wexmoor4.py SOURCE_DIR .
python docs/art/verify-wexmoor4.py
```


## Grafikpaket W – Versunkene Altstadt und Nebengeschichten

Batch `wexmoor5`, 9. November 2026: **41 PNGs aus 23 akzeptierten image_gen-Bildern**.
Neue Kulisse unter Pfahldorf: 32 Terrainkacheln, zehn Prop-Regionen/Zustände
und ein deckender Kampf-Hintergrund (480×270, Bodenstreifen y=200–269).
Vier Monster erhalten Kampf-Sheet, Kartenfigur und Bestiarium-Karte.
Der Bürgermeister erhält sieben Kampfreihen, eine Bestiarium-Karte und ein
deckendes Intro (480×270). Dazu fünf Zugportraits, vier Effektstreifen und
neun Items jeweils in 16×16 und 32×32; die kleinen Icons ersetzen Platzhalter.

Kampfraster: sechs Spalten, Monster 64×64, Bürgermeister 96×96.
Reihen und Bildraten stehen im Manifest; die ersten zwei Frames beider
Angriffe sind pixelgleich. Exklusive Grundlinien: Monster y=62, Boss y=94,
Kartenfiguren y=31. Unbenutzte Kampffelder bleiben transparent.
Kartenrichtungen: unten, links, rechts, oben. Zugportraits:
Pfahlbohrer, Ratsherr, Kellerkrebs, Namensmade, Bürgermeister.

Props über benannte `regions` ausschneiden: Schleuse offen/geschlossen
unter `states`, zwei Fensterphasen unter `regionAnimations`.
Vier Wasseranimationen haben je zwei Phasen. Pfahlstücke werden als
`[[24,25]]` (horizontal) bzw. `[[26],[27]]` (vertikal) zusammengesetzt.
Nachbearbeitung: dokumentierte Zellzuschnitte, gemeinsame Skalierung pro
Animationssheet, Nearest Neighbor, binäres Alpha und gemeinsame Palette
mit höchstens 32 sichtbaren Farben (Export verwendet 30).

Manifest: `public/sprites/manifest-wexmoor5.json`.
Prompts, Referenzen, Quellprüfsummen und Zuschnitte:
`batch-wexmoor5-generation.json`. Prüfung: `validation-wexmoor5.json`.

```sh
# Export: Pillow, numpy, scipy; SOURCE_DIR enthält die dokumentierten Originale.
python docs/art/export-wexmoor5.py SOURCE_DIR
# Prüfung und Vorschauen: Pillow, numpy; keine Originale erforderlich.
python docs/art/verify-wexmoor5.py --preview
node --test tests/sprites.test.js
```

Sichtkontrolle: [Übersicht](preview-wexmoor5-overview.png),
[Effekte](preview-wexmoor5-effects.png),
[Pfahlbohrer](preview-wexmoor5-battle-pfahlbohrer.png),
[Ratsherr](preview-wexmoor5-battle-ratsherr.png),
[Kellerkrebs](preview-wexmoor5-battle-kellerkrebs.png),
[Namensmade](preview-wexmoor5-battle-namensmade.png),
[Bürgermeister](preview-wexmoor5-battle-buergermeister.png).
Grafikexport; Einbindung und Timing-Prüfung im laufenden Spiel erfolgen separat.

## Batch X — Treffen-Artefakte und restliche Platzhalter (`platzhalter`)

86 PNGs gemäß `codex_X_artefakte_platzhalter.md`: 50 Item-Icons (31 kleine und 19 große), vier Fall-9-Kampf-Sheets, fünf Boss-Büsten, vier Zugporträt-Dateien mit 31 Einträgen, zwölf Bestiarium-Karten, Fallakte und vier Endbilder, fünf Emotions-Sheets und ein Zirkel-Marker-Sheet. Die zwölf vorhandenen 32er-Icons aus Abschnitt 2.1 bleiben unverändert.

- Manifest: `public/sprites/manifest-platzhalter.json` mit Frame-Listen, Tempo, transparenten Auffüllfeldern, IDs/Regionen und Starling-Spezial-/Niederlagenframes.
- Bildgenerierung: `docs/art/batch-platzhalter-generation.json` dokumentiert alle tatsächlichen Prompts, Korrekturen, Referenzen, Quellbild-Prüfsummen und gemessenen Quellausschnitte. 16er-Icons wurden als eigene vereinfachte Motive erzeugt.
- Export: `python docs/art/export-platzhalter.py SOURCE_DIRECTORY` (Pillow, NumPy). Nearest Neighbor, gemeinsame Palette mit 32 sichtbaren Farben, binäres Alpha, einheitliche Grundlinie und exakt zwei identische Ausholframes bei Angriff A/B. Die hochauflösenden Generatorquellen sind nicht Teil des Runtime-Pakets; ihre Dateinamen und SHA-256 stehen im Generierungsprotokoll.
- Prüfung: `python docs/art/verify-platzhalter.py` (Pillow). Prüft alle 86 Dateien, Maße, Palette, Alpha, Frame-Belegung, Ausholframes, Icon-Duplikate und die unveränderten 32er-Vorlagen. Sichtprüfung umfasst den direkten Vergleich alter/neuer Icons, Figurenidentität, Reihenfolge und Endbilder.

Asset-Lieferung; die Einbindung ins Spiel erfolgt separat.

## Grafikpaket AK – zusätzliche Dialogstimmungen (`emotionen2`)

32 neue Portrait-Sheets mit insgesamt 128 Ausdrücken nach `codex_AK_emotionen.md`.
Jede Datei `public/sprites/portraits/AK_<id>_emotions2.png` ist 256×64 Pixel groß:
vier 64×64-Zellen in der Reihenfolge **wütend, traurig, nachdenklich, entschlossen**.
Alle 32 im Briefing genannten Referenzdateien waren vorhanden und wurden unverändert
als Identitäts- und Stilreferenz an den integrierten Bildgenerator übergeben.

Manifest: `public/sprites/manifest-emotionen2.json`, mit Figur-ID, Referenz,
nullbasierten Frame-Indizes und deutschen/englischen Emotionsnamen.
[Vergleichsvorschau](AK_vorschau.png): pro Figur links die vier bestehenden
Portraits in ihrer Originalreihenfolge, rechts die vier neuen Stimmungen.
Die alte Reihenfolge ist nicht für alle Figuren identisch (z. B. Elsbeth);
die neue Reihenfolge ist für alle 32 Figuren gleich.

`batch-emotionen2-generation.json` enthält sämtliche tatsächlich verwendeten
Prompts, Referenz- und Quellbild-Prüfsummen sowie die finalen Zellzuschnitte.
Nachbearbeitung: Nearest Neighbor auf das Zielraster und Indizierung ohne Dithering
auf die gemeinsame Palette mit 31 Farben aus Batch C. Die Portrait-Hintergründe
bleiben wie in den Vorlagen deckend; Alpha ist ausschließlich 255.
Die Generatororiginale sind keine Laufzeitassets und werden nicht mitgeliefert.

```sh
# Export benötigt Pillow und NumPy; SOURCE_DIR enthält die dokumentierten Originale.
python docs/art/export-emotionen2.py SOURCE_DIR
# Prüfung und Vorschau benötigen nur Pillow; Originale nicht erforderlich.
python docs/art/verify-emotionen2.py
node --test tests/sprites.test.js
```

`validation-emotionen2.json` bestätigt Vollständigkeit, Maße, gemeinsame Palette,
Alpha, vier unterschiedliche Frames/Gesichtsausschnitte je Figur, gültige Quellboxen
und unveränderte Referenzen. Alle 32 Sheets wurden in der Vergleichsvorschau visuell
kontrolliert; bei Ivy, Price, Druce und Brack wurden Zuschnitte nachjustiert.
35 bestehende Sprite-Tests bestehen. Asset-Lieferung ohne Spielcodeänderung;
Dialogzuordnung und Prüfung der Darstellung im laufenden Spiel erfolgen separat.

## Batch AH – Eigene Figur für Spieler 2 (`spieler2`)

33 PNGs für zwei unterscheidbare Koop-Figuren: `p2a` mit Schiebermütze,
kurzem grünem Mantel, senfgelbem Halstuch und Notizbuch; `p2b` mit Melone,
ockerbraunem langem Mantel, Bart und runder Brille. Je Variante acht
Karten-Sheets einschließlich Torfkittel, Fischerjacke und Akademierobe,
drei Kampf-Sheets, zwei Emotions-Sheets, HUD-Kopf und Zugportrait.
Dazu Koop-Oberfläche, Kombiangriff und deckendes Auswahlbild (240×135).

Manifest: `public/sprites/manifest-spieler2.json`. Tatsächlich verwendete
Prompts, Referenzen, Quellprüfsummen, Zuschnitte und Korrekturen:
`batch-spieler2-generation.json`. Erzeugung mit `image_gen`; 29 Hauptbilder
und drei gezielte Korrekturbilder. Zwei verworfene Waffenfassungen sind im
Protokoll unter `replaces` dokumentiert. Die Köpfe sind Ausschnitte der
Neutralportraits. Die Generatororiginale sind keine Laufzeitassets.

Karten: 16×32 pro Frame, Laufen unten/links/rechts/oben; Raster und
Animationsfolgen folgen den Hauptfigur-Referenzen. Kampf: 48×48, sechs
Spalten, Blick nach rechts, mindestens zwei Pixel Luft oben. Die Reihen der
Fähigkeiten sind `lantern`, `thread`, `mask`, `echo`, `cauldron`, `iron`,
`key`, `sq_waage`, `sq_moor`, `sq_uhr`. Unbenutzte Kampf- und
Untersuchen-Zellen sind transparent. `baseline` bezeichnet die exklusive
Unterkante, der letzte belegte Pixel liegt bei `baseline - 1`.
Die Platzierung acht Pixel höher im Koop erfolgt später durch die Engine.

Portraits: je 256×64. Erstes Sheet neutral/misstrauisch/erschrocken/lächelnd,
zweites wütend/traurig/nachdenklich/entschlossen. Köpfe 24×24, Zugportraits
16×16. `AH_koop.png` ist ein 96×48-Atlas; `regions` sind `[x,y,w,h]`,
`regionAnimations` beschreiben die zwei Wimpelphasen. Der 48×16-HUD-Rahmen
hat 4-Pixel-Nine-Slice-Ränder. Alle fünf Icons liegen in 16×16-Regionen.
`AH_kombi.png` enthält acht 64×48-Frames bei vorgeschlagenen 12 fps.

Nachbearbeitung: gemessene Zellzuschnitte an transparenten Zwischenräumen,
Nearest Neighbor, einheitliche Skalierung pro Animationssheet, Ausrichtung
auf die Referenz-Grundlinie, Alpha-Schwelle 128, gemeinsame Palette mit
höchstens 32 sichtbaren Farben (31 genutzt). Portraits und Auswahlbild
sind deckend, übrige Dateien haben binäres Alpha.

```sh
# SOURCE_MAP.json: {"p2a_walk":"/pfad/original.png", ...}
# Für die zusätzliche Türkorrektur auch p2a_extras_door_repair angeben.
# UI-Zuschnitte aus dem Generierungsprotokoll übernehmen; Export akzeptiert
# alternativ eine Job-Liste mit id, source und sourceBoxes.
# Benötigt Pillow und NumPy.
python docs/art/export-spieler2.py SOURCE_MAP.json
python docs/art/verify-spieler2.py
node --test tests/sprites.test.js
```

Prüfbericht: `validation-spieler2.json`. Sichtübersichten:
[Figuren](preview-spieler2-figures.png),
[Portraits](preview-spieler2-portraits.png),
[Kampf p2a](preview-spieler2-battle-a.png),
[Kampf p2b](preview-spieler2-battle-b.png),
[Koop und Auswahl](preview-spieler2-ui.png).
Grafiklieferung ohne Spielcodeänderung. Einbindung und Prüfung von Timing,
HUD-Skalierung und gemeinsamer Kampfaufstellung im laufenden Spiel erfolgen separat.

## Batch AE – Oberfläche und Leben in Wexmoor (`oberflaeche`)

20 neue PNG-Dateien; noch nicht in den Spielcode eingebunden. Enthalten sind 16 Einstellungs-Symbole, Regler/Checkboxen, zehn Touch-Aktionen in je zwei Zuständen, ein Steuerkreuz, neun Titelbild-Dateien, drei Kapitelkarten, Zeitungs- und Sprechblasen-Elemente sowie acht Tierarten und fünf Wetter-/Licht-Effekte für Wexmoor.

- Manifest: [`manifest-oberflaeche.json`](../../public/sprites/manifest-oberflaeche.json). Einheitliches Raster bei normalen Sheets; Tiere und Wetter verwenden benannte `regions`, deren Animationen **region-lokale** Frame-Indizes besitzen (`frameIndexSpace: "region"`). Erst die Region ausschneiden, dann ihre `frameWidth`, `frameHeight`, `columns` und `frames` verwenden. Alle Koordinaten sind Pixel ab links oben.
- Vorschau: [`preview-oberflaeche.html`](preview-oberflaeche.html), über einen lokalen HTTP-Server öffnen. Enthält zusammengesetztes Titelbild, alle Tier-/Wetteranimationen, Kapitelkarten und Bediengrafiken.
- Titelbild: alle großen Ebenen mit Ursprung `(0,0)`, 480×270; die Flamme wird separat bei `(64,96)` aufgesetzt. Fensterlichter sind aus der Häuser-Ebene maskiert, deren Fensterscheiben unbeleuchtet bleiben. Mond 2 Frames, Fenster 4, Flamme 4, Regen 4. Nebel horizontal, Regen in beiden Achsen kachelbar; Parallax-Verschiebungen der Architektur klein halten, da die Häuser keine umlaufenden Texturen sind.
- `AE_zeitung.png` (320×160): Seite 48×48 mit 16px-Schnitten; Sprech-/Gedankenblase 24×24 mit 8px-Schnitten; zwei separat ankoppelbare 8×8-Zipfel; zwei Ornamente 160×24 und vier Sepia-Fotos 64×48. Exakte Grenzen in `regions`. Der mittlere 9-slice-Bereich wird gestreckt, nicht als wiederholte Papierkachel eingesetzt.
- `AE_wexmoor_tiere.png` (128×272): 11 Reihen à 16px für kleine Tiere, danach drei 32px-Reihen für den Graureiher. Nicht belegte Zellen bleiben transparent. 14 Animationsclips; Auffliegen einmalig abspielen und anschließend ausblenden oder in eine Flugbewegung übergeben.
- `AE_wexmoor_wetter.png` (1920×350): Gischt 8×8 und Pfützenkringel 16×16 bei y=0; Nieselregen 4×240×135 ab y=16; zwei separat kachelbare Nebelbänke 240×135 ab y=151; Leuchtturmstrahl 8×240×64 ab y=286, Drehpunkt pro Frame `(120,32)`. Beide Nebelbänke lassen sich unabhängig verschieben. Transparenz entsteht durch Pixel-Lücken, nicht durch Teilalpha.
- Palette: 25 Farben aus dem vorhandenen Titelbild plus sechs gezielte Papier-/Nebel-/Okkultfarben, insgesamt 31 sichtbare Farben und ein transparenter Index. Alle PNGs sind indiziert, Alpha ist 0 oder 255. Kapitelkarten und Himmel sind deckend.
- Erzeugung: [`batch-oberflaeche-generation.json`](batch-oberflaeche-generation.json) enthält die tatsächlichen Bildprompts, Referenzbasis, Quell-Hashes, verworfene Varianten und die Ableitung von Fenster-, Regen- und Lichtstrahlanimationen. Das Exportskript [`tools/art/oberflaeche/export.py`](../../tools/art/oberflaeche/export.py) nimmt eine lokale JSON-Zuordnung von Prompt-IDs zu Originalbildern entgegen; diese großen Generator-Originale sind nicht Teil des Laufzeitpakets. Es benötigt Pillow, NumPy und SciPy. Für die Prüfung der fertigen Dateien sind nur Pillow und NumPy nötig.
- Prüfung: `python tools/art/oberflaeche/validate.py` kontrolliert Pflichtdateien, Maße, gemeinsame Palette, Alpha, Region-Grenzen, Überlappungen, sämtliche 82 Animationsframes, Kachelnähte und die Ausrichtung der Fensterlichter. Ergebnis: [`batch-oberflaeche-validation.json`](batch-oberflaeche-validation.json). Zusätzlich: `node --test tests/sprites.test.js` (35 Tests bestanden, nach Abgleich mit `main`).


## Batch AJ — Nebenaufträge Kettlegate und Wexmoor (`nebenquests`)

40 PNGs für alle 20 neuen IDs aus den Grafikwunschlisten von AA und AB:
sieben Lauf-Sheets, sieben Emotions-Sheets mit jeweils vier Stimmungen,
drei menschliche Kampf-Sheets und drei Bestiariumsbilder, sieben Items
in 16×16 und 32×32 sowie sechs Torfkahn-Ausbauten.

Manifest: `public/sprites/manifest-nebenquests.json`. Prompts einschließlich
Korrekturen, Stilreferenzen, Quellprüfsummen und gemessene Zellzuschnitte:
`docs/art/batch-nebenquests-generation.json`. Erzeugt mit dem eingebauten
Bildgenerator; Export per Nearest Neighbor, gemeinsame 32-Farben-Palette
(26 tatsächlich verwendet), indizierte PNGs und binäres Alpha.
Die 32er-Items sind exakte 2×-Vergrößerungen der 16er-Icons.

Menschen nutzen gemäß AJ 0.2/Abschnitt 3 **48×48** pro Kampfframe,
auch wenn die ältere AA-Wunschliste 64×64 nennt. Layout wie `enemy_holt`:
6 Spalten, Reihen idle / attack / hurt / defeated mit 4/6/3/4 Frames.
Ausholframes 6 und 7 sind identisch; Niederlagen zeigen eine lebende,
aufgebende Figur. Grundlinien (exklusiv): Lauf 31, Portrait 63, Kampf 46.
Bestiarium: deckendes 96×128-Pergamentformat wie im Bestand.

```sh
python docs/art/export-nebenquests.py SOURCE_DIRECTORY
python docs/art/verify-nebenquests.py --preview
node --test tests/sprites.test.js
```

Der Export benötigt Pillow und NumPy, der Prüfer nur Pillow. Hochauflösende
Generatorquellen werden über die protokollierten Dateinamen und SHA-256
identifiziert; sie gehören nicht zu den Runtime-Dateien. Der Prüfer läuft
ohne diese Quellen und gleicht die Lieferung direkt mit beiden Wunschlisten ab.
Ergebnis: `validation-nebenquests.json`, alle Prüfungen bestanden;
35 bestehende Sprite-Tests bestanden. Sichtprüfung der finalen Rasterexports:
[Figuren](preview-nebenquests-characters.png),
[Kampf und Bestiarium](preview-nebenquests-battle.png),
[Items und Kahn](preview-nebenquests-objects.png).

Asset-Lieferung zur separaten Einbindung; Spielcode und Storydaten unverändert.

## Batch AN — Floßfriedhof, Lichtamt und Torfbrüche (`wexmoor6`)

39 PNGs gemäß `codex_AN_k2_orte_grafik.md`: drei Tilesets mit insgesamt 192 benannten
16×16-Kacheln, drei Prop-Atlanten mit 40 Regionen, zwei Kampf-Hintergründe,
fünf Kampf-Sheets, fünf Karten-Sheets, fünf Bestiarium-Karten, Moorbraut-Büste,
sieben Beute-Icons in jeweils 16×16 und 32×32 sowie drei Stadtmarker in einem Sheet.

- Manifest: `public/sprites/manifest-wexmoor6.json`. Orts- und Gegner-IDs bleiben
  wie im Auftrag vergeben. Props stehen unter `regions`; ihre Animationen unter
  `regionAnimations`. Das Leuchtturm-Mosaik im Lichtamt ist als 32×32-Region erfasst.
- Kampf: sechs Spalten; Reihen `idle`, `attack_a`, `attack_b`, `hurt`, `defeated`.
  Die Moorbraut besitzt zusätzlich `phase2` (Schleier hebt sich, gesichtsloses
  türkises Licht). `phase2.idleFrames` nennt die zwei vollständig enthüllten Posen.
  Beide Angriffe beginnen mit exakt zwei gleichen Ausholframes. Leere Zellen sind
  transparent, Grundlinien einheitlich, Gegner blicken nach links.
- Karten-Sheets: vier Bewegungsframes in einer Reihe; Torfleiche 16×32, die
  übrigen Kreaturen 32×32. Die Moorbraut behält auf der Karte den geschlossenen Schleier.
- Bildgenerierung mit dem integrierten `image_gen`-Werkzeug. Tatsächliche Prompts,
  Korrekturen, Referenzen, Quellnamen und SHA-256-Prüfsummen stehen in
  `batch-wexmoor6-generation.json`. Die Generatorquellen werden nicht als
  Runtime-Dateien mitgeliefert.
- Export: Nearest Neighbor, gemeinsame bestehende Wexmoor-Palette mit 31
  sichtbaren Farben, binäres Alpha, deckende Terrain- und Hintergrundbilder.
  Die unteren 70 Pixel beider 480×270-Kampfhintergründe bleiben freier Boden.

```sh
# SOURCE_DIRECTORY enthält die im Generierungsprotokoll benannten Originale.
python docs/art/export-wexmoor6.py SOURCE_DIRECTORY
# Prüfung benötigt nur die exportierten Dateien (Pillow; Export zusätzlich NumPy).
python docs/art/verify-wexmoor6.py --preview
node --test tests/sprites.test.js
```

Prüfbericht: [validation-wexmoor6.json](validation-wexmoor6.json).
Sichtkontrolle: [Übersicht](preview-wexmoor6-overview.png),
[Torfleiche](preview-wexmoor6-torfleiche.png),
[Grubenlicht](preview-wexmoor6-grubenlicht.png),
[Torfwurm](preview-wexmoor6-torfwurm.png),
[Schlickhund](preview-wexmoor6-schlickhund.png),
[Moorbraut](preview-wexmoor6-moorbraut.png).

Grafiklieferung für Paket AM; Spielcode und andere Pakete bleiben unverändert.
Einbindung und Timing-Abstimmung im laufenden Spiel erfolgen separat.

## Batch AX — Dunscar-Gegner (`dunscar3`)

84 PNGs für 6 normale Gegner, 5 Story-Bosse und 10 Sequenz-Prüfungsbosse:
21 Kampf-Sheets, 21 Vier-Richtungs-Lauf-Sheets, 21 Bestiariumsbilder,
15 Boss-Bänder und 6 Rufmuster/HUD-Sheets. Verbindliche IDs aus
`codex_AX_dunscar_gegner.md`, Geschichte 3 und Pfadfarben aus den Sequenzdaten.

- Manifest: `public/sprites/manifest-dunscar3.json`.
- Tatsächlich verwendete Bildgenerator-Prompts und Quellprüfsummen:
  `batch-dunscar3-generation.json`; Motivliste: `dunscar3-source-spec.json`.
- Gemeinsame 32-Farben-Palette, indizierte PNGs, binäres Alpha und Nearest Neighbor.
  Kampf: 6 Spalten, idle/attack/hurt/defeated = 4/6/3/4 Frames;
  zusätzliche Phase-2-Reihe für Vielrufer, Gallowmere und alle Prüfungsbosse.
  Unterschicht hat zusätzlich drei eigene Phasenreihen. Erste zwei Frames
  jeder Angriffs-/Phasenreihe halten dieselbe Ausholpose (8 fps, 250 ms).
- Karte: 16×32, vier Frames je Richtung unten/links/rechts/oben.
  Grundlinien exklusiv: Karte 30, Kampf Framehöhe minus 2.
- Bestiarium: 96×128; Boss-Band: 160×160 wie `S_08_boss_glockenmutter`.
  Beide verwenden die erste Kampf-Ruhepose; Ableitung steht im Manifest.
- Rufmuster: 16 geometrisch unterschiedliche Zeichen in 16×16 und exakt 2×
  vergrößert; drei Statusrahmen ebenfalls in beiden Größen. Rufladungen:
  48×16 pro Zustand (0–3), vertikal im 48×64-Sheet. Horchen: 16×16.
  Die Zuordnung der Bildzeichen zu Story-Rufmustern erfolgt bei der Einbindung.
- Schichtgänger schlafen nach der Niederlage; der Nachhall besteht aus
  türkisen Konturen. Dessen Konturmaske entfernt neutrale Generatorreste
  und normalisiert die Strichfarbe für bessere Lesbarkeit.

Prüfung ohne Generatorquellen: `python tools/art/dunscar3/validate.py`.
Erneuter Export mit Quellbelegen: `python tools/art/dunscar3/export.py RECEIPTS_DIR`.
Ein Beleg pro Bild enthält `id`, `kind` (`battle`/`walk`), `path` und `prompt`.
Export benötigt Pillow und NumPy, Prüfung Pillow. Quellen sind keine Runtime-Dateien.
Ergebnis: `batch-dunscar3-validation.json`; alle 84 Assets bestehen die Prüfung.

Sichtprüfung: [Gegner](batch-dunscar3-preview-normal.png),
[Story-Bosse](batch-dunscar3-preview-story.png),
[Prüfungsbosse](batch-dunscar3-preview-trials.png),
[Rufmuster und HUD](batch-dunscar3-preview-ui.png).
Spielcode und Storydaten bleiben unverändert; Einbindung erfolgt separat.

## Batch AW – Figuren von Dunscar (`dunscar2`)

69 PNG-Dateien für Kapitel 3 „Der letzte Zug nach Dunscar“ nach
`codex_AW_dunscar_figuren.md` und der verbindlichen Geschichte 3:
elf Hauptfiguren mit Lauf-Sheet, zwei Emotions-Sheets (acht Ausdrücke),
24×24-Kopf und Tätigkeit; Gallowmeres Stimme hinter dem Schalter;
vier lebende Schichtgänger, sechs Einwohner und drei Szenenbilder.
Gallowmeres Kampf-Sheet gehört zu AX und ist nicht Bestandteil von AW.

- Manifest: [`manifest-dunscar2.json`](../../public/sprites/manifest-dunscar2.json).
- Animierte Vorschau: [`preview-dunscar2.html`](preview-dunscar2.html), über einen lokalen HTTP-Server öffnen.
- Kontaktbögen: [Figuren](preview-dunscar2-figuren.png), [Einwohner](preview-dunscar2-einwohner.png), [Szenen](preview-dunscar2-szenen.png).
- Tatsächliche Bildprompts, Stilreferenzen, Quellprüfsummen und Zellzuschnitte: [`batch-dunscar2-generation.json`](batch-dunscar2-generation.json).
- Prüfergebnis: [`batch-dunscar2-validation.json`](batch-dunscar2-validation.json).

Laufen: 16×32 pro Frame, vier Spalten, vier Reihen in der Reihenfolge
unten / links / rechts / oben, vorgeschlagen 7 FPS. Tätigkeiten und Schalter:
vier Frames à 16×32 nebeneinander, 5 FPS, einmalig abspielen. Die Vorschau
wiederholt diese Clips nur für die Sichtprüfung. Bei Gallowmere ist die
zusätzliche Tätigkeit das Anheben der Kettenpfeife mit anschließendem Horchen.
Portraits: vier 64×64-Zellen; erstes Sheet neutral / misstrauisch / erschrocken /
leichtes Lächeln, zweites wütend / traurig / nachdenklich / entschlossen.
Frames im Manifest sind nullbasiert. Untere exklusive Pixelgrenze: 31 bei
Figuren, 63 bei Portraits. UI-Köpfe sind aus dem neutralen Portrait abgeleitet.

Erzeugt mit dem eingebauten Bildgenerator. Nearest-Neighbor-Export,
gemeinsame 31 sichtbare Farben plus transparenter Index, ausschließlich
Alpha 0 oder 255. Gallowmeres Durchschein-Effekt entsteht durch Pixellücken;
die drei 480×270-Szenen sind deckend. Die Palette übernimmt die Bestandsfarben
aus `12_sexton_anselm_walk.png` und ergänzt gezielte Nachhall-/Hautfarben.

```sh
python tools/art/dunscar2/export.py /pfad/zu/sources.json
python tools/art/dunscar2/validate.py
node --test tests/sprites.test.js
```

Der Export benötigt Pillow und NumPy. `sources.json` enthält die Einträge
unter `records` aus dem Generierungsprotokoll als Liste, jeweils mit `source`
als lokalem Pfad zur über `sourceFile` und SHA-256 identifizierten Original-PNG.
Große Generatorquellen gehören nicht zu den Laufzeitdateien. Der Prüfer
benötigt nur Pillow und läuft direkt auf der fertigen Lieferung.

Grafikpaket zur separaten Einbindung; keine Änderungen am Spielcode.

## Batch dunscar1 — Codex AV: Dunscar, Orte und Nachtzug

32 PNGs zur separaten Einbindung von Kapitel 3 „Der letzte Zug nach Dunscar“:
6 Tilesets mit 208 benannten 16×16-Zellen, 8 Prop-Sheets mit 53 Regionen,
Nachtzug mit Lok und drei Wagen (4 aktive Phasen plus Stilllegung),
Nachhall-Ringe und Weg-Overlay, 10 Kampfkulissen, 2 Szenenbilder,
Stadtkarte, Nebel-Overlay und Marker für alle 18 festen Karten-IDs.

Manifest: `public/sprites/manifest-dunscar1.json`. Zuordnung aller Karten,
Animationsverträge und Reproduktionsanleitung: [Übergabe AV → AS](dunscar1-uebergabe.md).
Prompts, Bildgenerator-Korrekturen, Quellprüfsummen und Zuschnitte:
`batch-dunscar1-generation.json`. Export mit Nearest Neighbor, gemeinsamer
32-Farben-Palette und binärem Alpha. Spielcode und Storydaten bleiben unverändert.

```sh
python docs/art/verify-dunscar1.py
node --test tests/sprites.test.js
```

Prüfbericht: `validation-dunscar1.json`. Sichtübersichten:
[Tiles](preview-dunscar1-tiles.png), [Props](preview-dunscar1-props.png),
[Kampfkulissen](preview-dunscar1-backgrounds.png),
[Karten/Szenen](preview-dunscar1-maps-scenes.png),
[Zug/Effekte](preview-dunscar1-train-effects.png).


## Batch AG – sequenzen3

196 PNGs: 55 Effekte, 55 Zutaten und 6 Artefakte jeweils in 16×16 und 32×32,
9 Emblemgrößen, 3 Pfadkarten, 3 Ritualkarten, 3 Auren und ein Spieler-Sheet.
Die tatsächliche AF-Wunschliste enthält 122 IDs (die AG-Einleitung nennt 123);
alle 122 werden abgedeckt, ergänzt um sechs Karten und das Spieler-Sheet.

- Manifest: `public/sprites/manifest-sequenzen3.json`.
- Tatsächliche Prompts, Referenzen, Quellbild-Hashes und Zuschnitte:
  [batch-sequenzen3-generation.json](batch-sequenzen3-generation.json).
- Vollständige Zuordnung: [coverage-sequenzen3.json](coverage-sequenzen3.json).
- Prüfbericht: [validation-sequenzen3.json](validation-sequenzen3.json).
- Sichtprüfung: [Effekte 1](preview-sequenzen3-effects-1.png),
  [Effekte 2](preview-sequenzen3-effects-2.png), [Effekte 3](preview-sequenzen3-effects-3.png),
  [Icons 1](preview-sequenzen3-items-1.png), [Icons 2](preview-sequenzen3-items-2.png),
  [Icons 3](preview-sequenzen3-items-3.png), [Icons 4](preview-sequenzen3-items-4.png),
  [Pfadbilder und Spieler](preview-sequenzen3-pathways-1.png).

Erzeugt mit dem eingebauten Bildgenerator, danach ausschließlich Rasterexport:
Nearest Neighbor, gemeinsame 32-Farben-Palette und binäres Alpha.
Effekte: 48×48, 6 bzw. 8 Frames, 12 fps; Auren: 48×64, 6 Frames, 8 fps.
Auren liegen im unteren Zellbereich. Spieler: 6×3 Zellen à 48×48,
Reihen Waage/Moor/Uhr, Blick rechts, Grundlinie 45 (exklusiv), 10 fps.
Pfad- und Ritualkarten verwenden den vorhandenen 96×128-Rahmen mit leerem
Pergament und einem eigenen generierten Motiv. Es wird kein Text eingebrannt.

```sh
python docs/art/verify-sequenzen3.py
node --test tests/sprites.test.js
# Optional: erneuter Export aus den protokollierten Generator-Originalen:
python docs/art/export-sequenzen3.py docs/art/batch-sequenzen3-generation.json SOURCE_DIRECTORY
```

Export benötigt Pillow und NumPy, Prüfung nur Pillow. Die Prüfung funktioniert
ohne Generator-Originale und kontrolliert die Lieferung direkt gegen die
Wunschliste, Rastergrößen, Palette, Alpha, Animationen, Grundlinie und Icon-Duplikate.
Die hochauflösenden Quellen sind über Dateiname und SHA-256 protokolliert;
Runtime-Dateien sind ausschließlich die finalen Rasterexports.
Einbau in das Spiel erfolgt separat.

## Batch BA — dunscar4: Ruf-Oberfläche und Stadtleben

Neun PNGs, 53 benannte Regionen und 165 belegte Frames. Manifest:
`public/sprites/manifest-dunscar4.json`. Enthält Ruflinien mit unterschiedlichen
Strichformen, Hörkreis, Bindung P1/P2 (zusätzlich eine/zwei Kerben), Notladung,
Schallschleusen, Horchtrichter und Rufjournal; sechs Tierarten inklusive
Staubteufel, Kalkstaub/Nachtnebel/Graswind; zehn Marktstände jeweils offen und
abgedeckt; Ruth Bellwicks vier Laufrichtungen, acht Emotionen und 24×24-Kopf.

- [Vorschau](batch-dunscar4-preview.png)
- [Verwendete Prompts und Nachbearbeitung](batch-dunscar4-generation.json)
- [Prüfbericht](batch-dunscar4-validation.json)
- [Einbauhinweise / offene Punkte](dunscar4/offene_punkte.md)
- Prüfung: `python tools/art/dunscar4/validate.py` (Pillow, NumPy).

Alle Laufzeit-PNGs verwenden dieselbe Palette mit höchstens 32 sichtbaren Farben
und binärem Alpha. Linien, Journalrahmen und Grasschwung sind pixelgenaue
geometrische Rasterelemente; Figuren, Tiere, Marktstände, Stationsprops und Wetter
stammen aus Bildgenerierung mit anschließender Raster-/Paletten-Nachbearbeitung.
Die Einbindung in BN/BD und das Ersetzen von Ruths bisherigem `npc:hesper`-Alias
bleiben separat; dieser Batch verändert keinen Spielcode.

## Batch BE – Dunscar5: neue Figuren, Einzelgänger und Kopfgeld

Grafiklieferung für `codex_BE_dunscar_figuren2.md`: **100 PNG-Dateien** für
3 Händler, den Schichtbund (Gastgeberin und 3 Mitglieder), 5 Einzelgänger,
8 Einwohner und 2 Bahnaufseher. Enthalten sind 24 Laufsheets einschließlich
2 Schichtgänger-Varianten, 24 Emotions-Sheets, ein gemeinsamer Kopf-Atlas,
11 Gegner-Kartensheets, 11 Kampfsheets plus getönte Elite-Variante,
11 Bestiariumsbilder, 6 Steckbriefe, 6 Trophäen und 5 Prop-Dateien.

- [Manifest](../../public/sprites/manifest-dunscar5.json)
- [Tatsächliche Prompts und Herkunft](batch-dunscar5-generation.json)
- [Prüfbericht](validation-dunscar5.json)
- Vorschauen: [Figuren](preview-dunscar5-figuren.png),
  [Portraits](preview-dunscar5-portraits.png),
  [Kämpfe](preview-dunscar5-kaempfe.png), [Props und UI](preview-dunscar5-props-ui.png)
- [Übergabe und offene Integration](dunscar5/offene_punkte.md)

Erzeugt mit dem eingebauten Bildgenerator, anschließend Zellzuschnitt,
Nearest-Neighbor-Export, gemeinsame 31-Farben-Palette plus transparentem Index
und binäres Alpha. Pro Sheet ein gemeinsamer Maßstab und feste Grundlinie.
Kämpfe: sechs Spalten, Reihen `idle`, `attack`, `special`, `hurt`, `defeated`;
beide Angriffe halten ihre Ausholpose zwei Frames. Der Signalbrecher verwendet
64×64-Zellen und zwei Phasen. Die Kinder haben unblutige Niederlagen.
Kein Laufzeitcode wird in diesem Paket eingebaut.

```sh
python docs/art/validate-dunscar5.py
node --test tests/sprites.test.js
```

Der Exporter liegt unter `tools/art/dunscar5/`; Originaldateien und
Reproduktionsablauf sind in der Übergabe dokumentiert. Steckbriefe kombinieren
generierte Kopfzeichnungen mit einem geometrischen Papier-/Bahnsiegelrahmen.

## Batch BB · icons2

150 eigene Item-Motive ersetzen die geliehenen Bilder von 40 Gegenständen aus
Kapitel 2/3 sowie 55 Tränken und 55 Formeln: Waage/Moor/Uhr ab Sequenz 9,
alle zehn Pfade ab Sequenz 4. Lieferung: **150 PNGs in 16×16 und 65 in 32×32**.

- Manifest: `public/sprites/manifest-icons2.json`.
- Prompts, Referenzen und Herkunft: [batch-icons2-generation.json](batch-icons2-generation.json).
- Alle Icons mit IDs und beiden Größen: [preview-icons2.png](preview-icons2.png).
- Prüfung: `python docs/art/verify-icons2.py` (Pillow).

Einzelmotive mit dem Bildgenerator erstellt, per Nearest Neighbor auf das
Zielraster exportiert, auf die gemeinsame 32-Farben-Palette aus Batch AG
reduziert und mit binärem Alpha versehen. Die 32er-Fassungen werden aus dem
Original exportiert, nicht aus dem 16er-Icon hochskaliert. Statische Einzelframes,
transparenter Sicherheitsrand. Die Prüfung kontrolliert alle 215 erwarteten
Dateien unabhängig vom Manifest, Größen, Palette, Alpha und doppelte Bilder.
Der separate Einbau ist in der PR-Beschreibung dokumentiert; Spielcode bleibt
in diesem Grafikpaket unverändert.
## Kontrollverlust: Einbau von Batch BP (2026-11-10)

- `ui/scenes/kontrollverlust.png` und `items/laeutersalz.png` (+ `items32/`) sind die BP-Bilder, keine Platzhalter mehr.
- `fx/BP_tentakel_kontrollverlust.png` läuft als `tentakel_fx` (ANIM_SHEETS) in `WorldScene.playCorruption()`; die gezeichneten Tentakel bleiben nur als Rückfall ohne Sheet.
- `characters/BP_player_korruption.png` läuft als `player_korruption`: die Figur krümmt sich, kniet und liegt (Reihe `player`, `p2a`, `p2b`), danach steht sie wieder.
- `ui/BP_korruption.png` ist der Bogen `bpkorr` (Abzeichen „korrumpiert“, Puls im Inventar-Hinweis, „ruht“ für beiseitegelegte Artefakte); `ui/BP_korruption_rahmen.png` ist die CSS-Variable `--korrframe` (9-slice 16 px) um korrumpierte Inventar- und Reinigungszeilen.
- Animationen kommen aus `manifest-kontrollverlust.json` (`manifestKontrollverlust`).

## Batch BP – Kontrollverlust (`kontrollverlust`)

Sieben PNGs nach `codex_BP_kontrollverlust_grafik.md`, inklusive der optionalen
Zusammenbruch-Posen für Ermittler, p2a (Schiebermütze) und p2b (Melone):

| Datei unter `public/sprites/` | Format / Verwendung |
|---|---|
| `fx/BP_tentakel_kontrollverlust.png` | 768×64, zwölf 64×64-Frames; `grow`, 8 FPS, einmalig |
| `ui/scenes/kontrollverlust.png` | 240×135, deckend; ersetzt das bisherige Szenenbild |
| `items/laeutersalz.png` | 16×16; eigener Wachspapierbeutel statt Bannsalz-Kopie |
| `items32/laeutersalz.png` | 32×32; exakte 2×-Vergrößerung mit Nearest Neighbor |
| `ui/BP_korruption.png` | 96×16; Knoten/Puls 0–3, gereinigt 4, beiseitegelegt 5 |
| `ui/BP_korruption_rahmen.png` | 48×48; 9-slice mit 16 px pro Rand, transparente Mitte |
| `characters/BP_player_korruption.png` | 64×96; drei Reihen, jeweils vier 16×32-Posen |

Die Effektmitte liegt bei (32,32); der Bereich (24,16) bis (40,48) bleibt
überwiegend frei für die Spielfigur. Phasen: Aufreißen 0–2, Wachsen 3–6,
Zugreifen/Puls 7–9, Rückzug 10–11. Spielerposen: krümmen, Schulter greifen,
knien, liegen; pro Reihe 4 FPS ohne Wiederholung.

- [Manifest](../../public/sprites/manifest-kontrollverlust.json)
- [Tatsächliche Bild- und Korrekturprompts](batch-kontrollverlust-generation.json)
- [Prüfbericht](batch-kontrollverlust-validation.json)
- [Kontaktbogen](preview-kontrollverlust.png)
- [Tentakel über der Bestandsfigur, animiert](preview-kontrollverlust-animation.gif)

Bildgenerator mit Bestands-Sprites als Stilreferenz. Gemeinsame Palette mit
30 Grundfarben (einschließlich Türkis) und genau zwei zusätzlichen Violetttönen
`#3a1850` / `#5a2a7a`. Nearest-Neighbor-Export und binäres Alpha. Die Quellraster
für Effekt und Icons werden in die geforderten Einzelreihen umgepackt;
ein gemeinsamer Maßstab je Sheet erhält die Größenentwicklung der Animation.
Posen sind an einer gemeinsamen Grundlinie ausgerichtet.

```sh
python tools/art/kontrollverlust/export.py /pfad/zu/sources.json
python tools/art/kontrollverlust/validate.py
node --test tests/sprites.test.js
```

Export: Pillow und NumPy; Prüfung: Pillow. `sources.json` ist die Liste unter
`records` aus dem Generierungsprotokoll, ergänzt um lokale `source`-Pfade zu
den dort per Dateiname und SHA-256 bezeichneten Generatorbildern. Bei
Korrekturen werden auch die unter `supersedes` bezeichneten Originale benötigt.
Der Prüfer benötigt nur die fertigen Repo-Dateien und erstellt die Vorschauen.

Kein Spielcode geändert. Die zwei vorhandenen PNGs werden direkt ersetzt;
`ANIM_SHEETS`, `WorldScene.playCorruption()` und neue UI-Verwendungen werden
separat eingebunden. Die GIF-Vorschau wiederholt den Effekt zum Prüfen;
das Manifest spielt ihn ausdrücklich nur einmal ab.
## Batch BI — Gegner- und Bossvorrat (`vorrat1`)

112 PNGs für spätere Kapitel: 24 Gegner und acht Bosse aus Calderwick, Briarholt und von der Landstraße. Pro Figur ein Kampf-Sheet, ein 4×4-Lauf-Sheet (16×32 je Zelle) und ein Bestiariumsbild (96×128); zusätzlich acht Boss-Bänder (160×160), sieben deckende Kampfkulissen (480×270) und sechs Effekte als 6×1-Sheet (48×48 je Zelle).

Kampf-Sheets: sechs Spalten; Idle 4, Angriff 6, Treffer 3, Ende 4 Frames, übrige Zellen transparent. Normale Gegner 48×48/64×64, Bosse 96×96. Nullfundament und Mutterwurzel: 128×96, sieben Reihen inklusive dreier eigener Phasenanimationen. Die ersten zwei Frames jedes Angriffs sind identische Ausholposen. Vier nicht tödliche Enden sind im Manifest benannt. Gemeinsame 32-Farben-Palette, Nearest Neighbor, binäres Alpha und transparente Sicherheitsränder.

- Manifest: `public/sprites/manifest-vorrat1.json`
- Prompts und Provenienz: `docs/art/batch-vorrat1-generation.json`
- Vorschauen: `docs/art/preview-vorrat1-{battle,walk,bestiary,bossBand,background,fx}.png`
- Prüfung: `python docs/art/verify-vorrat1.py` (Pillow)

Nur Vorrat, noch nicht im Spiel registriert. Verbindliche IDs: 24 normale Gegner + acht Bosse = 32; die Angabe „34 Trophäen“ in den gemeinsamen Eckdaten erweitert diese Liste nicht. Trophäen gehören zu BM.


## Batch BK — Figuren-Vorrat (`vorrat2`)

28 Figuren aus Calderwick, Briarholt und von der Landstraße: je vier Laufrichtungen, acht Portraitstimmungen, vier Sonderaktionsframes und ein 24×24-Kopf. Wetherby und Greavesend erhalten außerdem je zwei Kampfphasen. Insgesamt 115 Sheets mit 880 belegten Frames. Noch kein Einbau ins laufende Spiel.

- Manifest: `public/sprites/manifest-vorrat2.json` (Animationen, Framegrößen, Kopfregionen, Prüfsummen).
- Herkunft und vollständige Prompts: [batch-vorrat2-generation.json](batch-vorrat2-generation.json).
- Normalisierte Generatoratlanten: `tools/art/vorrat2/sources/`; Original-Hashes bleiben dokumentiert.
- Reproduzieren: `python tools/art/vorrat2/export.py`, danach `python docs/art/validate-vorrat2.py` (Pillow).
- Prüfbericht: [batch-vorrat2-validation.json](batch-vorrat2-validation.json).
- Vorschauen: [Calderwick](batch-vorrat2-preview-calderwick.png), [Briarholt](batch-vorrat2-preview-briarholt.png), [Reise](batch-vorrat2-preview-reise.png), [Köpfe](batch-vorrat2-preview-heads.png), [Bosse](batch-vorrat2-preview-bosses.png).

Built-in Bildgenerator mit vorhandener Sprite-Referenz; Nearest-Neighbor-Export, 31 sichtbare gemeinsame Palettenfarben plus Transparenz, binäres Alpha. Export bereinigt neutrale helle Mattierung und berücksichtigt abweichende Atlasabstände. Lauf-/Sonderframes stehen auf y=30, der Junge ist kleiner. Bossangriffe halten die Ausholpose zwei Frames. Prüfungen umfassen Vollständigkeit, Raster, Palette, Alpha, Zellränder, Grundlinien, Frameindizes, Ausdrucks-/Bewegungsvielfalt und SHA-256.


## Batch BM – Vorrat-Gegenstände (`vorrat3`)

72 Gegenstände und 32 Trophäen als 16×16-Icons, dazu 38 Varianten in 32×32: **104 Motive, 142 PNGs**. Die Aufgabenbeschreibung nennt 34 Trophäen, listet aber nur 24 normale Gegner und acht Bosse auf; geliefert werden alle 32 ausdrücklich definierten IDs. Vorrat für spätere Kapitel, ohne Einbau ins laufende Spiel. Keine Puppen-Overlays: `F_EQUIPMENT` nutzt eigenständige Icons.

- [Manifest](../../public/sprites/manifest-vorrat3.json), [tatsächliche Einzelprompts und Herkunft](batch-vorrat3-generation.json).
- Vorschauen: [Gegenstände](preview-vorrat3-items.png), [Trophäen](preview-vorrat3-trophies.png); 16px vierfach, 32px zweifach vergrößert.
- Normalisierte Bildgenerator-Master unter `docs/art/vorrat3-sources/`; Nearest-Neighbor-Export, gemeinsame 32-Farben-Palette und binäres Alpha.
- Reproduzieren mit Python/Pillow: `python tools/art/vorrat3/export.py`; prüfen: `python tools/art/vorrat3/check.py`. Der Prüfer gleicht die IDs unabhängig mit der BM-Aufgabe ab und kontrolliert Maße, Transparenz, Palette, Rand, Duplikate und SHA-256-Herkunft.

## BO – Fasserin (`fasserin`)

26 PNGs: Oda Kessels Lauf- und Sitzanimation, vier Portraitstimmungen, 24×24-Kopf, Werkbank und Zangen sowie zehn bestehende Artefakte in 16×16 und 32×32. Gemeinsame Wexmoor7-Palette mit höchstens 32 sichtbaren Farben, indizierte PNGs, binäres Alpha. Manifest: `public/sprites/manifest-fasserin.json`; tatsächliche Bildprompts und Quellenprüfsummen: `docs/art/batch-fasserin-generation.json`. Export und Prüfung: `tools/art/fasserin/`. Texte, zehn weitere Rezepte und Integrationshinweise: `docs/story/fasserin/`. Spielcode und aktive Spieldaten bleiben unverändert.
## Batch BV — Jahreszeiten und Feste (`feste`)

Vier Jahreszeiten mit Boden-Deko, Partikeln und Fassadenaufsätzen für drei Städte;
dazu Laternennacht, Salzsegen und Schichtwechsel mit Props, Sequenzbildern,
zwölf laufenden Festgästen, Gerede-Symbolen und Ankündigungsbannern.
**41 Pflicht-Sheets, 408 Frames**, ohne Spielcode oder Kartenänderungen.

- [Manifest](../../public/sprites/manifest-feste.json), [Einbau und Formate](feste-README.md).
- [Prompts und Herkunft](batch-feste-generation.json), [Vorschau](preview-feste.png).
- Reproduktion: `python tools/art/feste/export.py`; Prüfung: `python tools/art/feste/check.py`.
- Built-in-Bildgenerator, Nearest-Neighbor-Export, 31 gemeinsame sichtbare Farben plus Transparenz, binäres Alpha; normalisierte Quellen unter `docs/art/feste-sources/`.

## Konzentrations-Artefakte: Platzhalter-Icons (2026-11-10)

- 16 neue Artefakte (`pathways.json` → `artifacts.list`, `konzentration: true`) nutzen Kopien bestehender Item-Icons als Platzhalter (`items/<id>.png`).
- Echte Icons: Prompt-Paket `codex_BX_konzentration_artefakte.md` (Tabelle mit Id, Platzhalter und Prompt-Kern). Nach Lieferung die Dateien 1:1 ersetzen.

## Batch CB – Dunscar-Gegenstände (`icons3`)

35 eigene 16×16-Icons für Händlerstücke, Prüfungshilfen, Schichtbund-Fundstücke, Einzelgänger-Gaben und neun Ausgaben des Dunscarer Kalkblatts; dazu 16 eigenständig gezeichnete 32×32-Fassungen und der Zeitungsstreifen `items/k3e_ausgaben_strip.png` (144×16). [Manifest](../../public/sprites/manifest-icons3.json), [Vorschau](preview-icons3.png), [Prompts und Herkunft](batch-icons3-generation.json). Erzeugt mit dem eingebauten Bildgenerator, anschließend auf getrennte logische Raster abgetastet und nachgepixelt: gemeinsame Palette aus den sechs Referenzen plus Pfadfarben, 31 sichtbare Farben und Transparenz, binäres Alpha. Die normalisierten RGBA-Master liegen in `icons3-sources/`; die kleinen Icons werden nicht aus den großen heruntergerechnet. Die Zeitung nutzt dieselbe Faltung mit neun unterschiedlichen Titelbildern und schrittweise hellerem Papier. Reproduzieren: `python tools/art/icons3/export.py`; prüfen: `python tools/art/icons3/check.py` (Pillow). Der Prüfer liest die 35 IDs und 16 großen Fassungen unabhängig aus dem CB-Brief und prüft zusätzlich gemeinsame Palette, freie Ränder, Duplikate, Prüfsummen, getrennte Raster und die Übereinstimmung des Streifens mit den Einzeldateien. Spielcode, `ITEM_ICON_ALIASES`, `ICON32` und Testregistrierung bleiben für den separaten Einbau unverändert.
## Batch wexmoor8 – Paket BT: Wexmoor auf Pfählen und Torf

42 PNGs für den separaten Einbau: 10 kompatible Austausch-Tilesets, 18 modulare
Fassaden plus 6 beleuchtete Fensterzustände, 48 kleine und 16 große Props,
6 Prop-Animationen, 4 Wettereffekte, 6 Tiere, Seekarte/Nebel und ein zusätzliches
Vier-Phasen-Tileanimationsblatt. Gemeinsame Palette mit 32 sichtbaren Farben,
binäres Alpha, Nearest-Neighbor-Zielraster. Spielcode und Originalgrafiken bleiben
unverändert.

- Manifest: `public/sprites/manifest-wexmoor8.json` (Zellen, Regionen, Animationen,
  Originaldateien, Themen und Wexmoor-Beschränkung).
- Prompts und Ausgabe-Hashes: `docs/art/batch-wexmoor8-generation.json`.
- Vorschau der tatsächlichen Exporte, bei Austausch-Sheets mit Original daneben:
  `docs/art/preview-wexmoor8.png`.
- Prüfung: `python tools/art/wexmoor8/check.py` (Pillow erforderlich).

**Kompatibilität:** `q_kajuete` nutzt 8×3 Zellen mit anderen Bedeutungen als
`R_innen` (8×5); `s_salzwatt` nutzt 8×4 statt des Vergessmoor-Rasters 8×6.
Deshalb gibt es zusätzlich `Q_kajuete_tiles_v2.png` und `S_salzwatt_tiles_v2.png`.
Die acht angeforderten Hauptdateien behalten ihre jeweiligen Originalmaße.
`r_innen` ist im aktuellen Code ein Sheet-Schlüssel, kein eigenständiges
Kartenthema. Die vier Innenraum-Themen behalten ihre bisherigen Zellbereiche.

**Fassaden:** `FACADES` besteht aktuell aus modularen 128×96-Blättern (8×6
16er-Zellen), nicht aus 18 fertigen Gebäudesprites. Alle 18 neuen Varianten
verwenden dieses Raster; `tileGroups` und `regions` halten Wand, Fenster, Tür,
Traufe und Dach fest. Nachtdateien ändern ausschließlich die Fensterzellen
8–15; die übrigen Pixel bleiben identisch zum Tagesblatt.

**Übergänge und Animationen:** Topologisch wichtige Ufer-, Steg- und
Geländerzellen behalten die Originalkontur, werden auf die gemeinsame Palette
gebracht und sind als `retainedTransitionCells` dokumentiert. Die originalen
Zellpositionen und Alpha-Masken bleiben erhalten. Für vier unterschiedliche
Wasser-/Nebelphasen verweist `animationOverrides` auf
`fx/wexmoor_v2_tileanim.png`; die bisherigen Zwei-Frame-Belegungen im
Austauschblatt bleiben kompatibel. Diese Verweise sind Einbaudaten und werden
noch nicht automatisch vom Spiel geladen. Den Bahnhof nur auf Wexmoor-Karten
ersetzen; die Kettlegate-Zuordnung bleibt bestehen. Die Seekarte übernimmt die
sieben unveränderten Pin-Koordinaten aus `src/data/wexmoor.json`.
## Batch BS – Starling, zweite Phase (`starling2`)

Elf Grafik-Atlanten für das Kapitel-1-Finale: alle acht Pflichtdateien und die drei optionalen Ebenen/Symbole. Starling verwandelt sich in den Sternsammler; nach der Niederlage kniet er lebend am Boden. Phase 1 bleibt erhalten. Der Einbau und die Kampfwerte folgen separat.

- [Manifest](../../public/sprites/manifest-starling2.json), [Vorschau](preview-starling2.png), [vollständige Generator-Prompts und Herkunft](batch-starling2-generation.json).
- Kampfblatt: 128×96 je Zelle, 8 Spalten × 7 Reihen; 39 belegte und 17 leere Zellen. Reihen: `idle`, `attack`, `special`, `cast`, `hit`, `phase_in`, `defeat`. Nur `idle` wiederholt sich; `idle` und `phase_in` laufen mit 6 fps, die übrigen mit 8 fps. Die beiden ersten Angriffsframes sind identisch. Bodenanker: (64, 94).
- Effekte: 48×48, 6 Spalten × 5 Reihen. `linse` beginnt mit einer bewusst unsichtbaren Zelle; anschließend erscheint und zersplittert die Scheibe. Die Aufstiegsfolge erhält ihre vertikale Bewegung.
- Fall-Sterne: zwölf 16×16-Zellen in einer Zeile; Zellen 0–7 sind die Fälle 1–8, Zellen 8–11 die Funkelschleife. HUD: leere/gefüllte Leiste in den ersten beiden 16px-Zeilen, zwei Statussymbole links in der dritten. Alle Ausschnitte sind im Manifest benannt.
- Zwei Lichtzonen für die Kulisse; vier Portraitstimmungen. Optional: 480×64-Bodenstreifen, sechs 480×135-Kuppelframes in einer Zeile und zwei 48×48-Koop-Symbole (Kreis/türkis, Raute/violett).
- Tatsächliche Referenzen im aktuellen Repo: `battle/enemy_starling.png`, `ui/X_08_boss_starling.png`, `battle/bg_sternwarte.png`, `portraits/C_astronom_emotions.png` und `portraits/R_lichtmann_verblassend_emotions.png`. Die abweichenden Namen aus dem Auftrag sind in der Herkunftsdatei zugeordnet.
- Gemeinsame 31-Farben-Palette aus den vorhandenen Referenzen, binäres Alpha; Kulisse und Szene deckend. Normalisierte Generator-Atlanten liegen unter `tools/art/starling2/sources/`. Größenanpassung ausschließlich per Nearest Neighbor, keine prozeduralen Ersatzzeichnungen.
- Reproduzieren: `python tools/art/starling2/export.py`. Prüfen: `python tools/art/starling2/check.py` (Pillow). Prüft Maße/Raster, Palette/Alpha, Quellen- und Export-Hashes, Referenzerhalt, Animationen, leere Zellen, Ausholpose, Aufstiegsbewegung und Regionen. Zusätzlich bestehen alle 35 vorhandenen Sprite-Tests.
## BZ – Icons für zweite Fähigkeiten (`faehigkeiten2`)

180 neue Icons: je 90 zweite Kampf- und Welt-Fähigkeiten in `ui/skill_icons_3.png` und `ui/talent_icons.png` (160×144; zehn Pfade, Sequenz 9 bis 1), zusätzlich jedes Icon als 16×16-PNG in `ui/skills3/` beziehungsweise `ui/talents/`. Welt-Icons tragen einen hellen Innenring; beide Atlanten teilen eine Palette mit höchstens 32 sichtbaren Farben und binärem Alpha. Zuordnung: `public/sprites/manifest-faehigkeiten2.json`; Vierfachvorschau: `docs/art/preview-faehigkeiten2.png`; Prompts: `docs/art/batch-faehigkeiten2-generation.json`; Export und Prüfung: `tools/art/faehigkeiten2/`. Keine Laufzeitintegration und keine Änderungen an Hauptfertigkeits-Icons.
## Batch BY – Nerven- und Konzentrations-Artefakte (`nerven_artefakte`)

14 eigene Artefaktmotive als 28 RGBA-PNGs: je 16×16 in `items/` und 32×32 in
`items/32/`. Gemeinsame Palette (31 verwendete Farben aus 32), binäres Alpha,
transparenter Rand, Nearest-Neighbor-Export. Kein Spielcode geändert; die
Zuordnung in `NERVEN_ARTEFAKT_ICONS` bleibt für den separaten Einbau bestehen.

`zweites_herz` und `nadel_der_naeherin` sind enthalten: Zum Bearbeitungsbeginn
waren nur die Platzhalter aus dem Datenpaket BX vorhanden, keine fertigen
BX-Grafiken oder entsprechender Grafik-PR. Diese beiden Platzhalter werden
ersetzt. Das optionale Status-Icon `atem` ist nicht Teil dieses Batches.

- [Manifest](../../public/sprites/manifest-nerven-artefakte.json)
- [Tatsächlich verwendete Einzelbild-Prompts und Herkunft](batch-nerven-artefakte-generation.json)
- [Vorschau aller Motive in beiden Größen](preview-nerven-artefakte.png)
- Normalisierte Generator-Master: `docs/art/nerven-artefakte-sources/`

Reproduzierbar mit Python und Pillow aus den gespeicherten Mastern:

```sh
python tools/art/nerven_artefakte/export.py
python tools/art/nerven_artefakte/check.py
```

Das Prüfskript kontrolliert die vollständige ID-Liste gegen die BY-Aufgabe,
Maße, Manifest, gemeinsame Palette, binäres Alpha, transparente Randpixel,
Duplikate und Herkunfts-Hashes. Generiert mit dem eingebauten Bildgenerator.
## Batch CA – Hauptfertigkeiten (`skill_icons_hoch`)

55 eigene 16×16-Icons: `ui/skill_icons_hoch.png` enthält 40 Hauptfertigkeiten (10 Pfade als Spalten, Sequenz 4→1 als Zeilen, 160×64); `ui/skill_icons_neu.png` enthält 15 Hauptfertigkeiten für Waage/Moor/Uhr (Sequenz 9→5, 48×80). Alle Einzelbilder liegen unter `ui/skills_hoch/<id>.png`. Die runden Medaillons folgen den vorhandenen Fertigkeitsicons; hohe Sequenzen erhalten zweite Motive, ab Sequenz 3 einen türkisen Funken und bei Sequenz 1 einen hellen Kern. [Manifest](../../public/sprites/manifest-skill-icons-hoch.json) mit zeilenweisen `skillIds`, [4×-Vorschau](preview-skill-icons-hoch.png), [vollständige Bildgenerator-Prompts](batch-skill-icons-hoch-generation.json) und Bildgenerator-Master in `skill-icons-hoch-sources/`. Reproduktion: `python tools/art/skill_icons_hoch/export.py` (Pillow); Prüfung: `python tools/art/skill_icons_hoch/check.py`. Gemeinsame indizierte Palette mit 31 sichtbaren Farben plus Transparenz, binäres Alpha, Nearest-Neighbor-Export. Prüfer kontrolliert Maße, alle 55 IDs in Atlasreihenfolge, belegte und unterschiedliche Zellen, Einzelbildgleichheit, Palette, Alpha und Rangakzente. Kein Laufzeit-Einbau; bestehende Atlanten und BZ-Fähigkeiten bleiben unberührt.

## Batch BW — Innenräume und Lesestellen (`innen2`)

17 neue PNGs: ein Animationsatlas, sechs Möbel-Sets und zehn deckende Leseansichten. Lieferung nach `codex_BW_innen2.md`; kein Spielcode geändert, Einbau separat.

- [`manifest-innen2.json`](../../public/sprites/manifest-innen2.json): Framegrößen, Spalten/Reihen, Animationslisten, Geschwindigkeiten, Einzelzellen und benannte Möbelregionen.
- `props/innen2_anim.png`: 128×608, 4 Spalten × 19 Reihen, 32×32 je Frame. 76 Frames, vier pro Variante, gemeinsame Grundlinie y=30 und transparenter Rand. Kleine Motive belegen höchstens 14×14 Pixel innerhalb derselben 32×32-Framefläche. Die Aufgabenliste nennt „16 Props“, zählt aber 19 Varianten einschließlich drei Kaminfeuern und zwei Kerzenarten auf. Alle 19 sind geliefert; keine genannte Variante entfällt.
- `props/innen2_moebel_{buero,revier,laden,akademie,speisewagen,lohnbuero}.png`: je 128×64, 8×4 Zellen im 16×16-Raster. Die letzten vier Zellen sind deckende Wandstücke: Tapete, Täfelung, Kalk und Blech. Größere Möbel aus ihren benannten zusammenhängenden Regionen zusammensetzen. Einzelne Regal-/Schrankfragmente werden als modulare Wiederholung verwendet; 32 Zellen bedeutet nicht 32 unabhängige Möbelstücke.
- `ui/scenes/lese_{brief,kassenbuch,zeitung,wandanschlag,kalkbrett,telegramm,sternkarte,lohnzettel,kinderzeichnung,tagebuch}.png`: je 240×135, vollständig deckend. Das ausdrücklich vorgegebene Szenenformat ist vom 16×16-Kachelraster ausgenommen. Gekritzel ist Bilddekoration, lesbarer Spieltext wird separat eingeblendet.
- Gemeinsame Palette aus `props/05_03_furniture.png`, ergänzt um drei passende Farbtöne: 31 sichtbare Farben plus transparenter Index. Alpha nur 0/255, keine weißen/schwarzen Freistellränder. Referenzbild wurde jedem Bildgenerator-Aufruf mitgegeben. Lichtkegel/Staub waren optional und sind nicht Teil dieser Lieferung.
- Verwendete Prompts, Quellnamen und SHA-256: [`batch-innen2-generation.json`](batch-innen2-generation.json). Erstellt mit integriertem Bildgenerator; Pillow verarbeitet nur Raster, Zuschnitte, Palette und Alpha. `tools/art/innen2/export.py --sources <json>` reproduziert den Export aus den ursprünglichen Generatorbildern; diese großen Zwischenbilder gehören nicht zum Laufzeitpaket. Die JSON-Liste benötigt `id`, `prompt` und lokalen `source`-Pfad je Eintrag.
- Vorschau: [`preview-innen2.png`](preview-innen2.png). Prüfung: `python tools/art/innen2/check.py` (Pillow). Technische Tests prüfen keine semantische Richtigkeit oder Bewegung im laufenden Spiel; Motive und Lesbarkeit wurden zusätzlich in der Kontaktvorschau gesichtet.

- **BU / ausruestung2:** 120 Ausrüstungs-Overlays plus Korruption, 16 Kampfkulissen und 7 Koop-/Portraitgrafiken; Manifest `public/sprites/manifest-ausruestung2.json`, Vorschau `preview-ausruestung2.png`, Prüfung und Zuordnungen in `tools/art/ausruestung2/`.


## Batch BR — Sekten (`sekten`)

98 Pflicht-PNGs für Aschenbund, Flutkinder und Stummen Chor nach den BQ-Grafikbriefen: zwölf Rang-Laufsheets, drei Haupt-Auren, neun benannte Figuren mit Lauf-, Emotions- und Kopf-Bildern, zwölf Kampf-Sheets und zwölf Bestiariumsbilder, Zeichen, drei animierte Schreine, Sabotage, Ereignis-FX, Umtriebe-HUD, Karten-Pins sowie zwölf Items in 16×16 und 32×32. Die optionalen Szenen und Kampfkulissen sind nicht Teil dieser Lieferung.

- [Manifest](../../public/sprites/manifest-sekten.json): Framegrößen, Reihen/Spalten, nullbasierte Animationslisten, Bildraten und Regionen. Laufreihen: unten, links, rechts, oben. Portraits: neutral, misstrauisch, erschrocken, leichtes Lächeln.
- Kampf: sechs Spalten; Reihen `idle` (4), `attack` (6), `hit` (3), `end` (4). Bei den Häuptern folgt `phase2` (6). Zwei identische Ausholframes, transparente Restzellen, nicht tödliche Enden. Nur Idle läuft endlos.
- Haupt-Auren: 128×48, vier 32×48-Frames; die 16×32-Figur sitzt innerhalb der Aura bei (8,8).
- Schreine: 64×64-Packbild, Basisregion (0,0,48,48), Effektstreifen (0,48,64,16). Effektframes 12–15 auf 16×16-Raster; über der Basis bei (16,16) platzieren. Die ungenutzte rechte Fläche neben der Basis bleibt transparent.
- Alle Laufzeitbilder sind indizierte PNGs mit binärem Alpha und einer gemeinsamen Palette aus 31 sichtbaren Farben. Export ausschließlich mit Nearest Neighbor. Die 32er-Items sind exakte 2×-Versionen; Köpfe stammen aus dem neutralen Portrait.
- [Verwendete Bildprompts und Quellen](batch-sekten-generation.json), [Vorschau](preview-sekten.png), [Prüfbericht](batch-sekten-validation.json).

Prüfung: `python tools/art/sekten/check.py` (Pillow). Prüft den vollständigen Pflichtumfang, Maße, Palette, binäres Alpha, Raster, Animationsgrenzen, belegte und leere Frames, Ausholduplikate, unterschiedliche Lauf-/Effektframes und Portraitausdrücke sowie 2×-Items. Export: `python tools/art/sekten/export.py docs/art/batch-sekten-generation.json /pfad/zu/generated_images`. Die Quelldateinamen und SHA-256 stehen im Promptprotokoll.

Grafiklieferung ohne Änderung am Spielcode. Die Einbindung und die Abstimmung im laufenden Spiel folgen separat.

## Batch CI – Briarholt, kalt und warm (`briarholt1`)

41 PNGs für Kapitel 5 (Briarholt), Einbau separat: 6 Tilesets je `_kalt`/`_warm`
(8×5 Zellen à 16×16, identische Zellenbelegung, **v2: jede Zelle einzeln von Hand gezeichnet**,
Bodenzellen nahtlos, Warm-Zellen als eigene Zeichnung statt Umfärbung; die Animationsplätze
zeigen kalt ein wanderndes Reif-Glitzern), 6 Prop-Blätter (Kutschenhof, Kesselgrund inkl. Bügelraum
mit Ventiltafel und Steckmarken, Promenade, Glasgärten, Stillenhäuser, Wurzelkranz mit
Verteilanlage in 3 Zuständen), `fx/bh_waerme.png` (v2 handgezeichnet: Dampf, Kondensat-Schrift,
Reif, Rücklauf-Puls, Kondensat-Sperre als Wasserwand, Leitungsplan-Kacheln), 9 Szenenbilder inkl.
vier Enden und der Lichtmeister-Variante, 9 Kampf-Hintergründe (Kesselgrund und Glasgärten
kalt/warm), Stadtkarte mit Nebel- (v2 im Stil von `ds_karte_nebel`) und Leitungsplan-Overlay,
Marker für alle 18 Karten und die Kapitelkarte. Gemeinsame 32-Farben-Palette, binäres Alpha.
Figuren (BK), Gegner/Zonen-Hintergründe (BI) und Item-Icons (BM) werden nicht doppelt geliefert.

- Manifest: `public/sprites/manifest-briarholt1.json` (Zellen, `groundCells`, Regionen, `regionAnimations`, `variants: {kalt, warm}`, Pins, Leitungs-Segmente).
- Protokoll: `docs/art/batch-briarholt1-generation.json` (Prompts mit Style-Block, Zellbeschreibungen kalt/warm, Referenzen, Hashes, verworfene Versuche); Rohbilder des Generators: `docs/art/briarholt1-raw/`.
- Vorschau: `docs/art/batch-briarholt1-preview.png`; Prüfung: `python tools/art/briarholt1/check.py --write` → `docs/art/batch-briarholt1-validation.json` (prüft u. a. doppelte Zellen und reine Umfärbungen kalt→warm).

**Hinweise:** Ventilzustände zu/kalt/warm sind eigene Zellen in `bh_kessel` (16–18). Pins und
Leitungs-Segmente der Stadtkarte sind am generierten Bild gemessen und Vorschläge für CH;
`groundStrip` der Kampf-Hintergründe folgt dem Dunscar-Standard (y 200, Höhe 70).
Offen: Die Stadtkarte liest sich eher wie eine normale Kleinstadt; Talkessel und die sechs
Viertel sind noch nicht klar erkennbar (bewusst unverändert gelassen).

## CE1 — Calderwick: Tilesets und Props (`calderwick1`)

Sechs Tilesets mit **135 Zellen à 16×16** (acht Spalten) und sieben Props-Sheets mit **61 benannten Regionen**, einschließlich aller geforderten Animationsframes. Heller trockener Kalk, rußige Rinnen, Druckerei, Amt, Gemeinschaftsküche und Nullfundament. Die gemeinsame Palette übernimmt 31 sichtbare Farben aus `manifest-dunscar1.json`; Index 31 ist für Transparenz reserviert.

- Manifest: [`manifest-calderwick1.json`](../../public/sprites/manifest-calderwick1.json). Die Props verwenden 64×64-Speicherplätze; `regions` gibt die tatsächlichen Zuschnitte an (16×16 bis 64×48). `animations.frames` bezeichnet Speicherplatz-Indizes, `animations.regions` die zugehörigen exakten Ausschnitte. Beim Einbau keine 64×64-Flächen auf die Objektgröße stauchen.
- Das **Bürgenbrett** hat drei manuell gewählte Zustände unter `states.buergenbrett`: `leer`, `zwei_verbunden`, `drei_verbunden`. Kein automatisch laufender Zustandswechsel.
- [Vorschau](batch-calderwick1-preview.png), [verwendete Prompts und Herkunft](batch-calderwick1-generation.json), [Prüfbericht](batch-calderwick1-validation.json).
- Prüfung und Vorschau neu erstellen: `python tools/art/calderwick1/check.py` (Pillow). Prüft Umfang, Maße, Palette, binäres Alpha, Raster, transparente Restfelder, Regionen, Animationsframes, Brettzustände und SHA-256.

Die bereits mit `image_gen` erzeugten CE-Grafiken wurden wiederverwendet und auf CE1 begrenzt. Die originalen 13 Prompts und Quellbild-Hashes bleiben dokumentiert; `exportSelection` nennt die tatsächlich übernommenen Zellen und Regionen. Ungeforderte Zusatzmotive sind ausgesondert. CE2, Figuren, Gegner und Item-Icons sind nicht Bestandteil dieser Lieferung. Kein Spielcode geändert; Kartenplatzierung, Laufzeitregistrierung und Prüfung der Kachelübergänge in den fertigen Karten folgen beim separaten Einbau.

## Batch CE2 — Calderwick: Effekte, Szenen und Karten (`calderwick2`)

22 Pflicht-PNGs für Kapitel 4: ein Abgleich-Atlas, sieben Szenen, neun Kampfkulissen sowie Stadtkarte, Nebel, Marker, Kapitelbild und Reisekarte. Grafiklieferung; der Laufzeit-Einbau folgt separat. CE1-Tiles/Props und die drei BI-Gefahrenzonen-Kulissen sind nicht Bestandteil dieses Pakets.

- [Manifest](../../public/sprites/manifest-calderwick2.json), [Vorschau](batch-calderwick2-preview.png), [Bildprompts und Nachbearbeitung](batch-calderwick2-generation.json), [Prüfbericht](batch-calderwick2-validation.json).
- `fx/cw_abgleich.png`: 288×128, gemischter Atlas. Regionen `strasse_gerade`, `strasse_kurve`, `strasse_ende`, `kontakt_gefaehrdet` liegen bei y=0/16/32/48, jeweils vier 16×16-Frames. `verbindung_stabil` liegt bei y=64 mit zwei 16×16-Frames. Alle laufen mit 4 FPS. `nebel_rueckweg` bei y=80 enthält sechs 48×48-Frames mit 8 FPS, einmalig. Frame-Listen sind **lokal zur jeweiligen Region**, nicht zum Gesamtatlas. Gerade Straße verläuft vertikal; Kurve und Ende dürfen beim Einbau um 90° gedreht werden. Ungenutzte Atlasflächen bleiben transparent.
- `ui/cw_marker.png`: 96×48 wie `ds_marker.png`, 6×3 Zellen à 16×16, alle 18 vorgegebenen Karten-IDs einschließlich `reise_landstrasse` als benannte Regionen. Motive innerhalb 14×14, Grundlinie y=15 exklusiv. Stadtkarte und Nebel sind 480×270 wie die Dunscar-Vorlagen. Kartenmarker werden separat gesetzt; das Manifest definiert keine spielmechanischen Reisepunkte.
- Szenen und Kulissen sind deckend. Kleine End-/Zwischenbilder und der Reiseausschnitt sind 240×135; alle neun Kampfkulissen, Aufzug, Küche und Kapitelbild sind 480×270. Die sechs trockenen Kalkterrassen sind auf der Stadtkarte von unten nach oben angeordnet. Das Amtsinhaberbild zeigt ein Amtssymbol ohne lesbaren Titel oder Personennamen, entsprechend der Vorgabe „ohne Text“.
- Erzeugt mit dem integrierten Bildgenerator. Nearest-Neighbor-Zuschnitte, getrennte Atlaszellen, indizierte gemeinsame 32-Farben-Palette aus `manifest-dunscar1.json`; transparente PNGs verwenden zusätzlich einen transparenten Index. Alpha nur 0/255. Der Effekt-Export entfernt das generierte Pflaster aus den Tinten-/Nebelmasken, damit vorhandene Straßen sichtbar bleiben. Quellnamen, SHA-256, tatsächlich verwendete Prompts und Verarbeitungsschritte stehen im Generierungsprotokoll.

Prüfung: `python tools/art/calderwick2/check.py` (Pillow, aus jedem Arbeitsverzeichnis). Prüft den exakten Lieferumfang, Maße, Indizierung, gemeinsame Palette, Alpha, Prüfsummen, Raster, alle Marker-IDs und Grundlinien, regionale Animationslisten/Geschwindigkeiten, unterschiedliche belegte Frames sowie leere Restflächen. Vorschau und vergrößerter Effektatlas wurden gesichtet; Bewegungsabstimmung im Spiel gehört zum späteren Einbau.

## CN: Kettlegate lebt (`kettlegate_leben`)

35 PNGs: zehn Lauf-Sheets 64×128, zehn Köpfe 24×24, zehn Sonderposen 16×32, Tiere, Wetter, Stände, Nachtfassaden und zehn Stadtpins. 282 nichtleere Frames, gemeinsame 31-Farben-Palette, binäres Alpha. Gemischte Atlasgrößen und Animationslisten stehen in `public/sprites/manifest-kettlegate-leben.json`.

- Daten und Einbauvertrag: `docs/story/kg_leben/README.md`.
- Prompts und Quellbild-Prüfsummen: `batch-kettlegate-leben-generation.json`; Erzeugung mit dem eingebauten Bildgenerator, danach Nearest-Neighbor-Rasterung und Palette/Alpha-Bereinigung.
- Vorschau: [preview-kettlegate-leben.png](preview-kettlegate-leben.png).
- Prüfung: `python tools/art/kettlegate_leben/check.py`.

Keine Laufzeitintegration in diesem Paket.

### CV — Varrowmouth: Tilesets und Props (`varrowmouth1`)

17 PNGs: sieben 256×256-Tilesets je bei Ebbe/Flut, Wasseranimation 256×64,
60 Props im 512×256-Atlas und sechs Fassaden mit Tag-/Nachtregionen im 512×128-Atlas.
Je Thema 64 belegte Zellen, 8 Bodenvarianten und ein nahtgeprüftes 16er-Corner-Wang-
Wasserset (Bits NW=1, NE=2, SE=4, SW=8; gesetzte Ecke = Wasser). Zellen 8–15,
32–35 und 38–41 wechseln mit dem Pegel; die übrige Architektur bleibt identisch.
Die zwei 32×96-Leuchtfeuertürme liegen wegen der Atlashöhe nebeneinander bei
x=416/448; die fünf übrigen Tag-/Nachtfassaden stehen in zwei Reihen.
Regionen müssen beim separaten Einbau als Fassadenmaterialien registriert werden.

- Manifest: `public/sprites/manifest-varrowmouth1.json` (`themes`, `anims`, `regions`, `facades`).
- Vorschau: [14 Kacheltests à 8×8 und Atlasübersicht](batch-varrowmouth1-preview.png).
- Prompts/Herkunft: [Generation](batch-varrowmouth1-generation.json).
- Prüfung: `python tools/art/varrowmouth1/check.py --write` (Pillow).
- Bericht: [Validation](batch-varrowmouth1-validation.json).
- Erzeugung mit ImageGen; danach Nearest Neighbor, gemeinsame 32er-Palette,
  binäres Alpha, Zellnormalisierung und Nahtkorrekturen. Keine Änderungen am Spielcode.

## Batch DL — Erfolge (`erfolge`)

80 stille Aktenvermerke, acht PNGs: Atlas 16/32px jeweils erfüllt/offen, 9-Slice-Rahmen, sechs Stempelframes, neun Gruppensymbole und Meldungsrahmen. Manifest: `public/sprites/manifest-erfolge.json`; Daten und Einbauvertrag: `docs/story/erfolge/`. Vorschau: `batch-erfolge-preview.png`, Prompts: `batch-erfolge-generation.json`, Abnahme: `batch-erfolge-validation.json`. Kein Laufzeitcode. Prüfung: `node docs/story/erfolge/pruefen.mjs` und `python tools/art/erfolge/check.py`.
## Batch DG – haus

Eigenes Haus: acht PNG-Atlanten, 40 Möbel mit Ofenanimation/Welkzustand, 32 Boss-Trophäen (46 Kampf-/Phasen-IDs), sechs Stadtwände und Türen, Umzugsbilder, Staub und Einrichtungs-UI. Siehe `../story/eigenes_haus/README.md`, `../../public/sprites/manifest-haus.json` und `batch-haus-preview.png`. Generierung: `batch-haus-generation.json`; Prüfung: `python tools/art/haus/check.py` und `node docs/story/eigenes_haus/pruefen.mjs`. Einbau separat; keine Tiermöbel aus DF enthalten.
## CO: Halbgott und Engel (`halbgott`)

73 PNGs für Sequenz 4 und 2: sechs Trink-Sheets, acht Effekte, zehn Kreaturformen jeweils für Karte und Kampf, zehn Zugportraits, zwei Ritualwächter mit Kartenfiguren, zehn Siegel, zwei Kampfkulissen, zwanzig Sequenzbilder und zwei HUD-Größen. Die 780 Rasterzellen verwenden die gemeinsame Palette aus `manifest-fasserin.json`; Alpha ist binär, Szenen sind opak.

- [Manifest](../../public/sprites/manifest-halbgott.json), [Vorschau](batch-halbgott-preview.png), [Prompts und Herkunft](batch-halbgott-generation.json), [Prüfbericht](batch-halbgott-validation.json).
- [Übergabe und Registrierungsstellen](halbgott-uebergabe.md): Framegrößen, Richtungen, Aushol-Holds, drei Wächterphasen, Rückverwandlung und getrennte Koop-Instanzen.
- Prüfung: `python tools/art/halbgott/check.py` (Pillow). Kontrolliert das vollständige Sollinventar, Maße, gemeinsame Palette, Alpha, Raster, Animationen, Baselines und exakte HUD-Verdopplung.

Erzeugt mit dem eingebauten Bildgenerator, anschließend Nearest Neighbor und Palette-/Alpha-Bereinigung. Grafiklieferung ohne Spielcodeänderung; CP und der spätere Einbau übernehmen Ritual- und Kampfregeln.
