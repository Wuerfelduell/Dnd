# Codex-Paket DD: Sequenz 3 und Sequenz 1 als Texte (Prüfungen Seq 3, Letzte Register, Abspann je Pfad, Verzicht)

**Schreibt nach:** `docs/story/seq31/`

Die Sequenzen 4 bis 1 haben Namen, Fähigkeiten, Zutaten und einen Ritual-Satz in `src/data/packs/sequenzen/seq_4_bis_1.json` (nur lesen); Paket CP liefert die großen Rituale für 4 und 2. Es fehlen **die Prüfungen für Sequenz 3** (zehn Pfade, in Calderwick oder Briarholt ablegbar) und **die Letzten Register für Sequenz 1** (zehn Ritualorte in Varrowmouth, Finale), außerdem der **Verzicht** als gleichwertiges Ende, Welt-Reaktionen, Zeitung, Gerede, Lesestücke und Koop. Grafik macht Paket DC.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** und keine Dateien unter `src/` anfassen: Du lieferst Daten und Texte als JSON und Markdown in deinen eigenen Ordner unter `docs/story/`. Der Einbau passiert separat. Andere Pakete laufen gleichzeitig.

- **Format:** JSON wie die bestehenden Pakete unter `src/data/packs/` (nur lesen). Texte auf Deutsch, Spieler wird mit „du“ angesprochen, Figuren sagen „Sie“ zum Spieler. Kurze Sätze, kein Pathos-Überschwang, keine Namen oder Begriffe aus fremden Büchern, Spielen oder Filmen.
- **Ton:** viktorianisch-industriell, melancholisch, trocken; Okkultes wirkt körperlich und unheimlich, nie blutig. Keine Schreie, keine Folter.
- **IDs:** nur Kleinbuchstaben, Ziffern, Unterstrich. Benutze die festen IDs unten genau so. Erfinde keine neuen Pfade, Sequenznamen, Städte, Karten oder Figuren; was fehlt, bekommt dein Paket-Präfix.
- **Prüfskript:** `docs/story/<paket>/pruefen.mjs` (Node ohne Pakete): alle JSON lesbar, alle Pflicht-IDs vorhanden, keine doppelten IDs, keine leeren Texte. Pull Request mit der Prüf-Ausgabe.
- **README:** `docs/story/<paket>/README.md` erklärt kurz, welche Datei wofür ist und was der Einbau anschließen muss (Flags, Ereignisse), damit der Einbau nur noch Zeilen ergänzt.

## Eckdaten
- Pfade und Namen wie in der Tabelle in Paket DC; Seq-1-Namen und `ritual.desc`-Sätze stehen in `seq_4_bis_1.json` und sind fest (dein Text baut sie aus, widerspricht ihnen nicht). Das Feld `ritual.map` dort trägt `neu:Letztes Register für <Pfad>`: Diese Karten heißen bei dir `vm_register_<pfad>` (Varrowmouth, Kapitel 6, Paket CU/CW/DC); Seq-3-Prüfungen finden auf bestehenden Karten statt (Calderwick `cw_*`, Briarholt `bh_*`, Dunscar `ds_*`; IDs aus `src/data/packs/k4_orte/maps.json`, `k5_orte/maps.json`, `k3_orte/maps.json`, nur lesen).
- Seq 3 ist eine Prüfung ohne Boss: eine Aufgabe in der Welt mit drei Teilen und einer Probe (Kampf gegen einen Elite-Gegner aus dem Vorrat `src/data/packs/vorrat_gegner/`, nur lesen) oder einer friedlichen Lösung. Seq 1 ist **kein Kampf**: Das Letzte Register ist eine Zeugen-Probe (der `ritual.desc`-Satz nennt Zeugen aus beiden Städten); der Spieler muss drei Dinge aus dem ganzen Spiel vorlegen (Beleg, Person, Verzicht), danach folgt der Aufstieg oder der Verzicht.
- Sequenz 1 wird erst nach `k6_done` mit Ende `k6_ende_schliessen` oder `k6_ende_uebergeben` (später) möglich (Paket CT). Flags: `seq3_pruefung_<pfad>_done`, `seq1_register_<pfad>_done`, `seq1_verzicht`.

## 1. Zehn Seq-3-Prüfungen (`pruefungen_seq3.json`)
Je Pfad: `id` (`s3p_<pfad>`), Titel, Ort (bestehende Karte), Auftraggeber (bestehende Figur aus der Stadt, ID nachschlagen), `teile` (3, je Beschreibung, Hinweis, Flag), `probe` (Elite-Gegner-ID aus dem Vorrat mit Begründung oder `friedlich` mit Bedingung), `belohnung_text`, Dialoge (Einleitung 6 bis 10 Zeilen, Abschluss 4 bis 6, Scheitern 3), `zutaten_hinweis` (wo die Seq-3-Zutaten aus `seq_4_bis_1.json` zu finden sind, mit bestehenden Zonen-IDs). Jede Prüfung muss zum Pfad passen (Laterne: einen Beleg veröffentlichen, der dem Spieler selbst schadet; Maske: eine Rolle aufgeben; Waage: eine Schuld ohne Pfand einlösen).

## 2. Zehn Letzte Register (`register_seq1.json`)
Je Pfad: Karte `vm_register_<pfad>` (Beschreibung des Raums in 3 Sätzen für Paket DC, 24x16, Props-Vorschläge), drei Zeugen (je einer aus einer früheren Stadt, einer aus Varrowmouth, einer aus dem Pfad: alle bestehende IDs oder Figuren aus Paket CX), die drei vorzulegenden Dinge (`beleg`: ein Item oder Flag aus dem Spiel, `person`: eine Beziehung ≥ +3, `verzicht`: etwas, das der Spieler hergibt: ein Artefakt, einen Zirkel, eine Fähigkeit), Dialog der Zeugen (je 4 Zeilen, drei Haltungen: für, gegen, unentschieden), die Probe als Gesprächsbaum (8 bis 12 Knoten, zwei falsche Wege, kein Kampf), der Aufstiegstext (120 bis 180 Wörter, in der zweiten Person, körperlich, still), die `seq_1_welt`-Folgen (3 Sätze, was sich in der Welt ändert: Preise, Gerede, Gegner weichen; als Vorschlag im README mit Zahlen).

## 3. Verzicht (`verzicht.json`)
Ein gleichwertiges Ende für jeden Pfad: der Spieler legt die Flasche ab. Je Pfad ein Verzichtstext (100 bis 150 Wörter), eine Zeile je Zeuge, eine Epilog-Karte, ein Abspann-Satz. Dazu 6 Zeilen, mit denen das Spiel vorher warnt, ohne zu drängen (`vor_dem_verzicht`).

## 4. Welt-Reaktionen (`reaktionen.json`)
Wie Figuren auf Seq 3 und Seq 1 reagieren (Klassen wie in CP: `buerger`, `polizei`, `haendler`, `zirkel`, `beyonder_schwach`, `beyonder_mittel`, `beyonder_stark`, `tiere`, `sekten`): je Klasse und Stufe 3 Zeilen (54), plus 10 Zeilen `koop` (ein Spieler Seq 1, der andere nicht).

## 5. Zeitung, Gerede, Lesestücke
`zeitung.json`: 12 Meldungen (Seq 3: Gerüchte je Stadt; Seq 1: 4 Meldungen nach Pfadgruppe, Verzicht: 2). `gerede.json`: 40 Zeilen. `lesestuecke.json`: 10 Lesestücke je 120 bis 180 Wörter: je Pfad ein Text über die Stufe Eins aus Sicht eines Vorgängers, der nicht angekommen ist.

## 6. Abgabe
Alle JSON, `README.md` (Anschluss: Flags, Karten `vm_register_<pfad>`, Zeugen-Prüfung als Datenstruktur, Welt-Folgen mit Zahlen, Abspann-Reihenfolge), `pruefen.mjs`, Pull Request mit Prüf-Ausgabe und Wortzahl.
