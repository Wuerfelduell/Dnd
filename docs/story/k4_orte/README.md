# CD · Calderwick: Orte und Reise

18 Karten, sechs kostenlos verbundene Terrassen, acht Innenräume einschließlich Druckkammer, drei Gefahrengebiete und die Landstraße. Je Karte 6–12 kurze Untersuchungen; acht Rohrpoststationen, Klammers dauerhafter Unterschlupf, zehn BJ-Stadtfiguren und alle acht Reisefiguren. Das Paket liegt ausschließlich in docs und ist nicht automatisch im Spiel aktiv.

## Einbau

1. BH/BJ/BL als eigene Packs laden. `verknuepfungen.md` löst Zonen- und Händler-IDs auf, ohne ihre Daten zu kopieren. Kein Import leerer Zonen-Sammlungen als fertige Gegnerlisten. Reisebosse nur über ihre Dialoge zulassen; Landstraße nicht als kostenlose Schnellreise registrieren.
2. Karten, Reiseziele, lokalen Restboss, Artefakt und acht Standarddateien nach dem bestehenden K3-Pack-Verfahren übernehmen. `platzierung.json` ergänzt auch den Einstieg in `ds_endbahnhof` [25,19]. Die acht Innenräume bleiben räumlich mit ihren Terrassen verbunden; finale Zugänge verlangen `cwa_akt4_done`.
3. Mit CC die in offene_punkte.md ausdrücklich benannten Voraussetzungen, Anreise, zehn Anker, fünf Abgleich-Brücken und Finale abstimmen. Die vier Dunscar-Enden bleiben CCs Anschluss, keine rückwirkende Wexmoor-Verzweigung. CF behält Nebenfigurenleben; CD definiert nur den zusätzlichen Marktstand Mina Falz.
4. CE ersetzt Platzhalterthemen und setzt Pins. Aktuell Bahnhof `c_bahnhof`, städtische Markt-/Wohnterrassen `altmarkt`, Verwaltung/Innenräume `m_kontor`, Gefahren `g_katakomben`.

## Schwierigkeit und Beute

BH-Werte sind für Sequenz 4 bis 3 ausgelegt. Mit bereits erworbenen Dunscar-Kernzutaten entspricht Calderwick etwa der Rufschlucht, nicht einem neuen Sprung der Ritualleiter. Bleisammler, Zusteller und Nullfundament liefern Ersatzquellen für Seq 3, 2 und 1, nur eigener Pfad und nur fehlende Zutat, einmalig pro Quelle. Alle zehn Pfade sind berücksichtigt. Friedliche Lösungen erhalten dieselbe Bergung. Fährte IV.3 erklärt die Herkunft, fügt keine Rezepte hinzu.

Zehn lokale Gegenstände ergänzen BL, neun liegen als einmalige Restefunde bereit. Der Aufzugsschlüssel gehört zur kleinen Quest „Ein offenes Fach“: vertrauliche Rückgabe oder öffentliche sachliche Meldung, jeweils 12 Schilling und Die getrennte Klammer. Der Fluch steht bereits im Questtext. Das Artefakt benutzt vorhandene Faktoren `vision_cost` und `max_nerves`.

## Reise und Bürgenbrett

Zwölf Ereignisse bilden den gewichteten Adapter-Vorrat. Der schon mit Dialogen darstellbare Ersatz lässt zwei bis drei unterschiedliche Ereignisse wählen, erhebt 4 Schilling oder eine Wegzoll-Marke und verhindert beide Reisebosse auf derselben Fahrt. Hin- und Rückfahrt gehen nach Dunscar beziehungsweise Calderwick. Briarholt ist ein dokumentierter späterer Anschluss, kein defekter Teleporter.

Bürgenmechanik, Quellenunabhängigkeit, Vorschau, kostenloses Umsetzen, Rücksetzung, öffentlich/vertraulich, Barrierefreiheit und Koop-Atomizität stehen in buergenmechanik.md. Die lokale Übung ist vollständig eigenständig. Fünf Hauptaktions-Brücken sind vorhanden; ihre ausdrücklich offenen CC-Quellen werden nicht als fertige Kapitelhandlung ausgegeben.

## Prüfung

Vom Repository aus: `node docs/story/k4_orte/pruefen.mjs`. Der Prüfer lädt reale Karten über `loadContent()`, prüft alle JSON-Dateien, Verweise, bedingte Starts, Präfixe, bekannte Flagproduzenten, Koordinaten, BFS-Erreichbarkeit und gegenseitige Reiseboss-Sperren. Er prüft auch den Materialisierungsvorschlag gegen BH und simuliert Dialogabläufe für Fahrpreis, zwei/drei Begegnungen, Pfadbeute und einmalige Questbelohnung. Externe CC-Abhängigkeiten werden einzeln als offen ausgegeben; unbekannte zusätzliche Verweise sind Fehler. Dies ersetzt nicht die spätere integrierte CC/CE-Abnahme.
