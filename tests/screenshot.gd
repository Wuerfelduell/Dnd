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
	for e in world.arena_enemies():
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
	# The creatures of the later waves, lined up in the open.
	var creature_center := Vector3(1.0, 0.0, 0.0)
	var spawned: Array[Actor] = []
	var kinds := ["stone_golem", "cave_spider", "cave_bat", "crystal_slime", "mushroom_shaman", "ruin_wraith", "bandit"]
	for i in kinds.size():
		var creature: Actor = load("res://scenes/actors/enemy.tscn").instantiate()
		creature.data = load("res://data/actors/%s.tres" % kinds[i])
		creature.transform = Transform3D(Basis.from_euler(Vector3(0, PI, 0)), creature_center + Vector3(-6.3 + 2.1 * i, 0.0, 0.0))
		world.get_node("Enemies").add_child(creature)
		spawned.append(creature)
	free_cam.global_position = creature_center + Vector3(0.0, 5.0, 12.5)
	free_cam.look_at(creature_center + Vector3(0, 0.8, 0), Vector3.UP)
	await _settle()
	await _shoot("creatures")
	for c in spawned:
		c.queue_free()
	# The height levels: archer ledge with its stairs and the dark overlook.
	free_cam.global_position = Vector3(-1.0, 6.0, -7.0)
	free_cam.look_at(Vector3(7.0, 1.5, -15.0), Vector3.UP)
	await _settle()
	await _shoot("ledge")
	free_cam.global_position = Vector3(-7.0, 6.0, 5.0)
	free_cam.look_at(Vector3(-16.0, 1.0, -2.0), Vector3.UP)
	await _settle()
	await _shoot("overlook")
	# Tavern (from above the door, looking in) and the cave.
	free_cam.global_position = Vector3(0.0, 9.0, 21.0)
	free_cam.look_at(Vector3(0.0, 0.8, 31.0), Vector3.UP)
	await _settle()
	await _shoot("tavern")
	free_cam.global_position = Vector3(-10.0, 10.0, -18.0)
	free_cam.look_at(Vector3(-10.0, 0.5, -31.0), Vector3.UP)
	await _settle()
	await _shoot("cave")
	# The ruined village east of the arena: overview across the river, then the bridge up close.
	free_cam.global_position = Vector3(26.0, 22.0, 26.0)
	free_cam.look_at(Vector3(48.0, 0.0, 2.0), Vector3.UP)
	await _settle()
	await _shoot("village")
	free_cam.global_position = Vector3(36.0, 6.0, 9.0)
	free_cam.look_at(Vector3(47.0, 0.5, 0.0), Vector3.UP)
	await _settle()
	await _shoot("village_bridge")
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
