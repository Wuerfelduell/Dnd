# DK · Das Nachspiel

Reines Daten- und Textpaket für den separaten Einbau. Ausschließlich dieser Ordner wird geändert. Stand: `6ccced920b21ee296edba27f20d5215e68b62695` von `Wuerfelduell/Dnd`, 11. November 2026.

**Status: Inhalt und sämtliche verwendeten IDs geprüft; DE-/DJ-Systemanschlüsse noch offen.** CT #297, CU #291, CX #293, DD #292 und DG #295 sind während der Bearbeitung eingetroffen und gegen ihre konkreten Commitstände gelesen. `quellen.json` hält diese Stände fest. Keine fremden Paketdateien werden in diesen PR kopiert. Nur die Fahrende Auktion und die benannten Gegner fehlen noch als Datenpakete; ihre beiden Dateiverträge halten den strengen Freigabelauf rot.

## Dateien und Umfang

| Datei | Inhalt |
|---|---|
| `zustaende.json` | 16 Zustände, 160 Geredezeilen, Ankunft, Sprecher-/Kartendeltas, Preisregel, 16 neue Zeitungsnotizen, Nachtregeln |
| `gespraeche.json` | 18 Hauptgespräche mit je zwei vollständigen Wegen à 12 gesprochenen Zeilen, 36 kurze Gespräche/Auskünfte à 5 Zeilen, sechs Koop-Gespräche |
| `offene_faeden.json` | Vollständiges Inventar: 60 Nebenaufträge, 20 vorhandene Dunscar-Prüfungs-/Ritualaufträge, zehn DD-Prüfungen; sechs neue Aufträge mit je drei Schritten |
| `reise.json` | Küstenbahn, sechs Halte, Fahrplan in beide Richtungen, 30 gerichtete Verbindungen, sechs ruhige Ereignisse |
| `abschluss.json` | Sechs Lesestücke mit Zustandsersatz, 30 zusammengesetzte Abspannzeilen in Solo/Koop, sechs Hauptmenü-Untertitel |
| `anschluss.json` | Zustandsableitung, Endgruppen, neue Adapterflags, DD-/DE-/DG-/DJ-Anschlüsse |
| `quellen.json` | Exakte gelesene Dateien mit SHA-256, überprüfbare JSON-Pointer, getrennte Liste fehlender Definitionen |
| `pruefen.mjs` | Node-Prüfer ohne Pakete; Inhalt, Quellen, Umfang, Dialogwege, Zustandskombinationen und Wortzahlen |
| `pruefausgabe.txt` | Ausgabe der letzten Prüfung einschließlich offener Abhängigkeiten |

Die Mengenangabe „ca. 60“ wird nicht durch Auslassen vorhandener Prüfungen erreicht: Das verlangte vollständige Inventar hat 90 Einträge. Die Zustandszahl ist 16: zwei in Kettlegate, drei in Wexmoor, zwei in Dunscar, drei in Calderwick, zwei in Briarholt und die vier ausdrücklich verlangten Varrowmouth-Enden.

## Anschluss an das bestehende Datenformat

Bestehende Dialoge verwenden `start`, `nodes`, `text`, `choices`, `next` und Flag-Bedingungen. Diese Felder bleiben gleich. DK ist ein Overlay, kein direkt importiertes Laufzeitpaket. Der Einbau erledigt folgende Übersetzungen:

1. `gespraeche` nach `id` in die Dialogtabelle übernehmen. `npc` bestimmt den Gesprächspartner. `speaker` ist die einzelne Zeilenrolle; `np_erzaehler`, `np_spieler_1` und `np_spieler_2` sind lokale Anzeigerollen, keine neuen Weltfiguren.
2. `text_by_state` und `text_by_ending` vor Anzeige auf genau ein `text` auflösen. Die Ende-Zeile benutzt die tatsächliche Kapitelentscheidung, nicht nur den groben Stadtzustand. Damit bleiben etwa Wexmoors Turm-Enden und Calderwicks Amtsübernahme getrennt erkennbar.
3. `next` an einem gewöhnlichen Knoten als Schaltfläche „Weiter“ darstellen. `choices` bezeichnet die einzige echte Entscheidung des Hauptgesprächs. Sie verändert nur die Antwort, keine Beziehung und kein Kapitelende. Abbrechen und Wiederholen sind folgenlos. Bei zwölf Zeilen wird jede besuchte Sprecherzeile gezählt, keine Auswahlbeschriftung.
4. `text_by_state` ist kein neues Quellflag: `anschluss.json` berechnet den Zustand bei Stadtbetreten und bei relevanten Flagänderungen. Kein Flag aus einem früheren Ende wird zurückgesetzt.
5. Neue Aufträge nach `id` in die Questtabelle übersetzen. `steps[].target.npc` wird zur vorhandenen Ziel-ID. Die drei `sets_flags` werden ausschließlich nach dem jeweiligen beschriebenen Gespräch beziehungsweise der bestätigten Handlung gesetzt. Der Folgeschritt verlangt Annahme und vorherigen Schritt. Der Einbau registriert je Schritt eine beschriftete Gesprächsauswahl beim angegebenen NPC; es werden keine neuen Kartenobjekte oder Items vorausgesetzt.
6. Die Belohnung wird erst bei bestätigter Abgabe ausgeführt: Schritt 3, noch kein `once_flag`, Möbeldefinition verfügbar. Eintrag in `hausrat.furniture_owned` und `once_flag` atomar speichern. `gives_money: 0` unterdrückt die übliche Nebenquest-Pauschale. Ablehnung lässt den Auftrag offen. Ein Absturz oder wiederholtes Gespräch darf keine zweite Ausgabe erzeugen.
7. Kein Schritt darf allein durch Öffnen des Journals oder durch Anwesenheit auf der Zielkarte erfüllt werden. Für „Vergleichen“ wird der Originalbefund angezeigt, für „Zurückgeben“ die Übergabe bestätigt. Fehlt der Befund, bleibt der Schritt offen und nennt den fehlenden Quellanschluss.

## Start, Weltzustand und Rückkehr

`k6_done` und genau eines der vier K6-Endflags sind erforderlich. Die Endgruppen in `anschluss.json` müssen vollständig und widerspruchsfrei sein. `k6_ende_teilen` ist im Solo-Spiel ungültig. Bei fehlenden oder mehrfachen Enden eine Diagnose ausgeben; nicht durch Reihenfolge ein „gutes“ Ende auswählen. Die Ende-ID von Kapitel 1 kommt aus dem gespeicherten Fall-9-Ergebnis (`c9_perfect`, `c9_good`, `c9_early`, `c9_vey`); `kapitel1_done` allein unterscheidet diese vier Ergebnisse nicht. Alte Spielstände ohne Ergebnis brauchen eine nachvollziehbare Migration aus ihrem Fallabschluss, keinen geratenen Standard.

`nachspiel_bahn` ersetzt nach diesem Gate ausschließlich die Kapitelregel gegen Rückreisen. Die Freigabe hebt weder Polizeifolgen noch verschlossene Privaträume, Mitgliedschaft, persönliche Prüfungsbedingungen oder Entscheidungskosten auf. Stadtwechsel setzt keine Ankunfts-/Akt-/Questflags erneut und wiederholt keine Erstankunftsszene. Journal-Einträge älterer Städte werden aus gespeicherten Fortschritten wieder sichtbar gemacht, nicht neu angelegt oder zurückgesetzt.

Die Welt verwendet die Kapitelentscheidungen des gemeinsamen Spielstands. Persönliche Pfade, Stufen, Verzicht, Inventar und Prüfungsfortschritte bleiben je Spieler getrennt. Bei Beitritt gilt der Weltzustand des Hosts, nicht ein Mischzustand aus beiden Einzelspielen. Der Einbau muss alte nur global gespeicherte persönliche Fortschritte ausdrücklich migrieren; DK liefert keinen erfundenen Besitzstand.

### Zustandsableitung

`requires_flags` ist UND, `any_flags` ist ODER, `hide_if_flags` bedeutet keines davon. `alternativen` ist ODER über vollständige Bedingungsobjekte. Pro Stadt muss genau eine Regel passen. Priorität ist nur zur Diagnose angegeben, kein Ersatz für diese Eindeutigkeit.

| Stadt / Zustand | Bedingung | Folge |
|---|---|---|
| Kettlegate / `fahndung_beendet` | `np_fahndung_aufgehoben` | Alte Starling-Fahndung zurückgenommen; andere aktuelle Delikte bleiben bestehen |
| Kettlegate / `fahndung_offen` | Flag fehlt | Rückreise möglich; Revierkontakt für die Rücknahme bleibt zugänglich |
| Wexmoor / `gilde_zerschlagen` | `np_gilde_zerschlagen` | Schrein gesperrt; Mitglieder einzeln ansprechbar |
| Wexmoor / `gilde_offen` | `treffen_namensgilde`, nicht zerschlagen | Schrein mit bestehender Mitgliedschaft zugänglich |
| Wexmoor / `gilde_verborgen` | Beide Flags fehlen | Keine fälschlich behauptete Zerstörung; Aufnahme weiterhin möglich |
| Dunscar / `zug_faehrt` | `k3a_end_feierabend` oder `k3a_end_gegenstimme` | Gewöhnliche Küstenbahn; Gegenstimme behält ihre Betriebsvorbehalte |
| Dunscar / `endbahnhof_bleibt` | `k3a_end_stilllegung` oder `k3a_end_vollzaehlig` | Neuer Außenanschluss; alte Anlage bleibt stillgelegt beziehungsweise belastet |
| Calderwick / `geraeumt` | `cwa_end_buecher` | Kein Wiederbesiedeln; vereinbarte Besuche am Gleisfuß |
| Calderwick / `unterschrift_zurueck` | `cwa_end_widerspruch` | Einzelne Zeugnisse; keine kollektive Zustimmung |
| Calderwick / `unterschrift_fehlt` | `cwa_end_amtsinhaber` oder `cwa_end_ordnung` | Machtübernahme und Sammelzustand bleiben in Ende-Zeilen unterscheidbar |
| Briarholt / `warm` | `bha_ventil_hof_offen`, nicht `bha_end_winter` | Ankunft am tatsächlich warmen Kutschenhof |
| Briarholt / `kalt` | Winter-Ende oder Hofventil nicht offen | Kalte Ankunft; Frosts eigener Ofen bleibt unabhängig |
| Varrowmouth / `schliessen` | `k6_ende_schliessen` | Frei; spätere Flut bleibt Verantwortung |
| Varrowmouth / `verbrennen` | `k6_ende_verbrennen` | Geräumt, nur Ebbe-Ruine; keine Bewohner in der Ruine |
| Varrowmouth / `uebergeben` | `k6_ende_uebergeben` | Nell trägt das Register; Spieler bleibt ihr Schreiber |
| Varrowmouth / `teilen` | `k6_ende_teilen` und Koop | Gemeinsame Last; kein Sequenz-1-Aufstieg |

Briarholts grober Ankunftszustand schaltet **nicht alle Karten** auf warm/kalt. Jede Karte behält ihre vorhandene `warm_if`-Bedingung. Das Winter-Ende hat Vorrang; die Einbau-Migration muss alte offene Ventilflags gegen den abgeschlossenen Anlagenzustand abgleichen. Wärme ist kein moralisches Urteil: Wahl, Verwahrung und schmerzlose Aussaat werden zusätzlich über das Kapitelende erzählt.

**Zwei neue Flags sind bewusst DK-eigen:** In K1 gibt es im gelesenen Stand keinen belegten globalen Aufhebungsflag. `k2_price_done` bedeutet auch Bestechung oder Kampf; selbst `k2_price_ally` beweist keine zugestellte amtliche Rücknahme. `np_ruecknahme` bietet deshalb eine neue Prüfung und Zustellung, dann setzt es `np_fahndung_aufgehoben`. Marlowe beendet die alte Fahndung durch eine neue datierte Verfügung; weder werden frühere Belege gefälscht noch sämtliche Straftaten vergeben. Der Reviertermin hat für dieses Gespräch Schutz vor einer sofortigen erneuten Verhaftung wegen genau dieser alten Fahndung.

Für die Gilde ist eine Mitgliedschaft belegt, aber kein Zerstörungsereignis. `np_gilde_zerschlagen` bleibt standardmäßig falsch. Erst ein belegtes, später eingebautes Ereignis darf es setzen. Das Fehlen von `treffen_namensgilde` darf es niemals setzen. Die dritte Fassung `gilde_verborgen` verhindert diesen Fehlschluss. Alle drei Fassungen sind bereits ausgearbeitet.

## Fahrplan und sichere Halte

Start an beiden Endpunkten täglich um 06:00, 12:00 und 18:00 Spielzeit. Reihenfolge: Kettlegate, Wexmoor, Dunscar, Calderwick, Briarholt, Varrowmouth; 30 Spielminuten pro Teilstrecke. Ostwärts gilt `Startzeit + Index × 30`, westwärts `Startzeit + (5 − Index) × 30`. An Zwischenhalten lässt der Einbau nur tatsächliche Abfahrten auswählen. Die früheste nicht vergangene Abfahrt wird angeboten; andernfalls die erste am Folgetag. Warten nur nach bestätigter Wahl. Die ganze Fahrt wird als eine Reise mit der summierten Dauer gespeichert. Keine Echtzeitwartepflicht.

Alle 30 verschiedenen Start-Ziel-Paare kosten 0 Schilling: Kein Spieler kann ohne Geld in einer früheren Stadt stranden. Keine neue Karten-ID wird angelegt; ein Interaktionspunkt am vorhandenen Halt öffnet die Reisewahl. Sichere Spawnkoordinaten sind mit den tatsächlichen Karten zu verbinden. Während Warten/Reise greifen keine Gebietskämpfe. Es gibt je Fahrt höchstens ein ruhiges Ereignis, zyklisch nach gespeichertem Reiseindex. Oren erscheint nur bei einer Strecke über Dunscar und tatsächlicher Anwesenheit; andernfalls wird sein Ereignis ohne Zählerverlust übersprungen. Er ist Lokschlosser, kein neu erfundener Schaffner. Personal wird dadurch nicht gleichzeitig an zwei Orten gespawnt.

Dunscars Küstenbahn ist technisch und erzählerisch unabhängig von der alten Anlage. Stilllegung bleibt Stilllegung; Vollzähligkeit wird nicht zur Befreiung umgeschrieben; Gegenstimme erhält keinen unbeaufsichtigten Betrieb.

**Varrowmouth nach Verbrennen:** `vm_zollhafen` bezeichnet den äußeren sicheren Bahn-/Fährzugang, nicht bewohnte Ruinen. Der Einbau braucht dort einen durch CU bestätigten sicheren Spawn außerhalb der Überflutung. Solange der fehlt, Ankunft nach Briarholt umlenken und den Ruinenbesuch nicht anbieten. Keine erfundene begehbare Kachel. Bei Ebbe kontrollierter Besuch freigegebener Ruinenflächen; `vm_registerkeller` und `vm_stegviertel` bleiben gesperrt. Bei Flut kein Einstieg in die Ruine. Vor dem Wechsel wird die Gruppe zum bestätigten sicheren Halt zurückgeführt, ohne Schaden, Inventarverlust oder neuen Stadtzustand. Rückreise bleibt dort zu jeder Gezeit verfügbar. Der Ruinenmodus unterdrückt alle ursprünglichen Wohn-, Laden- und Bewohner-Spawns.

## Sprecher, Geschäfte, Nacht und Zeitung

Normale Anwesenheits-, Haft-, Überlebens- und Tagesplanbedingungen bleiben maßgeblich. Kein Ende wird durch DK zugunsten eines bequemeren Gesprächs geändert. Fehlt ein Sprecher, wird der Gesprächsbaum nicht von einem unsichtbaren NPC gesprochen: Stattdessen erscheint ausschließlich `abwesenheit.text` mit einer bereits hinterlegten Auskunft. Daraus folgen weder Zustimmung noch Belohnung. Hauptgespräche sind bei verfügbarer Person vollständig spielbar; nicht verfügbare Varianten werden im Journal als solche benannt.

| Lage | Anschluss |
|---|---|
| Kettlegate, Wexmoor, Dunscar | Bestehende Figuren an bestehenden Orten; keine pauschalen Wiederbelebungen oder Haftentlassungen |
| Wexmoor, Gilde zerschlagen | `tm_esse`, `tm_kerbe`, `tm_mulde` nur bei bestätigter Anwesenheit einzeln am Salzmarkt erreichbar; der Zirkel-Laden bleibt geschlossen |
| Calderwick geräumt | Die neun DK-Gesprächspartner kommen ausschließlich nach vereinbartem Termin zum Gleisfuß; keine Wohn-/Ladenspawns in leeren Häusern |
| Briarholt schmerzlos | Orlas Weggang bleibt bestehen; DK benutzt für die drei Hauptgespräche Frost, Enna und Felix; deren Aussagen entschuldigen die Aussaat nicht |
| Varrowmouth verbrannt | Pegelherrin entfernt; überlebende Evakuierte bei vereinbarten Besuchen am Kutschenhof in Briarholt, keine Bewohner zwischen den Ruinen |
| Varrowmouth Rat/Schreiber | Sechs schriftliche Auskunftsgespräche mit vorhandenen festen CX-IDs; mit den inzwischen gelesenen CX-Bögen abgeglichen, ohne deren Geheimnisse pauschal aufzudecken |

Bei den schriftlichen Varrowmouth-Auskünften ist der angegebene NPC die Herkunft, `np_erzaehler` die Anzeige. Ein Besuch ist nicht erforderlich. Jede Auskunft besteht aus fünf Zeilen. Die drei Hauptgespräche sind gegen CX-Stimmen und CT-Endfolgen abgeglichen. CX blendet alle Routinen nach `k6_done` aus: `routine_override` aktiviert ausschließlich die neun DK-Kontakte als Termine, niemals die Pegelherrin oder sämtliche übrigen Bewohner. Bei Verbrennen gelten ausschließlich die externen Termine in Briarholt. DK verlangt hier „Sie“, auch bei Nell; das ist die ausdrückliche Anrede dieses Pakets, während CT für Nell abweichend „du“ vorsieht.

Neue Sprechstunden 06:00–18:00 ersetzen keinen existierenden Tagesplan. Nachts kann man Auskünfte lesen oder einen Termin wählen; keine Figur wird dafür teleportiert. Die vorhandene Nachtbeleuchtung bleibt, zwei zusätzliche Nacht-Geredezeilen je Zustand ergänzen sie. Nach 18:00 werden nur noch tatsächlich bevorstehende Zwischenhalt-Abfahrten angeboten.

`aenderungen.zeitung` liefert eine neue DK-Meldung und keine erfundene Ausgabe-ID aus den anderen Paketen. Als ein Lesestück/Meldung pro Zustand in den örtlichen Zeitungskasten einhängen. In Ruinen und geräumten Städten liegt sie am sicheren Halt. Frühere Ausgaben bleiben archiviert.

Nur Briarholts kalte Ankunft erhält als Vorschlag +5 % auf gewöhnliche Verbrauchswaren; warmer Zustand 100 %. Kaufpreis auf ganze Schilling aufrunden, Mindestpreis 1; Verkauf bleibt beim Basiswert, damit keine Rundreise-Arbitrage entsteht. Keine Wirkung auf Zutaten, Quests, Auktion oder einmalige Belohnungen. Den Faktor aus dem Grundpreis neu berechnen, nicht bei jedem Betreten erneut multiplizieren. Alle nicht genannten Läden behalten ihren Preis. Räumung schließt örtliche Läden, statt aus ihnen Geisterhändler zu machen.

## Offene Fäden und neue Aufträge

Für jeden der 80 vorhandenen Aufträge ist die wirkliche letzte Schrittbedingung aus dem aktuellen Quellpack übernommen. Das berücksichtigt insbesondere Briarholts `_bezahlt` und `bhn_reserve_geprueft` statt eines erfundenen allgemeinen `_done`. Bei DD wird `seq3_pruefung_<pfad>_done` von der bestätigten Probe gesetzt; Prüfung und anschließendes Trinken bleiben getrennt. Die DD-Auftraggeber, Alternativorte und Stufenvoraussetzungen sind jetzt konkret in jedem Eintrag hinterlegt. Die zehn Pfad-IDs lauten einschließlich `sq_waage`, `sq_moor`, `sq_uhr` genau wie in den Quellen. Nicht aus den Anzeigenamen `waage`, `moor`, `uhr` ableiten.

Aufträge noch nicht angenommen: Originalangebot erneut erreichbar machen, aber ursprüngliche Beziehungs-/Pfad-/Sachbedingungen behalten. Bereits aktiv: am ersten unerfüllten Schritt fortsetzen. Abgeschlossen oder bezahlt: niemals erneut auszahlen. Verzweigungen, vorhandene Belege und Entscheidungen nicht zurücksetzen. Fortsetzungszeilen sind Begrüßungen, keine Quittungen.

Bei Räumung: vorhandene Originalbelege oder nachweislich vorhandene Abschriften am sicheren Halt zur Prüfung zugänglich machen; ursprüngliche IDs und Herkunft behalten. Keine neuen belastenden Aussagen erfinden. Gesprächsorte von Klammer/Ida/Noel werden auf den vereinbarten Besuch umgebunden. Physisch zerstörte, nie dokumentierte Belege dürfen nicht automatisch als gefunden gelten. Solche Fälle müssen mit dem liefernden Pack einen konkreten Ersatzweg erhalten. Dieser fehlende Quellenabgleich ist ein Einbaublocker, kein stiller Questabschluss.

Die zehn alten `k3p_ritual1_*`-IDs sind Legacy-Aufträge aus `k3_pruefungen`. Ihre Bezeichnung ist keine Erlaubnis, DDs spätere Sequenz-1-Prüfung zu umgehen. Nur unerledigte persönliche Schritte/Quittungen fortsetzen; niemals eine Stufe nochmals vergeben oder wegen einer Rückreise absenken. Der Einbau muss die ursprünglichen Ritualwirkungen gegen DD abgleichen, bevor diese Angebote aktiviert werden.

| Neuer Auftrag | Ablauf / Kontakt | Belohnungsvertrag |
|---|---|---|
| `np_ruecknahme` | Marlowe prüft, Holt stellt zu, Marlowe quittiert | `haus_sessel`; zusätzlich `np_fahndung_aufgehoben` |
| `np_trockene_tafel` | Sedge gibt Erlaubnis, Ada Venn hilft beim Vergleich, Sedge nimmt zurück | `haus_vorhang` |
| `np_fahrplanrand` | Nellie gibt Durchschlag, Oren prüft Uhr, Nellie berichtigt | `haus_lampe_tisch` |
| `np_lose_lage` | Klammer übergibt, Ida korrigiert selbst, Klammer erhält getrennte Blätter | `haus_reisekoffer` |
| `np_ofenblech` | Frost übergibt kalt, Malkin prüft, Frost beaufsichtigt Rückbau | `haus_buecherstapel` |
| `np_trockener_rand` | Tam erlaubt die Reinigung des Topfrands, du säuberst ihn am sicheren Halt, Tam gibt den Farn frei | `haus_pflanze_farn` |

Die sechs Belohnungen sind belegte DG-Möbel, keine DI-Platzhalter. Alle Bonuswerte und Stellregeln bleiben unverändert bei DG. DK bietet einen zusätzlichen Erwerbsweg; Kauf/Fund desselben Stücks und die neue Belohnung teilen dieselbe Besitzprüfung. Bereits vorhandene Möbel werden quittiert, niemals dupliziert oder in Geld umgewandelt. Vor Annahme zeigt das Gespräch das Stück und einen Hinweis auf vorhandenen Besitz. Auch ohne gekauftes Haus darf das Stück im vorgemerkten gemeinsamen Hausrat liegen; es gewährt bis zum Aufstellen keinen Bonus.

Koop: Fortschritt der kleinen Aufträge gemeinsam, Belohnung und `_bezahlt` genau einmal pro Haushalt. Beide Spieler sehen die Quittung; gleichzeitige Abgaben verwenden dieselbe Revision/Transaktion. `np_fahndung_aufgehoben` ist eine Weltfolge der amtlichen Verfügung. Die alten Prüfungen und DD-Fortschritte bleiben davon unabhängig persönlich.

## Weiterlaufende Systeme und Sequenz 1

DE behält seinen Kalender, Bieter, Einlieferungen und laufende Auktionen. Keine Neuverlosung oder zweite Ausgabe beim Laden eines Stadtzustands. Geräumte Städte benutzen einen sicheren externen Termin; keine Auktion in der Flutruine. Konkrete DE-Termin-/Sprecher-IDs erst nach Lieferung verbinden.

DJ behält sämtliche Sichtungs-, Beute- und Siegmarkierungen. Seine ausdrücklich einmaligen Gegner werden im Nachspiel nicht wiederbelebt. Nur noch unbesiegte Begegnungen unter ihren eigenen Sequenz-/Nacht-/Gezeitenbedingungen anbieten. Gesperrte Orte brauchen einen von DJ bestätigten Ersatzort; bis dahin bleiben sie als offener Anschluss sichtbar. K6-Bosse selbst werden durch DK nicht wiederholt.

DD ist für Prüfungen, Zeugen, Kosten, persönliche Stufe und Verzicht maßgeblich. Sequenz 1 nur bei Schließen/Übergeben und erfülltem DD-Ritual; nie bei Verbrennen/Teilen. `seq1_verzicht` nicht löschen. Keine automatisch vergebene Stufe bei Start oder Ende des Nachspiels. Reaktionsklassen aus `seq31/reaktionen.json` vor dem DK-Gespräch einfügen, pro Gespräch höchstens eine passende Zeile. Je Spieler dessen reale Stufe verwenden. Die zehn persönlichen DD-Endkarten kommen bei Bedarf **nach** DKs 30 Zeilen als separater Abschnitt, nicht als zusätzliche Zeilen in der 30er-Zählung.

## Haus, Abspann und Koop

DG liefert `haus_owned`, das gemeinsame Objekt `hausrat`, die sechs Hauskarten und die Betten. DK ergänzt die bestätigte Abschlussauswahl am Bett. Ein Nachspiel ohne Haus bleibt möglich; den regulären Hauskauf nachholen können. Kein kostenloses Haus, kein Abschluss über ein nicht existierendes Bett. Nach Verbrennen ist die sichere Unterkunft in Briarholt maßgeblich, nie ein bewohntes `haus_varrowmouth` in der geräumten Ruine. `haus_briarholt` ist in DG belegt und steht als `verbrennen_house_map` im Abschlussdatensatz. In allen übrigen Enden darf das Bett jeder tatsächlich gekauften und zugänglichen DG-Unterkunft benutzt werden.

Schlafen bietet ausdrücklich „Nachspiel für heute abschließen“ an. Abbrechen verändert nichts. Bestätigung speichert den Spielstand und `nachspiel_abschluss`; offene Aufträge bleiben aktiv, die Bahn bleibt freigeschaltet. Der Abspann ist kein endgültiges Löschen oder Sperren des freien Spiels. Fortsetzen bringt dich in den gespeicherten sicheren Hauszustand zurück.

Koop braucht die Bestätigung beider verbundenen Spieler. Abbruch, Disconnect oder abweichende Wahl bricht den Abschluss vor Flag-/Zeitänderung ab. Dasselbe gilt für Reisen: erst beide Zusagen, dann eine gemeinsame Zeiterhöhung und ein gemeinsamer Zielspawn. K6-Teilen bleibt eine gemeinsame Verantwortung; die neue Bahn hebt nur die Reisesperre auf, nicht die Rollen aus dem Ende. Dasselbe gilt für die Schreiberpflicht bei Übergeben.

Abspannalgorithmus: Kapitelreihenfolge K1 bis K6, je genau fünf Slots aus `abschluss.json`, sortiert nach `position`. Pro Slot in Koop zuerst `koop`, sonst `text`, sonst passende `text_by_state`, sonst passende `text_by_ending`. `koop_modus: gleicher_weltzustand` verwendet bewusst dieselbe Zustands-/Ende-Zeile. Genau 30 nichtleere Zeilen ausgeben. Fehlende Variante ist ein Datenfehler, kein leerer Bildschirm. Das Kapitel-1-Ergebnis wird getrennt vom heutigen Fahndungszustand berücksichtigt.

Hauptmenü: Nach erstmaligem Abschluss Variante 1; bei ausdrücklich erneut angesehenem Abschluss Variante 2 usw., nach Variante 6 wieder 1. Den Index speichern; bloßes Öffnen des Menüs oder Laden darf ihn nicht weiterdrehen. DM bekommt nur die sechs Untertiteltexte, keine neue Bildanforderung.

## Prüfung und Freigabe

```sh
node docs/story/nachspiel/pruefen.mjs --allow-pending --self-test
node docs/story/nachspiel/pruefen.mjs
```

Erster Aufruf prüft Inhalte und meldet offene Verträge ausdrücklich; Exit 0 bedeutet hier **nicht** vollständigen Quellenabgleich. Zweiter Aufruf ist die Freigabeprüfung und bleibt bis zum Auflösen der fehlenden Quellen rot. Nach Lieferung: jede offene Definition an einer echten Definition nachweisen, JSON-Pointer und Hash in `quellen.json` ergänzen, erst dann aus `offene_definitionen` entfernen. Ein vorhandener Dateiname oder eine Erwähnung im Prompt reicht nicht.

Der Prüfer kontrolliert doppelte JSON-Schlüssel einschließlich escaped Schreibweisen, doppelte eigene IDs, leere Texte, belegte externe Referenzen, Quellenhashes, Vollständigkeit des Questinventars, Originalabschlussbedingungen, Dialogziel-/Zustands-/Endabdeckung, Mengen und Lesestückwortzahlen. 65.536 Kombinationen aus sechs Kapitelenden und vier unabhängigen Eingaben werden auf eindeutige Stadtzustände und jeweils 30 Solo-/Koop-Abspannzeilen geprüft. Darunter sind strukturell auch die Daten für Teilen; das Laufzeitgate muss Teilen im Solo-Spiel wie oben beschrieben verwerfen. Diese Datenprüfung ist kein Laufzeit- oder Spielbarkeitstest.

Noch offen: DE-/DJ-Termine und Ersatzorte sowie deren konkrete Datenpakete. Separater Einbau: Ruinen-Override für die CU-Spawns, Legacy-Ritualabgleich, Schlafauswahl und belegidentische Fortsetzungen bei zerstörten Schauplätzen. Keine dieser Lücken wird durch einen grünen Inhaltslauf verborgen.


### Reproduzierbare Quellen aus parallelen PRs

Die Commitobjekte werden gelesen, ohne die anderen Branches auszuchecken oder ihre Dateien zu verändern. Vor dem Prüflauf die fünf Quellen holen:

```sh
git fetch origin refs/pull/297/head:refs/remotes/origin/dk-source-ct refs/pull/293/head:refs/remotes/origin/dk-source-cx refs/pull/292/head:refs/remotes/origin/dk-source-dd refs/pull/291/head:refs/remotes/origin/dk-source-cu refs/pull/295/head:refs/remotes/origin/dk-source-dg
```

`quellen.json.abhaengige_prs` enthält die überprüften SHA-Werte. Der Prüfer liest gepinnte Dateien über `git show SHA:Pfad` und prüft zusätzlich ihren SHA-256. Nach einem Merge die finalen Inhalte neu abgleichen, nicht einfach einen anderen Commit unterstellen. Normale Basispacks liest er weiterhin aus dem Checkout. Keine Netzwerkaufrufe während der Prüfung.

CU definiert für `vm_zollhafen` den Spawn `default`/`boot` bei `[2,4]`, in beiden normalen Gezeiten begehbar. Für das zerstörte Ende bleibt ein eigener Sicherheitsabgleich nötig: DK darf CU-Rettungen nach `vm_stegviertel` nicht unverändert benutzen, denn dieser Ort ist im Ruinenmodus gesperrt. Die DK-Rettung muss zum bestätigten äußeren Hafenpunkt oder, solange nicht bestätigt, zum Kutschenhof in Briarholt führen. Dadurch wird kein unsicherer Spawn als durch die normale CU-Gezeitenprüfung bestätigt ausgegeben.
