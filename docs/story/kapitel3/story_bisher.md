# Nebelakten: Stand vor Kapitel 3

Lesestand: main, 59daf78, einschließlich des aktualisierten AC-Auftrags. Die folgenden Aussagen trennen die gemeinsame Handlung von möglichen Spielausgängen. Die drei Kapitelentwürfe sind Alternativen, keine bereits festgelegte Weltgeschichte.

## Kapitel 1: Kettlegate

Du arbeitest als freier Ermittler für Inspektorin Marlowe. In neun Fällen wird aus einer verschwundenen Person eine zusammenhängende Ernte: Miriam Vey nimmt Licht und Stimmen, Felix Dunmore sammelt Stimmen in Sternglas, Lucan Mews entzieht Ballgästen ihre Schatten und Imogen Wren lenkt Waisenkinder mit Traumfäden. Wren lässt den Bankier Josiah Thorne durch Benji töten, um die Räumung von St. Brigid abzuwenden. Vey will ihre tote Tochter Lilian zurückholen; Lilians Echo selbst möchte ruhen. Rook hilft Vey aus persönlicher Bindung und schiebt Verdacht auf Unschuldige.

Professor Lucius Starling beliefert und lenkt die Täter. Seine Briefe verlangen, dich gewinnen zu lassen; sein Hauptbuch verzeichnet Licht, Stimmen, Glockenklang, Schatten und Träume. Der Stern über Kettlegate sammelt die Ernte. Anonyme Briefe machen aus deinen Asservaten Belastungsmaterial gegen dich. Nach Fall 9 gelangst du mit einer Fahrkarte unter falschem Namen nach Wexmoor, unabhängig davon, wie sauber du den Sternfall gelöst hast.

Gerettete Menschen sind keine garantierten Überlebenden: unter anderem unterscheiden elias_rescued/elias_dead, hester_saved/hester_lost, singers_freed, shadows_returned und benji_found/benji_lost die Ausgänge. Vey darf nur mit vey_fled persönlich wiederkehren. vey_arrested bedeutet keine heimliche Flucht. kapitel1_done bezeichnet den Kapitelabschluss, nicht einen vollständigen Erfolg.

## Kapitel 2: Wexmoor

Juna „Zunder“ Fenn empfängt dich nach Kohlen-Jems Telegramm. Ihr Torfkahn wird Unterschlupf und Ausgangspunkt einer Jagd in fünf Akten. Der angeblich tote Starling lebt als Mr. Lucent, halb Licht und abhängig von Lampenöl. Seine Flucht führt ins Vergessmoor. Danach verlagert sich die Jagd auf das Lichtamt: „L.“ ist Magistra Ilse Brandt, Starlings frühere Lehrerin und Auftraggeberin. Du bist ihre letzte Ernte, ein durch gelöste Fälle besonders heller Fremder.

Brandt hält eine wirkliche Bedrohung auf und bezahlt dafür mit anderen Menschen. Unter dem Moor liegt etwas, das Namen frisst. Der Turm brennt seit Jahrhunderten mit Fremdenlicht; Brandts jüngere Sammelpraxis steht mit dem Stillstand des Sinkens seit dreißig Jahren in Verbindung. Mutter Sedge kennt die älteren Namenstäfelchen. Die Altstadt trägt den Hinweis: „Es wächst unter Kettlegate weiter.“ Das siebte Schleusentor behebt einen Wasserzufluss, nicht nachweislich das Namenfressen.

Zunder kennt Schmuggelwege und das Lichtamt, aber keine vollständige Kosmologie. Sedge kennt überlieferte Praktiken und ihre eigene Schuld an Elsbeth Rowes Weiterleitung. Elsbeth kann ihren Namen zurückbekommen, falls k2_rowe_frei gesetzt wurde. Hale kennt Befehle und Transporte; k2_s_hale_done steht für ihre öffentliche Verlesung von 212 Namen. Marlowe kann einen Haftbefehl und das Ratsbuch sichern. Starling ist nur bei k2_starling_witness als Zeuge verfügbar; k2_starling_gone bedeutet sein Verschwinden ins Licht.

| Ende und Flag | Verbindlicher Anschluss |
|---|---|
| Vor Gericht, k2_end_rein | Brandt sitzt in Zelle 2. Hale führt die Wache, der Turm brennt mit Öl, die Fremdenlichter ziehen heim. Das Moor bleibt unruhig. |
| Feuer erlischt, k2_end_moor | Wexmoor sinkt wieder. Brandt ist verschwunden, ihr Siegel und ihr Namenstäfelchen bleiben zurück; ihr Tod ist nicht bestätigt. |
| Lichtmeister, k2_end_lichtmeister | Du übernimmst das Amt. Menschen verschwinden weiter, Zunder bricht mit dir. Keine automatische Vergebung. |
| Aufs Meer, k2_end_meer | Du entkommst mit Kit und Zunder. Brandt bleibt im Amt; die Opferpraxis geht weiter. |

Alle vier setzen kapitel2_done. Optionales Wissen muss neu auffindbar sein, wenn ein Nebenauftrag ausgelassen wurde.

## Offene Fäden für die drei Alternativen

- **F1: Der Hunger und seine Ausbreitung.** Herkunft, Reichweite und Begrenzung der Macht unter Moor und Kettlegate sind ungeklärt. Quelle: Brandts Gespräch und Altstadt-Inschrift in [wexmoor.json](../../../src/data/wexmoor.json).
- **F2: Namen zurückgeben.** Täfelchen, Elsbeth und die versunkenen Ratsherren zeigen verschiedene Formen des Erinnerns. Ein allgemeines Heilmittel ist nicht bewiesen. Quelle: Sedge, Elsbeth, k2_s_sedge.
- **F3: Die verstreute Ernte.** Rückgabe, Verlust und Rückstände von Stimmen, Schatten und Träumen hängen von Entscheidungen ab. Gerettete Menschen dürfen nicht automatisch erneut zu Opfern werden. Quellen: Enden der Fälle 1 bis 9, insbesondere [Stimmen](../../../src/data/case_05.json), [Schatten](../../../src/data/case_06.json) und [Sternfall](../../../src/data/case_09.json).
- **F4: Wer liest mit?** Schleierschwestern verkaufen Geheimnisse; eine Schwester liest Revierakten. Ihr konkretes Gesicht ist offen. Quelle: veil_in_police in [factions.json](../../../src/data/factions.json), Haus Morrow und Schleierhaus.
- **F5: Schuld nach der Rettung.** Hales Ablieferliste, Zunders Mutter und der fortgesetzte Fremdenhandel verlangen Folgen, keine neue Entschuldigung für Brandt. Quelle: Wexmoor-Nebenaufträge und Enden.
- **F6: Macht ohne fremde Opfer.** Die sieben Pfade reichen derzeit bis Sequenz 5. Sequenz 4 kann erschlossen werden, braucht aber eine eigene Formel, Zutaten, verdauten Vorgänger und Ritual. Quelle: [pathways.json](../../../src/data/pathways.json), [treffen.json](../../../src/data/treffen.json).

Zirkelhandel ist von den gewalttätigen Fraktionen zu unterscheiden. Artefakte verbinden Nutzen und Fluch; insbesondere schützt das Namenstäfelchen seinen Träger, ohne ganze Städte zu heilen. Quellenwidersprüche werden nicht zu neuen Tatsachen: Oda nennt bei Lilian Fieber, die Fallakte den Brand; das Gerichtsende erwähnt Starling auch auf der Ratsbuch-Alternative. Die Entwürfe benötigen weder eine Festlegung der Todesursache noch Starling als zwingenden Zeugen.
