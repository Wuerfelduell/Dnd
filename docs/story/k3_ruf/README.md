# BN — Rufextras für Dunscar

Reine Logik und Daten, ohne Phaser. Seit dem Einbau im Spiel registriert (Stand siehe
`offene_punkte.md`). Die spätere Darstellung kann die BA-Regionen direkt
anhand von `form`, `tiles`, `routeTiles`, `safeTiles` und `listeners` wählen.

## Lieferung und Aufruf

- `src/core/SignalRoutes.js`: `signalRouteMethods` sowie freie Hilfsfunktionen
  `projectSignal`, `hearingListeners`, `isSignalWalkable`, `hearingOf`.
- `stationen.json`: sechs AS-Stationen, geprüfte Kacheln und zwölf AR-Muster je Station.
- `klang_zuordnung.json`: zwölf eindeutige AY-Ruf/Hall-Paare, AX-Symbolindizes,
  acht UI-Klangzuordnungen. Die beiden fehlenden Bindungsklänge sind ausdrücklich `null`.
- `bindungen.json`: persönliche, nicht stapelnde Bindungen; nur neue `k3r_`-Wissensflags.
- `texte.json`: deutsche Oberflächentexte mit höchstens 140 Zeichen pro Eintrag.

Daten als `{ stationen, klang_zuordnung, bindungen, texte }` in
`content.signalRoutes` ablegen oder `state.configureSignalRoutes(data, context)`
aufrufen. `Object.assign(GameState.prototype, signalRouteMethods)` ergänzt die
Methoden. Nach `resetSignal()` folgt `resetSignalRoutes()`; beim Laden nach
`loadSignal(data)` dann `loadSignalRoutes(data)`. Die Integration steht konkret
in [offene_punkte.md](offene_punkte.md).

## Ablauf eines Rufs

1. Muster durch `applySignalRoutes({learn_pattern: id})` lernen. Bereits besessene
   AR-Quellenhinweise zählen ebenfalls; Laden migriert sie in `learnedPatterns`.
2. `listen(stationId)` liefert kostenfreie, flaggefilterte Hinweise ohne Effekte.
3. `previewCall(stationId, patternId, dir)` liefert Kosten, Linien, hörende
   Gegner und Warnung, ohne Mutation oder Ladungsverbrauch. `dir` ist
   `north|east|south|west`. Auch Fehler liefern Text/Form und verfügbare Geometrie.
4. Nur nach Bestätigung führt die autoritative Instanz `confirmCall(commandId,
   stationId, patternId, dir)` aus. `handled: true` bedeutet neu durchgeführt;
   `false` bedeutet abgelehnt oder bereits verarbeitet. IDs sind nichtleere Strings
   bis 160 Zeichen. Eine ID gilt gemeinsam für Ruf und private Antwort.
5. Ausschließlich `applySignal({signal:'call'})` zieht genau eine Ladung ab.
   Routen, Flags, Alarm und Befehls-ID sind vor dessen synchronem Ereignis gesetzt.
   Ein erneut eintretender Eventhandler kann denselben Befehl nicht doppelt abbuchen.
6. Ergebnis darstellen: Weg (`route`), örtliche Bestätigung (`answer`), bekannte
   falsche Haltestelle (`fallback`) oder vermeidbare Suchzone (`alarm`).
   Der Fehler kostet maximal fünf Nerven, niemals Inventar, Geld oder Wissen.
   Fallback setzt `pendingTravel` wie vorhandene Dialogreisen; Ui führt ihn aus.
   Alarm startet keinen Kampf. Auch ein korrekter Ruf kann einen Alarm mitliefern.

Alle Karten bleiben unverändert; ein bestätigter Nachhallweg öffnet weder
Kollisionen noch AR-Abkürzungsflags. Die fünf vorhandenen AS-Vorbereitungsflags
bleiben erhalten, Bosslösung und Belohnungen werden nicht vorweggenommen.

## Geometrie und Laufzeitkontext

Die Autorenkorridore enthalten die Stationskachel als erstes Element. Jeder weitere
Schritt hat Manhattan-Abstand eins. `rangeTiles` begrenzt **Schritte**, nicht die
Anzahl inklusive Ursprung. Zunächst gilt ausschließlich die gewählte Richtung;
bei blockiertem Korridor bleibt die Vorschau ein Präfix. Die Bestätigung ist dann
gesperrt, kostet nichts und enthüllt keinen Weg hinter der Wand.

Ohne Autorenkorridor läuft `projectSignal` geradeaus und biegt nur an einem
zweifelsfreien einzelnen Knick ab; keine Flächensuche als angebliche Linienroute.
`isSignalWalkable` versteht eine 2D-Kollisionsmatrix (0/false frei) und die aktuellen
Dunscar-Bodenzeichen `.sgw`. Andere Zeichen bleiben gesperrt. Das ersetzt keine
Laufzeitprüfung von beweglichen Blockern.

`signalRouteContext` wird nicht gespeichert:

| Feld | Vertrag |
|---|---|
| `isWalkable(mapId,x,y)` | Zusätzliche aktuelle Kollision, inklusive Blocker. |
| `listeners(mapId)` | Aktuelle Instanzen `{id,encounter,tile,alive}`; `[]` bedeutet keine lebenden Gegner. |
| `closedLocks` | Liste `{map,tile,closed}`; gesperrte Kacheln stoppen Projektion und Hörwege. |
| `insideLock` | Boolean oder Funktion `(speaker)=>boolean`, vom Szenenadapter aktualisiert. |

Ohne Listeneradapter dienen die Karten-Roamer als deterministische Startpositionen;
keine unsichtbaren Gegner werden erfunden. Hörweite folgt begehbaren vier-Nachbar-
Pfaden bis zum artspezifischen Radius. Nischen werden aus Alarmflächen entfernt;
Lauscher in Nischen reagieren nicht. Alarmziele sind gehörte Kacheln, nie die
aktuelle Spielerposition. Der Speisewagen ist stets bindungssicher.

## Persönliche Namensantwort

`offerPrivateAnswer(stationId,speaker)` liefert die ausdrückliche Warnung und legt
ein flüchtiges Angebot für den gerade handelnden Sprecher an. Erst
`acceptPrivateAnswer(commandId,stationId,speaker)` bindet ihn; ohne Angebot wird
abgelehnt. `cancelPrivateAnswer(speaker)` beim Schließen/Abbrechen und Kartenwechsel
aufrufen. Laden und Schleuseneintritt löschen alle offenen Angebote.

`bindings` bleibt im **gemeinsamen** `signal`, nach Sprecher 1/2 getrennt; niemals
in `Party.PERSONAL` aufnehmen. Aktionen für Spieler 2 über `withPlayer(2,fn)`
ausführen. `bindingPassive(speaker)` gibt eine frische Liste von `{key,value}`
zurück: `unruhe_tick: +1`, `max_nerves: -5`. Der Partner bleibt unverändert.
`requires_binding:false` prüft den gerade handelnden Spieler; 1/2 prüft den
expliziten Sprecher. Private Antworten kosten keine Ladung und keine Gegenstände.

`enterLock(mapId,lockId)` muss nach tatsächlichem Übergang auf der angegebenen
Karte ausgelöst werden. Unbekannte oder fremde Schleusen werden abgelehnt. Alle
Bindungen und der lokale Alarm enden; Wissen, Reserven und Routen bleiben erhalten.
Die Wissensflags privater Antworten dokumentieren nur eine lokale Beobachtung,
keinen Personenbesitz und keine finale freiwillige Gegenstimme.

## Speichern und Spielzeit

`serializeSignalRoutes()` liefert das **zusätzliche** Feld `signalRoutes` (v=1).
Es überschreibt niemals `serializeSignal().signal`. Sets werden Arrays, Kopien
sind unabhängig vom Livezustand. `loadSignalRoutes` ergänzt die zuvor geladenen
Ladungen/Reserven, filtert unbekannte Muster/Routen/Bindungen und ungültige Alarme.
Alte Saves ohne Erweiterung bleiben gültig; gefundene AR-Musterquellen migrieren.

`signal.routeTime` zählt ausschließlich über `tickSignalRoutes(dt)` übergebene
Spielsekunden. `lastAlarm.until` ist ein Ablaufwert in dieser Zeitskala. Keine
Wanduhr, Timer oder automatische Aktschritte. Während blockierender Menüs nicht
ticken. `handled` enthält höchstens die letzten 64 gültig ausgeführten IDs und
wird gespeichert. Die Deduplizierung gilt für dieses Fenster; der Transport darf
ältere verarbeitete Kommandos nicht erneut zustellen (siehe Einbauhinweise).

## Ereignisse

| Ereignis | Nutzlast |
|---|---|
| `signal_route` | `ok,kind,station,pattern,dir,speaker,map,tiles,safeTiles,listeners,cost,text,form,sound,symbol`; zusätzlich `routeTiles`, `flag`, `spawn,nerves` oder `alarm:{map,tiles,until}`. |
| `signal_binding` | `ok,speaker,binding,flag,text,warning,form,koop`. |
| `signal_lock` | `ok,map,lock,ended:[{speaker,text,form}],text,form`. |
| `signal_alarm_end` | `text,form`. |

Alle neuen Ereignisse besitzen verständlichen Text und Form unabhängig vom Ton.
`patternSound()` liefert `{call,hall,zeichen}`; `signSymbol()` einen Index 0–15,
bei unbekanntem Muster jeweils `null`. Die Symbolkachel ist eine Merkhilfe;
ARs ausführliche Form/Quelle/Bedeutung und AYs exakte Klangzeichen bleiben sichtbar.

## Prüfen

```sh
node docs/story/k3_ruf/pruefen.mjs
node --test tests/k3_ruf.test.js
npm test
```

Das Repo verwendet `node:test` (auch `duo.test.js`), nicht Vitest; deshalb wird
kein neuer Testrunner eingeführt. Der Datenprüfer kontrolliert Muster, Quellen,
Flags, Klänge, Maße, begehbare Stationen/Nischen/Korridore, Schleusen und freie
Ausgänge. Tests verwenden echtes `loadContent()` und eine GameState-Unterklasse
mit den hinzugefügten Methoden, ohne bestehende Tests oder Produktion zu patchen.
