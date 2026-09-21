## Orchestrates an encounter: initiative, turn order, actions, movement, end.
##
## Player input (via [PlayerCombatInput]) and [EnemyAI] both go through
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
var enemy_ai: EnemyAI = EnemyAI.new()

var _action_in_progress: bool = false
var _ai_turn_in_progress: bool = false
var _ending_turn: bool = false


func start_combat(actors: Array[Actor]) -> void:
	if is_active:
		return
	is_active = true
	participants = []
	for a in actors:
		if a.is_alive() and not participants.has(a):
			participants.append(a)
			a.combat_flags.clear()
			a.stop_moving()
	GameState.set_state(GameState.State.COMBAT)
	EventBus.log("[color=yellow][b]⚔ Combat begins![/b][/color]")
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
	active_actor.turn_state.begin_turn(active_actor.speed_m())
	turn_started.emit(active_actor)
	state_updated.emit()
	EventBus.log("[b]%s[/b]'s turn." % active_actor.display_name())
	if not active_actor.is_player():
		_run_ai_turn(active_actor)


func _run_ai_turn(actor: Actor) -> void:
	_ai_turn_in_progress = true
	await enemy_ai.take_turn(actor, self)
	_ai_turn_in_progress = false
	if is_active and active_actor == actor:
		end_turn()


## True while the player may issue commands.
func is_player_turn() -> bool:
	return is_active and active_actor != null and active_actor.is_player() \
		and not _action_in_progress and not _ai_turn_in_progress


func is_busy() -> bool:
	return _action_in_progress


func end_turn() -> void:
	if not is_active or active_actor == null or _action_in_progress or _ending_turn:
		return
	_ending_turn = true
	var actor := active_actor
	turn_ended.emit(actor)
	_ending_turn = false
	_next_turn()


## Validates, pays the cost and executes. Returns false if refused.
func perform_action(actor: Actor, action: CombatAction, target: Actor) -> bool:
	if not is_active or actor != active_actor or _action_in_progress:
		return false
	if not action.is_available(actor):
		EventBus.log("[color=gray]%s: %s[/color]" % [action.display_name, action.unavailable_reason(actor)])
		return false
	if action.requires_target and not action.can_target(actor, target):
		if target != null:
			var distance := actor.distance_to(target)
			if target.is_alive() and actor.is_hostile_to(target) and distance > action.range_m:
				EventBus.log("[color=gray]%s: %s is out of range (%.1f m > %.1f m). Move closer first.[/color]" % [
					action.display_name, target.display_name(), distance, action.range_m])
			else:
				EventBus.log("[color=gray]%s: %s is not a valid target.[/color]" % [action.display_name, target.display_name()])
		return false
	_action_in_progress = true
	actor.turn_state.spend(action.cost)
	state_updated.emit()
	await action.execute(actor, target)
	_action_in_progress = false
	state_updated.emit()
	_check_end()
	return true


## Moves the active actor towards [param destination] as far as its remaining
## movement allows. Returns false if refused.
func move_actor(actor: Actor, destination: Vector3) -> bool:
	if not is_active or actor != active_actor or _action_in_progress:
		return false
	if actor.turn_state.movement_remaining <= 0.05:
		EventBus.log("[color=gray]%s has no movement left.[/color]" % actor.display_name())
		return false
	var path := CombatMovement.find_path(get_viewport().world_3d.navigation_map, actor.global_position, destination)
	var full_length := CombatMovement.path_length(path)
	if full_length < 0.05:
		return false
	_action_in_progress = true
	actor.move_along_path(path, actor.turn_state.movement_remaining)
	await actor.movement_finished
	actor.turn_state.spend_movement(actor.last_move_distance)
	if OS.is_stdout_verbose():
		print("[move] %s path=%.2f m budget=%.2f moved=%.2f end=%s" % [
			actor.display_name(), full_length, actor.turn_state.movement_remaining + actor.last_move_distance,
			actor.last_move_distance, actor.global_position])
	_action_in_progress = false
	state_updated.emit()
	return true


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
	var last := active_actor
	active_actor = null
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
