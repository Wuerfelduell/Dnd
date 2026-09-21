## Definition of a spell (reduced 5e). Executed by [SpellAction] / [SpellResolver].
class_name SpellData
extends Resource

enum TargetKind {
	ENEMY,             ## one hostile creature within range
	ALLY,              ## one friendly creature (including self) within range
	ANY_CREATURE,      ## any creature within range
	SELF,              ## only the caster
	ALLIES_NEAR_SELF,  ## caster + nearest allies within [member area_radius_m] (max [member max_targets])
	ENEMIES_NEAR_SELF, ## all hostiles within [member area_radius_m] of the caster
}

enum AttackKind { NONE, SPELL_ATTACK, SAVE, AUTO_HIT }

@export var display_name: String = "Spell"
## 0 = cantrip (free), otherwise the slot level consumed.
@export var level: int = 0
@export var cost: CombatAction.Cost = CombatAction.Cost.ACTION
@export var target_kind: TargetKind = TargetKind.ENEMY
@export var range_m: float = 18.0
@export var area_radius_m: float = 0.0
@export var max_targets: int = 1
## Only creatures of this type are valid targets (e.g. "humanoid" for Hold Person). Empty = any.
@export var creature_type_filter: String = ""
@export var concentration: bool = false
@export_multiline var description: String = ""

@export_group("Effect")
@export var attack_kind: AttackKind = AttackKind.NONE
@export var save_ability: String = "dex"
@export var half_damage_on_save: bool = false
@export var damage_dice: String = ""
@export var damage_type: String = ""
## Repeat the attack/damage this many times (Magic Missile darts, Scorching Ray rays).
@export var repeat_count: int = 1
@export var heal_dice: String = ""
@export var heal_adds_casting_mod: bool = false
## Status applied to the target(s) on hit / failed save / always when attack_kind is NONE.
@export var applies_status: StatusEffectData
@export var status_rounds: int = 1


func is_cantrip() -> bool:
	return level == 0


func needs_single_target() -> bool:
	return target_kind in [TargetKind.ENEMY, TargetKind.ALLY, TargetKind.ANY_CREATURE]
