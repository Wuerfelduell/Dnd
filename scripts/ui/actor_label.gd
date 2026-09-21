## Floating name + HP + status label above an actor (placeholder for real HP bars).
class_name ActorLabel
extends Label3D

var _actor: Actor


func bind(actor: Actor) -> void:
	_actor = actor
	actor.hp_changed.connect(func(_c, _m): _refresh())
	actor.downed.connect(func(_a): _refresh())
	actor.revived.connect(func(_a): _refresh())
	actor.statuses_changed.connect(func(_a): _refresh())
	_refresh()


func _refresh() -> void:
	var lines := PackedStringArray()
	var title := _actor.display_name()
	if _actor.data.class_name_text != "":
		title += " (%s)" % _actor.data.class_name_text
	lines.append(title)
	if _actor.is_down:
		lines.append("DOWN")
		modulate = Color(0.6, 0.6, 0.6)
	else:
		lines.append("HP %d / %d" % [_actor.current_hp, _actor.max_hp()])
		var ratio := float(_actor.current_hp) / float(maxi(1, _actor.max_hp()))
		modulate = Color.WHITE.lerp(Color(1.0, 0.35, 0.3), 1.0 - ratio)
	var extra := PackedStringArray()
	var statuses := _actor.status_summary()
	if statuses != "":
		extra.append(statuses)
	if _actor.concentration_spell != null:
		extra.append("C: " + _actor.concentration_spell.display_name)
	if not extra.is_empty():
		lines.append(" | ".join(extra))
	text = "\n".join(lines)
