## Orchestrates an encounter: initiative, turn order, actions, movement,
## opportunity attacks, status ticks and the end of combat.
##
## Player input (via [PlayerCombatInput]) and the AI brains both go through
## [method perform_action] / [method move_actor] / [method end_turn], so the
## rules are enforced in exactly one place.
class_name CombatManager
extends Node

signal combat_started(participants: Array[Actor])
signal round_started(round_number: int)
signal turn_started(actor: Actor)
signal turn_ended(actor: Actor)
## Emitted whenever turn resources / positions changed (HUD refresh).
signal state_updated
signal combat_ended(player_won: bool)

var participants: Array[Actor] = []
var initiative: InitiativeTracker = InitiativeTracker.new()
var active_actor: Actor = null
var is_active: bool = false
var enemy_ai: CombatAI = EnemyAI.new()
## Optional brain for party members (auto-battle / tests). Null = human input.
var party_ai: CombatAI = null

var _action_in_progress: bool = false
var _ai_turn_in_progress: bool = false
var _ending_turn: bool = false
var _reaction_in_progress: bool = false
## Incremented per encounter so coroutines from an ended fight can't touch a new one.
var _generation: int = 0


func start_combat(actors: Array[Actor]) -> void:
	if is_active:
		return
	is_active = true
	_generation += 1
	_action_in_progress = false
	_ai_turn_in_progress = false
	_reaction_in_progress = false
	_ending_turn = false
	participants = []
	for a in actors:
		if a.is_alive() and not participants.has(a):
			participants.append(a)
	for a in participants:
		a.reset_for_combat()
		a.threat_sources = participants
		if not a.reach_left.is_connected(_on_reach_left):
			a.reach_left.connect(_on_reach_left)
	GameState.set_state(GameState.State.COMBAT)
	EventBus.log("[color=yellow][b]Combat begins![/b][/color]")
	initiative.roll_for(participants)
	for e in initiative.entries:
		EventBus.log("Initiative %s: %s" % [e.actor.display_name(), e.roll.describe()])
	combat_started.emit(participants)
	await GameState.wait(1.2)
	_next_turn()


func _next_turn() -> void:
	if not is_active or _check_end():
		return
	var previous_round := initiative.round_number
	active_actor = initiative.advance()
	if active_actor == null:
		_check_end()
		return
	if initiative.round_number != previous_round:
		round_started.emit(initiative.round_number)
		EventBus.log("[color=gray]— Round %d —[/color]" % initiative.round_number)
	var actor := active_actor
	actor.turn_state.begin_turn(actor.speed_m())
	_stand_up_if_prone(actor)
	turn_started.emit(actor)
	state_updated.emit()
	EventBus.log("[b]%s[/b]'s turn." % actor.display_name())
	if actor.is_incapacitated():
		actor.turn_state.clear()
		EventBus.log("[color=gray]%s is %s and cannot act.[/color]" % [actor.display_name(), actor.status_names_with_flag("incapacitated")])
		_run_skipped_turn(actor)
	elif not actor.is_player():
		_run_ai_turn(actor, enemy_ai)
	elif party_ai != null:
		_run_ai_turn(actor, party_ai)
	# else: wait for player input


func _stand_up_if_prone(actor: Actor) -> void:
	var prone := actor.get_status(&"prone")
	if prone != null:
		actor.remove_status(prone)
		actor.turn_state.spend_movement(actor.speed_m() * 0.5)
		EventBus.log("%s stands up (half movement)." % actor.display_name())


func _run_skipped_turn(actor: Actor) -> void:
	var gen := _generation
	_ai_turn_in_progress = true
	await GameState.wait(0.8)
	if gen != _generation:
		return
	_ai_turn_in_progress = false
	if is_active and active_actor == actor:
		end_turn()


func _run_ai_turn(actor: Actor, brain: CombatAI) -> void:
	var gen := _generation
	_ai_turn_in_progress = true
	await brain.take_turn(actor, self)
	if gen != _generation:
		return
	# Never end the turn while something (a move, a reaction) is still resolving.
	while (_action_in_progress or _reaction_in_progress) and gen == _generation:
		await get_tree().process_frame
	if gen != _generation:
		return
	_ai_turn_in_progress = false
	if is_active and active_actor == actor:
		end_turn()


## True while the player may issue commands.
func is_player_turn() -> bool:
	return is_active and active_actor != null and active_actor.is_player() \
		and party_ai == null and not _action_in_progress and not _ai_turn_in_progress


func is_busy() -> bool:
	return _action_in_progress or _reaction_in_progress


func end_turn() -> void:
	if not is_active or active_actor == null or _action_in_progress or _ai_turn_in_progress or _ending_turn:
		return
	_ending_turn = true
	var actor := active_actor
	actor.end_of_turn_tick()
	turn_ended.emit(actor)
	_ending_turn = false
	_next_turn()


## Validates, pays the cost and executes. Returns false if refused.
func perform_action(actor: Actor, action: CombatAction, target: Actor, point: Vector3 = Vector3.ZERO) -> bool:
	if not is_active or actor != active_actor or _action_in_progress:
		return false
	if not action.is_available(actor):
		EventBus.log("[color=gray]%s: %s[/color]" % [action.display_name, action.unavailable_reason(actor)])
		return false
	if action.targets_point():
		if not action.can_target_point(actor, point):
			EventBus.log("[color=gray]%s: that spot is out of range (%.1f m).[/color]" % [action.display_name, action.range_m])
			return false
	elif action.requires_target() and not action.can_target(actor, target):
		_explain_bad_target(actor, action, target)
		return false
	var gen := _generation
	_action_in_progress = true
	if not action.pay_cost(actor):
		_action_in_progress = false
		return false
	state_updated.emit()
	await action.execute(actor, target, point)
	if gen != _generation:
		return false
	_action_in_progress = false
	state_updated.emit()
	_check_end()
	return true


func _explain_bad_target(actor: Actor, action: CombatAction, target: Actor) -> void:
	if target == null:
		return
	var distance := actor.distance_to(target)
	if distance > action.range_m:
		EventBus.log("[color=gray]%s: %s is out of range (%.1f m > %.1f m). Move closer first.[/color]" % [
			action.display_name, target.display_name(), distance, action.range_m])
	else:
		EventBus.log("[color=gray]%s: %s is not a valid target.[/color]" % [action.display_name, target.display_name()])


## Moves the active actor towards [param destination] as far as its remaining
## movement allows. Opportunity attacks interrupt the walk. Returns false if refused.
func move_actor(actor: Actor, destination: Vector3) -> bool:
	if not is_active or actor != active_actor or _action_in_progress:
		return false
	if actor.is_incapacitated():
		return false
	if actor.turn_state.movement_remaining <= 0.05:
		EventBus.log("[color=gray]%s has no movement left.[/color]" % actor.display_name())
		return false
	var path := CombatMovement.find_path(get_viewport().world_3d.navigation_map, actor.global_position, destination)
	var full_length := CombatMovement.path_length(path)
	if full_length < 0.05:
		return false
	var gen := _generation
	_action_in_progress = true
	actor.move_along_path(path, actor.turn_state.movement_remaining)
	await actor.movement_finished
	if gen != _generation:
		return false
	actor.turn_state.spend_movement(actor.last_move_distance)
	if OS.is_stdout_verbose():
		print("[move] %s path=%.2f m budget=%.2f moved=%.2f end=%s" % [
			actor.display_name(), full_length, actor.turn_state.movement_remaining + actor.last_move_distance,
			actor.last_move_distance, actor.global_position])
	_action_in_progress = false
	state_updated.emit()
	_check_end()
	return true


## A moving actor left the reach of [param hostile]: resolve the opportunity attack.
func _on_reach_left(mover: Actor, hostile: Actor) -> void:
	if not is_active or not hostile.turn_state.reaction_available:
		return
	var weapon := hostile.melee_weapon()
	if weapon == null:
		return
	var gen := _generation
	mover.pause_moving()
	_reaction_in_progress = true
	hostile.turn_state.spend(CombatAction.Cost.REACTION)
	EventBus.log("[color=orange][b]Opportunity attack![/b] %s leaves %s's reach.[/color]" % [mover.display_name(), hostile.display_name()])
	EventBus.opportunity_attack.emit(hostile, mover)
	await AttackAction.perform_attack(hostile, mover, weapon, "swings at")
	if gen != _generation:
		mover.stop_moving()
		return
	_reaction_in_progress = false
	if mover.is_alive():
		mover.resume_moving()
	else:
		mover.stop_moving()


## Ends the encounter immediately without a winner (tests, debug).
func abort_combat() -> void:
	if is_active:
		_end_combat(true)


func _check_end() -> bool:
	if not is_active:
		return true
	var enemies_alive := 0
	var players_alive := 0
	for a in participants:
		if not a.is_alive():
			continue
		if a.is_player():
			players_alive += 1
		else:
			enemies_alive += 1
	if enemies_alive == 0:
		_end_combat(true)
		return true
	if players_alive == 0:
		_end_combat(false)
		return true
	return false


func _end_combat(victory: bool) -> void:
	is_active = false
	_generation += 1
	_action_in_progress = false
	_ai_turn_in_progress = false
	_reaction_in_progress = false
	var last := active_actor
	active_actor = null
	for a in participants:
		a.stop_moving()
		a.threat_sources = []
		if a.reach_left.is_connected(_on_reach_left):
			a.reach_left.disconnect(_on_reach_left)
		a.clear_all_statuses()
		a.break_concentration("combat ended", false)
	if last != null:
		turn_ended.emit(last)
	if victory:
		EventBus.log("[color=lime][b]Victory! All enemies are down.[/b][/color]")
		GameState.set_state(GameState.State.EXPLORATION)
	else:
		EventBus.log("[color=red][b]Defeat... the party has fallen.[/b][/color]")
		GameState.set_state(GameState.State.GAME_OVER)
	combat_ended.emit(victory)
	state_updated.emit()
