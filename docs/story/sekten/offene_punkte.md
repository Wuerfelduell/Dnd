# Offene Punkte vor dem Einbau

## Formatabgleich

Die Aufgabenübersicht nennt teilweise ein anderes Format als der aktuelle Code. Kettlegate-Karten heißen tatsächlich etwa `giesserei`, `revier`, `docks` oder `altmarkt`; erfundene `kg_`-Karten werden nicht verwendet. Quests nutzen `done.requires_flags` und `target`, nicht ignorierte `flag`-/`hint`-Felder. Gegner benutzen `attacks`, nicht ein Laufzeitfeld `skills`. Effekte liegen auf Dialogknoten und werden durch die Bedingungen der hinführenden Wahl abgesichert. Spieler können Gespräche jederzeit verlassen.

`gegner.profile` ist deshalb ein ausdrücklich redaktioneller Adapter: Tier 1–3 und zwei Haupt-Phasen mit vorhandenen Angriffseinträgen. Der aktuelle Kampf liest diese Phasen noch nicht. Vor Verwendung der Haupt-Gegner muss der Adapter den einmaligen Wechsel bei 50 % Leben implementieren. Bis dahin funktionieren nur die Grundangriffe; das Paket behauptet keine fertige Phasenlaufzeit.

## Notwendige Integration

- Ereignisplaner, numerische Umtriebe-Stufen, persistente Spielzeitfristen und lokale Wirkungsauflagen fehlen. Keine Stufe als boolesches Flag missbrauchen. `sk_freigegeben` bleibt bis zur vollständigen Integration ungesetzt.
- Der Planer muss Hauptinteraktionen erkennen und eine abgeworbene Person davor unmittelbar zurückholen. Bloßes Ausblenden von Pimm, Ned, Sedge, Brack, Ruth oder der Zeitungsfrau ohne diese Rückkehrlogik wäre unzulässig. Bereits anderweitig abwesende oder benötigte Figuren nicht auswählen. Rückkehr stellt die vorher gültigen Sichtbarkeitsbedingungen wieder her.
- Abwerbungen dauern ein oder zwei Spieltage (1.440 bzw. 2.880 Spielminuten), Sabotage nur 12 oder 18 Spielminuten. Die Uhr läuft auch bei Ortswechsel weiter und wird gespeichert. Zeitablauf vergibt keine Belohnung. Hauptinteraktion/Kapitelwechsel beendet die Abwesenheit vorzeitig.
- Drei Städte in einer Kette setzen Rückreisen voraus. Falls der Kampagnenstand Rückwege noch sperrt, Sektenketten nicht freigeben; keine vorhandene Kapitelbedingung umgehen. Questkarten sind gegen `loadContent()` geprüft, aber daraus folgt keine aktuelle Erreichbarkeit für jeden Spielstand.
- Koordinaten der neun Figuren und zwölf Ermittlungslesestellen müssen auf freie, erreichbare Kacheln gesetzt und im Browser geprüft werden. Der Rückkehrdialog ersetzt die Ansicht der ersten Lesestelle. Ereignisspuren sind zeitweilige Ereignisobjekte; auch sie dürfen kein vorhandenes Fallobjekt verdecken.
- Zusätzliche Aktionen der Aussteiger öffnen die vorhandenen Herstellungsdialoge. Kleinaufträge starten beim zugehörigen Ereignis. Die statischen Journalziele verweisen zunächst auf Kontaktfiguren; der Planer soll den aktuellen Ereignisort als aktives Ziel anzeigen.
- Schreinwachen brauchen eine Folge von 2–3 Einzelkämpfen mit gemeinsamem Ereignisabschluss. Keine Teilbeute, keine doppelten Questbelohnungen. Auch kostenlose Ablenkung muss zur sicheren Abbauoption führen. Sieg, Flucht, Niederlage und Timer sind verschiedene Abschlüsse.
- Für örtliche Heiltrank-Halbierung, Nachtauflage und Reiseaufschlag existiert noch kein Sekten-Hook. Grenzen, kostenlose Gegenmaßnahmen, mittellose Reisende und Hauptreise-Ausnahmen stehen in `texte.einbau`. Das Datenpaket ändert kein bestehendes Heil- oder Reisesystem.
- BR liefert alle Grafiken mit den bereits festgelegten IDs. Die Dateinamen der neun Figuren enden auf `_walk.png`, ihr logischer Sheet-Schlüssel bleibt die Figur-ID. Item- und Artefakt-Icons müssen entsprechend registriert werden.
- Die neue Artefaktquelle `sekten` muss übernommen werden. Segen und Flüche verwenden bereits bekannte Effektschlüssel. Aktive Artefakte unterliegen dem vorhandenen Artefaktsystem einschließlich Aufnahme-Unruhe; Weglegen beendet ihre aktiven Effekte. Keine neue permanente Strafe ergänzen.
- Die booleschen Stufen-Anzeigeflags für Zeitung und Gerede sind nur eine Projektion der Zahlen. Bei jedem Stufenwechsel alle vier löschen und genau das aktuelle setzen. Notizbuchabsätze bis zur aktuellen Stufe kumulativ anzeigen; keine Chronik behaupten, die bereits persönlich gelöste Ereignisse erneut als aktiv darstellt.
- Koop: ein geteilter Ereigniszustand, ein geteilter Questabschluss; keine automatische Verdoppelung von Kosten, Gegnern, Beute oder Strafen. Beide Varianten des Geplauders bleiben auch ohne zweite Spielfigur verständlich, werden solo aber nicht automatisch gesprochen.

## Verifizierte Grenzen

Keine Änderung an `src/`, `public/`, Hauptfällen, bestehenden Karten, Pfaden, Sequenzen oder Fraktionen. Nur der eigene Ordner und eine Indexzeile. Der Prüfer testet vorhandene Dialog-/Quest-/Itemmethoden in einer isolierten Inhaltskopie und untersucht den künftigen Ereignisvertrag statisch. Ein Browser- oder Kampagnen-End-to-End-Test ist vor der Integration nicht möglich.
