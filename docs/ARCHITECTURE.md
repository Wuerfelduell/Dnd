# Architektur

Ziel: kleine, klar getrennte Systeme, die später mehrere Party-Mitglieder, Fähigkeiten,
Zauber, Status-Effekte, Ausrüstung und verschiedene Gegner tragen können. Keine
monolithischen Controller.

## Schichten

```
Daten (Resources)      ActorData · ActorStats · WeaponData          (data/*.tres)
Regeln (reine Logik)   Dice · DiceResult · AttackResolver · AttackResult · TurnState
                       InitiativeTracker · CombatAction (+ Attack/Dash/SecondWind)
                       Targeting · CombatMovement · EnemyAI
Orchestrierung         CombatManager (Node)                          GameState (Autoload)
Welt / Actors          World · Actor · ActorVisual · PlayerController · EnemyPerception · CameraRig
Eingabe                InputSetup (Autoload) · PlayerCombatInput
Präsentation           CombatHud · ActorLabel · FloatingText          EventBus (Autoload)
```

Regeln kennen keine UI. Die UI hört nur auf Signale (`EventBus`, `CombatManager`).

## Wichtige Klassen

| Klasse | Aufgabe |
|---|---|
| `GameState` | Globaler Modus `EXPLORATION / COMBAT / GAME_OVER`, Signal `state_changed`, `pacing` für Pausen (Tests: 0). |
| `EventBus` | Entkoppelte Events: `log_message`, `attack_resolved`, `initiative_rolled`, `heal_applied`, `enemy_spotted`. |
| `Dice` / `DiceResult` | Alle Würfe laufen hier durch (seedbar). `DiceResult` behält Einzelwürfel für die Anzeige. |
| `ActorData` | Statische Definition eines Wesens: Name, Fraktion, `ActorStats`, Waffen, Fähigkeiten-Flags, Farbe. |
| `Actor` | Laufzeitzustand (HP, `TurnState`, Actions, Down-State) + Pfadbewegung. Entscheidet nichts selbst. |
| `CombatAction` | Basisklasse für alles, was ein Zug kosten kann (`ACTION / BONUS_ACTION / FREE`). `can_target`, `execute`. |
| `AttackResolver` | d20 + Bonus gegen AC, Crit/Fumble, Schadenswürfel. Reine Funktion. |
| `InitiativeTracker` | Würfelt, sortiert, gibt Züge rundenweise aus, überspringt Down-Actors. |
| `CombatManager` | Einziger Ort, an dem Regeln durchgesetzt werden: `start_combat`, `perform_action`, `move_actor`, `end_turn`, Kampfende. |
| `EnemyAI` | Ziel wählen → (Dash) → hinlaufen → angreifen. Nutzt ausschließlich die öffentliche `CombatManager`-API – kann also nicht schummeln und spielt im Test auch den Helden. |
| `PlayerCombatInput` | Mausklick → Raycast → `move_actor` / `perform_action`. Kennt keine Regeln. |
| `World` | Verdrahtet Szene, entscheidet wann Kampf beginnt (Gegner-Wahrnehmung) und wer teilnimmt. |
| `CombatHud` | Initiative-Liste, Aktionsleiste, Ressourcen, Würfel-Log, Floating Text, Game-Over. |

## Ablauf eines Kampfes

1. `EnemyPerception` (Area3D am Gegner) meldet `enemy_spotted` → `World` sammelt Teilnehmer → `CombatManager.start_combat`.
2. `InitiativeTracker.roll_for` würfelt, `GameState` → `COMBAT`.
3. `_next_turn`: `TurnState.begin_turn(speed)`, Signal `turn_started`.
   * Spieler: wartet auf `PlayerCombatInput` / HUD-Buttons.
   * Gegner: `EnemyAI.take_turn` (async), danach automatisch `end_turn`.
4. `perform_action` prüft Zug, Ressourcen, Ziel/Reichweite, zahlt die Kosten, führt aus, prüft Kampfende.
5. `move_actor` sucht einen Pfad auf dem Navmesh (`CombatMovement`), `Actor.move_along_path` läuft bis Budget oder Kollision.
6. Alle Gegner down → Sieg → `EXPLORATION`; Held down → `GAME_OVER`.

## Erweiterungspunkte

* **Mehr Party-Mitglieder**: weitere `Actor`s mit `Faction.PLAYER` in die Teilnehmerliste; `is_player_turn` und HUD arbeiten bereits mit dem *aktiven* Actor statt mit „dem Spieler“.
* **Fähigkeiten / Zauber**: neue `CombatAction`-Unterklassen (z. B. mit Rettungswurf statt Angriffswurf). `AttackResolver` ist die Stelle für Vorteil/Nachteil, Deckung, Resistenzen.
* **Status-Effekte**: an `Actor` (Liste + Hooks in `begin_turn` / `take_damage`), Anzeige über `EventBus`.
* **Ausrüstung**: `ActorData.weapons` ist bereits eine Liste von `WeaponData`; Rüstung könnte `armor_class` in `ActorStats` ableiten.
* **Echte Assets**: nur `ActorVisual` (Mesh, Farbe, Down-Pose) und die Szene `actor.tscn` ersetzen; Animationen an `Actor.move_along_path` / `AttackAction.execute` hängen.
* **Level**: `main.tscn` – alle statischen Collider unter `NavigationRegion3D` werden beim Start automatisch zum Navmesh gebacken.

## Tests

* `tests/unit_tests.tscn` – Regelschicht ohne Szene (Würfel, Parsing, Trefferwahrscheinlichkeit, Crit, Down-State, Initiative-Reihenfolge, Ressourcen).
* `tests/autoplay.gd` – vollständiger Loop headless: Erkundung per Steuerung, Kampfstart über Wahrnehmung, erster Heldenzug über echte Eingabe-Events (Raycast-Klick auf Boden und Gegner, Bonus Action, Leertaste), restliche Züge per KI, Sieg oder Niederlage, Rückkehr in die Erkundung ohne erneuten Trigger.
