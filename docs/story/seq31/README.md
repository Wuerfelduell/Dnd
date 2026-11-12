# DD · Sequenz 3 und Sequenz 1

Daten- und Textpaket für den separaten Einbau. Es verändert keinen Spielcode.

| Datei | Inhalt |
| --- | --- |
| `pruefungen_seq3.json` | Zehn dreiteilige Prüfungen, je eine Route in Calderwick und Briarholt, friedliche Probe, Dialoge und Zutatenversorgung |
| `register_seq1.json` | Zehn Registerräume, Zeugen, Vorlagen, Gesprächsbäume, Aufstieg und Weltfolgen |
| `verzicht.json` | Sechs Vorwarnungen, zehn gleichwertige Abschlüsse, Zeugenzeilen und Epilogkarten |
| `reaktionen.json` | 54 Reaktionszeilen für neun Klassen und zwei Stufen; zehn Koopzeilen |
| `zeitung.json` | Sechs Seq-3-Meldungen, vier Seq-1-Pfadgruppen, zwei Verzichtsmeldungen |
| `gerede.json` | 40 bedingte Zeilen |
| `lesestuecke.json` | Zehn Berichte gescheiterter Vorgänger, je 120–180 Wörter |
| `pruefen.mjs` | Eigenständige Prüfung mit Node, ohne Pakete |

## Quellen und feste Namen

Die sieben ursprünglichen Pfade stehen in `src/data/packs/sequenzen/seq_4_bis_1.json`. Die drei zusätzlichen Pfade `sq_waage`, `sq_moor`, `sq_uhr` stehen tatsächlich in `neue_pfade.json` daneben. DD verwendet diese unveränderten Namen und Ritualsätze. Bei allen IDs bleibt `sq_` Bestandteil des Pfades, also beispielsweise `vm_register_sq_waage`.

Karten: `k4_orte/maps.json`, `k5_orte/maps.json`; Auftraggeber: `vorrat_figuren/npcs.json`. Pfadzeugen: `src/data/treffen.json`, `src/data/wexmoor.json`, `k3_handel/einzelgaenger.json` und `k3_pruefungen/npcs.json` (Hedda Quist, Waage). Tam Verrin ist die feste Figur `vmn_tam_verrin` aus `docs/art/codex_CX_k6_figuren.md`; CX ist eine deklarierte Abhängigkeit, keine erfundene NPC-Definition. DC liefert die Registergrafik und Abspannbilder.

## Format und Anschluss

Die Listen sind Inhaltsdaten für den Einbau, keine bereits automatisch geladenen Packs. Dialoge verwenden das vorhandene Prinzip `start`, `nodes`, `text`, `choices`, `next`, `requires`; DD speichert Knoten als Liste mit global eindeutiger `id`. Der Einbau indiziert diese Liste nach `id`. `requires_flags` bedeutet UND, `requires_any_flags` ODER, `hide_if_flags` Sperre bei mindestens einem Treffer. Strukturierte Prüfungen wie `relationship`, `sequence`, `has_skill`, `all_present` und die drei `seq31_*`-Aktionen benötigen Adapter. Sie sind keine Behauptung über vorhandene Enginefunktionen.

### Seq 3

- Einstieg ab eigener Sequenz 4 bei Verdauung 100. Einleitung an den beiden `routen`-Orten anbieten. Die drei Teilflags, die Materialvergabe und der Abschluss gehören dem einzelnen Spieler. Stadtwechsel übernimmt den Fortschritt; Route B ist kein zweiter Auftrag.
- Jeder Teil bekommt eine Interaktion mit dem gelieferten Text. Teil 2 verlangt Teil 1, Teil 3 verlangt Teil 2. Der Einbau setzt das betreffende Flag erst nach der beschriebenen Handlung. Bei Maske bleibt die konkret bei Teil 2 gewählte Amtsrolle als Rollenberechtigung gesperrt; keine Kampffähigkeit wird dabei gelöscht. Bei Waage wird die überprüfte Schuld aus der Prüfakte beglichen, ohne eine neue Geldforderung an einen verarmten Spieler zu erfinden. Die Gegenleistung kann die dokumentierte eigene Arbeit sein.
- Alle zehn wählen ausdrücklich die zulässige Variante `friedlich`. Es gibt weder Boss noch Elite und somit keine fingierte Vorratsgegner-ID. Scheitern/Unterbrechen kostet keine Zutaten und kann wiederholt werden.
- `seq3_pruefung_<pfad>_done` wird nach den drei Teilen und der bestätigten Gegenprobe gesetzt. Es vergibt noch keine Sequenz. Zutatenpaket einmal pro Spieler, über `seq31_<pfad>_material_erhalten` gegen Doppelvergabe an Route A/B geschützt. Die in `zutaten_hinweis` genannten Zonen existieren; ihre Materialkisten sind **neue Einbaupunkte**, keine heute vorhandenen Drops. Gesicherter Rand, ohne Eintritt in einen Kampf. Beide Temperaturvarianten Briarholts zeigen dieselbe Kiste.
- Die alten Seq-3-Ritualorte in den Quellen liegen teils in Wexmoor. Beim Einbau die Reisebedingung für Seq 3 durch diese Prüfungen ersetzen; Rezept, Namen und Pfadgrundsatz bleiben erhalten. Mitgeführte Abschriften früherer Aussagen ersetzen eine Rückreise. Für Echo wird ausdrücklich die Abschrift des früher dort gelesenen Nachrufs verwendet. Kein Behaupten einer neuen versunkenen Stadt in Calderwick.
- Alle erforderlichen Abschriften vor der Abreise im Journal dauerhaft sichern. Bereits weitergereiste Spielstände erhalten nur Kopien tatsächlich vorhandener Fallprotokolle; keine erfundenen Beweise. Fehlende Originaldetails werden als unbekannt markiert und in der lokalen Gegenprobe bearbeitet. Rückreise bleibt ausgeschlossen.

### Letzte Register und Zeugen

`k6_done` UND (`k6_ende_schliessen` ODER `k6_ende_uebergeben`) UND eigene Sequenz 2, Verdauung 100. `k6_ende_uebergeben` ist eine zukünftige CT-Abhängigkeit; bis vorhanden bleibt nur Schließen gültig. Andere Enden öffnen keine Register. `seq1_verzicht` oder ein eigener abgeschlossener Aufstieg sperren sämtliche weiteren Registerentscheidungen dieses Spielers.

Die zehn Karten `vm_register_<pfad>` sind 24×16 groß, an `vm_registerkeller` angeschlossen und nach dem Finale bei beiden Gezeiten erreichbar. DD liefert Raumbeschreibungen und vier Props je Raum, keine Tile-Zeilen. Der grafisch als Kampfhintergrund benannte DC-Raum wird ausschließlich als Gesprächskulisse verwendet.

`seq31_zeugen_einladen` ist ein neuer, kostenloser Einbauvorgang nach dem Finale: Der frühere Auftraggeber und die bestehende Pfadfigur erhalten eine Einladung und reisen freiwillig nach Varrowmouth. Tam ist die örtliche Zeugin. Keine Spieler-Rückreise, keine Teleportation, kein Ersatz durch eine neue Figur. Abgelehnte Einladungen oder abwesende Zeugen vertagen nur. Der Einbau muss wiederholbare Vermittlung ohne Kaufzwang anbieten und historische Beziehungen erhalten. Bereits tote oder erzählerisch endgültig ausgeschiedene Zeugen dürfen nicht wiederbelebt werden: dann bleibt der Aufstieg bis zu einer abgestimmten Ersatzzeugenregel gesperrt; der direkte Verzicht bleibt möglich. Diese seltenen Zustände müssen beim Einbau gegen CX/CT geprüft werden.

`vorlagen.beleg` verwendet die bestehenden frühen Abschlussflags plus das spätere Prüfungsflag. Die Flags autorisieren die Anzeige dauerhaft gesicherter Protokolle; sie dürfen nicht automatisch eine inhaltlich falsche Behauptung bestätigen. Im Gespräch werden Herkunft und Gegenprobe genannt. `person` verlangt Tam ≥ +3 und ihre freiwillige Zustimmung. CX muss den Beziehungsaufbau auch nach `k6_done` offenhalten, damit keine frühe Geschenkauswahl den Abschluss blockiert.

Jede Zeugin/jeder Zeuge hat vier Zeilen pro Haltung. Die Anfangshaltungen sind gegen/unentschieden/für. Haltungen ändern den Wortlaut, nicht den Beweiswert. Keine Mehrheitsabstimmung und kein Würfelwurf. Zwei falsche Wege führen ohne Verlust zur Berichtigung oder Pause. Die finale Handlung folgt wortgetreu dem jeweiligen kanonischen Ritualsatz. Der Einbau benötigt eine bestätigte Ritualinteraktion vor `seq31_commit_aufstieg`; eine bloße Dialogauswahl darf die konkrete Handlung nicht ersetzen.

### Atomarer Abschluss und Verzicht

Vor `seq31_commit_aufstieg` erneut Gate, drei Anwesende, Belegflags, freiwillige Beziehung ≥ +3, eigenes Fähigkeitsopfer und Rezeptbestand prüfen. Erst dann in einer Transaktion Rezept verbrauchen, die ausdrücklich benannte Seq-4-Fähigkeit dauerhaft deaktivieren, Sequenz 1 setzen und `seq1_register_<pfad>_done` sowie `seq31_aufstieg_<pfad>` setzen. Das Opfer gilt auch für Zweitmenüs und gespeicherte Ausrüstungen; die sonstigen Fähigkeiten bleiben erhalten. Wiederholung der Aktion ist wirkungslos. Rezeptverbrauch ist ausschließlich das Seq-1-Rezept; keine zweite Abbuchung von `ritual.consumes` zusätzlich. Vor der Bestätigung vollständige Mengen anzeigen.

Die Seq-1-Zutatenquellen nennen bislang zukünftige Bossentwürfe. Für dieses kampffreie Finale muss der Einbau eine garantierte beschriftete Materialausgabe im Registerraum ergänzen: genau das bestehende Rezept einmal pro Spieler nach erfüllten Vorlagen, ohne Boss. Fehlendes Material darf nie zum Kampf zwingen. Ausgabe und Verbrauch getrennt gegen Wiederholung sichern (`seq31_<pfad>_seq1_material_erhalten`).

Der endgültige Verzicht ist gleichwertig und nicht das Fähigkeitsopfer. Zeige die sechs Vorwarnungen, dann eine eigene ausdrückliche Bestätigung. `seq31_commit_verzicht` setzt nur `seq1_verzicht` und `seq31_verzicht_<pfad>`; kein Register-done, keine Sequenzänderung, keine Zutaten- oder Fähigkeitsstrafe. Die abgelegte Flasche ist ein Szenenobjekt, kein zusätzlich zu beschaffendes Inventaritem. Verzicht muss als eigener Einstieg im Registervorraum nach dem Finale erreichbar sein, auch wenn Zutaten, Zeugen, Beziehung oder das Opfer für den Aufstieg fehlen. So bleibt das Ende ohne Sammelzwang möglich. Vor Bestätigung darf man jederzeit vertagen. Nach Bestätigung ist die Wahl dauerhaft.

DC zeigt beim Verzicht eine Flasche im Wasser. Die Texte zeigen das erste Ablegen im Raum; vor der gemeinsamen Bildkarte eine stumme Überleitung zum Ebbe-Steg verwenden. Keine Zutatenvernichtung daraus ableiten. Bisherige okkulte Körpermerkmale werden nicht geheilt: Die menschliche Bildfigur ist die normale Kartenform der bisherigen Stufe.

## Weltfolgen: Zahlenvorschlag

Die drei `seq_1_welt`-Sätze je Pfad sind Vorschläge, kein neuer Kampfsatz.

| Bereich | Seq 3 | Seq 1 | Verzicht |
| --- | --- | --- | --- |
| Zusätzlicher Preisfaktor | 1,00 | 1,00 | 1,00 |
| Neue Reaktionszeile | höchstens 1 je NPC/Spieltag | höchstens 1 je NPC/Spieltag | pfadspezifisches Gerede |
| Gewöhnliche Gegner Seq 9–7 | Text, keine Zusatzwirkung | 100 % Rückzug ohne Beute/XP | bisherige Regeln |
| Gewöhnliche Gegner Seq 6–5 | Text | 50 % freiwilliger Rückzug vor Kampf | bisherige Regeln |
| Seq 4 und stärker, Bosse, feste Szenen | unverändert | unverändert, kein automatisches Überspringen | unverändert |
| Automatisches Ansehen / Sekten-Umtriebe | 0 | 0 | 0 |

Bestehende Preispassive und Beziehungsrabatte werden nicht entfernt; 1,00 bedeutet ausschließlich kein zusätzlicher DD-Multiplikator. Diese ruhigen Reaktionen nicht mit CPs aktiver Kreaturform-Furcht stapeln. Stufenreaktion bei seq=1 hat Vorrang; Seq-3-Text für seq=3. Keine automatische Ohnmachtswelle. Zeitung jeweils einmal je Meldungs-ID; sechs frühere Stadtmeldungen als überregionale Ausgabe am aktuellen Ort zustellen. Gerede enthält klare Bedingungen für Prüfung, Aufstieg und Verzicht.

## Koop und Abspann

Sämtliche Sequenz-, Teil-, Material-, Opfer- und Verzichtsflags sind **spielerbezogen**. CTs Kapitelende ist weltbezogen. Ein globales `seq1_verzicht` darf nicht den Partner sperren. Beziehung für die Personenvorlage ebenfalls pro Spieler prüfen. Der Partner zählt nicht als einer der drei NPC-Zeugen. Seine Gegenstände, Fähigkeiten und Entscheidung bleiben eigenständig. Abspann darf für einen Spieler abgeschlossen werden, ohne den anderen zum Ende zu zwingen. Die zehn Koopzeilen gelten genau dann, wenn einer Sequenz 1 hat.

Reihenfolge: (10) CT-Kapitelende, (20) eigener Aufstiegs- oder Verzichtstext, (30) drei Zeugenreaktionen, (40) eigene Pfadkarte `sequences/abspann_<pfad>.png` oder gemeinsame Verzichtsgrafik mit eigenem Epilogtext, (50) bei Koop zweite bereits bestätigte Spielerentscheidung, (60) gewählte Weltmeldungen, (70) Credits. Bei noch unentschiedenem Partner kein erfundenes Ende anzeigen. Aufstieg verwendet die aktuell gewählte Haltung der drei Zeugen, Verzicht seine drei eigenen Zeilen.

## Prüfung

`node docs/story/seq31/pruefen.mjs`

Prüft alle JSON-Dateien, Pflicht-IDs, globale ID-Eindeutigkeit, nichtleere Strings, Mengen und Wortgrenzen, kanonische Namen/Ritualsätze, echte lokale Karten/NPCs/Zonen, Pfadzugehörigkeit der Zeugen, Rezeptmengen, Graphkanten und Erreichbarkeit aller Knoten, zwei falsche Wege, Finalegate und getrennte Abschlussflags. CXs feste Tam-ID wird gegen dessen Aufgabenvertrag geprüft. Wortzahlen zählen durch Leerraum getrennte Wörter; zusätzlich wird die Gesamtsumme der Textfelder ausgegeben. Das Skript schreibt keine Dateien.
