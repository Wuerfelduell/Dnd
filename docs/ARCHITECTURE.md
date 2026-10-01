# Architektur

Ziel: kleine, klar getrennte Systeme, die mehrere Party-Mitglieder, Fähigkeiten, Zauber,
Status-Effekte, Ausrüstung und verschiedene Gegner tragen. Keine monolithischen Controller.

## Schichten

```
Daten (Resources)      ActorData · ActorStats · WeaponData · SpellData · StatusEffectData   (data/*.tres)
Regeln (reine Logik)   Dice · DiceResult · AttackProfile · AttackResolver · AttackResult · CombatSituation
                       SavingThrow · SaveResult · SpellResolver · StatusEffect · TurnState
                       InitiativeTracker · CombatAction (+ Attack/Offhand/Spell/Dash/Disengage/
                       SecondWind/ActionSurge) · Targeting · CombatMovement · CombatContext · Progression
Welt-Abfragen          Visibility (Sichtlinie, Deckung, Höhe) · Lighting (Licht/Schatten) · Terrain (Bodenhöhe)
KI                     CombatAI (Basis) · EnemyAI · PartyAI
Orchestrierung         CombatManager (Node)                                   GameState (Autoload)
Welt / Actors          World · TerrainBuilder · LightSource · Actor · ActorVisual · CharacterAnimator · MiniatureBuilder · PlayerController · PartyFollower · EnemyPerception · CameraRig · TargetingPreview
Eingabe                InputSetup (Autoload) · PlayerCombatInput · HudJoystick · ScreenRaycast
Präsentation           CombatHud · ActorLabel · FloatingText                    EventBus (Autoload)
```

Regeln kennen keine UI. Die UI hört nur auf Signale (`EventBus`, `CombatManager`).
Die Regeln kennen auch keine Physik: `AttackResolver` bekommt eine fertige `CombatSituation`
(Deckung, Höhendifferenz, wer im Dunkeln steht), die `CombatSituation.assess` vorher per Raycast
aus der Szene liest oder die ein Test von Hand baut.
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
| `Actor` | Laufzeitzustand: HP, `TurnState`, Slots, Munition, Statuses, Concentration, Actions, Down/Revive, `short_rest` / `long_rest`, Pfadbewegung per `move_and_slide` mit Schwerkraft (Treppen, Gefälle, Gleiten an Körpern), Stall-Erkennung und „verlässt Reichweite“ (Signal `reach_left`). Entfernungen und Bewegungsbudget zählen auf der Bodenebene. Ruft an den passenden Stellen `play_action()` (laufen, Treffer, Tod); `figure_height()` liefert die Figurenhöhe für Augenhöhe und Labels. |
| `TurnState` | Actions, Bonus Actions, Reaction, Bewegung, ausstehende Multiattack-Schläge, Sneak-Attack-Flag, Light-Weapon-Flag. |
| `CombatAction` | Basisklasse: `id`, Kosten, `target_kind` (NONE/ENEMY/ALLY/ANY/POINT), `is_available`, `can_target`, `can_target_point`, `pay_cost`, `execute(actor, target, point)`. |
| `AttackResolver` | d20 + Bonus gegen AC mit allen Vorteil/Nachteil-Quellen, Bless, Crit-Regeln (nat 20, Paralyzed), Sneak Attack. Arbeitet auf einem `AttackProfile` (Waffe oder Zauber) und einer `CombatSituation` (Deckung erhöht die AC gegen Fernangriffe, Höhe ±2, unbemerkt aus dem Dunkeln = Vorteil, Ziel im Dunkeln = Nachteil; jeder Angriff setzt `TurnState.revealed`). |
| `CombatSituation` | Schlachtfeld-Fakten für einen Angriff: `cover`, `elevation_m`, `attacker_in_shadow`, `target_in_shadow`, `distance_m`; `assess(attacker, target)` liest sie aus der Szene, `summary()` erklärt sie für HUD und Log. |
| `Visibility` | Fünf Strahlen von den Augen zu Augen/Brust/Knien/Schultern des Ziels (nur Layer 1 blockiert): 0 → keine Deckung, 1–2 → halbe (+2), 3–4 → Dreiviertel (+5), 5 → volle Deckung = keine Sichtlinie. `point_visible` für Flächenzauber, `cover_from_point` für DEX-Saves gegen Explosionen, `elevation_bonus` (±2 ab 1 m). Augenhöhe = 85 % der Figurenhöhe aus `MiniatureBuilder`. |
| `Lighting` | Beleuchtet = eine `LightSource` im Radius mit freier Linie zur Brust. Kein Licht in der Szene = Tag. `override` für Tests. |
| `Terrain` / `TerrainBuilder` | `Terrain.ground_height` (Raycast nach unten) für Tipps, Teleports, Wegziele und Vorschau. `TerrainBuilder` baut die Welt (40 x 80 m: Arena, Tavernenhof und Taverne im Süden, Höhle im Norden) aus den Asset-Paketen auf einem 4-m-Raster: Arena-Mauern mit Lücken (`WALL_GAPS`: Südtor, Höhlenmund) und einem Collider je Mauerabschnitt, Tavernenwände mit Türöffnung, Möbel mit Box-Collidern (Größen in Modell-Koordinaten, der Body wird gedreht), Höhlenwände auf drei Seiten, Felsformationen mit Zylinder-Collidern, Kristalle/Pilze/Kamin/Kronleuchter/Kerzen als `LightSource`; 100 Bodenplatten (Gras, Erde an den Lagern, Steinstraße dazwischen), zehn Mauerstücke pro Seite mit einem Collider je Seite, Plattformen aus 4x4-Tiles, Treppenmodelle mit einem glatten Hang-Collider darunter (beginnt 50 cm vor der ersten Stufe knapp unter dem Boden, endet exakt auf dem Plateau, damit nirgends eine Kante entsteht, an der `move_and_slide` hängen bleibt), Kisten/Mauern/Fässer mit Box-Collidern, Säulen und Bäume mit Zylinder-Collidern, Fackeln/Lagerfeuer mit `LightSource`, Deko ohne Kollision. Alles landet unter der `NavigationRegion3D`, bevor das Navmesh gebacken wird; `layout_height()` liefert die Sollhöhe aus den Daten für Tests. Fehlt ein Modell, entsteht ein Platzhalterblock in Collidergröße. |
| `SavingThrow` | d20 + Save-Bonus (+ Bless) gegen DC, Auto-Fail für STR/DEX bei Paralyzed. |
| `SpellResolver` | Zielsammlung nach Zielart, Angriff/Save/Auto-Hit pro Ziel (Wiederholungen für Darts/Strahlen), Schaden, Heilung, Status, Concentration-Verknüpfung. |
| `CombatManager` | Einziger Ort, an dem Regeln durchgesetzt werden: `start_combat`, `perform_action`, `move_actor`, `end_turn` (Status-Tick, Wiederholungs-Saves), Opportunity Attacks (`_on_reach_left`), Aufstehen aus Prone, Übersprungene Züge, Kampfende. Generationszähler schützt vor Koroutinen abgebrochener Kämpfe. |
| `EnemyAI` | Zielwahl nach Erreichbarkeit und Verwundbarkeit (Ziele im Dunkeln sind unattraktiv), Fernkampf wenn nötig, Dash zum Heranlaufen, Multiattack. Ohne Sichtlinie läuft ein Schütze nah heran statt hinter dem Hindernis stehen zu bleiben. |
| `EnemyPerception` | Pollt pro Physik-Tick die Körper im Radius: bemerkt wird, wer in Sichtlinie ist und beleuchtet (8,5 m) oder sehr nah (40 % davon im Dunkeln). |
| `PartyAI` | Klassenheuristiken (Fighter: Surge/Second Wind; Rogue: Sneak-Ziel + Off-hand; Wizard: Flächen-/Slot-Zauber und Kiting; Cleric: Notheilung, Bless, Hold Person, Guiding Bolt). Dient Autoplay-Test und „Auto-battle“-Button. |
| `PlayerCombatInput` | Lock & Roll: Aktion wählen → Tipp sperrt Figur, Punkt (in Reichweite geklemmt) oder Weg (auf Restbewegung gekürzt) → `confirm()` führt aus, `cancel()` verwirft. Signal `lock_changed` für Vorschau und HUD. Kennt keine Regeln. |
| `TargetingPreview` | Zeichnet die Sperre: Flächenkreis (rot bei Freunden im Radius), Wegstrecke (rot bei Opportunity Attack), Zielmarker. |
| `Progression` | XP-Tabelle, Level-Up-Anwendung auf die Laufzeitkopie der `ActorData` (HP, Übungsbonus, ASI, Klassenfeatures, Slots, neue Zauber), Cantrip-Skalierung, `scale_enemy` (Gegner aus der Quell-Resource neu aufbauen und auf ein Level heben). |
| `CombatMovement` | `plan(mover, ziel, andere)`: Navmesh-Pfad + Umwege um Körper (`detour_around`) + freies Ziel (`free_destination`), Opportunity-Attack-Vorhersage, Kürzen auf Restbewegung. Wird von Kampf, Vorschau, KI, Followern und Tap-to-Move gleichermaßen benutzt. |
| `ActorVisual` | Sockel mit Fraktionsring plus Figur: animiertes GLB-Modell (`ActorData.model`, Maßstab, Höhe, sichtbare Ausrüstung, Blickrichtung) mit eigenen Material-Kopien für Status-Tönung und Treffer-Blitz (Emission), sonst Primitiv-Miniatur (`ActorData.miniature`, `MiniatureBuilder`), sonst Kapsel. `play_action()` ist die einzige Animationsschnittstelle für den Rest des Spiels; Modelle spielen Tod statt umzukippen. |
| `CharacterAnimator` | Übersetzt Spielaktionen (idle, run, attack, slam, ranged, cast, hit, death, spawn, revive) in die Clipnamen des jeweiligen Modells (KayKit: `Idle`, `Running_A`, `1H_Melee_Attack_Slice_Diagonal` …; Quaternius: `Walk`, `Attack`, `HitRecieve` …; Kreaturen: `Slam`, `Cast`, `Spawn` …). Schleifen für idle/walk/run, Einzelclips kehren danach zur Ruheaktion zurück. `ActorData.model_attack_action` wählt den Nahkampfclip (Golem: slam). Rein optisch: Trefferzeitpunkt und Schaden kommen aus den Regeln. |
| `MiniatureBuilder` | Rückfalloption ohne Asset-Paket: Miniaturen aus Primitiven nach Rezept. |
| `PartyFollower` | Nicht gesteuerte Party-Mitglieder folgen dem Anführer in Formation (Navmesh-Pfad). |
| `World` | Verdrahtet Szene, entscheidet Kampfstart (Wahrnehmung) und Teilnehmer (ganze Party + Gegner derselben Gruppe im Umkreis: `Enemies` = Arena-Wellen, `CaveEnemies` = einmaliger Höhlen-Encounter), stabilisiert Gefallene nach dem Sieg, vergibt XP (`Progression`), Rast & Respawn der nächsten Welle (nur `arena_enemies()`). `WAVE_ARRIVALS` (Welle → Liste von `ActorData`-Pfaden) spawnt neue Kreaturen vor dem Höhleneingang (`_spawn_arrival`, Spawn-Clip). `npcs()` sind die neutralen Tavernenleute (`Npcs`). |
| `ActorData.Faction.NEUTRAL` | Dritte Fraktion: `Actor.is_hostile_to` ist für Neutrale in beide Richtungen falsch, damit fallen sie aus jeder Zielwahl, KI-Liste und Kampfteilnahme heraus, ohne Sonderfälle in den Regeln. `model_idle_action` wählt ihre Ruhepose (`sit`, `cheer`, `use_item`), `model_equipment = ["*"]` behält alle Requisiten. |
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
* **Weitere Assets**: neue Figur = GLB unter `assets/characters/` + `ActorData.model` (Maßstab, Höhe, Ausrüstung, Blickrichtung); fehlen Clipnamen, in `CharacterAnimator.CANDIDATES` ergänzen. Neues Geländestück = Eintrag in den `TerrainBuilder`-Listen mit Collidergröße. Waffen für den Goblin-Bogenschützen (Quaternius-Skelett ohne Handknochen) sind noch offen.
* **Trefferzeitpunkt an die Animation koppeln**: heute laufen Wurf und Clip parallel (Pacing 0,9 s); ein `AnimationPlayer`-Signal oder eine feste Verzögerung vor `take_damage` würde den Schaden auf den Schlag legen.
* **Verstecken als Aktion / Kreaturen als Deckung**: Flag in `TurnState` bzw. `Visibility.blocked_count` zusätzlich gegen Layer 2 (ohne Angreifer und Ziel) prüfen.
* **Screenshots ohne Editor**: `tests/screenshot.gd` (`--screenshot`) rendert Übersicht und Nahaufnahmen aller Figuren, unter Linux mit `xvfb-run` und `--rendering-driver opengl3`.

## Tests

* `tests/unit_tests.tscn`: Regelschicht ohne Kampfszene (rund 2000 Checks), inklusive Wegplanung um Körper, Munition, Rasten, Gegner-Skalierung, Deckungs-/Höhen-/Schattenregeln auf einer von Hand gebauten `CombatSituation`, Terrain-Layout und -Aufbau sowie Modelle/Animationen (Clips vorhanden, Ausrüstung ein-/ausgeblendet, Tönung, Tod).
* `tests/scenario.gd` (`--scenario`): gescriptete Situationen in der echten Szene mit Physik und Navmesh, inklusive Fireball auf einen Punkt, Misty Step, Treppensteigen, Höhenbonus, halber Deckung hinter einer Kiste, voller Deckung hinter einer Säule, sichtbaren Zielpunkten und Wahrnehmung im Dunkeln.
* `tests/autoplay.gd` (`--autoplay --seed=N`): kompletter Loop inklusive echter Eingabe-Events (Lock, Cancel, Confirm), Sieg, Level-Up, Rast, zweite Welle; gibt eine `FEATURES`-Zeile mit Zählern (Zauber, Saves, OAs, Status, Concentration) aus.
