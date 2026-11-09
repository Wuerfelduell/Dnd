# AF: Adapter und neue Mechaniken

## Erforderlich zum Einbau

**Stufenbereich und Metadaten.** `SEQ_MAX` ist heute 5. Für diesen Entwurf muss der zulässige Bereich bis 1 reichen. Zusätzlich sind alle Schleifen, Freischaltlisten, Anzeigen, Speicherprüfungen und Formelerzeugungen zu prüfen, die 5 als Grenze festhalten. `growth_steps` soll die pauschale Tabelle überschreiben, sonst gelten die vorhandenen Werte. `digest_rate` soll den vorhandenen Tabelleneintrag überschreiben, sonst gilt der Bestand. Beispiel: Laterne Seq 4 besitzt 9 Wachstumsschritte und ohne Ausrüstung 93 LP sowie 154 Nerven. Ohne Adapter würde die Engine nur 8 Schritte zählen. Der Analysesimulator überschreibt die Berechnung ausschließlich im Arbeitsspeicher.

**Ansehen der Formeln.** `honor` einer Sequenz wird bisher nicht als automatischer Kaufzugang gelesen. Den Wert in die vorhandene Händlerbedingung `requires_honor` übertragen, zusätzlich den Pfad und die vorherige Stufe prüfen. Beispiel: Laterne Seq 4 benötigt 90 Ansehen, den Abschluss beider Kapitel und den abgeschlossenen Kernzutatenauftrag. Die Formel muss nach Kauf dauerhaft bleiben. Datenkompatibel: vorhandene Händler-Einträge mit `requires_pathway` und `requires_honor`; ihre spätere Platzierung ist nicht Teil dieser Datenlieferung.

**Karten und körperliche Veränderung.** `neu:` ist nur ein erlaubter Entwurfsmarker und darf nicht als Laufzeit-Karten-ID geladen werden. `veraenderung` braucht eine UI-Anzeige oder bleibt ausschließlich Erzähltext in `desc`. Alle Wirkungen der gelieferten Fertigkeiten funktionieren bereits über vorhandene Felder; es wird kein unsichtbarer Beschwörungs-, Zeit- oder Mehrzielzustand vorausgesetzt.

**Präfix der generierten IDs.** Die manuell gelieferten Pfad-, Item- und Artefakt-IDs verwenden `sq_`; Skill-IDs sind nach Vorgabe ohne Zwangspräfix eindeutig. Bestehende Pfad-IDs bleiben unverändert. Der Bestand erzeugt dagegen `trank_<pfad>_<seq>`, `formel_<pfad>_<seq>` und `ritual_<pfad>_<seq>`. Das sind bestehende technische Konventionen, keine in AF frei vergebenen IDs. Vor einer erzwungenen Umbenennung alle Produzenten, Ritualabfragen und Spielstandmigrationen gemeinsam ändern. In den Ritualobjekten kein neues `id`-Feld erfinden.

**Nachteil `unruhe_tick`.** `artifactUnruhe()` kehrt bei null getragenen Artefakten sofort mit 0 zurück. Ein reiner Pfadpassiv `unruhe_tick` hätte daher ohne Artefakt keine Wirkung. AF setzt Seq-4-Nachteile über Preis, Ansehensverlust, Nervenmaximum, Geistsichtkosten oder Nervenerholung um. Das Torfsiegel darf `unruhe_tick` benutzen, weil es selbst ein getragenes Artefakt ist. Ein genereller Pfad-Unruheadapter wäre eine separate Änderung, keine Voraussetzung dieses Entwurfs.

## Option: Widerstand gegen Kontrollketten

Problem: Die vorhandene Seq-6-Fertigkeit Fangnetz kostet 2 Konzentration und betäubt. Alte Skills bleiben auch auf Seq 1 verfügbar. Mehr Bossleben löst das nicht. Auch Verwirrung und automatisches Ausweichen können lange fehlerfreie Ketten ermöglichen.

Vorschlag zur Erprobung: Nach einem durch `stun` oder `confuse` verhinderten Bosszug ist der nächste tatsächlich ausgeführte Bosszug immun gegen beide Effekte. Eine blockierte Anwendung verursacht weiterhin ihren Schaden und ihre sonstigen Wirkungen, legt aber keinen verzögerten Kontrollstatus an. Die Immunität endet erst nach einem wirklich ausgeführten Zug, nicht nach einer ausgesetzten Runde. Beispiel: Fangnetz blockiert Zug 1; eine erneute Kontrolle vor Zug 2 wird sichtbar abgewehrt; nach ausgeführtem Zug 2 ist Kontrolle wieder möglich. Ein neues Zustandsfeld und eine UI-Meldung wären nötig.

**Gelieferte Fassung:** unveränderte `stun`-/`confuse`-Felder, keine erfundene Resistenz in JSON. Die Regel ist nicht implementiert. Neue Waage-, Moor- und Uhrskills verzichten vollständig auf Betäubung und Verwirrung. Heilung und Schild bleiben unabhängig davon zu testen.

## Option: Redlicher Handel und eindeutige Funde

Waage verwendet die vorhandenen Ereignisse `trade`, `loot`, `fact_refuted`, `side_quest`. Der Aufruf `trade` unterscheidet nicht zwischen sinnvollem Geschäft und beliebigem Hin-und-her-Verkauf. Vorschlag: Verdauung pro Händler und Gegenstandsart nur einmal je realem Bestandswechsel beziehungsweise einmal je Auftrag, dazu ein Höchstwert von 12 unskalierten Trade-Punkten pro Händler und Kapitel. Ein Wechsel der Karte setzt dieses Budget nicht zurück. Beispiel: Zwei verschiedene eingelöste Pfänder geben je 6, zehn erneute Käufe desselben Pfands geben 0. Ledgerzustand und verlässliche Transaktions-IDs wären neu.

Uhr verwendet `parry`, `fact_refuted`, `conclusion`, `quest`. Paraden in Übungskämpfen zählen bereits nicht. Vorschlag für weitere sichere Gegner: höchstens 12 unskalierte Parade-Punkte pro Encounter-ID und Besuch, gedeckelt auf 24 pro Encounter-ID und Kapitel, unabhängig von Flucht. Beispiel: Drei Paraden geben 12, weitere Paraden im selben Besuch 0. Moor braucht keine Geistsicht-Zeitfarm: Es erhält nur Ereignisse für neue verborgene Spuren, bestätigte Aussagen und abgeschlossene Aufgaben. Wiederholtes Lesen derselben Spur darf kein neues Ereignis sein.

**Gelieferte Fassung:** ausschließlich `DIGEST_LABELS`-Schlüssel. Keine fiktiven Schlüssel für Schuldenerlass, Zeitsprünge oder Namensgedächtnis. Ein Kapitelbudget ist nicht in den Daten umgesetzt. Bis dahin Farmrisiko offen kommunizieren; den Pfad nicht über extrem niedrige Raten unspielbar machen.

## Option: Spezifische Ermittlung ohne automatische Lösung

Waage könnte zwei Zahlungen samt Beleg gegenüberstellen, Moor Fundort und Fundschicht anzeigen, Uhr zwei Zeitangaben auf einer einfachen Reihenfolgekarte markieren. Regel: Die Anzeige nennt nur bereits erworbene Hinweise; sie erzeugt keine Wahrheit und keine Schlussfolgerung ohne Beleg. Beispiel Uhr: Ein belegtes „vor dem Glockenschlag“ und ein belegtes „nach der Abfahrt“ lassen sich nebeneinanderlegen, obwohl beide Zeitpunkte unbekannt bleiben. Eine solche Anzeige braucht UI und neue Darstellungsmetadaten.

**Gelieferte Fassung:** vorhandene Verdauungsereignisse und Passiven, etwa `conclusion_honor` oder günstigere `vision_cost`. Keine Wirkung, die ohne neue UI eine verborgene Tatsache enthüllt.

## Option: Wiederbeschaffung der Aufstiegszutaten

Die bestehenden Bedingungen prüfen Inventar, aber eine allgemeine gemeinsame Bedingung aus Inventar, allen Lagern, Zieltrank und erreichtem Rang fehlt. Vorschlag: Eine wiederholbare Probe wird nur angeboten, wenn die erste Bossaufgabe erledigt, die Zielsequenz unerreicht und Kernzutat sowie Zieltrank nirgendwo vorhanden sind. Wiederholung liefert genau ein Kernstück, keine Schilling und kein Ansehen. Beispiel: Nach verlorener Seq-2-Phiole erhältst du den Kern über dieselbe nun sichere Probe zurück; eine im Büro gelagerte Phiole sperrt die Ersatzprobe.

**Gelieferte Fassung:** normale Zutaten, `ingredients`, `consumes` und vorhandene Ritualbedingungen. Keine automatische Ersatzvergabe oder neue Bedingung in JSON. Umsetzung ist vor Einbau nötig, damit ein verlorener Trank keine Questreihe dauerhaft beendet.

## Nicht geplant

Kein Zurückspulen von Spielständen, keine Zeitstopp-Runden, keine Beschwörungsarmee und kein Flächenschaden. Die Uhr liest den nächsten Takt, Moor bewahrt Spuren und die Waage trägt Forderungen. Die Erzählung verspricht keine Fähigkeiten, die in den Fertigkeitsdaten fehlen.
