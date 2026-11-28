# Nebelseite: zehn Fundstücke mit eigenen Icons (16 und 32)

Erzeugt mit `python3 tools/art/nsi_icons/icons.py` und `public/sprites/manifest-nsi-icons.json`.
Bilder: `python3 tools/art/nsi_icons/vergleich.py docs/art/agent-nsi-icons <ref>`. Test: `tests/nsi_icons.test.js`.
Palette `manifest-halbgott.json` (Codex-Palette), binäres Alpha, Umriss #1a1c2c, Licht oben links. Die 16er sind eigens gesetzt, nicht verkleinert.

## Suche

- Nach Dateinamen hat jedes der 1305 Items ein eigenes Bild. Die 180 „fremden“ Zuordnungen sind gewollt:
  - Beyonder-Reste teilen sich je Pfad drei Stufenbilder.
  - Tränke „aus Rest“ sehen aus wie der normale Trank.
- Deshalb habe ich die Bildinhalte verglichen (Pixel-Hash). 26 Items tragen ein Bild, das pixelgleich unter dem Namen eines anderen Items liegt:
  - 17 Dunscar-Zirkelstücke (`dsz_*`) sind Kopien ihrer alten Vorbilder. Optisch passen sie meist, einige gehören aber zu einer anderen Art (siehe unten).
  - 18 Fundstücke der Nebelseite (`nsi_*`, Codex DH) teilen sich paarweise neun Bilder: Briefumschlag, Laterne, Schuh, Koffer, Schirm, Bildnis, Spiegel, Torbogen, Nebelhaufen.
    Fast nichts davon passt zum Text. Beispiele: Das „Marktgewicht ohne Zahl“ war ein Briefumschlag, der „Kalte Glaskeil“ ein Schuh.
    Ein 32er fehlte bei allen 18.

## Die zehn Icons

| Item | Name | bisher (geteilt mit) | jetzt |
|---|---|---|---|
| nsi_altmarkt_1 | Marktgewicht ohne Zahl | Briefumschlag (Fährspan) | eisernes Gewicht mit Griffloch, leere Zahlenfläche, schwebt über seinem Schatten |
| nsi_altmarkt_2 | Unbezahlte Quittung | Laterne (Heller Torfkern) | Zettel mit Zeilen, rotem Stempel, Lücke in der Unterschriftszeile |
| nsi_torfbrueche_1 | Heller Torfkern | Laterne (Unbezahlte Quittung) | aufrechter Bohrkern, ungleiche Schichten, heller Kern oben, grauer Staub |
| nsi_sternwarte_1 | Kalter Glaskeil | Schuh (Schuhsohle ohne Profil) | Glaskeil mit Reif und stehendem Lichtpunkt |
| nsi_sternwarte_2 | Sternenstaub im Fingerhut | Koffer (Ungelochte Fahrkarte) | Fingerhut, Öffnung oben, Staub steigt heraus |
| nsi_katakomben_1 | Ungeschlagene Glockenzunge | Schirm (Schienenkreide) | Klöppel mit Öse, Kugel blank an der Schlagstelle |
| nsi_schwellenring_1 | Versetzter Nagel | Bildnis (Faden aus Stein) | Nagel mit seitlich versetztem Kopf, Nebelnaht |
| nsi_schwellenring_2 | Stumme Signalscheibe | Spiegel (Salz ohne Geschmack) | Signalkelle, Scheibe halb hell, halb dunkel |
| nsi_salzmarkt_2 | Leere Waagschale | Torbogen (Löffel ohne Mulde) | Messingschale an drei Ketten mit Ring |
| nsi_flossfriedhof_1 | Trockener Seilknoten | Nebelhaufen (Gefaltete Serviette) | endloser Tauring mit Kreuzung, Litzen |

- Alle zehn tragen unten einen kleinen gerasterten Nebelhauch als Kennzeichen der Nebelseite.
- Danach teilt kein Nebelseiten-Fundstück mehr sein Bild mit einem anderen; das prüft der Test.

## Sichtprüfung

- Marktgewicht:
  - erste Fassung las sich als Glocke.
  - zweite als Vorhängeschloss.
  - jetzt die klassische Gewichtsform (Trapez mit Griffloch).
- Torfkern: Liegend sah er aus wie ein Brot oder eine Rolle. Jetzt steht er aufrecht mit Schichten wie ein Bohrkern.
- Glaskeil: zuerst eine lange Klinge, jetzt ein echter Keil.
- Glockenzunge: zuerst ein Löffel, dann eine Flasche. Jetzt dünne Stange und runde Kugel.
- Nagel: Mit dem Kopf links sah er aus wie eine Spitzhacke. Jetzt sitzt der Kopf versetzt auf dem Schaft.
- Ehrlich: Die vorhandenen Codex-Icons sind etwas reicher schattiert und füllen das 32er-Feld stärker. Nagel und Klöppel wirken daneben schmal.

## Noch offen

- Acht Nebelseiten-Fundstücke behalten ihr altes, unpassendes Bild. Es ist jetzt aber nicht mehr doppelt vergeben:
  - Fährspan (Briefumschlag)
  - Schuhsohle ohne Profil (Schuh, passt ungefähr)
  - Ungelochte Fahrkarte (Koffer)
  - Schienenkreide (Schirm)
  - Faden aus Stein (Bildnis)
  - Salz ohne Geschmack (Spiegel, passt zum Spiegelbild)
  - Löffel ohne Mulde (Torbogen)
  - Gefaltete Serviette (Nebelhaufen)
- `dsz_*`: `dsz_splitterklinge` (Waffe) zeigt den Schwertsplitter (Zutat), `dsz_schwellenherz` (Artefakt) das Nebelherz (Zutat), `dsz_stellwerkkrone` (Hut) die Kupferkrone (Artefakt).
- 435 Items haben kein 32er (Trophäen, Formeln, Schlüsselstücke, Verbrauchsgüter), die Oberfläche skaliert dort das 16er.

Neue Spieltexte: keine.
