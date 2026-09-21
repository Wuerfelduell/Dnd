## Root of the test level: wires world, actors, combat manager, camera and HUD.
##
## Contains no rules. It decides *when* combat starts (an enemy spotted the
## player) and *who* participates (all living enemies close to the spotter).
class_name World
extends Node3D

## Enemies within this distance of the one who spotted the player join the fight.
@export var encounter_radius: float = 14.0

@onready var nav_region: NavigationRegion3D = $NavigationRegion3D
@onready var player: Actor = $Player
@onready var combat: CombatManager = $CombatManager
@onready var camera_rig: CameraRig = $CameraRig
@onready var combat_input: PlayerCombatInput = $PlayerCombatInput
@onready var movement_indicator: MeshInstance3D = $MovementIndicator
@onready var hud: CombatHud = $CombatHud

var _navmesh_ready: bool = false


func _ready() -> void:
	_bake_navmesh()
	camera_rig.set_follow_target(player)
	combat_input.setup(combat, camera_rig.camera)
	hud.setup(combat, combat_input, player, camera_rig)
	hud.restart_requested.connect(restart)

	EventBus.enemy_spotted.connect(_on_enemy_spotted)
	combat.turn_started.connect(_on_turn_started)
	combat.turn_ended.connect(_on_turn_ended)
	combat.state_updated.connect(_update_movement_indicator)
	combat.combat_ended.connect(_on_combat_ended)
	movement_indicator.visible = false

	EventBus.log("Explore with [b]WASD[/b], rotate camera with [b]Q/E[/b], zoom with the mouse wheel.")
	EventBus.log("Goblins lurk to the north. Combat starts when one of them notices you.")

	# Headless integration test hook (godot --headless -- --autoplay).
	# Loaded dynamically so the game does not depend on the tests folder.
	if OS.get_cmdline_user_args().has("--autoplay"):
		var script: GDScript = load("res://tests/autoplay.gd")
		if script != null:
			var autoplay: Node = script.new()
			autoplay.name = "Autoplay"
			add_child(autoplay)


func _bake_navmesh() -> void:
	# Runtime bake from the static colliders in the scene (placeholder level).
	nav_region.bake_navigation_mesh(false)
	_navmesh_ready = true


func actors() -> Array[Actor]:
	var out: Array[Actor] = []
	for n in get_tree().get_nodes_in_group("actors"):
		if n is Actor:
			out.append(n)
	return out


func _on_enemy_spotted(enemy: Actor) -> void:
	if not GameState.is_exploring() or combat.is_active:
		return
	var participants: Array[Actor] = [player]
	for a in actors():
		if a != player and a.is_alive() and not a.is_player() \
				and a.center_distance_to(enemy) <= encounter_radius:
			participants.append(a)
	EventBus.log("[b]%s[/b] spotted you!" % enemy.display_name())
	combat.start_combat(participants)


func _on_turn_started(actor: Actor) -> void:
	camera_rig.set_follow_target(actor)
	for a in actors():
		if a.visual:
			a.visual.set_active(a == actor)
	_update_movement_indicator()


func _on_turn_ended(actor: Actor) -> void:
	if actor.visual:
		actor.visual.set_active(false)
	movement_indicator.visible = false


func _on_combat_ended(_victory: bool) -> void:
	camera_rig.set_follow_target(player)
	for a in actors():
		if a.visual:
			a.visual.set_active(false)
			a.visual.set_targetable(false)
	movement_indicator.visible = false


func _update_movement_indicator() -> void:
	var actor := combat.active_actor
	if not combat.is_active or actor == null or not actor.is_player():
		movement_indicator.visible = false
		return
	var radius := actor.turn_state.movement_remaining
	movement_indicator.visible = radius > 0.05
	movement_indicator.global_position = Vector3(actor.global_position.x, 0.03, actor.global_position.z)
	movement_indicator.scale = Vector3(radius, 1.0, radius)


func restart() -> void:
	if not GameState.is_game_over():
		return
	GameState.set_state(GameState.State.EXPLORATION)
	get_tree().reload_current_scene()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("restart"):
		restart()
