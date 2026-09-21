## Path finding for combat movement on the navigation mesh.
##
## Falls back to a straight line when no navigation map exists (e.g. tests).
class_name CombatMovement
extends RefCounted


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
