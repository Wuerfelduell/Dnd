extends Node
## Renders the exploration HUD with the bag open, the innkeeper's dialogue, then the combat action bar.
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
	# The innkeeper's greeting, seen from the bar.
	var innkeeper: Actor = world.get_node("Npcs/Innkeeper")
	fighter.global_position = Vector3(4.6, 0, 31.2)
	for p in world.party():
		if p != fighter:
			p.global_position = Vector3(3.3, 0, 31.2 - 1.0 * p.get_index())
		p.face_actor(innkeeper)
	world.camera_rig.global_position = fighter.global_position
	world.inventory.add_copper(35)
	world.start_dialogue(DialogueTree.load_by_id("innkeeper"), innkeeper)
	world.dialogue.choose(0)
	world.dialogue.choose(0)
	for _i in 8:
		await get_tree().process_frame
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png("/tmp/shots/hud_dialogue.png")
	world.dialogue.end()
	for p in world.party():
		p.global_position = Vector3(0, 0, 12) + Vector3(0.9 * p.get_index(), 0, 0)
	world.camera_rig.global_position = fighter.global_position
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
