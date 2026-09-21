## Attack with a weapon (melee or ranged). Costs the Action.
class_name AttackAction
extends CombatAction

var weapon: WeaponData


func _init(p_weapon: WeaponData) -> void:
	weapon = p_weapon
	id = StringName("attack_" + weapon.display_name.to_lower().replace(" ", "_"))
	display_name = weapon.display_name
	cost = Cost.ACTION
	requires_target = true
	range_m = weapon.range_m


func can_target(actor: Actor, target: Actor) -> bool:
	if target == null or target == actor:
		return false
	if not target.is_alive() or not actor.is_hostile_to(target):
		return false
	return actor.distance_to(target) <= range_m


func execute(actor: Actor, target: Actor) -> void:
	actor.face_actor(target)
	var result := AttackResolver.resolve(actor, weapon, target)
	var line := "[b]%s[/b] attacks [b]%s[/b] with %s: %s vs AC %d = [b]%s[/b]" % [
		actor.display_name(), target.display_name(), weapon.display_name,
		result.attack_roll.describe(), result.target_ac, result.outcome_text()]
	if result.hit:
		line += ". Damage %s" % result.damage_roll.describe()
		if result.damage_total != result.damage_roll.total():
			line += " (min 1)"
	EventBus.log(line)
	EventBus.attack_resolved.emit(actor, target, result)
	if result.hit:
		target.take_damage(result.damage_total)
		if not target.is_alive():
			EventBus.log("[color=orange][b]%s[/b] goes down![/color]" % target.display_name())
	await GameState.wait(0.9)


func description(actor: Actor) -> String:
	var kind := "ranged" if weapon.is_ranged else "melee"
	return "%s (%s, %s): 1d20%+d vs AC, %s%+d damage, range %.1f m" % [
		display_name, kind, cost_name(), actor.attack_bonus(weapon),
		weapon.damage_dice, actor.damage_bonus(weapon), range_m]
