## Simple monster brain: pick the nearest hostile, attack (ranged if it has a
## bow and the target is not adjacent), otherwise close in and strike.
## Keeps attacking while Multiattack swings remain.
class_name EnemyAI
extends CombatAI


func take_turn(actor: Actor, combat: CombatManager) -> void:
	await GameState.wait(0.5)
	var target := choose_target(actor, combat)
	if target == null:
		return
	var swings := 0
	while combat.is_active and actor.is_alive() and target.is_alive() and swings < 4:
		swings += 1
		var options := attack_for(actor, target)
		if options["ready"] == null and options["fallback"] == null:
			break
		if options["ready"] == null and actor.turn_state.movement_remaining <= 0.05 and not usable(actor, &"dash"):
			break
		var acted: bool = await attack_or_approach(actor, combat, target)
		if not acted:
			break
		# Continue only when a Multiattack swing is still owed.
		if actor.turn_state.attacks_remaining <= 0:
			break
	await GameState.wait(0.3)


## Reachable targets first (already in range, then within one move), and among
## those the most vulnerable: low HP and low AC weigh more than distance.
func choose_target(actor: Actor, combat: CombatManager) -> Actor:
	var best: Actor = null
	var best_score := -INF
	var reach := actor.turn_state.movement_remaining + Actor.MELEE_REACH
	for h in hostiles(actor, combat):
		var options := attack_for(actor, h)
		var score := 0.0
		if options["ready"] != null:
			score += 100.0
		elif actor.distance_to(h) <= reach:
			score += 50.0
		score -= actor.distance_to(h) * 2.0
		score -= float(h.current_hp) * 1.5
		score -= float(h.armor_class()) * 2.0
		if h.is_incapacitated():
			score += 20.0
		# Someone standing in the dark is a poor target for a shot.
		if Lighting.is_in_shadow(h):
			score -= 12.0
		if score > best_score:
			best_score = score
			best = h
	return best
