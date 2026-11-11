# Codex-Paket CU: Kapitel 6 Orte und Gezeiten (Varrowmouth-Karten, Gefahrengebiete, Mechanik)

**Schreibt nach:** `docs/story/k6_orte/`

Du lieferst **Karten, Zonen, Reise und die Spezifikation der Gezeiten-Mechanik** für Varrowmouth, als Daten im Format von `docs/story/k5_orte/` (nur lesen): `city.json`, `maps.json`, `zones.json`, `travel.json`, `zonen_bindung.json`, `platzierung.json`, `items.json`, `artifacts.json`, `dialogues.json` (nur Orts-Gespräche: Zöllner, Stegmarkt, Fähre), `bosses.json` (nur Ort und Auslöser; Werte in CZ). Story macht Paket CT, Figuren CX, Gegner CZ, Grafik CV/CW.

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

## 1. Stadt (`city.json`)
`varrowmouth`: Name, Beschreibung (3 Sätze), Ankunftskarte `vm_zollhafen`, Stadtkarten-Pins für alle acht Karten, Händler (3: Stegmarkt-Fischerin, Zollhaus-Kantine, Reederei-Apotheke; Sortimente aus bestehenden Item-IDs plus höchstens 8 neue `vmi_*`), Schlafplatz (Tams Lotsenkammer, ab Akt I), Büro (ab Akt III, im alten Zollarchiv), Nachtzug: keiner (keine Rückreise).

## 2. Acht Karten (`maps.json`)
Je Karte: `id`, `name`, Größe in Tiles (Außen 48x32 bis 64x40, Innen 24x16), `tiles` (Theme-ID aus Paket CV: `vm_hafen`, `vm_stege`, `vm_schlick`, `vm_oberstrasse`, `vm_wrack`, `vm_leuchtbank`, `vm_innen`), Türen mit Zielkarte, Sprecher-Punkte, Schilder, Lichtquellen, Nacht-Regeln und **Gezeiten-Regeln**: `gezeiten: { "ebbe": {...}, "flut": {...} }` mit begehbaren Bereichen (Rechtecke), geöffneten Türen, zusätzlichen Props und Gegnerplätzen. Beispiel: `vm_schlickgassen` ist bei Flut nur vom Steg aus sichtbar, Begehen unmöglich; `vm_registerkeller` ist nur bei Ebbe erreichbar, bei Flut läuft er voll (Spieler wird nach oben gesetzt, Meldung). Eine ASCII-Skizze je Außenkarte im README.

## 3. Gefahrengebiete (`zones.json`, `zonen_bindung.json`)
- `vm_wrackfeld`: Ebbe-Zone, Gegner `vme_salzkruste`, `vme_tauwerk`, `vme_hafenkraehe`; Boss `wrackmutter` im größten Wrack; Beute: Registerseiten (`vmi_registerseite`, Quest-Item), Zutaten für Seq 2/1 (aus `src/data/packs/sequenzen/zutaten.json`, nur lesen, je 2 passende). Bei Flut: Zone geschlossen, offene Kämpfe enden mit „Das Wasser kommt“ (Flucht ohne Strafe).
- `vm_leuchtbank`: beide Gezeiten, bei Flut nur per Boot (Tam), Gegner `vme_gezeitenlaeufer`, `vme_zollgeist`; Boss `leuchtfeuerwaechter`.
- `vm_grenzzaun`: Übergangszone zum Grenzbezirk (`hg_grenzbezirk`, Paket CP), Elite `vme_pegelknecht` in Zweiergruppen; ohne Kampf passierbar mit einem Zollsiegel (`vmi_zollsiegel`).
Zonen-Bindung: Gegner-Stärke nach Sequenz-Erwartung Kapitel 6 (Spieler Seq 4 bis 3, siehe `docs/story/k5_orte/zonen_bindung.json` als Muster, eine Stufe härter).

## 4. Reise (`travel.json`)
Ereignisse der Küstenbahn und Fähre (Anreise, einmalig) und der Stadt-Boote (Zollhafen ↔ Leuchtbank, Stegviertel ↔ Wrackfeld bei Flut): 12 Ereignisse `vm_reise_*` mit Entscheidungen, Gezeitenbindung, Figuren aus CX, Gegnern aus CZ, 2 Koop-Varianten.

## 5. Gezeiten-Spezifikation (README, Abschnitt „Mechanik“)
Beschreibe für den Einbau, ohne Code: Takt (6 Spielminuten, Vorschlag), Übergang (30 Sekunden Warnung mit Pegeluhr-Glocke, Soundgruppe `varrowmouth`), was mit Spieler, Gegnern, offenen Gesprächen und Kämpfen beim Wechsel passiert, wie die Pegeluhr im HUD aussieht (Grafik in CW), wie Schlafen und Sequenz-Fähigkeiten eingreifen (Pfad der Uhr kann den Wechsel um eine Minute verzögern, Pfad des Moores kann im Schlick atmen: je ein Vorschlag pro Pfad, 10 Zeilen). Dazu ein **Grundgerüst** `gezeiten.schema.json` für die Karten-Felder und eine Liste aller Karten mit ihrem Verhalten je Gezeit.

## 6. Gegenstände (`items.json`, `artifacts.json`)
Höchstens 12 neue `vmi_*`: Zollsiegel, Registerseite, Lotsenmarke, Pegelglocke klein, Salzlaterne, Schlicksohlen (Reise im Schlick ohne Kosten), Gezeitenkalender, Trockenfisch, Zollkantinen-Tee, Reeder-Tinktur, Leuchtbank-Linse (Artefakt: sieht bei Flut, was bei Ebbe liegt), Namenlos-Ring (Artefakt der Unverzeichneten: Zollgeister übersehen den Träger). Jedes mit Name, Beschreibung, Gewicht, Preis, Wirkungsvorschlag.

## 7. Abgabe
`README.md` (Karten-Skizzen, Mechanik, Anschlussliste), `pruefen.mjs`, Pull Request mit Prüf-Ausgabe.
