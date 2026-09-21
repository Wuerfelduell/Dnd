## Detection radius of an enemy: notices the player during exploration.
class_name EnemyPerception
extends Area3D

@onready var owner_actor: Actor = get_parent()


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	owner_actor.downed.connect(func(_a): set_deferred("monitoring", false))


func _on_body_entered(body: Node3D) -> void:
	if not GameState.is_exploring() or not owner_actor.is_alive():
		return
	if body is Actor and body.is_player() and body.is_alive():
		EventBus.enemy_spotted.emit(owner_actor)


## Also re-check on every physics tick: the player might already be inside the
## radius when combat ends (no new body_entered would fire).
func _physics_process(_delta: float) -> void:
	if not GameState.is_exploring() or not owner_actor.is_alive() or not monitoring:
		return
	for body in get_overlapping_bodies():
		if body is Actor and body.is_player() and body.is_alive():
			EventBus.enemy_spotted.emit(owner_actor)
			return
