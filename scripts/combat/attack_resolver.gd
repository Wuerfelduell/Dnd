## Pure rules: resolves an attack roll (d20 + bonus vs AC) and its damage.
##
## Reduced 5e:
## * natural 20 = automatic hit + doubled damage dice, natural 1 = automatic miss
## * advantage / disadvantage from conditions (prone, paralyzed, Guiding Bolt ...)
##   and from shooting while a hostile is adjacent; both cancel each other out
## * Bless adds 1d4 to the attack roll
## * hits from within 1.5 m against a paralyzed creature are critical
## * Sneak Attack once per turn with a finesse/ranged weapon when the attacker
##   has advantage or an ally is adjacent to the target (and no disadvantage)
class_name AttackResolver
extends RefCounted


static func resolve(attacker: Actor, target: Actor, profile: AttackProfile, others: Array[Actor] = []) -> AttackResult:
	var result := AttackResult.new()
	result.label = profile.label
	result.damage_type = profile.damage_type
	result.target_ac = target.armor_class()

	var melee_adjacent := not profile.is_ranged and attacker.distance_to(target) <= 1.5 + 0.001

	# --- advantage / disadvantage sources ---------------------------------
	if target.status_flag("attacks_against_advantage"):
		result.advantage_reasons.append(target.status_names_with_flag("attacks_against_advantage"))
	if melee_adjacent and target.status_flag("melee_attacks_against_advantage"):
		result.advantage_reasons.append(target.status_names_with_flag("melee_attacks_against_advantage"))
	if attacker.status_flag("attacks_disadvantage"):
		result.disadvantage_reasons.append(attacker.status_names_with_flag("attacks_disadvantage"))
	if profile.is_ranged and target.status_flag("ranged_attacks_against_disadvantage"):
		result.disadvantage_reasons.append(target.status_names_with_flag("ranged_attacks_against_disadvantage"))
	if profile.is_ranged and _hostile_adjacent(attacker, others):
		result.disadvantage_reasons.append("enemy adjacent")
	if attacker.data.has_pack_tactics and _ally_adjacent_to(target, attacker, others):
		result.advantage_reasons.append("Pack Tactics")
	var mode := Dice.combine_modes(not result.advantage_reasons.is_empty(), not result.disadvantage_reasons.is_empty())

	# --- attack roll -------------------------------------------------------
	result.attack_roll = Dice.d20(profile.attack_bonus, mode)
	var bless := attacker.status_bonus_dice("attack_bonus_dice")
	for label in bless:
		result.attack_roll.add_extra(Dice.parse(bless[label]), label)
	var natural := result.attack_roll.natural()
	result.critical = natural == 20
	result.fumble = natural == 1
	if melee_adjacent and target.status_flag("auto_crit_melee_against") and not result.fumble:
		result.critical = true
	if result.critical:
		result.hit = true
	elif result.fumble:
		result.hit = false
	else:
		result.hit = result.attack_roll.total() >= result.target_ac

	# Effects that only last until the next attack roll against the target (Guiding Bolt).
	target.consume_statuses_on_attacked()

	# --- damage ------------------------------------------------------------
	if result.hit:
		result.damage_roll = Dice.parse(profile.damage_dice, profile.damage_bonus)
		if result.critical:
			var extra := Dice.parse(profile.damage_dice, 0)
			result.damage_roll.rolls.append_array(extra.rolls)
			result.damage_roll.count += extra.count
		if _sneak_attack_applies(attacker, target, profile, mode, others):
			result.sneak_roll = Dice.parse(attacker.data.sneak_attack_dice)
			if result.critical:
				var extra_sneak := Dice.parse(attacker.data.sneak_attack_dice)
				result.sneak_roll.rolls.append_array(extra_sneak.rolls)
				result.sneak_roll.count += extra_sneak.count
			attacker.turn_state.sneak_attack_used = true
		result.damage_total = maxi(1, result.damage_roll.total() + (result.sneak_roll.total() if result.sneak_roll else 0))
	if profile.is_weapon and profile.weapon != null and profile.weapon.is_light:
		attacker.turn_state.attacked_with_light_weapon = true
	return result


static func _hostile_adjacent(actor: Actor, others: Array[Actor]) -> bool:
	for other in others:
		if other != actor and other.is_alive() and not other.is_incapacitated() \
				and actor.is_hostile_to(other) and actor.distance_to(other) <= 1.5 + 0.001:
			return true
	return false


static func _ally_adjacent_to(target: Actor, attacker: Actor, others: Array[Actor]) -> bool:
	for other in others:
		if other != attacker and other != target and other.is_alive() and not other.is_incapacitated() \
				and not attacker.is_hostile_to(other) and other.distance_to(target) <= 1.5 + 0.001:
			return true
	return false


static func _sneak_attack_applies(attacker: Actor, target: Actor, profile: AttackProfile, mode: DiceResult.Mode, others: Array[Actor]) -> bool:
	if attacker.data.sneak_attack_dice == "" or not profile.sneak_eligible:
		return false
	if attacker.turn_state.sneak_attack_used:
		return false
	if mode == DiceResult.Mode.DISADVANTAGE:
		return false
	return mode == DiceResult.Mode.ADVANTAGE or _ally_adjacent_to(target, attacker, others)
