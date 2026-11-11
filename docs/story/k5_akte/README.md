# CG · Der Garten der fehlenden Tage

Einbaupaket für Kapitel 5 in Briarholt, nach Geschichte 2 aus `docs/story/kapitel3/geschichte_2.md`. Keine Laufzeitdateien geändert. 5 Hauptaufträge, 20 Fährten, 80 Hinweise, 20 Deduktionen, 298 Dialogknoten einschließlich BJ-Zusätzen, 12 Ventile, 12 individuelle Gesprächsregister und 4 Enden.

## Spielverlauf

Anreisevarianten reagieren auf die vier Calderwick-Enden; Dunscar dient nur ohne abgeschlossenes Kapitel 4 als Ausgang. Brief und Sendung bleiben im bisherigen Unterschlupf. Die Reise führt über `reise_landstrasse` nach `bh_kutschenhof`; Frost bringt dich vor jeder riskanten Erkundung zum unabhängig beheizten Bügelraum.

Jede Fährte bietet vier einzeln untersuchbare Quellen. Ihre ersten beiden Fakten ergeben die Deduktion; die anderen Quellen liefern Kontrolle und Kontext. Sechs Quellenabschlüsse verlangen zusätzlich die belegte Richtigstellung im BJ-Verhör. Frost schließt die ersten vier Akte ab und startet den nächsten; Akt V endet erst nach ausdrücklicher Endwahl. Belohnungen sind an einmalige Abschlüsse gebunden.

Die drei Bossstationen erlauben Kampf oder belegten Eingriff. Die Siegflags stammen aus dem Kampf, die friedlichen Lösungen setzen eigene CG-Flags. Greavesend bleibt Gesprächspartnerin. Der optionale Aussaatschwarm hat ausschließlich Übergabetexte, seine Werte gehören CH.

## Wärme und Entscheidungen

Die Dialogfassung verwendet drei Ventilbanken mit je vier Kreisen. Pro Bank ist höchstens ein Überschusskreis offen. Eine bestätigte Öffnung schließt die drei anderen, sodass höchstens drei Kreise warm bleiben. Grundversorgung und reparierter Reservebogen sind unabhängig. Rückläufe haben eigene Flags; Lesen schaltet nichts. Alle Bestätigungen nennen Folgen und erlauben Abbruch. Die fehlerhafte Leitung durch das leere Gebäude kostet zwei Nerven und führt in den Bügelraum zurück; Hinweise bleiben erhalten.

Patienten beginnen mit `entscheidung: null`. Das jeweilige Gespräch setzt genau eine Erklärung; kein fehlender Rest wird als rückführbar angeboten. Die sechs BJ-Personen werden nicht nachträglich alle zu Klinikpatienten erklärt: bei Frost, Adeline, Enna und Felix fehlt ein nachgewiesener eigener Rest, entsprechend begrenzt bleibt ihr Gespräch. Sechs weitere Namen sind reine Registerpersonen ohne neue NPC-Definition. Das Finale bewahrt Einzelentscheidungen, statt sie durch einen Sammelwert zu ersetzen.

## Dateien und Prüfung

Die Standarddateien entsprechen dem Packformat. `npcs.json` und `encounters.json` bleiben leer, damit Vorrats-IDs nicht dupliziert werden. Zusatzdateien liefern Anreise, Ventilbeschreibung, Patientengespräche, Bosskontext, Epiloge und Kurblatt-Meldungen. Positionen sind Einbauvorschläge.

`node docs/story/k5_akte/pruefen.mjs` prüft JSON, Dialogziele, Flags, registrierte Figuren/Gegenstände/Kämpfe, Präfixe, Umfang und die Drei-Kreise-Invariante. Noch fehlende CH/CD-Karten und CC-Endflags werden als externe Verträge sichtbar ausgegeben. Das ist keine Bestätigung eines bereits spielbaren Einbaus. Zusätzlich wurde die Erreichbarkeit aller Akte und vier Enden durch monotone Analyse der Dialoggraphen geprüft; sie ersetzt keinen Laufzeittest nach Integration.

Vorgeschlagene Indexzeile für `docs/story/README.md`: `k5_akte/ – CG: Briarholt, fünf Akte, Wärme und Rücklauf, Patientenentscheidungen und vier Enden.` Die zentrale Datei bleibt wegen der ausdrücklichen PR-Beschränkung auf diesen Paketordner unangetastet.
