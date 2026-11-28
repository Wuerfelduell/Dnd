# Je fünf Requisiten für Dunscar und Briarholt

Erzeugt mit `python3 tools/art/ds_bh_kulissen/assets.py`. Palette: `manifest-dunscar1.json`, identisch mit `manifest-briarholt1.json`.
Einbau: `src/data/dsbhKulissen.js` (Dunscar-Klötze vor der Kulisse, freie Plätze nach allen Kulissen) und `src/data/briarholtKulisse2.js` (Tausch).
Bilder: `python3 tools/art/ds_bh_kulissen/vorschau.py <ref>`. Test: `tests/dsbh_kulissen.test.js`.

## Befund

- **Dunscar:** Im Klopfbruch stehen sechs Klötze 3x3 und drei 3x2. Die Kulisse belegte sie mit Felsnasen aus Wandzellen.
  Schlackengrube (1,2 Requisiten je 100 Bodenfelder) und Rufschlucht (1,3) sind die leersten Gebiete.
  **Bestand:** Formsignale (`signal_arm_up/down`), Wasserkran, Kohlenhaufen, Gepäckkarren und Gaslaterne gibt es schon.
- **Briarholt:** Die Promenaden-Gaslaterne stand auch in Glasgärten, Kesselgrund, Wurzelkranz und Stillenhäusern; Kohlenkisten aus dem Kesselgrund
  standen in Kutschenhof, Wurzelkranz und Wurzelkammer (in der Briarholt-Runde als offen vermerkt). Die Winterpromenade hatte freie Flächen.

## Die zehn Requisiten

| Requisit | Größe | Ort |
|---|---|---|
| Kalkbrecher | 48x48 | Klopfbruch, statt der 3x3-Klötze (6×) |
| Kalkkarren (Kipplore) | 48x32 | Klopfbruch, statt der 3x2-Klötze (3×) |
| Prellbock | 32x32 | Gleisenden in Endbahnhof und Letztem Bahnsteig, Runddepot |
| Läutewerk | 24x48 | Rufschlucht, Rangierwüste |
| Schlackenkübel (glühend) | 48x40 | Schlackengrube |
| Glashauslaterne | 16x48 | Glasgärten (statt Promenaden-Gaslaterne) |
| Rohrlaterne (Dampfrohr, Manometer) | 16x48 | Kesselgrund, Wurzelkranz |
| Stillenlaterne (Milchglas) | 16x48 | Stillenhäuser |
| Probenkiste mit Wurzelproben | 32x32 | Wurzelkranz, Wurzelkammer (statt Kohlenkisten) |
| Wärmeschale | 32x32 | Winterpromenade |

Im Kutschenhof ersetzt der vorhandene Gepäckstapel (Briarholt-Runde) die Kohlenkisten. Die getauschten Laternen behalten ihr Licht.

## Sichtprüfung

- **Signalmast verworfen:** Das Gesamtbild zeigte, dass Dunscar schon Formsignale hat. Ersetzt durch das Läutewerk.
- Ein Schlackenkübel stand auf einem Schlackenhaufen (flache Deko) → Abstand zu hoher flacher Deko.
- Der Prellbock stand auf dem Bahnhofsvorplatz → feste Plätze an den Gleisenden.

## Wege

Klopfbruch: `Y` genau dort, wo vorher `I` war. Neue Stücke: freier Boden, zwei Felder Abstand zu Objekten, Figuren, Spawns und Gegnern,
fest nur bei voller Erreichbarkeit. Neue Spieltexte: keine.
