## Picks what is under a screen position (ground point or an [Actor]).
##
## Must be called from a physics callback (needs the direct space state).
class_name ScreenRaycast
extends RefCounted

const RAY_LENGTH := 500.0


## Returns {} when nothing was hit, otherwise {"position": Vector3, "actor": Actor|null}.
static func pick(camera: Camera3D, screen_position: Vector2) -> Dictionary:
	if camera == null:
		return {}
	var from := camera.project_ray_origin(screen_position)
	var dir := camera.project_ray_normal(screen_position)
	var query := PhysicsRayQueryParameters3D.create(from, from + dir * RAY_LENGTH)
	query.collision_mask = 3
	query.collide_with_bodies = true
	var space := camera.get_world_3d().direct_space_state
	var result := space.intersect_ray(query)
	if result.is_empty():
		return {}
	var out := {"position": result["position"], "actor": null, "collider": result.get("collider")}
	var collider: Object = result.get("collider")
	if collider is Actor:
		out["actor"] = collider
	return out


## True when the position is covered by a visible, mouse-blocking Control.
static func is_over_gui(viewport: Viewport, screen_position: Vector2) -> bool:
	var control := viewport.gui_get_hovered_control()
	if control == null:
		return false
	return control.is_visible_in_tree() and control.mouse_filter != Control.MOUSE_FILTER_IGNORE \
		and control.get_global_rect().has_point(screen_position)


## A primary tap/click: the left mouse button, real or emulated from touch.
## Touch is deliberately routed through the emulated mouse event only: that
## one respects GUI consumption, so a tap on a button never leaks to the world.
static func is_tap(event: InputEvent) -> bool:
	return event.is_action_pressed("select")


static func has_touchscreen() -> bool:
	return DisplayServer.is_touchscreen_available()
