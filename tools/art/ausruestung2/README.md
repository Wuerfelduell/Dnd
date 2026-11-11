# BU – sichtbare Ausrüstung, Kampfkulissen und Koop

Grafikbatch `ausruestung2`, ohne Änderungen am Spielcode. Die PNGs werden separat eingebunden.

## Umfang und Abweichungen vom älteren Auftragssnapshot

Der aktuelle Stammkatalog `src/data/items.json` enthält 12 Hüte (`slot: hut`), 11 Mäntel (`mantel`) und 16 Waffen. Für Ermittler, p2a und p2b entstehen deshalb 120 Overlays einschließlich je eines Amulettglanzes, dazu ein Korruptions-Overlay. Die englischen Slots im Manifest werden ausdrücklich auf die deutschen Daten-Slots abgebildet. Gegenstände anderer Packs sind nicht still zusätzlich aufgenommen.

Die Basis des Ermittlers heißt tatsächlich `characters/03_01_investigator_walk.png`. Alle drei Basen sind 64×128 mit 16×32-Frames; die Zeilen sind unten, links, rechts, oben. Die Overlays verwenden dieselbe Orientierung, dieselben vier Laufphasen und denselben Ursprung. Rückwärts gerichtete Waffen bleiben fast vollständig verdeckt. Anhand der Vorschau die Kombinationen vor dem Einbau prüfen. Die Basisfiguren enthalten bereits Kleidung: Eine spätere Ausrüstungsdarstellung muss die alte Kleidung ersetzen beziehungsweise eine neutrale Basis verwenden, damit etwa der alte breite Hut nicht unter einer kleinen Mütze hervorschaut. Dieses Paket ändert die Basisgrafiken nicht.

Zwölf Kampfkulissen sind als Tagesfassungen vorhanden; zusätzlich entstehen Nachtfassungen für Schwellenring, Rangierwüste, Salzmarkt und Sturm-Leuchtturm. Die Orts-ID `bg_wx_salzmarkt_nacht` stammt aus dem Auftrag; das Feld `variant` ist für Tag/Nacht maßgeblich. Die Unterschicht erhält begrenztes Schachtlicht und violettes Nachhall-Licht.

Bereits belegte Zielnamen erhalten den Zusatz `_bu`, damit kein anderer Batch überschrieben wird. Das Manifest bewahrt den gewünschten Namen in `requestedFile` und den tatsächlichen neuen Pfad in `file`. Das betrifft insbesondere bestehende Dunscar-Kulissen und die beiden p2-Portraitstreifen. Nicht anhand des gewünschten Namens alte Dateien austauschen.

Der Koop-Rahmen enthält zwei **48×48-Regionen nebeneinander** (Gesamtbild 96×48), Messing links und kühles Blau rechts, jeweils mit 8-Pixel-9-Slice-Rändern. Die 24 Symbole sind 12×2 Zellen à 16×16, Spieler 1 oben und Spieler 2 unten. Die im Auftrag zusätzlich erwähnte `ui/koop2_portraits.png` ist kein drittes Portrait: Die konkreten Dateien liegen wie gefordert unter `portraits/`, mit vier 64×64-Stimmungen und separaten 24×24-Köpfen.

## Reproduktion und Prüfung

- `jobs.json`: vollständiger Auftrag je Export einschließlich Referenz, Zielraster und Prompt.
- `export.py <sources.json>`: Liste aus `{id, path}` für originale Generatorbilder; Nearest Neighbor, Registrierung je Frame an Kopf-/Rumpf-/Handankern der jeweiligen Basis, gemeinsame Palette, Alpha-Schwelle 128, transparente RGB-Werte null. Amulett-Exporte extrahieren genau zwei benachbarte helle Quellpixel am Hals; übrige eventuell mitgenerierte Körperpixel werden verworfen. Originale bleiben unverändert.
- `package.py`: Manifest, Promptnachweis und beschriftete Kontaktübersicht. Beschriftungen gehören nur zur Dokumentation, niemals zu Spielgrafiken.
- `python tools/art/ausruestung2/check.py`: Maße, Vollständigkeit, Palette, Alpha, Frame-Indizes, Item-IDs, Verdeckung der rückwärts gerichteten Waffen und höchstens zwei Glanzpixel pro Amulettframe.

Die Kontaktübersicht zeigt bei Ausrüstung links das freigestellte Overlay und rechts die Überlagerung auf der Originalfigur.

Das Korruptions-Overlay wird auf drei dunkle Fadenfarben begrenzt und separat auf Pixeldichte geprüft; es ist keine helle Ganzkörperaura.

Die technische Prüfung ersetzt nicht die Sichtprüfung der Kompositionen und registrierten Overlays. Kleine Gitter gelten für Sprites; 480×270-Kulissen und 240×135-Szenen werden nicht künstlich auf durch 16 teilbare Bildgrößen erweitert.
