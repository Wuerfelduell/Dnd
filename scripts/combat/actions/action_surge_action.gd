## Action Surge (Fighter): one additional Action this turn, once per combat.
class_name ActionSurgeAction
extends CombatAction

const FLAG := "action_surge_used"


func _init() -> void:
	id = &"action_surge"
	display_name = "Action Surge"
	cost = Cost.FREE
	target_kind = TargetKind.NONE
	tag = "1/combat"


func is_available(actor: Actor) -> bool:
	return super.is_available(actor) and not actor.combat_flags.get(FLAG, false)


func unavailable_reason(actor: Actor) -> String:
	if actor.combat_flags.get(FLAG, false):
		return "Already used this combat"
	return super.unavailable_reason(actor)


func execute(actor: Actor, _target: Actor, _point: Vector3 = Vector3.ZERO) -> void:
	actor.combat_flags[FLAG] = true
	actor.turn_state.actions_remaining += 1
	EventBus.log("[b]%s[/b] surges: one extra Action this turn!" % actor.display_name())
	await GameState.wait(0.2)


func description(_actor: Actor) -> String:
	return "Action Surge (free): gain one additional Action this turn, once per combat"
