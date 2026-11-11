# Einbaugrenzen und notwendige Entscheidungen

Dieses Paket ist Inhalt, kein laufender Kalender. Keine Datei unter `src/`, `public/` oder `tests/` wird geändert. `applyQuestPack` kann die acht Standarddateien bereits zusammenführen; Spezialdateien brauchen die unten genannten Adapter.

## 1. Kalender ist bereits vorhanden, aber anders

`Clock.js` hat inzwischen `seasonAt`, `festAt`, `SEASON_SECONDS = DAY_NIGHT_SECONDS * 4`. Das sind zwei volle Spieltage je Saison; Feste werden an passenden Tagesphasen angezeigt. CK schlägt sechs Tage und jeweils Tag 4 vor. Nicht beide Modelle gleichzeitig laufen lassen. Bestehende `saison_*` und `fest_aktiv_*` bleiben bis zur Migration maßgeblich; danach atomar an die neuen `fs_*`-Flags spiegeln oder auf sie umstellen. Das Nachtflag `k3h_nacht` behält seine Bedeutung.

Berechnung: Tag = floor(playTime / 1800) + 1, Jahr = floor((Tag - 1) / 24), Saisonindex = floor((Tag - 1) / 6) modulo 4, Saisontag = ((Tag - 1) modulo 6) + 1. Beispiele: 0 s Herbsttag 1; 3600 s Ankündigung; 5400 s Festbeginn; 7200 s Nachlese; 10800 s Wintertag 1; 16200 s Stiller Abend; 27000 s Salzsegen; 37800 s Schichtwechsel; 43200 s neuer Herbst.

`kalender.json` und `kalender_uebergaenge.json` enthalten deklarative Übergangs-Payloads in bekannten Effektfeldern. Sie werden nicht als normale Dialoge platziert. Der Adapter berechnet den aktuellen Zustand auch nach Laden, Zeitsprung oder Abwesenheit neu. Ein manuell gesetztes Festflag muss im Testmodus ohne Uhr ausreichen; ein expliziter Testmodus hat Vorrang vor dem Zeitabgleich. Keine Schalter zum Vorstellen der Uhr für Spieler.

Bei Saisonbeginn nur `fs_<saison>_wirkung_<1..4>_genutzt` zurücksetzen. Beim neuen Festzyklus nur `fs_<fest>_besucht`, Ankündigungs- und Nachleseflags zurücksetzen. Am neuen Stillen Abend `fs_stiller_abend_geruht` zurücksetzen. Quest-, Entscheidungs-, Belohnungs- und Spiel-Abschlussflags niemals kalenderbedingt löschen. Die drei Aufträge, Spiele und Andenken sind pro Spielstand einmalig. Sonst würden neue Jahre alte Ermittlungen zerstören oder Andenken vervielfachen.

## 2. Laden und Handel

`feste.json` enthält je Fest `merchants` im bestehenden Marktformat. Diese Händler in `content.market.merchants` registrieren. Ein Shop darf nur mit seinem Festflag geöffnet werden; beim Festende ein offenes Shopfenster schließen und Kaufanfragen erneut prüfen. Die Sichtbarkeit einer Bude allein ist kein server-/zustandsseitiger Kaufschutz.

Die Waren nutzen das reale Item-Feld `composure` für Nerven und `heal` für Leben. Keine erfundenen `use`-Effekte. Papierwaren werden beim beruhigenden Betrachten verbraucht; das ist im Inventar als Festaktion zu formulieren. Fest-Andenken aus `artefakte.json.list` zusätzlich in die Artefaktliste übernehmen. `source: fest` ist eine neue Quellenkategorie, wie im Auftrag gefordert, und braucht eine Anzeigezuordnung. Nicht in zufällige Beute aufnehmen. Die Segen gelten nur beim Aktivieren, nicht allein durch Besitz; keine automatischen permanenten Charakterwerte.

## 3. Sichere Festtage und Stiller Abend

Auf exakt den sechs Karten aus `feste.json.karten` die zufällige Stadtgegner-Erzeugung unterdrücken und bereits geladene zufällige Stadtgegner friedlich entfernen. Explizite Hauptstory-Kämpfe, Fahndungsstreifen und freiwillige Übungen bleiben erhalten. Keine globale Straffreiheit, kein Zurücksetzen von `wanted`. Der Grauspäher erhält nur ein Gespräch; seine bisherige Platzierung beim Einbau berücksichtigen, damit er nicht doppelt auf derselben Karte steht. In Wexmoor und Dunscar nur vorhandene örtliche Grauspäher verwenden, keine Kettlegate-Figur ungefragt teleportieren. Die gemeinsame Gerede-Zeile liegt für alle drei Feste bereit.

Am Stillen Abend Verkauf und Ankauf schließen, aber keine Gebäudezugänge. Fallrelevante Gratisübergaben, Rezepte für zwingende Hauptschritte, Heilung für den Fortgang, Auskünfte und Unterschlüpfe müssen über vorhandene nichtkommerzielle Wege erreichbar bleiben. Falls ein Hauptschritt ausschließlich Kauf verlangt, erhält er vor Einbau einen kostenlosen Ersatzkontakt; niemals bis zum nächsten Tag warten lassen. Ausruhen gibt insgesamt +5 Nerven, nicht +5 je Raum. Die drei Ruhekontakte teilen ein einziges Sperrflag.

## 4. Kleine saisonale Modifikatoren ohne erfundene Datenfelder

Die vier kleinen Aktionen je Saison in `wirkungen.json` sind vollständig in Dialogen umgesetzt und stadtübergreifend einmal je Saison nutzbar. Weitere gewünschte passive Modifikatoren werden bis zu einem echten Schema ausschließlich hier spezifiziert:

- Herbst: Sammelfunde liegen am Saisonplatz; kein zufälliges Essen unbekannter Pilze. Optional Verkaufspreise für gewöhnliche Kräuter +5 %, keine Beweisstücke.
- Winter: Reiseaufschlag höchstens +1 Schilling und zugleich höchstens +15 % des Grundpreises, abrunden; bei unzureichendem Geld entfällt er. Alternativ eine milde Nachtkälte von -2 Nerven nur einmal je Nacht beim ersten Außenkartenwechsel, nie unter 1; nicht beides gleichzeitig aktivieren. Heiltränke in vorhandenen warmen Innenräumen optional +10 %, maximal normales Lebenslimit. Diese beiden zusätzlichen Wirkungen benötigen Ortsklassifikation, Nacht-Sperrzeit und Rundungsregeln.
- Frühling: Marktpreise gewöhnlicher Verbrauchswaren -5 %, abrunden, Mindestpreis 1; keine feste Questzahlung verändern. Regen und Vögel bleiben rein visuell.
- Sommer: Wasserpreise höchstens +10 %, aufrunden, aber zusätzliche Rundung nicht über +15 % treiben; kostenlose Wasserstellen aus dem Paket bleiben offen. Hitzeflimmern und Kanalgeruch haben keine Bewegungs- oder Sichtblockade.

Alle Multiplikatoren pro Transaktion nur einmal anwenden, nie aufeinander stapeln. Koop nutzt denselben Kalender, dieselben Sperren und dieselben Preise; kein doppelter Nerven-/Geldgewinn durch beide Figuren. Keine dauerhaften Wetterwerte, keine Kampfwerte ändern.

## 5. BV-Registrierung und Stimmungen

Die JSON-Dateien referenzieren echte Manifest-IDs. Ein Manifest ist noch kein Phaser-Atlasregister. Gast-Sheets unter diesen Schlüsseln registrieren; Prop-IDs auf die in `grafikwuensche.md` genannten Regionen abbilden. Auf beiden Karten jedes Festes stehen nichtblockierende Festobjekte; vier Buden stehen auf dem jeweiligen Markt. Die vorgeschlagenen Bodenzellen sind gegen die aktuellen Karten geprüft, eine spätere Raumgestaltung darf sie verschieben, jedoch niemals Ausgänge überdecken.

`mood` enthält nur bestehende Portraitwerte (`neutral`, `thoughtful`, `sad`, `determined`). Die sechs BV-Gerede-Piktogramme (`musik`, `trinken`, `lachen`, `streit`, `kuss`, `schlaf`) sind keine Portraitstimmungen. Ihre Zuordnung steht als Grafikauftrag in der Wunschliste; für ihre Ansteuerung braucht es einen eigenen Renderer-Adapter. Keine erfundenen Mood-Werte in Dialogdaten.

## 6. Reserve-Unterschlüpfe, Texte und Zeitung

Klammer (`cw_crayford`) und Frost (`bh_bellweather`) existieren in `docs/story/vorrat_figuren/`, ihre Werkstatt und ihr Bügelraum noch nicht als Karten in `loadContent()`. Ihre vier Saisonzeilen und je ein Stiller-Abend-Lesestück liegen in `texte.json`, ohne erfundene Karten-IDs. Erst bei Einbau der entsprechenden Städte platzieren. Aktuell erhalten Büro, Zunders Kahn und Pfiffs Speisewagen je einen Lesetext und einen Ruhekontakt.

`texte.json.gerede` nach Saison, dann wie bestehendes Gerede nach Stadt/Karte lesen. Verbündeten- und Händlertexte sind Zusatzzeilen, keine Ersatzdialoge. Der erste saisonale Lesetext ist ein Wetterbericht am Markt; ihn zusätzlich als Zeitungsspalte abdrucken. Die zwölf Lesetexte stehen bereits als native Leseobjekte in `platzierung.json`; nicht doppelt aus `texte.json.lesestuecke` platzieren. `zeitung.json` hat drei Phasen je Fest und eine alternative Nachlese für Abwesenheit. Beide Nachlesen sind gegenseitig ausgeschlossen. Vorhandene BV-Meldungen aus `src/data/packs/feste/` bei Einführung von CK anhand ihres Zwecks ersetzen, nicht parallel dieselbe Ankündigung ausspielen.

## 7. Quest- und Kampfdetails

Die Bootsspur erreicht die Resonanzkammer über das bezeichnete Ablaufgitter an den Docks. Es gibt keinen neuen Zugang zur gesperrten Kammer und keine Umgehung eines Hauptfalls. Zwei Fundstellen, optionale Gespräche und Rückweg ergeben etwa 20 bis 30 Minuten pro Auftrag, keine künstliche Wartezeit.

Dunscars Zusatzdialoge behandeln alle vier tatsächlichen `k3a_end_*`-Flags. Vor einem Ende bleibt die gewöhnliche Lesart verfügbar. Kein Ende wird neu gesetzt oder umgedeutet.

Der Auftrag nennt den Effekt `encounter`, der aktuelle `GameState.applyEffects` startet Kämpfe aber über `combat`. Der Ringdialog verwendet deshalb das vorhandene `combat`, nicht ein neues Feld. `practice: true` stammt aus dem existierenden Holt-Übungskampf: Leben wird nach dem Kampf wiederhergestellt, keine Geldstrafe. Der Ring wird nie als Stadtgegner gespawnt; Preisgeld wird ausschließlich über den einmalig gesperrten Dialog ausgegeben. Die Ringkasse bleibt nach Festende bei ausstehendem Siegpreis sichtbar.

Die sechs bekannten Festbesucher erhalten ebenfalls Festplatz-Positionen. Beim Einbau ihre normalen Positionen während des Festflags ausblenden, mit demselben Dialog und ohne Sperre von Hauptfall-Optionen. Nach Festende kehren sie an den normalen Ort zurück. Die bestehende Platzierungs-API verschiebt Figuren nicht automatisch; diese Übergabe ist Teil des Zeit-/Platzierungsadapters, keine zweite gleichzeitig sichtbare Kopie. Die zwölf Budenschilder verwenden die vier vorhandenen Gastdialoge und dieselben Shops; keine zweite Händlerdefinition.
