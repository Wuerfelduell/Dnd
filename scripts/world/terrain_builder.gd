## Builds the level from the environment asset pack (KayKit Dungeon Remastered,
## Kenney Nature Kit and the pack's own grid platforms / stairs, all CC0) on a
## 4 m tile grid: floors, height levels with stairs, walls, pillars, cover,
## lights and decoration. Everything that matters for the rules gets a simple
## collider on layer 1 (boxes, cylinders, a slope under each staircase), so
## navmesh, [Terrain] heights and [Visibility] rays never depend on mesh details.
##
## Models are loaded from res://assets/ (see assets/START_HIER.txt and
## assets/asset_catalog.json for sizes). A missing model falls back to a plain
## box of the collider's size, so the game and the tests keep working.
class_name TerrainBuilder
extends RefCounted

const ASSET_ROOT := "res://assets/"
const TILE := 4.0
const ARENA_HALF := 20.0
## Wall tiles left out per side (index along the side): the south gate to the
## tavern yard and the cave mouth in the north wall.
const WALL_GAPS := {"south": [4, 5], "north": [2]}
## Tavern: a 16 x 12 m hall south of the arena (x -8..8, z 24..36) behind a yard.
const TAVERN_FLOOR_X := [-6.0, -2.0, 2.0, 6.0]
const TAVERN_FLOOR_Z := [26.0, 30.0, 34.0]
const YARD_Z := 22.0
## Wall modules (4 m, 3.2 m high). "door" leaves a 2 m opening in the middle.
const TAVERN_WALLS := [
	{"model": "environment_expansion/tavern/tavern_wall_window", "position": Vector3(-6, 0, 24), "rotation": 0.0},
	{"model": "environment_expansion/tavern/tavern_wall_door", "position": Vector3(-2, 0, 24), "rotation": 0.0, "door": true},
	{"model": "environment_expansion/tavern/tavern_wall_solid", "position": Vector3(2, 0, 24), "rotation": 0.0},
	{"model": "environment_expansion/tavern/tavern_wall_window", "position": Vector3(6, 0, 24), "rotation": 0.0},
	{"model": "environment_expansion/tavern/tavern_wall_solid", "position": Vector3(-6, 0, 36), "rotation": 180.0},
	{"model": "environment_expansion/tavern/tavern_wall_window", "position": Vector3(-2, 0, 36), "rotation": 180.0},
	{"model": "environment_expansion/tavern/tavern_wall_solid", "position": Vector3(2, 0, 36), "rotation": 180.0},
	{"model": "environment_expansion/tavern/tavern_wall_window", "position": Vector3(6, 0, 36), "rotation": 180.0},
	{"model": "environment_expansion/tavern/tavern_wall_window", "position": Vector3(-8, 0, 26), "rotation": 90.0},
	{"model": "environment_expansion/tavern/tavern_wall_solid", "position": Vector3(-8, 0, 30), "rotation": 90.0},
	{"model": "environment_expansion/tavern/tavern_wall_solid", "position": Vector3(-8, 0, 34), "rotation": 90.0},
	{"model": "environment_expansion/tavern/tavern_wall_solid", "position": Vector3(8, 0, 26), "rotation": -90.0},
	{"model": "environment_expansion/tavern/tavern_wall_window", "position": Vector3(8, 0, 30), "rotation": -90.0},
	{"model": "environment_expansion/tavern/tavern_wall_solid", "position": Vector3(8, 0, 34), "rotation": -90.0},
]
## Tavern furniture with box colliders (size after rotation handled by the body).
const TAVERN_FURNITURE := [
	{"name": "BarNorth", "model": "environment_expansion/tavern/tavern_bar_straight", "position": Vector3(5.6, 0, 29), "rotation": 90.0, "box": Vector3(4.0, 1.33, 1.2)},
	{"name": "BarSouth", "model": "environment_expansion/tavern/tavern_bar_straight", "position": Vector3(5.6, 0, 33), "rotation": 90.0, "box": Vector3(4.0, 1.33, 1.2)},
	{"name": "BottleRack", "model": "environment_expansion/tavern/tavern_bottle_rack", "position": Vector3(7.65, 0, 31), "rotation": -90.0, "box": Vector3(3.0, 2.2, 0.6)},
	{"name": "Fireplace", "model": "environment_expansion/tavern/tavern_fireplace", "position": Vector3(-7.2, 0, 30), "rotation": 90.0, "box": Vector3(2.8, 3.5, 1.5)},
	{"name": "Stage", "model": "environment_expansion/tavern/tavern_stage", "position": Vector3(-6, 0, 34.4), "rotation": 0.0, "box": Vector3(4.0, 0.49, 3.0)},
	{"name": "TableWest", "model": "environment_expansion/tavern/tavern_table_round", "position": Vector3(-2.5, 0, 28.5), "rotation": 0.0, "box": Vector3(2.0, 1.08, 2.0)},
	{"name": "TableEast", "model": "environment_expansion/tavern/tavern_table_round", "position": Vector3(1.5, 0, 33), "rotation": 0.0, "box": Vector3(2.0, 1.08, 2.0)},
	{"name": "BenchWest", "model": "environment_expansion/tavern/tavern_bench", "position": Vector3(-2.5, 0, 30.3), "rotation": 0.0, "box": Vector3(2.4, 0.54, 0.7)},
	{"name": "BenchEast", "model": "environment_expansion/tavern/tavern_bench", "position": Vector3(1.5, 0, 31.2), "rotation": 180.0, "box": Vector3(2.4, 0.54, 0.7)},
	{"name": "StoolA", "model": "environment_expansion/tavern/tavern_stool_tall", "position": Vector3(4.3, 0, 28.2), "rotation": 0.0, "box": Vector3(0.8, 0.96, 0.8)},
	{"name": "StoolB", "model": "environment_expansion/tavern/tavern_stool_tall", "position": Vector3(4.3, 0, 30.0), "rotation": 0.0, "box": Vector3(0.8, 0.96, 0.8)},
	{"name": "Keg", "model": "environment_expansion/licensed_props/tavern__keg", "position": Vector3(6.8, 0, 35.0), "rotation": 20.0, "box": Vector3(1.8, 2.05, 2.0)},
	{"name": "SmallBarrel", "model": "environment_expansion/licensed_props/tavern__barrel_small", "position": Vector3(-6.8, 0, 25.2), "rotation": 0.0, "box": Vector3(1.0, 1.02, 1.0)},
	{"name": "WaresTable", "model": "shop/models/merchant_wares_table", "position": Vector3(-4.5, 0, 25.0), "rotation": 0.0, "box": Vector3(2.0, 1.0, 1.0)},
]
## Potions standing on the bar (decoration).
const TAVERN_PROPS := [
	{"model": "shop/models/potion_health", "position": Vector3(5.4, 1.33, 27.6), "rotation": 0.0, "scale": 1.0},
	{"model": "shop/models/potion_mana", "position": Vector3(5.8, 1.33, 28.1), "rotation": 30.0, "scale": 1.0},
	{"model": "shop/models/potion_antidote", "position": Vector3(5.5, 1.33, 34.4), "rotation": 0.0, "scale": 1.0},
	{"model": "shop/models/loot_pouch", "position": Vector3(6.2, 1.33, 33.5), "rotation": 45.0, "scale": 1.0},
]
## Cave: 20 x 20 m north-west of the arena (x -20..0, z -40..-20), reached through the cave mouth.
const CAVE_FLOOR_X := [-18.0, -14.0, -10.0, -6.0, -2.0]
const CAVE_FLOOR_Z := [-38.0, -34.0, -30.0, -26.0, -22.0]
const CAVE_FEATURES := [
	{"name": "RockColumn", "model": "environment_expansion/cave/cave_rock_column", "position": Vector3(-7, 0, -30), "radius": 0.7, "height": 3.8},
	{"name": "StalagmiteA", "model": "environment_expansion/cave/cave_stalagmite_cluster", "position": Vector3(-16, 0, -37), "radius": 0.9, "height": 2.4},
	{"name": "StalagmiteB", "model": "environment_expansion/cave/cave_stalagmite_cluster", "position": Vector3(-3, 0, -24), "radius": 0.9, "height": 2.4},
	{"name": "StalagmiteC", "model": "environment_expansion/cave/cave_stalagmite_large", "position": Vector3(-11, 0, -33), "radius": 0.6, "height": 2.4},
	{"name": "BoulderLarge", "model": "environment_expansion/cave/cave_boulder_large", "position": Vector3(-13, 0, -27), "radius": 1.2, "height": 1.8},
	{"name": "BoulderFlat", "model": "environment_expansion/cave/cave_boulder_flat", "position": Vector3(-4, 0, -36), "radius": 1.2, "height": 0.7},
	{"name": "MineCart", "model": "environment_expansion/cave/cave_mine_cart", "position": Vector3(-14, 0, -31), "radius": 0.9, "height": 1.0},
	{"name": "TreasureChest", "model": "environment_expansion/licensed_props/cave__chest_gold", "position": Vector3(-5, 0, -39), "radius": 0.8, "height": 1.3, "rotation": 180.0, "loot": {"gold": 120, "items": ["potion_health", "potion_health", "potion_mana", "potion_strength"]}},
]
const CAVE_PROPS := [
	{"model": "environment_expansion/cave/cave_pool_water", "position": Vector3(-6, 0, -26), "rotation": 0.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_pool_toxic", "position": Vector3(-17, 0, -30), "rotation": 40.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_mine_rails", "position": Vector3(-14, 0, -35), "rotation": 0.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_mine_rails", "position": Vector3(-14, 0, -39), "rotation": 0.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_mine_support", "position": Vector3(-14, 0, -37), "rotation": 0.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_ore_deposit", "position": Vector3(-1.5, 0, -27.5), "rotation": 30.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_stalagmite_small", "position": Vector3(-9, 0, -24), "rotation": 0.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_stalagmite_small", "position": Vector3(-18, 0, -26), "rotation": 70.0, "scale": 1.2},
	{"model": "environment_expansion/cave/cave_stalagmite_small", "position": Vector3(-2, 0, -38), "rotation": 120.0, "scale": 1.1},
	{"model": "environment_expansion/licensed_props/cave__mushroom_tanGroup", "position": Vector3(-8, 0, -36), "rotation": 0.0, "scale": 3.0},
	{"model": "environment_expansion/licensed_props/cave__mushroom_tanGroup", "position": Vector3(-16.5, 0, -23.5), "rotation": 60.0, "scale": 3.0},
]
const STEP_HEIGHT := 0.25
const SLOPE_RUN_IN := 0.5
const FALLBACK := Color(0.5, 0.47, 0.43)
const FLAME := Color(1.0, 0.62, 0.2)
const TORCH_LIGHT := Color(1.0, 0.76, 0.48)

## Raised blocks made of 4x4 platform tiles: tile centres, the model and the top height.
const PLATEAUS := [
	{"name": "ArcherLedge", "model": "custom_grid/platform_4x4_h2", "height": 2.0,
		"cells": [Vector2(8, -18), Vector2(12, -18), Vector2(8, -14), Vector2(12, -14)]},
	{"name": "Overlook", "model": "custom_grid/platform_4x4_h2", "height": 2.0,
		"cells": [Vector2(-18, -6), Vector2(-18, -2)]},
	{"name": "Mound", "model": "custom_grid/platform_4x4_h1", "height": 1.0,
		"cells": [Vector2(-6, 4)]},
]
## Stairs: the model's origin is the centre of its bottom edge; it rises for
## [length] metres in the direction [rises] up to [height].
const STAIRS := [
	{"name": "LedgeStairs", "model": "custom_grid/stairs_grid_w4_h2", "base": Vector3(2, 0, -14), "rises": "east", "height": 2.0, "length": 4.0, "width": 4.0},
	{"name": "OverlookStairs", "model": "custom_grid/stairs_grid_w4_h2", "base": Vector3(-18, 0, 4), "rises": "north", "height": 2.0, "length": 4.0, "width": 4.0},
	{"name": "MoundStairs", "model": "custom_grid/stairs_grid_w4_h1", "base": Vector3(-6, 0, 8), "rises": "north", "height": 1.0, "length": 2.0, "width": 4.0},
]
## Obstacles with a box collider (size after scaling; cover for the rules).
const COVER := [
	{"name": "Crate1", "model": "kaykit/cover/box_large", "position": Vector3(-4, 0, -6), "rotation": 0.0, "scale": 0.66, "box": Vector3(1.0, 1.0, 1.0)},
	{"name": "Crate2", "model": "kaykit/cover/box_large", "position": Vector3(5, 0, -9), "rotation": 30.0, "scale": 0.66, "box": Vector3(1.0, 1.0, 1.0)},
	{"name": "Crate3", "model": "kaykit/cover/box_large", "position": Vector3(8, 0, 6), "rotation": 0.0, "scale": 0.66, "box": Vector3(1.0, 1.0, 1.0)},
	{"name": "CrateStack", "model": "kaykit/cover/crates_stacked", "position": Vector3(12, 0, -4), "rotation": 20.0, "scale": 1.0, "box": Vector3(2.1, 2.15, 2.25)},
	{"name": "Barrel", "model": "kaykit/cover/barrel_large", "position": Vector3(-5, 0, 16.5), "rotation": 0.0, "scale": 0.7, "box": Vector3(1.26, 1.4, 1.26)},
	{"name": "LowWallEast", "model": "custom_grid/cover_stone_low_2m", "position": Vector3(4.5, 0, -6), "rotation": 90.0, "scale": 1.0, "box": Vector3(2.08, 1.02, 0.58)},
	{"name": "LowWallWest", "model": "custom_grid/cover_stone_low_2m", "position": Vector3(-9.5, 0, -6), "rotation": 0.0, "scale": 1.0, "box": Vector3(2.08, 1.02, 0.58)},
	{"name": "Barricade", "model": "custom_grid/cover_wood_barricade", "position": Vector3(6, 0, 3), "rotation": 90.0, "scale": 1.0, "box": Vector3(2.0, 1.2, 0.5)},
	{"name": "Chest", "model": "kaykit/props/chest", "position": Vector3(3.5, 0, 16.5), "rotation": -20.0, "scale": 0.8, "box": Vector3(1.36, 1.04, 1.16), "loot": {"gold": 15, "items": ["potion_antidote", "arrows"]}},
	# Ruined shrine in the south-east corner: altar and sarcophagus are waist-high cover.
	{"name": "Altar", "model": "environment_expansion/ruins/ruin_altar", "position": Vector3(14, 0, 14), "rotation": 0.0, "scale": 1.0, "box": Vector3(2.2, 1.13, 1.6)},
	{"name": "Sarcophagus", "model": "environment_expansion/ruins/ruin_sarcophagus_closed", "position": Vector3(11, 0, 16.5), "rotation": 90.0, "scale": 1.0, "box": Vector3(1.6, 1.04, 2.8)},
	{"name": "FallenColumn", "model": "environment_expansion/ruins/ruin_column_fallen", "position": Vector3(-14, 0, 6), "rotation": 60.0, "scale": 1.0, "box": Vector3(1.0, 0.97, 3.35)},
	{"name": "Statue", "model": "environment_expansion/ruins/ruin_statue_worn", "position": Vector3(-17, 0, 11), "rotation": 120.0, "scale": 1.0, "box": Vector3(1.3, 2.2, 1.3)},
]
## Round obstacles with a cylinder collider.
const PILLARS := [
	{"name": "Pillar1", "model": "kaykit/pillars/pillar", "position": Vector3(-5, 0, -13), "radius": 0.75, "height": 4.0},
	{"name": "Pillar2", "model": "kaykit/pillars/pillar", "position": Vector3(-7, 0, -1), "radius": 0.75, "height": 4.0},
	{"name": "Pillar3", "model": "kaykit/pillars/pillar", "position": Vector3(16, 0, -8), "radius": 0.75, "height": 4.0},
	{"name": "PineA", "model": "kenney/trees/tree_pineRoundA", "position": Vector3(-16, 0, 16), "radius": 0.45, "height": 4.0, "scale": 3.2},
	{"name": "PineB", "model": "kenney/trees/tree_pineRoundB", "position": Vector3(16, 0, 15), "radius": 0.4, "height": 4.0, "scale": 3.4},
	{"name": "PineC", "model": "kenney/trees/tree_pineRoundB", "position": Vector3(-15, 0, -16), "radius": 0.4, "height": 4.0, "scale": 3.0},
	{"name": "PineD", "model": "kenney/trees/tree_pineRoundA", "position": Vector3(17, 0, 8), "radius": 0.45, "height": 4.0, "scale": 2.8},
	{"name": "HalfColumnA", "model": "environment_expansion/ruins/ruin_column_half", "position": Vector3(16, 0, 11), "radius": 0.6, "height": 1.92},
	{"name": "HalfColumnB", "model": "environment_expansion/ruins/ruin_column_half", "position": Vector3(-14, 0, -12), "radius": 0.6, "height": 1.92},
	{"name": "ArchLegWest", "model": "environment_expansion/ruins/ruin_arch_broken", "position": Vector3(-13, 0, 14), "radius": 0.45, "height": 3.6, "rotation": 30.0, "collider_offset": Vector3(-1.8, 0, 0)},
	{"name": "Stalagmite", "model": "environment_expansion/cave/cave_stalagmite_large", "position": Vector3(-7, 0, -15.5), "radius": 0.55, "height": 2.4},
]
## Decoration without collision (scale, rotation in degrees).
const PROPS := [
	{"model": "kenney/rocks/rock_largeA", "position": Vector3(-14, 0, 12), "rotation": 40.0, "scale": 2.5},
	{"model": "kenney/rocks/rock_largeB", "position": Vector3(15, 0, -1), "rotation": -70.0, "scale": 2.2},
	{"model": "kenney/rocks/rock_largeB", "position": Vector3(-17.5, 0, -14), "rotation": 15.0, "scale": 2.0},
	{"model": "kenney/props/tent_detailedOpen", "position": Vector3(3, 0, -18.5), "rotation": 160.0, "scale": 3.0},
	{"model": "kenney/props/tent_detailedOpen", "position": Vector3(-15.5, 0, -18.3), "rotation": 200.0, "scale": 3.0},
	# Cave mouth in the north wall: where later waves come from and the way into the cave.
	{"model": "environment_expansion/cave/cave_tunnel_arch_4", "position": Vector3(-10, 0, -20.0), "rotation": 0.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_crystals_cyan", "position": Vector3(-12.6, 0, -18.2), "rotation": 20.0, "scale": 1.0},
	{"model": "environment_expansion/cave/cave_crystals_purple", "position": Vector3(-7.3, 0, -18.3), "rotation": -40.0, "scale": 0.8},
	{"model": "environment_expansion/cave/cave_glowing_fungi", "position": Vector3(-8.5, 0, -16.8), "rotation": 0.0, "scale": 1.0},
	{"model": "environment_expansion/ruins/ruin_rubble_small", "position": Vector3(14.5, 0, 17.5), "rotation": 10.0, "scale": 1.0},
	{"model": "environment_expansion/ruins/ruin_rubble_small", "position": Vector3(-16, 0, 4), "rotation": 75.0, "scale": 0.9},
	{"model": "kenney/foliage/plant_bush", "position": Vector3(-11, 0, 11), "rotation": 0.0, "scale": 3.0},
	{"model": "kenney/foliage/plant_bush", "position": Vector3(13, 0, 11), "rotation": 90.0, "scale": 3.0},
	{"model": "kenney/foliage/plant_bush", "position": Vector3(-15, 0, 8), "rotation": 45.0, "scale": 2.5},
	{"model": "kenney/foliage/grass_large", "position": Vector3(10, 0, 10), "rotation": 0.0, "scale": 3.0},
	{"model": "kenney/foliage/grass_large", "position": Vector3(-10, 0, -10), "rotation": 60.0, "scale": 3.0},
	{"model": "kenney/foliage/grass_large", "position": Vector3(14, 0, 3), "rotation": 120.0, "scale": 3.0},
	{"model": "kenney/foliage/mushroom_red", "position": Vector3(-15.5, 0, 14.5), "rotation": 0.0, "scale": 3.0},
	{"model": "kenney/foliage/mushroom_red", "position": Vector3(-14, 0, -15), "rotation": 70.0, "scale": 3.0},
]
## Light sources: base position on the ground and the kind.
const LIGHTS := [
	{"name": "CampTorchWest", "position": Vector3(-2.5, 0.0, 10.0), "kind": "torch"},
	{"name": "CampTorchEast", "position": Vector3(2.5, 0.0, 10.0), "kind": "torch"},
	{"name": "Campfire", "position": Vector3(0.0, 0.0, -11.5), "kind": "campfire"},
	{"name": "LedgeTorch", "position": Vector3(9.0, 2.0, -16.0), "kind": "torch"},
	{"name": "WestTorch", "position": Vector3(-6.0, 0.0, -5.0), "kind": "torch"},
	{"name": "EastTorch", "position": Vector3(8.0, 0.0, -2.0), "kind": "torch"},
	{"name": "SouthEastTorch", "position": Vector3(12.0, 0.0, 6.0), "kind": "torch"},
	{"name": "ShrineBrazier", "position": Vector3(16.5, 0.0, 15.5), "kind": "brazier"},
	{"name": "Runestone", "position": Vector3(-16.5, 0.0, 16.0), "kind": "runestone"},
	{"name": "CaveCrystals", "position": Vector3(-10.0, 0.0, -17.5), "kind": "crystal"},
	{"name": "Hearth", "position": Vector3(-6.4, 0.0, 30.0), "kind": "hearth"},
	{"name": "Chandelier", "position": Vector3(0.0, 0.0, 30.0), "kind": "chandelier"},
	{"name": "CandleWest", "position": Vector3(-2.5, 1.08, 28.5), "kind": "candle"},
	{"name": "CandleEast", "position": Vector3(1.5, 1.08, 33.0), "kind": "candle"},
	{"name": "BarCandle", "position": Vector3(6.1, 1.33, 31.0), "kind": "candle"},
	{"name": "YardTorchWest", "position": Vector3(-5.0, 0.0, 22.5), "kind": "torch"},
	{"name": "YardTorchEast", "position": Vector3(3.0, 0.0, 22.5), "kind": "torch"},
	{"name": "CaveCrystalCyan", "position": Vector3(-18.5, 0.0, -23.0), "kind": "crystal_cyan"},
	{"name": "CaveCrystalPurple", "position": Vector3(-1.5, 0.0, -33.0), "kind": "crystal_purple"},
	{"name": "CaveCrystalAmber", "position": Vector3(-18.8, 0.0, -38.5), "kind": "crystal_amber"},
	{"name": "CaveFungi", "position": Vector3(-9.0, 0.0, -37.5), "kind": "fungi"},
]
## Wall pieces that differ from the plain wall, keyed by side and tile index.
const WALL_VARIANTS := {
	"north": {2: "kaykit/walls/wall_broken", 7: "kaykit/walls/wall_doorway"},
	"east": {4: "kaykit/walls/wall_broken"},
	"west": {6: "kaykit/walls/wall_doorway"},
	"south": {1: "kaykit/walls/wall_broken", 8: "kaykit/walls/wall_broken"},
}

static var _scene_cache: Dictionary = {}


## Builds terrain under [param nav_parent] (baked into the navmesh) and lights
## under [param light_parent].
static func build(nav_parent: Node3D, light_parent: Node3D) -> void:
	_floors(nav_parent)
	_walls(nav_parent)
	_tavern(nav_parent)
	_cave(nav_parent)
	for p in PLATEAUS:
		_plateau(nav_parent, p)
	for s in STAIRS:
		_stairs(nav_parent, s)
	for c in COVER:
		_cover(nav_parent, c)
	for p in PILLARS:
		_pillar(nav_parent, p)
	var decor := Node3D.new()
	decor.name = "Decoration"
	light_parent.add_child(decor)
	for p in PROPS:
		_model(decor, p["model"], p["position"], p["rotation"], p["scale"])
	for l in LIGHTS:
		match l["kind"]:
			"campfire":
				_campfire(light_parent, nav_parent, l["name"], l["position"])
			"brazier":
				_brazier(light_parent, nav_parent, l["name"], l["position"])
			"runestone":
				_glow(light_parent, nav_parent, l["name"], l["position"], "environment_expansion/ruins/ruin_runestone", Color(0.4, 0.9, 1.0), 4.0, Vector2(0.6, 2.54), 1.6)
			"crystal":
				_glow(light_parent, null, l["name"], l["position"], "", Color(0.45, 0.85, 1.0), 4.5, Vector2.ZERO, 0.8)
			"crystal_cyan":
				_glow(light_parent, nav_parent, l["name"], l["position"], "environment_expansion/cave/cave_crystals_cyan", Color(0.45, 0.85, 1.0), 4.5, Vector2(0.6, 1.5), 1.4)
			"crystal_purple":
				_glow(light_parent, nav_parent, l["name"], l["position"], "environment_expansion/cave/cave_crystals_purple", Color(0.75, 0.45, 1.0), 4.5, Vector2(0.6, 1.5), 1.4)
			"crystal_amber":
				_glow(light_parent, nav_parent, l["name"], l["position"], "environment_expansion/cave/cave_crystals_amber", Color(1.0, 0.75, 0.35), 4.5, Vector2(0.6, 1.5), 1.4)
			"fungi":
				_glow(light_parent, null, l["name"], l["position"], "environment_expansion/cave/cave_glowing_fungi", Color(0.5, 1.0, 0.7), 3.5, Vector2.ZERO, 1.0)
			"hearth":
				_glow(light_parent, null, l["name"], l["position"], "environment_expansion/tavern/tavern_hearth_fire", Color(1.0, 0.7, 0.4), 7.0, Vector2.ZERO, 2.4)
			"chandelier":
				_chandelier(light_parent, l["name"], l["position"])
			"candle":
				_glow(light_parent, null, l["name"], l["position"], "environment_expansion/licensed_props/tavern__candle_lit", Color(1.0, 0.85, 0.6), 2.5, Vector2.ZERO, 0.7)
			_:
				_torch(light_parent, l["name"], l["position"])


## Number of static bodies [method build] creates (tests cross-check the scene).
static func collider_count() -> int:
	var lights := 0
	for l in LIGHTS:
		if l["kind"] in ["campfire", "brazier", "runestone", "crystal_cyan", "crystal_purple", "crystal_amber"]:
			lights += 1
	var wall_segments := 0
	for side in ["north", "south", "east", "west"]:
		# Adjacent gaps merge into one opening.
		var gaps: Array = WALL_GAPS.get(side, []).duplicate()
		gaps.sort()
		var openings := 0
		for i in gaps.size():
			if i == 0 or gaps[i] != gaps[i - 1] + 1:
				openings += 1
		wall_segments += openings + 1
	return PLATEAUS.size() + STAIRS.size() + COVER.size() + PILLARS.size() + wall_segments + 2 \
		+ TAVERN_WALLS.size() + TAVERN_FURNITURE.size() + 3 + CAVE_FEATURES.size() + lights


## Footprint of a plateau or staircase entry.
static func footprint(entry: Dictionary) -> Rect2:
	if entry.has("cells"):
		var rect := Rect2()
		for i in entry["cells"].size():
			var c: Vector2 = entry["cells"][i]
			var cell := Rect2(c.x - TILE * 0.5, c.y - TILE * 0.5, TILE, TILE)
			rect = cell if i == 0 else rect.merge(cell)
		return rect
	var base: Vector3 = entry["base"]
	var length: float = entry["length"]
	var half_w: float = entry["width"] * 0.5
	match entry["rises"]:
		"east":
			return Rect2(base.x, base.z - half_w, length, entry["width"])
		"west":
			return Rect2(base.x - length, base.z - half_w, length, entry["width"])
		"south":
			return Rect2(base.x - half_w, base.z, entry["width"], length)
	return Rect2(base.x - half_w, base.z - length, entry["width"], length)


## Height of the layout at an x/z position (0 = ground), from the data only.
## Used by tests to cross-check the physics answer of [Terrain].
static func layout_height(x: float, z: float) -> float:
	var h := 0.0
	for p in PLATEAUS:
		if _inside(footprint(p), x, z):
			h = maxf(h, p["height"])
	for s in STAIRS:
		var rect := footprint(s)
		if _inside(rect, x, z):
			var t := 0.0
			match s["rises"]:
				"east":
					t = (x - rect.position.x) / rect.size.x
				"west":
					t = (rect.end.x - x) / rect.size.x
				"south":
					t = (z - rect.position.y) / rect.size.y
				"north":
					t = (rect.end.y - z) / rect.size.y
			h = maxf(h, s["height"] * clampf(t, 0.0, 1.0))
	return h


static func _inside(rect: Rect2, x: float, z: float) -> bool:
	return x >= rect.position.x and x <= rect.end.x and z >= rect.position.y and z <= rect.end.y


# --- Pieces ----------------------------------------------------------------

## 4x4 floor tiles: grass, with earth around both camps and a stone road between them.
static func _floors(parent: Node3D) -> void:
	var floors := Node3D.new()
	floors.name = "Floors"
	parent.add_child(floors)
	var n := int(ARENA_HALF * 2.0 / TILE)
	for ix in n:
		for iz in n:
			var x := -ARENA_HALF + TILE * (ix + 0.5)
			var z := -ARENA_HALF + TILE * (iz + 0.5)
			var model := "custom_grid/floor_grass_4x4"
			var top := 0.0
			if absf(x) <= TILE and absf(z) <= 2.0 * TILE:
				model = "kaykit/floors/floor_tile_large"
				top = 0.05
			elif absf(x) <= TILE and (absf(z - 12.0) <= TILE or absf(z + 12.0) <= TILE):
				model = "custom_grid/floor_earth_4x4"
			_model(floors, model, Vector3(x, -top, z), 90.0 * ((ix * 7 + iz * 3) % 4), 1.0)
	# Tavern yard (earth) and the tavern's oak floor.
	for x in TAVERN_FLOOR_X:
		_model(floors, "custom_grid/floor_earth_4x4", Vector3(x, 0.0, YARD_Z), 0.0, 1.0)
		for z in TAVERN_FLOOR_Z:
			var oak := "environment_expansion/tavern/tavern_floor_dark" if x > 4.0 else "environment_expansion/tavern/tavern_floor_oak"
			_model(floors, oak, Vector3(x, -0.04, z), 0.0, 1.0)
	# Cave floor: dry rock with wet and gravel patches.
	for i in CAVE_FLOOR_X.size():
		for j in CAVE_FLOOR_Z.size():
			var kinds := ["cave_floor_dry", "cave_floor_dry", "cave_floor_wet", "cave_floor_gravel"]
			var kind: String = kinds[(i * 3 + j * 5) % kinds.size()]
			_model(floors, "environment_expansion/cave/" + kind, Vector3(CAVE_FLOOR_X[i], -0.09, CAVE_FLOOR_Z[j]), 90.0 * ((i + j * 2) % 4), 1.0)


## Ten wall pieces per side; one collider per unbroken stretch, gaps for the
## south gate and the cave mouth.
static func _walls(parent: Node3D) -> void:
	var n := int(ARENA_HALF * 2.0 / TILE)
	for side in ["north", "south", "east", "west"]:
		var body := _static_body(parent, "Wall" + side.capitalize())
		var along_x: bool = side == "north" or side == "south"
		var sign: float = -1.0 if side == "north" or side == "west" else 1.0
		body.position = Vector3(0.0, 0.0, sign * ARENA_HALF) if along_x else Vector3(sign * ARENA_HALF, 0.0, 0.0)
		var gaps: Array = WALL_GAPS.get(side, [])
		# Collider stretches between gaps (tile edges), slightly past the corners.
		var start := -ARENA_HALF - 0.5
		var cuts: Array = []
		for g in gaps:
			cuts.append([-ARENA_HALF + TILE * g, -ARENA_HALF + TILE * (g + 1)])
		cuts.append([ARENA_HALF + 0.5, ARENA_HALF + 0.5])
		var segment := 0
		for c in cuts:
			var length: float = c[0] - start
			if length > 0.01:
				var mid: float = (start + c[0]) * 0.5
				var seg_body := body if segment == 0 else _static_body(parent, "Wall%s%d" % [side.capitalize(), segment])
				if segment > 0:
					seg_body.position = body.position
				_box_collider(seg_body, Vector3(length, 4.0, 1.0) if along_x else Vector3(1.0, 4.0, length),
					Vector3(mid, 2.0, 0.0) if along_x else Vector3(0.0, 2.0, mid))
				segment += 1
			start = c[1]
		var variants: Dictionary = WALL_VARIANTS.get(side, {})
		for i in n:
			if gaps.has(i):
				continue
			var offset := -ARENA_HALF + TILE * (i + 0.5)
			var model: String = variants.get(i, "kaykit/walls/wall")
			var local := Vector3(offset, 0.0, 0.0) if along_x else Vector3(0.0, 0.0, offset)
			# The wall's front faces -Z in the model; turn each side to face the arena.
			var yaw := 0.0
			match side:
				"north":
					yaw = 180.0
				"east":
					yaw = 90.0
				"west":
					yaw = -90.0
			var inst := _model(body, model, local, yaw, 1.0)
			if inst == null:
				_fallback_box(body, Vector3(TILE, 4.0, 1.0), local + Vector3(0.0, 2.0, 0.0))
	# Gate posts beside the south gate and the legs of the cave mouth arch.
	_pillar(parent, {"name": "GatePostWest", "model": "kaykit/pillars/pillar", "position": Vector3(-4.75, 0, ARENA_HALF), "radius": 0.75, "height": 4.0})
	_pillar(parent, {"name": "GatePostEast", "model": "kaykit/pillars/pillar", "position": Vector3(4.75, 0, ARENA_HALF), "radius": 0.75, "height": 4.0})


static func _plateau(parent: Node3D, entry: Dictionary) -> StaticBody3D:
	var body := _static_body(parent, entry["name"])
	var rect := footprint(entry)
	var height: float = entry["height"]
	var center := rect.get_center()
	body.position = Vector3(center.x, 0.0, center.y)
	_box_collider(body, Vector3(rect.size.x, height + 0.5, rect.size.y), Vector3(0.0, (height - 0.5) * 0.5, 0.0))
	for c in entry["cells"]:
		var local := Vector3(c.x - center.x, 0.0, c.y - center.y)
		if _model(body, entry["model"], local, 0.0, 1.0) == null:
			_fallback_box(body, Vector3(TILE, height, TILE), local + Vector3(0.0, height * 0.5, 0.0))
	return body


## The stair model plus a sloped collider so figures glide up (CharacterBody3D
## cannot climb 25 cm steps on its own). The slope starts [constant SLOPE_RUN_IN]
## before the first step just below the ground and ends exactly on the plateau,
## so there is no lip at either end; figures float or sink by a few centimetres
## on the steps, which the tabletop look forgives.
static func _stairs(parent: Node3D, entry: Dictionary) -> Node3D:
	var pivot := Node3D.new()
	pivot.name = entry["name"]
	var rect := footprint(entry)
	var center := rect.get_center()
	pivot.position = Vector3(center.x, 0.0, center.y)
	# Pivot: local +X is the rising direction.
	match entry["rises"]:
		"east":
			pivot.rotation.y = 0.0
		"west":
			pivot.rotation.y = PI
		"north":
			pivot.rotation.y = PI * 0.5
		"south":
			pivot.rotation.y = -PI * 0.5
	parent.add_child(pivot)
	var height: float = entry["height"]
	var length: float = entry["length"]
	var width: float = entry["width"]
	var body := _static_body(pivot, "Slope")
	var foot := Vector3(-length * 0.5 - SLOPE_RUN_IN, -0.05, 0.0)
	var crest := Vector3(length * 0.5, height, 0.0)
	var run := crest - foot
	var slant := run.length()
	var thickness := 0.6
	var angle := atan2(run.y, run.x)
	var normal := Vector3(-sin(angle), cos(angle), 0.0)
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(slant, thickness, width)
	shape.shape = box
	shape.position = (foot + crest) * 0.5 - normal * thickness * 0.5
	shape.rotation.z = angle
	body.add_child(shape)
	# The model rises along its own +Z from its bottom edge: turn +Z onto local +X.
	var inst := _model(pivot, entry["model"], Vector3(-length * 0.5, 0.0, 0.0), 90.0, 1.0)
	if inst == null:
		var steps := int(round(height / STEP_HEIGHT))
		for i in steps:
			var top := height * (i + 1) / steps
			_fallback_box(pivot, Vector3(length / steps, top, width), Vector3(-length * 0.5 + length / steps * (i + 0.5), top * 0.5, 0.0))
	return pivot


static func _cover(parent: Node3D, entry: Dictionary) -> StaticBody3D:
	var body := _static_body(parent, entry["name"], entry.get("loot", {}))
	body.position = entry["position"]
	body.rotation.y = deg_to_rad(entry["rotation"])
	var size: Vector3 = entry["box"]
	_box_collider(body, size, Vector3(0.0, size.y * 0.5, 0.0))
	if _model(body, entry["model"], Vector3.ZERO, 0.0, entry["scale"]) == null:
		_fallback_box(body, size, Vector3(0.0, size.y * 0.5, 0.0))
	return body


static func _pillar(parent: Node3D, entry: Dictionary) -> StaticBody3D:
	var body := _static_body(parent, entry["name"], entry.get("loot", {}))
	body.position = entry["position"]
	body.rotation.y = deg_to_rad(entry.get("rotation", 0.0))
	var shape := CollisionShape3D.new()
	var cyl := CylinderShape3D.new()
	cyl.radius = entry["radius"]
	cyl.height = entry["height"]
	shape.shape = cyl
	shape.position = Vector3(0.0, entry["height"] * 0.5, 0.0) + entry.get("collider_offset", Vector3.ZERO)
	body.add_child(shape)
	if _model(body, entry["model"], Vector3.ZERO, 0.0, entry.get("scale", 1.0)) == null:
		_fallback_box(body, Vector3(entry["radius"] * 2.0, entry["height"], entry["radius"] * 2.0), Vector3(0.0, entry["height"] * 0.5, 0.0))
	return body


static func _torch(parent: Node3D, name: String, base: Vector3) -> LightSource:
	var light := LightSource.new()
	light.name = name
	light.radius_m = 6.0
	light.position = base + Vector3.UP * 1.8
	parent.add_child(light)
	# The torch model's handle is centred on its origin; stand it in the ground, scaled up.
	if _model(light, "kaykit/lighting/torch_lit", Vector3(0.0, -1.8 + 0.64, 0.0), 0.0, 1.6) == null:
		_fallback_box(light, Vector3(0.1, 1.7, 0.1), Vector3(0.0, -0.95, 0.0))
	_mesh_part(light, _sphere_mesh(0.14), Vector3(0.0, 0.0, 0.0), FLAME, true)
	_omni(light, Vector3(0.0, 0.2, 0.0), 9.0, 2.2)
	return light


static func _campfire(parent: Node3D, nav_parent: Node3D, name: String, base: Vector3) -> LightSource:
	var light := LightSource.new()
	light.name = name
	light.radius_m = 7.0
	light.position = base + Vector3.UP * 0.5
	parent.add_child(light)
	if _model(light, "kenney/props/campfire_stones", Vector3(0.0, -0.5 + 0.12, 0.0), 0.0, 2.6) == null:
		_mesh_part(light, _cylinder_mesh(0.7, 0.3), Vector3(0.0, -0.35, 0.0), Color(0.3, 0.28, 0.26), false)
	_model(light, "kenney/props/campfire_logs", Vector3(0.0, -0.5 + 0.14, 0.0), 30.0, 2.6)
	_mesh_part(light, _sphere_mesh(0.3), Vector3(0.0, -0.1, 0.0), FLAME, true)
	_mesh_part(light, _sphere_mesh(0.17), Vector3(0.0, 0.2, 0.0), Color(1.0, 0.85, 0.4), true)
	_omni(light, Vector3.ZERO, 11.0, 2.8)
	# Nobody walks through the fire: a collider taller than the navmesh's step.
	var body := _static_body(nav_parent, name + "Pit")
	body.position = base
	var shape := CollisionShape3D.new()
	var cyl := CylinderShape3D.new()
	cyl.radius = 0.7
	cyl.height = 0.7
	shape.shape = cyl
	shape.position = Vector3(0.0, 0.35, 0.0)
	body.add_child(shape)
	return light


## The tavern hall: wall modules with one door, furniture with colliders.
static func _tavern(parent: Node3D) -> void:
	for w in TAVERN_WALLS:
		var body := _static_body(parent, "TavernWall%d" % parent.get_child_count())
		body.position = w["position"]
		body.rotation.y = deg_to_rad(w["rotation"])
		if w.get("door", false):
			_box_collider(body, Vector3(1.0, 3.2, 0.4), Vector3(-1.5, 1.6, 0.0))
			_box_collider(body, Vector3(1.0, 3.2, 0.4), Vector3(1.5, 1.6, 0.0))
		else:
			_box_collider(body, Vector3(4.05, 3.2, 0.4), Vector3(0.0, 1.6, 0.0))
		if _model(body, w["model"], Vector3.ZERO, 0.0, 1.0) == null:
			_fallback_box(body, Vector3(4.05, 3.2, 0.4), Vector3(0.0, 1.6, 0.0))
	for f in TAVERN_FURNITURE:
		_cover(parent, {"name": f["name"], "model": f["model"], "position": f["position"], "rotation": f["rotation"], "scale": 1.0, "box": f["box"]})
	# Sign beside the door and the wares on the bar are decoration.
	_model(parent, "environment_expansion/tavern/tavern_inn_sign", Vector3(0.2, 0.0, 23.7), 0.0, 1.0)
	for p in TAVERN_PROPS:
		_model(parent, p["model"], p["position"], p["rotation"], p["scale"])


## The cave: rock walls on three sides (the fourth is the arena's north wall),
## rock features with cylinder colliders, pools and rails as decoration.
static func _cave(parent: Node3D) -> void:
	var west := _static_body(parent, "CaveWallWest")
	west.position = Vector3(-ARENA_HALF, 0.0, -30.0)
	_box_collider(west, Vector3(1.4, 3.9, 21.0), Vector3(0.0, 1.95, 0.0))
	var east := _static_body(parent, "CaveWallEast")
	east.position = Vector3(0.0, 0.0, -30.0)
	_box_collider(east, Vector3(1.4, 3.9, 21.0), Vector3(0.0, 1.95, 0.0))
	var north := _static_body(parent, "CaveWallNorth")
	north.position = Vector3(-10.0, 0.0, -40.0)
	_box_collider(north, Vector3(22.0, 3.9, 1.4), Vector3(0.0, 1.95, 0.0))
	for i in CAVE_FLOOR_Z.size():
		var z: float = CAVE_FLOOR_Z[i]
		var model := "environment_expansion/cave/cave_wall_a" if i % 2 == 0 else "environment_expansion/cave/cave_wall_b"
		if _model(west, model, Vector3(0.0, 0.0, z + 30.0), 90.0, 1.0) == null:
			_fallback_box(west, Vector3(1.4, 3.9, TILE), Vector3(0.0, 1.95, z + 30.0))
		if _model(east, model, Vector3(0.0, 0.0, z + 30.0), -90.0, 1.0) == null:
			_fallback_box(east, Vector3(1.4, 3.9, TILE), Vector3(0.0, 1.95, z + 30.0))
	for i in CAVE_FLOOR_X.size():
		var x: float = CAVE_FLOOR_X[i]
		var model := "environment_expansion/cave/cave_wall_b" if i % 2 == 0 else "environment_expansion/cave/cave_wall_a"
		if _model(north, model, Vector3(x + 10.0, 0.0, 0.0), 0.0, 1.0) == null:
			_fallback_box(north, Vector3(TILE, 3.9, 1.4), Vector3(x + 10.0, 1.95, 0.0))
	for f in CAVE_FEATURES:
		_pillar(parent, f)
	var decor := Node3D.new()
	decor.name = "CaveDecoration"
	parent.add_child(decor)
	for p in CAVE_PROPS:
		_model(decor, p["model"], p["position"], p["rotation"], p["scale"])


## Chandelier hanging under the (invisible) ceiling: light only.
static func _chandelier(parent: Node3D, name: String, base: Vector3) -> LightSource:
	var light := LightSource.new()
	light.name = name
	light.radius_m = 9.0
	light.position = base + Vector3.UP * 3.0
	parent.add_child(light)
	_model(light, "environment_expansion/tavern/tavern_chandelier", Vector3(0.0, -1.4, 0.0), 0.0, 1.0)
	_omni(light, Vector3(0.0, -0.5, 0.0), 12.0, 2.2)
	return light


## Stone brazier with a fire: a light source and a small obstacle.
static func _brazier(parent: Node3D, nav_parent: Node3D, name: String, base: Vector3) -> LightSource:
	var light := LightSource.new()
	light.name = name
	light.radius_m = 5.0
	light.position = base + Vector3.UP * 1.7
	parent.add_child(light)
	if _model(light, "environment_expansion/ruins/ruin_brazier", Vector3(0.0, -1.7, 0.0), 0.0, 1.0) == null:
		_fallback_box(light, Vector3(0.8, 1.6, 0.8), Vector3(0.0, -0.9, 0.0))
	_mesh_part(light, _sphere_mesh(0.2), Vector3(0.0, 0.05, 0.0), FLAME, true)
	_omni(light, Vector3(0.0, 0.2, 0.0), 8.0, 2.0)
	var body := _static_body(nav_parent, name + "Base")
	body.position = base
	var shape := CollisionShape3D.new()
	var cyl := CylinderShape3D.new()
	cyl.radius = 0.55
	cyl.height = 1.6
	shape.shape = cyl
	shape.position = Vector3(0.0, 0.8, 0.0)
	body.add_child(shape)
	return light


## A glowing object (rune stone, crystals): coloured light, optional collider.
static func _glow(parent: Node3D, nav_parent: Node3D, name: String, base: Vector3, model: String, color: Color, radius_m: float, collider: Vector2, energy: float) -> LightSource:
	var light := LightSource.new()
	light.name = name
	light.radius_m = radius_m
	light.position = base + Vector3.UP * 1.2
	parent.add_child(light)
	if model != "":
		_model(light, model, Vector3(0.0, -1.2, 0.0), 0.0, 1.0)
	var omni := _omni(light, Vector3.ZERO, radius_m + 2.0, energy)
	omni.light_color = color
	if nav_parent != null and collider != Vector2.ZERO:
		var body := _static_body(nav_parent, name + "Base")
		body.position = base
		var shape := CollisionShape3D.new()
		var cyl := CylinderShape3D.new()
		cyl.radius = collider.x
		cyl.height = collider.y
		shape.shape = cyl
		shape.position = Vector3(0.0, collider.y * 0.5, 0.0)
		body.add_child(shape)
	return light


# --- Helpers ---------------------------------------------------------------

## Instantiates a model from the asset pack; null when it is not available.
static func _model(parent: Node3D, model: String, position: Vector3, yaw_degrees: float, scale: float) -> Node3D:
	var scene := _scene(model)
	if scene == null:
		return null
	var inst := scene.instantiate() as Node3D
	if inst == null:
		return null
	inst.position = position
	inst.rotation.y = deg_to_rad(yaw_degrees)
	inst.scale = Vector3.ONE * scale
	parent.add_child(inst)
	return inst


static func _scene(model: String) -> PackedScene:
	if _scene_cache.has(model):
		return _scene_cache[model]
	var path := ASSET_ROOT + model + ".glb"
	var scene: PackedScene = null
	if ResourceLoader.exists(path):
		scene = load(path) as PackedScene
	if scene == null:
		push_warning("TerrainBuilder: model %s not available, using a placeholder box" % path)
	_scene_cache[model] = scene
	return scene


static func _static_body(parent: Node3D, name: String, loot: Dictionary = {}) -> StaticBody3D:
	var body: StaticBody3D
	if loot.is_empty():
		body = StaticBody3D.new()
	else:
		var chest := LootChest.new()
		chest.gold = loot.get("gold", 0)
		chest.item_ids = PackedStringArray(loot.get("items", []))
		body = chest
	body.name = name
	body.collision_layer = 1
	body.collision_mask = 0
	parent.add_child(body)
	return body


static func _box_collider(body: StaticBody3D, size: Vector3, position: Vector3) -> void:
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = size
	shape.shape = box
	shape.position = position
	body.add_child(shape)


static func _fallback_box(parent: Node3D, size: Vector3, position: Vector3) -> MeshInstance3D:
	var mesh := BoxMesh.new()
	mesh.size = size
	return _mesh_part(parent, mesh, position, FALLBACK, false)


static func _mesh_part(parent: Node3D, mesh: Mesh, position: Vector3, color: Color, glow: bool) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	if glow:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 2.0
	inst.material_override = mat
	inst.position = position
	parent.add_child(inst)
	return inst


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
