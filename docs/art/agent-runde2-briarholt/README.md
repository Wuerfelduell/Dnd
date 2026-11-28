# Briarholt-Kulissen (Runde 2 der Skript-Kulissen)

Zehn neue Assets für Briarholt (Kapitel 6), pixelweise erzeugt mit `python3 tools/art/bh_kulissen/assets.py`
(Pillow, deterministisch; Palette aus `public/sprites/manifest-briarholt1.json`, 32 Farben). Eingebaut über
`src/data/briarholtKulisse2.js`, das nach `applyBriarholtKulisse` läuft. Vergleichsbilder: `python3 tools/art/bh_kulissen/vorschau.py <ref>`.

## Befund

- **Requisiten:** Alle Briarholt-Requisiten stammen aus den eigenen CI-Blättern (`bhp_`, `bht_`). Es gibt keine Kettlegate-, Wexmoor- oder Dunscar-Sprites.
- **Fremde Kacheln:** Die Dächer aller Außenkarten und einiger Innenräume (`bhd_kupfer/schiefer/ziegel/basalt`, über 1000 Felder)
  sind generische Texturen aus dem Vorrat `future200`. Sie haben keine Traufe, keinen First und keine Kanten, die oberste Reihe ist nur halbtransparent.
  Im Kesselgrund verschwimmt der Schiefer mit dem gleichfarbigen Pflaster.
- **Leihstücke aus anderen Vierteln:** Labor (Pumpenrad aus der Pumpstation, kein Laborgerät), Dipples Zeichenstube im Mutterhaus
  (Teewagen und Kinderzeichnung aus den Stillenhäusern), Gepäckhalle (Kohlenkisten aus dem Kesselgrund). Der Aktenraum
  („Einwilligungen und Widerrufe“) war bis auf ein Heft leer.
- Unter den Dächern liegt im Kachel-Layer weiter die generische Füllkachel `wallTop`. Sie ist vollständig verdeckt und wurde nicht angefasst.

## Die zehn Assets (`public/sprites/props/`, Manifest `manifest-bh-kulissen.json`)

| Asset | Größe | Ersetzt / ergänzt | Orte |
|---|---|---|---|
| `bhk_dach_kupfer` | 16er, 11 Kacheln × kalt/warm | future200_196 | Kutschenhof, Winterpromenade, Pavillon, Kutschenhalle |
| `bhk_dach_schiefer` | dto. | future200_187 | Kesselgrund, Wurzelkranz, Wäscherei, Bügelraum, Verteilanlage |
| `bhk_dach_ziegel` | dto. | future200_188 | Stillenhäuser, Aktenraum |
| `bhk_dach_basalt` | dto. | future200_191 | Wurzelkammer |
| `bhk_labortisch` | 48x40 | neu (Destille, verworfene Anleitungen) | Labor |
| `bhk_laborregal` | 32x48 | statt Pumpenrad | Labor |
| `bhk_planschrank` | 48x32 | statt Teewagen | Mutterhaus |
| `bhk_rollenstaender` | 16x32 | statt Kinderzeichnung | Mutterhaus |
| `bhk_aktenschrank` | 32x48, zu/offen | neu (3×) | Aktenraum |
| `bhk_gepaeckstapel` | 32x32 | statt Kohlenkisten | Kutschenhalle |

Jeder Dachsatz hat 11 Kacheln: innen a/b, ein Einzelstück (Lüfter, Schornstein, Dachfenster, Wurzelknoten), First, Traufe mit Rinne,
Giebelkanten und vier Ecken. Zeile 0 ist die kalte Fassung mit Reif und Eiszapfen-Ansatz, Zeile 1 die warme.
Die Kachel wählt `dachFrame()` nach den Nachbarfeldern.

## Wege und Kollision

- Dächer liegen nur auf Wandfeldern und sind nicht fest, genau wie die alten Texturen.
- Getauschte Stücke bleiben auf ihrem Feld und behalten ihre Kollision. Die Gepäckstapel sind 12 px nach rechts gerückt, damit sie nicht über den Bänken liegen.
- Neue Stücke (Labortisch, drei Aktenschränke) stehen auf freiem Boden, nicht neben Objekten. Fest sind sie nur, wenn danach alles erreichbar bleibt (`erreichbarMit`).
- Test: `tests/briarholt_kulisse2.test.js`. Dazu ist `tests/briarholt_grafik.test.js` um die `bhk_`-Sprites ergänzt.
- Neue Spieltexte: keine (reine Deko), darum gibt es keinen neuen EN-Eintrag.

## Sichtprüfung (verworfene Fassungen)

- Schiefer v1: rechteckige Platten, sah aus wie eine Ziegelmauer → Schuppenschiefer. v2 war noch zu hell für das Kesselgrund-Pflaster → abgedunkelt.
- Ziegel v1: schmale Streifen wie Cord, Reif als weißes Rauschen → breite Hohlpfannen, sparsamer Reif.
- Basalt v1: Wurzel in jeder Kachel, wirkte wie Tapete → nur in Variante B.
- Labortisch v1: zu kleinteilig, Destille nicht lesbar → großer Rundkolben auf Dreifuß mit Kühler.
- Aktenschrank v1: blaugraues Metall, zu modern → dunkles Holz wie die Stillenhäuser-Möbel.
- Gepäckstapel lagen über den Bänken → 12 px Versatz.
- Aktenschrank links verdeckte das Wandgitter (14,1) → nach Spalte 11 gerückt.

## Bilder

`gesamt_neben_vorlagen.png` zeigt alle zehn neben den alten future200-Texturen, den CI-Requisiten und Kettlegate-Kulissen.
Dazu je ein Vorher/Nachher-Bild für Kutschenhof, Kesselgrund (warm), Stillenhäuser, Wurzelkammer, Labor, Mutterhaus, Aktenraum und Kutschenhalle.

## Offen

- Die Gaslaterne der Promenade steht weiter in der Gepäckhalle und den Innenhöfen anderer Viertel. Kohlenkisten stehen weiter im Kutschenhof, im Wurzelkranz und in der Wurzelkammer.
- Mutterhaus und Labor sind noch eher leer.
