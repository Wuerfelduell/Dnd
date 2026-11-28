# Eigene Laufblätter für zehn Figuren mit Leihbild

Erzeugt mit `python3 tools/art/figuren/figuren.py` (Pillow, pixelweise, deterministisch). Raster wie die NPC-Blätter:
64x128, Reihen unten/links/rechts/oben mit je 4 Schritten (Stand, Schritt, Stand, Schritt), Fußlinie y=30.
Palette: `manifest-figuren_nachzuegler.json` (32 Farben der späten Stadtfiguren). Eingebaut am Ende von `src/world/assets.js` (`FIGUREN_EIGEN`).
Manifest: `public/sprites/manifest-figuren-eigen.json`. Test: `tests/figuren_eigen.test.js`. Vergleich: `python3 tools/art/figuren/vergleich.py`.

## Auswahl

Gesetzt waren Maud Keel, Oda Kessel und Ottilie Fenn. Der Scan aller 331 NPCs auf Karten ergab:
- **Maud Keel** (`wx_pfandleiherin`) hat schon ein eigenes Blatt mit einzigartiger Silhouette. Es wurde laut Kommentar in `assets.js` bereits ersetzt; der ältere Kommentar „umgefärbte Vorratsfigur“ ist veraltet.
  **Oda Kessel** (`fasserin`) hat ihr eigenes Blatt aus Paket BO/fasserin2. Beide wurden nicht neu gezeichnet, damit keine fertige eigene Grafik überschrieben wird.
- **Ottilie Fenn** war eine umgefärbte Näherin (gleiche Silhouette wie `bhn_e_naeherin` und `dsg_naeherin`) und ist dabei.
- Dazu neun echte Leihfälle. Die auffälligsten tragen dasselbe Bild wie eine andere Person derselben Stadt:

| NPC | Name | trug bisher |
|---|---|---|
| wx_schneiderin | Schneiderin Ottilie Fenn | umgefärbte Näherin |
| cwz_pfandmeister | Pfandmeister Ambros Kerb | Blatt der Marktfrau Selma Dorr |
| cwz_schneiderin | Schneiderin Vera Saum | Blatt der Fensterputzerin Mira Cale |
| cwz_kassenwart | Kassenwart Emil Groschen | Blatt des Boten Oskar Venn |
| cwz_kesselflicker | Kesselflicker Bruno Ruß | Blatt des Laternenwarts Enno Reed |
| cwz_aschehaendler | Aschehändler Ferdinand Glut | Blatt des Nachtsetzers (dreifach geteilt) |
| cwz_bleisetzer | Obersetzer Konrad Blei | Blatt des Nachtsetzers (dreifach geteilt) |
| cwz_schaetzerin | Schätzerin Liesl Lupe | Blatt der Archivdienerin (dreifach geteilt) |
| haus_maklerin | Frau Leda Voss | Blatt von Bess Hagan (Kettlegate) |
| nebel_kraemerin | Ysolde Grau | Blatt der Wahrsagerin Madame Orsolya |

Jede Figur hat ein berufstypisches Merkmal: Maßband und Nadelkissen, Uhrkette und Brille, Schere, grüner Augenschirm und Kassette, Schiebermütze, Lederschürze und Kessel,
Melone mit Schal und Ascheeimer, Papierhut der Setzer, Einschlaglupe, Federhut mit Mappe, Kapuze mit Tragkorb und Laterne.

## Sichtprüfung (verworfene Fassungen)

1. Formelbasierte Körper: kastenförmig, eckige Köpfe, kaum Schrittbewegung, Mütze wie ein Zylinder → verworfen.
2. Silhouetten-Schablonen: lesbar, aber zu breit und kopflastig, Gesichter zu dunkel → wirkte wie ein anderes, kindlicheres Set → verworfen.
3. Schmalere Proportionen wie bei den Vorlagen (Gesicht 6 px, Rumpf 6 px), hellere Haut, Kleidung abgedunkelt → eingebaut.

Die Figuren sind etwas glatter und weniger körnig als die gemalten Vorlagen, stehen aber in Größe, Proportion und Farbe in derselben Reihe (`neben_vorlagen.png`).

## Noch offen

Weiter geliehen: `cwz_waffenwart` (Hedda Kling), `cwz_tuersteherin` (Lene Riegel), `cwz_sammlerin` (Margit Asch), `cwz_letternfrau` (Ilse Zeile).
Außerdem tragen viele Dunscarer Zirkel- und Marktfiguren umgefärbte Vorratsfiguren (gleiche Silhouetten, siehe Scan).
Porträts und Köpfe der zehn Figuren sind nicht Teil dieser Runde.
