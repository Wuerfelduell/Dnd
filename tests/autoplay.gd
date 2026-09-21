## Headless integration test: plays the whole gameplay loop without a human.
##
## Run with:
##   godot --headless --path . -- --autoplay [--seed=42]
##
## Steps: explore towards the goblins → combat starts → the hero is played by
## the same EnemyAI brain (via the public CombatManager API) → combat ends →
## exploration works again. Exit code 0 on success.
class_name Autoplay
extends Node

const TIMEOUT_SECONDS := 120.0

var world: World
var combat: CombatManager
var player: Actor
var player_ai := EnemyAI.new()

var _log_count: int = 0
var _time: float = 0.0
var _failed: bool = false


static func is_requested() -> bool:
	return OS.get_cmdline_user_args().has("--autoplay")


static func seed_from_args() -> int:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--seed="):
			return int(arg.trim_prefix("--seed="))
	return 0


func _ready() -> void:
	world = get_parent()
	combat = world.combat
	player = world.player
	GameState.pacing = 0.0
	# The headless window is 64x64 by default; give the camera a real viewport so
	# unproject/raycast behave like on a desktop.
	get_window().size = Vector2i(1600, 900)
	var seed_value := seed_from_args()
	if seed_value != 0:
		Dice.seed_rng(seed_value)
		print("[autoplay] seed %d" % seed_value)
	EventBus.log_message.connect(func(t): _log_count += 1; print("[log] " + _strip_bbcode(t)))
	combat.turn_started.connect(_on_turn_started)
	_run()


func _process(delta: float) -> void:
	_time += delta
	if _time > TIMEOUT_SECONDS and not _failed:
		fail("Timeout after %.0f s (state=%s)" % [_time, GameState.state_name()])


func fail(message: String) -> void:
	_failed = true
	push_error("[autoplay] FAIL: " + message)
	print("[autoplay] FAIL: " + message)
	get_tree().quit(1)


func expect(condition: bool, message: String) -> void:
	if not condition:
		fail(message)


func _run() -> void:
	await get_tree().physics_frame
	await get_tree().physics_frame
	expect(GameState.is_exploring(), "starts in exploration")
	var nav_map := world.get_world_3d().navigation_map
	expect(NavigationServer3D.map_get_regions(nav_map).size() > 0, "navmesh region registered")

	# 1. Explore: walk north until an enemy notices us.
	var controller: PlayerController = player.get_node("PlayerController")
	var start := player.global_position
	controller.debug_direction = Vector3.FORWARD
	var frames := 0
	while GameState.is_exploring() and frames < 2000 and not _failed:
		await get_tree().physics_frame
		frames += 1
	controller.debug_direction = Vector3.ZERO
	if _failed:
		return
	expect(player.global_position.distance_to(start) > 3.0, "player walked during exploration")
	expect(GameState.is_in_combat(), "combat started after being spotted (frames=%d)" % frames)
	print("[autoplay] combat started after %d frames at %s" % [frames, player.global_position])

	# 2. Wait until combat resolves; player turns are handled in _on_turn_started.
	frames = 0
	while GameState.is_in_combat() and frames < 20000 and not _failed:
		await get_tree().physics_frame
		frames += 1
	if _failed:
		return
	expect(not GameState.is_in_combat(), "combat finished")
	expect(combat.initiative.entries.size() == 3, "three combatants in initiative")
	expect(combat.initiative.round_number >= 1, "at least one round played")
	print("[autoplay] combat ended in round %d, state=%s, hero HP %d/%d" % [
		combat.initiative.round_number, GameState.state_name(), player.current_hp, player.max_hp()])
	var enemies_down := 0
	for a in world.actors():
		if not a.is_player() and not a.is_alive():
			enemies_down += 1

	if GameState.is_game_over():
		expect(player.is_down, "game over implies hero is down")
		print("[autoplay] hero was defeated (valid outcome with this seed) — loop completed")
		get_tree().quit(0)
		return

	# 3. Victory: back to exploration, movement works again, no re-trigger.
	expect(GameState.is_exploring(), "back in exploration after victory")
	expect(enemies_down == 2, "both enemies down (%d)" % enemies_down)
	expect(player.is_alive(), "hero alive after victory")
	await get_tree().physics_frame
	await get_tree().physics_frame
	var pos := player.global_position
	controller.debug_direction = Vector3.RIGHT
	for _i in 30:
		await get_tree().physics_frame
	controller.debug_direction = Vector3.ZERO
	expect(player.global_position.distance_to(pos) > 0.5, "player can walk after combat")
	expect(GameState.is_exploring(), "down enemies do not re-trigger combat")
	expect(_log_count > 10, "combat log received messages (%d)" % _log_count)
	print("[autoplay] SUCCESS after %.1f s" % _time)
	get_tree().quit(0)


func _on_turn_started(actor: Actor) -> void:
	if actor != player:
		return
	if not _clicked_turn_done:
		_clicked_turn_done = true
		_play_hero_turn_with_mouse.call_deferred(actor)
	else:
		_play_hero_turn.call_deferred(actor)


var _clicked_turn_done: bool = false


## First hero turn: drive the real input pipeline (mouse raycast + hotkey)
## instead of calling the CombatManager directly.
func _play_hero_turn_with_mouse(actor: Actor) -> void:
	var input: PlayerCombatInput = world.combat_input
	var target := Targeting.nearest_hostile(actor, combat.participants)
	expect(target != null, "hero has a target")
	expect(combat.is_player_turn(), "it is the player's turn")
	print("[autoplay] viewport size for mouse test: %s" % get_viewport().get_visible_rect().size)
	# In a tiny headless viewport the HUD panels would cover the whole screen and
	# swallow the clicks, so hide them for this part (their logic keeps running).
	world.hud.visible = false

	# a) Click the ground a few meters to the side → movement.
	var dest := actor.global_position + Vector3(2.5, 0.0, 0.0)
	var movement_before := actor.turn_state.movement_remaining
	_simulate_click(dest)
	await _wait_until_idle()
	expect(actor.turn_state.movement_remaining < movement_before, "ground click consumed movement (%.2f → %.2f)" % [
		movement_before, actor.turn_state.movement_remaining])
	print("[autoplay] mouse move ok: %.2f m left, distance to %s = %.2f m" % [
		actor.turn_state.movement_remaining, target.display_name(), actor.distance_to(target)])

	# b) Click the enemy → default attack (sword if adjacent, else bow).
	var enemy_hp := target.current_hp
	_simulate_click(target.global_position + Vector3(0, 0.9, 0))
	await _wait_until_idle()
	expect(not actor.turn_state.action_available, "enemy click used the action")
	print("[autoplay] mouse attack ok: %s HP %d → %d" % [target.display_name(), enemy_hp, target.current_hp])

	# c) Bonus action via the action bar path.
	var sw := actor.find_action(&"second_wind")
	if sw != null and combat.is_active:
		input.use_action(sw)
		await _wait_until_idle()
		expect(not actor.turn_state.bonus_action_available, "Second Wind used the bonus action")

	world.hud.visible = true

	# d) End the turn with the Space hotkey.
	if combat.is_active and combat.active_actor == actor:
		_simulate_key("end_turn")
		for _i in 3:
			await get_tree().process_frame
		expect(combat.active_actor != actor or not combat.is_active, "Space ended the hero's turn")
		print("[autoplay] hotkey end turn ok")


func _simulate_click(world_position: Vector3) -> void:
	var cam: Camera3D = world.camera_rig.camera
	var screen := cam.unproject_position(world_position)
	var press := InputEventMouseButton.new()
	press.button_index = MOUSE_BUTTON_LEFT
	press.pressed = true
	press.position = screen
	press.global_position = screen
	get_viewport().push_input(press)
	var release := press.duplicate()
	release.pressed = false
	get_viewport().push_input(release)


func _simulate_key(action: String) -> void:
	var events := InputMap.action_get_events(action)
	expect(events.size() > 0, "action %s has a binding" % action)
	var press: InputEventKey = events[0].duplicate()
	press.pressed = true
	get_viewport().push_input(press)
	var release: InputEventKey = press.duplicate()
	release.pressed = false
	get_viewport().push_input(release)


func _wait_until_idle() -> void:
	# Input is flushed at the start of the next frame, the click is handled in
	# the following physics tick, then movement / action pacing runs.
	for _i in 3:
		await get_tree().process_frame
	var frames := 0
	while combat.is_busy() and frames < 2000:
		await get_tree().physics_frame
		frames += 1
	await get_tree().physics_frame


func _play_hero_turn(actor: Actor) -> void:
	var before_action := actor.turn_state.action_available
	# Use Second Wind when hurt (exercise the bonus action path).
	var sw := actor.find_action(&"second_wind")
	if sw != null and sw.is_available(actor) and actor.current_hp <= actor.max_hp() / 2:
		await combat.perform_action(actor, sw, null)
	await player_ai.take_turn(actor, combat)
	if combat.is_active and combat.active_actor == actor:
		expect(before_action, "hero had an action at turn start")
		combat.end_turn()


static func _strip_bbcode(text: String) -> String:
	var regex := RegEx.new()
	regex.compile("\\[/?[a-z]+(=[^\\]]*)?\\]")
	return regex.sub(text, "", true)
