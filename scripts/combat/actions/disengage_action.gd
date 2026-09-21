## Disengage: no opportunity attacks against you until the end of your turn.
class_name DisengageAction
extends CombatAction

static var _status: StatusEffectData


func _init(p_cost: Cost = Cost.ACTION) -> void:
	cost = p_cost
	id = &"disengage" if p_cost == Cost.ACTION else &"disengage_bonus"
	display_name = "Disengage" if p_cost == Cost.ACTION else "Cunning Disengage"
	target_kind = TargetKind.NONE
	tag = "no OA"


static func status_data() -> StatusEffectData:
	if _status == null:
		_status = load("res://data/statuses/disengaging.tres")
	return _status


func execute(actor: Actor, _target: Actor, _point: Vector3 = Vector3.ZERO) -> void:
	actor.add_status(status_data(), actor, 0)
	EventBus.log("[b]%s[/b] disengages: no opportunity attacks this turn." % actor.display_name())
	await GameState.wait(0.2)


func description(_actor: Actor) -> String:
	return "%s (%s): your movement doesn't provoke opportunity attacks this turn" % [display_name, cost_name()]
