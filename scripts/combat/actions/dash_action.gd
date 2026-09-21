## Dash: gain movement equal to the speed. Normally an Action; Rogues get it
## as a bonus action (Cunning Action).
class_name DashAction
extends CombatAction


func _init(p_cost: Cost = Cost.ACTION) -> void:
	cost = p_cost
	id = &"dash" if p_cost == Cost.ACTION else &"dash_bonus"
	display_name = "Dash" if p_cost == Cost.ACTION else "Cunning Dash"
	target_kind = TargetKind.NONE
	tag = "+move"


func execute(actor: Actor, _target: Actor, _point: Vector3 = Vector3.ZERO) -> void:
	actor.turn_state.add_movement(actor.speed_m())
	EventBus.log("[b]%s[/b] dashes (+%.1f m movement)." % [actor.display_name(), actor.speed_m()])
	await GameState.wait(0.2)


func description(actor: Actor) -> String:
	return "%s (%s): gain %.1f m of extra movement this turn" % [display_name, cost_name(), actor.speed_m()]
