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


const SKIN := Color(0.9, 0.72, 0.58)
const EYE_DARK := Color(0.12, 0.1, 0.12)
const CLOTH_DARK := Color(0.2, 0.18, 0.22)
const MAIL := Color(0.36, 0.37, 0.4)
const LINEN := Color(0.9, 0.87, 0.78)


static func has_recipe(kind: String) -> bool:
	return kind in ["goblin", "goblin_archer", "wolf", "hobgoblin", "fighter", "rogue", "wizard", "cleric"]


## Approximate height of the figure in meters (for labels / camera framing / eye height).
static func height_of(kind: String) -> float:
	match kind:
		"wolf":
			return 0.95
		"hobgoblin":
			return 2.0
		"fighter":
			return 1.9
		"rogue":
			return 1.8
		"wizard":
			return 2.2
		"cleric":
			return 1.8
	return 1.35


## [param accent] is the creature's faction / class colour for cloth and emblems.
static func build(kind: String, root: Node3D, materials: Array, accent: Color = Color.WHITE) -> void:
	match kind:
		"goblin":
			_goblin(root, materials, Color(0.42, 0.66, 0.26), false)
		"goblin_archer":
			_goblin(root, materials, Color(0.3, 0.52, 0.22), true)
		"wolf":
			_wolf(root, materials)
		"hobgoblin":
			_hobgoblin(root, materials)
		"fighter":
			_fighter(root, materials, accent)
		"rogue":
			_rogue(root, materials, accent)
		"wizard":
			_wizard(root, materials, accent)
		"cleric":
			_cleric(root, materials, accent)


# --- Heroes ---------------------------------------------------------------

## Shared human body: legs, boots, torso, belt, arms, hands, head, eyes.
static func _human(root: Node3D, mats: Array, torso: Color, pants: Color, boots: Color, legs: bool = true) -> void:
	if legs:
		for side in [-1.0, 1.0]:
			_cylinder(root, mats, 0.09, 0.7, Vector3(0.13 * side, 0.35, 0), pants)
			_box(root, mats, Vector3(0.18, 0.1, 0.3), Vector3(0.13 * side, 0.05, -0.03), boots)
	_capsule(root, mats, 0.21, 0.72, Vector3(0, 0.98, 0), torso)
	_box(root, mats, Vector3(0.46, 0.07, 0.34), Vector3(0, 0.68, 0), LEATHER.darkened(0.2))
	for side in [-1.0, 1.0]:
		_cylinder(root, mats, 0.065, 0.6, Vector3(0.3 * side, 0.95, -0.02), torso, Vector3(0, 0, -14.0 * side))
		_sphere(root, mats, 0.075, Vector3(0.36 * side, 0.62, -0.06), SKIN)
	_sphere(root, mats, 0.17, Vector3(0, 1.52, 0), SKIN)
	for side in [-1.0, 1.0]:
		_sphere(root, mats, 0.025, Vector3(0.06 * side, 1.55, -0.15), EYE_DARK)


static func _sword(root: Node3D, mats: Array, hand: Vector3, blade_len: float, blade_w: float) -> void:
	_box(root, mats, Vector3(blade_w, blade_len, 0.025), hand + Vector3(0, 0.1 + blade_len * 0.5, 0), IRON)
	_box(root, mats, Vector3(blade_w * 3.5, 0.045, 0.06), hand + Vector3(0, 0.09, 0), DARK_IRON)
	_cylinder(root, mats, 0.028, 0.16, hand, LEATHER)


static func _bow_on_back(root: Node3D, mats: Array, length: float) -> void:
	var bow := Node3D.new()
	bow.position = Vector3(0.22, 1.05, 0.26)
	bow.rotation_degrees = Vector3(0, 0, 18)
	root.add_child(bow)
	var limb := length * 0.5
	_box(bow, mats, Vector3(0.035, limb, 0.035), Vector3(0, limb * 0.5, -0.06), WOOD, Vector3(16, 0, 0))
	_box(bow, mats, Vector3(0.035, limb, 0.035), Vector3(0, -limb * 0.5, -0.06), WOOD, Vector3(-16, 0, 0))
	_box(bow, mats, Vector3(0.012, length * 0.96, 0.012), Vector3(0, 0, 0.02), Color(0.9, 0.9, 0.85))


static func _fighter(root: Node3D, mats: Array, accent: Color) -> void:
	_human(root, mats, accent.darkened(0.45), CLOTH_DARK, DARK_IRON)
	# Plate: breastplate, pauldrons, greaves, tabard in the class colour
	_box(root, mats, Vector3(0.5, 0.55, 0.34), Vector3(0, 1.0, 0), IRON)
	for side in [-1.0, 1.0]:
		_sphere(root, mats, 0.14, Vector3(0.31 * side, 1.28, 0), IRON)
		_cylinder(root, mats, 0.105, 0.36, Vector3(0.13 * side, 0.3, 0), DARK_IRON)
	_box(root, mats, Vector3(0.3, 0.56, 0.03), Vector3(0, 0.82, -0.2), accent)
	# Helmet with brim, nose guard and a plume
	_sphere(root, mats, 0.19, Vector3(0, 1.54, 0), IRON)
	_cylinder(root, mats, 0.2, 0.08, Vector3(0, 1.46, 0), DARK_IRON)
	_box(root, mats, Vector3(0.04, 0.2, 0.04), Vector3(0, 1.5, -0.2), IRON)
	_box(root, mats, Vector3(0.04, 0.14, 0.22), Vector3(0, 1.78, 0.02), accent)
	# Longsword in the right hand, longbow slung on the back
	_sword(root, mats, Vector3(0.4, 0.68, -0.08), 0.95, 0.07)
	_bow_on_back(root, mats, 1.5)


static func _rogue(root: Node3D, mats: Array, accent: Color) -> void:
	var leather := CLOTH_DARK
	_human(root, mats, leather, leather.darkened(0.2), BLACK)
	# Hood and cowl hide most of the face; sash and cloak in the class colour
	_sphere(root, mats, 0.19, Vector3(0, 1.53, 0.02), leather)
	_cone(root, mats, 0.21, 0.32, Vector3(0, 1.78, 0.02), leather)
	_box(root, mats, Vector3(0.3, 0.1, 0.1), Vector3(0, 1.46, -0.14), leather.darkened(0.3))
	_box(root, mats, Vector3(0.44, 0.08, 0.32), Vector3(0, 0.76, 0), accent)
	_box(root, mats, Vector3(0.38, 0.78, 0.025), Vector3(0, 0.98, 0.2), accent.darkened(0.35))
	# Shortsword right, dagger left, shortbow and quiver on the back
	_sword(root, mats, Vector3(0.4, 0.66, -0.08), 0.6, 0.05)
	_sword(root, mats, Vector3(-0.4, 0.66, -0.08), 0.34, 0.035)
	_bow_on_back(root, mats, 1.1)
	_cylinder(root, mats, 0.06, 0.45, Vector3(-0.14, 1.05, 0.25), LEATHER, Vector3(15, 0, 20))
	for i in 3:
		_cylinder(root, mats, 0.008, 0.3, Vector3(-0.16 + 0.03 * i, 1.32, 0.23), WOOD, Vector3(15, 0, 20))


static func _wizard(root: Node3D, mats: Array, accent: Color) -> void:
	var robe := accent.darkened(0.55)
	# Robe instead of legs, wide sleeves, rope belt
	var skirt := CylinderMesh.new()
	skirt.top_radius = 0.22
	skirt.bottom_radius = 0.46
	skirt.height = 1.0
	skirt.radial_segments = 16
	_make(root, mats, skirt, Vector3(0, 0.5, 0), robe, Vector3.ZERO, false)
	_human(root, mats, robe, robe, robe, false)
	for side in [-1.0, 1.0]:
		var sleeve := CylinderMesh.new()
		sleeve.top_radius = 0.075
		sleeve.bottom_radius = 0.15
		sleeve.height = 0.5
		sleeve.radial_segments = 12
		_make(root, mats, sleeve, Vector3(0.31 * side, 0.9, -0.02), robe, Vector3(0, 0, -14.0 * side), false)
	_cylinder(root, mats, 0.23, 0.05, Vector3(0, 0.68, 0), Color(0.75, 0.65, 0.45))
	# Long hair, pointed hat with brim
	_sphere(root, mats, 0.175, Vector3(0, 1.5, 0.05), Color(0.35, 0.22, 0.12))
	_cylinder(root, mats, 0.34, 0.03, Vector3(0, 1.68, 0), robe)
	_cone(root, mats, 0.22, 0.55, Vector3(0, 1.95, 0), robe)
	_cylinder(root, mats, 0.21, 0.05, Vector3(0, 1.7, 0), accent)
	# Staff with a glowing orb, spellbook on the belt
	_cylinder(root, mats, 0.03, 1.9, Vector3(0.38, 0.95, -0.05), WOOD)
	_sphere(root, mats, 0.09, Vector3(0.38, 1.96, -0.05), accent.lightened(0.3), true)
	_box(root, mats, Vector3(0.18, 0.24, 0.07), Vector3(-0.4, 0.68, -0.08), LEATHER)
	_box(root, mats, Vector3(0.15, 0.2, 0.03), Vector3(-0.4, 0.68, -0.13), LINEN)


static func _cleric(root: Node3D, mats: Array, accent: Color) -> void:
	_human(root, mats, MAIL, CLOTH_DARK, LEATHER)
	# Chain mail with a white tabard and the holy symbol
	_box(root, mats, Vector3(0.48, 0.54, 0.34), Vector3(0, 1.0, 0), MAIL)
	_box(root, mats, Vector3(0.3, 0.6, 0.03), Vector3(0, 0.84, -0.19), LINEN)
	_box(root, mats, Vector3(0.05, 0.22, 0.02), Vector3(0, 1.06, -0.215), accent, Vector3.ZERO)
	_box(root, mats, Vector3(0.15, 0.05, 0.02), Vector3(0, 1.1, -0.215), accent, Vector3.ZERO)
	for side in [-1.0, 1.0]:
		_sphere(root, mats, 0.12, Vector3(0.3 * side, 1.27, 0), MAIL)
	# Short hair and a circlet
	_sphere(root, mats, 0.16, Vector3(0, 1.58, 0.03), Color(0.3, 0.2, 0.12))
	var ring := TorusMesh.new()
	ring.inner_radius = 0.16
	ring.outer_radius = 0.19
	_make(root, mats, ring, Vector3(0, 1.6, 0), accent, Vector3.ZERO, false)
	# Mace in the right hand, round shield on the left arm
	_cylinder(root, mats, 0.025, 0.55, Vector3(0.4, 0.85, -0.08), LEATHER)
	_sphere(root, mats, 0.1, Vector3(0.4, 1.18, -0.08), IRON)
	for angle in [0.0, 90.0]:
		_box(root, mats, Vector3(0.26, 0.05, 0.05), Vector3(0.4, 1.18, -0.08), DARK_IRON, Vector3(0, angle, 0))
	_cylinder(root, mats, 0.3, 0.05, Vector3(-0.44, 0.95, -0.1), WOOD, Vector3(90, 0, 0))
	_sphere(root, mats, 0.07, Vector3(-0.44, 0.95, -0.14), IRON)
	_box(root, mats, Vector3(0.04, 0.3, 0.02), Vector3(-0.44, 0.95, -0.135), accent)


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
