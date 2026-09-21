## Placeholder presentation of an actor (capsule + nose + selection ring).
##
## Everything visual about an actor goes through this node so real models /
## animations can replace it later without touching gameplay code.
class_name ActorVisual
extends Node3D

const DOWN_TINT := Color(0.35, 0.35, 0.35)

var _base_color: Color = Color.WHITE
var _status_tint: Color = Color(1, 1, 1, 1)
var _material: StandardMaterial3D

@onready var body: MeshInstance3D = $Body
@onready var nose: MeshInstance3D = $Nose
@onready var ring: MeshInstance3D = $SelectionRing
@onready var target_ring: MeshInstance3D = $TargetRing


func _ready() -> void:
	_material = StandardMaterial3D.new()
	body.material_override = _material
	nose.material_override = _material
	ring.visible = false
	target_ring.visible = false
	apply_color(_base_color)


func apply_color(color: Color) -> void:
	_base_color = color
	_refresh_color()


## Tint from the most prominent status effect (white = none).
func set_status_tint(tint: Color) -> void:
	_status_tint = tint
	_refresh_color()


func _current_color() -> Color:
	var parent := get_parent()
	if parent is Actor and parent.is_down:
		return DOWN_TINT
	return _base_color.lerp(_status_tint, 0.5) if _status_tint != Color(1, 1, 1, 1) else _base_color


func _refresh_color() -> void:
	if _material:
		_material.albedo_color = _current_color()


func set_down(down: bool) -> void:
	if down:
		# "Lying on the ground": tip the whole visual over and grey it out.
		rotation_degrees.x = -80.0
		position.y = 0.3
		ring.visible = false
		target_ring.visible = false
	else:
		rotation_degrees.x = 0.0
		position.y = 0.0
	_refresh_color()


## Ring under the active actor.
func set_active(active: bool) -> void:
	ring.visible = active


## Ring under a valid / hovered target.
func set_targetable(targetable: bool) -> void:
	target_ring.visible = targetable


func flash(color: Color, duration: float = 0.25) -> void:
	if _material == null:
		return
	var tween := create_tween()
	_material.albedo_color = color
	tween.tween_property(_material, "albedo_color", _current_color(), duration)
