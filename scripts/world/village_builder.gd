## The ruined village east of the arena (asset pack "Kaputtes Dorf").
##
## Layout from the pack's layout.json, moved to [constant ORIGIN]: a river
## along Z in the middle, the damaged wooden bridge and the main dirt road
## along X (it continues west through the arena's east gate), cobbled side
## lanes on both banks, six ruined houses, workshops, rubble and fences.
##
## The pack's wrapper scenes (res://assets/village/scenes/) carry the static
## concave colliders; everything lands under the navigation region before the
## navmesh is baked. The river has no floor: the ground is two banks with a
## gap, and an invisible barrier on its own physics layer
## ([constant RIVER_LAYER]) keeps walkers out of the water without blocking
## line of sight or arrows across it. The bridge is the only crossing.
class_name VillageBuilder
extends RefCounted

## Village (0, 0, 0) in world space. Local x -27..25, z -20..20.
const ORIGIN := Vector3(47.0, 0.0, 0.0)
const SCENE_ROOT := "res://assets/village/scenes/"
## Physics layer 3 (bit value 4): collides with walkers and is baked into the
## navmesh, but [Visibility] and [Terrain] (layer 1) ignore it.
const RIVER_LAYER := 4
## Banks start this far from the river axis (the bank models overlap them).
const BANK_INNER := 3.5
const RIVER_BARRIER_X := 3.55
## Half width of the opening in the river barrier for the bridge deck.
const BRIDGE_HALF_WIDTH := 1.9
## The deck (0.41 m) and its ramps reach this far from the river axis; their
## sides are edges a walker cannot step up, so side rails keep everyone to the
## ramp ends (z of the rails, start and end along x).
const BRIDGE_RAIL_Z := 1.78
const BRIDGE_RAIL_FROM := 3.4
const BRIDGE_RAIL_TO := 6.1
const WEST_EDGE := -27.0
const EAST_EDGE := 25.0
const HALF_DEPTH := 20.0
const GRASS := Color(0.27, 0.34, 0.2)
const NIGHT_WATER := Color(0.04, 0.2, 0.27)
## The cold forge doubles as a chest: Dorek's marked tongs lie in it.
const FORGE := {"name": "ColdForge", "position": Vector3(22.0, 0.0, -9.0), "box": Vector3(1.3, 1.18, 1.3), "loot": {"copper": 0, "items": ["dorek_marked_tongs"]}}
## Light for the night: torches by the well, the bridge and the forge, a brazier at the sick bay.
const LIGHTS := [
	{"name": "VillageWellTorch", "position": Vector3(-4.5, 0.0, 9.5), "kind": "torch"},
	{"name": "VillageBridgeTorch", "position": Vector3(-7.5, 0.0, -2.6), "kind": "torch"},
	{"name": "VillageForgeTorch", "position": Vector3(14.0, 0.0, -3.0), "kind": "torch"},
	{"name": "VillageSickBay", "position": Vector3(13.0, 0.0, 12.0), "kind": "brazier"},
]
## Extra road tile linking the village road to the arena's east gate (local x).
const LINK_ROADS := [-24.0]
## Placed objects: [asset, local position, yaw in degrees].
const LAYOUT := [
	["river_reeds", Vector3(0, 0, -16), 0.0],
	["river_bank_grass", Vector3(3.75, 0, -16), 0.0],
	["river_bank_eroded", Vector3(-3.75, 0, -16), 180.0],
	["river_straight", Vector3(0, 0, -8), 0.0],
	["river_bank_grass", Vector3(3.75, 0, -8), 0.0],
	["river_bank_eroded", Vector3(-3.75, 0, -8), 180.0],
	["river_straight", Vector3(0, 0, 0), 0.0],
	["river_bank_grass", Vector3(3.75, 0, 0), 0.0],
	["river_bank_eroded", Vector3(-3.75, 0, 0), 180.0],
	["river_straight", Vector3(0, 0, 8), 0.0],
	["river_bank_grass", Vector3(3.75, 0, 8), 0.0],
	["river_bank_eroded", Vector3(-3.75, 0, 8), 180.0],
	["river_reeds", Vector3(0, 0, 16), 0.0],
	["river_bank_grass", Vector3(3.75, 0, 16), 0.0],
	["river_bank_eroded", Vector3(-3.75, 0, 16), 180.0],
	["bridge_wood_damaged", Vector3(0, 0, 0), 0.0],
	["road_dirt_straight", Vector3(-20, 0, 0), 90.0],
	["road_dirt_straight", Vector3(-16, 0, 0), 90.0],
	["road_dirt_straight", Vector3(-12, 0, 0), 90.0],
	["road_dirt_straight", Vector3(-8, 0, 0), 90.0],
	["road_dirt_straight", Vector3(8, 0, 0), 90.0],
	["road_dirt_straight", Vector3(12, 0, 0), 90.0],
	["road_dirt_straight", Vector3(16, 0, 0), 90.0],
	["road_dirt_straight", Vector3(20, 0, 0), 90.0],
	["road_cobble_cracked", Vector3(-12, 0, -16), 0.0],
	["road_cobble_cracked", Vector3(-12, 0, -12), 0.0],
	["road_cobble_cracked", Vector3(-12, 0, -8), 0.0],
	["road_muddy_ruts", Vector3(-12, 0, -4), 0.0],
	["road_cobble_cracked", Vector3(-12, 0, 4), 0.0],
	["road_cobble_cracked", Vector3(-12, 0, 8), 0.0],
	["road_cobble_cracked", Vector3(-12, 0, 12), 0.0],
	["road_cobble_cracked", Vector3(-12, 0, 16), 0.0],
	["road_cobble_cracked", Vector3(12, 0, -16), 0.0],
	["road_cobble_cracked", Vector3(12, 0, -12), 0.0],
	["road_cobble_cracked", Vector3(12, 0, -8), 0.0],
	["road_muddy_ruts", Vector3(12, 0, -4), 0.0],
	["road_cobble_cracked", Vector3(12, 0, 4), 0.0],
	["road_cobble_cracked", Vector3(12, 0, 8), 0.0],
	["road_cobble_cracked", Vector3(12, 0, 12), 0.0],
	["road_cobble_cracked", Vector3(12, 0, 16), 0.0],
	["house_cottage_damaged", Vector3(-18, 0, -8), 90.0],
	["house_family_halfcollapsed", Vector3(-18, 0, 9), 90.0],
	["house_burned_hut", Vector3(-18, 0, -16), 90.0],
	["house_blacksmith_ruined", Vector3(19, 0, -8), -90.0],
	["house_granary_broken", Vector3(19, 0, 8), -90.0],
	["house_healer_abandoned", Vector3(19, 0, 16), -90.0],
	["well_damaged", Vector3(-7, 0, 8), 0.0],
	["blacksmith_anvil", Vector3(16, 0, -9), 0.0],
	["cart_broken", Vector3(-8, 0, -8), 0.0],
	["memorial_cracked", Vector3(8, 0, 12), 0.0],
	["campfire_cold", Vector3(7, 0, -11), 0.0],
	["bedroll_rescue", Vector3(16, 0, 14), 0.0],
	["clothesline_ragged", Vector3(-22, 0, 5), 0.0],
	["work_table_salvage", Vector3(15, 0, 6), 0.0],
	["supplies_sack_pile", Vector3(17, 0, 7), 0.0],
	["barrel_weathered", Vector3(22, 0, 5), 0.0],
	["barrel_broken", Vector3(-20, 0, -12), 0.0],
	["bench_weathered", Vector3(-7, 0, 11), 0.0],
	["signpost_crooked", Vector3(-8, 0, 2), 0.0],
	["firewood_stack", Vector3(-22, 0, -5), 0.0],
	["crate_salvage", Vector3(22, 0, 11), 0.0],
	["rubble_stone_pile", Vector3(-20, 0, 14), 0.0],
	["rubble_broken_beams", Vector3(-19, 0, 15), 0.0],
	["rubble_stone_pile", Vector3(-16, 0, -12), 0.0],
	["rubble_broken_beams", Vector3(-15, 0, -11), 0.0],
	["rubble_stone_pile", Vector3(16, 0, -15), 0.0],
	["rubble_broken_beams", Vector3(17, 0, -14), 0.0],
	["rubble_stone_pile", Vector3(21, 0, 18), 0.0],
	["rubble_broken_beams", Vector3(22, 0, 19), 0.0],
	["rubble_stone_pile", Vector3(-9, 0, 18), 0.0],
	["rubble_broken_beams", Vector3(-8, 0, 19), 0.0],
	["rubble_stone_pile", Vector3(9, 0, -18), 0.0],
	["rubble_broken_beams", Vector3(10, 0, -17), 0.0],
	["fence_broken", Vector3(-24, 0, 19), 0.0],
	["fence_broken", Vector3(-21, 0, 19), 0.0],
	["fence_broken", Vector3(-18, 0, 19), 0.0],
	["fence_broken", Vector3(16, 0, 19), 0.0],
	["fence_broken", Vector3(19, 0, 19), 0.0],
	["fence_broken", Vector3(22, 0, 19), 0.0],
	["river_boulder_moss", Vector3(-5, 0, -14), 0.0],
	["river_boulder_moss", Vector3(5, 0, 13), 0.0],
	["river_boulder_moss", Vector3(-5, 0, 16), 0.0],
	["river_boulder_moss", Vector3(5, 0, -18), 0.0],
	["grass_dead_clump", Vector3(5, 0, -18), 0.0],
	["grass_dead_clump", Vector3(-8, 0, -11), 37.0],
	["grass_dead_clump", Vector3(11, 0, -4), 74.0],
	["grass_dead_clump", Vector3(-14, 0, 3), 111.0],
	["grass_dead_clump", Vector3(17, 0, 10), 148.0],
	["grass_dead_clump", Vector3(-20, 0, 17), 185.0],
	["grass_dead_clump", Vector3(23, 0, -12), 222.0],
	["grass_dead_clump", Vector3(-7, 0, -5), 259.0],
	["grass_dead_clump", Vector3(10, 0, 2), 296.0],
	["grass_dead_clump", Vector3(-13, 0, 9), 333.0],
	["grass_dead_clump", Vector3(16, 0, 16), 370.0],
	["grass_dead_clump", Vector3(-19, 0, -13), 407.0],
	["grass_dead_clump", Vector3(22, 0, -6), 444.0],
	["grass_dead_clump", Vector3(-6, 0, 1), 481.0],
	["grass_dead_clump", Vector3(9, 0, 8), 518.0],
	["grass_dead_clump", Vector3(-12, 0, 15), 555.0],
	["grass_dead_clump", Vector3(15, 0, -14), 592.0],
	["grass_dead_clump", Vector3(-18, 0, -7), 629.0],
	["grass_dead_clump", Vector3(21, 0, 0), 666.0],
	["grass_dead_clump", Vector3(-5, 0, 7), 703.0],
	["grass_dead_clump", Vector3(8, 0, 14), 740.0],
	["grass_dead_clump", Vector3(-11, 0, -15), 777.0],
	["grass_dead_clump", Vector3(14, 0, -8), 814.0],
	["grass_dead_clump", Vector3(-17, 0, -1), 851.0],
]


## Builds the village under [param nav_parent] and its lights under [param light_parent].
static func build(nav_parent: Node3D, light_parent: Node3D) -> void:
	var root := Node3D.new()
	root.name = "Village"
	root.position = ORIGIN
	nav_parent.add_child(root)
	_ground(root)
	_boundaries(root)
	_river_barrier(root)
	for entry in LAYOUT:
		place(root, entry[0], entry[1], entry[2])
	for x in LINK_ROADS:
		place(root, "road_dirt_straight", Vector3(x, 0.0, 0.0), 90.0)
	var forge: StaticBody3D = TerrainBuilder._static_body(root, FORGE["name"], FORGE["loot"])
	forge.position = FORGE["position"]
	var size: Vector3 = FORGE["box"]
	TerrainBuilder._box_collider(forge, size, Vector3(0.0, size.y * 0.5, 0.0))
	if TerrainBuilder._model(forge, "village/props/cold_forge", Vector3.ZERO, 0.0, 1.0) == null:
		TerrainBuilder._fallback_box(forge, size, Vector3(0.0, size.y * 0.5, 0.0))
	for l in LIGHTS:
		var base: Vector3 = ORIGIN + l["position"]
		if l["kind"] == "brazier":
			TerrainBuilder._brazier(light_parent, nav_parent, l["name"], base)
		else:
			TerrainBuilder._torch(light_parent, l["name"], base)


## Number of static bodies from [method build] outside the wrapper scenes.
static func collider_count() -> int:
	var braziers := 0
	for l in LIGHTS:
		if l["kind"] == "brazier":
			braziers += 1
	# Two banks, three boundary walls, two river barrier halves, the bridge rails, the forge.
	return 2 + 3 + 2 + 1 + 1 + braziers


## World position of a village-local point.
static func to_world(local: Vector3) -> Vector3:
	return ORIGIN + local


## Is the world x/z on solid village ground (a bank, not the river)?
static func on_land(world: Vector3) -> bool:
	var x := world.x - ORIGIN.x
	var z := world.z - ORIGIN.z
	if x < WEST_EDGE or x > EAST_EDGE or absf(z) > HALF_DEPTH:
		return false
	return absf(x) >= BANK_INNER or absf(z) <= BRIDGE_HALF_WIDTH


## Instances one wrapper scene (model + collider) at a local position.
static func place(parent: Node3D, asset: String, local: Vector3, yaw_degrees: float) -> Node3D:
	var path := SCENE_ROOT + asset + ".tscn"
	if not ResourceLoader.exists(path):
		push_warning("VillageBuilder: %s missing" % path)
		return null
	var inst := (load(path) as PackedScene).instantiate() as Node3D
	inst.position = local
	inst.rotation.y = deg_to_rad(yaw_degrees)
	parent.add_child(inst)
	if asset.begins_with("river_") and not asset.begins_with("river_bank") and not asset.begins_with("river_boulder"):
		_apply_water(inst)
	return inst


## Two grass banks with the river gap between them (top at y = 0).
static func _ground(root: Node3D) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = GRASS
	mat.roughness = 1.0
	for side in [["VillageGroundWest", WEST_EDGE, -BANK_INNER], ["VillageGroundEast", BANK_INNER, EAST_EDGE]]:
		var body: StaticBody3D = TerrainBuilder._static_body(root, side[0])
		var width: float = side[2] - side[1]
		var size := Vector3(width, 0.4, HALF_DEPTH * 2.0)
		body.position = Vector3((side[1] + side[2]) * 0.5, -0.2, 0.0)
		TerrainBuilder._box_collider(body, size, Vector3.ZERO)
		var mesh := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = size
		box.material = mat
		mesh.mesh = box
		body.add_child(mesh)


## Invisible walls around the village (the west side is the arena wall).
static func _boundaries(root: Node3D) -> void:
	var length := EAST_EDGE - WEST_EDGE + 1.0
	var mid := (EAST_EDGE + WEST_EDGE) * 0.5
	for side in [["VillageEdgeNorth", -1.0], ["VillageEdgeSouth", 1.0]]:
		var body: StaticBody3D = TerrainBuilder._static_body(root, side[0])
		body.position = Vector3(mid, 0.0, side[1] * (HALF_DEPTH + 0.5))
		TerrainBuilder._box_collider(body, Vector3(length, 4.0, 1.0), Vector3(0.0, 2.0, 0.0))
	var east: StaticBody3D = TerrainBuilder._static_body(root, "VillageEdgeEast")
	east.position = Vector3(EAST_EDGE + 0.5, 0.0, 0.0)
	TerrainBuilder._box_collider(east, Vector3(1.0, 4.0, HALF_DEPTH * 2.0 + 2.0), Vector3(0.0, 2.0, 0.0))


## Keeps walkers on the banks; open where the bridge crosses.
static func _river_barrier(root: Node3D) -> void:
	var length := HALF_DEPTH - BRIDGE_HALF_WIDTH
	for half in [["RiverBarrierNorth", -1.0], ["RiverBarrierSouth", 1.0]]:
		var body: StaticBody3D = TerrainBuilder._static_body(root, half[0])
		body.collision_layer = RIVER_LAYER
		body.position = Vector3(0.0, 0.0, half[1] * (BRIDGE_HALF_WIDTH + length * 0.5))
		for x in [-RIVER_BARRIER_X, RIVER_BARRIER_X]:
			TerrainBuilder._box_collider(body, Vector3(0.3, 2.0, length), Vector3(x, 1.0, 0.0))
	var rails: StaticBody3D = TerrainBuilder._static_body(root, "BridgeSideRails")
	rails.collision_layer = RIVER_LAYER
	var rail_length := BRIDGE_RAIL_TO - BRIDGE_RAIL_FROM
	var rail_mid := (BRIDGE_RAIL_TO + BRIDGE_RAIL_FROM) * 0.5
	for x in [-rail_mid, rail_mid]:
		for z in [-BRIDGE_RAIL_Z, BRIDGE_RAIL_Z]:
			TerrainBuilder._box_collider(rails, Vector3(rail_length, 2.0, 0.24), Vector3(x, 1.0, z))


## Gives the blue water surfaces of a river module the pack's ripple shader
## (in a night colour) and darkens the lighter foam surfaces to match.
static func _apply_water(node: Node) -> void:
	if node is MeshInstance3D and node.mesh != null:
		for i in node.mesh.get_surface_count():
			var material := node.mesh.surface_get_material(i) as StandardMaterial3D
			if material == null:
				continue
			var c := material.albedo_color
			if c.b - c.r > 0.4:
				var water := ShaderMaterial.new()
				water.shader = preload("res://assets/village/water.gdshader")
				water.set_shader_parameter("water_color", NIGHT_WATER)
				node.set_surface_override_material(i, water)
			elif c.b > 0.6 and c.b - c.r > 0.2:
				var foam := material.duplicate() as StandardMaterial3D
				foam.albedo_color = Color(c.r * 0.35, c.g * 0.35, c.b * 0.35, c.a)
				node.set_surface_override_material(i, foam)
	for child in node.get_children():
		_apply_water(child)
