# Dnd – 3D-RPG-Prototyp (Vertical Slice, Test 2: Party)

Trying to make a dnd game using my Baldur's Gate 3 and D&D 5.5e experience.

Aktueller Stand: ein spielbarer Prototyp in **Godot 4.3+**. Eine Viererparty (Fighter, Rogue,
Wizard, Cleric, Stufe 3) erkundet eine kleine Testszene, wird von Goblins, Wölfen und einem
Hobgoblin-Captain entdeckt und kämpft rundenbasiert mit Initiative, Action / Bonus Action /
Reaction / Bewegung, Nah- und Fernkampf, Zaubern mit Spell Slots, Rettungswürfen,
Concentration, Status-Effekten, Opportunity Attacks, Sneak Attack und Multiattack.

Alles besteht bewusst aus Platzhalter-Geometrie (Kapseln, Würfel, Zylinder). Die Systeme
sind so getrennt, dass echte Modelle, Animationen und weitere Regeln später ergänzt werden
können, ohne die Kampflogik anzufassen (siehe `docs/ARCHITECTURE.md`).

## Starten

1. [Godot 4.3 oder neuer](https://godotengine.org/download) herunterladen (Standard-Version, kein .NET nötig).
2. Godot starten → **Importieren** → die Datei `project.godot` in diesem Ordner auswählen.
3. Im Editor **F5** drücken (oder oben rechts „Play“).

Läuft auch direkt im **Godot-Editor auf Android**: Projekt dort importieren und starten.
Die komplette Steuerung geht per Touch, Maus und Tastatur sind optional.

## Steuerung

| Modus | Touch / Maus | Tastatur (optional) | Wirkung |
|---|---|---|---|
| Erkundung | Joystick unten links | `W A S D` | Anführer (Bran) laufen lassen, die Party folgt |
| Erkundung | Tippen auf Boden | Linksklick | Laufen per Tipp entlang des Navmeshs |
| beide | Buttons „< Cam“ / „Cam >“ | `Q` / `E` | Kamera um 45° drehen |
| beide | Buttons „Zoom +“ / „Zoom -“ | Mausrad | Zoom |
| Kampf | Tippen auf Boden | | Bewegung (blauer Kreis = verbleibende Reichweite) |
| Kampf | Tippen auf Gegner | | Angriff mit der besten Waffe in Reichweite |
| Kampf | Button unten, dann Ziel tippen | | Waffe / Zauber / Fähigkeit auf Gegner, Verbündeten oder sich selbst |
| Kampf | Button erneut tippen | Rechtsklick / `Esc` | Auswahl abbrechen |
| Kampf | Button „End Turn“ | `Leertaste` / `Enter` | Zug beenden |
| Kampf | Button „Auto-battle“ | | Die Party spielt sich selbst (dieselbe KI wie im Test) |
| Game Over | Button „Restart“ | `R` | Neustart |
| beide | Button „Log“ | | Würfel-Log ein-/ausklappen |

Im Kampf steuerst du immer die Figur, die gerade am Zug ist. Die Aktionsleiste zeigt alle
Aktionen der Figur mit Kosten (Action / Bonus / Frei) und Zauberstufe samt Slots.

## Die Party (Stufe 3)

| | HP | AC | Waffen | Besonderes | Zauber (Slots L1/L2: 4/2) |
|---|---|---|---|---|---|
| **Bran** (Fighter) | 28 | 16 | Longsword 1d8+3, Longbow 1d8+1 | Second Wind (Bonus, 1d10+3), Action Surge (2. Action) | – |
| **Vex** (Rogue) | 24 | 14 | Shortsword 1d6+3, Shortbow 1d6+3, Dagger (Off-hand, Bonus) | Sneak Attack 2d6, Cunning Action (Dash/Disengage als Bonus) | – |
| **Elara** (Wizard) | 17 | 12 | Dagger | Spell-DC 13, Zauberangriff +5 | Fire Bolt, Ray of Frost, Magic Missile, Burning Hands, Scorching Ray |
| **Tomas** (Cleric) | 24 | 16 | Mace 1d6+2 | Spell-DC 13, Zauberangriff +5 | Sacred Flame, Guiding Bolt, Cure Wounds, Healing Word (Bonus), Bless (Conc.), Hold Person (Conc.) |

Gegner: 1 Goblin Warrior, 2 Goblin Archer, 2 Wölfe (Biss mit STR-Rettungswurf gegen
Umwerfen, Pack Tactics), 1 Hobgoblin Captain (AC 17, 39 HP, zwei Angriffe pro Action).

## Regeln (bewusst reduziert, 5e-inspiriert)

* Initiative 1d20 + DEX, jeder einzeln. Pro Zug: 1 Action, 1 Bonus Action, 1 Reaction, Bewegung in Metern (frei, kein Raster).
* Angriff 1d20 + Attribut + Übung gegen AC; natürliche 20 = Crit (doppelte Würfel), natürliche 1 = Fehlschlag.
* **Vorteil / Nachteil** (2d20, höherer bzw. niedrigerer Wurf; beides hebt sich auf) durch Zustände, Guiding Bolt, Pack Tactics, Fernkampf mit angrenzendem Gegner.
* **Rettungswürfe** 1d20 + Attribut (+ Übung) gegen DC. Zauber-DC = 8 + Übung + Attribut.
* **Opportunity Attacks**: Wer die Nahkampfreichweite (1,5 m) eines Gegners verlässt, kassiert dessen Reaction-Angriff. Disengage verhindert das.
* **Spell Slots** pro Stufe, werden zu Kampfbeginn aufgefrischt (kein Rasten im Prototyp). Cantrips sind gratis.
* **Concentration**: nur ein Concentration-Zauber gleichzeitig; Schaden erzwingt einen CON-Rettungswurf (DC 10 oder halber Schaden), Fehlschlag oder Down beendet den Zauber und alle verknüpften Effekte.
* **Status-Effekte**: Blessed (+1d4 Angriff/Saves), Guided (Vorteil auf den nächsten Angriff), Slowed (-3 m), Paralyzed (handlungsunfähig, Angriffe mit Vorteil, Nahkampftreffer sind Crits, Wiederholungs-Save am Zugende), Prone (Nachteil auf eigene Angriffe, Nahkampf gegen sich mit Vorteil, Aufstehen kostet halbe Bewegung), Disengaging.
* 0 HP = „Down“. Heilung (Healing Word, Cure Wounds) holt Gefallene zurück. Nach einem Sieg stehen alle mit 1 HP auf. Ist die ganze Party down → Game Over.
* Noch nicht enthalten: Todesrettungswürfe, Deckung, Resistenzen, Zauber mit Flächenziel per Tipp, Reaktionszauber (Shield), Rasten, Level-Ups, Inventar.

## Tests (ohne Editor)

```bash
# Regelschicht: Würfel, Vorteil, Angriffe, Sneak Attack, Saves, Status, Concentration, Slots, Multiattack
godot --headless --path . res://tests/unit_tests.tscn

# Szenarien in der echten Szene: Opportunity Attack, Disengage, Hold Person (Lähmung, Zug überspringen,
# Wiederholungs-Save, Auto-Crit, Concentration-Verlust), Healing Word belebt wieder
godot --headless --path . -- --scenario

# Kompletter Loop: Joystick, Tippen, Party folgt, Kampf (erster Zug per simulierten Klicks, Rest per KI), Sieg/Niederlage
godot --headless --path . -- --autoplay --seed=4

# Alles nacheinander
./tests/run_all.sh
```

Der Seed macht die Würfel reproduzierbar. Über zwölf Seeds gewinnt die KI-Party etwa zwei von drei Kämpfen.

## Projektstruktur

```
project.godot
scenes/           main.tscn (Testarena, Party, Gegner), actors/, ui/
scripts/core/     GameState, EventBus, InputSetup, Dice, DiceResult, ScreenRaycast
scripts/data/     ActorData, ActorStats, WeaponData, SpellData, StatusEffectData (Resources)
scripts/actors/   Actor, ActorVisual, PlayerController, PartyFollower, EnemyPerception
scripts/combat/   CombatManager, InitiativeTracker, TurnState, AttackResolver, AttackProfile,
                  SavingThrow, SpellResolver, StatusEffect, Targeting, CombatMovement,
                  PlayerCombatInput, actions/ (Attack, Offhand, Spell, Dash, Disengage, Second Wind,
                  Action Surge), ai/ (CombatAI, PartyAI), EnemyAI
scripts/world/    World, CameraRig
scripts/ui/       CombatHud, HudJoystick, ActorLabel, FloatingText
data/             .tres für Helden, Gegner, Waffen, Zauber und Status-Effekte
tests/            Unit-Tests, Szenario-Test, Autoplay-Integrationstest, run_all.sh
docs/             Architekturbeschreibung
```
