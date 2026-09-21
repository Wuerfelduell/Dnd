## Makes a party member trail the leader during exploration.
class_name PartyFollower
extends Node

## Position relative to the leader's facing (x right, z behind).
@export var formation_offset: Vector3 = Vector3(-1.5, 0.0, 1.5)
@export var follow_speed: float = 6.5
@export var replan_interval: float = 0.3

var _replan_timer: float = 0.0

@onready var actor: Actor = get_parent()


func _ready() -> void:
	actor.add_to_group("party")
	actor.move_speed = follow_speed


func _physics_process(delta: float) -> void:
	if not GameState.is_exploring() or actor.is_down:
		return
	var leader := get_tree().get_first_node_in_group("party_leader") as Actor
	if leader == null or leader.is_down:
		return
	var goal := leader.global_position + leader.global_transform.basis * formation_offset
	goal.y = actor.global_position.y
	var distance := actor.global_position.distance_to(goal)
	_replan_timer -= delta
	if distance > 1.2:
		if _replan_timer <= 0.0:
			_replan_timer = replan_interval
			var path := CombatMovement.find_path(actor.get_world_3d().navigation_map, actor.global_position, goal)
			actor.move_along_path(path, INF)
	elif distance <= 0.6 and actor.is_moving():
		actor.stop_moving()
