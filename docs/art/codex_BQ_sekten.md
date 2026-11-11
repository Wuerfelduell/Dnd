# Codex-Paket BQ: Sekten machen Ärger in allen drei Städten (Daten + Texte)

**Schreibt nach:** `docs/story/sekten/` · **Grafik dazu:** `codex_BR_sekten_grafik.md` (läuft parallel, gleiche IDs)

Bisher gibt es Geheimgesellschaften nur als Handelszirkel (Stille Waage, Kreidezirkel, Rußgesellschaft, Lichtlose, Salz, Schichtbund) und zwei Fraktionen (`rostbrueder`, `schleierschwestern` in `src/data/factions.json`). Was fehlt: **Sekten, die wirklich Ärger machen**, und zwar **überall**, nicht an einem Ort. Drei Kulte treiben sich quer durch Kettlegate, Wexmoor und Dunscar, hinterlassen Spuren, werben Figuren ab, vergiften Brunnen, entführen, bauen Schreine, schlagen zurück. Du lieferst die Daten und alle Texte. Der Einbau (Zufallsereignisse je Karte, Umtriebe-Stufe, Gegenmaßnahmen) folgt separat; bleib beim vorhandenen Format.

## 0. Gemeinsame Regeln (bitte zuerst lesen)

Diese Datei ist **in sich vollständig**. **Keinen Spielcode ändern.** Nur `docs/story/sekten/` anlegen und eine Zeile in `docs/story/README.md` ergänzen. Deutsch, Du-Form im Spieltext wie bisher, Oberflächentexte höchstens 140 Zeichen, Dialogzeilen höchstens 220 Zeichen.

### 0.1 Vorhandene Formate (bitte im Repo nachlesen, nicht erfinden)
- Dialoge und Effekte: `src/data/dialogues/*.json` (Knoten mit `text`, `choices`, `requires_flags`, `hide_if`, `sets_flags`, `gives_items`, `takes_items`, `requires_items`, `takes_money`, `nerves`, `travel`).
- Quests: `src/data/quests.json` (Schritte mit `flag`, `hint`, `map`).
- Gegner: `src/data/encounters.json` und `src/data/stadtgegner.json` (`hp`, `atk`, `tier`, `skills`, `loot`, `flees_after`, `elite`).
- Kartenfiguren und Platzierung: `src/data/packs/k3_leben/einwohner.json` und `platzierung.json` als Vorbild für `visible_if`/Tageszeit.
- Zeitung: `src/data/packs/k3_leben/zeitung.json`.
- Ortskürzel: Kettlegate `kg_*`-Karten (siehe `src/data/maps.json`), Wexmoor `wx_*` (`src/data/wexmoor.json`), Dunscar `ds_*` (`src/data/dunscar.json`). Verwende nur existierende Karten-IDs.

### 0.2 Feste IDs (unbedingt so verwenden)
| Kult | ID-Präfix | Kurz |
|---|---|---|
| Der Aschenbund | `sk_asche` | Feuer, Verbrennen von Namen und Akten; rekrutiert Heizer, Schornsteinfeger, Verzweifelte. Heimat Kettlegate, aktiv überall, wo Kohle brennt. |
| Die Flutkinder | `sk_flut` | Wasser, Ertrinken als Taufe; Bojen, Kähne, Kanäle. Heimat Wexmoor, zieht die Kanäle Kettlegates hoch und folgt der Bahn bis Dunscar. |
| Der Stumme Chor | `sk_chor` | Stimmen, gestohlene Namen, Summen ohne Mund; Heimat Dunscar (Nachhall), schickt Sänger in jede Stadt, die „leise Stellen“ suchen. |

Flags beginnen mit `sk_`, Items mit `ski_`, Gegner mit `enemy_sk_`, Figuren mit `sk_`. Die **Umtriebe-Stufe** je Kult heißt `sk_<kult>_stufe` (0 bis 3), gespeichert als Zahl; Texte nennen die Stufen „Gerücht“, „Spuren“, „Umtriebe“, „Aufmarsch“.

## 1. Was gebaut wird (Pflicht)

### 1.1 Drei Kulte mit Struktur (`kulte.json`)
Je Kult: `id`, `name`, `beiname`, `glaube` (3 Sätze), `erkennungszeichen` (sichtbar auf der Karte: Aschekreis / Knotenseil / Kreidemund), `heimat` (Karten-ID), `wanderkarten` (mindestens **8 Karten in allen drei Städten**, davon höchstens 3 in der Heimatstadt), `ränge` (Novize, Sprecher, Hand, Haupt), `stufen` 0..3 mit `beschreibung`, `ereignisrate` (0.0–1.0 pro Kartenbesuch) und `freischaltet` (Ereignis-IDs). **Jede Stufe erhöht die Zahl der Karten, auf denen etwas passieren kann**, nie nur die Heimat.

### 1.2 Ereignisse, die auf der Karte Ärger machen (`ereignisse.json`)
**36 Ereignisse**, 12 je Kult, als Liste mit `id`, `kult`, `min_stufe`, `karten` (Liste erlaubter Karten, **mindestens 3 Städte über alle Ereignisse eines Kults verteilt**), `zeit` (`tag`/`nacht`/`immer`), `art` und Folgen:
- `art: "spur"` (Graffiti/Zeichen als Lesestelle; `text`, `setzt_hinweis`),
- `art: "werbung"` (ein Kultist spricht den Spieler an; `dialog`-Knoten mit Ablehnen/Zuhören/Mitgehen, Mitgehen = `nerves: -5` und Flag),
- `art: "abwerbung"` (eine **bestehende Figur** verschwindet für ein paar Tage: Pimm, Ned, Sedge, Brack, Ruth Bellwick, ein BD-Einwohner; `figur`, `dauer_min`, `rueckholung` als Quest-ID),
- `art: "sabotage"` (vergifteter Brunnen = Heiltränke wirken auf dieser Karte halb; abgedrehte Laternen = Nachtflag; gesperrte Fähre/Bahn = Reise kostet mehr; `wirkung`, `dauer_min`, `gegenmassnahme` Item oder Dialog),
- `art: "schrein"` (temporärer Kultplatz mit 2–3 Kultisten als Gegner, Beute, `abbauen` setzt Stufe um 1 zurück),
- `art: "ueberfall"` (Kampf aus dem Nebel, `gegner`, nur ab Stufe 2),
- `art: "zeichen_am_haus"` (ein NPC-Haus ist markiert, nächster Besuch dort löst Dialog aus).
Jedes Ereignis hat `titel`, `meldung` (140 Zeichen), `folge_stufe` (+1, 0 oder −1 für den Kult) und `koop_zeile` (ein Satz für Spieler 2).

### 1.3 Gegner (`gegner.json`)
**12 Gegner**, 4 je Kult, im Format von `stadtgegner.json`, Tier 1–3, mit `flees_after` bei Novizen und einem nicht tödlichen Ende („wird weggeschleppt“, „taucht unter“). Je Kult ein **Haupt** als Elite (Tier 3, 2 Phasen über `skills`, keine Karte nötig). Beute: je Kult 2 neue Items `ski_*` (Aschensiegel, Flutknoten, Chorkreide usw.) plus vorhandene Schilling-Spannen.

### 1.4 Figuren (`figuren.json`)
**9 Figuren** (3 je Kult: ein Sprecher mit Tarnberuf, ein Aussteiger, ein Opfer oder Angehöriger), Lauf-Sheet-ID = Figur-ID, je 8 Dialogknoten im vorhandenen Format, drei Ansehensbegrüßungen, eine Pfadreaktion. Aussteiger geben die Gegenmaßnahmen (Rezept für Läuterwasser, Seilschnitt, Stimmwachs).

### 1.5 Aufträge (`auftraege.json` + `dialog_zusaetze.json`)
**3 Ketten, je 5 Schritte, jede Kette führt durch alle drei Städte** (z. B. Aschenbund: Kettlegate Heizkeller → Wexmoor Torfstich → Dunscar Lohnbüro → zurück). Schritte nutzen vorhandene Karten und maximal eine neue Lesestelle je Karte. Plus **6 kleine Aufträge** (je Kult 2) mit einem Schritt: Schrein abbauen, Entführten zurückholen, Zeichen übermalen. Belohnungen: Schilling 40–180, einmal ein Artefakt je Kette (Quelle `sekten`, Segen und Fluch wie in `pathways.json` → `artifacts.list`). `dialog_zusaetze.json` hängt bei **10 vorhandenen Figuren** einen Zweig an (Marlowe, Holt, Greta, Zunder, Hale, Pfiff, Hedda, Kittering, Ruth Bellwick, Dr. Varga).

### 1.6 Umtriebe-Texte (`texte.json`)
Je Kult und Stufe: Zeitungsmeldung (3 je Stufe, Format `zeitung.json`), 6 Gerede-Zeilen für Einwohner, HUD-Hinweis beim Betreten einer betroffenen Karte, Notizbuch-Eintrag (Kult-Steckbrief wächst mit der Stufe: 4 Absätze je Kult), Wegweiser-Text, wenn der Spieler feststeckt. Dazu 12 Koop-Geplauder (4 je Kult).

### 1.7 Steckbriefe für die Grafik (`grafik_briefe.md`)
Für jede der 9 Figuren, 12 Gegner, 3 Erkennungszeichen, 3 Schreine und 6 Items ein Absatz Aussehen (Kleidung, Farben in Worten, Haltung, Requisit), damit BR genau dazu passt.

## 2. Spielregeln, die die Daten einhalten müssen
- Kein Kult ist an einen Ort gebunden: über alle Ereignisse eines Kults kommen **mindestens 8 verschiedene Karten in 3 Städten** vor.
- Nichts davon blockiert Hauptgeschichte, Fälle oder Kapitelenden; Sabotage ist zeitlich begrenzt (`dauer_min` 6–20 Spielminuten) und immer mit Gegenmaßnahme.
- Keine neuen Karten, keine neuen Pfade, keine neuen Sequenzen. Abgeworbene Figuren kehren immer zurück (Quest oder Zeitablauf).
- Nerven-Verluste höchstens 10 je Ereignis; keine permanenten Strafen; kein Verlust von Inventar außer bewusst eingesetzten Gegenmaßnahmen.
- Koop: jede Zeile funktioniert mit einem oder zwei Spielern.

## 3. Lieferung
`docs/story/sekten/`: `kulte.json`, `ereignisse.json`, `gegner.json`, `figuren.json`, `auftraege.json`, `dialog_zusaetze.json`, `texte.json`, `grafik_briefe.md`, `README.md` (Zusammenfassung, Zählung, Einbauhinweise: wo die Umtriebe-Stufe greifen soll), `offene_punkte.md`, `pruefen.mjs` (Node: zählt alles, prüft Karten-IDs gegen `loadContent()` aus `tests/helpers.js`, prüft, dass jeder Kult 3 Städte abdeckt, Textlängen, eindeutige IDs). Eine Zeile in `docs/story/README.md`. Dann ein eigener Pull Request.
