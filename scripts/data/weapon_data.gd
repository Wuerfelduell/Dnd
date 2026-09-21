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
## Ability used for attack and damage rolls ("str" or "dex").
@export var ability: String = "str"
@export var is_ranged: bool = false
## Melee reach or normal ranged distance in meters (5 ft ≈ 1.5 m).
@export var range_m: float = 1.5
