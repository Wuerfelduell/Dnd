## Generates the level's height levels, cover walls and lights from a small
## tile-like layout: plateaus (blocks), ramps with stair steps, low walls and
## torches. Everything is primitive geometry on collision layer 1, parented to
## the NavigationRegion3D so the navmesh bake picks it up.
##
## This is the stand-in for a GridMap with real tiles: each entry below is a
## "cell group" with a footprint and a height. Replacing the meshes with
## Kenney/KayKit tiles later means swapping the mesh in [method _block] /
## [method _ramp]; rules read heights from [Terrain] and don't care.
class_name TerrainBuilder
extends RefCounted

const STONE := Color(0.5, 0.47, 0.43)
const STONE_RIM := Color(0.36, 0.34, 0.31)
const STEP := Color(0.44, 0.41, 0.38)
const WALL := Color(0.54, 0.51, 0.47)
const WOOD := Color(0.42, 0.28, 0.15)
const FLAME := Color(1.0, 0.62, 0.2)
const TORCH_LIGHT := Color(1.0, 0.76, 0.48)
const STEP_HEIGHT := 0.125

## Raised blocks: footprint (x, z, width, depth) and top height.
const PLATEAUS := [
	{"name": "ArcherLedge", "rect": Rect2(5.0, -19.5, 8.0, 6.5), "height": 1.5},
	{"name": "Overlook", "rect": Rect2(-19.5, -4.0, 5.5, 7.0), "height": 1.5},
	{"name": "Mound", "rect": Rect2(-8.0, 2.0, 5.0, 4.0), "height": 0.75},
]
## Stairs from the ground up to a plateau: footprint, height and the
## direction in which they rise.
const RAMPS := [
	{"name": "LedgeStairs", "rect": Rect2(1.0, -18.0, 4.0, 3.0), "height": 1.5, "rises": "east"},
	{"name": "OverlookStairs", "rect": Rect2(-17.0, -8.0, 2.0, 4.0), "height": 1.5, "rises": "south"},
	{"name": "MoundStairs", "rect": Rect2(-10.0, 3.0, 2.0, 2.0), "height": 0.75, "rises": "east"},
]
## Waist-high walls: cover, not obstacles for sight.
const LOW_WALLS := [
	{"name": "LowWallEast", "rect": Rect2(4.3, -7.5, 0.4, 3.0), "height": 0.9},
	{"name": "LowWallWest", "rect": Rect2(-11.0, -6.2, 3.0, 0.4), "height": 0.9},
]
## Light sources: position of the base on the ground and the kind.
const LIGHTS := [
	{"name": "CampTorchWest", "position": Vector3(-2.5, 0.0, 10.0), "kind": "torch"},
	{"name": "CampTorchEast", "position": Vector3(2.5, 0.0, 10.0), "kind": "torch"},
	{"name": "Campfire", "position": Vector3(0.0, 0.0, -11.5), "kind": "campfire"},
	{"name": "LedgeTorch", "position": Vector3(9.0, 1.5, -16.0), "kind": "torch"},
	{"name": "WestTorch", "position": Vector3(-6.0, 0.0, -5.0), "kind": "torch"},
	{"name": "EastTorch", "position": Vector3(8.0, 0.0, -2.0), "kind": "torch"},
	{"name": "SouthEastTorch", "position": Vector3(12.0, 0.0, 6.0), "kind": "torch"},
]


## Builds terrain under [param nav_parent] (baked into the navmesh) and lights
## under [param light_parent].
static func build(nav_parent: Node3D, light_parent: Node3D) -> void:
	for p in PLATEAUS:
		_block(nav_parent, p["name"], p["rect"], p["height"], STONE, true)
	for r in RAMPS:
		_ramp(nav_parent, r["name"], r["rect"], r["height"], r["rises"])
	for w in LOW_WALLS:
		_block(nav_parent, w["name"], w["rect"], w["height"], WALL, false)
	for l in LIGHTS:
		match l["kind"]:
			"campfire":
				_campfire(light_parent, nav_parent, l["name"], l["position"])
			_:
				_torch(light_parent, l["name"], l["position"])


## Height of the layout at an x/z position (0 = ground), from the data only.
## Used by tests to cross-check the physics answer of [Terrain].
static func layout_height(x: float, z: float) -> float:
	var h := 0.0
	for p in PLATEAUS:
		if _inside(p["rect"], x, z):
			h = maxf(h, p["height"])
	for r in RAMPS:
		var rect: Rect2 = r["rect"]
		if _inside(rect, x, z):
			var t := 0.0
			match r["rises"]:
				"east":
					t = (x - rect.position.x) / rect.size.x
				"west":
					t = (rect.end.x - x) / rect.size.x
				"south":
					t = (z - rect.position.y) / rect.size.y
				"north":
					t = (rect.end.y - z) / rect.size.y
			h = maxf(h, r["height"] * clampf(t, 0.0, 1.0))
	return h


static func _inside(rect: Rect2, x: float, z: float) -> bool:
	return x >= rect.position.x and x <= rect.end.x and z >= rect.position.y and z <= rect.end.y


# --- Pieces ----------------------------------------------------------------

static func _block(parent: Node3D, name: String, rect: Rect2, height: float, color: Color, rim: bool) -> StaticBody3D:
	var body := _static_body(parent, name)
	var center := Vector3(rect.position.x + rect.size.x * 0.5, 0.0, rect.position.y + rect.size.y * 0.5)
	var size := Vector3(rect.size.x, height + 0.5, rect.size.y)
	body.position = center
	_box_part(body, size, Vector3(0.0, (height - 0.5) * 0.5, 0.0), color, true)
	if rim:
		# Thin lighter top slab (slightly above the block so nothing z-fights).
		_box_part(body, Vector3(rect.size.x - 0.02, 0.02, rect.size.y - 0.02), Vector3(0.0, height + 0.005, 0.0), color.lightened(0.08), false)
		# Darker lip along the top edge so the cliff reads as a step up.
		_box_part(body, Vector3(rect.size.x + 0.12, 0.08, rect.size.y + 0.12), Vector3(0.0, height - 0.05, 0.0), STONE_RIM, false)
	return body


## A sloped collider (so figures glide up) with stair steps drawn on top.
static func _ramp(parent: Node3D, name: String, rect: Rect2, height: float, rises: String) -> Node3D:
	var pivot := Node3D.new()
	pivot.name = name
	pivot.position = Vector3(rect.position.x + rect.size.x * 0.5, 0.0, rect.position.y + rect.size.y * 0.5)
	var along_x := rises == "east" or rises == "west"
	var length := rect.size.x if along_x else rect.size.y
	var width := rect.size.y if along_x else rect.size.x
	match rises:
		"east":
			pivot.rotation.y = 0.0
		"west":
			pivot.rotation.y = PI
		"north":
			pivot.rotation.y = PI * 0.5
		"south":
			pivot.rotation.y = -PI * 0.5
	parent.add_child(pivot)
	# Collider: box whose top surface runs from (-L/2, 0) to (+L/2, h), lifted
	# half a step so figures stand on the middle of each drawn step.
	var body := _static_body(pivot, "Slope")
	var steps := maxi(2, int(round(height / STEP_HEIGHT)))
	var lift := height / steps * 0.5
	var slant := sqrt(length * length + height * height)
	var thickness := 0.6
	var angle := atan2(height, length)
	var normal := Vector3(-sin(angle), cos(angle), 0.0)
	var top_mid := Vector3(0.0, height * 0.5 + lift, 0.0)
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(slant, thickness, width)
	shape.shape = box
	shape.position = top_mid - normal * thickness * 0.5
	shape.rotation.z = angle
	body.add_child(shape)
	# Visual stairs (no collision): one box per step.
	var step_len := length / steps
	var step_h := height / steps
	for i in steps:
		var x := -length * 0.5 + step_len * (i + 0.5)
		var top := step_h * (i + 1)
		var bottom := -0.3
		var mesh := BoxMesh.new()
		mesh.size = Vector3(step_len, top - bottom, width)
		var inst := MeshInstance3D.new()
		inst.mesh = mesh
		inst.material_override = _material(STEP if i % 2 == 0 else STEP.darkened(0.08))
		inst.position = Vector3(x, (top + bottom) * 0.5, 0.0)
		pivot.add_child(inst)
	return pivot


static func _torch(parent: Node3D, name: String, base: Vector3) -> LightSource:
	var light := LightSource.new()
	light.name = name
	light.radius_m = 6.0
	light.position = base + Vector3.UP * 1.8
	parent.add_child(light)
	_mesh_part(light, _cylinder_mesh(0.05, 1.7), Vector3(0.0, -0.85, 0.0), WOOD, false)
	_mesh_part(light, _cylinder_mesh(0.1, 0.14), Vector3(0.0, -0.02, 0.0), Color(0.25, 0.2, 0.16), false)
	_mesh_part(light, _sphere_mesh(0.16), Vector3(0.0, 0.14, 0.0), FLAME, true)
	_mesh_part(light, _sphere_mesh(0.09), Vector3(0.0, 0.3, 0.0), Color(1.0, 0.85, 0.4), true)
	_omni(light, Vector3(0.0, 0.2, 0.0), 9.0, 2.2)
	return light


static func _campfire(parent: Node3D, nav_parent: Node3D, name: String, base: Vector3) -> LightSource:
	var light := LightSource.new()
	light.name = name
	light.radius_m = 7.0
	light.position = base + Vector3.UP * 0.5
	parent.add_child(light)
	for i in 3:
		var log_mesh := _cylinder_mesh(0.08, 1.0)
		var log_inst := _mesh_part(light, log_mesh, Vector3(0.0, -0.4, 0.0), WOOD.darkened(0.2), false)
		log_inst.rotation_degrees = Vector3(90.0, 60.0 * i, 0.0)
	_mesh_part(light, _sphere_mesh(0.32), Vector3(0.0, -0.15, 0.0), FLAME, true)
	_mesh_part(light, _sphere_mesh(0.18), Vector3(0.0, 0.15, 0.0), Color(1.0, 0.85, 0.4), true)
	_omni(light, Vector3.ZERO, 11.0, 2.8)
	# Nobody walks through the fire: a stone ring in the navmesh region, taller
	# than the navmesh's climbable step so paths go around it.
	var body := _static_body(nav_parent, name + "Pit")
	body.position = base
	var shape := CollisionShape3D.new()
	var cyl := CylinderShape3D.new()
	cyl.radius = 0.7
	cyl.height = 0.7
	shape.shape = cyl
	shape.position = Vector3(0.0, 0.35, 0.0)
	body.add_child(shape)
	_mesh_part(body, _cylinder_mesh(0.75, 0.3), Vector3(0.0, 0.15, 0.0), Color(0.3, 0.28, 0.26), false)
	for i in 8:
		var angle := TAU * i / 8.0
		_mesh_part(body, _sphere_mesh(0.16), Vector3(cos(angle) * 0.62, 0.3, sin(angle) * 0.62), Color(0.36, 0.34, 0.32), false)
	return light


# --- Helpers ---------------------------------------------------------------

static func _static_body(parent: Node3D, name: String) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.name = name
	body.collision_layer = 1
	body.collision_mask = 0
	parent.add_child(body)
	return body


static func _box_part(body: StaticBody3D, size: Vector3, position: Vector3, color: Color, collide: bool) -> void:
	var mesh := BoxMesh.new()
	mesh.size = size
	_mesh_part(body, mesh, position, color, false)
	if collide:
		var shape := CollisionShape3D.new()
		var box := BoxShape3D.new()
		box.size = size
		shape.shape = box
		shape.position = position
		body.add_child(shape)


static func _mesh_part(parent: Node3D, mesh: Mesh, position: Vector3, color: Color, glow: bool) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = _material(color, glow)
	inst.position = position
	parent.add_child(inst)
	return inst


static func _material(color: Color, glow: bool = false) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	if glow:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 2.0
	return mat


static func _cylinder_mesh(radius: float, height: float) -> CylinderMesh:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = 12
	return mesh


static func _sphere_mesh(radius: float) -> SphereMesh:
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	mesh.radial_segments = 12
	mesh.rings = 6
	return mesh


static func _omni(parent: Node3D, position: Vector3, range_m: float, energy: float) -> OmniLight3D:
	var light := OmniLight3D.new()
	light.position = position
	light.omni_range = range_m
	light.light_energy = energy
	light.light_color = TORCH_LIGHT
	light.shadow_enabled = false
	parent.add_child(light)
	return light
