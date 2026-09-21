# Architektur

Ziel: kleine, klar getrennte Systeme, die mehrere Party-Mitglieder, Fähigkeiten, Zauber,
Status-Effekte, Ausrüstung und verschiedene Gegner tragen. Keine monolithischen Controller.

## Schichten

```
Daten (Resources)      ActorData · ActorStats · WeaponData · SpellData · StatusEffectData   (data/*.tres)
Regeln (reine Logik)   Dice · DiceResult · AttackProfile · AttackResolver · AttackResult
                       SavingThrow · SaveResult · SpellResolver · StatusEffect · TurnState
                       InitiativeTracker · CombatAction (+ Attack/Offhand/Spell/Dash/Disengage/
                       SecondWind/ActionSurge) · Targeting · CombatMovement · CombatContext · Progression
KI                     CombatAI (Basis) · EnemyAI · PartyAI
Orchestrierung         CombatManager (Node)                                   GameState (Autoload)
Welt / Actors          World · Actor · ActorVisual · PlayerController · PartyFollower · EnemyPerception · CameraRig · TargetingPreview
Eingabe                InputSetup (Autoload) · PlayerCombatInput · HudJoystick · ScreenRaycast
Präsentation           CombatHud · ActorLabel · FloatingText                    EventBus (Autoload)
```

Regeln kennen keine UI. Die UI hört nur auf Signale (`EventBus`, `CombatManager`).
Die KI benutzt ausschließlich die öffentliche `CombatManager`-API (`perform_action`,
`move_actor`), kann also nichts, was ein Spieler nicht auch könnte.

## Wichtige Klassen

| Klasse | Aufgabe |
|---|---|
| `GameState` | Globaler Modus `EXPLORATION / COMBAT / GAME_OVER`, `pacing` für Pausen (Tests: 0). |
| `EventBus` | Entkoppelte Events: Log, Angriff, Save, Heilung, Schaden, Status an/aus, Concentration verloren, Zauber, Opportunity Attack, Gegner entdeckt. |
| `Dice` / `DiceResult` | Alle Würfe (seedbar). `d20(mod, mode)` würfelt mit Vorteil/Nachteil, `extras` sind Bonuswürfel (Bless). |
| `ActorData` | Statische Definition: Fraktion, Kreaturentyp, Stats, Waffen, Off-hand, Klassenfeatures (Multiattack, Second Wind, Action Surge, Cunning Action, Sneak Attack, Pack Tactics), Zauber + Slots. |
| `SpellData` | Zauber deklarativ: Stufe, Kosten, Zielart, Reichweite, Angriffsart (Spell Attack / Save / Auto-Hit), Schaden, Heilung, Status, Concentration. |
| `StatusEffectData` | Zustand deklarativ als Flags: handlungsunfähig, Vorteil/Nachteil-Regeln, Tempo, Bonuswürfel, Wiederholungs-Save. |
| `Actor` | Laufzeitzustand: HP, `TurnState`, Slots, Munition, Statuses, Concentration, Actions, Down/Revive, `short_rest` / `long_rest`, Pfadbewegung mit Gleiten an Körpern, Stall-Erkennung und „verlässt Reichweite“ (Signal `reach_left`). |
| `TurnState` | Actions, Bonus Actions, Reaction, Bewegung, ausstehende Multiattack-Schläge, Sneak-Attack-Flag, Light-Weapon-Flag. |
| `CombatAction` | Basisklasse: `id`, Kosten, `target_kind` (NONE/ENEMY/ALLY/ANY/POINT), `is_available`, `can_target`, `can_target_point`, `pay_cost`, `execute(actor, target, point)`. |
| `AttackResolver` | d20 + Bonus gegen AC mit allen Vorteil/Nachteil-Quellen, Bless, Crit-Regeln (nat 20, Paralyzed), Sneak Attack. Arbeitet auf einem `AttackProfile` (Waffe oder Zauber). |
| `SavingThrow` | d20 + Save-Bonus (+ Bless) gegen DC, Auto-Fail für STR/DEX bei Paralyzed. |
| `SpellResolver` | Zielsammlung nach Zielart, Angriff/Save/Auto-Hit pro Ziel (Wiederholungen für Darts/Strahlen), Schaden, Heilung, Status, Concentration-Verknüpfung. |
| `CombatManager` | Einziger Ort, an dem Regeln durchgesetzt werden: `start_combat`, `perform_action`, `move_actor`, `end_turn` (Status-Tick, Wiederholungs-Saves), Opportunity Attacks (`_on_reach_left`), Aufstehen aus Prone, Übersprungene Züge, Kampfende. Generationszähler schützt vor Koroutinen abgebrochener Kämpfe. |
| `EnemyAI` | Zielwahl nach Erreichbarkeit und Verwundbarkeit, Fernkampf wenn nötig, Dash zum Heranlaufen, Multiattack. |
| `PartyAI` | Klassenheuristiken (Fighter: Surge/Second Wind; Rogue: Sneak-Ziel + Off-hand; Wizard: Flächen-/Slot-Zauber und Kiting; Cleric: Notheilung, Bless, Hold Person, Guiding Bolt). Dient Autoplay-Test und „Auto-battle“-Button. |
| `PlayerCombatInput` | Lock & Roll: Aktion wählen → Tipp sperrt Figur, Punkt (in Reichweite geklemmt) oder Weg (auf Restbewegung gekürzt) → `confirm()` führt aus, `cancel()` verwirft. Signal `lock_changed` für Vorschau und HUD. Kennt keine Regeln. |
| `TargetingPreview` | Zeichnet die Sperre: Flächenkreis (rot bei Freunden im Radius), Wegstrecke (rot bei Opportunity Attack), Zielmarker. |
| `Progression` | XP-Tabelle, Level-Up-Anwendung auf die Laufzeitkopie der `ActorData` (HP, Übungsbonus, ASI, Klassenfeatures, Slots, neue Zauber), Cantrip-Skalierung, `scale_enemy` (Gegner aus der Quell-Resource neu aufbauen und auf ein Level heben). |
| `CombatMovement` | `plan(mover, ziel, andere)`: Navmesh-Pfad + Umwege um Körper (`detour_around`) + freies Ziel (`free_destination`), Opportunity-Attack-Vorhersage, Kürzen auf Restbewegung. Wird von Kampf, Vorschau, KI, Followern und Tap-to-Move gleichermaßen benutzt. |
| `PartyFollower` | Nicht gesteuerte Party-Mitglieder folgen dem Anführer in Formation (Navmesh-Pfad). |
| `World` | Verdrahtet Szene, entscheidet Kampfstart (Wahrnehmung) und Teilnehmer (ganze Party + Gegner im Umkreis), stabilisiert Gefallene nach dem Sieg, vergibt XP (`Progression`), Rast & Respawn der nächsten Welle. |
| `CombatHud` | Modus, Initiative mit Status, Aktionsleiste (Flow-Layout, Kosten/Slots), Ressourcen, Log, Floating Text, Kamera-Buttons, Joystick, Auto-battle, Game-Over. |

## Ablauf eines Zuges

1. `_next_turn`: `TurnState.begin_turn(speed)`, Prone-Aufstehen, `turn_started`. Handlungsunfähige Actors überspringen den Zug (Status-Tick läuft trotzdem, also auch der Wiederholungs-Save).
2. Spieler: `PlayerCombatInput` / HUD-Buttons → `perform_action` / `move_actor`. KI: `CombatAI.take_turn` → dieselben Aufrufe.
3. `perform_action` prüft Zug, Ressourcen, Ziel, zahlt (`pay_cost`: Action/Bonus/Slot/Multiattack) und führt aus.
4. `move_actor` läuft den Navmesh-Pfad; verlässt der Actor die Reichweite eines Gegners mit Reaction, pausiert die Bewegung, der Gegner schlägt zu (`AttackAction.perform_attack`), dann geht es weiter.
5. `end_turn` → `Actor.end_of_turn_tick` (Dauer runterzählen, Wiederholungs-Saves) → nächster Zug.

## Erweiterungspunkte

* **Neue Zauber / Zustände**: nur `.tres` anlegen. Neue Mechaniken = neues Flag in `StatusEffectData` + Abfrage an der passenden Stelle (`AttackResolver`, `SavingThrow`, `CombatManager`).
* **Weitere Punkt-Zauber**: `SpellData.target_kind = POINT`, Radius und `area_affects_allies` setzen, fertig. `teleport = true` macht daraus einen Sprung (Misty Step).
* **Level-Up-Wahl** (Attribut, Feats, Zauberauswahl): `Progression.apply_level_up` liefert heute feste Änderungen; ein Auswahl-Dialog würde vor dem Anwenden Optionen anbieten.
* **Reaktionszauber (Shield)**: Hook vor dem Trefferabgleich in `AttackResolver` bzw. ein `reaction_requested`-Signal im `CombatManager` analog zu `_on_reach_left`.
* **Todesrettungswürfe / echte Rast-Regeln**: `Actor` (Down-State erweitern), Slots nicht mehr pro Kampf auffrischen, `World.rest_and_next_wave` in eine Level-Logik überführen.
* **Echte Assets**: `ActorVisual` und `actor.tscn` ersetzen; Animationen an `Actor.move_along_path` / `execute` hängen.

## Tests

* `tests/unit_tests.tscn`: Regelschicht ohne Kampfszene (rund 1750 Checks), inklusive Wegplanung um Körper, Munition, Rasten und Gegner-Skalierung.
* `tests/scenario.gd` (`--scenario`): gescriptete Situationen in der echten Szene mit Physik und Navmesh, inklusive Fireball auf einen Punkt und Misty Step.
* `tests/autoplay.gd` (`--autoplay --seed=N`): kompletter Loop inklusive echter Eingabe-Events (Lock, Cancel, Confirm), Sieg, Level-Up, Rast, zweite Welle; gibt eine `FEATURES`-Zeile mit Zählern (Zauber, Saves, OAs, Status, Concentration) aus.
