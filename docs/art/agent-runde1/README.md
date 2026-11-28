# Varrowmouth-Kulissen, Runde 1 (Skript-Grafik)

Zehn neue Kulissen-Assets für Varrowmouth (Kapitel 7), pixelweise erzeugt mit `python3 tools/art/vm_kulissen/assets.py`
(Pillow, deterministisch). Eingebaut über `src/data/varrowmouthKulisse.js`. Vergleichsbilder: `python3 tools/art/vm_kulissen/vorschau.py --orte`.

## Befund vor der Runde

- **Kein Varrowmouth-Ort nutzte Kacheln oder Requisiten aus anderen Städten.** Alle acht Karten zeichnen ausschließlich die
  CV-Kachelblätter (`vm_*_ebbe/flut`). `vmTheme` deckt jedes Kartenzeichen ab, ein Kettlegate-Fallback greift nie. Deko hatte keine Karte.
- Die tatsächlichen Platzhalter: Objekte, die die Karten nur als **generische Hauswand-Blöcke** (Wand, Fenster, Türen, Dach) darstellten:
  der Grenzzaun (eine Hausfassade mit Türen quer über die Karte), der Leuchtturm, fünf Wracks und der Rumpf der Wrackmutter,
  zehn Regalreihen und der Block am Ende des Registerkellers.
- `docs/art/palette.hex` gibt es nicht. Verwendet wurde die 32-Farben-Palette aus `public/sprites/manifest-varrowmouth1.json`.
- Die CV-Requisiten (`props/vm_props.png`, 60 Stück) und Fassaden (`facades/vm_fassaden.png`) waren nie eingebunden.
  Poller, Fischstand, Fässer, Salzsäcke, Laternen, Spanten und der Leuchtturm existieren dort schon. Darum wurden sie **nicht** neu gezeichnet.

## Die zehn Assets (alle unter `public/sprites/props/`, Manifest `manifest-vm-kulissen.json`)

| Asset | Größe | Ersetzt | Karte |
|---|---|---|---|
| `vmk_pegelzaun` | 16x32, 4 Varianten | Hauswand-Reihe „Zaun aus Pegelstangen“ | vm_grenzzaun |
| `vmk_zolltor` | 96x48 | die Torpfosten (Durchgang bleibt offen) | vm_grenzzaun |
| `vmk_leuchtturm_fuss` | 96x80 | Hausblock „Leuchtturm“; darauf der vorhandene CV-Turm | vm_leuchtbank |
| `vmk_wrackrumpf` | 80x64 | drei kleine Wrack-Hausblöcke (einer gespiegelt) | vm_wrackfeld |
| `vmk_wrackrumpf_lang` | 112x64 | langer Wrackblock | vm_wrackfeld |
| `vmk_wrackheck` | 64x64 | kurzer Wrackblock | vm_wrackfeld |
| `vmk_wrackmutter_rumpf` | 128x128 | Rumpf der Wrackmutter | vm_wrackfeld |
| `vmk_registerregal` | 80x96, trocken/nass | zehn Regal-Mauerblöcke | vm_registerkeller |
| `vmk_registerschrank` | 64x80 | Block am Ende des Kellers | vm_registerkeller |
| `vmk_nebelschwaden` | 64x32, 3 Varianten | (neu, Stimmung; Codex CW: „Nebel, Zollzaun“) | Grenzzaun, Leuchtbank, Wrackfeld |

Nicht gewählt aus dem Vorschlag: Kaimauer (Kai-Kacheln `quay_cap`/`waterline_wall` stecken schon im CV-Blatt),
Holzsteg mit Pollern, Fischmarktstand, Salzlager, Gaslaterne (alle als CV-Requisiten vorhanden), Kirchenruine
(keine Kirche in den Varrowmouth-Karten), Gully/Pfützen (Schlick-Pfützen sind Kacheln, ein Gully-Platzhalter fehlt).

## Einbau

- `tools/vm/karten.py`: die betroffenen Blöcke heißen jetzt `Y` (fest, Boden-Optik) bzw. `Z` (fest, Schlick-Optik) statt `I`.
  Das sind genau dieselben Felder, die Begehbarkeit ist also unverändert. Anker und Spawns bleiben gleich.
- `WorldScene.vmTheme`: `Y`/`Z` zeichnen Boden bzw. Schlick über die festen Gruppen `kulisse`/`kulisseSchlick` (`VM_SPEC`).
- `assets.js`: `VM_KULISSEN_SHEETS` (als `ANIM_SHEETS`, Frames sind Varianten, keine Animation), Regionen `vmf_*`/`vmp_*` aus `manifest-varrowmouth1`.
- Die Requisiten stehen unten mittig auf ihrem Block, mit Tiefe nach Fußpunkt. Der Nebel liegt auf Tiefe 1500 (über den Figuren, unter Licht
  und Dunkelheit), ist halbtransparent (alpha 0.3–0.35) und nicht fest. Das Tor bringt zwei Laternenlichter mit, der Turm sein Leuchtfeuer.
- Test: `tests/varrowmouth_kulisse.test.js` (Manifest/Registrierung, jede Requisite steht auf Y/Z, Durchgang des Tors offen, alles erreichbar).
- Neue Spieltexte: keine (reine Deko). Darum gibt es auch keinen neuen EN-Eintrag.

## Sichtprüfung (verworfene Fassungen)

- Pegelzaun/Tor v1: glatte, fast weiße „Glasröhren“ → verwittertes Holz mit abblätternder Pegelfarbe, stärkeres Korn.
- Leuchtturmfuß v1: helle Kissen-Felsen mit Schnee-Salz → nasser Stein, weniger Salz.
- Wracks v1 (Seitenansicht, Spanten als dunkle Säulen, Bug als Rampe) komplett verworfen → 3/4-Aufsicht mit Spantbögen, offene Bruchstelle.
- Wrackmutter v1: runder Bottich, ovales Leck mit türkisen Punkten (las sich wie ein Käfer) → länglich, gezacktes Leck ohne „Augen“.
- Registerregal v1: große braune Deckfläche (las sich als Tisch), Rausch-Nässe → zwei Regalreihen, Nässe per Farbzuordnung.
- Zum Schluss alle Holz-, Pegel- und Etikettfarben eine Stufe gedämpft, passend zu den CV-Vorlagen.

## Bilder

- `gesamt_neben_vorlagen.png`: alle zehn neben CV-Requisiten und Kettlegate-Kulissen (Paket D).
- `vorher_nachher_vm_grenzzaun.png`, `…_vm_leuchtbank.png`, `…_vm_wrackfeld.png`, `…_vm_registerkeller.png`.

## Offen (nächste Runde, ohne neue Grafik)

Auf der Leuchtbank stehen Glockenstuhl und Grabsteine der Ertrunkenen, im Zollhafen der Pegeluhrturm, alle noch als Hausblöcke.
Passende CV-Requisiten gibt es schon (`leuchtbank_glocke`, `namensstein_1–4`, `pegeluhr_*`). Sie sind über `vmp_*` jetzt ladbar und
lassen sich mit demselben Y/Z-Verfahren einsetzen. Die übrigen CV-Requisiten (Poller, Netze, Fischstand …) könnten die leeren Plätze füllen.
