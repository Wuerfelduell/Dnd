## Detection radius of an enemy: notices the party during exploration.
##
## A creature is noticed when it is inside the radius, in line of sight and
## either lit or very close: in the dark the radius shrinks to
## [constant Lighting.SHADOW_PERCEPTION_FACTOR] of its size, so the party can
## sneak up on a camp by staying out of the torchlight.
class_name EnemyPerception
extends Area3D

@onready var owner_actor: Actor = get_parent()

## Real detection radius; overlap reports can be stale right after teleports.
@export var radius_m: float = 8.5


func _ready() -> void:
	owner_actor.downed.connect(func(_a): set_deferred("monitoring", false))


## Would this enemy notice [param target] right now?
func can_notice(target: Actor) -> bool:
	if not target.is_alive():
		return false
	var reach := radius_m
	if Lighting.is_in_shadow(target):
		reach *= Lighting.SHADOW_PERCEPTION_FACTOR
	if owner_actor.center_distance_to(target) > reach:
		return false
	return Visibility.has_line_of_sight(owner_actor, target)


## Polled every physics tick (not via body_entered: raycasts are not allowed
## inside the physics callbacks, and the party might already be inside the
## radius when a fight ends).
func _physics_process(_delta: float) -> void:
	if not GameState.is_exploring() or not owner_actor.is_alive() or not monitoring:
		return
	for body in get_overlapping_bodies():
		if body is Actor and body.is_player() and can_notice(body):
			EventBus.enemy_spotted.emit(owner_actor)
			return
