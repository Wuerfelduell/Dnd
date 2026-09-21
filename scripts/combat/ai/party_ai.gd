## Class-aware brain for party members. Used by the headless autoplay test
## and available as an "auto-battle" option: it exercises spells, slots,
## concentration, bonus actions, Sneak Attack and kiting (opportunity attacks).
class_name PartyAI
extends EnemyAI


func take_turn(actor: Actor, combat: CombatManager) -> void:
	await GameState.wait(0.3)
	match actor.data.class_name_text:
		"Fighter":
			await _fighter(actor, combat)
		"Rogue":
			await _rogue(actor, combat)
		"Wizard":
			await _wizard(actor, combat)
		"Cleric":
			await _cleric(actor, combat)
		_:
			await super.take_turn(actor, combat)


func _fighter(actor: Actor, combat: CombatManager) -> void:
	if actor.current_hp <= actor.max_hp() / 2:
		await try_use(actor, combat, &"second_wind")
	if combat.initiative.round_number == 1:
		await try_use(actor, combat, &"action_surge")
	var target := nearest_hostile(actor, combat)
	var swings := 0
	while combat.is_active and target != null and target.is_alive() and swings < 4:
		swings += 1
		var acted: bool = await attack_or_approach(actor, combat, target)
		if not acted or not actor.turn_state.action_available and actor.turn_state.attacks_remaining <= 0:
			break
		if not target.is_alive():
			target = nearest_hostile(actor, combat)


func _rogue(actor: Actor, combat: CombatManager) -> void:
	# Prefer a target an ally is already fighting (Sneak Attack).
	var target: Actor = null
	for h in hostiles(actor, combat):
		for ally in allies(actor, combat):
			if ally.is_alive() and ally.distance_to(h) <= Actor.MELEE_REACH + 0.001:
				target = h
				break
		if target != null:
			break
	if target == null:
		target = nearest_hostile(actor, combat)
	if target == null:
		return
	var sword := action(actor, &"attack_shortsword")
	if sword != null and not sword.can_target(actor, target):
		# Close in with Cunning Action Dash when needed, then stab.
		await approach(actor, combat, target, sword)
	if not combat.is_active:
		return
	await attack_or_approach(actor, combat, target)
	if target.is_alive():
		await try_use(actor, combat, &"offhand_dagger", target)


func _wizard(actor: Actor, combat: CombatManager) -> void:
	var adjacent := adjacent_hostiles(actor, combat)
	var target := nearest_hostile(actor, combat)
	if target == null:
		return
	var cast := false
	# Escape first if surrounded: Misty Step is a bonus action.
	if not adjacent.is_empty() and usable(actor, &"spell_misty_step"):
		var away := actor.global_position + (actor.global_position - adjacent[0].global_position).normalized() * 8.0
		if await try_use_at(actor, combat, &"spell_misty_step", away):
			adjacent = adjacent_hostiles(actor, combat)
	for area_id in [&"spell_fireball", &"spell_shatter"]:
		if cast or not usable(actor, area_id):
			continue
		var spell_action := action(actor, area_id) as SpellAction
		var spot := best_area_point(actor, combat, spell_action.spell, 2)
		if not spot.is_empty():
			cast = await try_use_at(actor, combat, area_id, spot["point"])
	if not cast and adjacent.size() >= 2 and usable(actor, &"spell_burning_hands"):
		cast = await try_use(actor, combat, &"spell_burning_hands")
	if not cast and usable(actor, &"spell_scorching_ray"):
		cast = await try_use(actor, combat, &"spell_scorching_ray", target)
	if not cast and usable(actor, &"spell_magic_missile"):
		cast = await try_use(actor, combat, &"spell_magic_missile", target)
	if not cast:
		cast = await try_use(actor, combat, &"spell_fire_bolt", target)
	if not cast:
		cast = await try_use(actor, combat, &"spell_ray_of_frost", target)
	if not cast:
		await attack_or_approach(actor, combat, target)
	# Kite: step away from adjacent enemies (this provokes opportunity attacks).
	if combat.is_active and actor.is_alive():
		adjacent = adjacent_hostiles(actor, combat)
		if not adjacent.is_empty() and actor.turn_state.movement_remaining > 1.0:
			await retreat_from(actor, combat, adjacent[0], 5.0)


func _cleric(actor: Actor, combat: CombatManager) -> void:
	# 1. Emergency healing with the bonus action.
	var hurt := _most_hurt_ally(actor, combat, 18.0, true)
	if hurt != null and (hurt.is_down or hurt.current_hp <= hurt.max_hp() * 0.35):
		var hurt_count := 0
		for a in allies(actor, combat):
			if a.is_down or a.current_hp <= a.max_hp() * 0.5:
				hurt_count += 1
		if hurt_count >= 2 and usable(actor, &"spell_mass_healing_word"):
			await try_use(actor, combat, &"spell_mass_healing_word")
		else:
			await try_use(actor, combat, &"spell_healing_word", hurt)
	# 2. Action: Bless on round 1, Hold Person on the biggest humanoid, Guiding Bolt, Sacred Flame.
	var target := nearest_hostile(actor, combat)
	var done := false
	if combat.initiative.round_number == 1 and actor.concentration_spell == null:
		done = await try_use(actor, combat, &"spell_bless")
	if not done and actor.concentration_spell == null:
		var big := _biggest_humanoid(actor, combat)
		if big != null:
			done = await try_use(actor, combat, &"spell_hold_person", big)
	if not done:
		var near_hurt := _most_hurt_ally(actor, combat, Actor.MELEE_REACH, false)
		if near_hurt != null and near_hurt.current_hp <= near_hurt.max_hp() * 0.5:
			done = await try_use(actor, combat, &"spell_cure_wounds", near_hurt)
	if not done and target != null:
		done = await try_use(actor, combat, &"spell_guiding_bolt", target)
	if not done and target != null:
		done = await try_use(actor, combat, &"spell_sacred_flame", target)
	if not done and target != null:
		await attack_or_approach(actor, combat, target)


func _most_hurt_ally(actor: Actor, combat: CombatManager, within_m: float, include_down: bool) -> Actor:
	var best: Actor = null
	var best_ratio := 1.0
	for a in combat.participants:
		if actor.is_hostile_to(a) or actor.distance_to(a) > within_m:
			continue
		if a.is_down and not include_down:
			continue
		var ratio := float(a.current_hp) / float(a.max_hp())
		if a.is_down:
			ratio = -1.0
		if ratio < best_ratio:
			best_ratio = ratio
			best = a
	return best


func _biggest_humanoid(actor: Actor, combat: CombatManager) -> Actor:
	var best: Actor = null
	for h in hostiles(actor, combat):
		if h.data.creature_type != "humanoid" or h.has_status(&"paralyzed") or actor.distance_to(h) > 18.0:
			continue
		if best == null or h.current_hp > best.current_hp:
			best = h
	return best
