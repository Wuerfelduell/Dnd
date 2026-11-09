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
