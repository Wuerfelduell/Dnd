# Einbau und offene Verträge

## Zuständigkeit und Ladefolge

Nur `docs/story/k4_akte/` gehört CC. Der einzige erlaubte gemeinsame Dokumentationseingriff ist die Indexzeile in `docs/story/README.md`. Keine neue Definition für BJ-Figuren, BH-Bosse oder BL-Gegenstände. `npcs.json` und `encounters.json` sind absichtlich leer. CD liefert die in `schnittstellen.json` exakt reservierten 18 Karten sowie die Werte für `cwa_registerleib_rest`; diese Werte werden hier trotz CC-Präfix ausdrücklich nicht erfunden. CE liefert Kartenbilder, CF Nebenaufträge.

Beim Einbau zuerst BH/BJ/BL und CD laden, dann CC mit den üblichen Standarddateien anwenden. Zusätzlich `faelle.json`, `boss_texte.json`, `epiloge.json` und `zeitung.json` übernehmen, wie in Kapitel 3. Es gibt im aktuellen `src/data/packs/k3_akte/` keine `anreise.json`, obwohl der CC-Auftrag darauf als Vorbild verweist. CCs `anreise.json` ist daher ein lesbarer Reisevertrag; tatsächlich spielbare Papier- und Pfiff-Knoten liegen in `platzierung.json` und `dialog_zusaetze.json`.

## CD: Position prüfen

**Alle 135 Platzierungen sind Kachelvorschläge, keine bestätigten begehbaren Koordinaten.** Vor Einbau Position prüfen, gegebenenfalls versetzen. Die Objekt-IDs und Questziele bleiben dabei gleich. Je Fährte liegen vier Lesestellen bei `[3/5/7/9, 4+Akt]`, die Schlussstation bei `[6,10+Akt]`. Abgleichstationen schlagen `[12,5]`, Bossstationen `[12,9]` und Kernfächer `[12,11]` vor. Das gilt auch für Gefahrengebiete; ihre Hinweise müssen vor dem inneren Kampfraum erreichbar sein.

Figuren stehen als Vorschlag bei `[5,5]`, Wetherby bei `[7,5]`; Ida steht nacheinander hinter der Kabinenscheibe `[13,7]`, im Archiv `[13,7]` und in der Werkstatt `[7,5]`. CD muss diese drei Ida-Platzierungen anhand `cwa_ida_im_archiv` und `cwa_ida_frei` gegeneinander sperren, nicht drei Figuren erzeugen. Gleiches gilt für Wetherby in Villa und Druckkammer. Keine parallelen Duplikate aus CD hinzuladen.

Die Ankunft benutzt `cw_gleisfuss`, Spawn `aufzug`. Alle übrigen Rückwege benötigen einen sicheren Spawn `default`. Klammer muss in der Buchbinderei schon vor dem Akt-I-Abschluss erreichbar sein; `cwa_werkstatt` schaltet die vollständige Einrichtung frei und darf nicht die Tür zum Questabschluss sperren. Kontakte bleiben im fünften Akt an ihren angegebenen Orten erreichbar, auch nach öffentlicher Namensnennung. Ihre zusätzlichen Rückbestätigungsoptionen sind die konkrete Folge der Vorladung.

## Reise über die Landstraße

Das Papier kommt immer aus Dunscar; Marlowe, Kit und Zunder lösen die Reise nicht aus. Die Stilllegung wird nicht rückgängig gemacht. Bei Gegenstimme bleibt die Anlage ohne deine Rückkehr und Zustimmung aus, Pfiff behält den Abschaltschlüssel. Bei Vollzähligkeit erteilt Pfiff keine nachträgliche Zustimmung.

Der vorhandene `travel`-Effekt kennt nur ein Ziel, keine mehrteilige Reiseroute. Der Dialog-Fallback endet deshalb wie gefordert direkt bei `cw_gleisfuss/aufzug`. CD kann diesen einen Übergang beim Einbau über `reise_landstrasse` führen: unabhängige Frachtbahn, gesicherte Raststelle, optional angekündigter `vg_all_boss_landvermesser` nach BH. Umgehen oder der friedliche BH-Eingriff müssen die Ankunft gleichwertig erlauben. Keine Schlafkutsche zusätzlich auf derselben Hinfahrt erzwingen, keine Kernhinweise oder Einwilligungen hinter einem Reiseboss verbergen. Eine Begegnung darf nur nach ausdrücklich bestätigter Reise ausgewählt werden. Pfiff steigt spätestens an der Landstraße aus; alte Stadtfiguren reisen nicht nach Calderwick mit.

## Abgleich und Bürgenbrett

`anker.json` enthält die Herkunftsklassen der 22 Flag-Anker. Die `benoetigt`-Listen in `abgleiche.json` sind alternative Kombinationen, jeweils zwei verschiedenartige Quellen derselben Person. Eine zweite Kopie desselben Ursprungs ist kein zusätzlicher Anker. Für I.4, II.2, III.3, IV.2, V.1 und V.4 existieren vollständige Dialog-Fallbacks mit Vorschau und Bestätigung. Sie wählen jeweils ein Paar aus und benötigen keinen noch nicht implementierten Slotzähler. Der spätere dynamische Code erlaubt höchstens drei gleichzeitig markierte Verbindungen und kostenloses Umsetzen in der Werkstatt.

Öffentlichkeit setzt `cwa_verraten_<figur>` dauerhaft; Vertraulichkeit löscht frühere Veröffentlichungen nicht. Nur die beschriftete Bestätigung verändert den Zustand. Ein Fehlversuch belastet einmalig Nerven und schickt zum sicheren Rückweg, ohne Fakten, Items oder Quellen zu löschen. Kein Echtzeitzähler, keine Gebühr, kein Pflichtpfad. `cwa_kontaktpruefung` prüft im fünften Akt die veröffentlichen Kontakte. Eine noch nicht persönlich bestätigte Vorladung führt zu der entsprechenden Person; nach ihren zusätzlichen Gesprächsknoten wird die Prüfung frei. Jede neue Veröffentlichung verwirft die zwischengespeicherte Prüfung, auch die im letzten Abgleich.

Die zerstörbaren Zusatzbelege sind getrennt von den vier Haupthinweisen. Gewalt gegen Bleisammler/Zusteller/Nullfundament setzt `cwa_beleg_verloren_1/2/3`. Die zugehörigen Abgleiche 1/3/6 verlangen dann eine zusätzliche kostenlose Herkunftsprüfung. Alle dafür benötigten Hinweise waren vorher zugänglich. Ein Bossverlust zerstört keine Quelle und legt kein Ende fest.

## Bossabläufe und Ersatzkerne

BH-Encounters, Phasen und deren `on_win`/`on_lose` bleiben unverändert. CC verwendet das tatsächlich vorhandene Effektfeld **`combat`**, nicht das im Auftrag unter Effekten genannte, vom aktuellen `GameState.applyEffects()` aber nicht ausgewertete `encounter`. Ebenso ist **`ending`** das vorhandene Feld für die ausdrückliche Endwahl. Das sind keine neu erfundenen Laufzeitfelder.

Die CC-Bossstation setzt nur eigene Abschnittsmarker. Nach Abbruch werden nur diese eigenen Marker zurückgesetzt; fremde BH-Flags werden nicht geschrieben. Für den Fortschritt müssen CC-Marker und der passende BH-Siegerzustand gemeinsam passen. Bei Wiederbeginn werden alte spätere Marker entfernt. Ein bloßes `won_<Grundboss>` genügt nicht als Gesamtsieg: nötig sind Phase 2 beziehungsweise Phase 3. CD muss Begegnungsverluste mit den vorhandenen BH-`on_lose`-Effekten zurücksetzen und die sicheren Rückwege nutzen. Die Prüfung simuliert diesen Zustandsvertrag, keine Angriffstiming-Balance.

Keine zweite unabhängig auslösbare BH-Story-/Friedensstation daneben platzieren. Die CC-Station enthält die kapitelbezogene Entscheidung, die BH-Kampfdaten bleiben ihre Quelle. Handelsreste und Ausrüstungsbeute aus BH können separat bleiben, dürfen nicht als Namensanker zählen. Die drei CC-Kernfächer verwenden ausschließlich existierende `sq_zutat_<pfad>_3/2/1`, den eigenen `requires_pathway` und `hide_if_items`, plus eigene einmalige Abholflags. Nach Verbrauch entsteht kein zweiter Kern. Bei `sq_waage`, `sq_moor`, `sq_uhr` tragen die Item-IDs korrekt keinen zweiten `sq_`-Teil. Keine neuen Formeln, Rituale, Pfade oder automatischen Stufenaufstiege.

`cwa_registerleib_rest` ist ein optionaler Nebenleitungsrest, kein vierter Hauptboss und keine Kampfversion Wetherbys. CD liefert seine Werte, Angriffssignale, Siegtext und verlustfreien Rückweg zur Werkstatt. Keines der vier Enden verlangt seinen Sieg. Grafik soll die vorhandene BI-Registerleib-Fassung wiederverwenden, nicht eine neue Wetherby-Kampffigur anfordern.

## Unterkunft, Bindung und Belohnungen

Die Werkstattdaten benötigen beim Einbau dieselben vorhandenen Bett-/Ofen-/Lager-/Fallwand-Funktionen wie frühere Unterschlüpfe. Der Dialog-Ofen füllt kostenlos Nerven, ohne Zeitfortschritt. Er ersetzt nicht die spätere Schlaf-/Lageranbindung. Misstrauen gegenüber Klammer sperrt den Unterschlupf nie.

Aktbelohnungen liegen in `quests.reward`, damit `finishQuest` sie nur einmal vergibt; bei allen außer Akt I unterdrückt `gives_money: 0` das automatische Standard-Questgeld. Akt V vergibt seine eigentliche Belohnung ausschließlich über das gewählte Ende. Amtserhalt und Ordnung haben `honor: 0`, keine Ehre aus den Deduktionen und den Amtsschlüssel statt Zeugensiegel. Evakuierung vergibt 45 Schilling Reisegeld. Das Stadtende gibt Zeugensiegel und Ehre.

**Aktuelle Bindungsgrenze:** `src/core/Bonds.js` zählt `bond` nur für registrierte Einzelgänger oder die beiden Gefährten Zunder und Pfiff. `cw_ida_bellcross` und `cw_crayford` sind dort noch nicht registriert. CC liefert die verlangten bestehenden `bond`-Effekte und eigene Vertrauensflags, schreibt aber keine neue Laufzeitlogik. Der Einbau muss diese beiden Vertrauensfiguren ergänzen oder eine ausdrücklich gleichwertige Bindungsanbindung herstellen. Numerische Bindungsänderungen sind bis dahin nicht als funktionierend zu behaupten. Die Story verlangt keinen Mindest-Bindungswert und blockiert deshalb nicht.

Das Rohrpostsiegel wird als Schlüssel nicht verbraucht. CD soll damit die zusätzlich beschrifteten Rohrpost-Lesestellen öffnen; Hauptbeweise vor seinem Erhalt bleiben erreichbar. Der Originalsatz wird beim Planwechsel nicht entnommen. Die Stelle IV.3 enthält nur den Herkunftsvergleich mit zehn vollständig lesbaren Pfadspalten, keine neuen Rezeptdaten. Die Autorenschaft der bisherigen Täter sowie offene Wexmoor-Folgen werden nicht umgeschrieben.

## Prüfumfang

`pruefen.mjs` liest JSONs, Flag-Erzeuger und bestehende `loadContent()`-Daten sowie BH/BJ/BL. Fehlende CD-Definitionen stehen in der Ausgabe separat; die dafür erzeugten Attrappen existieren ausschließlich im Prüfer und besitzen keine vorgetäuschten Spielwerte. 64 Abläufe prüfen alle Anreisen und Enden mit tatsächlichen Bedingungen/Effekten, beide Bosslösungen und beide Öffentlichkeitsvarianten. Weitere Randproben prüfen fehlende Anker, fehlende Zeugengruppen, Beute- und Belohnungswiederholung sowie Bossabbruch. Kartenbegehbarkeit, reale Spawns, Spielzeit und Kampfwerte bleiben Aufgabe des Einbaus.
