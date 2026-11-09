# Einbaupunkte für Paket AB

Diese Punkte betreffen ausschließlich den späteren Einbau. Der Paket-PR verändert keine Laufzeitdateien und aktiviert keinen der nachfolgend beschriebenen neuen Hooks.

## 1. `wanted: -1` funktioniert im aktuellen Code nicht als Absenkung

`src/core/GameState.js`, `applyEffects`, behandelt `wanted` derzeit als absolute Mindeststufe: `setWanted(Math.max(this.wanted, e.wanted), ...)`. Ein negativer Wert senkt deshalb nichts. `k2n_gesicht_senken` enthält den vom Auftrag verlangten Effekt `wanted: -1` sowie das dauerhafte Entscheidungsflag `k2n_fahndung_entlastet`, ist aber bis zum Einbau nur eine Inhaltszusage.

Vorschlag: negative `wanted`-Werte als Delta behandeln und bei null begrenzen; nichtnegative Werte weiterhin als Mindeststufe behandeln, damit bestehende Inhalte unverändert funktionieren. Die Änderung muss im gesonderten Integrations-PR geprüft werden. Keine neu erfundenen Effektfelder sind in diesem Paket enthalten.

`wanted: 3` beim Start von Zunders Liste und `wanted: 2` beim Mitverdienen an der Schleuse funktionieren bereits als Mindeststufen. Der vorhandene zeitliche Fahndungsabbau darf während der Botengänge weiterlaufen; die Quest behauptet nicht, Stufe 3 dauerhaft einzufrieren. Es gibt keine erfundene `requires_wanted`-Bedingung und keine zusätzliche Polizeibegegnung.

## 2. Zunder benötigt eine eigene Bindungsunterstützung

`src/core/Bonds.js`, `changeBond`, verwirft Änderungen für Figuren, die nicht in `loners.list` stehen. `zunder` ist keine Einzelgängerin dieser Liste. Die verlangten `bond: {"zunder": 3}` und `bond: {"zunder": 2}` werden deshalb derzeit ignoriert.

Vorschlag: Bindungen für benannte Gefährten getrennt vom automatischen Freund/Feind-Verhalten der Einzelgänger zulassen, speichern und anzeigen. Zunder nicht lediglich als kampffähige Einzelgängerin registrieren. Die Flags `k2n_liste_hilfskasse` bzw. `k2n_liste_lohn` bewahren die Wahl bereits eindeutig; beim Migrieren genau einmal nachtragen, falls ein Save den Abschluss vor der Bindungsintegration erreicht hat.

Kein neuer Auftrag hängt vom gemessenen Zunder-Bindungswert ab. Ofen, Ehre und Geld bleiben davon unabhängig.

## 3. Kahn-Ausbau: sechs kleine Wirkungen, keine bestehenden Engine-Felder erweitern

`kahn_ausbau.json` ist der geforderte Datenvorschlag mit Wirkung in Worten. Der vorhandene Ruheplatz `wx_kahn/koje` und die Verbrauchslogik kennen diese Ausbauobjekte nicht. Ein Ofen steht bereits in der Kajüte; der Ausbau ersetzt diesen mit einem abgedichteten Modell, statt einen zweiten Ofen aufzustellen. Vorschläge für Integration und Deko:

| Ausbauflag | Quelle / Zweig | Mechanische Umsetzung | Deko-Vorschlag im Kahn |
|---|---|---|---|
| `k2n_kahn_reet` | Reetdach: Kahn | Beim Essen eines Salzbrots im Kahn +3 Nerven, Brot verbrauchen | Bordwand an der Koje |
| `k2n_kahn_kiste` | Salzwaage: still | Erste Nutzung gibt genau 2 `salzbrot` | Unter dem vorhandenen Tisch |
| `k2n_kahn_glocke` | Bojenlied: Hafen | Erstes Läuten gibt +8 Nerven | Türbalken innen |
| `k2n_kahn_waschtisch` | Küstengift: vertraulich | Nach Ruhe −5 Unruhe, nur bei Beyondern | Schmale freie Wandfläche |
| `k2n_kahn_ofen` | Zunders Liste: beide Enden | Beim Moortee im Kahn +10 Nerven, Tee verbrauchen | Vorhandenen Kajütofen ersetzen, Laufweg frei halten |
| `k2n_kahn_kartentisch` | Letztes Licht: teilen | Erstes Studium gibt +5 Nerven | Klapptisch an der Bordwand |

Die vorhandene Schlafruhe setzt Nerven bereits auf 100 (`WorldScene.js`, `case rest`). Die im Prompt beispielhaft genannte zusätzliche Nervenheilung beim Schlafen hätte daher keinen Nutzen. Reetmatten und Ofen schlagen stattdessen kleine zusätzliche Nervenboni beim Verbrauch von Salzbroten beziehungsweise Moortee im Kahn vor; normale Verbrauchseffekte und Mengenabzug bleiben bestehen. Erst den tatsächlichen Itemverbrauch prüfen, dann den Zusatz anwenden und am Maximum begrenzen. Der Waschtisch darf bei Nicht-Beyondern nicht durch die allgemeine Unruhe-zu-Nerven-Ersatzlogik zusätzliche Nerven vergeben.

Einmalige Nutzungen brauchen eigene gespeicherte Flags, zum Beispiel `k2n_kiste_entnommen`, `k2n_glocke_gelaeutet`, `k2n_kartentisch_gelesen`. Diese Namen sind **nur Vorschläge**, keine aktuell verlangten Flags in den Spieldaten. Wiederholtes Laden, erneuter Kahn-Eintritt und erneutes Anklicken dürfen die Vorräte oder Nerven nicht wieder auszahlen. Grafikpositionen und Kollisionskörper erst mit den endgültigen Props festlegen; hier werden bewusst keine unbestätigten Deko-Kacheln geliefert.

Die fünf optionalen Ausbauten sind an Entscheidungen gebunden, der Ofen ist garantiert. Alle sechs können in einem Durchlauf erworben werden, wenn die entsprechenden fünf Zweige gewählt werden. Andere Zweige liefern die in der Übersicht genannten Ausgleichsbelohnungen, keine automatische Kaufoption.

## 4. Zweiter Weg zur Insel

Beide Abschlüsse von `k2n_letztes_licht` setzen `k2n_zweiter_weg`. Der zweite Weg ist im Paket **noch kein Reise- oder Teleport-Effekt** und setzt weder `k2_am_turm` noch ein Kampf-, Beweis- oder Hauptquestflag.

Vorschlag für den Integrations-PR: Bei aktivem `k2_akt5`, gesetztem `k2n_zweiter_weg` und noch nicht abgeschlossenem Kapitel in der vorhandenen Überfahrt eine zusätzliche Auswahl „Rinns Wartungsweg“ anbieten. Sie erreicht denselben bestehenden Einstieg `wx_leuchtturm/default`; nur der Ankunftstext beschreibt das niedrige Wartungsufer. Das führt keinen Spawn in unerkundetem Gebiet ein und überspringt weder das Leuchtfeuer noch das Urteil über Brandt.

Die vorhandene automatische Ankunftsszene beschreibt Bracks Boot und muss für diesen Zweig in eine passende Textvariante aufgeteilt werden; ihr einmaliges `k2_am_turm`-Verhalten erhalten. Wenn ein spielerisch anderer Inselzugang gewünscht ist, braucht er separat geprüfte Kacheln, Wegführung und Balancing. Der Kartentisch gibt deshalb ausdrücklich keinen Reise- oder Kampfbonus.

`k2n_licht_teilen` kündigt die spätere Weitergabe an die Fischer an; `k2n_licht_hueten` hält das Original bei Rinn. Ein optionaler Epilog darf diese Flags lesen. Vor dem Finale werden keine Fischer auf die Insel geschickt.

## 5. Drei Bojenfahrten ohne neue Wasserkarten

Die drei Lesepunkte am bestehenden begehbaren Steg lösen jeweils eine abgeschlossene Ruderfahrt mit Rückkehr aus. Die Reihenfolge ist über Hinweise gesichert, das letzte Lied über alle drei Hinweise. Brack leiht ausdrücklich ein Reserveboot; Starlings Diebstahl des Hauptboots in Akt III wird nicht rückwirkend verändert.

Es gibt keine frei steuerbare Rudermechanik und keine neu erfundene Szene-ID. Eine spätere Fahrtanimation ist optional und darf die im Text bereits vollständig spielbare Untersuchung nicht blockieren. Die Lesetexte müssen am Steg beginnen und dort enden, die Spielfigur darf nicht auf Wasserkacheln gestellt werden.

Die Takte liegen in Ketten und Gussinschriften, nicht ausschließlich in hörbar schlagenden Glocken. Damit funktioniert die Quest auch nach dem bereits vorhandenen Auftrag, der die Glockenmutter zum Schweigen bringt. Ole ist der Urheber der Deutung, aber weder seine Freundschaft noch seine noch bestehende Anwesenheit ist ein Zugangstor: Brack kann seine früheren Worte weitergeben.

## 6. Darsteller, Kapitelkontinuität und Dialogeinbau

Vier neue NPC-Datensätze, keine weiteren Karten oder Gegner. Reetdecker und Kind erscheinen als Leseszenen, ihre Entscheidungen bei Sedge. Es werden keine bestehenden NPCs versetzt oder Dialoge überschrieben.

`choices_add` gehört bei allen sechs benutzten Bestandsdialogen in `nodes.start.choices`, vor die Verabschiedung. Die Erstgesprächs-Selektoren, insbesondere bei Sedge, bleiben bestehen. Neue Knoten sind mit `k2n_` präfixiert. Die kostenlose lange Route für alle drei Botengänge muss erhalten bleiben, damit verlorenes Startgeld keine Blockade erzeugt.

Nils verändert nur eine neue lokale Druckauflage. Der vorhandene Bahnhofshinweis nennt ein gut getroffenes Gesicht und bleibt wahr. Sein Verbündetenflag bietet bereits eine einmalige Folgeinteraktion; weitere Hilfe ist nicht stillschweigend versprochen.

Ivy existiert in `campaign.json` und `dialogues/ebba.json`. Der Brief spricht nur von ihrer Verwahrung der Kassette und legt weder Hesters Schicksal noch den Ausgang anderer Fälle fest. Die Kassette bleibt offscreen und wird nicht als unregistriertes Inventarobjekt verwendet. Ein späteres Zurückerlangen ist durch `k2n_pfand_verwahrt` vorbereitet, aber kein versprochener Folgeauftrag dieses Pakets.

Rinn kennt Wartung und Gezeiten, nicht automatisch die Wahrheit über das Leuchtfeuer. Seine Amtszeit liegt vor Brandts Ernennung und macht ihn nicht zum Urheber des jahrhundertealten Fremdenrituals.

## 7. Lichtlose und optionale spätere Konsequenzen

`k2n_lichtlose_gemeldet`, `k2n_lichtlose_gedeckt` und `k2n_lichtlose_anteil` sind exklusive Abschlussflags. Nur beim Decken wird zusätzlich das vorhandene `treffen_lichtlose` gesetzt, identisch zum bestehenden Einladungskonzept. Bereits bestehende Mitgliedschaft wird bei den anderen Zweigen nicht entfernt, Auktionsdaten werden nicht geändert.

Melden bringt geringere Auszahlung und Ehre, Mitverdienen mehr Geld mit Ehreverlust und mindestens Fahndungsstufe 2. Diese unmittelbaren Folgen sind bereits enthalten. Preisänderungen, Ressentiments von Zirkelmitgliedern oder dauerhafte Sperrung der Schleuse wären zusätzliche Integrationsarbeit, nicht aktuell aktive Wirkungen der Flags.

## 8. Prüfung und Grenzen

`pruefen.mjs` prüft Datenstruktur, Referenzen und lokale Questzustände. Es simuliert nicht die Hauptgeschichte, Echtzeitpatrouillen, die tatsächliche Ruhefunktion, Händler oder Gefahrenbegegnungen in den Wildgebieten. Die Bodenkontrolle berücksichtigt den Standardspawn, feste Deko, vorhandene Objekte und die geraden Streifenabschnitte einschließlich Rückweg; freie Kacheln sind keine Garantie für Unsichtbarkeit im Sichtkegel.

Beim Einbau bleiben notwendig: Ingame-Durchlauf pro Akt, Verkleidungswechsel im Akademieauftrag, Abbruch/Wiederaufnahme aller Entscheidungen, Festnahme zwischen den drei Lieferungen, Save/Load vor und nach Belohnungen, einmalige Hilfszahlung von Nils und beide Varianten des Turmzugangs. Die Datenprüfung meldet die zwei bekannten Runtime-Lücken ausdrücklich und bewertet sie nicht als bestandenes Gameplay.
