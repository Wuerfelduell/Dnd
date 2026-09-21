# Dnd – 3D-RPG-Prototyp (Vertical Slice)

Trying to make a dnd game using my Baldur's Gate 3 and D&D 5.5e experience.

Aktueller Stand: ein kleiner, spielbarer Prototyp in **Godot 4.3** – frei begehbare
Testszene, zwei Goblins, Übergang in einen rundenbasierten Kampf mit Initiative,
Action / Bonus Action / Bewegung, Nah- und Fernkampf, Trefferwurf gegen AC,
Schadenswürfeln, HP, Down-State, sichtbaren Würfelergebnissen, einfacher Gegner-KI und
Rückkehr in den Erkundungsmodus.

Alles besteht bewusst aus Platzhalter-Geometrie (Kapseln, Würfel, Zylinder). Die Systeme
sind so getrennt, dass echte Modelle, Animationen und weitere Regeln später ergänzt werden
können, ohne die Kampflogik anzufassen (siehe `docs/ARCHITECTURE.md`).

## Starten

1. [Godot 4.3](https://godotengine.org/download) herunterladen (Standard-Version, kein .NET nötig).
2. Godot starten → **Importieren** → die Datei `project.godot` in diesem Ordner auswählen.
3. Im Editor **F5** drücken (oder oben rechts „Play“).

Läuft auch direkt im **Godot-Editor auf Android**: Projekt dort importieren und starten.
Die komplette Steuerung geht per Touch, Maus und Tastatur sind optional.

## Steuerung

| Modus | Touch / Maus | Tastatur (optional) | Wirkung |
|---|---|---|---|
| Erkundung | Tippen auf Boden | `W A S D` | Laufen (per Tipp entlang des Navmeshs) |
| beide | Buttons „< Cam“ / „Cam >“ | `Q` / `E` | Kamera um 45° drehen |
| beide | Buttons „Zoom +“ / „Zoom -“ | Mausrad | Zoom |
| Kampf | Tippen auf Boden | | Bewegung (blauer Kreis = verbleibende Reichweite) |
| Kampf | Tippen auf Gegner | | Angriff (Schwert, wenn angrenzend, sonst Bogen) |
| Kampf | Buttons unten | | Longsword / Longbow / Dash / Second Wind auswählen bzw. ausführen |
| Kampf | Button erneut tippen | Rechtsklick / `Esc` | Auswahl abbrechen |
| Kampf | Button „End Turn“ | `Leertaste` / `Enter` | Zug beenden |
| Game Over | Button „Restart“ | `R` | Neustart |
| beide | Button „Log“ | | Würfel-Log ein-/ausklappen |

Das UI ist auf 1280×720 ausgelegt und wird auf jede Bildschirmgröße skaliert (Querformat).
Auf Mobilgeräten wird automatisch der Compatibility-Renderer verwendet.

Die Goblins stehen nördlich des Startpunkts. Sobald einer den Helden bemerkt (8 m), beginnt
der Kampf; alle Gegner in 14 m Umkreis nehmen teil.

## Regeln (bewusst reduziert, 5e-inspiriert)

| | HP | AC | Angriff | Schaden | Bewegung |
|---|---|---|---|---|---|
| Hero | 20 | 15 | Longsword 1d20+5 · Longbow 1d20+4 | 1d8+3 · 1d8+2 | 9 m |
| Goblin Warrior | 12 | 13 | Scimitar 1d20+4 | 1d6+2 | 9 m |
| Goblin Brute | 15 | 12 | Scimitar 1d20+3 | 1d6+1 | 9 m |

* Initiative: 1d20 + DEX. Pro Zug: 1 Action, 1 Bonus Action, Bewegung in Metern (frei, kein Raster).
* Angriffsbonus = Attributsmodifikator + Übungsbonus (+2); Schadensbonus = Attributsmodifikator.
* Natürliche 20 = automatischer Treffer mit doppelten Schadenswürfeln, natürliche 1 = automatischer Fehlschlag.
* **Dash** (Action): +9 m Bewegung. **Second Wind** (Bonus Action, Held): heilt 1d10+1, einmal pro Kampf.
* Nahkampfreichweite 1,5 m, Bogen 24 m. Noch nicht enthalten: Gelegenheitsangriffe, Nachteil im Nahkampf für Fernwaffen, Deckung, Rettungswürfe, Zustände.
* 0 HP = „Down“. Sind alle Gegner down → Sieg und zurück zur Erkundung. Ist der Held down → Game Over.

## Tests (ohne Editor)

```bash
# Regelschicht (Würfel, Angriffe, Initiative, Ressourcen)
godot --headless --path . res://tests/unit_tests.tscn

# Kompletter Gameplay-Loop: Erkundung → Kampf (inkl. simulierter Mausklicks) → Sieg/Niederlage → Erkundung
godot --headless --path . -- --autoplay --seed=4

# Beides nacheinander
./tests/run_all.sh
```

Der Autoplay-Test lässt den Helden von derselben KI spielen wie die Gegner; der Seed macht
die Würfel reproduzierbar (ohne Seed zufällig).

## Projektstruktur

```
project.godot
scenes/           main.tscn (Testarena), actors/, ui/
scripts/core/     GameState, EventBus, InputSetup, Dice
scripts/data/     ActorData, ActorStats, WeaponData (Resources)
scripts/actors/   Actor, ActorVisual, PlayerController, EnemyPerception
scripts/combat/   CombatManager, InitiativeTracker, TurnState, AttackResolver,
                  CombatMovement, Targeting, EnemyAI, PlayerCombatInput, actions/
scripts/world/    World, CameraRig
scripts/ui/       CombatHud, ActorLabel, FloatingText
data/             .tres-Definitionen für Held, Goblins und Waffen
tests/            Unit-Tests und Autoplay-Integrationstest
docs/             Architekturbeschreibung
```
