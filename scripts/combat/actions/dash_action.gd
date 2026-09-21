## Dash: spend the Action to gain movement equal to the speed.
class_name DashAction
extends CombatAction


func _init() -> void:
	id = &"dash"
	display_name = "Dash"
	cost = Cost.ACTION
	requires_target = false


func execute(actor: Actor, _target: Actor) -> void:
	actor.turn_state.add_movement(actor.speed_m())
	EventBus.log("[b]%s[/b] dashes (+%.1f m movement)." % [actor.display_name(), actor.speed_m()])
	await GameState.wait(0.2)


func description(actor: Actor) -> String:
	return "Dash (%s): gain %.1f m of extra movement this turn" % [cost_name(), actor.speed_m()]
