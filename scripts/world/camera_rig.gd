## Third-person / isometric style follow camera.
##
## Yaw rotates with Q/E or the on-screen buttons, zoom with the mouse wheel or
## the on-screen buttons, pitch is fixed. Follows a target node (the player in
## exploration, the active actor in combat).
class_name CameraRig
extends Node3D

@export var follow_target: Node3D
@export var follow_speed: float = 6.0
@export var rotate_speed_deg: float = 90.0
@export var zoom_min: float = 6.0
@export var zoom_max: float = 26.0
@export var zoom_step: float = 1.5

var _zoom: float = 16.0
var _yaw_tween: Tween

@onready var pitch: Node3D = $Pitch
@onready var camera: Camera3D = $Pitch/Camera3D


func _ready() -> void:
	add_to_group("camera_rig")
	_apply_zoom()


func _process(delta: float) -> void:
	var yaw := 0.0
	if Input.is_action_pressed("camera_rotate_left"):
		yaw += 1.0
	if Input.is_action_pressed("camera_rotate_right"):
		yaw -= 1.0
	if yaw != 0.0:
		rotation_degrees.y += yaw * rotate_speed_deg * delta
	if follow_target != null and is_instance_valid(follow_target):
		var goal := follow_target.global_position
		goal.y = maxf(0.0, goal.y)
		global_position = global_position.lerp(goal, clampf(follow_speed * delta, 0.0, 1.0))


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("camera_zoom_in"):
		zoom_by(-zoom_step)
	elif event.is_action_pressed("camera_zoom_out"):
		zoom_by(zoom_step)


## Smoothly turns the camera by [param degrees] (used by the touch buttons).
func rotate_by(degrees: float) -> void:
	if _yaw_tween != null and _yaw_tween.is_valid():
		_yaw_tween.kill()
	_yaw_tween = create_tween()
	_yaw_tween.tween_property(self, "rotation_degrees:y", rotation_degrees.y + degrees, 0.25) \
		.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_QUAD)


func zoom_by(amount: float) -> void:
	_zoom = clampf(_zoom + amount, zoom_min, zoom_max)
	_apply_zoom()


func _apply_zoom() -> void:
	if camera:
		camera.position = Vector3(0.0, 0.0, _zoom)


func set_follow_target(target: Node3D) -> void:
	follow_target = target
