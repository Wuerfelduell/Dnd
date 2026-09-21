## A creature in the world: player character or enemy.
##
## Owns runtime state (HP, turn resources, available actions) and low-level
## movement. It does not decide anything: exploration input comes from
## [PlayerController], combat decisions from [CombatManager] / [EnemyAI].
class_name Actor
extends CharacterBody3D

signal hp_changed(current: int, maximum: int)
signal downed(actor: Actor)
signal movement_finished(actor: Actor)

const BODY_RADIUS := 0.4

@export var data: ActorData
## Visual walking speed in m/s (rules movement is in TurnState).
@export var move_speed: float = 5.0

var current_hp: int = 0
var is_down: bool = false
var turn_state: TurnState = TurnState.new()
var actions: Array[CombatAction] = []
## Free-form per-combat flags (e.g. "second_wind_used"); reset on combat start.
var combat_flags: Dictionary = {}
## Distance actually travelled during the last [method move_along_path].
var last_move_distance: float = 0.0

var _path: PackedVector3Array = PackedVector3Array()
var _path_index: int = 0
var _distance_budget: float = 0.0
var _moving: bool = false
var _runtime_initialized: bool = false

@onready var visual: ActorVisual = get_node_or_null("Visual")
@onready var name_label: ActorLabel = get_node_or_null("Label")


func _ready() -> void:
	assert(data != null, "Actor '%s' has no ActorData" % name)
	initialize_runtime()
	add_to_group("actors")
	if visual:
		visual.apply_color(data.color)
	if name_label:
		name_label.bind(self)
	hp_changed.emit(current_hp, max_hp())


## Sets up HP and actions from [member data]. Safe to call without a scene tree
## (unit tests build actors with Actor.new()).
func initialize_runtime() -> void:
	if _runtime_initialized:
		return
	_runtime_initialized = true
	current_hp = data.stats.max_hp
	_build_actions()


func _build_actions() -> void:
	actions.clear()
	for weapon in data.weapons:
		actions.append(AttackAction.new(weapon))
	actions.append(DashAction.new())
	if data.has_second_wind:
		actions.append(SecondWindAction.new())


# --- Queries -------------------------------------------------------------

func display_name() -> String:
	return data.display_name


func faction() -> ActorData.Faction:
	return data.faction


func is_player() -> bool:
	return data.faction == ActorData.Faction.PLAYER


func is_hostile_to(other: Actor) -> bool:
	return other != self and other.data.faction != data.faction


func is_alive() -> bool:
	return not is_down


func max_hp() -> int:
	return data.stats.max_hp


func armor_class() -> int:
	return data.stats.armor_class


func speed_m() -> float:
	return data.stats.speed_m


func attack_bonus(weapon: WeaponData) -> int:
	return data.stats.ability_mod(weapon.ability) + data.stats.proficiency_bonus


func damage_bonus(weapon: WeaponData) -> int:
	return data.stats.ability_mod(weapon.ability)


## Horizontal edge-to-edge distance (0 when the capsules touch).
func distance_to(other: Actor) -> float:
	return maxf(0.0, center_distance_to(other) - BODY_RADIUS * 2.0)


func center_distance_to(other: Actor) -> float:
	var a := global_position
	var b := other.global_position
	a.y = 0.0
	b.y = 0.0
	return a.distance_to(b)


func find_action(action_id: StringName) -> CombatAction:
	for a in actions:
		if a.id == action_id:
			return a
	return null


# --- HP ------------------------------------------------------------------

func take_damage(amount: int) -> void:
	if is_down or amount <= 0:
		return
	current_hp = maxi(0, current_hp - amount)
	hp_changed.emit(current_hp, max_hp())
	if current_hp == 0:
		_go_down()


func heal(amount: int) -> int:
	if is_down or amount <= 0:
		return 0
	var before := current_hp
	current_hp = mini(max_hp(), current_hp + amount)
	hp_changed.emit(current_hp, max_hp())
	return current_hp - before


func _go_down() -> void:
	is_down = true
	turn_state.clear()
	stop_moving()
	if visual:
		visual.set_down(true)
	# Let others walk through the body; deferred because this can run inside physics callbacks.
	var shape := get_node_or_null("CollisionShape3D")
	if shape:
		shape.set_deferred("disabled", true)
	downed.emit(self)


# --- Movement ------------------------------------------------------------

## Starts walking along [param path] (world points) but never further than
## [param max_distance]. Emits [signal movement_finished] when done.
func move_along_path(path: PackedVector3Array, max_distance: float) -> void:
	last_move_distance = 0.0
	_path = path
	_path_index = 1
	_distance_budget = max_distance
	if path.size() < 2 or max_distance <= 0.0:
		_moving = false
		call_deferred("_emit_movement_finished")
		return
	_moving = true


func is_moving() -> bool:
	return _moving


func stop_moving() -> void:
	if _moving:
		_moving = false
		velocity = Vector3.ZERO


func _emit_movement_finished() -> void:
	movement_finished.emit(self)


func _physics_process(delta: float) -> void:
	if not _moving:
		return
	var step_left := move_speed * delta
	while step_left > 0.0001 and _moving:
		if _path_index >= _path.size() or _distance_budget <= 0.0001:
			_finish_move()
			break
		var target := _path[_path_index]
		target.y = global_position.y
		var to_target := target - global_position
		var dist := to_target.length()
		if dist < 0.01:
			_path_index += 1
			continue
		var step := minf(step_left, minf(dist, _distance_budget))
		var dir := to_target / dist
		face_direction(dir)
		var before := global_position
		var collision := move_and_collide(dir * step)
		var moved := (global_position - before).length()
		last_move_distance += moved
		_distance_budget -= moved
		step_left -= step
		if collision != null:
			# Bumped into something (usually another actor): stop here.
			_finish_move()
			break
		if dist - moved < 0.01:
			_path_index += 1


func _finish_move() -> void:
	_moving = false
	velocity = Vector3.ZERO
	movement_finished.emit(self)


func face_direction(dir: Vector3) -> void:
	dir.y = 0.0
	if dir.length_squared() < 0.0001:
		return
	look_at(global_position + dir, Vector3.UP)


func face_actor(other: Actor) -> void:
	face_direction(other.global_position - global_position)
