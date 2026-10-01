## Headless integration test: plays the whole gameplay loop without a human.
##
## Run with:
##   godot --headless --path . -- --autoplay [--seed=42]
##
## Steps: explore (joystick, no tap-to-move, walking) → an enemy spots the party →
## the first party turn is played through the real input pipeline (mouse
## raycast, action selection, hotkey) → the rest is played by [PartyAI] and
## [EnemyAI] → victory returns to exploration (or defeat ends in game over).
## Exit code 0 on success.
class_name Autoplay
extends Node

const TIMEOUT_SECONDS := 180.0

var world: World
var combat: CombatManager
var player: Actor

var _log_count: int = 0
var _time: float = 0.0
var _failed: bool = false
var _spells_cast: int = 0
var _saves: int = 0
var _oas: int = 0
var _statuses: int = 0
var _concentration_breaks: int = 0
var _first_party_turn_done: bool = false


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
	EventBus.spell_cast.connect(func(_c, _s, _t): _spells_cast += 1)
	EventBus.save_resolved.connect(func(_a, _r): _saves += 1)
	EventBus.opportunity_attack.connect(func(_r, _m): _oas += 1)
	EventBus.status_applied.connect(func(_a, _e): _statuses += 1)
	EventBus.concentration_broken.connect(func(_a, _s, _r): _concentration_breaks += 1)
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
	expect(world.party().size() == 4, "party of four")
	expect(world.npcs().size() == 6 and world.cave_enemies().size() == 7 and world.arena_enemies().size() == 7, "six tavern folk, seven cave dwellers, seven arena enemies")

	# 1a. Explore with the virtual joystick: press its center, drag up, hold.
	var controller: PlayerController = player.get_node("PlayerController")
	var start := player.global_position
	var joystick: HudJoystick = world.hud.joystick
	await get_tree().process_frame
	var joy_center := joystick.get_global_rect().get_center()
	_simulate_mouse(joy_center, true)
	_simulate_mouse_motion(joy_center + Vector2(0, -60))
	for _i in 30:
		await get_tree().physics_frame
	expect(joystick.direction.y < -0.5, "joystick reports an upward direction (%s)" % joystick.direction)
	expect(player.global_position.z < start.z - 1.0, "joystick moved the player north (%.2f)" % (start.z - player.global_position.z))
	_simulate_mouse(joy_center + Vector2(0, -60), false)
	await get_tree().physics_frame
	expect(joystick.direction == Vector2.ZERO, "joystick resets on release")
	print("[autoplay] joystick ok: %s" % player.global_position)
	start = player.global_position

	# 1b. A tap on the ground does nothing outside combat: a mistap must never
	# send the party running into a camp. Walking is the joystick's job.
	world.hud.visible = false
	_simulate_click(start + Vector3(0, 0, -3.0))
	for _i in 20:
		await get_tree().physics_frame
	world.hud.visible = true
	expect(player.global_position.distance_to(start) < 0.5 and not player.is_moving(), "a ground tap does not move the leader (%.2f m)" % player.global_position.distance_to(start))
	controller.debug_direction = Vector3(0, 0, -1)
	for _i in 40:
		await get_tree().physics_frame
	controller.debug_direction = Vector3.ZERO
	for _i in 20:
		await get_tree().physics_frame
	expect(player.global_position.distance_to(start) > 2.0, "the stick walked the player north instead (%.2f m)" % player.global_position.distance_to(start))
	print("[autoplay] no tap-to-move ok: %s" % player.global_position)
	# Followers trail the leader.
	var followers_close := 0
	for p in world.party():
		if p != player and p.global_position.distance_to(player.global_position) < 6.0:
			followers_close += 1
	expect(followers_close == 3, "party members follow the leader (%d close)" % followers_close)

	# 1c. Explore: walk north until an enemy notices us.
	controller.debug_direction = Vector3.FORWARD
	var frames := 0
	while GameState.is_exploring() and frames < 2000 and not _failed:
		await get_tree().physics_frame
		frames += 1
	controller.debug_direction = Vector3.ZERO
	if _failed:
		return
	expect(GameState.is_in_combat(), "combat started after being spotted (frames=%d)" % frames)
	expect(combat.participants.size() >= 6, "party + several enemies in combat (%d)" % combat.participants.size())
	print("[autoplay] combat started after %d frames with %d combatants" % [frames, combat.participants.size()])

	# 2. Wait until combat resolves; party turns are handled in _on_turn_started.
	frames = 0
	while GameState.is_in_combat() and frames < 40000 and not _failed:
		await get_tree().physics_frame
		frames += 1
	if _failed:
		return
	expect(not GameState.is_in_combat(), "combat finished")
	expect(combat.initiative.round_number >= 1, "at least one round played")
	print("[autoplay] combat ended in round %d, state=%s; spells=%d saves=%d OAs=%d statuses=%d conc.breaks=%d" % [
		combat.initiative.round_number, GameState.state_name(), _spells_cast, _saves, _oas, _statuses, _concentration_breaks])
	for p in world.party():
		print("[autoplay]   %s %s HP %d/%d" % [p.display_name(), p.data.class_name_text, p.current_hp, p.max_hp()])
	expect(_spells_cast > 0, "spells were cast")
	print("[autoplay] FEATURES spells=%d saves=%d oas=%d statuses=%d concbreaks=%d rounds=%d result=%s" % [
		_spells_cast, _saves, _oas, _statuses, _concentration_breaks, combat.initiative.round_number,
		"defeat" if GameState.is_game_over() else "victory"])
	var enemies_down := 0
	for a in world.arena_enemies():
		if not a.is_alive():
			enemies_down += 1

	if GameState.is_game_over():
		var alive := 0
		for p in world.party():
			if p.is_alive():
				alive += 1
		expect(alive == 0, "game over implies the whole party is down")
		print("[autoplay] party was defeated (valid outcome with this seed) — loop completed")
		get_tree().quit(0)
		return

	# 3. Victory: back to exploration, XP and level-ups, movement works again, no re-trigger.
	expect(GameState.is_exploring(), "back in exploration after victory")
	expect(enemies_down == combat.participants.size() - 4, "all enemies down (%d)" % enemies_down)
	for p in world.party():
		expect(p.is_alive(), "%s is up after victory" % p.display_name())
		expect(p.data.xp > 0, "%s earned xp (%d)" % [p.display_name(), p.data.xp])
	expect(world.last_reports.size() == 4 and world.last_reports[0].leveled(), "first wave levels the party up")
	expect(player.data.level == 4 and player.data.stats.strength_mod == 4, "fighter is level 4 with STR +4")
	expect(world.hud.level_up_panel.visible, "level-up panel shown")
	expect(world.inventory.copper > 300, "the fallen left coin in the bag (%d copper)" % world.inventory.copper)
	world.hud.continue_button.pressed.emit()
	expect(not world.hud.level_up_panel.visible, "continue closes the panel")
	print("[autoplay] level-up ok: %s" % ", ".join(world.last_reports[0].lines))
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

	# 4. Short rest & next wave: scaled enemies + a reinforcement, second fight (auto-battle).
	expect(world.hud.next_wave_button.visible, "next wave button offered after clearing the wave")
	expect(not world.hud.long_rest_button.visible, "no long rest before wave 3")
	var wizard: Actor = world.get_node("Party/Wizard")
	var slots_before := wizard.spell_slots.duplicate()
	var hp_before := player.current_hp
	world.hud.next_wave_button.pressed.emit()
	await get_tree().physics_frame
	expect(world.wave == 2 and world.living_enemies() == world.arena_enemies().size() and world.arena_enemies().size() == 8, "wave 2 respawned all arena enemies plus a cave bat (wave %d, %d living of %d)" % [world.wave, world.living_enemies(), world.arena_enemies().size()])
	expect(world.arrivals().size() == 1 and world.arrivals()[0].data.display_name == "Cave Bat" and world.arrivals()[0].visual.uses_model(), "the cave bat arrived with its model")
	expect(GameState.is_exploring() and player.global_position.distance_to(Vector3(0, 0, 12)) < 0.5, "party returned to camp (%s)" % player.global_position)
	expect(player.current_hp <= player.max_hp() and player.current_hp >= hp_before, "short rest healed a little, not fully (%d -> %d / %d)" % [hp_before, player.current_hp, player.max_hp()])
	expect(wizard.spell_slots == slots_before, "short rest keeps spent slots")
	var scaled: Actor = world.get_node("Enemies/GoblinWarrior")
	expect(scaled.data.level == 4 and scaled.max_hp() == 14, "goblins scaled to level 4 (%d HP)" % scaled.max_hp())
	controller.debug_direction = Vector3.FORWARD
	frames = 0
	while GameState.is_exploring() and frames < 3000 and not _failed:
		await get_tree().physics_frame
		frames += 1
	controller.debug_direction = Vector3.ZERO
	expect(GameState.is_in_combat(), "wave 2 combat started")
	frames = 0
	while GameState.is_in_combat() and frames < 40000 and not _failed:
		await get_tree().physics_frame
		frames += 1
	if _failed:
		return
	print("[autoplay] wave 2 ended: %s, rounds=%d, fighter level %d, wizard level %d" % [
		GameState.state_name(), combat.initiative.round_number, player.data.level, world.get_node("Party/Wizard").data.level])
	if GameState.is_exploring():
		expect(player.data.level == 5 and player.data.attacks_per_action == 2, "wave 2 victory reaches level 5 with Extra Attack")
		expect(world.get_node("Party/Wizard").find_action(&"spell_fireball") != null, "wizard learned fireball")
		expect(not world.hud.long_rest_button.visible and world.hud.next_wave_button.visible, "still no long rest after wave 2")
	print("[autoplay] SUCCESS after %.1f s" % _time)
	get_tree().quit(0)


func _on_turn_started(actor: Actor) -> void:
	if not actor.is_player() or _first_party_turn_done:
		return
	_first_party_turn_done = true
	_play_first_turn_with_mouse.call_deferred(actor)


## First party turn: drive the real input pipeline (mouse raycast, action bar
## selection, hotkey) instead of calling the CombatManager directly. Afterwards
## the PartyAI takes over.
func _play_first_turn_with_mouse(actor: Actor) -> void:
	var input: PlayerCombatInput = world.combat_input
	var target := Targeting.nearest_hostile(actor, combat.participants)
	expect(target != null, "party member has a target")
	expect(combat.is_player_turn(), "it is the player's turn")
	print("[autoplay] first party turn: %s (%s), viewport %s" % [actor.display_name(), actor.data.class_name_text, get_viewport().get_visible_rect().size])
	world.hud.visible = false

	# a) Tap the ground a few meters to the side -> path locked; tap again -> move.
	var dest := actor.global_position + Vector3(2.5, 0.0, 0.0)
	var movement_before := actor.turn_state.movement_remaining
	_simulate_click(dest)
	await _wait_until_idle()
	expect(input.lock_kind == PlayerCombatInput.LockKind.MOVE and input.locked_path.size() >= 2, "ground tap locked a path")
	expect(actor.turn_state.movement_remaining == movement_before, "locking a move spends nothing")
	_simulate_click(dest)
	await _wait_until_idle()
	expect(actor.turn_state.movement_remaining < movement_before, "second tap moved (%.2f -> %.2f)" % [
		movement_before, actor.turn_state.movement_remaining])
	print("[autoplay] lock & confirm move ok: %.2f m left" % actor.turn_state.movement_remaining)

	# b) Select a targeted action from the bar, tap the enemy (lock), then confirm.
	var chosen: CombatAction = null
	for a in actor.actions:
		if a.target_kind == CombatAction.TargetKind.ENEMY and a.is_available(actor) and a.can_target(actor, target):
			chosen = a
			break
	if chosen != null:
		var actions_before := actor.turn_state.actions_remaining
		var bonus_before := actor.turn_state.bonus_actions_remaining
		input.use_action(chosen)
		expect(input.selected_action == chosen, "action bar selected %s" % chosen.display_name)
		_simulate_click(target.global_position + Vector3(0, 0.9, 0))
		await _wait_until_idle()
		expect(input.has_lock() and input.locked_actor == target, "enemy tap locked the target")
		expect(actor.turn_state.actions_remaining == actions_before and actor.turn_state.bonus_actions_remaining == bonus_before,
			"locking spends nothing")
		input.cancel()
		expect(not input.has_lock() and input.selected_action == null, "cancel drops lock and selection")
		input.use_action(chosen)
		_simulate_click(target.global_position + Vector3(0, 0.9, 0))
		await _wait_until_idle()
		input.confirm()
		await _wait_until_idle()
		expect(actor.turn_state.actions_remaining < actions_before or actor.turn_state.bonus_actions_remaining < bonus_before
			or actor.turn_state.attacks_remaining > 0, "confirm used %s" % chosen.display_name)
		expect(input.selected_action == null and not input.has_lock(), "selection and lock cleared after use")
		print("[autoplay] lock & confirm via click ok: %s" % chosen.display_name)
	else:
		print("[autoplay] no targeted action in range for %s, skipping click attack" % actor.display_name())

	world.hud.visible = true

	# c) End the turn with the Space hotkey, then hand the party to the AI.
	if combat.is_active and combat.active_actor == actor:
		_simulate_key("end_turn")
		for _i in 3:
			await get_tree().process_frame
		expect(combat.active_actor != actor or not combat.is_active, "Space ended the turn")
		print("[autoplay] hotkey end turn ok")
	world.set_auto_battle(true)


func _simulate_click(world_position: Vector3) -> void:
	var cam: Camera3D = world.camera_rig.camera
	var screen := cam.unproject_position(world_position)
	_simulate_mouse(screen, true)
	_simulate_mouse(screen, false)


func _simulate_mouse(screen: Vector2, pressed: bool) -> void:
	var ev := InputEventMouseButton.new()
	ev.button_index = MOUSE_BUTTON_LEFT
	ev.pressed = pressed
	ev.position = screen
	ev.global_position = screen
	get_viewport().push_input(ev, true)


func _simulate_mouse_motion(screen: Vector2) -> void:
	var ev := InputEventMouseMotion.new()
	ev.position = screen
	ev.global_position = screen
	ev.button_mask = MOUSE_BUTTON_MASK_LEFT
	get_viewport().push_input(ev, true)


func _simulate_key(action: String) -> void:
	var events := InputMap.action_get_events(action)
	expect(events.size() > 0, "action %s has a binding" % action)
	var press: InputEventKey = events[0].duplicate()
	press.pressed = true
	get_viewport().push_input(press, true)
	var release: InputEventKey = press.duplicate()
	release.pressed = false
	get_viewport().push_input(release, true)


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


static func _strip_bbcode(text: String) -> String:
	var regex := RegEx.new()
	regex.compile("\\[/?[a-z]+(=[^\\]]*)?\\]")
	return regex.sub(text, "", true)
