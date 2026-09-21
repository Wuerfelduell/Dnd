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
