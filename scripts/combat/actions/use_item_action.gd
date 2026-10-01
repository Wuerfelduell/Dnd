## Drink a potion or hand it to an ally within reach: a bonus action that
## takes one item out of the party's bag ([member Actor.inventory]).
class_name UseItemAction
extends CombatAction

var item: ItemData


func _init(p_item: ItemData) -> void:
	item = p_item
	id = StringName("use_" + String(item.id))
	display_name = item.display_name
	cost = Cost.BONUS_ACTION
	target_kind = TargetKind.ALLY
	range_m = Actor.MELEE_REACH
	tag = "x0"


func is_available(actor: Actor) -> bool:
	return super.is_available(actor) and actor.inventory != null and actor.inventory.has(item)


func unavailable_reason(actor: Actor) -> String:
	var base := super.unavailable_reason(actor)
	if base != "":
		return base
	if actor.inventory == null or not actor.inventory.has(item):
		return "None left in the bag"
	return ""


func tag_for(actor: Actor) -> String:
	return "x%d" % (actor.inventory.count(item) if actor.inventory != null else 0)


func can_target(actor: Actor, target: Actor) -> bool:
	if target == null or actor.is_hostile_to(target) or target.is_neutral():
		return false
	if not in_range(actor, target):
		return false
	return item.can_use_on(target)


func execute(actor: Actor, target: Actor, _point: Vector3 = Vector3.ZERO) -> void:
	if actor.inventory == null or not actor.inventory.remove(item):
		return
	if target != actor:
		actor.face_actor(target)
	actor.play_action("use_item")
	var line := item.use_on(target, actor)
	EventBus.log("[color=aqua]%s[/color]" % line)
	EventBus.item_used.emit(actor, target, item)
	await GameState.wait(0.6)


func description(actor: Actor) -> String:
	var left := actor.inventory.count(item) if actor.inventory != null else 0
	return "%s (%s, %d in the bag): %s Reach %.1f m, also on a downed ally." % [display_name, cost_name(), left, item.description, range_m]
