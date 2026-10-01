## Control of the player's actor during exploration.
##
## Two ways to move: WASD (camera relative) or tap/click on the ground, which
## walks there along the navigation mesh (touch friendly). Tapping a chest or a
## bystander walks up to it and interacts on arrival (loot / talk). Disabled in
## combat; combat movement is turn-based and handled by [PlayerCombatInput] +
## [CombatManager].
class_name PlayerController
extends Node

@export var walk_speed: float = 6.0

## Tests can steer the character without real input events.
var debug_direction: Vector3 = Vector3.ZERO

var _pending_tap: bool = false
var _steering: bool = false
## What the leader walks towards to interact with: a [LootChest] or a neutral [Actor].
var _target_chest: LootChest = null
var _target_npc: Actor = null
## How close the leader has to be to talk to somebody (across a bar counter).
const TALK_DISTANCE := 3.2
## Where the leader aims when walking up to somebody: this far from them, on
## the leader's side (keeps the counter between the innkeeper and the party).
const TALK_APPROACH := 2.2
var _pending_tap_position: Vector2 = Vector2.ZERO

@onready var actor: Actor = get_parent()


func _ready() -> void:
	actor.add_to_group("player")
	actor.add_to_group("party")
	actor.add_to_group("party_leader")
	actor.move_speed = walk_speed


func _unhandled_input(event: InputEvent) -> void:
	if not GameState.is_exploring() or actor.is_down:
		return
	if ScreenRaycast.is_tap(event):
		_pending_tap = true
		_pending_tap_position = event.position
		get_viewport().set_input_as_handled()


func _physics_process(delta: float) -> void:
	if not GameState.is_exploring() or actor.is_down:
		_pending_tap = false
		return
	if _pending_tap:
		_pending_tap = false
		_walk_to_tap()
	var dir := _input_direction()
	if dir.length_squared() > 0.0001:
		# Direct input overrides a running tap-to-move.
		actor.stop_moving()
		actor.face_direction(dir)
		actor.walk(dir.normalized() * walk_speed, delta)
		actor.play_action("run")
		_steering = true
	elif not actor.is_moving():
		actor.velocity = Vector3.ZERO
		if _steering:
			_steering = false
			actor.play_action("idle")
		if _target_chest != null:
			_arrive_at_chest()
		elif _target_npc != null:
			_arrive_at_npc()


func _walk_to_tap() -> void:
	var camera := get_viewport().get_camera_3d()
	var hit := ScreenRaycast.pick(camera, _pending_tap_position)
	if hit.is_empty():
		return
	var destination: Vector3 = hit["position"]
	var clicked: Actor = hit.get("actor")
	if clicked != null and clicked.is_neutral():
		# Tapping a bystander walks up and starts the conversation.
		walk_to_npc(clicked)
		return
	if clicked != null:
		# Tapping an enemy walks towards it; the encounter starts on its own.
		destination = clicked.global_position
	var chest := hit.get("collider") as LootChest
	walk_to(destination, chest)


## Walks to [param destination]; with a [param chest] the leader opens it on arrival.
func walk_to(destination: Vector3, chest: LootChest = null) -> void:
	_target_chest = chest
	_target_npc = null
	if chest != null:
		if chest.within_reach(actor):
			_arrive_at_chest()
			return
		destination = chest.global_position
	_walk(destination)


## Walks up to [param npc] and emits [signal EventBus.npc_reached] on arrival.
func walk_to_npc(npc: Actor) -> void:
	_target_chest = null
	_target_npc = npc
	if npc_within_reach(npc):
		_arrive_at_npc()
		return
	var towards := actor.global_position - npc.global_position
	towards.y = 0.0
	if towards.length() < 0.1:
		towards = Vector3.BACK
	_walk(npc.global_position + towards.normalized() * TALK_APPROACH)


func npc_within_reach(npc: Actor) -> bool:
	return npc != null and actor.distance_to(npc) <= TALK_DISTANCE


func _walk(destination: Vector3) -> void:
	var others: Array[Actor] = []
	for n in get_tree().get_nodes_in_group("actors"):
		if n is Actor and n != actor:
			others.append(n)
	var path := CombatMovement.plan(actor, destination, others)
	actor.stop_moving()
	actor.move_along_path(path, INF)


func _arrive_at_chest() -> void:
	var chest := _target_chest
	_target_chest = null
	if chest != null and chest.within_reach(actor):
		actor.face_direction(chest.global_position - actor.global_position)
		actor.play_action("interact")
		EventBus.chest_reached.emit(chest)


func _arrive_at_npc() -> void:
	var npc := _target_npc
	_target_npc = null
	if npc == null:
		return
	if npc_within_reach(npc):
		actor.face_actor(npc)
		npc.face_actor(actor)
		EventBus.npc_reached.emit(npc)
	else:
		EventBus.log("[color=gray]%s cannot get close enough to %s.[/color]" % [actor.display_name(), npc.display_name()])


func _input_direction() -> Vector3:
	if debug_direction.length_squared() > 0.0001:
		return debug_direction
	var input := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	if input.length_squared() < 0.0001:
		var joystick := get_tree().get_first_node_in_group("virtual_joystick") as HudJoystick
		if joystick != null:
			input = joystick.direction
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
