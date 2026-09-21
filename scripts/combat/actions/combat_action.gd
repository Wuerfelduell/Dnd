## Base class for everything an actor can do on its turn.
##
## Subclasses override [method can_target] / [method execute]. Paying the cost
## and validating whose turn it is happens in [CombatManager], so actions stay
## small rule objects that are easy to add (spells, abilities, items ...).
class_name CombatAction
extends RefCounted

enum Cost { ACTION, BONUS_ACTION, FREE }

var id: StringName = &"action"
var display_name: String = "Action"
var cost: Cost = Cost.ACTION
var requires_target: bool = false
## Only meaningful when [member requires_target] is true.
var range_m: float = 0.0


func cost_name() -> String:
	match cost:
		Cost.ACTION:
			return "Action"
		Cost.BONUS_ACTION:
			return "Bonus Action"
	return "Free"


## True when the actor still has the resources / charges for this action.
func is_available(actor: Actor) -> bool:
	return actor.turn_state.can_pay(cost)


## Explanation for the UI why the action is unavailable (empty string = usable).
func unavailable_reason(actor: Actor) -> String:
	if not actor.turn_state.can_pay(cost):
		return "%s already used" % cost_name()
	return ""


## Whether [param target] is a legal target right now (range, faction, alive...).
func can_target(_actor: Actor, _target: Actor) -> bool:
	return not requires_target


## Performs the action. May await for presentation pacing.
## The cost has already been paid when this is called.
func execute(_actor: Actor, _target: Actor) -> void:
	pass


## Short text for tooltips / the action bar.
func description(_actor: Actor) -> String:
	return display_name
