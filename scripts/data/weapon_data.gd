## A weapon an actor can attack with.
##
## Attack bonus = ability modifier + proficiency, damage bonus = ability
## modifier (both derived from the wielder's [ActorStats]), so the same weapon
## resource works for any creature.
class_name WeaponData
extends Resource

@export var display_name: String = "Weapon"
## Dice notation for damage, e.g. "1d8".
@export var damage_dice: String = "1d6"
@export var damage_type: String = "slashing"
## Ability used for attack and damage rolls ("str" or "dex").
@export var ability: String = "str"
@export var is_ranged: bool = false
## Finesse / ranged weapons qualify for Sneak Attack.
@export var is_finesse: bool = false
## Light weapons can be used for the off-hand attack.
@export var is_light: bool = false
## Melee reach or normal ranged distance in meters (5 ft = 1.5 m).
@export var range_m: float = 1.5
## Optional rider on hit: the target must pass a saving throw or gains a status
## (e.g. a wolf's bite knocking the target prone).
@export var on_hit_save_ability: String = ""
@export var on_hit_save_dc: int = 0
@export var on_hit_status: StatusEffectData
@export var on_hit_status_rounds: int = 1


func qualifies_for_sneak_attack() -> bool:
	return is_ranged or is_finesse
