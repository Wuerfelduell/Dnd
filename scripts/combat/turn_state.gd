## Per-turn resources of an actor: action(s), bonus action, reaction, movement.
class_name TurnState
extends RefCounted

var actions_remaining: int = 0
var bonus_actions_remaining: int = 0
var reaction_available: bool = false
var movement_remaining: float = 0.0
var movement_total: float = 0.0
## Weapon attacks still owed by the current Attack action (Extra Attack).
var attacks_remaining: int = 0
## Sneak Attack is once per turn.
var sneak_attack_used: bool = false
## Two-weapon fighting requires an attack with a light weapon first.
var attacked_with_light_weapon: bool = false


func begin_turn(speed_m: float) -> void:
	actions_remaining = 1
	bonus_actions_remaining = 1
	reaction_available = true
	movement_remaining = speed_m
	movement_total = speed_m
	attacks_remaining = 0
	sneak_attack_used = false
	attacked_with_light_weapon = false


func clear() -> void:
	actions_remaining = 0
	bonus_actions_remaining = 0
	movement_remaining = 0.0
	attacks_remaining = 0


var action_available: bool:
	get:
		return actions_remaining > 0

var bonus_action_available: bool:
	get:
		return bonus_actions_remaining > 0


func can_pay(cost: CombatAction.Cost) -> bool:
	match cost:
		CombatAction.Cost.ACTION:
			return actions_remaining > 0
		CombatAction.Cost.BONUS_ACTION:
			return bonus_actions_remaining > 0
		CombatAction.Cost.REACTION:
			return reaction_available
	return true


## Pays the cost. Returns false (and changes nothing) if it can't be paid.
func spend(cost: CombatAction.Cost) -> bool:
	if not can_pay(cost):
		return false
	match cost:
		CombatAction.Cost.ACTION:
			actions_remaining -= 1
			attacks_remaining = 0
		CombatAction.Cost.BONUS_ACTION:
			bonus_actions_remaining -= 1
		CombatAction.Cost.REACTION:
			reaction_available = false
	return true


func spend_movement(distance: float) -> void:
	movement_remaining = maxf(0.0, movement_remaining - distance)


func add_movement(distance: float) -> void:
	movement_remaining += distance
	movement_total += distance
