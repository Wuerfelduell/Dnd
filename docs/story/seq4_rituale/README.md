# DR – Ritualtexte der Sequenz 4 und Einnahmen in Wexmoor

Dieses Paket liefert ausschließlich Texte und Datenvorschläge. Es ändert keinen Spielcode und aktiviert keine Mechanik. Die Überarbeitung ersetzt die repetitiven Texte aus PR #326; vorhandene Ritual-, Rezept-, Auftrags- und Fund-IDs bleiben erhalten.

## Dateien und Geltungsbereich

| Datei | Verwendung | Pfade |
| --- | --- | --- |
| `rituale.json` | Pfad-Reiter, Regelkarte, Vorbereitung, Start, Erfolg, konkrete Fehlergründe, offene Notiz | Alle zehn |
| `meldungen.json` | Kurze Rückmeldungen zu bestätigten Ereignissen oder gesperrten Eingaben | Alle zehn |
| `waechter.json` | Intro, vier Zwischenrufe, Sieg/Niederlage, Eisen-Runden, Sonnenaufgang | Alle zehn |
| `kessel_rezepte.json` | Fünf Ritualrezepte; Trink- und Wurfwirkungen als Vorschläge | Kessel |
| `moor_relikt.json` | 20 mögliche Erbeigenschaften, Namensbausteine, fünf Vorlagen, zehn Zersetzungsarten | Moor |
| `nebentexte.json` | Zwei Zuschauerzeilen pro Pfad, acht Zweifeltexte, 20 Gerüchte, fünf Zeitungen, zwei Lesestücke | Alle zehn; Zweifel nur Maske |
| `wexmoor_einnahmen.json` | Acht Kopfgelder, sechs wiederholbare Arbeiten, zehn Funde, drei Verkaufszeilen | Für jeden Pfad zugängliche Einnahmen; Waage als Anlass |
| `einbau.json` | Gemeinsame Texte, vollständiger Pfad-/Ereignisindex, Flags, Platzhalter und offene Anschlüsse | Alle zehn |

Die Aufgabe benennt sieben Inhaltsdateien, verlangt aber acht JSON-Dateien. Die achte Datei `einbau.json` schließt diese Lücke mit einem nutzbaren Anschlussindex. Die Prüfung auf zehn Pfade gilt für pfadbezogene Dateien und den Index, nicht für fünf Kesselrezepte oder Wexmoor-Aufträge. Dort werden stattdessen die ausdrücklich verlangten Inhalte geprüft; es gibt keine künstlichen Rezepte für fremde Pfade.

## Vorlagen und verifizierte Referenzen

- `src/data/packs/halbgott/rituale.json` und `encounters.json`: vorhandener Wächter `hg_schwellenwaechter`, Ton und Abschluss vor dem Trank. Alte ortsgebundene Vorbereitungen, Gegenkosten, friedliche Alternativen und Kampfphasen sind **keine** zusätzlichen Regeln dieser neuen Rituale.
- `src/data/packs/k3_pruefungen/rituale.json`: lesbare Beschreibungen neben strukturierten Daten.
- `src/data/packs/k3_leben/quests.json`: Kopfgelder mit `title`, `kind`, `case`, `summary`, `reward`, `steps`, `done.requires_flags` und `target`. DR ergänzt redaktionelle Felder wie `gesuchter` und `lohn_stufe`.
- `src/data/sude.js`: die fünf vorgeschlagenen Zutatenkombinationen unterscheiden sich untereinander und von den vorhandenen Suden, unabhängig von der Reihenfolge.
- `src/data/items.json`, `pathways.json.items`, `wilds.json.items`: tatsächlich definierte Zutaten, die über `buildContent.js` in `content.items` gelangen. Keine bloßen Beuteverweise als Existenznachweis.
- `src/data/wexmoor.json`: Zielkarten und Monstergebiete. `wx_wachhaus` ist bereits eine **eigene Karte**, mit `zunder` als vorhandener Figur. `wx_pfandleiherin` ist Maud Keel am Salzmarkt.

## Gemeinsamer Anschlussvertrag

1. Vor dem Start Voraussetzungen prüfen; `beginn` erst bei bestätigtem Beginn zeigen. `vorbereitung` ist eine Hilfestellung, keine zusätzliche Pflicht. Keine Bindung an Fall, Stadt oder festes Ritualfeld ergänzen.
2. `s4r_<pfad>_aktiv`, `_done`, `_fehlschlag` sind Flag-Vorschläge. Für Spieler 2 wird `p2_` vorangestellt; Status, Ressourcen und Folgen gehören nur dem Aufsteigenden.
3. Meldungsschlüssel in `einbau.json.pfade.<pfad>.ereignisse` entsprechen den Schlüsseln des jeweiligen Blocks in `meldungen.json`. Sie bezeichnen Textanschlüsse, keine bereits implementierten Engine-Ereignisse.
4. Eine gesperrte Eingabe ist nicht automatisch ein Fehlschlag. Der Regelkern entscheidet, ob er nur die Aktion ablehnt oder ein ausdrücklich vorgegebenes Scheitern bestätigt. Erst danach `rituale.<id>.fehlschlag.<grund>` anzeigen und den Verlust **einmal pro Versuch** anwenden.
5. `{pct}` beim Fehlschlag: Laterne/Maske 20, Echo/Kessel/Moor 25. Bei Faden/Eisen/Schlüssel/Waage/Uhr bleibt die genaue Wahl innerhalb 20–25 % dem Einbau vorbehalten. Die Prozentwerte werden nicht aus Fließtext geparst.
6. Erst nach allen Ritualbedingungen und dem Wächterabschluss `erfolg` zeigen und den Seq-4-Trank freigeben. Erfolg bedeutet noch nicht, dass der Trank gebraut, vorhanden oder getrunken ist. Niederlage bleibt wiederholbar.
7. `koop_zuschauer` spricht mit „Sie“, Erzähler- und UI-Texte mit „du“. Der Zuschauer greift nicht ein. Echo-Zeilen des Begleiters vor beziehungsweise nach der Taubheit verwenden; währenddessen bleiben Wächter und Warnungen stumm.

## Anschlüsse je Pfad

| Pfad | Ereignisse und Regelgrenzen |
| --- | --- |
| Laterne | Aufstellen, schwächste Laterne als Monsterziel, Schwächerwerden/Erlöschen, Halten zum Nachfüllen, Treffer mit Unterbrechung/Schaden/Rückstoß, Eigenlicht, Tod nur durch Licht, Nerven/Spiritualität, drei Unruhestufen. Echtzeit ohne Kampfbildschirm einschließlich Wächter. Sonnenaufgang erst zwischen drei nahen brennenden Laternen; einzelne Laternen wirken nicht gegen ihn. Keine erfundene automatische Niederlage beim Erlöschen einer einzelnen Laterne. |
| Faden | Einzigartige Arten und Gebiete prüfen; Markierungen über Kapitelwechsel speichern. Schlaf und deutlich verstärkten gleichzeitigen Kampf gegen alle fünf anschließen. Heilung im Traum ablehnen. Wächterabschluss und Erwachen separat behandeln, siehe offene Punkte. |
| Maske | Gewöhnliche Zivilgestalt, Beyonder der Sequenz 5 oder einer höheren Machtstufe; nicht versehentlich numerisch größere Sequenznummern als stärkere Gegner behandeln. Gegnerfähigkeiten bleiben erhalten. Normale Angriffe, gewöhnliche Ausrüstung und Tränke erlaubt; eigene Fähigkeiten und Artefakte verboten. Verschonen separat bestätigen, danach dauerhaften Zweifel speichern. `erfolg` erst nach dem Wächter, nicht bereits beim Verschonen. |
| Echo | Drei besiegte Gegner zählen, dann Wächter. Keine Angriffskreise oder akustischen Warnungen; Ausweichen, Parieren, Heilung und Fähigkeiten bleiben möglich. Wächtertexte sind sichtbare Atmosphäre und dürfen nicht als Ersatz-Telegraph vor Angriffen dienen. |
| Kessel | Rezeptfreigabe nur bei vollständig verdauter Seq 5 und Seq-4-Formel. Fünf verschiedene Ritual-Tränke im Versuch brauen und nacheinander trinken; keine zusätzliche feste Sortierreihenfolge erfinden. Nach dem fünften Wächter. Vorbereitete Tränke sind im Kampf erlaubt, ersetzen jedoch nicht das Brauen im Ritual. Normale Angriffe/offensive Fähigkeiten sperren, Heil-/Schutzfähigkeiten zulassen. |
| Eisen | Artefakte im Inventar, Traglast, Rüstungs-/Helm-/Amulettslot bis Kampfende prüfen. Bei erfüllten Bedingungen Wächter am Standort. Ausweichversuch scheitert; Parade und Heilung erlaubt. Rundenmeldungen nur für überstandene Runden 1–5. Der Wächter nimmt schon dort Schaden; lediglich sein Tod ist gesperrt. `verwundbar` bezeichnet aus Kompatibilitätsgründen weiterhin den Textschlüssel, inhaltlich aber **tötbar ab Runde 6**. |
| Schlüssel | Körper regungslos, Schatten auf Karte und im Kampf steuerbar, 40 % Leben, keine Ausrüstung/Heilung/Parade, Ausweichen erlaubt. Schattenattacke immer verfügbar, etwa 80 % Normalschaden, keine Nerven. Zu Rundenbeginn genau eine zufällige eigene Fähigkeit zuweisen, nicht kumulieren. Zwei Gegner, dann Wächter. Bei Schattentod bleibt der Körper am Leben. |
| Waage | Besitz im Lager versiegeln, Inventar/Ausrüstung leeren, Kapital selbst wählen lassen. Zirkel und Angebot unverändert; jede Ware einschließlich einer gegebenenfalls angebotenen Seq-4-Formel für 4000 Schilling kaufen. Nach letztem Kauf Wächter; nur dort Gekauftes, Fähigkeiten erlaubt. Besitzfreigabe an tatsächlich erfolgte Rückgabe nach Versuchsende binden, nicht nur an einen Siegtext. |
| Moor | Fünf okkulte oder sehr seltene Gegenstände; nur Moor-Fähigkeiten zur Zersetzung. Formung aus ihren Resten und zufälligen geerbten Eigenschaften, dann Wächter. Relikt im Kampf verwenden; jede Kampfrunde eine Flasche Moorwasser verbrauchen. Leerer Vorrat oder Regelverstoß scheitern. Nach Aufstieg bleibt das Relikt. |
| Uhr | Drei Monster jeweils mindestens einmal angreifen lassen; normales und misslungenes Ausweichen als Fehler zählen. Vorprüfung scheitert beim ersten Fehler oder Sieg ohne Gegnerangriff. Wächter erlaubt drei Fehler, der vierte scheitert. Angriff erlaubt; Parieren verboten. Zähler nicht über Phasen hinweg vermischen. |

### Offene Regeln ausdrücklich nicht dazuerfinden

Faden und Maske verlangen laut gemeinsamen Eckdaten ebenfalls einen abschließenden Wächter. Beim Faden ist dessen zeitliche Lage zum Erwachen offen; bei der Maske ist die Übertragung sämtlicher Zivilistenbeschränkungen auf den Wächter nicht ausdrücklich festgelegt. Die Texte bieten eigene Abschlussanschlüsse, schreiben aber keine zusätzlichen Werte oder Wächterfähigkeiten fest. Die Anzeige `faden.waechter_erscheint` bezeichnet den Übergang zur Abschlussprüfung, keinen festgelegten Schauplatz.

Beim Schlüssel muss die zufällige eigene Fähigkeit mit dem absoluten Heil-/Parierverbot vereinbart werden. Ob unzulässige Fähigkeiten aus der Auswahl entfernt oder bei Verwendung gesperrt werden, entscheidet der Code-Thread. `einbau.json.offene_anschluesse` hält diese Punkte maschinenlesbar fest.

## Rezept- und Reliktvorschläge

Trink- und Wurfwirkungen sind Entwürfe, keine zugesagten Effekte. Stärke, Dauer, Kosten und Auslösebedingungen legt der Einbau fest; fehlende Werte werden nicht ergänzt. Die bisherigen erfundenen festen 10 % Reliktschaden wurden durch `{pct}` ersetzt.

Der Eigenschaftspool umfasst 20 Möglichkeiten mit Kategorien `glut`, `faden`, `stein`, `schatten`, `salz`. Eine Kategorie beschreibt den passenden Effekt-/Iconbezug. Das Relikt erbt zufällige Eigenschaften der tatsächlich zersetzten Gegenstände; weder alle 20 Effekte noch jede Kategorie sind garantiert. Die Zuordnung alter Gegenstandseigenschaften zum Vorschlagspool erfolgt im Einbau.

Namen entstehen durch unmittelbares Zusammenfügen einer Vorsilbe und einer Nachsilbe, z. B. `Schlick` + `knoten`. `{eigenschaften}` enthält anschließend eine lesbare Liste der wirklich geerbten Eigenschaften. Die zehn Zersetzungstexte unterscheiden Materialarten, erlauben aber nicht automatisch gewöhnliche Gegenstände als Opfer.

## Wexmoor: tatsächliche Arbeit und Verkauf

- Kopfgelder: acht einmalige Steckbriefe; Begegnung auf `steps[0].target.map` an der neuen, mitgelieferten `wxk_*`-ID. Diese Gegner sind Vorschläge und noch nicht gespawnt. Abgabe bei der vorhandenen Figur `zunder` auf `wx_wachhaus`. `auftraggeber: wx_wachhaus` bezeichnet die Institution. `won_kopfgeld_wx_*` und `kopfgeld_wx_*_bezahlt` verhindern Auszahlung ohne Zielerfüllung beziehungsweise doppelte Auszahlung.
- `reward.gives_money: 0` entspricht dem Musterpaket und ist ausdrücklich ein **noch zu ersetzender Balancing-Platzhalter**. Vor Freischaltung reale Beträge nach `lohn_stufe` zuordnen.
- Arbeiten: sechs wiederholbare Aufgaben mit je eigenem Ablauf und drei eigenständigen Zwischenfällen. `auftraggeber` enthält eine gesprochene Zeile, keine erfundene NPC-ID. Je Durchgang einen Zwischenfall auswählen; Auszahlung erst nach tatsächlicher Arbeit, danach neuen Durchgang beginnen. Keine neuen Abkürzungen, kostenlosen Lohnschleifen oder festen Kampfbelohnungen aus den Erzähltexten ableiten.
- Funde: zehn neue `wxf_*`-Vorschläge ausschließlich in bestehenden Monstergebieten aus `wexmoor.zones`. Als seltene Beute anschließen, bei Maud Keel (`wx_pfandleiherin`) gegen den noch festzulegenden Ankaufspreis abgeben und dabei verbrauchen. `fundort` ist eine Beutezuordnung, kein bereits platzierter Schatz.
- Etwa 10 000 Schilling sind das angestrebte Sparziel durch wiederholte Arbeit, Kämpfe und Verkauf, kein garantierter oder gedeckelter Ritualpreis. Höhe, Fundchance und Zeitaufwand müssen nach Einbau ausbalanciert werden. Der Zirkelmarkt bleibt davon unberührt.

## Platzhalter, Anzeige und Prüfung

Erlaubt sind ausschließlich `{n}`, `{pct}`, `{runde}`, `{name}`, `{item}`, `{eigenschaften}`. Die Bedeutungen stehen in `einbau.json`. Zeichenlimits beziehen sich auf die gespeicherten Vorlagen: Regelzeilen höchstens 60, Meldungen höchstens 80 Zeichen. Lange eingesetzte Namen und Eigenschaftslisten müssen im UI umbrechen; keine Daten still abschneiden.

Aufruf aus dem Repository oder einem beliebigen Arbeitsverzeichnis:

```sh
node docs/story/seq4_rituale/pruefen.mjs
```

Node ohne Zusatzpakete. Geprüft werden JSON-Syntax einschließlich doppelter Objektschlüssel, Pflichtfelder, Inhaltsmengen, Satzanzahlen, IDs, leere Texte, defekte/unbekannte Platzhalter, Zeichenlimits, alle zehn Pfadzuordnungen, Ereignisverweise, feste Namen und Verluste. Zusätzlich: existierende Zutaten, Kombinationen gegen die Sude, Wexmoor-Karten, vorhandene Abgabefigur, echte Monstergebiete und Wiederholungen an den zuvor repetitiven Stellen. Referenzen auf dieselbe Ritual-ID in mehreren Dateien sind beabsichtigt; neue Entitäts-IDs dürfen sich nicht doppeln.

Der Prüfer ersetzt keine literarische oder spielmechanische Prüfung. Insbesondere sind offene Kampfregeln und die spätere Farm-Balance nicht durch einen grünen Datencheck erledigt.
