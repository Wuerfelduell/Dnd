## Two-weapon fighting: bonus action attack with a light weapon after
## attacking with a light weapon this turn. No ability modifier on damage.
class_name OffhandAttackAction
extends CombatAction

var weapon: WeaponData


func _init(p_weapon: WeaponData) -> void:
	weapon = p_weapon
	id = StringName("offhand_" + weapon.display_name.to_lower().replace(" ", "_"))
	display_name = "Off-hand " + weapon.display_name
	cost = Cost.BONUS_ACTION
	target_kind = TargetKind.ENEMY
	range_m = weapon.range_m
	tag = weapon.damage_dice


func is_available(actor: Actor) -> bool:
	return super.is_available(actor) and actor.turn_state.attacked_with_light_weapon


func unavailable_reason(actor: Actor) -> String:
	var base := super.unavailable_reason(actor)
	if base != "":
		return base
	if not actor.turn_state.attacked_with_light_weapon:
		return "Attack with a light weapon first"
	return ""


func can_target(actor: Actor, target: Actor) -> bool:
	return target != null and target != actor and target.is_alive() \
		and actor.is_hostile_to(target) and in_range(actor, target)


func execute(actor: Actor, target: Actor) -> void:
	await AttackAction.perform_attack(actor, target, weapon, "strikes with the off-hand at", false)


func description(actor: Actor) -> String:
	return "%s (%s): 1d20%+d vs AC, %s (no ability bonus). Needs a light-weapon attack first." % [
		display_name, cost_name(), actor.attack_bonus(weapon), weapon.damage_dice]
