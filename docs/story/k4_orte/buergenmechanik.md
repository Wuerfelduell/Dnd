# Bürgen und Abgleich: Vertrag für CC und späteren Code

## Zustände und Unabhängigkeit

**Gefunden** bedeutet: ein nachvollziehbarer persönlicher Anker ist im Journal belegt. **Markiert** bedeutet: der Spieler hat eine Verbindung zwischen Zielort oder Person und mindestens zwei unabhängigen Quellen ausgewählt. **Verbraucht** bezeichnet nur die für eine konkrete Hauptaktion bestätigte Bindung, niemals das Löschen des Beweises. Zwei Abschriften desselben Lohnbuchs zählen als eine Quelle; Noels eigene Erinnerung und ein unabhängig geführtes Lieferbuch können zwei sein. Herkunft, Autor und Entstehungsanlass entscheiden, nicht unterschiedliche Inventar-IDs. Eine spätere Behauptung desselben Zeugen erzeugt keine zweite Quelle.

Höchstens drei Verbindungen sind gleichzeitig markiert, nicht drei einzelne Belegzettel. Ein Ort mit zwei Quellen benötigt einen Platz. Bei Platz vier wird nichts still verdrängt: Auswahl abbrechen oder ausdrücklich einen vorhandenen Platz lösen. Im Unterschlupf Buchbinderei ist das Umsetzen kostenlos. Außerhalb bleibt die bestehende Auswahl bis zur Rückkehr bestehen; kein Nervenpreis wird erfunden. Verbrauchte Aktionsbindungen sind revisionsfest, gefundene Quellen dürfen eine spätere, ausdrücklich neue Hauptaktion erneut sichern.

## Datenvertrag mit CC `abgleiche.json`

Die Datei lag beim Erstellen dieses Pakets noch nicht vor. Folgende Begriffe sind ein vorgeschlagener Vertrag, **kein erfundenes Laufzeit-JSON**: stabile Abgleich-ID; beschriftete auslösende Hauptaktion; Voraussetzungen des Aktes; betroffene Karten und Straßenabschnitte; gefährdete Kontakt-IDs; Zielverbindungen mit mindestens zwei unabhängigen Quellgruppen; letzte sichere Kreuzung; Erfolgsfortsetzung; Fehlschlagfortsetzung; öffentlich/vertraulich-Flagpaar; Verbrauchsbeleg je Aktion. CC bestätigt die konkreten Namen und liefert die Quellenherkunft. Die Brücke besteht aus den unten genannten Dialogen und Rückgabeflags, nicht aus einer zweiteiligen Kopie der Handlung.

Nur ausdrücklich beschriftete Hauptaktionen lösen einen Abgleich aus. Keine Uhr, kein Schlafen, kein Kartenschritt, keine Lesestelle, keine Nebenquest und kein Öffnen der Vorschau darf eine Verbindung verbrauchen oder einen Kontakt löschen. Vor Bestätigung erneut Voraussetzungen prüfen, dann Markierungen und Ergebnis atomar speichern. Laden oder doppeltes Koop-Klicken wiederholt weder Nervenverlust noch Belohnung. Bei Änderungen seit der Vorschau neu bestätigen lassen.

## Sichtbarkeit und Rücksetzung

WorldScene zeigt betroffene Straßen als gestrichelte Kachelfläche und Text „gefährdet“ oder „gesichert“. Über Kontakten steht zusätzlich ein lesbares Symbol mit Name und Status. Die Vorschau nennt beispielsweise „Röhrenhof → Sortierhalle; Bramwell Hesk gefährdet; zwei unabhängige Quellen vorhanden“. Farbe ist nur Ergänzung. Journalbegriffe bleiben immer Gefunden, Markiert, Verbraucht, Gesichert und Gefährdet. Tastatur und Koop verwenden dieselbe geordnete Zielliste.

Bei Fehlschlag Rückkehr zur letzten sicheren Kreuzung, standardmäßig Buchbinderei [2,11], und fünf Nerven Verlust. Hinweise, Quelltexte, Questbelohnungen und Inventar bleiben erhalten. Ein gefährdeter Kontakt wird durch einen persönlichen Anker wieder zugänglich, niemals durch Zahlung, Sieg oder bloßen Zeitablauf. Die Rettungsquelle muss vorab erreichbar bleiben, etwa Noels persönliche Erinnerung in der Küche. Kontaktrücksetzung darf keinen für den Wiederaufbau benötigten Zeugen unzugänglich machen. Der sichere Fußweg zwischen allen Terrassen wird nie überschrieben; Overlays betreffen Abkürzungen und Kontaktzugänge.

Öffentlich und vertraulich schließen einander aus: Setzen des einen löscht das andere in derselben Transaktion. Öffentlich macht die Zeugenschaft im Viertel sichtbar, vertraulich bewahrt nur den benannten Zugang; die genauen Ruf- und Endfolgen gehören CC. Kein Modus gilt als automatisch moralisch richtig.

## Fallback ohne neue Engine

`cwo_buergenprobe` ist eine vollständige Übung mit lokalen Quellen und Flags. Die zwei Lesestellen in Buchbinderei und Setzergasse setzen nur Gefunden, nie einen Abgleich. Ein Quellenpaar vormerken, Vorschau, ausdrücklich bestätigen, Gegenprobe ohne Markierung und kostenlose Rücknahme sind vorhandene Dialogknoten.

Die fünf Dialoge `cwo_abgleich_1` bis `_5` sind Hauptaktions-Brücken. Jeder prüft zwei CC-Anker über `requires_flags`, bietet Vorschau, Abbruch, öffentlichen/vertraulichen Erfolg und ausdrücklich bestätigten Fehlschlag. Der einfache Fallback hält bewusst nur **eine** Verbindung gleichzeitig vor, bleibt also unter dem Limit drei. Er ist kein Ersatz für die vollständige Mehrwege-Engine. Die Werkstatt löscht alle fünf vorbereiteten Markierungen kostenlos. CC hängt seine jeweilige Hauptaktionsfortsetzung hinter das eigene `cwo_abgleich_N_verbraucht` und das Modusflag; CD setzt keine `cwa_*`-Flags. CC darf seine Aktabschlüsse nicht zusätzlich an eine nicht vorhandene Vouch-Engine binden. Abgleich V bestätigt die getrennte Liste, wählt aber keines der vier Enden.

| Dialog / Ort | Vorgeschlagene CC-Quellen (Präfix jeweils cwa_anker_) | Ergebnis für CC |
|---|---|---|
| cwo_abgleich_1 / Gepäckhalle | gleisfuss_vera + gleisfuss_hesk | cwo_abgleich_1_verbraucht |
| cwo_abgleich_2 / Sortierhalle | sortierhalle_fahrplan + sortierhalle_empfaenger | cwo_abgleich_2_verbraucht |
| cwo_abgleich_3 / Archivsaal | kronenarchiv_gehalt + kronenarchiv_malliver | cwo_abgleich_3_verbraucht |
| cwo_abgleich_4 / Küche | witwenterrasse_noel + witwenterrasse_nachbar | cwo_abgleich_4_verbraucht |
| cwo_abgleich_5 / Druckkammer | nullfundament_register + nullfundament_haushalt | cwo_abgleich_5_verbraucht |

Diese zehn Anker sind offene CC-Vertragsnamen, keine im Paket angeblich auffindbaren Beweise. Der Prüfer meldet sie ausdrücklich als extern. CC ersetzt abweichende Namen vor Einbau in beiden Dateien. Die Hauptaktionen müssen mit komplettem CC-Paket einen reinen Dialog-Durchlauf ermöglichen, auch wenn die Klasse aus dem Grundgerüst nie geladen wird.

## Abnahme für die spätere Engine

1. Zwei Kopien derselben Quelle sichern nichts; zwei unabhängige Quellen sichern genau ein Ziel.
2. Drei Verbindungen passen, die vierte verlangt eine Entscheidung. Vorschau und Abbruch ändern keinen Zustand.
3. Lesen, Schlafen und Seitenquests lösen auch bei langer Spielzeit keinen Abgleich aus.
4. Fehlschlag kostet einmal fünf Nerven, wahrt Hinweise und freien Rückweg; persönlicher Rettungsanker stellt Kontakt wieder her.
5. Öffentlich und vertraulich sind nie zugleich gesetzt. Koop bestätigt dieselbe atomare Aktion nur einmal.
6. Alle fünf CC-Akte und vier Enden bleiben mit den Dialog-Brücken ohne Vouch-Code abschließbar.
