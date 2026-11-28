# Kettlegate: Altmarkt und Nachtmarkt

Erzeugt mit `python3 tools/art/kg_maerkte/assets.py`. Palette: `manifest-kettlegate-leben.json` (31 Farben, Hexwerte), binäres Alpha, Umriss #1a1c2c.
Einbau: `src/data/kettlegateMaerkte.js` (läuft direkt nach `applyKettlegateKulisse`). Test: `tests/kg_maerkte.test.js`.
Bilder: `python3 tools/art/vergleich_orte.py docs/art/agent-kg-maerkte <ref> altmarkt nachtmarkt` und `tools/art/gesamtbild.py`.

## Befund (Requisiten je 100 Bodenfelder)

| Ort | vorher | nachher | Befund |
|---|---|---|---|
| altmarkt | 2,8 | 3,2 | acht Stände aus nur vier Bauarten, große kahle Mittelflächen zwischen den Standreihen |
| nachtmarkt | 4,8 | 6,1 | im Kettlegate-Feinschliff absichtlich breiter gemacht – deshalb nur vier Stücke: drei in der unteren Gasse, das hohe Amulettgestell an der Rückwand neben dem Pfandtisch |

Vorhandenes wurde nicht doppelt gezeichnet: Kreidetafel/Aufsteller, Vitrine und Handkarren gibt es schon.

## Die zehn Stücke

| Stück | Größe | Ort |
|---|---|---|
| Fischstand (Eis, Heringe, Preisschild) | 32×32 | Altmarkt |
| Gewürzstand (offene Säcke, Kräuterbündel) | 32×32 | Altmarkt |
| Käsestand (Laibe, Anschnitt, Würste) | 32×32 | Altmarkt |
| Blumenkarren | 32×24 | Altmarkt |
| Geflügelkäfige, gestapelt | 32×32 | Altmarkt |
| Zeitungsständer | 16×32 | Altmarkt |
| Amulettgestell (leuchtet schwach) | 32×48 | Nachtmarkt |
| Maskenständer (Stecktafel mit Halbmasken) | 24×40 | Nachtmarkt |
| Kerzenstand (Licht) | 32×32 | Nachtmarkt |
| Schmugglerkarren | 48×32 | Nachtmarkt |

Alle stehen auf Boden (`.,gPswpc=`), nicht neben Objekten, Figuren oder Spawns, und sind nur fest, wenn danach noch alles erreichbar ist.
Neue Spieltexte: keine.

## Sichtprüfung

- Erste Fassung verworfen: Die Stände waren 48 px breit und erschlugen die vorhandenen 32er-Stände; die Masken sahen wie aufgespießte Köpfe aus.
  Zweite Fassung: Stände auf 32 px, Masken als Halbmasken an einer Stecktafel.
- Bei 6-facher Vergrößerung vier Stücke überarbeitet:
  - Geflügelkäfige: Die Hühner sahen wie Schädel aus. Jetzt Hühner im Profil mit Kamm, Schnabel und Schwanz hinter zwei Latten.
  - Kerzenstand: Die Flammen waren eine körnige Funkenwolke. Jetzt eine Flamme je Kerze ohne Umriss, Messingteller, drei Wachsfarben.
  - Fischstand: Die Fische verschwanden im körnigen Eis. Jetzt ruhigeres Eis, dunklere Fische mit Auge und Schwanzflosse, die Heringe hängen am Schwanz.
  - Käsestand: Die Laibe sahen wie Brot aus. Jetzt Laibe mit Rinde, ein roter Wachslaib und ein Keil mit Löchern.
- Das Amulettgestell (48 px hoch) stand zuerst in der unteren Gasse direkt vor der Wahrsagerecke und hätte Figuren verdeckt. Es steht jetzt an der Rückwand.
- Ehrlich: Neben den Codex-Ständen wirken die neuen Stücke etwas flächiger und weniger verrauscht. Palette, Umriss und Größen stimmen aber; im Kartenbild fallen sie nicht heraus.

## Änderung an einem bestehenden Test

`tests/sprites.test.js` („Deko auf den Karten nutzt bekannte Sprites“) ließ auf Karten mit Nachtmarkt-Kacheln nur `PROP_CELLS`/`PROP_ANIMS` zu.
`preloadSprites` lädt aber auch alle `ANIM_SHEETS` als Texturen, und `WorldScene.buildObjects` zeichnet jede vorhandene Textur. Deshalb zählen `ANIM_SHEETS` dort jetzt auch als bekannt.
