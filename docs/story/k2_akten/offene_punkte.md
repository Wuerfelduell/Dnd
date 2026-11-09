# Einbau und Grenzen

## 1. Pack-Import und Fall-Enden

Die acht Kern-Dateien später nach `src/data/packs/k2_akten/` übernehmen und dort wie `wx_nebenquests` importieren. Dieses Paket ändert weder `src/`, `public/` noch `tests/`.

`applyQuestPack` in `src/data/questPacks.js` übernimmt bisher nur `facts`, `clues`, `deductions` aus `case.json`. **Vor Freischaltung muss auch `case.endings` in `content.endings` übernommen werden**, mit Kollisionsprüfung. Sonst findet `GameState.setEnding` die zwölf referenzierten Enden nicht. Die Enddefinitionen stehen nur dort, ihre Belohnungen nicht ein zweites Mal auf den Dialogknoten.

Dialogkämpfe benutzen bewusst das nachgeschlagene Feld **`combat`**, wie `price_wexmoor` und `GameState.applyEffects`. Die allgemeine Prompt-Liste nennt `encounter`, aber dieser Schlüssel löst auf Dialogknoten im aktuellen Code keinen Kampf aus. `encounter` bleibt das richtige Feld auf Karten-Kampfobjekten. Das Paket erfindet weder einen neuen Kampf-Effekt noch eine Bedingung `fact_refuted`: Die Widerlegung erfolgt mit `facts.*.refuted_by` und dem vorhandenen automatischen Ereignis.

## 2. Fallregister, Notizbuch und Fallwand

`campaign.cases` enthält im aktuellen Bestand nur `id` und `title`. Für die vier Fälle müssen diese beiden Felder aus `faelle.json` an `content.cases` angehängt werden, sonst bekommen ihre Hinweise keine eigenen Notizbuchregister.

`Ui.showCaseWall` zeigt tatsächlich nur bereits gespeicherte Enden aus `state.endings`, keine offenen Angebote. Für die in der Aufgabenbeschreibung gewünschte erweiterte Fallwand fehlt deshalb eine Angebots-/Aktivansicht. Der bestehende Interactable `wx_kahn/fallwand` bleibt der Einstieg und darf nicht doppelt angelegt werden.

Vertrag für `faelle.json`, ohne neue Laufzeitfelder in den Kerndaten:

| Feld | Verwendung durch den späteren Adapter |
|---|---|
| `id`, `title` | Registriert den Fall für Notizbuch und Archiv. |
| `summary` | Kurztext der angebotenen oder laufenden Akte. |
| `requires_flags`, `hide_if_flags` | Nur auf **neue Angebote** anwenden. Aktive Akten nach `kapitel2_done` weiter anzeigen. |
| `done.requires_flags` | Abschlussanzeige; bei vorhandenem `state.endings[id]` dessen Titel zeigen. |
| `target` | Auftraggeber als Wegweiser. Eine Fallwandauswahl soll ihn markieren, nicht im Hintergrund die Quest starten. |

Die angebotenen Akten liegen vor dem Kapitelende an der Fallwand; die vier NPCs führen das eigentliche Auftaktgespräch. Bis der Adapter eingebaut ist, funktionieren diese NPC-Einstiege nach Pack-Import unabhängig von Zunder. `summary`, `done` und `target` werden bereits in Questdaten verwendet; hier sind sie eine explizite Einbaubeschreibung, keine Behauptung, die aktuelle Fallwand lese diese Felder schon.

## 3. Zeitung

`zeitung.json` an `content.newspapers` beziehungsweise den vorhandenen Lore-Zeitungsimport anhängen, nicht die Stammdatei ersetzen. `Newspapers.checkPapers` unterstützt Endflags bereits. Die zwölf Meldungen tragen `zeitung: "bote"`; pro Ende wird genau eine freigeschaltet. Sie bleiben im bestehenden Zeitungsarchiv erhalten. Die automatische Ankündigung und der vorhandene Archivzugang genügen, es braucht keinen zweiten Zeitungskasten.

Die Artikel betreffen lokale Vorgänge. Sie verkünden weder Brandts Sturz noch einen Freispruch des Spielers. Freigegebene Verwaltungsnachrichten und die Wahrheit im Abschlussbericht dürfen voneinander abweichen, besonders beim Vergleich und beim Schweigegeld.

## 4. Karten und Erreichbarkeit

Es werden ausschließlich vorhandene Karten verwendet. Die Wärterhütte liegt als Untersuchungsgruppe am Torfstich, die Schleuse auf `wx_bahnhof`. Vanes Atelier ist ein zugängliches Wandatelier in `wx_oberstadt`; keine neue Tür und kein Innenraum werden vorausgesetzt. Die kurze Bootsbesteigung im Finale von Hafenrecht wird durch den Dialog am festen Rand des Salzwatts dargestellt, ohne Bootsphysik oder neuen Wasserweg.

Der Akademietor-Zugang im Stammspiel verlangt `requires_quests_active: ["k2_akt2"]`. Bittere Mittel beginnt erst danach. Daher liegen **alle Pflichtbelege vor dem Tor in der Oberstadt**: die öffentliche Materialausgabe und Veits mobile Ausgabe. Wyle, Jorin und das abgeschlossene Akademieinnere sind keine Zugangsvoraussetzungen. Für `wx_salzwatt` genügt das in Akt I regulär erhaltene `k2_known_hafen`.

Alle 47 Platzierungen sind gegen die zusammengeführten Karten einschließlich eingebauter Nebenquests, Lore, Figuren und Startpositionen der Gegner auf Kollisionen geprüft. Die AL-besetzten Kacheln dürfen AM/AP/AQ bei deren Einbau nicht unbemerkt nochmals belegen. Für parallel entstehende, noch nicht eingebundene Platzierungen ist beim Gesamtmerge eine erneute Prüfung nötig.

Die Polizeiszenen sind auf Karten mit bestehender Streife platziert. Sie regeln nur den lokalen Zugang, nicht den gesamten Polizeizustand: passende getragene Verkleidung, kostenloser Umweg mit vier Nerven Verlust oder offene Beweissicherung mit Fahndung mindestens zwei. Positive `wanted`-Werte sind im aktuellen System Mindeststufen, keine Addition. Es gibt keinen erfundenen Vergleich mit der aktuellen Fahndungsstufe und keine automatische Begnadigung.

## 5. Figuren und Grafik

Die gemeinsam vergebenen IDs `wxn_telegrafist`, `wxn_apothekerin`, `wxn_hafenmeisterin`, `wxn_maler` werden in AL als Inhalts-NPCs definiert, weil AL diese Figuren gehört. AO liefert ihre Grafik. Kein weiteres Paket soll identische NPC-Datensätze nachträglich ersetzen.

`enemy_wxn_maler` und `enemy_gemalte_frau` sind die ausdrücklich von AO verlangten Sheets. Diese beiden extern vereinbarten Sheet-Namen bleiben erhalten. Die Begegnungs-IDs selbst heißen `k2a_letztes_bild_vane_kampf` und `k2a_letztes_bild_kampf`. Die Sheets müssen vor der visuellen Abnahme im Assetregister vorhanden sein; das Skript prüft Datenwege, nicht gerenderte Kampfanimationen. Beide sind keine zusätzlichen AL-Grafikwünsche.

Zusätzliche AL-Figuren: Ivo Senn, Oren Veit, Clem Noll. Ihre Palette benutzt vorhandene Felder. Ihre Begegnungen nutzen zunächst die jeweilige NPC-Darstellung über `sprite: "npc:<id>"`, ohne einen nicht vorhandenen Sheet-Schlüssel zu erfinden. Vorhandene Bild-Platzhalter und die gewünschten Ersatzgrafiken sind ausschließlich in `grafikwuensche.md` notiert.

## 6. Abgrenzung und Spielstände

- Tinte untersucht verkaufte Dienstpläne. Sie enttarnt weder Druces Hilfsfahrten noch die Lichtlosen aus `k2n_schleusenwaerter`. Kein Zirkel wird freigeschaltet, angezeigt oder bestraft.
- Bittere Mittel betrifft eine gezielt manipulierte Charge und Veits Versuch. Es ist weder Jorins selbst erzeugte Linsensalz-Verfolgung noch ein Beweis für eine allgemeine Moorvergiftung. Keine Funktion heilt oder beschädigt andere Questfiguren.
- Hafenrecht behandelt Identitätsmissbrauch in der Hafenkasse. Die Salzbrüder und die Täfelchengilde erhalten keine neue kollektive Schuld, keine fremden Flags und keine veränderten Regeln.
- Letztes Bild bindet einen Erinnerungsrest aus einer alten Registertafel. Es verrät weder Brandts Hauptmotiv vorzeitig noch ersetzt es den Ursprung des Moors. Nils Feders falsche Steckbriefzeichnung bleibt ein anderer Vorgang.
- Keine neuen Orte, Monster oder Aufträge von AM; keine Übernahme von Krabbe aus AP und keine Gildenmitglieder aus AQ. Für AL gibt es folglich **keine fremde Flag-Abhängigkeit**.
- Angenommene Akten bleiben nach Kapitelende lösbar. Die Reaktionskontakte Druce, Sedge, Brack und Hesper bleiben verfügbar; Hale, Price und Zunder sind keine Pflichtkontakte für Abschlüsse.
- Die Hauptgeschichte kann im Bestand einen Zeitsprung oder eine Abreise erzählen, lässt Wexmoor aber spielbar. AL übernimmt dieses bestehende Nachspielmodell. Es erfindet keine zweite Flucht oder Rückkehr.

## 7. Noch visuell abzunehmen

30 bis 45 Minuten sind Zielwerte, keine gemessenen Zeiten. Nach Einbau: Wege und Objektabstände mit Kamera prüfen, Kampfsteuerung in Solo und Koop erproben, neue AO-Sheets abnehmen, Zeitung und Notizbuchtitel prüfen. Das Datenprüfskript simuliert Endpfade mit perfekter Parade und isoliert damit Erreichbarkeit von Spielkönnen. Für eine Schwierigkeitsfreigabe sind Kämpfe mit üblicher Kapitel-2-Ausrüstung und menschlichem Timing nötig.
