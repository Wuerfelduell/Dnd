## Height queries against the static level geometry (collision layer 1).
##
## The level is made of blocks, ramps and stairs with different heights, so
## "where is the ground here?" is answered by a ray straight down. Everything
## that needs a point on the ground (taps, teleports, path previews, approach
## points) goes through here, so swapping the generated tiles for real
## GridMap tiles later changes nothing else.
class_name Terrain
extends RefCounted

const WORLD_MASK := 1
const PROBE_UP := 12.0
const PROBE_DOWN := 4.0


## Height of the highest walkable surface at [param point] (x/z). Returns
## [param point].y when there is no world to ask (tests) or nothing below.
static func ground_height(node: Node3D, point: Vector3) -> float:
	if node == null or not node.is_inside_tree():
		return point.y
	var world := node.get_world_3d()
	if world == null:
		return point.y
	var space := world.direct_space_state
	if space == null:
		return point.y
	var query := PhysicsRayQueryParameters3D.create(point + Vector3.UP * PROBE_UP, point - Vector3.UP * PROBE_DOWN, WORLD_MASK)
	var hit := space.intersect_ray(query)
	if hit.is_empty():
		return point.y
	return hit["position"].y


static func snap_to_ground(node: Node3D, point: Vector3) -> Vector3:
	point.y = ground_height(node, point)
	return point
