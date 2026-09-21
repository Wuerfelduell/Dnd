## Simple enemy brain: pick the nearest hostile → move into reach → attack.
##
## Uses only the public [CombatManager] API, i.e. exactly what the player can
## do, so the AI can never cheat the rules. Also used by the headless autoplay
## test to play the hero's turns.
class_name EnemyAI
extends RefCounted


func take_turn(actor: Actor, combat: CombatManager) -> void:
	await GameState.wait(0.5)
	var target := Targeting.nearest_hostile(actor, combat.participants)
	if target == null:
		return
	var attack := _choose_attack(actor, target)
	if attack == null:
		return

	# 1. Already in range? Attack right away.
	if attack.can_target(actor, target):
		await combat.perform_action(actor, attack, target)
		return

	# 2. Move into range, dashing first if the plain movement can't reach.
	var needed := _distance_needed(actor, target, attack, combat)
	if needed > actor.turn_state.movement_remaining:
		var dash := actor.find_action(&"dash")
		if dash != null and dash.is_available(actor) and needed <= actor.turn_state.movement_remaining + actor.speed_m():
			await combat.perform_action(actor, dash, null)
	await combat.move_actor(actor, Targeting.approach_point(actor, target, attack.range_m, combat.participants))
	await GameState.wait(0.2)

	# 3. Attack if we made it (and still have the action; Dash costs it).
	if not combat.is_active:
		return
	if attack.can_target(actor, target):
		if attack.is_available(actor):
			await combat.perform_action(actor, attack, target)
		else:
			EventBus.log("%s closes in on %s." % [actor.display_name(), target.display_name()])
	else:
		EventBus.log("%s can't reach %s this turn." % [actor.display_name(), target.display_name()])


## Prefer a melee attack when adjacent, otherwise the longest-range attack that
## is still usable; enemies in this prototype only have melee weapons anyway.
func _choose_attack(actor: Actor, target: Actor) -> AttackAction:
	var best: AttackAction = null
	for action in actor.actions:
		if action is AttackAction and action.is_available(actor):
			if action.can_target(actor, target):
				return action
			if best == null or action.range_m > best.range_m:
				best = action
	return best


func _distance_needed(actor: Actor, target: Actor, attack: AttackAction, combat: CombatManager) -> float:
	var point := Targeting.approach_point(actor, target, attack.range_m, combat.participants)
	var path := CombatMovement.find_path(combat_map(actor), actor.global_position, point)
	return CombatMovement.path_length(path)


static func combat_map(actor: Actor) -> RID:
	if actor.is_inside_tree():
		return actor.get_world_3d().navigation_map
	return RID()
