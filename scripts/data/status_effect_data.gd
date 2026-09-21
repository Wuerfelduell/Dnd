## Definition of a condition / buff / debuff (Blessed, Paralyzed, Prone ...).
##
## Purely declarative: the rules layer asks an [Actor] for the combined flags
## of all its active effects. Add a flag here, query it where it matters, done.
class_name StatusEffectData
extends Resource

@export var id: StringName = &"status"
@export var display_name: String = "Status"
## Short tag for labels, e.g. "BLS".
@export var short_name: String = "STS"
@export_multiline var description: String = ""
@export var tint: Color = Color(1, 1, 1, 1)

@export_group("Restrictions")
## No actions, bonus actions, reactions or movement.
@export var incapacitated: bool = false
## Paralyzed & co.: STR/DEX saves fail automatically.
@export var auto_fail_str_dex_saves: bool = false
## The affected creature's attack rolls have disadvantage (prone, poisoned).
@export var attacks_disadvantage: bool = false
## Movement bonus/malus in meters (Ray of Frost: -3).
@export var speed_delta_m: float = 0.0
@export var speed_multiplier: float = 1.0

@export_group("Being attacked")
## Every attack against the creature has advantage (paralyzed, unconscious).
@export var attacks_against_advantage: bool = false
## Melee attacks from within 1.5 m have advantage (prone).
@export var melee_attacks_against_advantage: bool = false
## Ranged attacks against the creature have disadvantage (prone).
@export var ranged_attacks_against_disadvantage: bool = false
## Melee hits from within 1.5 m are automatic critical hits (paralyzed).
@export var auto_crit_melee_against: bool = false
## The effect ends after the next attack roll against the creature (Guiding Bolt).
@export var consumed_on_attacked: bool = false

@export_group("Bonuses")
## Extra dice on attack rolls, e.g. "1d4" (Bless).
@export var attack_bonus_dice: String = ""
## Extra dice on saving throws, e.g. "1d4" (Bless).
@export var save_bonus_dice: String = ""
@export var armor_class_bonus: int = 0
## Enemies cannot make opportunity attacks against the creature (Disengage).
@export var immune_to_opportunity_attacks: bool = false

@export_group("Duration")
## At the end of each of its turns the creature may repeat this save to end the effect.
@export var repeat_save_ability: String = ""
## Ends automatically at the end of the affected creature's turn when 0 rounds remain.
@export var default_rounds: int = 1
