extends Node
## Renders the exploration HUD with the bag open, then the combat action bar.
var world: World
func _ready() -> void:
	world = get_parent()
	GameState.pacing = 0.0
	DirAccess.make_dir_recursive_absolute("/tmp/shots")
	_run()
func _run() -> void:
	for _i in 6:
		await get_tree().process_frame
	world.hud._show_inventory(true)
	for _i in 4:
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png("/tmp/shots/hud_bag.png")
	world.hud._show_inventory(false)
	var fighter: Actor = world.get_node("Party/Fighter")
	var gob: Actor = world.get_node("Enemies/GoblinWarrior")
	gob.global_position = Vector3(0, 0, 9)
	fighter.take_damage(9)
	world.combat.start_combat([fighter, gob] as Array[Actor])
	for _i in 30:
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png("/tmp/shots/hud_combat.png")
	print("[hudshot] done")
	get_tree().quit(0)
