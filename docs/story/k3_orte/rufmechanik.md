# Rufen, horchen, schweigen

Spezifikation für die spätere Integration, kein bereits laufendes System. Verbindliche Vorlage: `../kapitel3/geschichte_3.md`, Abschnitt 6. Kartenbeobachtungen sind örtliche Anschauung. Sie vergeben keine AR-Schlussfolgerungen.

## Zustand und Zuständigkeit

GameState besitzt pro Expedition ein gemeinsames Gerät mit `charges` von 0 bis 3. Der erste Erhalt durch AR setzt 3. `learnedPatterns` und `revealedRoutes` bleiben über Schlaf, Niederlage, Kartenwechsel und Laden erhalten. `reserveUsed` ist eine dauerhafte Menge von Stations-IDs. `bindings` ordnet private Namensantworten dem jeweiligen Sprecher zu. Im Koop teilen beide das Gerät; Bindungen und ihre Zustimmung sind persönlich. Jeder bestätigte Befehl besitzt eine eindeutige ID und wird genau einmal verarbeitet.

Nur die autoritative Zustandsinstanz bucht ab. WorldScene erhält Vorschau und Ergebnis als Ereignisse. Ein Save enthält Zustand, Versionsnummer und bereits abgewickelte Befehle. Eine Animation darf nie selbst eine Ladung verbrauchen. Laden mitten im Ruf spielt höchstens die Darstellung erneut, niemals den Effekt.

| Ausgang | Aktion | Folge |
|---|---|---|
| bereit, 1–3 Ladungen | gültigen Ruf bestätigen | genau eine Ladung abziehen, Ergebnis und Alarm gemeinsam speichern |
| leer | rufen versuchen | keine Mutation, kostenlose Horchoption und Rückweg anzeigen |
| beliebig | horchen, Journal lesen, schweigen | keine Kosten und kein Aktfortschritt |
| 0–2 Ladungen, Reserve unbenutzt | Reserve nehmen | +1; Station dauerhaft als verbraucht markieren |
| 3 Ladungen | Reserve nehmen | erklären, nichts verbrauchen |
| Speisewagen | Pfiff nachfüllen lassen | kostenlos auf 3; beliebig oft, kein Reset der Reserven |
| außerhalb Schleuse | private Namensantwort ausdrücklich bestätigen | Bindung nur dieses Sprechers bis zur nächsten Schleuse |
| Schleuse betreten | Übergang abschließen | persönliche Bindung und lokaler Alarm enden |
| falsches Muster | Fehler abwickeln | keine zweite Ladung, höchstens 5 Nerven; bekannte falsche Haltestelle oder vermeidbarer Alarm |

Das Namenstäfelchen bleibt erhalten. Es schützt vor persönlicher Namensentnahme, nicht vor dem Echo eines bereits gesendeten Signals. Gewöhnliche Gespräche lösen keine Bindung aus. Eine finale freiwillige Gegenstimme ist eine getrennte AR-Endentscheidung und wird niemals durch einen alltäglichen Stationsruf gewählt.

## Vorgeschlagene Stationsfelder, noch nicht in maps.json

Die nachstehenden Felder sind ein Vertrag für neuen Code, keine stillschweigend unterstützten Karteneigenschaften. Die bestehenden `kind: read`-Objekte sind Anschauungsorte. `offene_punkte.md` führt die benötigte Erweiterung auf.

| Feld | Typ / Bedeutung |
|---|---|
| id | eindeutige `k3o_`-ID |
| map, tile | existierende Karte und begehbare Kachel |
| directions | erlaubte Himmelsrichtungen, wählbar ohne Echtzeitzielgenauigkeit |
| patterns | Muster-ID → Quelle, Form, überprüfte Bedeutung; AR liefert Journal-IDs |
| accepted | Muster und Richtung → Route oder Bestätigung, kein automatisches Storyurteil |
| rangeTiles | maximale Weglänge der Ausbreitung, 16-Pixel-Kacheln |
| safeTiles | dauerhaft markierte Nischen, vor dem Senden sichtbar |
| routeTiles | geordnete begehbare Kacheln für den bestätigten Nachhallweg |
| fallback | existierende Karte/Spawn der bekannten falschen Haltestelle |
| reserve | einmalige Notladung ja/nein |
| listeners | Gegnerinstanz und `hearing` in Kacheln; Radius ist nicht `roam.aggro` |
| privateAnswer | ausdrückliches Opt-in mit Sprecher und verständlicher Bindungswarnung |

Ausbreitung: vier Nachbarn, maximal `rangeTiles` Schritte, Wände und geschlossene Schallschleusen stoppen. Zunächst wird nur die gewählte Richtung geöffnet, danach ein belegter Korridor verfolgt. Keine Schallstrahlen durch massive Wandflächen. Das Echo kann einen hinter der Mauer liegenden Ort **anzeigen**, aber eine Abkürzung wird erst nach gesondertem Öffnen eines vorhandenen Durchgangs begehbar. Vorgeschlagene dynamische Kollision darf weder Figuren einschließen noch den einzigen Fußweg entfernen.

## Konkrete Stationen

Koordinaten sind nullbasiert. `ds_schwellenring` hat den Trichter bei (34,3), alle anderen Vorbereitungen bei (4,9). Sichere Standplätze liegen jeweils bei (2,3), der öffentliche Rückweg unten bei y=H−3. Diese Plätze sind heute schon begehbar.

| neue Stations-ID | Karte | Richtung / Muster | Reichweite | sichere Nische | Reserve / Fehlerziel |
|---|---|---|---:|---|---|
| k3o_horch_drehscheibe | ds_schwellenring | Osten, bestätigter Depotpfiff | 12 | (2,3) | ja / ds_schwellenring:default |
| k3o_horch_hund | ds_rangierwueste | Norden, falscher Anfahrpfiff | 10 | (2,3) | ja / ds_rangierwueste:default |
| k3o_horch_vorhauer | ds_klopfbruch | Norden, vier–Pause–zwei | 12 | (2,3) | ja / ds_klopfbruch:default |
| k3o_horch_verteiler | ds_rufschlucht | Norden, Ruf und Antwort separat | 14 | (2,3) | ja / ds_rufschlucht:default |
| k3o_horch_bahnsteig | ds_letzter_bahnsteig | Norden, überprüfter Halt | 10 | (2,3) | ja / ds_letzter_bahnsteig:default |
| k3o_horch_tiefe | ds_unterschicht | Norden, drei begrenzte Leerstellen | 12 | (2,3) | ja / ds_unterschicht:default |

Beispiel Hund: Die Linie vom Stationspunkt (4,9) über (4,8) bis (4,3) wird vor dem Ruf gestrichelt dargestellt. Nach Bestätigung leuchtet sie durchgehend; ein Texteintrag lautet „Suchlicht folgt dem falschen Anfahrpfiff. Rückweg frei.“ Der sichtbare Fundzugang ist bei (5,9). Die Schleife kostet eine Ladung und öffnet keine anderen Viertel. Die lokale Dialogfassung setzt dafür `k3o_falscher_pfiff`; später ersetzt Signals diese Auswertung und behält dasselbe Ergebnisflag.

Beispiel Drehscheibe: Vom Trichter (34,3) führt die Vorschau bis (40,3). Das sichtbare Antwortzeichen am Ende identifiziert den Hinterzugang. Die begehbare Verbindung zum Depot besteht bereits als Tür; AR entscheidet anhand seiner Deduktion über die eigentliche Abkürzung. Keine Umwandlung von Beobachtung zu Beweis allein durch AS.

`hearing`-Vorschlag: Schichtgänger 5, Kalkstaubgeist 6, Signalkrähe 9, Lohnlistenmotte 4, Gerüstklang 7, Nachhall 10 Kacheln. Reaktion nur bei erreichbarer Signalfläche innerhalb dieses Radius. Sichere Nischen und Wagen ignorieren Alarm. Laufgeschwindigkeit, Sichtaggro und Hörweite bleiben getrennt. Ein Wesen sucht zuletzt gehörte Positionen, kennt nicht automatisch die aktuelle Spielerposition.

## Fehler, Rücksetzen und Kampfschutz

Ein falscher Ruf zeigt **vor** dem Senden das Risiko. Danach steht der Spieler an der bekannten falschen Haltestelle oder sieht eine Alarmzone. Kein unvermeidbarer sofortiger Kampf, keine Geld- oder Gegenstandsstrafe. Ablehnen oder Fliehen hält den maximalen Rufverlust bei einer Ladung und 5 Nerven. Ein freiwillig anschließend begonnener gewöhnlicher Kampf hat die regulären Kampfregeln, wird klar als neue Entscheidung angezeigt und nicht als unsichtbare Rufstrafe behandelt.

Nach Niederlage Rückkehr zum Speisewagen. Keine Löschung von Journal, offenen Fußwegen, Reservestatus oder geklärten örtlichen Aufgaben. Phasenkampf beginnt bei erneutem Versuch mit Phase 1, ohne doppelte Belohnung. Das Kapitel schreitet ausschließlich nach ausdrücklicher AR-Bestätigung eines Aktschritts fort. Keine Uhrzeit, kein Aufenthalt und kein Kampfabbruch darf den Rundruf auslösen.

## Barrierefreiheit und Abnahme

Jedes Muster hat eine benannte Form, z. B. „zwei kurze Striche, ein langer, Abbruch“, eine Quelle und einen Bedeutungstext. Die Auswahl wird bestätigt, nicht rhythmisch nachgespielt. Signal, Antwort und Fehler besitzen unterscheidbare Linienformen und Labels; Farbe oder Stereo allein reichen nicht. Animationen sind pausierbar, reduzierte Bewegung zeigt statische Pfeile. Vibration ist optional und trägt keine exklusiven Informationen. Tastatur, Touch und Controller müssen alle Richtungen und Bestätigungen erreichen.

Abnahmeszenarien: drei Rufe, vierter gesperrt; Notladung bei 0 und bei 3; Reserve nach Neuladen weiterhin verbraucht; zweimal derselbe Koop-Befehl kostet einmal; falscher Ruf verliert niemals Wissen; bei ausgeschaltetem Audio dieselben Lösungen; Spieler 2 antwortet privat, nur Spieler 2 wird gebunden; jeder einzelne Ausgang bleibt mit 0 Ladungen erreichbar; Nachtzug wartet beim Öffnen des Menüs; alle vier Wexmoor-Enden erhalten dieselben öffentlichen Wege.
