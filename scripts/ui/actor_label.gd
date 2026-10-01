## Floating name + HP + status label above an actor (placeholder for real HP bars).
## Also shows whether the creature stands in the dark (stealth rules).
class_name ActorLabel
extends Label3D

const LIGHT_CHECK_INTERVAL := 0.4

var _actor: Actor
var _in_shadow: bool = false
var _light_timer: float = 0.0


func bind(actor: Actor) -> void:
	_actor = actor
	if actor.data.miniature != "":
		position.y = MiniatureBuilder.height_of(actor.data.miniature) + 0.45
	actor.hp_changed.connect(func(_c, _m): _refresh())
	actor.downed.connect(func(_a): _refresh())
	actor.revived.connect(func(_a): _refresh())
	actor.statuses_changed.connect(func(_a): _refresh())
	_refresh()


func _process(delta: float) -> void:
	if _actor == null:
		return
	_light_timer -= delta
	if _light_timer > 0.0:
		return
	_light_timer = LIGHT_CHECK_INTERVAL
	var shadow := Lighting.is_in_shadow(_actor)
	if shadow != _in_shadow:
		_in_shadow = shadow
		_refresh()


func _refresh() -> void:
	var lines := PackedStringArray()
	var title := _actor.display_name()
	if _actor.is_player():
		title += " (%s %d)" % [_actor.data.class_name_text, _actor.data.level]
	elif _actor.data.level > 1:
		title += " (Lv %d)" % _actor.data.level
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
	if _in_shadow and not _actor.is_down:
		extra.append("in the dark")
	if not extra.is_empty():
		lines.append(" | ".join(extra))
	text = "\n".join(lines)
