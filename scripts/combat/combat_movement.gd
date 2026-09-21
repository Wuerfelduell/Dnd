## Path planning for movement on the navigation mesh.
##
## The navmesh only knows static geometry, so [method plan] adds detours around
## other creatures (which are dynamic) and moves an occupied destination to the
## nearest free spot. Falls back to a straight line when no navigation map
## exists (e.g. tests).
class_name CombatMovement
extends RefCounted

## Two capsules touch at 0.8 m; keep a little air.
const CLEARANCE := Actor.BODY_RADIUS * 2.0 + 0.25
const MAX_DETOUR_PASSES := 4


static func find_path(map: RID, from: Vector3, to: Vector3) -> PackedVector3Array:
	var path := PackedVector3Array()
	if map.is_valid() and NavigationServer3D.map_get_regions(map).size() > 0:
		var start := NavigationServer3D.map_get_closest_point(map, from)
		var goal := NavigationServer3D.map_get_closest_point(map, to)
		path = NavigationServer3D.map_get_path(map, start, goal, true)
		# Keep the actor's own height (navmesh surface may sit slightly lower/higher).
		for i in path.size():
			path[i].y = from.y
	if path.size() < 2:
		path = PackedVector3Array([from, to])
	return path


## Full plan for [param mover]: navmesh path + detours around [param others]
## + a free destination. This is what movement, previews and the AI use.
static func plan(mover: Actor, destination: Vector3, others: Array[Actor]) -> PackedVector3Array:
	var map := RID()
	if mover.is_inside_tree():
		map = mover.get_world_3d().navigation_map
	var blockers := _blockers(mover, others)
	var goal := free_destination(mover, destination, blockers)
	var path := find_path(map, mover.global_position, goal)
	return detour_around(_drop_points_inside_bodies(path, blockers), blockers)


## Navmesh paths have vertices on polygon edges; those inside or right next to
## a creature are dropped so the bridging segment gets one clean detour
## instead of a zigzag.
static func _drop_points_inside_bodies(path: PackedVector3Array, blockers: Array[Actor]) -> PackedVector3Array:
	if path.size() <= 2:
		return path
	var out := PackedVector3Array()
	out.append(path[0])
	for i in range(1, path.size() - 1):
		var inside := false
		for b in blockers:
			if _flat(path[i]).distance_to(_flat(b.global_position)) < CLEARANCE + 0.5:
				inside = true
				break
		if not inside:
			out.append(path[i])
	out.append(path[path.size() - 1])
	return out


static func _blockers(mover: Actor, others: Array[Actor]) -> Array[Actor]:
	var out: Array[Actor] = []
	for o in others:
		if o != mover and is_instance_valid(o) and o.is_alive():
			out.append(o)
	return out


## If [param destination] overlaps a creature, slide it out of the way.
static func free_destination(mover: Actor, destination: Vector3, blockers: Array[Actor]) -> Vector3:
	var goal := destination
	goal.y = mover.global_position.y
	for _pass in 3:
		var moved := false
		for b in blockers:
			var bp := b.global_position
			bp.y = goal.y
			var d := goal.distance_to(bp)
			if d < CLEARANCE:
				var away := goal - bp
				if away.length_squared() < 0.0001:
					away = mover.global_position - bp
					away.y = 0.0
				if away.length_squared() < 0.0001:
					away = Vector3.BACK
				goal = bp + away.normalized() * CLEARANCE
				moved = true
		if not moved:
			break
	return goal


## Inserts waypoints so no segment passes through a blocker's body.
static func detour_around(path: PackedVector3Array, blockers: Array[Actor]) -> PackedVector3Array:
	if path.size() < 2 or blockers.is_empty():
		return path
	var current := path
	for _pass in MAX_DETOUR_PASSES:
		var changed := false
		var out := PackedVector3Array()
		out.append(current[0])
		for i in range(1, current.size()):
			var a := current[i - 1]
			var b := current[i]
			var inserted: Variant = _detour_point(a, b, blockers, i == current.size() - 1)
			if inserted != null:
				out.append(inserted)
				changed = true
			out.append(b)
		current = out
		if not changed:
			break
	return current


## First blocker whose body the segment crosses -> a waypoint beside it, else null.
static func _detour_point(a: Vector3, b: Vector3, blockers: Array[Actor], last_segment: bool) -> Variant:
	var fa := _flat(a)
	var fb := _flat(b)
	var seg := fb - fa
	var seg_len := seg.length()
	if seg_len < 0.05:
		return null
	var dir := seg / seg_len
	var best: Actor = null
	var best_t := INF
	for blocker in blockers:
		var c := _flat(blocker.global_position)
		var t := clampf((c - fa).dot(dir), 0.0, seg_len)
		var closest := fa + dir * t
		if closest.distance_to(c) >= CLEARANCE:
			continue
		# The segment's own end points may legitimately sit next to a creature
		# (attacking an adjacent enemy): only interior crossings need a detour.
		if t < 0.05 or t > seg_len - 0.05:
			continue
		if last_segment and fb.distance_to(c) < CLEARANCE + 0.3:
			continue
		if t < best_t:
			best_t = t
			best = blocker
	if best == null:
		return null
	var c := _flat(best.global_position)
	var closest := fa + dir * best_t
	var side := closest - c
	if side.length_squared() < 0.0001:
		side = Vector3(-dir.z, 0.0, dir.x)
	side = side.normalized()
	var waypoint := c + side * (CLEARANCE + 0.15)
	# A neighbour standing right there? Step further out along the same side.
	for _i in 3:
		var clear := true
		for other in blockers:
			if other != best and waypoint.distance_to(_flat(other.global_position)) < CLEARANCE:
				clear = false
				break
		if clear:
			break
		waypoint += side * CLEARANCE
	waypoint.y = a.y
	return waypoint


static func path_length(path: PackedVector3Array) -> float:
	var length := 0.0
	for i in range(1, path.size()):
		length += path[i - 1].distance_to(path[i])
	return length


## Hostiles with a reaction whose reach the actor would leave along [param path].
static func provoking_hostiles(actor: Actor, path: PackedVector3Array, others: Array[Actor]) -> Array[Actor]:
	var out: Array[Actor] = []
	if path.size() < 2 or actor.status_flag("immune_to_opportunity_attacks"):
		return out
	var reach := Actor.MELEE_REACH + Actor.BODY_RADIUS * 2.0 + 0.001
	for other in others:
		if other == actor or not other.is_alive() or other.is_incapacitated() or not actor.is_hostile_to(other):
			continue
		if not other.turn_state.reaction_available or other.melee_weapon() == null:
			continue
		var op := other.global_position
		op.y = 0.0
		var inside := _flat(path[0]).distance_to(op) <= reach
		if not inside:
			continue
		var step := 0.25
		for i in range(1, path.size()):
			var a := _flat(path[i - 1])
			var b := _flat(path[i])
			var seg_len := a.distance_to(b)
			var t := 0.0
			while t < seg_len:
				t = minf(seg_len, t + step)
				var p := a.lerp(b, t / seg_len) if seg_len > 0.0 else b
				if p.distance_to(op) > reach:
					out.append(other)
					break
			if out.has(other):
				break
	return out


static func _flat(v: Vector3) -> Vector3:
	return Vector3(v.x, 0.0, v.z)


## Cuts the path so its total length is at most [param max_length].
static func truncate(path: PackedVector3Array, max_length: float) -> PackedVector3Array:
	var out := PackedVector3Array()
	if path.is_empty():
		return out
	out.append(path[0])
	var remaining := max_length
	for i in range(1, path.size()):
		var seg := path[i] - path[i - 1]
		var seg_len := seg.length()
		if seg_len <= remaining:
			out.append(path[i])
			remaining -= seg_len
		else:
			if remaining > 0.001:
				out.append(path[i - 1] + seg.normalized() * remaining)
			break
	return out
