## Base class for turn-taking brains. Everything goes through the public
## [CombatManager] API, so an AI can never do what a player couldn't.
class_name CombatAI
extends RefCounted


## Override: play the whole turn for [param actor]. Do not end the turn.
func take_turn(_actor: Actor, _combat: CombatManager) -> void:
	pass


# --- Shared helpers ------------------------------------------------------

func hostiles(actor: Actor, combat: CombatManager) -> Array[Actor]:
	return Targeting.living_hostiles(actor, combat.participants)


func allies(actor: Actor, combat: CombatManager) -> Array[Actor]:
	var out: Array[Actor] = []
	for a in combat.participants:
		if a != actor and not actor.is_hostile_to(a):
			out.append(a)
	return out


func nearest_hostile(actor: Actor, combat: CombatManager) -> Actor:
	return Targeting.nearest_hostile(actor, combat.participants)


func adjacent_hostiles(actor: Actor, combat: CombatManager) -> Array[Actor]:
	var out: Array[Actor] = []
	for h in hostiles(actor, combat):
		if actor.distance_to(h) <= Actor.MELEE_REACH + 0.001:
			out.append(h)
	return out


func action(actor: Actor, action_id: StringName) -> CombatAction:
	return actor.find_action(action_id)


func usable(actor: Actor, action_id: StringName) -> bool:
	var a := actor.find_action(action_id)
	return a != null and a.is_available(actor)


## Casts / uses an action if it is available and (when needed) can hit the target.
func try_use(actor: Actor, combat: CombatManager, action_id: StringName, target: Actor = null) -> bool:
	var a := actor.find_action(action_id)
	if a == null or not a.is_available(actor):
		return false
	if a.requires_target() and not a.can_target(actor, target):
		return false
	return await combat.perform_action(actor, a, target)


## Uses a POINT action at [param point] if available and in range.
func try_use_at(actor: Actor, combat: CombatManager, action_id: StringName, point: Vector3) -> bool:
	var a := actor.find_action(action_id)
	if a == null or not a.is_available(actor) or not a.can_target_point(actor, point):
		return false
	return await combat.perform_action(actor, a, null, point)


## Best spot for an area spell: the hostile whose surroundings contain the most
## hostiles and no allies. Returns {"point": Vector3, "count": int} or {} if none.
func best_area_point(actor: Actor, combat: CombatManager, spell: SpellData, min_targets: int) -> Dictionary:
	var best := {}
	var best_count := min_targets - 1
	for h in hostiles(actor, combat):
		if actor.global_position.distance_to(h.global_position) > spell.range_m:
			continue
		var count := 0
		var ally_hit := false
		for other in combat.participants:
			if not other.is_alive() or not SpellResolver.point_hits(h.global_position, spell.area_radius_m, other):
				continue
			if actor.is_hostile_to(other):
				count += 1
			elif spell.area_affects_allies:
				ally_hit = true
		if ally_hit or count <= best_count:
			continue
		best_count = count
		best = {"point": h.global_position, "count": count}
	return best


## First available weapon attack that can hit [param target] now, preferring
## melee when adjacent; null if none. [param fallback] receives the best
## attack to walk into range for.
func attack_for(actor: Actor, target: Actor) -> Dictionary:
	var ready: AttackAction = null
	var fallback: AttackAction = null
	for a in actor.actions:
		if a is AttackAction and a.is_available(actor):
			if a.can_target(actor, target):
				if ready == null or (not a.weapon.is_ranged and ready.weapon.is_ranged):
					ready = a
			if fallback == null or (not a.weapon.is_ranged and fallback.weapon.is_ranged):
				fallback = a
	return {"ready": ready, "fallback": fallback}


## Walks into reach of [param target] for [param attack] (dashing first if needed).
func approach(actor: Actor, combat: CombatManager, target: Actor, attack: CombatAction) -> void:
	var point := Targeting.approach_point(actor, target, attack.range_m, combat.participants)
	var needed := CombatMovement.path_length(CombatMovement.plan(actor, point, combat.participants))
	if needed > actor.turn_state.movement_remaining:
		for dash_id in [&"dash_bonus", &"dash"]:
			if usable(actor, dash_id) and needed <= actor.turn_state.movement_remaining + actor.speed_m():
				await combat.perform_action(actor, actor.find_action(dash_id), null)
				break
	await combat.move_actor(actor, point)
	await GameState.wait(0.2)


## Move [param distance] meters away from [param threat] (kiting).
func retreat_from(actor: Actor, combat: CombatManager, threat: Actor, distance: float) -> void:
	var away := (actor.global_position - threat.global_position)
	away.y = 0.0
	if away.length_squared() < 0.001:
		away = Vector3.BACK
	var point := actor.global_position + away.normalized() * distance
	await combat.move_actor(actor, point)


## Standard melee/ranged behaviour: attack if possible, otherwise close in.
func attack_or_approach(actor: Actor, combat: CombatManager, target: Actor) -> bool:
	if target == null:
		return false
	var options := attack_for(actor, target)
	var ready: AttackAction = options["ready"]
	if ready != null:
		await combat.perform_action(actor, ready, target)
		return true
	var fallback: AttackAction = options["fallback"]
	if fallback == null:
		return false
	await approach(actor, combat, target, fallback)
	if not combat.is_active:
		return false
	if fallback.can_target(actor, target) and fallback.is_available(actor):
		await combat.perform_action(actor, fallback, target)
		return true
	if fallback.is_available(actor):
		EventBus.log("%s can't reach %s this turn." % [actor.display_name(), target.display_name()])
	else:
		EventBus.log("%s closes in on %s." % [actor.display_name(), target.display_name()])
	return false


static func nav_map(actor: Actor) -> RID:
	if actor.is_inside_tree():
		return actor.get_world_3d().navigation_map
	return RID()
