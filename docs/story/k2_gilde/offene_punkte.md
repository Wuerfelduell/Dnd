# Einbaupunkte für AQ

## 1. Gildenrabatt: konkreter Vertrag, noch keine Laufzeitwirkung

`k2g_gildenrabatt` wird nach beiden Abschlüssen von `k2g_esse_stempel` gesetzt. Gewünscht: 10 % Rückvergütung auf den tatsächlich bezahlten Zuschlag eines eigenen Kaufs **nur** bei `namensgilde`, abgerundet auf ganze Schilling. Kein Nachlass auf Mitbietergebote, keine Veränderung von Startpreis, Schrittweite oder `itemValue`, keine Erhöhung von Gesuchspreisen oder eigenen Verkaufserlösen. Einmal pro bezahltem Zuschlag, nie beim Laden, Abbrechen oder erneuten Anzeigen. Beispiel: Zuschlag 117, Belastung zunächst 117, Rückgabe 11, Nettopreis 106.

Die aktuelle Auktion hat dafür keinen Effekt oder Hook in den Inhaltsdaten. Deshalb steht kein erfundenes Rabattfeld in JSON. Wandas Text vermerkt den Anspruch, behauptet aber keinen bereits wirksamen Preisnachlass. Nach dem Einbau in der Auktion sichtbar erläutern. Solange der Rabatt noch fehlt, bleibt die garantierte Moorharz-Belohnung funktionsfähig.

## 2. Treffen-Merge und Wexmoor-Pin

Nur `rules.orders.wexmoor` ergänzen. Ein flaches Ersetzen von `rules` würde Zeitintervalle, globale Freischaltung und Auktionseinstellungen löschen. `briefed_04` als globale Freischaltung bleibt bestehen; im regulären Kapitel-2-Spiel ist sie bereits gesetzt. Für Entwickler-Sprünge nach Wexmoor muss der Teststand sie mitbringen.

`buildContent` mischt `g.pins` in die allgemeine Karte. `Ui.openTravel` verwendet für Wexmoor jedoch `travelRules.cities.wexmoor.pins`. Deshalb den gelieferten Pin auch dort ergänzen, beispielsweise vor dem Build in `wexmoor.city.pins`. Sonst gibt es das Reiseziel nur als Listeneintrag. Den neuen Pin auf der 512×288-Stadtkarte unterhalb von Pfahldorf prüfen.

Mitgliedschaft alleine bedeutet nicht „jetzt geöffnet“. `requires_gathering` prüft Zeit und Mitgliedschaft. Nach `sessionHeld` ist ein erneuter Eintritt in derselben Runde absichtlich gesperrt. Die Dialoge bleiben für Mitglieder auf einer bereits betretenen Karte zugänglich, auch nachdem sie die Auktion beendet haben. Das unterstützt Questabgaben, ohne die Handelssperre zu umgehen.

## 3. `once` und `requires_pathway` in Angeboten

Beide Felder sind nach der Vorlage an Formeln gesetzt. `Auction.memberLot` filtert derzeit ausschließlich nach `chance`; `bid` wertet diese Metadaten ebenfalls nicht aus. Ein fremder Pfad und ein bereits besessenes Rezept verhindern damit zurzeit weder Angebot noch Zuschlag. Das ist vorhandenes Verhalten, kein neuer AQ-Mechanismus. Vor produktiver Aktivierung entscheiden, ob die Auktion diesen Sperren folgen soll oder ihre dokumentierte Absicht, fremde Formeln zum Weiterverkauf anzubieten, beibehalten wird. Bei einer Filterung auch den Fallback bei leerem Pool filtern, sonst hebt er die Sperren wieder auf.

Die im Auftrag erhaltene `formel_echo_7` ist absichtlich pfadunabhängiger, einmaliger Lohn. Sie darf aufbewahrt oder wie bestehende fremde Formeln versteigert werden. Keine eigene Formel, kein Pfadwechsel und kein automatischer Aufstieg.

## 4. Materialien und Artefakte

Kerbstaub und Moorharz sind handelbare Materialien im bestehenden `ingredient`-Format. Es werden keine Rezepte fremder Pakete verändert. Optional später passende Rezepte ergänzen; dafür keine neuen Flags oder angenommenen AL/AM/AP-IDs verwenden. Keine fiktive Schutzwirkung der Materialien in Spieltexten versprechen.

Die zwei Artefakte müssen zusätzlich unter `pathways.artifacts.list` registriert sein, sonst erscheinen sie zwar als Gegenstände, wirken aber nicht korrekt über `artifactDef`. `artefakte.json` liefert genau diese Definitionen. Bestehende Regeln zu Aktivierung, Tragkraft, Unruhe und maximal aktiven Artefakten gelten unverändert. Die Nachteile wirken beim Tragen, nicht schon beim Questabschluss.

## 5. Grafik und räumliche Abnahme

Die Figuren `tm_esse`, `tm_kerbe`, `tm_mulde` gehören grafisch zu AO; keine neuen NPC-IDs erzeugen. AQ liefert eigene Paletten, Grafikzuordnung später über den Asset-Resolver. Alle Übergangsgrafiken stehen ausschließlich als `platzhalter` in `grafikwuensche.md`, nicht als erfundene Felder in NPC-/Itemdaten. Der Treffpunkt benutzt bereits verfügbare Kacheln und Props der Lichtlosen; die Palette allein macht daraus noch keinen eigenen Schrein.

Nach Einbau Lesemarker, Figurentiefe, Laufwege, Menüscrollen bei Sedge und die Nähe zur vorhandenen Grauspäherstreife am Salzmarkt prüfen. Die Datenprüfung ersetzt keine Phaser-Kollisionsprüfung. AL/AM/AP können parallel neue Objekte auf denselben Karten platzieren; bei der Zusammenführung Koordinaten vergleichen und gegebenenfalls nur AQ-Marker verschieben. Keine inhaltliche Abhängigkeit von diesen Paketen.

## 6. Erzählgrenzen

Keiner der gefundenen Namen ist ein neuer interaktiver NPC. Runa Vale, Bennet Siel und Ida Rusk bleiben historische Erwachsene; Marta Kerbe und die beiden erwachsenen Nachkommen erscheinen nur in Texten. Keine Grafik-/Questanforderung an andere Pakete. Hannes Werkstattfall löst weder das sinkende Wexmoor noch den Hunger unter der Stadt. Die Reaktionen benutzen ausschließlich die vier existierenden Endflags; sie schalten keine neuen Kapitelenden frei und ändern Zunders Verhalten nicht.
