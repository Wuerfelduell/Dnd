# Codex-Paket CR: Fasserin-Aufträge als Texte (Bestellen, Warten, Abholen, Misserfolg)

**Schreibt nach:** `docs/story/fasserin_auftrag/`

Die Fasserin Oda Kessel nimmt künftig ein starkes Beutestück plus Lohn als Auftrag an; das Artefakt liegt erst beim nächsten Treffen desselben Zirkels bereit, mit Erfolgschance 40 bis 80 %. Du lieferst **alle Texte** dafür: Odas Zeilen in jedem Zustand, die Zeilen der Gastgeber bei der Übergabe ohne Oda, die Einladungstexte, die 20 Artefakt-Beschreibungen, Gerede, Zeitung, Lesestücke und Koop. Ihr Charakterbogen steht in `docs/story/fasserin/oda_kessel.md` (nur lesen); bleib bei dieser Stimme: knapp, handwerklich, ein trockener Witz pro Gespräch, nie schwärmerisch. Grafik macht Paket CQ.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** und keine Dateien unter `src/` anfassen: Du lieferst Daten und Texte als JSON und Markdown in deinen eigenen Ordner unter `docs/story/`. Der Einbau passiert separat. Andere Pakete laufen gleichzeitig.

- **Format:** JSON wie die bestehenden Pakete unter `src/data/packs/` (nur lesen). Texte auf Deutsch, Spieler wird mit „du“ angesprochen, Figuren sagen „Sie“ zum Spieler. Kurze Sätze, kein Pathos-Überschwang, keine Namen oder Begriffe aus fremden Büchern, Spielen oder Filmen.
- **Ton:** viktorianisch-industriell, melancholisch, trocken; Okkultes wirkt körperlich und unheimlich, nie blutig. Keine Schreie, keine Folter.
- **IDs:** nur Kleinbuchstaben, Ziffern, Unterstrich. Benutze die festen IDs unten genau so. Erfinde keine neuen Pfade, Sequenznamen, Städte, Karten oder Figuren; was fehlt, bekommt dein Paket-Präfix.
- **Prüfskript:** `docs/story/<paket>/pruefen.mjs` (Node ohne Pakete): alle JSON lesbar, alle Pflicht-IDs vorhanden, keine doppelten IDs, keine leeren Texte. Pull Request mit der Prüf-Ausgabe.
- **README:** `docs/story/<paket>/README.md` erklärt kurz, welche Datei wofür ist und was der Einbau anschließen muss (Flags, Ereignisse), damit der Einbau nur noch Zeilen ergänzt.

## Gemeinsame Eckdaten „Fasserin-Aufträge“ (gilt für die Pakete CQ und CR)

Die Fasserin **Oda Kessel** sitzt mit 30 % Chance bei einem geheimen Treffen am Tisch (Paket BO, `public/sprites/manifest-fasserin.json`, `src/data/packs/fasserin/`, nur lesen). Bisher tauscht sie sofort mehrere Beutestücke plus Lohn gegen ein Artefakt. **Neu:** Sie nimmt **ein einzelnes starkes Beutestück** plus Fasserlohn als **Auftrag** an. Das Artefakt ist erst beim **nächsten Treffen desselben Zirkels** fertig (im Kreidezirkel bestellt heißt: beim nächsten Kreidezirkel-Treffen abholen). Der Gastgeber händigt es aus, auch wenn Oda an dem Tag fehlt. **Erfolgschance 40 bis 80 %**, stärkere Artefakte haben die geringere Chance; sie steht vorher dabei. Bei Misserfolg ist das Beutestück hin, die Hälfte des Lohns kommt zurück. Der Würfel fällt beim Abholen und ist fest.

Zirkel mit festen IDs: `waage` (Die Stille Waage, Kettlegate), `kreide` (Der Kreidezirkel, Kettlegate), `russ` (Die Rußgesellschaft, Kettlegate), `lichtlose` (Die Lichtlosen, Wexmoor), `salz` (Die Salzbrüder, Wexmoor), `schichtbund` (Der Schichtbund, Dunscar).

Zustände eines Auftrags (feste IDs): `bestellt` (Stück und Lohn abgegeben), `in_arbeit` (zwischen den Treffen), `fertig` (liegt beim nächsten Treffen bereit), `misslungen` (Stück verloren, halber Lohn zurück), `abgeholt`.

Starke Beutestücke, die als Einzelstück zu einem Artefakt werden (feste IDs, Artefakt-ID `fa_<stueck>`), mit Chance:

| Beutestück | Herkunft | Artefakt (`fa_*`) | Chance |
|---|---|---|---|
| `rattenkrone` | Rattenkönig, Katakomben | `fa_rattenkrone` Krone des Rattenkönigs: Stadtgegner weichen | 70 % |
| `sternhirschgeweih` | Sternhirsch, Kraterwald | `fa_sternhirschgeweih` Sternhirsch-Reif: Geistsicht kostet weniger Unruhe | 55 % |
| `geweihreif` | Moorkönigin | `fa_geweihreif` Moorkrone: Gift und Schlick prallen ab | 50 % |
| `geisterkern` | Geister in Kettlegate | `fa_geisterkern` Kernphiole: einmal je Kampf einen Treffer schlucken | 60 % |
| `glasfeder` | Glasmöwen, Bojenhafen | `fa_glasfeder` Glaskiel: Erstschlag im Kampf | 75 % |
| `wachsherz` | Wachsfiguren, Fall 6 | `fa_wachsherz` Schlagendes Herz: Nerven erholen sich im Kampf | 65 % |
| `moorperle` | Torfbrüche | `fa_moorperle` Moorauge: Fallen auf Reisen werden sichtbar | 80 % |
| `schlickperle` | Floßfriedhof | `fa_schlickperle` Schlicktropfen: Wasserwege ohne Kahnkosten | 80 % |
| `brutschale` | Brut im Schlachthof | `fa_brutschale` Brutschale: ein Begleitgeist im nächsten Kampf | 60 % |
| `moewenglas` | Salzbrüder-Beute | `fa_moewenglas` Möwenglas: Händlerpreise 10 % besser | 75 % |
| `irrlichtfunke` | Grubenlichter | `fa_irrlichtfunke` Funkenlaterne: Dunkle Karten sind hell | 70 % |
| `schaedelsplitter` | Katakomben-Elite | `fa_schaedelsplitter` Splitteramulett: Untote zögern | 65 % |
| `ratssiegel` | Fall 9 | `fa_ratssiegel` Ratssiegel: Türen der Oberstadt offen | 45 % |
| `medaille_polizei` | Revier-Belohnung | `fa_medaille_polizei` Ehrenmedaille: Ansehen fällt langsamer | 55 % |
| `fernrohr_messing` | Sternwarte | `fa_fernrohr_messing` Sternsucher-Okular: Hinweise aus der Ferne lesbar | 50 % |
| `bronzeglocke_klein` | Glockenstube, Fall 5 | `fa_bronzeglocke_klein` Stimmglöckchen: Chor-Gegner schweigen eine Runde | 60 % |
| `spinnfaden_lila` | Weberin | `fa_spinnfaden_lila` Nervenspule: Nervenfaden-Fähigkeiten billiger | 40 % |
| `linsenscherbe` | Leuchtturm | `fa_linsenscherbe` Leuchtturm-Monokel: Lügen im Verhör markiert | 45 % |
| `madenwachs` | Pestgassen | `fa_madenwachs` Wachssiegel: Krankheit haftet nicht | 70 % |
| `russklumpen` | Rußgesellschaft | `fa_russklumpen` Rußzeichen: Sekten erkennen den Spieler nicht | 65 % |

Die Wirkungen sind Vorschläge für den Einbau; die Namen und IDs sind fest. Die alten Mehrteil-Rezepte (`krone_der_sieben` usw.) bleiben als Grafik im Spiel, werden aber nicht mehr angeboten.

## 1. Oda in jedem Zustand (`oda.json`)
- `begruessung_auftrag`: 6 Zeilen, mit denen sie das neue Geschäft erklärt (ein Stück, Lohn, nächstes Treffen dieses Zirkels, Chance steht dabei), je Zirkel eine Abwandlung (`je_zirkel`, 6 x 1 Zeile).
- `pruefen`: je Beutestück eine Zeile, wenn sie es in die Hand nimmt (20 Zeilen, nennt die Chance in Worten: „Vier von fünf halten.“, ohne Prozentzeichen).
- `annehmen`: 4 Zeilen beim Abschluss des Auftrags, `kein_geld`: 3, `kein_stueck`: 3 (Spieler hat nichts Passendes), `zu_viele` (schon zwei Aufträge offen): 2.
- `warten`: 6 Zeilen, wenn der Spieler sie vor dem Abholtermin anspricht (bei einem anderen Zirkel oder außerhalb).
- `uebergabe_erfolg`: je Artefakt eine Zeile (20), `uebergabe_misslungen`: je Beutestück eine Zeile (20, erklärt, woran es lag, gibt den halben Lohn zurück), `nachfrage_misslungen`: 3 Zeilen auf die Frage „Warum?“.
- `abschied`: 4 Zeilen, `koop`: 6 Zeilen (zwei Spieler, zwei Aufträge, wer zahlt).

## 2. Gastgeber ohne Oda (`gastgeber.json`)
Je Zirkel (`waage`, `kreide`, `russ`, `lichtlose`, `salz`, `schichtbund`) 3 Zeilen für die Übergabe des fertigen Artefakts, wenn Oda fehlt, 2 Zeilen für die Übergabe der Scherben und des halben Lohns, 1 Zeile, wenn der Spieler nach ihr fragt. Zusammen 36 Zeilen. Die Gastgeber-IDs stehen in `src/data/treffen.json → circles` (nur lesen).

## 3. Einladungen und Oberfläche (`texte.json`)
- `einladung_mit_abholung`: 6 Varianten eines Zusatzes in der Einladung („Die Fasserin lässt ausrichten …“), 1 bis 2 Sätze.
- `einladung_oda_dabei`: 4 Varianten, wenn Oda beim kommenden Treffen am Tisch sitzt.
- `auftragskarte`: Beschriftungen der Oberfläche als kurze Wörter: Zustand (5), Chance („Hält mit 7 von 10“ als Muster für 40 bis 80 in Zehnerschritten), Zirkel, Treffen-Termin, Lohn, Rückgabe.
- `hinweise`: 8 kurze Notizbuch-Meldungen (Auftrag erteilt, nächstes Treffen in X Tagen, Artefakt bereit, Artefakt misslungen, Lohn zurück, Treffen verpasst: Auftrag bleibt liegen, zweiter Auftrag offen, Koop-Hinweis).

## 4. Die 20 Artefakte (`artefakte.json`)
Je Artefakt `{ "id": "fa_<stueck>", "name", "beschreibung" (2 bis 3 Sätze, Inventar), "untersuchen" (2 Sätze, Knopf „Untersuchen“), "wirkung_text" (1 Satz, wie das Spiel die Wirkung anzeigt), "nachteil_text" (1 Satz; jedes Artefakt hat einen kleinen Haken, z. B. mehr Unruhe, Gewicht, ein Händler verweigert), "oda_zeile" (1 Satz, was Oda beim Zeigen sagt) }`. Wirkungen aus der Tabelle oben als Ausgangspunkt; Werte als Vorschlag im README, nicht in den Texten.

## 5. Stadt und Welt (`gerede.json`, `zeitung.json`, `lesestuecke.json`)
- `gerede.json`: 24 Zeilen (je 4 für Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt und Treffen allgemein) über die Fasserin, geplatzte Aufträge, ein Artefakt, das jemand trägt. Format wie `src/data/packs/fasserin/gerede.json`.
- `zeitung.json`: 6 Meldungen (Scherben vor einer Schenke, eine Krone zu verkaufen gesucht, Polizei fragt nach einer Frau mit Zangen, Kurblatt), mit `requires_flags` als Vorschlag (`fa_auftrag_erteilt`, `fa_misslungen_1`, Zirkel-Mitgliedschaften).
- `lesestuecke.json`: 4 Lesestücke, je 100 bis 160 Wörter: Odas Lehrbrief, eine Preisliste alter Fasser, ein Brief eines unzufriedenen Kunden, eine Notiz über das Beutestück, das nie hielt.

## 6. Abgabe
Alle Dateien oben, `README.md` (Anschluss: Zustände, Flags `fa_auftrag_<zirkel>`, `fa_misslungen_<n>`, Ereignis `auftrag_abholen`; Vorschlag für Lohn je Artefakt zwischen 80 und 220 Schilling, höhere Chance günstiger), `pruefen.mjs`, Pull Request mit Prüf-Ausgabe und Wortzahl.
