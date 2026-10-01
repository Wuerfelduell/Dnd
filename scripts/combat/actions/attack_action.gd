## Attack with a weapon (melee or ranged). Costs the Action; creatures with
## Extra Attack / Multiattack get [member ActorData.attacks_per_action] swings.
class_name AttackAction
extends CombatAction

var weapon: WeaponData


func _init(p_weapon: WeaponData) -> void:
	weapon = p_weapon
	id = StringName("attack_" + weapon.display_name.to_lower().replace(" ", "_"))
	display_name = weapon.display_name
	cost = Cost.ACTION
	target_kind = TargetKind.ENEMY
	range_m = weapon.range_m
	tag = "%s%+d" % [weapon.damage_dice, 0]


func is_available(actor: Actor) -> bool:
	if actor.is_incapacitated() or not actor.has_ammo(weapon):
		return false
	return actor.turn_state.attacks_remaining > 0 or actor.turn_state.can_pay(Cost.ACTION)


func unavailable_reason(actor: Actor) -> String:
	if actor.is_incapacitated():
		return "Incapacitated"
	if not actor.has_ammo(weapon):
		return "No %s left" % weapon.ammo_name
	if actor.turn_state.attacks_remaining <= 0 and not actor.turn_state.can_pay(Cost.ACTION):
		return "Action already used"
	return ""


func tag_for(actor: Actor) -> String:
	if weapon.uses_ammo:
		return "%s · %d %s" % [weapon.damage_dice, actor.ammo_left(weapon), weapon.ammo_name]
	return weapon.damage_dice


func pay_cost(actor: Actor) -> bool:
	if actor.turn_state.attacks_remaining <= 0:
		if not actor.turn_state.spend(Cost.ACTION):
			return false
		actor.turn_state.attacks_remaining = maxi(1, actor.data.attacks_per_action)
	actor.turn_state.attacks_remaining -= 1
	return true


func can_target(actor: Actor, target: Actor) -> bool:
	if target == null or target == actor:
		return false
	if not target.is_alive() or not actor.is_hostile_to(target):
		return false
	return in_range(actor, target) and can_see(actor, target)


func is_ranged() -> bool:
	return weapon.is_ranged


func uses_attack_roll() -> bool:
	return true


func execute(actor: Actor, target: Actor, _point: Vector3 = Vector3.ZERO) -> void:
	await perform_attack(actor, target, weapon, "attacks")


## Shared by regular, off-hand and opportunity attacks.
static func perform_attack(actor: Actor, target: Actor, p_weapon: WeaponData, verb: String, add_damage_bonus: bool = true) -> AttackResult:
	actor.face_actor(target)
	actor.spend_ammo(p_weapon)
	actor.play_action("ranged" if p_weapon.is_ranged else "attack")
	var others := CombatContext.actors_near(actor)
	var profile := AttackProfile.from_weapon(actor, p_weapon, add_damage_bonus)
	var result := AttackResolver.resolve(actor, target, profile, others, CombatSituation.assess(actor, target))
	var line := "[b]%s[/b] %s [b]%s[/b] with %s: %s vs AC %d = [b]%s[/b]%s" % [
		actor.display_name(), verb, target.display_name(), p_weapon.display_name,
		result.attack_roll.describe(), result.target_ac, result.outcome_text(), result.mode_text()]
	if result.hit:
		line += ". Damage %s" % result.damage_roll.describe()
		if result.sneak_roll != null:
			line += " + Sneak Attack %s" % result.sneak_roll.describe()
		if result.damage_total != result.damage_roll.total() + (result.sneak_roll.total() if result.sneak_roll else 0):
			line += " (min 1)"
	EventBus.log(line)
	EventBus.attack_resolved.emit(actor, target, result)
	if result.hit:
		target.take_damage(result.damage_total, p_weapon.damage_type)
		if not target.is_alive():
			EventBus.log("[color=orange][b]%s[/b] goes down![/color]" % target.display_name())
		elif p_weapon.on_hit_status != null and p_weapon.on_hit_save_ability != "":
			var save := SavingThrow.resolve(target, p_weapon.on_hit_save_ability, p_weapon.on_hit_save_dc, p_weapon.display_name)
			EventBus.log("%s resists %s: %s" % [target.display_name(), p_weapon.on_hit_status.display_name, save.describe()])
			if not save.success:
				target.add_status(p_weapon.on_hit_status, actor, p_weapon.on_hit_status_rounds)
				EventBus.log("[color=orange]%s is %s![/color]" % [target.display_name(), p_weapon.on_hit_status.display_name])
	await GameState.wait(0.9)
	return result


func description(actor: Actor) -> String:
	var kind := "ranged" if weapon.is_ranged else "melee"
	var extra := ""
	if weapon.is_finesse:
		extra += ", finesse"
	if weapon.is_light:
		extra += ", light"
	return "%s (%s%s, %s): 1d20%+d vs AC, %s%+d %s, range %.1f m" % [
		display_name, kind, extra, cost_name(), actor.attack_bonus(weapon),
		weapon.damage_dice, actor.damage_bonus(weapon), weapon.damage_type, range_m]
