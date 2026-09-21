## Helpers for choosing targets and approach positions.
class_name Targeting
extends RefCounted


static func living_hostiles(actor: Actor, actors: Array[Actor]) -> Array[Actor]:
	var out: Array[Actor] = []
	for other in actors:
		if other.is_alive() and actor.is_hostile_to(other):
			out.append(other)
	return out


static func nearest_hostile(actor: Actor, actors: Array[Actor]) -> Actor:
	var best: Actor = null
	var best_dist := INF
	for other in living_hostiles(actor, actors):
		var d := actor.center_distance_to(other)
		if d < best_dist:
			best_dist = d
			best = other
	return best


## Point next to [param target] from which [param actor] is within [param reach].
## Prefers the direct approach; if that spot is taken by another actor in
## [param others], walks around the target to find a free one.
static func approach_point(actor: Actor, target: Actor, reach: float, others: Array[Actor] = []) -> Vector3:
	var from := actor.global_position
	var to := target.global_position
	from.y = 0.0
	to.y = 0.0
	var dir := (from - to)
	if dir.length_squared() < 0.0001:
		dir = Vector3.BACK
	dir = dir.normalized()
	# Stop a bit inside the reach so rounding never leaves us just out of range.
	var stop_distance := Actor.BODY_RADIUS * 2.0 + maxf(0.2, reach - 0.4)
	var best := to + dir * stop_distance
	var best_cost := INF
	# Try the direct spot first, then alternate left/right around the target.
	for i in 8:
		var angle := 0.0
		if i > 0:
			angle = deg_to_rad(45.0 * ((i + 1) / 2)) * (1.0 if i % 2 == 1 else -1.0)
		var candidate := to + dir.rotated(Vector3.UP, angle) * stop_distance
		if _spot_blocked(candidate, actor, target, others):
			continue
		var cost := from.distance_to(candidate) + absf(angle) * 0.1
		if cost < best_cost:
			best_cost = cost
			best = candidate
	best.y = actor.global_position.y
	return best


static func _spot_blocked(point: Vector3, actor: Actor, target: Actor, others: Array[Actor]) -> bool:
	for other in others:
		if other == actor or other == target or not other.is_alive():
			continue
		var p := other.global_position
		p.y = 0.0
		if p.distance_to(point) < Actor.BODY_RADIUS * 2.0 + 0.1:
			return true
	return false
