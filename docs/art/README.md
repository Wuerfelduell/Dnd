# Grafikpaket 14b – Kampf und erste Items

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
