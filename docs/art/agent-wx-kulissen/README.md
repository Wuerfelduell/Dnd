# Wexmoor: zehn Requisiten für Torf, Moor, Salz, Friedhof und Lichtamt

Erzeugt mit `python3 tools/art/wx_kulissen/assets.py`. Palette: Pinsel `tools/art/vm_kulissen/pinsel.py`, gleich `manifest-wexmoor8.json`.
Das ist dieselbe Palette wie die Wexmoor-Straßenmöbel `wx2_*`. Binäres Alpha, Umriss #1a1c2c.
Einbau: `src/data/wexmoorKulissen.js` (nach `applyHeimkehr`). Test: `tests/wx_kulissen.test.js`.
Bilder: `python3 tools/art/vergleich_orte.py docs/art/agent-wx-kulissen <ref> <karten…>` und `tools/art/gesamtbild.py`.

## Befund

- Platzhalter-Klötze gibt es in Wexmoor nicht: Auf den Außenkarten ist kein I-Block, in den Innenräumen ist I die Wand.
- Leer wirken dagegen diese Orte (Requisiten je 100 Bodenfelder):

| Ort | Thema | vorher | nachher |
|---|---|---|---|
| wx_torfbrueche | Torf (Stollen) | 0,8 | 1,4 |
| wx_vergessmoor | Moor | 1,6 | 1,9 |
| wx_salzwatt | Salz | 2,3 | 2,5 |
| wx_flossfriedhof | Friedhof | 8,1 (Mittelsteg kahl) | 8,7 |
| wx_lichtamt | Lichtamt | 5,0 | 5,4 |

Vorhandenes habe ich nicht doppelt gezeichnet: Pumpe, Salzberg, Salzwagen, Torfstapel, Torfsode, Schubkarre, Glockenpfahl (Salzwatt), Laternenregal, Aktenschränke.

## Die zehn Stücke

| Stück | Größe | Ort |
|---|---|---|
| Türstock (Grubenholz mit Verzug vor der Torfwand) | 32×40 | Torfbrüche, 2× an der Rückwand |
| Torfpresse (Spindel, Pressbett, Brikettstapel) | 32×32 | Torfbrüche, 2× |
| halb versunkener Handkarren | 32×24 | Vergessmoor, 2× |
| Faschinen (Reisigbündel für den Bohlenweg) | 32×24 | Vergessmoor, 2× |
| Gradierwerk-Stück (Dornenreisig, Solerinne, Salzkruste) | 48×40 | Salzwatt, 2× |
| Solebrunnen (Haspel, Eimer) | 32×32 | Salzwatt |
| Totenfloß mit Leinentuch, Schilfkranz und Kerzen (Licht) | 32×24 | Floßfriedhof |
| Sargstapel (drei Särge, Kreidezeichen) | 32×32 | Floßfriedhof |
| Lichtmessbank (Prüflampe, Schirm, Normkerze; Licht) | 48×32 | Lichtamt |
| Plombenpresse (Hebel, Matrize, Bleiplomben) | 32×32 | Lichtamt |

- Alle Stücke stehen auf echtem Boden: Geröll `r` ist fest und daher ausgeschlossen. Sie stehen nicht neben Objekten, Figuren, Streifen oder Spawns.
- Fest sind sie nur, wenn danach alles erreichbar bleibt. Dafür zählen auch Stege und Pfade als begehbar.
- Dafür hat `setzeNahe` (`innen2.js`) ein optionales Argument für die begehbaren Zeichen bekommen. Ohne dieses Argument blieb im Salzwatt nichts fest, weil der Weg über die Stege führt.
- Neue Spieltexte: keine.

## Sichtprüfung

- Türstock:
  - Die erste Fassung mit V-Streben und Haken sah aus wie ein Galgen.
  - Die zweite hatte einen dunklen Innenraum und sah aus wie ein Stolleneingang (falscher Ausgang).
  - Jetzt: Verzugbretter vor brauner Torfwand, an die Rückwand gestellt.
- Gradierwerk: Das Salz war über die ganze Wand gestreut und sah aus wie Bildrauschen. Jetzt schräge Reisigstriche, das Salz setzt sich nur unten ab.
- Faschinen waren auf dem dunklen Moor zu hell und sind abgedunkelt.
- Ehrlich: Neben den `wx2`-Vorlagen wirken die Stücke etwas flächiger und klarer umrissen. Die Vorlagen sind dunkler und kleinteiliger.
  Die Türstöcke an der Wand kann man auf den ersten Blick für Holztore halten.

## Noch offen

- Die Spiegelkarten der Nebelseite (`ns_salzmarkt`, `ns_flossfriedhof`, `ns_torfbrueche`) sind völlig leer. Ob das gewollt ist (Spiegelwelt), habe ich nicht entschieden.
