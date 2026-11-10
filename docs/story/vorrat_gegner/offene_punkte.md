# Offene Punkte und Einbauvertrag

## Liefergrenze

BH ist Vorrat, nicht ein Kapitel. Keine Änderung an aktiven Daten, kein Loader-Eintrag, keine Karte, kein erfundener Hauptquest und keine Fremdflagge. Die Geschichten 1/2 bleiben ihre eigenen Vorlagen; Dunscar wird nicht umgedeutet. Ihr alter Anschluss direkt an Wexmoor muss bei einer späteren Kapitel-4-Ausarbeitung neu eingeordnet werden.

Zählabweichung des Auftrags: 24 Normalgegner + 8 Bosse = 32 Trophäen. Die genannte Zahl 34 hat keine zwei zugehörigen IDs. BH liefert die feste Liste vollständig mit 32; BI/BM verwenden dieselbe Zuordnung. Folgephasen benutzen das Boss-Sheet und haben keine zusätzliche Trophäe.

## Datenformat und Abhängigkeiten

Die tatsächlich aktive Dunscar-Normalgegnerliste steht in `k3_orte/zones.json`; `k3_orte/encounters.json` ist leer. Begegnungen benutzen deshalb die realen Felder `hp`, `armor`, `attacks[].damage/hits/unparryable/nerves`, `roam`, `loot`, `chapter`. Keine erfundenen `power`, `defense`, `tells` oder gegnerischen Statusfelder. Konkrete Ausholbewegungen stehen im **angezeigten Angriffsnamen**, zusätzlich in `verhalten.md` und im Bestiarium. Die Bestiariumsfelder `titel`, `text`, `hinweis` entsprechen AT; Gerede und Zeitung sind kurze beschriftete Absätze in `text`, noch keine registrierten Zeitungsausgaben.

BL definiert die 26 referenzierten Materialien/Ausrüstungsstücke; BH definiert ausschließlich seine `vt_`-Trophäen. Vor Einbau alle BL-Definitionen laden und Referenzen prüfen, bevor ein Kampf oder Beutedialog erreichbar wird. `pruefen.mjs` validiert die IDs gegen die gemeinsame Tabelle in `docs/art/codex_BL_vorrat_items.md`. Falls BL schon lokal vorhanden ist, meldet er auch die Vollständigkeit der konkreten Definitionen. Ein gültiger ID-Vertrag ist kein Beweis für gelieferte Itemwerte. Inventar- und Artefaktwirkungen von BL sind hier nicht simuliert.

BI liefert Sheets unter `battle/enemy_<vg-ID>.png`; BH benutzt die passenden Schlüssel `enemy_<vg-ID>`. BM liefert die 32 Trophäen-Icons, BH benutzt dafür `vt_<Suffix>`. Diese noch nicht registrierten Grafikschlüssel müssen beim Einbau geladen werden. `grafikwuensche.md` fordert keine Änderungen an den festen Gestalten.

## Zonen und Elite

`zonen_vorschlag.json` enthält sieben vollständige Gebietsobjekte nach dem vorhandenen Format. `map`, `travel` und `lose_to` bleiben absichtlich weg, weil noch keine Karten existieren. Schlüssel `vg_zone_*` sind Gebietsentwürfe, keine Referenzen auf existierende Karten. Bei Übernahme echte sichere Rückkehrziele setzen, bevor die Gebiete erreichbar werden. Ohne `lose_to` würde die Kampfengine keinen Ortswechsel vornehmen; der Niederlagentext allein ist keine Rückreise.

Die eingebetteten Begegnungen sind identische Kopien von `encounters.json`/`bosses.json`; der Prüfer erkennt jede Abweichung. Beim Einbau entweder die Zonenmaterialisierung laden oder die Einzeltabellen gezielt übernehmen, **nicht beide blind registrieren**. Folgephasen zusätzlich aus `phasen.json` laden. Der Wildnisloader trennt `loot` von den Kampfdaten; normale Gegner entsprechend dieser vorhandenen Normalisierung einlesen.

`elite_hp: 1.4`, `elite_dmg: 1.2` und `elite_chance` folgen dem Stadtgegnervertrag. Der heutige Wildnisloader liest für die Werte stattdessen `elite.hp_mult`/`elite.dmg_mult`; die Normalgegner enthalten bereits dieselben Faktoren dort. Kartenadapter muss die angegebene Elite-Chance bei der Erzeugung berücksichtigen. Elitebeute wie im vorhandenen Wildnisloader: doppeltes Geld, gleiche Trophäe/Material, zusätzlicher lokaler Materialwurf. Nicht beide Multiplikatorpaare nacheinander anwenden.

Die Landstraße führt beide allgemeinen Bosse als **Alternativen** im Gegnerkatalog. Je Reise nur einen passenden Boss auswählen. Die sieben Zonen verlangen nicht acht feste Bossplätze; keine zweite unsichtbare Pflichtbegegnung anhängen.

## Bossketten, Zustände und Beute

`bosses.json` enthält Phase 1, `phasen.json` die Abschnitte `_phase2` bzw. `_phase3`. Jeder zugehörige `<boss-ID>_dialog` entscheidet beim erneuten Öffnen anhand der eigenen Flags, welcher Übergang verfügbar ist. Die Engine führt mehrere Begegnungen nicht automatisch hintereinander aus. Nach Sieg den zugehörigen Dialog erneut anbieten, Übergangstext sichtbar lassen, Fortsetzen ausdrücklich bestätigen lassen. Zwischenabschnitte heilen nicht und füllen keine Gegenstände nach.

Ein Zwischenabschnitt setzt `<boss-ID>_phaseN_done`; der letzte Abschnitt setzt `<boss-ID>_geloest`. Bei normalen Niederlagen löschen die vorhandenen `on_lose.clears_flags` bereits alle Abschnittsflags. Beim Abbruchdialog werden dieselben Flags gelöscht. **Flucht aus dem Kampf, Verlassen des Gebiets und Laden außerhalb des laufenden Versuchs** benötigen denselben Reset durch den späteren Adapter; `Combat` besitzt keinen allgemeinen `on_flee`-Effekt. Dabei niemals `_geloest`, `_beute`, Journalwissen oder gesicherte Beobachtungen entfernen. Ein abgeschlossener Boss bleibt abgeschlossen.

Jeder Boss hat genau einen Beuteanspruch: `<boss-ID>_geloest` erlaubt den Knoten `_bergung`, `_beute` sperrt die Ausgabe dauerhaft. Kampf und die drei friedlichen Lösungen setzen dieselbe Abschlussflagge. Alle Bossabschnitte haben leere automatische Beute; **die vollständige Bossbeute** liegt im einmaligen Ausgabeknoten: eine eigene Trophäe, ein passendes BL-Material, ein BL-Ausrüstungsstück oder Artefakt und 60 Schilling. Dadurch kann weder ein Zwischenabschnitt noch ein Wechsel vom friedlichen zum gewaltsamen Weg doppelt auszahlen.

Beim Einbau die Auswahl erneut prüfen und Auszahlung samt Flag atomar verarbeiten. Ein schon bestätigter UI-Klick darf nicht erneut den Ausgabeknoten ausführen. Vorher alle drei Items aufgelöst haben; bei fehlendem BL niemals erst die Flag setzen und dann an `addItem` scheitern. Die vorhandene Überlastlogik verliert keine Beute. Koop-Empfänger nach BG zuweisen, ohne zweite globale Beute zu erzeugen. Der Prüfer untersucht den Anspruch und seine Sperre; ohne BL-Definitionen führt er den externen Itemtransfer ausdrücklich nicht aus.

Die drei friedlichen Lösungen sind Bleisammler (Walzenführung blockieren), Blinder Zusteller (drei getrennte echte Empfangsbelege prüfen) und Glasgärtner (äußere Veredelungsfäden lösen). Alle notwendigen örtlichen Beobachtungen stehen bereits im jeweiligen Prüfzweig. Der spätere Karten-/Fallentwurf kann sie räumlich darstellen, darf aber keine bestimmte Sequenz oder ein altes Kapitelende zum Pflichtschlüssel machen. Der friedliche Weg gibt dieselbe Beute. Er löst noch keine Hauptstory-Deduktion und benutzt keine fremden Beweis-IDs.

Die anderen fünf Boss-Schwächen stehen als örtliche Eingriffsideen im Bestiarium und der Storyvorlage. Sie vergeben derzeit keine weiteren friedlichen Lösungseffekte. Das spätere Storypaket kann die belegten Eingriffe als eigene Ermittlungswege umsetzen. Bei Calderwick kann Kampf laut Vorlage einen zusätzlichen Komfortbeleg beschädigen; BH vergibt oder löscht keine noch gar nicht definierten Beweise. Haupthinweise und Schlusspläne dürfen nicht verschwinden.

## Verhalten, Benommenheit und Koop

Sicht-/Hörweiten, Tageszeiten und Gruppen sind Vorschläge in `verhalten.md`. Keine unbekannten Kartenfelder vortäuschen. Die vier Gegner mit Schwerpunkt „betaeubung“ besitzen aktuell normalen Schaden plus vier Nerven Schaden beim Treffer. Das ist ein Druck auf die Konzentration, **kein tatsächlich übersprungener Spielerzug**. Gegnerische Betäubung braucht eine ausdrücklich definierte Engine-Wirkung mit sichtbarer Vorwarnung und begrenzter Dauer. Das vorhandene `stun` betrifft Angriffe des Spielers gegen Gegner und wird nicht zweckentfremdet.

Ebenso fehlen die gezielte Wahl der schwächeren Koop-Person und das Aufteilen einer Darstellung. Bis zum separaten Einbau gilt der vorhandene Koop-Kampf: ein gemeinsamer Gegner, skalierte Lebenspunkte, Angriff auf jeden stehenden Spieler. Die Tabelle in `verhalten.md` beschreibt die sechs vorgesehenen Unterschiede und ihre Grenzen. Reine Prosa behauptet keine implementierte KI.

## Abnahme vor Aktivierung

1. Alle BL-Items und BI/BM-Grafiken registrieren; Zone-/Encounter-Doppelregistrierung verhindern.
2. Sichere Rückkehrziele, freie Eingangszonen und 40×30-Grundrisse begehen. Keine Hörlinie durch Wände, keine Gegner im geschützten Bügelraum.
3. Jede Bosskette gewinnen, verlieren, abbrechen und fliehen; speichern/neu laden. Keine erhaltene Zwischenphase nach Rückzug, keine kostenlose Heilung und keine doppelte Beute.
4. Jede friedliche Lösung, danach Kampfversuch und erneuter Beutedialog. Marktschreier ablehnen, prüfen, entlarven oder freiwillig bekämpfen; kein automatischer Geldabzug.
5. Alle vier vorgeschriebenen nicht tödlichen Animationen prüfen. Die Schlafkutsche schützt ihre Reisenden; der Wurzelgänger bleibt ein lebender Patient.
6. Kampf ohne Ton und bei reduzierter Bewegung: jedes Signal durch Text und Timingring verständlich. Bossphasen müssen trotz desselben Sheet-Schlüssels sichtbar unterscheidbar sein.
7. Referenzbalance zusätzlich mit anderen Pfaden, Koop und späterer BL-Ausrüstung spielen. Die 150 Simulationen belegen das dokumentierte Eisen-Szenario, keine universelle Balancegarantie.
