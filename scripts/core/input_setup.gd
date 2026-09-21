## Autoload: defines the InputMap in code so the bindings are documented in one
## place and don't depend on hand-editing project.godot.
extends Node

const KEY_BINDINGS := {
	"move_forward": [KEY_W, KEY_UP],
	"move_back": [KEY_S, KEY_DOWN],
	"move_left": [KEY_A, KEY_LEFT],
	"move_right": [KEY_D, KEY_RIGHT],
	"camera_rotate_left": [KEY_Q],
	"camera_rotate_right": [KEY_E],
	"end_turn": [KEY_SPACE, KEY_ENTER],
	"cancel": [KEY_ESCAPE],
	"restart": [KEY_R],
}

const MOUSE_BINDINGS := {
	"select": MOUSE_BUTTON_LEFT,
	"cancel": MOUSE_BUTTON_RIGHT,
	"camera_zoom_in": MOUSE_BUTTON_WHEEL_UP,
	"camera_zoom_out": MOUSE_BUTTON_WHEEL_DOWN,
}


func _ready() -> void:
	for action in KEY_BINDINGS:
		_ensure_action(action)
		for key in KEY_BINDINGS[action]:
			var ev := InputEventKey.new()
			ev.physical_keycode = key
			InputMap.action_add_event(action, ev)
	for action in MOUSE_BINDINGS:
		_ensure_action(action)
		var ev := InputEventMouseButton.new()
		ev.button_index = MOUSE_BINDINGS[action]
		InputMap.action_add_event(action, ev)


func _ensure_action(action: String) -> void:
	if not InputMap.has_action(action):
		InputMap.add_action(action)
