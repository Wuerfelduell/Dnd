# Codex-Paket DR: Seq-4-Rituale als Texte, dazu Einnahmen in Wexmoor

**Schreibt nach:** `docs/story/seq4_rituale/`

Die zehn Seq-4-Rituale (Eckdaten unten) haben feste Regeln, aber noch keine Worte: keine Ritualbeschreibung im Pfad-Reiter, keine Regelanzeige, keine Meldungen beim Erfüllen, Brechen oder Scheitern, keine Sätze des Schwellenwächters. Dieses Paket liefert **alle Texte**, die der Code-Thread für die Rituale braucht, damit der Einbau nur noch Zeilen ergänzt. Dazu kommen Texte für **neue Einnahmequellen in Wexmoor** (das Waage-Ritual verlangt bis zu etwa 10 000 Schilling, die man durch echtes Farmen zusammenbekommen soll). Grafik machen DN, DO, DP; Klang DS. Parallel startbar.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern** und keine Dateien unter `src/` anfassen: Du lieferst Daten und Texte als JSON und Markdown in deinen eigenen Ordner unter `docs/story/`. Der Einbau passiert separat. Andere Pakete laufen gleichzeitig.

- **Format:** JSON wie die bestehenden Pakete unter `src/data/packs/` (nur lesen; Muster: `src/data/packs/halbgott/`, `src/data/packs/k3_pruefungen/rituale.json`, `src/data/packs/k3_leben/quests.json`). Texte auf Deutsch, Spieler wird mit „du“ angesprochen, Figuren sagen „Sie“ zum Spieler. Kurze Sätze, kein Pathos-Überschwang, keine Namen oder Begriffe aus fremden Büchern, Spielen oder Filmen.
- **Ton:** viktorianisch-industriell, melancholisch, trocken; Okkultes wirkt körperlich und unheimlich, nie blutig. Keine Schreie, keine Folter.
- **IDs:** nur Kleinbuchstaben, Ziffern, Unterstrich. Benutze die festen IDs unten genau so. Erfinde keine neuen Pfade, Sequenznamen, Städte, Karten oder Figuren; was fehlt, bekommt dein Paket-Präfix.
- **Keine Zahlen erfinden, die die Regeln ändern.** Wo eine Zahl im Text steht (Runden, Prozent, Anzahl), nimm sie aus den Eckdaten; wo sie offen ist, schreib einen Platzhalter `{n}`, `{pct}`, `{runde}`, `{name}`, `{item}`, den der Einbau füllt.
- **Prüfskript:** `docs/story/seq4_rituale/pruefen.mjs` (Node ohne Pakete): alle JSON lesbar, alle zehn Pfade in jeder Datei, keine doppelten IDs, keine leeren Texte, nur erlaubte Platzhalter. Pull Request mit der Prüf-Ausgabe.
- **README:** `docs/story/seq4_rituale/README.md` erklärt, welche Datei wofür ist und welche Ereignisse der Einbau anschließen muss.

## Eckdaten „Seq-4-Rituale“ (gleich in DN, DO, DP, DR, DS)

Vor dem Trank der **Sequenz 4** (Halbgott, siehe Paket CO/CP) legt jeder Pfad ein eigenes, schweres Ritual ab. Die Regeln hat Seb festgelegt; die Spiellogik baut ein eigener Code-Thread parallel. Diese Pakete liefern nur Grafik, Texte und Klang. Für alle zehn Rituale gilt:

- **Ort frei:** kein festes Ritualfeld, keine Bindung an Fälle oder Städte (es gibt keine Rückreise in frühere Städte).
- **Immer solo:** im Koop macht nur der Spieler mit, der aufsteigt; der andere schaut zu und greift nicht ein. Darum braucht jede Spielerfigur (Spieler 1 `player`, Koop `p2a`, `p2b`) die Ritualbilder, die den Körper zeigen.
- **Schwellenwächter als Abschlussprüfung:** Jedes Ritual endet mit dem Schwellenwächter. Er existiert schon als Kampfsprite aus Paket CO (`public/sprites/battle/hg_schwellenwaechter.png`, 128x96, mit den zehn Pfadsiegeln `battle/hg_siegel.png`, Kulisse `battle/bg_hg_schwelle.png`). **Nicht neu zeichnen**, nur die unten verlangten Zusätze.
- **Fehlschlag** kostet Verdauung (−20 bis −25 %), das Ritual darf wiederholt werden. Gelingt es, folgt der Seq-4-Trank (Trink-Bilder und Aufstieg gibt es schon aus CO).

| `pfad` | Seq 4 | Ritual (Arbeitstitel) | Kern der Prüfung | Präfix |
|---|---|---|---|---|
| `laterne` | Dochtgezeichneter | Die Nacht der Laternen | Echtzeit im Monstergebiet **ohne Kampfbildschirm**: 5–6 Laternen gegen ≥15 Monster halten, Nachfüllen durch Halten einer Taste (1–2 s), Monster sterben nur an Licht, der Spieler strahlt schwach; Wächter am Ende nur durch „Sonnenaufgang“ zwischen drei brennenden Laternen | `s4la_` |
| `faden` | Nahtträger | Das Netz der fünf Träume | 5 verschiedene Kreaturen aus 5 Gebieten mit Schicksalsfäden markieren, schlafen gehen, Traumkampf gegen alle 5 gleichzeitig, keine Heilung im Traum | `s4fa_` |
| `maske` | Gesichtsvermieter | Das Gesicht ohne Gabe | Als gewöhnlicher Zivilist einen Beyonder (Seq 5 oder höher) herausfordern und ohne jede Fähigkeit besiegen, ihn verschonen; er zweifelt danach dauerhaft an seinen Kräften | `s4ma_` |
| `echo` | Stilleverwahrer | Die Welt ohne Klang | Völlige Taubheit: 3 Gegner + Wächter ohne Angriffskreise und ohne Warnklänge; Ausweichen/Parieren ohne Hinweise | `s4ec_` |
| `kessel` | Rückstandsbrauer | Die fünffache Essenz | 5 neue Ritual-Tränke brauen und nacheinander trinken; Wächter nur mit Trankwirkungen besiegen (Gift, Säure, Explosion, Würfe) | `s4ke_` |
| `eisen` | Lastnieter | Die Last des Halbgottes | ≥5 Artefakte + Traglast ≥200 %, ohne Rüstung/Helm/Amulett; Wächter erscheint am Standort; Ausweichen verboten; Runde 1–5 überstehen, Wächter stirbt erst ab Runde 6 | `s4ei_` |
| `schluessel` | Schwellenlücke | Der Schatten ohne Körper | **Neue Mechanik Schattensteuerung:** Schatten vom Körper trennen, der Körper bleibt regungslos stehen; Spieler steuert den Schatten (40 % Leben, keine Ausrüstung, keine Heilung, kein Parieren); Standardangriff „Schattenattacke“ + jede Runde eine zufällige eigene Fähigkeit; 2 Gegner, dann Wächter | `s4sc_` |
| `sq_waage` | Pfandkörper | Der Preis der Macht | Gesamten Besitz ablegen, mit selbst gewähltem Kapital einen geheimen Zirkel betreten, **alle** Waren kaufen; Wächter nur mit dort Gekauftem besiegen | `s4wa_` |
| `sq_moor` | Schichtträger | Das Relikt des Verfalls | 5 okkulte/seltene Gegenstände nur mit Moor-Fähigkeiten zersetzen, aus den Resten ein neues Ritual-Artefakt formen (zufällige Eigenschaften), Wächter damit besiegen, jede Runde eine Flasche Moorwasser trinken | `s4mo_` |
| `sq_uhr` | Zwischentakter | Der perfekte Augenblick | 3 Monster, jedes greift mindestens einmal an, **nur perfekte Ausweichmanöver** (0 Fehler); danach Wächter mit höchstens 3 verfehlten Ausweichmanövern; Parieren verboten | `s4uh_` |

Die Arbeitstitel von Laterne, Faden und Maske sind Vorschläge (Seb hat sie nicht benannt); die übrigen sieben Namen sind Sebs und verbindlich. Gemeinsames Präfix für alles, was alle Rituale teilen: `s4r_`. Flag-Vorschläge für den Einbau: `s4r_<pfad>_aktiv`, `s4r_<pfad>_done`, `s4r_<pfad>_fehlschlag` (Spieler 2 mit `p2_`-Präfix).

**Genaue Regeln je Ritual** (Sebs Fassung, verbindlich für die Texte):
- `laterne`: Echtzeit im Monstergebiet ohne Kampfbildschirm, mindestens 15 Monster, 5–6 Laternen; Monster greifen die schwächste Laterne an; Nachfüllen = Taste 1–2 s halten, ein Treffer unterbricht und gibt Schaden und Rückstoß statt eines Kampfes; der Spieler strahlt schwach (Monster nehmen Schaden und weichen), Licht kostet Nerven und Spiritualität, Unruhe steigt mit der Dauer; Monster sterben nur an Licht, angreifen kann man nicht; der Wächter ist gegen einzelne Laternen immun und fällt nur durch „Sonnenaufgang“ zwischen drei brennenden Laternen; Fehlschlag −20 % Verdauung.
- `faden`: fünf verschiedene Kreaturen (Monster oder Beyonder) aus fünf verschiedenen Gebieten markieren (Markierungen bleiben über Kapitel hinweg), schlafen gehen, Traumkampf gegen alle fünf gleichzeitig (deutlich verstärkt), keine Heilung im Traum, nach dem Erwachen der Trank.
- `maske`: in einen gewöhnlichen Zivilisten verwandeln, einen Beyonder ab Seq 5 herausfordern und ohne jede übernatürliche Fähigkeit besiegen (nur normale Angriffe, gewöhnliche Ausrüstung; Tränke erlaubt, Artefakte nicht), der Gegner behält seine Fähigkeiten; verschonen, er zweifelt dauerhaft; Fehlschlag: Niederlage, Tod des Gegners oder eigene Fähigkeit benutzt; −20 %.
- `echo`: völlige Taubheit; drei Gegner und danach der Wächter, alle ohne Angriffskreise und ohne akustische Warnungen; Ausweichen und Parieren möglich, aber ohne Hinweise; Heilung und Fähigkeiten erlaubt; Fehlschlag Niederlage, −25 %.
- `kessel`: fünf neue Ritual-Tränke im Ritual brauen und nacheinander trinken (Rezepte erst nach voller Verdauung von Seq 5 und mit der Seq-4-Formel), nach dem fünften erscheint der Wächter; Schaden nur durch Trankwirkungen, vorbereitete Tränke erlaubt, normale Angriffe und offensive Fähigkeiten verboten, Heil- und Schutzfähigkeiten erlaubt; −25 %.
- `eisen`: mindestens fünf Artefakte im Inventar, Traglast mindestens 200 %, Rüstung, Helm und Amulett abgelegt; sind alle Bedingungen erfüllt, erscheint der Wächter am Standort; Bedingungen gelten bis Kampfende; Ausweichen verboten, Parieren und Heilung erlaubt; Runde 1–5 überstehen (der Wächter nimmt Schaden, stirbt aber nicht), töten erst ab Runde 6.
- `schluessel`: Schatten vom Körper trennen (Körper bleibt regungslos); Schatten mit 40 % Leben, ohne Ausrüstung, ohne Heilung, ohne Parieren, Ausweichen erlaubt; Standardangriff „Schattenattacke“ (immer verfügbar, etwa 80 % Schaden, keine Nerven) und je Runde genau eine zufällige eigene Fähigkeit; zwei Gegner, dann der Wächter; stirbt der Schatten, scheitert das Ritual, der Spieler überlebt.
- `sq_waage`: gesamten Besitz ablegen (Inventar und Ausrüstung leer, er bleibt versiegelt im Lager), mit selbst gewähltem Kapital einen geheimen Zirkel betreten, **alle** angebotenen Waren kaufen (auch eine etwaige Seq-4-Formel für 4000); das Ritual beeinflusst Zirkel und Angebot nicht; nach dem letzten Kauf erscheint der Wächter; Kampf nur mit dort Gekauftem, Fähigkeiten erlaubt; Fehlschlag: zu wenig Kapital oder Niederlage; Wiederholung erlaubt; den Geldbedarf schätzt der Spieler selbst.
- `sq_moor`: fünf okkulte oder sehr seltene Gegenstände sammeln und ausschließlich mit Moor-Fähigkeiten zersetzen; aus den Resten ein neues Ritual-Artefakt formen (übernimmt zufällige Eigenschaften der fünf); dann erscheint der Wächter; mit dem neuen Artefakt besiegen; jede Kampfrunde eine Flasche Moorwasser trinken (wird verbraucht); Fehlschlag: Niederlage, Moorwasser leer oder Verstoß; −25 %. Das Relikt bleibt nach dem Aufstieg.
- `sq_uhr`: drei Monster besiegen, jedes muss mindestens einmal angreifen; nur perfekte Ausweichmanöver zählen, normales Ausweichen ist ein Fehler, bei den Monstern ist kein Fehler erlaubt; beim Wächter höchstens drei verfehlte Ausweichmanöver (der vierte = Scheitern); Angreifen erlaubt, Parieren verboten.

## 1. `rituale.json`: Ritual je Pfad (10 Einträge, Schlüssel `s4r_<pfad>`)
Je Eintrag: `name` (siehe Tabelle; für Laterne, Faden, Maske darfst du einen besseren Namen vorschlagen, Feld `name_vorschlag`), `desc` (3–4 Sätze für den Pfad-Reiter, was zu tun ist, in Sebs Regeln), `regeln` (3–6 kurze Zeilen für die Regelkarte, je höchstens 60 Zeichen), `vorbereitung` (2–3 Hinweise, was man vorher besorgen sollte, z. B. Lampenöl, Moorwasser, Kapital), `beginn` (Text beim Start, 2–3 Sätze), `erfolg` (2–3 Sätze, bevor der Seq-4-Trank getrunken wird), `fehlschlag` (je Fehlschlag-Grund ein Satz, Schlüssel wie `niederlage`, `verstoss`, `moorwasser_leer`, `zu_wenig_kapital`, `schatten_tot`, `zu_viele_fehler`, `gegner_tot`, `faehigkeit_benutzt`; Verdauungsverlust als `{pct}`), `notizbuch` (ein Satz Erinnerung für das Notizbuch, solange das Ritual offen ist).

## 2. `meldungen.json`: Laufende Meldungen je Ritual
Kurze Zeilen (höchstens 80 Zeichen), die während des Rituals erscheinen. Je Pfad mindestens:
- `laterne`: Laterne aufgestellt, Laterne angegriffen (`{n}` = Nummer), Laterne schwach, Laterne erloschen, Nachfüllen unterbrochen, Monster weicht dem Licht, Monster zerfällt, Nerven schwinden, Unruhe steigt (3 Stufen), Wächter erscheint, Wächter immun, Sonnenaufgang möglich (drei Laternen brennen nah beieinander), Sonnenaufgang.
- `faden`: Kreatur markiert (`{name}`, `{n}/5`), Gebiet schon belegt, gleiche Art schon markiert, alle fünf markiert, Einschlafen, Traumbeginn, Heilung im Traum versagt, Erwachen.
- `maske`: Verwandlung, Herausforderung angenommen/abgelehnt (`{name}`), Fähigkeit benutzt = Scheitern, Artefakt abgelegt, Gegner am Boden: verschonen?, Gegner verschont, Gegner tot = Scheitern.
- `echo`: Taubheit beginnt, Taubheit endet, Gegner `{n}/3` besiegt, Wächter erscheint (ohne Klang beschrieben), Ausweichen gelungen/misslungen (ohne Hinweis darauf, was man hätte hören können).
- `kessel`: Rezept freigeschaltet (`{item}`), Rezept noch gesperrt (warum), Ritual-Trank `{n}/5` gebraut, getrunken, Wächter erscheint, Angriff verboten, Trankwirkung trifft.
- `eisen`: fehlende Bedingungen einzeln (Artefakte `{n}/5`, Traglast `{pct}`, Rüstung/Helm/Amulett noch angelegt), alle erfüllt, Wächter erscheint am Standort, Runde `{runde}/5` überstanden, Wächter wehrt Todesstoß ab (Runde 1–5), Wächter verwundbar (ab Runde 6), Ausweichen versucht = Scheitern, Bedingung gebrochen = Scheitern.
- `schluessel`: Schatten trennt sich, Körper bleibt zurück, Fähigkeit dieser Runde `{name}`, Heilung versagt, Parieren unmöglich, Gegner `{n}/2`, Wächter erscheint, Schatten kehrt zurück, Schatten zerfasert.
- `sq_waage`: Besitz abgelegt und versiegelt, Kapital gewählt (`{n}` Schilling), Kauf `{item}` (`{n}` übrig), noch `{n}` Waren offen, Kapital reicht nicht, alles gekauft, Wächter erscheint, nur Gekauftes erlaubt, Besitz zurück.
- `sq_moor`: Gegenstand zersetzt (`{item}`, `{n}/5`), falsche Zersetzung (keine Moor-Fähigkeit) = Verstoß, Relikt geformt (`{name}` mit Eigenschaften), Wächter erscheint, Moorwasser getrunken (`{n}` übrig), Moorwasser leer = Scheitern.
- `sq_uhr`: Monster `{n}/3` hat angegriffen, perfektes Ausweichen, nur normales Ausweichen = Fehler, Fehler beim Wächter `{n}/3`, vierter Fehler = Scheitern, Parieren verboten.

## 3. `waechter.json`: Schwellenwächter je Ritual
Der Wächter (Kampfwerte und Grundtexte stehen in `src/data/packs/halbgott/`, nur lesen) spricht in jedem Ritual anders, passend zur Prüfung. Je Pfad: `intro` (2 Sätze), `zwischenrufe` (4 kurze Sätze für den Kampf), `sieg_spieler` (2 Sätze), `sieg_waechter` (1 Satz). Beim Echo spricht er nicht: dort nur Beschreibungen dessen, was man sieht. Beim Eisen zusätzlich `runde_1` bis `runde_5` (je 1 Satz) und `verwundbar`. Bei der Laterne zusätzlich `immun` und `sonnenaufgang`.

## 4. `kessel_rezepte.json`: Die fünf Ritual-Tränke
IDs fest (Icons liefert DP): `s4ke_nachtschierling`, `s4ke_aetzwasser`, `s4ke_knallsud`, `s4ke_frostlauge`, `s4ke_glutschleim`. Je Trank: `name`, `desc` (2 Sätze), `zutaten_vorschlag` (2–3 Zutaten-IDs **nur aus bestehenden Items**, siehe `src/data/sude.js` und `content.items`; jede Kombination anders als die 16 Sude dort), `wirkung_trinken` (was das Trinken im Ritual bewirkt, als Vorschlag: z. B. Giftresistenz, Säurehaut), `wirkung_wurf` (Kampfeffekt als Vorschlag: Gift über Runden, Säure senkt Abwehr, Explosion Flächenschaden, Frost verlangsamt, Glut brennt nach), `sperrtext` (warum der Kessel ihn noch nicht braut).

## 5. `moor_relikt.json`: Das Relikt des Verfalls
- `eigenschaften`: 20 mögliche Eigenschaften, die das Relikt von den fünf zersetzten Gegenständen erben kann, je mit `id` (`s4mo_e_*`), `name`, `kategorie` (eine von `glut`, `faden`, `stein`, `schatten`, `salz` → passt zum Icon aus DP), `wirkung_vorschlag` (kurz, z. B. „+10 % Schaden gegen Okkultes“).
- `namensteile`: 10 Vorsilben und 10 Nachsilben, aus denen der Einbau einen Reliktnamen zusammensetzt (z. B. „Schlickknoten der Asche“).
- `desc_vorlagen`: 5 Beschreibungs-Vorlagen mit `{name}`, `{eigenschaften}`.
- `zersetzen`: je eine Zeile für 10 Arten von Gegenständen (Artefakt, Trank, Formel, Zutat, Knochen, Metall, Papier, Stoff, Glas, Edelstein), wie das Moor sie frisst.

## 6. `nebentexte.json`: Welt, Koop, Notizbuch
- `koop_zuschauer`: je Pfad 2 Zeilen des zweiten Spielers, der zusehen muss und nicht eingreifen darf.
- `maske_zweifel`: 8 Zeilen, die ein verschonter Beyonder später sagt, wenn man ihn wieder trifft (er zweifelt an seinen Kräften), ohne Namen (Einbau setzt `{name}`).
- `gerede`: 20 Zeilen Stadtgerede über seltsame Dinge, die bei den Ritualen passieren (Lichter im Moor, ein Mann, der stundenlang regungslos auf der Straße stand, jemand hat den ganzen Zirkelmarkt leergekauft …).
- `zeitung`: 5 kurze Meldungen (Überschrift + 2 Sätze).
- `lesestueck`: 2 Lesestücke (je 6–10 Sätze): eine alte Abhandlung über Schwellenprüfungen der vierten Stufe, ein Brief eines Gescheiterten.

## 7. `wexmoor_einnahmen.json`: Geld verdienen in Wexmoor
Für das Waage-Ritual soll man in Wexmoor durch echtes Farmen etwa 10 000 Schilling zusammenbekommen. Die Beträge legt der Einbau fest; du lieferst Inhalte mit `lohn_stufe` (`klein`, `mittel`, `gross`):
- **8 Kopfgelder** im Format von `src/data/packs/k3_leben/quests.json` (`kopfgeld_wx_<name>`, Titel, Zusammenfassung, Ziel auf einer bestehenden Wexmoor-Karte: `wx_bahnhof`, `wx_torfstich`, `wx_salzmarkt`, `wx_bojenhafen`, `wx_oberstadt`, `wx_pfahldorf`, `wx_altstadt`, `wx_salzwatt`, `wx_vergessmoor`, `wx_leuchtturm`; Gesuchter mit ID `wxk_<name>`, kurzer Steckbrief, Abgabetext). Auftraggeber: das Wachhaus (`wx_wachhaus`).
- **6 wiederholbare Gelegenheitsarbeiten** (`wxj_<name>`): z. B. Torf stechen, Bojen prüfen, Salzwagen bewachen, Laternen im Watt anzünden, Fundstücke aus dem Vergessmoor bergen, Botengänge für die Akademie. Je Arbeit: Ort, Auftraggeber-Zeile, Ablauf in 2 Sätzen, 3 zufällige Zwischenfälle (je 1 Satz), Abschlusszeile.
- **10 seltene Funde** (`wxf_<name>`) aus Monstergebieten, die Maud Keel, die Pfandleiherin am Salzmarkt (`wx_pfandleiherin`), gut bezahlt: Name, Beschreibung, `lohn_stufe`.
- **3 Zeilen von Maud Keel**, wenn man ihr viel verkauft.

## 8. Abgabe
Acht JSON-Dateien, README, `pruefen.mjs`, Pull Request mit der Prüf-Ausgabe.
