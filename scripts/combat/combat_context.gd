## Small helper so rules code can ask "who else is around?" without holding a
## reference to the CombatManager (unit tests work with a plain list).
class_name CombatContext
extends RefCounted

## Explicit list used when no scene tree is available (tests).
static var override_actors: Array[Actor] = []


static func actors_near(actor: Actor) -> Array[Actor]:
	if not override_actors.is_empty():
		return override_actors
	var out: Array[Actor] = []
	if actor.is_inside_tree():
		for n in actor.get_tree().get_nodes_in_group("actors"):
			if n is Actor:
				out.append(n)
	return out
