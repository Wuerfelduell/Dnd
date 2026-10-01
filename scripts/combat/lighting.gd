## Rules-side light and shadow: a creature is *lit* when a [LightSource]
## within its radius has an unobstructed line to the creature's chest.
## Rendered shadows are irrelevant here; only this decides stealth bonuses.
##
## Levels without any light source count as daylight (everyone is lit).
class_name Lighting
extends RefCounted

const WORLD_MASK := 1
## Enemies notice creatures in the dark only at this fraction of their radius.
const SHADOW_PERCEPTION_FACTOR := 0.4
## Ranged attacks against a creature in the dark from farther than this have disadvantage.
const SHADOW_RANGE_M := 3.0

## Tests can force the result per actor (Actor -> bool).
static var override: Dictionary = {}


static func is_lit(actor: Actor) -> bool:
	if override.has(actor):
		return override[actor]
	if actor == null or not actor.is_inside_tree():
		return true
	var sources := actor.get_tree().get_nodes_in_group("light_source")
	if sources.is_empty():
		return true
	var world := actor.get_world_3d()
	var space := world.direct_space_state if world != null else null
	var chest := actor.global_position + Vector3.UP * 0.9
	for s in sources:
		if not (s is LightSource) or not s.lit:
			continue
		var origin: Vector3 = s.global_position
		if origin.distance_to(chest) > s.radius_m:
			continue
		if space == null:
			return true
		var query := PhysicsRayQueryParameters3D.create(origin, chest, WORLD_MASK)
		if space.intersect_ray(query).is_empty():
			return true
	return false


static func is_in_shadow(actor: Actor) -> bool:
	return not is_lit(actor)
