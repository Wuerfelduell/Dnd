## Builds tabletop-style miniatures out of primitive meshes (no animation:
## the figure glides over the ground like a mini pushed across a map).
##
## Each creature kind is a small "recipe" of parts. Add a recipe here and set
## [member ActorData.miniature] to its key; nothing else has to change.
## Every material created is appended to [param materials] so [ActorVisual]
## can tint / flash the whole figure.
class_name MiniatureBuilder
extends RefCounted

const IRON := Color(0.46, 0.48, 0.53)
const DARK_IRON := Color(0.24, 0.25, 0.28)
const LEATHER := Color(0.42, 0.28, 0.15)
const WOOD := Color(0.5, 0.35, 0.2)
const BLACK := Color(0.08, 0.08, 0.09)
const EYE_YELLOW := Color(1.0, 0.85, 0.2)
const EYE_RED := Color(1.0, 0.25, 0.15)


static func has_recipe(kind: String) -> bool:
	return kind in ["goblin", "goblin_archer", "wolf", "hobgoblin"]


## Approximate height of the figure in meters (for labels / camera framing).
static func height_of(kind: String) -> float:
	match kind:
		"wolf":
			return 0.95
		"hobgoblin":
			return 2.0
	return 1.35


static func build(kind: String, root: Node3D, materials: Array) -> void:
	match kind:
		"goblin":
			_goblin(root, materials, Color(0.42, 0.66, 0.26), false)
		"goblin_archer":
			_goblin(root, materials, Color(0.3, 0.52, 0.22), true)
		"wolf":
			_wolf(root, materials)
		"hobgoblin":
			_hobgoblin(root, materials)


# --- Recipes -------------------------------------------------------------

static func _goblin(root: Node3D, mats: Array, skin: Color, archer: bool) -> void:
	# Legs, feet, loincloth
	for side in [-1.0, 1.0]:
		_cylinder(root, mats, 0.07, 0.36, Vector3(0.11 * side, 0.24, 0), skin)
		_box(root, mats, Vector3(0.13, 0.07, 0.22), Vector3(0.11 * side, 0.05, -0.03), LEATHER)
	_box(root, mats, Vector3(0.32, 0.16, 0.24), Vector3(0, 0.46, 0), LEATHER)
	# Torso + belt
	_capsule(root, mats, 0.17, 0.58, Vector3(0, 0.72, 0), skin)
	_box(root, mats, Vector3(0.36, 0.06, 0.28), Vector3(0, 0.55, 0), Color(0.25, 0.17, 0.1))
	# Arms + hands
	for side in [-1.0, 1.0]:
		_cylinder(root, mats, 0.055, 0.42, Vector3(0.25 * side, 0.7, -0.02), skin, Vector3(0, 0, -18.0 * side))
		_sphere(root, mats, 0.07, Vector3(0.3 * side, 0.49, -0.06), skin)
	# Head, ears, nose, eyes
	_sphere(root, mats, 0.19, Vector3(0, 1.12, 0), skin)
	for side in [-1.0, 1.0]:
		_prism(root, mats, Vector3(0.05, 0.24, 0.16), Vector3(0.25 * side, 1.2, 0), skin, Vector3(0, 0, -55.0 * side))
	_cone(root, mats, 0.05, 0.14, Vector3(0, 1.09, -0.22), skin, Vector3(-90, 0, 0))
	for side in [-1.0, 1.0]:
		_sphere(root, mats, 0.035, Vector3(0.07 * side, 1.16, -0.16), EYE_YELLOW, true)
	if archer:
		# Hood, shortbow in the left hand, quiver on the back
		_cone(root, mats, 0.21, 0.26, Vector3(0, 1.32, 0.02), DARK_IRON.darkened(0.3))
		# Bow held upright in the left hand: two curved limbs, grip and string.
		var bow := Node3D.new()
		bow.position = Vector3(-0.36, 0.62, -0.08)
		root.add_child(bow)
		_box(bow, mats, Vector3(0.035, 0.26, 0.035), Vector3(0, 0.12, -0.13), WOOD, Vector3(14, 0, 0))
		_box(bow, mats, Vector3(0.03, 0.26, 0.03), Vector3(0, 0.34, -0.05), WOOD, Vector3(38, 0, 0))
		_box(bow, mats, Vector3(0.035, 0.26, 0.035), Vector3(0, -0.12, -0.13), WOOD, Vector3(-14, 0, 0))
		_box(bow, mats, Vector3(0.03, 0.26, 0.03), Vector3(0, -0.34, -0.05), WOOD, Vector3(-38, 0, 0))
		_box(bow, mats, Vector3(0.05, 0.14, 0.05), Vector3(0, 0, -0.15), LEATHER)
		_box(bow, mats, Vector3(0.012, 0.9, 0.012), Vector3(0, 0, 0.02), Color(0.9, 0.9, 0.85))
		_cylinder(root, mats, 0.07, 0.42, Vector3(0.12, 0.88, 0.2), LEATHER, Vector3(20, 0, -15))
		for i in 3:
			_cylinder(root, mats, 0.008, 0.3, Vector3(0.1 + 0.03 * i, 1.14, 0.18 - 0.03 * i), WOOD, Vector3(20, 0, -15))
	else:
		# Scimitar in the right hand, round shield on the left arm
		_box(root, mats, Vector3(0.05, 0.5, 0.11), Vector3(0.36, 0.78, -0.12), IRON, Vector3(0, 0, -12))
		_box(root, mats, Vector3(0.14, 0.04, 0.05), Vector3(0.31, 0.52, -0.08), DARK_IRON)
		_cylinder(root, mats, 0.025, 0.14, Vector3(0.3, 0.44, -0.06), LEATHER)
		_cylinder(root, mats, 0.24, 0.04, Vector3(-0.34, 0.74, -0.16), WOOD, Vector3(90, 0, 0))
		_sphere(root, mats, 0.06, Vector3(-0.34, 0.74, -0.2), DARK_IRON)


static func _wolf(root: Node3D, mats: Array) -> void:
	var fur := Color(0.34, 0.35, 0.4)
	var dark := Color(0.2, 0.2, 0.24)
	_capsule(root, mats, 0.22, 0.95, Vector3(0, 0.5, 0), fur, Vector3(90, 0, 0))
	_sphere(root, mats, 0.25, Vector3(0, 0.52, -0.32), fur)
	_box(root, mats, Vector3(0.28, 0.26, 0.3), Vector3(0, 0.72, -0.62), fur)
	_box(root, mats, Vector3(0.16, 0.14, 0.24), Vector3(0, 0.66, -0.86), dark)
	_sphere(root, mats, 0.04, Vector3(0, 0.7, -0.98), BLACK)
	for side in [-1.0, 1.0]:
		_prism(root, mats, Vector3(0.11, 0.15, 0.06), Vector3(0.1 * side, 0.92, -0.58), dark, Vector3(0, 0, -15.0 * side))
		_sphere(root, mats, 0.03, Vector3(0.09 * side, 0.79, -0.77), EYE_YELLOW, true)
		for z in [-0.3, 0.32]:
			_cylinder(root, mats, 0.06, 0.44, Vector3(0.14 * side, 0.22, z), fur)
			_box(root, mats, Vector3(0.12, 0.06, 0.16), Vector3(0.14 * side, 0.03, z - 0.02), dark)
	_capsule(root, mats, 0.06, 0.5, Vector3(0, 0.62, 0.62), dark, Vector3(-55, 0, 0))


static func _hobgoblin(root: Node3D, mats: Array) -> void:
	var skin := Color(0.8, 0.42, 0.26)
	var mail := Color(0.36, 0.37, 0.4)
	var cape := Color(0.55, 0.1, 0.1)
	for side in [-1.0, 1.0]:
		_cylinder(root, mats, 0.1, 0.62, Vector3(0.16 * side, 0.37, 0), skin)
		_cylinder(root, mats, 0.11, 0.3, Vector3(0.16 * side, 0.2, 0), DARK_IRON)
		_box(root, mats, Vector3(0.2, 0.09, 0.32), Vector3(0.16 * side, 0.05, -0.04), BLACK)
	_box(root, mats, Vector3(0.52, 0.62, 0.34), Vector3(0, 0.98, 0), mail)
	_box(root, mats, Vector3(0.54, 0.09, 0.36), Vector3(0, 0.7, 0), LEATHER)
	_box(root, mats, Vector3(0.5, 0.8, 0.03), Vector3(0, 1.05, 0.2), cape)
	for side in [-1.0, 1.0]:
		_sphere(root, mats, 0.14, Vector3(0.33 * side, 1.27, 0), DARK_IRON)
		_cylinder(root, mats, 0.08, 0.52, Vector3(0.36 * side, 0.98, -0.03), skin, Vector3(0, 0, -12.0 * side))
		_sphere(root, mats, 0.09, Vector3(0.42 * side, 0.7, -0.08), DARK_IRON)
	# Head + helmet
	_sphere(root, mats, 0.2, Vector3(0, 1.52, 0), skin)
	for side in [-1.0, 1.0]:
		_prism(root, mats, Vector3(0.05, 0.2, 0.14), Vector3(0.24 * side, 1.58, 0), skin, Vector3(0, 0, -60.0 * side))
		_sphere(root, mats, 0.035, Vector3(0.075 * side, 1.56, -0.17), EYE_RED, true)
	_cylinder(root, mats, 0.23, 0.2, Vector3(0, 1.66, 0), IRON)
	_cone(root, mats, 0.23, 0.28, Vector3(0, 1.9, 0), IRON)
	_box(root, mats, Vector3(0.05, 0.22, 0.05), Vector3(0, 1.5, -0.21), IRON)
	# Longsword (right) and kite shield (left)
	_box(root, mats, Vector3(0.07, 0.95, 0.03), Vector3(0.46, 1.25, -0.16), IRON)
	_box(root, mats, Vector3(0.28, 0.05, 0.07), Vector3(0.46, 0.78, -0.16), DARK_IRON)
	_cylinder(root, mats, 0.03, 0.18, Vector3(0.46, 0.66, -0.16), LEATHER)
	_box(root, mats, Vector3(0.06, 0.62, 0.44), Vector3(-0.5, 1.0, -0.18), cape)
	_box(root, mats, Vector3(0.02, 0.3, 0.1), Vector3(-0.54, 1.02, -0.18), EYE_YELLOW)


# --- Primitive helpers ---------------------------------------------------

static func _make(root: Node3D, mats: Array, mesh: Mesh, position: Vector3, color: Color, rotation_deg: Vector3, glow: bool) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	if glow:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 0.8
	inst.material_override = mat
	inst.position = position
	inst.rotation_degrees = rotation_deg
	root.add_child(inst)
	mats.append(mat)
	return inst


static func _box(root: Node3D, mats: Array, size: Vector3, position: Vector3, color: Color, rotation_deg: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mesh := BoxMesh.new()
	mesh.size = size
	return _make(root, mats, mesh, position, color, rotation_deg, false)


static func _sphere(root: Node3D, mats: Array, radius: float, position: Vector3, color: Color, glow: bool = false) -> MeshInstance3D:
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	mesh.radial_segments = 24
	mesh.rings = 12
	return _make(root, mats, mesh, position, color, Vector3.ZERO, glow)


static func _cylinder(root: Node3D, mats: Array, radius: float, height: float, position: Vector3, color: Color, rotation_deg: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = 16
	return _make(root, mats, mesh, position, color, rotation_deg, false)


static func _cone(root: Node3D, mats: Array, radius: float, height: float, position: Vector3, color: Color, rotation_deg: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.0
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = 16
	return _make(root, mats, mesh, position, color, rotation_deg, false)


static func _capsule(root: Node3D, mats: Array, radius: float, height: float, position: Vector3, color: Color, rotation_deg: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mesh := CapsuleMesh.new()
	mesh.radius = radius
	mesh.height = height
	return _make(root, mats, mesh, position, color, rotation_deg, false)


static func _prism(root: Node3D, mats: Array, size: Vector3, position: Vector3, color: Color, rotation_deg: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mesh := PrismMesh.new()
	mesh.size = size
	return _make(root, mats, mesh, position, color, rotation_deg, false)
