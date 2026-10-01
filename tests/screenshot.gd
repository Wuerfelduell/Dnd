## Debug helper: renders the scene and saves screenshots, then quits.
##
## Run with a real (or virtual) display and the compatibility renderer:
##   xvfb-run godot --rendering-driver opengl3 --path . -- --screenshot [--shot-dir=/tmp/shots]
## Takes an overview of the camp and close-ups of every miniature type.
extends Node

var world: World
var _dir := "/tmp/shots"


func _ready() -> void:
	world = get_parent()
	GameState.pacing = 0.0
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--shot-dir="):
			_dir = arg.trim_prefix("--shot-dir=")
	DirAccess.make_dir_recursive_absolute(_dir)
	world.hud.visible = false
	_run()


func _run() -> void:
	var camera: Camera3D = world.camera_rig.camera
	await _settle()
	await _shoot("overview")
	# Close-ups: park the camera in front of each creature.
	var subjects := {
		"goblin": "Enemies/GoblinWarrior",
		"goblin_archer": "Enemies/GoblinArcher",
		"wolf": "Enemies/Wolf",
		"hobgoblin": "Enemies/Hobgoblin",
		"fighter": "Party/Fighter",
		"rogue": "Party/Rogue",
		"wizard": "Party/Wizard",
		"cleric": "Party/Cleric",
	}
	var free_cam := Camera3D.new()
	free_cam.fov = 40.0
	world.add_child(free_cam)
	free_cam.make_current()
	for key in subjects:
		var actor: Actor = world.get_node_or_null(subjects[key])
		if actor == null:
			continue
		var target := actor.global_position + Vector3(0, 0.9, 0)
		# In front of the figure, slightly to its left, looking down a little.
		var forward := -actor.global_transform.basis.z
		var right := actor.global_transform.basis.x
		free_cam.global_position = target + forward * 2.6 + right * 2.2 + Vector3.UP * 1.4
		free_cam.look_at(target, Vector3.UP)
		await _settle()
		await _shoot(key)
	# Group shot of all enemies.
	var center := Vector3.ZERO
	var n := 0
	for e in world.enemies():
		center += e.global_position
		n += 1
	if n > 0:
		center /= n
		free_cam.global_position = center + Vector3(0, 6, 9)
		free_cam.look_at(center + Vector3(0, 0.5, 0), Vector3.UP)
		await _settle()
		await _shoot("enemies")
	# Group shot of the party, seen from the front (they face north).
	var party_center := Vector3.ZERO
	var members := 0
	for p in world.party():
		party_center += p.global_position
		members += 1
	if members > 0:
		party_center /= members
		free_cam.global_position = party_center + Vector3(0.5, 3.2, -5.5)
		free_cam.look_at(party_center + Vector3(0, 0.8, 0), Vector3.UP)
		await _settle()
		await _shoot("party")
	# The height levels: archer ledge with its stairs and the dark overlook.
	free_cam.global_position = Vector3(-1.0, 6.0, -7.0)
	free_cam.look_at(Vector3(7.0, 1.5, -15.0), Vector3.UP)
	await _settle()
	await _shoot("ledge")
	free_cam.global_position = Vector3(-7.0, 6.0, 5.0)
	free_cam.look_at(Vector3(-16.0, 1.0, -2.0), Vector3.UP)
	await _settle()
	await _shoot("overlook")
	camera.make_current()
	print("[screenshot] done -> %s" % _dir)
	get_tree().quit(0)


func _settle() -> void:
	for _i in 4:
		await get_tree().process_frame


func _shoot(name: String) -> void:
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	var path := "%s/%s.png" % [_dir, name]
	image.save_png(path)
	print("[screenshot] %s (%dx%d)" % [path, image.get_width(), image.get_height()])
