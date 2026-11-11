# Codex-Paket DI: Post und Briefe (Briefe von Figuren über das ganze Spiel, Antworten, Pakete)

**Schreibt nach:** `docs/story/post/`

Neu: Der Spieler bekommt **Post**. Figuren aus früheren Städten schreiben ihm Briefe, die bei der Ankunft in einer neuen Stadt, nach wichtigen Flags oder nach Tagen eintreffen (Postamt, Büro oder das Haus aus Paket DG). Briefe erzählen, was aus den Leuten wurde, bringen kleine Beilagen (Geld, eine Zutat, einen Hinweis) und erlauben zwei bis drei Antworten, die spätere Briefe verändern. Weil keine Rückreise in frühere Städte möglich ist, sind Briefe der einzige Weg, die alten Figuren wiederzusehen. Reine Texte, keine Grafik (die Brief-Oberfläche gibt es als Lesestück-Rahmen; ein Umschlag-Icon liegt bei Paket DM).

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** und keine Dateien unter `src/` anfassen: Du lieferst Daten und Texte als JSON und Markdown in deinen eigenen Ordner unter `docs/story/`. Der Einbau passiert separat. Andere Pakete laufen gleichzeitig.

- **Format:** JSON wie die bestehenden Pakete unter `src/data/packs/` (nur lesen). Texte auf Deutsch, Spieler wird mit „du“ angesprochen, Figuren sagen „Sie“ zum Spieler. Kurze Sätze, kein Pathos-Überschwang, keine Namen oder Begriffe aus fremden Büchern, Spielen oder Filmen.
- **Ton:** viktorianisch-industriell, melancholisch, trocken; Okkultes wirkt körperlich und unheimlich, nie blutig. Keine Schreie, keine Folter.
- **IDs:** nur Kleinbuchstaben, Ziffern, Unterstrich. Benutze die festen IDs unten genau so. Erfinde keine neuen Pfade, Sequenznamen, Städte, Karten oder Figuren; was fehlt, bekommt dein Paket-Präfix.
- **Prüfskript:** `docs/story/<paket>/pruefen.mjs` (Node ohne Pakete): alle JSON lesbar, alle Pflicht-IDs vorhanden, keine doppelten IDs, keine leeren Texte. Pull Request mit der Prüf-Ausgabe.
- **README:** `docs/story/<paket>/README.md` erklärt kurz, welche Datei wofür ist und was der Einbau anschließen muss (Flags, Ereignisse), damit der Einbau nur noch Zeilen ergänzt.

## Eckdaten
- Absender: bestehende Figuren mit Beziehungs-Daten (`src/data/packs/beziehungen/`, `k2_gilde`, `k3_leben`, `k4_nebenquests`, `k5_nebenquests`, nur lesen) und Hauptfiguren der Fälle. Jede Figur schreibt in ihrer Stimme aus den Dialogen.
- Format: `briefe.json`, je Brief `{ "id": "post_<absender>_<n>", "absender": <npc-id>, "stadt": <city>, "ausloeser": { "requires_flags": [...], "tage_nach": n, "beziehung_min": n }, "betreff" (3 bis 6 Wörter), "text" (80 bis 220 Wörter), "beilage": { item-id oder schilling }, "antworten": [ { "text", "folge_flag", "folge_brief" } ], "koop": optionale Zeile, wenn zwei Spieler }`.
- Flags `post_<id>_gelesen`, `post_antwort_<id>_<n>`; Antworten sind Flags, keine Freitexte.

## 1. Briefreihen (mindestens 90 Briefe)
- **Kettlegate (30):** 10 Absender x 3 Briefe entlang Kapitel 2 bis 6, darunter Felix' Schwester, der Revier-Sergeant, die Weberin, Elsbeth Price, Martha, ein Kind aus dem Waisenhaus, Dunn Crane, der Zeitungsjunge, eine Figur der Stillen Waage, der Fasserin-Lehrling. Jede Reihe hat einen Bogen (ein Problem, das sich über drei Briefe löst oder nicht, je nach Antwort).
- **Wexmoor (20):** Maud Keel, Krabbe, eine Figur der Lichtlosen, der Maler, die Moorbraut-Überlebende, der Fährmann (je 3 bis 4).
- **Dunscar (16):** Schichtbund, Oda Kessel (schreibt nur einmal, drei Zeilen), Zugpersonal, eine Prüfungs-Figur.
- **Calderwick (12), Briarholt (8):** Bürgen, Kurgäste, Patienten.
- **Besondere (4):** ein Brief ohne Absender, der jedes Kapitel einmal kommt und im Finale erklärt wird (der Brief aus Fall 9, der den Namen des Spielers nach Varrowmouth trug; Anschluss an Paket CT).
- Antworten: je Brief 2 bis 3; mindestens 20 Briefe sind Folgebriefe, die nur nach einer bestimmten Antwort kommen.

## 2. Pakete und Beilagen (`beilagen.json`)
Höchstens 16 Beilagen mit Gewicht und Wert: Geld (klein), eine Zutat der Heimatstadt, ein Lesestück, ein Foto (neues Item `post_foto_<n>`, 6 Stück, zeigt eine Figur, Grafik später), ein Schlüssel ohne Schloss (Rätsel über drei Briefe).

## 3. Postamt und Zustellung (`post.json`)
Zeilen des Postschalters je Stadt (6 Städte x 4: nichts da, ein Brief, mehrere, Paket), Notizbuch-Hinweise (6), Meldung „Post im Büro“ (3), Koop (4: Briefe an beide, Brief nur an Spieler 2). Regel-Spezifikation im README: Prüfung der Auslöser einmal je Spieltag und bei Stadtwechsel, höchstens 2 Briefe je Tag, Reihenfolge nach Kapitel, ungelesene Briefe bleiben liegen.

## 4. Abgabe
`briefe.json`, `beilagen.json`, `post.json`, `README.md` (Absenderliste mit Beziehungs-Quelle, Flag-Liste, Briefbögen als Tabelle), `pruefen.mjs` (alle Absender-IDs existieren in den gelesenen Packs, keine Antwort ohne Folge, Wortzahl je Brief im Rahmen), Pull Request mit Prüf-Ausgabe und Gesamtwortzahl.
