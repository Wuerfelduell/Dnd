# Einbauvertrag und offene Punkte

Dieses Paket ist ein **Inhaltsentwurf, noch nicht eingebunden**. Die folgenden Ergänzungen sind vor Aktivierung der Koop-Aufträge nötig. Die JSON-Dateien benutzen vorhandene Quest-, Dialog- und Interactable-Felder sowie das im Prompt vorgegebene Geplauderformat. Es werden keine neuen Engine-Felder eingeführt.

## Aktivität und Stimme

- `koop_aktiv` ist die einzige absichtlich extern erzeugte Flag-Ausnahme. Aus `hasP2()` ableiten: bei `addP2`, `removeP2`, Spielstandladen und Wechsel des Spielstands synchronisieren. Ein gespeichertes Flag darf niemals eine inaktive zweite Person vortäuschen.
- AH muss die gewählte Erscheinung `p2a` oder `p2b` liefern. Für `geplauder.json` wird `a` bzw. `b` gewählt, für `kampf.json` `p2a` bzw. `p2b`. Auswahl und optionaler Name fehlen derzeit im Party-Datensatz. Nicht über erfundene Datenfelder oder zusätzliche Flags dieses Pakets simulieren. Bis eine Auswahl existiert, diese Inhalte nicht aktivieren.
- NPC-Zusätze enthalten nur Äußerungen der bestehenden Figur und Antworten von p1. Sie passen zu beiden Varianten; keine p2-Stimme ist dort stillschweigend auf p2a festgelegt. Die Questdialoge erzählen gemeinsame Handlungen ohne zugeschriebene p2-Rede.
- Keine neuen Gegenstände: Alle drei Prämien gehen in den gemeinsamen Geldbeutel. `items.json` und `encounters.json` bleiben bewusst leer. Eine nur von Spieler 2 nutzbare Ausrüstung müsste Empfänger, Benutzbarkeit und Weitergabe gesondert prüfen; darauf baut dieses Paket nicht.

## Geplauder und Kampfsprüche

Geplauder wird nach Kartenbeitritt aus aktuell erfüllten Bedingungen gewählt, nie während Dialog, Kampf, Verfolgung, Verhaftung oder Hauptszene. Beide müssen aktiv, bei Bewusstsein und auf derselben Karte sein. Maximal ein Gespräch je Eintritt, 90 Sekunden globale Pause, jede ID einmal pro gemeinsamem Spielstand. Nicht bei jedem Beitritt von p2 alle alten Gespräche nachspielen. Fortschrittsabhängige Zeilen bevorzugen. Auswahl und Gelesen-Zustand separat speichern, keine neuen Triggerfelder in diese JSONs schreiben.

Es gibt 40 Gespräche auf 40 verschiedenen Kettlegate-Karten und 40 auf allen 18 Wexmoor-Karten. Der aktuelle Inhalt besitzt **41** Kettlegate-Karten einschließlich der drei Zirkelräume. Genau 40 Gespräche mit jeweils einer `map` können nicht alle 41 abdecken. Bewusst ausgelassen ist `treffen_russ`, damit sämtliche normalen Karten und Innenräume abgedeckt sind. Bei späterer Erweiterung dort ein zusätzliches Gespräch ergänzen, nicht eine fremde Karten-ID erfinden. Wexmoor-Zeilen enden mit `kapitel2_done`; spätere Fassungen hängen von den vier unterschiedlichen Enden ab.

`kampf.json` ist ein Textkatalog, keine Engine-Konfiguration. Seine neun `koop_`-Schlüssel bezeichnen die Anlässe aus dem Auftrag. Je Anlass 10 p2a-, 10 p2b- und 5 p1-Texte. Die tatsächlichen Kampfereignisse müssen daran gebunden werden:

| Anlass | Auslöser und Sprecher |
|---|---|
| `koop_kampfbeginn` | Normaler Kampfbeginn; ein beteiligter Spieler spricht. |
| `koop_bossbeginn` | Bossbeginn; ersetzt den normalen Beginnspruch. Bossklassifikation am Kampf feststellen. |
| `koop_partner_ko` | Nur beim Übergang des anderen Spielers von stehend zu K.o.; stehende Person spricht. |
| `koop_partner_aufgestellt` | Erst nach tatsächlich erfolgreichem Wiederaufstellen des anderen; kein Heil- oder Aufsteh-Effekt durch Text. |
| `koop_parade` | Nach tatsächlich gelungener Parade, nur der abwehrende Spieler. |
| `koop_kombi` | Nach tatsächlich ausgelöstem gemeinsamen Angriff, nie nur beim Drücken einer Taste. |
| `koop_sieg` | Gewonnener Kampf, reguläre Lebensreserve. |
| `koop_knapper_sieg` | Ersetzt Sieg, wenn ein aktiver Spieler höchstens 25 % Leben hat oder K.o. ist; nur ein stehender Sprecher. |
| `koop_flucht` | Nach erfolgreichem Rückzug, nicht bei gescheitertem Fluchtversuch. |

Nur eine Zeile pro Ereignis. K.o.-Warnung hat Vorrang vor Parade oder Kombi, Bossbeginn vor Normalbeginn, knapper Sieg vor Sieg. Vier Sekunden Sprechpause, Varianten ohne unmittelbare Wiederholung. Ruhende oder ausgeblendete Spieler sprechen nicht. Keine englische Anzeige der Anlass-IDs.

## Dialogzusätze erreichen

Das bestehende Zusatzformat hängt `choices_add` an `nodes.start`. Einige Figuren starten später dauerhaft anders. Beim Einbau die folgenden zusätzlichen **bestehenden** Einstiegsknoten um dieselben Koop-Choices ergänzen, ohne die Knoten umzuschreiben oder neue Belohnungen einzubauen:

- Pimm: `return` und `returned` können den Start verdrängen. Nach Abschluss ihrer zwingenden Rückgabe beziehungsweise im erreichten normalen Menü den Zusatz anbieten.
- Greta: `after` nach Fall 1. Quill: `done` nach seinem Auftrag.
- **Marlowe: `nodes.start` existiert nicht; das reguläre Menü heißt `hub`.** Der bisherige `applyQuestPack`-Loader würde bei diesem Zusatz mit einem Zugriff auf `start.choices` abbrechen. Beim Einbau explizit an `hub` anhängen. Laufende Briefings/Epiloge erst zu Ende bringen, keinen Hauptdialog unterbrechen. Das ist zusätzlich zur räumlichen Logik ein konkreter Einbaublocker, kein fehlerhafter neuer Dialogknoten.
- Holt bleibt bei Suspendierung unsichtbar; Elsbeths Zweig nur vor `k2_rowe_frei`, Hale nur dort, wo sie tatsächlich steht. Die Ergänzung darf keine Figur herbeirufen oder ihren bestehenden Sichtbarkeitsfilter umgehen.

Die im JSON gesetzten Sichtbarkeitsbedingungen bleiben zusätzlich erhalten. Bei Austritt Dialogschritte mit Koop-Handlung abbrechen, Choices neu auswerten. Normale Solo-Gespräche bleiben verfügbar.

## Gemeinsame Regeln für die drei räumlichen Aufgaben

**Blocker:** Das normale Lesen eines Objekts ist kein Nachweis für Spielerzuordnung oder Gleichzeitigkeit. Dieses Paket darf nicht allein durch `applyQuestPack` spielbar geschaltet werden. Ein räumlicher Adapter muss die sechs Rollenobjekte und die rollengebundenen Folgeschritte übernehmen.

| Auftrag | Nur Spieler 1 | Nur Spieler 2 | Erfolg |
|---|---|---|---|
| `koop_zwei_schluessel` | `koop_zwei_schluessel_p1`, westliches Schloss | `koop_zwei_schluessel_p2`, nördliches Schloss | Beide halten ihre Schlüssel; Gravur bekannt; gemeinsame Drehung. |
| `koop_ablenkung` | `koop_ablenkung_p1`, Gespräch beim Posten | `koop_ablenkung_p2`, Kontorzugang und Fachdialog | Gespräch läuft, zweite Person steht unentdeckt im Zugang, Ankerfach wird gewählt. |
| `koop_spiegelbild` | `koop_spiegelbild_p1`, westliche Marke, linkes Rad, Hinweis der zweiten Runde | `koop_spiegelbild_p2`, östliche Marke, rechtes Rad, Hinweis der ersten Runde | Zwei aufeinanderfolgende Runden mit gleichzeitig belegten Standplätzen. |

Die `effects.sets_flags` an den Rollenobjekten sind **nur nach erfolgreicher Prüfung** auszuführen. Ein Akteur darf nicht das Rollenflag des anderen setzen. Radiusvorschlag: höchstens 1,5 Kacheln um den jeweiligen Standplatz, ohne Hindernis dazwischen. Positionen in `platzierung.json` sind Vorschläge auf vorhandenen Karten; im späteren Spieltest Kollision, Erreichbarkeit und Kamerabreite überprüfen. Das nördliche Archivschloss und die westliche Schlossstelle liegen an unterschiedlichen Wänden des Archivbereichs.

Die `_p1`/`_p2`-Flags sind flüchtige Belegungen, keine gelesenen Sammelhinweise. Kontinuierlich löschen bei Weggehen, Loslassen/Abbruch, K.o., Kampf, Kartenwechsel, Verhaftung oder Austritt. Auch beim Laden zuerst alle sechs Flags löschen und anhand tatsächlicher Belegung neu aufbauen. Keine `done_flag` auf den Rollenobjekten. Ein nacheinander bedienter Schalter hinterlässt damit keinen gültigen Zustand.

Beide Rollen müssen beim Bestätigen jeder Erfolgschoice nochmals gleichzeitig gültig sein, auch wenn ein Dialog die Welt pausiert. Anwesenheit nicht bloß beim Öffnen des Dialogs prüfen. Die zwei Schlüssel werden für die Erfolgsbestätigung synchron betätigt; das Lesefenster eines Schlosses darf nicht den zweiten Spieler dauerhaft blockieren. Interaktionen auf derselben Kachel werden rollen- und phasenabhängig angeboten, ohne Auswahlüberlagerung.

Abgeschlossene Fortschritte wie `_offen`, `_beleg_gesichert` und `_runde1` bleiben erhalten; nur laufende Belegungen verfallen. Ein Spieler kann daher nach einem Austritt später erneut dazukommen. Solo ist kein neuer Rätselerfolg und keine Auszahlung möglich. Die gewöhnlichen Ausgänge bleiben immer benutzbar.

## Besondere Umsetzung der Ablenkung

Verwende den bestehenden namenlosen Marktposten, **nicht Hale**. Der sichtbare Wachposten-Dekor beim Salzmarkt `[20,5]` und die Streife `gasse` müssen bei der Inszenierung eindeutig zusammengeführt werden. Keine neue NPC-ID vortäuschen. Das seitliche Kontor wird über den vorhandenen Fassadenbereich bei `[21,2]` als kleine Interaktion vom Vorplatz aus dargestellt; keine zusätzliche Karte und kein erfundener Innenraumwechsel.

Während der gehaltenen Ablenkung blickt nur diese Streife auf p1s Lieferzeichnung. Andere Streifen und ihre Sichtkegel bleiben wirksam. Die Lieferfrage darf p1 keine allgemeine Fahndungsimmunität verleihen; der gezielt beschäftigte Posten behandelt nur dieses unauffällige Gespräch als toleriert. Bei Entdeckung, Bewegung weg vom Posten oder Abbruch beide Rollenflags löschen, Fachdialog schließen, Ausgangszustand wiederherstellen. Kein automatischer Kampf gegen die Polizei, keine Fahndungserhöhung allein durch das Scheitern dieses Auftrags. Die normale Polizeiverfolgung bleibt eine separate Spielregel. Beide können erneut versuchen. Nach erfolgreicher Abschrift ist nur die Abgabe offen, keine zweite Abschrift nötig.

Die Aussage „Doppelzahlung“ betrifft ausschließlich den lokalen Marktbeleg und beschuldigt weder das Lichtamt noch eine bestimmte Person. Sie ersetzt keinen Hauptstoryhinweis.

## Spiegelrätsel: Information tatsächlich austauschen

Runde 1: p1 steht westlich, p2 östlich. Nur p2 darf `koop_spiegelbild_blick_p2` lesen. Das linke Rad zeigt p1 drei Zeichen, aber keine Lösung; p2 sagt „erloschene Laterne“. Nur p1 bedient `koop_spiegelbild_rad_p1`.

Runde 2: Nach richtiger Wahl werden beide Belegungen gelöscht, `_runde1` bleibt. Beide bestätigen erneut ihren Platz. Nur p1 liest `koop_spiegelbild_blick_p1` und sagt „zwei offene Schlaufen“. Nur p2 bedient `koop_spiegelbild_rad_p2`. Falsche Wahlen kosten nichts, löschen aber beide Belegungen; die bisher richtige Runde bleibt bestehen.

Lokaler Koop teilt einen Bildschirm. Für die zwei Hinweise daher eine kurze, klar mit „Nur Spieler 1/2 liest“ beschriftete Übergabeanzeige vorsehen, die andere Person schaut kurz weg. Der Adapter darf die vorübergehenden Lösungshinweise nicht vor Lösung der betreffenden Runde im gemeinsamen Journal offenlegen; `gives_clues` zunächst puffern und erst nach erfolgreicher Runde freigeben. Für die Auswahl genügt das rollengebunden gesetzte `_hinweis1`/`_hinweis2`-Flag. Nach Erfolg sind die Hinweise als Erinnerung für beide im Journal verfügbar. So verrät die gemeinsame Fallansicht nicht schon den nächsten Schritt. Ohne diese Übergabe wäre es ein gemeinsames Bildschirmrätsel, aber keine getrennte Wahrnehmung.

Die Seitenrahmen sind ein kleines, intakt gebliebenes Wartungsgerät. Sie stellen keine in Fall 6 zerstörten Hauptspiegel wieder her und benötigen weder Mews noch zurückgekehrte Schatten. Das funktioniert nach jedem Fall-6-Ende. Die Wahl `koop_spiegelbild_verdeckt`/`koop_spiegelbild_bewahrt` bestimmt künftig die Darstellung der **neuen Seitenrahmen**, nicht die bestehenden Spiegel.

## Einmaligkeit und Abnahme im Spiel

Alle Belohnungsknoten schließen die jeweilige Quest ab. Das bestehende Questfeld `reward: {gives_money: 0}` unterdrückt die automatische Nebenquest-Prämie von aktuell 12 Schilling. Die Knotenbeträge sind damit die vollständigen Grundprämien; globale Beutemodifikatoren bleiben wirksam. `honor: 2` ist ein Rohwert und wird durch die aktuelle globale Ansehensregel skaliert, nicht als garantierte zwei sichtbare Rangpunkte versprochen. Start-Routing auf den Quittungsknoten und `requires_quests_active` verhindern erneute Auszahlung über normale Choices. Beim Einbau Effekte/Questabschluss/Geldänderung gemeinsam ausführen und einen bereits bestätigten UI-Klick nicht erneut verarbeiten. Objekte nach Abschluss ausblenden oder in ihrer Quittungsfassung anzeigen.

Vor Freischaltung manuell prüfen: beide Stimmen; Einstieg nach allen relevanten Fällen/Akten; beide Reihenfolgen des Beitritts; falscher Akteur an jeder Rolle; allein nacheinander bediente Stellen; zweiter Spieler geht während offener Choice; Speichern mit belegtem Schalter und Laden solo; K.o.; Festnahme; wiederholter Klick auf Belohnung; zwei Spiegel-Fehlversuche; sämtliche Endvarianten und beide Geldentscheidungen. Das Paketprüfskript prüft Daten und Referenzen, **nicht** diese noch fehlende Laufzeitlogik.
