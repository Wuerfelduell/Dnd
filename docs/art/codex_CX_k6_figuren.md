# Codex-Paket CX: Kapitel 6 Figuren (Varrowmouth-Einwohner, Pegelrat, Charakterbögen und Dialoge)

**Schreibt nach:** `docs/story/k6_figuren/`

Du lieferst die **Menschen von Varrowmouth** als Texte: Charakterbögen, Tagespläne, Stimmungen, Beziehungen, Gerede und Nebengespräche. Die drei Verbündeten und die Pegelherrin haben feste IDs und Namen (Eckdaten); die sieben Zollherren und zwölf weitere Einwohner benennst du. Hauptakte macht Paket CT, Grafik der Figuren Paket CY (es braucht deine Beschreibungen: schreibe sie so, dass ein Zeichner danach arbeiten kann).

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** und keine Dateien unter `src/` anfassen: Du lieferst Daten und Texte als JSON und Markdown in deinen eigenen Ordner unter `docs/story/`. Der Einbau passiert separat. Andere Pakete laufen gleichzeitig.

- **Format:** JSON wie die bestehenden Pakete unter `src/data/packs/` (nur lesen). Texte auf Deutsch, Spieler wird mit „du“ angesprochen, Figuren sagen „Sie“ zum Spieler. Kurze Sätze, kein Pathos-Überschwang, keine Namen oder Begriffe aus fremden Büchern, Spielen oder Filmen.
- **Ton:** viktorianisch-industriell, melancholisch, trocken; Okkultes wirkt körperlich und unheimlich, nie blutig. Keine Schreie, keine Folter.
- **IDs:** nur Kleinbuchstaben, Ziffern, Unterstrich. Benutze die festen IDs unten genau so. Erfinde keine neuen Pfade, Sequenznamen, Städte, Karten oder Figuren; was fehlt, bekommt dein Paket-Präfix.
- **Prüfskript:** `docs/story/<paket>/pruefen.mjs` (Node ohne Pakete): alle JSON lesbar, alle Pflicht-IDs vorhanden, keine doppelten IDs, keine leeren Texte. Pull Request mit der Prüf-Ausgabe.
- **README:** `docs/story/<paket>/README.md` erklärt kurz, welche Datei wofür ist und was der Einbau anschließen muss (Flags, Ereignisse), damit der Einbau nur noch Zeilen ergänzt.

## Gemeinsame Eckdaten „Kapitel 6: Varrowmouth“ (gilt für die Pakete CT bis DA)

Nach Briarholt (Kapitel 5) führt der letzte Weg ans Meer: **Varrowmouth**, die alte Zoll- und Hafenhauptstadt an einer Flussmündung, in der die Gezeiten die Stadt zweimal am Tag umbauen. Bei Ebbe liegen Schlickgassen, Wrackfelder und die unteren Zollkeller frei, bei Flut sind sie Wasser und nur die Stege, Brücken und Oberstraßen begehbar. Die Stadt wird vom **Pegelrat** regiert, sieben Zollherren, die ihre Macht aus einer Sache beziehen, die sie „das Register“ nennen: ein Verzeichnis aller Namen, die je durch den Hafen kamen. Wer im Register steht, kann die Stadt nicht verlassen, ohne dass der Rat es weiß. Der Spieler kommt mit einem Namen an, der schon drinsteht, obwohl er nie hier war. Kapitel 6 ist das **Finale des Spiels**: hier liegt der Grenzbezirk für das Seq-2-Ritual (Karte `hg_grenzbezirk`, siehe Pakete CO/CP, im Norden der Stadt hinter dem Zollzaun) und hier stehen die **Letzten Register**, die Ritualorte für Sequenz 1 (je Pfad eine Karte `vm_register_<pfad>`, siehe Paket DD). Kapitel 6 endet mit dem Aufstieg auf Sequenz 1 oder dem bewussten Verzicht darauf.

Feste IDs:
- Stadt `varrowmouth`, Präfixe: Karten `vm_`, Einwohner und Sprecher `vmn_`, Gegner `vme_`, Gegenstände `vmi_`, Musik `vm_`, Soundgruppe `varrowmouth`, Flags `k6_*`. Ankunfts-Flag `k6_arrived`, Abschluss `k6_done`.
- Stadtteile und Außenkarten (Paket CU legt sie an): `vm_zollhafen` (Ankunft, Zollhaus, Pegelturm), `vm_stegviertel` (Pfahlbauten, Markt auf Stegen), `vm_schlickgassen` (nur bei Ebbe), `vm_oberstrasse` (Reederhäuser, Pegelrat), `vm_wrackfeld` (Gefahrengebiet, Ebbe), `vm_leuchtbank` (Sandbank mit dem alten Leuchtfeuer, Gefahrengebiet), `vm_registerkeller` (Finale), `vm_grenzzaun` (Übergang zu `hg_grenzbezirk`).
- Gezeiten: feste Zustände `ebbe` und `flut`, Wechsel alle 6 Spielminuten (Vorschlag), Flag `gezeit` als flüchtiges Flag `gezeit_ebbe`/`gezeit_flut`; je Karte steht, was sich ändert. Die Pegeluhr am Zollhafen zeigt den Stand.
- Der Pegelrat (sieben Zollherren, Sprecher-IDs `vmn_rat_1` bis `vmn_rat_7`, Namen vergibt Paket CX), seine Vorsitzende **Ismay Harrow, die Pegelherrin** (`vmn_pegelherrin`, Endgegnerin, Boss-ID `pegelherrin`, ein Wesen auf Stufe eines Engels mit einem fremden Pfad „Register“, der nicht spielbar ist).
- Verbündete: **Tam Verrin** (`vmn_tam_verrin`), Lotsin ohne Eintrag, die den Spieler in die Stadt schmuggelt; **Pater Osric Dale** (`vmn_osric_dale`), Leuchtfeuerwärter und letzter Schreiber des alten Registers; **Nell Quarrie** (`vmn_nell_quarrie`), Kind aus den Schlickgassen, das Namen aus dem Register „vergessen“ kann.
- Gegner (Paket CZ beschreibt sie): `vme_zollgeist` (Beamter ohne Gesicht mit Stempel), `vme_gezeitenlaeufer` (Wasserleib auf Stelzen), `vme_salzkruste` (verkrusteter Ertrunkener), `vme_tauwerk` (lebendes Seil), `vme_hafenkraehe` (Schwarm), `vme_pegelknecht` (Wächter des Rats, Elite), Bosse `wrackmutter` (Wrackfeld), `leuchtfeuerwaechter` (Leuchtbank), `pegelherrin` (Finale, zwei Phasen).
- Zirkel in Varrowmouth: **Die Unverzeichneten** (`unverzeichnete`), geheimer Zirkel der Namenlosen, Treffpunkt im Kielraum eines Wracks; Zugang über Tam Verrin ab Beziehung +3.
- Anreise: aus den vier Briarholt-Enden (Paket CG, `docs/story/k5_akte/epiloge.json`, nur lesen) per Küstenbahn und Fähre; keine Rückreise in frühere Städte (feste Regel des Spiels).
- Sequenzen: Der Spieler kommt mit Sequenz 4 oder 3 an. Seq 2 (Engel) wird im Grenzbezirk möglich, Seq 1 erst nach dem Fall der Pegelherrin. Koop: beide Spieler stehen im Register, nur einer kann am Ende das Register schließen; wer es tut, ist eine Entscheidung mit zwei Epilogen.

## 1. Charakterbögen (`figuren.md` und `npcs.json`)
Je Figur ein Bogen (Markdown, 120 bis 200 Wörter): Name, ID, Alter, Beruf, Aussehen in zwei Sätzen (Kleidung, eine auffällige Sache, Farbe für den Zeichner), Haltung zum Register, Geheimnis, Sprechweise (zwei Beispielsätze), Ort und Tageszeiten, Gezeitenbindung (wo bei Ebbe, wo bei Flut). `npcs.json` dazu im Format `docs/story/k5_orte/npcs.json` (nur lesen).

Figuren:
- Feste: Tam Verrin (`vmn_tam_verrin`, Lotsin, Ende 30, Ölzeug, Narbe von einer Trosse, lacht nur bei Ebbe), Osric Dale (`vmn_osric_dale`, Leuchtfeuerwärter, über 70, Schreiber, Hände voller Tinte), Nell Quarrie (`vmn_nell_quarrie`, Kind, 11, Schlickgassen, trägt eine Zollmütze ohne Kokarde), Ismay Harrow (`vmn_pegelherrin`, Pegelherrin, Alter unbestimmbar, graues Amtskleid mit Wasserlinie auf Brusthöhe, Gesicht wie eine Gezeitentabelle: zu viele Linien).
- Sieben Zollherren `vmn_rat_1` bis `vmn_rat_7`: je ein Amt (Zoll, Pegel, Register, Hafen, Zunft, Kirche, Armenhaus), einer lügt für den Spieler, zwei sind längst keine Menschen mehr (sie bemerken es nicht), einer will das Register verbrennen. Unterschiedliche Alter und Herkunft, keine Klischee-Bösewichte.
- Zwölf Einwohner: Zollschreiber `vmn_zollschreiber` (stumm, schreibt Antworten), Stegmarkt-Fischerin, Kantinenwirt, Reeder-Apothekerin, Fährmann, Kielraum-Wirtin der Unverzeichneten, eine Schlickgassen-Mutter, ein Pegeluhr-Mechaniker, ein Zollknecht mit Gewissen, eine Taucherin, ein Vertreter aus Kettlegate (kennt den Spieler aus Fall 9, Zeuge), ein Kurgast aus Briarholt (Brücke zu Kapitel 5).

## 2. Tagespläne und Gezeiten (`tagesplaene.json`)
Je Figur Zeitfenster (Spieluhr 6 bis 24 Uhr) mit Karte, Position-Hinweis, Haltung und Gezeitenregel (`"ebbe": {...}, "flut": {...}`), Format wie `docs/story/kg_leben/` (nur lesen).

## 3. Beziehungen (`beziehungen.json`)
Für Tam, Osric, Nell, zwei Zollherren und die Kielraum-Wirtin: Stufen -3 bis +5 im Format `src/data/packs/beziehungen/` (nur lesen), je Stufe 2 Begrüßungen, 3 passende Geschenke aus bestehenden Items und `vmi_*`, 2 abgelehnte Geschenke mit Begründung, eine Freischaltung (Tam: Zirkel ab +3 und Boot jederzeit ab +4; Osric: Lesestück des alten Registers; Nell: ein Name wird gelöscht, Zollgeister vergessen den Spieler einen Tag).

## 4. Gespräche und Gerede (`dialogues.json`, `gerede.json`)
- `dialogues.json`: je Einwohner ein Alltagsgespräch (4 bis 8 Zeilen) in zwei Fassungen (Ebbe, Flut) und ein Gespräch nach `k6_done` je Ende (4 Enden x 4 Zeilen). Zollherren: je ein Vorgespräch vor Akt III.
- `gerede.json`: 80 Zeilen Stadtgerede: 20 allgemein, 20 nur Ebbe, 20 nur Flut, 10 nach der Wrackmutter, 10 nach dem Leuchtfeuer; Format wie `src/data/packs/kg_leben/gerede.json`.

## 5. Stimmungen (`stimmungen.json`)
Für die vier festen Figuren und drei Zollherren: welche der acht Emotionen (neutral, misstrauisch, erschrocken, lächelnd, wütend, traurig, nachdenklich, entschlossen) in welchen Szenen (Flag oder Dialog-ID), als Vorschlag für den Einbau.

## 6. Abgabe
`figuren.md`, `npcs.json`, `tagesplaene.json`, `beziehungen.json`, `dialogues.json`, `gerede.json`, `stimmungen.json`, `README.md` (Anschluss, Liste der 23 Figuren mit IDs für Paket CY), `pruefen.mjs`, Pull Request mit Prüf-Ausgabe und Wortzahl.
