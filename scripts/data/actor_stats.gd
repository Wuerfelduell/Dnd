## Base statistics of a creature (reduced D&D 5e style).
##
## Only what the prototype needs; more abilities / saves / skills can be added
## here later without touching combat code that only asks for modifiers.
class_name ActorStats
extends Resource

@export var max_hp: int = 10
@export var armor_class: int = 10
@export var strength_mod: int = 0
@export var dexterity_mod: int = 0
@export var constitution_mod: int = 0
@export var proficiency_bonus: int = 2
## Movement per turn in meters (5e: 30 ft ≈ 9 m).
@export var speed_m: float = 9.0


func ability_mod(ability: String) -> int:
	match ability.to_lower():
		"str", "strength":
			return strength_mod
		"dex", "dexterity":
			return dexterity_mod
		"con", "constitution":
			return constitution_mod
	push_warning("Unknown ability '%s'" % ability)
	return 0


func initiative_bonus() -> int:
	return dexterity_mod
