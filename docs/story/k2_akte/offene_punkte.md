# AP · Übergabe für den Einbau

## 1. Standardpaket und Eigentum

Die acht Standarddateien nach dem bekannten Muster als `k2_akte` einlesen. Nur neue AP-Daten ergänzen; `dialog_zusaetze.json` über `choices_add` und `nodes_add` einfügen. Keine bestehende Figur neu definieren. `wxn_krabbe` ist die vom gemeinsamen Vertrag vorgegebene Ausnahme. Es gibt keine Abhängigkeit von Flags aus AL, AM, AN, AO oder AQ; auch AB-Flags werden nicht gelesen oder gesetzt.

Die drei neuen AM-Orte und die Täfelchengilde werden nicht vorausgesetzt. Die Fährte zur Kellerordnung nutzt einen öffentlichen Außenbeleg in der Oberstadt, nicht das von AM geschriebene Archiv im Lichtamt. AO soll die vorhandene AP-Definition von Krabbe mit Grafik versorgen, nicht einen zweiten NPC anlegen.

## 2. Akt V bewusst separat integrieren

`akt5_neu.json` ist ein vollständiger Ersatzvorschlag im Pack-Format. Seine neuen Dialoge und Platzierungen gehören zusammen mit dem Quest-Ersatz in denselben Integrationsschritt. Das Standardpaket allein verlängert die Hauptquest noch nicht.

| Alter Schritt | Neue Position | Unverändert übernommener Inhalt |
|---|---|---|
| 1 · Fahr zum Leuchtturm | 2 | Text, `k2_am_turm`, Ziel `wx_leuchtturm/exit` |
| 2 · Bezwinge das Leuchtfeuer | 6 | Text und `won_leuchtfeuer` |
| 3 · Stell Ilse Brandt | 7 | Text und `kapitel2_done` |

Neue Position 1: Boot am Hafen, Polizeikontrolle, Wetterfenster. Position 3: trockener Kellergang. Position 4: Gegengewichtsklappe. Position 5: flüsternde Treppe und Zunders Abschied. Damit gibt es sieben Journal-Schritte und drei räumliche Stationen innerhalb des Turms.

**Die Questliste erzwingt noch keine Reihenfolge im Raum.** `applyQuestPack` ergänzt Objekte, kann aber vorhandene Reiseeinträge, Roamer oder NPC-Bedingungen nicht per Patch ersetzen. Deshalb sind beim Einbau folgende gezielten Änderungen notwendig; hierfür werden keine erfundenen Felder geliefert:

1. Den bisherigen Direkteinstieg der Turmzone für einen frischen Akt V zunächst zum neuen Hafenobjekt `k2v_inselboot` führen. Nach `k2v_boot_bereit` darf die bekannte Wiederholungsreise verfügbar sein. Die direkte Reise aus dem Überfahrtdialog zum vorhandenen `default`-Spawn muss funktionieren. Die bestehende Ankunftsleseszene bleibt alleinige Quelle von `k2_am_turm`.
2. `wx_leuchtturm`: den oberen Fortschritt an `k2v_keller_passiert`, danach `k2v_aufstieg_passiert`, danach `k2v_abschied_done` binden. Das kann mit sichtbaren lokalen Sperren oder einem gesperrten Zugang zum oberen Lauf geschehen. Keine neue Karte nötig. Nicht nur die Journalzeilen prüfen.
3. Den existierenden Boss-Roamer `leuchtfeuer` erst nach `k2v_abschied_done` freigeben. Kein zweiter Boss, keine geänderten Kampfwerte, kein weiteres `won_`-Flag.
4. Brandts vorhandenen Auftritt weiterhin an `won_leuchtfeuer` binden; bei Nutzung der verlängerten Fassung zusätzlich an den erledigten Abschied. Die **sechs Choices in `brandt.nodes.wofuer` und sämtliche Enden selbst bleiben identisch**. Auch die beiden alternativen Gerichtswege und beide Bedingungen für die Meerflucht bleiben erhalten.
5. Zunders alte Information `zunder.nodes.akt5` verweist auf die direkte Stadtkarte. Beim Einbau den Reisehinweis redaktionell auf Bracks Hafensteg ändern, ohne seine Bedingungen oder die übrigen Knoten zu verändern. AP liefert diesen Hinweis hier, weil `nodes_add` keine bestehenden Knoten ersetzen darf.

Die neuen Pflichtflags sind monotone Fortschrittsflags. Nach Niederlage, Rückkehr zur Stadt oder erneutem Laden wird keine erledigte Szene wieder bezahlt oder belastet. Die Wiederholungsüberfahrt ist kostenlos. Wer die Nothilfe kennt, sie aber im Keller bewusst liegen lässt, bekommt sie später nicht nochmals angeboten. Die Handlösung der Winde funktioniert auch ohne Bonus und ohne Mindestnerven.

## 3. Alte Spielstände und Postgame

Bei einem Spielstand mit bereits besiegtem Leuchtfeuer oder beendetem Kapitel keine neue Pflicht vor die vorhandene Entscheidung bzw. den Postgame-Zugang setzen. Empfohlen: die vier neuen Pflichtfortschritte für solche alten Spielstände als übersprungen behandeln, **ohne** Belohnungen oder `k2v_zunder_vertraut` nachträglich zu vergeben. Diese Migration gehört in den Einbau, nicht in Story-JSON.

Bei schon erreichter Insel, aber noch nicht besiegtem Boss, eine Rückfahrt zum neuen Hafenstart anbieten. Das vorhandene `k2_am_turm` bleibt erhalten. Bei einem neuen Spielstand den direkten Zonenzugang tatsächlich sperren, damit die Überfahrt nicht übersprungen wird.

Die kanonischen Endtexte erlauben weiterhin Wexmoor im Postgame. Die neuen Epiloge sind erzählte Nachblicke, keine physische Teleportation von Figuren. Besonders `k2_meer` darf nicht durch diese Texte den vorhandenen freien Nachspielzugang verlieren.

## 4. Verpasste Fährten im Journal

Die zehn Fährten sind aktgebunden. Alle Quellen und Abschlüsse sind innerhalb ihres Aktes erreichbar; nach dessen Abschluss können bestehende Türen wie Akademie und Lucents Haus gesperrt sein. Aktwechsel sollen eine begonnene, offene Fährte **als verpasst archivieren**, nicht erfolgreich abschließen und nicht mit einem Bonus belohnen.

Das vorgegebene Paketformat bietet hierfür keinen zugesicherten Archivierungszustand. Daher setzt AP weder fremde Aktflags noch ein neues erfundenes Questfeld. Vor dem Einbau eine der vorhandenen Journal-Lösungen verwenden oder am Aktabschluss einen klaren Hinweis auf offene Fährten zeigen. Der Spieler muss trotzdem jederzeit die Hauptgeschichte fortsetzen dürfen. Abbrechen eines Gesprächs zahlt nichts aus.

Krabbe ist davon ausgenommen: Sein Sack enthält in späteren Akten sämtliche noch nicht erworbenen früheren Stücke. Seine fünf Inspect-Schritte bleiben erreichbar, auch wenn er erstmals vor dem Finale angesprochen wird.

## 5. Epilog-Ausgabe und Momentaufnahme

`epiloge.json` nach dem gewählten bestehenden Ende auswerten. Kriterien: passendes `ending`, alle `requires_flags`, keines der `hide_if_flags`; Dateireihenfolge beibehalten. Es entstehen genau sechs Szenen. Die Zahlen im Titel erlauben die Prüfung der Alternativen ohne ein zusätzliches Schemafeld.

Der vorhandene Loader kennt keine Epilogfolge. Benötigt wird eine einmalige Anzeige unmittelbar nach dem bisherigen Kapitelabschluss. Alle Filter aus einem gemeinsamen Zustand zu diesem Zeitpunkt auswerten; beim Blättern keine laufende Neubewertung. Ein separates Anzeige-/Wiedergabemerkmal darf beim Einbau außerhalb dieser Story-Daten verwaltet werden. Epilogszenen vergeben keine Gegenstände, Fahndung oder Beziehungswerte.

`k2v_zunder_vertraut` ist eine dokumentierte Momentaufnahme aus dem letzten Turmgespräch, nicht der aktuelle Bindungswert. Sie entsteht nur bei mindestens 3 Bindung zu Zunder. Wenn dieses Gespräch im alten Spielstand fehlt, greift die sachliche Variante. Die Fenn-Variante des Gesprächs schließt `k2_s_fenn` nicht ab und verdoppelt dessen Belohnung nicht.

Die Gerichtsvariante setzt durch die unveränderten Endbedingungen Hale voraus. Die Daten enthalten auch defensiv formulierte Texte für unvollständige importierte Flagzustände, ohne solche Zustände spielerisch freizuschalten. Der bestehende Endtext erwähnt Starling auch beim Ratsbuchweg; diese schon vorhandene Textabweichung wird hier nicht durch eine Änderung des Endes behoben.

## 6. Platzierung und Darstellung

Alle 49 Koordinaten sind auf vorhandenen Karten reserviert: 40 Quellen, fünf Krabbe-Auftritte, vier Pflichtszenen. Quellen sind mit `kind: read`, Titel und Prompt erreichbar; lesbare Requisiten können beim Einbau ein vorhandenes Papier-/Akten-Sprite erhalten. Sie verlangen keine neue Grafik.

Vor Freigabe in Phaser kontrollieren: Wege vom Spawn, Reichweite der Dekoration, Polizeikegel, UI-Marker und Boss-Aggro. Krabbe bleibt in Akt II am landseitigen Einstieg des Salzwatts, nicht bei der Glockenmutter. Seine Akt-V-Position bleibt hinter dem Hafenpoller. Keller und Treppe liegen weiterhin in einer Gefahrenzone; das ist keine kostenlose Rastschleife.

AO erhält Krabbes Grafikauftrag bereits unter `wxn_krabbe`. Die fünf Item-Icons und die vorhandenen Ersatzbilder sind in [grafikwuensche.md](grafikwuensche.md) aufgeführt. Ein konkretes Grafik-Mapping gehört in den späteren Asset-Einbau, niemals als `platzhalter`-Feld in Spieldaten.

## 7. Empfohlener Spieltest nach Einbau

Ein Durchlauf ohne jede AP-Fährte muss alle sieben Pflichtschritte erreichen. Danach die Überfahrt mit und ohne Hale, beide Wetterentscheidungen, beide Keller-/Windenwege, Fenn gefunden/nicht gefunden und Zunderbindung unter/ab 3 prüfen. An allen drei Turmstationen zurückreisen, speichern und laden; Fortschritt und Einmaligkeit müssen erhalten bleiben.

Beide Gerichtswege, Löschen, Lichtmeister und beide Meer-Choices mit ihren bisherigen Bedingungen durchspielen. Krabbe erstmals in Akt V ohne Geld und Brot ansprechen und alle fünf Stücke über Arbeit erhalten. Beide Namensentscheidungen und den ausgelassenen Abschluss in allen vier Epilogen ansehen.
