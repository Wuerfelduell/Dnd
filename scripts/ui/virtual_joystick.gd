## On-screen joystick for touch devices (works with the mouse as well).
##
## Publishes [member direction] (x right, y down, length 0..1). The player
## controller reads it like a gamepad stick; nothing else depends on it.
class_name HudJoystick
extends Control

@export var base_radius: float = 70.0
@export var knob_radius: float = 30.0
@export var dead_zone: float = 0.15

var direction: Vector2 = Vector2.ZERO

var _active: bool = false
var _knob_offset: Vector2 = Vector2.ZERO


func _ready() -> void:
	add_to_group("virtual_joystick")
	mouse_filter = Control.MOUSE_FILTER_STOP
	custom_minimum_size = Vector2.ONE * base_radius * 2.0
	queue_redraw()


func _gui_input(event: InputEvent) -> void:
	# Touch is emulated as mouse events on phones, so handling the mouse covers both.
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			_active = true
			_update(event.position)
		else:
			_release()
		accept_event()
	elif event is InputEventMouseMotion and _active:
		_update(event.position)
		accept_event()


func _notification(what: int) -> void:
	if what == NOTIFICATION_VISIBILITY_CHANGED and not is_visible_in_tree():
		_release()


func _update(local_position: Vector2) -> void:
	var offset := local_position - size * 0.5
	if offset.length() > base_radius:
		offset = offset.normalized() * base_radius
	_knob_offset = offset
	var v := offset / base_radius
	direction = Vector2.ZERO if v.length() < dead_zone else v
	queue_redraw()


func _release() -> void:
	_active = false
	_knob_offset = Vector2.ZERO
	direction = Vector2.ZERO
	queue_redraw()


func _draw() -> void:
	var center := size * 0.5
	draw_circle(center, base_radius, Color(1, 1, 1, 0.12))
	draw_arc(center, base_radius, 0.0, TAU, 48, Color(1, 1, 1, 0.5), 2.0, true)
	draw_circle(center + _knob_offset, knob_radius, Color(1, 1, 1, 0.55 if _active else 0.35))
