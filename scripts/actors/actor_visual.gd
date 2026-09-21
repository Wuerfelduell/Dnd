## Presentation of an actor: a tabletop-style miniature on a round base.
##
## Creatures with an [member ActorData.miniature] recipe get a figure built by
## [MiniatureBuilder]; everything else keeps the placeholder capsule. All
## visual state (colour, status tint, down pose, rings, flashes) goes through
## this node so real models / animations can replace it later without
## touching gameplay code.
class_name ActorVisual
extends Node3D

const DOWN_TINT := Color(0.35, 0.35, 0.35)
const BASE_RADIUS := 0.5

var _base_color: Color = Color.WHITE
var _status_tint: Color = Color(1, 1, 1, 1)
var _material: StandardMaterial3D
var _mini_materials: Array = []
var _mini_colors: Array[Color] = []
var _rim_material: StandardMaterial3D
var _uses_mini: bool = false

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
	ring.position.y = 0.1
	target_ring.position.y = 0.1
	_build_base()
	var actor := get_parent() as Actor
	var kind := actor.data.miniature if actor != null and actor.data != null else ""
	if MiniatureBuilder.has_recipe(kind):
		_uses_mini = true
		body.visible = false
		nose.visible = false
		var mini := Node3D.new()
		mini.name = "Mini"
		add_child(mini)
		MiniatureBuilder.build(kind, mini, _mini_materials)
		for m in _mini_materials:
			_mini_colors.append(m.albedo_color)
	apply_color(_base_color)


## Round base like a painted miniature: dark disc with a coloured rim.
func _build_base() -> void:
	var disc := MeshInstance3D.new()
	var disc_mesh := CylinderMesh.new()
	disc_mesh.top_radius = BASE_RADIUS
	disc_mesh.bottom_radius = BASE_RADIUS + 0.04
	disc_mesh.height = 0.07
	disc.mesh = disc_mesh
	var disc_mat := StandardMaterial3D.new()
	disc_mat.albedo_color = Color(0.13, 0.13, 0.15)
	disc.material_override = disc_mat
	disc.position.y = 0.035
	disc.name = "Base"
	add_child(disc)
	var rim := MeshInstance3D.new()
	var rim_mesh := TorusMesh.new()
	rim_mesh.inner_radius = BASE_RADIUS - 0.05
	rim_mesh.outer_radius = BASE_RADIUS + 0.02
	rim.mesh = rim_mesh
	_rim_material = StandardMaterial3D.new()
	rim.material_override = _rim_material
	rim.scale = Vector3(1, 0.35, 1)
	rim.position.y = 0.075
	rim.name = "BaseRim"
	add_child(rim)


func apply_color(color: Color) -> void:
	_base_color = color
	_refresh_color()


## Tint from the most prominent status effect (white = none).
func set_status_tint(tint: Color) -> void:
	_status_tint = tint
	_refresh_color()


func _is_down() -> bool:
	var parent := get_parent()
	return parent is Actor and parent.is_down


func _tinted(original: Color) -> Color:
	if _is_down():
		return original.lerp(DOWN_TINT, 0.7)
	if _status_tint != Color(1, 1, 1, 1):
		return original.lerp(_status_tint, 0.45)
	return original


func _refresh_color() -> void:
	if _material:
		_material.albedo_color = _tinted(_base_color)
	if _rim_material:
		_rim_material.albedo_color = _base_color.lerp(DOWN_TINT, 0.7) if _is_down() else _base_color
	for i in _mini_materials.size():
		_mini_materials[i].albedo_color = _tinted(_mini_colors[i])


func set_down(down: bool) -> void:
	if down:
		# Knocked over like a mini on the table.
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
	_material.albedo_color = color
	for m in _mini_materials:
		m.albedo_color = color
	var tween := create_tween()
	tween.tween_method(_flash_step, 0.0, 1.0, duration)


func _flash_step(t: float) -> void:
	var white := Color(1, 1, 1)
	_material.albedo_color = white.lerp(_tinted(_base_color), t)
	for i in _mini_materials.size():
		_mini_materials[i].albedo_color = white.lerp(_tinted(_mini_colors[i]), t)
