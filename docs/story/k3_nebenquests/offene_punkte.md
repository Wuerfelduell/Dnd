# Einbauverträge und offene Punkte

## AR: Akte, Figuren und Zusatzdialoge

AR liefert `k3_arrived` und `k3a_akt1_done` bis `k3a_akt5_done`. AT liest diese Flags nur. `k3a_akt5_done` beendet das Akt-V-Gerede; für die Zeit danach ist hier kein geratenes Ende-Gerede enthalten. Kein AT-Flag ist Voraussetzung für eines der vier Kapitelenden.

`dialog_zusaetze.json` verwendet die festen Figur-IDs als **vorgeschlagene Dialog-IDs**: `k3_pfiff`, `k3_mabel`, `k3_pelham`, `k3_nellie`, `k3_huxford`, `k3_adaine`, `k3_oren`, `k3_esther`. Der Prompt legt die Figur-IDs fest, nicht ausdrücklich deren tatsächliches `dialogue`-Feld. Vor Einbau auf ARs Dialog-IDs abbilden. Der aktuelle `applyQuestPack` hängt Optionen an `nodes.start`; daher müssen die betreffenden Gespräche einen solchen wieder erreichbaren Hub besitzen oder der Integrator muss die Zusätze am entsprechenden Hub zusammenführen. AT definiert keine Ersatzfiguren.

Pfiff wird nicht zwischen zwei Orten dupliziert. Bei `k3n_kalkkinder` bezeichnet Arbeiterbogen den Schauplatz, nicht einen zusätzlich behaupteten Pfiff-Spawn. Die Questziele für Pfiff auf seinen tatsächlichen sicheren Aufenthaltsort setzen; ab Freischaltung des Speisewagens ist dies `ds_speisewagen`. Entsprechend bei Mabel Arbeiterbogen/Teesaal und Oren Schwellenring/Runddepot die AR-Aufenthaltslogik verwenden. Einzug in den Speisewagen und reguläre Gesprächserreichbarkeit müssen vor Freischaltung abhängiger Nebenquest-Schritte gesichert sein.

Nellies Nebenauftrag ist ein zusätzlicher örtlicher Versuch mit einem einzelnen zustimmenden Arbeiter. Er setzt nicht ARs Entscheidung aus Akt II zurück, stellt keine geheime Verbindung wieder her und beansprucht keinen Hauptstorybeweis. Falls ARs Offenlegungsweg jede Nutzung des Telegrammgeräts ausschließt, die Variante „einmalige Fälschung“ durch einen mechanisch ungesendeten Demonstrationsversuch mit anschließendem Heimweg ersetzen oder die entsprechende öffentliche Testmöglichkeit mit AR abstimmen. Kein geratenes fremdes Flag wurde eingeführt.

Esthers Empfangsnotizen sind **keine Zustimmung** zu den Gedenkorten des Hauptfalls. Keine Nebenquest-Entscheidung setzt Familienzustimmung, Leitungstrennung, Sieg über Gallowmere oder ein Ende. Der Schriftzug auf dem Grabstein ist ein behebbarer Kopierfehler, keine neue Todesprophezeiung. Die Herkunft des erneut eingeworfenen Auftrags bleibt ausdrücklich unbelegt.

## AS: Karten, Positionen und Kampf

Benutzte Karten: `ds_endbahnhof`, `ds_schwellenring`, `ds_arbeiterbogen`, `ds_kalkmarkt`, `ds_bruchstufen`, `ds_signalhang`, `ds_speisewagen`, `ds_pruefhaus`, `ds_teesaal`, `ds_lohnbuero`. Alle gehören zu AS und tragen dort `city: "dunscar"`. AT liefert nur `platzierung`-Einträge, keine Kartenkopien. Koordinaten sind Vorschläge auf kleinen Rastern, keine bestätigten begehbaren Tiles. Vor Aktivierung alle Positionen gegen ASs Kollisionen, Eingänge und NPC-Routen prüfen. Lesestücke getrennt aus `lesestuecke.json` übernehmen, nicht doppelt platzieren.

`k3n_drehscheibe_offen` öffnet **eine zusätzliche** Verbindung Schwellenring ↔ Bruchstufen über den seitlichen Wartungssteg. Es ersetzt nicht den frühen Hauptstorydurchgang. Beide Ausgänge setzen dasselbe Freigabeflag. `k3n_drehscheibe_laststeg` erlaubt erzählerisch Handkarren und Geländer; `k3n_drehscheibe_fusssteg` zeigt einen überdachten Fußsteg. Bidirektionalen Übergang mit sicheren Spawnpunkten einbauen. Keine Rufladung verbrauchen, keine Pfadfähigkeit verlangen. Ohne diesen Adapter bleibt die zugesagte Abkürzung unwirksam und die Quest darf nicht aktiviert werden.

Nur `k3n_vermessung` enthält einen optionalen Kampf mit `geruestklang`. AS liefert dessen vollständige Werte, Grafik, Flucht-/Niederlageweg und gewöhnliche Beute. Der Kampf setzt einmalig nur ATs Versuch-Flag; Sieg ist nicht für Hinweis, Abschluss oder Belohnung nötig. Flucht/Niederlage muss zur sicheren Fußroute zurückführen. Der Adapter muss das `encounter`-Startverhalten wie bei vorhandenen Dialogknoten verwenden, nicht nach einem zusätzlichen Abschlussklick ein zweites Mal starten. Keine neuen Bosswerte, kein Kernzutaten-Drop.

Bestiarium-Schlüssel `schichtgaenger`, `kalkstaubgeist`, `signalkraehe`, `lohnlistenmotte`, `geruestklang`, `nachhall` sind vorhandene gemeinsame **Gegnerverträge**, keine von AT neu vergebenen IDs. AS liefert sie. Schichtgänger bleiben lebende, nach Kampf bewusstlose Menschen. AT erfindet keine Schwächen oder Trefferzeiten, solange diese Werte nicht vorliegen.

## AI/AH: Koop

`koop_aktiv` kommt aus dem aktiven Party-Zustand. Bei Beitritt, Austritt und Laden synchronisieren. Für p2a/p2b existiert im hier gelesenen Stand kein entsprechendes Bedingungsfeld. Deshalb keine erfundenen `requires_variant`-Felder oder fremden Flags in den Daten. Die vier neutralen Knoten sind sofort mit dem bekannten Flag formulierbar; die acht vollständigen Stimmfassungen in `koop_stimmen.md` bei Integration über den tatsächlichen Erscheinungsselektor einsetzen. Nie beide Varianten hintereinander abspielen. Wegfall von Spieler 2 darf keinen Hinweis oder Abschluss blockieren.

## Lore-Loader und Zeitung

`gerede.json` nutzt das vorhandene Schema Stadt → Karte → bedingte Sätze. Dunscar als Stadt und seine Karten in den Lore-Loader aufnehmen. `zeitung.json` übernimmt das Array-Schema von `src/data/packs/lore/zeitungen.json` mit Zeitungsschlüssel `k3n_kalkblatt`. Diesen Schlüssel unter dem Anzeigenamen **Dunscarer Kalkblatt** registrieren und einen Zeitungskontakt am Kalkmarkt/Endbahnhof anbinden. Die acht Artikel verlangen jeweils eine konkrete öffentliche Entscheidung; private Briefe und vertrauliche Atteste werden nicht versehentlich veröffentlicht.

Zeitungsartikel, Lesestücke und Bestiarium werden vom normalen Quest-Pack-Import nicht automatisch übernommen. Sie benötigen den jeweiligen Lore-Einbau. Keines der 25 Lesestücke enthält einen exklusiven Pflichtbeweis; alle Pflichtbelege kommen aus Questobjekten/Gesprächen.

## Abnahme im Spiel

Alle 24 Abschlüsse anklicken, danach wieder mit dem Kontakt sprechen: keine zweite Auszahlung. Speichern/Laden mit beiden bereits aufgenommenen Hinweisen, aber noch ohne Gegenprobe testen. Briefzweige nach allen vier Wexmoor-Enden kontrollieren, einschließlich fehlender optionaler Wexmoor-Quests. Bei beschädigtem Spielstand mit keinem Wexmoor-Endflag wird kein Brief geraten; das ist ein zu reparierender Vorzustand. Bei regulären Kapitelständen ist exakt ein solches Flag gesetzt.

Nellies Kettlegate-Varianten sind durch Priorität und Negativbedingungen eindeutig. Koop während offener Dialogauswahl verlassen, anschließend solo abschließen. Beide Stegvarianten in beiden Richtungen begehen; keine Lokfahrt auslösen. Den freiwilligen Gerüstkampf gewinnen, verlieren und abbrechen, dann friedlich abschließen. Audio ausschalten: alle Beobachtungen stehen vollständig im Text. Questtempo mit Erstspielern prüfen, Ziel 20–40 Minuten, kein künstlicher Timer.
