# CS – Figuren ohne eigene Grafik

50 PNGs für 21 vorhandene Figuren: 21 Laufblätter, 20 Köpfe, vier Porträtleisten, drei Kampfblätter und zwei Stände. Die vier bisherigen Laufblätter von Maud, Senn, Veit und Noll werden ersetzt. Alle übrigen Bilder sind neu. Keine Änderungen an Spielcode, Dialogen oder NPC-Daten.

## Dateien und Prüfung

- `public/sprites/manifest-figuren_nachzuegler.json`: vollständige Dateiliste, Maße, Raster, Animationen und gemeinsame Palette.
- `docs/art/batch-figuren_nachzuegler-generation.json`: verwendete Generatorprompts, Quell- und Ausgabeprüfsummen sowie Exportparameter.
- `docs/art/batch-figuren_nachzuegler-preview.png`: Kontaktbogen aller 50 Bilder.
- `docs/art/batch-figuren_nachzuegler-validation.json`: maschineller Prüfbericht.
- `tools/art/figuren_nachzuegler/check.py`: Prüfung mit Python und Pillow, Aufruf vom Repo-Stamm: `python tools/art/figuren_nachzuegler/check.py`.
- `tools/art/figuren_nachzuegler/export.py`: Export der Generatorbilder mit Pillow und NumPy. Die Rohbilder werden als `<asset>.png` unter `--raw-dir` erwartet. Ohne `--jobs` liest das Skript die gespeicherten Exportparameter aus der Generation-Datei.

Die 30 Generatorbilder werden je Zelle freigestellt, mit einem gemeinsamen Maßstab pro Blatt per Nearest Neighbor verkleinert und auf dieselbe Palette indiziert. 20 Köpfe sind Ausschnitte aus der jeweiligen ersten Frontansicht. Mina hat gemäß Auftrag keinen separaten Kopf. Alpha ist ausschließlich 0 oder 255; transparente Pixel haben RGB 0. Die Palette hat höchstens 32 sichtbare Farben über das gesamte Paket. Es gibt keine Warm-/Kalt-Doppelungen.

## Einbau in `src/world/assets.js` (separater Auftrag)

Die folgenden Ergänzungen sind hier nur beschrieben. Das Manifest wird derzeit nicht automatisch als Figurenregistrierung geladen.

| Gruppe | Anschluss |
|---|---|
| Maud und drei K2-Auftraggeber | Bestehende `SHEETS`- und `CHARACTER_SHEETS`-Zuordnungen behalten; die vier Dateien unter `characters/*_walk.png` sind ersetzt. |
| Acht `cwn_e_*`, acht `bhn_e_*`, `cwo_marktstand` | Nach `KGL_FIGURES` registrieren: `SHEETS[id] = characters/<id>.png`, `CHARACTER_SHEETS[npc_<id>] = id`. Die IDs stehen im Manifestfeld `npc`. Keine Sonderposen hinzufügen. |
| 20 Köpfe | Die NPC-ID, falls noch nicht vorhanden, in `HEADS` aufnehmen; `HEAD_FILES[id] = portraits/heads/<id>.png`. Nur `HEAD_FILES` zu ergänzen reicht wegen der Prüfung in `headUrl` nicht. |
| Vier Porträtleisten | `PORTRAIT_EXTRA[id] = [<id>_emotions.png, Stimmungszuordnung]`. Siehe Zuordnung unten. Für Dialoge ohne Stimmung neutral wählen. |
| Drei Kampfblätter | `BATTLE_SHEETS[enemy_<id>] = [battle/enemy_<id>.png, 64]`; anschließend die bestehenden Begegnungszuordnungen ersetzen. |
| Zwei Stände | `WHOLE_PROPS[id]` und `SHEETS[id]` auf `props/<id>.png` setzen. IDs: `wx_pfandtisch`, `cwo_marktstand_tisch`. Jeweils vollständiges Bild 48×32, Region `body`. Am bestehenden Salzmarkt bzw. Quittungsmarkt zur Figur platzieren, ohne neue Karte oder NPC-ID. |

Die vier Porträt-IDs sind `wx_pfandleiherin`, `k2a_senn`, `k2a_veit`, `k2a_noll`. Die Spalten unterscheiden sich von `PORTRAIT_MOODS`; deshalb explizit zuordnen:

| Spalte | Stimmung und vorhandene englische Aliase |
|---|---|
| 0 | `neutral` |
| 1 | `freundlich`, `friendly`, `smile`, `faint_smile`, `approving`, `bidding` |
| 2 | `misstrauisch`, `suspicious`, `skeptical` |
| 3 | `erschrocken`, `shocked`, `scared` |

Keine zusätzlichen Emotionen aus diesen vier Bildern behaupten. Bei nicht unterstützter Stimmung neutral verwenden.

| Begegnung in `ENCOUNTER_SHEETS` | Neues Blatt |
|---|---|
| `k2a_tinte_kampf` | `enemy_k2a_senn` |
| `k2a_bittere_mittel_kampf` | `enemy_k2a_veit` |
| `k2a_hafenrecht_kampf` | `enemy_k2a_noll` |

Laufblätter: 16×32, vier Spalten, Reihen unten/links/rechts/oben. Die letzte belegte Pixelzeile ist y=30. Standard 6 fps; Perrin Tuck 7 fps. Kopfgröße 24×24. Porträtzellen 64×64. Kampfblätter: sechs Spalten, fünf Reihen `idle`, `attack1`, `attack2`, `hurt`, `defeated`. Frames 6/7 und 12/13 halten dieselbe Ausholpose. Idle wiederholt mit 6 fps; übrige Animationen laufen einmal mit 8 fps. Bestehende Kampfwerte und Ereignisse bleiben Sache des Einbaus.

## Farbanker und Sichtprüfung

Die Einwohner verwenden ihre vorgegebenen Mantelfarben. Die K2-Daten enthalten noch einen gemeinsamen Marine-Platzhalter: Senn behält ihn als Regenumhang über brauner Weste, Veit als Anthrazitmantel. Noll erhält entsprechend der ausdrücklichen CS-Beschreibung den dunkelgrünen Mantel.

Die Sichtprüfung erfolgt an den exportierten Größen und dem Kontaktbogen. Der maschinelle Bericht prüft zusätzlich Richtungslisten, belegte Zellen, transparente Zellränder, Fußgrundlinie, unterschiedliche Posen und identische Ausholframes. Ein Laufzeittest ist erst nach der separaten Registrierung möglich.


Sichtprüfung abgeschlossen: Alle vier Laufrichtungen sind unterscheidbar; die charakteristischen Körbe, Bücher, Leiter, Kelle, Taschen und Brillen sind auf dem Kontaktbogen erkennbar. Die vier Porträtstimmungen unterscheiden sich in Brauen, Augen und Mund. Die Kampfblätter zeigen Ausholen, Angriff, Reaktion und Aufgabe ohne Blut. Die beiden Stände sind vollständig freigestellt. Nolls grüne Stoffmitteltöne werden vor der Indizierung auf den Farbanker abgeglichen, damit sie nicht in Schiefergrau fallen.

Prüfausgabe:

```text
PASS: 50 PNG; 21 Figuren; 21 Lauf-Sheets, 20 Köpfe, 4 Portraitstreifen, 3 Kampf-Sheets, 2 Props; 464 nichtleere Zellen; 32 gemeinsame Farben.
```
