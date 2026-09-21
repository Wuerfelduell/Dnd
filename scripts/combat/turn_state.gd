## Per-turn resources of an actor: one action, one bonus action, movement.
class_name TurnState
extends RefCounted

var action_available: bool = true
var bonus_action_available: bool = true
var movement_remaining: float = 0.0
var movement_total: float = 0.0


func begin_turn(speed_m: float) -> void:
	action_available = true
	bonus_action_available = true
	movement_remaining = speed_m
	movement_total = speed_m


func clear() -> void:
	action_available = false
	bonus_action_available = false
	movement_remaining = 0.0


func can_pay(cost: CombatAction.Cost) -> bool:
	match cost:
		CombatAction.Cost.ACTION:
			return action_available
		CombatAction.Cost.BONUS_ACTION:
			return bonus_action_available
	return true


## Pays the cost. Returns false (and changes nothing) if it can't be paid.
func spend(cost: CombatAction.Cost) -> bool:
	if not can_pay(cost):
		return false
	match cost:
		CombatAction.Cost.ACTION:
			action_available = false
		CombatAction.Cost.BONUS_ACTION:
			bonus_action_available = false
	return true


func spend_movement(distance: float) -> void:
	movement_remaining = maxf(0.0, movement_remaining - distance)


func add_movement(distance: float) -> void:
	movement_remaining += distance
	movement_total += distance
