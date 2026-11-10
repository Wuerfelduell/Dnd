# BA / dunscar4 — Einbauhinweise

Grafikpaket vollständig exportiert, noch nicht im Spiel registriert.

- **BN:** `ui/ds_ruflinien.png` über benannte Manifestregionen ausschneiden.
  `x,y` bezeichnen Frame 0, Schrittweite `frameWidth`; Frameindizes sind lokal
  zur Region, keine globalen Sheet-Indizes. Gerade Linien liegen bei y=8,
  Winkel verbinden die linke Kante bei y=8 mit der oberen Kante bei x=8.
  Drehen/Spiegeln immer mit Nearest Neighbor. Vorschau gestrichelt, aktiv
  durchgehend, Echo rücklaufende Punkte, Fehler gezackt. P1/P2 zusätzlich
  mit einer/zwei Kerben unterscheiden. AH-P2-Farbton: `#71858b`.
- `notladung` ist ein Zustandsbild (`voll=0`, `leer=1`), keine Schleife.
  `schleuse_auf` einmal abspielen und auf Frame 2 halten. Geschlossen kann
  pulsieren. `hoerkreis` Frame 2 bedeutet Alarm, Frames 0/1 Ruhezustand;
  nicht ohne Zustandswechsel durch alle drei Frames schleifen.
- **Journal:** `rahmen` ist 48×48 mit 16-px-9-Slice-Rändern. Musterrahmen
  20×20, Symbol innerhalb `[2,2,16,16]`. Diese explizite Ausnahme und die
  160×24-Zeile sind im Atlas auf 16er-Zeilen aufgerundet; Padding nicht anzeigen.
- **BD:** Tierregionen heißen exakt wie BA-Vorgabe. `ds_kalkziege_klettern`
  und `ds_staubteufel` haben 16×32, alle anderen 16×16. Wetterframe 240×135,
  in 16er-Atlaszeilen mit 9 px Padding; nur die eigentlichen 135 px kacheln.
  Dünne Overlays haben transparente Ränder für 2×2-Kachelung. Wind benutzt
  `wind_grasbueschel` (16×16), kein bildschirmfüllendes Windbild.
- Marktstände: `stand_kreide`, `stand_kalkpastillen`, `stand_troedel`,
  `stand_stein`, `stand_tee`, `stand_werkzeug` am Kalkmarkt;
  `stand_kartoffeln`, `stand_zeitungen`, `stand_kerzen`, `stand_flickzeug`
  im Arbeiterbogen. `offen=0`, `geschlossen=1`; Zustände nicht animieren.
- **Ruth:** `k3n_secondhaendler` behält seine Daten-ID. Lauf-Sheet, beide
  Emotions-Sheets und Kopf separat registrieren und erst dann `npc:hesper`
  ersetzen. Keine neue NPC-ID. Kein Kampfsheet angefordert.
- Sprechblasen: vorhandenes `ui/AE_zeitung.png` wiederverwenden.

## Reproduktion

`export.py` erwartet eine JSON-Datei mit den sechs Schlüsseln `portrait`, `walk`,
`stalls`, `animals`, `props`, `weather` und lokalen Pfaden der Generatorquellen.
Prompts, Korrekturprompts und SHA-256 der tatsächlich genutzten Quellen stehen
im Generation-Manifest. Generatorausgaben sind nicht deterministisch; die
exportierten PNGs und ihre SHA-256 im Prüfbericht sind die verbindliche Lieferung.
Die Markt-Zuschnittgrenzen gehören zur dokumentierten Quelle (992×1586).
