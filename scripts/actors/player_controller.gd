## Direct (WASD) control of the player's actor during exploration.
##
## Disabled automatically in combat; combat movement is turn-based and handled
## by [PlayerCombatInput] + [CombatManager].
class_name PlayerController
extends Node

@export var walk_speed: float = 6.0

## Tests can steer the character without real input events.
var debug_direction: Vector3 = Vector3.ZERO

@onready var actor: Actor = get_parent()


func _ready() -> void:
	actor.add_to_group("player")


func _physics_process(_delta: float) -> void:
	if not GameState.is_exploring() or actor.is_down or actor.is_moving():
		return
	var dir := _input_direction()
	if dir.length_squared() > 0.0001:
		actor.velocity = dir.normalized() * walk_speed
		actor.face_direction(dir)
	else:
		actor.velocity = Vector3.ZERO
	actor.velocity.y = 0.0
	actor.move_and_slide()
	actor.global_position.y = 0.0


func _input_direction() -> Vector3:
	if debug_direction.length_squared() > 0.0001:
		return debug_direction
	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	if input.length_squared() < 0.0001:
		return Vector3.ZERO
	# Camera-relative: forward is where the camera looks (flattened).
	var forward := Vector3.FORWARD
	var right := Vector3.RIGHT
	var rig := get_tree().get_first_node_in_group("camera_rig")
	if rig != null:
		var basis: Basis = rig.global_transform.basis
		forward = -basis.z
		forward.y = 0.0
		forward = forward.normalized()
		right = basis.x
		right.y = 0.0
		right = right.normalized()
	return right * input.x + forward * -input.y
