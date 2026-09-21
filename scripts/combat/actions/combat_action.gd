## Base class for everything an actor can do on its turn.
##
## Subclasses override [method can_target] / [method execute]. Paying the cost
## and validating whose turn it is happens in [CombatManager], so actions stay
## small rule objects that are easy to add (spells, abilities, items ...).
class_name CombatAction
extends RefCounted

enum Cost { ACTION, BONUS_ACTION, REACTION, FREE }

## What the player has to click after selecting the action.
enum TargetKind { NONE, ENEMY, ALLY, ANY, POINT }

var id: StringName = &"action"
var display_name: String = "Action"
var cost: Cost = Cost.ACTION
var target_kind: TargetKind = TargetKind.NONE
## Only meaningful when a target is required.
var range_m: float = 0.0
## Second line on the action button, e.g. "L1 3/4" or "cantrip".
var tag: String = ""


func requires_target() -> bool:
	return target_kind != TargetKind.NONE


func cost_name() -> String:
	match cost:
		Cost.ACTION:
			return "Action"
		Cost.BONUS_ACTION:
			return "Bonus"
		Cost.REACTION:
			return "Reaction"
	return "Free"


## True when the actor still has the resources / charges for this action.
func is_available(actor: Actor) -> bool:
	if actor.is_incapacitated():
		return false
	return actor.turn_state.can_pay(cost)


## Explanation for the UI why the action is unavailable (empty string = usable).
func unavailable_reason(actor: Actor) -> String:
	if actor.is_incapacitated():
		return "Incapacitated"
	if not actor.turn_state.can_pay(cost):
		return "%s already used" % cost_name()
	return ""


## Whether [param target] is a legal target right now (range, faction, alive...).
func can_target(_actor: Actor, _target: Actor) -> bool:
	return not requires_target()


## For POINT actions: is [param point] a legal target position?
func can_target_point(actor: Actor, point: Vector3) -> bool:
	if target_kind != TargetKind.POINT:
		return false
	return actor.global_position.distance_to(point) <= range_m + 0.05


func targets_point() -> bool:
	return target_kind == TargetKind.POINT


## Pays the cost. Overridden by actions with special economy (Extra Attack).
func pay_cost(actor: Actor) -> bool:
	return actor.turn_state.spend(cost)


## Performs the action. May await for presentation pacing.
## The cost has already been paid when this is called. [param point] is only
## meaningful for POINT actions.
func execute(_actor: Actor, _target: Actor, _point: Vector3 = Vector3.ZERO) -> void:
	pass


## Short text for tooltips / the action bar.
func description(_actor: Actor) -> String:
	return display_name


## Second button line; actions with live counters (ammo) override this.
func tag_for(_actor: Actor) -> String:
	return tag


## Helper: distance check between two actors for a targeted action.
func in_range(actor: Actor, target: Actor) -> bool:
	return actor.distance_to(target) <= range_m + 0.001
