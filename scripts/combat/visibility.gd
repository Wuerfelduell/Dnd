## Line of sight, cover and elevation from the level geometry.
##
## Cover is measured like on the tabletop, but with rays: from the
## attacker's eyes to five points on the target (eyes, chest, knees, both
## shoulders). Blocked rays turn into cover:
##   0 blocked          -> no cover
##   1-2 of 5 blocked   -> half cover         (+2 AC, +2 DEX saves)
##   3-4 of 5 blocked   -> three-quarters     (+5 AC, +5 DEX saves)
##   all blocked        -> full cover: no line of sight, cannot be targeted
## Only static level geometry (collision layer 1) blocks; creatures don't.
## Elevation: an attacker standing at least [constant HIGH_GROUND_M] higher
## gets +2 on the attack roll, one standing that much lower -2.
class_name Visibility
extends RefCounted

enum Cover { NONE, HALF, THREE_QUARTERS, FULL }

const WORLD_MASK := 1
const SAMPLE_COUNT := 5
const HIGH_GROUND_M := 1.0
const HIGH_GROUND_BONUS := 2
const CAPSULE_HEIGHT := 1.8


# --- Pure rules ------------------------------------------------------------

static func cover_from_count(blocked: int, total: int = SAMPLE_COUNT) -> Cover:
	if blocked <= 0:
		return Cover.NONE
	if blocked >= total:
		return Cover.FULL
	if blocked * 2 > total:
		return Cover.THREE_QUARTERS
	return Cover.HALF


## Bonus to AC and to DEX saving throws.
static func cover_bonus(cover: Cover) -> int:
	match cover:
		Cover.HALF:
			return 2
		Cover.THREE_QUARTERS, Cover.FULL:
			return 5
	return 0


static func cover_name(cover: Cover) -> String:
	match cover:
		Cover.HALF:
			return "half cover"
		Cover.THREE_QUARTERS:
			return "three-quarters cover"
		Cover.FULL:
			return "full cover"
	return ""


## [param delta_m] = attacker height minus target height.
static func elevation_bonus(delta_m: float) -> int:
	if delta_m >= HIGH_GROUND_M:
		return HIGH_GROUND_BONUS
	if delta_m <= -HIGH_GROUND_M:
		return -HIGH_GROUND_BONUS
	return 0


# --- Geometry queries -------------------------------------------------------

static func figure_height(actor: Actor) -> float:
	if actor == null:
		return CAPSULE_HEIGHT
	return actor.figure_height()


static func eye_position(actor: Actor) -> Vector3:
	return actor.global_position + Vector3.UP * (figure_height(actor) * 0.85)


## Points on the target's body that rays are tested against, as seen from [param viewer].
static func body_points(target: Actor, viewer: Vector3) -> Array[Vector3]:
	var h := figure_height(target)
	var base := target.global_position
	var toward := viewer - base
	toward.y = 0.0
	var side := Vector3.RIGHT
	if toward.length_squared() > 0.0001:
		side = Vector3(-toward.z, 0.0, toward.x).normalized()
	return [
		base + Vector3.UP * (h * 0.85),
		base + Vector3.UP * (h * 0.5),
		base + Vector3.UP * (h * 0.2),
		base + Vector3.UP * (h * 0.65) + side * 0.3,
		base + Vector3.UP * (h * 0.65) - side * 0.3,
	]


## How many of the body rays from [param origin] hit level geometry first.
static func blocked_count(origin: Vector3, target: Actor) -> int:
	if target == null or not target.is_inside_tree():
		return 0
	var world := target.get_world_3d()
	if world == null or world.direct_space_state == null:
		return 0
	var space := world.direct_space_state
	var blocked := 0
	for p in body_points(target, origin):
		var query := PhysicsRayQueryParameters3D.create(origin, p, WORLD_MASK)
		if not space.intersect_ray(query).is_empty():
			blocked += 1
	return blocked


static func cover_between(attacker: Actor, target: Actor) -> Cover:
	if attacker == null or not attacker.is_inside_tree():
		return Cover.NONE
	return cover_from_count(blocked_count(eye_position(attacker), target))


## Cover of [param target] against something coming from [param origin]
## (the point of origin of an area spell).
static func cover_from_point(origin: Vector3, target: Actor) -> Cover:
	return cover_from_count(blocked_count(origin, target))


static func has_line_of_sight(attacker: Actor, target: Actor) -> bool:
	return cover_between(attacker, target) != Cover.FULL


## Can [param actor] see the spot (half a meter above the ground there)?
static func point_visible(actor: Actor, point: Vector3) -> bool:
	if actor == null or not actor.is_inside_tree():
		return true
	var world := actor.get_world_3d()
	if world == null or world.direct_space_state == null:
		return true
	var query := PhysicsRayQueryParameters3D.create(eye_position(actor), point + Vector3.UP * 0.5, WORLD_MASK)
	return world.direct_space_state.intersect_ray(query).is_empty()
