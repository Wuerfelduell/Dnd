## Static definition of a creature: identity, stats, weapons, abilities, spells.
##
## Runtime values (current HP, turn resources, statuses) live on the [Actor]
## node, so one ActorData resource can be shared by many spawned creatures.
class_name ActorData
extends Resource

## NEUTRAL creatures (tavern folk) fight nobody and nobody fights them.
enum Faction { PLAYER, ENEMY, NEUTRAL }

@export var display_name: String = "Actor"
## Fighter / Rogue / Wizard / Cleric / Goblin ... (drives level-up tables).
@export var class_name_text: String = ""
@export var level: int = 1
## Experience earned (party members) / awarded when defeated (enemies).
@export var xp: int = 0
@export var xp_value: int = 0
## Hit die size for HP on level-up (d10 Fighter, d8 Rogue/Cleric, d6 Wizard).
@export var hit_die: int = 8
## Ability raised by the level 4 ability score improvement ("str", "dex", ...).
@export var primary_ability: String = "str"
@export var faction: Faction = Faction.ENEMY
## "humanoid", "beast", ... used by spells such as Hold Person.
@export var creature_type: String = "humanoid"
@export var stats: ActorStats
@export var weapons: Array[WeaponData] = []
## Light weapon for the bonus-action off-hand attack (two-weapon fighting).
@export var offhand_weapon: WeaponData
## Base rim colour (and capsule colour while no miniature recipe exists).
@export var color: Color = Color.WHITE
## Key of a [MiniatureBuilder] recipe ("goblin", "wolf", ...). Empty = capsule.
## Used when no [member model] is set or the model file is missing.
@export var miniature: String = ""

@export_group("Animated model")
## Path below res://assets/characters/ of an animated GLB ("adventurers/Knight").
## Empty = miniature / capsule.
@export var model: String = ""
@export var model_scale: float = 1.0
## Height of the scaled figure in metres (labels, eye height for line of sight).
@export var model_height: float = 1.8
## Equipment meshes inside the model that stay visible (KayKit heroes carry
## every alternative weapon as a hidden mesh): "1H_Sword", "Round_Shield" ...
@export var model_equipment: PackedStringArray = PackedStringArray()
## Extra yaw so the model looks along the actor's -Z like the capsule does.
@export var model_yaw_degrees: float = 180.0
## Animation action for melee attacks ("attack", or "slam" for the golems).
@export var model_attack_action: String = "attack"
## Resting animation while nothing happens ("idle", "sit", "cheer", "use_item" ...).
@export var model_idle_action: String = "idle"

@export_group("Class features")
## Number of weapon attacks per Attack action (Extra Attack / Multiattack).
@export var attacks_per_action: int = 1
## Fighter: bonus action heal 1d10 + level, once per combat.
@export var has_second_wind: bool = false
@export var second_wind_bonus: int = 1
## Fighter: one extra action, once per combat.
@export var has_action_surge: bool = false
## Rogue: Dash / Disengage as a bonus action.
@export var has_cunning_action: bool = false
## Rogue: extra damage dice once per turn, e.g. "2d6". Empty = none.
@export var sneak_attack_dice: String = ""
## Wolves: advantage on attacks when an ally is adjacent to the target.
@export var has_pack_tactics: bool = false

@export_group("Spellcasting")
## "int" (Wizard), "wis" (Cleric) ... empty = no caster.
@export var spellcasting_ability: String = ""
@export var spells: Array[SpellData] = []
## Slots per level, index = level (index 0 unused). e.g. [0, 4, 2] = 4 first, 2 second.
@export var spell_slots: PackedInt32Array = PackedInt32Array()


func is_caster() -> bool:
	return spellcasting_ability != "" and not spells.is_empty()


func spell_attack_bonus() -> int:
	if not is_caster():
		return 0
	return stats.ability_mod(spellcasting_ability) + stats.proficiency_bonus


func spell_save_dc() -> int:
	if not is_caster():
		return 10
	return 8 + stats.ability_mod(spellcasting_ability) + stats.proficiency_bonus


func casting_mod() -> int:
	return stats.ability_mod(spellcasting_ability) if is_caster() else 0
