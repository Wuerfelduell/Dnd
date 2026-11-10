# BJ – Vorrat an Figuren

28 Figuren für spätere Kapitel: zehn aus Calderwick, zehn aus Briarholt und acht Reisefiguren. Dieses Paket wird nicht geladen und verändert keinen bestehenden Spielabschnitt.

## Inhalt und Reihenfolge

1. `steckbriefe.md`: Alter, drei Aussehenssätze, Stimme, Wunsch, Angst, redaktionelles Geheimnis, Pfad und genau eine Sonderpose je Figur. Die Geheimnisse der zwanzig Geschichtsfiguren stammen wörtlich aus den verbindlichen Tabellen.
2. `npcs.json` und `dialogues.json`: 28 Figuren ohne Kartenbindung; 20 Bäume mit zehn und acht Bäume mit zwölf Knoten, zusammen 296 Knoten. Begrüßungen bei Ansehen unter 10, ab 10 und ab 40; zwei Themen, Pfadreaktion, Bitte und Abschied. Pfadreaktionen gelten ab Sequenz 9 oder besser auf dem angegebenen Spielerpfad; sie sagen nichts über den Pfad der angesprochenen Figur aus.
3. `auftragskeime.json`: 28 redaktionelle Skizzen und vier verbindende Ketten. Auslöser zeigen auf den jeweiligen Bitte-Knoten. Gegner sind optionale Komplikationen mit friedlicher Alternative. Ketten ersetzen die Belohnungen der verbundenen Keime. Sie sind keine zusätzlichen vier Pflichtaufträge.
4. `reaktionen.json`: acht bestehende Figuren mit je drei Zeilen pro Stadt; acht Geplauder-Einträge ohne Karte, je zwei Spieler-2-Zeilen für beide Varianten und zwei Antworten des Ermittlers. `wiedersehen` ist redaktionell; `geplauder` verwendet das vorhandene Koop-Zeilenformat.
5. `grafikwuensche.md`: genau eine benannte Sonderpose mit Requisit je Figur für BK. Keine Grafik wird in BJ erzeugt.

Die übrigen Standarddateien bleiben leer. `auftragskeime.json` und `reaktionen.json` sind ausdrücklich Redaktionsformate, keine neuen Laufzeitfelder. Bei einem späteren Einbau zuerst BH/BL bereitstellen, dann Figuren und Dialoge übernehmen, anschließend Karten, Aufträge und Geplauder-Auslöser separat festlegen.

## Spielzeit

Gespräche etwa 2–4 Minuten je Figur (56–112 Minuten insgesamt), ohne Wiederholungen und Dienste. Die 28 Keime ergeben bei späterer Umsetzung zusammen 278 Minuten (je 8–12 Minuten). Die vier Ketten benötigen jeweils 16–18 Minuten; ihre Zeiten ersetzen die darin gebündelten Einzelkeime und werden nicht zusätzlich aufgeschlagen. Auswahlweise nutzbarer Vorrat, kein zusammenhängendes Kapitel.

## Dienste und bestehender Spielzustand

Mitfahrt 5 Münzen: örtliche Rundfahrt, Nerven +4; Zollnachlass 2 Münzen: ermäßigter lokaler Fußgängertarif; Wegzehrung 6 Münzen: ein `vi_v_wegzehrung`; Arzt 8 Münzen: Untersuchung, bei Bedarf Leben +12; Segen 3 Münzen: Nerven +8; Karte 4 Münzen: ein `vi_m_landkarte_rest`; fahrender Richter 5 Münzen: begrenzter mündlicher Bescheid, Nerven +3; Wegauskunft 1 Münze: öffentlich beobachtbare Gefahrenstelle. Keine Fernreise, automatische Kartenfreigabe, Fahndungsänderung oder garantierte Wirkung auf Dritte.

Der Preis steht vor der Annahme. Nur die bezahlbare Annahme führt zum Ergebnisknoten; erneute Annahmen kosten erneut. Die bestätigte Leistung liegt auf dem Ergebnisknoten in den tatsächlich unterstützten Feldern `takes_money`, `heal`, `nerves`, `gives_items`. Das bestehende UI ruft `applyEffects(node)` auf; `choices[].effects.money` aus der Aufgabenübersicht würde hier keine Zahlung auslösen. Keine Kernänderung nötig. Geplauder und Auftragskeime verleihen keine Belohnungen.

## Prüfung

Vom Repository-Stamm: `node docs/story/vorrat_figuren/pruefen.mjs`. Die Prüfung lädt `loadContent()`, prüft Dialoggraphen und Ausstiege, Ansehensgrenzen, Pfadbedingungen und Zahlungen mit dem echten `GameState`, die redaktionellen Querverweise sowie die festen BH-/BL-Tabellen. Nicht installierte Vorrats-Items werden ausdrücklich als deklarierte externe Abhängigkeiten ausgewiesen. Bei den zwei Itemdiensten zeichnet der Test den Aufruf von `addItem` auf; Inventargewicht und spätere BL-Werte sind damit nicht getestet.
