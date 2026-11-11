# Codex-Paket CT: Kapitel 6 „Die Stadt, die das Meer vergaß“ (Varrowmouth, Hauptakte)

**Schreibt nach:** `docs/story/k6_akte/`

Du schreibst die **Hauptgeschichte des Finales**: Kapitel 6 in Varrowmouth, fünf Akte mit je vier Fährten, Verhören, Entscheidungen, zwei Bossmomenten und dem Ende des Spiels. Vorbild für Umfang und Format sind `docs/story/k4_akte/` und `docs/story/k5_akte/` (nur lesen): `case.json`, `anreise.json`, `dialogues.json`, `npcs.json`, `quests.json`, `encounters.json` (nur Verweise auf IDs aus Paket CZ, keine eigenen Werte), `epiloge.json`, `zeitung.json`, `platzierung.json`. Karten, Figuren-Bögen und Gegner liefern die Pakete CU, CX und CZ; du benutzt ihre festen IDs aus den Eckdaten und erfindest nichts Weiteres mit eigenem Namen.

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

## 1. Der Fall (`case.json`)
Titel: „Die Stadt, die das Meer vergaß“. Kern: Der Spieler steht im Register, obwohl er nie in Varrowmouth war. Das Register ist kein Buch, sondern die Pegelherrin selbst: Sie hat vor vierzig Jahren alle Namen der Stadt in sich aufgenommen, um eine Sturmflut aufzuhalten, und seitdem hält sie das Meer draußen, indem sie die Stadt nicht loslässt. Jeder neue Name verlängert ihre Kraft. Der Spieler wurde eingetragen, weil ein Brief aus Kettlegate (Fall 9) seinen Namen hierher trug. Die Wahrheit kommt in fünf Akten ans Licht:

- **Akt I „Der Eintrag“** (Zollhafen, Stegviertel): Ankunft, Zollkontrolle, der eigene Name im Register, Tam Verrin schmuggelt den Spieler durch. Fährten: der Zollstempel, der Eintrag mit falschem Datum, Tams gestohlene Lotsenmarke, der stumme Schreiber im Zollhaus. Verhör: Zollschreiber `vmn_zollschreiber` (Name aus CX).
- **Akt II „Ebbe“** (Schlickgassen, Wrackfeld): die Unverzeichneten, Nell Quarrie, das erste vergessene Kind. Fährten: Namen, die im Schlick stehen, das Wrack mit der Registerseite, Nells Gabe, die Wrackmutter. Bossmoment `wrackmutter` mit Vorbereitung (Ebbe abwarten).
- **Akt III „Der Pegelrat“** (Oberstraße): Einladung des Rats, sieben Zollherren, einer lügt für den Spieler. Fährten: vier Gespräche mit Ratsmitgliedern (Verhör mit Lügen-Markierung), das Protokoll von vor vierzig Jahren. Entscheidung: welchem Zollherrn der Spieler vertraut (zwei Namen aus CX, Folgen in Akt V).
- **Akt IV „Das alte Leuchtfeuer“** (Leuchtbank): Osric Dale, das Register vor dem Register, die Sturmflut. Fährten: Osrics Schreibbuch, die Glocke der Leuchtbank, die Liste der Ertrunkenen, die Frage, ob die Flut wirklich kommt. Bossmoment `leuchtfeuerwaechter`.
- **Akt V „Das Register schließen“** (Registerkeller): die Pegelherrin, zwei Phasen, dann die Entscheidung.

Je Akt: `fuehrende_frage`, 4 Fährten mit `hinweise` (je 2 bis 3 Hinweise mit `text`, `fundort` als Karten-ID, `requires_flags`), Verknüpfungs-Regeln wie in `k5_akte/case.json`, `abschluss_text`. Flags: `k6_akt<n>_done`, `k6_vertraut_<ratsherr>`, `k6_nell_gerettet`, `k6_osric_gesteht`.

## 2. Anreise (`anreise.json`)
Vier Varianten aus den Briarholt-Enden (IDs aus `k5_akte/epiloge.json`, nur lesen) plus eine Koop-Variante: Küstenbahn bis zum Fähranleger, Nebel, erste Sicht auf die Pegeluhr. Je 8 bis 12 Zeilen, dann gemeinsam die Zollkontrolle. Ein Flag `k6_anreise_<ende>`.

## 3. Dialoge (`dialogues.json`)
Alle Gespräche der Hauptakte, Format wie `src/data/dialogues/` (nur lesen): Tam Verrin (Ankunft, Schmuggel, Zirkel-Zugang, Akt V), Nell Quarrie (Akt II bis V, Kind, sagt „du“ zum Spieler), Osric Dale (Akt IV, Geständnis), sieben Zollherren (je ein Verhör mit 3 Fragen, je eine Lüge mit `luege: true`), die Pegelherrin (vor Phase 1, zwischen den Phasen, nach dem Kampf, drei Haltungen: müde, kalt, erleichtert). Dazu 12 kurze Zwischenszenen (`szene`-Einträge, je 6 bis 10 Zeilen).

## 4. Zwei Bossmomente (`encounters.json`)
Nur Verweise: `wrackmutter`, `leuchtfeuerwaechter`, `pegelherrin` (Phase 1 `pegelherrin`, Phase 2 `pegelherrin_register`) mit `vorbereitung` (was der Spieler vorher tun kann: Ebbe, Glocke läuten, einen Zollherrn als Zeugen mitbringen), `friedliche_loesung` nur bei der Pegelherrin (siehe Enden). Werte liefert Paket CZ.

## 5. Vier Enden und Epiloge (`epiloge.json`)
- `k6_ende_schliessen`: Der Spieler schließt das Register und nimmt die Namen auf sich (Weg zu Sequenz 1; die Stadt ist frei, die Flut kommt in Jahren, nicht heute).
- `k6_ende_verbrennen`: Das Register wird zerstört, die Pegelherrin stirbt, die Flut kommt sofort; die Stadt wird geräumt, der Spieler verzichtet auf Sequenz 1.
- `k6_ende_uebergeben`: Nell nimmt das Register, der Spieler bleibt als ihr Schreiber; Sequenz 1 später möglich, bitterer Epilog.
- `k6_ende_teilen` (nur Koop): beide Spieler teilen das Register, keiner wird Sequenz 1, beide bleiben; zwei Sichtweisen.
Je Ende: 10 Epilog-Karten (je 2 bis 4 Sätze) über Varrowmouth, Tam, Nell, Osric, den Rat, die Unverzeichneten, die früheren Städte (Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt je eine Karte) und den Spieler selbst. Dazu `abspann_zeilen`: 20 kurze Zeilen für den Abspann je Ende.

## 6. Zeitung und Platzierung (`zeitung.json`, `platzierung.json`)
„Varrowmouther Pegelbote“: 20 Meldungen entlang der Akte mit `requires_flags`, 4 je Ende. `platzierung.json`: auf welcher Karte welcher Sprecher und welcher Hinweis zu welcher Gezeit steht (`gezeit: "ebbe" | "flut" | "beide"`).

## 7. Abgabe
`README.md` (Anschluss: Flags, Gezeiten-Bindung der Hinweise, welche Enden Seq 1 freigeben), `pruefen.mjs`, Pull Request mit Prüf-Ausgabe, Wortzahl und einer Liste aller benutzten IDs aus CU/CX/CZ.
