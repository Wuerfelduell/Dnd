## Static definition of a creature: identity, stats, weapons, abilities.
##
## Runtime values (current HP, turn resources) live on the [Actor] node, so one
## ActorData resource can be shared by many spawned creatures.
class_name ActorData
extends Resource

enum Faction { PLAYER, ENEMY }

@export var display_name: String = "Actor"
@export var faction: Faction = Faction.ENEMY
@export var stats: ActorStats
@export var weapons: Array[WeaponData] = []
## Fighter-style bonus action: heal 1d10+1 once per combat.
@export var has_second_wind: bool = false
## Placeholder visual colour until real models exist.
@export var color: Color = Color.WHITE
