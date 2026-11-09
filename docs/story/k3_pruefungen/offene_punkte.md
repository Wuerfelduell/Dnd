# Integration und Grenzen

## Verbindliche Fremdverträge

AU setzt keine AR-/AS-Flags und definiert keine fremde Karte oder Hauptbosswerte. `k3_weichenstellerin` ist die ausdrücklich vereinbarte Ausnahme vom eigenen ID-Präfix. `kapitel3` ist der gemeinsame Fallkontext, kein neuer AU-Fall.

| Lieferung | Eigentümer | Benötigte IDs / Wirkung |
|---|---|---|
| Sichtbarkeit | AR | `k3a_akt2_done`, danach Hedda dauerhaft zugänglich |
| Kapitelabschluss | AR | `kapitel3_done` bei allen vier Enden |
| Karten | AS | `ds_schwellenring`, `ds_kalkmarkt`, `ds_lohnbuero`, `ds_teesaal`, `ds_pruefhaus`, `ds_runddepot`, `ds_bruchstufen`, `ds_endbahnhof`, `ds_signalhang`, `ds_speisewagen`; sichere Rückkehr `ds_speisewagen/default` |
| Zutatenquellen | AS | `schwellenhund`, `vorhauer`, `vielrufer`, `unterschicht`; genaue Zuordnung in `zutaten_herkunft.json` |
| Grafiken | AW / AX | Hedda / zehn Prüfungsbosse nach den festen IDs, siehe Wunschliste |

Koordinaten sind konkrete Platzierungsvorschläge. AS muss sie gegen begehbare Tiles und andere Pakete prüfen, insbesondere die zehn kleinen Aktenplätze im Speisewagen. Keine neue Karte durch AU. Für Questziele gibt es jeweils ein tatsächlich geliefertes Objekt oder Hedda.

Die Quellenmatrix definiert `k3p_schwellenhund_friedlich`, `k3p_vorhauer_friedlich`, `k3p_vielrufer_friedlich`, `k3p_unterschicht_friedlich` sowie `k3p_uhrwerkwaechter_friedlich` als **noch anzubindende AU-Merker**. Der jeweilige Integrationsadapter setzt sie beim friedlichen Abschluss; sie sind keine erfundenen existierenden AR-Flags. Die Hauptbossdialoge bleiben bei AR/AS. Konkrete Gleichwertigkeit: Hund mit falschem Anfahrpfiff ablenken; Vorhauer die belegte Rettungsschlagfolge zurückgeben; Vielrufer Leitungen trennen; Unterschicht einen Herkunftsrahmen ohne Menschenopfer einsetzen und den lokalen Zugriff begrenzen. Letzteres ist ein Vorschlag an AS, kein kanonischer Sieg über die gesamte Macht unter den Städten. Uhrwerkwächter: mit Wartungsprotokoll den Antrieb stillsetzen, ohne neue Schuld oder Fraktionsentscheidung zu verlangen.

## Herkunft und Ersatzbeschaffung

55 Einträge, jeweils exakt eine Primärquelle. Für 9 und 8 der neuen Pfade wählen wir Sabeth als feste Quelle statt AFs optionaler Auktion: ein Einstieg darf nicht an einem ausgelassenen Treffen hängen. Für 7 bleibt die einmalige Fundstelle `wx_vergessmoor`; für 6 der Uhrwerkwächter. Die vier alten AF-Namensreihen für 5/3/2/1 werden durch die verbindlichen Dunscar-Bosse ersetzt. Mengen immer 1, Chance immer 1, ausschließlich eigener Pfad. `requires_pathway` in der Herkunftstabelle ist gemäß Auftrag ein String, bei Engine-Bedingungen dagegen `[pfad, sequenz]`.

Achtung: Der aktuelle `src/data/sequenzen.js` verkauft neue Zutaten bei Nell und auf Treffen, einschließlich Seq 5. Diese Live-Angebote widersprechen der neuen exklusiven Herkunft. Beim Einbau alte Angebote 5 und höherer Macht entfernen und frühere Bestände nicht löschen. Sabeths neues festes Angebot für 9/8, Fundstelle 7 und garantierte Beute 6 müssen separat angeschlossen werden. Kein Einkaufsschema wird hier erfunden.

Prüfungszutat 4 wird nach Kampf **oder** friedlicher Lösung ausschließlich bei Hedda ausgezahlt. `on_win` setzt nur den gemeinsamen Bewältigungsmerker; dadurch kein doppeltes Loot. Geld und Questabschluss sind durch aktiven Auftrag plus Auszahlungssperre geschützt. Automatische Kampfverdauung bleibt eine bestehende Wirkung, die friedliche Handlung erhält dieselbe Kernzutat und Questbelohnung.

Ersatz nach verlorenem Trank: pro Spieler nur bei bereits bewältigter Quelle, noch nicht erreichter Zielstufe und fehlender Kernzutat sowie fehlendem Zieltrank sowohl im Inventar als auch im Lager. Eine sichere Wiederholungsprobe bei Hedda gibt nur eine Zutat, kein Geld, keine Ehre, keinen erneuten Questabschluss. Diese kombinierte Lager-/Sequenz-/Spielerprüfung kann der aktuelle Bedingungskatalog nicht darstellen, deshalb kein unsicherer Ersatzdialog in den Daten. Bei Seq 9 muss die Pfadauswahl vor dem Erstkauf möglich sein, obwohl noch kein Trank getrunken wurde. Quelle nachträglich beanspruchbar halten, falls der Hauptboss schon vor Erreichen der benötigten Sequenz bewältigt wurde.

## Voraussetzungen, die der Code noch nicht erfüllt

1. `src/core/GameState.js:meets` wertet **kein `requires_pathway`** aus, obwohl das Auftragsformat dieses Feld vorsieht. Die Klausel muss Pfadgleichheit und `pathway.seq <= grenze` prüfen, fehlender Pfad ist false. Sonst könnten alle Prüfungen angenommen werden. Gleiche Prüfung auf Interaktionen, Auszahlung und Queststart. Die Daten sind deshalb noch nicht als Live-Paket freigegeben.
2. `src/core/Pathways.js`: `SEQ_MAX` von 5 auf 1; `DIGEST_RATE` ergänzen um `{4:0.20,3:0.16,2:0.13,1:0.10}`. Seq 1 ist optional ausmeisterbar, keine Seq 0.
3. AF rechnet `SEQ_GROWTH_STEPS` mit 5→1 Schritt, 4/3/2/1→2/2/3/3, kumuliert 9/11/14/17. Der aktuelle Code hat bei 5 **3** Schritte! Um AFs LP-/Nerven-Tabelle exakt zu übernehmen, wäre `{7:2,6:2,5:1,4:2,3:2,2:3,1:3}` nötig. Das senkt Bestandswerte um zwei Wachstumsschritte. Empfehlung: vorhandene Seq-5-Werte behalten und `{4:2,3:2,2:3,1:3}` ergänzen; dann kumuliert 11/13/16/19 und AF-Tabelle um zweimal Pfadwachstum korrigieren. Diese Entscheidung vor Live-Freigabe treffen, nicht still in einem Textpaket ändern.
4. `src/data/sequenzen.js`: auch `SEQ_HIGHEST` 5→1; bisherige `highSeqs` in aktive `pathways[pid].seqs` aller zehn Pfade und `highItems` in aktive Items übernehmen. Alle 40 Rituale darüber ersetzen. Formeln/Tränke für diese Stufen generieren und zugänglich machen. Höhere Stufen bleiben durch Vorstufe, Zutat und Ritual begrenzt.
5. Ehre-Schwellen laut AF: Seq 4/3/2/1 = 90/110/135/160, keine Kosten. Formelpreise als AF-Vorschlag 180/260/380/560 Schilling, einmaliger Kauf. Das sind neue höhere Formeln, keine Preisänderung der bisherigen 9–5-Formeln. Seq-Feld `honor` wird bisher nicht selbst ausgewertet; Händlerzugang muss `requires_honor` verwenden.
6. `performRitual` prüft in `requires` derzeit nur `requires_flags` und `min_wins` über `ritualSteps`. AU verwendet darin nur Flags. Pfad und unmittelbare Vorstufe ergeben sich aus `ritualDef`; Trank und Verbrauch prüft das bestehende Ritualsystem. Braurezept verbraucht die Kernzutat einmal; das Ritual verbraucht zusätzlich nur Nebeltau und Silberstaub. Technische `ritual_<pfad>_<seq>`-Flags produziert der Code, nicht AU. Seq 1 verlangt zusätzlich `kapitel3_done` und die eigene Vorbereitungsentscheidung.
7. Volle Verdauung senkt im Bestand nur das Risiko, verhindert verfrühtes Trinken nicht. AFs gewünschte harte Voraussetzung „Vorstufe zu 100 % verdaut“ muss für 4–1 explizit vor Trankverbrauch geprüft werden. Keine Garantie gefahrlosen Trinkens behaupten: aktuell bleiben mindestens 3 % Grundrisiko plus Unruhe.
8. Koop: Questflags sind gemeinsam, Ritualflags für Spieler 2 tragen `p2_`. Pro-Spieler-Anspruch, Lagerprüfung und Ritualquestabschluss müssen bei Integration personalisiert werden, auch bei identischen Pfaden. Die gelieferten Standarddaten beschreiben zunächst den Solo-Ablauf. Keine zweite Belohnung einfach global freischalten.

## Enden und Rückwege

Keine Probe verlangt die Rettung eines bestimmten Wexmoor-NPCs, einen getöteten Menschen oder ein bestimmtes Kapitelende. Alle Seq-3-Rituale haben `ds_speisewagen` als erreichbare Alternative für unzugängliches Wexmoor. Abschriften und gesicherte Modelle sind lokal verfügbar und benötigen keine früher gefundenen Nebenquestgegenstände. Beim Echo muss die gerettete lokale Prüfwalze außerhalb der zerstörbaren Hauptanlage liegen. Nach Stilllegung keine neue Stimme aus der abgeschalteten Anlage erzeugen.

Auch nach „Die Schicht ist vollzählig“ müssen Hedda, der geschützte Speisewagen, das Lohnbüro als abgeschalteter Übungsraum und die Unterschicht zugänglich bleiben. Keine automatische Vergebung oder Befreiung der Stadt durch ein Ritual. AS/AR müssen die sicheren Wege und den Superbosszugang nach allen vier Enden gewährleisten. AU setzt weder Enden zurück noch verbraucht es Namenstäfelchen, private Namensantworten oder Rufladungen.

## Kampfwerte und Freigabe

170–220 Roh-HP, 10–14 Schaden je Ring, zwei Ringe und ein angekündigter Einzelhit gemäß AF-Korridor für Zugang Seq 5. Nicht vorher mit Solo-Faktor 1,4 multiplizieren. Es werden keine unverfügbaren Phasen-, Immunitäts- oder Resonanzfelder erfunden. Reihenfolge: Doppelschlag, pfadspezifische Sonderaktion, langsamer Einzelhit. Keine automatische Heilung, die eine unendliche Schleife erzeugt.

| Prüfung | Schwäche / spielbarer Unterschied |
|---|---|
| Lampengutachter | Verhüllung fordert präzise Treffer; normale mechanische Lampe statt automatischem Okkult-Schadensvorteil. |
| Gegenzeugenknüpfer | Nervendruck zwischen weit getrennten Treffern; Kontrolle allein ersetzt keinen Abschluss. Niedrige HP helfen dem schwächeren Direktschaden. |
| Garderobenpfänder | Schutz macht kleine Verwirrungstreffer ineffizient; den eigenen Angriff statt nur fremder Rollen einsetzen. Niedrigster HP-Wert. |
| Pausenfischer | Größere Nervenverluste; Drain ersetzt keine ruhige Verteidigung, langsame Zweierfolge erlaubt Erholung. |
| Chargenprüfer | Deckelschutz schwächt kurze Direktschäden; Brand auslaufen lassen statt ständig neu auftragen. |
| Brückenpresser | Höhere HP und langsame schwere Last; Schild und Angriff sinnvoll abwechseln statt bloß Kraft stapeln. |
| Zollriegel | Verhüllung und engerer erster Takt; präzise bzw. sichere Treffer vor blindem Hinterhalt. |
| Fristpfänder | Größter Schutzwert; Pfandschild ohne gezielten Schaden verlängert nur die Auseinandersetzung. |
| Schichtsammler | Nervendruck umgeht den Vorteil bloßer Lebensheilung; zwei deutlich getrennte Ringzeiten. |
| Gangaufseher | Weit auseinanderliegende Doppelschläge und lange Schlussverzögerung; Vorhersage darf den zweiten Schlag nicht überspringen. |

Die Gegner sind Prüfautomaten bzw. begrenzte Prüfanordnungen, keine zu tötenden Schichtgänger. `boss` wird bewusst nicht gesetzt: Bestands-Bossrüstung und zufällige Zusatzschläge würden AFs einfachen Einstiegskorridor verändern. Die Bezeichnung Prüfungsboss ist die erzählerische Rolle. `sprite`/`sheet` werden durch AX bei Integration zugeordnet; Platzhalter stehen nur in der Grafikwunschliste.

AF nennt Duo-Schaden ×1,15, der aktuelle `Combat.js` verwendet jedoch `DUO_DMG_MULT = 0.85`. Maßgeblich für eine Live-Abnahme ist der dann aktuelle Code. Noch kein Nachweis fairer Kämpfe: alle zehn Pfade Solo/Duo, 50/70/90 % Verteidigung, mit/ohne Artefakte prüfen. Kontrollketten aus Seq 6 bleiben ein bekanntes Problem. Erst nach Entscheidung über Kontrollresistenz und Wiederholungsansprüche live aktivieren. Sechs AF-Artefakte bleiben separate optionale Aufgaben; AU macht sie weder obligatorisch noch überschreibt es fremde Belohnungen.
