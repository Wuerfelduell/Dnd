## Floating name + HP label above an actor (placeholder for real HP bars).
class_name ActorLabel
extends Label3D

var _actor: Actor


func bind(actor: Actor) -> void:
	_actor = actor
	actor.hp_changed.connect(_on_hp_changed)
	actor.downed.connect(_on_downed)
	_on_hp_changed(actor.current_hp, actor.max_hp())


func _on_hp_changed(current: int, maximum: int) -> void:
	text = "%s\nHP %d / %d" % [_actor.display_name(), current, maximum]
	var ratio := float(current) / float(maxi(1, maximum))
	modulate = Color.WHITE.lerp(Color(1.0, 0.35, 0.3), 1.0 - ratio)


func _on_downed(_actor: Actor) -> void:
	text = "%s\nDOWN" % _actor.display_name()
	modulate = Color(0.6, 0.6, 0.6)
