## Damage / miss numbers popping up above an actor.
class_name FloatingText
extends Label3D


static func spawn(parent: Node, world_position: Vector3, message: String, color: Color) -> void:
	var label := FloatingText.new()
	label.text = message
	label.modulate = color
	label.outline_modulate = Color(0, 0, 0, 1)
	label.outline_size = 12
	label.font_size = 56
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	parent.add_child(label)
	label.global_position = world_position + Vector3(0, 2.6, 0)
	var tween := label.create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y + 1.5, 1.4)
	tween.tween_property(label, "modulate:a", 0.0, 1.4).set_delay(0.5)
	tween.chain().tween_callback(label.queue_free)
