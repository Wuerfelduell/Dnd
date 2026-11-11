# Codex-Paket CP: Halbgott und Engel als Texte und Kampfdaten (Sequenz 4 bis 2)

**Schreibt nach:** `docs/story/halbgott/`

Sequenz 4 macht den Spieler zum Halbgott, Sequenz 2 zum Engel. Das Spiel hat dafür bisher nur je einen Satz Beschreibung pro Stufe (`src/data/packs/sequenzen/seq_4_bis_1.json` und `neue_pfade.json`, nur lesen) und die Rituale „die offene Probe“ aus Kapitel 3 (`src/data/packs/k3_pruefungen/rituale.json`). Du lieferst **alle Texte und Kampfwerte**, die die neuen Stücke brauchen: Trink-Texte, Halbgott- und Engel-Beschreibungen, die mythischen Kreaturformen, die Angst der Umstehenden, die beiden Ritualwächter mit Dialog und Phasen, Zeitung, Gerede, Lesestücke und Koop-Zeilen. Grafik dazu macht Paket CO.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** und keine Dateien unter `src/` anfassen: Du lieferst Daten und Texte als JSON und Markdown in deinen eigenen Ordner unter `docs/story/`. Der Einbau passiert separat. Andere Pakete laufen gleichzeitig.

- **Format:** JSON wie die bestehenden Pakete unter `src/data/packs/` (nur lesen). Texte auf Deutsch, Spieler wird mit „du“ angesprochen, Figuren sagen „Sie“ zum Spieler. Kurze Sätze, kein Pathos-Überschwang, keine Namen oder Begriffe aus fremden Büchern, Spielen oder Filmen.
- **Ton:** viktorianisch-industriell, melancholisch, trocken; Okkultes wirkt körperlich und unheimlich, nie blutig. Keine Schreie, keine Folter.
- **IDs:** nur Kleinbuchstaben, Ziffern, Unterstrich. Benutze die festen IDs unten genau so. Erfinde keine neuen Pfade, Sequenznamen, Städte, Karten oder Figuren; was fehlt, bekommt dein Paket-Präfix.
- **Prüfskript:** `docs/story/<paket>/pruefen.mjs` (Node ohne Pakete): alle JSON lesbar, alle Pflicht-IDs vorhanden, keine doppelten IDs, keine leeren Texte. Pull Request mit der Prüf-Ausgabe.
- **README:** `docs/story/<paket>/README.md` erklärt kurz, welche Datei wofür ist und was der Einbau anschließen muss (Flags, Ereignisse), damit der Einbau nur noch Zeilen ergänzt.

## Gemeinsame Eckdaten „Halbgott und Engel“ (gilt für die Pakete CO und CP)

Der Aufstieg läuft über Tränke: Sequenz 9 ist der Anfang, 1 die Spitze. Bis Sequenz 5 ist man ein starker Mensch. **Sequenz 4 macht einen zum Halbgott**, Sequenz 3 ist eine gute Steigerung, **Sequenz 2 ist die Engel-Stufe** (wieder ein brutaler Sprung wie 5 → 4), Sequenz 1 die letzte. Vor dem Trank für 4 und für 2 steht ein **richtig schweres Ritual**: eine Prüfung im Schwellenring von Dunscar (Karte `ds_schwellenring`, Kapitel 3) beziehungsweise im Grenzbezirk (Seq 2, neue Karte `hg_grenzbezirk`), bewacht von einem Wächter, der für jeden Pfad anders aussieht. Ab **50 % Verdauung** des Seq-4-Tranks kann der Spieler seine **mythische Kreaturform** annehmen: Gewöhnliche Menschen und schwache Wesen fallen bei ihrem Anblick um (Ohnmacht, kein Tod), stärkere Gegner zögern. Zu zweit (Koop) kann jeder Spieler seine eigene Form haben.

Zehn Pfade mit festen IDs (`pfad`), ihren Seq-4-, Seq-3- und Seq-2-Namen aus dem Spiel und der Kreaturform (ID `hg_form_<pfad>`; die Namen sind verbindlich):

| `pfad` | Pfad | Seq 4 (Halbgott) | Seq 3 | Seq 2 (Engel) | Kreaturform | Bild der Form |
|---|---|---|---|---|---|---|
| `laterne` | Pfad der Laterne | Dochtgezeichneter | Aschenprotokollant | Rußhorizont | **Leuchtgestalt** | mannshohe Gestalt aus Ruß und Docht, der Kopf eine ruhige Gaslampenflamme hinter Glas, Hände tropfen Licht |
| `faden` | Pfad des Fadens | Nahtträger | Bruchhefter | Stadtversäumer | **Nahtgespinst** | ein Leib aus gespannten Fäden und Nähten, zu viele dünne Arme, zwischen ihnen gespannte Netze |
| `maske` | Pfad der Maske | Gesichtsvermieter | Rollenverwahrer | Publikumsfremder | **Hundertmiene** | Körper aus übereinander gelegten Porzellanmasken, die Vorderseite wechselt das Gesicht, hinten leer |
| `echo` | Pfad des Echos | Stilleverwahrer | Nachrufgefäß | Schweigeufer | **Hohlklang** | glockenförmige, halbdurchsichtige Gestalt, im Inneren mehrere Kehlen, die Luft um sie zittert |
| `kessel` | Pfad des Kessels | Rückstandsbrauer | Kreislaufgefäß | Abwärmesammler | **Siedeleib** | Körper aus Kupferrohr und Glas, in dem farbige Flüssigkeiten kreisen, Dampf aus den Schultern |
| `eisen` | Pfad des Eisens | Lastnieter | Gegenlast | Stadtwiderlager | **Nietkoloss** | gedrungener Koloss aus genieteten Trägern, der Rücken ein Brückenbogen, Schritte drücken Steine ein |
| `schluessel` | Pfad des Schlüssels | Schwellenlücke | Riegelabwesenheit | Innenrand | **Türhüter** | hagere Gestalt voller Schlüssellöcher, in der Brust eine offene Tür, aus der schwaches Licht fällt |
| `sq_waage` | Pfad der Waage | Pfandkörper | Saldenhüter | Schuldgegengewicht | **Gewichtsträger** | Gestalt mit Waagarmen statt Schultern, an Ketten hängende Gewichte aus Messing, gesenkter Kopf |
| `sq_moor` | Pfad des Moores | Schichtträger | Namensediment | Vergessensufer | **Torfleib** | Riese aus geschichtetem Torf, in den Schichten alte Namen als helle Linien, Moos auf den Schultern |
| `sq_uhr` | Pfad der Uhr | Zwischentakter | Fristlauscher | Wiederkehrsaum | **Pendelgestalt** | schlanke Uhrwerkgestalt mit doppeltem Umriss, der zweite einen Takt hinterher, Pendel statt Herz |

Spielerfiguren: Spieler 1 nutzt die Sheets mit Präfix `A_player`/`battle_player`, Spieler 2 die Looks `p2a` (Mütze) und `p2b` (Melone). Farben wie in `public/sprites/characters/` und `battle/`.

Wächter der Rituale (feste IDs, Datenpaket CP beschreibt die Kämpfe, Grafikpaket CO die Sheets):
- `hg_schwellenwaechter`: Boss des Seq-4-Rituals im Schwellenring. Eine Gestalt aus Kalk und Bahnsignalen, gesichtslos, trägt das **Siegel des Pfades** des Spielers vor der Brust (zehn Siegel als Overlay). Drei Phasen: Prüfung (schlägt nur, wenn der Spieler angreift), Zorn, Schwelle (letzter Rest, er öffnet sich). Nicht tödlich: Er zerfällt zu Kalk und wird beim nächsten Besuch wieder stehen.
- `hg_grenzwaechter`: Boss des Seq-2-Rituals im Grenzbezirk. Größer, aus Nebel und Grenzsteinen, mit einem zweiten, leeren Umriss, der dem Spieler ähnelt. Drei Phasen wie oben, in der letzten kämpft der leere Umriss mit.

Werte, die schon feststehen (nur zur Einordnung, nicht ändern): Verdauung ab Seq 6 ist zehnmal langsamer je Stufe; Bosse, Elite, Gefahrengebiete, Rituale und Treffen verdauen zusätzlich. Seq 5 bringt dmg_mult 1,35 und 0,8 erlittenen Schaden. **Seq 4 soll darüber nochmals ein Sprung sein wie 5 über 6, Seq 2 wieder einer wie 4 über 5.** Gegner bis Kapitel 3 reichen etwa bis Seq-5-Stärke; Kapitel 4 (Calderwick) und 5 (Briarholt) werden auf Halbgott-Stärke angehoben.

## 1. Trink-Texte und Stufenbeschreibungen (`trinktexte.json`)
Je Pfad und Stufe 4, 3, 2 ein Eintrag `{ "pfad", "seq", "trinken", "ankunft", "erste_nacht", "stufe_kurz" }`:
- `trinken` (4 bis 6 Sätze): was der Spieler beim Trinken erlebt. Seq 4: Der Körper hört auf, nur Körper zu sein; die Stadt wird klein; der Grundsatz des Pfades wird zur Wahrnehmung. Seq 3: ruhiger, eine Vertiefung. Seq 2: der zweite Umriss, das Gefühl, in der eigenen Haut Gast zu sein, Furcht vor sich selbst.
- `ankunft` (2 Sätze): Meldung im Notizbuch nach dem Trank, sagt klar „Halbgott“ (Seq 4) beziehungsweise „Engel“ (Seq 2), ohne Pathos.
- `erste_nacht` (3 Sätze): was in der ersten Nacht passiert (Träume, Dinge im Zimmer, die auf den Spieler reagieren).
- `stufe_kurz` (1 Satz): für die Pfadkarte.
Zusammen 30 Einträge.

## 2. Kreaturformen (`kreaturform.json`)
Je Pfad `{ "id": "hg_form_<pfad>", "pfad", "name", "beschreibung", "karte", "annehmen", "ablegen", "zu_lange", "koop_sicht" }`:
- `beschreibung` (3 bis 4 Sätze): die Form, wie Paket CO sie zeichnet (Tabelle oben), aus Sicht des Spielers.
- `karte` (1 bis 2 Sätze): was man auf der Karte sieht, wenn man in Form unterwegs ist.
- `annehmen`/`ablegen` (je 1 bis 2 Sätze): Meldungen beim Wechsel. Ab 50 % Verdauung möglich; unter 50 %: eigene Zeile `gesperrt` (1 Satz, erklärt, dass der Trank noch nicht weit genug verdaut ist).
- `zu_lange` (2 Sätze): Warnung, wenn man die Form zu lange hält (Unruhe steigt).
- `koop_sicht` (1 Satz): was Spieler 2 sieht, wenn Spieler 1 die Form annimmt (und umgekehrt).

Dazu `furcht.json`: die Reaktion der Umstehenden auf die Form.
- `klassen`: `buerger` (gewöhnliche Menschen: fallen sofort um), `polizei` (fallen um, zwei Zeilen danach im Revier), `haendler` (fallen um, Laden bleibt einen Tag zu), `zirkel` (Mitglieder geheimer Treffen: fallen nicht, senken den Blick, eine Zeile), `beyonder_schwach` (Gegner bis Seq 7: fliehen oder fallen), `beyonder_mittel` (Seq 6 bis 5: zögern, erster Zug entfällt), `beyonder_stark` (Seq 4 und höher, Bosse: unbeeindruckt, eine Zeile Spott oder Respekt), `tiere` (fliehen), `sekten` (knien, werben später um den Spieler). Je Klasse `wirkung` (ein Wort aus: umfallen, fliehen, zoegern, senken, knien, nichts), `dauer_sek`, 4 Textzeilen `beim_anblick`, 2 Zeilen `danach`.
- `folgen`: Was es kostet, sich in der Stadt zu zeigen: Ansehen bei der Polizei sinkt, Gerede über „die Gestalt“, Zeitungsnotiz nach dem dritten Mal, Sekten-Umtriebe steigen um eins. Als Liste `{ "ausloeser", "wirkung", "text" }` mit 8 Einträgen; Zahlen als Vorschlag.
- `ausnahmen`: 12 benannte Figuren aus dem Spiel, die anders reagieren (Hedda, Kittering, Dr. Varga, die Fasserin Oda Kessel, Zirkelgastgeber, Starling falls lebend, je eine Zeile). Figur-IDs aus `src/data/` nur lesen; wenn eine ID unsicher ist, den Namen nennen und `id` leer lassen.

## 3. Die Wächter-Rituale (`rituale.json`, `dialogues.json`, `encounters.json`)
Zwei Rituale je Pfad, zusammen 20 Einträge in `rituale.json`:
`{ "pfad", "seq": 4|2, "id": "hg_ritual_<pfad>_<seq>", "name", "map": "ds_schwellenring"|"hg_grenzbezirk", "vorbereitung": [3 Schritte], "consumes": {Zutaten aus den bestehenden Rezepten der Stufe, nur lesen}, "waechter": "hg_schwellenwaechter"|"hg_grenzwaechter", "desc", "bestanden", "gescheitert", "friedlich" }`.
- `vorbereitung`: drei Schritte, die vorher in Dunscar beziehungsweise auf der Reise zu erledigen sind (eine Person befragen, einen Gegenstand holen, eine Tageszeit abwarten). Keine neuen Karten außer `hg_grenzbezirk`.
- `friedlich`: eine Lösung ohne Sieg über den Wächter (ein Geständnis, eine Last ablegen, einen Namen aussprechen), die zum Grundsatz des Pfades passt und **härter** ist als der Kampf (eine Bedingung wie „ohne Trank im Rucksack“ oder „bei Verdauung 100“). Als `{ "bedingung", "text" }`.
- `gescheitert`: was passiert, wenn man verliert: Ohnmacht, Aufwachen am Rand, Zutaten weg, der Wächter steht wieder. Nie Game Over.

`encounters.json`: die beiden Wächter als Kampf im Format von `src/data/packs/k3_pruefungen/encounters.json` (nur lesen), je drei Phasen:
- `hg_schwellenwaechter`: Seq-4-Prüfung, deutlich über den `k3p_*`-Bossen (die haben 170 bis 220 Leben). Vorschlag 520 Leben, `min_seq` 5, Phase 1 „Prüfung“ (schlägt nur zurück), Phase 2 „Zorn“ ab 60 % (Kalkstaub-Welle, trifft alle, senkt Nerven), Phase 3 „Schwelle“ ab 25 % (öffnet die Brust: ein Zug Zeit, ihn mit dem Pfadsiegel zu treffen, sonst heilt er 15 %). Je Pfad eine Abwandlung `siegel_wirkung` (1 Satz plus ein Wert: was der Schlag mit dem Siegel bewirkt).
- `hg_grenzwaechter`: Seq-2-Prüfung, Vorschlag 1400 Leben, `min_seq` 3, dazu der leere Umriss als zweiter Gegner `hg_leerer_umriss` (kopiert die letzte Fähigkeit des Spielers, 300 Leben) ab Phase 3.
- Beute: keine Gegenstände, nur das Flag des Rituals und ein Bestiariumseintrag je Wächter (`bestiarium.json`, 3 Sätze plus Schwäche).
- Koop: beide Spieler müssen die Stufe haben; Feld `koop` mit zwei Zeilen, wie der Wächter zu zweit handelt (er prüft beide nacheinander).

`dialogues.json`: je Wächter ein Gesprächsbaum im Format der bestehenden Dialoge (Knoten mit `text`, `options`, `effects`, `requires`): Ankunft, drei Fragen des Wächters an den Spieler (sie prüfen den Grundsatz des Pfades, je Pfad eigene Frage: Feld `je_pfad`), Beginn des Kampfes, Phase-2- und Phase-3-Zeile, Sieg, friedliche Lösung, Niederlage, Wiederkehr. Zusammen etwa 2 x 14 Knoten plus 2 x 10 Pfadfragen.

## 4. Stadt und Welt (`zeitung.json`, `gerede.json`, `lesestuecke.json`)
- `zeitung.json`: 12 Meldungen: erster Halbgott in der Stadt (Gerücht), die Gestalt am Hafen, Ohnmachtswelle am Markt, Polizei sucht Zeugen, Kirche spricht von Engeln, Sekten jubeln, Kurblatt Briarholt, Calderwicker Anzeiger. Mit `requires_flags` als Vorschlag (`seq4_erreicht`, `kreaturform_gezeigt_3`, `seq2_erreicht`, Stadt-Flags).
- `gerede.json`: 60 Zeilen je Stadt-Gruppe (Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt, je 12), nach Stand: Halbgott erreicht, Form gezeigt, Engel erreicht. Format wie `src/data/packs/k3_leben/gerede.json`.
- `lesestuecke.json`: 10 Lesestücke (Traktate, Briefe, Akademie-Notizen) über Halbgötter, Engel, die Schwelle und den Grenzbezirk, je 120 bis 200 Wörter; eins davon warnt vor dem „zweiten Umriss“ der Seq 2.

## 5. Koop (`koop.json`)
20 Geplauder-Zeilen zwischen Spieler 1 und 2 zu den neuen Stufen (ungleiche Stufen: einer Halbgott, einer nicht; beide; einer in Form), 6 Kampfsprüche in Form, 4 Zeilen, wenn ein Spieler beim Wächter scheitert und der andere ihn trägt.

## 6. Abgabe
Alle Dateien oben, `README.md` (Anschluss: Flags `seq4_erreicht`, `seq2_erreicht`, `kreaturform_an`, `hg_ritual_<pfad>_<seq>`; Ereignisse `form_annehmen`, `form_ablegen`, `furcht`), `pruefen.mjs`, ein Pull Request mit Prüf-Ausgabe und Wortzahl.
