## Base statistics of a creature (reduced D&D 5e style).
class_name ActorStats
extends Resource

@export var max_hp: int = 10
@export var armor_class: int = 10
@export var strength_mod: int = 0
@export var dexterity_mod: int = 0
@export var constitution_mod: int = 0
@export var intelligence_mod: int = 0
@export var wisdom_mod: int = 0
@export var charisma_mod: int = 0
@export var proficiency_bonus: int = 2
## Abilities with saving throw proficiency, e.g. ["str", "con"].
@export var save_proficiencies: PackedStringArray = PackedStringArray()
## Movement per turn in meters (5e: 30 ft = 9 m).
@export var speed_m: float = 9.0


func ability_mod(ability: String) -> int:
	match ability.to_lower():
		"str", "strength":
			return strength_mod
		"dex", "dexterity":
			return dexterity_mod
		"con", "constitution":
			return constitution_mod
		"int", "intelligence":
			return intelligence_mod
		"wis", "wisdom":
			return wisdom_mod
		"cha", "charisma":
			return charisma_mod
	push_warning("Unknown ability '%s'" % ability)
	return 0


func is_save_proficient(ability: String) -> bool:
	return save_proficiencies.has(ability.to_lower())


func save_bonus(ability: String) -> int:
	var bonus := ability_mod(ability)
	if is_save_proficient(ability):
		bonus += proficiency_bonus
	return bonus


func initiative_bonus() -> int:
	return dexterity_mod
