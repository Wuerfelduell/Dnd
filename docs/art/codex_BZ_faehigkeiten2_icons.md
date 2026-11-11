# Codex-Batch BZ: Icons für die 180 zweiten Fähigkeiten (Kampf und Welt, alle zehn Pfade)

**Batch-Name:** `faehigkeiten2` (Manifest: `public/sprites/manifest-faehigkeiten2.json`)

Seit PR „Zwei weitere Fähigkeiten je Sequenz“ (#229) hat jede Sequenz jedes Pfads neben der Hauptfertigkeit eine **zweite Kampffertigkeit** (`skill2`) und eine **Welt-Fähigkeit** (`talent`, außerhalb des Kampfes: Erkundung, Ermittlung, Handel, Reisen). Daten: `src/data/packs/sequenzen/faehigkeiten2.json`. Im Spiel haben diese **180 Fähigkeiten kein eigenes Bild**: Kampffertigkeiten zeigen im Fertigkeitenmenü das Siegel-Platzhalterbild (vor dem Namen steht ✧), Welt-Fähigkeiten stehen im Pfad-Tab des Notizbuchs nur als Text mit ☉. Du lieferst **zwei Icon-Atlanten** mit je 90 Icons à 16x16.

Die **Hauptfertigkeiten** (Seq 9 bis 5 der sieben alten Pfade) haben schon Icons (`ui/skill_icons.png`, `ui/skill_icons_2.png`): **nicht neu machen**, nur als Stil-Referenz nutzen. Die fehlenden Hauptfertigkeiten (Seq 4 bis 1, neue Pfade 9 bis 5) macht Paket **CA**, nicht dieses.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Andere Pakete laufen gleichzeitig: fasse nur deine eigenen Dateien an. Der Einbau passiert separat.

### 0.1 Style-Block (vor jeden Prompt setzen, wo `[STYLE BLOCK]` steht)
```
STYLE GUIDE (apply to every asset):
Top-down 3/4 perspective pixel art for a 2D mystery/investigation game, in the readable, cozy-clean style of classic farming/life-sim pixel games, but dark and atmospheric.
Setting: an original foggy Victorian-era industrial city called Kettlegate with occult undertones: cobblestone streets, gas lamps, soot-stained brick, wrought iron, canals, chapels, secret societies, alchemical potions.
Grid: strict 16x16 pixel tiles. Overworld characters are 16x32 pixels per frame. Every pixel must align to the grid; no half pixels, no sub-pixel detail.
Pixels: crisp hard-edged pixels, no anti-aliasing, no blur, no gradients; deliberate 2-tone checker dithering only on large surfaces or for fake transparency. 1px dark outline in deep blue-grey (around #1a1c2c, not pure black) on characters, props and icons; terrain tiles have no outline.
Palette: limited muted palette of max 32 colors, matching the existing game sprites. Desaturated slate blues, fog greys, soot browns, mossy greens, rust and brass, bone white; warm amber/yellow only for gas lamp light and candles; turquoise #6fe0d0 or deep violet reserved for occult/supernatural things. Avoid saturated primaries and pure black/white.
Lighting: flat base colors with 2-3 shade steps; light from top-left. Do not bake night darkness into sprites (the engine adds lighting).
Mood: melancholic, mysterious, slightly unsettling, never gory.
Output: transparent background (PNG with alpha) unless stated otherwise, orthographic, no text, no letters, no numbers, no watermark, no signature.
Avoid: 3D render look, painterly style, photorealism, chibi exaggeration, anime eyes, references to existing games, films or franchises.
```

### 0.2 Aufbau der Atlanten
Beide Atlanten sind gleich aufgebaut: **10 Spalten = Pfade** in der Reihenfolge Laterne, Faden, Maske, Echo, Kessel, Eisen, Schlüssel, Waage, Moor, Uhr; **9 Zeilen = Sequenz 9 (oben) bis 1 (unten)**. Zelle 16x16, kein Zwischenraum, Bildgröße **160x144**. Zellenindex = Zeile x 10 + Spalte (Laterne Seq 9 = 0, Faden Seq 9 = 1, …, Uhr Seq 1 = 89).

| Datei | Inhalt |
|---|---|
| `public/sprites/ui/skill_icons_3.png` | 90 Kampffertigkeiten (Tabelle 1) |
| `public/sprites/ui/talent_icons.png` | 90 Welt-Fähigkeiten (Tabelle 2) |

Dazu **jedes Icon einzeln** unter `public/sprites/ui/skills3/<id>.png` bzw. `public/sprites/ui/talents/<id>.png` (16x16), damit der Einbau notfalls einzelne Zellen tauschen kann.

### 0.3 Bildsprache
- **Referenz:** `public/sprites/ui/skill_icons.png` (7 Spalten x 3 Zeilen) und `ui/skill_icons_2.png` (7 x 2). Gleicher Stil: dunkler, fast schwarzer runder Grund mit 1px-Rand, darauf ein klares Symbol in 2 bis 3 Tönen der Pfad-Leitfarbe, ein heller Glanzpunkt oben links. Die neuen Icons stehen im Menü direkt neben den alten und dürfen nicht herausstechen.
- **Leitfarbe je Pfad** (Spalte): Laterne = amber #e8b860 (Lampenlicht, Docht, Glut); Faden = lilac #c8b0e8 (Garn, Knoten, Nähte); Maske = rose #e07a8a (Gesichter, Masken, Schminke); Echo = turquoise #6fe0d0 (Schall, Glocken, Münder); Kessel = poison green #9ad06a (Phiolen, Dampf, Sud); Eisen = steel grey #a8b4c0 (Nieten, Schilde, Fäuste); Schlüssel = brass #d0a050 (Schlüssel, Riegel, Taschen); Waage = dull gold #c9a84c mit Bleigrau #7d7f8a (Waagschalen, Gewichte, Pfandmarken, Quittungen); Moor = peat brown #6b4a2e mit Moosgrün #5f7a4a (Torf, Schichten, Namen im Boden, Ufer); Uhr = copper #b8783c mit Elfenbein #e6dcc3 (Zeiger, Pendel, Zifferringe ohne Zahlen, Takt).
- **Kampf vs. Welt:** Kampf-Icons zeigen eine Handlung (Stoß, Wurf, Schnitt, Schild, Blitz, Rauch); Welt-Icons zeigen ein Werkzeug oder Ding (Lampe, Lupe, Spiegel, Ohr, Phiole, Rucksack, Schlüssel, Münze, Spaten, Uhr). Welt-Icons bekommen zusätzlich einen 1px-Ring in Bone-White innen am Rand, damit man sie auch ohne Beschriftung von Kampf-Icons unterscheidet.
- **Steigerung nach unten:** Seq 9 schlicht (ein Symbol), Seq 6 bis 4 mit einem zweiten Element, Seq 3 bis 1 mit einem winzigen türkisen oder violetten Funken (okkult). Innerhalb einer Spalte bleibt das Grundmotiv verwandt.
- Keine Buchstaben, keine Zahlen, keine Pfeile als Hauptmotiv.

### 0.4 Nachbearbeitung
1. Jedes Icon einzeln generieren oder je Pfad als Streifen, dann mit Nearest Neighbor exakt auf 16x16 bringen und in den Atlas setzen.
2. Auf die gemeinsame Palette indizieren (Referenz-Atlanten mitgeben), max. 32 Farben pro Atlas, binäres Alpha.
3. Prüfskript (Pillow) unter `tools/art/faehigkeiten2/check.py`: Maße 160x144, 90 nicht leere Zellen, Palette, Alpha, keine zwei identischen Zellen.
4. Vorschau `docs/art/preview-faehigkeiten2.png` (beide Atlanten 4-fach vergrößert mit Pfad- und Sequenzbeschriftung außerhalb der Zellen), verwendete Prompts in `docs/art/batch-faehigkeiten2-generation.json`, kurzer Absatz in `docs/art/README.md`.
5. Manifest `public/sprites/manifest-faehigkeiten2.json` nach dem Muster von `manifest-sequenzen2.json` (Asset `skill_icons_3` und `talent_icons`, je `skillIds` als 9 Zeilen x 10 Ids in Atlasreihenfolge).

## 1. Kampffertigkeiten (`ui/skill_icons_3.png`, 90 Icons)
Spalte = Pfad, Zeile = Sequenz. Die Beschreibung sagt, was die Fertigkeit tut; daraus leitest du das Motiv ab (Beispiel: „Dochtfunke“ = kleiner Funke über einem Docht, „Deckung“ = schräg gehaltener Schild, „Fristschlag“ = Zeiger, der auf einen Schlagpunkt trifft).

| Pfad | Seq | Id | Name | Was sie tut |
|---|---|---|---|---|
| Laterne | 9 | `dochtfunke` | Dochtfunke | Ein kleiner Funke vom Docht. 5 Schaden, doppelt gegen Okkultes, und 1 Konzentration kommt zurück. |
| Laterne | 8 | `glutnadel` | Glutnadel | Ein dünner Strahl, der Brand nährt. 6 Schaden, der Gegner brennt 2 Runden, ein bestehender Brand hält eine… |
| Laterne | 7 | `signalfeuer` | Signalfeuer | Grelles Licht ohne Hitze. Der Gegner schlägt 2 Runden lang 20 % schwächer zu, und du gewinnst 10 Nerven. |
| Laterne | 6 | `nebelriss` | Nebelriss | Licht, das jeden Schleier zerreißt. 11 Schaden, doppelt gegen Okkultes, der Panzer des Gegners bricht. |
| Laterne | 5 | `flammenmantel` | Flammenmantel | Du hüllst dich in Flammen. Schutz 16, und wer dich berührt, brennt 2 Runden lang (5 Schaden). |
| Laterne | 4 | `dochtschnitt` | Dochtschnitt | Zwei Schnitte aus Licht. Je 14 Schaden, doppelt gegen Okkultes, und der Panzer des Gegners verliert eine… |
| Laterne | 3 | `aschenwort` | Aschenwort | Du sprichst aus, was verschwiegen wurde. 22 Schaden, doppelt gegen Okkultes, der Gegner schlägt 2 Runden… |
| Laterne | 2 | `horizontglut` | Horizontglut | Der Horizont glüht auf. 30 Schaden, doppelt gegen Okkultes, 3 Runden je 10 Brand, und 2 Konzentration kehren… |
| Laterne | 1 | `unbequeme_wahrheit` | Unbequeme Wahrheit | Du zeigst dem Gegner, was er ist. Schwachstelle offen, Panzer gebrochen, 3 Runden lang 40 % weniger Schaden… |
| Faden | 9 | `fadenzug` | Fadenzug | Du ziehst am richtigen Faden. 80 % Waffenschaden, der auch bei verfehltem Takt trifft. |
| Faden | 8 | `vorgefuehl` | Vorgefühl | Du spürst den nächsten Schlag. Er kommt langsamer und lässt sich parieren, auch wenn er sonst nicht zu… |
| Faden | 7 | `musterbruch` | Musterbruch | Zwei Schläge im gelesenen Muster. Deine nächste Fertigkeit trifft einen Takt genauer, als du drückst. |
| Faden | 6 | `stolperfaden` | Stolperfaden | Ein Faden quer über den Weg. Normaler Schaden, die Schwachstelle liegt offen, und der nächste Angriff des… |
| Faden | 5 | `knotenloesung` | Knotenlösung | Drei Schnitte dort, wo das Gewebe nachgibt. Je 80 % Waffenschaden, kein Takt geht verloren, 1 Konzentration… |
| Faden | 4 | `nahtriss` | Nahtriss | Zwei Schläge entlang einer Naht, die kein Panzer schließt. Den nächsten Schlag des Gegners hast du schon… |
| Faden | 3 | `bruchvorhersage` | Bruchvorhersage | Du siehst, wo es brechen wird. Schwachstelle offen, der nächste Angriff geht ins Leere, deine nächste… |
| Faden | 2 | `saumschnitt` | Saumschnitt | Vier Schnitte am Saum des Gegners. Kein Takt geht verloren, und sein nächster Angriff kommt langsam. |
| Faden | 1 | `offener_knotenpunkt` | Offener Knotenpunkt | Ein Stich in den Punkt, an dem alles zusammenläuft. 250 % Waffenschaden durch jeden Panzer, Schwachstelle… |
| Maske | 9 | `finte` | Finte | Ein angetäuschter Schlag. 70 % Waffenschaden, der Gegner zögert: Sein nächster Angriff kommt langsam. |
| Maske | 8 | `doppelgaenger` | Doppelgänger | Ein zweites Du tritt vor. Schutz 8, und der nächste Angriff geht ins Leere. |
| Maske | 7 | `rollentausch` | Rollentausch | Du nimmst die Rolle des Gegners ein. Normaler Schaden, er schlägt beim nächsten Mal sich selbst, deine… |
| Maske | 6 | `zweite_haut` | Zweite Haut | Die zweite Maske fängt den Schlag. Schutz 14 und 10 Nerven zurück. |
| Maske | 5 | `gesichterwirbel` | Gesichterwirbel | Zwei Schläge aus wechselnden Gesichtern. Der Gegner schlägt sich selbst und trifft 2 Runden lang 20 %… |
| Maske | 4 | `geliehene_miene` | Geliehene Miene | Du trägst für einen Schlag das Gesicht des Gegners. 160 % Waffenschaden, der nächste Angriff geht ins Leere,… |
| Maske | 3 | `stehendes_gesicht` | Stehendes Gesicht | Dein Gesicht bleibt stehen, wo du warst. Schutz 22, der Gegner schlägt ins alte Bild und sich selbst, deine… |
| Maske | 2 | `leeres_gesicht` | Leeres Gesicht | Drei Schläge von jemandem, den der Gegner nicht sieht. Der nächste Angriff geht ins Leere, der danach kommt… |
| Maske | 1 | `eigenes_gesicht` | Eigenes Gesicht | Du zeigst dem Gegner dein wahres Gesicht. 220 % Waffenschaden, er schlägt sich selbst, 3 Runden lang 40 %… |
| Echo | 9 | `fluestern` | Flüstern | Du lauschst nach innen. 8 Nerven kehren zurück. |
| Echo | 8 | `totenruf` | Totenruf | Eine Stimme, die der Gegner kennt. 6 Schaden, doppelt gegen Okkultes, 2 Runden lang schlägt er 20 % schwächer. |
| Echo | 7 | `seelenfaden` | Seelenfaden | Ein dünner Faden zur Seele des Gegners. 8 Schaden, die dich vollständig heilen. |
| Echo | 6 | `chorschild` | Chorschild | Die Stimmen singen um dich (und deine Begleitung). Schutz 10 für jeden Stehenden, 10 Nerven zurück. |
| Echo | 5 | `stillstand` | Stillstand | Ein Lied, das den Atem anhält. 16 Schaden, doppelt gegen Okkultes, der Gegner wird langsam und 2 Runden lang… |
| Echo | 4 | `beschlagenes_wort` | Beschlagenes Wort | Dein Wort beschlägt den Gegner wie Glas. 26 Schaden, doppelt gegen Okkultes, die Hälfte heilt dich, sein… |
| Echo | 3 | `fremde_kehle` | Fremde Kehle | Du sprichst mit der Stimme des Gegners. Je 18 Schaden, doppelt gegen Okkultes, und er schlägt beim nächsten… |
| Echo | 2 | `kuestenlaut` | Küstenlaut | Ein Ton wie Brandung. 40 Schaden, doppelt gegen Okkultes, 40 % heilen dich, der nächste Angriff kommt langsam. |
| Echo | 1 | `letztes_zuhoeren` | Letztes Zuhören | Du hörst dem Gegner zu, bis er nichts mehr hat. Schwachstelle offen, 3 Runden lang halber Schaden von ihm,… |
| Kessel | 9 | `riechsalz` | Riechsalz | Ein scharfer Atemzug. 6 Nerven zurück, und eine Blutung versiegt. |
| Kessel | 8 | `rauchphiole` | Rauchphiole | Beißender Rauch. Der nächste Angriff geht ins Leere, der Gegner hustet 2 Runden lang (3 Schaden). |
| Kessel | 7 | `laugenwurf` | Laugenwurf | Ein Spritzer Lauge. 7 Schaden, der Panzer verliert eine Stufe, die Schwachstelle liegt offen. |
| Kessel | 6 | `destillat` | Destillat | Ein Schluck aus der Taschenflasche. 18 Leben, und 1 Konzentration kehrt zurück. |
| Kessel | 5 | `wandlungstrunk` | Wandlungstrunk | Gift, Arznei, Säure in einem Schluck. Schutz 12, 12 Leben und 14 Nerven. |
| Kessel | 4 | `rueckstandsgift` | Rückstandsgift | Was übrig bleibt, wirkt am längsten. 12 Schaden, 4 Runden je 9 Gift, ein bestehender Brand hält 2 Runden… |
| Kessel | 3 | `kreislaufsud` | Kreislaufsud | Ein Sud, der durch jeden Stehenden kreist. 24 Leben für jeden, Blutungen versiegen. |
| Kessel | 2 | `dampfstoss` | Dampfstoß | Zwei Schübe kochenden Dampfs. Je 24 Schaden, 3 Runden je 14 Brand, der nächste Angriff kommt langsam. |
| Kessel | 1 | `letzte_fraktion` | Unverlorener Rest | Nichts geht verloren, alles kommt zurück. 40 Leben und Schutz 20 für jeden Stehenden, 2 Konzentration zurück. |
| Eisen | 9 | `schulterstoss` | Schulterstoß | Ein Stoß mit der Schulter. 90 % Waffenschaden, der Gegner taumelt: Sein nächster Angriff kommt langsam. |
| Eisen | 8 | `deckung` | Deckung | Du nimmst die Arme hoch. Schutz 8, und 1 Konzentration kehrt zurück. |
| Eisen | 7 | `klingenbruch` | Klingenbruch | Ein Hieb gegen die Deckung. 120 % Waffenschaden, Panzer und Schild des Gegners brechen. |
| Eisen | 6 | `hafenmauer` | Hafenmauer | Du stellst dich vor alle. Schutz 14 für jeden Stehenden, deine Blutung versiegt. |
| Eisen | 5 | `ambossschlag` | Ambossschlag | Ein Schlag wie auf den Amboss. 200 % Waffenschaden durch jeden Panzer, der Gegner trifft 2 Runden lang 20 %… |
| Eisen | 4 | `nietenfaust` | Nietenfaust | Zwei Fäuste wie Nietköpfe. Je 150 % Waffenschaden, der Panzer des Gegners verliert zwei Stufen. |
| Eisen | 3 | `gegenlast` | Gegenlast | Du setzt dein Gewicht dagegen. Schutz 30, der nächste Schlag lässt sich parieren, wie unparierbar er auch… |
| Eisen | 2 | `traegerstoss` | Trägerstoß | Drei Stöße mit dem Gewicht einer Brücke. Kein Takt geht verloren, der Gegner wird langsam. |
| Eisen | 1 | `bleibende_stuetze` | Bleibende Stütze | Du stehst, und alles lehnt sich an dich. Schutz 40 und 20 Leben für jeden Stehenden, der Gegner trifft 3… |
| Schlüssel | 9 | `griff_in_die_tasche` | Griff in die Tasche | Ein Stich und ein Griff. 70 % Waffenschaden, und von Menschen fallen 6 Schilling ab. |
| Schlüssel | 8 | `riegelgriff` | Riegelgriff | Du findest den Riegel in der Deckung des Gegners. Normaler Schaden, Schild und eine Stufe Panzer fallen. |
| Schlüssel | 7 | `schattenhaut` | Schattenhaut | Du trittst in den Schatten. Der nächste Angriff geht ins Leere, und 1 Konzentration kehrt zurück. |
| Schlüssel | 6 | `boersenschnitt` | Börsenschnitt | Zwei Stiche, ein Schnitt am Beutel. Je normaler Schaden, und von Menschen fallen 12 Schilling ab. |
| Schlüssel | 5 | `siegelstich` | Siegelstich | Ein Stich, der jedes Siegel bricht. 180 % Waffenschaden durch jeden Panzer, die Schwachstelle liegt offen. |
| Schlüssel | 4 | `schwellentritt` | Schwellentritt | Du trittst durch die Schwelle hinter dem Gegner. Je 140 % Waffenschaden, der nächste Angriff geht ins Leere,… |
| Schlüssel | 3 | `leerriegel` | Leerriegel | Der Gegner schlägt gegen eine Tür, die nicht mehr da ist. Nächster Angriff ins Leere, danach trifft er sich… |
| Schlüssel | 2 | `randsprung` | Randsprung | Drei Stiche vom Rand des Türrahmens. Kein Takt geht verloren, 2 Konzentration kehren zurück. |
| Schlüssel | 1 | `offene_schwelle` | Offener Durchgang | Du öffnest im Gegner eine Tür. 300 % Waffenschaden durch jeden Panzer, der nächste Angriff geht ins Leere,… |
| Waage | 9 | `waage_pfandnahme` | Pfandnahme | Du nimmst dir, was dir zusteht. 5 Schaden, von Menschen fallen 5 Schilling ab. |
| Waage | 8 | `waage_bleizunge` | Bleizunge | Du nennst die falsche Forderung beim Namen. Schutz 6, der Gegner schlägt 2 Runden lang 20 % schwächer. |
| Waage | 7 | `waage_frist` | Frist setzen | Du setzt dem Gegner eine Frist. Sein nächster Schlag kommt langsam und lässt sich parieren, 1 Konzentration… |
| Waage | 6 | `waage_ausgleich` | Ausgleich | Ein Schlag, ein Gegengewicht. 10 Schaden, Schutz 8 für jeden Stehenden. |
| Waage | 5 | `waage_saldo` | Offener Saldo | Du legst dem Gegner seine Schuld auf. 14 Schaden, Schutz 10, er schlägt 3 Runden lang 30 % schwächer. |
| Waage | 4 | `waage_gewichtsschatten` | Gewichtsschatten | Die Schatten an deinen Handgelenken schlagen mit. Je 18 Schaden, der Gegner wird langsam. |
| Waage | 3 | `waage_halber_ton` | Halber Ton tiefer | Deine Stimme senkt sich, und der Gegner spürt seine Schuld. Schutz 18 für jeden Stehenden, 2 Runden lang 30… |
| Waage | 2 | `waage_gegenbuchung` | Gegenbuchung | Was der Gegner nimmt, buchst du zurück. Je 28 Schaden, Schutz 20, 30 % des Schadens heilen dich. |
| Waage | 1 | `waage_quittung` | Quittung | Du stellst die letzte Quittung aus. 36 Schaden, Schwachstelle offen, Schutz 30 für jeden Stehenden, 2… |
| Moor | 9 | `moor_torfschlag` | Torfschlag | Ein feuchter, schwerer Schlag. 5 Schaden, 3 Leben zurück. |
| Moor | 8 | `moor_namenslast` | Vergessener Name | Du nennst dem Gegner einen Namen, den er vergessen hat. Er schlägt 2 Runden lang 20 % schwächer, dir kehren… |
| Moor | 7 | `moor_schicht` | Schichtwechsel | Du legst eine Schicht Torf über die Wunde. 8 Schaden, Schutz 8, deine Blutung versiegt. |
| Moor | 6 | `moor_uferhalt` | Uferhalt | Das Ufer hält dich und deine Begleitung. 12 Leben und Schutz 6 für jeden Stehenden. |
| Moor | 5 | `moor_luecke` | Offene Lücke | Du lässt eine Lücke, in die der Gegner fällt. 12 Schaden, Schwachstelle offen, der nächste Angriff geht ins… |
| Moor | 4 | `moor_schichtdruck` | Schichtendruck | Zwei Schläge, schwer wie nasser Torf. Je 16 Schaden, 10 Leben zurück, der Gegner wird langsam. |
| Moor | 3 | `moor_bodennamen` | Namen im Boden | Der Boden kennt den Gegner. 3 Runden lang 35 % weniger Schaden von ihm, 18 Leben für jeden Stehenden. |
| Moor | 2 | `moor_vergessensrand` | Vergessensrand | Der Gegner vergisst, wen er angreift. Je 26 Schaden, 20 Leben zurück, er schlägt beim nächsten Mal sich… |
| Moor | 1 | `moor_fehlstelle` | Fehlstelle | Der Gegner hört seinen vergessenen Namen in deiner Fehlstelle. 34 Schaden, Schwachstelle offen, 3 Runden… |
| Uhr | 9 | `uhr_vorgriff` | Vorgriff | Du setzt den Fuß früher. 5 Schaden, und 1 Konzentration kehrt zurück. |
| Uhr | 8 | `uhr_nachhinken` | Nachhinken | Du verschiebst den Takt des Gegners. Sein nächster Angriff kommt langsam und lässt sich parieren, wie… |
| Uhr | 7 | `uhr_pendel` | Pendelschwung | Zwei Schläge im Pendeltakt. Je 6 Schaden, und deine nächste Fertigkeit trifft einen Takt genauer, als du… |
| Uhr | 6 | `uhr_gangreserve` | Gangreserve | Du hebst dir einen Schlag auf. Der nächste Angriff geht ins Leere, 2 Konzentration kehren zurück. |
| Uhr | 5 | `uhr_fristschlag` | Fristschlag | Der Schlag kommt, bevor der Gegner sich entschieden hat. 14 Schaden, kein Takt geht verloren, Schwachstelle… |
| Uhr | 4 | `uhr_zwischentakt` | Zwischentakt | Du schlägst zwischen den Schlägen. Je 17 Schaden, der nächste Angriff geht ins Leere, deine nächste… |
| Uhr | 3 | `uhr_fristlauscher` | Vorgelauscht | Du hörst den Schlag vor dem Geräusch. Der nächste Angriff kommt langsam und lässt sich parieren, 2 Runden… |
| Uhr | 2 | `uhr_wiederkehr` | Wiederkehr | Dein zweiter Umriss schlägt mit. Dreimal 20 Schaden, kein Takt geht verloren, 3 Konzentration kehren zurück. |
| Uhr | 1 | `uhr_gewaehrte_minute` | Gewährte Minute | Du gewährst dir eine Minute, die niemand sonst hat. Nächster Angriff ins Leere, der danach parierbar, 3… |

## 2. Welt-Fähigkeiten (`ui/talent_icons.png`, 90 Icons)
Gleicher Aufbau. Motiv = das Werkzeug oder Ding, das zur Fähigkeit passt (Beispiel: „Laternenschein“ = kleine Handlaterne mit Lichtkegel, „Münzen finden“ = Hand über drei Münzen, „Takt zählen“ = Taschenuhr mit einem hervorgehobenen Strich).

| Pfad | Seq | Id | Name | Was sie tut |
|---|---|---|---|---|
| Laterne | 9 | `laternenschein` | Laternenschein | Du hebst die innere Laterne. 20 Sekunden lang zeigen sich verborgene Spuren auch ohne Geistsicht. |
| Laterne | 8 | `ruhiges_licht` | Ruhiges Licht | Du hältst still, bis die Flamme nicht mehr flackert. Senkt die Unruhe um 12. |
| Laterne | 7 | `wegleuchte` | Wegleuchte | Das Licht fällt auf den nächsten Schritt: Der Pfad verrät dir, was dein wichtigster Auftrag als Nächstes… |
| Laterne | 6 | `klarer_blick` | Klarer Blick | Du weitest die Augen. 90 Sekunden lang kostet die Geistsicht 60 % weniger Nerven. |
| Laterne | 5 | `wandelndes_signal` | Wandelndes Signal | Du leuchtest wie ein Feuer im Nebel. 45 Sekunden lang weichen gewöhnliche Gegner auf der Karte vor dir zurück. |
| Laterne | 4 | `offene_lampe` | Offene Lampe | Du nimmst den Schirm von der Lampe. Eine Minute lang sind alle verborgenen Spuren der Karte sichtbar. |
| Laterne | 3 | `aschenlese` | Aschenlese | Du liest in der Asche: Eine Vermutung, der noch eine zweite Quelle fehlt, kommt dir wieder in den Sinn. |
| Laterne | 2 | `lichtschranke` | Lichtschranke | Du stellst dich in dein eigenes Licht. 3 Minuten lang +30 % Schaden gegen Okkultes. |
| Laterne | 1 | `fensterlicht` | Fensterlicht | Alle Fenster der Stadt leuchten für dich. 2 Minuten lang sind verborgene Spuren sichtbar, eine Minute lang… |
| Faden | 9 | `spur_lesen` | Spur lesen | Du siehst die kleinen Dinge: Der Pfad sagt dir, was dein wichtigster Auftrag als Nächstes braucht. |
| Faden | 8 | `fadenblick` | Fadenblick | Du siehst Bewegungen einen Herzschlag voraus. 4 Minuten lang ist das Ausweichfenster im Kampf 40 % größer. |
| Faden | 7 | `gewebe_lesen` | Gewebe lesen | Du folgst einem losen Faden: Eine Vermutung, der eine zweite Quelle fehlt, steht dir wieder vor Augen. |
| Faden | 6 | `netz_spannen` | Netz spannen | Du spannst Fäden zwischen allem, was du weißt. 5 Minuten lang bringt jede Schlussfolgerung +2 Ansehen mehr. |
| Faden | 5 | `faden_zur_spur` | Faden zur Spur | Ein Faden zieht dich zu dem, was man übersehen soll. 40 Sekunden lang zeigen sich verborgene Spuren ohne… |
| Faden | 4 | `nahtgefuehl` | Nahtgefühl | Du fühlst die Nähte der Welt. 5 Minuten lang ist das Ausweichfenster 60 % größer. |
| Faden | 3 | `bruchstellen` | Bruchstellen | Du siehst, wo auf dieser Karte Gewalt lauert: Der Pfad zählt dir die Gegner und ihre Eliten. |
| Faden | 2 | `stadtgewebe` | Stadtgewebe | Du kennst jede Gasse am Faden. 5 Minuten lang kostet die schnelle Reise keine Nerven. |
| Faden | 1 | `zusammenhang` | Zusammenhang | Für einen Augenblick siehst du das ganze Gewebe: nächster Schritt, offene Vermutung und eine Minute lang… |
| Maske | 9 | `gefaellige_miene` | Gefällige Miene | Du setzt das Gesicht auf, das Händler mögen. 3 Minuten lang verlangen sie 15 % weniger. |
| Maske | 8 | `fremdes_gesicht` | Fremdes Gesicht | Du streifst ein anderes Gesicht über. Die Wache sucht dich eine Stufe weniger. |
| Maske | 7 | `feilschergesicht` | Feilschergesicht | Das Gesicht, dem Pfandleiher gern mehr zahlen. 3 Minuten lang bekommst du 35 % mehr beim Verkauf. |
| Maske | 6 | `unauffaellig` | Unauffällig | Du wirst zum Hintergrund. 40 Sekunden lang verlieren gewöhnliche Gegner auf der Karte das Interesse an dir. |
| Maske | 5 | `gastgesicht` | Gastgesicht | Jede Tür hält dich für geladen. 2 Minuten lang öffnen sich gesperrte Schränke und Türen mit 20 Ansehen… |
| Maske | 4 | `mietgesicht` | Mietgesicht | Ein geliehenes Gesicht trägt die Schuld. Fahndung sinkt um 2 Stufen, 5 Minuten lang verlierst du nur halb so… |
| Maske | 3 | `rollenverwahrung` | Rollenverwahrung | Du spielst den Stammkunden, den jeder kennt. 4 Minuten lang verlangen Händler 30 % weniger. |
| Maske | 2 | `publikum_verlieren` | Publikum verlieren | Du verschwindest aus jedem Blick. Die Fahndung sinkt um 3 Stufen, eine Minute lang weichen gewöhnliche Gegner. |
| Maske | 1 | `hundert_gesichter` | Hundert Gesichter | Du bist jeder Kunde, jeder Nachbar, jeder Gast. 5 Minuten lang 40 % günstigere Preise, die Fahndung sinkt um… |
| Echo | 9 | `lauschen` | Lauschen | Du hörst, was die Wände wissen: Der Pfad sagt dir, was dein wichtigster Auftrag als Nächstes braucht. |
| Echo | 8 | `stille_bitte` | Stille Bitte | Du bittest die Stimmen um Ruhe, und sie gewähren sie. 20 Nerven kehren zurück. |
| Echo | 7 | `nachhall` | Nachhall | Der Ort wiederholt, was hier gesagt wurde: Eine Vermutung ohne zweite Quelle kommt dir in den Sinn. |
| Echo | 6 | `grabesstille` | Grabesstille | Du singst den Ton, der die Stimmen in dir schlafen legt. Senkt die Unruhe um 25. |
| Echo | 5 | `ohr_an_der_wand` | Ohr an der Wand | Du hörst Schritte und Atem hinter allen Wänden: Gegnerzahl der Karte und 30 Sekunden lang verborgene Spuren. |
| Echo | 4 | `stilleverwahrung` | Stilleverwahrung | Du verwahrst die Stille in dir. 4 Minuten lang erholen sich deine Nerven doppelt so schnell. |
| Echo | 3 | `nachruf` | Nachruf | Die Toten des Ortes halten dir ihren Nachruf: nächster Schritt und eine offene Vermutung. |
| Echo | 2 | `schweigeufer` | Schweigeufer | Um dich wird es so still, dass niemand näherkommen mag. Eine Minute lang weichen gewöhnliche Gegner, die… |
| Echo | 1 | `zuhoerstelle` | Zuhörstelle | Du setzt dich an die Stelle, an der alles gehört wird. 60 Nerven zurück, Unruhe sinkt um 30. |
| Kessel | 9 | `kraeuterwickel` | Kräuterwickel | Du legst dir einen Wickel aus dem an, was am Wegrand wächst. Heilt 20 % deines Lebens. |
| Kessel | 8 | `beruhigender_sud` | Beruhigender Sud | Du brühst dir aus der Tasche einen Schluck gegen das Flackern. Senkt die Unruhe um 15. |
| Kessel | 7 | `staerkende_tinktur` | Stärkende Tinktur | Ein paar Tropfen vorab. 4 Minuten lang wirken heilende Gegenstände 50 % stärker. |
| Kessel | 6 | `witterung` | Witterung | Du riechst, woraus die Dinge bestehen, auch die versteckten. 30 Sekunden lang zeigen sich verborgene Spuren. |
| Kessel | 5 | `schnellbrand` | Schnellbrand | Du brennst dir am Feuer in der Tasche ein Elixier. Heilt 35 % deines Lebens, Unruhe sinkt um 10. |
| Kessel | 4 | `schichtung` | Schichtung | Deine Säfte setzen sich dichter. 5 Minuten lang +25 Pfund Tragkraft. |
| Kessel | 3 | `zehrende_wandlung` | Zehrende Wandlung | Deine Haut gerbt sich von innen. 5 Minuten lang nimmst du 20 % weniger Schaden. |
| Kessel | 2 | `abwaerme` | Abwärme | Du sammelst die Wärme ein, die andere verlieren. Heilt 50 % deines Lebens und 25 Nerven. |
| Kessel | 1 | `kreislauf` | Kreislauf | Dein Körper kehrt in den Zustand zurück, in dem er sein sollte. Volles Leben, Unruhe sinkt um 40. |
| Eisen | 9 | `zaehne_zusammen` | Zähne zusammen | Du beißt die Zähne zusammen, bis es nicht mehr blutet. Heilt 15 % deines Lebens. |
| Eisen | 8 | `wachstand` | Wachstand | Du stehst, wie ein Wachposten steht. 4 Minuten lang geben Paraden 1 Konzentration mehr. |
| Eisen | 7 | `waffenpflege` | Waffenpflege | Du schärfst und ölst, was du trägst. 4 Minuten lang +3 Angriff. |
| Eisen | 6 | `lastentraeger` | Lastenträger | Du nimmst alles auf den Rücken. 5 Minuten lang +30 Pfund Tragkraft. |
| Eisen | 5 | `schmerzfrei` | Schmerzfrei | Dein Körper hört auf, sich zu beschweren. 5 Minuten lang nimmst du 25 % weniger Schaden. |
| Eisen | 4 | `standhaft` | Standhaft | Du stellst dich breit hin, und die Gasse weiß Bescheid. 45 Sekunden lang weichen gewöhnliche Gegner, 20 %… |
| Eisen | 3 | `eingedrueckte_spur` | Eingedrückte Spur | Jeder Schritt drückt sich in den Stein. 4 Minuten lang +20 % Schaden mit allem. |
| Eisen | 2 | `widerlager` | Widerlager | Du wirst zum Teil der Stadtmauer. 4 Minuten lang 40 % weniger Schaden, 30 % Leben zurück. |
| Eisen | 1 | `stehender_schatten` | Stehender Schatten | Dein Schatten bleibt stehen, und niemand wagt sich an ihm vorbei. 2 Minuten lang weichen gewöhnliche Gegner,… |
| Schlüssel | 9 | `muenzen_finden` | Münzen finden | Münzen finden ihren Weg zu dir: zwischen Pflastersteinen, in Rinnen, unter Bänken. 4 bis 12 Schilling. |
| Schlüssel | 8 | `schlossfluestern` | Schlossflüstern | Du fragst das Schloss, wie es aufgehen will. 2 Minuten lang öffnen sich gesperrte Schränke und Türen mit 20… |
| Schlüssel | 7 | `schattenweg` | Schattenweg | Die Schatten tragen dich durch die Stadt. 4 Minuten lang kostet die schnelle Reise keine Nerven. |
| Schlüssel | 6 | `nachtgang` | Nachtgang | Du gehst, wo niemand hinsieht. 40 Sekunden lang weichen gewöhnliche Gegner, und 6 bis 16 Schilling bleiben… |
| Schlüssel | 5 | `jede_tuer` | Jede Tür | Kein Riegel hält. 3 Minuten lang öffnen sich Schlösser mit 35 Ansehen weniger, 30 Sekunden lang zeigen sich… |
| Schlüssel | 4 | `gute_beute` | Gute Beute | Du weißt, wo das Geld liegt. 5 Minuten lang +50 % Schilling aus Belohnungen und Beute. |
| Schlüssel | 3 | `spiegelhand` | Spiegelhand | Deine Hand ist schon auf der anderen Seite der Scheibe. 15 bis 35 Schilling, die Fahndung sinkt um eine Stufe. |
| Schlüssel | 2 | `innenrand` | Innenrand | Du stehst immer auf der abgewandten Seite. 10 Minuten lang kannst du aus jedem Kampf fliehen, 5 Minuten lang… |
| Schlüssel | 1 | `unverwehrte_tuer` | Unverwehrte Tür | Nichts ist dir verwehrt. 5 Minuten lang öffnet sich jedes Schloss, 30 bis 60 Schilling, eine Minute lang… |
| Waage | 9 | `waage_druckstellen` | Druckstellen lesen | Du erkennst den Wert an den Druckstellen. 3 Minuten lang zahlen Pfandleiher 25 % mehr. |
| Waage | 8 | `waage_fairer_preis` | Fairer Preis | Du weißt, was etwas wert ist, und der Händler weiß, dass du es weißt. 3 Minuten lang 15 % günstiger. |
| Waage | 7 | `waage_ruhige_hand` | Ruhige Hand | Du zahlst, was du schuldest, und wirst ruhig dabei. Senkt die Unruhe um 15. |
| Waage | 6 | `waage_anteil` | Eigener Anteil | Du nimmst deinen Anteil, nicht mehr und nicht weniger. 5 Minuten lang +30 % Schilling aus Belohnungen und… |
| Waage | 5 | `waage_schuldschein` | Schuldschein | Irgendwer in dieser Stadt schuldet dir etwas, und du weißt, wer. 20 bis 40 Schilling. |
| Waage | 4 | `waage_pfandkoerper` | Pfandkörper | Du trägst Gewichte, die niemand sieht, also trägst du auch die, die man sieht. 5 Minuten lang +35 Pfund… |
| Waage | 3 | `waage_saldenhut` | Saldenhut | Jede Zusage wird gewogen. 5 Minuten lang +2 Ansehen je Schlussfolgerung und nur halber Ansehensverlust. |
| Waage | 2 | `waage_zusagen` | Zusagen senken | Dein Schatten senkt sich unter die Zusagen der Händler. 5 Minuten lang 30 % günstiger kaufen, 40 % teurer… |
| Waage | 1 | `waage_erlass` | Schuld erlassen | Jemand erlässt freiwillig eine Schuld, und in deiner Handfläche erscheint die Quittung. 50 bis 90 Schilling,… |
| Moor | 9 | `moor_alte_spur` | Alte Spur | Du siehst, was lange hier liegt. 20 Sekunden lang zeigen sich verborgene Spuren ohne Geistsicht. |
| Moor | 8 | `moor_namen_sammeln` | Namen sammeln | Ein vergessener Name fällt dir ein: Eine Vermutung ohne zweite Quelle kommt dir wieder in den Sinn. |
| Moor | 7 | `moor_aeltere_geschichte` | Ältere Geschichte | Du erkennst, was unter der Geschichte liegt: Der Pfad sagt dir, was dein wichtigster Auftrag als Nächstes… |
| Moor | 6 | `moor_bodenhaftung` | Bodenhaftung | Du stehst im Boden wie ein alter Pfahl. 5 Minuten lang nimmst du 15 % weniger Schaden. |
| Moor | 5 | `moor_torfgedaechtnis` | Torfgedächtnis | Du hältst eine Lücke offen und erinnerst dich an alles um sie herum. Verdaut deinen Trank um 8 %. |
| Moor | 4 | `moor_lesbare_haut` | Lesbare Haut | Die Namen in deiner Haut zeigen dir, was hier verborgen liegt: eine Minute lang verborgene Spuren und eine… |
| Moor | 3 | `moor_sediment` | Sediment | Du lässt dich absetzen wie Schlick. Verdaut deinen Trank um 15 %, Unruhe sinkt um 15. |
| Moor | 2 | `moor_ufer` | Vergessensufer | Um dich bleiben vergessene Wörter stehen, und niemand kommt näher. Eine Minute lang weichen gewöhnliche… |
| Moor | 1 | `moor_erinnertes` | Das Erinnerte | Alles, was fehlt, ist für einen Augenblick da: 25 % Verdauung, nächster Schritt und eine offene Vermutung. |
| Uhr | 9 | `uhr_taktzaehlen` | Takt zählen | Du zählst die Schläge der Stadt mit. 3 Minuten lang ist das Ausweichfenster 30 % größer. |
| Uhr | 8 | `uhr_fruehe_minute` | Frühe Minute | Du gehst nicht schneller, kommst aber früher an. 5 Minuten lang kostet die schnelle Reise halb so viele… |
| Uhr | 7 | `uhr_zoegern` | Das Zögern | Du hörst im Ablauf, wo etwas fehlt: Der Pfad sagt dir, was dein wichtigster Auftrag als Nächstes braucht. |
| Uhr | 6 | `uhr_anhalten` | Uhr anhalten | Für dich laufen die Uhren der Stadt eine Minute lang nicht: Treffen, Fahndung und Tageszeit stehen still. |
| Uhr | 5 | `uhr_naechster_schlag` | Nächster Schlag | Du siehst den ersten Schlag jedes Kampfes kommen. 5 Minuten lang beginnst du Kämpfe mit +2 Konzentration. |
| Uhr | 4 | `uhr_sekundenschatten` | Sekundenschatten | Dein Schatten läuft zwischen den Schlägen. 5 Minuten lang Ausweichfenster +60 %, und du zählst die Gegner… |
| Uhr | 3 | `uhr_fristen` | Fristen | Zwei Minuten lang stehen Treffen, Fahndung und Tageszeit für dich still. |
| Uhr | 2 | `uhr_zweiter_umriss` | Zweiter Umriss | Dein Umriss geht voraus. Eine Minute lang weichen gewöhnliche Gegner, 5 Minuten lang kostet die schnelle… |
| Uhr | 1 | `uhr_fehlender_strich` | Fehlender Strich | Alle Uhren zeigen denselben fehlenden Strich. 4 Minuten lang stehen Treffen, Fahndung und Tageszeit still,… |

## 3. Prompt-Vorlagen

**Ein Pfad-Streifen Kampf (9 Icons):**
```
[STYLE BLOCK]
Horizontal strip of 9 combat skill icons for the pathway "<Pfadname>", each 16x16 pixels, no gap, transparent background. Every icon: dark round base (near-black blue-grey, 1px outline) with a clear action symbol in 2-3 shades of <Leitfarbe>, highlight top-left. Left to right, from the weakest to the strongest ability: 1) <Motiv Seq 9> 2) <Seq 8> 3) <Seq 7> 4) <Seq 6> 5) <Seq 5> 6) <Seq 4> 7) <Seq 3> 8) <Seq 2> 9) <Seq 1>. Icons 7-9 carry one tiny turquoise #6fe0d0 spark. Same family as the attached reference icons (skill_icons.png): same base, outline, pixel density and light. No letters, no numbers.
```

**Ein Pfad-Streifen Welt (9 Icons):**
```
[STYLE BLOCK]
Horizontal strip of 9 world-ability icons for the pathway "<Pfadname>", each 16x16 pixels, no gap, transparent background. Every icon: dark round base with an inner 1px bone-white ring, on it a small tool or object in 2-3 shades of <Leitfarbe>, highlight top-left. Left to right: 1) <Motiv Seq 9> … 9) <Motiv Seq 1>. Icons 7-9 carry one tiny deep violet glow. Same family as the attached reference icons (skill_icons.png). No letters, no numbers.
```

## 4. Einbau (macht ein anderer Thread, nur zur Info)
`SKILL_ICONS_3` und `TALENT_ICONS` in `src/world/assets.js` nach dem Muster von `SKILL_ICONS_2` (10 Spalten), `skillIconOf` erweitern, Welt-Icons in `Ui.talentRowHtml`, Manifest in `tests/sprites.test.js` eintragen.
