## Presentation of an actor: an animated character model on a round base, or a
## tabletop-style miniature built from primitives, or the placeholder capsule.
##
## Priority: [member ActorData.model] (GLB from the asset pack, animated via
## [CharacterAnimator]) > [member ActorData.miniature] ([MiniatureBuilder]) >
## capsule. All visual state (colour, status tint, down pose, rings, flashes,
## animations) goes through this node; gameplay code only calls
## [method play_action] and never touches meshes.
class_name ActorVisual
extends Node3D

const DOWN_TINT := Color(0.35, 0.35, 0.35)
const BASE_RADIUS := 0.5
const MODEL_ROOT := "res://assets/characters/"
## Equipment meshes that KayKit heroes carry as hidden alternatives.
const EQUIPMENT_NAMES := ["1H_Sword_Offhand", "Badge_Shield", "Rectangle_Shield", "Round_Shield", "Spike_Shield",
	"1H_Sword", "2H_Sword", "Knife_Offhand", "1H_Crossbow", "2H_Crossbow", "Knife", "Throwable", "Spellbook",
	"Spellbook_open", "1H_Wand", "2H_Staff", "1H_Axe_Offhand", "Barbarian_Round_Shield", "1H_Axe", "2H_Axe", "Mug"]

var _base_color: Color = Color.WHITE
var _status_tint: Color = Color(1, 1, 1, 1)
var _material: StandardMaterial3D
## Per-instance materials of the miniature or model, with their original colours.
var _mini_materials: Array = []
var _mini_colors: Array[Color] = []
var _rim_material: StandardMaterial3D
var _uses_mini: bool = false
var _uses_model: bool = false
var _animator: CharacterAnimator
var _flash_tween: Tween

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
	var data: ActorData = actor.data if actor != null else null
	if data != null and data.model != "" and _build_model(data):
		_uses_model = true
		body.visible = false
		nose.visible = false
	elif data != null and MiniatureBuilder.has_recipe(data.miniature):
		_uses_mini = true
		body.visible = false
		nose.visible = false
		var mini := Node3D.new()
		mini.name = "Mini"
		add_child(mini)
		MiniatureBuilder.build(data.miniature, mini, _mini_materials, data.color)
		for m in _mini_materials:
			_mini_colors.append(m.albedo_color)
	apply_color(_base_color)


## Instantiates the animated model, hides unused equipment, gives every mesh
## its own material (for tints) and starts the idle clip. False if missing.
func _build_model(data: ActorData) -> bool:
	var path := MODEL_ROOT + data.model + ".glb"
	if not ResourceLoader.exists(path):
		push_warning("ActorVisual: model %s not found, using the miniature" % path)
		return false
	var scene := load(path) as PackedScene
	if scene == null:
		return false
	var model := scene.instantiate() as Node3D
	if model == null:
		return false
	model.name = "Model"
	model.scale = Vector3.ONE * data.model_scale
	model.rotation.y = deg_to_rad(data.model_yaw_degrees)
	add_child(model)
	var player: AnimationPlayer = null
	for n in model.find_children("*", "", true, false):
		if n is MeshInstance3D:
			if String(n.name) in EQUIPMENT_NAMES:
				n.visible = String(n.name) in data.model_equipment
			for i in n.get_surface_override_material_count():
				var mat: Material = n.get_active_material(i)
				if mat is StandardMaterial3D:
					var own: StandardMaterial3D = mat.duplicate()
					n.set_surface_override_material(i, own)
					_mini_materials.append(own)
					_mini_colors.append(own.albedo_color)
		elif n is AnimationPlayer and player == null:
			player = n
	_animator = CharacterAnimator.new(player)
	_animator.play("idle")
	return true


func uses_model() -> bool:
	return _uses_model


func animator() -> CharacterAnimator:
	return _animator


## Plays a game action on the model ("idle", "run", "attack", "ranged",
## "cast", "hit", "death", "revive"); no-op for miniatures and capsules.
func play_action(action: String) -> bool:
	if _animator == null:
		return false
	return _animator.play(action)


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
	if _uses_model:
		# Animated figures play their death clip and stay lying there.
		if down:
			play_action("death")
		else:
			play_action("revive")
		ring.visible = ring.visible and not down
		target_ring.visible = target_ring.visible and not down
	elif down:
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
	if _flash_tween != null and _flash_tween.is_valid():
		_flash_tween.kill()
	_material.albedo_color = color
	for m in _mini_materials:
		if _uses_model:
			# Textured models: pulse the emission instead of overriding the texture tint.
			m.emission_enabled = true
			m.emission = color
			m.emission_energy_multiplier = 1.2
		else:
			m.albedo_color = color
	_flash_tween = create_tween()
	_flash_tween.tween_method(_flash_step, 0.0, 1.0, duration)


func _flash_step(t: float) -> void:
	var white := Color(1, 1, 1)
	_material.albedo_color = white.lerp(_tinted(_base_color), t)
	for i in _mini_materials.size():
		if _uses_model:
			_mini_materials[i].emission_energy_multiplier = 1.2 * (1.0 - t)
			if t >= 1.0:
				_mini_materials[i].emission_enabled = false
		else:
			_mini_materials[i].albedo_color = white.lerp(_tinted(_mini_colors[i]), t)
