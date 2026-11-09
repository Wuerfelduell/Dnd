# Paket AB: Nebenaufträge in Wexmoor

**Status: vollständiger Inhaltsentwurf zur späteren Integration.** Keine Datei unter `src/`, `public/` oder `tests/` wird durch dieses Paket geändert. Maßgeblich ist `docs/art/codex_AB_nebenquests_wexmoor.md`, geprüft gegen `main` mit Commit `b33de4505d8bf242650babb4f6b57c7242f827cc`.

Enthalten sind zehn Aufträge, 22 alternative Abschlüsse, vier neue NPC-Datensätze, 61 Dialogknoten, 21 Leseszenen, vier Deduktionen, fünf Gegenstände und sechs Ausbauvorschläge. Es gibt keine neuen Kämpfe; `encounters.json` ist bewusst leer. Das Vergessmoor und Salzwatt behalten ihre bestehenden Gefahren, die Versunkene Altstadt bekommt keine Platzierung.

## Aufträge

| ID | Startfenster | Ausgangsort | Abschlussbelohnungen | Entscheidung |
|---|---|---|---|---|
| `k2n_reetdach` | Akt I aktiv | Torfstich | Nachbarin: 18 Schilling, +3 Ehre; Kahn: 12 Schilling, Reetmatten | Wem gehören die trockenen Matten? |
| `k2n_salzwaage` | Akt I/II, nach Zunder-Kontakt | Salzmarkt | Öffentlich: 35 Schilling, +3 Ehre; vertraulich: 25 Schilling, +1 Ehre, Vorratskiste | Verantwortung öffentlich benennen oder stille Nachbesserung |
| `k2n_bojenlied` | Akt II aktiv | Bojenhafen | Hafen: 24 Schilling, +1 Ehre, Kahn-Glocke; Familien: 30 Schilling, +3 Ehre | Öffentliches Lied oder private Abschriften |
| `k2n_falsches_gesicht` | Akt II aktiv | Oberstadt | Einziehen: 16 Schilling, Fahndung −1 als Einbauauftrag; Helfer: +2 Ehre, 1 Moortee, einmalig später 12 Schilling/+5 Nerven | Sofortige Entlastung oder Verbündeter |
| `k2n_kuestengift` | Akt III aktiv, Akademierobe angelegt und im Inventar | Akademie / Salzwatt | Offen: 45 Schilling, +4 Ehre; vertraulich: 30 Schilling, +1 Ehre, Waschtisch | Fehler öffentlich dokumentieren oder Wyle vertraulich informieren |
| `k2n_pfandzettel` | Akt III aktiv | Gasthaus Glocke | Verwahren: +3 Ehre, 2 Salzbrote; verkaufen: 48 Schilling | Alte Bürokassette aufheben oder Verkauf erlauben |
| `k2n_schleusenwaerter` | Akt III/IV | Güterbahnhof | Melden: 22 Schilling, +2 Ehre; decken: 3 Salzbrote, +2 Ehre, Einladung; Anteil: 65 Schilling, −2 Ehre, Fahndung mindestens 2 | Melden, decken oder mitverdienen |
| `k2n_moorkind` | Akt IV aktiv | Pfahldorf / Vergessmoor | Belegte Lösung: 45 Schilling, +4 Ehre, 2 Moortee; frühes Ende: 20 Schilling, +1 Ehre | Namen offen oder privat bewahren; alternativ vorläufiger Rufname |
| `k2n_zunders_liste` | Nach `k2_zunder_free`, vor Kapitelende | Torfkahn / drei Viertel | Immer Ofen; Hilfskasse: +3 Zunder-Bindung, +2 Ehre; Lohn: +2 Bindung, 12 Schilling | Hilfskasse oder persönlicher Lohn; je Lieferung Verkleidung, Bote oder Hinterweg |
| `k2n_letztes_licht` | Akt V aktiv, vor Finale | Salzwatt vor der Leuchtturminsel | Immer `k2n_zweiter_weg`; teilen: 20 Schilling, +3 Ehre, Kartentisch; hüten: 45 Schilling, +1 Ehre | Plan später teilen oder verborgen halten |

### 1. Das Dach ohne Morgen

Ein Reetdecker im Torfstich findet morgens seine sorgfältig gebundenen Halme im Wasser wieder. Die leere Kerbe am Balken und Sedges Täfelchen-Brauch führen zur Wiederherstellung des Hausnamens, ohne dafür einen Menschennamen zu opfern. Nach dem geglückten Ritual entscheidest du, ob die übrigen Reetmatten eine Nachbarin oder den Kahn wärmen.

### 2. Was vom Gewicht bleibt

Adas Eichgewichte werden leichter, und sowohl Hesper als auch Brack hatten Zugang. Ein Kontrollgewicht, die lösliche Salzfüllung, beide Aussagen und ein Reparaturzettel ergeben eine belegbare Erklärung für Bracks fahrlässige Rückgabe. Du entscheidest über die öffentliche Namensnennung, während Sperrung der Gewichte und Erstattung an die Käufer in beiden Enden erfolgen.

### 3. Das Lied vom freien Platz

Ole Tamsen erkennt drei wiederkehrende Takte, die Brack mit dir untersuchen möchte. Du unternimmst drei kurze, vollständig erzählte Ruderfahrten und liest danach das zusammengesetzte Heimkehrlied. Seine erste Weitergabe gilt entweder dem ganzen Hafen oder den Familien, die noch immer auf jemanden warten.

### 4. Das absichtlich falsche Gesicht

Der zivile Zeichner Nils Feder verändert absichtlich die neue Oberstadtauflage, während der vorhandene Bahnhofssteckbrief unverändert bleibt. Ein Trauerbild belegt, dass er das Gesicht seines zu Unrecht festgenommenen Bruders kopiert und damit heute Lebenden Zeit verschafft. Du kannst die fehlerhafte Auflage einziehen lassen oder Nils als diskreten Helfer behalten.

### 5. Was Jorin nach Hause folgt

Jorin Siel fürchtet einen nächtlichen Verfolger seit seinen Versuchen mit Moorwasser. In Akademierobe vergleichst du eine saubere Uferprobe mit seinem Laborabfall und erkennst den unbeachteten Einfluss des zugesetzten Linsensalzes. Du sicherst die gefährlichen Proben in jedem Fall, entscheidest aber über die öffentliche Dokumentation seines Fehlers.

### 6. Post für ein geschlossenes Büro

Ein Pfandzettel in der Glocke trägt dein altes Büro-Siegel. Hesper identifiziert den Bahnpostschaffner als Überbringer, und Ivys Brief erklärt die Verwahrung einer zurückgelassenen Kassette, ohne einen bestimmten Ausgang von Kapitel 1 vorauszusetzen. Du kannst sie für später behalten oder Hespers Vorschuss gegen eine Verkaufserlaubnis annehmen.

### 7. Boote ohne Laternen

Druce verdient an unregistrierten Durchfahrten für die Lichtlosen. Nachtbuch und Frachtkiste unterscheiden Versorgungsschmuggel von den Sammelfahrten des Lichtamts. Du meldest die belegte Tat, schützt den Weg oder übernimmst selbst eine bezahlte Fahrt.

### 8. Der Name hinter den Zähnen

Ein Kind im Pfahldorf hat seinen Namen im Vergessmoor verloren. Ein erinnerter Ruf und eine gelbe Schlinge mit drei Knoten identifizieren Lin unter mehreren Täfelchen. Gemeinsam mit dem Kind entscheidest du über einen öffentlichen oder privaten Namen, während ein früher Abschluss mit selbst gewähltem Rufnamen weniger belohnt wird.

### 9. Drei Zeilen nach der Haft

Zunder möchte Hesper, Druce und Lamm nach ihrer Befreiung selbst bezahlen. Bei Fahndungsstufe 3 trägst du drei versiegelte Umschläge aus, wobei jede Lieferung eine passende Verkleidung, einen bezahlten Boten oder einen nervenaufreibenden Hinterweg erlaubt. Nach deiner Rückkehr bekommt der Kahn einen Ofen und du wählst zwischen Hilfskasse und eigenem Lohn.

### 10. Das letzte Dienstlicht

Oskar Rinn wartete den Turm vor Brandts Amtszeit und lebt heute verborgen im Salzwatt. Zwei noch vorhandene Wartungsmarken bestätigen seinen alten Weg zur Insel, ohne die Gefahren im Turm oder die Beweisführung gegen Brandt zu umgehen. Seine Abschrift erhältst du immer, während du über die spätere Weitergabe des Originals entscheidest.

## Daten einfügen

Die JSON-Dateien sind Datendefinitionen im bestehenden Format, kein automatischer Patch. `case.json` enthält `facts`, `clues` und eine `deductions`-Liste; wie im Bestand steht `case: "kapitel2"` auf Fakten und Deduktionen, während Hinweise ihren Fall über `fact` erben. Kahn-Ausbauobjekte und Platzierungsumschläge sind die ausdrücklich vorgegebenen Vorschlagsformate.

1. `quests`, neue `dialogues`, `npcs`, `items` und die Bestandteile von `case` unter ihren IDs ergänzen. Bestehende Definitionen nicht ersetzen.
2. In `dialog_zusaetze.json` die `nodes_add` in den gleichnamigen vorhandenen Dialog einfügen. `choices_add` in dessen **`nodes.start.choices` vor der Verabschiedung** einfügen: `sedge`, `hesper`, `brack`, `druce`, `pedell`, `zunder` verwenden alle diesen Hub. Die ursprünglichen `start`-Selektoren und Erstbegegnungen bleiben erhalten.
3. `platzierung.json` entpacken: `{map,npc,tile,visible_if}` wird in `maps[map].npcs` zu `{id:npc,tile,visible_if}`; `{map,interactable,tile,visible_if}` wird in `maps[map].interactables` zu `{...interactable,tile,visible_if}`. Der Umschlag selbst ist kein Engine-Feld.
4. Die sechs Ausbauten erst nach Umsetzung der in `offene_punkte.md` beschriebenen Wirkungen als spielwirksam bezeichnen. Die Freischaltflags kommen bereits aus den jeweiligen Abschlüssen.

Die vier neuen NPCs sind Ada Venn, Nils Feder, Jorin Siel und Oskar Rinn. Reetdecker und Kind sind kurze ortsgebundene Leseszenen mit wörtlicher Rede, keine zusätzlichen NPC-Datensätze oder Lauf-Sheets. Entscheidungen zu ihren Aufträgen werden bei der vorhandenen Mutter Sedge abgegeben.

## Entscheidungen und Persistenz

Alle neuen IDs beginnen mit `k2n_`, auch Knoten und Lesepunkte. Einziger Schreibzugriff auf ein bestehendes Fortschrittsflag ist die ausdrücklich vorgesehene Einladung `treffen_lichtlose`; sie wird niemals gelöscht. Die drei Lichtlosen-Enden setzen stattdessen getrennte Paketflags und ändern keine bestehenden Zirkelangebote oder Beziehungen.

Startangebote sind durch `hide_if_quests` einmalig und durch Aktbedingungen begrenzt. Laufende Aufträge dürfen nach dem Start weiter abgeschlossen werden; finale Zustände werden nicht zurückgesetzt. Alle Abschlussknoten enden das Gespräch und jeder Abgabe-Einstieg verlangt eine aktive Quest, wodurch Geld, Ehre, Items und Ausbauflags nicht wiederholt abgeholt werden können.

Die Leseszenen verwenden eigene `done_flag`-Werte. In der Reet-Szene teilen Auftrag und Ritual dieselbe Kachel, sind aber nie gleichzeitig sichtbar: Der Auftrag verschwindet beim Start, das Ritual erscheint erst nach Sedges Erklärung. Beim frühen Moorkind-Ende bedeuten die zwei Schrittflags „bearbeitet oder auf Wunsch beendet“, sie vergeben ausdrücklich keine gefundenen Hinweise und keine Deduktion.

## Prüfung

```sh
node docs/story/wx_nebenquests/pruefen.mjs
```

Der Prüfer lädt die JSON-Daten aus dem Repository, kontrolliert Referenzen, neue IDs, Dialogziele, Flag-Erzeuger, erreichbare Bodenkacheln und komplette Streifensegmente einschließlich des Rückwegs. Zusätzlich untersucht er den Zustandsraum jedes Auftrags mit null eigenem Startgeld, allen drei verfügbaren Verkleidungen und den passenden Aktfreischaltungen; getragen wird immer nur eine Verkleidung gleichzeitig. Alle 22 Enden müssen erreichbar sein, alle Schritte am Ende gelten und Abgaben dürfen nach Abschluss nicht erneut angeboten werden.

Das ist eine Daten- und Ablaufprüfung, kein Ingame-Test. Die Fahndungsabsenkung, Zunder-Bindung, neuen Grafiken und Kahn-Wirkungen bleiben die unten verlinkten Integrationsarbeiten.

- [Offene Einbaupunkte](offene_punkte.md)
- [Grafikwünsche und geprüfte Platzhalter](grafikwuensche.md)
- [Kahn-Ausbaubeschreibungen](kahn_ausbau.json)
